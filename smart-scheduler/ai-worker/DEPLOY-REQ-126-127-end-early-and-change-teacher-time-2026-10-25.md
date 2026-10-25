# DEPLOY — REQ-126 (TASK-837) "ตัดจบคอร์ส" + REQ-127 (TASK-838) "เปลี่ยนครู / เวลา ทั้งคอร์ส" — sid first, then uat — @Sober, 2026-10-25
**For @Porter → the owner.**
- **Both apps go together.**
- **⚠️ `db:migrate` is needed: `0072_course_end_reason_ended_early`** (journal 72 → 73).
- **837 and 838 ship as ONE commit per repo:** they share `scheduler.service.ts` on both sides.

## 0 · What is in it
- **837 (REQ-126):**
  - the end-course button and dialog read **"ตัดจบคอร์ส / End course early"** (all 6 strings owner-approved, verbatim);
  - a 5th end reason **"ตัดจบคอร์ส / Course ended early"**, also shown in the coach's LINE. It is **course-only**: a voucher end refuses it.
  - **The end act itself is unchanged:** the remaining sessions are removed, the coaches are told, the family isn't, and the revenue is untouched.
  - **Hardening found on the way:** `TEACHER_LEAVE` sent to the end-course door now gets a clean **400**. Before, it got a latent 500, because the DB check never allowed it.
- **838 (REQ-127):**
  - ONE button **"เปลี่ยนครู / เวลา ทั้งคอร์ส"** moves the course's remaining live sessions **in place** to a new teacher, day and time. The dates come from the resume planner. One transaction; a clash rolls it all back.
  - **Delivered sessions are untouched**, so the first-coach history is kept. No cancelled rows, no pause stamp.
  - **ONE LINE to the old coach + ONE to the new coach per act** (the existing teacher-change notice, now able to list several sessions; byte-identical otherwise).
  - CONFIRMED sessions go back to PENDING, and the screen shows the approved **"{n} คาบต้องยืนยันใหม่"** alert. The admin then presses **"ยืนยันทั้งคอร์ส"**, which sends ONE schedule message per person.
  - **The permission:** `action:bookings.course-plan` (the plan editor's key).

## 1 · Verified by me on clean copies (final, the combined 837 + 838 trees)
| | result |
|---|---|
| **back** `bd69978` + 61 files (**no `.env`**; Team B's TASK-749 WIP **excluded**) | tsc 0 · SAFE suite **5,128 / 0**, 367 files · unhandled 0 · **migrations 73 = journal 73** · sets 838 **12/12** · 837 8/8 · 690 9/9 |
| **front** `46c6ee1` + 16 files | tsc 0 · `bun test` **1,382 / 0**, 146 files · unhandled 0 · **build 0** (the tree unchanged by it) · sets 838 **13/13** · 837 9/9 |

0 survivors, checksums identical. **The back tree was checked against its frozen md5s after the front run: unchanged.**
**Not proven yet:** the real DB (the migration), a real LINE send, a real browser. That is sid, with Tanya.

## 2 · Commit lists (`git status --short -uall`, taken by me)
### back: `smart-scheduler-back` (61 entries; **only these**. The tree ALSO holds Team B's uncommitted TASK-749, listed below, which must NOT go in this commit)
```
     M drizzle/meta/_journal.json
     M src/lib/advance-leave-co-taught-task826.test.ts
     M src/lib/archive-parent-req098.test.ts
     M src/lib/archive-student-req093.test.ts
     M src/lib/birth-month-req099.test.ts
     M src/lib/booking-rental-row-req091.test.ts
     M src/lib/budget-visibility-req102.test.ts
     M src/lib/bulk-confirm-extended-req094.test.ts
     M src/lib/camp-3b-undo-qr-reminder-req095-3b.test.ts
     M src/lib/camp-day-rate-req104.test.ts
     M src/lib/camp-on-grid-req095-11.test.ts
     M src/lib/camp-per-coach-window-req105.test.ts
     M src/lib/camp-req095-3a.test.ts
     M src/lib/camp-week-500-family-dedupe-req104.test.ts
     M src/lib/coach-notice-inventory-task512.test.ts
     M src/lib/coach-rate-req095-13-3.test.ts
     M src/lib/coach-rate-visibility-req102-6.test.ts
     M src/lib/course-plan.ts
     M src/lib/course-rental-round2-req091-14.test.ts
     M src/lib/duo-course-req095-13.test.ts
     M src/lib/group-price-and-walkin-req095-2b.test.ts
     M src/lib/group-series-extender-req105.test.ts
     M src/lib/group-series-req104.test.ts
     M src/lib/group-session-req095-2a.test.ts
     M src/lib/group-slot-yield-req105.test.ts
     M src/lib/line-i18n.ts
     M src/lib/line-message.ts
     M src/lib/migration-witness.ts
     M src/lib/oa-write-guard-req105.test.ts
     M src/lib/other-schedule-req095.test.ts
     M src/lib/other-series-req101.test.ts
     M src/lib/rbac-stage1-users-req092.test.ts
     M src/lib/rbac-stage2-menu-guard-req092.test.ts
     M src/lib/rbac-stage3-actions-req092.test.ts
     M src/lib/rbac-stage4-roles-req092.test.ts
     M src/lib/rich-menu-relink-req105.test.ts
     M src/lib/route-access.ts
     M src/lib/school-issue-reason-task690.mutations.json
     M src/lib/school-issue-reason-task690.test.ts
     M src/lib/subject-kind-req095-13-4a.test.ts
     M src/lib/teacher-own-calendar-req097.test.ts
     M src/lib/teacher-reassigned-notice-req097.test.ts
     M src/lib/teacher-told-on-cancel-req089.test.ts
     M src/lib/voucher-end-req103.test.ts
     M src/lib/webhook-ack-first-req105.test.ts
     M src/lib/whole-course-rental-req091.test.ts
     M src/lib/witness-observability-req105.test.ts
     M src/routes/api.ts
     M src/services/course-end.service.test.ts
     M src/services/course-ended-writes.test.ts
     M src/services/course-expiry-edit.test.ts
     M src/services/leave-week-triggers-task656.test.ts
     M src/services/province-and-note-req088-9.test.ts
     M src/services/scheduler.service.ts
     M src/validation.ts
    ?? drizzle/0072_course_end_reason_ended_early.sql
    ?? src/lib/course-end-early-task837.mutations.json
    ?? src/lib/course-end-early-task837.test.ts
    ?? src/lib/course-teacher-time-change-task838.mutations.json
    ?? src/lib/course-teacher-time-change-task838.test.ts
    ?? src/lib/course-teacher-time-change.ts
```
**NOT in this commit (Team B's TASK-749, in progress):**
```
     M src/services/jobs.service.ts
    ?? src/lib/day-end-sweep-task749.mutations.json
    ?? src/lib/day-end-sweep-task749.test.ts
    ?? src/lib/day-end-sweep.ts
```
### front: `smart-scheduler-front` (16 entries)
```
     M src/components/partials/Bookings/EndCourseDialog.tsx
     M src/components/partials/Bookings/PlanModal.tsx
     M src/hooks/scheduler/useScheduler.ts
     M src/lib/i18n/dictionaries.ts
     M src/lib/rbac/action-gate.test.ts
     M src/lib/scheduler/session-cancel-reasons-task691.test.ts
     M src/lib/scheduler/voucher-end.test.ts
     M src/services/scheduler.mock.service.ts
     M src/services/scheduler.service.ts
     M src/types/api/contract.ts
     M src/types/app/scheduler/index.ts
    ?? scripts/mutation/task-837.json
    ?? scripts/mutation/task-838.json
    ?? src/components/partials/Bookings/ChangeTeacherTimeDialog.tsx
    ?? src/components/partials/Bookings/change-teacher-time-task838.dom.test.tsx
    ?? src/components/partials/Bookings/end-course-early-task837.dom.test.tsx
```

## 3 · Deploy: sid, then (after Tanya) uat
1. **Back:** pull, `bun install`, then **`db:migrate`: `0072_course_end_reason_ended_early`**.
   - It widens the course-end reason check; re-runnable; no data written.
   - **Expected after it: journal 73.**
2. **Front:** the usual build + restart. No env change, no script, no menu step.
3. **Back (with 0072) before or together with the front.**

## 4 · Tanya's gate on sid (then uat read-only)
- **837:**
  - the course's plan window shows **"ตัดจบคอร์ส"**; the dialog's title / line / confirm / done read the approved words;
  - pick the new reason ⇒ the course is ended, the remaining sessions are gone, the coach's LINE reason reads "ตัดจบคอร์ส", the family gets nothing, the revenue is unchanged;
  - a **voucher** end does NOT offer the new reason.
- **838:**
  - on a course with delivered + CONFIRMED + PENDING sessions left ⇒ "เปลี่ยนครู / เวลา ทั้งคอร์ส": the preview's n matches what moves;
  - after it, only the remaining sessions show the new teacher / day / time; the delivered ones are unchanged;
  - **exactly ONE LINE to the old coach and ONE to the new coach**;
  - the orange "{n} คาบต้องยืนยันใหม่" alert shows ⇒ "ยืนยันทั้งคอร์ส" ⇒ one schedule message each to the coach and the family;
  - a clash with the new teacher's other booking ⇒ refused, naming the date, nothing moved;
  - a user without the plan permission doesn't see the button.
