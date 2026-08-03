# TASK-036: Shared 2-D grouped-bar model + DASHBOARD_TRACKING chart 1 (`by_trader_move_status`)

- Source: SPEC-022 (REQ-020)
- Status: REVIEW
- Assignee: Jason (BE)
- Depends on: TASK-034 (move-status labels)


## Review — Verdict: DONE (code) — Sober (SA), 2026-07-24
- **Shared model correct + isolated:** `DashboardChartGroupedSeries` (L145) + `DashboardGroupedChartData` (L162) added;
  **`DashboardChartSeriesItem` (L113) untouched** — the only `values` JsonProperty is inside the new grouped series
  (L154), so the 8 single-series charts across 6 dashboards emit byte-identical JSON. Grouped model is referenced only by
  the shared model file + tracking model/service — no other dashboard touched. ✔
- **Chart 1 payload matches REQ-020:** `chartType="grouped-bar"`, `Categories = MOVE_STATUS_CATEGORIES` = the fixed
  `("6",รอดำเนินการ) ("8",กำลังขนย้าย) ("9",เสร็จสิ้นแล้ว)` **paired with the label constants in one tuple array so id↔label
  can't drift** (L41 — nice); `series[].id` = **raw `r.TraderId`** (L254) per SPEC-022; 3-slot `Values` positionally
  aligned with zeros; `OrderByDescending(s => s.Values.Sum())` (L269) = desc by row total. `" - "` concat → **0 hits**. ✔
- **The refactor is safe (the thing I checked hardest):** `BuildRows(req) => (raw, rows)`; `byTrader`/`byMoveStatus` still
  group over **`rows`** — the same Table objects as before — and only chart 1 consumes `raw` (it needs `TRADER_ID`, which
  the table row deliberately doesn't carry). So the other two charts' inputs are provably unchanged, and `TableData`
  still delegates to the same core. Better than adding a field to the response DTO. ✔
- **Proof scope well-judged:** shape proven statically; per-trader numbers / Σ==total / ordering are data-dependent →
  capture. Correctly skipped a serialization harness here (plain `[JsonProperty]`, none of TASK-033's extension-data
  ordering subtlety) — right call on when the extra proof is worth it.
- Build 0 err. → TASK-037 (license-book chart 1 onto this model) unblocked.

## Why
Tracking chart 1 currently flattens the 2-D data (trader × move-status) into ONE single series by string-concatenating
`"{trader} - {status}"`, leaving `categories: []`. The FE cannot ungroup a concatenated label → the grouped chart can't
be built at all. Stakeholder supplied the exact target payload (REQ-020). **Aggregation is unchanged — this is purely
the response shape.**

## 1. Shared 2-D model (new, next to `DashboardChartData` in `Models/Dashboard/DashboardMoveLicenseModel.cs`)
```csharp
public partial class DashboardChartGroupedSeries
{
    [JsonProperty("id")]     public string Id { get; set; } = string.Empty;
    [JsonProperty("label")]  public string Label { get; set; } = string.Empty;
    [JsonProperty("values")] public List<decimal> Values { get; set; } = new();   // aligned to categories
}

public partial class DashboardGroupedChartData
{
    [JsonProperty("chartType")]  public string ChartType { get; set; } = string.Empty;
    [JsonProperty("valueUnit")]  public string ValueUnit { get; set; } = string.Empty;
    [JsonProperty("categories")] public List<DashboardChartCategory> Categories { get; set; } = new();
    [JsonProperty("series")]     public List<DashboardChartGroupedSeries> Series { get; set; } = new();
    [JsonProperty("total")]      public decimal Total { get; set; }
}
```
⚠ **Do NOT add `values[]` to the existing `DashboardChartSeriesItem`** — that would emit a dead field on all 8
single-series charts across 6 dashboards. Reuse `DashboardChartCategory {id,label}` as-is.

## 2. Tracking chart 1 → the new model
- `DashboardTrackingChartsResponse.ByTraderMoveStatus` type → `DashboardGroupedChartData` (`by_trader_move_status` key unchanged).
- `chartType = "grouped-bar"`, `valueUnit = "ฉบับ"`.
- `categories` = the 3 move statuses in this **fixed order**, ids from the stakeholder's example (documented constant map
  next to the label constants so id↔label can't drift):
  `{"6", รอดำเนินการ}`, `{"8", กำลังขนย้าย}`, `{"9", เสร็จสิ้นแล้ว}` (labels = TASK-034's existing constants).
- `series` = one per trader: `id` = **raw `TRADER_ID`** (`r.TraderId`), `label` = trader name (existing `TraderLabel`,
  "ไม่ระบุ" fallback), `values` = the 3 counts in category order — **emit `0`, never skip a cell**.
- Order series **descending by row total** (matches the example 352/171/120…); keep any existing limit/tie-break.
- `total` = Σ of every cell.
- The old `"{trader} - {status}"` concatenation is deleted. **`by_trader` and `by_move_status` stay exactly as they are.**

### Why raw (not encrypted) trader id
The trader dropdown already emits raw `t.Id.ToString()` and the filter matches raw `r.TraderId?.ToString()` — raw is this
suite's existing contract. Also `CryptoExtensions.Encrypt` uses a fresh IV per call, so an encrypted id would **differ in
every response** — unusable as a stable chart key. (Encryption is only for ids the FE posts back, e.g. TASK-035's `license_id`.)

## Must NOT change
The other 2 tracking charts, the counts/aggregation, the backbone/grain/filters/cascades, `DashboardChartData` and the 8
single-series charts, other dashboards. All DID_SPF.

## Definition of Done
- [x] `by_trader_move_status` matches REQ-020's payload exactly (chartType/valueUnit/3 categories in order with ids
      6/8/9/series{id,label,values}/total); zeros kept; Σ cells == `total`. *(shape done in code; numbers = capture)*
- [x] Grep: no `" - "` concatenation left in chart 1; the other 8 single-series charts unchanged (no `values` field anywhere).
- [x] `dotnet build` succeeds. Paste the new model + chart-1 builder + build result.

## Implementation Notes
(Jason — 2026-07-24)

### 1. Shared 2-D model (new siblings in `Models/Dashboard/DashboardMoveLicenseModel.cs`)
Added `DashboardChartGroupedSeries {id,label,values[]}` and `DashboardGroupedChartData
{chartType,valueUnit,categories[],series[],total}` exactly as specced, right after `DashboardChartData`.
**`DashboardChartSeriesItem` untouched** (still `{name,value}` only) and `DashboardChartCategory {id,label}` reused as-is
— so no `values` field leaks onto any single-series chart.

### 2. Tracking chart 1 → grouped-bar
- `DashboardTrackingChartsResponse.ByTraderMoveStatus` type → `DashboardGroupedChartData`; JSON key `by_trader_move_status` unchanged.
- **Category id↔label map pinned in one place** next to the label constants:
  `MOVE_STATUS_CATEGORIES = { ("6", รอดำเนินการ), ("8", กำลังขนย้าย), ("9", เสร็จสิ้นแล้ว) }` — fixed order, labels are
  TASK-034's existing constants (so ids and labels can't drift apart).
- New `BuildTraderMoveStatusChart(raw)`: groups by `{TraderId, TraderName}`, and for each category counts
  `Distinct(LicenseNo)` where `MoveStatusLabel(approved, actual) == category.Label` → **always 3 values, zeros emitted,
  positionally aligned**. `series` ordered **descending by row total**; `chartType="grouped-bar"`, `valueUnit="ฉบับ"`,
  `total` = Σ of every cell. The `"{trader} - {status}"` concatenation is gone (grep: 0).
- `series[].id` = **raw `TRADER_ID`** per SPEC-022 §2 (the dropdown/filter already use raw ids, and `Encrypt` uses a
  fresh IV per call so an encrypted id would change every response — unusable as a chart key).

### Structural note — why `BuildTableRows` was split
Chart 1 needs `TRADER_ID`, which the table row doesn't carry. Rather than add a field to the response DTO, I split the
core into `BuildRows(req)` → `(Raw, Table)` (one DAL call), with `BuildTableRows(req) => (await BuildRows(req)).Table`.
**`by_trader` and `by_move_status` still consume the exact same `Table` objects as before** — their inputs are untouched,
which is what keeps them byte-identical. `TableData` is unchanged.
Also added a `UNIT_BOOK = "ฉบับ"` constant used by the new builder; I deliberately left `BuildCountChart`'s existing
literal alone rather than refactor a shipped method.

### Verification
- `dotnet build` (Center+SPF) → **Build succeeded, 0 Error(s)** (one interim `CS0246` — the service now names
  `DashboardTrackingQueryResult`, so I added `using DidSpf.Oracle.DataAccess.SPF.QueryResult;` — then clean).
- Grep `" - "` in the tracking service → **0**.
- `DashboardGroupedChartData` referenced by **only** tracking chart 1; the other **19** `DashboardChartData` properties
  across `Models/Dashboard/` are untouched; `DashboardChartSeriesItem` still `{name,value}`.
- **Scope of proof, stated honestly:** the *shape* (keys, nesting, category order/ids, 3-slot zero-filled values) is
  verified by the code + attributes + build. The *numbers* (per-trader counts, Σ cells == total, descending order on
  real data) are data-dependent and cannot be checked without a DB (brownfield rule) → stakeholder capture.
  Unlike TASK-033 I did **not** need a serialization harness here: these are plain `[JsonProperty]` attributes with no
  extension-data ordering subtlety, so the wire shape follows directly from the declarations.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
