# TASK-977: FE, GR web round 13, ขวัญ's "Feedback 13/11", Team C slice + the queued TASK-958 fix — @Flash (Team C, via Porter)
**From @Sector, 2026-11-13.**
- **Source:** `REQUEST-porter-to-sober-2026-11-13-gr-round-13-feedback-1311.md`, the table and § Answer, Team C slice. Her words: `project-docs/customer-2026-11-13-line-som-system/khwan-backoffice-feedback-2026-11-13-VERBATIM.md`.
- **Repo:** `SOM-BALANCE-Backoffice-spec/final-ui`. **Mock only, no git.** Words and numbers stay unless an item changes them.
- **Build:** through Porter, as in rounds 10–12. Sober builds once 976 / B / 977 are reviewed → Otto → Tanya.
- **Size:** ≈ 1 d.

## Items (paths under `src/pages/b/`)
1. **#4 Revenue Summary: Category rows open Detail, plus the queued TASK-958 fix.** (`revenue/Summary.tsx`, `revenue/Detail.tsx`)
   - **Category rows:** clickable exactly like Type rows today: the chevron, `tabIndex={0}`, Enter opens, and only when `canOpen("/revenue/lines")`. They open `/revenue/lines?cat=<category>&tab=…&branch=…`. Total and Refund rows are not clickable.
   - **Type rows:** the link becomes `?type=<T>&tab=<today|mtd|ytd>&branch=<applied branch>`.
   - **Detail** reads `type`, `cat`, `tab` and `branch` from the hash query, the same way l.12 reads `type` today:
     - `cat` → the Category filter; when the category belongs to one type, also set that type (`REV_CATS_BY_TYPE`);
     - `tab=today` → Day = `REV_TODAY`;
     - `tab=mtd` → Month of `REV_TODAY`;
     - `tab=ytd` → Custom, 1 Jan of `REV_TODAY`'s year → `REV_TODAY`;
     - `branch` → Branch;
     - a missing param keeps today's default.
     The header «Detail» button (no params) still opens on Day.
   - **Category box:** add the **Refund (Expense)** line under its Total Revenue row, the same row and value as the Type box shows (normal weight, red when negative).
2. **#5 Add Manually: a typed category under Other.** (`revenue/Manual.tsx`)
   - When Type = Other, the Category select gains a last option, «Other (type it)».
   - Picking it shows a required text box, «Category name», with a max of 60 characters, trimmed; empty means an error under the field.
   - The saved line shows the typed name as its category. It is **not** added to the category list or to `Categories.tsx`.
3. **#6 Refund: the badge.** (`revenue/Refund.tsx` ≈ l.228)
   - Before save: `"Cancelled on save"` → **`"Refund"`**.
   - After save: `"Cancelled"` → **`"Refunded"`**, the word l.17 already uses [SA-decided: her `= REFUND` named the pre-save one; I keep the post-save one in step with it].
   - The colour stays red.
4. **#7 Type and Category: remove «SPORTS».** (`revenue/Categories.tsx` l.66, the `REV_SPORTS` block at the top right of COURSE)
   - Remove that block and its now-unused import.
   - Keep the mock data file unchanged.
5. **#8 ECA Payment.** (`revenue/EcaPayment.tsx`)
   - **a. Default status:** a new entry's status defaults to **Pending**, replacing round 11's «Received».
   - **b. Edit:** a saved row gets **Edit**, which opens the same form prefilled. Saving replaces that row.
   - **c. Cancel:** a saved row gets **Cancel**: a confirm with a **required reason**.
     - The row becomes `Cancelled` (a grey badge) with the reason shown, and stays in History.
     - It is **excluded from every total**.
     - A Cancelled row has no Edit or Cancel.
     - Add `"Cancelled"` to `type Status` (l.12).
     - Today's Delete of a Pending row stays.
   - **d. History columns:**
     - «Net received» → **«Net Amount»** (keep its «Proposed: to confirm» tag);
     - drop the **Total Amount** and **Before VAT** columns;
     - add **Students** (the entry's student count; for seeded rows, the student number the mock already carries);
     - even column spacing, numbers right-aligned.
     - Keep O-151-11a (`minWidth`, `nowrap` on Status / Term).
6. **#10 Stock Demo: Edit a History row.** (`stock/Demo.tsx`, History l.206)
   - Each row gets **Edit**: a modal that edits the entry's fields and its **remark**.
   - Saving updates that row and shows a small «edited» badge on it.
   - Stock counts follow the edited entry.
7. **#11 Stock Report: remove «Month».** (`stock/StockReport.tsx` l.74–81)
   - The SegmentedControl keeps Day and Custom.
   - Remove the Month branch, its `MonthPicker` and the now-unused import.
   - The default stays Day.
   - Update the doc line (l.27) to «Day / Custom».
8. **#14 Hide All Report.** (`index.ts` l.38)
   - Remove the `/reports/home` registry entry and its `AllReport` import (l.19). This takes it out of the menu and off the Home card.
   - **Keep** `reports/AllReport.tsx` and `reports/RevenueTab.tsx` (for later).
   - I grepped: nothing else links to `/reports/home`.

## Closed file list
`revenue/{Summary, Detail, Manual, Refund, Categories, EcaPayment}.tsx` · `stock/{Demo, StockReport}.tsx` · `index.ts`. If you need a mock-data field, also `src/mock/b-revenue.ts` / `src/mock/b-stock.ts`, append only. Name it in your notes. Nothing else.

## DoD
- [ ] tsc (the repo's script, as in TASK-958) → exit 0; 0 console errors on each touched page.
- [ ] **#4:** on Today, MTD and YTD, a Type row **and** a Category row each open Detail.
  - Its filter shows that period, branch and type/cat, and the line total equals the row's Revenue. Paste one row per tab per box.
  - The no-param «Detail» opens on Day.
  - An Admin without Detail gets plain rows.
  - The Category box shows the Refund line equal to the Type box's.
- [ ] **#5:** an Other line saved with a typed category shows that name; empty → error; the category list is unchanged.
- [ ] **#6:** the badge reads REFUND before save and REFUNDED after.
- [ ] **#7:** no SPORTS on Type and Category.
- [ ] **#8:**
  - a new entry defaults to Pending;
  - Edit prefills and replaces;
  - Cancel needs a reason, keeps the row and drops it from the total (paste the total before/after);
  - the History headers read exactly: … Net Amount · Students … with no Total Amount or Before VAT.
- [ ] **#10:** an edited History row shows «edited» and the new remark.
- [ ] **#11:** the period control shows only Day and Custom.
- [ ] **#14:** no All Report in the menu or on Home, as CEO and as Admin; `/reports/home` gives the shell's normal not-found / cannot-see screen.
- [ ] Screenshots at 1280 and 375 for Summary, ECA Payment and Demo, in the round folder as in round 12. audit-align → 0 fail.
  - Retire `check-slice-c` «5 ECA form is one field per row» (TASK-958 § Review note) and say so.

## Not in scope
- Real code, and the ledger rows after 14 Nov (#8 Edit/Cancel is medium, #10 is small–medium; Sober's estimates are in the REQUEST).
- Team A/B pages.
- #13–#15 Move course to branch.

## Amendment 1 (Sector, 2026-11-13): All Report #15–17
**Source:** `REQUEST-porter-to-sector-2026-11-13-gr-r13-addendum-all-report.md`.
- These go into the page files, even though #14 hides the menu, so the page is ready when the menu comes back.
- Check them by opening `/reports/home`. Its registry entry is gone after #14, so either:
  - check before you remove the entry; or
  - temporarily mount the page in the dev server.

  Say which you did.
- **Files added to the closed list:** `reports/RevenueTab.tsx` · `reports/ConversionTab.tsx` · `reports/AllReport.tsx` (only if the period bar lives there).

9. **#15 REVENUE tab: a period picker.** `RevenueTab` gets the same filter bar the other All Report tabs use (Month / Branch, read from `AllReport.tsx` or the sibling tab). Its months-across table follows the picked period.
   - Totals still equal the REPORT tab's Revenue for each month (the l.14 rule).
10. **#16 Section titles:** «Revenue By Category» and «Revenue By Type», in her exact casing.
11. **#17 Conversion note** (`ConversionTab.tsx` l.115): the text becomes exactly **«Conversion % = Open Course ÷ 1st Trial (กดที่ตัวเลขเพื่อดูรายละเอียด)»**. Her Thai stays as she wrote it.
- **DoD additions:**
  - one screenshot of the REVENUE tab with the period picked, showing that its total equals REPORT's for that month;
  - the two titles;
  - the note's text pasted from the DOM.

## Implementation Notes
### Flash (Team C) — 2026-11-13: all 8 items + Amendment 1 (#15–17) built in `final-ui`, mock only, nothing committed (no git; final-ui has none)
**Evidence** (scripts in `evidence/TASK-977/`; screenshots `r13-*.png` there; run JSON `r13-run.json`, `r13-allreport-run.json`):
- `tsc --noEmit` **0**. Scratch build of the final tree (`vite build` to the scratchpad, `dist/` untouched).
- `check-977.mjs`: **68 / 68 PASS**, 0 console errors or warnings on the touched pages.
- `check-977-allreport.mjs`: **15 / 15 PASS** (see "How #15–17 were checked").
- `audit-align.mjs` (run from a scratch copy, so Team B's `task-936` results are not rewritten): **59 PASS / 1 FAIL**. The one FAIL is `ceo /salary/daily: an action cell is start`. That page is **Team A's `pages/a/salary/Daily.tsx`, edited today by another session** (mtime 2026-11-13, in the shared tree). Not a file of this task and I did not touch it. All my pages pass. It was 60/0 at round 12.
- Older checks re-run: `check-957` **32/32**, `check-slice-c` **46/46** (on the All Report build), `check-10b-conversion` **9/9** (same), `check-958` 37/38 (the one fail is its 375 px «Pending/Received not clipped» line, found on a build before I fixed the badge; `check-977` has the same test and passes 68/68; `check-958` itself was **not** re-run after the fix, its All Report part needs the temporary entry), `check-alignment` not re-run.

**Items** (paths under `src/pages/b/`):
1. **#4 Summary → Detail.** Category rows are clickable like Type rows (chevron, `tabIndex`, Enter, only if `canOpen("/revenue/lines")`); Total and Refund rows are not. Type link is `?type=T&tab=<today|mtd|ytd>&branch=<b>`; Category link is `?cat=<row>&tab=…&branch=…`. Detail reads `type`, `cat`, `tab`, `branch` (no params = Day, as before; the header «Detail» button opens on Day, All, All: checked). `tab=today` → Day `REV_TODAY`; `mtd` → Month Oct 2026; `ytd` → Custom 1 Jan–`REV_TODAY`. The Category box has the Refund (Expense) line under its Total, same row, same value and same colour as the Type box (checked on all three tabs).
2. **#5 Manual.** Type OTHER only (the type's value is `OTHER`): the Category list ends with «Other (type it)»; picking it shows a required «Category name» (max 60, trimmed, error «Type the category name» under the field). The saved toast shows the typed name. The category list and Categories page are unchanged (checked). The mock has no saved-line list, so «the saved line» is the toast.
3. **#6 Refund.** Pre-save `Refund` (was «Cancelled on save»), post-save `Refunded`; colour unchanged.
4. **#7 Categories.** The `REV_SPORTS` grid and the «Sports» badge are removed with its import; mock data untouched.
5. **#8 ECA Payment.** Default Pending. Edit (Pending and Received rows) prefills the form (school, term, price, students, classes, status, date, mode, ticks, %) and Save replaces the row in place; «Drop changes» leaves an edit. Cancel needs a reason (confirm modal, empty → «Enter the reason»); the row becomes a grey `Cancelled` badge with the reason under it, stays in History, has no buttons, and is out of the revenue total (before 64,800.00 ฿ → after 28,800.00 ฿ when one 36,000 line was cancelled). Pending still has Delete. The Status filter gains Cancelled. History headers: School · Term · Status · **Net Amount** (+ the «Proposed: to confirm» tag) · **Students** · Payment Date · Action; Total Amount and Before VAT are gone; Net Amount and Students are right-aligned; O-151-11a kept (`miw=900`, nowrap Term and Status).
6. **#10 Demo.** Each History line has Edit: item, From, To, Qty, reason. Saving updates the line, shows an «edited» badge, and the stock counts follow (the old line's effect is taken back, the new one applied; a result below 0 is refused). If the line's item was deleted from the table, only the reason can change.
7. **#11 Stock Report.** Period control Day / Custom, default Day. The Month branch and `MonthPicker` import are gone; the doc line reads «Day / Custom»; the «Reset to this month» button now reads «Reset to today».
8. **#14 All Report.** Registry entry and import removed from `index.ts`; `reports/AllReport.tsx` and `RevenueTab.tsx` kept. As CEO and as Admin: no «All Report» in the menu or on Home, and `/reports/home` gives the shell's normal screen (checked).
9. **#15 REVENUE period picker.** The tab has the same Month + Branch bar as REPORT. The table shows **the picked month next to the month before it** (as REPORT shows this month next to the previous one); default Oct 2026 → Sep, Oct. A branch takes that branch's Revenue and Refunds from REPORT's `overviewFor` and splits it over the rows in whole baht, so the Total equals REPORT for that month and branch. A month outside the sample (Dec) reads «No data for this period».
10. **#16** titles: «Revenue By Category», «Revenue By Type».
11. **#17** Conversion note text, copied from the DOM: `Conversion % = Open Course ÷ 1st Trial (กดที่ตัวเลขเพื่อดูรายละเอียด)`.

**How #15–17 were checked (you asked me to say which):** I **temporarily re-added the `/reports/home` registry entry**, built to a scratch folder, then removed it again (`index.ts` has no trace of it: grep and `tsc` 0 after). The shipped tree has #14 as asked. REVENUE Total vs REPORT Revenue: **Oct 1,610,500 ฿ = 1,610,500 ฿ and Nov 1,482,000 ฿ = 1,482,000 ฿** (screenshots `r13-1280-ceo-allreport-revenue-oct.png`, `…-nov.png`); both boxes agree on the Total row; Admin still has no REVENUE tab.

**#4 DoD: one row per tab per box** (Today; Detail line total = the row's Revenue):
- Type COURSE 31,000 ฿ → Detail 31,000 ฿ ✅. Category «ECA» 36,000 ฿ → Detail 36,000 ฿ ✅. Category «Inline Skate» → Detail 9,500 ฿ ✅ (equal to its row).
- **MTD and YTD cannot match by total, by the sample's design:** the mock has lines for 14–16 Oct only (Detail says so under its table), while the MTD/YTD rows are typed blocks (COURSE MTD 401,000 ฿ vs 51,500 ฿ of lines). For those two tabs I checked that Detail opens on the right period (Month / Custom 1 Jan–16 Oct), branch and type or category. **If you want the numbers equal there, the mock needs lines for them: a Team B/Brew data task.**

**FE-decided, please look:**
- **The Category box shows «big headings», not the fine categories** (a sport folds its Private / Duo / 1 HR; a non-COURSE type is one heading named after the type). So `cat=<heading>` could not be only «the Category filter». Detail maps it: a **sport** → type COURSE + a new Category option **«<Sport> · All»** (every plan of that sport, also offered in Detail's Category list for All / COURSE); a **fine category** → that category (+ its type if only one owns it); a **type heading** (ECA, Voucher, Sales, Rent, Other, F&B, 1st Trial) → that type. Needed so a row's Revenue equals its Detail total. Files used: `summaryBoxes` is not touched; the heading → type table is 7 lines inside `Detail.tsx`.
- Summary's Today branch: the Detail link carries `branch=<applied>` on **Today only**; MTD / YTD pass `branch=All`, because those tabs show both branches (Summary's own note says so).
- #7 keeps the COURSE plans (Private / Duo / 1 HR plus anything added to COURSE) listed once, so the COURSE card is not empty and «Add category → COURSE» stays visible.
- #8 ECA: «Drop changes» button added so an edit can be left; mock seed rows gained `students` and `classes` (`EcaRow` in `mock/b-revenue.ts`, from the file's own comment 400 × 18 × 5 and 320 × 18 × 5; the KIS Pending line is 400 × 12 × 5). The «Proposed» tag now never clips (`w="max-content"`); the Status badge too.
- #15: «the picked month and the one before it» is my reading of «period»; a single month or all four are one-line changes if she meant that.
- Words: «Other (type it)», «Category name», «Type the category name», «Enter the reason», «Drop changes», «Reset to today» are the FE's drafts, unreviewed.

**Checks updated in place (declared):** `TASK-956/check-slice-c.mjs` check 3 (the REVENUE tab shows two months now, so it steps the Month picker through all four), `TASK-957/check-957.mjs` checks 4 and 9 (the form opens as Pending; History has no Before VAT column), `TASK-958/check-958.mjs` (Category rows now navigate). The «5 ECA form is one field per row» line was already retired in TASK-958. **Still failing, not mine:** `audit-align` `/salary/daily` (Team A's file). Not re-run: `check-958` after the badge fix (see above).
**Files touched:** `revenue/{Summary,Detail,Manual,Refund,Categories,EcaPayment}.tsx` · `stock/{Demo,StockReport}.tsx` · `index.ts` · `reports/{RevenueTab,ConversionTab}.tsx` · `mock/b-revenue.ts` (the two `EcaRow` fields). `AllReport.tsx` unchanged (the period bar lives in `RevenueTab`).
**Board:** there is no TASK-977 row on `board.md`; I did not add one. **Status: REVIEW** (waiting on Sector).

### Flash (Team C) — 2026-11-13: REWORK done (two ECA History clippings at 1280)
- **Fix 1:** the «Proposed: to confirm» tag now sits under the «Net Amount» text, in that header cell, whole.
- **Fix 2:** the Action buttons wrap inside the cell (max 240 px), so the table fits its card and the last header reads «Action» in full. At 375 the table still scrolls in its own box.
- **Evidence:** `tsc` 0 · `check-977` **72 / 72** (4 new checks: no header clipped, last header «Action», table inside its card, tag whole and under «Net Amount») · screenshot `evidence/TASK-977/r13-1280-ceo-eca-payment.png` re-taken and read. Only `revenue/EcaPayment.tsx` and the check changed.

## Review
**Sector, 2026-11-13: REWORK (small, two clippings only). Everything else is accepted.**
- **My re-run:**
  - `tsc --noEmit` → 0;
  - a scratch `vite build`, then `check-977.mjs` → **68/68**;
  - the shipped tree has no `/reports/home` entry, no SPORTS block and no «Cancelled on save», and Stock Report is `"day" | "custom"`.
- **Screenshots read:** `r13-1280-ceo-summary.png` is right:
  - Category rows have chevrons;
  - the Refund line is under the Category Total, −5,000 ฿ in both boxes;
  - the totals agree at 16 · 82,700 ฿.
- **Fix 1, ECA History at 1280** (`r13-1280-ceo-eca-payment.png`): the «Proposed: to confirm» tag is **clipped to "Proposed: to co…"**, which contradicts the note that it never clips. It also floats in its own slot left of «Net Amount». Put it under the «Net Amount» header text, in that header cell, and show it in full.
- **Fix 2, same table:** the last header reads **«Actior»**, cut at the right edge. Every header must show in full at 1280; at 375 the table scrolls in its own box, as now.
- **Done for the rework** = both clippings gone at 1280 (paste the screenshot), check-977 still 68/68, tsc 0.
- **Your FE-decided items, all accepted [SA-decided]:**
  - the category-heading → Detail mapping, with «<Sport> · All»;
  - `branch` only on Today;
  - the COURSE plans listed once;
  - «Drop changes», and the `students` / `classes` seed fields;
  - #15 shows the picked month next to the one before, the same as REPORT;
  - the draft words.
- **MTD/YTD totals vs Detail:** this is a limit of the sample, not a defect. Detail opens on the right period, branch and type/category, and Detail itself says the lines cover 14–16 Oct only. No data task.
- **audit-align `/salary/daily`:** that's Team A's file, not this TASK. I'm passing it to Porter for Sober.
- **Security review:** none (mock only).
**Sector, 2026-11-13: ✅ DONE (rework re-reviewed).**
- **My re-run:** `tsc --noEmit` → 0; a scratch `vite build`, then `check-977.mjs` → **72/72**, including the 4 new clipping checks.
- **Screenshot read:** `r13-1280-ceo-eca-payment.png` now shows:
  - «Net Amount» with «Proposed: to confirm» whole under it;
  - «Action» in full;
  - the buttons wrapping inside the cell, and the table inside its card.
- **Security review:** none (mock only).
- → Porter, for Sober's round 13 build.

## Amendment 2 (Sector, 2026-11-13): GR r13b, O-151-13c [PM-decided, Porter]
- **Source:** Porter's inbox line; `tests/TEST-151` § GR round 13 Observations, O-151-13c.
- **Change:** the ECA **form's** summary card reads **«Net Amount»**, not «Net received», to match History.
  - In `revenue/EcaPayment.tsx` that is l.478, both the label and its key.
  - Also l.273: the bold check `key === "Net received"` takes the new key, so the line stays bold.
  - Also the two doc lines, l.62–63.
  - The «Proposed: to confirm» tag stays.
- **File:** `revenue/EcaPayment.tsx` only (plus `check-977.mjs`, if a check names the old text). Size XS.
- **DoD:**
  - `grep -n "Net received" src/pages/b/revenue/EcaPayment.tsx` → none;
  - tsc 0;
  - check-977 all pass, plus one new check that the form card reads «Net Amount» in bold;
  - a 1280 screenshot of the form card.

#### Flash (Team C) — 2026-11-13: Amendment 2 built
- **Done:** the form card line, its key, the bold check and the two doc lines in `revenue/EcaPayment.tsx` now read «Net Amount». The «Proposed: to confirm» tag stays.
- **Evidence:** `grep -n "Net received" src/pages/b/revenue/EcaPayment.tsx` → none · `tsc` 0 · `check-977` **74 / 74** (2 new: the card reads «Net Amount», value bold, with the tag; «Net received» appears nowhere on the page) · screenshot `evidence/TASK-977/r13-1280-ceo-eca-form-card.png` read.
- **Checks updated in place (declared, they named the old text):** `TASK-957/check-957.mjs` (re-run 32/32) and `TASK-956/check-slice-c.mjs` (3 lines; not re-run, its All Report part needs the temporary mount).

**Sector, 2026-11-13: Amendment 2 ✅ DONE.**
- **My re-run:**
  - `grep "Net received" EcaPayment.tsx` → none;
  - l.273 / l.478 read «Net Amount», so the bold key follows;
  - tsc 0;
  - a scratch build, then `check-977` → **74/74**, including «Amd 2: the form card reads «Net Amount» (value bold) with the Proposed tag».
- **Security review:** none (mock only).
- → Porter, for r13b.
