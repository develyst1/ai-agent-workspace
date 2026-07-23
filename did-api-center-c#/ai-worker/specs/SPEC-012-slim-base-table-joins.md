# SPEC-012: Replace the fat view joins with targeted slim base-table joins (a10 + license)

- Source: REQ-012
- Status: ACTIVE
- Depends on: TASK-017 (the current materialized-view joins are what we slim down)

## Assessment (Sober) — FLIPPED to "proceed", low-risk win

My preliminary "against" assumed inlining = more joins. The view DDL (`project-docs/req-012-view-ddl.md`)
shows the opposite:
- **`VW_PRODUCT` is FAT (~8 joins + computed label strings); the dashboards read ONLY `PRODUCT_TYPE_GROUP_CODE`.**
  That column = `PT.PRODUCT_TYPE_GROUP_CODE`, reachable in **3 tables** (`T_M_PRODUCT → T_M_PRODUCT_GROUP →
  T_M_PRODUCT_TYPE`). The view's 4th join (`T_M_PRODUCT_TYPE_GROUP`) only adds the group *name* (unused here); the
  other ~5 joins + string concats are pure overhead. (Product **name** on the dashboard comes from `DTL.PRODUCT_NAME`,
  not the view.)
- **`V_PROVINCE` is 3 joins; the dashboards read ONLY `AREA_NAME`** = `T_M_AREA.AREA_NAME`, reachable in **2 tables**
  (`T_M_PROVINCE → T_M_AREA`; `T_M_COUNTRY` unused).

⇒ Swapping each TASK-017 inline view's `FROM` from the fat view to the **slim base-table chain** is *fewer* joins,
lower per-row cost, and **result-identical for the used column** (the slim chain is a strict subset of the view's own
LEFT JOINs, and the exposed code/name come from the same tables). Net: an incremental-but-real perf win + drops the
dependency on a fat view. Low risk.

## Change — swap the FROM of the two TASK-017 inline views (both repo methods)

Keep the exact TASK-017 shape (inline view, `GROUP BY <join key>`, `MAX(...)`, same alias, same ON, same selected
column) — only the `FROM` changes. So the outer query, select list, and result are untouched.

### 1. Weapon group — replace the `VW_PRODUCT` inline view
```sql
-- TASK-017 (now): (SELECT PRODUCT_CODE, MAX(PRODUCT_TYPE_GROUP_CODE) FROM VW_PRODUCT GROUP BY PRODUCT_CODE) VWP
LEFT JOIN (
    SELECT P.PRODUCT_CODE,
           MAX(PT.PRODUCT_TYPE_GROUP_CODE) AS PRODUCT_TYPE_GROUP_CODE
      FROM T_M_PRODUCT P
      LEFT JOIN T_M_PRODUCT_GROUP PG ON PG.PRODUCT_GROUP_CODE = P.PRODUCT_GROUP_CODE
      LEFT JOIN T_M_PRODUCT_TYPE  PT ON PT.PRODUCT_TYPE_CODE  = PG.PRODUCT_TYPE_CODE
     GROUP BY P.PRODUCT_CODE
) VWP ON VWP.PRODUCT_CODE = DTL.PRODUCT_CODE
```
Selected unchanged: `VWP.PRODUCT_TYPE_GROUP_CODE AS WeaponCategoryCode`. (Same LEFT JOINs + join columns the view
uses; `PRODUCT_TYPE_GROUP_CODE` is `PT.PRODUCT_TYPE_GROUP_CODE` in the view too — the PTG join only adds the name.)

### 2. Region — replace the `V_PROVINCE` inline view
```sql
-- TASK-017 (now): (SELECT PROVINCE_NAME, MAX(AREA_NAME) FROM V_PROVINCE GROUP BY PROVINCE_NAME) VP
LEFT JOIN (
    SELECT PR.PROVINCE_NAME,
           MAX(AR.AREA_NAME) AS AREA_NAME
      FROM T_M_PROVINCE PR
      LEFT JOIN T_M_AREA AR ON AR.AREA_CODE = PR.AREA_CODE
     GROUP BY PR.PROVINCE_NAME
) VP ON VP.PROVINCE_NAME = LM.DEST_PROVINCE_NAME
```
Selected unchanged: `VP.AREA_NAME AS DestRegionName`. (`T_M_COUNTRY` dropped — unused; `AREA_NAME` comes from
`T_M_AREA` in the view too.)

Apply both to **`TTLicenseDtlRepository.GetMoveLicenseDashboard`** and **`TTInformMoveDtlRepository.GetMoveA10Dashboard`**.
`GROUP BY`+`MAX` kept (per TASK-017) → single-materialize + hash-join + guaranteed 1 row per key.

**Do NOT change:** the `IMV`/`RMV` derived joins (TASK-016), conditional date predicates, `LICENSE_STATUS=40`/
`FORM_ID=10`, the PK-`ID` master joins, ORDER BY, service LINQ (weapon-type filter on `WeaponCategoryCode`),
response contract. Column names are from the view DDL + cross-checked against `GetTraderLicenseDtl` (which uses the
same `T_M_PRODUCT→PRODUCT_GROUP→PRODUCT_TYPE` join columns).

## Acceptance
- [ ] No `VW_PRODUCT` / `V_PROVINCE` reference remains in either dashboard query; slim base-table inline views used.
- [ ] Re-capture (dated + no-date, both dashboards) matches today's **weapon type** + **dest region** exactly.
- [ ] `dotnet build` succeeds; no-date still completes (no timeout).

## Tasks
- TASK-019: swap the two inline-view FROMs to slim base-table chains (a10 + license) — Jason.

## Questions
(Jason asks here; Sober answers as `> answer: ...`)
