# TASK-011: /chart echo the requested ประเภทอาวุธ (code + Thai name) — a10 + license-move

- Source: SPEC-008
- Status: REVIEW
- Depends on: none

## What to do (additive, response-only)

Echo the weapon-type filter (`product_type_group_code`) back on the `/chart` response of both move dashboards.

1. **Models** — add 2 top-level fields to **`DashboardMoveA10ChartsResponse`** and
   **`DashboardMoveLicenseChartsResponse`** (in their respective `Models/Dashboard/DashboardMove*Model.cs`):
   ```csharp
   [JsonProperty("product_type_group_code")] public string ProductTypeGroupCode { get; set; } = string.Empty;
   [JsonProperty("product_type_group_name")] public string ProductTypeGroupName { get; set; } = string.Empty;
   ```
2. **Services** — in `ChartData(req)` of **`DashboardMoveA10Service`** + **`DashboardMoveLicenseService`**, after
   building `dataResponse`, set:
   ```csharp
   if (!string.IsNullOrEmpty(req.WeaponCategory))
   {
       var ptg = await _uowSPF.TMProductTypeGroupRepo.GetDataAll();
       dataResponse.ProductTypeGroupCode = req.WeaponCategory;
       dataResponse.ProductTypeGroupName =
           ptg.FirstOrDefault(g => g.ProductTypeGroupCode == req.WeaponCategory)?.ProductTypeGroupName ?? string.Empty;
   }
   ```
   (`req.WeaponCategory` = the `product_type_group_code` field. Empty filter → both stay "".)

**DO NOT:** change chart data/filtering/query/the request/`/table`/other dashboards/shared classes.

## Definition of Done
- [x] `/chart` (both) returns `product_type_group_code` + `product_type_group_name` = the requested weapon type
      (empty when none). Chart series/totals unchanged.
- [x] `dotnet build` succeeds. **Build succeeded. 0 Error(s).**

## Implementation Notes

**Done by Jason 2026-07-20.** Additive, response-only, 4 edits (2 models + 2 services):
1. **`Models/Dashboard/DashboardMoveA10Model.cs`** → `DashboardMoveA10ChartsResponse`: added top-level
   `[JsonProperty("product_type_group_code")] ProductTypeGroupCode` + `[JsonProperty("product_type_group_name")]
   ProductTypeGroupName` (default `""`).
2. **`Models/Dashboard/DashboardMoveLicenseModel.cs`** → `DashboardMoveLicenseChartsResponse`: same 2 fields.
3. **`Services/DashboardMoveA10Service.cs`** `ChartData(req)`: after building `dataResponse`, if
   `req.WeaponCategory` non-empty → `ProductTypeGroupCode = req.WeaponCategory` + `ProductTypeGroupName` resolved
   from `TMProductTypeGroupRepo.GetDataAll()` (same source as the weapon dropdown); empty filter → both stay "".
4. **`Services/DashboardMoveLicenseService.cs`** `ChartData(req)`: same echo block before the return.

Untouched: chart data/series/totals, filtering, query, request, `/table`, other dashboards, shared classes.

**Verified:** `dotnet build` → **Build succeeded. 0 Error(s).** Grep: both chart-response models carry the 2 echo
keys; both `ChartData` set `ProductTypeGroupCode = req.WeaponCategory`. Deterministic + resolved from an
already-used repo → no live capture needed (per SPEC-008).

## Questions

(Jason asks; Sober answers as `> answer: ...`)

## Review — Verdict: DONE — Sober (SA), 2026-07-20
Read the code: echo fields top-level in `DashboardMoveA10ChartsResponse` (L114-120) — chart containers
(`top5_by_buyer_unit`/`by_buyer_group`/`by_trader`) intact below — and the same in
`DashboardMoveLicenseChartsResponse`. Both `ChartData` set `ProductTypeGroupCode = req.WeaponCategory` +
resolve `ProductTypeGroupName` from `TMProductTypeGroupRepo` (the weapon dropdown's source); empty filter →
"". Additive, response-only; shared `DashboardChartData` untouched; `/table`/filters/other dashboards
untouched; build 0 errors. Deterministic + already-used repo → **accepted, no capture** (per SPEC-008).
REQ-008 code complete.
