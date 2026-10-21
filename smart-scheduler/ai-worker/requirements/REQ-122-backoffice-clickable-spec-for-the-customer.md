# REQ-122: A CLICKABLE back-office spec the customer can read and click through BEFORE we build (REQ-120)
**Owner, 2026-10-16, verbatim:** *"ถ้าเห็นภาพแล้ว H:\scheduler\SOM-BALANCE-Backoffice-spec ส่งทีมร่างภาพ เป็นspec ที่ลูกค้าอ่านได้ ว่าหน้าตาหน้าไหนจะเป็นยังไง แล้วสามารถบ่งบอกได้ ด้วยการ กดๆ ดูว่า มันเป็นการทำอะไร ครบมั้ย ก่อนเริ่มทำ · ห้ามใช้ สกิล /anthropic-skills:requirement-hub และ /anthropic-skills:galaxy-spec เพราะมันไม่เหมาะให้กับลูกค้าดู มันไม่ง่าย ไม่friendly"*.
**Where:** repo/folder `som-balance-backoffice-spec` (the path is in `machine.local.md`; empty, not a git repo).
🚫 **NOT to be used:** the `requirement-hub` and `galaxy-spec` skills (owner's ban). No traceability IDs, graphs or WF/UC/SCR jargon on any page the customer sees.
**What it is:** a **look-and-click mock-up**, not the product. No backend, no real data, nothing saved except the customer's own feedback in her browser. **What it is for:** Khwan / ฟีน click through every page and say "ครบ / ไม่ครบ" **before** any REQ-120 build starts.

## 1. Form (the same shape the customer already used three times and liked)
- **One entry file `index.html`**, opened by double-click (file://), no server, no build step, **no network calls**. The only external resource allowed is the Google Fonts stylesheet (Sarabun). It must survive being **zipped and sent over LINE** (the owner did this on 10-15).
- **Hash routing in one page** (`#/salary/payrun`, …). All pages are plain JS/HTML files loaded with `<script src>`, which works on file://, unlike `fetch`.
- **UI labels in ENGLISH**: the customer chose an English back office (REQ-120 §8, D2).
- **Every page has a Thai side panel "หน้านี้ทำอะไร"**: 2–4 plain lines saying what the page is for, who uses it and what each button does. Customer-friendly; no tech words.
- **Every button and link does something visible:**
  - it navigates;
  - or it opens a dialog filled with example data;
  - or it shows a toast saying in Thai what would happen (e.g. "บันทึกแล้ว: ตัดสต็อก 1 ชิ้น + รายได้ SALES +3,705").
  - **No dead buttons.**
- **A role switcher** at the top: **CEO (พี่ฟีน) / Admin / Coach**. Each role sees exactly what REQ-120 §0 allows. The admin sees no pay totals and no revenue; the coach sees only "My slip". This is how visibility is shown.
- **Feedback on every page**, like the earlier customer pages:
  - ✓ ครบ / ✗ ไม่ครบ + a note box;
  - **one "คัดลอกคำตอบทั้งหมด" button** collecting every page's answer;
  - "พิมพ์ / PDF".
  - Answers are kept in the browser (try/catch; the page works without storage).
- **Example data only.**
  - Staff names the customer herself used are fine (Kid, Poo, Kung, Bank, London, พี่ฟีน).
  - **Children only as "น้องเอ / น้องบี"**. No real family data.
- Light and dark themes, readable at phone width.

## 2. Pages (every line of REQ-120 must be reachable; the SA checks the list against REQ-120 §0–§8)
- **Home + menu**, and the role switcher.
- **Salary:**
  - People list → Person profile:
    - types, incl. PT Sat–Sun + FL Mon–Fri;
    - base 🔒 CEO only;
    - FL rates per person × class type;
    - merit yes/no;
    - vehicle;
  - Pay settings:
    - Extra Hour 350 / 5th–6th hour;
    - OT formula ÷26÷8×1.15;
    - commission groups and rates (incl. Miller helmet 40 and Miller pads 40, separate from Animal Helmet 40) and eligibility **by type**;
    - transportation rates/minimums;
    - **school distances**;
  - **Pay run** for a period (30/9–30/10), with each person's status (draft / confirmed / auto-locked at 12:00);
  - **Slip** (CEO view), itemised:
    - Extra Hour **per date**;
    - teaching hours **with who was taught**;
    - bonus **with the child's name**;
    - each trip;
  - **My slip (Coach)**, with Confirm, the deadline, and a "LINE reminder 09:00 / 11:00" note;
  - **Admin entries**: OT hours · Merit (Teacher → Admin Poo; Staff → Khwan / ฟีน) · Transportation trip · Other ± with a reason. All are **blind**: no slip total shown;
  - **Daily check-in report**.
- **Revenue (CEO only):**
  - summary by type (Today / MTD / YTD + filters);
  - **click → every line** (Date · Branch · Type · Category · Product Name · Amount · Payment · Remark);
  - manual line;
  - refund = expense;
  - categories setup (add your own);
  - **ECA term setup** (price/class × students × classes; the school's payment date).
- **Stock:**
  - Products, with commission group;
  - **Stock In** (qty + date);
  - **Excel import** that matches by Model code, with a preview: "updated / added / never deleted";
  - Locations & balance;
  - **SALES RECORD** (Product · buyer picked or typed · Discount ฿/% · Payment · coaches → commission split, not reduced by the discount → "cuts stock + posts SALES");
  - **Stock Demo**: sites matrix · move A→B · sale→Demo · broken sale goods→Demo · Demo→sale · write-off with a reason;
  - **Low Stock**: thresholds per type, per location, Monday;
  - stock reports.
- **Notifications:**
  - settings matrix (person × type: Bonus · Commission · Transportation · OT · Other · Low Stock · Extra Hour for FT/PT);
  - a sample inbox.
- **"What changes in the front office"**, shown as front-office screens:
  - **branch** on the booking;
  - **payment record dialog** (date · amount · method; required);
  - **"Confirm camp" button** (D3);
  - teacher **multi-role + STAFF**;
  - the course card showing **"from Trial of … / renewal of …"** + the first coach;
  - **"No Teacher"** for a park fee;
  - a coach **web login**.
- **Reports (last phase):** the 6 headings REPORT · STOCK · CHECK IN · COURSE · SALARY · STUDENT, each marked "รายละเอียดจะคุยกันอีกครั้ง".

## 3. Two questions asked INSIDE the prototype, where they belong (from Silver's deltas, 10-16)
- On the **Confirm camp** screen: the family's "CONFIRMED SCHEDULE" LINE message goes out **at the sale today**. Should it wait for **Confirm camp**? (A / B with the consequence.)
- On the **payment dialog**, if installments are shown as an option: with installments, does revenue count **the whole amount at confirm**, or **each installment on its day**? (A / B with the consequence.)

## 4. Done when
- Every REQ-120 line maps to a page. **The SA writes the map** in the folder's `CHECKLIST.md`, which is not shown to the customer.
- **Tanya clicks every page in all 3 roles, headless:** no dead button, no console error, no English-only explanation, the copy-all works.
- The owner looks first, and then it goes to Khwan.

## 5. v2: look like the REAL product; help moves behind a [?] tutorial with Tanya's pointed screenshots (owner, 2026-10-16)
**Owner, verbatim:** *"ทำเป็น UI ที่เหมาะ จริงๆ อย่างเดียวได้มั้ย แล้วมีปุ่ม [?] ให้กดในแต่ละหน้า เพื่อ popup แนบรูป ชี้ๆ เหมือนtutorial ดีกว่ามั้ยรูป มาจากtanya cap มา มีชี้ๆด้วย เพื่อประหยัดพื้นที่ คำแนะนำ หรือ คำอธิบาย เพื่อให้เว็บ คล้าย กับภาพ frontend ที่เราจะเป็น มากที่สุด · แล้วแก้ UI สวยๆเลย"*.
v1 (TEST-104 PASS, clean zip built) is **kept, not sent**. v2 replaces it.

**What changes:**
1. **The page body = the real UI only.**
   - No Thai side panel, no inline feedback box, no explanation text on the page.
   - **It should look as close as possible to what we will actually build:** the same look family as our front office (`smart-scheduler-front`: Next.js + Mantine, its spacing, cards, tables, badges, dialogs).
   - "**สวยๆ**": a proper, polished admin UI (the global rule routes UI design to the `impeccable` skill).
2. **One [?] button per page** (top-right of the page title) opens a **tutorial popup**:
   - **a screenshot of THAT page** (captured by **Tanya**), with **numbered pointers** (pins / arrows / highlight boxes) on it;
   - **numbered Thai steps** matching the pins ("① กดตรงนี้เพื่อ…");
   - **the page's feedback** (✓ ครบ / ✗ ไม่ครบ + note) **at the bottom of the popup**;
   - **the page's A/B question** (REQ-122 §3), where that page has one; the [?] shows a small dot when a question waits.
3. **The demo controls stay, but small:**
   - "Viewing as: CEO / Admin / Coach" in the header;
   - copy-all / print / reset behind ⋯ (as now).
4. **Pointers are an HTML overlay on the image** (pins at %-coordinates), not drawn into the PNG. Fixing a pin then needs no re-capture.
5. **Images live in the folder** (`help/*.png`) and load with `<img>`, which works on file://. Keep each about ≤ 150 KB, so the zip stays sendable on LINE.

**Order:**
1. the redesign (both teams, Team A's shell first);
2. **Tanya captures** every page × the relevant role, at one fixed desktop size, headless;
3. the engineers add the pins + steps;
4. Tanya's full regression (as TEST-104) + clean zip;
5. the owner looks;
6. Khwan.

## 6. Customer feedback while using the prototype (Khwan, LINE, 2026-10-19 03:33)
- **SALES RECORD:** *"อันนี้เลือกคอมครูตรงไหนคะ · ขายของ"*. She did not find where to pick the coaches who earn the commission. The prototype has them as clickable name chips (KID ✓ POO ✓ KUNG BANK) in the "Coaches earning commission" card **below** the form. **They don't read as a control.**
- **For the real build (REQ-120 R3.5):** make the coach picker an obvious control **inside the sale form**, e.g. a labelled multi-select "Coaches who sold (commission)", next to Product / Payment. The split table stays as the result. Answered to her by message (owner, 10-19).

## 7. Khwan's prototype answers, PART 1 (2026-10-19). She is NOT finished
Verbatim: `project-docs/customer-2026-10-16-backoffice-prototype/khwan-answers-proto-v2-part1-2026-10-19-VERBATIM.md`. Unanswered: pages 6 and 18–20 (her notes on 18 are words only), plus 22–32 (Revenue types onward, all of Stock, Reports).

**Plan: ONE prototype v3 round after part 2 arrives**, not page by page (the batch rule). Until then nothing changes in the prototype.

### 7.1 Words (v3; and the real build, since D2 = English)
- **Brand:** the top title is SOM BALANCE / SOM BACK OFFICE.
- **Menu headings ALL CAPS:** SALARY · NOTIFICATION · SETTING ("Front office changes" → SETTING).
- **Headings spell out the types:** Full-time / Part-time / Freelance. After a coach's name, FT / PT / FL is fine.
- **Dates carry the year:** 16/10/26.
- **Renames, page by page:**
  - **Salary:**
    - People → Employee · Person profile → Employee Profile · Pay settings → Payment Setting · Pay run → Monthly Payment (Up to date) · Slip → Payment Detail;
    - Admin entries → Other Income · Items I entered this period → Other Income Detail;
    - Daily check-in report → Daily Training Report (Role that day → Role · Hours cut → Hour · What counts → Extra · Pay for the day → Daily Income · Day total → Total).
  - **Notifications:**
    - Notification settings → Notification Setting · Staff and admins → CEO and Staff · Person → Who · OWN ITEMS — ALWAYS → MYSELF - ALWAYS;
    - Inbox → Notification Alert.
  - **Teacher roles and web login:**
    - Teacher: several roles + STAFF → Role Setting;
    - web login → User Setting · Can see → Visible · Not shown → Invisible · Own slip only … → My slip · Confirm · Create Login → Create User · Send Invite again → Invitation · What the coach sees… → After signing in · See it as Coach → Individual Information.
  - **F2 / F4:**
    - Payment record → Payment Method;
    - First coach and links → Conversion · First coach → Coach · course cards → "New Package after 1st Trial" / "Renew Course" · RENEWAL → RENEW · Admin chooses the first coach → Who get Bonus? (1st Coach : Kid · 2nd Coach : Poo · Share : 50 / 50).
  - **Revenue:**
    - Revenue summary → Revenue Summary · How refunds count → Refund · View line → View;
    - Refund page: Record a refund → Refund Record · Original line → From · How it is counted → Record · Month → Period · Sep (Sales) / Oct (Refund).

### 7.2 Prototype-only confusion (answers, not changes)
- **The grey "Scheduling app › Teachers › …" bar** marks a screen that lives in the FRONT office. ฟีน found it confusing. **v3:** replace it with a plain label, e.g. "หน้าบ้าน (SOM SCHEDULE)", or drop it.
- **F1 / F5 / D3 / F2: "why in the back office?"** They ARE front-office changes (REQ-120 §5). The prototype showed them only to agree on them, and she read them as back-office screens. Her ask (*"ไว้หน้าบ้านทั้งหมดได้ไหมคะ"*) **= the plan already**. **v3:** label them clearly as front-office screens.
- **"Eligibility By type — STAFF today: Skate bag only"** = R1.3: a STAFF member earns commission on Skate bag sales only. It is her own earlier rule. **v3:** use plainer words.
- **Month history** (Pay run / Slip / Other Income): the real build has a month picker. **v3:** show one.
- **Other Income per month?** Yes, per pay period (R1.4: last day of the previous month → the day before the last day).
- **F1 "Branch on a booking"** = which branch the class happens at (R2 revenue by branch; default Bravo). It is not a branch move.

### 7.3 Changes to AGREED rules (REQ-120). Each one is confirmed with her by consequence before it becomes a ruling
- **C-a, commission edited per sale** (*"ค่าคอม แก้ต่อครั้งได้ใช่ไหมคะ … ขายสินค้าที่มีดีเฟค…"*). R1.2 today: not reduced by a discount; only "set to 0" by hand. → Allow **any amount per sale** (CEO only?). Small.
- **C-b, payment: default Transfer, no daily confirming** (*"ให้ระบบคอนเฟิร์มให้เลยเป็น Transfer ทั้งหมด ถ้ามีแก้ไข ค่อยเข้ามากดแก้"*). **This REVERSES D4 "required at confirm".**
  - Consequence: anything not edited counts as Transfer, so revenue by method is only as right as the edits.
  - ⚠️ **Where are edits made?** Item 17 says the front office; "เพิ่มเติม" 7 says the back office. Ask.
- **C-c, camp confirm** (D3): a front-office button that also sets Transfer. The LINE "CONFIRMED SCHEDULE" goes at Confirm camp (her B). Consistent with D3; only the place is settled.
- **C-d, installments: B** = each installment counts on the date it is received (D4's optional extra, now chosen).
- **C-e, bonus:**
  - *"Trial ไม่มีทางมีครู 2 คน"* ⇒ the Bonus 50 "two coaches share 25 each" case is dropped.
  - The **mid-course coach change** = "Special Case", Bonus 100, with **Who get Bonus? 1st / 2nd / Share 50/50**.
- **C-f, refund = CANCEL the course, not pause** (*"พอกด cancel ไป ระบบจะต้องยกเลิกตารางทั้งหมด"*). R2.3 today: refund = an expense, and nothing in the schedule changes.
  - → A refund **cancels the course and all its remaining sessions in the front office**. That crosses into the scheduling system, and C2 says cancel reverses nothing today.
  - **Ask:** are the family's LINE notices sent? Which sessions go: only future ones, or all unattended?
- **C-g, Daily Training Report:** count by teaching hours only, no check-in/out; **add the total number of coaches**.
- **C-h, notifications:** no opt-out ticks; everyone always gets all their own. This simplifies R0.

**Sizing:** C-a, C-c, C-e and C-g are small or neutral, and C-h shrinks the work. **C-b and C-f are real changes** (C-f touches the front-office cancel). Silver re-sizes after part 2.

### 7.4 PART 2 (2026-10-19 21:55, *"ครบทุกข้อค่ะ"*): pages 18–31
Verbatim: `…/khwan-answers-proto-v2-part2-2026-10-19-VERBATIM.md`. Still unanswered: **6 My slip** · **32 Reports** (REQ-120 §4 agrees Reports later).

**Words (v3), on top of §7.1:**
- **Revenue:**
  - Every Line → Detail · Add manual line / Manual revenue line → Add Manually · Product Name → Description · Payment → Method · N lines → N items · Total Revenue · Refund (Expense);
  - Types and categories → Type and Category · Inline → Inline Skate · Also under COURSE → Other Course · Other types → Other Type · RENT ALL → EQUIPMENT · Park Fee → PARK;
  - ECA term setup → ECA Payment (Students → Student · Classes per term → Class / Term · Date the school pays → Payment Date · Term total → Total Amount · Save Term → Save · ECA terms set up → ECA Payment History).
- **Stock:**
  - Products → Product · Products for sale → Sales Product · column headers ALL CAPS · Commission group → COMMISSION;
  - Stock In: Save Stock in → Save · Bravo shop → Bravo;
  - Import: Updated → Updated Item · Added → New Item Added;
  - SALES RECORD → **STOCK OUT** · Buyer (from the system) → Student · …or type a name → Other Customer · Price after discount → Price · Coaches earning commission → Commission;
  - Stock Demo: Add site → Add Location · Write-off → Delete · All sites → Total · From → To;
  - Low Stock: Lowest amount per type → Setting · Alert when below / Lowest → Alert (Unit) · See balances → Balance Stock · Left → Balance · Save;
  - Stock reports: Show → Search · Buyer → Customer · Kind → Type.
- **Drop these page titles:** "New manual line" · "New ECA term" · "Receive goods" · "New sale". Also drop the "Counts as revenue on" line on ECA.
- **Every date shows the year (16/10/26).** Stock In uses a **date picker**, not typing.

**Layout / small changes:**
- Products: **Category column before Product Name**. **Add Quantity + Location columns**, plus a **Location filter**.
- **27: the "Locations and balance" page is removed.** Its job moves to Products (location filter + quantity).
- Stock Demo: **Bravo is the leftmost column; the location order is settable**. **"Teaching equipment by site" is removed.**
- **Answers, not changes:**
  - 26 "Never deleted" = products not in the file are kept, history intact (R3.4). v3: clearer words.
  - 31 Balance: all locations, with a location picker = **yes**, as designed (R3.3 / R3.8).

**Rule changes (REQ-120), added to §7.3:**
- **C-i, Revenue types:**
  - **1st Trial becomes its own TYPE**, with a category per activity ("1st Trial (Inline Skate)", "1st Trial (Surfskate)" …);
  - BALANCE CAMP BIRTHDAY stays under Course;
  - the manual line offers the full type/category list, and **the "manual" type is removed**.
  - Changes R2.1; small.
- **C-j, STOCK OUT sells SEVERAL items in one sale** (*"ต้องเลือกซื้อได้หลายอันด้วย"*). R3.5 was one product per sale.
  - Now a cart: lines, each with qty; one discount (฿ or %) on the sale; commission per line or per sale?
  - **Medium**: it touches stock cut, revenue lines and commission (C-a's per-sale edit sits here).
  - Ask with C-a.
- **C-k, "Write-off" is labelled Delete**, but it keeps history with a reason (R3.6). Label only; nothing is hard-deleted.

**Next:**
1. The owner sends the revised reply (answers + the C-a / C-b / C-f / C-e / C-j confirmations).
2. Silver re-sizes the REQ-120 deltas (C-a…C-k vs the 160/173 d baseline) for the owner's money talk.
3. The v3 prototype goes out only on the owner's GO.

## 8. v3: rebuild the prototype from ALL her feedback, then send it back for an OK on EVERY page (owner, 2026-10-21)
**Owner, verbatim:** *"ได้รับฟีทแบคยัง ให้นำมาทำใหม่ให้ตรงกับลูกค้า แล้วส่งไปใหม่ให้ลูกค้าตอบ ok ทั้งหมดก่อน"*.
**Inputs, all on disk:**
- §7.1–§7.4: every rename, layout change and prototype confusion;
- REQ-120 §9: her 5 rulings (C-a B · C-j A · C-b C · C-f · C-e);
- Silver's re-size conflicts (`inbox/PM.md` 10-20);
- the verbatim part 1 + part 2 files;
- REQ-122 §6: the commission picker inside the form.

**v3 must:**
1. **Apply every word** in §7.1 + §7.4, exactly as she wrote it:
   - the menu headings ALL CAPS (SALARY · NOTIFICATION · SETTING …);
   - Full-time / Part-time / Freelance in headings;
   - dates with the year (16/10/26);
   - SALES RECORD → **STOCK OUT**;
   - the brand "SOM BALANCE / SOM BACK OFFICE".
2. **Apply every layout change:**
   - the Locations page removed → Products gets quantity + location columns and a location filter;
   - the Category column before Product Name;
   - Stock Demo with Bravo leftmost and the location order settable, "Teaching equipment by site" removed;
   - the page titles she struck removed;
   - a **month picker** on Monthly Payment / Payment Detail / Other Income;
   - the Daily Training Report by teaching hours only + the coach total;
   - notifications with no opt-out ticks.
3. **Apply her rulings:**
   - STOCK OUT = a **cart** (several items, ONE bill discount ฿ / %);
   - commission editable per sale **by ฟีน and the admins**, on that sale's line only (an admin sees no pay totals);
   - Payment Method defaults to Transfer, editable front + back;
   - a refund cancels the course's unattended sessions + tells the families;
   - "Who get Bonus? 1st / 2nd / Share 50/50" on a mid-course change; no trial 25/25;
   - 1st Trial as its own revenue type, with a category per activity; no "manual" type.
4. **Front-office items stay, clearly labelled as FRONT OFFICE** (SOM SCHEDULE): F1 branch, F2 Payment Method, F5 No Teacher, D3 Confirm camp, roles, user setting.
   - The grey "Scheduling app › …" bar is replaced by a plain "หน้าบ้าน (SOM SCHEDULE)" label.
   - She must see at a glance that nothing is done twice.
5. **The 4 open follow-ups** (sent 10-21, not answered yet) appear as the page's A/B question **inside** the [?] popup, where they belong:
   - commission: lower only / raise too;
   - commission per item / per bill;
   - refund: course status + voucher;
   - Low Stock recipients.
   
   If she answers in LINE first, the answer is applied instead.
6. **Answers, not changes, made clear on the page:** "Never deleted" in Import (plain words), and the Balance view of every location with a picker.
7. **Fresh answers:** v3 stores answers under a NEW key, so **every page starts unanswered** and she must OK each one again. The export lists all 32 (+ any new) pages.
   - **My slip (6)** gets her look this time.
   - Reports (32) stays "agreed later" (REQ-120 §4), and the page says so.
8. **Delivery that can't fail like v2's zip** (opened inside the zip → blank page): prefer a **single self-contained .html** (all scripts, styles and images inlined).
   - If that's impractical, the zip plus a one-line "แตกไฟล์ก่อน" instruction on the first screen.
   - The SA decides and says why.
9. **Rules unchanged:**
   - plain HTML in `som-balance-backoffice-spec`;
   - the real-product look + [?] popups with Tanya's pointed captures (1280×800, the main action inside the frame);
   - **no money, no prices**;
   - **no requirement-hub / galaxy-spec**;
   - an admin view never shows pay.
10. **Team split as v2:**
    - **Team A (Sober):** the shell, Salary, Notifications, the front-office pages;
    - **Team B (Silver):** Revenue, Stock, Reports;
    - **Tanya** re-captures the help screenshots and checks every §8 item page by page (TEST-115).
    - Numbers: Team A **831+**, Team B **745–749**.
11. **Done when:** Tanya's checklist shows every item above ✅. Porter then writes the customer message (what changed, "please OK every page", the 4 questions). The owner sends it.

### 8.1 Sized + GO (Porter, 2026-10-21)
- **Team A:** TASK-831…835, ≈4.7 d (Fern; Jason on 833).
- **Team B:** TASK-745/746, ≈6.6 d (Fanta + Silver review).
- **≈11.3 engineer-days in total**, run in parallel. The front-office pages move to Team A. One self-contained .html.
