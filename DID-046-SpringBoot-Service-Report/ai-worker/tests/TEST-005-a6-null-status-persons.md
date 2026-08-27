# TEST-005: อ.6 person NULL-status regression fix (REQ-015)

- Source REQ: REQ-015 (NULL-STATUS persons must appear in items 3/4; REQ-010 follow-up)
- Status: TEST_PASSED
- Environments: uat-wired (read-only) — my own clean build of the current tree, `:33007`, `dev` profile
- Tested: 2026-08-24 by Tanya

## Method
Confirmed the fix is in the tree: `RequestPerRepository` now uses a JPQL `@Query`
`... AND (p.status IS NULL OR p.status <> 'D') ORDER BY p.id ASC` (Oracle-11.2-safe; the old derived
`StatusNot` produced `STATUS <> 'D'`, and `NULL <> 'D'` = UNKNOWN → NULL rows silently dropped).
Clean `./mvnw -o compile` (exit 0) → booted my own `:33007` (`dev`) → read-only GET (no key). Counted
persons in the items-3/4 block (between "เอกสารของผู้มีอำนาจลงนาม" and item-5 "สำเนาใบอนุญาต…ร.ง.4")
via text extraction, without dumping names (PII).

## Cases
| # | Case (AC) | id | Expected | Actual | Result |
|---|-----------|-----|----------|--------|--------|
| 1 | NULL-status persons appear | 37940 | its NULL-status persons (spec: "both STATUS=null") show in items 3/4 | HTTP 200; **2 persons present** (2 `เลขที่` lines / 2 `(n)` markers) — the NULL rows are no longer dropped | **PASS** |
| 2 | 'D' rows still excluded, no regression | 38272 | unchanged from REQ-010 = only the 3 active (92567/68/69) | HTTP 200; **3 persons** — identical to REQ-010/TEST-004 | **PASS** |
| 3 | Oracle 11.2-safe | both | no ORA error, report generates | both 200 `application/pdf`, JPQL executed clean (no ORA-00933-class error) | **PASS** |

## Reasoning (why case 1 proves the fix)
Old rule `STATUS <> 'D'` returns 0 persons for 37940 (both rows are NULL → `NULL <> 'D'` = UNKNOWN →
excluded). New rule `(STATUS IS NULL OR STATUS <> 'D')` includes them → the observed 2 persons is
exactly the fixed behavior, and matches the spec's "37940's persons are both STATUS=null" (2 rows).

## Not covered
- **AC#3 (document-query exposure):** REQ-015 also asks to audit the pre-existing document query
  `findByRequestIdAndStatusNot` for the same NULL trap. That is a code-side assessment (SA/BE) —
  I can only observe it read-only if given a request with NULL-status **document** rows. Not verified
  here; flagging to Porter as still-open unless SA already documented it.

## Verdict
**TEST_PASSED** — the REQ-010 NULL-status regression is fixed: 37940's NULL-status persons now render
in items 3/4, and 38272 is unchanged (soft-deleted 'D' rows still excluded). Oracle-11.2-safe.

## Evidence
`../project-docs/REQ-015-evidence/a6-{37940,38272}.pdf` (real, gitignored; PII — not rendered to PNG).
