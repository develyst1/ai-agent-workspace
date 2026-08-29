# REQ-011: Student picker doesn't filter when you type (New Booking / course / voucher) — fix the search
- Status: READY_FOR_SA  (⚠️ RE-SCOPED 2026-07-29 after the stakeholder's screenshot — this is a BUG fix, not a new calendar feature)
- Priority: MEDIUM
- Requested: 2026-07-28 by stakeholder; **clarified 2026-07-29 with screenshots**
- Deadline: none
- Source: customer request — originally "search bar on the schedule page"; the stakeholder clarified with
  screenshots that the real pain is the **Student dropdown in the booking flow not searching**.

## Problem / Goal
When staff create a booking (or buy a course / voucher), the **Student** field is a dropdown that is meant to
be searchable — but **typing a name does NOT filter the list**. Per the stakeholder's screenshots (2026-07-29),
typing "โอ๊ด" or "น้องมิ้น" still shows the **full** student list unfiltered, so with many students staff must
scroll to find the right one. It should narrow the list as you type.

## Requirement
1. In the **New Booking modal** (and the course / voucher purchase flows that use the same student picker),
   typing in the Student field must **filter the list to matching students** as you type.
2. Clearing the field restores the full/normal list.

## Acceptance Criteria
- [ ] In New Booking → Student, typing part of a name shows **only** matching students (not the whole list).
- [ ] Works in the course-package and voucher purchase student pickers too (same component).
- [ ] Clearing the search returns to the normal list; selecting a student still works as before.
- [ ] "Add new student «…»" still appears for a non-matching name (per the screenshot) — not removed.

## Analysis / current state (Porter, read-only sweep — for Sober to verify)
- The picker is `StudentSelect.tsx` (used in `BookingModal`), wired to `useStudentSearch` → `GET /students?q=`
  which the backend **does** support (matches name / nickname / parent phone). So the search *plumbing* exists —
  yet the UI shows all students regardless of the typed text (per the screenshots). ⇒ the bug is most likely in
  the **FE wiring**: the typed value isn't being passed to the query, or the combobox renders unfiltered options
  (a common Mantine `Select`/`Combobox` pitfall — options provided but not filtered / `q` not sent). SA/FE to
  pinpoint. Likely a **small FE fix**, backend probably unchanged.

## Constraints
- Reuse the existing `GET /students?q=` search + the existing `StudentSelect` component — this is fixing the
  wiring, not building a new search. HOW is the SA's design.

## Out of Scope
- A separate student search on the **calendar grid** (find a student's existing bookings on the calendar) —
  that was Porter's earlier mis-reading; the stakeholder's actual ask is the booking-picker search above. If a
  calendar-grid search is wanted later, raise it as its own REQ.

## Questions
(SA Lead + stakeholder. Porter answers as `> answer: ...`; business calls → `@Porter`, don't guess.)
- **Search by what?** Name only, or also nickname + parent phone? (The `GET /students?q=` endpoint already
  supports all three — Porter's lean: keep all three.)

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| REQ-011 | 🐛 Student picker doesn't filter when typing (New Booking / course / voucher) — fixed | MEDIUM | ✅ **DELIVERED** | **Live acceptance PASSED 2026-07-29** (stakeholder ran, Porter verified): typing a name in the student dropdown now **filters** the list (not the whole roster). Root cause was backend: `searchStudents` added a parent-phone `ilike('%%')` for non-numeric queries → matched everyone; TASK-033 adds the phone term only when the query has digits. Sober-verified, deployed to `smart-scheduler-back`. |
```
