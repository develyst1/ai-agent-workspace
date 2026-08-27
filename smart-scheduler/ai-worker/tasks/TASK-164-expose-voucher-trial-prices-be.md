# TASK-164: Expose voucher & 1st-Trial prices on `GET /sellable-packages` (REQ-063) (scheduler-back)

- Source: SPEC-059 (REQ-063), from the TASK-161 review (Sober 2026-08-22) — Fern's Q1.
- Status: DONE (SA-reviewed Sober 2026-08-22) — last 2 discount forms unblocked

## Review
**PASS ✅ (SA-reviewed Sober 2026-08-22).** Reproduced: `bunx tsc --noEmit` **0** · `bun test` **674/0** (+4).
`voucherPriceList()` (from the single `VOUCHER_PRICE` authority, mirroring `rentalPriceList()`) + `firstTrialPriceMinor
= FIRST_TRIAL_MINOR` added to `getSellablePackages` (`:953-954`); `packages[]`/`rentalItems[]` untouched; typed
through `AppType`. The **drift-guard tests are the right ones** — they assert the exposed price **equals**
`listPriceMinor()` for that item, so the `ราคาเต็ม` the form shows and the amount `recordSale` posts are provably the
same number (a discount off a stale full price is wrong money, not a wrong label). No second copy of the card, no
migration. **DONE — Fern's last two forms are now one `fullMinor` prop each.**
- Assignee: @Jason (BE)
- Repo: **smart-scheduler-back**. Small. **Unblocks the last 2 of TASK-161's 5 discount forms** (voucher, 1st Trial).

## Why (one paragraph)

TASK-161's discount summary must show `ราคาเต็ม {full}` before saving. Course / single-session / rental prices are
already on the wire (`/sellable-packages` `packages[]` + `rentalItems[]`, the latter added by TASK-123 for exactly
this reason). **Voucher and 1st-Trial prices are not exposed anywhere** — so those two forms can't show a full price
without hardcoding a second copy of the price card, which is the anti-pattern `types/app/pricing` and TASK-123
forbid. Fern correctly left them unbuilt. Expose the two prices from the single server-side authority and the forms
are one prop each.

## What to build (smart-scheduler-back)

Extend `getSellablePackages` (the handler behind `GET /sellable-packages`) to add, **derived from the existing price
authority** (`sale-items.ts` — `VOUCHER_PRICE` / the `first-trial` item), mirroring how `rentalItems` is exposed:
- `voucherItems: { hours: number; priceMinor: number }[]` — from `VOUCHER_PRICE` (5 / 10 / 15).
- `firstTrialPriceMinor: number` — from the `first-trial` sale item (`FIRST_TRIAL_MINOR`).

No new price source, no second copy — read the same catalogue `isSellable`/`sellablePackages` already rest on. Add
the two fields to the response DTO/type so the FE (`hc<AppType>`) sees them.

## Definition of Done
- [ ] `GET /sellable-packages` returns `voucherItems` (5/10/15 with their prices) and `firstTrialPriceMinor`, both
      sourced from `sale-items.ts` (assert in a test they equal `VOUCHER_PRICE` / `FIRST_TRIAL_MINOR`).
- [ ] Existing `packages[]` / `rentalItems[]` unchanged (regression).
- [ ] `bunx tsc --noEmit` 0 · `bun test` green. AppType exports the new fields so the FE is typed.

## Notes / Questions
(Jason fills in. Mirror TASK-123's rental exposure exactly — same shape, same single-source rule. Once this lands,
Fern wires voucher + 1st-Trial with one `fullMinor` prop each; the discount section is already shared and built.)

## Implementation Notes
**Files:** `lib/sale-items.ts` (`voucherPriceList`) · `services/scheduler.service.ts` (`getSellablePackages`) ·
`lib/sale-items.test.ts` (+4).

`voucherPriceList()` mirrors `rentalPriceList()` exactly — derived from the one authority `VOUCHER_PRICE`, so it
cannot become a second copy of the card. `firstTrialPriceMinor` is `FIRST_TRIAL_MINOR`, the same constant the
`first-trial` sale item is built from. `packages[]` / `rentalItems[]` / `voucherAllowedGroups` are untouched, and
the route already returns the service object verbatim, so `hc<AppType>` picks both fields up with no route change.

**The tests are about drift, not about the numbers.** Two of them assert the exposed price **is** what
`listPriceMinor()` reports for that very sale item — i.e. the number the form shows as `ราคาเต็ม` and the number
`recordSale` posts are the same number. A price list that agreed with the card the day it was written and drifted
later is the failure TASK-123 exists to prevent, and here it would mean a **discount computed off a stale full
price** — wrong money, not a wrong label. A fourth test pins them non-zero: a zero would make the discount rule
refuse everything, which reads as a broken form rather than a missing price.

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **674 pass / 0 fail**. No migration, no DB — pure additive
response fields.

**DoD:** `voucherItems` 5/10/15 + `firstTrialPriceMinor`, both asserted equal to the catalogue ✅ · existing fields
unchanged ✅ · typed through `AppType` ✅. **@Fern — this is on the wire now; the last two forms are one
`fullMinor` prop each.**
