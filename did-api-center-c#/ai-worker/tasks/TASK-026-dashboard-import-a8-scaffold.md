# TASK-026: Scaffold DASHBOARD_IMPORT_A8 — controller/models/service + search-filter + product cascade

- Source: SPEC-018 (REQ-016)
- Status: DONE
- Assignee: Jason (BE)
- Depends on: none (structure known; the IMEX backbone query is TASK-027, gated on DR-15)

## Review — Verdict: DONE — Sober (SA), 2026-07-21
Grep-verified the scaffold: model has `inform_date_range` + `issue_date_range` (two date ranges); `DashboardImportA8ChartsResponse`
has the 4 charts (`by_trader`/`top5_by_origin_country`/`by_trader_baht`/`top5_by_origin_country_baht`); 15-col table row.
`BuildTableRows` is a genuine **stub** (`Task.FromResult(new List<…>())`) — the only `T_T_INFORM_IMEX` mentions are TASK-027
comments, so **no guessed IMEX columns are queried** (BUG-014-A lesson honored). No ELicensing; DI + SwaggerTag additive;
build 0 errors; other dashboards untouched. Endpoints build + return 200 (empty data) → TASK-027 swaps in the real query
at the single `BuildTableRows` point after DR-15.

## Goal
Stand up `dashboard-import-a8` mirroring the a10/dashboard-import trio, with search-filter + product cascade + the
model/endpoint skeleton. The real-first IMEX query + charts/table data = TASK-027 (after DR-15 confirms columns). Apply
perf lessons from day one (pre-agg, conditional date predicates → no-date completes).

## Build (mirror `DashboardMoveA10*` / `DashboardImport*`)
1. **`Controllers/DashboardImportA8Controller.cs`** — officer routes: `search-filter`, `search-filter-product`
   (`?quantity_unit_id=`), `chart` (POST), `table` (POST). `[OfficerOnlyFilter]`, Swagger tag `DASHBOARD_IMPORT_A8`,
   standard try/catch + `_logger.LogError`.
2. **`Models/Dashboard/DashboardImportA8Model.cs`** — `DashboardImportA8SearchRequest` (`issue_date_range`,
   **`inform_date_range`**, `trader_id`, `quantity_unit_id`, `product_code`); the search-filter response (traders + units);
   `DashboardImportA8ChartsResponse` (**4** shared `DashboardChartData`: `by_trader`, `top5_by_origin_country`,
   `by_trader_baht`, `top5_by_origin_country_baht`); `DashboardImportA8TableRow` (15 cols per SPEC-018, snake_case; single
   formatted dates). qty + baht chart data + table `imported_qty`/`amount_baht`/`unit_price_baht` present (0 until TASK-027).
3. **`Services/DashboardImportA8Service.cs` + `IDashboardImportA8Service`** — `SearchFilter()` (traders + `TMUnitRepo`),
   `ProductDdl(int? unit)` (reuse REQ-014's approach), `ChartData(req)`, `TableData(req)`; register in `Program.cs`.
4. **DAL:** add the repo method **signature** `GetImportA8Dashboard(issueStart, issueEnd, informStart, informEnd)` returning
   a `DashboardImportA8QueryResult` list — **stub/empty until TASK-027** (do not guess IMEX columns yet). Or leave the
   method for TASK-027 and have the service return empty rows so the endpoints build + respond 200.

## Must follow
Conditional date predicates (both ranges empty ⇒ all; no-date completes); snake_case; single formatted dates (REQ-007);
empty origin country → "ไม่ระบุ". Do NOT touch other dashboards.

## Definition of Done
- [x] `dashboard-import-a8` search-filter (+ product cascade), chart (4 charts), table (15 cols) endpoints exist + build,
      return 200 (empty/stub data until TASK-027).
- [x] `dotnet build` succeeds; other dashboards untouched. Paste files + build result.

## Implementation Notes
(Jason — 2026-07-24)

Scaffolded the `dashboard-import-a8` trio mirroring `DashboardImport*` (a10-shape), all DID_SPF, no ELicensing. Real
IMEX query deferred to TASK-027 (stubbed — did NOT guess IMEX columns, per the BUG-014-A lesson).

### New files
- **`Controllers/DashboardImportA8Controller.cs`** — `[OfficerOnlyFilter]`, Swagger tag `DASHBOARD_IMPORT_A8`, 4 officer
  endpoints: `GET .../search-filter`, `GET .../search-filter-product?quantity_unit_id=`, `POST .../chart`,
  `POST .../table`. Standard try/catch + `_logger.LogError` + `EXCEPTION_ERROR` fallback.
- **`Models/Dashboard/DashboardImportA8Model.cs`** —
  - `DashboardImportA8SearchRequest`: **two** date ranges `inform_date_range` (primary) + `issue_date_range`, plus
    `trader_id`, `quantity_unit_id`, `product_code`; each range exposes `*Start`/`*End` `[JsonIgnore]` helpers.
  - `DashboardImportA8SearchFilterResponse`: `trader_id_ddl` + `quantity_unit_id_ddl`.
  - `DashboardImportA8ChartsResponse`: **4** shared `DashboardChartData` — `by_trader`, `top5_by_origin_country`,
    `by_trader_baht`, `top5_by_origin_country_baht`.
  - `DashboardImportA8TableRow`: 15 snake_case cols per SPEC-018 (`license_no`, `issue_date`, `expiry_date`,
    `trader_name`, `inform_date`, `import_permit_date`, `product_code`, `product_name`, `unit`, `permitted_qty`, `seq`,
    `imported_qty`, `unit_price_baht`, `amount_baht`, `origin_country`) + `key`. Dates single-formatted (REQ-007).
- **`Services/Interfaces/IDashboardImportA8Service.cs`** + **`Services/DashboardImportA8Service.cs`** —
  `SearchFilter()` (traders via `TMTraderRepo.GetDataActiveFactory` + units via `TMUnitRepo.GetAllAsync`),
  `ProductDdl(int?)` (reuses REQ-014 `TTLicenseDtlRepo.GetImportProducts`), `ChartData`/`TableData`. The 4 charts group
  by trader/origin-country over qty (`ImportedQty`) and baht (`AmountBaht`); empty country → "ไม่ระบุ"; Top-5 for country.
  **`BuildTableRows` stub** returns an empty list (`Task.FromResult`) — endpoints build + return 200; TASK-027 swaps in
  `GetImportA8Dashboard(...)` + the 15-col map once DR-15 confirms columns.

### Edits
- `Utils/TextConstant.cs` — added `SwaggerTags.DASHBOARD_IMPORT_A8`.
- `Program.cs` — `AddScoped<IDashboardImportA8Service, DashboardImportA8Service>()` next to the other dashboards.

### Deferred to TASK-027 (no DAL method added yet — avoids guessing IMEX columns)
`GetImportA8Dashboard(issueStart, issueEnd, informStart, informEnd)` + its `DashboardImportA8QueryResult` DTO. The
service's `BuildTableRows` is the single swap point. Perf lessons (pre-agg, conditional date predicates on BOTH ranges,
no-date completes) go in with the real query.

### Verification
- `dotnet build` (Center) → **Build succeeded, 0 Error(s)** (pre-existing warnings only).
- No ELicensing reference; other dashboards untouched (only additive TextConstant + Program.cs lines).
- Static-only per brownfield rule; endpoints returning live data (search-filter dropdowns, empty chart/table) verified by
  build + shape only — full behavior at the TASK-027 live capture.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
