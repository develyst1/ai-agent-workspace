# TASK-005: Scaffold DASHBOARD_MOVE_A10 (controller + models + search-filter + cascades)

- Source: SPEC-005
- Status: DONE
- Depends on: none  (UNBLOCKED — mirrors move-license; independent of the DATA REQUESTs)

## What to do

Stand up the new `dashboard-move-a10` officer dashboard backend by **mirroring `DashboardMoveLicense*`**
(controller + service + models + DI), delivering the **search-filter + 3 cascade dropdowns** now. The
chart/table *data* and the ประเภทการขนย้าย dropdown are separate tasks (TASK-006/007) — leave clean
seams for them.

**Create (new files, copy `DashboardMoveLicense*` as the base and rename):**
1. `Controllers/DashboardMoveA10Controller.cs` — 6 officer endpoints per SPEC-005 (search-filter,
   search-filter-province/-unit/-weapon, chart POST, table POST). `[OfficerOnlyFilter]`, `SwaggerTags` new
   tag `DASHBOARD_MOVE_A10` (add to `TextConstant.SwaggerTags`). Same try/catch + logging shape as
   `DashboardMoveLicenseController`. For now the chart/table actions call the service methods that
   TASK-006 will fill (stub returning an empty `ResponseResult` list/object is fine, clearly marked
   `// TASK-006`).
2. `Models/Dashboard/DashboardMoveA10Model.cs` — mirror `DashboardMoveLicenseModel`:
   - `DashboardMoveA10SearchRequest` — same filters as move-license **but the date range is the move
     date** → key `move_date_range` (keep `DateStart/DateEnd` `[JsonIgnore]` helpers, renamed to move).
   - `DashboardMoveA10SearchFilterResponse` — same `*_ddl` containers (snake_case keys per SPEC-001 §B
     convention).
   - `DashboardMoveA10ChartsResponse` — 3 `DashboardChartData` containers: `top5_by_buyer_unit`,
     `by_buyer_group`, `by_trader` (reuse the SHARED `DashboardChartData` — do NOT redefine it).
   - `DashboardMoveA10TableRow` — move-license table-row keys **plus** `move_date`, `move_seq_no`,
     `moved_qty` (declare them now; TASK-006 populates them — default 0/empty until then).
3. `Services/DashboardMoveA10Service.cs` + `Services/Interfaces/IDashboardMoveA10Service.cs` — mirror the
   move-license service. Implement now: `SearchFilter()`, `ProvinceDdl()`, `UnitDdl()`, `WeaponDdl()`.
   Stub `ChartData()`/`TableData()` (return empty via the envelope, `// TASK-006`).
   - **ประเภทการขออนุญาต dropdown (MOVE_REQUEST_TYPE):** build from a fixed map
     `{ 0: "หน่วยงานตามมาตรา 7", 1: "ขาย/ขนย้ายนอกหน่วยงาน" }` (DATADIC enum). Value = `"0"/"1"`, label = Thai.
   - **ประเภทการขนย้าย dropdown (TRANSPORT_TYPE_CODE):** leave an **empty** `DropdownDDLData` for now with a
     `// TASK-007 (needs T_R_TRANSPORT_TYPE entity)` note — do NOT invent a source.
   - All other dropdowns/cascades: copy the move-license logic verbatim (trader, region, province, unit,
     weapon, buyer group/unit, weapon-type from `TMProductTypeGroupRepo`).
4. `Program.cs` — register `AddScoped<IDashboardMoveA10Service, DashboardMoveA10Service>()` next to the
   move-license registration.

**DO NOT:** touch move-license/license-book/other dashboards or the shared `DashboardChartData*` /
`DropdownDDL*` classes; invent a source for the movement fields or the ประเภทการขนย้าย dropdown; run any DB.

## Definition of Done

- [x] The 6 endpoints exist and compile; search-filter + 3 cascades return real data (mirroring
      move-license); ประเภทการขออนุญาต dropdown returns the 0/1 enum; ประเภทการขนย้าย returns empty (TASK-007).
- [x] Models/service/controller/DI in place; chart/table stubbed with clear `// TASK-006` seams; the 3
      movement keys (`move_date`/`move_seq_no`/`moved_qty`) declared on the table row.
- [x] Shared classes untouched; no other dashboard changed.
- [x] `dotnet build` succeeds. **Build succeeded. 0 Error(s).**

## Implementation Notes

**Done by Jason 2026-07-17.** Scaffolded `dashboard-move-a10` by mirroring `DashboardMoveLicense*`. Delivered
search-filter + 3 cascades now; chart/table stubbed with `// TASK-006` seams; ประเภทการขนย้าย dropdown left
empty with `// TASK-007`.

### Files created (4)
1. **`Controllers/DashboardMoveA10Controller.cs`** — 6 officer endpoints (`[OfficerOnlyFilter]`, base
   `api/v1/officer`), same try/catch+logging shape as `DashboardMoveLicenseController`:
   `search-filter` (GET), `search-filter-province` (GET `?dest_area_name=`), `search-filter-unit`
   (GET `?product_type_group_code=`), `search-filter-weapon` (GET `?product_type_group_code=&quantity_unit_id=`),
   `chart` (POST), `table` (POST). Swagger tag `SwaggerTags.DASHBOARD_MOVE_A10` (new).
2. **`Models/Dashboard/DashboardMoveA10Model.cs`** — `DashboardMoveA10SearchRequest` (date range key
   `move_date_range`, `MoveDateStart/MoveDateEnd` `[JsonIgnore]`; all other filter keys = move-license
   verbatim); `DashboardMoveA10SearchFilterResponse` (7 `*_ddl` snake_case containers); `DashboardMoveA10ChartsResponse`
   (3 SHARED `DashboardChartData` containers: `top5_by_buyer_unit`, `by_buyer_group`, `by_trader`);
   `DashboardMoveA10TableRow` (move-license table-row keys + 3 movement keys `move_date`/`move_seq_no`/`moved_qty`).
3. **`Services/DashboardMoveA10Service.cs`** + **`Services/Interfaces/IDashboardMoveA10Service.cs`** — mirror the
   move-license service. Implemented: `SearchFilter()`, `ProvinceDdl()`, `UnitDdl()`, `WeaponDdl()` (cascades copied
   verbatim). ประเภทการขออนุญาต dropdown built from fixed `MOVE_REQUEST_TYPE_MAP` `{ "0":"หน่วยงานตามมาตรา 7",
   "1":"ขาย/ขนย้ายนอกหน่วยงาน" }`. ประเภทการขนย้าย = empty `List<DropdownDDLItem>()` (`// TASK-007`). Weapon-type =
   `TMProductTypeGroupRepo.GetDataAll()` (all PTG groups from DB, value=code, label=name). `ChartData()`/`TableData()`
   return empty envelope objects (`// TASK-006`).
4. **`Program.cs`** — `AddScoped<IDashboardMoveA10Service, DashboardMoveA10Service>()` next to the move-license reg.

### Only-touched existing files (2, additive)
- `Utils/TextConstant.cs` — added 1 SwaggerTag `DASHBOARD_MOVE_A10`.
- `Program.cs` — added 1 DI line.
No move-license / license-book / other dashboard code changed; shared `DashboardChartData*` / `DropdownDDL*`
classes untouched.

### Verification (evidence)
- **`dotnet build`** (from `spf/DidSpf.WebApi.Center`): **Build succeeded. 0 Error(s).**
- **Static grep:** 6 `dashboard-move-a10/*` endpoints present; 4 new files created; `move_date`/`move_seq_no`/
  `moved_qty` declared on the table row; `// TASK-006` (chart+table) and `// TASK-007` (transport-type dropdown)
  seams marked in the service.
- Pre-verified all reused repos exist (mirror of move-license, already proven building): `TMProductTypeGroupRepo`,
  `TMTraderRepo`, `VProvinceViewRepo`, `TMPrimaryBuyerAuthorityRepo`, `TMUnitRepo`, `VwProductRepo`.
- Live-response check deferred (brownfield — needs running Center + Oracle). Search-filter/cascade logic is a
  verbatim copy of the already-shipped move-license paths.

## Questions

- **Q (move_qty vs moved_qty — one reasoned deviation, please confirm).** SPEC-005/TASK-005 say the A10 table
  row = "move-license table-row keys **plus** `move_date`/`move_seq_no`/`moved_qty`". The move-license row's last-
  before-unit key is `move_qty` (its own placeholder for "จำนวนขนย้ายจริง", always 0 — the same DATA GAP this
  dashboard exists to fill). I **omitted `move_qty`** on the A10 row because the new `moved_qty` **is** that field,
  properly named, and the frontend capture (col 14 = จำนวนที่ขนย้าย) shows only one such column — carrying both
  would be two identical-meaning keys, one dead. If you want a strict verbatim mirror instead, I'll add `move_qty`
  back (one line). Flagging rather than deciding silently.
  > answer (Sober, 2026-07-20): **Agreed — drop `move_qty`, keep `moved_qty`.** `move_qty` was
  > move-license's always-0 placeholder for exactly this DATA GAP; this dashboard fills the gap with a
  > real `moved_qty` (← INFORM_MOVE_DTL.QUANTITY). Carrying both = one dead key. Good call flagging it.
  > One alignment for TASK-006 (not a TASK-005 defect): the real column is **`MOVE_SEQ`**, so rename the
  > placeholder key `move_seq_no` → **`move_seq`** to match the DB-column convention when you populate it.

## Review

**Verdict: DONE — Sober (SA), 2026-07-20.** Reviewed the scaffold code (model + service):
- `DashboardMoveA10Model.cs`: request keys mirror move-license SPEC-001 §A with the date key correctly =
  `move_date_range` (+ `MoveDateStart/End` `[JsonIgnore]`); dropdown containers §B; 3 chart containers
  (`top5_by_buyer_unit`/`by_buyer_group`/`by_trader`) over the SHARED `DashboardChartData`; table row =
  move-license keys + `move_date`/`move_seq_no`/`moved_qty`. `move_qty` correctly omitted.
- `DashboardMoveA10Service.cs`: SearchFilter + 3 cascades are a verbatim move-license mirror; ประเภทการ
  ขออนุญาต = `MOVE_REQUEST_TYPE_MAP` 0/1 enum (the design improvement); ประเภทการขนย้าย left empty with a
  clear `// TASK-007` note (no guessing); weapon-type from `TMProductTypeGroupRepo`. Chart/table stubbed
  with `// TASK-006` seams.
- Shared `DashboardChartData*`/`DropdownDDL*` untouched; only additive `TextConstant` SwaggerTag + 1 DI
  line; other dashboards untouched. Build 0 errors.
- Live capture deferred per brownfield — search-filter/cascades are a copy of already-shipped move-license
  paths; conclusive from code.

Excellent scaffold. TASK-006/007 now have clean seams to fill (both data-unblocked as of 2026-07-20 —
see the revised SPEC-005).
