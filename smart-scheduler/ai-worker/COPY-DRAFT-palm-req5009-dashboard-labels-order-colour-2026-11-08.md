# COPY-DRAFT: REQ-5009 item 1 — brief to Palm (screen: card order, colours, 2 renames) — @Porter, 2026-11-08
**Status:** DRAFT (internal developer brief; no customer data in it). The owner sends it to Palm.
**Facts:** REQ-5009 item 1 (her words); CHECK-REQ-5009 §1 (Silver: front strings `smart-scheduler-front/src/lib/i18n/dictionaries.ts:1871` `newCourseThisMonth`, `:1875` `notRenewed`; card order + colour in `src/components/partials/Som/`; no back/API change).
**Rules:** polite, ครับ on every sentence (Palm is not a buddy); repo + files named.

---

ปาล์มครับ มีงานแก้หน้า SOM Dashboard รอบ 3 ส่วนหน้าจออย่างเดียวครับ ไม่มีแก้ back หรือ API ครับ
repo `smart-scheduler-front` ไฟล์ข้อความอยู่ที่ `src/lib/i18n/dictionaries.ts` (แถว 1871–1875) ส่วนลำดับกับสีการ์ดอยู่ใน `src/components/partials/Som/` ครับ

1. แถว Existing Customers เรียงใหม่และใส่สีครับ
   Active course (ส้ม) → Active voucher (ส้ม) → Total customers (ส้ม) → 1 HR (last 3 months) (ส้ม) → 1st Trial (last 3 months) (เทา)
   และเปลี่ยนชื่อการ์ดสุดท้ายเป็น "1st Trial (last 3 months) (มาลองแล้วไม่ชอบ)" ครับ

2. แถว New vs Renewing เรียงใหม่และใส่สีครับ
   1st Trial (เขียว) → 1st Trial - New Course (เขียว) → 1st Trial, No Course (เทา) → New Course previous month (เขียว) → Renew Course (เขียว) → Course / Voucher not renewed (เทา)
   โดยเปลี่ยนชื่อ "New Course this month" เป็น "1st Trial - New Course" ครับ

ทำเสร็จแล้ว merge เข้า develop แล้วแจ้งพี่โด่งได้เลยครับ ขอบคุณครับ
