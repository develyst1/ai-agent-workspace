# REQ-022: Booking modal — booking type drives the form (tabs), with contextual student filtering
- Status: READY_FOR_SA
- Priority: MEDIUM
- Requested: 2026-08-01 by stakeholder (คุณฟีน), from a walkthrough of the live New-booking modal
- Deadline: none
- Source: stakeholder review of `/scheduler/calendar` → New booking modal.

## Problem / Goal
On the New-booking modal, **Booking type sits near the bottom**, *below* the fields it actually governs
(student, teacher, subject, time). Staff fill things in and only then choose the type — even though the type
decides which of those fields are relevant, and which students are even eligible.

Concretely today: a **Voucher** booking cannot have a chosen teacher or fixed slot (a domain rule), yet the
form asks for teacher and time first. And for a **course session**, staff must know from memory which students
have an active course and how far along they are — the form gives no help at all.

Goal: **choose the booking type first, then show only what that type needs**, with the student list and the
student's context matched to that type. Fewer wrong bookings, less staff memory.

## Requirement
1. **Booking type becomes the first choice** — presented as a **tab bar at the top of the modal** — and the rest
   of the form changes to match the selected tab.
2. Each tab shows **only the fields that type needs**, and does not ask for fields that type cannot use (e.g. a
   voucher booking must not ask staff to pick a teacher/slot it will ignore).
3. **The student list is filtered to students eligible for that type:**
   - **Course tab** → only students who **already have a course**.
   - **Voucher tab** → only students who **have an active voucher**.
4. **Show the student's context for that type once they're picked**, so staff don't have to look it up:
   - Course: which course/program, progress (e.g. used 4 of 10), leave used, expiry.
   - Voucher: hours remaining and expiry.
5. **It must look clean and not cramped** — the stakeholder was explicit: "ทำให้ดูดีไม่อึดอัดใช้งานยาก". Adding
   context must not turn the modal into a wall of text.

## Acceptance Criteria
- [ ] Booking type is chosen **first**, from tabs at the top; changing tabs changes the form.
- [ ] No tab asks for a field that its booking type cannot use.
- [ ] On the Course tab the student list contains only students with a course; on the Voucher tab only students
      with an active voucher.
- [ ] After picking a student, their relevant context (course + progress, or voucher hours + expiry) is visible
      without leaving the modal.
- [ ] The modal stays comfortable to use — not visually crowded.
- [ ] No regression: existing booking creation for every type still works.

## Analysis / current state (Porter, read-only — for Sober to verify)
- The modal renders one flat form with `bookingType` as a Select **below** subject/time; there is an `isVoucher`
  branch, so *some* adaptation exists, but the ordering still invites filling fields the type may discard.
- The student picker is the **global** search (`GET /students?q=`) with no eligibility filter, and shows no
  course/voucher context.
- Domain rules that make this matter: **VOUCHER has no fixed slot and no chosen teacher**; **COURSE_PACKAGE**
  tracks size 4/6/10, `usedSessions`, `leaveUsed`, and an expiry.
- **Scope note (confirmed with the stakeholder):** the **Course tab means booking an additional session for a
  student who ALREADY has a course** — *not* registering a new course. New course registration stays where it is
  (the Bookings page). Same reading for Voucher.

## Constraints
- Frontoffice only (`smart-scheduler-front` + scheduling API). Backend may need eligibility/context endpoints.
- Do not change the booking domain rules — this is about surfacing them, not altering them.
- HOW (tabs vs segmented control, where the context sits, which endpoints) is the SA's design.

## Out of Scope
- Registering a **new** course or selling a voucher from this modal.
- The demographics/incomplete-data flag → REQ-019 / REQ-023.

## Questions
(SA + stakeholder. Porter answers as `> answer: ...`; business calls → `@Porter`.)
1. On the **Course/Voucher tabs**, what should staff see if the student they want has **no** course/voucher —
   hidden entirely, or shown greyed with "no active course" so they know why? (Porter's lean: shown but
   disabled, with the reason — silently missing people generates support questions.)
2. Should the tab set be **Single · Trial · Course · Voucher** (the four booking types), or fewer? (Porter's
   lean: all four, since each has genuinely different needs.)
3. Anything else staff routinely look up while booking that should appear alongside the course/voucher context?
