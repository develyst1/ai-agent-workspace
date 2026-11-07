# TEST-139: REQ-5005, changing a paid rental (Ride → Full Set): the customer draft + a short run on sid
**Status:** ⏸ the run holds what the draft says about the paid row; the draft is 🔧 FAIL on 2 lines. NOT_TESTED: the revenue report and ledger rows.
**Source:** Porter's brief in `inbox/QA.md` · `requirements/REQ-5005-*.md` (Sober's answer, from code) · `COPY-DRAFT-khwan-paid-rental-upgrade-2026-11-07.md`.
**Instrument:** the real screens, headless, desktop, with the `som` card (AUTHENTICATED, 200), no password typed. The exact pages: `https://som.develyst.online/scheduler/calendar` and `/scheduler/bookings`. **Build:** whatever is on sid; no version is shown.

## Customer gate
**Draft checked:** `COPY-DRAFT-khwan-paid-rental-upgrade-2026-11-07.md`, md5 `b1a5c1985f0c9dd57909ade7740f52cd` from "ขวัญครับ" to the end of the file (`23483e7e751dc80cb737cfbfb4ea7a93` without the last newline).

**🔧 2 lines to fix, plus 1 limit to add:**
1. **"เลือก Helmet or Pad (50)" isn't on the screen, and the steps don't say where to go.** The standalone form offers `Helmet / hr · ฿50` and `Pads / hr · ฿50` as 2 separate items. (The class's own picker says `Helmet — 50` and `Pad — 50`.)
   - **The exact path, English:** Bookings / Students → tab **All bookings** → button **Record rental** → Equipment **Helmet / hr · ฿50** → Hours **1** → **Record rental**. It answers "Rental recorded".
   - **The exact path, Thai:** การจอง / นักเรียน → tab **การจองทั้งหมด** → button **บันทึกค่าเช่า** → **หมวกกันน็อก / ชม. · ฿50** → **1** ชม. → **บันทึกค่าเช่า**.
   - **Replace with (use whichever language her screen is in):** *"กรณีเปลี่ยนจาก Ride (150) เป็น Full Set (200) ให้บันทึกส่วนต่าง 50 บาท โดยไปที่หน้า Bookings / Students แท็บ All bookings กดปุ่ม Record rental เลือก Helmet / hr (฿50) จำนวนชั่วโมง 1 แล้วกด Record rental ครับ ยอดเงินจะถูกต้อง แต่มีข้อจำกัด 3 ข้อครับ"*
2. **"ในรายงานรายได้จะแสดงเป็น Helmet or Pad" has the wrong name too.** The back's name for that item is "Equipment rental — helmet / hr" (code; I haven't seen the report screen).
   - **Replace with:** *"ในรายงานรายได้จะแสดงเป็นค่าเช่า Helmet ไม่ใช่ Full Set และไม่มีชื่อเด็กกำกับ"*
3. **A limit the draft leaves out: the entry isn't tied to a child.** The form has only Equipment and Hours, with no child, class or coach. Someone reading the report later can't tell whose 50 baht it is. That's the "ไม่มีชื่อเด็กกำกับ" above, so it stays 3 limits.

**Holds, seen on sid on a QA class:**
- **"แก้แบบเช่าหรือยกเลิก paid ไม่ได้":** the reopened paid row reads "Rent 150 / Ride only (…) · paid" with no button at all. The API refuses too: remove 409 `RENTAL_PAID`, a second row 409 `RENTAL_EXISTS`.
- **"เพราะเงินลงบัญชีไปแล้ว":** the server's own words, "ชำระแล้ว — ลบไม่ได้ (เงินลงบัญชีแล้ว ให้หลังบ้านปรับ)".
- **"ยอดเงินจะถูกต้อง":** the form shows Total ฿50, Amount payable 50, and it posted as recorded, 1 hour. Hours opens on 1, and a different number multiplies the amount.
- **"ในตารางคลาสจะยังแสดงเป็น Ride":** after the standalone rental, the class still reads Ride, paid, on the API. The class's window read Ride, paid before it. The calendar cell itself only shows an "R" tag, not the tier.
- **"ระบบไม่แจ้งครู":** the form has no coach to notify, and `recordRental` sends nothing (code). I can't observe LINE, and my QA coach isn't linked.
- **The rules:** formal, ครับ, "ขวัญ" without พี่, self-serve first, no internal words.

**NOT_TESTED:**
- **The revenue report's screen and the ledger rows.** No back-office card exists for sid, so "+50" and "+150" are the app's answer and the code. **To settle it, sid only, for the owner (bare SQL), expect 2 rows of 15000 and 5000:**
```sql
SELECT i.name, i.external_ref, m.qty, m.value_minor, m.created_at FROM bo.movement m JOIN bo.item i ON i.id = m.item_id WHERE m.idempotency_key IN ('rental:8d1735e0-6734-4f2b-8006-5a5205a4602a:rental-helmet', 'rental:89637fdb-dbe9-455d-832d-5dfc1f53b2f5:rental-ride');
```
  It's worth doing, because fix 2's wording rests on that name. If you'd rather not ask him, say "ในรายงานจะไม่แสดงเป็น Full Set" and drop the name.

**Your call, not blocking:**
- **Which item to pick:** Helmet and Pads cost the same. I named Helmet so she has one instruction.
- **The date:** it posts on the day she records it, not the class's date (code).
- **Whole-course rentals:** the draft covers a rental "กด paid", which is per session. On a course paid up front, the difference is per session; Hours could carry that, but I didn't run it.

## The run, 2026-11-07
| Step | Result |
|---|---|
| Add "Ride only — 150" with a remark on a 24 Nov 1 HR, through the class's window | 201; reopened it reads "· unpaid", Mark paid + Remove |
| Mark paid, confirm | 200; reopened it reads "· paid", no button |
| API: remove · a second row | 409 `RENTAL_PAID` · 409 `RENTAL_EXISTS` |
| Standalone: Bookings / Students → All bookings → Record rental → Helmet / hr, Hours 1 | Total ฿50; "Rental recorded"; `status: recorded`, `rental-helmet`, 1 hour |
| The class after that | Still Ride, paid |
| The 5 items on each form | Standalone: Helmet / hr · Pads / hr · Helmet + pads / hr · Ride only / hr · Full set / hr. Class: Helmet · Pad · Helmet + Pad · Ride only · Full Set |

**Evidence (`tests/evidence/`, git-ignored):** `test139-3-standalone-options.png` proves the items on the form; `test139-4-standalone-form.png` the ฿50; `test139-6-class-paid-reopened.png` the paid row with no button. Thai: `test139-7-standalone-options-th.png`.

## Observations (not ours; REQ-5005 asks for no build)
- **The class's window didn't refresh after a press.** 1.8 s after "Save rental" (201) it still offered "Add rental"; 2.5 s after "Mark paid" (200) it still read "unpaid" with Mark paid and Remove. Reopened, both were right. I didn't time how long it takes on its own. Staff could press twice; the back's key should stop a double post, but I didn't try it. For Porter to route if it matters.
- **The API accepts a class at 20:00 that the calendar doesn't show** (9 time slots). I made one by API by mistake; the screen wouldn't offer that hour. It cost me a run and is on my setup.

## Test data created (sid, note "QA TEST-139", child `c1743305`, no parent; coach `2ade954f`, not on LINE)
- **2 bookings, both cancelled:** `0ca0de27` (20:00, the mistake) · `89637fdb` (14:00).
- **Rental row on `89637fdb`:** Ride, paid. **It can't be removed;** that's the rule under test.
- **Money left on sid's books, no way to reverse it from here:** Ride +150 (`rental:89637fdb-dbe9-455d-832d-5dfc1f53b2f5:rental-ride`) and Helmet +50 (`rental:8d1735e0-6734-4f2b-8006-5a5205a4602a:rental-helmet`). 200 baht of QA sales, dated 2026-11-07.
- **Uat:** nothing, not opened.

## Customer gate, re-check, 2026-11-07: draft v2: ✅ PASS
**Draft checked:** v2, md5 `918b3c902d4a00e1581a9f704e16afb0` from "ขวัญครับ" to the end of the file (`497286eee16eeab113a36087d91bbb6e` without the last newline).
- **The path:** word for word what I ran on sid's English screen.
- **"ในรายงานรายได้จะไม่แสดงเป็น Full Set":** true without naming the item, since the sale is on the Helmet item. The report screen itself remains unseen, and this wording no longer depends on it.
- **"ไม่มีชื่อเด็กกำกับ":** the form takes no child, and the sale row has no child field; only a reference number (code).
- **"ลงยอดในวันที่บันทึก", your addition:** true. The row takes the time of the post and nothing sets another date (code, `sale-post.ts`).
- **"วิธีนี้ใช้กับการเช่ารายคลาส ... แจ้งกลับมาก่อน", your addition:** fine. It claims only what I ran, and sends the case I didn't run back to the team.
- **The rest:** unchanged and holds, as in TEST-139.

**One thing to know, not a fault:** the path is in English. On a Thai screen the same path reads การจอง / นักเรียน → การจองทั้งหมด → บันทึกค่าเช่า → หมวกกันน็อก / ชม. Her own messages use the English terms, so I left it.

**This replaces the status at the top for the draft.** The SQL isn't needed any more; the revenue report's screen and ledger rows stay NOT_TESTED.

## Follow-up, 2026-11-07: her 10:53 question, a prepaid course rental + forgotten pads: ✅ PASS
**Draft checked:** `COPY-DRAFT-khwan-prepaid-course-extra-pads-2026-11-07.md`, md5 `d1adfd4d13dc6fa747142254156d3239` from "ขวัญครับ" to the end of the file (`f29731f5407ed555c198b9a9fd135688` without the last newline).

**Run on sid, on a QA course (4 classes, Ride only paid up front):**
| Your question | Result |
|---|---|
| Change that class's own rental? | **No.** The class window reads "Rent 150 / Ride only (…) · paid" with no button. API remove: 409 `RENTAL_PAID` |
| Add a second one to that class? | **No.** API: 409 `RENTAL_EXISTS` |
| Standalone Record rental, Pads / hr? | **Works.** Bookings / Students → All bookings → Record rental → Pads / hr · ฿50 → "Rental recorded", `rental-pads` |
| Do Hours multiply? | **Yes.** Hours 1 = ฿50; Hours 2 = ฿100, Amount payable 100, posted with 2 hours |
| Does the course's rental stay? | **Yes.** All 4 classes and the course read Ride, paid, the same before and after |

**Every line of the draft holds:**
- **"ใช้วิธีเดียวกันได้" and the path:** word for word what I ran.
- **"จำนวนชั่วโมงเท่ากับเวลาเรียนของวันนั้น":** matches how the form charges, and REQ-091's "10 hours = 10 rentals". All 2,357 classes I counted on sid from August on are 60 minutes, so a day's hours are its number of classes. I counted only sid. I didn't check uat for longer classes.
- **"ค่าเช่าเดิมของคอร์สไม่เปลี่ยน":** as in the table.
- **"ในตารางคลาสจะยังแสดงการเช่าแบบเดิม":** as in the table.
- **"ลงในวันที่บันทึก", "ไม่มีชื่อเด็กกำกับ", "ไม่แจ้งครู":** same evidence as v2 of the first draft: the form has no child or coach, and the post takes today's time (code). I can't observe LINE; the report screen is unseen, and this draft names no report label.
- **The rules:** formal, ครับ, "ขวัญ" without พี่, self-serve first, no internal words.

**Optional, your call:** the course card also has a button **"Remove from remaining sessions"**. If she tries it to change a prepaid rental, it strips the rental from the remaining classes and moves no money (REQ-091 §14; code, I didn't press it). A line like *"ไม่ต้องกดปุ่ม Remove from remaining sessions"* would head that off. Not needed for a PASS, and adding it means a new md5.

**Left on sid, note "QA TEST-139":** QA child `c0ee09d2` (no parent), QA coach not on LINE. Course `84a9b683`, cancelled, its 4 classes cancelled. Their rental rows stay Ride, paid. Sales that stay on sid's books: Pads +100 (`rental:f128f6de-809a-42c8-82bf-e1d7b805c213:rental-pads`), plus the whole-course Ride posted at creation and the course's own sale; I didn't read those ledger rows.

**Evidence (`tests/evidence/`, git-ignored):** `test139b-1-course-class-window.png` proves the paid class has no button; `test139b-2-standalone-pads-2h.png` the ฿100 at 2 hours; `test139b-3-standalone-pads-recorded.png` that it recorded.
