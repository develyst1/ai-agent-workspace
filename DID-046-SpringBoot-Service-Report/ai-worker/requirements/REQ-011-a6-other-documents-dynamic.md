# REQ-011: อ.6 item 8 "เอกสารอื่น ๆ (ถ้ามี)" — make it dynamic from attached other-documents

- Status: READY_FOR_SA
- Priority: HIGH
- Requested: 2026-08-05 by human (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal
Today the อ.6 item-8 line "เอกสารอื่น ๆ (ถ้ามี)" is **hardcoded** (always blank,
`checked=false`) — see SPEC-008 §7d / REQ decision. The stakeholder wants it **dynamic**:
show the names of the applicant's "other" attached documents on that line.

## Requirement (stakeholder's rule)
1. "Other documents" rows live in `T_T_REQUEST_DOC` and are identified by:
   **`DOCUMENT_ID = 0` AND `DOCUMENT_TYPE = 99` AND `REQUEST_CHECKLIST_ID = 0`**.
2. On the อ.6 "เอกสารอื่น ๆ (ถ้ามี)" line, show the **`DOCUMENT_NAME` of those rows,
   joined by commas** ("A, B, C").
3. Include **only rows that have a real attachment file** (same attachment rule as
   REQ-009: the `T_T_ATTACH_FILE` row exists). Rows with no attached file are **excluded**.
4. If there are no such attached other-documents → the line stays blank (as now).
5. Exclude soft-deleted rows (`STATUS <> 'D'`), consistent with the other queries.

> Human's words (Thai, verbatim): "เอกสารอื่นๆ คืออันนี้ สังเกตว่าไฟล์ที่มี document_id = 0
> and document_type = 99 and request_checklist_id = 0 นี่คือเอกสารอื่นๆ ให้นำชื่อเอกสารมา
> comma กันไปเรื่อยๆ และเอาแค่เอกสารที่มีไฟล์แนบเท่านั้น ถ้าไม่แนบ ไม่ต้องเอามา"

## Example (from the stakeholder — request 38314)
- Row `ID 47317`: DOCUMENT_ID=0, DOCUMENT_TYPE=99, REQUEST_CHECKLIST_ID=0,
  DOCUMENT_NAME="wdw", ATTACH_FILE_ID=40242 (has file), STATUS='A'
  → the line should show **"wdw"** (and comma-join if there were more with files).

## Acceptance Criteria
- [ ] For a request with attached other-documents, the "เอกสารอื่น ๆ" line shows their
      `DOCUMENT_NAME`s comma-joined (only the ones with a real attachment).
- [ ] Other-doc rows without an attachment are not shown; soft-deleted ('D') excluded.
- [ ] For a request with no attached other-documents, the line is blank (no regression).

## Constraints
- Backend-only; change is in the a6 builder's evidence section (replaces the hardcoded
  §7d line at `A6CheckListReportBuilder` ~L184-186 with a query-driven value).
- Reuse the REQ-009 attachment rule (`getAttachFile() != null`) for "has a file".
- Oracle 11.2-safe (no FETCH FIRST etc.).

## Out of Scope
- Other อ.6 items (already delivered/verified).

## Questions
- **Checkbox behavior:** when there is ≥1 attached other-document, should the line's
  checkbox be **ticked** (in addition to showing the names), or remain a write-in with
  just the names shown? (Recommend: tick when ≥1 shown, blank+unticked when none —
  confirm with Porter/human.)
- SA: confirm the DOCUMENT_NAME to display is the row's `DOCUMENT_NAME` (not
  `DOCUMENT_NAME_OTHER`) for these type-99 rows.

## Traceability
- Supersedes the static behavior documented in SPEC-008 §7d.
