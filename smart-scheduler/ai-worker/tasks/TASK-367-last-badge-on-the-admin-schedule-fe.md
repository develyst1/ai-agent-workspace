# TASK-367 — `Last` badge on the admin schedule — FE (`REQ-089 item 5`)

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-16)
**Owner's words (`REQ-089 §2`):** *"แปะบนตารางว่า Last เห็นชัดๆ แปะๆ ไว้"* — stuck on the schedule, obvious.
**Contract (proposed to @Jason, TASK-366; confirmation/correction reaches you through me):** every calendar booking carries **`courseLast: boolean`** — `true` only on the live `COURSE_PACKAGE` row that is its course's last session.
**Size S.** ⛔ Chain stopped. Ships with TASK-366.

---

## §1 The badge
- On the calendar cell (`CalendarGrid` / `CalendarWeekGrid` — the cell renderer, ONE place) when `courseLast` is true: a **`Last`** badge — high-contrast, not pastel (the customer's colour complaint is item 6 and not ours, but this badge must not inherit that problem), visible at the cell's smallest size (week and month views both). Text `Last` in BOTH languages? — ❓ the owner wrote it in English; TH parents never see the admin schedule. **Render `Last` in EN and `ครั้งสุดท้าย`… no: keep the owner's word `Last` in both languages** — it is a stamp he named, not a sentence; one key, same value, so the rule "a label follows `lang`" is honoured by the key existing.
- The legend bar (`CalendarLegendBar.tsx`) gains the badge, same key.
- 🚫 No client-side derivation of "last" from the visible rows — the flag is the server's (the visible range never has the whole course). Assert by absence.

## §2 Not this task
🚫 Any LINE message · 🚫 the dashboard colours (item 6, owner's team) · 🚫 the parent-facing pages.

## Definition of Done
- [ ] Suite, **count** · tsc · build ok
- [ ] Badge renders from `courseLast` only; legend entry; both views
- [ ] 🚫 asserted: no `last`/`endDate` computation from rows in the cell path
- [ ] 🔑 Break-and-watch, `finally`, CHECKSUM

## Question — ⚠️ to the OWNER'S LIST
❓ Should the badge also carry a tap-through — "sell the next course" — or is the stamp enough? Say what the cell's tap does today; build the stamp only.

---

## §3 ✅ IMPLEMENTED — Fern, 2026-09-16. **A `Last` stamp on the cell's name row, both views, from the server's flag and nothing else.**

```
bunx tsc --noEmit → exit 0
bun test          →  357 pass / 0 fail   (was 351; +6 — new lib/scheduler/last-stamp.test.ts)
bun run build     → ok
git status        →  8 modified (BookingCellBody · CalendarGrid · CalendarWeekGrid · CalendarLegendBar · mappers ·
                     dictionaries · contract.ts · types/scheduler) · 1 new (the test)
```
Built against @Jason's CONFIRMED contract (BE done, 2184/0): `courseLast: boolean`, computed on `GET /calendar` and
the single-booking read, `false` on the `/bookings` list and mutation returns — the `hasRental` shape. Read only on
the calendar. 🚫 No LINE message · no dashboard colour · nothing parent-facing.

### `§1` — the badge
- **The wire → the type → the mapper:** `BookingDTO.courseLast?: boolean` (this repo's CLAIM of TASK-366, with
  Jason's computed-where note beside it) → `Booking.courseLast?` → `dtoToBooking`: **`courseLast: dto.courseLast ===
  true`** — a strict boolean, so a list/create payload without the field maps to `false`, never `undefined`, and a
  non-boolean never truthy-slips (value-asserted; mutation 3 fails).
- **ONE component — `LastStamp` in `BookingCellBody.tsx`**, beside `BookingTypeStripe` and `SharedTeachersMarker`,
  the two other shared cell parts both grids already use. It renders **only when `booking.courseLast === true`**,
  else `null`. **High-contrast on purpose:** a solid `bg-neutral-900 text-white` chip, bold, uppercase — not a
  pastel tint (the item-6 complaint is not inherited); `md` on the day card, `sm` (9 px) on the week chip. **Not
  gated by the `CellDisplay` toggles** — it shows even with every other channel switched off. Rendered-asserted:
  `courseLast: true` ⇒ `>Last<` in the HTML with the dark classes; `false`/absent ⇒ byte-identical to an empty tree.
- **Both views place it on the NAME ROW right after `displayName`**, before the branch badge — the top line, where a
  primary mark belongs (the same reasoning the branch badge already documents). Asserted on both grids, and that
  the stamp line carries no `display.`; mutations 4 (week drops it) and 5 (week gates it on `display.badge`) fail.
- **The legend** (`CalendarLegendBar`) gains the same chip — literally the same classes and `calendar.lastStamp`
  key — followed by `calendar.lastLegend` (*"last session of the course"* / *"คาบสุดท้ายของคอร์ส"*), so the legend IS
  the sample. Mutation 7 fails.
- **The word:** `calendar.lastStamp = "Last"` in BOTH languages — the owner's stamp, a word he named, not a
  sentence; the key exists so the label rule is honoured, and the explanation beside it follows `lang`. 2 keys × 2.
- 🚫 **No client-side "last":** asserted by a walk of every non-test file — **the only assignment to `courseLast`
  in `src` is the mapper's pass-through** — and by absence in the stamp and both grids (`isLast|lastSession|endDate|
  sessions.at(-1)|course.size|usedSessions`). Mutations 1 (stamp every course row) and 2 (derive from `EXTENDED`) fail.

### 🔑 Break-and-watch — seven mutations, each in `try/finally`, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | stamp every `COURSE_PACKAGE` row (ignore the flag) | **2 fail** |
| 2 | the stamp derives "last" from `status === EXTENDED` | **1 fail** |
| 3 | the mapper passes the raw value (`?? undefined`) | **2 fail** |
| 4 | the week grid drops the stamp | **1 fail** |
| 5 | the week grid gates it on `display.badge` | **1 fail** |
| 6 | pastel (`bg-blue-50 text-blue-400`) | **1 fail** |
| 7 | the legend explanation removed | **1 fail** |
`md5` identical on all four mutated files.

### Definition of Done
- [x] **357 / 0** · `tsc` 0 · build ok
- [x] Badge renders from `courseLast` only (rendered + mapper) · legend entry · both views — asserted
- [x] 🚫 no `last`/`endDate` computation in the cell path — asserted by walk and by absence
- [x] 🔑 Break-and-watch — seven, `finally`, checksum

### ⚠️ Not seen on a screen
The 9-px chip on a crowded week cell next to a branch badge (both `shrink-0`, the name truncates first — the AC-3
order); and the real `courseLast` on `sid` once the BE is deployed. For @Tanya via you: a live course's last session
shows the black `Last` chip in week AND day view; attend it ⇒ the chip is gone (the server's flag, not ours); the
legend shows the same chip with its explanation.

## Question — **should the badge carry a tap-through — "sell the next course" — or is the stamp enough?** ⚠️ owner's list
**What the cell's tap does today:** the whole cell is one `<button onClick={() => onSelectBooking(booking)}>` —
it opens `BookingModal` on that booking (view/actions: confirm, attend, leave, pause, move, cancel, rental, badges).
The stamp is inside that button, so **tapping the stamp already opens the booking** — there is no separate target
and I did not add one. **What is missing for "sell the next course":** the booking modal has no "new course for this
student" action — creating a course starts on the Bookings page (`CreatePlanFlow`), with the student picked there.
So a tap-through today would be a navigation (*Bookings → new course, student pre-filled*), not a button that
exists. **My reading:** the stamp is enough for item 5 as the owner worded it (*"แปะ … เห็นชัดๆ"* — a mark, not a
flow); a *"next course"* action belongs in the booking modal beside Pause/Resume, pre-filling the student and the
program — one task, and it would serve every last session, stamped or not. 🚫 Stamp only, built.
