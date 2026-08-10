# REQ-008: อ.6 SQL + field-mapping reference doc

- Status: READY_FOR_SA
- Priority: MEDIUM
- Requested: 2026-08-05 by human (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal
The stakeholder wants to understand, for a given อ.6 request (e.g. requestId 38273
via `GET /api/v1/preview/checklist/a6/db/38273`), **exactly which SQL runs and where
each piece of data lands on the printed อ.6 form**. SPEC-001 documents the flow at a
table level; the stakeholder now wants a concrete, verbatim reference.

## Requirement
1. Produce a reference doc that lists, for the อ.6 report:
   - Each SQL query the builder issues (the actual/effective SQL — from the JPA
     repositories in `A6CheckListReportBuilder.buildFromDb` and related repos),
     with the bind parameter(s) (requestId, referenceNo, etc.).
   - For each query result, **which อ.6 form field / section / subreport cell it
     populates** (front items 1–8, law refs, signatures, evidence checklist,
     annex table).
2. Include the recently-fixed item-7 path (`T_T_LICENSE.PERIOD_TEXT`, join by
   REQUEST_ID, latest-by-ID) — REQ-005.
3. Presentable as a table/section list (form field → query → table.columns).

## Acceptance Criteria
- [ ] Every อ.6 form section maps to its source query + table.columns.
- [ ] The actual SQL (or the effective SQL Hibernate emits) is shown for each, with
      bind params — not just table names.
- [ ] Item-7 reflects the REQ-005 fix (PERIOD_TEXT), not the old TOTAL_DAYS.

## Constraints
- Documentation only — no product-code change.
- Read from the real code/repos; no need to hit the DB (SA can capture effective SQL
  from the builder + repository method names + `show_sql` if run by QA read-only).

## Out of Scope
- Any code change; performance tuning of the queries.

## Traceability
- Extends SPEC-001 §AC#1 (flow) with concrete SQL + field mapping.

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`)
