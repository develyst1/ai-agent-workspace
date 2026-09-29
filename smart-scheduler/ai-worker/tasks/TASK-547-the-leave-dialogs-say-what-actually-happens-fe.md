# TASK-547 — the leave dialogs say what actually happens (both sides) — FE, M

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-28) · **Size M.** Your held TASK-541 residual (2) **plus** the Undo body, in ONE pass — deliberately, so the two halves of the same promise are worded together.

## §0 Why both in one task
🔑 **The pre-leave dialog and the Undo dialog are the SAME promise from two sides**, and yesterday only one side was corrected. 📌 **This is the fourth dialog wrong because a screen could not see a server fact** — *both sides now can.*

## §1 The pre-leave dialog — your residual (2)
- **`plannedAtCreation` is now on the DTO, raw `true`/`false`, never undefined** (@Jason, TASK-542). **A leave declared at course creation appends the make-up and charges NO quota.**
- **Take it as the addendum you proposed**, the same way as residual (1): 🔑 **the branch is said only when we POSITIVELY know** — *your own rule from the addendum, and it governs here too.*

## §2 The Undo dialog — the preview
- **`GET /bookings/:id/undo-preview`** returns `{ ok, kind, leaveRefunded, makeupCancelled: { id, date } | null, expiry }` **or the act's refusal word for word** (TASK-546).
- 🔴 **Today's body promises, for EVERY leave, that the quota returns and the make-up is cancelled — false for creation-declared, over-quota, 1-hour and voucher leaves.** **Say what the preview says, nothing more.**
- 🔑 **A refusal must be shown BEFORE the click, in the server's own words** — 🚫 **do not re-word it and do not invent a friendlier version**; *a refusal we paraphrase is a refusal we can get wrong.*
- ⚠️ **AND THE CONSTRAINT THAT MATTERS MOST:** 🔑 **a preview says what WOULD happen, not what is guaranteed.** `UNDO_PLAN_WOULD_CHANGE` is decided **after** the act's writes, so **the act can still refuse a preview that said ok.** ⇒ **Word it so that a refusal after the click is NOT a contradiction**, and 🚫 **never disable or skip the failure path because the preview passed.** *The act is authoritative; the dialog is a forecast.*
- ⚠️ **A preview is a request: say what the dialog shows while it is in flight and if it FAILS.** 🚫 **A failed preview must not render as a confident body** — *silence read as "nothing will happen" is this defect again.*

## §3 Shape
- **One entry point, as TASK-541 established**, and 🔑 **the two dialogs must share vocabulary with each other and with the toast** — *the promise, its undo and its outcome must not read as three different features.*
- 📋 **Copy is a DRAFT in both languages, pinned BY THE SHAPE OF THE CLAIM** so the owner can rewrite every word without unpinning the promise.
- ✅ **This one IS a control**: the preview fires, the body reflects it, the refusal blocks. **A DOM test is warranted here** — *a sentence is not a control, but a button whose enablement depends on a fetch is.*

## Definition of Done
- [ ] Pre-leave: the creation-declared branch, **said only when positively known** · Undo: body from the preview only, **refusal in the server's words, unparaphrased** · 🔑 **a post-click refusal is not a contradiction; the failure path is never skipped** · in-flight and failed-preview states stated, 🚫 **no confident body on a failed preview** · one entry point, vocabulary shared with the toast · drafts pinned by claim shape, both languages · **DOM test for the clicked behaviour** · suite **count** · tsc · build ok · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM · report + `inbox/SA.md` + log.

---

# ✅ REPORT — @Fern (2026-09-28): both leave dialogs say what actually happens · **704 / 0** (was 682 · +22) · tsc 0 · build ok · **13 mutations bite** · ⚠️ **four existing pins changed meaning, each declared**

## §1 The pre-leave dialog — the held residual (2)
`plannedAtCreation` is now on the DTO, so the fourth case is answerable. The rule has **four outcomes from three facts**, each read once:
```
no course id                       ⇒ leaveMsgNoCourse       (nothing claimed)
course + server says LOCKED        ⇒ leaveMsgCourseLocked   (nothing spent, nothing added, still locked)
course + plannedAtCreation === true ⇒ leaveMsgCourseDeclared (NEW — a make-up IS added, NO quota is spent)
course, otherwise                  ⇒ leaveMsg               (today's words, byte-identical)
```
🔑 **LOCKED is checked first because the server checks it first:** `canTakeLeave` gates the whole branch, so an over-quota leave gets neither, **declared or not** — G3 mutates that order and bites. 🚫 **And `=== true` again:** an absent fact keeps today's words rather than inventing a free absence nobody told us about (**G2** is exactly that guess, and it bites in five places). 📌 The declared case is the **mirror** of the locked one — there the make-up is missing, here the quota spend is — *and one old sentence promised both in both.*

## §2 The Undo dialog — the forecast
- **`GET /bookings/:id/undo-preview`** is asked **only while the dialog is open** (G13: a preview per row would be hundreds of privileged reads on a month grid), `retry: false`, `gcTime: 0` — **a stale forecast is worse than none.**
- 🔴 **The three Undo bodies lost their claims.** They now state only what is **invariant**: what the act does to the row, and **who is told** (the leave still says the coach IS told; the other two say nobody is). The quota, the make-up and the expiry **moved into preview lines that appear only when the server states them** — because that body was shown for **every** leave and its promise is false on a creation-declared, over-quota, 1-hour or voucher leave.
- ⚠️ **The constraint you put first, worded into the copy:** the heading is *"If nothing changes before you confirm, this **would**:"* and every ready forecast carries *"The server checks again when you confirm, so it **may still refuse**."* ⇒ **a post-click refusal is a normal outcome, not a contradiction** — and there is a clicked test for exactly TASK-546 §4's case (preview clean ⇒ act refuses `UNDO_PLAN_WOULD_CHANGE` ⇒ the act's sentence appears, the dialog stays, **the forecast stays beside it**, because both were true). **G12** removes the caveat and bites in three places.
- 🔑 **Four states, four sets of words, and only ONE blocks the act:**
  | state | what it says | confirm |
  |---|---|---|
  | `loading` | *"Checking what this would change…"* | disabled (a 200 ms wait, not a verdict) |
  | `ready` | the lines the server stated, or **"Nothing else follows"** | enabled |
  | `refused` | **the server's own sentence, verbatim**, under a heading of ours | **blocked** |
  | `failed` | *"We could not check … You can still undo — the server decides"* | **enabled** |
  - 🚫 **A failed check never renders as a confident body** (G5 bites in nine places) — and **an error with a stale body is still `failed`**: having asked and not been answered is its own state.
  - ✅ **`failed` does NOT block:** a preview outage must not stop a legitimate undo, and the act is the authority either way (**G7** blocks it and bites). **`refused` does** — the act's own read half already said no, and pressing would only reproduce it (**G6** unblocks it and bites).
  - 🔑 **An empty forecast SAYS so.** An attendance undo or a 1-hour leave has nothing to list, and **an empty list is exactly the silence an admin reads as "everything you feared"** (G9 removes the sentence and bites).
- 🚫 **The refusal is never re-worded** — `previewRefused` is a *heading* above `refusalOf(preview.data)`, pinned to end in `:` and to contain no reason or code of its own (**G10** paraphrases it and bites).

## §3 One entry point, shared vocabulary
The pre-leave dialog, the forecast and the outcome toast use the **same words for the same things** (*leave quota*, *make-up session*), pinned across the three families — *the promise, its undo and its outcome must not read as three different features.*
📋 **All new copy is a DRAFT in both languages, pinned BY THE SHAPE OF THE CLAIM** (the "would" framing, the absences, the placeholders, the heading ending in `:`) — **so the owner can rewrite every word without unpinning the promise.**

## §4 ✅ The DOM test, because this IS a control
`undo-control.dom.test.tsx` now runs the **real react-query client** over a faked fetch boundary: **9 clicked tests** (4 existing + 5 new) covering the preview's request, its lines, the empty forecast, **the refusal blocking**, **the failed check still allowing**, and **the post-click refusal**. 🔑 *A sentence is not a control, but a button whose enablement depends on a request is exactly what a source pin cannot check.*

## §5 ⚠️ Declared: four existing pins changed meaning
1. **`not.toMatch(/disabled=\{!/)`** (TASK-531's *hidden, never disabled*) — **narrowed, not dropped.** That rule is about **the DOOR**, which is still absent-or-present. The **confirm** may now be blocked, but **only with the server's refusal rendered directly above it** — the one case where a disabled button does not invite *"why?"*, because 🔑 **the answer is already on screen in the server's words.** Pinned as *exactly one* `disabled`, what it reads, and that the refusal branch exists.
2. **`expect(u.leaveMsg).toMatch(/quota/)` and `/make-?up/`** — **inverted**, and the inversion is the fix: the body must now claim **neither**, and the two claims must exist as **preview keys** instead. Both halves pinned.
3. **`undo` copy count 12 → 21** (the nine forecast keys), counted in both languages as before.
4. **Thai `previewMakeupOff` is passive** — *"คาบชดเชยวันที่ {date} จะถูกยกเลิก"* — **so the owner's `ยกเลิก`-never rule stays untouched.** The make-up genuinely is cancelled (his own approved wording said so), so the fact stays and the word moves off the front of the sentence rather than the pin being loosened.

## §6 🔑 Break-and-watch — `BASELINE=` (md5), `try/finally`, CHECKSUM verified
```
BASELINE= leave-claim.ts    31e40f886fe4f7597c0ae2eef540ad4d
          undo-preview.ts   1f78bc8d1a2f88bfd80e6680a2332a36
          UndoControl.tsx   458a7e99092ae1ff89b4c5d247710a61
          dictionaries.ts   0f3f59e8803360e78291a1396e30db6d
          mappers.ts        506af0e4ce1cf0d20a90ce3363ec9fa4
```
| # | mutation | caught |
|---|---|---|
| G1 | a creation-declared leave is told it spends a quota (the residual un-fixed) | ✅ |
| G2 | an **absent** `plannedAtCreation` guessed as declared | ✅ (5 tests) |
| G3 | DECLARED checked **before** LOCKED | ✅ |
| G4 | the mapper stops carrying the fact | ✅ — **and TASK-543's drop pin caught it too** |
| G5 | a **failed** preview renders as a confident forecast | ✅ (9 tests) |
| G6 | a **refused** preview no longer blocks the confirm | ✅ |
| G7 | a **failed** preview blocks the act | ✅ |
| G8 | the quota line emitted whether or not the server said so | ✅ (3 tests) |
| G9 | an empty forecast says nothing at all | ✅ |
| G10 | the refusal **re-worded** instead of shown | ✅ |
| G11 | the leave body promises quota + make-up again | ✅ |
| G12 | the forecast caveat dropped ⇒ a post-click refusal becomes a contradiction | ✅ (3 tests) |
| G13 | the preview asked for **every row** | ✅ (3 tests) |

All thirteen bite; none slipped; **CHECKSUM: every file back to baseline.**

## §7 Verification and limits
**704 pass / 0 fail across 73 files in 4.3 s** (was 682 ⇒ **+22**: 13 preview rules/wire/copy, 4 pre-leave, 5 clicked) · **tsc 0** · **build ok** · 🚫 no BE change · no deploy request.
⚠️ **What I have NOT proven, and it is the same limit as TASK-532:** CSS, focus order, and **what the dialog looks like while the forecast loads on a phone** — the body reflows when the lines arrive, and whether that reflow is acceptable is Tanya's call, not mine.
📌 **And one honest note about the blocked confirm:** I chose to block on a refusal rather than let the click reproduce it. **If you would rather the admin always be able to press and be refused by the act**, it is one line (`canConfirm`) and one clicked test — I judged that showing the act's own sentence *before* the click, with the button visibly unavailable, is the same information without the false hope.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-28)
Verified: **704 pass / 0 fail** across 73 files · tsc 0 · build ok.

## ✅ §1 — the ordering is the correctness, not a detail
**Four outcomes from three facts, and LOCKED FIRST because the server checks it first.** 🔑 *A dialog that evaluates its cases in a different order from the server is a second implementation, however right each sentence is.* ✅ **`=== true` so an absent fact claims nothing** — the same rule that governed the addendum, applied to a new field on its first day.

## ✅ §2 — she separated the invariant from the forecast, which I did not ask for and should have
**The bodies state only what the act ALWAYS does; quota / make-up / expiry come from the preview and only when the server states them.** 🔑 **That is the shape that survives the next leave kind** — *a sentence built from what is always true cannot be made false by a case nobody has written yet.*
⚠️ **My constraint is in the COPY, not only in the code:** *"this WOULD…"* + *"the server checks again when you confirm, so it may still refuse"* ⇒ **a post-click refusal is not a contradiction** — ✅ **and she proved it by clicking TASK-546 §4's exact case: clean preview ⇒ act refuses ⇒ both sentences on screen together, both true.** *That is the gap ruled open in 546, shown to be survivable rather than argued to be.*

## 🔑 Four states, one blocker — and `failed` is the one that matters
✅ **`failed` says we could not check AND STILL ALLOWS THE ACT.** 🔑 **A preview outage must not block a legitimate Undo** — *the forecast is a convenience; refusing the act because the convenience broke would be a new defect built by this fix.* ✅ **`ready` with nothing to add says "Nothing else follows"** — *an empty list is the silence this whole defect is made of.* 🚫 A failed check never renders a confident body, **and an error with a stale body is still `failed`.**

## ⚖️ Her one open question: **your judgement, taken as-is**
**Block the confirm on `refused`, with the server's sentence rendered above it** — rather than allowing the press and letting the act refuse.
✅ **Ruled: yours.** **TASK-531's rule was *hidden, never disabled* because a dead control with no reason is a dead end** — 🔑 **here the reason is already on screen, in the server's own words, before the click.** ⇒ **Narrowing that pin to THE DOOR is the right narrowing, and declaring it is why I can accept it.** *The same information without the false hope.*
✅ **Three other pins changed meaning, each declared** — the two leave-body claim pins **inverted** (absence in the body, presence in the preview keys), `undo` copy 12 → 21, and 📌 **Thai `previewMakeupOff` made PASSIVE so the `ยกเลิก`-never rule stays untouched rather than loosened** — *bending the copy around a rule beats bending the rule around the copy.*
⚠️ **Not proven, correctly named: CSS/focus and the reflow while the forecast loads on a phone** ⇒ **Tanya's.**
