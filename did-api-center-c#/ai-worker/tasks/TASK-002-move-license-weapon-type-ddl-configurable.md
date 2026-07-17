# TASK-002: Make DASHBOARD_LICENSE_MOVE weapon-type dropdown config-driven (DB-sourced labels)

- Source: SPEC-002
- Status: DONE
- Depends on: none

## REWORK reason (2026-07-17) — design change, not a defect

The stakeholder changed the design after your REVIEW build: the dropdown **label must come from the
DATABASE**, not the in-code `WEAPON_TYPES` map (REQ-002 Requirement #3 revised; SPEC-002 revised). Your
config plumbing is correct and stays — **only the label source changes.** This is a spec change, not a
quality problem with your work.

## What to KEEP (already correct in your REVIEW build)

- `appsettings.json` → `Configurations:MoveLicenseWeaponTypeCodes` = `["PTG01","PTG02","PTG03"]`.
- `Models/ConfigurationsModel.cs` → `List<string> MoveLicenseWeaponTypeCodes`.
- `Program.cs` → the mapping line in the `Configure<ConfigurationsModel>` block.
- `DashboardMoveLicenseService` ctor: `IOptions<ConfigurationsModel>` injection + `_weaponTypeCodes`
  field (+ `using Microsoft.Extensions.Options;`).

## What to CHANGE — label source: in-code map → DB

In `Services/DashboardMoveLicenseService.cs`:

1. **Remove** the `private static readonly (string Code, string Label)[] WEAPON_TYPES = {...}` array
   (~lines 36-42) — it was the in-code label source and is now orphaned. (Leave
   `using static ...ConstantSPF;` unless the build flags it unused.)

2. **Rewrite** the weapon-type dropdown build in `SearchFilter()` (your current `labelByCode` block,
   ~lines 71-77) to source the label from the DB via the existing repo, in **config order**, with
   **WHERE-IN semantics** (code not in DB ⇒ not shown; no error, no log):
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
   `TMProductTypeGroupRepo` is already on `IUnitOfWorkSPF` — no new wiring. Use `GetDataAll()` (one call,
   tiny master table) not per-code lookups.

**No DATA REQUEST needed** — the source table (`T_M_PRODUCT_TYPE_GROUP`), its repo
(`TMProductTypeGroupRepo`), and columns (`ProductTypeGroupCode`/`ProductTypeGroupName`) already exist
(SPEC-002 "Overview").

**DO NOT:** move labels into config; add any server-side chart/table data filter (REQ Out of Scope);
touch other dropdowns, cascade endpoints, other dashboards, chart/table logic, or REQ-001 keys.

## Definition of Done

- [x] Dropdown built from `Configurations:MoveLicenseWeaponTypeCodes`, labels from
      `TMProductTypeGroupRepo` (DB), not the hardcoded array (which is removed).
- [x] With config `["PTG01","PTG02","PTG03"]`, `SearchFilter()` returns those three (that exist in the
      DB), in that order, each with its **DB Thai name**; PTG04 absent. (Static trace below.)
- [x] A configured code not present in `T_M_PRODUCT_TYPE_GROUP` is skipped (WHERE-IN) — no error, no log.
- [x] `WEAPON_TYPES` array removed; no in-code label map remains for this dropdown; no data-filter added.
- [x] `dotnet build` succeeds (from `spf/DidSpf.WebApi.Center`). **Build succeeded. 0 Error(s).**

## Implementation Notes

**REWORK done by Jason 2026-07-17.** Design change applied: weapon-type dropdown label now comes from the
DB (`T_M_PRODUCT_TYPE_GROUP`) instead of the in-code map. Config plumbing from the first REVIEW build is
unchanged.

### Kept from the first REVIEW build (unchanged)
- `appsettings.json` → `Configurations.MoveLicenseWeaponTypeCodes = ["PTG01","PTG02","PTG03"]`.
- `Models/ConfigurationsModel.cs` → `List<string> MoveLicenseWeaponTypeCodes`.
- `Program.cs` → mapping line in the `Configure<ConfigurationsModel>` block.
- `DashboardMoveLicenseService` ctor `IOptions<ConfigurationsModel>` injection + `_weaponTypeCodes` field
  (+ `using Microsoft.Extensions.Options;`).

### Changed this REWORK — 1 file (`Services/DashboardMoveLicenseService.cs`)
1. **Removed** the `private static readonly (string Code, string Label)[] WEAPON_TYPES = {...}` array
   (was the in-code label source, now orphaned).
2. **Rewrote** the weapon-type dropdown build in `SearchFilter()` to source labels from the DB, in config
   order, WHERE-IN semantics:
   ```csharp
   var ptgGroups = await _uowSPF.TMProductTypeGroupRepo.GetDataAll();
   var nameByCode = ptgGroups.ToDictionary(g => g.ProductTypeGroupCode, g => g.ProductTypeGroupName);
   dataResponse.WeaponTypeDdl.Items = _weaponTypeCodes
       .Where(code => nameByCode.ContainsKey(code))   // code not in DB ⇒ skipped, no error/log
       .Select(code => new DropdownDDLItem { Value = code, Label = nameByCode[code] })
       .ToList();
   ```
3. Updated the `_weaponTypeCodes` field comment (label now from DB, not `WEAPON_TYPES`).

- Left `using static ...ConstantSPF;` in place per the TASK instruction ("leave unless the build flags it
  unused") — build does not flag it. It's now only potentially orphaned (the `.ProductTypeGroupCode`
  hits at the `GetByProductTypeGroupCode`/`nameByCode` lines are instance members, not the static class);
  if Sober wants it pruned, that's a trivial one-line cleanup — flagging rather than silently touching it.

### Pre-verified before editing (brownfield — read what I touch)
- `IUnitOfWorkSPF.TMProductTypeGroupRepo` exists (`IUnitOfWorkSPF.cs:17`, wired `UnitOfWorkSPF.cs:129-135`).
- `TMProductTypeGroupRepository.GetDataAll()` → `Task<List<TMProductTypeGroupEntity>>` (`GetByCriteriaAsync()`
  = all rows, one call).
- `TMProductTypeGroupEntity` → `ProductTypeGroupCode` (`[Key]`, `PRODUCT_TYPE_GROUP_CODE`, non-null) +
  `ProductTypeGroupName` (`PRODUCT_TYPE_GROUP_NAME`, non-null). Key column ⇒ unique ⇒ `ToDictionary` safe.

### Verification (evidence)
- **`dotnet build`** (from `spf/DidSpf.WebApi.Center`): **Build succeeded. 0 Error(s).** (18 warnings shown
  in the filtered tail — all pre-existing/unrelated; none from this file.)
- **Static grep:** `WEAPON_TYPES` and `labelByCode` fully removed; new build uses
  `TMProductTypeGroupRepo.GetDataAll()` + `nameByCode` + `_weaponTypeCodes`.
- **Static trace of the weapon-type branch** with config `["PTG01","PTG02","PTG03"]`, assuming those codes
  exist in `T_M_PRODUCT_TYPE_GROUP`: iterate `_weaponTypeCodes` in order → each passes `ContainsKey` →
  emits `{value: code, label: DB ProductTypeGroupName}` in config order; PTG04 not in config ⇒ absent.
  - Reorder config → output order follows.
  - Configured code missing from the DB table ⇒ skipped by `ContainsKey` (WHERE-IN, no error/log).
  - **Data dependency note (brownfield):** the exact Thai label text now comes from live DB rows, so a
    literal-label check requires a running Center + Oracle (out of BE scope). The *behavior* (config drives
    which codes + order; DB drives the label; unknown codes skipped) is conclusive from the code. If a live
    capture of `SearchFilter()` is wanted for sign-off, that's a DATA REQUEST (stakeholder hits
    `/dashboard-move-license/search-filter`, drops JSON in `../project-docs/`).

## Questions

(Jason asks; Sober answers as `> answer: ...`)

## Review

**REWORK — Sober (SA), 2026-07-17.** Not a defect in your build: the config plumbing (appsettings key,
`ConfigurationsModel`, `Program.cs` mapping, `IOptions` injection, `_weaponTypeCodes`) is correct and is
kept. The stakeholder changed the label source to the DB after the fact (REQ-002 §3 revised). Swap the
in-code `WEAPON_TYPES` lookup for `TMProductTypeGroupRepo.GetDataAll()` (details above), remove the now-
orphaned array, rebuild, and set back to REVIEW. I confirmed the DB source is already wired — no DATA
REQUEST required.

---

**REVIEW #2 (post-rework) — Verdict: DONE — Sober (SA), 2026-07-17.** Verified the actual code
(`Services/DashboardMoveLicenseService.cs`), not just the notes:

- **Label source = DB, correct.** `SearchFilter()` lines 62-69: `TMProductTypeGroupRepo.GetDataAll()` →
  `nameByCode` (`ProductTypeGroupCode`→`ProductTypeGroupName`) → emits `_weaponTypeCodes` **in config
  order**, `ContainsKey` gives WHERE-IN (code not in DB ⇒ skipped, no error/log). Matches revised SPEC-002
  and every REQ-002 acceptance criterion. `Value = code`, `Label = DB Thai name`.
- **`WEAPON_TYPES` array removed** (lines 35-39 now hold only `BUYER_GROUP_MAP`); `_weaponTypeCodes`
  comment updated to "label มาจาก DB". No in-code label map remains for this dropdown.
- **Config plumbing kept intact**; DI unchanged (`IOptions` injects into the Scoped service).
- **Out-of-scope respected:** no server-side data filter; other dropdowns / cascade / chart / table
  untouched.
- **Build:** succeeded, 0 Error(s).
- **Brownfield deferral of live capture accepted** — the weapon-type branch's behaviour is conclusive
  from code; the only DB-dependent part is the literal Thai text, which is exactly what "label from DB"
  intends. No live capture required for sign-off.

**Nit (not blocking, verified):** the change orphaned `using static ...ConstantSPF;` — I grepped the file;
the only two `ProductTypeGroupCode` hits (lines 65, 148) are an **entity property** and a **repo method
name**, not `ConstantSPF` members, and no other `ConstantSPF` symbol is used. It's a warning-level unused
directive. **Recommend** removing that one `using static` line when this file is next touched (or now);
not worth a separate REWORK cycle. Marking DONE.
