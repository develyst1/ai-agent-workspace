# REQ-035: Sell side of the item model — frontoffice sells from the backoffice catalog, decrements stock (blocks at 0) or unlimited, posts revenue

- Status: READY_FOR_SA
- Priority: HIGH
- Requested: 2026-08-03 by คุณฟีน (stakeholder)
- Deadline: none (rides the go-live push)

## Problem / Goal
The backoffice catalog now holds the sellable items with real prices (REQ-006 model + the
2026-08-03 price seed: `course-*`, `voucher-*`, `first-trial`, `session-*`). But the **frontoffice
still uses its own separate program list** and selling a course does not draw down a backoffice
stock. **Wire the SALE flow to the catalog — the income mirror of the freelance-ceiling expense flow.**

Everything is an `item`: the freelance ceiling (EXPENSE) draws down when a teacher is booked; now the
**sellable products (INCOME) draw down when a course/voucher is sold**, and the money posts as revenue
the board can see — same universal item + movement model, opposite direction.

## Requirement
1. **Frontoffice lists come from the backoffice catalog.** The program/course/voucher pickers in the
   frontoffice (e.g. "Register a weekly course") show the **names from the backoffice catalog** — one
   source of truth — so staff can only sell what the board has put in the catalog. (Design note for SA:
   reconcile the catalog item ↔ the teaching **subject** — see Questions; the picker must still yield a
   subject for scheduling.)
2. **Selling a course/voucher → calls the backoffice → decrements that item's stock AND posts revenue**
   (a `bo.movement`, value = the item's price). The board sees **remaining stock** + the **revenue**.
   Example: board sets *Course 4h (bike-skate)* = **150**; a sale takes it to **149/150** and posts the
   course price as revenue.
3. **Stock-limited items block at 0.** If an item has a stock/ceiling set and it reaches 0, the
   frontoffice **cannot sell it** — refused with a clear reason (same idea as the freelance ceiling
   auto-hiding a teacher at 0). **Cancel / refund returns the stock.**
4. **Items may also be UNLIMITED.** An item with **no stock/ceiling** set sells (or spends) **freely,
   no cap** — only the revenue/expense movement is recorded. This applies **both ways**:
   - **income** without a ceiling → sell any quantity (board just watches the revenue);
   - **expense** without a ceiling → record spend with no limit (a cost that isn't capped).
5. **Board manages it in the backoffice** — set/edit an item's stock, or leave it unlimited; see
   `remaining / stock` (or "—/unlimited") and the revenue per item.

## Acceptance Criteria
- [ ] The frontoffice program/course/voucher picker lists names **from the backoffice catalog**, not a
      separate hardcoded list.
- [ ] Selling a course decrements its backoffice stock (150→149) **and** posts revenue = the item's
      price; the board sees both.
- [ ] A **stock-limited item at 0 cannot be sold** (refused with a reason); cancel/refund restores stock.
- [ ] An **unlimited item** (no ceiling) sells any number of times; each sale posts revenue; stock shows "—".
- [ ] Same on the expense side: a capped item blocks at 0 (freelance ceiling already does); an **uncapped
      expense item** records spend with no limit.
- [ ] The decrement + revenue happen **atomically with the sale** (no double-count on retry; cancel reverses).

## Constraints
- **Reuse the universal `bo.item` / `bo.movement` model (REQ-006).** `ceiling_qty`/`remaining_qty`
  **nullable ⇒ unlimited**; block-at-0 only when set. Same-DB **atomic** decrement inside the sale's
  transaction (like the freelance ceiling), not a laggy cross-service HTTP call.
- **Revenue recognition unchanged** (2026-07-20 rule): course/voucher revenue at **sale** (this is where
  the movement posts); trial/single at attendance (day-end).
- Prices already seeded (2026-08-03) — this REQ adds stock + block-at-0 + the frontoffice picker source.
- **Sale-type = a first-class `kind`, NOT a badge.** The type that drives the frontoffice flow
  (`FIRST_TRIAL | SINGLE_SESSION | COURSE_PACKAGE | VOUCHER | RETAIL`) must be a **structural item
  property** — a mistag would break the sale flow (a course tagged "retail" wouldn't generate a plan).
  **Badges/tags stay for flexible cross-cutting groupings** (category / branch / promo / sections of the
  **future web apps** the stakeholder plans). Scalability goal: the backoffice catalog + stock is the
  **shared source of truth**, addressable by `kind` + tags, so **other future web apps can also decrement
  stock via the same API** — this REQ must not build anything frontoffice-only that blocks that.
- **`kind` must map 1:1 to the frontoffice's 4 booking types** (stakeholder emphasized "get this right"):
  `first-trial`→**FIRST_TRIAL**, `session-*`→**SINGLE_SESSION**, `course-*`→**COURSE_PACKAGE**,
  `voucher-*`→**VOUCHER** (RETAIL = POS, not a booking). The sale flow branches by booking type. **If the
  current seed doesn't map cleanly, RESEEDING the catalog is acceptable — the stakeholder explicitly OK'd it.**

## Out of Scope
- Changing the price numbers (already the owner's card).
- The FT/PT salary side (separate).

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`)
- SA: **Catalog item ↔ subject mapping is the crux.** Catalog items are per **price-group + size**
  (`course-bike-skate-6`), but the frontoffice program picker also needs a **teaching subject** (Inline
  Skate vs Surfskate) for teacher assignment, and several subjects map to one price-group. So: does the
  picker show **catalog items** (and how do we pick the subject then), or show **subjects** (each mapped
  to its catalog item via `price_group` for the stock/revenue draw)? Recommend the latter — keep the
  subject picker, draw down the mapped catalog item — but confirm. Route any business call to Porter.
- SA: Is `recordSale` (REQ-006) already posting the sale revenue movement, so this REQ is mainly
  **+stock decrement, +block-at-0, +catalog-sourced picker**? Confirm the existing wiring.
- SA: Where does the **board set an item's stock** — the existing backoffice Items screen (add a
  stock/ceiling field), or a new control? (Likely the Items screen.)

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| REQ-035 | Sell side of the item model — frontoffice sells from the backoffice catalog → stock decrement + revenue | 🔴 **HIGH** — **SPEC_DONE `SPEC-034`; TASK-116/117/118 cut** (Sober 2026-08-04). Reuses existing `ceiling/remaining` for stock (no new col); the **one migration is a structural `kind`** (1:1 booking types); the sale **draws stock + posts revenue IN-TX atomic** (block-at-0), mirroring the freelance ceiling — a deliberate reversal of the `void recordSale` best-effort posture, safe now `bo` is same-DB. Q1: keep subject picker, draw the mapped catalog item. 🗓️ **Bigger than REQ-037 + touches live money + a migration — @Porter: go-live vs fast-follow?** (stage: block-at-0 core / board stock screen). | **READY_FOR_SA** (queued behind REQ-030/031/037) | Frontoffice pickers sourced from the backoffice catalog; selling a course/voucher → **atomic** stock decrement + revenue post; stock-limited items **BLOCK at 0** (cancel restores), items may be **UNLIMITED** (null ceiling, movement-only, both income & expense). **Sale-type = a first-class `kind` (FIRST_TRIAL/SINGLE_SESSION/COURSE_PACKAGE/VOUCHER/RETAIL), NOT a badge** — maps 1:1 to the 4 booking types; **reseed OK** if the seed doesn't map cleanly. Reuse REQ-006 `bo.item`/`movement`; scalable so future web apps decrement the same catalog. **Crux Q for SA:** catalog-item ↔ teaching-subject mapping (several subjects → one price-group; picker must still yield a subject). **@Sober to SPEC.** |
```
