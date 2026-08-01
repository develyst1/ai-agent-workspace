# SPEC-024: Per-program pricing — real prices, real availability, and the program on the sale
- Source: `project-docs/real-price-list-2026-08-01.md` (owner's official cards) · unblocks REQ-014
- Status: ACTIVE

## Overview
The system holds **one price per package size**. The real card prices **per program × package**, so one
`course-6` cannot hold 6,490 / 7,990 / 7,490 / 5,290. Until this lands, **every course and voucher sale posts a
wrong number** — and since TASK-066, sales post from the first day of go-live.

**This also unblocks REQ-014.** Once the sold item names the program, revenue-by-sport becomes a direct read of
the sale instead of a join back through `refId` → course → bookings → subject. Porter asked whether the pricing
rework carries the program through to the sale: **it does, by design, because that is the same change.**

## The card, read structurally — there are **four price groups**, not eight programs
| Group | Programs on the card | 1 h | 4 h | 6 h | 10 h |
|---|---|---|---|---|---|
| `bike-skate` | Bike/Scooter · Balance Cruiser · Surfskate · Freeskate · Skateboard · Inline | — | 4,790 | 6,490 | 9,790 |
| `onewheel` | Onewheel E-Skate | 1,690 | 5,790 | 7,990 | ❌ |
| `balance-private` | Balance Play 1:1 | 1,390 | ❌ | 7,490 | 11,390 |
| `balance-group` | Balance Play group | 1,090 | ❌ | 5,290 | 7,790 |

**Six programs share one price line.** Keying prices by *subject* would create ~24 items where **10** are
needed, and adding a seventh skate program would mean inventing a price rather than inheriting one. **Price
group is the real unit**, so that is what the item is keyed on.

`first-trial` (1,390, all ages, one price) is unchanged and already correct.

## Design
1. **`subjects.price_group`** — one nullable text column, one hand-authored **journal-registered** migration.
   The mapping is **data**, not code, because the owner adds programs; a new skate program joins `bike-skate`
   and is priced correctly with no deploy.
2. **Item codes carry the group**: `course-{group}-{size}` and `session-{group}` (the 1-hour row).
   `voucher-{hours}` and `first-trial` are unchanged — neither is program-specific.
3. **⚠️ Availability falls out of the catalogue — no new rule.** Onewheel has no 10 h and Balance Play has no
   4 h, so **those items simply don't exist**. TASK-066's `isKnownSaleItem` already refuses an unknown code
   **loudly**. Staff can currently sell a package that isn't offered; after this, the impossible combination
   has nothing to sell. *Reusing the existing guard is the whole trick here.*
4. **`GET /api/sellable-packages`** → the valid `(program, size, priceMinor)` combinations, so the FE offers
   only what exists rather than hard-coding the card into a dropdown that will drift from it.
5. **🔴 All prices are VAT-INCLUSIVE** — the final amount the customer pays. Posted as-is; any net figure is
   *derived*. This goes in a **named constant with that sentence on it**, not a bare number, because
   gross-vs-net is exactly the assumption that gets made silently in a pricing constant and then quietly
   misstates every report built on top of it.

## What this does NOT change
Booking, entitlements, the freelance cap, the suspend gate, voucher validity (3/6/9 months already matches the
card), and `first-trial`. **No change to how revenue posts** — only to *which item* it posts against.

## ⚠️ Coupled with REQ-025 — designed as a pair, on purpose
REQ-025 brings mid-course children across from Excel at go-live. Since TASK-066 **revenue posts at the point of
sale**, anything that creates entitlement through the sale path inherits that — so importing 30 families would
post a large, entirely fictional month of revenue for money collected months ago.

**Therefore: import and sale must be different verbs, not one verb with a flag.** A boolean like
`skipRevenue: true` is one forgotten default away from double-counting a launch month. SPEC-025 will specify a
separate explicit endpoint; recorded here because **this spec is what makes the sale path charge correctly, and
that is exactly what import must not do.**

## Staging
- **Stage 1 (go-live): prices, groups, availability, the program on the sale.** Everything above.
- **Stage 2 (after go-live): voucher exclusions** — the card says a voucher **cannot** be used for Onewheel or
  Balance Play, and nothing in the system knows that. Real, but it misprices a *booking* rather than every
  sale, and it needs `prepareVoucherBooking` to learn about groups. Own task, sequenced after.
- **Not scoped: equipment rental** (200/150/50/50 per hour) — genuine revenue with no representation at all.
  Deferred by Porter; noting it here so it isn't lost.

## Tasks
- **TASK-077** (Jason, BE): the migration, the group-keyed items, availability-by-catalogue, the sellable
  endpoint, and the sale posting the right item.
- **TASK-078** (Fern, FE): course/session creation offers only sellable combinations and shows the real price.

## Questions
(Sober asks; Porter answers as `> answer: ...`)
1. **⚠️ Subjects can't be created in the UI today** (known limit, board-tracked since REQ-003), so `price_group`
   will be set by migration for the existing programs. **If the owner adds a program before go-live, someone
   must set its group or its sales will refuse.** That refusal is loud and safe — but she should know the
   dependency exists. **Worth one line to her.**
2. **Confirming, not asking:** the voucher card's expired *"Today – 30 June 2026"* header was already ruled
   still current, and all prices VAT-inclusive. Both are baked in exactly as you relayed them.
3. **FYI: this closes REQ-014's blocker.** The sale will carry the program, so revenue-by-sport becomes a direct
   read. You can stop worrying about that one.
