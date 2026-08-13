# REQ-015: Fix the NULL-STATUS regression in the อ.6 person filter (REQ-010 follow-up)

- Status: READY_FOR_SA
- Priority: HIGH
- Requested: 2026-08-05 by human (dev@smartalliance.co.th) — raised by Porter on SA's finding
- Deadline: none

## Problem / Goal
REQ-010 added a soft-delete filter to the อ.6 person query
(`findByRequestIdAndPerTypeAndStatusNotOrderByIdAsc(..., "D")` → SQL `STATUS <> 'D'`).
In Oracle, **`NULL <> 'D'` evaluates to UNKNOWN**, so **rows with `STATUS = NULL` are also
excluded**. Real data has NULL-status person rows (e.g. request 37940's persons are both
`STATUS = null`), so those people would be **silently dropped** from อ.6 items 3/4.

This is a **regression the team introduced in REQ-010** — our test request (38272) only had
'A'/'D' statuses, so it did not catch the NULL case. It must be corrected.

## Requirement
1. The อ.6 person query must include rows whose `STATUS` is **NULL** as well as rows whose
   `STATUS` is anything other than `'D'`; only `'D'` (soft-deleted) rows are excluded.
   Correct rule: **`(STATUS IS NULL OR STATUS <> 'D')`** (SA: not expressible as a derived
   method name — use a JPQL `@Query`).
2. Audit the same latent trap in the pre-existing **document** query
   (`findByRequestIdAndStatusNot`, which drops NULL-status docs and could hide evidence rows)
   and fix it if it has the same exposure — report the finding to Porter either way.

## Acceptance Criteria
- [ ] A request whose active person rows have `STATUS = NULL` shows those persons in อ.6
      items 3/4 (they are no longer dropped).
- [ ] Soft-deleted (`STATUS = 'D'`) persons remain excluded — the REQ-010 behavior on 38272
      is unchanged (only 92567/92568/92569 shown).
- [ ] The document-query exposure is assessed and either fixed or documented as not applicable.
- [ ] Oracle 11.2-safe.

## Constraints
- Backend-only, scoped to the person (and possibly document) query rules.
- Do not change which persons are considered deleted — only the NULL handling.

## Out of Scope
- อ.9 work (REQ-014) — though the same corrected rule must be used there.

## Traceability
- Regression from REQ-010 / SPEC-009. Found while gathering อ.9 data (request 37940 persons
  have NULL STATUS). SA confirmed the SQL semantics and the exposure.

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`)
