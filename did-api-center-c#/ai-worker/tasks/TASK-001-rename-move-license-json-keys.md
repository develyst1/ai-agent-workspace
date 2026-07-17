# TASK-001: Rename DASHBOARD_LICENSE_MOVE JSON keys to DB column snake_case

- Source: SPEC-001
- Status: DONE
- Depends on: none

## What to do

Rename the `[JsonProperty("...")]` values on the DASHBOARD_LICENSE_MOVE (อ.10) models to match the
backing DB column in lowercase `snake_case`, per the mapping tables in **SPEC-001** (sections A–D).
This is a **JSON-key rename only** — do NOT change C# property names, service logic, the query DTO,
or the SQL.

**Files to touch:**
1. `Models/Dashboard/DashboardMoveLicenseModel.cs` — edit the `[JsonProperty("...")]` string on:
   - `DashboardMoveLicenseSearchRequest` (SPEC §A — request body, 11 keys).
   - `DashboardMoveLicenseSearchFilterResponse` (SPEC §B — 7 `*_ddl` container keys).
   - `DashboardMoveLicenseChartsResponse` (SPEC §C — 3 container keys only).
   - `DashboardMoveLicenseTableRow` (SPEC §D — 40 keys).
2. `Controllers/DashboardMoveLicenseController.cs` — **CONFIRMED in scope (Q2)**: rename the
   `[FromQuery(Name="...")]` params on the 3 cascade GET endpoints per SPEC-001 §E
   (`region` → `dest_area_name` at line 53; `weapon_category` → `product_type_group_code` at lines 70
   & 88; `unit` → `quantity_unit_id` at line 89). Do NOT rename the C# parameter identifiers, only the
   `Name=` binding string.

**DO NOT TOUCH (hard constraints from SPEC-001):**
- Inner fields of `DashboardChartData` / `DashboardChartCategory` / `DashboardChartSeriesItem`
  (`chartType`/`valueUnit`/`categories`/`series`/`total`/`name`/`value`/`id`/`label`) — **shared with the
  License Book dashboard**; renaming breaks it (out of scope).
- `DropdownDDLData` / `DropdownDDLItem` inner keys (`value_default`/`items`/`value`/`label`) — shared
  generic type used app-wide.
- Any query logic, filter behaviour, values, or the `ResponseResult` envelope.

## Status note

**Both open questions are resolved (stakeholder confirmed 2026-07-17):** the naming rule (Q1) is
approved in full and the cascade query-param rename (Q2) is in scope. **No gating — implement the
complete mapping (SPEC-001 §A–E) as written.** The `†` markers in SPEC-001 are just category tags now,
not pending items.

## Definition of Done

- [x] All `[JsonProperty]` keys on the 4 move-license model classes match SPEC-001 §A–D exactly.
- [x] The 3 cascade `[FromQuery(Name=...)]` params renamed per SPEC-001 §E.
- [x] No C# property name, service, DTO, or SQL change; no shared-class (`DashboardChartData*`,
      `DropdownDDL*`) key changed.
- [x] `dotnet build` succeeds (run from `spf/DidSpf.WebApi.Center` or solution root). **0 Error(s), 184 Warning(s)** (all pre-existing/unrelated).
- [~] Spot-check via Swagger or the `.http` file that one response (e.g. `/dashboard-move-license/table`)
      emits the new keys — **requires running server + real Oracle DB; out of BE brownfield scope.** Verified statically
      instead (successful build + grep: no old keys remain, new keys present). See Implementation Notes → "Not done".

## Implementation Notes

**Done by Jason 2026-07-17.** JSON-key rename only — no C# property names, service, DTO, or SQL touched.

### Files changed (2)

**1. `Models/Dashboard/DashboardMoveLicenseModel.cs`** — edited `[JsonProperty("...")]` strings only:
- **§A `DashboardMoveLicenseSearchRequest`** (11 keys): `dateRange`→`issue_date_range`, `transportTypes`→`move_request_type`,
  `moveTypes`→`transport_type_code`, `companies`→`trader_id`, `region`→`dest_area_name`, `provinces`→`dest_province_name`,
  `buyers`→`authority_group_no`, `buyerUnits`→`authority_name`, `weaponCategory`→`product_type_group_code`,
  `unit`→`quantity_unit_id`, `weapons`→`product_code`. (`DateStart`/`DateEnd` are `[JsonIgnore]` — untouched.)
- **§B `DashboardMoveLicenseSearchFilterResponse`** (7 `*_ddl` containers): `transport_type_ddl`→`move_request_type_ddl`,
  `move_type_ddl`→`transport_type_code_ddl`, `trader_ddl`→`trader_id_ddl`, `region_ddl`→`dest_area_name_ddl`,
  `buyer_group_ddl`→`authority_group_no_ddl`, `buyer_unit_ddl`→`authority_name_ddl`, `weapon_type_ddl`→`product_type_group_code_ddl`.
- **§C `DashboardMoveLicenseChartsResponse`** (3 containers only): `barChartData1`→`bar_chart_data1`,
  `lineChartData`→`line_chart_data`, `barChartData2`→`bar_chart_data2`.
- **§D `DashboardMoveLicenseTableRow`** (all mapped keys per SPEC): `key` unchanged; `docNo`→`license_no`, `date`→`issue_date`,
  `dateFormatted`→`issue_date_formatted`, `expireDate`→`expiry_date`, `purchaseDocument`→`purchase_document`,
  `transportType`→`move_request_type_name`, `moveType`→`transport_type_code_name`, `company`→`trader_name`,
  `buyerGroup`→`authority_group_no`, `buyerGroupLabel`→`authority_group_no_name`, `buyerUnit`→`authority_name`,
  origin block → `origin_place_name`/`origin_address_no`/`origin_building_name`/`origin_moo`/`origin_soi`/`origin_street`/
  `origin_district_name`/`origin_sub_province_name`/`origin_province_name`/`origin_postcode`, dest block →
  `dest_place_name`/`dest_address_no`/`dest_building_name`/`dest_moo`/`dest_soi`/`dest_street`/`dest_district_name`/
  `dest_sub_province_name`/`dest_province_name`/`dest_postcode`/`dest_area_name`, `weapon`→`product_code`,
  `weaponLabel`→`product_name`, `qty`→`quantity`, `moveQty`→`move_qty`, `unit`→`unit_name`.

**2. `Controllers/DashboardMoveLicenseController.cs`** — §E cascade GET query params, renamed the `[FromQuery(Name="...")]`
binding string only (C# parameter identifiers `region`/`weaponCategory`/`unit` kept as-is):
- `:53` `region` → `dest_area_name`
- `:70` `weapon_category` → `product_type_group_code`
- `:88` `weapon_category` → `product_type_group_code`; `:89` `unit` → `quantity_unit_id`

### Hard constraints respected
- **Shared classes untouched:** `DashboardChartData`/`DashboardChartCategory`/`DashboardChartSeriesItem` inner keys
  (`chartType`/`valueUnit`/`categories`/`series`/`total`/`name`/`value`/`id`/`label`) unchanged — shared with License Book dashboard.
- `DropdownDDLData`/`DropdownDDLItem` inner keys (`value_default`/`items`/`value`/`label`) unchanged — app-wide generic type.
- No service/DTO/SQL change; `ResponseResult` envelope untouched.

### Verification (evidence)
- **`dotnet build`** (from `spf/DidSpf.WebApi.Center`): **0 Error(s), 184 Warning(s)** — all warnings pre-existing and in
  unrelated files (UnitOfWorkSPF, SftpService, AuthenticationController, etc.); none from the two files changed here.
- **Static grep:** confirmed **no old camelCase/inverted keys remain** in the model and **no old query-param `Name=`**
  (`region`/`weapon_category`/`unit`) remain in the controller. `[JsonProperty]` count on the model is **68 — identical to
  before the change** (only string literals edited; no field added/removed). New controller bindings verified:
  `dest_area_name`, `product_type_group_code`, `quantity_unit_id`.

### Not done — needs @Sober / stakeholder (DATA REQUEST)
- **Live-response spot-check (DoD item 5)** — hitting `/dashboard-move-license/table` to see the emitted keys/values requires a
  running Center instance connected to the real Oracle DB. Per PROTOCOL (brownfield rule) I don't run the server against a real
  environment. The rename is a Newtonsoft `[JsonProperty]` serialization change verified by successful build + static analysis;
  values/logic are provably unchanged (no C#/service/SQL edits). If a live capture is required for sign-off, please raise it —
  the stakeholder can run the endpoint and drop the JSON into `../project-docs/`.

## Questions

(Jason asks; Sober answers as `> answer: ...`)

## Review

**Verdict: DONE** — Sober (SA), 2026-07-17. Verified the actual code, not just the notes.

- **§A request body (11 keys)** — `Models/Dashboard/DashboardMoveLicenseModel.cs:14-67` matches SPEC-001 §A exactly;
  `DateStart`/`DateEnd` `[JsonIgnore]` preserved.
- **§B dropdown containers (7)** — lines 79-101 match §B exactly.
- **§C chart containers (3)** — lines 148-161: `bar_chart_data1`/`line_chart_data`/`bar_chart_data2` ✓.
- **§D table row (38 props)** — lines 168-288: every key matches §D; `key` unchanged; `weaponLabel`→`product_name`
  (R1 correction) applied; code/label pairs (`authority_group_no` vs `authority_group_no_name`) correct.
- **§E cascade query params** — `Controllers/DashboardMoveLicenseController.cs:53` `dest_area_name`, `:70`/`:88`
  `product_type_group_code`, `:89` `quantity_unit_id`; C# param identifiers (`region`/`weaponCategory`/`unit`) preserved.
- **Hard constraints upheld** — shared `DashboardChartData`/`DashboardChartCategory`/`DashboardChartSeriesItem` inner
  keys (`chartType`/`valueUnit`/`categories`/`series`/`total`/`id`/`label`/`name`/`value`) untouched (lines 107-142);
  `DropdownDDL*` untouched. No C# property-name / service / DTO / SQL change (build green confirms references still bind).
- **Build** — 0 Error(s); warnings all pre-existing/unrelated.
- **Live spot-check (DoD #5)** — correctly deferred per PROTOCOL brownfield rule (no running server against real Oracle).
  Accepted: a `[JsonProperty]` rename is deterministic serialization with zero logic change; successful build + static
  grep + unchanged property count (68) is sufficient sign-off evidence. **No live DB capture required for this change.**

No REWORK items. Matches every acceptance criterion in REQ-001.
