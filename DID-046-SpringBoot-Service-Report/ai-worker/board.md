# Board — DID-046-SpringBoot-Service-Report

> Single source of truth. Update me at the end of every session (see PROTOCOL.md).
>
> **File discipline:** detail lives in the REQ/SPEC/TASK/TEST file — a board cell is
> ONE line = status + date + owner + pointer; log entries ≤15 lines.
> **`ai-worker/inbox/`** exists (PM/SA/BE/QA.md) — delivery channel: senders append
> 1-3 lines, receivers read-then-delete. The log stays history only.
> Full pre-compaction board: `archive/board-2026-08-25-pre-compaction.md`.

## Project info

- Description: Spring Boot service generating Thai government PDF permit
  documents/checklists (forms อ.1, อ.3, อ.6, อ.9, อ.14–16, อ.4–8, ...) via
  JasperReports from the Oracle `DIDPERMIT` database.
- Code repository: logical name **`DID-046-SpringBoot-Service-Report`** — real
  absolute paths per machine live in the workspace-root `machine.local.md`
  (see workspace CLAUDE.md "Paths & machines"); never hardcode a path here.
- Tech stack: Java 21, Spring Boot 3.5.x, Oracle JDBC (ojdbc11), JasperReports 7.0.4, springdoc-openapi
- Run: `./mvnw spring-boot:run` — port 33000, context-path `/document-service`
- Team: Porter (PM) · Sober (SA Lead) · Jason (BE) · Tanya (QA — trial)
- QA environment: local + dev/local wired to the **UAT** DB; Tanya tests
  **read-only** (GET/read + report generation) — never create/update/delete, never production.

## Requirements

| ID | Title | Priority | Status | Owner of next step |
|----|-------|----------|--------|--------------------|
| REQ-001 | Verify อ.6 checklist PDF | HIGH | DELIVERED — see REQ-001 | — |
| REQ-002 | อ.6 preview endpoint | HIGH | DELIVERED — see REQ-002 | — |
| REQ-003 | อ.6 from plain requestIds | HIGH | DELIVERED — see REQ-003 | — |
| REQ-004 | Secure preview /db seam | HIGH | DELIVERED — see REQ-004; gate deliberately OFF via REQ-018 | — |
| REQ-005 | อ.6 item 7 = PERIOD_TEXT | HIGH | DELIVERED — see REQ-005 / TEST-003 | — |
| REQ-006 | gitignore project-docs (PII) | HIGH | DELIVERED — see REQ-006 | — |
| REQ-007 | QA visual verification | MEDIUM | DELIVERED — see REQ-007 | — |
| REQ-008 | อ.6 SQL/field-mapping doc | MEDIUM | DELIVERED — see REQ-008 / SPEC-008 | — |
| REQ-009 | อ.6 evidence tick = real attachment | HIGH | IN_TEST (blocked) 2026-08-20 — parked on human DATA REQUEST (no-file sample); see REQ-009 / TEST-004 | Porter → human |
| REQ-010 | อ.6 person STATUS<>'D' filter | HIGH | DELIVERED — see REQ-010 / TEST-004 | — |
| REQ-011 | อ.6 item-8 dynamic other-docs | HIGH | DELIVERED — see REQ-011 | — |
| REQ-012 | อ.6 evidence sub-item render types | MEDIUM | DELIVERED — see REQ-012 | — |
| REQ-013 | อ.9 db preview seam | HIGH | DELIVERED 2026-08-24 (proof-in-use) — see REQ-013, log 2026-08-24 | — |
| REQ-014 | อ.9 DB integration | HIGH | DELIVERED (superseded — parts shipped via TASK-008/012/015, REQ-023/024/026) — see REQ-014 | — |
| REQ-015 | อ.6 NULL-status person regression | HIGH | DELIVERED 2026-08-24 — see REQ-015 / TEST-005 | — |
| REQ-032 | ตรวจสอบประวัติ checklist report | HIGH | **DELIVERED** 2026-08-31 — accepted by Porter | Both paths QA-passed on real data: live 38237 (400→200, ครบ rule on ๑–๔, DEF-18 gone) + history 211 (verbatim snapshot). See TEST-007 |
| REQ-016 | อ.9 data-model investigation | HIGH | DELIVERED — see REQ-016 / SPEC-016 | — |
| REQ-017 | NULL-safe doc queries all builders | — | CANCELLED (stakeholder 2026-08-05, won't fix) — see REQ-017 | — |
| REQ-018 | Dev-profile activation + restore gate | HIGH | IN_SPEC (step 1 DONE; step 2 DEFERRED until pre-production) — see REQ-018 / SPEC-018 | Porter triggers |
| REQ-019 | อ.9 two variants split | HIGH | DELIVERED — see REQ-019 | — |
| REQ-020 | อ.9 destroy by construction | HIGH | DELIVERED — see REQ-020 | — |
| REQ-021 | Signature 4 slots + null sweep | HIGH | DELIVERED — see REQ-021 | — |
| REQ-022 | อ.14–อ.16 export checklist | HIGH | DELIVERED — see REQ-022 / TEST-004(regression) | — |
| REQ-023 | ข้อ 7 = PERIOD_TEXT all forms | HIGH | DELIVERED — see REQ-023 | — |
| REQ-024 | อ.9 /download per-family routing | HIGH | DELIVERED — see REQ-024 | — |
| REQ-025 | รายการ from VW_REQUEST_DTL | HIGH | DELIVERED — see REQ-025 | — |
| REQ-026 | Split อ.9 destroy/transport reports | MEDIUM | DELIVERED — see REQ-026 | — |
| REQ-027 | อ.15 checklist report | HIGH | DELIVERED — see REQ-027 | — |
| REQ-028 | Resolver = one REQUEST_TYPE lookup | HIGH | DELIVERED — see REQ-028 (อ.7 = accepted untestable gap) | — |
| REQ-029 | อ.4–อ.8 import checklist | MEDIUM | **DELIVERED** 2026-08-31 | QA on real 38427: 200, 4pp, DEF-19 headings verbatim, ระยะเวลา = item **6**, 17 evidence items with real ticks, DEF-17 column-safe. ⚠️ **Accepted gap:** annex อ.8 3-column block, item-6 §4 and the 1:N rule **never rendered a real value — `T_T_REQUEST_DTL_REF_IMPORT` is EMPTY (verified)**; covered by unit test + column-safety + structure only. Re-check when the first อ.4 with an อ.8 reference exists |
| REQ-030 | Tick binding by CHECKLIST_CODE | HIGH | DELIVERED 2026-08-24 — see REQ-030 / SPEC-032 | — |
| REQ-031 | Compile `.jrxml` → `.jasper` in the Maven build; stop tracking `.jasper` in git | HIGH | **DELIVERED** | — 52 `.jrxml` → 52 `.jasper` packaged in the jar, `src` purged, 0 tracked in git, loud-fail if precompile is skipped ⇒ **the stale-`.jasper` failure mode (DEF-7, DEF-15) is structurally impossible now**. Broad smoke from the UI: อ.1/อ.3/อ.20 + open + expand + plantChange + personChange all render clean ⇒ **no other form was carrying a stale binary**. (38237/38192 errored for an unrelated reason → REQ-032.) |

| ✅ DEF-19 | **QA-CONFIRMED FIXED 2026-08-31** (Tanya) | a4 annex + page-2 evidence headings were a14-clone `…ขายและขนย้ายอาวุธ`; TASK-042 fixed both to `…สั่งหรือนำเข้ามาในราชอาณาจักร`. QA real render 38427: both headings correct, `"ขายและขนย้ายอาวุธ"` absent. Closed. |
| อ.4 QA samples | noted | REQUEST_TYPE=4 with most attachments: **38427 (17 docs)** ← use this · 38419 (16) · 38434 (14) · 38429/38428/38422/38420 (12). **Most อ.4 requests have ZERO documents** — a random pick yields a false pass. |
| REQ-033 | Write-in rows → label + dotted fill + label + dotted fill | HIGH | R7 STRUCTURALLY VERIFIED (17/17 whitespace-free gate, 5 forms) → stakeholder sign-off is the final gate (layout close = their eye, per the capability boundary) | Sober/Jason (fix) |

## Tasks

| ID | Title | Source | Status | Assignee | Depends on |
|----|-------|--------|--------|----------|------------|
| TASK-001 | Restore a6 mock preview | SPEC-002 | DONE | Jason | none |
| TASK-002 | Dev-profile-gate previews | SPEC-004 | DONE | Jason | none |
| TASK-003 | a6 item 7 PERIOD_TEXT | SPEC-005 | DONE | Jason | none |
| TASK-004 | a6 tick + person filter | SPEC-009 | DONE | Jason | none |
| TASK-005 | a6 item-8 dynamic | SPEC-011 | DONE | Jason | none |
| TASK-006 | a6 Type-B write-in line | SPEC-012 | DONE | Jason | none |
| TASK-007 | NULL-safe person query | SPEC-015 | DONE | Jason | none |
| TASK-008 | a9 DB integration | SPEC-014 | SUPERSEDED — see TASK-008 | Jason | none |
| TASK-009 | Verify dev profile | SPEC-018 | DONE | Jason | none |
| TASK-010 | a9 destroy polish | SPEC-019 | SUPERSEDED by TASK-012 | — | none |
| TASK-011 | Name failing .jasper on load | DEF-7 | DONE | Jason | none |
| TASK-012 | a9 destroy finish | SPEC-020 | DONE — see TASK-012 | Jason | none |
| TASK-013 | a9 destroy DEF-5/DEF-8 | SPEC-020 | DONE | Jason | none |
| TASK-014 | Signature 4 slots + null sweep | SPEC-021 | DONE | Jason | none |
| TASK-015 | a9 transport foundation | SPEC-022 | DONE | Jason | none |
| TASK-016 | a9 transport item-12 | SPEC-022 | DONE | Jason | TASK-015 |
| TASK-017 | a9 transport item-12 form-truth | SPEC-022 | DONE | Jason | TASK-016 |
| TASK-018 | a14 foundation | SPEC-023 | DONE | Jason | none |
| TASK-019 | a14 item-12 export set | SPEC-023 | DONE | Jason | TASK-018 |
| TASK-020 | a9 item-7 PERIOD_TEXT revert | SPEC-024 | DONE | Jason | none |
| TASK-021 | a9 resolveFromMove leg | SPEC-025 | DONE | Jason | none |
| TASK-022 | annex from VW_REQUEST_DTL | SPEC-026 | DONE | Jason | none |
| TASK-023 | DEF-11 SALE_INT STATUS fix | SPEC-027 | DONE | Jason | none |
| TASK-024 | Split a9 destroy/transport | SPEC-028 | DONE | Jason | none |
| TASK-025 | Split a9 template folders | SPEC-028 | DONE | Jason | TASK-024 |
| TASK-026 | a15 clone of a9-transport | SPEC-029 | DONE | Jason | TASK-025 |
| TASK-027 | Collapse resolver | SPEC-030 | DONE | Jason | none |
| TASK-028 | DEF-12 a15 item-5 child อ.9 | SPEC-031 | DONE | Jason | none |
| TASK-029 | TICK RULE binding + DEF-14 | SPEC-032 | DONE | Jason | none |
| TASK-030 | DEF-15 destroy ticks | DEF-15 | CLOSED — root cause stale .jasper; see TASK-030, log 2026-08-24 | — | — |
| TASK-031 | DEF-15 JSON instrumentation | DEF-15 | DONE (decisive; reverted via TASK-032) | — | — |
| TASK-032 | Revert TASK-031 debug | DEF-15 | DONE | Jason | none |
| TASK-033 | Compile jasper in Maven build | SPEC-033 | DONE (SA-verified) — see TASK-033 | Jason | none |
| TASK-034 | Build อ.4 import checklist (7 page-1 items ระยะเวลา@6; 17 evidence ReqImport TICK RULE; item-6 §4 REF_IMPORT; annex +3 cols; +unit-test the 1:N annex; verify cols vs live DID_SPF) | SPEC-034 | DONE — SA-verified 2026-08-31 (verbatim labels 5(4)/12/13/14 fixed + preview mock; item-6 min-2 slots; 1:N annex unit-tested; 15/15) → QA real REQUEST_TYPE=4 | no-history + REF_IMPORT live-verify = accepted-flagged | Jason (BE) | none |
| TASK-042 | DEF-19: fix อ.4 annex heading + page-2 heading (a14-clone leftovers in main.jrxml, verbatim from PDF) — full-template sweep done, only 2 strings | DEF-19 | DONE — SA-verified (grep 0 leftovers; annex + page-2 headings verbatim per PDF; preview clean; tests+package green) | Jason (BE) | none |
| TASK-043 | One-off: encrypted /download tokens for 3 อ.4 ids (38427/38419/38434) — REQ-029 routing test; throwaway, no key leak, deleted after (=TASK-037) | REQ-029 | DONE — SA-verified (file deleted, 0 key leak, src/test clean); 3 tokens relayed to Porter in log | Porter → human /download smoke | none |
| TASK-044 | REQ-033: write-in rows → label + dotted fills (R4: INLINE, form-is-spec, image-verified) | REQ-033/SPEC-038 | DONE — SA-verified visually (a9-transport render matches official p2: inline, (ลำดับ 9)+item-4 (1)(2) fixed, 4pp; refrow1/3/3w/num bands across all 5) → QA render all 5 vs PDFs | Jason (BE) | none |
| TASK-045 | REQ-033/DEF-20: fix a9-transport layout to match the TARGET `A9-TRANSPORT-layout-spec.md` | DEF-20 | R7 — structural gate GREEN (structure_check.py 17/17, SA re-ran exit 0; falsifiable; signature write-ins fixed, คณะกรรมการ 2 lines via field 451→457px, heading already centred=target artifact). All 5 forms replicated, 15/15, a6 untouched → **stakeholder eye = final sign-off** | **R7 DONE → structural gate GREEN**; remaining gate = stakeholder eye. All 3 rulings applied: signature caption+dotted write-in (4/4 slots × all 5 forms) · คณะกรรมการ 2 lines — fixed by widening the field 451→457px, **NOT** by shrinking the font (wrap points are set by the string's spaces; font stays 14.0) · heading needs no change, measured dead-centre (297.5 = page centre), the 2-col delta is the target's hand-typed spacing. `verify/structure_check.py` **17/17 PASS**, falsified by re-injecting the R5 defect (failed, then restored). clip-guard PASS 12/5; 15/15 + BUILD SUCCESS. Replicated to all 5. | Jason (BE) | see TASK-045 'R7' |
| TASK-035 | Purge src .jasper + tests→target | REQ-031 | DONE (SA-verified) — see TASK-035 | Jason | none |
| TASK-036 | DEF-17 buyer re-map + doc-row values | DEF-17 | DONE + **QA-CONFIRMED 2026-08-27** (200 on 3 forms, item-12 values populate, :271/:278 differ) — see TEST-006 | — | a14 §4 dates = ACCEPTED-BLANK gap |
| TASK-037 | One-off: print encrypted download tokens for 7 ids (REQ-031 smoke) — throwaway, no key leak, reverted after | REQ-031 | DONE — SA-verified 2026-08-27 (file deleted, 0 key leak, src/test git-clean; 7 tokens relayed to Porter in log) | Porter → human UI smoke | none |
| TASK-038 | Build CHECKPERSON (personCheck) report def + builder (a1/a3 shape; BgChk TICK RULE by code; remove hardcoded sample person; ครบ/ไม่ครบ result) | SPEC-035 | DONE — SA-verified 2026-08-27 (contract match, TICK RULE by code, per-person ticks via REF_ID = no DEF-17 risk, sample person removed, 4 JCs ruled w/ dict; expired-docs=accepted-empty) → QA 38237 | Jason (BE) | none |
| TASK-039 | personCheck: DEF-18 no-literal-null + date-only + human's revised layout (person min-5 rows; 4 verify sub-sections แก้ไข/เพิ่มเติม NEW ×3 blank rows; หมายเหตุ) — closes REQ-032 | REQ-032/DEF-18 | DONE — SA-verified 2026-08-27 (@JsonInclude(NON_NULL) fixes literal-null + regression-guarded, date-only, pad-to-5, 4 sub-sections+หมายเหตุ) → QA 38237 | Jason (BE) | none |
| TASK-040 | personCheck HISTORY builder — render stored snapshot verbatim (clone a1 history; …_FORM/_DOC/_PER/_DTL; DESCRIPTION-primary; no recompute) + history-switch case CHECKPERSON | SPEC-036 | DONE — SA-verified (verbatim snapshot, DESCRIPTION-primary, no live repos, history-switch wired); person-row match = INTERIM heuristic → DATA REQ (211 …_DOC names) + QA confirm | Jason (BE) | none |
| TASK-041 | personCheck LIVE ครบ/ไม่ครบ rule (๑–๔ only, ๕ excluded, item๔=person-presence, every person complete, system-populated named missing list) | SPEC-037 | DONE — SA-verified (๕ excluded, item๔=presence, named missing list, pad excluded; unit test 4/4 — endorsed precedent) | Jason (BE) | none |

## Open items / waiting

| Item | Waiting on | One-line state + pointer |
|------|-----------|--------------------------|
| 🔴 DEF-20 (REQ-033) — layout ≠ official | QA-found 2026-08-31 (stakeholder) → Sober/Jason | Real a9-transport vs official `(1)Checklist…ผอ.แก้ไข 16 ก.ค.69.pdf`, **≥2 confirmed + ≥1 open**: (1) item-12 **"ตามหนังสือคณะกรรมการ…"** long label wraps → inline `เลขที่`/`ลงวันที่` print **over** the wrapped text; (2) **ร.ง.4** row has an **extra dotted write-in line under "(แบบ ร.ง.4) (ลำดับ 9)"** — official = one line ending at `วันหมดอายุ`; (3) **item-12 "บัตรประชาชนนายกสมาคม/ผู้มอบอำนาจ"** flagged, fault not yet pinned. Root: per-row field set ≠ official. ⚠️ **QA-reliability note:** my visual layout pass is unreliable (I mis-read 3×, wrongly PASSED R4) — close layout via stakeholder eyeball or a mechanical field-map diff, NOT my eyeball. See TEST-009 / log 2026-08-31. |
| ✅ DEF-18 (REQ-032) | **QA-CONFIRMED FIXED 2026-08-31** (Tanya) | personCheck footer `วันที่มาติดต่อ` printed literal `"null"`; fixed via `@JsonInclude(NON_NULL)` + nz guards (TASK-039). QA real render 38237: footer now **blank**, 0 literal `null` in the PDF. Closed with REQ-032. |
| ✅ DEF-17 (ORA-00904 buyer) | QA-CONFIRMED FIXED 2026-08-27 (Tanya) | a9-transport/38336 + a14/27300 + a15/18041 now **200** (were 500), 0 null, 0 ORA; canaries a6/38272 + a9-destroy/38362 unchanged. Item-12 **values populate** (37956: เลขที่ incl. e0001=DOCUMENT_NAME_OTHER, ชื่อนายกสมาคม, dates, 1 tick); **:271/:278 lines now differ**. 18041/27300 blank = genuine no-data / accepted a14 gap. See TEST-006. |
| REQ-031 close | Porter + QA | Build PASS (52/52, jar renders OK); **DEF-17 now QA-confirmed fixed**. ONLY remaining blocker = no-auth-seam coverage gap for a1/a3/open/expand/personChange/planChange — Porter to provide a reachable path (/download key+ids or temp seams). See TEST-006. |
| REQ-009 close proof | Porter → human | DATA REQUEST parked: need 46784's current ATTACH_FILE_ID or a request+item with NO file. See REQ-009 / TEST-004. |
| REQ-029 release | Jason | BLOCKED until REQ-031 QA closes; mapping complete in REQ-029. |
| REQ-010 Q3 audit (opt) | Porter → human | Unmapped STATUS='D' rows in LAW_REF/DTL/EMPLOYER/LICENSE? SQL in SPEC-009 Q3. |
| Pre-production checklist | Porter (at prod readiness) | (1) REQ-018 step 2: restore `@Profile("dev")` gate; (2) DEF-16 stdout PII println (deferred by stakeholder 2026-08-24, "ปล่อยไปก่อน"). Raise both together. See REQ-018, log 2026-08-24. |
| REQ-031 commit | Human | ONE commit: untrack 28 .jasper + delete 46 + pom + .gitignore + JasperPrecompiler + PreviewTest redirect. Porter told human GO (log 2026-08-24). Git is the human's alone. |

## Standing rules & live facts (state, still binding)

| Fact | One line + pointer |
|------|--------------------|
| QA read-only env | Tanya only; local + dev-on-UAT-DB, GET/read only, never production. See PROTOCOL.md. |
| .jasper precompile | REQ-031 machinery compiles 52 .jrxml→.jasper at `process-classes`; src holds 0 .jasper; runtime reads `target/classes`. Until REQ-031 QA closes, treat any .jrxml edit as needing a rendered-PDF proof. See TASK-033/035. |
| 📌 TICK RULE (canonical) | Line's hardcoded CHECKLIST_CODE → T_S_REQUEST_CHECKLIST.ID → T_T_REQUEST_DOC (REQUEST_ID + REQUEST_CHECKLIST_ID); tick ⟺ row exists ∧ ATTACH_FILE_ID not null/0 ∧ STATUS<>'D'; IS_ACTIVE irrelevant; never positional. Stakeholder 2026-08-21. See SPEC-032. |
| 🔑 DISCRIMINATOR | `T_T_REQUEST.REQUEST_TYPE` identifies the form family (3=อ.9, 4=อ.4, 5=อ.15, 6=อ.14, 8=อ.6; labels in T_S_COMMON_CODE `RequestType`). See SPEC-030. |
| 🔗 PARENT/CHILD | Sale requests (อ.14/อ.15) spawn a child อ.9 via T_T_REQUEST.REF_REQUEST_ID — a15 item-5 reads child MOVE.AUTHORITY_NAME. See SPEC-031. |
| FORM-RULE ข้อ 7 | = T_T_LICENSE.PERIOD_TEXT verbatim, every form, join by REQUEST_ID only (no FORM_ID filter); no licence ⇒ blank. See REQ-023. |
| ENV | UAT DB = Oracle 11.2 — no FETCH FIRST / 12c SQL. |
| Schema is perishable | DB facts expire: T_T_REQUEST_BUYER was ALTERED under us (DEF-17); dict/ALL_TAB_COLUMNS ≠ the app's schema — verify @Column against the app's own connection (`DID_SPF`). SPEC-027 amended. |
| Doc-row values | Item dates/numbers/ticks live on the T_T_REQUEST_DOC row (ISSUE_DATE/EXPIRY_DATE/DOCUMENT_NO/DOCUMENT_NAME_OTHER/ATTACH_FILE_ID) — one lookup = tick + value. See TASK-036. |
| Accepted steady states | อ.14 blank ticks · blank law refs อ.14/อ.15 · DEF-13 cancelled · อ.7 untestable · legacy requests never tick (NULL REQUEST_CHECKLIST_ID). Pointers: REQ-022, REQ-028, archive board. |
| Log hygiene | Daily log APPEND-ONLY — never Write over it (2026-08-24 overwrite incident). Board is row-wise = source of truth. |

## Facts parked during compaction 2026-08-25

Full narrative for everything below: `archive/board-2026-08-25-pre-compaction.md`.

- MASTER SEEDED groups: destroy=`ReqMoveDestroyer`, transport=`ReqMove`, import=`ReqImport` (16 rows, mapped in REQ-029), export=`ReqSaleInt` (15), dom=`ReqSaleDom`; IDs reassigned 2026-08-21 ⇒ only CHECKLIST_CODE is stable. Data team edits masters live (ReqSaleDom 22→21 mid-day) — re-verify, never reuse dumps.
- ARCHITECTURE: each family has its own request table with its own FORM_ID (SPECIAL=6 only, MOVE=9, SALE_INT=14, IMPORT); resolve per-family — old SPECIAL 9/10 branch was dead (why real อ.9 served mock). See SPEC-025/030.
- DEF-4/DEF-7/DEF-11/DEF-12/DEF-15 histories: all CLOSED — details in archive board + logs 2026-08-05..24. DEF-15 root cause = stale deployed destroy .jasper (DEF-7 family); prevention = REQ-031.
- DEF-14 folded into REQ-030; grantor duplicate (:271/:278) resolved via GRANTOR_ID_CARD_NO in TASK-036.
- External dependency: destroy-request creation flow owned by another team, unfinished — first real type-2 sample was 38362 (arrived 2026-08-21). a6 canary sample = 38272; a15 = 18041; a14 = 27300; a9-transport = 38336/37956.
- DEPLOY note (REQ-004): UAT :33000 must run with `SPRING_PROFILES_ACTIVE=dev` or the /db QA seams 401.
- a6-main template quirk (pre-existing, no ticket): appended text to 2 static labels is dropped in render — see TASK-033 flag.
- OBSOLETE-A14-checklist-seed-spec-for-data-team.md in project-docs — do NOT send (master was already seeded).| DEF-17 | ✅ **CLOSED — QA-confirmed on real data** | อ.9-transport/อ.14/อ.15 back to **200** (were 500); a6/38272 + a9-destroy/38362 canaries unchanged; 0 null, 0 ORA-00904. Item-12 values proven live on **37956** (the transport request that actually has item-12 data): `เลขที่ e0001` via `DOCUMENT_NAME_OTHER`, ชื่อนายกสมาคม populated (DEF-14), วันหมดอายุ rendered, and the two assoc-president ID lines now **differ** (`:271`/`:278` duplicate resolved via `GRANTOR_ID_CARD_NO`). Entity re-mapped to DID_SPF-surviving columns only. |
