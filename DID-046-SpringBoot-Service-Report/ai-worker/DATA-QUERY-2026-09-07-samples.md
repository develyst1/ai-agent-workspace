# Sample-finder queries for the stakeholder (DID-046, 2026-09-07)

Two Oracle 11.2 queries. **All conditions derived from the builders, not guessed** (source cited). No `FETCH FIRST`.
Written for the stakeholder to run; the AI team does not touch the DB. If a query returns nothing for a family, **that is
the answer** — no such request exists yet → record an accepted gap with evidence, do not pad it.

---
## Query 1 — find requests with `เอกสารอื่น ๆ` (item-13/17) content — closes DEF-25 QA
Exercises the **populated** branch of the DEF-25 fix on a14 (type 6) and the a9 family (types 3 = อ.9 transport+destroy,
5 = อ.15). One id per family is enough (a9 transport/a15/destroy share the base element). อ.4 (type 4) already passed on 38427.

**Source:** `A9CheckListReportBuilderBase:225-231` / `A4CheckListReportBuilder:195-201` — other-docs =
`T_T_REQUEST_DOC` rows with `DOCUMENT_ID=0 AND DOCUMENT_TYPE=99 AND REQUEST_CHECKLIST_ID=0`, a real file
(`hasFile` = `ATTACH_FILE_ID IS NOT NULL AND <> 0`, `A14…:391`), active (`STATUS IS NULL OR <> 'D'`), value = `DOCUMENT_NAME`.

```sql
SELECT d.REQUEST_ID,
       t.REQUEST_TYPE,
       d.DOCUMENT_NAME AS OTHER_DOC_TEXT
FROM   T_T_REQUEST_DOC d
JOIN   T_T_REQUEST     t ON t.ID = d.REQUEST_ID
WHERE  t.REQUEST_TYPE IN (6, 3, 5)                 -- 6=อ.14 · 3=อ.9 (transport+destroy) · 5=อ.15
  AND  d.DOCUMENT_ID           = 0
  AND  d.DOCUMENT_TYPE         = 99
  AND  d.REQUEST_CHECKLIST_ID  = 0
  AND  d.ATTACH_FILE_ID IS NOT NULL AND d.ATTACH_FILE_ID <> 0
  AND (d.STATUS IS NULL OR d.STATUS <> 'D')
  AND  TRIM(d.DOCUMENT_NAME) IS NOT NULL
ORDER BY t.REQUEST_TYPE, LENGTH(d.DOCUMENT_NAME) DESC;   -- richest text first
```
**What each column proves:** `REQUEST_ID` = the request to render on /download · `REQUEST_TYPE` = which form family
(6/3/5) · `OTHER_DOC_TEXT` = the `เอกสารอื่น ๆ` value that must land ON the dotted write-in line (not glued to the label).
Pick the top REQUEST_ID per REQUEST_TYPE and render it.

---
## Query 2 — find อ.15 requests with a real tick+value on the two DEF-21 rows
Closes the DEF-21 tick/value branch (Tanya confirmed refrow4/refrow5 render on 9/9 อ.15, but all 9 were unticked/null —
accepted gap unless a ticked-with-file one exists).

**Source:** TICK RULE (SPEC-032, board): `CHECKLIST_CODE → T_S_REQUEST_CHECKLIST.ID → T_T_REQUEST_DOC (REQUEST_CHECKLIST_ID)`;
a15 group = `ReqSaleDom` (`A15ReportBuilder:22`); the two rows = `00014` (ตาม) / `00020` (บัตรผู้รับมอบอำนาจ).

```sql
SELECT d.REQUEST_ID,
       c.CHECKLIST_CODE,
       d.ATTACH_FILE_ID
FROM   T_T_REQUEST_DOC       d
JOIN   T_S_REQUEST_CHECKLIST c ON c.ID = d.REQUEST_CHECKLIST_ID
WHERE  c.CHECKLIST_CODE IN ('ReqSaleDom00014', 'ReqSaleDom00020')
  AND  d.ATTACH_FILE_ID IS NOT NULL AND d.ATTACH_FILE_ID <> 0
  AND (d.STATUS IS NULL OR d.STATUS <> 'D')
ORDER BY d.REQUEST_ID;
```
**What each column proves:** `REQUEST_ID` = an อ.15 request whose row is a real tick (has a file) · `CHECKLIST_CODE` =
which of the two (`00014` ตาม / `00020` บัตรผู้รับมอบ) · `ATTACH_FILE_ID` = the attachment that makes it tick + value.
Any row here = a request that exercises the DEF-21 tick/value branch; none = the accepted gap stands, with evidence.
