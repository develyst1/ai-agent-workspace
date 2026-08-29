# TASK-134: Server must refuse a subject change on a course session (BE)
- Source: SPEC-042 (REQ-053)
- Status: DONE (SA-reviewed Sober 2026-08-16); Q1 refusal-copy language → @Porter (non-blocking)
- Assignee: @Jason (BE)
- Depends on: none (the real guard; TASK-133 is the matching UI)

## Context (why)
A course is one program, fixed at creation. Two service paths currently accept a `subjectId` change on a
course session with **no booking-type guard**, so a crafted request (or the pre-TASK-133 UI) silently
corrupts the course's derived program (REQ-013/REQ-014 read it). A hidden FE field is not a rule — the
server must refuse it. Note: `course_packages` has **no** subject column; the program is derived from
`bookings[0].subject` (`mappers.ts:123-126`, `scheduler.service.ts:488-491`) — which is exactly why an
edit must be refused.

## What to do
Add a guard on both write paths in `smart-scheduler-back/src/services/scheduler.service.ts`:
1. **`applyPlanChange`** move branch (~L1619-1627): if `change.subjectId` is present **and differs** from
   the booking's current `subjectId`, reject. (This branch is by definition a course session —
   `b.courseId === courseId`.) Same `subjectId` (no-op) passes → idempotent.
2. **`moveBooking`** (~L1901-1912): if `input.subjectId` differs from `current.subjectId` **and**
   `current.courseId != null` (≡ `bookingType === "COURSE_PACKAGE"`), reject. Voucher / single / trial
   are unaffected (they may change subject).
3. Throw a typed error: code `COURSE_SUBJECT_LOCKED`, message
   `A course session's subject cannot be changed` (so the FE can surface it via `ApiClientError`).

## Definition of Done
- [ ] Changing a course session's subject via `PATCH /courses/:id/plan` (move) is refused with
      `COURSE_SUBJECT_LOCKED`. (AC-2)
- [ ] Changing a course session's subject via `PATCH /bookings/:id` is refused likewise.
- [ ] A no-op (same subjectId) still succeeds (idempotency); date/time/teacher moves on a course session
      still succeed.
- [ ] Voucher / single / trial sessions can still change subject (no regression). (AC-4)
- [ ] Unit tests: reject-on-change (both paths), pass-on-noop, voucher-still-allowed. `bun test` green.
- [ ] `bunx tsc --noEmit` = 0.

## Implementation Notes
**Files (3, all in `smart-scheduler-back`)**
- `src/lib/course-subject-lock.ts` (new) — `changesCourseSubject(current, requestedSubjectId)` + the exported
  `COURSE_SUBJECT_LOCKED` / `COURSE_SUBJECT_LOCKED_MESSAGE` constants. One predicate, called from both paths, so
  the two guards cannot drift (the repo's `lib/booking-slot.ts` idiom from TASK-095).
- `src/lib/course-subject-lock.test.ts` (new) — 5 unit tests.
- `src/services/scheduler.service.ts` — the two guards + one import.

**The rule as implemented:** refuse when a `subjectId` is present **and** `courseId != null` **and** it differs
from the row's current `subjectId`. So: no `subjectId` in the patch → passes (date/time/teacher moves are
untouched); same `subjectId` → passes (a re-sent payload stays idempotent); `courseId == null` (voucher /
single / trial) → passes (AC-4). Thrown as `conflict(COURSE_SUBJECT_LOCKED, …)` = **409** with the typed code,
which is the shape the FE's `ApiClientError` already surfaces.

**Placement**
- `applyPlanChange` move branch — right after the existing `SESSION_DELIVERED` check, before `patch` is built,
  so nothing is written. (This branch is a course session by construction: `b.courseId === courseId`.)
- `moveBooking` — after its `SESSION_DELIVERED` check, before the `db.transaction`. The guard is a pure read of
  the row already loaded, so refusing before opening the transaction is the same guarantee with no write.

**Verification (in `H:\scheduler\smart-scheduler-back`)**
- `bunx tsc --noEmit` → **0**
- `bun test` → **467 pass / 0 fail** (60 files) — was 462 before this task; the 5 new tests are the delta and
  nothing regressed.
- Test coverage maps to the DoD: reject-on-change (the predicate both paths call) · pass-on-noop · no-subjectId
  patch passes · voucher (`courseId: null`) still editable · the code string is the typed one.

**Not done (out of scope, deliberately):** create-mode (`POST /courses` `sessions[].subjectId`) can still be
born mixed-program — that is Sober's own follow-up finding on TASK-133 Q1, routed to Porter as a sibling REQ.
I did not widen the guard into it.

## Questions
- Q1 (copy, non-blocking): the refusal message is the SPEC's exact English string
  `A course session's subject cannot be changed`, but every neighbouring conflict in this service is Thai
  (`คาบที่เรียนไปแล้ว แก้ไขไม่ได้`, `ครูมีคาบในช่วงเวลานี้แล้ว`) and the FE shows the server message to a
  Thai-speaking staff user. I shipped the specced wording rather than authoring copy. If it should be Thai (or
  TH + EN), that's a one-line change in `course-subject-lock.ts` — Porter's call via you.

  > answer (Sober): **good catch — routing to Porter, my rec = Thai (match the neighbours).** You shipped SPEC-042's
  > literal string, which is correct; the English was **my SPEC's miss** — the sibling conflicts here are Thai and the FE
  > surfaces the server message to Thai staff. The FE lock (TASK-133) already carries the bilingual explanation, so this
  > 409 is a defensive fallback, but it should still read Thai for consistency. One-line change on Porter's word; non-blocking.

## Review
**PASS ✅ (SA-reviewed Sober 2026-08-16).** Reproduced, not trusted.
- **Reproduced:** `bunx tsc --noEmit` **0** · new tests part of **12/0** · full suite **474 pass / 0 fail** (no
  regression). Read the code: `changesCourseSubject(current, requested)` = `!!requested && current.courseId != null &&
  requested !== current.subjectId` — **exactly** the specced rule; wired at `scheduler.service.ts:1632` (applyPlanChange,
  after `SESSION_DELIVERED`, before patch) and `:1921` (moveBooking, before the transaction), both `conflict(COURSE_SUBJECT_LOCKED)` = 409.
- **DoD met:** reject-on-change (both paths) · no-op passes (idempotent) · no-subjectId patch passes · voucher/single/
  trial pass (`courseId == null` → AC-4) · typed code the FE surfaces. One shared predicate → guards can't drift.
- **Correctly did NOT widen to create-mode** (my TASK-133-Q1 follow-up, routed to Porter). Good scope discipline.
- **Verdict: DONE.** REQ-053 is now code-complete (FE 133 + BE 134); closes on @Tanya's FE visual pass.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-134 | scheduler-back (BE): server **refuse** a subject change on a COURSE_PACKAGE session (`applyPlanChange` move + `moveBooking`; `COURSE_SUBJECT_LOCKED`; no-op passes; voucher/single/trial unaffected) | SPEC-042 (REQ-053) | ✅ **DONE (SA-reviewed Sober 2026-08-16)** · Q1 copy-language → @Porter. Reproduced: tsc 0 · 474/0 · predicate = exactly specced (idempotent no-op; voucher/single/trial pass); wired at `scheduler.service.ts:1632`+`:1921`, 409 before any write. Correctly not widened to create-mode (my follow-up finding). REQ-053 now **code-complete (FE 133 + BE 134)** → closes on @Tanya FE visual. · _prior:_ 🔎 REVIEW (Jason 2026-08-16 — one pure `changesCourseSubject()` in `lib/course-subject-lock.ts`, called from **both** `applyPlanChange`'s move branch and `moveBooking`, before any write; 409 `COURSE_SUBJECT_LOCKED`; no-op + no-`subjectId` patches pass; voucher/single/trial untouched (AC-4). tsc 0 · **467/0**, 5 new tests. Q1: the specced refusal message is English while every neighbouring conflict in that service is Thai.) | Jason | — |
```
