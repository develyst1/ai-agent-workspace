# TASK-457 — `REQ-105` FE: the group clash on the calendar (two colour states · the CLASH pair · the two resolution doors) + the camp day editor's per-coach windows + the kid count on the block — FE, M

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-24) · **Size M.** Against TASK-453's and TASK-454's contracts, both CONFIRMED and built. The REQ-105 slice (not the held batch). After TASK-455.

## §0 The contracts (final — both BE tasks are DONE and reviewed)
**Group (TASK-453, migration 55):** a GROUP row carries `slotYieldedAt`; a group session is **in clash** when it is yielded AND has ≥ 1 live seat — the server decides this, the FE never recomputes it (a `clash` fact rides the booking DTO; read it, do not derive it). Resolutions, one route each (`menu:calendar` + `action:calendar.booking-edit`), both one transaction:
- `POST /api/bookings/:id/resolve-clash/move` — moves the PRIVATE; on success the group takes its hour back. **It can fail with `409 SLOT_TAKEN` naming the new holder — and then the clash STANDS**: render the server's sentence and leave the state alone.
- `POST /api/bookings/:id/resolve-clash/swap-coach { teacherId }` — the group session moves to another coach and takes the hour there; the Private keeps the old coach. Same refusal shape.
Also: `headCount` may now be **null = uncapped**; a series may carry `groupClosedAt` (closed ⇒ no new dates, no enrolment).
**Camp (TASK-454, migration 54):** the day PATCH now takes `teachers: [{ teacherId, startTime?, endTime?, rateMinor? }]` — **hours omitted ⇒ the day's window** (do not send the day's values as if a coach had chosen them; that is what NULL is for). `teacherIds`/`teacherRates` still arrive as derived views **for one deploy only** — do not build on them. Overlapping windows and windows outside the day default are both allowed. `campKidCount` rides the camp block.

## §1
- **The grid:** a group block has **two colour states** — has-students / no-students (the DTO already knows the seat count). A block in CLASH wears the clash mark and so does the Private on the same hour: the two are a PAIR, and a reader must be able to see which coach-hour they are fighting over.
- **The two doors**, on the clash mark or the block's menu, each behind `action:calendar.booking-edit` (hidden, never disabled): *Move the private* (offer it FIRST — it is the owner's default) and *Swap the group's coach* (a coach picker). Every refusal is the server's sentence, verbatim, and **the page refetches only on 2xx** — a failed resolution must leave the clash exactly as it was.
- **The camp day editor:** each coach row gains **from / to** beside the rate, blank ⇒ the day's window shown as placeholder text (never sent as a value); the rate box stays behind key 59 as TASK-444 built it; send `teachers: [...]`, never the retired pair. A half-given window (one of from/to) is a 400 from the server — render it.
- **The kid count on the camp block** — read `campKidCount`; it is a DAY number and will read the same on every block of that date (the owner has approved exactly that; do not "fix" it per coach).
- Copy both languages, counted. 🚫 No client derivation of clash, of the cap, or of a coach's effective window.

## Definition of Done
- [ ] Suite, **count** · tsc · build ok · the two colour states + the clash pair by value · both doors by key and by body · the refusal leaves the state (pinned) · the camp `teachers[]` body by value (omitted hours stay omitted) · the kid count rendered · no client derivation (asserted) · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM · report here + `inbox/SA.md` + log.


---

## §2 ✅ IMPLEMENTED — Fern, 2026-09-24. **The clash pair on the grid with its two doors · the camp day's per-coach windows (`teachers[]`) · the day's kid count on the block.**

```
bunx tsc --noEmit → exit 0
bun test          →  568 pass / 4 fail   ⚠️ BASELINE on this tree = 551 / 4 (another hand's commits — TASK-450 §3); this slice adds +17 passing, 0 failing
bun run build     → ok
git status        →  13 source modified · 3 new (lib/scheduler/group-clash.ts · Modal/ClashResolveBox.tsx · lib/scheduler/group-clash.test.ts) · 5 pins moved
```
Built to §0 (TASK-453 + TASK-454, both DONE). No new key. 🚫 No deploy asked.

### `§1` — the clash
- **Pure (`lib/scheduler/group-clash.ts`), value-tested:** `isClash` = `group.clash`, the SERVER's verdict — a yielded
  group with seats but `clash: false` is NOT a clash here, and an older payload without the flag claims nothing
  (mutation 1 re-derives it and four tests fail). `groupTone` — the two colour states (**filled** / **empty**, a
  CANCELLED seat is not a child in the room — mutation 2) with **clash** outranking both. `seatCountLabel` and
  `seatsLabel` print a BARE count when `seatCap === null` (uncapped): no `n/?`, no `n/0` — neither is a thing the
  server said (mutation 3). `clashPartner` / `inClashPair` — the pair is coach + date + start (mutation 4 drops the
  hour and the whole day reads as clashing). `clashDoors`, `moveBody` (only the fields chosen — mutation 5),
  `moveReady`, `swapCoachBody`.
- **The grid:** both halves wear the **CLASH** mark — the group block from its own flag, the Private from
  `inClashPair` over the rows on screen (mutations 9, 10) — on the day grid and the week grid; the group block also
  carries its tone (`data-group-tone`, a hatched wash when empty, an orange ring in clash).
- **The two doors, ONE box (`ClashResolveBox`), on either half:** ① **Move the private** is rendered FIRST (the
  owner's default — mutation 8 hides it and the order pin fails) and sends the **PRIVATE's** id (mutation 6);
  ② **Swap the group's coach** sends the GROUP row's id. Both behind `action:calendar.booking-edit`, hidden never
  disabled. 🔴 **A refusal leaves the clash exactly as it was:** the server's sentence into an Alert and *nothing
  else* — no refetch, no `setMode(null)`, no optimistic redraw (mutation 7). The box finds its partner itself from
  the rows the modal already holds, so no new plumbing and no second source of "who is clashing".

### `§1` — the camp day
- **`teachers: [...]` is the body now** (TASK-454's shape); the retired `teacherIds`/`teacherRates` pair is never sent
  by this FE again (mutation 12). Each coach row gained **from / to** beside the rate; blank shows the DAY's window as
  placeholder text.
- 🔴 **A coach's hours ride only when CHANGED from the server's resolved values.** The server resolves a coach on the
  day default to the day's hours, so "his own 10:00" and "the day's 10:00" arrive identical — sending back what was
  read would freeze every coach onto today's window and a later week-level edit would silently not reach them
  (mutation 11). Equal ⇒ omitted, which is exactly what NULL means. A **half-given** window is sent as typed: the
  server's 400 is the answer, and inventing the other half would be a value nobody chose.
- The rate stays behind key 59 as TASK-444 built it, and a **masked** day sends no rate whatever the box holds
  (mutation 13). The day-level window fields are unchanged.
- **The kid count on the block:** `campKidCount` from the server, printed only when it is a number (mutation 14
  invents a `0`). ⚠️ **It is a DAY number — the same on every camp block of that date**, as the owner approved; it is
  not "fixed" per coach.

### 🔑 Break-and-watch — fourteen, `try/finally`, checksum, `BASELINE=0` in these suites
| # | mutation | result |
|---|---|---|
| 1 | the clash re-derived client-side (`yieldedAt` + seats) | **4 fail** |
| 2 | a cancelled seat counts as a child (tone) | **1 fail** |
| 3 | an uncapped group invents a denominator | **1 fail** |
| 4 | the pair ignores the hour (a whole day clashes) | **1 fail** |
| 5 | the move body sends every field, chosen or not | **1 fail** |
| 6 | move is sent with the GROUP row's id | **1 fail** |
| 7 | a refusal closes the form as if it had worked | **1 fail** |
| 8 | the swap door is offered first | **1 fail** |
| 9 | the mark shows only on the group half | **1 fail** |
| 10 | the day grid stops marking the pair | **1 fail** |
| 11 | a coach's window is copied down on write | **2 fail** |
| 12 | the roster rides as the retired pair again | **4 fail** |
| 13 | a masked rate rides anyway | **1 fail** |
| 14 | the camp block invents a kid count | **1 fail** |
`md5` identical on the six mutated files. Pins moved with their reason: the day PATCH's shape (`grid.test` ×2,
`camp-rate-credit` §1), the camp copy count 77 → 80, the action sweep 101/37 → 102/38 (the box's two doors).

### Definition of Done
- [x] **568 / 4** (baseline 551/4 — the four are not this slice) · `tsc` 0 · build ok
- [x] The two colour states + the clash pair by value · both doors by key and by body · the refusal leaves the state (pinned)
- [x] The camp `teachers[]` body by value (omitted hours stay omitted) · the kid count rendered · no client derivation (asserted)
- [x] 🔑 Break-and-watch — fourteen, `BASELINE=`, `finally`, checksum

### ⚠️ Not seen on a screen
For @Tanya on `sid` (after 54 + 55): book a Private into a group's hour ⇒ **both** cells wear an orange **CLASH** mark;
open either ⇒ the same box at the top naming the pair, with *Move the private* first; move it to a free hour ⇒ both
marks gone and the group holds its hour; try a taken hour ⇒ the server's sentence in the box and **the clash still
there, unchanged**; *Swap the group's coach* ⇒ the group moves, the Private keeps the coach. A group with no children
reads hatched; an uncapped group prints a bare seat count. Camp: edit a week ⇒ each coach has from/to (blank shows the
day's hours as grey placeholder); set one coach 12:00–15:00, save, reopen ⇒ only he moved; change the WEEK's window
afterwards ⇒ the untouched coaches follow it, he does not; a start with no end ⇒ the server's 400. A camp block on the
grid shows the day's kid count — the same number on every block of that date (expected).

---

# ✅ DONE — REVIEWED by @Sober (2026-09-24), with one finding that is NOT hers
Re-run by me: **568 pass / 4 fail** · tsc 0 · build ok. Her slice adds 17 passing tests and no failure.
What I am keeping from her work:
1. **`group.clash` is read, never re-derived** (a mutation that re-derives it fails four tests) — the server owns that judgement, as TASK-453 built it.
2. 🔴 **The camp body sends a coach's hours ONLY when changed from the server's RESOLVED values.** Sending back what was read would have frozen every coach onto today's window, and a later week-level edit would silently never reach them — the exact failure the NULL-means-default design exists to prevent. She saw it from the FE side; it is the same trap Jason flagged from the BE side, and both of them caught it independently.
3. A 409 on a resolution **renders the sentence and leaves the clash exactly as it was** — no refetch, no form reset.
🔴 **THE FINDING — the FE suite is RED at HEAD, and it is not from this slice.** I checked: stashing every uncommitted change leaves **556 pass / 12 fail**, so the failures predate the REQ-105 work. Four survive alongside her changes: three are copy-COUNT pins on the `users` dictionary (pinned 62, actually **63** in both languages — one key was added without moving the pins), and one is the §13.3 course-card behaviour pin (the card was restructured in `510e2e7` / `c8e9639`). ⇒ **TASK-458** cut. **Nothing from this slice goes to `sid` while the suite is red** — a red suite means the next real regression has nowhere to show.
