# TASK-158: Onewheel prices + reconcile + SINGLE_SESSION guard (REQ-061) (BE)

- Source: SPEC-058 (REQ-061)
- Status: DONE (SA-reviewed Sober 2026-08-22) — code complete; Part C deploy waits on Porter's REQ-037 confirm (non-blocking to A/B)

## Review
**PASS ✅ (SA-reviewed Sober 2026-08-22).** Reproduced: `bunx tsc --noEmit` **0** · `bun test` **631/0** (+8, 3
corrected). Read the code:
- **Part A** — `CARD.onewheel = {1:1690, 4:5790, 6:7900, 10:11900}` (one edit, one add); the two false "no 10 h"
  comments corrected (not just the constant — good: the comment would have re-seeded the bug), and the 3 stale card
  tests fixed and re-labelled to REQ-061. That's the expected shape of a price correction, not collateral.
- **Part B** — `lib/price-reconcile-plan.ts` is clean and correctly bounded: `changes` (mismatch), `matching`,
  `missing` (→ pointed at `ensure-items`, **never created here**), `orphans` (**reported, never deleted** — they
  still have posted movements). Updates only `unit_price_minor` where it differs; **no `bo.movement` ever
  rewritten**; idempotent. Dry-run lists every change with both baht figures — that listing is the right review gate
  for a live money edit. This is a better answer than the board's earlier "hand-edit in backoffice".
- **Part C** — guard at the shared insert seam (`:779`, beside the VOUCHER guard):
  `SINGLE_SESSION && !isSellable(resolvePriceGroup(...), 1)` → 409 `SINGLE_SESSION_NOT_PRICED`, bilingual, names
  1st Trial. `isSellable(group,1)` = the catalogue is the rule, no second list.
- **Test coverage is consistent with house practice, checked deliberately:** this repo unit-tests **pure predicates
  + validation** and never DB-touching service seams (every test uses a lazy DATABASE_URL that never connects). So
  the guard's *predicate* `isSellable("bike-skate",1)===false` is unit-tested (sale-items.test.ts), and the one-line
  seam application rides Tanya's dev check — **exactly how the sibling VOUCHER guard on the same seam is covered.**
  Not a gap.

**Verdict: DONE (code).** Parts **A+B are independently deployable and should not wait** on anything — the money fix.
**Part C is correct and safe** but see Q1 routing below.

## Answers to Jason's questions
- **Q1 (REQ-037 consequence) → routed to @Porter, and the guard is the safe default either way.** You're right to
  want it decided, and I've flagged it to Porter. But note: refusing an unpriced single hour is **strictly safer than
  the status quo** (which silently books it and posts nothing). So Part C does **not** need to block on Porter — worst
  case, if the customer really sells an off-card blue-block hour, the fix is **"add the price to `CARD`"**, not
  "loosen the guard". Ship it; Porter's answer only decides whether a price gets added later.
- **Q2 (orphans report-only) — agreed, correct.** Deleting an item with posted movements is a different blast radius;
  if a real orphan appears it's its own REQ, never a flag on this tool. Keep it report-only.
- Assignee: @Jason (BE)
- Depends on: none. BE-only, no migration. **Money-sensitive** — dry-run-first on every DB touch; posted movements
  never rewritten.

## Part A — catalogue fix (`src/lib/sale-items.ts`)

1. `CARD.onewheel` 6 h: **7,990 → 7,900** (`sale-items.ts:62`).
2. `CARD.onewheel`: **add 10 h = 11,900** (defines `course-onewheel-10`, makes `isSellable("onewheel",10)` true).
3. Fix the comment at `sale-items.ts:11` — drop the false "Onewheel has no 10 h"; **keep** "Balance Play has no 4 h"
   (confirmed correct by the card).
- **DoD:** a diff of `sellablePackages()` shows **exactly two changes** — one edit, one addition (AC-3); Balance
  Play still has no 4 h and refuses loudly (AC-5). Unit-test both.

## Part B — `sale:reconcile-prices` (new owner-run script; the existing rows are already wrong)

Both boxes are already seeded with `onewheel-6 = 7,990`, and `sale:ensure-items` is **insert-only** — so it will
create `onewheel-10` but never fix `onewheel-6`. This script is the update half.

- `scripts/reconcile-sale-prices.ts` → `"sale:reconcile-prices"`. For every item in `sale-items.ts`, compare the
  **stored `bo.item` price** to the **catalogue price**; print each mismatch `code: stored → catalogue`.
- **Dry-run by default** (`__dry_run_rollback__`); `--commit` updates only the mismatched rows, one tx, no DDL.
- **Safe to update now:** Porter verified no `pricePlaceholder` rows and no hand-set prices on either box, so
  `sale-items.ts` is the source of truth; the dry-run diff is the review gate. (This is why it's a **separate**
  script, not a change to `ensure-items`' deliberate insert-only contract.)
- **Idempotent:** a second run finds 0 mismatches.
- **PII:** none — sale-item codes/prices only; console diff is fine.

## Part C — guard SINGLE_SESSION where the group has no 1-hour price (`scheduler.service.ts`)

- At the **shared booking-insert seam** (~`:772`, beside the existing VOUCHER price-group guard): if
  `input.bookingType === "SINGLE_SESSION"` and **`!isSellable(await resolvePriceGroup(input.subjectId, exec), 1)`**,
  `throw badRequest(<the bilingual wording below>)`. `isSellable(group, 1)` is the catalogue's own "has a 1-hour
  price" test — no second list.
- This seam covers the standalone Single tab **and** the REQ-037 extra session (both go through `createBooking`).
- **Wording:** TH `โปรแกรมนี้ไม่มีราคาแบบรายชั่วโมง — ถ้าเป็นการมาครั้งเดียว ให้จองเป็น "ทดลองเรียน (1 ชม.)" หรือเปิดเป็นคอร์ส 4/6/10 ชม.` ·
  EN `This program isn't sold by the hour — for a one-off visit book a 1st Trial (1 hr), or open a 4/6/10-hour course.`
- **DoD:** AC-6 — SINGLE_SESSION on `bike-skate` refused with that wording; `FIRST_TRIAL` on the same program still
  books. AC-7 — SINGLE_SESSION still books on onewheel / balance-private / balance-group. Unit-test all three.

## Definition of Done (whole task)

- [ ] Part A: `sellablePackages()` diff = exactly two changes; comment corrected; tests green.
- [ ] Part B: `sale:reconcile-prices` dry-run lists `onewheel-6: 7990 → 7900` and writes nothing; `--commit` fixes
      it; re-run finds 0. Pure compare helper unit-tested.
- [ ] Part C: the guard refuses SINGLE_SESSION on no-1h groups with the wording; FIRST_TRIAL and 1h-group
      SINGLE_SESSION unaffected; unit tests pin AC-6/AC-7.
- [ ] `bunx tsc --noEmit` 0 · `bun test` green.
- [ ] You run **nothing** against a DB. **Runsheet (AC-8), BOTH boxes:** `code deploy → sale:ensure-items`
      (creates `onewheel-10`) `→ sale:reconcile-prices` (fixes `onewheel-6`) → verify on the box
      `onewheel-6 = 7,900` · `onewheel-10 = 11,900`. Posted movements never rewritten.

## Notes / Questions

(Jason fills in. **One consequence to surface for Porter:** Part C's guard also refuses a REQ-037 "extra paid
session" on a blue-block course — correct under the owner's pricing model, but it narrows that feature; Porter to
confirm acceptable. Do not rewrite any posted `bo.movement` — Q2 is closed, none exist.)

## Implementation Notes
**Files:** `src/lib/sale-items.ts` (Part A) · `src/lib/sale-items.test.ts` (3 stale card assertions corrected) ·
`src/lib/price-reconcile-plan.ts` + `.test.ts` (new, Part B) · `scripts/reconcile-sale-prices.ts` (new) ·
`package.json` (`sale:reconcile-prices`) · `src/services/scheduler.service.ts` (Part C).

**A — catalogue.** `onewheel: { 1: 1690, 4: 5790, 6: 7900, 10: 11900 }` — one edit, one add, exactly as specced.
I also corrected the **two comments that stated the opposite** ("Onewheel has no 10 h") in `sale-items.ts`, and
the matching test whose name asserted it. Those were wrong about the product, not merely stale, so leaving them
would have set up the next reader to re-introduce the bug. **Three existing tests had to change** — they
transcribed the old card (`6 h = 7,990`, "no 10 h", 9 course rows). That is the expected shape of a price
correction, not collateral damage, and each now names REQ-061 so the change is traceable rather than mysterious.

**B — `bun run sale:reconcile-prices`.** Pure `planPriceReconcile` + a thin script, house pattern.
- **Dry-run by default**, every change printed as `code (name): 7,990.00 → 7,900.00 บาท` before anything is
  written — that listing *is* the review gate on a live money edit, which is exactly why I'd rather it than a
  manual screen edit too.
- Updates **only `bo.item.unit_price_minor`, only where it differs.** It **never creates** (that stays
  `sale:ensure-items`' single responsibility — a catalogue item with no stored row is *reported* with a pointer
  to that command) and **never deletes**: a code no longer in the catalogue is reported as an orphan, because it
  still has posted movements pointing at it. **No `bo.movement` is ever rewritten** — history stays as sold (Q2).
- Idempotent: a second run finds 0.

**C — the SINGLE_SESSION guard**, at the shared insert seam beside the VOUCHER one:
`SINGLE_SESSION && !isSellable(group, 1)` → 409 `SINGLE_SESSION_NOT_PRICED`, bilingual, naming 1st Trial. Using
`isSellable(group, 1)` means the **catalogue is the rule** — no second list to drift, which is the same principle
the file's own header states.

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **631 pass / 0 fail** (74 files; +8 reconcile tests, 3
corrected). New tests pin what the money tool must *not* do: never create, never delete, never touch a matching
price, and a plan carrying no field but a price. ⚠️ **I ran nothing against a database.**

**Deploy (AC-8), both boxes:** code → `bun run sale:ensure-items` (creates `course-onewheel-10` @ 11,900) →
`bun run sale:reconcile-prices` (dry run, read the list) → `--commit` (fixes `course-onewheel-6` → 7,900) →
verify. Order matters: reconcile only updates rows that exist, so `ensure-items` must go first.

## Questions
- Q1 — 🔴 **the REQ-037 consequence you surfaced is real, and I want it decided before this ships.** The guard
  sits on the shared insert seam, so an **extra paid single hour on a bike/skate course** is now refused too
  (bike/skate has no 1-hour price). That is correct under the owner's model but it **narrows a shipped feature**,
  and the failure the customer would see is a booking they used to be able to make. If Porter confirms they do
  sell an off-card single hour there, the fix is "add the price to the card", not "loosen the guard" — one line
  in `CARD`, no code change. **Please don't let this deploy ahead of that answer.**
- Q2 (small): `sale:reconcile-prices` reports orphans but does nothing about them. Deliberate — deleting an item
  with posted movements is a different decision with a different blast radius. If a real orphan ever appears, it
  should be its own REQ, not a flag on this tool.

  > answer: (Sober)
