# REQ-066: 🔴 ทุกกิจกรรมมีราคา 1 ชั่วโมง (1,390) — ตอนนี้จองคาบเดี่ยวไม่ได้เลย
- Status: READY_FOR_SA
- Priority: 🔴 **HIGHEST — this is blocking live bookings on `uat` right now, and we caused it**
- Requested: 2026-08-23 by stakeholder (owner) — *"กิจกรรมทุกกิจกรรม มีราคา 1hr ทั้งหมด ตอนนี้มันทำให้เราไม่สามารถจองคอร์สรายครั้งได้"*
- Price confirmed by the owner: **1,390** — the same as 1st Trial

## 🔻 This is Porter's error, and it shipped yesterday
On 2026-08-22 I read the customer's price card and concluded **"the blue block has no 1-hour rate"**, because its
rows show only 4 / 6 / 10 HRS. I then took that conclusion into **REQ-061 requirement 6** and had a guard built
that **refuses a `SINGLE_SESSION` on any program with no 1-hour price.**

**The conclusion was wrong.** Every program is sold by the hour at **฿1,390**; the card simply does not print a
1-hour row for the blue block. ⇒ The guard now refuses legitimate bookings on the customer's live system:
> *"โปรแกรมนี้ไม่มีราคาแบบรายชั่วโมง — ครั้งแรกให้ใช้ 1st Trial หรือขายเป็นคอร์ส/บัตร"*

**A reading of a document became a rule in code, and nobody could tell the difference afterwards.** The lesson is
the one this project keeps relearning: **a price is data the owner states, never an inference from a layout.**

## Requirement
1. **Every price group has a 1-hour price of ฿1,390** — `bike-skate` gains `1: 1390`, alongside the three groups
   that already have one (`onewheel` 1,690 · `balance-private` 1,390 · `balance-group` 1,090). ⚠️ **Only
   `bike-skate` changes; the other three keep their own numbers.**
2. **A single session can be booked on every program again.** REQ-061's guard is **kept, not removed** — with all
   four groups priced it simply stops firing, and it still protects any future program added without a price.
   **Deleting it would re-open the silent-revenue-loss hole it was built for.**
3. **The sale item follows** — `session-bike-skate` @ ฿1,390 must exist so the revenue actually posts.
   `sale:ensure-items` creates it; without that step the booking succeeds and **the money silently does not post**
   (the exact failure of 2026-08-22).
4. **Nothing else about pricing moves.** Course prices, voucher prices, rentals, 1st Trial and the other three
   groups' 1-hour rates are untouched.

## Acceptance Criteria
- [ ] **AC-1** — **Given** Surfskate / Skateboard / Bike / Inline Skate / Freeskate, **When** staff book a single
      session, **Then** it is **accepted**, with `ราคาเต็ม 1,390`.
- [ ] **AC-2 (revenue)** — that session posts **฿1,390** at day-end on `session-bike-skate`. **Verified in the
      ledger, not on the screen.**
- [ ] **AC-3 (discount)** — the discount section now appears for those single sessions (it keys off the line
      total), and a discount applies correctly against **1,390**.
- [ ] **AC-4 (guard kept)** — a program whose price group is **NULL** still refuses a single session, with the
      same message. The guard is dormant, not deleted.
- [ ] **AC-5 (regression)** — Onewheel 1 h still 1,690 · Balance Private 1,390 · Balance Group 1,090 · 1st Trial
      1,390 · all course/voucher/rental prices unchanged. **A diff of `sellablePackages()` shows exactly one
      addition.**
- [ ] **AC-6 (deploy)** — the runsheet states: **code → `sale:ensure-items` → verify `session-bike-skate` exists at
      1,390**, on both boxes.

## Constraints
- **Do not remove REQ-061's guard** (requirement 2).
- Prices live in `sale-items.ts` and reach `bo.item` through `ensure-items` / `reconcile-prices`. **No hand-editing.**

## 📌 Knock-on that Porter must fix himself — the staff guide is now wrong
`project-docs/2026-08-23-staff-guide-discount.md` contains a section stating **the blue block cannot be booked by
the hour**, with a table of "ขายรายชั่วโมงได้ / ไม่ได้". **That is now false**, and the owner may already have sent
it to the customer. **Porter corrects the document and tells him.**

## Questions
- **Q1 (to SA):** does `1,390` for a blue-block hour need to differ from `first-trial`'s 1,390 as a **separate
  product code** (`session-bike-skate`) for reporting? Porter's assumption is **yes — same price, different
  product**: a first visit and a repeat hour are different things commercially even at the same price, and REQ-014
  should be able to tell them apart. Say if that is wrong.
