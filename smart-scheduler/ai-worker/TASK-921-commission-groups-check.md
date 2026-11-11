# TASK-921 Q1(b): commission amounts per group, checked against the customer's stock sheet (Silver, 2026-11-09)
**Read:** `SOM-BALANCE-Backoffice-spec/data/customer-files/Format-Stock-2026-from-feen-2026-10-30.xlsx`, parsed with exceljs; both tabs, every cell; Balance Stock = 335 rows.
- **No commission column anywhere,** and no cell in either tab contains "comm" / "คอม". Balance Stock's columns: Model Code · Name · Type · Balance (Bravo / Other) · Remark. Every Remark is empty.
- **No commission GROUP either:** the sheet's `Type` is only Skate (193) · F&B (53) · OTHER (82). The last 6 rows are a legend: INLINE PRODUCT · ROYALBABY BIKE · MILLER DIVISION · SAFETY PRODUCT · OTHER · F&B. So a product's commission group is set by hand on the product form (TASK-904 / 907), not imported.
- **Already answered** (REQ-120 R3.1, O12, ขวัญ 2026-10-15): **Miller helmets 40 · Animal Helmet 40 (a separate group, same amount) · Miller pads 40.**
- **Still unknown, so these go to her:** the amount for each remaining group and whether it pays at all:
  - skateboards and other Skate products that aren't Miller / Animal (by name: 68 "miller", 7 "animal", 48 "pad", 6 "helmet", 8 "bag" products in the Skate type);
  - **Skate bag** (the one group STAFF earns on);
  - non-Miller helmets / pads (Safety);
  - Inline skate products;
  - Royal Baby bikes;
  - Shirt / Sock / other Bag (Other);
  - **F&B** (likely no commission; confirm).
  - Plus whether the groups are exactly R3.1's categories, or finer (as Miller vs Animal shows).
