# SPEC-001: อ.6 (A6) checklist report — end-to-end flow + verification plan

- Source: REQ-001
- Status: ACTIVE

## Overview
Investigate/verify REQ (no build). This SPEC delivers **AC#1** (a written
end-to-end explanation of how the อ.6 checklist PDF is produced) and sets up
**AC#2/#3** (produce the PDF from the 34 sample ids and find defects) for
**Tanya (QA)** to execute read-only. It also records the **invocation details**
QA needs (endpoint + the fact that the sample ids must be encrypted first) and a
ranked list of **candidate-defect leads** found by code reading, each with a
code location for QA to check against the real output.

All findings below come from reading the real repo at
`C:\Users\Admin\sa-project\service-report2\DID-046-SpringBoot-Service-Report`.
No DB was queried (SA does not touch real DBs).

---

## AC#1 — How the อ.6 checklist PDF is produced (end-to-end)

**Entry point:** `GET /document-service/api/v1/download/checklist/{requestId}`
(`DocumentController.downloadChecklistPDF`), auth via `X-API-KEY` (`ApiKeyFilter`)
and/or bearer. `?disposition=inline|attachment` (default `inline`).
`{requestId}` in the path is an **AES-encrypted** string.

**Step 1 — Resolve report type** (`RequestTypeResolverService.resolveChecklistRequestType`)
1. `cryptoService.decryptToLong(requestId)` → numeric `REQUEST_ID`.
2. `resolveFromSpecial(requestId)`: `RequestSpecialRepository.findByRequestId`
   → `T_T_REQUEST_SPECIAL.FORM_ID`:
   - `FORM_ID 6 (อ.6)` or `7 (อ.7)` → **"A6"** (shared report)
   - `FORM_ID 9/10` → "A9"
   - any other FORM_ID present → `IllegalArgumentException`
3. If no `T_T_REQUEST_SPECIAL` row → fall through to `REQUEST_TYPE` switch
   (0→CHECKPERSON, 50→OPEN, 51→EXPAND, 52→PLANTCHANGE, 53→PERSONCHANGE,
   2→A1/A3 via `forRenew`). อ.6 always resolves in step 2, not here.

**Step 2 — Build data** (controller `case "A6"`)
`A6CheckListReportBuilder.createData(requestId)` → `decryptToLong` **again** (same
encrypted string, decrypted a second time — consistent, not a bug) →
`buildFromDb(requestId)`. Pulls from Oracle `DIDPERMIT`:
- `applicant`: `T_T_REQUEST.TRADER_NAME` / `OBJECTIVE`, `COUNT(T_T_REQUEST_DTL)`,
  `T_T_REQUEST_EMPLOYER.EMPLOYER_NAME`; `permitType` is a fixed string.
- `lawReferences`: `T_T_REQUEST_LAW_REF` (NAME, IS_CHECKED).
- `approvalSignatures`: `T_T_LICENSE_INFORM` matched by `REFERENCE_NO`
  (prefers `INFORM_STATUS=20`), 4 signers, re-ordered `[1,3,2,4]` for a 2-col grid.
- `evidences` (items 1–8): master checklist `T_S_REQUEST_CHECKLIST`
  `GROUP_CODE='ReqSpecial'` (SEQ 1–9) + `T_T_REQUEST_DOC` (checked = a doc row
  exists **and** `ATTACH_FILE_ID` not null); persons for items 3/4 from
  `T_T_REQUEST_PER` (PER_TYPE 1/2) + docs 102/103.
- `components`: `T_T_REQUEST_DTL` (+ `T_M_UNIT` for the unit).
Returns record `A6CheckListReportData` (`checker` field = dead/null).

**Step 3 — Fill + export** (`JasperPdfReportService.exportPdfA6`)
1. `ObjectMapper` serializes the record to JSON (also `System.out.println`s it).
2. Loads main `.jasper` `reports-045/request-a6/main/request-a6-main.jasper`
   and 5 subreports (`SUB_LAWREF`, `SUB_SIGNATURE`, `SUB_EVIDENCE`,
   `SUB_EVIDENCE_SUB`, `SUB_COMPONENT`) via `ReportResourceService`.
3. `CHECK_IMAGE` param = `assets/check.png` URL (the checkbox tick).
4. `JasperFillManager.fillReport(main, params, new JsonDataSource(json))` — the
   JSON datasource is passed directly, so `<query>` in the jrxml is ignored;
   subreports read sub-nodes via `((JsonDataSource)$P{REPORT_DATA_SOURCE}).subDataSource("<field>")`.
5. `JasperExportManager.exportReportToPdfStream` → `byte[]` → returned as
   `application/pdf` with the content-disposition header.

**History variant:** `GET /checklist/history/{requestChecklistFormId}` →
`resolveChecklistRequestTypeByChecklistFormId` (form id → `T_T_REQUEST_CHECKLIST_FORM.REQUEST_ID`
→ same resolver) → `A6CheckListHistoryReportBuilder`, which currently just
delegates to `A6CheckListReportBuilder.createData(...)` (see Candidate Defect D2).

---

## Invocation details for QA (needed before AC#2/#3)

1. **The 34 sample ids are PLAIN integers; the endpoint expects an ENCRYPTED
   requestId.** Passing a raw integer as `{requestId}` will fail AES decryption
   in `CryptoService` → 500, not a real อ.6 result. Before QA can hit the
   endpoint, each id must be encrypted with the **same key/scheme as
   `crypto.*` in `application.yml`**. Options for Porter to pick:
   - (a) expose/print the `CryptoService.encrypt` output for the 34 ids so QA can
     call the endpoint with the encrypted value, **or**
   - (b) QA drives generation through the test seam `A6CheckListReportBuilder.createDataRaw(long)`
     (takes the plain id, no decryption) — but that bypasses the controller/resolver,
     so it verifies the report body, not the endpoint/resolver.
   Recommend (a) so the whole path (auth → resolve → build → PDF) is exercised.
2. Endpoint needs a valid `X-API-KEY` (from `app.security.download-api-key`) and
   the base URL of the UAT-wired instance — **DATA REQUEST to the human via Porter**
   (drop into `project-docs/`, never into a TEST file).
3. "Confirm all 34 ids resolve to อ.6": each id's `T_T_REQUEST_SPECIAL.FORM_ID`
   must be 6 or 7. QA can confirm by generation (a non-อ.6 id will resolve to a
   different report or error), or Porter can get it in one shot via the DATA
   REQUEST SQL in `## Questions` (Q1).

---

## AC#3 — Candidate-defect leads to verify (ranked; from code reading only)

> These are **suspects, not confirmed defects** — SA cannot run the DB. QA
> confirms each against the real PDF; anything needing DB truth becomes a DATA
> REQUEST. Ordered by likely impact.

- **D1 — Person "วันหมดอายุ" source mismatch (item 3/4).**
  `A6CheckListReportBuilder.buildPersons` builds the expiry from
  `RequestPerEntity.getIdCardExpiryDate()`, but `docs/A6-report-db-mapping.md`
  specifies the expiry should come from `T_T_REQUEST_DOC.EXPIRY_DATE` of the
  id-card doc (DOCUMENT_ID=102). If the two differ in the DB, the printed expiry
  is wrong. **Check:** does the printed expiry for a person match the id-card
  doc's expiry? (`A6CheckListReportBuilder.java:202-206`)
- **D2 — History path likely wrong.** `A6CheckListHistoryReportBuilder.createData`
  passes `requestChecklistFormId` straight into `A6CheckListReportBuilder.createData`,
  which treats its argument as an **encrypted REQUEST_ID** and decrypts it — but a
  checklist-form id is a different key than a request id. The history endpoint for
  อ.6 will almost certainly build the wrong request (or fail). **Check:** call
  `/checklist/history/{formId}` for an อ.6 form and compare to the direct endpoint.
  (`A6CheckListHistoryReportBuilder.java`)
- **D3 — permitDuration (item 7) source unresolved.** Code uses
  `EMPLOYER.TOTAL_DAYS + " วัน"`; an in-code TODO plus `docs/A6-report-db-mapping.md`
  flag `T_T_LICENSE_INFORM.OPERATION_PERIOD` as an alternative. If the business
  source is OPERATION_PERIOD, the printed duration is wrong. Needs a **business
  decision** (Q2 — Porter). (`A6CheckListReportBuilder.java:83-85`)
- **D4 — Signature cell placement.** `buildSignatures` deliberately emits order
  `[s1, s3, s2, s4]` to match a 2-column row-major subreport. If the subreport's
  print order differs, signers land in the wrong cells. **Check:** the four
  signer names/positions appear in the correct quadrants. (`A6CheckListReportBuilder.java:112`)
- **D5 — "checked" tick rule edge.** A tick requires a `T_T_REQUEST_DOC` row with
  `ATTACH_FILE_ID != null && > 0`. If the DB uses 0/negative sentinels or stores
  the attachment elsewhere, real attachments may show unticked (or vice-versa).
  **Check:** a doc known to have a file is ticked; one without is not.
  (`A6CheckListReportBuilder.java:234-236`)
- **D6 (cosmetic) — stale endpoint doc.** The controller `@Operation` lists
  supported types as "A1, A3, OPEN, EXPAND, PLANTCHANGE, PERSONCHANGE" — omits
  A6/A9 though both are handled. Swagger under-documents; no runtime effect.

---

## Handoff / QA routing
- AC#1 is delivered by this SPEC.
- AC#2/#3 are Tanya's read-only run of the 34 samples against the endpoint, using
  the Invocation details above, checking D1–D6 (plus overall field/checkbox/date/
  layout correctness) against the อ.6 form.
- Route: Porter relays invocation details (encrypted ids + UAT URL + test API key)
  to Tanya; Tanya produces the PDFs, records actual output, and returns a
  `TEST_PASSED` / `TEST_FAILED` (with concrete defects) verdict to Porter.

## Questions
- **Q1 — DATA REQUEST (Porter → human).** To confirm all 34 sample ids are อ.6 and
  to unblock D1/D3 checks, please run and drop the result into `project-docs/`:
  ```sql
  SELECT r.ID              AS request_id,
         s.FORM_ID,
         e.TOTAL_DAYS,
         li.OPERATION_PERIOD
  FROM   T_T_REQUEST r
  LEFT JOIN T_T_REQUEST_SPECIAL  s  ON s.REQUEST_ID = r.ID
  LEFT JOIN T_T_REQUEST_EMPLOYER e  ON e.REQUEST_ID = r.ID
  LEFT JOIN T_T_LICENSE_INFORM   li ON li.REFERENCE_NO = r.REFERENCE_NO
  WHERE  r.ID IN ( <the 34 ids from project-docs/REQ-001-a6-sample-request-ids.md> );
  ```
- **Q2 — business (Porter).** For item 7 "ระยะเวลาการอนุญาต", is the source
  `T_T_REQUEST_EMPLOYER.TOTAL_DAYS` (current code) or
  `T_T_LICENSE_INFORM.OPERATION_PERIOD`? (Drives whether D3 is a real defect.)
  (SA answers Jason/QA-relevant follow-ups here as `> answer: ...`.)
  > answer (Porter, from human, 2026-08-05): **NEITHER.** The correct source for
  > item 7 "ระยะเวลาการอนุญาต" is **`T_T_LICENSE.PERIOD_TEXT`** (a text field on
  > table `T_T_LICENSE`) — not `TOTAL_DAYS` (current code) and not
  > `OPERATION_PERIOD`. This **confirms D3 is a real defect**: the code prints
  > `EMPLOYER.TOTAL_DAYS + " วัน"` but should print `T_T_LICENSE.PERIOD_TEXT`.
  > Note the field is already text, so the hardcoded `" วัน"` suffix is likely
  > wrong too. Fixing is out of scope for REQ-001 (investigate+verify) — Porter
  > will raise a follow-up REQ for the fix once QA confirms the printed value.
