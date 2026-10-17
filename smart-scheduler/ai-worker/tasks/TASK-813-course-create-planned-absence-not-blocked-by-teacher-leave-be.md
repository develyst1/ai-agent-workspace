# TASK-813 — BE: **at course create, a week marked planned absence is NOT refused because the teacher is on leave that day** (REQ-123 §4, owner's choice A, LIVE TONIGHT) — @Jason (S ≈ 0.5 d incl. +10 percent)
**From @Sober to @Jason, 2026-10-17.** Source: `requirements/REQ-123-…` **§4** (the owner promised Khwan a fix tonight; a child is about to start). The mechanism is in `MAP-teacher-advance-leave-2026-10-17.md` §4 and `inbox/PM.md` (Sober, 10-17). **HOLD until I say GO in your inbox** (Porter GOes on the claim at once).

## The mechanism (read by me, back `d29e9d0`)
- `createCoursePackage` (`services/scheduler.service.ts:2436-2459`) inserts every planned week through `insertBooking`, **including a week marked planned absence** (`status: "SICK_LEAVE"`, `plannedAtCreation: true`, `:2443`).
- `insertBooking` (`:1271`) always runs `assertTeacherBookable(exec, teacherId, date)` first (`:1277`). Inside it, `teacherLeaveOn` → `TEACHER_ON_LEAVE` (`:1043`) refuses an advance-leave day **whatever the row's status**.
- So the whole create fails with *"ครู {name} ลาวันที่ {date} — เพิ่มคาบกับครูในวันนั้นไม่ได้ …"*, even though that week is not a class.

## Build
- **Skip ONLY the advance-leave check, ONLY for a row inserted as `SICK_LEAVE` + `plannedAtCreation: true`.**
  - For example, an option on `assertTeacherBookable` (`{ allowLeave: true }`) passed by `insertBooking` only in that case.
  - Keep `teacherLeaveOn` / `TEACHER_ON_LEAVE` the one reader and the one text.
- **Everything else stays exactly as it is:**
  - the other checks in the gate (exists, archived, workday, freelance budget) still run for that row;
  - every OTHER row and every other door still refuses a leave day: a normal week of the same course, voucher, move, plan edit, co-teacher, group, camp, ECA, revive;
  - the make-up appended at the end still skips leave days (`:2969-2985`, Seam B);
  - **the teacher's leave day stays recorded.** Nothing touches `teacher_leave_days`.
- **No copy change, no front change, no migration.**

## ✅ Done means: by value, the REQ-123 §4 recipe
1. **Tarb-like:**
   - teacher on advance leave on a Saturday D;
   - a weekly-Saturday course whose weeks include D;
   - **that week ticked as planned absence → the course is CREATED.**
   - The D row is `SICK_LEAVE` + `plannedAtCreation`. The appended make-up is **not** on a leave day. The `teacher_leave_days` row for D still exists.
2. **Same course, D NOT ticked → still refused** with `TEACHER_ON_LEAVE` and the exact existing text (unchanged).
3. **Two leave days, only one ticked → still refused** (on the un-ticked one).
4. A planned-absence week on a non-leave day behaves exactly as before (TASK-148 tests stay green).
- **Mutation set** (`…task813.mutations.json` beside the test, with its `tests` list). Each must bite, at least:
  - the skip removed (1 goes red);
  - the leave check skipped for EVERY row (2 goes red);
  - the skip keyed on `SICK_LEAVE` alone without `plannedAtCreation`, if any non-creation SICK_LEAVE insert exists (show it bites, or say there is no such insert);
  - the leave row deleted at create (1's "still exists" goes red).
- tsc 0 · SAFE full suite, DB unreachable, every setting blanked · **counts** · `unhandled-between-tests: N` · migrations unchanged.
- `git status --short -uall` = only the claimed files. Nothing committed.

## ✅ Claim (Team A, pending @Porter)
back `src/services/scheduler.service.ts` (`insertBooking` + `assertTeacherBookable`'s signature only) · new `src/lib/…task813*.test.ts` (or `src/services/…`) · its mutation set beside it.

## 🚫 Not this task
Cancelling an advance leave (sized separately, waiting for the owner's copy approval); anything else in the advance-leave redesign (long-term); sid/uat (Tanya's).

---
## ✅ 2026-10-17 — Jason (BE) → @Sober: TASK-813 GREEN — a ticked planned-absence week is created on a teacher's leave day (Private AND DUO). Back only, nothing committed.
**Code — `src/services/scheduler.service.ts` only (+10/−3), base `d29e9d0`:**
- `assertTeacherBookable(exec, teacherId, date, opts: { allowLeave?: boolean } = {})`: the `teacherLeaveOn` → `TEACHER_ON_LEAVE` line is wrapped in `if (!opts.allowLeave) { … }` — **same reader, same text**; exists / archived / workday / freelance-budget checks untouched.
- `insertBooking`: `if (input.status === "SICK_LEAVE" && input.plannedAtCreation === true) await assertTeacherBookable(…, { allowLeave: true }); else await assertTeacherBookable(exec, input.teacherId, input.date);` — the old call stays verbatim in the `else`, so TASK-561's and TASK-089's source pins stay green untouched.
- Why this is reachable only from the course create: `plannedAtCreation` is in no zod schema (`validation.ts` has none), so no public body can carry it; and the only `insertBooking` caller that inserts a SICK_LEAVE row is `createCoursePackage`'s ticked week.
**The REQ-123 §4 recipe, by value through the real `createCoursePackage` (fake tx; clock 2026-10-01; course Mon 10-05, size 4; leave on week 3 = 2026-10-19):**
1. Week 3 ticked → **CREATED, Private and DUO**; the D row = `SICK_LEAVE` + `plannedAtCreation`; live rows = 10-05, 10-12, 10-26 + the appended make-up **11-02** (none on 10-19); the leave row still there, nothing deleted/updated on the leave table.
2. Not ticked → `409 TEACHER_ON_LEAVE`, exact text *«ครู Bank ลาวันที่ 2026-10-19 — เพิ่มคาบกับครูในวันนั้นไม่ได้ กรุณาเลือกครูอื่นหรือวันอื่น»* (also with a DIFFERENT week ticked).
3. Two leave days (10-19, 10-26), only week 3 ticked → still refused, naming **10-26**; both ticked → created.
4. A planned absence on a non-leave day → as before.
Narrowness by value at `insertBooking`: SICK_LEAVE without the flag, flag without SICK_LEAVE, a normal row, `status CONFIRMED + flag` → all `TEACHER_ON_LEAVE`; and `allowLeave` still lets archived-teacher / day-off / freelance-no-budget refuse.
**Files:** `src/services/scheduler.service.ts` (M) · NEW `src/lib/planned-absence-vs-leave-task813.test.ts` (14) · NEW `src/lib/planned-absence-vs-leave-task813.mutations.json`. `git status --short -uall` = exactly those three. No migration, no copy, no front.
**Mutation set 8/8 BITE** (baseline 38; its `tests` also run the 561 and 089 pins): C1 skip removed · C2 leave check skipped for every row · C3 keyed on SICK_LEAVE alone · C4 keyed on the flag alone · C5 leave row deleted at create · C6 allowLeave skips the budget check · C7 …the archived check · C8 a second door (resume-booking move) passes allowLeave. CHECKSUM identical. *(C3: no other insert path creates a SICK_LEAVE row today, so it bites through the by-value `insertBooking` test, not a service path — as the brief asked me to say.)*
**tsc 0 · SAFE suite (DB unreachable, every setting blanked): 4,728 pass / 0 fail, 350 files · unhandled-between-tests: 0 · migrations 70 = 70.**
▶️ **Ball: Sober — verify. I start TASK-814's back guard now (placeholder text, marked «copy pending»).**

---
## ✅ 2026-10-17 — @Sober: TASK-813 VERIFIED
**My own run on a clean copy:** `d29e9d0` (git archive) + **only the 3 TASK-813 files** (Jason is already editing `api.ts` for 814 in the shared tree), node_modules junction, own git.
- **tsc 0.**
- **SAFE suite 4,728 pass / 0 fail**, 350 files, `unhandled-between-tests: 0`.
- **Set 813: 8/8 BITE**, baseline 38, every restore byte-identical:
  - C1 the skip removed (the sid 409 returns);
  - C2 the skip applied to every row;
  - C3 / C4 keyed on one condition alone;
  - C5 the leave row deleted;
  - C6 / C7 the budget / archived checks skipped;
  - C8 a second door passing `allowLeave`.
- **Diff read** (+10/−3, `scheduler.service.ts` only):
  - `allowLeave` wraps ONLY the `teacherLeaveOn` → `TEACHER_ON_LEAVE` line;
  - `insertBooking` passes it ONLY for `SICK_LEAVE` + `plannedAtCreation === true`;
  - the old call is kept verbatim in the `else`.
- **Boundary:** unit level, DB unreachable. The fix has not been seen against a real DB. That is sid, with TEST-107's recipe (Tanya).
