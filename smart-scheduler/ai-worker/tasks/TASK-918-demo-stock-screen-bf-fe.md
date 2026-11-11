# TASK-918 — FE: Stock DEMO screen (R3.6) — matrix · Move · Defect→Demo · Delete · Add/Order sites — backoffice-front — @Fern (Team A)

**From @Sober, 2026-11-09 (Porter's staffing). The Demo screen on Jason's TASK-915 reads/writes** (`/v1/demo/*`, built + seeded on sid: 6 sites, 155 items, 172 balances). Repo `smart-scheduler-backoffice-front`, branch `dong`. **Brownfield — map the final-UI Demo screen first.** Git only on the owner's word. **⚠ Do your 908 error-envelope switch FIRST** (Porter rung it at 02:45), then this. **Chain: report + questions in this TASK `## Questions`; Sober reviews.**

## Build to the 915 contract (fixture seam now, one-file swap at BB deploy — same pattern as the other Stock FE)
- **Matrix:** items × sites + a Total column, from `GET /v1/demo/stock?site=&q=` (per-(item,site) balances: item name, category, qty). Sites in `sort_order` (Bravo leftmost). A **History** table from `GET /v1/demo/movements` (When[date only] · Who · Item · From → To · Qty · Reason).
- **Actions (per the final UI `Demo.tsx`):**
  - **Move A → B** (`POST /v1/demo/move {key,itemId,fromSiteId,toSiteId,qty,reason}`) — reason REQUIRED; refuse qty > balance at A (the server returns 409 NEGATIVE_BALANCE — show it).
  - **Defect Product → Demo** (`POST /v1/demo/defect-in {key,itemId,toSiteId,qty,reason}`) — reason required; +qty at a site, "from = Defect Product". **Demo-only, NO sale decrement** (DECISIONS row 22).
  - **Delete** (`POST /v1/demo/delete`) — reason required; with `siteId+qty` = partial write-off, without = remove the item from all sites + deactivate (history kept, "to = Deleted").
  - **Add Location** (`POST /v1/demo/sites {name}`, unique → 409) and **Location Order** (`PUT /v1/demo/sites/order {ids[]}`, ▲▼; Bravo default first).
- **NO sale↔Demo dialog** (deferred, row 22 — it returns as a later follow-up in the "⋯ More" menu). No item/category create/edit (not built; deferred).
- CEO + admin gated; one `PAGE_RULES` row tagged `🔻 TASK-918`. Error envelope = app standard `{error:{code,message,details}}` (409 NEGATIVE_BALANCE shows `error.details`; use the same parser as your corrected 908).
- Keep the service seam one-file-swappable behind the Stock source flag (fixture off until BB deploys), as 905/908/910/912 do.

## Done = (evidence in `## Implementation Notes`)
- `tsc` 0 · `bun test` green · `next build` 0 · the matrix render + each action's request/round-trip on the fixture (incl. the NEGATIVE_BALANCE refusal, reason-required, partial vs whole delete, add/reorder sites) + static markup. (Browser DOM run = the block's known no-DOM-lib/no-login gap.)
- `git status` = only your files; no Salary file, no `smart-scheduler-back`; no git command.

## Claim
backoffice-front: the Demo screen + its `/v1/demo/*` service seam + the `PAGE_RULES` row. **Sober reviews.** Questions → me.

## Questions / Implementation Notes / Review
_(—)_

## Implementation Notes (Fern, 2026-11-09)
**Map first:** read the final UI `pages/b/stock/Demo.tsx` (matrix, 5 dialogs, the Thai sentences) and Jason's `routes/demo.ts` + `demo-stock.service.ts` (bodies, `key`, errors, `details`). Built to those; the screen follows the final UI, the seam follows 915.
**Built** (route `/stock/demo`, "Stock Demo", STOCK group, CEO + Admin, one `PAGE_RULES` row tagged 🔻 TASK-918):
- **Matrix** items × sites (sites by `sortOrder`, Bravo leftmost) + Total; **History** (When [date only] · Who · Item · From → To · Qty · Reason).
- **Move A → B** · **Defect Product → Demo** (More menu; +qty at a site, nothing else decrements) · **Delete** (partial = At + Qty; a checkbox «Remove this item from every location» = whole, hides At/Qty) · **Add Location** · **Location Order** (▲▼ then Done). Reason required on Move/Defect/Delete; the final UI's own Thai checks and toasts; the server's sentence in a red toast on any refusal; a 409 NEGATIVE_BALANCE also shows «(name would be left at N)» from `error.details` (`{itemId, siteId, name, resultingBalance}`, as Jason's code sends it) via the corrected client (`ApiClientError.details`, done in 908's switch).
- **Write keys:** a fresh `key` per opened dialog (`fe-<time>-<rand>`, fits the 8-100 rule); a retry after a refusal keeps it, so the same action cannot write twice. NO sale↔Demo dialog; no item/category create/edit.
- **Seam:** `services/stock-demo.service.ts` (one file) = a stateful fixture that behaves like 915 (reason 400, same-site 400, siteId/qty together 400, balance never < 0 → 409 NEGATIVE_BALANCE with details, idempotent on key → `alreadyApplied`, DUPLICATE_SITE 409 case-insensitive, order = exactly the sites, Coach 403). `STOCK_DEMO_SOURCE = "fixture"`. At BB deploy: swap the 7 bodies to `GET /v1/demo/stock`, `GET /v1/demo/movements?from&to` (the screen asks for the last 366 days), `POST /v1/demo/{move,defect-in,delete,sites}`, `PUT /v1/demo/sites/order`; the types match 915's routes 1:1.
- **Files (new):** `types/app/stock-demo.ts`, `services/stock-demo.service.ts`, `services/__fixtures__/stock-demo.ts`, `components/partials/StockDemo/{StockDemo.tsx,demo-logic.ts,hooks.ts,stock-demo.test.tsx}`, `app/(admin)/stock/demo/page.tsx`. **Edited:** `lib/roles/pages.ts` (the row + `Presentation` icon). (`lib/api/client.ts`, `types/api/contract.ts` = the 908 envelope switch.) No Salary file, no `smart-scheduler-back`, no git command.
**Proof:** tsc 0 · `bun test` whole repo **249 pass / 0 fail** (20 new here) · **mutations 17/17 killed** (reason, negative refusal, details, same site, idempotency, defect-decrement, whole-delete, half siteId/qty, duplicate site, order check, coach gate, site order, Total, form check, swap edge, From→To, Admin row) · `next build` 0 (final clean build) · **live run in headless Chromium** (login as CEO and Admin, against my harness for the sign-in only; the screen runs on its fixture): columns Item·Bravo·STA·RIS·ABC·Abbey·Total; Helmet row sums to 12; Move with no reason → warn toast and the dialog stays; 9 of 4 → the final UI's «ไม่พอ (เหลือ 4)» sentence; Move 1 → toast, matrix Bravo 3 / STA 3 / Total 7, history row on top; Defect +2 at STA, nothing else lost, history «Defect Product → STA»; partial delete → Bravo −1, item stays, «Bravo → Deleted»; whole delete → item leaves the matrix, history keeps it; add-location duplicate refused, ISB added last; Location Order moves STA to the left; Admin sees the same screen; Coach = NO-ACCESS and no menu item; mobile (390 px) no horizontal scroll; 0 unexpected console errors.
**Questions for Sober:**
1. «Remove this item from every location» (the whole-delete checkbox) is my wording; the final UI has only the partial Delete. OK, or give me the words you want?
2. The History window: the real route needs `from`/`to` (≤ 366 days). I will send the last 366 days with `limit` 200 (the route's default). Is there a window or a "load more" you want?
3. Role of "Who": 915 returns the actor as a string (`who`). If it is a user id/email rather than a display name, who maps it to a name (BB or me)? The fixture shows "Ploy".
**Not tested:** the real `/v1/demo/*` routes, sid, a real login. No git. unhandled-between-tests: 0.

## Review (Sober, SA Lead A, 2026-11-09) — ✅ ACCEPTED on the fixture; 3 answers
Built to 915's routes 1:1: matrix + Total, History, Move/Defect→Demo/Delete/Add Location/Location Order, reason required, **409 NEGATIVE_BALANCE shows `error.details` via the 908 client fix**, fresh key per dialog (retry keeps it → no double-write), NO sale↔Demo, no item/cat edit. Seam `stock-demo.service.ts` one-file-swappable (the 7 bodies → `/v1/demo/*`). tsc 0 · 249/0 (20 new) · 17/17 mutations · next build 0 · **live headless run** (CEO+Admin, Coach NO-ACCESS, mobile 390px, the real refusal sentences). **Verdict: ✅ ACCEPTED on the fixture.**
**Q1 — whole-delete checkbox: KEEP it** (the 915 backend supports whole-delete = zero all + deactivate, and discontinuing a product needs it; it's a small justified extension of the final UI's partial Delete). The **wording goes to Porter** (back office is English-only, his call) — I'm relaying «Remove this item from every location»; use it provisionally until he rules.
**Q2 — History window: last 366 days + limit 200 is fine for v1.** No load-more/date-range needed now; if the history grows long later, a date filter is a cheap follow-up. Keep it simple.
**Q3 — "Who" mapping: show `who` as 915 returns it for now; the display-name mapping is BB's job, not the FE's.** 915 returns `actor = the token sub` (a username; the fixture's "Ploy" is readable). If at wiring the real `sub` turns out to be an id/email rather than a display name, I'll have the BB movements read return a display name (a small 915 follow-up) so every consumer gets names from one place — don't build an FE-side map. Confirm the `sub` format at deploy.
Real wiring waits on BB deploy (swap the 7 fixture bodies). Ball: you (nothing to change now; apply Porter's whole-delete wording when it comes).

## Wording approved (Sober, 2026-11-09, Porter 05:40)
Porter approved «Remove this item from every location» (the whole-delete checkbox) as final — keep it as-is, no change. 918 is fully done on the fixture; real wiring waits on BB deploy.
