# REQ-009: อ.6 evidence checkbox must reflect whether the document actually has an attachment

- Status: READY_FOR_SA
- Priority: HIGH
- Requested: 2026-08-05 by human (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal
The evidence checklist ticks (page 2 of อ.6) are supposed to mean "this document
has been attached". The stakeholder tested this and it is **wrong in principle**:
they removed the attachment from a document row, and the checkbox **stayed ticked**
when it should have become **unticked**.

## Reproduction (from the stakeholder)
- Report: `GET http://localhost:33000/document-service/api/v1/preview/checklist/a6/db/38272`
- The document row edited (attachment removed) — `T_T_REQUEST_DOC` for request 38272,
  row `ID = 46784` (this drives **item 1 on page 2**):
  ```sql
  SELECT * FROM T_T_REQUEST_DOC WHERE REQUEST_ID = '38272' AND ID = '46784';
  -- stakeholder set/removed its ATTACH_FILE_ID (no attachment now)
  ```
- **Expected:** with no attachment, item 1's checkbox = **unticked**.
- **Actual (reported):** item 1's checkbox is still **ticked**.

## Requirement
1. The อ.6 evidence checkbox for a document item must be **ticked only when that
   document actually has an attachment file**, and **unticked when it does not**.
2. Correct the "checked" rule in the a6 builder to honor this (the SPEC-008 note says
   the tick reads the `ATTACH_FILE_ID` column via `hasFile()`; the observed behavior
   contradicts that — SA to find the real cause: e.g. it may tick on mere row
   existence, or another doc row for the same checklist item still has a file, or the
   `ATTACH_FILE_ID` emptiness isn't detected as expected).

## Acceptance Criteria
- [ ] For 38272 item 1 (doc row 46784 with the attachment removed) the checkbox
      renders **unticked**.
- [ ] A document WITH an attachment still renders **ticked** (no regression).
- [ ] The rule is stated clearly (ticked ⟺ that document has an attachment file).

## Constraints
- Backend-only; scope the change to the evidence "checked" logic in the a6 builder.
- Read-only for QA. The stakeholder edited the row in their own dev/UAT DB for the test.

## Out of Scope
- Other อ.6 items already verified (item 7 fix = REQ-005).

## Questions
- SA: is the intended rule strictly per-document-row (this row's ATTACH_FILE_ID), or
  per-checklist-item (ticked if ANY doc row for that checklist item has a file)? The
  stakeholder's expectation is that removing this row's attachment unticks it —
  confirm the exact rule with Porter if the code implies otherwise.
