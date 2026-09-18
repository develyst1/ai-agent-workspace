# TASK-346 — the `§17g` guard: keep the check, drop the send (`REQ-079 §17g`)

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-12)
▶️ **OWNER-approved, via @Porter. ONE LINE. FIRST — before anything on `REQ-088`.** ⏱️ **Ships in the NEXT
deploy with `Remaining`/date; not held for `REQ-088`.** 🚫 No migration, no FE change, no copy change.
🔑 **This is the only task that touches the OWNER'S commit `baa6015`. Read what is there, not what the last
task left.**

---

## §1 What the owner did, and what it cost — verified by me on his tree
**`baa6015` commented out both triggers of the unsolicited welcome:** the `follow` dispatch (**`handleFollow`
is now dead code**) and the unlinked-postback fallback at `line-webhook.service.ts:1533`:
```ts
// if (linked !== "customer") return send(replyToken, [textReply(tb("welcome"), lang)]);
```
✅ **The ruling is met — nothing sends `welcome` unsolicited, and the `สมัคร` keyword still works.**
🔴 **But that line did TWO jobs.** It was also the GUARD keeping unlinked users out of the customer postback
switch. ⇒ **an unregistered parent tapping `เช็คอิน` / `นักเรียน` now falls through to `doCheckin` /
`doChildren` and is told `empty_checkin` / `children_none` — "you have no classes / no children" — instead of
being told to register.** 📌 *Verified per landing.* 🚫 **Not a crash. A wrong reply, on the deployed tree.**
🔴 **And the suite is RED on his tree: 2053/1** — `line-bilingual.test.ts:192`'s source pin asserts
`textReply(tb("welcome"), lang)` is present; **its claim is vacuous now, because `welcome` is never sent.**

## §2 ✅ The fix — @Porter's words, and they are exact
> ***Keep `if (linked !== "customer") return …` — drop only the `welcome` send.***
✅ **Unregistered users are told to register again; nothing is sent unsolicited.**
❓ **What DOES the guard reply with, if not `welcome`?** 🔑 **`§17g` kept `§17c` screen 1's TEXT — *"it is still
the right reply when a parent types something the bot cannot place"* — and a tap from an unregistered person
is exactly that case.** ⇒ 📌 **My reading: the guard sends the register prompt (screen 1's text) in REPLY to
the tap — that is SOLICITED, because they tapped.** ⚠️ **Say if you read `§17g` differently; the ruling was
"never UNSOLICITED", not "never".**
🚫 **Do NOT restore the `follow` dispatch.** ✅ **`handleFollow` being dead is CORRECT under `§17g`** — 📌 *say
whether to leave it dead-with-a-comment or delete it; I would leave it, with the reason, because the ruling
may move again.*

## §3 The vacuous pin
✅ **Rewrite `line-bilingual.test.ts:192`'s `welcome` entry, do not delete it.** 🔑 **The CLAIM — *the
registration bodies are bilingual* — is still true of the reply the guard now sends; point the pin at THAT.**
📌 **And say in the test that `welcome` is no longer sent and why (`§17g`, `baa6015`).**

## §4 Log it against his commit
📌 **@Porter's ask: the record must show a TASK behind the diff.** ✅ **In your report and in the code comment
at `:1533`: what `baa6015` changed, what it unintentionally removed, and what this task restored.**

## §5 What must not change
- 🚫 **The `สมัคร` / `register` keyword path** · `§17c` screen 1's TEXT · the rich menu · the teacher branch
  above the guard · the suspended-household check below it.
- 🚫 **Do not "fix" the owner's change back.** The unsolicited push STAYS gone.
- 🚫 No migration · no FE change · no new key.

## Definition of Done
- [ ] `bun test` all pass — **GREEN on the owner's tree**, state the count · typecheck clean · 🚫 no migration
      (**35 = 35**)
- [ ] 🔑 **An UNLINKED user's postback is refused with the register prompt** — asserted, ⚠️ *and asserted that
      it no longer reaches `doCheckin` / `doChildren`*
- [ ] 🔑 **Nothing is sent on `follow`** — asserted as an absence, *the `§17g` half*
- [ ] **The keyword still works** — asserted
- [ ] **The vacuous pin REWRITTEN**, with the reason
- [ ] **`§2`'s question answered** — what the guard replies, and whether `handleFollow` stays dead or goes
- [ ] 📌 **The diff against `baa6015` described in the report and in the code**
- [ ] 🔑 **Break it and watch** — restore in a `finally`, byte-identity by CHECKSUM

## Question — ⚠️ **answer goes on the OWNER'S LIST, not into a task**
🔑 **A line that does two jobs cannot be commented out to remove one of them — and the person who did it could
not have known it did two, because nothing said so.**
⇒ ❓ **Are there other lines in the webhook that a reasonable person would comment out to remove ONE
behaviour, and lose two?** 📌 *The shape: a `return` that both REPLIES and GATES.* 🚫 **Name them. Build
nothing.**

---

# 📤 REPORT — @Jason → @Sober (2026-09-12)

✅ **DONE (code).** **2061 pass / 0 fail**, **167 files** (+1) — 🔑 **GREEN on the owner's tree, from RED
2053/1.** `tsc --noEmit` clean · 🚫 no migration (**35 = 35**) · no FE change, no new key, no copy change.
**One source file, one pin rewritten, one new test file.**

## §1 📌 THE DIFF AGAINST `baa6015` — in the report, as asked, and in the code at the guard
| `baa6015` did | what it cost | this task |
|---|---|---|
| commented out the `follow` dispatch | nothing — `§17g` is met | 🚫 **left exactly as he made it** |
| commented out the postback guard `:1533` | 🔴 **the GATE went with the reply** — an unlinked tap fell through to `doCheckin` / `doChildren` | ✅ **the line is back, both jobs**, with a comment naming his commit, both jobs, and the restore |
| — | 🔴 suite RED: a bilingual pin went vacuous | ✅ pin REWRITTEN, not deleted (`§3`) |
✅ **Net source change: ONE line uncommented.** Everything else is comments, one pin, one test file.

## §2 ❓ THE ONE DECISION — what the guard replies, and `handleFollow`'s fate
🔑 **The guard replies with `welcome` — which IS `§17c` screen 1's text**
(`กรุณาพิมพ์ "สมัคร" เพื่อลงทะเบียนค่ะ / Please type "register" to start.`). ✅ **I read `§17g` as you do**:
*"screen 1's TEXT is unchanged — it remains the correct reply when a parent DOES need the hint."* A tap the
bot cannot serve is that case, and **a reply to a tap is SOLICITED.** The ruling was *never unsolicited*.
⚠️ **I want to name the alternative reading so you can see I considered it:** @Porter's sentence — *"drop only
the `welcome` send"* — read literally, gives a SILENT gate: `if (linked !== "customer") return;`. **I built
that as mutation B and rejected it, for two reasons:** (a) his own next sentence is *"unregistered users are
told to register again"*, which a silent gate does not do; (b) **a silent refusal of a tap is AC-16's stray-
text silencing applied to a person who just PRESSED A BUTTON** — that is not stray, and an empty reply to a
button reads as a broken bot. 📌 *If @Porter meant the silent gate, it is a one-token change and I will make
it — but say so, because the intent as written points the other way.*
✅ **`handleFollow` stays DEAD, with the reason written above it** — *"DEAD BY RULING, KEPT BY DECISION"* —
because the ruling is the customer's and may move again: **their own OA greeting is what made two voices; if
they ever drop theirs, this is the line that comes back, not a reconstruction.** 🚫 *"Do NOT re-dispatch it
without a task"* is in the comment and asserted.

## §3 ✅ The vacuous pin — rewritten, and the vacuity named
`line-bilingual.test.ts`'s `welcome` entries now say which of the two call sites is LIVE (the guard) and which
is DEAD (`handleFollow`), **and that the pin went vacuous on his tree** — *the body was bilingual and nobody was
sent it.* 🔑 **The claim — *the registration bodies are bilingual* — is unchanged and now points at the reply
a parent actually receives.**

## §4 🔑 Asserted — ONE FILE, ONE ASSERTION PER JOB, because *"nothing said so"* is the whole defect
`req079-17g-guard.test.ts`:
- **JOB ONE (GATE):** the guard is present in CODE-STRIPPED source *(so his commented line does not satisfy
  it — the assertion that was missing when he edited)*, sits **between** the teacher branch and the switch,
  **above** the suspended check; and **no customer landing (`doCheckin`, `doCheckinBooking`, `doChildren`,
  `doLeave`, `doMyCourse`) appears BEFORE it** — asserted as a region **with a positive over the same region**
  (TASK-342's rule).
- **JOB TWO (REPLY):** the guard sends `tb("welcome")`, and `welcome` carries both `สมัคร` and `register`.
- **The `§17g` half:** `handleLineWebhookEvents` dispatches no `follow` — over CODE-STRIPPED source, so it is
  about what RUNS, not what the file still contains. `handleFollow` present, dead, annotated.
- **The keyword:** `inList(CMD_REGISTER, lower)` is checked FIRST in `handleMessage`, before the session is
  even read; `CMD_REGISTER` holds `สมัคร` and `register`.
- **The record:** the comment at the guard names `baa6015`, *"did TWO jobs"*, *"RESTORED. Both jobs."*

## §5 🔑 Mutation — three, `finally` restore, checksum
| | |
|---|---|
| **A — the OWNER'S EDIT, re-applied** *(guard commented out again)* | ✅ **3 fail** — both JOB ONE tests and the bilingual pin |
| **B — the guard GATES but stays SILENT** *(@Porter read literally)* | ✅ **4 fail** — the reply is asserted, not just the gate |
| **C — `follow` dispatched again** | ✅ **1 fail** — the absence assertion |
✅ **All restores byte-identical by SHA-256.** 📌 **Mutation A is the point of the whole task: the exact edit
that shipped on his tree now fails three tests instead of one vacuous pin going quiet.**

## §6 🚫 What did not change
The `สมัคร` keyword path · screen 1's text · the rich menu · the teacher branch above the guard · the
suspended-household check below it · **the owner's `follow` removal**. No migration, no FE, no key.

## §7 ❓ YOUR QUESTION — *other lines a reasonable person would comment out to remove ONE behaviour and lose TWO?*
🔑 **The shape is `if (cond) return reply(…)` where the code BELOW assumes `!cond`. There are 17 such lines in
the webhook. I sorted them by what commenting one out would DO, because that is what decides whether a person
would do it:**

**🔴 1. THE ONE THAT MATTERS — the SUSPENDED-HOUSEHOLD check (TASK-048), and it is TWO lines, not one.**
`handleMessage:1332` and the block in `handlePostback` just below the guard I restored.
⚠️ **A reasonable person told *"stop sending the suspended notice"* comments one out — and a suspended
household can use the bot again.** *Same shape, same silence, same wrong reply instead of a crash.*
🔴 **AND ITS PIN WOULD NOT CATCH IT.** `line-menus-flows.test.ts:289` — named *"a suspended household is still
refused every postback"* — is `expect(SVC).toContain("isSuspendedLineParent(lineUserId)")` over the **RAW,
UN-STRIPPED, WHOLE FILE.** ⇒ **comment out either site, or BOTH, and it stays green**, because the string is
still in a comment and there are two of them. 📌 ***It is the `welcome` pin's vacuity, already in place,
waiting for the same edit.*** 🚫 **Not fixed — named.** *Size: one test, ten lines, using code-stripped
regions per handler.*

**⚪ 2. The `!x` guards that fail LOUDLY** — `:559 !name`, `:904 !b`, `:975 !b`, `:1207/:1219 !b`,
`:1150 !token`. Commenting one out loses the gate too, **but the code below dereferences the thing**, so the
second job's loss is a crash, not a wrong reply. *Two jobs, but the second announces itself.* Not on the list.

**🟡 3. The empty-list guards** — `:877/:886 !today.length`, `:959/:962 !eligible.length`, `:1013 !kids.length`,
`:1034`. Below them the code builds a menu from the list — **an empty list renders an EMPTY MENU, silently.**
Two jobs, silent failure — **but nobody would comment these out to remove the "no items" reply**, because that
reply is the feature. *Shape matches; motive does not.* Named for completeness, not urgency.

**⚪ 4. The `เมนู` keyword replies** (`:1346`, `:1351`) — the fallthrough is `return;`. Nothing lost but the menu.

📌 **So the honest count is ONE real instance, in two places, with a pin that would not catch it** — and it is
the same feature family as today's: **a person-level refusal whose reply and gate are one `return`.**
🔑 ***The pattern under both: a refusal that is also a message. When the message is the thing someone wants to
change, the refusal is what they will accidentally remove.***
