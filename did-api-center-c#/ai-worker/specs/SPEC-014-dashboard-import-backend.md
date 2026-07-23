# SPEC-014: DASHBOARD_IMPORT (อ.8 import permit) — Center backend, mirror License Move

- Source: REQ-014
- Status: ACTIVE (permitted side ready; actual-import attach gated on DATA REQUEST 10)

## Shape

License-first "plan vs actual", mirroring `DashboardMoveLicense*` (REQ-006), **applying all perf learnings from day
one**: slim base-table joins (no fat views), a **pre-aggregated LEFT JOIN** for every "attach"/lookup (no per-row
correlated subqueries), **conditional date predicate** (no-date must complete), snake_case keys, `ResponseResult`.
Simpler than a10/license: **no** weapon-type-group / region / buyer.

New `DashboardImport{Controller,Service,Model}` + `IDashboardImportService`, registered in `Program.cs`. Route base
`officer/dashboard-import`.

## Backbone (resolved from code — A1/A3)

```
FROM T_T_LICENSE L                         -- อ.8 issued: L.FORM_ID = 8 AND L.LICENSE_STATUS = 40
INNER JOIN T_T_LICENSE_DTL DTL ON DTL.LICENSE_ID = L.ID
LEFT JOIN T_M_UNIT U ON U.ID = DTL.QUANTITY_UNIT_ID
-- ประเทศผู้ผลิต (A3): pre-aggregated to keep 1 row per license line (no qty double-count)
LEFT JOIN (
    SELECT PR.LICENSE_DTL_ID, MAX(PR.PRODUCER_COUNTRY_CODE) AS PRODUCER_COUNTRY_CODE
      FROM T_T_LICENSE_DTL_PRODUCER PR
     GROUP BY PR.LICENSE_DTL_ID
) PRD ON PRD.LICENSE_DTL_ID = DTL.ID
LEFT JOIN (
    SELECT C.COUNTRY_CODE, MAX(C.COUNTRY_NAME) AS COUNTRY_NAME
      FROM T_M_COUNTRY C GROUP BY C.COUNTRY_CODE
) CTY ON CTY.COUNTRY_CODE = PRD.PRODUCER_COUNTRY_CODE
-- จำนวนที่นำเข้าจริง (A2): pre-aggregated INFORM_IMPORT attach — SHAPE PENDING DATA REQUEST 10 (see below)
WHERE L.FORM_ID = 8 AND L.LICENSE_STATUS = 40
  [AND L.ISSUE_DATE >= :DATE_START] [AND L.ISSUE_DATE < :DATE_END + 1]   -- conditional; empty ⇒ all
ORDER BY L.ISSUE_DATE DESC, L.ID DESC, DTL.ITEM_NO ASC
```
**Grain note (A3):** `T_T_LICENSE_DTL_PRODUCER` is 1 line → N producers; the `GROUP BY LICENSE_DTL_ID` + `MAX` keeps
line grain (no row multiplication / no permitted-qty inflation) and yields one producer country per line. Flag at
capture if lines routinely carry multiple producer countries (then stakeholder picks the rule).

## Request (`DashboardImportSearchRequest`, snake_case)
- `issue_date_range` (→ `DateStart`/`DateEnd`), `trader_id`/companies, `quantity_unit_id` (`Unit`, required),
  `product_code`(s) (the วัตถุหรืออาวุธ filter; required). No weapon-category/region/buyer.

## Endpoints (mirror DashboardMoveLicense)
- `GET officer/dashboard-import/search-filter` → ผู้ประกอบการ (traders) + หน่วยนับ (units). (product via cascade)
- `GET officer/dashboard-import/search-filter-product?quantity_unit_id=` (**A5**) — optional unit parent → distinct
  products on อ.8 lines (or product master filtered by unit); `{value=PRODUCT_CODE, label=PRODUCT_NAME}`.
- `POST officer/dashboard-import/chart` → `DashboardImportChartsResponse`.
- `POST officer/dashboard-import/table` → `List<DashboardImportTableRow>`.

## Charts (`DashboardImportChartsResponse`) — measures per capture
1. `top5_by_producer_country` — Top 5 by ประเทศผู้ผลิต (measure = permitted qty).
2. `by_trader` — by ผู้ประกอบการ (measure = permitted qty).
3. `by_trader_license_count` — by ผู้ประกอบการ, measure = **COUNT(DISTINCT license)** ("ฉบับ") — **A4** grain =
   distinct `L.LICENSE_NO`/`L.ID` per trader (count licenses, not lines).

## Table (`DashboardImportTableRow`, snake_case) — capture cols
`license_no` (อ.8), `issue_date`, `expiry_date`, `trader_name`, `product_code`, `product_name`,
`producer_country` (CTY.COUNTRY_NAME), `permitted_qty` (DTL permitted), **`imported_qty`** (actual — DATA REQ 10),
`unit` (U.UNIT_NAME). Dates single formatted (REQ-007). Empty producer country → "ไม่ระบุ".

## Actual-import attach — RESOLVED (DATA REQUEST 10 CLOSED → `V_RPT_IMPORT_PRODUCT`) → TASK-021
`imported_qty = NVL(SUM(V_RPT_IMPORT_PRODUCT.QUANTITY),0)` via a **pre-aggregated LEFT JOIN**:
`LEFT JOIN (SELECT REF_LICENSE_NO, REF_PRODUCT_CODE, SUM(QUANTITY) AS IMPORTED_QTY FROM V_RPT_IMPORT_PRODUCT
GROUP BY REF_LICENSE_NO, REF_PRODUCT_CODE) IIV ON IIV.REF_LICENSE_NO = L.LICENSE_NO AND IIV.REF_PRODUCT_CODE =
DTL.PRODUCT_CODE`. 1 row per (license, product) → no multiplication; report view materialized once (REQ-011/017 lesson),
no correlated subquery. Decisions: **ประเทศผู้ผลิต stays the license producer** (`T_T_LICENSE_DTL_PRODUCER`, not the
customs origin `V_RPT_IMPORT_PRODUCT.COUNTRY_NAME`); **sum ALL declarations** (no `IS_CONFIRM` filter) by default —
both confirmed at capture. Details in TASK-021.

## Tasks
- **TASK-020** — scaffold DashboardImport (controller + models + `Program.cs` reg) + `search-filter` +
  `search-filter-product` cascade + chart/table on the **permitted** side (backbone + producer country + the 3 charts;
  `imported_qty` stubbed = 0). Can start now (backbone resolved). — Jason.
- **TASK-021** — attach `imported_qty` from INFORM_IMPORT (pre-aggregated LEFT JOIN). **Blocked on DATA REQUEST 10.**
- Acceptance: live capture (dated + no-date) — FORM_ID=8 returns อ.8, producer country populated, ฉบับ = distinct
  license count, no-date completes; then imported_qty after DATA REQ 10.

## Questions
(Jason asks here; Sober answers as `> answer: ...`)
