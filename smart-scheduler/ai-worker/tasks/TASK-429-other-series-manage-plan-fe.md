# TASK-429 — `REQ-101` ECA/Free/KOL Manage-plan page, FE (`SPEC-088` Part A): `/scheduler/other/:key` — the series' rows, Confirm all · Cancel all (key 58) · Add/Remove/Swap teacher from a date · Add dates · edit title/kind/heads; the row → series link; the Roles matrix shows the 58th key

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-21) · **Size M.** Against TASK-428's contract, CONFIRMED (§0 below). ⏳ Pure parts + the page skeleton now; wire the calls after Jason's report (his route shapes are final). `sid`; the next cycle.

## §0 The contract — CONFIRMED 2026-09-21 (TASK-428)
- `POST /api/bookings/other-series` ⇒ `201 { seriesKey, created, bookingIds }`. Every OTHER booking DTO carries `otherSeriesKey: string | null` (null on un-backfilled legacy rows and on CAMP rows).
- **Reads (`menu:calendar`):** `GET /api/other-series/:key` ⇒ `{ key, title, kind, headCount, startTime, teacherId, additionalTeacherIds, teacherRates, rows: [{ bookingId, date, status, teacherId, additionalTeacherIds }] }` (rows in date order, ALL statuses; header facts from the first live row). `GET /api/other-series?from&to` ⇒ `[{ key, title, kind, startTime, teacherId, firstDate, lastDate, liveCount, total }]`.
- **Writes (`menu:calendar`; one tx each; a clash ⇒ `409 SLOT_TAKEN` naming date · hour · teacher, nothing written):**
  · `POST …/:key/confirm-all` (`action:calendar.status`) ⇒ `{ confirmed, skipped, results[] }`
  · `POST …/:key/cancel-all { reasonCode, note? }` (**key 58 `action:calendar.other-cancel-all`**, TH `ยกเลิกตารางอื่นๆ ทั้งชุด` / EN `Cancel a whole Other series`) ⇒ `{ cancelled }`; ATTENDED rows stay
  · `POST …/:key/teachers { teacherId, rateMinor?, fromDate? }` (`booking-edit`) ⇒ `{ added }`; `409 ALREADY_ON_ROW`
  · `DELETE …/:key/teachers/:teacherId?fromDate=` (`booking-edit`) ⇒ `{ removed }`; `409 PRIMARY_TEACHER`
  · `PATCH …/:key/teacher { from, to, fromDate? }` (`booking-edit`) ⇒ `{ moved }`; `from` must be the primary (400); `409 ALREADY_ON_ROW`
  · `POST …/:key/dates { dates[] }` (`calendar.other-series`) ⇒ `{ created, bookingIds }`
  · `PATCH …/:key { title?, otherKind?, headCount?, teacherRates? }` (`booking-edit`) ⇒ `{ updated }` — **no `startTime`** (a time change = per-row moves)
- `fromDate` defaults to TODAY on add/remove/swap (past rows are history). The coach notices are the server's (nothing on the FE).

## §1
- **The page `/scheduler/other/:key`** (`menu:calendar`): header (title · kind chip · heads · `HH:MM` · primary + extras with rates), the rows in date order with status chips and the per-row doors as today (move · confirm · cancel — the existing modal, by `bookingId`). Series doors, each hidden without its key (never disabled): **Confirm all** (`status`; shows the PENDING count; the result toast `confirmed/skipped`), **Cancel all** (key 58; a confirm dialog with the reason select from the closed `END_REASONS` + note; the ATTENDED count shown as "kept"), **Add teacher** (`booking-edit`; teacher picker + optional rate + `fromDate` defaulting to today), **Remove** (per extra; `fromDate`; the primary shows no remove — swap instead), **Swap primary** (`from` fixed = the primary, `to` picker, `fromDate`), **Add dates** (`calendar.other-series`; multi-date picker; the same clash toast as the create), **Edit header** (`booking-edit`; title · kind (the human kinds only — no CAMP) · heads · rates).
- **Errors by code:** `SLOT_TAKEN` ⇒ the server's sentence verbatim (date · hour · teacher); `ALREADY_ON_ROW` / `PRIMARY_TEACHER` ⇒ their two lines; nothing written on any 409 — the page refetches only on 2xx.
- **The row → page link:** an OTHER row's popup/modal shows *"Manage plan / จัดการตาราง"* when `otherSeriesKey` is non-null (legacy rows without a key show nothing — the backfill gives them one).
- **The create flow:** after `POST /bookings/other-series` the success toast offers the Manage-plan link from `seriesKey`.
- **A list entry:** where the Other create lives, a small *"Series in range"* list from `GET /other-series?from&to` for the visible week — one line per key (title · kind · dates · live/total) linking to the page.
- **Pure (`lib/scheduler/other-series.ts`), value-tested:** `seriesDoors(actions, series)` ⇒ which doors show (the keys; cancel-all needs 58; no live rows ⇒ no confirm/cancel-all); `cancelAllBody(reason, note)`; `fromDateDefault(today)`; the status counts (pending / live / attended / cancelled).
- **Roles matrix:** the 58th key arrives from `/permissions` as every key. Snapshot 57 → 58 with the reason (`calendar.other-cancel-all` in the BE's slot by position).
- Copy both languages, counted. 🚫 No client slot logic; no client date arithmetic beyond the `fromDate` default; nothing on GROUP/CAMP pages.

## Definition of Done
- [ ] Suite, **count** · tsc · build ok · `seriesDoors` by value (each key; key 58 alone gates cancel-all) · the bodies by value · the 409 codes rendered · the link only with a key · snapshot 58 = 58 · 🔑 Break-and-watch, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.


---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-21. **The Manage-plan page `/scheduler/other/:key` — rows + the existing modal per row, the series doors by their keys (cancel-all by key 58 alone), the row → page link, the create toast's link, the series-in-range strip, the 58th key.**

```
bunx tsc --noEmit → exit 0
bun test          →  528 pass / 0 fail   (was 521; +7 — new lib/scheduler/other-series.test.ts)
bun run build     → ok — `ƒ /scheduler/other/[key]`
git status        →  10 source modified · 14 tests re-pinned · 9 new
```
Built to §0 + @Jason's final lines in TASK-428 (`DATE_EXISTS`, the 404 text, 201s). **Snapshot 57 → 58** —
`action:calendar.other-cancel-all` right after `calendar.group-series` (the BE's slot in `lib/permissions.ts`, asserted
by position; `teacher-leave`'s own position pin moved +1 with the reason). 🚫 No deploy asked.

### `§1` — what was built
- **Pure (`lib/scheduler/other-series.ts`), value-tested:** `statusCounts` (pending · live · attended · cancelled);
  **`seriesDoors(grants, series)`** — each door by its own grant, **key 58 ALONE gates cancel-all** (`status` never
  does — mutation 1), confirm-all needs a PENDING row, cancel-all a LIVE row (mutations 2, 3), add-dates by
  `other-series` not `booking-edit` (mutation 4); `cancelAllBody` (the note only when typed — mutation 5);
  `fromDateDefault(today)`; `withFromDate` (rides only when ≠ today — mutation 6); `seriesHref` (null without a key —
  mutation 7).
- **The page** (`partials/OtherSeries/OtherSeriesContent.tsx`, route `app/(admin)/scheduler/other/[key]`): guarded as
  `menu:calendar` through a small `ROUTE_ALIASES` map in `navItemForPath` (`/scheduler/other` → the calendar's item;
  mutation 15) — the nav-item pins (`menuKey = menu:<last segment>`, the 13 menus) untouched. Header: title · kind chip ·
  heads · `HH:MM` · the counts line · the primary (+ rate) with `Swap`, the extras (+ rates) each with `Remove`. The rows
  in date order with `StatusChip`; a row opens the **existing `BookingModal`** by `bookingId` — the rows are loaded as
  bookings through the same `GET /bookings` (type OTHER · the series' teacher · the date span; matched by id, never by
  title). **The doors ask `can()` at the site** (the four grants — REQ-092's rule, the sweep counts them) and
  `seriesDoors` adds the row conditions; hidden, never disabled (mutation 8 — cancel-all on `status` — fails).
- **The dialogs** (`OtherSeriesDialogs.tsx`): **Cancel all** — the closed `END_COURSE_REASONS` radios + a note, the
  body *"n live rows will be cancelled; k attended rows are kept"*; **Add / Remove / Swap teacher** — one dialog, the
  picker excludes teachers already on the row, an optional rate (satang via `bahtToMinor`), `fromDate` defaulting to
  today with the hint; the swap's `from` is FIXED to the primary (mutation 9); **Add dates** — the shared
  `MultiDateField`, the count on the button; **Edit header** — title + the existing `OtherScheduleFields` (kind ·
  heads · per-teacher rates; the human kinds only), only what changed rides, **no `startTime`** (mutation 10; the
  note says "move the rows one by one"). Every refusal is the server's sentence in the dialog, the input stays; no
  code-switching in the dialogs (mutation 16); the hooks refetch on 2xx only.
- **The wire** (`services/other-series.service.ts`): the two reads and the seven writes on their confirmed routes; the
  dates sorted (mutation 11); the header PATCH by presence.
- **The row → page link:** the OTHER block of the booking modal shows `Manage plan` only when `otherSeriesKey` is
  non-null (mutation 12) — a legacy row before the backfill shows nothing. The mapper carries the key.
- **The create toast:** `OtherSeriesDialog` reads `res.seriesKey` ⇒ the toast offers the page (`notify` grew an optional
  `link`; mutation 13); an older payload without the key ⇒ no link.
- **Series in range:** a collapsed `Series in range` line under the calendar header (`SeriesInRange.tsx`) —
  `GET /other-series?from&to` for the visible week, fetched ONLY while open; one line per key (title · kind · dates ·
  time · live/total) linking to the page. Not mounted for a linked account (outside its allowed set).
- **Copy:** `otherSeries` 32 keys, both languages, counted.

### 🔑 Break-and-watch — sixteen, each in `try/finally`, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | `status` opens cancel-all | **1 fail** |
| 2 | cancel-all shows with nothing live | **1 fail** |
| 3 | confirm-all shows with nothing pending | **1 fail** |
| 4 | add-dates by `booking-edit` | **1 fail** |
| 5 | the note rides when blank | **1 fail** |
| 6 | `fromDate` always rides | **1 fail** |
| 7 | a link without a key | **1 fail** |
| 8 | the page gates cancel-all on `status` | **2 fail** |
| 9 | the swap sends an extra as `from` | **1 fail** |
| 10 | the header PATCH carries `startTime` | **1 fail** |
| 11 | the dates go unsorted | **1 fail** |
| 12 | the modal shows the link without a key | **1 fail** |
| 13 | the toast loses the link | **1 fail** |
| 14 | the 58th lands after `teacher-leave` | **1 fail** |
| 15 | the guard forgets the alias | **1 fail** |
| 16 | a dialog switches on the code | **1 fail** |
None slipped. `md5` identical on the eight mutated files. Pins moved with the reason: the snapshot 57 → 58 in twelve
tests, `teacher-leave`'s position +1, the sweep 91 → 95 / 35 → 36 files, the create toast's line.

### Definition of Done
- [x] **528 / 0** · `tsc` 0 · build ok
- [x] `seriesDoors` by value (each key; key 58 alone gates cancel-all) · the bodies by value · the 409 codes rendered as the sentence · the link only with a key · 58 = 58 by position
- [x] Copy counted, both languages
- [x] 🔑 Break-and-watch — sixteen, `finally`, checksum

### ⚠️ Not seen on a screen
The header's teacher line with inline Swap/Remove buttons wrapping on a phone; the rows list as plain buttons (no
table — the modal is the detail); the collapsed strip under the calendar header. For @Tanya on `sid`: create an ECA
series ⇒ the toast carries `Manage plan` ⇒ the page reads the title · kind · heads · time · counts, the primary and
extras; the rows in date order; click a row ⇒ the ordinary booking modal (move · confirm · cancel as today); `Confirm
all (n pending)` ⇒ the toast `n confirmed · 0 skipped`; `Add teacher` B from today ⇒ the future rows read `A + B`,
past rows untouched; `Remove` B ⇒ gone from today on; `Swap` the primary to C when C is busy at that hour ⇒ the
server's `SLOT_TAKEN` sentence naming date · hour · teacher, nothing moved; `Add dates` with one already live ⇒ the
`DATE_EXISTS` line, the ticks stay; `Cancel all` needs the new key `ยกเลิกตารางอื่นๆ ทั้งชุด` (absent without it even
for a user with `calendar.status`) ⇒ the reason radios, `k attended kept`; an OTHER row created before the backfill
shows no `Manage plan`; the calendar's `Series in range` opens to one line per series this week.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-21)
Re-run by me: **528 pass / 0 fail, 52 files** · tsc 0 · key 58 in the snapshot · `other-series.service.ts` sends no `startTime` on the header PATCH · route `app/(admin)/scheduler/other/[key]` present. The `ROUTE_ALIASES` guard is the right seam (the 13-menu pins untouched); a row through the EXISTING modal is the right call. REQ-101 complete both sides.
