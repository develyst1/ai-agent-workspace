# TASK-033: DASHBOARD_LICENSE_BOOK — `issue_date` key + config-driven chart 1 + FORM_IDs bound into SQL

- Source: SPEC-020 (REQ-018)
- Status: DONE
- Assignee: Jason (BE)
- Depends on: none

## Review — Verdict: DONE (code) — Sober (SA), 2026-07-24
Verified all three in code:
- **A** `_formatted` under `Models/Dashboard/` → **0 hits**; `[JsonProperty("issue_date")]` at L124. ✔ REQ-007 closed
  (this was the last one in the API).
- **B** model L80 `[JsonExtensionData] Counts`; service L177-180 loops `_bookTypeFormIds` → `a{formId}_paid/_unpaid`,
  config order = key order. Mix-bar shape kept per SPEC-020. ✔
- **C** `GetLicenseBookDashboard(…, List<int> formIds)` (L173) → bound `:F0,:F1…` (L186) → `WHERE L.FORM_ID IN (…)`
  (L210). No literal in SQL. ✔
- **D** `BOOK_TYPES` (L37) is the single literal site; ctor L52 derives the fallback from it. ✔
- **Parity proof accepted.** Empirically serializing old-vs-new with the same Newtonsoft settings → `IDENTICAL: True`
  was the right call: extension-data ordering is the one thing that couldn't be assumed safe. Good verification.

### > answer (Sober) to the flagged BOOK_TYPES decision: **your call was right — keep it.**
Sourcing the labels from `T_R_LICENSE_FORM.FORM_CODE` would be the "truest" single source, but it makes today's
`count_by_book_type` / `form_id_name` labels **data-dependent**, which (a) can't be verified without a DB (brownfield)
and (b) risks breaking REQ-018's "identical to today" acceptance if `FORM_CODE ≠ "อ.8"`. Correctly scoped — don't swap it.

### Residual gap (recorded honestly, NOT a blocker today)
`BookTypeLabel()` (L208-213) returns `string.Empty` for a FORM_ID not in `BOOK_TYPES`. So config is now the single source
for **dropdown + chart 1 + SQL** (what REQ-018 asked), but if someone adds a *5th* book type to config, its slice in
`count_by_book_type` (and `form_id_name`) would render **blank** — silent, no error. Today's config `[8,10,16,17]` is
fully covered, so nothing is broken now.
**Recommendation (cheap insurance, out of REQ-018's stated scope → stakeholder/Porter to accept):** make the fallback
non-blank, e.g. `return $"อ.{formId}";` — one deterministic line, cannot change today's output (8/10/16/17 still hit the
map), removes the silent-blank failure mode. Raise as a micro-task if wanted.

## Goal
Align license-book to the established patterns: drop the last `_formatted` key (REQ-007), and make
`Configurations.LicenseBookFormIds` the **single source of truth** for the book types (REQ-004) — today chart 1 and the
SQL both hardcode `8/10/16/17`. **With the current config the API output must be identical to today except the renamed key.**

## Changes

### A. `Models/Dashboard/DashboardLicenseBookModel.cs` — REQ-007 key
- L140: `[JsonProperty("issue_date_formatted")]` → `[JsonProperty("issue_date")]`. Value unchanged
  (`ToStringTH(FormatStr.DATEONLY)`). Sibling `expiry_date`/`receipt_date` already correct — leave them.

### B. Chart 1 config-driven — SAME JSON shape (dynamic keys)
**Keep the mix-bar shape** (`count_by_entrepreneur_and_type` = list of rows; do NOT convert it to `DashboardChartData` —
it's a 2-D stacked bar and FE-visible; SA decision in SPEC-020).
- `DashboardLicenseBookMixBarRow` (L70-98): remove the 8 fixed props `A8Paid…A17Unpaid`; keep `trader_name`; add
  dynamic counts, e.g.
  ```csharp
  [JsonProperty("trader_name")] public string Name { get; set; } = string.Empty;
  [JsonExtensionData] public Dictionary<string, object> Counts { get; set; } = new();
  ```
  (Newtonsoft writes extension-data as sibling properties. If that's awkward on write, use any equivalent that emits the
  same flat JSON — the wire format must stay `{"trader_name":"…","a8_paid":1,"a8_unpaid":0,…}`.)
- `DashboardLicenseBookService` (L169-176): replace the 8 literal lines with a loop over the configured FORM_IDs:
  ```csharp
  foreach (var formId in bookTypeFormIds)   // config order = output order
  {
      row.Counts[$"a{formId}_paid"]   = g.Count(x => x.FormId == formId &&  IsPaid(x.PaidStatus));
      row.Counts[$"a{formId}_unpaid"] = g.Count(x => x.FormId == formId && !IsPaid(x.PaidStatus));
  }
  ```
  With config `[8,10,16,17]` → byte-identical output to today.

### C. FORM_ID list into the query (one source of truth)
- `TTLicenseRepository.GetLicenseBookDashboard` — add a `List<int> formIds` param; replace the inlined
  `WHERE L.FORM_ID IN (8, 10, 16, 17)` (L200) with a bound IN-list built from it (`:F0,:F1,…`, same style as
  `GetTrackingDashboard`'s weapons). Update the doc-comment (it also says 8/10/16/17).
- Service: pass `_bookTypeFormIds`; **if empty/unset → pass the default `{8,10,16,17}`** (REQ-009 lesson: an unset
  deployed config must never silently empty the dashboard). Apply the same fallback wherever `_bookTypeFormIds` drives
  the dropdown/charts so all three stay consistent.

## Must NOT change
`LICENSE_STATUS=40` backbone; the single pre-joined `LEFT JOIN T_T_PAYMENT_INFORM` + conditional date predicates (perf);
the other 4 charts' `DashboardChartData` shape; the 2 date ranges / 2 dropdowns / 5 charts / 8 table cols (FE parity);
other table keys (REQ-003); other dashboards. All DID_SPF.

## Definition of Done
- [x] `/table` emits `issue_date`; grep `_formatted` under `Models/Dashboard/` → 0 hits.
- [x] No literal `8, 10, 16, 17` left in `DashboardLicenseBookService` or `GetLicenseBookDashboard` (only the documented
      default-fallback constant, in ONE place).
- [x] With config `[8,10,16,17]`, `/chart` chart-1 JSON is identical to today (same keys, same order, same numbers).
- [x] `dotnet build` succeeds. Paste the diff summary + build result.
- [ ] (Acceptance, live capture) `/search-filter` + `/chart` + `/table` match today except the renamed key; no-date completes.

## Implementation Notes
(Jason — 2026-07-24)

### A. `DashboardLicenseBookModel.cs` — REQ-007 key
`[JsonProperty("issue_date_formatted")]` → `[JsonProperty("issue_date")]` on `DashboardLicenseBookTableRow.DateFormatted`.
Value unchanged (`ToStringTH(FormatStr.DATEONLY)` in the service). `expiry_date`/`receipt_date` untouched.

### B. Chart 1 config-driven — same mix-bar shape, dynamic keys
- `DashboardLicenseBookMixBarRow`: removed the 8 fixed props (`A8Paid…A17Unpaid`); kept `[JsonProperty("trader_name")]`;
  added `[JsonExtensionData] public Dictionary<string, object> Counts`. Newtonsoft emits extension data as **siblings
  after** the declared property → wire format unchanged.
- `BuildMixBar` is now an instance method looping the configured FORM_IDs (config order = key order):
  `row.Counts[$"a{formId}_paid"] = g.Count(x => x.FormId == formId && IsPaid(...))` (+ `_unpaid`).
- **Kept `count_by_entrepreneur_and_type` as `List<DashboardLicenseBookMixBarRow>`** (not converted to
  `DashboardChartData`) per the SA decision in SPEC-020.

### C. FORM_ID list into the query (one source of truth)
- `TTLicenseRepository.GetLicenseBookDashboard(dateStart, dateEnd, receiptStart, receiptEnd, **List<int> formIds**)` —
  the inlined `WHERE L.FORM_ID IN (8, 10, 16, 17)` is now a bound IN-list (`:F0,:F1,…`, same style as
  `GetTrackingDashboard`'s weapons). Doc-comment updated (no longer names 8/10/16/17).
- Service passes `_bookTypeFormIds`. **Fallback applied once, in the ctor**: `config.Value.LicenseBookFormIds` when
  non-empty, else the default — so dropdown, chart 1 and the SQL all read the same field and can never diverge
  (REQ-009 lesson: an unset deployed config must not silently empty the dashboard).

### Decision — where the single FORM_ID literal lives (flagging for Sober)
The DoD allows the default-fallback literals in ONE place. I kept them in the existing `BOOK_TYPES` array, which is
**also** the chart/table label map (`BookTypeLabel` → "อ.8"/"อ.10"/…), and derived the fallback from it
(`BOOK_TYPES.Select(b => b.FormId)`). Rationale: the alternative — dropping `BOOK_TYPES` and sourcing labels from DB
`T_R_LICENSE_FORM.FORM_CODE` like the dropdown does — would be the *truest* single source, but it makes the
`count_by_book_type` / `form_id_name` labels **data-dependent**, which I cannot verify without a DB (brownfield rule)
and would risk breaking the "identical to today" requirement if FORM_CODE ≠ "อ.8". Say the word if you want that swap
as a follow-up.

### Verification
- `dotnet build` (Center+SPF) → **Build succeeded, 0 Error(s)** (pre-existing warnings only).
- Grep `_formatted` under `Models/Dashboard/` → **0 hits**.
- Grep repo for `FORM_ID IN (8` → **0**; bound `formInClause` present.
- Grep service for `8, 10, 16, 17` → **1 hit only**: the documented `BOOK_TYPES` label-map/default-fallback line.
- **Chart-1 JSON parity proved empirically**, not assumed: built a throwaway console (same Newtonsoft +
  `DefaultContractResolver` as `Program.cs`) serializing the old 8-prop row vs the new extension-data row with
  config `[8,10,16,17]` →
  `{"trader_name":"test-trader","a8_paid":1,"a8_unpaid":2,"a10_paid":3,"a10_unpaid":4,"a16_paid":5,"a16_unpaid":6,"a17_paid":7,"a17_unpaid":8}`
  for **both**; `IDENTICAL: True`. Throwaway project deleted afterwards.
- Untouched: `LICENSE_STATUS=40`, the single `LEFT JOIN T_T_PAYMENT_INFORM` + 4 conditional date predicates, the other
  4 charts' `DashboardChartData` shape, the 2 ranges / 2 dropdowns / 5 charts / 8 table cols, other table keys, other
  dashboards. All DID_SPF.
- Static-only per brownfield rule; live `/search-filter` + `/chart` + `/table` parity and no-date completion = stakeholder capture.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
