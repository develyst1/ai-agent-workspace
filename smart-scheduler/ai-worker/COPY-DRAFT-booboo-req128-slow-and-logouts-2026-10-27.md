# COPY DRAFT to BooBee_NS: REQ-128 (slow afternoons + logouts) — @Porter, 2026-10-27
Status: ⛔ WITHDRAWN 2026-10-27. The owner answered the customer himself: *"ไม่ต้องตอบ Boobee แล้ว เขาชื่อพี่ปู ฉันบอกไปแล้ว…"*. Note: BooBee_NS = **พี่ปู**.
Gates:
- TASK-836 (7-day login) is LIVE on uat; TEST-125 uat smoke PASS 2026-10-26.
- TEST-117 CLOSED 2026-10-27: 27 uat runs over 3 days; 0 errors / 522 / logouts; weekday afternoon ≈ Sunday.

**No cause is claimed.** The text states only what changed (the login length) and what we measured.

---
คุณ BooBee ครับ เรื่องที่แจ้งไว้ว่าหน้าตารางช้าช่วงบ่าย และเด้งออกจากระบบ อัปเดตตามนี้ครับ

1. เด้งออกจากระบบ: ปรับแล้วครับ ตอนนี้ล็อกอินครั้งเดียวใช้งานต่อเนื่องได้ 7 วัน ระหว่างวันจะไม่เด้งออก ครบ 7 วันระบบจะให้ล็อกอินใหม่หนึ่งครั้งครับ

2. ความช้าช่วงบ่าย: ทีมจับเวลาหน้าตารางบนระบบจริงไว้ 3 วัน รวมช่วง 14:30–16:30 ของวันธรรมดา ความเร็วช่วงบ่ายใกล้เคียงกับช่วงอื่น เปิดหน้าตารางประมาณ 2 วินาที เปลี่ยนสัปดาห์ประมาณ 1 วินาที และไม่พบ error หรือการเด้งออกเลยครับ

ถ้ายังเจอช้าหรือเด้งออกอีก แจ้งเวลาและหน้าที่ใช้อยู่ตอนนั้นมาได้เลยครับ ทีมจะเช็กให้ทันทีครับ
