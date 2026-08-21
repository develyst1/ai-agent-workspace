# REQ-025: รายการ (item/annex list) must come from `VW_REQUEST_DTL` — every checklist report

- Status: READY_FOR_SA
- Priority: HIGH
- Requested: 2026-08-18 by human (dev@smartalliance.co.th)
- Deadline: none

## Requirement
> *"แก้ไขให้มาใช้ตรงนี้แทนนะ ในส่วนของ รายการ ใน checklist a6 a9destroy a9 and everything"*

Every checklist report must source its **รายการ (item / annex / product-detail list)** from the
existing database view **`VW_REQUEST_DTL`**, not from a hand-built query over `T_T_REQUEST_DTL`.

**Applies to: อ.6, อ.9 destroy, อ.9 transport, อ.14, and every checklist report built from here on.**

The human supplied the view's full definition (filed below). It is the system's canonical way of
reading request detail rows — same source the rest of the application uses — so our reports stop
diverging from what users see elsewhere.

## What the view gives us that our own query does not
- **`PRODUCT_NAME_DISPLAY_LICENSE`** — the composed, de-duplicated display name
  (`PRODUCT_TYPE_NAME` + `PRODUCT_GROUP_NAME` + `PRODUCT_NAME` + usage type, skipping `'-'` values and
  skipping `PRODUCT_GROUP_NAME` when it repeats `PRODUCT_TYPE_NAME`). **This is the string the annex
  should print** — it is exactly the licence-facing name, already assembled.
- `PRODUCT_NAME_LABEL` — the pipe-joined verbose variant (for UI/search, not the printed form).
- Resolved master lookups we currently don't join: `QUANTITY_UNIT_NAME1` / `QUANTITY_UNIT_NAME2`
  (from `T_M_UNIT`), `USAGE_TYPE_NAME`, `PRODUCT_CATAGORY_NAME`, `PRODUCT_TYPE_GROUP_NAME`,
  `PRODUCT_GROUP_CODE`, `PRODUCT_TYPE_CODE`.
- `ITEM_NO` already `NVL(...,0)` and the canonical ordering
  (`ORDER BY REQUEST_ID ASC, NVL(ITEM_NO,0) ASC`).
- Status filtering and `STATUS_NAME` / `STATUS_COLOR_CODE` resolved.

## Requirement detail
1. Replace the item/annex data source in **all** checklist builders with `VW_REQUEST_DTL`, filtered by
   `REQUEST_ID`, in the view's own order (`ITEM_NO ASC`).
2. Print **`PRODUCT_NAME_DISPLAY_LICENSE`** as the item name unless SA finds a form that demonstrably
   needs a different column — if so, say which and why in the SPEC rather than deciding silently.
3. Use the view's resolved unit names (`QUANTITY_UNIT_NAME1/2`) instead of any unit lookup we do
   ourselves. Drop whatever local join/derivation this replaces.
4. **No behaviour change to anything except the item list.** Page-1 fields, evidence ticks,
   signatures, law refs all stay exactly as they are.
5. Read-only mapping to the view (Spring Data `@Immutable` / view-backed entity or projection —
   SA's call). We do not create, alter, or drop the view.

## Acceptance Criteria
- [ ] อ.6, อ.9 destroy, อ.9 transport and อ.14 all render their รายการ from `VW_REQUEST_DTL`.
- [ ] The printed item name matches `PRODUCT_NAME_DISPLAY_LICENSE` for the same request row-for-row.
- [ ] Item order and item count match the view's output for that `REQUEST_ID`.
- [ ] Units print the resolved unit name, not an id.
- [ ] Everything outside the item list is unchanged — no regression on the delivered อ.6/อ.9 work.
- [ ] No "null" leaks in the new columns (`blankWhenNull` rule still applies).

## Constraints
- Oracle 11.2-safe; `List` + `firstOrNull`, no `FETCH FIRST`.
- Verify on the **real DB seam**, not the mock preview.
- `.jasper` changes → regenerate into `src/main/resources` + `clean compile` + restart.

## ✅ NULL-status question — CLOSED, adopt the view as-is
Human decision 2026-08-18: *"เรื่องแค่นี้ปล่อยตามเขาไปเลย ถ้าผิดก็ให้เขามาแก้วิวกันเอง"*
**Do not count, flag, or work around the NULL-status rows.** Whatever the view returns is what the
รายการ prints; if the filter is wrong, the view's owners fix the view. The section below is kept only
as the record of what was raised and ruled on — it is **not** an action item.

## ~~One thing SA must flag, not silently inherit~~ (superseded — see above)
The view's `WHERE DTL.STATUS != 'D'` **excludes NULL-status rows** (Oracle: `NULL != 'D'` is UNKNOWN)
— the exact trap that caused REQ-015 on the person query, where the human ruled
*"ทุกสถานะ ยกเว้น D ถ้า null ก็เอาขึ้นปกติ"*.

Note that its `INNER JOIN` on `NVL(DTL.STATUS,'C')` clearly *intends* to tolerate NULL, so the
`WHERE` clause looks inconsistent with the view's own design.

**Do not "fix" the view — it is not ours.** Instead: report to Porter how many rows this actually
drops, and I will take the question to the human. If it drops nothing in practice, we adopt the view
as-is and move on.

## Source — view definition as supplied by the human
```sql
SELECT  DTL.ID
       ,NVL(DTL.ITEM_NO,0) AS ITEM_NO
       ,DTL.REQUEST_ID
       ,DTL.PRODUCT_CODE
       ,DTL.PRODUCT_NAME
       ,DTL.PRODUCT_DESCRIPTION
       ,DTL.PRODUCT_TYPE_NAME
       ,DTL.PRODUCT_GROUP_NAME
       ,DTL.TARIFF_CODE
       ,DTL.STATISTICAL_CODE
       ,DTL.QUANTITY
       ,DTL.QUANTITY_UNIT_ID
       ,DTL.QUANTITY2
       ,DTL.QUANTITY_UNIT_ID2
       ,DTL.TRANSPORT_TYPE_CODE
       ,DTL.MOVE_PURPOSE
       ,DTL.BUYER_AUTHORITY_ID
       ,DTL.AUTHORITY_NAME
       ,DTL.AUTHORITY_NAME_ABBR
       ,DTL.PRODUCER_TEXT
       ,DTL.PACKAGING_DETAIL
       ,DTL.IMPORT_TYPE
       ,DTL.IMPORT_BY_BOAT
       ,DTL.IMPORT_BY_PLANE
       ,DTL.IMPORT_BY_CAR
       ,DTL.STORAGE_LOC_NAME
       ,DTL.NOTE1
       ,DTL.USE_MC_PLANT_BLDG_ID
       ,DTL.STORAGE_PLANT_BLDG_ID
       ,DTL.USAGE_TYPE
       ,DTL.STATUS
       ,CDATA.CODE_NAME AS STATUS_NAME
       ,CDATA.COLOR_CODE AS STATUS_COLOR_CODE
       ,DTL.REASON_REJECT
       ,NVL(DTL.REQUEST_ACT_LOG_ID,0) AS REQUEST_ACT_LOG_ID
       ,P.PRODUCT_GROUP_CODE
       ,QU1.UNIT_NAME AS QUANTITY_UNIT_NAME1
       ,QU2.UNIT_NAME AS QUANTITY_UNIT_NAME2
       ,PUT.CODE_NAME AS USAGE_TYPE_NAME
       ,PG.PRODUCT_TYPE_CODE
       ,PT.PRODUCT_CATAGORY
       ,PC.CODE_NAME AS PRODUCT_CATAGORY_NAME
       ,PT.PRODUCT_TYPE_GROUP_CODE
       ,PTG.PRODUCT_TYPE_GROUP_NAME
         ,(NVL(DTL.PRODUCT_CODE,'')
         || ' | '
         || NVL(DTL.PRODUCT_TYPE_NAME,'')
         || ' | '
         || NVL(DTL.PRODUCT_GROUP_NAME,'')
         || ' | '
         || NVL(DTL.PRODUCT_NAME,'')
         || ' | '
         || NVL(PUT.CODE_NAME,'')) AS PRODUCT_NAME_LABEL

        ,TRIM(
            NVL(
                (CASE
                    WHEN DTL.PRODUCT_TYPE_NAME = '-' THEN ''
                    ELSE DTL.PRODUCT_TYPE_NAME
                 END)
            ,'')

            ||

            NVL(
                (CASE
                    WHEN DTL.PRODUCT_GROUP_NAME = '-'
                         OR DTL.PRODUCT_GROUP_NAME = DTL.PRODUCT_TYPE_NAME
                    THEN ''
                    ELSE ' ' || DTL.PRODUCT_GROUP_NAME
                 END)
            ,'')

            ||

            NVL(
                (CASE
                    WHEN DTL.PRODUCT_NAME = '-' THEN ''
                    ELSE ' ' || DTL.PRODUCT_NAME
                 END)
            ,'')

            ||

            NVL(
                (CASE
                    WHEN PUT.CODE_NAME = '-' THEN ''
                    ELSE ' ' || PUT.CODE_NAME
                 END)
            ,'')
        ) AS PRODUCT_NAME_DISPLAY_LICENSE
FROM
  T_T_REQUEST_DTL DTL
LEFT JOIN
  T_M_PRODUCT P ON P.PRODUCT_CODE = DTL.PRODUCT_CODE
LEFT JOIN
  T_M_PRODUCT_GROUP PG ON PG.PRODUCT_GROUP_CODE = P.PRODUCT_GROUP_CODE
LEFT JOIN
  T_M_PRODUCT_TYPE PT ON PT.PRODUCT_TYPE_CODE = PG.PRODUCT_TYPE_CODE
LEFT JOIN
  T_M_PRODUCT_TYPE_GROUP PTG ON PTG.PRODUCT_TYPE_GROUP_CODE = PT.PRODUCT_TYPE_GROUP_CODE
LEFT JOIN
  T_M_UNIT QU1 ON QU1.ID = DTL.QUANTITY_UNIT_ID
LEFT JOIN
  T_M_UNIT QU2 ON QU2.ID = DTL.QUANTITY_UNIT_ID2
LEFT JOIN
  (SELECT CODE_INT , CODE_NAME  FROM T_S_COMMON_CODE WHERE GROUP_CODE = 'ProductUsageType') PUT ON PUT.CODE_INT = P.USAGE_TYPE
LEFT JOIN
  (SELECT CODE_INT , CODE_NAME  FROM T_S_COMMON_CODE WHERE GROUP_CODE = 'ProductCatagory') PC ON PC.CODE_INT = PT.PRODUCT_CATAGORY
INNER JOIN
  (SELECT CODE_STR,CODE_NAME,COLOR_CODE FROM T_S_COMMON_CODE WHERE GROUP_CODE = 'StatusData') CDATA ON CDATA.CODE_STR = NVL(DTL.STATUS,'C')
WHERE DTL.STATUS != 'D'
ORDER BY DTL.REQUEST_ID ASC , NVL(DTL.ITEM_NO,0) ASC
```

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`)
