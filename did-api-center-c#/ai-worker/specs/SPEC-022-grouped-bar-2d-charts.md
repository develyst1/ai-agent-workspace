# SPEC-022: 2-D `grouped-bar` chart shape — tracking chart 1 + license-book chart 1 (one shared model)

- Source: REQ-020 (stakeholder supplied the exact target payload; scope extended to license-book)
- Status: ACTIVE

> **⚠ SUPERSEDED IN PART (TASK-038, 2026-07-24) — the `id` fields below are GONE.** The FE confirmed it never read
> `categories[].id` / `series[].id`, so both were removed: `DashboardChartCategory` is now `{label}` only and
> `DashboardChartGroupedSeries` is `{label, values}`. Consequently decisions **1** (the `6/8/9` category ids) and **2**
> (`series[].id` = raw TRADER_ID) below are **historical** — read them for the reasoning, not the current contract.
> Everything else still stands: category **order** (that is what aligns `values`), labels, zero-fill, `total`,
> `chartType`/`valueUnit`, config-driven license-book categories. Note the charts still **group by TRADER_ID internally**
> (it just isn't emitted) so same-named traders don't merge — see TASK-038.

## Correction to my SPEC-020 pushback (owning it)
In SPEC-020 I argued chart 1 shouldn't move to the shared model because "`DashboardChartData` is a single series —
structurally it can't fit". **That was wrong on the model.** `DashboardChartData` has always carried
`categories: List<DashboardChartCategory>`, and its own doc comment reads *"categories ส่ง [] เมื่อ chartType ไม่ใช่
grouped-bar"* — i.e. `grouped-bar` was designed in from day one and simply never used (every service initialises
`Categories = new()`); I checked how it was *used*, not what it was *designed for*. Had I caught that, SPEC-020 would
have proposed this shape instead of preserving the bespoke one.
My other two objections were sound and are now **resolved, not overridden**: the FE-visible break and the
"identical to today" conflict were the stakeholder's call, and they've now explicitly asked for the change.
*(What still holds: the **single-series** `{name,value}` shape genuinely cannot carry 2-D — which is why the fix is
`categories[]` + `series[].values[]`, not the existing series item.)*

## Shared model (new — does NOT touch the 8 working single-series charts)
`DashboardChartSeriesItem` is `{name, value}` and cannot carry a row of values, so add a 2-D sibling next to
`DashboardChartData` (same shared file, `Models/Dashboard/DashboardMoveLicenseModel.cs`):
```csharp
public partial class DashboardChartGroupedSeries      // one row (e.g. a trader)
{
    [JsonProperty("id")]     public string Id { get; set; } = string.Empty;
    [JsonProperty("label")]  public string Label { get; set; } = string.Empty;
    [JsonProperty("values")] public List<decimal> Values { get; set; } = new();   // positionally aligned to categories
}

public partial class DashboardGroupedChartData        // the 2-D chart
{
    [JsonProperty("chartType")]  public string ChartType { get; set; } = string.Empty;
    [JsonProperty("valueUnit")]  public string ValueUnit { get; set; } = string.Empty;
    [JsonProperty("categories")] public List<DashboardChartCategory> Categories { get; set; } = new();  // reuse {id,label}
    [JsonProperty("series")]     public List<DashboardChartGroupedSeries> Series { get; set; } = new();
    [JsonProperty("total")]      public decimal Total { get; set; }
}
```
**Why a sibling and not a change to `DashboardChartData`:** adding `values[]` to `DashboardChartSeriesItem` would emit a
dead `values` (or null `value`) on all **8** existing single-series charts across 6 dashboards — needless churn/regression
risk. `DashboardChartCategory {id,label}` is reused as-is. Both 2-D charts use the new model ⇒ **one shared 2-D shape**,
exactly what REQ-020 asked for (no third bespoke shape).

## Decisions on REQ-020's open items

**1. `categories[].id` (tracking) = the stakeholder's example values, verbatim: `"6"` รอดำเนินการ, `"8"` กำลังขนย้าย,
`"9"` เสร็จสิ้นแล้ว.** Our move status is derived (no DB code), so any id is invented; the FE example is the *only*
evidence of what the FE expects, and it was given as "ตัวอย่างที่ต้องการ". Risk is asymmetric — if the FE binds to those
ids, inventing `1/2/3` breaks it; if it ignores them, matching costs nothing. Implement as a documented 3-entry constant
map beside the label constants so the pairing can't drift.

**2. `series[].id` = the RAW `TRADER_ID`** (not AES-encrypted). Two reasons, both decisive:
- **Already on the wire**: the trader dropdown emits `Value = t.Id.ToString()` (raw) and the filter matches
  `r.TraderId?.ToString()` — raw trader ids are this suite's existing contract.
- **Encryption would be functionally wrong here**: `CryptoExtensions.Encrypt` uses a fresh IV per call, so the same
  trader would get a **different id in every response** — unusable as a stable chart/legend key. (Encryption is for
  ids the FE sends back to an endpoint, e.g. TASK-035's `license_id`.)

**3. Trader ordering:** keep the existing rule — **descending by the row total** (matches the example: 352/171/120…),
then the existing tie-break/limit if any. `total` = Σ of every cell.

**4. Zeros:** emit `0` for empty cells — `values` must stay positionally aligned to `categories` (REQ-020 is explicit).

## A. Tracking chart 1 — `by_trader_move_status`
`chartType = "grouped-bar"`, `valueUnit = "ฉบับ"`; `categories` = the 3 statuses in the **fixed order** รอดำเนินการ →
กำลังขนย้าย → เสร็จสิ้นแล้ว (verbatim REQ-017 labels + the ids above); `series[]` = one per trader
`{id = TRADER_ID, label = trader name, values[3]}`; `total` = Σ all cells.
Aggregation is unchanged (the same trader × move-status counts already computed) — **this is purely the response shape**;
the current `"{trader} - {status}"` string-concat flattening goes away. `by_trader` and `by_move_status` stay single-series.

## B. License-book chart 1 — `count_by_entrepreneur_and_type`
Same model. **Supersedes REQ-018's "chart 1 identical to today"** for this chart only (REQ-018's `issue_date` rename +
config-driven FORM_ID list still stand).
- `categories[]` generated **from `Configurations.LicenseBookFormIds` order** (keep REQ-018's config-driven win — do NOT
  re-hardcode 8/10/16/17): for each configured formId, two entries in this order —
  `{id: "a{formId}_paid", label: "{BookTypeLabel(formId)} (ชำระแล้ว)"}` then `{id: "a{formId}_unpaid", label: "… (ยังไม่ชำระ)"}`.
  Using the old `a{formId}_paid/_unpaid` strings as the **ids** preserves exactly the identifiers the FE already knew
  (REQ-018/TASK-033) — free continuity.
- `series[]` = one per trader `{id = TRADER_ID, label = trader name, values[2 × n]}` aligned to `categories`, zeros kept.
- `total` = Σ all cells; `valueUnit = "ฉบับ"`.
- `DashboardLicenseBookMixBarRow` (+ its `[JsonExtensionData]`) is then unused → delete it.
- **`chartType` for license-book = `"stacked-bar"` — DECIDED, not pending** (tracking stays `"grouped-bar"`).
  Per the 2026-07-24 protocol amendment: where the FE has stated a requirement we follow it; where a detail is merely
  open (enum string, key name, ordering) **we decide and document, and the FE follows**. license-book renders stacked,
  tracking renders grouped, the payload is identical either way → this is now the documented contract. No FE confirmation.
- *Note (recorded, not actioned — stakeholder deferred):* `BookTypeLabel()` returns `""` for a FORM_ID outside
  `BOOK_TYPES`, so a 5th configured type would yield a category label of just " (ชำระแล้ว)". Today's [8,10,16,17] are all
  labelled. The one-line `อ.{formId}` fallback stays on the shelf per the stakeholder.

## Acceptance
- [ ] Tracking chart 1 matches the REQ-020 payload exactly (chartType/valueUnit/categories order+ids/series/total; zeros kept).
- [ ] License-book chart 1 uses the same model, categories driven by config order, ids `a{formId}_paid/_unpaid`.
- [ ] The other 8 single-series charts are byte-identical (no `values`/shape change anywhere else); `dotnet build` succeeds.
- [ ] Capture: both charts render; Σ cells == `total`.

## Tasks
- **TASK-036** — shared 2-D model + tracking chart 1.
- **TASK-037** — license-book chart 1 onto the same model (depends on 036's model).

## Questions
(Jason asks here; Sober answers as `> answer: ...`)
