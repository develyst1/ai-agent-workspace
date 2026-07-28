# REQ-011: Student search on the schedule (calendar) page
- Status: READY_FOR_SA
- Priority: MEDIUM
- Requested: 2026-07-28 by stakeholder (relaying คุณฟีน / the customer)
- Deadline: none
- Source: customer request — "จำเป็นต้องมี search bar ในหน้า schedule เพราะนักเรียนเยอะมาก เลื่อนหายาก."

## Problem / Goal
The staff calendar shows bookings in a teacher × time grid. With many students, finding a specific student's
booking by scrolling the grid is slow and error-prone. Staff need to **search for a student on the schedule
page** and quickly locate that student's booking(s).

## Requirement
1. The schedule / calendar page must provide a **search control** to find a student and locate their
   booking(s) in the current view.

## Acceptance Criteria
- [ ] Staff can type a student's name in a search box on the calendar page and immediately see that student's
      booking(s) surfaced (filtered / highlighted per the confirmed behavior below).
- [ ] Clearing the search restores the normal calendar.

## Analysis / current state (Porter, read-only sweep — for Sober to verify)
- The calendar today has **no student search** — only filters by **teacher**, **teacher type**, and **badge**.
  No way to find/highlight a specific student's bookings on the grid.
- Each calendar cell **already shows the student name** and all day/week bookings are already loaded
  client-side (`GET /calendar`). So for the **current day/week**, this can be **FE-only** (filter/highlight the
  already-loaded bookings — mirror the existing badge-filter pattern).
- **Student search already exists elsewhere** (the booking-create modal's student picker + the Bookings list
  page), and the backend already has `GET /students?q=` (name / nickname / parent phone) and `GET /bookings?q=`
  (name / subject). Finding a student's booking **outside** the loaded day/week (their next booking across
  future weeks) would reuse those endpoints + navigate the calendar's date — a small BE touch may be needed
  for exact per-student filtering.

## Constraints
- Prefer reusing the existing student-search endpoints / components; don't build a parallel search.
- HOW (FE-only filter vs. cross-view lookup + date jump) is the SA's design, driven by the behavior chosen below.

## Out of Scope
- Redesigning the calendar filters that already exist (teacher / type / badge).

## Questions
(SA Lead + stakeholder. Porter answers as `> answer: ...`; business calls route to `@Porter` — don't guess.)
- **What should picking a student do?** (a) **filter** the calendar to only that student's cells, (b)
  **highlight + scroll** to their cells (grid still visible), or (c) open that student's **booking list**?
- **Search by what?** Name only, or also **nickname** + **parent phone**?
- **Scope:** current day/week only, or also **find their next booking** across future weeks (jump the calendar
  to that date)?
