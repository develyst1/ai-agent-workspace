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

## 🔴 REQUIRED FOLLOW-UP (owner Q2 = BOTH, 2026-08-04) — @Jason, small BE add
Standalone (b) is now in scope, so the idempotency addition above is **required**:
- `POST /rentals` accepts an **optional `idempotencyKey`** in the body (validation: non-empty string when present).
- `rental.service`: `idBase = input.refId ?? input.idempotencyKey ?? crypto.randomUUID()` (add-on keeps `refId`;
  standalone uses the client key; uuid is the last-resort fallback only).
- Test: two standalone POSTs with the **same** client `idempotencyKey` → **one** movement (`duplicate` on the 2nd).
- TASK-109 generates + sends one key per rental action.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-108 | scheduling (BE): equipment rental as revenue — 4 codes (`rental-set/ride/helmet/pads`, VAT-incl) + `revenueKind="RENTAL"` marker in `lib/sale-items.ts`; `POST /rentals` via `recordSale` (idempotent, **surfaces the result** — a rental IS the event); re-run `sale:ensure-items` on deploy | SPEC-031 | 🔎 **REVIEW** (Jason 2026-08-04 — tsc 0 · **444/0**. 4 rental codes in `SALE_ITEMS` at 200/150/50/50 VAT-incl, each `metadata.revenueKind="RENTAL"`; `SaleItemSeed` gained optional `metadata`, `ensure-sale-items` now merges it (⚠️ **re-run `sale:ensure-items` on deploy** to create the 4 items). `POST /rentals {code,hours>0,refId?}` → `recordSale(code, hours, {refId, idempotencyKey: rental:{refId??uuid}:{code}})`; **surfaces the result** — `recorded`→201, `duplicate`→200 (idempotent), else `RENTAL_NOT_POSTED` 502 (never a silent 200). Both entry points (refId add-on / standalone). Pure tests: prices, RENTAL marker, `hours×price` signed movement, `isRentalCode`, key format. **Out of scope:** stock/deposits/damage — ✅ **DONE (add-on path)** Sober 2026-08-04: code-verified, prices/marker/surfaced-result(201/200/502) all correct; tsc 0 · 444/0. 🔴 **1 required addition for STANDALONE:** idempotency keys on `refId ?? uuid`, so a standalone walk-in double-submit **double-posts** (AC #4). Accept an optional client `idempotencyKey` in the body; TASK-109 sends one per action — 🔴 **NOW REQUIRED** (owner Q2 = **both** surfaces, 2026-08-04, so standalone (b) is in scope). @Jason: small BE add — 🔧 **FOLLOW-UP DONE** Jason 2026-08-04: `POST /rentals` now accepts optional `idempotencyKey`; `idBase = refId ?? idempotencyKey ?? uuid` via pure `rentalIdBase` (tested: refId wins, else client key, else undefined→fresh id). A standalone double-submit with the same client key derives the same key ⇒ recordSale dedupes to one movement. tsc 0 · **445/0**. **@Fern (109):** send a client `idempotencyKey` per standalone rental action) | Jason | — |
```
