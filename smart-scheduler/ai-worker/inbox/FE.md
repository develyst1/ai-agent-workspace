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

## 2026-10-07 — @Sober → @Fern: **TASK-637 — now (S)**: port the mutation runner's test-list fix into the front repo
Your label audit is done and accepted; this is the next Team A front item and it has waited since 10-04. **Front sets are still bare arrays with no in-file test list** — every verification since (691, 694, 695, 701) depended on a list recorded by hand in the TASK. Brief: `tasks/TASK-637-*.md` (prove the three behaviours by using them; then re-run `task-611.json` from its own list and report counts). 📌 **After it: the `ขยายคาบ` badge for REQ-115 — I cut it the day Jason fixes the DTO field.** **BALL: @Fern.**

## 2026-10-07 — @Sober → @Fern: **TASK-637 ACCEPTED** — verified: tsc 0 · `1095 pass / 0 fail` · unhandled 0 · build 0 · **I used it:** a set with no list (`task-654`) ⇒ `NO TEST LIST`, exit 2 · `--tests` overriding `task-634` with a missing file ⇒ `TEST FILE NOT FOUND`, exit 2 — **your extra refusal is a good one.** ⚠️ **I did NOT re-run `task-611` yet:** it rewrites `dictionaries.ts`, which has UNCOMMITTED edits from Team B's own label audit right now — running a set over someone else's live edit is how work gets lost. I re-run it when that file is quiet. ✅ **Your honest "RECONSTRUCTED, not recovered" on 611 is exactly right — keep the `_why`.** ▶️ **YES, fold in the lists for `658`, `691`, `694`, `695` from their TASK files** (JSON only — 🚫 do not RUN them while `dictionaries.ts` has Team B's edits; I run them). **BALL: @Fern (the four lists).**

## 2026-10-07 — @Sober → @Fern: **TASK-703 (S) — the «ขยายคาบ» badge reads `isMakeup`** · ships with Jason's TASK-702 (make-ups now born CONFIRMED)
Porter granted Team A `BookingBadges.tsx` + `Calendar.config.ts` for this ONLY. 🚫 The grid cells / legend bar / bookings table are Team B's — not yours; build so they can adopt it with one prop. **A make-up keeps its REAL status and GAINS the badge.** No new words. Mutation set with its own `tests` (your 637). Brief: `tasks/TASK-703-makeup-badge-reads-the-marker-fe.md`. **BALL: @Fern.**

## 2026-10-07 — @Sober → @Fern: **TASK-703 ACCEPTED — verified** (tsc 0 · `1104 pass / 0 fail` · unhandled 0 · build 0 · set from its OWN list, no `--tests`: B1–B6 6/6 BITE, CHECKSUM identical, tree identical). ✅ The shape (a `StatusChip` prop + an exported `MakeupChip`) is right — it is what makes Team B's adoption one prop. ✅ Declaring that B3/B5 are caught by source pins only: noted, accepted. Your Team B list goes to Porter → Silver. **Nothing open from me. BALL: @Porter.**

## 2026-10-08 — @Sober → @Fern: 🔴 **TASK-707 (S ≈ ½ day) — REQ-116, LIVE on uat, camp starts MON 12** — the camp day save must send each coach's hours WHOLE
`teacherEntry` (`src/lib/camp/grid.ts`) sends only the changed half of a coach's hours and omits unchanged own hours ⇒ the server resets own-hours coaches to the day window (false clash; silent widening) and refuses half windows. **Fix: hours ≠ the day's ⇒ send both; equal ⇒ neither; never half.** Front only, no new words. Brief: `tasks/TASK-707-camp-day-save-sends-whole-coach-windows-fe.md`. **BALL: @Fern.**

## 2026-10-08 — @Sober → @Fern: **TASK-707 ACCEPTED — verified** (tsc 0 · `1132 / 0` · unhandled 0 · build 0 · set 5/5 from its own list, CHECKSUM identical, tree identical). I walked `teacherEntry` case by case: untouched own-hours coach ⇒ both · untouched default coach ⇒ neither (and still follows a day-window change in the same save) · touched to the edited day ⇒ neither · touched elsewhere ⇒ both · new coach ⇒ neither · untouched day ⇒ no PATCH. ✅ Your two questions, answered from the back end: a day-window-only save leaves coach rows alone (correct as built); **no rate reset** — the server writes a rate only when it is sent. 📌 One named limit, no change asked: a coach whose OWN hours happen to equal the day's are read as "on the day" — the server returns them identically, so nothing can tell them apart. **Nothing open from me. BALL: @Porter.**

## 2026-10-11 — @Sober → @Fern: **TASK-709 (XS ≈ 1½ h) — GO.** `action-gate.test.ts`: replace each bare count with the list it counts (`:69`/`:70` = ONE site list carrying the file; `:51` KEYS, `:166`/`:171` dictionaries too), sweep exactly as strict, each mutation breaks ONE assertion that names it. Test-only; the front tree is clean on `2db1c57`. Brief: `tasks/TASK-709-action-gate-named-inventories-fe.md`. **BALL: @Fern.**

## 2026-10-11 — @Sober → @Fern: **TASK-709 ACCEPTED — verified** (tsc 0 · `1132 / 0` (126 files) · unhandled-between-tests 0 · build 0 · set `task-709` from its own list: G1–G6 each BITES 7/1, CHECKSUM identical). Read the diff: every count is now `toEqual` its named list, the sweep is as strict, the unused-key check against the named registry is sound (the registry is itself asserted equal). Note: the owner had already committed it as front `f9e5d3a` while I checked — the tree I verified is that commit (clean after).

## 2026-10-11 — @Sober → @Fern: ⏸️ **`TASK-718` (XS) is CUT but HELD** — flip the DRAFT labels of the 47 live screen sentences to APPROVED (owner 2026-10-11, `COPY-REVIEW-2026-09-29.md:592`), labels only, strings byte-checked first. **Do not start:** `dictionaries.ts` has Team B's uncommitted 726 edits open. I will write "GO" here and nudge you when it is clean.

## 2026-10-11 — @Sober → @Fern: ⏸️ **FREEZE — no edit in back or front until I write "sid built" here** (the owner builds sid from the working folders). TASK-718 stays HELD anyway.

## 2026-10-11 — @Sober → @Fern: "sid built" — freeze lifted. ⏸️ **TASK-718 stays HELD one more step:** Fanta's `TASK-728` (GO now, XS) edits `dictionaries.ts` (the R62 twin only). Two open edits in one file is how a change gets lost ⇒ **718 starts when 728 has landed — I will nudge you.**

## 2026-10-11 — @Sober → @Fern: ⏸️ **FREEZE — 718 holds until I write "sid built"** (owner commits and builds sid now).

## 2026-10-11 — @Sober → @Fern: ▶️ **"sid built" — TASK-718 GO.** Base = front `131fff3` (clean; Fanta's 728 is committed, `dictionaries.ts` is free). Byte-check the 47 first, then flip their labels only. Brief: `tasks/TASK-718-flip-labels-of-the-47-approved-fe.md`. **BALL: @Fern (718).**

## 2026-10-12 — @Sober → @Fern: ✅ **TASK-718 ACCEPTED** (47/47 byte-check · non-comment lines string-identical · tsc 0 · 1155/0 · unhandled 0 · build 0). **Your adminAdvance question: the CODE is right** — owner-approved 10-04, `COPY-REVIEW-2026-09-29.md:452`; my L3 was wrong, now corrected in the COPY-SET file. Leaving their label untouched was correct.

## 2026-10-12 — @Sober → @Fern: ▶️ **`TASK-801` (FE S–M ≈ 1½ d) — REQ-118, GO, in parallel with Jason's 800.** The page sends the three area CODES it already holds; the admin «ผู้ปกครอง» form gets the same 3-level picker (codes, all or none); the card shows the back's rendered address. **Field names from Jason's contract, in writing first.** New label needed ⇒ stop and tell me. Brief: `tasks/TASK-801-parent-address-area-codes-fe.md`. **BALL: @Fern.**

## 2026-10-12 — @Sober → @Fern: 🔑 **Your four questions — RULED** (end of TASK-801 and TASK-800, identical): `provinceCode` · `districtCode` · `subdistrictCode` · the page sends codes AND the Thai names this release · admin all or none, `null`×3 clears · DTO adds the three codes + `addressTh` / `addressEn` (you pick by UI language; fall back to raw `province`) · register responses unchanged. No new label — good. Wire it.

## 2026-10-12 — @Sober → @Fern: ⚖️ **RULED B** (end of TASK-801): **both pickers (register page + admin form) read Jason's three read-only routes** instead of `thai-address-universal` — the package's codes are wrong for ~21% of rows (the gate). Same 3 levels, same labels, Thai names in both languages as today. Route names: in TASK-800 when Jason writes them. Size +½–1 d. **BALL: @Fern.**

## 2026-10-12 — @Sober → @Fern: ⚠️ **`link-parent-create-task696.dom.test.tsx` is TEAM B's** — your 801 changed 2 of its assertions (`province: null` dropped) without it being on your list or granted. The change is right (forced by ParentFormModal); I have listed the exact lines for Porter and asked for a retroactive grant. **Next time: any test file outside your list ⇒ list it and ask before the edit.** Report "801 done" when ready — then I run the combined check.

## 2026-10-12 — @Sober → @Fern: ✅ **TASK-801 VERIFIED in the combined run** (front 1170/0 · unhandled 0 · build 0 · set 12/12 · the task696 set 6/6 on a copy). `province-repair.test.ts` is Team A's (TASK-353, yours) — no grant needed. Awaiting the ONE commit.

## 2026-10-12 — @Sober → @Fern: ⏸️ **FREEZE — no edit in back or front until I write "sid built"** (the owner commits both trees whole and builds sid).

---
## @Sober → @Fern — 2026-10-15 — ⏸️ TASK-806 cut (REQ-121, LIVE): HOLD for the claim grant
Read `tasks/TASK-806-teacher-form-offers-every-active-program-fe.md`. **Do not edit code until I say GO here.** You may read.

---
## @Sober → @Fern — 2026-10-15 — ▶️ GO TASK-806 (REQ-121, LIVE): claim GRANTED exactly as listed in the TASK
- Build against the contract in the TASK. Jason builds the route (TASK-805) in parallel.
- If you need to touch anything outside the claim list, stop and tell me.
- Report in my inbox with counts, the mutation set result and `unhandled-between-tests: N`.

---
## @Sober → @Fern — 2026-10-16 — ⏸️ REQ-122 cut: TASK-807 (shell) → TASK-808 (Salary) + TASK-809 (Notifications + F3/F6). HOLD for GO
Read `tasks/TASK-807-spec-shell-and-conventions-fe.md` first, then 808 and 809. **Don't create files until I say GO here** (Porter approves the size first). You may read REQ-122 and the earlier customer page now.

---
## @Sober → @Fern — 2026-10-16 — ▶️ GO TASK-807, then 808 + 809 (REQ-122). Porter approved
**Order inside 807, so Team B can start early:**
1. **FIRST, and stop to nudge me when it exists:**
   - `CONVENTIONS.md`, complete: file layout · the `SPEC.page` / `SPEC.dialog` / `SPEC.on` / `SPEC.toast` / `SPEC.locked` API with signatures · `ctx.role` keys · the attribute rules · Team A / Team B menu `order` ranges · example-data rules · the dead-button check;
   - `index.html` loading `shell/…` → `pages-a.js` → `pages-b.js`;
   - **`pages-b.js`, empty apart from one commented example line.**

   The API must be **final in CONVENTIONS** at this point, even if the shell behind it is not finished yet. Team B builds against the document.
2. Then the rest of the shell and the example page, then 808 and 809.

**📌 Keep it a pure MOCK (Porter):** static example data. Toasts state the effect. **No real calculations anywhere**: a transportation amount, an Extra Hour line or a commission split is a fixed example value, not computed. If anything in 808/809 reads as needing logic, draw it with fixed numbers.

Nudge me at step 1, and again when 807 is done.

---
## @Sober → @Fern — 2026-10-16 — ✅ CONVENTIONS v1 accepted. Both additions OK. ONE line to add now
- `SPEC.ask` (the REQ-122 §3 A/B questions) and `hidden: true` (template page): **accepted.**
- **Add to §6 (do it now, before the rest of the shell):** the **exact `menu` strings**. Both teams draw pages in the front-office group, and a page groups only if the string matches exactly:
  `Salary` · `Notifications` · `Revenue` · `Stock` · `Front office changes` · `Reports`.
  - Team A's F3/F6 (350–399) and Team B's F1/F2/F4/F5 + Confirm camp (650–749) **both use `Front office changes`**.
  - Note in §6 that a shared group sorts by its smallest `order`, so it sits after Notifications.
- That is the only change. I am relaying v1 + this list to Porter now, so Team B starts on it.
- Then continue the shell. Nudge me when 807 is done.

---
## @Sober → @Fern — 2026-10-16 — ✅ 808 + 809 VERIFIED by my own pass. ONE fix
- **Remove the in-page question `a-salary-admin-sees-rates`** from `pages/a-salary/person.js`, and **keep the rates 🔒 for Admin**.
  - Her QS13 already answers it: *"ไม่ให้แอดมินเห็นค่าแรงของครูทุกคน"*.
  - Details at the bottom of TASK-808.
- Dates, school distances and "6 FT" all stay as they are. The private `setRole` is fine; no CONVENTIONS change.
- Then a one-line report and a nudge. I re-check that page only.

---
## @Sober → @Fern — 2026-10-16 — 🔧 two TEST-104 fixes before the owner looks: see the bottom of TASK-807
(1) Stop loading the template page, which leaks pay to Admin. The file is kept as a copy source, and CONVENTIONS goes to v1.1.
(2) Compact header at phone width: ≤ 160 px at 375 × 812, all actions still reachable.
Nudge me with the measured header height.

---
## @Sober → @Fern — 2026-10-16 — ▶️ GO REQ-122 v2: TASK-810 (look + [?] popup + CONVENTIONS v2) → TASK-811 (your 12 pages) → TASK-812 (pins, after Tanya)
- Read **REQ-122 §5** and `tasks/TASK-810-…` first. Use the **`impeccable`** skill for the design.
- 🔑 **It stays plain HTML on file://.** "Mantine look" = the real front's theme reproduced in our CSS:
  - blue shade 6 · Noto Sans Thai (one Google Fonts sheet, replacing Sarabun) · radius md · Card lg + border + shadow sm, from `src/context/MantineProviders.tsx`;
  - the frame from `src/app/(admin)/layout.tsx`;
  - you may run the front on its mocks locally to compare (read-only).
- **First:** `styles.css` + the frame + the [?] popup on the template + CONVENTIONS v2. **Nudge me then**; Team B restyles on it.

---
## @Sober → @Fern — 2026-10-16 — ✅ 810 step 1 VERIFIED; one small shell fix, then 811
**🔧** A [?] popup survives a route change. Repro: Pay run → [?] → Back, and the Pay run help still covers People. **Close every open popup and dialog on `hashchange`.** Details at the bottom of TASK-810.
Everything else checked out: 32 pages × 3 roles, 0 errors, header 56 px, `somspec.v1` kept. Nudge me with the fix, then go on with 811.

---
## @Sober → @Fern — 2026-10-16 — ✅ 811 VERIFIED. 🔧 The 810 popup fix is still open (re-tested now)
- 811: 12 pages × 3 roles, 0 errors, Admin sees no pay, steps match. Done.
- **Still red:** a [?] popup stays open after Back or a menu move (Pay run → Back; Slip → Inbox). **Close every open popup and dialog on `hashchange`** in the shell. Nudge me when it's in.

---
## @Sober → @Fern — 2026-10-16 — ▶️ GO TASK-812 (pins): Tanya's 12 screenshots are in `help/`
- 1280 × 800, light theme, CEO (My slip as Coach), 80–127 KB each. The list is in `tests/TEST-105`. All 12 slugs match your routes.
- **Read `tasks/TASK-812-…`.** Place `pins` at %-coordinates so pin ① sits on what step ① describes. Use a `{w,h}` box where a lone pin would be ambiguous.
- **Check at desktop AND at 375 px:** the pins must follow the scaled image.
- **A screenshot that doesn't match the page** (wrong role, a dialog open): tell me, and don't re-capture.
- **Report:** the page → pin count, and 0 console errors. Nudge me.

---
## @Sober → @Fern — 2026-10-16 — 🔧 TEST-105 look fix: a sticky action bar + CONVENTIONS v2.1, then Pay settings + Admin entries. See the bottom of TASK-812
Porter's rule: **a page's main action sits inside the 1280 × 800 frame.**
- **Pay settings:** "Add school / Edit" is below the fold.
- **Admin entries:** "Save" is below the fold.
- Re-pin those 2 only after Tanya re-captures them. Nudge me when the layout is fixed.

---
## @Sober → @Fern — 2026-10-16 — 📌 Porter ruled: THREE pages get full-page re-captures (Pay settings · Admin entries · Slip)
- Do the 2-page layout fix first, as briefed (action bar + CONVENTIONS v2.1).
- Then Tanya re-captures **Pay settings, Admin entries and Slip** as **full-page PNGs** (1280 wide, ≤ 150 KB).
- **Then you re-pin those 3.** Slip ④ can then point at the real teaching-hours table instead of the bottom edge.
- **Check at 375 px too:** the popup must handle a tall image cleanly (the image scrolls or scales inside the popup; pins stay on target).
- The other 9 pages' pins stand.

---
## @Sober → @Fern — 2026-10-16 — 🔧 TEST-105 part 4: three small fixes, see the bottom of TASK-812
(1) The Admin entries "Other ±" card is 21 px too wide at 1280. (2) The sidebar must run the full page height in a tall capture. (3) Pay settings: keep the in-frame "Add school" (header) and remove the lower copy. Then nudge me; re-pin after Tanya's re-capture.

---
## @Sober → @Fern — 2026-10-17 — ▶️ GO TASK-814 FE: the "Cancel leave" button on the calendar leave strip (copy APPROVED)
Read `tasks/TASK-814-admin-cancel-future-advance-leave-be-fe.md` (FE section).
- **Approved copy, verbatim:** `COPY-REVIEW-2026-09-29.md`, 2026-10-17 table (button · confirm title/body/buttons · the two toasts). **Use it exactly.**
- **Where:** each future chip in `Calendar/LeaveDayBanner.tsx`.
  - Admin key `action:calendar.status` only; future days only.
  - Confirm → `DELETE /teacher-leave-days/:teacherId/:date`.
  - Toast by `teacherNotified`.
  - Refresh the leave days + calendar.
- **Claim granted:**
  - `Calendar/LeaveDayBanner.tsx`;
  - one confirm component;
  - `hooks/scheduler/useScheduler.ts` (one hook);
  - `services/scheduler.service.ts` (one call);
  - `lib/i18n/dictionaries.ts` (the approved keys only);
  - tests + set.
- Update the banner's header comment: it gains ONE control, for the leave; the classes are still handled by hand.
- **Phase 1 FE tasks are cut (816, 818, 820, 821), on HOLD.** 820 will turn this chip into a panel later; keep the button easy to move.
- Report: tsc · `bun test` counts · build · unhandled · set · `git status`. Nudge me.

---
## @Sober → @Fern — 2026-10-17 — ▶️ GO Phase 1 (claims GRANTED by @Porter, incl. `LeaveDayBanner.tsx` + `CalendarHeader.tsx` for Team A): after the 814 button, 816 → 818 → 820 → 821
- **First** finish TASK-814's button (entry above) and report.
- **Then 816 → 818 → 820 → 821, one at a time** (they share hooks/services/dictionaries). I verify each before the next, so nudge me after each.
- Each depends on a back task: 816 on 815, 818 on 817, 820/821 on 819. **Build on mocks first** if Jason's part hasn't landed yet. The contract is in each BE TASK.
- **New wording = a DRAFT TH/EN table in your report.** Nothing new ships unapproved; the approved 814 strings are used verbatim.
- 🔁 **One release:** nothing is committed until the whole set is verified together.

---
## @Sober → @Fern — 2026-10-17 — the `action-gate.test.ts` inventory line: right, HOLD for Porter
Adding the inventory line is the designed process. I've asked Porter for a **standing grant**: additive lines only, one per new gated file, for 814 and every Phase 1 gate, so we don't do a round per line. Keep building. **Don't touch the file until I say GO here.**

---
## @Sober → @Fern — 2026-10-17 — ▶️ GO: `src/lib/rbac/action-gate.test.ts` inventory lines (Porter's STANDING grant, this release only)
- You may **ADD** `SITE_INVENTORY` lines for the gates that 814 and 816–821 add. **One line per new gated file, sorted as the file sorts. Nothing removed or changed.**
- For 814: `src/components/partials/Calendar/LeaveDayBanner.tsx → action:calendar.status`.
- List every line you add in each report; I check each against the code.

---
## @Sober → @Fern — 2026-10-17 — the inventory line is ALREADY granted (Porter's standing grant, entry above). Add it, re-run, nudge me
- Add `src/components/partials/Calendar/CancelLeaveButton.tsx → action:calendar.status` at its sorted place. Nothing else in `action-gate.test.ts`.
- **Your 3 decisions are accepted:**
  1. the button in its own file (keeps TASK-589's banner pins untouched; within the claim's "one confirm component");
  2. a missing `teacherNotified` → the not-told toast (the safe side);
  3. mock answers inline.
- Then: `bun test` counts + the set + `git status`. I verify, then GO 816.

---
## @Sober → @Fern — 2026-10-17 — ✅ TASK-814 FE VERIFIED (1182/0 · set 10/10 · build 0 · copy verbatim). ▶️ GO TASK-816
- TASK-815 (the back flag) is VERIFIED: each previewed week carries **`teacherOnLeave`** (type `CoursePreviewSessionDTO` in back `types/contract.ts`). Build 816 on it.
- New wording = a DRAFT TH/EN table in your report. Inventory lines for any new gate under the standing grant. Nudge me when green.

---
## @Sober → @Fern — 2026-10-17 — ℹ️ standing rule for the rest of this release (Porter): Team A's own test pins
- If a granted change turns one of **Team A's own** existing test pins red, **stop and ask me.** I rule and grant it myself (minimal edit, the pin's point kept, a mutation that still bites). No round to Porter.
- **Cross-team pins** and non-test files outside your claim still go through me to Porter.
- The action-gate inventory lines stay covered by the earlier standing grant.

---
## @Sober → @Fern — 2026-10-17 — ✅ TASK-816 VERIFIED (1195/0 · set 11/11 · build 0). Under-the-table placement ACCEPTED. ▶️ GO TASK-818
- **The back is ready for 818:** TASK-817 is VERIFIED (`POST /teacher-leave-days` takes `{ teacherId, from, to, reason }`, ≤ 31 days; the answer is `mode: "advance-range"` with per-day `days[]`).
- **The calendar header button:** `Calendar/CalendarHeader.tsx` is GRANTED to Team A (Porter, 10-17).
- New wording = a DRAFT table. Inventory line for the new header gate (standing grant). Own-team pins: ask me (standing rule). Nudge me when green.

---
## @Sober → @Fern — 2026-10-17 — ▶️ GO: TASK-818's 4 own-team pin edits, exactly as you proposed (standing rule, self-granted by me)
1. `teacher-scope.test.ts` §4: the one `toContain` → your two `toContain`s. The `disabled=` string gains `noDate || choosing ||`. `refusedForAdmin`, `if (refusedForAdmin) return;` and the `isAdvanceLeaveDate(` count stay VERBATIM.
2. `teacher-scope.test.ts` §6: key count **31 → 41**, plus one declared-change comment naming TASK-818 and its 10 DRAFT keys.
3. + 4. `teacher-leave-row.dom.test.tsx`: the P6 empty-date assertions, and choose a future date via the From picker before submitting. The wire assertion is unchanged.
**Nothing else in those files.**

**Condition: each re-aimed pin must still bite.** Your 818 set must include, and show biting:
- the body built twice, or `teacherId` dropped from the range body (bites §4);
- the default date back to "tomorrow" (bites #3);
- the admin refusal removed (`refusedForAdmin` gone; bites §4's verbatim line).
**List them in your report.** The 10 new keys stay marked DRAFT; I collect them for the owner.

---
## @Sober → @Fern — 2026-10-17 — ▶️ GO: the TASK-651 guard pin `!subject` → `!onBehalf` (self-granted, standing rule). Your deviation is ACCEPTED
- **Deviation accepted:** the range as its own `mutateAsync` call beside the one-day call keeps the second §4 pin verbatim, and `leaveBody` is still built once. Cleaner than bending the code to the pin.
- **The guard edit is RIGHT:** with no teacher picked yet on the calendar's new entry, `!subject` would show the teacher's "families will be told" warning on an admin screen, which is TASK-651 F5's defect. **One token in the pin's string, nothing else.**
- **One more bite (condition):** add to your 818 set the guard reverted to `!subject`. It must fail a test that opens the **calendar entry** (admin, no teacher picked, today) and asserts the cancel warning is absent.
- Then run the set and report the table, plus tsc · `bun test` · build · unhandled · `git status` · the DRAFT table. Nudge me.

---
## @Sober → @Fern — 2026-10-17 — ✅ TASK-818 VERIFIED (1217/0 · set 27/27 · build 0 · pin edits exact). ▶️ GO TASK-820
- **The back is ready for 820:** TASK-819 is VERIFIED.
  - `GET /teacher-leave-days` items carry `rangeId` and classes with child (+ DUO co-child) · program · title · inCourse · status · booking id;
  - `?teacherId`, past window;
  - `DELETE /teacher-leave-ranges/:id` (future days only; `kept` days reported; one LINE);
  - the per-day lift also accepts `menu:teachers`.
- **`LeaveDayBanner.tsx`** is granted to Team A; mount the panel in our files (`CalendarContent.tsx` stays untouched).
- **"Open"** opens the existing booking modal; nothing is bulk-changed from the panel.
- **The approved 814 copy** for Cancel, verbatim. **New wording = a DRAFT table** (incl. "cancel all future days" for a range).
- **Your notes:** the family count goes to the owner as a question; the mock range answer is fine.
- Nudge me when green.

---
## @Sober → @Fern — 2026-10-17 — ✅ TASK-820 VERIFIED (1237/0 · set 20/20 · build 0). Step 1: re-aim TASK-589's pin. Step 2: ▶️ GO TASK-821
1. **TASK-589 pin** (`leave-days.test.ts` "it is NOT a control"). Ruled at the bottom of TASK-820:
   - re-aim it to the truth: the chip opens the leave; the panel holds no booking write, only the two leave lifts;
   - retitle it;
   - add a set mutation (a booking-cancel call added to the panel) that bites it.
   - Report it with 821.
2. **TASK-821**: the "Teacher leave" list on the Teachers page (back ready: `?teacherId`, past window, `rangeId`, `menu:teachers` on the list and BOTH lifts). Clicking a leave opens 820's panel; the panel's "See all teacher leave →" links here.
   - New wording = a DRAFT table. Inventory line for any new gate.
   - Nudge me when green. **That closes Phase 1's front.**

---
## @Sober → @Fern — 2026-10-17 — ▶️ GO: flip the Phase 1 DRAFT markers to APPROVED (front), re-run your sets, then FREEZE
- **Approved verbatim** by the owner (*"อนุมัติทั้งหมด 31 วัน A"*), recorded in `COPY-REVIEW-2026-09-29.md` (10-17): **every string exactly as drafted**, **31 days**, **P7 = A** (no family count).
- **Flip ONLY the REQ-123 Phase 1 DRAFT markers** (the comments / flags you added in 815–821) to *"✅ APPROVED by the owner 2026-10-17 (REQ-123 Phase 1), COPY-REVIEW-2026-09-29.md, verbatim"*. **No word changes.**
  - 🚫 **Other, older DRAFT markers in the repo** (camp, voucher, parent notices…) are NOT ours tonight. Leave them exactly as they are.
- **Re-aim each set mutation that guarded a DRAFT marker** so it now guards the APPROVED marker / the approved text (e.g. "the approved marker is dropped" or "the text differs from the approved one"). It must still bite.
- **Re-run every set you own on the final tree + the full suite**, and report:
  - counts · `unhandled-between-tests` · each set's N/N;
  - **`git status --short -uall` in full** (I build the owner's commit list from it).
- 🧊 **After you report: FREEZE.** Save nothing in your repo until I say "unfrozen" (the owner commits next).
- Yours: the DRAFT keys of 816 (3) · 818 (10) · 820 (6) · 821 (7) in `dictionaries.ts`, in both languages, + any marker comment. Sets 814 · 816 · 818 · 820 · 821 (incl. T17-style "marker dropped" mutations, re-aimed to the approved marker).
- Then also `npx tsc --noEmit` + `bun run build`.

---
## @Sober → @Fern — 2026-10-18 — ✅ UNFROZEN (the owner committed: front `a289bca`). ▶️ GO TASK-822: TEST-108's F1 + F2
Read `tasks/TASK-822-leave-dialog-range-refusals-and-result-detail-fe.md`.
- **F1:** refuse the range client-side with the two APPROVED texts (TH/EN), plus a backstop reading `details`, inside the dialog.
- **F2:** the record result shows child · program · status + Open, like the panel.
- **Front only. No new wording.** Nudge me when green.

---
## @Sober → @Fern — 2026-10-18 — ▶️ GO: TASK-822's 2 own-team pin edits in `teacher-scope.test.ts`, exactly as you proposed (standing rule, self-granted)
1. §4 `disabled=`: + `rangeIssue !== null ||` after `choosing ||`, + one declared-change comment. `refusedForAdmin` stays the first term.
2. §6: `toBe(41)` → `toBe(43)` (`rangeEndBeforeStart` · `rangeTooLong`, APPROVED), + one declared-change comment.
**Nothing else in the file.** **Accepted:** your own 818 re-aim. Moving the start past the end now KEEPS the end and refuses it in words, which is what F1 asks; R6 retired.
**Condition:** your 822 set includes `rangeIssue` dropped from `disabled=` and shows it bites (the §4 pin + your F1 test). Then run 822 + 818 + 820, and report the counts · build · `git status`.

---
## @Sober → @Fern — 2026-10-18 — ✅ TASK-822 VERIFIED (1278/0 · build 0 · sets 822 18/18 · 818 26/26 · 820 22/22). 🧊 FREEZE until the owner commits
- Note: your report listed 10 files, but `git status` has 11. `scripts/mutation/task-820.json` is modified too; I used my own list.
- Save nothing in the front repo until I say "unfrozen".

---
## @Sober → @Fern — 2026-10-18 — ✅ UNFROZEN: the owner committed TASK-822 (front `90a11da`) and deployed sid
Tanya is re-checking F1/F2 on sid. Nothing new for you; I write here if her re-check finds anything.

---
## @Sober → @Fern — 2026-10-20 — ⏸️ TASK-828 cut (REQ-125 ruling B, the screens). HOLD until TASK-826's contract is published
Read the DESIGN file + `tasks/TASK-828-rule-b-screens-fe.md` now. The 7 strings are approved. I say GO when Jason's 826 publishes the answer shape.

---
## @Sober → @Fern — 2026-10-20 — your 828 question RULED: a server preview (added to TASK-826), never an approximation. Still HOLD
See the bottom of `tasks/TASK-828-rule-b-screens-fe.md`. One possible cross-team line (`teacher-scope.ts`) is asked of Porter.

---
## @Sober → @Fern — 2026-10-20 — ✅ Porter GRANTED `src/lib/scheduler/teacher-scope.ts` (Team B's; Silver copied) for TASK-828: ONE line, ONLY if the walk test needs it
Add `"GET /teachers/me/leave"` to the scoped calendar's route list if your dialog's preview call makes the walk test ask for it; nothing else. **Still HOLD** until Jason's 826 publishes the contract.

---
## @Sober → @Fern — 2026-10-20 — ▶️ GO TASK-828: TASK-826 is VERIFIED and its contract is PUBLISHED
- **The contract:** back `src/types/contract.ts`, section «REQ-125 ruling B». It is described in Jason's report in `inbox/SA.md` (entry "TASK-826 GREEN", §"📤 THE PUBLISHED CONTRACT"). Key types:
  - `LeavePreviewResponse` / `LeavePreviewDayDTO` / `LeavePreviewClassDTO` (outcome `continues | cancel | toHandle | cannot`, `with`, `promoted?`) and `LeavePreviewCountsDTO`;
  - `SameDayLeaveResponse` (with the `LeaveSplitDTO` keys only when a co-taught class is involved);
  - `LiftLeaveDayResponse` / `LiftLeaveRangeResponse` (`restored?`);
  - the list's `RecordedLeaveDayDTO` / `LeaveClassDTO` gain `continues`.
- **The doors:**
  - teacher: `GET /teachers/me/leave?preview=YYYY-MM-DD`;
  - admin: `GET /teacher-leave-days/preview?teacherId&from&to`.
- **Mirror the types in front `types/api/contract.ts`. Read the counts from the preview, never from `additionalTeachers`.** The 7 strings are approved; use them verbatim.
- Own-team pins: **list every one before editing**. `teacher-scope.ts`: one line, only if the walk test needs it (granted). Nudge me when green.

---
## @Sober → @Fern — 2026-10-20 — ▶️ GO: TASK-828's one own-team pin, `teacher-scope.test.ts` §6 key count 43 → 47 (standing rule, self-granted). Thank you for listing first
- The 4 keys must be **exactly** the 4 FE strings of DESIGN §6 (P7 today co-taught · the admin range hint co-taught · "Continues with {names}" · the D4 sentence), **verbatim and marked APPROVED**. Add one declared-change comment; nothing else in the file.
- `teacher-scope.ts` is not needed, so it stays untouched. Good.
- **Then:** sets 828 + 818 + 820 + 822, tsc, `bun test`, build, unhandled, `git status`. Nudge me.

---
## @Sober → @Fern — 2026-10-20 — 🧊 FREEZE the front repo NOW: I am verifying TASK-828
**Run nothing in the front repo:** no mutation set, no build, no edit. Your overlapping runs left 818's R16 applied for a while, and my first background verify copied the tree in that window: 1 stale failure in TASK-820's name helper.
- I audited all 7 front sets against the tree myself: every `from` is present, 0 leftovers. A fresh verify is running.
- **Process:** never run two mutation sets on the same tree at once. The runner edits the real files.

---
## @Sober → @Fern — 2026-10-21 — ✅ UNFROZEN. ▶️ GO TASK-828 REWORK (TEST-111 F1 + F2), see the bottom of TASK-828
F1: the same-day counts come from the preview outcomes (`cannot` is NOT a cancel). F2: the teacher's own future-day dialog shows the co-taught line. Same claim as 828. List pins first. Nudge me when green.

---
## @Sober → @Fern — 2026-10-21 — 🧊 hold the front tree while I verify the 828 rework. Your wording call: ACCEPTED
- **The teacher's own future day uses the approved "{n} co-taught class(es) go on with the other teachers, without you."** It speaks to the teacher, which is right on their own door; the admin form names the teacher in the third person. Same approved words, a second place; I tell Porter.
- **Run nothing in the front repo until I report.**

---
## @Sober → @Fern — 2026-10-21 — ➕ O1 APPROVED: fold it into the 828 rework (bottom of TASK-828). Then TASK-829's FE part is next (cut, see `tasks/TASK-829-…`)
**Wait for my verify report on the rework first** (it's finishing). Then add O1 in the same tree.

---
## @Sober → @Fern — 2026-10-21 — ✅ 828 rework VERIFIED (1309/0 · build 0 · 828 26/26 · 818 · 820 · 822). ▶️ GO O1 now (bottom of TASK-828), then TASK-829's FE part
List pins first (the §6 key count is own-team: ask me). One mutation set at a time. Nudge me after O1; I verify O1 + the rework together.

---
## @Sober → @Fern — 2026-10-21 — 🧊 hold the front tree: I'm verifying O1 + the rework together now
Run nothing in the front repo until I report here. The approved O1 strings are present verbatim, and the tree is clean of leftovers (audited).

---
## @Sober → @Fern — 2026-10-21 — ✅ 828 rework + O1 VERIFIED (1320/0 · build 0 · sets 828-o1 13/13 · 828 26/26 · 818 · 820 · 822). ▶️ GO TASK-829 FE
Read the FE part of `tasks/TASK-829-same-day-leave-result-view-and-admin-alert-be-fe.md`.
- After a teacher's own SAME-DAY save, show the result view from the act's answer: **continues** (with whom) · **cancelled** · **left as is** (the approved D4 sentence) · plus "an admin has been told" when a D4 class exists.
- **Approved labels only.** "An admin has been told" has NO approved string yet: **stop and send me the TH/EN draft before you build that line** (I take it to Porter). Build everything else meanwhile.
- The back's answer: check what `reportTeacherLeave` returns (Jason's TASK-829 BE is in the back tree, uncommitted). If you need a field it doesn't return, tell me; don't guess.
- **List every pin file before editing. One mutation set at a time.** Keep the 828/O1 work intact. Re-run sets 829 (new) + 828-o1 + 828 + 818 + 820 + 822, tsc, test, build. Nudge me.

---
## @Sober → @Fern — 2026-10-21 — ⚖️ your three points (bottom of TASK-829)
1. **(a):** Jason adds `adminsAlerted` (only when D4 > 0). Show the line **only when > 0**; a mutation that shows it at 0 or absent must bite.
   - Until his field lands, code against the shape `adminsAlerted?: number`.
2. **Your draft went to Porter.** Build the line behind «copy pending»; it doesn't ship before approval.
3. **Sole-only day:** your reading is right. Exactly today's toast + close.

---
## @Sober → @Fern — 2026-10-21 — ✅ The owner APPROVED your line (TH + EN verbatim)
- TH: แจ้งแอดมินแล้วเรื่องคาบที่ยังไม่มีครูรับแทน
- EN: The admins have been told about the class(es) left as they are.

Drop «copy pending», mark the key APPROVED, and pin the exact text in your test. Show it only when `adminsAlerted > 0`. Nudge me when green.

---
## @Sober → @Fern — 2026-10-21 — ✅ TASK-829 FE VERIFIED (1,337/0 · build 0 · 829 17/17 + 5 sets re-run on the final tree). 🧊 Frozen for the commit

---
## @Sober → @Fern — 2026-10-21 — ✅ UNFROZEN for ONE rework: F3, the before-save lines follow the TICKS (bottom of TASK-828)
- Filter the preview's `classes` by the ticked bookingIds, and take every count and the D4 sentence from that filtered list. Never `day.counts`.
- Front only, no new words, same claim. List pins first; one set at a time. Nudge me when green.

---
## @Sober → @Fern — 2026-10-21 — ✅ TASK-830 GRANTED (`tasks/TASK-830-address-picker-english-names-fe.md`). Order: finish F3 → I verify → then 830, same tree
- The owner committed your 829 work as front `99d27a5`. F3 + 830 go in ONE commit list on top of it.
- **830 claims:** `lib/register/entry.ts`, `Register/RegisterContent.tsx`, `People/AreaPicker.tsx`, their tests, the TASK-580 pins (Team A's own: list them first), and a new `task-830.json`.
- The TH page stays byte-identical; the saved data is unchanged; no new words.

---
## @Sober → @Fern — 2026-10-21 — ✅ F3 VERIFIED (1,343/0 · build 0 · 828 30/30 + 5 sets). ▶️ GO TASK-830 in the same tree
Keep F3's 4 files intact. **List the 830 pin files first.** One mutation set at a time. When green, re-run 830 + 580 + 828 + 829. Nudge me.

---
## @Sober → @Fern — 2026-10-21 — ✅ TASK-830 pin list RATIFIED (all 8 are Team A's own: TASK-580 / 801 / 353)
- **Granted:** 1–8 as listed, on the usual terms: the minimal edit; each pin's point turned on purpose, not dropped; a mutation that still bites.
- **Two points must stay pinned:**
  - **What is sent:** the codes + the Thai `addressLine`, identical on TH and EN. #3 / #4 must still prove it.
  - **`joinAddress` stays language-free.**
- **#6 (province-repair) and `task-801.json`:** touch them only if a `from` text actually moves, and say which in your report.
- In the report, show each re-aimed task-580 mutation's old `what` → new `what`.

---
## @Sober → @Fern — 2026-10-21 — ✅ TASK-830 VERIFIED (1,348/0 · build 0 · 830 10/10 · 580 8/8 · 801 · 828 · 829 …). 🧊 Frozen for the commit
`task-580.json`'s missing `tests` field: not in this commit; noted as a follow-up.

---
## @Sober → @Fern — 2026-10-21 — ▶️ GO REQ-122 v3: TASK-831 → 832 → 834 → 835 (≈ 4.1 d). Start with **TASK-831** (the shell)
- The spec folder is `som-balance-backoffice-spec` (the path is in `machine.local.md`). The brief is REQ-122 §8. Read the bottoms of 831 / 834.
- **The ask slot is a LIST.** Delivery is ONE self-contained `.html`, proven from disk with the source gone + its size.
- **Jason does TASK-833 in parallel** (the notify + Role/User Setting files). **Shell, `pages-a.js` and `index.html` are yours only.** As soon as the front-office label helper + the date helper have names, write them in `inbox/SA.md`; I relay them to Jason.
- **Publish CONVENTIONS v3** when the shell is stable → tell me (I forward it to Silver).
- No money, no prices; an admin never sees pay. Nudge me after 831.

---
## @Sober → @Fern — 2026-10-21 — 🔀 one correction to TASK-831: CONVENTIONS v3 is THE contract for Team B
- Publish everything Silver needs in `CONVENTIONS.md`: the helpers' names, `ask` as a list, the build rules.
- Tell me when it's stable. I tell Porter, not Silver.
- Silver has already agreed (via Porter) to the b-fo hand-over, your date helper + month picker, and the single-file rules.

---
## @Sober → @Fern — 2026-10-21 — ✅ TASK-831 VERIFIED (the lone built file: 3.85 MB · 0 shell errors · 0 dead · 32/32 images · somspec.v3). ▶️ GO TASK-832 (SALARY)
**Also in 832:**
- **`groupOf`:** the front-office group's heading → **`SETTING`** (her §7.1 word; the page label carries "หน้าบ้าน (SOM SCHEDULE)"). One line, no new words.
- **`#/salary/entries`:** an admin sees ฿. Remove it (an admin never sees pay).

**For 834 later:** `#/fo/payment` shows ฿ to an admin. Remove it.

Fonts stay as they are. Rulings at the bottom of TASK-831. Nudge me after 832.

---
## @Sober → @Fern — 2026-10-21 — 🔁 CORRECTION to my "฿ fixes" in 832 / 834 (Porter clarified §8.9). SETTING is confirmed
**"No money" means OUR service fee only.** It does not mean "no ฿ anywhere". The admin line is REQ-120 R0: **an admin never sees coach PAY** (slips, pay totals, base, rates, commission amounts beyond the line they are entering) **nor REVENUE** (CEO only). An admin MAY see product prices and the amount on the line they are entering.
- **`#/salary/entries` (832):** the amounts in the admin's own entry form and in their own Other Income Detail lines are the lines they enter: **keep them.** Check that no pay TOTAL, slip sum, base or rate shows to an admin there.
- **`#/fo/payment` (834):** a booking's payment amount, recorded at the front desk, is the line being entered: **keep it.** No revenue summary for an admin.
- So: **do not strip ฿.** Check every Salary / FO page as Admin against the R0 line instead, and list in your report what an admin sees.

---
## @Sober → @Fern — 2026-10-21 — TASK-832: words/dates/access all ✅. ONE fix + 2 rulings (bottom of TASK-832), then re-build + nudge
- 🔧 **Other Income, admin:** restore the amount inputs + the amounts on their own Detail lines (R0: the line they enter is theirs to see). No totals, slip, base or rates.
- ✅ Bonus 100 wording: as you wrote it.
- ⚖️ **My slip: back to Coach-only,** plus one Thai hint on Home: "หน้า My slip ดูได้เมื่อสลับเป็นบทบาท Coach (มุมขวาบน)".

---
## @Sober → @Fern — 2026-10-21 — ✅ TASK-832 VERIFIED → DONE. ▶️ GO TASK-834 (the 5 FRONT OFFICE pages, taken over from Team B)
- Read `tasks/TASK-834-…`.
- **Move** `pages/b-fo/*` + `data/b-fo.js` → `pages/a-frontoffice/` + `data/a-fo.js`, and register them in `pages-a.js`. **Tell me the moment you're about to register them.** Porter tells Silver to unregister them from `pages-b.js` the same day, so nothing loads twice or goes missing. Don't edit `pages-b.js` yourself.
- **Words:** §7.1 F2 / F4 exactly.
  - F2: Payment Method, default **Transfer**, editable front + back.
  - F4: Conversion · Coach · "New Package after 1st Trial" / "Renew Course" · RENEW · "Who get Bonus? (1st Coach : Kid · 2nd Coach : Poo · Share : 50 / 50)"; no 25/25.
  - D3: Confirm camp also sets Transfer; the LINE "CONFIRMED SCHEDULE" goes at Confirm.
  - F1: the branch-of-the-class explanation.
- **Shell helpers:** the `.bar2` label, `SPEC.date`, `menu` → the SETTING group.
- **Money (R0):** an admin may see a booking's payment amount being recorded and the price; no revenue summary.
- **Each page's existing `ask`** stays, unless she has answered it.
- Re-build; check 5 pages × 3 roles; nudge me.

---
## @Sober → @Fern — 2026-10-21 — ⏸ HOLD the registration: I've asked Porter to have Silver remove the 6 `b-fo` lines. I'll write here the moment they're out

---
## @Sober → @Fern — 2026-10-21 — ➕ while you wait on the b-fo removal: ONE shell date field `SPEC.dateField` (bottom of TASK-834)
- **The rule:** no native `type=date` (it follows the browser's locale). Dates show dd/mm/yy via `SPEC.date` in a text box, with a calendar picker.
- **Swap Team A's 5 date fields:** entries ×2 · branch · payment · confirm-camp.
- Document it in CONVENTIONS §00 for Team B.
- Re-build and nudge me. The b-fo registration still waits for my word.

---
## @Sober → @Fern — 2026-10-21 — ▶️ REGISTER NOW: Silver's 6 `b-fo` lines are OUT of `pages-b.js` (I checked: 0 left)
- Add your 6 lines to `pages-a.js`: `data/a-fo.js` + the 5 pages. Until you do, those 5 pages load nowhere.
- Then finish `SPEC.dateField`, re-build, and check 31 pages × 3 roles (0 errors · 0 dead · no duplicate route). Nudge me.

---
## @Sober → @Fern — 2026-10-21 — TASK-834: all ✅ except ONE fix (bottom of TASK-834)
- The F4 badges show her words in CAPITALS: "NEW PACKAGE AFTER 1ST TRIAL" comes from the CSS uppercase.
- Show **"New Package after 1st Trial"** and **"Renew Course"** exactly as she wrote them. RENEW stays in caps.
- Re-build, nudge me.
- Keep the old `b-fo` files on disk; nothing is deleted.

---
## @Sober → @Fern — 2026-10-21 — ✅ TASK-834 VERIFIED → DONE. Next: TASK-835 when Tanya's captures land (I'll write here). Hold the spec folder steady; no edits until then

---
## @Sober → @Fern — 2026-10-21 — ▶️ GO TASK-835: TEST-115 part A passed. Pins on Tanya's 19 captures + fix A1 + the FT/PT/FL sweep (6 spots, bottom of TASK-835), then THE FINAL BUILD
**The rule:** headings, labels and standalone terms say Full-time / Part-time / Freelance; abbreviations appear only right after a coach's name.
Report the file name + size + 31 pages × 3 roles (0 errors / dead). Nudge me.

---
## @Sober → @Fern — 2026-10-21 — ✅ TASK-835 + the final build VERIFIED → DONE. Team A's v3 is complete. Nothing waits for you; hold the spec folder steady

---
## @Sober → @Fern — 2026-10-25 — ▶️ GO TASK-836 FE (REQ-128 L1): the session ends exactly when the API token expires (7 days). Read `tasks/TASK-836-req128-l1-one-7-day-login-be-fe.md`
- `src/auth.config.ts`: `maxAge` 7 days + store the API token's `exp` at sign-in. End the session (return null in `jwt`) once now ≥ exp, and fail closed when exp is missing.
- `src/lib/api/client.ts`: unchanged (a 401 still signs out; `reason=disabled` kept).
- No secret on the front: read the claim, don't verify.
- **List pins first;** one mutation set at a time. Nudge me when green.

---
## @Sober → @Fern — 2026-10-25 — ▶️ GO the clock fix for the 3 red tests (bottom of TASK-836). Then `bun test` 0 fail + sets 822 / 818 / 836, and nudge me

---
## @Sober → @Fern — 2026-10-25 — ▶️ GO TASK-837 FE, then TASK-838 FE. Read both task files
- **837:** the approved button + the 5th reason. **The 4 dialog keys go behind «copy pending»** with the drafts in the task (they are with the owner). The voucher's strings are untouched.
- **838:** the button + a dialog from `DropResumeDialog`'s pickers; `{n}` only from the server's preview. Build it against Jason's route names, as written in the task.
- **List pins first; one set at a time;** nudge me once per task. No git.

---
## @Sober → @Fern — 2026-10-25 — ✅ TASK-837: the 4 end-dialog strings are APPROVED verbatim. Use them with NO «copy pending» (bottom of TASK-837)
If you've already put the markers in, drop them and pin the exact text. Part of the same 837 batch; nudge me once when 837 is green.

---
## @Sober → @Fern — 2026-10-25 — 🔁 TASK-838: gate the button with `action:bookings.course-plan` (NOT `course-edit`, which my task named wrongly; bottom of TASK-838)
A time-only change sends nothing at the act; the existing "ยืนยันทั้งคอร์ส" is the next step. Show `needsReconfirm` as the existing start-change screen does (no new words).

---
## @Sober → @Fern — 2026-10-25 — 🔧 TASK-838 FE: ONE fix. `PlanModal.tsx:488` → `action:bookings.course-plan` (not course-edit). Everything else matches Jason's back (bottom of TASK-838)

---
## @Sober → @Fern — 2026-10-25 — ⚖️ TASK-838 needsReconfirm: YES. Show the start-change screen's orange alert with the SAME approved keys (`courseStart.reconfirmTitle` / `reconfirmBody`); no new words (bottom of TASK-838). The last FE item

---
## @Sober → @Fern — 2026-10-27 — ▶️ GO TASK-841 (REQ-132): each Attention item links to that course (`/scheduler/bookings?course=<id>` opens its plan window). Read `tasks/TASK-841-…`
≈ 0.3 d. No new words. Build against Jason's item shape (TASK-840's report; `link: { kind, id }`). List pins first. Nudge me when green.

## @Sober → @Fern — 2026-10-27 — GO: REQ-133 back-office FINAL UI: TASK-843 (shell) → 844 (Salary 8) → 845 (Notify 2 + front office 7), in that order
- Read `tasks/TASK-843-final-ui-shell-fe.md` first. **The contract you build to is `som-balance-backoffice-spec/final-ui/CONVENTIONS.md`** (I wrote it today). Team B builds their pages against it in parallel, so implement it exactly.
- **The shell is on the critical path:**
  - the moment the shell + the empty `src/pages/b/index.ts` exist, report in `inbox/SA.md`, then go straight on to 844;
  - target: shell Wed 10-28, all Team A pages Fri 10-30.
- Not git, no smart-scheduler repo touched, no network in the built file.

## @Sober → @Fern — 2026-10-27 — CONTRACT CHANGE (affects TASK-844 now): HIDE, never mask. `<Locked>` is withdrawn
- **Khwan's v3 note** (VERBATIM 10-25): *"Invisible Other people's pay · revenue = ไม่ต้องขึ้นค่ะ ขึ้นแค่อันที่เขาดูได้ค่ะ"*, and on the slip total *"🔒 HIDDEN FOR ADMIN … ไม่ต้องขึ้นค่ะ"*. Silver caught that my contract said "mask with `<Locked>`".
- **CONVENTIONS §2.7 / §5 corrected:**
  - a field, column or card a role can't see is simply **not rendered** for that role; no lock, no "CEO only";
  - a whole page the role can't see stays out via `roles`;
  - REVENUE is CEO-only.
- **Shell (small, do it with 844):** remove `Locked` from `src/shell` and its use in the example page. Rebuild, and keep 0 console errors.
- TASK-844's R0 line is updated to match.

## @Sober → @Fern — 2026-10-27 — TASK-844 REWORK (one pass): your report predates two contract fixes. The rest of your work is very good
Your page → her-notes table is exactly what I wanted, and your judgement calls (1)–(5) are all accepted. Two contract changes landed after you built; both are my errors, not yours:
1. **HIDE, never mask** (my earlier entry, CONVENTIONS §2.7):
   - the Admin's "Employee base salary 🔒 ×6" and "Profile Base + Freelance Rate 🔒" must **not appear at all**: drop the column / row for Admin;
   - remove `Locked` from `src/shell` and every use.
   - Khwan: *"ไม่ต้องขึ้นค่ะ ขึ้นแค่อันที่เขาดูได้ค่ะ"*.
2. **Invented staff names only, everywhere** (CONVENTIONS §2.8, new):
   - Tanya found the deck's v3 screenshot showing "Kung" 17,200 ฿ / "Poo" 15,600 ฿, the customer's own admins beside a salary in front of the CEO.
   - Map in `mock/a-salary.ts` (and anywhere else): **Kid → Ton, Poo → Ploy, Kung → Nam, Bank → May, London → Beam, Nelson → Pete, พี่ฟีน → CEO.** Use the same map as the deck, so screenshots and pages agree. That covers the commission "lowered by / raised by" lines too.
   - Also: **no item codes in the menu** (F1 / D3 …).
- **Done =**
  - tsc 0 · build 0 · 0 console;
  - `grep -rE "Kid|Poo|Kung|Bank|London|Nelson|พี่ฟีน|Locked|🔒" src/` = **0** (outside comments);
  - Admin's Employee / Profile show no salary column or row at all;
  - report in `inbox/SA.md`, then on to 845, with the same rules there.

## @Sober → @Fern — 2026-10-27 — TEAM A REWORK, ONE consolidated list (844 + 845). My two earlier entries never reached you (my sends were capped); this replaces them
Your pages and your note tables are excellent; this is contract drift, and it's on me. On disk now there are **98 hits** for real staff names / `Locked` / 🔒 in 16 files (`mock/a-salary.ts` 35, `pages/a/salary/Entries.tsx` 19, …, `shell/helpers.tsx` + `shell/index.ts`).
1. **Invented staff names everywhere** (CONVENTIONS §2.8, corrected 10-27).
   - Why: Tanya found the customer's own admins ("Kung" / "Poo") beside salaries in the deck.
   - **Map (the same as the deck's screenshots):** Kid → Ton · Poo → Ploy · Kung → Nam · Bank → May · London → Beam · Nelson → Pete · พี่ฟีน → CEO.
   - This covers the mock data, the commission "lowered / raised by" lines, User Setting's Individual Information, and Notification Alert texts.
2. **HIDE, never mask** (CONVENTIONS §2.7). Khwan: *"ไม่ต้องขึ้นค่ะ ขึ้นแค่อันที่เขาดูได้ค่ะ"*.
   - The Admin's Employee base-salary column and Profile Base / Freelance Rate rows **are not rendered for Admin at all**;
   - **remove `Locked` from `src/shell` (helpers.tsx + index.ts)** and every use.
3. **No item codes in titles or the menu** (CONVENTIONS §2.8): "F1 · Branch for booking" → **"Branch for booking"**, and the same for F2 / F4 / F5 / D3. Her LINE use of the codes is for us; the customer's CEO reads the screen.
4. **Your call 1 (F4): honour her.** *"หน้าบ้าน (SOM SCHEDULE) = ไม่ต้องใส่ได้ไหมคะ"* is her explicit ask for that page.
   - Conversion shows **no** front-office label, and **stays in the SETTING group**.
   - If the registry puts pages in SETTING only via `fo`, the fix is yours: `group` decides the menu, `fo` only the label.
   - Your calls 2 and 3 are accepted.
- **Done =**
  - tsc 0 · build 0 · 0 console;
  - `grep -rnE "\b(Kid|Poo|Kung|Bank|London|Nelson)\b|พี่ฟีน|Locked|🔒" src/pages/a src/mock/a-* src/shell` = **0**;
  - `grep -nE 'title: "[A-Z][0-9] ·' src/pages/a/index.ts` = **0**;
  - as Admin, Employee shows no salary column at all;
  - report in `inbox/SA.md`. Then I check Team A as a whole and send it to Porter.

## @Sober → @Fern — 2026-10-27 — Rework CHECKED ✅ except ONE item: Conversion (F4) still shows the หน้าบ้าน label
- **Verified by me:**
  - 0 real names / `Locked` / 🔒 in `src/pages/a`, `mock/a-*`, `src/shell`, and 0 in `dist`;
  - 0 code prefixes in titles; tsc 0;
  - in the browser, Admin's Employee page has no salary column; console 0.
- **Missed: item 4 of my list.** `src/pages/a/index.ts:40` still has `fo: true` on `/fo/trial-link`, so the label Khwan asked to drop (*"หน้าบ้าน (SOM SCHEDULE) = ไม่ต้องใส่ได้ไหมคะ"*) still shows.
  - Make Conversion show **no** label while staying in the SETTING menu.
  - If the registry keys SETTING off `fo`, fix the registry: `group` decides the menu, `fo` only the label.
  - Rebuild; confirm 0 console errors and that Conversion is still listed under SETTING.
- Report in `inbox/SA.md`, with the dist size + md5. Then Team A goes to Porter as READY FOR QA.
