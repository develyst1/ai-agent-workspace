# REQ-001: DASHBOARD_LICENSE_MOVE — align response keys to DB column names

- Status: DELIVERED
- Priority: MEDIUM
- Requested: 2026-07-17 by stakeholder (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal

The frontend team consuming the **DASHBOARD_LICENSE_MOVE** page (ยอดอนุญาตให้ขาย/ขนย้ายอาวุธ อ.10)
finds the API response keys hard to use because each key does **not** match the underlying
database column name. Today the payload keys are semantic camelCase / snake_case
(e.g. `docNo`, `originSubDistrict`, `buyerGroupLabel`, `transport_type_ddl`) while the real
Oracle columns are things like `LICENSE_NO`, `DISTRICT_NAME`, `PRODUCT_CODE`. The mismatch
forces the frontend to maintain an extra translation layer.

Goal: make every response key on this dashboard line up 1:1 with its source DB column so the
frontend can bind directly without a mapping step.

Stakeholder's words (Thai, for intent):
> "response request key ของแต่ละอันไม่ตรงกับ database column name มันทำให้ยากต่อ front เขานำไปเรียกใช้ต่อ ช่วยแก้ให้ตรงกับ database column"

## Requirement

1. For **all** responses of the DASHBOARD_LICENSE_MOVE endpoints, each field key that maps to a
   database column MUST be named after that column, in **lowercase `snake_case`**
   (e.g. Oracle `LICENSE_NO` → `license_no`, `DISTRICT_NAME` → `district_name`,
   `PRODUCT_CODE` → `product_code`).
2. Scope = every response set of this dashboard (stakeholder answered "ทั้งหมด"):
   - search-filter dropdown responses (currently `transport_type_ddl`, `region_ddl`, …)
   - chart response (currently `barChartData1`, `lineChartData`, `barChartData2`)
   - table row response (currently `docNo`, `originSubDistrict`, `weapon`, `qty`, …)
   - the search request body keys (currently `dateRange`, `transportTypes`, …) — **IN SCOPE**
     (stakeholder confirmed 2026-07-17: the frontend named these wrong originally and wants them
     fixed too). The inbound request contract is expected to change accordingly.
3. The change is a **rename of JSON keys only**. The data values, query logic, filtering
   behaviour, and the outer `ResponseResult` envelope (`status_code`/`message`/`data`) must stay
   exactly the same.

## Acceptance Criteria

- [x] Every response field of the DASHBOARD_LICENSE_MOVE endpoints that has a backing DB column
      exposes that column's name in lowercase snake_case.
- [x] No data value or business behaviour changes — only the JSON key names change.
- [x] Frontend can consume the responses using the DB column names directly, with no key
      translation layer.
- [x] Fields that do **not** have a single backing DB column (see Constraints) are handled by an
      explicit, documented rule agreed with the stakeholder — not left ambiguous.

## Acceptance (Porter, 2026-07-17)

**DELIVERED.** PM independently verified the changed code (not just the notes):
- Model `DashboardMoveLicenseModel.cs`: 0 old keys remain; new keys present
  (`license_no`, `issue_date_formatted`, `product_name`, `move_request_type_name`,
  `authority_group_no_name`, `dest_area_name` ×2, `bar_chart_data1`, `move_request_type`, …).
- Controller `DashboardMoveLicenseController.cs`: 0 old cascade query params remain; new present
  (`dest_area_name`, `product_type_group_code` ×2, `quantity_unit_id`).
- `dotnet build` = 0 Error(s) (Jason + Sober). Live-DB response capture intentionally deferred per
  brownfield rule — accepted; a `[JsonProperty]` rename is deterministic serialization with no logic
  change. Optional: stakeholder may hit `/dashboard-move-license/table` for a visual confirmation.
- **Breaking-contract heads-up for frontend** (relayed to stakeholder): the frontend must update the
  keys it *sends* — both the POST request body (`move_request_type`, `transport_type_code`,
  `trader_id`, `dest_area_name`, `dest_province_name`, `authority_group_no`, `authority_name`,
  `product_type_group_code`, `quantity_unit_id`, `product_code`, `issue_date_range`) and the cascade
  GET URLs (`?dest_area_name=`, `?product_type_group_code=`, `?quantity_unit_id=`).

## Constraints

- Backend: `DidSpf.WebApi.Center`, files under
  `Models/Dashboard/DashboardMoveLicenseModel.cs`, `Services/DashboardMoveLicenseService.cs`,
  `Controllers/DashboardMoveLicenseController.cs` (JSON keys are `[JsonProperty(...)]` on the
  response models).
- Chosen key style is **lowercase snake_case of the column name** (stakeholder decision
  2026-07-17), NOT the exact UPPER_CASE Oracle spelling.
- Some current response fields are **computed / have no single source column** and therefore no
  natural column name to copy — known from prior work on this dashboard:
  - `key`, `dateFormatted`, `buyerGroupLabel`, `weaponLabel` — derived/display fields.
  - `moveQty` (จำนวนขนย้ายจริง) — no DB column exists, returns 0.
  - `purchaseDocument` (เอกสารการซื้อ) — no typed source on the license.
  - chart container names `barChartData1` / `lineChartData` / `barChartData2` — chart grouping
    labels, not table columns.
  These need a naming rule (see Questions).

## Out of Scope

- No change to query logic, filters, values, paging, or the `ResponseResult` envelope.
- No change to any other dashboard or endpoint outside DASHBOARD_LICENSE_MOVE.
- Frontend-side wiring/consumption changes (the frontend still uses a mock today).

## Questions

(SA Lead asks here; PM answers as `> answer: ...`)

- Q1 (raised by PM for SA): For computed fields with **no single backing DB column**
  (`key`, `dateFormatted`, `buyerGroupLabel`, `weaponLabel`, `moveQty`, `purchaseDocument`, and the
  chart container names), what snake_case key should they use? Options to consider: keep a clear
  descriptive snake_case name, or derive from the closest column. PM will confirm the rule with the
  stakeholder once SA proposes one.
  > answer (Sober, SA — proposed rule, 2026-07-17; @Porter please confirm with stakeholder):
  > I traced every field to its column via the repository SQL (`GetMoveLicenseDashboard`), so all
  > real columns are known — **no DB access needed**. Full field-by-field mapping is in
  > `specs/SPEC-001-...` §A–D. Proposed rule for the non-direct fields:
  > 1. **Resolved-name fields** (hold a looked-up name, not the code): `<column>_name` —
  >    `transportType`→`move_request_type_name`, `moveType`→`transport_type_code_name`,
  >    `buyerGroupLabel`→`authority_group_no_name`.
  > 2. **Computed / no column**: `dateFormatted`→`issue_date_formatted` (display of ISSUE_DATE),
  >    `purchaseDocument`→`purchase_document`, `moveQty`→`move_qty`, `key`→`key` (unchanged).
  > 3. **Dropdown containers**: `<column>_ddl` (e.g. `transport_type_ddl`→`move_request_type_ddl`).
  >    **Chart containers**: `barChartData1`→`bar_chart_data1`, `lineChartData`→`line_chart_data`,
  >    `barChartData2`→`bar_chart_data2`.
  > 4. `destinationRegion`/`region`→`dest_area_name` (column is `AREA_NAME`; `dest_` prefix added
  >    for context + consistency with sibling `dest_*` fields — confirm, or use bare `area_name`).
  >
  > **Correction:** `weaponLabel` is NOT computed — it maps to the real column `DTL.PRODUCT_NAME`,
  > so it becomes `product_name` (a plain R1 rename), not a special case.
  >
  > **Hard constraint discovered:** the chart's *inner* fields (`chartType`/`valueUnit`/`series`/
  > `total`/`name`/`value`/…) live on classes **shared with the License Book dashboard**, so they are
  > left unchanged (renaming them would change that other dashboard — out of REQ scope). Only the 3
  > chart *container* names above change.
  >
  > answer (Porter, from stakeholder 2026-07-17): **CONFIRMED — accept the proposed rule in full.**
  > - Naming rules R2/R3/R4 approved as-is (label→`_name`, computed→descriptive/`_formatted`,
  >   containers→`_ddl` / `bar_chart_data*`).
  > - `destinationRegion`/`region` → **`dest_area_name`** (keep the `dest_` prefix for consistency
  >   with the sibling `dest_*` fields). NOT bare `area_name`.
  > - `weaponLabel` correction acknowledged — treat as R1 `product_name`.
  > - Leaving the shared chart/dropdown inner classes untouched is approved (out of scope).

- Q2 (raised by SA for PM): The 3 cascade dropdown endpoints
  (`search-filter-province`, `search-filter-unit`, `search-filter-weapon`) take **query-string**
  params (`region`, `weapon_category`, `unit`) — not the POST body. REQ scope says "the search
  request body keys". Are these query params also in scope to rename
  (`dest_area_name` / `product_type_group_code` / `quantity_unit_id`)? SA recommends **yes** for
  consistency. @Porter please confirm with the stakeholder.
  > answer (Porter, from stakeholder 2026-07-17): **YES — rename the cascade GET query params too.**
  > `region` → `dest_area_name`, `weapon_category` → `product_type_group_code`, `unit` →
  > `quantity_unit_id`. Update the controller `[FromQuery(Name=...)]` accordingly. The frontend will
  > update the URLs it calls.
- Q2 (raised by PM for SA): The **inbound search request body** keys currently match the frontend's
  `CriteriaValues` field names on purpose. Renaming them to DB-column snake_case changes the
  request contract the frontend sends. Confirm whether the stakeholder's "ทั้งหมด" is meant to
  include the request body, or only the responses the frontend *reads*.
  > answer (Porter, from stakeholder 2026-07-17): **YES — request body is in scope.** The frontend
  > set those names wrong from the start; fix them all to the proper DB-column snake_case. The
  > frontend will update the request payload it sends to match.

## DB data availability

The stakeholder (via Porter) is **available to provide data from any DB table on request**
(2026-07-17). If SA needs the real column names / structure of any Oracle table to build the exact
key mapping (e.g. `T_T_LICENSE`, `T_T_LICENSE_DTL`, `T_T_LICENSE_MOVE`, `V_PROVINCE`, master/ref
tables), raise a **DATA REQUEST** in this `## Questions` section with the exact table(s) or SQL you
want run, mark the item BLOCKED on the board, and `@Porter` in the log — Porter will ask the
stakeholder in Thai and drop the result into `../project-docs/`.
