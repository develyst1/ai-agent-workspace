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
| REQ-005 | DASHBOARD_MOVE_A10 — build Center backend for the อ.10 movement/delivery dashboard | MEDIUM | IN_SPEC (data resolved; TASK-005 done) | Jason (BE) — TASK-006 + TASK-007 |

## Tasks

| ID | Title | Source | Status | Assignee | Depends on |
|----|-------|--------|--------|----------|------------|
| TASK-001 | Rename DASHBOARD_LICENSE_MOVE JSON keys to DB column snake_case | SPEC-001 | DONE | Jason (BE) | none |
| TASK-002 | Make DASHBOARD_LICENSE_MOVE weapon-type dropdown config-driven (DB labels) | SPEC-002 | DONE | Jason (BE) | none |
| TASK-003 | Rename DASHBOARD_LICENSE_BOOK JSON keys to DB column snake_case | SPEC-003 | DONE | Jason (BE) | none |
| TASK-004 | Make DASHBOARD_LICENSE_BOOK book-type dropdown config-driven (DB labels, value=FORM_ID) | SPEC-004 | DONE | Jason (BE) | TASK-003 |
| TASK-005 | Scaffold DASHBOARD_MOVE_A10 (controller+models+search-filter+cascades) | SPEC-005 | DONE | Jason (BE) | none |
| TASK-006 | DASHBOARD_MOVE_A10 chart+table on the INFORM_MOVE backbone | SPEC-005 | IN_PROGRESS | Jason (BE) | TASK-005 |
| TASK-007 | Add T_R_TRANSPORT_TYPE entity + ประเภทการขนย้าย dropdown | SPEC-005 | REVIEW | Jason (BE) → Sober (SA) | none |

## Blocked / waiting

| Item | Waiting on | Question (short) |
|------|-----------|------------------|
| _(none — all REQ-005 DATA REQUESTs answered 2026-07-20)_ | — | Movement source resolved = INFORM_MOVE family. Ball is with Sober (revise SPEC-005) then Jason (TASK-006). |

## Resolved confirmations (2026-07-20)

- REQ-003: stakeholder OK'd keeping pivot `a8_paid…a17_unpaid` as-is + `name`→`trader_name`.
- REQ-004: stakeholder confirmed label=`FORM_CODE`, value=FORM_ID, frontend sends FORM_IDs.
- FE hand-off (acked): frontend sends `form_id` with FORM_IDs (`["8","10"]`, not `"อ.8"`) + adopts new snake_case keys; REQ-003+004 ship together.
- REQ-005 DATA REQUEST 2 (2026-07-20): `T_R_TRANSPORT_TYPE` = `TRANSPORT_TYPE_CODE` (code) + `TRANSPORT_TYPE_NAME` (Thai label). TASK-007 unblocked. Results in project-docs/data-req-2026-07-20-move-a10-results.md.
- REQ-005 DATA REQUEST 1 (2026-07-20): movement data source = **INFORM_MOVE family** (`T_T_INFORM_MOVE` + `T_T_INFORM_MOVE_DTL`; view `V_INFORM_MOVE_DTL_LOT`). `MOVE_DATE`/`MOVE_SEQ`/`QUANTITY`/`ALLOWED_QUANTITY`/`REF_LICENSE_NO` present. Sober to revise SPEC-005 data backbone. Columns + mapping in project-docs.
