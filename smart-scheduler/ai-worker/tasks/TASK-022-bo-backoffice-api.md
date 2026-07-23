# TASK-022: backoffice-back — universal item/movement/tag API + P&L report
- Source: SPEC-006
- Status: TODO
- Depends on: TASK-021
- Assignee: @Jason (smart-scheduler-backoffice-back, port 4010)

## What to do
Build the backoffice API on `bo.*` (single-admin JWT — reuse REQ-002; **NO roles, NO approvals**). New
`src/services/item.service.ts` + routes; mount under `/api/v1`.

1. **Items**: `GET /items` (filter by direction/cadence/active/tag), `POST /items`
   `{name, unit, direction, cadence, unitPriceMinor, ceilingQty?, ownerRef?}` (on create with a ceiling →
   `remaining_qty = ceiling_qty`), `PATCH /items/:id` (name/unit/unitPrice/ceiling/cadence/active — **direction
   immutable** after create), `GET /items/:id`.
2. **Movements**: `POST /items/:id/movements` `{qty(signed), reason?, refType?, refId?, idempotencyKey?}` →
   apply in a tx: if the item tracks a ceiling, `remaining_qty += qty` with an optional non-negative guard
   (allow-negative flag for overrides); `value_minor = |qty| × unit_price`; idempotent via the unique key.
   `GET /items/:id/movements`.
3. **Tags**: CRUD `tag_group` + `tag_value`; `PUT /items/:id/tags` (set the item's tag values, one per group).
4. **P&L report**: `GET /reports/pl?from&to` → `SUM(value_minor) GROUP BY direction (, cadence)` + `byItem`.
5. Auth: all mutations behind the existing single-admin JWT middleware; reads can stay open like the old ops.
   Money in integer satang; error envelope `{error:{code,message,details}}` (reuse the existing lib).

## Definition of Done
- [ ] Create an item (e.g. water bottles: unit=ขวด, INCOME, VARIABLE, ceiling 100, price 1500); a movement
      `qty:-2` sets remaining 98 and books value 3000; P&L shows it under INCOME.
- [ ] A FIXED_MONTHLY EXPENSE item + a `qty:-1` movement shows under EXPENSE/fixed in the report.
- [ ] Ceiling guard + idempotency-key dedupe work; `direction` can't be changed via PATCH.
- [ ] Single-admin JWT enforced on writes; `bun test` + `bunx tsc --noEmit` clean (unit-test the P&L fold +
      the movement/ceiling math as pure functions).

## Implementation Notes
(Jason fills in.)

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review
(Sober fills at REVIEW.)
