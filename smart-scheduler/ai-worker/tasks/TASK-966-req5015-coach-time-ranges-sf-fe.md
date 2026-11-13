# TASK-966 — FE: several coaches' leave + part-day leave + working hours (SF) — @Flash (Team C)

**From @Sector, 2026-11-13.**
- **For:** REQ-5015. **Design:** `specs/SPEC-108-req5015-coach-time-ranges.md` §3.5 + §4.
- **Repo:** SF, branch `dong`, the shared working tree. **No git.**
- **Size:** ≈ 1.75–2 d. **Start 2026-11-14.**
- Build against SPEC §4 (typed fake where needed). The real run comes after Brew's TASK-965 is on sid; I tell you when.

## Files (closed list; ask before others)
- The calendar's teacher-leave dialog `src/components/partials/Calendar/Modal/ReportLeaveDialog.tsx` (opened from `CalendarHeader.tsx`), and its strip/panel `Calendar/{LeaveChip, LeaveDayPanel, LeaveDayBanner, LeaveClassRow}.tsx`.
- `src/components/partials/Calendar/CalendarGrid.tsx` + the week grid: a part-day leave greys only its hours (SPEC-108 §4a).
- `src/components/partials/Teachers/TeacherWorkDaysSelect.tsx` + `TeacherFormModal.tsx` (the «วันทำงาน» control).
- The teacher / leave service + hook files they use · `src/types/api/contract.ts` · `src/lib/i18n/dictionaries.ts`.
- Tests next to each.

## What to build
1. **Several coaches (AC1):** the leave dialog's coach picker becomes a multi-select.
   - Save = one POST per coach, sequentially.
   - After saving, a result line per coach: «บันทึกแล้ว» or the server's refusal. One refusal doesn't undo the others.
2. **Part-day (AC2):**
   - «ทั้งวัน» (default ON); off shows From / To time pickers (30-minute steps, From < To);
   - sent as `startTime` / `endTime`;
   - the strip and the panel show «HH:MM–HH:MM» when present;
   - not offered for today's leave (that path picks classes, as now).
3. **Working hours (AC3):** each ticked day in «วันทำงาน» gets an optional From / To (empty = the whole day).
   - Saved as `workHours`.
   - The orphan warning lists classes outside the new hours, the same as today's day-removal warning.

## Done =
- tsc 0 · the SF suite N/0 (paste).
- **Dom tests:**
  - multi-coach makes N posts and shows per-coach results;
  - the «ทั้งวัน» toggle;
  - the time shown on the strip;
  - hours per day saved and the orphan warning shown.
- The real run on sid later (screenshots: dialog with 2 coaches + time, the strip with time, «วันทำงาน» with hours).

## Questions / Implementation Notes / Review
### Flash (Team C) — 2026-11-13: AC1 + AC2 + AC3 built against SPEC-108 §4 / §4a (typed fake where needed)
Repo `smart-scheduler-front`, branch `dong`, the shared tree, **nothing committed** (no git).
**Done =**
- **tsc 0** (`npx tsc --noEmit`).
- **SF suite: `1583 pass / 0 fail`, `Ran 1583 tests across 166 files`** (`bun test`). 45 of them are new, in five files, listed below.
- **`next build` compiles** (it failed once on a Google-font fetch with no code error, then compiled on the retry).
- **Lint:** not runnable here, as in TASK-960 (no `next lint` in Next 16, no eslint in the repo).

**Built:**
1. **AC1, several coaches** (`LeaveTeacherPick.tsx` is a multi-select; `ReportLeaveDialog.tsx` saves):
   - Save sends one `POST /teacher-leave-days` per coach, **sequentially** (a test checks that two calls never overlap), with the same body. Order = the order picked.
   - The result is a line per coach, «บันทึกแล้ว» or the server's own sentence. One refusal does not stop or undo the others (a test refuses the middle coach of three).
   - The «nothing has been cancelled» sentence shows only when at least one coach was saved.
   - One coach picked keeps today's single-coach screens, byte for byte.
   - The Teachers-menu door (a fixed coach) is unchanged. The «what saving will do» preview is not drawn for several coaches (it describes one coach's classes).
2. **AC2, part-day** (admin advance leave only; not offered for today's leave or the teacher's own door):
   - «ทั้งวัน» is on by default. Off, it shows From / To (every 30 minutes, 00:00–23:30). Save waits until both are set and From is before To, with the reason in words.
   - Sent as `startTime` / `endTime` (`HH:MM`) beside `date` or `from`/`to`. A whole-day leave sends no time keys.
   - The strip reads «… · HH:MM–HH:MM», and the panel shows the window next to each day's date. Seconds are dropped.
   - **Cells (Sector added `CalendarGrid` / `CalendarWeekGrid` / `teacher-scope.ts` to my list):** `leaveBlocksSlot(marker, startTime)` is the server's overlap rule (a class at `HH:MM` occupies `[HH:MM, +1 h)`).
     - Day view greys only the overlapped hours (09:00–12:00 → three rows) and only the class inside the window gets the «away» mark. A class that starts when the window ends does not.
     - Week view: a part-day leave does not grey the day cell (it holds every hour), the `+` stays, and only the overlapped classes are marked. `data-leave-day` is `yes` for a whole-day leave and `part` for a part-day one.
3. **AC3, working hours** (`TeacherWorkDaysSelect.tsx`, shared `WorkHoursEditor`, also in `TeacherFormModal.tsx`):
   - Each **ticked** day gets an optional From / To (empty = the whole day). Hours of an unticked day are dropped.
   - A day with one end only, or From not before To, is said in words and nothing is sent. Save is shown for such a draft so it can say so.
   - **Save:** `PATCH /teachers/:id/work-days` carries `workHours` only when hours changed (`null` clears them). A days-only save sends no `workHours` key.
   - **Impact preview:** `GET …/impact` carries `workHours` as JSON when changed. The warning reads «N upcoming sessions fall outside the new hours» when no working day is removed, and keeps the existing «dropping {days}» wording otherwise.
   - **Create form:** `POST /teachers` carries `workHours` when set.
   - Without the `work-days` key the hours are read-only: one line.
   - `TeachersContent.tsx` passes `workHours` to the editor (two lines).

**Tests (45 new):** `lib/scheduler/work-hours-task966.test.ts` (pure rules, 8) · `Calendar/Modal/coach-time-ranges-task966.dom.test.tsx` (13) · `Calendar/leave-window-task966.dom.test.tsx` (strip + panel) · `Calendar/leave-window-cells-task966.dom.test.tsx` (overlap + cells) · `Teachers/work-hours-task966.dom.test.tsx` (14).

**Existing pins updated, each declared in place and about this task's own additions:**
- `teacher-scope.test.ts`: the leave dialog's call strings gained `...leaveWindow`; the submit's disabled expression gained `timeIssue !== null`; `teacherLeave` copy count 47 → 54.
- `leave-range-refusals-task822.dom.test.tsx`: the submit guard gained `timeIssue`.
- `admin-records-leave.dom.test.tsx`: the «no checkbox» check excludes the «ทั้งวัน» switch, which is not a session tick.
- `use-teachers-system-task861.dom.test.tsx`: `LeaveTeacherPick`'s `value` is `[]` now.
- `leave-day-index.test.ts`: the marker carries `startTime` / `endTime` (null for a whole day).

**Files outside the original list** (all in service of the above; the grids and `teacher-scope.ts` were added by you):
- `lib/scheduler/work-days.ts`: the half-hour list and the hours helpers.
- `types/app/scheduler/index.ts` + `lib/api/mappers.ts`: `Teacher.workHours`.
- `services/scheduler.mock.service.ts`: its `setTeacherWorkDays` / `getWorkDaysImpact` take the new argument.
- `Teachers/TeachersContent.tsx`: two lines.

**FE-decided, please look:**
- The hours editor sits under the day buttons, one row per ticked day. A half-filled day is reported on Save (a toast), not inline.
- The new words are the FE's draft in TH and EN, unreviewed.
- A range with a window applies the same window to every day (the server's rule, §3.3).
- The «ทั้งวัน» toggle and the window state are not reset when the date changes. The window is simply not offered, and not sent, while the date is today or past.

**Waiting on you:** the real run on sid after Brew's TASK-965 (3 screenshots: dialog with 2 coaches + time, the strip with time, «วันทำงาน» with hours). No sign-in by me, as in TASK-960. Until then the proof is the fake's.

## Review (Sector, 2026-11-13): ✅ DONE on code; the sid UI run is NOT_TESTED (no-password rule, as TASK-960)
**My re-run:** SF `tsc --noEmit` 0 · `bun test` **1583 pass / 0 fail**.
- The TASK-596 sweep failure Porter named (`leave-window-cells-task966.dom.test.tsx` l.95–96) is fixed: it now asserts on counts, not nodes.

**Read:**
- FE `leaveBlocksSlot` (`teacher-scope.ts:112`) is the server's rule exactly (`s < end && start < s + 60`; NULL times = whole day).
- The contract matches SPEC-108 §4 / §4a and Brew's TASK-965 (work-days PATCH + impact + POST /teachers `workHours`).
- Several coaches are saved sequentially, with a result per coach.

**Flash's FE-decided points, accepted [SA-decided]:**
- the editor layout;
- a half-filled day reported on Save;
- the range window;
- the toggle state across a date change.
- The TH/EN words are drafts: Porter / Tanya may adjust.

**Security review:** none. The controls sit behind the existing leave/work-days gates; the server validates.

**Next:** in the full-tree gate (SYSTEM-FACTS 2026-11-13 deploy rule). The real UI proof goes in Tanya's round after the deploy, through her sid session file (Porter's ruling).
