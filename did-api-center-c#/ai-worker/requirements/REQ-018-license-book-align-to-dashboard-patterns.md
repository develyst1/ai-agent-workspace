# REQ-018: DASHBOARD_LICENSE_BOOK — align the whole menu to the dashboard patterns (REQ-004/007 + shared chart shape)

- Status: READY_FOR_SA
- Priority: MEDIUM
- Raised: 2026-07-24 (stakeholder: "ทำความเข้าใจทั้งหมดแล้วแก้ใหม่หมด ให้ถูกต้องเหมือนเมนูอื่นๆ
  อันนี้มันทำมาทิ้งไว้ก่อนนานแล้ว แต่ไม่รู้ว่าทำถูกตาม pattern อันอื่นมั้ย")

## Context
dashboard-license-book was built BEFORE most of the cross-dashboard conventions were established
(REQ-007 date keys, REQ-009 shared config, shared `DashboardChartData`). REQ-003/004 only fixed
JSON key casing + the book-type dropdown. Porter re-captured the live FE (a11y tree) and audited the
code against every other dashboard. **Functionally it matches the FE** (2 date ranges `issue_date_range` +
`receipt_date_range`, 2 dropdowns, 5 charts, 8 table cols) — but 3 pattern deviations remain.

## Findings (all verified in code)

### 1. `issue_date_formatted` — the last `_formatted` key in the whole API (breaks REQ-007)
`Models/Dashboard/DashboardLicenseBookModel.cs` L140: `[JsonProperty("issue_date_formatted")]`.
REQ-007 standardised **one key, formatted value, no `_formatted` twin** — a10, license-move, import,
import-a8 and tracking all emit `issue_date`. A repo-wide grep for `_formatted` under `Models/Dashboard/`
returns **exactly one hit — this one**.
⇒ rename JSON key `issue_date_formatted` → **`issue_date`** (value unchanged: `ToStringTH(DATEONLY)`).
Sibling keys `expiry_date` / `receipt_date` are already correct.

### 2. Chart 1 hardcodes the 4 book types → contradicts REQ-004 (config-driven book types)
`DashboardLicenseBookMixBarRow` has fixed fields `a8_paid/a8_unpaid/a10_paid/a10_unpaid/a16_*/a17_*`,
and `DashboardLicenseBookService` fills them with literal `x.FormId == 8 / 10 / 16 / 17`.
But REQ-004 made the book-type list **config-driven** (`Configurations.LicenseBookFormIds`, labels from
`T_R_LICENSE_FORM`). So today the dropdown + the other 4 charts follow appsettings while
**chart 1 silently ignores it** — add/remove/reorder a FORM_ID in config and chart 1 does not change
(a new type is dropped from the stacked bar entirely, with no error and no log).
Also: it is the ONLY chart in any dashboard that does not use the shared `DashboardChartData` shape.
⇒ make chart 1 config-driven + shaped like every other chart (series generated from the configured
FORM_ID list × paid/unpaid, labels from DB). Config = single source of truth. Same visual result today
(8,10,16,17), but it stops drifting.

### 3. Query hardcodes `FORM_ID IN (8, 10, 16, 17)` — second source of truth
`TTLicenseRepository.GetLicenseBookDashboard` (L200) inlines the same 4 ids in SQL while the service reads
them from config. Two places to change, guaranteed to drift.
⇒ bind the configured FORM_ID list into the query (parameterised IN-list, same style as the other
dashboards' `:FORM_ID` binds) — or filter by config in one place only.

## Not broken (checked, leave alone)
- Backbone `LICENSE_STATUS=40` ✔ (same as license-move/tracking) · FE↔BE parity: 2 date ranges, both
  dropdowns, 5 charts, 8 table columns ✔ · other table keys are DB-column snake_case (REQ-003) ✔
- Perf (REQ-011/012): single pre-joined `LEFT JOIN T_T_PAYMENT_INFORM`, no correlated subquery, no views ✔
- Service-layer pattern, `ResponseResult` envelope, `DropdownDDLData` ✔

## Acceptance
- [ ] `/dashboard-license-book/table` emits **`issue_date`** (no `_formatted` anywhere in the API).
- [ ] Adding/removing a FORM_ID in `Configurations.LicenseBookFormIds` changes the dropdown **and chart 1**
      consistently; with the current config the output is identical to today.
- [ ] FORM_ID list lives in exactly ONE place (config) — not repeated in SQL.
- [ ] Everything else unchanged; stakeholder capture of `/search-filter` + `/chart` + `/table` matches today
      (except the renamed key) and no-date search still completes.

@Sober — please SPEC this and write the TASK(s) for Jason. Note item 1 is an FE-visible key rename
(stakeholder approved: make it consistent with every other menu).
