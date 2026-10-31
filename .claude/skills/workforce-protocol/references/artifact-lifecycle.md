# Artifact lifecycle — numbering, traceability, statuses

Back to [SKILL.md §9](../SKILL.md). The desk's `PROTOCOL.md` § "Statuses" / "Artifact numbering"
wins if it differs — some desks add, rename or skip a status.

## Folders and IDs

| Artifact | Folder | ID (no teams) | ID (desk with teams) | Written by |
|---|---|---|---|---|
| Requirement | `requirements/` | `REQ-001-short-title.md` | `REQ-001-…` (one desk-wide sequence) | PM |
| Spec | `specs/` | `SPEC-001-…` | `SPEC-<T>-001-…` | SA |
| Task | `tasks/` | `TASK-001-…` | `TASK-<T>-001-…` | SA (engineer fills `## Implementation Notes`) |
| Test | `tests/` | `TEST-001-…` | `TEST-<T>-001-…` | QA |

- Zero-padded to 3, per type (per team where teams exist), **never reused, never renumbered**.
- Check the folder for the highest existing number of *your* sequence before creating one.
  No shared "highest + 1" counter across teams; the team prefix is the block.
- Never bulk find-and-replace across files another team owns.

## Traceability — every link is written in the child

`REQ → SPEC → TASK → code` and `REQ → TEST → verdict`. A SPEC names its REQ; a TASK names its SPEC;
a TEST names its REQ. An artifact with no parent is scope nobody asked for.

## Status sets

**REQ:** `DRAFT` → `READY_FOR_SA` → `IN_SPEC` → `SPEC_DONE` → `IN_TEST` → `TEST_PASSED` | `TEST_FAILED` → `DELIVERED`
(desk without QA: `SPEC_DONE` → `DELIVERED`)

**TASK:** `TODO` → `IN_PROGRESS` → `REVIEW` → `DONE` | `REWORK` (→ back to `IN_PROGRESS`)

**TEST:** `DRAFT` → `IN_TEST` → `TEST_PASSED` | `TEST_FAILED` | `NOT_TESTED`

Anything may be `BLOCKED (waiting: <role> — <question>)`; the question sits in the artifact's
`## Questions`.

## Who may set which

Only the owner of the next step moves a status forward.

| Role | Sets |
|---|---|
| PM | `DRAFT`, `READY_FOR_SA`, `DELIVERED` (REQ) |
| SA | `IN_SPEC`, `SPEC_DONE` (REQ); `TODO` and the review verdict `DONE` / `REWORK` (TASK) |
| Engineer (FE/BE) | `IN_PROGRESS`, `REVIEW` — on their own TASKs only |
| QA | `IN_TEST`, `TEST_PASSED`, `TEST_FAILED`, `NOT_TESTED` — **only QA** |

- `DONE` means the SPEC is met **and** the evidence is in the file.
- `DELIVERED` means the acceptance criteria are met and the evidence is in the files, accepted by
  the operator — not the customer (harness §4), and **never** "deployed".
- Setting a status you do not hold is a written-rule break → `FAILURES.md`.

## Board cell for an artifact

One line: `<ID> · <STATUS> · <YYYY-MM-DD> · <owner> · <pointer>` — no evidence, no history.
Replace the cell on change; closed rows are swept to the desk's archive.
