# TASK-037: DASHBOARD_LICENSE_BOOK chart 1 (`count_by_entrepreneur_and_type`) → shared 2-D grouped-bar model

- Source: SPEC-022 (REQ-020, scope extension)
- Status: REVIEW
- Assignee: Jason (BE)
- Depends on: TASK-036 (defines the shared model), TASK-033 (config-driven FORM_IDs)


## Review — Verdict: DONE (code) — Sober (SA), 2026-07-24
- `DashboardLicenseBookMixBarRow` → **0 references** in both model and service (deleted). ✔
- `BuildMixBar` (L175) returns `DashboardGroupedChartData`; **one `slots` list drives both categories and every series'
  values** (L178) → positional alignment guaranteed by construction (better than aligning two loops — nice). ✔
- categories from **`_bookTypeFormIds` (config order)**, ids `a{formId}_paid/_unpaid`; series `{id = raw TRADER_ID,
  label, values}` with zeros; desc by row total; `total` = Σ cells; `chartType` behind the named
  `CHART_TYPE_STACKED_BAR` const (L33), marked unverified. ✔
- **REQ-018 wins re-verified intact:** `_formatted` → 0 hits, no re-hardcoded `8, 10, 16, 17`, `_bookTypeFormIds` still
  drives ddl + SQL + chart. Other 4 charts still `DashboardChartData`; 8-col table untouched. Build 0 err. ✔

### > answer (Sober) to the Thai-wording flag: **unify to "รอชำระ" — my SPEC-022 wording was the wrong one.**
Evidence in this same file: `UNPAID_LABEL = "รอชำระ"` (L29) is the **already-delivered, stakeholder-confirmed**
table wording (REQ-003/004, captured 2026-07-20), and the repo's own domain comment reads `PAID_STATUS "00" = รอชำระ`
(L20). I invented "ยังไม่ชำระ" in SPEC-022 without checking the page — that's my slip, and shipping it would put two
words for one concept on a single screen.
**Action (small, do it in this task):** use `UNPAID_LABEL` for the category label and **delete `UNPAID_CATEGORY_LABEL`**.
Chart 1 is being reshaped anyway so aligning its label is free, whereas changing the live table column would regress
something already accepted. One page, one word.
Correct call flagging it instead of silently unifying — both strings are FE-visible, so it was genuinely mine to decide.

## Why
license-book chart 1 is the same 2-D matrix (trader × [book type × payment] counts) but is the ONLY chart in the suite
outside the shared model entirely (bare `List<DashboardLicenseBookMixBarRow>` — no chartType/valueUnit/categories/total).
Stakeholder decided both 2-D charts share one shape.
**This supersedes REQ-018's "chart 1 JSON identical to today"** for this chart only — REQ-018's `issue_date` rename and
config-driven FORM_ID list still stand and must be preserved.

## Change
- `DashboardLicenseBookChartsResponse.CountByEntrepreneurAndType` type → **`DashboardGroupedChartData`** (TASK-036's
  shared model). JSON key `count_by_entrepreneur_and_type` unchanged.
- `valueUnit = "ฉบับ"`. `chartType = "stacked-bar"` — ⚠ **this string is the one unverified item**: license-book renders
  *stacked* while tracking renders *grouped*; the payload is identical either way. **Confirm the exact string with the FE
  at capture — one-word change.**
- `categories[]` generated **from `_bookTypeFormIds` (config order — do NOT re-hardcode 8/10/16/17)**; for each formId,
  two entries in this order:
  - `{ id = $"a{formId}_paid",   label = $"{BookTypeLabel(formId)} (ชำระแล้ว)" }`
  - `{ id = $"a{formId}_unpaid", label = $"{BookTypeLabel(formId)} (ยังไม่ชำระ)" }`
  (the `a{formId}_paid/_unpaid` ids are exactly the keys the FE already knew from REQ-018/TASK-033 — free continuity.)
- `series[]` = one per trader: `id` = **raw `TRADER_ID`**, `label` = trader name, `values` = the counts aligned to
  `categories` (2 × n values) using the existing `IsPaid(x.PaidStatus)` logic — **emit `0`, never skip a cell**.
- Order series **descending by row total** (consistent with TASK-036); `total` = Σ every cell.
- `DashboardLicenseBookMixBarRow` (incl. its `[JsonExtensionData] Counts`) becomes unused → **delete it**.

## Must NOT change
REQ-018's other wins: the `issue_date` key, and `Configurations.LicenseBookFormIds` as the single source of truth
(dropdown + chart + SQL). The other 4 license-book charts (single-series `DashboardChartData`), the 8-col table, the
`LICENSE_STATUS=40` backbone, perf shape, other dashboards.

## Note (recorded, deferred by the stakeholder — do not action)
`BookTypeLabel()` returns `""` for a FORM_ID outside `BOOK_TYPES`, so a *5th* configured book type would produce a
category label of just " (ชำระแล้ว)". All of today's [8,10,16,17] are labelled, so nothing is broken now. The one-line
`อ.{formId}` fallback stays on the shelf per the stakeholder ("ข้ามไปก่อน").

## Definition of Done
- [x] `count_by_entrepreneur_and_type` is a `DashboardGroupedChartData`: categories from config order with
      `a{formId}_paid/_unpaid` ids + Thai labels, series `{id,label,values}` zeros kept, `total` = Σ cells.
- [x] `DashboardLicenseBookMixBarRow` deleted (0 references); no `8, 10, 16, 17` literal reintroduced.
- [x] The other 4 charts + the table are unchanged; `dotnet build` succeeds. Paste the builder + build result.

## Implementation Notes
(Jason — 2026-07-24)

### Model
- `DashboardLicenseBookChartsResponse.CountByEntrepreneurAndType` → **`DashboardGroupedChartData`** (TASK-036's shared
  model); JSON key `count_by_entrepreneur_and_type` unchanged.
- **`DashboardLicenseBookMixBarRow` deleted** (with its `[JsonExtensionData]`) — grep: **0 references** repo-wide.

### Service — `BuildMixBar` rebuilt on the shared model
Introduced a single `slots` list = `_bookTypeFormIds.SelectMany(formId => [(formId,paid),(formId,unpaid)])`, then used
it to generate **both** `categories` and each series' `values` — so the two can't fall out of positional alignment by
construction:
- `categories[i]` = `{ id = $"a{formId}_{paid|unpaid}", label = $"{BookTypeLabel(formId)} ({ชำระแล้ว|ยังไม่ชำระ})" }`,
  driven by **config order** (no re-hardcoded 8/10/16/17).
- `series[]` = one per trader, `id` = **raw `TRADER_ID`** (`r.TraderId`), `label` = existing `TraderLabel` ("ไม่ระบุ"
  fallback), `values[i]` = `g.Count(x => x.FormId == slot.FormId && IsPaid(x.PaidStatus) == slot.Paid)` → **zeros
  emitted, never skipped**. Same `IsPaid` logic and same `Count` aggregation as before (numbers unchanged).
- `series` ordered **descending by row total** (consistent with TASK-036 — note this *is* a change: the old mix-bar had
  no explicit ordering, it inherited `GroupBy` order). `total` = Σ every cell. `valueUnit = "ฉบับ"`.
- `chartType = "stacked-bar"` via a named constant, commented as the **unverified** string.

### ⚠️ Flagged for Sober — Thai wording inconsistency (followed the spec, did not silently "fix")
SPEC-022 specifies the unpaid **category label** as `"(ยังไม่ชำระ)"`, but this dashboard's existing table column
`paid_status_name` uses `"รอชำระ"` (`UNPAID_LABEL`). So the same concept is worded two ways on one page. I implemented
the spec verbatim behind a separate `UNPAID_CATEGORY_LABEL` constant (commented) rather than unifying them, since either
choice is FE-visible and it's your/the stakeholder's call. One-line change whichever way you want it.

**→ RESOLVED (Jason, same task, per Sober's answer): unified to "รอชำระ".**
Category label now uses the existing `UNPAID_LABEL`; `UNPAID_CATEGORY_LABEL` **deleted**. One constant pair
(`PAID_LABEL`/`UNPAID_LABEL`) now feeds **both** the table column `paid_status_name` (L142) and the chart-1 category
label (L206) — one page, one word, and the already-accepted table wording is untouched.
Re-verified: `UNPAID_CATEGORY_LABEL` → **0 hits**, `"ยังไม่ชำระ"` → **0 hits** in the service; `dotnet build` → **0 Error(s)**.

### Verification
- `dotnet build` (Center+SPF) → **Build succeeded, 0 Error(s)** (pre-existing warnings only).
- `DashboardLicenseBookMixBarRow` → **0 references**; the only `8, 10, 16, 17` literal is still the single `BOOK_TYPES`
  label-map/default-fallback line from TASK-033.
- **REQ-018's wins verified intact**: `[JsonProperty("issue_date")]` present, `_formatted` → 0 hits, and
  `_bookTypeFormIds` still drives all three consumers (dropdown, `GetLicenseBookDashboard(...)` SQL, chart 1).
- Other **4** license-book charts still `DashboardChartData`; the 8-col table row untouched.
- **Scope of proof:** shape/ids/label composition/zero-filling proven by code + build; per-trader counts, Σ==total and
  the new ordering are data-dependent → stakeholder capture (together with confirming the `"stacked-bar"` string with the FE).

## Questions
(Jason asks; Sober answers as `> answer: ...`)
