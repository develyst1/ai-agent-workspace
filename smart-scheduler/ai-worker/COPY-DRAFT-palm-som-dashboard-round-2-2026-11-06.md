# COPY-DRAFT: SOM Dashboard round 2, screen changes, to Palm (from the owner) — @Porter, 2026-11-06
**Status:** READY for the owner (internal developer, no customer gate). Source: REQ-5004 · `CHECK-REQ-5004-som-round-2-2026-11-06.md` §4.1. Polite, ครับ.

---

Palm ครับ ลูกค้าขอแก้ SOM Dashboard เพิ่ม มีส่วนหน้าจอ 3 เรื่องครับ

1. หัวข้อ 5 จุด ให้ขึ้นต้นทุกคำด้วยตัวใหญ่ครับ: Existing Customers · New vs Renewing · Coach Capacity · Coach Name · Coach Type (ใน lib/i18n/dictionaries.ts)
2. ช่วงเวลา: เปิดหน้ามาให้แสดงข้อมูลทั้งหมดก่อน แล้วให้เลือกได้ 3 แบบ คือ ทั้งหมด · รายเดือน · กำหนดวันเอง (จากวันที่ถึงวันที่) ครับ
   - ฝั่ง back เพิ่ม query `from` + `to` (รูปแบบ YYYY-MM-DD ส่งคู่กัน ห้ามเป็นวันในอนาคต) หรือ `month` เหมือนเดิม หรือไม่ส่งเลย = ข้อมูลทั้งหมด ถ้าส่ง month พร้อมช่วงวันจะได้ 400 ครับ
   - endpoint ของ list modal รับแบบเดียวกัน ต้องส่งช่วงเวลาไปด้วยครับ
   - ข้อมูลที่ตอบกลับ ทุก section มี `from` + `to` เพิ่ม และ `month` จะเป็น null ถ้าไม่ได้เลือกเดือน ดังนั้น label ของ section และ som.capacityMonth ต้องอ่านจากช่วงวันแทนครับ
3. Coach Capacity: ครู FL ให้แสดงเฉพาะชั่วโมงที่สอนไป ไม่ต้องมี "/ h" % และแถบครับ ฝั่ง back ส่ง FL มาเป็นชั่วโมงที่สอนได้ = 0 รูปแบบเดิม แยกด้วย `teacherType` ครับ
   - ครู PT ที่วันธรรมดาเป็น FL ช่องวันธรรมดาจะเป็น "/ 0" ถ้าเห็นสมควรซ่อนได้ครับ

ฝั่ง back จะขึ้นก่อนได้โดยหน้าจอปัจจุบันไม่พัง เอกสาร docs/backend-som-dashboard.md (§0.1, §2, §4) ทีมจะอัปเดตให้ครับ ขอบคุณครับ
