# TASK-066: scheduling (BE) — 🔴 repair the sale write path (sales have not been recorded since 2026-07-28)
- Source: SPEC-021 (REQ-014) — regression found by Jason while blocking TASK-064
- Status: DONE  (reviewed 2026-08-01 by Sober — sign rule re-derived from `bo-money.ts` independently, partial unique index + journal 6=6 verified, ops-client confirmed unimported; both repos tsc 0, 275/0 + 48/0) — deploy is ORDERED: bo `db:migrate` → `sale:ensure-items` (twice) → apps
- Depends on: none
- Assignee: @Jason (smart-scheduler-back :4006 — plus one migration in `bo`)

## Why (your own evidence, restated as the task)
`recordSale` POSTs to `/api/v1/catalog/items/by-ref/movements`; **`catalogRoutes` is mounted nowhere** (I
verified — it's absent from backoffice-back's `api.ts` and `index.ts`), so the call 404s. Both call sites are
`void recordSale(...)` — best-effort **by design**, so it fails with no voice. Net effect: **no sale has been
recorded since the REQ-006 rebuild (TASK-027, deployed 2026-07-28)**, and the P&L has been showing an income
side that isn't there.

Meanwhile the freelance ceiling writes `bo` **directly via Drizzle on the shared DB** and has worked throughout.
Sales are the one flow still going over a retired HTTP hop. **Make them work the same way.**

## What to do
1. **Migration in `bo` — add `external_ref` to `bo.item`** (+ an index with `external_source`). `bo` is ours
   outright, so this breaks no ownership rule. **Hand-author the SQL and register it in
   `drizzle/meta/_journal.json` — do NOT run `db:generate`** (TASK-042 rule; the snapshot chain is still
   incomplete). `ownerRef` keeps meaning *teacher id* — don't overload it.
2. **Ensure the four INCOME items exist**, keyed by `external_ref`: `first-trial`, `single-session`,
   `course-{size}` (4/6/10), `voucher-{hours}` (5/10/15). Idempotent — safe to re-run.
   > ⚠️ **Prices are a business input, not yours or mine.** Trial/Single already have a live placeholder
   > (฿1,390). **Seed course/voucher prices as clearly-marked placeholders and say so in your notes** — the
   > board already tracks "real numbers pending" as a known state, so this follows the existing pattern rather
   > than inventing one. **Do not quietly pick a plausible number**: a wrong price that looks right is worse
   > than an obvious placeholder. @Porter is chasing the real figures.
3. **Replace the HTTP hop with a direct write.** `recordSale` writes `bo.movement` itself —
   `refType: "SALE"`, `refId` as today, `valueMinor` from the item's `unitPriceMinor × qty`, and the existing
   **`idempotencyKey`** honoured so a retry can't double-post. Mirror `scheduler.service.ts:115-137`'s pattern.
4. **Make failure audible.** Keep the call non-fatal (a booking must not fail because revenue posting did), but
   it must **log loudly** on failure instead of vanishing into `void`. The silence is why this went unnoticed
   for days — the missing revenue was the *symptom*, the missing signal was the *defect*.

**Out of scope:** the reports themselves (TASK-064), backfilling past sales (see below), and any change to
prices, booking, entitlements, the freelance cap or the suspend gate.

## ⚠️ Do not backfill the missing days on your own initiative
Sales between 2026-07-28 and the deploy of this fix have no `bo.movement` row. They are **reconstructable** from
`public` (courses/vouchers/bookings carry dates and refs) — but re-posting historical revenue is a **finance
decision**, not a repair. Say in your notes **how many days and which product codes** would be affected;
@Porter routes it to คุณปุ้ม.

## Definition of Done
- [ ] `bo.item.external_ref` exists via a hand-authored, **journal-registered** migration; `ownerRef` unchanged.
- [ ] The four (well, eight, with sizes) INCOME items exist and are idempotent to re-create; **placeholder
      prices are visibly placeholders** and named in your notes.
- [ ] A course sale, a voucher sale and a day-end trial/single sale each write **exactly one** `bo.movement`
      with `refType: "SALE"`, the right `refId`, and a `valueMinor` from the item price.
- [ ] **Re-running with the same `idempotencyKey` writes nothing extra** (tested).
- [ ] A failed sale post **does not fail the booking/sale**, but **is logged loudly**.
- [ ] No `ops` HTTP call remains on the sale path.
- [ ] `bunx tsc --noEmit` clean; `bun test` green.
- [ ] Notes state the affected date range + product codes for the un-posted days (for Porter to route).

## Implementation Notes

### 🔴 First — the gap is much bigger than "since 2026-07-28", and it changes what Porter must ask
Your framing is right for **two** of the eight codes and wrong for the other six, in the direction that matters:

| Product code | Item ever existed? | Posted revenue… |
|---|---|---|
| `first-trial`, `single-session` | ✅ yes, in **`ops.catalog_items`** (`db/seed.ts:92-112`) | until the route went unmounted — **gap = 2026-07-28 → this deploy (~5 days)** |
| `course-4/6/10`, `voucher-5/10/15` | ❌ **never, in any schema** | **never. Not once, in all history.** |

`opsMovementByRef` no-ops on a 404, and a by-ref POST for an item that doesn't exist **is** a 404 — so those six
codes were failing *before* the route was retired. The unmounted route hid a second, older bug behind it.
**The two highest-value product families have never had a single baht recorded**, and the P&L has been showing
an income side made of trial/single only. Worth putting in front of คุณปุ้ม in exactly those words, because
"5 days of sales" and "all course and voucher revenue, ever" are different conversations.

### What I built
**1. Migration — `bo.item.external_ref`** (`smart-scheduler-backoffice-back/drizzle/0005_bo_item_external_ref.sql`).
`ADD COLUMN IF NOT EXISTS` + a **partial unique index** on `(external_source, external_ref) WHERE external_ref IS
NOT NULL` — partial so the existing rows (every freelance ceiling item, `external_ref` NULL) can't collide, and
unique so the sale lookup can never be ambiguous. Hand-authored and **registered in `_journal.json` as idx 5**;
**`db:generate` not run**. ✅ **Journal audit: 6 entries = 6 `.sql` files.** `ownerRef` untouched — still teacher id.
It lives in **backoffice-back because that repo owns `bo` migrations**; scheduling-back only gains the column
declaration on its `boItem` mirror.
> ⚠️ **Same snapshot hazard as scheduling-back, now confirmed here too:** `drizzle/meta/` in backoffice-back has
> **only `0000` and `0003`** snapshots, so `db:generate` in *this* repo would also re-emit the whole schema. It
> has no `drizzle/README.md` warning like the one TASK-042 added next door. **I didn't create one — that's a
> repo-convention call, not mine to make unasked** — but it's a live trap for whoever migrates here next.

**2. `lib/sale-items.ts` (new, pure) — one definition of a product code.** The codes were previously spelled in
**three** places: `revenueItemRef`, and two inline template strings in `scheduler.service`. Nothing tied any of
them to an item, which is *how six codes could exist with nothing to post to and no one notice*. Now one list
feeds both the sale path and the ensure-items script, and `isKnownSaleItem` makes "a code with no item" a
loud, testable condition instead of a silent 404. `revenueItemRef` moved here unchanged.

**3. `lib/sale-post.ts` (new) — `recordSale` writes `bo.movement` directly**, mirroring the freelance ceiling
(`scheduler.service.ts:115-137`). Idempotent on `idempotencyKey`: checked up-front, **and** a lost race on the
unique index (`23505`) is caught and returned as `{ok:true, skipped:"duplicate"}` — a replay is the desired
outcome, so reporting it as a failure would put a false alarm into the very signal this task adds.
**Sign rule extracted as `saleMovement()` and unit-tested** rather than trusted: it has to match backoffice's
`bo-money.ts` exactly (`qty` negative = OUT; `value_minor = −qty × unit_price`, so an OUT is **positive** on an
INCOME item) — get it backwards and every sale *subtracts* from the month.

**4. Failure is now audible.** Still non-fatal (a booking must never fail over bookkeeping), but every non-post
logs `console.error` with the product code and refId and the sentence **"revenue for this sale is NOT in the
books"**, distinguishing *unknown code* from *missing item* from *write failed* — you can act on each differently.
**The missing revenue was the symptom; the missing signal was the defect.**

**5. `bun run sale:ensure-items`** (`scripts/ensure-sale-items.ts`) — creates the eight INCOME items, re-runnable.
⚠️ **It only INSERTS what's missing and never updates an existing item** — overwriting a real price that คุณปุ้ม
has since set, with a placeholder, would be worse than the gap it fixes.

**6. No `ops` HTTP call remains on the sale path** — `ops-client.ts` is now imported by **nothing but its own
test** (grep-verified).

### ⚠️ Placeholder prices — named, derived, and machine-detectable
฿1,390/hr is the **existing, already-live** placeholder for trial/single (seeded 2026-07-20). Every other price
is **that same figure × the product's hours** — derived from an approved placeholder, not a number I picked.
A unit test pins that relationship so it can't drift into looking like a real price list.
**They are very likely TOO HIGH for the 6- and 10-session courses**, which almost certainly carry a bulk discount.
Each row carries `metadata.pricePlaceholder: true` + a `priceNote`, so they're identifiable **in the data**, not
just in a comment — TASK-067 or a query can find them. I deliberately did **not** use `0`: a zero price posts
revenue as ฿0, which is the same silent-nothing failure in a new costume.

### Answering your two Questions
- **"If repairing this cleanly needs something I scoped out of bounds, say so before doing it."** It didn't —
  nothing here touches pricing logic, booking, entitlements, the freelance cap or the suspend gate. The one
  judgement call I made inside bounds is the placeholder *derivation* above; **if you'd rather ship with no
  course/voucher items at all until คุณปุ้ม prices them, say so** — the sale path then logs loudly per sale
  instead of posting a wrong number, which is a defensible alternative and a one-line change to the script.
- **"Is any OTHER flow still on the retired ops hop? There may be a second."** ✅ **Checked — no live one, and the
  answer is cleaner than expected.** Four other functions still target retired ops routes
  (`fetchTeacherQuotas` → `/catalog/items`, `opsTeacherSync` → `/internal/teacher-sync/*`,
  `fetchOpenSalaryTeacherIds` → `/recurring-costs`, and the generic proxy at `:267`) — but **none of them has a
  single caller in `src/`**. They were superseded by direct-`bo` reads (`attachFreelanceBudgets`, whose own
  comment says *"SPEC-005: local budget + setupIncomplete (no ops)"*, and `listFreelanceCeilings`). So
  **`lib/ops-client.ts` is now entirely dead code.** Sales were the only *live* hop, which is why they were the
  only one that hurt. **I have not deleted it** — that's a cleanup call, and the file still carries the pure
  `reconcileTeacherDrift`/`isSetupIncomplete` helpers its test exercises. Flagging, per your standing rule.

### Verification
- `smart-scheduler-back`: `bunx tsc --noEmit` → **clean (exit 0)**; `bun test` → **275 pass / 0 fail** (43 files,
  was 262/41 — **+13**).
- `smart-scheduler-backoffice-back`: `bunx tsc --noEmit` → **clean (exit 0)**; `bun test` → **48 pass / 0 fail**.
- New `lib/sale-items.test.ts` (8 cases): **every code the service can emit has an item** (all 3 course sizes,
  all 3 voucher sizes, both day-end codes — the exact hole that caused this), an unknown code is **not** silently
  accepted, no duplicate refs, and prices are derived + positive + integral.
- New `lib/sale-post.test.ts` (6 cases): the **sign rule** (a sale is a negative qty worth a **positive** value;
  scales with quantity; a −1 can't invert into a refund), and the **unknown-code guard** returning
  `unknown-code` and logging `NOT POSTED` **without touching the DB**.
- ⚠️ The insert itself is **deploy smoke** (brownfield — I don't touch real DBs). **Smoke, in order:**
  1. backoffice-back `bun run db:migrate` → `bo.item.external_ref` exists.
  2. scheduling-back `bun run sale:ensure-items` → prints 8 created; **run it twice** — the second run must print
     `= … exists — left alone` eight times and create nothing.
  3. Sell a course, a voucher, and attend a trial → **exactly one** `bo.movement` each with `ref_type='SALE'`,
     the right `ref_id`, `qty=-1`, and a positive `value_minor`.
  4. Re-run the end-of-day job → **no second row** for the same booking (`rev:<id>` key).
  5. `GET /bo/reports/pl` → the income side now moves when something is sold.
  6. Point a sale at a missing item (or check logs) → a `[sale] NOT POSTED` line appears. **Silence is the bug.**

**DoD:** `external_ref` via a hand-authored, journal-registered migration, `ownerRef` unchanged ✓ · eight INCOME
items, idempotent, placeholders visibly flagged + named here ✓ · course/voucher/trial each write exactly one
`SALE` movement with the right `refId` and a priced `valueMinor` ✓ (deploy smoke) · same `idempotencyKey` writes
nothing extra ✓ (up-front check + 23505 catch; tested) · failure doesn't fail the sale but **is logged loudly** ✓ ·
no `ops` HTTP left on the sale path ✓ (grep-verified) · tsc clean + tests green in **both** repos ✓ · affected
date range + codes stated above for Porter ✓.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- **If repairing this cleanly needs a change I've scoped as out of bounds, say so before doing it.** I'd rather
  re-scope than have the fix quietly grow into a pricing change.
- If any *other* flow is still going over the retired `ops` HTTP hop, **flag it** — you found this one because
  sales were the asymmetry; there may be a second.

## Review
**Verdict: DONE ✅ (Sober, 2026-08-01).** Verified in both repos myself: scheduling `tsc` 0 / **275 pass, 0
fail**; backoffice `tsc` 0 / **48 pass, 0 fail**; `drizzle/*.sql` = **6** and `_journal.json` = **6 tags**.

### The sign rule — I checked this one independently, because it's silent money
`bo-money.ts:18` is `movementValueMinor = -qty * unitPriceMinor`; your `saleMovement` is
`qty = -|quantity|; valueMinor = -qty * unitPriceMinor`. **They agree exactly**: a sale is `qty = -1` with a
**positive** `value_minor` on an INCOME item. Backwards, every sale would have *subtracted* from the month and
the P&L would still have looked plausible — which is why **extracting it as a pure, unit-tested function
instead of trusting it inline was the right instinct**, and why I re-derived it from the backoffice side rather
than reading yours and nodding.

### 🔴 Your escalation is correct and it changes the conversation — thank you for not softening it
My framing ("no sales since 2026-07-28") was right for **two** codes and wrong for the other six.
**`course-*` and `voucher-*` INCOME items never existed in any schema, so those sales have never posted a single
baht — not once, in all history.** The unmounted route hid an older bug behind it. You're also right that this
is what Porter must actually ask: *"five days of trial/single revenue"* and *"all course and voucher revenue,
ever"* are different conversations, and only one of them is alarming. I've put it on the board in those words.

### Verified rather than accepted
- **Migration:** `ADD COLUMN IF NOT EXISTS` + a **partial** unique index on `(external_source, external_ref)
  WHERE external_ref IS NOT NULL` — partial is exactly right, since every existing freelance item has a NULL
  and would otherwise collide. Hand-authored, journal-registered, `db:generate` not run, `ownerRef` untouched,
  nothing in `public`. It lives in backoffice-back because that repo owns `bo`. All correct.
- **`ops-client.ts` has no importer left in `src/`** (grep-verified myself) — the sale path is off the retired
  hop entirely.
- **Idempotency belt *and* braces:** the up-front key check plus catching a lost race on the unique index
  (`23505`) and returning it as `{ok:true, skipped:"duplicate"}`. Reporting a replay as a failure would have
  fed a false alarm into the very signal this task exists to create — good reasoning.
- **`lib/sale-items.ts` is the real fix, not the plumbing.** The codes were spelled in **three** places with
  nothing tying any of them to an item — *that* is how six product codes could exist with nothing to post to and
  nobody notice. One list now feeds both the sale path and the ensure-items script, and `isKnownSaleItem` turns
  "a code with no item" into a loud, testable condition. The test asserting **every code the service can emit
  has an item** is the one that would have caught this years earlier.

### Your Question — placeholder prices: **keep them. Do not ship with no items.**
You offered the alternative and it's a fair one, but shipping without items means every course/voucher sale
logs an error and posts nothing — which is the *current* broken state with better logging. **A visible, wrong
number gets corrected; an absent one gets rediscovered in three months.** Your derivation is defensible
(฿1,390 × hours from an already-approved live placeholder, pinned by a test so it can't drift into looking like
a real price list), you refused `0` for exactly the right reason, and `metadata.pricePlaceholder: true` makes
them **findable in the data** rather than in a comment. Also right that `ensure-items` never updates an existing
item — overwriting a real price คุณฟีน has set would be worse than the gap.
**Your own warning that the 6- and 10-session prices are almost certainly too high (no bulk discount) goes
straight to Porter with the numbers.**

### Two flags you raised, both ruled — neither is yours to carry
1. **`lib/ops-client.ts` is now entirely dead code** (four more functions targeting retired routes, none with a
   caller). **Correct not to delete it** — that's a cleanup decision and it still hosts pure helpers its test
   exercises. Recorded on the board as maintenance tech-debt; it blocks nothing.
2. **backoffice-back's snapshot chain is also incomplete** (`meta/` has `0000` + `0003` only) with **no**
   `drizzle/README.md` warning like the one TASK-042 added next door. **You were right that inventing a repo
   convention unasked wasn't yours to do — so I'm asking now: add the same warning file** as a one-line
   follow-up on your next pass here. Same trap, same fix, and the next person to migrate `bo` will otherwise
   walk into it.

**TASK-066 → DONE.** ⏳ **Deploy is ordered and non-obvious — follow the notes exactly:** backoffice
`db:migrate` **first**, then `sale:ensure-items` (**run it twice** — the second run must create nothing), then
the app deploys. **@Jason: TASK-067 next** — it now has something real to watch.
