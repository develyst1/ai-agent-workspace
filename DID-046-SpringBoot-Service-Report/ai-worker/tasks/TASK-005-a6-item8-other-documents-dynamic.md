# TASK-005: อ.6 item 8 "เอกสารอื่น ๆ (ถ้ามี)" — dynamic from attached type-99 docs

- Source: SPEC-011
- Status: DONE
- Depends on: none

## What to do
In `A6CheckListReportBuilder.buildEvidences(...)`, replace the **hardcoded** item-8
"เอกสารอื่น ๆ (ถ้ามี)" sub-row (~L184-186) with a data-driven value. Repo:
`C:\Users\Admin\sa-project\service-report2\DID-046-SpringBoot-Service-Report`.
**Only** this one sub-row changes — no other field, no new repository/entity.

Reuse the `docs` list already loaded in `buildEvidences`
(`requestDocRepository.findByRequestIdAndStatusNot(requestId, STATUS_DELETED)` — so
`STATUS <> 'D'` is already applied) and the existing `hasFile(d)` (REQ-009 rule).

1. Before building the item-8 EvidenceItem, compute the names:
   ```java
   String otherDocNames = docs.stream()
           .filter(d -> eq(d.getDocumentId(), 0)
                     && eq(d.getDocumentType(), 99)
                     && d.getRequestChecklistId() != null
                     && d.getRequestChecklistId() == 0L
                     && hasFile(d))
           .map(RequestDocEntity::getDocumentName)
           .filter(s -> s != null && !s.isBlank())
           .collect(Collectors.joining(", "));
   ```
2. Replace the static sub-row with:
   ```java
   String otherLabel = otherDocNames.isBlank()
           ? "เอกสารอื่น ๆ (ถ้ามี) ...................................................................................................."
           : "เอกสารอื่น ๆ (ถ้ามี)  " + otherDocNames;
   employerSubs.add(new EvidenceSub("employer", null, otherLabel,
           null, null, !otherDocNames.isBlank(), null));
   ```
   (`checked = true` when ≥1 name shown — SA default per SPEC-011 Q1.)

No new query (reuses `docs`) → Oracle 11.2-safe. `eq(Integer,int)` helper already exists.

## Definition of Done
- [ ] The static "เอกสารอื่น ๆ" sub-row is replaced by the query-driven value above;
      `git diff` is limited to `A6CheckListReportBuilder.java`.
- [ ] Compiles: `./mvnw -o -DskipTests compile` (show BUILD SUCCESS).
- [ ] Re-hand to QA (real-data proof, dev profile — QA's leg, not BE):
  - `/a6/db/38314` → item-8 "เอกสารอื่น ๆ" line shows **"wdw"** (box ticked).
  - A request with no attached type-99 other-docs → line **blank + unticked** (no regression).
- [ ] `:33000` pre-existing — run your build on an alt port; don't disturb it.

## Implementation Notes
**Changed (1 file, 1 block — exactly SPEC-011 scope):**
- `A6CheckListReportBuilder.buildEvidences(...)` — replaced the static item-8
  "เอกสารอื่น ๆ (ถ้ามี)" sub-row with the query-driven value from SPEC-011: filter the
  already-loaded `docs` list (no new query) by `DOCUMENT_ID=0 && DOCUMENT_TYPE=99 &&
  REQUEST_CHECKLIST_ID=0 && hasFile(d)` (real attachment, REQ-009 rule), map `getDocumentName`,
  drop null/blank, `Collectors.joining(", ")`. Label = names when present else the dotted
  write-in; `checked = !otherDocNames.isBlank()` (tick when ≥1 shown — SA default, SPEC-011 Q1).
- `docs` already applies `STATUS <> 'D'`; `eq(Integer,int)` helper reused. No new query/entity/repo
  → Oracle 11.2-safe. Verified getters exist: documentId(Integer), documentType(Integer),
  documentName(String), requestChecklistId(Long).
- No other field touched.

**Verification (BE boundary):**
- Compile: `./mvnw -o -DskipTests compile` → `BUILD SUCCESS`.
- Scope: `git status` for this task = `A6CheckListReportBuilder.java` only.

**Runtime proof = QA's leg (real UAT DB, not BE).** @Sober: please route to Tanya (dev profile):
- `/a6/db/38314` → item-8 "เอกสารอื่น ๆ" line shows **"wdw"** (row 47317), box ticked.
- A request with no attached type-99 other-docs → line **blank + unticked** (no regression).
Closes REQ-011 on QA TEST_PASSED. REWORK back to me if the run shows a code issue.

**FYI (open SPEC-011 questions — Porter/human, non-blocking):** Q1 (tick-when-≥1 vs write-in-only;
current = tick), Q2 (name field = `DOCUMENT_NAME`, not `DOCUMENT_NAME_OTHER` — confirm no type-99
row carries the name in `DOCUMENT_NAME_OTHER`). One-line change if either flips.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE (code leg)** (Sober, 2026-08-05). Verified independently.
- Filter matches the rule exactly: `DOCUMENT_ID=0 && DOCUMENT_TYPE=99 && REQUEST_CHECKLIST_ID=0`
  (Long `== 0L`, null-guarded) `&& hasFile(d)` (REQ-009 real-attachment rule). ✅
- `getDocumentName` → drop null/blank → `Collectors.joining(", ")`; label = names when present
  else the dotted write-in; `checked = !otherDocNames.isBlank()` (tick when ≥1, SPEC-011 Q1 default). ✅
- Reuses the already-loaded `docs` (STATUS<>'D' applied) → **no new query → Oracle 11.2-safe**. ✅
- Scope: `git status` = `A6CheckListReportBuilder.java` only. Compile re-run by me → exit 0. ✅
- Runtime proof (38314 → "wdw") = QA's real-UAT leg; routed to Tanya via Porter. REQ-011 → SPEC_DONE.
- Open SPEC-011 Q1 (checkbox tick vs write-in) / Q2 (DOCUMENT_NAME confirmed by example) are
  Porter/human confirms — non-blocking (1-line if either flips).
