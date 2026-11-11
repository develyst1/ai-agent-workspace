# TASK-906 — FE: Stock Report base — the report screen shell + period filter (backoffice-front) — @Flash (lent to Team A's Stock block)

**From @Sober, 2026-11-09. First Stock-block report TASK (R3.8: sales history · balance · movement over a chosen period).** Repo `smart-scheduler-backoffice-front`, branch `dong`. **Brownfield — map the existing report pieces first.** Git only on the owner's word. **Chain: report + questions in this TASK `## Questions`; Sober reviews (Stock is Team A's).**

## Scope — the BASE only (shell + period filter + one list wired), not every report
R3.8 has three reports: **sales history · balance · movement (sales / stock-in / moves)**. This TASK builds the **report screen base**: the page shell, a **period filter (day / month / custom)**, a report-type switch for the three, and **ONE of them wired end-to-end** (movement is the simplest — it's the stock card the git-style import feeds) to the existing BB reader. The other two are follow-on TASKs.

## Step 0 (mandatory — map first, file:line)
- The **final UI** Stock Report screen + REQ-5010 item 19 (Filter Type/Product + free search — note them, they're follow-ons unless trivial here).
- The **existing BB report reader**: `src/services/reports.service.ts` in backoffice-back + its route — **what it already returns for movement/balance/sales over a period.** If there's no admin-reachable report endpoint for movement, STOP and tell me (I'll cut a small BB one; don't invent the shape).

## Build
- The report page shell (dark, mobile-ok), CEO-gated, under /stock (or /reports per the final UI — confirm in step 0).
- A **period filter**: day / month / **custom** range (REQ-5010 item 10 confirmed custom works).
- A report-type selector (Sales history / Balance / Movement) — only **Movement** wired this TASK; the other two show a "coming" placeholder (or are stubbed), documented.
- Movement wired to the real BB reader: a table of the period's movements (date · item · in/out/adjust · qty · running balance if the reader gives it).

## Done = (evidence in `## Implementation Notes`)
- `tsc` 0 · `next build` 0 · headless: pick a period → the Movement report loads real rows from the BB reader; the filter changes the range; no console errors.
- `git status` = only your files; no git command. **Do NOT** touch any Salary file or `smart-scheduler-back`.

## Claim
backoffice-front: the Stock Report page shell + period filter + the Movement list + its service call. **Sober reviews.** Contract questions (the reader's shape) come to me. Sales-history + Balance wiring, and the Type/Product filter + free search (REQ-5010 #19), are follow-on TASKs.

## Implementation Notes
**STEP 0 DONE (Flash, 2026-11-09), read-only; nothing edited. Result: the STOP condition is met. There is no admin-reachable movement report for a period.** BF `dong` @ `7baca31` (dirty: others' Salary/Revenue work, none mine yet); BB `dong` @ `45a5977`.

**1. The final UI** (`SOM-BALANCE-Backoffice-spec/final-ui/src/pages/b/stock/StockReport.tsx`, registered `pages/b/index.ts:36`: route **`/stock/reports`**, group STOCK, title "Stock Report", **roles ceo + admin**, "No revenue amounts here"):
- header "Stock Report" + an **Export** button (a fake download in the prototype);
- a card with **From** / **To** dates and **Search** (the prototype has no day/month presets; the TASK's day / month / custom is more than the final UI shows);
- three tabs: **Sales History** (filter Customer; Date · Product · Qty · Customer · Payment), **Balance** (filter Location; Product · Location · Balance), **Movement** (filter **Type** = `Sale` / `Stock in` / `From Demo`; **Date · Type · Product · Qty**, qty `+n` green / `−n` red).
- REQ-5010 item 19 ("หน้า stock report", REQ-5010 §87): the Type / Product filters and the free search are the follow-ons the TASK names; the prototype already has Type on Movement, Customer on Sales, Location on Balance.

**2. The BB readers that exist** (`smart-scheduler-backoffice-back`):
- `GET /api/v1/reports/…` → `routes/reports.ts` has **only `/pl`** (P&L), and `routes/api.ts` does not even mount `reportRoutes` today (it mounts `/auth`, `/bo`, `/revenue`, `/salary`, `/internal/salary`, `/me`). So `services/reports.service.ts` is not a movement reader.
- **`GET /api/v1/bo/items/:id/movements?limit=`** (`routes/bo.ts:45`, `adminAuth` = ceo or admin; `services/item.service.ts:156 listMovements`) is the only live movement read. It is **per ITEM**, **newest first**, **`limit` 1–200 (default 50)**, **no date range, no all-items form, no type filter, no search**. Row = `toBoMovementDTO` (`db/mappers.ts:40`): `{ id, itemId, qty (signed: + in / − out), remainingAfter, valueMinor, reason, refType, refId, createdAt }`. It has **no product name** (only `itemId`), **no "type" label** (the type must be derived from `reason` / `refType`, which I have not been told the vocabulary of), and **`valueMinor` is money** (the final UI says no revenue amounts on this screen).
- `routes/catalog.ts` has `GET /:id/movements` over the **older `ops.stock_movements`** table (direction, quantity, quantityAfter, amountMinor), but `catalogRoutes` is **not mounted** (`api.ts` comment: the old `ops.*` routes are retired). BF's `services/catalog.service.ts` still calls `/v1/catalog/items` (dormant: that route is gone).
- So a Movement report over a chosen period across all products needs **a BB endpoint that does not exist**.

**3. What BF already has** (`smart-scheduler-backoffice-front`): `src/app/(admin)/inventory/page.tsx`, `items/page.tsx`, `reports/page.tsx` (a placeholder), `services/bo.service.ts:69 listMovements(itemId)` (per item, wired to `/v1/bo/items/:id/movements`), `hooks/backoffice/useBo.ts` (`useMovements`), `lib/roles/pages.ts` `PAGE_RULES` (no `/stock/...` entry yet; ITEMS group has `/items`). Nothing period-based. The final UI's STOCK group has no BF counterpart.

**4. What I would build once the reader exists (no work started):** `src/app/(admin)/stock/reports/page.tsx` (route as the final UI), `partials/StockReport/{StockReport.tsx, hooks.ts, parts}` with the From/To period (day / month / custom presets over the same two dates), the three tabs (only Movement wired; the other two a "coming" note), `services/stock-report.service.ts` (one function), a `PAGE_RULES` entry (`/stock/reports`, ceo + admin) so the menu and the gate know it (`lib/roles/pages.ts` is a shared file Team A/B touch). Dark, mobile-ok, the repo's Mantine theme.

**SHELL BUILT against a typed fixture (Flash, 2026-11-09; Sector's Q4 = YES, as Fanta on 905). NOT routed; the real BB reader is still Q1.** BF `dong`, my files only (all untracked/new): `src/types/app/stock-report.ts` · `src/services/stock-report.service.ts` (`STOCK_REPORT_SOURCE = "fixture"`, one function `listStockMovements(role, {from,to,type?})`: inclusive both ends, newest first, Coach gets `[]`, returns copies) · `src/services/__fixtures__/stock-report.ts` (10 invented rows, no money) · `src/components/partials/StockReport/{StockReport.tsx, StockReportData.ts, period.ts, stock-report-906.test.tsx}`.
- **What it does:** header "Stock Report"; period filter Day / Month / Custom (Day = one date, Month = whole calendar month of the picked date, Custom = From + To; max 366 days, From ≤ To, otherwise a red sentence and no request); tabs Sales History / Balance / Movement; Movement = Type select (All / Sale / Stock in / From Demo) + table Date · Type · Product · Qty (`+n` teal, `−n` red); loading / empty / error states; Sales History and Balance are a plain "coming in a follow-on TASK" note, no fake rows. English labels (the final UI is English). No Export (Q5).
- **No route wiring, as told:** no `src/app/**/page.tsx` mounts it and `lib/roles/pages.ts` is untouched (a test pins both; the wiring TASK deletes that one test with Q3).
- **Wiring TASK = swap the body of `listStockMovements` only** (to `GET /v1/bo/stock/movements?from&to&type`, [team-proposed]) + delete `__fixtures__/stock-report.ts` + add the page and the `PAGE_RULES` line. Shape if Sober changes it: only `types/app/stock-report.ts` and that one function move.
- **Evidence:** `tsc --noEmit` exit 0 · `bun test src/components/partials/StockReport` 14 pass / 0 fail · whole BF suite 116 pass / 0 fail · `next build` exit 0. **Not done:** no headless screenshot, because there is no route to open (I did not add a scratch page under `src/app` while another session's dev server runs in this folder); the pure parts are tested through static markup. I will take the screenshot with the wiring TASK, or earlier if you want a scratch bundle. No git command run; Salary files and `smart-scheduler-back` untouched.

**ROUTED after Sober's answers (Flash, 2026-11-09).** Type vocab now `SALE · STOCK_IN · ADJUSTMENT · FROM_DEMO` (Adjustment added to type, label, fixture, Type select). New page `src/app/(admin)/stock/reports/page.tsx`. **`lib/roles/pages.ts` (shared, claimed): two edits** — `"STOCK"` added to the `Group` union and ONE row `/stock/reports` · "Stock Report" · STOCK · ceo+admin · menu · tagged `🔻 TASK-906`, placed after `/tags`; no money flag. Fanta (905): no overlap with my row at the time; her file still shows only the picker, unrouted. The page shows a yellow "Sample data — the live stock movements are connected with TASK-904" notice while `STOCK_REPORT_SOURCE === "fixture"`, so nobody reads fixture rows as real. The route test now pins the one mount, the gate (coach out, admin in) and the notice.
- **Evidence:** `tsc` exit 0 · StockReport tests 15 pass / 0 fail · `next build` lists `○ /stock/reports` (one earlier run failed on another session's `inventory/import` types, which cleared on the rerun) · whole BF suite 116 pass / **1 fail, not mine**: `stock-905.test.tsx:33` expects `STOCK_SOURCE` = "fixture" but Fanta's service now exports `{ products: "fixture" }` (her WIP). Still no screenshot (another session's dev server holds this folder); say if you want a scratch run. No git.
- **Wiring to 904 later:** swap the body of `listStockMovements` to `GET /v1/bo/stock/movements`, set `STOCK_REPORT_SOURCE = "api"` (the notice goes), delete `__fixtures__/stock-report.ts`.

## Questions
(Flash → Sober via Sector, 2026-11-09. **STOPPED at step 0 as the TASK says; BLOCKED.**)
1. **The BB reader.** Please cut a small one (the TASK said not to invent its shape). **What I propose, `[team-proposed]`, so you can correct it:** `GET /api/v1/bo/stock/movements?from=YYYY-MM-DD&to=YYYY-MM-DD&type=&q=&limit=` (ceo + admin, `adminAuth`), over `bo.movement` joined to `bo.item`, newest first, answer `{ "items": [{ "id", "occurredOn": "YYYY-MM-DD" (Bangkok date of `createdAt`), "itemId", "itemName", "type": "SALE" | "STOCK_IN" | "FROM_DEMO" | …, "qty": signed int, "remainingAfter": int|null }] }`. **No `valueMinor`** for this screen (the final UI shows no amounts, and an admin must not see revenue). The `type` mapping from `reason` / `refType` is yours to define (I do not know the vocabulary, and the final UI's three labels are `Sale`, `Stock in`, `From Demo`).
2. **Period inclusive of both ends?** I assume `from` and `to` inclusive (`GET /revenue/lines` does the same) and a custom range of at most 366 days.
3. **Route and gate.** `/stock/reports`, ceo + admin, as in the final UI. OK to add the one `PAGE_RULES` line in `lib/roles/pages.ts` (shared)?
4. **While you cut the endpoint, may I start the shell + period filter + tab switch with the Movement tab behind a fake** (off by default, as in TASK-859), so the real wiring is a one-function change? Default: yes, unless you say wait.
5. **Out of scope noted:** Export (a download) and Sales History / Balance wiring.

## Review

## Answers (Sober, SA Lead A, 2026-11-09) — build the shell on a fake now; the real reader lands with 904
Thorough step-0, right to stop. Answers:
- **(1) The reader: cut as part of TASK-904** (Bob): **`GET /v1/bo/stock/movements?from=&to=&type=&q=&limit=`** (ceo+admin) → `{ items: [{ id, occurredOn (Bangkok date), itemId, itemName, type, qty (signed), remainingAfter }] }`. **No `valueMinor`/money** (the screen shows no amounts — your read is right). **`type` = `SALE · STOCK_IN · ADJUSTMENT · FROM_DEMO`** (Bob maps from `reason`/`refType` in 904; the final UI's Sale / Stock in / From Demo + ADJUSTMENT for import/manual). Your `[team-proposed]` shape is **accepted** with that type vocab and no money.
- **(2) from/to inclusive, max 366 days** — yes.
- **(3) Route `/stock/reports`, ceo+admin** — yes; add the one `PAGE_RULES` line (tagged `🔻 TASK-906`), name `lib/roles/pages.ts` in your claim. Coordinate with Fanta (905 also adds a /stock row) — one row each, flag me on any overlap.
- **(4) YES — build the shell + period filter + tab switch + the Movement tab behind a FAKE now** (off by default, TASK-859 style), so wiring to 904's real read is a one-function change. You're not blocked.
- **(5) Export + Sales-history/Balance = out of scope** — confirmed (follow-ons), plus REQ-5010 #19 (Type/Product filter + free search).
Ball: Flash (shell + period + Movement-on-fake → wire to 904).

## Scope note (Sober, 2026-11-09): REQ-5010 #19 is PARKED, not a follow-on
Correction: the stock-report **Type/Product filters + free search (REQ-5010 #19) is PARKED** for the owner + พี่เบส + แนท meeting (Porter) — **do NOT cut or plan it as a follow-on** until that meeting rules. 906's base report + period filter is the agreed scope; a type-filter that's already native to the Movement tab (Sale/Stock in/From Demo) is fine, but the broader #19 Type/Product+search is on hold. Sales-history + Balance wiring remain the only follow-ons.

## Review (Sober, SA Lead A, 2026-11-09) — ✅ ACCEPTED on the fixture
Code-read: `types/app/stock-report.ts` has **no money** (the comment states `valueMinor` is deliberately absent — R0 ✅), the type vocab is exactly 904's **`[SALE, STOCK_IN, ADJUSTMENT, FROM_DEMO]`**, and `lib/roles/pages.ts:37` routes `/stock/reports` gated **ceo+admin** with the STOCK group — all matching the contract I set. Period filter Day/Month/Custom (≤366d, from≤to, inclusive), Movement tab wired to the fixture, Sales History + Balance show a "coming" note (no fake rows), the yellow "Sample data … connected with TASK-904" notice until `STOCK_REPORT_SOURCE="api"`. tsc 0 · StockReport 15/15 · next build lists `/stock/reports` · BF suite 280/0 (Porter; the earlier lone fail was Fanta's 905 WIP, since resolved). The one-function swap to `GET /v1/bo/stock/movements` is ready. **Verdict: ✅ ACCEPTED on the fixture.** The no-screenshot gap is the block's known dev-server-lock/no-login constraint — the pure parts + static markup + the route/gate/notice tests cover it.
**Open (as scoped, not blockers):** Sales History + Balance tab wiring = follow-ons; REQ-5010 #19 (Type/Product filter + search) = PARKED for the owner/พี่เบส/แนท meeting; real wiring waits on BB deploy. Ball: Flash (done on the fixture; wire at deploy).
