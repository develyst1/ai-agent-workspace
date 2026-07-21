# TASK-013: shared `DashboardWeaponTypeCodes` config + unified empty⇒all weapon dropdown (a10 + license)

- Source: SPEC-009
- Status: REVIEW
- Depends on: none

## What to do

Unify the ประเภทอาวุธ dropdown for **both** move dashboards onto one shared config, with **empty⇒all** fallback.

### 1. Config (retire `MoveLicenseWeaponTypeCodes` → shared `DashboardWeaponTypeCodes`)
- `Models/ConfigurationsModel.cs`: rename `MoveLicenseWeaponTypeCodes` → `DashboardWeaponTypeCodes` (`List<string>`).
- `Program.cs` (`Configure<ConfigurationsModel>` block): replace the mapping with
  `options.DashboardWeaponTypeCodes = sectionConfigurations.GetSection("DashboardWeaponTypeCodes").Get<List<string>>() ?? new List<string>();`
- `appsettings.json`: replace `MoveLicenseWeaponTypeCodes` with
  `"DashboardWeaponTypeCodes": [ "PTG01", "PTG02", "PTG03", "PTG04" ]`.

### 2. `DashboardMoveLicenseService`
- ctor: `_weaponTypeCodes = config.Value.DashboardWeaponTypeCodes ?? new List<string>();`
- `SearchFilter()` weapon dropdown: replace the current config-only block with the SPEC-009 "shared dropdown
  logic" (empty/unset ⇒ ALL from `GetDataAll`; else configured codes present in DB, in config order).

### 3. `DashboardMoveA10Service`
- ctor: **add `IOptions<ConfigurationsModel> config`** (`using Microsoft.Extensions.Options;`,
  `using DidSpf.WebApi.Center.Models;`) + `private readonly List<string> _weaponTypeCodes;` =
  `config.Value.DashboardWeaponTypeCodes ?? new List<string>();`
- `SearchFilter()` weapon dropdown: replace the current `GetDataAll → all` block with the SAME shared logic.
- (Service stays `AddScoped`; `IOptions<ConfigurationsModel>` already registered — no `Program.cs` DI change.)

**DO NOT:** change the cascade (หน่วยนับ/อาวุธ), chart/table data/filters, other dashboards, or shared classes.

## Definition of Done
- [x] Both dashboards' `product_type_group_code_ddl` read `Configurations:DashboardWeaponTypeCodes`; with the
      default (4 PTG) or empty, **both show PTG01–PTG04** (labels from DB).
- [x] Editing the shared key changes **both** dropdowns; empty/unset ⇒ all (no empty dropdown). Old
      `MoveLicenseWeaponTypeCodes` gone (config + model + Program.cs + appsettings).
- [x] `dotnet build` succeeds. **Build succeeded. 0 Error(s).** Cascade + other dashboards untouched.

## Implementation Notes

**Done by Jason 2026-07-20.** Unified both move dashboards' ประเภทอาวุธ dropdown onto one shared config with
empty⇒all fallback (kills the empty-dropdown trap that hit move-license in the deployed env).

### Config plumbing (retired `MoveLicenseWeaponTypeCodes` → shared `DashboardWeaponTypeCodes`)
- `Models/ConfigurationsModel.cs`: `MoveLicenseWeaponTypeCodes` → `DashboardWeaponTypeCodes` (`List<string>`).
- `Program.cs`: mapping now `options.DashboardWeaponTypeCodes = sectionConfigurations.GetSection("DashboardWeaponTypeCodes").Get<List<string>>() ?? new List<string>();`.
- `appsettings.json`: `"DashboardWeaponTypeCodes": [ "PTG01", "PTG02", "PTG03", "PTG04" ]` (default all 4).

### Shared dropdown logic (identical in both services' `SearchFilter()`)
`empty/unset ⇒ ALL PTG from GetDataAll`; `else configured codes present in DB, in config order`; labels always
from `TMProductTypeGroupRepo`:
- **`DashboardMoveLicenseService`**: ctor `_weaponTypeCodes = config.Value.DashboardWeaponTypeCodes ?? new()`;
  replaced the config-only (empty⇒empty) block with the shared empty⇒all block.
- **`DashboardMoveA10Service`**: ctor now injects `IOptions<ConfigurationsModel> config`
  (`using Microsoft.Extensions.Options;`) + `_weaponTypeCodes` field; replaced the `GetDataAll → all` block with
  the same shared block. (Stays `AddScoped`; `IOptions` already registered — no `Program.cs` DI change.)

Untouched: cascade (หน่วยนับ/อาวุธ), chart/table data/filters, other dashboards, shared classes. `LicenseBookFormIds`
config untouched.

### Verification (evidence)
- **`dotnet build`** (from `spf/DidSpf.WebApi.Center`): **Build succeeded. 0 Error(s).**
- **appsettings.json valid** (JSONC parser): `DashboardWeaponTypeCodes = ['PTG01','PTG02','PTG03','PTG04']`,
  `LicenseBookFormIds` intact, **old `MoveLicenseWeaponTypeCodes` absent**.
- **Static grep:** `MoveLicenseWeaponTypeCodes` fully gone (config + model + Program.cs + both services + comment);
  both services read `DashboardWeaponTypeCodes` and use the empty⇒all block.
- Deterministic + resolved from an already-used repo, empty⇒all default can't silently break → no live capture
  needed (per SPEC-009). With the default 4-PTG config, both dropdowns show PTG01–PTG04 (labels from DB); even if
  the deployed key is unset, empty⇒all yields all 4 — the empty-trap is gone.

## Questions

(Jason asks; Sober answers as `> answer: ...`)

## Review — Verdict: DONE — Sober (SA), 2026-07-20
Grep-verified: **`MoveLicenseWeaponTypeCodes` fully retired** (zero residue); `DashboardWeaponTypeCodes` wired
in appsettings.json:42 (all 4 PTG), Program.cs:212-213, ConfigurationsModel.cs:21; **both services** read
`config.Value.DashboardWeaponTypeCodes` (a10 L50 — ctor now injects `IOptions`; license L49) with the shared
**empty⇒all** branch (`_weaponTypeCodes == null || Count == 0`; a10 L77, license L67), labels from
`TMProductTypeGroupRepo`. `LicenseBookFormIds` intact; build 0 errors; cascade/other dashboards untouched.
Deterministic + empty⇒all can't silently break → **accepted, no capture** (per SPEC-009). **This permanently
fixes the empty-dropdown issue** — unset config now yields all 4, not `[]`. REQ-009 code complete.
