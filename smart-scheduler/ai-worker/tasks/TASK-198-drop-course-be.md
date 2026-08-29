# TASK-198: Drop / resume a course — the `DROPPED` status + guard (BE) (scheduler-back)

- Source: TASK-196 design (Porter's Drop Course; his "REQ-011", number to be confirmed — collides with delivered
  student-search REQ-011). 🟠 MEDIUM. On `develop`. Builds in parallel with TASK-197 (done) / independent of the repair
  except resume-vs-real-data testing.
- Status: ✅ **BE DONE (Sober 2026-08-28)** — tsc 0·849/0 (+16); DROPPED precedence, distinct COURSE_DROPPED guard, drop soft-cancels, resume clears-first-then-regenerates on own slot. Migration `0024` owner-run sid-first. Unblocks @Fern (TASK-199).
- Repo: **smart-scheduler-back**.

## What
A course can be **paused** (`DROPPED`) and **resumed** — out of the schedule, not deleted, not expired.

1. **Migration** (additive, nullable, `sid`-first): `dropped_at timestamptz`, `dropped_by text`, `drop_reason text`
   on `course_packages`.
2. **`courseStatus` precedence** (`lib/course-status.ts:36`) — insert **after** the `endedAt`/CANCELLED check:
   `if (c.droppedAt != null) return "DROPPED"`. New order: **CANCELLED → DROPPED → COMPLETED → EXPIRED → ACTIVE** (a
   paused course reads paused even if its window lapses mid-pause). Add `DROPPED` to `COURSE_STATUSES`; `countByStatus`
   picks it up (AC-B6 → five counts sum to total — test it).
3. **Write-guard — extend, don't reuse the ended one.** `assertCourseWritable` today refuses `endedAt` →
   `409 COURSE_ENDED`. Add: a `droppedAt` course refuses the **same add/bill paths** but with a **distinct
   `409 COURSE_DROPPED`** ("resume the course before adding to it") — **and the resume endpoint is exempt** (it clears
   `droppedAt`). Dropped is reversible where ended is not; do not collapse the two. Extend the TASK-185 completeness
   test so every course-write route is classified against a dropped course too.
4. **`POST /courses/:id/drop {reason?}`** — one tx: set `droppedAt`/`droppedBy`/`dropReason`; **soft-cancel remaining
   PENDING + CONFIRMED sessions** (→ CANCELLED, reusing the `endCourse` soft-cancel; **no `reconcileCoursePlan`**). Rows
   kept, not deleted. Idempotent: dropping a dropped course → `409 ALREADY_DROPPED`, zero rows.
5. **`POST /courses/:id/resume {expiryDate}`** — one tx: clear `droppedAt`; set the admin's new `expiryDate`;
   **regenerate the owed sessions** (`owedCount`) forward on the course's stored `weekday`/`startTime` within the new
   window (reuse `courseSessionDates` + `insertBooking`; a clash surfaces as `SLOT_TAKEN` for the admin, never a silent
   move). Idempotent on a non-dropped course.

## DoD
- [ ] A dropped course reads `DROPPED`, disappears from the calendar (sessions CANCELLED), and **refuses add/bill writes
      with `409 COURSE_DROPPED`** — proven per route (extend the TASK-185 table), except resume.
- [ ] Resume brings it back on its **own slot**, owes the right count, and a taken slot clashes rather than moving.
- [ ] Precedence tested incl. the mid-pause-expiry case (dropped-and-past-expiry → DROPPED, not EXPIRED). AC-B6 with
      five statuses still partitions.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun test` green. Migration `sid`-first, owner-run; you run
      nothing against a DB. **Testing resume against REAL data waits on the FIX-007 repair; source/unit proofs don't.**

## Notes
(Jason fills in. The FE half is TASK-199. `DROPPED` slots into the same `course.status` the badge already renders, so
the FE badge is nearly free.)
