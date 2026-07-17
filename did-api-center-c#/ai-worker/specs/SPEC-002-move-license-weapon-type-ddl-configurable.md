# SPEC-002: DASHBOARD_LICENSE_MOVE — weapon-type dropdown codes from appsettings (DB-sourced labels)

- Source: REQ-002
- Status: DONE
- **Revised 2026-07-17** — label source changed from in-code map → **DATABASE** (per stakeholder,
  REQ-002 Requirement #3 revised). Supersedes the first draft of this spec.

## Overview

Drive the weapon-type filter dropdown (`product_type_group_code_ddl`) from a **configurable list of
product-type-group codes in `appsettings.json`**. Config carries **codes only, in display order**; the
Thai **label is looked up from the DATABASE** by code — WHERE-IN semantics: a configured code that
exists in the DB shows (with its DB Thai name); a configured code absent from the DB simply doesn't
appear (no error, no log).

**Approach — reuse existing infra end-to-end, add nothing new:**
- Config: the project already binds `Configurations` → `ConfigurationsModel` via
  `Configure<ConfigurationsModel>` (`Program.cs:191-209`), exposed as `IOptions<ConfigurationsModel>`.
- DB label source: **already wired** — `IUnitOfWorkSPF.TMProductTypeGroupRepo`
  (`TMProductTypeGroupRepository`) over entity `TMProductTypeGroupEntity`
  (`[Table("T_M_PRODUCT_TYPE_GROUP")]`, key `PRODUCT_TYPE_GROUP_CODE` → `ProductTypeGroupCode`,
  `PRODUCT_TYPE_GROUP_NAME` → `ProductTypeGroupName`). Finder `GetDataAll()` returns all rows.

**No DATA REQUEST needed.** The code→Thai-name table, its columns, its repository, and its UoW exposure
all exist in the codebase (the same table is already used in `TTLicenseDtlRepository.GetTraderLicenseDtl`
as `PTG.PRODUCT_TYPE_GROUP_NAME`). Verified from code — no DB access required.

## What changes vs the current REVIEW build (TASK-002)

Jason's current REVIEW implementation already did the config plumbing correctly — **keep all of it**:
- `appsettings.json` key `Configurations:MoveLicenseWeaponTypeCodes` = `["PTG01","PTG02","PTG03"]` ✓
- `ConfigurationsModel.MoveLicenseWeaponTypeCodes` (`List<string>`) ✓
- `Program.cs` mapping line in the `Configure<ConfigurationsModel>` block ✓
- `IOptions<ConfigurationsModel>` ctor injection + `_weaponTypeCodes` field ✓

**Only the label source changes:** replace the `WEAPON_TYPES` in-code map lookup with a
`TMProductTypeGroupRepo` DB lookup, and **remove the now-orphaned `WEAPON_TYPES` array**.

## Config design (unchanged)

```jsonc
"Configurations": {
    ...
    "MoveLicenseWeaponTypeCodes": [ "PTG01", "PTG02", "PTG03" ]   // อ.10 weapon-type filter; codes only, order = display order
}
```
- Add the same key to `appsettings.Development.json` only if it has its own `Configurations` block that
  would override (BE to check).
- Codes are `ConstantSPF.ProductTypeGroupCode` (PTG01–PTG04); initial set excludes PTG04.

## Code design

### 1. `Models/ConfigurationsModel.cs` — (already done, keep)
```csharp
public List<string> MoveLicenseWeaponTypeCodes { get; set; } = new List<string>();
```

### 2. `Program.cs` — (already done, keep) map inside the existing `Configure<ConfigurationsModel>` block
```csharp
options.MoveLicenseWeaponTypeCodes =
    sectionConfigurations.GetSection("MoveLicenseWeaponTypeCodes").Get<List<string>>() ?? new List<string>();
```

### 3. `Services/DashboardMoveLicenseService.cs` — **CHANGE the label source to DB**
- Ctor / `_weaponTypeCodes` / `IOptions` injection: **keep as-is** (already in the REVIEW build).
- **Remove** the `private static readonly (string Code, string Label)[] WEAPON_TYPES = {...}` array
  (lines ~36-42) — it was the in-code label source and is now orphaned. (Its `ProductTypeGroupCode.*`
  references are the only ones in this file; the constants stay in `ConstantSPF`. Leave the
  `using static ...ConstantSPF;` unless the build flags it unused.)
- **Rewrite** the weapon-type dropdown build in `SearchFilter()` (currently the `labelByCode` block,
  lines ~71-77) to source labels from the DB, in config order, WHERE-IN semantics:
  ```csharp
  // ประเภทอาวุธ — รหัส+ลำดับมาจาก config ; label มาจาก DB (T_M_PRODUCT_TYPE_GROUP)
  // WHERE-IN: รหัสที่ไม่มีใน DB จะไม่ขึ้น (ไม่ error ไม่ log)
  var ptgGroups = await _uowSPF.TMProductTypeGroupRepo.GetDataAll();
  var nameByCode = ptgGroups.ToDictionary(g => g.ProductTypeGroupCode, g => g.ProductTypeGroupName);
  dataResponse.WeaponTypeDdl.Items = _weaponTypeCodes
      .Where(code => nameByCode.ContainsKey(code))
      .Select(code => new DropdownDDLItem { Value = code, Label = nameByCode[code] })
      .ToList();
  ```

Why `GetDataAll()` (one call) + in-memory dict rather than per-code `GetDataByProductTypeGroupCode`
(N calls): `T_M_PRODUCT_TYPE_GROUP` is a tiny master table (~4 rows); one round-trip + dictionary is
simpler and faster than looping. Config order is preserved by iterating `_weaponTypeCodes`.

## Flow

`SearchFilter()` → read `_weaponTypeCodes` (config) → load `TMProductTypeGroupRepo.GetDataAll()` once →
for each configured code **in order**, if present in the DB map emit `{ value: code, label: DB Thai
name }`; codes not in the DB are skipped. Everything else in `SearchFilter()` and all chart/table logic
is unchanged.

## Non-functional

- No auth/validation/perf change (one extra small master-table read). `dotnet build` must succeed.
- **No data-level filtering added** (REQ Out of Scope): config controls only the dropdown options; the
  chart/table still filter by whatever value the user selects (existing `InList`/`MatchEq` on
  `req.WeaponCategory`). Do NOT add a server-side category filter.

## Out of scope (from REQ-002)

- No labels in config (codes only). No change to other dropdowns, cascade endpoints, other dashboards,
  chart/table logic, or REQ-001's key naming.

## Tasks

- TASK-002: Make the weapon-type dropdown config-driven with DB-sourced labels (depends on: —)

## Questions

(Jason asks here; Sober answers as `> answer: ...`)

## Resolved decisions

- **Label source = DB** (`T_M_PRODUCT_TYPE_GROUP.PRODUCT_TYPE_GROUP_NAME`), not the in-code map
  (stakeholder, 2026-07-17). WHERE-IN semantics; **no warning log** for codes absent from the DB
  (stakeholder confirmed). Dropdown order = config order (REQ intent). **No DATA REQUEST needed** —
  source table/repo/columns exist in code.
