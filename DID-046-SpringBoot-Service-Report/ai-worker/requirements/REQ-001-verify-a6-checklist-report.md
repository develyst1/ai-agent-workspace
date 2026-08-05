# REQ-001: Investigate & verify the อ.6 (a6) checklist PDF report

- Status: READY_FOR_SA
- Priority: HIGH
- Requested: 2026-08-05 by human (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal
The stakeholder wants confidence in the **อ.6 (a6) checklist PDF report** — the
document generated for weapons-factory permit form อ.6. They want to understand
how it works, confirm the output it produces is correct, and they **suspect
there may be a bug / defect** in it. This covers all three at once:
1. Explain how the อ.6 checklist report is produced end to end.
2. Verify the generated PDF is correct against expectations.
3. Find and pinpoint any defect if one exists.

## Requirement
The team must:
1. Document the end-to-end flow for the อ.6 checklist report: how a request maps
   to the อ.6 report code (RequestTypeResolver / ReportDefinition), which data is
   pulled from Oracle `DIDPERMIT`, which `.jasper` template is filled, and how the
   PDF is exported and returned.
2. Produce the อ.6 PDF using the stakeholder-provided sample requestId/data and
   inspect the output: are all fields, checkboxes, dates, and layout populated
   correctly per the อ.6 form?
3. Report any discrepancy between the produced output and what the อ.6 form should
   show, and identify the root cause (data source, template, mapping, or logic).

## Acceptance Criteria
- [ ] A written explanation of how the อ.6 checklist report is generated (flow +
      data source + template + which code paths are involved).
- [ ] The อ.6 PDF is generated from the provided sample and the actual output is
      described (what appears / what is missing or wrong).
- [ ] A clear verdict: either "อ.6 output is correct" with evidence, OR a list of
      concrete defects with their root cause and where in the code/template they
      originate.

## Constraints
- Backend-only Spring Boot service (Java 21, JasperReports 7.0.4, Oracle DIDPERMIT).
- **No direct access to the real Oracle DB.** Any real data (requestId, query
  results) comes from the human via DATA REQUEST / project-docs.
- `application.yml` contains real secrets — do not print or commit them.

## QA / test routing
- **Tanya (QA)** owns the run-and-verify legs (AC #2, #3) via `tests/TEST-*.md`.
- She runs **read-only** on local + a UAT-wired instance (no create/update/delete).
- **Environment (human-confirmed):** test against `http://localhost:33000/document-service`
  — this instance is **wired to the UAT DB**, so real-shaped data is available.
- **Invocation:** the encryption friction is handled by **REQ-003** (team encrypts
  the 34 plain ids, or provides a plain-id seam). QA waits on REQ-003 before AC#2/#3.
- **Test method (human directive 2026-08-05):** in addition to direct HTTP checks,
  Tanya must also test **with Playwright** — drive the report/preview endpoints in a
  real browser and verify the rendered อ.6 output — for higher-fidelity correctness
  vs the REQ-002 preview baseline. (Read-only browser GETs only.)
- Sequence: Sober first documents the flow and how the อ.6 report is invoked
  (endpoint, whether the requestId must be encrypted via CryptoService) → Porter
  relays the invocation details to Tanya → Tanya runs the samples and gives a
  `TEST_PASSED` / `TEST_FAILED` verdict. A `TEST_FAILED` returns to Porter, who
  routes any fix as a new REQ.

## Out of Scope
- Other report forms (อ.1, อ.3, อ.7, ...) — this REQ is อ.6 only.
- Fixing the defect: this REQ is investigate + verify. A fix, if needed, will be
  a separate follow-up REQ once the root cause is confirmed.

## Questions
- DATA REQUEST (open): the stakeholder said they will provide a **sample
  requestId and/or sample อ.6 data** to test with. Human will drop it into
  `../project-docs/`. Until then, verification (AC #2, #3) is blocked; the flow
  documentation (AC #1) can proceed from code.
  (SA Lead: answer here once the sample lands, or ask Porter for it.)
  > answer (Porter, 2026-08-05): sample data provided — 34 plain-integer
  > REQUEST_IDs in `../project-docs/REQ-001-a6-sample-request-ids.md`. They are
  > NOT encrypted; if the อ.6 endpoint expects an encrypted requestId, encrypt
  > via CryptoService first. Please confirm they all resolve to อ.6 and flag any
  > that don't. DATA REQUEST closed — verification is now unblocked.
