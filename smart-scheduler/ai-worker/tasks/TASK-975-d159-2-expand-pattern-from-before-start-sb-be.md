# TASK-975: BE, D-159-2 fix: `expandPattern` lays rows out from a `fromDate` BEFORE the course start (smart-scheduler-back) — @Brew
**From @Sector, 2026-11-13.**
- **REQ / SPEC / TEST:** REQ-5016 AC5 · SPEC-109 §8b (this amends it) · TEST-159 § Re-test, D-159-2.
- **Repo:** SB `dong`, committed base `fd6884f` (tree clean when I cut this). **Git:** none.
- **Size:** ≈ 0.25 d.
- **One writer:** this does **not** touch `scheduler.service.ts`. You need no claim on it.

## The defect (what I read)
- **The resume call:** `resumeCourse` (`scheduler.service.ts` l.6610) calls `expandPattern(course.startDate, slots, owed, new Set(), input.startDate)`.
- **How `expandPattern` handles it** (`src/lib/course-pattern.ts` l.65–78):
  - it starts at `courseWeekOf(startDate, fromDate)`, which clamps to week 1 for a date before the start;
  - it skips every `date < startDate` (l.73).
- **The result:** a resume (or a change-pattern) from a date **before** the course start is silently moved to the course start. Tanya's case: a course starting 1 Feb 2027, resumed from 23 Nov 2026 → rows on 1 Feb 10:00 / 11:00, on top of the two SICK_LEAVE rows the family declared there.
- **The same latent hole:** the change-pattern act (`lib/pattern-change.ts` l.41) uses the same call with its `fromDate`.

## The fix (SPEC-109 §8b amendment, [SA-decided])
- **The rule:** when `fromDate < startDate`, `expandPattern` lays the pattern out **from `fromDate`**, as if the pattern started there.
  - In code: `const anchor = fromDate < startDate ? fromDate : startDate`, then use `anchor` where today's code uses `startDate`: `orderPattern`, `courseWeekOf`, `slotDateInWeek`, and the `date < …` skip.
  - `week` is then counted from `anchor`.
- **Why it is safe:**
  - For `fromDate >= startDate` (every existing caller: create, preview, the case-12 resume, change-pattern after the start), `anchor === startDate`, so the output is **byte for byte the same**. The suite proves it.
  - For `fromDate < startDate`, both callers pass empty `absentWeeks` and never read `week` (I grepped `pattern-change.ts`, `course-pattern-change.service.ts` and `resumeCourse`). So re-basing the week number changes nothing they use.
- **What you get:** the first `size` pattern occurrences dated `>= fromDate`, in date order. That is what a one-slot course does (`courseSessionDates(input.startDate, owed)`), and Tanya's control showed it.
- **The doc comment** (l.59–64): add one line, `🔻 TASK-975 (D-159-2): fromDate before startDate ⇒ laid out from fromDate (week counted from fromDate)`.

## Closed file list
1. `src/lib/course-pattern.ts`: `expandPattern` only.
2. `src/lib/course-pattern-task969.test.ts`, appended (or a new `course-pattern-task975.test.ts`):
   - (a) start Mon 2027-02-01, slots Mon 10 · Mon 11 · Wed 13 · Thu 10, size 10, `fromDate` 2026-11-23 → the first row is **2026-11-23 10:00**, every row is `< 2027-02-01`, the rows are in date order, each with its slot's coach;
   - (b) the same with `fromDate` = `startDate` → equals `expandPattern(start, slots, 10)` (unchanged);
   - (c) a `fromDate` after the start (case 12's shape) → equals what the base code gives. Pin today's output in the test.

## DoD
- [ ] `bunx --package typescript@5.9.3 tsc --noEmit` → exit 0.
- [ ] SB suite `DATABASE_URL=postgres://dummy:dummy@127.0.0.1:1/dummy bun test --env-file=.env.sid` → 0 fail (base 6138 + yours).
- [ ] `git diff --stat` shows only the files above.

## Not in scope
- `resumeCourse`, `pattern-change.ts` and the change-pattern service: **unchanged** (Bob's code; they get the fix through the seam).
- No migration. No SF.

## Implementation Notes
**Brew, 2026-11-13. Status: REVIEW.** SB `dong`, no git, `scheduler.service.ts` not touched.
- `src/lib/course-pattern.ts`, `expandPattern` only: `const anchor = fromDate < startDate ? fromDate : startDate;` used for `orderPattern`, `courseWeekOf`, `slotDateInWeek` and the `date < anchor` skip; doc line added with the `🔻 TASK-975 (D-159-2)` tag. For `fromDate >= startDate` anchor = startDate, so output is unchanged (the whole old suite stays green, plus case (c) pins it).
- New `src/lib/course-pattern-task975.test.ts`, 6 tests: (a) Tanya's shape — start Mon 2027-02-01, from 2026-11-23, size 10: first row 11-23 10:00, all < start, date order, each slot's coach, week counted from fromDate · (a2) a non-start-weekday fromDate · (b) from = start equals no from · (c) from after the start pinned to today's output (start 11-02, from 11-12) · never a row before `fromDate` · source pin.
- **tsc** (`bunx -p typescript@5.9.2 tsc --noEmit -p .`) → exit 0.
- **Suite** (`DATABASE_URL=postgres://dummy:dummy@127.0.0.1:1/dummy bun test --env-file=.env.sid`) → `6144 pass / 0 fail, 405 files`.
- **`git diff --stat`:** `course-pattern.ts` 6+/4−, plus the new untracked test only.

## Review
**Sector, 2026-11-13: DONE.**
- **Diff read:** `anchor = min(startDate, fromDate)` replaces `startDate` in `orderPattern`, `courseWeekOf`, `slotDateInWeek` and the skip, which is exactly SPEC-109 §8c. The doc line is tagged.
  - For `fromDate >= startDate`, `anchor === startDate`, so the output is the same as before. The unchanged old suite and the pin in case (c) prove it.
- **Tests:** Tanya's shape, a non-start-weekday from date, from = start, and a from date after the start (pinned).
- **My re-run:**
  - tsc (5.9.3) → exit 0;
  - suite → **6144 pass · 0 fail · 405 files**.
- **Security review:** none (a pure date helper).
