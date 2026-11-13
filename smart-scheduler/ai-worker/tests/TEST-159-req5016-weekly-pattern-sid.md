# TEST-159: REQ-5016 a course's weekly pattern of hour-slots on sid: TASK-969 + 971 (SB) · TASK-970 + 972 (SF)

**Tester:** Tanya (QA) · **Date:** 2026-11-13 · **Asked by:** Porter (inbox/QA.md) · **Design:** SPEC-109 (§§ 2–4, 8b, 4a) · **REQ:** `requirements/REQ-5016-multi-day-weekly-pattern-hour-slots.md` (incl. § AC4 correction)
**Build:** sid, owner's deploy SB `414a320` · SF `3c94c8b` (0081 applied); the SB HEAD read in the repo is `414a320`, the SF HEAD `3c94c8b`. Admin card `picklocker/state/som.json` (no sign-in by anyone), headless Chrome at 1280, EN.
**Data:** QA coaches QADT2 / QADT3 (`lineLinked=false`) and the parentless QA student «QA-req074-1hr», so no LINE could reach anyone. All QA rows cancelled at the end (see the last table).

## Verdict: ❌ TEST_FAILED, 1 defect (D-159-1, High). The server side passes every AC I could run.

| # | AC | Case | Result |
|---|---|---|---|
| 1 | AC1/2 | **Preview** `POST /courses/preview` with a 4-slot pattern: Mon 10:00 QADT2 · Mon 11:00 QADT3 (in a row, another coach) · Wed 13:00 QADT2 (gap day) · Thu 10:00 QADT2, size 10, from Mon 2027-01-04 | ✅ 10 dates **4 · 4 · 2**: 4/6/7 Jan + 11/13/14 Jan + 18 Jan 10:00 & 11:00, each on its slot's coach. Her "10 classes Mon–Thu = 4 the first week" holds. |
| 2 | AC1 | Validation on create / preview | ✅ `POST /courses` with `pattern`+`sessions` → 400 · `pattern`+`groupKey` → 400 · duplicate slot → 400 · 11:15 → 400 · 22 slots → 400 (all `VALIDATION`, nothing written). The preview route simply has no `sessions` / `groupKey` fields, so it ignores them (200): not a defect. |
| 3 | AC2 | **Doors per row** | ✅ a QA block on QADT3 Mon 11 Jan 11:00 → create **409 `SLOT_TAKEN`** «มีคาบชนในวันที่ 2027-01-11 …», nothing written · Thu 7 Jan closed (QA, re-opened at once) → **409 `DAY_CLOSED`** «วันที่ 7 ม.ค. ปิดทำการ …» |
| 4 | AC1/2 | Create → 201 | ✅ 10 rows exactly as previewed. `GET /courses` gives `slots` = the 4 slots (in pattern order). |
| 5 | AC1 | **The sale UI** (New course → «Several days a week»), preview only, the sale never sent | ✅ row 1 seeds from the course's day / time / coach; I added Thu 12:00 QADT3 and Mon 11:00 QADT3; Generate sent ONE `/courses/preview` with `pattern` (3 slots) and the plan listed 10 dates in pattern order (Mon 10 · Mon 11 · Thu 12, from 1 Feb 2027), with the line «Weekly: Mon 10:00 · Thu 12:00 · Mon 11:00» (O-159-2). `05-sale-editor.png`, `06-sale-plan-weekly-line.png`. |
| 6 | AC4 | **«Leave all day» in the UI** (calendar → booking → ⋯) | ✅ offered on Mon 4 Jan (2 rows) and **absent** on Thu 7 Jan (1 row). Confirm reads «Mark every class of this course on 04/Jan/27 as leave: 10:00, 11:00». It sent `{action:"sick-leave", wholeDay:true}` → 200; **both** hours became SICK_LEAVE. `03`, `04`. |
| 7 | AC4 | `wholeDay` refusals | ✅ with `action: confirm` → 400 · on a non-course row → 400 «แจ้งลาทั้งวันใช้ได้กับคาบของคอร์สเท่านั้น» |
| 8 | AC4 | **Quota counted in weeks** (a course that has STARTED: 4 slots Fri 12:00 T2 · Mon 10:00 T2 · Mon 11:00 T3 · Tue 10:00 T2, size 6, from today, class 1 ATTENDED) | ✅ whole-day Mon 16 Nov (2 hours) → `leaveUsed` **0 → 1** · Tue 17 (same course week) → **stays 1** · Mon 23 (week 2) → **2** · undo Tue 17 (week 1 still has the Mon leaves) → **stays 2** · undo Mon 23 (week 2's last) → **1**. On a course not yet started every leave is a free pre-start declaration (TASK-609), so `leaveUsed` stays 0 there, as before. |
| 9 | AC3 | **Make-ups go to the next free slot** | ✅ course 1, after the whole-day leave: 2 make-ups at **Wed 20 Jan 13:00 QADT2 and Thu 21 Jan 10:00 QADT2** (the next slots after the last planned row, 18 Jan 11:00). With a QA block on QADT2 **Mon 25 Jan 10:00**, the next leave's make-up **skipped it to Mon 25 Jan 11:00 QADT3** (the next slot, its coach). Then Wed 27 Jan 13:00. Undo cancels the leave's own make-up. Course 2 the same (Mon 23 11:00 T3 → Tue 24 10:00 T2). |
| 10 | AC5 | **Change-pattern (API)** on the started course, from 18 Nov → Wed 15:00 QADT2 + Thu 15:00 QADT3 | ✅ preview = act (`moved 4`, first 18 Nov, last 26 Nov, same rows); the preview wrote nothing. The 4 live rows ≥ 18 Nov moved, each slot on its own coach; the attended row, the leave rows and 17 Nov (before `fromDate`) unchanged; `slots` rewritten. Moved rows are PENDING for the re-confirm (`needsReconfirm 3`). |
| 11 | AC5 | Change-pattern clash / 1 slot / validation | ✅ a pattern hitting the QA block → preview and act **409 `SLOT_TAKEN`** «วันที่ 2027-01-25 ครูมีคาบอื่นในเวลา 10:00 แล้ว — ไม่ได้ย้ายคาบใด …», rows byte-identical after · a 1-slot pattern (Tue 14:00) → moved 6, **`slots` → null** · empty / duplicate → 400 |
| 12 | AC5 | **Resume** of a pattern course: drop, then resume from Mon 7 Dec with `{startDate, startTime}` | ✅ the 5 remaining classes re-planned **on the pattern**: Wed 9 / Thu 10 / Wed 16 / Thu 17 / Wed 23 Dec, Wed on QADT2 and Thu on QADT3; `slots` kept |
| 13 | AC5 | **The change-pattern dialog, act** (on the one-slot QA course, Fri 15:00 QADT2 ×4) | ✅ opens on the course's one weekly class; I added Tue 14:00 QADT3 → **one** preview after the last input (no loop, the D-157-1 lesson), «Move 4 classes from 08/Jan/27» with each row's coach, Confirm on → act → «Weekly pattern changed», plan shows Fri 15:00 QADT2 / Tue 14:00 QADT3. `07`, `08`. |
| 14 | AC5/6 | **The change-pattern dialog on a PATTERN course** | ❌ **D-159-1** |
| 15 | AC6 | The plan's «Weekly: …» line for an existing pattern course | ❌ **D-159-1** (absent on both pattern courses; `01-plan-no-weekly-line.png`, `08`) |
| 16 | AC7 | One-slot course | ✅ preview and create without `pattern`: 4 rows weekly Fri 15:00 from 8 Jan, `slots: null`, no weekly line, the dialog opens on its one class |
| 17 | — | Console | ✅ 0 page errors in every run |

## D-159-1: the plan read has no `slots`, so the screen treats every pattern course as a one-slot course (High)
- **Steps:**
  1. A pattern course exists (e.g. created with Mon 10:00 QADT2 · Mon 11:00 QADT3 · Wed 13:00 QADT2 · Thu 10:00 QADT2; `GET /courses` shows those 4 `slots`).
  2. Open its plan: `/scheduler/bookings?course=<id>`.
  3. Press «Change weekly pattern».
- **Expected (SPEC-109 §3.5, TASK-970 4, TASK-972):**
  - the plan shows «Weekly: Mon 10:00, 11:00 · Wed 13:00 · Thu 10:00»;
  - the dialog opens with the course's 4 slots.
- **Actual:**
  - No weekly line (`01-plan-no-weekly-line.png`).
  - The dialog opens with **one** row, Mon 10:00 QADT2, and **already previews "Move 10 classes", all on Mondays 10:00 to 8 Mar, with Confirm enabled** (`02-change-pattern-dialog-open.png`). One click would flatten the pattern and delete its `course_slots`, and the admin is never shown the current pattern.
  - The same missing line shows after the dialog turned the one-slot course into a 2-slot one (`08`).
- **Where it is lost (what I saw):**
  - `GET /api/entitlements/<id>/plan` → `summary` has **no `slots` key** (`summaryKeys` = id … branch; `'slots' in summary` = false).
  - `GET /api/courses` does carry them.
  - SF reads `plan.summary.slots` (`PlanModal.tsx` l.328 the line, l.690 / l.748 the dialogs).
  - The mapper says `slots` is null "when the caller did not load `slots`" (`db/mappers.ts`).
  - Not a fix; the SA places it.
- **Also affected, by the same prop, not run:** the resume dialog (TASK-970 A1) reads the same `plan.summary.slots`, so a pattern course will show the time / coach pickers instead of «Resumes on its weekly pattern: …». The server resume itself is right (case 12).

## Observations (for Porter; not defects against the SPEC)
- **O-159-1:** the «Leave all day» confirm's title still reads «Record leave for this session?» (singular) above the right sentence naming both hours.
- **O-159-2:** the weekly line lists slots in the order typed, «Mon 10:00 · Thu 12:00 · Mon 11:00». SPEC §3.5's format groups by day, in pattern order («จ 10:00, 11:00 · พฤ 12:00»). The generated dates themselves are in the right order. This is draft wording anyway (Q1, the owner's pack).
- **O-159-3 (not ours):** undoing a leave returned a row that was PENDING before the leave as **CONFIRMED** (course 2, Tue 17 Nov). It is the existing undo path; I note it without judging it.

## Not tested
- **AC6, the LINE weekly-pattern text:** on hold for the owner's wording (Q1, default = dates only). The QA student has no parent and the QA coaches have no LINE, so no message could be seen.
- **AC6 elsewhere:** the calendar header, DropResume and CreatePlanFlow have no weekly line by design (Flash, TASK-970: the line lives in `PlanModal` only). The resume **dialog** wasn't opened (see D-159-1).
- **AC3 "coach away":** busy was proven (case 9); a coach's leave / working hours on the next slot were not set up.
- **Notices:** the coach notices (one per coach for a whole day) and the re-confirm message; no LINE recipients in QA data.
- **Duo with a pattern** (SPEC: free); TH screens; 375 px; dark mode.

## Evidence (`tests/evidence/req-5016-sid/`)
- `01-plan-no-weekly-line.png`: D-159-1. The 4-slot course's plan, with the right rows and **no** «Weekly:» line.
- `02-change-pattern-dialog-open.png`: D-159-1. The dialog on that course opens with one Mon 10:00 row, a 10-Monday preview and Confirm on.
- `03-menu-leave-all-day.png` · `04-leave-all-day-confirm.png`: «Leave all day» on the 2-row day and its confirm (also O-159-1).
- `05-sale-editor.png` · `06-sale-plan-weekly-line.png`: the sale editor, and the generated pattern plan with its weekly line (O-159-2).
- `07-change-pattern-preview-one-slot-course.png` · `08-plan-after-change-pattern.png`: the dialog's preview and act on the one-slot course; the plan after it (no weekly line again).
- API statuses and codes are quoted in the table. Scripts are in my scratchpad and are not committed.

## Test data created (sid)
| Row | End state |
|---|---|
| course `4289ee18…` (4 slots, size 10, from 2027-01-04), changed to 1 slot (Tue 14:00) in case 11 | **cancelled** (ADMIN_ERROR). The 4 Jan 10:00 / 11:00 rows stay SICK_LEAVE, as a cancel leaves them. Make-ups CANCELLED. |
| course `66fe0499…` (4 slots, size 6, from 2026-11-13), changed / dropped / resumed | **cancelled**. The 13 Nov 12:00 class stays **ATTENDED** (past) and 16 Nov 10:00 / 11:00 stay SICK_LEAVE. Everything else is CANCELLED. |
| course `fbf0acee…` (one slot, Fri 15:00, size 4, from 2027-01-08), then 2 slots via the dialog | **cancelled** |
| OTHER blocks «QA-5016 clash block» (QADT3 11 Jan 11:00) · «QA-5016 busy next slot» (QADT2 25 Jan 10:00) | **CANCELLED** |
| `closed_days` 2027-01-07 «QA-5016 door check» | **re-opened** at once (soft row). `GET /closed-days` for Jan 2027 → `[]` |
| refused attempts (create with clash / closed day, `pattern`+`sessions`, `pattern`+`groupKey`) | nothing written |

Totals for these QA rows: 30 CANCELLED · 4 SICK_LEAVE · 1 ATTENDED; **0 live**. No revenue was read: a create writes none (TEST-157), and the attended class is the same kind TEST-157 left. History rows (`activity`/pattern change, undo) stay; there is no delete route. No LINE (no linked recipient).

## Re-test 2026-11-13, fix round (SB `fd6884f` TASK-973 · SF `6ffaa6e` TASK-972 Amd 1/1b + TASK-974): D-159-1 ✅ fixed · O-159-1/2 ✅ · ❌ new D-159-2 (Medium, resume)
New QA course `8349c52f…`: the same 4 slots (Mon 10:00 QADT2 · Mon 11:00 QADT3 · Wed 13:00 QADT2 · Thu 10:00 QADT2), size 10, from Mon 2027-02-01.
- **Regression:** create 201 → 10 rows 4 · 4 · 2, as before.
- **D-159-1 fixed:**
  - `GET /entitlements/:id/plan` → `summary.slots` = the 4 slots.
  - The plan reads «Weekly: Mon 10:00, 11:00 · Wed 13:00 · Thu 10:00» (`01-plan-weekly-line.png`).
  - «Change weekly pattern» opens on **the 4 real rows**, with «This is the current pattern. Change a slot to move classes.» and **Confirm off** (`02`).
  - Changing Thu to 15:00 → a new preview, and Confirm on (`03`). Not acted; Cancel.
- **O-159-2 fixed:** the line groups by day in pattern order (above).
- **O-159-1 fixed:** «Leave all day» on Mon 1 Feb (2 rows): the title reads «Record leave for the whole day?» above «… on 01/Feb/27 as leave: 10:00, 11:00» (`04`). The act sent `{action:"sick-leave", wholeDay:true}`; both hours SICK_LEAVE. The 2 make-ups landed on the next slots (Wed 17 Feb 13:00, Thu 18 Feb 10:00).
- **Resume dialog (UI) ✅ on screen:**
  - After a drop (API), «Resume course» shows «Resumes on its weekly pattern: Mon 10:00, 11:00 · Wed 13:00 · Thu 10:00», with no time or coach picker (`05-resume-dialog-pattern-line.png`).
  - It sent exactly `{startDate:"2026-11-23", startTime:"10:00"}` → 200, «10 session(s) put back … ends on 15/Feb/27».
- **❌ D-159-2 (Medium): a pattern course resumed from a date BEFORE its original start ignores the chosen date and re-plans from the original start, on top of its declared leave.**
  - **Steps:**
    1. Pattern course from Mon 2027-02-01, not yet started.
    2. «Leave all day» on 1 Feb: a free pre-start declaration (SICK_LEAVE, planned).
    3. Drop.
    4. Resume from the dialog's offered date, 23 Nov 2026.
  - **Expected:** as for a one-slot course, the classes are laid out from the chosen date. My control on a one-slot course `943a569a…` with the same steps came back on **23 Nov · 30 Nov · 7 Dec · 14 Dec**, with its 1 Feb leave row left alone.
  - **Actual:** the server's `dates` start **2027-02-01**. New PENDING rows sit on **1 Feb 10:00 and 11:00, the same hours as the two kept SICK_LEAVE rows**. So the child is booked on the day the family declared away, and the dialog's date is silently ignored.
  - With a resume date **after** the start (case 12, 7 Dec on a course from 13 Nov) it is right.
  - **What I saw, not a fix:** SPEC §8b's `expandPattern` skips rows before the course's `startDate`, and the resume passes `fromDate` = the chosen date with `courseStart` = the original start.
  - Edge case (pausing a course before it begins), but a silent wrong plan.
- **Test data:** `8349c52f…` and the control `943a569a…` **cancelled** (ADMIN_ERROR): 28 CANCELLED, 3 SICK_LEAVE kept as the cancel leaves them, 0 live.
- **Evidence** (`tests/evidence/req-5016-sid-r2/`): `01-plan-weekly-line.png` · `02-dialog-opens-on-pattern.png` · `03-dialog-changed-confirm-on.png` · `04-leave-all-day-title.png` · `05-resume-dialog-pattern-line.png`.
- **Still NOT_TESTED:** as above (LINE text, coach-away make-up, notices, Duo, TH / 375).

## Re-test 2 2026-11-13, D-159-2 fix (SB `40f2917` TASK-975, SPEC-109 §8c; SF unchanged `6ffaa6e`): ✅ TEST_PASSED
- **D-159-2 fixed**, same recipe as the defect:
  - QA course `b25622fa…`: 4 slots, size 10, from Mon 2027-02-01.
  - «whole-day» leave on 1 Feb (PLANNED, free), then drop, then resume `{startDate:"2026-11-23", startTime:"10:00"}` → 200, `createdSessions 10`.
  - The new rows: 23 Nov 10:00 & 11:00 · 25 Nov 13:00 · 26 Nov 10:00 · 30 Nov 10:00 & 11:00 · 2 Dec 13:00 · 3 Dec 10:00 · 7 Dec 10:00 & 11:00. They start from **the chosen date**, in pattern order, with each slot's coach.
  - **Nothing was placed on 1 Feb.** The two leave rows there are untouched. `slots` kept.
- **Change-pattern before the start (§8c):**
  - QA course `71b4a402…`: Mon 14:00 QADT2 + Thu 14:00 QADT3, size 4, from 2027-02-01.
  - Change from **2026-11-24** to Tue 15:00 QADT2 + Fri 15:00 QADT3: preview = act, `moved 4` → 24 Nov · 27 Nov · 1 Dec · 4 Dec, each on its slot's coach. `slots` rewritten.
- **Quick regression:**
  - create 201 (10 rows);
  - «whole-day» 200;
  - drop + resume of the changed course from 1 Dec → 1 · 4 · 8 · 11 Dec on the new pattern;
  - TEST-159 case 12 (resume after the start) runs code this fix leaves unchanged (§8c: callers with `fromDate ≥ startDate` give the same output). It was not re-run.
- SF unchanged, so the UI results of Re-test 1 stand.
- **Test data:** both QA courses **cancelled** (ADMIN_ERROR): 28 CANCELLED, 2 SICK_LEAVE kept as the cancel leaves them, **0 live**.
- **Evidence:** API only. Statuses and dates are quoted above. Scripts are in my scratchpad and are not committed.
- **NOT_TESTED** unchanged (LINE text, coach-away make-up, notices, Duo, TH / 375).
