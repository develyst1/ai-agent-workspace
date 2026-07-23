# DATA REQUEST 10 — actual-import (customs) source for dashboard-import (REQ-014), 2026-07-20

## Round 1 — candidate tables (stakeholder ran the inventory)
Tables with import + (qty/ref_license) columns:
```
INF_T_LICENSE_IMPORT     ← "INF" = แจ้ง (inform) import vs a license — TOP candidate for actual qty ⭐
T_T_IMPORT_OS            ← "OS" = outstanding/balance (imported-so-far?)
T_T_REQUEST_IMPORT       ← the application (not actual) — checked, not it
V_REQUEST_DTL_IMPORT     ← request detail view
RPT_LICENSE_IMPORT / RPT_REQUEST_IMPORT / RPT_SUM_LICENSE_IMPORT   ← report tables
V_RPT_IMPORT_OS / V_RPT_IMPORT_PRODUCT / V_RPT_SUM_IMPORT          ← report views (V_RPT_IMPORT_PRODUCT may be a ready denormalized read model)
```
No `T_T_INFORM_IMPORT` (unlike move's `T_T_INFORM_MOVE`) — the "inform import" appears named `INF_T_LICENSE_IMPORT`.

## Round 2 — asked the stakeholder for columns of the top 3
`INF_T_LICENSE_IMPORT`, `T_T_IMPORT_OS`, `V_RPT_IMPORT_PRODUCT` — looking for: **imported quantity**,
`QUANTITY_UNIT_ID`, `PRODUCT_CODE`, **license linkage** (`REF_LICENSE_NO` / license id), **import/declare date**.

## @Sober — pick the actual-qty source from the columns, then design TASK-021's pre-aggregated LEFT-JOIN
attach (mirror the a10 `move_qty` = `NVL(SUM(...),0)` by license-no + product). Update SPEC-014.

---

## Round 2 result (2026-07-20) → ACTUAL-IMPORT SOURCE = `V_RPT_IMPORT_PRODUCT` ✅ (DATA REQUEST 10 CLOSED)

Column read of the 3 candidates:
- **`INF_T_LICENSE_IMPORT`** = the **license/permit** side (LICENSE_NO, ISSUE/EXPIRY_DATE, LICENSE_STATUS,
  PRODUCT_CODE/NAME, `QUANTITY_1`/`QUANTITY_2` = permitted, IMPORT_TYPE + IMPORT_BY_BOAT/PLANE/CAR). A ready
  denormalized อ.8-license-line view — **no "actual imported" column.** (Possible alternative backbone — SA judgment.)
- **`T_T_IMPORT_OS`** = outstanding balance (`OS_QUANTITY`/`OS_WEIGHT`/`OS_PRICE` by `LICENSE_NO`+declaration). Indirect.
- ⭐ **`V_RPT_IMPORT_PRODUCT`** = **actual import declarations per product** — has everything:
  - **`QUANTITY`** = actual imported qty · `REF_QUANTITY` = permitted (from license)
  - **`REF_LICENSE_NO`** + **`REF_PRODUCT_CODE`** = link to อ.8 license + product
  - **`COUNTRY_NAME`** / `ORIGIN_COUNTRY_CODE` = origin country · `DECLARATION_NO` = customs declaration
  - `EFFECTIVE_DATE` / `CONFIRM_DATE` = import date · `IS_CONFIRM` · TRADER_ID/NAME · LICENSE_ID/ITEM_NO

### @Sober — wire TASK-021 (actual attach), like a10's move_qty
`imported_qty = NVL(SUM(V_RPT_IMPORT_PRODUCT.QUANTITY),0)` via a **pre-aggregated LEFT JOIN**:
`(SELECT REF_LICENSE_NO, REF_PRODUCT_CODE, SUM(QUANTITY) AS IMPORTED_QTY FROM V_RPT_IMPORT_PRODUCT GROUP BY …)`
ON `REF_LICENSE_NO = L.LICENSE_NO AND REF_PRODUCT_CODE = DTL.PRODUCT_CODE`. Notes:
- ⚠ `V_RPT_IMPORT_PRODUCT` is a **report VIEW** — apply the REQ-011/012 lesson (pre-aggregate; don't join per-row;
  watch it's not a fat view causing a no-date slowdown — materialize if needed).
- **ประเทศผู้ผลิต decision:** license-declared producer (`T_T_LICENSE_DTL_PRODUCER`→`T_M_COUNTRY`, per SPEC-014)
  vs the actual-import origin (`V_RPT_IMPORT_PRODUCT.COUNTRY_NAME`). Pick per the page's intent; confirm at capture.
- Possibly consider `IS_CONFIRM`/`CONFIRM_DATE` (count only confirmed declarations?) — SA judgment.
