# TASK-027: DASHBOARD_IMPORT_A8 real-first IMEX query + 4 charts + 15-col table (`GetImportA8Dashboard`)

- Source: SPEC-018 (REQ-016); columns confirmed via DR-13 (a8 capture doc field→column mapping)
- Status: DONE
- Assignee: Jason (BE)
- Depends on: TASK-026

## Review — Verdict: DONE (code) — Sober (SA), 2026-07-21
Read the SQL (`TTLicenseDtlRepository.GetImportA8Dashboard` L369-423) + the service. Matches spec exactly:
- Real-first base `T_T_INFORM_IMEX_DTL D` INNER `T_T_INFORM_IMEX H` (`INFORM_TYPE='0' AND IS_CANCEL=0`) INNER
  `T_T_LICENSE L` (`L.LICENSE_NO=D.REF_LICENSE_NO AND L.FORM_ID=8`); LEFT `T_M_TRADER`(H.TRADER_ID)/`T_M_UNIT`
  (D.QUANTITY_UNIT_ID)/pre-agg-dedup `T_M_COUNTRY`(D.ORIGIN_COUNTRY_CODE). 17 aliases incl. START_DATE/ALLOWED_QUANTITY/
  QUANTITY/UNIT_PRICE_BAHT/AMOUNT_BAHT/IMPORT_EXPORT_SEQ.
- **Both date predicates conditional** — INFORM on base H, ISSUE on attached L; both empty ⇒ all ⇒ no-date completes.
  Detail-line grain (no base pre-agg, a10-shape); no correlated subqueries; joins many-to-one/1:1.
- **Service:** `BuildTableRows` now calls `GetImportA8Dashboard` (L122; stub gone) → filter + 15-col map; **4 charts**
  `by_trader`/`top5_by_origin_country` = SUM(ImportedQty) (L78/82), `by_trader_baht`/`top5_by_origin_country_baht` =
  SUM(AmountBaht) (L88/92); Top-5 for country; empty country → "ไม่ระบุ".
- **DID_SPF-only** (grep 0 `ELicensing`/`V_RPT` in the repo file); all-nullable DTO (mapping-safe); build 0 errors;
  TASK-026 contract + other dashboards untouched.
- **Acceptance = live capture** (both date filters independent; 4 charts qty+baht; 15 cols; actual vs permitted; origin;
  no-date completes). **Capture-confirms:** `H.START_DATE`="วันที่อนุญาตนำเข้า" (else H.ISSUE_DATE); LICENSE_NO uniqueness
  on the INNER L join. → REQ-016 DELIVERED.

## Goal
Fill the real-first backbone + measures. All DID_SPF (no ELicensing). Grain = per IMEX detail line (ครั้งที่/seq) —
**no pre-aggregation of the base** (each row = one declaration line; a10-shape). Charts SUM across lines.

## 1. SPF DAL — `TTLicenseDtlRepository.GetImportA8Dashboard(string issueStart, string issueEnd, string informStart, string informEnd)`
```sql
SELECT
       L.LICENSE_NO        AS LicenseNo
      ,L.ISSUE_DATE        AS IssueDate
      ,L.EXPIRY_DATE       AS ExpiryDate
      ,H.TRADER_ID         AS TraderId
      ,TR.TRADER_NAME      AS TraderName
      ,H.INFORM_DATE       AS InformDate
      ,H.START_DATE        AS ImportPermitDate          -- "วันที่อนุญาตนำเข้า" (capture-confirm vs H.ISSUE_DATE)
      ,D.PRODUCT_CODE      AS ProductCode
      ,D.PRODUCT_NAME      AS ProductName
      ,D.QUANTITY_UNIT_ID  AS QuantityUnitId
      ,U.UNIT_NAME         AS UnitName
      ,D.ALLOWED_QUANTITY  AS PermittedQty
      ,D.IMPORT_EXPORT_SEQ AS Seq
      ,D.QUANTITY          AS ImportedQty               -- actual; swappable → D.ACTUAL_QUANTITY (one place)
      ,D.UNIT_PRICE_BAHT   AS UnitPriceBaht
      ,D.AMOUNT_BAHT       AS AmountBaht
      ,CTY.COUNTRY_NAME    AS OriginCountryName
FROM
  T_T_INFORM_IMEX_DTL D
INNER JOIN
  T_T_INFORM_IMEX H ON H.ID = D.INFORM_IMEX_ID AND H.INFORM_TYPE = '0' AND H.IS_CANCEL = 0
INNER JOIN
  T_T_LICENSE L ON L.LICENSE_NO = D.REF_LICENSE_NO AND L.FORM_ID =: FORM_ID   -- :FORM_ID = 8
LEFT JOIN
  T_M_TRADER TR ON TR.ID = H.TRADER_ID
LEFT JOIN
  T_M_UNIT U ON U.ID = D.QUANTITY_UNIT_ID
LEFT JOIN (
    SELECT C.COUNTRY_CODE, MAX(C.COUNTRY_NAME) AS COUNTRY_NAME
      FROM T_M_COUNTRY C GROUP BY C.COUNTRY_CODE
) CTY ON CTY.COUNTRY_CODE = D.ORIGIN_COUNTRY_CODE
WHERE 1 = 1
  + [AND H.INFORM_DATE >= TO_DATE(:INFORM_START,'YYYY-MM-DD')] [AND H.INFORM_DATE < TO_DATE(:INFORM_END,'YYYY-MM-DD') + 1]
  + [AND L.ISSUE_DATE  >= TO_DATE(:ISSUE_START,'YYYY-MM-DD')]  [AND L.ISSUE_DATE  < TO_DATE(:ISSUE_END,'YYYY-MM-DD') + 1]
ORDER BY H.INFORM_DATE DESC, D.IMPORT_EXPORT_SEQ ASC
```
Both date predicates **conditional** (concatenate only when non-empty → both empty ⇒ all rows ⇒ no-date completes; the
INFORM_DATE range is on the base H, the ISSUE range on the attached L). No correlated subqueries; joins are many-to-one/1:1
→ no row multiplication (T_M_COUNTRY pre-agg-dedup for safety; INNER L one header per LICENSE_NO — verify uniqueness at capture).

## 2. DTO `QueryResult/DashboardImportA8QueryResult.cs` — ALL nullable (mapping-safe, per BUG-014-A)
`string? LicenseNo`, `DateTime? IssueDate/ExpiryDate/InformDate/ImportPermitDate`, `int? TraderId`, `string? TraderName`,
`string? ProductCode/ProductName`, `int? QuantityUnitId`, `string? UnitName`, `decimal? PermittedQty`, `int? Seq`,
`decimal? ImportedQty`, `decimal? UnitPriceBaht`, `decimal? AmountBaht`, `string? OriginCountryName`.

## 3. Service — swap the stub
- `BuildTableRows(req)`: `var rows = await _uowSPF.TTLicenseDtlRepo.GetImportA8Dashboard(req.IssueStart, req.IssueEnd,
  req.InformStart, req.InformEnd);` → filter `InList(req.Companies, r.TraderId?.ToString())`,
  `MatchEq(req.Unit, r.QuantityUnitId?.ToString())`, `InList(req.Products, r.ProductCode)` → map the 15 cols
  (dates single-formatted; `imported_qty = r.ImportedQty ?? 0`; `amount_baht = r.AmountBaht ?? 0`; origin empty → "ไม่ระบุ").
- `ChartData`: **4** charts — `by_trader` = SUM(ImportedQty) by TraderName; `top5_by_origin_country` = SUM(ImportedQty) by
  OriginCountry (Top-5); `by_trader_baht` = SUM(AmountBaht) by trader; `top5_by_origin_country_baht` = SUM(AmountBaht) by
  origin (Top-5). Empty country → "ไม่ระบุ".

## Must NOT change
The TASK-026 scaffold contract (endpoints/models), other dashboards. All DID_SPF — no ELicensing.

## Definition of Done
- [x] `GetImportA8Dashboard` implemented as above; DTO added; service stub replaced; 4 charts qty+baht; 15-col table.
- [x] `dotnet build` succeeds. Paste SQL + build result.
- [ ] (Acceptance, live capture) both date filters independent; 4 charts; 15 cols; actual(QUANTITY) vs permitted
      (ALLOWED_QUANTITY); origin country; no-date completes. **Capture-confirm:** `H.START_DATE` = "วันที่อนุญาตนำเข้า"
      (else H.ISSUE_DATE); LICENSE_NO uniqueness on the INNER L join. → REQ-016 DELIVERED.

## Implementation Notes
(Jason — 2026-07-24)

Filled the real-first backbone; swapped the TASK-026 stub. All DID_SPF, no ELicensing.

### 1. SPF DAL — `TTLicenseDtlRepository.GetImportA8Dashboard(issueStart, issueEnd, informStart, informEnd)`
Implemented exactly per spec: base `T_T_INFORM_IMEX_DTL D` INNER `T_T_INFORM_IMEX H` (`INFORM_TYPE='0' AND IS_CANCEL=0`)
INNER `T_T_LICENSE L` (`L.LICENSE_NO=D.REF_LICENSE_NO AND L.FORM_ID=:FORM_ID`=8) LEFT `T_M_TRADER TR` (H.TRADER_ID)
LEFT `T_M_UNIT U` LEFT pre-agg-dedup `(T_M_COUNTRY GROUP BY COUNTRY_CODE) CTY` on `D.ORIGIN_COUNTRY_CODE`. Selects the
17 aliases (incl. `H.START_DATE AS ImportPermitDate`, `D.ALLOWED_QUANTITY AS PermittedQty`, `D.QUANTITY AS ImportedQty`,
`D.UNIT_PRICE_BAHT`, `D.AMOUNT_BAHT`, `D.IMPORT_EXPORT_SEQ AS Seq`).
- **Both date predicates conditional** — INFORM range on base `H.INFORM_DATE`, ISSUE range on attached `L.ISSUE_DATE`;
  each `AND …` line concatenated only when its bound is non-empty ⇒ both empty ⇒ all rows ⇒ no-date completes.
- Grain = per IMEX detail line (no pre-agg of base; a10-shape). `ORDER BY H.INFORM_DATE DESC, D.IMPORT_EXPORT_SEQ ASC`.
- No correlated subqueries; joins many-to-one/1:1 (CTY pre-agg for safety; INNER L uniqueness per LICENSE_NO = capture-verify).

### 2. DTO — `QueryResult/DashboardImportA8QueryResult.cs`
All-nullable (mapping-safe, BUG-014-A): the 17 fields incl. `int? Seq`, `decimal? PermittedQty/ImportedQty/
UnitPriceBaht/AmountBaht`, `DateTime? InformDate/ImportPermitDate`, `string? OriginCountryName`.

### 3. Service — swapped the stub (`DashboardImportA8Service.BuildTableRows`)
- Now `await _uowSPF.TTLicenseDtlRepo.GetImportA8Dashboard(req.IssueDateStart, req.IssueDateEnd, req.InformDateStart,
  req.InformDateEnd)` → filter `InList(Companies, TraderId)`, `MatchEq(Unit, QuantityUnitId)`, `InList(Products,
  ProductCode)` → map the 15 cols (dates single-formatted via `ToStringTH(FormatStr.DATEONLY)`; `imported_qty`/`amount_baht`/
  `unit_price_baht`/`permitted_qty` = `?? 0`; origin empty → "ไม่ระบุ"). Re-added the `InList`/`MatchEq` helpers.
- The 4 charts already coded in TASK-026 now populate: `by_trader`/`top5_by_origin_country` = SUM(ImportedQty),
  `by_trader_baht`/`top5_by_origin_country_baht` = SUM(AmountBaht); Top-5 for country; empty country → "ไม่ระบุ".

### Verification
- `dotnet build` (Center, pulls SPF) → **Build succeeded, 0 Error(s)** (pre-existing warnings only).
- Grep the repo file for `ELicensing|V_RPT_IMPORT_PRODUCT` → **0** (DID_SPF-only, hard-rule OK); `GetImportA8Dashboard`+
  `T_T_INFORM_IMEX_DTL` present. TASK-026 scaffold contract (endpoints/models) unchanged; other dashboards untouched.
- Static-only per brownfield rule; actual vs permitted numbers, `H.START_DATE`=วันที่อนุญาตนำเข้า, LICENSE_NO uniqueness,
  no-date completes ⇒ stakeholder live capture. `D.QUANTITY` kept swappable to `ACTUAL_QUANTITY` (one place) if needed.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
