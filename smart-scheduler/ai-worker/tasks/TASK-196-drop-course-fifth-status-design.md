# TASK-196: Drop Course — a fifth `DROPPED` status (design + owner Qs) (scheduler-back + FE)

- Source: Porter's "REQ-011 (Drop Course)" — defined in the 2026-08-25 log (§2, line 974), no REQ file yet.
- Status: ✅ **DESIGN COMPLETE — split into TASK-198 (BE) + TASK-199 (FE) (Sober 2026-08-28).** Precedence + guard decided; the "owner Qs Q1–Q3" section below is **SUPERSEDED by the RESOLVED section at the bottom** (the mechanism falls out of the course's stored `weekday`/`startTime` + existing soft-cancel/regenerate — no owner question needed). Only resume-vs-real-data testing waits on the FIX-007 repair.
- ⚠️ **Numbering collision:** Porter called this "REQ-011", but `requirements/REQ-011-*.md` is the **delivered**
  student-search fix. Porter to assign a canonical REQ number (next free looks like REQ-071); I did not overwrite the
  delivered file.

## What it is (Porter, 2026-08-25)
Pause a course without cancelling: **out of the schedule, not deleted, NOT `EXPIRED`**, resumable later by the admin
editing the expiry date. A new lifecycle status `DROPPED`.

## SA calls Porter delegated — DECIDED (grounded)
1. **Precedence: `CANCELLED → DROPPED → COMPLETED → EXPIRED → ACTIVE`.** One-line insert in `courseStatus`
   (`lib/course-status.ts:36`), right after the `endedAt` check: `if (c.droppedAt != null) return "DROPPED"`. A paused
   course reads paused **even if its window lapses mid-pause** — otherwise a family that paused returns to find itself
   `EXPIRED`. `CANCELLED` still wins (terminal). Agree with Porter's lean.
2. **Write-guard: EXTEND `assertCourseWritable`, don't reuse the ended one.** Today it refuses `endedAt` →
   `409 COURSE_ENDED` (permanent). Add: a `droppedAt` course refuses the **same add/bill paths** (extra-session,
   create-with-courseId, plan, move, reviving status) but with a **distinct `409 COURSE_DROPPED`** ("resume the course
   before adding to it") — **and the resume endpoint is exempt** (it clears `droppedAt`). Ended is irreversible; dropped
   is reversible — same neighbourhood, different rule, as Porter said. Reusing `isCourseEnded` would make a dropped
   course un-resumable.

## Shape (BE)
- Migration: `dropped_at timestamptz`, `dropped_by text`, `drop_reason text` on `course_packages` (additive, nullable,
  `sid`-first). `courseStatus` reads `droppedAt`; the guard reads it too.
- `POST /courses/:id/drop` (sets droppedAt + takes its sessions out of the schedule per Q1) and `POST /courses/:id/resume`
  (clears droppedAt + restores per Q1 + the expiry edit per Q2). Both idempotent.

## 🔴 Owner questions — do NOT guess (route via @Porter)
- **Q1 (the session mechanism):** on drop, what happens to the remaining PENDING/live sessions? *"Out of the schedule,
  not deleted"* has two readings: **(a)** soft-cancel them (PENDING→CANCELLED, off calendar + slot freed) and
  **regenerate** fresh sessions on resume; or **(b)** a new *hidden/paused* session marker that hides them but keeps
  the rows, un-hidden on resume. (a) reuses existing cancel+create; (b) needs a new session state. **The owner's intent
  decides which.**
- **Q2 (resume):** is resume literally *"admin edits the expiry to a new date"* and sessions regenerate forward within
  the new window from today — or does resume auto-recompute expiry? Confirm the resume UX.
- **Q3 (the filter):** does `DROPPED` become a **fifth filter chip**? That changes the four-status invariant we shipped
  (AC-B6: the counts sum to total → now five). Cheap if yes, but it's the owner's call whether staff filter by it.

## Sequencing (Porter's 08-28 correction)
Design + build proceed **now, in parallel** with the off-by-one fix (TASK-197) — different code. What Porter's earlier
"depends on FIX-007" really meant: the expiry **rule** must be settled (it is — real-start + MAX_WEEK, and TASK-197
corrects the week math). **Only the LAST step — testing the resume path against real repaired data — waits** for the
FIX-007 repair to commit on `sid`. Everything up to that ships.

## Notes
(Once the owner answers Q1–Q3 and the FIX-007 repair commits, this splits into a BE task (migration + drop/resume +
guard + courseStatus) and an FE task (the drop/resume action + the DROPPED badge, reusing the TASK-189 status seam). The
FE badge is nearly free — `DROPPED` slots into the same `course.status` the badge already renders.)

## ✅ Q1–Q3 RESOLVED from existing mechanisms (Sober 2026-08-28) — Porter said "spec + build now"
The questions dissolve once grounded against what the course already stores and what we already have:
- **Q1/Q2 (drop + resume mechanism):** the course row already carries `weekday` + `startTime`. So:
  - **Drop** (`POST /courses/:id/drop {reason?}`): set `droppedAt`/`droppedBy`/`dropReason`; **soft-cancel the remaining
    PENDING + CONFIRMED sessions** (→ CANCELLED — off the calendar, slot freed, rows KEPT = "out of the schedule, not
    deleted"). Reuses the `endCourse` soft-cancel; do NOT `reconcileCoursePlan` (a drop is a pause, not a re-owe).
  - **Resume** (`POST /courses/:id/resume {expiryDate}`): clear `droppedAt`; take the admin's **new expiry** (Porter:
    "resumable by the admin editing the expiry"); **regenerate the owed sessions** (`owedCount`) forward from the next
    date on the course's **own stored `weekday`/`startTime`**, within the new window. The family keeps their original
    slot by construction; a slot taken during the pause surfaces as an ordinary clash for the admin, not a silent move.
  - Both idempotent (drop-a-dropped → 409 `ALREADY_DROPPED`; resume-a-live → 409 or no-op).
- **Q3 (filter chip):** `DROPPED` becomes the **fifth** status/chip — `countByStatus` already returns every status, so
  the filter + counts extend for free; AC-B6 becomes "five counts sum to total". No new decision, just one more entry.

**The only thing that waits for the FIX-007 repair:** testing *resume against real repaired data*. The build ships now.
⇒ split into **TASK-198 (BE)** + **TASK-199 (FE)**.
