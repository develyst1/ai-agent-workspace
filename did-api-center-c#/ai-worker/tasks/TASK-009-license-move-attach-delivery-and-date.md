# TASK-009: LICENSE_MOVE — attach real `move_qty` (INFORM_MOVE SUM) + single formatted `issue_date`

- Source: SPEC-006 (core) + SPEC-007 (date)
- Status: TODO
- Depends on: none

## Part A — attach real delivered qty (SPEC-006 core)

Populate col 12 `move_qty` (จำนวนขนย้ายจริง; currently hardcoded 0) from the verified INFORM_MOVE source.
Backbone unchanged (`GetMoveLicenseDashboard` = approved อ.10 license × weapon lines).

1. **SQL (`TTLicenseDtlRepository.GetMoveLicenseDashboard`)** — add a correlated scalar subquery:
   ```sql
   ,(SELECT NVL(SUM(IMD.QUANTITY), 0)
       FROM T_T_INFORM_MOVE_DTL IMD
      WHERE IMD.REF_LICENSE_NO = L.LICENSE_NO
        AND IMD.PRODUCT_CODE   = DTL.PRODUCT_CODE) AS MovedQty
   ```
   (`L` = the license alias, `DTL` = `T_T_LICENSE_DTL` weapon line in that query.)
2. **DTO** `DashboardMoveLicenseQueryResult`: add `public decimal? MovedQty { get; set; }`.
3. **Service `DashboardMoveLicenseService.BuildTableRows`:** map `MoveQty = r.MovedQty ?? 0` (was
   `MoveQty = 0`). Leave `Qty`/`quantity` (approved) and the charts (measure approved) unchanged.

## Part B — single formatted `issue_date` (SPEC-007)

4. `Models/Dashboard/DashboardMoveLicenseModel.cs` → `DashboardMoveLicenseTableRow`: **remove**
   `issue_date_formatted` (property + `[JsonProperty]`); keep `issue_date`.
5. Service `BuildTableRows`: set `Date` (`issue_date`) = `r.IssueDate.ToStringTH(FormatStr.DATEONLY)` (was ISO);
   delete the `DateFormatted` line.

**DO NOT:** change the backbone/filters/charts; touch the type columns (col5/col6 — separate, blocked on the
naming-trap confirmation); touch other dashboards or shared classes.

## Definition of Done
- [ ] `move_qty` = `NVL(SUM(INFORM_MOVE_DTL.QUANTITY),0)` matched by `REF_LICENSE_NO`+`PRODUCT_CODE`; 0 if none;
      approved-undelivered rows still present.
- [ ] `issue_date` = single formatted TH; `issue_date_formatted` removed.
- [ ] `quantity` (approved) + charts unchanged; `dotnet build` succeeds. Paste output.
- [ ] (Acceptance) live capture confirms `move_qty` non-zero where deliveries exist (Porter, like A10).

## Implementation Notes / Questions / Review
(Jason fills Implementation Notes; Sober fills Review.)
