# TASK-007: Add T_R_TRANSPORT_TYPE SPF entity + wire the ประเภทการขนย้าย dropdown

- Source: SPEC-005
- Status: TODO  (UNBLOCKED — DATA REQUEST 2 answered: columns confirmed)
- Depends on: none (TASK-006 consumes it for the table's `transport_type_code_name`)

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
- [ ] `T_R_TRANSPORT_TYPE` entity/repo added + wired into `IUnitOfWorkSPF`.
- [ ] ประเภทการขนย้าย dropdown returns real code→name (no longer empty).
- [ ] Table `transport_type_code_name` resolved from the same source (with TASK-006).
- [ ] `dotnet build` succeeds.

## Implementation Notes / Questions / Review
(Jason fills Implementation Notes; Sober fills Review.)
