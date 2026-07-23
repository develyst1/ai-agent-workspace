# SPEC-006: Backoffice rebuild on the universal item/movement model (`bo` schema)
- Source: REQ-006 (design APPROVED — `ai-worker/db-design-REQ-006.md` rev. 3)
- Status: ACTIVE

## Overview
Rebuild the backoffice around **one money mechanism**: everything is an **`item`** (with a unit + two axes:
`direction` INCOME/EXPENSE × `cadence` VARIABLE/FIXED_*, + optional ceiling/remaining), and quantity moves
via **`movement`** (signed in/out). Grouping via **tags**; **no roles / no approvals** (rev.3 — single admin
JWT, every action direct). New **`bo` schema in the SAME PostgreSQL** as the frontoffice.

### Architecture (approved design)
- **Rebuild in-place**, least churn: `smart-scheduler-backoffice-back` (:4010) drops the old `ops.*` logic
  (left dormant) and **owns the new `bo.*` schema + migrations + API**; `smart-scheduler-backoffice-front`
  (:3018) rebuilds its screens on the new model. **Auth = the existing REQ-002 single-admin JWT** (unchanged).
- **Shared-DB dual access** (the design's key win): the **backoffice API** does admin CRUD + reporting; the
  **scheduling app writes `bo.movement` directly in the booking's own DB transaction** for the atomic freelance
  decrement (no HTTP). `bo` migrations are owned by backoffice-back; scheduling-back declares the `bo` tables it
  reads/writes.

### Scope (this build)
IN: the `bo` item/movement/tag backbone + API + admin UI; **re-absorb the freelance ceiling** (REQ-004) as a
`bo.item` (unit=hour) decremented in-tx; **data migration** from the live `ops.*` + `public.freelance_budgets`.
OUT (trivially added later as more items, once the backbone is live): freelance **P&L expense** tracking and
**FT/PT salary** items (they simply become EXPENSE items — a follow-up REQ), POS UI polish, advanced reports.

## Data model — `bo.*` (5 tables)
- **`item`**: id, name, unit (text, free-text), direction (`INCOME|EXPENSE`), cadence
  (`VARIABLE|FIXED_MONTHLY|FIXED_DAILY|FIXED_QUARTERLY`), ceiling_qty int null, remaining_qty int null,
  unit_price_minor int (money per unit), owner_ref text null (e.g. teacherId), active, metadata jsonb, timestamps.
- **`movement`**: id, item_id→item, qty int (signed: + in / − out), remaining_after int null, value_minor int
  (= |qty| × unit_price), reason, ref_type, ref_id, idempotency_key unique, created_at.
- **`tag_group`** / **`tag_value`** / **`item_tag`** — the badge-style grouping (mirrors `public.booking_badges`:
  `item_tag` PK(item_id, tag_value_id), UNIQUE(item_id, tag_group_id)).
- 2 core enums: `direction`, `cadence`. No roles/approval tables.

## API — backoffice-back (`/api/v1`, single-admin JWT)
- Items: `GET/POST /items`, `PATCH /items/:id` (name/unit/price/ceiling/cadence/active; direction+unit fixed after
  create), `GET /items/:id`.
- Movements: `POST /items/:id/movements` `{qty(signed), reason?, refType?, refId?, idempotencyKey?}` → applies,
  updates `remaining_qty` (ceiling/negative guard optional per item), writes `value_minor`. `GET /items/:id/movements`.
- Tags: CRUD `tag_group`/`tag_value`; `PUT /items/:id/tags`.
- Report: `GET /reports/pl?from&to` → `SUM(value_minor) GROUP BY direction (, cadence)` + byItem.

## Frontoffice interaction (scheduling-back, direct same-DB)
- The freelance ceiling is a `bo.item` (unit=hour, EXPENSE, FIXED_MONTHLY, ceiling/remaining, unit_price=rate).
- Booking commit (FREELANCE): write a `bo.movement{qty:−1, value_minor:rate}` + decrement `remaining_qty`
  **in the booking's transaction** (blocked if remaining < 1 and no override). Cancel/leave: `qty:+1`. Monthly
  reset: `remaining_qty = ceiling_qty`. This **retires `public.freelance_budgets`** (its data migrates to `bo.item`).

## Tasks
- **TASK-021** (@Jason, backoffice-back): `bo` schema + migration (item, movement, tag_group, tag_value, item_tag)
  + Drizzle models; old `ops.*` left dormant. (dep: —)
- **TASK-022** (@Jason, backoffice-back): backoffice API on `bo` — items/movements/tags CRUD + P&L report; reuse
  the REQ-002 single-admin JWT (NO roles/approvals). (dep: TASK-021)
- **TASK-023** (@Fern, backoffice-front): rebuild the admin UI on `bo` — Items (direction×cadence, unit, price,
  ceiling), Movement in/out, Tags, P&L dashboard; retire the old ops screens. (dep: TASK-022)
- **TASK-024** (@Jason, scheduling-back): re-absorb the freelance ceiling — scheduling declares the `bo` tables,
  draws/reverses a `bo.item` (unit=hour) **in the booking tx**, monthly reset; retire `public.freelance_budgets`.
  **Sequence after 022/023 are stable** (don't destabilize the live REQ-004 limit). (dep: TASK-021)
- **TASK-025** (@Jason, backoffice-back): one-time data migration `ops.*` (live) + `public.freelance_budgets`
  → `bo.*` (catalog_items→item [FIXED_COST→EXPENSE+FIXED_MONTHLY], stock→movement/remaining, recurring_costs→
  FIXED_MONTHLY items, freelance_budgets→hour-unit items). (dep: TASK-021; coordinate with TASK-024)
- **TASK-026** (@Fern, scheduler-front): re-point the freelance budget admin (from TASK-020) at the `bo`-backed
  data/endpoints if the shape changed (unit=hour). Likely small — display already works. (dep: TASK-024)

## Questions
(Jason/Fern ask; Sober answers as `> answer: ...`)
- Design approved (rev.3, no approvals). No open blockers. Ordering: 021 → 022 → 023 (backoffice core) in
  parallel with prep for 024/025; do the freelance re-absorption (024/026) + migration (025) **last**, once the
  backoffice core is proven, so the live freelance limit isn't destabilized mid-rebuild.
