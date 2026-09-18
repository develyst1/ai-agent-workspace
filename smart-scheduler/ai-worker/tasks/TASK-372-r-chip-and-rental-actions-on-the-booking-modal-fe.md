# TASK-372 — The `R` chip (red unpaid → green paid) beside `Last`, and the rental actions on the booking modal (`REQ-091` Deploy A, T2) — FE

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-17)
**Owner rulings (`REQ-091 §6`/`§9`):** `R` on the grid cell — RED = unpaid, GREEN = paid — "like the `Last` chip"; tiers fixed `50 Helmet or Pad · 100 Helmet + Pad · 150 Ride only · 200 Full Set`; Full Set / inline ⇒ remark required, printed `Rent 200 / Full Set (inline skate size 18-19 CM)`; historic rentals (posted before this) show no `R`.
**Contract (proposed to @Jason, TASK-371; confirmation/corrections reach you through me):** booking DTO gains `rental: { code, remark, paid } | null` (replaces `hasRental`, which had no reader); `POST /bookings/:id/rental { code, remark? }` (row, unpaid; `400 RENTAL_REMARK_REQUIRED` for set/ride without remark; `409 RENTAL_EXISTS`; `409 BOOKING_NOT_LIVE`) · `POST /bookings/:id/rental/paid` (posts the money, `paid: true`; idempotent) · `DELETE /bookings/:id/rental` (unpaid only; `409 RENTAL_PAID`). Codes: `rental-set 200 · rental-ride 150 · rental-helmet 50 · rental-pads 50 · rental-helmet-pads 100`.
**Size M.** ⛔ Chain stopped. Ships with TASK-371.

---

## §1 The chip
- **`RentalStamp` beside `LastStamp` in `BookingCellBody`** — one component, both grids, the name row; renders only when `booking.rental` is non-null: **`R` on RED when `paid === false`, on GREEN when `true`** (solid, high-contrast like `Last`; not pastel). Not gated by the display toggles. Legend: both states with their explanation (`rental — unpaid / paid`, TH equivalents).
- The mapper: `rental: dto.rental ?? null` (value-asserted; a payload without the key ⇒ `null`); `hasRental` removed from the types with TASK-371.
- 🚫 No client-side derivation; nothing from the ledger.

## §2 The modal
- `BookingModal`: a **Rental** section — when `null`: **`Add rental`** ⇒ tier `Select` (the five, label = the customer's words + price: `Full Set — 200`) + `remark` (required for set/ride, the server's rule; show its sentence on `400`) ⇒ `POST`. When present: the line `Rent {price} / {tier} ({remark})` in the customer's print shape, the chip's state, and **`Mark paid`** (two taps — it posts money) ⇒ `POST …/paid`; **`Remove`** only while unpaid.
- **The existing `RentalModal` (standalone `POST /rentals` with hours + discount) stays for the standalone/walk-in sale as today** — ❓ say where it is reachable and whether it should now be reached ONLY from the booking's Rental section; do not remove it.
- Invalidate the calendar + the booking on every action (the same keys the pause/resume actions use).

## Definition of Done
- [ ] Suite, **count** · tsc · build ok
- [ ] Chip: `null` ⇒ nothing; unpaid ⇒ red `R`; paid ⇒ green `R`; both grids; legend — rendered assertions
- [ ] Modal: add (remark rule = the server's sentence) · mark paid two taps · remove only unpaid — request shapes asserted
- [ ] Keys counted, both languages; the print shape `Rent 200 / Full Set (…)` asserted
- [ ] 🔑 Break-and-watch, `finally`, CHECKSUM

## Question — ⚠️ to the OWNER'S LIST
❓ On a crowded week cell `Last` + `R` + the branch badge compete for the name row — which truncates first? Say the order; build the simplest.

---

## §3 ✅ IMPLEMENTED — Fern, 2026-09-17. **The `R` chip beside `Last` (red unpaid → green paid), and a Rental section on the booking modal: add · mark paid (two taps) · remove while unpaid. Every rule the server's.**

```
bunx tsc --noEmit → exit 0
bun test          →  377 pass / 0 fail   (was 368; +9 — new lib/scheduler/rental-row.test.ts; one TASK-367 pin re-anchored)
bun run build     → ok
git status        →  13 modified · 2 new (Calendar/Modal/RentalSection.tsx · lib/scheduler/rental-row.test.ts)
```
Built against @Jason's CONFIRMED contract (BE done, 2233/0), his line verbatim: `POST /bookings/:id/rental { code,
remark? }` 201 · `POST …/rental/paid` 200 · `DELETE …/rental` 200 `{ removed: true }`; refusals as named codes;
`rental: { code, remark, paid } | null` on every DTO; `hasRental` gone; five codes, `rental-helmet-pads` = 100.

### `§1` — the chip
- **`RentalStamp`** in `BookingCellBody.tsx` beside `LastStamp` — one component, both grids on the name row right after
  `Last`, not gated by the display toggles. Renders **only from `booking.rental`**: `null` ⇒ nothing (a historic rental
  posted before the row existed has no row ⇒ no chip, the owner's ruling by construction); `paid: false` ⇒ **`R` on
  solid `bg-red-600`**; `paid: true` ⇒ **`R` on solid `bg-green-700`**; white bold uppercase, 10 px day / 9 px week.
  Rendered-asserted for all three states (the null case byte-identical to an empty tree); the chip's region asserted
  free of `ledger|sale|priceMinor|paid_at|report`. Mutations 1 (colours swapped) and 2 (a chip on any course row) fail.
- **Legend:** both chips with `rental — unpaid` / `rental — paid` (TH equivalents), the same classes as the cell.
- **The wire → type → mapper:** `BookingDTO.rental?: {…} | null` (this repo's claim, Jason's note beside it) →
  `Booking.rental?: BookingRental | null` → `dtoToBooking`: `rental: dto.rental ?? null` (value-asserted; mutation 7 —
  the mapper dropping the row — fails). `hasRental` was never on this side except in one comment; asserted absent
  from the mapper, the types and the cell body. `RENTAL_CODES` gained the fifth code and is now in the customer's
  price ladder order (50 · 50 · 100 · 150 · 200).

### `§2` — the modal
- **`RentalSection.tsx`** (new, ~170 lines), mounted in `ViewBooking` under the notes, above the badges — the same
  place a session's facts live. Three states:
  - **no row** ⇒ `Add rental` (the existing `rental.addonBtn` key) ⇒ a tier `Select` over the five codes, labels
    **`{tier} — {price}`** (`Full Set — 200`; the tier WORDS are the customer's — `Helmet · Pad · Helmet + Pad · Ride
    only · Full Set`; the price is the server's `rentalItems`, the same source `RentalModal` reads, never a second FE
    copy) + a `remark` field with the hint *which pair / which size — required for Full Set and Ride only* ⇒
    `POST` with `{ code, remark? }` — **the remark rides only when typed; whether the tier REQUIRES one is the
    server's answer** (`400 RENTAL_REMARK_REQUIRED` ⇒ its sentence in the section's Alert). No tier check on this
    side — asserted; mutation 4 (a client remark rule) fails.
  - **a row, unpaid** ⇒ the print line **`Rent 200 / Full Set (inline skate size 18-19 CM)`** — the customer's shape,
    value-asserted via `rentalPrintLine` — + `· unpaid` in red, and two buttons: green **`Mark paid`** and a subtle red
    **`Remove`**.
  - **a row, paid** ⇒ the line + `· paid` in green, **no buttons** — remove is offered only while unpaid (the server
    refuses a paid row either way); asserted; mutation 5 (buttons on a paid row) fails.
- **Mark paid is TWO taps:** the button, then the app's own `useConfirm` dialog naming the line that will be posted
  (*"This posts Rent 200 / Full Set (…) to today's sales. It cannot be undone from here."*) with a green *Yes, paid*.
  Asserted as the GATE (`if (!(await askConfirm(…` shape, no short-circuit in front, the money call only after it) —
  📌 the first pin let a `false &&` through; tightened before reporting; mutation 3 now fails.
- **Refusals** are the server's sentence in the section's Alert. **`502 RENTAL_NOT_POSTED`** lands in the same catch:
  the row is still unpaid (the query set is invalidated, the DTO says so), the button is still live — the press is
  simply retried. Nothing is disabled client-side on a failure.
- **Three services, three hooks** — `recordBookingRental` / `payBookingRental` / `removeBookingRental`, each one call,
  no rule; the hooks invalidate **`invalidateAll` — the same set pause/resume use** (bookings · calendar · courses ·
  report · teachers · vouchers), so the chip on the grid, the row in the tray, the single read and the day's report all
  refresh. Asserted; request shapes asserted (`{ code, ...(remark ? { remark } : {}) }` — mutation 6, remark always
  sent, fails; `/paid` with `{}`; `DELETE`).
- ❓ **`RentalModal` — where it is reachable, and what I did:** it was reachable from TWO places — the Bookings page's
  **`Record rental`** (the walk-in / standalone sale, `POST /rentals` with hours + discount, no `refId`) and the
  booking modal's **⋯ → `Add rental`** (the same modal with `refId = booking.id` — REQ-028's per-session add-on, which
  posted money immediately). **I removed the second door and kept the first.** With the Rental section on the modal,
  the ⋯ item was a second way to attach a rental to the SAME session — one that posts money on the spot, bypasses
  the row, the remark and the paid press, and would collide with them on the ledger key (`rental:<bookingId>:<code>`).
  The standalone modal is untouched and still the walk-in door on the Bookings page. ⚠️ **If you want the ⋯ door
  kept as a shortcut, it is one menu item to restore — say so.** Asserted: the modal mounts `RentalSection` and
  contains no `RentalModal`; `BookingsContent` still mounts `<RentalModal`; the file is untouched.
- 📌 **A pin moved that was not mine:** the owner's colour pass (`ed4fd47`, item 6) put `{displayName}` on its own
  line in both grids, which broke TASK-367's name-row pin at the moment I touched the row. Re-anchored with
  whitespace tolerance and the reason beside it — the pin is the same claim.
- Copy: **`calendar.rentalStamp` = `R` both languages + 2 legend keys; `rental.*`: 1 item label (`itemRental-helmet-pads`),
  `section`, 5 `tier.*`, `tierLabel`, `remark`, `remarkHint`, `save`, `printLine`, `paidState`, `unpaidState`,
  `markPaid`, `markPaidTitle`, `markPaidBody`, `markPaidConfirm`, `remove`, `paidOk`, `savedOk`, `removedOk` — 23 keys
  × 2 = 46 strings, both languages; `printLine` is `Rent {price} / {tier}` in both (the customer's print shape).**

### 🔑 Break-and-watch — eight mutations, each in `try/finally`, restored by checksum
| # | mutation | result |
|---|---|---|
| 1 | the chip colours swapped | **1 fail** |
| 2 | a chip on every course row (ignoring the flag) | **1 fail** |
| 3 | mark paid on ONE tap (`false && askConfirm`) | **1 fail** *(after tightening)* |
| 4 | a client-side remark rule before the call | **1 fail** |
| 5 | remove/paid buttons shown on a paid row | **1 fail** |
| 6 | the remark always sent (`remark: undefined`) | **1 fail** |
| 7 | the mapper drops the row | **1 fail** |
| 8 | the week grid drops the chip | **1 fail** |
`md5` identical on all five mutated files.

### Definition of Done
- [x] **377 / 0** · `tsc` 0 · build ok
- [x] Chip: null ⇒ nothing · unpaid red · paid green · both grids · legend — rendered assertions
- [x] Modal: add (remark rule = the server's sentence) · mark paid two taps · remove only unpaid — request shapes asserted
- [x] Keys counted (23 × 2); the print shape `Rent 200 / Full Set (…)` asserted
- [x] 🔑 Break-and-watch — eight, `finally`, checksum

### ⚠️ Not seen on a screen
The red/green chips beside `Last` and a branch badge on a real week cell; the confirm dialog's green button; the
five-tier Select with prices — the fifth price appears only once `sale:ensure-items` has run on that box (until
then its label reads `Helmet + Pad — —`, and a paid press on it is the `502` the contract names). For @Tanya via
you on `sid`, after the BE deploy order (migrate → `sale:ensure-items` → restart): add a Full Set without a remark
⇒ the server's sentence; with one ⇒ the row, red `R` on the grid, the print line; Mark paid ⇒ confirm ⇒ green `R`,
the day's report gains the sale; Remove ⇒ gone only while unpaid; a cancelled session with a paid row ⇒ green in the
cancelled tray.

## Question — **on a crowded week cell, `Last` + `R` + the branch badge compete for the name row: which truncates first?** ⚠️ owner's list
**The NAME, first and only.** The row is `flex min-w-0 items-center gap-1.5`: the dot, the time, the `Last` chip, the
`R` chip and the badge group are all **`shrink-0`**; the name is the one **`min-w-0 flex-1 truncate`** item. So as the
cell narrows the name loses characters to an ellipsis and can reach zero; the chips never shrink. The badge group is
`flex-wrap`, so several badges STACK (the row grows taller), they do not squeeze. Past the point where the fixed
items alone exceed the width, the week chip has no `overflow-hidden` — the row would overflow the chip's edge (the day
card has `overflow-hidden` and clips instead). **The order, then: name → (nothing else gives) → overflow.** *Why that
is the right default:* `Last` and `R` are the two facts an admin acts on this week (sell the next course; collect the
rental), and the name is recoverable by a tap. **Built the simplest — nothing changed on the row.** If the owner sees
a cell where the chips push past the edge, the cheapest lever is `overflow-hidden` on the week chip (one class),
then `size="sm"` chips are already the smallest. Named, not built.
