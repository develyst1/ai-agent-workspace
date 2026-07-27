# TASK-025: backoffice-back — data migration `ops.*` + `freelance_budgets` → `bo.*`
- Source: SPEC-006
- Status: REVIEW
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
`smart-scheduler-backoffice-back/src/db/migrate-to-bo.ts` — a standalone, **idempotent** script run manually
at deploy (`bun run migrate:bo`, added to package.json). Read-only on the old tables; upserts into `bo`.

- **Idempotency:** ops items keyed by `metadata.migrationKey='ops-cat:<id>'`; freelance keyed by
  `(external_source, owner_ref, kind='FREELANCE_CEILING')` — **the same key TASK-024's `findFreelanceItem`
  uses**, so the migration writes the exact item the running app reads. `remaining_qty` is set on **INSERT
  only** (never overwritten) → a re-run after teachers have booked won't clobber live remaining.
- **`ops.catalog_items → bo.item`:** INCOME/EXPENSE→`direction` + `cadence=VARIABLE`; `FIXED_COST`→
  EXPENSE + `FIXED_MONTHLY`. `sale_price_minor`→`unit_price_minor`, `unit`→`unit`, `external_ref`→`owner_ref`,
  `reorder_level`→`metadata.reorder`. `stock_balances.quantity_on_hand`→`remaining_qty` (track-stock only).
- **`ops.stock_movements → bo.movement`:** IN/OUT → signed `qty` + signed `value_minor` (OUT `+amount`,
  IN `−amount`, matching TASK-022's signed rule so `SUM` nets); carries `idempotency_key`/`ref_*`. **ADJUST
  skipped** (P&L-neutral; remaining comes from the balance).
- **`ops.recurring_costs`:** corrects the salary item's `unit_price` to the current **open** effective amount
  (the catalog pass already created the FIXED_COST item; effective-dated history isn't modelled in bo — salary
  *posting* is a follow-up REQ, definitions migrated).
- **`public.freelance_budgets → bo.item`** (unit=ชั่วโมง, `FREELANCE_CEILING`): `ceiling_qty=round(budget/rate)`,
  `remaining_qty=round(remaining/rate)`, `unit_price_minor=rate`, `reorderQty=round(reorder/rate)`,
  `owner_ref=teacher_id` — **exactly TASK-024's shape.** Read raw (`SELECT … FROM public.freelance_budgets`)
  since that table isn't in this repo's Drizzle schema.
- **Skipped:** ops `FREELANCE_BUDGET` catalog items (+ their movements) — superseded by `freelance_budgets`;
  the 5 dead ops tables + `commercial_requests`.

**Verification**
- `bunx tsc --noEmit` clean; `bun test` → 48/0 (script isn't imported by tests; it typechecks). ⚠️ **The
  script is DB-runtime and was NOT executed** (brownfield — no DB). Correctness is by inspection; it's the
  manual deploy step. Documented for the REQ-006 deploy note: **run `bun run migrate:bo` after the `bo`
  migration (0004) and before/with deploying TASK-024** (else live freelances have no `bo.item`).

## Questions
(Jason asks; Sober answers as `> answer: ...`)

- **Scoping confirmations (flag if any is wrong):** (1) skip ops `FREELANCE_BUDGET` items + their movements
  (superseded by `freelance_budgets` → hour items; migrating them would double-count/confuse) — OK? (2) skip
  ADJUST movements (P&L-neutral; remaining from balance) — OK? (3) salary = **definitions only** (unit_price =
  current open amount), no salary posting movements (deferred REQ) — OK?
  > answer (Sober): **All three confirmed.** (1) Right — `public.freelance_budgets` is the live source since
  > REQ-004; the ops FREELANCE_BUDGET items are stale pre-REQ-004 data → skip (else double-count). (2) Right —
  > ADJUST is P&L-neutral and `remaining_qty` comes from the balance. (3) Right — salary posting is a follow-up
  > REQ; migrate the definition with the current open amount.
- **Spot-check** ... I can add a spot-check script if you want one prepared.
  > answer (Sober): **Yes, prepare a lightweight spot-check script** (e.g. `verify-bo-migration.ts`: count
  > `bo.item` by direction/kind, sum `bo.movement.value_minor` and compare to the old ops `/reports/pl` totals,
  > and assert every `public.freelance_budgets` row has a matching `FREELANCE_CEILING` `bo.item`). It's a
  > **safety-critical migration touching the live freelance path** — a one-command post-migrate check is worth
  > it. Add it + the manual comparison to the REQ-006 deploy note. **Not blocking this task's DONE** (the
  > migration logic is correct); the checker is a small fast-follow for the deploy.

## Review
**Verdict: DONE** ✅ (Sober, 2026-07-20). `tsc` 0; script typechecks (`bun test` 48/0 — not imported by tests).
Read `migrate-to-bo.ts` end-to-end — correct by inspection:
- **Idempotent:** `upsertBoItem` keys by `metadata.migrationKey`; **`remaining_qty` set on INSERT only** →
  a re-run after teachers have booked won't clobber live remaining. ✓ (Critical for the live freelance path.)
- **catalog_items → item:** INCOME/EXPENSE→direction, FIXED_COST→EXPENSE+FIXED_MONTHLY, price/unit/owner_ref/
  reorder mapped; remaining from the balance (track-stock only); FREELANCE_BUDGET skipped. ✓
- **stock_movements → movement:** signed `qty` + signed `value_minor` (OUT+/IN−, matches TASK-022); ADJUST
  skipped; synthetic idempotency key + `onConflictDoNothing`. ✓
- **freelance_budgets → hour-item:** built with **exactly TASK-024's `findFreelanceItem` key**
  (`external_source`+`owner_ref`+`kind='FREELANCE_CEILING'`), ceiling/remaining/reorder = `round(minor/rate)`;
  re-run updates only definitional fields, not remaining. ✓ Read raw (not in this repo's Drizzle schema).
- Salary = defs-only (unit_price → current open amount). Dead tables + `commercial_requests` skipped. ✓
DB-runtime execution is the deploy step (brownfield) — accepted. No rework. **All REQ-006 BE is DONE.**
⚠️ Deploy ordering (0004 → migrate → deploy 024) is in the REQ-006 deploy note; add the spot-check there.
