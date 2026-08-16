# SPEC-042: A course session's subject (วิชา) must not be editable
- Source: REQ-053
- Status: ACTIVE

## Overview
Cross-repo (FE lock + BE refusal). On the plan editor the session edit panel (`แก้ไขคาบ`) offers
date · time · teacher · **วิชา**; changing วิชา on a **course** session is wrong — a course is one
program, fixed at creation. The fix locks it in the UI **and** refuses it server-side (a hidden field
is not a rule).

**🔴 Architectural fact that frames everything:** `course_packages` has **no** subject/program column
(`smart-scheduler-back/src/db/schema.ts:252-281`). A course's program is **derived from one of its
sessions** — `mappers.ts:123-126` and `scheduler.service.ts:488-491` read `bookings[0].subject`
("a course ⇔ one subject; REQ-010"). So editing one session's `subjectId` doesn't just create a mixed
course — depending on row order it can **silently flip the whole course's displayed program**, which is
exactly the REQ-013/REQ-014 revenue-by-activity corruption class. This REQ enforces the "one program
per course" invariant that the schema currently does not.

**Scope decision (SA):** REQ-053 asks to *lock the edit*, not to redesign storage. So this spec takes
the **minimal** path — keep deriving the program from the sessions, and **prevent** the edit that could
make them disagree (FE + BE). Adding a canonical `course_packages.subject_id` column is a **larger
hardening, deliberately OUT of scope here** — recorded as a follow-up observation below, not built.

## The reported surface (grounded)
- **Plan editor** `smart-scheduler-front/src/components/partials/Bookings/PlanModal.tsx`,
  `SessionEditor` (~L439+): renders date · time · teacher · **subject Select at ~L584-591**
  (`t("plan.colSubject")`, state ~L470). It already knows the plan kind: `isCourse = plan?.kind === "course"`
  (~L99). This is the field to lock.
- Not the calendar `MoveBookingForm` (BookingModal.tsx:423-531) — that renders teacher · date · time
  only, no subject. So the calendar move path is not the reported surface, but it shares the service type.
- The FE service type `MoveBookingInput` carries `subjectId` (`scheduler.service.ts:479`), and
  `SessionEditor` sends it: course move via `onPreviewApply({kind:"move", subjectId,…})` (~L516-523),
  voucher move via `move.mutateAsync({patch:{subjectId,…}})` (~L534).

## Flow / behaviour
- **Rule scope: COURSE_PACKAGE sessions only.** SINGLE_SESSION / FIRST_TRIAL / VOUCHER keep editable
  subject (AC-4) — voucher sessions legitimately carry a chosen program (SPEC-026/030). The guard keys
  on `courseId != null` (≡ `bookingType === "COURSE_PACKAGE"`), never a blanket "subject is immutable".
- `insert` / `extra` (adding a new session) legitimately pick a program → leave the subject Select live
  for those; lock it only for **`move`/edit of an existing course session**.

## Tasks (cross-repo, linked)
- **TASK-133 (FE, Fern)** — in `PlanModal.tsx` `SessionEditor`, when `plan.kind === "course"` **and**
  the target is a `move`/edit of an existing session, replace the subject `Select` (~L584-591) with
  **read-only text** (the session's `subject.name`) + the one-line explanation (wording below), and do
  **not** include `subjectId` in the course `move` payload (~L520). Keep the Select live for
  `insert`/`extra` and for the voucher move path. tsc 0 · build ok · hallmark before REVIEW.
- **TASK-134 (BE, Jason)** — server-side **refuse** a subject change on a course session (Depends on:
  none; can land before/independently of TASK-133 — it's the real guard):
  - `applyPlanChange` move branch (`scheduler.service.ts:1619-1627`): if `change.subjectId` is present
    **and differs** from the booking's current `subjectId`, reject (this branch is by definition a
    course session). A no-op (same subjectId) passes (idempotency).
  - `moveBooking` (`scheduler.service.ts:1901-1912`): if `input.subjectId` differs from
    `current.subjectId` **and** `current.courseId != null` (course session), reject; voucher/single/
    trial unaffected.
  - Error code + message: reuse REQ-053 copy — `A course session's subject cannot be changed`
    (add a typed code, e.g. `COURSE_SUBJECT_LOCKED`, so the FE can surface it cleanly). Unit-test both
    paths (reject-on-change, pass-on-noop, voucher-still-allowed).

## Data / API
No schema change, no new endpoint. Existing `PATCH /courses/:id/plan` and `PATCH /bookings/:id` gain a
guard, not a new shape.

## User-facing wording (from REQ-053; via `t(...)`, both TH/EN)
- Read-only explanation line (FE): TH `วิชาของคอร์สกำหนดตอนสร้างคอร์ส เปลี่ยนรายคาบไม่ได้ — หากต้องการวิชาอื่น ใช้คาบเดี่ยว/บัตร หรือเปิดคอร์สใหม่`
  · EN `A course's subject is fixed when the course is created and can't be changed per session — for a different activity use a single session / voucher, or start a new course.` (reuse the REQ's exact strings; any new text → Porter first).
- BE refusal message as above.

## Non-functional
FE: FRONTEND-STANDARD holds. BE: `bunx tsc --noEmit` 0, `bun test` green, transactional guard before write.

## Follow-up observations (NOT in this REQ — flag to Porter, do not build here)
1. **DATA REQUEST (owner-run, via Porter):** existing **mixed-program courses** may already be feeding
   REQ-013/REQ-014 an order-dependent program. Detection query shape (identify only — team does not run
   real DB): group `bookings` by `course_id` where `status <> 'CANCELLED'` and `course_id is not null`,
   keep groups with `count(distinct subject_id) > 1`, join `subjects` for names + list owning
   `student_id`. Porter routes to the owner as a DATA REQUEST; any rows found are an owner decision, not
   a silent reinterpretation.
2. **Possible future hardening (own REQ):** add a canonical `course_packages.subject_id`/`program`
   column so "one program per course" has a real source of truth instead of `bookings[0].subject`.
   Larger than REQ-053; recommend only if the DATA REQUEST shows real mixed rows or REQ-013/014 accuracy
   demands it.
3. **🔴 Related gap found in review (TASK-133 Q1) — create-mode subject corruption (own small REQ):** REQ-053
   locks *editing* an existing course session, but a **brand-new** course can still be made mixed-program —
   `CreatePlanFlow` posts `sessions[].subjectId` per row (`CreatePlanFlow.tsx:152`), and TASK-134's guard is
   on the edit paths only, not `createCoursePackage`. Same REQ-013/014 corruption class, one step upstream.
   Fix shape (a different UX, hence a sibling REQ, not a widening of 053): make subject a **course-level**
   field at creation (not per-row) + a BE guard that all `sessions[].subjectId` equal the course subject.
   Routed to Porter for a small follow-up REQ; deliberately **not** built here.

## Questions
(Jason/Fern ask here; Sober answers as `> answer: ...`.)
