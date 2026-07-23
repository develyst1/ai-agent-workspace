# TASK-019: Swap the two inline-view FROMs → slim base-table chains (a10 + license)

- Source: SPEC-012 (REQ-012)
- Status: DONE
- Assignee: Jason (BE)
- Depends on: TASK-017

## Goal

Replace the fat `VW_PRODUCT` (~8 joins) and `V_PROVINCE` (3 joins) inline views (from TASK-017) with **slim
base-table chains** that compute only the columns the dashboards use. Leaner + result-identical. Keep the exact
TASK-017 shape — only each inline view's `FROM` changes; alias, `GROUP BY`, `MAX`, `ON`, and the selected column
stay the same, so the outer query and results are untouched.

## Changes — both repo methods (`TTLicenseDtlRepository.GetMoveLicenseDashboard`, `TTInformMoveDtlRepository.GetMoveA10Dashboard`)

### 1. Weapon-group inline view (`VWP`)
```sql
LEFT JOIN (
    SELECT P.PRODUCT_CODE,
           MAX(PT.PRODUCT_TYPE_GROUP_CODE) AS PRODUCT_TYPE_GROUP_CODE
      FROM T_M_PRODUCT P
      LEFT JOIN T_M_PRODUCT_GROUP PG ON PG.PRODUCT_GROUP_CODE = P.PRODUCT_GROUP_CODE
      LEFT JOIN T_M_PRODUCT_TYPE  PT ON PT.PRODUCT_TYPE_CODE  = PG.PRODUCT_TYPE_CODE
     GROUP BY P.PRODUCT_CODE
) VWP ON VWP.PRODUCT_CODE = DTL.PRODUCT_CODE
```
Replaces the `(SELECT PRODUCT_CODE, MAX(PRODUCT_TYPE_GROUP_CODE) FROM VW_PRODUCT GROUP BY PRODUCT_CODE) VWP` from
TASK-017. Selected column unchanged: `VWP.PRODUCT_TYPE_GROUP_CODE AS WeaponCategoryCode`.

### 2. Region inline view (`VP`)
```sql
LEFT JOIN (
    SELECT PR.PROVINCE_NAME,
           MAX(AR.AREA_NAME) AS AREA_NAME
      FROM T_M_PROVINCE PR
      LEFT JOIN T_M_AREA AR ON AR.AREA_CODE = PR.AREA_CODE
     GROUP BY PR.PROVINCE_NAME
) VP ON VP.PROVINCE_NAME = LM.DEST_PROVINCE_NAME
```
Replaces the `(SELECT PROVINCE_NAME, MAX(AREA_NAME) FROM V_PROVINCE GROUP BY PROVINCE_NAME) VP`. Selected column
unchanged: `VP.AREA_NAME AS DestRegionName`.

Base-table join columns are from the view DDL (`project-docs/req-012-view-ddl.md`) and match `GetTraderLicenseDtl`'s
existing `T_M_PRODUCT→PRODUCT_GROUP→PRODUCT_TYPE` joins. `T_M_PRODUCT_TYPE_GROUP` and `T_M_COUNTRY` are intentionally
dropped (unused — they only supply names/country the dashboard doesn't read).

## Must NOT change
- `IMV`/`RMV` derived joins (TASK-016), conditional date predicates (no-date ⇒ all rows), `LICENSE_STATUS=40`/
  `FORM_ID=10`, PK-`ID` master joins, ORDER BY, the service LINQ (weapon-type filter on `WeaponCategoryCode`), the
  response contract.

## Definition of Done
- [x] Both dashboard queries: no `VW_PRODUCT` / `V_PROVINCE` left; the slim `VWP`/`VP` base-table inline views used;
      selected aliases (`WeaponCategoryCode`, `DestRegionName`) unchanged.
- [x] `dotnet build` succeeds. **Build succeeded. 0 Error(s).**
- [~] (Acceptance, brownfield re-capture) dated + no-date, weapon type + dest region match — at the re-test.

## Implementation Notes

**Done by Jason 2026-07-20.** SQL-only; only each inline view's `FROM` changed (alias/`GROUP BY`/`MAX`/`ON`/selected
column identical to TASK-017), so the outer query, service LINQ, and results are untouched. Both repo methods.

### 1. Weapon-group inline view (`VWP`) — `VW_PRODUCT` → 3-table chain
```sql
LEFT JOIN (
    SELECT P.PRODUCT_CODE,
           MAX(PT.PRODUCT_TYPE_GROUP_CODE) AS PRODUCT_TYPE_GROUP_CODE
      FROM T_M_PRODUCT P
      LEFT JOIN T_M_PRODUCT_GROUP PG ON PG.PRODUCT_GROUP_CODE = P.PRODUCT_GROUP_CODE
      LEFT JOIN T_M_PRODUCT_TYPE  PT ON PT.PRODUCT_TYPE_CODE  = PG.PRODUCT_TYPE_CODE
     GROUP BY P.PRODUCT_CODE
) VWP ON VWP.PRODUCT_CODE = DTL.PRODUCT_CODE
```
Selected: `VWP.PRODUCT_TYPE_GROUP_CODE AS WeaponCategoryCode` (unchanged). Matches `GetTraderLicenseDtl`'s existing
`T_M_PRODUCT→PRODUCT_GROUP→PRODUCT_TYPE` chain; `T_M_PRODUCT_TYPE_GROUP` dropped (name-only, unused).

### 2. Region inline view (`VP`) — `V_PROVINCE` → 2-table chain
```sql
LEFT JOIN (
    SELECT PR.PROVINCE_NAME,
           MAX(AR.AREA_NAME) AS AREA_NAME
      FROM T_M_PROVINCE PR
      LEFT JOIN T_M_AREA AR ON AR.AREA_CODE = PR.AREA_CODE
     GROUP BY PR.PROVINCE_NAME
) VP ON VP.PROVINCE_NAME = LM.DEST_PROVINCE_NAME
```
Selected: `VP.AREA_NAME AS DestRegionName` (unchanged). `T_M_COUNTRY` dropped (unused).

### Result-identical
Base-table join columns are the ones the view DDL (`project-docs/req-012-view-ddl.md`) uses to derive
`PRODUCT_TYPE_GROUP_CODE` / `AREA_NAME`; the dropped tables (`T_M_PRODUCT_TYPE_GROUP`, `T_M_COUNTRY`) only supply
names/country the dashboards don't read. Same `GROUP BY <join-key>` + `MAX` + `LEFT JOIN` shape → same per-key value,
NULL when unmatched. Weapon-type filter on `WeaponCategoryCode` and `dest_region` output unchanged.

### Unchanged (per "Must NOT change")
`IMV`/`RMV` derived joins (TASK-016), conditional date predicates (no-date ⇒ all), `LICENSE_STATUS=40`/`FORM_ID=10`,
PK-`ID` master joins, ORDER BY, service LINQ, response contract.

### Verification (evidence)
- **`dotnet build`** (from `spf/DidSpf.WebApi.Center`, builds the DAL): **Build succeeded. 0 Error(s).**
- **Static grep:** no `FROM VW_PRODUCT` / `FROM V_PROVINCE` left in either dashboard query; both now use
  `FROM T_M_PRODUCT P …` and `FROM T_M_PROVINCE PR …` inline views. (The `GetTraderLicenseDtl` method's own
  T_M_PRODUCT joins are a separate query, untouched.)
- **Result-identical by construction** (same keys/aggregates/shape, leaner FROM). Weapon-type + dest-region match
  + no-date-completes is the brownfield re-capture acceptance.

## Review — Verdict: DONE (code) — Sober (SA), 2026-07-21
Read both repo methods. Correct + result-identical for the used columns:
- **license** (`TTLicenseDtlRepository` L234-250) + **a10** (`TTInformMoveDtlRepository` L67-81): `VP` = slim
  `T_M_PROVINCE PR LEFT JOIN T_M_AREA AR ON AR.AREA_CODE = PR.AREA_CODE`, `MAX(AR.AREA_NAME) GROUP BY PROVINCE_NAME`;
  `VWP` = slim `T_M_PRODUCT P LEFT JOIN T_M_PRODUCT_GROUP PG (PRODUCT_GROUP_CODE) LEFT JOIN T_M_PRODUCT_TYPE PT
  (PRODUCT_TYPE_CODE)`, `MAX(PT.PRODUCT_TYPE_GROUP_CODE) GROUP BY PRODUCT_CODE`. No `VW_PRODUCT`/`V_PROVINCE` left.
- **Join columns match the view DDL exactly** (`req-012-view-ddl.md`): the view's `PRODUCT_TYPE_GROUP_CODE` is
  `PT.PRODUCT_TYPE_GROUP_CODE` (the dropped `T_M_PRODUCT_TYPE_GROUP` join only added the group *name*); `AREA_NAME` is
  `AR.AREA_NAME` (dropped `T_M_COUNTRY` unused). Same `GROUP BY <key>`+`MAX`+`LEFT JOIN` shape as TASK-017 → same
  per-key value, NULL when unmatched. The dropped fat-view joins (units/common-code) could only have fanned out rows
  the TASK-017 `MAX`/`GROUP BY` already collapsed — so the value is unchanged.
- **Untouched:** IMV/RMV (TASK-016), date predicates (no-date ⇒ all), `LICENSE_STATUS=40`/`FORM_ID=10`, PK-`ID`
  joins, ORDER BY, service LINQ (weapon filter on `WeaponCategoryCode`), response contract. Build 0 errors.
- **Acceptance (brownfield re-capture):** dated + no-date, both dashboards — **weapon type** + **dest region** match
  today exactly + no-date still completes. Result-identical by construction; confirmed at the re-test.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
