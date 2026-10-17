# GAP — the back office, SALARY + STOCK: what the customer wants vs what the code does today — @Sober, 2026-10-13
**For @Porter → the owner.** Read-only. One row per item of `UNDERSTANDING-backoffice-2026-10-13.md` §1.3 (S-1…S-19), SALARY's REQUIREMENT 1–5, §3.3 (K-1…K-11) and the STOCK report lines. **REVENUE is @Silver's** (not here). **No opinion on keep / rebuild, no sizing.**
**Status words:** **exists** (does it today) · **partial** (some of it, or a piece to build on) · **missing** (nothing) · **contradicts** (today's code does it differently from what she wants) · *dormant* = code that exists but is switched off (unmounted route / table absent from the DB).
**Repos (logical names):** **BO-back** = `smart-scheduler-backoffice-back` · **BO-front** = `…-backoffice-front` · **SCH** = `smart-scheduler-back` (scheduling). Background: `SURVEY-backoffice-repos-2026-10-13.md` (mine) · `SURVEY-frontoffice-data-for-backoffice-2026-10-13.md` (Silver).

## 0 · The shape, before the rows
- **No pay is computed anywhere today.** SCH stores coaches' per-session **rates** but never turns them into pay: DUO class rate *"STORED, never posted"* (`SCH db/schema.ts:338-339`) · an extra coach's rate *"Stored, never posted"* (`:622-623`) · the OTHER/ECA primary coach's rate (`:538`) with `ratePostedAt` *"reserved and null this stage"* (`SCH db/mappers.ts:253`) · camp day rate (`:1243`). A search of SCH `src/` for commission / merit / bonus / fuel / overtime finds **nothing**.
- **The only pay-shaped money in use:** the **freelance coach's monthly CEILING** — a `bo.item` per freelance teacher, its unit price = the hourly rate, drawn per confirmed hour inside the booking transaction (`SCH services/scheduler.service.ts:206-277`; `SCH lib/ops-client.ts:9-12`). It is a **budget limit**, not a payslip.
- **BO-back's payroll model is DORMANT:** `ops.price_rules` (HOURLY / FIXED / PERCENTAGE / CAP, `BO-back db/schema.ts:49-54, 278`) · `ops.recurring_costs` (effective-dated salary, `:309-330`) · `ops.settlement_runs` (DRAFT / FINAL / VOID, `:55, 344`) · `ops.settlement_lines` (LABOR / COMMISSION / TRAVEL / EXPENSE / OTHER, `:56-62, 365`) — **tables absent from the shared DB, routes unmounted** (`BO-back routes/api.ts:5-11`). BO-front: `/payroll` is a placeholder (`(admin)/payroll/page.tsx:4-11`); `/ftpt-salary` calls a dormant route.
- **Stock's live base is the universal `bo` model:** `bo.item` (`remaining_qty`, `ceiling_qty`, `unit_price_minor`, `external_ref`, `metadata`) + signed `bo.movement` + tags (`BO-back db/schema.ts:481-589`), edited on BO-front `/items`. **A dormant `ops` stock model** also exists: `catalog_items` (SKU, reorder level), `stock_balances` (quantity on hand), `stock_movements` (`:119-197`); BO-front `/inventory` is a placeholder.
- **The owner, 2026-10-13:** both back-office apps run on sid and uat and **nobody uses them**.

## 1 · SALARY
| id | she wants | today | where | what would have to change |
|---|---|---|---|---|
| **S-1** | FT: base salary · extra hour · OT · merit · commission (pooled) · bonus · fuel · other ± | **missing** (only dormant structures) | FT exists as a type (`SCH db/schema.ts:36-39, 210`); salary only in dormant `ops.recurring_costs` (`BO-back :309-330`) | data: a salary per person + every pay component as its own line; logic: a monthly pay run; screens: per-person payslip |
| **S-2** | PT: salary + other (which FT items apply is open) | **missing** | PT type exists (`SCH :37-39`); no PT pay anywhere | same as S-1, once the PT component list is ruled |
| **S-3** | FL: by teaching hours from the timetable only + other | **partial** | hours = booking rows (1 row = 1 h, Silver §); the hourly rate = the ceiling item's unit price (`SCH scheduler.service.ts:206-208`; `ops-client.ts:9`); per-session rates on DUO / extra coach / OTHER / camp are **stored, never posted** (`SCH schema.ts:339, 538, 623, 1243`; `mappers.ts:253`) | logic: hours × the right rate per row type, for a month; data: ONE rule for which rate wins (person / course type / per-session) |
| **S-4** | STAFF: salary + merit; one person STAFF **and** FL (Nelson) | **missing** · **contradicts** | `teacher_type` = FULL_TIME / PART_TIME / FREELANCE, **one per teacher, no STAFF** (`SCH schema.ts:36-39, 210`); admins are `users` with no pay (`SCH schema.ts:878`) | data: a STAFF kind and **more than one pay role per person** (or a person ≠ coach split); a staff member is not a teacher today |
| **S-5** | Bonus 50 when a trial turns into a course (voucher?: 🔴 conflict) | **missing** | no trial → course link stored (Silver §: ❌) | data: record the conversion (trial booking → course/voucher, date); logic: the bonus rule, once S-5 is ruled |
| **S-6** | Bonus to the FIRST coach of the case / old course, FT+PT | **missing** · first coach **derivable only** | first coach = earliest delivered row; a reassignment overwrites it in place, no history (Silver §) | data: freeze "first coach" on the case/course at the moment it is decided |
| **S-7** | Fuel: car 6 ฿/km min 60 · motorbike 3 ฿/km min 40 · one way / return · tied to an ECA or standalone | **missing** | no place / distance / fuel anywhere (Silver §: ❌); ECA rows exist (`SCH otherSeriesKey :534`) | data: a fuel claim (person, km or route, vehicle, one-way/return, optional ECA link); logic: max(km × rate, minimum) |
| **S-8** | Fuel: who | **missing** | — | rule first (FT only / anyone) |
| **S-9** | Extra hour 350: weekday from the 5th h, weekend from the 6th h | **missing** · hours **exist** | hourly rows per coach per day (Silver §); camp hours per coach (`SCH camp_week_day_teachers :1236-1245`); ECA extra coaches (`:612-623`) | logic: per coach per day, teaching hours − threshold, × 350; rule which hours count (camp? ECA?) and timetable vs check-in |
| **S-10** | OT = salary ÷ (26 × 8) per h, or a typed amount; OT hours typed by the team | **missing** | — | data: OT hours entry per person; logic: the formula (once พี่ฟีน gives it) or a manual amount |
| **S-11** | Merit: coaches every 3 months, staff monthly, typed by hand | **missing** | — | data: a manual pay line with a period; nothing computed |
| **S-12** | Commission: FT pooled ÷ all FT coaches at month end; PT/FL keep their own; admins earn it | **missing** (*dormant* line kind COMMISSION) | `ops.settlement_lines` kind COMMISSION (`BO-back :56-62`) — dormant; no product sales recorded anywhere (see K-rows) | data: each product sale's commission + the coaches credited; logic: month-end pool split for FT, own for PT/FL/admin |
| **S-13** | Commission rate per product; set to 0 by hand when พี่ฟีน pays cash | **missing** | no product with a commission field (live `bo.item` has none, `BO-back :481-507`) | data: a commission amount on the product + a per-sale override to 0 |
| **S-14** | Other ±, typed with a reason, anyone | **missing** (*dormant* line kind OTHER) | `ops.settlement_lines` OTHER (`BO-back :56-62`) — dormant | data: a manual pay line (person, amount ±, reason, month) |
| **S-15** | Pay period: monthly (cut-off 🔴 to confirm) | **missing** · *dormant* month model | `ops.recurring_costs` effective-from/to by month (`BO-back :325-327`); `BO-back lib/month` helpers | logic: one closing rule for the month, once ruled |
| **S-16** | Each person confirms their pay on the web, own user, by a deadline | **partial** (logins) · **missing** (pay view) | coach web logins exist: `users.teacher_id` (`SCH schema.ts:878`); BO-front has ONE shared admin login, no per-person users (`BO-back routes/auth.ts:11-14`) | data: a payslip per person per month with a state (draft → confirmed / disputed); screens: the person's own payslip + confirm; a login per person in whichever app shows it |
| **S-17** | Notify coach + staff + CEO on every other-income item | **partial** (channel exists) | LINE outbox to teachers and admins exists in SCH (`notifyAdmins`, teacher pushes); BO has none | logic: a message per pay item, once LINE vs web is ruled (quota) |
| **S-18** | Daily check-in report: hours cut + each coach's pay for the day | **partial** | Palm's daily report counts per day and per teacher (`SCH lib/daily-report.ts:62` `countDaily(…, { teacherId })`, TASK-737); check-ins carry channel + actor, **no time** (`SCH schema.ts:548-552`; Silver §) | logic: add the day's pay per coach (needs S-3 / S-9 rates); data: a check-in time if "when" matters |
| **S-19** | Base salary seen ONLY by พี่ฟีน; everything else open | **missing** · **contradicts** | BO has one shared admin login, `user.role` read nowhere (`BO-front lib/auth.ts`; agent §); SCH has roles/grants (`SCH lib/permissions.ts`) but no pay | data + logic: a visibility rule for salary fields (per person, not per screen) |

### SALARY — REQUIREMENT 1–5
| # | she wants | today | where | what would have to change |
|---|---|---|---|---|
| R1 | monthly teaching summary per coach | **partial** | hourly rows + camp hours per coach exist (S-3, S-9); the weekly LINE schedule per coach (`SCH lib/weekly-digest.ts`) is a schedule, not a summary | logic: a month summary per coach (hours by type, from the timetable) |
| R2 | monthly salary + other income of every employee | **missing** | nothing computes pay (§0) | the whole pay run (S-1…S-15) |
| R3 | each coach confirms their pay on the web within a deadline | **partial** / **missing** | = S-16 | = S-16 |
| R4 | daily check-in report: hours cut + daily coach pay | **partial** | = S-18 | = S-18 |
| R5 | every other-income item notified to coach + staff + CEO | **partial** | = S-17 | = S-17 |

## 2 · STOCK
| id | she wants | today | where | what would have to change |
|---|---|---|---|---|
| **IN** | a product: model code · name · category · price / commission · picture · note | **partial** | live `bo.item`: name, unit, unit price, `external_ref` (a code), `metadata`, tags for categories (`BO-back :481-507, 536-559`); BO-front `/items` create/edit (agent §1); *dormant* `ops.catalog_items` has SKU + reorder level (`:119-151`) | data: model code as a real unique field, commission, picture, category as a fixed field or tag; screens: a product form with those |
| **K-1** | receiving quantity (+date, cost?, supplier?) | **partial** | `bo.movement` signed qty + value + reason (`BO-back :509-527`), via `POST /bo/items/:id/movements` (`BO-back routes/bo.ts:42`); no cost price, no supplier (live or dormant) | data: a "received" movement with date (+ cost / supplier if wanted) |
| **K-2** | Excel import ("delete all & re-create") | **missing** | no import in BO-back or BO-front (no xlsx/csv reader in `src/`) | logic: an import that UPDATES by model code and never deletes a product with history |
| **K-3** | where sale stock lives (one store or per site) | **missing** | live `bo.item` has no location; *dormant* `ops.stock_balances` is per item only (`:157-167`) | data: a location per stock line if per-site is ruled |
| **K-4** | categories (STOCK IN vs REVENUE lists) | **partial** | tags can hold categories (`bo.tag_group` / `tag_value`, `:536-552`) | data: the agreed category list, mapped to revenue types |
| **K-5** | commission per product (or per family) | **missing** | = S-13 | = S-13 |
| **K-6** | several coaches on a sale ⇒ split equally (meets the FT pool) | **missing** | no sale record with coaches | data: the coaches on a sale; logic: equal split, then S-12's pool |
| **OUT / K-7** | a sale: who bought · coaches · price · discount · payment type · remark | **partial** | a movement can carry qty, value, reason, `ref_type`/`ref_id`, `actor`/`note` (**never written**, `item.service.ts:138-151`); no buyer, no payment type, no coach list | data: a sale record (buyer = family link or text, payment type, coaches, discount, remark) writing an OUT movement |
| **K-8** | discount (amount or %?) and whether commission shrinks | **partial** | SCH already posts discounts as negative movements `reason 'DISCOUNT'` for courses (`BO-back drizzle/0006…sql:3`; `SCH lib/sale-post.ts:63`) — not for products | logic: a product-sale discount, once amount/% and its effect on commission are ruled |
| **K-9** | move a sale item into Demo (and back? write-off?) | **missing** | no Demo concept, no transfer | data: a transfer movement between two locations (out of one, into the other, one record) |
| **DEMO** | demo stock per school (STA · ABC · RIS · WA · KIS · Bravo, addable), ± with history, report by period, editable items/categories | **missing** | no location anywhere (live or dormant) | data: sites, demo items, movements per site; screens: site stock, move A → B, history |
| **K-10** | low-stock alert every Monday to admin + CEO, thresholds per type (F&B 10 · Safety 1 · Miller 5 · Sock 1 · Shirt 1) | **missing** · *dormant* field | *dormant* `ops.catalog_items.reorder_level` (`:136`); `bo.item.ceiling_qty` is the freelance ceiling, not a reorder level; no scheduled job in BO-back | data: a threshold per category; logic: a weekly job; message channel once LINE vs web is ruled (X-2) |
| **K-11** | demo items + categories editable, her list as seed | **partial** | `/items` + tags are editable (BO-front) | seed data from `sheet-STOCK.csv`, once the demo model exists |

### STOCK — the REPORT lines
| # | she wants | today | where | what would have to change |
|---|---|---|---|---|
| RP-1 | sales history | **partial** | `GET /bo/items/:id/movements` per item (`BO-back routes/bo.ts:45`) | a sales list across products, by period, with buyer/payment (needs the sale record) |
| RP-2 | stock balance | **partial** | `bo.item.remaining_qty` (`:481-507`) — one number per item, no location | balance per product (per site if K-3) |
| RP-3 | low-stock alert | **missing** | = K-10 | = K-10 |
| RP-4 | movement report / total balance over a chosen period (sales, restocks, moves, balance) | **partial** | movements carry `created_at` and `reason` (`:509-527`); no period report endpoint for stock (the live reports are P&L, revenue, customer spend — `routes/bo.ts:62-69`) | logic: a period report grouped by movement kind |

## 3 · Cross-cutting facts that touch both (no ruling)
- **People and logins:** coaches have web logins in the SCHEDULING app (`users.teacher_id`, `SCH schema.ts:878`); the BACK OFFICE has **one shared admin login** with `admin`/`admin` as the fallback (`BO-back routes/auth.ts:13-14`). Any "each person sees their own pay" needs per-person logins in whichever app shows it.
- **The SCH ↔ BO coupling** (my survey §3): SCH writes `bo.item` / `bo.movement` directly in the same DB (ceilings, every sale, reversals). A stock or pay model that reuses or replaces those tables changes SCH with it.
- **Two pay-adjacent numbers already exist and differ in kind:** the freelance **ceiling** (a budget limit, live) and the per-session **rates** (stored, never posted). Neither is a payslip.

## 4 · Counts
- **SALARY (19 + 5):** exists 0 · partial 8 (S-3, S-16, S-17, S-18, R1, R3, R4, R5) · missing 14 · contradicts 2 (S-4 one type per person / no STAFF; S-19 no per-person visibility) — some rows carry two words.
- **STOCK (11 + IN/OUT/DEMO + 4 report lines):** exists 0 · partial 10 · missing 9 · contradicts 0.
**Nothing in either area works end-to-end today**; the pieces that exist are the data underneath (hours, rates, coach logins, the universal item + movement model, tags) and the dormant `ops` payroll/stock model.
