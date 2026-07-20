# Board — did-api-center-c#

> Single source of truth. Update me at the end of every session (see PROTOCOL.md).

## Project info

- Description: DID API Center (C#)
- Code repository: `C:\Users\Admin\sa-project\spf\DidSpf.WebApi.Center` (ASP.NET Core WebApi — confirmed by stakeholder 2026-07-17)
- Team: Porter (PM) · Sober (SA Lead) · Jason (BE)

## Requirements

| ID | Title | Priority | Status | Owner of next step |
|----|-------|----------|--------|--------------------|
| REQ-001 | DASHBOARD_LICENSE_MOVE — align response keys to DB column names | MEDIUM | DELIVERED | — (done) |
| REQ-002 | DASHBOARD_LICENSE_MOVE — weapon-type dropdown codes configurable in appsettings | MEDIUM | DELIVERED | — (done) |
| REQ-003 | DASHBOARD_LICENSE_BOOK — align response keys to DB column names | MEDIUM | DELIVERED | — (done; stakeholder confirmed 2026-07-20) |
| REQ-004 | DASHBOARD_LICENSE_BOOK — book-type dropdown configurable in appsettings (DB labels) | MEDIUM | DELIVERED | — (done; stakeholder confirmed 2026-07-20) |

## Tasks

| ID | Title | Source | Status | Assignee | Depends on |
|----|-------|--------|--------|----------|------------|
| TASK-001 | Rename DASHBOARD_LICENSE_MOVE JSON keys to DB column snake_case | SPEC-001 | DONE | Jason (BE) | none |
| TASK-002 | Make DASHBOARD_LICENSE_MOVE weapon-type dropdown config-driven (DB labels) | SPEC-002 | DONE | Jason (BE) | none |
| TASK-003 | Rename DASHBOARD_LICENSE_BOOK JSON keys to DB column snake_case | SPEC-003 | DONE | Jason (BE) | none |
| TASK-004 | Make DASHBOARD_LICENSE_BOOK book-type dropdown config-driven (DB labels, value=FORM_ID) | SPEC-004 | DONE | Jason (BE) | TASK-003 |

## Blocked / waiting

| Item | Waiting on | Question (short) |
|------|-----------|------------------|
| _(none — all confirmations resolved 2026-07-20)_ | — | REQ-003/004 confirmed by stakeholder; FE hand-off note acked. |

## Resolved confirmations (2026-07-20)

- REQ-003: stakeholder OK'd keeping pivot `a8_paid…a17_unpaid` as-is + `name`→`trader_name`.
- REQ-004: stakeholder confirmed label=`FORM_CODE`, value=FORM_ID, frontend sends FORM_IDs.
- FE hand-off (acked): frontend sends `form_id` with FORM_IDs (`["8","10"]`, not `"อ.8"`) + adopts new snake_case keys; REQ-003+004 ship together.
