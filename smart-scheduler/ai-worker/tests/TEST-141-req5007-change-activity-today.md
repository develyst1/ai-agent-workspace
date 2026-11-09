# TEST-141: REQ-5007, today's self-serve route for changing a course's activity
**Status:** Findings only, no verdict on a fix. The route works on the screen; the ledger is NOT_TESTED until the SQL returns.
**Source:** Porter's brief in `inbox/QA.md` · `requirements/REQ-5007-*.md` · `CHECK-REQ-5007-money-2026-11-07.md`.
**Instrument:** the real screens on sid, headless, desktop, `som` card, no password. Setup and cleanup by API. **Build:** what's on sid; no version is shown.

**1. The course route works, and here is the exact path. The case: 6-session Bike / Scooter (฿6,490 on the card), 2 attended, moved to Private ONEWHEEL E-SKATE.**
1. **End the old course:** Bookings / Students → type the child's name → **Manage plan** → **End course early** → reason **"Customer changed activity"** → **End course early**. The dialog says "the 4 remaining sessions are removed. It cannot be undone."
2. **Make the new one:** Bookings / Students → **New course** → Student, Teacher, Program, Course size → **Discount: Baht + amount + Reason** → date and time → **Generate plan** → **Create plan**.

| Question | Seen on sid |
|---|---|
| Does attended history stay? | **Yes.** The 2 attended classes stay ATTENDED under the old activity; the old course's used count stays 2. The 4 to come are CANCELLED |
| The old course afterwards | Status CANCELLED, reason `PROGRAM_CHANGED`, so it sits under the Cancelled filter |
| Can a discount net it down? | **Yes on the screen, when the new course costs more:** Full price 7,900 · Discount −6,490 · **Amount payable 1,410**. The Create plan call answered 201 |
| When the new course costs less | **No.** "A discount cannot exceed the full price", and Generate plan is disabled. It can reach ฿0 at most, so the books stay over by the rest. Example from the card: 6 h Balance Private 7,490 → Balance Group 5,290 would stay 2,200 over. Refusal seen at 8,000 against 7,900; this example itself not run |

**Limits she'll hit that the route doesn't tell her:**
- **A new course counts from zero, in sizes 4, 6 or 10.** "The remaining 4" doesn't carry over. Here 2 attended + a new 6 would give the family 8 classes. And 6,490 was for 6 classes, so "discount = the old sale" gives credit for the 2 already attended. What's fair is the owner's call, not mine.
- **Same-size only isn't always possible:** Silver's 4 h dead end stands; the size list follows the program, and I read it only for Onewheel.
- **The discount's Reason is required.** It's her only note linking the two courses; nothing on the screen connects them.

**The recorded amounts: NOT read.** The front's API has no money on a course (its fields carry only a coach rate), and there's no back-office card for sid. So 1,410 is what the form says, not what the ledger holds. **To settle it, sid only, for the owner (bare SQL). I expect the old course +649000, the new +790000 and a discount −649000:**
```sql
SELECT m.ref_id, i.external_ref, i.name, m.qty, m.value_minor, m.reason, m.created_at FROM bo.movement m JOIN bo.item i ON i.id = m.item_id WHERE m.ref_id IN ('410bf1d7-b22a-4ef7-8cfe-36b332ae0d94', '42fd162b-9962-4fe4-ae47-2eb6e620f705') ORDER BY m.created_at;
```
It also shows whether ending or cancelling either course moved money.

**2. 1 HR and Trial: no edit-activity control on the screen. Only cancel + rebook.**
- **Class window:** More actions → Move session · Record leave/sick · Pause · Cancel booking.
- **Move session form, both:** Teacher, Date, Time. No activity.
- **So Sober's "certain" route is the only one on screen.** I read the Cancel booking item but didn't run cancel + rebook through the screen.
- **Worth knowing:** the API behind Move does accept a new activity (`PATCH /bookings/:id` with `subjectId`: 200, a pending 1 HR's subject changed). The screen doesn't offer it, so it isn't a route for her today.

**Not run:** family and coach notices (my children have no parent; the coaches aren't on LINE). The SOM Dashboard and Daily Report after the route. A Thai walk: the reason's Thai wording I only read in the dictionary ("ลูกค้าเปลี่ยนกิจกรรม"), which differs from Sober's "เปลี่ยนโปรแกรม". Uat. The reason list in full: Customer changed activity · Customer no longer wants it · Admin entered it by mistake · Course ended early.

**Evidence (`tests/evidence/`, git-ignored):** `test141-2-end-dialog.png` · `test141-12-discount-6490.png` the 1,410 · `test141-11-discount-too-big.png` the refusal · `test141-5-hr-menu.png` + `test141-6-hr-edit.png` no activity control · `test141-13-created.png`.

## Test data created
**Left on sid, note "QA TEST-141":** QA child `a067deb5` (no parent): course `410bf1d7` ended (`PROGRAM_CHANGED`), course `42fd162b` cancelled (ADMIN_ERROR; it used coach Bank, not on LINE, because no QA coach teaches Onewheel). QA children `36b65ff8`, `b58bf6da`: a 1 HR `743794c4` (its activity changed by my API call) and a Trial `e5905043`, both cancelled. Coach `f453d207`. Both courses' sales stay on sid's books; that's what the SQL reads.
**Uat:** not opened.

## Customer gate + cancel-and-rebook run, 2026-11-07: 🔧 FAIL, 2 lines
**Draft checked:** `COPY-DRAFT-khwan-change-activity-today-2026-11-07.md`, md5 `1529181d7ed6e9d019ede52a353e9adb` from "ขวัญครับ" to the end of the file (`57ff1764f22329a46677322351751476` without the last newline).

**The owner's SQL closes the money question on sid:** old course +6,490; new course +7,900 and −6,490, so the new sale nets to 1,410 as the form said. Ending and cancelling posted nothing. Recorded in TEST-141 as his result, via you.

**Cancel + rebook: I ran it, on the real screens. No need to word it down.**
- **1 HR:** Cancel booking, then a new 1 HR in the new activity: saved as Private FREESKATE; the old row stays CANCELLED with `PROGRAM_CHANGED`.
- **Trial:** the same; a second 1st Trial for the same child is accepted once the first is cancelled, in the new activity.

**🔧 FAIL, 2 lines to fix:**
1. **Line 12, "ใส่ส่วนลด", doesn't say where, and it's easy to miss.** The Discount is on the first page of the form. Once she presses Generate plan, the page only offers Create plan. The sale posts at creation, so a missed discount leaves the revenue doubled.
   - **Replace with:** *"2. กด New course เปิดคอร์สใหม่ในกิจกรรมใหม่ ในหน้าแรกของฟอร์ม (ก่อนกด Generate plan) ช่อง Discount เลือก Baht ใส่ส่วนลดเท่ากับยอดที่ยกมา พร้อมระบุเหตุผล"*
2. **Line 20 has no path, and the same 2-button trap as before.** The dialog also needs a reason, and its buttons are "Cancel", which only closes it, and "Cancel booking".
   - **Replace with:** *"ที่หน้า Schedule กดคลาสนั้น กด ⋮ เลือก Cancel booking เลือกเหตุผล Customer changed activity แล้วกดปุ่ม Cancel booking (ปุ่ม Cancel เฉยๆ คือปิดหน้าต่าง) จากนั้นกด + ในช่องของครูวันนั้นเพื่อจองใหม่ในกิจกรรมใหม่ครับ ใช้กับคลาสที่ยังไม่ได้เรียนเท่านั้น"*
   - **Why "ยังไม่ได้เรียน":** my API call to cancel an attended 1 HR answered 200, so nothing stops it there. What that does to its sale, I didn't read; I didn't get the screen's menu on an attended 1 HR either. The draft shouldn't send her down that road.

**Holds:**
- **"ระบบยังเปลี่ยนในคอร์สเดิมไม่ได้":** REQ-053 and the screen.
- **Line 11, End course early:** word for word what I ran. The rows are cancelled rather than deleted; "ถูกลบ" is the dialog's own word.
- **"คลาสที่เรียนไปแล้วจะยังนับเป็นกิจกรรมเดิม":** the rows stay on the old activity on sid. That the reports count them that way is Sober's code reading, not run.
- **The 3 limits:** the sizes 4, 6, 10, seen. A discount over the new price refused, seen; the example's overstated total is arithmetic. No link between courses, seen.
- **The last line:** promises no date and nothing built.
- **The rules:** formal, ครับ, "ขวัญ" without พี่, self-serve first, no internal words, no credit amount stated.

**Your call, not blocking:**
- **"ยอดที่ยกมา" leaves the amount to her.** On the card it's the old sale; the 2 attended classes are in it. Her question to him is likely to be exactly that.
- **The form showed "Full price 1,390" on the 1st Trial,** the card's 1 h price for that program. I didn't read what a Trial really posts; Silver says one price for every program. It's outside this draft, but she'd see it there.
- **Not run:** family and coach notices, which the draft doesn't claim. Uat.

**Test data, sid, note "QA TEST-141":** QA children `c0ee09d2`, `44b98eb2`, `7bdf9134` (no parent), coach `f453d207` (not on LINE). All cancelled: 1 HRs `458d7afc`, `bc3e079f`; Trials `dff32d34`, `e447d80b`; the attended 1 HR `76f143fa`. Any sale from that attended class may remain; I didn't read it.

## Customer gate, re-check, 2026-11-07: draft v2: ✅ PASS
**Draft checked:** v2, md5 `1eb865f5e0a9cfaba846b7e7d68794bf` from "ขวัญครับ" to the end of the file (`4a4e217b5abf298b4feb4ec01ef0b94f` without the last newline).
- **My 2 replacements are in, word for word.** Each step is what I ran on sid's English screen. The rest is unchanged and holds, as in my v1 check.
- **"ยอดที่ยกมา" stays open,** as you said; the amount is the owner's. The text doesn't state one, so it claims nothing wrong.

**This PASS rests on:** sid only, with the money from the owner's SQL. Family and coach notices aren't run and aren't claimed. How the reports count attended classes is Sober's code reading.
