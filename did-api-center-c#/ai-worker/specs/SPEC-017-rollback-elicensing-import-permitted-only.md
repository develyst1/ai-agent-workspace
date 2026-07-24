# SPEC-017: Roll back the ELicensing DAL wiring (Branch B) — dashboard-import ships permitted-only from DID_SPF

- Source: BUG-014-A reversal (REQ-014). **Stakeholder hard rule: `didapicenter` must NOT touch the ELicensing DB.**
- Status: ACTIVE
- Supersedes: SPEC-016 / TASK-023 (Branch B — rejected)

## Why

Branch A (grant) was dead (no grant rights); now Branch B (read ELicensing via its DAL) is **also rejected** by the
stakeholder's hard rule that Center may not touch `DID_ELICENSING`. Porter's full `DID_SPF` scan: the actual
customs-import quantity has **no source inside `DID_SPF`** (only `T_T_REQUEST_IMPORT` = the *application*, not the
actual). ⇒ **ship the permitted side only**; `imported_qty` is parked at 0 until/unless a real `DID_SPF` source is named
(stakeholder decision B). The ELicensing rollback is required **regardless of A/B** (B would attach from a DID_SPF
source, still not ELicensing).

## Change — revert everything TASK-023 added; keep the SPF query DID_SPF-clean

### A. Center — remove the ELicensing wiring (back to 3 DALs)
1. **`DashboardImportService`** — remove the `IUnitOfWorkELicensing _uowELicensing` ctor param + field; remove the
   `imp`/`impMap` fetch in `BuildTableRows`; set `ImportedQty = r.ImportedQty ?? 0` (the SQL already returns
   `0 AS ImportedQty`). No ELicensing reference remains.
2. **`Program.cs`** — remove the `oracleDBELicensingConnectionString` var, the
   `AddScoped<IUnitOfWorkELicensing, UnitOfWorkELicensing>(…)` registration, and the `using DidSpf.Oracle.DataAccess.ELicensing;`.
3. **`appsettings.json`** (+ deployed variants) — remove the `"OracleELicensing"` key.
4. **`DidSpf.WebApi.Center.csproj`** — remove the ProjectReference to `DidSpf.Oracle.DataAccess.ELicensing`.

### B. ELicensing DAL — remove the files TASK-023 added (orphaned by the rollback)
5. Delete `Entities/VRptImportProductEntity.cs`, `QueryResult/ImportedQtyResult.cs`,
   `Repositories/VRptImportProductRepository.cs`; un-wire `VRptImportProductRepo` from `IUnitOfWorkELicensing` +
   `UnitOfWorkELicensing` (property + `resetRepositories()`). Leaves the ELicensing DAL exactly as before (LK2 unaffected).

### C. SPF query — no change needed
`TTLicenseDtlRepository.GetImportDashboard` already has **no** `V_RPT_IMPORT_PRODUCT`/cross-schema ref (TASK-023
removed the JOIN; it stays removed) and selects `0 AS ImportedQty`. Leave as-is. The backbone (FORM_ID=8/status=40,
producer-country pre-agg, conditional date predicate) is the permitted-only dashboard.

## Result
`dashboard-import` is **DID_SPF-only**: permitted qty + producer country + the 3 charts all work; `imported_qty` = 0
(parked, no DID_SPF source). Keep the `imported_qty` column in the response (FE contract) returning 0 — do NOT remove
the field (avoids FE churn); documented as parked.

## Acceptance
- [ ] Center references only the 3 original DALs; no `OracleELicensing` / `IUnitOfWorkELicensing` / ELicensing project
      ref anywhere in Center; the 3 TASK-023 ELicensing files are gone; `dotnet build` succeeds.
- [ ] `/dashboard-import` chart+table return 200 from DID_SPF alone (dated + no-date); `imported_qty` = 0; permitted
      side + producer country + ฉบับ count correct. → live capture accepts the permitted-only REQ-014.

## Open (stakeholder A/B)
- **A (recommended, this spec):** park `imported_qty` at 0, ship permitted-only.
- **B:** stakeholder names a real `DID_SPF` table for actual imports → a follow-up task attaches it (pre-agg LEFT JOIN,
  like TASK-021 but a DID_SPF source). Not this spec.

## Part D — actual-import RE-ATTACH via `T_T_INFORM_IMEX` (DID_SPF) — option (B) realized (TASK-025)

DR-14 (stakeholder, live) found a **DID_SPF-native** actual-import source: `T_T_INFORM_IMEX` (+ `_DTL`) — the
inform-imex declarations, all in `DID_SPF` (no ELicensing, hard-rule compliant). Stakeholder-confirmed join + columns:
- Link is on the **DTL**: `D.REF_LICENSE_NO = L.LICENSE_NO` (T_T_LICENSE.LICENSE_NO like "7/2561"; the header's
  `LICENSE_NO` "F08…" = customs code, **unused**). `D.INFORM_IMEX_ID = H.ID`; import rows = `H.INFORM_TYPE = '0'` and
  `H.IS_CANCEL = 0`.
- qty col **= `QUANTITY`** (stakeholder final; `ACTUAL_QUANTITY` is null/0 for most rows → not used). Kept swappable in
  one place. Grain = per `REF_LICENSE_NO` + `PRODUCT_CODE` (a10 `move_qty` shape).

**Change — raw SQL only, in `GetImportDashboard` (no new entity/repo — a JOIN references table names directly, like the
producer-country pre-agg):** replace `,0 AS ImportedQty` → `,NVL(IIV.IMPORTED_QTY,0) AS ImportedQty` and add the
pre-aggregated LEFT JOIN (single materialize + hash join; no correlated subquery → no-date still completes):
```sql
LEFT JOIN (
    SELECT D.REF_LICENSE_NO, D.PRODUCT_CODE, SUM(D.QUANTITY) AS IMPORTED_QTY   -- swap→ACTUAL_QUANTITY here if stakeholder flips
      FROM T_T_INFORM_IMEX_DTL D
      INNER JOIN T_T_INFORM_IMEX H ON H.ID = D.INFORM_IMEX_ID
     WHERE H.INFORM_TYPE = '0' AND H.IS_CANCEL = 0
     GROUP BY D.REF_LICENSE_NO, D.PRODUCT_CODE
) IIV ON IIV.REF_LICENSE_NO = L.LICENSE_NO AND IIV.PRODUCT_CODE = DTL.PRODUCT_CODE
```
1 row per (license, product) → many-to-one → no multiplication (mirrors license-move `IMV`). **Capture-verify:**
`PRODUCT_CODE` alignment between `T_T_INFORM_IMEX_DTL` and `T_T_LICENSE_DTL` (legacy `PRODUCT_CODE = '-'` → naturally 0);
if non-legacy rows come back 0 due to P-code mismatch, revisit (license-level fallback) — do not pre-build it.

**Note (SA):** TASK-024's rollback already made `dashboard-import` permitted-only/DID_SPF-clean; TASK-025 re-adds the
actual column from the **DID_SPF** source, so it's independent of TASK-024 and does not reintroduce any ELicensing dep.

## Tasks
- TASK-024: execute the rollback (A + B above) — Jason. **DONE.**
- TASK-025: re-attach `imported_qty` from `T_T_INFORM_IMEX` (Part D; raw-SQL pre-agg LEFT JOIN, DID_SPF) — Jason.

## Questions
(Jason asks here; Sober answers as `> answer: ...`)
