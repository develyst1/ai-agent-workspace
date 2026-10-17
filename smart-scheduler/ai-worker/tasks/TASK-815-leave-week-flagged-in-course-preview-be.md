# TASK-815 — BE: **Generate plan flags a week that falls on the teacher's leave day** (P1) (REQ-123 Phase 1) — @Jason (S ≈ 0.55 d incl. +10 percent)
**From @Sober, 2026-10-17.** Source: `PROPOSAL-REQ-123-teacher-leave-made-easy-2026-10-17.md` (Phase 1 **APPROVED in full** by the owner, 10-17) · facts in `MAP-teacher-advance-leave-2026-10-17.md`. **HOLD until I say GO in your inbox** (Porter grants the claim first).
🔑 **Every NEW user-facing string is a DRAFT:** put it in your report as a TH/EN table. I pass it to Porter, and **nothing ships before the owner approves it.** Already-approved strings are never reworded. Never against sid/uat.

## Why
`previewCoursePackage` (`services/scheduler.service.ts:2817`) checks leave only while placing make-ups (`:2847`). The planned weeks are never checked, so the preview looks fine and Create then fails (TEST-107; MAP §4).
## Build
- Each previewed planned week carries **`teacherOnLeave: boolean`**, using **the one reader** `teacherLeaveOn` (no second date check). Read-only: the preview still writes nothing.
- A week already sent as planned absence (`absentWeeks`) still shows the flag, so the front can show "this absence is on the leave day: fine".
- Contract: the field in `types/contract.ts`. Nothing else changes in the response.
## Claim
back `src/services/scheduler.service.ts` (`previewCoursePackage` only) · `src/types/contract.ts` (one field) · new test + set.

## ✅ Done means (every task)
- Tests by value + a mutation set beside them (each mutation must bite).
- **BE:** tsc 0 · SAFE full suite · counts · `unhandled-between-tests: N`. **FE:** `npx tsc --noEmit` 0 · `bun test` counts · `bun run build` · `unhandled-between-tests: N`.
- `git status --short -uall` = only the claimed files. Nothing committed.

---
## ✅ 2026-10-17 — Jason (BE) → @Sober: TASK-815 GREEN — "Generate plan" flags a week on the teacher's leave day. Back only, nothing committed.
**Code:** `src/services/scheduler.service.ts` (`previewCoursePackage` only): after the weeks (and make-ups) are drawn, a post-pass `const onLeave = await Promise.all(sessions.map((s) => teacherLeaveOn(db, input.teacherId, s.date)))` → `flagged = sessions.map((s, i) => ({ ...s, teacherOnLeave: onLeave[i] != null }))`, and the response returns `sessions: flagged`. THE reader, no second date check; read-only (insert/update/delete/transaction are tripwired in the test). The existing `sessions.push(…)` source pin (TASK-089) is untouched. `src/types/contract.ts`: the preview had no contract type at all, so I added `CoursePreviewSessionDTO { date; startTime; teacher; subject; absent; makeup; teacherOnLeave }` (the one new field is `teacherOnLeave`; the rest documents the row it sits on — say if you want it trimmed to the field alone).
**By value** (`POST /courses/preview` service, clock 2026-10-01, course Mon 10-05 size 4, leave 10-19): week 3 ⇒ `teacherOnLeave: true`, the other three false; whole row `{date,startTime,teacher,subject,absent,makeup,teacherOnLeave}` pinned · no leave ⇒ all false · **week 3 ticked as planned absence ⇒ still `true`** (`absent: true`), and the appended make-up lands on **11-02** with `false` (Seam B skips the leave day) · another teacher's leave ⇒ false · a PAST leave day ⇒ false (the reader's own "today or later" rule) · one read per drawn week by teacher+date · response keys unchanged (`absentWeeks endDate exceedsCeiling expiryDate liveCount sessions size startDate startTime`).
**Files:** `scheduler.service.ts` (M) · `contract.ts` (M) · NEW `src/lib/preview-flags-leave-week-task815.test.ts` (9) · NEW `…task815.mutations.json` (6).
**Set 815: 6/6 BITE** (E1 flag always false · E2 inverted · E3 flagged list not returned · E4 ticked absence not flagged · E5 a SECOND reader that ignores "advance only" · E6 wrong teacher), baseline 24 (its `tests` also run the TASK-089 preview pins), CHECKSUM identical.
**tsc 0 · SAFE suite 4,755 pass / 0 fail, 352 files · unhandled-between-tests 0 · migrations 70 = 70.**
**`git status --short -uall` (back):** 814's four files (still uncommitted — one release) + ` M scheduler.service.ts` · ` M contract.ts` · `?? …task815.mutations.json` · `?? …task815.test.ts`.
**New wording: none** (no string added) ⇒ no DRAFT table for 815.
▶️ **Ball: Sober — verify. TASK-817 (migration 0071) next, on your word.**

---
## ✅ 2026-10-17 — @Sober: TASK-815 VERIFIED
- **Clean copy** of `c1d90d8` + the tree (814's 4 + 815's 4 files): tsc 0 · SAFE suite **4,755 / 0** · unhandled 0 · set **6/6** (E1 always false · E2 inverted · E3 not returned · E4 ticked week unflagged · E5 a second reader · E6 the wrong teacher).
- **Diff read:**
  - a read-only post-pass over the drawn weeks with THE reader `teacherLeaveOn` (keyed on `input.teacherId`);
  - `sessions: flagged`;
  - no write, no other field changed.
- **`CoursePreviewSessionDTO`:** keep it. It types what the preview already returned plus the one new field; no trim needed.
- No new strings. **Fern's TASK-816 can build on `teacherOnLeave`.**
