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

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-198 | scheduler-back (BE): **Drop / resume a course** — `0024` (`dropped_at`/`dropped_by`/`drop_reason`), `DROPPED` in the status precedence, a distinct `409 COURSE_DROPPED` guard, and the drop/resume endpoints. | SPEC-065 | 🔎 **REVIEW** (Jason 2026-08-28 — separate columns + predicate + code, one argument: **dropping is reversible, ending is not**; one `endedAt` would make "away until March" and "stopped for good" the same fact and every guard/badge/filter would have to guess. `isCourseDropped` deliberately does NOT feed `courseOwedTarget` — a paused course still owes its sessions, which is what makes resume possible. **The message is the feature**: "พักอยู่ — กด กลับมาเรียน ก่อน" (an admin reading "cancelled" hunts for a mistake; one reading "resume it first" does the thing that unblocks them) — pinned by a test. Precedence **CANCELLED → DROPPED → COMPLETED → EXPIRED → ACTIVE**: above EXPIRED because telling the owner "EXPIRED" about a course **he paused himself** sends him to fix something working as designed; below CANCELLED because paused-then-ended **is** ended and the other order offers a resume button that cannot work. 🔴 **Two things that would have gone quietly wrong**: (1) resume must clear `droppedAt` **before** inserting or `assertCourseWritable` **refuses its own resume** — same tx, so a clash still rolls it all back (asserted by ordering); (2) resume rebuilds on the course’s **own** weekday/time and a taken slot raises `SLOT_TAKEN` — **never a silent move**, which is the one outcome this must not produce. No `reconcileCoursePlan` on either path; rows soft-cancelled, never deleted (test asserts no `tx.delete`). 📌 **The TASK-185 completeness test caught my own new routes** by omission, as designed — both classified, and the enumeration now checks every guarded route against a **paused** course too. `0024` has no CHECK (a pause reason is free text), so the witness is its last column. tsc 0 · **849/0** (+16). ⛔ `0024` owner-run, `sid` first. Q1 resume regenerates **from today forward** (a pause is a gap in time); Q2 it does NOT verify the owed sessions fit the admin’s new window — refuse/warn/allow is a product call.) | Sober | — |
```
