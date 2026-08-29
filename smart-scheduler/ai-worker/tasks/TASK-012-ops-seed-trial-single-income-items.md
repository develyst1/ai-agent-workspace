# TASK-012: ops — seed the first-trial / single-session INCOME items (day-end revenue)
- Source: SPEC-001 (delivery-readiness — TASK-007 needs these to post revenue)
- Status: DONE
- Depends on: TASK-001, TASK-007 (both DONE)
- Assignee: @Jason (smart-scheduler-backoffice-back, port 4010)

## Why
TASK-007's day-end revenue posts to INCOME items keyed `first-trial` / `single-session`
via `recordSale` (best-effort). Those items **don't exist in the seed yet**, so revenue
posts nothing until they're created. Placeholder prices are provided by Porter in
`project-docs/seed-data-placeholder-2026-07-20.md`.

## What to do
Add two INCOME `catalog_items` to the ops seed (`src/db/seed.ts`), idempotent (skip if
they already exist by `external_source`+`external_ref`), so day-end revenue works:

| sku / external_ref | name | item_group | item_type | track_stock | sale_price_minor |
|---|---|---|---|---|---|
| `first-trial` | First Trial (1h) | SERVICE | INCOME | **false** | **139000** (1,390 THB placeholder) |
| `single-session` | Single Session (1h) | SERVICE | INCOME | **false** | **139000** (1,390 THB placeholder) |

- `external_source='smart-scheduler'`, `external_ref` = the sku (matches TASK-007's
  `recordSale('first-trial'|'single-session', …)`).
- `track_stock=false` (services — revenue posting only, no balance).
- **Prices are PLACEHOLDER** (`project-docs/seed-data-placeholder-2026-07-20.md` §4):
  single-session is really program-dependent (1,090–1,690) — flat 1,390 for now; คุณฟีน
  refines later. Comment this in the seed.
- Optional (Porter said the admin UI can also do this): the freelance budget items + FT/PT
  salary rows from the placeholder doc (§1–§3) can be seeded too, but are **not required**
  here — the customer can type them into the Freelance Budgets / FT-PT Salary screens
  post-deploy. Keep this task to the two INCOME items unless you want to add the rest.

## Definition of Done
- [ ] Seed creates `first-trial` + `single-session` INCOME items (track_stock=false,
      139000 satang), idempotent on re-seed.
- [ ] After seed, an attended FIRST_TRIAL/SINGLE_SESSION day-end run posts revenue that
      shows under `byType[INCOME]` in `/reports/pl` (verify in integration once the DB is up).
- [ ] `bun test` + `bunx tsc --noEmit` clean.

## Implementation Notes
`smart-scheduler-backoffice-back/src/db/seed.ts` — added an `incomeSeed` block after the retail/rental
catalog loop:

| sku / external_ref | name | item_group | item_type | track_stock | sale_price_minor |
|---|---|---|---|---|---|
| `first-trial` | First Trial (1h) | SERVICE | INCOME | false | `THB(1390)` = 139000 |
| `single-session` | Single Session (1h) | SERVICE | INCOME | false | `THB(1390)` = 139000 |

- `external_source='smart-scheduler'`, `external_ref = sku` → matches TASK-007's
  `recordSale('first-trial'|'single-session', …)`. `metadata:{category:'REVENUE'}`.
- **Idempotent** via `.onConflictDoNothing()` (org+sku unique) → safe re-seed. `track_stock=false` → no
  `stock_balances` row needed (the non-stock movement path reads balance optionally).
- **Prices are PLACEHOLDER** (commented in the seed): single-session is really program-dependent
  (1,090–1,690); flat 1,390 for now — คุณฟีน refines later, or edits via the Items screen (TASK-009 PATCH).
- Kept scope to the two INCOME items (per task); the freelance-budget / FT-PT rows in the placeholder doc
  §1–§3 are left for the admin UI post-deploy (Porter's call).

## Verification
- `bunx tsc --noEmit` → clean (exit 0); `bun test` → **17 pass / 0 fail** (seed isn't unit-tested but must
  typecheck; it does).
- ⚠️ **Running the seed (`bun run db:seed`) needs the DB → deploy-gate/integration step, not executed here**
  (brownfield: no DB). Once seeded, an attended TRIAL/SINGLE day-end run posts revenue under
  `byType[INCOME]` in `/reports/pl` (TASK-007 path).

## Questions
(Jason asks; Sober answers as `> answer: ...`)

- None. Note for @Porter's deploy gate: after applying migrations, run `bun run db:seed` in ops (or create
  the two items via the Items screen) so day-end revenue posts; adjust the placeholder 1,390 when คุณฟีน
  gives real prices.
  > answer (Sober): Noted — the deploy gate already lists the seed step; I've added the `db:seed` run + the
  > "swap placeholder 1,390 for real prices" reminder to it.

## Review
**Verdict: DONE** ✅ (Sober, 2026-07-20). Re-ran `backoffice-back`: `bun test` → **17 pass / 0 fail**,
`tsc` exit 0. Read the seed block (`seed.ts:92–112`): both items are `item_group='SERVICE'`,
`item_type='INCOME'`, `track_stock=false`, `external_source='smart-scheduler'`, `external_ref=sku`
(`first-trial`/`single-session` — matches TASK-007's `recordSale` refs), `THB(1390)` placeholder,
`.onConflictDoNothing()` → idempotent on re-seed. Correct and minimal. Running `db:seed` is a deploy-gate
step (needs the DB, brownfield) — accepted. No rework.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-012 | ops: seed first-trial / single-session INCOME items (day-end revenue) | SPEC-001 | DONE | Jason | TASK-007 |
```
