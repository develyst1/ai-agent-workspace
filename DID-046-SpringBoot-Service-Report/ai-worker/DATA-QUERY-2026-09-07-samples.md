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

---
## Query 3 (added 2026-09-08) — people the OLD code would have DROPPED (DEF-26 proof + QA sample)
Answers both: **did the exact-match bug bite real data?** and **which request should QA render** to see a previously-dropped
person now appear in item 3.

**Source:** `T_T_REQUEST_PER.PER_TYPE, .STATUS, .PERSON_NAME_*` (RequestPerEntity). The pre-fix code matched PER_TYPE
**exactly** =1 (item 3) / =2 (item 4), so any active person with PER_TYPE ∉ {1,2} or NULL appeared in neither. Form family
from `T_T_REQUEST.REQUEST_TYPE` per `RequestTypeResolverService:41-51`: **3=อ.9 · 4=อ.4 · 5=อ.15 · 6=อ.14 · 8=อ.6** (the five
forms whose builders got the DEF-26 partition; a9 type 3 = transport+destroy).

> ⚠️ **The NULL trap Porter flagged:** `PER_TYPE NOT IN (1,2)` **excludes NULL** in Oracle, so it would miss the very rows
> we hunt. It **must** be `(PER_TYPE IS NULL OR PER_TYPE NOT IN (1,2))`.

```sql
SELECT p.REQUEST_ID,
       t.REQUEST_TYPE,
       p.PER_TYPE,
       TRIM(p.PERSON_NAME_PREFIX || ' ' || p.PERSON_NAME || ' ' || p.PERSON_SURNAME) AS PERSON_NAME
FROM   T_T_REQUEST_PER p
JOIN   T_T_REQUEST     t ON t.ID = p.REQUEST_ID
WHERE (p.STATUS IS NULL OR p.STATUS <> 'D')
  AND (p.PER_TYPE IS NULL OR p.PER_TYPE NOT IN (1,2))
ORDER BY t.REQUEST_TYPE, p.REQUEST_ID;
```
**What each column proves:** `REQUEST_ID` = a request whose form was silently missing this person before the fix (a QA
render candidate) · `REQUEST_TYPE` = which form (3/4/5/6/8 = fixed forms; anything else = a form not in DEF-26 scope) ·
`PER_TYPE` = the value that fell outside {1,2} or NULL → why it was dropped, and what now lands in item 3 · `PERSON_NAME`
= the person who was missing.

### Count per form family (the "did it bite" headline)
```sql
SELECT t.REQUEST_TYPE, COUNT(*) AS dropped_person_count
FROM   T_T_REQUEST_PER p JOIN T_T_REQUEST t ON t.ID = p.REQUEST_ID
WHERE (p.STATUS IS NULL OR p.STATUS <> 'D')
  AND (p.PER_TYPE IS NULL OR p.PER_TYPE NOT IN (1,2))
GROUP BY t.REQUEST_TYPE ORDER BY t.REQUEST_TYPE;
```
**Reading the result — state it plainly, don't let silence imply damage:**
- **0 rows** ⇒ the fix is still correct, but **no real person was ever lost** — no issued form was affected. Say exactly that.
- **rows returned** ⇒ each is a person who was silently absent from a rendered form. Pick one with `REQUEST_TYPE ∈ {3,4,5,6,8}`
  → QA renders it → that person now shows under item 3 (was in neither before).
