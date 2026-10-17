# SIZING: REQ-120 SALARY (§1) + STOCK (§3) — @Sober, 2026-10-15
**For @Porter → the owner's budget / timeline talk.** Read-only. Nothing is built, no TASK is cut. **No opinion on money.**
**Sources:** `requirements/REQ-120-…` (her words win) · my `GAP-backoffice-salary-stock-2026-10-13.md` · `SURVEY-backoffice-repos-2026-10-13.md` · @Silver's `SIZING-REQ-120-revenue-frontoffice-2026-10-15.md`.

**Repos:** **BB** = backoffice-back · **BF** = backoffice-front · **SB** = scheduling back · **SF** = scheduling front.
**Units:** engineer-days. Each line is **my estimate → +10%**. Sizes: **S** ≤ 2 d · **M** 2–5 d · **L** > 5 d.
**Counted once, in Silver's file, NOT here:**
- R0.1 roles/users · R0.2 salary masking · R0.3 blind admin entry · R0.4 web notifications · R0.5 English;
- F1–F6 (incl. F3 multi-role/STAFF, F4 first coach + links, F6 a web user per coach);
- C1 bridge vs replace.

My lines **use** those mechanisms and name them as dependencies.

**Estimates come from code reading, not a spike.** They cover build + tests + mutation sets. They exclude SA verification, QA, deploys, customer UAT, data entry of her people/products, and §4 reports.

---

## 1 · Work breakdown — SALARY
| R-line | what is built | where | size | days (est → +10%) | depends on |
|---|---|---|---|---|---|
| **R1.1** types by day | a "which role does this class pay under" resolver: PT on Sat–Sun, FL on Mon–Fri, from the person's dated roles | BB | S | 1 → **1.1** | **F3** |
| **R1.2** per-person pay profile | base salary (masked: R0.2) · **FL rate per class type** (Private / Duo / Group / ECA / Camp) · merit eligible · vehicle (car / motorbike); effective-dated | data · BB · BF | M | 3.5 → **3.9** | R0.1 · R0.2 · F3 |
| **R1.3** commission eligibility | type × product-group matrix (STAFF: Skate bag only) | BB · BF | S | 1 → **1.1** | R3.1 groups |
| — **hours reader** (shared) | per person × day × class type, **Bangkok dates**, from the timetable: bookings (1 row = 1 h), DUO extra coaches, ECA/Other primary + extra coaches, camp day coaches. Feeds FL pay, Extra Hour, R1.7, R1.8 | BB (reads SB tables, same DB) | M | 2.5 → **2.8** | F3 |
| **FL teaching pay** | FL-role hours × that person's rate for the class type; each line names who was taught | BB | S | 1.5 → **1.7** | hours reader · R1.2 |
| **Extra Hour 350** | per day: weekday from the 5th teaching hour, weekend from the 6th; FT and PT (PT days only); ECA + camp included | BB | S | 1.5 → **1.7** | hours reader · F3 |
| **OT** | admin enters non-teaching hours; salary ÷ 26 ÷ 8 × 1.15 per hour | BB · BF | S | 1.5 → **1.7** | R1.2 |
| **Merit** | typed amount for eligible people; teachers' entered by Admin Poo, staff's by Khwan/ฟีน (a permission) | BB · BF | S | 1 → **1.1** | R0.1 |
| **Bonus 50 / 100** | Bonus 50: trial → course OR voucher (no time limit) → the trial's first coach (two coaches: 25 each). Bonus 100: renewal → the old course's first coach. Voucher after voucher is NOT a renewal. FT/PT, PT-day classes only. Each line carries the child's name | BB · BF (list only) | M | 3 → **3.3** | **F4** (links + first coach + "admin chooses" UI, Silver) · F3 |
| **Commission** | from SALES RECORD lines × product group: equal split between sellers · FT shares into the **FT pool**, split equally across all FT at month end (a mid-month joiner gets a full share) · PT/FL/admin keep their own · **not reduced by discount** · override to 0 (cash by ฟีน) | BB · BF | M | 3.5 → **3.9** | R3.5 · R1.3 · O12 |
| **Transportation** | schools with **editable distance** · per trip: school, one-way / round, vehicle · car 6 ฿/km min 60 · motorbike 3 ฿/km min 40 | data · BB · BF | M | 3 → **3.3** | R1.2 (vehicle) · the site list (see §3) |
| **Other ±** | amount + **required** reason | BB · BF | S | 1 → **1.1** | — |
| **R1.4 + R1.5** the pay run + cycle | period = last day of previous month … day before last day of this month · slip build / rebuild while open · states **open → confirmed, or auto-locked at 12:00 on the last day** (paid as shown) · after confirm only **blind adds** (R0.3) · a **scheduled job in BB (none exists today)** · **LINE reminders 09:00 + 11:00** through SB's LINE outbox | BB (+ SB: one job hook) · BF | **L** | 5.5 → **6.1** | R0.1 · R0.3 · F6 |
| **R1.6** the itemised slip | one page, every line in detail: Extra Hour per date ("14/10 = 6 Hr") · hours with who was taught · bonus with the child · each trip · a confirm button. The coach sees their own; the CEO sees all | BB · BF | M | 3.5 → **3.9** | R1.4 · F6 · R0.2 |
| **R0.4 use** | a notify call for every pay item type (Bonus · Commission · Transportation · OT · Other · Extra Hour) + the coach always told of their own | BB | S | 0.5 → **0.6** | **R0.4** (Silver) |
| **R1.7** daily check-in report | per day: hours cut + each coach's pay for the day | BB · BF | M | 2.5 → **2.8** | hours reader · pay lines |
| **R1.8** month-end reports | each coach's teaching summary; everyone's salary + other income | BB · BF | M | 3 → **3.3** | pay run |
| **SALARY total** | | | | **39 → 42.9** | |

## 2 · Work breakdown — STOCK
| R-line | what is built | where | size | days (est → +10%) | depends on |
|---|---|---|---|---|---|
| **R3.1** products | Model code (unique) · Product Name · category (addable; her six seeded) · commission group · price · **picture** · note. Picture needs file storage in BB (**none today**) | data · BB · BF | M | 5 → **5.5** | O12 (one group) |
| **R3.2** Stock In | product + quantity + date; no cost, no profit | BB · BF | S | 1.5 → **1.7** | R3.1 · R3.3 |
| **R3.3** sale-stock locations | several locations (one today); balance per product × location | data · BB · BF | S | 2 → **2.2** | — |
| **R3.4** Excel import / export | match by Model code: update existing, add new, **never delete history**; a dry-run preview; export; manual add is R3.1 | BB · BF | M | 3.5 → **3.9** | R3.1 · **her real sheet** |
| **R3.5** SALES RECORD | product · buyer (pick a family from SB, or type) · branch · discount ฿/% · payment (Transfer / Cash / Credit card) · remark · coaches earning commission. One save **cuts stock**, **posts revenue** (to Silver's revenue line) and **writes commission lines** | BB · BF | **L** | 6 → **6.6** | R3.1 · R3.3 · R2.2's revenue line (Silver) · F1 branch list |
| **R3.6** Stock Demo | sites STA · ABC · RIS · WA (Abbey) · KIS · Bravo (addable) · ± with history (who / when / from → to / reason) · moves site ↔ site, sale → Demo (incl. broken, with reason), Demo → sale · write-off with reason · seeded from her sheet · **no alerts** | data · BB · BF | M | 6 → **6.6** | R3.1 · R3.3 |
| **R3.7** Low Stock | every **Monday**, per location, thresholds per type (editable: F&B 10 · Safety 1 · Miller 5 · Sock 1 · Shirt 1) → web notice to subscribers | BB · BF | S | 2 → **2.2** | **R0.4** · the BB job runner (R1.5) |
| **R3.8** reports | sales history · balance · movement (sales / stock-in / moves) for a chosen period | BB · BF | M | 4 → **4.4** | R3.5 · R3.6 |
| **STOCK total** | | | | **30 → 33.1** | |

**Mine together: 69 → ≈ 76 engineer-days.** Silver's file has the foundations under them (R0 14.9 · F1–F6 · C1 3.3 or 16.5).

---

## 3 · Build order and the first usable slice
### STOCK (can start as soon as R0.1 lands; needs nothing from the front office)
1. **R3.1 products + R3.3 locations + R3.2 Stock In + R3.4 import.**
   - 🟢 **First slice she can use (≈ 13 d):** her catalogue loaded from Excel, receiving stock, and a live balance per location.
2. **R3.6 Demo.** It is independent of sales, so it can run beside step 3.
3. **R3.5 SALES RECORD:** cuts stock, posts revenue and writes commission lines. Needs Silver's revenue line (R2.2) and the branch list (F1).
4. **R3.7 Low Stock**, after R0.4 and the job runner.
5. **R3.8 reports.**

### SALARY
1. **R1.2 pay profile + the four manual lines (OT · Merit · Transportation · Other ±) + R1.4/R1.5 pay run + R1.6 slip.**
   - 🟢 **First slice she can use (≈ 21 d):** every person sees and confirms a real slip by the deadline, with base salary and the manually entered lines.
   - It needs only R0.1–R0.3 + F6. **Not F3/F4, and not Stock.**
2. **Hours reader + FL teaching pay + Extra Hour + R1.1**, after **F3** (multi-role / STAFF).
3. **Bonus 50/100**, after **F4**.
4. **Commission**, after Stock step 3 (SALES RECORD) and R1.3.
5. **Notify calls (R0.4) · R1.7 daily · R1.8 month-end.**

**Critical chain:** R0.1 → Salary step 1. Silver's F3 → F4 must land before Salary steps 2–3; Stock step 3 must land before Salary step 4.

## 4 · New tables / entities I foresee (names only, no schema)
- **Salary:**
  - `pay_profile` (per person, effective-dated) · `pay_rate` (person × class type);
  - `commission_eligibility` (type × product group);
  - `pay_period` · `payslip` (person × period, state) · `pay_line` (kind: BASE · FL_TEACHING · EXTRA_HOUR · OT · MERIT · BONUS · COMMISSION · TRANSPORT · OTHER; detail + source ref);
  - `ot_entry` · `transport_trip` · `commission_pool` (FT, per period).
- **Stock:**
  - `product` · `product_category` · `commission_group`;
  - `stock_location` (sale) · `demo_site`;
  - `stock_movement` (kinds: IN · SALE · MOVE · TO_DEMO · FROM_DEMO · WRITE_OFF · ADJUST) · `sale` · `sale_coach`;
  - `low_stock_threshold` · `import_run`.
- **Shared:**
  - a **job runner** in BB (none exists): pay-day lock, reminders, Monday Low Stock;
  - **`site`**: the schools for Transportation distances **and** the Demo sites are largely the same names (STA, ABC, RIS, WA, KIS, Bravo). **One entity could serve both.** That is a design question, not sized as a saving.

## 5 · Risks: what could make it bigger
1. **C1 (b) replace `bo.*`.** My stock is sized on NEW tables, with `bo.*` untouched. Under (b), stock likely becomes part of the replacement and must be designed together with it (Silver's 16.5 d).
2. **Hours and rates rules:**
   - Today SB stores per-session rates (DUO class rate, extra coach, ECA primary, camp day), *"stored, never posted"* (GAP §0).
   - R1.2 says a rate per person × class type. **Which wins when both exist** needs a ruling.
   - Camp coach hours per day are still with Khwan (`COPY-DRAFT-khwan-item5-camp-coach-hours-2026-10-13.md`).
   - "Timetable", not check-in, is the hours source. A cancelled or no-show class needs a rule.
3. **The pay period edge:**
   - "last day of previous month … day before last day of this month" (*"30/9-30/10"*);
   - February and 31-day months need her confirmation with examples before the run is built;
   - the 12:00 auto-lock is in Bangkok time.
4. **Bonus edge cases** (rely on F4's data being right from day one):
   - a trial long before the course ("no time limit");
   - a coach changed mid-course (admin chooses);
   - two coaches on the first class (25 each).
   - **Classes before F4 lands carry no link** ⇒ no bonus for them unless someone back-fills by hand.
5. **The FT commission pool:** "a mid-month joiner gets a full share", and leavers aren't covered. **O12** is still open for Miller helmets.
6. **No job runner and no file storage in BB today.** Both are new infrastructure; each is about a day inside the lines above, more if the server needs setup (Otto's area).
7. **LINE reminders** go through SB's LINE outbox (quota); the rest is web-only per R0.4.
8. **Her Excel sheet** must be in hand before R3.4. A messy sheet (duplicate model codes, merged cells) is the most likely overrun in Stock.
9. **BF has no tests today** (BB has 13 test files, BF 0). The front lines include setting up a test base the first time.
10. **"Everything itemised"** (R1.6) on every line means every pay line must keep its source rows. Retrofitting that later would be expensive, so it is in the design from step 1.
