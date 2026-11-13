# TASK-970 — FE: weekly pattern editor at sale + displays (SF; Team C slice — «ลาทั้งวัน» and the change-pattern dialog are TASK-972, Fanta) — @Flash (Team C)

**From @Sector, 2026-11-13.**
- **For:** REQ-5016. **Design:** `specs/SPEC-109-req5016-weekly-pattern-hour-slots.md` §3–§4.
- **Repo:** SF, `dong` @ `6c52040`. No git.
- **Size:** ≈ 2.5 d. **Start now** against §4 (typed fake). Do TASK-968 first when I ring the unfreeze.
- **The tree is shared:** never hand in half-done.

## Files (closed list; ask before others)
- The course sale form (`Bookings/CreatePlanFlow.tsx` and its pieces), plus a new `Bookings/WeeklyPatternEditor.tsx`.
- `Calendar/Modal/BookingModal.tsx` (whole-day leave).
- The change-teacher-time dialog (TASK-838's component) for change-pattern.
- `Bookings/DropResumeDialog.tsx` · `Calendar/CalendarHeader.tsx` · the course panel (displays).
- `services/scheduler.service.ts` (+ mock) · `types/api/contract.ts` · `lib/i18n/dictionaries.ts`.
- Tests next to each.

## What to build
1. **Sale:** «วันเรียนหลายวัน» opens the pattern editor.
   - Rows of day · time (30-minute steps) · coach; add / remove.
   - Two or more rows send `pattern`; one row keeps today's fields.
   - The previewed dates come from `/courses/preview` before Save.
   - Group-seat sale: no editor (§3.6).
2. **«ลาทั้งวัน»** in the booking modal, when the course has more than one class that day: sends `wholeDay: true`. The per-hour leave stays as now.
3. **Change pattern:** the change-coach/time dialog gains a pattern mode (the same editor), with its preview, then confirm.
4. **Displays:** wherever "every Thu 10:00" shows (course panel, CreatePlanFlow, DropResume, calendar header), a pattern course shows «จ 10:00, 11:00 · พฤ 12:00».

## Done =
- tsc 0 · the SF suite N/0 (paste).
- Dom tests:
  - the editor sends `pattern` and the preview shows the expanded dates;
  - one row = the old body;
  - the whole-day button only when there are several that day;
  - the change-pattern preview → confirm;
  - the displays.
- The real run on sid later.

## Questions / Implementation Notes / Review
### Flash (Team C) — 2026-11-13: the pattern editor, the sale and the displays, built against SPEC-109 §4. Scope as narrowed by SPEC-109 §8: «ลาทั้งวัน» and change-pattern are Fanta's (Team B)
Repo `smart-scheduler-front`, branch `dong`, the shared tree, **nothing committed** (no git).
**Done =**
- **tsc 0** (`npx tsc --noEmit`).
- **SF suite: `1639 pass / 0 fail`, `Ran 1639 tests across 171 files`** (`bun test`). My new tests: 30, in three files, listed below.
- **`next build` compiles.**
- **Lint:** not runnable here (as in TASK-960 / 966).
- The suite showed 4 failures in the middle of the work. They were Team B's in-progress files (`ChangePatternDialog.tsx`, `BookingModal.tsx`); they were green again on the final run. None was from this task.

**Built (mine):**
1. **`Bookings/WeeklyPatternEditor.tsx`** (own component, reusable): rows of day · time · coach, add / remove.
   - Times every 30 minutes over the sale's opening hours (09:00–17:30).
   - A new row opens on a seeded coach; it holds at most 21 rows; the last row can't be removed.
   - It says in words a half-filled row (`incomplete`), two rows on one day and time (`duplicate`), more than 21 (`tooMany`), and that one row is a normal weekly class.
   - It only edits rows and sends nothing. Fanta can reuse it as it is: `rows`, `onChange`, `teachers`, `seedTeacherId?`, `disabled?`.
2. **`lib/scheduler/weekly-pattern.ts`** (pure): `PatternRow`, `patternSlots`, `patternIssue`, `patternPayload`, `patternLabel`, `rowsFromSlots`, `PATTERN_TIMES`, `PATTERN_MAX`.
   - `patternPayload` is the body rule: **two or more complete rows → `{ pattern }`; one row → `{}` (today's fields); an issue standing → `null` (nothing sent).**
3. **The sale (`CreatePlanFlow.tsx`):**
   - A «วันเรียนหลายวัน» checkbox, off by default and **absent in a group sale** (§3.6).
   - Ticking it opens the editor: row 1 seeded with the course's day, time and coach, row 2 empty. The single Time field steps aside.
   - `/courses/preview` carries `pattern`, so the plan shows the server's expanded dates.
   - The sale sends the same `pattern` and **no `sessions`** (the server refuses both). One row sends today's fields, and its time is the row's.
   - A half-filled or duplicated row disables Generate.
4. **Displays:** `PlanModal` shows «Weekly: Mon 10:00, 11:00 · Thu 12:00» (TH «ทุกสัปดาห์: จ 10:00, 11:00 · พฤ 12:00») from `summary.slots`, for a sale preview and for an existing pattern course. A one-slot course shows nothing there.
5. **Service / types:** `CreateCourseInput.pattern` and `previewCoursePackage({ pattern })` (the key is absent on the wire when unused), `CoursePatternSlot` in `contract.ts`, and `slots` on the plan summary type.

**Tests (30 new):** `lib/scheduler/weekly-pattern-task970.test.ts` (pure rules, 15) · `Bookings/weekly-pattern-editor-task970.dom.test.tsx` (the editor, 9) · `Bookings/weekly-pattern-sale-task970.dom.test.tsx` (the REAL `CreatePlanFlow` against a faked server, 6: pattern → preview → plan label → sale with the same `pattern` and no `sessions`; one row = today's body; half-filled row blocks Generate; group sale has no editor; editor off = old body).

**Backed out after your 2026-11-13 message (SPEC-109 §8):** I had added `wholeDay` on `markSickLeave`, `changePattern` / `previewChangePattern` + hooks, and their types. They are all removed, so Fanta owns those names without a clash. BookingModal and the change-pattern dialog are untouched by me.

**Two things in the TASK text that I could not find in the code — please check:**
- «Wherever "every Thu 10:00" shows (course panel, CreatePlanFlow, DropResume, calendar header)»: there is **no weekly line** in `DropResumeDialog`, `CalendarHeader`, `CoursePackagePanel` or `CreatePlanFlow` today (the course's slot is just its first row's date and time). So the display is one new line in `PlanModal` (the plan header: it serves the sale preview and the course plan). If you want it in DropResume or the calendar header too, tell me where.
- SPEC §4 says the change-pattern answer is «like change-teacher-time: `{ moved, rows, notices }`», but TASK-838's real answer is `{ n, firstDate, lastDate }`. Fanta's reader should take either (`moved ?? n`).

**FE-decided, please look:**
- A pattern sale does not carry per-row edits made in the plan modal (`pattern` and `sessions` are exclusive). The plan modal still shows the rows, but saving sends the pattern.
- Files outside the original list: `PlanModal.tsx` (the label line, 3 lines), `types/app/scheduler/index.ts` (`summary.slots`), and the existing tests are untouched. The new TH and EN words (`weeklyPattern.*`) are the FE's draft, unreviewed.
- The editor's coach list is all active coaches (the sale's Teacher field still sets the program).

**Waiting on you:** the real run on sid after Brew's TASK-969 (no sign-in by me). Fanta's «ลาทั้งวัน» and the change-pattern dialog sit on top of the editor above.

**Scope after the owner's GO (2026-11-13), see SPEC-109 §8:** «ลาทั้งวัน» and the change-pattern dialog moved to **Team B (Fanta)**. Flash keeps the pattern editor at sale (as a reusable `WeeklyPatternEditor` component Fanta imports read-only) + CreatePlanFlow + the displays. Size ≈ 1.5 d.

## Review (Sector, 2026-11-13): ✅ DONE on code (Team C slice); the real run comes with Tanya after the deploy (no-password rule)
**My re-run:** SF `tsc` 0 · `bun test` **1638 pass / 0 fail** (the shared tree, incl. Team B's in-flight files).

**Read:**
- `patternPayload`: 2+ complete rows → `{ pattern }`, 1 row → today's body, an issue → nothing sent. That matches SPEC §3.1 and Brew's server (pattern exclusive with `sessions`).
- The group sale has no editor (§3.6).
- `WeeklyPatternEditor` is reusable as Fanta needs it.

**Flash's two questions:**
1. **The display in `PlanModal` only is right.** Those other screens have no weekly line today, so there is nothing to change there. [SA-decided]
2. **The change-pattern answer shape:** my SPEC §4 was wrong to write `{moved, rows, notices}`. The real answer is **whatever Bob's TASK-971 act returns**, on TASK-838's shape `{ n, firstDate, lastDate }`. Corrected in SPEC-109 §4a; Fanta reads Bob's real contract.

**FE-decided points, accepted:**
- a pattern sale ignores per-row plan edits;
- the coach list is all active coaches;
- the `weeklyPattern.*` words are drafts.

**Security review:** none (UI only; the server validates).

### Addendum A1 (Sector, 2026-11-13, from Silver's TASK-971 review): DropResume on a pattern course, ≈ 0.25 d
- **What's wrong:** `resumeCourse` (Bob, TASK-971) re-plans a course with `slots` onto its **pattern** and **ignores** `startTime` / `teacherId` (`scheduler.service.ts`, resume, "patternRows … slotOverride"). But `DropResumeDialog.tsx` (:95–97, :343, :359) still shows the time and coach pickers, which is misleading.
- **Change:**
  - When the course has `slots` (2+), **hide the time and coach pickers** and show one line: «กลับมาเรียนตามตารางเดิม: {patternLabel}» / EN "Resumes on its weekly pattern: {label}". Reuse `patternLabel`.
  - Still send `startDate`. For `startTime`, send the first slot's time: the body requires it, and the server ignores it for a pattern course.
  - No `teacherId` key.
  - A one-slot course: unchanged.
- **Done =** tsc 0 · SF suite N/0 · a dom test (pattern course: no pickers, the line shown, the body; one-slot: unchanged).

#### Flash (Team C) — 2026-11-13, Addendum A1 built
- **Evidence:** tsc 0 · **SF suite `1642 pass / 0 fail`, `Ran 1642 tests across 172 files`** · `next build` compiles · the new test `Bookings/resume-pattern-task970.dom.test.tsx` (4) passes.
- **`DropResumeDialog.tsx`:** a new optional prop `slots` (the plan summary's `slots`; `PlanModal` passes it). With 2+ slots, on the resume face:
  - the time Select and the coach Select are not drawn; the date picker stays;
  - one line reads «กลับมาเรียนตามตารางเดิม: จ 10:00, 11:00 · พฤ 12:30» (EN «Resumes on its weekly pattern: …») through `patternLabel`;
  - the body is `{ startDate, startTime: <first slot's time> }` with **no `teacherId` key**.
  - A one-slot or no-pattern course is unchanged: both pickers, the course's own time, today's coach rule.
- **Dictionary:** one new key, `weeklyPattern.resumeLine` (TH = your sentence, EN is my draft).
- **A source pin I kept intact:** `resume-teacher.test.ts` reads the exact line `teacherId: resumeTeacherIdToSend(teacherId, courseTeacherId),`, so the pattern body is a separate object in a ternary and that line is untouched.
- **The test (4):** a pattern course has no combobox pickers and shows the exact line; its POST to `/courses/c1/resume` has exactly `startDate` and `startTime` (`10:00`, the first slot, not the course's own 14:00); `slots` null and a one-slot list keep both pickers, no pattern line, and the course's own time. It builds its two hooks from the real service functions, because another file's global hooks stub otherwise reaches it.

**A1 review (Sector, 2026-11-13): ✅ DONE.** My re-run: SF tsc 0, 1642/0. Behaviour as specified: a pattern course hides the pickers and shows «กลับมาเรียนตามตารางเดิม: …»; the body is `{startDate, startTime = first slot}`, no `teacherId`; a one-slot course is unchanged. Security review: none (UI only).
