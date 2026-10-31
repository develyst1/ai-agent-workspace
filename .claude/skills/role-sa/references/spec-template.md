# SPEC template

File name and ID prefix come from the desk (e.g. `specs/SPEC-NNN-short-title.md`, or with a team
letter `SPEC-<T>-NNN` on a multi-team desk). Fill every section; write `none` rather than delete
one, so a reader can tell "considered and empty" from "forgotten".

```markdown
# SPEC-<ID>: <short title>
- Source: REQ-<ID>
- Team: <letter>            (only if the desk has teams)
- Status: DRAFT | ACTIVE | DONE

## Overview
Technical approach in a few sentences, and why this approach over the obvious alternative.

## What I read (evidence base)
- <repo logical name> · branch <name> · HEAD <sha> · read YYYY-MM-DD   (repos you do not own)
- <file>:<lines> — what it shows
- Reachability: every "the user can …" sentence below cites the render/exposure line
  (template, page, route/menu config), not only the method behind it.

## API / Interface Design (the contract)
Per seam: path, method, auth; request shape; response shape — exact casing of every field;
status codes; error bodies; idempotency/retry where it matters. Both sides implement this text.

## Data Model
Tables/columns/entities touched. The exact SQL. What happens to existing rows. Who runs it
(the human, on anything real — never an engineer, never the SA).

## Flow
Step by step, including error and edge cases. Mark which steps are user-visible.

## Non-functional
Only what is actually required: auth, validation, performance, logging, security surface.

## Risks, assumptions, unknowns
- RISK: <what> · likelihood/impact · designed out by <…> | raised to PM <when>
- ASSUMED (internal, user cannot see): <what> · why it is safe
- UNKNOWN: <what> · what would settle it (data request / question / spike)

## AC coverage
| AC | Carried by | Note |
|---|---|---|
| AC-1 | TASK-<ID> | |
| AC-2 | no work | already built — verified at <file:line> |

## Tasks
- TASK-<ID>: <title> — owner: BE | FE (depends on: — | TASK-<ID>)

## Questions
(Engineers ask here; answer as `> answer: …`. Business questions go to the REQ via the PM.)
```
