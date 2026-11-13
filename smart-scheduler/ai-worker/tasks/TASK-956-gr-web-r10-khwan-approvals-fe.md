# TASK-956 — FE: GR web round 10 — what ขวัญ approved on 2026-11-12, moved into the real menus — slices A (@Fern) · B (@Fanta, via Porter) · C (@Flash, via Porter)

**From @Sober, 2026-11-12.** Source: `REQUEST-porter-to-sober-2026-11-12-gr-round-10-khwan-approvals.md` (her lines at 15:26, 15:58 and 18:49; `LIST-2026-11-12-gr-web-proposed-items.md`). Back-office feedback is free until 17 Nov and goes on the GR web first (SYSTEM-FACTS l.4455).
Repo `SOM-BALANCE-Backoffice-spec/final-ui` (mock only, not a git repo, so no git). Files are owned as in TASK-936 l.143 + TASK-955: **Fanta** owns `a/salary/{Settings,…}` and `b/stock/{Product, StockIn, Import, StockOut}`; **Flash** owns `b/revenue/*`, `b/reports/*`, `pages/proposed/*`, `mock/proposed.ts`, `b/stock/{StockReport, LowStock, Demo}`.
**One change of claim for this round only [SA-decided; Sector confirmed via Porter, 2026-11-12 20:57; B → Silver/Fanta, C → Flash routed]:** **Fern** takes the Stock filters on `b/stock/{StockReport, LowStock, Demo}.tsx`, so that Flash's slice is not three times the others. Flash does not touch those three files in round 10.

## Rules for every slice
- **An approved item leaves PROPOSED.** Its yellow banner and its card go; the feature sits in the real page, with no "Proposed" mark.
- **"To confirm" items** keep a small orange tag `Proposed: to confirm`, like Monthly Payment's Unlock (LIST #8). This applies only where this TASK says so.
- English only · no `ta="center"` · forms follow rule 6 (one field per row, Save/Cancel bottom-right) · a button to another page is drawn only when `useCanOpen()` allows it (round 9).
- Mock numbers are fixed and realistic. Every total is the sum of the rows shown. No real names next to money (CONVENTIONS §2).

## Slice A — @Fern: Stock filters (item 2) on `b/stock/{StockReport, LowStock, Demo}.tsx`
- **One filter bar on every Stock list:** **Type** (product category, «All» first) · **Product** («All» first, searchable) · **Search** (free text on the product name). It filters that list only, live, with no Apply button. «No matching items» when the list is empty.
- **StockReport:** the bar sits above the tabs and applies to **Sales History, Balance and Movement**. Keep Sales' Customer select and Movement's existing Type select. On Movement, the existing select is the movement type: label it «Movement type» so it isn't confused with the product Type.
- **LowStock:** the bar above the list. **Demo:** the bar above the matrix; it filters the product rows.
- The Type values come from the categories the page already uses. Do not add a new mock file; if a list lacks the category, derive it from the page's own product data.
- **Done =** tsc 0 · build OK · headless as CEO and as Admin (Kung, with Stock ticked): each filter narrows each list, «All» restores it, the empty state shows · 375 px has no horizontal overflow · 0 console errors · one screenshot per page.

## Slice B — @Fanta (Porter routes): Payment Setting Edit (item 1) + the Product filter bar (item 2)
1. **`a/salary/Settings.tsx`:** move in the edit of rates and commission rules from `proposed/PaymentSettingEdit.tsx`, as the page's Edit mode. Round 6 already gave the commission groups an Edit. Extend that same pattern to the rest, with no second edit style. CEO only, as the page is now. Read Flash's proposed page for the fields; copy nothing from `pages/proposed/*` by import (other team's files) — rebuild it in your file.
2. **`b/stock/Product.tsx`:** the same filter bar as slice A (Type · Product · Search) above the product list. If Product already has a category filter, the bar replaces it (one bar, not two).
- **Form pages get no bar [SA-decided]:** STOCK IN, Import from Excel and STOCK OUT are entry forms, not lists (StockOut's product box is already searchable). Porter may ask ขวัญ whether she meant these too.
- **Done =** as slice A, plus: Payment Setting edit → Save → the new value shows in the list and a toast; Cancel leaves it unchanged.

## Slice C — @Flash (Porter routes): items 1, 3, 4, 5 + removing the approved PROPOSED cards
1. **Conversion export → SALARY → Bonus (Conversion)** (`proposed/ConversionFilters.tsx`, route `/proposed/conversion` stays: it is in `NEVER_GRANTABLE`): Excel + PDF buttons in its header, `fakeDownload("conversion-<period>.xlsx|.pdf")`.
2. **Revenue Summary export → REVENUE → Summary** (`b/revenue/Summary.tsx`): an Excel button in the header, `fakeDownload("revenue-summary-<period>.xlsx")`.
3. **Report Revenue → REPORTS → All Report** (`b/reports/`): a new tab «Revenue», **CEO only (absent for an Admin, never masked; same rule as ReportTab)**. Box 1: **by Category**, months across, Total row. Box 2 under it: **by Type** (today's table). Excel button. Category and Type names = those on REVENUE → Type and Category.
4. **Report Conversion → REPORTS → All Report:** a new tab «Conversion». Columns: **Coach · 1st Trial (Student) · Open Course (After Trial) · Conversion % · Renewal Course**, month + branch filters as the other tabs. Conversion % = Open Course ÷ 1st Trial, 0 decimals, «–» when 1st Trial is 0. **Each count is a link that opens the name list** (a modal: Student · Date · Course) for that coach and column. The definitions are the front office's NVR ones; the mock only has to be consistent (each list's length = the count). Student names are made up; no real names. Who may see it: CEO + Admin, like All Report [SA-decided: no money on it].
5. **ECA Payment (`b/revenue/EcaPayment.tsx`), per REQUEST-…-eca-payment-pending-vat-wht.md § Answer to the follow-up:**
   - **Status Pending / Received.** A new entry may be saved **Pending** with no Payment Date. A «Mark received» action on a Pending row asks for the Payment Date (and lets the amount be edited) and makes it Received. The list shows a status badge and a Status filter (All · Pending · Received). Only Received rows count in the revenue total. A Pending row can be deleted; a Received one cannot.
   - **VAT / WHT:** a Mode select with **Amount excludes VAT · Amount includes VAT · Amount is net after WHT** (her ไม่รวม VAT · รวม VAT · หลังหัก ณ ที่จ่าย), plus VAT % (default 7) and WHT % (default 3), both editable. The result block shows **Before VAT · VAT · Total incl. VAT · Withholding tax · Net received** (her ราคาก่อน VAT · VAT · ราคารวม VAT · หัก ณ ที่จ่าย · ยอดที่ได้รับจริง). There is **one** net line; nothing like her calculator's «ยอดหลังหัก» line. Formulas, rounding and the 1-satang rule are those in the § Answer to the follow-up. Check the example: รวม VAT 10,000 → 9,345.79 / 654.21 / 10,000.00 / 280.37 / 9,719.63.
   - **To confirm (orange tag):** next to the revenue total, «Revenue = Before VAT · Proposed: to confirm». Also next to the net line, «Proposed: to confirm».
   - English only, as everywhere on the GR web.
6. **Remove the approved PROPOSED cards** in `pages/proposed/index.ts`: payment-setting, conversion-export, revenue-export, stock-report, report-revenue-conversion. **Keep** `move-course` (not in this round) and `conversion` (it is SALARY's page). Delete the page files only if nothing else imports them. Note that PaymentSettingEdit goes in the **same build** as Fanta's Settings change.
- **Done =** tsc 0 · build OK · no `ta="center"` · headless: each item on its new page as CEO; Admin sees Conversion but not Revenue on All Report; the ECA example gives exactly the 5 numbers above; Pending → Received moves the total; the PROPOSED menu shows only «Move course to branch» · 0 console errors · screenshots of All Report Revenue, Conversion with its modal open, and the ECA form.

## After the slices
Sober reviews each slice → one round-10 build (tsc · `MENU_ACCESS_HELD = false` · no `ta="center"` · md5) → Otto → Tanya through Porter. No git.

## Questions
_(—)_

## Implementation Notes
### Flash (Team C) — 2026-11-12, Slice C (items 1, 3, 4, 5 + the PROPOSED cards)
Repo `final-ui` (not git, no git run). The 3 Stock files were not touched. **46 headless checks PASS / 0 FAIL**, console 0, network 0 (`ai-worker/evidence/TASK-956/check-slice-c.mjs` → `r10c-run.json`).
- **Item 1, Bonus (Conversion)** (`proposed/ConversionFilters.tsx`): Excel + PDF in the `PageHeader`; toast `conversion-2026-10-01_2026-10-31.xlsx|.pdf` (the period shown, From_To). Both are disabled while From is after To. The route `/proposed/conversion` is unchanged.
- **Item 2, Revenue Summary** (`b/revenue/Summary.tsx`): an Excel button in the header (a plain button, not a link, so the round-9 rule does not touch it); toast `revenue-summary-2026-10-16.xlsx` on Today, `…-2026-10.xlsx` on MTD, `…-<From>_<To>.xlsx` on YTD.
- **Item 3, All Report → REVENUE** (new `b/reports/RevenueTab.tsx`, `AllReport.tsx`): CEO only. The tab is not drawn for an Admin; if the viewer is switched to an Admin while it is open, the page falls back to REPORT. Box 1 by Category (months Aug–Nov 2026 across, a Type badge, a Total column), box 2 by Type, both ending in Total Revenue and then Refund (Expense) (same as REVENUE → Summary: refunds are an expense under the total). The Excel button is in the page header while this tab is open. Category and Type names are those of REVENUE → Type and Category.
  - **Numbers:** each month's total is the REPORT tab's Revenue for that month (1,320,000 / 1,540,000 / 1,610,500 / 1,482,000 ฿) and each refund line its Refunds; the category rows are generated from fixed shares (`mock/c-reports.ts`, a new file of mine) with the first row taking the remainder, so every total is the exact sum of its rows. Checked: both boxes' totals equal each other and the REPORT tab.
- **Item 4, All Report → CONVERSION** (new `b/reports/ConversionTab.tsx`): CEO + Admin, no money. Columns Coach · 1st Trial (Student) · Open Course (After Trial) · Conversion % · Renewal Course; Month + Branch filters like the other tabs (Aug–Nov 2026 have data; another month shows «No data for this period»). Conversion % = Open ÷ 1st Trial, 0 decimals, «–» when 1st Trial is 0 (Ton, Other, Nov 2026). Each non-zero count is a link that opens a modal Student · Date · Course; a 0 is plain text. The lists are built from the same rows as the counts. A Total row sits under the coaches. Student names are invented («Nong Mali» …).
  - **Tab labels are in capitals** (REVENUE, CONVERSION) to match the six that are there. Say if you want «Revenue» / «Conversion».
- **Item 5, ECA Payment** (`b/revenue/EcaPayment.tsx`):
  - Form, one field per row: School · Term · Price per class · Student · Class / Term · **Status** (Received default | Pending) · **Payment Date** (only while Received; hidden while Pending) · **Mode** (Amount excludes VAT | includes VAT | is net after WHT) · **VAT %** (7) · **WHT %** (3), both editable 0–100. Below: Total Amount, then the five lines **Before VAT · VAT · Total incl. VAT · Withholding tax · Net received**, label left and value right, 2 decimals. One net line only. Save bottom-right.
  - Formulas = your § Answer to the follow-up (satang, half-up; WHT on the price before VAT; «includes VAT»: VAT = Amount − Before; «net»: Amount is the Net and the VAT line absorbs the satang). **Example checked: includes VAT 10,000 → 9,345.79 / 654.21 / 10,000.00 / 280.37 / 9,719.63.** Excludes 10,000 → 10,000 / 700 / 10,700 / 300 / 10,400.
  - History: new columns Status (badge), Before VAT, Net received, an **Action** column last (right): a Pending row has **Mark received** and **Delete**; a Received row has none. Status filter All · Pending · Received. Mark received opens a modal (Payment Date, and an editable Amount); Delete asks to confirm. Seed: the two Received rows as before + one Pending row (KIS Term 3, 24,000 ฿).
  - **Revenue total (Received only)** under the history = the sum of Before VAT of the Received rows (64,800.00 at the start; Pending → Received with an amount edited to 23,500 moved it to 88,300.00). Orange tags: **«Revenue = Before VAT · Proposed: to confirm»** next to that total, and **«Proposed: to confirm»** next to Net received.
- **Item 6, PROPOSED menu** (`proposed/index.ts`): the 5 cards are unregistered; the menu's PROPOSED group lists only «Move course to branch». I deleted `ConversionExport`, `RevenueSummaryExport`, `ReportRevenueConversion` (nothing imported them). **I left `PaymentSettingEdit.tsx` and `StockReportFilters.tsx` on disk, unregistered**, as the field lists for slices B and A; the A review is done, B is not. Delete them once Fanta's slice is reviewed (tell me, or do it). Nothing imports them.
- tsc 5.6.3 → 0 · `vite build` OK (scratch dir) · no `ta="center"` in `src/pages` · no new Thai (only ฿ and «ขวัญ» in comments) · 375 px no overflow on All Report REVENUE / CONVERSION, ECA, Summary, Bonus (Conversion).
- Headless as CEO, then as Admin (Kung, with All Report ticked by the CEO): the Admin has no REVENUE and no SALARY tab, has CONVERSION, sees no ฿ on it and no Excel button.
- Screenshots in `ai-worker/evidence/TASK-956/`: `r10c-1280-ceo-all-report-revenue.png` · `r10c-1280-ceo-conversion-modal.png` (modal open) · `r10c-1280-ceo-eca-form-example.png` (the 10,000 example) · `r10c-1280-ceo-eca-mark-received.png` · `r10c-1280-admin-conversion.png`.
- Out of scope, noted: the older Salary check scripts do not cover these pages; `mock/proposed.ts` still holds the data of the removed cards (unused, harmless).

## Review
- **Slice A (Fern), Sober 2026-11-12: ✅ DONE.**
  - Re-run: tsc 5.6.3 → 0. The first run raised TS6053 on 3 proposed files that Flash was deleting mid-run; the second run passed. 0 `ta="center"` in `src/pages`.
  - Code read: `StockFilterBar.tsx` gives one bar to StockReport l.102 (above the tabs, all 3 tabs), LowStock l.110 and Demo l.158. «All» comes first, Product narrows to the chosen Type, and a Type change clears an out-of-type Product. «Movement type» is relabelled.
  - `fui-956-kung-2-movement-empty.png`: Kung, Search «zzz» → «No matching items»; the bar sits above the tabs and «Movement type» sits inside the tab.
  - **The new shared file is accepted** (inside Team C's `b/stock/`, made under this round's claim). Fanta may import it for Product; it is the one bar, not a copy. After round 10 it returns to Flash with the other three files.
  - The `catOf` word rules (Inline skate / bike / helmet → Other) are mock-only; fine for the GR web.
  - Security review: none (mock only).
- **Slice C (Flash), Sober 2026-11-12: ✅ DONE.**
  - Re-run: tsc 5.6.3 → 0 · 0 `ta="center"`.
  - **ECA:** `EcaPayment.tsx` l.42–68 computes in whole satang with half-up rounding. «incl»: Before = A÷(1+v), VAT = A − Before. «net»: Net = A is fixed, Total incl. = Net + WHT, and the VAT line absorbs the satang. This matches my § Answer to the follow-up. `r10c-1280-ceo-eca-form-example.png` shows 10,000 → 9,345.79 / 654.21 / 10,000.00 / 280.37 / 9,719.63 exactly, one net line with the orange tag, and the Pending row with Mark received + Delete while Received rows have none.
  - **All Report:** `AllReport.tsx:50-52` drops REVENUE for a non-CEO (absent, not masked); CONVERSION is CEO + Admin with no money. Count → modal lists are built from the same rows, so each length = its count.
  - **Accepted as built:** Status defaults to Received (the old behaviour, so a plain entry works as before); tab labels in capitals to match the six existing tabs; `mock/c-reports.ts` a new Team C mock file.
  - **Left for after slice B (done, see below):** `proposed/PaymentSettingEdit.tsx` + `StockReportFilters.tsx` are unregistered but still on disk. After B's review I delete them with Flash's OK via Porter; until then they are dead code. `mock/proposed.ts` keeps unused data: harmless.
  - Security review: none (mock only).

### Slice A — Fern, 2026-11-12 (Stock filter bar)
Files: `b/stock/{StockReport, LowStock, Demo}.tsx` + **one new shared file `b/stock/StockFilterBar.tsx`** (the bar, `catOf`, `passes`, `isFiltered`; not a mock file). I added it so the three lists (and Fanta's Product bar in slice B, if he wants it) share one bar instead of three copies. Delete it and inline if you prefer.
- **Bar:** Type (All first, only types the list has) · Product (All first, searchable; narrows to the chosen Type, and a Type change clears an out-of-type Product) · Search (substring on the name). Live, no Apply.
- **Type of a row** = the category of the product it names (exact, else name starts with a product name). An item that is no product gets it from its words: Demo «Inline skate (kids)» → Inlineskate, «Balance bike» → Bike, «Helmet (demo)» → Safety, the boards → Other. No new mock file.
- **StockReport:** one bar in its own card above the tabs; applies to Sales History, Balance and Movement. Customer select kept; Movement's old «Type» select is now «Movement type». Empty: «No matching items» (Balance got an empty state too). **LowStock:** bar inside the list card above the table; Product choices are the low items only; the «N low» badge follows the filter. **Demo:** bar above the matrix; filters the product rows (the History card is not filtered).
- `tsc` 5.6.3 → 0 · `vite build` OK · no `ta="center"` · no Thai.
- Headless (`fui-956.mjs`, real «Viewing as» dropdown), 65 PASS / 0 FAIL, 0 console errors, as CEO **and** Admin (Kung): each filter narrows each list (Balance 12→1 for Bike; Sales 5→1 for «snack»; Movement 8→2 for Other; Low 2→1 for Miller; Demo 5→1 for Bike), «All» restores, empty state shows on every list, 375 px no overflow on all three pages.
- Screenshots `tests/evidence/task-956-fern/`: `fui-956-kung-3-low-stock.png` (Kung, empty state) + 7 more (`-ceo-/-kung-` 1–4).
- No git. unhandled-between-tests: 0.
- **Slice B (Fanta; Silver accepted, TASK-936 § Review part 8), Sober 2026-11-12: ✅ DONE.**
  - Re-run: tsc 5.6.3 → 0. Evidence `SOM-BALANCE-Backoffice-spec/tests/evidence/task-936/result-round10b.txt` ends **57 PASS / 0 FAIL** (Silver's note says 53; the file now has 57).
  - `r10b-payment-edit-modal.png`: every Payment Setting card has Edit; «Edit Extra Hour» is one field with Cancel/Save at the bottom right. `r10b-product-filtered.png`: Product uses the **shared** bar (Type F&B → 2 / 12), with no second filter.
  - **Audit exemption confirmed [SA-decided]:** a field group with no Save/Cancel of its own is a filter bar, not a form, so rule 6 (one field per row) does not apply; its fields may share a row. That is what this TASK asked for (slice A's bars do the same). `audit-align.mjs` l.116 is accepted.
  - Silver's nit (`Settings.tsx` l.343 missing space) is not blocking.
  - Security review: none (mock only).
- **Cleanup (Sober, 2026-11-12, as Flash offered):** deleted `proposed/PaymentSettingEdit.tsx` + `StockReportFilters.tsx` (nothing imported them; a copy is kept in my session scratchpad) and updated the comment on `proposed/index.ts` l.10.
- **Round 10 built (A + B + C):** md5 `207fcd1abad6aa87d713c3ee2ca4b299`. Gates: tsc 0 · `MENU_ACCESS_HELD = false` · 0 `ta="center"` in `src/pages` · `dist/index.html` 1,320.19 kB. → Otto.

## Round 10b — Tanya's round-10 findings (REQUEST-porter-to-sober-2026-11-12-gr-round-10b-fixes.md · TEST-151 § GR round 10) — Sober, 2026-11-12
Everything else in round 10 passed. One small round fixes three things. Slice A (Fern) has nothing in it.

### 10b-B — @Fanta (Silver; Porter routes): `a/salary/Settings.tsx` only
1. **D-151-10a, School Distance:**
   - **Edit → Save** changes that row in the table (STA 12 → 13 KM), and reopening Edit shows the new value.
   - **Add school → Save** adds a row with exactly the name and KM typed, and the toast names them («School QAS (7 km) added»).
   - Empty name, a duplicate name, or KM ≤ 0 → Save disabled.
   - The state lives in the page as the other cards' edits do (leaving the page may reset it, like the rest of the mock).
2. **O-151-10a, every number on each card is editable** [PM-decided], with the same Edit modal pattern, CEO only, one field per row:
   - **Extra Hour:** Rate, Weekday threshold (> Nth HR), Weekend threshold.
   - **OT:** the multiplier (the divisor rule text stays read-only).
   - **Transportation:** per-KM rate, Minimum, Trip.
   - **Bonus 50 / 100:** Amount, Condition and Pay to. Condition and Pay to are selects drawn from the values the page already shows; no free text.
   - **Any other number on these cards** follows the same rule. List in your Notes what you made editable and what you left alone (rule text, the Thai commission notes: not in scope).
   - Each Save shows the new value on the card plus a toast; Cancel changes nothing.
- **Done =** tsc 0 · build OK · no `ta="center"` · headless: Tanya's STA 12→13 and QAS 7 repros pass; every new field Edit → Save shows the value, Cancel doesn't; Kung is still locked out · 0 console errors · one screenshot.

### 10b-C — @Flash (Porter routes): `b/reports/ConversionTab.tsx` + `mock/c-reports.ts`
3. **O-151-10b, the counts are students, not trials** [PM-decided: her label says Student]:
   - **Each count = distinct children.** The name list has one row per child; a child with 2 trials shows both dates and activities in that one row (e.g. «12/10, 19/10 · Bike, Balance»).
   - Pete · Oct then reads 10, with 10 rows, and its Conversion % follows.
   - **The same rule applies to Open Course and Renewal Course:** one row per child; a child who renewed twice shows both dates in one row.
   - **The Total row = the sum of the coach rows.** Make the mock so that no child appears under two coaches in one month, so that sum = distinct children. Note in your Notes that it is mock-only.
- **Done =** tsc 0 · headless: for every coach × month × column, the count = the modal's row count = its distinct names; Pete · Oct · 1st Trial = 10 · 0 console errors · a screenshot of that modal.

**After both:** Sober reviews → round-10b build → Otto → Tanya re-checks via Porter. No git.

### 10b-C — Flash (Team C), 2026-11-12 (Notes)
Files: `b/reports/ConversionTab.tsx` + `mock/c-reports.ts` only. No git.
- **Counts are distinct children.** The page groups the events of a cell by `childId`: the count is the number of rows, and the modal has one row per child. A child with two trials (or two renewals) is one row with both dates and both courses in the same order («11/10/26, 18/10/26 · 1st Trial (Surfskate), 1st Trial (Skateboard)»). The same rule holds for Open Course and Renewal Course. The modal line now reads «10 students (one row per child)».
- **Pete · Oct 2026 · 1st Trial = 10 (All branches), with 10 rows** (8 Bravo + 2 Other). Its Conversion % is 7 ÷ 10 = 70%; the Total row reads 52%.
- **Total = the sum of the coach rows** in every month and branch. **Mock-only:** each child has a name that is unique in the whole mock, so no child is under two coaches in one month and the sum equals the distinct count. A child can sit in both 1st Trial and Open Course of the same coach (Open Course children are taken from that coach's trial children); the real NVR rule is the front office's.
- **Only change to a number:** Pete · Oct · Bravo 1st Trial was 10, now 8 (so All = 10). The other cells keep their counts; the lists changed (two-date rows).
- tsc: my files are clean; the run is not 0 right now because of 6 errors in `a/salary/Settings.tsx` (Fanta, being edited at the time: `km`/`setKm`, `idx`). Not mine; I did not touch it. `vite build` OK.
- Headless (`ai-worker/evidence/TASK-956/check-10b-conversion.mjs` → `r10b-run.json`), 7 PASS / 0 FAIL, console 0, network 0: for every coach × month × branch × column (All, Bravo, Other × Aug–Nov × 3 coaches × 3 columns) the count = the modal rows = the distinct names, courses match dates, a 0 has no link; the Total and Conversion % follow; no child under two coaches in a month; at least one row with two dates. The round-10 check (46 checks) still passes on this build.
- Screenshot: `r10b-1280-ceo-conversion-pete-oct-trial.png` (Pete · Oct · 1st Trial, 10 rows, two of them with two dates).
- **Names fix (Sober's review), 2026-11-12:** the letter suffix is gone. Every child is «Nong <Nickname>» (e.g. «Nong Lita», «Nong Kwang»), 163 invented nicknames in `mock/c-reports.ts`, each used for one child only (136 children in the mock). Counts, dates and courses are unchanged. The check now also fails on a name that is not `Nong <Nickname>` and on a nickname shared by two children: **9 PASS / 0 FAIL** (136 distinct names of 136 child-months), console 0. tsc 0 on the whole tree, build OK. Screenshot re-taken (same file name).
- **Review 10b-C (Flash), Sober 2026-11-12: ✅ DONE on behaviour, plus one small fix before the build.**
  - Re-run: tsc 5.6.3 → 0 on the whole tree (Fanta's in-progress Settings errors are gone now). `r10b-1280-ceo-conversion-pete-oct-trial.png`: Pete · Oct · 1st Trial, «10 students (one row per child)», 10 rows, three with two dates and courses in matching order. 7/7 checks over every coach × month × branch × column.
  - **Fix before the build (names only):** uniqueness is made with a letter suffix («Nong Baibua E», «Nong Ploy E» …). ขวัญ will read this list, and a stray letter after a nickname looks like a bug. Give each child a **distinct nickname with no suffix** (e.g. a wider pool of Thai nicknames in English letters: Nong Mint, Nong Pang, Nong Ice …). If the pool runs short, add more nicknames; never a suffix like «Jr» or a letter. Counts, dates and courses unchanged. Re-run `check-10b-conversion.mjs` (still 7/7) and send one screenshot. 10b-B is still in progress, so this does not delay the round.
- **Review 10b-B (Fanta; Silver accepted, TASK-936 § Review part 9), Sober 2026-11-12: ✅ DONE.**
  - Re-run: tsc 5.6.3 → 0 · 0 `ta="center"`. `result-round10c.txt` ends **53 PASS / 0 FAIL** (Tanya's STA 12→13 and QAS 7 repros included).
  - `r10c-transportation-edit-modal.png`: 4 fields, one per row (Car / Motorcycle × Per KM / Minimum per trip); behind it the School table shows STA 13 KM and the added QAS row.
  - The read-only list (Apply to, OT rule text, Bonus 100 Special Case / NO, the footnotes, the Thai commission notes) is accepted. The name field in Edit school, with a duplicate check that ignores the row's own name, is accepted.
  - Security review: none (mock only).
- **10b-C names fix (Flash): ✅** `mock/c-reports.ts` l.95–105: «Nong» + a nickname from a pool larger than the number of children; it throws if the pool runs short. No suffix. **Re-run by me on the round-10b build: `check-10b-conversion.mjs` 9 PASS / 0 FAIL**, console 0, network 0; Pete · Oct · 1st Trial = «10 students (one row per child)» (Nong Lita, Nong Max …).
- **Round 10b built:** md5 `e9590dc66e45893ed6444db065012c39`. Gates: tsc 0 · `MENU_ACCESS_HELD = false` · 0 `ta="center"`. → Otto.
