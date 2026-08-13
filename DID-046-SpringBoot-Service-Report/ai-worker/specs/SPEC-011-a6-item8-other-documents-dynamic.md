# SPEC-011: อ.6 item 8 "เอกสารอื่น ๆ (ถ้ามี)" — make it dynamic

- Source: REQ-011
- Status: ACTIVE

## Overview
Replace the hardcoded, always-blank "เอกสารอื่น ๆ (ถ้ามี)" line (SPEC-008 §7d,
`A6CheckListReportBuilder` ~L184-186) with the comma-joined `DOCUMENT_NAME`s of the
applicant's attached "other" documents.

## Rule (from the human, request 38314)
"Other" docs = `T_T_REQUEST_DOC` where **`DOCUMENT_ID = 0` AND `DOCUMENT_TYPE = 99`
AND `REQUEST_CHECKLIST_ID = 0`**, excluding soft-deleted (`STATUS <> 'D'`), and
**only rows that have a real attachment** (REQ-009 rule: the `T_T_ATTACH_FILE` row
exists via `getAttachFile() != null`). Show their `DOCUMENT_NAME` joined by `", "`.
No such rows → line stays blank (as now).

Example: 38314 row 47317 (DOCUMENT_ID=0, TYPE=99, CHECKLIST_ID=0, DOCUMENT_NAME="wdw",
has file, STATUS='A') → line shows **"wdw"**.

## Design (no new query — reuse the already-loaded docs list; 11.2-safe)
`buildEvidences` already loads `docs = requestDocRepository.findByRequestIdAndStatusNot(requestId, "D")`.
Filter that list in Java (no new SQL, no FETCH FIRST):
```java
String otherDocNames = docs.stream()
        .filter(d -> eq(d.getDocumentId(), 0)                        // DOCUMENT_ID = 0
                  && eq(d.getDocumentType(), 99)                     // DOCUMENT_TYPE = 99
                  && d.getRequestChecklistId() != null
                  && d.getRequestChecklistId() == 0L                 // REQUEST_CHECKLIST_ID = 0
                  && hasFile(d))                                     // real attachment (REQ-009)
        .map(RequestDocEntity::getDocumentName)
        .filter(s -> s != null && !s.isBlank())
        .collect(Collectors.joining(", "));
```
(`eq(Integer,int)` helper already exists; `STATUS <> 'D'` already applied by the docs query.)

Replace the static §7d sub-row with the data-driven one:
```java
String otherLabel = otherDocNames.isBlank()
        ? "เอกสารอื่น ๆ (ถ้ามี) ...................................................................................................."
        : "เอกสารอื่น ๆ (ถ้ามี)  " + otherDocNames;
employerSubs.add(new EvidenceSub("employer", null, otherLabel,
        null, null, !otherDocNames.isBlank(), null));   // ticked when ≥1 shown (see Q1)
```

## Definition of Done (see TASK-005)
- 38314 → item-8 "เอกสารอื่น ๆ" line shows "wdw" (comma-joined if more with files), box ticked.
- A request with no attached type-99 other-docs → line blank + unticked (no regression).
- Rows without a file / STATUS='D' excluded. No new query; compiles.

## Tasks
- TASK-005: dynamic "other documents" line (depends on: —)

## Questions
- **Q1 (Porter/human) — checkbox:** when ≥1 attached other-doc is shown, tick the box?
  **SA default = tick when ≥1 shown, blank+unticked when none** (spec'd above). If the human
  wants a pure write-in (names but no tick), it's a one-line change — non-blocking; confirm.
- **Q2 — name field:** using `DOCUMENT_NAME` (settled by example 47317 = "wdw"), **not**
  `DOCUMENT_NAME_OTHER`. Confirm if any type-99 row is expected to carry the name in
  `DOCUMENT_NAME_OTHER` instead.

## Traceability
- Supersedes SPEC-008 §7d (static line). Reuses REQ-009 attachment rule.
