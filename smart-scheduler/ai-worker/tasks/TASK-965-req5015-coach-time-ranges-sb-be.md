# TASK-965 — BE: coach time ranges: part-day leave + working hours (SB) — @Brew (Team C)

**From @Sector, 2026-11-13.**
- **For:** REQ-5015. **Design:** `specs/SPEC-108-req5015-coach-time-ranges.md`. §2–§4 are your contract.
- **Repo:** SB, branch `dong`, the shared working tree. **No git.** Test with `--env-file=.env.sid` plus `DATABASE_URL` inline, as in TASK-959.
- **Size:** ≈ 2.25–2.5 d. **Start 2026-11-14.**
- Flash (TASK-966) builds against §4 in parallel, so keep the shapes exact.

## Files (closed list; ask before others)
- `drizzle/00NN_coach_time_ranges.sql` + journal: NN = the next free number after 0079; journal `when` unique.
- `src/db/schema.ts` · `src/lib/teacher-leave.ts` · `src/lib/work-days.ts` · `src/lib/migration-witness.ts`.
- `src/services/scheduler.service.ts`: the `assertTeacherBookable` hours check; the 9 `teacherLeaveOn` doors; `recordAdvanceLeave` / `reportTeacherLeave` class filter; `getSlotAvailability`; the teacher update + its orphan warning.
- `src/validation.ts` · `src/types/contract.ts` · `src/lib/line-i18n.ts` (only behind Q1, see SPEC §4) · the route test pins it needs.
- Tests next to each.

## Steps
1. **Migration** per SPEC §2, rerunnable, with the witness. Run the repo's preflight / journal tests.
2. **`teacherLeaveOn(…, startTime?)`** with the overlap rule (SPEC §3.1–3.2). Pass the class's time at every door. **Paste the list of the 9 call sites** with how each passes it, and pin it by count.
3. **The act:** a part-day advance leave lists and handles only overlapping classes (incl. TASK-826 co-teaching). A range applies the same window to each day.
4. **Working hours** (SPEC §3.4): the refusal text exactly as written; make-ups and planned absences exempt; the picker skips; the orphan warning on save.
5. **Routes / DTOs** per SPEC §4.

## Done =
- tsc 0 · the full SB suite N/0 (paste) · route-test output for each new refusal.
- **Tests:**
  - a 10–12 leave blocks 10:00 and 11:00 but not 09:00 or 12:00;
  - the make-up skips only the blocked hours;
  - a whole-day leave behaves as before (an existing test unchanged);
  - hours refuse 17:00 for a 13–17 coach (the 16:00 class fits) but not a make-up;
  - the picker skips the coach.
- **AC4:** existing leave / workday tests unchanged and green.

## Questions
_(none open)_

## Implementation Notes
**Brew, 2026-11-13. Status: REVIEW.** SB `dong`, no git by me. Test command: `bun test --env-file=.env.sid` plus a dummy `DATABASE_URL`. No secret printed.

### Evidence
- **tsc:** `bunx -p typescript@5.9.2 tsc --noEmit -p .` → no output, exit 0.
- **Full suite:** `6039 pass / 0 fail — Ran 6039 tests across 398 files` (before this task, with 959: 5921 / 0 / 394; the shared tree's other work added tests too). **AC4:** every existing leave / workday / closed-day test is green; the only edits to existing tests are source pins that quote the lines this task changed (list below).
- **New tests:** `src/lib/coach-time-ranges-task965.test.ts` 36 · `src/routes/coach-time-ranges-task965.test.ts` 7.
- **Migration (offline only):** `drizzle/0080_coach_time_ranges.sql`, hand-authored and rerunnable (columns IF NOT EXISTS, the CHECK is DROP IF EXISTS + ADD, no data written), `teachers.work_hours` LAST. Journal idx 80, `when` 1783000000076, unique and the highest. Witness = column `teachers.work_hours`. ⚠️ **`db:verify` NOT run**: it needs 0080 applied (you apply it on sid). `db:generate` not used.
- **Mutation set:** 17 mutants (the overlap rule at both edges and as a whole; the gate and Seam B asking day-level; the hours check removed; make-up not exempt; planned absence not exempt; the hour must only START inside; the picker; the act's list; the range window; the orphan warning; the re-record widening; two validation rules; `insertBooking` sending no time) → **17/17 KILLED**, every file restored with an identical hash.

### The `teacherLeaveOn` call sites (pinned by count = 6 in `scheduler.service.ts`, plus the lib's own and camp's)
| Site | Passes |
|---|---|
| the gate, `assertTeacherBookable` | `opts.startTime` |
| «a teacher remains» (`remainingOf`, co-teaching) | `c.startTime` (the class's time, now loaded) |
| an extra coach on a group make-up | `hhmm(t.startTime)` |
| the course preview's flag | `input.startTime` |
| Seam B, `findFreeExtensionDate` | `startTime` (it had the param already) |
| the start-date move (`planStartChange`) | the plan row's time (per coach) |
| `assertNoCoachOnLeave` (lib) | `row.startTime`; its 5 callers pass full rows or `{id,date,startTime}` |
| `camp.service.ts` | **no time on purpose** (day-level: a camp coach block spans the day; the part-day answer is "any row that day", i.e. the safe side). File untouched. |

### The `assertTeacherBookable` doors (12, every one passes `startTime`)
`insertBooking` ×2 (normal / planned absence) · attach extra teachers · group-coach swap (`moveGroupRowToTeacher`) · resolve-clash swap · `moveBooking` · swap/move (`patch.startTime ?? b.startTime`) · plan swap · `resumeBooking` (the time it is put back on) · start-date move · plan-move apply (`m.to.startTime`) · `moveRowToCoach`; other-series cover passes `r.startTime`.

### What it does
- **Reader:** `teacherLeaveOn(exec, teacher, date, startTime?, today?)`. ⚠️ **`today` moved from the 4th to the 5th parameter** (no caller passed it). A NULL-times row blocks every class; a part-day row blocks by overlap; no time = day-level (any row).
- **Act:** `recordAdvanceLeave` / `…Range` take `startTime`/`endTime`; the class list, the co-teaching split and the counts see only the overlapping classes. The list follows **the record that stands** (a re-record of a recorded day never widens it). `leave` carries the window only when part-day (a whole-day answer is unchanged, so the old shape tests hold).
- **List:** `GET /teacher-leave-days` rows always carry `startTime`/`endTime` (`HH:MM` or null).
- **Hours:** after the workday check, `OUTSIDE_WORK_HOURS` (400, text exactly SPEC-108 §3.4: «ครู {nickname} ทำงานวัน{weekday} เวลา {from}–{to} — กรุณาเลือกเวลาอื่นหรือครูอื่น»). Exempt: a row carrying `extendedFromId` (every make-up) and a planned absence, set in ONE place (`insertBooking`). The picker skips the coach. The orphan warning is `previewWorkDaysChange(…, workHours?)`: classes on a kept day outside the proposed window are listed (`outsideHoursCount`), nothing moved; without hours sent, today's answer.
- **Bodies:** `adminTeacherLeaveBody` + `startTime`/`endTime` (both or neither, start < end, half hours, never with `sessionIds`); `PATCH /teachers/:id/work-days` body + `workHours` (null clears, absent = unchanged, keys ⊆ `workDays`, a dropped weekday drops its window); impact query `workHours` = JSON; teacher DTO `workHours`. Shapes are in `src/types/contract.ts`.

### Decisions for you
1. **Where `workHours` lives.** SPEC §4 says "the existing teacher update body", but `workDays` is saved by `PATCH /teachers/:id/work-days`, not by `PATCH /teachers/:id` (which takes name/nickname/type/subjects). I put `workHours` on the work-days route and its impact preview, next to `workDays`, which is what the «วันทำงาน» screen saves. Say if you want it on `updateTeacher` as well.
2. **Q1 (LINE copy):** the coach's `teacher_leave_recorded` notice is **unchanged** (no time), as the SPEC says until Porter answers; a test pins it. `line-i18n.ts` was not touched for this.
3. **Validation lines** (2 new Thai sentences on the leave body, 3 on the hours bodies) are engineer wording, listed for the owner's copy review; the dialog's pickers make them unreachable.
4. **Files touched beyond the list:** `src/services/other-series.service.ts` (one line: the cover door passes `r.startTime`), `src/db/mappers.ts` (the DTO's `workHours`), `src/lib/system-teacher-task861.mutations.json` and 7 other `.mutations.json` (anchors re-pointed: the lines they quote now carry the time; their `to` mutants keep meaning the same) and the source pins in ~12 existing tests; the migration count pins 80→81 in 39 test files. `activity-change-task961.test.ts`: two assertions that said "0079 is the last journal entry" now say "the highest up to idx 79". All tagged `🔻 TASK-965`.
5. **The extender** (`jobs.service`) creates group-series dates through `insertBooking` with no `extendedFromId`, so a coach whose hours changed will have those dates reported as clashes by the extender, not created. That is the gate working; say if you would rather it skip silently like a closed day.
6. **A weekly series / course whose coach later gets hours** is only judged on NEW placements; booked classes outside the hours are listed by the warning, never moved (SPEC §3.4).
7. **Migration 0080:** apply on sid, then run `db:verify`.

### Addendum (Brew, 2026-11-13, after Sector's SPEC-108 §4a inbox line)
- `POST /teachers` now takes `workHours` too (`createTeacher` body + service): keys must be among `workDays` when those are sent (absent = every weekday); null / empty = column stays NULL. 2 new route tests (valid, 3 refusals) in `src/routes/coach-time-ranges-task965.test.ts` (now 9). `workHoursShape` moved above `createTeacher` in `validation.ts` (it is used by both). tsc 0 · full suite **6041 pass / 0 fail, 398 files** after the change.

### 🔴 sid hold (Sector, 2026-11-13)
- **What happened:** the owner deployed the shared SB tree to sid while TASK-965 was mid-edit. `db:verify` → `0080_coach_time_ranges NOT applied`.
- **0080** is additive: 2 nullable times, a CHECK that NULL rows pass, a nullable jsonb.
- **But the tree is not green:** `bun test` (dummy `DATABASE_URL` inline) → **5865 pass / 131 fail**. That includes behaviour tests (leave record / preview, swaps, course create), not only migration-count pins.
- **So I did NOT apply 0080.** I told Porter: put sid back on the previous SB build. Brew's hunks are not removed.
- **Brew:** carry on. The suite must be green before this TASK goes to REVIEW. Most failures are likely fixtures and pins your change must update; prove each one.

### sid after the owner's full deploy (Sector, 2026-11-13)
- **The owner had already deployed the shared tree** (owner: "ไม่ทันละ ฉัน deploy ไปหมดแล้ว").
- **I applied 0080 on sid** [PM-decided]:
  - host proven = 154.197.124.206, with the URL passed inline;
  - preflight showed `1 pending: 0080_coach_time_ranges`;
  - migrate → verify **Journal 81 · ledger 129 · witnesses 81 ✅**.
- **Tree suite before:** 5865 / 131 fail. Grouped by test file, these are the **areas that may misbehave on sid until 965 is green.** Many are likely fixture / pin failures, but not proven:
  - coach leave: record, preview, lift, the list (task826 / 561 / 582 / 587 / 819 / 815);
  - planned absence at course create (task813, 12 fails);
  - group dates: extra dates, make-ups, yield, undo (task716 / 713 / 719, req105);
  - swaps / cover and group swap rates (task629 / 632 / 634, req089 resume);
  - DUO course create (req095-13);
  - the system teacher / park blocks (task861 / 942).

## Review (Sector, 2026-11-13): ✅ DONE
**My re-run on the shared tree:**
- `tsc` 0.
- Full SB suite **6041 pass / 0 fail, 398 files** (the other teams' work adds 2 to Brew's 6039).
- `teacherLeaveOn(` in `scheduler.service.ts` = 6, as pinned.

**Read:**
- **`leaveBlocksSlot`** (`teacher-leave.ts:62`): NULL times or no class time → block; otherwise `s < end && s + 60 > start`. That is SPEC-108 §3.1's slot overlap.
- **`classFitsWorkHours`** (`work-days.ts:32`): the class must sit wholly inside the window.
- The doors table is complete (12 `assertTeacherBookable` doors + 6 reader sites + camp day-level on purpose).
- 17/17 mutants killed.

**0080 is on sid already** (applied by me earlier today: Journal 81 · ledger 129 · witnesses 81 ✅). No sid step is left for this TASK.

**Brew's decisions, accepted [SA-decided]:**
1. `workHours` on the work-days route = SPEC-108 §4a.
2. The LINE notice is unchanged until the owner approves the words.
3. The validation sentences are engineer wording, listed for copy review.
4. The extra files and pins: `other-series` cover door, `mappers`, the `.mutations.json` re-anchors, the 80 → 81 count pins.
5. **The extender reports a series date outside the coach's new hours as a clash rather than skipping it.** Accepted: the orphan warning at the hours change is where she learns of the conflict.
6. As SPEC §3.4.
7. Done.

**Security review:** none.
- New inputs are zod-validated (HH:MM on :00 / :30, start < end, keys ⊆ workDays, `sessionIds` exclusive).
- The routes keep their existing guards.
- No new exposure, and no LINE change.

**Addendum checked (Sector, 2026-11-13):** POST /teachers takes `workHours` (`validation.ts:899/902`; keys ⊆ workDays when given). My re-run: tsc 0; the two TASK-965 test files 45/0. DONE stands.
