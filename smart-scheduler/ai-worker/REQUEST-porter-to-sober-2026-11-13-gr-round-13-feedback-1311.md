# REQUEST 2026-11-13 · Porter → Sober: GR round 13, ขวัญ's "Feedback 13/11" (back office, free until 17 Nov)

**Source:** ขวัญ, SOM group 14:59–15:08, 19 images. Verbatim: `project-docs/customer-2026-11-13-line-som-system/khwan-backoffice-feedback-2026-11-13-VERBATIM.md`.
Porter read every image in chat.line.biz. She sends the image first, then her note about it. The page each image shows is in the table.
Owners per page come from `RULE-2026-11-12-gr-web-alignment.md` (A Fern · B Fanta · C Flash). Correct me where it's wrong.

| # | Image → page | Her words (short) | What to change on som-gr | Team |
|---|---|---|---|---|
| 1 | #1 Employee · #2 Monthly Payment | "Base + Net ขยับซ้าย หน่อยค่ะ จัดแถวให้เท่าๆกัน" · "Base salary / Net total = Base Salary / Net Total" | Base Salary and Net Total columns sit closer to the left (not pushed far right), even row spacing; title-case both labels | A (PayRun) + B (People) |
| 2 | #3 Daily Training Report | "กดเข้าไปดูรายละเอียดด้วยได้ไหม ว่าชั่วโมงสอนใครไปบ้าง และ edit ได้ไหม บางกรณีถ้าค่าสอนผิด" | A row opens its detail (which classes/hours, which students); an Edit to correct the pay | B (Daily) |
| 3 | #3/#4 Daily Training Report | "ขยับ Hour ออกมาซ้าย จัดสมดุลแถวเหมือนเดิม" | Hour column closer to the left, balanced like the others | B (Daily) |
| 4 | #4 Revenue Summary | "หน้านี้ ของ cat ขอกดดูรายละเอียดเหมือน type" · "ใส่ refund ของฝั่ง cat ด้วย" | Category / Unit / Revenue rows clickable to a detail, like Type rows; add the Refund line to the Category box | C (revenue) |
| 5 | #5 Add Manually | "ในหมวด Other ขอมีอันที่เราสามารถพิมพ์เองด้วยได้ไหม เผื่อเป็นค่าอื่นๆ ที่เรามีนานๆครั้ง" | Under Type = Other, a free-text category option | C (revenue) |
| 6 | #6 Refund | "CANCELLED ON SAVE = REFUND" | Badge text → "REFUND" | C (revenue) |
| 7 | #7 Type and Category | "เอาคำว่า SPORTS ออก" | Remove "SPORTS" (top right of COURSE) | C (revenue) |
| 8 | #8 ECA Payment | "default สถานะเงินเป็น Pending · เงินที่กดเข้าไปแล้วต้อง cancel / Edit ได้" · "ECA Payment History ขึ้นเฉพาะ Net received = Net Amount / Total Amount Before VAT เอาออก และเพิ่มจำนวนเด็ก · จัดสมดุลและช่องว่างระหว่างแถว" | Status defaults to Pending; Cancel/Edit on a saved payment; History shows Net Amount only (renamed from Net received), drop Total Amount + Before VAT, add a student-count column; even spacing | C (revenue) |
| 9 | #9 STOCK IN · #10 STOCK OUT | "จัด layout ให้อ่านง่ายขึ้น ถ้าเนื้อหาไม่ได้เยอะ ตัดช่องสั้นลงได้ไหม อย่างช่องวันที่กดซ้ายสุดแต่ขึ้นวันที่ขวาสุด" · "ทั้ง stock out + in" | Short fields get short inputs (not full width); the date value shows where it's clicked | B (StockIn, StockOut) |
| 10 | #11 Stock Demo | "History ต้อง edit ได้ด้วย ถ้าผิด หรือแก้ไข remark เพิ่ม" | Edit on a History row (fix it or add a remark) | C (Demo) |
| 11 | #12 Stock Report | "เอา month ออก" | Remove the "Month" option (Day / Custom stay) | C (StockReport) |
| 12 | #16 Notification Setting | "edit เรื่องแจ้งเตือนใครรับอะไรบ้างอันนี้อยู่หน้าไหน" | **A question.** Answer where it is edited; if it can't be edited today, say so and propose | A (notify) |
| 13 | #17 User Setting | "menus ไม่มี S" | "15 of 18 menus" → "menu" | A (shell) |
| 14 | #18 All Report | "เมนู all report หน้า report เอาออกก่อน ข้อมูลซ้ำซ้อนกัน ทีมงง" | Hide the All Report menu for now | C (reports) |

**Not for this round (Porter keeps it):**
- #13–#15 "Move course to branch" → *"ไว้เฉพาะหน้าบ้าน ใน manage plan … เพิ่มข้อมูลในรายละเอียดแต่ละอันว่าเรียนสาขาไหน … กด Branch ให้ขึ้นกล่องคอนเฟิร์ม … ภาษาอังกฤษ"*. This moves to the **front office** (paid scope, owner's call). On som-gr only: leave the Proposed page as is until the owner decides.
- #19 and her later front-office messages (15:08+) come in the next pull; I'll add them separately.

**Ask:**
1. Your plan: confirm or fix the Team column, and cut Team A's part. Put one line in inbox/PM.md with the B and C slices, and I'll route them to Silver and Sector.
2. Items 2, 8 (Cancel/Edit), 10 add real behaviour, not just looks. Each one also gets a ledger row for the real code after 14 Nov; say if any is big.
3. Route the build through me as in rounds 10–12; Tanya checks it live after.

## Answer (Sober, SA Team A, 2026-11-13)
**Team column: two fixes**, from RULE-2026-11-12 l.17–19 and the files:
- #13 User Setting is `a/frontoffice/UserSetting.tsx`, so it is **Fern's (Team A)**, not the shell.
- #14 The All Report menu entry lives in `b/index.ts` l.38 (the `b` page registry), so it is **Flash's (Team C)**. Nothing links to `/reports/home` from elsewhere (grep), so dropping or hiding that entry is self-contained.
The rest of the column is right.

**Team A → TASK-976 (Fern):**
- #1, PayRun part: fixed column shares; Base Salary / Net Total in title case, also on SlipView;
- #13: «menu»;
- #12: the answer is below, plus one hint line on the page.

~~**#12, answer for ขวัญ [SA-decided]:** who receives what is not edited anywhere, by design. Notification Setting is read-only (TASK-914, ruling C-h): recipients follow each person's **role**, and nobody opts out. To change it, change the person's role in User Setting. A per-person on/off would be a new owner decision. Not proposed.~~
**#12, corrected (Sober, 2026-11-13; the struck answer was wrong, F-075):** read from the real code (backoffice-back `notification.service.ts` l.25–33).
- **There is no screen to edit it today**, in the design or in the real system. Notification Setting only **shows** the list (ruling C-h: no switches, no opt-out).
- The list is a stored setting. Each type is assigned to a **role** (e.g. all Admins) or to a **named person**. Today our team sets it, as data.
- So, for ขวัญ: *"ตอนนี้หน้านี้ดูได้อย่างเดียวค่ะ ถ้าอยากเปลี่ยนว่าใครได้รับแจ้งเตือนเรื่องไหน แจ้งทีมได้เลย เราตั้งให้"* (Porter's wording to finalise).
- An edit screen (CEO ticks who gets which type) would be new scope: small–medium, ~1 d [SA-estimate]. **It is your/the owner's call; not proposed in this round.**
- TASK-976's hint line is reworded to match (REWORK).

**Team B slice (Silver → Fanta)**, files: People, Person, Daily, StockIn, StockOut:
- **#1:** People (and Person's labels): «Base salary» → «Base Salary». Balanced column shares so Base Salary sits near Name; numbers stay right-aligned (rule 1).
- **#3:** Daily: the Hour column narrower (now `w="15%"`, l.63), so it sits next to Role and the row stays balanced. Numbers stay right-aligned.
- **#2:** Daily: a row opens a **detail**: that coach's day by class (time · class type · hours · students' names) and the pay line. **Edit** (CEO only) corrects the hours or the pay, with a **required reason**. The row then shows an «Edited» badge and the total follows. Mock only.
- **#9:** StockIn and StockOut: short fields (date, qty, code, price) get a **short input** (`maw` ≈ 240–320), still one per row with the label above. The date shows its value where it is clicked.
  - [customer-asked] amendment to RULE rule 6: **«full width only for long text; short fields are short»**. I'll write it into the RULE file once Silver agrees.

**Team C slice (Sector → Flash)**, files: `b/revenue/*`, `b/stock/{Demo, StockReport}`, `b/index.ts`:
- **#4:** Summary: Category rows open Detail too. Detail gains a `?cat=` filter, next to `?type=`. Add the Refund (Expense) line under the Category box's Total, like the Type box.
  - **Also the queued TASK-958 fix:** the link carries `&tab=&branch=`, and Detail opens on that tab's period (TASK-958 § Review, bottom).
- **#5:** Add Manually: under Type = Other, an «Other (type it)» option that shows a text box. The typed category is saved on that line only, and is not added to the category list.
- **#6:** Refund: badge «CANCELLED ON SAVE» → «REFUND».
- **#7:** Type and Category: remove «SPORTS» at the top right of COURSE.
- **#8:** ECA Payment:
  - Status defaults to **Pending**. This replaces round 11's «Received».
  - A saved row gets **Edit** (the same form, prefilled) and **Cancel** (status «Cancelled», kept in History, excluded from totals, reason required).
  - History: «Net received» → **«Net Amount»**; drop Total Amount and Before VAT; add **Students**; even spacing.
  - The «Proposed: to confirm» tag stays on Net Amount.
- **#10:** Stock Demo: History row → **Edit**, to fix the entry or add/edit the remark, with «edited» shown on the row.
- **#11:** Stock Report: remove «Month»; Day and Custom stay.
- **#14:** hide All Report: take its entry out of `b/index.ts` (menu + Home card). The page file stays for later.

**Real behaviour for the ledger (after 14 Nov) [SA-estimate]:**
- **#2 Daily detail + pay Edit: BIG** (~2–3 d). It is a pay correction on a computed line, with a reason + audit, and the month's slip must follow. It touches the salary engine, so it needs its own SPEC.
- **#8 ECA Cancel/Edit: medium** (~1 d on top of the ECA ledger row). Edit of a Received row must re-post the revenue.
- **#10 Demo History Edit: small–medium** (~0.5–1 d). An edit of a movement is a correcting movement + note, never an overwrite.
- #4 Category detail filter: small (~0.5 d). #5 typed Other category: small.

**Build:** as rounds 10–12. Silver and Sector cut and review their own slices; I review TASK-976. I build once all three are reviewed → Otto → Tanya via you. If Silver or Sector would rather hand the slice to me, as in rounds 10–12, I cut and review it.
