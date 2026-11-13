# REQ-5013: Close a whole day, option B (the admin handles the classes)
**Status:** IN_SPEC → @Sector (Team C) · SPEC-105 · TASK-959 (Brew) + TASK-960 (Flash), 2026-11-13 · **Written:** 2026-11-12 by Porter (PM) · **Priority:** HIGH. This is a paid item. พี่ฟีน picked it on 2026-11-12 (CUSTOMER-ANSWERS 16:25; 800 ฿ inside the 4,000 deal).
**Go:** the owner, 2026-11-12 ~23:55: *"พักงาน คือพัก แค่ หลังบ้านนะ"*. Front-office work may start now (SYSTEM-FACTS, the same date).
**Source:** ขวัญ LINE 2026-11-09 17:31, item 4 · CONCEPT-F4-close-a-day-2026-11-10.md · CHECK-2026-11-10-F4-close-a-day-sizing.md § B (Sector, ≈ 2.75–3 d). Customer wording of B (the options image, 12 Nov): *"ระบบปิดไม่ให้จองวันนั้น แสดงคลาสที่ค้าง แอดมินย้ายเองทีละคลาส ระบบเตือนทุกเช้าจนครบ"*.

## Problem
When the school closes for a day (a holiday, the venue closed, the weather), the admin has no way to close it. Classes can still be booked and made up on that date, and she has to find the affected classes herself.

## Acceptance criteria
1. The admin or CEO can mark one date or a date range as **closed**, with a reason (holiday / venue closed / weather / other). Only today or a future date is allowed; a past date is refused.
2. **The block:** a closed date refuses every way a class lands on it, with a clear message showing the date and the reason. That covers:
   - creating a booking, a course or a voucher session;
   - moving a session, including the plan editor;
   - the make-up date search, which skips the date and moves on to the next free one;
   - the group-series extender job (CHECK § "What both share", items 1–4).
3. **The list:** classes already on a closed date show in the Attention panel as "classes on a closed day". Each item links to its booking, where the admin uses today's actions (move / cancel as «ปัญหาจากทางเรา» / leave). **Nothing new is sent to parents;** each action sends what it sends today.
4. **The daily reminder:** the existing 08:00 admin LINE digest includes the "classes on a closed day" check while any are left. It stops once the list is empty or the date has passed.
5. **The calendar** shows a «วันปิดทำการ» badge on closed dates.
6. **Re-opening** a closed date removes the block only. The confirmation says that plainly.
7. **Logged:** who closed or reopened a date, when, and the reason.
8. Existing behaviour is unchanged for dates that are not closed (the regression suite stays green).

## Out of Scope
- Option A: one-click bulk cancel, per-family LINE, the preview. That is a later upgrade at +800.
- ECA and Camp days.
- Per-branch closing. The scope is the whole school; only Bravo exists today.

## Notes
- **Depends on:** TASK-946 (F5), which is done 11-11 and committed. CHECK § Summary.
- **Calendar target:** about 3–4 working days on uat (Sector, REQUEST production-period § Answer 2). After that come Tanya on sid, then the owner's uat deploy slot.
- Questions go in `## Questions` below. The PM answers or asks ขวัญ.

## Questions
