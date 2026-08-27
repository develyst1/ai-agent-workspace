# SPEC-058: Fix Onewheel prices + guard SINGLE_SESSION on no-1-hour programs (REQ-061)

- Source: REQ-061 (price-card audit; Q1/Q2 closed, owner answered Q3)
- Author: Sober (SA) 2026-08-22
- Status: READY — task cut (TASK-158). BE-only, no migration. Money-sensitive; dry-run-first on every DB touch.

Three parts, all under REQ-061. Parts A+B are the catalogue; Part C is the booking-time guard.

## Part A — the catalogue code fix (`src/lib/sale-items.ts`)

1. **`onewheel` 6 h: 7,990 → 7,900** (`CARD.onewheel` at :62). (AC-1)
2. **`onewheel` 10 h: add at 11,900** — which makes `isSellable("onewheel",10)` true and defines
   `course-onewheel-10` (AC-2).
3. **Correct the comment at `sale-items.ts:11`** — "Onewheel has no 10 h" is disproven by the card; leave the
   Balance-Play-has-no-4h half (confirmed correct). The next reader must not be told a false fact.
4. **Everything else byte-identical:** a diff of `sellablePackages()` shows **exactly two changes — one edit
   (6h price), one addition (10h)** (AC-3). Balance Play still has no 4 h and still refuses loudly (AC-5).

## Part B — reconcile the already-seeded rows (the part the sequencing forces)

**Q1 is closed: `sale:ensure-items` is INSERT-ONLY, never updates.** And both boxes are **already seeded** — so
`onewheel-6` already exists at the wrong **7,990**, and a code fix + `ensure-items` will create `onewheel-10` but
**leave `onewheel-6` wrong**. AC-1/AC-4 cannot pass on code + ensure-items alone. An update mechanism is **required**,
not optional.

**New owner-run script `sale:reconcile-prices`** (dry-run-first, house pattern):
- For every sale item defined in `sale-items.ts`, compare the **stored `bo.item` price** to the **catalogue price**;
  list each mismatch as `code: stored → catalogue`. `--commit` updates the mismatched rows; dry-run rolls back.
- **Why this is safe now, though `ensure-items` deliberately avoids updates:** that insert-only rule existed to
  avoid clobbering a **placeholder-era hand-set price** — and Porter verified on 2026-08-22 that **no
  `pricePlaceholder` rows exist on either box and no price was ever hand-set** (the owner only ran `ensure-items`).
  With that confirmed, `sale-items.ts` **is** the source of truth for these system items, and reconciling to it is
  correct. The **dry-run diff is the review gate** — every change is printed before any write.
- **Reusable, and it answers Porter's recurring concern:** the catalogue has silently drifted from code twice. This
  is the "update half" that belongs alongside `ensure-items` in the deploy sequence.

**AC-8 — the deploy order, stated and followed, on BOTH boxes:**
`code fix → sale:ensure-items` (inserts `course-onewheel-10` @ 11,900) `→ sale:reconcile-prices` (updates
`course-onewheel-6` 7,990 → 7,900) → **verify on the box** `onewheel-6 = 7,900` and `onewheel-10 = 11,900` (AC-4).
Movements already posted are **never** rewritten (Q2 closed — no Onewheel was ever sold, so no history exists).

## Part C — refuse SINGLE_SESSION where the price group has no 1-hour price (requirement 6)

Owner (Q3): *a one-hour session is a one-time booking; for the blue block the only 1-hour product is 1st Trial.*
Today `isSellable` is enforced only on **course** creation; nothing guards a single session, so a `SINGLE_SESSION`
on `bike-skate` books, and at day-end `revenueItemRef("SINGLE_SESSION","bike-skate")` = `session-bike-skate` which
is **not** in `SALE_ITEMS` ⇒ *"NOT POSTED — unknown product code."* Catch it at booking time.

- **The guard, at the shared booking-insert seam** (`scheduler.service.ts` ~:772, right beside the existing VOUCHER
  price-group guard): if `bookingType === "SINGLE_SESSION"` and **`!isSellable(priceGroup, 1)`**, refuse. `isSellable`
  already derives "has a 1-hour price" from the catalogue (`bike-skate` has no size-1; onewheel/balance do), so this
  is the same source of truth, not a second list.
- **This one seam covers both paths:** the standalone Single tab **and** the REQ-037 "extra paid session"
  (`createExtraSession` funnels through `createBooking`). ⇒ **Consequence to flag (not a question):** an extra
  single hour on a **blue-block course** is now refused too — correct under the owner's model (blue block has no
  1-hour price), but it means the REQ-037 add-extra-session feature won't price a bike-skate hour; staff book a
  1st Trial or a course instead. **Porter should confirm this is acceptable**, since it narrows an existing feature.
- **Wording (Porter's, bilingual):**
  TH `โปรแกรมนี้ไม่มีราคาแบบรายชั่วโมง — ถ้าเป็นการมาครั้งเดียว ให้จองเป็น "ทดลองเรียน (1 ชม.)" หรือเปิดเป็นคอร์ส 4/6/10 ชม.`
  EN `This program isn't sold by the hour — for a one-off visit book a 1st Trial (1 hr), or open a 4/6/10-hour course.`
- **AC-6** — SINGLE_SESSION on `bike-skate` refused with that wording; `FIRST_TRIAL` on the same program still books.
- **AC-7 (regression)** — SINGLE_SESSION still books on onewheel / balance-private / balance-group (they have a
  1-hour price).

## Out of scope

- Rewriting posted movements (Q2 closed — none exist).
- Any other catalogue price (all verified correct — do not "fix" a right number).
