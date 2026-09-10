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
| REQ-004 | Usage manual (Markdown) for the customer's tech team — deployed Swagger at `/service-did-dopa` | HIGH | SPEC_DONE | Porter (PM) — acceptance check (example placeholders are by design, per REQ-004 Out of Scope) |
| REQ-005 | A known-good example request for every endpoint (feeds REQ-004) | HIGH | IN_SPEC — **call sheet delivered, awaiting the stakeholder's run** | Stakeholder (via Porter) — run the sheet, drop output in `project-docs/` (SA-7) |

## Specs

| ID | Title | Source | Status |
|----|-------|--------|--------|
| SPEC-001 | Rename form-9 endpoint family `license-shipment` → `license-transit` | REQ-001 | DONE |
| SPEC-002 | Own Basic-auth section `LicenseTransit` for `license-transit` | REQ-002 | DONE |
| SPEC-003 | Point the LK2 client tool's form-9 entry at `license-transit` | REQ-003 | DONE |
| SPEC-004 | Customer-facing usage manual (Thai .md) — **owns the code-verified fact table** | REQ-004 | DONE |
| SPEC-005 | Call sheet for a known-good example per endpoint (reuses SPEC-004's fact table) | REQ-005 | ACTIVE — step 1 (call sheet) DONE; **step 3 TASK not yet writable** (needs the stakeholder's output) |

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
| TASK-004 | Write the customer LK2 API usage manual (Thai, Markdown) | SPEC-004 | DONE | Jason (BE) | none |
| TASK-005 | Write the call sheet the stakeholder will run | SPEC-005 | DONE | Jason (BE) | none |

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
| ~~REQ-005 — who calls~~ | — | **CLOSED 2026-09-10: option (ก), the stakeholder runs the calls** (*"ก. ฉันยิงเอง"*). **No PROTOCOL exception was granted — no agent calls `e-connect-did.mod.go.th`, ever.** Still open with the stakeholder, non-blocking: **Q5-2**, a `SELECT` naming one trader/licence per form that satisfies each endpoint's filter, so each example is one confirming call instead of a guessing session. |
| REQ-004 / REQ-005 — SA-6 & SA-8 | — | **CLOSED 2026-09-10 by the stakeholder.** **SA-8:** no API change — `licenseNo` stays **mandatory** on import / move / sale-domestic / sale-international; the manual is right to say so. **SA-6:** `DidSpf.WebApi.LK2/CLAUDE.md` is **not to be touched** (*"claude ไม่ต้องไปแก้ ไปแตะ"*). ⚠️ **Standing warning for any future agent:** four statements in that file are verified wrong — the `X-Office-Request` integer rule, the `X-User-Request` 13-digit rule, `UserAgentPrefix` enforcement, and the response-model table. Verify against code, and **never "fix" `UserAgentPrefix` by enforcing it** — it is dead config and enforcing it breaks every caller. |
| ~~REQ-004 — language & base URL~~ | — | **CLOSED 2026-09-10.** Manual is in **Thai** (identifiers stay English); customer base URL is **`https://e-connect-did.mod.go.th/service-did-dopa`** + `/api/v1/<endpoint>`; the local `/servicelk2` must not appear. API is read-only, all `GET`. Q4-3 (deployed credentials) is moot — the team never calls it. |
| **REQ-005 will NOT close when TASK-005 does** | Porter (plan around it) | **SA-7.** TASK-005 delivers the **call sheet** with blank, marked search values — correct output, since nobody here may call the host or run SQL. But every REQ-005 acceptance criterion describes **step 3** ("status code and response body **actually observed**"), which needs the stakeholder's step-2 run first. REQ-005 stays open after TASK-005 is `DONE`; compiling the observed results is a later TASK. **Q5-2 is worth pushing before step 2** — a guessed value returning 0 rows is indistinguishable from an endpoint with no data. |
| SPEC-004 fact table wrong on the `401` body | Sober (SA) | **Q-BE-7** (TASK-004). Table says `401` has **no body**; observed it returns a 165-byte `application/problem+json` ProblemDetails (framework behaviour from `[ApiController]`). BE wrote **neither** claim as fact — the manual says only "don't depend on the `401` body". Needs SA's ruling on wording. |
| `CLAUDE.md` inaccuracy #4 — response-model table | Sober (SA) → fold into SA-6 | **Q-BE-8.** `DidSpf.WebApi.LK2/CLAUDE.md` claims a `LicenseSaleResponse` class in `LicenseMoveModel.cs` and `PurchasePermit[]` on `LicenseMoveResponse`. Neither exists: the real classes are `LicenseSaleDomesticResponse` / `LicenseSaleInternationalResponse` in their own files, and Move has `locationOrigin`/`locationDestination`. Manual unaffected (written from the model classes). |
| REQ-005 can yield at most 8 of 10 examples | Porter (set expectations pre-run) | **Q-BE-9** (TASK-005). `license-transit` + `license-export` return `data: []` regardless of search value (`STATUS=30` vs query's `STATUS=40`), so two of the ten "examples" will be empty arrays. Not fixable in TASK-005 — changing the filter is an API change. Pairs with SA-7. |
| `CLAUDE.md` states 3 things the code does not do | Porter → human | **SA-6** (REQ-004 Questions, non-blocking). Verified in `RequestAuditMiddleware`: `X-Office-Request` **not** integer-validated (`int.TryParse` only fills the log field `officeId`), `X-User-Request` **not** 13-digit-validated — both non-empty only — and **`UserAgentPrefix` is dead config, read nowhere**. The customer manual is unaffected (TASK-004 writes from SPEC-004's fact table), but `CLAUDE.md` is what every future agent reads first. SA recommends a small **separate** TASK to fix it — deliberately not bundled into a customer-facing TASK. |
| REQ-004 item 5 understates the API | Porter → human | **SA-8** (REQ-004 Questions, non-blocking). `licenseNo` is **mandatory** — not merely accepted — on `license-import`/`move`/`sale-domestic`/`sale-international`; omitting it returns `400 REQUIRE_LICENSE_NO` before the trader/personal check. The manual will say mandatory. If the stakeholder wants it optional, that is an **API change and a new REQ**, not a manual wording choice. |
| *(carried over)* | Stakeholder, own repo | Add `V18__seed_license_transit_service.sql` (idempotent) to `did-045-api-linkage-management`, or a rebuilt environment loses the `LicenseTransit` row. **No code change needed in that repo** — PM verified it never calls the LK2 API. |
| — | | *(SA-1 and Q4 both CLOSED 2026-09-07 — stakeholder: leave the remaining "shipment" mentions alone, the word returns for form 18. No follow-up work.)* |

**⚠️ Release note for REQ-002 (SA finding, not a blocker).** `BasicAuthFilter`
resolves the section with a plain dictionary indexer
(`_config.BasicAuth[_sectionName]`, `Filters/BasicAuthFilter.cs:24`), so a
**missing** `LicenseTransit` section throws `KeyNotFoundException` → **HTTP 500 on
every call, not 401**. The controller change and the `appsettings.json` change are
therefore **one atomic release** — REQ-001 had zero code/config coupling, REQ-002
reintroduces it. The stale published copy `_build-out-lk2/appsettings.json` lacks
the new section: deploying code against it takes the endpoint down.
