# SPEC-059: Manual discount at point of sale (REQ-063)

- Source: REQ-063 (HIGHEST — Mother's Day promo, wanted today). Q4 (VAT-inclusive) closed; Q3 (per-sale-manual)
  assumed, does not block.
- Author: Sober (SA) 2026-08-22
- Status: READY — tasks cut (TASK-159 backoffice-back · TASK-160 sale-moment BE · TASK-162 day-end BE · TASK-161
  FE). **Spans three repos** — phased so the recordable core lands first.
- 🔄 **RE-SCOPED 2026-08-22 (Porter, owner-final): FIVE sale types, TWO posting moments** — not course+voucher.
  Owner overruled the customer's narrower list (future promos will want the rest). **Design for the two MOMENTS,
  not the five types.**

## Final scope — five types, two moments (Porter 2026-08-22)

| Posting moment | Sale types | Where |
|---|---|---|
| **At the moment of sale** (admin present) | course · voucher · **rental** | `scheduler.service.ts:1108` · `:1428` · `rental.service.ts:20` |
| **At day-end, from the job** | 1st Trial · single session | `jobs.service.ts:99` |

The discount is **captured wherever an admin is present** (all five booking/sale forms) and **posted at that type's
moment**: immediately for course/voucher/rental; at day-end for trial/single (the admin sets it at booking time —
so the "no author" objection in my first draft is resolved: the author is present at capture, the posting is just
deferred). This means trial/single need the discount **stored on the booking** until the job posts it.

## The shape (grounded), and the two SA answers

**It is "an admin knocks money off a sale, and the books record that they did"** — not a promotions engine. The
sale keeps posting the **list price** exactly as today; the discount is a **separate negative movement**. That is
what makes AC-7 (undiscounted sale unchanged) provable and keeps today's revenue numbers meaning what they meant.
**The movement model below is per-movement, so it generalises to all five types unchanged** — only *where the
discount is captured/applied* differs by moment.

### Q2 — where the discount movement lives (decided against Porter's lean, with the reason)

Porter leaned toward a dedicated `discount` INCOME item. **I read `backoffice-back/src/lib/revenue-attribution.ts`
and that would break AC-6.** The revenue report attributes a sale to a sport by: `productKind(item.external_ref)` →
`refId` → `course_packages`/`bookings` → `subjectId`. A dedicated `discount` code fails `productKind` →
`UNKNOWN_CODE` → **unattributed**. ⇒ **The discount must be a negative movement on the SALE'S OWN item**, carrying:
- **same `itemId`** as the sale (so `productKind` classifies it and `refId` resolves to the same sport — **AC-6
  holds with zero attribution changes**),
- **same `refId`**, **`refType:"SALE"`** (so the report *counts* it — a discount with `refType:"DISCOUNT"` would be
  filtered out and reconciliation would break),
- **`reason:"DISCOUNT"`** (so gross vs discount are separable),
- **negative `valueMinor`**, `qty:0` (a value reduction, not a quantity),
- its own `idempotencyKey` (`discount:{refId}`), so a retry can't double-post.

⇒ **AC-5's reconciliation identity (`buckets + unattributed === total`) holds by construction** — the discount is
just another attributed SALE row with a negative amount and the same `refId`. Only the **display** of "gross ·
discount · net" needs the report to split by `reason` (a small additive change, TASK-159).

### Q1 — the acting user server-side (AC-9 / AC-10)

**Available:** `c.get("user")` returns `{sub, role}`; `requireRole("admin")` exists (`middleware/auth.ts`). So the
route can guard the discount path and pass `user.sub` into the service for the audit. **BUT — honest gap:** there is
**only one role today** (`auth.ts:21` signs `role:"admin"` for every login; `DEV_USER` is admin). So AC-9
("non-admin refused, server-side") is **enforceable code but practically vacuous** until a real staff role exists —
`requireRole("admin")` is correct and future-proof, and everyone currently passes it. **Porter: if AC-9 must mean
something today, a non-admin role is its own small piece of work; otherwise `requireRole("admin")` satisfies it as
written.** For AC-10, `sub` (who) + `createdAt` (when) + `valueMinor` (how much) are available; **why** + **who**
need storage → see the migration below.

## 🔴 Risk found in passing (not REQ-063's to fix, but AC-6 depends on it)

`revenue-attribution.ts:86` — `productKind` tests `/^course-\d+$/`, but course codes are **`course-{group}-{size}`**
(`courseItemRef`, `course-onewheel-6`). That regex does **not** match, so **course sales may already be landing in
`UNKNOWN_CODE`/unattributed** — a pre-existing REQ-014 money-report bug, and **AC-6 cannot pass until it's
reconciled** (the discount inherits the same code, so it'd be unattributed too). **Flagged to Porter** as REQ-014's
domain — verify against the live report; if real, it's a one-line regex fix folded into TASK-159. Do not assume;
confirm on the box.

## The pieces

### TASK-159 — backoffice-back (finance foundation)
1. **Additive migration** (`ops.movement`): nullable `actor text` + `note text`. Existing rows unaffected; hand-authored
   per the repo's migration discipline. (AC-10's "who" and "why" homes.)
2. **Revenue report gross/discount/net split** (`revenue-attribution.ts` + its service): a `DISCOUNT`-reason movement
   is already attributed correctly (same item/refId); add the **display** split so the month shows **gross · total
   discount · net**, with `buckets + unattributed === total` still holding on **net** (AC-5). Discount reduces its
   sport bucket by construction (AC-6).
3. **Reconcile/confirm the `productKind` course-code regex** above (if the live report shows course sales
   unattributed, fix `/^course-\d+$/` → the `course-{group}-{size}` shape). Guard with the existing unit tests.

### The shared core (both BE tasks use it) — a pure `planDiscount` validator
`planDiscount({ kind:"PERCENT"|"BAHT", value, fullMinor, reason })` → `{ ok, discountMinor, problems }`, no DB.
Refuse-never-clamp (AC-4): percent 0–100; `discountMinor > 0` and **`≤ fullMinor`**; reason non-empty (AC-3);
malformed → problems, nothing written. Computed on the **VAT-inclusive** amount (Q4).
🔴 **`fullMinor` is the LINE TOTAL, not the unit price (AC-14).** Course/voucher post `quantity=1` so line = unit;
**rental posts `quantity = hours`** (`rental.service.ts`), so its line total = `hours × unitPrice`. The validator
takes `fullMinor` precomputed by the caller, so a ฿500 discount on a 3-hour ฿600 rental validates against 600, not
200 — get this wrong and money leaks. Unit-test the rental case explicitly.

### TASK-160 — scheduler-back, the **at-sale** moment: course · voucher · **rental**
- The three creation paths accept `discount` + the acting `actor` (from `c.get("user").sub`); each passes its own
  **line total** to `planDiscount`.
- **Post unchanged**: the list-price sale movement exactly as today (AC-7). **Then** the discount movement per Q2
  (negative, same item/refId, refType SALE, reason DISCOUNT, actor, note, `idempotencyKey: discount:{refId}`).
- **Reversal (AC-8) — RE-SCOPED 2026-08-22:** Jason found there is **no sale-reversal path in scheduler-back at all**
  (only freelance-budget reversals exist; nothing reverses a `refType:"SALE"` movement on cancel). So "extend the
  reversal" was built on a false premise. **AC-8's deliverable here is the *invariant*, not a reversal:** the discount
  carries its sale's `refId`, so whenever a sale-reversal path is built, reversing by `refId` gets both together — they
  can't drift (REQ-063 req 7 holds by construction). **Building actual sale-reversal is its own REQ** (void vs refund,
  partial, authorisation) — escalated to Porter; not built on spec, and REQ-063 neither created nor worsens the gap.
- **Admin-only** via `requireRole("admin")` (Q1 caveat noted).

### TASK-162 — scheduler-back, the **day-end** moment: 1st Trial · single session
- **Capture at booking** (admin present): `FIRST_TRIAL` / `SINGLE_SESSION` creation accepts the same `discount` +
  `actor`, **validated with `planDiscount` then**, and **stored on the booking** — additive nullable columns
  `discount_kind` / `discount_value` / `discount_reason` / `discount_actor` (scheduler-back migration, `public.bookings`).
- **Apply at day-end** (`jobs.service.ts:99`): when the job posts the trial/single sale, if the booking carries a
  discount, post the discount movement too (same item/refId, reason DISCOUNT, the stored actor/reason,
  `idempotencyKey: discount:{refId}`). The sale post itself is unchanged.
- Reversal: a cancelled trial/single before day-end simply never posts; after day-end it reverses both by `refId`
  (same rule as TASK-160).

### TASK-161 — scheduler-front (FE, Fern — needs standing up)
- A **Discount** section on **every admin sale/booking form** — create-course, create-voucher, **rental**, and the
  **trial / single-session** booking forms: `Percent`/`Baht` toggle, required **reason**, live
  **`Full price {full} · Discount −{disc} · Amount payable {net}`** (tabular-nums), bilingual (Porter's wording),
  the three refusal messages, disabled-save on invalid. **For rental, `{full}` is hours × rate** (mirror AC-14).
  FE math is display only — the BE re-validates and is the source of truth. **Fern is stood down; @Porter stands him
  up when this is cut.**

## Out of scope (from the REQ, restated)
Automatic/campaign rules, promo codes, catalogue price changes, VAT fields. **Card surcharge** is deliberately
excluded and tracked separately (Porter). *(Trial/single-session are now IN scope at the day-end moment — the
earlier draft's exclusion is withdrawn per the owner-final re-scope.)*
