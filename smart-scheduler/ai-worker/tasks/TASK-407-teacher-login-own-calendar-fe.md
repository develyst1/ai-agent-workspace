# TASK-407 — Teacher login, own calendar (C-1 + C-2), FE: the teacher picker on Users · the scoped calendar and modal · `Report leave` (`REQ-097`, `SPEC-083`)

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-19) · **Size M + S.** Builds against TASK-406's contract once CONFIRMED (I paste the final lines into §0). ⏳ Pure parts now; wire after Jason's report. `sid`.

## §0 The contract — CONFIRMED 2026-09-19 (TASK-406; Jason's final lines land in his report)
Additions from the confirm: a scoped `GET /calendar` returns **only my teacher column** (my rows, my camp weeks); `/bookings` my rows; the leave response is `{ cancelled, bookingIds, familiesNotified }` — the family notice is a NEW server-side kind (placeholder words); `TEACHER_ALLOWED` = the exact read set the calendar page calls on load — **Jason takes it from YOUR client; keep the page's load calls to `/calendar`, `/bookings*`, `/teachers`, `/subjects`, `/settings` reads, `/me` — nothing that lists students/parents/courses** (those return 403 for a linked user).
- `/me` gains `teacherId: string | null` — **the server decides scope; the FE only reads the flag to shape the screen.** Out-of-scope rows never arrive (the calendar is filtered server-side; a by-id read of someone else's row is `404`).
- Users: `POST /users` / `PATCH /users/:id` accept `teacherId?: uuid | null` (super admin); `409 TEACHER_LINKED`; the users list carries `teacherId` + `teacherName`.
- A linked user: every calendar write except `attend` returns `403 SCOPE_TEACHER` (server-side; the doors are hidden by the flag, never disabled).
- `POST /teachers/me/leave { date, sessionIds?, reason }` under `action:calendar.teacher-leave` (55th) ⇒ `{ cancelled, bookingIds }` | `409 SESSION_DELIVERED` naming the session.
- Cancel reason `TEACHER_LEAVE` — TH `ครูลา` / EN `Teacher leave` — in the tray and the status labels.

## §1
- **Users page (super admin):** a `Teacher` picker on create/edit (searchable, the bookable teachers, "none" default); the list shows the linked teacher's name; `409 TEACHER_LINKED` as the server's sentence.
- **The calendar for a linked user:** the teacher filter collapses to me (no picker); the booking modal shows the details + `Check in` only — create / move / cancel / status doors ABSENT when `me.teacherId` is set (hidden, not disabled — the RBAC rule); the Bookings page and every other menu simply follow the role's grants as today.
- **`Report leave`** (by the 55th key, linked users only): a door on the calendar's day header ⇒ a dialog: the date (default today), my sessions that day ticked (un-tick to keep one), a reason (3–200, the server's bounds shown as its sentence), a one-line warning *"Families of the ticked sessions will be told; their make-ups are added by the system."* ⇒ ONE call; `409 SESSION_DELIVERED` names the session, ticks stay.
- The tray + status chips render `TEACHER_LEAVE` with the label (both languages).
- Snapshot 54 → 55 with the reason. Copy counted.
- 🚫 No client scope logic (the flag shapes doors; the server filters rows); 🚫 no second calendar.

## Definition of Done
- [ ] Suite, **count** · tsc · build ok · shapes asserted (the user body carries `teacherId`; the leave body; the doors absent under the flag; the 55th key gates the door) · 🔑 Break-and-watch, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.


---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-19. **The `Teacher` picker on Users · the scoped calendar (my columns from the payload, no pickers) and modal (`Check in` alone) · `Report leave` by the 55th key · `TEACHER_LEAVE` read on the tray, offered nowhere.**

```
bunx tsc --noEmit → exit 0
bun test          →  478 pass / 0 fail   (was 466; +12 — new lib/scheduler/teacher-scope.test.ts)
bun run build     → ok
git status        →  16 source files modified · 10 test files re-pinned · 3 new (lib/scheduler/teacher-scope.ts · Calendar/Modal/ReportLeaveDialog.tsx · teacher-scope.test.ts)
```
Built to §0 + @Jason's final lines in TASK-406 (2535/0, 45 = 45). **Snapshot 54 → 55** (`action:calendar.teacher-leave`,
in the calendar area after `group-series` — the BE's slot). 🚫 No deploy asked.

### 📌 Two things to confirm with @Jason (nothing blocks; both are stated assumptions)
1. **`GET /me` is not among the eight** allowed routes in his final list, yet it is how the page learns the flag at
   all (the nav, the guard and `useCan` read it on every page). I assume `/me` (and `/me/password`) sit BEFORE the
   scope guard, like the JWT guard itself. If not, a linked account cannot load any page — say so and I will hear it.
2. **The login body** seeds `/me` on the first paint (`menus`, `actions`); it has no `teacherId`, so the doors of a
   linked account show for ONE request until `/me` lands (the server refuses anything pressed in that window). If the
   login body carries `teacherId` as it carries `menus`, the seed reads it and the flash goes — a one-line FE change,
   Jason's call whether to add it.

### `§1` — what was built
- **ONE gate, extended, not a second one (`lib/rbac/actions.ts`):** `can(me, action)` now also requires — when
  `me.teacherId` is set — that the action is one of `TEACHER_SCOPE_ACTIONS = [calendar.status, calendar.teacher-leave]`,
  the FE mirror of the server's set (a linked SUPER ADMIN is scoped too, as on the BE). So every mutate door on every
  page hides for a linked account through the gate that already exists, with no per-site edits (value-tested over the
  full snapshot: a linked admin passes exactly the two; mutations 1, 2). `MenuAccess.teacherId`; `/me` + `teacherId`
  into the access object. 🚫 The FE decides nothing: the server's `403 SCOPE_TEACHER` is the rule, this only shapes.
- **Pure (`lib/scheduler/teacher-scope.ts`):** `isScoped(me)`; `columnTeacherIds(calendar)` — the teacher columns
  the payload came back with, first-seen order ("render what comes; no empty coaches" — no id comparison of my own;
  mutation 5); `leaveDefaultTicks` (every row but ATTENDED — the server's 409 if ticked; mutation 4); `leaveBody` —
  `sessionIds` rides ONLY for a strict subset (the whole day = the server's own set; mutation 3), reason trimmed,
  bounds the server's; `TEACHER_ALLOWED_ROUTES` = Jason's eight verbatim, for the walk.
- **🔴 The calendar page's load path = the allowed set, pinned:** the test lists the DATA hooks `CalendarContent`
  mounts before its `return` — exactly `useBadges · useCalendar · usePausedBookings · useTeachers` — and each hook's
  route by text: `GET /calendar` · `GET /badges` · `GET /bookings?status=PAUSED` · `GET /teachers` (+ its
  `GET /bookings` month read). A fifth hook (mutation 7 — a students list) fails the walk. The booking modal's VIEW
  (a click, not load) fetches only `useBadges` by itself; **`RentalSection` is NOT mounted under the flag** — it reads
  `GET /sellable-packages`, outside the set (mutation 11). `CancelBookingDialog` (`posted-sale`) never opens: its door
  is gone. **So the list Jason pinned and this page are the same list** — TASK-406 Q4 answered on the FE side.
- **The calendar for a linked account:** the columns = `columnTeacherIds(calendar)` (the payload's), the teacher and
  type pickers do not render (mutation 8; the student search and badge filter stay — they filter what came), the
  `+` on an empty cell is gone through `calendar.book` (already gated in both grids). **The modal:** `canAttend =
  can(calendar.status)` keeps `Check in`; `canStatus = canAttend && !scoped` is what confirm · sick leave · cancel and
  the ⋯ menu read — absent, never disabled (mutations 9, 10; the walk pins no `disabled={…scoped`). Badges, rental,
  move, overbook, pause, the OTHER/GROUP doors: all hidden by the gate.
- **`Report leave`** (`CalendarHeader`, beside `Today`; `canReportLeave = scoped && can(teacher-leave)` — linked
  holders only, mutation 6) ⇒ `ReportLeaveDialog`: the date (default the calendar's date), MY sessions that day from
  `useCalendar(date, "day")` (the scoped calendar — allowed; nothing else fetched, asserted), ticked by
  `leaveDefaultTicks`, un-tick to keep one; a reason (presence only — mutation 13, a client 3..200, fails); the
  warning line *"Families of the ticked sessions will be told; their make-ups are added by the system."*; ONE
  `POST /teachers/me/leave` with `leaveBody(...)` (mutations 12, 18); the toast reads the server's `cancelled` and
  `familiesNotified`; a refusal (`409 SESSION_DELIVERED` naming the time, the bounds) is the sentence in the dialog,
  ticks and text stay. The calendar and bookings re-read.
- **Users (super admin):** a `Teacher` picker (searchable, the bookable teachers from `GET /teachers`, "None (staff
  account)" default, with the hint of what a link means) on CREATE and EDIT; `teacherId` rides on create only when
  picked, on edit only when CHANGED — **null clears** (mutations 14, 15); `409 TEACHER_LINKED` is the server's
  sentence in the dialog as every refusal there. The row shows `Teacher: <name>` under the display name (a teal
  line, no new column — the table already has nine). `UserDTO` + `teacherId`, `teacherName`.
- **`TEACHER_LEAVE`:** `CANCEL_REASON_CODES` = the three admin reasons + `TEACHER_LEAVE` — a READ set; the tray's
  `cancelReasonDisplay` reads it (`endCourse.TEACHER_LEAVE` — EN `Teacher leave` / TH `ครูลา`; mutation 16). The
  dialogs keep `END_COURSE_REASONS` (three) — `CancelBookingDialog` and `EndCourseDialog` are asserted to hold no
  `TEACHER_LEAVE` (mutation 17). The status chips are unchanged: the reason is a tray label, the status is CANCELLED.
- **Copy:** `teacherLeave` 10 · `users` +4 · `endCourse.TEACHER_LEAVE` — both languages, counted.

### 🔑 Break-and-watch — eighteen mutations, each in `try/finally`, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | the gate ignores the flag | **1 fail** |
| 2 | the gate lets `calendar.book` through under the flag | **1 fail** |
| 3 | the leave body always sends `sessionIds` | **1 fail** |
| 4 | the default ticks include an ATTENDED row | **1 fail** |
| 5 | the columns compare against my own id | **1 fail** |
| 6 | `Report leave` for any holder of the key (unlinked too) | **1 fail** |
| 7 | the page mounts a students list on load | **1 fail** |
| 8 | the teacher picker stays under the flag | **1 fail** |
| 9 | the modal keeps confirm under the flag | **2 fail** |
| 10 | `Check in` goes with the rest | **1 fail** |
| 11 | the rental section mounts under the flag | **1 fail** |
| 12 | the dialog sends a body of its own | **1 fail** |
| 13 | the dialog copies 3..200 | **1 fail** |
| 14 | the edit never clears the link | **1 fail** |
| 15 | the service drops `teacherId` on PATCH | **1 fail** |
| 16 | the tray cannot label `TEACHER_LEAVE` | **1 fail** |
| 17 | the cancel dialog offers `TEACHER_LEAVE` | **1 fail** |
| 18 | the leave posts to another route | **1 fail** |
None slipped. `md5` identical on all eleven mutated files. Pins moved with the reason: the snapshot 54 → 55 in six
tests, the sweep 86 → 87 / 33 → 34 files (the `Report leave` door), `users` keys 58 → 62 in four tests, the `/me`
type line (+ `teacherId`), the modal's status shape (`canStatus = can(...)` → `canAttend` + `canStatus = canAttend && !scoped`).

### Definition of Done
- [x] **478 / 0** · `tsc` 0 · build ok
- [x] Shapes asserted: the user body carries `teacherId` (create by presence, edit by change, null clears) · the leave body (`sessionIds` only for a subset) · the doors absent under the flag (the gate by value over the whole snapshot; the modal's shape; no `disabled`) · the 55th key gates the door, linked only · **the load path = the allowed set, walked**
- [x] Copy counted, both languages · 55 = 55 (by position, Jason's slot)
- [x] 🔑 Break-and-watch — eighteen, `finally`, checksum

### ⚠️ Not seen on a screen
The one-column calendar (a single teacher column across the week grid's 1210 px minimum — it will be one wide
column; if the owner wants it narrower that is a layout task); the orange `Report leave` beside `Today` at phone
width; the teal `Teacher:` line in the Users table. For @Tanya on `sid` (after `db:migrate` ⇒ 45; the super admin
creates the "Teacher" role with `menu:calendar` + `calendar.status` + `calendar.teacher-leave`): Users ⇒ create
`kru-a` with Teacher = A ⇒ the row reads `Teacher: A`; a second user with Teacher = A ⇒ the `ครูคนนี้มีบัญชีแล้ว`
sentence; edit `kru-a`, clear the picker, save ⇒ the line goes. Log in as `kru-a` ⇒ the calendar shows ONLY A's
column, no teacher/type pickers, no `+` on empty cells, the Bookings menu absent (the role); open A's session ⇒ the
details, badges read-only, `Close` and `Check in` only — no confirm, no ⋯; `Check in` ⇒ ATTENDED. `Report leave` ⇒
today's sessions of A ticked, an ATTENDED one un-ticked; un-tick one more, type `ok` ⇒ the server's bounds sentence,
ticks stay; a real reason ⇒ `n sessions cancelled · n families told`, the rows show CANCELLED with `ครูลา` in the
cancelled tray (toggle it on); as an admin, cancel a 1HR session ⇒ the reason list still has three, no `ครูลา`.
