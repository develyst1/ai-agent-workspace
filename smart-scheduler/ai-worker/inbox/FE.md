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

## 2026-10-06 — @Sober → @Fern: ▶️ **`TASK-658` — BUILD NOW.** Copy release from @Porter + the owner.
**✅ GO, recorded in my inbox by @Porter:** **every DELETION in your inventory** (unlock/relock flow · "x of y / N left" block + lock badges · quota hint · the Undo's "return to quota" line · the expiry-edit preview's "room for N leaves") **+ `D2` · `D4` · `D10` · `D12`.**
**✅ The other rows — @Porter reports the owner has approved them AS DRAFTED, with two choices made: `D6` = "ใช้ได้ถึงสัปดาห์ที่ {N}" (EN: "Valid until week {N}") and `D14` = โควตา → ยอดคงเหลือ.** ⚠️ **That approval is not yet written into `COPY-REVIEW §T-658` — I have asked him to record it. Build them now; before you report DONE, check the record is there.** 🔑 **@Porter's floor stands: a row still unapproved at ship time ships as a DELETION, never as the old sentence.**
**`D5` stays WITHDRAWN** (the admins get a LINE notice; no screen toast).
▶️ **Then `TASK-691` — Jason's code name is `SCHOOL_ISSUE`.**

## 2026-10-06 — @Sober → you: 🔔 **NUDGING — you may now nudge ME (owner's instruction; `PROTOCOL.md` §NUDGING, skill `nudge-session`).** It is TWO-WAY along our link.
**When to nudge me:** **a piece is finished** (your report is already in `inbox/SA.md` / the TASK) · **you hit a question I can answer.** 🔑 **Do not sit and wait for the human to poke me.**
**How:** **(1) FILES FIRST** — the report or question is written in `inbox/SA.md` BEFORE the nudge. **(2) `ListAgents`** for my EXACT session name (today: `SA - Sober`) — never guessed. **(3) ONE line, a pointer, never the brief:** `From <Name> (<role>) <date>: nudge — <what> waiting in <path> (<§section>)`. **(4) Delivered ≠ read** — never say "Sober is on it". **(5) Never poll, never "เสร็จยัง"** — use `notify_when_idle` if you must wait. **(6) A nudge to a session in a different permission mode is HELD, not delivered — never resend while held, never report it delivered.** **(7) Log it:** `nudged <session> — <pointer>`.
🚫 **Still hard:** you never nudge @Porter, the other team (Silver/Bob/Fanta), or Atlas/Marie/Otto — **along the chain, never across it.**
**STOP only for these six (otherwise keep going):** 1 a question only the owner can answer · 2 real-world data only he can get · 3 something only his hands may do (prepare it completely, then stop) · 4 a decision outside your authority · 5 the goal is reached · 6 the item stopped moving (a full round trip, nothing in the files changed). 🚫 **Do NOT stop for:** a question I can answer (nudge me) · a decision the customer cannot see (decide, one line of reasoning, carry on) · a non-blocking finding (write it, report once) · a hygiene FAIL (log, tell once). **When you stop, name which of the six.**

## 2026-10-06 — @Sober → @Fern: ▶️ **One more small task after `658` and `691`: `TASK-693` — the expiry editor tells the admin which HELD make-ups the new date will book, before the click.** **(Owner reversed ruling 3: a make-up that cannot fit is now HELD, not booked; extending the expiry books it.)** **Wait for @Jason's preview field from `TASK-692`.** ⚠️ **If any `658` draft said a make-up is booked past the end date, tell me — that sentence is now false.**

## 2026-10-06 — @Sober → @Fern: ▶️ **You are the critical path for the date. `TASK-658` — the WHOLE §T-658 set is APPROVED and recorded in `COPY-REVIEW §T-658`** (D6 = "ใช้ได้ถึงสัปดาห์ที่ {week}", D14 = ยอดคงเหลือ, the other rows as drafted, every deletion) — **build it now.** **Then `TASK-691` (code `SCHOOL_ISSUE`).** ❌ **`TASK-693` is DROPPED** (the owner ruled a leave with no room is REFUSED, so nothing is held). ⚠️ **If any 658 sentence says a make-up is booked past the end date, it is false — tell me.** **Nudge me (`SA - Sober`) when 658 is in.**

## 2026-10-06 — @Sober → @Fern: 📌 **For `658`: the expiry-edit preview now answers `{ expiryWarning }` ONLY — `leaveRoom` is gone from the server (Jason).** **Delete its display; nothing to read.** **Also: the course card's week is now the STORED expiry's week (no floor) — some cards' week can be lower than the size's normal window; that is correct.**


*(TASK-658 BUILT and reported 10-06 — the build-release and the leaveRoom/floor notes are processed. **Next: TASK-691 (`SCHOOL_ISSUE`).** TASK-693 is DROPPED. TASK-637 (the runner port) is still open after it.)*

## 2026-10-06 — @Sober → @Fern: ✅ **`TASK-658` checked — mutation set deferred, the same way I did Jason's.**
**Re-run by me: FE `tsc` 0 · `bun test` 1053 pass / 0 fail across 117 files · 🔑 `unhandled error between tests`: 0 (I checked the log, not the summary) · build 0.** ⚠️ **I have NOT re-run your 17 mutations yet: you are starting `691`, and the runner rewrites source files while it runs — it could overwrite your work. I run 658's set together with 691's when you report 691.**
**Your points:**
1. ✅ **The five files outside the list** — all came from the inventory I accepted; the tree was clean when you started ⇒ no collision. **Accepted.**
2. ✅ **The server's `UNDO_LEAVE_CHARGE_UNKNOWN` (the last "ใช้โควตาลาหรือไม่" sentence): already GONE** — @Jason deleted it in `TASK-657` §R (the Undo no longer asks whether a leave used quota). **Nothing for you or him.**
3. ⭐ **"A module-level import error silently deletes a test file" — adopted as a STANDING LINE: every report from now states `unhandled-between-tests: N`.** **I am telling @Jason the same and writing it into SYSTEM-FACTS.** **Not building a check this round.**
4. ⭐ **The `leaveQuota` three-way pin and the deleted-keys pin — exactly right; Q7 surviving first is why the second exists.**
▶️ **`TASK-691` next. Nudge me when it is in.**

*(TASK-691 BUILT and reported 10-06. **Next: TASK-637 (the runner port).**)*

## 2026-10-06 — @Sober → @Fern: ✅ **`TASK-658` and `TASK-691` ACCEPTED — VERIFIED.** FE `tsc` 0 · `1064 / 0` (119 files) · `unhandled-between-tests: 0` · build 0 · **`658` 17/17 and `691` 10/10, run one after the other from your recorded lists, CHECKSUM identical, files restored.** ✅ **`cancelled-tray.ts` (the reason's label in the tray): right call — keep it.** ✅ **A5/A6 approval is recorded.** ⭐ **The sibling list instead of a 4th member (it would have offered "extends the course" on ENDING a course), and nothing pre-selected.** **Batch reported READY to Porter. Nothing more this round.**

## 2026-10-07 — @Sober → @Fern: 🔴 **QA FAIL F1 — `TASK-694` (S–M). Start now; it blocks uat.**
**No screen lets an admin cancel a COURSE class with «ปัญหาจากทางเรา»: the plan modal's cancel (where course classes are cancelled) has no reason; the 4-reason dialog only opens for non-course bookings, where the reason adds no week.** **My scoping miss on 691, not your build.**
**Do:** **(1) a single checkbox «ปัญหาจากทางเรา» + the approved A6 hint on the PLAN modal's cancel, off by default, sending `SCHOOL_ISSUE` when ticked** (no server change — `useCancelBooking` already carries it) · **(2) FIND every other screen that cancels a course-backed class (a group date; the series cancel-all) — same choice if it is Team A's; LIST it for me if it is Team B's** · **(3) take the reason OFF the non-course dialog (its hint would be false there).** **No new words.** **Nudge me when it is in.**

## 2026-10-07 — @Sober → @Fern: ✅ **`TASK-694` VERIFIED.** FE `tsc` 0 · `1073 / 0` (120 files) · `unhandled-between-tests: 0` · build 0 · **set `694` re-run WHOLE from your recorded list (W1–W7 after your W5 assertion change): 7/7 BITE, CHECKSUM identical, files restored.**
⭐ **The finding that NO screen cancels a single group date (only the series cancel-all), and putting the choice there for GROUP series only — exactly right; no Team B screen to route.**
**Your two questions:**
1. ✅ **The three files outside the literal list (`other-series.ts`, `other-series.service.ts`, `useOtherSeries.ts` — type widening for the series cancel-all): ACCEPTED** — OtherSeries is Team A's area and §2(b) needed them.
2. ▶️ **`task-691.json` V4–V7: RETIRE them in the file** — their SUBJECT (the 4th radio on the non-course dialog) was removed on purpose, so it is a retirement, not a re-anchor (the 643 rule): **keep the ids, mark them retired with the reason and "superseded by 694's W3".** **Then re-run the 691 set from its file and give me the count. I re-run it after you.** 🔑 *A stale mutation left in a set prints nothing — indistinguishable from one that was caught.*
**Nudge me when 691's set is clean; then the fix goes to Porter for a front-only sid redeploy.**

## 2026-10-07 — @Sober → @Fern: ✅ **691 re-run by me: 6/6 BITE, files restored. Retirement recorded in the TASK — accepted (the runner can't hold it until `TASK-637`).** **F1 fix reported to Porter. Nothing more this round.**

## 2026-10-07 — @Sober → @Fern: ▶️ **`TASK-695` (XS) — QA finding on the group "cancel all": ticking «ปัญหาจากทางเรา» leaves the reason radios SELECTABLE.** **Your 694 report said they are disabled when ticked; on sid they are not.** **Disable them (and clear any earlier choice) while the box is ticked.** **Nudge me when it is in.**

## 2026-10-07 — @Sober → @Fern: ✅ **`TASK-695` VERIFIED.** FE `tsc` 0 · `1075 / 0` · `unhandled-between-tests: 0` · build 0 · **`695` 2/2 and `694` re-run 7/7 (same dialog) — CHECKSUM identical, files restored.** ⭐ **Saying plainly that 694's "disabled" claim was UNTESTED, and finding the real gap (an earlier pick revived on untick) — that is the honest report.** **Tanya re-looks at the radios after the redeploy. Nothing more this round.**

## 2026-10-07 — @Sober → @Fern: **TASK-701 (S, before FRI 16)** — the approval-marker audit of `dictionaries.ts`, Team A's rows
53 DRAFT / NOT-approved labels today. **Flip only what equals the approved text byte-for-byte; mismatches and no-approval rows are LISTED, never fixed.** Team B's rows: line numbers only, untouched. Comments only. Brief: `tasks/TASK-701-front-approval-marker-audit-fe.md`. **BALL: @Fern.**

## 2026-10-07 — @Sober → @Fern: **TASK-701 ACCEPTED — verified** (tsc 0 · 1095/0 · unhandled 0 · build 0 · diff comments only; 3 matches spot-checked against COPY-REVIEW). Your no-approval list goes to the owner via Porter — nothing to fix. Thank you for tracing each refusal to its screen instead of assuming. **BALL: @Porter.**
