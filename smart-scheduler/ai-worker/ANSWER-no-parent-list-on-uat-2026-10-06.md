# ANSWER — Khwan's question about the "no parent linked (18)" list on uat — @Silver → @Porter, 2026-10-06
🚫 Nothing is cut and nothing is changed. Read in code today; **CERTAIN** unless marked.

## 1. With no parent linked, what exactly does NOT work? **Her guess is half right; here is the whole of it**
**The rule underneath:** every door a FAMILY uses goes **parent → their children → those children's classes**. A student with no parent is on no family's list, so **no family door ever reaches them.**
- **Family-facing notices:** each parent-side message is written with **no recipient, then SKIPPED** (`enqueueParentCopies` with no account ⇒ `recipientLineUserId: null`, `scheduler.service.ts:4780-4781`). Nothing is sent to anyone.

**❌ What does NOT work (for that student's family):**
- **No LINE message reaches any family:**
  - no "class confirmed" (this is her *"คอนเฟิร์มไม่เด้ง"*: ✅ correct, the message does not arrive);
  - no daily reminder;
  - no notice when a class is moved or cancelled;
  - no course-deduction notice.
- **LINE check-in finds nothing** (her *"เช็คอินจะไม่ขึ้น"*: ✅ correct). The bot looks up the parent's children (`checkin.service.ts:154-160`), and this student is nobody's child. The **shop QR** check-in looks up by phone and finds nothing either.
- **LINE leave finds nothing:** a parent cannot request leave for this student through the bot.
- **"My courses" / "my children" in LINE** do not show this student.

**✅ What STILL works (so nobody stops doing their job):**
- **Everything in the web app:** booking, confirming, moving, cancelling, attendance, courses, vouchers. **Confirming DOES work.** The class is confirmed; only the family's LINE message is skipped.
- **Teachers still get their LINE notices** for these classes (the teacher side does not depend on the family).
- **The end-of-day auto check-in still runs** for confirmed classes, and attendance and the course balance still count.

**In words Porter can send (Thai, for the owner to adjust):**
> รายการนี้คือ "รายชื่อนักเรียนที่ยังไม่ได้ผูกกับผู้ปกครอง" ค่ะ ในระบบหลังบ้านทุกอย่างยังทำงานปกติ — จอง, คอนเฟิร์ม, ย้าย, เช็คชื่อ, ตัดคอร์ส ได้หมด และครูยังได้รับแจ้งเตือนตามปกติ
> สิ่งที่ "ไม่เกิด" คือฝั่งผู้ปกครองใน LINE: ไม่มีข้อความคอนเฟิร์ม/แจ้งเตือนเด้งไปหาใคร, ผู้ปกครองเช็คอินหรือขอลาผ่าน LINE ให้น้องคนนี้ไม่ได้ เพราะยังไม่มีผู้ปกครองคนไหนผูกกับรายชื่อนี้
> รายการนี้มีทั้งเด็กจริง และชื่อคลาส/โรงเรียนที่ทีมสร้างไว้เป็นรายชื่อนักเรียน (เช่น ISB (ECA)) — อย่างหลังไม่มีผู้ปกครองอยู่แล้ว จึงไม่มีผลอะไรค่ะ

## 2. Can the list separate a class TITLE from a CHILD, from data we already hold? **No, not reliably.**
- **A student row holds:** name, nickname, birth date, parent, archived flag, plus the bookings and courses that point at it. **There is no field that says "this is a person" or "this is a title".**
  - Sober's "not a person" flag was considered and retired on 10-04, after Khwan said `ISB (ECA)` was a mistake.
- **"Has a course / has none" is not a reliable split** (INFERRED, not counted on uat):
  - a real child can be a new record with **no course yet** (e.g. booked a single session or a trial);
  - a title row may hold a course if staff booked one onto it, which is exactly how the Ari case was born.
  - **It would be a heuristic wearing a rule's clothes.**
- **Names are no basis at all.** Porter is right: `Kim`, `Preme`, `Ryu` and `sya` are ordinary nicknames, and `STA/Check` is not a person.
- ⇒ **Any split we add today is a GUESS, and a list that quietly hides rows it guesses are not people is worse than the one we have.**

## 3. The honest answer: tell her what the list IS. ✅ **Recommended.**
- **The list is:** *every live student record with no household*, including the class and school titles her team created as students. It is complete by design: that is what makes it trustworthy as a finding aid.
- **The explainer under the switch is accurate for children and merely redundant for titles.** No wording change is needed for it to be true.
- **The one thing that WOULD make the list more useful, offered only as an owner question (not proposed):**
  - **Today a parentless record cannot be archived from the screen.** The archive action lives inside a family on the People page, so these rows are unreachable. Archiving a title row would drop it off this list (the list shows live records only).
  - **Adding an "archive" action to this list** would let her team clear the titles themselves.
  - ⚠️ **But the owner's approved judgement #3 for this list was "no action button".** Archive is not "fixing the parent", so it may not conflict, but it is **his** call. Size if he wants it: FE S + reuse the existing `POST /students/:id/archive`.
- 📌 **The owner's ruling that `ISB (ECA)` is left alone stands.** None of this touches those rows.

## Summary for Porter
1. **Her guess is right about the LINE side** (no confirm message, no LINE check-in) and **incomplete**: also no reminders, no move or cancel notices, and no LINE leave. **And it is wrong if she takes it to mean the system stops working:** confirming, attendance and courses all still work in the web app, and teachers are still notified.
2. **Title vs child: cannot be separated from current data without guessing.**
3. **Recommend: explain the list as it is.** One optional owner question: an "archive" action on this list (FE S).
