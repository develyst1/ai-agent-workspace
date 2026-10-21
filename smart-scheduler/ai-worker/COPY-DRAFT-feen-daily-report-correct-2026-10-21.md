# COPY DRAFT — to ฟีน (CEO), LINE group: "is the Daily Report data correct now?" — @Porter, 2026-10-21
Status: ⏸️ HELD until Tanya's TEST-113 (the uat recount of every card, incl. Others Program) PASSES. Definitions from Silver (`inbox/PM.md` 10-21), from the code as built. Her words: *"สรุปหน้านี้ข้อมูลถูกแล้วเนอะ @Dong_08"*.
**The first line is filled from TEST-113.** If TEST-113 finds a mismatch, this draft is NOT sent; the fix comes first.

---
พี่ฟีนครับ ทีมตรวจหน้า Daily Report บนระบบจริงแล้วครับ นับเองเทียบกับระบบ {N} วัน ทุกช่องรวมส่วนด้านล่าง ตรงทั้งหมดครับ

**แต่ละช่องนับอะไร**
- ช่องด้านบนนับเฉพาะ 1st Trial, 1 HR, Course, Voucher **นับเป็นจำนวนคาบ ไม่ใช่จำนวนคน** (เด็ก 1 คนมี 2 คาบ = 2, DUO 1 คาบ = 1)
- **Total booked = Confirmed + ลา** ส่วน Pending, Awaiting, Cancelled แยกไว้ต่างหาก ไม่รวมใน Total
- **Confirmed** รวมคาบที่มาเรียนแล้วด้วย
- **% วงกลม = มาเรียน ÷ Total booked**
- **ส่วนด้านล่าง (Others Program) นับเป็นจำนวนเด็ก:**
  - Group = เด็กที่นั่งในคลาสกลุ่ม (ไม่นับคนที่ยกเลิก ลา หรือพัก)
  - ECA และ Other = จำนวนเด็กที่แอดมินพิมพ์ไว้ในคลาส นับครั้งเดียวต่อคลาส แม้คลาสยาว 2 ชั่วโมง ถ้าแอดมินไม่ได้ใส่ จะขึ้น "—"
  - Camp = เด็กที่จองแคมป์วันนั้น (รวมคนที่ไม่มา)
- Group, ECA, Camp ไม่อยู่ในช่องด้านบน อยู่ในส่วนด้านล่างเท่านั้น
- ภาระงานครู "Total (+Group)" = ชั่วโมงในตารางของครูวันนั้น รวมคาบที่ยังรอยืนยัน

**ขอถาม 1 ข้อครับ:** % มาเรียนในหน้า Daily Report กับหน้า SOM Dashboard คิดคนละแบบ วันที่มีเด็กลา ตัวเลขจะไม่เท่ากัน
- Daily Report = มาเรียน ÷ (Confirmed + ลา)
- SOM Dashboard = มาเรียน ÷ Confirmed

อยากให้ใช้แบบเดียวกันไหมครับ
A. ใช้แบบ Daily Report ทั้งสองหน้า
B. ใช้แบบ SOM ทั้งสองหน้า
C. ปล่อยไว้แบบนี้
