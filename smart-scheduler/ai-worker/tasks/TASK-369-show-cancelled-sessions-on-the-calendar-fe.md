# TASK-369 — The "show cancelled" toggle on the admin calendar (`REQ-089 §5`, item 4 re-scoped) — FE

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-16)
**Owner (`REQ-089 §5`):** a toggle in the calendar's cell display that, when ON, shows the `CANCELLED` sessions — every reason — struck/greyed with the reason shown. 🚫 DISPLAY ONLY.
**Contract (proposed to @Jason, TASK-368; confirmation reaches you through me):** `GET /calendar?includeCancelled=true` adds the `CANCELLED` rows (with `status`, `cancelReason`, `note`); absent ⇒ today's response; `PAUSED` stays hidden.
**Size S.** ⛔ Chain stopped. Batch 4/5/7.

---

## §1 Where
- **The toggle lives with the existing cell-display controls (`CellDisplayMenu.tsx`)** — one more switch, `Show cancelled` / `แสดงคาบที่ยกเลิก`, default OFF, **remembered like the other display toggles are** (whatever they use — same mechanism, no new one).
- ON ⇒ the calendar hook passes `includeCancelled=true` (the query key changes with it, so ON/OFF are two cached answers); OFF ⇒ the param is ABSENT (not `false`) — assert the request shape.

## §2 How a cancelled cell looks
- Struck-through name, greyed body, and **the reason on the cell: the closed code's label (`cancelReason` → the dictionary's existing labels for `PROGRAM_CHANGED / CUSTOMER_CANCELLED / ADMIN_ERROR` — reuse, do not add) and, if there is no code, the `note`** (the human sentence, truncated as names are). ONE shared rendering in `BookingCellBody`, both grids.
- The legend gains a struck sample with `cancelled`.
- Tapping a cancelled cell opens the booking modal as today (read-only actions apply — whatever the modal already does for a `CANCELLED` booking; change nothing there).
- 🚫 No client-side filtering by reason; no colour beyond grey (item 6 is not ours).

## Definition of Done
- [ ] Suite, **count** · tsc · build ok
- [ ] OFF ⇒ no param; ON ⇒ param and a distinct query key — asserted
- [ ] Cancelled cell: struck + reason label (code) or note (no code); legend — rendered assertions, both grids
- [ ] Keys counted, both languages
- [ ] 🔑 Break-and-watch, `finally`, CHECKSUM

## Question — ⚠️ to the OWNER'S LIST
❓ With the toggle ON a busy week shows every cancelled row of the term — is the grid still readable, or does the toggle want a "this week only" feel? Say what the week grid does at ~90 + N rows; build nothing.

---

## §4 🔴 RE-SHAPE (owner, `REQ-089 §5.1`, 2026-09-16) — a CANCELLED TRAY mirroring the PAUSED tray, NOT struck rows on the grid
**Drop §2's struck cell.** The owner wants cancelled sessions in **their own box beside the paused tray** (`PausedTray.tsx`, `usePausedBookings`, `usePausedTrayCollapsed` — reuse the component/pattern; a second instance or a small generalisation, not a copy). The `Show cancelled` toggle (§1) reveals the tray; OFF ⇒ no tray and no param. **BE re-shaped (TASK-368 §8):** with `includeCancelled=true` the calendar response carries **`cancelled: BookingDTO[]`** — the range's cancelled rows, date/time order — and the grid rows are today's, untouched. Each tray row: name · date · time · coach · the reason (existing code labels, else `note`); tap ⇒ the booking modal as the paused tray does. Legend: no struck sample needed — the tray is its own label. 🚫 Nothing on the grid changes; `BookingCellBody` untouched by this task.

---

## §5 ✅ IMPLEMENTED — Fern, 2026-09-16. **The `Show cancelled` toggle reveals a CANCELLED TRAY beside the paused one (§4 shape); the grid is untouched; OFF sends no param.**

```
bunx tsc --noEmit → exit 0
bun test          →  368 pass / 0 fail   (was 357; +11 — new lib/scheduler/cancelled-tray.test.ts; one sweep pin re-cut)
bun run build     → ok
git status        →  10 modified · 2 new (lib/scheduler/cancelled-tray.ts · .test.ts)
```
Built against the §4 re-shape and @Jason's verbatim contract line (`cancelled: BookingDTO[]` beside the grid when
`includeCancelled=true`; absent otherwise; `cancelReason` on every DTO). **§2's struck cell was never built** — the
re-shape arrived before I started §2, so there is nothing to take out; `BookingCellBody` and both grids are
byte-identical to TASK-367's and asserted free of `cancelReason|line-through|CANCELLED|showCancelled`.

### `§1` — the toggle and the request
- **Where:** `CellDisplayMenu`, under a `Menu.Divider` beneath the five cell fields — `Show cancelled sessions` /
  `แสดงคาบที่ยกเลิก`, default OFF. 🔑 **Not a sixth `CELL_FIELDS` entry**: those five are "display-only, never
  filter bookings", and this switch REVEALS a tray and changes the REQUEST. So it has its own store
  (`lib/scheduler/cancelled-tray.ts`, `ss.showCancelled`) built on the same `useSyncExternalStore`-over-
  `localStorage` mechanism as the cell fields and the paused tray's fold — remembered like its siblings, one value
  shared by the menu, the page and both tray instances. The five stay five (asserted).
- **Request shape, asserted:** `getCalendar(date, view, includeCancelled)` spreads the param **only when ON**
  (`...(includeCancelled ? { includeCancelled: "true" } : {})` — the `archived` pattern; never `"false"`,
  mutation 1 fails); the hook's key is `[...CALENDAR_KEY, date, view, "with-cancelled" | "live"]`, so ON and OFF are
  two cached answers (mutation 2 fails). The page reads `calendar?.cancelled ?? []` through `dtoToBooking`.
- **The wire, as this repo's claim:** `CalendarResponse.cancelled?: BookingDTO[]` and `BookingDTO.cancelReason?:
  string | null` (with Jason's facts beside them); `Booking.cancelReason?`; the mapper passes it through as sent
  (`?? null`, value-asserted).

### `§4` — the tray: a second INSTANCE of `PausedTray`, not a copy
- `PausedTray` gained one prop, `variant: "paused" | "cancelled"` (default `paused`, so every existing call and
  every existing pin is unchanged — `pause-booking.test.ts` and `expiry-warning.test.ts` still green untouched).
  A `TRAY` table names what differs — icon (`Ban`), the four labels, the badge colour (`gray`), and the collapsed
  store (`ss.cancelledTrayCollapsed`, default expanded like its sibling) — and the row's meta line: a paused row
  keeps its *"Was: date time"*; a cancelled row renders `CancelledRowMeta`: **`{date} {time} · {coach}`** then the
  **reason**. Everything else — spine, strip, collapse, count badge, the empty sentence, tap ⇒ `onSelect` ⇒ the
  booking modal — is the one component.
- **The reason:** `cancelReasonDisplay(cancelReason, note)` — a closed code ⇒ the EXISTING `endCourse.<code>` label
  (the three reasons REQ-036/REQ-074 already share; no new label key), else the human `note`, else nothing.
  Value-asserted (including an unknown code ⇒ the note); mutation 4 fails.
- **Rendered-asserted** (SSR of the cancelled variant with two rows): the code label appears and its ignored note
  does not; the note appears where the code is null; the coach nickname; the time as `10:00` never `10:00:00`;
  the tray's own title and never the paused one's; the empty sentence at zero; the strip layout renders.
- **The page** mounts the cancelled tray in BOTH layouts (strip above the grid, rail beside it) **only while the
  toggle is ON** (mutation 3 fails); the paused tray stays unconditional. The rail `<aside>` is now a `flex-col`
  holding both trays and is a `w-10` spine **only when every tray in it is collapsed** — one open tray needs the
  width (asserted).
- 📌 **The time sweep caught me** — `t-arg-shape.test.ts` pins the exact set of `formatTimeDisplay` sites in `t()`
  arguments and went red on the tray's new row line: named as the fourth, with the reason, rather than loosened.
  Mutation 7 (the raw `startTime`) now fails three tests — the sweep proves the new site is inside its reach.
- 🚫 No client-side filtering by reason (mutation 5 fails) · no colour beyond dimmed · nothing on the grid
  (mutation 6 — a `CANCELLED` predicate in `BookingCellBody` — fails) · `BookingModal` untouched (it already
  handles a `CANCELLED` booking; the tray hands it the row as the paused tray does).
- Copy: **6 keys × 2** (`showCancelled` · `cancelledTray` · `cancelledTrayEmpty` · `cancelledTrayCollapse` ·
  `cancelledTrayExpand` · `cancelledRow`), both languages.

### 🔑 Break-and-watch — seven mutations, each in `try/finally`, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | the param always sent (`String(includeCancelled)`) | **1 fail** |
| 2 | one query key for ON and OFF | **1 fail** |
| 3 | the tray shown regardless of the toggle | **1 fail** |
| 4 | the note wins over the code | **3 fail** |
| 5 | a client-side reason filter on the page | **2 fail** |
| 6 | a `CANCELLED` predicate grows in `BookingCellBody` | **1 fail** |
| 7 | the raw `startTime` in the row line | **3 fail** (the tray test + the time sweep, twice) |
`md5` identical on all six mutated files.

### Definition of Done
- [x] **368 / 0** · `tsc` 0 · build ok
- [x] OFF ⇒ no param; ON ⇒ param and a distinct query key — asserted
- [x] §4: the tray beside the paused one, both layouts, rows with reason (code label / note) — rendered assertions;
      the grid untouched — asserted by absence
- [x] Keys counted: 6 × 2
- [x] 🔑 Break-and-watch — seven, `finally`, checksum

### ⚠️ Not seen on a screen
Two trays stacked in the 17-rem rail and the strip pair on a laptop; the `Ban` icon beside the pause one. For
@Tanya via you: toggle ON ⇒ the request has `includeCancelled=true` (network tab), the tray appears in both
layouts with the week's cancelled rows and their reasons, tap opens the booking; toggle OFF ⇒ no param, no tray;
reload ⇒ the toggle is remembered; collapse each tray independently ⇒ the rail is a spine only when both are.

## Question — **with the toggle ON does a busy week stay readable?** ⚠️ owner's list, nothing built
**The §4 re-shape answers it by construction: the GRID does not change at all with the toggle ON** — the ~90 live
rows are exactly what they were; the cancelled rows go to their own box. And the box holds **the visible RANGE's**
cancelled rows (the server returns the request's `range`, a day or a week), not the term's — so the "this week
only" feel the question asks for is already what the contract gives. Inside the box: the rail list scrolls at
`max-h-[28rem]` (≈ 7–8 rows visible, more on scroll) and the strip scrolls sideways at `w-56` per row — the same
limits the paused tray has lived with. **Where it could still hurt:** a week with, say, 30 cancellations (a
teacher's leave across a full week) makes the strip a long sideways scroll on a laptop; the count badge says how
many before anyone scrolls. If that ever bites, the cheapest lever is the rail's `max-h` or a day/week split of the
tray — named, not built.
