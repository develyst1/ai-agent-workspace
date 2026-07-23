# TASK-024: scheduling — re-absorb the freelance ceiling as a `bo.item` (in-tx)
- Source: SPEC-006
- Status: TODO
- Depends on: TASK-021 (schema). **Sequence AFTER TASK-022/023 are stable.**
- Assignee: @Jason (smart-scheduler-back, port 4006)

## What to do
Replace `public.freelance_budgets` (REQ-004) with a `bo.item` (unit=hour), decremented **in the booking's own
DB transaction** (same PostgreSQL, direct access — no HTTP). Retires the local freelance table; keeps atomicity.

1. **Declare the `bo` tables** scheduling reads/writes (item, movement) in its Drizzle schema (migrations stay
   owned by backoffice-back; scheduling only reads/writes).
2. **Model**: a freelance's ceiling = `bo.item{ unit:'ชั่วโมง', direction:'EXPENSE', cadence:'FIXED_MONTHLY',
   ceiling_qty:<hours>, remaining_qty:<hours>, unit_price_minor:<rate>, owner_ref:<teacherId> }`.
3. **Booking commit** (FREELANCE, in the booking tx): find the teacher's `bo.item`; if `remaining_qty < 1` and
   no override → block; else write `bo.movement{qty:−1, value_minor:rate, ref:booking}` + `remaining_qty -= 1`.
   **Same tx as the booking** → atomic.
4. **Cancel / customer-leave**: `bo.movement{qty:+1}` + `remaining_qty += 1` (only if drawn).
5. **Monthly reset**: the existing `/internal/jobs/month-reset` now sets `bo.item.remaining_qty = ceiling_qty`
   for freelance ceiling items (with the idempotency guard from TASK-019's fast-follow).
6. **DTO**: source the teacher's `remainingMinor/budgetMinor/overLimit` from the `bo.item` (hours×rate for baht
   display, or show hours — coordinate the display with TASK-026). `setupIncomplete` (freelance) = no `bo.item`.
7. **Retire `public.freelance_budgets`**: stop reading/writing it; its data is migrated in TASK-025. Leave the
   table dormant (drop later).

## Definition of Done
- [ ] Booking a freelance decrements their `bo.item.remaining_qty` **in the booking tx**; cancel/leave restores;
      remaining < 1 & no override → blocked; override allows negative.
- [ ] Monthly reset restores remaining to ceiling. Works with the backoffice API down (direct same-DB).
- [ ] `public.freelance_budgets` no longer read/written; DTO + booking guard sourced from `bo.item`.
- [ ] Migration/schema applies; `bun test` + `bunx tsc --noEmit` clean; tests for the in-tx draw/reverse/block.

## Implementation Notes
(Jason fills in.)

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review
(Sober fills at REVIEW.)
