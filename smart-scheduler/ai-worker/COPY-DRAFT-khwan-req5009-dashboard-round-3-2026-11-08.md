# COPY-DRAFT: REQ-5009 SOM Dashboard round 3 — reply to ขวัญ (from the owner, LINE) — @Porter, 2026-11-08
**Status:** ✅ READY — Tanya PASS v3 (TEST-145), md5 `1bff88bf…`. (deletion only) v2 PASS (d1ecac20); item 5's "จะโทรคุย" line removed because the sample table was sent instead (7:34 PM). Nothing else changed. v1 FAIL (TEST-145, md5 4b6f54a4…): 2 replacements + recommended line-15 addition (both halves) + line 21 applied. Karn's 4 h: already confirmed on uat in TEST-138 ("Karn on uat ✅ … counts Karn at 4 h").
**Searched:** CUSTOMER-ANSWERS.md § SOM Dashboard; REQ-5004 §1 (11-06 numbers, now superseded); REQ-5009 (her words). **Data:** Silver's 5 uat reads (CHECK-REQ-5009 §3: Nov attended 202→203, nationality filled 166; §4: 3 active parents with a typed-in province value).
**Facts:** CHECK-REQ-5009 §1 (screen-only), §2 (capacity, GO 11-08, ≈0.5 d), §3 (people = children with ≥1 ATTENDED lesson in the chosen period; Total Customer = active course/voucher holders; staff can fill the 36), §4 (3 parents; staff re-pick the province, no code).
**Rules:** formal, ครับ; "ขวัญ" without พี่; customer self-serve first; no date promise; no internal words; no parent names in the text.

---

ขวัญครับ เรื่อง Feedback Dashboard จากพี่ปุ้มและพี่ตั้มครับ

1. เรียงลำดับ ใส่สี และเปลี่ยนชื่อการ์ด จะแก้ตามที่แจ้งมาทั้งหมดครับ

2. Coach Capacity จะรวม ECA และ Camp เป็นรายชั่วโมง และใช้ตัวเลขใหม่ FT วันธรรมดา 4 ชม. เสาร์อาทิตย์ 5 ชม. / PT เสาร์อาทิตย์ 5 ชม. / Karn เสาร์อาทิตย์ 4 ชม. ส่วน PT ที่รับงาน FL วันธรรมดาไม่นำมาคำนวณเหมือนเดิมครับ

3. Gender / Nationality ตัวเลข 202 คือเด็กที่มาเรียนอย่างน้อย 1 ครั้งในช่วงเวลาที่เลือก (รวม 1st Trial และ 1 HR) ไม่ได้นับเด็กทุกคนที่ลงทะเบียนไว้ และไม่ตรงกับ Total Customer ที่นับเฉพาะเด็กที่มีคอร์สหรือ Voucher ที่ Active อยู่ ไม่ว่าจะมาเรียนในช่วงนั้นหรือไม่ครับ
   ส่วน 36 คือเด็กที่ยังไม่ได้กรอกสัญชาติ แอดมินเข้าไปกรอกในข้อมูลของเด็กได้เลย ตัวเลขจะลดลงเองครับ
   ถ้าอยากให้ส่วนนี้ (เพศ สัญชาติ อายุ และที่อยู่) นับจากเด็กกลุ่มเดียวกับ Total Customer แทน แจ้งได้ครับ

4. Address ตอนนี้เหลือผู้ปกครอง 3 คนที่ยังมีที่อยู่แบบพิมพ์เองค้างอยู่ แอดมินแก้ได้โดยเข้าไปเลือกจังหวัดใหม่ในข้อมูลผู้ปกครองครับ ถ้าต้องการรายชื่อ 3 คนนี้ ส่งให้ได้ครับ
