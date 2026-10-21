# COPY DRAFT — to Palm (through the owner): the Daily Report's Others Program shows SAMPLE numbers on empty days — @Porter, 2026-10-21
Status: ✅ SENT by the owner 2026-10-21. (Was: DRAFT for the owner.) From Tanya's TEST-113 (uat, read-only). Palm's file; we don't edit it.

---
ปาล์ม หน้า Daily Report ส่วน Others Program ด้านล่าง วันที่ไม่มีเด็กโปรแกรมเลย (เช่น 18 ต.ค. แบบ All teachers หรือเลือกครูที่ไม่มีคลาสโปรแกรม) หน้าจอขึ้นตัวเลขตัวอย่าง Group 8 / ECA 13 / Camp 8 / Other 10 (Balance Play 3, Skate Crew 5, STA 5, ISB 8, October Camp W2, Birthday 8, Rent park 2) ทั้งที่ API ส่ง kidsByProgram ว่างมา

น่าจะมาจาก ReportsContent.tsx ประมาณบรรทัด 244-269 ที่ SHOW_SAMPLE_WHEN_EMPTY = true กับ SAMPLE_PROGRAMS ในคอมเมนต์เขียนไว้ว่า TEMPORARY ให้ลบเมื่อ /reports/daily ส่ง kidsByProgram แล้ว ซึ่ง back ส่งให้ตั้งแต่ 19 ต.ค.

ช่วยเอาตัวอย่างออก ให้วันที่ว่างแสดงเป็นว่าง (หรือ "—") แทนนะ

ส่วนตัวเลขอื่นในหน้า Daily Report ทีมนับเทียบบน uat แล้ว 3 วัน ทุกช่อง ทั้ง All teachers และครูทุกคน ตรงกับระบบหมด
