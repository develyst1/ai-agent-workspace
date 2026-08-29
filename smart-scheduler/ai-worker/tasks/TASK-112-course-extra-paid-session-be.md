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

## Review
**Verdict: DONE ✅** — Sober, 2026-08-04 (careful pass on the live engine, as flagged). Read the seam + tests;
ran the suite: **tsc 0 · 450/0**.
- 🔑 **Better than my spec — the filter is INSIDE the pure engine, so it self-defends.** `isCoursePlanRow(s) =
  bookingType===undefined || 'COURSE_PACKAGE'` (`course-plan.ts:26`), applied in `courseCurrent`/`planCourseMoves`/
  `canInsert`. No caller can bypass it, and **absent `bookingType` (legacy rows + the `S()` test helper) is a plan
  row ⇒ every pre-existing plan test passes unchanged** — the "6 stays 6" invariant re-verified, not just asserted.
- **Belt-and-suspenders at the DB layer too:** `reconcileCoursePlan`'s load is now `WHERE courseId AND
  bookingType='COURSE_PACKAGE'` (`:1325`), so the applier's **append-template** logic never sees the extra either.
  **One seam closes both** the count (extra doesn't touch size/owed/end) AND the no-re-owe-on-cancel (TASK-105 routes
  a cancel through `reconcileCoursePlan`, which now ignores the extra). Verified via the comment + the tests.
- **`POST /courses/:id/extra-session` → `addExtraSession` → `createBooking({SINGLE_SESSION, courseId, …})`** — pure
  reuse of `insertBooking`'s availability/clash/freelance gates + the freelance draw on confirm + day-end
  single-session revenue. **No new money mechanism**; distinct route so the seam is visible in the API. `toSessionRow`
  carries `bookingType` so the FE can flag the extra on the course view.
- Tests: extra leaves size/owed/end unchanged; its cancel doesn't re-owe; a real absence still re-owes with an extra
  present; full-course+extra still not `insertable`. **DONE — unblocks TASK-113. REQ-037 BE complete.**

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-112 | scheduling (BE): **REQ-037 extra paid session** — the `COURSE_PACKAGE` seam-keeper (`reconcileCoursePlan`/`planCourseMoves`/`courseCurrent` count only COURSE_PACKAGE) + `POST /courses/:id/extra-session` (SINGLE_SESSION, `courseId` soft-link; reuses availability/freelance/revenue) — size/owed/end unchanged, cancel doesn't re-owe | SPEC-033 | 🔎 **REVIEW** (Jason 2026-08-04 — tsc 0 · **450/0**, careful pass on the live engine. Seam-keeper built **into** the pure engine: `PlanSession.bookingType?` + `isCoursePlanRow` (absent/COURSE_PACKAGE→count, else ignore); `courseCurrent`/`planCourseMoves`/`canInsert` all filter it, so they self-defend regardless of caller. `reconcileCoursePlan` load now `WHERE bookingType='COURSE_PACKAGE'`; DTO/dry-run `deriveLiveEndDate` + insert-branch `canInsert` filtered too. `POST /courses/:id/extra-session` → `createBooking({SINGLE_SESSION, courseId, student from course})` (reuses insertBooking gates + freelance draw + day-end single-session revenue — no new mechanism). `toSessionRow` exposes `bookingType` so FE flags the extra. **"6 stays 6" re-verified:** all pre-existing `S()`-based plan tests (no bookingType) still green (back-compat); new tests: extra doesn't count, its cancel doesn't re-owe, doesn't mask a real absence, never makes a full course insertable) — ✅ **DONE** Sober 2026-08-04: careful pass — filter self-defends in the pure engine + the `reconcileCoursePlan:1325` load (both layers), one seam closes count + no-re-owe, invariant re-verified via unchanged legacy tests; tsc 0 · 450/0 run by me. **REQ-037 BE complete; unblocks TASK-113** | Jason | — |
```
