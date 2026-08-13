# SPEC-014: อ.9 (A9) DB integration — build the real A9 report from Oracle

- Source: REQ-014
- Status: UNBLOCKED (REQ-016 closed — SPEC-016 RESOLUTION). Build design final below; BE TASK ready
  once Porter confirms the `GROUP_CODE` name ('ReqMove' proposed) with the data team.

## ✅ RESOLVED (see SPEC-016 RESOLUTION) — build direction
อ.9 = **same model as อ.6** (checklist master `GROUP_CODE='ReqMove'` + `T_T_REQUEST_DOC.REQUEST_CHECKLIST_ID`
+ REQ-009 tick). Applicant/page-1 from **`T_T_REQUEST_MOVE`** (destroyLocation=`DEST_PLACE_NAME`);
persons via the **REQ-015 NULL-safe rule**; law refs/signatures/components/item-7 reuse a6.
**Graceful degradation is mandatory:** empty master / NULL `REQUEST_CHECKLIST_ID` / NULL attachment →
blank labels + unticked, **never throw** (empty อ.9 evidence now = correct until the data team seeds).
Structure: new `A9CheckListPreviewBuilder` (mock, keeps `/preview/checklist/a9`) + `A9CheckListReportBuilder`→DB
(`buildFromDb`+`createDataRaw`; `createData`=decrypt→DB, which ALSO fixes the live download-mock defect).
The DR-era "blocked" notes below are superseded by this resolution.

## ⚠️ Live defect confirmed (state to the human)
The **real download endpoint** already serves อ.9, and it returns **mock data**:
`DocumentController` `case "A9"` → `a9CheckListReportBuilder.createData(requestId)`, and
`A9CheckListReportBuilder.createData(String)` **ignores the requestId and returns
`buildMock(...)`** ("บริษัท ตัวอย่าง จำกัด", "wdw"-style samples). So **any** caller of
`GET /api/v1/download/checklist/{encryptedId}` that resolves to อ.9 (FORM_ID 9/10) gets
sample data, not their real report. This is production-facing. **REQ-014 fixes it as a
byproduct** — once `createData` decrypts + builds from DB, the download endpoint is correct.
The history path (`A9CheckListHistoryReportBuilder`) has the same mock delegation.

## ⛔ DR RESULTS (2026-08-05) — design-changing: อ.9 is NOT the a6 document model
The DR answers invalidate the "reuse a6 evidence" assumption below. **อ.9 has a different data model:**
- **DR#1 → there is NO อ.9 checklist group.** `T_S_REQUEST_CHECKLIST` has only 8 groups (A1, A3,
  BgChk, ReqExpand, ReqOpen, ReqPersonChange, ReqPlantChange, ReqSpecial). อ.6 = `ReqSpecial`; **อ.9
  has none** (ReqPlantChange also has 13 rows but is a different form — not อ.9's).
- **DR#3 → `T_T_REQUEST_DOC` has ZERO rows for 37940.** So the evidence ticks (which for a6 come from
  doc rows + attachments) have **no source data** for this request.
- **DR#2 → no `T_T_REQUEST_SPECIAL` row for 37940 either.** The อ.9 payload lives in **`T_T_REQUEST_MOVE`**
  (DEST_PLACE_NAME/DEST_* address, WRITE_OFF_DESTROY_DATE, ORIGIN_*, PLANT_*, AUTHORITY_*). So
  `resolveFromSpecial` (FORM_ID 9/10) would NOT even match 37940 → resolution itself may differ for อ.9.
- **`applicant.destroyLocation` → `T_T_REQUEST_MOVE.DEST_PLACE_NAME`** (+ DEST_* for the full address). ✅ mapped.

**Consequence:** the whole อ.9 **evidence section (13 items + ticks) has no document/checklist source
in the DB for the sample** — so REQ-014 CANNOT be built as "a6 with different labels." See "Evidence
model — must resolve before build" below. **The a6-reuse table further down applies only to the pieces
that are actually document/checklist-driven, which for อ.9 may be few.**

## Evidence model — MUST resolve before any build (answers Porter's question)
With no a9 checklist master and no doc rows for 37940, the อ.9 13-item evidence + ticks can only come from
one of:
- **(a) master must be seeded** — a DBA/human creates an อ.9 `T_S_REQUEST_CHECKLIST` group + the request's
  `T_T_REQUEST_DOC` rows. We do NOT write DBs; this is human/DBA work and would block the build.
- **(b) fixed labels in the report + ticks bound differently** (e.g. by `DOCUMENT_ID`, not
  `REQUEST_CHECKLIST_ID`) — but 37940 has ZERO doc rows, so every tick would be false anyway.
- **(c) อ.9 evidence is not document-driven** — comes from `T_T_REQUEST_MOVE` columns / a different table.

**SA assessment:** we cannot pick (a)/(b)/(c) from ONE sample that has no docs, no special row, and
NULL-status persons — 37940 looks **incomplete or a different flow than we assumed.** REQ-014 needs an
**investigate phase first** (like REQ-001 was for a6): the human/BA must either (i) provide a **COMPLETE
อ.9 sample** (a request that actually has its documents/evidence populated) so we can see the real shape,
or (ii) state the อ.9 evidence business model directly. Building now = guessing the whole page 2–3.
→ **Recommend Porter re-scope REQ-014: an อ.9 investigate/data-model REQ before the build REQ.**

## NULL-status rule (folds into REQ-014 AND flags an อ.6 regression)
The อ.9 persons for 37940 have **`STATUS = NULL`**. Our a6 person filter
`findByRequestIdAndPerTypeAndStatusNotOrderByIdAsc(..., "D")` generates SQL `... AND status <> 'D'`,
and in Oracle **`NULL <> 'D'` is UNKNOWN → the row is excluded**. So NULL-status persons are dropped.
- **Correct rule = exclude only explicit 'D', keep NULL:** `(status IS NULL OR status <> 'D')`
  — a Spring-Data derived name can't express this, so use a `@Query` (JPQL):
  `... WHERE p.requestId=:req AND p.perType=:t AND (p.status IS NULL OR p.status <> 'D') ORDER BY p.id`.
- Same latent trap in the **pre-existing** doc query `findByRequestIdAndStatusNot(requestId,'D')`
  (drops NULL-status docs → could hide evidence). Assess when touched.
- **อ.6 (REQ-010, DELIVERED) is exposed:** any request whose active persons have NULL STATUS silently
  drops them from items 3/4. Our 38272 test was 'A'/'D' so it didn't catch this. → **recommend Porter
  raise an อ.6 fix REQ** (change to the `IS NULL OR <> 'D'` rule).

## Design — mirror the a6 structure exactly
a6 has two beans: `A6CheckListPreviewBuilder` (mock, for `/preview/checklist/a6`) and
`A6CheckListReportBuilder` (DB). Do the same for a9 so the mock preview does not regress:
1. **New `A9CheckListPreviewBuilder`** (`@Component`) = the current `buildMock` lifted out;
   `PreviewController.previewA9()` calls `a9CheckListPreviewBuilder.createPreviewData()`
   instead of `a9CheckListReportBuilder.createData("preview")`. (Keeps `/preview/checklist/a9`
   working; "preview" string never hits decryption.)
2. **`A9CheckListReportBuilder` → DB.** Inject the repositories; add `buildFromDb(long)` +
   `createDataRaw(long)` (test/seam) and make `createData(String)` = `decryptToLong` →
   `buildFromDb` (mirrors a6). This fixes the download endpoint.
3. **Seam (REQ-013)** `previewA9Db` at `/checklist/a9/db/{requestId}` → `createDataRaw` — the
   trivial final step, already dev-gated/no-key by REQ-004.

## Field sourcing — reuse a6 (low risk) vs a9-specific (blocked on DR)
**Reuse a6 patterns directly** (same repos/rules, already proven):
| A9 field | Source (same as a6) |
|---|---|
| applicant.name / objective | `T_T_REQUEST.TRADER_NAME` / `OBJECTIVE` |
| applicant.itemCount | `COUNT(T_T_REQUEST_DTL)` |
| lawReferences | `T_T_REQUEST_LAW_REF` (NAME, IS_CHECKED) |
| permitDuration (item 7, if a9 has it) | `T_T_LICENSE.PERIOD_TEXT` (REQ-005; list+firstOrNull) |
| approvalSignatures | `T_T_LICENSE_INFORM` by REFERENCE_NO (INFORM_STATUS=20) |
| components/annex | `T_T_REQUEST_DTL` + `T_M_UNIT` |
| persons items 3/4 | `T_T_REQUEST_PER` PER_TYPE 1/2 + docs 102/103, **STATUS<>'D'** (REQ-010) |
| evidence tick | **real attachment** `getAttachFile()!=null` (REQ-009) |
| all queries | **Oracle 11.2-safe** (no FETCH FIRST) |

**a9-specific — blocked on the DATA REQUESTs below:**
- evidence checklist (13 items, item 12 has (1)–(9)) — DR#1
- applicant.destroyLocation — DR#2
- item-5 factory-docs sub-structure — DR#3
- item-12(2) person2 (ผู้รับอาวุธ) — DR#4

## DATA REQUESTs — copy-paste SQL for the human (via Porter). Results → `project-docs/` (PII, dev-only).
> Sample อ.9 request = **37940**. Rows contain PII → keep in the gitignored `project-docs/`.

**DR#1 — a9 evidence master (Porter already sent a variant).** Confirm the GROUP_CODE + SEQ→item:
```sql
SELECT GROUP_CODE, SEQUENCE, ID, CODE_NAME, DOCUMENT_TYPE, IS_ACTIVE
FROM   T_S_REQUEST_CHECKLIST
WHERE  IS_ACTIVE = 1
ORDER  BY GROUP_CODE, SEQUENCE;   -- find the group whose CODE_NAMEs match the อ.9 13-item form
```

**DR#2 — destroyLocation ("สถานที่ทำการกำจัดหรือทำลาย").** Locate the column:
```sql
SELECT * FROM T_T_REQUEST          WHERE ID = 37940;
SELECT * FROM T_T_REQUEST_SPECIAL  WHERE REQUEST_ID = 37940;
SELECT * FROM T_T_REQUEST_EMPLOYER WHERE REQUEST_ID = 37940;
-- Q: which table.column holds "สถานที่ทำการกำจัดหรือทำลาย"? If none above, name the table/column.
```

**DR#3 — item-5 factory docs (ร.ง.4 / อ.2 / อ.7).** Master rows (from DR#1's group) + the request's docs:
```sql
SELECT ID, SEQUENCE, CODE_NAME, DOCUMENT_TYPE
FROM   T_S_REQUEST_CHECKLIST
WHERE  GROUP_CODE = :a9group AND IS_ACTIVE = 1 ORDER BY SEQUENCE;   -- :a9group from DR#1
SELECT ID, REQUEST_CHECKLIST_ID, DOCUMENT_ID, DOCUMENT_TYPE, DOCUMENT_NAME,
       ISSUE_DATE, EXPIRY_DATE, ATTACH_FILE_ID, STATUS
FROM   T_T_REQUEST_DOC
WHERE  REQUEST_ID = 37940 AND STATUS <> 'D'
ORDER  BY REQUEST_CHECKLIST_ID, ID;
```

**DR#4 — item-12(2) person2 (ผู้รับอาวุธ).** Which PER_TYPE:
```sql
SELECT ID, PER_TYPE, PERSON_NAME_PREFIX, PERSON_NAME, PERSON_SURNAME, ID_CARD_NO, STATUS
FROM   T_T_REQUEST_PER
WHERE  REQUEST_ID = 37940
ORDER  BY PER_TYPE, ID;
-- Q: which PER_TYPE = ผู้รับอาวุธ (person2, item 12(2))?  (อ.6: 1=ผู้ลงนาม, 2=ผู้รับมอบอำนาจ)
```

## Build plan (once DRs land)
Recommend one TASK (or two): (a) structural split + DB skeleton + the reuse-a6 fields (can start
as soon as DR#1 confirms the evidence backbone), (b) the a9-specific evidence/destroyLocation/
person2 wiring once DR#2–4 answered. Then produce an อ.9 SQL+field-mapping doc (like SPEC-008)
per AC#3, and REQ-013 seam as the final step. Keep `/preview/checklist/a9` (mock) green throughout.

## Tasks
- None yet — blocked on DR#1–#4. No BE work over the mock builder.

## Questions
- **@Porter:** DR#1–#4 SQL above are ready to hand the human (results into `project-docs/`, PII).
  Also — the download-endpoint mock defect (top of this SPEC) is live; please state it to the human
  explicitly (REQ-014 closes it). Once the DRs land I'll spec the build TASK(s).
