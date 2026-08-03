# TASK-038: Shared 2-D chart model — drop the unused `id` from `categories[]` and `series[]`

- Source: REQ-020 reopen (FE team: the ids are not used)
- Status: REVIEW
- Assignee: Jason (BE)
- Depends on: TASK-036, TASK-037


## Review — Verdict: DONE (code) — Sober (SA), 2026-07-24
- **He did the check I asked for and chose with evidence** (option B): `DashboardChartCategory` is *populated* in exactly
  2 places — the two 2-D charts — while the other **6** sites pass an always-empty list, so single-series charts emit
  `"categories": []` either way → dropping `id` from the shared type is invisible to them, and no near-duplicate
  `DashboardChartGroupedCategory` was needed. Right call, and he said which and why. ✔
- Verified: `JsonProperty("id")` in the shared chart model → **0**; `DashboardChartCategory` = `{label}` and still an
  **object** (not collapsed to a bare string, as instructed); `DashboardChartGroupedSeries` = `{label, values}`;
  **`DashboardChartSeriesItem` still `{name,value}`** ⇒ the 8 single-series charts byte-identical. ✔
- **Order preserved by construction:** tracking's `MOVE_STATUS_CATEGORIES` is now a `string[]` feeding **both**
  `Categories` and each row's `Values` (L261/L276) — same source, so alignment can't drift; license-book still generates
  both from `slots`/`_bookTypeFormIds` (REQ-018 config order intact). ✔
- **His flagged judgement is correct and implemented:** both charts still `GroupBy(new { TraderId, Label })` and emit only
  `Label` — so two traders sharing a name are **not** merged. Dropping the id from the payload without dropping it from
  the grouping key was exactly the right distinction; commented in both services. ✔
- Build 0 err. → REQ-020 code-complete again (capture + the `"stacked-bar"` FE confirm remain).

## Why
The FE doesn't read `categories[].id` / `series[].id`. Emitting them invents a contract we'd then have to keep — and the
category id was never derivable anyway (stakeholder confirmed the derived statuses are **not** in `T_S_COMMON_CODE`, so
move status has no real code; the `6/8/9` values came from an FE mock). Dropping them also makes the 2-D shape
consistent with the 8 single-series charts, which carry `{name, value}` and no id.

## Change (small, both charts share the model)
1. `DashboardChartCategory` is **shared with the single-series charts** — do **not** edit it. Instead give the 2-D model
   its own category type without an id, e.g.
   ```csharp
   public partial class DashboardChartGroupedCategory
   {
       [JsonProperty("label")] public string Label { get; set; } = string.Empty;
   }
   ```
   and point `DashboardGroupedChartData.Categories` at it. (If `DashboardChartCategory` turns out to have **no other
   consumer** — the 8 single-series charts all send `Categories = new()` — then instead just drop its `id` property and
   keep one type. **Check first, then pick;** say which you did.)
2. `DashboardChartGroupedSeries` — remove the `Id` property (keep `label` + `values`).
3. Tracking chart 1: drop the id from the category constants (keep the 3 labels + their fixed order) and stop setting
   `series[].id`. license-book chart 1: stop emitting both ids; **keep generating categories from `_bookTypeFormIds`
   order** — the config-driven ordering is what makes `values` align, not the ids.

⚠ **Do NOT collapse `categories` to a bare string array** — objects stay objects, minus one property. That would be a
second, unrequested shape change.

## Must NOT change
Category **order** (it defines `values` alignment), the labels, zero-filling, `total`, `chartType`/`valueUnit`, the
config-driven category generation (REQ-018), the 8 single-series charts, other dashboards.

## Definition of Done
- [x] No `id` in `categories[]`/`series[]` of either 2-D chart; `values` still positionally aligned; zeros kept.
- [x] The 8 single-series charts are unchanged (state which option you took for `DashboardChartCategory` and why).
- [x] `dotnet build` succeeds; grep shows no leftover id-setting for these two charts.

## Implementation Notes
(Jason — 2026-07-24)

### Which option I took for `DashboardChartCategory` — **Option B (dropped its `id`, kept ONE type)**
I checked first, as instructed. Every reference in the API:
- **Populated** in exactly **2** places — license-book chart 1 (`DashboardLicenseBookService` L203) and tracking chart 1
  (`DashboardTrackingService` L277), i.e. only the two 2-D charts.
- All other **6** sites pass `Categories = new List<DashboardChartCategory>()` — an always-**empty** list (import, import-a8,
  license-book's single-series builder, move-a10, move-license, tracking's `BuildCountChart`).

Since no single-series chart ever puts an object in that list, removing `id` from the shared type changes **nothing on
their wire** (they emit `"categories": []` either way). So Option B is safe and avoids a second near-duplicate type —
no `DashboardChartGroupedCategory` was created.

### Changes
1. **`DashboardChartCategory`** — `Id` removed, `label` kept (doc-comment records why single-series charts are unaffected).
2. **`DashboardChartGroupedSeries`** — `Id` removed (`label` + `values` kept).
3. **Tracking chart 1** — `MOVE_STATUS_CATEGORIES` is now a plain `string[]` of the 3 labels in the **same fixed order**
   (`รอดำเนินการ`, `กำลังขนย้าย`, `เสร็จสิ้นแล้ว`); the `6/8/9` ids are gone. Categories built as `{ Label = label }`;
   `series[].id` no longer set.
4. **License-book chart 1** — category `Id = $"a{formId}_..."` no longer emitted; `series[].id` no longer set. The
   `slots` list (built from `_bookTypeFormIds`) still generates **both** categories and values, so config order — the
   thing that actually aligns `values` — is untouched.
5. `categories` stayed an **array of objects** (`{label}`), not collapsed to bare strings, per the ⚠ in the task.

### Judgement call worth flagging
Both charts still **group by `TRADER_ID`** internally even though the id is no longer emitted — grouping by label alone
would silently merge two different traders that share a name into one row. The id is now a grouping key only; commented
in both services.

### Verification
- `dotnet build` (Center+SPF) → **Build succeeded, 0 Error(s)** (pre-existing warnings only).
- `JsonProperty("id")` in the shared chart model file → **0**; no `Id =` assignment remains for either 2-D chart
  (the only `Id`-ish hits left are an unrelated local `unitId` parse and TASK-035's required encrypted `license_id`).
- `DashboardChartSeriesItem` still `{name,value}`; the 6 empty-category call sites unchanged ⇒ the 8 single-series
  charts are byte-identical.
- Unchanged as required: category **order**, labels, zero-filling, `total`, `chartType`/`valueUnit`, and license-book's
  config-driven category generation (REQ-018).
- Static-only per brownfield rule; both charts rendering + Σ cells == `total` = stakeholder capture.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
