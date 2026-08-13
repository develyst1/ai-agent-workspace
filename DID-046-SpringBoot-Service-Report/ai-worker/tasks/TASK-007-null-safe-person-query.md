# TASK-007: NULL-safe อ.6 person query (fix REQ-010 regression)

- Source: SPEC-015
- Status: DONE
- Depends on: none

## What to do
Fix the person filter so NULL-status persons are kept (only `'D'` excluded). Repo:
`C:\Users\Admin\sa-project\service-report2\DID-046-SpringBoot-Service-Report`.
Scope = the person query only (do NOT touch the doc query — that's a separate REQ).

1. `domain/repository/RequestPerRepository.java` — replace
   `findByRequestIdAndPerTypeAndStatusNotOrderByIdAsc(Long, Integer, String)` with a JPQL `@Query`:
   ```java
   @org.springframework.data.jpa.repository.Query(
       "SELECT p FROM RequestPerEntity p " +
       "WHERE p.requestId = :requestId AND p.perType = :perType " +
       "AND (p.status IS NULL OR p.status <> 'D') ORDER BY p.id ASC")
   List<RequestPerEntity> findActivePersons(
       @org.springframework.data.repository.query.Param("requestId") Long requestId,
       @org.springframework.data.repository.query.Param("perType") Integer perType);
   ```
2. `report/checklist/a6/builder/A6CheckListReportBuilder.java` — `buildPersons` calls
   `requestPerRepository.findActivePersons(requestId, perType)` (drop the `STATUS_DELETED` arg).

## Definition of Done
- [ ] Person query = the NULL-safe `@Query`; `buildPersons` updated; `git diff` limited to
      `RequestPerRepository.java` + `A6CheckListReportBuilder.java`.
- [ ] Compiles: `./mvnw -o -DskipTests compile` (BUILD SUCCESS).
- [ ] Re-hand to QA (dev): `/a6/db/37940` → its NULL-status persons now APPEAR in items 3/4
      (were dropped before); `/a6/db/38272` → still only 92567/92568/92569 ('D' rows excluded — no regression).

## Implementation Notes
**Changed (2 files — exactly SPEC-015 scope):**
- `RequestPerRepository.java` — replaced the derived `findByRequestIdAndPerTypeAndStatusNotOrderByIdAsc`
  with a NULL-safe JPQL `@Query findActivePersons(requestId, perType)`:
  `WHERE p.requestId = :requestId AND p.perType = :perType AND (p.status IS NULL OR p.status <> 'D')
  ORDER BY p.id ASC` (imports `@Query`/`@Param` added). Keeps NULL-status (and any non-'D') rows,
  excludes only explicit `'D'`. Plain WHERE → Oracle 11.2-safe.
- `A6CheckListReportBuilder.buildPersons(...)` — single call site now
  `requestPerRepository.findActivePersons(requestId, perType)` (dropped the `STATUS_DELETED` arg).
- `STATUS_DELETED` constant is still used (3 refs) by the two doc queries — no orphan. Doc query
  NULL-trap deliberately NOT touched here (separate cross-report REQ per SPEC-015 §AC#3).

**Verification (BE boundary):**
- Compile: `./mvnw -o -DskipTests compile` → `BUILD SUCCESS`.
- Scope: `git status` = `RequestPerRepository.java` + `A6CheckListReportBuilder.java` only.

**Runtime proof = QA's leg (real UAT DB, not BE).** @Sober: please route to Tanya (dev profile):
- `/a6/db/37940` → its NULL-status persons now **APPEAR** in items 3/4 (were dropped by the
  `<> 'D'` regression).
- `/a6/db/38272` → still only 92567/92568/92569 ('D' rows excluded — no regression).
Closes REQ-015 on QA TEST_PASSED. REWORK back to me if the run shows a code issue.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE (code leg)** (Sober, 2026-08-05). Verified independently.
- `RequestPerRepository.findActivePersons` = JPQL `@Query` `(p.status IS NULL OR p.status <> 'D')`
  ORDER BY p.id — keeps NULL + non-'D', excludes only 'D'. Field names match `RequestPerEntity`
  (requestId/perType/status/id). Plain WHERE → 11.2-safe. ✅
- `buildPersons` call site → `findActivePersons(requestId, perType)` (arg dropped). ✅
- `STATUS_DELETED` still referenced 3× (the two doc queries) — no orphan; doc-query NULL trap
  correctly left out of scope (separate cross-report REQ per SPEC-015 §AC#3). ✅
- Scope = `RequestPerRepository.java` + `A6CheckListReportBuilder.java` only. Compile re-run by me
  → exit 0. (JPQL is validated at Hibernate bootstrap during QA's run.) ✅
- Runtime proof = QA's leg (real UAT). REQ-015 → SPEC_DONE; QA TEST_PASSED closes it.
