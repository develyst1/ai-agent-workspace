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
| REQ-011 | Make อ.6 item-8 "เอกสารอื่นๆ" dynamic (type-99 docs w/ file, comma-joined names) | HIGH | **DELIVERED** | — closed on real output: a6-38272 renders `เอกสารอื่น ๆ (ถ้ามี) ทดสอบ2, ทดสอบ 1` (dynamic, comma-joined, multi-doc) |
| REQ-012 | อ.6 evidence sub-item render types (label-only vs label + dotted write-in) | MEDIUM | **DELIVERED** | — closed on real output: a6-38272 Type-B value sits on the write-in line, no label/value collision; Type-A items still label-only |
| REQ-013 | Add the อ.9 (a9) db preview seam (plain requestId, dev-only) | HIGH | SPEC_DONE | Tanya (QA — IN_TEST with REQ-014: /a9/db/33630) |
| REQ-014 | อ.9 (A9) DB integration — build the real A9 report from Oracle | HIGH | **DELIVERED (superseded)** | — every part shipped elsewhere: DB build TASK-008, page-1 TASK-012/015, item-7 REQ-023, download-mock + resolver REQ-024 (proven on real data), variants REQ-019→REQ-026. No code remains. |
| REQ-015 | Fix NULL-STATUS regression in the อ.6 person filter (REQ-010 follow-up) | HIGH | SPEC_DONE | Tanya (QA — IN_TEST: /a6/db/37940 NULL persons appear; 38272 unchanged) |
| REQ-017 | NULL-safe document queries across ALL 7 report builders (pre-existing) | — | **CANCELLED** | — stakeholder decision 2026-08-05: won't fix (legacy data only); do not spec |
| REQ-018 | Make the dev-profile actually activate, then re-enable the preview gate | HIGH | IN_SPEC (step1 DONE) | Porter — step-1 activation VERIFIED+documented (SPEC-018); step 2 (restore gate) DEFERRED until Porter triggers |
| REQ-019 | อ.9 has TWO form variants — split by MOVE_REQUEST_TYPE (2=destroy, else=transport) | HIGH | DELIVERED | — BOTH variants verified on REAL DB: 38336 (transport page-1) + 37956 (item-12 populated from all 5 tables) + destroy unaffected; 0 null |
| REQ-020 | Finish อ.9 DESTROY by construction — checklist LOCKED in report, ticks from DB, ZERO mock | HIGH | SPEC_DONE (code COMPLETE + real-DB verified) | — remaining close needs type-2 sample + ReqMoveDestroyer backfill (human/data-team), no code left |
| REQ-021 | อ.6 parity — signature block always prints + sweep literal "null" leaks | HIGH | DELIVERED | — verified on REAL DB by human: a6-38240 4 blank slots, a6-38272 4 signers intact, 0 "null" |
| REQ-022 | อ.14–อ.16 checklist report (ขาย/จำหน่าย โดยส่งออกนอกราชอาณาจักร) | HIGH | SPEC_DONE (code COMPLETE) | Porter → QA: a14 foundation+item-12 DONE+SA-verified. `ReqSaleInt` ALREADY SEEDED (15 rows) — a14 item-12 ticks mid.apply(12-15) confirmed = seed SEQ12-15 (not provisional). "เอกสารขอผู้ซื้อ" = verbatim (not a typo, Porter-confirmed). Only QA real a14 (27300/…) remains |
| REQ-023 | ข้อ 7 ระยะเวลาการอนุญาต = `T_T_LICENSE.PERIOD_TEXT` verbatim — **ALL forms** (DEF-10; reverts the DEF-4 อ.9 deviation) | HIGH | SPEC_DONE (code COMPLETE) | Porter → QA: TASK-020 DONE+SA-verified (a9 item-7=PERIOD_TEXT; a6 already; a14 pinned). QA: อ.9 item-7 = PERIOD_TEXT on licensed req, blank else; 18847 now PERIOD_TEXT/blank (intended, not a regression) |
| REQ-024 | อ.9 real /download can't route (SPECIAL has no FORM_ID 9) — add `resolveFromMove` leg | HIGH — **blocks อ.9 prod** | SPEC_DONE (code COMPLETE) | Porter → QA: TASK-021 DONE+SA-verified (resolveFromMove leg; dead SPECIAL 9/10 removed; compiles/boots). QA: real อ.9 via REAL /download/checklist/{encId} → A9 PDF (not 500); อ.6/อ.14 still route |
| REQ-025 | รายการ (item/annex list) sourced from `VW_REQUEST_DTL` — **ALL** checklist reports | HIGH | **DELIVERED** (a6 leg verified on real output) | — human rendered a6-38272: annex from the view, units full-name (กิโลกรัม/นัด/ชุด/ดอก) **approved**, nothing outside รายการ moved. Display quirk ("วัตถุระเบิด" duplicated, stray trailing "-") = **view-side, WON'T FIX by us** — human tells the view owners. Do NOT trim/dedup the display string. a9/a14 legs still to be eyeballed |
| REQ-026 | Split อ.9 destroy vs transport into two independent reports (a14 single-variant shape) | MEDIUM | SPEC_DONE (code COMPLETE) | Porter → QA: TASK-024 (builders/routing) + TASK-025 (per-form template folders) both DONE+SA-verified. อ.9 now fully split like every other form. QA: real destroy+transport via /download+/a9/db = identical to delivered, both route |
| REQ-027 | อ.15 checklist report — clone อ.9 **transport** | HIGH | SPEC_DONE (code COMPLETE) | Jason: set a15 item-2 = human-confirmed constant **`ขายและขนย้ายให้บุคคลอื่นนอกหน่วยงานตามมาตรา 7`** (verbatim — note it reads "นอกหน่วยงาน" vs อ.14's "นอกจากหน่วยงาน"; do NOT align, flagged to human). Then QA: real a15 render + item-5=AUTHORITY_NAME + a9 unchanged |
| REQ-028 | Collapse the checklist resolver to ONE lookup on `T_T_REQUEST.REQUEST_TYPE` (drop the 4 per-family probe legs) | HIGH | READY_FOR_SA | Sober (SPEC) — **do BEFORE อ.4-8**. Map: 3=อ.9 · 4=อ.4 · 5=อ.15 · 6=อ.14 · 8=อ.6 · 2=อ.1/3/20 · 0/50/51/52/53 as today. Only real sub-lookup left = MOVE_REQUEST_TYPE for อ.9 destroy/transport. ⚠️ MUST resolve อ.6-vs-อ.7 (today via SPECIAL.FORM_ID 6/7, but RequestType has one code 8) before deleting the SPECIAL leg |
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
| TASK-008 | อ.9 DB integration — build a9 (mirror a6 + MOVE + EXAMPLE_SIGN, graceful) + seam | SPEC-014 | SUPERSEDED (a9 built+delivered via TASK-012/015-017; diagnostic overtaken) | Jason (BE) | none |
| TASK-009 | Verify dev profile activates via SPRING_PROFILES_ACTIVE=dev (REQ-018 step 1) | SPEC-018 | DONE | Jason (BE) | none |
| TASK-010 | อ.9 destroy polish — SUPERSEDED by TASK-012 (folded into SPEC-020 set) | SPEC-019 | SUPERSEDED | — | none |
| TASK-012 | อ.9 DESTROY finish (DEF-4a+DEF-5+item12(1)+ReqMoveDestroyer+item12(2) label) | SPEC-020 | DONE (6/6; residual DEF-5+DEF-8 → TASK-013) | Jason (BE) | none |
| TASK-011 | Name the failing .jasper on load (guard vs silent corruption) | DEF-7 | DONE | Jason (BE) | none |
| TASK-013 | อ.9 DESTROY residual — DEF-5 null-leak guard + DEF-8 docTypeLabel fit (template-only, DB-free verify) | SPEC-020 | DONE (SA-verified) | Jason (BE) | none |
| TASK-014 | Signature always 4 slots (a6+a9) + a6 full "null" sweep — REQ-021 + DEF-9 | SPEC-021 | DONE (SA-verified) | Jason (BE) | none |
| TASK-015 | อ.9 TRANSPORT foundation — variant branch + data-driven item5Label + heading + AUTHORITY_NAME + ReqMove master (NOT item-12) | SPEC-022 | DONE (SA-verified, both previews) | Jason (BE) | none |
| TASK-016 | อ.9 TRANSPORT item-12 "เอกสารของผู้ซื้อ" — locked labels + real sources (P3/P5/ARMS_CTRL/MOI/BUYER) + ticks | SPEC-022 | DONE (SA-verified, both previews) | Jason (BE) | TASK-015 |
| TASK-017 | อ.9 TRANSPORT item-12 FORM-TRUTH — order (ส.ค.4 first) + 2 sub-lines + verbatim labels + (1)/(2) rows | SPEC-022 | DONE (SA-verified) | Jason (BE) | TASK-016 |
| TASK-018 | อ.14 export FOUNDATION — a14 skeleton + resolveFromSaleInt routing + page-1 + evidence 1-11 + signature (NOT item-12) | SPEC-023 | DONE (SA-verified, previews+resolver) | Jason (BE) | none |
| TASK-019 | อ.14 item-12 "เอกสารขอผู้ซื้อ" — export set (own order/labels; NOT a copy of a9 transport; +3 tick-only NEW docs) | SPEC-023 | DONE (SA-verified) | Jason (BE) | TASK-018 |
| TASK-020 | อ.9 item-7 revert → T_T_LICENSE.PERIOD_TEXT (a6 pattern); drop moveDurationText | SPEC-024 | DONE (SA-verified) | Jason (BE) | none |
| TASK-021 | อ.9 /download routing — resolveFromMove leg (MOVE row→A9) + drop dead SPECIAL 9/10 | SPEC-025 | DONE (SA-verified) | Jason (BE) | none |
| TASK-022 | รายการ annex + item-4 count from VW_REQUEST_DTL (a6/a9/a14) | SPEC-026 | DONE (SA-verified) | Jason (BE) | none |
| TASK-023 | DEF-11: remove invented `STATUS` on SALE_INT (fixes /download 500s for อ.9/อ.14) + entity-column sweep | SPEC-027 | DONE (SA-verified, cols diffed vs dict) | Jason (BE) | none |
| TASK-024 | Split อ.9 → destroy/transport reports (shared base + 2 builders + A9D/A9T + resolveFromMove); NO output change | SPEC-028 | DONE (SA-verified) | Jason (BE) | none |
| TASK-025 | Split a9 template folder per-form (request-a9 → -destroy/-transport); resource-only, base untouched | SPEC-028 | DONE (SA-verified) | Jason (BE) | TASK-024 |
| TASK-026 | อ.15 clone of a9-transport (SALE_DOM header + resolveFromSaleDom + request-a15 folder) | SPEC-029 | REVIEW | Sober (SA) | TASK-025 |

## Blocked / waiting

| Item | Waiting on | Question (short) |
|------|-----------|------------------|
| REQ-005 close proof | RESOLVED | QA re-tested the rework → **TEST_PASSED**: 38272/38273 item 7 = PERIOD_TEXT (DR-1 exact), 38240 blank, all 200, 0 ORA-00933. DEF-1+DEF-2 closed → Porter to accept→DELIVERED. |
| ⚠️ REQ-004 gate OFF (deliberate) | Porter — re-enable after internal testing | Human commented out `@Profile("dev")` ON PURPOSE so the build can go up for internal testing (their dev-profile config attempts did not take effect). DEFERRED via REQ-018: do NOT restore it yet. Accepted risk: unauthenticated real-PII PDFs — **CONFIRMED internal-only network**, so contained. MUST be restored before production. |
| DEF-3 build broken (TASK-008) | RESOLVED | Jason fixed A9PreviewTest → `new A9CheckListPreviewBuilder().createPreviewData()`. `test-compile` BUILD SUCCESS; A9PreviewTest green (pages=4). TASK-008 → REVIEW. |
| DEF-4 อ.9 page-1 blanks | MOSTLY RESOLVED (human fixed lawRefs + margins directly) | Jason DONE the 2 code fixes: item2=full MOVE_REQUEST_TYPE label map, item7=MOVE START/END date range (dropped LICENSE.PERIOD_TEXT); test-compile SUCCESS. BLOCKED on the rest: item1/5/lawRefs/signatures diagnosis needs the /a9/db/18847 emitted-JSON run = real UAT read (BE rule #4 → QA's leg, per the TASK-003 ruling). Ask Tanya to report which fields JSON shows null/present; null-in-DB/different-linkage → DATA REQUEST to wire. See TASK-008 Q4. |
| DEF-7 corrupt a9 .jasper | ✅ CLOSED (2nd time — src/ repaired) | A .jasper had a text-mojibake header (EF BF BD) blocking a9. Sober checked all 12 a6+a9 .jasper → **all valid AC ED 00 05 now** (a fresh A9PreviewTest recompile from the intact .jrxml rewrote them in binary; a6 not regressed). Guard (name the failing file on load) = TASK-011. Prevention: never save .jasper via text; regenerate via PreviewTest. |
| BUILD FACT | noted | `.jasper` files are loaded from **target/classes**, not src/. Repairing/regenerating in `src/main/resources` has NO effect until `./mvnw clean compile` + restart. This cost 2 diagnosis rounds — always rebuild before re-testing a template change. |
| DEPENDENCY (external team) | noted | The frontend/backend team owning the อ.9 **destroy request creation flow** has NOT finished it and is on other priorities ⇒ **no type-2 request can be created**, so the destroy variant cannot be data-verified for the foreseeable future. Plan around it (REQ-020), don't wait. |
| MASTER SEEDED (correction) | noted | Data team created BOTH groups: destroy = **`ReqMoveDestroyer`** (SEQ 1-19), transport = **`ReqMove`** (SEQ 1-15). Our provisional constant 'ReqMove'=destroy was WRONG. Filter IS_ACTIVE=1. Historical requests have NULL REQUEST_CHECKLIST_ID and a legacy DOCUMENT_ID scheme (18/48-55/95-99) that does NOT match the master (1/4/6/8/100/121-123) ⇒ old requests can never tick; that is the expected steady state. |
| ARCHITECTURE FACT | noted | **Each form family has its OWN request table carrying its own FORM_ID** — อ.6=`T_T_REQUEST_SPECIAL`(6), อ.9=`T_T_REQUEST_MOVE`(9), อ.14=`T_T_REQUEST_SALE_INT`(14), อ.4=`T_T_REQUEST_IMPORT`. T_T_REQUEST_SPECIAL contains **ONLY FORM_ID 6** (70 rows) — so the resolver's `9/10 → A9` branch can never match (this is why the real อ.9 download served mock). Resolve per-family table, do NOT add cases to T_T_REQUEST_SPECIAL. |
| FORM-RULE (all reports) | noted | **ข้อ 7 ระยะเวลาการอนุญาต = `T_T_LICENSE.PERIOD_TEXT` verbatim, for EVERY form** (อ.6/อ.9/อ.14-16/อ.4-8). Join **by REQUEST_ID only** — do NOT filter FORM_ID: the licence row carries the LICENCE's form id (อ.9 request 38362 → licence FORM_ID 10). No licence row ⇒ **blank**, never a MOVE date range. The DEF-4 "item7 = MOVE START/END" call was Porter's wrong generalisation from sample 18847 (licence not yet issued) → REQ-023 reverts it. |
| a9 resolver latent defect (REQ-014) | Sober → tracked by Porter | The `/download` resolver's `9/10 → A9` branch reads `T_T_REQUEST_SPECIAL`, which holds ONLY FORM_ID 6 ⇒ **a real อ.9 can never route via that path** (why it served mock). อ.9 needs a per-family `resolveFromMove` leg, same shape as the `resolveFromSaleInt` leg TASK-018 just added. Not folded into REQ-022 — Porter to raise as its own REQ before อ.9 goes to production. |
| A14 seed hand-off | ❌ CANCELLED — not needed | **`ReqSaleInt` was ALREADY SEEDED** by the data team (15 rows, IDs 145-159; SEQ 4/5 IS_ACTIVE=0 -> 13 active). The 3 "NEW" item-12 docs are present as SEQ 12/13/14 + SEQ 15 ภาพถ่ายสนามยิงปืน. Our "no export-sale group exists" survey was STALE (they seeded it ~3 days after we looked). `project-docs/OBSOLETE-A14-checklist-seed-spec-for-data-team.md` — do NOT send. **LESSON: re-verify master/DB facts immediately before asking the data team for anything.** Note `ReqSaleDom` (13 rows) also exists despite the dict marking อ.15 retired. Only open data question: is `T_T_REQUEST_DOC.REQUEST_CHECKLIST_ID` actually BACKFILLED on real อ.14 requests? |
| อ.14 ticks unverifiable (DATA) | noted — NOT a blocker | **No อ.14 request has ANY attached document**: T_T_REQUEST_DOC for 27300/34380/35966/36711/36741 = TOTAL 0; the whole T_T_REQUEST_DOC x T_T_REQUEST_SALE_INT join returns **empty**. So there is nothing to backfill and nothing to ask the data team. Finish อ.14 **by construction** (REQ-020 precedent): blank + unticked on real requests is the EXPECTED steady state, not a defect. Page-1 + annex ARE verifiable on real data. Re-check when real อ.14 usage begins. |
| DEF-11 | ✅ **CLOSED — verified on real data** | TASK-023 DONE+SA-verified: SALE_INT `STATUS` removed (dict-confirmed absent), repo→findByRequestId, dead DtlSaleInt deleted, DtlView cols re-confirmed. QA: real อ.9+อ.14 via /download → PDF, no 500. New guard: entities cite dict per column. | **`T_T_REQUEST_SALE_INT` has NO `STATUS` column** — `RequestSaleIntEntity` maps it + `findActive` filters on it → **ORA-00904 → real /download 500s for อ.9 (both variants) and อ.14**. `resolveFromSaleInt` runs BEFORE `resolveFromMove`, so it throws for every non-อ.6 request; อ.6 passes only because `resolveFromSpecial` returns first — **the one form we tested was the only one that could not hit it**. Introduced by TASK-018, on the path TASK-021 had just fixed. Fix + sweep the other new entities (DtlSaleInt, DtlView) for invented columns. |
| 🔑 DISCRIMINATOR FACT | noted | **`T_T_REQUEST.REQUEST_TYPE` identifies the form for EVERY family** (labels in `T_S_COMMON_CODE` GROUP_CODE=`RequestType`): 0 BgChk · 1 ตรวจโรงงาน · 2 อ.1/3/20 · **3 อ.9** · **4 อ.4** · **5 อ.15** · **6 อ.14** · 7 อ.11 · **8 อ.6** · 50/51/52/53 open/expand/plant/person. Supersedes the probe-each-family-table approach — see REQ-028. The pre-existing REQUEST_TYPE switch in the resolver was the correct mechanism all along; the per-family legs we added in front of it are what produced DEF-11. |
| 🔗 PARENT/CHILD FACT | noted — **may affect อ.15 item-5** | **A sale request (อ.14/อ.15) SPAWNS A CHILD อ.9 move request**, linked by `T_T_REQUEST.REF_REQUEST_ID` on the child: child 3←parent 5 = 426 rows, child 3←parent 6 = 20 rows (also 1←2, 1←50, 0←2). Hence the form title "ขาย**และขนย้าย**". ⚠️ `A15ReportBuilder` takes item-5 from `VW_REQUEST_DTL.AUTHORITY_NAME` on the premise "อ.15 has no MOVE row" — true for the อ.15 row itself, but its CHILD อ.9 has one. Sober to compare the two values on a real request before changing anything; if they differ it is a live defect. |
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
