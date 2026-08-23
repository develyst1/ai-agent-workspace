# TASK-160: Apply a discount at the AT-SALE moment — course · voucher · rental (REQ-063) (scheduler-back)

- Source: SPEC-059 (REQ-063). 🔄 **Re-scoped 2026-08-22: this is the AT-SALE moment (3 of 5 types).** Day-end types
  (1st Trial, single session) are **TASK-162**.
- Status: DONE (SA-reviewed Sober 2026-08-22) — at-sale discount live for course·voucher·rental

## Review
**PASS ✅ (SA-reviewed Sober 2026-08-22).** Reproduced: `bunx tsc --noEmit` **0** · `bun test` **658/0** (+27). Read
the route + guard layer:
- **AC-7 by construction:** `validateSaleDiscount` returns `undefined` when no discount is asked for ⇒ the sale
  posts exactly as today. A discount validates via the shared `planDiscount` (refuse-never-clamp) and throws
  `DiscountRefused` (400 · `DISCOUNT_REFUSED` · `details.problems` — every problem at once) on invalid, **before any
  row exists**.
- **AC-9, done better than I specced:** `assertMayDiscount(discount, user)` is **per-request, not `requireRole` on
  the route** — so a receptionist can still sell an *undiscounted* course; only the discount is admin-gated (403 with
  the Thai wording). The SPEC-059 Q1 caveat (one role today) is written *into* the function, not left as a TODO.
- **AC-10:** `actor` comes from `c.get("user").sub` (the token), never the body — "who authorised" can't be spoofed.
- **AC-14:** rental validates against `listPriceMinor(code) × hours` (the line total), pinned by the 3h×฿200 test.
- **Both my rulings applied:** standalone-rental `refId` kept; **AC-8 dropped, no reversal invented** — the invariant
  note (reverse by `refId` to get both) sits at the discount-movement definition, where the future author needs it.
- Posting is a single `insert` at the `recordSale` seam (same item + refId ⇒ nets its own sport in TASK-159's report
  with no attribution special-case).

**On coverage:** the true end-to-end ("books hold +7,900 and −790") is a DB assertion, and this repo doesn't
unit-test DB seams (lazy DATABASE_URL that never connects) — so the movement **shape + amount** are pinned in
isolation and the posting is one insert. Consistent with house practice; the live +/− pair is Tanya's/owner's deploy
check. **Verdict: DONE.**
- Assignee: @Jason (BE)
- Repo: **smart-scheduler-back**. Depends on **TASK-159** (`ops.movement.actor`/`note` columns; the report split).
  Money-sensitive — refuse, never clamp; never rewrite a posted movement.

## What to build

`createCoursePackage` (`:1108`), `createVoucher` (`:1428`), **and the rental sale (`rental.service.ts:20`)** accept
an optional `discount: { kind: "PERCENT" | "BAHT"; value: number; reason: string }`, plus the acting `actor`
threaded from the route (`c.get("user").sub`).

🔴 **AC-14 — the rental trap:** rentals post **`quantity = hours`** (every other sale posts `quantity = 1`), so a
rental's line total is `hours × unitPrice`. **Each caller passes its own LINE TOTAL to `planDiscount`**, so a baht
discount validates against the line, not the unit rate (a ฿500 discount on a 3-hour ฿600 rental is valid; against
the ฿200 rate it would wrongly refuse). Unit-test the rental case.

- **Validate before any write — refuse, never clamp (AC-4):**
  - `kind` present ⇒ exactly one of percent/baht; `PERCENT` 0–100; computed `discountMinor > 0` and **`≤ fullMinor`**;
    `reason` non-empty (AC-3). Any violation ⇒ `badRequest` with the REQ's wording, **nothing written** (no
    zero-value sale, no clamp).
  - Discount is computed on the **VAT-inclusive list price** (Q4). `PERCENT`: `round(full * pct/100)` — state the
    rounding (round half-up on minor units); `BAHT`: the value in minor units.
- **Post in this order, in the sale's existing transaction:**
  1. the **list-price sale movement exactly as today** (unchanged — AC-7);
  2. **iff a valid discount:** a second `bo.movement` — **same `itemId`, same `refId`, `refType:"SALE"`,
     `reason:"DISCOUNT"`, `valueMinor` negative, `qty:0`, `actor`, `note:reason`,
     `idempotencyKey:"discount:{refId}"`** (retry-safe).
- **Admin-only:** `requireRole("admin")` on the discount-bearing route. (Caveat per SPEC-059 Q1: one role today, so
  this guards for an authenticated admin but can't distinguish a non-admin until a staff role exists — correct as
  written, flagged.)
- **Reversal (AC-8):** the cancel/reverse path reverses the sale by `refId` — extend it to reverse **every**
  movement carrying that `refId` (sale + discount), so net returns to zero and the two can never drift.

## Definition of Done
- [ ] AC-1: 10% on a 7,900 course ⇒ books hold **+7,900** (SALE) and **−790** (DISCOUNT), net 7,110; both same item/refId.
- [ ] AC-2: baht discount (−500) ⇒ same shape.
- [ ] AC-3/AC-4: no reason, >price, >100%, negative, or malformed ⇒ **refused, nothing written** (unit-test the pure
      validator: `planDiscount({kind,value,fullMinor,reason})` → `{ ok, discountMinor, problems }`).
- [ ] AC-7: a create with **no** discount posts exactly one movement, byte-identical to today (test/asserted).
- [ ] ~~AC-8: cancelling a discounted sale reverses **both** movements (net 0).~~ **REMOVED from this task — SA
      decision 2026-08-22 (see below).** Replaced by the invariant: **the discount carries its sale's `refId`**, so
      any future reversal-by-`refId` reverses both together. That invariant IS the AC-8 deliverable here.
- [ ] AC-10: the discount movement carries `actor` + `note` (from TASK-159's columns).
- [ ] `bunx tsc --noEmit` 0 · `bun test` green. You run **nothing** against a DB.

## Notes / Questions
(Jason fills in. Keep the discount math in a **pure `planDiscount` helper** (unit-tested, no DB) so refuse-not-clamp
and the rounding rule are provable without a database — same pattern as the other REQ-06x helpers. The FE form is
TASK-161; the API shape you settle here is its contract.)

## Progress (2026-08-22) — the shared validator is in; the wiring is not. NOT ready for review.
**Built:** `src/lib/discount-plan.ts` + `discount-plan.test.ts` (16 tests) — the pure half that **TASK-162 also
depends on**, which is why I did it first rather than wiring one sale path end to end.

- **`planDiscount({kind, value, fullMinor, reason})` → `{ ok, discountMinor, problems }`.** Refuse-never-clamp is
  the whole point and it is pinned: more baht than the price, >100%, ≤0, a fractional satang value, a malformed
  kind, or an empty reason all return `ok:false` with `discountMinor: 0` — so there is nothing for a caller to
  write even by accident. 100% is allowed (a free place is a real decision, recorded as one).
- **AC-14, the rental trap, is in the signature:** the parameter is `fullMinor` = the **line total**, and a test
  pins ฿500 off a 3h × ฿200 rental as valid while the same discount against the ฿200 unit rate is refused.
- **Rounding stated once:** `percentOf` = round half-up on minor units, so 10% of 7,905 is 791 everywhere.
- **All problems reported together**, not one refusal at a time — the form can say everything that is wrong in
  one pass (a deliberate change after the first draft only reported the first failure).
- **`discountMovement()`** returns the exact row shape: `qty 0`, negative `valueMinor`, `reason:"DISCOUNT"`, the
  sale's own `refId`, `actor`, `note`, and `idempotencyKey: "discount:{refId}"` — one discount per sale, so a
  retry cannot post a second.

**Verified so far:** `bunx tsc --noEmit` **0** · `bun test` **647 pass / 0 fail** (+16).

**Still to do in this task (deliberately not claimed):** thread `discount` + `actor` through
`createCoursePackage` / `createVoucher` / `rental.service`, the zod shapes, `requireRole("admin")` on the
discount-bearing routes, and the AC-8 reversal (reverse **every** movement carrying the sale's `refId`). None of
that is started — the status stays `IN_PROGRESS` rather than `REVIEW`, because a half-wired money path that
*looks* finished is exactly the failure this project keeps writing runbooks about.

## Progress 2 (2026-08-22) — all three sale paths wired. Routes + AC-8 still open.
**Wired, with the validate/post split that makes both rules true at once:**
- **Validation at the boundary** (`validateSaleDiscount`, throws `DiscountRefused`): called at the *top* of
  `createCoursePackage` / `createVoucher` / `recordRental` — **before the course, voucher or rental row exists**.
  An invalid discount therefore refuses the whole sale; there is nothing to unwind.
- **Posting at the seam** (`recordSale`): the discount movement is written right after the list-price movement,
  **same item, same `refId`** — which is what makes it net its own sport in TASK-159's report with no attribution
  special case. `recordSale`'s first rule ("never fail the sale it describes") is untouched, because by the time
  it runs the amount is already known-valid.
- I put the posting in **`recordSale` rather than in three call sites** — it is the single seam every sale
  already passes through, so course/voucher/rental (and TASK-162's trial/single) all get identical behaviour and
  there is one place where a discount row can be born.
- **Price source:** new `listPriceMinor(code)` reads the **catalogue** (`SALE_ITEMS`), so validation happens
  against the list price before any DB read — same source of truth `isSellable` already rests on.
- **AC-14 rental:** `recordRental` computes `lineTotalMinor = listPriceMinor(code) × hours` and validates against
  that. Tested end-to-end in the helper: ฿500 off a 3h × ฿200 rental passes; the same discount judged against one
  hour throws.

⚠️ **One deliberate behaviour change, flagged rather than slipped in:** a **standalone** rental used to post with
`refId: null`. A discount must carry its sale's `refId` (that is what ties the two together), so a standalone
rental now posts under its own `idBase`. Session add-ons are unchanged (`input.refId` still wins) and no money
changes — but it does give previously-anonymous rental sales an identity, which is also what a future reversal
would need. Say the word if you'd rather it stayed null and standalone rentals simply couldn't be discounted.

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **653 pass / 0 fail** (+22 across the two describe blocks).

### Still open on this task
1. **Routes:** the zod shape for `discount`, `requireRole("admin")` on the discount-bearing routes, threading
   `actor` from `c.get("user").sub`, and mapping `DiscountRefused` → 400 with all `problems`. The services accept
   `input.discount` / `input.actor` today, so this is wiring, not design.
2. 🔴 **AC-8 has nothing to extend — there is no sale-reversal path in `scheduler-back`.** I searched: the only
   reversals are the **freelance-budget** ones (`BOOKING_REVERSAL`); no code reverses a `refType:"SALE"` movement
   for a cancelled course/voucher/rental. So "extend the reversal to cover both movements" cannot be done as
   written. **This is a question for you, not something I should invent:** either AC-8 becomes "build sale
   reversal" (its own task — it is a money path with its own decisions: partial? refund vs void? who authorises?),
   or it is dropped from TASK-160 and tracked separately. I have not built a reversal on spec.

## SA answers (Sober 2026-08-22) — both your open questions

**Q (standalone rental `refId`): APPROVED — keep your change.** A discount must be tied to its sale by `refId`, and
giving a standalone rental its own `idBase` is money-neutral and is exactly the identity a future reversal needs.
Session add-ons unchanged (`input.refId` wins). Good call; ship it.

**Q (AC-8 / reversal): you're right — there is no sale-reversal path to extend, so AC-8 is REMOVED from this task.**
- Do **not** build sale-reversal on spec. It is a money path with decisions that are not ours to invent (void vs
  refund, partial, who authorises), and it applies to **every** sale, not just discounted ones — a pre-existing gap
  REQ-063 neither created nor worsens.
- **What TASK-160 must guarantee instead (and already does):** the discount is a single movement carrying the sale's
  own `refId`. So the *"a sale and its discount must never drift apart"* requirement (REQ-063 req 7) holds **by
  construction** — whenever a reversal path is built, reversing every movement on that `refId` gets both. Add a note
  in the code/PR to that effect so the future reversal author knows to reverse by `refId`, not by a single movement.
- I've escalated the missing-reversal gap to Porter as a separate item.

**⇒ TASK-160 scope to finish:** the routes (zod `discount` shape, `requireRole("admin")`, thread `actor` from
`c.get("user").sub`, `DiscountRefused` → 400 with all `problems`). Then it's ready for review. Nothing else.

## Progress 3 — COMPLETE (2026-08-22). Routes wired; AC-8 dropped per your ruling.
**Routes (the last open piece):**
- `discountInput` zod shape (`kind` · `value` · non-empty `reason`) on all three sale schemas. **Shape only** —
  the real rule (≤ line total, refuse-never-clamp, rounding) stays in `lib/discount-plan.ts`, because zod cannot
  see the price and a second copy of a money rule is a second thing to drift.
- **`assertMayDiscount(body.discount, c.get("user"))` per request, not `requireRole("admin")` on the route.**
  Guarding the whole route would stop a receptionist selling an **undiscounted** course — the restriction belongs
  on the privileged part, not the ordinary work around it. Your SPEC-059 Q1 caveat is written into the function:
  with one role today it asserts an authenticated admin and cannot yet distinguish a non-admin staff member; it
  becomes meaningful the moment a staff role exists, which is why it is written now rather than left a TODO.
- **`actor` comes from the token** (`c.get("user")?.sub`), never from the body — otherwise "who authorised this"
  would be whatever the caller typed.
- **`DiscountRefused` now extends `ApiException`** (400 · `DISCOUNT_REFUSED` · `details.problems`), so the app's
  existing `onError` renders it with no special case and the form receives **every** problem at once.

**Your two rulings, applied:**
1. Standalone-rental `refId` — **kept** (approved).
2. **AC-8 dropped.** I did not build sale reversal. **The invariant is delivered instead**: the discount carries
   its sale's `refId`, so whenever a reversal is built, reversing **by `refId`** picks up both movements and they
   cannot drift. I've written that as a note at the discount-movement definition, so the future reversal author
   meets it at the place they'd otherwise get it wrong.

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **658 pass / 0 fail** (+27 for this task). ⚠️ **I ran nothing
against a database.**

**DoD status:** AC-1/AC-2 (shape + amounts), AC-3/AC-4 (refuse-never-clamp, every violation), AC-7 (no discount ⇒
one movement, unchanged), AC-9 (admin-only), AC-10 (`actor`+`note` on the movement), AC-14 (rental line total) —
all covered by the pure tests. **AC-8 dropped by SA ruling.** The end-to-end "books hold +7,900 and −790" is a DB
assertion I can't make from here; the movement shape and the amount are each pinned in isolation, and the posting
is a single `insert` in `recordSale`.

## Questions
(none — both open questions were answered; nothing new.)
