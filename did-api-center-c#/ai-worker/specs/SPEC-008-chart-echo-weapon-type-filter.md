# SPEC-008: /chart — echo the requested ประเภทอาวุธ (weapon-type) filter

- Source: REQ-008
- Status: ACTIVE

## Overview

Additive, **response-only**: the move dashboards' `/chart` responses echo back the weapon-type filter the FE
sent, so the UI can caption "ผล chart จากการกรองประเภทอาวุธ: <name>". Two new top-level fields on the chart
response — the **code** (as sent) + its **Thai name** (resolved the same way the ประเภทอาวุธ dropdown does,
via `TMProductTypeGroupRepo`). No change to chart data, filtering, query, request, or the envelope.

**Q answers (SA, per PM defaults):** Q1 code + name ✓. Q2 scope = move dashboards (a10 + license-move) ✓.
Q3 request field = **`product_type_group_code`** (`WeaponCategory` on `DashboardMove{A10,License}SearchRequest`);
place the echo **top-level on the chart response**, alongside the chart containers ✓. Q4 only ประเภทอาวุธ ✓.

## Change (2 chart-response models + 2 services)

### Models — add 2 fields to **each** chart response
`DashboardMoveA10ChartsResponse` and `DashboardMoveLicenseChartsResponse`:
```csharp
[JsonProperty("product_type_group_code")]
public string ProductTypeGroupCode { get; set; } = string.Empty;

[JsonProperty("product_type_group_name")]
public string ProductTypeGroupName { get; set; } = string.Empty;
```

### Services — set them in `ChartData(req)` (both `DashboardMoveA10Service` + `DashboardMoveLicenseService`)
- `ProductTypeGroupCode = req.WeaponCategory` (echo as sent; may be empty).
- If `req.WeaponCategory` is non-empty, resolve the name from the **same source as the weapon dropdown**:
  ```csharp
  if (!string.IsNullOrEmpty(req.WeaponCategory))
  {
      var ptg = await _uowSPF.TMProductTypeGroupRepo.GetDataAll();
      dataResponse.ProductTypeGroupCode = req.WeaponCategory;
      dataResponse.ProductTypeGroupName =
          ptg.FirstOrDefault(g => g.ProductTypeGroupCode == req.WeaponCategory)?.ProductTypeGroupName ?? string.Empty;
  }
  ```
  (No filter selected → both stay empty; no error.)

## Acceptance / Non-functional
- [ ] `/chart` (a10 + license-move) returns `product_type_group_code` + `product_type_group_name` matching the
      request's weapon-type; empty when none. Chart data unchanged.
- [ ] `dotnet build` succeeds; `/table`, filters, other dashboards untouched.
- Deterministic + resolvable from an already-used repo → Sober-review accept (no live capture needed).

## Out of scope
- No `/table` change; no other filters echoed (Q4); no other dashboards; no frontend.

## Tasks
- TASK-011: add the 2 echo fields + set them in both `ChartData` (depends on: —)

## Questions
(Jason asks here; Sober answers as `> answer: ...`)
