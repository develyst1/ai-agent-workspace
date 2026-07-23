-- REQ-011 — dashboard queries, CURRENT vs OPTIMIZED (code-only fix; no DB indexes required)
-- For stakeholder review / optional EXPLAIN. Sober (SA) 2026-07-21.
--
-- WHY code-only suffices (no index rights needed):
--   The hang was O(rows^2): the license MovedQty correlated SUM full-scans T_T_INFORM_MOVE_DTL (12,886 rows)
--   ONCE PER OUTPUT ROW (x22,126) ~= 285M row-reads; the 3 T_T_REQUEST_MOVE subqueries add ~63M more.
--   The optimized form pre-aggregates each ONCE (a single GROUP BY pass) and hash-joins it -> O(rows).
--   At this data size (every table <= ~22k rows) the optimized plan is a handful of full-scans + hash joins
--   over small tables = sub-second, WITHOUT any index. Indexes would only shave an already-fast query.
--   Results are byte-identical (cardinality is clean: LM 1:1 per license, V_PROVINCE.PROVINCE_NAME unique;
--   each derived table is grouped by its join key -> many-to-one -> no row multiplication).
--   NOTE: the [ ... ] date lines are appended conditionally by the code; empty date => omitted => returns ALL.

-- =====================================================================================================
-- A) LICENSE-MOVE  (TTLicenseDtlRepository.GetMoveLicenseDashboard)
-- =====================================================================================================

-- ---- CURRENT (4 correlated scalar subqueries per output row) --------------------------------------
--   ,(SELECT NVL(SUM(IMD.QUANTITY),0) FROM T_T_INFORM_MOVE_DTL IMD
--       WHERE IMD.REF_LICENSE_NO = L.LICENSE_NO AND IMD.PRODUCT_CODE = DTL.PRODUCT_CODE)  AS MovedQty
--   ,(SELECT MAX(RM.MOVE_REQUEST_TYPE) FROM T_T_REQUEST_MOVE RM WHERE RM.REQUEST_ID = L.REQUEST_ID) AS MoveTypeCode
--   ,(SELECT MAX(BA.AUTHORITY_GROUP_NO) FROM T_T_REQUEST_MOVE RM
--       JOIN T_M_BUYER_AUTHORITY BA ON BA.ID = RM.BUYER_AUTHORITY_ID
--      WHERE RM.REQUEST_ID = L.REQUEST_ID) AS BuyerGroupNo
--   ,(SELECT MAX(RM.AUTHORITY_NAME) FROM T_T_REQUEST_MOVE RM WHERE RM.REQUEST_ID = L.REQUEST_ID) AS BuyerUnitName
--   ... FROM T_T_LICENSE L INNER JOIN T_T_LICENSE_MOVE LM ... INNER JOIN T_T_LICENSE_DTL DTL ...
--   (full text = the repo method as of 2026-07-21)

-- ---- OPTIMIZED (same result; subqueries -> 2 pre-aggregated LEFT JOINs) ---------------------------
SELECT
       L.ID                        AS LicenseId
      ,L.LICENSE_NO                AS LicenseNo
      ,L.ISSUE_DATE                AS IssueDate
      ,L.EXPIRY_DATE               AS ExpiryDate
      ,L.TRADER_ID                 AS TraderId
      ,L.TRADER_NAME               AS TraderName
      ,RQ.REQUEST_TYPE             AS RequestType
      ,LM.ORIGIN_PLACE_NAME        AS OriginPlaceName
      ,LM.ORIGIN_ADDRESS_NO        AS OriginAddressNo
      ,LM.ORIGIN_BUILDING_NAME     AS OriginBuildingName
      ,LM.ORIGIN_MOO               AS OriginMoo
      ,LM.ORIGIN_SOI               AS OriginSoi
      ,LM.ORIGIN_STREET            AS OriginStreet
      ,LM.ORIGIN_DISTRICT_NAME     AS OriginDistrictName
      ,LM.ORIGIN_SUB_PROVINCE_NAME AS OriginSubProvinceName
      ,LM.ORIGIN_PROVINCE_NAME     AS OriginProvinceName
      ,LM.ORIGIN_POSTCODE          AS OriginPostcode
      ,LM.DEST_PLACE_NAME          AS DestPlaceName
      ,LM.DEST_ADDRESS_NO          AS DestAddressNo
      ,LM.DEST_BUILDING_NAME       AS DestBuildingName
      ,LM.DEST_MOO                 AS DestMoo
      ,LM.DEST_SOI                 AS DestSoi
      ,LM.DEST_STREET              AS DestStreet
      ,LM.DEST_DISTRICT_NAME       AS DestDistrictName
      ,LM.DEST_SUB_PROVINCE_NAME   AS DestSubProvinceName
      ,LM.DEST_PROVINCE_NAME       AS DestProvinceName
      ,LM.DEST_POSTCODE            AS DestPostcode
      ,VP.AREA_NAME                AS DestRegionName
      ,DTL.PRODUCT_CODE            AS ProductCode
      ,DTL.PRODUCT_NAME            AS ProductName
      ,DTL.QUANTITY                AS Quantity
      ,NVL(IMV.MOVED_QTY,0)        AS MovedQty
      ,DTL.QUANTITY_UNIT_ID        AS QuantityUnitId
      ,U.UNIT_NAME                 AS UnitName
      ,RMV.MOVE_TYPE_CODE          AS MoveTypeCode
      ,VWP.PRODUCT_TYPE_GROUP_CODE AS WeaponCategoryCode
      ,RMV.BUYER_GROUP_NO          AS BuyerGroupNo
      ,RMV.BUYER_UNIT_NAME         AS BuyerUnitName
FROM
  T_T_LICENSE L
INNER JOIN T_T_LICENSE_MOVE LM ON LM.LICENSE_ID = L.ID
INNER JOIN T_T_LICENSE_DTL  DTL ON DTL.LICENSE_ID = L.ID
LEFT  JOIN T_M_UNIT   U   ON U.ID  = DTL.QUANTITY_UNIT_ID
LEFT  JOIN V_PROVINCE VP  ON VP.PROVINCE_NAME = LM.DEST_PROVINCE_NAME
LEFT  JOIN T_T_REQUEST RQ ON RQ.ID = L.REQUEST_ID
LEFT  JOIN VW_PRODUCT VWP ON VWP.PRODUCT_CODE = DTL.PRODUCT_CODE
LEFT  JOIN (
    SELECT IMD.REF_LICENSE_NO, IMD.PRODUCT_CODE, SUM(IMD.QUANTITY) AS MOVED_QTY
      FROM T_T_INFORM_MOVE_DTL IMD
     GROUP BY IMD.REF_LICENSE_NO, IMD.PRODUCT_CODE
) IMV ON IMV.REF_LICENSE_NO = L.LICENSE_NO AND IMV.PRODUCT_CODE = DTL.PRODUCT_CODE
LEFT  JOIN (
    SELECT RM.REQUEST_ID,
           MAX(RM.MOVE_REQUEST_TYPE)  AS MOVE_TYPE_CODE,
           MAX(RM.AUTHORITY_NAME)     AS BUYER_UNIT_NAME,
           MAX(BA.AUTHORITY_GROUP_NO) AS BUYER_GROUP_NO
      FROM T_T_REQUEST_MOVE RM
      LEFT JOIN T_M_BUYER_AUTHORITY BA ON BA.ID = RM.BUYER_AUTHORITY_ID
     GROUP BY RM.REQUEST_ID
) RMV ON RMV.REQUEST_ID = L.REQUEST_ID
WHERE L.LICENSE_STATUS = 40
--  AND L.ISSUE_DATE >= TO_DATE(:DATE_START,'YYYY-MM-DD')        -- appended only when a date range is given
--  AND L.ISSUE_DATE <  TO_DATE(:DATE_END,'YYYY-MM-DD') + 1
ORDER BY L.ISSUE_DATE DESC, L.ID DESC, DTL.ITEM_NO ASC;

-- =====================================================================================================
-- B) MOVE-A10  (TTInformMoveDtlRepository.GetMoveA10Dashboard)
-- =====================================================================================================

-- ---- CURRENT: one correlated subquery per row ----------------------------------------------------
--   ,(SELECT MAX(RM.MOVE_REQUEST_TYPE) FROM T_T_REQUEST_MOVE RM WHERE RM.REQUEST_ID = L.REQUEST_ID) AS MoveTypeCode

-- ---- OPTIMIZED: subquery -> RMV LEFT JOIN ---------------------------------------------------------
SELECT
       DTL.REF_LICENSE_NO           AS LicenseNo
      ,L.ISSUE_DATE                 AS IssueDate
      ,L.EXPIRY_DATE                AS ExpiryDate
      ,H.INFORM_REQUEST_TYPE        AS MoveRequestType
      ,H.TRADER_ID                  AS TraderId
      ,TR.TRADER_NAME               AS TraderName
      ,DTL.PRODUCT_CODE             AS ProductCode
      ,DTL.PRODUCT_NAME             AS ProductName
      ,DTL.ALLOWED_QUANTITY         AS Quantity
      ,DTL.QUANTITY                 AS MovedQty
      ,DTL.QUANTITY_UNIT_ID         AS QuantityUnitId
      ,U.UNIT_NAME                  AS UnitName
      ,VWP.PRODUCT_TYPE_GROUP_CODE  AS WeaponCategoryCode
      ,DTL.MOVE_DATE                AS MoveDate
      ,DTL.MOVE_SEQ                 AS MoveSeq
      ,BA.AUTHORITY_GROUP_NO        AS BuyerGroupNo
      ,DTL.BUYER_NAME               AS BuyerUnitName
      ,LM.DEST_PROVINCE_NAME        AS DestProvinceName
      ,VP.AREA_NAME                 AS DestRegionName
      ,RMV.MOVE_TYPE_CODE           AS MoveTypeCode
FROM
  T_T_INFORM_MOVE_DTL DTL
INNER JOIN T_T_INFORM_MOVE H ON H.ID = DTL.INFORM_MOVE_ID
LEFT  JOIN T_M_TRADER TR ON TR.ID = H.TRADER_ID
LEFT  JOIN T_M_UNIT   U  ON U.ID  = DTL.QUANTITY_UNIT_ID
LEFT  JOIN T_M_BUYER_AUTHORITY BA ON BA.ID = DTL.BUYER_AUTHORITY_ID
INNER JOIN T_T_LICENSE L ON L.LICENSE_NO = DTL.REF_LICENSE_NO AND L.FORM_ID = 10
LEFT  JOIN T_T_LICENSE_MOVE LM ON LM.LICENSE_ID = L.ID
LEFT  JOIN V_PROVINCE VP ON VP.PROVINCE_NAME = LM.DEST_PROVINCE_NAME
LEFT  JOIN VW_PRODUCT VWP ON VWP.PRODUCT_CODE = DTL.PRODUCT_CODE
LEFT  JOIN (
    SELECT RM.REQUEST_ID, MAX(RM.MOVE_REQUEST_TYPE) AS MOVE_TYPE_CODE
      FROM T_T_REQUEST_MOVE RM
     GROUP BY RM.REQUEST_ID
) RMV ON RMV.REQUEST_ID = L.REQUEST_ID
WHERE 1 = 1
--  AND DTL.MOVE_DATE >= TO_DATE(:MOVE_DATE_START,'YYYY-MM-DD')  -- appended only when a date range is given
--  AND DTL.MOVE_DATE <  TO_DATE(:MOVE_DATE_END,'YYYY-MM-DD') + 1
ORDER BY DTL.MOVE_DATE DESC, DTL.INFORM_MOVE_ID DESC, DTL.ITEM_NO ASC;
