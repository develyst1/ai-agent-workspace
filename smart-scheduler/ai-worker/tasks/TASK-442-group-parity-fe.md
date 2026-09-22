# TASK-442 — `REQ-104 §2` items 1–3 FE: the series MODAL gains a GROUP face (entry from a GROUP row's block + `Series in range` lists groups too; seats per row; `Confirm whole group`; cancel-all's cascade warning) — FE, S

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-22) · **Size S.** Against TASK-441's contract once CONFIRMED (§0 pasted then). Pure parts now. The held batch.

## §0 The contract — CONFIRMED 2026-09-22 (TASK-441)
`GET /api/group-series?from&to` · `GET /api/group-series/:key` = the OTHER series DTO + `rows[].seats: [{ bookingId, studentId, displayName, status }]` (every seat, any status — grey a cancelled one). Doors on `/api/group-series/:key/*` with the OTHER routes' keys one-for-one: `confirm-all` under **`bookings.course-confirm`** ⇒ `{ courses, confirmed, skipped, results[] }`; `cancel-all { reasonCode, note? }` under **key 58** ⇒ `{ cancelled, seatsCancelled, familiesTold }` (the seats are cancelled and each family told — the dialog says so); `teachers` add/remove as OTHER; the primary swap body is `{ to, fromDate? }` (NO `from` — a group has one primary; it delegates to the group swap so seats follow); `dates { dates[] }`; the header PATCH `{ title?, headCount?, teacherRates? }` — NO kind field. 409 codes as OTHER.

## §1
- `OtherSeriesModal` takes `series: { kind: 'other'|'group', key }` — ONE modal, the GROUP face: the group kind chip (DUO/Group), `cap`, each row with its seats (`displayName · status`), `Confirm whole group (n courses)` behind `bookings.course-confirm`, `Cancel all` behind key 58 with the cascade line *"n seats across m families will be cancelled and each family told"*; no `otherKind` in Edit header. Entry points: the GROUP row's block in `BookingModal` (`groupKey` non-null) and `Series in range` (groups listed with a chip).
- Pure: `seriesDoors` gains the group case (confirm-whole-group needs a PENDING seat; cancel-all needs a live row); value-tested.
- 🚫 No client cascade logic; the counts from the preview/DTO.

## Definition of Done
- [ ] Suite, **count** · tsc · build ok · the two faces by value · the doors · the cascade line from the DTO · 🔑 Break-and-watch, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.


---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-22. **ONE series modal, two faces: the GROUP face (seats per row · Confirm whole group · the cascade line · the group entry points) on `/group-series/:key`.**

```
bunx tsc --noEmit → exit 0
bun test          →  550 pass / 0 fail   (was 543; +7 — new lib/scheduler/group-series.test.ts)
bun run build     → ok
git status        →  11 source modified (contract.ts · other-series.ts · other-series.service · .mock.service · useOtherSeries · dictionaries · OtherSeriesModal · OtherSeriesDialogs · SeriesInRange · CalendarContent · BookingModal) · 1 new test · 2 pins moved
```
Built to §0 (TASK-441). No new key. 🚫 No deploy asked.

### `§1` — what was built
- **`SeriesRef { kind: "other" | "group"; key }` — the ONE modal's address.** Pure (`lib/scheduler/other-series.ts`), value-tested:
  `seriesPath(ref, suffix)` ⇒ `/other-series/:key…` | `/group-series/:key…` (mutation 1); `kindLabelKey(ref, kind)` ⇒
  `booking.groupKind_*` | `booking.otherKind_*`; `swapBody(ref, primary, to)` ⇒ OTHER `{ from, to }`, GROUP `{ to }`
  (mutation 2); `seatCascade(rows)` ⇒ the live seats on the LIVE rows + distinct students (mutation 3 — an attended
  row's seats are not counted); `pendingSeats(rows)` (the live rows' PENDING seats); `groupSeriesDoors(grants, series)`
  = the OTHER doors with confirm-all widened to a PENDING seat (mutation 4) — `grants.status` is `bookings.course-confirm`
  on a group (mutation 5: `calendar.status` fails); cancel-all = key 58 + a live row, as OTHER.
- **The wire (`other-series.service.ts`):** every function takes a `SeriesRef`; the path through `seriesPath` — the nine
  group routes are the OTHER routes' twins, so no second service. The two shapes that differ: the swap body (above) and
  `CancelAllResult { cancelled, seatsCancelled?, familiesTold? }` / `ConfirmAllResult.courses?` (optional — absent on
  OTHER). The list takes the kind (`/other-series` | `/group-series` `?from&to`). Hooks keyed by kind + key. The mock
  carries one GROUP series with seats so the face is exercisable offline.
- **The modal (`OtherSeriesModal`):** `series: SeriesRef`. The GROUP face — the kind chip (grape), the cap (`headCount`),
  the rows as before (a row hands off to the calendar's single `BookingModal`, GROUP bookings fetched by type), then a
  SEATS card: each row's `seats` (`displayName` + status chip; a CANCELLED seat at 50% — every status, as the DTO sends),
  `Confirm whole group ({rows + live pending seats})` ⇒ the toast `{confirmed} dates · {courses} courses · {skipped}`
  (the server's `courses`). `Cancel all` ⇒ the dialog with the cascade line.
- **🚫 No client cascade logic.** The dialog's line before the act: *"{live} live dates will be cancelled; {kept} attended
  kept. {seats} seats across {students} students on those dates will be cancelled and each family told"* — `seats` /
  `students` COUNTED from the DTO (`seatCascade`), which is the count the server will act on, not a rule. The FAMILIES
  number appears only after, from the response (`familiesTold`) — siblings share a family, so the FE cannot know it;
  a client families number is pinned absent (mutation 6). §1 asked for *"n seats across m families"* on the line; the
  honest pre-act line says students (the DTO's `studentId`), the toast says families (the server's) — stated here.
- **The dialogs:** `TeacherDialog` swap ⇒ `withFromDate(swapBody(ref, primary, to), fromDate)`; `EditHeaderDialog` on a
  group hides the kind select (`hideKind`) and never puts `otherKind` in the PATCH (mutation 7); add/remove teacher, add
  dates, cancel-all unchanged in shape.
- **Entry points:** (1) the GROUP row's block in `BookingModal` — `Manage plan` only with the server's `group.key` AND a
  host (mutation 8), closes the booking modal first, `onManagePlan({ kind: "group", key })`; the OTHER block sends
  `{ kind: "other", key }`. (2) `Series in range` fetches both lists while open and lists the groups with the group chip
  and a `Users` icon (mutation 9); a row opens the same modal by ref. The calendar owns `seriesRef` — one instance.
- **OTHER face unchanged in behaviour:** TASK-428/429/435's 21 pins hold; the eight wire pins re-pointed from the literal
  `/other-series/${key}` to `seriesPath(ref, …)` (the reason: one wire, two prefixes). Copy **+4 both languages**
  (`otherSeries` 32 → 36); `inRangeEmpty` reworded (*No series this week*) since groups are listed now.
- The sweep: 97 → 101 sites, 37 files (the group face's `course-confirm` + `group-series`, and the two shared keys asked
  once per face).

### 🔑 Break-and-watch — nine, each in `try/finally`, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | `seriesPath` ignores the kind (a group reads `/other-series`) | **1 fail** |
| 2 | the group swap sends `from` too | **1 fail** |
| 3 | the cascade counts seats on ATTENDED rows | **1 fail** |
| 4 | confirm-whole-group ignores a PENDING seat | **1 fail** |
| 5 | the group face asks `calendar.status` instead of `course-confirm` | **1 fail** |
| 6 | the toast prints a client families number | **1 fail** |
| 7 | the group header PATCH carries `otherKind` | **1 fail** |
| 8 | the GROUP block's button shows without a key | **1 fail** |
| 9 | the strip lists OTHER only | **1 fail** |
None slipped. `md5` identical on the five mutated files.

### Definition of Done
- [x] **550 / 0** · `tsc` 0 · build ok
- [x] The two faces by value (source) · the doors by value · the cascade line from the DTO, the families from the server
- [x] 🔑 Break-and-watch — nine, `finally`, checksum

### ⚠️ Not seen on a screen
For @Tanya on `sid`: open a GROUP row ⇒ `Manage plan` (beside Sell / Walk-in / Swap) ⇒ the booking modal closes, the series
modal opens with the DUO/Group chip, the cap, the dates, and the seats card (a cancelled seat greyed); `Confirm whole
group` ⇒ the toast names dates + courses; `Cancel all` ⇒ the line names live dates, seats, students ⇒ confirm ⇒ the toast
names dates · seats · families (the server's), the seats CANCELLED on the calendar, the families' LINE sent; `Swap` on a
group moves the seats with the row (the server delegates); `Edit` on a group has no kind select; `Series in range` ⇒ the
groups listed with a grape chip; an OTHER series ⇒ everything as before.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-22)
Re-run by me on the final tree: **555 pass / 0 fail** · tsc 0 · the `/group-series` wire present · `remainingLine` in `lib/camp/units.ts`. Fern's call accepted: the pre-act cascade line counts students from the DTO, the families number prints only from the server's `familiesTold` (siblings share an account — not knowable client-side).


---

## §2b ✅ TASK-442b — the toast follow (TASK-445), Fern, 2026-09-22. **`familiesTold` gone; the group cancel-all toast reads `householdsTold` (distinct families) + `familyNotices`.**

```
bunx tsc --noEmit → exit 0 · bun test → 555 pass / 0 fail (count unchanged; the pins moved inside the group test) · bun run build → ok
```
- `CancelAllResult { cancelled, seatsCancelled?, familyNotices?, householdsTold? }` — `familiesTold` removed from the
  contract, the mock, the dialog (pinned absent in all three). The toast: *"{n} dates cancelled · {seats} seats cancelled ·
  {families} families told ({notices} notices)"* — `families` = `householdsTold`, `notices` = `familyNotices`; both
  languages (`{notices}` added to the existing key, no new key). The pre-act line unchanged (the DTO's seats · students).
- 🔑 Two mutations in `try/finally`, md5 identical: the toast reads the old per-seat field ⇒ 1 fail; the notices printed
  as the families ⇒ 1 fail.
- For @Tanya: a group cancel-all with 6 seats of ONE family ⇒ the toast reads *1 families told (6 notices)*.

# ✅ 442b DONE — REVIEWED by @Sober (2026-09-22): 555/0, tsc 0, `familiesTold` absent from `src`; the toast reads `householdsTold` + `familyNotices`.
