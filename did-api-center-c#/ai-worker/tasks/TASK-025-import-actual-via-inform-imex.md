# TASK-025: Re-attach `imported_qty` from `T_T_INFORM_IMEX` (DID_SPF) — dashboard-import actual side

- Source: SPEC-017 Part D (REQ-014); DR-14 stakeholder-confirmed the join + qty col
- Status: DONE
- Assignee: Jason (BE)
- Depends on: TASK-024 (permitted-only base)

## Review — Verdict: DONE (code) — Sober (SA), 2026-07-21
Read `GetImportDashboard` (`TTLicenseDtlRepository` L290-331). Matches SPEC-017 Part D exactly:
- `NVL(IIV.IMPORTED_QTY,0) AS ImportedQty` (L303); `IIV` (L320-326) = `SUM(D.QUANTITY) GROUP BY REF_LICENSE_NO,
  PRODUCT_CODE` from `T_T_INFORM_IMEX_DTL D INNER JOIN T_T_INFORM_IMEX H ON H.ID=D.INFORM_IMEX_ID WHERE
  H.INFORM_TYPE='0' AND H.IS_CANCEL=0`; join `ON IIV.REF_LICENSE_NO=L.LICENSE_NO AND IIV.PRODUCT_CODE=DTL.PRODUCT_CODE`.
- 1 row per (license, product) → many-to-one → no multiplication (mirrors license-move `IMV`). All **DID_SPF** tables
  (same connection; grep: 0 `ELicensing`/`V_RPT_IMPORT_PRODUCT` in the file) → hard-rule compliant, no cross-schema.
- qty=`QUANTITY` with the swappable comment; `INFORM_TYPE='0'`/`IS_CANCEL=0`; join on `L.LICENSE_NO` (not the header
  customs code). Backbone (FORM_ID=8/status=40, producer-country PRD/CTY pre-agg), conditional date predicate, ORDER BY,
  `GetImportProducts`, service/charts/model all untouched. Build 0 errors.
- **Acceptance = the bundled live capture** (dated + no-date): permitted vs actual per อ.8 line; `imported_qty` =
  SUM(QUANTITY) where declarations exist; no-date completes. **Capture-verify P-code alignment** (legacy `'-'`→0; if
  non-legacy rows wrongly 0 → license-level fallback). Then REQ-014 DELIVERED (permitted + actual).

## Goal
The actual customs-import quantity **does** have a DID_SPF source: `T_T_INFORM_IMEX` (+ `_DTL`). Attach it as a
**pre-aggregated LEFT JOIN** in `GetImportDashboard` (all DID_SPF — no ELicensing, hard-rule compliant; no C# merge).
This turns `imported_qty` from the parked 0 into the real actual-import sum. Permitted side + producer country unchanged.

## Change — raw SQL only, one method (`TTLicenseDtlRepository.GetImportDashboard`)

No new entity/repo — the join references table names directly (same as the producer-country pre-agg).

1. Select: `,0 AS ImportedQty` → `,NVL(IIV.IMPORTED_QTY,0) AS ImportedQty`.
2. Add before `WHERE`:
```sql
LEFT JOIN (
    SELECT D.REF_LICENSE_NO, D.PRODUCT_CODE, SUM(D.QUANTITY) AS IMPORTED_QTY
      FROM T_T_INFORM_IMEX_DTL D
      INNER JOIN T_T_INFORM_IMEX H ON H.ID = D.INFORM_IMEX_ID
     WHERE H.INFORM_TYPE = '0' AND H.IS_CANCEL = 0
     GROUP BY D.REF_LICENSE_NO, D.PRODUCT_CODE
) IIV ON IIV.REF_LICENSE_NO = L.LICENSE_NO AND IIV.PRODUCT_CODE = DTL.PRODUCT_CODE
```
- **qty col = `QUANTITY`** (stakeholder final). If they flip to `ACTUAL_QUANTITY`, change **only** the `SUM(D.QUANTITY)`
  → `SUM(D.ACTUAL_QUANTITY)` (one place). Leave a comment marking it swappable.
- **`INFORM_TYPE = '0'`** (import) `AND IS_CANCEL = 0` (per DR-14). Join key `D.REF_LICENSE_NO = L.LICENSE_NO`
  (T_T_LICENSE.LICENSE_NO like "7/2561"; the header's LICENSE_NO "F08…" customs code is NOT the join).
- Pre-aggregated (1 row per license+product → many-to-one → no multiplication; single materialize + hash join → no
  correlated subquery, no-date completes). Mirrors license-move `IMV move_qty`.

## Must NOT change
The permitted-side backbone (FORM_ID=8/status=40, `T_T_LICENSE_DTL`, unit, producer-country pre-agg), the conditional
date predicate, ORDER BY, the service/charts/model, other dashboards. **No ELicensing** — this is a DID_SPF join.

## Definition of Done
- [x] `GetImportDashboard` selects `NVL(IIV.IMPORTED_QTY,0)` with the `T_T_INFORM_IMEX(_DTL)` pre-agg LEFT JOIN
      (INFORM_TYPE='0', IS_CANCEL=0, by REF_LICENSE_NO+PRODUCT_CODE, qty=QUANTITY).
- [x] `dotnet build` succeeds (Center/SPF only — no ELicensing ref). Paste SQL + build result.
- [ ] (Acceptance, live capture — bundle w/ the permitted-side capture) dated + no-date: permitted vs **actual** per อ.8
      line; `imported_qty` = SUM(QUANTITY) where declarations exist (legacy/`PRODUCT_CODE='-'` → 0); no-date completes.
      **Capture-verify P-code alignment** (INFORM_IMEX_DTL.PRODUCT_CODE ↔ T_T_LICENSE_DTL.PRODUCT_CODE); if non-legacy
      rows wrongly 0 → flag Sober (license-level fallback). → then REQ-014 DELIVERED (permitted + actual).

## Implementation Notes
(Jason — 2026-07-24)

One-method change in `DidSpf.Oracle.DataAccess.SPF/Repositories/TTLicenseDtlRepository.cs::GetImportDashboard`
(raw SQL only, no new entity/repo — DID_SPF-native, hard-rule compliant, no ELicensing, no C# merge).

- **Select:** `,0 AS ImportedQty` → `,NVL(IIV.IMPORTED_QTY,0) AS ImportedQty`.
- **Added a pre-aggregated LEFT JOIN** before `WHERE` (after the producer-country/CTY joins):
```sql
LEFT JOIN (
    SELECT D.REF_LICENSE_NO, D.PRODUCT_CODE, SUM(D.QUANTITY) AS IMPORTED_QTY  -- qty col swappable: QUANTITY | ACTUAL_QUANTITY (DR-14)
      FROM T_T_INFORM_IMEX_DTL D
      INNER JOIN T_T_INFORM_IMEX H ON H.ID = D.INFORM_IMEX_ID
     WHERE H.INFORM_TYPE = '0' AND H.IS_CANCEL = 0
     GROUP BY D.REF_LICENSE_NO, D.PRODUCT_CODE
) IIV ON IIV.REF_LICENSE_NO = L.LICENSE_NO AND IIV.PRODUCT_CODE = DTL.PRODUCT_CODE
```
- qty col = **`QUANTITY`** with a `-- swappable` comment (flip the single `SUM(...)` to `ACTUAL_QUANTITY` if stakeholder
  changes their mind). `INFORM_TYPE='0'` (import) + `IS_CANCEL=0` per DR-14. Join key = `L.LICENSE_NO` (e.g. "7/2561"),
  NOT the header's customs "F08…" code. Pre-agg → 1 row per license+product → many-to-one → no row multiplication;
  single materialize + hash join → no correlated subquery → no-date completes. Mirrors license-move `IMV move_qty`.
- **Untouched:** permitted backbone (FORM_ID=8/status=40, T_T_LICENSE_DTL, unit, producer-country pre-agg),
  conditional ISSUE_DATE predicate, ORDER BY, `GetImportProducts`, service/charts/model.

### Verification
- `dotnet build` (Center, pulls SPF) → **Build succeeded, 0 Error(s)** (pre-existing warnings only).
- Grep the repo file for `ELicensing|V_RPT_IMPORT_PRODUCT` → **0 matches** (DID_SPF-only, hard-rule OK).
- Grep for `T_T_INFORM_IMEX_DTL` + `NVL(IIV.IMPORTED_QTY,0)` → present.
- Static-only per brownfield rule; data correctness (actual sums, P-code alignment, legacy `PRODUCT_CODE='-'`→0,
  no-date completes) deferred to the stakeholder live capture bundled with the permitted-side capture.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
