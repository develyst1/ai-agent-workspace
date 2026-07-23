# TASK-018: หน่วยผู้ซื้อ cascade endpoint (← กลุ่มหน่วยผู้ซื้อ, optional) + remove from main search-filter (a10 + license)

- Source: SPEC-013 (REQ-013)
- Status: REVIEW
- Assignee: Jason (BE)
- Depends on: none

## Goal

Mirror the จังหวัด←ภาค cascade for หน่วยผู้ซื้อ←กลุ่มหน่วยผู้ซื้อ. New `search-filter-buyer-unit` endpoint on both
move dashboards; move the buyer-unit dropdown out of the main `search-filter`. Dropdown-options only.

## Changes (both a10 + license — identical shape; mirror the province cascade)

1. **Service — add `BuyerUnitDdl(int? buyerGroup)`** (next to `ProvinceDdl`):
   ```csharp
   public async Task<IActionResult> BuyerUnitDdl(int? buyerGroup)
   {
       var dataResponse = new DropdownDDLData();
       var resBuyer = await _uowSPF.TMBuyerAuthorityRepo.GetAllAsync();
       dataResponse.Items = resBuyer
           .Where(b => !buyerGroup.HasValue || b.AuthorityGroupNo == buyerGroup.Value)
           .Where(b => !string.IsNullOrEmpty(b.AuthorityName))
           .Select(b => b.AuthorityName)
           .Distinct()
           .Select(name => new DropdownDDLItem { Value = name, Label = name })
           .ToList();
       return Success(dataResponse);
   }
   ```
2. **Service — remove the buyer-unit block from `SearchFilter()`**: delete `dataResponse.BuyerUnitDdl.Items = resBuyer
   .Where(...).Select(b => b.AuthorityName)...` (a10 `DashboardMoveA10Service` L117-122; license equivalent). **Keep**
   the `BuyerGroupDdl` build and the `resBuyer = GetAllAsync()` call (BuyerGroupDdl still uses it).
3. **Response model — remove** `[JsonProperty("authority_name_ddl")] public DropdownDDLData BuyerUnitDdl` (a10
   `DashboardMoveA10Model` L97-98; license equivalent). Keep `authority_group_no_ddl` (`BuyerGroupDdl`).
4. **Controller — add endpoint** `[HttpGet(OFFICER_API + "/dashboard-move-{a10,license}/search-filter-buyer-unit")]`
   → `_service.BuyerUnitDdl(buyerGroup)`, param `[FromQuery(Name = "buyer_group")] int? buyerGroup`. Mirror the
   `search-filter-province` method exactly (OfficerOnlyFilter, Swagger, ProducesResponseType `DropdownDDLData`,
   the standard try/catch + `_logger.LogError` line). Use each dashboard's `SwaggerTags`.
5. **Interface** — add `Task<IActionResult> BuyerUnitDdl(int? buyerGroup);` to `IDashboardMoveA10Service` +
   `IDashboardMoveLicenseService`.

## Must NOT change
- `authority_group_no_ddl` (buyer group) — stays in the main search-filter as the optional parent.
- The chart/table `authority_name` (buyer-unit) **data** filtering (`InList(req.BuyerUnits, …)`) — unchanged; this
  is dropdown-options only.
- Other dropdowns / cascades / dashboards.

## Definition of Done
- [x] New `search-filter-buyer-unit` (a10 + license): no `buyer_group` → all units; `buyer_group=<n>` → that group's units.
- [x] Main `search-filter` response no longer has `authority_name_ddl`; still has `authority_group_no_ddl`.
- [x] `dotnet build` succeeds. **Build succeeded. 0 Error(s).**

## Implementation Notes

**Done by Jason 2026-07-20.** Mirrored the จังหวัด←ภาค cascade for หน่วยผู้ซื้อ←กลุ่มหน่วยผู้ซื้อ. Identical shape
on both dashboards; dropdown-options only (no data-filter change). 5 edits × 2 dashboards:

1. **Service — added `BuyerUnitDdl(int? buyerGroup)`** (`DashboardMoveA10Service` + `DashboardMoveLicenseService`,
   next to `ProvinceDdl`): `TMBuyerAuthorityRepo.GetAllAsync()` → `.Where(!buyerGroup.HasValue || AuthorityGroupNo ==
   buyerGroup) .Where(AuthorityName not empty) .Select(AuthorityName).Distinct()` → `{Value=name,Label=name}`.
2. **Service — removed the buyer-unit block from `SearchFilter()`** (kept `BuyerGroupDdl` + the `resBuyer =
   TMBuyerAuthorityRepo.GetAllAsync()` call which `BuyerGroupDdl` still uses).
3. **Model — removed** `[JsonProperty("authority_name_ddl")] BuyerUnitDdl` from `DashboardMoveA10ChartsResponse`'s
   filter response (`DashboardMoveA10SearchFilterResponse`) and the license equivalent. `authority_group_no_ddl`
   (`BuyerGroupDdl`) kept.
4. **Controller — added** `[HttpGet(OFFICER_API + "/dashboard-move-{a10,license}/search-filter-buyer-unit")]`
   → `_service.BuyerUnitDdl(buyerGroup)`, `[FromQuery(Name = "buyer_group")] int? buyerGroup`; mirrors
   `search-filter-province` exactly (`[OfficerOnlyFilter]`, Swagger, `ProducesResponseType<DropdownDDLData>`,
   standard try/catch + `_logger.LogError`). Each dashboard's own `SwaggerTags`.
5. **Interface — added** `Task<IActionResult> BuyerUnitDdl(int? buyerGroup);` to both service interfaces.

**Unchanged:** `authority_group_no_ddl` (parent), the chart/table `authority_name` data filter
(`InList(req.BuyerUnits, …)`), other dropdowns/cascades/dashboards.

**Verified:** `dotnet build` (from `spf/DidSpf.WebApi.Center`): **Build succeeded. 0 Error(s).** Grep: the new
`search-filter-buyer-unit` endpoint is on both controllers → `_service.BuyerUnitDdl(buyerGroup)`;
`authority_name_ddl` gone from both filter models; `BuyerUnitDdl` present in both interfaces + services. Deterministic
DDL cascade (same shape as the shipped province cascade) → no live capture needed.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Questions
(Jason asks; Sober answers as `> answer: ...`)
