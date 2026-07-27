# TASK-032: DASHBOARD_TRACKING — add the missing weapon cascade endpoints (search-filter-unit + search-filter-weapon)

- Source: REQ-017 addendum (stakeholder: tracking search-filter must have the weapon cascade like move-license/a10).
  SA-owned (Sober). Reopens REQ-017 for this one gap; all other parts captured/accepted.
- Status: DONE
- Assignee: Jason (BE)
- Depends on: TASK-029

## Review — Verdict: DONE — Sober (SA), 2026-07-21
Grep-verified verbatim a10 reuse: controller `search-filter-unit`(L85)→`UnitDdl`(L91), `search-filter-weapon`(L102)→
`WeaponDdl(weaponCategory, unit)`(L108); service `UnitDdl`(L161: empty→`TMUnitRepo.GetAllAsync`, else
`VwProductRepo.GetDataByProductTypeGroupCode`) + `WeaponDdl`(L193→`VwProductRepo.GetByTypeGroupAndUnit`) — same repo
calls/logic as a10; interface has both. Backbone/query/charts/other cascades untouched; DID_SPF; build 0 err. → REQ-017
fully code-complete; the 2-cascade re-capture accepts → REQ-017 DELIVERED.

## Gap
dashboard-tracking exposes only `search-filter` / `-province` / `-buyer-unit`. It's MISSING the หน่วยนับ←ประเภทอาวุธ and
อาวุธ←(ประเภทอาวุธ+หน่วยนับ) cascades that a10/move-license have. Pure reuse — the a10 methods + repo queries already exist.

## Change — mirror `DashboardMoveA10*` verbatim

1. **Service `DashboardTrackingService`** — add two methods, **copied from `DashboardMoveA10Service`**:
   - `UnitDdl(string weaponCategory)`: empty → all units (`_uowSPF.TMUnitRepo.GetAllAsync()` → `{Value=Id, Label=UnitName}`);
     non-empty → distinct units of that group (`_uowSPF.VwProductRepo.GetDataByProductTypeGroupCode(weaponCategory)`,
     active only, `QuantityUnitId1/2` deduped).
   - `WeaponDdl(string weaponCategory, int unitId)`: both required (else empty) → `_uowSPF.VwProductRepo.GetByTypeGroupAndUnit(
     weaponCategory, unitId)` → `{Value=ProductCode, Label=ProductNameLabel|ProductName}`.
2. **Interface `IDashboardTrackingService`** — add `UnitDdl(string)` + `WeaponDdl(string,int)`.
3. **Controller `DashboardTrackingController`** — add two officer endpoints, **mirroring a10**:
   - `[HttpGet(OFFICER_API + "/dashboard-tracking/search-filter-unit")]` `([FromQuery(Name="product_type_group_code")] string weaponCategory)`
     → `_service.UnitDdl(weaponCategory ?? "")`.
   - `[HttpGet(OFFICER_API + "/dashboard-tracking/search-filter-weapon")]`
     `([FromQuery(Name="product_type_group_code")] string weaponCategory, [FromQuery(Name="quantity_unit_id")] int unit)`
     → `_service.WeaponDdl(weaponCategory ?? "", unit)`.
   Standard `[OfficerOnlyFilter]`, Swagger tag `DASHBOARD_TRACKING`, `ProducesResponseType<DropdownDDLData>`, try/catch + `_logger.LogError`.

## Must NOT change
The tracking backbone/query (TASK-029/030/031), the existing search-filter/-province/-buyer-unit, move-status logic,
charts, other dashboards. All DID_SPF. (Cascade uses `VwProductRepo` on-demand, same as a10 — fine; the REQ-012 slim
joins were for the main dashboard query, not the dropdowns.)

## Definition of Done
- [x] `dashboard-tracking/search-filter-unit` + `search-filter-weapon` exist and mirror a10 (no product filter → unit list;
      type→units; type+unit→weapons). Interface + controller + service wired. `dotnet build` succeeds.
- [ ] (Acceptance, live capture) the two cascades return the same as a10's for the same inputs → REQ-017 DELIVERED.

## Implementation Notes
(Jason — 2026-07-24)

Pure reuse — copied `UnitDdl`/`WeaponDdl` verbatim from license-move/a10 (same `TMUnitRepo`/`VwProductRepo` methods).
No change to the tracking backbone/query/charts. All DID_SPF.

1. **`IDashboardTrackingService`** — added `Task<IActionResult> UnitDdl(string weaponCategory)` +
   `WeaponDdl(string weaponCategory, int unitId)`.
2. **`DashboardTrackingService`** — added both methods (verbatim from license-move):
   - `UnitDdl`: empty category → all units (`TMUnitRepo.GetAllAsync` → `{Value=Id, Label=UnitName}`); non-empty →
     `VwProductRepo.GetDataByProductTypeGroupCode`, active only, `QuantityUnitId1/2` deduped via `HashSet<int>`.
   - `WeaponDdl`: both required (else empty) → `VwProductRepo.GetByTypeGroupAndUnit` → `{Value=ProductCode,
     Label=ProductNameLabel|ProductName}`.
3. **`DashboardTrackingController`** — added two officer GET endpoints mirroring a10:
   - `.../search-filter-unit?product_type_group_code=` → `UnitDdl`.
   - `.../search-filter-weapon?product_type_group_code=&quantity_unit_id=` → `WeaponDdl`.
   `[OfficerOnlyFilter]`, tag `DASHBOARD_TRACKING`, `ProducesResponseType<DropdownDDLData>`, standard try/catch + `_logger.LogError`.

### Verification
- `dotnet build` (Center) → **Build succeeded, 0 Error(s)** (pre-existing warnings only).
- Grep controller `search-filter-unit|search-filter-weapon` → both present; service has `UnitDdl`/`WeaponDdl`.
- Tracking backbone/query (TASK-029/030/031), existing search-filter/-province/-buyer-unit, move-status, charts, other
  dashboards untouched. Cascade uses `VwProductRepo` on-demand (same as a10 — REQ-012 slim joins were only for the main query).
- Static-only per brownfield rule; parity with a10's cascades for same inputs = stakeholder live capture → then REQ-017 DELIVERED.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
