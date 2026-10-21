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
