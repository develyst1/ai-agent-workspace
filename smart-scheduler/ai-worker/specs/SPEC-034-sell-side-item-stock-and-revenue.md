# SPEC-034 — Sell side of the item model: catalog-sourced sale, stock decrement, block-at-0, revenue

- Source: REQ-035 (คุณฟีน 2026-08-03). The income mirror of the freelance-ceiling expense flow (REQ-006 model).
- Status: DESIGN. **HIGH** but **no hard deadline — "rides the go-live push."** See the go-live read (§7).
- Grounded in `bo` schema + the sale path (read 2026-08-04).

## 1. What already exists vs what's new (this reshapes the whole REQ)

- ✅ **Stock fields already exist:** `bo.item.ceilingQty` + `remainingQty` (nullable) — the freelance ceiling uses
  them. **Stock = reuse these** (`ceiling null ⇒ unlimited`; block-at-0 only when set). No new stock column.
- ✅ **Revenue already posts** at sale via `recordSale` (a signed `bo.movement`, value = price). Course/voucher post
  at sale (`:1045`/`:1279`); trial/single at day-end. **No new revenue concept.**
- 🔴 **New #1 — a structural `kind` on `bo.item`** (a MIGRATION): `FIRST_TRIAL | SINGLE_SESSION | COURSE_PACKAGE |
  VOUCHER | RETAIL`, mapping **1:1** to the 4 booking types (RETAIL = POS, no booking). **Not a badge** — a mistag
  would break the sale branch. Seed sets it from the `external_ref` pattern (`course-*`→COURSE_PACKAGE, `session-*`→
  SINGLE_SESSION, `voucher-*`→VOUCHER, `first-trial`→FIRST_TRIAL). Reseeding is owner-approved if the map isn't clean.
- 🔴 **New #2 — the sale draws stock atomically + blocks at 0**, mirroring the freelance ceiling.
- 🔴 **New #3 — the backoffice Items screen sets/shows stock** (remaining / "—" unlimited) + revenue per item.

## 2. The atomic sale draw — mirror the freelance ceiling, in-tx (a deliberate posture change)

Today the sale's revenue movement is `void recordSale(...)` — **best-effort, post-commit** (the TASK-066 rule:
"revenue must never fail the sale"). That rule existed because `recordSale` used to be an **HTTP hop**. It no longer
is — `bo` is the **same DB**, written directly via Drizzle, exactly like the freelance ceiling, which has posted
in-tx since day one and never broke. So for a **sellable item**, move the draw **into the sale's transaction**:

> On a course/voucher sale, **inside the sale tx**: if the catalog item has a `ceilingQty` set and `remainingQty <= 0`
> → **refuse** (`OUT_OF_STOCK`, clear reason); else **decrement `remainingQty`** (when set) and **post the
> `bo.movement`** (revenue + the signed stock qty) — one atomic outcome. `ceiling null ⇒ unlimited` (post the movement,
> no decrement, no block). **Idempotent** on the existing sale idempotency key (no double-count on retry).

- **Reuse `drawCeilingHour`/`reconcileRemaining`** (the freelance ceiling math) — one definition of "draw against a
  ceiling", income and expense. **Cancel/refund reverses** (restore `remainingQty` + the reversing movement), exactly
  as the freelance cancel already does.
- ⚠️ **This is the one posture change to confirm:** the sale's revenue+stock movement becomes **in-tx atomic** (a
  block-at-0 *can* fail the sale — intended; and revenue can no longer silently no-post — the TASK-066/067 win). It's
  safe because `bo` is same-DB; it is **required** for atomic block-at-0 (§6). REQ-035 §Constraints asks for exactly
  this ("atomic decrement inside the sale's transaction, not a laggy cross-service HTTP call").

## 3. Q1 (the crux) — subject picker stays; the catalog item is the mapped one

Catalog items are per **price-group × size** (`course-bike-skate-6`); the frontoffice needs a **subject** (Inline vs
Surfskate) for teacher assignment, and several subjects share a price-group. **Recommendation (and the REQ's lean):
keep the SUBJECT picker; the sale draws the catalog item mapped via `price_group` + size** (`resolvePriceGroup` already
does subject→group). So selling subject X (group G) size 6 draws `course-G-6`'s stock. "Lists come from the catalog"
(AC #1) is already true in spirit — the *offered* sizes come from `sellablePackages()` (derived from the catalog card);
this REQ adds the **stock/remaining** the picker shows and the block-at-0. **@Porter — confirm subject-picker + mapped
draw** (vs a raw catalog-item picker, which would lose the subject).

## 4. Both directions, unlimited (REQ §4)
`ceiling null ⇒ unlimited` already holds for the expense side (an uncapped freelance/cost item records spend with no
limit). The income side gets the same: an uncapped INCOME item sells any quantity, just posting revenue. **One rule,
both directions** — no special-casing.

## 5. Board manages stock — the existing backoffice Items screen (Q3)
Add a **stock/ceiling field** to the existing `backoffice-front` Items screen (set a number, or leave blank =
unlimited); show **`remaining / ceiling`** (or "—/unlimited") + the revenue per item. The `kind` shows as a
(read-only, structural) property. No new screen.

## 6. Q2 answer
`recordSale` **already posts the revenue movement** (best-effort). So this REQ is **+stock decrement, +block-at-0,
+in-tx atomicity (§2), +the `kind` column, +the catalog-sourced stock on the picker, +the backoffice stock field** —
not a new money mechanism.

## 7. 🗓️ Go-live read (@Porter) — HIGH but bigger than REQ-037; recommend staging
Honest: this is **larger than REQ-037** — a **migration** (`kind`) + a change to the **LIVE sale/revenue path**
(best-effort → in-tx atomic, the flow that already had the TASK-066 silent-failure incident) + a **backoffice screen**.
Rough: **~2 BE days** (migration+seed + the in-tx atomic draw/block/cancel-reverse with a careful pass on live money)
+ **~1 FE day** (the Items stock field). REQ-035 has **no hard deadline** ("rides the push").
- **My recommendation:** since REQ-030/031/037 are the committed go-live set and this touches the live money path,
  **confirm whether REQ-035 is wanted for 08-20 or is a fast-follow.** If wanted for go-live, a clean **stage split**:
  **Stage 1** — the `kind` column + block-at-0 + atomic draw on the existing sale (the correctness core); **Stage 2** —
  the backoffice stock-management screen + any picker unification. Stage 1 is what makes stock *real*; Stage 2 is how
  the board *edits* it. **Not my call to prioritise — @Porter routes it against the committed go-live set.**

## 8. Tasks (cut on the go-live-vs-fast-follow call)
- **BE TASK-116** (backoffice-back) — `kind` column migration on `bo.item` + seed/reseed sets it 1:1 with booking
  types; `bo.item` DTO exposes `kind` + `remaining/ceiling`. (Owns `bo`; drizzle-verify gate applies — REQ-032.)
- **BE TASK-117** (scheduling-back) — the **in-tx atomic sale draw**: block-at-0 on a stock-limited sellable, decrement
  `remainingQty`, post revenue in-tx (replacing `void recordSale` for sellables), cancel/refund reverses; reuse
  `drawCeilingHour`/`reconcileRemaining`. **Careful pass — live money.** Tests: block-at-0, unlimited sells freely,
  decrement+revenue atomic + idempotent on retry, cancel restores.
- **FE TASK-118** (backoffice-front) — the Items-screen stock field (set/edit/unlimited) + `remaining/ceiling` +
  revenue-per-item display + read-only `kind`.
