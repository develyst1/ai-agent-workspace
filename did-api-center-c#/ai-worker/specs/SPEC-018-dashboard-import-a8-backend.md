# SPEC-018: DASHBOARD_IMPORT_A8 (แจ้งนำเข้าจริง ตาม อ.8) — Center backend, real-import-first (mirror a10)

- Source: REQ-016
- Status: ACTIVE (structure ready; the IMEX-column mapping is gated on DR-15 — do NOT guess a first-use table's columns, per the REQ-014/BUG-014-A lesson)

## Shape

Real-import-first, mirroring **a10** (`GetMoveA10Dashboard`): base = the actual declarations `T_T_INFORM_IMEX_DTL`,
attach the อ.8 license. **All DID_SPF** (no elicensing). New `DashboardImportA8{Controller,Service,Model}` +
`IDashboardImportA8Service`, route base `officer/dashboard-import-a8`, registered in `Program.cs`. Reuse REQ-014's
IMEX join keys + perf lessons (pre-agg, conditional date predicates, no-date completes, snake_case, `ResponseResult`).

## Backbone (real-first — mirror a10; column names to confirm via DR-15)
```
FROM T_T_INFORM_IMEX_DTL D
INNER JOIN T_T_INFORM_IMEX H ON H.ID = D.INFORM_IMEX_ID AND H.INFORM_TYPE = '0' AND H.IS_CANCEL = 0
INNER JOIN T_T_LICENSE   L ON L.LICENSE_NO = D.REF_LICENSE_NO AND L.FORM_ID = 8   -- attach อ.8 (mirror a10's INNER FORM_ID=10; LEFT if declarations can lack a license — verify at capture)
LEFT  JOIN T_M_UNIT      U ON U.ID = D.<QUANTITY_UNIT_ID>
LEFT  JOIN (SELECT COUNTRY_CODE, MAX(COUNTRY_NAME) COUNTRY_NAME FROM T_M_COUNTRY GROUP BY COUNTRY_CODE) CTY
        ON CTY.COUNTRY_CODE = D.<ORIGIN_COUNTRY_CODE>
-- trader: H.<TRADER_ID> → T_M_TRADER (a10 got trader from the INFORM header)
WHERE 1 = 1
  [AND H.<INFORM_DATE> >= :INFORM_START] [AND H.<INFORM_DATE> < :INFORM_END + 1]   -- วันที่แจ้งนำเข้า (primary)
  [AND L.ISSUE_DATE     >= :ISSUE_START]  [AND L.ISSUE_DATE  < :ISSUE_END + 1]      -- วันที่อนุญาต อ.8
ORDER BY H.<INFORM_DATE> DESC, D.<SEQ> ASC
```
**Grain (Q5):** one row per IMEX detail line (ครั้งที่/seq); no de-dup; `IS_CANCEL=0` excludes cancelled. Confirmed.

## Request (`DashboardImportA8SearchRequest`, snake_case)
- **CORRECTION (TASK-028, 2026-07-24):** **ONE** date filter — `inform_date_range` (วันที่แจ้งนำเข้า → `H.INFORM_DATE`,
  the primary/base date), mirroring a10's single `move_date`. (Porter's earlier "two date filters" was a misread of
  "แยกกัน" = the two *dashboards* use different single dates, not one page with two. license-move has only
  `issue_date_range`; a10 only `move_date_range`.) **No `issue_date_range` filter** — อ.8 issue/expiry stay as table
  *columns*. Plus `trader_id`(s), `quantity_unit_id` (required), `product_code`(s) (required). Inform-date optional + no-date-safe.

## Endpoints (mirror a10/dashboard-import)
- `GET officer/dashboard-import-a8/search-filter` → traders + units.
- `GET officer/dashboard-import-a8/search-filter-product?quantity_unit_id=` — reuse REQ-014's cascade (distinct products;
  refine to IMEX-declared products if the capture shows a gap).
- `POST officer/dashboard-import-a8/chart` → `DashboardImportA8ChartsResponse`.
- `POST officer/dashboard-import-a8/table` → `List<DashboardImportA8TableRow>`.

## Charts (4 = 2 dims × 2 measures)
- `by_trader` (measure = SUM qty) · `top5_by_origin_country` (SUM qty)
- `by_trader_baht` (SUM `AMOUNT_BAHT`) · `top5_by_origin_country_baht` (SUM `AMOUNT_BAHT`)
Origin = `ORIGIN_COUNTRY_CODE` (NOT producer). Empty country → "ไม่ระบุ".

## Table (`DashboardImportA8TableRow`, 15 cols, snake_case) — per capture
`license_no`, `issue_date`, `expiry_date`, `trader_name`, `inform_date`, `import_permit_date` (Q1), `product_code`,
`product_name`, `unit`, `permitted_qty` (Q4), `seq` (ครั้งที่), `imported_qty` (Q2), `unit_price_baht`, `amount_baht`,
`origin_country`. Dates single-formatted (REQ-007).

## Q answers (SA — recommended; column names pending DR-15)
- **Q1 (วันที่อนุญาตนำเข้า, col 7):** the import-approval date on the IMEX record (NOT `INFORM_DATE`). Candidate header
  `START_DATE`/`ISSUE_DATE` — **DR-15 to confirm which column**. (INFORM_DATE = วันที่แจ้งนำเข้า, col 6, the filter.)
- **Q2 (จำนวนที่นำเข้าจริง):** `QUANTITY` — mirror REQ-014's locked choice (kept swappable to `ACTUAL_QUANTITY` in one place).
- **Q3 (origin country):** `T_T_INFORM_IMEX_DTL.ORIGIN_COUNTRY_CODE` → `T_M_COUNTRY.COUNTRY_NAME` (pre-agg dedup). DR-15 confirm col.
- **Q4 (value + permitted):** value = `AMOUNT_BAHT` (line total) + `UNIT_PRICE_BAHT`; permitted = `ALLOWED_QUANTITY` **on the
  IMEX line** (page is declaration-centric — the allowed qty as recorded on the declaration). DR-15 confirm both cols.
- **Q5 (grain):** per IMEX detail line (ครั้งที่/seq), no de-dup, `IS_CANCEL=0`. Confirmed.

## DR-15 (via Porter → stakeholder) — the ONE blocker (avoids a REQ-014-style 999 on unverified columns)
> Column list of **`T_T_INFORM_IMEX`** + **`T_T_INFORM_IMEX_DTL`** (as the DID_SPF app user):
> `SELECT table_name, column_name, data_type FROM all_tab_columns WHERE table_name IN ('T_T_INFORM_IMEX','T_T_INFORM_IMEX_DTL') ORDER BY table_name, column_id;`
> Confirm specifically: `INFORM_DATE`, the **import-approval date** (Q1), `ORIGIN_COUNTRY_CODE`, `AMOUNT_BAHT`,
> `UNIT_PRICE_BAHT`, `ALLOWED_QUANTITY`, the seq/ครั้งที่ col (`IMPORT_EXPORT_SEQ`?), `QUANTITY`/`ACTUAL_QUANTITY`,
> `QUANTITY_UNIT_ID`, `TRADER_ID`, `PRODUCT_CODE`, `REF_LICENSE_NO`, `INFORM_IMEX_ID`, `INFORM_TYPE`, `IS_CANCEL`.

## Tasks
- **TASK-026** — scaffold DashboardImportA8 (controller + models + service skeleton + `Program.cs` reg) + search-filter +
  product cascade (reuse REQ-014). Buildable now (structure known). — Jason.
- **TASK-027** — the real-first IMEX backbone query + 4 charts + 15-col table mapping (qty + baht). **Blocked on DR-15.** — Jason.
- Acceptance: live capture (both date filters, qty+baht charts, 15 cols, actual vs permitted, no-date completes).

## Questions
(Jason asks here; Sober answers as `> answer: ...`)
