# TASK-016: Collapse dashboard correlated sub-queries → pre-aggregated LEFT JOINs (a10 + license-move)

- Source: SPEC-011 (REQ-011)
- Status: DONE
- Assignee: Jason (BE)
- Depends on: none (independent of the DB-side index DDL; both compound)

## Goal

Remove the per-output-row correlated scalar sub-queries from the two dashboard queries by pre-aggregating them
once into derived-table LEFT JOINs. **Result-identical** (cardinality is clean — `lm_dup=0`, `province_dup=0`;
each derived table is grouped by its join key → many-to-one, no row multiplication). Cuts the license query from
**4 correlated sub-queries × 22,126 rows** to two hash joins. No response-shape or results change.

## Changes — SQL only, in the two repo methods

### 1. `TTLicenseDtlRepository.GetMoveLicenseDashboard` (DataAccess.SPF/Repositories)
Replace the 4 correlated scalar sub-queries (`MovedQty`, `MoveTypeCode`, `BuyerGroupNo`, `BuyerUnitName`) with
two derived-table LEFT JOINs and select from them:

- **MovedQty** — add join:
  ```sql
  LEFT JOIN (
      SELECT IMD.REF_LICENSE_NO, IMD.PRODUCT_CODE, SUM(IMD.QUANTITY) AS MOVED_QTY
        FROM T_T_INFORM_MOVE_DTL IMD
       GROUP BY IMD.REF_LICENSE_NO, IMD.PRODUCT_CODE
  ) IMV ON IMV.REF_LICENSE_NO = L.LICENSE_NO AND IMV.PRODUCT_CODE = DTL.PRODUCT_CODE
  ```
  select `,NVL(IMV.MOVED_QTY,0) AS MovedQty`  (replaces the `(SELECT NVL(SUM(IMD.QUANTITY),0) …)` scalar).

- **MoveTypeCode + BuyerUnitName + BuyerGroupNo** — add one join:
  ```sql
  LEFT JOIN (
      SELECT RM.REQUEST_ID,
             MAX(RM.MOVE_REQUEST_TYPE)  AS MOVE_TYPE_CODE,
             MAX(RM.AUTHORITY_NAME)     AS BUYER_UNIT_NAME,
             MAX(BA.AUTHORITY_GROUP_NO) AS BUYER_GROUP_NO
        FROM T_T_REQUEST_MOVE RM
        LEFT JOIN T_M_BUYER_AUTHORITY BA ON BA.ID = RM.BUYER_AUTHORITY_ID
       GROUP BY RM.REQUEST_ID
  ) RMV ON RMV.REQUEST_ID = L.REQUEST_ID
  ```
  select `,RMV.MOVE_TYPE_CODE AS MoveTypeCode`, `,RMV.BUYER_UNIT_NAME AS BuyerUnitName`,
  `,RMV.BUYER_GROUP_NO AS BuyerGroupNo` (replace the three scalar sub-queries).

### 2. `TTInformMoveDtlRepository.GetMoveA10Dashboard`
Replace the single `MoveTypeCode` correlated sub-query with:
```sql
LEFT JOIN (
    SELECT RM.REQUEST_ID, MAX(RM.MOVE_REQUEST_TYPE) AS MOVE_TYPE_CODE
      FROM T_T_REQUEST_MOVE RM
     GROUP BY RM.REQUEST_ID
) RMV ON RMV.REQUEST_ID = L.REQUEST_ID
```
select `,RMV.MOVE_TYPE_CODE AS MoveTypeCode`.

## Must NOT change
- The **conditional date predicates** (empty date must still omit the bound → no-date returns ALL rows).
- The `WeaponCategoryCode` VW_PRODUCT join (TASK-014), the `V_PROVINCE`/`T_M_UNIT`/`VW_PRODUCT` joins, the
  `L.FORM_ID=10` / `LICENSE_STATUS=40` filters, ORDER BY, the service LINQ, and the response contract.

## Definition of Done
- [x] License query: the 4 correlated scalar sub-queries are gone, replaced by the two derived-table LEFT JOINs;
      selected as `MovedQty` / `MoveTypeCode` / `BuyerUnitName` / `BuyerGroupNo` (same aliases).
- [x] a10 query: `MoveTypeCode` sub-query replaced by the `RMV` LEFT JOIN.
- [x] `dotnet build` succeeds. **Build succeeded. 0 Error(s).** With-date-range spot-check = brownfield re-test.

## Implementation Notes

**Done by Jason 2026-07-20.** SQL-only, two repo methods; response contract, service LINQ, filters, ORDER BY all
unchanged. Each correlated scalar sub-query is now pre-aggregated once into a derived-table LEFT JOIN grouped by
its exact correlation key → **many-to-one, result-identical** (the task confirmed `lm_dup=0`/`province_dup=0`,
i.e. the existing join fan-out is clean, so adding these grouped joins can't multiply rows).

### 1. `TTLicenseDtlRepository.GetMoveLicenseDashboard` — 4 scalars → 2 derived joins
Selects now: `,NVL(IMV.MOVED_QTY,0) AS MovedQty`, `,RMV.MOVE_TYPE_CODE AS MoveTypeCode`,
`,RMV.BUYER_GROUP_NO AS BuyerGroupNo`, `,RMV.BUYER_UNIT_NAME AS BuyerUnitName`. Added after the existing joins:
```sql
LEFT JOIN (
    SELECT IMD.REF_LICENSE_NO, IMD.PRODUCT_CODE, SUM(IMD.QUANTITY) AS MOVED_QTY
      FROM T_T_INFORM_MOVE_DTL IMD
     GROUP BY IMD.REF_LICENSE_NO, IMD.PRODUCT_CODE
) IMV ON IMV.REF_LICENSE_NO = L.LICENSE_NO AND IMV.PRODUCT_CODE = DTL.PRODUCT_CODE
LEFT JOIN (
    SELECT RM.REQUEST_ID,
           MAX(RM.MOVE_REQUEST_TYPE)  AS MOVE_TYPE_CODE,
           MAX(RM.AUTHORITY_NAME)     AS BUYER_UNIT_NAME,
           MAX(BA.AUTHORITY_GROUP_NO) AS BUYER_GROUP_NO
      FROM T_T_REQUEST_MOVE RM
      LEFT JOIN T_M_BUYER_AUTHORITY BA ON BA.ID = RM.BUYER_AUTHORITY_ID
     GROUP BY RM.REQUEST_ID
) RMV ON RMV.REQUEST_ID = L.REQUEST_ID
```

### 2. `TTInformMoveDtlRepository.GetMoveA10Dashboard` — 1 scalar → 1 derived join
Select now `,RMV.MOVE_TYPE_CODE AS MoveTypeCode`. Added:
```sql
LEFT JOIN (
    SELECT RM.REQUEST_ID, MAX(RM.MOVE_REQUEST_TYPE) AS MOVE_TYPE_CODE
      FROM T_T_REQUEST_MOVE RM
     GROUP BY RM.REQUEST_ID
) RMV ON RMV.REQUEST_ID = L.REQUEST_ID
```

### Result-identical mapping (old scalar ⇒ new join column)
- `NVL(SUM(IMD.QUANTITY),0) WHERE REF_LICENSE_NO=L.LICENSE_NO AND PRODUCT_CODE=DTL.PRODUCT_CODE` ⇒
  `NVL(IMV.MOVED_QTY,0)` (IMV grouped on the same 2 keys; no match ⇒ NULL ⇒ NVL 0 — same as before).
- `MAX(RM.MOVE_REQUEST_TYPE) WHERE REQUEST_ID=L.REQUEST_ID` ⇒ `RMV.MOVE_TYPE_CODE` (RMV grouped on REQUEST_ID).
- `MAX(BA.AUTHORITY_GROUP_NO) … JOIN T_M_BUYER_AUTHORITY …` ⇒ `RMV.BUYER_GROUP_NO` (same inner LEFT JOIN inside RMV).
- `MAX(RM.AUTHORITY_NAME)` ⇒ `RMV.BUYER_UNIT_NAME`. No-match rows ⇒ NULL either way (LEFT JOIN preserves the row).

### Unchanged (per "Must NOT change")
Conditional date predicates (empty ⇒ no bound ⇒ all rows), the `VW_PRODUCT`/`V_PROVINCE`/`T_M_UNIT` joins,
`L.FORM_ID=10` / `LICENSE_STATUS=40`, ORDER BY, the service LINQ, response contract.

### Verification (evidence)
- **`dotnet build`** (from `spf/DidSpf.WebApi.Center`, builds the DAL too): **Build succeeded. 0 Error(s).**
- **Static grep:** **zero** correlated `WHERE …=L.…)` scalar sub-queries left in either dashboard query; the
  `IMV`/`RMV` derived-table joins are present (license: IMV + RMV; a10: RMV).
- **Result-identical by construction** (grouping keys = the old correlation keys; MAX/SUM aggregates preserved;
  LEFT JOIN keeps unmatched rows as NULL like the scalars did). A with-date-range spot-check to confirm
  same rows/values (esp. `moved_qty`, buyer group/name, move type) needs a running Center + Oracle → brownfield,
  at the stakeholder/Porter re-test. Perf effect (no-date search no longer hangs) is the acceptance target.

## Review — Verdict: DONE — Sober (SA), 2026-07-21
Read both repo methods (not the notes). Correct + **result-identical by construction**:
- **license `GetMoveLicenseDashboard`** (L219-253): the 4 correlated scalars are gone → `IMV` (`SUM(QUANTITY)`
  GROUP BY `REF_LICENSE_NO,PRODUCT_CODE`; selected `NVL(IMV.MOVED_QTY,0) AS MovedQty`) + `RMV` (`MAX`es GROUP BY
  `REQUEST_ID`; `MoveTypeCode`/`BuyerUnitName`/`BuyerGroupNo`). Same aliases → maps to the existing QueryResult.
- **a10 `GetMoveA10Dashboard`** (L72-75): single `MoveTypeCode` scalar → `RMV` (`MAX(MOVE_REQUEST_TYPE)` GROUP BY
  `REQUEST_ID`).
- **Result-identity checks:** (1) `NVL(IMV.MOVED_QTY,0)` = old `NVL(SUM,0)` — LEFT-join no-match → NULL → 0.
  (2) `RMV` grouped on the exact old correlation key `REQUEST_ID` → same MAX per request. (3) The old `BuyerGroupNo`
  used an **INNER** `JOIN BA`; `RMV` uses **LEFT JOIN BA** — MAX-safe (MAX ignores the NULLs from unmatched BA; `BA.ID`
  is PK so no fan-out) and it does **not** change the `MAX(MOVE_REQUEST_TYPE)`/`MAX(AUTHORITY_NAME)` row set. (4) Both
  derived tables are grouped by their join key → many-to-one → **no row multiplication** (consistent with the clean
  `lm_dup=0`/`province_dup=0` cardinality).
- **Untouched (verified):** conditional date predicates (empty ⇒ omit bound ⇒ all rows), VW_PRODUCT weapon join
  (TASK-014), V_PROVINCE/T_M_UNIT/RQ/LM joins, `LICENSE_STATUS=40`/`FORM_ID=10`, ORDER BY, service LINQ, response
  contract. Build 0 errors.
- **Acceptance (data-dependent, brownfield):** stakeholder re-test — (a) no-date `/chart`+`/table` now complete
  without hanging; (b) a dated request returns the same rows/values as before (esp. `moved_qty`, buyer group/name,
  `move_type`). Correct by construction; the perf win + result-identity are confirmable at that re-test.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
