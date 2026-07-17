# SPEC-001: DASHBOARD_LICENSE_MOVE — align JSON keys to DB column names

- Source: REQ-001
- Status: DONE

## Overview

Pure **JSON-key rename** on the DASHBOARD_LICENSE_MOVE (อ.10) endpoints so every field a
frontend consumes/sends is named after its backing Oracle column in lowercase `snake_case`.
Values, query logic, filtering, paging and the `ResponseResult` envelope are untouched.

**Key finding — the change is almost entirely `[JsonProperty("...")]` string edits in ONE file**
(`Models/Dashboard/DashboardMoveLicenseModel.cs`). C# property names, the service
(`DashboardMoveLicenseService.cs`), the DTO (`DashboardMoveLicenseQueryResult.cs`) and the SQL
(`TTLicenseDtlRepository.GetMoveLicenseDashboard`) do **not** change. The controller changes only
if we also rename the GET cascade query-param names (see Q on cascade params).

**Column names are authoritative from the repository SQL** — `GetMoveLicenseDashboard`
(`TTLicenseDtlRepository.cs:186-241`) selects each column with an explicit alias
(`L.LICENSE_NO AS LicenseNo`, `LM.ORIGIN_PLACE_NAME AS OriginPlaceName`, …), so the physical
column behind every response field is known from code. **No DATA REQUEST / DB access is needed.**

## Naming rules (CONFIRMED by stakeholder 2026-07-17 — REQ-001 Q1)

- **R1 — direct column value** → `snake_case(COLUMN)`. (e.g. `LICENSE_NO` → `license_no`)
- **R2 — resolved display name of a code column** (field holds the looked-up name, not the code)
  → `snake_case(COLUMN) + "_name"`. (e.g. name resolved from `MOVE_REQUEST_TYPE` → `move_request_type_name`)
- **R3 — computed / no backing column**:
  - display transform of a column → `snake_case(COLUMN) + "_formatted"` (e.g. TH-formatted ISSUE_DATE → `issue_date_formatted`)
  - genuinely no column → descriptive `snake_case` of the current meaning (`key`, `purchase_document`, `move_qty`).
- **R4 — structural containers** (dropdown `*_ddl` slots, chart containers): stem = the column the
  slot represents, keep the structural suffix. Chart containers with no column → mechanical
  camelCase→snake_case.
- **HARD CONSTRAINT — do NOT rename shared classes.** `DashboardChartData`,
  `DashboardChartCategory`, `DashboardChartSeriesItem` are **shared with the License Book dashboard**
  (`DashboardLicenseBookModel.cs:103` — "ใช้ร่วมกับ dashboard-move-license"). Renaming their inner
  `[JsonProperty]` (`chartType`/`valueUnit`/`categories`/`series`/`total`/`name`/`value`/`id`/`label`)
  would change the License Book dashboard response too → **out of scope per REQ**. Leave them as-is.
  They also have no backing DB column.

## Field mapping

Legend: **Cat** = R1 direct / R2 label-of-code / R3 computed / R4 container. "src" = service source
→ SQL column. Keys marked **†** are non-direct (R2/R3/R4); all **confirmed by stakeholder
2026-07-17** (REQ-001 Q1) — no longer pending.

### A. Request body — `DashboardMoveLicenseSearchRequest` (Model lines 14-67)

| Current key | C# prop | Filters column | New key | Cat |
|---|---|---|---|---|
| `dateRange` | DateRange | ISSUE_DATE (range) | `issue_date_range` † | R3 |
| `transportTypes` | TransportTypes | MOVE_REQUEST_TYPE | `move_request_type` | R1 |
| `moveTypes` | MoveTypes | TRANSPORT_TYPE_CODE | `transport_type_code` | R1 |
| `companies` | Companies | TRADER_ID | `trader_id` | R1 |
| `region` | Region | V_PROVINCE.AREA_NAME (dest) | `dest_area_name` † | R1/ctx |
| `provinces` | Provinces | DEST_PROVINCE_NAME | `dest_province_name` | R1 |
| `buyers` | Buyers | AUTHORITY_GROUP_NO | `authority_group_no` | R1 |
| `buyerUnits` | BuyerUnits | AUTHORITY_NAME | `authority_name` | R1 |
| `weaponCategory` | WeaponCategory | PRODUCT_TYPE_GROUP_CODE | `product_type_group_code` | R1 |
| `unit` | Unit | QUANTITY_UNIT_ID | `quantity_unit_id` | R1 |
| `weapons` | Weapons | PRODUCT_CODE | `product_code` | R1 |

`DateStart`/`DateEnd` are `[JsonIgnore]` — no change.

### B. Dropdown response — `DashboardMoveLicenseSearchFilterResponse` (Model lines 79-101)

Each `*_ddl` slot holds the options for one filter. Stem = the column it filters (R4).
Note: the current `transport_type_ddl` actually carries MOVE_REQUEST_TYPE options and
`move_type_ddl` carries TRANSPORT_TYPE_CODE options (frontend named them inverted) — the new
names fix that.

| Current key | Options for | New key † | 
|---|---|---|
| `transport_type_ddl` | MOVE_REQUEST_TYPE | `move_request_type_ddl` |
| `move_type_ddl` | TRANSPORT_TYPE_CODE | `transport_type_code_ddl` |
| `trader_ddl` | TRADER_ID | `trader_id_ddl` |
| `region_ddl` | AREA_NAME (dest) | `dest_area_name_ddl` |
| `buyer_group_ddl` | AUTHORITY_GROUP_NO | `authority_group_no_ddl` |
| `buyer_unit_ddl` | AUTHORITY_NAME | `authority_name_ddl` |
| `weapon_type_ddl` | PRODUCT_TYPE_GROUP_CODE | `product_type_group_code_ddl` |

Inner `DropdownDDLData`/`DropdownDDLItem` keys (`value_default`, `items`, `value`, `label`) are a
**shared generic dropdown type used by ~40 files** — already snake_case, **not renamed** (out of scope,
would ripple app-wide).

### C. Chart response — `DashboardMoveLicenseChartsResponse` (Model lines 148-161)

Container keys only (this class is NOT shared). No backing column → mechanical snake_case (R4).

| Current key | Meaning | New key † |
|---|---|---|
| `barChartData1` | by purchase document (bar-vertical) | `bar_chart_data1` |
| `lineChartData` | by buyer group (pie) | `line_chart_data` |
| `barChartData2` | by entrepreneur (bar-horizontal) | `bar_chart_data2` |

Inner chart fields: **UNCHANGED** (shared classes — see HARD CONSTRAINT).

### D. Table row — `DashboardMoveLicenseTableRow` (Model lines 168-288)

| Current key | src → column | New key | Cat |
|---|---|---|---|
| `key` | row index | `key` (unchanged) † | R3 |
| `docNo` | LicenseNo → L.LICENSE_NO | `license_no` | R1 |
| `date` | IssueDate (ISO) → L.ISSUE_DATE | `issue_date` | R1 |
| `dateFormatted` | IssueDate (TH) → derived ISSUE_DATE | `issue_date_formatted` † | R3 |
| `expireDate` | ExpiryDate → L.EXPIRY_DATE | `expiry_date` | R1 |
| `purchaseDocument` | const "ไม่ระบุ" → none | `purchase_document` † | R3 |
| `transportType` | name(MOVE_REQUEST_TYPE) | `move_request_type_name` † | R2 |
| `moveType` | name(DTL.TRANSPORT_TYPE_CODE) | `transport_type_code_name` † | R2 |
| `company` | TraderName → L.TRADER_NAME | `trader_name` | R1 |
| `buyerGroup` | BuyerGroupNo → BA.AUTHORITY_GROUP_NO | `authority_group_no` | R1 |
| `buyerGroupLabel` | name(AUTHORITY_GROUP_NO) | `authority_group_no_name` † | R2 |
| `buyerUnit` | BuyerUnitName → NVL(BA.AUTHORITY_NAME, DTL.AUTHORITY_NAME) | `authority_name` | R1 |
| `originPlace` | LM.ORIGIN_PLACE_NAME | `origin_place_name` | R1 |
| `originAddressNo` | LM.ORIGIN_ADDRESS_NO | `origin_address_no` | R1 |
| `originBuilding` | LM.ORIGIN_BUILDING_NAME | `origin_building_name` | R1 |
| `originMoo` | LM.ORIGIN_MOO | `origin_moo` | R1 |
| `originSoi` | LM.ORIGIN_SOI | `origin_soi` | R1 |
| `originRoad` | OriginStreet → LM.ORIGIN_STREET | `origin_street` | R1 |
| `originSubDistrict` | OriginDistrictName → LM.ORIGIN_DISTRICT_NAME | `origin_district_name` | R1 |
| `originDistrict` | OriginSubProvinceName → LM.ORIGIN_SUB_PROVINCE_NAME | `origin_sub_province_name` | R1 |
| `originProvince` | LM.ORIGIN_PROVINCE_NAME | `origin_province_name` | R1 |
| `originPostcode` | LM.ORIGIN_POSTCODE | `origin_postcode` | R1 |
| `destinationPlace` | LM.DEST_PLACE_NAME | `dest_place_name` | R1 |
| `destinationAddressNo` | LM.DEST_ADDRESS_NO | `dest_address_no` | R1 |
| `destinationBuilding` | LM.DEST_BUILDING_NAME | `dest_building_name` | R1 |
| `destinationMoo` | LM.DEST_MOO | `dest_moo` | R1 |
| `destinationSoi` | LM.DEST_SOI | `dest_soi` | R1 |
| `destinationRoad` | DestStreet → LM.DEST_STREET | `dest_street` | R1 |
| `destinationSubDistrict` | DestDistrictName → LM.DEST_DISTRICT_NAME | `dest_district_name` | R1 |
| `destinationDistrict` | DestSubProvinceName → LM.DEST_SUB_PROVINCE_NAME | `dest_sub_province_name` | R1 |
| `destinationProvince` | LM.DEST_PROVINCE_NAME | `dest_province_name` | R1 |
| `destinationPostcode` | LM.DEST_POSTCODE | `dest_postcode` | R1 |
| `destinationRegion` | DestRegionName → VP.AREA_NAME | `dest_area_name` † | R1/ctx |
| `weapon` | ProductCode → DTL.PRODUCT_CODE | `product_code` | R1 |
| `weaponLabel` | ProductName → DTL.PRODUCT_NAME | `product_name` | R1 |
| `qty` | Quantity → DTL.QUANTITY | `quantity` | R1 |
| `moveQty` | const 0 → none | `move_qty` † | R3 |
| `unit` | UnitName → U.UNIT_NAME | `unit_name` | R1 |

**Correction to REQ-001 Constraints:** `weaponLabel` is NOT a computed field — it maps to the real
column `DTL.PRODUCT_NAME` (service line 292). Only `key`, `dateFormatted`, `purchaseDocument`,
`moveQty` (+ chart containers) are truly computed. Flagged to Porter (Q1).

**Cross-consistency (nice property):** the same column gets the same key on both sides —
`authority_group_no`, `authority_name`, `dest_province_name`, `dest_area_name`, `product_code`
appear identically in request and table. Code/label pairs disambiguate via the `_name` suffix
(`authority_group_no` vs `authority_group_no_name`).

### E. Cascade GET query params — `DashboardMoveLicenseController` (CONFIRMED in scope, REQ-001 Q2)

The 3 cascade endpoints take these query-string params. Rename the `[FromQuery(Name="...")]` binding
string only (NOT the C# parameter identifier). Values/behaviour unchanged.

| Endpoint | Current param (`Name=`) | New param | Column |
|---|---|---|---|
| `search-filter-province` | `region` | `dest_area_name` | V_PROVINCE.AREA_NAME |
| `search-filter-unit` | `weapon_category` | `product_type_group_code` | PRODUCT_TYPE_GROUP_CODE |
| `search-filter-weapon` | `weapon_category` + `unit` | `product_type_group_code` + `quantity_unit_id` | PRODUCT_TYPE_GROUP_CODE, QUANTITY_UNIT_ID |

Controller locations: `DashboardMoveLicenseController.cs:53` (`region`), `:70` (`weapon_category`),
`:88-89` (`weapon_category` + `unit`).

## Flow

No behavioural change. Serializer (Newtonsoft, `[JsonProperty]`) emits/binds the new keys. The
request-body `[JsonProperty]` rename means the frontend must send the new keys (REQ-001 confirms the
frontend will update its payload). The cascade GET endpoints (`search-filter-province/-unit/-weapon`)
also get their query-param names renamed (§E) — frontend updates the URLs it calls.

## Non-functional

- No auth/validation/perf/logging change. `dotnet build` must succeed (only `[JsonProperty]` string
  literals + the 3 cascade `[FromQuery(Name=...)]` strings change).

## Tasks

- TASK-001: Rename JSON keys on DASHBOARD_LICENSE_MOVE models per the mapping tables (depends on: —)

## Questions

(Jason asks here; Sober answers as `> answer: ...`)

## Questions to Porter (routed via log)

- **Q1 (naming rule for non-direct-column fields).** Proposed rules R2/R3/R4 above, applied to the
  keys marked **†**. Specifically for stakeholder confirmation:
  - resolved-label fields → `<column>_name` (`move_request_type_name`, `transport_type_code_name`,
    `authority_group_no_name`).
  - computed fields → `issue_date_formatted`, `purchase_document`, `move_qty`, `key` (unchanged).
  - dropdown containers → `<column>_ddl`; chart containers → `bar_chart_data1` / `line_chart_data` /
    `bar_chart_data2`.
  - `destinationRegion`/`region` → `dest_area_name` (column is `AREA_NAME`; `dest_` prefix added for
    context/consistency with sibling `dest_*` fields). Confirm the prefix is acceptable, or use bare
    `area_name`.
  - Note the `weaponLabel` correction above.
  > answer (Porter, from stakeholder 2026-07-17): **CONFIRMED — proceed with the proposed rule.**
  > `dest_area_name` chosen over bare `area_name` (keep the `dest_` prefix). `weaponLabel`→`product_name`
  > correction accepted. All the † keys in the mapping tables are approved as written.
- **Q2 (cascade GET query-param names — scope check).** REQ-001 scopes "the search request body keys".
  The cascade endpoints (`search-filter-province`, `-unit`, `-weapon`) take **query-string** params
  (`region`, `weapon_category`, `unit`), not the POST body. Are these in scope too (rename to
  `dest_area_name`, `product_type_group_code`, `quantity_unit_id`)? If yes, the controller
  `[FromQuery(Name=...)]` also changes. Proposed: **include them** for consistency.
  > answer (Porter, from stakeholder 2026-07-17): **YES — in scope.** Rename the cascade query params
  > (`region`→`dest_area_name`, `weapon_category`→`product_type_group_code`, `unit`→`quantity_unit_id`)
  > and update the controller `[FromQuery(Name=...)]`. Frontend will update its URLs.
