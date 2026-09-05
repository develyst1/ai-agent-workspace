# TASK-248 — DEF-9: `เข้าใช้ระบบ` asks for a phone number and nothing is listening
**Status:** ✅ **DONE — code** (Sober 09-05, reviewed) — tsc 0 · bun test **1316/0** · no migration · nothing sent to LINE.

**Repo:** `smart-scheduler-back` (path in `machine.local.md`) · **Assignee:** @Jason · **From:** @Sober (2026-09-05)
**Reported by the owner on a real phone, 13:50–13:51**, via @Porter. **Severity: HIGH — this is the first thing a
new parent does.** Menu A is the only entry REQ-079 designs for, and its first button dead-ends.

> Owner: *"เมื่อกดปุ่มเข้าสู่ระบบที่ richmenu แล้ว มันบอกให้พิมพ์เบอร์ แต่พอพิมพ์แล้วไม่ทำงานต่อ"*
> Tap `เข้าใช้ระบบ` → *"กรุณาพิมพ์เบอร์โทรที่ลงทะเบียนไว้ค่ะ…"* → types `0900000092` → **silence** → types
> `สมัคร` → the role prompt appears and the flow completes normally.

---

## §1 Diagnosis — the handler sends a sentence and sets no state

`src/services/line-webhook.service.ts:1171`, the whole of it:

```ts
if (action === "enter") return send(replyToken, [textReply(t("enter_ask_admin", lang), lang)]);
```

**It replies and returns.** No `setStep`, no `pendingRole`. So the phone the parent then types arrives with **no
session step**, falls through the flow branches, and is handled as idle chat — **silence.** `สมัคร` works because
it *does* set a step (`CHOOSE_ROLE`, `:979`).

📌 **The copy is not wrong — the handler is.** `enter_ask_admin` says *"type your registered phone number; if you
have never registered, contact an admin"*, which is exactly REQ-079's design after §15 deleted Flow 2 and
**SPEC-071 amendment #2 made the entry the PHONE ALONE.** The message describes the intended behaviour; nothing
implements it. ⚠️ The i18n key is *named* `enter_ask_admin`, which reads as *"tell them to ask an admin"* — that
name is probably why the step was never wired. **Rename it `enter_ask_phone`** so the key stops arguing with its
own text.

---

## §2 The fix — one line, and **do not build a second phone flow**

`AWAIT_CODE` with `pendingRole = "customer"` **already is** "type your phone and get linked":
`code_customer` = *"กรุณาพิมพ์เบอร์โทรของผู้ปกครอง"*, and `:1095` runs `verifyAndLink`, strikes on failure
(AC-18), links the account, seeds the language and links the known menu. **All of it exists.**

⇒ **`action === "enter"` must set that step before replying:**

```ts
if (action === "enter") {
  await setStep(lineUserId, "AWAIT_CODE", "customer");
  return send(replyToken, [textReply(t("enter_ask_phone", lang), lang)]);
}
```

🚫 **Do not add a new step, a new prompt, or a parallel verification path.** A second way to type a phone is a
second place for the rules to drift — the same argument that keeps `isSessionExpired` ignorant of the mute.

---

## §3 The decision is mine, not yours — `เข้าใช้ระบบ` presumes **customer**

Menu A is shown to **any** follower, so a **teacher** could tap it. Hard-coding `"customer"` means a teacher who
taps it and types their nickname fails `verifyAndLink("customer", …)`.

✅ **That is acceptable, and it is why:** the failure is not a dead end — it takes the **AC-18 two-strike path and
hands over to a human**, which is precisely what the button's own copy promises (*"if you have never registered,
contact an admin"*). **Teachers are a handful of known staff who are told `สมัคร`; parents are the many, and the
menu exists for them.** Amendment #2 says the entry is the phone alone, and asking a stranger "are you a parent or
a teacher?" as the very first question is the friction REQ-079 removed.
🚫 **So: no role prompt behind this button.** If the owner ever wants teachers entering by menu, that is a
requirement change, not a fix.

---

## §4 The reason the tests were green — read this before writing the new one

`src/services/line-menus-flows.test.ts:270–272`:

```
expect(SVC).toContain('t("enter_ask_admin", lang)');
expect(t("enter_ask_admin", "TH")).toContain("เบอร์โทร");
expect(t("enter_ask_admin", "TH")).toContain("แอดมิน");
```

🔴 **Three assertions about the WORDS, none about the BEHAVIOUR.** The suite proved the bot says *"type your phone
number"* and never asked whether anything receives it. **The button was dead and the tests were green — and they
would stay green through this fix without ever noticing it.**

📌 **This is the comment-vs-code trap wearing a new costume.** On 09-03 it was counting an identifier in prose;
here it is asserting the copy instead of the flow. **Both times the test matched the author's own intention rather
than the machine's behaviour.** The rule this repo keeps re-learning: *a source assertion must test what the code
DOES, and when it cannot, it must not be mistaken for the test that does.*

⇒ **The new test asserts the state transition:** after `action=enter`, the session's step is `AWAIT_CODE` and
`pendingRole` is `customer` — **and then the typed phone reaches `verifyAndLink`.** Keep the copy assertions
(rename them), but they are no longer the coverage.

---

## §5 Two things already correct — do not disturb them

1. ⚠️ **`unmute()` runs at `:1163`, BEFORE this handler at `:1171`.** Since TASK-246 that call **clears the flow**,
   so setting the step **after** it is the correct order — **the exact trap you fixed for `สมัคร`, already avoided
   here by position.** If you move either line, move them together.
2. ✅ `action === "enter"` is dispatched **before** `detectLinkedRole` (asserted at `line-menus-flows.test.ts:41`),
   which is right: the unknown menu must work for someone the system does not recognise.

## Implementation Notes — Jason, 2026-09-05

Repo **`smart-scheduler-back`** (path in `machine.local.md`), HEAD **`864ef9c`**. `src/services/line-webhook.service.ts`
· `src/lib/line-i18n.ts` · **new** `src/services/line-enter-button.test.ts`.

**The fix is your three lines, unchanged**: `setStep(lineUserId, "AWAIT_CODE", "customer")` then the reply. No new
step, no second phone path — `AWAIT_CODE` + customer already is the flow, and the `session.step === "AWAIT_CODE"`
branch is asserted to be the **only** one that answers a typed phone. `enter_ask_admin` → **`enter_ask_phone`**,
TH and EN text untouched.

**§4 — the test, and I took your rule literally.** The file is split into **BEHAVIOUR** and **WIRING**, labelled
in the source, so nobody can later mistake the second for the first:
- **BEHAVIOUR** runs the real decision function. `decideMessageRoute("AWAIT_CODE", …)` → `"linking"`, and the
  contrast that *is* the defect: `decideMessageRoute(undefined, null)` → `"silence"` — **the owner's typed phone,
  exactly.** Plus `shouldHandOver(2)` for the wrong-phone path and the TTL for an abandoned tap.
- **WIRING** reads the source for the two ends: the button sets the step *before* replying, and the `AWAIT_CODE`
  branch runs `verifyAndLink` and strikes on `!res.ok`.
- ✅ **I proved the new file catches the original bug**: reverted the handler to the one-liner → *"the button
  SETS the step before it replies"* **fails**; restored → 11 pass. The three copy assertions in
  `line-menus-flows.test.ts` stay, renamed, with a comment saying they are **not** the coverage.

## Answer — what `เข้าใช้ระบบ` does for an ALREADY-LINKED chat (traced, not assumed, and **no guard added**)

It is dispatched before `detectLinkedRole`, so a linked parent can reach it. Following it through:

1. `unmute()` (no-op unless muted) → `setStep(AWAIT_CODE, customer)` → the phone prompt.
2. They type **their own** phone → `decideMessageRoute("AWAIT_CODE", "customer")` = `"linking"` (TASK-046: an
   in-progress conversation beats already-linked routing) → `verifyAndLink("customer", …)` →
   `existing.lineUserId === lineUserId`, so the first refusal does not fire; `bindFamilyLine` is idempotent for
   the family it is already bound to ⇒ it **re-links to itself**, returns the children, and ends at the
   add-student prompt. **Confusing but harmless — and it is what `สมัคร` already does for a linked parent.**
3. They type **someone else's** phone → `verify_parent_other` (that number belongs to another chat) or
   `verify_parent_other_family` (this account belongs to another family) ⇒ refusal + strike ⇒ AC-18 handover.
   🔑 **No silent re-pointing** — the guarantee TASK-232 built holds on this path too.

🔴 **The one real cost, which I am naming rather than guarding:** while that `AWAIT_CODE` session is live, a
linked parent's next ordinary message is read as a phone attempt. So `เช็คอิน` typed by someone who tapped the
button by mistake **strikes**, and twice hands them to a human. It self-heals: the 30-minute TTL, or the handover
itself. ⚠️ **`ยกเลิก` does NOT rescue them** — the exit is honoured in the add-student wizard and in a **muted**
chat, but the unmuted linking branch has no exit, so `ยกเลิก` at `AWAIT_CODE` is just a failed phone. That gap is
pre-existing (`สมัคร` has it identically) and out of this task's scope — **your call whether it is worth a
follow-up**; it is one branch and the vocabulary already exists.

## Question I want answered, not assumed
**What should `เข้าใช้ระบบ` do for a chat that is ALREADY linked?** It is dispatched before the role check, so a
linked user who still has menu A (or an old menu) can reach it and would be put into `AWAIT_CODE`. Asking a linked
parent for their phone is confusing but harmless; re-linking an already-linked number has its own message
(`verify_parent_other`). **Tell me what actually happens — do not add a guard without saying why.**

## Definition of Done
- [x] `tsc --noEmit` → **0** · `bun test` → **1306 pass / 0 fail** at this task (1316 after TASK-249)
- [x] `action=enter` sets `AWAIT_CODE` + `pendingRole = "customer"`, then replies
- [x] A test asserts the **state transition** (the real `decideMessageRoute`, including the `silence` contrast
      that is the defect) and one asserts the typed phone reaches `verifyAndLink` — **and I proved the file
      fails on the old handler**
- [x] `enter_ask_admin` → `enter_ask_phone`, all references updated (TH + EN text unchanged); asserted the old
      key is gone from the service
- [x] The AC-18 strike path still applies to a wrong phone here — asserted (`if (!res.ok) return strikeOrPrompt(`
      in the branch this button now feeds, plus `shouldHandOver(2)`)
- [x] 🚫 **No migration** (32 = 32) · no SQL · **nothing published or sent** — no LINE API call at all


## Review — Sober, 2026-09-05: ✅ **PASS. TASK-248 is DONE (code).** DEF-9 is closed pending @Tanya on a phone.

**Reproduced:** `tsc --noEmit` → **0** · `bun test` → **1316 pass / 0 fail** (110 files) · the handler now
`setStep(lineUserId, "AWAIT_CODE", "customer")` **then** replies (`line-webhook.service.ts:1185`) ·
`enter_ask_admin` → `enter_ask_phone` everywhere, TH/EN text untouched.

### ✅ You took §4 literally, and the file is better for it

The split is labelled **in the source** — *"BEHAVIOUR ones run the real decision function; WIRING ones read the
source and are honestly only that."* 📌 **That second clause is the whole lesson.** The old tests were not bad
because they read source; they were bad because **nothing said they were not the coverage.** A wiring assertion
that admits what it is cannot be mistaken for a behavioural one by the next reader — which is the failure mode
that let a dead button ship green.

**And the behavioural assertion IS the defect, stated as a value:** `decideMessageRoute(undefined, null)` →
`"silence"`. **That single line is the owner's typed phone number.** The bug is now a number in a test rather
than a story in a log. ✅ `decideMessageRoute(undefined, "customer")` → `"linked"` beside it is the better
half — it shows the miss is *"no step"*, not *"not recognised"*.

✅ You proved the file catches the original bug by reverting the handler and watching the right test fail. Third
time this week that a guard was demonstrated rather than asserted.

### ✅ The already-linked answer — traced, and **no guard added**, which is the right outcome

You followed it to the end: `AWAIT_CODE` + customer → `decideMessageRoute` = `"linking"` (an in-progress
conversation beats already-linked routing, TASK-046) → `verifyAndLink` finds `existing.lineUserId === lineUserId`
so the refusal does not fire → `bindFamilyLine` is idempotent. **A linked parent who taps it re-lands where they
already were.** ⇒ **Adding a guard would have been code defending against a harmless path**, and every guard is a
branch someone must later understand. **Not adding it, and saying why, is the answer I wanted.**

### 📌 One thing I will carry rather than change
`enter_ask_admin` was a key whose **name** argued with its own text, and it is my current best guess at why the
step was never wired: the author read the name, saw *"ask an admin"*, and wrote a reply. **A misleading name is a
defect with a long fuse.** Renaming it was worth more than the one line beside it.

**Status → DONE (code).** 🧪 @Tanya: the owner's exact sequence on a phone — tap `เข้าใช้ระบบ` → type a registered
number → **the account links and the menu flips to B.** And the wrong-phone path: two bad answers must reach a
human, not loop.
