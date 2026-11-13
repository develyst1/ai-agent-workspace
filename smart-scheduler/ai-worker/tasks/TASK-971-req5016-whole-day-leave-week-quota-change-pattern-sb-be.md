# TASK-971: BE, REQ-5016 Team B slice: whole-day leave + leave quota per course week, change-pattern act + resume (smart-scheduler-back) — @Bob
**From @Silver, 2026-11-13.**
- **REQ / SPEC:** REQ-5016 · **SPEC-109 § 3.3, § 3.4, § 4, § 8 (Team B, Bob)**. Sector owns the design; I review you, and Sector reviews the integration.
- **Repo:** SB `dong` (committed base `738b6eb`). **Git:** none.
- **Size:** ≈ 1.75 d.
- **Claim:** Team C's (Porter granted per SPEC-109's file lists). **You touch only the files below.**

## ORDER (Porter + SPEC-109 § 8a, 2026-11-13). Read this first
- **Start NOW: step 2 only** (the quota per course week). It needs only `courseWeekOf(courseStart, date)`, and § 8a's proposed signature matches the file today.
- **Steps 1, 3 and 4 wait** until Porter tells you that Brew has **confirmed** `course-pattern.ts` + the migration + `courseSlotsOf(exec, courseId)`. § 8a is PROPOSED until then.
  - ~~⚠️ The file today has `expandPattern(startDate, slots, size, absentWeeks)`, while § 8a proposes `expandPattern(courseStart, fromDate, slots, count, absentWeeks?)`. Use whatever Brew confirms.~~
  - **Settled by SPEC-109 § 8b (FINAL, Sector 2026-11-13).** Use exactly `expandPattern(course.startDate, newSlots, remainingCount, new Set(), fromDate)`. Brew adds the 5th parameter (backward compatible), and the returned `week` stays the course week.
  - `nextFreeSlot` returns `PatternRow | null`. The ordering helper is `orderPattern`.
  - Steps 1 / 3 / 4 still wait for my ping that Brew's `fromDate` parameter and `courseSlotsOf` are in.
- **Read the course's slots** only through Brew's `courseSlotsOf` (`null` = one-slot course). Write `course_slots` **only** inside the change-pattern act (delete + insert, one transaction).

## Built on (never edit these; ask through me → Porter → Sector)
- `src/lib/course-pattern.ts` (Brew, TASK-969), read 2026-11-13: `Slot`, `orderPattern`, `courseWeekOf(startDate, date)` (1-based), `slotDateInWeek`, `patternProblem(slots, min)` (min 1 for a change), `expandPattern(startDate, slots, size, absentWeeks)`, `occurrencesAfter`, `nextFreeSlot`.
- `drizzle/0081_course_slots.sql` and `course_slots` in `schema.ts` (Brew). **You add no migration.**
- If Brew changes a signature you use, re-read and adapt. Say so in Notes.

## Closed file list
- `src/services/scheduler.service.ts`, **only:**
  - the two charged-leave doors that do `leaveUsed + 1` (l.4351 and l.4954 on `738b6eb`; re-grep, the lines move);
  - the whole-day branch of the sick-leave action;
  - a **new** change-pattern act + preview next to `runCourseTeacherTimeChange` (l.6562);
  - `resumeCourse` (l.6375), its pattern branch only.
  - Brew edits other functions in this file. **Re-read before every edit.**
- `src/services/undo.service.ts` l.159, the un-leave `leaveUsed - 1`.
- `src/routes/api.ts` + `src/lib/route-access.ts`: `POST /courses/:id/change-pattern` and `/preview`, gated like `/courses/:id/change-teacher-time` (`action:bookings.course-plan`).
- `src/validation.ts` + `src/types/contract.ts`: **only** the `wholeDay` flag and the change-pattern body / response (append; Brew owns the create / preview / DTO parts).
- New tests + `*.mutations.json` (`*task971*`).

## What to build (SPEC-109 § 3.3 / § 3.4; the summary below doesn't replace them)
1. **Whole-day leave:** `PATCH /bookings/:id/status` `action: "sick-leave"` + `wholeDay?: true`.
   - Only for a course row; otherwise 400 `VALIDATION`.
   - Every **live** row of that course on that date becomes `SICK_LEAVE`, in **one** transaction.
   - Notices: **one** parent LINE message (the existing leave message, listing every time) and one coach notice per coach.
   - Per-hour leave (no `wholeDay`) stays byte-identical.
2. **The quota counts weeks.** A charged leave increments `leave_used` only when **no other charged leave row of the same course sits in the same course week** (`courseWeekOf(course.startDate, row.date)`). The un-leave / undo decrements only when it removes **the last** charged leave row of that week.
   - Both doors and the undo.
   - A one-slot course behaves exactly as today (one row a week).
   - A whole-day leave of 2 hours = **1** week used.
3. **Change the pattern:** `POST /courses/:id/change-pattern[/preview]` `{ fromDate, pattern: Slot[] }` (1…21 slots, `patternProblem(p, 1)`).
   - Every **untaught** row (live, date ≥ `fromDate`) is re-placed **in order** onto `expandPattern(fromDate, pattern, n)`, where n = that count. Taught rows stay.
   - TASK-838's shape:
     - one transaction;
     - `assertTeacherBookable` + `reconcileBookingHolds` per moved row;
     - a clash gives `SLOT_TAKEN` naming the date, and the whole act rolls back;
     - the preview is the act in a rollback;
     - notices: one per family, and the coach pair as `sendCourseTeacherChange`.
   - **Rewrite `course_slots`:** 2+ slots → replace the rows; 1 slot → delete them and set `course_packages.weekday` / `start_time`.
   - Response: `{ moved, rows: BookingDTO[], notices }` (SPEC § 4).
4. **Resume:** a course **with** `course_slots` re-plans onto its pattern from the resume date (`expandPattern`). A course without slots keeps today's code path, byte for byte.

## Done = (paste the real output in Notes)
- `bunx --package typescript@5.9.3 tsc --noEmit` → 0.
- **SAFE suite** (SYSTEM-FACTS l.4327 env) → 0 fail. **Green before you hand in** (one shared suite, SPEC-109 § 8 risk 2).
- **Tests, each failing when its code is removed:**
  - whole-day: 2 hours that day → both SICK_LEAVE, 1 parent message, quota +1;
  - 2 single-hour leaves in one week → quota +1; in 2 weeks → +2;
  - undoing one of two in a week → no decrement; the last one → −1;
  - a one-slot course quota is unchanged from today;
  - change-pattern: taught rows untouched, the count kept, order and coaches per slot, a clash rolls back, `course_slots` rewritten (2+) or deleted (1);
  - resume of a pattern course vs a one-slot course (old path).
- **Mutants**, including "a one-slot course takes the new path" (SPEC § 5) → all bite.
- **A rolled-back sid proof** (host .206 checked first): one pattern course built in the transaction; a whole-day leave plus a change-pattern; residue 0.
- Report in inbox/SA-B.md as a **1–3 line pointer**; the detail goes in Notes.

## Questions
_(—)_

## Implementation Notes (Bob)
### Step 2 (the leave quota in COURSE WEEKS) — DONE 2026-11-13 (steps 1, 3, 4 wait for Brew's confirmation, per the ORDER)
- **New** `src/lib/leave-week-quota.ts`: `noOtherChargedLeaveInWeek` (pure, built on `courseWeekOf` — I never edited `course-pattern.ts`), `weekQuotaApplies` (the ONE gate: a pattern course = **2+ `course_slots` rows**; anything else = the one-slot course), `leaveTakesNewWeek` (the doors' question), `undoReturnsWeek` (the undo's: «is anyone else charged in this week?» asked AFTER the row's own flip back).
- **Doors (`scheduler.service.ts`, re-grepped; Brew edits this file, so I re-read first and edited only the two guards + one import):** door 2 (the plan editor's mark absence) `if (charged && (await leaveTakesNewWeek(tx, courseId, b.id, b.date)))`; door 1 (the sick-leave action) `if (charges && (await leaveTakesNewWeek(tx, current.courseId, id, current.date)))`. The increment SQL and the two sites are unchanged (a test pins exactly two).
- **Undo (`undo.service.ts`):** `if (leaveRefunded && (await undoReturnsWeek(tx, row.courseId, row.id, row.date)))`; the `GREATEST(… − 1, 0)` floor untouched.
- **One-slot course = today, byte for byte:** `weekQuotaApplies` is false ⇒ `leaveTakesNewWeek` / `undoReturnsWeek` answer **true** after the single `course_slots` read and read nothing else. Because `courseSlotsOf` (Brew) is not confirmed yet I read the table directly in this one helper — **swap to `courseSlotsOf` when Brew confirms** (it is one line). The helper also answers false (no throw) for an executor that carries no `courseSlots` relation: the DB-free fakes of the older leave / undo suites (dozens of files) have none, and they must keep running the old path untouched.
- **Legacy note:** a pattern course's leaves recorded BEFORE this rule (two charged rows in one week, each already counted) keep their counter; undoing one of them returns nothing while the other stays. Only 969's new pattern courses can have two charged leaves in a week, so this cannot occur on data older than 969.
- **Tests:** `src/lib/leave-week-quota-task971.test.ts` (12): the pure rule (same week / next week / the course-week boundary / a mid-week start), the gate (0·1·2·3 slots, no relation), one-slot ⇒ always + nothing else read, whole-day of 2 hours = ONE unit, 2 single-hour leaves in one week +1 / in two weeks +2, undo of one of two ⇒ no return, the last ⇒ −1, another week's row does not hold this week, the where-clause parts, both doors + the undo + the import by source. **Mutants `src/lib/leave-week-quota-task971.mutations.json`: 11 / 11 bite** (incl. «a one-slot course takes the new path», «every course is a pattern course», both doors, the undo).
- **One pin changed (🔻 TASK-971):** `pre-start-declared-absence-task609.test.ts` (the «every increment sits behind a charge decision» regex also accepts the guard that now asks the week rule).
- **Whole-day (step 1) is not built**, so the by-value "whole-day: 2 hours → both SICK_LEAVE, 1 parent message" test comes with step 1; the 2-hours-one-unit arithmetic above is proven at the helper the whole-day branch will call.

### ⚠️ Suite state — NOT green, and not from step 2
- `tsc --noEmit` (5.9.3): **1 error, `src/routes/api.ts(412,135) TS2554 expected 2-6 args, got 7`** — a call site of Brew's in-flight create (not mine; my `api.ts` lines are the four change-activity routes).
- SAFE suite: **6032 pass / 25 fail**. I read the assertion of the first dozen and the names of the rest: they point at Brew's TASK-969 work in flight in the shared tree (the course create / readers / resume rewrite, migration 0080's journal pin, the doors-list counts, the 627 anchors duplicated by his copies of `sendCourseTeacherChange(tx, plan.moves)` and `sessions: flagged,`, the route classification and `actorOf` counts for his new routes). **None I read touches the lines I edited** (I did NOT revert my edits to prove it — the tree is shared and Brew is editing the same file — so treat this as my reading, not a proof; the one failure that WAS mine, the TASK-609 guard regex, is fixed). Before step 2 the suite was 5996 pass / 0 fail (after TASK-961 / D-155-1). I can't hand in a green suite until Brew's side settles — telling you now so the "green before hand-in" rule (SPEC-109 §8 risk 2) is not read as met.

## Review
_(Silver; then Sector for the integration)_

### Interim review — step 2 (quota per course week) — @Silver, 2026-11-13: ✅ for this step
- **Re-run by me:** `leave-week-quota-task971.test.ts` gives **12 / 0** (SAFE env). Bob reports mutants 11 / 11, including "a one-slot course takes the new path".
- **Diff read:** `undo.service.ts` decrements only when `undoReturnsWeek(...)`, which is asked after the row's own flip back. A one-slot course always gets true, so it behaves as today.
- **New file `src/lib/leave-week-quota.ts`:** accepted, a new lib of this TASK's own. Add it to the Notes file table.
- **The suite is red (25 fail + 1 tsc error, `api.ts:412`) from Brew's in-flight TASK-969, not this step.** Fine for an interim. **TASK-971 can't be DONE until the shared suite is green.**
- **Next:** steps 1 / 3 / 4 on Porter's ping (Brew's `fromDate` and `courseSlotsOf`).

### Steps 1, 3, 4 — BUILT 2026-11-13 (after Silver's GO; Brew's `expandPattern(…, fromDate)` and `courseSlotsOf` confirmed). **The rolled-back sid proof is BLOCKED**: `0081_course_slots` (Brew's, TASK-969) is not applied on sid (`db:verify`: Journal 82 · witnesses 81 · only 0081 pending), so `course_slots` does not exist there. I did not apply it (his queue line). The proof script is written and ready; it needs 0081 on sid, then it runs in one call.
- **Done =:** `tsc --noEmit` (5.9.3) **0** · SAFE suite **6128 pass / 0 fail** (this is the whole shared suite, green at my last run) · my new tests: `pattern-change-task971` (lib, 9) · `services/pattern-change-task971` (11 + the body / route / gate pins) · `services/whole-day-leave-task971` (10) · `leave-week-quota-task971` (12, step 2). **Mutants:** `pattern-whole-day-task971.mutations.json` **27 / 27 bite** (incl. «a one-slot course takes the new path» on resume, R2) + step 2's 11 / 11. The 7 mutants that touch the shared `scheduler.service.ts` ran in one short burst; file checksum identical after.
- **Step 1, whole-day leave** (`recordWholeDayLeave`, `scheduler.service.ts`): `PATCH /bookings/:id/status` `{ action: "sick-leave", wholeDay: true }` → every LIVE hour of that course on that date (the clicked row first) goes through the SAME door a single hour uses (`updateBookingStatus` with an optional 7th arg `{ tx, quiet }`: the caller's transaction, no per-row notice), in ONE transaction: advance-notice rule, charge, make-up per hour (pattern-aware), holds, CRM, room check — a refusal on any hour rolls the whole day back. The quota counts weeks (step 2), so 2 hours = +1. Notices: `sendLeaveNotice` gained an optional `times` + audience filters (it stays THE one construction of `leave_notice`): the admins ONCE and each coach ONCE for HIS hours, each listing every hour (`Time` prints `10:00-11:00, 11:00-12:00`; absent ⇒ byte for byte as before). Only a course row (400 `VALIDATION`); the body refuses `wholeDay` with any other action. Per-hour leave (no flag) never enters the new function.
- **Step 3, change-pattern** (`POST /courses/:id/change-pattern[/preview]`): pure planner `src/lib/pattern-change.ts` + the act in **its own file `src/services/course-pattern-change.service.ts`**. TASK-838's shape; the untaught rows (live, ≥ `fromDate`) go IN ORDER onto `expandPattern(course.startDate, pattern, n, new Set(), fromDate)`; `assertTeacherBookable` + `reconcileBookingHolds` per row; a clash ⇒ 409 `SLOT_TAKEN` naming date + time and the whole act rolls back; CONFIRMED rows return to PENDING + `reconfirmNeededSince`; `course_slots` rewritten (2+) / deleted (1 slot: the course's weekday / start_time carry it); expiry grows, recorded; coach pair via `sendCourseTeacherChange` (now exported). Response `{ moved, rows: BookingDTO[], notices: { coachesUnassigned, coachesAssigned, needsReconfirm }, firstDate, lastDate, expiryDate, … }`. The preview = the act in a rollback. Same gate as change-teacher-time.
- **Step 4, resume:** `resumeCourse` asks `courseSlotsOf`; a course WITH slots (2+) lays its owed rows on `expandPattern(…, input.startDate)` — each row its slot's coach and time, the course's weekday / start_time left alone; a course WITHOUT slots runs the old lines byte for byte (every pinned line is still verbatim; the pattern bits are additive around them).
- **Files touched:** `lib/leave-week-quota.ts`, `lib/pattern-change.ts`, `services/course-pattern-change.service.ts` (new) · `services/scheduler.service.ts` (door guards, 7th arg, `recordWholeDayLeave`, `sendWholeDayLeaveNotices`, `sendLeaveNotice` options, resume's pattern branch, `sendCourseTeacherChange` export) · `services/undo.service.ts` · `routes/api.ts` · `lib/route-access.ts` · `validation.ts` (`wholeDay`, `changeCoursePattern`) · `lib/line-message.ts` (`times` on `leave_notice`) · tests + mutations. (`types/contract.ts`: the request / response shapes are in the code comments + the zod schemas; I added no new interface — say if you want it there.)
- **Pins I changed (🔻 TASK-971):** `pre-start-declared-absence-task609` (the guard regex), `counter-sql-req108` (`runTx`), `closed-day-task959` (doors list +1 file), `rbac-stage1-users-req092` (actorOf 30 → 32), `course-ended-writes` (2 routes `guarded`).
### ⚠️ Gaps / decisions for you
1. **Whole-day «one parent LINE message»:** today's leave notice has NO parent recipient (TASK-305's ruling: the parent is the one who declared it) — it goes to the admins and the coaches. I did **not** invent a parent message: the whole-day act sends the existing notice once per admin-set and once per coach, listing every hour. If you want a message to the family (new wording → ขวัญ), say so; it is one more enqueue in `sendWholeDayLeaveNotices`.
2. **Pre-start declaration:** a whole-day declaration on a not-yet-started course adds its week per hour declared (today's per-row rule; I did not touch that line — 3 mutation sets and a pin anchor on it). Say if one act should add ONE week.
3. **Change-pattern notices:** like TASK-838 the family hears nothing at the act — the rows go back to PENDING and "ยืนยันทั้งคอร์ส" sends one schedule message per person. SPEC says "one per family"; that is what this gives at the re-confirm.
4. **Coach record:** `coachChangedAt` / `latestTeacherId` only for a ONE-slot result (a several-coach pattern has no single latest coach).
5. **Resume of a pattern course ignores the admin's single `startTime` / `teacherId`** (each slot has its own). The body still requires them (unchanged); Fanta may want to hide those fields for a pattern course.
6. **Why a new service file:** `scheduler.service.ts` was overwritten by a concurrent writer twice while I edited it (my first change-pattern insert vanished; I re-applied and verified each edit after). The new act lives in its own file so it cannot be clobbered; everything in the shared file is small and verified present (grep) at the end.
7. `weekQuotaApplies` reads `course_slots` itself (count ≥ 2) rather than `courseSlotsOf` (it lives in the service, and `lib/` cannot import it without a cycle); same rule (`isPattern`: 2+), noted for a later unification.

### Review — steps 1 / 3 / 4 — @Silver, 2026-11-13: ✅ built, with ONE rework and ONE blocked proof
- **Re-run by me:**
  - SB `tsc --noEmit` → **0**;
  - full SAFE `bun test` → **6128 pass / 0 fail**. That is the whole shared tree, Team C's work included.
  - The test files are present: `pattern-change-task971` (lib + services), `whole-day-leave-task971`, `leave-week-quota-task971`, plus the two mutation sets. He reports 27 / 27 + 11 / 11.
- **His 7 points:**
  1. **No parent LINE message on leave:** accepted [SA-decided]. Today's leave notice has no parent recipient (TASK-305), so AC-4's real aim, *not one message per hour*, is met: one notice per admin set and per coach, listing every hour. **A new family message would be new wording for ขวัญ, so Porter asks if wanted.** Nothing more is built until then.
  2. **🔁 Rework: the pre-start declaration adds a week PER HOUR.** That contradicts AC-4's "counted in WEEKS". [SA-decided] **One week per course week declared:** a whole-day declaration of 2 hours on a not-yet-started course adds **one** week. Use `courseWeekOf` as in step 2. A one-slot course is unchanged (one row a week). Update the 3 mutation sets and the TASK-609 pin, tagged 🔻 TASK-971, plus one test.
  3. **Change-pattern tells the family at the re-confirm** (the TASK-838 shape): accepted.
  4. **Coach record only for a one-slot result:** accepted.
  5. **Resume of a pattern course ignores the single `startTime` / `teacherId`:** accepted. Hiding those fields is the DropResume dialog, **Flash's** (Team C), so it goes to Sector via Porter.
  6. **The act in its own file `course-pattern-change.service.ts`:** accepted. ⚠️ **His edits to `scheduler.service.ts` were overwritten twice by a concurrent writer.** He re-applied them and checked each one. I flag this to Porter / Sector as a risk on the shared file.
  7. **`weekQuotaApplies` reads `course_slots` directly** (it can't import from the service without a cycle): accepted for now. Noted for unification.
- **The rolled-back sid proof is BLOCKED:** `0081_course_slots` (Brew's, TASK-969) isn't applied on sid. **Brew applies it through MIGRATION-QUEUE** (Team C's migration; Bob doesn't). Then Bob runs his ready script.
- **Next:** the rework in point 2, then the sid proof after 0081. Then my final review, then REQ-5016 → SPEC_DONE (with Sector).

### Rework (review point 2) — DONE 2026-11-13: a pre-start declaration adds ONE week per COURSE WEEK declared
- `lib/leave-week-quota.ts` → `declarationTakesNewWeek(exec, courseId, rowId, rowDate)`: a ONE-slot course ⇒ always true (today, one row a week); a PATTERN course ⇒ true only when no OTHER declared absence of the course (status SICK_LEAVE + `planned_at_creation`, the shape every declaration is born in; not this row) sits in the same course week (`courseWeekOf`, as step 2). Both doors ask it before `addLeaveWeek` (door 1 `if (declaredFree && current.courseId && (await declarationTakesNewWeek(…)))`, door 2 the same): a whole-day declaration of 2 hours on a not-yet-started pattern course adds **one** week.
- Pins / mutants re-pointed (🔻 TASK-971, the SAME mutants on the new line text): `declared-absence-stretches-expiry-task646` / `leave-refused-no-validity-task692` / `leave-week-triggers-task656` mutation sets (1 + 2 + 8 anchors) and the 656 source pin; the TASK-609 guard regex was already widened. **All three sets still bite: 3/3, 12/12, 29/29.**
- Tests (in `leave-week-quota-task971.test.ts`, +5): 2 hours same week ⇒ first adds, second does not · two course weeks ⇒ two · one-slot ⇒ always and nothing else read · the where-clause parts · both doors by source. Mutants X1–X4 added: **step 2's set is now 15 / 15** (X1 «always yes», X2 «one-slot takes the rule», X3/X4 each door).
- **tsc 0 · SAFE 6133 pass / 0 fail.** Sid proof: still waits for Brew's `0081_course_slots` on sid (script ready).
- ⚠️ One consequence to know: an at-creation planned absence is the same shape as a declaration, so a pre-start declaration in a course week that ALREADY holds one adds no extra week (that week was already counted when the course was created).
### Review — the one-week rework — @Silver, 2026-11-13: ✅
- `scheduler.service.ts` l.4487 adds the leave week only when `declarationTakesNewWeek(...)` is true (`leave-week-quota.ts` l.51). A one-slot course is unchanged.
- **Re-run by me:** SB `tsc` **0**. `leave-week-quota-task971` + `pre-start-declared-absence-task609` give **33 / 0**. He reports SAFE 6133 / 0, step-2 mutants 15 / 15, and the 3 older sets re-pointed and still biting.
- **His note, accepted:** a planned absence at creation shares the week, so a declaration in that same week adds nothing. That fits "counted in weeks".
- **Left:** the rolled-back sid proof. 0081 **is now applied on sid** (MIGRATION-QUEUE l.50), so it can run now. Then "released" on `scheduler.service.ts`, then my final review.

### Rolled-back sid proof — DONE 2026-11-13 (0081 applied on sid: `db:verify` ✅ Journal 82 · ledger 130 · witnesses 82)
Host **154.197.124.206** = sid (checked first). ONE transaction, rolled back: a PATTERN course built inside it (size 8, 2 slots on one weekday = Mon 10:00 coach 1 + Mon 11:00 coach 2, 4 weeks × 2 hours, week 3 CONFIRMED); `db.transaction` is a savepoint of it, so everything the real services do rolls back. Run twice:
- **Not started (pre-start declaration):** whole-day leave on week 2's Monday (both hours): **both SICK_LEAVE**; `leave_used` 0 (declared = free); the expiry moved **+7 days ONCE** (one week for two hours — the rework); notices: **admin ×1 listing `10:00-11:00, 11:00-12:00`, coach 1 ×1 `10:00-11:00`, coach 2 ×1 `11:00-12:00`** (not 2 + 2 + 2).
- **Started (one delivered class in the past):** the same act: **both SICK_LEAVE**, **`leave_used` = 1** (two hours of one course week = ONE unit), expiry unchanged, the same three notices.
- **Change-pattern** (after the leave, from week 3; preview first, then the act): 6 untaught live rows → **moved 6, preview = act (moved / first / last), count kept (6 live before and after)**, the rows before `fromDate` and the two SICK_LEAVE rows byte-unchanged, new dates Tue 10:00 (coach 2) + Thu 11:00 (coach 1) from 2026-12-08 on (each slot on ITS coach), **`course_slots` rewritten** to (Tue 10:00, Thu 11:00) ord 0, 1, size / used_sessions unchanged, `leave_used` unchanged (0 / 1), `reconfirm_needed_since` set, the CONFIRMED rows back to PENDING, notices `{ coachesUnassigned 2, coachesAssigned 2, needsReconfirm 4 }`.
- **Residue after the rollback: 0** (the course, the marked bookings, orphan slots, outbox rows with `times` — all 0).
- Not asserted in the script: make-up rows (they are born CONFIRMED, my counter looked for EXTENDED and printed 0) — the make-ups are proven by the in-memory suite (2 make-ups for a 2-hour day).
### Final review — @Silver, 2026-11-13: ✅ DONE
- **The rolled-back sid proof (host .206, 0081 applied, residue 0) shows each rule on the real database:**
  - **Whole day before the start:** both hours go to SICK_LEAVE, the expiry moves **+7 once**, and there are 3 notices (admin, coach 1, coach 2), not 6.
  - **Whole day after the start:** `leave_used` +1 for two hours.
  - **Change-pattern:** 6 rows moved, preview = act, the count kept, taught and leave rows untouched, each slot on its own coach, `course_slots` rewritten, CONFIRMED rows back to PENDING for the re-confirm.
- **Make-up rows** weren't asserted on sid (his counter looked for the wrong status). Accepted, because the in-memory suite proves them (2 make-ups for a 2-hour day).
- **Earlier re-runs by me:** tsc 0, SAFE 6128 → 6133 / 0, the quota files 33 / 0.
- **"Released":** Bob no longer holds `scheduler.service.ts`. Told Porter.
- **Security review:** the new routes use existing gates (`action:bookings.course-plan`; the sick-leave action's own gate). The body is validated (`patternProblem`, zod). Nothing is trusted from the client beyond slots, which go through `assertTeacherBookable` per row. **No findings.**
- **Routing:** acknowledged by Bob (the chain is Bob ↔ Silver only).
