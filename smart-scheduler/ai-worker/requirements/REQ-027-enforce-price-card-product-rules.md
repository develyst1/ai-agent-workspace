# REQ-027: Enforce the price card's product rules — stop selling what the school doesn't offer

- Status: READY_FOR_SA — **both questions answered by the owner 2026-08-01 ("เอา" / "เอา")**
- Priority: **HIGH** — same code as the per-program pricing work; do them together or the item model is touched twice
- Requested: 2026-08-01 by the project owner
- Deadline: go-live **2026-08-20**; owner has asked for everything today
- Source: Porter's read of the two official price cards (`project-docs/real-price-list-2026-08-01.md`)

## Problem / Goal

The real price cards contain **product rules the system has never known about**. Staff can therefore sell and
book things the school does not actually offer, and nothing stops them:

1. **Packages are not uniform across programs.** The card offers 4 / 6 / 10 hours for the skate & bike family,
   but **Onewheel E-Skate has no 10-hour package** and **Balance Play (private and group) has no 4-hour
   package.** The system offers 4/6/10 for every program.
2. **Vouchers are excluded from two programs.** Printed on the voucher card: *"VOUCHER CAN NOT BE USED FOR
   ONEWHEEL CLASS"* and *"VOUCHER CAN NOT BE USED FOR BALANCE PLAY"*. The system lets a voucher pay for any
   session.

Both are silent today: the sale or booking succeeds, and the discrepancy only surfaces as a customer
conversation — *"I bought this, why can't I use it?"* — which lands on staff, not on us.

Goal: **the system knows what the school sells, and refuses the rest.**

## Requirement

1. **A course package may only be sold in a size that program actually offers.** Onewheel: 1 / 4 / 6 h only.
   Balance Play (private and group): 1 / 6 / 10 h only. Skate & bike family: 4 / 6 / 10 h.
2. **A voucher may not be spent on an Onewheel or a Balance Play session.** Enforced when the booking is made —
   not discovered at attendance.
3. Both must be **enforced server-side**, with a **message that says why**, following the pattern REQ-019
   settled: a rejection with no visible reason is a dead button, which is not "blocked", it's "broken".
4. Where a choice is impossible, prefer **not offering it** over offering-then-refusing — a size that doesn't
   exist should not be selectable for that program in the first place. The server rule still stands regardless;
   hiding is convenience, the API is the guarantee.

## Acceptance Criteria

- [ ] Selecting Onewheel offers **no 10-hour** package; Balance Play offers **no 4-hour** package.
- [ ] Attempting either through the API is **refused with a reason**, not silently accepted.
- [ ] Booking an Onewheel or Balance Play session **against a voucher** is refused, with a reason on screen.
- [ ] A voucher still works normally for every other program.
- [ ] Existing courses and vouchers already sold are **untouched** — this constrains new sales/bookings only.

## Analysis / current state (Porter, read-only — for SA to verify)

- Course sizes come from a flat `COURSE_SIZES` list (`lib/sale-items.ts`) with **no program dimension at all** —
  the same gap that makes per-program pricing impossible. **That is why this REQ and the pricing rework are the
  same change**: once a product code is `course-{program}-{size}`, *"which sizes exist for this program"* is
  simply *"which codes exist"*, and this rule mostly falls out rather than being bolted on.
- Vouchers carry hours and validity only; nothing associates a voucher with allowed programs. This one is a
  genuine addition, not a side effect.
- Booking already resolves a subject/program, so the check has the information it needs at booking time.

## Constraints

- Server-side enforcement; the UI may also hide impossible choices but must not be the only guard.
- Do not invalidate anything already sold.
- HOW (where the program→sizes map lives, how the voucher exclusion is expressed) is the SA's design.
  ⚠️ It should be **data next to the price list, not conditionals scattered through the booking code** — the
  school will change its offering long before it changes its software.

## Out of Scope

- Prices themselves → the per-program pricing work + `real-price-list-2026-08-01.md`.
- Equipment rental → **REQ-028**.

## Questions

1. ~~Should the system refuse to sell a package a program doesn't offer?~~ ✅ **YES** (owner, 2026-08-01: *"เอา"*).
2. ~~Should the system refuse to spend a voucher on Onewheel / Balance Play?~~ ✅ **YES** (owner: *"เอา"*).
3. **Non-blocking, for the SA to decide and state:** what happens to a customer who **already holds** a voucher
   and books Onewheel — refuse, or honour it as a grandfathered case? *(Porter's lean: refuse, with a clear
   message. The exclusion is printed on the card they bought, so it was never a promise we made — and a silent
   exception is how a rule stops being a rule.)*
