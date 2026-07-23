# REQ-013: หน่วยผู้ซื้อ (buyer unit) cascades from กลุ่มหน่วยผู้ซื้อ (buyer group) — its own endpoint, optional parent

- Status: READY_FOR_SA
- Priority: MEDIUM
- Requested: 2026-07-20 by stakeholder (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal

Today **กลุ่มหน่วยผู้ซื้อ (ผู้รับปลายทาง)** (buyer group) and **หน่วยผู้ซื้อ (ผู้รับปลายทาง)** (buyer unit) are
both flat dropdowns in the main `search-filter`. Stakeholder wants them **related/cascading like ภาค → จังหวัด**
(region → province): selecting a buyer group filters the buyer units to that group. The parent (buyer group)
is **optional** (like ภาค). And: **separate หน่วยผู้ซื้อ out of the main `search-filter`** into its own cascade
endpoint (per the established design rule — related dropdowns are their own `search-filter-*` endpoints).
Stakeholder: "อยากให้ relate เหมือน ภาค/จังหวัด แต่เป็น optional parent filter, ช่วยแยกออกมาจาก search filter ให้ก่อน."

## Requirement

1. Add a **new cascade endpoint** for the buyer unit, e.g.
   `GET /dashboard-move-{a10,license}/search-filter-buyer-unit?buyer_group={AUTHORITY_GROUP_NO}` → returns
   `DropdownDDLData` of buyer units.
2. **Optional parent:** no `buyer_group` → return **all** buyer units; `buyer_group` given → return **only that
   group's** units. (Same semantics as จังหวัด←ภาค.)
3. **Remove หน่วยผู้ซื้อ (`authority_name_ddl`) from the main `search-filter` response** (it becomes the cascade
   endpoint). กลุ่มหน่วยผู้ซื้อ stays in the main search-filter as the (optional) parent.
4. Reuse the existing buyer-authority source (`T_M_BUYER_AUTHORITY`: `AUTHORITY_GROUP_NO` = group, unit
   name/id) — same source the table/chart already use.

## Acceptance Criteria

- [ ] New `search-filter-buyer-unit` endpoint: no group → all units; group → filtered to that group.
- [ ] Main `search-filter` no longer returns หน่วยผู้ซื้อ (`authority_name_ddl`); still returns กลุ่มหน่วยผู้ซื้อ.
- [ ] `dotnet build` succeeds; other dropdowns/dashboards untouched.

## Constraints

- Backend: `DidSpf.WebApi.Center` — the two move dashboards' controller + service (`SearchFilter()` +
  new cascade method), mirroring the province←region cascade. Scope = a10 + license-move (both have this pair).

## Out of Scope

- No frontend change (FE will call the new cascade endpoint — hand-off note). No change to กลุ่มหน่วยผู้ซื้อ
  itself, or to the actual chart/table data filtering (this is dropdown-options only).

## Questions

- Q1 (PM for SA): confirm the buyer group↔unit link in `T_M_BUYER_AUTHORITY` (group = `AUTHORITY_GROUP_NO`;
  unit = `AUTHORITY_NAME`/id) and the exact new endpoint param/route name (propose
  `search-filter-buyer-unit?buyer_group=`).
- Q2 (PM→stakeholder): scope = **both move dashboards** (a10 + license-move)? *(Default: both.)*
- FE hand-off: the frontend must switch หน่วยผู้ซื้อ to the new cascade endpoint + pass the selected buyer group.
