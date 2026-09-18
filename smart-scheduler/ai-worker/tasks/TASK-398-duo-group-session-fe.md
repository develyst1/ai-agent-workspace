# TASK-398 — DUO / Group: the group cell, `Create group` series, sell-a-course-into-a-group, swap teacher, roster — FE (`REQ-095` Stage 2a, `SPEC-081`)

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-18) · **Size L.** Builds against the contract CONFIRMED in TASK-397 (below, final). Ships in ONE `sid` deploy with TASK-396 + Stage 1 + TASK-397 — 🚫 do not ask for a deploy. ⏳ Start the pure parts now; the wire parts once @Jason's report lands (I will tell you).

## §0 The confirmed contract (from TASK-397 §2 — do not re-derive)
- `POST /api/bookings/group-series { name, groupKind: "DUO"|"GROUP", seatCap, teacherId, additionalTeacherIds?, teacherRates?, startTime, dates[] }` ⇒ `201 { groupKey, created, bookingIds }` | `409 SLOT_TAKEN` naming the date (all or nothing). `seatCap` 2..12; DUO ⇒ exactly 2 (`400` otherwise). Key **`action:calendar.group-series`** (50th).
- `POST /api/courses { …, groupKey }` — teacher / weekday / startTime are the GROUP's (prefill, lock the three fields); `409 GROUP_FULL` / `409 SLOT_TAKEN` naming the date; `400 GROUP_MISMATCH`. A date past the group's last row EXTENDS the group (no client concern).
- `PATCH /api/bookings/:id/group-teacher { teacherId, fromHereOn: boolean }` ⇒ `409 SLOT_TAKEN` naming the date. Under `calendar.booking-edit`.
- Cancel a GROUP row = the ordinary cancel action (every seat cascades server-side). Rates/cap edit = the Stage 1 `PATCH /bookings/:id/other` (works on a GROUP row).
- DTO: a GROUP row carries `group: { key, kind: "DUO"|"GROUP", name, seatCap, seats: [{ bookingId, studentId, studentName, status, courseId }], teacherRates, ratePostedAt }` (`other` null); a seat row carries `groupId`, `groupName`. **Seat rows are absent from the calendar grid** (server-side) and present in every other read.

## §1
- **The group cell (both grids):** one cell for the GROUP row: the name, a `DUO`/`Group` tag (the Stage 1 `OtherKindTag` grows the two kinds; legend too), and the seats' names (`n/cap`) — the same row height rules as today; an empty group shows `0/cap`.
- **`Create group`** — a door beside Stage 1's `Create series` on the OTHER form, by the 50th key: name, kind (DUO ⇒ cap locked at 2; Group ⇒ cap 3..12), teacher(s) + rate per teacher (the ONE `OtherScheduleFields` — reuse, no second field set), time, the multi-date picker ⇒ one call; the 409 names the date, the ticks stay (Stage 1's shape, shared code, not a copy).
- **Sell a course into this group** — a door on the GROUP row's details (by the existing course-create key): opens the existing course-create form with teacher / weekday / start time **prefilled and locked**, `groupKey` in the body; `409 GROUP_FULL` shows the server's sentence. 🚫 No second course form.
- **Swap teacher** — on the GROUP row's details (booking-edit): a teacher picker + a `From this date on` switch ⇒ the one call; the 409 names the date.
- **Roster** in the GROUP row's details: the seats with status chips, each a link to the child's booking view (the seat row is an ordinary booking there — its own check-in / leave / details, untouched).
- A seat's booking view shows `In group: <name>` (from `groupName`); nothing else changes on a seat.
- Snapshot 49 → 50 with the reason. Copy both languages, counted.
- 🚫 No client rules beyond the DUO-cap lock (the server's are the rules); 🚫 no seat rendering on the grid (the server hides them — if one appears, that is a BE bug to report, not to filter).

## Definition of Done
- [ ] Suite, **count** · tsc · build ok · shapes asserted (group series body; course body carries `groupKey` and the locked three; swap body; the group cell renders `n/cap` from `group.seats`) · keys counted (50 = 50 by script) · 🔑 Break-and-watch, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.

---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-19. **The group cell (`n/cap` from `group.seats`, the DUO/Group tag), `Create group` by the 50th key on the SHARED fields + picker, sell-a-course-into-a-group through the EXISTING course form (three fields locked, `groupKey` in the body), the swap (its own route; "no message is sent" in one line), the roster, `In group:` on a seat.**

```
bunx tsc --noEmit → exit 0
bun test          →  442 pass / 0 fail   (was 435; +7 — new lib/scheduler/group-session.test.ts)
bun run build     → ok
git status        →  23 modified · 5 new (lib/scheduler/group-session.ts + test · Calendar/Modal/{GroupSeriesDialog,GroupSwapDialog,MultiDateField}.tsx)
```
Built against §0 as confirmed (byte-for-byte) + @Jason's two build notes. The snapshot is 50 — **equal to the BE's
`ACTION_KEYS` by script (50 = 50, in order)**. 🚫 No deploy asked.

### The sixth type, found by the compiler
`BookingType` gained `"GROUP"` in both type files, and — as the OTHER note promised — every `Record<BookingType, …>`
refused to compile until named: the cell icon (`Users`), the cell hue (a new `--booking-type-group`, teal — the one hue
no product uses), the chip colour, the `bookingType.GROUP` label ×2 (the TH block was found by `tsc`, not memory). The
two hand-written arrays the compiler cannot see (the bookings-table type filter, the legend) got their line too.

### `§1` — the cell, the doors, the details
- **The group cell (both grids):** `GroupSeatsLine` on the cell — **`Seats n/cap` from the server's `group.seats`**
  (`seatsLabel` is pure: the listed seats' length over `seatCap`, whatever their status — value-tested, mutation 3
  fails) and the seated names; an empty group reads `0/cap`. The Stage 1 **`OtherKindTag` grows the two kinds**
  (`DUO` / `Group` from `group.kind`, on a GROUP row only — the TYPE decides, a stray `group` on a lesson renders
  nothing; rendered assertion, mutation 4 fails); the legend lists both. 🚫 **No seat on the grid, no filter:** the
  calendar partials read no `groupId` (walk-pinned; mutation 12 — a client-side seat filter — fails). The row height
  rules are untouched (one more line under the name row, like the note).
- **`Create group`** — a second door beside `Create series` on the OTHER form, behind
  **`can("action:calendar.group-series")`** (mutation 5 fails three tests) ⇒ `GroupSeriesDialog`: name · kind (**DUO ⇒
  the cap is LOCKED at 2** — the ONE client rule, `seatCapFor` pure and value-tested, mutation 1 fails; Group ⇒ 3–12
  typed) · teacher(s) + rate per teacher (**the ONE `OtherScheduleFields`**, now with a `ratesOnly` face — a group's
  kind and cap are its own fields) · time · **the SHARED `MultiDateField`** (extracted from the OTHER series dialog this
  task; exactly one `type="multiple"` exists across the three files — asserted; mutation 6, a copy, fails) ⇒ ONE
  `POST /bookings/group-series` with the confirmed body (`groupSeriesBody`: dates sorted, optionals only when present —
  value-tested, mutation 2 fails). On `409 SLOT_TAKEN` the sentence names the date and the ticks stay (mutation 7).
- **Sell a course into this group** — on the GROUP row's details, behind the existing `bookings.course-create`
  (mutation 14 fails two tests) ⇒ **the EXISTING `CreatePlanFlow`** with a `group` prop: teacher / first date (the
  group row's date ⇒ its weekday) / start time **prefilled and LOCKED** (`disabled={!!group}` ×3, asserted; mutation 8
  fails), a teal line *"Into group: X — teacher, day and time are the group's"*, and **`groupKey` in the create body**
  (the literal, gated by presence; mutation 9 fails). `409 GROUP_FULL` / `SLOT_TAKEN` land in the form's existing error
  slot as the server's sentence. 🚫 No second course form (asserted).
- **Swap teacher** — on the GROUP row's details, behind `booking-edit` ⇒ `GroupSwapDialog`: a teacher picker (the
  bookable ones, not the current) + a `From this date on` switch ⇒ ONE **`PATCH /bookings/:id/group-teacher {
  teacherId, fromHereOn }`** (its own route, not the move — mutation 10 fails). 🔴 **@Jason's note 1, in one line, both
  languages:** *"No message is sent to families or the coach — tell them yourself."* (pinned; mutation 11 fails).
- **The roster** on the GROUP row's details: `Seats n/cap`, each seat's name with its `StatusChip`, linked to the
  Bookings page searched by the child's name (the seat row is an ordinary booking there — its own check-in / leave /
  details, untouched by this task); empty ⇒ *"No seats yet — sell a course into this group."*. **Cap / rates** go
  through the Stage 1 `OtherDetailsDialog` — on a GROUP row it reads `group` (`seatCap` as the head count, the rates)
  and hides the Kind (a group's kind is its own); the same `PATCH /bookings/:id/other`.
- **A seat's booking view** shows *`In group: <name>`* from `groupName`; nothing else on a seat changes.
- Copy: `booking.*` +21 · `calendar.groupKindTag_*` 2 · `bookingType.GROUP` — both languages, counted.

### 🔑 Break-and-watch — fourteen mutations, each in `try/finally`, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | a DUO's cap follows what was typed | **1 fail** |
| 2 | the series body sends the dates unsorted | **1 fail** |
| 3 | `n/cap` counts only CONFIRMED seats | **1 fail** (📌 slipped first — the fixtures were all CONFIRMED; a mixed-status pin added) |
| 4 | the seats line shows on a lesson row | **1 fail** (📌 slipped first — `group: null` hid it; the lesson fixture now carries a stray `group`) |
| 5 | the group door ignores the key | **3 fail** |
| 6 | the group dialog grows its own picker | **1 fail** |
| 7 | a 409 clears the ticks | **1 fail** |
| 8 | the course form leaves the teacher unlocked | **1 fail** |
| 9 | `groupKey` leaves the course body | **1 fail** |
| 10 | the swap goes through the MOVE route | **1 fail** |
| 11 | the swap dialog drops the no-notice line | **1 fail** |
| 12 | the grid filters seats client-side | **1 fail** |
| 13 | the snapshot loses the 50th key | **3 fail** |
| 14 | the sell door ignores the course-create key | **2 fail** |
`md5` identical on all nine mutated files. Count pins moved with the reason: the snapshot 49 → 50, the sweep 73 → 77 /
30 files; three TASK-395 pins re-pointed to the shared `MultiDateField` and the details editor's `facts`.

### ⚠️ Not seen on a screen
A group cell with six names (the names line truncates; the `n/cap` stays); the teal hue beside the five; the locked
course form's three greyed fields. For @Tanya on `sid`: `Create group` DUO ⇒ the cap box reads 2 and is grey; tick 4
dates ⇒ `Group created — 4 sessions`, four teal cells `DUO · Seats 0/2`; open one ⇒ the roster is empty ⇒ *Sell a
course into this group* ⇒ the course form opens with the teacher, the date and 10:00 greyed ⇒ save ⇒ the cell reads
`Seats 1/2 · Ann`, the seat rows are on the Bookings page and NOT on the grid; a third course into the DUO ⇒
`GROUP_FULL`'s sentence in the form; swap the teacher *from this date on* ⇒ the later cells move column, no LINE goes
out (the dialog said so); a seat's booking opens with *In group: …*.
