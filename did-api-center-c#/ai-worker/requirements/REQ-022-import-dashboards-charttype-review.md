# REQ-022: DASHBOARD_IMPORT + IMPORT_A8 — every chart is `bar-horizontal`; review chart types suite-wide

- Status: **READY_FOR_SA** (was BLOCKED_ON_INPUT — the FE source arrived; see the ✅ section at the bottom, which is
  the authoritative one. Findings 1-3 above are the original investigation, kept for reasoning.)
- Priority: **HIGH** — 4 charts render as the wrong type today
- Raised: 2026-07-24 — stakeholder: *"chartType ของ dashboard-import กับ dashboard-import-a8 ผิดหรือเปล่า …
  ตรวจโค้ด frontend มันมีหลายแบบกว่านี้"*

## Finding 1 — import & import-a8 are the only dashboards with **zero chart-type variety** (verified in code)
Full suite inventory, read from the source on branch `feat/dashboard`:

| dashboard | chart | chartType |
|---|---|---|
| move-license | BarChartData1 | `bar-vertical` |
| move-license | LineChartData | `pie` ⚠ *(see finding 3)* |
| move-license | BarChartData2 | `bar-horizontal` |
| a10 | Top5ByBuyerUnit | `bar-horizontal` |
| a10 | ByBuyerGroup | `pie` |
| a10 | ByTrader | `bar-horizontal` |
| tracking | ByTraderMoveStatus | `grouped-bar` |
| tracking | ByTrader | `bar-horizontal` |
| tracking | ByMoveStatus | `pie` |
| license-book | CountByEntrepreneurAndType | `stacked-bar` |
| license-book | CountByEntrepreneur | `bar-horizontal` |
| license-book | CountByBookType | `pie` |
| license-book | PaidAmountByEntrepreneur | `bar-horizontal` |
| license-book | PaidAmountByBookType | `bar-vertical` |
| **import** | Top5ByProducerCountry | **`bar-horizontal`** |
| **import** | ByTrader | **`bar-horizontal`** |
| **import** | ByTraderLicenseCount | **`bar-horizontal`** |
| **import-a8** | ByTrader | **`bar-horizontal`** |
| **import-a8** | Top5ByOriginCountry | **`bar-horizontal`** |
| **import-a8** | ByTraderBaht | **`bar-horizontal`** |
| **import-a8** | Top5ByOriginCountryBaht | **`bar-horizontal`** |

Every other dashboard renders a "by category/group" breakdown as `pie` and mixes in `bar-vertical`;
**import (3/3) and import-a8 (4/4) emit `bar-horizontal` for everything.** Suite-wide counts:
`bar-horizontal` ×13 · `pie` ×4 · `bar-vertical` ×2 · `stacked-bar` ×1 · `grouped-bar` ×1 — and 7 of those 13
`bar-horizontal` are these two dashboards. That is the anomaly the stakeholder spotted.

## Finding 2 — ⚠ the JSON the stakeholder pasted does NOT match our current build
The pasted `/dashboard-import` shows `bar-vertical` / `bar-horizontal` / `pie` and `/dashboard-import-a8` shows
`bar-horizontal` / `bar-vertical` ×2 — **values our code cannot produce**: both services pass the literal
`"bar-horizontal"` at every `BuildChart` call site (`DashboardImportService` L92-94,
`DashboardImportA8Service` L98-101), and `git log -S'"pie"'` on `DashboardImportService.cs` returns **no commit ever**.
⇒ that payload came from somewhere else — an older deployment, or (most likely, given the confirmed precedent) the
**reference FE mock**. Same trap as the "ส่วนราชการตามกฎกระทรวง" buyer group.
**Porter has asked the stakeholder where it came from before anyone treats it as our current contract.**
If it turns out to be the mock, it is still useful — as a statement of *what the FE wants*, i.e. exactly the input
this REQ needs.

## Finding 3 — naming smell in move-license (not a bug, do not "fix" blind)
`DashboardMoveLicenseService` L220: the property is named **`LineChartData`** but emits **`"pie"`**. The JSON key is
what the FE binds to, so renaming the C# property is safe only if the `JsonProperty` stays put — and it may well be
that the *chart type* is what's wrong here rather than the name. Fold into the same review; do not touch separately.

## ~~What is needed before any change~~ — ✅ RESOLVED 2026-07-24, FE source read. Kept for the reasoning only.
The FE component's **supported `chartType` values**. The stakeholder says the FE code has more than these five; the FE
source is **not on the SA machine** (`sa-project/dashboard` turned out to be an unrelated Svelte "ammo-dashboard"
prototype with mock data). One of:
- the FE repo path, or
- the union type / switch statement listing the accepted strings.

Unlike an open contract detail — which per the 2026-07-24 PROTOCOL amendment **we decide and the FE follows** —
`chartType` is consumed by a component that only understands strings it implements. Emitting a value outside that set
renders nothing. So the accepted set is a **stated FE requirement**; picking *which* of them each chart uses remains
**ours**.

## Proposed direction once the list lands (Porter's read — SA to finalise)
Pick by data shape, consistent with the sibling dashboards rather than per-dashboard taste:
- **breakdown across a small set of categories** (buyer group, book type) → `pie` — matches a10 `ByBuyerGroup`,
  tracking `ByMoveStatus`, license-book `CountByBookType`
- **top-N ranking with long Thai names** (trader, country) → `bar-horizontal` — labels don't fit vertically
- **few, short categories** → `bar-vertical`
On that rule import's `ByTraderLicenseCount` (a per-trader count, a natural share-of-total) and import-a8's
country breakdowns are the strongest candidates to change — but **confirm against the FE's list and the reference
screens before committing**, and remember the reference FE's *numbers* are mock while its *shape* is evidence.

~~@Sober — hold until the FE list arrives.~~ **Superseded — see the ✅ section below: fully actionable.**

---
## ✅ 2026-07-24 — UNBLOCKED. FE source read (`sa-project/did-spf-frontend/project-did`). This is a REAL DEFECT.
Status: **READY_FOR_SA**, Priority **HIGH** — 4 charts render as the wrong chart type in production today.

### A. The FE's supported set is exactly THREE (single-series charts)
`src/components/partials/dashboard/chart/DashboardChart.tsx` L138-170 — a `switch (type)` with cases
**`pie`**, **`bar-vertical`**, **`bar-horizontal`** and **no `default`** ⇒ any other string returns `undefined` and
**renders nothing at all**. (The 2-D charts bypass this switch entirely and use dedicated components —
`DashboardGroupedBarChart`, `DashboardMixBarChart`.)

### B. The FE obeys whatever we send — so our value is what the user sees
Each card does `const chartN = <apiField> ?? EMPTY_<TYPE>` then `type={chartN.chartType as ChartType}`.
The `EMPTY_*` constant is only the empty-state fallback — **when our API returns data, our `chartType` wins.**
Those fallbacks are therefore a written statement of the FE's intended type per card.

### C. FE intent vs what we ship — **4 of 7 are wrong**
`ContentSection.tsx` of each page (`dashboard-import` L55-57, `dashboard-import-a8` L46-49):
| chart | FE intends | we send | |
|---|---|---|---|
| import `top5_by_producer_country` | **bar-vertical** | bar-horizontal | ❌ |
| import `by_trader` | bar-horizontal | bar-horizontal | ✅ |
| import `by_trader_license_count` | **pie** | bar-horizontal | ❌ |
| import-a8 `by_trader` | bar-horizontal | bar-horizontal | ✅ |
| import-a8 `top5_by_origin_country` | **bar-vertical** | bar-horizontal | ❌ |
| import-a8 `by_trader_baht` | bar-horizontal | bar-horizontal | ✅ |
| import-a8 `top5_by_origin_country_baht` | **bar-vertical** | bar-horizontal | ❌ |

⇒ **Fix = change 4 literals** in `DashboardImportService` L92/L94 and `DashboardImportA8Service` L99/L101.
No data, aggregation, key or shape change. The FE's own fallbacks are the specification.

### D. Finding 2 resolved — the pasted JSON was the FE mock (3rd occurrence)
It matches `src/hooks/dashboard/mockup.ts` (import L188/213/254; import-a8 L318/334/349/365) and the `EMPTY_*`
fallbacks exactly. Consistent with the PROTOCOL amendment: **shape/intent evidence — yes; live data — no.** Here the
"shape" it proves is precisely the chart-type contract, so it was the right thing for the stakeholder to send.

### E. license-book `stacked-bar` is FINE — the earlier decision holds
`DashboardLicenseBookMixBarResponse` (types L189-195) declares `chartType: string` (not a literal) and the card renders
through `DashboardMixBarChart`, which does not switch on the string. Our `"stacked-bar"` is accepted.
Tracking's `DashboardTrackingGroupedBarResponse` (L274-281) demands the literal **`"grouped-bar"`** — which is exactly
what we send. ✅ Both confirmed correct against real FE code, not assumption.

### F. 🔔 Two items for the **FE team** (ours are correct; theirs are stale) — Porter to relay
1. `DashboardLicenseBookMixBarResponse` (L192-193) still declares `categories: {id; label}[]` and
   `series: {id; label; values}[]` — but **the ids were removed by agreement** (REQ-020, "FE บอกไม่ได้ใช้อยู่แล้ว").
   They already updated the tracking interface (L274-281 has no ids); **license-book's was missed.** TypeScript will
   not error at runtime, but the declared type no longer matches the payload.
2. `DashboardGroupedBarResponse` (L57-63) also still carries ids and appears superseded by the tracking-specific
   interface — worth deleting or updating on their side.

@Sober — SPEC + TASK for the 4 literals. Everything needed is above; nothing to guess, nothing to ask.
