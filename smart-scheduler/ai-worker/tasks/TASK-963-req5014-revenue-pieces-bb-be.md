# TASK-963 — BE: REQ-5014 Team C revenue pieces (BB) — @Brew (Team C) — ⏸ until the back office resumes

**From @Sector, 2026-11-13.**
- **Design:** `specs/SPEC-107-req5014-team-c-revenue-pieces.md` §1–§3. The seam is SPEC-106 §3.
- **Repo:** `smart-scheduler-backoffice-back`, base `e3a37de`. No git.
- **Size:** ≈ 0.75 d.
- **Start only when I ring you.** Two conditions: the back office resumes, and TASK-961's `activity_changes` is on sid.

## Files (closed list)
- `src/db/schema.ts`: `pubCoursePackages` + `subjectId` (read-only mirror); a mirror of `public.activity_changes` (read-only).
- `src/services/revenue.service.ts`: M0, l.70–78.
- `src/routes/revenue-ledger.ts`: `createLineBody` + `courseId`.
- `src/services/revenue-ledger.service.ts`: `createManualLine` (the course link); the line list (`activityChange`).
- `src/lib/revenue-ledger.ts`: the DTO, only if the DTO lives there.
- Tests next to each.

## Steps (SPEC-107)
1. **M0:** `subjectByCourse` from `course.subjectId`; the first-booking read only when that is null. Test: a course whose first booking is the old subject is attributed to the course's (new) subject.
2. **Detail:** the optional `activityChange` on each line in `GET /revenue/lines`, from `activity_changes`.
   - One `IN (refIds)` query per page.
   - Tests: absent when there are no rows; one change; two changes (from first, to last, both notes); a booking-ref line.
3. **Course link:** an optional `courseId` on `POST /revenue/lines`.
   - Unknown course → 400 `field: courseId`.
   - Written as `ref_type` COURSE + `ref_id`, no idempotency key.
   - Without it, unchanged (the existing tests stay green).

## Done =
- tsc 0 · the full BB suite N/0 (paste) · the route-test output for the 3 pieces. No secret in any output.

## Questions / Implementation Notes / Review
_(—)_
