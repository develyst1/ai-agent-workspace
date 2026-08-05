# REQ-004: Secure the unauthenticated preview /db seam before production

- Status: READY_FOR_SA
- Priority: HIGH
- Requested: 2026-08-05 by human (dev@smartalliance.co.th)
- Deadline: none (must be resolved BEFORE any production deploy)

## Problem / Goal
During REQ-003, the SA Lead flagged a security exposure: the whole
`/api/v1/preview/**` chain is **permitAll (unauthenticated)**, and the seam
`GET /api/v1/preview/checklist/a6/db/{requestId}` reads **real UAT/production data
by a raw plain id with no auth**. The preview controller is self-marked TEMPORARY.
This is acceptable for the current local/UAT read-only QA, but if it reaches
**production** anyone could pull real report data without logging in. It must be
closed before any prod deploy.

## Requirement
1. Before production, the unauthenticated real-data preview seam(s) — at minimum
   `GET /api/v1/preview/checklist/a6/db/{requestId}` and any equivalent (e.g. a9)
   that read real DB data — must **not** be reachable without authorization in prod.
2. Acceptable approaches (SA Lead chooses): remove the temporary db-preview
   endpoint(s); or gate them behind a **dev/test Spring profile** so they don't
   exist in the prod build; or place them behind the same auth as `/api/v1/download`.
3. The **mock** previews (a6/a9 mock, no real data) may stay as-is unless SA Lead
   judges otherwise — the priority is the **real-data** seams.

## Acceptance Criteria
- [ ] In a production-profile build, the real-data preview db seam(s) either do not
      exist or require valid auth (no anonymous access to real report data).
- [ ] The local/dev/UAT QA workflow (REQ-001/REQ-003) still works under the
      dev/test profile — QA is not broken by the change.
- [ ] A short note documents what was done (removed vs profile-gated vs auth-added).

## Constraints
- Do not break the current REQ-001 QA run (keep the seam available in dev/test).
- Backend-only; reuse existing security config patterns (`SecurityConfig`,
  `ApiKeyFilter`).

## Out of Scope
- The อ.6 data-mapping defects (D1–D5) — separate REQ.
- Broader auth redesign — this REQ only closes the anonymous real-data preview hole.

## Priority note
HIGH because it is a real data-exposure risk, but it **does not block** current
QA (REQ-001) — sequence it before the next production deploy.

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`)
