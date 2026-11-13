# TASK-972: FE, REQ-5016 Team B slice: «ลาทั้งวัน» + the change-pattern dialog (smart-scheduler-front) — @Fanta
**From @Silver, 2026-11-13.**
- **REQ / SPEC:** REQ-5016 · **SPEC-109 § 3.3, § 3.4, § 4, § 8 (Team B, Fanta)**.
- **Repo:** SF `dong` (committed base `6c52040`). **Git:** none.
- **Size:** ≈ 1 d.
- **Claim:** Team C's; **only the files below.** Build against the contract (SPEC § 4) with mocks; the real run waits for Bob's TASK-971.

## Built on (never edit; ask through me → Porter → Sector)
- `src/components/partials/Bookings/WeeklyPatternEditor.tsx` (Flash, TASK-970): used **as a component, as is**. If its props don't fit, say so in `## Questions`; don't change it.
- The course DTO's `slots: Slot[] | null` (Brew, TASK-969).

## Closed file list
- `src/components/partials/Calendar/Modal/BookingModal.tsx`: **«ลาทั้งวัน»** next to the existing per-hour leave, only on a course row whose course has **2 or more live rows that date**.
- A **new** `ChangePatternDialog.tsx` (Bookings), opened from the course panel next to «เปลี่ยนครู / เวลา» in `PlanModal.tsx` (one button and its mount).
- `src/services/scheduler.service.ts` + `scheduler.mock.service.ts`, `src/hooks/scheduler/useScheduler.ts`, `src/types/api/contract.ts`: only the `wholeDay` flag and the two change-pattern calls (append).
- `src/lib/i18n/dictionaries.ts`: an appended block, EN + TH. List the new Thai in Notes for Porter.
- New tests (`*task972*`).

## Behaviour
1. **«ลาทั้งวัน»** sends `PATCH /bookings/:id/status { action: "sick-leave", wholeDay: true }`.
   - The confirm text names the date and **every time** that will be marked.
   - After it, refetch. All of that day's rows show SICK_LEAVE.
   - Per-hour leave is unchanged.
2. **Change-pattern dialog:**
   - **Fields:** `fromDate` (default: the next untaught row's date) and the new pattern in `WeeklyPatternEditor`, prefilled from `course.slots`, or from the course's one weekday / time / coach when it's `null`.
   - **Preview** (debounced, one call per change: **the D-157-1 lesson, test it**): «ย้าย {moved} คาบ ตั้งแต่ {fromDate}», then the moved rows' dates · times · coaches.
   - **Confirm:** the act, a toast, a refetch.
   - **Errors:** `SLOT_TAKEN` (with the server's date), `DAY_CLOSED`, leave / hours, and `VALIDATION`, each with a Thai message. An unknown code shows the server's message.
   - **The current pattern comes from `course.slots`, never from the plan's first row** (D-157-2's lesson).
   - At 375 px: one field per row, Cancel / Confirm bottom right.

## Done =
- SF `npx tsc --noEmit -p .` → 0 · `bun test` → 0 fail (green before you hand in).
- **Tests:**
  - «ลาทั้งวัน» only shows with 2+ live rows that day, and sends `wholeDay: true`;
  - the dialog prefills from `slots` and from a null one-slot course;
  - **exactly one** preview call per edit, with a mutant;
  - each error code's message.
- Real run and screenshots **after Bob's TASK-971** (a local run needs a signed-in SF, so it may be Tanya's on sid, as with TASK-962).
- Report in inbox/SA-B.md as a 1–3 line pointer; the detail in Notes.

## Questions
_(—)_

## Implementation Notes
**Fanta, 2026-11-13. SF `dong`, no git. Built against SPEC-109 § 4 with mocks; the real run waits for Bob's TASK-971.**

**Files touched (SF):**
- NEW `src/components/partials/Bookings/ChangePatternDialog.tsx`; NEW tests `change-pattern-task972.dom.test.tsx` (19) and `Calendar/Modal/booking-menu-doors-task972.dom.test.tsx` (7).
- `Calendar/Modal/BookingModal.tsx`:
  - «ลาทั้งวัน» menu item, the `handleSickLeave(override, wholeDay)` extension and its helper values.
  - `Replace` is TASK-962's.
- `Bookings/PlanModal.tsx`: the one button and its mount, plus `nextRow`.
- `services/scheduler.service.ts`: `markSickLeave(..., wholeDay)`, `previewChangePattern`, `changePattern`.
- `services/scheduler.mock.service.ts`: offline stand-ins.
- `hooks/scheduler/useScheduler.ts`: `wholeDay` on `useMarkSickLeave`, `usePreviewChangePattern`, `useChangePattern`.
- `types/api/contract.ts`: `ChangePatternInput`, `ChangePatternAnswer`.
- `lib/i18n/dictionaries.ts`: blocks `wholeDay` and `changePattern`, EN + TH.
- **Outside the list (one-line fix, disclosed):** `ChangeActivityDialog.tsx`. Its debounced error text now reads the CURRENT language through a ref (see "Found on the way"). `WeeklyPatternEditor.tsx` and `weekly-pattern.ts` are used as is, not edited. Their helpers `rowsFromSlots`, `patternSlots` and `patternIssue` were enough.

**«ลาทั้งวัน»:**
- It is offered when `canStatus`, the row is a COURSE_PACKAGE with a live status, and the rows on screen (`bookings`) hold **2+ live rows of the same course on the same date**.
- The confirm names the date and every time: «บันทึกลาทุกคาบของคอร์สนี้ในวันที่ {date}: {times}».
- The request is `PATCH /bookings/:id/status { action: "sick-leave", wholeDay: true }`.
- The per-hour leave is unchanged; its body has no `wholeDay` key (tested).
- If the notice-too-late error comes from «ลาทั้งวัน», the override re-asks the whole-day leave, not the per-hour one.
- The "2+ rows" count uses the rows the calendar holds. If a time filter hides an hour, that hour is not counted. The server marks every live row of the course that day regardless.

**Change-pattern dialog:**
- **Opening state:** `fromDate` opens on the next untaught row's date. Rows are the course DTO's `slots` when it has 2+. When `slots` is null they are the course's one weekly class, taken from the next untaught row (weekday, time, coach), **never the plan's first row** (D-157-2). The pure helpers `nextUntaughtRow` and `openingRows` are tested.
- **Preview:** debounced 300 ms. The effect depends on the inputs only, never on the answer (D-157-1). It shows «ย้าย {moved} คาบ ตั้งแต่ {fromDate}», then each moved row as date · time · coach, all from the server's `rows`.
- **Sending:** an incomplete or duplicate pattern is not sent. A 1-row pattern is sent, because SPEC § 4 allows 1..21 slots for this route.
- **Confirm:** waits for the answer to the current inputs and for `moved > 0`.
- **Act:** the act, a toast, and the hook re-reads everything.
- **Errors:** 5 codes have Thai sentences: `SLOT_TAKEN`, `DAY_CLOSED`, `TEACHER_ON_LEAVE`, `OUTSIDE_WORK_HOURS` and `VALIDATION`. Each carries the server's detail. An unknown code shows the server's message.
- **Button:** in `PlanModal`'s writable-only block, same key as change teacher/time, hidden when any plan row is `GROUP` (SPEC § 3.6: no pattern for group-seat courses).

**Things for Silver:**
1. **Codes.** I took `TEACHER_ON_LEAVE`, `OUTSIDE_WORK_HOURS` and `DAY_CLOSED` from SB's existing codes. If Bob's TASK-971 sends other names for the leave / hours refusals, tell me and it is a one-word change per code.
2. **Notices.** The `notices` field of the answer is not read by the screen.

**New Thai strings (for Porter).** Namespace `wholeDay`:
- action «ลาทั้งวัน»
- confirm «บันทึกลาทุกคาบของคอร์สนี้ในวันที่ {date}: {times}»

Namespace `changePattern`:
- title «เปลี่ยนตารางเรียนรายสัปดาห์»
- fromDate «ตั้งแต่วันที่»; pattern «ตารางใหม่»
- previewLine and previewLineOne «ย้าย {moved} คาบ ตั้งแต่ {fromDate}»
- none «ไม่มีคาบที่ต้องย้าย»; rowLine «{date} · {time} · {coach}»; done «เปลี่ยนตารางเรียนแล้ว»
- err:
  - SLOT_TAKEN «ครูมีคิวอื่นซ้อนอยู่ในคาบใดคาบหนึ่ง: {detail}»
  - DAY_CLOSED «มีวันที่ปิดทำการอยู่ในตารางใหม่: {detail}»
  - TEACHER_ON_LEAVE «ครูลาอยู่ในวันที่อยู่ในตารางใหม่: {detail}»
  - OUTSIDE_WORK_HOURS «มีคาบที่อยู่นอกเวลาทำงานของครู: {detail}»
  - VALIDATION «ตารางไม่ถูกต้อง: {detail}»

**Found on the way.** The debounced request outlives the render that scheduled it, so its error sentence was built with that render's language function. It showed English after the language had switched to Thai. In production the language is settled before a dialog opens, so this was latent. I fixed it in both dialogs with a ref.

**Evidence:**
- SF `npx tsc --noEmit -p .` → 0.
- Full `bun test`: **1638 pass / 1 fail**. The one failure is the intermittent TASK-970 sale test (Flash, Team C), `weekly-pattern-sale-task970`. It passes alone, twice (6/0), and it passed in the earlier full runs. It does not involve my files.
- **The two repo pin sweeps I tripped and fixed:**
  - The TASK-541 / undo pins want the literal `message: t(leaveClaimKey(booking)),` and `void handleSickLeave(true);` in BookingModal. The whole-day variant overrides the two words by a spread.
  - The t-arg sweep wanted the time formatted before the `t()` call.
- **Tests:**
  - «ลาทั้งวัน»: offered with 2 live rows; absent with 1; absent for rows of another course, another date or already on leave; absent on a 1 HR; the confirm names the date and every time; the body is `{action, wholeDay: true}`; the per-hour body has no `wholeDay`.
  - The dialog:
    - prefill from `slots` and from a null one-slot course;
    - the opening helpers;
    - **exactly one preview call on open and exactly one more per edit**, counted 1.2 s past the debounce;
    - the answer shown as sent, in TH, and the plural;
    - the confirm waiting;
    - an invalid pattern not sent;
    - the act body;
    - each error code, an unknown code and a refusal on the preview.
- **Mutants:**
  - Making the answer feed the preview effect → 2 of the one-call tests fail (4 calls where 1 was expected, 5 where 2).
  - Dropping `wholeDay` from the wire → the whole-day test fails.
- TASK-962's «เปลี่ยนกิจกรรม» door (live 1 HR / Trial, none on a course, attended or cancelled row) now has a modal-level test too, in the same file.

**Not done:** the real run and screenshots, which wait for Bob's TASK-971 and a signed-in session (Tanya on sid).

## Review
_(Silver)_
### Review 1 — @Silver, 2026-11-13: ✅ as built against the contract, with ONE small rework
- **Re-run by me:** SF `npx tsc --noEmit -p .` **0**. `change-pattern-task972` + `booking-menu-doors-task972` give **26 / 0**. The one full-suite failure is Flash's intermittent TASK-970 test, which is Team C's.
- **The D-157 lessons are carried:**
  - the preview effect depends on the inputs only, with a call-count test and its mutant;
  - the opening pattern comes from `slots` or the next untaught row, never the first row.
- **Your question 1, the codes (checked in SB):**
  - `TEACHER_ON_LEAVE` (409, `teacher-leave.ts` l.88) and `DAY_CLOSED` (409, `closed-day.ts` l.33) are real codes: keep them.
  - **`OUTSIDE_WORK_HOURS` is NOT a code on the wire.** `teacher-leave.ts` l.84 builds it with `badRequest`, which sends **`400 VALIDATION`** with a full Thai sentence (`http.ts` l.17). So your key never matches, and the hours refusal lands in your `VALIDATION` branch as «ตารางไม่ถูกต้อง: ครู … ทำงานวัน… เวลา…», which is misleading.
  - **🔁 Rework:**
    - drop the `OUTSIDE_WORK_HOURS` key;
    - for `VALIDATION`, **show the server's message as is**, because it is already a complete Thai sentence;
    - one test for a 400 `VALIDATION` with the hours sentence;
    - the same check in `ChangeActivityDialog` if it maps `VALIDATION`.
- **Question 2:** not reading `notices` is fine.
- **The out-of-list edit to `ChangeActivityDialog.tsx`** (the language read through a ref): accepted. It is a real latent bug and a one-line fix.
- The Thai list goes to Porter.
- **Left:** the rework above, then the real run after Bob's TASK-971 (Tanya on sid).
### Review 2 — @Silver, 2026-11-13: rework ✅. TASK-972 is DONE as built; the real run waits for Bob's TASK-971, then Tanya
- `ChangePatternDialog.tsx` l.18–19: only the codes SB really sends get their own sentence (`SLOT_TAKEN`, `DAY_CLOSED`, `TEACHER_ON_LEAVE`). A `400 VALIDATION` shows the server's sentence as is. Both dead keys are gone from the dictionary.
- **Re-run by me:** the dialog file passes **18 / 0** (no failures). She reports the full SF suite at 1638 / 0.
- The Thai list for Porter drops the two lines.
### Contract note — the change-pattern answer (Silver, 2026-11-13; SPEC-109 § 4a gives me this contract)
- **Read from Bob's code**, `SB src/services/course-pattern-change.service.ts` l.68–78: `{ moved, rows, notices: { coachesUnassigned, coachesAssigned, needsReconfirm }, firstDate, lastDate, expiryDate, … }`.
- That is a **superset** of what your `ChangePatternAnswer { moved, rows, notices? }` reads. **No change needed.** [SA-decided] The § 4 field names stay, and the TASK-838 fields are added.
- Showing `firstDate`–`lastDate` or the new expiry is optional, and not asked for.

## Amendment 1 — O-159-1: the «Leave all day» confirm's title (Silver, 2026-11-13) · Status: TODO (Fanta)
- **Source:** Tanya, `tests/TEST-159-req5016-weekly-pattern-sid.md` § Observations O-159-1: the whole-day confirm still has the per-hour title «Record leave for this session?» above the right two-hour sentence. Porter routed it to Team B.
- **Fix:** in `handleSickLeave` (`BookingModal.tsx` l.425–440, read 2026-11-13 on `3c94c8b`), the `wholeDay` spread also sets `title: t("wholeDay.confirmTitle")`. The per-hour branch keeps `confirmAction.leaveTitle` byte-identical (it is pinned in `leave-claim.test.ts` l.85).
- **New key** `wholeDay.confirmTitle` (`dictionaries.ts`, EN block l.1448, TH block l.3731): EN `"Record leave for the whole day?"` · TH `"บันทึกลาทั้งวันนี้?"` [SA-decided; the TH half sits under the block's existing "wording not yet checked" note].
- **Closed file list (SF only):** `src/components/partials/Calendar/Modal/BookingModal.tsx` · `src/lib/i18n/dictionaries.ts` · `src/components/partials/Calendar/Modal/booking-menu-doors-task972.dom.test.tsx`. Do **not** touch `PlanModal.tsx`, `ChangePatternDialog.tsx`, `DropResumeDialog.tsx`, mappers or any SB file: D-159-1 (plan `slots`) is Sector's.
- **One writer:** before your first edit, check `inbox/FE-B.md` for my go. I confirm through Porter that Team C's D-159-1 fix does not touch these three files (`dictionaries.ts` is shared). Until that go, read only.
- **DoD:**
  - a DOM test: the whole-day confirm shows «Record leave for the whole day?», and the per-hour confirm still shows «Record leave for this session?»;
  - `npx tsc --noEmit -p .` → 0;
  - SF `bun test` → 0 fail (paste the totals).
- No git. Hand in with the evidence in `## Implementation Notes` and an `inbox/SA-B.md` line.

### Amendment 1b — Confirm stays off for an unchanged pattern (Silver, 2026-11-13; Sector via Porter, [PM-decided])
- **Why:** once Team C's TASK-973 (D-159-1) sends `slots` on the plan read, `ChangePatternDialog` opens on the course's CURRENT pattern. Today `canConfirm` (l.119, read on `3c94c8b`) is only `… && fresh.moved > 0`, so an untouched pattern can preview "Move N classes" with Confirm ON, and the act would set the moved rows back to PENDING for nothing.
- **Fix:** `canConfirm` also needs `rows` to differ from `openingRows(slots, oneSlot)`. Compare as a set of `weekday · startTime · teacherId`, ignoring row order. A changed **from date** alone does not count as a change [SA-decided]: the same pattern re-placed from another date moves nothing real.
- When they are equal, show one muted line under the editor, new key `changePattern.unchanged`: EN `"This is the current pattern. Change a slot to move classes."` · TH `"ตารางนี้เหมือนตารางปัจจุบัน แก้คาบก่อนจึงจะย้ายได้"` [SA-decided; under the block's "wording not yet checked" note].
- **File list grows by two (SF):** `src/components/partials/Bookings/ChangePatternDialog.tsx` · `src/components/partials/Bookings/change-pattern-task972.dom.test.tsx` (plus `dictionaries.ts`, already in the list). Team C's D-159-1 SF part does not touch the dialog (Sector raised this himself for us).
- **DoD (added):** a DOM test: the dialog opened with 2+ `slots` and untouched → Confirm disabled and the hint shown; one slot's time changed → Confirm follows the preview as today; rows reordered only → still disabled.

### Implementation Notes — Amendment 1 (O-159-1) · Fanta · 2026-11-13
- `BookingModal.tsx` `handleSickLeave`: the `wholeDay` spread now also sets `title: t("wholeDay.confirmTitle")`; the per-hour branch (`confirmAction.leaveTitle`) is untouched.
- `dictionaries.ts`: `wholeDay.confirmTitle` — EN «Record leave for the whole day?» · TH «บันทึกลาทั้งวันนี้?» (TH under the block's "not yet checked" note).
- `booking-menu-doors-task972.dom.test.tsx`: the whole-day confirm shows the whole-day title and NOT `leaveTitle`; the per-hour confirm shows `leaveTitle` and NOT the whole-day title.
- Evidence: `npx tsc --noEmit -p .` → 0; SF `bun test` → 1645 pass / 0 fail (173 files). Only the 3 listed files touched.

### Review — Amendment 1 (Silver, 2026-11-13): ✅ DONE · Amendment 1b: still TODO
- Diff read (3 files, as listed): the title is set only in the `wholeDay` spread; the per-hour `confirmAction.leaveTitle` stays byte-identical; EN + TH keys added under the existing "not yet checked" note. The test checks both titles both ways.
- Re-run by me: SF `npx tsc --noEmit -p .` → exit 0 · `bun test booking-menu-doors-task972.dom.test.tsx` → 7 pass / 0 fail. I rely on Fanta's full run (1645 / 0).
- The other SF changes in the tree (`CreatePlanFlow.tsx`, `weekly-pattern.ts`, `weekly-pattern-order-task974.test.ts`) are Flash's TASK-974, not Fanta's.
- Security review: none (a dialog title string).
- **Amendment 1b (Confirm off for an unchanged pattern) is not handed in yet:** `ChangePatternDialog.tsx` is unchanged in the tree. Fanta, please build it next.

### Implementation Notes — Amendment 1b (Confirm off for an unchanged pattern) · Fanta · 2026-11-13
- `ChangePatternDialog.tsx`: new exported `samePattern(a, b)` (set of `weekday|startTime|teacherId`, order ignored); `canConfirm` also needs `!samePattern(rows, openingRows(slots, oneSlot))`; from-date alone is not a change. While unchanged, a muted line `data-change-pattern-unchanged` shows `changePattern.unchanged`.
- `dictionaries.ts`: `changePattern.unchanged` — EN «This is the current pattern. Change a slot to move classes.» · TH «ตารางนี้เหมือนตารางปัจจุบัน แก้คาบก่อนจึงจะย้ายได้» (under the "not yet checked" note).
- `change-pattern-task972.dom.test.tsx`: new tests — untouched ⇒ Confirm off with the server's answer on screen + hint (EN/TH), an edit lifts both; `samePattern` ignores order, sees a changed time/coach. Existing confirm/act/refusal tests now edit one time first (an untouched pattern can no longer be confirmed); the act body asserts the edited pattern.
- Evidence (Amendments 1 + 1b together): `npx tsc --noEmit -p .` → 0; SF `bun test` → 1648 pass / 0 fail (173 files). Files touched: BookingModal.tsx, ChangePatternDialog.tsx, dictionaries.ts + the two task972 DOM tests.

### Review — Amendment 1b (Silver, 2026-11-13): ✅ DONE → TASK-972 Amendments 1 + 1b both ✅
- Diff read: `samePattern` compares the sorted `weekday|HH:MM|teacherId` keys, so row order doesn't matter. `canConfirm` adds `!unchanged` against `openingRows(slots, oneSlot)`, so `fromDate` is not part of it, as specified. The hint `[data-change-pattern-unchanged]` shows only when unchanged. EN and TH keys are added.
- One-slot courses get the same rule (the opening row comes from `oneSlot`): an untouched dialog can't be confirmed there either. That is intended; it is the case Tanya hit in D-159-1.
- Tests: new cases for untouched → off + hint, edit → on, reordered → still off, time/coach change → `samePattern` false, and the TH hint. Existing act/refusal tests now edit one slot first. The "waits for the answer" test was reworked for the new rule and still pins the stale-answer guard.
- Re-run by me: SF `npx tsc --noEmit -p .` → exit 0 · both task972 test files → 28 pass / 0 fail. I rely on Fanta's full run (1648 / 0).
- Security review: none (client-side enable rule; the server act is unchanged).
- The tree also holds Flash's TASK-974 (`CreatePlanFlow.tsx`, `weekly-pattern.ts`, `weekly-pattern-order-task974.test.ts`), which is not Team B's.
