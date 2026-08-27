# TASK-163: Surface a day-end DROPPED discount on the attention panel (REQ-063 follow-up) (scheduler-back)

- Source: SPEC-059 (REQ-063), from the TASK-162 review (Sober 2026-08-22).
- Status: DONE (SA-reviewed Sober 2026-08-22) — dropped discounts are now visible, not just logged

## Review
**PASS ✅ (SA-reviewed Sober 2026-08-22).** Reproduced: `bunx tsc --noEmit` **0** · `bun test` **674/0** (+7). Pure
`isDiscountNotApplied(b, postedRefIds, discountedRefIds) = !!b.discountKind && postedRefIds.has(b.id) &&
!discountedRefIds.has(b.id)` — flags a booking that carries a stored discount, whose **sale has posted**, but which
has **no DISCOUNT movement**. The **`postedRefIds.has(b.id)` gate is load-bearing and correct**: without it every
same-day discounted trial would flag before the day-end job runs (a daily false positive everyone learns to ignore),
and a never-posted sale is already `sales_not_posted` — reporting one fault twice is how a digest becomes noise. No
new query (reuses `salesPostingState`), 11th registry entry, **counts-only in the digest** (a test pins
`namesPeopleInDigest` unset), names behind login — same posture as `sales_not_posted`. **DONE.**

## Answer to Q1
**Keep it generic — approve.** The check observes a *state* ("a promised discount didn't reach the books"), and the
data cannot tell you the *cause* — the deliberate `safeStoredDiscount` drop and a discount lost to a crash/half-txn
look identical, and both deserve a human's eyes. Naming it "the drop" would be a guess; the admin's next action is
the same either way (open the booking, see the missing discount). The generic title `ส่วนลดที่ไม่ได้ถูกใช้` is right.
- Assignee: @Jason (BE)
- Repo: **smart-scheduler-back**. Depends on TASK-162 (the `bookings.discount_*` columns). **Non-blocking / fast
  follow-up** — small.

## Why (one paragraph)

TASK-162's day-end `safeStoredDiscount` correctly **drops** a stored discount that no longer validates against the
current price (and posts full price) rather than posting a negative — but it announces the drop only with a
`console.error`. On this project a loud log is an **invisible** signal (the whole REQ-049 / `sales_not_posted`
lesson): a customer promised a discount would be silently charged full price with nobody the wiser. The drop already
leaves a **queryable trace** — a booking that still carries `discount_kind/value/reason` but whose sale posted **no
`reason:"DISCOUNT"` movement** for its `refId`. Turn that into a human-visible worklist line.

## What to build

- A new **attention check** (`lib/attention.ts`, mirror `sales_not_posted` — TASK-067) keyed e.g.
  `discount_not_applied`: a trial/single booking whose day-end sale posted (there IS a SALE movement for its
  `refId`) **and** which still carries stored `discount_*`, but has **no `DISCOUNT` movement** on that `refId`.
- Surfaces on the same 08:00 digest + web attention panel as the other checks; **counts in the digest, names the
  bookings in the panel** (behind login), same PII posture as the existing checks.
- Candidate query alongside the others in `services/search.queries.ts`; the check is a pure filter over the loaded
  candidates so it's unit-testable without a DB (as the other attention checks are).

## Definition of Done
- [ ] A booking with a stored discount whose day-end sale posted no matching DISCOUNT movement is **counted** in the
      digest and **listed** in the panel.
- [ ] A normally-discounted booking (DISCOUNT movement present) and a no-discount booking do **not** appear.
- [ ] Pure filter unit-tested; `bunx tsc --noEmit` 0 · `bun test` green.

## Notes / Questions
(Jason fills in. This is the visibility half of TASK-162's drop-and-log — no change to the drop behaviour itself,
which is correct. Keep it small; it's one more check in an existing framework.)

## Implementation Notes
**Files:** `lib/attention.ts` (predicate + 11th registry entry) · `lib/line-i18n.ts` (TH/EN title) ·
`services/attention.service.ts` (loader) · `lib/attention.test.ts` (+7).

**The predicate** (`isDiscountNotApplied`) takes the booking, the posted-sale refIds, and the refIds a
`reason:"DISCOUNT"` movement reached — pure, so all seven tests run with no DB.

🔴 **`postedRefIds.has(b.id)` is load-bearing, not tidiness.** Without it, every discounted trial booked *today*
would be flagged before the day-end job has even run — every day, forever — and the one thing worse than an
invisible signal is a daily false one that everybody learns to scroll past. And if the sale itself never posted,
that is already `sales_not_posted`; reporting one fault twice is how a digest turns into noise. So this check
fires only once the sale is a settled fact and the discount is provably missing from it.

**No new query.** `salesPostingState` already loads exactly the in-window ATTENDED trial/single bookings and all
SALE-refType movements; it now also returns the subset carrying `discount_*` and the DISCOUNT-reason refIds.
`postedRefIds` is deliberately left computed over **all** movements — narrowing it would have changed a detector
that is live on `uat`, for no gain (a discount movement never exists without its sale).

**Counts-only in the digest**, names in the panel behind login — same posture as `sales_not_posted`: a dropped
discount is an ops fault, not a person, and there is a test asserting `namesPeopleInDigest` stays unset.

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **674 pass / 0 fail** (+7 here; the registry count test moved
10 → 11, which is the running evidence for SPEC-018's "adding a check = one array entry").

**DoD:** flagged when posted-with-discount-stored-but-not-applied ✅ · not flagged when applied, when no discount
was promised, or before the sale posts ✅ · pure filter, unit-tested without a DB ✅ · TH+EN title ✅.
⚠️ I ran nothing against a database; no migration (TASK-162's `0020` already carries the columns).

## Questions
- Q1: the check reads the **absence** of a DISCOUNT movement, so it also catches a discount lost to a crash or a
  half-written transaction — not just `safeStoredDiscount`'s deliberate drop. I think that is a feature and left
  the title generic ("ส่วนลดที่ไม่ได้ถูกใช้"), but it does mean the digest line can't tell the admin *why*. Say if
  you'd rather it named the drop specifically.

  > answer: (Sober)
