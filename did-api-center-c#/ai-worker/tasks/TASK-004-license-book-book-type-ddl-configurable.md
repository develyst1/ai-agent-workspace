# TASK-004: Make DASHBOARD_LICENSE_BOOK book-type dropdown config-driven (DB labels, value=FORM_ID)

- Source: SPEC-004
- Status: TODO
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

- [ ] Dropdown built from `Configurations:LicenseBookFormIds`; each FORM_ID looked up in
      `T_R_LICENSE_FORM`; `value=FORM_ID`, `label=FORM_CODE`; FORM_ID not in DB skipped (no error/log).
- [ ] Filter in `BuildFilteredRows` compares FORM_ID (consistent with the new value).
- [ ] `BOOK_TYPES` kept for chart/table labels; no data filter added; DI unchanged.
- [ ] With config `[8,10,16,17]` the dropdown returns those (in order) with their DB `FORM_CODE` labels.
- [ ] `dotnet build` succeeds. Paste output.

## Blocking check before REVIEW
- SPEC-004 Q2 (confirm label=`FORM_CODE`/value=FORM_ID with stakeholder) is **non-blocking** — implement
  as specified; if the stakeholder later picks `LICENSE_NAME`, it's a one-word change (`form.FormCode` →
  `form.LicenseName`).

## Implementation Notes / Questions / Review
(Jason fills Implementation Notes; Sober fills Review.)
