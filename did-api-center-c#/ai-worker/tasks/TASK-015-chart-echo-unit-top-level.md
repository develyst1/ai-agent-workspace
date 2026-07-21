# TASK-015: /chart — expose หน่วยนับ (unit) at top level (mirror weapon-type echo) — a10 + license-move

- Source: SPEC-010 (REQ-010)
- Status: DONE
- Assignee: Jason (BE)
- Depends on: none

## Goal

The exact twin of TASK-011 (SPEC-008 weapon-type echo), for the หน่วยนับ. Add a top-level
`quantity_unit_id` + `quantity_unit_name` to both move dashboards' `/chart` response, echoing the
**requested** หน่วยนับ filter (`req.Unit`) resolved to its Thai name — so the FE caption shows the unit
even when the charts are empty. Additive, response-only. No filter/chart/`valueUnit`/table change.

## Changes

### 1. Chart-response models — add 2 fields to each (next to the SPEC-008 `product_type_group_*` fields)
`Models/Dashboard/DashboardMoveA10Model.cs` → `DashboardMoveA10ChartsResponse`
`Models/Dashboard/DashboardMoveLicenseModel.cs` → `DashboardMoveLicenseChartsResponse`
```csharp
[JsonProperty("quantity_unit_id")]
public string QuantityUnitId { get; set; } = string.Empty;

[JsonProperty("quantity_unit_name")]
public string QuantityUnitName { get; set; } = string.Empty;
```

### 2. Services — set them in `ChartData(req)`, right after the SPEC-008 weapon echo block
`Services/DashboardMoveA10Service.cs` (after L248, the `if (!string.IsNullOrEmpty(req.WeaponCategory)) {...}` block)
`Services/DashboardMoveLicenseService.cs` (after the matching block, ~L223+)
```csharp
// echo หน่วยนับที่กรอง (id + ชื่อ) กลับให้ frontend ใช้ caption — เหมือน product type
dataResponse.QuantityUnitId = req.Unit;
if (!string.IsNullOrEmpty(req.Unit))
{
    var allUnits = await _uowSPF.TMUnitRepo.GetAllAsync();
    dataResponse.QuantityUnitName =
        allUnits.FirstOrDefault(u => u.Id.ToString() == req.Unit)?.UnitName ?? string.Empty;
}
```
- `req.Unit` = the request's `quantity_unit_id` (already the หน่วยนับ filter — see the existing
  `MatchEq(req.Unit, r.QuantityUnitId?.ToString())` in `BuildFilteredRows`).
- `TMUnitRepo.GetAllAsync()` + `u.Id.ToString()`/`u.UnitName` is exactly what the หน่วยนับ dropdown builds
  from (`SearchFilter`, a10 L159-161 / license L149-151) — same source, so the resolved name matches the DDL.
- Empty `req.Unit` → both fields stay `""` (no lookup, no error). Populated even when the charts are empty
  because it echoes the request, not the result.

## Definition of Done
- [x] Both `ChartsResponse` models have `quantity_unit_id` + `quantity_unit_name` (default `""`).
- [x] Both `ChartData` set `QuantityUnitId = req.Unit` and resolve `QuantityUnitName` from `TMUnitRepo` when
      `req.Unit` is non-empty; empty request → both `""`.
- [x] `dotnet build` succeeds. **Build succeeded. 0 Error(s).** No change to `valueUnit`/chart data/`/table`/filters/other dashboards.

## Implementation Notes

**Done by Jason 2026-07-20.** Exact twin of TASK-011 (SPEC-008 weapon echo), for หน่วยนับ. Additive, response-only,
4 edits:
1. **`Models/Dashboard/DashboardMoveA10Model.cs`** → `DashboardMoveA10ChartsResponse`: added top-level
   `[JsonProperty("quantity_unit_id")] QuantityUnitId` + `[JsonProperty("quantity_unit_name")] QuantityUnitName`
   (default `""`), next to the SPEC-008 `product_type_group_*` fields.
2. **`Models/Dashboard/DashboardMoveLicenseModel.cs`** → `DashboardMoveLicenseChartsResponse`: same 2 fields.
3. **`Services/DashboardMoveA10Service.cs`** `ChartData(req)`: after the weapon-echo block —
   `QuantityUnitId = req.Unit`; if `req.Unit` non-empty → `QuantityUnitName` from `TMUnitRepo.GetAllAsync()`
   (`u.Id.ToString() == req.Unit`); empty → both `""`.
4. **`Services/DashboardMoveLicenseService.cs`** `ChartData(req)`: same block.

`req.Unit` = the request's `quantity_unit_id` (already the หน่วยนับ filter via `MatchEq(req.Unit, r.QuantityUnitId…)`).
`TMUnitRepo.GetAllAsync()` + `u.Id`/`u.UnitName` = the same source the หน่วยนับ dropdown builds from → the echoed
name matches the DDL. Echoes the **request**, so it's populated even when the charts are empty.

Untouched: per-chart `valueUnit`, chart data/series/totals, `/table`, filters, other dashboards, shared classes.

**Verified:** `dotnet build` → **Build succeeded. 0 Error(s).** Grep: both chart-response models carry the 2
`quantity_unit_*` keys; both `ChartData` set `QuantityUnitId = req.Unit`. Deterministic + resolved from an
already-used repo → no live capture needed (per SPEC-010).

## Review — Verdict: DONE — Sober (SA), 2026-07-21
Read the actual code (not the notes). Confirmed:
- **Models** — `DashboardMoveA10ChartsResponse` (`DashboardMoveA10Model.cs` L122-128) + `DashboardMoveLicenseChartsResponse`
  (`DashboardMoveLicenseModel.cs` L159-164) each have top-level `[JsonProperty("quantity_unit_id")] QuantityUnitId`
  + `[JsonProperty("quantity_unit_name")] QuantityUnitName`, default `""`, next to the SPEC-008 `product_type_group_*` fields.
- **Services** — echo block right after the weapon echo in both `ChartData`: `DashboardMoveA10Service.cs` L250-257,
  `DashboardMoveLicenseService.cs` L228-235. `QuantityUnitId = req.Unit` (unconditional echo); `QuantityUnitName`
  resolved from `TMUnitRepo.GetAllAsync()` (`u.Id.ToString() == req.Unit` → `u.UnitName`) only when `req.Unit` non-empty;
  empty → both `""`.
- **No edge case** — `/chart` binds `[FromBody] DashboardMove*SearchRequest` so `req.Unit` is the JSON string field
  (`quantity_unit_id`); unsent → `""` (the `int unit` query param is only on the cascade `search-filter-weapon`
  endpoint, not `/chart`). Populated even when the charts are empty (echoes the request, not the ""-on-empty per-chart
  `valueUnit`). Resolves from the same repo the หน่วยนับ DDL builds from → name matches the dropdown.
- Additive/response-only; per-chart `valueUnit`, chart data, `/table`, filters, other dashboards untouched; build 0 errors.
Same class as SPEC-008 (additive + deterministic + resolvable from an already-used repo) → **accepted on Sober review,
no live capture.** REQ-010 DELIVERED.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
