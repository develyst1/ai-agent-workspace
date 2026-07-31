# SPEC-020: DASHBOARD_LICENSE_BOOK — align to the dashboard patterns (REQ-007 key + config single-source-of-truth)

- Source: REQ-018
- Status: ACTIVE

## Verification (all 3 findings reproduced in code)
1. `Models/Dashboard/DashboardLicenseBookModel.cs` **L140** `[JsonProperty("issue_date_formatted")]` — repo-wide grep of
   `Models/Dashboard/` returns **exactly this one** `_formatted`. ✔ breaks REQ-007.
2. `DashboardLicenseBookMixBarRow` **L75-97** = 8 fixed keys `a8/a10/a16/a17 × _paid/_unpaid`; service **L169-176** fills
   them with literals `x.FormId == 8/10/16/17`, while **L47** reads `_bookTypeFormIds` from
   `Configurations.LicenseBookFormIds`. ✔ chart 1 ignores config (REQ-004 drift).
3. `TTLicenseRepository.GetLicenseBookDashboard` **L200** `WHERE L.FORM_ID IN (8, 10, 16, 17)` hardcoded. ✔ 2nd source of truth.

## SA decisions

### ✅ Item 1 — rename key (accept as written)
`issue_date_formatted` → **`issue_date`** (value unchanged `ToStringTH(DATEONLY)`). Removes the last `_formatted` in the API.

### ✅ Item 2a — make chart 1 config-driven (accept) …
Series must be generated from the **configured** FORM_ID list, so config is the single source of truth.

### ⚠️ Item 2b — reshape chart 1 to the shared `DashboardChartData`: **RECOMMEND NOT DOING IT** (SA pushback)
REQ-018 calls chart 1 "the only chart not using the shared shape" and proposes reshaping. I disagree, for 3 reasons:
1. **Structurally it can't fit.** `DashboardChartData` is a **single series** (categories + series + total) — used by the
   other 4 charts. Chart 1 is a **2-dimensional stacked mix-bar**: one row per trader × (n form types × paid/unpaid) =
   8 values per row today. Forcing it into a single series either loses the stacking or needs a bespoke encoding — i.e.
   the shape difference is **justified by the chart type**, not a legacy accident.
2. **It's an FE-visible breaking change.** The FE has a matching `DashboardLicenseBookMixBarRow`; reshaping requires an
   FE rewrite of that chart. REQ-018 item 1 was explicitly stakeholder-approved as a key rename; item 2b was not.
3. **It contradicts REQ-018's own acceptance** — "stakeholder capture of /chart matches today (except the renamed key)".
⇒ **Keep the mix-bar shape; fix only the drift.** Documented as a deliberate, justified exception (not a deviation).
If the stakeholder *does* want a uniform shape later, that's a separate FE+BE change — raise a new REQ.

### ✅ Item 3 — bind the configured FORM_IDs into SQL (accept), + empty-config guard
Parameterised IN-list (same style as tracking's `IN (:W0,:W1…)`). **Empty/unset config ⇒ fall back to the default
`{8,10,16,17}`** — the REQ-009 lesson (an unset deployed config must never silently empty the dashboard).

## Change

### A. `issue_date` key (REQ-007)
`DashboardLicenseBookModel.cs` L140: `[JsonProperty("issue_date_formatted")]` → `[JsonProperty("issue_date")]`.

### B. Chart 1 config-driven, same JSON shape (dynamic keys)
Replace the 8 fixed properties on `DashboardLicenseBookMixBarRow` with dynamic `a{formId}_paid` / `a{formId}_unpaid`
keys generated from the configured list — keeping `trader_name` + the exact same JSON for today's config:
- Model: `trader_name` + `[JsonExtensionData] public Dictionary<string, object> Counts { get; set; } = new();`
  (Newtonsoft writes extension-data entries as sibling JSON properties). If `[JsonExtensionData]` write-mode is awkward,
  an equivalent `Dictionary<string,int>` serialized inline is fine — the **JSON must stay** `{"trader_name":…,"a8_paid":n,…}`.
- Service: for each trader group, loop the configured FORM_IDs and add
  `$"a{formId}_paid" = g.Count(x => x.FormId == formId && IsPaid(x.PaidStatus))` and `$"a{formId}_unpaid"` (the `!IsPaid`
  twin). Deterministic order = the config order. **With config `[8,10,16,17]` the output is byte-identical to today.**

### C. FORM_ID list in ONE place (config → SQL)
`GetLicenseBookDashboard(dateStart, dateEnd, receiptStart, receiptEnd, **List<int> formIds**)`: build
`WHERE L.FORM_ID IN (:F0,:F1,…)` from the passed list (bind each), replacing the inlined `(8, 10, 16, 17)`; update the
doc-comment. Service passes `_bookTypeFormIds`; if that list is empty → pass the default `{8,10,16,17}` (guard above).
Everything else in the query unchanged (LICENSE_STATUS=40 backbone, the single pre-joined `LEFT JOIN T_T_PAYMENT_INFORM`,
conditional date predicates, no correlated subquery).

## Must NOT change
LICENSE_STATUS=40 backbone, FE↔BE parity (2 date ranges, 2 dropdowns, 5 charts, 8 table cols), the other 4 charts'
`DashboardChartData` shape, other table keys (REQ-003), perf shape, other dashboards. All DID_SPF.

## Acceptance
- [ ] `/table` emits `issue_date` (no `_formatted` anywhere in the API).
- [ ] With the current config, `/chart` + `/table` are **identical to today** except that key; changing
      `Configurations.LicenseBookFormIds` changes the dropdown **and** chart 1 **and** the query together.
- [ ] FORM_ID list exists only in config (+ the documented default fallback); no literal `(8,10,16,17)` in SQL/service.
- [ ] `dotnet build` succeeds; no-date search still completes; stakeholder capture matches.

## Tasks
- TASK-033 — A + B + C (one cohesive change; single build + single capture) — Jason.

## Questions
(Jason asks here; Sober answers as `> answer: ...`)
