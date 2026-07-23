# REQ-012 — VW_PRODUCT / V_PROVINCE view definitions (stakeholder ran, 2026-07-20)

## Key finding: the views are FAT; the dashboards use only 1–2 columns each → a targeted base-table join is LEANER, not heavier. Flips the preliminary "recommend against."

### `VW_PRODUCT` — ~8 joins, dashboard uses ONLY `PRODUCT_TYPE_GROUP_CODE`
```
FROM T_M_PRODUCT P
LEFT JOIN T_M_PRODUCT_GROUP      PG  ON PG.PRODUCT_GROUP_CODE      = P.PRODUCT_GROUP_CODE
LEFT JOIN T_M_PRODUCT_TYPE       PT  ON PT.PRODUCT_TYPE_CODE       = PG.PRODUCT_TYPE_CODE
LEFT JOIN T_M_PRODUCT_TYPE_GROUP PTG ON PTG.PRODUCT_TYPE_GROUP_CODE = PT.PRODUCT_TYPE_GROUP_CODE
LEFT JOIN T_M_UNIT QU1 ...  LEFT JOIN T_M_UNIT QU2 ...
LEFT JOIN (T_S_COMMON_CODE 'ProductUsageType') PUT ...
LEFT JOIN (T_S_COMMON_CODE 'ProductCatagory')  PC  ...
-- + computed PRODUCT_NAME_LABEL / PRODUCT_NAME_DISPLAY_LICENSE strings
```
- The dashboards only read `VWP.PRODUCT_TYPE_GROUP_CODE` (weapon category; product name comes from
  `DTL.PRODUCT_NAME`, not the view). Deriving just that needs **3 tables**: `T_M_PRODUCT → T_M_PRODUCT_GROUP →
  T_M_PRODUCT_TYPE` (`PT.PRODUCT_TYPE_GROUP_CODE`). The other ~5 joins + string-concats are unused overhead.

### `V_PROVINCE` — 3 joins, dashboard uses ONLY `AREA_NAME`
```
FROM T_M_PROVINCE a LEFT JOIN T_M_AREA b ON a.area_code=b.area_code LEFT JOIN T_M_COUNTRY c ...
```
- Dashboards read only `VP.AREA_NAME` (dest region) via `PROVINCE_NAME`. Needs **2 tables**:
  `T_M_PROVINCE → T_M_AREA` (drop T_M_COUNTRY).

## @Sober — re-assess REQ-012 with this DDL
The preliminary "against" assumed inlining = MORE joins. The DDL shows the opposite: replacing the fat views
with **targeted slim derived tables** is fewer joins + low risk (a subset of the views' own LEFT JOINs, so
result-identical for the columns we use):
- weapon group: `(SELECT P.PRODUCT_CODE, PT.PRODUCT_TYPE_GROUP_CODE FROM T_M_PRODUCT P LEFT JOIN
  T_M_PRODUCT_GROUP PG ON … LEFT JOIN T_M_PRODUCT_TYPE PT ON …)`.
- region: `(SELECT PR.PROVINCE_NAME, AR.AREA_NAME FROM T_M_PROVINCE PR LEFT JOIN T_M_AREA AR ON AR.AREA_CODE =
  PR.AREA_CODE)`.
→ Likely a real, low-risk perf win (leaner than materializing the 8-join view). Confirm + write SPEC-012 if
you agree; re-capture must match today's weapon type + region exactly.
