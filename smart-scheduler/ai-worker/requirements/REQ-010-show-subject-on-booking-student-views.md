# REQ-010: Show each student's sport program (subject) on the Booking / Students views
- Status: READY_FOR_SA
- Priority: MEDIUM
- Requested: 2026-07-28 by stakeholder (relaying คุณฟีน / the customer)
- Deadline: none
- Source: customer request — "รายละเอียดหน้า Booking / Students ไม่มีชื่อคอร์สเรียนของเด็ก ๆ (Surfskate / Inline ฯลฯ)."

## Problem / Goal
Staff can't see **which sport program** (Surfskate, Inline, Skateboard, Bike, Scooter, …) a student is
enrolled in when looking at their courses/bookings. They want the program (subject) name visible per student.

## Requirement
1. The system must display the **sport program / subject name** for each student's course on the
   Booking / Students screens, so staff can tell at a glance what program a student is doing.

## Acceptance Criteria
- [ ] On the **Course-package** view, each student's card shows their program name (e.g. "Surfskate").
- [ ] (If confirmed in Questions) the subject also shows on the Voucher view and/or a Students screen.

## Analysis / current state (Porter, read-only sweep — for Sober to verify)
- The **"All bookings" table already shows the subject** (`BookingsTable` `colSubject`, from `BookingDTO.subject`).
  So part of this may already be satisfied — need to confirm which screen the customer means.
- The per-student views do **NOT** show it: **Course-package cards** (`CoursePackagePanel`) and **Voucher rows**
  (`VoucherPanel`) — and the subject is **not in the `CourseSummary` / `VoucherSummary` DTOs**, so this is a
  **BE + FE** change for those views (not FE-only).
- Data-model note: `course_packages` has **no `subjectId` column**; the subject is stamped onto each generated
  booking row at course creation. So course↔subject is indirect. A student can do multiple programs (multiple
  courses); each course is effectively one program; a **voucher has no single subject by design** (hours
  spendable on any sport).

## Constraints
- Reuse the existing `subjects` model (these ARE the sport programs). HOW to source the subject for a course
  (add a `subjectId` FK to `course_packages`, or derive from the course's bookings) is the SA's design call.
- Backend is source of truth.

## Out of Scope
- Creating/renaming programs (subjects-admin) — separate.
- Splitting Bike/Scooter into separate subjects (that's the existing UC-033, separate).

## Questions
(SA Lead + stakeholder. Porter answers as `> answer: ...`; business calls route to `@Porter` — don't guess.)
- **Which screen(s) exactly?** The "All bookings" table already shows subject — is the complaint about the
  **Course cards** (and Voucher rows)? Or is a dedicated **Students** screen wanted?
- **Vouchers:** a voucher isn't tied to one sport (hours usable on any program). Show **(a)** no subject on
  vouchers, **(b)** the list of subjects actually used so far, or **(c)** change the rule so a voucher binds to
  one program? (Spec decision, not just UI.)
  > **answer (Porter, from stakeholder 2026-07-29 + screenshot):** target screen = the **`/scheduler/bookings`
  > page** (nav "Bookings / Students") — the list of students using courses; show the **sport program** there.
  > Stakeholder expects "just a UI fix." ⚠️ **But Porter's analysis stands:** the subject is **not in the
  > `CourseSummary` DTO**, so the course-card view is likely **BE+FE**, not UI-only — SA to confirm/diagnose.
  > **Voucher-subject rule:** the stakeholder did not raise vouchers — scope this REQ to the **course/booking
  > list** for now; leave the voucher-subject decision open (revisit only if คุณฟีน asks).

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| REQ-010 | Show each student's sport program (subject) on the `/scheduler/bookings` course list | MEDIUM | ✅ **DELIVERED** | **Live acceptance PASSED 2026-07-29** (stakeholder ran, Porter verified): each `/scheduler/bookings` course card shows its **sport program** (Surfskate/Inline/…). TASK-034 (BE — `CourseSummary.subject` derived at read time, no migration) + TASK-035 (FE — `CoursePackagePanel`), Sober-verified, deployed (back+front). Vouchers out of scope. |
```
