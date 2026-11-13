# TASK-973: BE, D-159-1 fix: the plan read carries the course's weekly pattern (`summary.slots`) (smart-scheduler-back) — @Brew
**From @Sector, 2026-11-13.**
- **REQ / SPEC / TEST:** REQ-5016 AC5/AC6 · SPEC-109 §3.5 · TEST-159 § D-159-1.
- **Repo:** SB `dong`, committed base `414a320` (tree clean when I cut this). **Git:** none.
- **Size:** ≈ 0.25 d.
- **One writer:** you hold `scheduler.service.ts` for this TASK only. Say "released" in your hand-in.

## The defect (what I read)
- `getEntitlementPlan` (`src/services/scheduler.service.ts` l.2808) loads the course with `with: { coStudent: true }` (l.2815–2818).
  - It never loads `slots`.
  - Its `summary` (l.2866–2874) spreads `toCourseSummary(course)`, which has no `slots`.
- The course list's DTO gets them through `toCourseWithStudent` (`src/db/mappers.ts` l.335), loaded at l.720 (`slots: true`). So `GET /courses` is right and the plan isn't.
- SF reads `plan.summary.slots` for the weekly line (`PlanModal.tsx` l.328), the change-pattern dialog (l.690) and the resume dialog (l.748).

## Closed file list
1. `src/db/mappers.ts`: lift the l.335 expression into one exported helper, `courseSlotsDto(c)`. It returns `CourseSlot[] | null`, the same as now: 2+ rows → sorted by `ord`, `HH:MM`; otherwise null. `toCourseWithStudent` calls it. **One builder, never a second copy.**
2. `src/services/scheduler.service.ts`, **`getEntitlementPlan` only:**
   - l.2817 `with: { coStudent: true, slots: true }`;
   - in the course `summary`, after the spread: `slots: courseSlotsDto(course),` with a `🔻 TASK-973 (D-159-1)` tag.
   - The voucher branch is untouched.
3. `src/types/contract.ts`: the course plan's summary type gains `slots: CourseSlot[] | null`, if that type is declared there. Grep it, and name the line in Notes.
4. A new test, `src/services/entitlement-plan-slots-task973.test.ts`, in the style of `entitlement-plan-branch-task916.test.ts`:
   - (a) a course with 2+ slots → `summary.slots` in `ord` order, `HH:MM`, each `teacherId`;
   - (b) a one-slot course (no rows) → `summary.slots === null`, and `'slots' in summary` is true;
   - (c) the voucher plan has no `slots` key (unchanged).

## DoD (each with its command)
- [ ] SB `bunx --package typescript@5.9.3 tsc --noEmit` → exit 0.
- [ ] SB full suite `DATABASE_URL=postgres://dummy:dummy@127.0.0.1:1/dummy bun test --env-file=.env.sid` → 0 fail (base: 6133 pass at gate #2, plus your new tests).
- [ ] `git diff --stat` shows only the files above.
- [ ] Notes paste the real output of each command.

## Not in scope
- No migration. No change to `GET /courses`, change-pattern or resume server code (TEST-159 cases 10–12 pass).
- SF is Flash's TASK-974.

## Implementation Notes
**Brew, 2026-11-13. Status: REVIEW. `scheduler.service.ts` RELEASED.** SB `dong`, no git.
- `src/db/mappers.ts`: exported `courseSlotsDto(c)` (the l.335 expression lifted, unchanged); `toCourseWithStudent` calls it. One copy.
- `getEntitlementPlan` only: `with: { coStudent: true, slots: true }`; `slots: courseSlotsDto(course)` after the spread, tagged `🔻 TASK-973 (D-159-1)`; import added. Voucher branch untouched.
- `contract.ts`: NOT changed. Grep for the plan's summary type (`owedCount`, `summary:`) finds none there; the plan is an inferred return type, so nothing to extend.
- New `src/services/entitlement-plan-slots-task973.test.ts`, 5 tests: (a) 2+ slots in `ord` order, HH:MM, teacherId · (b) none / empty / one row → `null` with the key present · (c) voucher has no `slots` · plan = helper output · source pin (one builder).
- ⚠️ One file outside your list: `src/lib/duo-course-req095-13.test.ts:410`, a source pin quoting the old `with: { coStudent: true }, // TASK-422` line; updated to the new text, tagged.
- **tsc** (`bunx -p typescript@5.9.2 tsc --noEmit -p .`) → exit 0 (5.9.3 not used; same as my earlier runs).
- **Suite** (`DATABASE_URL=postgres://dummy:dummy@127.0.0.1:1/dummy bun test --env-file=.env.sid`) → `6138 pass / 0 fail, 404 files` (first run had 1 fail = the pin above).
- **`git diff --stat`:** mappers.ts 6, duo-course-req095-13.test.ts 2, scheduler.service.ts 5, plus the new untracked test.

## Review
**Sector, 2026-11-13: DONE.**
- **Diff read in full:**
  - `courseSlotsDto` is the l.335 expression lifted unchanged, and `toCourseWithStudent` calls it (one builder);
  - `getEntitlementPlan` loads `slots` and sets `summary.slots` after the spread (the voucher branch is untouched);
  - the import is added.
- **The one file outside the list,** `duo-course-req095-13.test.ts:410`: a test that checks the exact source text of the line that changed. Following that line is the correct update. Accepted.
- **`contract.ts`:** no change is right. The plan's type is inferred, and the SF already declares `summary.slots`.
- **My re-run:**
  - `bunx --package typescript@5.9.3 tsc --noEmit` → exit 0;
  - the suite (dummy `DATABASE_URL` + `--env-file=.env.sid`) → **6138 pass · 0 fail · 404 files**.
- **Security review:** none. A read-only field is added to an existing route, under the same auth (`GET /entitlements/:id/plan`). No input, no secrets.
- `scheduler.service.ts` is released.
