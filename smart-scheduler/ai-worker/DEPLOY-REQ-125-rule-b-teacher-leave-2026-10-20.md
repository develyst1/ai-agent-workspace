# DEPLOY — REQ-125 ruling B: one teacher's leave on a multi-teacher class removes only that teacher — sid first, then uat — @Sober, 2026-10-20
**For @Porter → the owner.** Agents commit nothing. **Both apps go together.**
⚠️ **This is the sid DB's FIRST migration since 0070 → the owner runs `db:migrate` (`0071_teacher_leave_removals`, journal 72).**

## 0 · What is in it (TASK-824 · 825 · 826 · 827 · 828)
- **824:** the building block "take one teacher off one class":
  - an extra teacher comes off;
  - the main teacher → the next free extra (by name) becomes main, at their own rate;
  - a GROUP moves its seats + the freelance hold via the existing group-swap code.
- **825:** same-day leave: a co-taught class with a teacher remaining **continues** (not cancelled, **families not told**). The last teacher's leave works exactly as before.
- **826:** advance leave + ranges on the same rule, **remembered**, so Cancel leave puts the teacher back as an extra. Plus a **preview** (the real rule run in a rolled-back transaction: it writes and sends nothing).
- **827:** one LINE per remaining coach per day ("these classes go on with you", + "you are now the main teacher" where promoted). The leaver's own notice gains one line. **Never a family.**
- **828:** the screens:
  - the before-save summary splits "continues" / "cancelled / to handle" (from the server preview);
  - "Continues with {names}" rows;
  - the "can't hand over" sentence;
  - the calendar strip counts only classes still to handle.
- **The owner's D1–D5 as recommended; all 7 strings approved and present verbatim.**

## 1 · Verified by me on clean copies of both whole trees (final)
| | result |
|---|---|
| **back** `01d7f04` + 76 files (no `.env`) | tsc 0 · SAFE suite **5,048 / 0**, 362 files · unhandled 0 · **migrations 72 = journal 72** · sets 824 11/11 · 825 10/10 · 826 15/15 · 827 13/13 · 823 4/4 · group swap 632 8/8 · 634 10/10 (0 survivors) |
| **front** `692f798` + 14 files | tsc 0 · `bun test` **1,302 / 0**, 140 files · unhandled 0 · **build 0** · sets 828 22/22 · 818 25/25 · 820 22/22 · 822 18/18 (0 survivors) |
| copy | the 3 back + 4 front approved strings (TH + EN) string-matched verbatim |

**Two incidents on the way, both closed:**
1. a checkout-path dependent test (824), fixed;
2. overlapping mutation runs that left a planted bug in the front tree for a while (828). I audited all 7 front sets against the tree (0 leftovers) and re-ran the verify from scratch.

**Not proven by anyone yet:** a real DB and a real browser. That is sid, with Tanya.

## 2 · Commit lists (exactly these; `git status --short -uall` taken by me, both trees frozen)
### back: `smart-scheduler-back` (76 entries: incl. `drizzle/0071_teacher_leave_removals.sql`, the journal and the migration-count pins 71 → 72)
```
    M drizzle/meta/_journal.json
     M src/db/schema.ts
     M src/lib/admin-leave-future-only-task648.test.ts
     M src/lib/admin-lift-leave-future-only-task814.test.ts
     M src/lib/admin-records-teacher-leave-task608.test.ts
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
     M src/lib/coach-rate-walk-req105.test.ts
     M src/lib/course-rental-round2-req091-14.test.ts
     M src/lib/duo-course-req095-13.test.ts
     M src/lib/group-price-and-walkin-req095-2b.test.ts
     M src/lib/group-series-extender-req105.test.ts
     M src/lib/group-series-req104.test.ts
     M src/lib/group-session-req095-2a.test.ts
     M src/lib/group-slot-yield-req105.test.ts
     M src/lib/group-swap-rate-door-task634.mutations.json
     M src/lib/group-swap-rate-task632.mutations.json
     M src/lib/group-swap-rate-task632.test.ts
     M src/lib/leave-list-detail-task819.mutations.json
     M src/lib/leave-list-detail-task819.test.ts
     M src/lib/leave-range-task817.mutations.json
     M src/lib/leave-range-task817.test.ts
     M src/lib/line-i18n.ts
     M src/lib/line-message.ts
     M src/lib/message-trailing-req085-16-3.test.ts
     M src/lib/migration-witness.ts
     M src/lib/no-iso-date-leak.test.ts
     M src/lib/no-placeholder-leak.test.ts
     M src/lib/notified-count-seam-task647.test.ts
     M src/lib/oa-write-guard-req105.test.ts
     M src/lib/other-schedule-req095.test.ts
     M src/lib/other-series-req101.test.ts
     M src/lib/rbac-stage1-users-req092.test.ts
     M src/lib/rbac-stage2-menu-guard-req092.test.ts
     M src/lib/rbac-stage3-actions-req092.test.ts
     M src/lib/rbac-stage4-roles-req092.test.ts
     M src/lib/rich-menu-relink-req105.test.ts
     M src/lib/route-access.ts
     M src/lib/school-issue-reason-task690.test.ts
     M src/lib/subject-kind-req095-13-4a.test.ts
     M src/lib/teacher-leave-act-task582.test.ts
     M src/lib/teacher-leave.ts
     M src/lib/teacher-own-calendar-req097.test.ts
     M src/lib/voucher-end-req103.test.ts
     M src/lib/webhook-ack-first-req105.test.ts
     M src/lib/whole-course-rental-req091.test.ts
     M src/lib/witness-observability-req105.test.ts
     M src/routes/api.ts
     M src/services/course-expiry-edit.test.ts
     M src/services/other-booking.test.ts
     M src/services/province-and-note-req088-9.test.ts
     M src/services/scheduler.service.ts
     M src/types/contract.ts
     M src/validation.ts
    ?? drizzle/0071_teacher_leave_removals.sql
    ?? src/lib/advance-leave-co-taught-task826.mutations.json
    ?? src/lib/advance-leave-co-taught-task826.test.ts
    ?? src/lib/coleave-notices-task827.mutations.json
    ?? src/lib/coleave-notices-task827.test.ts
    ?? src/lib/same-day-leave-co-taught-task825.mutations.json
    ?? src/lib/same-day-leave-co-taught-task825.test.ts
    ?? src/lib/take-teacher-off-class-task824.mutations.json
    ?? src/lib/take-teacher-off-class-task824.test.ts
```
### front: `smart-scheduler-front` (14 entries)
```
    M scripts/mutation/task-818.json
     M scripts/mutation/task-822.json
     M src/components/partials/Calendar/LeaveClassRow.tsx
     M src/components/partials/Calendar/LeaveDayPanel.tsx
     M src/components/partials/Calendar/Modal/ReportLeaveDialog.tsx
     M src/components/partials/Calendar/Modal/leave-range-task818.dom.test.tsx
     M src/hooks/scheduler/useScheduler.ts
     M src/lib/i18n/dictionaries.ts
     M src/lib/scheduler/teacher-scope.test.ts
     M src/services/scheduler.service.ts
     M src/types/api/contract.ts
    ?? scripts/mutation/task-828.json
    ?? src/components/partials/Calendar/Modal/LeaveWillDo.tsx
    ?? src/components/partials/Calendar/Modal/leave-co-taught-task828.dom.test.tsx
```

## 3 · Deploy, in this order: **sid**, then (after Tanya passes) **uat**
1. **Back:** pull, `bun install`, then **`db:migrate`: `0071_teacher_leave_removals`**.
   - One new table `teacher_leave_removals` + a unique (leave_day_id, booking_id); `CREATE … IF NOT EXISTS`, rerunnable, no data written.
   - **Expected after it: journal 72**, and the witness reports the table.
2. **Front:** the usual build + restart. **No env change, no script, no menu step.**
3. Back (with 0071) before or together with the front.

## 4 · Tanya's gate on sid (then uat read-only)
- **Same-day, co-taught:** a teacher's own leave today on an ECA with 3 teachers → the class stays (not cancelled), that teacher is gone from it, **no family message**, each remaining coach gets ONE LINE. If the leaver was main, the next by name is main.
- **Same-day, sole teacher:** exactly as before (cancel + make-up + family notice).
- **Advance, one day + a range:** the teacher is taken off co-taught classes at record time. **Cancel leave → back on them as an extra.** A sole-teacher class stays "to handle".
- **All 3 teachers on leave the same day:** the last one is "last teacher" (cancel / to handle).
- **D4:** no other teacher free in that slot → that class left as is and listed, with the approved sentence.
- **Screens:**
  - the before-save summary shows the split counts (preview), also for a teacher's own login;
  - "Continues with {names}" rows;
  - the strip counts only classes to handle.
- **GROUP extra coach** on leave → only they come off; the group runs on.

## 5 · Follow-up (not in this release; for you / the owner)
- **After a SAME-DAY leave the dialog closes on a toast.** The teacher saw the split in the preview before saving, but a **D4 class left as-is** (no free teacher to take over) is not surfaced afterwards, and nobody is prompted to handle it. A small follow-up (Fern): show the result view after a same-day save, and/or tell an admin. Your call whether and when.
