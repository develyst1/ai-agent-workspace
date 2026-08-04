# TASK-042: import + import-a8 — fix 4 `chartType` literals

- Source: SPEC-024 (REQ-022)
- Status: REVIEW
- Assignee: Jason (BE)
- Depends on: none


## Review — Verdict: DONE (code) — Sober (SA), 2026-07-24
- **All 4 changed, all 3 left alone — exactly right:** import L92 `Top5ByProducerCountry` → `bar-vertical`,
  L94 `ByTraderLicenseCount` → `pie`; import-a8 L99 `Top5ByOriginCountry` + L101 `Top5ByOriginCountryBaht` →
  `bar-vertical`; L93/L98/L100 `by_trader*` still `bar-horizontal`. ✔
- **Ran my own independent census** rather than accepting his: every emitted single-series chartType across
  `Services/` is `bar-horizontal` ×9 · `bar-vertical` ×5 · `pie` ×5 ⇒ **nothing outside the FE's supported set**, so no
  card can fall through the missing `default`. (My tally differs from his 8/5/4 because I matched both `BuildChart(`
  and `BuildCountChart(` call sites — immaterial: the acceptance criterion is "nothing outside the set", not the count,
  and both censuses agree on that.) ✔
- **2-D types untouched and still correct:** `CHART_TYPE_STACKED_BAR = "stacked-bar"` (license-book L32) and
  `ChartType = "grouped-bar"` (tracking L266) — both bypass the FE switch via dedicated components. ✔
- Data, aggregation, grouping, `valueUnit`, JSON keys, response shape, Top-5 logic, other dashboards: untouched.
  Build 0 err. → **REQ-022 code-complete**; capture confirms all 7 cards render and match intent.
- The census was the right instinct here — the failure mode (a value outside the set) is **silent**, so a targeted diff
  wouldn't have proven safety; only an exhaustive sweep does.

## Why
The FE's `DashboardChart.tsx` switches on `chartType` with **no `default`** — an unsupported value renders **nothing at
all, silently**. Our two import dashboards emit `"bar-horizontal"` for every chart; the FE's own per-card `EMPTY_*`
fallbacks show 4 of the 7 are meant to be something else. When our API returns data, our `chartType` wins — so these 4
cards are the wrong chart type in production today.

## Change — exactly 4 literals
`Services/DashboardImportService.cs`
- **L92** `Top5ByProducerCountry` → `BuildChart("bar-vertical", valueUnit, byCountry)`
- **L94** `ByTraderLicenseCount` → `BuildChart("pie", UNIT_BOOK, byTraderLicenseCount)`
- L93 `ByTrader` — **unchanged** (`bar-horizontal` is correct)

`Services/DashboardImportA8Service.cs`
- **L99** `Top5ByOriginCountry` → `BuildChart("bar-vertical", valueUnit, byCountry)`
- **L101** `Top5ByOriginCountryBaht` → `BuildChart("bar-vertical", UNIT_BAHT, byCountryBaht)`
- L98 `ByTrader`, L100 `ByTraderBaht` — **unchanged**

## Must NOT change
Data, aggregation, grouping, `valueUnit`, JSON keys, response shape, Top-5 logic, the other dashboards. In particular
**do not touch** tracking's `grouped-bar` or license-book's `stacked-bar` — those bypass the FE switch via dedicated
components and are confirmed correct.

## Definition of Done
- [x] The 4 literals changed exactly as above; the 3 `by_trader*` charts still `bar-horizontal`.
- [x] Grep: no single-series `chartType` outside {`pie`, `bar-vertical`, `bar-horizontal`} anywhere in the suite.
- [x] `dotnet build` succeeds. Paste the 4 lines + build result.
- [ ] (Capture) all 7 charts on the two pages render — none blank — and match the FE's intended types.

## Implementation Notes
(Jason — 2026-07-24)

Exactly 4 string literals; nothing else touched.

**`Services/DashboardImportService.cs`**
```csharp
L92  Top5ByProducerCountry = BuildChart("bar-vertical", valueUnit, byCountry),      // was bar-horizontal
L93  ByTrader              = BuildChart("bar-horizontal", valueUnit, byTrader),     // unchanged
L94  ByTraderLicenseCount  = BuildChart("pie", UNIT_BOOK, byTraderLicenseCount),    // was bar-horizontal
```

**`Services/DashboardImportA8Service.cs`**
```csharp
L98  ByTrader                = BuildChart("bar-horizontal", valueUnit, byTrader),        // unchanged
L99  Top5ByOriginCountry     = BuildChart("bar-vertical", valueUnit, byCountry),         // was bar-horizontal
L100 ByTraderBaht            = BuildChart("bar-horizontal", UNIT_BAHT, byTraderBaht),    // unchanged
L101 Top5ByOriginCountryBaht = BuildChart("bar-vertical", UNIT_BAHT, byCountryBaht),     // was bar-horizontal
```

### Verification
- `dotnet build` (Center+SPF) → **Build succeeded, 0 Error(s)**.
- **Suite-wide `chartType` census** (every `BuildChart(...)` call across `Services/`): `bar-horizontal` ×8,
  `bar-vertical` ×5, `pie` ×4 — **nothing outside the FE's supported set**, so no single-series card can hit the
  switch's missing `default` and render blank.
- The 3 `by_trader*` charts are still `bar-horizontal`, as required.
- **2-D charts untouched:** tracking's `"grouped-bar"` (L266) and license-book's `CHART_TYPE_STACKED_BAR` (L32) are
  unchanged — they bypass the FE switch via dedicated components. (The other `grouped-bar` grep hits are doc-comments
  on `BuildChart` helpers, not emitted values.)
- Data/aggregation/grouping/`valueUnit`/JSON keys/response shape/Top-5 logic and the other dashboards: not touched.
- Static-only per brownfield rule; that all 7 cards actually render (and look right) = stakeholder capture.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
