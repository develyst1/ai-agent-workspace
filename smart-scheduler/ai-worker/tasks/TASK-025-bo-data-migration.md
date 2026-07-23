# TASK-025: backoffice-back — data migration `ops.*` + `freelance_budgets` → `bo.*`
- Source: SPEC-006
- Status: TODO
- Depends on: TASK-021 (schema). Coordinate with TASK-024 (freelance shape).
- Assignee: @Jason (smart-scheduler-backoffice-back, port 4010)

## What to do
A one-time, **idempotent** migration script (`src/db/migrate-to-bo.ts`, run manually at deploy) that moves the
live data from the old model into `bo.*`. Read-only on the old tables; upserts into `bo` (safe to re-run).

Mapping:
- **`ops.catalog_items` → `bo.item`**: `item_type` INCOME/EXPENSE → `direction` + `cadence=VARIABLE`;
  `FIXED_COST` → `direction=EXPENSE` + `cadence=FIXED_MONTHLY`. `sale_price_minor`→`unit_price_minor`;
  `unit`→`unit`; `external_ref`→`owner_ref`; `reorder_level`→`metadata.reorder`.
- **`ops.stock_balances.quantity_on_hand` → `bo.item.remaining_qty`**; **`ops.stock_movements` → `bo.movement`**
  (direction+quantity → signed `qty`; `amount_minor`→`value_minor`; carry `idempotency_key`/`ref_*`).
- **`ops.recurring_costs`** → `bo.item` (FIXED_MONTHLY EXPENSE, one per teacher salary item) — current open row's
  amount → `unit_price_minor`. *(FT/PT salary posting itself is a follow-up REQ; migrate the definitions.)*
- **`public.freelance_budgets` → `bo.item`** (unit=ชั่วโมง): `monthly_budget_minor`→`ceiling_qty` **in hours**
  (÷ rate), `rate_minor`→`unit_price_minor`, `remaining_minor`→`remaining_qty` (÷ rate), `teacher_id`→`owner_ref`.
  Coordinate the exact hours conversion with TASK-024.
- Skip the 5 dead ops tables + `commercial_requests` (no approvals).

## Definition of Done
- [ ] Running the script populates `bo.item`/`bo.movement`/tags from the live `ops.*` + `freelance_budgets`;
      re-running is idempotent (upsert by a stable key, e.g. owner_ref/sku).
- [ ] Spot-check: a freelance budget lands as an hour-unit `bo.item` matching TASK-024's expectations; a P&L
      query over migrated movements matches the old `/reports/pl` totals (within the model mapping).
- [ ] `bunx tsc --noEmit` clean; the script is documented in the REQ-006 deploy note (run once, after `bo` migration).

## Implementation Notes
(Jason fills in.)

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review
(Sober fills at REVIEW.)
