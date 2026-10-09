# COPY DRAFT — to Khwan: camp coaches fixed, and what her team does now (REQ-116) — @Porter, 2026-10-08
Status: ✅ READY for the owner to send. TEST-091 on sid PASSED (PENDING Other rows block the add, cancelling them in the UI unblocks it and the camp block shows, cancelled rows block nothing). Owner condition "fixed + tested 100%" is met: TEST-089 · TEST-090 · TEST-091.
**Facts from:** TEST-089 (reproduced + fixed on sid) · TEST-090 (uat read-only: 0 coaches saved, 28 PENDING "Balance Camp 12-16 Oct" Other rows) · Sober's code read, `inbox/PM.md` 2026-10-08 "the four answers" (PENDING holds the slot · cancelling a PENDING booking messages nobody · day rate defaults to 0).
Supersedes `COPY-DRAFT-khwan-camp-req116-2026-10-08.md` (the "check the hours" version, which TEST-090 proved wrong).

**Bubble 1**
ขวัญครับ เรื่องลงครูแคมป์ แก้เสร็จและทดสอบผ่านแล้วนะครับ ✅
ตอนนี้ลงครูที่ตั้งเวลาเองได้แล้ว ไม่ขึ้นเตือนผิด ๆ และเวลาครูคนอื่นจะไม่โดนเปลี่ยนเองแล้วครับ

**Bubble 2**
ทีมเช็คในระบบแล้วครับ ครูแคมป์ 12–16 ต.ค. ยังไม่ได้ถูกบันทึกเลย เพราะที่กดไว้โดนบั๊กปฏิเสธหมด
ส่วนที่เห็นในตารางครูตอนนี้ คือรายการ "Balance Camp 12-16 Oct" ที่ทีมสร้างเป็น "อื่นๆ" ไว้ 28 รายการครับ

**Bubble 3**
รบกวนทีมทำตามนี้ครับ
1. ยกเลิกรายการ "Balance Camp 12-16 Oct" ทั้ง 28 รายการก่อน ทีละรายการ (เปิดรายการ → ยกเลิกการจอง → เลือกเหตุผล เช่น "แอดมินคีย์ผิด") ไม่มีข้อความแจ้งไปหาครูหรือผู้ปกครองนะครับ
2. เข้าแคมป์ "12-16 Oct" ตัวที่เปิดอยู่ แล้วลงครูแต่ละวันพร้อมเวลา และใส่ค่าสอนของครูแต่ละคนด้วย (ถ้าไม่ใส่ระบบจะเป็น 0)
3. กดบันทึก แล้วเปิดดูอีกทีว่าเวลาและค่าสอนตรงครับ

**Bubble 4**
ถ้ายังไม่ได้ยกเลิกรายการ Balance Camp ระบบจะเตือนว่าครูมีคาบแล้ว รอบนี้เตือนถูกนะครับ เพราะรายการนั้นจองช่องครูไว้อยู่
พอลงครูในแคมป์แล้ว ครูจะเห็นแคมป์ในตารางและในแจ้งเตือนรายวันของตัวเองด้วยครับ

**Bubble 5**
อีกเรื่องครับ ในระบบมีแคมป์ที่ทับวันที่ 12 อยู่ 3 ตัว คือ "12-16 Oct" (เปิด), "12 -16 Oct" (ปิด) และ "12-13 Oct" (ปิด มีเด็ก 2 คน)
ตัวไหนใช้จริงบ้างครับ ตัวที่ไม่ใช้และไม่มีเด็ก ลบได้จากหน้าแคมป์เลยครับ
