# TASK-004: Make DASHBOARD_LICENSE_BOOK book-type dropdown config-driven (DB labels, value=FORM_ID)

- Source: SPEC-004
- Status: REVIEW
- Depends on: TASK-003 (do the key rename first; same files)

## What to do

Drive the book-type dropdown (`form_id_ddl`) from a config FORM_ID list in `appsettings.json`; label from
the DB (`T_R_LICENSE_FORM.FORM_CODE`); dropdown **value = FORM_ID**. Full design in **SPEC-004**.

**Files to touch (4):**

1. `appsettings.json` — under the existing `"Configurations"` section:
   ```jsonc
   "LicenseBookFormIds": [ 8, 10, 16, 17 ]
   ```
   (+ `appsettings.Development.json` only if it has its own `Configurations` block — check first.)

2. `Models/ConfigurationsModel.cs` — add:
   ```csharp
   public List<int> LicenseBookFormIds { get; set; } = new List<int>();
   ```

3. `Program.cs` — in the existing `Configure<ConfigurationsModel>` block (~L191-209):
   ```csharp
   options.LicenseBookFormIds =
       sectionConfigurations.GetSection("LicenseBookFormIds").Get<List<int>>() ?? new List<int>();
   ```

4. `Services/DashboardLicenseBookService.cs`:
   - Add `IOptions<ConfigurationsModel> config` to the ctor (`using Microsoft.Extensions.Options;`);
     store `config.Value.LicenseBookFormIds` in `private readonly List<int> _bookTypeFormIds;`.
   - **Rewrite the dropdown build** in `SearchFilter()` (the `BOOK_TYPES.Select(...)` block, ~L56-58) to
     loop configured FORM_IDs in order, `GetDataByFormId`, skip nulls (WHERE-IN), `value=FORM_ID`,
     `label=FORM_CODE` — exact snippet in SPEC-004 "Code design" §2.
   - **Fix the filter** in `BuildFilteredRows()` (~L139): `InList(req.BookTypes, r.FormId?.ToString())`
     (compare FORM_ID, since dropdown value is now FORM_ID).
   - **KEEP `BOOK_TYPES`** (L34-37) — still used by `BookTypeLabel` for the chart grouping labels and the
     table `form_id_name` field (chart/table logic = out of scope). Do not remove it or change those.

**No DATA REQUEST needed** — `TRLicenseFormRepo.GetDataByFormId` + `T_R_LICENSE_FORM.FORM_CODE` exist
(SPEC-004 Overview). **DO NOT:** move labels into config; add a server-side data filter; touch other
dropdowns/dashboards; change chart/table label sources; change DI registration.

## Definition of Done

- [x] Dropdown built from `Configurations:LicenseBookFormIds`; each FORM_ID looked up in
      `T_R_LICENSE_FORM`; `value=FORM_ID`, `label=FORM_CODE`; FORM_ID not in DB skipped (no error/log).
- [x] Filter in `BuildFilteredRows` compares FORM_ID (`InList(req.BookTypes, r.FormId?.ToString())`).
- [x] `BOOK_TYPES` kept for chart/table labels; no data filter added; DI unchanged.
- [x] With config `[8,10,16,17]` the dropdown returns those (in order) with their DB `FORM_CODE` labels. (Static trace below.)
- [x] `dotnet build` succeeds. **Build succeeded. 0 Error(s).**

## Blocking check before REVIEW
- SPEC-004 Q2 (confirm label=`FORM_CODE`/value=FORM_ID with stakeholder) is **non-blocking** — implement
  as specified; if the stakeholder later picks `LICENSE_NAME`, it's a one-word change (`form.FormCode` →
  `form.LicenseName`).

## Implementation Notes

**Done by Jason 2026-07-17.** Book-type dropdown now: FORM_IDs+order from `appsettings.json`, label from DB
(`T_R_LICENSE_FORM.FORM_CODE`), dropdown **value = FORM_ID**, filter compares FORM_ID. Config plumbing reuses
the existing `IOptions<ConfigurationsModel>` mechanism (same as TASK-002). 4 files.

### Files changed (4)
1. **`appsettings.json`** — added under `Configurations` (after `MoveLicenseWeaponTypeCodes`):
   `"LicenseBookFormIds": [ 8, 10, 16, 17 ]`. `appsettings.Development.json` has **no** `Configurations`
   block → no dev override needed.
2. **`Models/ConfigurationsModel.cs`** — added `public List<int> LicenseBookFormIds { get; set; } = new List<int>();`.
3. **`Program.cs`** — in the existing `Configure<ConfigurationsModel>` block:
   `options.LicenseBookFormIds = sectionConfigurations.GetSection("LicenseBookFormIds").Get<List<int>>() ?? new List<int>();`
4. **`Services/DashboardLicenseBookService.cs`**:
   - `using Microsoft.Extensions.Options;` added; ctor now takes `IOptions<ConfigurationsModel> config`; stores
     `config.Value.LicenseBookFormIds` in `private readonly List<int> _bookTypeFormIds`.
   - Rewrote the `SearchFilter()` book-type dropdown build: loop configured FORM_IDs in order,
     `await _uowSPF.TRLicenseFormRepo.GetDataByFormId(formId)`, skip nulls (WHERE-IN), emit
     `{ Value = formId.ToString(), Label = form.FormCode ?? "" }`.
   - Fixed `BuildFilteredRows()` filter: `InList(req.BookTypes, r.FormId?.ToString())` (was
     `BookTypeLabel(r.FormId)`) — dropdown value is now FORM_ID so the filter matches on FORM_ID.
   - **Kept `BOOK_TYPES`** (L34-37) + `BookTypeLabel` — still used by chart grouping (`ChartData`) and the
     table `form_id_name` field (`TableData`), which are chart/table logic = out of scope. Unchanged.

### Pre-verified before editing (brownfield)
- `IUnitOfWorkSPF.TRLicenseFormRepo` exists (`IUnitOfWorkSPF.cs:122`); `TRLicenseFormRepository.GetDataByFormId(int)`
  → `Task<TRLicenseFormEntity?>`; entity `[Table("T_R_LICENSE_FORM")]`, `FormId` (`FORM_ID`, int),
  `FormCode` (`FORM_CODE`, `string?`), `LicenseName` (`LICENSE_NAME`). No new wiring, no DATA REQUEST.

### Not done / out of scope (per TASK/SPEC)
- No labels moved to config; no server-side data filter added (chart/table still filter by user selection);
  DI registration unchanged (`AddScoped` + `IOptions<T>` singleton injects fine); no other dropdown/dashboard
  touched; chart/table label source (`BOOK_TYPES`) unchanged.

### Verification (evidence)
- **`dotnet build`** (from `spf/DidSpf.WebApi.Center`): **Build succeeded. 0 Error(s).**
- **appsettings.json valid** — JSONC-aware parser: `LicenseBookFormIds = [8,10,16,17]`, existing
  `MoveLicenseWeaponTypeCodes` intact.
- **Static grep:** `BOOK_TYPES`/`BookTypeLabel` kept (chart L95/L107, table L132); dropdown uses
  `_bookTypeFormIds` + `TRLicenseFormRepo.GetDataByFormId` + `FormCode`, `value=formId`; filter now
  `InList(req.BookTypes, r.FormId?.ToString())`.
- **Static trace** with config `[8,10,16,17]` (all present in `T_R_LICENSE_FORM`): iterate in order →
  each `GetDataByFormId` returns a row → emit `{value: "8"/"10"/"16"/"17", label: FORM_CODE}` in that order.
  A FORM_ID absent from the table ⇒ `form == null` ⇒ skipped (WHERE-IN, no error/log). Reorder config ⇒
  output order follows.
  - **Data dependency note (brownfield):** the literal label text (`FORM_CODE` values) comes from live DB
    rows, so a text-level check needs a running Center + Oracle (out of BE scope). Behavior — config drives
    FORM_IDs+order, DB drives labels, missing FORM_IDs skipped, filter matches FORM_ID — is conclusive from
    code. Live capture available as a DATA REQUEST if wanted for sign-off (per SPEC-004 Q2, a 4-row
    `T_R_LICENSE_FORM` sample would 100% confirm `FORM_CODE` = `อ.8/อ.10/อ.16/อ.17`).

### Note on SPEC-004 Q2 (non-blocking)
Implemented `label = FormCode`, `value = FORM_ID` as specified. If the stakeholder later prefers
`LICENSE_NAME`, it's a one-word change (`form.FormCode` → `form.LicenseName`). Frontend must send FORM_IDs
(`"8"/"10"/"16"/"17"`) in the `form_id` request field (adopt SPEC-003 keys + SPEC-004 values together).

## Questions

(Jason asks; Sober answers as `> answer: ...`)

## Review

(Sober fills this in at REVIEW: verdict + reasons.)
