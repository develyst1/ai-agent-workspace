# UNDERSTANDING: the back office (Salary · Revenue · Stock), read from the sheet and the 10-11 meeting (@Porter, 2026-10-13)
**Owner, 2026-10-13:** *"เรื่องหลังบ้าน ฉันว่าเราต้องแก้ รื้อ ทั้งระบบใหม่ เพราะงั้นเราจะทำ specก่อน ทำrequirement ให้ชัด ก่อน ขอ prove ลูกค้าก่อนเริ่มทำ เก็บทุก detail มากที่สุด แล้วทำโดยไม่ต้องมารื้ออีก เพราะงั้นนายต้องเข้าใจสรุป ประชุมวันนั้น และ excel ให้ชัดเจน"* · *"เราเปิด excel คุยกัน มีสาม sheet STOCK REVENUE SALARY"*.

**What this file is:** my reading of the customer's two sources, line by line. Where the two agree, where they disagree, and where neither says. **It is NOT the spec.** The order is:
1. this understanding;
2. the owner corrects it;
3. a question set goes to the customer;
4. the spec;
5. the customer proves it;
6. build.

Supersedes `NOTE-backoffice-salary-revenue-stock-2026-10-11.md`, which was read from the mashed CSV and got one fact wrong (PT pay, see S-2).

## 0. The sources and how much weight each carries
| # | source | where | weight |
|---|---|---|---|
| A | **The customer's sheet** "Status Update", tabs **SALARY · REVENUE · STOCK** | live: the owner's link (gid 1192076361 = REPORT; SALARY 687112468 · REVENUE 2133558915 · STOCK 885873134). Snapshots: `project-docs/customer-2026-10-11-meeting/sheet-STOCK.csv`, `sheet-REVENUE.csv`, **`sheet-SALARY-2026-10-13-cell-layout.csv`** (re-exported 10-13 with the cell grid; the 10-11 SALARY file merged cells and hid which column says what). Content re-checked 10-13: unchanged. | **Her words.** Highest. |
| B | **The meeting summary** `meet-20261011.md` in repo `smart-scheduler-requirement` (NotebookLM, from `1011.MP3`) | same text as `project-docs/customer-2026-10-11-meeting/MEETING-NOTES-2026-10-11-as-given-by-owner.md`, except พี่ฟิล์ม → **พี่ฟีน** (verified by a normalised diff, 10-13) | **A machine's paraphrase of the talk.** It reads like a transcript but is a summary. Where it adds detail the sheet lacks, it is a lead to confirm, not a ruling. |
| C | The original contract | `smart-scheduler-requirement/propasal.md`, `start_phase.md` | **Option C, 73,000 ฿**: the schedule + *"ระบบจัดการสต๊อกสินค้าหน้าร้านอย่างง่าย (เช่น สต๊อกน้ำดื่ม, อุปกรณ์การเรียน)"*. Salary and Revenue as now described are **beyond it** (B §6: Dong said a new spec, timeline and budget are needed). **That conversation is the owner's.** |

People: **พี่ฟีน** = the CEO (sets base salaries) · **Khwan** = admin lead · **Dong** = the owner · **Palm** = front-office reports.
**Agreed order (B §6):**
1. Daily Report (✅ done 10-13);
2. **Salary**;
3. **Revenue**;
4. **Stock**;
5. **back-office Report**.

---

## 1. SALARY: "เงินเดือน = เงินออก" (pay = money going out)

### 1.1 The sheet, as a grid (row by row; the column tells WHO)
The header row reads **A = FT (FULL-TIME) · B = PT (PART-TIME) · C = FL (FREELANCE) · D = STAFF**. Column E/F are notes; column M is a list of reports.

| row | A (FT) | C (FL) | D (STAFF) | E/F (notes) |
|---|---|---|---|---|
| 2 | *(header)* | | | **"\*\*\*Nelson = staff (no merit) + FL วันธรรมดา"** |
| 3 | **"อื่นๆ : ระบุเอง และเหตุผล เพิ่มหรือหัก"** | | | |
| 4 | **"เงินความประพฤติ (Merit) - ระบุเอง"** | | **"เงินความประพฤติ (Merit) - ระบุเอง"** | **"ครู - ทุก 3 ด. ครั้งต่อไป 11/26 · Staff - ทุกๆด."** |
| 5 | **"ค่าคอม (ขายสินค้า)\*"** | | | **"คิดจากชม.การสอน โดยคำนวณจากตารางสอนของครู"** |
| 6 | **"เงินเดือนครูแต่ละคน พี่ฟีนเป็นคนระบุฐานเงินเดือน และจะไม่โชว์ให้ใครเห็น"** | **"เงินตามรายชั่วโมงสอน"** | **"เงินเดือน"** | **E "FT + PT" → F "เงินเดือน + อื่นๆ (รายได้อื่นๆ)"** |
| 7 | **"Extra hour = 350 (วันธรรมดา ได้ชม.ที่ 5, วันเสาร์อาทิตย์ ได้ชม.ที่ 6)"** | | | **E "FL" → F "คิดงานตารางสอนเท่านั้น + อื่นๆ (รายได้อื่นๆ)"** |
| 8 | **"OT : ระบุต่อชม.โดยคำนวนอัตราส่วนจากชม.ทำงานและเงินเดือน / ระบุเองได้"** | | | **E "หลังจากเซ็ตโอทีเป็นคิวรายชม.แล้ว ทีมงานจะระบุคิวว่าได้กี่ชม."** · **I "พี่ฟีนต้องมาลงสูตร"** |
| 9 | **"BONUS\*\*"** | | | **E "ผูกกับชม.เรียนของครู FT+PT หลังจบคลาส ถ้านร.คนเดิม ลงคลาสต่อ"** |
| 10 | **"ค่าน้ำมัน ผูกกับ ECA / ไม่ผูก โดยจ่ายโดดๆ ระบุเอง"** | | | **E "รถยนตร์ กก.ละ 6 บ. / 60 ขั้นต่ำ · รถมอเตอร์ไซด์ กก.ละ 3 บ. 40 ขั้นต่ำ · โดยคำนวณจากระยะทาง เช่น จาก Bravo ไป ... และไปกลับ/ ไปขาเดียว · สูตรคำนวณ กก \* ประเภทรถ (3 บ. หรือ 6 บ.)"** |
- **Column B (PT) is EMPTY** in the grid. PT appears only in E6 (*"FT + PT" → salary + other*) and E9 (bonus *"FT+PT"*).
- **Remarks block:**
  - **\*Commission (product sales):**
    - Miller Surfskate / Cruiser / Skateboard / Inline-skate **100**;
    - Miller / Animal Helmet **40**;
    - Royal baby, standard **50**;
    - Royal baby space shark **100**;
    - Skate bag **100**.
    - *"สำหรับทุกคนรวมถึงแอดมินด้วย"* · *"\*\*\*แก้มือเป็น 0 ในกรณีพี่ฟีนจ่ายสด"* · *"-สินค้าจีน / decathlon - no com-"*.
    - *"ครู FT จะได้ค่าคอมรวม เอายอดขายทั้งหมด หารจำนวนครูทั้งหมด เช่น ตอนนี้มีครูอยู่ 7"* · *"ครู PT + FL ค่าคอมจะแยกของใครของมัน"*.
  - **\*\*Bonus:** *"1. จบ 1st Trial แล้วเปิด Course/ Voucher **50**"* · *"2. ต่อ Course **100**"*.
- **REQUIREMENT / WHEN / NOTE:**
  1. **monthly** (*ทุกสิ้นด.*): a teaching summary per coach;
  2. **monthly**: salary + other income of every employee;
  3. **monthly**: notify each coach to confirm their pay. Note: *"มีรายงาน : รายรับทั้งหมด เพื่อให้ครูเข้ามาตรวจสอบและคอนเฟิร์ม - ภายในเวลาที่กำหนด"* + *"เราควรทำในเวปเพื่อให้ครูเข้ามาดูโดยใช้ user ของแต่ละคน ดีม้้ยคะ?"*;
  4. **daily** (*รายวัน*): *"รายงานการเชคอิน (การตัดชม.สอน + การจ่ายเงินรายวันครู)"*;
  5. **every amount** (*ทุกยอด*): *"รายรับอื่นๆของครู ให้แจ้งครู + staff + CEO"*, i.e. *"Bonus ค่าคอม ค่าน้ำมัน OT ค่าอื่นๆที่ระบุเอง"*.
- **Column M, "รายงาน/ report":** สต้อก · เข้าเรียน · คอร์สแยกประเภท · เงินครู · ทะเบียนนักเรียน · ลิ้งเงินเดือนครู + ค่าสอน. This is **priority 5, the back-office reports**.

### 1.2 What the meeting adds (B §5.2–5.3)
- **Four staff types:** Full-time, Part-time, Staff, Freelance.
- **Base salary:** set by พี่ฟีน, **seen only by พี่ฟีน's user**.
- **Extra hour 350 ฿/hr:** weekday from the 5th teaching hour, weekend from the 6th.
- **OT:** rate = **salary ÷ (26 × 8)** per hour, or a manual amount.
- **Merit:** every 3 months.
- **Course bonus:**
  - 1st Trial → open a course = **50 ฿, to the FIRST coach who taught that case**;
  - course → renew = **100 ฿, to the first coach of the old course**;
  - **"Voucher ไม่นำมาคิดโบนัส"**.
- **Fuel:** by distance, car 6 ฿/km, motorbike 3 ฿/km, *"(ขั้นต่ำ 40 บาท)"*.
- **FT commission:** pooled and split equally among **all FT coaches**, **at month end**.
- **Month-end confirm:** *"ตัดยอดวันที่ 1 ถึง วันก่อนวันสิ้นเดือน 1 วัน"*. Each person confirms their numbers in their own account before payment.
- **Notification** to coach, staff and CEO whenever other income (bonus, OT, fuel, commission) is recorded.

### 1.3 Salary: agree / conflict / gap
| id | topic | sheet (A) | meeting (B) | status |
|---|---|---|---|---|
| S-1 | Who gets what, FT | base salary, extra hour, OT, merit, commission (pooled), bonus, fuel, other ± | same | ✅ agree |
| **S-2** | **PT pay** | E6: **"FT + PT" → "เงินเดือน + อื่นๆ"** (a SALARY + other). Column B is empty. | not said | ⚠️ **My 10-11 note said "PT/FL by teaching hours"; that was wrong for PT.** Which of FT's items apply to PT (extra hour? OT? merit?) is not said. **GAP** |
| S-3 | FL pay | C6 "เงินตามรายชั่วโมงสอน" · E7 "คิดงานตารางสอนเท่านั้น + อื่นๆ" | not said | ✅ by teaching hours **from the timetable only** + other income. The **hourly rate per FL** (one rate? per course type? per person?) is a **GAP** |
| S-4 | STAFF pay | D: merit + salary · Nelson: staff, no merit, **+ FL on weekdays** | "Staff" | ✅ salary + merit (monthly). **One person can be STAFF and FL at once** (Nelson). **GAP:** how is his FL work recorded? |
| **S-5** | **Bonus: does a Voucher count?** | **"จบ 1st Trial แล้วเปิด Course/ Voucher 50"** | **"Voucher ไม่นำมาคิดโบนัส"** | 🔴 **CONFLICT.** Possible reading: a trial → voucher pays 50 (sheet), but buying another voucher is not a "renew" (meeting). Must ask. |
| S-6 | Bonus: who | E9: tied to **FT+PT** teaching hours, *"ถ้านร.คนเดิม ลงคลาสต่อ"* | to the **first coach** of the case / old course | ✅ compatible: the first coach, **if FT or PT** (FL gets none?) → confirm. **GAP:** "first coach" when the first class had 2 coaches? |
| **S-7** | **Fuel minimum** | **car min 60 · motorbike min 40** | "(ขั้นต่ำ 40 บาท)" only | ⚠️ the sheet is fuller → **car 60 / motorbike 40**. GAP: one way vs round trip is chosen per trip? Distance typed or looked up? "ผูกกับ ECA / ไม่ผูก" = attached to an ECA session or a standalone item. |
| S-8 | Fuel: who | row A (FT) | not said | GAP: FT only, or anyone who drives? |
| S-9 | Extra hour | FT column, 350, weekday ≥5th hr, weekend ≥6th hr | same | ✅. GAP: counted **per day**? From the timetable or check-ins? Does camp/ECA time count as teaching hours? |
| **S-10** | **OT formula** | *"ระบุต่อชม.โดยคำนวนอัตราส่วนจากชม.ทำงานและเงินเดือน / ระบุเองได้"* + **"พี่ฟีนต้องมาลงสูตร"** | **salary ÷ (26 × 8)** | ⚠️ the sheet says the formula is **still to be given by พี่ฟีน**; the meeting gives one. Confirm 26 × 8. OT **hours** are typed by the team (E8). OT vs Extra hour: what is the difference (OT = non-teaching work?) → **GAP** |
| S-11 | Merit | coaches every 3 months (next 11/26), staff monthly; Nelson none; **typed by hand** | every 3 months | ✅ the sheet is fuller. A manual amount, on a schedule. |
| **S-12** | **Commission pool** | FT: *"เอายอดขายทั้งหมด หารจำนวนครูทั้งหมด เช่น … 7"*. PT/FL keep their own. **Admins earn it too.** | FT pooled, split among all FT at month end | ✅ agree. **GAP:** an FT sale with 2 coaches, one FT and one PT: what goes to the pool? Do admins (staff) pool or keep their own? Does a new FT mid-month get a full share? |
| S-13 | Commission rates | per product (100/40/50/100/100, Chinese/Decathlon 0); **set to 0 by hand when พี่ฟีน pays cash** | — | ✅. Rates live on the product (STOCK IN *"Price / ค่าคอม"*). |
| S-14 | Other ± | *"ระบุเอง และเหตุผล เพิ่มหรือหัก"* | — | ✅ any person, an amount with a reason, plus or minus. |
| **S-15** | **Pay period** | *"ทุกสิ้นด."* | **"ตัดยอดวันที่ 1 ถึง วันก่อนวันสิ้นเดือน 1 วัน"** | 🔴 the meeting's cut-off (1st to the day before the last day) leaves the last day of each month in no period. **Must confirm.** |
| S-16 | Confirm by each person | on the web, own user, within a deadline | same | ✅. **GAP:** coaches need **web accounts** (today coaches use LINE). What if a coach disputes or doesn't confirm by the deadline? Who can change a confirmed slip? |
| S-17 | Notify on every other-income item | coach + staff + CEO | same | ✅. **GAP:** by **LINE** (OA message quota, cost) or in-web? Does "staff" mean all admins? |
| S-18 | Daily check-in report | *"การตัดชม.สอน + การจ่ายเงินรายวันครู"* | — | ✅ a daily report: hours cut + each coach's pay for the day. |
| S-19 | Who sees what | base salary: พี่ฟีน only | same | **GAP:** everything else (other coaches' pay, commission, admins' view). Authorize tab was ruled out (owner 10-11), so this is open. |

---

## 2. REVENUE: types and categories

### 2.1 The sheet (TYPE · CATEGORY · note)
- **COURSE**: Inline Skate · Surfskate · Skateboard · Bike · Balance Play · Onewheel · Freeskate · Scooter. Note on the first row: **"Private / Duo / 1 HR"**.
- **COURSE** also: **Trial** (*"1st time"*) · **Group / Camp** (*"Balance Camp/ Birthday"*).
- **VOUCHER**: Voucher, *"5 / 10 / 15 package"*.
- **ECA**: ECA, *"STA, RIS, ABC, ISB, KIS"*.
- **SALES (Product)**: Miller · Inline · Bike · Safety: Protection pad / Helmet.
- **F&B**: F&B.
- **RENT**: Rental, *"Rent All / Park fee"*.
- **OTHER**: OTHER, *"Shirt, Sock, Bag"*.
- **ระบุเอง**: ระบุเอง.
- **REPORT:**
  - *"สรุปยอดขายรายวัน, Month to date & Year to date (accumulate real-time)"*;
  - **Branch** *"Bravo/ Other"* · **Period** *"Daily/ Month/ ระบุเองได้"*;
  - columns **Type · Category · Amount · Remark**.

### 2.2 The meeting (B §5.1)
- Categories as above.
- 🔑 **Revenue is recognised at CONFIRM**, when the customer has paid and the class is confirmed, **not at Attended**. Dong proposed Attended; ฟีน and Khwan said no, because attendance can fall in another month.

### 2.3 Revenue: agree / conflict / gap
| id | topic | status |
|---|---|---|
| R-1 | Categories | ✅ her list. **GAP:** "Private / Duo / 1 HR": a sub-level under each course category, or only under Inline Skate? |
| **R-2** | **When a course's revenue counts** | ✅ **at confirm (= paid)**. **GAP:** a course is paid once for many classes. Is the WHOLE course price revenue on the day it is confirmed, or per class as each is confirmed? Same for a **voucher** (5/10/15): on sale, or per session? |
| R-3 | Refunds / cancel after confirm / a paused course | **GAP**, not mentioned. Today a paused course is stored as CANCELLED (Silver, 10-13). Does revenue reverse? |
| **R-4** | **Branch "Bravo / Other"** | 🔴 **GAP with the system:** the front office has **no branch**; it uses badges (WF-012). REQ-021 (07-31): *"Revenue-by-branch is impossible today"*. Where does the branch come from? |
| R-5 | ECA revenue | **GAP:** how is a school billed (per term / per class / a contract)? Typed by hand? |
| R-6 | Group / Camp, Birthday | **GAP:** camp revenue per child per week at booking confirm? Birthday: is it booked in the system today? |
| R-7 | SALES / F&B / OTHER | ✅ come from **Stock OUT** (a sale). **GAP:** do they flow to revenue automatically, net of discount? |
| R-8 | RENT ("Rent All / Park fee") | **GAP:** not in the front office. The "Rent + Schedule" tab was ruled out (owner 10-11). So it is typed by hand? |
| R-9 | "ระบุเอง" | ✅ manual revenue line: type + category + amount + remark. |
| R-10 | Report | ✅ daily, MTD, YTD, real-time; filters branch / period / type / category; columns amount + remark. **GAP:** who sees revenue? |
| R-11 | Payment method | Stock OUT has Transfer / Cash / Credit card. **GAP:** do courses record a payment method? (today: a slip / confirm) |

---

## 3. STOCK

### 3.1 The sheet
**STOCK IN** (with E1 *"ทำหน้าตา report แยกได้"*):
1. Model code: *"FB/D02 , IL/SK01"*.
2. Product Name: *"Miller/ BABY SKATE - Seaworld , Miller/ HELMET - Turquoise /ML"*.
   - Note beside it: **"ไม่รวมหมวก/ สนับของ Miller"**. So Miller **helmets and pads are NOT in "Miller division"**; they are Safety.
3. Category: **Miller division · Inlineskate · Bike · Safety (Helmet / Protection) · F&B · Other: Shirt, Sock, Bag**.
4. **Price / ค่าคอม**.
5. Picture.
6. Note / Remark.

**STOCK OUT:**
1. ใครซื้อ (who bought).
2. ครูคนไหนได้คอม: *"ระบุจำนวนครูได้ - หากหลายคน ให้นำมาหารกัน"* → *"จะไปลิงค์กับค่าคอมว่าใครได้เท่าไหร"*.
3. Price.
4. Discount.
5. Payment Type: **Transfer · Cash · Credit card**.
6. Remark.

**STOCK DEMO**, *"ควรแยกกันกับสต้อกขาย"*:
1. Storage at several schools, *"เพิ่มเองได้"*: **STA · ABC · RIS · WA (Abbey) · KIS · Bravo**.
2. Add / reduce stock **with a history**.
3. Report over a chosen period.
4. Items, *"เพิ่ม/สร้าง/แก้ เองได้"*:
   - Category: SURFSKATE · SKATEBOARD · CRUISER · ONEWHEEL · INLINESKATE · FREESKATE · BIKE · BABY SKATE · EQUIPMENT · OTHER (plus HELMET and PAD in a small example);
   - her **full item list** per category (≈ 90 rows: Miller boards, Roller Play sizes, Royal / Space Shark bikes, cones, Roll Up, megaphone, Hippy Jump fence, Balance Board …) is in `sheet-STOCK.csv`.

**REPORT:**
1. ประวัติการขาย (sales history).
2. Stock Balance.
3. **Low Stock Alert**: *"สินค้าที่สต็อกกำลังจะหมด (กำหนดได้ โดยแยกประเภท) ให้มีการแจ้งเตือนแอดมิน + CEO ทุกๆ วันจันทร์"*. Thresholds: **F&B 10 · Safety 1 · Miller Product 5 · Sock 1 · Shirt 1**.

### 3.2 The meeting (B §4)
- Stock-in fields as above.
- **Excel import = "Delete All & Re-create All"** (Dong's description). To add later: export, append rows, re-import, **or** add one by one by hand.
- **Stock OUT:** buyer, price, discount, payment, remark. **Commission:**
  - one coach → that coach gets all of it;
  - several → **split equally** from that product's commission.
- **Stock DEMO:**
  - teaching equipment at each branch (STA, ABC, RS);
  - quantities;
  - **moving A → B** with minus/plus and a **history**;
  - **a sale item can be moved into Demo**.
- **Movement report / Total balance** over a chosen period: sales, restocks, moves, balance.

### 3.3 Stock: agree / conflict / gap
| id | topic | status |
|---|---|---|
| **K-1** | **Receiving quantity** | 🔴 **GAP:** STOCK IN lists a **product's details** but no **quantity received, date, cost price or supplier**. So how is "+10 helmets arrived" recorded, and is cost/profit wanted? |
| **K-2** | **"Delete all & re-create" import** | 🔴 **RISK:** it would wipe the sales history and Demo history tied to those products. Re-create must **match by Model code** (update in place, never delete what has history). This was Dong's own description, so the owner decides. |
| K-3 | Where sale stock lives | **GAP:** one store (Bravo) or per school like Demo? Low-stock is per product or per site? |
| K-4 | Category lists differ | STOCK IN (Miller division · Inlineskate · Bike · Safety · F&B · Other) vs REVENUE SALES (Miller · Inline · Bike · Safety) + separate types F&B, OTHER. ✅ mappable. **Confirm** the mapping. |
| K-5 | Commission rate source | ✅ per product (*"Price / ค่าคอม"*) = SALARY's commission list. **GAP:** rate per product or per category (the list is by family: "Miller Surfskate / Cruiser / Skateboard / Inline-skate 100")? |
| K-6 | Several coaches on a sale | ✅ split equally. **Interaction with S-12** (FT pool) → GAP. |
| K-7 | "Who bought" | **GAP:** a registered family (link to the front office), or free text? |
| K-8 | Discount | **GAP:** amount or %? Does commission shrink with the discount? |
| K-9 | Sale → Demo | ✅ a sale-stock item can move into a Demo site. **GAP:** Demo → back to sale? Write-off of broken items? |
| K-10 | Low-stock alert | ✅ weekly, **Monday**, to admin + CEO, thresholds per type. **GAP:** by LINE or in-web (same as S-17)? Does Demo stock alert too? |
| K-11 | Demo items | ✅ editable categories and items. Her list is the seed data. |

---

## 4. Cross-cutting (all three)
- **X-1 Accounts and roles.** Coaches must log in to see and confirm their pay (S-16). Base salary is ฟีน-only (S-19). Admins earn commission. **Who sees and does what is OPEN** (the Authorize tab was ruled out).
- **X-2 Notifications.** Pay items (S-17) and low stock (K-10): LINE or web?
- **X-3 Branch.** Revenue wants Bravo / Other (R-4). Demo has sites. The front office has neither.
- **X-4 History is never lost.** The import (K-2), pay confirmations (S-16) and stock moves all need an audit trail.
- **X-5 The existing back-office code** (`smart-scheduler-backoffice-back` / `-front`) was designed around a **wallet debited at ATTENDED**. The customer now says **revenue at CONFIRM**. **Sober is surveying it** (`SURVEY-backoffice-repos-2026-10-13.md`).
- **X-6 Scope and money:** Option C (73,000 ฿) promised simple stock. Salary, Revenue and the reports go beyond it. **The owner's conversation.**

## 5. Data the back office needs from the front office (Silver is checking each one: `SURVEY-frontoffice-data-for-backoffice-2026-10-13.md`)
1. Teaching hours per coach per day: from the **timetable** (E7: *"คิดงานตารางสอนเท่านั้น"*) and from **check-ins** (requirement 4).
2. Coach type FT / PT / FL / STAFF, and **two types for one person** (Nelson).
3. The **first coach** of a trial, and of a course.
4. Trial → course / voucher conversion, and course **renewal**, with dates (bonus S-5/S-6).
5. Each booking's **confirm time and paid state** (revenue at confirm, R-2).
6. ECA sessions with **all** their coaches (fuel "ผูกกับ ECA", pay).
7. Camp hours per coach.
8. A **branch** for any booking (R-4).
9. Web user accounts for coaches (S-16).
10. Course and voucher **prices** as sold.

## 6. What happens next
1. **The owner corrects this reading.** Anything I misread is cheaper to fix here.
2. I turn the 🔴 conflicts and the GAPs into **one customer question set, in Thai, by consequence and with examples**, never by rule (standing rules). It goes in ONE message.
3. The spec, then the customer proves it, then sizing, timeline and budget (the owner's), then build.

## 7. Sober's survey of the existing back office (added 10-13; `SURVEY-backoffice-repos-2026-10-13.md`, facts with file:line)
- **backoffice-back**, last commit 08-22: the live API is **auth + one universal `bo` item model** (items · movements · tags · 3 reports). The older `ops` model (parties, stock, wallet, price rules, salary, settlement) is **dormant**: its files are kept, its routes unmounted, its tables absent.
- **backoffice-front:** 4 live screens (P&L · revenue by activity · items · tags), 4 placeholders (inventory · wallet · payroll · reports), 0 tests.
- 🔴 **The scheduling back already writes the back office's tables directly, in the same DB:**
  - `bo.item` / `bo.movement` for the **freelance income ceiling**, inside the booking transaction;
  - **every sale**: course, voucher, camp, rental, plus the **end-of-day ATTENDED posting**;
  - undo reversals.
  - ⇒ **A rebuild must keep those tables and their conventions, or the scheduling back changes with it.** This weighs on R-2 (revenue at confirm vs today's postings, which include an ATTENDED step).
- The HTTP client in the scheduling back (`ops-client.ts`) is dead code.
- **Owner questions (survey §6):**
  1. Are the back-office apps running or used on sid/uat?
  2. Was `migrate-to-bo.ts` ever run?
  3. Which parked areas (wallet · payroll/settlement · inventory · parties · commission) are in the rebuild?

## 8. Silver's survey of the front-office data (added 10-13; `SURVEY-frontoffice-data-for-backoffice-2026-10-13.md`, facts with file:line)
**✅ Exists:**
- timetable hours (1 row = 1 hour);
- ECA extra coaches + per-coach rates;
- camp hours per coach;
- `confirmed_at`;
- the coach-login mechanism.

**🟡 Derivable only:**
- **the first coach**, from the earliest delivered row. A reassignment overwrites it in place, and there is no history;
- **the price as sold**, only in `bo.movement`, best-effort, nothing for imported courses;
- **check-ins**: who and which channel, but **no time**.

**❌ Not stored at all:**
- **any payment record** (paid flag, date, amount, slip);
- **a trial → course / renewal link**;
- **STAFF**, and **two types for one person** (Nelson);
- **a branch** (only optional per-booking badges);
- ECA place / distance / fuel;
- FT/PT base salary;
- booking history;
- merchandise and stock.

**🔴 R-2:** revenue today is posted **at the SALE** (courses, vouchers) or **at day-end when ATTENDED** (trials, singles, OTHER), **never at confirm**. The customer said **at confirm**.

**Definitions the spec must settle:**
- "first coach": the coach at booking time, or the one who actually taught?
- "converted": within how long after the trial, and does a voucher count (S-5)?

**Optional bare SQL for the owner (DB-only facts):**
- coach logins: `SELECT count(*) FROM users WHERE teacher_id IS NOT NULL AND disabled_at IS NULL;`
- whether a "branch" badge type exists.

## 9. The owner's answers to the survey questions (2026-10-13, verbatim)
1. *"เปิดทั้งคู่ แต่ไม่มีใครใช้"*: both back-office apps run on sid and uat, and **nobody uses them**.
2. *"จำไม่ได้ มันคืออะไร ฉันจำได้ ว่าตอนแรก ให้ทำdbแยก แต่แก้ เป็นรวมเข้ากับdatabase หน้าบ้าน ตอนแรกว่าจะให้แยกเพื่อหวังจะขยาย โปรเจค ขายของ บลาๆในอนาคต"*: the back office first had its own DB (to grow into a separate selling product later), then was **merged into the front-office DB**. He does not recall `migrate-to-bo.ts`.
3. *"ถ้านายและทีม ลองอ่านข้อความประชุม และ โค้ดปัจจุบัน การทำงานปัจจุบัน นายน่าจะเข้าใจนะ ว่ามัน ต่างกันขนาดไหน ลองให้tanya ทดลองใช้ sid backofficeดู และลองให้SAดูโค้ดก็ได้"*. ⇒ The team produces the **gap: what the customer wants vs what exists and how it works today**:
   - Tanya **uses** the sid back office;
   - the SAs map the code against §1–§3.

## 10. The owner's direction (2026-10-13, verbatim): **rebuild a lot**
> *"ถ้าถามความเห็นฉัน สำหรับฉันมองว่ารื้อเยอะเลยดีกว่า เพราะที่ฉันทำไปตอนแรก มันเหมือน ระบบ รายได้ รายจ่าย ธรรมดา ที่ระบุ การเข้าออกของเงินได้ สร้าง item ตั้งว่ามันคือรายได้ หรือ รายจ่าย และเป็นประเภท ฟิกรายเดือน หรือแปลผันไปตามสถานการณ์ (คือมากดคำสั่ง หรือ สั่งAPI มาบวกลบ) แต่ที่เขาต้องการคือ ระบบuniqe Backoffice มีรายละเอียดของ STOCK ที่มีความเป็นตัวเองสูง รวมไปถึงREVENUE และ SALARY ถ้าจะพูดรวมๆ คือที่ฉันทำคือ Backoffice scalable can pair with every app in future แต่เขาต้องการ Uniqe backoffice for frontoffice and manual stock in and out and unique REVENUE + SALARY"*

**What exists today vs what is wanted:**

| | **What exists (the owner's first design)** | **What the customer wants** |
|---|---|---|
| shape | a generic income/expense ledger: an item is income or expense, fixed-monthly or variable, moved ± by a command or an API call | a back office **made for THIS front office** |
| stock | items with ± movements | stock with its **own domain detail**: sale stock and Demo stock, sites, moves, buyer, payment, coaches' commission, the Excel import, low-stock |
| revenue | whatever is posted as a movement | **its own** rules: her categories, at confirm, branch, MTD/YTD |
| salary | a freelance ceiling only | **its own** rules: 4 types, base, extra hour, OT, merit, bonus, fuel, commission pool, monthly confirm by each person |
| reuse | "pairs with every app in future" | serves this school only |

**One fact the rebuild must carry (Sober's survey §3):**
- The scheduling back **writes the current `bo.item` / `bo.movement` directly**: the freelance ceiling, inside the booking transaction, and every sale.
- So "rebuild a lot" **includes those write points in the front-office back**. They move to the new model, or the old tables stay as a bridge.
- That choice belongs in the spec, with its size.

## 11. For the customer (2026-10-13)
**Owner:** *"ฉัน อยากให้ทำ MD หรือ html ไว้ เอาไปคุยกับเขา ว่าเราเข้าใจถูกหมดก่อนเริ่มทำ"*.
**File:** `project-docs/customer-2026-10-13-backoffice-confirm/backoffice-understanding.html`. It is in Thai, has no internal or code detail, and leaves out money and scope (the owner's).
**Contents:**
- understanding lines to tick ✓ / ✗: S1–S17 · R1–R4 · K1–K9 · P1;
- questions, each with an example and its consequence: QS1–QS13 · QR1–QR10 · QK1–QK7.

The page keeps answers in the browser and has a "copy all answers" button.
**Silver's revenue gap** (`GAP-backoffice-revenue-2026-10-13.md`) is covered: its 5 consequence-questions map to QR1 · QR2 · QR3 · QR4 · QR9.

## 12. Tanya used the sid back office (`tests/TEST-102-sid-backoffice-walkthrough.md`, 2026-10-13)
**Screens:** 4 working · 4 placeholders · 2 broken.

**The customer's tasks:**
| task | today |
|---|---|
| record a sale | partly |
| see revenue | partly |
| see stock | partly |
| **a coach's pay** | **IMPOSSIBLE**: Payroll is a placeholder; the FT/PT and Freelance pages give 404 |

**Findings:**
- 🔴 F-1: "receive stock" on a product is recorded as a **NEGATIVE sale**, so it cuts revenue.
- 🟠 The P&L page and the Revenue page disagree.
- 🟠 Camp and rental appear as "unknown product code", ฿70,300.

**Conclusion:** it confirms §10: the current back office cannot be the base for the customer's Salary, Revenue or Stock.

## 13. KHWAN'S ANSWERS (2026-10-14): what is now RULED, and what is still open
Verbatim: `project-docs/customer-2026-10-13-backoffice-confirm/khwan-answers-2026-10-14-VERBATIM.md` (+ her PDF). **Her words win over every line above.** The owner told her a rough spec comes next, to show her where our understanding is right or wrong.

### 13.1 Ruled: Salary
- **Dual role, per role:** Toth / Kid / Fit / Karn / Print are *"Part time เสาร์อาทิตย์ + Freelance วันธรรมดา"*: *"รายได้ให้นับจาก role ที่เขาเป็น"* (PT salary + FL hourly). Admins change roles themselves (*"เราสามารถเปลี่ยนเองได้ใช่ไหมคะ"*: yes, by design).
- **PT (QS4):** Extra hour · OT · Merit · bonus. **No fuel.**
- **FL:** hourly by timetable. **Rates by class type**: Private / Duo / Group / ECA / Camp (QS5). **FL gets no bonus** (QS7).
- **Hours** for Extra hour count **from the timetable, incl. ECA and camp** (QS6). The rule is 350 ฿/hr, weekday from the 5th hour, weekend from the 6th, per day.
- **OT** = **salary ÷ 26 ÷ 8 × 1.15** per hour, for **non-teaching work only** (QS3).
- **Merit:** chosen per person. Today only Admin Poo / Kung among staff (S9).
- **Commission:**
  - staff today earn it **only on Skatebag** (S12);
  - FT = **6** now (S13);
  - FT + PT selling together: e.g. PT 50, 50 to the FT pool (QS9);
  - an admin who sells alone keeps it; selling together is split.
- **Bonus:**
  - Trial → Voucher **50**; a new voucher after a voucher is **not** a renew (QS1);
  - no time limit after the trial (QS8);
  - 2 coaches on the first class → **both** get it (QS7);
  - coach changed mid-course → **the admin chooses** who gets the renew bonus (QS7).
- **Fuel:** *"เบิกได้ทุกคนที่ขับรถไป"*. The system **stores each school's distance, editable**. Minimum 60 / 40 (QS10).
- **Pay period:** *"สิ้นเดือน - 1 วันก่อนสิ้นเดือน e.g. 30/9-30/10"*, i.e. from the last day of the previous month to the day before the last day of this one.
  - **Confirm deadline: the last day of the month, before 12:00** (S15/QS2).
  - Not confirmed: **LINE reminders "1 ชั่วโมง / 3 ชั่วโมง"**, then the web figure is **paid as is, no edits** (QS12).
  - A dispute goes **to an admin directly**.
  - After confirm, the team can **ADD items without seeing the whole slip**.
- **Visibility (QS13):** admins do **NOT** see coaches' pay; a coach sees **only their own**; base salary is ฟีน only.
- **Notifications** are **in the web**, with **per-person, per-type subscription** (S17/QS11), e.g. Admin A gets all types, Admin B bonus only. Today: ฟีน only.

### 13.2 Ruled: Revenue
- **Categories:** her list, and **she can add more** (R1). The sub-level "Private / Duo / 1 HR" applies to **every sport** (QR8).
- **Course / voucher:** the **whole amount when paid** (QR1 = A). **Camp:** per child per week, at confirm (QR5).
- **Refund:** an **expense in the month of the refund**. Pause: revenue unchanged (QR2).
- **Branch:** Bravo now, "Other" = future branches. **The admin chooses it at booking** (QR3) ⇒ **a front-office change**.
- **ECA:** **per term**. ฟีน enters price per class × students × classes per term, and the system computes (QR4).
- **Birthday:** entered as an **Other** booking + revenue typed by hand (QR5).
- **Rent** comes from the **Rental** bookings. **Park fee:** an **Other** booking that charges and blocks the timetable, with a **"No Teacher"** teacher (QR6).
- **Sales → revenue automatically** (QR7).
- **The payment method is recorded** (QR9) ⇒ **a front-office change** (no payment record exists, §8).
- **Revenue is seen by the CEO only** (QR10).

### 13.3 Ruled: Stock
- 🔁 **CORRECTION (K2):** **Miller division INCLUDES Miller helmets and pads.** **Safety** = helmets and pads of every brand **except** Miller. My K2 reading was wrong.
- **The sale form is called "SALES RECORD"** (K3).
- **Low-stock recipients are chosen**: today London (admin) + ฟีน (CEO) (K8). **Per location** (QK3).
- **Receiving:** quantity + date. **No cost or profit** (QK1).
- **Excel import = B**: match by Model code, never delete history (QK2).
- **Several sale-stock locations:** one today, more later (QK3).
- **Commission is per GROUP** (QK4). **Discount** in ฿ or % (QK5). **Commission is not reduced by a discount** (QK5).
- **Buyer:** pick from the system **or** type (QK6).
- **Demo → sale allowed.** Broken or lost goods: *"ตัดออกไปเป็น Demo ค่ะและต้องใส่เหตุผล"*. Demo has **no** alerts (QK7).

### 13.4 Ruled: Reports
Headings: **REPORT · STOCK · CHECK IN · COURSE · SALARY · STUDENT**. Details are discussed when that part starts (P1).

### 13.5 STILL OPEN (to be asked inside the rough spec, by example)
| id | open point | why |
|---|---|---|
| O1 | **PT fuel:** QS4 says PT **"ไม่ได้ค่าน้ำมัน"**; QS10 says **"เบิกได้ทุกคนที่ขับรถไป"** | contradiction |
| O2 | **An FT who joins mid-month:** a full share of the pool? | she repeated the question without an answer (QS9) |
| O3 | **Dual role, which classes are which:** weekend = PT and weekday = FL **automatically by day**, or chosen per class? | S1 gives the pattern, not the rule |
| O4 | **S3 lists "เงินตามรายชั่วโมงสอน" for PT:** does PT also earn hourly pay, or does that only come through the FL role? | ambiguous |
| O5 | **Bonus when both first-class coaches get it:** 50 each, or 50 split? And a dual-role coach whose first class was on an FL day: bonus or not? | "ได้โบนัสทั้งคู่" doesn't say which; FL gets no bonus |
| O6 | **FL rates by class type:** one rate table for all FL, or per FL person? | QS5 |
| O7 | **Revenue date:** "ทั้งก้อนตอนจ่าย" (QR1) vs "ตอน Confirm" (R2): the payment date, which must be recorded? | they match only if payment = confirm |
| O8 | **ECA term revenue:** which date does a term's revenue count on (term start? billing?) | QR4 gives the amount, not the date |
| O9 | **Broken / lost sale goods "→ Demo with a reason":** a broken item becomes Demo stock? And a lost Demo item: how is it written off? | QK7 |
| O10 | **The LINE reminder "1 ชั่วโมง / 3 ชั่วโมง":** 3 h and 1 h **before** the 12:00 deadline (09:00 and 11:00)? | reading |
| O11 | **Commission eligibility by role:** staff earn only on Skatebag. Is that a per-person or per-role list of groups that earn commission? | S12 |

## 14. Rough spec, draft 1, for the customer (2026-10-14)
`project-docs/customer-2026-10-14-backoffice-spec-draft/backoffice-spec-draft.html`. It is in Thai and uses example numbers only. **Contents:**
- 0: who sees what, and per-person notification subscriptions;
- 1: Salary:
  - the person setup (multi-role · base 🔒 ฟีน · FL rates by class type · merit and commission eligibility);
  - what is computed vs entered;
  - 3 worked slips (FT 23,139 · Kid PT+FL 11,550 · Staff Poo 15,600);
  - the cycle (30/9–30/10, confirm by the last day 12:00, LINE reminders);
- 2: Revenue: when each kind posts, and the report screen;
- 3: Stock: products (Miller division incl. Miller helmets) · SALES RECORD · Demo · alerts;
- 4: report headings;
- 5: **the front-office changes the back office needs**: branch at booking · payment record + method · multi-role + STAFF · first coach + trial/renewal link · "No Teacher" · coach web users;
- 6: **O1–O11** as questions by example.

Same mechanics as the confirm page: ✓/✗ per block and "copy all answers".
**Not in it:** money, timeline, sizing (the owner's).

## 15. KHWAN'S ANSWERS TO SPEC DRAFT 1 (received 2026-10-15): every block ✓, O1–O11 ruled
Verbatim: `project-docs/customer-2026-10-14-backoffice-spec-draft/khwan-answers-draft1-VERBATIM.md` (+ PDF). **All 13 blocks were marked "ตรง"**, with these additions.

### 15.1 Additions to the agreed blocks
- **Notifications:**
  - per person, per type;
  - **FT and PT coaches are also notified of their Extra Hour**;
  - **type names in ENGLISH:** *Low Stock · Transportation · Commission · Other · Bonus* (+ Extra Hour).
- **Who enters merit:** **Merit Teacher → Admin Poo** · **Merit Staff → Khwan or พี่ฟีน**.
- **Slip detail: every line itemised.** *"ทุกรายการต้องขึ้นดีเทลนะคะ เช่นสอนไปกี่ชั่วโมง ก็ต้องขึ้นว่าสอนใครไปบ้าง"*:
  - Extra Hour **by date** (*"14/10 = 6 Hr · 19/10 = 7 Hr · 20/10 = 5 Hr"*);
  - bonus **with the child's name** (*"คอร์ส 50 น้องเอ / คอร์ส 100 น้องบี"*);
  - transportation with every trip's detail;
  - teaching hours with **who was taught**.
- **Revenue report:**
  - the first page = **a summary by type**, then a click-through to **every single line** (*"เอาแบบมีรายละเอียดทุกรายการ ไม่เอาแบบสรุป"*);
  - columns, in English: **Date · Branch · Type · Category · Product Name · Amount · Payment · Remark**.
- **Stock words:** "รับของเข้า" = **Stock In** · SALES RECORD fields **Product · Discount · Payment**.
- ⚠️ **Commission group of Miller helmets:** *"Miller/ HELMET - Turquoise /ML ไม่ได้อยู่ใน Animal Helmet 40"*. My example put it in "Miller/Animal Helmet 40", and it is not there. ⇒ **O12 (open):** which group (rate) does a Miller helmet like the Turquoise one take?

### 15.2 O1–O11 ruled
| id | ruling (her words) |
|---|---|
| O1 | **PT may claim transportation** (*"PT เบิกได้ (ทุกคนที่ขับไป)"*) |
| O2 | An FT joining mid-month gets the **full pool share** |
| O3 | PT/FL role of a class is **automatic by the day** (weekend = PT, weekday = FL) |
| O4 | **PT = salary only (+ Extra Hour on PT days)**. Hourly pay only in the FL role (*"เงินเดือน + Extra Hour วันเป็น Parttime"*) |
| O5 | Two coaches on the first class **share the 50 (25 each)**. A PT+FL coach gets a bonus **only for classes taught as PT** |
| O6 | FL rates are **per person** (and per class type, QS5) |
| O7 | Revenue counts on the **confirm date**. *"ลูกค้าโอนเงินวันไหน เรากดคอนเฟิร์มคลาสวันนั้นค่ะ"*: in their practice, payment day = confirm day |
| O8 | ECA term revenue counts on **the date the school pays** |
| O9 | Broken sale goods **→ Demo** (with a reason). Lost or broken Demo items **can be written off** |
| O10 | LINE reminders at **09:00 and 11:00** on the last day (3 h / 1 h before 12:00) |
| O11 | Commission eligibility by product group is **per TYPE** (e.g. STAFF: Skate bag only) |

### 15.3 Still open
- **O12:** the commission group of Miller helmets (above).
- **(note, not a question):** she asked for English labels. Draft 2 / the real UI uses English labels for the back office; the owner confirms if the whole back office is English.

### 15.4 O12 ruled (2026-10-15 21:39, LINE)
Khwan: *"40 แหละค่ะ แต่แยกจาก Animal Helmet ค่ะ ค่าคอมเท่ากันแต่คนละอันกันค่ะ"*. ⇒ **Miller helmets are a separate commission group at 40**, not the Animal Helmet group (also 40). REQ-120 R3.1 updated.
Khwan 21:58: *"สนับมิลเลอร์ก็ 40 นะคะ"*: Miller pads are 40 too.
