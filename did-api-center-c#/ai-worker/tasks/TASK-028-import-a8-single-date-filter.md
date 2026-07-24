# TASK-028: DASHBOARD_IMPORT_A8 — keep ONE date filter (`inform_date_range`), drop `issue_date_range`

- Source: REQ-016 correction (Porter's "two date filters" was a misread of "แยกกัน" — each dashboard has ONE date;
  import-a8 mirrors a10's single `move_date` with a single `inform_date`). Amends TASK-027.
- Status: DONE
- Assignee: Jason (BE)
- Depends on: TASK-027

## Review — Verdict: DONE — Sober (SA), 2026-07-21
Grep-verified: A8 request has only `inform_date_range` (no `issue_date_range`); `GetImportA8Dashboard` signature =
`(informStart, informEnd)`, only the `H.INFORM_DATE` conditional predicate remains, `:ISSUE_*` params + the
`AND L.ISSUE_DATE` preds gone from the A8 method; `L.ISSUE_DATE AS IssueDate`/`L.EXPIRY_DATE AS ExpiryDate` still SELECTed
(output cols kept). The `L.ISSUE_DATE` predicates elsewhere in the file are the untouched `GetMoveLicenseDashboard`/
`GetImportDashboard` methods (own filters). Service call updated to the 2-arg form. 15 cols + 4 charts unchanged;
no-date still completes; build 0 errors. → REQ-016 code-complete (single date filter); live capture accepts.

## Change (surgical — 1 field + the query params/preds; อ.8 issue/expiry stay as TABLE COLUMNS, just not a filter)

1. **Model `DashboardImportA8SearchRequest`** (`DashboardImportA8Model.cs`) — remove `issue_date_range`
   (`[JsonProperty("issue_date_range")]` + its `IssueDateStart`/`IssueDateEnd` helpers). **Keep** `inform_date_range`
   (→ `InformDateStart`/`InformDateEnd`).
2. **DAL `TTLicenseDtlRepository.GetImportA8Dashboard`** — change signature to
   `GetImportA8Dashboard(string informStart, string informEnd)` (drop `issueStart`/`issueEnd`); remove the
   `:ISSUE_START`/`:ISSUE_END` `parameters.Add` lines **and** the two conditional `AND L.ISSUE_DATE …` predicate lines.
   **Keep** the two conditional `AND H.INFORM_DATE …` predicates, all SELECT columns (incl. `L.ISSUE_DATE AS IssueDate`,
   `L.EXPIRY_DATE AS ExpiryDate` — these remain table output), the joins, and `ORDER BY H.INFORM_DATE DESC, D.IMPORT_EXPORT_SEQ ASC`.
3. **Service `DashboardImportA8Service.BuildTableRows`** — call `GetImportA8Dashboard(req.InformDateStart, req.InformDateEnd)`
   (drop the issue args).

No other change: 15-col table (issue/expiry still shown), 4 charts, cascades, other dashboards — all unchanged.

## Must NOT change
The `inform_date_range` filter (H.INFORM_DATE, still conditional → no-date completes), the 15 output columns (อ.8
issue/expiry stay), the 4 charts, other dashboards. DID_SPF-only.

## Definition of Done
- [x] `DashboardImportA8SearchRequest` has only `inform_date_range` (no `issue_date_range`); `GetImportA8Dashboard` takes
      `(informStart, informEnd)` with only the INFORM_DATE predicates; service call updated.
- [x] `/dashboard-import-a8` still returns the 15 cols (incl. อ.8 issue/expiry) + 4 charts; no-date completes; `dotnet build` succeeds.
- [ ] (Acceptance, capture) single inform-date filter works; no-date OK → REQ-016 DELIVERED (with the TASK-027 capture-confirms).

## Implementation Notes
(Jason — 2026-07-24)

Surgical — 1 filter field + query params/preds removed; อ.8 issue/expiry kept as output columns.

1. **Model `DashboardImportA8SearchRequest`** — removed `[JsonProperty("issue_date_range")] IssueDateRange` +
   `IssueDateStart`/`IssueDateEnd` helpers. Kept `inform_date_range` (→ `InformDateStart`/`InformDateEnd`).
2. **DAL `TTLicenseDtlRepository.GetImportA8Dashboard`** — signature now `(string informStart, string informEnd)`;
   dropped `:ISSUE_START`/`:ISSUE_END` `parameters.Add` + the two conditional `AND L.ISSUE_DATE …` predicates. Kept the
   two conditional `AND H.INFORM_DATE …` preds, all SELECT cols (incl. `L.ISSUE_DATE AS IssueDate`, `L.EXPIRY_DATE AS
   ExpiryDate` — table output), joins, `ORDER BY H.INFORM_DATE DESC, D.IMPORT_EXPORT_SEQ ASC`.
3. **Service `DashboardImportA8Service.BuildTableRows`** — call now `GetImportA8Dashboard(req.InformDateStart,
   req.InformDateEnd)` (issue args dropped). 15-col map, 4 charts, cascades unchanged.

### Verification
- `dotnet build` (Center+SPF) → **Build succeeded, 0 Error(s)** (pre-existing warnings only).
- Grep A8 model for `issue_date_range|IssueDateStart|IssueDateEnd|IssueDateRange` → **0**; grep repo for
  `ISSUE_START|ISSUE_END|issueStart|issueEnd` → **0** (predicate/params gone). `L.ISSUE_DATE AS IssueDate` +
  `L.EXPIRY_DATE AS ExpiryDate` still SELECTed (output cols kept). `inform_date_range` conditional preserved → no-date completes.
- Static-only per brownfield rule; single-filter behavior + no-date = stakeholder capture (bundled w/ TASK-027).

## Questions
(Jason asks; Sober answers as `> answer: ...`)
