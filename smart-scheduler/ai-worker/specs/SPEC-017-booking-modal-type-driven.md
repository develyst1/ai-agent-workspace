# SPEC-017: Booking modal — type-driven tabs, eligibility-filtered students, in-modal context
- Source: REQ-022
- Status: ACTIVE

## Overview
Turn the New-booking modal around: **pick the booking type first** (tabs at the top), then show only what that
type needs, with the student list **filtered to who is actually eligible** and the student's context visible
once picked. Reduces wrong bookings and stops staff having to remember who has a course and how far along.

**As-built verified:**
- The modal already has `bookingType` state and some type-awareness (`isVoucher` at `:557`), but the **type
  selector renders near the bottom** (`:682`) — below the fields it governs. Exactly the REQ's complaint.
- Backend has `getCourses()` (courses with student + `subject`, since TASK-034) and
  `getVouchers({studentId,q})`. `CourseSummary` already carries `size`, `usedSessions`, `leaveUsed`,
  `leaveQuota`, `expiryDate`, `subject`; the voucher DTO carries `totalHours`/`usedHours`/`remaining`/expiry.
  **So the context data mostly exists — what's missing is "who is eligible" as a first-class answer.**

## Design decision — eligibility is a backend answer, not an FE filter
The FE *could* pull all courses/vouchers and filter client-side, but "**does this student have an *active*
course/voucher**" is a **domain rule** (not expired, sessions/hours remaining, not locked), and this project's
standing rule is that the backend is the source of truth. Deriving it in the modal would put a second copy of
that rule in the FE, where it will drift — and it would ship the whole course/voucher table to the browser to
answer one question. So: **one purpose-built endpoint** returns the eligible students *with* the context the
modal must display, in a single call.

## API
**New: `GET /students/eligible?type=COURSE_PACKAGE|VOUCHER`** (authenticated staff)
→ `{ students: Array<{ id, name, nickname, context }> }` where `context` is:
- `type=COURSE_PACKAGE` → `{ courseId, subject: {id,name} | null, size, usedSessions, remainingSessions,
  leaveUsed, leaveQuota, expiryDate }`
- `type=VOUCHER` → `{ voucherId, totalHours, usedHours, remainingHours, expiryDate }`

**Eligibility (server-side, one definition):** a student is eligible when they have at least one course/voucher
that is **not expired** and **has sessions/hours remaining**. A student with two active courses appears once per
active course (the modal lets staff pick which). `FIRST_TRIAL` / `SINGLE_SESSION` do **not** use this endpoint —
they keep today's full student search (`GET /students?q=`), since any student, including a brand-new one, is valid.

No change to `POST /bookings` — the booking payload is unchanged.

> **⚠️ Clarification added 2026-08-01 (TASK-052 review):** "payload unchanged" means **no API change is needed**,
> **not** that fewer fields may be sent. `createBooking`'s schema already accepts **`courseId`** (`ID.optional()`),
> and a `COURSE_PACKAGE` booking **must carry it** — `insertBooking` stores `courseId ?? null`, and both the
> check-in increment and the end-of-day cut are gated on it, so a course booking without one **draws down
> nothing** (a free session, and the remaining count this very endpoint's eligibility reads goes wrong).
> Server-side backstop raised as **TASK-055**.

## Data Model
None. No migration.

## Flow
1. **Tabs at the top** — First Trial · Single Session · Course · Voucher — as the first choice; switching tabs
   re-renders the form. Keep the existing type values; this is presentation + gating, not a domain change.
2. **Per-tab fields (only what the type can use):**
   - **Voucher:** the form **stops asking** for teacher/subject/time and takes them from the clicked slot.
     > **⚠️ CORRECTED 2026-08-01 (Sober — my error, found by Fern during TASK-052).** I originally wrote that
     > "voucher = no teacher, no fixed slot" is *the existing domain rule*. **It isn't.**
     > `scheduler.service.ts:569-571` states it outright: *"No teacher restriction here — 'can't pick a teacher'
     > is a **purchase-time** rule, not a per-session one."* A voucher session is booked into a real slot with a
     > real teacher like any other; what a voucher lacks is the **recurring locked** slot a course package has,
     > and `POST /bookings` requires teacher/subject/time for every type. So "don't ask" is right, **"there is no
     > teacher" is wrong** — the modal must say which teacher and time the slot supplies.
   - **Course:** student (eligible only) + the session's date/time; the course itself supplies subject.
   - **First Trial / Single Session:** as today (student + teacher + subject + time).
3. **Student list per tab:** Course/Voucher tabs load from `/students/eligible?type=…`; Trial/Single keep the
   existing searchable picker.
   - ⚠️ **"Add new student" stays on Trial/Single and is hidden on Course/Voucher** — a brand-new student cannot
     already hold a course or voucher, so offering it there would only produce an immediately-ineligible pick.
4. **Context after selection** (REQ #4): Course → program, `used X of Y`, leave used, expiry. Voucher → hours
   remaining + expiry. Rendered compactly — REQ #5 is explicit that this must not become a wall of text; a small
   summary line/card, not a table.

## Non-functional
- Backend stays the source of truth for eligibility; the FE never re-derives "active".
- No change to booking creation, the freelance cap, or the suspend gate.

## Tasks
- **TASK-051** (Jason, BE): `GET /students/eligible?type=…` + the eligibility rule + context payload.
- **TASK-052** (Fern, FE): tabs-first modal, per-tab fields, eligible-student lists, context display.
  (depends on TASK-051's contract) — **browser-checked before DONE**, per the standing rule.

## Questions
(Sober asks; Porter answers as `> answer: ...`)
- **No blocking question** — the REQ's ACs settle the behaviour, and "active course/voucher" already has a
  meaning in the code (expiry + remaining) that I'm reusing rather than inventing.
- **Two design calls, FYI (both reversible):** (1) **"Add new student" is hidden on the Course/Voucher tabs** —
  it could only create an ineligible student; (2) a student with **two active courses appears once per course**
  so staff pick the right one, rather than us guessing. Say if either surprises คุณฟีน.
