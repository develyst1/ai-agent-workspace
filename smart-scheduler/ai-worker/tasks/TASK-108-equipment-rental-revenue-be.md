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
