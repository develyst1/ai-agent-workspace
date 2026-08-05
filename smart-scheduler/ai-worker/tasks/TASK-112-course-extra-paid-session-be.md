# TASK-112: scheduling (BE) — add an extra paid session to a course (SINGLE_SESSION, out of quota)
- Source: SPEC-033 (REQ-037)
- Status: TODO (HIGH — go-live)
- Depends on: — (reuses createBooking/insertBooking + reconcile engine; touches the live course engine)
- Assignee: @Jason (smart-scheduler-back)

## What to build
1. 🔴 **The seam-keeper — the course engine counts only `COURSE_PACKAGE`.** Filter `reconcileCoursePlan` (the
   `bookings WHERE courseId` load, `:1325`), `planCourseMoves`, and `courseCurrent` to `bookingType ===
   "COURSE_PACKAGE"`. This is what lets a soft-linked SINGLE_SESSION extra live *beside* the plan: it doesn't count
   toward `size`/owed/end, and its cancel (which TASK-105 routes through `reconcileCoursePlan`) doesn't re-owe.
   ⚠️ **Live course engine** — careful pass; re-verify the "6 stays 6" invariant unchanged for pure COURSE_PACKAGE plans.
2. **`POST /courses/:id/extra-session` `{teacherId, subjectId, date, startTime}`** → `createBooking({ bookingType:
   "SINGLE_SESSION", courseId, ... })` (soft link). Distinct route from `/courses/:id/plan`. Reuses `insertBooking`
   (availability gate + slot-clash + freelance-set). Returns the new booking; the course DTO summary/liveEndDate
   are unchanged.
3. **Reuse, no new mechanism:** revenue posts at day-end via the existing `revenueItemRef(SINGLE_SESSION, priceGroup)`
   path; the freelance ceiling draws on confirm via `reconcileBookingHolds` (SINGLE_SESSION is consuming). Stock
   decrement (if capped) rides on REQ-035 — not in this task.

## Definition of Done
- [ ] Adding an extra session leaves the course `size`, owed count, and derived end date **unchanged** (test).
- [ ] Cancelling the extra releases its own freelance hold and does **NOT** re-owe a course makeup (test).
- [ ] The extra draws the freelance ceiling like a normal booking (blocks at 0); posts single-session revenue at day-end.
- [ ] Standard availability/clash guards apply. `COURSE_PACKAGE` filter added at all 3 engine sites.
- [ ] `bunx tsc --noEmit` clean; `bun test` green (the invariant-unchanged + no-re-owe tests are the important ones).
