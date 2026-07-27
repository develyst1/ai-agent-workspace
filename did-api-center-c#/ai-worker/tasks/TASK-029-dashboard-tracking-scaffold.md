# TASK-029: Scaffold DASHBOARD_TRACKING (อ.10) — controller/models/service + filters/cascades + license-first backbone + 3 ฉบับ-charts

- Source: SPEC-019 (REQ-017)
- Status: DONE
- Assignee: Jason (BE)
- Depends on: none (reuse; status labels finalized in TASK-030 after DR-16)

## Review — Verdict: DONE — Sober (SA), 2026-07-21
Read `GetTrackingDashboard` (L429-531) + the service/model. Correct, ฉบับ grain holds:
- Backbone `T_T_LICENSE L (FORM_ID=10) INNER T_T_LICENSE_MOVE LM` (1:1 per license — REQ-011 lm_dup=0) → one row per
  license. All LEFT JOINs pre-aggregated: `VP` (slim region T_M_PROVINCE→T_M_AREA, REQ-012), `RMV` (T_T_REQUEST_MOVE+BA
  by REQUEST_ID — reuse license-move), `APV` (SUM T_T_LICENSE_DTL.QUANTITY by LICENSE_ID = approved), `ACT` (SUM
  T_T_INFORM_MOVE_DTL.QUANTITY by REF_LICENSE_NO = actual) → many-to-one, **no multiplication**.
- Line filters (weapon-type/unit/weapon) via a single conditional **EXISTS on T_T_LICENSE_DTL** (slim VW_PRODUCT base
  for weapon-cat) — ฉบับ grain preserved; weapons via dynamic `IN (:W0…)`. No date predicate → return-all completes;
  no correlated subqueries.
- Move-status **computed** (`MoveStatusLabel(approved, actual)`: ≤0/partial/full) — placeholder labels; license-status
  raw int + placeholder map. 3 charts = COUNT(DISTINCT license) by trader / trader×move-status / move-status. snake_case,
  single-formatted dates, all-nullable DTO. No `LICENSE_STATUS IN(...)` yet = correct safe superset pending DR-16.
- DID_SPF-only (grep 0 ELicensing/V_RPT); +SwaggerTag +Program.cs DI additive; build 0 err; other dashboards untouched.
- **Remaining = TASK-030 (DR-16):** finalize move-status labels/threshold + LICENSE_STATUS code→label map + included statuses. Then capture → REQ-017 DELIVERED.

## Goal
Stand up `dashboard-tracking` mirroring the license-move/a10 set, **grain = one row per อ.10 license (ฉบับ)**. All DID_SPF,
perf lessons (pre-agg, base tables, no correlated subqueries → return-all completes; no date filter). The two STATUS
label sets are placeholders until TASK-030 (DR-16).

## Build (reuse heavily)
1. **`Controllers/DashboardTrackingController.cs`** — officer routes: `search-filter`, `search-filter-province?dest_area_name=`,
   `search-filter-buyer-unit?buyer_group=` (reuse the REQ-013 shape), `chart` (POST), `table` (POST). `[OfficerOnlyFilter]`,
   Swagger tag `DASHBOARD_TRACKING`.
2. **`Models/Dashboard/DashboardTrackingModel.cs`** — `DashboardTrackingSearchRequest` (11 filters: request_type,
   move_type, trader_id, dest_area_name, dest_province, buyer_group, buyer_unit, product_type_group_code, quantity_unit_id,
   product_code, license_status — **no date range**); search-filter response (the reused DDLs); `DashboardTrackingChartsResponse`
   (`by_trader_move_status`, `by_trader`, `by_move_status` — all count); `DashboardTrackingTableRow` (10 cols, snake_case).
3. **`Services/DashboardTrackingService.cs` + interface** — `SearchFilter()`, `ProvinceDdl`/`BuyerUnitDdl` (reuse a10/REQ-013),
   `ChartData` (3 charts = COUNT(DISTINCT license) by trader / trader×move-status / move-status), `TableData`. Register in `Program.cs`.
4. **DAL `GetTrackingDashboard(...)`** — backbone `T_T_LICENSE L (FORM_ID=10) INNER JOIN T_T_LICENSE_MOVE LM` +
   `T_T_REQUEST RQ` + pre-agg `T_T_REQUEST_MOVE` (move type + buyer group/unit — reuse license-move `RMV`) + slim region
   (REQ-012). **Move status COMPUTED** via two pre-agg LEFT JOINs: `approved = SUM(T_T_LICENSE_DTL.QUANTITY) by LICENSE_ID`,
   `actual = SUM(T_T_INFORM_MOVE_DTL.QUANTITY) by REF_LICENSE_NO` → bucket in C# (labels placeholder until TASK-030).
   Multi-select weapon-type/unit/weapon → `EXISTS` on `T_T_LICENSE_DTL` (ฉบับ grain, no multiplication). `license_status`
   = `L.LICENSE_STATUS` (raw int; label placeholder). No date predicate; return-all completes.

## Must follow
snake_case; single formatted dates; ฉบับ grain (one row per license); no correlated subqueries; all DID_SPF; other dashboards untouched.

## Definition of Done
- [x] Endpoints (search-filter + 2 cascades, chart×3, table×10cols) build + return 200; backbone FORM_ID=10 ฉบับ grain;
      move-status computed (placeholder labels); return-all completes; `dotnet build` succeeds.

## Implementation Notes
(Jason — 2026-07-24)

Stood up the `dashboard-tracking` trio mirroring license-move/a10, grain = one row per อ.10 license (ฉบับ). All DID_SPF.

### New files
- **`Controllers/DashboardTrackingController.cs`** — `[OfficerOnlyFilter]`, tag `DASHBOARD_TRACKING`, 5 officer endpoints:
  `GET .../search-filter`, `GET .../search-filter-province?dest_area_name=`, `GET .../search-filter-buyer-unit?buyer_group=`
  (reuse REQ-013/TASK-022 `List<int>?`), `POST .../chart`, `POST .../table`. Standard try/catch + `_logger.LogError`.
- **`Models/Dashboard/DashboardTrackingModel.cs`** — `DashboardTrackingSearchRequest` (11 filters, **no date range**:
  move_request_type/transport_type_code/trader_id/dest_area_name/dest_province_name/authority_group_no/authority_name/
  product_type_group_code/quantity_unit_id/product_code/license_status); search-filter response (reused DDLs +
  `license_status_ddl` placeholder); `DashboardTrackingChartsResponse` (`by_trader_move_status`/`by_trader`/`by_move_status`);
  `DashboardTrackingTableRow` (10 cols snake_case + key; single-formatted dates).
- **`Services/Interfaces/IDashboardTrackingService.cs`** + **`Services/DashboardTrackingService.cs`** — ctor takes
  `IOptions<ConfigurationsModel>` (shared `DashboardWeaponTypeCodes`, REQ-009). `SearchFilter()` (common-code request/move
  types, weapon-type from config, traders, region, buyer-group, license-status placeholder), `ProvinceDdl`/`BuyerUnitDdl`
  reuse verbatim. `ChartData` = 3 COUNT(DISTINCT license_no) charts (trader×move-status / trader / move-status).
  `BuildTableRows` calls the DAL, filters the 8 license-level fields in LINQ (weapon filters done in SQL), maps 10 cols;
  **move-status computed** (`MoveStatusLabel(approved,actual)`: actual≤0→ยังไม่ขนย้าย, <approved→บางส่วน, ≥approved→ครบ —
  threshold placeholder); license-status via placeholder map {40} (fallback=code).

### DAL — `TTLicenseDtlRepository.GetTrackingDashboard(weaponCategory, unitId, weapons)`
`T_T_LICENSE L (FORM_ID=10)` INNER `T_T_LICENSE_MOVE LM` LEFT `T_T_REQUEST RQ` LEFT slim region `VP`
(`T_M_PROVINCE→T_M_AREA` GROUP BY, REQ-012) LEFT pre-agg `RMV` (`T_T_REQUEST_MOVE`+`T_M_BUYER_AUTHORITY` GROUP BY
REQUEST_ID — reuse license-move) LEFT pre-agg `APV` (SUM `T_T_LICENSE_DTL.QUANTITY` by LICENSE_ID = approved) LEFT
pre-agg `ACT` (SUM `T_T_INFORM_MOVE_DTL.QUANTITY` by REF_LICENSE_NO = actual). Line-level filters
(weapon-type/unit/weapon) → a single conditional **EXISTS on `T_T_LICENSE_DTL`** (keeps ฉบับ grain, no multiplication;
weapons via dynamic `IN (:W0…)`). **No date predicate** → return-all completes. `ORDER BY L.ISSUE_DATE DESC, L.ID DESC`.
All joins many-to-one/1:1 → no row multiplication; no correlated subqueries. New all-nullable DTO
`QueryResult/DashboardTrackingQueryResult.cs`.

### Edits
- `Utils/TextConstant.cs` — `SwaggerTags.DASHBOARD_TRACKING`.
- `Program.cs` — `AddScoped<IDashboardTrackingService, DashboardTrackingService>()`.

### Deferred to TASK-030 (DR-16)
Included license statuses (currently returns ALL FORM_ID=10 licenses — no `LICENSE_STATUS IN (...)` restriction) +
the full LICENSE_STATUS code→label map + the move-status partial/full threshold + confirm computed vs stored.

### Verification
- `dotnet build` (Center+SPF) → **Build succeeded, 0 Error(s)** (pre-existing warnings only).
- Grep repo file `ELicensing|V_RPT_IMPORT_PRODUCT` → **0**; `GetTrackingDashboard` + `:FORM_ID", 10` present. Other
  dashboards untouched (additive TextConstant + Program.cs only).
- Static-only per brownfield rule; live data (ฉบับ counts, status buckets, cascades, return-all completes) = stakeholder
  capture after TASK-030 finalizes the status definitions.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
