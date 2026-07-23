# TASK-021: backoffice-back — `bo` schema + migration (item/movement/tags)
- Source: SPEC-006
- Status: TODO
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
(Jason fills in.)

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review
(Sober fills at REVIEW.)
