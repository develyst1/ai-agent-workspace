# REQ-097 — Teacher login: see + manage only their OWN calendar (2026-09-19)

**Source:** customer via owner, 2026-09-19. **Status: DISCUSSION — PM design + question to owner; feasibility read to @Sober. Nothing dispatched.**
> ให้ครูเข้าระบบได้ด้วย เขาอยากเข้ามาดูแค่สิทธิ์ที่เป็นของตัวเอง ที่หน้า calendar — ดูงานตัวเองและ manage งานตัวเองได้ · [owner] ทำให้ option C มีการกำชับเรื่องหน้าแรก เห็นใครบ้าง ตั้งเป็น all หรือแล้วแต่ติ๊กเป็นคนๆ

## §1 — the ask
A TEACHER gets a web login; on the calendar they see ONLY their own classes (where they are the assigned teacher) and can manage their own work. Extends RBAC option C with a DATA-SCOPE dimension on the calendar (all vs own), ticked per user/role.

## §2 — PM's proposed design (extends option C)
1. **Link a user ↔ a teacher record** so "own" = bookings where that teacher is assigned.
2. **A new grant `calendar:scope` = all | own** (per user/role): admin = all, teacher = own. Own hides every other teacher's rows on the calendar (and the people/lists behind it accordingly).
3. **A small teacher self-manage action set** — the open decision (§3).
🚫 Creating/cancelling/moving courses stays ADMIN — it ripples to students, quota, money.

## §3 — the decision for the owner: what can a scoped teacher MANAGE?
- **A. View only** — see own schedule.
- **B. View + check-in/confirm own classes** — mark มาเรียน/ยืนยัน on their own bookings.
- **C. B + report own teacher-leave** — teacher marks "can't come today" ⇒ the class cancels via the teacher-leave flow (+ make-ups). **PM recommends C.**
- (Not recommended: self create/cancel/move — student/quota/money impact.)

## §4 — feasibility read from @Sober
Does a user↔teacher link exist (or how to add one)? Can the calendar/booking reads filter to "assigned teacher = me" cleanly (the teacher may be primary or a group's swapped teacher, or a seat)? Where does `calendar:scope=own` need to bite (calendar, people lists, reminders already are per-teacher)? Is B/C reachable as scoped versions of existing actions (check-in exists; teacher-leave = the cancel-reason flow)? Size A vs B vs C.

## §5 — OWNER, 2026-09-19: option C
Teacher login = **VIEW own calendar + check-in/confirm own classes + report own teacher-leave** (the class cancels via the teacher-leave flow + make-ups). Create/cancel/move courses stays ADMIN. Build = extend option C: user↔teacher link + `calendar:scope=all|own` grant + the scoped check-in + report-own-leave actions. ⏳ Awaiting @Sober's feasibility read + sizes before dispatch.

## §6 — @Sober read (SPEC-083): scope = the LINK, not a grant
No user↔teacher link exists today. **scope=own = `users.teacher_id` link (migration `0044`), NOT a `calendar:scope` grant** — a grant that must be absent to narrow fails OPEN; the link fails closed (unlinked = admin, sees all). "Own" derives from `bookings.teacher_id` (moves with a group swap; seats carry it) + `booking_teachers`. ONE `ownScope` predicate in every calendar/bookings read (out-of-scope ⇒ 404); a linked user may `attend` only. Report-own-leave = a new act (55th key) running the existing teacher-cancel path per own session with a NEW closed reason `TEACHER_LEAVE` (the REQ-089 §5 one never landed — that was the §5.1 tray). Stages: C-1 (link + view + check-in own) BE M·FE M; C-2 (report own leave) BE S·FE S; one sid deploy. Six §3 decisions pending owner.

## §7 — OWNER decisions, 2026-09-19 ("เอาตามแนะนำ") — all as Sober recommended
1. ✅ Teacher account = admin-created with a teacher picker.
2. ✅ An admin who also teaches keeps TWO accounts.
3. ✅ Report-leave = a cancel with the new `TEACHER_LEAVE` reason (no new status).
4. ✅ A leave = the whole day, with per-session un-tick.
5. ✅ A swapped teacher sees the group from the swap date (by construction).
6. ✅ NO advance-notice cut-off for a teacher's own leave in C.
GO C-1 + C-2.

## §8 — OWNER 2026-09-19: family-notice copy APPROVED + §3.7 + reason line
- ✅ Copy approved (CLASS CANCELLED / Student/Program/Date/Time/Reason/Note; 1hr-voucher Note = credit returned).
- ✅ **§3.7 = YES** — the shop's OWN cancels notify the family too (one call site).
- ✅ Reason line SHOWN for teacher leave (`ครูลา`) only; HIDDEN for the shop's codes.
Jason drops the final bytes (XS).
