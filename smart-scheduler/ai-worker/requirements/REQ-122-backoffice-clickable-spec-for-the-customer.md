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
