# TASK-909 — BE: Stock OUT write — sell a cart → SALE movements + a sale record — backoffice-back, Stock block — @Bob

**From @Sober, 2026-11-09. The core sell path: a cart of line items leaves stock and is recorded.** Builds directly on your TASK-904 store (the `bo.item`/`bo.movement` + the atomic locked-transaction + the `NEGATIVE_BALANCE` refusal — REUSE them). Repo `smart-scheduler-backoffice-back`, branch `dong`. Git only on the owner's word. **Chain: report + questions in this TASK `## Questions`; Sober reviews.** Pairs with @Fanta's TASK-910 (the FE sell screen on a fixture that swaps to this).

## Step 0 (mandatory — map, do not guess; in `## Implementation Notes`, file:line)
- **Is there already a sale / revenue-posting path in this repo?** Your 904 note said the sale-posting rows use `external_source = smart-scheduler`. Find how a sale is recorded today (if at all) and how REQ-120's Revenue block expects sales — so Stock OUT **reconciles with** revenue, not a parallel truth. Name what exists. If a sale/revenue table already exists, reuse/extend it rather than adding a rival.
- The movement report mapping you built (`type` from sign/refType): a Stock-OUT line must show as **`SALE`** there.
- REQ-120 §5/§9 Stock OUT: a cart with a **per-item discount** and a **per-item commission** (editable). Read those rows before you shape the body.

## Build
- **`POST /v1/stock/out`** (CEO + admin — `adminAuth`) — body a cart:
  `{ idempotencyKey: string, soldAt?: ISO date, sellerRefs?: string[], lines: [{ itemId, qty (>0 int), unitPriceSatang (int ≥0), discountSatang? (int ≥0), commissionSatang? (int ≥0) }] }`.
  Writes, **all in ONE locked transaction** (reuse 904's `FOR UPDATE` + balance logic):
  - one **SALE movement per line**: `qty = −line.qty` (signed, decrements `remaining_qty`), `refType = SALE`, `refId = <saleId>`, `reason`/note as fit; **a line that would drive the balance below 0 → refuse the WHOLE sale atomically with `409 NEGATIVE_BALANCE { error, model, name, resultingBalance }`** (the same shape/semantics as the import — reuse, do not fork).
  - one **sale record**: a header + lines capturing `unitPriceSatang · discountSatang · commissionSatang · sellerRefs · soldAt · actor`, linked to its movements. This is the source for the Revenue and commission reports.
  - **Idempotent:** keyed on `idempotencyKey` (client-generated, one per confirmed cart) — a re-POST of the same key writes nothing and returns the first result (`alreadyApplied: true`), exactly like 904's re-apply. The per-movement key stays unique (`stock-out:<saleId>:<itemId>`).
- **Response:** `{ saleId, movementsWritten, soldAt, alreadyApplied? }`. **No revenue/commission TOTALS in this response** (R0: an admin must not see pay/revenue aggregates; the line prices the admin typed are fine). The money reports are CEO-gated and separate.
- **Migration (additive) if a sale table is needed:** e.g. `bo.sale` (`id · soldAt · seller_refs jsonb · actor · idempotency_key UNIQUE · created_at`) + `bo.sale_line` (`sale_id · item_id · qty · unit_price_minor · discount_minor · commission_minor · movement_id`). **Forward-looking columns so the commission-distribution follow-on does not re-migrate.** Additive only; applied + verified on sid (host .206 checked first, F-038); witness. OR state "no migration, reused <table>".

## Explicitly OUT of scope (the commission-DISTRIBUTION follow-on, a later TASK — do NOT build here)
- **No commission math:** store `commissionSatang` per line **as given** (default 0/null). Do NOT default it from a group rate, do NOT split among sellers, do NOT touch the FT pool, do NOT enforce admin-lower-vs-raise. That whole layer (REQ-120 R1.3/§9, tied to Salary + managed commission groups) is a separate TASK once groups-with-rates exists. 909 is the inventory + sale-record truth only.
- No Revenue-report screen, no coach-pay link.

## Done = (evidence in `## Implementation Notes`)
- tsc 5.9.3 → 0 · DB-less suite green · tests: a cart decrements each line once; a negative line refuses the whole sale atomically (nothing written, balance unchanged); re-POST same idempotencyKey = no double-write; a SALE shows in the movement report as type SALE; sale record totals = Σ(lines).
- A sid rolled-back real-store check (host-only check first) over real `bo.item`, residue 0.
- `/security-review` line (admin sees no revenue totals; body validated; atomic). Any migration additive + verified on sid. `git status` = only your files; no `smart-scheduler-back`; no git command.

## Claim
backoffice-back: `POST /v1/stock/out` + its service (reuse the 904 store) + the sale record/migration + tests. Reuse 904's movement/balance/NEGATIVE_BALANCE code — do not duplicate it. **Sober reviews.**

## Questions / Implementation Notes / Review
_(—)_

## Note (Sober, 2026-11-09) — sellerRefs validation; NO new seller-list read needed
The FE (TASK-910) gets its seller picker from the EXISTING `GET /v1/salary/entries/people` (TASK-886, admin-safe: active names + meritEligible, no pay). So **909 does NOT need to expose a seller list.** It should just **validate `sellerRefs` against active people** (reuse the people model the salary spine already has) and reject an unknown/inactive ref with a clear 400. Store the validated refs on the sale record. (Error shape: use the app's standard `{ error: { code, message, details } }` envelope — same as the NEGATIVE_BALANCE alignment.)

## Step 0 map (Bob, 2026-11-09) — what exists, and what 909 reconciles with
- **Sale movements today (the front office's):** a sale of a course / voucher / trial is a `bo.movement` with `refType 'SALE'` posted by smart-scheduler-back onto `bo.item` rows whose `external_source = 'smart-scheduler'` (`external_ref` = the product code `course-6`, `voucher-10`…; `lib/revenue-attribution.ts:3`). `value_minor = −qty × unit_price` (positive on an OUT; `lib/bo-money.ts`). They feed the legacy P&L (`item.service getPLReport`). **Stock products are a different population** (`external_source = 'stock'`, 904): 909 does not touch the smart-scheduler items and the attribution code never sees a stock sale.
- **The Revenue ledger is the truth for revenue:** `bo.revenue_line` (`schema-revenue.ts:28`): types `COURSE · TRIAL · VOUCHER · ECA · SALES · FNB · RENT · OTHER · REFUND`; its `source` comment already reserves **`'STOCK'`** («later 'BOOKING' | 'ECA' | 'STOCK' | …»); categories seeded SALES = Miller · Inline Skate · Bike · Safety, FNB = Drink · Snack, OTHER = Shirt · Sock · Bag (`lib/revenue-ledger.ts:27-29`). REQ-120 R2.2 (line 92): «SALES · F&B · OTHER — **from SALES RECORD automatically, net of discount**»; R3.5: «Saving it cuts stock and **posts revenue**».
- **The movement report:** `movementTypeOf` (904) maps `refType SALE` + a negative qty to **SALE** ✓ (test + sid check).
- **No sale table existed** ⇒ new `bo.sale` + `bo.sale_line` (additive migration 0016).
## Implementation Notes (909)
- `POST /v1/stock/out` (`routes/stock.ts`, `adminAuth` = ceo + admin). Body: your shape **plus four optional, additive fields** the sale record needs and R3.5 names: `branch` (BRAVO|OTHER, default BRAVO), `method` (TRANSFER|CASH|CARD, default none), `buyerRef` (≤ 100), `remark` (≤ 500). `discountSatang` is **off the LINE total** (not per unit) and may not exceed it (a discount equal to the line = a free item is allowed).
- `services/stock-out.service.ts`: ONE transaction — products locked `FOR UPDATE` in id order **before** the key lookup; every line checked before the first write (unknown ⇒ 404 `UNKNOWN_ITEM`, inactive ⇒ 409 `ITEM_INACTIVE`, below zero ⇒ **409 NEGATIVE_BALANCE** via the shared `refuseIfNegative` — the same function the import's apply now calls; the import's inline copy is gone); then the sale header, and per line the SALE movement (`−qty`, `remaining_after`, `ref_type SALE`, `ref_id <saleId>`, key `stock-out:<saleId>:<itemId>`, `value_minor` = line NET (qty × unit − discount), the existing sale convention) and the `sale_line` linked to it. Idempotent on `idempotencyKey` (unique index; a race's loser answers with the winner's result). Response `{saleId, movementsWritten, soldAt, alreadyApplied?}` — **no totals**.
- **Commission: stored as given, never computed** (a source pin forbids rate / split / pool in the service).
- **Error envelope:** per Sober's 904 addendum, NEGATIVE_BALANCE is NOT special-cased any more — the routes add no body; the app's `onError` renders `{error:{code,message,details:{model,name,resultingBalance}}}` for NEGATIVE_BALANCE / STALE / BATCH_NOT_FOUND / UNKNOWN_ITEM alike (904's `negativeBalanceBody` and both catches deleted; the one test re-pointed).
- **Migration `0016_bo_sale`** (schema.ts 2 tables, journal idx 16, witness = the LAST object `bo_sale_line_movement_uq`): `bo.sale (id, sold_at, branch, method, buyer_ref, remark, seller_refs jsonb, actor, idempotency_key UNIQUE, created_at)` + `bo.sale_line (id, sale_id, item_id, qty, unit_price_minor, discount_minor, commission_minor, movement_id UNIQUE)`, CHECKs on branch / method / qty > 0 / money ≥ 0 / discount ≤ qty × unit. Two NEW tables, nothing existing altered. **Applied · verified on sid** (host 154.197.124.206 first; db:verify journal 17, ledger 18, 15 witnesses ✅; queue lines written).
## Report (909) — DONE-pending-review. Nothing committed.
**Evidence:** new `stock-out.service.test.ts` **21 pass** (decrements once, sale record as given, Σ lines, no totals in the response, SALE type in the report, last unit allowed, null balance refused, NEGATIVE refuses the WHOLE cart with nothing written, shared rule, unknown / inactive / malformed carts ⇒ 400/404/409 before any lock, re-POST = first result, lock-before-key order, race ⇒ winner's result, atomic rollback, route auth, body schema, no commission math, migration pins). **Mutation set `stock-out-task909.mutations.json`: 44 mutants, 44 BITE.** 904's set re-run after the envelope change: 73/73 bite. BB full suite **1072 pass · 0 fail**; tsc 5.9.3 → 0. **Sid rolled-back real-store check (host .206 first; C-TEST; residue 0 — sales 0, lines 0, movements 552→552, stock items 0): 9/9 PASS** — the real import creates two items, then the real `sell`: 2 movements, balances 5→3 and 1→0, SALE rows with refId = the sale and value = line net, the sale record AS GIVEN (price 150000 / discount 20000 / commission 4000, sellers, actor, method), re-POST ⇒ alreadyApplied with no second sale, a cart containing the empty item ⇒ 409 NEGATIVE_BALANCE (model C-TEST-2, resultingBalance −1) with the OTHER line NOT decremented and no sale, the report shows 2 SALE rows without money, a non-stock id ⇒ 404.
**/security-review (hand):** (1) AuthN/Z — `adminAuth` (ceo + admin; a coach is 403); the response has no revenue / commission totals. (2) Body — zod: uuid items, integer qty 1–100000, money integers ≥ 0, 1–200 lines, key `[A-Za-z0-9_:.-]{8,100}`, enums for branch / method, lengths capped, extra keys stripped; the service re-checks duplicates, discount ≤ line, soldAt valid and not > 24 h ahead. (3) Atomic: one transaction, items locked, all lines validated before the first write; a failure mid-way rolls everything back (tested). (4) Injection — bound parameters only. (5) Integrity — DB CHECKs mirror the rules (qty, money, discount ≤ line, branch, method); the idempotency key and the movement link are unique. (6) An admin can type any unit price and commission (as specified; admin-lower-vs-raise is the later layer). No High / Medium finding.
## Questions (for Sober)
1. **Revenue posting — now or in the follow-on?** R3.5 says saving a sale «posts revenue» and R2.2 says SALES/F&B/OTHER lines come «from the SALES RECORD automatically, net of discount». I did NOT write a `bo.revenue_line` in 909 (your scope: «the source for the Revenue … reports», no Revenue screen) — but then the ledger does not show stock sales until something reads `bo.sale`. Two ways, both small: **(A)** 909 also writes ONE `revenue_line` per sale (`source 'STOCK'`, `refType 'SALE'`, `refId` = the sale, key `rl:stock:<saleId>`, amount = Σ line net, `method` from the cart) in the same transaction; **(B)** the Revenue report reads `bo.sale_line` directly for the SALES/FNB/OTHER types. (A) needs **a product → revenue type + category mapping** (which stock product is SALES «Miller», «Bike»… vs FNB vs OTHER — today a product has only the free-text «Category» tag from the import) and a rule for a `method`-less sale (the ledger's method is NOT NULL). Which, and who gives the mapping?
2. `value_minor` on the SALE movement = line NET (so the legacy P&L, which sums movements, would count stock sales too — a second place that shows sales). OK, or set it to 0 like the import movements until Revenue decides?
3. The four optional body fields (branch / method / buyerRef / remark): keep? (The FE sell screen, TASK-910, will need method + buyer at least.)

## Review (Sober, SA Lead A, 2026-11-09) — ✅ ACCEPTED with ONE change (value_minor→0); 3 answers
Read the code: response has no totals (`sell` returns only saleId/movementsWritten/soldAt[/alreadyApplied] — test pins it, R0 ✅); NEGATIVE_BALANCE via the shared import fn ✅; bo.sale/bo.sale_line + migration 0016 additive & verified on sid; idempotent; 21 tests / 44-of-44 mutants / 1072-0 / 9-of-9 sid. Strong.

**Q1 — Does 909 post `bo.revenue_line`? NO, not in this task — and nothing is lost.** The money IS captured in `bo.sale_line` (price, discount, commission). Turning that into REVENUE is **Team B's domain** — the Revenue block (R2) is Silver's, with its own model, types and categories — and it needs a product→revenue-type+category **mapping** and a no-payment-method rule, both of which are Silver's model + a customer business rule, not ours to invent. So revenue integration is a **stage-2 cross-team seam**: Silver and I decide **push** (909/stage-2 writes a `revenue_line` via a contract she owns) **vs pull** (her Revenue report reads `bo.sale_line`). I'm raising it with her now; the mapping then goes to the owner via Porter. **909 ships as the authoritative sale; no revenue posting here.**
**Q2 — SALE movement `value_minor`: set it to 0** (change the one test that asserts Σ=net). The movement is **inventory truth only** — same rule as the import (value_minor=0). The money lives in `bo.sale_line` (and the revenue layer); a non-zero value here would shadow-post stock sales into the legacy bo P&L and double-count once revenue posts. Keep money out of the movement.
**Q3 — Keep the 4 optional fields (branch, method, buyerRef, remark): YES, keep all four**, optional/nullable, forward-looking. Do NOT enforce or drop: `method` + the payment record become **required together with revenue posting in the stage-2 payment layer** (same place I deferred payment/buyer/remark for the 910 UI). `branch` nullable default BRAVO is harmless forward-compat (single location today).

**Net: 909 ACCEPTED — make value_minor=0 (Q2), the rest stands.** The revenue seam (Q1) is a documented stage-2 follow-on with Silver, NOT a blocker to 909 or the deploy. Ball: Bob (value_minor→0) → then 909 done; me (open the revenue seam with Silver).

## Bob — value_minor → 0 done (2026-11-09, Sober's ruling)
The SALE movement now carries `value_minor = 0` (inventory truth only; the money lives in `sale_line`, so no shadow-post into the legacy P&L). The test that asserted Σ movement value = net now asserts every movement is 0 and Σ sale_line (qty × unit − discount) = 40000 for the fixture cart. Mutation set 45/45 bite (S7 re-aimed + a net-helper mutant), BB 1072/0, tsc 0. Q1–Q3 closed per Sober: no revenue_line in 909, keep the four optional fields; `occurred_on` on bo.movement is TASK-911.

## Revenue seam SETTLED (Sober, 2026-11-09) — DECISIONS row 21; 909 now POSTS revenue (supersedes my earlier Q1 defer)
Sector + Porter settled it: product-sale revenue = **(a) one `bo.revenue_line` per SALE LINE, through Sector's C1 writer** (one ledger). So 909 posts revenue now. Build into 909 (Bob — this is your 909 + its 904 companion below):
1. **Per sale line, post one `bo.revenue_line` via Sector's C1 writer**, in the SAME transaction as the sale: `amount = line net` (qty×price − discount), `category = ` the product's `revenue_category_id`, `method = ` the sale's method. **Reuse Sector's C1 writer — do not hand-insert**; get its exact signature from Sector via Porter (cross-team). Commission is NOT revenue (it's pay) — never post it as revenue.
2. **Payment method is REQUIRED** (`revenue_line.method` is NOT NULL): the sale body's `method` becomes required; **no method ⇒ 400 METHOD_REQUIRED, nothing written.** (Fanta's 910 adds the select, default Transfer.)
3. **Guard:** a product with **no `revenue_category_id` ⇒ 400 NO_REVENUE_CATEGORY, nothing written** (atomic). This is the later-created-product guard; the import gives every imported product a category (companion below), so day-one sales pass.
4. **Movement `value_minor` STAYS 0** — revenue now lives in `bo.revenue_line`, so the movement must NOT also carry money (that was the point of Q2). Keep 0.
5. Idempotency: the revenue_line write is covered by the same sale idempotency key (a re-POST posts no new revenue either).

## 904 companion (Bob) — the import must set `revenue_category_id` (row 21), so sales aren't blocked
A small, additive change to your 904 import + a migration (fold it with the 909 revenue work — same owner, same seam):
- **Add nullable `bo.item.revenue_category_id`** (additive migration; witness; applied+verified on sid, host-first).
- **Import mapping:** map the sheet's category (Type) → a matching revenue category by name; **unmatched products → ONE default revenue category `SALES` / "Product sales"** (the import creates it if missing), and **flag those rows in the import diff** (a `flags[]` entry, like the Other-branch guard). Every imported product ends with a `revenue_category_id` set.
- The product FORM also sets it (TASK-911, Jason — coordinate the column with him).
Agree the exact `revenue_category` table + C1-writer signature with Sector **via Porter**. Ball: Bob (909 revenue + method + guard + value_minor 0 + the 904 companion).

## Revenue seam: the exact BB entry point and the category read (Sector, Revenue owner, 2026-11-09; answers Bob's two asks via Porter)
**(1) There's no C1 writer in BB.** `writeRevenueLine` lives in SB and doesn't run in BB. BB writes `bo.revenue_line` itself, as `createManualLine` / `createEcaPayment` do (`src/services/revenue-ledger.service.ts:114/153`). So 909 adds **ONE new exported function in that same file** (Team C's file; it's on 909's claim for this one function):

```ts
// 🔻 TASK-909 (DECISIONS row 21): one revenue line per sale line, inside the SALE's transaction.
export async function postSaleLineRevenue(
  d: any, // the sale's tx; REQUIRED, no `= db` default, so it can never run outside the sale
  input: {
    saleLineId: string;
    soldOn: string;          // bangkokDate(sale.soldAt), `YYYY-MM-DD` (revenue-ledger.ts:180)
    branch: "BRAVO" | "OTHER";
    method: "TRANSFER" | "CASH" | "CARD"; // the sale's; the sale route already refused a missing one (400 METHOD_REQUIRED)
    categoryId: string;      // item.revenue_category_id
    productName: string;     // item.name
    amountMinor: number;     // qty × unitPriceMinor − discountMinor (commission NOT netted)
    actor: string | null;
  },
): Promise<{ written: boolean }>
```

- **Net ≤ 0** → `{ written: false }`, no insert (the sign CHECK needs > 0 for non-REFUND).
- **The category:** `select` it by id. It must be **active and not REFUND**, otherwise throw `badRequest("NO_REVENUE_CATEGORY")`. The line's **`type` = the category's `type`** (SALES / FNB / OTHER / RENT…), so a drink lands under FNB with no mapping table.
- **Insert** `bo.revenue_line` with:
  - `occurredOn: soldOn`, `branch`, `type: cat.type`, `categoryId`, `productName`, `amountMinor`, `method`, `remark: null`;
  - `source: "STOCK"`, `refType: "SALE_LINE"`, `refId: saleLineId`;
  - `idempotencyKey: \`rl:sale-line:${saleLineId}\``, `actor`;
  - `.onConflictDoNothing({ target: boRevenueLine.idempotencyKey })`. A replayed sale (same `bo.sale.idempotency_key`) never doubles.
- **It THROWS on any other DB error** (no `ok:false` here). It's inside the sale's tx, so a failed revenue line rolls the sale back. A sale is never recorded without its revenue, and never the reverse.
- **Call it** once per line, after the line and its movement are inserted, in the same `tx`.
- **Tests (DB-free, recording fake `d`):**
  - the fields;
  - type from category;
  - net 0 skipped;
  - inactive or REFUND category → 400;
  - the key;
  - a throw propagates.

  Plus a source pin that the sale service calls it inside the tx.

**(2) The category table and the read.**
- **Table:** `bo.revenue_category` (`src/db/schema-revenue.ts:10`) = `{ id uuid, type text, name text, sortOrder int, active bool }`, unique `(type, lower(name))`. Types: COURSE, TRIAL, VOUCHER, ECA, SALES, FNB, RENT, OTHER. Today's product-ish rows (seed 0008):
  - SALES: Miller, Inline Skate, Bike, Safety;
  - FNB: Drink, Snack;
  - RENT: EQUIPMENT, PARK;
  - OTHER: Shirt, Sock, Bag.
- **Lookup by type + name (the import):** `where(and(eq(type, T), sql\`lower(name) = lower(${name.trim()})\`, eq(active, true)))`. The import's default, **SALES / "Product sales"**, is created if missing with `insert … onConflictDoNothing()` and then read back.
- **The existing route is CEO-only:** `GET /v1/revenue/categories?type=` sits behind `requireRevenueAccess` (`routes/revenue-ledger.ts:116`). An admin product form can't use it. **If the stock product form is admin-reachable, add ONE admin-safe read under the stock routes:** `GET /v1/stock/revenue-categories`, under the stock routes' existing access, returning `{ categories: [{ id, type, name }] }`. That's active rows of types SALES / FNB / RENT / OTHER only, ordered by type then sortOrder: names, no money, no new permission key. Reuse `listCategories` per type, or one select. Say in Implementation Notes which you did.

**Schema:** `bo.item.revenue_category_id uuid NULL REFERENCES bo.revenue_category(id)`. Additive, one migration through MIGRATION-QUEUE, applied by Sober (his block).

## Bob's report — the REVENUE SEAM (DECISIONS row 21) — 2026-11-09 — DONE-pending-review (Sober + Sector for the writer). Nothing committed.
**Built (BB `dong`):**
- **`bo.item.revenue_category_id`** (uuid NULL → `bo.revenue_category`, ON DELETE SET NULL) — migration **`0018_bo_item_revenue_category`** (Jason's 911 took 0017), schema.ts (no drizzle FK: schema-revenue.ts imports schema.ts), journal idx 18, witness = the column. **Applied · verified on sid** (host .206 first; db:verify journal 19, ledger 20, 17 witnesses ✅; queue lines written). Jason's product form can set it now.
- **`GET /v1/stock/revenue-categories`** (ceo + admin, `adminAuth`) → `{ categories: [{id, type, name}] }`: active rows of types SALES / FNB / RENT / OTHER, ordered by type then sort_order; ids + names only, no money. **One select** (not `listCategories`, which is CEO-gated through the revenue route). This is the category picker for Jason's 911 and Fanta's forms.
- **The writer `postSaleLineRevenue(d, {saleLineId, soldOn, branch, method, categoryId, productName, amountMinor, actor})`** exactly as Sector specified (REQUIRED tx, net ≤ 0 ⇒ `{written:false}`, category active + not REFUND else 400 `NO_REVENUE_CATEGORY`, `type` = the category's type, `source STOCK · refType SALE_LINE · refId = the line`, key `rl:sale-line:<lineId>`, ON CONFLICT DO NOTHING, throws on any other error). **One deviation, on purpose:** it lives in its own file `src/services/sale-line-revenue.service.ts`, not in `revenue-ledger.service.ts`: Team C's revenue tests replace that whole module with a fake (bun's `mock.module`), which hid the new export from every later test file (7 unrelated failures). `revenue-ledger.service.ts` is untouched; same function, same signature — tell Sector.
- **The sale posts revenue:** per line, right after the line and its movement, in the SAME transaction (`postLineRevenue: (r) => postSaleLineRevenue(tx, r)`): amount = line NET (commission never netted), category = the product's, method = the sale's, branch = the sale's, day = the sale's Bangkok date. **`method` is REQUIRED ⇒ 400 `METHOD_REQUIRED`** (before anything is locked); **a product with no `revenue_category_id` ⇒ 400 `NO_REVENUE_CATEGORY`** for the whole sale (before the first write); a failed revenue post rolls the whole sale back. Movement `value_minor` stays 0. A re-POST posts no new revenue.
- **The 904 import companion:** the sheet's Type → a product-type revenue category (SALES / FNB / OTHER) by name, case-insensitive, unambiguous only; otherwise **SALES / «Product sales»** (found any case, or created once); every unmatched row that will be written is **flagged** in `flags[]` («No revenue category matches «Skate» — will use SALES / Product sales»); an existing product with no category gets one the day it is touched; one that has one keeps it. Preview reads the categories (read-only); apply maps inside its transaction.
- **Mirror edits in Jason's 911 test** (`stock-write-task911.test.ts`, tagged 🔻 TASK-909): its Stock-OUT fake gets `revenueCategoryId`, a `method`, `insertSaleLine` returns an id and a `postLineRevenue` stub.
**Evidence:** BB full suite **1107 pass · 0 fail**; tsc 5.9.3 → 0. Mutation sets: 909 **45/45**, 904 **73/73**, the new revenue set `stock-revenue-task909.mutations.json` **29/29** (METHOD_REQUIRED, NO_REVENUE_CATEGORY, one post per line, net vs gross vs commission, category / day / branch, the tx, the writer's fields and key and ON CONFLICT, the picker's auth and filter, the import's mapping). **Sid rolled-back check (host .206 first; C-TEST; residue 0 — revenue lines 25→25, categories 61→61, sales 0, movements 552→552, stock items 0): 13/13 PASS** — preview flags only the unmatched row; Bike→SALES/Bike, Drink→FNB/Drink, Skate→the default «Product sales» (created); the picker; a 3-line sale ⇒ 3 revenue lines (SALES 280000 = 2×150000 − 20000 with the 30000 commission NOT netted, method CASH, branch OTHER, day 2026-11-06 Bangkok, actor; FNB 4000 from the category); movements value 0; re-POST ⇒ no new revenue; no method ⇒ 400; no category ⇒ 400 with the other line NOT decremented; an inactive category ⇒ 400 from the writer and the sale rolls back (a savepoint in the probe, like production).
**/security-review (hand):** the picker is ceo + admin and returns ids + names only; the sale route is unchanged in auth (ceo + admin) and the response still has no totals; the revenue line is written server-side from the product's category and the sale's own numbers — the client cannot name a category or an amount; the writer takes the sale's tx and refuses an inactive category; commission is never revenue. No High / Medium finding.
- **Placement OK'd (Sector, 2026-11-09):** `postSaleLineRevenue` lives in `services/sale-line-revenue.service.ts:13`, not `revenue-ledger.service.ts`, because the revenue tests mock that module whole. It's called with the sale's own tx (`stock-out.service.ts:80`). No move needed.

## Review — revenue posting (Sober, SA Lead A, 2026-11-09) — ✅ ACCEPTED (code-read)
Read `sale-line-revenue.service.ts` + `stock-out.service.ts`:
- `postSaleLineRevenue(tx, …)`: **tx required (no default)** so it can't run outside a sale; **THROWS on any DB error** → the sale rolls back (never a sale without its revenue, never the reverse); key `rl:sale-line:<saleLineId>` + `onConflictDoNothing` (a replayed sale never doubles); **amount = line NET** (qty×unit − discount; commission is pay, never netted — correct); `net ≤ 0` writes nothing; inactive/REFUND category → NO_REVENUE_CATEGORY.
- 909 posts via `tx.postLineRevenue` → `postSaleLineRevenue(tx, …)` **inside the sale's own tx** (never `db`). **Movement `valueMinor: 0`** (my Q2 ruling, cited in the header). Guards present: `METHOD_REQUIRED` (pre-tx) + per-line `NO_REVENUE_CATEGORY` (in-tx). Category from `bo.item.revenueCategoryId`.
- Evidence: 13/13 sid rolled-back, 1107/0, three mutation sets (45/73/29) all killed, 0018 verified on sid, import default SALES/"Product sales" + flag.
**Verdict: ✅ ACCEPTED.** The whole revenue seam (909 posting + 904 companion column/import + `GET /stock/revenue-categories`) is sound and deploy-ready.
**One deviation — ACCEPTED, relaying to Sector via Porter:** the writer lives in `sale-line-revenue.service.ts`, not `revenue-ledger.service.ts` as Sector's spec said, because Team C's `mock.module` replaces `revenue-ledger.service.ts` wholesale and would hide the export from later test files. Same signature; `revenue-ledger.service.ts` untouched. Sound reason, correct behaviour — I'm informing Sector (his call whether to relocate later); not a blocker.
