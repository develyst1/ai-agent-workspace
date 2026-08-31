# SPEC-036: personCheck HISTORY leg — render the stored snapshot (REQ-032 Addendum 2)

- Source: REQ-032 Addendum 2 (Porter). The form is reached TWO ways: (1) live `/checklist/{enc}` — built
  (TASK-038/039); (2) `/checklist/history/{formId}` from the request's history log — reads a **stored snapshot**.
- Status: ACTIVE (SA spec). **One template, two data paths.** Reuse `PersonCheckReportData` + the 6 templates +
  `exportPdfPersonCheck`. This REVERSES the earlier "no history builder" call (JC4) — a history builder IS needed.
- **Render the snapshot VERBATIM — never recompute from live/today's data** (Porter). Computing from the snapshot's OWN
  rows is fine (that IS the record); reading any LIVE table for a history entry is the defect to avoid.

## The snapshot family already exists in code (a1/a3/a6 history builders use it — clone that pattern)
`A1CheckListHistoryReportBuilder` is the template to mirror. Entities/repos already present:
- `RequestCheckListFormEntity` (`T_T_REQUEST_CHECKLIST_FORM`): `REQUEST_PERSON_NAME`, `CREATE_NAME`,
  `REQUEST_CONTACT_DATE`, `FORM_CODE` (='BgChk'), `REASON`, `OBJECTIVE_TYPE`, `REQUEST_ID`, `ID`.
- `RequestCheckListDocEntity` (`…_DOC`): `CHECKLIST_NAME` + `HAS_FILE` (evidence items — verbatim, NO code lookup).
- `RequestCheckListPerEntity` (`…_PER`): `REQUEST_CHECKLIST_PERSON` + `HAS_ID_CARD_NO_FILE` + `HAS_HOUSE_REG_NO_FILE`.
- `RequestCheckListDtlEntity` (`…_DTL`): `TITLE_CHECKLIST_CODE` (DocIncomp/DocEdit/DocExpire/DocExtra/Other) +
  `DESCRIPTION` + `REASON`.

## Porter's two questions — RESOLVED from the existing a1 history builder (no guessing)
- **Q2 (REASON vs DESCRIPTION):** a1's working history builder does `formatDetailTitle(detail.getDescription(),
  detail.getReason())` — **DESCRIPTION is the primary text (doc name), REASON the secondary (note).** personCheck
  uses the SAME order. (Confirmed against real code, not a hunch — this is exactly the swap DEF-12 warned about.)
- **Q1 (does live also write a snapshot?):** a1 has SEPARATE live + history builders → the **two-path model**. So
  personCheck: live stays computed (TASK-038/039), history reads the snapshot. Whether the live request also has a
  snapshot row is a data-lifecycle detail that does NOT change the report design. (Flag only if the human wants live to
  read the snapshot too — not required.)

## Do — new `PersonCheckHistoryReportBuilder` (mirror `A1CheckListHistoryReportBuilder`)
`createData(String encFormId)`: `decryptToLong` → `RequestChecklistFormRepository.findById(formId)`. Map to
`PersonCheckReportData`:
- Footer: `submittedBy = REQUEST_PERSON_NAME`, `receivedBy = CREATE_NAME`, `contactDate = dateOnly(REQUEST_CONTACT_DATE)`
  (date-only, blank-not-null — DEF-18). `documentTitle`/`objectiveType` as a1 does.
- `documentItems` (5 evidence): `…_DOC` ordered by SEQUENCE → `title = CHECKLIST_NAME`, `checked = HAS_FILE`. Verbatim.
- Person table: `…_PER` by form id → `name = REQUEST_CHECKLIST_PERSON`, `idCardChecked = HAS_ID_CARD_NO_FILE`,
  `houseRegChecked = HAS_HOUSE_REG_NO_FILE`. **Pad to min 5** (page furniture).
- Verification: `…_DTL` by `TITLE_CHECKLIST_CODE` for the 4 codes (DocIncomp→ขาดเอกสาร, DocEdit→แก้ไข,
  DocExpire→หมดอายุ, DocExtra→เพิ่มเติมอื่นๆ) → `VerificationItem` title = `formatDetailTitle(DESCRIPTION, REASON)`;
  **pad each section to min 3 rows** (page furniture). `หมายเหตุ` band as in the live path.
- `ครบ/ไม่ครบ`: from the snapshot only (derive from `…_DOC.HAS_FILE`, like a1 — that is the recorded state; do NOT
  read live tables). If `…_FORM` carries a stored completeness flag, prefer it.
- **NO TICK RULE / ChecklistCodeBinder / live repositories in this path** — the snapshot is already flattened.
- Add `RequestCheckListPerRepository.findByRequestChecklistFormId(...)` if it doesn't exist (NULL-safe, no FETCH FIRST).
- **Verify `…_PER` columns (`HAS_ID_CARD_NO_FILE`/`HAS_HOUSE_REG_NO_FILE`) against the live `DID_SPF` connection**
  (DEF-17 lesson — the snapshot family isn't in the dict; Form/Doc/Dtl are proven by a1's history builder, `…_PER` is new usage).

## Wire
`DocumentController` **history** switch: add `case "CHECKPERSON" -> a personCheckHistoryReportBuilder.createData(formId)
→ exportPdfPersonCheck`. `resolveChecklistRequestTypeByChecklistFormId` already routes formId→CHECKPERSON. No template change.

## Acceptance
- History path on **REQUEST_CHECKLIST_FORM_ID = 211 (REQUEST_ID 37832)** renders (6 doc rows, 1 person both ticks, real
  footer) — **verbatim from the snapshot**, not recomputed. Min-5 persons, 3-per-section, หมายเหตุ present. No literal null.
- Live path (38237) unchanged. a1/a3/a6/a9/a14/a15 unaffected.

## Task
- TASK-040 (Jason, BE). Then QA on both paths (live 38237 + history 211/37832).

## Questions
(Jason asks; Sober answers as `> answer: ...`)
