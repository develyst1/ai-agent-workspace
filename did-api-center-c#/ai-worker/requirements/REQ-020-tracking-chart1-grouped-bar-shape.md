# REQ-020: DASHBOARD_TRACKING — chart 1 `by_trader_move_status` must be a 2-D **grouped-bar**, not a flattened single series

- Status: READY_FOR_SA
- Priority: HIGH (FE cannot render the current payload as a grouped chart at all)
- Raised: 2026-07-24 — stakeholder supplied the **exact target payload** ("อันนี้คือตัวอย่างที่ต้องการ")

## Target shape (verbatim from the stakeholder's FE example)
```ts
{
  chartType: "grouped-bar",
  valueUnit: "ฉบับ",
  categories: [                       // ← the 3 move statuses, in this order
    { id: "6", label: "รอดำเนินการ" },
    { id: "8", label: "กำลังขนย้าย" },
    { id: "9", label: "เสร็จสิ้นแล้ว" },
  ],
  series: [                           // ← one entry per trader
    { id: "1231", label: "บริษัท บุลเล็ท มาสเตอร์ จำกัด", values: [352, 268, 279] },
    { id: "1232", label: "บริษัท ไทยอามส์ จำกัด",        values: [171, 119, 124] },
    …
  ],
  total: 1647,                        // ← grand total of every cell (verified: Σ all values = 1647)
}
```
`values[i]` is positionally aligned to `categories[i]`. Traders with 0 in a bucket still emit `0`
(see `{ values: [3, 0, 0] }` in the example) — **do not** drop empty cells.

## Current payload (wrong — from the stakeholder's live capture)
```json
"by_trader_move_status": {
  "chartType": "bar-horizontal",
  "categories": [],                                     // always empty
  "series": [ { "name": "บริษัท บุลเล็ท มาสเตอร์ จำกัด - เสร็จสิ้นแล้ว", "value": 523.0 },
              { "name": "บริษัท บุลเล็ท มาสเตอร์ จำกัด - รอดำเนินการ",  "value": 312.0 }, … ]
}
```
i.e. the 2-D data (trader × move-status) is **flattened into one series by string-concatenating
`"{trader} - {status}"`**, `categories` is unused, and there is no `total`. The FE cannot ungroup a
concatenated label, so the grouped bar chart can't be built.

## Requirement
Change **`by_trader_move_status` only** to the shape above:
- `chartType` = `"grouped-bar"`, `valueUnit` = `"ฉบับ"` (unchanged)
- `categories` = the 3 move statuses **in the fixed order รอดำเนินการ → กำลังขนย้าย → เสร็จสิ้นแล้ว**
  (same order as the FE example; same verbatim labels as REQ-017)
- `series[]` = one per trader: `{ id, label, values[3] }`, `values` aligned to `categories`, zeros kept
- `total` = sum of every cell
- Trader ordering: keep the current ordering rule (largest first) — SA to confirm against the example
  (352/171/120/… is descending by row total).

**The other two tracking charts (`by_trader`, `by_move_status`) are single-series and stay as they are.**

## Open items for SA (do not ask the stakeholder unless truly blocked)
1. **`categories[].id`** — the example uses `"6" / "8" / "9"`, which look like FE-side ids; our move status is
   *derived* (no DB code). Pick a stable, documented id scheme and keep it constant across responses.
   If the FE genuinely requires those exact ids, that's a 3-value constant map.
2. **`series[].id`** — should be the trader id (`TRADER_ID`). Note the stakeholder's example repeats `"1234"` for
   several traders; that is clearly mock sloppiness, not a spec — use the real distinct trader id
   (encrypted or raw per Center convention — SA decides, be consistent with the rest of the suite).
3. Whether this `grouped-bar` shape should become a **shared model** (a 2-D sibling of `DashboardChartData`)
   — see the question below before generalising.

## ❓ Porter → stakeholder (asked in parallel, not blocking this REQ)
`dashboard-license-book` chart 1 (`count_by_entrepreneur_and_type`) is the *other* 2-D chart in the suite and today
uses a different bespoke shape (`a{formId}_paid/_unpaid` keys — REQ-018/SPEC-020, deliberately left as-is because it is
FE-visible). **Does that chart need this same `grouped-bar` shape too?** If yes we should do both with one shared model
instead of ending up with three different 2-D shapes.

@Sober — SPEC + TASK. Data/aggregation is unchanged (same group-by trader × move-status already computed);
this is purely the response shape.

---
## ✅ 2026-07-24 — SCOPE EXTENDED: license-book chart 1 gets the same shape (stakeholder decision)
Stakeholder: *"มันเป็นเหมือนกันมั้ยล่ะ ถ้าเป็นเหมือนกัน ก็ทำเลย เพราะบางเมนูก็อาจจะไม่มี"* → Porter verified in code
and answered **yes, structurally identical**; stakeholder's rule therefore applies: do both.

### Evidence
| | tracking `by_trader_move_status` | license-book `count_by_entrepreneur_and_type` |
|---|---|---|
| series (rows) | trader | trader |
| categories (cols) | 3 move statuses | 8 = 4 book types × ชำระ/ยังไม่ชำระ |
| cell value | count (ฉบับ) | count (ฉบับ) |
| model | `DashboardChartData` but **flattened** into one series via `"{trader} - {status}"` | **`List<DashboardLicenseBookMixBarRow>`** — `{trader_name}` + `[JsonExtensionData] a{formId}_paid/_unpaid`; **no chartType / valueUnit / categories / total at all** |

Both are the same **series × categories matrix of counts** — one shared 2-D shape serves both.

**Key finding:** `DashboardChartData` has carried a `categories` field (`List<DashboardChartCategory>`) since day one
that has **never been populated** (always `[]`). The stakeholder's `grouped-bar` payload is exactly that field finally
being used — so this is **not a new model**, it is the shared model working as designed, plus a series item that
carries `values[]` instead of a single `value`.

### Requirement (added to this REQ)
`dashboard-license-book` chart 1 → same shape as §Target above:
- `categories[]` = the book-type × payment combos, generated **from `Configurations.LicenseBookFormIds` order**
  (REQ-018 made this config-driven — keep that; do NOT re-hardcode 8/10/16/17)
- `series[]` = `{ id = TRADER_ID, label = trader name, values[] }` aligned to `categories`, zeros kept
- `total` = Σ all cells; `valueUnit` = `"ฉบับ"`
- This **supersedes REQ-018's "chart 1 JSON identical to today"** acceptance for this one chart (REQ-018's other two
  items — `issue_date` rename, config-driven FORM_ID list — stand and are already captured-pending).

**@Sober — this does NOT contradict your SPEC-020 pushback.** You objected to squashing a 2-D chart into the
*single-series* `{name,value}` shape, and you were right — that shape cannot represent it. `grouped-bar`
(`categories[]` + `series[].values[]`) **can**, so the objection is resolved rather than overridden.

### One detail to settle (SA/FE, not the stakeholder)
license-book chart 1 renders **stacked** while tracking renders **grouped** — the *payload* is identical either way,
only the `chartType` string differs (`"grouped-bar"` vs e.g. `"stacked-bar"`). Confirm the exact string the FE
component expects for license-book before shipping; everything else is shared.

---
## ⚠ 2026-07-24 — the example's NUMBERS are mock (stakeholder confirmed the reference FE is a mockup)
`352/268/279`, `total: 1647`, the trader list and the `id` values are **illustrative only** — that FE was built ahead
of this backend with placeholder data. **The shape is the requirement; the numbers are not.**
Acceptance must therefore be checked as **rules**, not values:
- `series[i].values.length == categories.length`, positionally aligned, zeros kept
- `total == Σ` of every cell **in our own response** (the arithmetic that happens to hold in the mock, Σ=1647, is what
  proves the rule — not the figure 1647 itself)
- `chartType` / `valueUnit` / key names exactly as specified
Do **not** expect our `/chart` to reproduce the mock's traders or figures. Same applies to `categories[].id` "6/8/9" —
see the open item above; Porter has asked the stakeholder where those ids come from.

---
## ✅ 2026-07-24 — DROP the `id` fields (FE confirmed unused) — change to already-shipped code
Stakeholder relayed from the FE team: *"FE บอก ไม่ได้ใช้อยู่แล้ว เอาออกได้มั้ย"* → **yes, remove them.**

**Remove `id` from BOTH `categories[]` and `series[]`** in the shared 2-D model (`DashboardGroupedChartData` /
`DashboardChartGroupedSeries`), for **both** charts (tracking chart 1 + license-book chart 1):
```jsonc
// before                                    // after
{ "id": "6", "label": "รอดำเนินการ" }        →  { "label": "รอดำเนินการ" }
{ "id": "1231", "label": "บริษัท…",           →  { "label": "บริษัท…", "values": [...] }
  "values": [...] }
```
Everything else is unchanged: `chartType`, `valueUnit`, category order, `values[]` alignment, zeros kept, `total`.

**Why this is the right call, not just compliance:**
- `categories[].id` was **never derivable** — move status is computed (no DB code; the stakeholder confirmed it stays
  computed and will NOT be added to `T_S_COMMON_CODE`, see REQ-021). The mock's "6/8/9" had no source. Emitting an
  invented id would have been a made-up contract that drifts the first time anyone assumes it means something.
- Dropping them makes the 2-D shape **consistent with the 8 single-series charts**, which carry `{name, value}` and no
  id. One rule across the suite: charts carry labels + numbers, not keys.
- `series[].id` (TRADER_ID) is real, but unused = dead weight. **If a chart-level drill-down is ever requested, add it
  back deliberately** (like REQ-019 added `license_id` to `/table` when a real consumer appeared) — that is the
  precedent, and it kept the id encrypted per Center convention. Do not pre-emptively expose a raw trader id.

**Note this edits code already delivered** (TASK-036/037, Sober-reviewed). Small and additive-in-reverse: delete two
properties + their assignments. The `categories`/`series` objects stay objects — do not collapse `categories` to a bare
string array; that would be a second, unrequested shape change.

@Sober — micro-TASK for Jason, then this REQ is ready for capture. Nothing else in REQ-020 changes.

---
## ✅ 2026-07-24 — `chartType` for license-book chart 1 is **DECIDED, not pending**: `"stacked-bar"`
Stakeholder: *"คำถามนี้ไม่ต้องถาม เราทำไป เขาก็เอาตามเรา"* — we own the contract; the FE follows it.
⇒ tracking chart 1 = **`"grouped-bar"`** · license-book chart 1 = **`"stacked-bar"`** (as shipped in TASK-037).
This is the documented contract, not a guess awaiting confirmation. **Sober's "one unverified item" is closed** —
REQ-020 has nothing outstanding but the stakeholder's capture.
