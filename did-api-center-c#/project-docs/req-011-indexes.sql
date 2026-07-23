-- REQ-011 — dashboard no-date-range performance indexes (DID_SPF schema)
-- Prepared by Sober (SA) 2026-07-21 from data-req-9-2026-07-20-perf-explain.md.
-- All additive plain b-tree indexes; safe to build online; no behavior/results change.
-- Index names are <=30 chars; rename to your standard if different. Run as the DID_SPF owner.

-- 1. BIGGEST WIN: license MovedQty correlated SUM (×22,126 output rows) + a10 REF_LICENSE_NO join.
--    Covering on QUANTITY => the SUM is answered from the index without touching the table.
CREATE INDEX IX_IMD_REFLIC_PROD_QTY ON T_T_INFORM_MOVE_DTL (REF_LICENSE_NO, PRODUCT_CODE, QUANTITY);

-- 2. a10 backbone: MOVE_DATE range filter + ORDER BY MOVE_DATE DESC.
CREATE INDEX IX_IMD_MOVE_DATE       ON T_T_INFORM_MOVE_DTL (MOVE_DATE);

-- 3. T_T_LICENSE_MOVE join key (LM.LICENSE_ID = L.ID; LM is 1:1 per license). Used by both dashboards.
CREATE INDEX IX_LICMOVE_LICENSE_ID  ON T_T_LICENSE_MOVE (LICENSE_ID);

-- 4. License base filter (LICENSE_STATUS = 40) + ISSUE_DATE range + ORDER BY ISSUE_DATE DESC.
CREATE INDEX IX_LICENSE_STAT_ISSDT  ON T_T_LICENSE (LICENSE_STATUS, ISSUE_DATE);

-- 5. T_T_REQUEST_MOVE correlation column. The dashboard sub-queries correlate on REQUEST_ID
--    (WHERE RM.REQUEST_ID = L.REQUEST_ID), NOT the PK ID -> REQUEST_ID needs its own index.
CREATE INDEX IX_REQMOVE_REQUEST_ID  ON T_T_REQUEST_MOVE (REQUEST_ID);

-- Refresh optimizer stats so the new indexes are used:
BEGIN
  DBMS_STATS.GATHER_TABLE_STATS(USER, 'T_T_INFORM_MOVE_DTL');
  DBMS_STATS.GATHER_TABLE_STATS(USER, 'T_T_LICENSE_MOVE');
  DBMS_STATS.GATHER_TABLE_STATS(USER, 'T_T_LICENSE');
  DBMS_STATS.GATHER_TABLE_STATS(USER, 'T_T_REQUEST_MOVE');
END;
/
