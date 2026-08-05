# REQ-003: Let QA generate อ.6 from the plain requestIds (no manual encryption)

- Status: READY_FOR_SA
- Priority: HIGH
- Requested: 2026-08-05 by human (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal
REQ-001 verification is blocked only by invocation mechanics: the 34 sample ids
are **plain integers**, but the real อ.6 download endpoint expects an **AES-encrypted**
requestId. The stakeholder does **not** want to hand-encrypt the ids. They want the
**team** to remove this friction so QA (Tanya) can produce the อ.6 PDFs for the 34
plain ids and verify them against the REQ-002 preview baseline.

> Human's words (Thai, verbatim):
> 1. "เข้ารหัสเองกันเลย หรือไม่ก็ทำ ให้มันใส่แบบไม่ต้องเข้ารหัสได้สิ"
> 2. "url อะไรก็ให้ไปแล้วใช้ URL localhost ก็ได้ เพราะ มันเชื่อม db UAT อยู่"
> 3. "[X-API-KEY] ไม่รู้จำเป็นจริงมั้ย เพราะเคยไม่ใส่ก็ได้"

## Requirement
1. The team must provide a way for QA to generate the อ.6 checklist PDF for each of
   the **34 plain requestIds** (in `project-docs/REQ-001-a6-sample-request-ids.md`)
   **without the stakeholder manually encrypting anything**. Either approach is
   acceptable — SA Lead chooses the safest/simplest:
   - (a) the team encrypts the 34 ids with the app's own CryptoService and hands
     QA the encrypted values (no endpoint change), **or**
   - (b) provide a plain-id input path QA can call directly.
2. Testing runs against the **local instance at `http://localhost:33000/document-service`**,
   which the stakeholder confirms is **wired to the UAT database** — so real-shaped
   data is available without the human running SQL.
3. Resolve whether the download/generation call needs an `X-API-KEY`: if it does,
   the team makes a working test path available to QA; if it doesn't, that is
   documented. (Stakeholder recalls it working without a key before.)

## Acceptance Criteria
- [ ] QA can obtain a valid อ.6 PDF for a given plain requestId from the list,
      against `localhost:33000` (UAT-wired), without the human encrypting ids.
- [ ] The method is documented well enough for Tanya to run all 34 ids herself,
      read-only, and the X-API-KEY requirement is stated clearly (needed or not).
- [ ] No secret (crypto key, API key) is printed into any tracked file.

## Constraints
- **Security:** approach (b) must NOT weaken the real production download endpoint
  (do not make the live endpoint silently accept unencrypted ids). Prefer a
  **test/dev-only seam** (e.g. the existing `createDataRaw(long)`) or a
  local/dev-profile-gated path — SA Lead's call, but production security stays intact.
- Read-only for QA: generating a report is a read; no create/update/delete.
- Backend-only Spring Boot service; reuse existing code/patterns.

## Out of Scope
- The actual field-by-field correctness verdict — that stays in REQ-001; REQ-003
  only removes the invocation blocker.
- Fixing อ.6 data-mapping defects (D1–D5) — separate follow-up REQ.

## Relationship
- Unblocks **REQ-001** AC#2/#3 (which then runs against localhost/UAT).
- Uses the **REQ-002** preview as the correctness baseline.

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`)
