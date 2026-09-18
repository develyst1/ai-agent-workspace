# REQ-089 — Customer batch 2026-09-15: "fix the schedule things BEFORE we start rent / other"

**Source:** the customer, via the owner, 2026-09-15. **Status: RECORDED — PM understanding pending the owner's confirmation. Nothing dispatched.**

## §0 — the customer's message, verbatim
> แก้เรื่องตารางให้ก่อนเริ่ม rent / other นะคะ
> 0.ชื่อ app ทุกส่วนใน frontoffice เปลี่ยนจาก smart schedule เป็น SOM schedule
> 1. ตารางที่ลาล่วงหน้า คลาสที่เป็น extended ไม่ต้องล็อกค่ะ สามารถลาได้เหมือนกัน
> 2. อายุคอร์สต้องขยายตามวันที่ลาล่วงหน้าด้วยค่ะ ไม่ได้จบที่คลาสสุดท้าย
> ตัวอย่าง Kavya คอร์ส 6 ครั้ง เริ่มเรียน 23/9 ลาล่วงหน้า 3 วีค อายุคอร์สต้องบวกไปอีก 3 จาก 8 วีค เป็น 11 วีคจากวันที่เริ่มเรียนค่ะ ตอนนี้ระบบนับอายุคอร์สเป็นวันที่เรียนครั้งสุดท้าย สำหรับเคสลาล่วงหน้า
> 3. จากการที่ไปไล่ให้ผปคเชื่อมมา เราจำเป็นต้องมีปุ่มลบนักเรียนค่ะ เพราะบางทีมีการสร้างผิดจริงๆ ดังนั้นรบกวนสร้างปุ่มลบนักเรียน ที่ไม่ใช่ suspend นะคะ
> 4. ขึ้นโชว์คลาสที่ cancel เพราะครูหยุด
> 5. กล่อง notice เตือนคลาสสุดท้าย
> 6. ขอปรับสีตารางหน้าแรกให้ชัดเจนมากขึ้นค่ะ สีเข้มไม่ต้องพาสเทลได้นะคะ ขอความชัดเจนค่า พี่ๆทีมงานฟีดแบ้คว่าสีแอบใกล้เคียงกันไป ทำให้ดูยากค่ะ โดยเฉพาะลา
> 7. มีแจ้งเตือน Cancel / pause booking คลาสที่คอนเฟิร์มแล้ว ไปหาครู
> 8. เลือกครูตอนกลับมาเรียนทั้งคอร์สที่ดร็อปไว้และ pause booking

## §1 — PM's reading (📖 marked; ❓ = not understood, asked of the owner)
| # | reading | status |
|---|---|---|
| 0 | Every place the frontoffice shows `Smart Scheduler` (login, header, browser tab, `<meta description>`, notification headers if any) → `SOM SCHEDULE`. Extends `REQ-088 §10.1` from two LINE pages to the whole app. Spelling: customer wrote "SOM schedule"; owner ruled `SOM SCHEDULE` on 09-14 — use his. | 📖 clear |
| 1 | In the ADVANCE-LEAVE table at course creation, the sessions the system APPENDED as make-ups (`Extended`) are locked — cannot be ticked as leave. Customer: unlock them; an extended session can be advance-left like any other (which appends another). | 📖 clear |
| 2 | Course expiry with advance leave: today = the date of the LAST session. Wanted = the normal ceiling PLUS the advance-leave weeks: size 6 = 8 weeks; 3 weeks advance leave ⇒ 11 weeks from start. I.e. expiry = (size + quota + advance-leave weeks) from start, not "last session". ⚠️ `SYSTEM-FACTS` says the created path already promises "plan end + remaining quota" — the customer's screen says otherwise for Kavya. The screen wins; Sober reconciles. | 📖 clear |
| 3 | A real DELETE for a student (not suspend) — because linking parents produced wrongly-created students. ❓ The product has NO delete anywhere (a student with a course has a sale posted). My proposal: delete allowed ONLY for a student with no course/booking/voucher history; one with history stays suspend-only. | ❓ owner |
| 4 | "Show the classes cancelled because the TEACHER took leave." ❓ WHERE — on the admin schedule/calendar (today they vanish?), on the parent's daily LINE message, or the teacher's? | ❓ owner |
| 5 | "A notice box warning of the LAST class." ❓ WHO sees it and WHERE — the admin dashboard when a student's course reaches its last session (so they can sell the next), or a LINE message to the parent? | ❓ owner |
| 6 | Front page (dashboard schedule) colours: darker, saturated, not pastel; statuses must be distinguishable at a glance, especially LEAVE. | 📖 clear |
| 7 | When a CONFIRMED class is cancelled or pause-booked, the TEACHER gets a LINE notification (today: none). | 📖 clear |
| 8 | When resuming a DROPPED course or a PAUSED booking, the admin can pick the teacher (today: the original teacher is fixed). | 📖 clear, ❓ confirm "today it is fixed" |

## §2 — OWNER RULINGS, 2026-09-15 (all four ❓ answered; item 6 withdrawn)
> *"6 ไม่ต้องแก้ เพราะฉันมีทีม Frontend มาทำให้ / 3.เอาตามนาย ถูกต้อง / 4.ตารางแอดมิน / 5.แปะบนตารางว่า Last เห็นชัดๆ แปะๆ ไว้ / 8.ใช่"*
- **6 — OUT OF SCOPE.** The owner's own front-end team does the colours. 🚫 Our engineers do not touch dashboard colours.
- **3 — DELETE only for a student with NO history** (no course, booking, voucher); one with history stays suspend-only. Hard delete, admin only, confirm step.
- **4 — the ADMIN schedule** shows a class cancelled because the teacher took leave (today it disappears).
- **5 — a `Last` badge ON THE SCHEDULE**, on the session that is a course's last one — big, obvious, "stuck on". Admin-facing; no LINE message.
- **8 — YES:** teacher is fixed today; on resume (dropped course, paused booking) the admin picks the teacher.
**Scope now: 0, 1, 2, 3, 4, 5, 7, 8 — eight items. Customer's framing: before "rent / other" starts.** Order is @Sober's.

## §3 — OWNER, 2026-09-16, item 2 follow-up: **existing advance-leave courses keep their old expiry; the customer's admins fix them one by one.** *"ปล่อย ให้แอดมินแก้เอง"*
The new formula applies to courses created after the deploy. Old rows are NOT rewritten (same rule as `REQ-088 §9.1` and the 08-28 imported expiries). `PATCH /courses/:id/expiry` (the admin's expiry editor) is the repair path. 🚫 No DATA REQUEST, no script.

## §4 — OWNER, 2026-09-16, item 1 cap: **advance leave at creation is bounded by "fewer than every session" — NOT the leave quota.** *"ลาไม่ครบทุกคาบ ถูกแล้ว"*
Confirmed: the `< size` cap stays (size 4 ⇒ up to 3, 6 ⇒ 5, 10 ⇒ 9). Advance leave at creation remains FREE (does not spend `leaveUsed`); it is bounded only by not being able to leave every session. The quota (1/2/3) governs leave taken LATER, not this. 🚫 No change; today's behaviour is correct.

## §4.1 — OWNER REOPENS the cap, 2026-09-16, with the real case
> *"อาจจะครบก็ได้มั้ย ก็ตามเคสที่เขาแจ้ง คือ ลาแล้วมันเลื่อนไปวันอื่นแล้ว ลูกค้าไม่พร้อมอีกแน่ๆ คุยมาแล้ว ก็กดลาคาบที่เป็น extended ได้อีกนะ"*
**The case:** a leave becomes a make-up (extended) on another day; the family is confirmed-unavailable that day too, so they must leave the EXTENDED session as well — which appends another make-up, and so on.
🔑 **Why the current `< size` cap bites:** each such leave is a distinct absence; on a size-4 course the 4th absence (the first make-up they leave) hits `< size` and is REFUSED — exactly the legitimate reschedule the customer described.
⚠️ **The tension to resolve, PM to Sober:** advance leave is FREE (no quota). If the cap is simply removed, a course could be declared leave on EVERY session for free — the thing the quota exists to prevent. **PM's proposed reading (recommendation): the cap counts ORIGINAL planned sessions only; make-ups/extended rows are ALWAYS leaveable and never count toward it — so the chain in his case never blocks, but a course cannot be born with zero attendable original sessions.** ❓ Sober confirms whether the mechanism can distinguish, and whether the chain terminates. **§4 is SUPERSEDED pending this; nothing dispatched.**

## §4.2 — OWNER RULES: **FULL UNLOCK — every session leaveable, no cap.** *"ปลดเต็ม"*
Overrides §4 and the PM's original-only middle reading. The `< size` cap is REMOVED: any planned row, original or extended, can be advance-left; there is no ceiling on the count. Advance leave stays free. 🔑 **The one thing still owed to the owner before it is cut is a CORRECTNESS check, not a preference:** Sober confirms the make-up chain TERMINATES (a leave appends a make-up, which can itself be left — this must not loop without end at save/preview) and that a course with zero attended original sessions is a valid state the rest of the system handles (expiry, notifications, reports). If removing the cap breaks a structural invariant, Sober reports it BEFORE building; the owner's intent (full unlock) stands, the implementation must simply be safe.

## §5 — item 4 CORRECTED by the owner, 2026-09-16: NOT a new "teacher leave" filter — a CALENDAR TOGGLE that shows CANCELLED sessions
> *"ฉันว่ายกเลิกปกติ และให้มีแค่เหตุผลเพิ่มขึ้นมา... ฉันแค่อยากให้ตรงหน้าแรก calendar ส่วน cell display โชว์คาบที่ยกเลิกไปแล้วด้วย พอเราติ๊กตรงนั้น ก็จะเห็นคาบที่ยกเลิกด้วยเหตุผลต่างๆ แค่นั้น ส่วนเรื่องเงินเอาตามเดิม"*
✅ **PM's §1/§2 reading (a `TEACHER_LEAVE` reason + re-owe question) is WITHDRAWN.** The real ask:
- **A toggle on the admin calendar** (cell display area, front page) — off by default; ON ⇒ the `CANCELLED` sessions that the calendar hides today become visible, WHATEVER their reason. Styled as cancelled (struck/greyed), reason shown.
- 🚫 **NO new cancel reason, NO money/re-owe change** — the owner keeps re-owe exactly as it is. Item 4 is DISPLAY ONLY.
- The three existing reasons stay; each cancelled cell just shows the one it already carries.
📌 **Money is unaffected because item 4 touches nothing but display.** The owner's re-owe rule is intact: a session counts as "in time" (ทัน) until `end-of-day` fires. **`end-of-day` is now 17:30** (owner moved it from 18:30 on 2026-09-16, customer request) — recorded in SYSTEM-FACTS.

## §6 — item 7 RULED, 2026-09-16: per-COURSE for bulk, per-SESSION for single; STYLE must match the existing notifications
> *"7 เอาตามนายเลย แต่นายอย่าลืมสไตล์การแจ้งเอาแนวๆ เดิมนะ เพื่อไม่ให้ลูกค้ามาจอแก้เพิ่มหลายครั้ง"*
- **Shape:** a single cancel/pause ⇒ ONE message; a course DROP/PAUSE cancelling N sessions ⇒ ONE message per COURSE naming the count and dates (not N messages). Both carry: student · date · time · reason. Both languages. Unlinked teacher ⇒ `skipped` (as today).
- 🔑 **STYLE IS A HARD CONSTRAINT (owner): the teacher message must follow the HOUSE format of the existing outbox kinds** — the `REQ-085 §7` confirm/leave formats and `LEAVE NOTICE / แจ้งลา` — same header-stamp shape, same field order, same emoji discipline, same two-language layout. 🚫 No fresh phrasing invented. **The owner's explicit reason: so the customer does not come back to correct it round after round.**
- 📌 **PM gate: the drafted copy (both languages, both shapes) comes UP to me BEFORE the send path is finalized, and I show the owner the copy once** — cheaper than a post-ship correction, which is exactly what he asked to avoid.

## §5.1 / §6.1 — OWNER, 2026-09-16
- **§6.1 — copy APPROVED as drafted** (both message kinds, TH+EN). *"1.ok เลย"* — Sober lands the strings; send path final.
- **§6.2 — a course END tells the coach too**, same rule as drop. *"2.เอาด้วย"* — the built END path stays.
- **§5.1 — item 4 display: NOT struck rows on the grid — a SEPARATE cancelled BOX/tray, like the existing PAUSED tray.** *"หรือเราจะเอามาเก็บข้างนอก เหมือนคาบที่พักมั้ย ที่มันมีกล่องแยกต่างหาก แค่แยกเพิ่มอีกกล่อง"* ⇒ cancelled sessions live in their own tray beside the paused one, not in the grid cells; the `Show cancelled` toggle reveals that tray. This dodges the one-booking-per-slot conflict entirely (a rebooked slot shows the live class in the grid AND the cancelled one in the tray).
