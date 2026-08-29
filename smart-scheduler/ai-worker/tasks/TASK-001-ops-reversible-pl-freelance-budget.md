# TASK-001: ops — reversible P&L expense + allowNegative + freelance-budget item convention
- Source: SPEC-001
- Status: DONE
- Depends on: none
- Assignee: @Jason (smart-scheduler-backoffice-back, port 3002)

## What to do
Make the ops API support a **reversible freelance expense** and a **negative-
allowed** drawdown, without a new table. Files: `src/services/reports.service.ts`,
`src/services/inventory.service.ts`, `src/routes/catalog.ts`, `src/lib/validation.ts`.

1. **Reversal-aware P&L** — in `getPLReport`, change the EXPENSE aggregation so an
   item's expense = `Σ(OUT.amount_minor) − Σ(IN.amount_minor WHERE ref_type='BOOKING_REVERSAL')`.
   Leave INCOME (revenue = ΣOUT) and FIXED_COST (ΣOUT) unchanged. (Currently the
   query filters `direction='OUT'` only — extend it to also pull reversal INs and
   subtract them; keep it per-item and within the date window.)
2. **`allowNegative` option** on `applyStockMovement` (and `applyStockMovementByExternal`):
   when `true`, skip the `INSUFFICIENT_STOCK` guard so `quantity_on_hand` may go
   ≤ 0. Default `false` (all existing callers unaffected). Add optional
   `allowNegative` to `v.stockMovement` / `v.movementByRef` validation.
3. **Movement conventions** (document in code / contract) for freelance budget
   items — the scheduling caller (TASK-002) will send:
   - booking: `OUT`, `amount_minor`=job satang, `ref_type='BOOKING'`
   - reversal: `IN`, `amount_minor`=job satang, `ref_type='BOOKING_REVERSAL'`
   - top-up: `IN`, `amount_minor`=0, `ref_type='TOPUP'`
   - reset: `ADJUST` `reason='=<budget>'`, `amount_minor`=0, `ref_type='RESET'`
4. **Freelance-budget item convention**: a per-teacher `catalog_item`
   `item_group='SERVICE'`, `item_type='EXPENSE'`, `track_stock=true`,
   `sale_price_minor`=rate satang, `external_source='smart-scheduler'`,
   `external_ref=teacherId`, `metadata={kind:'FREELANCE_BUDGET', monthlyBudgetMinor}`,
   `reorder_level`=near-cap warning (satang). No schema migration needed (metadata
   + existing columns). Confirm `by-ref` movement resolves these items by
   (org, externalSource, externalRef).

## Definition of Done
- [ ] A budget item with OUT 1,500 then IN(reversal) 1,500 reports **0** expense in
      `/reports/pl`; with OUT 1,500 only → **1,500** expense.
- [ ] A top-up IN (amount_minor=0) and a reset ADJUST do **not** change P&L expense.
- [ ] An `OUT` with `allowNegative:true` past the balance succeeds and drives
      `quantity_on_hand` negative; without it → `409 INSUFFICIENT_STOCK` (unchanged).
- [ ] INCOME revenue and FIXED_COST totals in `/reports/pl` are unchanged by this task.
- [ ] `bun test` (or the repo's test cmd) passes; add a P&L reversal test.

## Implementation Notes
Repo: `smart-scheduler-backoffice-back` (port 3002). All changes backward-compatible
(new options optional, all defaults preserve current behavior).

**Files changed**
- `src/services/reports.service.ts` — reversal-aware P&L. The DB query now pulls OUT
  movements **and** `IN` movements with `ref_type='BOOKING_REVERSAL'` (via `or(...)`),
  aggregating per item into `outMinor` + `reversalMinor` (Postgres `sum(...) filter (where …)`).
  Netting + revenue/cost classification extracted into a **pure exported `foldPLRows(rows, window)`**:
  per item `amountMinor = ΣOUT − Σ(reversal IN)`; a fully-reversed item nets 0 and drops out
  of `byItem`; INCOME→revenue, EXPENSE/FIXED_COST→cost (unchanged). Extraction is deliberate —
  see verification note on the DB constraint.
- `src/services/inventory.service.ts` — `allowNegative`: guard is now
  `if (nextQty < 0 && !input.allowNegative) throw conflict("INSUFFICIENT_STOCK")`. Flows through
  `applyStockMovementByExternal` (unchanged, passes `input` through) → `by-ref/movements` route.
  Added `metadata: input.metadata ?? null` to `createCatalogItem`. Added a doc block on the
  freelance movement conventions (BOOKING / BOOKING_REVERSAL / TOPUP / RESET) above `applyStockMovement`.
- `src/validation.ts` — `allowNegative: z.boolean().optional()` on `stockMovement` (inherited by
  `movementByRef`); `metadata: z.record(z.string(), z.unknown()).optional()` on `createCatalogItem`.
- `src/types/contract.ts` — `allowNegative?` on `StockMovementRequest`; `metadata?` on
  `CreateCatalogItemRequest`; `metadata` on `CatalogItemDTO`.
- `src/db/mappers.ts` — expose `metadata` in `toCatalogItemDTO`.
- `src/services/reports.pl.test.ts` — **new** P&L reversal unit test (5 cases).

**Convention #4 (freelance-budget item)** — no migration needed: `catalog_items.metadata`
and `stock_movements.ref_type` columns already exist. Confirmed `by-ref` movements resolve
these items by `(organizationId, externalSource, externalRef)` in `applyStockMovementByExternal`
(inventory.service.ts:73). Reorder-level (near-cap) already supported on create.

**Verification**
- `bunx tsc --noEmit` → clean (exit 0).
- `bun test` → **7 pass / 0 fail** (2 existing money + 5 new P&L reversal). Output:
  `Ran 7 tests across 2 files.` The new tests cover DoD #1 (OUT then reversal → 0; OUT only → 1,500),
  partial reversal, top-up/reset P&L-neutral (amount 0), and DoD #4 (INCOME/FIXED_COST unchanged).
- ⚠️ **Two DoD items are DB-runtime behavior and were verified by code inspection + typecheck, not
  executed**, because per the brownfield rule BE must not connect to the shared Postgres:
  (a) `allowNegative:true` drives `quantity_on_hand < 0` / omitted → `409 INSUFFICIENT_STOCK` — this
  is the one-line guard above; (b) live `/reports/pl` end-to-end. The pure `foldPLRows` test exercises
  the exact netting logic without a DB. Please confirm (a)+(b) against a DB in integration, or advise
  if you want an integration test added under a disposable test DB.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

- **Scope confirm (minor):** to make convention #4 actually usable by TASK-003/005, I plumbed
  `metadata` through create (`POST /catalog/items` now accepts + stores it) and exposed it on
  `CatalogItemDTO` — this touched `contract.ts` + `mappers.ts`, slightly beyond the 4 files the TASK
  listed. Without it, a freelance-budget item's `monthlyBudgetMinor` can't be set or read back.
  OK to keep, or do you want it moved into TASK-003's scope?
  > answer (Sober): **Keep it.** It's the minimal change that makes convention #4 real — a
  > freelance-budget item is useless if `monthlyBudgetMinor` can't be written/read. Not scope
  > creep; it's the natural surface of this task. No server-side metadata filter needed for now —
  > TASK-003 filters `metadata.kind==='FREELANCE_BUDGET'` client-side (item count is small).
- **Heads-up for TASK-005 (reset):** `applyStockMovement` asserts `quantity > 0` (money.ts) and the
  DB has a `stock_movements_qty_chk (quantity > 0)`. The reset convention shows `quantity = —`, but the
  caller must still send a **positive** `quantity` for the `ADJUST '=<budget>'` movement (the value is
  ignored for the absolute-target math but is recorded/validated). Suggest the caller pass
  `quantity = monthlyBudgetMinor` (or 1). Flagging so TASK-005 doesn't hit a 400/constraint error.
  > answer (Sober): **Confirmed — good catch.** For RESET and TOPUP the caller must pass a positive
  > `quantity` **and an explicit `amountMinor: 0`**. I've added this to TASK-005's instructions.
  > Note: P&L-neutrality of TOPUP/RESET is *also* guaranteed structurally — `getPLReport` only pulls
  > `OUT` and `IN+BOOKING_REVERSAL`, so ADJUST/TOPUP never reach the P&L regardless of `amountMinor`.
  > The explicit `amountMinor:0` is still required so the stored ledger figure isn't a misleading
  > `quantity × salePriceMinor` (which `applyStockMovement` computes when `amountMinor` is omitted).

## Review
**Verdict: DONE** ✅ (Sober, 2026-07-20)

Reviewed against SPEC-001 "Key design decision" + all 5 DoD items. Read the real code
(`reports.service.ts`, `inventory.service.ts`, `reports.pl.test.ts`) — not just the notes —
and **independently re-ran** the suite: `bun test` → **7 pass / 0 fail**; `bunx tsc --noEmit` → exit 0.

- **Reversal-aware P&L — correct.** `getPLReport` pulls `OUT` + `IN∧BOOKING_REVERSAL` only; the pure
  `foldPLRows` nets `ΣOUT − Σreversal` per item, INCOME→revenue / else→cost, fully-reversed items drop
  from `byItem`. Matches the SPEC exactly. Extracting `foldPLRows` as a pure, unit-tested function was
  the right call.
- **`allowNegative` — correct.** Guard is now `nextQty < 0 && !input.allowNegative` — default false
  preserves the existing `INSUFFICIENT_STOCK` behavior for every current caller; opt-in lets the
  capping-day overage / admin unlock drive ≤ 0. Backward-compatible.
- **INCOME/FIXED_COST untouched**, conventions documented in code, no migration (metadata + ref_type
  columns pre-exist). Metadata plumbing approved (see Q&A above).
- **Two DB-runtime DoD items** (live `allowNegative` 409 path + live `/reports/pl`) verified by
  inspection + typecheck only, **not executed** — correct call under the brownfield rule (BE must not
  touch the shared Postgres). The pure `foldPLRows` tests exercise the exact netting without a DB, and
  the `allowNegative` guard is a single, obviously-correct branch. **Accepted** — no integration test
  required now; a disposable-DB integration test can come later if we ever add one for the repo
  (not a blocker for this task).

No rework. TASK-002 and TASK-005 are unblocked.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-001 | ops: reversible P&L expense + allowNegative + freelance-budget item | SPEC-001 | DONE | Jason | — |
```
