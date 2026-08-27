# TASK-187: Sweep view mappers to required-by-default fields (kill the 4th-time omission class) (FE)

- Source: TASK-183 Q1 (Fern). 🟢 **LOW / opportunistic** — process hardening, not a live defect. Do before/with the
  next view-mapper change, not as an interrupt.
- Status: TODO → @Fern (FE) — queued
- Repo: **smart-scheduler-front**.

## Why
Four times in this feature set a **response mapper silently dropped a field the BE already sent**, compiler-silent
until someone made the field required: `createBooking` body (TASK-170), `dtoToBooking` (TASK-170 Part 2), `toSessionRow`
(TASK-184, BE-side), and `dtoToCourseView` (TASK-183). TASK-172 guards *request* bodies; nothing guards *response*
mappers. The fix that can't rot: make the DTO-derived **view** types' fields **required**, so an allow-list mapper that
forgets one is a compile error.

## Scope
- Audit the course/booking/plan view types (`CoursePackageView`, `PlanSession`/plan rows, booking view, etc.) and make
  fields that come from a DTO **required** (not `?:`) where a `null` is meaningful — mirror how TASK-183/184 did it.
- Where a field is genuinely sometimes-absent, keep it optional but say why in a comment, so "optional" is a decision,
  not the default that hid four bugs.
- No behaviour change intended — this is types + any mapper lines the newly-required fields force you to add.

## DoD
- [ ] The known DTO-derived view types require their DTO fields; a mapper omitting one fails `tsc`.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun run build` ok. No runtime behaviour change.

## Notes
(Fern fills in. This is the symmetric guard to TASK-172. Keep it a types sweep — don't fold feature work into it.)

## Add-on (Sober 2026-08-25): one dead helper to remove while you're here
TASK-189 replaced the FE's lifecycle re-compute with the server `course.status`, leaving `isCourseEnded`
(`src/types/app/scheduler/index.ts:280`) with **zero callers**. Delete it in this sweep (verify no import first) —
"removed, not left to rot", same principle as deleting `course-status.ts`.
