# SPEC-045: A course's subject is fixed at creation too (close the create-mode hole)
- Source: REQ-054 (sibling of REQ-053)
- Status: ACTIVE

## Overview
REQ-053 locked *editing* a course session's subject. REQ-054 closes the **create** hole: a brand-new
course can still be born mixed-program because `createCoursePackage` takes a per-row
`sessions[].subjectId` (`scheduler.service.ts:1035-1046`, `s.subjectId ?? input.subjectId`), and the FE
create flow posts per-row subjects (`CreatePlanFlow.tsx:148-153`). The DATA REQUEST confirmed **zero
existing mixed-program courses**, so the column back-fill (below) is lossless.

This spec ships **two things**: the **guard** (must-have, AC-2/3) that makes it impossible to create a
mixed-program course, and the **course-level subject column** (REQ-054 requirement 4) that gives "one
program per course" a real source of truth instead of `bookings[0].subject`. They land as independent
tasks; the guard is non-negotiable, the column is the hardening.

## Part 1 — the guard (must-have)
- **Zod refine** on `createCoursePackage` (`validation.ts:125-148`): every present
  `sessions[i].subjectId` must equal the course-level `subjectId`; message = REQ's server-refusal copy
  `ทุกคาบในคอร์สต้องเป็นกิจกรรมเดียวกัน` / `All sessions in a course must have the same subject.` (AC-2).
- **Service assert** (defensive, mirrors REQ-053's `course-subject-lock.ts` style): in
  `createCoursePackage` after `plannedSessions` is built (`scheduler.service.ts:~1046`), assert all
  `plannedSessions.map(s => s.subjectId)` are one value before the insert loop, throwing the same
  `badRequest`. Boundary + service, so "incidental enforcement stops being enforcement" (TASK-058) doesn't bite.

## Part 2 — FE create-mode: subject is course-level, not per-row
`CreatePlanFlow.tsx` already has a **course-level** program Select (`:216-226`, bound to `subjectId`,
required). The leak is the per-row subject that rides into `confirmCreate` (`:148-153`) via the
`PlanModal` session editor (whose `courseSubjectLocked` is deliberately false in create mode,
`PlanModal.tsx:478`).
- **Lock the per-row subject in create mode too:** extend `courseSubjectLocked` to cover the course
  create draft (drop the `!onLocalSave` exclusion for `plan.kind === "course"`), showing the read-only
  `Input.Wrapper` (`:593-601`) seeded from the course-level `subjectId` instead of the Select (`:602-611`).
- **`confirmCreate`:** stop sending per-row `subjectId` (send only the course-level one; the BE already
  falls back to `input.subjectId` at `:1037`). The client then *cannot* emit mixed rows; the guard
  (Part 1) is the backstop for crafted requests. (AC-1, requirement 3.)

## Part 3 — the course-level subject column (REQ-054 requirement 4, hardening)
- **Schema** (`db/schema.ts:252-281`): add `subjectId: uuid("subject_id").references(() => subjects.id)`
  to `course_packages`. **Nullable first**, back-fill, then set NOT NULL (backfill-before-constraint).
- **Migration** (this repo owns `course_packages`): `bunx drizzle-kit generate` → `0018_*` in `drizzle/`.
  **Back-fill by derivation** — for each course, `subject_id = its bookings[0].subjectId` (the same value
  the app reads today at `mappers.ts:125`). **Lossless & unambiguous** because every course's sessions
  already agree (DATA REQUEST = zero mixed). Edge: a course with zero bookings has no derivable subject
  — `createCoursePackage` always inserts `size` sessions so it shouldn't occur; the nullable-first step
  covers it if it does.
- **Write path:** set `course_packages.subjectId = input.subjectId` in `createCoursePackage`
  (`:1019-1029`) — nearly free, the course-level subject is already threaded end-to-end.
- **Repoint reads** from derivation to the column: `mappers.ts:123-127` and the `limit:1` bookings load
  in `coursesByIds` (`scheduler.service.ts:493-497`). Keep the derivation as a fallback only while the
  column is nullable.
- **REQ-013/014 reporting is unaffected** either way — `som-report.service.ts` reads **per-session**
  `bookings.subjectId` (`:73`), not a course field; the guard makes those sessions provably uniform.

## Scope note
Part 1 + Part 2 fully satisfy AC-1/2/3 and are the smallest safe fix. Part 3 is REQ-054 requirement 4,
kept in scope (low risk here: owns the table, lossless back-fill). If the migration needs to move at a
different pace, Part 3 is the clean split point — but Parts 1+2 must ship regardless.

## Regressions to preserve
SINGLE_SESSION / VOUCHER / FIRST_TRIAL choose subject per booking as today (guard is course-create-only);
existing course booking / plan / extension / move flow untouched; `reconcileCoursePlan`/insert paths that
create COURSE_PACKAGE rows must inherit the course subject (verify if Part 3's column is NOT NULL).

## Tasks
- **TASK-138 (BE, Jason)** — Part 1 guard (zod refine + service assert), REQ refusal copy, unit tests
  (mixed rows rejected; uniform rows pass; single/voucher/trial unaffected). The AC-2 must-have.
- **TASK-139 (FE, Fern)** — Part 2: lock the per-row subject in course create mode (reuse
  `courseSubjectLocked`), seed from the course-level subject, stop posting per-row `subjectId`. Depends
  on nothing; pairs with TASK-138.
- **TASK-140 (BE, Jason)** — Part 3: `course_packages.subject_id` column + `0018` migration + lossless
  derivation back-fill + set on write + repoint the two read sites; keep derivation fallback while
  nullable. Can land after 138/139. Verify insert/reconcile paths set the subject.

## Questions
(Jason/Fern ask here; Sober answers as `> answer: ...`.)
