# TASK-026: scheduler-front — re-point freelance budget admin at the `bo`-backed data
- Source: SPEC-006
- Status: TODO
- Depends on: TASK-024
- Assignee: @Fern (smart-scheduler-front, port 3016)

## What to do
After TASK-024 moves the freelance ceiling from `public.freelance_budgets` to a `bo.item` (unit=hour), adjust
the frontoffice freelance budget admin (built in TASK-020) so it reads/writes the new shape. Likely small.

1. Confirm the teacher DTO still exposes `remainingMinor`/`budgetMinor`/`reorderMinor`/`overLimit` (TASK-024
   keeps the field names, sourced from `bo.item`) → the **`FreelanceRow` display needs no change**.
2. If the set/edit + top-up endpoints changed shape (e.g. ceiling now in **hours** rather than baht budget),
   update `setFreelanceBudget`/`topUpFreelanceBudget` inputs + the modals accordingly (hours + rate, or keep
   baht and convert — match TASK-024's contract). Coordinate the unit shown (hours vs baht) with Sober/TASK-024.
3. Keep the `setupIncomplete` badge behavior (no ceiling item → not bookable) — now sourced from `bo`.

## Definition of Done
- [ ] Freelance set/edit/top-up works against the `bo`-backed endpoints; `remaining/ceiling` displays correctly
      (unit per TASK-024).
- [ ] No regression to the booking auto-hide / override behavior.
- [ ] `bunx tsc --noEmit` + `bun run build` clean.

## Implementation Notes
(Fern fills in.)

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review
(Sober fills at REVIEW.)
