# TASK-022: buyer-unit cascade — accept MULTIPLE buyer-group codes (`int?` → `List<int>`, union) — a10 + license

- Source: SPEC-015 (REQ-015)
- Status: DONE
- Assignee: Jason (BE)
- Depends on: TASK-018

## Review — Verdict: DONE — Sober (SA), 2026-07-21
Grep-verified all 8 sites (both dashboards): controllers `[FromQuery(Name = "buyer_group")] List<int>? buyerGroup` →
`BuyerUnitDdl(buyerGroup)`; services `BuyerUnitDdl(List<int>? buyerGroups)` with
`.Where(b => buyerGroups == null || buyerGroups.Count == 0 || buyerGroups.Contains(b.AuthorityGroupNo))`; interfaces
updated. Union semantics correct (none/empty → all; else IN); `AuthorityName` non-empty + `Distinct()` preserved
(dedups a name shared by >1 group). Backward-compatible (single `?buyer_group=1` → 1-element list → same as today).
Build 0 errors. Main search-filter / chart-table data filter / other cascades untouched. Options-only + established
pattern → **accepted on Sober review, no live capture. REQ-015 DELIVERED.**

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
- [x] `search-filter-buyer-unit` (both): none → all units; `?buyer_group=1` → group-1 units (same as today);
      `?buyer_group=1&buyer_group=2` → union (distinct names across both).
- [x] `dotnet build` succeeds. **Build succeeded. 0 Error(s).**

## Implementation Notes

**Done by Jason 2026-07-20.** `int?` → `List<int>?` union on the buyer-unit cascade, both dashboards. 3 edits × 2:
1. **Service `BuyerUnitDdl`** (`DashboardMoveA10Service` L125 / `DashboardMoveLicenseService` L115): signature →
   `BuyerUnitDdl(List<int>? buyerGroups)`; filter → `.Where(b => buyerGroups == null || buyerGroups.Count == 0 ||
   buyerGroups.Contains(b.AuthorityGroupNo))`. Rest unchanged (`AuthorityName` non-empty, `Distinct()`, `{Value=Label=name}`).
2. **Interface** (both): `Task<IActionResult> BuyerUnitDdl(List<int>? buyerGroups);`.
3. **Controller** (both `search-filter-buyer-unit`): `[FromQuery(Name = "buyer_group")] List<int>? buyerGroup` →
   `_service.BuyerUnitDdl(buyerGroup)`. Route/filters/Swagger/try-catch unchanged.

Backward-compatible: no param → all; `?buyer_group=1` → group-1 (same as today); `?buyer_group=1&buyer_group=2` →
union of both groups' units (distinct). Aligns the cascade with the already-multi-select buyer-group data filter
(`req.Buyers`/`InList`).

**Unchanged:** main `search-filter` (`authority_group_no_ddl`), the chart/table `authority_name` data filter
(`InList(req.BuyerUnits, …)`), other cascades/dashboards.

**Verified:** `dotnet build` (from `spf/DidSpf.WebApi.Center`): **Build succeeded. 0 Error(s).** Grep: `BuyerUnitDdl(List<int>?
buyerGroups)` + `buyerGroups.Contains(...)` in both services; `List<int>? buyerGroups` in both interfaces;
`[FromQuery(Name = "buyer_group")] List<int>? buyerGroup` in both controllers. Deterministic DDL cascade change,
established pattern → no live capture needed.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
