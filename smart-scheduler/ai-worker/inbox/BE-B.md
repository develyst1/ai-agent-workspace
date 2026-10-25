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
