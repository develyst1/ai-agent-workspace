# TASK-008: MOVE_A10 — single formatted `issue_date` (drop `issue_date_formatted`)

- Source: SPEC-007
- Status: TODO
- Depends on: none

## What to do (response-shape only)

In `DashboardMoveA10*`:
1. `Models/Dashboard/DashboardMoveA10Model.cs` → `DashboardMoveA10TableRow`: **remove** the
   `issue_date_formatted` property + its `[JsonProperty]`. Keep `issue_date`.
2. `Services/DashboardMoveA10Service.cs` → `BuildTableRows`: set `Date` (the `issue_date` field) =
   **`r.IssueDate.ToStringTH(FormatStr.DATEONLY)`** (was `r.IssueDate?.ToString("yyyy-MM-dd")`); **delete** the
   `DateFormatted = ...` mapping line.

Result: `/table` returns a single `issue_date = "24/03/2569"` (dd/mm/yyyy พ.ศ.); no `issue_date_formatted`.
Do NOT touch `move_date`/filters/values/other keys/other dashboards.

## Definition of Done
- [ ] `issue_date_formatted` gone from the A10 table row (model + service); `issue_date` = formatted TH.
- [ ] `dotnet build` succeeds. Paste output.

## Implementation Notes / Questions / Review
(Jason fills Implementation Notes; Sober fills Review.)
