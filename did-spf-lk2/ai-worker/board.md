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
| REQ-001 | Free "shipment" in LK2 API — rename form 9 to `license-transit` | HIGH | **DELIVERED** (2026-09-10) | — done, all 8 criteria observed |
| REQ-002 | Give `license-transit` its own Basic-auth section `LicenseTransit` + author the `services` INSERT for the stakeholder | HIGH | **DELIVERED** (2026-09-10) | — done, all 8 criteria met |
| REQ-003 | Point `lk2-client-tool/index.html` at `license-transit` | MEDIUM | **DELIVERED** (2026-09-10) — **this working copy only** (file is gitignored, `.gitignore:40`, never tracked; stakeholder chose local-only) | — done |

## Specs

| ID | Title | Source | Status |
|----|-------|--------|--------|
| SPEC-001 | Rename form-9 endpoint family `license-shipment` → `license-transit` | REQ-001 | DONE |
| SPEC-002 | Own Basic-auth section `LicenseTransit` for `license-transit` | REQ-002 | DONE |
| SPEC-003 | Point the LK2 client tool's form-9 entry at `license-transit` | REQ-003 | DONE |

**SPEC-002 deliverable, ready for Porter to relay now:**
`specs/SPEC-002-linkage-management-services-row.sql` — the `services` row INSERT
(REQ-002 item 6, which the stakeholder asked Sober to write, so it is a SPEC
deliverable and not a TASK). Text only; **no agent has run it or touched that DB.**
Raises two stakeholder decisions: Flyway `V18__` migration vs ad-hoc SQL, and that
the row should land before/with the LK2 release.

## Tasks

| ID | Title | Source | Status | Assignee | Depends on |
|----|-------|--------|--------|----------|------------|
| TASK-001 | Rename the form-9 endpoint family to `license-transit` | SPEC-001 | DONE | Jason (BE) | none |
| TASK-002 | Switch `license-transit` to its own `LicenseTransit` Basic-auth section | SPEC-002 | DONE | Jason (BE) | none |
| TASK-003 | Point the client tool's form-9 entry at `license-transit` | SPEC-003 | DONE | Jason (BE) | none |

SPEC-001 → DONE (its only TASK is DONE). Sober re-ran the build (277 warnings /
**0 errors**, unchanged from baseline), the acceptance grep, the full-tree
`git status`, and a substituted-diff proving the controller differs from the
original by only the 4 explanatory comment lines. Q-BE-1/Q-BE-2 answered in the
TASK's `## Review`.

## Blocked / waiting

| Item | Waiting on | Question (short) |
|------|-----------|------------------|
| ~~REQ-001 acceptance~~ | — | **CLOSED 2026-09-10.** SA-2 fully answered: live response body supplied and checked field-by-field against the model → `project-docs/2026-09-10-SA-2-response-body-and-services-row.md`. REQ-001 is `DELIVERED`. |
| ~~TASK-002 — password relay~~ | — | **CLOSED 2026-09-10.** Relayed to the stakeholder by pointer (`appsettings.json` → `LicenseTransit`, also in TASK-002 Implementation Notes). |
| ~~REQ-002 acceptance~~ | — | **CLOSED 2026-09-10.** SA-3 answered: `basicAuthSection = "LicenseTransit"` observed → `project-docs/2026-09-10-SA-3-kibana-licensetransit.md`. REQ-002 is `DELIVERED`. |
| ~~REQ-003 — export entry~~ | — | **CLOSED 2026-09-10. Stakeholder: leave it, do not touch** (*"เรื่อง2 ปล่อยไป ไม่แตะ"*). The tool's `LicenseExport` password stays stale and that button keeps returning 401 — accepted knowingly. No follow-up TASK. |
| ~~REQ-003 — gitignored file~~ | — | **CLOSED 2026-09-10. Stakeholder chose local-only** (*"อันนี้อ่ะแก้ได้เลย"*). `.gitignore:40` untouched, nothing committed. **Standing limitation: the form-9 fix exists in this working copy ONLY** — a fresh clone or another machine still has the broken entry. Never say "the tool works" without "on this machine". Un-ignoring it would be a new REQ, and the plaintext-credentials question first. |
| **Nothing blocked. All three REQs delivered.** | — | Only stakeholder-side item left, in their own repo: add `V18__seed_license_transit_service.sql` (idempotent) to `did-045-api-linkage-management`, or a rebuilt environment loses the `LicenseTransit` row. **No code change is needed in that repo** — PM verified it never calls the LK2 API. |
| — | | *(SA-1 and Q4 both CLOSED 2026-09-07 — stakeholder: leave the remaining "shipment" mentions alone, the word returns for form 18. No follow-up work.)* |

**⚠️ Release note for REQ-002 (SA finding, not a blocker).** `BasicAuthFilter`
resolves the section with a plain dictionary indexer
(`_config.BasicAuth[_sectionName]`, `Filters/BasicAuthFilter.cs:24`), so a
**missing** `LicenseTransit` section throws `KeyNotFoundException` → **HTTP 500 on
every call, not 401**. The controller change and the `appsettings.json` change are
therefore **one atomic release** — REQ-001 had zero code/config coupling, REQ-002
reintroduces it. The stale published copy `_build-out-lk2/appsettings.json` lacks
the new section: deploying code against it takes the endpoint down.
