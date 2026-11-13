# REQUEST 2026-11-13 · Porter → Sector: design + size an "Activities & prices" page in the BACK OFFICE
**Owner, 2026-11-13 ~01:00: "ตามนั้น"**, on my proposal: put activity management together with prices in the back office, sized first.
The owner also corrected me: *"เลิกคิดว่าขวัญอยู่แค่หน้าบ้านได้แล้ว ขวัญก็เข้าหลังบ้านด้วย เพราะเขาคือ admin"*.
Background: your answer in REQUEST-porter-to-sector-2026-11-13-create-activities-mixed.md:
- subjects are seed-only;
- prices are hard-coded in SB `lib/sale-items.ts` as 5 PRICE_GROUPS × (1 / 4 / 6 / 10).

**What it must do (her need):**
- An admin or the CEO creates, renames and archives activities, including mixed ones such as «Surfskate & Inline Skate».
- Each activity gets a price: either it picks an existing price group, or a new group with its own 1 / 4 / 6 / 10 prices.
- The front office (SB) uses these for sales and bookings.

**Please answer:**
1. **Where prices live:** move the price card from code to DB? Which service owns it, BB or SB? How does SB read it: a sync, an API, or a shared table? Keep the VAT-inclusive rule and the voucher-excluded groups.
2. **The page:** in the back office, next to Type and Category. Who may do what: CEO prices only? Admin activities only? Recommend one.
3. **What it touches:** past sales keep their price, revenue categories, the voucher rules, coach-program ticks, and the DUO/GROUP group-kind pricing.
4. **The size in days**, which teams, and the earliest start (the back office resumes 14 Nov). Is there a smaller first step?
5. **Meanwhile:** add her mixed activities by a data change in an existing price group. What exactly does the owner run on uat? (A DATA REQUEST: bare SQL or a seed step.)

Answer under `## Answer`, then add one line to inbox/PM.md.

## Answer
**Sector (SA, Team C), 2026-11-13, read against SB `dong`, BB `e3a37de`, uat read-only. [SA-estimate] for sizes.**

### 0. First, a correction: most of her mixed activities already exist on uat
uat `subjects` (read-only, 22 rows) already holds these, all active, all price group `bike-skate`:
- «Private SURFSKATE & INLINESKATE», which is her «Surfskate & Inline Skate»;
- «Private SURFSKATE & FREESKATE»;
- «Private SURFSKATE & SKATEBOARD»;
- «Private SURFSKATE & BIKE»;
- «Private INLINE SKATE & BIKE»;
- «Private BIKE & SCOOTER».

**So she can pick «Surfskate & Inline Skate» at the sale today.** Only **«Inline & Freeskate»** is missing.

My answer in REQUEST …create-activities-mixed §1/§3 didn't list the names, and implied the mixed ones all had to be created. It was incomplete (FAILURES F-070).

### 5. Meanwhile: the one missing mixed activity (a DATA REQUEST for the owner, uat)
Bare SQL, one statement, rerunnable. The name follows the existing «Private X & Y» pattern:
```sql
INSERT INTO subjects (name, active, price_group, kind) VALUES ('Private INLINE SKATE & FREESKATE', true, 'bike-skate', 'PRIVATE') ON CONFLICT (name) DO NOTHING;
```
- **Check afterwards:** `SELECT name, price_group FROM subjects WHERE name = 'Private INLINE SKATE & FREESKATE';` → 1 row, `bike-skate`.
- **Then she ticks the coaches** who teach it, herself: Teachers → the coach → Programs (REQ-121).
- **Its revenue category is created by itself** at the first sale.
- Any other name she sends goes the same way, one line each.

### 1. Where prices live
- **Today:** the card is code in SB `lib/sale-items.ts` (`CARD`: 5 groups × 1 / 4 / 6 / 10; `VOUCHER_PRICE`; `FIRST_TRIAL_MINOR`). `sale:ensure-items` copies it into `bo.item` rows (`course-{group}-{size}`, `session-{group}`), with `price-reconcile-plan.ts` keeping them in step.
- **So the prices are already rows in the back-office DB. Only the authority is in code.**
- **Recommendation: flip the authority to the back office.**
  - A new `bo.price_group` table (key, label, voucher_allowed, active). The card = the existing `bo.item` rows per group and size, edited on the page.
  - **SB reads them directly from the shared DB.** SB already writes `bo.revenue_line`, so there's no sync and no new API.
  - `sale-items.ts` keeps its function names and rules, but its numbers come from the DB.
- **Kept:**
  - VAT-inclusive stays a named rule (the page says "ราคารวม VAT").
  - The voucher-excluded set becomes the `voucher_allowed` column (today's 4 groups = false).
  - DUO/GROUP group-kind pricing stays a code rule pointing at `balance-duo` / `balance-group`.
  - A size with no row = "not offered", as today.
- **Activities stay in `public.subjects`,** which bookings reference. **The back office writes them through one BB service** with the same checks: unique name, PRIVATE / DUO, and a price group that exists. After that, the seed is dev-only.

### 2. The page: «Activities & Prices», next to Type and Category
- **Recommendation [SA-proposed]:**
  - **Admin and CEO:** create / rename / archive an activity, picking an existing price group.
  - **CEO only:** edit prices and create a price group (money is the CEO's).
- **Rename** only while nothing has been sold on the activity. After that: archive + new, so revenue categories and reports keep their names.

### 3. What it touches
| Area | Effect |
|---|---|
| Past sales | keep their price: the amount is on the sale / revenue line at posting. A price edit affects only new sales. |
| Revenue categories | found-or-created from the activity name at the sale; no change (hence the rename rule) |
| Voucher rules | voucher price and hours stay as today; which groups a voucher may book = the new column |
| Coach-program ticks | unchanged; a new activity just appears in the list |
| DUO / GROUP pricing | unchanged rule, now reading the DB rows |
| The legacy SB price tests | re-pointed at seeded DB rows: the main BE risk (17 SB files read `sale-items`) |

### 4. Size, teams, start
- **Step 1, activities only (existing price groups), ≈ 1.5 d:** BB 0.5 + BF 1. **This alone answers her ask.**
- **Step 2, prices out of code, ≈ 3–3.5 d:**
  - SB read path + tests 1.5;
  - BB `price_group` + seed from today's card 0.5;
  - BF price editor 0.75;
  - migration / sid apply 0.25–0.5.
- **Total ≈ 4.5–5 d, Team C** (Brew BB+SB, Flash BF).
- **Earliest start 14 Nov,** when the back office resumes. Step 1 first, then step 2 after Tanya passes step 1.
- **Smaller first step:** yes, step 1.

### Questions for her / the owner, each with a default
1. Admins may create activities; only the CEO may change prices. [default: yes]
2. A new price group needs all four sizes (1 / 4 / 6 / 10); she may leave a size empty = not offered. [default: yes]
3. The voucher and 1st Trial prices go on the page too (CEO). [default: step 2, yes]

**Applied on sid (Sector, 2026-11-13; owner via Porter: "sid ไม่รันเหรอ"):**
- Host checked = 154.197.124.206; the script refuses any other host.
- **Before:** 22 subjects; the 6 mixed activities were already present (bike-skate, PRIVATE, active); «Private INLINE SKATE & FREESKATE» was missing.
- **Insert:** the same statement as §5, `ON CONFLICT DO NOTHING` → **inserted 1**.
- **After:** all 7 present, active and bike-skate · **23 subjects**.
- sid now matches what uat will have after the owner's §5 insert.
