# HAND-OFF — REQ-111 Team B (A · B · D · H) is ready for a `sid` batch — @Silver → @Porter, 2026-10-03
**I am telling you BEFORE anything deploys, as you asked. Nothing has been deployed, and nothing is committed (git is the owner's).**

## What is ready
| TASK | Item | Repo | Files the owner deploys | Status |
|---|---|---|---|---|
| TASK-607 | H — freelance rows behind `teachers.budget-view` | back | `src/lib/budget-visibility.ts` · `src/routes/api.ts` (+ tests) | ✅ DONE — REVIEWED |
| TASK-621 | B — Confirmation results shows names | front | `partials/Bookings/BookingsTable.tsx` (+ test) | ✅ DONE — REVIEWED |
| TASK-622 | D — a leave day shows on the grid cells | front | `CalendarContent.tsx` · `CalendarGrid.tsx` · `CalendarWeekGrid.tsx` · `lib/scheduler/teacher-scope.ts` (+ tests) | ✅ DONE — REVIEWED |
| TASK-620 | A — Fern's message list | back (a script only; **nothing to deploy**) | the workbook is with you for the owner's review | ✅ DONE — REVIEWED |

- **No migration. No new wording.**
- Re-run by me on 2026-10-02/03: back TASK-607 tests 18/0 · front full suite **934/0**, typecheck exit 0.
- 🔴 **Porter's rule of 10-03 applies to those counts: they are NOT an "all green" claim.**
  - **The back tree also holds Team A's uncommitted work** (TASK-608/609: `scheduler.service.ts`, `route-access.ts`, `line-i18n.ts`, `line-message.ts` and more). My 18/0 was a targeted run, not the tree.
  - **The front tree held only Team B's files** at my 934/0 run (checked with `git status`, 10-03).
  - The gate is both SAs green at the same moment.
- 🔴 **TASK-620's workbook is STALE (found 10-03):** Team A's TASK-608 added two teacher notifications, `teacher_leave_recorded` and `teacher_leave_lifted`.
  - The script's drift guard now refuses to run until they are listed.
  - The workbook should be regenerated when Team A's copy is final, before it reaches the owner.
- ⚠️ **Other changes are in the same trees.** Team A's work (TASK-608+) is in the same back repo and is not part of this list. When the owner deploys, the batch is whatever is on the tree; that is your call with Sober's status.

## 🔴 One deploy step (owner's accepted consequence, REQ-111 §6.6)
**Grant `action:teachers.budget-view`** to whoever should see the freelance drawn/refunded rows. Without it, **no admin sees them, Khwan included.**

## The real clicks the engineers could NOT do (no local stack on this machine; they correctly did not write to a shared box)
For the post-deploy `sid` check, through QA:
1. **B:**
   - set the status filter to Extended;
   - bulk-confirm several rows, including one on a paused course;
   - every line in the dialog must show a name and never an id.
   - ⚠️ Bulk confirm messages the teachers, so use rows with no linked LINE account.
2. **D:** record a leave day for a test coach. In week view and in day view:
   - empty cells are grey with no `+`;
   - an existing class carries the grey icon and still opens;
   - the coach's other days are untouched.
3. **H:**
   - an admin **without** the key opens a course's history: no "Freelance budget drawn / refunded" rows;
   - **with** the key: the rows are there.

📌 All of these are web-app checks. **None needs a phone.**

### API routes for QA to exercise (added 2026-10-04, at Porter's request)
- **H, `GET /api/courses/:id/history`**, for a course that has a freelance coach. Expected results by caller:

  | Caller | Expected |
  |---|---|
  | token **with** `action:teachers.budget-view` | `events` include `kind` `freelance-drawn` / `freelance-refunded` |
  | token **without** the key | those two kinds are absent, every other event is identical in count and order, and `summary` is unchanged |
  | a **linked teacher** token | **403 `SCOPE_TEACHER`** |
- **B, `POST /api/bookings/bulk-confirm`** with `{ ids: [...] }`. The response is `{ results: [{ id, outcome, reason? }] }`, unchanged by TASK-621 (the fix is in the screen).
  - Check that each `id` is the one sent and that `outcome` is right: `confirmed`, or `skipped` with a reason for a paused course.
  - ⚠️ This messages teachers, so use fixtures with no linked LINE account.
- **D, `GET /api/teacher-leave-days?from=&to=`**: the grid's data source, unchanged by TASK-622.
  - Confirm that the day recorded for the test coach is in `items`.
  - Also confirm that creating a booking for that coach on that day is still refused with `TEACHER_ON_LEAVE`: the grey cell matches what the server says.

## Follow-ups for the owner (not blockers)
- **D, camp blocks:** a camp block on a coach's leave day is **not** marked, because the settled visuals named "a class". Should it be marked too? It is small if yes.
- **D, day-view header:** the coach's **cells** are greyed and the column header is not. If he wants the header greyed too once he sees it, that is a one-line follow-up.
- **A, notes for his review of the workbook** (details in `tasks/TASK-620-*.md`):
  - one example phone number in a message is product copy, not customer data;
  - `📅CONFIRMED SCHEDULE:` is English in both languages;
  - five admin alerts share one generic line.
