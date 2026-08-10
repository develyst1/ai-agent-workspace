# TASK-004: อ.6 real-attachment tick (REQ-009) + person soft-delete filter (REQ-010)

- Source: SPEC-009
- Status: DONE
- Depends on: none

## What to do
Two scoped fixes in the อ.6 builder + supporting entity/repo. Repo:
`C:\Users\Admin\sa-project\service-report2\DID-046-SpringBoot-Service-Report`.
Change only what's listed; leave item 7 (REQ-005) and other fields alone.

### Fix A — tick reflects a REAL attachment (REQ-009)
`A6CheckListReportBuilder.hasFile(...)` currently trusts the FK column, so a dangling
`ATTACH_FILE_ID` (file removed but column still set) keeps the box ticked. Use the
already-mapped `attachFile` association (resolves to null for null/dangling FK):
```java
private boolean hasFile(RequestDocEntity d) {
    return d.getAttachFile() != null;   // real T_T_ATTACH_FILE row exists
}
```
(No other change — this one helper drives both evidence ticks and person idCard/houseReg ticks.)

### Fix B — person query excludes soft-deleted rows (REQ-010)
`RequestPerEntity` maps no `STATUS` column yet; add it, then filter.
1. `domain/entity/RequestPerEntity.java` — add:
   ```java
   @Column(name = "STATUS")
   private String status;
   ```
2. `domain/repository/RequestPerRepository.java` — replace the method with:
   ```java
   List<RequestPerEntity> findByRequestIdAndPerTypeAndStatusNotOrderByIdAsc(
           Long requestId, Integer perType, String status);
   ```
3. `A6CheckListReportBuilder.buildPersons(...)` — call it with the existing
   `STATUS_DELETED` constant ("D"):
   ```java
   List<RequestPerEntity> persons = requestPerRepository
           .findByRequestIdAndPerTypeAndStatusNotOrderByIdAsc(requestId, perType, STATUS_DELETED);
   ```

## Definition of Done
- [ ] `hasFile` uses `getAttachFile() != null`; `RequestPerEntity.status` added; person query
      filters `StatusNot("D")`; `buildPersons` updated. No other behaviour changed
      (`git diff` = A6CheckListReportBuilder + RequestPerEntity + RequestPerRepository).
- [ ] Compiles: `./mvnw -o -DskipTests compile` (show BUILD SUCCESS).
- [ ] Re-hand to QA (real-data proof, dev profile — QA's leg, not BE):
  - `/a6/db/38272` → **item 1 unticked** (row 46784 attachment removed); a doc that still
    has a file → ticked (no regression).
  - `/a6/db/38272` → **items 3/4 show only persons 92567/92568/92569**; deleted 92557–92566 gone.
- [ ] `:33000` is pre-existing — build/run on an alt port; don't disturb it.

## Implementation Notes
**Changed (exactly SPEC-009 scope — 3 files):**
- **Fix A (REQ-009)** `A6CheckListReportBuilder.hasFile(...)` — now `return d.getAttachFile() != null;`
  (real T_T_ATTACH_FILE row exists) instead of trusting `getAttachFileId()`. Handles null AND
  dangling FK. This one helper drives both evidence ticks and person idCard/houseReg ticks.
- **Fix B (REQ-010)**:
  - `RequestPerEntity` — added `@Column(name="STATUS") private String status;`.
  - `RequestPerRepository` — method now
    `findByRequestIdAndPerTypeAndStatusNotOrderByIdAsc(Long, Integer, String)`.
  - `buildPersons(...)` — calls it with the existing `STATUS_DELETED` ("D") constant, matching the
    doc query's `<> 'D'` convention. `StatusNot` (no First/Top/Limit) → 11.2-safe, plain WHERE.
- No other field/behaviour touched (item 7 / REQ-005 untouched).

**Verification (BE boundary):**
- Compile: `./mvnw -o -DskipTests compile` → `BUILD SUCCESS`.
- Scope: `git status` for this task = `A6CheckListReportBuilder.java` + `RequestPerEntity.java` +
  `RequestPerRepository.java` only (other working-tree files are the still-uncommitted TASK-001/002
  work).

**Runtime proof = QA's leg (real UAT DB, not BE).** @Sober: please route to Tanya (dev profile):
- `/a6/db/38272` → item 1 (row 46784, attachment removed) **unticked**; a doc with a real file
  still **ticked** (no regression).
- `/a6/db/38272` → items 3/4 show only active persons 92567/92568/92569; 'D' rows 92557–92566 gone.
Closes REQ-009 + REQ-010 on QA TEST_PASSED. I'll take REWORK if the run shows a code issue.

**FYI for Sober (open SPEC-009 questions, not blocking this fix):** Q1 (tick per-row vs per-item
aggregate — code stays per-item; repro satisfied either way), Q2 (status convention `<> 'D'`),
Q3 (DATA REQUEST: do LAW_REF/DTL/EMPLOYER/LICENSE tables have unmapped `STATUS='D'` rows → possible
follow-up to fully close REQ-010 AC#2). These are Porter/human decisions routed via you.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE (code leg)** (Sober, 2026-08-05). Verified independently.
- **Fix A:** `hasFile()` = `d.getAttachFile() != null` — real attachment-row check (handles null +
  dangling FK); drives evidence + person ticks. ✅
- **Fix B:** `RequestPerEntity.status` (`@Column STATUS`) added; repo =
  `findByRequestIdAndPerTypeAndStatusNotOrderByIdAsc(...)`; `buildPersons` calls it with
  `STATUS_DELETED` ("D"). Plain WHERE, no `First/Top/Limit` → Oracle-11.2-safe. ✅
- **Scope:** `git status` = exactly `A6CheckListReportBuilder` + `RequestPerEntity` +
  `RequestPerRepository` (other working-tree files = uncommitted TASK-001/002). ✅
- **Compile:** re-ran `./mvnw -o -DskipTests compile` myself → exit 0. ✅
- **Runtime proof (38272: item 1 untick + persons 92567-69 only)** = QA's real-UAT leg, not BE/SA.
  Routed to Tanya via Porter. REQ-009+010 → SPEC_DONE; QA TEST_PASSED closes both.
- Open SPEC-009 Q1/Q2/Q3 are Porter/human decisions (non-blocking; the fix satisfies both repros).
