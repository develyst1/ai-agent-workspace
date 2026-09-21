# REQ-096 — Morning notification must not include UNCONFIRMED bookings + audit all notify paths (2026-09-19)

**Source:** customer via owner, 2026-09-19. **Status: BUG — read+audit requested from @Sober, then fix. Nothing dispatched to build yet.**
> noti ตอนเช้า มันเอารายการที่ยังไม่กด confirm มาส่งด้วย ซึ่งไม่ควร · ฝากดูเคสนี้ และดูรอบๆ อย่างรอบคอบว่ามีนอกเหนือจากนี้มั้ย ที่เป็นแนวนี้

## §1 — the bug
The 08:15 daily reminder includes bookings that are **PENDING (not yet confirmed)** — it should carry **CONFIRMED only** (a family/coach should not be reminded of a class that was never committed).

## §2 — the sweep the owner asked for
Audit EVERY notification/reminder path for the same class of fault — sending on a status that should not be sent: the daily reminder, the teacher daily schedule reminder, the camp reminder (Stage 3b, in build), leave notices, rental notices, group reminder, confirm/cancel/pause notices. Report which paths select a wrong/too-broad status BEFORE fixing.
