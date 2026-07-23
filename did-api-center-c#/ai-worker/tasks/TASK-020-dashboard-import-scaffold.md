# TASK-020: Scaffold DASHBOARD_IMPORT (อ.8) — controller/models/service + search-filter + product cascade + permitted-side chart/table

- Source: SPEC-014 (REQ-014)
- Status: DONE
- Assignee: Jason (BE)
- Depends on: none (backbone resolved; `imported_qty` stubbed until TASK-021)

## Review — Verdict: DONE — Sober (SA), 2026-07-21
Read the SQL + service + grepped the scaffold. Correct, learnings applied from day one:
- **`GetImportDashboard`** (`TTLicenseDtlRepository` L282-328): `T_T_LICENSE` (FORM_ID=8, LICENSE_STATUS=40) ×
  `T_T_LICENSE_DTL` × `T_M_UNIT`; producer country **pre-aggregated** (`MAX(PRODUCER_COUNTRY_CODE) GROUP BY
  LICENSE_DTL_ID` → `PRD ON PRD.LICENSE_DTL_ID = DTL.ID`) + `T_M_COUNTRY` resolve; **conditional ISSUE_DATE** predicate
  (empty ⇒ all); `0 AS ImportedQty` stub; ORDER BY. **No correlated subqueries** → no-date completes. Grain kept 1:1.
- **Charts** (`DashboardImportService`): `by_trader_license_count` = `g.Select(x => x.DocNo).Distinct().Count()` per
  trader = **distinct-license "ฉบับ"** (A4) ✅; `top5_by_producer_country` + `by_trader` group correctly; producer
  country empty → "ไม่ระบุ" (L136). snake_case model; single formatted dates.
- Additive (6 new files; TextConstant +1 tag, Program.cs +1 DI, TTLicenseDtlRepository +2 methods) — no other
  dashboard touched. Build 0 errors. Permitted side accepted; `imported_qty`=0 stub is expected (→ TASK-021).
- **Acceptance = live capture** (FORM_ID=8 rows, producer country populated, ฉบับ=distinct count, no-date completes) —
  bundle with the TASK-021 capture.
- **Grain flag (answered):** keep `MAX ... GROUP BY LICENSE_DTL_ID` (one producer country per line, no qty inflation);
  confirm at capture whether อ.8 lines routinely carry multiple producer countries.

## Goal

Stand up the `dashboard-import` officer backend mirroring `DashboardMoveLicense*`, on the อ.8 license-first backbone,
with the **permitted** side complete. `imported_qty` returns 0 until TASK-021 (DATA REQUEST 10). Apply the perf
learnings from day one (slim base-table joins, pre-aggregated LEFT JOINs, conditional date predicate → no-date completes).

## Build (mirror the DashboardMoveLicense trio)
1. **`Controllers/DashboardImportController.cs`** — officer routes: `search-filter`, `search-filter-product`
   (`?quantity_unit_id=` optional), `chart` (POST), `table` (POST). `[OfficerOnlyFilter]`, Swagger, standard try/catch.
2. **`Models/Dashboard/DashboardImportModel.cs`** — `DashboardImportSearchRequest` (`issue_date_range`,
   `trader_id`/companies, `quantity_unit_id`, `product_code`(s)); `DashboardImportChartsResponse`
   (`top5_by_producer_country`, `by_trader`, `by_trader_license_count`); `DashboardImportTableRow` (cols in SPEC-014,
   snake_case; `imported_qty` present, = 0 for now); the search-filter response (traders + units DDL).
3. **`Services/DashboardImportService.cs` + `IDashboardImportService`** — `SearchFilter()`, `ProductDdl(int? unit)`,
   `ChartData(req)`, `TableData(req)`; register in `Program.cs`.
4. **DAL query** `TTLicenseDtlRepository.GetImportDashboard(dateStart, dateEnd)` (or a new import repo method) —
   the SPEC-014 backbone: `T_T_LICENSE` (FORM_ID=8, LICENSE_STATUS=40) × `T_T_LICENSE_DTL` × `T_M_UNIT` + the
   pre-aggregated `T_T_LICENSE_DTL_PRODUCER`→`T_M_COUNTRY` country attach; conditional ISSUE_DATE predicate; ORDER BY.
   **No `imported_qty` source yet → select `0 AS ImportedQty`** (TASK-021 swaps in the INFORM_IMPORT LEFT JOIN).
5. **Charts:** `top5_by_producer_country` + `by_trader` measure = permitted qty (SUM); `by_trader_license_count` =
   COUNT(DISTINCT license) per trader.

## Must follow (learnings)
- Conditional date predicate (empty ⇒ no bound ⇒ all rows, and the query must still complete — pre-aggregate every
  attach, no correlated subqueries).
- Producer country via `GROUP BY LICENSE_DTL_ID` + `MAX` (1 row per line, no permitted-qty inflation).
- snake_case JSON keys; single formatted dates (REQ-007); empty producer country → "ไม่ระบุ".

## Definition of Done
- [x] `dashboard-import` search-filter (+ product cascade), chart, table endpoints exist and build.
- [x] Backbone returns อ.8 lines (FORM_ID=8/status=40) with producer country + permitted qty; `imported_qty`=0 (stub).
- [x] `by_trader_license_count` = distinct-license count; no-date completes (conditional predicate); `dotnet build` succeeds.
- [x] Other dashboards untouched.

## Implementation Notes

**Done by Jason 2026-07-20.** Scaffolded `dashboard-import` (อ.8) mirroring `DashboardMoveLicense*` but simpler (no
weapon-type/region/buyer), permitted side complete, perf-learnings applied from day one. `imported_qty` = 0 (TASK-021).

### Files created (6)
1. **`Controllers/DashboardImportController.cs`** — 4 officer endpoints (`[OfficerOnlyFilter]`, base `api/v1/officer`,
   Swagger tag `DASHBOARD_IMPORT`): `search-filter` (GET), `search-filter-product` (GET `?quantity_unit_id=` optional),
   `chart` (POST), `table` (POST). Standard try/catch + `_logger.LogError`.
2. **`Models/Dashboard/DashboardImportModel.cs`** — `DashboardImportSearchRequest` (`issue_date_range`, `trader_id`,
   `quantity_unit_id`, `product_code`); `DashboardImportSearchFilterResponse` (`trader_id_ddl` + `quantity_unit_id_ddl`);
   `DashboardImportChartsResponse` (3 shared `DashboardChartData`: `top5_by_producer_country`, `by_trader`,
   `by_trader_license_count`); `DashboardImportTableRow` (`license_no`, `issue_date`, `expiry_date`, `trader_name`,
   `product_code`, `product_name`, `producer_country`, `permitted_qty`, `imported_qty`, `unit` — snake_case; single
   formatted date per REQ-007; no `_formatted` twin).
3. **`Services/DashboardImportService.cs`** + **`IDashboardImportService`** — `SearchFilter()` (traders +
   `TMUnitRepo` units), `ProductDdl(int? unitId)` (cascade), `ChartData`, `TableData`. Charts: `top5_by_producer_country`
   + `by_trader` measure `SUM(PermittedQty)`; `by_trader_license_count` = `DocNo.Distinct().Count()` per trader (ฉบับ, A4).
   Producer country empty → "ไม่ระบุ".
4. **SPF DAL — `QueryResult/DashboardImportQueryResult.cs` + `QueryResult/ImportProductDdlResult.cs`**.
5. **`TTLicenseDtlRepository.GetImportDashboard(dateStart, dateEnd)`** — SPEC-014 backbone: `T_T_LICENSE` (`FORM_ID=8
   AND LICENSE_STATUS=40`) × `T_T_LICENSE_DTL` × `T_M_UNIT` + **pre-aggregated** producer country
   (`(SELECT LICENSE_DTL_ID, MAX(PRODUCER_COUNTRY_CODE) … GROUP BY LICENSE_DTL_ID) PRD` → `(SELECT COUNTRY_CODE,
   MAX(COUNTRY_NAME) … GROUP BY COUNTRY_CODE) CTY`); **conditional ISSUE_DATE predicate** (empty ⇒ all); `0 AS ImportedQty`;
   ORDER BY. **No correlated subqueries** (no-date completes). Plus `GetImportProducts(int? unitId)` for the cascade
   (distinct `PRODUCT_CODE`/`PRODUCT_NAME` on อ.8 lines, optional unit filter).
6. **`Program.cs`** — `AddScoped<IDashboardImportService, DashboardImportService>()`.

### Only-touched existing (3, additive) — `Utils/TextConstant.cs` (+1 SwaggerTag `DASHBOARD_IMPORT`), `Program.cs`
(+1 DI), `TTLicenseDtlRepository.cs` (+2 methods appended). No other dashboard / shared class changed.

### Verification (evidence)
- **`dotnet build`** (from `spf/DidSpf.WebApi.Center`, builds the DAL): **Build succeeded. 0 Error(s).**
- **Static grep:** 4 `dashboard-import/*` endpoints; 6 new files; `0 AS ImportedQty` in the SQL (stub);
  `by_trader_license_count` = `DocNo.Distinct().Count()`. Pre-aggregated country attach + conditional date predicate
  (no-date ⇒ all, no correlated subquery) per the perf learnings.
- Live capture (dated + no-date) is the brownfield acceptance: FORM_ID=8 rows, producer country populated, ฉบับ =
  distinct license count, no-date completes.

## Questions

- **Grain flag (SPEC-014 A3, at capture):** producer country uses `GROUP BY LICENSE_DTL_ID + MAX` = **one** country
  per line (keeps line grain / no permitted-qty inflation). If อ.8 lines routinely carry **multiple** producer
  countries and the stakeholder wants all shown, that's a rule change (@Sober/stakeholder to confirm at the capture).

## Questions
(Jason asks; Sober answers as `> answer: ...`)
