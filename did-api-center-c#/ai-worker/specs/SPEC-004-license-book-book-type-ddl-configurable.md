# SPEC-004: DASHBOARD_LICENSE_BOOK — book-type dropdown from appsettings (DB-sourced labels)

- Source: REQ-004
- Status: DONE

## Overview

The License Book analog of SPEC-002. Drive the book-type dropdown (`form_id_ddl`, née `book_type_ddl`)
from a **configurable list of FORM_IDs in `appsettings.json`** (codes only, in display order); the **label
is looked up from the DATABASE** by FORM_ID — WHERE-IN semantics (FORM_ID present in DB shows with its DB
label; absent ⇒ not shown, no error/log).

**Reuse existing infra, add nothing new:**
- Config: `Configure<ConfigurationsModel>` (`Program.cs:191-209`) → `IOptions<ConfigurationsModel>`
  (same mechanism SPEC-002 used).
- DB label source: **already wired** — `IUnitOfWorkSPF.TRLicenseFormRepo`
  (`TRLicenseFormRepository.GetDataByFormId(int)`) over `TRLicenseFormEntity`
  (`[Table("T_R_LICENSE_FORM")]`, key `FormId`=`FORM_ID`, `FormCode`=`FORM_CODE`, `LicenseName`=`LICENSE_NAME`).

**No DATA REQUEST needed.** The label column is resolved from the in-repo data dictionary
(`_docs/db-schema/DATADIC.md:397-398`): `FORM_CODE` = "รหัสแบบฟอร์ม (อ.2, อ.2-1)" — the **"อ.x" format**
that matches the current hardcoded labels; `LICENSE_NAME` = long "ชื่อ" (100 chars). So **label = `FORM_CODE`**
preserves the current "อ.8/อ.10/อ.16/อ.17" display, DB-sourced. (Confirm column choice via Q2.)

## Two decisions (REQ-004 Constraints)

1. **Value = FORM_ID** (not the "อ.x" label). Today the dropdown sets `Value = "อ.8"` and the filter
   compares that label (`InList(req.BookTypes, BookTypeLabel(r.FormId))`). Making `value` the FORM_ID
   decouples the filter from display text and matches SPEC-002 (weapon dropdown value = code). **This
   requires the filter to compare FORM_ID** — explicitly allowed by REQ-004 ("keep request/filter
   consistent"). Frontend impact: the `form_id` request field (renamed by SPEC-003) now carries FORM_IDs
   (`"8"`,`"10"`,`"16"`,`"17"`) instead of `"อ.8"` — flag to frontend (it's updating for SPEC-003 anyway).
2. **Config = FORM_IDs, keep all four** `8,10,16,17` in order (REQ-004 Q1, Porter-confirmed — no trim).

## Config design

```jsonc
"Configurations": {
    ...
    "LicenseBookFormIds": [ 8, 10, 16, 17 ]   // อ.8/อ.10/อ.16/อ.17 book-type filter; FORM_IDs only, order = display order
}
```
- `ConfigurationsModel`: add `public List<int> LicenseBookFormIds { get; set; } = new List<int>();`
- `Program.cs` (in the existing `Configure<ConfigurationsModel>` block):
  ```csharp
  options.LicenseBookFormIds =
      sectionConfigurations.GetSection("LicenseBookFormIds").Get<List<int>>() ?? new List<int>();
  ```
- `appsettings.Development.json`: add the same key only if it has its own `Configurations` block (BE to check).

## Code design — `Services/DashboardLicenseBookService.cs`

1. **Inject config:** add `IOptions<ConfigurationsModel> config` to the ctor
   (`using Microsoft.Extensions.Options;`), store `config.Value.LicenseBookFormIds` in a
   `private readonly List<int> _bookTypeFormIds;` field.
2. **Rewrite the dropdown build** in `SearchFilter()` (currently the `BOOK_TYPES.Select(...)` block,
   lines ~56-58) to: iterate configured FORM_IDs **in order**, look each up in the DB, skip nulls
   (WHERE-IN), `value = FORM_ID`, `label = FORM_CODE`:
   ```csharp
   var bookItems = new List<DropdownDDLItem>();
   foreach (var formId in _bookTypeFormIds)
   {
       var form = await _uowSPF.TRLicenseFormRepo.GetDataByFormId(formId);
       if (form == null) continue;                       // FORM_ID not in DB ⇒ skip (no error/log)
       bookItems.Add(new DropdownDDLItem { Value = formId.ToString(), Label = form.FormCode ?? string.Empty });
   }
   dataResponse.BookTypeDdl.Items = bookItems;
   ```
   (≤4 point lookups; the repo has no `GetDataAll`, and per-id keeps the DAL unchanged.)
3. **Fix the filter for value=FORM_ID** in `BuildFilteredRows()` (line ~139): compare FORM_ID, not the
   label:
   ```csharp
   InList(req.BookTypes, r.FormId?.ToString())
   ```
4. **Keep `BOOK_TYPES`** (lines 34-37) — it is still used by the chart grouping labels (`BookTypeLabel`
   in `ChartData`) and the table `form_id_name` field (`BookTypeLabel` in `TableData`), which are
   **chart/table logic = out of REQ-004 scope**. Do NOT remove it and do NOT change those labels here.
   (So this dashboard's dropdown label comes from the DB `FORM_CODE`, while the table/chart labels keep
   using the in-code `BOOK_TYPES` "อ.x" — both render "อ.8"-style, just different sources. Consistent
   display; narrowing the other label sources is not in this REQ.)

DI: service is `AddScoped`; `IOptions<T>` injects fine — no registration change.

## Flow

`SearchFilter()` → read `_bookTypeFormIds` (config) → for each FORM_ID in order, `GetDataByFormId` →
if found emit `{ value: FORM_ID, label: FORM_CODE }`; missing FORM_IDs skipped. Filter now matches on
FORM_ID. Chart/table labels unchanged (still `BOOK_TYPES`). Everything else unchanged.

## Non-functional / Out of scope

- No auth/validation/perf change (≤4 small ref-table reads). `dotnet build` must succeed.
- **No server-side data filter added**; dropdown options only. No labels in config. No change to the
  trader dropdown, other dashboards, or (beyond the value=FORM_ID filter consistency) chart/table logic.
- Key renaming is **SPEC-003**. Sequence: **TASK-003 → TASK-004** (same files: model vs service; the
  `form_id` request contract = SPEC-003 key + SPEC-004 value, so land them together).

## Tasks

- TASK-004: Make the book-type dropdown config-driven with DB (`FORM_CODE`) labels + value=FORM_ID
  (depends on: TASK-003)

## Questions

(Jason asks here; Sober answers as `> answer: ...`)

## Questions to Porter (routed via log)

- **Q2 (DB label column + value).** Recommend **label = `FORM_CODE`** (DATADIC: the "อ.x" code; preserves
  current display) and **value = FORM_ID**. Alternative label = `LICENSE_NAME` (long full name) if the
  stakeholder wants the descriptive text. Please confirm `FORM_CODE` holds `อ.8/อ.10/อ.16/อ.17` for those
  FORM_IDs (high confidence from DATADIC — a 4-row sample would 100% confirm, but not blocking). Confirm
  the frontend will send FORM_IDs in `form_id` (not `"อ.8"`).
