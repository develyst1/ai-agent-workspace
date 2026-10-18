# DEPLOY — REQ-123 one release: 813 + 814 + Phase 1 (P1–P7) — sid first, then uat — @Sober, 2026-10-17
> ✅ **CLEARED for uat — @Porter, 2026-10-18.** sid gate PASSED: TEST-108 (Khwan's case, Private + DUO, P1–P7, copy) + its F1/F2 re-check on the TASK-822 fix. **Build uat from: back `7d39cbf` · front `90a11da`** (the latter includes TASK-822; this note was written at `a289bca`). §3 applies as written, **including `bun run db:migrate` on uat (0070 → journal 71)**. Open, not blocking: L1 (one LINE for a range: tests only, no LINE-linked QA teacher) · L2 (Teachers-only cancel: tests only, unless the owner does the DATA REQUEST).
**For @Porter → the owner.** Agents commit nothing; the owner commits, then deploys. **Both apps go together.**

## 0 · What is in it
- **TASK-813:** a week marked planned absence is created on the teacher's leave day. Already committed as `c1d90d8`, already on sid.
- **TASK-814:** cancel a FUTURE advance leave (copy approved).
- **Phase 1:**
  - **P1** the create preview warns + one click marks the week absent (815/816);
  - **P2** leave as a date range, one reason, ≤ 31 days (817/818);
  - **P3/P4** the calendar chip opens the leave panel (classes · Open · Cancel one / all future) (819/820);
  - **P5** "Teacher leave" list on the Teachers page (819/821);
  - **P6** default date (818);
  - **P7** "what saving will do" (818).
- **All new wording approved by the owner 10-17** (*"อนุมัติทั้งหมด 31 วัน A"*).

## 1 · Verified by me on clean copies of both whole trees (final, after the approval flip)
| | result |
|---|---|
| **back** `c1d90d8` + 63 files | tsc 0 · SAFE suite **4,808 / 0**, 354 files · unhandled 0 · **migrations 71 = journal 71** · sets 813 8/8 · 814 7/7 · 815 6/6 · 817 16/16 · 819 17/17 (0 survivors) |
| **front** `d1d0a99` + 34 files | tsc 0 · `bun test` **1,257 / 0**, 138 files · unhandled 0 · **`bun run build` 0** · sets 814 10/10 · 816 12/12 · 818 27/27 · 820 22/22 · 821 16/16 (0 survivors) |
| copy | the 52 approved FE strings (26 keys × TH/EN) and the BE strings are present **verbatim**; the older DRAFT markers elsewhere are untouched |
**Not proven by anyone yet:** against a real DB and a real browser. That is sid, with Tanya.

## 2 · Commit lists (exactly these; `git status --short -uall` taken by me after the freeze)
### back: `smart-scheduler-back` (63 entries)
```
    M drizzle/meta/_journal.json
     M src/db/schema.ts
     M src/lib/admin-leave-future-only-task648.test.ts
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
     M src/lib/coach-rate-req095-13-3.test.ts
     M src/lib/coach-rate-visibility-req102-6.test.ts
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
     M src/lib/school-issue-reason-task690.test.ts
     M src/lib/subject-kind-req095-13-4a.test.ts
     M src/lib/teacher-leave-admin-list-task587.test.ts
     M src/lib/teacher-leave-day-task561.test.ts
     M src/lib/teacher-leave.ts
     M src/lib/teacher-own-calendar-req097.test.ts
     M src/lib/voucher-end-req103.test.ts
     M src/lib/webhook-ack-first-req105.test.ts
     M src/lib/whole-course-rental-req091.test.ts
     M src/lib/witness-observability-req105.test.ts
     M src/routes/api.ts
     M src/services/course-ended-writes.test.ts
     M src/services/course-expiry-edit.test.ts
     M src/services/province-and-note-req088-9.test.ts
     M src/services/scheduler.service.ts
     M src/types/contract.ts
     M src/validation.ts
    ?? drizzle/0070_teacher_leave_range.sql
    ?? src/lib/admin-lift-leave-future-only-task814.mutations.json
    ?? src/lib/admin-lift-leave-future-only-task814.test.ts
    ?? src/lib/leave-list-detail-task819.mutations.json
    ?? src/lib/leave-list-detail-task819.test.ts
    ?? src/lib/leave-range-task817.mutations.json
    ?? src/lib/leave-range-task817.test.ts
    ?? src/lib/preview-flags-leave-week-task815.mutations.json
    ?? src/lib/preview-flags-leave-week-task815.test.ts
```
### front: `smart-scheduler-front` (34 entries)
```
    M src/components/partials/Bookings/CreatePlanFlow.tsx
     M src/components/partials/Calendar/CalendarHeader.tsx
     M src/components/partials/Calendar/LeaveDayBanner.tsx
     M src/components/partials/Calendar/Modal/ReportLeaveDialog.tsx
     M src/components/partials/Teachers/TeacherRowActions.tsx
     M src/components/partials/Teachers/TeachersContent.tsx
     M src/components/partials/Teachers/teacher-leave-row.dom.test.tsx
     M src/hooks/scheduler/useScheduler.ts
     M src/lib/i18n/dictionaries.ts
     M src/lib/rbac/action-gate.test.ts
     M src/lib/scheduler/leave-days.test.ts
     M src/lib/scheduler/teacher-scope.test.ts
     M src/services/scheduler.service.ts
     M src/types/api/contract.ts
     M src/types/app/scheduler/index.ts
    ?? scripts/mutation/task-814.json
    ?? scripts/mutation/task-816.json
    ?? scripts/mutation/task-818.json
    ?? scripts/mutation/task-820.json
    ?? scripts/mutation/task-821.json
    ?? src/components/partials/Bookings/LeaveWeekNotice.tsx
    ?? src/components/partials/Bookings/leave-week-notice-task816.dom.test.tsx
    ?? src/components/partials/Calendar/CancelLeaveButton.tsx
    ?? src/components/partials/Calendar/LeaveChip.tsx
    ?? src/components/partials/Calendar/LeaveClassOpener.tsx
    ?? src/components/partials/Calendar/LeaveDayPanel.tsx
    ?? src/components/partials/Calendar/LiftLeaveConfirm.tsx
    ?? src/components/partials/Calendar/LiftRangeConfirm.tsx
    ?? src/components/partials/Calendar/Modal/LeaveTeacherPick.tsx
    ?? src/components/partials/Calendar/Modal/leave-range-task818.dom.test.tsx
    ?? src/components/partials/Calendar/leave-panel-task820.dom.test.tsx
    ?? src/components/partials/Calendar/lift-leave-task814.dom.test.tsx
    ?? src/components/partials/Teachers/TeacherLeaveList.tsx
    ?? src/components/partials/Teachers/teacher-leave-list-task821.dom.test.tsx
```

## 3 · Deploy, in this order: **sid**, then (after Tanya passes) **uat**
1. **Back:** pull the commit, `bun install` (no new dependency expected), then **migrate: `0070_teacher_leave_range`**.
   - It is **one nullable column** `teacher_leave_days.range_id`, `ADD COLUMN IF NOT EXISTS`: rerunnable, no data written.
   - **Expected after it: journal 71.** The migration-witness check must report the column present.
2. **Front:** the usual build + restart. No new env.
3. **No env change. No script to run. No LINE / menu step.**
4. **Order:** back (with 0070) **before or together with** the front. The new front calls the new list fields and `DELETE /teacher-leave-ranges/:id`.

## 4 · Tanya's gate on sid (then uat read-only)
- **813 again:** a leave on Sat D, a weekly Saturday course over D, that week ticked → **created**, Private and DUO; not ticked → still refused.
- **814:** cancel a future leave day (the teacher is told on LINE); today/past cannot be cancelled.
- **P1:** the preview warns on the leave week; one click marks it absent; the calm note shows once marked.
- **P2:** a 3-day range with one reason → one LINE to the teacher; a day already on record is skipped; 32 days is refused with the approved text.
- **P3/P4:** the calendar chip → panel shows every day of the leave + each class (child · program · time · status) → **Open** shows the real booking → Cancel one day / Cancel all future days (one LINE).
- **P5:** Teachers page → "Teacher leave", upcoming / past, Cancel on future days.
- **P6:** from the calendar the date = the viewed day; from the Teachers ⋮ menu it is empty (never tomorrow).
- **P7:**
  - the teacher's own door, a future day → "only blocks…";
  - today → "cancels N class(es) and tells their families" (no number, owner's A).

## 5 · After the commit (cleanup, not blocking)
One code comment in front `dictionaries.ts:536` still calls 818's `rangeDay…` keys "DRAFT" (they are approved). A comment only; it goes in the next touch of that file.
