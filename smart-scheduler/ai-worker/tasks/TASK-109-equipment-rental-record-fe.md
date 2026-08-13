# TASK-109: scheduler-front (FE) — record an equipment rental in a few clicks
- Source: SPEC-031 §3 (REQ-028)
- Status: DONE ✅ (SA-reviewed 2026-08-04 — tsc 0 reproduced; idempotency honest end-to-end: `rentalIdBase = refId ?? clientKey ?? undefined`, FE mints one key/open and sends it ONLY when `refId` absent, codes match FE/BE. **Price display deferred to TASK-123** — Fern correctly refused to hardcode the price card.). Was FAST-FOLLOW; pulled forward with the Fern queue.
- Depends on: TASK-108 (`POST /rentals`)
- Assignee: @Fern (smart-scheduler-front)

## What to build
Let staff record a rental **in a few clicks, without leaving what they're doing** (AC #1): pick item
(set/ride/helmet/pads) + hours → `POST /rentals`. **Owner Q2 = BOTH surfaces:**
- **(a) add-on** on the booking/attendance flow (`refId = bookingId`), **and (b) a standalone quick-record** for a
  walk-in (`refId` omitted). Both hit the same endpoint.
- **Show the post result** — success / `duplicate` (already recorded) / error (`RENTAL_NOT_POSTED`) — never a silent
  dead button. VAT-inclusive prices shown as-is.
- 🔴 **Standalone idempotency (AC #4):** since (b) has no natural key, **generate ONE `idempotencyKey` per rental
  action** (e.g. a `crypto.randomUUID()` when the form opens) and send it on submit, so a double-click / retry posts
  once. Depends on the TASK-108 BE addition accepting an optional `idempotencyKey`. (The add-on path is already
  idempotent on `refId`.)

## Definition of Done
- [x] A rental can be recorded in a few clicks from **both** surfaces (add-on + standalone); it posts and confirms.
- [x] A duplicate submit is handled gracefully (shows "already recorded", not an error or a second charge) — incl.
      the **standalone** path via the client-sent `idempotencyKey`.
- [x] A server error (`RENTAL_NOT_POSTED`) is surfaced with a reason.
- [x] tsc clean; build ok. Measure any shared-row controls at 1600/1280/768/375 (board STANDING RULE).

## Implementation Notes (@Fern)
One shared modal, both surfaces, against the frozen `POST /rentals` contract
(`{code, hours, refId?, idempotencyKey?}` → `{status:"recorded"|"duplicate", code, hours, refId, idempotencyKey}`,
201/200; error 502 `RENTAL_NOT_POSTED`). Verified the BE accepts the standalone `idempotencyKey`
(`validation.ts:470`, `rental.service.ts` — `rentalIdBase(refId, idempotencyKey) ?? crypto.randomUUID()`).
- **Types** (`types/app/scheduler`): `RENTAL_CODES` (the four frozen codes), `RentalCode`, `RecordRentalInput`,
  `RentalResult`. **Service** `recordRental` + **mock** (echoes the server's key; a repeated key in-session reads as
  `duplicate` so the flow is exercisable offline). **Hook** `useRecordRental` (invalidates the daily report — rental is
  revenue).
- **`components/partials/Rental/RentalModal.tsx`** — item `Select` (4 codes, i18n labels) + hours `NumberInput`;
  **mints one `crypto.randomUUID()` per open** and sends it **only on the standalone path** (`refId ? undefined :
  key`) — the add-on is already idempotent on `refId`+code. Result panel: `recorded` (green) / `duplicate` (yellow,
  "not charged again") / error alert with the server's reason; "record another" resets + regenerates the key.
- **Surface (a) add-on**: an "Add rental" item in the existing-booking kebab menu (`BookingModal`), `refId=booking.id`,
  `contextName=studentName`. **Surface (b) standalone**: a "Record rental" button on the Bookings → *All* tab toolbar,
  no `refId`.
- **i18n** `rental.*` (EN+TH) incl. the 4 item labels.
- STANDING RULE: the two entry points are single buttons / a menu item (no new shared-row table control); the modal's
  own controls are a full-width Select + NumberInput that stack — nothing to measure at breakpoints.
- Verified: `bunx tsc --noEmit` → 0; `bun run build` → ok.

## Questions / flags
- ✅ **RESOLVED — prices now shown (2026-08-04, after TASK-123).** The gap below was closed: Jason's **TASK-123** added
  `rentalItems: {code, priceMinor}[]` to `GET /sellable-packages` (derived server-side from the one price authority).
  FE wired: `SellablePackagesResponse.rentalItems` + mock; `RentalModal` reads `useSellablePackages()`, shows the
  per-item VAT-incl price in each Select option (`label · ฿NNN`) **and** a live `Total: ฿(price × hours)` line. **No FE
  price table** — the "never a second copy of the price card" rule holds. `rental.total` i18n EN+TH. tsc 0 · build ok.
- ~~🟡 **Rental prices are not shown** — deliberate: the four prices live in the BE (`sale-items.ts` `RENTAL_PRICES`)
  but no endpoint exposed them, and the "FE never carries a second copy of the price card" rule forbids hardcoding
  200/150/50/50. Recording worked without price (server computes from `code`). Asked for a small `rentalItems`
  endpoint.~~ → done via TASK-123.
- Live render (auth-gated) → QA alongside the other FE items.
