# TASK-003: Rename DASHBOARD_LICENSE_BOOK JSON keys to DB column snake_case

- Source: SPEC-003
- Status: DONE
- Depends on: none

## What to do

JSON-key rename on the License Book dashboard models per **SPEC-003 §A–E**. Edit `[JsonProperty("...")]`
strings only in `Models/Dashboard/DashboardLicenseBookModel.cs`. Do NOT change C# property names, the
service, DTO, or SQL.

**Keys (SPEC-003 has the full tables):**
- §A `DashboardLicenseBookSearchRequest` (4): `dateRange`→`issue_date_range`,
  `receiptDateRange`→`receipt_date_range`, `companies`→`trader_id`, `bookTypes`→`form_id`.
- §B `DashboardLicenseBookSearchFilterResponse` (2): `trader_ddl`→`trader_id_ddl`,
  `book_type_ddl`→`form_id_ddl`.
- §C `DashboardLicenseBookChartsResponse` (5 containers): `countByEntrepreneurAndType`→
  `count_by_entrepreneur_and_type`, `countByEntrepreneur`→`count_by_entrepreneur`,
  `countByBookType`→`count_by_book_type`, `paidAmountByEntrepreneur`→`paid_amount_by_entrepreneur`,
  `paidAmountByBookType`→`paid_amount_by_book_type`.
- §D `DashboardLicenseBookMixBarRow`: `name`→`trader_name`; **keep** `a8_paid`…`a17_unpaid` unchanged.
- §E `DashboardLicenseBookTableRow` (9): `key` (keep), `docNo`→`license_no`,
  `dateFormatted`→`issue_date_formatted`, `expireDate`→`expiry_date`, `bookType`→`form_id_name`,
  `company`→`trader_name`, `paymentStatus`→`paid_status_name`, `receiptDate`→`receipt_date`,
  `amount` (keep).

**DO NOT TOUCH:** inner keys of shared `DashboardChartData`/`DashboardChartCategory`/
`DashboardChartSeriesItem` (`chartType`/`valueUnit`/`categories`/`series`/`total`/`id`/`label`/`name`/
`value`) and `DropdownDDL*` — shared classes. Only License-Book-owned keys change. No value/logic change.

**Note:** the `form_id` request field keeps its current `"อ.8"` *values* for now — SPEC-004 flips those
to FORM_IDs. This task is key-rename only.

## Definition of Done

- [x] All `[JsonProperty]` keys on the 5 License-Book model classes match SPEC-003 §A–E exactly.
- [x] `a8_paid`…`a17_unpaid` unchanged; no shared-class key changed; no C#/service/DTO/SQL change.
- [x] `dotnet build` succeeds (from `spf/DidSpf.WebApi.Center`). **Build succeeded. 0 Error(s).**

## Implementation Notes

**Done by Jason 2026-07-17.** JSON-key rename only, 1 file (`Models/Dashboard/DashboardLicenseBookModel.cs`).
No C# property names, service, DTO, or SQL touched. `form_id` request field keeps its current `"อ.8"` values
(SPEC-004 flips those to FORM_IDs).

### Keys changed per SPEC-003 §A–E
- **§A `DashboardLicenseBookSearchRequest`** (4): `dateRange`→`issue_date_range`,
  `receiptDateRange`→`receipt_date_range`, `companies`→`trader_id`, `bookTypes`→`form_id`.
  (`DateStart/DateEnd/ReceiptStart/ReceiptEnd` are `[JsonIgnore]` — untouched.)
- **§B `DashboardLicenseBookSearchFilterResponse`** (2): `trader_ddl`→`trader_id_ddl`, `book_type_ddl`→`form_id_ddl`.
- **§C `DashboardLicenseBookChartsResponse`** (5 containers): `countByEntrepreneurAndType`→`count_by_entrepreneur_and_type`,
  `countByEntrepreneur`→`count_by_entrepreneur`, `countByBookType`→`count_by_book_type`,
  `paidAmountByEntrepreneur`→`paid_amount_by_entrepreneur`, `paidAmountByBookType`→`paid_amount_by_book_type`.
- **§D `DashboardLicenseBookMixBarRow`**: `name`→`trader_name`; `a8_paid`…`a17_unpaid` (8) **kept unchanged**.
- **§E `DashboardLicenseBookTableRow`**: `key` kept; `docNo`→`license_no`, `dateFormatted`→`issue_date_formatted`,
  `expireDate`→`expiry_date`, `bookType`→`form_id_name`, `company`→`trader_name`,
  `paymentStatus`→`paid_status_name`, `receiptDate`→`receipt_date`; `amount` kept.

### Hard constraints respected
- Shared `DashboardChartData`/`DashboardChartCategory`/`DashboardChartSeriesItem` inner keys and `DropdownDDL*`
  inner keys — untouched (only License-Book-owned container/field keys changed).
- No value/logic/service/DTO/SQL change.

### Verification (evidence)
- **`dotnet build`** (from `spf/DidSpf.WebApi.Center`): **Build succeeded. 0 Error(s).**
- **Static grep:** no old License-Book keys remain (`dateRange`/`companies`/`bookTypes`/`trader_ddl`/`book_type_ddl`/
  `countBy*`/`paidAmountBy*`/`docNo`/`dateFormatted`/`expireDate`/`bookType`/`company`/`paymentStatus`/`receiptDate`
  all gone); `a8_paid`…`a17_unpaid` = 8 kept; bare `name` gone; `trader_name` present twice (§D mix-bar + §E table).
- **Live-response spot-check** deferred (brownfield — needs running Center + Oracle). A `[JsonProperty]` rename is
  deterministic serialization with no logic change; build + static grep is conclusive. DATA REQUEST available if a
  live capture is wanted for sign-off.

## Questions

(Jason asks; Sober answers as `> answer: ...`)

## Review

**Verdict: DONE — Sober (SA), 2026-07-17.** Verified `DashboardLicenseBookModel.cs` line-by-line vs SPEC-003:
- §A request (L14-29): `issue_date_range`/`receipt_date_range`/`trader_id`/`form_id` ✓; 4 `[JsonIgnore]` kept.
- §B dropdown (L55-59): `trader_id_ddl`/`form_id_ddl` ✓.
- §C chart containers (L108-125): all 5 `count_by_*`/`paid_amount_by_*` ✓.
- §D mix-bar (L72): `name`→`trader_name` ✓; `a8_paid`…`a17_unpaid` (8) unchanged ✓.
- §E table (L134-160): `key` kept, `license_no`/`issue_date_formatted`/`expiry_date`/`form_id_name`/
  `trader_name`/`paid_status_name`/`receipt_date` ✓, `amount` kept.
- Shared classes untouched: no `DashboardChartData*`/`DropdownDDL*` inner key changed (they're not even in
  this file). C# property names all preserved (build green proves the service still binds). Build 0 errors.
- Brownfield deferral of the live capture accepted — deterministic `[JsonProperty]` rename, no logic change.

No rework. Matches every REQ-003 acceptance criterion. (REQ-004/TASK-004 will flip the `form_id` *values*
to FORM_IDs — frontend should adopt SPEC-003 keys + SPEC-004 values together.)
