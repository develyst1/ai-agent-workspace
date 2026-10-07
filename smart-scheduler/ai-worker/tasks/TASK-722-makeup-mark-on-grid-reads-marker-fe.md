# TASK-722 — REQ-115: the make-up mark on the calendar GRID and the bookings list reads the MARKER (`isMakeup`), not the status — Team B's half — FE, S
- Source: REQ-115 (in-force part, below "THE WHOLE DESIGN IS REPLACED": **N1** born CONFIRMED · **N2** "a badge (purple) showing it is an added class", **a REQUIREMENT** per the customer, 03:39) · @Porter 2026-10-07 · BE = TASK-702 (Jason) · Team A's FE half = TASK-703 (Fern)
- Status: DONE (reviewed by Silver, 2026-10-07) · 🔴 SHIP-SET 702+703+722 together, NOT round 1 · front commits wait until round 1 is on uat
- Repo: `smart-scheduler-front` · Assignee: @Fanta · From: @Silver (2026-10-07)
- 🔴 **SHIP-SET (Porter, held): 702 + 703 + 722 go to sid TOGETHER and to uat together. None alone.** A confirmed make-up that lost its mark on the grid is worse than today: an admin could no longer see which classes are owed. **NOT in round 1.**
- **Claim (routed to Team B by Porter; named in TASK-703 §0):**
  - `partials/Calendar/calendar-status.ts`, `CalendarGrid.tsx`, `CalendarWeekGrid.tsx`, `CalendarLegendBar.tsx`;
  - `partials/Bookings/BookingsTable.tsx`;
  - their tests.
  - 🚫 **NOT ours:** `common/BookingBadges.tsx`, `Calendar/Calendar.config.ts`, `types/api/contract.ts`, `lib/api/mappers.ts` (Team A, TASK-703). If you need them changed, STOP and tell me.
  - Reds outside the claim ⇒ the standing practice (full suite, the whole list to me once, no edit before the grant).

## §0 Why
- Today a make-up is born `EXTENDED`, and the grid colours each cell by STATUS (`accent = BOOKING_STATUS_COLOR[b.status]`: `CalendarGrid.tsx:194`, `CalendarWeekGrid.tsx:138`). EXTENDED is the purple, so **status and "make-up" are one fact.**
- **TASK-702 splits them:** a make-up is now born **CONFIRMED** and carries **`isMakeup: boolean`** (on `BookingDTO` and `PlanSessionRow`, always a boolean; `TASK-702:78`; front type `contract.ts`, from TASK-703).
- ⇒ Without this TASK, a confirmed make-up's cell simply turns the CONFIRMED colour and **the make-up vanishes from the grid.**

## What to build (decided from the customer's own words, no owner question)
1. **The cell keeps its REAL status colour** (a confirmed make-up is confirmed, which is the whole point of N1).
   - **AND it carries the purple make-up mark:** TASK-703's shared badge (`ขยายคาบ` / `Extended`, the `CalendarPlus` icon), fed `isMakeup`. Do this in the day grid, the week grid, and the bookings list (`StatusChip`).
   - The customer's words: *"ทำให้มันเป็นคลาสปกติ … อาจจะใช้ป้ายสีม่วง"*. That means a purple **badge**, not a purple fill.
   - 🚫 **No new words, no new colour, no second way of drawing it:** use 703's component, the ONE way. In a small cell, the icon form with the approved label as its accessible name/tooltip is fine. Decide and declare.
2. 🔴 **The mark reads `isMakeup` and NEVER the status (Porter, in writing).** This whole REQ is a source swap. The one case the old code gets wrong, and the only case that matters, is **a CONFIRMED booking with `isMakeup: true` ⇒ the mark shows.** It is proved by value (see DoD).
3. **A legacy `EXTENDED` row** (old rows still exist; forward-only) keeps its purple status fill **and must not show «ขยายคาบ» twice** (703's rule, applied to our cells too).
4. **`CalendarLegendBar.tsx`:** it reads `STATUS_LEGEND` from `Calendar.config.ts` (Fern's, §4). Reflect whatever she decides there. If the bar needs a make-up sample, reuse the same label and the same component. Say what you did.
5. **Do NOT change "is it UNCONFIRMED?" readers.** `lib/scheduler/bulk-confirm.ts` `BULK_CONFIRMABLE` (PENDING / EXTENDED) and its use in `BookingsTable.tsx` ask about the STATUS on purpose, and stay. For every status read in the claimed files, ask TASK-702 §3's one question: "is this a MAKE-UP?" ⇒ the marker; "is this UNCONFIRMED?" ⇒ the status. List your answers.

## Definition of Done
- [ ] **Clicked, BY-VALUE DOM tests**, day grid + week grid + bookings list:
  - 🔴 **`status: "CONFIRMED", isMakeup: true` ⇒ the mark IS shown** (and the CONFIRMED colour). This is the case that matters;
  - an ordinary CONFIRMED (`isMakeup: false`) ⇒ NO mark;
  - a legacy `EXTENDED` + `isMakeup: true` ⇒ the purple fill and the mark **exactly once**;
  - bulk-confirm still ticks PENDING / EXTENDED only (pinned).
- [ ] Mutation set (front form, `--tests` declared):
  - 🔴 the mark reads `status === "EXTENDED"` instead of `isMakeup` (**must bite** on the CONFIRMED + `isMakeup` test);
  - the mark dropped from the week grid (bites);
  - the mark shown on an ordinary class (bites);
  - shown twice on a legacy row (bites).
- [ ] `tsc` · full `bun test` with counts · `unhandled-between-tests: 0` · build. 🚫 No click on sid or uat. Nothing committed.

## QA hand-off
- **Screen (after 702 + 703 + 722 are together on sid):**
  - record a leave that creates a make-up ⇒ on the Schedule (day AND week) the make-up shows its real status colour with the purple ขยายคาบ mark, and the bookings list shows "ยืนยันแล้ว" + ขยายคาบ;
  - an ordinary class shows no mark;
  - an old EXTENDED make-up shows the mark once.

## 703's tools, read from its file and code (Silver, 2026-10-07)
- **Shape chosen (`TASK-703:30`):** `StatusChip` takes `isMakeup` (`BookingBadges.tsx:74`), **plus** an exported `MakeupChip` (`:51`).
- `isMakeup` is read `=== true`. `StatusChip` already avoids the legacy double (`:89`: `isMakeup !== true || status === "EXTENDED"` ⇒ the chip alone).
- **Where you adopt it:**
  - `Bookings/BookingsTable.tsx` ~`:400` `<StatusChip status={b.status} />` ⇒ add `isMakeup={b.isMakeup}`. One prop.
  - **The grid cells** (`calendar-status.ts`, `CalendarGrid.tsx`, `CalendarWeekGrid.tsx`) draw status WITHOUT the chip ⇒ the field plus `MakeupChip`.
    - If the chip does not fit a cell, a purple mark of your own is allowed (Porter; it matches Khwan's "ป้ายสีม่วง"). It must use the SAME `CalendarPlus` icon, the purple/`secondary` tone and the approved label as its accessible name. No new words.
    - Decide and declare which.
  - `CalendarLegendBar.tsx`: per item 4.

## Implementation Notes
**Fanta, 2026-10-07.** Repo `smart-scheduler-front`. Nothing committed. The tree also holds Fern's uncommitted 703 files, which I did not touch.

**Files (this TASK only, all inside the claim):**
- `M partials/Calendar/calendar-status.ts`: ONE reader, `showsMakeupMark(b) = b.isMakeup === true`. It is the single place "is this cell a make-up?" is asked, with a note saying never to ask the status.
- `M partials/Calendar/CalendarGrid.tsx` and `CalendarWeekGrid.tsx`: `{showsMakeupMark(b) && <MakeupChip size="sm" />}` on its own line inside the cell, beside the real status fill (unchanged).
- `M partials/Bookings/BookingsTable.tsx`: ONE prop, `<StatusChip status={b.status} isMakeup={b.isMakeup} />`.
- `M partials/Calendar/CalendarLegendBar.tsx`: **a comment only** (see 4 below).
- `?? makeup-mark-task722.dom.test.tsx` (10: the day grid and the week grid, the same five cases each + a click) · `?? makeup-mark-list-task722.dom.test.tsx` (4) · `?? makeup-mark-task722.mutations.json` (10).
- 🚫 NOT touched: `BookingBadges.tsx`, `Calendar.config.ts`, `contract.ts`, `mappers.ts` (Team A). I did not need a change in any of them.

**Decided and declared (internal; overturn freely):**
1. **The grid uses 703's `MakeupChip` itself, not a mark of my own.** It fits when it gets its OWN LINE in the cell (the name row already carries up to six marks and would truncate the name). So there is ONE way to draw it, the approved `bookingStatus.EXTENDED` label, no icon-only variant, no new word, no new colour. ⚠️ NOT VERIFIED by eye: the cell grows one line when marked; I cannot look at a screen (no stack, by order). It is worth a glance on sid after the ship-set lands.
2. **The cell keeps its REAL status fill**; the mark is ADDED (a confirmed make-up is confirmed: N1). A legacy `EXTENDED` row keeps its purple fill, and, being a make-up, carries the mark once. The cell has no status label of its own, so nothing says it twice. In the LIST the `StatusChip` already avoids the double (703's rule).
3. **Every status read in the claimed files, asked TASK-702 §3's one question:**
   | read | the question | answer |
   |---|---|---|
   | `CalendarGrid.tsx:79,90`, `CalendarWeekGrid.tsx:75` `OFF_CALENDAR_STATUSES.includes(b.status)` | is it ON the calendar at all? | neither: the STATUS, unchanged |
   | `CalendarGrid.tsx:194`, `CalendarWeekGrid.tsx:138` `BOOKING_STATUS_COLOR[…status]` | what is its real status colour? | the STATUS, unchanged (that is the point of N1) |
   | `BookingsTable.tsx` `BULK_CONFIRMABLE` / `bulkConfirmable` | is it UNCONFIRMED? | the STATUS, **unchanged** (pinned: a confirmed make-up is not tickable) |
   | `BookingsTable.tsx:400` `StatusChip` | is it a MAKE-UP? | **the MARKER**, one prop |
   | `calendar-status.ts` | (new) is it a MAKE-UP? | **the MARKER**, `showsMakeupMark` |
4. **`CalendarLegendBar.tsx`: no sample added, comment only.** `STATUS_LEGEND` is Fern's and she kept `EXTENDED` (now: a LEGACY unconfirmed make-up) with no new row. A second chip carrying the same word would read as a duplicate; the badge says what it is in words. If you want a sample, it is one line (reuse `MakeupChip`).

**Verification:**
- `bunx tsc --noEmit` exit 0 · `bun run build` exit 0 · **full `bun test` 1118 pass / 0 fail across 125 files** (was 1104, +14). No unhandled error between tests. (The log is long because an EXISTING test, `change-start-date.dom.test.tsx`, dumps a window object; mine print nothing.)
- Clicked tests read what the cell SHOWS (fill class + badge count + label count), by value:
  - 🔴 **CONFIRMED + `isMakeup: true` ⇒ the CONFIRMED fill AND the badge, once**: day, week and list (the list says «Confirmed» AND «Extended»);
  - an ordinary CONFIRMED (marker `false`, or absent) ⇒ no badge, no label;
  - a legacy `EXTENDED` + marker ⇒ the purple fill and the word exactly once (cell and list);
  - 🔑 an `EXTENDED` cell whose marker is `false` ⇒ NO badge (it reads the marker, never the status);
  - the marked class still OPENS on click;
  - bulk confirm: only PENDING and EXTENDED rows have a tick; the CONFIRMED make-up has none (3 boxes, not 4).
- Mutation set `makeup-mark-task722`: `bun run mutation:run -- --tests "src/components/partials/Calendar/makeup-mark-task722.dom.test.tsx src/components/partials/Bookings/makeup-mark-list-task722.dom.test.tsx src/lib/scheduler/bulk-confirm.test.ts" --mutations src/components/partials/Calendar/makeup-mark-task722.mutations.json`
  ```
  M1 the mark reads status EXTENDED, not the marker ... BITES 18/4   (the one that matters)
  M2 dropped from the week grid ........................ BITES 20/2
  M3 dropped from the day grid ......................... BITES 20/2
  M4 shown on an ordinary class ........................ BITES 18/4
  M5 shown TWICE on a legacy row (day) ................. BITES 21/1
  M6 shown TWICE on a legacy row (week) ................ BITES 21/1
  M7 the list does not pass the marker ................. BITES 21/1
  M8 week fill taken from the marker (hides the status)  BITES 21/1
  M9 day fill taken from the marker .................... BITES 21/1
  M10 bulk confirm asks the marker ..................... BITES 21/1
  CHECKSUM identical
  ```
  (Your four are M1, M2/M3, M4, M5/M6. M7–M10 are mine: the list, the two fills, and bulk confirm.)
- 🚫 No click on sid or uat. **Footprint:** none (the runner restored every file).

**QA hand-off:** as in your §"QA hand-off". Plus one thing to LOOK at: a marked cell is one line taller (the chip is on its own line); that is the only part I could not see.

## Questions
None. Nothing outside the claim turned red (full suite 1118/0), so the standing practice had nothing to list.

## Review

**Silver, 2026-10-07 — ✅ DONE.**
- **Scope:** exactly the 5 claimed files + 3 new test files. Team A's 703 files are untouched. The legend bar is a 3-line JSX comment only (checked).
- **The source swap is proven by value**, as Porter required:
  - CONFIRMED + `isMakeup` ⇒ the mark, in the day grid, the week grid and the list;
  - ⭐ an `EXTENDED` cell with the marker `false` ⇒ NO mark: that is the test that proves it reads the marker, not the status;
  - M1 (reads the status) bites 18/4.
- **All 4 decisions accepted.** Using 703's own `MakeupChip` on its own line, rather than a mark of your own, keeps ONE way to draw it. The status-reader table answers TASK-702 §3 for every read. M7–M10 go beyond the DoD, well judged.
- **Re-run by me:** the full front suite **1118 / 0**. Set `makeup-mark-task722` **10/10 BITES**, `CHECKSUM identical`.
- 👁️ **For QA, the one thing no test can see:** a marked cell is ONE LINE TALLER (the chip has its own line). On sid, look at a short slot in the WEEK grid with a make-up: the name and the chip must not clip or overlap the next slot.
- **Files to commit (with 702 + 703, after round 1 is on uat):**
  - `partials/Calendar/calendar-status.ts`, `CalendarGrid.tsx`, `CalendarWeekGrid.tsx`, `CalendarLegendBar.tsx`;
  - `partials/Bookings/BookingsTable.tsx`;
  - `Calendar/makeup-mark-task722.dom.test.tsx` + `.mutations.json`, `Bookings/makeup-mark-list-task722.dom.test.tsx`.
