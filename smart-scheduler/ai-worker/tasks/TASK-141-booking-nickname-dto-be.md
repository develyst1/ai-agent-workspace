# TASK-141: Add `nickname` to the Booking DTO (BE)
- Source: SPEC-046 (REQ-052)
- Status: TODO
- Assignee: @Jason (BE)
- Depends on: none

## What to do (smart-scheduler-back)
The calendar cell (REQ-052) shows the student's **nickname**, but the Booking DTO carries only
`studentName` (full). Add `nickname` to the booking response.
1. Booking mapper (`src/db/mappers.ts`) — include `nickname` from the joined `students.nickname` on the
   booking DTO (the booking already joins the student for `studentName`; add the field). No schema change
   (`students.nickname` exists).
2. Contract type (`src/types/contract.ts`) — add `nickname` to the booking DTO shape.
3. Confirm every booking-returning path (list, create, plan) carries it, or default it safely.

## Definition of Done
- [ ] Booking DTO includes `nickname` (falls back to name/empty if a student somehow has none).
- [ ] No schema/migration change; existing booking consumers unaffected.
- [ ] `bunx tsc --noEmit` 0 · `bun test` green.

## Implementation Notes / Questions
(Jason fills in. Coordinate the FE `Booking` type add with TASK-142.)
