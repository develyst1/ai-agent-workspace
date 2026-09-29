# COPY REVIEW — the REQ-110 round
**ONE file for every new draft string in this round**, per @Porter (2026-09-29). **It grows as the round goes; @Porter sends it to the owner when he judges it worth his time.**
🔑 **Code is never held for these.** **Every string below is already live behind a SHAPE pin, so the owner can rewrite every word and nothing breaks.**
⚠️ **@Porter: the "where / when" and "what it promises" lines are mine, in English. You own the Thai** if he reads this file himself.

📌 **Still open from the 09-28 file:** nothing — **§A–§E and the eight §D2 labels are all approved and now pinned by value.**

---

## 1 · Bookings page — the "select all" label 📋 DRAFT
**Where / When:** the Booking list, above the tick column, when an admin is confirming several sessions at once.
**Was:** *"Select all pending"* / *"เลือกทั้งหมดที่รอยืนยัน"*
**Now (draft):** *"Select all that can be confirmed (this page)"* / *"เลือกทั้งหมดที่ยืนยันได้ (หน้านี้)"*
**Promises:** it ticks **every row on THIS page that the system will accept**, and nothing on other pages.
🔑 **Why it had to change:** **Khwan asked for Extended sessions to be confirmable in bulk, and they now are — which made the old label a lie.** *It said "pending" while the control had stopped meaning pending.*
📌 **Two things deliberately kept in the words: it no longer says "pending" alone, and it still says "this page"** — *an admin who thinks they ticked the whole list is the next complaint.*

---

## 2 · Item 5 — the coach who GAINS a class ✅ no new wording needed
**Where / When:** an admin covers ONE session with another coach (Swap or Move session), or adds a coach to one session.
**Finding (@Jason, TASK-562):** these doors **already send approved notices**. Nothing new is drafted:
- the coach who **gains** the class gets `teacher_assigned` (date + time);
- the coach who **loses** it gets `teacher_unassigned`;
- an **added** coach gets `other_teacher_added`, listing just that one date.
**Promises:** the gaining coach is told, and so is the losing one. **The losing half needed no new ruling: it was already told.**

---

## 3 · Item 5 — cover with no rate on file (admin, Thai only like every admin error) 📋 DRAFT
**Where / When:** an admin covers one session with a coach who has **no rate in that series**, and leaves the rate empty.
**Now (draft):** *"วันที่ <date>: ครูที่มาสอนแทนยังไม่มีค่าสอนในตารางนี้ — กรุณาระบุค่าสอนของครูที่สอนแทน"*
**Promises:** nothing is saved. The admin types the covering coach's rate. 🔑 **The system never pays the cover at the covered coach's rate by default** (the owner: the cover is paid at the covering coach's rate).

## 4 · Item 5 — "this session, or from here on?" (admin) 📋 DRAFT
**Where / When:** a request to add or swap a coach that names neither choice. The screen should always ask, so an admin only sees this if the screen didn't.
**Now (draft):** *"เลือกอย่างใดอย่างหนึ่ง: เฉพาะครั้งนี้ หรือ ตั้งแต่ครั้งนี้เป็นต้นไป"*
**Promises:** nothing is saved until one is chosen. 🔑 **This is Khwan's complaint turned into a rule: no silent "all".**

---

## 5 · Item 2 — a coach on an advance leave that day (admin) 📋 DRAFT
**Where / When:** any new booking, move, swap, co-teacher or cover onto a day the coach has an advance leave recorded. Also an Undo or re-confirm that would put a class back on that day.
**Now (draft):** *"ครู<ชื่อ> ลาวันที่ <date> — เพิ่มคาบกับครูวันนี้ไม่ได้ กรุณาเลือกครูอื่นหรือวันอื่น"*
**Promises:** nothing is saved; pick another coach or another day. *(Automatic make-ups never show this: they skip to the next free week.)*

## 6 · Item 8 — deleting a camp week that has bookings (admin) 📋 DRAFT
**Where / When:** an admin deletes a camp week, and at that moment it has bookings (even cancelled ones).
**Now (draft):** *"ลบสัปดาห์ <ชื่อ> ไม่ได้: มีการจองวันแคมป์ <n> รายการ[ และที่ยกเลิกแล้ว <m> รายการ] — ใช้ "ปิดรับ" แทน เพื่อหยุดรับจองใหม่ (การจองเดิมยังอยู่)"*
**Promises:** nothing is deleted; Close is the way to stop new bookings. ⚠️ **"Existing bookings stay" is only fully true after the Close ruling that is with the owner (TASK-560 finding).**
**Its twin** (a booking made while the week was being deleted): *"สัปดาห์ <ชื่อ> ถูกลบไปแล้ว — ไม่ได้บันทึกอะไร กรุณาเลือกสัปดาห์อื่น"*

## 7 · TASK-556 — Undo refused for an older course (admin) 📋 DRAFT
**Where / When:** undoing a leave on a course opened before this box began recording expiry changes, where the make-up sits on the expiry.
**Now (draft):** *"ย้อนกลับการลานี้อัตโนมัติไม่ได้: คอร์สนี้เปิดก่อนระบบเริ่มบันทึกการเลื่อนวันหมดอายุ (เริ่มบันทึก <date>) จึงบอกไม่ได้ว่าวันหมดอายุ <expiry> ถูกเลื่อนเพราะคาบขยาย <make-up date> หรือไม่ — กรุณาเปิดหน้าคอร์ส ตรวจวันหมดอายุกับประวัติการลา แล้วแก้การลาและวันหมดอายุด้วยตนเอง"*
**Promises:** nothing changes. It says **what to open and what to fix**, not that a computation failed.

---

## 8 · Item 10 — duplicate name on the LINE register form (PARENT-facing, both languages) 📋 DRAFT
**Where / When:** a parent registers a child whose name is already in their family.
**Was** (the page copies the chat's `add_dup_detail`): *"There is already a child with that name. Please add a surname or nickname so they are not mixed up."*
**Now (draft):** *"มีน้องชื่อนี้ในครอบครัวแล้ว — กรุณาใส่ชื่อจริงของน้อง (ชื่อ-นามสกุล) เพื่อไม่ให้สับสนกันค่ะ"* / *"There is already a child with this name. Please enter the child's real name (first name and surname) so they are not mixed up."*
**Promises:** the form stays open with the name field; the next submit is accepted with the fuller name.
📌 **These words live on the PAGE** (the server returns only the code `NAME_DUPLICATE_NEEDS_DETAIL`, which is unchanged). ⚠️ **The LINE chat has its own copy of this sentence and keeps "more detail":** the owner named the page only. Say if the chat should match.

## 9 · Item 10 — the two new "required" messages on the register form (PARENT-facing) 📋 DRAFT
**Where / When:** the parent presses submit with the birthday empty (`BIRTHDATE_REQUIRED`), or with no address while the family has none on file yet (`ADDRESS_REQUIRED`). The page should stop them earlier with the `*`, so these are the server's backstop.
**Now (draft):**
- *"กรุณาใส่วันเกิดของน้อง (วว-ดด-ปปปป เช่น 02-12-2020)"* / *"Please enter the child's birthday (DD-MM-YYYY, e.g. 02-12-2020)."*
- *"กรุณาเลือกจังหวัดและใส่ที่อยู่ (ถามครั้งเดียวต่อครอบครัว)"* / *"Please choose the province and enter your address (we only ask once per family)."*
**Promises:** nothing is saved until filled; the address is not asked again for the next child.
⚠️ **One existing sentence becomes FALSE:** the invalid-birthday message ends *"…or leave it blank"*. **Leaving it blank is no longer allowed**, so that half-sentence must go (the page's copy).

---

## Waiting to be added this round
