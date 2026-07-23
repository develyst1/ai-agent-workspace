# SPEC-015: `search-filter-buyer-unit` — accept MULTIPLE buyer-group codes (array parent, union of units)

- Source: REQ-015
- Status: ACTIVE
- Builds on: SPEC-013/TASK-018 (the single-parent cascade)

## Overview + Q answers (SA)

REQ-013 shipped `search-filter-buyer-unit?buyer_group=` with a **single** `int?` parent. But the buyer-group
**data filter is already multi-select** — `req.Buyers` is `List<string>` and the chart/table use
`InList(req.Buyers, r.BuyerGroupNo?.ToString())` (a10 svc L303 / license L283). So the single-value cascade is the
outlier. REQ-015 aligns it: **accept an array of buyer-group codes → return the union of those groups' units.**

- **Q (single vs array + main-filter consistency):** the main search-filter's กลุ่มหน่วยผู้ซื้อ already feeds a
  **multi-select** `req.Buyers` array → the cascade should mirror it. Change the cascade param from `int?` to
  `List<int>`. Union semantics (`AuthorityGroupNo IN buyerGroups`). **Backward-compatible:** none → all (unchanged);
  a single `?buyer_group=1` binds to a 1-element list → same result as today; multiple `?buyer_group=1&buyer_group=2`
  → union.

## Change — 3 files × 2 dashboards (mirror TASK-018, `List<int>` instead of `int?`)

### 1. Service `BuyerUnitDdl` (both `DashboardMoveA10Service` L125 / `DashboardMoveLicenseService` L115)
```csharp
public async Task<IActionResult> BuyerUnitDdl(List<int>? buyerGroups)
{
    var dataResponse = new DropdownDDLData();
    var resBuyer = await _uowSPF.TMBuyerAuthorityRepo.GetAllAsync();
    dataResponse.Items = resBuyer
        .Where(b => buyerGroups == null || buyerGroups.Count == 0 || buyerGroups.Contains(b.AuthorityGroupNo))
        .Where(b => !string.IsNullOrEmpty(b.AuthorityName))
        .Select(b => b.AuthorityName)
        .Distinct()   // union across the selected groups; dedups a name shared by >1 group
        .Select(name => new DropdownDDLItem { Value = name, Label = name })
        .ToList();
    return Success(dataResponse);
}
```

### 2. Interface (both `IDashboardMove*Service`)
`Task<IActionResult> BuyerUnitDdl(List<int>? buyerGroups);`

### 3. Controller (both) — repeated query param binds to the list
`[FromQuery(Name = "buyer_group")] List<int>? buyerGroup` → `_service.BuyerUnitDdl(buyerGroup)`. Everything else on
the endpoint (route `search-filter-buyer-unit`, OfficerOnlyFilter, Swagger, try/catch) unchanged. FE sends
`?buyer_group=1&buyer_group=2` (repeated); a single value still works.

## Acceptance
- [ ] `search-filter-buyer-unit` (both dashboards): no `buyer_group` → all units; one → that group's; **multiple →
      the union** (distinct unit names across the given groups).
- [ ] Single-value call returns the same as today (backward-compatible); `dotnet build` succeeds; main search-filter
      (`authority_group_no_ddl`) + chart/table data filter untouched.
- Deterministic (options only, existing source) → Sober-review accept, no live capture.

## Out of scope
- No change to the main search-filter, the buyer-group dropdown, or the chart/table `authority_name` data filter.
  FE hand-off: send repeated `buyer_group` params (multi-select) to the cascade.

## Tasks
- TASK-022: `BuyerUnitDdl` `int?` → `List<int>` union (a10 + license) — Jason.

## Questions
(Jason asks here; Sober answers as `> answer: ...`)
