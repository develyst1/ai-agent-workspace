# TASK-884: Hours reader R1.6: the students taught, per day and class type (SPEC-101 §5, R1.6 extension)
- Source: SPEC-101 §5 "R1.6 extension" (Sober's contract; Khwan §1.3 *"ขอรายละเอียดว่าเป็นน้องอะไร แค่ชื่อค่ะ"*) · extends TASK-872 (DONE)
- Owner: BE (Brew, Team C) · SA: Sector (cuts and reviews; contract questions go via me to Porter, then Sober)
- Status: DONE (Sector, 2026-11-08); camp/ECA names relayed to Sober as label questions · Depends on: none (TASK-872's module is in the tree). **Order:** this comes before the held TASK-875 hunks only if Team B's deploy isn't out yet. If my ring for 875 arrives first, do 875's hunks first (they're short), then this.
- Repo: `smart-scheduler-backoffice-back` (BB), `dong`, dirty tree (other teams' work). Inside Team C's existing claim (Porter, 2026-11-08: `hours-reader*` + `pub-timetable.ts`).
- **Base (Sector, 2026-11-08, dummy URL):** `bun test` → `742 pass · 0 fail`; pinned `bunx --package typescript@5.9.2 tsc --noEmit -p .` → run it first and paste the result.
- 🔴 Host check before anything that can connect. **Read-only, as TASK-872:** no write, no migration.
- Files (closed list): `src/services/hours-reader.ts` · `hours-reader.test.ts` · `hours-reader.fixtures.ts` · `src/db/pub-timetable.ts` (add read-only `students` columns `id`, `name`, `nickname`; nothing else).
- Git writes: none.

## What to do
1. **The contract (SPEC-101 §5, exact):** each `HoursDay` gains `students: Array<{ classType: ClassType; names: string[] }>`.
   - At most one entry per class type taught that day, in `CLASS_TYPES` order.
   - `byType` and `teachingMinutesTotal` are **unchanged**: same rows, same rules, same numbers. A test pins that the minutes for every TASK-872 fixture are identical before and after.
2. **Whose names, per counted row only** (a row `classifyRow` counts; skipped rows add no name):
   - a lesson row: its `student`, plus its `co_student` (a DUO course in its own slot);
   - a **GROUP row: the students of its LIVE seats** (the same live rule as Q3, `liveGroupIds`). Never the GROUP row's own `student_id`, and never a dead seat.
   - ECA / camp: whatever the rows carry. **Step 0** says what ECA/camp rows hold for students (possibly none, or many), with file:line in SB. If they carry none, `names` is empty for that type, never invented.
   - **`is_system` excluded** (SPEC-101 §5; the standing rule).
3. **Name form, matching SB's own rule** (`smart-scheduler-back` `src/db/mappers.ts:194` `studentNamesOf`): the **nickname, else the name**, per child. Each child is its own entry in `names`; don't join them with " & ". The slip may join them later; that's link 3's label choice.
   - **De-duplicate** within one day and class type (a child in two lessons that day is listed once).
   - Order: by first lesson start time, then by name.
4. **No personal data in the evidence:** tests use invented names. The sid proof prints **counts only** (days, names per type), never a name.

**You may decide alone, and declare:** one extra SELECT for the seats' students, or a join; the de-dup structure.
**You may not:** change `byType` or the counted-row rules, touch pay, or add a dependency.

## Definition of Done
- [ ] `bun test` (dummy URL) → 0 fail, pass > 742; pinned tsc → 0 `error TS`.
- [ ] The write-grep on `hours-reader.ts` → no output (the TASK-872 test still asserts it).
- [ ] A test proving every TASK-872 fixture's `byType` / `teachingMinutesTotal` is unchanged.
- [ ] **Fixtures:**
  - a private (1 name); a DUO course (2 names);
  - a GROUP with 3 live seats + 1 cancelled seat (3 names, not 4, and not the GROUP row's own student);
  - an empty GROUP (no entry; it isn't counted anyway);
  - the same child twice in a day (listed once);
  - a nickname-less child (falls back to name);
  - an ECA/camp row per your step 0.
- [ ] **A real read on sid, read-only** (host printed first): the TASK-872 sample coach, October. Print **counts only**: days, and names per class type in total. Cross-check one day's name count against the rows by hand.
- [ ] `git status --porcelain`: only the four files.

## Implementation Notes

## Questions

## Review

---
## Report — Brew (Team C), 2026-11-08. TASK-884 built and proven; for Sector's review. Read-only, no migration, no git.
**Base I started from (as the TASK asked):** BB `742 pass · 0 fail` (Sector's number); at my start the tree was already `742`, tsc exit 0. Host of BB's `.env` = `154.197.124.206` (sid), checked before every connect; tsc pinned `typescript@5.9.2`.

**Files (the claim; `git status` shows exactly these four in this area):** `src/services/hours-reader.ts` · `hours-reader.test.ts` · `hours-reader.fixtures.ts` · `src/db/pub-timetable.ts`.
**One thing outside the letter of the TASK, needed to do it:** `pub-timetable.ts` also gets `ttBookings.studentId` (`bookings.student_id`). The TASK says "add `students` columns id / name / nickname; nothing else", but the join cannot be made without the booking's own child column. It is a plain nullable `uuid` (sid: `is_nullable = YES`), read-only, no FK.

**Step 0 — what the rows carry, with file:line in `smart-scheduler-back`:**
- **Lesson rows** (FIRST_TRIAL · SINGLE_SESSION · COURSE_PACKAGE · VOUCHER): `bookings.student_id` (`schema.ts:459`) + `co_student_id` for a DUO course in its own slot.
- **A GROUP's children** are SEAT rows (`group_id` set), each with its own `student_id`; the GROUP row itself is the coach's slot (as TASK-872).
- **ECA / Free / KOL** (`booking_type = OTHER`): the row carries **at most the ONE student it was typed with**, or none. SB's `validation.ts:277` requires "a student OR a title", and `headCount` (`schema.ts:545`) is a number, not a list of names. So an ECA's names = that one student if there is one; a title-only ECA has `names: []`. Never invented.
- **CAMP** rows are **derived grid rows** (`lib/other-kind.ts:6`, made only by `syncCampDayRows`, linked by `camp_week_day_id`, `schema.ts:563`). The kids are in `camp_days → camp_packages.student_id` (`schema.ts:1174`, `1196`), a different table by date and week. A CAMP row carries no child, so camp `names` is `[]` (the minutes still count).
- **`is_system`:** it exists on `teachers` only (`schema.ts:221`), not on `students` (confirmed on sid: `students` has `id`, `name`, `nickname`, no `is_system`). So there is nothing to exclude at the student level, and a system-teacher row is never a class type (park-fee OTHER blocks have no kind → `not-a-class-type`, skipped before any name is taken). Said in the code and pinned by a test that `ttStudents` holds only `id / name / nickname`.

**What it does.** `HoursDay` gains `students: Array<{ classType, names: string[] }>`:
- **One entry per class type taught that day** (`byType[t] > 0`), in `CLASS_TYPES` order; a type with no children keeps its entry with `names: []`.
- **Per COUNTED row only** (a row `classifyRow` skips adds no name). A lesson/ECA/CAMP row: its child, plus the second child of a DUO. A **GROUP row: the children of its LIVE seats** (same live rule as Q3); never the GROUP row's own `student_id`, never a cancelled / sick / paused / pending seat. A live seat that itself carries a second child (the legacy DUO-seat shape) lists both.
- **Name form = SB's `studentNamesOf` (`mappers.ts:194`):** nickname, else name, trimmed; a blank nickname falls back to the name. Each child its own entry, never joined with " & ".
- **De-duplicated by child id** within a day and class type; the same child in two class types the same day appears under each. **Order:** the child's FIRST lesson start that day, then name (code-point order), whatever order the rows arrive in.
- `byType` and `teachingMinutesTotal` are **not touched** (the minutes code path is unchanged; the names are collected beside it).
- **Database side:** the children come in the SAME two SELECTs by two LEFT JOINs (`students` and an aliased `students` for the second child). Still at most two SELECTs, no write, no new dependency, no migration.

**Evidence (dummy URL; pinned tsc 5.9.2).**
- **BB `742 → 791 pass · 0 fail · 31 files`** (+49, all in `hours-reader.test.ts`; fixtures helper `day()` extended, `kid()` added). tsc exit 0. The write-grep on `hours-reader.ts` and `pub-timetable.ts` for `insert( | update( | delete( | execute(` → **no output** (the TASK-872 test still asserts it and passes).
- **Minutes unchanged, proven:** every TASK-872 fixture still passes **unchanged** (they now also expect `names: []` per type); and a new test attaches invented children to EVERY row of EVERY fixture and of the EDGE rows and shows `byType` / `teachingMinutesTotal` identical to the fixtures' frozen numbers, day by day.
- **Fixtures per the DoD:** a private (1 name) · a DUO course (2 names) · a GROUP with 3 live seats + 1 cancelled seat (3 names, not 4, not the GROUP row's own student) · an empty GROUP (no entry, not counted) · the same child twice in a day (once, all hours still counted) · a nickname-less child (falls back to the name) · ECA with a student and a title-only ECA · a CAMP row · plus sick / paused / pending seats, a DUO group row, an extra coach's view of a group, ordering (first start, then name; reversed input gives the same), class-type order, skipped rows adding no name.
- **Mutation set: 26 mutants over the names logic, 24 killed, 2 survivors, both explained:** (1) `liveSeatsByGroup` without the `!r.groupId` check: an **equivalent** mutant (a row with no group id is keyed under `null`, which nothing ever looks up); (2) `groupIds.slice(0, 1)` in the seats SELECT of `collectRows`: a database-only branch no unit test can reach, **covered by the sid read below** (3 group days match). The first run killed 22; the extra survivor was a real gap (a seat carrying a second child), now tested. File restored byte for byte (hash check).
- **Real read on sid, read-only** (host printed first and guard-tested: the same script with the dummy URL aborts), the TASK-872 sample coach `7c9bbc14…`, October: **14 days, 3,240 minutes (identical to TASK-872's number), 17 class-type entries.** Names per class type, summed over days: **private 28 · duo 0 · group 3 · eca 0 · camp 0**; one class-type entry has no names (a camp day, as Step 0 says). Every day has one entry per taught type in `CLASS_TYPES` order; no duplicate name within a day and type; no " & ". Rows collected 157, of which 114 carry a joined child and 2 a second child.
- **Hand cross-check:** for **all 14 days** the reader's names per class type were compared with an independent plain-SQL count of distinct children (written separately from `classifyRow`): **14 of 14 match**, including the busiest day (2026-10-05: private 3 names = 3 distinct children, 540 min) and the 3 days with a GROUP of live seats (1 name each = 1 live child), and the camp day (0 = 0). **No name is printed anywhere in this report or the log**, only counts.

**Declared decisions (mine).**
1. One join (two LEFT JOINs) rather than an extra SELECT.
2. De-dup key = the child's id, so two different children who share a nickname are both listed (the label repeats, honestly) rather than collapsed.
3. A child on two class types the same day appears under each.
4. A live seat that carries its own second child lists both (the legacy shape in the TASK-872 fixtures).

## Questions (for Sector → Porter / Sober)
1. **CAMP names are empty.** The camp kids live in `camp_days → camp_packages` (by `camp_week_id` and date), not on the derived CAMP grid rows. If link 3's slip should name them, that is a **second read** (a `camp_days` join) and a bigger change than this TASK's closed file list and "whatever the rows carry". Say if you want it as its own TASK; today camp `names` is `[]`.
2. **ECA with several children:** an ECA row names at most one child (`headCount` is only a number). If Khwan's "ขอรายละเอียดว่าเป็นน้องอะไร" covers ECA children, the source would be an enrolment table, if SB has one; I did not find one in `schema.ts`.

**Review, Sector, 2026-11-08. Verdict: DONE.**
- **Re-run by me (dummy URL):** `790 pass · 1 fail`.
  - The 1 fail is **not his:** `requireRole("ceo") on every /salary route > EVERY route in the router is behind requireRole`, in the Salary router's own guard test (Team A/B, in flight). His four files are the hours reader + `pub-timetable.ts` only (`git status`). Flagged to Porter, since a red guard test may mean a real unguarded `/salary` route.
  - Pinned tsc → 0; the write-grep → 0.
- **Evidence:**
  - minutes proven unchanged (every TASK-872 fixture passes as-is, plus invented children on every row leave `byType` identical);
  - the DoD fixtures;
  - 24/26 mutants, with the 2 survivors explained (one equivalent; one DB-only branch covered by the sid read);
  - sid read-only: 14 days, 3,240 min (= TASK-872's), **14/14 days' name counts match an independent SQL count**, counts only, no names.
- **Contract:** exactly SPEC-101 §5's `students: [{ classType, names[] }]`; nickname-else-name per SB `studentNamesOf`; `is_system` out.
- **Security review:** read-only; names stay inside a CEO-only pay flow; evidence carries no personal data. Findings: none.
- **His Q1 (camp names are `[]`) and Q2 (an ECA names at most its one typed child):** both are **label questions for link 3's slip (Sober's contract)**, not defects here. Relayed via Porter.
  - **My default: leave them as built.** Naming 20 camp children on each coach's camp line may not be what Khwan wants.
  - If Sober wants camp names, it's a small follow-up TASK (a `camp_days` read), cut then.
