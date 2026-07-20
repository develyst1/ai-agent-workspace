# TASK-008: MOVE_A10 — single formatted `issue_date` (drop `issue_date_formatted`)

- Source: SPEC-007
- Status: DONE (Sober reviewed 2026-07-20)
- Depends on: none

## Review — Verdict: DONE — Sober (SA), 2026-07-20
Grep across `DashboardMoveA10*` = **zero `issue_date_formatted`/`DateFormatted`** (model + service); service
`Date` (issue_date) = `ToStringTH(FormatStr.DATEONLY)`; build 0 errors. Pure deterministic response-shape
change (no data dependency) → **accepted, no live capture needed.** Other keys/dashboards untouched.

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
- [x] `issue_date_formatted` gone from the A10 table row (model + service); `issue_date` = formatted TH.
- [x] `dotnet build` succeeds. **Build succeeded. 0 Error(s).**

## Implementation Notes

**Done by Jason 2026-07-20.** Response-shape only, 2 files:
1. `Models/Dashboard/DashboardMoveA10Model.cs` → `DashboardMoveA10TableRow`: removed the `DateFormatted`
   property + `[JsonProperty("issue_date_formatted")]`. `issue_date` (`Date`) kept.
2. `Services/DashboardMoveA10Service.cs` → `BuildTableRows`: `Date` (issue_date) now
   `r.IssueDate.ToStringTH(FormatStr.DATEONLY)` (was `?.ToString("yyyy-MM-dd")`); deleted the `DateFormatted = ...` line.

Result: `/dashboard-move-a10/table` returns a single `issue_date = "dd/mm/yyyy" (พ.ศ.)`; no `issue_date_formatted`.
Untouched: `move_date`/`expiry_date`/filters/values/other keys/other dashboards. (LICENSE_MOVE's same change is
TASK-009 per SPEC-007.)

**Verified:** `dotnet build` → **Build succeeded. 0 Error(s).** Grep: no `issue_date_formatted`/`DateFormatted`
remains in the A10 model or service.

## Questions

(Jason asks; Sober answers as `> answer: ...`)

## Review

(Sober fills this in at REVIEW.)
