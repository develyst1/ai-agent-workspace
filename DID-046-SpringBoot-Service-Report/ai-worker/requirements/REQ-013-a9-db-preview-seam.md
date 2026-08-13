# REQ-013: Add the อ.9 (a9) db preview seam so a9 can be verified from a real requestId

- Status: READY_FOR_SA
- Priority: HIGH
- Requested: 2026-08-05 by human (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal
The stakeholder is moving on to verifying the **อ.9 (a9)** checklist report and tried
`GET http://localhost:33000/document-service/api/v1/preview/checklist/a9/db/37940`
— it does not work. Per SPEC-002/SPEC-003, **a9 only has the mock preview**
(`/preview/checklist/a9`); the raw-plain-id seam `/db/{requestId}` exists **only for a6**
(added in commit b0d9a84). So there is currently no way to render a9 from a real
requestId without encryption — the same blocker REQ-003 solved for a6.

## Requirement
1. Provide an a9 equivalent of the a6 db seam:
   `GET /api/v1/preview/checklist/a9/db/{requestId}` taking a **plain requestId**,
   returning the อ.9 PDF built from real DB data — mirroring the a6 seam's behavior.
2. Same access model as the existing preview endpoints (dev-profile-gated, no
   X-API-KEY) so QA can run it read-only — must NOT weaken the real
   `/api/v1/download` endpoint.
3. The PDF body must be the same one the real download endpoint produces for อ.9
   (same builder), so verification against it is meaningful.

## Acceptance Criteria
- [ ] `GET /api/v1/preview/checklist/a9/db/37940` (dev profile, no key) returns HTTP 200
      and a valid อ.9 PDF built from real data.
- [ ] Behavior parity with the a6 db seam (plain id, no decryption, no key, dev-only).
- [ ] Under a prod-profile build the seam is not anonymously reachable (REQ-004 rule holds).

## Constraints
- Backend-only; mirror the existing a6 seam + a9 builder rather than inventing a pattern.
- Dev-profile gating from REQ-004 must continue to apply (fail-closed in prod).
- Oracle 11.2-safe for any new query (no FETCH FIRST).

## Out of Scope
- Verifying อ.9 field correctness — that will be a separate REQ once the seam exists
  (the อ.6 equivalent was REQ-001).

## Relationship
- Same enabler role REQ-003 played for a6; unblocks อ.9 verification work.

## Questions
- SA: confirm whether an a9 DB builder already exists (equivalent of
  `A6CheckListReportBuilder.createDataRaw`) or whether one must be built — if the a9
  report currently only supports mock data, flag the size back to Porter before coding.
  > answer (Sober, 2026-08-05): **a9 is MOCK-ONLY** — `A9CheckListReportBuilder.createData()`
  > → `buildMock(...)`, no repository, no `buildFromDb`/`createDataRaw`. So the a9/db seam
  > (Part B, ~10 lines mirroring `previewA6Db`) is trivial, but it needs a **full A9 DB
  > builder first (Part A)** — a much bigger REQ than the a6 seam. Part A reuses ~60% of the
  > a6 patterns but has real Data-Dictionary unknowns (a9's 13-item evidence master GROUP_CODE
  > + SEQ mapping; destroyLocation source; item-5 factory-doc structure; item-12(2) person2
  > source). Full breakdown + recommended split (REQ-013a A9 DB integration → REQ-013b seam)
  > in **SPEC-013**. **Holding all BE work until you confirm scope + the DATA REQUESTs land** —
  > a seam over the mock builder would return the same mock PDF for every id (fails AC#1/#3).
