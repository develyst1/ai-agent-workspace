# SPEC-006: gitignore project-docs/ to keep real PII out of the repo

- Source: REQ-006
- Status: DONE

## Overview
`project-docs/` (QA evidence + stakeholder material) holds real applicant PII
(names, national-ID) in generated อ.6 PDFs and was **not** gitignored in the
workspace repo. Fixed by ignoring the folder. This is a workspace-coordination
hygiene change (the same shared repo where board/log/specs live) — no product
code touched.

## State verified before change
- `project-docs/` was not in `.gitignore`.
- Only `DID-046-SpringBoot-Service-Report/project-docs/.gitkeep` was tracked; all
  evidence (`REQ-001-evidence/`, `REQ-002-evidence/`, `REQ-001-a6-sample-request-ids.md`)
  was **untracked** → no PII in history yet.
- The code repo (`sa-project/...`) has no `project-docs/` — only the workspace repo does.

## Change made
Appended to the workspace `.gitignore`:
```
# QA/stakeholder evidence & material — may contain REAL applicant PII
# (names, national-ID numbers in generated อ.6 PDFs). NEVER commit. (REQ-006)
# Folder stays on disk; already-tracked .gitkeep markers remain tracked.
project-docs/
```
Unanchored `project-docs/` matches the folder at any depth (covers every project's
`project-docs/`, not just DID-046) — PII hygiene applied repo-wide.

## Verification (evidence)
- `git status` no longer lists any file under `project-docs/` (evidence PDFs +
  sample-ids now ignored). ✅
- `git ls-files .../project-docs/` still shows `.gitkeep` → folder stays tracked/
  usable on disk. ✅
- `git ls-files | grep -i evidence/pdf/request-ids` → none → nothing PII committed
  in history. ✅ (No history purge needed.)

## AC mapping
- `.gitignore` excludes `project-docs/`, `git status` shows no PII files. ✅
- Folder + files remain on disk, usable. ✅
- Nothing under `project-docs/` was already staged/committed (only `.gitkeep`). ✅

## Note for Porter
The **commit hold can lift** re: PII — `project-docs/` is now ignored. (Separately,
Jason's code-repo changes for REQ-004/TASK-001/002 remain uncommitted in the code
repo; committing those is a distinct step and carries no PII.)

## Tasks
- None (executed as workspace hygiene; verified above).

## Questions
(none)
