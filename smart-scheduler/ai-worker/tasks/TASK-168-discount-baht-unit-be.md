# TASK-168: Baht discount value is whole BAHT, not satang (REQ-063 AC-15/16) (scheduler-back)

- Source: REQ-063 (Tanya's find, Porter verified; SA Q7). 🔴 **Blocking money defect — blocks the `uat` lift.**
- Status: DONE (code) — SA-reviewed Sober 2026-08-22. Merge gated on TASK-169 + a `0` stored-bookings check (below).

## Review
**PASS ✅ (SA-reviewed Sober 2026-08-22).** Reproduced: `bunx tsc --noEmit` **0** · `bun test` **698/0** (discount
33/0, +6). Read it:
- **`bahtToMinor(baht) = baht*100` as a NAMED export**, used in the BAHT branch — the one place the human unit meets
  the money unit is now greppable. That absence is exactly what let every layer agree with the mistake; naming it is
  the right structural fix, not just the `*100`.
- **All THREE wrong-contract comments fixed** (`discount-plan.ts:17`, `validation.ts`, the `discount_value` column) —
  not just the one I named. The old "minor units, like every other money value" consistency claim is what carried the
  bug through *my* review; replacing it everywhere is correct.
- **Tests rewritten, not adjusted** (they encoded the bug): `500→50000`, `391→39100`, over-line-total refused, and a
  **ripple test** — a stored BAHT value re-read at day-end via `safeStoredDiscount` gives ฿500→50000, proving capture
  and posting share one contract with no double conversion. That's the assertion that catches a half-landed fix.
- Ripple confirmed by reading: at-sale (rental/course/voucher) and day-end inherit the fix unchanged; `discountMinor`
  / `valueMinor` were already minor and are untouched.

**Q1 (sequencing) — endorsed.** BE-first fails **loud** (FE still sends satang → read as baht → 100× too big →
*refused*, visible in seconds); FE-first fails **silent** (100× under-post). So: prefer simultaneous, but **if not,
land 168 first.** Right call — the loud-over-silent principle again.

**⛔ Merge gate (both must hold):** (1) TASK-169 lands (or 168-first per Q1); (2) the owner's `SELECT` confirms **no
stored discounted bookings** on either box — a stored BAHT row would be silently reinterpreted 100× by this change.
Code is DONE; the *merge* waits on those. **Verdict: DONE (code).**
- Assignee: @Jason (BE)
- Repo: **smart-scheduler-back**. **Ships together with TASK-169 (FE)** — they share the wire contract; one without
  the other diverges.

## The defect (Q7 answered)

`discount-plan.ts:17` documents *"BAHT: minor units (satang)"* and `:50` does `discountMinor = input.value`. So a
`BAHT` discount value travels as **satang**. The FE agrees (same satang assumption) — but a human types **baht** into
the field, so `391` (the promo's ฿391) becomes **฿3.91 off**. Nothing refuses it (`391 < 790000`), so it posts —
silent 100×-wrong money. And `PERCENT` already takes a human number (0–100), so the two halves of one control
disagree about units.

## The fix (Porter's decision: the value is BAHT everywhere)

**Contract: `discount.value` is a human number** — PERCENT = a percentage, **BAHT = whole baht**. Each side converts
to minor for the math. This is the BE (source-of-truth) half:
- In `planDiscount`, the `BAHT` branch: `discountMinor = input.value * 100` (baht → satang). Keep the whole-number,
  positive check (it's whole **baht** now — update the message accordingly).
- **Fix the `:17` doc comment** — it currently *states the wrong contract* ("minor units"); it must read "BAHT =
  whole baht; converted to satang here." A comment that documents the bug is how the next reader re-introduces it.
- Everything downstream is already minor (`discountMinor`, the movement's `valueMinor: -discountMinor`) — unchanged.

## Ripple to check (do not miss)
- **TASK-162 day-end:** the booking's stored `discount_value` is whatever the contract carries. With the contract now
  **baht**, `discount_value` stores **baht**, and `safeStoredDiscount` → `planDiscount` converts ×100 at post time —
  consistent, because both capture and day-end run the same `planDiscount`. **No migration:** the feature isn't live
  on `uat` and `sid` is test data, so there are no stored discounted bookings to reinterpret — but **confirm** there
  are none before relying on that.
- **TASK-160 at-sale:** passes `input.discount` straight to `planDiscount`, so it inherits the fix with no change.

## Definition of Done
- [ ] `planDiscount({kind:"BAHT", value:391, fullMinor:139000})` ⇒ `discountMinor: 39100` (฿391), not 391.
- [ ] Whole-baht + positive validation retained (message says "baht"); over-line-total still refused
      (`value*100 > fullMinor`).
- [ ] The `:17` comment states the baht contract.
- [ ] Existing discount tests updated to the baht contract (they encoded the satang bug — fix them, don't preserve).
- [ ] `bunx tsc --noEmit` 0 · `bun test` green. **Coordinate the merge with TASK-169** — the wire meaning changes.

## Notes / Questions
(Jason fills in. This is the source-of-truth side; TASK-169 makes the FE send/display baht. They must land together.)

## Implementation Notes
**Files:** `lib/discount-plan.ts` (`bahtToMinor` + the BAHT branch + the contract comment) · `validation.ts`
(zod comment) · `db/schema.ts` (`discount_value` comment) · `lib/discount-plan.test.ts` (updated + 2 new).

**The code change is four characters wide; the rest is making sure it can't come back.** `discountMinor =
bahtToMinor(input.value)`, and `bahtToMinor` is a **named export rather than an inline `* 100`** so the one place
the human unit meets the money unit is greppable — it was missing here, and every layer agreed with the mistake.

**All three comments that stated the wrong contract are fixed, not just the one the task named.** `discount-plan`
`:17` said *"minor units (satang), like every other money value in this codebase"* — that consistency argument is
precisely what carried the bug through review, so the replacement says so explicitly. `validation.ts` and the
`discount_value` column said the same thing; a comment that documents the bug is how the next reader restores it.

**The tests encoded the bug, so they were rewritten rather than adjusted.** The BAHT case is now stated in the
unit a person actually types (`value: 391` ⇒ `39100`), and the rental AC-14 trap and `validateSaleDiscount`
cases follow. I also **added the ripple as a test**: a stored `BAHT` value re-read at day-end through
`safeStoredDiscount` gives ฿500 → 50000, proving capture and posting share one contract with no second
conversion. That is the assertion that would have failed if the fix had half-landed.

**Ripple confirmed by reading, not assumed:** `recordRental`/`createCoursePackage`/`createVoucher` pass
`input.discount` straight through, and the day-end re-runs the same `planDiscount` — so both inherit the fix
with no edit. `discountMinor` and the movement's `valueMinor` were already minor units and are untouched.

**⚠️ The one DoD line I cannot close myself** — *"confirm there are no stored discounted bookings"*. I run
nothing against a database. The check is a one-line SELECT and I have given it to Porter for the owner; **it
must come back `0` on both boxes before this merges**, because any stored `BAHT` row would be silently
reinterpreted 100× by this change.

**Merge window is loud, not silent** (worth knowing for sequencing): if this lands before TASK-169, the FE still
sends satang, which is now read as baht — 100× **too big**, so it hits "ส่วนลดมากกว่าราคาเต็ม" and is **refused**.
A broken discount form is visible in seconds; the reverse order (169 first) would send baht read as satang and
post 100× **too small**, silently. **So if the pair cannot land together, land THIS one first.**

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **698 pass / 0 fail**. No migration.

**DoD:** `planDiscount({BAHT, value: 391, fullMinor: 139000})` ⇒ `39100` ✅ · whole-baht + positive retained,
over-line-total still refused ✅ · every wrong-contract comment corrected ✅ · tests moved to the baht contract
✅ · tsc/test green ✅ · stored-bookings confirmation → **owner, via Porter** ⛔.

## Questions
- Q1: sequencing — I'd rather **this merge first** than wait for a simultaneous landing, for the loud-vs-silent
  reason above. If you want strict simultaneity instead, say so and I'll hold.

  > answer: (Sober)
