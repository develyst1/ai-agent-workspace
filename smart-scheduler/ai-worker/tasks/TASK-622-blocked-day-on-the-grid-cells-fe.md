# TASK-622 — a teacher's blocked (leave) day shows ON the grid cells — FE, S
- Source: REQ-111 item D · visuals settled by @Porter, owner released 2026-10-02 · sizing §D
- Status: DONE
- Repo: `smart-scheduler-front` · Assignee: @Fanta · From: @Silver (2026-10-02)
- Depends on: none

## §0 Why
**We already shipped an orange strip above the grid (`partials/Calendar/LeaveDayBanner.tsx`), and the customer still reads the day as free.**
📌 **Treat that as the finding, not as her missing it.**
- Today the cells on that teacher's day still show `+`, and the backend refuses with `TEACHER_ON_LEAVE`.
- That refusal is the first moment she learns about the leave.

## What exists (do not rebuild it)
- **Data is already loaded:** `useLeaveDays(from, to, !scoped)` in `CalendarContent.tsx:67-68`. It calls `GET /teacher-leave-days`, which returns `{ items: LeaveDayRow[] }` with `teacherId`, `date` and `bookings[]` (`types/api/contract.ts:932-957`).
  - The parent of both grids already holds it. **No new request and no BE work.**
- **A block is a whole day for one teacher.** There is no time range and no "centre closed".
- **There is a precedent to copy:**
  - The week grid already greys a teacher's non-working day with `bg-muted-50/80` and hides its `+` (`CalendarWeekGrid.tsx:120-126`, `:204`).
  - Day view drops non-working columns instead (`CalendarContent.tsx:133`). 🔴 **Leave must NOT drop the column** (see 3 below).
- The strip's marker logic is `leaveMarkersFor` (`lib/scheduler/teacher-scope.ts:102-108`).

## What to do — the settled visuals
1. **An empty cell on a teacher's leave day is grey, with no `+`.** Use the same look as the week grid's non-working day.
2. **A class that already exists on that day is still drawn as today and is still clickable**, plus a small visual "on leave" mark, such as an icon or a grey corner. A future leave cancels nothing, so these classes are live and the admin must be able to act on them.
3. **Day view keeps that teacher's column, greyed.** It is not dropped the way a non-working day is.
4. Do this in **both** grids: `CalendarGrid.tsx` (day view, cells drawn by the local `Row` at `:140-300`) and `CalendarWeekGrid.tsx` (week view).
5. Suggested shape (you decide and declare):
   - One helper beside `leaveMarkersFor` in `teacher-scope.ts` that turns `LeaveDayRow[]` into a `Set` of `teacherId|date` keys.
   - One new prop on both grids, passed at their two call sites in `CalendarContent.tsx`.
6. 🔴 **No new wording.** Team A holds the copy write this batch.
   - The mark is **visual**: grey plus an icon.
   - If text is needed, for example a tooltip or `aria-label`, **reuse the strip's approved strings** `leaveDays.markerAway` / `leaveDays.markerClasses` (`lib/i18n/dictionaries.ts:511`, TH `:2532`).
   - **If you find you need a sentence that does not exist, STOP and ask me.** Do not write one.
7. Keep the strip as it is. This task adds to it and does not replace it.

## Files — Team B's claim this batch
`CalendarGrid.tsx` · `CalendarWeekGrid.tsx` · `CalendarContent.tsx` · `lib/scheduler/teacher-scope.ts` · `lib/camp/grid.test.ts`
- `CalendarContent.tsx` and `teacher-scope.ts` were added to our claim by @Porter for this item.
- 🚫 **Nothing under `partials/Calendar/Modal/*` or `OtherSeries/*`.** Those are Team A's.
- 🚫 **Nothing of Palm's.** That includes the time filter `times` prop in `CalendarGrid`: keep it exactly as it is.

## Definition of Done
- [ ] A unit test for the helper: rows in, keys out, including an empty list.
- [ ] **A clicked DOM test** for the day grid and for the week grid:
  - a leave cell has no `+` and carries the grey class;
  - an existing class on that day still opens when clicked;
  - a cell for the same teacher on another day is untouched;
  - **break it and watch**: revert the fix and confirm the test goes red.
- [ ] `lib/camp/grid.test.ts` and `lib/ui/props-wired.test.ts` updated where they pin source lines you changed. Say which lines and why.
  - 🔴 **`closedWeeks` must still be wired.** It was just restored in TASK-605; check it survives.
- [ ] `bun test` for the front, plus a typecheck and a build, all green, with the commands and counts pasted.
- [ ] **A real click on local:**
  1. Record a leave day for a teacher.
  2. In week view and in day view, check that empty cells are grey with no `+`, and that an existing class is marked and still opens.
  3. Screenshot both views into your notes.
- [ ] Nothing is committed.

## Implementation Notes
**Fanta, 2026-10-02.** Repo `smart-scheduler-front`. Nothing committed. All edits are inside Team B's claim, plus two **new** test files.

**Files:**
- `lib/scheduler/teacher-scope.ts`: `leaveDayKey(teacherId, date)` and `leaveDayIndex(rows) → ReadonlyMap<key, LeaveMarker>`, beside `leaveMarkersFor`.
- `CalendarContent.tsx`: `const leaveIndex = useMemo(() => leaveDayIndex(leaveDays), [leaveDays])`, from the same `useLeaveDays` read. **No new request.** It is passed as `leaveDays={leaveIndex}` to both grids, plus `date={date}` to the day grid.
- `CalendarWeekGrid.tsx`: `leaveDays?` prop. For each cell, `leave = leaveDays?.get(key)` and `canBook = bookableOnDate(tc, day) && !leave`. So the existing grey (`bg-muted-50/80`) and the existing `+` gate apply unchanged. A class on that day gets `<LeaveMark>` after its name. `LeaveMark` is a grey `UserX` icon, `role="img"`, with `aria-label`/`title` = **the strip's own sentence** (`leaveMarkerKey`, i.e. `leaveDays.markerAway` / `markerClasses`). **No new wording.**
- `CalendarGrid.tsx`: `date` (required) and `leaveDays?`. `Row` gets `leaveOf(teacherId)`. A cell of a coach on leave is grey with `data-leave-day="yes"`. When empty it is a plain grey block with **no `+`**. A class there is drawn as before, carries `<LeaveMark>` and still opens. **The column is kept**; `filteredTeachers` and `bookableOnDate` are untouched.
- `lib/camp/grid.test.ts`: **added** one pin (no existing line changed). It covers `leaveDays` wired end to end, indexed once, handed to both grids, destructured by each, and down to `Row`. It is the same shape as the TASK-605 pin, because an optional prop dropped at a call site is silent.
  - 🔴 **`closedWeeks` survives.** The TASK-605 pin and the camp pins pass unchanged. `lib/ui/props-wired.test.ts` passes unchanged: every new prop is destructured.
- **New:** `lib/scheduler/leave-day-index.test.ts` (3 tests: rows in, keys out, the name and count carried, empty and undefined ⇒ empty) and `components/partials/Calendar/leave-day-cells.dom.test.tsx` (5 tests, clicked).

**Verification:**
- New tests: `bun test src/lib/scheduler/leave-day-index.test.ts src/components/partials/Calendar/leave-day-cells.dom.test.tsx` gave `8 pass / 0 fail`.
  - Week view: the leave cell is grey with no `+`; the same coach's next day and the other coach's same day are untouched; the class is marked and opens on click.
  - Day view: every cell of the coach's column is grey and `+`-less while the other coach is untouched; the class is marked and opens on click; a non-leave date draws as before.
- Break it and watch (both grids and `BookingsTable.tsx` swapped back to HEAD, run with the bulk-confirm file): **5 fail / 5 pass**. All 4 TASK-622 cell tests went `(fail)`, plus the TASK-621 test. The "not a blocked day" test and the 4 old bulk-confirm tests stayed green, as they should. After restoring: `10 pass / 0 fail`.
- Full run, shared with TASK-621: `bunx tsc --noEmit` exit 0 with no output. `bun test` gave **934 pass / 0 fail across 99 files** (baseline 924 / 0 across 97). `bun run build` passed.
- 🔴 **Real click on local and the screenshots: NOT VERIFIED.** It needs a leave day to be recorded, and this machine's only targets are real environments (see Q1). I did not create a leave day anywhere.

**Footprint:** no data created. The HEAD swap was restored from a scratchpad copy. `.next/` was rebuilt.

**Decided and declared (internal; overturn freely):**
1. **A Map, not a Set.** The mark's label is the strip's sentence, which needs the name and the count, so the index carries the `LeaveMarker`.
2. **`date` is a new *required* prop on the day grid.** The cells had no date. Required means a dropped one is a type error, not a silent free day.
3. **`LeaveMark` lives in `CalendarWeekGrid.tsx`** (named export) and the day grid imports it. A new component file was not in the claim.
4. **Week grid: leave is folded into `canBook`** instead of a third condition on the `+`. This was forced by a pin I found: `lib/rbac/action-gate.test.ts:99` pins the exact string `{canBook && mayBook && (`, and that file is outside our claim. Folding kept the pinned line and the grey-class line byte-identical.

## Questions
(Fanta asks; Silver answers as `> answer: ...`. Internal choices: decide and declare here.)
- **Q1: the "real click on local" and its screenshots.** There is no local stack here. Front `.env.local` → `som.develyst.online`. Back `.env` → remote DB, holding uat values per today's log. Recording a leave day there is a write to a real environment, so I stopped. Which environment, and may I create a named leave day (e.g. for a test coach) and remove it after? Or do the clicked DOM tests stand as the evidence?
  > answer (Silver): Same as TASK-621 Q1. **Your clicked DOM tests stand as the evidence; create nothing on `sid` or uat.** The real click, including recording a leave day, is part of the post-deploy `sid` check via @Porter.
- **Q2 (user-visible, so asking, not deciding): a CAMP block on a coach's blocked day is NOT marked or greyed.** The camp cell returns before the normal cell in both grids, and the TASK's visuals name only "a class". Should a camp block get the same mark? As built: no.
  > answer (Silver): **Keep it as built (not marked) for this round.** The settled visuals name a class. Whether a camp block should carry the mark is the customer's to say. I am raising it to @Porter as a follow-up; it does not block this TASK.
- **Q3 (user-visible): day view greys the coach's CELLS, not the column HEADER** (the name, type chip and budget strip stay as they are). Is that the intended "column greyed"? As built: cells only.
  > answer (Silver): **Cells only is correct.** The settled wording was that the day view **keeps** the column greyed (rather than dropping it). Greying the cells is what tells the admin not to book there. The header stays as it is; if the owner wants it greyed too once he sees it on `sid`, that is a one-line follow-up.

## Review
**Silver, 2026-10-03 — ✅ DONE.**
- **Diff read in full** (both grids, `CalendarContent.tsx`, `teacher-scope.ts`, the pin):
  - It reuses the one `useLeaveDays` read: no new request.
  - Keys are `YYYY-MM-DD` on both sides (`CalendarContent.tsx:48`, `:61`).
  - The day grid keeps the column; an empty leave cell is grey with no `+`; a class is drawn as before plus `LeaveMark` and still opens.
  - The week grid folds leave into `canBook`, so the existing grey and the existing `+` gate apply. The pinned lines are kept byte-identical; that was a good find.
  - The mark's label is the strip's approved sentence (`leaveMarkerKey`). **No new wording**, as required.
  - `closedWeeks` survives.
- **The 4 declared decisions are all accepted:** a Map rather than a Set, `date` required, `LeaveMark` exported from the week grid, and the `canBook` fold.
- **Re-run by me:** front `bun test` → **934 pass / 0 fail** · `bunx tsc --noEmit` → exit 0.
- **For the sid check (Porter → Tanya):** record a leave day for a test coach. In week view and in day view:
  - empty cells are grey with no `+`;
  - an existing class carries the mark and opens;
  - the coach's other days are untouched.
- **Q2 (a camp block on a leave day) is raised to @Porter as a follow-up, not a blocker.** As built, the camp block is not marked, which matches the settled visuals (they name "a class").
