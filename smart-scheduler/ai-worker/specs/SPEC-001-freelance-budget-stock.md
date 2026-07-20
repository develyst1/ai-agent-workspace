# SPEC-001: Freelance monthly budget-stock with auto-disable at cap
- Source: REQ-001
- Status: DRAFT   <!-- DRAFT until Porter confirms the 3 OPEN decisions in REQ-001 ## Questions -->

## Overview

Realize UC-016 (freelance income ceiling / auto-disable) as a **per-freelance
monthly baht budget** built on the **existing ops stock mechanic**, per the
stakeholder-mandated Path A (item-centric P&L).

The design **reuses machinery that already exists** — the code sweep (2026-07-20)
confirmed most of the pieces are already in place:

- Each freelance already maps to a backoffice **`EXPENSE` `catalog_item`** keyed
  by `external_source='smart-scheduler'` + `external_ref=teacherId`. Today its
  `stock_balances.quantity_on_hand` holds a monthly **hours** quota and
  `sale_price_minor` holds the hourly rate.
- A stock **`OUT` movement** on that item already (a) draws the balance down,
  (b) posts `amount_minor` straight into the P&L as **EXPENSE** (`costMinor` /
  `byType[EXPENSE]` in `GET /reports/pl` — only `direction='OUT'` is summed, so
  `IN`/`ADJUST` are P&L-neutral), and (c) enforces a floor via the
  `INSUFFICIENT_STOCK` (409) guard.
- The scheduling API already exposes `overLimit` per teacher, and the **staff
  frontend already auto-hides** any freelance with `overLimit=true` from the
  booking columns (`toTeacherView` → `bookable=false`) and shows an "overCap"
  badge + override switch on the Teachers screen.

So this SPEC is mostly **re-pointing and completing** existing wiring, not new
infrastructure. Four real changes:

1. **Unit change** — model the budget in **baht (integer satang)** instead of
   hours. `quantity_on_hand` = remaining budget in satang; `overLimit` =
   remaining ≤ 0 (unchanged rule, new unit).
2. **Move deduction to day-end** — remove the per-attend `consumeTeacherHours`
   call (`smart-scheduler-back/src/services/scheduler.service.ts:630`) and make
   the **existing end-of-day cut job** compute and post the freelance expense.
3. **Allow the capping-day overage** — let the freelance budget item go to/below
   0 on the day a teacher crosses the cap, so the P&L records the *true* expense
   and the teacher is hidden *the next day* (REQ explicitly accepts day-end, not
   intra-day, enforcement). This also implements REQ #9's "allow-negative" unlock.
4. **Monthly reset + admin budget screen** — reset each budget to its configured
   monthly amount at month start, and add a backoffice screen to set/edit/top-up
   per-teacher budgets and rates.

## API / Interface Design

No new ops table is required — the existing catalog/stock/report endpoints cover
it. Endpoints touched:

### Reuse (ops, port 3002, prefix `/api/v1`)
- **Create/edit a per-teacher budget item** — `POST /catalog/items` /
  (edit via movements). Item shape:
  `item_group='SERVICE'`, `item_type='EXPENSE'`, `track_stock=true`,
  `sale_price_minor` = hourly rate (satang, = the *unit cost*),
  `external_source='smart-scheduler'`, `external_ref=<teacherId>`,
  `metadata = { kind: 'FREELANCE_BUDGET', monthlyBudgetMinor: <satang> }`.
  → `metadata.monthlyBudgetMinor` is the reset target; `metadata.kind` lets the
  reset job and the admin screen select exactly the freelance-budget items.
- **Draw down (day-end cut)** — `POST /catalog/items/by-ref/movements`
  `{ externalSource:'smart-scheduler', externalRef:<teacherId>, direction:'OUT',
     quantity:<pay satang>, amountMinor:<pay satang>, refType:'EOD',
     refId:'<date>', idempotencyKey:'eod-fl:<teacherId>:<date>',
     allowNegative:true }`.
- **Top-up (admin unlock)** — `POST .../by-ref/movements` `direction:'IN'`
  (P&L-neutral) → restores positive remaining, un-caps the teacher.
- **Monthly reset** — `POST .../by-ref/movements` `direction:'ADJUST'`,
  `reason:'=<monthlyBudgetMinor>'` (absolute set, P&L-neutral).
- **List budgets / remaining** — `GET /catalog/items?externalSource=smart-scheduler&itemType=EXPENSE`
  (returns `quantityOnHand` = remaining, `salePriceMinor` = rate, `metadata`).
- **P&L** — `GET /reports/pl` — freelance expense appears automatically. *(Known
  edge: the report month window is UTC while the cut job is Asia/Bangkok — see
  Non-functional.)*

### Change (ops)
- Add an **`allowNegative` option** to the stock-movement service
  (`inventory.service.ts:applyStockMovement`) + `by-ref` validation, so a flagged
  `OUT` skips the `INSUFFICIENT_STOCK` guard and may drive the balance ≤ 0. Only
  used by the freelance day-end cut and admin allow-negative override; all other
  callers keep the guard (default `false`).

### Change (scheduling, port 3001)
- **End-of-day job** (`jobs.service.ts:runEndOfDayJob`): after the existing
  no-show cut, for each teacher with `type='FREELANCE'`, sum the day's **taught**
  bookings and post **one** `OUT` by-ref movement (idempotent per teacher/day).
- **Monthly reset**: a month-start step (new internal route
  `POST /internal/jobs/month-start`, guarded by `INTERNAL_JOB_SECRET`) that
  ADJUST-sets every freelance budget item to its `metadata.monthlyBudgetMinor`.
- **Remove** the per-attend `consumeTeacherHours` call.

## Data Model

- **ops**: no migration. Freelance budget = existing `catalog_items` +
  `stock_balances` + `stock_movements` rows; new well-known keys in
  `catalog_items.metadata` (`kind`, `monthlyBudgetMinor`). `quantity_on_hand`
  reinterpreted from hours → **satang**.
- **scheduling**: no schema change for the recommended (hourly) path — the rate
  comes from ops. *(A per-booking teaching-mode field would only be added if the
  Group/Camp flat-rate variant is confirmed in scope — see OPEN #1.)*

## Flow

**Day-end cut (extends the existing job):**
1. Existing behavior runs first (CONFIRMED→NO_SHOW, course/voucher quota cut).
2. Select the day's **taught** bookings = `status='ATTENDED'` (SICK_LEAVE /
   CANCELLED / NO_SHOW / PENDING excluded), joined to teachers where
   `type='FREELANCE'`, grouped by teacher.
3. Per teacher, pay = **Σ (rate × 1h)** across attended bookings *(every booking
   is 1h today; see OPEN #1 for the Group/Camp flat variant)*.
4. Post one `OUT` by-ref movement, `amountMinor` = pay satang, `allowNegative:true`,
   `idempotencyKey='eod-fl:<teacherId>:<date>'` (safe re-run).
5. The movement books the expense to P&L and lowers remaining. If remaining ≤ 0,
   ops now returns `overLimit=true` → next day's calendar hides the teacher.

**Auto-hide / cap flag (already built, no change beyond unit):**
- `fetchTeacherQuotas`/`attachTeacherQuotas` set `overLimit = quantityOnHand ≤ 0`;
  `toTeacherView` drops the teacher from booking columns; `FreelanceRow` shows the
  capped badge. FE only needs the **display** changed from "เหลือโควตา n ชม." to
  baht `remaining / budget`.

**Admin unlock (REQ #9 — both mechanisms supported):**
- **Top-up** = `IN` movement (durable, P&L-neutral) → remaining positive → un-capped.
- **Allow-negative override** = the existing per-teacher override (currently
  client-only `limitOverride`) keeps the teacher bookable at ≤ 0. *(Recommend
  persisting override server-side so it survives across devices — small add.)*

**Monthly reset:** month-start job ADJUST-sets each budget to
`metadata.monthlyBudgetMinor` (P&L-neutral); prior top-ups do **not** carry over
(recommended semantics — see OPEN #3).

## Non-functional
- **Idempotency**: rely on the unique `stock_movements.idempotency_key`
  (`eod-fl:<teacherId>:<date>` for cuts). No middleware exists; per-row key is the
  contract.
- **Money**: integer satang everywhere; `quantity` must be a positive int, so pay
  amounts are whole satang (freelance figures are whole baht — fine).
- **Timezone edge (flag, not blocking)**: `/reports/pl` computes the month window
  in **UTC**; the cut job runs **Asia/Bangkok**. A late-night cut on the last day
  of a Bangkok month can land in the next UTC month. Recommend aligning the report
  window to Asia/Bangkok in a follow-up; note it in the P&L task.
- **Auth**: cut/reset via `INTERNAL_JOB_SECRET`; ops movements via
  `adminOrService`. Dev bypasses (`SKIP_AUTH`, `SKIP_ADMIN_AUTH`) unchanged.

## Tasks (proposed — created after Porter confirms OPEN #1–#3)
- TASK-001 (@Jason, ops): `allowNegative` option on stock movements + `by-ref`.
- TASK-002 (@Jason, scheduling): move freelance deduction to the end-of-day job;
  remove the per-attend `consumeTeacherHours`; per-teacher day-end OUT (idempotent).
  *(depends on: TASK-001)*
- TASK-003 (@Jason, scheduling): month-start reset job (ADJUST to
  `monthlyBudgetMinor`). *(depends on: TASK-001)*
- TASK-004 (@Fern, backoffice-front): "Freelance Budgets" admin screen — set/edit
  monthly budget + rate, view `remaining/budget`, top-up, capped flag (mirror the
  Items partial/hook/service pattern).
- TASK-005 (@Fern, scheduler-front): change the freelance display from hours quota
  to baht `remaining/budget`; verify overCap badge + auto-hide still correct;
  durable unlock via top-up.
- TASK-006 (@Jason+@Fern, CONDITIONAL on OPEN #1): add per-booking teaching-mode
  and Group/Camp flat-rate handling. Only created if the stakeholder needs flat
  Group/Camp rates now.

## Questions
(Jason/Fern ask here; Sober answers as `> answer: ...`)

**OPEN decisions are tracked in REQ-001 `## Questions` (routed to @Porter).** This
SPEC's recommended defaults, pending confirmation:
- **OPEN #1 (pay basis / Group-Camp flat rate)**: Phase 1 = per-teacher hourly
  rate × attended 1h-slots. Flat Group/Camp (625/1250) deferred unless confirmed
  needed (would add TASK-006 + a per-booking teaching-mode field).
- **OPEN #2 (near-cap warning)**: support an optional per-teacher warning
  threshold via the existing `reorder_level`; hard-stop still at 0.
- **OPEN #3 (reset semantics)**: monthly reset = absolute set to
  `monthlyBudgetMinor`; mid-month top-ups do **not** carry into next month.
