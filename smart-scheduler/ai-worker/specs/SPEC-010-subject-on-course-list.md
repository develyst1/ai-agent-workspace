# SPEC-010: Show the sport program (subject) on the course list (`/scheduler/bookings`)
- Source: REQ-010
- Status: ACTIVE

## Overview
The `/scheduler/bookings` (Bookings/Students) **Course-package cards** don't show which sport program a
student's course is — because `CourseSummary` carries no subject. Confirmed in code (Porter's read was right).
The "All bookings" **table** already shows it (`BookingDTO.subject`), so this REQ is only the **course cards**;
vouchers are out of scope (Porter). Fix = surface the course's subject on `CourseSummary` and render it. **BE +
FE**, but **no schema migration** — derive the subject at read time.

## Design decision — derive the subject, don't add a column
A `course_packages` row has **no `subjectId`**, but course creation stamps a **single** `input.subjectId` onto
**every** booking it generates (`scheduler.service.ts:533`; the sick-leave auto-extension reuses the same
`subjectId` at `:752`). So a course ⇔ exactly one subject, recoverable from any of its booking rows (subjectId
is non-null and survives cancellation). ⇒ **derive `subject` from the course's bookings at read time** — no
migration, no backfill (right for brownfield + a display-only ask). _(If a later REQ — e.g. the REQ-013/014
dashboard "sport %" / "revenue by sport" — needs efficient course→subject aggregation, adding a `subjectId` FK
to `course_packages` is the natural follow-up then; REQ-010 does not need it.)_

## API / Interface
- `CourseSummary` (`types/contract.ts:99`) gains **`subject: SubjectRef | null`** (`SubjectRef = {id, name}`,
  the existing shape). Null only in the degenerate "course has no bookings" case (shouldn't occur).
- Affected response: `GET` courses (`CoursesResponse = CourseSummary & { student }`) — the `/scheduler/bookings`
  list. Post-mutation responses that also embed `CourseSummary` (create/update course) may return
  `subject: null` if they don't load bookings — acceptable (the list re-fetches); load it there too only if trivial.

## Data Model
No change. No migration. Reuses `subjects` (the sport programs) + the existing `bookings.subjectId`.

## Flow
1. **Backend — `getCourses()` (`scheduler.service.ts:313`)**: extend the query to load each course's subject via
   its bookings — `db.query.coursePackages.findMany({ with: { student: true, bookings: { with: { subject: true },
   limit: 1 } } })` (any one booking; all share the subject). (If `limit` on a nested relation is awkward in this
   Drizzle version, load `bookings: { columns: { subjectId: true }, with: { subject: true } }` and take `[0]`.)
2. **Mapper `toCourseWithStudent` (`db/mappers.ts:120`)**: add
   `subject: c.bookings?.[0]?.subject ? { id, name } : null`. Keep everything else identical. The mapper must
   stay safe when `bookings` isn't loaded (→ `null`), so the other call sites don't break.
3. **Frontend — `CoursePackagePanel.tsx`** (the course cards on `/scheduler/bookings`): render the program name
   from `course.subject?.name` (a small labeled line / badge on each card). Add `subject: SubjectRef | null` to
   the FE `CourseSummary` type (`types/api/contract.ts:85`, mirrors the backend). If `subject` is null, show
   nothing (or an em-dash) — don't crash.

## Non-functional
- Backend source of truth; one extra relational load in `getCourses`, no new endpoint. No migration.

## Tasks
- TASK-034: scheduling (BE) — add `subject: SubjectRef|null` to `CourseSummary`; derive it in `getCourses` +
  `toCourseWithStudent`. (Jason) (depends on: —)
- TASK-035: scheduler-front (FE) — render the program name on the `/scheduler/bookings` course cards; add
  `subject` to the FE `CourseSummary` type. (Fern) (depends on: TASK-034 — the contract field)

## Questions
(Sober asks; Porter answers as `> answer: ...`)
- Both REQ questions are answered (screen = the `/scheduler/bookings` course list; vouchers out of scope). The
  subject-derivation (from bookings, no new column) is a technical design call — no open business question.
  One check for the record: a course is one program by construction (single `subjectId` stamped on all its
  bookings). If คุณฟีน expects a *single* course to ever span multiple sports, flag it — that would change the
  model; nothing in the code suggests it does.
