# SPEC-013: หน่วยผู้ซื้อ (buyer unit) cascade endpoint ← กลุ่มหน่วยผู้ซื้อ (optional parent)

- Source: REQ-013
- Status: ACTIVE

## Overview

Mirror the existing **จังหวัด←ภาค** (province←region) cascade for **หน่วยผู้ซื้อ←กลุ่มหน่วยผู้ซื้อ**. Move the
buyer-unit dropdown out of the main `search-filter` into its own `search-filter-buyer-unit` cascade endpoint whose
optional `buyer_group` parent filters the units. Both move dashboards (a10 + license-move) — they share identical
buyer code. Dropdown-options only; no change to chart/table data filtering.

**Q answers (SA):** Q1 → link confirmed in code: `T_M_BUYER_AUTHORITY` — group = `AUTHORITY_GROUP_NO`
(`AuthorityGroupNo`, int 1/2/3/9), unit = `AUTHORITY_NAME` (`AuthorityName`; Value+Label, same as today's
`BuyerUnitDdl` build). Route = `GET /dashboard-move-{a10,license}/search-filter-buyer-unit?buyer_group=` — mirrors
`search-filter-province?dest_area_name=`. Q2 → **both** dashboards (default).

## Pattern being mirrored (province←region)

- Controller: `[HttpGet(OFFICER_API + "/dashboard-move-a10/search-filter-province")]` →
  `ProvinceDdl(region ?? "")` (a10 `DashboardMoveA10Controller` L49-64).
- Service `ProvinceDdl(string region)`: empty region → all provinces; region given → filtered (a10 service L130-146).

## Change — 3 files × 2 dashboards (a10 + license), all mirroring the province cascade

### 1. Service — new `BuyerUnitDdl(int? buyerGroup)` (both services)
Add next to `ProvinceDdl`. **Optional parent** ⇒ `int?` (null = no parent = all; value = filter). Same source +
projection as today's in-`SearchFilter` build, plus the group filter:
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
(`T_M_BUYER_AUTHORITY` is small + already loaded whole in `SearchFilter` → in-memory filter, no new DAL method —
same style as the existing buyer build. Matches how province's cascade behaves for the "all" case.)

### 2. Service — remove the buyer-unit block from `SearchFilter()` (both services)
Delete the `dataResponse.BuyerUnitDdl.Items = resBuyer.Where(...).Select(AuthorityName)...` block (a10 L117-122;
license equivalent). **Keep** the `BuyerGroupDdl` build (the optional parent stays in the main search-filter).
`resBuyer` is still used by `BuyerGroupDdl`, so keep the `GetAllAsync()` call.

### 3. Response model — remove the buyer-unit property (both `...SearchFilterResponse` models)
Remove `[JsonProperty("authority_name_ddl")] public DropdownDDLData BuyerUnitDdl` (a10 `DashboardMoveA10Model` L97-98;
license equivalent) so the main `search-filter` no longer returns `authority_name_ddl`. Keep `authority_group_no_ddl`.

### 4. Controller — new endpoint (both controllers), mirroring the province endpoint
```csharp
[OfficerOnlyFilter]
[SwaggerOperation(Summary = "หน่วยผู้ซื้อ (cascade: ตามกลุ่มหน่วยผู้ซื้อ ; ไม่ส่ง = ทั้งหมด)" + SwaggerOption.OFFICER,
    Tags = new[] { SwaggerTags.DASHBOARD_MOVE_A10 })]
[HttpGet(OFFICER_API + "/dashboard-move-a10/search-filter-buyer-unit")]
[ProducesResponseType(typeof(ResponseResult<DropdownDDLData>), StatusCodes.Status200OK)]
public async Task<IActionResult> DashboardMoveA10BuyerUnitDdlOfficer([FromQuery(Name = "buyer_group")] int? buyerGroup)
{
    try { return await _service.BuyerUnitDdl(buyerGroup); }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error in DashboardMoveA10BuyerUnitDdlOfficer | UserLogon: {UserLogon} | SystemType: {SystemType} | TraderId: {TraderId}", UserLogonClaim, SystemTypeClaim, TraderIdClaim);
        return BadRequest(ModelStateHelper.GetErrors(ErrorMessage.EXCEPTION_ERROR, ResponseStatusCode.EXCEPTION_ERROR));
    }
}
```
(license controller: same with the `dashboard-move-license` route + `SwaggerTags.DASHBOARD_MOVE_LICENSE`.)

### 5. Interface — add `Task<IActionResult> BuyerUnitDdl(int? buyerGroup);` to both `IDashboardMove*Service`.

## Acceptance
- [ ] `GET …/search-filter-buyer-unit` (both dashboards): no `buyer_group` → all units; `buyer_group=1` → only group-1 units.
- [ ] Main `search-filter` no longer returns `authority_name_ddl`; still returns `authority_group_no_ddl` (buyer group).
- [ ] `dotnet build` succeeds; other dropdowns/dashboards/chart/table filtering untouched.
- Deterministic (dropdown-options only, existing source) → Sober-review accept, no live capture.

## Out of scope
- No FE change (FE hand-off: switch หน่วยผู้ซื้อ to the new endpoint + pass the selected buyer group). No change to
  the chart/table `authority_name` filtering or to `authority_group_no_ddl`.

## Tasks
- TASK-018: buyer-unit cascade endpoint + remove from main search-filter (a10 + license).

## Questions
(Jason asks here; Sober answers as `> answer: ...`)
