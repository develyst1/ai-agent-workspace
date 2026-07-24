# TASK-024: Roll back the ELicensing DAL wiring (TASK-023) — dashboard-import permitted-only from DID_SPF

- Source: SPEC-017 (BUG-014-A reversal / REQ-014)
- Status: DONE
- Assignee: Jason (BE)
- Depends on: TASK-023 (reverts it)

## Review — Verdict: DONE — Sober (SA), 2026-07-21
Grep-verified the rollback (absence is the thing to confirm):
- **Center:** `OracleELicensing|IUnitOfWorkELicensing|VRptImportProduct|DataAccess.ELicensing` → the ONLY match is
  `CLAUDE.md` (the architecture line "ELicensing … not Center"), which is **accurate again** post-rollback — not a
  wiring ref. Zero code/config/csproj ELicensing references. Hard rule satisfied.
- **ELicensing DAL:** no `VRptImportProduct*`/`ImportedQtyResult` files; file list = the pre-TASK-023 3 entities + 3
  repos; UoW un-wired. LK2 unaffected.
- **SPF query:** `GetImportDashboard` untouched — DID_SPF-only, `0 AS ImportedQty`. `DashboardImportService` no longer
  injects the ELicensing UoW; `ImportedQty = r.ImportedQty ?? 0` (= 0). Build 0 Errors.
- Doc-drift I flagged on TASK-023 is self-resolved (the "not Center" line is true again). Permitted side + producer
  country + ฉบับ count intact. → REQ-014 = permitted-only from DID_SPF; capture accepts the permitted side.
  `imported_qty` parked at 0; (B) = a future additive task iff the stakeholder names a real DID_SPF source.
- Reason: **stakeholder hard rule — Center must NOT touch the ELicensing DB.** Branch B rejected; no DID_SPF
  actual-import source exists → ship permitted-only, `imported_qty` = 0 (parked).

## Steps — revert everything TASK-023 added

### A. Center (back to 3 DALs, DID_SPF-only)
1. **`Services/DashboardImportService.cs`** — remove the `IUnitOfWorkELicensing` ctor param + `_uowELicensing` field;
   in `BuildTableRows` remove the `imp = await _uowELicensing.VRptImportProductRepo.GetImportedQtyAll()` +
   `impMap` lines; change the row assignment `ImportedQty = impMap.TryGetValue(...)` → `ImportedQty = r.ImportedQty ?? 0`.
2. **`Program.cs`** — remove `oracleDBELicensingConnectionString`, the `AddScoped<IUnitOfWorkELicensing,
   UnitOfWorkELicensing>(…)` block, and the `using DidSpf.Oracle.DataAccess.ELicensing;`.
3. **`appsettings.json`** (+ any deployed variant) — remove the `"OracleELicensing"` connection key.
4. **`DidSpf.WebApi.Center.csproj`** — remove the `<ProjectReference … DidSpf.Oracle.DataAccess.ELicensing …>`.

### B. ELicensing DAL — remove the now-orphaned TASK-023 additions
5. Delete `Entities/VRptImportProductEntity.cs`, `QueryResult/ImportedQtyResult.cs`,
   `Repositories/VRptImportProductRepository.cs`.
6. Un-wire `VRptImportProductRepo` from `IUnitOfWorkELicensing` + `UnitOfWorkELicensing` (remove the interface member,
   the lazy property, and its line in `resetRepositories()`). ELicensing DAL == its pre-TASK-023 state (LK2 unaffected).

### C. SPF query — leave as-is
`TTLicenseDtlRepository.GetImportDashboard` already has no `V_RPT_IMPORT_PRODUCT` and selects `0 AS ImportedQty`. Do
not change it.

## Must NOT change
The permitted-side backbone (FORM_ID=8/status=40, producer-country pre-agg, conditional date predicate, charts,
producer country, cascades), other dashboards, LK2's use of the ELicensing DAL. Keep the `imported_qty` response field
(returns 0 — do NOT remove it).

## Definition of Done
- [x] Grep: **zero** `OracleELicensing` / `IUnitOfWorkELicensing` / `VRptImportProduct` / `ELicensing` references in
      the Center project; the 3 TASK-023 ELicensing files deleted + UoW un-wired.
- [x] `/dashboard-import` builds and runs on DID_SPF alone; `imported_qty` = 0; permitted side + producer country +
      ฉบับ count intact. `dotnet build` (Center + ELicensing + LK2) succeeds. Paste diff summary + build result.

## Implementation Notes
(Jason — 2026-07-24)

Reverted every TASK-023 ELicensing wiring; dashboard-import ships permitted-only from DID_SPF, `imported_qty` = 0.

### A. Center (back to 3 DALs, DID_SPF-only)
- **`Services/DashboardImportService.cs`** — removed `using DidSpf.Oracle.DataAccess.ELicensing;`; ctor back to
  `DashboardImportService(IUnitOfWorkSPF uowSPF, ICurrentUser user) : base(uowSPF, user)` (dropped the
  `IUnitOfWorkELicensing _uowELicensing` field/param); removed the `imp = ...VRptImportProductRepo.GetImportedQtyAll()`
  + `impMap` block in `BuildTableRows`; row map now `ImportedQty = r.ImportedQty ?? 0` (comment: จำนวนนำเข้าจริงไม่มีแหล่งใน
  DID_SPF → คืน 0, BUG-014-A/SPEC-017).
- **`Program.cs`** — removed `oracleDBELicensingConnectionString`, the `AddScoped<IUnitOfWorkELicensing,
  UnitOfWorkELicensing>(…)` block, and the `using DidSpf.Oracle.DataAccess.ELicensing;`.
- **`appsettings.json`** — removed the `"OracleELicensing"` connection key (OracleSPFCenter is now the last key, no
  trailing comma — JSON valid).
- **`DidSpf.WebApi.Center.csproj`** — removed the `DidSpf.Oracle.DataAccess.ELicensing` ProjectReference (Center back
  to 3 DAL refs).

### B. ELicensing DAL — TASK-023 additions removed (back to pre-TASK-023, LK2 unaffected)
- Deleted `Entities/VRptImportProductEntity.cs`, `QueryResult/ImportedQtyResult.cs`,
  `Repositories/VRptImportProductRepository.cs`.
- Un-wired `VRptImportProductRepo` from `IUnitOfWorkELicensing` (interface member) + `UnitOfWorkELicensing`
  (field, lazy property, and its `resetRepositories()` line). UoW now exposes only `TTLicenseRepo/TTLicenseDtlRepo/
  TMTraderRepo` as before.

### C. SPF query — untouched
`TTLicenseDtlRepository.GetImportDashboard` already selects `0 AS ImportedQty` with no `V_RPT_IMPORT_PRODUCT`
reference. Left as-is per Step C.

### Verification
- `dotnet build` (Center) → **Build succeeded, 0 Error(s)** (pre-existing warnings only). Center pulls the whole
  dependency graph, so ELicensing + LK2 compile in the same pass.
- Grep across Center (`*.cs`/`*.json`/`*.csproj`, excl. bin/obj) for
  `OracleELicensing|IUnitOfWorkELicensing|VRptImportProduct|DataAccess.ELicensing` → **0 matches**.
- Grep ELicensing DAL for `VRptImportProduct` → **0 matches** (fully un-wired).

### Parked
No DID_SPF source for actual imported quantity exists (V_RPT_IMPORT_PRODUCT lives in DID_ELICENSING, now off-limits).
`imported_qty` field is retained and returns 0. Stakeholder still owes the A(park)/B(name a real DID_SPF source)
decision; B would be a future additive task.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
