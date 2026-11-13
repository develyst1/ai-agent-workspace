# COPY-DRAFT: changing a rental already paid, to ขวัญ (from the owner, LINE) — @Porter, 2026-11-07
**Status:** ✅ READY for the owner — Tanya PASS v2, md5 `918b3c90…`. Was: DRAFT v2 → Tanya re-check. v1 FAIL (TEST-139): her steps + limit applied; report name dropped ("ไม่แสดงเป็น Full Set"), so no SQL for the owner. Added: posts on the day recorded (code); whole-course case sent back to us (not run).
**Answers:** REQ-5005 §1. **Facts:** Sober's answer in REQ-5005 · TEST-139 (sid).
**Rules:** formal, ครับ; "ขวัญ" without พี่; self-serve first; no internal words.

---

ขวัญครับ ค่าเช่าที่กด paid แล้ว ตอนนี้ระบบยังแก้แบบเช่าหรือยกเลิก paid ไม่ได้ครับ เพราะเงินลงบัญชีไปแล้ว

กรณีเปลี่ยนจาก Ride (150) เป็น Full Set (200) ให้บันทึกส่วนต่าง 50 บาท โดยไปที่หน้า Bookings / Students แท็บ All bookings กดปุ่ม Record rental เลือก Helmet / hr (฿50) จำนวนชั่วโมง 1 แล้วกด Record rental ครับ ยอดเงินจะถูกต้อง แต่มีข้อจำกัด 3 ข้อครับ
- ในรายงานรายได้จะไม่แสดงเป็น Full Set และไม่มีชื่อเด็กกำกับ โดยลงยอดในวันที่บันทึกครับ
- ในตารางคลาสจะยังแสดงเป็น Ride
- ระบบไม่แจ้งครูเรื่องอุปกรณ์ที่เพิ่ม ต้องแจ้งครูเองครับ

วิธีนี้ใช้กับการเช่ารายคลาส ถ้าเป็นคอร์สที่จ่ายค่าเช่าล่วงหน้าทั้งคอร์ส แจ้งกลับมาก่อนนะครับ
