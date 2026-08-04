# TASK-108: scheduling (BE) — equipment rental as recorded revenue (4 codes + `POST /rentals`)
- Source: SPEC-031 (REQ-028)
- Status: TODO
- Depends on: — (reuses `recordSale` / `sale-post.ts`, DONE)
- Assignee: @Jason (smart-scheduler-back)

## What to build
No new money mechanism — a rental is four product codes through the existing sale path.

1. **Four rental codes** in `lib/sale-items.ts`'s `SALE_ITEMS` (VAT-inclusive per hour):
   `rental-set` 200 · `rental-ride` 150 · `rental-helmet` 50 · `rental-pads` 50. Mark them
   **`metadata.revenueKind = "RENTAL"`** (so reports separate rental from tuition — AC #3; rental is NOT
   program-attributed). Seeded by `sale:ensure-items` (insert-only) — **re-run it on deploy** to create the items.
2. **`POST /rentals`** (`{ code, hours: int>0, refId?: bookingId }`): validate `code` ∈ the four + `hours > 0`;
   `recordSale(code, hours, { refId, idempotencyKey: "rental:" + (refId ?? saleId) + ":" + code })`.
3. 🔴 **Surface the post result — do NOT `void` it.** Unlike a booking's downstream sale, the rental post *is* the
   event: `duplicate` → success (idempotent), `item-missing`/`unknown-code`/`error` → a real failure the staff
   member must see (not a silent 200). This is the one place the best-effort default is wrong.
4. Endpoint supports **both** entry points (refId present = attached to a session; absent = standalone walk-in) —
   the money model is identical; the FE surface (Q2) is owner's call, routed by Porter.

## Definition of Done
- [ ] Each of the four codes posts a `bo.movement` at the right VAT-inclusive amount (`hours × price`, signed).
- [ ] Double-submit (same key) posts **once** (AC #4); `duplicate` returned as success.
- [ ] Unknown code / non-positive hours → 400 with a reason; a real post failure is surfaced, not swallowed.
- [ ] Rental items carry `revenueKind="RENTAL"`; `bunx tsc --noEmit` clean; `bun test` green.
- [ ] Deploy note: re-run `sale:ensure-items` (adds the 4 rental items; insert-only).

## Out of scope
Stock levels, deposits, damage (REQ-028 §Out of scope).

## Review
**Verdict: DONE ✅ (add-on path) · one required addition for the STANDALONE path** — Sober, 2026-08-04. Read the
service + endpoint; ran the suite: **tsc 0 · 444/0**.
- **Correct + as specced:** the four codes/prices with `revenueKind="RENTAL"`; `SaleItemSeed` metadata merged by
  `ensure-sale-items` (re-run on deploy); `POST /rentals` validates code∈four + hours>0; and 🔑 **the surfaced-result
  inversion is exactly the SA nuance** — `recorded`→201, `duplicate`→200, item-missing/unknown/error→
  `RENTAL_NOT_POSTED` **502** (never a silent 200). No new money mechanism — straight through `recordSale`.
- 🔴 **AC #4 gap on the STANDALONE path (the one thing to fix):** `rental.service.ts:12` keys idempotency on
  `refId ?? crypto.randomUUID()`. A **session add-on** (refId=bookingId) is idempotent — a double-click posts once ✅.
  A **standalone** walk-in gets a **fresh uuid per request**, so a double-submit **double-posts** (double-charges).
  AC #4 says "recording twice by accident does not double-charge." Other sales dedupe on a natural key (courseId /
  voucherId); a standalone rental has none, so **the client must supply an idempotency key.**
  **Required (small):** accept an optional `idempotencyKey` (or `clientRef`) in the body →
  `idBase = refId ?? body.idempotencyKey ?? uuid`; **TASK-109 generates one per rental action** and sends it for the
  standalone surface. **Contingent on Q2** — if only the add-on (a) ships, it's already idempotent and no change is
  needed; the moment the standalone (b) surface ships, this is required. Cheap; do it with/before TASK-109's (b) path.
