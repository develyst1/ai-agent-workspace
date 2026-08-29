# TASK-123: scheduling (BE) — expose rental item prices on `GET /sellable-packages`

- Source: SPEC-031 (REQ-028 rental) — surfaced by @Fern while building TASK-109 (rental FE)
- Status: DONE ✅ (SA-reviewed 2026-08-11 — tsc 0 reproduced; BE `rentalPriceList()` derives from the single `RENTAL_PRICE` authority (`sale-items.ts:130`, no second copy), exposed on `/sellable-packages` (`scheduler.service.ts:888`); FE `RentalModal` reads `card.rentalItems` (no hardcoded prices), shared `formatPriceMinor`, Total = `priceMinor×hours`. Closes the TASK-109 price-display gap.)
- Depends on: — (extends the delivered `/sellable-packages` payload)
- Assignee: @Jason (smart-scheduler-back)

## Why
TASK-109 records rentals fully (the server computes revenue from `code`), but the RentalModal can't **show** the
VAT-inclusive price because the four prices live only in BE `sale-items.ts` `RENTAL_PRICE` (200/150/50/50) with **no
endpoint exposing them** — they're not on `/sellable-packages` (that's courses/vouchers). The repo rule is explicit:
**the FE must never carry a second copy of the price card** — so Fern correctly did NOT hardcode the prices. Expose
them from the one authority instead.

## Decision (SA) — extend `/sellable-packages`, don't add a new endpoint
Rentals are another sellable line; `/sellable-packages` is the single "what's sellable + what it costs" card the FE
already loads. Add a sibling field rather than minting `GET /rentals/items` (avoids a new endpoint + hook; keeps one
price source).

## What to build
Add to the `/sellable-packages` response:
- `rentalItems: { code: RentalCode; priceMinor: number }[]` — derived from `RENTAL_CODES` + `RENTAL_PRICE` (the same
  constants `RENTAL_ITEMS` already maps). **code + priceMinor only** — the FE owns the labels via i18n
  (`rental.item*`), so no name/i18n crosses the wire.
- Update the response **type** (`SellablePackagesResponse`) on both sides + the FE mock so tsc stays honest.

## Definition of Done
- [ ] `GET /sellable-packages` returns `rentalItems` with the four codes + their `priceMinor` (200/150/50/50 THB in
      satang), sourced from `RENTAL_PRICE` (no second copy).
- [ ] Shared response type updated; FE mock carries the field.
- [ ] `bunx tsc --noEmit` clean; `bun test` green.
- [ ] Unblocks the TASK-109 price display (Fern wires it off this field — no FE-side price table).

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-123 | scheduling (BE): expose `rentalItems:{code,priceMinor}[]` on `GET /sellable-packages` (from `RENTAL_PRICE` — one price authority, no FE copy; FE owns labels via i18n) | SPEC-031 | ✅ **DONE** (SA-reviewed 2026-08-11 — tsc 0 reproduced; `rentalPriceList()` from the single `RENTAL_PRICE` authority (`sale-items.ts:130`) on `/sellable-packages:888`; FE `RentalModal` reads `card.rentalItems` + shared `formatPriceMinor`, Total=priceMinor×hours, no hardcoded prices. **REQ-028 fully closed; fast-follow 107/109/102/122/123 all SA-reviewed.**) · (Jason 2026-08-04 — tsc 0 · **458/0**. `rentalPriceList()` in `sale-items.ts` derives `{code, priceMinor}[]` from `RENTAL_CODES`+`RENTAL_PRICE` (the same authority `RENTAL_ITEMS` maps — no second copy); added to the `/sellable-packages` payload as `rentalItems`. **code+priceMinor only** — no name/i18n crosses the wire (FE owns labels via `rental.item*`). BE return type is Hono-RPC-inferred, so the field flows to the FE type automatically. Pure test: the four codes at 200/150/50/50 THB, each matching its seed item's price. **Unblocks TASK-109 price display** — Fern wires off this field, no FE price table. @Fern: update the FE mock to carry `rentalItems`.) | Jason | — |
```
