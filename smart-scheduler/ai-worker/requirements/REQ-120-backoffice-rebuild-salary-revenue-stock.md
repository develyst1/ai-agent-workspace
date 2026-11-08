# REQ-120: The back office, rebuilt for THIS school: Salary · Revenue · Stock (+ reports later)
**Status:** REQUIREMENTS AGREED BY THE CUSTOMER, 2026-10-15. Her two rounds:
- the confirm page (10-14);
- spec draft 1 (10-15): all 13 blocks marked "ตรง", O1–O11 ruled.

**Next:** sizing by the SAs → **the owner's resources / timeline / budget talk with the customer** → build. **Nothing is built before the owner says so.**

**Owner direction (2026-10-13, verbatim in `UNDERSTANDING-backoffice-2026-10-13.md` §10):** *"รื้อเยอะเลยดีกว่า … ที่เขาต้องการคือ ระบบuniqe Backoffice … for frontoffice and manual stock in and out and unique REVENUE + SALARY"*.

**Sources, in order of weight:**
1. Khwan's answers, verbatim:
   - `project-docs/customer-2026-10-13-backoffice-confirm/khwan-answers-2026-10-14-VERBATIM.md`;
   - `project-docs/customer-2026-10-14-backoffice-spec-draft/khwan-answers-draft1-VERBATIM.md`.
2. The agreed rough spec: `project-docs/customer-2026-10-14-backoffice-spec-draft/backoffice-spec-draft.html`.
3. The reasoning trail: `UNDERSTANDING-backoffice-2026-10-13.md` §1–§15.
4. Code facts:
   - `SURVEY-backoffice-repos-2026-10-13.md`;
   - `SURVEY-frontoffice-data-for-backoffice-2026-10-13.md`;
   - `GAP-backoffice-salary-stock-2026-10-13.md`;
   - `GAP-backoffice-revenue-2026-10-13.md`;
   - `tests/TEST-102-sid-backoffice-walkthrough.md`.

**Where a line here and her verbatim words disagree, her words win, and this file is wrong.**

---

## 0. Roles, visibility, notifications, language
- **R0.1 Roles:**
  - **CEO (พี่ฟีน)** sees everything;
  - an **admin** records items and stock but **never sees a coach's pay total or any revenue**;
  - a **coach / employee** logs in with **their own user** and sees **only their own slip**.
- **R0.2 Pay visibility.** Base salary is visible to the **CEO only**. **Admins see NO coach pay at all**: no base, no FL rates, no slip totals (Khwan QS13: *"ไม่ให้แอดมินเห็นค่าแรงของครูทุกคน"*). Admins only ADD items, blind (R0.3). (Widened 10-16 on Sober's catch.)
- **R0.3 Admin entry is blind:** after a coach confirms, the team may **add** items to a slip without seeing the slip's total.
- **R0.4 Notifications are in the WEB, per person and per type.** Each staff member is subscribed to chosen types:
  - **Bonus · Commission · Transportation · OT · Other · Low Stock**;
  - plus **Extra Hour** for FT and PT coaches themselves.
  - Today: ฟีน gets all types; London gets Low Stock.
  - A coach is always notified of their own items.
- **R0.5 English labels** in the back office, at least for those types and the report columns. **The owner confirms** whether the whole back office is English.

## 1. Salary
### 1.1 People and roles
- **R1.1 Types:** FT · PT · FL · STAFF. **One person may hold PT + FL**: PT on **Sat–Sun**, FL on **Mon–Fri**. The role of a class is **automatic by its day**.
- **R1.2 Per person:**
  - type(s);
  - base salary (CEO only);
  - **FL hourly rates per person AND per class type** (Private / Duo / Group / ECA / Camp);
  - merit eligibility;
  - vehicle (car / motorbike).
- **R1.3 Commission eligibility is by TYPE and product group.** STAFF today: Skate bag only.

### 1.2 Pay lines
| line | who | rule |
|---|---|---|
| Base salary | FT · PT · STAFF | set by the CEO |
| **FL teaching pay** | FL role only | timetable hours × that person's rate for that class type |
| **Extra Hour 350 ฿/hr** | FT · PT (PT days only) | **per day**: weekday from the **5th** teaching hour, weekend from the **6th**. Hours come **from the timetable, incl. ECA and camp** |
| **OT** | FT · PT | **salary ÷ 26 ÷ 8 × 1.15** per hour × hours entered by an admin. **Non-teaching work only** |
| **Merit** | chosen people (staff today: Admin Poo / Kung) | amount typed. **Teachers' merit is entered by Admin Poo** (every 3 months, next 11/26); **staff merit by Khwan or ฟีน** (monthly) |
| **Bonus 50** | FT · PT (PT-day classes only) | the child finishes a 1st Trial, then opens a **course OR a voucher**, with **no time limit** → the first coach of the trial. **Two coaches on that first class share it: 25 each** |
| **Bonus 100** | FT · PT (PT-day classes only) | a **course renewal** → the first coach of the old course. If the coach changed mid-course, **the admin chooses**. **Voucher after voucher is NOT a renewal** |
| **Commission** | everyone eligible | from SALES RECORD: by **product group**. Several sellers split it equally. **The FT shares go to the FT pool**, split equally among all FT at month end (a mid-month joiner gets a full share). PT / FL / admin keep their own. **Not reduced by a discount.** Set to 0 by hand when ฟีน pays cash |
| **Transportation** | **everyone who drives** | per trip: school (the system **stores each school's distance, editable**) · one-way / round trip · **car 6 ฿/km, min 60 · motorbike 3 ฿/km, min 40** |
| **Other ±** | anyone | amount + **reason**, required |

### 1.3 The cycle and the slip
- **R1.4 Pay period:** from the **last day of the previous month** to the **day before the last day** of this month (*"30/9-30/10"*).
- **R1.5 Confirm by the last day of the month, before 12:00.**
  - LINE reminders at **09:00 and 11:00** that day.
  - Not confirmed → **paid as shown, no edits**.
  - Disputes go to an admin directly.
- **R1.6 Every line itemised** (her words: *"ทุกรายการต้องขึ้นดีเทลนะคะ"*):
  - Extra Hour **per date** (e.g. "14/10 = 6 Hr");
  - teaching hours **with who was taught**;
  - each bonus **with the child's name**;
  - each transportation trip in full.
- **R1.7 A daily check-in report:** hours cut + each coach's pay for the day.
- **R1.8 Month-end reports:** each coach's teaching summary; everyone's salary + other income.

## 2. Revenue (seen by the CEO only)
- **R2.1 Types → categories, from her list.** **She can add more.** The sub-level **Private / Duo / 1 HR applies to every sport.**
- **R2.2 When each kind counts:**
  | kind | when it counts |
  |---|---|
  | course · voucher | **the whole amount on the CONFIRM date** (in practice the day they are paid) |
  | trial | at confirm |
  | camp | per child per week, at confirm |
  | **ECA** | per term: **price per class × students × classes per term** (ฟีน enters). It counts on **the date the school pays** |
  | **Rent** | from the Rental bookings |
  | **Park fee** | an **Other** booking that charges and blocks the timetable, with a **"No Teacher"** teacher |
  | **Birthday** | an Other booking + revenue typed by hand |
  | SALES · F&B · OTHER | **from SALES RECORD automatically**, net of discount |
  | manual line | type + category + amount + remark |
- **R2.3 Refund** = an **expense in the month of the refund**. **Pause** changes nothing.
- **R2.4 Every line stores the branch** (Bravo; "Other" = future branches, **chosen by the admin at booking**) **and the payment method** (Transfer / Cash / Credit card).
- **R2.5 The report:**
  - **the first page summarises by type**;
  - a click-through lists **every single line**, with columns **Date · Branch · Type · Category · Product Name · Amount · Payment · Remark**;
  - daily, **MTD, YTD**, real-time;
  - filters: branch · period (day / month / custom) · type · category.

## 3. Stock
- **R3.1 Products:** Model code · Product Name · category · commission group · price · picture · note.
  - Categories: **Miller division (INCLUDING Miller helmets and pads)** · Inlineskate · Bike · **Safety (every non-Miller helmet and pad)** · F&B · Other (Shirt, Sock, Bag). Categories can be added.
  - **Commission is per GROUP.** ✅ **O12 RULED (Khwan, 2026-10-15 21:39):** *"40 แหละค่ะ แต่แยกจาก Animal Helmet ค่ะ ค่าคอมเท่ากันแต่คนละอันกันค่ะ"*. ⇒ **Miller helmets are their OWN group, at 40**, separate from Animal Helmet (also 40). **Pads too:** *"สนับมิลเลอร์ก็ 40 นะคะ"* (21:58), so Miller pads are also 40.
- **R3.2 Stock In:** product + **quantity + date**. **No cost price, no profit.**
- **R3.3 Several sale-stock locations** (one today).
- **R3.4 Excel import matches by Model code:** it updates existing products, adds new ones, and **never deletes history**. Export too. Manual add.
- **R3.5 SALES RECORD:**
  - **Product** · buyer (picked from the system **or** typed) · branch;
  - **Discount** (฿ or %) · **Payment** (Transfer / Cash / Credit card) · remark;
  - **coaches earning commission** (several → split).
  - Saving it cuts stock and posts revenue.
- **R3.6 Stock Demo** is separate from sale stock:
  - sites STA · ABC · RIS · WA (Abbey) · KIS · Bravo, and more can be added;
  - ± with a history (who / when / from → to / reason);
  - moves between sites; **sale → Demo** (also **broken sale goods → Demo, with a reason**); **Demo → sale**;
  - **write-off** of lost or broken Demo items, with a reason;
  - categories and items editable, seeded from her sheet.
  - **No alerts.**
- **R3.7 Low Stock** every **Monday**, in the web, to the chosen people (today London + ฟីน):
  - **per location**;
  - thresholds per type, editable: F&B 10 · Safety 1 · Miller 5 · Sock 1 · Shirt 1.
- **R3.8 Reports:** sales history · balance · movement (sales / stock-in / moves) over a chosen period.

## 4. Back-office reports (last)
Headings: **REPORT · STOCK · CHECK IN · COURSE · SALARY · STUDENT**. Each one's content is agreed with her when this part starts.

## 5. Front-office changes the back office needs (she marked them "ตรง")
| # | change |
|---|---|
| F1 | **branch at booking** (default Bravo) |
| F2 | **a payment record** at confirm / sale: date · amount · **method** |
| F3 | **multi-role coaches** (PT weekend + FL weekday) and the **STAFF** type |
| F4 | **the first coach** of a trial and of a course, plus **the trial → course/voucher link and the course → renewal link** (for bonuses) |
| F5 | a **"No Teacher"** teacher for park-fee blocks |
| F6 | **a web user for every coach**, to see and confirm their slip |

## 6. Constraints the design must carry (code facts, not choices)
- **C1:** the scheduling back **writes `bo.item` / `bo.movement` directly, in the same DB**:
  - the freelance ceiling, inside the booking transaction;
  - every sale (course, voucher and camp at SALE; trial, 1HR and OTHER at day-end ATTENDED; rental at the paid press);
  - undo reversals.

  A rebuild either keeps those tables as a bridge or changes those write points **in the same release**. **R2.2 "at confirm" is a scheduling-back change first.**
- **C2:** today's postings **reverse nothing** except an attendance undo (cancel, pause, end, voucher-end do not). R2.3 needs refunds as expenses.
- **C3:** **no payment record, no trial/renewal link, no branch, no multi-role, no booking history exist** today (Silver's survey). F1–F4 are new data.
- **C4:** the current back office has **one shared admin login with no role check**. R0 needs real per-person users and roles. The front office already has users and roles.
- **C5:** the current back office's auth falls back to `admin/admin` when env is unset (`routes/auth.ts:11-19`). **The owner is checking uat's env.**

## 7. Open
- ~~O12~~ ✅ ruled 10-15 (R3.1).
- **For the owner:**
  - whole back office in English (R0.5)?
  - bridge or replace `bo.*` (C1)? This is decided with the sizing.
  - money and timeline.

## 8. Decisions D2–D6, ruled by the customer (2026-10-16)
Verbatim: `project-docs/customer-2026-10-15-backoffice-scope-and-decisions/khwan-answers-q1-q5-VERBATIM.md` (+ PDF). Asked as A vs B with business consequences, no money (owner, 10-15). **D1 was not asked:** it is technical, and the bridge is used (owner's page, +3 d).

| D | ruling | what changes here |
|---|---|---|
| **D2 language** | **A: English for the whole back office**, incl. the coach's slip page | R0.5 settled: no Thai/bilingual work |
| **D3 camp revenue** | **B: a separate "confirm camp" button**. Revenue counts on the date the admin confirms | ⚠️ **NEW work, not in the sizing:** a camp confirm step (front office + back) |
| **D4 payment record** | **A: required, front AND back.** *"การขายคอร์สจะถูกบันทึกมาจากหน้าบ้าน (SOM SCHEDULE) เมื่อเราซื้อคอร์สรายรับจะเข้าหลังบ้านเลย · การซื้อสินค้าซื้อจากหลังบ้าน พร้อมตัดสต็อก · ต้องใส่ข้อมูลให้ครบค่ะทั้งหน้าบ้านและหลังบ้าน = วันที่รับเงิน · ยอด · วิธีจ่าย"*. **Installments:** *"ปกติไม่มีแบ่งจ่ายเป็นงวดค่ะ แต่จะเปิดไว้ก็ได้ค่ะ"* | F2 is mandatory: no confirm/sale without date + amount + method. ⚠️ **Partial payments "may be left open":** an optional extra, not in the sizing |
| **D5 cut-over** | **A: revenue starts on day 1 of the go-live month.** Earlier data stays in her Excel | no import of old revenue |
| **D6 bonus history** | **Neither A nor B:** *"ไม่เอาทั้งคู่ค่ะ เริ่มนับเฉพาะวันที่ระบบเสร็จเลยไม่ทำย้อนหลังค่ะ"* | bonuses only for cases that start after go-live; no back-fill, no manual bonus lines for old cases |

**Sizing deltas to measure:** D3 (camp confirm step) and D4's optional installments. Both are additions to Silver's 84-day block. D2 and D6 can only shrink it.

## 9. Prototype-round rulings (Khwan, LINE, 2026-10-20 ~10:00, the owner's screenshot), answering the 5 confirmations
Asked in `COPY-DRAFT-khwan-proto-part1-status-2026-10-19.md`. The analysis is in REQ-122 §7.3 / §7.4. Her answers, verbatim:
> 1. B · 2. A · 3. C · 4. ยกเลิกเฉพาะคาบที่ยังไม่ได้เรียนค่ะ และแจ้งผู้ปกครองด้วยค่ะ · 5. Trial มีครูเดียวเสมอค่ะ ส่วนการต่อคอร์สที่เปลี่ยนครูกลางคอร์สได้โบนัส 100 แอดมินเลือกให้ ครูคนแรก / ครูคนที่สอง / แบ่ง 50/50 ถูกค่ะ แอดมินเลือกค่ะ

| # | ruling | changes |
|---|---|---|
| C-a | **1 = B: the commission can be edited per sale, by ฟีน AND the admins** | R1.2 "not reduced by a discount" → editable per sale. ⚠️ **Conflicts with R0.2** (the admins see NO coach pay): the admin would see and type a coach's commission. **Asked back (Porter, 10-20)** |
| C-j | **2 = A: STOCK OUT sells several items, with ONE discount on the whole bill** (฿ or %) | R3.5 single product → a cart. Revenue nets the bill's discount across its lines |
| C-b | **3 = C: Payment Method defaults to Transfer, editable in the FRONT and the BACK** | **D4 "required at confirm" is REVERSED.** No daily confirming; edits in both places |
| C-f | **4: a refund cancels the course's UNATTENDED sessions only, and the families ARE told** | R2.3 + a front-office cancel. It reuses the family cancel notice |
| C-e | **5: confirmed.** A trial always has one coach, so the Bonus 50 "25/25" case is gone. A renewal after a mid-course coach change = Bonus 100, and the admin picks 1st / 2nd / 50-50 | R1.2 bonus rows |

## 10. Pricing method (owner, 2026-10-22)
**Owner's method, 2026-10-22, verbatim:** *"ฉัน อยากรู้ว่า frontoffice + backoffice ที่ทำไป ตอนนี้ นับเป็นกี่วัน · ให้จำนวนวันนั้น = 73000 เอามาหาร จำนวนวัน จะตกวันละเท่าไหร่ · แล้วเอา ราคาต่อวันนั้น อ่ะ มา คูณ กับ backoffice new - backoffice old"*. So: **rate = 73,000 ÷ (FO_now + BO_old)**; **price = rate × (BO_new − BO_old)**.
- **BO_new** = ≈174.6 d (Silver's re-size, 10-20; Sober to confirm his lines).
- **FO_now** and **BO_old** = what exists today, sized AS IF BUILT FROM ZERO, in the same unit (engineer-days, estimate + 10%, build + tests): **Sober sizes FO_now, Silver sizes BO_old** (re-split 10-22).
- **Numbers (2026-10-22):**
  - **FO_now ≈ 240 d.** Sober's 252 − module 9 (C1, 12.1), which moves to the BO_old side per Silver.
  - **BO_old ≈ 51 d** (Silver).
  - **BO_new from zero ≈ 200 d.** The 175 d is incremental, + 24.9 of the BO_old parts it reuses. Silver quotes 200; with the partial reuses it is ≈ 209.
  - **Palm's screens ≈ 16.5 d**, listed apart.
- **Owner's formula, without Palm:**
  - rate = 73,000 ÷ 291 ≈ **251 ฿/d**;
  - price = 251 × (200 − 51 = 149) ≈ **37,400 ฿**.
- **With Palm counted:** 73,000 ÷ 307.5 ≈ 237 ฿/d → ≈ **35,400 ฿**.
- **With BO_new at 209:** ≈ 39,600 ฿.
- **Owner, 2026-10-22, the permission adjustment:** *"เขาจ่ายค่างาน permission user role แยก · เอา 3500 ไปตีเป็นวัน แล้วเอาไปตัดวันหน้าบ้านออก"*.
  - 3,500 ฿ is converted at the package's own rate: r = 76,500 ÷ 291 ≈ 263, so 3,500 ÷ 263 ≈ 13.3 d.
  - FO = 240 − 13.3 = 226.7. Package days = 277.7. **Rate ≈ 263 ฿/d.**
  - **Price = 149 × 263 ≈ 39,200 ฿** (Palm's screens not counted). The owner OK'd it ("ok").
  - The write-up for Palm: `COPY-DRAFT-palm-backoffice-pricing-method-2026-10-22.md`.
- **Owner, 2026-10-22: "นับสิ"** (count the excluded items).
  - **Palm's screens:** in FO, so FO = 252 − 12.1 (C1) + 16.5 = 256.4.
  - **QA / deploy / UAT:** a flat % on all three sides. Silver 25 %, Sober 30 %; **25 % is used**. A flat % cancels out of the price.
  - **The §4 reports, ROUGH ±50 %:** Silver 8.8 + Sober 13.75 + a shared frame 2.2, counted once = 24.75.
  - **Result at 25 %:** rate ≈ 199 ฿/d; growth = (199.5 + 24.75) × 1.25 − 50.9 × 1.25 = 216.7 d; **price ≈ 43,200 ฿**, range ≈ 40,000–46,000 by the reports' margin.
- **CORRECTION, owner 2026-10-22:** *"ฉันหมาย ถึง ยอมนับรวมเข้าไป โดย ไม่ต้องคิดวันเพิ่ม"*. QA / deploy / UAT, the §4 reports and Palm's screens are **included in the price with NO extra days**. The ≈43,200 line above is SUPERSEDED. **The price stays ≈ 39,200 ฿** (rate ≈ 263 ฿/d × 149 d).

### 9.1 The 4 follow-ups, answered by Khwan 2026-10-21 11:21 (LINE; Porter MISSED it until the owner's screenshot, 10-25). Verbatim: *"1 a · 2 a · 3 คอร์สเปลี่ยนเป็นยกเลิกใช่ค่ะ ว้อยเชอร์เหมือนกันค่ะ · 4 เลือกเป็นรายคนค่ะ"*
| # | ruling |
|---|---|
| C-a | an admin may only **LOWER** a sale's commission (never raise it) |
| C-j × C-a | in a multi-item bill, the commission is edited **per item** (e.g. only the defective board) |
| C-f | a refund sets the **course status to CANCELLED** (+ cancels the unattended sessions, families told). **A voucher refund works the same way** |
| R3.7 | the Low Stock Monday alert goes to **people chosen individually** (today London + ฟีน) |

### 9.2 v3 round (Khwan 10-25, *"ครบแล้วค่ะ V3"*)
- **The STOCK OUT discount = PER ITEM** (supersedes the 10-20 bill-discount A).
- **Admin commission edit: CONFLICT** (LINE 10-21 lower only vs prototype B raise or lower): asked.
- **NEW: the Payment Detail export:** Excel = a summary per section (e.g. Bonus + Subtotal), PDF = everything incl. the details.
- Detail in REQ-122 §10.

### 9.3 The last 2 points (Khwan, LINE 10-25 15:02), verbatim: *"จริงๆ คงมีแต่ลดค่าคอมได้อย่างเดียวค่ะ ถ้าตามการใช้งาน แต่ขวัญคิดว่าใส่เพิ่มไว้ได้ด้วยก็ไม่เสียหายค่ะ เผื่อๆไว้ 🙏 ขออภัยที่ทำให้สับสนค่ะ · My slip ถ้าขึ้นตาม payment details ก็ตามนั้นเลยค่ะ"*
- **Admin commission edit = B: lower OR raise** (per item, on that sale's line only; the admin sees no pay totals).
- **My slip = the same content as Payment Detail** (the coach's own; confirm).
⇒ **All the rules and screens are agreed. SPEC CLOSED** (words / format notes go into the build). The build waits for the owner's price talk + GO.

### 9.4 The 6 build questions, answered by Khwan (LINE, 2026-10-28; the owner's screenshots). Verbatim: *"1a · 2b · 3a · 4a · 5a · 6ขอรีเช็คกับพี่ฟีนอีกทีค่ะ"*, then *"6b kaa @Dong_08"*
Questions: `COPY-DRAFT-khwan-backoffice-build-questions-2026-10-27.md` → SHORT VERSION.
| # | question | ruling | team Q |
|---|---|---|---|
| 1 | a course sold before go-live, confirmed after | **A:** the system counts it on its confirm date (she leaves it out of her Excel) | B6 |
| 2 | a confirmed 1st Trial later cancelled / a no-show | **B:** the revenue stays; money back goes through Refund | B1 |
| 3 | a child no-show, the coach was there | **A:** the hour counts for the coach | A4 |
| 4 | a trial or renewal into a DIFFERENT sport | **A:** the bonus is paid across sports (Bonus 50 and Bonus 100) | A7 / A9 / B2 / B3 |
| 5 | when "coach changed mid-course" (Special Case) applies | **A:** only a real whole-course teacher change; a 1–2 day cover does not count | A11 / B4 |
| 6 | what Khwan herself sees | **B:** like an admin; she enters items but sees no pay totals and no revenue (checked with ฟีน) | A20 |
- Every other readiness question = the SA's stated default (owner, 2026-10-27). A10 (course ↔ voucher) was not asked, so its default stands.

## 11. The customer's block order, before the meeting (LINE group, 2026-11-05 00:11, the owner's screenshot; kn = Khwan, replying to the agenda the owner posted)
Verbatim:
> ขวัญน่าจะไม่เห็นข้อความนั้นเองค่ะ ขอโทษค่า ยังไงเดี๋ยวขวัญเช็คให้และ feedback กลับนะคะ

> อันนี้เราจะทำเป็น เงินเดือน รายได้ สต็อก ตามลำดับนะคะ
> แจ้งเพิ่มเติมค่ะ
> เงินเดือนก้อนแรก อยากให้เรียงทำแบบนี้ เอาเรื่อง ฐานเงินเดือน / Extra hour / Bonus คอร์สต่อคอร์สขึ้นมาก่อนค่ะ
> ** โบนัสให้เริ่มจาก 100 ก่อนนะคะ ตัว 50 ทำทีหลังได้ค่ะ
> และ
> ก้อนรายได้ต้องมีเรื่อง ECA ด้วยนะคะ

**Status:** the order is stated; it is confirmed in the 11-07 room, with พี่ฟีน present (the owner: Khwan is not the only decider). No build GO yet.
**Installments if confirmed (DELIVERY-FACTS Q5):** SALARY 13,500 + Roles 3,600 = 17,100 · REVENUE 13,800 · STOCK 8,300 = 39,200.
**Open, asked of both SAs 2026-11-05:** the weeks for her first Salary slice. It differs from the slice in DELIVERY-FACTS Q4 (base + manual lines, ≈ 5–6 wk): Extra Hour and Bonus 100 are in it, and Q2.3 says F3 feeds Extra Hour and F4 feeds the bonuses.
**ECA in Revenue:** already in scope, §2 (the ECA row).

## 12. Reports: per block or all at the end (LINE, 8:22 PM, the owner's screenshots 2026-11-07)
Khwan, verbatim:
> @Dong_08 Report แต่ละเรื่องทำสุดท้ายใช่ไหมคะ เราทำเป็นเรื่องๆ หรือ มาทำรวมทีหลังทีเดียวคะ เช่น Report เงินเดือน Report สต็อก อะไรแบบนี้ค่ะ

The owner replied: *"หลังบ้านจะเป็นเรื่องๆครับจบตามก้อนแต่ละเรื่องเลยครับ"*, and to Porter: *"แก้ได้นะ หมายถึงเราจะทำยังไง"*.
**Porter's reading of this REQ, for the owner to rule:** each block's own reports finish with that block: Salary R1.7 + R1.8, Revenue R2.5, Stock R3.8. The §4 pages (REPORT · STOCK · CHECK IN · COURSE · SALARY · STUDENT) stay last, their content agreed when that part starts. No price change (§9, owner 10-22). The SAs have not been asked whether a block's reports can ship inside it as sized.

**Owner's ruling, 2026-11-07:** *"เอาแบบนั้นแหละ"*. Two layers as read above. Open, read-only, before any GO: both SAs confirm their sizes include each block's reports.

**Sizes confirmed, 2026-11-07:** each block's reports are already inside its size, 0 days missing. Sober: R1.7 2.8 d + R1.8 3.3 d in Salary 43.1; R3.8 4.4 d in Stock 37.0. Silver: R2.5 6.6 d in R2 ≈ 32.8. The §4 pages stay outside these sizes.

## 13. The 11-07 meeting (owner's file, 2026-11-07)
**Source:** repo `smart-scheduler-requirement`, `20261107-meeting.md`: an AI-written summary of the call, not verbatim. **Read-out and open points:** `talks/BRAINSTORM-2026-11-07-meeting-readout.md`. Headlines as reported: coach confirm + export + CEO reminders kept if small; Stock import described as overwrite (🔴 vs R3.4); พี่เบส asked for a stock card and a Master Plan before work starts; back office dark theme; maintenance 6 months free then 500 ฿/man-day; project total 97,600. Not reported: Bonus 100 A/B, go-live date, GO.

**Owner's ruling on Stock import, 2026-11-07** (replaces the meeting's "overwrite"; R3.4's "never deletes history" stands): *"การ import excel อยากทำแนวคิดเดียวกันกับ gitเลย เวลาอัปเข้ามา ก็ให้ เช็ค diff ว่ามี change ยังไง ให้เขากด ยืนยัน แล้ว ค่อยไป สร้าง movement ให้ เห็นว่ามี การ in out ยังไง นั่นแหละ คือแบบ stockcard ที่พี่เบสบอก เลย"*.
- Upload → a diff per item (new item, changed quantity +/−, other changed fields) → the user confirms → each change is written as a stock movement (in / out / adjustment). The movements are the stock card. Nothing is deleted.
- Size: Sober (Stock is Team A's), read-only; the customer is told in the Master Plan.
- **Sober's size, 2026-11-07:** git-style import ≈ +2.5 d over R3.4's 3.9 d (classified diff + per-line confirm 1.5, each balance change as a movement 1.0) → Stock ≈ 39.5 d. A removed row is shown, never deleted; a price or name change is a field edit, not a movement; a negative result is flagged and refused. A per-item stock card view (running balance) is separate from R3.8: ≈ +2–2.5 d → ≈ 41.5–42 d if wanted. Extras at 263 ฿/d unless the owner folds them in.

**Owner's ruling on course-change revenue, 2026-11-07:** *"เอาแบบ A ก็ได้ แต่ต้องเอามาให้เขาดูด้วย ว่าจะเป็นแบบไหน"*. A = at the change, the sale is split by hours: hours taught stay on the old activity, the rest moves to the new one (Silver, ≈ +1.5 d; may overlap REQ-5007's revenue add-on). Not B (earned per hour). **Before it is built, the customer sees a worked example** (e.g. 10 h skate, 5 taught, switch to bike: what the revenue report shows per activity and month) in the Master Plan, and agrees.

**Owner, 2026-11-07, on พี่เบส's stock card:** *"Stock Card เอาออกไปเลย เพราะ import แบบ git change ตอบโจทย์แล้ว"*. The separate per-item stock card view (Sober ≈ +2–2.5 d) is OUT; the git-style import's movements answer it. Remaining extras not yet priced: slip export 5 d · "remind now" 1 d · git-style import 2.5 d · course-change revenue split 1.5 d · dark theme 0.5–1 d ≈ 10.5–11 d ≈ 2,750–2,900 ฿ at 263 ฿/d (in 39,200 or extra: owner's call).

**Owner, 2026-11-07, on the extras:** *"รวมให้ทั้งหมด"*. Slip export · "remind now" · git-style import · course-change revenue split (A) · dark theme are IN scope, inside 39,200, no extra charge (≈ 10.5–11 d added to the build: Salary +6 d, Stock +2.5 d, Revenue +1.5 d, UI +0.5–1 d). The Master Plan names each as included, and states that asks after it are charged at 263 ฿/d by size.

**Owner, 2026-11-07, Master Plan calls:** the 6 free months count from block 3's (Stock) delivery (*"ใช่ตามนั้น"*). The possible server cost (+≈500 ฿/month) stays out of the plan: try the current server first (*"ลองดูก่อน"*). On the §4 report pages he asked: *"มันจะอยู่ในแต่ละเมนู หรือแยกออกมารวมทุกอย่างหรือยังไง ถ้ามันต้องแยก ก็ทำตามก้อนที่ทำเมนูพวกมันไปเลยมั้ย"* (open, Porter answering).
**Owner, 2026-11-07, on the §4 report pages:** *"เอาตามนั้น ทำตามก้อน"*. The 6 pages ship with the block whose menus they report on, not last: **Salary → SALARY · CHECK IN · Revenue → REPORT · COURSE · STUDENT · Stock → STOCK** (Porter's mapping; the SAs confirm). Content is agreed with Khwan when each block starts. Supersedes §12's "the §4 pages stay last". Sizes per page and the week shift: the SAs.
**Owner, 2026-11-07:** the 6 free months count from the delivery of **all** blocks (*"ใช่ นับจากส่งงานครบทุกก้อน"*), replacing "from block 3" once the report pages moved Revenue's last drop to ≈ wk 13–14.
**Owner, 2026-11-07: work starts Monday 9 Nov 2026** (*"ใช่ เริ่ม 9 พ.ย."*). Master Plan §3 states it; §9 keeps only the go-live month open. Not yet a build GO in words: TASKs wait for the owner's GO, Bonus 100 A/B, the three test databases + env.
**Owner, 2026-11-07, when each installment is paid:** *"เอาแบบ A จ่ายตอนขึ้นระบบจริง"*: on the block's go-up to the real system for trial, not on passing its acceptance check. Master Plan §2 + the dated page say the same words. Also added: a thin-slip demo for พี่ฟีน on sid ≈ 20–23 Nov (Sober: Salary dates unmoved; 2 BEs those 2 weeks).

## 14. BUILD GO (owner, 2026-11-08)
Verbatim: *"อ่า GO เลยจะได้ ทำให้ก้อนแรกเสร็จได้ไว"*. Start Mon 9 Nov 2026, per Master Plan v1 (plan md5 83592c51) and `CHECK-REQ-120-three-team-schedule-2026-11-07.md` (rounds + Porter's GO list + "shared sid DB rules"). Priority: block 1 (Salary) first and fast; thin-slip demo for พี่ฟีน on sid ≈ 20–23 Nov.
**Where the work goes (code facts, 2026-11-08):** all four repos on branch `dong`, no new branches, git only on the owner's word.
- `smart-scheduler-backoffice-front` (Next 16 + Mantine 9): every back-office screen, carried over from the agreed final UI (`som-balance-backoffice-spec` → `final-ui/`, REQ-133, md5 1d0ce1f6; a prototype, never the product).
- `smart-scheduler-backoffice-back` (Hono): R0 roles/users, Salary, Revenue, Stock APIs + reports.
- `smart-scheduler-front` + `smart-scheduler-back`: the front-office changes F1–F6, camp confirm, refund cancel, C1 (revenue at confirm).
- One shared DB: sid on the owner's Postgres (§ shared sid DB rules; `MIGRATION-QUEUE.md`).
Open, not blocking wk 1: Bonus 100 1A/1B and the Revenue go-live month (Khwan).
**Owner, 2026-11-08 (after the GO), verbatim:** *"งั้นเริ่มเลยก็ได้ ของเดิมที่ ทำมาแล้วเขาไม่เอา แล้วเอาออกหมดเริ่มใหม่หมดเลยก็ได้"* ⇒ (a) start now, not Monday; (b) the old back-office code the customer doesn't want may be removed entirely and rebuilt from scratch. Open for the SAs before anything is removed: C1 (the scheduling back writes `bo.item` / `bo.movement` in the same DB: FL ceiling in the booking transaction, every sale posting, undo reversals) — removing those tables breaks the live front office unless the same release moves those write points; and the sizing reused ≈ 24.9 d of BO_old parts (§10), so "all new" may change weeks. Removal = code edits on `dong`; nothing in uat's data is touched; git only on the owner's word.
**Owner, 2026-11-08, verbatim:** *"ไปเลย นะ ทำไปเลย นะติดอะไร ก็ตัดสินใจกันไป ก่อนที่ต้องการฉันก็ team brainstrom แล้ว ตัดสินใจแล้ว ลิ้สต์ๆ ไว้ ว่า มีอะไรบ้างทำไปเลย"* ⇒ build blockers are decided by the team (SAs brainstorm → decide → one row in `DECISIONS-REQ-120-build.md`) and work continues; the owner reads the list and may overturn. Still up the chain: customer rules (ขวัญ), money, git, uat writes, env values, anything changing the Master Plan's promises. This covers the old-back-office removal question above: Sober + Silver + Sector decide it and list it.

## 15. Khwan's answers to the 2 pre-build questions (LINE, 2026-11-08 ~7:47 AM, the owner's screenshot), VERBATIM
Asked in `COPY-DRAFT-khwan-bonus100-and-golive-month-2026-11-07.md`.
- **Q1 (Bonus 100, old course renewed after go-live):** *"ขอรีเช็คว่าเข้าใจถูกต้องนะคะ ข้อ 1 หมายถึงถ้าเราเริ่มใช้ระบบเงินเดือนตอนไหน ให้เริ่มคิดโบนัสตามระบบตอนนั้นใช่ไหม ตอบคือใช่ค่ะ ไม่มีการคิดย้อนหลังค่ะ ถ้าเราเริ่มใช้ต้นเดือน แต่ถ้าเริ่มใช้ระบบเงินเดือนกลางเดือน มีคอร์สที่เปิดไปแล้ว ระบบไม่ได้มาคำนวณย้อนหลังให้ ส่วนนี้ไม่เป็นไรค่ะ ขวัญใส่มือได้ค่ะ"*
  - **NOT a ruling on A vs B.** She restated it as "bonuses start when the salary system starts, no back-calc" — true under both A and B. The case asked (course bought BEFORE go-live, renewed AFTER) is not answered. New fact: courses opened before a mid-month go-live, she enters by hand (Other ±). ⇒ follow-up with one concrete example. Build default stays 1A, switchable (DECISIONS row 12).
- **Q2 (Revenue go-live month):** *"ข้อ 2 เราเลือกได้เลยหรอคะ ว่าให้เริ่มนับตอนไหน หรือต้องดูจากเดือนที่ระบบรายได้จะเสร็จคะ เพราะจริงๆ ตอนนี้ก็ค่อนข้างตรงแล้วนะคะ แทบไม่มีคอร์สเก่ามาลงย้อนหลังแล้ว อาจจะมีบ้างแต่ไม่เยอะค่า"*
  - A question back, not a month. Answer: it depends on when the Revenue block goes up (plan wk 11–12 ⇒ earliest Feb 2570); from then she picks the month. Still open.
