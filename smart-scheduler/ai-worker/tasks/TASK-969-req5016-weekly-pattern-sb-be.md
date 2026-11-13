# TASK-969 — BE: a course's weekly pattern of hour-slots (SB; Team C slice — whole-day leave, week quota, change-pattern and resume are TASK-971, Bob) — @Brew (Team C)

**From @Sector, 2026-11-13.**
- **For:** REQ-5016. **Design:** `specs/SPEC-109-req5016-weekly-pattern-hour-slots.md`. §2–§4 are your contract.
- **Repo:** SB, `dong` @ `738b6eb`. No git. Test with `--env-file=.env.sid` + `DATABASE_URL` inline (dummy).
- **Size:** ≈ 5 d. **Start now.** Do TASK-967 first when I ring that the tree is unfrozen.
- **The tree is shared:** never hand in half-done. If a deploy is asked mid-build, tell me at once.

## Files (closed list; ask before others)
- **New:** `drizzle/00NN_course_slots.sql` (+ journal, witness = the index), `src/lib/course-pattern.ts` (expand, order, next free slot), tests.
- **Edit:**
  - `src/db/schema.ts` · `src/validation.ts` · `src/types/contract.ts` · `src/db/mappers.ts` (DTO `slots`);
  - `src/routes/api.ts` + `src/lib/route-access.ts` (change-pattern, same gate as change-teacher-time);
  - `src/services/scheduler.service.ts`: `createCoursePackage`, `previewCoursePackage`, `reconcileCoursePlan` (the make-up branch), the two `leave_used` doors + the undo path, the sick-leave action (`wholeDay`), `resumeCourse`, a new change-pattern act next to `runCourseTeacherTimeChange`;
  - `src/lib/line-message.ts`, behind Q1.

## Steps
1. Migration + DTO (SPEC §2). **No backfill.**
2. `course-pattern.ts`, pure: `expandPattern(startDate, slots, size, absentWeeks)`, `courseWeekOf(startDate, date)`, `nextFreeSlot(...)` with an injected "is free".
3. **Create + preview** (§3.1) through the existing per-row loop.
4. **Make-ups** (§3.2): branch only when the course has ≥ 2 slots. One-slot = byte for byte today.
5. **Whole-day leave + week quota** (§3.3): every `leave_used` writer, the undo included. **List them with a pin.**
6. **Change pattern + resume** (§3.4), preview = act.
7. **LINE text** (§3.5), behind Q1: dates only until approved.

## Done =
- tsc 0 · the full SB suite N/0 (paste) · route tests for every new body and refusal.
- **Tests:**
  - 10 classes Mon–Thu → 4 · 4 · 2;
  - a mixed-coach day;
  - make-up Thu missed → the next free slot (not +7), skipping a busy slot;
  - a whole-day leave = 1 quota + 1 parent message;
  - two separate hours in one week = 1 quota;
  - change-pattern moves only untaught rows;
  - **AC7:** the old course tests unchanged and green.
- **Mutation set incl.** "a one-slot course takes the new path" → killed.

## Questions
_(none open)_

## Implementation Notes
**Brew, 2026-11-13. Status: REVIEW (my slice, per the §8 split: migration · `course-pattern.ts` · `courseSlotsOf` · create / preview · both make-up writers · DTO `slots` · LINE). §3.3 / §3.4 (whole-day leave, the quota doors, change-pattern, resume) are TASK-971 (Bob).** SB `dong`, no git. Test: `bun test --env-file=.env.sid` + a dummy `DATABASE_URL`. No secret printed.

### What happened with scope (say it plainly)
Before Sector's split reached me I had built change-pattern, `resumeCourse`'s pattern branch, the two routes, `wholeDay` validation and a pure `planPatternChange`. **I REVERTED all of it** when I read the split (every hunk: service, routes, route-access, validation, the pure planner), so nothing of Bob's area is left of mine. Verified by grep (`change-pattern` / `wholeDay` appear only in Bob's edits).

### Evidence
- **tsc:** `bunx -p typescript@5.9.2 tsc --noEmit -p .` → no output, exit 0 (after my last edit, with Bob's current tree).
- **Suite:** my last full run with **my** slice complete and the tree where Bob was green: `6090 pass / 0 fail, 400 files`. ⚠️ **The shared tree is not green right now, and not because of my slice**: the later run shows 7 fails, all in Bob's in-flight area (resume pins ×3 [`course-pause-resume`-family: "resume does not rebuild from ANY inferred anchor" · "a NOVEMBER course resumed in September" · "the ONE derivation"], the ended-course route classification for his new `change-pattern` routes, the `actorOf` census 14, the `assertTeacherBookable(` doors list [his change-pattern act is a new door], and my own pin that said «nothing of §3.3/§3.4 is built here», which I removed because it cannot hold once Bob lands). Those clear when TASK-971 lands its pin updates. I did not touch them.
- **New tests:** `src/lib/course-pattern-task969.test.ts` **35** (pure module · the make-up by VALUE through a fake tx for the reconcile writer · AC7 · bodies · the pattern preview by value · DTO · `courseSlotsOf` · create by source · LINE · migration).
- **Migration (offline only):** `drizzle/0081_course_slots.sql`, hand-authored, rerunnable, **no backfill**, no writes; the unique index `course_slots_course_ord_uq` LAST = the witness. Journal idx 81, `when` 1783000000077, unique and the highest; count pins 81→82 in 39 test files. ⚠️ `db:verify` NOT run (needs 0081 applied; you apply it on sid).
- **Mutation set (21):** P1 min slots 1 (**a one-slot course takes the new path**) · P2 `patternOf` takes a single row · P3–P6 the make-up ignores a busy slot / the coach's leave / a closed day / the coach's hours · P7 / P8 the template's coach / time instead of the slot's · P9 the search not after the last row · P10 the door's make-up ignores the slot's coach · P11 / P12 declared absent weeks · P13 `course_slots` not stored · P14 the weekly LINE kept · P15 DTO never shows slots · P16 order ignores the start weekday · P17 exhausted-warning on a found slot · P18 the preview ignores the pattern · P19 `fromDate` ignored · P20 a one-slot course takes the new path in the door's make-up · P21 the next search not after the make-up just written → **21/21 KILLED**, every file restored with an identical hash. P10, P12 and P14 are killed by source pins only (no by-value harness for the sick-leave door, the create transaction or the confirm).

### What it does (SPEC-109 §2–§3.2, §3.5; §4 contract)
- **`course_slots`** + `courseSlotsRelations` + `coursePackages.slots`; the course keeps its FIRST slot's `weekday` / `start_time`.
- **`src/lib/course-pattern.ts` (pure):** `Slot`, `PatternRow`, `isPattern` (≥ 2, THE one predicate), `orderPattern`, `courseWeekOf`, `slotDateInWeek`, `patternProblem(slots, min)`, `expandPattern(startDate, slots, size, absentWeeks, fromDate = startDate)` (§8b), `occurrencesAfter`, `nextFreeSlot`.
- **Create:** `pattern` (2…21, unique; exclusive with `sessions` and `groupKey`) is expanded and goes through the SAME per-row loop as `sessions[]`, so every row meets `insertBooking` (clash · closed day · leave · hours). `absentWeeks` = course weeks, every slot of the week. `course_slots` is written BEFORE the rows. **Preview:** same body, same expansion (`previewPatternCourse`), each row its own coach and time, make-ups through the same search.
- **Make-ups (both writers):** the reconcile and the sick-leave door's own append branch on `patternOf(course).length` (≥ 2): the NEXT free slot in pattern order after the last planned row (and after the make-up the loop just wrote), with that slot's coach and time. "Free" = not held (slot-holder predicate) · coach not on leave at that hour (`teacherLeaveOn`) · day not closed (`closedDayOn`) · hour inside the coach's hours (`classFitsWorkHours`). Nothing free in 26 weeks ⇒ the existing exhausted-search fallback and the admin warning; never a refusal. A one-slot course reaches the old `findFreeExtensionDate` line unchanged.
- **DTO:** `slots: Slot[] | null` (`HH:MM`, pattern order; null = one slot). **Contract:** `pattern?` on the create, `CourseSlot`, `slots` on the create's answer.
- **LINE (Q1):** the `course_confirmed` payload loses `weekday` / `startTime` / `endTime` for a pattern course (dates only, which the message already carries); one-slot untouched. The new wording is NOT built (owner's approval via Porter).
- **Seam for Bob:** `expandPattern`'s 5th `fromDate`; `courseSlotsOf(exec, courseId): Slot[] | null` exported from `scheduler.service.ts` (Sector told 11-13).

### Decisions for you
1. **`absentWeeks` with a pattern** may only name the weeks of the drawn plan (`ceil(size / slots)`); a make-up row can't be declared absent at sale (the old "declared absence on a make-up" flip loop is skipped for a pattern, `wanted = 0`). The validator refuses a week beyond the plan.
2. **The top-level `teacherId` / `startTime` stay required** in the create body (the screen sends the first slot's); the server uses the slots, not them.
3. **A pattern make-up of a pattern course is built from the course row's loaded `slots` relation** (no extra read), and the DB-free test fakes keep working unchanged (a fake tx without `slots` = a one-slot course). `loadCourseForEnd` and the sick-leave door's course read now carry `slots`.
4. **Outside the closed list:** none new beyond the list (`contract.ts`, `mappers.ts`, `validation.ts`, `migration-witness.ts` are on it). Source pins I had to update (all tagged `🔻 TASK-969`): `advance-leave-on-extended-req089`, `expiry-adds-leave-weeks-req089` (courseBornCeiling ×3), `extension-ceiling` (exceedsExtensionCeiling ×2), `makeup-far-out`, `duo-course-req095-13` (`with: {… slots: true}` ×3 + the mapper line), `closed-day-task959` (the closed-day reader ×4), and `coach-time-ranges-task965` (teacherLeaveOn ×8, journal "highest up to idx 80"). No `.mutations.json` was edited by me for this task.
5. **Migration number:** 0081. If another migration lands first, I renumber before commit (journal `when` stays unique).
6. **`line-message.ts` was not touched by me** (the diff there is Bob's whole-day `times`).

## Review
_(Sector)_

**Scope after the owner's GO (2026-11-13, «ให้ทีม B ช่วยเลย»), see SPEC-109 §8 / §8a:** §3.3 (whole-day leave, `leave_used` doors, undo) and §3.4 (change-pattern, resume) moved to **Team B (Bob)**. Brew keeps the migration, `course-pattern.ts` (§8a signatures, **delivered first**), `courseSlotsOf`, create / preview, the make-up branch and LINE. Size ≈ 3.25 d.

## Review (Sector, 2026-11-13): ✅ DONE (Team C slice)
**My re-run on the shared tree (with Bob's TASK-971 work in it):** SB `tsc` 0 · full suite **6092 pass / 0 fail** · `course-pattern-task969.test.ts` 35/0.
- The 7 fails Brew saw were Bob's in-flight pins; they are gone now.

**Read:**
- The seam (§8b) is in exactly as written: `expandPattern(…, fromDate)` at `course-pattern.ts:65`, `courseSlotsOf` at `scheduler.service.ts:3296`.
- The pattern branch keys on the one predicate `isPattern` (≥ 2), so a one-slot course reaches the old `findFreeExtensionDate` line unchanged (AC7). Mutants P1 / P20 prove it.
- 21/21 mutants killed.
- He reverted his early start on Bob's area, verified by grep.

**Decisions 1–6, accepted [SA-decided]:**
1. `absentWeeks` limited to the drawn plan's weeks.
2. The top-level `teacherId` / `startTime` stay required, filled from the first slot.
3. Slots read from the loaded relation.
4. The declared pins.
5. 0081, renumber if beaten.
6. LINE = dates only until the owner approves the words (Q1).

**Migration 0081:** not yet on sid. It goes in with the next sid deploy's migrate step under the joint gate. I don't apply it ad hoc: the tree is shared and Bob's code may need it too.

**Security review:** none.
- The new body fields are zod-validated (2…21 slots, unique, exclusive with `sessions` / `groupKey`).
- No new route.
- No new data exposed beyond the course's own `slots`.
