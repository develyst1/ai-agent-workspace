# Seed data — PLACEHOLDER (2026-07-20)

> Source: คุณ (dev) via Porter, 2026-07-20. **These are placeholder numbers** — คุณฟีน
> (customer) will correct them later. Answers the REQ-001 DATA REQUEST. Prices read
> from the two rate-card images in the monorepo root (see bottom).
> The customer can also just type these into the admin UI (Freelance Budgets /
> FT-PT Salary screens) after deploy — a dev seed is optional.

## 1. Freelance budgets (8 teachers) — PLACEHOLDER
- **Monthly budget: 70,000 THB each**
- **Hourly rate: 500 THB/hr each** ⚠️ *rate not given by stakeholder; using the
  documented Freelance-Private default (teacher-roster-payroll.md). Confirm later.*
- Teachers: มาร์ค, โจ้, เก่ง, ต๊าบ, มุ, จิ, เนย์, กอล์ฟ

## 2. Full-time salaries (7 teachers) — PLACEHOLDER
- **Monthly salary: 50,000 THB each** (recurring FIXED_COST, effective from the seed month)
- Teachers: เอก, แบงค์, ฮาริส, ข้าวจ้าว, แคมป์, เลวิส (roster lists 6 names vs count 7 — parked)

## 3. Part-time salaries (8 teachers) — PLACEHOLDER
- **Monthly salary: 15,000 THB each** (recurring FIXED_COST)
- Teachers: ปริ้นท์, กานต์, ซีด, เจย์, คิด, นิว, โต๊ด (roster lists 7 names vs count 8 — parked)

## 4. Revenue INCOME item prices (for TASK-007 day-end revenue: TRIAL + SINGLE)
From the rate card (image 2):
- **First Trial (1 HR, all programs): 1,390** — flat, unambiguous.
- **Single session (1 HR)** — varies by program on the card:
  - Onewheel E-Skate: 1,690
  - Balance Play (Private 1:1): 1,390
  - Balance Play (Group): 1,090
  - Bike/Scooter, Surfskate/Freeskate/etc.: **no 1-HR single price on the card** (packages only)
  - → **Placeholder for a single flat SINGLE_SESSION INCOME price: 1,390.** ⚠️ real price
    is program-dependent (1,090–1,690); customer to refine, or decide if single-session
    needs per-program pricing.

## 5. Bonus — resolves an earlier parked question (voucher sizes)
Voucher image confirms the code's **5 / 10 / 15 h** voucher sizes are CORRECT:
- 5h = 6,000 (expire 3 mo) · 10h = 10,500 (6 mo) · 15h = 13,500 (9 mo)
- Excludes equipment rental; **cannot be used for Onewheel class or Balance Play.**
(So no change needed to voucher sizing — the rate-card/code mismatch flagged in
product-catalog-pricing.md §3 is resolved in favour of 5/10/15.)

## 6. Course package prices (reference, matches product-catalog-pricing.md)
- Bike/Scooter/Balance Cruiser: 4h = 4,790
- Surfskate/Freeskate/Skateboard/Inline: 6h = 6,490 · 10h = 9,790
- Onewheel: 1h = 1,690 · 4h = 5,790 · 6h = 7,990
- Balance Play Private: 1h = 1,390 · 6h = 7,490 · 10h = 11,390
- Balance Play Group: 1h = 1,090 · 6h = 5,290 · 10h = 7,790

## Source images (monorepo root `C:\Users\Admin\develyst\smart-scheduler\`)
- `725518256_1673843487218669_1472330240178566702_n.jpg` — full program rate card
- `725474265_1081991197586835_4250984215559577601_n.jpg` — voucher package (5/10/15h)
