# TASK-017: Materialize the VW_PRODUCT / V_PROVINCE view joins → kill the no-date timeout (a10 + license)

- Source: SPEC-011 (REQ-011) — REWORK follow-up to TASK-016
- Status: DONE
- Assignee: Jason (BE)
- Depends on: TASK-016 (done)

## Why (diagnosis)

Re-test after TASK-016: **dated works on all endpoints; no-date TIMES OUT on ALL endpoints** — including
license/a10 `/chart` whose aggregated output is tiny. So it's **query-level slowness, not output volume**, and
TASK-016 (which fixed the correlated sub-queries) didn't remove it. The remaining heavy joins scanned over the
**full 22k-row set** are the two **views**: `VW_PRODUCT` (join by `PRODUCT_CODE`) and `V_PROVINCE` (join by the
`PROVINCE_NAME` string). With **no DB-index rights**, Oracle merges these views and runs them as **nested loops —
re-evaluating the view per outer row** → O(rows × view) → timeout. Dated is fast only because it feeds far fewer
rows into the same joins.

**Fix = the TASK-016 trick applied to the view joins:** wrap each view in a `GROUP BY <join key>` inline view so
Oracle **materializes it once** and **hash-joins** → O(view + rows). Code-only, **no indexes**, **result-identical**
(`V_PROVINCE.PROVINCE_NAME` is unique — `province_name_dup=0`; `VW_PRODUCT.PRODUCT_CODE` treated 1:1 per TASK-014,
and `MAX()` dedups safely = the current LEFT-JOIN-picks-one behavior).

## Changes — SQL only, both repo methods

### 1. `TTLicenseDtlRepository.GetMoveLicenseDashboard`
Replace the two plain view joins:
```sql
-- was: LEFT JOIN V_PROVINCE VP ON VP.PROVINCE_NAME = LM.DEST_PROVINCE_NAME
LEFT JOIN (
    SELECT PROVINCE_NAME, MAX(AREA_NAME) AS AREA_NAME
      FROM V_PROVINCE
     GROUP BY PROVINCE_NAME
) VP ON VP.PROVINCE_NAME = LM.DEST_PROVINCE_NAME

-- was: LEFT JOIN VW_PRODUCT VWP ON VWP.PRODUCT_CODE = DTL.PRODUCT_CODE
LEFT JOIN (
    SELECT PRODUCT_CODE, MAX(PRODUCT_TYPE_GROUP_CODE) AS PRODUCT_TYPE_GROUP_CODE
      FROM VW_PRODUCT
     GROUP BY PRODUCT_CODE
) VWP ON VWP.PRODUCT_CODE = DTL.PRODUCT_CODE
```
Selected columns unchanged: `VP.AREA_NAME AS DestRegionName`, `VWP.PRODUCT_TYPE_GROUP_CODE AS WeaponCategoryCode`.

### 2. `TTInformMoveDtlRepository.GetMoveA10Dashboard`
Same two replacements (this query has both `V_PROVINCE VP` and `VW_PRODUCT VWP` joins). Selected columns unchanged
(`VP.AREA_NAME AS DestRegionName`, `VWP.PRODUCT_TYPE_GROUP_CODE AS WeaponCategoryCode`).

**Do NOT change:** the `IMV`/`RMV` derived joins (TASK-016), the conditional date predicates (no-date must still
return all), the `L.FORM_ID=10`/`LICENSE_STATUS=40` filters, other joins (`T_M_UNIT`/`T_M_TRADER`/`T_M_BUYER_AUTHORITY`
are on PK `ID` — already fast), ORDER BY, the service LINQ (incl. the weapon-type filter on `WeaponCategoryCode`),
or the response contract.

## If a residual timeout remains (reinforcements, in order)
1. Add `/*+ NO_MERGE */` to each inline view (`SELECT /*+ NO_MERGE */ PROVINCE_NAME, …`) to hard-stop view-merging.
2. **Guaranteed fallback (Porter's):** raise the Dapper/Oracle command timeout on the dashboard reads so the
   unbounded query completes even if still not instant. (Config/UoW change — flag to Sober; separate small task.)

## Definition of Done
- [x] Both repo queries wrap `V_PROVINCE` and `VW_PRODUCT` in `GROUP BY`-key inline views; selected aliases
      (`DestRegionName`, `WeaponCategoryCode`) unchanged.
- [x] `dotnet build` succeeds. **Build succeeded. 0 Error(s).**
- [~] (Acceptance, brownfield re-test) no-date `/chart`+`/table` on both dashboards no longer time out; dated call
      returns same rows/values — confirmable only at the stakeholder/Porter re-test.

## Implementation Notes

**Done by Jason 2026-07-20.** SQL-only follow-up to TASK-016 — the residual no-date timeout was the two **view**
joins (`V_PROVINCE` by string `PROVINCE_NAME`, `VW_PRODUCT` by `PRODUCT_CODE`) being view-merged + nested-looped
per outer row over the full 22k set. Wrapped each in a `GROUP BY <join-key>` inline view so Oracle materializes it
once and hash-joins → O(view + rows). Both repo methods, result-identical, **no indexes**.

### 1. `TTLicenseDtlRepository.GetMoveLicenseDashboard`
```sql
LEFT JOIN (
    SELECT PROVINCE_NAME, MAX(AREA_NAME) AS AREA_NAME
      FROM V_PROVINCE
     GROUP BY PROVINCE_NAME
) VP ON VP.PROVINCE_NAME = LM.DEST_PROVINCE_NAME
...
LEFT JOIN (
    SELECT PRODUCT_CODE, MAX(PRODUCT_TYPE_GROUP_CODE) AS PRODUCT_TYPE_GROUP_CODE
      FROM VW_PRODUCT
     GROUP BY PRODUCT_CODE
) VWP ON VWP.PRODUCT_CODE = DTL.PRODUCT_CODE
```
Selected columns unchanged: `VP.AREA_NAME AS DestRegionName`, `VWP.PRODUCT_TYPE_GROUP_CODE AS WeaponCategoryCode`.

### 2. `TTInformMoveDtlRepository.GetMoveA10Dashboard`
Same two replacements (this query has both view joins); same selected aliases.

### Result-identical
- `V_PROVINCE.PROVINCE_NAME` is unique (`province_name_dup=0`) → `MAX(AREA_NAME)` returns that single row's value =
  the old direct join.
- `VW_PRODUCT.PRODUCT_CODE` treated 1:1 (TASK-014); `MAX(PRODUCT_TYPE_GROUP_CODE)` grouped by `PRODUCT_CODE` = the
  current LEFT-JOIN-picks-one behavior. So the weapon-type filter on `WeaponCategoryCode` (TASK-014) is preserved.
- LEFT JOIN preserves unmatched outer rows (NULL) exactly as before.

### Unchanged (per "Must NOT change")
The `IMV`/`RMV` derived joins (TASK-016), the conditional date predicates (no-date ⇒ all rows), `L.FORM_ID=10` /
`LICENSE_STATUS=40`, the PK-`ID` master joins (`T_M_UNIT`/`T_M_TRADER`/`T_M_BUYER_AUTHORITY`), ORDER BY, the service
LINQ, and the response contract.

### Verification (evidence)
- **`dotnet build`** (from `spf/DidSpf.WebApi.Center`, builds the DAL): **Build succeeded. 0 Error(s).**
- **Static grep:** no plain `V_PROVINCE VP ON` / `VW_PRODUCT VWP ON` join left in either query; both now carry the
  `) VP ON …` + `) VWP ON …` inline-view joins.
- **Result-identical by construction** (unique/1:1 keys + MAX dedup + LEFT JOIN). The perf effect (no-date `/chart`+
  `/table` complete; dated unchanged) is the brownfield acceptance at the re-test. If a residual timeout remains,
  the task's reinforcements are ready: (1) `/*+ NO_MERGE */` hints on the inline views; (2) raise the Dapper/Oracle
  command timeout on the dashboard reads (Porter's fallback — a separate config/UoW task; would flag to @Sober).

## Review — Verdict: DONE (code) — Sober (SA), 2026-07-21
Read both repo methods. Correct + result-identical:
- **license** (`TTLicenseDtlRepository` L234-245): `V_PROVINCE`→`(SELECT PROVINCE_NAME, MAX(AREA_NAME) … GROUP BY
  PROVINCE_NAME) VP`; `VW_PRODUCT`→`(SELECT PRODUCT_CODE, MAX(PRODUCT_TYPE_GROUP_CODE) … GROUP BY PRODUCT_CODE) VWP`.
  IMV/RMV (TASK-016), date predicates, `LICENSE_STATUS=40`, ORDER BY, service LINQ all intact.
- **a10** (`TTInformMoveDtlRepository` L67-76): same two wraps; RMV + PK-`ID` master joins (H/TR/U/BA/L FORM_ID/LM) unchanged.
- **Result-identical:** `PROVINCE_NAME` unique (`province_name_dup=0`) → `MAX(AREA_NAME)` = the one value;
  `MAX(PRODUCT_TYPE_GROUP_CODE)` GROUP BY `PRODUCT_CODE` dedups = current pick-one (weapon filter preserved); LEFT
  JOIN keeps unmatched rows NULL. Selected aliases `DestRegionName`/`WeaponCategoryCode` unchanged → mapping intact.
  Build 0 errors.
- **Perf outcome = the hypothesis under test** (couldn't get an EXPLAIN): the `GROUP BY` inline views force
  single-materialize + hash-join instead of per-row nested-loop over the views. Confirmed at the stakeholder re-test
  (no-date `/chart`+`/table` complete; dated unchanged). **If a residual timeout remains**, reinforcements are staged
  in this task: (1) `/*+ NO_MERGE */` on the inline views; (2) raise the Oracle command timeout (Porter's fallback,
  separate config/UoW task — flag me). Code is correct regardless of which of those the runtime ends up needing.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
