# REQ-006: gitignore project-docs/ to keep real PII out of the repo

- Status: READY_FOR_SA
- Priority: HIGH
- Requested: 2026-08-05 by human (dev@smartalliance.co.th)
- Deadline: before any commit

## Problem / Goal
QA evidence saved under `project-docs/` (e.g. `REQ-001-evidence/*.pdf`) contains
**real applicant PII** — names and national-ID numbers from the generated อ.6 PDFs.
`project-docs/` is currently **NOT gitignored**, so a future commit could leak real
PII into the repository history. This must be prevented before anyone commits.

## Requirement
1. `project-docs/` (the QA/stakeholder material folder) must be excluded from git so
   its contents — including PII-bearing evidence PDFs — are never committed.
2. The exclusion must not remove the folder from disk or break the team workflow
   (the folder stays as the shared drop/evidence location, just untracked).

## Acceptance Criteria
- [ ] `.gitignore` excludes `project-docs/` (or an equivalent rule that covers the
      evidence PDFs); `git status` shows no PII files as trackable.
- [ ] The folder and its files remain on disk and usable by the team.
- [ ] Confirmed nothing under `project-docs/` is already staged/committed.

## Constraints
- Repo-hygiene change only; no product-code impact.

## Out of Scope
- Purging PII from any history that already contains it (none expected — evidence
  was left untracked; SA to confirm).

## Traceability
- Source: TEST-002 Q4 (Tanya) + human decision 2026-08-05 = "gitignore project-docs/".

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`)
