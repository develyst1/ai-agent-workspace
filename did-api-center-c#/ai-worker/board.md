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
| REQ-005 | DASHBOARD_MOVE_A10 — build Center backend for the อ.10 movement/delivery dashboard | MEDIUM | DELIVERED | — (done; live capture accepted 2026-07-20; 1 minor buyer-group `0` label optional) |
| REQ-006 | DASHBOARD_LICENSE_MOVE — re-source to approved-request-first + attach actual delivery (mirror of A10) | MEDIUM | SPEC_DONE (TASK-009 code done + reviewed; live capture to accept) | Porter (PM) — live capture |
| REQ-007 | Dashboard date fields — one key, formatted value (drop `_formatted` twin) | MEDIUM | SPEC_DONE (a10 accepted; license-move ships w/ REQ-006) | Porter (PM) — accept (trivial) |

## Tasks

| ID | Title | Source | Status | Assignee | Depends on |
|----|-------|--------|--------|----------|------------|
| TASK-001 | Rename DASHBOARD_LICENSE_MOVE JSON keys to DB column snake_case | SPEC-001 | DONE | Jason (BE) | none |
| TASK-002 | Make DASHBOARD_LICENSE_MOVE weapon-type dropdown config-driven (DB labels) | SPEC-002 | DONE | Jason (BE) | none |
| TASK-003 | Rename DASHBOARD_LICENSE_BOOK JSON keys to DB column snake_case | SPEC-003 | DONE | Jason (BE) | none |
| TASK-004 | Make DASHBOARD_LICENSE_BOOK book-type dropdown config-driven (DB labels, value=FORM_ID) | SPEC-004 | DONE | Jason (BE) | TASK-003 |
| TASK-005 | Scaffold DASHBOARD_MOVE_A10 (controller+models+search-filter+cascades) | SPEC-005 | DONE | Jason (BE) | none |
| TASK-006 | DASHBOARD_MOVE_A10 chart+table on the INFORM_MOVE backbone | SPEC-005 | DONE (code; re-run capture to accept) | Jason (BE) | TASK-005 |
| TASK-007 | Add T_R_TRANSPORT_TYPE entity + ประเภทการขนย้าย dropdown | SPEC-005 | SUPERSEDED (wrong source; entity removed in TASK-006 #4) | Jason (BE) | none |
| TASK-008 | MOVE_A10 dates → single formatted `issue_date` (drop `issue_date_formatted`) | SPEC-007 | DONE | Jason (BE) | none |
| TASK-009 | LICENSE_MOVE — move_qty attach + single formatted issue_date + col5 RequestType + col6 MoveRequestType + buyer=T_M_BUYER_AUTHORITY | SPEC-006 + SPEC-007 | DONE (code; live capture to accept) | Jason (BE) | none |

## Blocked / waiting

| Item | Waiting on | Question (short) |
|------|-----------|------------------|
| ~~DATA REQUEST 7 (purchase_document)~~ RESOLVED | — | Stakeholder: **there is no such data ("ไม่มี").** Field came from the frontend chart "แยกตามเอกสารการซื้อ" + the pre-existing backend placeholder ("ไม่ระบุ"). Decision: leave "ไม่ระบุ" (backend can't fill); removing the chart = frontend change, out of scope. CLOSED. |
| ~~col5 common-code vs hardcode (REQ-006)~~ RESOLVED | — | **Stakeholder chose common-code (dynamic) 2026-07-20.** col5 = `T_T_REQUEST.REQUEST_TYPE` → common-code group `RequestType` DB names ("คำขออนุญาตขนย้าย…(อ.9)", "…ในราชอาณาจักร (อ.15)", "…นอกราชอาณาจักร (อ.14)"). Matches TASK-009's plan — no hardcode, no rework. |
| ~~Buyer-group source (REQ-006)~~ RESOLVED | — | = `T_M_BUYER_AUTHORITY.AUTHORITY_GROUP_NO`, label via the 1/2/3/9 map (no separate name column — DATADIC:90; same as A10). In TASK-009 §E. Live-verify the license-side FK at the capture. |
| REQ-006 live capture (acceptance) | stakeholder (asked by Porter 2026-07-20) | TASK-009 code done+reviewed. Capture LICENSE_MOVE `/table`+`/chart` (issue-date range) → confirm: `move_qty` (col 12) now non-zero for delivered lines; `issue_date` single formatted; col5 ประเภทการขออนุญาต (RequestType names) + col6 ประเภทการขนย้าย (MoveRequestType) both populated + distinct; buyer-group populated (license-side `BUYER_AUTHORITY_ID`→`T_M_BUYER_AUTHORITY.ID`). All pass → REQ-006 DELIVERED (REQ-007 rides along). If license-side buyer FK misses → targeted follow-up (like A10). Awaiting JSON. |
| Buyer-group code `0` label (minor, optional) | stakeholder (unanswered) | Is code `0` (foreign "…Sdn Bhd") a real group (ต่างประเทศ/อื่นๆ) needing a label, or leave "ไม่ระบุ"? Non-blocking; REQ-005 delivered without it. |

## Parked / known notes

- **`purchase_document` / "เอกสารการซื้อ" (License Move chart "แยกตามเอกสารการซื้อ"):** stakeholder doesn't
  know what it is and confirms **no source data exists**. **Parked** — backend returns "ไม่ระบุ"; removing the
  chart would be a frontend change. Revisit only if a source surfaces. (Stakeholder: "ปล่อยไปก่อน note ไว้", 2026-07-20.)

## Resolved confirmations (2026-07-20)

- REQ-003: stakeholder OK'd keeping pivot `a8_paid…a17_unpaid` as-is + `name`→`trader_name`.
- REQ-004: stakeholder confirmed label=`FORM_CODE`, value=FORM_ID, frontend sends FORM_IDs.
- FE hand-off (acked): frontend sends `form_id` with FORM_IDs (`["8","10"]`, not `"อ.8"`) + adopts new snake_case keys; REQ-003+004 ship together.
- REQ-005 DATA REQUEST 2 (2026-07-20): `T_R_TRANSPORT_TYPE` = `TRANSPORT_TYPE_CODE` (code) + `TRANSPORT_TYPE_NAME` (Thai label). TASK-007 unblocked. Results in project-docs/data-req-2026-07-20-move-a10-results.md.
- REQ-005 DATA REQUEST 1 (2026-07-20): movement data source = **INFORM_MOVE family** (`T_T_INFORM_MOVE` + `T_T_INFORM_MOVE_DTL`; view `V_INFORM_MOVE_DTL_LOT`). `MOVE_DATE`/`MOVE_SEQ`/`QUANTITY`/`ALLOWED_QUANTITY`/`REF_LICENSE_NO` present. Sober to revise SPEC-005 data backbone. Columns + mapping in project-docs.
