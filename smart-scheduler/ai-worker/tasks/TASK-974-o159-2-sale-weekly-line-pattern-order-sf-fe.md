# TASK-974: FE, O-159-2 fix: the sale plan's weekly line reads in pattern order, grouped by day (smart-scheduler-front) — @Flash
**From @Sector, 2026-11-13.**
- **REQ / SPEC / TEST:** REQ-5016 AC6 · SPEC-109 §3.5 · TEST-159 O-159-2 (case 5).
- **Repo:** SF `dong`, committed base `3c94c8b` (tree clean when I cut this). **Git:** none.
- **Size:** ≈ 0.25 d.

## The defect (what I read)
- `patternLabel` (`src/lib/scheduler/weekly-pattern.ts` l.60) groups consecutive same-day slots in the order it is given. That is right for the server's slots, which come in pattern order.
- At sale, `CreatePlanFlow.tsx` l.255 hands it the rows **as typed** (`patternBody.pattern`). Typed Mon 10 · Thu 12 · Mon 11 reads «Mon 10:00 · Thu 12:00 · Mon 11:00». SPEC §3.5 wants «Mon 10:00, 11:00 · Thu 12:00».
- **Pattern order** is the server's `orderPattern` (SB `src/lib/course-pattern.ts` l.26):
  - sort by the day offset from the course's start weekday, `(weekday − startWeekday + 7) % 7`;
  - then by `HH:MM`.

## Closed file list
1. `src/lib/scheduler/weekly-pattern.ts`: a new export, `orderPatternSlots(startDate, slots)`, with the same rule as SB's `orderPattern`. It is pure and doesn't mutate its input.
2. `src/components/partials/Bookings/CreatePlanFlow.tsx`, l.255 only: `slots: … ? orderPatternSlots(<the sale's start date>, patternBody.pattern) : null`. The body sent to the server is unchanged.
3. A new test, `src/lib/scheduler/weekly-pattern-order-task974.test.ts`:
   - typed Mon 10 · Thu 12 · Mon 11, start on a Monday → `patternLabel` gives «จ 10:00, 11:00 · พฤ 12:00» (TH) and the EN equivalent;
   - start on a Wednesday with Mon + Thu slots → Thu first;
   - the input array is not mutated.

## DoD
- [ ] `npx tsc --noEmit -p .` → exit 0.
- [ ] `bun test` → 0 fail (base: 1642 pass at gate #2, plus yours).
- [ ] `git diff --stat` shows only the files above.

## Not in scope
- `PlanModal.tsx`, `DropResumeDialog.tsx`, `ChangePatternDialog.tsx` (Team B), `BookingModal.tsx`, `dictionaries.ts`: **don't touch them**. Fanta holds them for TASK-972 Amd 1.
- The plan line on a saved course is fixed server-side by Brew's TASK-973. Nothing to do here for that.

## Implementation Notes
### Flash (Team C) — 2026-11-13: built
- **Evidence:** `tsc` 0 · SF `bun test` **1645 pass / 0 fail, 173 files** (the shared tree incl. Fanta's in-flight files) · my new test: 3.
- **Mine (3 files):**
  - `weekly-pattern.ts`: `orderPatternSlots(startDate, slots)` = SB `orderPattern` (offset from the start weekday, then HH:MM; copy, no mutation).
  - `CreatePlanFlow.tsx`: the import and l.255 only, `slots: … orderPatternSlots(startDate, patternBody.pattern)`. The body sent is unchanged.
  - New `weekly-pattern-order-task974.test.ts` (3): Mon 10 · Thu 12 · Mon 11 from a Monday → TH «จ 10:00, 11:00 · พฤ 12:00» and EN «Mon 10:00, 11:00 · Thu 12:00»; Wednesday start → Thu first; input not mutated.
- **`git diff --stat` also lists** `BookingModal.tsx`, `dictionaries.ts`, `booking-menu-doors-task972.dom.test.tsx`: those are Fanta's (TASK-972), not mine.
- Weekday of the start date: `new Date(date + "T00:00:00Z").getUTCDay()`, timezone-safe, as the server does.

## Review
**Sector, 2026-11-13: DONE.**
- **Diff read:**
  - `orderPatternSlots` matches SB `orderPattern` (`course-pattern.ts` l.23–28): offset `(d − w0 + 7) % 7`, then `HH:MM`, sorted on a copy.
  - `CreatePlanFlow` changes only the import and l.255.
  - `startDate` (l.80) is the same value the preview sends (l.216).
  - The body sent to the server is unchanged.
- **The test covers the SPEC example in TH and EN,** a non-Monday start, and that the input is not mutated.
- **The other files in SF `git status`** (`ChangePatternDialog.tsx`, `BookingModal.tsx`, `dictionaries.ts`, the task972 test) are Fanta's TASK-972 Amd 1, not Flash's.
- **My re-run:**
  - `npx tsc --noEmit -p .` → exit 0;
  - `bun test` → **1648 pass · 0 fail · 173 files** (the shared tree, with Fanta's in-flight work).
- **Security review:** none (display ordering only).
