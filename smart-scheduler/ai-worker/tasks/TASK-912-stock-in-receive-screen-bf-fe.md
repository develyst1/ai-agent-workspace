# TASK-912 — FE: Stock IN (receive) screen — product + quantity + date → a STOCK_IN movement — backoffice-front, Stock block — @Fanta (lent to Team A's Stock block)

**From @Sober, 2026-11-09. R3.2 Stock In: the manual "a delivery arrived, add N to stock" screen — the counterpart to your Stock OUT (910). Distinct from the bulk Import (908): this is a single receive, not a sheet.** Build on a **fixture write seam** now (same pattern as 910), pairing with the BE stock-in write (folded into TASK-911 — not yet landed). Repo `smart-scheduler-backoffice-front`, branch `dong`. **Brownfield — map the final-UI Stock In screen first.** Git only on the owner's word. **Chain: report + questions in this TASK `## Questions`; Sober reviews.**

## Requirement (REQ-120 R3.2, verbatim constraints)
- **Stock In = product + quantity + date.** **NO cost price, NO profit** (R3.2 is explicit — do not add a cost/price field; the product's sale price is unchanged by a receive).
- It writes a **STOCK_IN movement** (+qty, raises `remaining_qty`); it never lowers stock, so **no negative-balance case** here.

## Step 0 (map first, file:line, in `## Implementation Notes`)
- The **final-UI** Stock In screen (`final-ui/.../stock/StockIn*` — path in `machine.local.md`): its fields, the product picker, the date control, the confirm.
- Reuse your TASK-905 product picker + the `GET /v1/stock/products` fixture, and the 910 service/key-keeper pattern.

## Build (on a fixture write seam)
- **One receive, or several lines:** pick a product (905 picker) · **quantity** (whole, >0) · **date** (the receive date; default today, Bangkok). Optionally several lines in one receive (each product + qty), if the final UI does — else a single line is fine. NO cost, NO price (R3.2).
- **Confirm → fixture seam** `receiveStock(req)` → on success a result (the movement(s) written, the new balances); the picker re-reads and shows the balances HIGHER.
- **Idempotency:** one `idempotencyKey` per confirmed receive (a double-click doesn't double-add), same key-keeper pattern as 910.
- **Seam contract (so the swap is one file; matches the BE stock-in write in TASK-911):** `POST /v1/stock/in { idempotencyKey, receivedOn (Bangkok date), lines:[{ itemId, qty (>0 int) }] }` → `{ receiptId, movementsWritten, receivedOn, alreadyApplied? }`. Keep it behind `STOCK_SOURCE.writes = "fixture"` (off until the BE write deploys). Error envelope = the app standard `{ error: { code, message, details } }` (match 910's corrected shape).
- CEO + admin gated (an admin may receive stock — it's not pay/revenue); add/extend the `/stock/in` `PAGE_RULES` row tagged `🔻 TASK-912`, coordinating with the other /stock rows (one each).

## Done = (evidence in `## Implementation Notes`)
- `tsc` 0 · `bun test` green · `next build` 0 · the pure rules + the fixture round-trip (balance goes up, idempotency) proven; static markup. (Browser DOM run = the block's known no-DOM-lib/no-login gap; prove the pure rules + seam.)
- `git status` = only your files; no Salary file, no `smart-scheduler-back`; no git command.

## Claim
backoffice-front: the Stock IN screen + the `receiveStock` fixture seam + its `PAGE_RULES` row. **Sober reviews.** Write-shape questions → me.

## Questions / Implementation Notes / Review
_(—)_

## Implementation Notes — Fanta, 2026-11-09 (built on the fixture write seam; Sober reviews)
**Step 0 — the final-UI Stock In** (`final-ui/src/pages/b/stock/StockIn.tsx`, my own TASK-753 port, `:8–66`): ONE card, one line — Product (searchable Select) · Location (Select) · Quantity (NumberInput) · Date (the shell's `DateField`, default today) · «Now in stock: N»; buttons «Cancel» (back to Product) and «Save»; a header «Product» link button; a role-neutral Thai toast on Save. No cost, no price, no profit anywhere. **Single line** (not a multi-line receive), so I built a single line; the request carries `lines[]` as 911 will take it.
**Built (BF; new files + 3 small edits):** `components/partials/Stock/{StockInReceive.tsx (screen), stock-in-logic.ts (pure rules), stock-912.test.tsx}`; `app/(admin)/stock/in/page.tsx`; `services/stock.service.ts` (+`receiveStock`, a receipts map cleared by `resetStockFixture`, `StockWriteError` gains `INVALID` and an envelope `body`); `types/app/stock.ts` (+`StockInRequest/Result`); `StockData.ts` (+`useReceiveStock`); `StockProductPicker.tsx` (+ a `pickable` prop, default = the sale rule; a RECEIVE passes `isReceivable` so a sold-out product can be picked); `lib/roles/pages.ts` (one row `🔻 TASK-912` `/stock/in` «STOCK IN», STOCK, CEO + Admin, `PackagePlus`).
**The screen:** Product (the 905 picker + search; sold-out products ARE pickable here, inactive ones aren't) · Quantity (whole number above 0) · Date (`DatePickerInput`, default today in Bangkok, `maxDate` = today: a future date is refused) · «Now in stock: N» = the live balance + the quantity typed · Save (disabled until a product and a valid quantity). Save → ONE `receiveStock` with one idempotency key per confirmed receive (the 910 `createKeyKeeper`: a double press reuses it; any edit or a success makes a new one) → a green line «<receiptId> · <name> +<qty>», the form clears, the lists re-read (the picker shows the balance HIGHER). Errors show their sentence in a red alert. **NO cost / price / profit field exists; the request has no money key (a test greps the JSON).**
**The seam (fixture, `STOCK_SOURCE.writes = "fixture"`, off until the BE write deploys), exactly the TASK's contract:** `{ idempotencyKey, receivedOn, lines:[{ itemId, qty }] }` → `{ receiptId, movementsWritten, receivedOn, alreadyApplied? }`; it only raises balances (no negative case), leaves the sale price untouched, is idempotent on the key, and refuses a non-whole / ≤ 0 quantity (`INVALID`), an unknown product (`NOT_FOUND`) and a Coach (`FORBIDDEN`) in the standard envelope `{ error: { code, message, details } }` (`StockWriteError.body`).
**Left out of the final UI on purpose:** Location (a single location now), the header «Product» link and «Cancel» (not asked; the menu has the Product page).
**Evidence:** `tsc` (bunx typescript 5.9.3) 0 · `bun test` **197 pass / 0 fail** (whole front; `stock-912.test.tsx` 16; mutation: dropping the key early-return and the future-date rule failed 2 tests, restored) · `bun run build` 0 (`/stock/in` listed) · no git; no Salary file, no `smart-scheduler-back`. **NOT PROVEN:** a browser run (typing, the date picker, a real Save) — no DOM test lib in the BF, no sign-in; proven = the pure rules, the whole seam, the key keeper, the static markup (fields, no price, «Now in stock»), the sold-out pickability.
**Questions for Sober:** (1) the future-date rule is mine (a delivery that has arrived has a date of today or earlier) — keep, or allow any date? (2) the received-on date: does the BE record it as the movement's date, or only `createdAt`? (3) words for Porter (English, back office): «STOCK IN», «Quantity», «Date», «Now in stock:», the receipt line «<receiptId> · <name> +<qty>», «Quantity must be a whole number above 0».

## Review (Sober, SA Lead A, 2026-11-09) — ✅ ACCEPTED on the fixture; 3 answers
Clean build: single receive (product + qty + date), **no cost/price/profit** (test greps the JSON — good), sold-out products pickable for a receive (right — you can restock a zero), balance-only raise (no negative case), idempotency key-keeper, future-date refused, envelope errors. tsc 0 · front 197/0 (16 new) · build 0 · mutation bites. **Verdict: ✅ ACCEPTED on the fixture.**
**Q1 — future-date rule: KEEP it** (maxDate = today). A receive records goods that have arrived, so today-or-earlier is correct; **back-dating a late-entered delivery must stay allowed** (no floor) — your rule already allows any past date, good.
**Q2 — the received-on date IS recorded as the movement's business date, not just createdAt.** This matters: 904's movement report currently keys `occurredOn` off `createdAt`, so a back-dated receive would otherwise show on today's report — wrong for a ledger / the stock card พี่เบส asked for. I'm fixing this on the BE (folded into TASK-911): the movement carries an **`occurred_on`** business date = `receivedOn` (and `soldAt` for 909), and the report's `occurredOn` uses it (fallback `createdAt` for import/legacy). So your `receivedOn` is meaningful end-to-end — keep sending it.
**Q3 — words → Porter** (relaying, English back office): «STOCK IN», «Quantity», «Date», «Now in stock:», the receipt line «<receiptId> · <name> +<qty>», «Quantity must be a whole number above 0».
Real wiring waits on the BE `/stock/in` write (TASK-911) + deploy. Your next screen is Porter's to request. Ball: you (nothing to change now) · me (fold occurred_on into 911; relay words).
