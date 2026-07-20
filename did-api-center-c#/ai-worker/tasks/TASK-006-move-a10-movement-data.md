# TASK-006: DASHBOARD_MOVE_A10 chart + table on the INFORM_MOVE backbone

- Source: SPEC-005 (revised 2026-07-20 — data resolved)
- Status: TODO  (UNBLOCKED — DATA REQUEST 1 answered: INFORM_MOVE family)
- Depends on: TASK-005 (DONE)

## What to do

Implement the real table + charts for `dashboard-move-a10`, sourced from the **INFORM_MOVE family** per
**SPEC-005 → "Movement data backbone"**. This replaces the `// TASK-006` stubs in `DashboardMoveA10Service`.

### 1. SPF DAL — add the movement source (use `spf-add-entity` where an entity is needed)
- Add entities/repo for `T_T_INFORM_MOVE_DTL` (+ `T_T_INFORM_MOVE` header) and a query-result DTO
  `DashboardMoveA10QueryResult` (grain = per moved item). Wire the repo into `IUnitOfWorkSPF`/`UnitOfWorkSPF`.
- Add a `GetMoveA10Dashboard(string moveDateStart, string moveDateEnd)` using `QueryJoinAsync<DashboardMoveA10QueryResult>`
  with the exact joins in SPEC-005 (DTL + header + `T_M_TRADER` + `T_M_UNIT` + `T_M_PRIMARY_BUYER_AUTHORITY`
  + license back-join `T_T_LICENSE`/`T_T_LICENSE_MOVE`/`V_PROVINCE`/`T_T_LICENSE_DTL`). Filter the
  **move-date range on `DTL.MOVE_DATE`** in SQL (mirror `GetMoveLicenseDashboard`'s date-range pattern);
  add `AND L.FORM_ID = 10` (อ.10 scoping) on the license back-join.

### 2. Service — `TableData()` / `ChartData()` (mirror `DashboardMoveLicenseService`)
- Map each row to `DashboardMoveA10TableRow`: license-side keys as in move-license, **plus**
  `move_date` (`MOVE_DATE`, `yyyy-MM-dd`/TH as the frontend expects), `move_seq` (`MOVE_SEQ`),
  `moved_qty` (`DTL.QUANTITY`); `quantity` = `ALLOWED_QUANTITY` (permitted). `move_request_type_name`
  from the 0/1 map on `INFORM_REQUEST_TYPE`; `transport_type_code_name` from `LDTL.TRANSPORT_TYPE_CODE`
  (via TASK-007's `T_R_TRANSPORT_TYPE` — until it lands, leave a resolvable seam / code fallback).
- **Rename the model key** `move_seq_no` → **`move_seq`** on `DashboardMoveA10TableRow` (matches column
  `MOVE_SEQ`; SPEC-005).
- Reuse move-license's LINQ multi-select filters (`InList`/`MatchEq`) for the remaining filters (companies,
  buyers, buyer units, region, provinces, weapon category, unit, weapons).
- Charts (measure = `SUM(moved_qty)`): `top5_by_buyer_unit` (group buyer unit, take top 5),
  `by_buyer_group` (group buyer-group label), `by_trader` (group trader). Reuse the shared
  `DashboardChartData`/`BuildChart` shape.

### 3. Verify the SPEC-005 assumptions on first run (flag, don't guess)
- `REF_LICENSE_NO` ↔ `T_T_LICENSE.LICENSE_NO` join actually matches; `INFORM_REQUEST_TYPE` values are the
  0/1 enum. If either is off, report back to @Sober (don't silently patch semantics).

## Definition of Done
- [ ] Table returns real `move_date` / `move_seq` / `moved_qty` (not 0/blank) + all license-side columns.
- [ ] Move-date range filter + every page filter work; charts measure actual moved qty.
- [ ] `move_seq_no` key renamed to `move_seq`; shared classes / other dashboards untouched.
- [ ] `dotnet build` succeeds. Paste output + note any assumption that didn't hold.

## Implementation Notes / Questions / Review
(Jason fills Implementation Notes; Sober fills Review.)
