# COPY-DRAFT: REQ-5008 voucher used up but still bookable — reply to ขวัญ (from the owner, LINE) — @Porter, 2026-11-08
**Status:** ✅ READY for the owner — Tanya PASS v3 2026-11-08, md5 `f03a6b5b…` (optional line-10 tweak not taken). Owner: v2 too hard to read (*"ไม่เข้าใจ"*, *"แก้ข้อความส่งขวัญอีกที"*) — rewritten in plain words: problem → cause → fix for every voucher → the one question. History: v1 FAIL (76969818), v2 PASS (30e7bd1f) — v2's facts kept; Tanya's line-10 correction kept in substance (no "only at check-in").
**Facts:** REQ-5008 (her verbatim); TEST-143 (uat used 12/10, 1 h left before 11-08, 3 classes that day; sid end to end: booking reserves no hours, attend deducts — check-in or admin's attended); Silver CHECK-REQ-5008 (fix for every voucher; check-in on empty voucher = her call; over-booked list: 2 vouchers on uat).
**Rules:** formal, ครับ; "ขวัญ" without พี่; child's name as she wrote it; questions to ขวัญ only; no internal words; no date promise.

---

ขวัญครับ เรื่อง Voucher ที่หมดแล้วแต่ยังจองได้ ตรวจแล้วเป็นตามที่ขวัญแจ้งครับ

สาเหตุคือตอนจอง ระบบนับเฉพาะคลาสที่เรียนไปแล้ว ไม่ได้นับคลาสที่จองไว้แต่ยังไม่ได้เรียน จึงจองเกินจำนวนที่เหลือได้ และไม่ขึ้นเตือนครับ
ของ Eileen ก่อนวันที่ 8 พ.ย. เหลือ 1 ชั่วโมง แล้ววันนั้นเรียนไป 3 คลาส ตอนนี้ Voucher 10 ชั่วโมงจึงใช้ไป 12 ชั่วโมง เกินมา 2 ชั่วโมงครับ

ทีมจะแก้ให้ระบบนับคลาสที่จองไว้ด้วย ใช้กับ Voucher ทุกใบ ถ้าชั่วโมงไม่พอจะจองไม่ได้ครับ
ส่วน Voucher ที่จองเกินไว้แล้วก่อนแก้ ทีมจะส่งรายการให้แอดมินตรวจครับ

ขอถาม 1 ข้อครับ ถ้า Voucher ที่จองเกินไว้ก่อนแก้ มาเช็คอินตอนชั่วโมงหมดแล้ว อยากให้ระบบทำแบบไหนครับ
A. ขึ้นเตือน แต่ยังเช็คอินได้
B. ไม่ให้เช็คอิน
