# TASK-021: backoffice-back — `bo` schema + migration (item/movement/tags)
- Source: SPEC-006
- Status: DONE
- Depends on: none
- Assignee: @Jason (smart-scheduler-backoffice-back, port 4010)

## What to do
Create the new `bo.*` schema (same PostgreSQL) — the universal item/movement backbone. Leave the old
`ops.*` tables/logic **dormant** (don't drop yet — reference during migration). Files: `src/db/schema.ts`
(add a `bo` pgSchema + tables), `drizzle/` migration.

Tables (per SPEC-006 / design rev.3):
- **`bo.item`**: `id` uuid PK, `name` text, `unit` text (free-text), `direction` enum(`INCOME|EXPENSE`),
  `cadence` enum(`VARIABLE|FIXED_MONTHLY|FIXED_DAILY|FIXED_QUARTERLY`), `ceiling_qty` int null,
  `remaining_qty` int null, `unit_price_minor` int NOT NULL default 0, `owner_ref` text null,
  `external_source` text null, `active` bool default true, `metadata` jsonb, `created_at`/`updated_at`.
- **`bo.movement`**: `id` uuid PK, `item_id`→item (cascade), `qty` int NOT NULL (signed),
  `remaining_after` int null, `value_minor` int NOT NULL default 0, `reason` text null, `ref_type`/`ref_id`
  text null, `idempotency_key` text null UNIQUE, `created_at`. Index (item_id, created_at).
- **`bo.tag_group`** (id, name, active, sort_order), **`bo.tag_value`** (id, tag_group_id→tag_group,
  label, color null, active, sort_order), **`bo.item_tag`** (item_id→item, tag_value_id→tag_value,
  tag_group_id; PK(item_id, tag_value_id); UNIQUE(item_id, tag_group_id)).
- Enums `bo.direction`, `bo.cadence`. Hand-write the migration `CREATE SCHEMA IF NOT EXISTS bo` +
  `CREATE TABLE IF NOT EXISTS` (same drifted-meta posture as prior migrations).

## Definition of Done
- [ ] `bo` schema + 5 tables + 2 enums defined in Drizzle; migration created (IF NOT EXISTS).
- [ ] `bunx tsc --noEmit` clean; the app still boots with `ops.*` intact (dormant, untouched).
- [ ] `bun test` passes (add a schema-shape/smoke test if practical).

## Implementation Notes
Repo: `smart-scheduler-backoffice-back`. Schema + migration only; **`ops.*` untouched (dormant)**.

- **`src/db/schema.ts`** — new `bo` `pgSchema` with 2 enums (`bo.direction` INCOME/EXPENSE, `bo.cadence`
  VARIABLE/FIXED_MONTHLY/FIXED_DAILY/FIXED_QUARTERLY) + 5 tables:
  - `bo.item` (id, name, unit free-text, direction, cadence, ceiling_qty?, remaining_qty?, unit_price_minor,
    owner_ref?, external_source?, active, metadata, timestamps) — index on (external_source, owner_ref).
  - `bo.movement` (id, item_id→item cascade, qty signed, remaining_after?, value_minor, reason?, ref_type?,
    ref_id?, idempotency_key unique, created_at) — index (item_id, created_at).
  - `bo.tag_group`, `bo.tag_value` (→group cascade), `bo.item_tag` (PK(item_id, tag_value_id),
    UNIQUE(item_id, tag_group_id) — mirrors `public.booking_badges`). + relations for query ergonomics.
  - `primaryKey` added to the pg-core imports for the composite `item_tag` PK.
- **Migration `drizzle/0004_bo_schema.sql`** (+ journal entry idx 4) — hand-written `CREATE SCHEMA IF NOT
  EXISTS "bo"`, enums via `DO $$ … EXCEPTION WHEN duplicate_object`, `CREATE TABLE IF NOT EXISTS` ×5, FKs in
  a guarded `DO` block, `CREATE … INDEX IF NOT EXISTS`. Fully idempotent (drifted-meta posture). `drizzle-kit
  generate` still can't run non-interactively, so hand-written as before.
- **`drizzle.config.ts`** — `schemaFilter: ["ops", "bo"]` so a future working `generate` sees both.

**Verification**
- `bunx tsc --noEmit` → clean (exit 0) — the Drizzle models compile (bo tables auto-registered via
  `db/index.ts`'s `import * as schema`). `bun test` → **36 pass / 0 fail** (added `schema.test.ts`:
  enum values + all 5 tables + item's universal columns present).
- ⚠️ Applying the migration / booting the server needs the DB — **not run** (brownfield). `ops.*` definitions
  and logic are untouched → the app still boots with ops intact (verified by inspection: only additive schema).

## Questions
(Jason asks; Sober answers as `> answer: ...`)

- None. Foundation only — TASK-022 (API) and TASK-024/025 (freelance re-absorb + migration) build on this.
  Note: `bo.movement` has no ceiling/negative CHECK constraint — the guard is per-item and applied in the
  service layer (TASK-022), matching how ops did it and the design's "ceiling/negative guard optional per item".
  > answer (Sober): **Correct — per-item service-layer guard is the design intent** (ceiling/negative is
  > optional per item, so a DB CHECK would be wrong). Good.

## Review
**Verdict: DONE** ✅ (Sober, 2026-07-20). Re-ran `backoffice-back`: `bun test` → **36 pass / 0 fail**, `tsc` 0.
Read the real schema + migration `0004_bo_schema.sql`:
- `bo` schema + 2 enums (`direction` INCOME/EXPENSE, `cadence` VARIABLE/FIXED_*) + 5 tables (`item`, `movement`,
  `tag_group`, `tag_value`, `item_tag`) — exactly the design rev.3. `item` carries the universal columns
  (unit, direction, cadence, ceiling/remaining, unit_price_minor, owner_ref); `movement` is signed `qty` +
  `value_minor`; `item_tag` PK(item_id, tag_value_id) + UNIQUE(item_id, tag_group_id) mirrors `booking_badges`. ✓
- Constraints verified: all FKs cascade; **`bo_movement_idempotency_uq`** (unique, nullable-safe) → TASK-022's
  idempotency is guaranteed; indexes `(item_id, created_at)` + `(external_source, owner_ref)`. ✓
- Migration is fully idempotent (`CREATE SCHEMA/TABLE/TYPE IF NOT EXISTS` + guarded DO blocks) and **`ops.*` is
  untouched** (additive only — the app still boots on ops). DB apply is the deploy step (brownfield). No rework.
**TASK-022, TASK-024, TASK-025 unblocked** (all dep TASK-021).
