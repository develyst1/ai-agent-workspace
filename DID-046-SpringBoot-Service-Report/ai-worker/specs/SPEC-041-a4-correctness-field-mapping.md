# SPEC-041: อ.4 (A4) — correctness / field-mapping reference (REQ-036)

- Source: REQ-036. Model: SPEC-008 (อ.6 equivalent).
- **How sections were enumerated:** by walking `A4CheckListReportBuilder.buildFromDb` (line 64) and every
  sub-builder it calls, in execution order — NOT by reading a render (a render only shows what one request
  happened to populate; that is exactly how a missing row hides — DEF-21). Every row cites `File.java:line`.
- Default sample `:req = 38427` (accepted a4 sample). **Oracle 11.2** — no `FETCH FIRST`; docs/persons filtered
  `(STATUS IS NULL OR STATUS <> 'D')`. **SA/BE never run these — the stakeholder does.**
- File shorthand: `A4 = A4CheckListReportBuilder.java`.
- **TICK RULE (SPEC-032, all ✓ boxes):** a box is ticked ⟺ a `T_T_REQUEST_DOC` row is linked (by
  `REQUEST_CHECKLIST_ID`) to the master row whose `CHECKLIST_CODE = 'ReqImport'+suffix`, with
  `ATTACH_FILE_ID` not null and `<> 0`, and `(STATUS IS NULL OR STATUS <> 'D')`. Bind by CODE, never by position.
  (`A4:120-129`, `ChecklistCodeBinder`, `hasFile` `A4:346`.)

---
## PAGE 1 — header (`Applicant`, A4:71-76)

| Section | Rule | Source | Code | Verify SQL (`:req`=38427) | Status |
|---|---|---|---|---|---|
| **1. ชื่อผู้ขออนุญาต** | verbatim, blank if null | `T_T_REQUEST.TRADER_NAME` | A4:72 | `SELECT TRADER_NAME FROM T_T_REQUEST WHERE ID=:req;` | VERIFIED on 38427 |
| **2. ประเภทการขออนุญาต** | **fixed constant**, not from DB | const `"สั่งหรือนำเข้ามาในราชอาณาจักร"` | A4:41,73 | *(none — literal)* | VERIFIED (literal) |
| **3. วัตถุ/อาวุธที่ขออนุญาต ตามผนวกบัญชีรายการที่แนบ** | **fixed label**, points to the annex; no data field | — | *(not built; static jrxml label)* | *(none)* | VERIFIED (static) |
| **4. จำนวนที่ขออนุญาต** | count of รายการ rows | `COUNT(VW_REQUEST_DTL)` by REQUEST_ID | A4:74 | `SELECT COUNT(*) FROM VW_REQUEST_DTL WHERE REQUEST_ID=:req;` | VERIFIED on 38427 |
| **5. วัตถุประสงค์ที่ขออนุญาต** | verbatim, blank if null | `T_T_REQUEST.OBJECTIVE` | A4:75 | `SELECT OBJECTIVE FROM T_T_REQUEST WHERE ID=:req;` | VERIFIED on 38427 |
| **6. ระยะเวลาการอนุญาต** | `PERIOD_TEXT` verbatim of the LATEST license (max ID); blank if no license (REQ-023) | `T_T_LICENSE.PERIOD_TEXT` | A4:83-84 | `SELECT ID, PERIOD_TEXT FROM T_T_LICENSE WHERE REQUEST_ID=:req ORDER BY ID DESC;` → top row | VERIFIED on 38427 |
| **(law refs, printed p1 body)** | print NAME; tick ⟺ IS_CHECKED=1 | `T_T_REQUEST_LAW_REF.NAME, .IS_CHECKED` | A4:78-80 | `SELECT NAME, IS_CHECKED FROM T_T_REQUEST_LAW_REF WHERE REQUEST_ID=:req ORDER BY ID;` | VERIFIED on 38427 |

**What p1 queries prove:** the six header cells + law-reference lines equal exactly these columns for `:req`.

---
## SIGNATURES (4 slots, `buildSignatures`, A4:86,96-107)

| Section | Rule | Source | Code | Verify SQL | Status |
|---|---|---|---|---|---|
| **Approval signatures ×4** | look up by `T_T_REQUEST.REFERENCE_NO`; prefer `INFORM_STATUS=20`, else latest; 4 slots always (REQ-021); **print order = s1, s3, s2, s4** (slots 2&3 swapped, deliberate); blank all 4 if no referenceNo/row | `T_T_LICENSE_INFORM.NAME_PREFIX{1..4}/NAME{1..4}/SURNAME{1..4}/POSITION{1..4}` keyed by `REFERENCE_NO` | A4:86,96-106 | `SELECT NAME_PREFIX1,NAME1,SURNAME1,POSITION1, NAME_PREFIX2,NAME2,SURNAME2,POSITION2, NAME_PREFIX3,NAME3,SURNAME3,POSITION3, NAME_PREFIX4,NAME4,SURNAME4,POSITION4 FROM T_T_LICENSE_INFORM WHERE REFERENCE_NO=(SELECT REFERENCE_NO FROM T_T_REQUEST WHERE ID=:req) AND INFORM_STATUS=20 ORDER BY ID DESC;` (if empty, drop the `AND INFORM_STATUS=20`) | VERIFIED on 38427 |

**Proves:** the four printed signatures = these columns; and the printed order is 1,3,2,4 (check slot 2 vs 3 if they look swapped).

---
## PAGE 2-3 — evidence items 1-17 (`buildEvidences`, A4:120-210)

Tick column for all coded items uses the TICK RULE above. Write-in values per row below. `docByChecklist` = the
active doc joined to each master row by `REQUEST_CHECKLIST_ID` (A4:127-129).

| Section | Rule (tick + write-in) | Source | Code | Status |
|---|---|---|---|---|
| **1. สำเนาหนังสือรับรองการจดทะเบียน…** | tick `ReqImport00101`; `ออกให้เมื่อ` = doc `ISSUE_DATE` | doc row for 00101 | A4:133-135 | VERIFIED 38427 |
| **2. หนังสือมอบอำนาจ** | tick `ReqImport00602`; `ลงวันที่` = doc `ISSUE_DATE` | doc row for 00602 | A4:137-139 | VERIFIED 38427 |
| **3. เอกสารของผู้มีอำนาจลงนาม/มอบอำนาจ** | per person: name, ☐สำเนาทะเบียนบ้าน(doc 103), ☐สำเนาบัตรประชาชน(doc 102), `เลขที่`=ID_CARD_NO, `วันหมดอายุ`=ID_CARD_EXPIRY_DATE; **pad to 2 slots**. **RULE (DEF-26): PER_TYPE ≠ 2, INCLUDING NULL** (everything that is not the attorney) | `T_T_REQUEST_PER` + `T_T_REQUEST_DOC` | A4:141-142,213-233 | 🔧 **rule corrected DEF-26 → TASK-054** (current code = exact `=1`, drops non-1/2/NULL; fix in flight) |
| **4. เอกสารของผู้รับมอบอำนาจ** | same fields; **RULE (DEF-26): PER_TYPE = 2 exactly** | " | A4:143-144,213-233 | 🔧 DEF-26 → TASK-054 (=2 unchanged; item 3 becomes the complement) |
| **5. สำเนารับรองการประกอบกิจการโรงงาน** | sub-rows: ร.ง.4 (tick `00803`, `วันหมดอายุ`=EXPIRY_DATE) · อ.2 (tick `12204`, เลขที่=DOCUMENT_NAME_OTHER, ลงวันที่=ISSUE_DATE, วันหมดอายุ=EXPIRY_DATE) · อ.7 (tick `00006`, same 3) · เปิดสายการผลิต (no code, untick) + (1)(2) ที่/ลง blank | doc rows 00803/12204/00006 | A4:148-169 | VERIFIED 38427 |
| **6. สำเนาหนังสืออนุญาต แบบ อ.8 ฉบับเดิม** | (n) ที่=LICENSE_NO, ลง=ISSUE_DATE from own-table; **pad to 2**; no master/code → never ticked | `T_T_REQUEST_DTL_REF_IMPORT` by REQUEST_ID | A4:171-173,239-252 | 🔴 **ACCEPTED GAP — table EMPTY**, never rendered a real value (REQ-029) |
| **7. สำเนาบัตรประจำตัวผู้เสียภาษี…** | tick `ReqImport00407` | doc 00407 | A4:175 | VERIFIED 38427 |
| **8. ใบทะเบียนภาษีมูลค่าเพิ่ม (ภ.พ. 20)** | tick `10008` | doc 10008 | A4:176 | VERIFIED 38427 |
| **9. แผนที่แสดงสถานที่ตั้งโรงงาน** | tick `00010` | doc 00010 | A4:177 | VERIFIED 38427 |
| **10. แผนผังแสดงสถานที่จัดเก็บอาวุธ** | tick `00012` | doc 00012 | A4:178 | VERIFIED 38427 |
| **11. แผนผังโรงงาน** | tick `12111` | doc 12111 | A4:179 | VERIFIED 38427 |
| **12. ภาพตัวอย่างหรือแบบรูป…** | tick `00013` | doc 00013 | A4:181-182 | VERIFIED 38427 |
| **13. เอกสารหลักฐานแสดงคุณสมบัติ…** | tick `00014` | doc 00014 | A4:183-184 | VERIFIED 38427 |
| **14. เอกสารหรือหลักฐานที่แสดงว่าไม่สามารถหา…** | tick `00015` | doc 00015 | A4:186-189 | VERIFIED 38427 |
| **15. โครงการวิจัย…** | tick `00016` | doc 00016 | A4:190-191 | VERIFIED 38427 |
| **16. ใบแสดงรายการสินค้า และใบสั่งซื้อ** | tick `00017` | doc 00017 | A4:192 | VERIFIED 38427 |
| **17. เอกสารอื่น ๆ (ถ้ามี)** | dynamic: docs with `DOCUMENT_ID=0 AND DOCUMENT_TYPE=99 AND REQUEST_CHECKLIST_ID=0` + file, names joined `, `; tick ⟺ any such; **label + real dotted write-in field (DEF-25)** | `T_T_REQUEST_DOC.DOCUMENT_NAME` | A4:194-207 | VERIFIED (populated) on 38427 (stakeholder eye) |

### Tick verification SQL (items 1,2,5,7-16 — one query, all coded rows)
```sql
SELECT c.CHECKLIST_CODE,
       CASE WHEN EXISTS (
         SELECT 1 FROM T_T_REQUEST_DOC d
         WHERE d.REQUEST_ID = :req
           AND d.REQUEST_CHECKLIST_ID = c.ID
           AND d.ATTACH_FILE_ID IS NOT NULL AND d.ATTACH_FILE_ID <> 0
           AND (d.STATUS IS NULL OR d.STATUS <> 'D')
       ) THEN 'TICK' ELSE '-' END AS TICKED
FROM   T_S_REQUEST_CHECKLIST c
WHERE  c.CHECKLIST_CODE IN ('ReqImport00101','ReqImport00602','ReqImport00803','ReqImport12204',
       'ReqImport00006','ReqImport00407','ReqImport10008','ReqImport00010','ReqImport00012',
       'ReqImport12111','ReqImport00013','ReqImport00014','ReqImport00015','ReqImport00016','ReqImport00017')
ORDER BY c.CHECKLIST_CODE;
```
**Proves:** each item's ✓ box on the render matches TICK/‑ here (exactly the builder's rule, code-for-code).

### Write-in values SQL (items 1/2/5 dates + refs)
```sql
SELECT c.CHECKLIST_CODE, d.DOCUMENT_NAME_OTHER AS ref_no, d.ISSUE_DATE, d.EXPIRY_DATE
FROM   T_S_REQUEST_CHECKLIST c
JOIN   T_T_REQUEST_DOC d ON d.REQUEST_CHECKLIST_ID = c.ID AND d.REQUEST_ID = :req
                         AND (d.STATUS IS NULL OR d.STATUS <> 'D')
WHERE  c.CHECKLIST_CODE IN ('ReqImport00101','ReqImport00602','ReqImport00803','ReqImport12204','ReqImport00006')
ORDER BY c.CHECKLIST_CODE;
```
**Proves:** item-1 `ออกให้เมื่อ`/item-2 `ลงวันที่` = ISSUE_DATE; ร.ง.4 วันหมดอายุ = EXPIRY_DATE; อ.2/อ.7 เลขที่=DOCUMENT_NAME_OTHER, ลงวันที่/วันหมดอายุ.

### Items 3 & 4 persons SQL
```sql
SELECT p.ID,
       CASE WHEN p.PER_TYPE = 2 THEN 'item4 (ผู้รับมอบ)' ELSE 'item3 (ผู้มอบ)' END AS FORM_ITEM,  -- DEF-26 partition
       p.PER_TYPE, p.PERSON_NAME_PREFIX, p.PERSON_NAME, p.PERSON_SURNAME,
       p.ID_CARD_NO, p.ID_CARD_EXPIRY_DATE
FROM   T_T_REQUEST_PER p
WHERE  p.REQUEST_ID = :req
  AND (p.STATUS IS NULL OR p.STATUS <> 'D')   -- NB: no PER_TYPE filter — every active person appears in exactly one item
ORDER BY FORM_ITEM, p.ID;
-- per-person checkbox (id-card=102, house-reg=103):
SELECT REF_ID, DOCUMENT_ID FROM T_T_REQUEST_DOC
WHERE  REQUEST_ID=:req AND DOCUMENT_ID IN (102,103)
  AND  ATTACH_FILE_ID IS NOT NULL AND ATTACH_FILE_ID <> 0
  AND (STATUS IS NULL OR STATUS <> 'D');
```
**Proves:** the partition — item 4 = PER_TYPE 2, item 3 = **everything else incl. NULL** (DEF-26); names + เลขที่ +
วันหมดอายุ; the two ☐ per person tick ⟺ a 102/103 doc with a file. Form pads to (1)(2) even if fewer rows. **No active
person can be in neither item** (that was the DEF-26 bug — exact `=1`/`=2` dropped non-1/2/NULL people).

### Item 6 อ.8 SQL — the gap
```sql
SELECT ID, REQUEST_DTL_ID, LICENSE_NO, ISSUE_DATE, EXPIRY_DATE
FROM   T_T_REQUEST_DTL_REF_IMPORT WHERE REQUEST_ID = :req ORDER BY ID;
```
**Proves:** the (n) ที่/ลง rows. 🔴 **Expected: 0 rows** — `T_T_REQUEST_DTL_REF_IMPORT` is empty across samples; the
form always prints the padded (1)(2) blanks. Non-empty here would be the first real อ.8 data → re-verify then.

### Item 17 เอกสารอื่น ๆ SQL
```sql
SELECT DOCUMENT_NAME FROM T_T_REQUEST_DOC
WHERE  REQUEST_ID=:req AND DOCUMENT_ID=0 AND DOCUMENT_TYPE=99 AND REQUEST_CHECKLIST_ID=0
  AND  ATTACH_FILE_ID IS NOT NULL AND ATTACH_FILE_ID <> 0
  AND (STATUS IS NULL OR STATUS <> 'D')
  AND  TRIM(DOCUMENT_NAME) IS NOT NULL;
```
**Proves:** the value(s) that print on item-17's dotted line (joined with `, `). Empty = blank line (still printed).

---
## PAGE 4 — annex บัญชีรายการ (`buildComponents`, A4:314-328)

| Section | Rule | Source | Code | Status |
|---|---|---|---|---|
| **รายการ table (ลำดับ/รหัส/รายการ/จำนวน)** | one row per รายการ, ordered by ITEM_NO; qty = `#,##0.###` + unit | `VW_REQUEST_DTL.ITEM_NO, PRODUCT_CODE, PRODUCT_NAME_DISPLAY_LICENSE, QUANTITY, QUANTITY_UNIT_NAME1` | A4:316,321-322 | VERIFIED 38427 |
| **อ.8 3-column block (เลขที่/ลงวันที่/วันหมดอายุ per รายการ)** | join REF_IMPORT to each รายการ by `REQUEST_DTL_ID = VW_REQUEST_DTL.ID`, latest by ISSUE_DATE; blank if none | `T_T_REQUEST_DTL_REF_IMPORT.LICENSE_NO, ISSUE_DATE, EXPIRY_DATE` | A4:319-325 | 🔴 **ACCEPTED GAP — REF_IMPORT empty → always blank.** ⚠️ join key `VW_REQUEST_DTL.ID = T_T_REQUEST_DTL.ID` **UNCONFIRMED on live DID_SPF** (flagged A4:317-318) |

### Annex SQL
```sql
SELECT v.ITEM_NO, v.PRODUCT_CODE, v.PRODUCT_NAME_DISPLAY_LICENSE, v.QUANTITY, v.QUANTITY_UNIT_NAME1,
       r.LICENSE_NO, r.ISSUE_DATE, r.EXPIRY_DATE
FROM   VW_REQUEST_DTL v
LEFT JOIN T_T_REQUEST_DTL_REF_IMPORT r ON r.REQUEST_DTL_ID = v.ID
WHERE  v.REQUEST_ID = :req
ORDER BY v.ITEM_NO;
```
**Proves:** the 4 base columns per รายการ row; the 3 อ.8 columns are blank while `r.*` is null (the gap). If `r.*`
is ever non-null, it also tests whether the `REQUEST_DTL_ID = v.ID` join key is correct on live data.

---
## Coverage / gaps summary (nothing omitted)
- **Every printed section of อ.4 is above**, enumerated from `buildFromDb` + sub-builders (not a render).
- **Two real gaps, both `T_T_REQUEST_DTL_REF_IMPORT` empty:** evidence item 6 (อ.8) and the annex 3-column block.
- **One unconfirmed assumption:** annex join key `VW_REQUEST_DTL.ID = T_T_REQUEST_DTL.ID` (A4:317-318).
- **item 17 populated branch:** PASS on 38427 (stakeholder eye).
- No `UNKNOWN` rows — every value traced to a line. No a4 code changed by this document (REQ-036 constraint).
- **DEF-26 (2026-09-08):** the stakeholder found the item-3/4 PER_TYPE bug **by reading this document** — the exact
  `=1`/`=2` lookup silently drops people whose PER_TYPE is not 1/2 or is NULL. Rule corrected above; code fix = TASK-054
  (all 4 builders). The document doing its job: a mapping read against the rule surfaced a real defect no render had shown.
