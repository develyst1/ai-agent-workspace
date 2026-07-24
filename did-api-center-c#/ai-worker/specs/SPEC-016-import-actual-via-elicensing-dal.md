# SPEC-016: dashboard-import actual qty via the ELicensing DAL (cross-schema, no grant) — BUG-014-A Branch B

- Source: BUG-014-A (REQ-014). Root cause: `V_RPT_IMPORT_PRODUCT` is owned by **`DID_ELICENSING`**; Center runs as
  `DID_SPF` → the cross-schema JOIN in `GetImportDashboard` throws **ORA-00942** for every call. Branch A (DBA grant)
  is dead — stakeholder has no grant rights. So read the view **through the ELicensing DAL** (as LK2 already does) and
  merge in C#.
- Status: ACTIVE
- **OPS dependency (blocks runtime, not the code):** Center's deployed config must add an `OracleELicensing`
  connection (User Id `DID_ELICENSING`, same DESCRIPTION/SID=DIDPERMIT as the others). Stakeholder/ops to supply the
  `DID_ELICENSING` password. Until then the code builds + merges, but the UoW connection fails at runtime.

## Confirmed facts
- Same DB instance (SID=DIDPERMIT), different schema owner `DID_ELICENSING`. `V_RPT_IMPORT_PRODUCT` = 1022 rows,
  columns `REF_LICENSE_NO` / `REF_PRODUCT_CODE` / `QUANTITY` correct (no ORA-00904) — SQL was right; only cross-schema
  visibility is the issue. `REF_LICENSE_NO` = the อ.8 `T_T_LICENSE.LICENSE_NO`; `REF_PRODUCT_CODE` = `T_T_LICENSE_DTL.PRODUCT_CODE`.
- ELicensing DAL (`DidSpf.Oracle.DataAccess.ELicensing`) already exists with `IUnitOfWorkELicensing` /
  `UnitOfWorkELicensing(connString, logger)` (same shape as SPF: lazy repos, `QueryJoinAsync`). Center does **not** yet
  reference it. LK2 is the proven consumer.

## Change

### A. ELicensing DAL — add the report-view read
1. **Entity** `Entities/VRptImportProductEntity.cs` — `[Table("V_RPT_IMPORT_PRODUCT")]`, cols `REF_LICENSE_NO`,
   `REF_PRODUCT_CODE`, `QUANTITY` (Base attributes + the `using ColumnAttribute = …Base.ColumnAttribute` aliases;
   view → no key/sequence).
2. **QueryResult** `QueryResult/ImportedQtyResult.cs` (or inline) — `RefLicenseNo`, `RefProductCode`, `decimal? ImportedQty`.
3. **Repo** `Repositories/VRptImportProductRepository.cs : BaseRepository<VRptImportProductEntity>` with:
   ```sql
   SELECT REF_LICENSE_NO AS RefLicenseNo, REF_PRODUCT_CODE AS RefProductCode, SUM(QUANTITY) AS ImportedQty
     FROM V_RPT_IMPORT_PRODUCT
    GROUP BY REF_LICENSE_NO, REF_PRODUCT_CODE
   ```
   → `Task<List<ImportedQtyResult>> GetImportedQtyAll()`. Pre-aggregated once (≤1022 groups; runs as DID_ELICENSING → valid).
4. Wire into `IUnitOfWorkELicensing` + `UnitOfWorkELicensing` (add the lazy `VRptImportProductRepo` property + `resetRepositories()`), mirroring `TTLicenseRepo`.

### B. Center — reference + register the ELicensing UoW (mirror IUnitOfWorkSPF)
5. **`DidSpf.WebApi.Center.csproj`** — add `<ProjectReference Include="..\DidSpf.Oracle.DataAccess.ELicensing\DidSpf.Oracle.DataAccess.ELicensing.csproj" />`.
6. **`appsettings.json`** (+ deployed variants) — add `"OracleELicensing": "…User Id=DID_ELICENSING;Password=<ops>;"`
   (same DESCRIPTION/SID=DIDPERMIT). **Password = OPS/stakeholder.**
7. **`Program.cs`** (mirror L169-184):
   ```csharp
   var oracleDBELicensingConnectionString = builder.Configuration.GetConnectionString("OracleELicensing");
   builder.Services.AddScoped<IUnitOfWorkELicensing, UnitOfWorkELicensing>(sp =>
   {
       var logger = sp.GetService<ILogger<UnitOfWorkELicensing>>();
       return new UnitOfWorkELicensing(oracleDBELicensingConnectionString, logger);
   });
   ```

### C. DashboardImportService — merge imported_qty in C#
8. Inject `IUnitOfWorkELicensing _uowELicensing` (ctor).
9. In `BuildTableRows`, after `GetImportDashboard(...)`:
   ```csharp
   var imp = await _uowELicensing.VRptImportProductRepo.GetImportedQtyAll();
   var impMap = imp
       .GroupBy(x => (x.RefLicenseNo ?? "") + "|" + (x.RefProductCode ?? ""))
       .ToDictionary(g => g.Key, g => g.Sum(x => x.ImportedQty ?? 0));
   // per row: imported_qty = impMap.TryGetValue(row.LicenseNo + "|" + row.ProductCode, out var q) ? q : 0
   ```
   Set `ImportedQty` on each mapped row from `impMap` (0 if absent). Same value as the old SQL SUM, computed in C#.

### D. SPF `GetImportDashboard` — drop the cross-schema JOIN
10. Remove the `IIV` LEFT JOIN on `V_RPT_IMPORT_PRODUCT` and revert the select to `,0 AS ImportedQty` (C# now fills it).
    This makes the query run cleanly as `DID_SPF` again. **Everything else in the backbone unchanged** (FORM_ID=8/status=40,
    producer-country pre-agg, conditional date predicate, ORDER BY).

## Decisions (carry from TASK-021, unchanged)
ประเทศผู้ผลิต stays the license-declared producer (`T_T_LICENSE_DTL_PRODUCER`); `imported_qty` sums ALL declarations
(no `IS_CONFIRM` filter) by default — confirm at capture.

## Acceptance
- [ ] `dotnet build` (Center + ELicensing) succeeds; `GetImportDashboard` has no `V_RPT_IMPORT_PRODUCT` reference.
- [ ] With `OracleELicensing` deployed: `/dashboard-import` chart+table return 200; `imported_qty` = SUM per
      (license, product) matching the view; dated + no-date both complete. (Runtime accept blocked on the OPS connection.)
- [ ] Other dashboards / DALs untouched.

## Tasks
- TASK-023: implement Branch B (A–D above) — Jason. (Runtime capture after ops adds `OracleELicensing`.)

## Questions
(Jason asks here; Sober answers as `> answer: ...`)
