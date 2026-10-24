# REQ-127: Change the teacher for the WHOLE (rest of the) course in one act, not session by session
**Intake:** Khwan, LINE, 2026-10-24 21:47 (the owner's paste, 10-25). Verbatim:
> *"เพิ่มเรื่องเปลี่ยนครูทั้งคอร์สด้วยนะคะพี่โด่ง มีเคสแบบนี้มากขึ้นค่ะ ที่ผปคอาจจะขอเปลี่ยนเวลาแล้วครูคนเดิมสอนไม่ได้ต้องเปลี่ยนครูทั้งคอร์ส ค่ะ ตอนนี้เราเปลี่ยนรายครั้งซึ่งบางทีเยอะมาก มานั่งเปลี่ยนรายครั้งค่อนข้างเยอะค่ะ เราสามารถทำยังไงได้บ้างคะ"*

## What she wants
- A parent changes the class time; the old coach can't teach the new time ⇒ **change the coach for the rest of the course in ONE act.**
- Today she changes it **session by session**.

## Checked first
- **ECA / Other series** have a "from this date onwards" swap (REQ-110 / REQ-111). REQ-111 item I: its rate followed the OLD teacher (fixed?).
- **Courses:** the course plan editor (REQ-030, "editable recurring schedule") may already allow changing the teacher + time for the rest of the plan. **For the SA to read.**
- **Related:** REQ-120's bonus rule (a coach change mid-course = the "Special Case"; the admin picks 1st / 2nd / 50-50). Whatever is built must keep that history (who the first coach was).

## Order
1. **Sober (Team A, courses / plan editor):** from code:
   - Can a course's teacher (and time) be changed for the rest of the course today? Where, and how many clicks? What about rates (the new coach's own rate), the coaches' / family's notices, the freelance ceiling, and the first-coach history (for REQ-120 bonuses)?
   - Then: self-serve as-is (with the steps), a small change, or new work (size + claims + any new wording).
2. **Nothing goes to Khwan before Sober's read.**

## Sober's read (10-25): SELF-SERVE via **'พักคอร์ส' → 'กลับมาเรียน'**. The resume re-plans the rest from a date, at a new time, with a new teacher. One schedule message after 'ยืนยันทั้งคอร์ส'. The first-coach history is kept and the FL holds move. The rate stays the course default (no money effect today; settle it in REQ-120). **Optional:** a one-button 'เปลี่ยนครู / เวลา ทั้งคอร์ส' (≈1.65 d); the owner's call.
