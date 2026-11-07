# COPY-DRAFT: Palm's 3 questions on the SOM API, from the owner — @Porter, 2026-11-07
**Status:** READY for the owner (internal developer). **Facts:** TASK-757 · `CHECK-REQ-5004-som-round-2-2026-11-06.md` §4.6 · TEST-138 (all-data echo seen on sid: 2026-08-18 → 2026-11-07, `month` null).

---

Palm ครับ ตอบ 3 ข้อครับ

1. 1st Trial / 1 HR (last 3 months) นับ 3 เดือนปฏิทินที่จบที่เดือนสุดท้ายของช่วงที่เลือกครับ เลือกทั้งหมดจะจบที่เดือนปัจจุบัน กำหนดวันจะจบที่เดือนของ to ส่วน recentFrom / recentTo ส่งเป็น YYYY-MM ของ 3 เดือนนั้น เช่น to เป็น 2026-10-15 จะได้ 2026-08 ถึง 2026-10 ครับ
2. New Course ตอนไม่ได้เลือกเดือน นับคอร์สแรกของเด็กที่เปิดในช่วงนั้น แล้วแยกทีละแถวครับ ถ้า 1st อยู่เดือนเดียวกับที่ซื้อคอร์สเป็น this month ถ้า 1st อยู่เดือนก่อนหน้าเป็น previous month ครับ
3. ตอนเลือกทั้งหมด from / to ไม่เป็น null ครับ from คือวันแรกของข้อมูล (คลาสแรกที่ไม่ถูกยกเลิก) to คือวันนี้ ตัวอย่างบน sid คือ 2026-08-18 ถึง 2026-11-07 ส่วน month เป็น null ครับ
