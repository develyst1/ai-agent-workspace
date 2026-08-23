# TASK-162: Apply a discount at the DAY-END moment — 1st Trial · single session (REQ-063) (scheduler-back)

- Source: SPEC-059 (REQ-063). 🔄 Added by the 2026-08-22 re-scope (five types, two moments).
- Status: DONE (SA-reviewed Sober 2026-08-22) — day-end discount complete; visibility follow-up = TASK-163

## Review
**PASS ✅ (SA-reviewed Sober 2026-08-22).** Reproduced: `bunx tsc --noEmit` **0** · `bun test` **663/0** (+5). Read it:
- **Migration `0020`** — 4 nullable `bookings.discount_*` columns **+ a CHECK** (`kind ∈ PERCENT|BAHT`), witness =
  the CHECK (last object, depends on the columns ⇒ half-apply detectable). Additive, idempotent. Good call adding the
  CHECK — a typo'd kind would be a discount nobody can price at day-end.
- **Capture** — `captureBookingDiscount` validates with the **same `planDiscount`** the at-sale path uses (one rule,
  the two moments can't disagree), before the booking row exists ⇒ invalid refuses the booking, stores nothing
  (AC-3/AC-4). A discount on a COURSE/VOUCHER booking is refused with a pointer to the at-sale path — right.
- **Day-end re-validation (`safeStoredDiscount`) — an unprompted, correct addition.** Capture→post spans time and
  the catalogue can move (REQ-061 moved a price *today*), so a stored ฿ amount could exceed a since-reduced price. It
  re-runs the rule; valid → post; invalid → **drop, post full price, loud error** — never a negative.
- **AC-7** no-discount trial unchanged; **AC-10** actor+reason carried; **AC-8** per my TASK-160 ruling (no reversal
  path; the shared-`refId` invariant is the deliverable).

**Verdict: DONE.**

## Answer to Q1 (the day-end fallback) — drop is right, but it must be VISIBLE
**Keep the drop. Not clamp** (violates refuse-never-clamp and invents a net nobody chose), **not skip** (loses real
revenue for a session that happened). Posting full price + protecting the books is the correct non-negotiable.
**BUT a `console.error` is this project's known-invisible failure** — the entire REQ-049 / `sales_not_posted` story
is "loud logs are still unread." A promised discount silently not applied = a customer overcharged with only a log
saying so. So the drop must reach a human. **Good news: it already leaves a queryable trace** — the booking keeps its
`discount_*` columns while its day-end sale posts **no** matching DISCOUNT movement. ⇒ I've cut **TASK-163**: a small
attention check ("discount stored but not applied at day-end") on the same panel as `sales_not_posted`. **Non-blocking
to this task** (books are safe, the edge is rare); it turns the dead log into a worklist line. Your drop-and-log ships
as-is; TASK-163 makes it seen.
- Assignee: @Jason (BE)
- Repo: **smart-scheduler-back**. Depends on **TASK-159** (`ops.movement.actor`/`note`) and shares the pure
  `planDiscount` helper from **TASK-160**. Money-sensitive.

## Why (one paragraph)

1st Trial and single-session revenue posts **at day-end from the job** (`jobs.service.ts:99`), not from a form with
an admin present. But the admin **is** present when they **book** the trial/session — that's where the discount is
captured. So the discount is **stored on the booking at creation** and **posted by the day-end job** alongside the
sale. (This resolves the earlier "no author/moment" objection: the author is at capture; only the posting is deferred.)

## What to build (smart-scheduler-back)

1. **Booking discount storage** — additive nullable columns on `public.bookings`: `discount_kind` /
   `discount_value` / `discount_reason` / `discount_actor` (hand-authored migration, journal-registered, `sid` first).
2. **Capture at booking** — `FIRST_TRIAL` / `SINGLE_SESSION` creation accepts `discount { kind, value, reason }` +
   `actor`, **validates it with `planDiscount` at booking time** against the booking's line total (refuse-never-clamp;
   nothing stored on invalid), and persists the four columns. Admin-only (`requireRole("admin")`, Q1 caveat).
3. **Apply at day-end** — in `jobs.service.ts:99`, when a trial/single sale posts, if the booking carries a discount,
   also post the discount movement: **same item + same `refId`, `refType:"SALE"`, `reason:"DISCOUNT"`, negative
   `valueMinor`, the stored `discount_actor` → `actor`, `discount_reason` → `note`,
   `idempotencyKey:"discount:{refId}"`**. The sale post itself is unchanged (AC-7).
4. **Reversal (AC-8)** — a trial/single cancelled **before** day-end never posts (nothing to reverse); **after**
   day-end, reverse both movements by `refId` (same rule as TASK-160).

## Definition of Done
- [ ] Migration adds the four nullable columns; schema + ledger clean; existing bookings unaffected.
- [ ] A discounted trial booked today posts, at day-end, **+list price (SALE)** and **−discount (DISCOUNT)** on the
      same item/refId, carrying the stored actor + reason (AC-1/AC-2/AC-10 for this moment).
- [ ] Invalid discount at booking is **refused, nothing stored** (AC-3/AC-4) — reuse `planDiscount`, no second rule.
- [ ] A trial with **no** discount posts exactly as today (AC-7).
- [ ] Cancel-before-day-end: no movement; cancel-after: both reversed (AC-8).
- [ ] `bunx tsc --noEmit` 0 · `bun test` green. You run **nothing** against a DB (owner runs the migration, sid first).

## Notes / Questions
(Jason fills in. Share `planDiscount` with TASK-160 — do not write the validation twice. The day-end job is the only
new posting site; the movement shape is identical to the at-sale one.)

## Implementation Notes
**Files:** `drizzle/0020_booking_discount.sql` (new) · journal idx 20 · `lib/migration-witness.ts` (0020 witness) ·
`db/schema.ts` (4 columns) · `services/scheduler.service.ts` (`captureBookingDiscount` + `createBooking`) ·
`services/jobs.service.ts` (day-end post) · `lib/discount-plan.ts` (`safeStoredDiscount`) · `validation.ts` ·
`routes/api.ts` · `lib/discount-plan.test.ts` (+5).

**1. Migration `0020`** — four nullable columns **plus a CHECK** that `discount_kind ∈ (PERCENT, BAHT)`: a typo'd
kind would be a discount nobody can price at day-end, and it is cheaper to refuse it at the column than to
discover it in the books. Witness = **the CHECK**, deliberately: it is the last object, and it only exists once
every column it depends on has landed, so a half-applied run is detectable.

**2. Capture at booking** — `captureBookingDiscount` validates with the **same `planDiscount`** the at-sale path
uses (one definition; the two moments cannot disagree) against this booking's own line total, **before the
booking row exists**, so an invalid discount refuses the booking rather than storing junk. A discount asked for
on a COURSE or VOUCHER booking is **refused** with a pointer to the at-sale path, rather than stored somewhere
nothing will ever read it.

**3. 🔴 Post at day-end — with a re-validation the task didn't ask for, and I think it needs.** The stored
discount is checked **again** against the list price at posting time. Capture and posting are separated by hours
or days, and the catalogue can change in between (REQ-061 moved a price *today*). A stored **percentage** simply
re-computes — but a stored **฿ amount** against a since-reduced price could exceed the sale and post a negative
larger than the revenue. So `safeStoredDiscount` re-runs the rule and, if it no longer holds, **drops the
discount with a loud `console.error` naming the booking** instead of posting it.
- **Why drop rather than refuse here** (the opposite of the at-sale rule, on purpose): the session already
  happened and the customer owes something. Posting the full price and shouting is recoverable by a human;
  posting a negative bigger than the sale is not, and skipping the sale entirely loses real revenue.

**4. Routes** — `discount` on `createBooking`'s schema; same `assertMayDiscount` admin guard and same
token-sourced `actor` as TASK-160.

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **663 pass / 0 fail** (+5 here). ⚠️ **I ran nothing against
a database.** **Owner-run deploy: `0020` on `sid` first**, then `uat` — and note `uat` is still behind on
`0018`/`0019`, so this queues behind that.

**DoD:** columns + witness ✅ · capture validated by the shared rule, nothing stored when invalid (AC-3/AC-4) ✅ ·
no-discount trial unchanged (AC-7) ✅ · actor + reason carried to the movement (AC-10) ✅ · **AC-8**: per your
TASK-160 ruling there is no sale-reversal path, so cancel-after-day-end is out of scope here too — the invariant
(same `refId` on both movements) is what a future reversal will use. The end-to-end "+list −discount at day-end"
is a DB assertion I can't make from here; both halves are pinned in isolation.

## Questions
- Q1: the day-end **drop-and-log** on a stale discount is my call, not the task's. It is the only option that is
  neither "lose the sale" nor "post a negative bigger than it" — but it does mean a customer could be charged
  full price for a session someone promised a discount on, with only a log line saying so. If you'd rather it
  posted the discount **clamped to the sale** (the one place clamping might be defensible) or **skipped the sale
  for human handling**, say which — it is a small branch either way.

  > answer: (Sober)
