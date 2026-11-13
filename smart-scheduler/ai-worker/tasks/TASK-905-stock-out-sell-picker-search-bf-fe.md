# TASK-905 — FE: Stock Out (sell) screen — product picker + search (backoffice-front) — @Fanta (lent to Team A's Stock block)

**From @Sober, 2026-11-09. First Stock-block FE TASK (R3.5 SALES RECORD = STOCK OUT; REQ-5010 item 17a: "it's the sell page — we need a search box to find the item to sell").** Repo `smart-scheduler-backoffice-front`, branch `dong`. **Brownfield — map the existing stock screens/services first.** Git only on the owner's word. **Chain: report + questions in this TASK `## Questions`; Sober reviews (Stock is Team A's).**

## Step 0 (mandatory — map first, file:line, in `## Implementation Notes`)
- The **final UI** Stock Out screen (`smart-scheduler-requirement/.../final-ui`, path in `machine.local.md`) — its layout, the cart (R3.5: several items, discount PER ITEM, buyer picked-or-typed, branch, coaches for commission).
- The **existing BF** stock pieces (if any) + the **products-list endpoint** the picker reads: look in the built BF services and the BB routes (`catalog.ts` / `item.service`). **If no admin-reachable products-list endpoint exists, STOP and tell me** (I'll cut a small BB one — do not invent the shape).

## Build (this TASK = the picker + search only, not the whole sell flow)
- The Stock Out screen's **product picker**: lists sellable products (Model code · name · price · balance) and a **search box** that filters as you type (REQ-5010 17a). Mantine `Select`/`Autocomplete` is searchable by default — if the products already load via a searchable Select, prove it; else add the filter.
- Pick a product → it goes into the sell cart (the cart's full behaviour — multi-item, per-item discount, buyer, commission — is a later TASK; THIS one is the picker + search + "add to cart" stub).
- CEO-gated like the rest of /stock; dark theme; no horizontal scroll at 390px.

## Done = (evidence in `## Implementation Notes`)
- `tsc` 0 · `next build` 0 · a headless proof: the picker lists products from the real endpoint, the search filters, a pick adds a row; no console errors.
- `git status` = only your files; no git command. **Do NOT** touch any Salary file or `smart-scheduler-back`.

## Claim
backoffice-front: the Stock Out screen's picker + search component(s) + its service call. **Sober reviews.** Contract questions (the products-list shape) come to me.

## Questions / Implementation Notes / Review
_(—)_

## Implementation Notes — Fanta, 2026-11-09 — STEP 0 (read-only; nothing edited) — 🛑 STOP: no admin-reachable products-list endpoint exists
**1. The final UI's Stock Out (the cart's shape).** `final-ui/src/pages/b/stock/StockOut.tsx` + `src/mock/b-stock.ts`: a product = `{ code (Model code), name, cat, commissionGroup, commission, price, qty, loc, note }` (`PRODUCTS`, `b-stock.ts:18–30`); a cart line = `{ code, qty, discountMode ฿|%, discount, commission{coach→baht} }` (`CartLine`, `:34–40`; the PER-ITEM discount of REQ-133 — note REQ-120 C-j says ONE discount on the whole bill: the final UI was ruled per item, REQ-120 §178 reads otherwise, Sober's to reconcile before the cart TASK). The picker needs, per product: **Model code · name · price · balance (qty)**; it also reads **category** (tab bar) and **location** (filter) on the Product screen.
**2. Existing BF stock pieces (file:line).** Only the legacy ones: `src/app/(admin)/inventory/page.tsx` (a `PagePlaceholder`, role ceo+admin, `lib/roles/pages.ts:43`, not in the menu); `components/partials/Items/{ItemsContent,CreateItemModal,MovementModal}.tsx` + `hooks/backoffice/useCatalog.ts:12 useItems` + `services/catalog.service.ts:32–37 listItems` = `GET /v1/catalog/items` → `{items: CatalogItem[]}` (`types/app/backoffice/index.ts:11–28`: `sku · name · unit · itemGroup · itemType · salePriceMinor · trackStock · reorderLevel · quantityOnHand · active`). There is **no Stock Out / Product / sell screen** and no searchable products Select in the BF.
**3. The products-list endpoint — what the BB really serves.**
- `smart-scheduler-backoffice-back/src/routes/api.ts` mounts **only** `/auth · /bo · /revenue · /salary · /internal/salary · /me` (its own comment: *«the old `ops.*` routes are retired … those routes would 500»*). **`catalogRoutes` (`routes/catalog.ts`) is not mounted anywhere** (`grep catalogRoutes` = its own file only), so the BF's `GET /v1/catalog/items` would answer 404 today. Its `GET /` has no auth middleware either (only the writes use `adminAuth`).
- The table behind it, `catalog_items` / `stock_balances` (`db/schema.ts:120–165`), is in the **`ops` schema** — the schema the comment says does not exist on the shared `smart_scheduler` DB. I did not (and may not) check the DB; the code says there is no data to list.
- The live admin item read is `GET /v1/bo/items` (`routes/bo.ts:26`, `adminAuth`, `services/item.service.ts:12–32`): it lists `bo.item` rows — `name · unit · direction · cadence · unitPriceMinor · ceilingQty/remainingQty · tags · metadata`. That is the **budget/revenue-category** model: **no Model code (sku), no stock balance for a sold product, no location, no commission group, no sellable-product flag.** It can't honestly feed a «Model code · name · price · balance» picker.
**4. So (per this TASK's own rule) I stop and do not invent a shape.** What the picker + the later cart + the Product screen need from a BB read — for Sober's small BB TASK:
`GET /v1/stock/products` (CEO+Admin; hide pay as usual) → `[{ id, code, name, category, priceSatang, quantity, location, commissionGroup?: {name, amountSatang} | null, active }]`, with `?q=` as an optional server-side search and `?location=` / `?category=`. Prices in integer satang. A product with `quantity 0` stays listed (the final UI greys it). I'd read it through one `listStockProducts()` in a new `services/stock.service.ts` and a `useStockProducts()` hook; the picker is a Mantine `Select searchable` (filters on name + code as you type — Mantine's default filter matches the label, so the label would carry «CODE · name», proven by a test).
**5. Questions for Sober** (also in `inbox/SA-B.md`): (a) cut the BB products read above — or tell me which existing endpoint to use if there's one I missed; (b) the bill discount: REQ-120 C-j (ONE discount on the whole bill) vs the final UI (per item) — which does the cart build?; (c) where do stock balances live in the BB (a new `bo` table?) — I only need the read; (d) the Stock menu in `lib/roles/pages.ts` — Fern's shell file; I'd add the Stock Out rows only through a claim that names it.
**Status:** step 0 done, STOPPED for (a). I'll build the picker the moment a read exists; until then I can build it against a typed fixture seam (like TASK-862) if Sober wants that.

## Answers (Sober, SA Lead A, 2026-11-09) — build on the fixture seam now; the real read lands with 904
Great step-0, right to stop. Answers:
- **(a) The products read: I've cut it as part of TASK-904** (Bob): **`GET /v1/stock/products`** (ceo+admin) → `[{ id, code, name, category, priceSatang, quantity, commissionGroup?: {name, amountSatang}|null, active }]`, `?q=` server search. **No location** (CUSTOMER-ANSWERS QR3: "Other = future branches" — single location now). Your proposed shape is accepted minus `location`. **Build the picker NOW against a typed fixture of exactly this shape** (like TASK-862's seam, off by default); wire to the real endpoint when 904 lands — a one-function change. So you're not blocked.
- **(b) Discount — PER ITEM.** REQ-120 §218 is the ruling: *"The STOCK OUT discount = PER ITEM (supersedes the 10-20 bill-discount A)."* The final UI (per item) is right; REQ-120 C-j's "one discount on the whole bill" is superseded. **But that's the CART TASK, not this one** — 905 is only the picker + search + add-to-cart stub.
- **(c) Balances live on `bo.item.remainingQty`** (one per product; no location). You only need the read; it's in 904.
- **(d) PAGE_RULES:** add your `/stock/...` row(s) in `lib/roles/pages.ts` (ceo+admin), **tagged `🔻 TASK-905`**, and name that file in your claim — it's Fern's shared shell, so flag me if you and Flash (906, also adding a /stock row) touch the same lines; one row each, no overlap.
Ball: Fanta (picker + search on the fixture seam → wire to 904).

## Answer to the sold-out question (Sober, 2026-11-09, via Silver)
**Sold-out (quantity 0) products: LISTED but DISABLED, not hidden — YES.** The admin sees what exists (and the final UI greys them); hiding them would hide a real product. Your fixture-seam build (BF 102/0, build 0) is **accepted on the fixture**; wire it to TASK-904's `GET /v1/stock/products` when Bob lands it (a one-function change). "No product found" wording approved. Ball: Fanta (wire to 904 when it lands).

## Review (Sober, SA Lead A, 2026-11-09) — ✅ DONE on the fixture (real-wiring pending 904)
Fanta's picker + search build is accepted: BF 102/0, build 0, proven on the typed `GET /v1/stock/products` fixture seam; sold-out products listed-but-disabled (ruled), "No product found" wording approved. **Verdict: ✅ DONE on the fixture.** The one open item is **wiring to the real `GET /v1/stock/products`** when TASK-904 (Bob) lands — a one-function change; I'll ring her to wire (or she folds it into TASK-907, same endpoint). Not blocking.
