# TASK-031: DASHBOARD_TRACKING — add the `issue_date_range` filter (วันที่อนุญาต อ.10, missed in first capture)

- Source: REQ-017 corrected capture (a11y-tree re-capture found a date-range the text-only capture missed; single range on
  `L.ISSUE_DATE`, like license-move). SA-owned (Sober).
- Status: DONE
- Assignee: Jason (BE)
- Depends on: TASK-029, TASK-030

## Review — Verdict: DONE — Sober (SA), 2026-07-21
Grep-verified: model has a **single** `issue_date_range` (L17) + `IssueDateStart`/`IssueDateEnd` helpers (L66/70) — no
stray second range (avoided the import-a8 slip); `GetTrackingDashboard(issueStart, issueEnd, weaponCategory, unitId,
weapons)` with `:ISSUE_START`/`:ISSUE_END` binds (L435-436) + the two conditional `AND L.ISSUE_DATE >=/<` preds
(L530-531); service call updated (build passes → 5-arg signature matches). Empty range ⇒ preds omitted ⇒ return-all
completes. FORM_ID=10/LICENSE_STATUS=40 backbone, ฉบับ grain, pre-aggs/EXISTS, move-status (TASK-030), charts, cascades
untouched; DID_SPF-only; build 0 err. → REQ-017 fully code-complete; live capture (date filter + return-all + 3 ฉบับ
charts + 2-status table) accepts (roll-up A already validated A≡B) → REQ-017 DELIVERED.

## Change (small, additive — mirror license-move's single issue-date filter)

1. **Model `DashboardTrackingSearchRequest`** (`DashboardTrackingModel.cs`) — add
   `[JsonProperty("issue_date_range")] public List<string> IssueDateRange { get; set; } = new();` + `[JsonIgnore]`
   helpers `IssueDateStart` (`IssueDateRange.ElementAtOrDefault(0)`) / `IssueDateEnd` (`[1]`), mirroring license-move.
2. **DAL `TTLicenseDtlRepository.GetTrackingDashboard`** — add `string issueStart, string issueEnd` params (front of the
   signature); `parameters.Add(":ISSUE_START", issueStart)` / `:ISSUE_END`; append the two conditional predicates
   (same shape as license-move):
   ```sql
   + ((!string.IsNullOrEmpty(issueStart)) ? @" AND L.ISSUE_DATE >= TO_DATE(:ISSUE_START,'YYYY-MM-DD') " : @"")
   + ((!string.IsNullOrEmpty(issueEnd))   ? @" AND L.ISSUE_DATE <  TO_DATE(:ISSUE_END,'YYYY-MM-DD') + 1 " : @"")
   ```
   before the `ORDER BY`. Keep everything else (FORM_ID=10 AND LICENSE_STATUS=40, ฉบับ grain, APV/ACT pre-aggs, EXISTS
   line-filters, no correlated subqueries).
3. **Service `DashboardTrackingService.BuildTableRows`** — pass `req.IssueDateStart, req.IssueDateEnd` into
   `GetTrackingDashboard(...)` (front of the arg list).

## Notes
- **Single range** (NOT two — do not repeat the import-a8 slip). Empty ⇒ omitted ⇒ return-all (still completes; the
  TASK-029 query is already return-all-safe). This bounds `/table` when a range is given ⇒ **supersedes the paging
  question** (no paging; FE passes a date range).

## Must NOT change
FORM_ID=10/LICENSE_STATUS=40 backbone, ฉบับ grain, pre-aggs/EXISTS, move-status logic (TASK-030), 3 charts, cascades,
other dashboards. All DID_SPF.

## Definition of Done
- [x] `DashboardTrackingSearchRequest` has `issue_date_range`; `GetTrackingDashboard` takes `issueStart/issueEnd` with the
      two conditional `L.ISSUE_DATE` preds; service passes them. Empty range ⇒ return-all completes. `dotnet build` succeeds.
- [ ] (Acceptance, live capture) issue-date range filters correctly + no-date completes → REQ-017 DELIVERED (with TASK-030's over-move check).

## Implementation Notes
(Jason — 2026-07-24)

Small additive — one **single** issue-date range (mirror license-move; did NOT repeat the import-a8 two-range slip). All DID_SPF.

1. **Model `DashboardTrackingSearchRequest`** — added `[JsonProperty("issue_date_range")] List<string> IssueDateRange`
   (first field) + `[JsonIgnore]` `IssueDateStart` (`[0]`) / `IssueDateEnd` (`[1]`), guarded like license-move.
   Header comment now "12 filter (ช่วงวันที่อนุญาตเดี่ยว + 11 filter)".
2. **DAL `GetTrackingDashboard`** — signature now `(string issueStart, string issueEnd, string weaponCategory,
   int? unitId, List<string> weapons)`; added `:ISSUE_START`/`:ISSUE_END` binds + the two conditional predicates before
   `ORDER BY`: `AND L.ISSUE_DATE >= TO_DATE(:ISSUE_START,'YYYY-MM-DD')` / `< TO_DATE(:ISSUE_END,…) + 1`. Everything else
   unchanged (FORM_ID=10 AND LICENSE_STATUS=40, ฉบับ grain, APV/ACT pre-aggs, EXISTS line-filters, no correlated
   subqueries). Updated the method doc comment.
3. **Service `BuildTableRows`** — passes `req.IssueDateStart, req.IssueDateEnd` at the front of the
   `GetTrackingDashboard(...)` arg list.

### Verification
- `dotnet build` (Center+SPF) → **Build succeeded, 0 Error(s)** (pre-existing warnings only).
- Grep model `issue_date_range|IssueDateStart|IssueDateEnd` → present; repo `ISSUE_START|ISSUE_END` → present (binds +
  2 conditional preds). Single range (not two). Empty ⇒ omitted ⇒ return-all still completes (query already return-all-safe).
- move-status logic (TASK-030), 3 charts, cascades, other dashboards untouched. All DID_SPF.
- Static-only per brownfield rule; issue-date filtering + no-date completes = stakeholder live capture (with TASK-030's
  over-move check) → then REQ-017 DELIVERED.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
