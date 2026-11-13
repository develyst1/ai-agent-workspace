# TASK-961: BE, change activity from the next class (course) + 1 HR / Trial, in smart-scheduler-back. @Bob, starts after TASK-942
**From @Silver, 2026-11-13.**
- **REQ / SPEC:** REQ-5014 · **SPEC-106 §§ 2, 3, 4, 5, 9.** The SPEC is the contract. Read it whole before you start.
- **Repo:** smart-scheduler-back (SB), branch `dong`.
- **Git:** none (the SA commits on the owner's word after sid + Tanya).
- **Size:** ≈ 3–3.5 d.
- **Order:** after TASK-942. Fanta (TASK-962) builds against the contract in parallel.

## Closed file list (add only what the SPEC needs; list every file you touched in Notes)
- `src/routes/api.ts`: 4 routes (course act + preview, booking act + preview), next to `/courses/:id/change-teacher-time` (l.181–184).
- `src/validation.ts`: `changeCourseActivity` and `changeBookingActivity`.
- `src/services/scheduler.service.ts`: the act functions.
  - Model them on `runCourseTeacherTimeChange` / `previewCourseTeacherAndTime`, but make them **new functions**: no flag on the per-session edit path, which keeps `COURSE_SUBJECT_LOCKED`.
- `src/lib/<new>-activity-change.ts`: a pure planner for rows, prices and difference, unit-tested like `course-teacher-time-change.ts`.
- `src/lib/booking-sale-amount.ts` + `src/lib/revenue-line.ts`: extract the category-name helper and a `relabelRevenueLine(tx, key, categoryName)` (SPEC § 4). It runs in a savepoint and never fails the caller.
  - **Sector reviews this hunk** (SPEC-107 § 0). His bar:
    - **one** exported category-name builder, which both `writeRevenueLine` and `relabelRevenueLine` call, and no second builder;
    - the existing revenue-line tests stay green **unchanged**;
    - **one new test** shows the writer and the relabel produce the same name for the same subject and duo flag.
  - When this hunk is green, say so in Notes. I'll route it to Sector through Porter.
- `src/lib/line-i18n.ts` + the notice payload types: `activity_changed`, and the optional `subjectName` on `teacher_assigned` (SPEC § 5).
- `src/db/schema.ts` + `drizzle/<next>_activity_changes.sql` + `drizzle/meta/_journal.json` + the witness in `lib/migration-witness.ts` (SPEC § 3).
- `src/types/contract.ts`: the request and response types.
- Tests: new `*.test.ts` files, and a `*.mutations.json`, as your recent TASKs have them.

## Steps
1. **Migration** (SPEC § 3), exactly that SQL.
   - **Number:** `ls drizzle/*.sql | tail -3` plus the journal tail. Take the next free number after TASK-942's and Team C's TASK-959's, and a `when` greater than every entry.
   - Add a line to `MIGRATION-QUEUE.md` saying the owner applies it on uat.
2. **The planner (pure):**
   - **Remaining rows** = `endableSessions` dated today or later, the same rule as TASK-838.
   - **Prices:**
     - old = `listPriceMinor(courseItemRef(oldGroup, size))`;
     - new = the same for the new group, or `null`;
     - for 1 HR, `sessionItemRef`; a Trial's difference is always 0.
   - **Difference** = `max(0, round_to_whole_baht((new − old) × remaining ÷ size))`. Her example: 100 → 120 for 10 classes, 4 left, gives 800 satang (8 ฿).
   - **The refusals in SPEC § 2.1**, as codes.
3. **The act, in one transaction:**
   - the rows' `subjectId` (+ `teacherId`, `reconcileBookingHolds` per row if the coach changes);
   - `course_packages.subject_id` (+ `coachChangedAt` / `latestTeacherId` as TASK-838 sets them; `first_teacher_id` untouched);
   - the history row;
   - the relabel (savepoint, with its result on `revenue_relabelled`);
   - the notices.
   - The preview is the act inside a transaction that is always rolled back.
4. **Check** that `courseLine`'s `subjectName` comes from `course_packages.subject_id` (cite the line). If it reads `bookings[0]`, switch it to the course's subject (SPEC § 4).
5. **Coach eligibility:** cite whichever check create/move use today, or write "none" in Notes. Add no new rule (SPEC R3).
6. **The admin guard:** the same one as change-teacher-time. Cite it.
   - **The booking routes** (`/bookings/:id/change-activity[/preview]`) use the same access key as `PATCH /bookings/:id` (the SF door reads `action:calendar.booking-edit`; Fanta, TASK-962 decision 2), so the door and the guard agree. Cite the `route-access.ts` entry you add.

## Done = (exact commands; paste the real output in Notes)
- `bunx --package typescript@5.9.3 tsc --noEmit` → 0.
- `bun test <your new files> + course-subject-lock + course-teacher-time-change + revenue-line` → all green.
  - Each test listed in **SPEC § 8 BE** exists and **fails when its code is removed** (paste one red run per mutation).
- **Rolled-back sid proof**, on host 154.197.124.206 only, checking `DATABASE_URL`'s host first:
  - change one course with 2 attended and N remaining classes, and show the attended rows unchanged, the remaining rows on the new subject, the history row, and the relabelled line category;
  - roll back;
  - residue 0.
- A Notes table with every file touched, and why.

## Questions
_(—)_

## Implementation Notes (Bob, 2026-11-13) — TASK-961 BE DONE
**Status:** built in SB (branch `dong`), applied + verified on sid (migration **0079**), rolled-back sid proof green. No git command. FE (Fanta, TASK-962) untouched.

### Done = (the real output)
- `bunx --package typescript@5.9.3 tsc --noEmit` → **0** errors.
- SAFE suite (`bun test`, the SAFE env): **before 5940 pass / 0 fail → after 5991 pass / 0 fail**. New: `src/lib/activity-change-task961.test.ts` (47 tests) · plus the pins below. `course-subject-lock`, `course-teacher-time-change` (838) and `revenue-line` stay green; **the existing revenue-line tests are UNCHANGED** (70/70 before and after the revenue hunk).
- Mutants: `src/lib/activity-change-task961.mutations.json` → **35 / 35 BITE** (checksum identical). One mutant (a Trial's `flat` flag) is EQUIVALENT — old and new are both `FIRST_TRIAL_MINOR`, so the difference is 0 either way — and was dropped. Mutants cover: the difference (max 0 / rounding / proportion), the live-status and today-or-later row rules, SAME_ACTIVITY, GROUP_COURSE, the three price rules, the unknown old price, the relabel (only `category_id`; no line ⇒ false), the category-name builder, every row/course/history write, the preview committing, the notices (family / coach unchanged / coach changed / subjectName / per-row), the 1 HR refusals, the migration (CASCADE, XOR CHECK), the witness, the route gate, the Thai wording, the ISO-date leak.
- **Rolled-back sid proof** (host **154.197.124.206** = sid, checked first; `DATABASE_URL` host only): one existing course (size 6, **2 attended + 4 remaining**, bike-skate → balance-private) changed through the real `changeCourseActivity`, every inner transaction a savepoint of ONE outer transaction that is rolled back. Result: remaining 4 (2026-11-16 … 2026-12-07) · old 649 000 → new 749 000 satang, CARD, **difference 66 700** (= (749000−649000)×4÷6 rounded to a whole baht) · **attended rows unchanged: true** · remaining rows on the new subject: true · the two non-remaining rows still on the old subject: true · `course_packages.subject_id` = new: true · size / expiry / used_sessions / leave_used / first_teacher_id unchanged: true · history row: remaining 4, size 6, CARD, 66 700, `revenue_relabelled = true`, actor `C-TEST-961` · revenue line: the course had NO posted line on sid, so the proof wrote one **inside the rollback with the real `writeRevenueLine`**: category «Private SURFSKATE · Private» → **«Balance Play (Private) · Private»** (= `revenueCategoryName("COURSE", new)`), amount / product_name / occurred_on **unchanged** · **residue after rollback: 0** (history rows 0; bookings, course and line byte-identical; no `activity_changed` outbox row).
- Migration on sid: `MIGRATION-QUEUE.md` has the `applying` + `applied · verified` lines (db:verify: Journal 80 · ledger 128 · witnesses 80). **uat: the owner applies it** (additive).

### The checks you asked me to cite
- **Step 4 — `courseLine`'s subject:** it comes from `course_packages.subject_id`: `src/lib/revenue-line.ts` `writeCourseLine` → `const subject = course.subjectId ? await sp.query.subjects.findFirst(… course.subjectId …)` then `courseLine({ subjectName: subject?.name … })`. It does NOT read `bookings[0]`. No change needed; a test pins the line and the absence of `bookings[0]`.
- **Step 5 — coach eligibility:** create and move enforce **no "teaches this subject" rule**. The only gate is `assertTeacherBookable` (`scheduler.service.ts` ~l.1043: archived · works that weekday · advance leave · FREELANCE budget set). The act reuses it per moved row (`moveRowToCoach`) and adds nothing (SPEC R3). (`teacherSubjects` is read only for listing / managing a teacher's skills.)
- **Step 6 — the admin guard:** course routes = `act(BOOKINGS, "action:bookings.course-plan")` (`route-access.ts`, the SAME entry as `/courses/:id/change-teacher-time`); booking routes = `act(CAL_BOOK, "action:calendar.booking-edit")` (as `PATCH /bookings/:id`). The auth middleware reads `route-access.ts`; the router itself adds no guard.

### Files touched (SB) and why
| file | why |
|---|---|
| `drizzle/0079_activity_changes.sql` + `drizzle/meta/_journal.json` (idx 79, `when` 1783000000075, unique + highest) | SPEC §3 table + 2 indexes, additive. Number 0079: 0077 = Team C closed_days, 0078 = TASK-942 |
| `src/lib/migration-witness.ts` | the witness: the `activity_changes` table |
| `src/db/schema.ts` | `activityChanges` table (same column names as the SQL = the seam to Team C). Placed BEFORE `bookingRentals`: a source pin (`booking_rentals[\s\S]*price`) reads the whole tail of the file |
| `src/lib/activity-change.ts` (new) | the PURE planner: remaining rows, price rules, difference, refusals as codes |
| `src/services/scheduler.service.ts` | 4 new service functions (`changeCourseActivity` / `previewCourseActivity` / `changeBookingActivity` / `previewBookingActivity`) — NEW functions, no flag on the per-session path (it keeps `COURSE_SUBJECT_LOCKED`); `sendActivityChangedNotices`; `moveRowToCoach`; `sendCourseTeacherChange` takes an optional `{ subjectName }` |
| `src/lib/booking-sale-amount.ts` + `src/lib/revenue-line.ts` | **the Sector hunk (below)** |
| `src/lib/line-i18n.ts` + `src/lib/line-message.ts` | `ob_activity_changed` (TH wording = your SA-proposed default, EN plain) + the `activity_changed` case; `teacher_assigned` prints the optional `subjectName` |
| `src/validation.ts` · `src/routes/api.ts` · `src/lib/route-access.ts` · `src/types/contract.ts` | the 4 routes, 2 validators, the gates, the request / response types |
| `src/lib/activity-change-task961.test.ts` + `.mutations.json` (new) | the tests + the mutation set |

### 🔻 Pins I changed (tagged `🔻 TASK-961`, the pre-approved class: counts / lists of things this task legitimately added)
- 39 test files: migration / journal / witness counts 79 → 80 (64 lines, each marked `🔻 TASK-961: +0079`).
- `closed-day-task959.test.ts` (doors list: `assertTeacherBookable(` 12 → 13 — the coach move; it moves no date) · `coach-notice-inventory-task512.test.ts` (the new coach-message producer, classified NAMED_BY_DESIGN) · `course-teacher-time-change-task838.test.ts` (`sendCourseTeacherChange(` calls 2 → 3) · `duo-course-req095-13.test.ts` (`householdLineUserIds(` 4 → 5) · `family-multi-account.test.ts` (`enqueueParentCopies(` 9 → 10) · `first-coach-task860.test.ts` (`coachChangedAt` 1 → 2, `latestTeacherId` 1 → 2: the activity change records a REAL whole-course coach change in the same two fields) · `group-price-and-walkin-req095-2b.test.ts` (`resolvePriceGroup(` 4 → 7) · `rbac-stage1-users-req092.test.ts` (`actorOf(c)` 28 → 30) · `message-trailing-req085-16-3` / `no-iso-date-leak` / `no-placeholder-leak` (message kinds 46 → 47) · `services/course-ended-writes.test.ts` (the 4 routes classified: course ones `guarded`, booking ones `unrelated`) · `park-several-groups-task942.test.ts` (my own 0078 "last journal entry" pin → "entry 78, 0079 right after").
- To keep 813 / 861 pins and `first-coach-task860.mutations.json` T3 valid I did not change their guarded lines; my coach-record update is spelled `{ latestTeacherId, coachChangedAt }` so T3's anchor still matches once.

### ⚠️ Sector's hunk (SPEC-107 §0) — **GREEN, ready to route**
`booking-sale-amount.ts` + `revenue-line.ts` only:
- **One** exported builder `revenueCategoryName(kind, subject, duo?)` (+ `revenueCategoryType`). `courseLine` and `trialOrSingleLine` (the writer) call it; so does the act's `relabelRevenueLine` call site. **No second builder** — a test asserts each literal pattern (`· Private|Duo`, `1st Trial (…)`) appears exactly once in `booking-sale-amount.ts` and not at all in `revenue-line.ts`.
- `ensureCategory(sp, type, name)` = the writer's find-or-create block, moved VERBATIM (same query order). `writeRevenueLine` calls it; `relabelRevenueLine(exec, key, {type, categoryName})` calls it, then `UPDATE bo.revenue_line SET category_id = … WHERE idempotency_key = key RETURNING id` — **only `category_id`**. Runs in a savepoint (`exec.transaction`); a failure is logged `[revenue] NOT RELABELLED …` and returns `false`; no line ⇒ `false`.
- The existing revenue-line / booking-sale-amount tests are green **unchanged** (70/70). **One new test** shows the writer's name = the relabel's builder name for the same subject and duo flag (and a recorder test proves the UPDATE's `set` has exactly one key).

### Decisions / gaps — please read
1. **Three codes SPEC §2 does not list** (all 409, Thai messages, no new rule of substance): `OLD_PRICE_NOT_ON_CARD` (the OLD activity has no card price for its size, so the difference cannot be computed — the history's `old_price_minor` is NOT NULL; I refuse rather than invent 0), `NOT_LIVE_BOOKING` (a 1 HR / Trial that is cancelled / on leave / paused — SPEC says "live status" but names no code), and a 1 HR in a group class returns `GROUP_COURSE`. Fanta needs messages for them — they are in the `contract.ts` comment.
2. **Preview = the act's refusals.** A preview that would hit SLOT_TAKEN / MANUAL_PRICE_NOT_ALLOWED etc. returns the same 4xx (not a "clashes" field like change-teacher-time). A preview that only lacks the typed price answers `newPriceMinor / priceSource / differenceMinor: null` (SPEC).
3. **A typed price = the course's full NEW price** in whole baht (`manualPriceBaht × 100` is `newPriceMinor`), compared with the OLD card price like a card price. Say if the SA meant something else.
4. **Duo (two-child) course is allowed** (SPEC §4: "Duo = the course's existing duo flag"); only a course with a GROUP class row is refused.
5. **Coach change in the act:** rows already on the asked-for coach are left alone; the others move (one `assertTeacherBookable` + `reconcileBookingHolds` per row, `SLOT_TAKEN` naming the date). The fake-transaction tests do not run this path end to end (the holds reconcile reads too deep for a fake): it is covered by `sendActivityChangedNotices` by value (pair + `subjectName`), the source pins, and — not by me — a second sid proof if you want one (the proof above is the no-coach-change case).
6. **Notice rendering:** the family and an UNCHANGED coach get one `activity_changed` sentence (TH = your proposed wording; `teacherName` rides in the payload but prints nothing — no approved label). A CHANGED coach hears the TASK-838 pair, the new coach's with `subjectName`. Porter still confirms the wording with ขวัญ.
7. The act posts / refunds / invents **no money**: the difference is shown for the admin to record by hand (SPEC §6, Team C).

## Review
_(Silver)_
### Review — @Silver, 2026-11-13: ✅ ACCEPTED (DONE), with one proof still owed (item 5)
- **Re-run by me:** SB `bunx --package typescript@5.9.3 tsc --noEmit` **0**. `bun test activity-change-task961 + revenue-line + course-subject-lock` gives **95 / 0**. `route-access.ts` l.188–191: the course routes are gated `action:bookings.course-plan`, the same gate as change-teacher-time, and the booking routes `action:calendar.booking-edit`. That matches Fanta's doors.
- **Evidence read:**
  - The sid proof is rolled back with residue 0: attended rows untouched, size / expiry / first coach unchanged, and the relabel moved only the category.
  - On sid, 0079 shows `applied · verified` (Journal 80).
  - The step 4 / 5 / 6 cites are present.
- **His gaps:**
  1. `OLD_PRICE_NOT_ON_CARD`, `NOT_LIVE_BOOKING`, and `GROUP_COURSE` on a 1 HR: **accepted** [SA-decided]. Refusing beats inventing an old price of 0. They are added to SPEC-106 § 2 by this line, and Fanta maps their messages (TASK-962).
  2. A preview returns the act's refusals: **accepted**. Fanta's dialog already shows a refusal on the preview.
  3. A typed price is the full new package price: **yes**, that is SPEC § 2.1.
  4. Duo (two-child) is allowed and group classes are refused: **yes**.
  5. **The coach-change path is not proven end to end. Owed:** one more rolled-back sid proof with a new coach. It must show rows moved, holds reconciled, the TASK-838 pair enqueued, and residue 0. **Do it after D-155-1's SB part** (TASK-942 § Fix D-155-1, still waiting in your inbox).
  6. `teacherName` is not printed: fine until ขวัญ approves wording.
- **Sector's hunk** (one builder; the relabel touches only `category_id`; old revenue tests unchanged at 70/70; one parity test): ready for him. Routed via Porter.
- **Security review:** the 4 routes sit behind existing gates (cited above). Inputs are validated (`validation.ts`). The act never trusts a request field for money or exemption: the price comes from the card or a bounded typed integer. No new data is exposed. **No findings.**

**Step 6 extended (Silver 2026-11-13):** the booking change-activity routes use the SAME access key as `PATCH /bookings/:id` — `action:calendar.booking-edit` (`route-access.ts`, both `POST /bookings/:id/change-activity` and its `/preview`); already so, pinned by a test and by mutant M4.

### Second rolled-back sid proof — WITH a coach change (Review item 5), Bob 2026-11-13
Host **154.197.124.206** = sid (checked first). One real course (size 6, **5 attended + 1 remaining**, old coach FREELANCE → new coach FREELANCE, bike-skate → balance-group) changed through the real `changeCourseActivity({ subjectId, teacherId })`, every inner transaction a savepoint of ONE outer transaction that is rolled back (the script tried candidate coaches in savepoints; 4 refusals / clashes before the 5th pair worked — each refusal wrote nothing).
- **Rows moved:** the 1 remaining row → on the NEW coach **and** the new subject; every attended / other row untouched (coach, subject, date, status identical).
- **Course record:** `subject_id` = new · `latest_teacher_id` = new · `coach_changed_at` set · `first_teacher_id` still the old coach.
- **History row:** `from_teacher_id` = old, `to_teacher_id` = new, remaining 1, difference 0 (cheaper), `revenue_relabelled` false (the sale posted no line for this course).
- **Holds reconciled:** `bo.movement` freelance (`fl:%`) rows **61 → 62** inside the transaction (the ceiling hour moved off the old FREELANCE coach / onto the new one by `reconcileBookingHolds`), **back to 61** after the rollback.
- **Notices enqueued (outbox rows, in the act's transaction):** `teacher_assigned` to the new coach **with `subjectName` = "Balance Play (Group)"** · `teacher_unassigned` to the old coach · ONE `activity_changed` to the family · **nobody else, and no `activity_changed` to a coach**. (All SKIPPED here: the sid coaches / parent have no LINE link, as expected.)
- **Residue 0:** history rows 0 · every row of the course back on the old coach and subject · the course's subject unchanged · no `activity_changed` outbox row left.
Both proofs now cover: no-coach-change (earlier, with the relabel) and coach-change (this one).
- **Item 5 closed (Silver, 2026-11-13):** the second rolled-back sid proof, with a coach change, is read and green. The 1 remaining row moved to the new coach and subject. The course record shows `latest_teacher_id` and `coach_changed_at`, with the first coach kept. The freelance holds went 61 → 62 → 61. The notices are exactly the TASK-838 pair (with `subjectName`) plus one family `activity_changed`, and residue is 0. **TASK-961 DONE, nothing owed.**

## Amendment 1 — a course on a typed-price activity can change again (TEST-157 re-test, Porter [PM-decided] 2026-11-13) — @Bob — @Silver
**⏸ Start ONLY after the owner's uat deploy** (the tree is frozen until then; Porter says go). It doesn't block uat.
**Why:** after a change to an activity with no card price, the course's current activity has no card price either. So the next change refuses with `OLD_PRICE_NOT_ON_CARD` (`src/lib/activity-change.ts` l.56), even a change back to the first activity.
**Rule [SA-decided, from Porter's ruling]:**
- **The old price:**
  1. the card price for (current group × size) when the card has one, which is unchanged;
  2. **else** the `new_price_minor` of the **latest** `activity_changes` row for this course whose `to_subject_id` = the course's current `subject_id` and `price_source = 'MANUAL'`;
  3. else `OLD_PRICE_NOT_ON_CARD` as today.
- The history row of the new change records that old price. `price_source` keeps describing the **new** price (CARD or MANUAL), so no column changes and no migration is needed.
- **1 HR / Trial:** no change. They always have a card price.
- **Files:** `src/lib/activity-change.ts` (the planner takes an optional `storedOldMinor`), `src/services/scheduler.service.ts` (read that one row in the act and the preview), tests and mutations. Nothing in SF: the dialog already shows whatever the server answers.
- **Tests:**
  - FREESKATE ×4 → Balance Play (Private) typed 5,500 → back to FREESKATE. The second change uses 5,500 as the old price, and the difference = max(0, 4,790 − 5,500) = **0** (no refund).
  - A course with no stored typed row still refuses `OLD_PRICE_NOT_ON_CARD`.
  - Two typed changes: the **latest** row wins.
  - A card price present beats a stored row.
  - Mutants: the stored row ignored; the oldest row taken instead of the latest.
- **Done =** SB tsc 0 · SAFE 0 fail · mutants bite · a rolled-back sid proof of the back-and-forth case, residue 0. Then my review, the next joint gate, «ขึ้น git», deploy, and Tanya.
- **EN «1 classes»: no work.** It's already fixed in SF `6c52040` (`previewLineOne`, `dictionaries.ts` l.777). Tanya's note came from the run before the fix.
