# SPEC-109: A course's weekly pattern of hour-slots (REQ-5016, F1)
**Sector (SA, Team C), 2026-11-13.**
- **Read against:** SB `dong` @ `738b6eb` (the committed tree; it is on sid) and SF `dong` @ `6c52040`.
- **TASKs:** TASK-969 (Brew, SB) and TASK-970 (Flash, SF). FE builds against §4 in parallel.
- **Design basis:** REQUEST …multi-day-her-answers-resize § Answer, and REQUEST …khwan-0043-batch § A.

## 1. What exists (cited)
- **One row is already one hour with its own coach.** `endTime = addHour(startTime)`. A course's `size` counts rows. Pay is per row.
- **`createCoursePackage`** (`scheduler.service.ts`):
  - already takes **per-session overrides** `sessions[] {date, startTime?, teacherId?}` (`validation.ts`, "TASK-095 purchase-time planner", exactly `size` of them);
  - otherwise builds `courseSessionDates(startDate, size)` (`recurring.ts:17`, one row a week);
  - `absentWeeks` (1-based) marks rows by **session index**;
  - the course stores one `weekday` + `startTime`.
- **Make-ups:** `reconcileCoursePlan` (`:3250`) appends after the **last planned date**. Its template is the absent row (same coach and time), and it calls `findFreeExtensionDate(teacher, time, fromDate)` = `+7` weekly (`extension-slot.ts:9`).
- **Leave quota:** `course_packages.leave_used` is incremented once per charged leave act (`scheduler.service.ts:4351`, `:4954`). The window is `size + quota` weeks (`leave.ts`).
- **Whole-course change:** `runCourseTeacherTimeChange` (`:6562`, TASK-838) moves the remaining rows to one new coach / day / time. `resumeCourse` re-plans on one weekday / time.

## 2. Model [SA-decided]
- **A pattern** = an ordered list of **slots** `{weekday 0–6, startTime HH:MM (:00/:30), teacherId}`, 1…21 slots, no two with the same `(weekday, startTime)`.
  - Order = weekday, counted from the course's start weekday, then time.
  - Several slots a day: in a row or with gaps.
  - Each slot has its own coach.
- **Storage:** a new table, only for courses with **2+ slots**:
```sql
CREATE TABLE IF NOT EXISTS course_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES course_packages(id) ON DELETE CASCADE,
  ord smallint NOT NULL,
  weekday smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time time NOT NULL,
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE RESTRICT
);
CREATE UNIQUE INDEX IF NOT EXISTS course_slots_course_ord_uq ON course_slots (course_id, ord);
```
  - **No backfill.** A course with no `course_slots` rows is a one-slot course and runs **today's exact code paths** (AC7: the branch is "rows ≥ 2", so old behaviour can't drift).
  - `course_packages.weekday` / `start_time` keep the **first** slot's values for the old readers.
- **Course week:** week *k* = `[startDate + 7(k−1), startDate + 7k − 1]`. The same week as `absentWeeks` and the `size + quota` window.

## 3. Behaviour
1. **Create (AC1–2):** the body gains `pattern?: Slot[]` (2+ slots; with 1 slot, send today's fields). The server expands it:
   - walk weeks from `startDate`, and in each week the slots in order;
   - skip a slot before `startDate`;
   - stop at `size` rows;
   - the result goes through **the same per-row loop as `sessions[]`**: every row meets `insertBooking` → clash / closed day (REQ-5013) / leave and hours (REQ-5015), exactly as single classes do.
   - `absentWeeks` with a pattern = **course weeks**: every slot in that week becomes a planned absence.
   - `pattern` and `sessions` are exclusive.
   - **The preview** (`/courses/preview`) takes the same `pattern` and returns the expanded dates, so preview = act.
2. **Make-ups (AC3):** when the course has slots, an appended make-up goes to the **next free slot in pattern order** after the last planned row (date + time), using that slot's coach and time.
   - "Free" is: the slot is not held (the slot-holder index), the coach is not on leave at that hour, the day is not closed, and the hour is inside the coach's working hours.
   - Otherwise it tries the next slot, scanning up to 26 weeks × slots.
   - When nothing is free it falls back to the existing exhausted-search rule (`searchExhausted`, admin told). A make-up is never refused.
   - One-slot courses keep `findFreeExtensionDate` byte for byte.
3. **Leave (AC4):**
   - **Per hour** = today's per-row leave, unchanged.
   - **Whole day:** `PATCH /bookings/:id/status` with `action: "sick-leave"` gains `wholeDay?: true`. Every live row of **that course on that date** becomes `SICK_LEAVE` in one transaction, with **one** parent LINE message (the existing leave message, listing the times) and one coach notice per coach.
   - **Quota in weeks:** a charged leave increments `leave_used` only if **no other charged leave row of the course sits in the same course week**. Undo / un-leave decrements only when it removes the week's last charged leave row. Both doors, `:4351` and `:4954`, plus the undo path.
   - A one-slot course is the same as today, since one row a week = one leave a week.
4. **Change the pattern mid-course (AC5):** `POST /courses/:id/change-pattern` (+ `/preview`), body `{ fromDate, pattern: Slot[] }`.
   - Every **untaught** row (live, not attended, date ≥ `fromDate`) is re-placed onto the new pattern in order, from `fromDate`, keeping the count.
   - Taught rows stay.
   - It is built on TASK-838's act shape: one transaction, the preview = the act in a rollback, the same notices (one per family and coach).
   - Rewrites `course_slots` (a 1-slot result deletes them and sets `weekday` / `start_time`).
   - **Resume** (`resumeCourse`) of a pattern course re-plans onto its pattern from the resume date.
5. **Displays (AC6):**
   - The course DTO gains `slots: Slot[] | null` (null = one slot).
   - The LINE schedule text (`line-message.ts`, the course-confirm / schedule lines) renders a pattern as «จ 10:00, 11:00 · พฤ 12:00» instead of «ทุกวันจันทร์ 10:00».
   - ⚠️ That is customer-facing text: the format goes to the owner through Porter (Q1). Until approved, a pattern course's message lists its **dates** (which the confirm message already carries) and leaves out the weekly line.
6. **Duo and group:**
   - **Duo:** falls out free. Every row copies `co_student_id`, so a pattern works.
   - **Group-seat courses** (`groupKey`): **no pattern**. 400 if both are sent, because a group has its own schedule (REQ out of scope).

## 4. Contract (SB → SF)
```ts
type Slot = { weekday: 0|1|2|3|4|5|6; startTime: string /* HH:MM */; teacherId: string };
// POST /courses and /courses/preview: + pattern?: Slot[] (2..21, unique weekday+startTime; exclusive with sessions[] and groupKey)
// CourseDTO: + slots: Slot[] | null
// PATCH /bookings/:id/status: action "sick-leave" + wholeDay?: boolean (only for a course row; 400 otherwise)
// POST /courses/:id/change-pattern[/preview] { fromDate: IsoDate; pattern: Slot[] /* 1..21 */ }
//   → like change-teacher-time: { moved: number; rows: BookingDTO[]; notices: {...} }, preview = same shape, nothing written
```
- **Errors:** the existing codes (clash, `DAY_CLOSED`, leave / hours) per row, with the row's date and time; `400 VALIDATION` on a bad pattern.

## 5. Size (≈ 7.5 d, as quoted)
- **SB ≈ 5 d:**
  - migration + DTO 0.5;
  - expand + create + preview 1;
  - make-up next-slot search 1.25;
  - whole-day leave + week quota 0.75;
  - change-pattern + resume 1;
  - LINE text 0.25;
  - regression pins 0.25.
- **SF ≈ 2.5 d:**
  - the pattern editor at sale (rows: day · time · coach, add / remove, the previewed dates) 1;
  - «ลาทั้งวัน» in the booking modal 0.25;
  - the change-pattern dialog (on the change-coach/time dialog) 0.75;
  - displays (course panel, CreatePlanFlow, DropResume, calendar header) 0.5.
- **Risk: high.** The suite must stay green and existing courses run the old paths. The mutation set must include "one-slot course takes the new path".

## 6. Order and deploy
- **Start now** (front office). It goes into **the next combined deploy**, under the joint-gate rule (SYSTEM-FACTS 2026-11-13 deploy rule).
- **The tree must never be half-done at a deploy ask:** if a deploy is asked mid-build, Team C says so in the gate, and it doesn't ship.
- **TASK-967/968** (the REQ-5015 wording) are small and wait for the uat deploy. Brew / Flash do them first when unfrozen, then go back to this.
- **Target:** on sid ≈ 2026-11-18, then Tanya ≈ 2 d.

## 7. Questions (to Porter, with defaults)
1. **The LINE weekly-pattern text** «จ 10:00, 11:00 · พฤ 12:00» needs the owner's OK. [default: until then the message lists dates only]
2. **Pattern order inside a week** starts from the course's start weekday (a Thu-start course: Thu, Sun, Mon…). [SA-decided; it only affects which slot a make-up tries first]
3. **The maximum of 21 slots a week.** [SA-decided, a guard]

## §8. Two-team split (proposed 2026-11-13, for the owner's "faster"; see REQ-5016 ## Questions)
- **Team C, Brew (TASK-969):**
  - the migration, `schema.ts`, `mappers.ts` (DTO `slots`);
  - **`src/lib/course-pattern.ts`** (owned and delivered FIRST: `Slot`, `expandPattern`, `courseWeekOf`, `nextFreeSlot`);
  - `createCoursePackage` / `previewCoursePackage`, the `reconcileCoursePlan` make-up branch, `line-message.ts`;
  - `validation.ts` / `contract.ts`: the create / preview / DTO parts.
- **Team B, Bob (Silver's TASK):**
  - §3.3, the sick-leave action `wholeDay`, the two `leave_used` doors + the undo path, using `courseWeekOf`;
  - §3.4, a new change-pattern act next to `runCourseTeacherTimeChange` + its routes in `api.ts` / `route-access.ts`, and `resumeCourse`, using `expandPattern`;
  - `validation.ts` / `contract.ts`: the change-pattern and `wholeDay` parts only.
- **Team C, Flash (TASK-970):** the pattern editor (sale), CreatePlanFlow, the displays (course panel, DropResume, CalendarHeader).
- **Team B, Fanta:** «ลาทั้งวัน» in `BookingModal`, and the change-pattern dialog (reuses Flash's `WeeklyPatternEditor` read-only as a component, with no edits to it).

## §8a. GO (owner via Porter, 2026-11-13: «ให้ทีม B ช่วยเลย»). The seam between Brew and Bob, PROPOSED until Brew confirms it against his code
`src/lib/course-pattern.ts` (Brew writes it, Bob only imports it; pure, no DB):
```ts
export type Slot = { weekday: 0|1|2|3|4|5|6; startTime: string /* "HH:MM" */; teacherId: string };
/** Slots in pattern order: weekday counted from `startWeekday`, then time. */
export function orderSlots(slots: readonly Slot[], startWeekday: number): Slot[];
/** The planned rows from `fromDate` (inclusive) on: `count` rows, week by week, slots in order; `absentWeeks` are course-week numbers (relative to `courseStart`). */
export function expandPattern(courseStart: IsoDate, fromDate: IsoDate, slots: readonly Slot[], count: number, absentWeeks?: ReadonlySet<number>): Array<{ date: IsoDate; startTime: string; teacherId: string; week: number }>;
/** 1-based course week of `date` (week k = [start + 7(k−1), start + 7k − 1]). */
export function courseWeekOf(courseStart: IsoDate, date: IsoDate): number;
/** The next slot after (date, time) in pattern order whose `isFree` answers true; scans ≤ 26 weeks; `exhausted` when none. */
export function nextFreeSlot(courseStart: IsoDate, slots: readonly Slot[], after: { date: IsoDate; startTime: string }, isFree: (s: { date: IsoDate; startTime: string; teacherId: string }) => Promise<boolean>): Promise<{ date: IsoDate; startTime: string; teacherId: string; exhausted: boolean }>;
```
- **Reading the course's slots:** `courseSlotsOf(exec, courseId): Promise<Slot[] | null>` in `scheduler.service.ts`, written by Brew. `null` = a one-slot course.
- **Bob uses:**
  - `courseWeekOf` (the week quota);
  - `expandPattern` with `fromDate` + count = the remaining rows (change-pattern, resume);
  - `courseSlotsOf`.
  - **He writes `course_slots` only inside the change-pattern act** (delete + insert, one transaction).
- **Order:**
  - Brew delivers this file + the migration + `courseSlotsOf`, and pings me. I tell Porter → Silver → Bob.
  - Bob's week-quota work needs only `courseWeekOf` and can start against this signature at once.
- **Shared files, append-only, by section:**
  - `validation.ts` / `contract.ts`: Brew owns create / preview / DTO; Bob owns change-pattern + `wholeDay`.
  - `scheduler.service.ts`: Brew owns create / preview / reconcile / `courseSlotsOf`; Bob owns the sick-leave action, the two `leave_used` doors, undo, `resumeCourse` and the new change-pattern act.
  - **Re-read before every edit.**

## §8b. The seam, FINAL (Sector, 2026-11-13). Written from Brew's code (`src/lib/course-pattern.ts`, read today); it replaces §8a's draft signatures
- **As built (use these names):**
  - `Slot`, `PatternRow { date, startTime, teacherId, week, absent }`;
  - `orderPattern(startDate, slots)` (not `orderSlots`);
  - `courseWeekOf(startDate, date)`;
  - `slotDateInWeek`, `patternProblem`, `occurrencesAfter(startDate, slots, afterDate, afterTime, weeks?)`;
  - `nextFreeSlot(startDate, slots, after, isFree, weeks?) → PatternRow | null`;
  - `isPattern`, `MIN/MAX_PATTERN_SLOTS`.
- **One addition, Brew makes it (backward compatible):**
  `expandPattern(startDate, slots, size, absentWeeks = new Set(), fromDate = startDate): PatternRow[]`
  - Rows dated before `fromDate` are skipped. `size` = the number of rows **to produce from `fromDate`**.
  - The week bound becomes `courseWeekOf(startDate, fromDate) + size + 1`.
  - `week` stays the course week, counted from `startDate`.
  - Existing callers are unchanged.
  - **Bob uses it for change-pattern / resume:** `expandPattern(course.startDate, newSlots, remainingCount, new Set(), fromDate)`.
- **Brew also writes** `courseSlotsOf(exec, courseId): Promise<Slot[] | null>` in `scheduler.service.ts`: the rows by `ord`, `null` when fewer than 2.
- Bob doesn't wait for either for the week quota (`courseWeekOf` exists now).

## §4a. Correction (Sector, 2026-11-13, found by Flash)
§4 said change-pattern answers `{ moved, rows, notices }`. **That was my guess, not code.** TASK-838's real answer is `{ n, firstDate, lastDate }`. **The change-pattern answer is whatever Bob's TASK-971 act returns** (Silver owns that contract). Fanta reads it from Bob's code, not from §4.

## §8c Amendment (Sector, 2026-11-13, D-159-2) [SA-decided]: `fromDate` before the course start
- **The rule:** when `expandPattern`'s `fromDate` falls **before** `startDate`, the pattern is laid out from `fromDate`, and `week` is counted from `fromDate`.
- **The result:** the first `size` occurrences dated `>= fromDate`, in date order. That is the same as a one-slot resume.
- **Callers that don't change:** every caller with `fromDate >= startDate` gives the same output as before. The callers that can pass an earlier date (resume, change-pattern) never read `week` / `absentWeeks`.
- **Built in:** TASK-975.
