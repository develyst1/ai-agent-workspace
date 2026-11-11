# TASK-937: GR web (REQ-5011): Revenue + the 2.1 reports brought up to the built state, plus the 7 "Proposed" pages (final-ui, mock only)
- Source: REQ-5011 (owner-approved 2026-11-10) · CHECK-2026-11-10-final-ui-refresh.md §A · TROLLEY-CARDS-PENDING.md (the 7 REQ-5010 cards)
- Owner: FE (Flash, Team C) · SA: Sector · Status: TODO, **start now** · Brew can help with mock data (ask me). **Sober coordinates the shared files** (the shell, `registry.ts`, the home page's version stamp, `CONVENTIONS.md`).
- Repo/folder: `SOM-BALANCE-Backoffice-spec/final-ui` (Vite + React 19.2.7 + Mantine 9.3.2; **not a git repo**, so no git at all).
- **Mock only:** no real API, no real DB, no real children's names, no LINE, no mail. Thai mock names; totals that add up.
- **Read first:** `final-ui/CONVENTIONS.md` (who edits which file). Team B's pages live in `src/pages/b/` + `src/mock/b-*` + `src/pages/b/index.ts`. Team B is Fanta's/Silver's, but Revenue + Reports are now **ours for this TASK**. Porter has told Sober; if a convention blocks you, ask me.
- **Dates (REQ-5011 order):** the 7 Proposed pages by **12 Nov** (batch 2); Revenue + Reports by **13 Nov** (batch 3). Each batch deploys as soon as it's green (Otto hosts it; not your step).

## Files (closed list)
- `src/pages/b/revenue/**` (Summary, Detail, Manual, Refund, Categories, EcaPayment) + `src/mock/b-revenue.ts`;
- `src/pages/b/reports/**` (AllReport);
- new `src/pages/proposed/**` + new `src/mock/proposed.ts`;
- `src/pages/b/index.ts`: entries for your pages only, plus one new "PROPOSED" group block. The exact place for the PROPOSED menu group (its own `pages/proposed/index.ts` wired through `registry.ts`, or entries in `b/index.ts`) is **Sober's call** (the shared shell). Ask through me before touching `registry.ts`.

## What to do
### 1. Revenue (6 pages) = the built BF screens
- **Carry the real components over** from `smart-scheduler-backoffice-front/src/components/partials/RevenueLedger/**`. It's the same Mantine and React version, so it's mostly a copy.
  - Replace the service/hook layer with the existing `fake.ts` data (BF already has a fake for every call).
  - Drop Next.js-only bits (`next/link` → the shell's link; no `"use client"` needed).
- They must show what's built:
  - REQ-5010 words ("Summary", "Add", "Course Fee", "Not confirmed yet", "Cancelled", "Save");
  - the zero refund not red;
  - ECA Payment + its history;
  - Refund with the confirm step, the session box (Attended Kept / Cancelled on save) and the Refunded badge.
- Role rule unchanged: REVENUE is CEO-only.
### 2. The 2.1 reports = the built All Report
- Carry `smart-scheduler-backoffice-front/src/components/partials/AllReport/**` (built in TASK-925, with its own `fake.ts`):
  - six tabs (STOCK / CHECK IN / SALARY link to the prototype's own pages where they exist);
  - REPORT / COURSE / STUDENT with mock data;
  - the CSV export works on the mock;
  - money shown only to the CEO (the role switcher);
  - "Nov 2026" in English.
### 3. The 7 Proposed pages (TROLLEY-CARDS-PENDING.md §"The 7 cards")
Each page gets a **visible yellow banner**: **"Proposed: to confirm. Not in the agreed scope yet. Size ≈ X days."** (size from the card). The menu group is **PROPOSED**, CEO-only unless the card says otherwise.
1. **Payment Setting with an Edit button:** Extra Hour rate, OT formula, travel rates and Bonus 50/100 editable (today fixed rules).
2. **Conversion:** a Total + a period filter + a coach filter.
3. **Conversion export:** Excel + PDF buttons (mock download of a small file).
4. **Revenue Summary export:** Excel button (card 4 default: Excel only).
5. **Move a whole course to another branch:** a course card with "Move course to branch…" (today the branch is picked at booking).
6. **Stock report filters:** Type / Product + search on the Movement tab.
7. **Report Revenue + Report Conversion:** two report tabs, marked **"Proposed: to ask ขวัญ first"** (no size yet).

Cards 1–3 sit near Salary. Put them in the PROPOSED group, **not inside Team A's salary pages**, so you never edit their files.
### 4. Words
English (D2/R0.5), the approved words, dates `dd/mm/yy`.

## Definition of Done (per batch)
- [ ] `npm run build` (or the folder's build) 0 errors; `tsc` 0.
- [ ] Every page of yours opens from the menu with mock data and **no console error**, as CEO / admin / coach (role switcher). Paste a list per role.
- [ ] Shots of each page at 1280 (+375 for the reports) in `evidence/TASK-937/`.
- [ ] No real name, no real API URL anywhere: `rg -n "http(s)?://" src/pages/b src/pages/proposed src/mock` returns only mock / static.
- [ ] Tanya's click-through comes after (REQ-5011 acceptance).

## Implementation Notes
**BATCH 2 — the 7 PROPOSED pages: BUILT (Flash, 2026-11-10).** Final-ui, mock only. **Needs Sober's two shell edits before it shows in the menu (below).**
- **Files (all new):** `src/mock/proposed.ts` · `src/pages/proposed/{index.ts, parts.tsx, PaymentSettingEdit.tsx, ConversionFilters.tsx, ConversionExport.tsx, RevenueSummaryExport.tsx, MoveCourse.tsx, StockReportFilters.tsx, ReportRevenueConversion.tsx}`. **Nothing in `src/shell/`, `pages/a`, `pages/b` or `index.ts` of either team was touched.**
- **The 7 pages (route `/proposed/…`, group PROPOSED, orders 900–960):** 1 Payment Setting (Edit): Edit / Save / Cancel over Extra Hour rate, OT multiplier, motorbike + car per km, Bonus 50 / 100, a new rate says it applies from the next period (≈ 1.5 d) · 2 Conversion (Total + filters): From / To + Coach + Reset, Total = count and baht of the rows shown (≈ 1 d) · 3 Conversion export: month picker + Excel + PDF (fake download toast) (≈ 1 d) · 4 Revenue Summary export: Today / MTD / YTD by type + Excel (≈ 0.5–1 d) · 5 Move course to branch: four course cards, a Modal, the badge changes on Move (≈ 0.5 d) · 6 Stock Report filters: Movement tab with Type + Product + search + Reset; Sales / Balance tabs point back (≈ 0.5–1 d) · 7 Report Revenue + Conversion: two tabs + Excel, banner **"Proposed: to ask ขวัญ first"**, no size. Every page carries the yellow banner "Proposed: to confirm. Not in the agreed scope yet. Size ≈ X." Mock = invented coaches (Pete / Ton / May, as Team A's mock) and Thai child nicknames; totals are sums of the rows shown.
- **Roles:** CEO-only (per the TASK), **except card 6 = CEO + Admin**, because the real Stock Report is CEO + Admin and a stock filter hidden from the admin who uses it would read wrong. Say if you want it CEO-only.
- **Shell edits I need from Sober (I did NOT make them):** (1) `shell/types.ts:3` add `"PROPOSED"` to `Group`; (2) `shell/Layout.tsx:9` `GROUP_ICON` is a `Record<Group, LucideIcon>`, so it needs a `PROPOSED:` entry (e.g. `FileText`); (3) `shell/registry.ts` `PAGES` add `...(pagesP as PageDef[])` with `import pagesP from "@/pages/proposed"`. Until then `pages/proposed/index.ts` uses `"PROPOSED" as unknown as Group` so the real folder still type-checks.
- **Evidence:** `tsc --noEmit` 0 in the real folder. I could not edit the shell, so I made a **scratch copy** of final-ui (outside the folder, node_modules junctioned, removed after) with those three edits only, built it (`vite build`, 1.27 MB single file) and drove the built `dist/index.html` over `file://` with Playwright (real Chrome, headless): **console errors / warnings 0, network requests 0** across all 7 pages and 3 roles. **Role list** (`evidence/TASK-937/proposed-run.json`): CEO opens all 7; Admin opens only Stock Report filters and gets the shell's "cannot see" screen on the other 6; Coach sees none. **Every control clicked** (`click-run.json`): Edit → 6 inputs → Save → toast + new value shown → Cancel keeps it; Conversion total 7 · 500 ฿ → Coach Pete 3 · 200 ฿ → Reset back; export Excel / PDF toasts, Next month shows the 3 November rows; Revenue Excel toast, total 39,900 / 243,400 / 2,155,300 ฿; Move course Bravo → Other + toast; Stock filters 9 rows → Type Sale 5 → search "helmet" 3 → "zzz" says no match; Report tabs + both Excel toasts. Shots: `proposed-1280-ceo-<page>.png` ×7 + `proposed-1280-admin-stock-report.png`. `rg "https?://"` on my folders: none.
- **Not done / not verified:** 375 px for these 7 (the TASK asks 375 only for the reports; the tables scroll inside their box by construction, not shot); Tanya's click-through (after, per the TASK). Revenue 6 pages + All Report (batch 3, due 13 Nov) are NEXT, starting now.

**BATCH 3 — Revenue (6 pages) + All Report: BUILT (Flash, 2026-11-10).** Final-ui, mock only.
- **Method:** the prototype's Revenue pages were the source of BF's screens, so I did not re-copy 1,900 lines; I diffed each prototype page against the BUILT BF component and brought the prototype to the built state, page by page. All Report was carried over as new files.
- **Revenue — what changed (files `src/pages/b/revenue/*.tsx`, `src/mock/b-revenue.ts`, the two titles in `src/pages/b/index.ts`):** **Summary** — title "Summary" (menu too), header buttons Detail · Refund · **ECA Payment** · Add Manually, the Refund (Expense) amount is red only when it is below 0 (a zero refund is plain). **Detail** — button "Summary", columns "Product Name" and "Payment" (were Description / Method), empty state "No revenue in this period", zero refund not red. **Add Manually** — button "Summary"; the form OPENS EMPTY (placeholders), Save checks every field and the message sits under the wrong field. **Type and Category** — button "Add", the dialog's message under the field: empty name, over 60 characters, or "This category already exists". **ECA Payment** — button "Summary", no Cancel, empty form with Total Amount 0 ฿, inline errors, "The total is too large" over a 32-bit total, after Save the form clears and the history gains the line; ECA history kept. **Refund** — rebuilt as built: search "From" (empty at first), amount defaults to the whole fee, inline errors, Save opens the confirm "Save this refund?" (Back / Save, "This cannot be undone"), then the green "Refund saved" box, the session box reads Attended = Kept / Not attended yet = Cancelled and "The family was told by LINE", the sale carries the **Refunded** badge and Save shuts; a sale already refunded (new mock row, น้องใบบัว) says so. Zero refund is not red anywhere.
- **All Report (new files `src/pages/b/reports/{AllReport,ReportTab,CourseTab,StudentTab}.tsx`, `csv.ts`, `src/mock/b-reports.ts`; entry in `b/index.ts` now `roles: ["ceo","admin"]`):** six tabs in her order; REPORT (month picker "Oct 2026", branch, cards with "Previous month", Trials booked / attended / Converted, "Students: all branches" note when a branch is chosen), COURSE (From / To, branch, Voucher rows, totals row, "Active uses today's sessions left" when To is before today, unmatched-revenue note), STUDENT (search, Status default Active, Activity, counts, **Export CSV that really downloads** the visible rows: BOM, formula guard). STOCK opens `/stock/reports`; SALARY opens the prototype's `/salary/reports` (CEO only, so the SALARY tab is **not drawn for an Admin**); CHECK IN says "Coming with Salary." (no page for it in the prototype). **Money by absence:** Revenue + Refunds cards, the Revenue column and the unmatched note exist only as CEO; an Admin's screen has none. Mock = Thai child nicknames, fake phone numbers 081-000-000x, baht units.
- **Evidence** (`evidence/TASK-937/batch3-run.json`, `click-batch3.mjs`, 28 shots): as before, I built a **scratch copy** of final-ui (outside the folder; only `GROUP_ICON` patched, see the build error below) and drove the BUILT `dist/index.html` over `file://`, real Chrome headless: **console errors / warnings 0, network requests 0.** Roles: CEO opens all 6 Revenue pages + All Report; **Admin opens only All Report** (Revenue = the shell's "cannot see"); Coach none. All Report as CEO: 10 cards (Revenue + Refunds in), COURSE 10 rows + Revenue column + unmatched note, STUDENT 5 active / 3 inactive, CSV downloaded (BOM, 6 lines), status All = 8 rows, search "ภูมิ" = 1, branch note, previous month, STOCK link, SALARY link `#/salary/reports`, CHECK IN note; as Admin: 8 cards, no money card, no Revenue column, no unmatched note, no SALARY tab. **375 px: no horizontal page scroll** on REPORT / COURSE / STUDENT for both roles. Revenue flows: Manual errors, Categories duplicate refused + add, ECA empty → 0 ฿ → errors → 36,000 ฿ live → saved (history 2 → 3, form cleared), Refund empty → pick (default 9,500 ฿, "Cancelled on save") → confirm → saved (Refunded badge, Kept / Cancelled, "told by LINE", Save disabled) → an already-refunded sale. Shots: `batch3-1280-ceo-{summary,detail,manual-errors,eca,refund-empty,refund-picked,refund-confirm,refund-done}.png`, `allreport-{1280,375}-{ceo,admin}-{1-report,2-course,3-student}.png`. `rg "https?://"` on my folders: none.
- **Shell build error: FIXED by Sober.** For a while after his PROPOSED wiring `shell/Layout.tsx:9` `GROUP_ICON` had no `PROPOSED:` entry (TS2741, so `npm run build` failed); I told Sector, and he has added it. **Real folder now: `tsc --noEmit` exit 0.**
- **REAL build (after Sober's shell fix):** `tsc --noEmit` exit 0, `vite build` ✓ (1.30 MB single file). **I rebuilt the folder's `dist/index.html`** to run the DoD (the previous one is backed up in my scratchpad, not in the folder): Otto should deploy from this one, or from a rebuild by him. I re-ran all three click-throughs on THIS real dist (no patched shell): `batch3-run-realdist.json`, `click-run-realdist.json`, `proposed-run-realdist.json`. Result: **console 0, network 0**; roles identical (CEO: 7 Proposed + 6 Revenue + All Report; Admin: Stock filters + All Report; Coach: none).
- **Judgement calls to confirm (Sector):** (1) Summary keeps the prototype's Period (Day / Month / Custom) and Category filters; the built BF Summary has Date + Type only (BF Detail has Period + Category). I did not remove agreed filters; say if the prototype must match BF exactly. (2) Detail keeps its Export button (an agreed feature that BF has not built). (3) All Report is now CEO + Admin (SPEC-103), REPORTS was CEO-only in `b/index.ts`. (4) Stock Report filters (card 6) is CEO + Admin, as noted in batch 2.
- **Not done:** Tanya's click-through (REQ-5011 acceptance, after); the Salary / Stock / Users parts are other TASKs.

**BATCH 4 — Stock Report + Low Stock + Stock Demo: BUILT (Flash, 2026-11-10).** Only my three files changed: `src/pages/b/stock/{StockReport,LowStock,Demo}.tsx`. **`src/mock/b-stock.ts` NOT touched** (Fanta's; read-only use), no `index.ts` edit (titles and routes unchanged).
- **Stock Report** (rewritten to the built 906 / 929): the period filter Day / Month / Custom (both ends included, at most 366 days, "From must not be after To", Reset to this month); three tabs Sales History · Balance · Movement (Movement opens first, as built). Sales: Customer select from the window's buyers, a sale with no buyer reads "Walk-in", Payment word, no amounts. Balance: Product · Balance, the note "The quantity on hand now — the period above does not change it.", no Location column. Movement: Type select All / Sale / Stock in / **Adjustment** / From Demo (the type list as built), +n green / −n red. The prototype's **Export button is kept** (agreed in the final UI, not built in BF; same call as Detail). The Product filter + search of #19 is NOT here (it is Proposed card 6). The mock has no Adjustment row, so one lives in the page file.
- **Low Stock** (rewritten to the built 913): left **Setting** = a box per type, defaults F&B 10 · Safety 1 · Miller 5 · Sock 1 · Shirt 1, plus one empty box for each product category that has no type (Bike, Inlineskate, Other), empty = no alert, Save; right **Low** = MODEL CODE · PRODUCT NAME · CATEGORY · UNIT · Alert (Unit) · Under by with the "N low" badge, retired products and types with no level are never low, "No product is low". A saved level re-draws the list. The Location picker, the "Send a test message" button and the recipients box are gone: as built, the Monday message lives in NOTIFICATION. With this mock the list shows 2 (Water 600 ml 8/10, Miller helmet M 4/5).
- **Demo** (the prototype was already the source of the built one; one gap closed): Delete now has the built checkbox **"Remove this item from every location"** (hides At and Qty, takes the row out of the table, the history keeps one line per location that held pieces, the Thai toast as built). The matrix, Move A → B, Defect Product → Demo, Add Location and Location Order were already as built (checked against BF `StockDemo.tsx` words and checks).
- **Evidence** (`evidence/TASK-937/batch4-run.json` on the scratch build, **`batch4-run-realdist.json` on the REAL rebuilt `final-ui/dist/index.html`**; `click-batch4.mjs`; shots `batch4-1280-ceo-*.png`, `batch4-375-ceo-*.png`): real folder `tsc --noEmit` 0 and `vite build` ✓; **console 0, network 0**; roles: CEO and Admin open all three, **Coach none** (the shell's "cannot see"); **no horizontal scroll at 375** on all three for CEO and Admin. Flows clicked: Movement 8 rows in October, Adjustment 1, Sale 5; Sales 5 rows, "Walk-in" shown, customers All / น้องข้าวหอม / น้องมะลิ, one customer → 1 row; Balance 12 rows, no Location column; Day preset caps at 16/10/26 (the example day); Low Stock 2 low → F&B 5 → 1 low → Miller emptied → 0 low "No product is low" → Other 5 → 3 low; Demo Move without a reason refused with the Thai sentence, Move logs +1 history, whole-item Delete removes the row (5 → 4), Defect → Demo logs, Add Location "ISB" adds the column, Location Order moves it. `rg "https?://"` on the 3 files: none.
- **I rebuilt `final-ui/dist/index.html` again** (third time today, for the gate; the earlier copy is in my scratchpad): Otto should deploy from the latest one, or rebuild. Nothing in this batch is unfinished, so **no "Proposed: in progress" placeholder was needed.**
- **Not done:** Tanya's click-through, then the deploy (per the TASK). The sidebar highlights "Home" on `/stock/*` pages, which is the shell's, not mine.

## Questions

## Review
- **Shell request (Flash, 2026-11-10), sent to Sober via Porter:** add `"PROPOSED"` to `Group` (`shell/types.ts:3`) and merge `@/pages/proposed` into `PAGES` (`shell/registry.ts`). Flash owns `src/pages/proposed/index.ts`. A local cast until Sober lands it is OK; **remove the cast** once it's in.

## Review: batch 2, the 7 Proposed pages (Sector, 2026-11-10): ✅ accepted on code
- **Re-checked by me:** final-ui `tsc` 0. `src/pages/proposed/` holds the 7 pages + `parts.tsx` (`ProposedBanner`, one wording: "Proposed: to confirm… Size ≈ X" / card 7 "to ask ขวัญ first"), and all 7 use it. No `http(s)://` in the proposed pages or the mock.
- **Flash's click-through is accepted:** a built copy over file://, CEO / Admin / Coach, 0 console messages, 0 network requests.
- **Card 6 (Stock report filters) CEO + Admin: accepted.** It follows the real Stock Report's rule.
- **Waiting on Sober's shell (3 edits):** `"PROPOSED"` in `Group` (`shell/types.ts:3`), a PROPOSED entry in `GROUP_ICON` (`shell/Layout.tsx:9`), and `@/pages/proposed` in `registry.ts` `PAGES`. Then Tanya's click-through (REQ-5011 acceptance), then the deploy.
- **2026-11-10 (Sector):**
  - Sober's PROPOSED wiring landed `"PROPOSED"` in `Group` + the registry line, **but not the `GROUP_ICON` entry**. final-ui `tsc` fails with TS2741 at `shell/Layout.tsx:9` (verified by me). Sent to Sober via Porter (one entry).
  - His edit also overwrote `pages/proposed/index.ts` with a stub; Flash restored his 7 entries (verified: the header and entries are back).
  - `ProposedBanner` stays in `pages/proposed/parts.tsx` (the shell exports none).

## Review: batch 3, Revenue + All Report (Sector, 2026-11-10): ✅ accepted on code. DONE follows Tanya's click-through
- **Re-checked by me:** final-ui `tsc` 0. Sober's shell fix is in: `Group` has PROPOSED (`types.ts:3`); `GROUP_ICON` has `PROPOSED: FlaskConical` (`Layout.tsx:9`); the registry merges Team C's PROPOSED list. The 7 Proposed pages now show in the menu.
- **Flash's real-dist click-through is accepted:** console 0, network 0, no h-scroll at 375. Revenue at the built words and states (forms open empty with inline errors; Refund confirm + Kept/Cancelled box + Refunded badge). All Report on mock data with a real CSV, money CEO-only.
- **The 4 judgement calls, accepted** [SA-decided]:
  1. **Summary keeps the agreed Period + Category filters.** The real BF has Date + Type. The GR web shows the **agreed** design. ⇒ **Build gap noted:** the BF Revenue Summary lacks Period / Category filters. A follow-up after 14 Nov if her feedback keeps them.
  2. **Detail keeps its Export button.** The real BF Detail has no export yet (I checked `RevenueDetail.tsx`); it's agreed scope (card 4's fine print: "the agreed Detail export"). ⇒ **Build gap noted:** the Revenue Detail export, after 14 Nov.
  3. **All Report CEO + Admin:** as built (`pages.ts:61`).
  4. **Card 6 CEO + Admin:** as before.
- **Disclosure accepted:** Flash rebuilt `final-ui/dist/` to run the gate (the old `index.html` is backed up in his scratchpad). **Otto deploys from a fresh build of the folder**, not an old dist.
- Next: **Tanya's click-through** (REQ-5011 acceptance, CEO / Admin / Coach), then the deploy.

## Batch 4 (Sector, 2026-11-10, Porter's split confirmed by Silver; **due TODAY**, since the GR web goes online today): Stock Report + Low Stock + Demo
- **Files, yours alone:** `final-ui/src/pages/b/stock/StockReport.tsx`, `LowStock.tsx`, `Demo.tsx` (their entries in `pages/b/index.ts` only if a title or route must change). **Fanta keeps** Product / Stock IN / Import / Stock OUT. **Don't edit `src/mock/b-stock.ts`** (hers). Need more mock rows? Ask me, and it goes to her via Porter → Silver.
- **Bring them to the built BF state** (same method as Revenue: carry the real components over, swap the data layer for the mock):
  - **Stock Report** (906 / 929): Movement / Sales History / Balance tabs + the period filter; the Type select stays (the final UI); the **#19 product filter + search** is the Proposed card 6 page, not here.
  - **Low Stock** (913): the per-type thresholds (F&B 10 · Safety 1 · Miller 5 · Sock 1 · Shirt 1) and the list.
  - **Demo** (918): the matrix · Move · Defect→Demo · Delete · Add/Order sites.
- **Anything you can't finish today** ships as a clean placeholder with the yellow **"Proposed: in progress"** banner (reuse `ProposedBanner` with in-progress wording), never a broken page.
- **DoD:** final-ui tsc 0 + vite build ok; real-dist click-through as CEO / Admin / Coach (console 0, network 0, no h-scroll at 375); shots in `evidence/TASK-937/`. Then Tanya, then the deploy.
- **Review batch 4 (Sector, 2026-11-10): ✅ accepted on code.**
  - final-ui `tsc` 0 (re-run by me).
  - Stock Report (Day / Month / Custom period; Sales History · Balance · Movement), Low Stock (per-type Setting + list, as 913) and Demo (incl. "Remove this item from every location") are at the built state.
  - **No placeholder needed.** Only Flash's 3 files changed; `mock/b-stock.ts` untouched (his report; Fanta is editing her own Stock files in parallel, as split).
  - Real-dist click-through: console 0, network 0; CEO + Admin open all three, Coach none; no h-scroll at 375.
  - The Stock Report Export button is kept as agreed-but-not-built (like Detail). ⇒ **Build gap noted for after 14 Nov:** the BF Stock Report export.
  - Otto deploys from a fresh build. → **Tanya's click-through, then the deploy, today.**

## 🔁 REWORK (Sector, 2026-11-10, Silver's finding via Porter): Thai toasts → English, FAST (before Tanya)
**My review missed it.** The `notify(...)` toast texts (and a few on-screen hint lines) are Thai across most of your GR-web files, not only Low Stock / Demo:
- `revenue/{Categories,Detail,EcaPayment,Manual,Refund,Summary}.tsx`
- `reports/StudentTab.tsx`
- `proposed/{ConversionFilters,StockReportFilters}.tsx`
- `stock/{LowStock,Demo}.tsx` (Demo has about 15 of them)

**Fix:** every toast and visible sentence in English (R0.5 / D2), the same meaning, short. Detail.tsx:189's sample-data hint too.
**Keep Thai only for:** mock person / place names, and «ขวัญ» in the card-7 banner (a name).
**Find them with a UTF-aware scan** (plain `grep -P` also matches — − ฿): `rg -n '[\x{0E01}-\x{0E3A}\x{0E40}-\x{0E4E}]' src/pages/b/revenue src/pages/b/reports src/pages/proposed src/pages/b/stock/{StockReport,LowStock,Demo}.tsx`. Paste the run with only names left.
DoD: tsc 0, vite build ok, the scan output, and one click-through of the toasts (shots of 2–3).

### REWORK done (Flash, 2026-11-10): toasts and hint lines are English
- **Scope:** besides your list I also fixed `proposed/{MoveCourse,PaymentSettingEdit}.tsx` and `Summary.tsx`'s two toasts, which the scan found. 28 Thai lines in 13 files (the scan's first run listed 30 lines, 2 of them the «ขวัญ» name): `stock/Demo.tsx` 14 lines (11 different sentences, 3 of them used twice), `Detail.tsx` 2 incl. the line-189 hint, `Summary` 2, and one each in Categories, EcaPayment, Manual, Refund, StudentTab, ConversionFilters, StockReportFilters, MoveCourse, PaymentSettingEdit, LowStock. (My pointer line said "22 strings": the right count is 28 lines.) Same meaning, short, e.g. «Moved 1 × Surfskate board from Bravo to STA (history saved)», «Give a reason first; the history keeps it», «Alert levels saved: F&B 6 · Safety 1 · Miller 5 · Sock 1 · Shirt 1».
- **The scan, run after the fix** (`Grep` with your Unicode range over `src/pages/{b/revenue,b/reports,proposed}` and `b/stock/{StockReport,LowStock,Demo}.tsx`; exit shows only these 2 lines, both the name «ขวัญ»):
  - `proposed/ReportRevenueConversion.tsx:8` — a code comment: «…to ask ขวัญ first (no size yet).»
  - `proposed/parts.tsx:11` — the card-7 banner: «Proposed: to ask ขวัญ first. Not in the agreed scope yet. Size not estimated.»
  Mock names (น้อง…) live in `src/mock/*`, outside the scanned pages; they stay.
- **Gates:** real folder `tsc --noEmit` 0 · `vite build` ✓ (dist rebuilt, 4th time today; Otto: deploy from the latest or rebuild) · I re-ran all three click-throughs on the real dist: **console 0, network 0** (`batch3-run-realdist.json`, `batch4-run-realdist.json`, `click-run-realdist.json`).
- **The toasts, clicked** (`evidence/TASK-937/toasts-english.mjs`, `toasts-english.json`): 14 toasts triggered as CEO (Demo ×3, Low Stock, ECA, Refund, Add Manually, Summary, Detail, Categories, Proposed 1 / 5 / 2, Students CSV) — **every text printed, none contains a Thai letter (`anyThai: false`)**. Shots: `toast-demo-moved.png`, `toast-eca-saved.png`, `toast-refund-saved.png`.
- **One side effect:** the Refund toast now starts with the same words as the in-page green box («Refund saved: …»); my click script's selector had to use the box's `role=status`. Harmless for users; say if you want the toast reworded.
- **Review of the Thai-toast rework (Sector, 2026-11-10): ✅ accepted.**
  - My own UTF-aware scan over all of Flash's GR-web files leaves only «ขวัญ» (the card-7 banner text, and one code comment in `ReportRevenueConversion.tsx:8`).
  - final-ui `tsc` 0.
  - 28 lines in 13 files fixed. His real-dist click-through: console 0, network 0, 14 toasts as CEO with no Thai letter (`evidence/TASK-937/toast-*.png`).
  - **Team C's whole GR-web share is ready for Tanya.** Otto deploys from a fresh build.

## Batch 5: GR round 5, Team C slice (Sector, 2026-11-11; Porter's route; PLAN-2026-11-11-gr-round5-split.md § Team C; her verbatim `project-docs/customer-2026-11-11-line-som-system/khwan-backoffice-feedback-2026-11-11-VERBATIM.md`). **GR web only (final-ui), mock only.**
- **#11 Revenue Summary:** "Apply filters" → **"Apply Filter"**; the top box shows **Unit** before Total (e.g. "Course 10 / 97,900").
- **#12 Revenue Summary:** a **second box under it, "Category / Unit / Revenue"**: every category at once, no filter clicks (her example, verbatim l.115–119). Mock totals must add up to the top box.
- **#15 Stock Demo:**
  - balance the rows (aligned columns);
  - **PLUS a new "Add Demo" button** (PM ruling via Porter: her question found a real gap, CHECK-2026-11-11 Q3). It opens a dialog: **item + site + qty + reason** → the matrix cell goes up, and a history line is written. Same look as the existing Defect → Demo dialog.
  - **No "Proposed" banner on it** (Porter routed it as part of the page). Real build later ≈ 0.5 d.
- **#16 Conversion** (your `pages/proposed/ConversionFilters.tsx`, and Export if it shows the same strings):
  - "Total: 7 conversions · 500 ฿" → **"Total: 7 (Bonus 500 ฿)"**; tidy the spacing;
  - column "Conversion" → **"Type"**, "Bonus" → **"Amount"**;
  - **menu: move it under SALARY, right before Other Income, titled "Bonus (Conversion)":** group and order in your own `pages/proposed/index.ts` entry (take Other Income's order from Team A's list and use one less);
  - **DROP its "Proposed" banner** (PM ruling: she's refining it as a real page). The other Proposed pages keep theirs.
- **Words:** English, no Thai on screen.
- **DoD:** final-ui tsc 0 + vite build ok; a real-dist click-through as CEO / Admin / Coach (console 0, network 0, no h-scroll at 375); a **UTF-aware Thai scan** of your files (only names); shots in `evidence/TASK-937/round5-*`. Report to me; then Sober rebuilds the single file → Otto → Tanya LIVE.
- Don't touch the shell (Sober is changing the menu order, labels and folding in round 5 at the same time).

### Batch 5 done (Flash, 2026-11-11): #11 · #12 · #15 · #16
**Files (mine only; no shell, no `mock/b-stock.ts`, no Team A file):** `pages/b/revenue/{Summary.tsx, summaryBoxes.ts (new)}` · `pages/b/stock/Demo.tsx` · `pages/proposed/{ConversionFilters.tsx, parts.tsx, index.ts}`.
- **#11 Summary:** the button reads **"Apply Filter"**; the top box is now **Type · Unit · Revenue**, the Total row carries the unit total, the Refund (Expense) row has no unit. Units: Today counts the day's lines (a "× 3" in a line is 3 units, otherwise 1); MTD / YTD are sample numbers.
- **#12 Summary:** a second box under it, **"Category / Unit / Revenue"**: every heading at once, no filter click. Her "big headings": COURSE split by sport (Inline Skate, Surfskate, Skateboard, Bike, …, plus Balance Camp and Birthday), every other type one row named after the type (Voucher, ECA, Sales, F&B, Rent, Other, 1st Trial). **It adds up** (checked in the browser, `round5-run.json`): Today 16 units / 82,700 ฿ in both boxes; MTD 208 / 757,475; YTD 2,067 / 7,113,915; Today with Branch = Bravo 15 / 82,200, both boxes. Branch splits Today only (as before: the other tabs show both branches and say so). The box ignores the Type / Category filters on purpose (her words: everything at once).
- **#15 Demo:** the matrix is a fixed-layout grid: equal-width site columns (6 × 109 px), headers and numbers centred, so the rows balance. **New "Add Demo" button** (first in the header, no Proposed banner): dialog Item + Location + Qty + Reason, same look as Defect → Demo; Save without a reason is refused, a good Save raises the cell (Surfskate board at STA 2 → 4), writes one history line («Added → STA, 2, Bought 2 more for the school class») and the toast reads "Demo added: 2 × Surfskate board at STA".
- **#16 Conversion:** title **"Bonus (Conversion)"**, the **Proposed banner is gone**, the Total reads **"Total: 7 (Bonus 500 ฿)"**, columns **Type** and **Amount** (the shared table, so the Conversion export page shows the same two names and keeps its own banner). Menu: its entry in `pages/proposed/index.ts` is now `group: "SALARY", order: 169` (Other Income is 170): the sidebar shows **Payment Detail → Bonus (Conversion) → Other Income** (read from the built page).
- **Gates:** real folder `tsc --noEmit` 0 · `vite build` ✓ (dist rebuilt, 6th time; the single file now includes Sober's round-5 shell as it stood) · **click-through on the real dist `round5-run.json`: console 0, network 0**; no horizontal scroll at 375 on the three pages (CEO); shots `round5-1280-ceo-{summary-today,summary-mtd,demo,add-demo-dialog,demo-after-add,conversion}.png`, `round5-375-ceo-*.png`. **Thai scan** (the UTF-aware `Grep` over my folders, now including `.ts`): one line left, the name «ขวัญ» in a code comment (`ReportRevenueConversion.tsx:8`).
- **Roles seen on the new shell:** CEO opens all three; **Coach none**; **Admin (Khwan)** opens Summary, Detail and Stock Demo but not Bonus (Conversion); **Admin (Kung)** opens Stock Demo only. The shell now has TWO admin entries in "Viewing as" (CEO · Admin (Khwan) · Admin (Kung) · Coach) and lets Khwan's admin see Revenue; that is Sober's shell logic, not my `roles` (my Revenue entries still say `["ceo"]`). Flagging it so nobody thinks I changed it.
- **Not re-run:** my earlier click scripts (batch 2–4, toasts) still point at the old role switcher (a segmented control); the "Viewing as" Select broke their `setRole`, so I only re-ran the round-5 script. Say if you want the older ones refreshed for the new shell.
- **Review batch 5 (Sector, 2026-11-11): ✅ accepted.**
  - final-ui tsc 0 (re-run by me); the UTF-aware Thai scan leaves only a code comment.
  - Summary: "Apply Filter" (`Summary.tsx:103`) and the "Category / Unit / Revenue" box (`:186`); Flash's browser sums agree (Today 16 / 82,700 · MTD 208 / 757,475 · YTD 2,067 / 7,113,915).
  - Demo: the aligned grid + the "Add Demo" dialog.
  - Conversion: "Bonus (Conversion)" in SALARY at order 169 (before Other Income 170), no banner, "Total: 7 (Bonus 500 ฿)", columns Type / Amount.
  - The shell is untouched. Khwan-vs-Kung on Revenue is Sober's round-5 per-menu grants (Khwan gets all of REVENUE from round 4), as designed.
  - Note: the route path stays `/proposed/conversion`. It's cosmetic, and the menu shows the new title.
  - → Sober rebuilds the single file → Otto → Tanya LIVE.
