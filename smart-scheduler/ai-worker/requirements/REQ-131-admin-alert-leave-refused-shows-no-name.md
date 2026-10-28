# REQ-131: The admin LINE alert "ผู้ปกครองแจ้งลาไม่สำเร็จ — อายุคอร์สไม่พอสำหรับคาบชดเชย: - · -" doesn't say WHO
**Intake:** Khwan, LINE, 2026-10-25 18:32 (the owner's screenshots), verbatim:
> *"พี่โด่งคะ แล้วปัญหาไลน์ไม่แจ้งว่าใครอันนี้มีอัพเดทบ้างไหมคะ ว่ามันจะหายไหม"*

Her screenshot: an admin LINE at 08:04 reading **"ผู้ปกครองแจ้งลาไม่สำเร็จ — อายุคอร์สไม่พอสำหรับคาบชดเชย: - · -"**, where the child / class should be (the "- · -" placeholders are empty).

**"มีอัพเดทบ้างไหม"** implies she reported it before. **Not found as a REQ in our files** (grep: no prior intake). Possibly told to the owner directly; **the owner to confirm when / what.**
**Related:** REQ-112 (the expiry / make-up / leave-refusal notices; TASK-657 / 692); the admin alert kinds (COPY-REVIEW §T-ADMIN-ALERTS).

## Order
1. **Sober (Team A; the REQ-112 leave / expiry notices):** from code, which notice kind this is; where its "{child} · {class}" fields come from; **why they render "-"** (a missing join? the wrong field? a refusal path that doesn't carry the booking?). Plus a bare read-only SQL for the owner to find today's 08:04 outbox row(s) and their payload. Then the fix + size. **No message to Khwan before your read.**

## Sober's read (10-25): CONFIRMED. A one-argument bug: `line-webhook.service.ts:1047` calls `notifyAdmins({kind:'leave_refused_no_validity', bookingId})` without the 3rd arg ⇒ the outbox `booking_id` is NULL ⇒ '- · -' every time since TASK-692. The refusal itself is correct; the parent gets her sentence. **Fix: TASK-839** (Jason, ≈0.3 d; + a renderer fallback to `payload.bookingId`; no new words). **GRANTED by Porter 10-25.** A bare SQL went to the owner to list who each alert was about.

## The owner's SQL (10-25) confirms it: every leave_refused_no_validity row has booking_id NULL and payload.bookingId set. 3 refusals in 3 days (10-23 ×2 tries, 10-24, 10-25), each sent to 5 admins; all for classes on 10-25. Names are kept out of this file.

**2026-10-25, owner, verbatim:** *"ไม่ส่งหรอก ทำให้เสร็จ ค่อยแจ้ง"*. No message to Khwan until TASK-839 is live on uat. Then one message: cause + fixed + the affected alerts (names only in the chat, never in files).

- ✅ **LIVE on uat 2026-10-26 (TEST-125 smoke PASS); Khwan told 2026-10-27** (`COPY-DRAFT-khwan-uat-release-2026-10-26.md`, sent by the owner).
