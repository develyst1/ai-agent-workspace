# SPEC-009: Unify the ประเภทอาวุธ dropdown onto ONE shared config (a10 + move-license)

- Source: REQ-009
- Status: ACTIVE

## Overview

Both move dashboards' weapon-type dropdown read **one shared appsettings key** with the same logic:
**config codes present → show those (in config order, filtered by DB); config empty/unset → show ALL DB
groups** (no silent-empty trap). Default config = all 4 PTG. Labels always from `TMProductTypeGroupRepo`.
Retire the move-license-only `MoveLicenseWeaponTypeCodes`.

**Q answers (SA):** Q1 shared key = **`Configurations:DashboardWeaponTypeCodes`** (retire the old key). Q2
**empty ⇒ ALL** (Porter/stakeholder default — robust). Q3 a10 now reads the shared config too; with config =
all 4 (or empty⇒all) its behaviour is unchanged.

## Config plumbing
- `Models/ConfigurationsModel.cs`: rename `MoveLicenseWeaponTypeCodes` → **`DashboardWeaponTypeCodes`** (`List<string>`).
- `Program.cs` (in the `Configure<ConfigurationsModel>` block): map
  `options.DashboardWeaponTypeCodes = sectionConfigurations.GetSection("DashboardWeaponTypeCodes").Get<List<string>>() ?? new();`
  (remove the `MoveLicenseWeaponTypeCodes` mapping).
- `appsettings.json`: replace `MoveLicenseWeaponTypeCodes` with
  `"DashboardWeaponTypeCodes": [ "PTG01", "PTG02", "PTG03", "PTG04" ]` (default all 4).

## Shared dropdown logic (both `DashboardMoveA10Service` + `DashboardMoveLicenseService`, in `SearchFilter()`)
```csharp
var ptgGroups = await _uowSPF.TMProductTypeGroupRepo.GetDataAll();
dataResponse.WeaponTypeDdl.Items =
    (_weaponTypeCodes == null || _weaponTypeCodes.Count == 0)
        ? ptgGroups   // empty/unset ⇒ ALL (no silent-empty)
            .Select(g => new DropdownDDLItem { Value = g.ProductTypeGroupCode, Label = g.ProductTypeGroupName })
            .ToList()
        : _weaponTypeCodes   // configured codes that exist in DB, in config order
            .Where(code => ptgGroups.Any(g => g.ProductTypeGroupCode == code))
            .Select(code => new DropdownDDLItem
            {
                Value = code,
                Label = ptgGroups.First(g => g.ProductTypeGroupCode == code).ProductTypeGroupName
            })
            .ToList();
```
- **`DashboardMoveLicenseService`**: ctor already injects `IOptions<ConfigurationsModel>`; change
  `_weaponTypeCodes = config.Value.DashboardWeaponTypeCodes ?? new()`. Replace the current config-only
  dropdown block (which yields empty when the list is empty) with the above (adds the empty⇒all branch).
- **`DashboardMoveA10Service`**: currently lists all via `GetDataAll` and does **not** inject config →
  **add `IOptions<ConfigurationsModel> config` to the ctor** + `_weaponTypeCodes` field, and use the same
  block. (Service stays `AddScoped`; `IOptions` already registered — no DI change.)

## Non-functional / Out of scope
- Config only limits the dropdown **options**; no chart/table data filter, no cascade change, no other
  dashboards. `dotnet build` succeeds. Deterministic + resolvable from an already-used repo → Sober-review
  accept, no live capture (the empty⇒all default means it can't silently break).

## Tasks
- TASK-013: shared `DashboardWeaponTypeCodes` config + unified empty⇒all dropdown in both services. (depends on: —)

## Questions
(Jason asks here; Sober answers as `> answer: ...`)
