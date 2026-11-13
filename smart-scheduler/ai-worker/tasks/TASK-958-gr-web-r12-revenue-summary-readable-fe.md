# TASK-958 — FE: GR web round 12 — REVENUE → Summary easy to read (ขวัญ 22:59) + O-151-11a — @Flash (Team C, via Porter)

**From @Sober, 2026-11-12.** Source: `REQUEST-porter-to-sober-2026-11-12-gr-round-12-revenue-summary-readable.md`. Her words (CUSTOMER-ANSWERS 2026-11-12 22:59): *"…ต้อนนี้มองซ้ายสุดทีแล้วต้องมองขวาสุดทีค่อนข้างดูยากเลยค่า"*. **The problem:** each table stretches across the full page, so Type sits far left and Unit / Revenue / View sit far right. The eye travels the whole width on every row.
Repo `SOM-BALANCE-Backoffice-spec/final-ui`, mock only, no git. Words, numbers and behaviour stay; only the layout and table styling change.

## The design [SA-decided]
1. **Summary, the two boxes side by side** (`b/revenue/Summary.tsx`; one layout, so the Today, MTD and YTD tabs all follow):
   - From `lg` up, the **by Type** card and the **by Category** card sit side by side in a `Grid` (Type 5 / Category 7). Each table is only as wide as its card, so a label is never far from its number.
   - Below `lg` they stack, and each card gets **`maw={720}`**, so on a medium screen the table still doesn't stretch.
   - The caption and branch badge stay on the Type card; the Category card keeps its own title.
2. **Rows read as rows** (both Summary tables):
   - `striped` + `highlightOnHover`.
   - **The Total Revenue row stands out:** bold, a 2 px top border and a light tint (`var(--mantine-color-default-hover)`, so it works in dark mode too). Refund (Expense) stays under it, normal weight, red when negative.
3. **«View» goes; the whole Type row opens Detail** (`/revenue/lines?type=…`, the same target as today's View button). **Category rows stay plain:** they have no View today, and Detail reads only `?type`, so a new filter is out of scope.
   - The row gets `cursor: pointer`, and a small `ChevronRight` (16 px, dimmed) sits in a narrow last column right after Revenue, as the affordance.
   - It is keyboard-reachable: the row has `tabIndex={0}` and opens on Enter.
   - It is drawn and clickable **only when `canOpen("/revenue/lines")`** (round-9 rule). Otherwise the row is plain, with no chevron and no pointer.
   - Total and Refund rows are not clickable.
4. **The same row style on the other revenue tables**, for consistency. Width and layout stay as they are there:
   - `b/revenue/Detail.tsx`: 8 columns that fill the width by nature → `striped` + `highlightOnHover` only.
   - `b/reports/RevenueTab.tsx` (All Report REVENUE, months across): `striped` + the same Total row style.
5. **O-151-11a (ride-along)** in `b/revenue/EcaPayment.tsx` history: give the table a `minWidth` inside its `Table.ScrollContainer`, and `nowrap` on the Status and Term cells. At 375 px the badges then read in full («Pending», «Received») and Term stays on one line. The table scrolls in its own box, and the page doesn't overflow.

**Files (closed list):** `b/revenue/Summary.tsx` · `b/revenue/Detail.tsx` · `b/reports/RevenueTab.tsx` · `b/revenue/EcaPayment.tsx`. Nothing else.

## Done =
- tsc 5.6.3 → 0 · build OK · no `ta="center"` · English only.
- Headless as CEO, on all three tabs (Today, MTD, YTD):
  - At 1280 the two Summary cards are side by side. At 1024 and 375 they stack, with `maw` 720.
  - Each Summary table's numbers equal round 11's (paste one tab's rows before/after).
  - A Type row click opens Detail filtered to that Type, and Enter on a focused Type row does the same.
  - Category rows don't navigate and show no chevron.
  - Total and Refund rows don't navigate.
- As Admin (Kung) with Summary ticked but not Detail: no chevron, a click does nothing, and there is no console error.
- ECA at 375: «Pending» / «Received» in full, «Term 3» on one line, no page overflow.
- Run `SOM-BALANCE-Backoffice-spec/tests/evidence/task-936/audit-align.mjs <dist/index.html>` (still 60/0), plus your round-9 and round-10 checks. Update any that clicked «View».
- Screenshots: Summary at 1280 (side by side) and at 375; ECA history at 375.

**Sober reviews → round-12 build → Otto → Tanya via Porter.**

## Questions
_(—)_

## Implementation Notes
### Flash (Team C) — 2026-11-12
Files touched (the closed list, nothing else): `b/revenue/Summary.tsx` · `b/revenue/Detail.tsx` · `b/reports/RevenueTab.tsx` · `b/revenue/EcaPayment.tsx`. tsc 5.6.3 → 0 · build OK · no `ta="center"` · English only (the only non-ASCII character left is the baht sign).
- **Summary layout:** Type card and Category card in a `Grid`, Type 5 / Category 7 from `lg` (1200 px), stacked below with `maw={720}` on each card. One layout, so Today / MTD / YTD all follow. Caption + branch badge stay on the Type card.
- **Rows:** both Summary tables `striped` + `highlightOnHover`. The Total Revenue (and the Category «Total») row: bold, 2 px top border, tint `var(--mantine-color-default-hover)`. Refund (Expense) stays under it, normal weight, red when negative.
- **«View» is gone.** The whole Type row opens `/revenue/lines?type=…` (same target as before): pointer cursor, `tabIndex 0`, Enter opens, a 16 px dimmed `ChevronRight` in a narrow last column. Drawn and clickable **only when `canOpen("/revenue/lines")`**; otherwise a plain row. Category, Total and Refund rows do nothing.
- **Detail** and **All Report REVENUE:** `striped` (+ hover on Detail). RevenueTab also gets the same Total row style (each file holds its own 2-line constant, because the file list is closed).
- **O-151-11a (ECA history):** table `miw` and scroll container 900, `nowrap` on the Term and Status cells. At 375 «Pending» / «Received» read in full, Term stays on one line, the table scrolls in its own box, the page does not overflow.
- **Evidence** (`evidence/TASK-958/`): `check-958.mjs` → `r12-run.json`, **38 PASS / 0 FAIL**, 0 console errors, no network requests. Before/after: the by-Type and by-Category rows on Today, MTD and YTD are identical to the round-11 build (built from the same tree minus this change; first Today row pasted at the end of `r12-run.json`). Also covers: 1280 side by side; 1024 and 375 stacked, each at most 720 wide, no overflow; Type click and Enter on all three tabs; Category / Total / Refund do not navigate and have no chevron; Detail and REVENUE striped; Admin (Kung) with Summary ticked but not Detail: no chevron, no pointer, click and Enter do nothing, no console error. Screenshots: `r12-1280-ceo-summary-side-by-side.png`, `r12-375-ceo-summary.png`, `r12-375-ceo-eca-history.png`, `r12-1280-ceo-allreport-revenue.png`.
- **`audit-align.mjs` on the round-12 build: 60 PASS / 0 FAIL** (it rewrote `result-align.txt` and the shots in Team B's `task-936` folder, with the same result).
- **Earlier checks, re-run on the new build** (from a scratch copy, so no old evidence was overwritten): TASK-956 `check-10b-conversion` 9/9, TASK-957 `check-957` 32/32, TASK-956 `check-slice-c` 45/46. None of them clicked «View». Two caveats:
  - `check-slice-c` fails «5 ECA form is one field per row»: that is the round-11 rule-6 exception for the ECA form (TASK-957), not this task. The check needs that line retired.
  - TASK-953 `check-alignment.mjs` times out waiting for an «Edit» button on some page. It fails the same way on the round-11 build, so it is not from this task, and I did not touch it. `check-hide-links` (TASK-955) only dumps buttons; Summary's list still has no «View».
- **Regression chore (Sector's inbox line, 2026-11-12), checks only, no product code:**
  - `evidence/TASK-956/check-slice-c.mjs`: the «5 ECA form is one field per row» line is retired and replaced by «compact 3-column grid, at most 3 fields per row» (the TASK-957 exception). Re-run on the round-12 build: **46 PASS / 0 FAIL**.
  - `evidence/TASK-953/check-alignment.mjs`: the «Edit» lookup on `proposed/payment-setting` is guarded. The page has no «Edit» button on the current build (PaymentSettingEdit was removed), so the edit view is skipped with a note on stderr instead of timing out. Re-run: exit 0, 23 pages, 18 tables, 383 numeric cells, **0 bad cells**, no 375 px scroll, no console or network problems.
  - Both were re-run from a scratch copy, so no earlier screenshot was overwritten.
- Not changed: every number, label and the filters; Detail's columns and width; the Category rows' behaviour (no new filter, since Detail reads only `?type`).

## Review
- **Sober, 2026-11-12: ✅ DONE.**
  - Re-run: tsc 5.6.3 → 0 · 0 `ta="center"` · `MENU_ACCESS_HELD = false`.
  - `r12-1280-ceo-summary-side-by-side.png`: Type (5) and Category (7) cards side by side. Each label sits close to its Unit / Revenue; zebra rows; Total rows bold with a top border; a chevron on Type rows only; no far-right «View». Totals agree (16 · 82,700 ฿ in both cards).
  - `r12-375-ceo-eca-history.png`: «Pending» / «Received» in full, «Term 3» on one line, the table scrolls in its own box (O-151-11a fixed).
  - Flash's 38/0 covers before = after numbers on all three tabs, the Admin-without-Detail case and the 1024/375 stacking. audit-align 60/0.
  - **Two old checks, not from this TASK (noted, not blocking):** `check-slice-c` «5 ECA form is one field per row» now fails by design (TASK-957's rule-6 exception), so retire that line next time Flash touches the script. TASK-953 `check-alignment.mjs` times out the same way on the round-11 build, so the script is stale, not the page.
  - Security review: none (mock only).
- **Round 12 built:** md5 `21731a389bf1bd92b5d62ee2d0fa347e`. → Otto.
- **Round 12: Tanya PASS (TEST-151 § GR round 12), via Porter 2026-11-12.**
- **Queued for the next GR round [PM-decided, not blocking]: Detail opens on the tab's period.** Today a Type row on MTD/YTD opens Detail on Day. Fix (Flash; `Summary.tsx` + `Detail.tsx`):
  - Summary's row link carries the tab and branch: `/revenue/lines?type=<T>&tab=<today|mtd|ytd>&branch=<applied branch>`.
  - Detail's initial filters read them (`Detail.tsx` l.24 `start`), with today's defaults when a value is absent:
    - `today` → Day = `REV_TODAY`;
    - `mtd` → Month = the month of `REV_TODAY`;
    - `ytd` → Custom, From = 1 Jan of `REV_TODAY`'s year, To = `REV_TODAY`;
    - `branch` → Branch.
  - Done = on each tab, the Type row opens Detail whose filter shows that period and branch, and whose line total equals the row's Revenue (paste one row per tab) · the header «Detail» button (no params) still opens on Day · tsc 0 · 0 console errors. It goes with the next round's TASK; this file only holds it.
