# REQ-011 perf data (stakeholder ran, 2026-07-20) — row counts, indexes, cardinality

## 1. Row counts (dataset is SMALL — perf issue is index-driven, not volume)
- `T_T_LICENSE` (status 40): **3,613**
- `T_T_LICENSE_DTL`: **22,126** (≈ output-row grain for license-move)
- `T_T_INFORM_MOVE_DTL`: **12,886**
- `T_T_REQUEST_MOVE`: **2,838**

## 3. Cardinality — ✅ CLEAN, no latent dup/correctness bug
- `lm_dup_license` = **0** → `T_T_LICENSE_MOVE` is 1:1 per `LICENSE_ID` (LM join doesn't multiply rows).
- `province_name_dup` = **0** → `V_PROVINCE.PROVINCE_NAME` is unique (province name-join doesn't multiply).
- ⇒ **aggregates are correct** (past chart numbers not inflated). Pure performance problem.

## 2. Existing indexes (the gaps = the cause)
- `T_T_INFORM_MOVE_DTL`: **only `ID` (PK).** ❌ nothing on `REF_LICENSE_NO`, `PRODUCT_CODE`, `MOVE_DATE`.
  → the `MovedQty` correlated SUM full-scans 12,886 rows **per output row (×22,126)** = the primary hang.
- `T_T_LICENSE_MOVE`: **only `ID` (PK).** ❌ nothing on `LICENSE_ID` (the LM join key) → LM join = full scan.
- `T_T_LICENSE`: `ID`(PK), `LICENSE_NO`, `LICENSE_REQ_ID`, `(TRADER_ID, REFERENCE_NO)`. ❌ nothing on
  `LICENSE_STATUS` or `ISSUE_DATE` (base filter + sort).
- `T_T_LICENSE_DTL`: `(LICENSE_ID, ITEM_NO)` ✓, `PRODUCT_CODE` ✓, `ID`. — OK.
- `T_T_REQUEST_MOVE`: **only `ID` (PK).** (join is on `ID` = `L.REQUEST_ID`? SA confirm the exact correlation
  column; if it correlates on a non-`ID` column, that needs an index too.)

## @Sober — produce the exact `CREATE INDEX` DDL for the stakeholder/DBA
Candidate set from the above (SA to finalize + order columns per the queries):
- `T_T_INFORM_MOVE_DTL (REF_LICENSE_NO, PRODUCT_CODE)` — **biggest win (MovedQty)**; + `(MOVE_DATE)` for a10.
- `T_T_LICENSE_MOVE (LICENSE_ID)`.
- `T_T_LICENSE (LICENSE_STATUS, ISSUE_DATE)`.
- confirm `T_T_REQUEST_MOVE` correlation column (index if not `ID`).
Code-side rewrite (subquery→pre-aggregated LEFT JOIN) still proceeds in parallel — it compounds the win and
helps even before indexes land.

## Still open
- Q3 (stakeholder): `/table` unbounded hard cap (top-N) acceptable? — not yet answered; not blocking indexes.
- EXPLAIN plan: SA to supply the generated SQL text for the stakeholder to run (or capture from logs).
