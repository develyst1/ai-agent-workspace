# REQ-003: DASHBOARD_LICENSE_BOOK — align response keys to DB column names

- Status: DRAFT — **ON HOLD** (stakeholder said "รอ ไม่ต้องทำแล้ว พักก่อน", 2026-07-17). Do NOT
  pick up for spec work until the stakeholder resumes it. Draft kept so no rework is lost.
- Priority: MEDIUM
- Requested: 2026-07-17 by stakeholder (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal

Same problem as REQ-001, on the **License Book** dashboard ("ประเภทหนังสือ" อ.8/อ.10/อ.16/อ.17). The
API response/request keys are semantic camelCase / snake_case (e.g. `dateRange`, `docNo`,
`bookType`, `trader_ddl`, `countByEntrepreneur`), not the backing Oracle column names, so the
frontend needs a translation layer.

Goal: make every key on the License Book dashboard endpoints line up with its backing DB column in
lowercase `snake_case` — **identical treatment and naming rules as REQ-001/SPEC-001** (its sibling
dashboard). Stakeholder asked to "ทำแบบนี้ด้วยที่ License Book".

## Requirement

1. Apply the **same key-alignment as REQ-001** to the License Book dashboard endpoints
   (`api/v1/officer/dashboard-license-book/{search-filter,chart,table}`): every field key that maps
   to a DB column is renamed to that column's name in lowercase `snake_case`.
2. Scope = all responses + the request body of this dashboard:
   - request body `DashboardLicenseBookSearchRequest` (`dateRange`, `receiptDateRange`, `companies`,
     `bookTypes`, …)
   - search-filter dropdown response (`trader_ddl`, `book_type_ddl`)
   - chart response containers (`countByEntrepreneurAndType`, `countByEntrepreneur`, `countByBookType`,
     `paidAmountByEntrepreneur`, `paidAmountByBookType`)
   - table row response (`docNo`, `dateFormatted`, `bookType`, …)
   - the paid/unpaid pivot-summary block (`a8_paid`, `a8_unpaid`, `a10_paid`, … — computed per
     book-type × payment-status; see Questions).
3. Reuse REQ-001's naming rules verbatim: **R1** direct column → `snake_case(COLUMN)`; **R2** resolved
   label of a code → `+ "_name"`; **R3** computed/no-column → descriptive snake_case or `+ "_formatted"`;
   **R4** structural containers keep their suffix.
4. **JSON-key rename only** — no change to values, query logic, filtering, paging, or the
   `ResponseResult` envelope.

## Acceptance Criteria

- [ ] Every License Book response/request field that has a backing DB column exposes that column's
      name in lowercase snake_case.
- [ ] No data value or business behaviour changes — only key names change; `dotnet build` succeeds.
- [ ] Frontend can consume/send the License Book keys as DB column names with no translation layer.
- [ ] Computed fields with no single backing column (pivot summary, formatted/derived fields) use an
      explicit rule consistent with REQ-001 (stakeholder-agreed).

## Constraints

- Backend: `DidSpf.WebApi.Center` — `Models/Dashboard/DashboardLicenseBookModel.cs`,
  `Services/DashboardLicenseBookService.cs`, `Controllers/DashboardLicenseBookController.cs`.
- **Same HARD CONSTRAINT as REQ-001/SPEC-001:** the shared chart/dropdown inner classes
  (`DashboardChartData`/`DashboardChartCategory`/`DashboardChartSeriesItem`, `DropdownDDLData`/
  `DropdownDDLItem`) are shared across dashboards — do **NOT** rename their inner keys. Only License
  Book's own container/field keys change. (The chart *container* names here — `countBy…` — live on
  License Book's own response class, so they can be renamed.)
- Column names should be traceable from the repository SQL (`TTLicenseRepo.GetLicenseBookDashboard`)
  the same way SPEC-001 traced move-license — SA to confirm; DATA REQUEST only if a column is not
  discoverable from code.
- Chosen key style = lowercase snake_case of the column name (consistent with REQ-001).

## Out of Scope

- No query/filter/value/paging/envelope change; no other dashboard.
- The book-type dropdown's config/label change is **REQ-004** (separate), not here — though both touch
  the same files, so SA/BE should sequence them to avoid conflicts.

## Questions

(SA Lead asks here; PM answers as `> answer: ...`)

- Q1 (raised by PM for SA): The paid/unpaid **pivot summary** (`a8_paid`/`a8_unpaid`/`a10_paid`/…) is
  a computed cross-tab of book-type × payment-status, with no single backing column. What snake_case
  keys should these use — keep the `a{8,10,16,17}_{paid,unpaid}` shape (already snake_case and
  DB-ish), or derive from FORM_ID + a payment-status column? PM will confirm the rule with the
  stakeholder once SA proposes one. (Note: `a8_paid` etc. are already lowercase snake_case, so they
  may need no change — SA to judge against the actual columns.)
