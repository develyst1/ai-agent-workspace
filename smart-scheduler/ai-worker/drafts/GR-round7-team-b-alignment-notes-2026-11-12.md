# GR round 7 (ledger 28): Team B's alignment notes for Sober's rule — Silver, 2026-11-12

**Why:** ขวัญ asked for one row alignment on every back-office page ("บางส่วนชิดซ้าย บางส่วนชิดขวา"). Sober writes the rule; this is Team B's input (Porter 03:29).

## Which pages are Team B's (final-ui; Fanta built them)
- **Salary:**
  - `a/salary/Settings.tsx` (Payment Setting);
  - `Entries.tsx` (Other Income);
  - `MySlip.tsx`;
  - `People.tsx` (Employee);
  - `Person.tsx`;
  - `SalaryReport.tsx`;
  - `Daily.tsx` (Daily Training Report).
- **Stock:** `b/stock/Product.tsx`, `StockIn.tsx`, `Import.tsx`, `StockOut.tsx`.
- ⚠️ **Not ours, though Porter's line names them:**
  - *Payment Detail* = `Slip.tsx` / `SlipView.tsx`, and *Monthly Payment* = `PayRun.tsx`. Both belong to Fern (Team A), per TASK-936 payrun-slip-lock.
  - *Bonus (Conversion)* is not in Fanta's files either.
  - Flash has `StockReport` / `LowStock` / `Demo`.

## What the code does today (grep `ta="right"` / `ta="center"` against `<Table.Th` count)
| Page | Table.Th | right | center |
|---|---|---|---|
| Settings | 18 | 12 | 0 |
| Entries | 5 | 2 | 0 |
| People | 7 | 2 | 0 |
| Person | 2 | 0 | 0 |
| SalaryReport | 14 | **0** | 0 |
| Daily | 6 | 6 | 0 |
| Product | 10 | 5 | 1 |
| Import | 6 | **0** | 0 |
| StockOut | 9 | 4 | 1 |

- The pattern so far is: text left, money and numbers right, actions right. **SalaryReport and Import have no right-aligned column at all**, so their money and count columns sit left, unlike the rest. That is the likely "some left, some right" she saw.
- *Inferred, from the counts only, not from screenshots:* settled by looking at both pages.

## Defaults I'd propose (Sober's rule wins)
1. **A header aligns with its own cells,** always.
2. **Left:** names, groups, dates, text, status.
3. **Right:** money, quantities, counts, km, and the row actions (Edit).
4. **Center:** nothing; drop the 2 `center` cells (Product, StockOut).
5. **Key–value cards** (KvCard): label left, value right. That's how they are today.

Once Sober's file exists, I cut it for Fanta as one TASK-936 part over the 11 pages above.
