# Does ฟีน's stock Excel fit the Stock import (R3)? · Sober (SA, Team A), 2026-11-03
**For:** @Porter (facts only; you write the customer wording).
**The file:** `som-balance-backoffice-spec/data/customer-files/Format-Stock-2026-from-feen-2026-10-30.xlsx`, md5 `c7d233d4a9932052f86c6e1bed20f6dd`.
- **How I read it:** unzipped a copy in my scratchpad and parsed both sheets' XML with a script (no edits to the file). Every count below is a script count.
- **Against:** REQ-120 R3.1 (products: Model code · Name · category · commission group · price · picture · note), R3.3 (sale-stock locations), R3.4 (import matches by Model code), R3.6 (Demo sites STA · ABC · RIS · WA (Abbey) · KIS · Bravo), R3.7 (Low Stock thresholds by type).

## 1. Fit
**Yes for the first Stock slice, as it is. Two columns are missing for selling.**

**Sheet "Balance Stock" (sale stock): clean.**
- 327 products, **every Model code unique** (0 duplicates, 0 duplicate names), every balance a whole number, 0 negatives, 0 formulas.
- That's exactly what the import keys on (R3.4).
- **Missing for R3.1:**
  - **price** and **commission group** (0 rows have either);
  - (picture and note are optional).

**Sheet "Demo": usable.**
- 155 items in 22 categories, a balance per site;
- Bravo 1,144 items · STA 66 · RIS 4 · Abbey 20 · ABC 0.

**Decided by me, no question needed** `[SA-decided]`:
1. **The "Other" balance column is empty on all 327 rows** ⇒ sale stock is at **Bravo only** today (R3.3: "one location today"). We create Bravo; another sale location can be added later.
2. **Rows 330–335 are not products:** they're a list of 6 category names (INLINE PRODUCT · ROYALBABY BIKE · MILLER DIVISION · SAFETY PRODUCT · OTHER · F&B). The import skips them; they seed R3.1's categories.
3. **Demo column E has no site name and all 57 of its cells are 0** ⇒ ignored. No stock is lost. KIS (in R3.6's list, not in the sheet) is created empty.
4. **"Abbey" = R3.6's WA (Abbey).**
5. **Demo items have no Model codes:** that's fine. Demo is a separate list (R3.6), keyed by category + name, and the system gives each an ID. No codes are needed from them.
6. **Her remark "รวมกัน แต่ใส่ DCL นำหน้า"** (Demo rows 55 and 57) is an instruction to us: the Decathlon items go into one list with names prefixed "DCL". We do it at import.

## 2. Questions for the customer (the fewest; numbered)
1. **Price + commission group per product.** Please add 2 columns to "Balance Stock": **ราคาขาย** and **กลุ่มค่าคอม** (the group that decides the commission).
   - Not needed to load the stock. Needed **before STOCK OUT (selling)**, ≈ week 3 of the Stock block.
2. **Category for the "Skate" rows.** The products' Type says **Skate** (193 rows), F&B (52) or OTHER (82). "Skate" is **not** one of her 6 categories. Our proposal, by code prefix (she corrects only the wrong lines):

   | code prefix (rows) | e.g. | → category (our proposal) |
   |---|---|---|
   | M / ML (72) | Miller/ BABY SKATE, Miller/ PAD | MILLER DIVISION |
   | IL (21) | C7 / Impala INLINE SKATE | INLINE PRODUCT |
   | C (44) · D (17) · JMK (13) | Chinese / Decathlon pads + helmets, EDGE GUARD | SAFETY PRODUCT |
   | IP · S (4) · P · T (6) · SK (4) · SOM socks (13) | skate bags, skateboards, skimboards, socks | OTHER |
   | FB (52) | drinks, snacks | F&B |
   | SOM shirts etc. (80) | SOM T-Shirt … | OTHER |

   - Also: 1 row ("SKIM BAG") has no Type.
   - This matters for **Low Stock**, whose thresholds are per type (R3.7: F&B 10 · Safety 1 · Miller 5 · Sock 1 · Shirt 1). Note "Sock" and "Shirt" are threshold groups but **not** among her 6 categories. Her answer to this question settles both.
   - Needed before Low Stock, not before the first slice.
3. **Demo rows 9 and 10** are both "สนับ / ชุด -Red+Black" (3 each), and row 9's own remark says *"ใส่สีแค่ Red/ Blue"*. Is one of them Red+Blue?

**Not questions, but data to finish before go-live** (her own notes in the sheet; pass them back, don't ask):
- "**รอครูนับ**" (rows 158 and 161, Balance Play / Game Play): still to be counted.
- "**อันไหนพัง??**" (rows 85–86, Space Shark 14"/16" borrow): which is broken. A broken item is written off with a reason (R3.6).
- "**นี้คือไม่นับรวม??กับ SM/ ML??**" (row 15, หมวก Miller): whether it's counted together with the SM / ML sizes.
- **The balances are a 10-30 snapshot.** The real opening balance is a count **on the go-live day**: they send the same file again then, and we import it (the import updates by Model code; R3.4).

## 3. Is it enough to START the Stock block?
**Yes.** With the file as it is we can build and load the first slice (Q4's "≈ 4 weeks"):
- the 327-product catalogue;
- Bravo's opening balances;
- the Demo list at 5 sites.
- **Question 1** (price + commission group) is needed by ≈ week 3, for STOCK OUT;
- **question 2** (categories) before Low Stock.
- So the "≈ 4 weeks" holds if their answers to 1–2 arrive within about 2 weeks of GO.
- The live figures come from the go-live-day count, in this same format.
