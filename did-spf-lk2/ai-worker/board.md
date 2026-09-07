# Board — did-spf-lk2

> Single source of truth. Update me at the end of every session (see PROTOCOL.md).

## Project info

- Description: `DidSpf.WebApi.LK2` — outward read-only "Linkage Center 2" API
  (.NET 8, Basic-auth + header audit, Logstash), one project inside the
  `did-spf` solution.
- Code repository: logical name **`did-spf`** (solution root; this project is
  the `DidSpf.WebApi.LK2` folder under it) — real absolute paths per machine
  live in the workspace-root `machine.local.md` (see workspace CLAUDE.md
  "Paths & machines"); never hardcode a path here.
- Team: Porter (PM) · Sober (SA Lead) · Jason (BE)

## Requirements

| ID | Title | Priority | Status | Owner of next step |
|----|-------|----------|--------|--------------------|
| REQ-001 | Free "shipment" in LK2 API — rename form 9 to `license-transit` (BasicAuth key stays) | HIGH | SPEC_DONE | Porter (PM) — 7/8 criteria evidenced, awaiting response bodies |
| REQ-002 | Give `license-transit` its own Basic-auth section `LicenseTransit` (supersedes REQ-001 item 5) + author the `services` INSERT for the stakeholder | HIGH | READY_FOR_SA | Sober (SA Lead) |

## Specs

| ID | Title | Source | Status |
|----|-------|--------|--------|
| SPEC-001 | Rename form-9 endpoint family `license-shipment` → `license-transit` | REQ-001 | DONE |

## Tasks

| ID | Title | Source | Status | Assignee | Depends on |
|----|-------|--------|--------|----------|------------|
| TASK-001 | Rename the form-9 endpoint family to `license-transit` | SPEC-001 | DONE | Jason (BE) | none |

SPEC-001 → DONE (its only TASK is DONE). Sober re-ran the build (277 warnings /
**0 errors**, unchanged from baseline), the acceptance grep, the full-tree
`git status`, and a substituted-diff proving the controller differs from the
original by only the 4 explanatory comment lines. Q-BE-1/Q-BE-2 answered in the
TASK's `## Review`.

## Blocked / waiting

| Item | Waiting on | Question (short) |
|------|-----------|------------------|
| REQ-001 acceptance — 1 criterion unobserved (was 2) | Porter → human | **SA-2 DATA REQUEST — Kibana part DONE** (stakeholder supplied it 2026-09-07, archived at `project-docs/2026-09-07-SA-2-kibana-audit-record.md`; audit-log criterion now **observed**). Still needed: the **response bodies** of the 5 HTTP calls, since the audit event never logs the payload. Blocks only "same data, same shape" — and therefore `DELIVERED`. |
| — | | *(SA-1 and Q4 both CLOSED 2026-09-07 — stakeholder: leave the remaining "shipment" mentions alone, the word returns for form 18. No follow-up work.)* |
