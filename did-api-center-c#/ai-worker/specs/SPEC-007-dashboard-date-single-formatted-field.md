# SPEC-007: Dashboard dates — one key, formatted value (drop the `_formatted` twin)

- Source: REQ-007
- Status: ACTIVE

## Overview

Response-shape only: on the **move dashboards' table rows**, collapse the `issue_date` + `issue_date_formatted`
pair into a **single `issue_date`** holding the **Thai พ.ศ. `dd/mm/yyyy`** value; delete
`issue_date_formatted`. No query/filter/value/logic change; request bodies untouched; shared classes untouched.

**Scope (Q1/Q2 defaults — non-blocking):** only the **move dashboards** (`DASHBOARD_MOVE_A10` +
`DASHBOARD_LICENSE_MOVE`), and only the **`issue_date` pair** (the only date with a `_formatted` twin).
`move_date`/`receipt_date`/`expiry_date` are already single-key — leave them as-is. (If the stakeholder later
says "extend to license-book / other dates", it's a trivial follow-up.)

## Change (2 files)

### `Models/Dashboard/DashboardMoveA10Model.cs` — `DashboardMoveA10TableRow`
- **Remove** the `issue_date_formatted` property + `[JsonProperty("issue_date_formatted")]`.
- Keep `issue_date`; its value becomes the formatted string (set in the service).

### `Models/Dashboard/DashboardMoveLicenseModel.cs` — `DashboardMoveLicenseTableRow`
- Same: remove `issue_date_formatted`; keep `issue_date`.

### Services (the mapping)
- `DashboardMoveA10Service` (`BuildTableRows`): change `Date` (issue_date) from
  `r.IssueDate?.ToString("yyyy-MM-dd")` → **`r.IssueDate.ToStringTH(FormatStr.DATEONLY)`**; delete the
  `DateFormatted = ...` line.
- `DashboardMoveLicenseService` (`BuildTableRows`): same — `Date` = `ToStringTH(FormatStr.DATEONLY)`; delete
  the `DateFormatted` line. (`ToStringTH(FormatStr.DATEONLY)` is the exact helper already used for the
  `_formatted`/`expire_date` values → identical `dd/mm/yyyy พ.ศ.` output, e.g. `24/03/2569`.)

## Coordination with REQ-006

Both touch `DashboardMoveLicense*`. The License Move part of SPEC-007 is **folded into TASK-009** (the REQ-006
task) so BE edits that model/service once. The Move A10 part is standalone (**TASK-008**).

## Acceptance / Non-functional

- [ ] `/table` on both move dashboards returns a single `issue_date = "dd/mm/yyyy(พ.ศ.)"`; no
      `issue_date_formatted` key remains.
- [ ] No filter/value/envelope change; `dotnet build` succeeds; other dashboards untouched.

## Tasks
- TASK-008: MOVE_A10 — drop `issue_date_formatted`, `issue_date` = formatted. (depends on: —)
- TASK-009 (shared with SPEC-006): LICENSE_MOVE — same date change (done alongside the delivery-attach).

## Questions
(Jason asks here; Sober answers as `> answer: ...`)
