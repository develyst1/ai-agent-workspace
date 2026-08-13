# REQ-014: อ.9 (A9) DB integration — build the real A9 report from Oracle

- Status: READY_FOR_SA
- Priority: HIGH
- Requested: 2026-08-05 by human (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal
SPEC-013 established that **อ.9 is mock-only**: `A9CheckListReportBuilder.createData()`
returns `buildMock(...)` — no repositories, no `buildFromDb`. So the อ.9 report cannot
show real applicant data at all. The stakeholder has decided to **build the full A9 DB
integration** (SPEC-013 "Part A"), the same way อ.6 was built.

## Requirement
1. `A9CheckListReportBuilder` must populate `A9CheckListReportData` from the Oracle
   `DIDPERMIT` database for a given requestId (`buildFromDb(long)` + a `createDataRaw(long)`
   test seam), replacing mock data for the real path.
2. Reuse the patterns and fixes already proven on อ.6:
   - tick rule = real attachment (REQ-009 `getAttachFile() != null`)
   - person queries filter `STATUS <> 'D'` (REQ-010)
   - permit duration from `T_T_LICENSE.PERIOD_TEXT` (REQ-005) where the a9 form has it
   - Oracle **11.2-safe** queries (no `FETCH FIRST`; list + firstOrNull)
3. Cover the whole อ.9 form: 13 evidence items (item 12 has sub-items (1)–(9)), applicant
   block, law references, signatures, components/annex — per the a9 template.
4. The seam `/api/v1/preview/checklist/a9/db/{requestId}` (REQ-013) is delivered as the
   final step once the builder is real.

## Acceptance Criteria
- [ ] For a real อ.9 requestId (e.g. 37940) the report is built from DB values — different
      requestIds produce different, correct content (no mock leakage).
- [ ] The อ.6-proven rules hold on อ.9: ticks reflect real attachments; deleted ('D') rows
      excluded; no Oracle-11.2-incompatible SQL.
- [ ] Every อ.9 form field maps to a documented source (SQL + field mapping, like SPEC-008).
- [ ] QA can render อ.9 from a plain requestId via the REQ-013 seam.

## Constraints
- Backend-only; Oracle **11.2** (no 12c-only SQL).
- No SQL/DB access by the team — all schema facts come from the human via DATA REQUEST.
- Do not regress อ.6 or the a9 **mock** preview (`/preview/checklist/a9`).

## Open DATA REQUESTs (from SPEC-013 — needed before/during the build)
1. **A9 evidence master checklist**: the `T_S_REQUEST_CHECKLIST` **GROUP_CODE** used by อ.9
   + its SEQ → form-item mapping (a6 uses `ReqSpecial`; is a9 the same group or another?).
2. **`applicant.destroyLocation`** ("สถานที่ทำการกำจัดหรือทำลาย", อ.9 page 1) — source table/column.
3. **item 5 factory-docs sub-structure** (ร.ง.4 / อ.2 / อ.7) — master rows + fields.
4. **item 12 (2) `person2`** (ผู้รับอาวุธ) — source table / `PER_TYPE` value (อ.6 has no person2).

## Out of Scope
- The seam itself (REQ-013, depends on this).
- Verifying/fixing อ.6 (delivered).

## Relationship
- **Blocks REQ-013** (a9/db seam). Same investigate → spec → build → QA pattern as อ.6.

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`)
