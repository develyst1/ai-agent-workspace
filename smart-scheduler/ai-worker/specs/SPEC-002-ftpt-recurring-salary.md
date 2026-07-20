# SPEC-002: FT/PT recurring monthly salary — effective-dated fixed cost
- Source: REQ-001 (rules #10, #11, #12)
- Status: DONE (tasks 005/006 DONE — 2026-07-20)
- Sibling: SPEC-001 (freelance budget-stock) — same REQ.

## Overview

Full-time / part-time salary is a **per-teacher recurring monthly `FIXED_COST`**.
Admin sets each teacher's monthly salary **once**; the system **auto-posts it to
the P&L every month** with no re-keying. Salary changes are **effective-dated** —
a change carries the month it takes effect from; **past months stay frozen** at
the amount that was in effect then; the new amount posts from the effective month
onward. Per-teacher **salary history** (amount + effective-from/to) is kept and
viewable. FT/PT are **never** part of any per-booking calc, cap, or day-end tally.

### Why new mechanism (from the code sweep)
The as-built `catalog_items FIXED_COST` + `stock_movements` is **one-shot** (a
movement is a single posting). There is no recurring auto-post and no effective-
dated history. Both are new. We reuse the P&L path (a `FIXED_COST` `OUT` movement
lands in `costMinor` / `byType[FIXED_COST]`), and add a small **effective-dated
salary schedule** + a **monthly materialize** step.

## Data Model (ops — new)

**`ops.recurring_costs`** — effective-dated per-teacher salary schedule (append-
only history; a change closes the prior row and inserts a new one):

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `organization_id` | uuid → organizations | |
| `party_id` | uuid → parties | the FT/PT teacher (ops party, external_ref=teacherId) |
| `item_id` | uuid → catalog_items | the teacher's `FIXED_COST` posting item |
| `label` | text | e.g. "เงินเดือน เอก (FT)" |
| `amount_minor` | integer | monthly salary, satang |
| `effective_from` | date | first day of the effective month |
| `effective_to` | date null | last active month (null = open-ended) |
| `active` | boolean | |
| `metadata` | jsonb | `{ teacherType:'FULL_TIME'|'PART_TIME' }` |
| `created_at` / `updated_at` | timestamptz | |

Per FT/PT teacher: one `FIXED_COST` `catalog_item` (`item_group='SERVICE'`,
`item_type='FIXED_COST'`, **`track_stock=false`** — no balance, P&L posting only,
`external_source='smart-scheduler'`, `external_ref=teacherId`). Per-teacher item
→ P&L `byItem` shows each person's salary line (stakeholder chose per-teacher
granularity).

**Historical correctness:** past months' P&L are made of movements already posted
(immutable). A salary change only edits *future* materializations. The materialize
job reads the `recurring_costs` row in effect for the target month — never a single
mutable "current salary" field — so a re-materialize of any month uses that month's
effective amount.

## API / Interface Design (ops, `/api/v1`)

- `GET /recurring-costs?externalSource=smart-scheduler` — list current + history
  per teacher.
- `POST /recurring-costs` — create/set a teacher's salary: `{ externalRef, label,
  amountMinor, effectiveFrom (YYYY-MM), teacherType }`. If a prior open row exists,
  **supersede** it: set its `effective_to` = month before `effectiveFrom`; insert
  the new row. (Creates the FIXED_COST catalog_item on first set if absent.)
- `POST /internal/recurring/materialize` — body `{ month:"YYYY-MM" }`, guarded
  (service token). For each active recurring cost effective in `month`, post one
  `FIXED_COST` `OUT` movement, `amount_minor` = that month's effective salary,
  `idempotencyKey='salary:<partyId>:<month>'` (idempotent — safe re-run, no
  double-post). Returns per-teacher results.
- P&L: appears automatically under `costMinor` / `byType[FIXED_COST]` / `byItem`.

## Flow

**Set salary (once):** admin enters teacher + monthly amount + effective-from
month → `recurring_costs` row (open-ended).

**Change salary:** admin enters new amount + effective-from month → prior row
closed at the month before; new row opens. Past months untouched.

**Monthly materialize:** the shared month-start job (TASK-005) calls
`/internal/recurring/materialize` for the new month → posts each FT/PT teacher's
`FIXED_COST` movement for that month. Idempotent.

**View history:** admin screen lists per-teacher salary rows (amount +
effective-from → effective-to).

## Non-functional
- **Idempotency**: `salary:<partyId>:<YYYY-MM>` unique per teacher-month.
- **Timezone**: month boundary uses Asia/Bangkok (align with the freelance reset;
  note the `/reports/pl` UTC-window edge from SPEC-001 review applies here too).
- **Auth**: `/recurring-costs` admin; `/internal/recurring/materialize` service token.

## Tasks
- **TASK-005** (@Jason, ops + scheduling): the shared **month-start job** —
  (a) freelance budget reset (ADJUST=budget, SPEC-001), (b) call
  `/internal/recurring/materialize` for the new month. Plus the ops
  `recurring_costs` table + `/recurring-costs` CRUD + `/internal/recurring/
  materialize` + per-teacher FIXED_COST item creation. (dep: TASK-001 for the
  reset; independent for the salary parts)
- **TASK-006** (@Fern, backoffice-front): "FT/PT Salary" admin screen — set salary
  once, effective-dated change (amount + effective-from month), per-teacher salary
  history view. Mirrors the Items partial/hook/service pattern. (dep: TASK-005)

## Questions
(Jason/Fern ask here; Sober answers as `> answer: ...`)
- (none open — model confirmed by REQ-001 #10/#11/#12.)
