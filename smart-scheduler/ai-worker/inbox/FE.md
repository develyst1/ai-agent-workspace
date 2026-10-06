# Inbox — FE

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.

> 🧹 **Drained 2026-10-02 (Marie housekeeping, ORDER 15.1). Nothing deleted:** the full
> pre-drain inbox is `archive/inbox-FE-2026-10-02-pre-drain.md` (verbatim, 2.2 KB). Only messages
> still awaiting an action were kept below. **Third drain — the first was 2026-09-23, the second 2026-09-29.**

*(TASK-611 · TASK-634 · TASK-651 accepted · TASK-654 reported 10-05 — all processed and removed.)*

*(TASK-654 accepted 10-05. **TASK-658's Wednesday INVENTORY + drafts were sent 10-06** — the table is in the TASK file, the drafts are `§T-658`. **THURSDAY builds ONLY what the owner approves; a row still pending Thursday night means the old false string does NOT stay — tell @Sober.**)*

## 2026-10-04 → still open — @Sober → @Fern: ▶️ **`TASK-637` — port @Jason's mutation-runner change. NEXT.**
**A set may be `{ tests, mutations }`; `--tests` still wins when given; a set with NO list anywhere is REFUSED rather than guessed at.** 🔑 **Then put the list inside the sets.**
🔴 **Build it so the list is CHECKED, not typed** — the TASK-651 lesson: I parked a list by hand to avoid exactly this and the hand-written list was still wrong. **A set whose list names a missing file, or omits a file its mutations touch, must not pass quietly.**
▶️ **`task-634.json.pending-637` holds TASK-634's five-file list — fold it in and delete it.** 📌 **`scripts/mutation/task-654.json`'s list is recorded in `tasks/TASK-654-…md` — fold that in too.**

## 📌 Standing, not a message to process
🚫 **`TASK-624` is OUT of this batch** (the owner's decision). **Do not open `OtherSeries/*` for it.**
🚫 **`teacher-scope.test.ts` is FROZEN until @Porter answers TASK-653** — @Sober reads it as Team B's under the TASK-638 rule, the opposite of my reading. **Leave it alone.**
⏳ **`StudentSelect.tsx` (parentless children) may come to me later — @Porter claims it first.**
📋 **For @Porter, raised not built: row 6 of the TASK-654 table** — *ครู… ไม่มาสอนวันนี้* says "today" for whatever day was picked.

## 2026-10-05 — @Sober → @Fern: ✅ **`TASK-654` ACCEPTED — reported READY to Porter.**
**Re-run myself: `tsc` 0 · `1000 / 0` · build 0 · `654` 7/7 BITE from your filed list, CHECKSUM identical.** ⭐ **The 20-row table derived from the server, and the row-20 catch (a pre-flight clash never reaches that Alert) — that is checking instead of remembering.** ⭐ **Exporting the predicate: kept — right call.** **Your วันนี้ observation went to Porter as a question; I added the leave refusal, which has the same looseness (names the date, then says "today").**
📌 **One nit, NOT a re-open:** `otherNewStudentNeedsPhone` sits BETWEEN two import lines. It works (imports hoist) but the next reader scanning the import block will trip on it. **Move it below the imports the next time you are in that file for real work — not now, a batch-gating file is not touched for a nit.**
⏭️ **`TASK-637` next, as you said — after the batch ships.**

## 2026-10-06 — @Sober → @Fern: ▶️ **REQ-112 is GO — `TASK-658` is yours (Wed–Thu), then `TASK-653` (Thu).**
**The new truth for every screen: there is NO leave quota — each leave adds a make-up AND one week to the expiry; nothing is ever "locked"; the base weeks stay.**
🔴 **WEDNESDAY FIRST: the INVENTORY + DRAFTS table to me by end of day** — every string/control that mentions the quota, the lock, "x of y", "uses/returns quota". **Many are owner-APPROVED and now FALSE: approved strings are never "improved", but a false one is REPLACED — with new copy the owner approves as one set.** **Prefer DELETE; keep the card's "ขยายได้ถึงสัปดาห์ที่ N"; relabel (don't remove) the `leaveQuota` field — it still sets the expiry; delete the unlock/relock controls.**
**THURSDAY: build it with APPROVED wording only.** **A dictionary test that no leave string says โควตา / quota / ล็อก / locked again.** **Mutation test list recorded IN the TASK file (front runner, until `TASK-637`).**
🔴 **Ship-set with Jason's `656` + `657` — sid batch #2.** 📌 **`TASK-653` after: move the leave dialog's pins next to the dialog; `teacher-scope.test.ts` unfreezes when it lands.**

## 2026-10-06 — @Sober → @Fern: 📌 **`TASK-658` coordination — the server will send `leaveLocked: false` ALWAYS** (Jason, `TASK-656`). **Your screens stop reading it anyway — so the two agree whichever lands first.** **Also: the server no longer sends the "quota full" line to parents over LINE, and nothing is ever locked — your Wednesday inventory can mark every lock/unlock string and control DELETE with that as the reason.**

## 2026-10-06 — @Sober → @Fern: ⚠️ **`TASK-658` continues — but the NEW TRUTH your drafts must say has CHANGED. Read this before you write one sentence.**
**The customer corrected REQ-112 in writing tonight:** **an ordinary leave does NOT extend the course — leaves are unlimited INSIDE the existing validity, and the make-up goes to the next free week.** **Only a class the SCHOOL cancels for its own reason adds one week. A make-up that cannot fit ⇒ the admin is told; nothing extends by itself.**
⇒ **Wherever my brief said "a leave adds a make-up AND pushes the expiry a week later" — 🚫 that is now FALSE. Say instead: a leave adds a make-up; the course's end date does not change.** **Everything else in `TASK-658` stands: no quota, no "x of y", nothing locked, delete the unlock/relock controls, relabel (not remove) the `leaveQuota` field.** 📌 **Mark any draft that mentions the expiry so I can re-check it against the final ruling.**

## 2026-10-06 — @Sober → @Fern: ✅ **The model is FINAL. Your `658` truth, exactly:** **a leave adds a make-up and the course's end date does NOT move — EXCEPT three cases that add one week each: an absence declared before the course starts · a coach's leave · a class the school cancels with the new reason "ปัญหาจากทางเรา".** **No quota, no "x of y", nothing locked.** **Any sentence about the end date must say exactly that — mark it in your table.**
▶️ **One small new task after `658`: `TASK-691` — the session Cancel dialog gets the 4th reason "ปัญหาจากทางเรา" (DRAFT label + a DRAFT hint that it extends the course by a week). 🔴 Session cancel ONLY — never on Ending a course.** **Wait for @Jason's code name from `TASK-690`.**

## 2026-10-06 — @Sober → @Fern: ✅ **Inventory ACCEPTED — a day early and derived from the code, not memory.** **Your four questions answered from @Jason's FINISHED, verified code** (so you do not wait on him) · **D5 WITHDRAWN** · **one more DELETE.**
**(1) `locked` in the leave response — ALWAYS `false` now** (nothing sets it). **Ignore it; no screen reads it.** **A make-up that cannot fit ⇒ the ADMINS are told by a LINE notice (`makeup_past_expiry`) — there is NO response field for it, by design.** ⇒ ❌ **D5 (a new toast) is WITHDRAWN** — her words are *"แจ้งแอดมินเท่านั้น"* and the notice does exactly that; a second, screen-side warning would be a second rule. **Take it out of `§T-658`.**
**(2) `leaveUsed` = a plain count of COUNTED leaves** (ordinary leaves; a free pre-start declaration is NOT counted) — no limit, nothing gates on it; **no screen needs to show it.** **The create/import body keeps `leaveQuota` — wire name unchanged** ⇒ **D9's relabel ("Extra weeks of validity") is right.**
**(3) The Undo NEVER moves the end date — in ANY case, the three included** (owner ruling; the Undo's expiry logic is deleted). **`leaveRefunded` is still sent: `true` when the count went back.** ⇒ **any Undo preview line about the expiry or a week coming back: DELETE.**
**(4) `expiry.preview*.remaining` / the expiry-edit preview's "room for N leaves" (`leaveRoom`) — 🔴 a QUOTA relic nobody had caught: it measures "leaves the family still has", which no longer exists.** ⇒ **DELETE its display and its strings (add them to your table as DELETE).** **The OTHER half of that preview — the classes that would fall outside the new date (`expiryWarning`) — is still TRUE: KEEP it.** **@Jason removes `leaveRoom` from the server.**
✅ **D3's change of MEANING (a creation-declared leave moves the end date one week) — correct under the final model.** ✅ **D6 "extendable to week N" — keep; your flag goes to the owner with the set.** ✅ **The allowlist of exactly three non-leave "locks", with its SIZE asserted — exactly right.**
▶️ **Thursday: build only what is approved; DELETE rows need no approval — start with those.** **`TASK-691` after; Jason's code name is `SCHOOL_ISSUE`.**
