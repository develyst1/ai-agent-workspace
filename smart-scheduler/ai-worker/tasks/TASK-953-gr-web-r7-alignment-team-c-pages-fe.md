# TASK-953 — FE: GR web round 7a — one alignment rule on Team C's pages — @Flash (Team C)

**From @Sector, 2026-11-12.**
- **Source:** ขวัญ (CUSTOMER-ANSWERS 2026-11-12 03:15, ledger 28): "every page … some left, some right". Routed by Porter (inbox/SA-C.md, 03:31).
- **The rule:** `ai-worker/RULE-2026-11-12-gr-web-alignment.md` (7 lines). Read it first. It is Sober's proposal, which Silver agreed with. If it changes, I amend this TASK.
- **Repo:** `SOM-BALANCE-Backoffice-spec/final-ui`. It is a mock only and not a git repo, so no git.
- **Size:** about 0.75 d. **Start now.**

## Your files (closed list, `src/pages/`)
- `b/stock/{StockReport, LowStock, Demo}.tsx`
- `b/revenue/{Categories, Detail, EcaPayment, Manual, Refund, Summary}.tsx`
- `b/reports/{AllReport, CourseTab, ReportTab, StudentTab}.tsx`
- `proposed/{ConversionExport, ConversionFilters, MoveCourse, PaymentSettingEdit, ReportRevenueConversion, RevenueSummaryExport, StockReportFilters, parts}.tsx`
- `b/common.tsx` only if a shared Team C helper needs it. Its `money()` already wraps `fmtBaht`, so keep it.
- **Not yours:**
  - `b/stock/{Product, StockIn, Import, StockOut}.tsx` (Fanta);
  - `a/*` (Teams A and B);
  - `src/shell/*` (Sober).

  If one of these needs a change, ask me in `## Questions`.

## What I already found (a grep survey, 2026-11-12, not yet a page check)
- **`tabular-nums` appears on no Team C page.** Rule 3 means every `Table` with numbers gets it.
- **`ta="center"` sits in 11 files:** StockReport, LowStock, Demo (4 spots), Detail, EcaPayment, Summary (2), AllReport, CourseTab, ReportTab, StudentTab, StockReportFilters. Rule 1: none stays. Numbers go right; everything else goes left.
- **Money:** pages use `money()` from `b/common.tsx`, which is `fmtBaht`. Keep it, and check that no `toLocaleString` amount is left without the ` ฿` suffix (there are 3 `toLocaleString(` calls).
- **Forms and boxes laid out with `SimpleGrid`:** `proposed/MoveCourse.tsx:23`, `proposed/PaymentSettingEdit.tsx:59`, `b/reports/ReportTab.tsx:64`.
  - The overview cards at ReportTab :64 are cards, not a form: keep the grid. Inside each card, apply rule 5 (label left, value right).
  - A two-column form (rule 6) becomes one column; only a From/To pair may share a row.
- `Categories`, `Manual`, `AllReport`, `ConversionExport` and `ConversionFilters` have no table header. Check their forms and boxes against rules 5–7.

## What to do
Apply rules 1–7 on every page in your list:
- numeric columns right, header and cells together;
- nothing centred;
- totals in their own column;
- `tabular-nums` on number tables;
- the Action column last and right-aligned;
- label/value boxes as rows, label left and value right;
- forms in one column, with Save/Cancel at the bottom right;
- page actions in `PageHeader`.

Change **layout only**. No words, data or behaviour change. The "Proposed" badges stay. Where a page already shows 2-decimal amounts, keep the format and only align it.

## Done = (evidence goes in `## Implementation Notes`)
- **Step 0, written first:** for each page, what was off and what you changed. A page that was already right still gets a line saying "OK, no change".
- `npx --yes --package typescript@5.6.3 tsc --noEmit` → 0.
- `vite build` OK, into a scratch outDir.
- Thai scan: no new Thai.
- A headless check through the real «Viewing as» dropdown, as CEO:
  - every numeric `th`/`td` on your pages computes `text-align: right`, every text column computes left, and nothing computes `center`;
  - every form or dialog is one column;
  - 375px: no horizontal overflow;
  - 0 console errors.
- Screenshots in `tests/evidence/task-953-flash/`: Revenue Summary, Stock Report, one All Report tab, and Payment Setting Edit (the form).

**Sector reviews.** No git.

## Questions
_(—)_

## Implementation Notes
**Flash (FE, Team C), 2026-11-12. Layout only: no words, data or behaviour changed. Repo `final-ui` (not git), no git run.**

**Step 0: per page, what was off and what I changed**
- `b/stock/StockReport`: numeric columns were already right. The empty-state text was centred → left. `tabular-nums` added to the 3 tables.
- `b/stock/LowStock`: columns already right (and the Action-like input column). Empty row centred → left. `tabular-nums` on both tables.
- `b/stock/Demo`: the matrix header, site cells and Total column were all `ta="center"` → right (fixed layout kept, so widths stay equal). `tabular-nums` on the matrix and the history table. The Add/Move/Delete dialogs are one column (From/To is the only pair). The code comment now says "right-aligned".
- `b/revenue/Summary` (2 tables): columns and totals already right, and the "View" action column last and right. Empty rows centred → left. `tabular-nums` on both tables.
- `b/revenue/Detail`: columns right, total in its own column. Empty row centred → left. `tabular-nums` added.
- `b/revenue/Manual`: 6 fields sat 3 to a row → one column (all `span=12`). Cancel/Save were already bottom-right.
- `b/revenue/EcaPayment`: 6 fields sat 3 to a row → one column. Empty history text centred → left. `tabular-nums` on the history table. The `toLocaleString` amount in the toast already carries ` ฿`.
- `b/revenue/Refund`: Date + Amount shared a row (`Group grow`) and are not a pair → `Stack`. `tabular-nums` on both small tables. Save was already right.
- `b/revenue/Categories`: OK, no change. It has no table; its Add dialog is one column.
- `b/reports/AllReport`: the "Coming with Salary." text centred → left. Otherwise OK.
- `b/reports/ReportTab`: the 6 cards were stacked (label / big value / "Previous month: x") → two rows each, label left and value right (`Group justify="space-between"`). The text is unchanged, including the colon. The card grid stays (cards, not a form). Empty text centred → left.
- `b/reports/CourseTab`, `StudentTab`: columns and the Total row already right. Empty text centred → left. `tabular-nums` added.
- `proposed/PaymentSettingEdit`: the value cells were left → right (also the fixed rows), the edit inputs right-aligned, the page is now one column of cards (`SimpleGrid cols={1}`) and `tabular-nums` is added. The Edit button and Cancel/Save stay in `PageHeader`.
- `proposed/MoveCourse`: OK, no change. The grid holds cards (title left, badge right), not form fields, and the modal is one `Stack`.
- `proposed/parts` (ConversionTable → ConversionFilters, ConversionExport): the empty-state text was centred → left; `tabular-nums` added. Amount was already right.
- `proposed/RevenueSummaryExport`, `ReportRevenueConversion` (2 tables), `StockReportFilters`: numbers already right; `tabular-nums` added; StockReportFilters empty text centred → left.
- `b/common.tsx`: untouched. `money()` still wraps `fmtBaht`.

**Evidence** (`ai-worker/evidence/TASK-953/`; I kept it with my other evidence in the desk, not `tests/evidence`, because `final-ui` has no tests folder)
- `tsc --noEmit` (typescript 5.6.3) → 0.
- `vite build` into a scratch outDir → OK (the real `dist` was not touched).
- Thai scan: only `฿` and the name «ขวัญ» in existing comments. No new Thai.
- `check-alignment.mjs` on the built single file over `file://`, as CEO through the real "Viewing as" Select (`r7a-run.json`): 24 page/tab views, 32 tables, 453 numeric cells.
  - Every numeric `th`/`td` computes `right`; every text column computes left; **0 cells centred** (`badCells: 0`).
  - The check skips the action/input columns (buttons and inputs), which rule 4 puts right.
  - Forms: Manual, ECA, Refund, Payment Setting (edit), Demo Add, Categories Add all have `maxPerRow: 1`.
  - 375px: no horizontal overflow on any of the 17 routes.
  - Console 0 errors and warnings, network 0 requests.
- Screenshots: `r7a-1280-ceo-revenue-summary.png`, `r7a-1280-ceo-stock-report.png`, `r7a-1280-ceo-all-report-report.png` (+ course, student), `r7a-1280-ceo-payment-setting-edit.png`, `r7a-1280-ceo-demo.png`, plus the Manual, ECA and Refund forms.

**For Sector:** the filter bars (Branch / Period / Type selects in a row) are filters, not forms, so I left them. Say if rule 6 should reach them.

## Review (Sector, 2026-11-12): ✅ DONE

**What I re-ran myself:**
- `tsc --noEmit` (typescript 5.6.3) → 0.
- `grep ta="center"` across every file in the closed list → **0 files**.
- `tabular-nums` is now present on every page that has a number table (Summary, Detail, EcaPayment, Refund, CourseTab, StudentTab, StockReport, LowStock, Demo).

**What I checked in the evidence:**
- `r7a-run.json`: `badCells: 0`, `consoleProblems: []`, 6 forms with `maxPerRow`.
- `r7a-err.txt` is empty.
- The All Report REPORT screenshot shows the cards as label left, value right, with the money in `฿`.

**Against the rule:**
- Rule 1 (numbers right, nothing centred) ✓
- Rule 3 (`money()` = `fmtBaht`, plus `tabular-nums`) ✓
- Rule 5 (ReportTab cards) ✓
- Rule 6 (Manual, ECA, Refund, Payment Setting edit and Demo forms are one column; From/To is the only pair) ✓
- Layout only: no words, data or behaviour changed.

**My answers to your points:**
- **Filter bars** (Branch / Period / Type selects in a row) are filters, not forms, so rule 6 does not reach them. Keep them in one row. [SA-decided]
- **Payment Setting edit:** Cancel/Save stay in `PageHeader`. It is a whole-page edit mode, so rule 7 (page actions in the header) fits better than rule 6. [SA-decided]
- **Evidence location:** `ai-worker/evidence/TASK-953/` is fine, because final-ui has no tests folder.

**Not in scope, noted only:** on the REPORT filter bar, the "Month" label sits lower than "Branch". This is the filter bar and it was like this before the round; leave it.

Security review: none (mock, layout only).
