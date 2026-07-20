# SPEC-003: DASHBOARD_LICENSE_BOOK — align JSON keys to DB column names

- Source: REQ-003
- Status: DONE

## Overview

The License Book (อ.8/อ.10/อ.16/อ.17) analog of SPEC-001: a **pure JSON-key rename** so every field a
frontend consumes/sends is named after its backing Oracle column in lowercase `snake_case`. Same rules,
same hard constraint. Values, query logic, filtering, paging, and the `ResponseResult` envelope are
untouched.

**Change is `[JsonProperty("...")]` string edits in ONE file** — `Models/Dashboard/DashboardLicenseBookModel.cs`.
C# property names, the service (`DashboardLicenseBookService.cs`), the DTO
(`DashboardLicenseBookQueryResult.cs`), and the SQL (`TTLicenseRepo.GetLicenseBookDashboard`) do NOT
change. The controller has no query params to rename (both data endpoints are `[FromBody]`).

**Columns are authoritative from the repository SQL** — `GetLicenseBookDashboard`
(`TTLicenseRepository.cs:182-207`) aliases each column (`L.LICENSE_NO AS LicenseNo`, `L.FORM_ID AS FormId`,
`P.PAID_STATUS AS PaidStatus`, …). **No DATA REQUEST needed.**

## Naming rules (reused verbatim from SPEC-001 / REQ-001, stakeholder-confirmed)

- **R1** direct column value → `snake_case(COLUMN)`.
- **R2** resolved display name of a code column → `snake_case(COLUMN) + "_name"`.
- **R3** computed/no column → display transform → `..._formatted`; else descriptive snake_case.
- **R4** structural containers (dropdown `*_ddl`, chart containers) → column stem + suffix; no-column
  containers → mechanical camelCase→snake_case.
- **HARD CONSTRAINT — shared classes NOT renamed.** `DashboardChartData` / `DashboardChartCategory` /
  `DashboardChartSeriesItem` are shared with the move-license dashboard; `DropdownDDLData` /
  `DropdownDDLItem` are app-wide. Do NOT touch their inner keys (`chartType`/`valueUnit`/`categories`/
  `series`/`total`/`id`/`label`/`name`/`value`; `value_default`/`items`). Only License-Book-owned
  container/field keys change.

## Field mapping

Legend: **Cat** = R1/R2/R3/R4. src → SQL column.

### A. Request body — `DashboardLicenseBookSearchRequest` (Model lines 13-46)

| Current key | Filters column | New key | Cat |
|---|---|---|---|
| `dateRange` | ISSUE_DATE (range) | `issue_date_range` | R3 |
| `receiptDateRange` | RECEIPT_DATE (range) | `receipt_date_range` | R3 |
| `companies` | TRADER_ID | `trader_id` | R1 |
| `bookTypes` | FORM_ID | `form_id` | R1 |

`DateStart/DateEnd/ReceiptStart/ReceiptEnd` are `[JsonIgnore]` — no change.
**Note (REQ-004 interaction):** the *values* inside `form_id` change from the `"อ.8"` label strings to
FORM_IDs (`"8"`, …) under **REQ-004** (dropdown value = FORM_ID). SPEC-003 only renames the key; the value
flip is SPEC-004. Land TASK-003 then TASK-004 so the frontend gets one coherent `form_id` contract.

### B. Dropdown response — `DashboardLicenseBookSearchFilterResponse` (Model lines 53-60)

| Current key | Options for | New key |
|---|---|---|
| `trader_ddl` | TRADER_ID | `trader_id_ddl` |
| `book_type_ddl` | FORM_ID | `form_id_ddl` |

### C. Chart response — `DashboardLicenseBookChartsResponse` (Model lines 105-126)

Container keys only (License-Book-owned). No backing column → mechanical snake_case (R4).

| Current key | New key |
|---|---|
| `countByEntrepreneurAndType` | `count_by_entrepreneur_and_type` |
| `countByEntrepreneur` | `count_by_entrepreneur` |
| `countByBookType` | `count_by_book_type` |
| `paidAmountByEntrepreneur` | `paid_amount_by_entrepreneur` |
| `paidAmountByBookType` | `paid_amount_by_book_type` |

Inner `DashboardChartData` keys on the last four: **UNCHANGED** (shared class — hard constraint).

### D. Mix-bar row — `DashboardLicenseBookMixBarRow` (Model lines 70-98, License-Book-owned)

| Current key | src | New key | Cat |
|---|---|---|---|
| `name` | trader name (TraderLabel → TRADER_NAME) | `trader_name` | R1 |
| `a8_paid` … `a17_unpaid` (8 keys) | computed FORM_ID × PAID_STATUS pivot cells | **keep as-is** | R3 |

**Pivot summary (REQ-003 Q1):** `a8_paid`/`a8_unpaid`/…/`a17_unpaid` are computed cross-tab cells with
no single backing column; they already encode FORM_ID (8/10/16/17) + payment status in lowercase
snake_case. **Keep unchanged** — renaming (e.g. `form_id_8_paid`) only obscures. SA recommendation to
Porter (Q1).

### E. Table row — `DashboardLicenseBookTableRow` (Model lines 132-161)

| Current key | src → column | New key | Cat |
|---|---|---|---|
| `key` | row index | `key` (unchanged) | R3 |
| `docNo` | LicenseNo → L.LICENSE_NO | `license_no` | R1 |
| `dateFormatted` | IssueDate (TH) → ISSUE_DATE | `issue_date_formatted` | R3 |
| `expireDate` | ExpiryDate → L.EXPIRY_DATE | `expiry_date` | R1 |
| `bookType` | BookTypeLabel(FormId) → L.FORM_ID | `form_id_name` | R2 |
| `company` | TraderName → L.TRADER_NAME | `trader_name` | R1 |
| `paymentStatus` | paid/unpaid label ← P.PAID_STATUS | `paid_status_name` | R2 |
| `receiptDate` | ReceiptDate → L.RECEIPT_DATE | `receipt_date` | R1 |
| `amount` | Amount → P.AMOUNT | `amount` | R1 |

**Cross-consistency:** `form_id` (request) / `form_id_ddl` / `form_id_name` (table); `trader_id`
(request) / `trader_id_ddl` / `trader_name` (mix-bar + table). Code/label pairs disambiguate via `_name`.

## Flow / Non-functional

No behavioural change; Newtonsoft emits/binds the new keys. `dotnet build` must succeed (only string
literals change). No auth/validation/perf/logging change.

## Out of scope

- No query/filter/value/paging/envelope change; no other dashboard; shared classes untouched.
- The book-type dropdown config + DB-label + value=FORM_ID change is **REQ-004/SPEC-004** (same files —
  sequence TASK-003 → TASK-004).

## Tasks

- TASK-003: Rename JSON keys on the License Book dashboard models per §A–E (depends on: —)

## Questions

(Jason asks here; Sober answers as `> answer: ...`)

## Questions to Porter (routed via log)

- **Q1 (pivot summary keys).** Recommend **keep `a8_paid`…`a17_unpaid` unchanged** (computed pivot cells,
  already snake_case, no single backing column). Confirm with stakeholder.
- **Q2 (mix-bar `name`).** Recommend `name` → `trader_name` (it holds the trader name). Minor judgment —
  alternative is to keep the structural `name`. Confirm.
