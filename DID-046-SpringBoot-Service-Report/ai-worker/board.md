# Board — DID-046-SpringBoot-Service-Report

> Single source of truth. Update me at the end of every session (see PROTOCOL.md).

## Project info

- Description: Spring Boot service that generates Thai government PDF permit
  documents/checklists (private weapons-factory permits under the 2007 Act —
  forms อ.1, อ.3, อ.6, อ.7, ...) via JasperReports, reading from the Oracle
  `DIDPERMIT` database and rendering precompiled `.jasper` templates.
- Code repository: `C:\Users\Admin\sa-project\service-report2\DID-046-SpringBoot-Service-Report`
- Tech stack: Java 21, Spring Boot 3.5.x, Oracle JDBC (ojdbc11), JasperReports 7.0.4, springdoc-openapi
- Run: `./mvnw spring-boot:run` — port 33000, context-path `/document-service`
- Team: Porter (PM) · Sober (SA Lead) · Jason (BE) · **Tanya (QA — trial)**
- QA environment: local + a dev/local instance wired to the **UAT** DB;
  Tanya tests **read-only** (GET/read + report generation) — never
  create/update/delete, never production.

## Requirements

| ID | Title | Priority | Status | Owner of next step |
|----|-------|----------|--------|--------------------|
| REQ-001 | Investigate & verify the อ.6 (a6) checklist PDF report | HIGH | DELIVERED | — investigation complete: DEF-1 found+proven, visual leg done; product fix = REQ-005 |
| REQ-002 | Add/restore the อ.6 (a6) preview endpoint (mirror a9, no auth) | HIGH | DELIVERED | — (QA-passed local; code still uncommitted — commit/deploy separate) |
| REQ-003 | Let QA generate อ.6 from plain requestIds (no manual encryption) | HIGH | DELIVERED | — (no code; existing /a6/db seam, no key. Proof-in-use via REQ-001 run) |
| REQ-004 | Secure the unauthenticated preview /db seam before production | HIGH | DELIVERED | — (SA two-state verified: prod→401, dev→200; DEPLOY: run :33000 with dev profile; uncommitted) |
| REQ-005 | Fix อ.6 item 7 duration source (TOTAL_DAYS → T_T_LICENSE.PERIOD_TEXT) | HIGH | DELIVERED | — QA TEST_PASSED (DEF-1+DEF-2 closed, item 7 = PERIOD_TEXT, 11.2-safe). Code uncommitted; commit/deploy separate |
| REQ-006 | gitignore project-docs/ to keep real PII out of the repo | HIGH | DELIVERED | — (project-docs/ gitignored & verified; commit-hold lifted) |
| REQ-007 | Enable QA visual/Playwright verification of the อ.6 PDF | MEDIUM | DELIVERED | — Tanya used it (PyMuPDF render): D4 clean + parity holds; REQ-001 visual leg complete |
| REQ-008 | อ.6 SQL + field-mapping reference doc | MEDIUM | DELIVERED | — SPEC-008 reconciled w/ runtime SQL: 8 core queries + ORM-side-effect queries (loaded-not-printed); N+1 perf noted |
| REQ-009 | Fix อ.6 evidence checkbox to reflect real attachment (unticked when no file) | HIGH | SPEC_DONE | Tanya (QA — IN_TEST: 38272 item-1 untick proof) |
| REQ-010 | Fix อ.6 person query (items 3/4) missing STATUS<>'D' filter (+ audit others) | HIGH | SPEC_DONE | Tanya (QA — IN_TEST: 38272 persons 92567-69 only); Q1/Q3 → human |

## Tasks

| ID | Title | Source | Status | Assignee | Depends on |
|----|-------|--------|--------|----------|------------|
| TASK-001 | Restore the อ.6 (a6) mock preview endpoint | SPEC-002 | DONE | Jason (BE) | none |
| TASK-002 | Dev-profile-gate the preview endpoints (+ default local run to dev) | SPEC-004 | DONE | Jason (BE) | none |
| TASK-003 | Source อ.6 item 7 from T_T_LICENSE.PERIOD_TEXT (fix DEF-1) | SPEC-005 | DONE | Jason (BE) | none |
| TASK-004 | อ.6 real-attachment tick + person STATUS<>'D' filter (REQ-009+010) | SPEC-009 | DONE | Jason (BE) | none |

## Blocked / waiting

| Item | Waiting on | Question (short) |
|------|-----------|------------------|
| REQ-005 close proof | RESOLVED | QA re-tested the rework → **TEST_PASSED**: 38272/38273 item 7 = PERIOD_TEXT (DR-1 exact), 38240 blank, all 200, 0 ORA-00933. DEF-1+DEF-2 closed → Porter to accept→DELIVERED. |
| ENV FACT | noted | UAT DB = Oracle **11.2** — no `FETCH FIRST`, no 12c-only SQL. Applies to all future queries. |
| DEPLOY note (REQ-004) | Human | After REQ-004 redeploys, run the UAT :33000 instance with `dev` profile (jar → SPRING_PROFILES_ACTIVE=dev) or the /a6/db QA seam 401s. |
| Commit hold (PII) | RESOLVED | project-docs/ now gitignored (REQ-006 verified — no PII tracked). PII commit-hold lifted. |
| REQ-009/010 close proof | Tanya (QA) | Routed. QA (dev): /a6/db/38272 → item 1 unticked (row 46784) + doc-with-file still ticked; items 3/4 = only 92567/68/69. TEST_PASSED closes both. |
| REQ-010 Q3 audit (opt) | Porter → human | Do T_T_REQUEST_LAW_REF/DTL/EMPLOYER/LICENSE tables have unmapped STATUS='D' rows? (SPEC-009 Q3 SQL). If yes → follow-up filter; if no → REQ-010 AC#2 fully closed. |
