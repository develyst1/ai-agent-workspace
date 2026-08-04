# SPEC-024: import + import-a8 — correct 4 `chartType` literals to the FE's intent

- Source: REQ-022 (FE source read: `DashboardChart.tsx`, each page's `ContentSection.tsx`)
- Status: ACTIVE

## Verified in our code (matches REQ-022 exactly)
`DashboardImportService` L92/93/94 and `DashboardImportA8Service` L98/99/100/101 all pass the literal `"bar-horizontal"`.

## The hard constraint (this is the part worth institutionalising)
`DashboardChart.tsx` L138-170 is a `switch (type)` over **exactly three** values — `pie`, `bar-vertical`,
`bar-horizontal` — **with no `default`**. Anything else returns `undefined` and the card **renders nothing, silently**
(no error, no empty state). So for single-series charts the supported set is closed, and emitting outside it is a blank
chart in production.
**The 2-D charts are exempt** — `grouped-bar` (tracking) and `stacked-bar` (license-book) bypass this switch entirely
via `DashboardGroupedBarChart` / `DashboardMixBarChart`. Porter verified both against the FE source; the REQ-020/022
decisions stand unchanged.

## The fix — 4 literals, nothing else
| file | line | chart | now | → |
|---|---|---|---|---|
| `DashboardImportService` | L92 | `Top5ByProducerCountry` | bar-horizontal | **bar-vertical** |
| `DashboardImportService` | L94 | `ByTraderLicenseCount` | bar-horizontal | **pie** |
| `DashboardImportA8Service` | L99 | `Top5ByOriginCountry` | bar-horizontal | **bar-vertical** |
| `DashboardImportA8Service` | L101 | `Top5ByOriginCountryBaht` | bar-horizontal | **bar-vertical** |
The three already-correct `by_trader*` charts stay `bar-horizontal`. **No data, aggregation, key, unit or shape change.**

**Why the FE's `EMPTY_*` fallbacks are the specification:** each card does `<apiField> ?? EMPTY_<TYPE>` then
`type={chart.chartType as ChartType}` — i.e. when our API returns data **our value wins**, and the fallback is the FE's
own written statement of what that card is meant to be. That makes this a defect on our side, not a preference.

## Selection rule (record it so this doesn't drift again)
- breakdown across a small category set (buyer group, book type, status) → **`pie`**
- top-N ranking with long Thai labels (trader, country) → **`bar-horizontal`**
- few short categories / country codes → **`bar-vertical`**
Consistent with a10, tracking and license-book, which already mix all three.

## Finding 3 (`LineChartData` emits `"pie"`) — **leave it**
`DashboardMoveLicenseService` L220: the C# property is `LineChartData` but the type is `"pie"`. The **JSON key is what
the FE binds to**, and `"pie"` is both a supported value and the right one by the rule above (a buyer-group breakdown).
So this is a naming smell with zero functional impact; renaming the property/key would be an FE-visible change for no
gain. Recorded, deliberately not fixed.

## Acceptance
- [ ] The 4 literals changed; the other 3 unchanged; grep shows no `chartType` outside {`pie`,`bar-vertical`,`bar-horizontal`}
      for single-series charts (2-D `grouped-bar`/`stacked-bar` excepted).
- [ ] `dotnet build` succeeds; no data/key/unit/aggregation change anywhere.
- [ ] Capture: all 7 import + import-a8 charts render (none blank), and each matches the FE's intended type.

## Tasks
- **TASK-042** — the 4 literals.

## Questions
(Jason asks here; Sober answers as `> answer: ...`)
