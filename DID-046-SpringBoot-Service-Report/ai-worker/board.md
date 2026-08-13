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
| REQ-011 | Make อ.6 item-8 "เอกสารอื่นๆ" dynamic (type-99 docs w/ file, comma-joined names) | HIGH | SPEC_DONE | Tanya (QA — IN_TEST: 38314 line = "wdw"); Q1 checkbox default=tick (human may override) |
| REQ-012 | อ.6 evidence sub-item render types (label-only vs label + dotted write-in) | MEDIUM | SPEC_DONE | Tanya (QA — IN_TEST: 38314 value on dotted line, no overlap) |
| REQ-013 | Add the อ.9 (a9) db preview seam (plain requestId, dev-only) | HIGH | SPEC_DONE | Tanya (QA — IN_TEST with REQ-014: /a9/db/33630) |
| REQ-014 | อ.9 (A9) DB integration — build the real A9 report from Oracle | HIGH | SPEC_DONE | Tanya (QA — IN_TEST: /a9/db/33630; also fixes download-mock defect) |
| REQ-015 | Fix NULL-STATUS regression in the อ.6 person filter (REQ-010 follow-up) | HIGH | SPEC_DONE | Tanya (QA — IN_TEST: /a6/db/37940 NULL persons appear; 38272 unchanged) |
| REQ-017 | NULL-safe document queries across ALL 7 report builders (pre-existing) | — | **CANCELLED** | — stakeholder decision 2026-08-05: won't fix (legacy data only); do not spec |
| REQ-018 | Make the dev-profile actually activate, then re-enable the preview gate | HIGH | READY_FOR_SA (step 1 only) | Sober — investigate profile activation NOW; restore gate only AFTER internal testing (Porter triggers) |
| REQ-016 | Investigate the อ.9 data model before building the A9 report | HIGH | DELIVERED | — GO: อ.9 = a6 model, data merely unseeded; field map + seed spec delivered (SPEC-016) |

## Tasks

| ID | Title | Source | Status | Assignee | Depends on |
|----|-------|--------|--------|----------|------------|
| TASK-001 | Restore the อ.6 (a6) mock preview endpoint | SPEC-002 | DONE | Jason (BE) | none |
| TASK-002 | Dev-profile-gate the preview endpoints (+ default local run to dev) | SPEC-004 | DONE | Jason (BE) | none |
| TASK-003 | Source อ.6 item 7 from T_T_LICENSE.PERIOD_TEXT (fix DEF-1) | SPEC-005 | DONE | Jason (BE) | none |
| TASK-004 | อ.6 real-attachment tick + person STATUS<>'D' filter (REQ-009+010) | SPEC-009 | DONE | Jason (BE) | none |
| TASK-005 | อ.6 item-8 "เอกสารอื่นๆ" dynamic (type-99+file, comma-joined) | SPEC-011 | DONE | Jason (BE) | none |
| TASK-006 | อ.6 "เอกสารอื่นๆ" Type B: value on dotted write-in line (jrxml) | SPEC-012 | DONE | Jason (BE) | none |
| TASK-007 | NULL-safe อ.6 person query (@Query, keep NULL, exclude only 'D') | SPEC-015 | DONE | Jason (BE) | none |
| TASK-008 | อ.9 DB integration — build a9 (mirror a6 + MOVE + EXAMPLE_SIGN, graceful) + seam | SPEC-014 | DONE | Jason (BE) | none |

## Blocked / waiting

| Item | Waiting on | Question (short) |
|------|-----------|------------------|
| REQ-005 close proof | RESOLVED | QA re-tested the rework → **TEST_PASSED**: 38272/38273 item 7 = PERIOD_TEXT (DR-1 exact), 38240 blank, all 200, 0 ORA-00933. DEF-1+DEF-2 closed → Porter to accept→DELIVERED. |
| ⚠️ REQ-004 gate OFF (deliberate) | Porter — re-enable after internal testing | Human commented out `@Profile("dev")` ON PURPOSE so the build can go up for internal testing (their dev-profile config attempts did not take effect). DEFERRED via REQ-018: do NOT restore it yet. Accepted risk: unauthenticated real-PII PDFs — **CONFIRMED internal-only network**, so contained. MUST be restored before production. |
| ENV FACT | noted | UAT DB = Oracle **11.2** — no `FETCH FIRST`, no 12c-only SQL. Applies to all future queries. |
| DEPLOY note (REQ-004) | Human | After REQ-004 redeploys, run the UAT :33000 instance with `dev` profile (jar → SPRING_PROFILES_ACTIVE=dev) or the /a6/db QA seam 401s. |
| Commit hold (PII) | RESOLVED | project-docs/ now gitignored (REQ-006 verified — no PII tracked). PII commit-hold lifted. |
| REQ-009/010 close proof | Tanya (QA) | Routed. QA (dev): /a6/db/38272 → item 1 unticked (row 46784) + doc-with-file still ticked; items 3/4 = only 92567/68/69. TEST_PASSED closes both. |
| REQ-010 Q3 audit (opt) | Porter → human | Do T_T_REQUEST_LAW_REF/DTL/EMPLOYER/LICENSE tables have unmapped STATUS='D' rows? (SPEC-009 Q3 SQL). If yes → follow-up filter; if no → REQ-010 AC#2 fully closed. |
| REQ-011 close proof | Porter → Tanya | TASK-005 code SA-reviewed + compiles. QA (dev): /a6/db/38314 → item-8 "เอกสารอื่น ๆ" line = "wdw" (row 47317), box ticked; a request with no attached type-99 docs → blank+unticked. TEST_PASSED closes. Q1 checkbox default=tick → human confirm. |
| REQ-012 close proof | Porter → Tanya | TASK-006 SA-reviewed: preview PDF (PyMuPDF text) shows "เอกสารอื่น ๆ (ถ้ามี)" + value as separate runs (Type-B renders); Type-A unchanged; compiles/paginates. QA (dev): /a6/db/38314 → value sits ON the dotted line (not inline), no label/value overlap; none → blank dotted line. |
| REQ-013 scope decision | RESOLVED | Human approved full A9 build → REQ-014 (Part A); REQ-013 seam stays BLOCKED as REQ-014's final step. |
| REQ-014 DATA REQUESTs #1-4 | RESOLVED | Answered: #1 no อ.9 group (data unseeded, not a different model); #2 destroyLocation = T_T_REQUEST_MOVE.DEST_PLACE_NAME; #3 docs exist on complete samples (33630); #4 only PER_TYPE 1/2 → person2 still open (row below). |
| A9 download-mock defect | FIXED in TASK-008 (QA to confirm) | A9 createData now decrypts→buildFromDb → the real /api/v1/download serves real อ.9 data. Verify body via /a9/db seam. |
| REQ-013/014 close proof | Tanya (QA) | TASK-008 SA-reviewed + compiles + boots. QA (dev): /a9/db/33630 → 200 อ.9 PDF, page-1 from T_T_REQUEST_MOVE (destroyLocation etc.), persons/law/sig/components present; evidence pages blank/unticked (master 'ReqMove' unseeded — EXPECTED); /a9/db/37940 → 200 graceful (no 500); /preview/checklist/a9 mock unchanged. Confirm permitDuration source on 33630. |
| A9 data-team seeding | Human (data team) | Seed T_S_REQUEST_CHECKLIST GROUP_CODE='ReqMove' (SPEC-016 20-SEQ table) + backfill T_T_REQUEST_DOC.REQUEST_CHECKLIST_ID → lights up อ.9 evidence pages 2-3. Confirm the GROUP_CODE name so Sober locks the constant. |
| REQ-015 close proof | Porter → Tanya | TASK-007 SA-reviewed + compiles (NULL-safe @Query findActivePersons). QA (dev): /a6/db/37940 → NULL-status persons now APPEAR in items 3/4; /a6/db/38272 → unchanged (only 92567/68/69). TEST_PASSED closes REQ-015. |
| ⚠️ doc-query NULL trap (cross-report) | CLOSED — REQ-017 CANCELLED by stakeholder (won't fix) | `findByRequestIdAndStatusNot` used by ALL 7 builders (a1/a3/a6/expand/open/personChange/planChange) drops NULL-status docs → could hide evidence in every report. Pre-existing, not our regression. Recommend a separate project-wide NULL-safe REQ (+ a DATA REQUEST to measure NULL-status docs). NOT folded into REQ-015. |
| REQ-016 seed spec | Human → data team | Porter delivered `project-docs/A9-checklist-seed-spec-for-data-team.md` (Thai): seed T_S_REQUEST_CHECKLIST GROUP_CODE='ReqMove' + 20 SEQ rows, backfill T_T_REQUEST_DOC.REQUEST_CHECKLIST_ID. Awaiting: GROUP_CODE name confirmation + person2 source. |
| REQ-014 build TASK | DONE (TASK-008) | Design final (SPEC-014): mirror a6 builder for a9 + applicant from T_T_REQUEST_MOVE + GRACEFUL DEGRADATION (empty master/NULL binding → blank+unticked, never throw). createData=decrypt→DB also fixes the download-mock defect. |
| REQ-014 person2 (item 12(2)) | RESOLVED (data dictionary) | Source = **T_T_REQUEST_EXAMPLE_SIGN** ("ตัวอย่างลายมือชื่อผู้รับอาวุธ"), its own table (NOT T_T_REQUEST_PER). Tick via ATTACH_FILE_ID (REQ-009). In TASK-008 §3. |
| REQ-014 open at build | Jason → Sober | permitDuration source for อ.9 (T_T_LICENSE.PERIOD_TEXT vs MOVE START/END) + exact item-12 MOVE-column mapping — confirm against 33630 output during the build. |
