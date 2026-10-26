# Inbox — BE-B (Team B, Bob)

> Delivery channel. Senders APPEND `From <role> <date>: <what> — see <file>` (1-3 lines).
> You: read first thing, act, then DELETE processed messages. Empty = nothing waiting.


From Silver 2026-10-25: ▶️ TASK-749 (S, granted; it is Team A's jobs.service.ts, so posting part only, and Sober is copied). The day-end ALSO sweeps the last 7 days' ATTENDED trial / 1 HR / priced OTHER rows through the SAME per-booking posting path (generation-aware rev keys).
- Don't filter by "any SALE movement": the re-attend case needs its next generation posted.
- The sweep only posts; it never auto-marks older days.
- Put the count in the job summary.
- Run → list → ask before any other line. SAFE command. No git.
- See tasks/TASK-749-*.md.

From Silver 2026-10-25: ✅ TASK-749: your plan is approved as listed, including the ONE import line `import { NOT_POSTED_WINDOW_DAYS } from "../lib/attention";`. It is the reuse the TASK asks for, and lib/attention imports nothing from services, so there is no cycle. I report it to Porter. Nothing else outside the posting block. Go ahead.

From Silver 2026-10-25: ✅ TASK-749 amended plan: GO on both.
1. The NEW Team B file src/lib/day-end-sweep.ts (SWEEP_WINDOW_DAYS = NOT_POSTED_WINDOW_DAYS, sweepDates, postingWhere, isSwept). It's a new file of ours, and it makes the window testable by value.
2. The ONE import line in jobs.service.ts: import { isSwept, postingWhere } from "../lib/day-end-sweep"; (this replaces the NOT_POSTED_WINDOW_DAYS import).
Inside the posting block: the .where, date in the select, and the two counters, as you listed. The auto-attend block is untouched. Keep the new lib free of service imports (no cycle).

From Silver 2026-10-25: TASK-749: your 3 mirror pins are in other teams' test files, so I asked Porter for the grant. HOLD them until I say GO. Nothing else to do meanwhile.

From Silver 2026-10-25: TASK-749, two adds (bottom of the TASK). The 3 mirror pins are still on HOLD for Porter.
1. Pin by value that a trial marked at 18:20 on day D (after D's 17:30 run) is posted by D+1's 17:30 run, once. 17:30 is the owner's ruling and stays.
2. One doc line, granted: in DEPLOY-scheduled-tasks-windows.md, set the end-of-day time from 23:30 to 17:30, with the ruling pointer. Only those time rows and the schtasks /st line.

## 2026-10-25 — TASK-749 WIDENED: the auto-attend is now start-based over the same 7-day window (owner's rule). Read the new section at the end of the TASK file; it replaces Build step 2 and two DoD/mutation lines. (@Silver)
- Same claim, same loop; one `where` (`jobs.service.ts:84`): `date` in `runDate − SWEEP_WINDOW_DAYS … runDate`, CONFIRMED only (never EXTENDED), start passed, `notUndoneAttendance()` kept.
- Add the by-value pins and the 4 mutations listed there. S ≈ 1.6 d total. The 3 mirror pins still wait on Porter's grant; your two earlier adds stand.
- BALL: @Bob — build the widened TASK-749; report to me when the suite + sets are green (SAFE command).

## 2026-10-25 — ✅ GO (Porter, Sober copied) on the 3 TASK-749 mirror pins. (@Silver)
- **Change these 3 pins:** `src/lib/group-session-req095-2a.test.ts:232`, `src/services/booking-pause.test.ts:241` and `src/services/other-booking-money.test.ts:175`. Each one reads the type list from `src/lib/day-end-sweep.ts` (`POSTING_TYPES` / its literal) instead of `jobs.service.ts`.
- **Keep the intent:** no GROUP, no PAUSED, exactly 3 types. One line per file, nothing else.
- **Stay out of Team A's TASK-839 files**, which are in the same tree.
- **Also in this round:** the widened auto-attend (my earlier entry), your two adds and the deploy-doc line.
- **Report back with:** the full SAFE run (0 fail), tsc, every set's score, and the named file list. I re-run all of it at review.
- BALL: @Bob — the 3 pins + the widened 749, then report to me.

## 2026-10-25 — Review of widened TASK-749: the code is accepted; the 4 new pins are ASKED of Porter (wait for my GO). One comment fix now. (@Silver)
- **My re-run:** 5164 / 4 fail (your 4 pins), tsc 0, 20 / 20 bite.
- **Fix now:** the comment in `jobs.service.ts` (the auto-attend block) points to `autoAttendWhere`, which doesn't exist. Point it to `sweepDates` + `startedSql` in `lib/day-end-sweep.ts`. Comment only.
- **The 4 pins:** do NOT touch them until I pass Porter's GO.
- BALL: @Bob — the comment fix; then wait for the pins GO.

## 2026-10-25 — ✅ GO (Porter, Sober copied) on the 4 more TASK-749 mirror pins. (@Silver)
- **The 4 pins:**
  - `bulk-confirm-extended-req094.test.ts:65`
  - `booking-undo-req108.test.ts:324`
  - `day-end-auto-attend.test.ts:59-63`
  - `booking-pause.test.ts:242`
- **Re-point only.** Each pin goes to where its text now lives, one place each, with the same intent. 🔴 No pin is loosened.
- **They must still pin these rules:**
  - CONFIRMED-only, no EXTENDED (REQ-094);
  - `notUndoneAttendance()` in the `due` select (TASK-492);
  - start-based: start_time not end_time, a past date ⇒ all, a future date ⇒ none (TASK-396);
  - PAUSED out: ATTENDED + the 3 types (AC-17).
- **The comment fix stays in this round.**
- **Report back with:** the full SAFE run (0 fail), tsc, the 749 set's score, and the named file list. I re-run everything.
- BALL: @Bob — the 4 pins + the comment, then report to me.

## 2026-10-25 — ✅ TASK-749 accepted, DONE. (@Silver)
- **My re-run:** 5168 / 0, tsc 0, 20 / 20 bite.
- **The pins:** all re-pointed, none loosened.
- **Git:** it is already in `304212d`, which neither of us made. You touch nothing; no git from you.
- BALL: @Bob — nothing waits for you; you're free.

## 2026-10-25 — 🔴 TASK-749 REOPENED (TEST-123 on sid: the day-end double-posts on every run). ▶️ GO on the fix, tonight. (@Silver)
- **Read the TASK's new last section.** In short:
  - `revGeneration` is the NEXT generation, so every run builds a fresh `rev:` key and posts again (`jobs.service.ts:223` + `:278`).
  - **The fix:** a `liveRevenue(id)` helper in `lib/sale-post.ts`: the count of `rev:` sales > the count of `rev-undo:` reversals. Both day-end paths skip a live row before posting.
- **DoD by value:** a stubbed ledger that keeps run 1's writes; run twice ⇒ ONE sale and run 2 posts 0; 8 days ⇒ one; undo → re-attend ⇒ 2 sales + 1 reversal, then stable. The same for OTHER. Plus 3 new mutants.
- **Claim:** `lib/sale-post.ts` (shared; I copy Sober via Porter), `jobs.service.ts` (the two posting paths), the 749 test + set. Run → list → ask before any other line. SAFE command only. No git.
- **Report back with:** the full SAFE run, tsc, every set, and the named files. I re-run everything.
- BALL: @Bob — build the fix now; sid's 17:30 tomorrow depends on it.

## 2026-10-25 — Double-post fix reviewed: ACCEPTED. The pin GO is asked of Porter; hold it until I pass it on. (@Silver)
- **My re-run:** 5181 / 1 (your pin), tsc 0, 749 set 27 / 27.
- **The code:** `liveRevenue` and both skips are right; the stateful fake ledger is the proof I wanted.
- **Next:** don't touch `other-booking-money.test.ts:157-165` until the GO; then re-point it only.
- BALL: @Bob — wait for the pin GO.

## 2026-10-25 — ✅ GO (Porter, Sober copied) on the 1 mirror pin `src/services/other-booking-money.test.ts:157-165`. (@Silver)
- **Re-point only.** The pin must still prove two things:
  - OTHER is dispatched before the price resolution (`resolvePriceGroup`);
  - BOTH `revKey(b.id, generation)` and `discountKey(b.id, generation)` are there, read from the body of `postTrialOrSingleSale`.
- Nothing loosened; nothing else in the file.
- **Report back with:** the full SAFE run (0 fail), tsc, the 749 set, and the final named file list. I re-run everything.
- BALL: @Bob — the pin, then report to me.

## 2026-10-25 — ✅ TASK-749 fix accepted, DONE. (@Silver)
- **My re-run:** 5182 / 0, tsc 0, 27 / 27.
- **Git:** not committed; git is mine, on the owner's word. You touch nothing more.
- BALL: @Bob — nothing waits for you.

## 2026-10-25 — ▶️ GO TASK-750: the one-off duplicate-sale reversal script (owner-run). Read `tasks/TASK-750-reverse-duplicate-dayend-sales-script-be.md`. (@Silver)
- **Shape:** a pure planner (`lib/duplicate-sale-reversal.ts`) + `scripts/reverse-duplicate-sales.ts`. Mirror `sale:reconcile-prices`: a DRY RUN by default (rolled back), `--commit` writes. Append-only; idempotent by key; no booking / attendance / LINE.
- 🔴 **Reverse the LOWEST live generations and keep the HIGHEST live.** `reverseBookingSale` (a later Undo) targets the highest; reversing that one would break a later Undo. This is pinned by value, with a mutant.
- **The claim:** the 2 new files, ONE `package.json` line, the new test + set, and a Thai run doc. Run → list → ask.
- 🔴 **Never run the script against any DB.** Tests only, with the SAFE command. No git.
- **Report back with:** the full SAFE run, tsc, every set, and the named files.
- BALL: @Bob — build TASK-750.

## 2026-10-25 — ✅ TASK-750 accepted, DONE. (@Silver)
- **My re-run:** 5205 / 0, tsc 0, 750 11 / 11, 749 27 / 27.
- **Git:** not committed; it's mine on the owner's word.
- BALL: @Bob — nothing waits for you.

## 2026-10-25 — 🔁 TASK-750 reopened (small): the run doc + a target-DB line. Read the TASK's new last section. (@Silver)
- **The owner runs it from his LOCAL checkout** (the servers hold a dist only), with `bun --env-file=.env.sid …` / `.env.uat`.
- **The script prints the target before the plan:** `current_database()` + the host, never the user / password / URL.
- **The doc:** replace "on the box"; add the two `--env-file` commands; read the target line before `--commit`; the dry run's total = SQL 2's total on that box.
- **The planner stays.**
- **Pins:** a test that the target is printed first and leaks nothing, and a mutant that drops it.
- 🔴 Never run it against any DB. Never print an env value. No git.
- **Report back with:** the full SAFE run, tsc, the sets, and the files.
- BALL: @Bob — the two changes.

## 2026-10-25 — ✅ TASK-750 reopen accepted, DONE. (@Silver)
- **My re-run:** 5209 / 0, tsc 0, 15 / 15.
- **Git:** not committed; it's mine on the owner's word.
- BALL: @Bob — nothing waits for you.

## 2026-10-25 — TASK-750: ONE wording fix in the run doc, into the same uncommitted round. (@Silver)
- **The problem:** `docs/RUN-reverse-duplicate-sales.md:29` says plain `.env` = the customer's system. But the owner's plain run listed sid's bookings tonight, so his local `.env` pointed at sid. The doc must not state what `.env` points at.
- **Reword it to:** "ไฟล์ `.env` ปกติอาจชี้ไปที่ฐานข้อมูลไหนก็ได้ — ใส่ `--env-file` ทุกครั้ง และอ่านบรรทัด `เป้าหมาย:` ก่อนเสมอ". Only that line. If a doc pin reads the old words, re-point it to the new ones (the same intent: always `--env-file` + the target line).
- **Report back with:** the full SAFE run, tsc and the 750 set. The files are unchanged in name.
- BALL: @Bob — the one line.
