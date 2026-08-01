# REQ-028: Equipment rental as a recorded revenue line

- Status: READY_FOR_SA — owner approved 2026-08-01 (*"เอา"*); **one design question flagged, non-blocking**
- Priority: **MEDIUM–HIGH** — real income the system cannot see; touches the same sale path as the pricing work
- Requested: 2026-08-01 by the project owner
- Deadline: go-live **2026-08-20**
- Source: the official price card (`project-docs/real-price-list-2026-08-01.md` §1)

## Problem / Goal

The price card sells equipment rental by the hour:

| Item | Price / hour |
|---|---|
| Full set (ride + helmet + pads) | **200** |
| Ride only | **150** |
| Helmet | **50** |
| Pads | **50** |

**The system has no concept of this at all.** It is money the school takes that no report can see — so the
P&L, the SOM dashboard and REQ-014's revenue-by-activity are all understating income by an unknown amount, and
none of them can say by how much.

⚠️ **This is not a small edge case.** Several programs are marked *"equipment included"* (1st Trial, Surfskate /
Freeskate, Onewheel), but the voucher card explicitly says **"EXCLUDE EQUIPMENT RENTAL"** — so **every voucher
customer who needs gear is a rental**, and vouchers are one of the two main product families. This is a
recurring revenue stream, not an occasional extra.

Goal: **staff can record a rental, and it lands in revenue like any other sale.**

## Requirement

1. Staff can record an equipment rental: **which item, how many hours**, against a session or a customer.
2. The rental **posts revenue** through the same path as every other sale — one way money enters the books, not
   a second parallel one.
3. Rental revenue is **visible and distinguishable** in the money reports (it is not tuition, and lumping it in
   would misstate both).
4. Prices come from the price card and are **VAT-inclusive**, like everything else on it.

## Acceptance Criteria

- [ ] A staff member can record a rental in a few clicks, without leaving what they were doing.
- [ ] The rental appears in the P&L / revenue reports at the right amount.
- [ ] Rental income can be told apart from lesson income.
- [ ] Recording one twice by accident does not double-charge (same idempotency expectations as other sales).
- [ ] Nothing about existing bookings, courses or vouchers changes.

## Analysis / current state (Porter, read-only — for SA to verify)

- **Nothing exists.** There is no rental concept in scheduling or backoffice.
- **The sale machinery is already right for this**, and that is the main finding: after TASK-066 a sale is
  *a product code + a `bo.movement`*. A rental is **four more product codes** (`rental-set`, `rental-ride`,
  `rental-helmet`, `rental-pads`) posting through `lib/sale-post.ts`. It should need **no new money mechanism** —
  and if it seems to, that is worth questioning before building it.
- ⇒ **Strong reason to do this alongside the per-program pricing rework**: both are "the product catalogue must
  match the price card", and both edit the same file. Sequencing them apart means touching the item model twice.
- Rentals are **per hour**, like vouchers — so quantity is hours, and the existing minor-unit money handling
  applies unchanged.

## Constraints

- Must reuse the existing sale/movement path. **Do not invent a second way for money to enter the books** — one
  of the two things that went wrong today was revenue posting that nobody could see; two paths doubles that risk.
- VAT-inclusive amounts, posted as-is (the standing rule from the price cards).
- HOW (where staff record it, whether it attaches to a booking) is the SA's design.

## Out of Scope

- Tracking physical stock levels of helmets and boards. **This is about recording income, not inventory.** If
  the school later wants "how many helmets do we have", that is a separate REQ — and the `bo` item model
  already supports quantities, so nothing here should block it.
- Deposits, damage charges, late returns — not on the price card, not assumed.

## Questions

1. ~~Record equipment rental as revenue?~~ ✅ **YES** (owner, 2026-08-01: *"เอา"*).
2. 🔎 **Where should staff record it? — the one thing I'd like the SA to propose rather than assume.**
   Two plausible shapes, and they lead to different screens:
   - **(a) an add-on when a session is booked or attended** — fits the reality that a rental happens *because*
     a child came to a class, and it means staff never have to remember a separate step;
   - **(b) a standalone sale**, independent of any booking — simpler, and it copes with a walk-in who rents
     without a lesson.
   *(Porter's lean: **(a) with (b) available**, because a rental almost always accompanies a session — but I am
   guessing at counter behaviour I have not seen. **@Porter will ask the owner** how it actually happens at the
   desk; do not block on it, the money model is identical either way.)*
