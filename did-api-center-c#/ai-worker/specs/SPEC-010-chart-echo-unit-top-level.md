# SPEC-010: /chart — expose หน่วยนับ (unit) at top level (mirror of REQ-008 weapon-type echo)

- Source: REQ-010
- Status: ACTIVE

## Overview

Additive, **response-only** — the twin of SPEC-008 for the unit. Add the **requested หน่วยนับ** at the top
level of both move dashboards' `/chart` response: `quantity_unit_id` (as sent) + `quantity_unit_name`
(resolved from `T_M_UNIT`). **Echo the requested filter** (not the per-chart `valueUnit`, which is `""` on
empty results) → the caption still shows the unit even when the charts return no rows. No change to chart
data, the per-chart `valueUnit`, filtering, request, or the envelope.

**Q answers (SA):** Q1 → echo the **requested หน่วยนับ filter** (id + resolved name; populated even when empty).
Q2 → request field = **`quantity_unit_id`** (`Unit` on `DashboardMove{A10,License}SearchRequest`); top-level
response keys = **`quantity_unit_id`** + **`quantity_unit_name`**; resolution source = **`T_M_UNIT`** via
`TMUnitRepo` (the same source the หน่วยนับ dropdown/cascade uses).

## Change (2 chart-response models + 2 services) — same shape as SPEC-008

### Models — add 2 fields to each chart response
`DashboardMoveA10ChartsResponse` and `DashboardMoveLicenseChartsResponse` (top-level, next to the SPEC-008
`product_type_group_*` fields):
```csharp
[JsonProperty("quantity_unit_id")]
public string QuantityUnitId { get; set; } = string.Empty;

[JsonProperty("quantity_unit_name")]
public string QuantityUnitName { get; set; } = string.Empty;
```

### Services — set them in `ChartData(req)` (both services), alongside the SPEC-008 weapon echo
```csharp
dataResponse.QuantityUnitId = req.Unit;   // echo as sent (may be empty)
if (!string.IsNullOrEmpty(req.Unit))
{
    var units = await _uowSPF.TMUnitRepo.GetAllAsync();
    dataResponse.QuantityUnitName =
        units.FirstOrDefault(u => u.Id.ToString() == req.Unit)?.UnitName ?? string.Empty;
}
```
(`req.Unit` = the `quantity_unit_id` field. No filter → both stay `""`, no error. Populated even when the
charts are empty because it echoes the request, not the result.)

## Acceptance / Non-functional
- [ ] `/chart` (a10 + license-move) has top-level `quantity_unit_id` + `quantity_unit_name` = the requested
      หน่วยนับ; populated even when the charts are empty; empty request → empty (no error).
- [ ] Per-chart `valueUnit`, chart data, `/table`, filters, other dashboards unchanged; `dotnet build` succeeds.
- Additive + resolvable from an already-used repo → Sober-review accept, no live capture (same as SPEC-008).

## Out of scope
- No `/table`/other-dashboard/`valueUnit` change; no other filters echoed.

## Tasks
- TASK-015: add the 2 unit-echo fields + set them in both `ChartData` (depends on: —)

## Questions
(Jason asks here; Sober answers as `> answer: ...`)
