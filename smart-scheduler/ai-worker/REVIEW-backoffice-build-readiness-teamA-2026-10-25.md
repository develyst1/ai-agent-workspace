# BUILD-READINESS REVIEW: REQ-120 back office, Team A's parts (Salary · Stock · F3/F6 · R0) — @Sober, 2026-10-25
> **UPDATE 2026-10-25 (Porter, inbox/SA.md):** two items are now ✅.
> - **S24 / Q1:** the admin may LOWER OR RAISE a commission (Khwan 15:02, *"…ใส่เพิ่มไว้ได้ด้วยก็ไม่เสียหายค่ะ"*).
> - **S38:** My slip = as Payment Detail (REQ-120 §9.3).
>
> **Counts now: ✅ 54 · 🟡 37 · 🔴 8** (R1: ✅ 19 · 🟡 19 · 🔴 3). **Questions now 24** (Q1 closed). The rows below keep their original text for the trail.

Analysis only. **Reviewed by @Sober:** the headline claims were spot-checked against the sources (e.g. §9.2 and the v3 verbatim *"discount ต้องสามารถใช้กับสินค้าแต่ละชิ้น"* / *"B. ลดหรือเพิ่มก็ได้"*). No money appears in this file.
**Scope:** R1 Salary, R3 Stock, F3 + F6, R0 (users, roles, visibility, notifications). **Out of scope** (another SA): R2 Revenue, F1/F2/F4/F5, Confirm camp, C1, the §4 reports.

**Sources** (paths are relative to `smart-scheduler/`):
- `ai-worker/requirements/REQ-120-…md` §0–§10, §9.1, §9.2
- `ai-worker/requirements/REQ-122-…md` §6–§10
- `ai-worker/STATUS-BACKOFFICE-SPEC.md`
- `ai-worker/UNDERSTANDING-backoffice-2026-10-13.md` §1, §3, §13, §15
- `ai-worker/SURVEY-frontoffice-data-for-backoffice-2026-10-13.md` §2, §3, §6, §7, §9 (code facts)
- `ai-worker/inbox/PM.md`: Silver's re-size, 2026-10-20
- the verbatim files:
  - `V-1014` = `project-docs/customer-2026-10-13-backoffice-confirm/khwan-answers-2026-10-14-VERBATIM.md`
  - `V-D1` = `project-docs/customer-2026-10-14-backoffice-spec-draft/khwan-answers-draft1-VERBATIM.md`
  - `V-P1` / `V-P2` = `project-docs/customer-2026-10-16-backoffice-prototype/khwan-answers-proto-v2-part1|part2-2026-10-19-VERBATIM.md`
  - `V3-1` / `V3-F` = `project-docs/customer-2026-10-22-backoffice-prototype-v3/khwan-answers-v3-part1-2026-10-23|v3-full-2026-10-25-VERBATIM.md`
- the v3 prototype itself, `project-docs/customer-2026-10-22-backoffice-prototype-v3/SOM-BACK-OFFICE-v3.html` (she ✓'d 29 of 31 pages, so what it shows counts as agreed unless she wrote otherwise).

**Precedence used:** later rulings win:
- REQ-120 §9.2 / REQ-122 §10 (10-25)
- \> §9.1 (10-21)
- \> §9 (10-20)
- \> REQ-122 §7.3 C-a…C-k
- \> §8 D2–D6
- \> R-lines §0–§3.

**Legend:**
- ✅ buildable as written;
- 🟡 buildable with the stated DEFAULT (the SA confirms the default or asks);
- 🔴 cannot build: a missing rule, a conflict between rounds, or missing customer DATA.

---

## Part 1: R1 Salary

| # | item | rule as it stands NOW | verdict | evidence |
|---|---|---|---|---|
| S1 | Employee types | FT · PT · FL · STAFF | ✅ | REQ-120 R1.1; V-1014 S1 |
| S2 | Employee Profile fields | Type (full words) · Base salary (CEO only) · "Freelance Rate" per class type · Merit (yes/no + "every 3 months (Nov 2026)" / monthly) · Commission ("All" / "All — shared among employees" / "Only Skate bag") · Vehicle · **a "Bonus" heading after Merit** (*"ต้องมีหัวข้อ Bonus ด้วยนะคะ ในหน้านี้อยู่ต่อ Merit"*) | 🟡 **Default:** the Bonus heading is READ-ONLY. It shows the bonus eligibility that follows from the type (FT: yes · PT: PT days only · FL: no · STAFF: no). It is not a per-person switch. | REQ-120 R1.2; V3-1 p2; REQ-122 §9 |
| S3 | Base salary | FT · PT · STAFF; typed by the CEO; a fixed monthly amount | 🟡 **Default:** the full base for a period, even for someone who joins or leaves mid-period; the CEO corrects it with Other ±. No pro-rata rule was ever given. | REQ-120 R1.2 table; UNDERSTANDING §1.1 row 6 |
| S4 | FL teaching pay | timetable hours × that person's rate for the class type (Private / Duo / Group / ECA / Camp); FL role only; per person (O6 *"แยกรายคน"*) | 🔴 **(a) Missing rule:** which rate pays an FL for a **1st Trial, a 1 HR class, or an OTHER booking** (birthday, etc.)? None of the five types fits. **(b) Two sources of rate:** the front office already stores per-session coach rates (`booking_teachers.rate_minor` for ECA, `camp_week_day_teachers.rate_minor`, `class_rate_minor` for DUO, the FL ceiling item rate). Which one wins for pay? → Q2, Q3 | REQ-120 R1.2; V-1014 QS5; V-D1 O6; SURVEY §6, §7, "Extras" |
| S5 | Which sessions count for hours (FL pay, Extra Hour, Teaching Hours) | "from the timetable" | 🟡 **Default:** every session that took place and was not cancelled, **including a child no-show where the coach was there**. Cancelled sessions and leave days do not count. → Q4 | REQ-120 R1.2; V-1014 QS6 |
| S6 | Extra Hour | 350 ฿/hr, counted per day. Weekday: hours "> 4th HR". Weekend: "> 5th HR". FT on any day; PT only on PT days (Sat–Sun); FL never | ✅ | REQ-120 R1.2; V-1014 QS3; V-D1 O4 *"เงินเดือน + Extra Hour วันเป็น Parttime"*; V3-1 p3 |
| S7 | Extra Hour: do ECA and camp hours count? | QS6 says yes (*"นับจากตารางสอน รวม ECA และแคมป์"*). In v3 she struck the line: *"Hours come from The timetable, incl. ECA and camp = เอาออกค่ะ"* | 🟡 **Default:** only the sentence is removed from the screen; ECA and camp hours still count. → Q5 | V-1014 QS6; V3-1 p3 |
| S8 | Hour and baht rounding | not given (e.g. a 1.5 h class; the OT rate ÷26÷8×1.15; the FT pool ÷ N) | 🟡 **Default:** hours to the minute, pro-rata; money rounded to 2 decimals per line; a pool remainder of a few satang goes to no one. → Q6 for the Extra Hour part | REQ-120 R1.2 |
| S9 | OT | (base ÷ 26 ÷ 8 × 1.15) × hours typed by an admin; non-teaching work only; FT · PT. A PT+FL person uses their PT base. The admin sees the hours, never the amount (the v3 Other Income page shows "—") | ✅ | REQ-120 R1.2; V-1014 S8/QS3; v3 prototype `entries.js` |
| S10 | Merit | manual amount for chosen people. Teachers every 3 months (next 11/26), typed by Admin Poo. Staff monthly, typed by Khwan or ฟีน | 🟡 **Default:** the schedule is DISPLAY only (no enforcement, no reminder). Any admin may enter a merit; "Poo for teachers" is practice, not a permission. Whether Khwan sees amounts depends on her role (R0-2). | REQ-120 R1.2; V-D1 1.2; V-1014 S9 |
| S11 | Bonus 50: core | a child finishes a 1st Trial, then buys a course OR a voucher (no time limit) → the trial's ONE coach (*"Trial ไม่มีทางมีครู 2 คนค่ะ"*). Paid only if that coach is FT, or PT teaching on a PT day; FL gets none (*"ครู FL ไม่ได้โบนัสค่ะ"*). The 25/25 case is gone | ✅ | REQ-120 R1.2 + §9 C-e; V-P1 p15; V-1014 QS1/QS7/QS8; V-D1 O5 |
| S12 | Bonus 50: which trial pairs with which purchase | not given: a trial in one activity followed by a course in another; several trials; an old trial followed by a much later purchase. Note "1st Trial" is now a revenue type with a category per activity (C-i) | 🔴 missing rule → Q7 | REQ-122 §7.4 C-i; V-P2 p22 |
| S13 | Bonus and the go-live date (D6) | *"ไม่เอาทั้งคู่ค่ะ เริ่มนับเฉพาะวันที่ระบบเสร็จเลยไม่ทำย้อนหลังค่ะ"* | 🟡 **Default:** pay only when BOTH ends (trial + purchase, or old course + renewal) are in the system after go-live. → Q8 | REQ-120 §8 D6 |
| S14 | "First coach" definition | the coach who taught the trial / the first class of the old course | 🟡 **Default:** the coach on the first ATTENDED session (the survey's derivation), not the coach at booking time | SURVEY §3 ("📌 needs a business definition") |
| S15 | Bonus 100: renewal | "a course renewal" → the old course's first coach; FT or PT-on-PT-day | 🔴 **Missing rule:** what counts as a renewal. Same activity/program, or any next course? Voucher → course, or course → voucher? Is there a time window after the old course ends? → Q9, Q10 | REQ-120 R1.2; V3-1 p3 ("A course renewal = Renewal Course") |
| S16 | Voucher after voucher | QS1: not a renewal (*"เมื่อ Voucher หมดแล้วซื้อ Voucher ใหม่ นับเป็น "ต่อคอร์ส" ไม่ได้ 100 ค่ะ"*). v3 relabel: *"Not a renewal = NO"* · *"A voucher after a voucher = Renewal Voucher"* | 🟡 **Default:** the row reads "Renewal Voucher: NO" and pays nothing. The QS1 rule is unchanged; only the label is new. | V-1014 QS1; V3-1 p3; v3 `settings.js` Bonus 100 kv |
| S17 | Special Case (coach changed mid-course) | renewal bonus; the admin picks 1st Coach / 2nd Coach / Share 50/50 | 🟡 **Ruled** (§9 C-e). **Defaults for what wasn't said:** (a) the case is raised when the old course had more than one distinct coach on ATTENDED sessions; "2nd" = the latest coach; (b) more than 2 coaches → the admin still picks between first and latest; (c) an ineligible coach's share (FL, or PT on an FL day) is not paid. → Q11, Q12 | REQ-120 §9 #5; V-P1 p15; V3-1 p3 |
| S18 | Bonus lines on the slip | grouped with counts: "For 50 : น้องบี (Private) + น้องเอ (Voucher) = 2" · "For 100 : พิ้ง + ซี + เฟ = 3"; child's name + what was opened | ✅ | V3-F p5 |
| S19 | Commission groups & eligibility | rate per GROUP. Eligibility per type per group: FT → the pool; PT / FL → own; STAFF → Skate bag only. Miller helmet 40 and Miller pads 40 are separate groups from Animal Helmet 40 | ✅ (rule). The data is D4. | REQ-120 R1.3, R3.1; V-D1 O11; v3 `commissionGroups` |
| S20 | Several sellers | split equally; an admin who sells alone keeps it (*"แอดมินขายเอง แอดมินเก็บเอง"*) | ✅ | V-1014 QS9; V3-1 p3 Thai text |
| S21 | FT pool | the FT shares are pooled and split equally among all FT at month end; a mid-month joiner gets a full share (O2). Her Thai label goes on the screen verbatim | ✅ | REQ-120 R1.2; V-D1 O2; V3-1 p3 |
| S22 | FT pool: the "month" and leavers | not given | 🟡 **Default:** pool = the pay period's sales. Split among the FT who are FT on the period's last day; a leaver before then gets nothing. → Q14 | — |
| S23 | Commission vs discount, edit per item | not reduced by a discount automatically (*"**หากมีส่วนลด ค่าคอมยังเท่าเดิม และสามารถปรับค่าคอมได้ด้วยในบางกรณี"*). Editable **per item** in a bill (*"A. แก้แยกทีละชิ้น (เช่น ลดเฉพาะแผ่นที่มีตำหนิ)"*) by ฟีน and the admins | ✅ | REQ-120 §9 C-a, §9.1; V3-F p27; V3-1 p3 |
| S24 | **Admin commission edit range** | LINE 10-21 *"1 a"* = lower only; v3 10-25 *"B. ลดหรือเพิ่มก็ได้"* | 🔴 **CONFLICT between rounds**, already asked (REQ-122 §10; STATUS UPDATE). → Q1 | REQ-120 §9.1, §9.2; V3-F p27 |
| S25 | Commission 0 for cash | sheet: *"แก้มือเป็น 0 ในกรณีพี่ฟีนจ่ายสด"*. Her v3 text: *"***หากจ่ายสด กรอก 0"* | 🟡 **Default:** typed by hand (an edit to 0); NOT automatic when the sale's Method is Cash. → Q13 | UNDERSTANDING §1.1 remarks; V3-1 p3 |
| S26 | Transportation: core | anyone who drives (*"เบิกได้ทุกคนที่ขับรถไป"*, PT included per O1). Per trip: school (stored distance, editable) · One Way / round trip · car 6 ฿/KM, min 60 · motorbike 3 ฿/KM, min 40. Below the minimum → the minimum is paid | ✅ | REQ-120 R1.2; V-1014 QS10; V-D1 O1; V3-1 p3 |
| S27 | Transportation: car distance | *"*คำนวณระยะทางโดยใช้กิโลจากมอเตอร์ไซค์"* + *"**หากใช้รถยนตร์ ให้เทียบกิโลเมตรอีกครั้ง"* | 🟡 **Default:** one stored distance per school (motorbike km); on a car trip the admin can overwrite the km. → Q16 | V3-1 p3 |
| S28 | Transportation: trip details | origin, vehicle per trip, non-school trips, "linked to an ECA or not" (sheet) | 🟡 **Default:** the origin is Bravo; the vehicle defaults from the profile and can be changed per trip; a free destination with typed km is allowed; no link to an ECA booking (the front office has no school/location column, SURVEY §6) | UNDERSTANDING §1.1 row 10; SURVEY §6 |
| S29 | Other ± | an amount + a required reason, for anyone | ✅ | REQ-120 R1.2 |
| S30 | Pay period | the last day of the previous month → the day before this month's last day (*"สิ้นเดือน - 1 วันก่อนสิ้นเดือน e.g. 30/9-30/10"*) | ✅ (well defined for every month). Examples: D15. | REQ-120 R1.4; V-1014 S15 |
| S31 | Confirm / auto-lock / dispute | confirm by the month's last day before 12:00. Not confirmed → AUTO-LOCKED, paid as shown, no edits (*"หากยังไม่เข้าไปกดคอนเฟิร์มจะเป็นการจ่ายตามยอดในเว็บเลยค่ะ ไม่สามารถแก้ไขค่ะ"*). A dispute goes to an admin ("Tell an admin"). Statuses: Pending · Confirmed · AUTO-LOCKED | ✅ | REQ-120 R1.5; V-1014 QS12; V3-F p4 |
| S32 | LINE reminders at 09:00 and 11:00 | a LINE push to each Pending person | 🟡 Only coaches with an approved LINE link (`teachers.line_user_id`) can get one; STAFF without a teacher row have no LINE id. **Default:** no LINE → the web bell only. Data: D21 | REQ-120 R1.5; V-D1 O10; SURVEY §9 |
| S33 | Items added after confirm / lock | the team may ADD items blind after confirm (QS12) | 🟡 **Missing:** which slip gets them. **Default:** before the lock → this period's slip (no re-confirm); after the lock → the next period. → Q17 | V-1014 QS12; REQ-120 R0.3 |
| S34 | "Reminder" button on Monthly Payment | *"Remind เปลี่ยนเป็นว่า Reminder เฉยๆค่ะ ไม่เอา the ones in draft ค่ะ"* | 🟡 **Default:** sends the same LINE reminder now to everyone still Pending | V3-F p4 |
| S35 | Payment Detail itemised | Extra Hour per date in her wording "14/10/26 (Wed) : 6 Hr → ชม.ที่ 5–6 = 2 Hr × 350 ฿". Teaching Hours with Student + Program (*"ใส่รายละเอียดด้วยค่ะ ว่าเป็นกิจกรรมอะไร"*). Every trip in full. OT. "Merit (Every 3 month)" + "(enter manually)". The FT pool as "Total … ÷N coaches". **Every day listed**, no "…other days" line | ✅ | REQ-120 R1.6; V-D1 1.3; V3-F p5 |
| S36 | **Payment Detail export (NEW)** | Excel = a summary per section ("Bonus + Subtotal", "Extra Hour + Subtotal"), no details. PDF = everything, with details | 🟡 **Defaults:** CEO only; one person per export (no bulk); Thai text in the PDF. Who else may export (the coach on My slip?) was not said. | REQ-120 §9.2; REQ-122 §9, §10; V3-F p5 |
| S37 | Month history | a month picker on Monthly Payment / Payment Detail / Other Income | ✅ | REQ-122 §7.2, §8 item 2 |
| S38 | **My slip** (page 6) | never answered in any round | 🟡 **Default:** build v3 page 6 as is: own slip, the same detail as Payment Detail, "Confirm this slip", "Tell an admin", the deadline note. Not blocking per STATUS §4. | V3-F p6 "ยังไม่ตอบ"; STATUS UPDATE |
| S39 | Daily Training Report | teaching hours only, no check-in/out. Columns: Role · Hour · Description · Daily Income · TOTAL + the number of coaches. Daily Income = that day's Extra Hour + FL pay (no base share). Full type words; CEO only | ✅ | REQ-122 §7.3 C-g; V-P1 p8; V3-F p8; v3 `daily.js` (help text, ✓'d) |
| S40 | R1.8 month-end reports (teaching summary per coach; everyone's salary + other income) | content not designed | 🟡 **Default:** covered by Monthly Payment + Payment Detail (+ its export) at go-live; any extra goes to the §4 SALARY report (agreed later) | REQ-120 R1.8, §4 |
| S41 | PT+FL slip | PT days: the PT base + Extra Hour (hours shown as detail, not paid separately). FL days: hourly pay. *"รายได้ให้นับจาก role ที่เขาเป็น"* | ✅ | V-1014 S1; V-D1 O3/O4 |

**R1 count: ✅ 17 · 🟡 20 · 🔴 4** (41 rows).

---

## Part 2: R3 Stock

| # | item | rule as it stands NOW | verdict | evidence |
|---|---|---|---|---|
| K1 | Product page | columns ALL CAPS: MODEL CODE · CATEGORY (before PRODUCT NAME) · PRODUCT NAME · COMMISSION · PRICE · QUANTITY · LOCATION · PICTURE · NOTE; a Location filter; "Sales Product" | ✅ | V-P2 p24 (*"ขอแถวจำนวนและ Location ด้วยค่ะหน้านี้"*); REQ-122 §7.4 |
| K2 | Categories | Miller division (INCLUDING Miller helmets + pads) · Inlineskate · Bike · Safety (every non-Miller helmet/pad) · F&B · Other (Shirt, Sock, Bag); she can add more | ✅ | REQ-120 R3.1; V-1014 K2 |
| K3 | Commission group per product | each product carries one group (D4) | ✅ | REQ-120 R3.1 O12 |
| K4 | Price | one price per product | 🟡 **Default:** the price comes from the product and only the per-item discount changes it at sale; no free price typing | REQ-120 R3.1 |
| K5 | STOCK IN | product + location (Bravo) + quantity + date (a date picker: *"ขอเป็นเลือกวันที่ในช่องนะคะ"*); no cost, no profit; title "STOCK IN" | ✅ | REQ-120 R3.2; V-P2 p25; V3-F p25 |
| K6 | Correcting a wrong STOCK IN | not given | 🟡 **Default:** no hard delete; a reversing entry with a reason, kept in Movement | REQ-122 §7.4 C-k spirit (history kept) |
| K7 | Sale-stock locations | several; one today (Bravo); "Add Location" on Product; the Locations page is removed | ✅ | REQ-120 R3.3; V-P2 p27 (*"หน้านี้ไม่ต้องมีแล้วค่ะ แต่ให้เพิ่มฟิลเตอร์ Location ในหน้า Product เอาค่ะ"*) |
| K8 | Moving stock between SALE locations | not given (Demo moves exist; sale ↔ sale was never mentioned) | 🟡 **Default:** not built while there is one location; added when a second one exists | REQ-120 R3.3 |
| K9 | Excel import | matched by Model code; updates existing, adds new, never deletes; preview "Updated Item" / "New Item Added" / kept + her Thai line *"สินค้าที่ไม่ได้ถูกเปลี่ยนแปลงจะยังคงข้อมูลเดิม"*; "Apply"; Export; manual add | ✅ | REQ-120 R3.4; V-1014 QK2; V3-F p26 |
| K10 | **Does the import touch QUANTITY?** | not given. The v3 preview only shows price/note changes | 🔴 **Missing rule:** does a file with a quantity column set the balance (a count), add to it, or never touch it? It decides whether the import can load the opening stock. → Q22 | v3 `import.js`; REQ-120 R3.4 |
| K11 | Opening balance at go-live | none on disk | 🔴 **Missing DATA:** a count per product per location on the go-live date (D6) | STATUS §4 ("Her real Excel stock sheet") |
| K12 | STOCK OUT = a cart | several items, each with a quantity (*"ต้องเลือกซื้อได้หลายอันด้วย"*) | ✅ | REQ-120 §9 C-j; V-P2 p28 |
| K13 | Discount | **PER ITEM**, ฿ or % (*"discount ต้องสามารถใช้กับสินค้าแต่ละชิ้น ไม่ใช่ลดทั้งบิลค่ะ"*); no bill discount | ✅ | REQ-120 §9.2; REQ-122 §10; V3-F p27 |
| K14 | Buyer / branch | "Student" (picked from the system) or "Other Customer" (typed); Branch (default Bravo); Remark | ✅ | REQ-120 R3.5; V-1014 QK6; V-P2 p28 |
| K15 | Method on STOCK OUT | Transfer / Cash / Credit card | 🟡 **Default:** pre-set to Transfer, editable (C-b's rule applied here, as in the v3 prototype; C-b itself was ruled for the front office) | REQ-120 §9 C-b; v3 `stock-out.js` |
| K16 | Coaches + commission per item | the coach picker is an obvious control INSIDE the form (REQ-122 §6); commission per item, editable | 🟡 **Default:** coaches are picked once per bill and apply to every item; each item × coach amount is shown and editable (per item, §9.1). The edit range waits on Q1 (S24). v3 showed the commission per coach per bill, not per item. | REQ-122 §6; REQ-120 §9.1; v3 `stock-out.js` |
| K17 | Save | cuts the stock per line; posts SALES / F&B / OTHER revenue net of each item's discount; the admin's confirmation shows no revenue | ✅ | REQ-120 R3.5, R2.2; v3 `stock-out.js` |
| K18 | Selling more than the balance | not given | 🟡 **Default:** blocked, with a message to record STOCK IN first. → Q23 | — |
| K19 | Which location a sale cuts from | the form has "Branch", not "Location" | 🟡 **Default:** a Location field on STOCK OUT (default Bravo); Branch stays for revenue | v3 `stock-out.js`; REQ-120 R2.4 |
| K20 | **Cancelling / returning a STOCK OUT** | not given anywhere | 🔴 **Missing rule:** stock back? revenue reversed or a refund expense? commission removed from whose slip, and what if the slip is already locked? → Q24 | REQ-120 R2.3 covers course refunds only |
| K21 | Stock Demo locations | STA · ABC · RIS · WA (Abbey) · KIS · Bravo, add more ("Add Location"); **Bravo leftmost, order settable** (*"เราต้องการเอา Bravo ไว้แถวซ้ายสุดและสามารถกำหนดตำแหน่งแต่ละที่เองได้ค่ะ"*); "Total" column; "Teaching equipment by site" removed | ✅ | REQ-120 R3.6; V-P2 p29 |
| K22 | Demo ± with history | who / when / From → To / reason; dates without a time | ✅ | REQ-120 R3.6; V3-F p28 |
| K23 | Demo moves | site ↔ site; sale → Demo; "Defect Product → Demo" with a reason (*"ของเสียหรือหาย ตัดออกไปเป็น Demo ค่ะและต้องใส่เหตุผล"*); Demo → sale | ✅ | REQ-120 R3.6; V-1014 QK7; V-D1 O9; V3-F p28 |
| K24 | Demo items vs sale products | Demo has its own categories/items (her ≈90-row list) AND receives sale products | 🟡 **Default:** a Demo item may link to a sale product by Model code. Only linked items can go Demo → sale; Demo-only items (cones, megaphone…) cannot | UNDERSTANDING §3.1; REQ-120 R3.6 |
| K25 | "Delete" = write-off | labelled Delete, keeps history with a reason; no hard delete | ✅ | REQ-122 §7.4 C-k; V-D1 O9 |
| K26 | Demo seed | categories and items editable, seeded from her sheet | ✅ (rule). The quantities per site are D13. | REQ-120 R3.6; `project-docs/customer-2026-10-11-meeting/sheet-STOCK.csv` |
| K27 | No Demo alerts | — | ✅ | V-1014 QK7 |
| K28 | Low Stock: core | every Monday, in the web, **per location** (*"ถ้าหลายที่ แจ้งเตือนของใกล้หมดแยกที่"*); "Setting" per type, editable: F&B 10 · Safety 1 · Miller 5 · Sock 1 · Shirt 1; recipients **chosen individually** (London + ฟีน) | ✅ | REQ-120 R3.7, §9.1; V-1014 QK3/K8; V3-F p29 |
| K29 | Low Stock details | not given: (a) Sock / Shirt are items under "Other", not categories; (b) types with no setting (Inlineskate, Bike, Bag, Miller vs Safety); (c) "below" vs "at or below"; (d) the time on Monday; (e) one setting for every location or per location | 🟡 **Defaults:** (a) Shirt / Sock / Bag become their own categories (or sub-categories); (b) no setting = no alert; (c) at or below (→ Q25); (d) 08:00; (e) one setting for all locations | REQ-120 R3.7; v3 `low-stock.js` |
| K30 | Stock Report | tabs "Sales History" · Balance (every location + a picker) · Movement (sales / stock-in / moves) over a period; "Search" · "Customer" · "Type"; Export; no revenue amounts | ✅ | REQ-120 R3.8; V-P2 p31; V3-F p30 |

**R3 count: ✅ 18 · 🟡 9 · 🔴 3** (30 rows).

---

## Part 3: F3 (multi-role, STAFF) + F6 (a web user for every coach)

| # | item | rule as it stands NOW | verdict | evidence |
|---|---|---|---|---|
| F3-1 | Several types per person + STAFF | "Role Setting" in the FRONT office (SOM SCHEDULE); the back office only reads it. Today the front office has ONE type per teacher and no STAFF (code fact, build cost, not a rule gap) | ✅ | REQ-120 R1.1, §5 F3; V-P1 p11; SURVEY §2 |
| F3-2 | PT + FL by day | PT Sat–Sun, FL Mon–Fri, automatic by the day (*"อัตโนมัติตามวัน"*); "Role by day" strip | ✅ | V-D1 O3; v3 `teacher-roles.js` |
| F3-3 | Public holidays on a weekday | not given | 🟡 **Default:** by the weekday (a Monday holiday is an FL day) | — |
| F3-4 | Other combinations (STAFF + FL, FT + FL) | the sheet had *"Nelson = staff (no merit) + FL วันธรรมดา"*; the rulings only cover PT + FL; the v3 Role Setting lets you tick any types | 🟡 **Default:** only PT + FL may be combined. → Q19 | UNDERSTANDING §1.1 row 2, S-4; REQ-120 R1.1 |
| F3-5 | When a type changes | not given; today `updateTeacher` overwrites the type with no history | 🟡 **Default:** effective-dated from a chosen date; past periods are recalculated with the old type | SURVEY §2 |
| F3-6 | Who changes roles | the admins themselves (*"เราสามารถเปลี่ยนเองได้ใช่ไหมคะ"*); CEO + admin | ✅ | V-1014 S1; v3 roles |
| F3-7 | **STAFF pay lines** | base + merit + commission (Skate bag only) + transportation + Other ±. **OT is listed for "FT · PT" only** | 🔴 **Missing rule:** can STAFF (the admins) get OT for overtime? The prototype's OT form lists people without a type rule. → Q18 | REQ-120 R1.2 OT row; v3 `entries.js` |
| F6-1 | User Setting | Create User (login name, email, temporary password) · Invitation · Reset password · status "NOT LOGIN YET"; CEO + admin | ✅ | REQ-120 §5 F6; V-P1 p12; V3-F p12 |
| F6-2 | What a coach sees | "Visible": My slip · Confirm (+ Notification Alert); "Authorization" heading; the "Invisible" row is not shown (*"ไม่ต้องขึ้นค่ะ ขึ้นแค่อันที่เขาดูได้ค่ะ"*) | ✅ | V3-F p12 |
| F6-3 | Admins' / STAFF's own slip | R0.1 says "a coach / employee … sees only their own slip" | 🟡 **Default:** every employee with a login, admins included, has My slip and confirms it, same deadline | REQ-120 R0.1 |
| F6-4 | How the invitation reaches a coach | v3 shows email; the coaches live on LINE | 🟡 **Default:** email invite + a temporary password the admin can also hand over; no LINE invite | v3 `coach-login.js` |
| F6-5 | One login per person | reuse the front office's users (`users.teacher_id`, at most one per coach), one sign-in for both apps | ✅ (a design fact) | REQ-120 C4; SURVEY §9 |

**F3/F6 count: ✅ 6 · 🟡 5 · 🔴 1** (12 rows).

---

## Part 4: R0 users / roles / visibility / notifications

| # | item | rule as it stands NOW | verdict | evidence |
|---|---|---|---|---|
| R0-1 | Roles | CEO (ฟีน) sees everything; an admin records items and stock and never sees a pay total or any revenue; a coach/employee sees only their own slip | ✅ | REQ-120 R0.1; V-1014 QS13 (*"ไม่ให้แอดมินเห็นค่าแรงของครูทุกคน"*) |
| R0-2 | **Who is which role** | the named people: ฟีน (CEO); London, Poo, Kung (admin/STAFF); **Khwan?** She types staff merit and runs the reviews. Her role is never stated | 🔴 **Missing DATA / rule:** the user list with roles (D19). Is Khwan CEO-level or an admin? → Q20 | REQ-120 R1.2 Merit row; V-D1 1.2 |
| R0-3 | Base + FL rates CEO only; admins see no coach pay | not shown at all for a role that can't see it: **hide, don't lock** (no "🔒 HIDDEN FOR ADMIN" / "Invisible" rows) | ✅ | REQ-120 R0.2; REQ-122 §10; V3-F p7, p12 |
| R0-4 | Blind admin entry | after a confirm, admins ADD items without seeing the slip (*"ทีมงานแก้ไขได้ แต่ต้องไม่เห็นทั้งหมด คือเพิ่มเข้าไปได้ โดยไม่เห็นเงินเดือนทั้งหมดของครู"*); they see only the amounts they type | ✅ | REQ-120 R0.3; V-1014 QS12. ⚠️ Her open question on Other Income: *"กดเข้าไป จะเห็นสลิปทั้งหมดใช่ไหมคะ"*. Answer: **no for an admin** (R0.2); yes for the CEO via Payment Detail. This is an answer to give her, not a ruling. |
| R0-5 | The commission edit exception | admins see and edit THIS sale's per-item commission on STOCK OUT, never a slip/total/pool | ✅ (ruled; range in S24) | REQ-120 §9 C-a, §9.1; PM.md 10-20 conflict 1 |
| R0-6 | CEO-only pages | Payment Setting · Monthly Payment · Payment Detail · Daily Training Report · Notification Setting. Admin: Employee / Employee Profile (without pay), Other Income, Role/User Setting, Stock | ✅ | v3 page `roles` (✓'d) |
| R0-7 | Admin and sale prices | an admin types the sale, so sees product PRICE and the bill's Price | 🟡 **Default:** an admin sees the prices of the products and of the sale being entered, never a revenue report/total; the Stock Report shows no amounts | REQ-120 R0.1; v3 `reports.js` |
| R0-8 | Own items always, no opt-out | *"ไม่ต้องติ๊ก Extra Hour ยังไงทุกคนก็ต้องได้รับแจ้งเตือนทั้งหมดที่ตัวเองได้ค่ะ"*; Extra Hour for FT/PT | ✅ | REQ-122 §7.3 C-h; V-P1 p9; V-D1 §0 |
| R0-9 | CEO/Staff receiving OTHER people's items by type | v3 Notification Setting (✓'d) still shows a "CEO and Staff" × type table (ฟีน: all; London: Low Stock). Silver's C-h (−2.2) assumed that table goes, leaving only a Low Stock list | 🟡 **Default:** keep a simple per-person type list for CEO/Staff, edited by the CEO (no coach matrix). See sizing (d) | V3-F p9; v3 `notify/settings.js`; PM.md 10-20 C-h |
| R0-10 | What an admin sees in a notification about someone's pay item | QS17 example: an admin subscribed to bonus/commission/OT. That conflicts with R0.2 if amounts show | 🟡 **Default:** an admin sees who / what / date, never the amount (the v3 help text says so). → Q21 | V-1014 S17; v3 `notify/inbox.js` |
| R0-11 | When computed items notify (Extra Hour, bonus) | not given | 🟡 **Default:** Extra Hour at day-end for that day; a bonus when the trigger happens; entered items on save | — |
| R0-12 | Low Stock recipients | chosen individually (*"B. เลือกเป็นรายคน (ตอนนี้คือ London กับพี่ฟีน)"*) | ✅ | REQ-120 §9.1; V3-F p29 |
| R0-13 | Notification Alert text | the Payment Detail wording (*"ใช้คำตามที่เราเคยแก้ใน payment detail ค่ะ"*); no time (*"ไม่ต้องใส่เวลานะคะ"*) | ✅ | V3-F p10 |
| R0-14 | Language | English everywhere (D2), full type words in headings, + her Thai explanatory lines verbatim where she wrote them (Payment Setting, Import, the Extra Hour line) | ✅ | REQ-120 §8 D2; V3-1 p3; V3-F p26 |
| R0-15 | Channel | in-web only; LINE only for the slip reminders | ✅ | REQ-120 R0.4, R1.5; v3 help |
| R0-16 | Dates | dd/mm/yy with the year, no time, everywhere she noted | ✅ | REQ-122 §7.1, §10 |

**R0 count: ✅ 11 · 🟡 4 · 🔴 1** (16 rows).

**TOTAL: ✅ 52 · 🟡 38 · 🔴 9** (99 rows).

---

## Stale text: the REQ/STATUS text still shows an OLD rule

| # | where | old text | replaced by |
|---|---|---|---|
| 1 | REQ-120 §1.2 table, Bonus 50 | "Two coaches on that first class share it: 25 each" | §9 C-e: a trial has one coach; no 25/25 |
| 2 | REQ-120 §1.2 table, Commission | "Not reduced by a discount. Set to 0 by hand when ฟีน pays cash" (as the whole rule) | §9 C-a + §9.1: editable PER ITEM by ฟีน + admins (range open, §9.2). "Not reduced automatically" still holds |
| 3 | REQ-120 R3.5 | "SALES RECORD", one Product, one Discount, "buyer" | STOCK OUT (REQ-122 §7.4) · a cart (§9 C-j) · per-item discount (§9.2) · Student / Other Customer |
| 4 | REQ-120 §9 table C-j | "ONE discount on the whole bill" | §9.2: per item |
| 5 | REQ-120 §9 table C-a | "⚠️ Conflicts with R0.2 … Asked back (Porter, 10-20)" | answered in §9.1, then contradicted in §9.2 (open again) |
| 6 | REQ-120 R0.4 | "subscribed to chosen types … plus Extra Hour for FT and PT coaches themselves" | C-h (REQ-122 §7.3): own items always, no opt-out. REQ-120 R0.4 was never updated |
| 7 | REQ-120 R1.7 | "A daily check-in report: hours cut + each coach's pay for the day" | C-g: Daily Training Report, teaching hours only + the coach total |
| 8 | REQ-120 R1.6 | Extra Hour "e.g. "14/10 = 6 Hr"" | V3-F p5 format, dates with the year; bonus grouped with counts |
| 9 | REQ-120 R3.6 | "write-off"; "broken sale goods → Demo" | C-k "Delete" (history kept); "Defect Product → Demo" (V3-F p28) |
| 10 | REQ-120 R0.2 | "(Widened 10-16 on Sober's catch.)" is right, but it does not mention the C-a commission exception | §9 C-a / §9.1 |
| 11 | REQ-120 layout | §10 (pricing) sits BETWEEN §9 and §9.1 / §9.2 | structural only; easy to miss §9.1 / §9.2 |
| 12 | REQ-122 §2 Salary | "Pay settings / Pay run / Slip / Admin entries / Daily check-in report" | §7.1 renames |
| 13 | REQ-122 §2 Stock | "Locations & balance"; "SALES RECORD (… Discount ฿/% … not reduced by the discount)" | the page is removed (§7.4); STOCK OUT, per-item discount, per-item commission edit |
| 14 | REQ-122 §2 Notifications | "settings matrix (person × type …)" | C-h |
| 15 | REQ-122 §7.3 C-a | "Allow any amount per sale (CEO only?)" | §9 (ฟีน + admins), §9.1 (per item) |
| 16 | REQ-122 §7.4 C-j | "one discount (฿ or %) on the sale; commission per line or per sale?" | §9.2 per-item discount; §9.1 per-item commission |
| 17 | REQ-122 §8 item 3 | "STOCK OUT = a cart (several items, ONE bill discount ฿ / %)"; "commission editable per sale" | §9.2; §9.1 |
| 18 | STATUS §3 Stock | "STOCK OUT cart with one bill discount; commission per item, admin may only LOWER" | per-item discount (§9.2); lower-only is CONFLICTED (§9.2). Only the bottom UPDATE block says so |
| 19 | STATUS §1, §4 | "she has ✓'d … pages 1–5 + 8 of 31"; the "v4 prototype" row; "v3 pages 6–7, 9–31: her review" | the UPDATE (10-25): ✓ 29/31, no v4 needed |
| 20 | v3 prototype Payment Setting (`settings.js`) | "Several sellers: … not reduced by a discount · set to 0 by hand when พี่ฟีน pays cash"; "Hours come from: The timetable, incl. ECA and camp" | her Thai text verbatim (V3-1 p3); the struck line |
| 21 | v3 prototype STOCK OUT (`stock-out.js`) | one bill discount; commission per coach per bill | §9.1, §9.2 |
| 22 | UNDERSTANDING §13.1 | "2 coaches on the first class → both get it"; "Low-stock … Today: ฟีน only" (§13.1 notifications) | a historical trail by design; superseded by O5 → C-e, and by K8 / §9.1 |

---

## (a) Questions for Khwan (A/B by consequence; no amounts, no prices)
Per the workspace memory, questions go to Khwan only, never to ฟีน. Batch them into one message (the "note it, then batch" rule).

1. **Admin edits a coach's commission on a sale** (her two answers differ: *"1 a"* in LINE on 10-21, *"B. ลดหรือเพิ่มก็ได้"* on v3):
   - A: an admin can only LOWER it; only พี่ฟีน can raise it.
   - B: an admin can raise or lower it.
2. **FL pay for a 1st Trial, a 1 HR class or an OTHER booking:**
   - A: each gets its own column on the Freelance Rate (more to fill in per coach).
   - B: each uses one of the existing five types, and Khwan says which. A trial taught by an FL is paid at that type's rate.
3. **FL rate for ECA / camp:**
   - A: the rate on the Employee Profile always pays; a different rate typed on an ECA in SOM SCHEDULE is ignored for pay.
   - B: a rate set on that ECA/camp in SOM SCHEDULE wins over the profile.
4. **A child doesn't show up and the coach was there:**
   - A: the hour still counts for the coach (FL pay, Extra Hour, Teaching Hours).
   - B: only sessions marked attended count.
5. **Extra Hour and ECA / camp hours** (she struck the line "incl. ECA and camp"):
   - A: ECA and camp hours still count toward Extra Hour; only the sentence leaves the screen.
   - B: they no longer count, so Extra Hour falls on ECA/camp days.
6. **A class that isn't a whole hour** (e.g. a day of 5½ teaching hours on a weekday):
   - A: Extra Hour pays the part hour pro-rata.
   - B: only whole hours count, so the half hour pays nothing.
7. **Trial bonus across activities:**
   - A: a trial in one activity followed by a course in ANOTHER activity still gives the trial coach the bonus.
   - B: only a course/voucher in the same activity as the trial.
8. **Bonuses around go-live:**
   - A: a trial (or old course) from BEFORE go-live still earns the bonus if the purchase/renewal happens after go-live.
   - B: both must be after go-live, so the first weeks pay fewer bonuses.
9. **What is a "renewal":**
   - A: any next course of the same child, any activity.
   - B: only a next course in the same activity/program; a switch to another activity pays no renewal bonus.
10. **Course ↔ voucher:**
    - A: course → voucher, or voucher → course, counts as a renewal.
    - B: neither counts. Only course → course pays.
11. **What triggers "Who get Bonus?":**
    - A: only a real coach change (the admin marks it); a substitute for a session or two leaves the first coach in place with no question.
    - B: any session taught by someone else makes the renewal a Special Case for the admin to decide.
12. **Special Case where one of the two coaches can't get a bonus** (an FL, or a PT on an FL day):
    - A: the eligible coach gets the whole bonus.
    - B: the ineligible half is simply not paid.
13. **"หากจ่ายสด กรอก 0":**
    - A: someone types 0 by hand when พี่ฟีน pays the commission in cash.
    - B: the system sets the commission to 0 automatically whenever the sale's Method is Cash.
14. **A Full-time coach who LEAVES mid-month:**
    - A: still gets a full share of the Full-time pool.
    - B: gets no share; the pool is split among those still Full-time at month end.
15. **Base salary for someone who joins or leaves mid-month:**
    - A: the full base shows; the CEO adjusts it with Other ±.
    - B: the system pro-rates it by days.
16. **Car trips:**
    - A: one distance per school (the motorbike km); the admin types the car km on that trip when it differs.
    - B: each school stores two distances (motorbike + car) and the system picks one by vehicle.
17. **An item added after a coach confirmed (or after AUTO-LOCKED):**
    - A: it goes into this month's slip, which the coach is not asked to confirm again.
    - B: it goes into next month's slip.
18. **OT for STAFF (admins):**
    - A: STAFF can get OT with the same formula.
    - B: STAFF never get OT; only Full-time / Part-time.
19. **Someone who is STAFF and also teaches on weekdays:**
    - A: allowed: STAFF salary + Freelance hourly pay on weekdays.
    - B: not allowed; a person is either STAFF or a coach.
20. **What Khwan herself sees:**
    - A: like พี่ฟีน: every slip, base salaries, revenue.
    - B: like an admin: she enters items but sees no pay totals and no revenue.
21. **An admin who is told about a coach's item** (e.g. a bonus):
    - A: the alert says who / what / date only, with no amount.
    - B: the alert shows the amount too.
22. **Excel import and stock quantity:**
    - A: a quantity column in the file REPLACES the balance (use it for the opening count).
    - B: the file never changes quantities; only STOCK IN / STOCK OUT do.
23. **Selling more than the system shows in stock:**
    - A: the sale is blocked until STOCK IN is recorded.
    - B: the sale goes through and the balance shows negative (in red).
24. **A wrong or returned STOCK OUT:**
    - A: a "Cancel sale" button puts the items back in stock and removes that sale's revenue and commission (history kept; if the slip is already locked, the commission comes off next month).
    - B: no cancel; it is fixed by a STOCK IN + a manual revenue line, and the commission stays.
25. **Low Stock alert threshold:**
    - A: alert when the balance is AT or below the Alert (Unit).
    - B: only when it is BELOW it.

**25 questions.** Already asked and still open: Q1 (STATUS UPDATE) and My slip. My slip is not re-asked here: build the default (S38) and let her look on UAT.

---

## (b) DATA CHECKLIST (from her / the CEO, to go live)

| # | what | why | format | blocking? |
|---|---|---|---|---|
| D1 | Staff list: name, nickname, type(s), role by day for PT+FL, vehicle, merit yes/no + schedule, email for the login | Employee Profile, F3, F6, the FT count for the pool | one sheet row per person | **YES** (Salary + logins) |
| D2 | Base salaries | the PT/FT/STAFF base, OT rate | **the CEO types them into the system at go-live** (not sent to the team) | YES for the first pay run; not for the build |
| D3 | Freelance Rate per person × class type (+ the answer to Q2) | FL pay | the CEO types them at go-live | YES for the first pay run |
| D4 | Commission groups × rate × eligibility by type, complete. Known: Miller Surfskate / Cruiser / Skateboard / Inline-skate (one group or four?), Animal Helmet, Miller helmet, Miller pads, Royal baby standard, Royal baby space shark, Skate bag, Chinese / Decathlon (none), F&B (none) | commission | a table: group · rate · FT / PT / FL / STAFF yes-no | **YES** (Stock go-live) |
| D5 | Her real product Excel: MODEL CODE · CATEGORY · PRODUCT NAME · COMMISSION group · PRICE · NOTE (+ PICTURE files) | the first import; the import format is designed from it | her .xlsx | **YES** (Stock); STATUS §4 |
| D6 | Opening balance per product per location on the go-live date | balances, Low Stock | a quantity column in D5 (if Q22 = A) or a count sheet | **YES** |
| D7 | Product pictures | the PICTURE column | image files named by Model code | no |
| D8 | The final category list, incl. whether Shirt / Sock / Bag are categories | the Low Stock "Setting" per type | a list | yes (Low Stock) |
| D9 | Low Stock settings for the types without one (Inlineskate, Bike, Bag, …) | alerts | type → Alert (Unit) | no (default: no alert) |
| D10 | Low Stock recipients | given: London + ฟีน | — | no ✅ |
| D11 | Sale-stock locations | given: Bravo | — | no ✅ |
| D12 | Demo locations + their order | given: STA · ABC · RIS · WA (Abbey) · KIS · Bravo (Bravo first) | — | no ✅ |
| D13 | Demo items with the quantity at each site (the sheet has names, no counts) | the Demo seed | item × site matrix | yes (Demo go-live) |
| D14 | School list + one-way distance (motorbike km), + car km if Q16 = B | transportation | school · km | **YES** (transportation) |
| D15 | Pay-period examples: February (incl. leap), a 31-day month, and the FIRST period after go-live | to prove the cycle | 3–4 date ranges in her words | yes (pay cycle only); STATUS §4 |
| D16 | Go-live date + whether the first period is partial | the first slip, D6 bonuses, FT pool | a date | **YES** |
| D17 | Merit eligibility per person + the next teacher round (given: 11/26) | Merit display | part of D1 | no |
| D18 | The map of every front-office program/class kind → Private / Duo / Group / ECA / Camp (incl. 1st Trial, 1 HR, OTHER) | FL pay, the Program column | a table | **YES** (FL pay) |
| D19 | Users and roles: who is CEO-level, who is admin (London, Poo, Kung, Khwan?), who is coach-only | R0 visibility | a list | **YES** |
| D20 | The CEO/Staff notification types per person (ฟีน: all; London: Low Stock; others?) | Notification Setting | a list | no |
| D21 | Which coaches have linked LINE (`teachers.line_user_id`) | the 09:00 / 11:00 reminders | a DATA REQUEST via the owner (bare SQL, owner runs it) | no |
| D22 | How many coaches already have a web login | the F6 roll-out | a DATA REQUEST (the survey's SQL, `SURVEY-frontoffice-…` §9) | no |
| D23 | A sample of the Excel summary she wants + a logo/heading for the PDF | the Payment Detail export | a sample file | no |
| D24 | Payment methods / branches | given: Transfer · Cash · Credit card; Bravo · Other | — | no ✅ |

**24 data items** (4 are already given ✅: D10, D11, D12, D24). **Blocking: D1, D4, D5, D6, D14, D16, D18, D19** (+ D2, D3 for the first pay run).

---

## (c) Screen words still undecided (in these parts)
1. **My slip (page 6):** every word unreviewed ("My slip", "Confirm this slip", "Tell an admin", "Confirm by …").
2. **The Payment Detail export:** the button names (Excel / PDF), the section names in the Excel beyond "Bonus" and "Extra Hour" (Base, Teaching Hours, Commission, Transportation, OT, Merit, Other, TOTAL), and the subtotal label. Never shown.
3. **Employee Profile "Bonus" heading:** what the line says (S2).
4. **The FT commission label** *"All — shared among employees"*: it reads as "among all employees", but the rule is among Full-time only. Keep her words, or ask?
5. **The Special Case wording** differs by place:
   - Payment Setting: *"1st Coach & 2nd Coach share 50% (When changing coach)"* (V3-1 p3);
   - F4: "Who get Bonus?" with "1st Coach : Kid · 2nd Coach : Poo · Share : 50 / 50" (V-P1 p15).
   
   The words on the Payment Detail bonus line are undecided.
6. **"Renewal Voucher: NO":** the exact display on Payment Setting (S16).
7. **Her Thai text has typos** (*"Minumum"*, *"รถยนตร์"*): paste verbatim, or correct? (owner/Porter)
8. **Other Income banner:** her text `Kid already confirmed slip of "period"`. The real rendering is undecided (the period format, and the hidden total removed).
9. **STOCK OUT per-item discount column** (label, ฿/% toggle per line) and the **per-item × coach commission grid** labels. Never shown (v3 had a bill discount and a per-bill commission).
10. **STOCK OUT "Location"** (which stock is cut) vs "Branch". Never shown.
11. **Low Stock:** the per-person recipient picker (v3 shows only "To:" badges), and whether "Setting" is per location.
12. **Notification Setting:** the CEO/Staff table as an EDITABLE control (v3 is display only).
13. **Notification Alert line texts:** "use the Payment Detail words". The concrete lines per type were never shown.
14. **Cancel sale / correct STOCK IN** (if Q24 / K6 are built): no words exist.
15. **Payment Detail "Program" content format** (e.g. "Inline Skate · Private").

---

## (d) v3 notes vs the 10-20 re-size (Silver, `inbox/PM.md` 10-20; baseline R1 43.1 · R3 37.0 · R0 12.7)

| # | v3 change | delta (eng-days, +10% incl.) | reason |
|---|---|---|---|
| 1 | Per-ITEM discount replaces the bill discount (§9.2) | **−0.3** (−0.3…0) | C-j's +3.3 included spreading one bill discount over the lines for revenue; a per-line discount drops that, and adds a field + validation per line |
| 2 | Commission edited per item × per coach (§9.1), not per coach per sale (C-a +0.8) | **+0.5** | a grid instead of one column; the per-item audit; the FT-pool posting per line |
| 3 | Admin range rule (Q1) | **+0.1 / 0** | lower-only = one validation + a CEO bypass; raise-or-lower = none |
| 4 | **Payment Detail export:** Excel summary + full PDF (NEW) | **+2.0** (±0.5) | two generators; a PDF with Thai fonts and the itemised layout; the per-section subtotals. STATUS calls it "small"; the PDF is the cost |
| 5 | Payment Detail format: bonus grouped with counts, Program column, the Thai Extra Hour line, every day listed | **+0.4** | grouping/count logic + layout; nothing new in the data |
| 6 | Employee Profile "Bonus" heading | **+0.2** (+0.6 if it becomes a per-person switch) | read-only display by default |
| 7 | Notification: the CEO/Staff × type table survives in v3 (✓'d) | **+0.8** | a partial give-back of C-h's −2.2: a small editable per-person type list (no coach matrix, no opt-outs) |
| 8 | Hide instead of 🔒 for roles | **0** (−0.1) | removes placeholders |
| 9 | Thai explanatory text verbatim (Payment Setting, Import) | **+0.1** | static text |
| 10 | "Reminder" button (manual LINE reminder) | **+0.3 if not already in Sober's line** | reuses the scheduled reminder; 🟡 check his 10-15 sizing |
| 11 | "Export" on Daily Training Report and Stock Report (in the ✓'d v3) | **+0.6 if not already sized** (0.3 each) | 🟡 check the 10-15 lines; the Product export is in R3.4 already |
| 12 | Dates without times, renames, Stock Demo "Defect Product → Demo", Import "Apply" | 0 | labels written anyway (D2) |
| 13 | My slip unanswered | 0 (risk +0.5) | built as v3 |

**Firm: ≈ +3.8 d** (items 1–9). **With items 10–11 if unsized: ≈ +4.7 d.**

**Answer-dependent, not yet counted:**
- Q24 A (cancel sale incl. a commission reversal across locked slips): **+1.0–1.5**;
- Q9 / Q10 / Q11 if renewal detection widens (cross-activity, voucher ↔ course, substitute filtering): **+0.5–1.0**;
- Q22 A (the import sets quantities): **+0.3**;
- Q16 B (two distances): **+0.2**;
- Q18 A / Q19 A (STAFF OT, STAFF + FL): **+0.3–0.8** (F3 type combos in the front office).

**Ceiling ≈ +8.5 d.**

Note: REQ-120 §10 records the owner's commercial terms. Whether these deltas change them is the owner's call, not the SA's.

Out of scope here but noticed: the v3 F4 Conversion page note "the month's detail split by bonus 50/100" (V3-F p15) feeds the bonus lines. The F-part SA should size it.
