# TASK-171: Expose the captured discount on the booking DTO (REQ-063 req 8 / AC-10) (scheduler-back)

- Source: REQ-063 — from the TASK-170 review (Fern's Q1). Unblocks TASK-170 Part 2 (display).
- Status: REVIEW (Jason 2026-08-23). Next step: @Sober
- Assignee: @Jason (BE)
- Repo: **smart-scheduler-back**. Small, same shape as TASK-164. Read-path only, no migration (columns exist).

## Why
The booking columns exist (`bookings.discount_kind/value/reason/actor`, `schema.ts:341-348`) but `db/mappers.ts`'s
booking DTO maps **none** of them, so the FE has no discount to render on the record (creation + ATTENDED view).
Req 8 / AC-10 require who/what/why to be answerable, and a value only in the DB doesn't satisfy that.

## What to build
Add `discount: { kind, value, reason, actor } | null` to the booking DTO (`db/mappers.ts` + the contract type), from
the four existing columns; `null` when `discount_kind` is null. `value` is the **human** number per TASK-168's
contract (percent, or whole baht) — travel it as stored; the FE formats. Typed through `AppType`.

## Definition of Done
- [ ] A booking with a stored discount returns `discount: {kind, value, reason, actor}`; one without returns `null`.
- [ ] Existing booking DTO fields unchanged (regression); typed via `AppType` so the FE sees it.
- [ ] `bunx tsc --noEmit` 0 · `bun test` green.

## Review
**PASS ✅ (SA-reviewed Sober 2026-08-23).** Reproduced: `bunx tsc --noEmit` **0** · `bun test` **702/0** (+4).
`toBookingDTO` (`db/mappers.ts:117`) maps `discount: b.discountKind ? {kind, value, reason, actor} : null` —
**null-or-whole-object** (absent ≠ empty), and **`value` travels as stored** (the human number, no second wire
conversion — deliberately not re-introducing the satang bug's shape). `actor` carried for audit; card-display is
Fern's Part 2 call, as I noted. Jason **checked all five `toBookingDTO` call-sites feed whole rows** so no endpoint
serves a booking without its discount — that diligence is exactly the TASK-170 lesson (a field on the type, missing
from the wire, nothing failing) applied. Tests assert shape **and** unit (391⇒391 not 39100) + a field-for-field
regression. **DONE — TASK-170 Part 2 is unblocked; the FE reads `booking.discount` directly.**

## Notes / Questions
(Jason fills in. SA note on `actor` display, for Fern's Part 2: **carry `actor` in the DTO for the record/audit, but
the FE card should show amount + reason only for now** — with one shared login today `actor` is the same name for
everyone, and a meaningless "who" on screen is worse than none. Show `actor` on the card when per-person logins exist.
"Who" stays answerable via the stored column meanwhile.)

## Implementation Notes
**Files:** `db/mappers.ts` (`toBookingDTO`) · `types/contract.ts` (`BookingDiscount` + the field) ·
`db/mappers.test.ts` (+4).

`discount` is **`null` or a whole object** — never a partly-filled one. An absent discount and a discount of
nothing must not look alike on the card, and `null` is the only shape that makes that impossible to get wrong.

**`value` travels exactly as stored — the human number** (percent, or whole baht per TASK-168). I deliberately
did **not** convert to satang on the way out: that would put a second unit conversion on the wire, which is the
precise shape of the bug this feature has already produced once this week.

**`actor` is carried, and I did not display-gate it here.** Per your note the FE shows amount + reason only for
now; that is the FE's decision to make, and the DTO's job is to keep "who" answerable. If it were dropped from
the DTO instead, restoring it later would be a BE change on the critical path of a feature nobody would be
looking at.

**Checked the read paths rather than assuming:** all five `toBookingDTO` call sites feed it whole booking rows
(`db.select({ b: bookings, … })` selects the entire table; the rest are `findMany`), so no endpoint silently
serves a booking without its discount.

**The tests assert the DTO's actual shape, including the unit** — `discountValue: 391` ⇒ `value: 391`, not
39100 — plus a regression test that every other field is byte-identical with and without a discount. Both bugs
this feature has produced were type-clean and screen-plausible; only a shape assertion catches that class, which
is the same argument as Fern's TASK-172.

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **702 pass / 0 fail** (+4). No migration (`0020`'s columns).
I ran nothing against a database.

**DoD:** discount present ⇒ full object; absent ⇒ `null` ✅ · other DTO fields unchanged, asserted ✅ · typed via
`AppType` (the contract carries `BookingDiscount`) ✅ · tsc/test green ✅.
**@Fern — this is on the wire; Part 2 can read `booking.discount` directly.**

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-171 | scheduler-back (BE): **REQ-063 req8/AC-10** — expose `discount:{kind,value,reason,actor}|null` on the booking DTO (`db/mappers.ts` + contract) from the existing `bookings.discount_*` columns; no migration. Unblocks TASK-170 Part 2 (display). SA note: FE card shows amount+reason only for now (one shared login ⇒ actor is noise; carry it in DTO for audit). | REQ-063 | ✅ **DONE (SA-reviewed Sober 2026-08-23)** — tsc 0 · 702/0 (+4). `toBookingDTO` maps `discount: kind ? {kind,value,reason,actor} : null` — null-or-whole-object, value travels as stored (no 2nd wire conversion), all 5 call-sites verified feeding whole rows. Tests pin shape+unit (391⇒391). **Unblocks TASK-170 Part 2 (FE reads `booking.discount`).** — _prior:_ 🔎 REVIEW (Jason 2026-08-23 — `discount` is **`null` or a whole object**, never partly filled: an absent discount and a discount of nothing must not look alike on the card. `value` travels **exactly as stored — the human number**; converting to satang here would put a second unit conversion on the wire, which is the precise shape of the bug this feature already produced once this week. `actor` carried (display is Fern’s call, per your note) — dropping it would make restoring it a BE change on the critical path later. Checked all five `toBookingDTO` call sites feed whole rows, so no endpoint serves a booking without its discount. Tests assert the **shape and the unit** (391 ⇒ 391, not 39100) + a field-for-field regression — same argument as TASK-172: both bugs this week were type-clean and screen-plausible. tsc 0 · **702/0**, no migration. **@Fern: `booking.discount` is on the wire.**) | Sober | |
```
