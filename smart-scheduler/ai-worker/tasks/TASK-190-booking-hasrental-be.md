# TASK-190: `hasRental` on the booking DTO — light up the cell's 5th toggle item (REQ-052) (scheduler-back)

- Source: TASK-142 Q1 (Fern). 🟢 **LOW** — the calendar cell's `rental` toggle item is inert because the booking DTO
  carries no rental marker. Not urgent; 142 ships without it (interim-inert). BE-only, no migration.
- Status: 🔴 **REDO on develop (Sober 2026-08-28)** — branch settled (dong≡develop); hasRental confirmed absent from develop BE (grep=0). Re-apply the TASK-190 change on develop → unblocks TASK-194. → @Jason
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

## Implementation Notes
**Files:** `services/scheduler.service.ts` (`bookingsWithRentals` + 3 call sites) · `db/mappers.ts`
(`toBookingDTO` takes `opts`) · `services/checkin.service.ts` · `types/contract.ts` ·
`db/mappers.test.ts` (+4) · `services/plan-session-row.test.ts` (+4).

**One query per read, never one per booking.** `bookingsWithRentals(ids)` returns a `Set`, resolved **before**
the mapping loop — a calendar week is ~90 bookings, so a per-booking lookup would be ~90 round trips to render
a grid that otherwise reads in three. There is a test asserting the call sits *before* the loop, not just that
it exists: "batched" is an ordering property, and a helper called from inside a loop would still pass a
presence check.

**🔴 A rental is identified by its PRODUCT CODE, not by the movement's reason.** Every sale posts
`reason = "SALE"`, so matching on reason would mark **every sold course** as having a rental. The join is
`bo.item.external_ref ∈ RENTAL_CODES`, and the codes come from `sale-items.ts` — a fifth rental code added
there is picked up here with no second list to update.

**Presence only, deliberately.** No code/hours/amount on the booking: the ledger already owns rental detail, and
a second home for it would drift the first time a rental was edited. There is a test asserting no
`rental*` field leaks onto the DTO.

**Every read path sets it, so the field can't be right in one place and wrong in another** — calendar, paged
list, single booking and check-in all resolve through the same helper. The one caller that doesn't is course
creation, and that is correct *by construction*: those bookings don't exist until the transaction returns them,
so nothing can have rented against them yet. That reason is in the code, not left as a bare default.

**📌 TASK-184's guard bit me, on this task.** I first anchored the new contract field on the wrong
`attendeeNote:` line and put `hasRental` on **`PlanSessionRow`** instead of `BookingDTO` — `tsc` failed
immediately with "Property 'hasRental' is missing". Before TASK-184 that would have compiled and shipped as a
plan session carrying a field nobody set. Worth recording that the guard caught its own author within a week.

**Verified:** `bunx --package typescript@5.6.3 tsc --noEmit` **0** · `bun test` **814 pass / 0 fail** (+8). No
migration. ⚠️ I ran nothing against a database, so the rental join is un-exercised against real rows.

**DoD:** `hasRental` true iff a rental references that booking ✅ · present on the calendar path (and every
other read path) ✅ · no N+1, asserted by ordering ✅ · tsc/test ✅.

### ⚠️ @Fern — the FE half is NOT done, and the task asked me to confirm it
`smart-scheduler-front/src/types/app/scheduler/index.ts` `Booking` has **no `hasRental`**, and its response
mapper therefore can't carry one. That is the same omission class TASK-187 just turned into a compile error —
so add it as a **required** field (like `nickname`/`badges`) and the guard will force the mapper to set it. The
BE field is live now; the cell's fifth toggle item stays inert until that lands.

## Review — ✅ PASS (Sober 2026-08-25)
Reproduced tsc 0 · `bun test` **814/0** (+8). `hasRental` is derived from the bo rental movements in **one batched
query** (`inArray(boMovement.refId, ids)` + `inArray(boItem.externalRef, RENTAL_CODES)` → a `Set`, `scheduler.service
.ts:407-416`), consumed via `rented.has(row.id)` in every calendar mapping path (`:387/:459/:764`) — **no N+1**, exactly
the ask. `toBookingDTO` takes it as an option defaulting `false` ("correct by construction, not omission", `:1321`).
On the wire contract (`contract.ts:180`). Cross-schema read of `bo.*` is read-only, which the ownership rule allows.
Clean. FE side carries nothing yet → **TASK-194** threads it + renders the marker (the cell's 5th toggle is inert until
then, as you noted).

## Rebuild 1 — 2026-08-28 (the branch-crisis casualty, restored)
This work was lost with the uncommitted tree; Porter's inventory confirmed `hasRental` was the lone BE
casualty. **Rebuilt on `develop` exactly as reviewed** — `bookingsWithRentals(ids)` returning a Set, resolved
before the mapping loop; the product-code join (`bo.item.external_ref ∈ RENTAL_CODES`, never the movement's
`reason`, which is `"SALE"` for every sale and would mark every sold course as rented); presence-only on the
DTO; all four read paths (calendar · paged list · single · check-in) through the one helper; course creation
keeping the `false` default by construction, with the reason at the site. Tests restored too, including the
**ordering** assertion — "batched" is an ordering property, and a helper called inside the loop would pass a
presence check.

**Verified:** tsc **0** · `bun test` **831 pass / 0 fail**.
⚠️ **@Fern — the FE half is still not done:** `smart-scheduler-front/src/types/app/scheduler/index.ts`
`Booking` has no `hasRental`, so its mapper can't carry one. Add it **required** (like `nickname`) and
TASK-187's guard forces the mapper to set it. TASK-194 is unblocked on the BE side as of now.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-190 | scheduler-back (BE): **REQ-052** — `hasRental` on the booking DTO so the calendar cell's 5th toggle item (rental) has data; batched over the range, no N+1. | SPEC-045 (REQ-052) | 🔎 **REVIEW — rebuilt 2026-08-28** (the lone BE casualty of the branch crisis; restored on `develop` exactly as reviewed, tsc 0 · **831/0**. _Original notes:_ (Jason 2026-08-25 — `bookingsWithRentals(ids)` returns a Set, resolved **before** the mapping loop; a test asserts the **ordering**, not just the call — "batched" is an ordering property and a helper called inside a loop would pass a presence check. 🔴 **A rental is identified by its PRODUCT CODE, not the movement's reason**: every sale posts `reason = "SALE"`, so matching on reason would mark **every sold course** as rented; the join is `bo.item.external_ref ∈ RENTAL_CODES`, straight from `sale-items.ts`, so a fifth code needs no second list. **Presence only** — no code/hours/amount on a booking (the ledger owns that; a second home drifts), asserted by a test that no `rental*` field leaks. All four read paths (calendar · paged list · single · check-in) use the one helper, so it can't be right in one place and wrong in another; course-creation keeps the `false` default **by construction** (the rows don't exist until its tx returns), with the reason in the code. 📌 **TASK-184's guard bit its own author**: I mis-anchored the contract field onto `PlanSessionRow` and tsc failed instantly — pre-184 that compiles and ships. tsc 0 · **814/0** (+8), no migration. ⚠️ **@Fern: the FE `Booking` type has NO `hasRental`** — add it **required** (like `nickname`) so TASK-187's guard forces the mapper; the cell stays inert until then.) | Sober | — |
```
