# TASK-190: `hasRental` on the booking DTO — light up the cell's 5th toggle item (REQ-052) (scheduler-back)

- Source: TASK-142 Q1 (Fern). 🟢 **LOW** — the calendar cell's `rental` toggle item is inert because the booking DTO
  carries no rental marker. Not urgent; 142 ships without it (interim-inert). BE-only, no migration.
- Status: TODO → @Jason (BE)
- Repo: **smart-scheduler-back**.

## What & why
The re-cut fixed the cell's display toggle at **exactly five** (type · program · badge · note · rental). Four are
data-backed; `rental` renders nothing because `toBookingDTO` has no rental indicator (Fern grounded it: grep for rental
in the booking mapper/contract → nothing). Rentals already carry the booking as `refId`, so a per-booking "has a
rental" is derivable.

## Scope
- Add **`hasRental: boolean`** to the booking DTO (`toBookingDTO`, `db/mappers.ts` + `CourseSummary`/`BookingDTO` type
  in `contract.ts`) — true when a rental references this booking (`refId = booking.id`). Resolve it without an N+1 on
  `getCalendar` (a set of booking-ids-with-rentals for the range, then a lookup) — `getCalendar` already hydrates the
  week; fold the rental presence into that read.
- Keep it a **presence boolean**, not the rental detail — the cell only needs to show a marker (FE decides the glyph).

## DoD
- [ ] `booking.hasRental` is true iff a rental references that booking; false otherwise; present on the calendar path.
- [ ] No N+1 added to `getCalendar` (batch the rental lookup over the range).
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun test` green. No migration; no DB run by you.

## Notes
(Jason fills in. FE TASK-142 already has the toggle item + slot; it just needs the field to render a marker. Confirm
the FE booking type/mapper carries `hasRental` through — the response-mapper omission class has bitten this feature set
four times.)
