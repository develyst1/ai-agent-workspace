# SPEC-015: Fix the NULL-STATUS regression in the อ.6 person filter (REQ-010 follow-up)

- Source: REQ-015
- Status: ACTIVE

## Root cause (confirmed)
REQ-010 added `findByRequestIdAndPerTypeAndStatusNotOrderByIdAsc(..., "D")` → SQL
`status <> 'D'`. In Oracle `NULL <> 'D'` = UNKNOWN → NULL-status rows are **excluded**.
Real data has NULL-status persons (request 37940: both persons `STATUS = null`), so they are
silently dropped from อ.6 items 3/4. Our 38272 test only had 'A'/'D', so it missed this.

## Fix — JPQL `@Query` with the NULL-safe rule
Derived method names can't express "IS NULL OR <> 'D'". Replace the method with a `@Query`:
```java
@Query("SELECT p FROM RequestPerEntity p " +
       "WHERE p.requestId = :requestId AND p.perType = :perType " +
       "AND (p.status IS NULL OR p.status <> 'D') ORDER BY p.id ASC")
List<RequestPerEntity> findActivePersons(@Param("requestId") Long requestId,
                                         @Param("perType") Integer perType);
```
- Excludes **only** explicit `'D'`; keeps NULL and everything else.
- Oracle 11.2-safe (plain WHERE, no FETCH FIRST).
- `A6CheckListReportBuilder.buildPersons` calls `findActivePersons(requestId, perType)`
  (drop the `STATUS_DELETED` arg). One call site.

## AC#3 — document-query exposure ASSESSED → separate, broader REQ (not folded here)
The pre-existing doc query `findByRequestIdAndStatusNot(requestId, 'D')` has the **same NULL
trap**, and it is used by **A1, A3, a6, expand, open, personChange, planChange** (all report
builders) + the a6 person-doc variant `findByRequestIdAndRefIdAndDocumentIdInAndStatusNot`.
So NULL-status **docs** would be dropped from **every** report's evidence.
- This is **pre-existing** (not our REQ-010 regression) and **cross-report** (touches 7
  builders) → changing it is a bigger, higher-risk change that needs its own testing per report.
- **Recommendation: raise a SEPARATE REQ** for a project-wide "NULL-safe soft-delete" fix on
  the doc queries (and any other `StatusNot`), rather than expanding REQ-015. Whether it's
  actually exposed depends on whether real docs carry NULL status (unknown — a DATA REQUEST
  could measure it). REQ-015 stays scoped to the person filter we broke.

## Definition of Done (TASK-007)
- Person query is the NULL-safe `@Query`; `buildPersons` updated; `git diff` = RequestPerRepository
  + A6CheckListReportBuilder only.
- Compiles (`./mvnw -o -DskipTests compile`).
- QA (dev): a request with NULL-status persons now SHOWS them in items 3/4
  (`/a6/db/37940` — its persons are STATUS=null; they must appear); 38272 unchanged (only
  92567/92568/92569, 'D' rows still excluded).

## Tasks
- TASK-007: NULL-safe person query (depends on: —)

## Questions
- **@Porter:** recommend raising the separate doc-query NULL-safe REQ (cross-report, pre-existing).
  Want me to spec it, and/or a DATA REQUEST to measure NULL-status docs first? REQ-015 proceeds regardless.
