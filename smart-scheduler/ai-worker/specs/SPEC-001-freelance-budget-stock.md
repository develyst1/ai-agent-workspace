# SPEC-001: Freelance monthly budget-stock — booking-time cap & expense
- Source: REQ-001 (rules #1–#9, #12)
- Status: DONE (all tasks 001/002/003/004/007/008/009/010 DONE — 2026-07-20)
- Re-baselined 2026-07-20 after คุณฟีน's timing correction (booking-time, not day-end).
- Sibling: SPEC-002 (FT/PT recurring fixed-cost salary) — same REQ.

## Overview

Each freelance teacher gets a **per-person monthly budget (baht)** modeled as the
**existing ops stock mechanic**. The budget stock is drawn down **at booking time**
(not day-end — corrected by คุณฟีน). One stock movement at booking does three
things at once: **(a) posts the freelance expense to P&L, (b) enforces the
real-time cap (blocks over-booking + drives auto-hide), (c) shows `remaining /
budget`.** **Cancel / customer-leave reverses the movement** (returns stock,
releases the cap, un-books the expense).

The **end-of-day job does NOT touch freelance budgets** — it is revenue-only
(SPEC covers that separately; see REQ #5 / open revenue-recognition question).
FT/PT salary is out of this SPEC (→ SPEC-002).

### What already exists (from the 2026-07-20 code sweep) — reused as-is
- Per-teacher `EXPENSE` `catalog_item` keyed by `external_source='smart-scheduler'`
  + `external_ref=teacherId`; `stock_balances.quantity_on_hand` = remaining;
  `sale_price_minor` = rate.
- `POST /api/v1/catalog/items/by-ref/movements` (OUT/IN/ADJUST by teacherId).
- `overLimit = quantityOnHand ≤ 0` flows to scheduling's TeacherDTO; the **staff
  FE already auto-hides** an `overLimit` freelance from booking columns
  (`toTeacherView → bookable=false`) and shows an overCap badge + override switch.
- Idempotency via the unique `stock_movements.idempotency_key`.

### What changes vs. as-built
1. **Deduction timing: attend → booking-commit.** Today `consumeTeacherHours`
   fires on `attend` (`scheduler.service.ts:630`). Move it to **booking commit**,
   and **add a reversal** on cancel / customer-leave. Remove the attend-time call.
2. **Unit: hours → baht (satang).** `quantity_on_hand` now = remaining budget in
   satang; each movement's `quantity`/`amount_minor` = the job's baht in satang.
3. **Reversible P&L expense** — see the mechanism below (the key design decision).
4. **Near-cap warning** via per-teacher `reorder_level`.
5. **Monthly reset** (overwrite to base budget; top-ups don't carry).

## Key design decision — reversible freelance expense in an OUT-only P&L

`GET /reports/pl` sums only `direction='OUT'`. A cancel `IN` would restore stock
but NOT un-book the expense, and is indistinguishable from an admin top-up `IN`.
Resolution — **movement conventions**:

| Event | Movement | quantity | amount_minor | ref_type | idempotencyKey |
|-------|----------|----------|--------------|----------|----------------|
| Freelance booking committed | `OUT` | job satang | job satang | `BOOKING` | `fl-book:<bookingId>` |
| Cancel / customer-leave | `IN` | job satang | **job satang** | `BOOKING_REVERSAL` | `fl-unbook:<bookingId>` |
| Admin top-up (unlock) | `IN` | top-up satang | **0** | `TOPUP` | `fl-topup:<teacherId>:<n>` |
| Monthly reset | `ADJUST` `=budget` | — | **0** | `RESET` | `fl-reset:<teacherId>:<YYYY-MM>` |

→ **P&L EXPENSE for a budget item = Σ(OUT.amount_minor) − Σ(IN.amount_minor WHERE
ref_type='BOOKING_REVERSAL')`.** Because top-ups/resets carry `amount_minor=0`,
they never affect P&L; only bookings (+) and their reversals (−) do → the reported
freelance expense equals **net committed pay**. This is a scoped change to
`reports.service` (INCOME stays OUT-only; FIXED_COST stays OUT-only).

## API / Interface Design

### ops (port 3002, `/api/v1`) — change
- `reports.service.getPLReport`: EXPENSE amount = ΣOUT − Σ(reversal IN) per item
  (reversal = `ref_type='BOOKING_REVERSAL'`). Revenue/fixed-cost unchanged.
- `applyStockMovement` / `by-ref`: accept an **`allowNegative:boolean`** option
  (default false) — when true, skip the `INSUFFICIENT_STOCK` guard so the balance
  may go ≤ 0 (used by the capping-day overage and admin allow-negative override).
- Freelance-budget item convention: `metadata={ kind:'FREELANCE_BUDGET',
  monthlyBudgetMinor:<satang> }`; `reorder_level` = near-cap warning threshold
  (satang). No new table.

### ops — reuse (no change)
- Create/edit budget item: `POST /catalog/items` (SERVICE/EXPENSE/track_stock).
- Movements by teacher: `POST /catalog/items/by-ref/movements`.
- List budgets: `GET /catalog/items?externalSource=smart-scheduler&itemType=EXPENSE`.

### scheduling (port 3001) — change
- **Booking commit** of a `FREELANCE` teacher's booking → synchronous `OUT`
  by-ref movement (`fl-book:<bookingId>`). A `409 INSUFFICIENT_STOCK` (over
  budget, no override) **blocks the booking** (real-time over-booking prevention).
- **Cancel / customer-leave** (`SICK_LEAVE`) of a freelance booking → `IN`
  reversal (`fl-unbook:<bookingId>`, `BOOKING_REVERSAL`).
- **Remove** the attend-time `consumeTeacherHours` call.

## Data Model
- **ops**: no migration; new well-known keys in `catalog_items.metadata`;
  `reorder_level` reused; `quantity_on_hand` reinterpreted hours→satang.
- **scheduling**: no schema change (rate/budget live in ops; amount = rate × 1h).

## Flow

**Booking a freelance (real-time gate):**
1. Staff picks a freelance slot. Amount = `rate × 1h` (all bookings 1h).
2. On commit, scheduling posts `OUT` by-ref (`allowNegative:false`).
3. `2xx` → booking saved; ops balance ↓; expense booked to P&L. If remaining hits
   the warning level (`reorder_level`) → near-cap flag. If it hits ≤ 0 → `overLimit`
   → teacher auto-hidden from columns for the next bookings.
4. `409` → budget exhausted → booking rejected (unless override active).

**Cancel / customer-leave:** scheduling posts the `IN` reversal → stock restored,
expense un-booked, cap released, teacher may reappear.

**Auto-hide / cap flag (already built):** `overLimit` → `bookable=false` (staff
FE). *Display* changes from hours ("เหลือโควตา n ชม.") to baht `remaining/budget`;
add the near-cap warning styling from `reorder_level`.

**Unlock (REQ #9, both mechanisms):** top-up `IN` (durable) OR allow-negative
override (persist the existing client-only `limitOverride` server-side so the
booking path passes `allowNegative:true` for that teacher).

**Monthly reset:** `ADJUST '=monthlyBudgetMinor'` per teacher, P&L-neutral,
top-ups don't carry. (Triggered by the shared month-start job — see SPEC-002 /
TASK-005.)

## Revenue recognition (REQ #5 — Porter/คุณฟีน confirmed 2026-07-20)

Revenue timing is **per booking type**, chosen so nothing double-counts:

| Booking type | Revenue recognized | Mechanism |
|--------------|--------------------|-----------|
| `COURSE_PACKAGE`, `VOUCHER` | **at sale** (unchanged) | existing `recordSale` on course/voucher creation posts an INCOME `OUT`. Booking a session only **consumes the prepaid entitlement** — no day-end revenue. |
| `FIRST_TRIAL`, `SINGLE_SESSION` | **at attendance (day-end)** | these are **not** sold as packages and currently record **no** revenue at all → the end-of-day job recognizes them. **Additive, no double-count.** |

**Design (day-end trial/single revenue):** the end-of-day job, after its existing
no-show cut, selects the date's **`ATTENDED`** bookings of type `FIRST_TRIAL` /
`SINGLE_SESSION` and posts revenue to ops via the existing **`recordSale`** path on
**per-type INCOME items** — product codes **`first-trial`** and **`single-session`**
(mirroring the existing `course-{size}` / `voucher-{hours}` INCOME items). Each is an
INCOME `catalog_item`, **`track_stock=false`** (service, no balance), with a
configurable `sale_price_minor` = the trial/single price. `recordSale` posts an
INCOME `OUT` (amount = the item's price) → revenue in `/reports/pl`. Idempotent per
booking (`idempotencyKey='rev:<bookingId>'`), best-effort (skips if ops off or the
INCOME item isn't seeded yet — safe before real prices land).

The day-end job **only** tallies revenue here — it never touches freelance budgets
or expense (those are booking-time, per #4). Actual trial/single prices are a future
seed/DATA REQUEST (a free trial = price 0 → posts nothing, harmless).

## Non-functional
- **Idempotency**: per-booking keys make booking/cancel safe to retry.
- **Cache staleness**: scheduling caches ops quotas 5 min (`ops-client.ts TTL_MS`).
  The synchronous OUT is the true gate; invalidate/shorten the cache after a
  booking so the column auto-hide is prompt (FE task).
- **Money**: integer satang; freelance figures are whole baht.

## Tasks
- **TASK-001** (@Jason, ops): reversal-aware P&L + `allowNegative` + reversal IN
  movement convention + freelance-budget item metadata. (dep: —)
- **TASK-002** (@Jason, scheduling): booking-time draw-down + cancel/leave
  reversal + remove attend-time consume + synchronous cap gate. (dep: TASK-001)
- **TASK-003** (@Fern, backoffice-front): "Freelance Budgets" admin screen —
  set/edit monthly budget + rate + near-cap threshold, `remaining/budget`, top-up,
  capped flag. (dep: TASK-001)
- **TASK-004** (@Fern, scheduler-front): baht `remaining/budget` display +
  near-cap warning + verify real-time auto-hide/override + cache invalidation. (dep: TASK-002)
- Monthly reset step is folded into the shared month-start job — see **TASK-005** (SPEC-002).
- **TASK-007** (@Jason, scheduling): end-of-day revenue tally for attended
  `FIRST_TRIAL` + `SINGLE_SESSION` via `recordSale` on `first-trial`/`single-session`
  INCOME items (idempotent per booking); packages/vouchers unchanged. (dep: TASK-001 —
  reuses ops recordSale/INCOME items) — **unblocked 2026-07-20 by Porter's revenue decision.**

## Questions
(Jason/Fern ask here; Sober answers as `> answer: ...`)

- Open (routed to @Porter, non-blocking for these tasks): **multi-month / future-
  dated freelance bookings.** A `COURSE_PACKAGE` books its whole recurring chain
  upfront; drawing every session now would hit the *current* month's budget for
  sessions in future months. This SPEC assumes the launch case (ad-hoc 1h,
  same-month) draws at booking against the current budget. If freelances teach
  multi-month courses, we revisit to draw per session-month. Flagged to Porter.
