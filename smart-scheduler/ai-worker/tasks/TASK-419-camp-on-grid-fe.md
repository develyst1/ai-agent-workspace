# TASK-419 — Camp ON the teacher grid, FE (`REQ-095 §11`, `SPEC-085`): the merged camp block per teacher-day with a `Swap teacher` door · the week editor's per-day table (teachers + window) · the `CAMP` tag/legend

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-20) · **Size M.** Builds against TASK-418's contract once CONFIRMED (I paste the final lines into §0). ⏳ Pure parts (the cell-merge, the window arithmetic) now; wire after Jason's report. `sid`.

## §0 The contract — CONFIRMED 2026-09-20 (TASK-418)
A camp hour arrives as an ordinary booking row: `bookingType: "OTHER"`, `other.kind: "CAMP"`, `otherTitle` = the week's name, `campWeekDayId`, `campWeekId`, the teacher, one hour, **`status CONFIRMED`** (born so — never in the to-confirm tray). `GET /camp/weeks` and `/weeks/:id/days` carry per day `{ teacherIds, startTime, endTime, editedAt }`; the week DTO carries `windowStart / windowEnd` (effective; 10:00–15:00 when unset) — editable on `PATCH /camp/weeks/:id`. **A week's dates are immutable** (open a new week). `PATCH /camp/weeks/:id/days/:date { teacherIds?, startTime?, endTime? }` (`camp.week-open`) ⇒ `409 SLOT_TAKEN` naming date · hour · teacher | `400` (a teacher's off day names them; a window outside 06:00–22:00 / not whole hours / start ≥ end) | `409 CAMP_WEEK_CLOSED` | `404` a date outside the week. **A week-level teacher or window change re-derives only days with `editedAt` null** — the editor may offer "apply to every day" as N per-day PATCHes. Any status/move/edit on a CAMP row ⇒ `409 CAMP_ROW_OWNED`. The `CAMP` kind is not offered on the OTHER form (server refuses it by hand).

## §1
- **The grid:** contiguous CAMP cells of one teacher on one day merge into ONE visual block (rendering only — the data stays per hour; a pure `mergeCampCells(rows)` value-tested: 10–15 ⇒ one block of 5, a gap ⇒ two) showing the week's name + `CAMP` tag (the `OtherKindTag` grows the 4th kind; the legend too). Clicking the block opens a small camp panel — NOT the booking modal — with the window, the teachers that day, a `Swap teacher` door (by `camp.week-open` — hidden not disabled) ⇒ picker ⇒ the per-day PATCH; the `409` names the clash; a link to the week's roster. 🚫 No booking-modal doors on a camp cell (the server refuses them anyway — pinned that the modal never opens for `other.kind === "CAMP"`).
- **The week editor** (`OpenWeekDialog` grows an edit face): the week's default window (two time boxes, whole hours) and a per-day table — date · teachers (multi-select) · window (defaults from the week; editable) ⇒ per-day PATCHes on save (only the changed days — pinned).
- The day banner stays (the kids' side). Copy both languages, counted. Snapshot unchanged (no key).

## Definition of Done
- [ ] Suite, **count** · tsc · build ok · `mergeCampCells` by value · the panel not the modal on a CAMP cell · the PATCH bodies (only changed days) · the door by key · 🔑 Break-and-watch, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.


---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-20. **Camp ON the teacher grid: the merged block per teacher-day (render-only) with a camp panel + `Swap teacher` · the week editor's window + per-day table (only changed days saved) · the `CAMP` tag and legend.**

```
bunx tsc --noEmit → exit 0
bun test          →  505 pass / 0 fail   (was 494; +11 — new lib/camp/grid.test.ts)
bun run build     → ok
git status        →  13 source modified · 3 tests re-pinned · 4 new (lib/camp/grid.ts · Calendar/CampBlockCell.tsx · Calendar/Modal/CampBlockPanel.tsx · lib/camp/grid.test.ts)
                     (the People/birthday files in the tree are TASK-417's, not yet committed by the owner)
```
Built to §0 + @Jason's final lines in TASK-418 (2583/0, 48 = 48). **Snapshot unchanged (56, no key — asserted).** 🚫 No deploy asked.

### `§1` — what was built
- **Pure (`lib/camp/grid.ts`), value-tested:** `isCampRow` = `OTHER` + `other.kind CAMP` + **`campWeekDayId` set** (Jason's
  rule for the doors; the kind alone is not the owner — mutation 4); **`mergeCampCells(rows)`** folds contiguous CAMP
  hours of the SAME day object whose hours touch into ONE block (`startTime` = first, `endTime` = last, `hours`, the
  `rows` kept — mutation 3): 10–15 ⇒ one block of 5; a gap ⇒ two (mutation 1); another `campWeekDayId` ⇒ two
  (mutation 2); a lesson between stays its own item; ECA rows never merge; seconds on the wire tolerated.
  `dayPatch` / `changedDayPatches` — only what differs, teacher ORDER ignored (mutation 6), times to `HH:MM`, one entry
  per CHANGED day in date order (mutation 5); `replaceTeacher` — order kept, never doubled (mutation 7); `CAMP_HOURS`
  06:00–22:00 whole (the pickers' choices — the server the judge); `CAMP_WINDOW_DEFAULT` 10:00/15:00 as placeholders.
- **The grids:** the DAY grid builds a per-teacher map (block at its first hour, the covered hours marked) and renders
  the block ONCE with `gridRow: span n`, the covered hours rendering nothing so the CSS grid's auto-placement keeps the
  other columns in step (mutations 8, 9); the WEEK grid folds the cell's list through `mergeCampCells` and renders a
  block item beside ordinary rows (mutation 10). ONE shared **`CampBlockCell`** (teal, the tent, the week's name,
  the `CAMP` tag, `10:00–15:00 · 5 h` — rendered) for both.
- **🔴 The panel, never the modal:** `CalendarContent.openView` checks `isCampRow` FIRST and opens `CampBlockPanel`
  (pinned by order — before `setSelected`; mutation 11), so a CAMP row from any list (grid, tray) never reaches
  `BookingModal` (`409 CAMP_ROW_OWNED` is never provoked). The panel: date · window (the day object's), the day's
  teachers from the roster (`GET /camp/weeks/:id/days`), **`Swap teacher`** by `camp.week-open` (hidden, not
  disabled — mutation 12) ⇒ a picker ⇒ ONE `PATCH /camp/weeks/:id/days/:date { teacherIds }` with THIS column's
  teacher replaced (`replaceTeacher`; mutation 13); the `409 SLOT_TAKEN` sentence (date · hour · teacher) in the
  panel; a link to the roster. No `calendar.*` door in the panel (asserted).
- **The week editor (`OpenWeekDialog`):** window start/end selects (by presence on create and PATCH), the dates LOCKED
  (immutable — mutation 15) with a note, the week-level teacher hint ("applies to days you have not edited by hand"),
  and on the edit face a **per-day table** (date · teachers · window; `(edited)` on hand-edited days) ⇒ on save: the
  week PATCH only if something week-level changed, then **ONE per-day PATCH per CHANGED day** (`changedDayPatches`;
  mutation 14). `Apply to every day` copies the week's teachers + window into every row (⇒ N PATCHes on save). The
  refusals (`SLOT_TAKEN`, a bad window, `CAMP_WEEK_CLOSED`) are the server's sentence, the rows stay. 🚫 No window
  rule on the FE (mutation 16 — a `windowStart < windowEnd` gate — fails).
- **The tag + legend:** `OtherKindTag` reads `other.kind` so `CAMP` renders through the existing tag
  (`otherKindTag_CAMP`); the legend lists CAMP BESIDE `OTHER_KINDS` (still three — the OTHER form never offers CAMP;
  mutations 18, 19). Types: `BookingDTO/Booking.campWeekDayId, campWeekId`; `other.kind` + `"CAMP"`; `CampWeek.windowStart/End`;
  the roster day's object; `CampWeekDayResult`; the mapper carries the two ids. The day banner untouched.
- **Copy:** `calendar` +8 · `booking` +1 · `camp` +7 — both languages, counted.

### 🔑 Break-and-watch — nineteen, each in `try/finally`, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | a gap still merges | **1 fail** |
| 2 | another day object merges | **1 fail** |
| 3 | the block drops its rows | **1 fail** |
| 4 | the kind alone makes a camp row | **1 fail** |
| 5 | `dayPatch` sends the whole day | **2 fail** |
| 6 | `dayPatch` minds teacher order | **1 fail** |
| 7 | `replaceTeacher` doubles | **1 fail** |
| 8 | the day grid draws the covered hours too | **1 fail** |
| 9 | the day grid stops spanning | **1 fail** |
| 10 | the week grid renders camp rows one by one | **1 fail** |
| 11 | a CAMP row opens the booking modal | **1 fail** |
| 12 | the swap door ignores the key | **1 fail** |
| 13 | the swap sends the new teacher alone | **1 fail** |
| 14 | the editor saves every day | **1 fail** |
| 15 | the editor unlocks the dates | **1 fail** |
| 16 | the editor copies the window rule | **1 fail** (📌 slipped first — the negative matched `startTime`/`endTime` only; now both name pairs + the exact `ready` line) |
| 17 | the per-day PATCH posts to the week | **1 fail** |
| 18 | the legend loses CAMP | **2 fail** |
| 19 | CAMP joins the form's kinds | **2 fail** |
`md5` identical on the nine mutated files. Pins moved with the reason: the sweep 89 → 90 / 34 → 35 files (the swap
door), the legend's map line (`[...OTHER_KINDS, "CAMP"]`), `camp` keys 69 → 76.

### Definition of Done
- [x] **505 / 0** · `tsc` 0 · build ok
- [x] `mergeCampCells` by value · the panel not the modal on a CAMP cell (by order) · the PATCH bodies (only changed days, by value) · the door by key, hidden
- [x] Copy counted, both languages · snapshot unchanged
- [x] 🔑 Break-and-watch — nineteen, `finally`, checksum

### ⚠️ Not seen on a screen
The spanning block against the sticky time column (the block's height = n × the row's `min-h-20`; a lesson in a
neighbouring column keeps its own row); the per-day table in a `lg` modal on a phone (it will scroll). For @Tanya on
`sid` (after `db:migrate` ⇒ 48): open a week Mon–Fri with two teachers ⇒ the DAY grid shows ONE teal block 10:00–15:00
per teacher column (`5 h`), the WEEK grid one block per day cell; click ⇒ the camp panel (not the booking modal), with
both teachers; `Swap teacher` ⇒ pick a third ⇒ the block moves columns; pick a teacher busy at 11:00 ⇒ the server's
`SLOT_TAKEN` sentence naming date · hour · teacher, nothing moved; Edit week ⇒ the dates are locked, set Wed's window
to 13:00–16:00 ⇒ only Wed's block changes and reads `(edited)`; change the week's window ⇒ every day but Wed
follows; `Apply to every day` ⇒ Wed follows too; the OTHER form's kind list still reads ECA · Free · KOL.
