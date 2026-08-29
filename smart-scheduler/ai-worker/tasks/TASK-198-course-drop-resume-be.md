
## Implementation Notes
**Files:** `drizzle/0024_course_dropped.sql` (new) · journal idx 24 · `lib/migration-witness.ts` ·
`db/schema.ts` · `lib/course-status.ts` (+`DROPPED`) · `lib/course-plan.ts` (`isCourseDropped`) ·
`lib/leave.ts` (`toCourseSummary` carries it) · `types/contract.ts` · `validation.ts` · `routes/api.ts`
(2 routes) · `services/scheduler.service.ts` (guard + `dropCourse` + `resumeCourse`) ·
`lib/recurring.ts` (`nextWeekdayOnOrAfter`) · tests in `course-status.test.ts` (+7) and
`course-ended-writes.test.ts` (+9).

**`0024`** — three nullable columns, no CHECK (unlike `0023`): a pause reason is **free text by design**, since
"ไปต่างประเทศ 3 เดือน" is not an enum the way the three ending reasons are. The witness is therefore the **last
column** (`drop_reason`), with the reasoning written in: one transaction, so that column existing means all
three landed.

**Separate columns, separate predicate, separate code — three places, one argument.** Dropping is reversible
and ending is not. One `endedAt` would make "away until March" and "stopped for good" the same fact, and every
guard, badge and filter reading it would then have to guess which. `isCourseDropped` deliberately does **not**
feed `courseOwedTarget`: a paused course still owes its sessions — that is exactly what makes resume possible.

**The message is the feature.** `COURSE_DROPPED` says *"พักอยู่ — กด กลับมาเรียน ก่อน"*. An admin who reads
"cancelled" goes hunting for a mistake; one who reads "paused — resume it first" does the single thing that
unblocks them. There is a test pinning that the string names the way out.

**Precedence: CANCELLED → DROPPED → COMPLETED → EXPIRED → ACTIVE.** DROPPED sits above EXPIRED because telling
the owner "EXPIRED" about a course **he paused himself** sends him to fix something working as designed; below
CANCELLED because a course paused and then ended **is ended**, and the other order would offer a resume button
that cannot work. Both cases are tested, not reasoned about.

### The two things that would have gone quietly wrong
1. 🔴 **Resume must clear `droppedAt` BEFORE it inserts.** `insertBooking` runs through `assertCourseWritable`,
   so a course still flagged dropped **refuses its own resume** — the guard eating the one write meant to lift
   it. Both happen in the same transaction, so a slot clash still rolls the whole resume back and the course
   never comes back half-resumed. Asserted by ordering, not by presence.
2. 🔴 **A taken slot clashes; it never moves the family.** Resume rebuilds on the course's **own**
   `weekday`/`startTime` (the row already stores both), so the family keeps their slot by construction. If
   someone else took it during the pause, `SLOT_TAKEN` surfaces for the admin — silently moving a child to
   another time months after the parent was told when their lesson is, is the one outcome this must not produce.

**Neither drop nor resume calls `reconcileCoursePlan`** — the same rule the ending has, for the same reason:
reconciling would append make-ups for the very sessions just taken off the calendar. Rows are **soft-cancelled,
never deleted** ("not deleted" is the promise), asserted by a test that no `tx.delete` appears.

**The TASK-185 completeness test caught my own new routes** — it failed by omission the moment `/drop` and
`/resume` existed, exactly as designed. Both are now classified, and the enumeration is extended so every
guarded route is checked against a **paused** course too, not only an ended one.

**Verified:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun test` **849 pass / 0 fail** (+16).
⚠️ **I ran nothing against a database.** **Owner-run: `0024`, `sid` first.** Resume-vs-real-data is the one
thing that genuinely needs the box (and per Sober, waits behind the FIX-007 repair).

**DoD:** DROPPED status + guard per route ✅ · resume on its own slot, clash not move ✅ · precedence incl. the
mid-pause-expiry case ✅ · AC-B6 partitions with five ✅ · tsc/test ✅ · migration `sid`-first ⛔ owner-run.

## Questions
- Q1: **resume regenerates from today forward**, not from where the schedule stopped — a pause is a gap in
  time, so restarting in the past would create sessions nobody can attend. The admin's new `expiryDate` is
  required for the same reason. Flagging because "regenerate the owed sessions" could also have meant
  continuing the old dates.
- Q2: `resumeCourse` does **not** check that the owed sessions fit inside the new `expiryDate` — if the admin
  gives too short a window, sessions land past it. I'd rather refuse loudly than book past the ceiling, but
  that is a product call: refuse, warn, or allow (it is *their* new window).

  > answer: (Sober)
