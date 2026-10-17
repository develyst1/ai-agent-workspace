# NOTE: the back office (Salary · Revenue · Stock), understood and parked until the front office ENDS (@Porter, 2026-10-11)
> ⛔ **SUPERSEDED 2026-10-13 by `UNDERSTANDING-backoffice-2026-10-13.md`** (re-read from the sheet with its cell layout; this note got PT pay wrong). Kept for history.
**Owner:** *"ทำความเข้าใจ โน้ตไว้ มาคุยต่อ หลังจบงาน frontoffice"*. **Nothing here is sized, cut or built.** It is my reading, so the later talk starts from it.
**Sources:** the customer's sheet, tabs STOCK · REVENUE · SALARY (snapshot `project-docs/customer-2026-10-11-meeting/sheet-*.csv`) + the meeting summary §4–§6 (`MEETING-NOTES-2026-10-11-as-given-by-owner.md`, an AI paraphrase; "พี่ฟิล์ม" there = **ฟีน**, the CEO).
**Agreed order (meeting §6):** 2 Salary → 3 Revenue → 4 Stock → 5 the back-office Report. (1 = the Daily Report, which is Palm's.)
**Repos:** `smart-scheduler-backoffice-back` / `-front` exist (board: "finance API", "admin money UI"). **What is in them today is NOT checked yet**, and that is the first job of the later talk.

## 2 · SALARY
**Staff types:** FT (full-time) · PT (part-time) · FL (freelance) · STAFF.
| item | the rule, from her sheet | who / when |
|---|---|---|
| **Base salary** | ฟีน sets each person's base; **shown to nobody else** | FT, STAFF |
| **Extra hour** | **350 ฿/hr**: weekday from the **5th** teaching hour, weekend from the **6th** | FT |
| **OT** | per hour, a rate from the salary and the working hours (summary: *salary ÷ (26 × 8)*), **or typed by hand** | |
| **Merit** | typed by hand. Coaches every 3 months (next 11/26), Staff monthly (*"Nelson = staff (no merit)"*) | |
| **Course bonus** | **1st Trial → opens a Course/Voucher: 50 ฿** · **renews a Course: 100 ฿** (summary: to the FIRST coach of that case; "Voucher not counted", which conflicts with the sheet's "Course/ Voucher" on the 50) | |
| **Travel (fuel)** | by distance, e.g. from Bravo: **car 6 ฿/km, min 60 · motorbike 3 ฿/km, min 40**; tied to ECA or paid standalone | |
| **Sales commission** | per product: Miller surfskate/cruiser/skateboard/inline **100** · Miller/Animal helmet **40** · Royal baby **50** (Space Shark **100**) · skate bag **100** · Chinese/Decathlon **0** · *"แก้มือเป็น 0 ในกรณีพี่ฟีนจ่ายสด"*. **FT coaches POOL their commission and split it equally** (e.g. 7 coaches). **PT + FL keep their own.** Admins earn it too. | |
| **PT / FL pay** | by teaching hours, from the timetable only, + other income | |
| **Other ±** | typed by hand, with a reason | |
**Month end:** (1) each coach's teaching summary · (2) everyone's salary + other income · (3) **each coach CONFIRMS their own pay** on the web, with their own user, before payment (sheet: *"เราควรทำในเวปเพื่อให้ครูเข้ามาดู… ดีม้้ยคะ?"*) · **daily:** a check-in report (hours cut + coaches' daily pay) · **every time other income is recorded** (bonus, commission, fuel, OT, other): **notify the coach + staff + CEO**.
**Cut-off (summary):** the 1st to the day before month-end.

## 3 · REVENUE
**Types → categories:** COURSE (Inline · Surfskate · Skateboard · Bike · Balance Play · Onewheel · Freeskate · Scooter; Private / Duo / 1 HR) · **Trial** (1st time) · **Group/Camp** (Balance Camp / Birthday) · **VOUCHER** (5/10/15 packages) · **ECA** (STA, RIS, ABC, ISB, KIS) · **SALES** (Miller · Inline · Bike · Safety) · **F&B** · **RENT** (Rent All / Park fee) · **OTHER** (shirt, sock, bag) · "ระบุเอง".
**Report:** daily sales, **month-to-date and year-to-date, real time** · filters: branch (Bravo / Other) · period (daily / month / custom) · type · category · amount · remark.
🔑 **When is revenue recognised?** The summary says Dong proposed *Attended*; ฟีน and Khwan said **when it is paid and CONFIRMED**, because attendance can fall in another month. ⇒ **revenue at CONFIRM.**

## 4 · STOCK
**Stock IN (for sale):** model code · product name (*"Miller/ BABY SKATE - Seaworld"*) · category (Miller division · Inlineskate · Bike · Safety (helmet/protection) · F&B · Other: shirt/sock/bag) · price / commission · picture · note. **Import from Excel = DELETE ALL and re-create** (summary, Dong's description); or add one by one.
**Stock OUT (a sale):** who bought · **which coach(es) earn the commission** (several ⇒ split equally, which links to Salary) · price · discount · payment type (transfer / cash / credit card) · remark.
**Stock DEMO (teaching equipment, separate from sale stock):** storage at several schools (STA · ABC · RIS · WA (Abbey) · KIS · Bravo, more can be added) · +/− with a history · move between sites · a sale item can move into Demo · categories SURFSKATE · SKATEBOARD · CRUISER · ONEWHEEL · INLINESKATE · FREESKATE · BIKE · BABY SKATE · EQUIPMENT · OTHER (with her full product list in the sheet).
**Reports:** sales history · stock balance · **movement over a chosen period** · 🔔 **low-stock alert to admin + CEO every Monday**, thresholds by type (F&B 10 · Safety 1 · Miller 5 · Sock 1 · Shirt 1).

## ❓ For the later talk (not to ask now)
1. **What do the back-office repos already do?** The team reads them before anything is sized.
2. Course bonus: does a **Voucher** count for the 50 ฿ (the sheet says "Course/ Voucher", the summary says no)?
3. "Notify the coach + staff + CEO": by **LINE** (OA quota) or in the web?
4. Excel import "delete all and re-create": what happens to stock HISTORY and to sales already recorded against those items?
5. Revenue at CONFIRM: what about a refund or a cancel after confirm?
6. Who sees what (base salary is ฟีน-only; the rest?). The Authorize tab was ruled out of scope, so this is open.
7. 📌 Dong told them in the meeting that **the scope is bigger than estimated and needs a new spec, timeline and budget.** That conversation is the owner's.
