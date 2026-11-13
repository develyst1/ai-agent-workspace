# TASK-979: BE, D-159-3 fix: the change-pattern act judges the coach's part-day leave and working hours (smart-scheduler-back) — @Brew
**From @Sector, 2026-11-13.** Status: TODO.
- **REQ / SPEC / TEST:** REQ-5016 AC5 × REQ-5015 (SPEC-108 §3.4, SPEC-109 §3.4) · TEST-159 § Gap 1, D-159-3.
- **Owner decision:** fix before the uat release. Owner, verbatim 2026-11-13: *"แก้ก่อนเลย"* (`REQUEST-porter-to-silver-sector-2026-11-13-fo-feedback-1311.md` § Owner decision). It unfreezes SB **for this one change only**.
- **Repo:** SB `dong`, committed base `40f2917`, tree clean when I cut this. **Git:** none.
- **Size:** ≈ 0.25 d.
- **One writer:** you do **not** edit `scheduler.service.ts`; only read it.

## The defect (what I read, and what Tanya reproduced)
- `src/services/course-pattern-change.service.ts` **l.39**: `await assertTeacherBookable(tx, m.to.teacherId, m.to.date);` passes **no** `startTime`.
- `assertTeacherBookable` (`scheduler.service.ts` l.1057) needs `opts.startTime` for two checks:
  - the coach's working hours: the `classFitsWorkHours` check runs only when `opts.startTime` is set;
  - a part-day leave: `teacherLeaveOn(exec, id, date, startTime)` (`lib/teacher-leave.ts` l.72). With no time, it treats any leave on that day as a whole-day leave.
- TASK-838's act passes the time (`scheduler.service.ts` l.6774): `await assertTeacherBookable(tx, m.to.teacherId, m.to.date, { startTime: m.to.startTime }); // 🔻 TASK-965`.
- TEST-159 § Gap 1 (Tanya, on sid, SB `40f2917`):
  - G1-2 / G1-3: a 10:00 and a 16:00 class next to a 13:00–15:00 leave are refused (409 TEACHER_ON_LEAVE). That is **over-blocking**.
  - G1-4: a 10:00 class is accepted for a coach whose hours are 13:00–18:00. That is **under-blocking**.
  - G1-1 (13:00, inside the leave) is refused correctly, and must stay refused.

## The fix [SA-decided]
1. **l.39**: change the call to
   `await assertTeacherBookable(tx, m.to.teacherId, m.to.date, { startTime: m.to.startTime }); // 🔻 TASK-979 (D-159-3): the class's time, as TASK-838 (l.6774)`
   - `m.to.startTime` is the same value the row is written with on l.42.
   - The preview (`previewCoursePattern`, l.91) runs this same function inside a rolled-back transaction, so it is fixed by the same line. Do not touch it.
2. **The header comment (l.4):** after `` `assertTeacherBookable` `` add ` (with the class's time: part-day leave + working hours, TASK-979)`.
3. Nothing else. No `allowOutsideHours`: a pattern change is new work, not a make-up, so the hours apply (the same as TASK-838).

## The tests: add them to `src/services/pattern-change-task971.test.ts`, in a new `describe("🔴 TASK-979 — D-159-3 …")`
Use that file's `fakeTx`. Add a `World` option for the moved-to teacher's `workHours`, plus a stub for the leave reader (`spyOn` on the module that `scheduler.service` imports `teacherLeaveOn` from, or an `exec` shape the reader understands). For both, follow `src/lib/coach-time-ranges-task965.test.ts`. Then add these four cases (they mirror G1-1…G1-4):
- **(a)** a part-day leave from 13:00 to 15:00 and a pattern slot at 10:00 → the act succeeds; the rows move.
- **(b)** the same leave and a slot at 13:00 → refused with `TEACHER_ON_LEAVE`, and **nothing written** (use the file's existing "refusals write NOTHING" shape).
- **(c)** working hours 13:00–18:00 on that weekday and a slot at 10:00 → refused with the `OUTSIDE_WORK_HOURS` refusal (400), and nothing written.
- **(d)** a by-source guard: the call in `course-pattern-change.service.ts` contains `{ startTime: m.to.startTime }`.

If the fake cannot reach the leave reader cleanly, then **(a)** and **(b)** may assert what `assertTeacherBookable` was called with (spy on `sched.assertTeacherBookable` and check that `opts.startTime === "<slot time>"`). Say in your Notes which shape you used.

## DoD: run each, paste the real output in your Notes
- [ ] `bun test src/services/pattern-change-task971.test.ts src/lib/teacher-leave-day-task561.test.ts src/lib/coach-time-ranges-task965.test.ts`. Base for the first two today: **25 pass, 0 fail** (I ran it). With yours, every case passes.
- [ ] `bun test`: the full suite. No new failures against the base; name any failure that was already there.
- [ ] `bunx tsc --noEmit -p .` (or the repo's typecheck script) gives no new errors.
- [ ] `git status --porcelain` lists exactly ` M src/services/course-pattern-change.service.ts` and ` M src/services/pattern-change-task971.test.ts`.
- [ ] `git diff src/services/course-pattern-change.service.ts`: the call line and the header comment change, nothing else.

## After DONE (not yours)
Sector reviews. Then Porter relays the owner's «ขึ้น git», the owner deploys sid, and Tanya re-tests D-159-3 (G1-1…G1-4). After that comes the owner's «release code».

## Implementation Notes (Brew)
**2026-11-13. Status: REVIEW.** SB `dong`, no git, `scheduler.service.ts` only read.
- **Fix:** `course-pattern-change.service.ts` l.39 now `await assertTeacherBookable(tx, m.to.teacherId, m.to.date, { startTime: m.to.startTime }); // 🔻 TASK-979 (D-159-3) …`; header comment extended as asked. Nothing else in that file.
- **Tests** (`pattern-change-task971.test.ts`, new `describe("🔴 TASK-979 …")`, 6 tests): (a) leave 13–15, slot 10:00 → ok, 4 rows moved · (a2) slot 16:00 → ok · (b) slot 13:00 → 409 `TEACHER_ON_LEAVE`, zero writes · (c) hours 13–18, slot 10:00 → 400 `OUTSIDE_WORK_HOURS` words, zero writes (and 14:00 passes) · preview shares the verdict · (d) source pin (the call carries `{ startTime: m.to.startTime }`, one call only).
- **Shape used (you asked me to say):** neither of your two. I added a `gate` option to the file's `World`; the existing `assertTeacherBookable` spy now applies the REAL `leaveBlocksSlot` / `classFitsWorkHours` / `OUTSIDE_WORK_HOURS` / `TEACHER_ON_LEAVE` exactly as the real gate does (hours only when `opts.startTime` is given; the leave judged at that time, a whole day when none). So (a)–(c) fail by value without the fix. It models the gate; the real gate's own behaviour stays covered by the TASK-965 tests.
- **Mutation:** removed `{ startTime: m.to.startTime }` → 4 tests fail ((a), (a2), (c), (d)); (b) passes there on purpose (no time ⇒ whole-day leave refuses). File restored, SHA identical.
- **DoD:** `bun test` on the three files (`pattern-change-task971`, `teacher-leave-day-task561`, `coach-time-ranges-task965`) → 67 pass / 0 fail · full suite → **6150 pass / 0 fail, 405 files** · `tsc` (5.9.2) → exit 0 · `git status --porcelain` → exactly ` M src/services/course-pattern-change.service.ts`, ` M src/services/pattern-change-task971.test.ts` · `git diff` of the service: the call line and the header comment only.


## Review (Sector)
**2026-11-13. Verdict: DONE.**
- **The diff** (`git diff`, SB `dong` on `40f2917`): the service changes in two places, l.39 and the l.4 comment. l.39 is now the same call as TASK-838's (l.6774). Nothing else changed.
- **My re-run:**
  - the 3 named files: 67 pass, 0 fail;
  - the full suite: **6150 pass, 0 fail, 405 files**;
  - `bunx tsc --noEmit -p .`: exit 0;
  - `git status --porcelain`: exactly the two files.
- **Brew's test shape is accepted [SA-decided].**
  - The `gate` stub runs the real `leaveBlocksSlot`, `classFitsWorkHours`, `OUTSIDE_WORK_HOURS` and `TEACHER_ON_LEAVE`, in the real gate's order: the hours check first, and only when there is a time. So (a), (a2) and (c) fail by value without the fix. Brew's mutant run shows that (b) passes either way, as designed.
  - What the stub does not prove is the real gate with this row's time format. That is sid's job, in Tanya's re-test of G1-1…G1-4.
- **Security review:** none. The change passes one internal argument to an existing gate; there is no new input, auth or data exposure.
- **Git (2026-11-13, the owner's «ขึ้น git», relayed by Porter):** SB `dong` **`f68cd5d`**, pushed `40f2917..f68cd5d`; HEAD = origin/dong; the tree is clean.
- **Merge (2026-11-13, the owner's «รวมโค้ด», relayed by Porter):** SB `merge-workflow.sh` ran with no conflict. `develop` fast-forwarded `40f2917..f68cd5d` and was pushed; `dong` = `develop` = `f68cd5d`.
- **Next (was):** Porter relays the owner's «ขึ้น git» (SB, these two files only). Then the owner deploys sid, Tanya re-tests D-159-3, and the owner says «release code».
