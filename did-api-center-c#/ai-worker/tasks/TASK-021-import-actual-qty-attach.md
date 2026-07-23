# TASK-021: Attach จำนวนที่นำเข้าจริง (`imported_qty`) from `V_RPT_IMPORT_PRODUCT` — dashboard-import

- Source: SPEC-014 (REQ-014); DATA REQUEST 10 CLOSED → source = `V_RPT_IMPORT_PRODUCT`
- Status: DONE
- Assignee: Jason (BE)
- Depends on: TASK-020

## Review — Verdict: DONE (code) — Sober (SA), 2026-07-21
Read `GetImportDashboard` (`TTLicenseDtlRepository` L290-331). Correct:
- `,NVL(IIV.IMPORTED_QTY,0) AS ImportedQty` (L303) — stub gone; `IIV` = `SUM(RIP.QUANTITY) GROUP BY REF_LICENSE_NO,
  REF_PRODUCT_CODE` (L320-326) joined `ON IIV.REF_LICENSE_NO = L.LICENSE_NO AND IIV.REF_PRODUCT_CODE = DTL.PRODUCT_CODE`
  → **1 row per (license, product)** → many-to-one, no multiplication (same shape as license-move's `IMV`). Pre-aggregated
  report view (materialize once + hash-join), no correlated subquery → no-date completes.
- Backbone (FORM_ID=8/status=40, LICENSE_DTL, unit, producer-country pre-agg), conditional date predicate, ORDER BY —
  all unchanged. Decisions honored: producer country = license-declared (`T_T_LICENSE_DTL_PRODUCER`), sum ALL declarations.
  Build 0 errors.
- **Acceptance = live capture** (dated + no-date, both bundled with TASK-020): permitted vs actual per อ.8 line correct,
  producer country populated, ฉบับ = distinct-license count, no-date completes → then REQ-014 DELIVERED.
- Two capture-time confirmations (non-blocking): `IS_CONFIRM` (default sum-all is fine unless stakeholder wants
  confirmed-only — 1-line add), and producer-country source (kept license producer per my decision).

## Goal

Replace the `0 AS ImportedQty` stub in `TTLicenseDtlRepository.GetImportDashboard` with the **actual imported qty**
from `V_RPT_IMPORT_PRODUCT`, attached as a **pre-aggregated LEFT JOIN** (mirror a10/license `move_qty` — no per-row
correlated subquery; no-date must still complete). This makes the table's `จำนวนที่นำเข้าจริง` real (permitted vs actual).

## Change — `GetImportDashboard` (one repo method)

Add the attach and swap the stub select:
```sql
-- replace:  ,0 AS ImportedQty
-- with:     ,NVL(IIV.IMPORTED_QTY,0) AS ImportedQty
...
LEFT JOIN (
    SELECT RIP.REF_LICENSE_NO,
           RIP.REF_PRODUCT_CODE,
           SUM(RIP.QUANTITY) AS IMPORTED_QTY
      FROM V_RPT_IMPORT_PRODUCT RIP
     GROUP BY RIP.REF_LICENSE_NO, RIP.REF_PRODUCT_CODE
) IIV ON IIV.REF_LICENSE_NO = L.LICENSE_NO AND IIV.REF_PRODUCT_CODE = DTL.PRODUCT_CODE
```
- `V_RPT_IMPORT_PRODUCT.QUANTITY` = actual imported qty; `REF_LICENSE_NO` + `REF_PRODUCT_CODE` link to the อ.8 license
  + product line. Grouped by those two keys → **1 row per (license, product)** → many-to-one → no row multiplication
  (same shape as license-move's `IMV` move_qty).
- Pre-aggregated so the report **view** is materialized once + hash-joined (REQ-011/017 lesson) — do **not** join it
  per-row. Watch no-date completion at capture; if the view is fat and slow even once, flag Sober (may need a slimmer
  source / `NO_MERGE`).

## Decisions (Sober)
- **ประเทศผู้ผลิต stays the license-declared producer** (`T_T_LICENSE_DTL_PRODUCER`→`T_M_COUNTRY`, from TASK-020) — the
  table column is "ประเทศผู้ผลิต" (manufacturer), not the customs origin. Do **not** switch it to
  `V_RPT_IMPORT_PRODUCT.COUNTRY_NAME`. (Confirm at capture.)
- **Sum ALL declarations** for `imported_qty` (default; mirrors a10 summing all INFORM_MOVE). Do **not** filter
  `IS_CONFIRM` unless the capture shows the stakeholder wants only confirmed imports — flag it as a capture question.

## Must NOT change
The TASK-020 backbone (FORM_ID=8/status=40, `T_T_LICENSE_DTL`, unit, producer-country pre-agg), the conditional date
predicate, ORDER BY, the service/charts/model, other dashboards.

## Definition of Done
- [x] `imported_qty` = `NVL(SUM(V_RPT_IMPORT_PRODUCT.QUANTITY),0)` by `REF_LICENSE_NO`+`REF_PRODUCT_CODE`, via the
      pre-aggregated `IIV` LEFT JOIN; stub `0 AS ImportedQty` gone.
- [x] `dotnet build` succeeds. **Build succeeded. 0 Error(s).** No-date completes (pre-agg, no correlated subquery).
- [~] (Acceptance, live capture — bundle w/ TASK-020) dated + no-date: permitted vs actual correct — at the re-test.

## Implementation Notes

**Done by Jason 2026-07-20.** One-repo-method change in `GetImportDashboard` — swapped the `imported_qty` stub for
the real actual-import qty via a pre-aggregated LEFT JOIN (mirror license-move's `IMV move_qty`).

- **Select:** `,0 AS ImportedQty` → `,NVL(IIV.IMPORTED_QTY,0) AS ImportedQty`.
- **Added join** (before `WHERE`):
  ```sql
  LEFT JOIN (
      SELECT RIP.REF_LICENSE_NO,
             RIP.REF_PRODUCT_CODE,
             SUM(RIP.QUANTITY) AS IMPORTED_QTY
        FROM V_RPT_IMPORT_PRODUCT RIP
       GROUP BY RIP.REF_LICENSE_NO, RIP.REF_PRODUCT_CODE
  ) IIV ON IIV.REF_LICENSE_NO = L.LICENSE_NO AND IIV.REF_PRODUCT_CODE = DTL.PRODUCT_CODE
  ```
  Grouped by `REF_LICENSE_NO`+`REF_PRODUCT_CODE` → **1 row per (license, product)** → many-to-one, no row
  multiplication / no permitted-qty inflation (same shape as license-move's `IMV`). Pre-aggregated (the report
  **view** materializes once + hash-joins) — no per-row correlated subquery → no-date still completes.

### Sober's decisions honored
- **ประเทศผู้ผลิต unchanged** — stays the license-declared producer (`T_T_LICENSE_DTL_PRODUCER`→`T_M_COUNTRY`, TASK-020);
  did **not** switch to `V_RPT_IMPORT_PRODUCT.COUNTRY_NAME`.
- **Sum ALL declarations** for `imported_qty` (no `IS_CONFIRM` filter) — default, mirrors a10 summing all INFORM_MOVE.

### Unchanged (per "Must NOT change")
TASK-020 backbone (`FORM_ID=8`/`STATUS=40`, `T_T_LICENSE_DTL`, unit, producer-country pre-agg), conditional date
predicate, ORDER BY, the service/charts/model, other dashboards.

### Verification (evidence)
- **`dotnet build`** (from `spf/DidSpf.WebApi.Center`, builds the DAL): **Build succeeded. 0 Error(s).**
- **Static grep:** stub `0 AS ImportedQty` gone; `NVL(IIV.IMPORTED_QTY,0)` select + the `IIV` pre-agg
  `V_RPT_IMPORT_PRODUCT` join present.
- Result-shape: `imported_qty` now real per อ.8 line (permitted vs actual). Live capture (dated + no-date, bundled
  with TASK-020) is the brownfield acceptance → then REQ-014 DELIVERED.

## Questions

- **`IS_CONFIRM` (capture question, per Sober):** `imported_qty` currently sums **all** `V_RPT_IMPORT_PRODUCT`
  declarations. If the stakeholder wants **only confirmed** imports, add an `IS_CONFIRM` predicate inside the `IIV`
  subquery — one-line change; confirm at the capture.
- **Producer country at capture:** confirm "ประเทศผู้ผลิต" should stay the license-declared producer (not the customs
  origin on `V_RPT_IMPORT_PRODUCT`) — per Sober's decision, kept as-is.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
