# TASK-022: buyer-unit cascade — accept MULTIPLE buyer-group codes (`int?` → `List<int>`, union) — a10 + license

- Source: SPEC-015 (REQ-015)
- Status: TODO
- Assignee: Jason (BE)
- Depends on: TASK-018

## Goal

Change the `search-filter-buyer-unit` parent from a single `int?` to a `List<int>` of buyer-group codes → return the
**union** of those groups' units. Aligns the cascade with the already-multi-select buyer-group data filter
(`req.Buyers`/`InList`). Backward-compatible (none → all; single → same as today; multiple → union).

## Changes (both dashboards — mirror TASK-018, `List<int>` instead of `int?`)

1. **Service `BuyerUnitDdl`** (`DashboardMoveA10Service` L125 / `DashboardMoveLicenseService` L115):
   signature → `BuyerUnitDdl(List<int>? buyerGroups)`; filter →
   `.Where(b => buyerGroups == null || buyerGroups.Count == 0 || buyerGroups.Contains(b.AuthorityGroupNo))`
   (rest unchanged: `AuthorityName` non-empty, `Distinct()`, `{Value=Label=name}`).
2. **Interface** (`IDashboardMoveA10Service` / `IDashboardMoveLicenseService` L16):
   `Task<IActionResult> BuyerUnitDdl(List<int>? buyerGroups);`
3. **Controller** (both `DashboardMove*Controller` `search-filter-buyer-unit`):
   param `[FromQuery(Name = "buyer_group")] List<int>? buyerGroup` → `_service.BuyerUnitDdl(buyerGroup)`. Route/
   filters/Swagger/try-catch unchanged.

## Must NOT change
Main `search-filter` (`authority_group_no_ddl`), the chart/table `authority_name` data filter
(`InList(req.BuyerUnits, …)`), other cascades/dashboards.

## Definition of Done
- [ ] `search-filter-buyer-unit` (both): none → all units; `?buyer_group=1` → group-1 units (same as today);
      `?buyer_group=1&buyer_group=2` → union (distinct names across both).
- [ ] `dotnet build` succeeds. Paste endpoint + service + build result.

## Implementation Notes
(Jason fills in)

## Questions
(Jason asks; Sober answers as `> answer: ...`)
