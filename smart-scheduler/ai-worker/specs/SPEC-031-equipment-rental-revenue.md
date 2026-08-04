# SPEC-031 — Equipment rental as recorded revenue

- Source: REQ-028 (owner "เอา", 2026-08-01). Price card §1.
- Status: DESIGN — the money model is decided; the desk-UI entry point (Q2) awaits the owner (Porter routing), and
  it doesn't change the model.
- Go-live: **2026-08-20** (MEDIUM–HIGH).

Grounded in a code read (2026-08-04). Refs are `smart-scheduler-back`.

## 1. The finding the REQ already made — and it holds

A rental is **four more product codes posting through the existing sale path** (`lib/sale-post.ts`). **No new money
mechanism** (the hard constraint — a second way for money to enter the books is the exact failure we just cleaned
up). `recordSale(externalRef, quantity, {refId, idempotencyKey})` already: writes a **signed** `bo.movement`
(`qty = −|q|`, `value_minor = −qty × unit_price`), is **idempotent** on `idempotencyKey` (up-front check + the unique
index), and only posts to a **known** `SALE_ITEMS` code. A rental slots straight in — `quantity = hours`, minor-unit
money unchanged.

## 2. The four rental product codes (data next to the card)

Add to `lib/sale-items.ts`'s `SALE_ITEMS`, VAT-inclusive per-hour, keyed by `external_ref`:

| ref | name | price/hr |
|---|---|---|
| `rental-set` | Full set (ride + helmet + pads) | **200** |
| `rental-ride` | Ride only | **150** |
| `rental-helmet` | Helmet | **50** |
| `rental-pads` | Pads | **50** |

- **Distinguishable in reports (AC #3):** the rental items carry a marker — `metadata.revenueKind = "RENTAL"` (vs
  tuition's absence of it) — so the P&L / REQ-014 revenue-by-activity can separate rental income from lesson income.
  They're also distinct `bo.item`s (their own P&L lines by name); the marker lets a "rental vs tuition" rollup be a
  one-field group rather than a name-match. **Rental is NOT program-attributed** (it's not a sport) — so a
  revenue-by-*activity* view should bucket it as its own line, not "unattributed".
- **Seeded by the same `sale:ensure-items`** (insert-only) — after this ships, re-run it to create the four items
  (won't touch existing rows). Same one-time seed as the price-loading step.

## 3. Recording a rental — the endpoint (both entry points, one model)

`POST /rentals` (scheduling-back — where staff work and `recordSale` lives): `{ code: RentalCode, hours: int>0,
refId?: bookingId }`.
- Validates `code ∈ the four`, `hours > 0`.
- Calls `recordSale(code, hours, { refId, idempotencyKey })` with **`idempotencyKey = "rental:" + (refId ??
  saleId) + ":" + code`** so a double-submit posts once (AC #4).
- 🔴 **Unlike a booking's sale, the rental post is NOT "downstream best-effort" — it IS the event.** For
  course/voucher, `recordSale` is `void`-called because the booking is the real thing and revenue is bookkeeping.
  A rental has no other artifact: if its post is skipped, there is no rental. So the endpoint **surfaces the
  `SalePostResult`** — `duplicate` = success (idempotent replay), `item-missing`/`unknown-code`/`error` = a real
  failure the staff member must see, **not** a silent 200. (This is the one place the best-effort default is wrong.)

### Entry point (Q2 — owner to confirm via @Porter; model identical either way)
- **(a) add-on at booking/attendance** — `refId = bookingId`; a rental happens *because* a child came, staff never
  remember a separate step. Porter's lean, and REQ-028 §24's reality (every voucher customer needing gear is a rental).
- **(b) standalone** — `refId` omitted; a walk-in who rents without a lesson.
The endpoint supports **both** (refId optional); the FE surface is the only thing that differs, and that's the
owner's counter-behaviour answer. **I do not block on it** (backend owns the contract).

## 4. Out of scope (per REQ)
Physical stock levels (income, not inventory — the `bo` item model already supports quantities if wanted later) ·
deposits / damage / late returns (not on the card).

## 5. Tasks
- **BE TASK-108** — the four rental codes + `metadata.revenueKind="RENTAL"` in `lib/sale-items.ts`; `POST /rentals`
  (validate, `recordSale`, idempotency-keyed, **surfaces the post result** — not silent best-effort); note: re-run
  `sale:ensure-items` on deploy. Tests: each code posts the right VAT-inclusive amount, double-submit posts once,
  unknown code / non-positive hours rejected, the rental marker is set.
- **FE TASK-109** — record a rental **in a few clicks** (AC #1): the add-on on the booking/attendance flow (a) with
  a standalone quick-record (b) — final shape per the owner's Q2 answer; show the post result (success/duplicate/
  error), never a dead button.
- **(reporting)** rental appears in the P&L as its own item line already; a "rental vs tuition" rollup on the
  backoffice revenue screen is a **small follow-up** if the owner wants the split called out — flag, don't force.
