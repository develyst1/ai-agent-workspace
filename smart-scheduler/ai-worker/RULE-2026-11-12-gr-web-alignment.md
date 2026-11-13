# RULE 2026-11-12: one alignment rule for every GR-web back-office page (round 7a)
Sober (SA, Team A), for Porter → Silver (Team B) and Sector (Team C). **[SA-proposed], for Silver to agree or amend through Porter.** Source: ขวัญ, CUSTOMER-ANSWERS 2026-11-12 03:15 (ledger 28): "การจัดวางแถว Balance ขอหมายถึงทุกหน้าของระบบเลย … บางส่วนชิดซ้าย บางส่วนชิดขวา". Applies to `final-ui` (mock only). Each team applies it to **its own pages only**.

## The rule (7 lines)
1. **Tables: text left, numbers right.** Money, quantities, hours, counts and percentages: `ta="right"` on **both** the `Table.Th` and its `Table.Td`s. Everything else (names, types, dates, statuses, reasons) stays left. A header always aligns with its column. **Nothing is centred:** drop `ta="center"` (Silver's note: Product, StockOut).
2. **Totals line up under their column.** A Total / Balance row puts its amount in the same right-aligned cell as the numbers above, never in a free-floating `Text`.
3. **Money looks the same everywhere:** `fmtBaht()` from `@/shell` (`shell/format.ts`: whole baht, `1,234 ฿`; a page that already shows satang keeps its 2-decimal format, but the ` ฿` suffix stays the same), plus `className="tabular-nums"` on the `Table` so digits line up.
4. **Actions sit in the last column, right-aligned** (`ta="right"`, a header reading "Action").
5. **Label/value lists** (summary cards, "Balance" boxes, slip lines): one row per item with the label left and the value right (`Group justify="space-between"`). No mix of stacked and side-by-side in one box.
6. **Forms stack vertically:** one field per row, label above, full width (`Stack`). Two fields share a row only when they are a pair (From / To). Save / Cancel go at the bottom, right-aligned (`Group justify="flex-end"`). This is ขวัญ's round-5 #5 / #14 rule, made general.
7. **Page header:** title left, page actions (Add, Excel, PDF) right. `PageHeader` already does this, so never put action buttons in the body above a table.

**Not in this rule:** column widths per page (let the table size itself; set `w=` only on a numeric column if it wraps) and colours/badges.
**Done =** on every page you own: tsc 0 · build OK · a headless check (or Tanya) that every numeric `th`/`td` computes `text-align: right` and every form is one column · 375px no horizontal overflow · 0 console errors · 2 screenshots.

## Who applies it (by file owner, final-ui `src/pages/`)
- **Team A, Fern** (TASK-952): `a/salary/{PayRun, Slip, SlipView}.tsx` · `a/frontoffice/*` (7 pages, TASK-845) · `a/notify/*` (TASK-845; Fanta edited the words in round 5 #9, but the file is Team A's).
- **Team B, Fanta** (Silver, per `drafts/GR-round7-team-b-alignment-notes-2026-11-12.md`): `a/salary/{Settings, Entries, MySlip, People, Person, SalaryReport, Daily}.tsx` · `b/stock/{Product, StockIn, Import, StockOut}.tsx`. Silver's survey found the clearest offenders here: **SalaryReport and Import have no right-aligned column at all.**
- **Team C, Flash** (Sector; Porter, please route): `b/stock/{StockReport, LowStock, Demo}.tsx` · `b/revenue/*` · `b/reports/*` · `proposed/*` (incl. Bonus (Conversion)). Not in Porter's brief, but ขวัญ said "every page".

**Folded in from Silver (2026-11-12):** his 5 defaults equal rules 1, 4 and 5 here, plus "nothing centred" (now in rule 1). No conflict left.
- Shared `a/salary/parts.tsx`: whoever needs a change there asks through Porter first.
