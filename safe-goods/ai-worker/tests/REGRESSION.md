# Regression checklist — safe-goods

> Owned by Tanya (QA). Everything the product must STILL do after any change.
> Every delivered REQ adds its cases here; every escaped defect adds the case that
> would have caught it. Run the relevant subset in every test round.
> Setup that works: isolated DB via `DATABASE_PATH`/`UPLOAD_DIR` env, `bun run db:migrate && bun run seed`,
> FE on a free port with `NEXTAUTH_URL` + BE `CORS_ORIGIN` matching; `AUTO_RELEASE_SECONDS=60 SWEEP_INTERVAL_MS=10000` for R-14.

## Cases

| # | Case | From REQ | Added | Last run | Result |
|---|------|----------|-------|----------|--------|
| R-1 | Register (name/email/password) → home shows ปิดดีลดี 0 ครั้ง; duplicate email (any case) → อีเมลนี้ถูกใช้แล้ว | REQ-001 AC-26 | 2026-09-21 | 2026-09-21 (r2) | PASS |
| R-2 | Fee preview: 100/added/buyer → 120·100·20; 50 → fee 20 (min); included 120/buyer → 120·100·20; 100/added/split → 110·90·20; included 111/split → base 100, fee 21, seller 90 | REQ-001 AC-1..4, remainder rule | 2026-09-21 | 2026-09-21 (r1 only) | PASS |
| R-3 | Admin fee settings 10/30 → new preview fee 30; existing room keeps its frozen fee; restore 20/20 | REQ-001 AC-5 | 2026-09-21 | 2026-09-21 (r1 only) | PASS |
| R-4 | Logged-out room link → login → lands on the room; wrong password → อีเมลหรือรหัสผ่านไม่ถูกต้อง | REQ-001 AC-8 | 2026-09-21 | 2026-09-21 (r2) | PASS |
| R-5 | Second user joins → รอผู้ซื้อชำระเงิน, both names + credit; third user → ห้องนี้เต็มแล้ว (409 ROOM_FULL) | REQ-001 AC-6, AC-7 | 2026-09-21 | 2026-09-21 (r2) | PASS |
| R-6 | Slip upload via the page → รอแอดมินตรวจสอบยอดเงิน; seller has no deliver button; non-image / >5 MB refused with Thai text | REQ-001 AC-9 | 2026-09-21 | 2026-09-21 (r2) | PASS |
| R-7 | Admin reject with reason → buyer sees เหตุผลที่ปฏิเสธ, re-uploads; admin confirm → ชำระเงินแล้ว — รอผู้ขายส่งของ + timeline | REQ-001 AC-10, AC-11 | 2026-09-21 | 2026-09-21 (r2) | PASS |
| R-8 | Cancel before payment confirmed (buyer via UI, seller via API from SLIP_REVIEW) → ห้องถูกยกเลิก both sides, credit unchanged; ยกเลิกห้อง absent after confirm | REQ-001 AC-12, AC-13 | 2026-09-21 | 2026-09-21 (r2) | PASS |
| R-9 | Deliver without evidence → ต้องแนบหลักฐานการส่งของอย่างน้อย 1 รูป (422) | REQ-001 AC-14 | 2026-09-21 | 2026-09-21 (r1 only) | PASS |
| R-10 | In-game deliver with evidence → ผู้ขายส่งของแล้ว — รอผู้ซื้อยืนยัน; buyer sees evidence + countdown; autoReleaseAt = +72 h | REQ-001 AC-15 | 2026-09-21 | 2026-09-21 (r2) | PASS |
| R-11 | Physical deliver without courier/tracking → ต้องระบุขนส่งและเลขพัสดุ; with tracking → รอพัสดุถึง, no countdown, buyer sees tracking + พัสดุถึงแล้ว | REQ-001 AC-16, AC-17 | 2026-09-21 | 2026-09-21 (r2) | PASS |
| R-12 | พัสดุถึงแล้ว by buyer AND by admin → พัสดุถึงแล้ว — รอผู้ซื้อยืนยัน, clock starts from that moment | REQ-001 AC-18 | 2026-09-21 | 2026-09-21 (r2 buyer path; admin path r1 only) | PASS |
| R-13 | ได้รับของแล้ว → รอแอดมินโอนเงินให้ผู้ขาย, countdown gone, timeline | REQ-001 AC-19 | 2026-09-21 | 2026-09-21 (r2) | PASS |
| R-14 | Auto-release by the sweep after the window → รอแอดมินโอนเงินให้ผู้ขาย + timeline ปล่อยเงินอัตโนมัติ (ครบ 3 วัน); releasedBy SYSTEM | REQ-001 AC-20 | 2026-09-21 | 2026-09-21 (r2) | PASS |
| R-15 | Admin payout → ปิดดีลแล้ว, both credits +1 (room cards + home), final amounts shown; completed room has no controls, API 409 on every action | REQ-001 AC-21, AC-22, AC-25 | 2026-09-21 | 2026-09-21 (r2) | PASS |
| R-16 | Buyer + seller guidance blocks verbatim in every room state | REQ-001 AC-23 | 2026-09-21 | 2026-09-21 (r2) | PASS |
| R-17 | Normal user: `/admin`, `/admin/settings` → `/`; admin API → 403 | REQ-001 AC-27 | 2026-09-21 | 2026-09-21 (r2) | PASS |
| R-18 | Non-member cannot fetch a room's file (403) | REQ-001 (files) | 2026-09-21 | 2026-09-21 (r1 only) | PASS |
| R-19 | Every §Additional wording 1/2 string visible where Porter placed it — incl. auto-release result Thai (not `released: N`), queue empty states, field labels รายละเอียดสินค้า/ราคา (บาท), ออกจากระบบ / คัดลอกลิงก์ text, section headings, (คุณ) marker, register validation messages | REQ-001 AC-24 + wording | 2026-09-21 | 2026-09-21 (r2) | PASS |
| R-20 | Countdown rounds UP: `3 วัน 0 ชั่วโมง` right after delivery / parcel-arrived; `0 วัน 1 ชั่วโมง` in the last hour | REQ-001 R-6 / AC-15 | 2026-09-21 | 2026-09-21 (r2) | PASS |
| R-21 | ยกเลิกห้อง opens the confirm dialog (exact text, กลับ / ยืนยันยกเลิก); กลับ changes nothing (no POST); ยืนยันยกเลิก → ห้องถูกยกเลิก | REQ-001 R-7 / AC-12b | 2026-09-21 | 2026-09-21 (r2) | PASS |
| R-22 | Non-integer price → `กรุณาระบุราคาเป็นจำนวนเต็มบาท`, no preview | REQ-001 R-8 | 2026-09-21 | 2026-09-21 (r2) | PASS |
