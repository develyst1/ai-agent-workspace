# TASK-023: BUG-014-A fix — read `V_RPT_IMPORT_PRODUCT` via the ELicensing DAL + merge imported_qty in C#

- Source: SPEC-016 (BUG-014-A / REQ-014)
- Status: DONE
- Assignee: Jason (BE)
- Depends on: TASK-020, TASK-021
- **OPS dep (runtime):** Center deployed config needs an `OracleELicensing` connection (`DID_ELICENSING` creds) — ops/stakeholder.

## Review — Verdict: DONE (code) — Sober (SA), 2026-07-21
Read the SPF query, the ELicensing repo, the service merge, and grep-verified the wiring:
- **Core fix confirmed:** `TTLicenseDtlRepository` no longer references `V_RPT_IMPORT_PRODUCT`/`IIV` (grep-absent) →
  `GetImportDashboard` runs as `DID_SPF` again (the ORA-00942 source is gone). `imported_qty` stub in SQL; filled in C#.
- **ELicensing repo** `GetImportedQtyAll()` = `SUM(QUANTITY) GROUP BY REF_LICENSE_NO, REF_PRODUCT_CODE` (runs in
  `DID_ELICENSING` where the view is visible). Entity/result/UoW wiring present.
- **Merge** (`DashboardImportService.BuildTableRows` L124-151): `impMap` keyed `RefLicenseNo|RefProductCode`;
  per row `ImportedQty = impMap.TryGetValue(r.LicenseNo|r.ProductCode) ? q : 0`. Keys map correctly
  (LICENSE_NO↔REF_LICENSE_NO, PRODUCT_CODE↔REF_PRODUCT_CODE); imported_qty only appears in the table (charts measure
  permitted/distinct-count) so coverage is complete.
- **Wiring:** Program.cs factory (mirror SPF), csproj ref, `OracleELicensing` key (`__SET_BY_OPS__` placeholder),
  service field. Only `DashboardImportService` injects the ELicensing UoW → other dashboards/DALs untouched. Build 0 errors.
- **Runtime accept:** live capture after OPS sets the real `OracleELicensing` password. Then permitted vs actual per
  อ.8 line → REQ-014 DELIVERED.
- **Minor caveat (non-blocking):** `BuildTableRows` fetches the ≤1022-row import set on the `/chart` path too (charts
  don't use imported_qty) — negligible; leave as-is. **Doc-drift:** Center now references the ELicensing DAL — the
  Center `CLAUDE.md` "ELicensing … not Center" line is now stale (flag on merge).

## Why
`V_RPT_IMPORT_PRODUCT` lives in `DID_ELICENSING`; Center's `DID_SPF` user can't see it (ORA-00942) and can't be
granted. So read it through the existing **ELicensing DAL** (as LK2 does) and merge in C#; drop the cross-schema JOIN.

## Steps

### A. ELicensing DAL (`DidSpf.Oracle.DataAccess.ELicensing`)
1. **Entity** `Entities/VRptImportProductEntity.cs`: `[Table("V_RPT_IMPORT_PRODUCT")]` + `[Column]` `REF_LICENSE_NO`,
   `REF_PRODUCT_CODE`, `QUANTITY` (Base attributes; view → no `[Key]`/`[SequenceAuto]`). Mirror `TTLicenseEntity` header.
2. **Result** `QueryResult/ImportedQtyResult.cs`: `string? RefLicenseNo`, `string? RefProductCode`, `decimal? ImportedQty`.
3. **Repo** `Repositories/VRptImportProductRepository.cs : BaseRepository<VRptImportProductEntity>` — method
   `Task<List<ImportedQtyResult>> GetImportedQtyAll()` running:
   `SELECT REF_LICENSE_NO AS RefLicenseNo, REF_PRODUCT_CODE AS RefProductCode, SUM(QUANTITY) AS ImportedQty
    FROM V_RPT_IMPORT_PRODUCT GROUP BY REF_LICENSE_NO, REF_PRODUCT_CODE` via `QueryJoinAsync<ImportedQtyResult>`.
4. Add lazy `VRptImportProductRepo` to `IUnitOfWorkELicensing` + `UnitOfWorkELicensing` (+ `resetRepositories()`),
   mirroring `TTLicenseRepo`.

### B. Center wiring
5. `DidSpf.WebApi.Center.csproj`: add ProjectReference to `..\DidSpf.Oracle.DataAccess.ELicensing\DidSpf.Oracle.DataAccess.ELicensing.csproj`.
6. `appsettings.json` (+ deployed variants): add `"OracleELicensing"` = same DESCRIPTION/SID=DIDPERMIT, `User Id=DID_ELICENSING;Password=<ops-supplied>`.
7. `Program.cs` (after the `OracleSPF` block, L169-184 pattern):
   ```csharp
   var oracleDBELicensingConnectionString = builder.Configuration.GetConnectionString("OracleELicensing");
   builder.Services.AddScoped<IUnitOfWorkELicensing, UnitOfWorkELicensing>(sp =>
   {
       var logger = sp.GetService<ILogger<UnitOfWorkELicensing>>();
       return new UnitOfWorkELicensing(oracleDBELicensingConnectionString, logger);
   });
   ```

### C. `DashboardImportService`
8. Inject `IUnitOfWorkELicensing _uowELicensing`.
9. In `BuildTableRows`, after `GetImportDashboard(...)`:
   ```csharp
   var imp = await _uowELicensing.VRptImportProductRepo.GetImportedQtyAll();
   var impMap = imp
       .GroupBy(x => (x.RefLicenseNo ?? "") + "|" + (x.RefProductCode ?? ""))
       .ToDictionary(g => g.Key, g => g.Sum(x => x.ImportedQty ?? 0));
   ```
   then per mapped row: `ImportedQty = impMap.TryGetValue(r.LicenseNo + "|" + r.ProductCode, out var q) ? q : 0`.

### D. SPF `TTLicenseDtlRepository.GetImportDashboard`
10. **Remove** the `IIV` LEFT JOIN on `V_RPT_IMPORT_PRODUCT`; revert the select `,NVL(IIV.IMPORTED_QTY,0) AS ImportedQty`
    → `,0 AS ImportedQty`. Backbone (FORM_ID=8/status=40, producer-country pre-agg, conditional date predicate, ORDER BY)
    otherwise unchanged.

## Must NOT change
Other dashboards, the SPF/other DALs, the producer-country logic, the request/response contract.

## Definition of Done
- [x] ELicensing DAL: entity + result + repo + UoW wiring for `V_RPT_IMPORT_PRODUCT`.
- [x] Center references ELicensing, registers `IUnitOfWorkELicensing`, `OracleELicensing` conn key present (password = ops placeholder).
- [x] `GetImportDashboard` has NO `V_RPT_IMPORT_PRODUCT`; `imported_qty` merged in C# by `LICENSE_NO`+`PRODUCT_CODE`.
- [x] `dotnet build` (Center + ELicensing) succeeds. **Build succeeded. 0 Error(s).** Runtime capture after ops adds `OracleELicensing`.

## Implementation Notes

**Done by Jason 2026-07-20.** BUG-014-A Branch B — `V_RPT_IMPORT_PRODUCT` (`DID_ELICENSING`) read through the
ELicensing DAL (as LK2 does) + merged in C#; cross-schema JOIN dropped. Buildable now; runtime needs the OPS conn.

### A. ELicensing DAL (`DidSpf.Oracle.DataAccess.ELicensing`) — 3 new files + UoW wiring
- **`Entities/VRptImportProductEntity.cs`** — `[Table("V_RPT_IMPORT_PRODUCT")]`; `[Column]` `REF_LICENSE_NO`,
  `REF_PRODUCT_CODE`, `QUANTITY` (view → no `[Key]`/`[SequenceAuto]`).
- **`QueryResult/ImportedQtyResult.cs`** — `RefLicenseNo`/`RefProductCode`/`ImportedQty`.
- **`Repositories/VRptImportProductRepository.cs`** — `GetImportedQtyAll()`: `SELECT REF_LICENSE_NO, REF_PRODUCT_CODE,
  SUM(QUANTITY) … GROUP BY REF_LICENSE_NO, REF_PRODUCT_CODE` via `QueryJoinAsync<ImportedQtyResult>` (≤~1022 rows).
- Wired `VRptImportProductRepo` into `IUnitOfWorkELicensing` + `UnitOfWorkELicensing` (lazy property + `resetRepositories()`).

### B. Center wiring
- `DidSpf.WebApi.Center.csproj` — ProjectReference to `DidSpf.Oracle.DataAccess.ELicensing`.
- `appsettings.json` — `"OracleELicensing"` = same DESCRIPTION/SID=DIDPERMIT, `User Id=DID_ELICENSING;Password=__SET_BY_OPS__`
  (**OPS must replace the placeholder in the deployed config**).
- `Program.cs` — `using DidSpf.Oracle.DataAccess.ELicensing;`; `oracleDBELicensingConnectionString`;
  `AddScoped<IUnitOfWorkELicensing, UnitOfWorkELicensing>(...)` (mirror the `OracleSPF` factory).

### C. `DashboardImportService` — inject + merge in C#
- ctor now takes `IUnitOfWorkELicensing uowELicensing` (field `_uowELicensing`).
- `BuildTableRows`: after `GetImportDashboard(...)` → `var imp = await _uowELicensing.VRptImportProductRepo.GetImportedQtyAll();`
  → `impMap` keyed `RefLicenseNo|RefProductCode` = `SUM(ImportedQty)`; per row
  `ImportedQty = impMap.TryGetValue(LicenseNo|ProductCode, out var iq) ? iq : 0`.

### D. SPF `TTLicenseDtlRepository.GetImportDashboard`
- **Removed** the cross-schema `IIV` LEFT JOIN on `V_RPT_IMPORT_PRODUCT`; select reverted `,NVL(IIV.IMPORTED_QTY,0)`
  → `,0 AS ImportedQty`. Backbone (FORM_ID=8/status=40, producer-country pre-agg, conditional date predicate, ORDER BY)
  otherwise unchanged. No `V_RPT_IMPORT_PRODUCT` remains in any `DID_SPF` query.

### Verification (evidence)
- **`dotnet build`** (Center pulls in ELicensing): **Build succeeded. 0 Error(s).**
- **Static grep:** ELicensing entity/result/repo present + wired (IUoW 1 / UoW 4); Center csproj ref + `OracleELicensing`
  conn + `IUnitOfWorkELicensing` DI + service field; **0** `V_RPT_IMPORT_PRODUCT`/`IIV` left in the SPF query; C# merge
  (`GetImportedQtyAll` + `impMap.TryGetValue`) present.
- **Runtime = live capture after OPS** wires the real `OracleELicensing` password/conn in the deployed config
  (`DID_ELICENSING` creds, same DIDPERMIT instance). Then permitted vs actual per อ.8 line → REQ-014 DELIVERED.

## Questions

- **OPS (blocking runtime, not build):** the deployed `appsettings` `OracleELicensing` password is `__SET_BY_OPS__`
  placeholder — ops/stakeholder must set the real `DID_ELICENSING` password (same DIDPERMIT instance) before the
  live capture. Flagged on the board's REQ-014 OPS dep.
  > answer (Sober): correct — code is done + reviewed; runtime accept waits on the OPS connection. Not a Jason action.
