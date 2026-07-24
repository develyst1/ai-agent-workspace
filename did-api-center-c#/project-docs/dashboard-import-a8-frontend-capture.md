# Frontend capture — dashboard-import-a8 (การ**แจ้งนำเข้าจริง** ตาม อ.8), 2026-07-24

Captured by Porter from the live test frontend (read-only). For REQ-016.

- URL: `https://test-pamf-did.mod.go.th/officer/dashboard-import-a8`
- Page title: **"ยอดการแจ้งนำเข้ามาในราชอาณาจักรซึ่งวัตถุหรืออาวุธ ตามแบบ อ.8"** (the actual **แจ้งนำเข้า**
  declarations, not the permit).
- **Shape = REAL-IMPORT-FIRST (mirror of a10):** base = the actual import declarations
  (`T_T_INFORM_IMEX(_DTL)`, INFORM_TYPE='0'), then attach the referenced อ.8 license (T_T_LICENSE FORM_ID=8).
  This is the counterpart of the delivered `dashboard-import` (which was permit-first, like license-move).
  Stakeholder confirmed: "license move = approve LEFT JOIN real; a10 = real LEFT JOIN approve; import-a8 = a10-style."

## Filters — ONE date range only (CORRECTED 2026-07-24)
⚠ **Porter misread earlier.** Verified in code: **license-move has ONE date range (`issue_date_range`), a10 has ONE
(`move_date_range`)** — each dashboard filters on its OWN single date. The stakeholder's "issue date และ move date
แยกกัน / อันนี้ก็เหมือนกัน" meant *the two dashboards use different single dates*, NOT that one page has two. Then
stakeholder: "ทำไมทำมาสอง date range วะ" → drop the second.
1. **วันที่แจ้งนำเข้า** — `inform_date_range` → `T_T_INFORM_IMEX.INFORM_DATE` (the ONE base date, mirrors a10's
   single `move_date_range`). **This is the only date filter.**
2. ผู้ประกอบการ (trader).
3. **หน่วยนับ*** (unit — required).
4. **วัตถุหรืออาวุธ*** (product — required).
~~วันที่อนุญาต อ.8 / issue_date_range~~ **REMOVED** (was an over-build from the misread; issue/expiry อ.8 remain as
table COLUMNS, just not a filter).

## Charts — FOUR (2 dimensions × 2 measures: qty + มูลค่าบาท) ← new "value/baht" measure
1. **แยกตามผู้ประกอบการ** (by trader) — measure = qty.
2. **Top 5 แยกตามประเทศแหล่งที่มา(ต้นทาง)** (top5 by **origin/source country** — `ORIGIN_COUNTRY_CODE`, NOT
   producer country) — measure = qty.
3. **ยอดมูลค่า… แยกตามผู้ประกอบการ (บาท)** — measure = **value in Baht** (`AMOUNT_BAHT`).
4. **ยอดมูลค่า… Top 5 แยกตามประเทศแหล่งที่มา (บาท)** — measure = value in Baht.

## Table — "รายการยอดการแจ้งนำเข้า…" (+ Export Excel) — 15 cols (richer than dashboard-import)
1. # · 2. **เลขที่หนังสือ อ.8** · 3. วันที่อนุญาต อ.8 (issue) · 4. วันที่หมดอายุ อ.8 (expiry) · 5. ผู้ประกอบการ
6. **วันที่แจ้งนำเข้า** (INFORM_DATE) · 7. **วันที่อนุญาตนำเข้า** (?? header START_DATE/ISSUE_DATE — SA to confirm)
8. รหัสวัตถุหรืออาวุธ (PRODUCT_CODE) · 9. วัตถุหรืออาวุธ (PRODUCT_NAME) · 10. หน่วยนับ
11. **จำนวนที่ได้รับอนุญาต** (permitted = `ALLOWED_QUANTITY`) · 12. **ครั้งที่** (seq = `IMPORT_EXPORT_SEQ`)
13. **จำนวนที่นำเข้าจริง** (actual = `QUANTITY`/`ACTUAL_QUANTITY` — SA/stakeholder to lock, as in REQ-014)
14. **ราคาต่อหน่วยวัตถุที่นำเข้า** (`UNIT_PRICE_BAHT`) · 15. **รวมมูลค่า(บาท)** (`AMOUNT_BAHT`)
16. **ประเทศแหล่งที่มา(ต้นทาง)** (origin = `ORIGIN_COUNTRY_CODE` → T_M_COUNTRY)

## Deltas vs the delivered `dashboard-import` (what's genuinely NEW)
- Direction flipped: **base = real import** (`T_T_INFORM_IMEX_DTL`), one row per import-declaration line (per ครั้งที่).
- **Two date filters** (issue อ.8 + inform date) instead of one.
- **Value/มูลค่า(บาท) measure** — 4 charts instead of 3; table has unit-price + total-value cols.
- **ประเทศแหล่งที่มา(ต้นทาง)** (ORIGIN country) instead of ประเทศผู้ผลิต (PRODUCER country).
- New cols: ครั้งที่ (seq), วันที่แจ้งนำเข้า, วันที่อนุญาตนำเข้า, ราคาต่อหน่วย, รวมมูลค่า.
- Reuse from REQ-014: the IMEX join keys (`D.REF_LICENSE_NO=L.LICENSE_NO`, `INFORM_TYPE='0'`, `IS_CANCEL=0`),
  FORM_ID=8, unit/product resolution, snake_case + ResponseResult + perf lessons.

## ✅ DR-15 ALREADY ANSWERED by DR-13 (Porter, 2026-07-24) — do NOT re-ask the stakeholder
The full IMEX column list was already captured in DR-13 (see `data-req-10-...` doc). No first-use guessing needed —
every field below maps to a confirmed column. **Field → column mapping for `GetImportA8Dashboard` (all DID_SPF):**

Base: `T_T_INFORM_IMEX_DTL D` INNER JOIN `T_T_INFORM_IMEX H ON H.ID=D.INFORM_IMEX_ID AND H.INFORM_TYPE='0' AND H.IS_CANCEL=0`
INNER/LEFT JOIN `T_T_LICENSE L ON L.LICENSE_NO=D.REF_LICENSE_NO AND L.FORM_ID=8` (for อ.8 header) — a10-shape.
- เลขที่ อ.8 = `L.LICENSE_NO` · วันที่อนุญาต อ.8 = `L.ISSUE_DATE` · วันที่หมดอายุ อ.8 = `L.EXPIRY_DATE`
- ผู้ประกอบการ = `H.TRADER_ID` → `T_M_TRADER` (or `L.TRADER_NAME`)
- **วันที่แจ้งนำเข้า = `H.INFORM_DATE`** (base/primary date filter)
- **วันที่อนุญาตนำเข้า = `H.START_DATE`** (import-window start; candidate — confirm at capture; alt `H.ISSUE_DATE`)
- รหัส/ชื่อ วัตถุ = `D.PRODUCT_CODE` / `D.PRODUCT_NAME` · หน่วยนับ = `D.QUANTITY_UNIT_ID` → `T_M_UNIT`
- จำนวนที่ได้รับอนุญาต = `D.ALLOWED_QUANTITY` · **ครั้งที่ = `D.IMPORT_EXPORT_SEQ`**
- **จำนวนที่นำเข้าจริง = `D.QUANTITY`** (mirror REQ-014's locked choice; swappable to ACTUAL_QUANTITY)
- ราคาต่อหน่วย = `D.UNIT_PRICE_BAHT` · รวมมูลค่า(บาท) = `D.AMOUNT_BAHT`
- **ประเทศแหล่งที่มา(ต้นทาง) = `D.ORIGIN_COUNTRY_CODE`** → `T_M_COUNTRY.COUNTRY_NAME`
- Charts: qty = SUM(`D.QUANTITY`); baht = SUM(`D.AMOUNT_BAHT`); dims = trader / `D.ORIGIN_COUNTRY_CODE`.
- Filters: `H.INFORM_DATE` between (primary) + `L.ISSUE_DATE` between (secondary); both optional/no-date OK.

⇒ **TASK-027 is UNBLOCKED** — no DR-15 needed. Only "วันที่อนุญาตนำเข้า" (H.START_DATE vs H.ISSUE_DATE) stays a
capture-time confirmation (not a build blocker; pick START_DATE, verify with the live row).

## SA questions to resolve (Sober, in REQ-016)
- Q1: "วันที่อนุญาตนำเข้า" (col 7) source — header `START_DATE`? `ISSUE_DATE`? vs "วันที่แจ้งนำเข้า"=INFORM_DATE.
- Q2: "จำนวนที่นำเข้าจริง" = `QUANTITY` or `ACTUAL_QUANTITY` (mirror REQ-014's final = QUANTITY? confirm).
- Q3: origin country = `T_T_INFORM_IMEX_DTL.ORIGIN_COUNTRY_CODE`? (vs header DESTINATION/CONSIGNMENT) → T_M_COUNTRY.
- Q4: value = `AMOUNT_BAHT` (line total) + `UNIT_PRICE_BAHT`; permitted = `ALLOWED_QUANTITY` (on the IMEX line) vs
  the license DTL QUANTITY — pick the one the page means.
- Q5: dashboard base grain = per IMEX detail line (ครั้งที่/seq) — confirm no de-dup needed; cancelled excluded (IS_CANCEL=0).
