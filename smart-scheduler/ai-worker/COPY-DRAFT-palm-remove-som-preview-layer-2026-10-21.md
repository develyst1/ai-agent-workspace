# COPY DRAFT — to Palm (through the owner): remove the SOM preview layer now that the back sends every field — @Porter, 2026-10-21
Status: ✅ SENT by the owner 2026-10-21. (Was: DRAFT for the owner) (polite, ครับ: owner 10-21). From Tanya's TEST-114 §4 (0 preview numbers showing today on sid + uat; two LATENT risks). Palm's code; we don't edit it.

---
ปาล์มครับ ขอบคุณที่แก้ตัวเลขตัวอย่างใน Daily Report ครับ เทสบน dev แล้วผ่าน หน้าแขวงก็ตรงกับข้อมูลแล้วครับ

อีกเรื่องหนึ่งครับ ตอนนี้หน้า SOM ยังมี lib/som/preview.ts (commit cd42268) ทำงานอยู่ ทีมเช็คแล้วว่าตอนนี้ยังไม่มีตัวเลขสมมติขึ้นบนหน้าจอ ทั้งบน dev และ uat เพราะ back ส่งครบทุก field แล้วครับ แต่ยังเสี่ยงอยู่ 2 จุดครับ
1. ถ้า field ไหน API ส่ง null มา preview จะเติมตัวเลขที่ดูสมจริงลงไปแทนเงียบๆ
2. modal ของ New vs Renewing ถ้า request error จะขึ้นรายชื่อเด็กที่แต่งขึ้นมา

ในคอมเมนต์ของปาล์มเขียนไว้ว่าให้ลบ preview ออกเมื่อ back ส่งครบ ซึ่งตอนนี้ส่งครบแล้วครับ รบกวนช่วยลบ preview ออก ให้ field ที่ว่างแสดงเป็น "—" และให้ modal แสดง error แทนด้วยครับ ขอบคุณครับ
