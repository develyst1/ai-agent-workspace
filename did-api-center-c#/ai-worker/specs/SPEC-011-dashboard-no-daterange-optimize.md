# SPEC-011: Dashboards — no-date-range search returns all without hanging (optimize)

- Source: REQ-011 (HIGH)
- Status: ACTIVE
- Diagnosis data: project-docs/data-req-9-2026-07-20-perf-explain.md (stakeholder-run)

## Diagnosis (settled)

**(a) Genuine full-scan, NOT a null/empty-date bug.** Both repos concatenate the date filter conditionally, so
no-date already returns *all rows correctly* — it's just unbounded. **Cardinality CLEAN** (`lm_dup_license=0`,
`province_name_dup=0`) → no row-multiplication, past aggregates are correct → **pure performance**, no de-dup
needed. Dataset is small (license status-40 = 3,613; `T_T_LICENSE_DTL` = 22,126; `T_T_INFORM_MOVE_DTL` = 12,886;
`T_T_REQUEST_MOVE` = 2,838) → the hang is **missing indexes**, not data volume. Primary culprit: the license
`MovedQty` correlated SUM full-scans all 12,886 `T_T_INFORM_MOVE_DTL` rows **per output row (×22,126)** because
that table has only its PK.

**Correlation column confirmed (Porter's open Q):** the `T_T_REQUEST_MOVE` sub-queries correlate on
**`RM.REQUEST_ID = L.REQUEST_ID`** — i.e. `T_T_REQUEST_MOVE.REQUEST_ID`, a **non-PK** column → it needs its own index.

Two independent, compounding fixes. **No response-shape / results change** in either (deterministic).

> **UPDATE 2026-07-21 — stakeholder has NO DB-index rights → this is a CODE-ONLY fix. Part B (TASK-016) is the
> whole solution; Part A is deferred/optional (hand to a DBA if/when available).**
>
> **Confirmed code-only suffices** at this data size: the hang was **O(rows²)** — the `MovedQty` correlated SUM
> scanned all 12,886 `T_T_INFORM_MOVE_DTL` rows **per output row (×22,126)** ≈ 285M reads; the 3 `REQUEST_MOVE`
> subqueries ≈ 63M more. Part B pre-aggregates each **once** (a single GROUP BY pass) + one hash join → **O(rows)**.
> Every table is ≤ ~22k rows, so the optimized plan is a few full-scans + hash joins over small tables =
> **sub-second without any index**. Indexes would only shave an already-fast query — they were never the
> requirement; the correlated subqueries were the entire problem. Current-vs-optimized SQL for stakeholder review /
> optional EXPLAIN: `project-docs/req-011-sql-current-vs-optimized.sql`.

---

## Part A — DB-side: CREATE INDEX DDL — DEFERRED (no DB rights; optional future speedup, NOT required)

Deliverable: project-docs/req-011-indexes.sql (below). Names ≤30 chars (adjust to your standard); all are plain
b-tree, online-buildable, additive (no risk to existing behavior).

```sql
-- 1. BIGGEST WIN — license MovedQty correlated SUM + a10 REF_LICENSE_NO join.
--    Covering on QUANTITY lets the SUM be answered from the index (no table access). ×22,126 → index range scan.
CREATE INDEX IX_IMD_REFLIC_PROD_QTY ON T_T_INFORM_MOVE_DTL (REF_LICENSE_NO, PRODUCT_CODE, QUANTITY);

-- 2. a10 backbone date filter + ORDER BY MOVE_DATE.
CREATE INDEX IX_IMD_MOVE_DATE       ON T_T_INFORM_MOVE_DTL (MOVE_DATE);

-- 3. LM join key (both dashboards; LM is 1:1 per license).
CREATE INDEX IX_LICMOVE_LICENSE_ID  ON T_T_LICENSE_MOVE (LICENSE_ID);

-- 4. license base filter (LICENSE_STATUS=40) + ISSUE_DATE range + ORDER BY ISSUE_DATE.
CREATE INDEX IX_LICENSE_STAT_ISSDT  ON T_T_LICENSE (LICENSE_STATUS, ISSUE_DATE);

-- 5. REQUEST_MOVE correlation column — the 3 license + 1 a10 sub-queries correlate on REQUEST_ID (NOT the PK ID).
CREATE INDEX IX_REQMOVE_REQUEST_ID  ON T_T_REQUEST_MOVE (REQUEST_ID);
```
After creating: `EXEC DBMS_STATS.GATHER_TABLE_STATS(USER, '<TABLE>');` on the 5 tables so the optimizer uses them.
Existing indexes already cover `T_T_LICENSE_DTL(LICENSE_ID,ITEM_NO)/(PRODUCT_CODE)` and `T_T_LICENSE(LICENSE_NO)`
— no new index needed there.

## Part B — Code-side: collapse correlated sub-queries → pre-aggregated LEFT JOINs (Jason; TASK-016)

Result-identical (each is a MAX/SUM over the same rows per key; derived tables are grouped by their join key so
they're many-to-one → no row multiplication). Compounds with the indexes and helps even before they land.

### B1 — `TTLicenseDtlRepository.GetMoveLicenseDashboard` (license-move)
Replace the **four** correlated scalar sub-queries with two derived-table LEFT JOINs:
- `MovedQty` → join to a `GROUP BY REF_LICENSE_NO, PRODUCT_CODE` SUM:
  ```sql
  LEFT JOIN (
      SELECT IMD.REF_LICENSE_NO, IMD.PRODUCT_CODE, SUM(IMD.QUANTITY) AS MOVED_QTY
        FROM T_T_INFORM_MOVE_DTL IMD
       GROUP BY IMD.REF_LICENSE_NO, IMD.PRODUCT_CODE
  ) IMV ON IMV.REF_LICENSE_NO = L.LICENSE_NO AND IMV.PRODUCT_CODE = DTL.PRODUCT_CODE
  ```
  select `NVL(IMV.MOVED_QTY,0) AS MovedQty` (LEFT JOIN no-match → NULL → NVL→0, identical to old `NVL(SUM,0)`).
- `MoveTypeCode` + `BuyerUnitName` + `BuyerGroupNo` → one `GROUP BY REQUEST_ID` derived table:
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
  select `RMV.MOVE_TYPE_CODE AS MoveTypeCode`, `RMV.BUYER_UNIT_NAME AS BuyerUnitName`, `RMV.BUYER_GROUP_NO AS BuyerGroupNo`.

### B2 — `TTInformMoveDtlRepository.GetMoveA10Dashboard` (a10)
Replace the single `MoveTypeCode` correlated sub-query with:
```sql
LEFT JOIN (
    SELECT RM.REQUEST_ID, MAX(RM.MOVE_REQUEST_TYPE) AS MOVE_TYPE_CODE
      FROM T_T_REQUEST_MOVE RM
     GROUP BY RM.REQUEST_ID
) RMV ON RMV.REQUEST_ID = L.REQUEST_ID
```
select `RMV.MOVE_TYPE_CODE AS MoveTypeCode`.

**Do NOT touch:** the conditional date predicates (keep as-is — no-date must still return all), the `WeaponCategoryCode`
VW_PRODUCT join (TASK-014), any other join/filter/response field, the service LINQ, or the response contract.

## Acceptance
- [ ] `/chart` + `/table` (a10 + license) with **no date range** complete without hanging (stakeholder verifies live).
- [ ] Results with a date range are **unchanged** (same rows/values); `dotnet build` succeeds; other dashboards untouched.
- [ ] DDL applied by DBA + stats gathered; code rewrite merged. (The two are independent; either alone helps, both = target.)

## Open (non-blocking)
- **Q3 (stakeholder):** `/table` unbounded hard cap (top-N recent) acceptable, or must it return every row? Not
  required for the index/rewrite fix; if yes, a small `FETCH FIRST :N ROWS ONLY` on the `/table` path only (charts
  keep all). Spec a follow-up task if/when answered.
- **EXPLAIN:** optional confirmation; the missing-index root cause is already established from the index gaps + row counts.

## Part C — REWORK (2026-07-21): materialize the VIEW joins (TASK-017)

Re-test after TASK-016: **dated works everywhere; no-date TIMES OUT on ALL endpoints (incl. tiny-output `/chart`)** →
query-level slowness, not volume. Root cause of the residual: the `VW_PRODUCT` (by `PRODUCT_CODE`) and `V_PROVINCE`
(by `PROVINCE_NAME` string) **view joins** run as **nested loops re-evaluated per row** over the full 22k set
(no index rights → optimizer merges the views). Fix = the TASK-016 trick on the view joins: wrap each in a
`GROUP BY <join key>` inline view → materialized once + hash-joined → O(view+rows). Code-only, result-identical
(`province_name_dup=0`; `PRODUCT_CODE` 1:1 per TASK-014, `MAX()` dedups). Details in TASK-017. Reinforcements if
residual: `/*+ NO_MERGE */`, then the command-timeout raise (guaranteed fallback).

## Tasks
- TASK-016: code-side sub-query→LEFT JOIN rewrite (B1 + B2) — Jason. **DONE** (dated confirmed correct).
- TASK-017: materialize the `VW_PRODUCT` / `V_PROVINCE` view joins (Part C) — Jason. **The remaining fix for the timeout.**
- (DB) Part A DDL → DEFERRED (no index rights).

## Questions
(Jason asks here; Sober answers as `> answer: ...`)
