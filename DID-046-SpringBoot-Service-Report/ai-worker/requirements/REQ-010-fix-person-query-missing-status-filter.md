# REQ-010: อ.6 person query (items 3/4) must exclude deleted rows (STATUS='D')

- Status: READY_FOR_SA
- Priority: HIGH
- Requested: 2026-08-05 by human (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal
The persons shown in อ.6 items 3/4 come from `T_T_REQUEST_PER`, but that query does
**not** filter out soft-deleted rows (`STATUS = 'D'`), unlike the document query
which already uses `STATUS <> 'D'`. As a result the report can include **deleted /
superseded person rows**, showing wrong or duplicated people on the form.

## Reproduction (from the stakeholder)
- `SELECT * FROM T_T_REQUEST_PER WHERE REQUEST_ID = '38272'` returns many rows:
  - most are soft-deleted: `STATUS = 'D'` (row IDs 92557–92566)
  - only a few are active: `STATUS = 'A'` (row IDs 92567, 92568, 92569)
- SPEC-008 §7c documents the query as
  `... T_T_REQUEST_PER WHERE REQUEST_ID = :req AND PER_TYPE = :perType ORDER BY ID` —
  **no `STATUS <> 'D'`**, so 'D' rows leak into the report.
- Contrast: the doc query (§7b) already filters `STATUS <> 'D'` → the person query is
  inconsistent with it.

## Requirement
1. The person query for อ.6 items 3/4 must return **only active rows** (exclude
   `STATUS = 'D'`), consistent with the document query's `STATUS <> 'D'` rule.
2. **Audit the other a6 builder queries** for the same missing soft-delete filter
   (e.g. law refs, request-dtl/annex, employer, license, license-inform) and fix any
   that also leak `STATUS = 'D'` rows — flag findings to Porter.

## Acceptance Criteria
- [ ] For 38272, items 3/4 list only the active persons (STATUS='A'), not the
      deleted ones — no deleted/duplicate people on the อ.6 form.
- [ ] Any other a6 query missing the soft-delete filter is identified and fixed (or
      documented as "no STATUS column / not applicable").
- [ ] No regression on requests whose person rows are all active.

## Constraints
- Backend-only; scope to the a6 builder's data queries. Confirm the soft-delete
  convention value(s) with the code (`'D'` = deleted; active likely `'A'`).
- Read-only for QA verification (stakeholder already has the data).

## Out of Scope
- Non-a6 reports.

## Relationship
- Same class of evidence/persons-section defect as REQ-009 (checkbox). SA may bundle
  REQ-009 + REQ-010 into one SPEC/TASK if efficient — Porter is fine with that.

## Questions
- SA: confirm the exact active/deleted convention (is it `STATUS <> 'D'`, or
  `STATUS = 'A'`? are there other statuses like rejected to exclude?).
