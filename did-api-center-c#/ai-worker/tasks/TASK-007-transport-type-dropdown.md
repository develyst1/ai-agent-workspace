# TASK-007: Add T_R_TRANSPORT_TYPE SPF entity + wire the ประเภทการขนย้าย dropdown

- Source: SPEC-005
- Status: SUPERSEDED (2026-07-20) — `T_R_TRANSPORT_TYPE` is the WRONG source; stakeholder re-sourced
  ประเภทการขนย้าย to `T_T_REQUEST_MOVE.MOVE_REQUEST_TYPE` (common-code `MoveRequestType`). The
  `T_R_TRANSPORT_TYPE` entity/repo/wiring built here is now dead code and is **removed in TASK-006 REWORK #4**.
  (Kept for history; the DATA REQ 2 column facts were correct — the table was just empty and not the source.)
- Depends on: none

## Confirmed columns (DATA REQUEST 2, 2026-07-20)

`T_R_TRANSPORT_TYPE`: **`TRANSPORT_TYPE_CODE`** (NUMBER — code / dropdown value) +
**`TRANSPORT_TYPE_NAME`** (VARCHAR2 — Thai label) [+ CREATE/UPDATE audit, ignore].

## What to do

1. Add a new SPF DAL entity `TRTransportTypeEntity` (`[Table("T_R_TRANSPORT_TYPE")]`, key
   `TransportTypeCode` = `TRANSPORT_TYPE_CODE`, `TransportTypeName` = `TRANSPORT_TYPE_NAME`) + repository
   `TRTransportTypeRepository` with `GetDataAll()` (and `GetDataByCode(int)` if handy), wired into
   `IUnitOfWorkSPF`/`UnitOfWorkSPF`. Use the `spf-add-entity` skill; mirror `TRLicenseFormRepository`.
2. In `DashboardMoveA10Service.SearchFilter()`, replace the empty ประเภทการขนย้าย
   (`MoveTypeDdl`, the `// TASK-007` stub) with a real lookup: `value = TRANSPORT_TYPE_CODE.ToString()`,
   `label = TRANSPORT_TYPE_NAME`, ordered naturally.
3. Coordinate with TASK-006: the table's `transport_type_code_name` resolves `LDTL.TRANSPORT_TYPE_CODE`
   → `TRANSPORT_TYPE_NAME` via this repo (build a code→name dict, like move-license's common-code maps).

## Definition of Done
- [x] `T_R_TRANSPORT_TYPE` entity/repo added + wired into `IUnitOfWorkSPF`.
- [x] ประเภทการขนย้าย dropdown returns real code→name (no longer empty).
- [~] Table `transport_type_code_name` resolved from the same source — **TASK-006's job** (the repo +
      `GetDataByCode`/`GetDataAll` are ready for it to build the code→name dict). Not in TASK-007 scope.
- [x] `dotnet build` succeeds. **Build succeeded. 0 Error(s).**

## Implementation Notes

**Done by Jason 2026-07-17.** Added the `T_R_TRANSPORT_TYPE` SPF entity/repo (via `spf-add-entity`) and wired
the ประเภทการขนย้าย dropdown in `DashboardMoveA10Service`. Natural-key reference table (mirrors
`TRLicenseForm*`), no sequence.

### Files created (2, SPF DAL)
1. **`Entities/TRTransportTypeEntity.cs`** — `[Table("T_R_TRANSPORT_TYPE")]`; `[Key][Column("TRANSPORT_TYPE_CODE")]
   int TransportTypeCode`; `[Column("TRANSPORT_TYPE_NAME")] string? TransportTypeName`; + 4 audit columns
   (CREATE/UPDATE date+user). No `[AutoNoAndKey]`/`[SequenceAuto]` — the code is a natural key (no insert path),
   same shape as `TRLicenseFormEntity`.
2. **`Repositories/TRTransportTypeRepository.cs`** — ctor + `GetDataAll()` (for the dropdown + TASK-006's
   code→name dict) + `GetDataByCode(int)` (point lookup, `:TRANSPORT_TYPE_CODE`). Mirrors `TRLicenseFormRepository`.

### Files changed (3 DAL wiring + 1 service)
- `IUnitOfWorkSPF.cs` — added `TRTransportTypeRepository TRTransportTypeRepo { get; }` (after `TRLicenseFormRepo`).
- `UnitOfWorkSPF.cs` — added the lazy property (field `tRTransportTypeRepo` + `??=` guarded by transaction) and the
  `tRTransportTypeRepo = null!;` reset in `resetRepositories()` under the `// ----- TR -----` group.
- `Services/DashboardMoveA10Service.cs` — replaced the `// TASK-007` empty `MoveTypeDdl` stub with a real lookup:
  `TRTransportTypeRepo.GetDataAll()` → `OrderBy(TransportTypeCode)` → `{ Value = code.ToString(), Label = TRANSPORT_TYPE_NAME }`.
  Updated the class doc note (transport-type no longer pending).

### Verification (evidence)
- **`dotnet build`** (from `spf/DidSpf.WebApi.Center`, builds the DAL too): **Build succeeded. 0 Error(s).**
- **Static grep:** `TRTransportTypeRepo` present in all 3 DAL spots (interface + property + reset — 4 refs in
  `UnitOfWorkSPF.cs`: field decl, property sig, `??=`, reset); A10 service `MoveTypeDdl` now sourced from
  `TRTransportTypeRepo.GetDataAll()`.
- Live-response check deferred (brownfield — needs running Center + Oracle). The dropdown mirrors the same
  `GetDataAll → DropdownDDLItem` shape already shipped (e.g. weapon-type / book-type), so the query wiring is proven.

## Questions

(Jason asks; Sober answers as `> answer: ...`)

## Review

**Verdict: DONE — Sober (SA), 2026-07-20.** Verified the code:
- `TRTransportTypeEntity` (`[Table("T_R_TRANSPORT_TYPE")]`, `[Key] TransportTypeCode`=`TRANSPORT_TYPE_CODE`,
  `TransportTypeName`=`TRANSPORT_TYPE_NAME`, + audit) — matches the confirmed columns; mirrors the proven
  `TRLicenseFormEntity` natural-key pattern (no sequence, correct).
- `TRTransportTypeRepository` (`GetDataAll` + `GetDataByCode`) wired into `IUnitOfWorkSPF` +
  `UnitOfWorkSPF` (field + `??=` property + reset) — verified at `UnitOfWorkSPF.cs:1301-1308`.
- `DashboardMoveA10Service.SearchFilter()` ประเภทการขนย้าย now sourced from `TRTransportTypeRepo.GetDataAll()`
  (`value = code`, `label = TRANSPORT_TYPE_NAME`); TASK-006 reuses the same repo for the table's
  `transport_type_code_name` dict. Build 0 errors.
- Low data risk (seeded ref table; same shape as shipped weapon-type/book-type dropdowns). No rework.
