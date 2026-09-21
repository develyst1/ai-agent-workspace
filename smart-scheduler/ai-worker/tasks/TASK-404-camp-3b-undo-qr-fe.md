# TASK-404 — Camp Stage 3b, FE: `Undo` on an attended/absent camp day (with reason) · the camp day's check-in QR on the roster · the reminder flag on Settings

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-19) · **Size S.** Builds against TASK-403's contract once CONFIRMED (I paste the final lines here). ⏳ Pure parts now; wire after Jason's report. `sid`.

## §0 The contract — CONFIRMED 2026-09-19 (TASK-403)
- Undo: `PATCH /api/camp/days/:id { status: "PLANNED", reason }` from ATTENDED|ABSENT (`reason` 3..200, required ONLY for the undo) ⇒ `{ package }`; `409 CAMP_DAY_TRANSITION` otherwise. Same key `action:camp.day-mark`. The day row carries `undoReason` (show it on the roster entry when present).
- QR: **lazy** — `GET /api/camp/days/:id/checkin` (staff, `menu:camp`) mints on first view ⇒ `{ dayId, token, url, expiresAt, studentName, date, half }`; the QR image is the FE's (the SAME component as the session's). Public check-in: `POST /checkin/camp { token }` ⇒ `{ already, day }` | `404` | **`410 CAMP_TOKEN_EXPIRED`** (the camp only — the session's page keeps its 400) | `409 CAMP_DAY_NOT_TODAY` | `409 CAMP_DAY_TRANSITION` — the public check-in page handles the camp shape beside the session's (one page, two token kinds; the URL carries which).
- Reminder flag: settings key `camp_reminder_enabled` (`enum`, `off | on`, default `off`) through the existing settings API — the Settings page renders it like the other enum settings; the copy is server-side placeholders until approved.

## §1
- **`Undo`** in the day's `Mark` menu when the status is ATTENDED or ABSENT (`camp.day-mark`): a reason field (required, the server's bounds shown as the server's sentence on refusal) ⇒ one call; the card reflects the credit coming back (from the server's `package`).
- **QR** on a PLANNED entry in the roster: the same QR button/dialog the session uses (no second QR component); absent when no token.
- **Settings:** the `camp_reminder_enabled` toggle with a one-line note *"Reminder copy pending owner approval"* (both languages) — the switch is the server's setting, nothing client-side.
- Copy counted; snapshot unchanged unless Jason adds a key.

## Definition of Done
- [ ] Suite, **count** · tsc · build ok · shapes asserted (the undo body carries `status: "PLANNED"` + `reason`; the QR uses the shared component; the toggle reads/writes the one key) · 🔑 Break-and-watch, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.


---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-19. **`Undo` (reason ⇒ PLANNED) in the roster's Mark menu · the day's check-in QR on a PLANNED entry through ONE shared `QrDialog` · the camp token on the public check-in page (`/checkin/camp`) · `camp_reminder_enabled` rendered by the existing Settings page with its pending note.**

```
bunx tsc --noEmit → exit 0
bun test          →  466 pass / 0 fail   (was 454; +12 — new lib/camp/camp-3b.test.ts)
bun run build     → ok — `○ /checkin/camp` beside `○ /checkin` and `○ /scheduler/camp`
git status        →  12 modified · 4 new (components/common/QrDialog.tsx · partials/Camp/UndoDayDialog.tsx · app/checkin/camp/page.tsx · lib/camp/camp-3b.test.ts)
                     + package.json / bun.lock: `qrcode.react@4.2.0` (the only dependency change)
```
Built to §0 + @Jason's final lines in TASK-403 (2516/0, 44 = 44). **Snapshot unchanged — 54 actions · 13 menus (asserted);
the undo rides the mark's key.** 🚫 No deploy asked.

### 📌 One thing §1 assumed that was not there
§1 says *"the same QR button/dialog the session uses (no second QR component)"*. **The FE had no QR component at all**
— the session's check-in link is minted and sent by the server over LINE; nothing on any screen drew a QR (grep for
`qr`/`QRCode`/`checkinUrl` across `src`: only the check-in page's comment; no `qrcode` dependency). So the shared one
was BUILT here: `components/common/QrDialog.tsx` (`qrcode.react`, SVG), given a `url` it draws it, prints it with a
copy button, and the expiry when sent — it composes nothing. The test walks `src` and pins **exactly one file imports
`qrcode.react`, and it is this one**; a later session QR mounts it, never a second.

### `§1` — what was built
- **Pure (`lib/camp/units.ts`):** `markBody(status, reason?)` — `{ status }` on a mark, `{ status: "PLANNED", reason }`
  (trimmed) on the undo, **a reason never rides a mark** (mutation 1 fails); `CAMP_UNDO_FROM = [ATTENDED, ABSENT]` +
  `canUndoCampDay` (mutation 2); `checkinEndpointFor(kind)` — `/checkin` | `/checkin/camp` by the PATH kind, never the
  token (mutation 3); `CAMP_TOKEN_EXPIRED`. No client copy of `3..200` — the bounds are the server's sentence.
- **Wire:** `markCampDay(dayId, status, reason?)` ⇒ `PATCH /camp/days/:id` with `markBody(...)` (mutation 4);
  `useMarkCampDay` forwards `reason` (mutation 5); `getCampDayCheckin(dayId)` ⇒ `GET /camp/days/:id/checkin`;
  `useCampDayCheckin(dayId | null)` **enabled only while a dialog names a day** — nothing minted per entry (mutation 6).
  Types: `undoReason: string | null` on `CampDayEntry` and `CampPackageDay`; `CampDayCheckin` (the mint payload);
  `CampCheckinResult` (`{ already, day }`). Mocks follow.
- **The roster (`WeekRoster.tsx`):** inside the same `camp.day-mark` Mark menu, after the three words, a divider and
  **`Undo (back to planned)`** on ATTENDED | ABSENT only (mutation 8) ⇒ `UndoDayDialog`: the child · date · current
  status, a required reason (submit disabled while empty — presence only; mutation 11, a client 3..200, fails), ONE
  call `{ dayId, status: "PLANNED", reason }` (mutation 10); a refusal (`400` bounds, `409 CAMP_DAY_TRANSITION`) is
  the server's sentence under the field and the text stays. The entry shows **`· undone: <reason>`** dimmed after the
  name when `undoReason` is set (mutation 9). **A QR icon on a PLANNED entry only** (mutation 7) ⇒ the shared
  `QrDialog` with the mint's `url` / `expiresAt` and `studentName · date · half` as the subtitle; the mint's own error
  shows in the dialog.
- **The public page (`CheckinContent`):** one component, `kind: "session" | "camp"` from the ROUTE — the new
  `app/checkin/camp/page.tsx` mounts `<CheckinContent kind="camp" />` (mutation 15), `app/checkin/page.tsx` untouched
  (asserted). The camp kind posts `POST {API}/checkin/camp { token }` (mutation 13 — choosing by the token — fails) and
  renders the day shape: student (when sent), camp/week, date, session (AM/PM/Full), status, and *"Earlier mark undone:
  <reason>"* when `day.undoReason` is set; `already` ⇒ the "Already checked in" title as the session's. The error view
  now also takes the server's `code`: **`CAMP_TOKEN_EXPIRED` ⇒ the clock icon** (mutation 14), the session's sentence
  match unchanged; `404` / `409 CAMP_DAY_NOT_TODAY` / `409 CAMP_DAY_TRANSITION` show the server's sentence with the cross.
- **Settings:** nothing row-specific on the page (asserted: `SettingsContent` has no `camp_reminder`) — the server's
  enum row renders through the generic enum branch like `line_parent_2fa` / `notify_on_leave`; added the option words
  `settings.opt.camp_reminder_enabled.{off,on}` (Off/On · ปิด/เปิด) and the one-line note through the EXISTING
  `settingHelp` path: `settings.help.camp_reminder_enabled` = *"Reminder copy pending owner approval"* /
  *"ข้อความแจ้งเตือนรอเจ้าของอนุมัติ"* (value-tested through `settingHelp`; mutation 16). The mock settings list gained
  the row with Jason's label `ส่งแจ้งเตือน LINE วันแคมป์ (08:15)` so offline dev shows it.
- **Copy:** `camp` 60 → **69** (undo ×7, qr ×2), new `qr` ×3 (shared dialog), `checkin` +5 — both languages, counted.

### 🔑 Break-and-watch — sixteen mutations, each in `try/finally`, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | `markBody` sends the reason on a mark too | **1 fail** |
| 2 | the undo may leave CANCELLED | **1 fail** |
| 3 | the camp kind posts to the session endpoint | **1 fail** |
| 4 | the service sends a raw body, not `markBody` | **2 fail** |
| 5 | the hook drops the reason | **1 fail** |
| 6 | the QR mint is eager (per entry) | **1 fail** |
| 7 | the QR button shows on every status | **1 fail** |
| 8 | `Undo` ignores the status | **1 fail** |
| 9 | the entry hides its `undoReason` | **1 fail** |
| 10 | the dialog sends the old status back instead of PLANNED | **1 fail** |
| 11 | the dialog copies 3..200 client-side | **1 fail** |
| 12 | the QR draws a URL of its own | **1 fail** |
| 13 | the check-in page picks the endpoint by the token | **1 fail** |
| 14 | `410 CAMP_TOKEN_EXPIRED` draws the cross | **1 fail** |
| 15 | the camp route mounts the session kind | **1 fail** |
| 16 | the pending note loses its EN entry | **1 fail** |
None slipped. `md5` identical on all nine mutated files. Pins moved with the reason in `camp.test.ts`: the mark body
(`{ status }` → `markBody(status, reason)`), `camp` keys 60 → 69.

### Definition of Done
- [x] **466 / 0** · `tsc` 0 · build ok (`○ /checkin/camp`)
- [x] Shapes asserted: the undo body `status: "PLANNED"` + `reason` (and never a reason on a mark) · the QR through the ONE shared component (walk-pinned) · the toggle is the server's row, no client code
- [x] Copy counted, both languages · snapshot unchanged 54 / 13
- [x] 🔑 Break-and-watch — sixteen, `finally`, checksum

### ⚠️ Not seen on a screen
The QR at phone width inside the modal (220 px SVG on a white pad); the divider + orange `Undo` item in the Mark
menu; the dimmed undone line beside a long name (it is inside the truncating span — a long reason truncates with the
name, by design). For @Tanya on `sid` (after `db:migrate` ⇒ 44): mark a child attended ⇒ the menu now ends with `Undo
(back to planned)`; pick it, type `ab` ⇒ the server's 3..200 sentence under the field, the text stays; type a real
reason ⇒ the chip reads Planned, the name carries `· undone: <reason>`, the card's credit is back; on that Planned entry
the QR icon ⇒ a dialog with the code, the `…/checkin/camp?token=…` text, `Valid until …`; scan it on the day ⇒ the
public page reads *Check-in complete* with date · session · status, and *"Earlier mark undone: <reason>"*; scan again
⇒ *Already checked in*; a stale link ⇒ the clock icon with the server's expired sentence; on Settings, the row
`ส่งแจ้งเตือน LINE วันแคมป์ (08:15)` reads Off with the note *Reminder copy pending owner approval* under it, and
flipping it to On saves through the normal edit.
