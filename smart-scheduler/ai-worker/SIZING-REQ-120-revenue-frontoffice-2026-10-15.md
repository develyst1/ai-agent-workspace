# SIZING: REQ-120 REVENUE (§2) + front-office changes F1–F6 (§5) + C1 bridge vs replace + R0 roles/users (@Silver, 2026-10-15)
**For:** the owner's resources / timeline / budget talk (Porter's brief, inbox 2026-10-15). **READ ONLY:** nothing built, no TASK cut, no opinion on money.
- **Sober sizes Salary + Stock.** Where a line here is the *mechanism* his lines use (roles, notifications, F3/F4), I size the mechanism only.
- **Facts from:**
  - `SURVEY-frontoffice-data-for-backoffice-2026-10-13.md`;
  - `GAP-backoffice-revenue-2026-10-13.md`;
  - `SURVEY-backoffice-repos-2026-10-13.md`;
  - a few counts re-run today, cited below.

**Repos:**
- **SB** = `smart-scheduler-back` (front-office back);
- **SF** = `smart-scheduler-front` (front-office front);
- **BB** / **BF** = `smart-scheduler-backoffice-back` / `-front`.

**Units:** engineer-days for ONE engineer. **"+10%"** = my estimate × 1.1, as asked. **S** ≤ 2 d · **M** 2–6 d · **L** > 6 d.
- **Included:** build + by-value tests + a mutation set per line (this desk's standard).
- **Excluded:**
  - Sober's Salary and Stock lines;
  - QA (Tanya) and the customer's UAT;
  - deploys;
  - the §4 reports (not yet specified).

## 1. Work breakdown
### R0: roles, visibility, notifications, language
| line | what is built | repos | size | est → +10% | depends on |
|---|---|---|---|---|---|
| **R0.1** Roles: CEO / admin / coach-employee, own user | BB/BF stop using the single env admin (`routes/auth.ts:11-19`, falls back to `admin/admin`) and **use SB's existing users + roles + per-user permissions** (SB `schema.ts:711-753`). That means one sign-in for both, role guards on every BB route and BF menu, and "an admin never sees pay totals or revenue". | BB · BF (+ SB: new permission keys) | **M** | 5 → **5.5** | C5 (uat env check) |
| **R0.2** Base salary CEO-only | a permission key + server-side masking (the same pattern as SB's masking keys 57/59) | BB · BF | S | 1 → **1.1** | R0.1 |
| **R0.3** Blind admin entry | an "add item to a confirmed slip" endpoint that never returns the total; a UI with no total | BB · BF | S | 1 → **1.1** | R0.1 · Sober's slip |
| **R0.4** Web notifications, per person × per type | new tables (notification, subscription per person × type) + API + a bell / unread list in BF + a "notify(type, person, payload)" call for Salary/Stock to use. **Nothing exists in BB** (the `ops` outbox is dormant). SB's LINE outbox is separate and stays for R1.5's LINE reminders. | BB · BF | **M** | 5.5 → **6.1** | R0.1 |
| **R0.5** English labels | an EN label set for the types + report columns; the whole BO in English only if the owner says so (then +1–2 d) | BF | S | 1 → **1.1** | owner's answer |
| **R0 total** | | | | 13.5 → **14.9** | |

### R2: Revenue
| line | what is built | repos | size | est → +10% | depends on |
|---|---|---|---|---|---|
| **R2.1** Types → categories (editable; Private / Duo / 1 HR under every sport) | a type/category tree + admin CRUD + a seed from her list. A mapping from SB's subjects and product codes onto it. Today there are only 5 price groups (`sale-items.ts:36-44`), and BB knows only COURSE / VOUCHER / BOOKING (`revenue-attribution.ts:96-99`). | BB · BF · data | **M** | 5 → **5.5** | — |
| **R2.2** When each kind counts | **ONE revenue-line model** (date · branch · type · category · product name · amount · payment · remark · source ref · actor), fed by: <br>• **course / voucher whole at CONFIRM** and **trial at confirm**: a new SB posting at the confirm paths (`applyConfirm` `sched:3994-4053`, `confirmCourse`; 12 confirm sites in SB) instead of at sale / day-end; <br>• **camp per child per week at confirm**: ⚠️ a camp package has **no confirm step today** (it posts at sale, `camp.service.ts:400`); the "confirm" moment must be defined; <br>• **ECA per term** (price × students × classes, at the school's pay date): a BO entry form; <br>• **Rent** from rental bookings (already posted; re-map); <br>• **Park fee / Birthday** = Other booking + F5 + a manual line; <br>• **SALES / F&B / OTHER** from Sober's SALES RECORD (I size only the receiving end); <br>• the **manual line**. | SB (posting) · BB · BF | **L** | 12 → **13.2** | R2.1 · F1 · F2 · C1 |
| **R2.3** Refund = expense in the refund month; pause changes nothing | a refund entry linked to its original line, posting an expense in the month it is entered. "Pause changes nothing" is **today's behaviour already** (nothing reverses, `GAP` R-3). | BB · BF | S–M | 2.5 → **2.8** | R2.2 |
| **R2.4** Branch + payment method on every line | the columns + filters on the BO side. **The data itself comes from F1 + F2.** | BB · BF | S | 1 → **1.1** | F1 · F2 |
| **R2.5** The report | page 1 summary by type; a click-through list (Date · Branch · Type · Category · Product Name · Amount · Payment · Remark); day / MTD / YTD / custom, **Bangkok dates** (today's P&L default is UTC, BB `item.service.ts:165-169`); filters. Replaces the month-only revenue-by-activity. | BB · BF | **M** | 6 → **6.6** | R2.2 · R2.4 · R0.1 (CEO only) |
| **R2 total** | | | | 26.5 → **29.2** | |

### F: front-office changes (SB + SF)
| line | what is built | repos | size | est → +10% | depends on |
|---|---|---|---|---|---|
| **F1** Branch at booking (default Bravo) | a branch table (seed Bravo, more addable) + a branch column on bookings, courses, vouchers, camp packages and rentals (one migration); **every create path** sets it (13 `insertBooking` callers + the course/voucher/camp/rental sales); a picker (default Bravo) in the SF booking/sale dialogs. **History backfilled = Bravo.** Today only optional badges exist (`schema.ts:940-996`). | SB · SF · data | **M** | 6.5 → **7.2** | — |
| **F2** Payment record at confirm / sale: date · amount · method | a payment table (date · amount · method · ref · actor); captured in the SF confirm / sale dialogs (booking confirm, course confirm, voucher sale, camp sale, rental paid press). **None exists today** except rental `paid_at` (`schema.ts:654-655`). Rules to settle: is a payment REQUIRED to confirm? Partial payments? | SB · SF | **L** | 8 → **8.8** | F1 (same dialogs) |
| **F3** Multi-role coaches (PT Sat–Sun + FL Mon–Fri) + STAFF | `teachers.type` (one value, `schema.ts:210`) becomes roles-by-day + a STAFF value + **effective dates** (salary needs the history). **24 code sites read the type** across 9 SB files, including the **freelance ceiling inside the booking transaction** (`lib/freelance-budget.ts`, `sched:211-440`), which would then hold only on FL days. 16 SF files show it. | SB · SF · data | **L** | 8.5 → **9.4** | — (before Salary) |
| **F4** First coach + trial → course/voucher link + course → renewal link | stored at the sale (link to the student's trial / previous course), the first coach captured at delivery (the two-coach share rule), and an **admin "choose" UI** when the coach changed mid-course. **Nothing is stored today**; renewal is only a SOM heuristic (`som-report.service.ts:100-112`). | SB · SF · data | **M** | 6 → **6.6** | — (before Salary bonuses) |
| **F5** "No Teacher" teacher for park-fee blocks | a system teacher flag, **excluded** from pay, workload (the daily report's `byTeacher`), the freelance ceiling, the coach digest and LINE. An Other booking can already carry a price and block a slot. | SB · SF | S–M | 2.5 → **2.8** | — |
| **F6** A web user for every coach | **the mechanism exists** (`users.teacher_id`, one login per coach, scoped, `own-scope.ts:66`). Build: a bulk create / invite + password set/reset flow, and the coach's "my slip" entry point. The accounts themselves are the owner's/admin's to create. | SB · SF (+ BF slip page: Sober) | S | 2 → **2.2** | R0.1 |
| **F total** | | | | 33.5 → **36.9** | |

## 2. C1: keep `bo.item` / `bo.movement` as a bridge, or replace them
**The facts (both ways):** SB writes `bo.*` directly in the same DB, at these points:
- **the freelance ceiling**, INSIDE the booking transaction (`sched:211-440`, `applyHoldMove` `:232`);
- **sale posting**: `lib/sale-post.ts`, called from course `sched:2524`, voucher `:2945`, camp `camp.service.ts:400`, rental `rental.service.ts:44`;
- **the day-end posting** (`jobs.service.ts:163-349`);
- **undo reversals** (`sched:4529`, `undo.service.ts:223`);
- **reads**: `attention.service.ts:162-164`, `getCatalogItems` `sched:2097`, and the scripts `ensure-sale-items` / `reconcile-sale-prices`.
- **Today's count:** 11 write statements across 5 SB files.
- **The `bo` migrations are owned by BB** (`schema.ts:231-233`).

| | **(a) BRIDGE: keep `bo.*`** | **(b) REPLACE `bo.*`** |
|---|---|---|
| what stays | the two tables, the identity and key conventions, the ceiling inside the booking tx, every SB write point | nothing of `bo.*`; new tables for ceiling / sales / reversals |
| what changes | add what revenue lines need beside each movement (branch · payment method · category · actor/note, which today are **never written**, BB `schema.ts:526-527`), via new columns or a side table keyed by `idempotency_key`; keep SB's copy of the schema in step; fix BB's `productKind` mapping | **every write point above moves in the same release**: the ceiling (booking tx), `sale-post.ts` + its 5 callers, the day-end posting, the 2 undo sites, the reads, both scripts, SF's freelance budget screen; + migrate (or freeze read-only) the existing `bo.movement` history; + rework the tests that pin those paths |
| **extra size, on top of §1** | **S–M: 3 → 3.3 d** | **L: 15 → 16.5 d** |
| risk | two models side by side (item-centric `bo` + revenue lines); `bo` stays BB-owned | one big coupled release across SB + BB; the ceiling sits inside the booking transaction, so a slip there breaks booking |

- 📌 **In both ways, R2.2 "at confirm" is an SB posting change.** It is counted in R2.2, not here.
- **The owner chooses.**

## 3. Totals (one engineer, +10% included)
| part | days |
|---|---|
| R0 roles / notifications / language | **14.9** |
| R2 Revenue | **29.2** |
| F1–F6 front-office changes | **36.9** |
| C1 (a) bridge **or** (b) replace | **3.3** or **16.5** |
| **Total** | **≈ 84 (a)** · **≈ 97 (b)** |

- **Not included:** Sober's Salary + Stock, QA, UAT, deploys, §4 reports.
- **With two engineers in parallel** (back + front), calendar time is shorter, but SB is ONE repo with shared hot files (`scheduler.service.ts`), so F1/F2/F3 cannot all run at once.

## 4. Build order
0. **Decisions first:**
   - C1 (a / b);
   - R0.5 (all-English?);
   - the camp "confirm" moment;
   - payment required at confirm? partial payments?
   - the go-live cut-over rule (risk 1).
1. **R0.1 roles/users + F6** (everyone can sign in to the BO with their own user), and C5 fixed (no `admin/admin`). Everything else is visible only through these.
2. **C1 path work** (a or b).
3. **F1 branch → F2 payment record** (front office). **These must land BEFORE Revenue can work:** R2.2 / R2.4 read them.
4. **R2.1 categories → R2.2 lines + confirm posting → R2.3 refunds → R2.4 → R2.5 report.**
5. **F3 multi-role/STAFF, F4 first coach + links, F5 "No Teacher".** **These must land BEFORE Sober's Salary:**
   - F3 feeds FL pay / Extra Hour / OT;
   - F4 feeds Bonus 50/100;
   - F5 keeps park fees out of pay and workload.
   - They can run in parallel with step 4 if a second engineer takes SF + the non-hot SB files.
6. **R0.4 notifications** before Salary's notices and Stock's Low Stock (Sober), **R0.2 / R0.3** with the Salary slip.

## 5. Risks
1. 🔴 **Double counting at go-live.** A course or voucher sold before go-live **already posted at SALE**; if it is confirmed after go-live, a confirm-time posting would count it **again**. We need a cut-over rule, for example "only sales after date X post at confirm". A trial attended before go-live already posted at day-end.
2. 🔴 **History cannot be restated.**
   - **No payment record exists** for any past sale, so past revenue has no method.
   - **No branch** on history: backfill = Bravo.
   - **No trial/renewal links** on history: past bonuses can only be inferred.
   - ⇒ the new reports are exact **from go-live**; before it, they are best-effort.
3. **Imports never posted** (`sched:2248`, `:2282`) and **ECA series never posted**, so past revenue is under-stated in today's `bo` (it matters only if history is migrated).
4. **Posting is best-effort today** (`void recordSale`; a failure is only logged, `sale-post.ts:112-117`), so gaps may exist in `bo.movement`. The new model should post inside the transaction or retry.
5. **F3 touches the booking transaction** (the freelance ceiling). A mistake there stops bookings, not just pay.
6. **"No Teacher" leaks** into every teacher list, report and LINE path unless it is excluded everywhere (F5's tests must walk them).
7. **Camp "at confirm" is undefined** (no confirm step exists).
8. **Four repos and two migration ledgers** (`__drizzle_migrations_scheduling` / `_bo`) are released together; a fresh DB needs BB's `0004`–`0006` before SB can sell.
9. **C5:** BB auth falls back to `admin/admin` if env is unset; until R0.1 lands, the existing BO is only as safe as uat's env (the owner is checking).
10. The estimates are from code reading, not a spike. The highest uncertainty is in **F2** (dialog count and rules) and **F3** (24 type readers + the ceiling).

## Deltas 10-16 (after the customer's D2–D6, REQ-120 §8)
- **Units:** the same as above: one engineer, my estimate + 10%.
- **D1 = bridge** (the owner), so C1 (b) drops out and the base is **≈ 84 d**.
- **Code facts re-read today:**
  - `camp_packages` has **no status or confirm column** (SB `schema.ts:1143-1165`);
  - the camp routes only sell, redeem days and mark a day (`routes/camp.ts:16-42`);
  - the sale is posted at `createPackage` (`camp.service.ts:400`).

| delta | what is built | repos | size | est → +10% |
|---|---|---|---|---|
| **D3 a separate "confirm camp" button**; camp revenue counts on that confirm date | `camp_packages.confirmed_at` / `confirmed_by` (one migration) · a `POST /camp/packages/:id/confirm` + its permission · the camp revenue posting moves from the sale to this confirm, **with D4's payment record captured in the confirm dialog** · a "Confirm camp" button + an unconfirmed / confirmed chip in SF (`CampCardModal` / `WeekRoster` / `SellCampDialog`) · by-value tests + a mutation set. 📌 **Q:** today the family's "CONFIRMED SCHEDULE" LINE message (TASK-735) goes out at the SALE. Should it now wait for this confirm? | SB · SF | **M** | 4 → **4.4** (added) |
| **D4 installments (OPTION)**: several payment records on one booking / sale | the F2 payment table allows many rows per sale · an outstanding balance (price − Σ payments) and a "paid in full" state · an "add a payment later" dialog + a payment list in SF · the revenue report shows a line paid by two methods. 📌 **Q:** with installments, does revenue still count the WHOLE amount at confirm (R2.2), or each installment on the day it is received? | SB · SF · BB/BF (report) | **M** | 5 → **5.5** (option) |
| **D2 English only** | ➖ **no shrink:** my R0.5 (1.1 d) sized English labels only; no Thai/bilingual work was in the 84 d | — | — | **0** |
| **D6 no bonus back-fill** | ➖ **F4 loses its history back-fill** (the heuristic linking past trials to courses and past courses to renewals) | — | — | **−1.1** |

**New totals:**
- **without installments:** 84 + 4.4 − 1.1 ≈ **87 d**;
- **with the installment option:** ≈ **93 d**.
- Still excluded: Sober's Salary/Stock, QA, UAT, deploys, §4.

**Risk changes:**
- risk 1 (double counting) is settled by D5's cut-over (revenue starts on day 1 of the go-live month);
- risk 2 is narrower (no revenue import, D5; no bonus history, D6);
- risk 7 (camp "at confirm" undefined) is settled by D3.
