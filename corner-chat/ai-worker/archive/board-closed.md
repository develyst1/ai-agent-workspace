# Board — closed rows (corner-chat)

> Append-only. Rows moved byte-for-byte from `board.md` when they close. Newest sweep at the bottom.

## Sweep 2026-11-01 (PM Porter, on Marie's board-sweep order; pre-sweep copy `archive/board-2026-11-01-pre-sweep.md`)

### Requirements
| Id | Title | Priority | Status (date, owner, pointer) | Ball |
|----|-------|----------|-------------------------------|------|
| REQ-001 | Accounts + owner's admin web | HIGH | DELIVERED 2026-11-01 (PM) — TEST-001 run 3 PASS; `tests/TEST-001-req-001-accounts-and-isolation.md` | PM |
| REQ-004 | User conditions + AI filter | HIGH | DELIVERED 2026-11-01 (PM) — TEST-003 run 4 PASS; `tests/TEST-003-req-004-conditions-and-ai-filter.md` | PM |

### Tasks
| Id | Title | Source SPEC | Status (date, owner, pointer) | Owner | Depends on |
|----|-------|-------------|-------------------------------|-------|------------|
| TASK-001 | Back-end base | SPEC-001 | DONE 2026-11-01, SA Sober reviewed (tests re-run, migration = SPEC §5) — `tasks/TASK-001-back-end-base.md` § Review | BE Jason | — |
| TASK-002 | Accounts, sessions, admin users API | SPEC-001 | DONE 2026-11-01, SA Sober reviewed (27/0 re-run) — `tasks/TASK-002-accounts-sessions-admin-users.md` § Review | BE Jason | TASK-001 |
| TASK-005 | Conditions, rules, messages API | SPEC-001 | DONE 2026-11-01, SA Sober reviewed (93/0 on a private test DB) — `tasks/TASK-005-conditions-rules-messages-api.md` § Review | BE Jason | TASK-002 |
| TASK-019 | Test database per run (both teams test in one tree) | SPEC-001 | DONE 2026-11-01, SA Sober reviewed (2 runs at once green, no leftovers) — `tasks/TASK-019-test-database-per-run.md` § Review | BE Jason | TASK-005 |
| TASK-006 | AI layers, settings, corpus runner, fake gateway | SPEC-001 | DONE 2026-11-01, SA Sober reviewed (224/0, migration = SPEC) — `tasks/TASK-006-ai-layers-gateway-settings-corpus-runner.md` § Review | BE Jason | TASK-005 |
| TASK-007 | Notify (FCM + LINE seam), devices, push count | SPEC-001 | DONE 2026-11-01, SA Sober reviewed (262/0); real push needs B3 + app — `tasks/TASK-007-notify-devices-line-push-count.md` § Review | BE Jason | TASK-006 |
| TASK-008 | Admin web: sign-in + users | SPEC-001 | DONE 2026-11-01, SA Sober reviewed (live rerun on real back end) — `tasks/TASK-008-admin-web-signin-and-users.md` § Review round 2 | FE Fern | TASK-002 (DONE) |
| TASK-009 | Admin web: AI settings + LINE count | SPEC-001 | DONE 2026-11-01, SA Sober reviewed (live on real back end) — `tasks/TASK-009-admin-web-ai-settings-and-line-count.md` § Review | FE Fern | TASK-006, TASK-007 (DONE) |
| TASK-010 | LINE core (signature, intake rule, codes, fake LINE API) | SPEC-002 | DONE 2026-11-01, SA-B reviewed (tests re-run) — `tasks/TASK-010-line-core-pure-logic.md` § Review | BE Bob | TASK-001 |
| TASK-011 | LINE migration, webhook, events, ingest | SPEC-002 | DONE 2026-11-01, SA-B reviewed (62/0 re-run); ingest wiring moved to TASK-012 — `tasks/TASK-011-line-webhook-migration-events.md` § Review | BE Bob | TASK-010 |
| TASK-012 | LINE app endpoints | SPEC-002 | DONE 2026-11-01, SA-B reviewed (75/0 re-run); ingest wiring moved to TASK-013 — `tasks/TASK-012-line-app-endpoints.md` § Review | BE Bob | TASK-011, TASK-002 |
| TASK-013 | LINE notifier + push rows (+ ingest wiring) | SPEC-002 | DONE 2026-11-01, SA-B reviewed (87/0 LINE, 180/0 repo re-run); registration → TASK-020 — `tasks/TASK-013-line-notifier-and-push-rows.md` § Review | BE Bob | TASK-012 |
| TASK-014…018, 024 | App on Flutter | SPEC-003 rev 1 | SUPERSEDED 2026-11-01 by TASK-025…030 (owner: not Flutter, D36) — SA-B | — | — |
| TASK-025 | App: Capacitor + React scaffold, shell, web + debug APK | SPEC-003 | DONE 2026-11-01, SA-B review (re-ran build/test/APK) — `tasks/TASK-025-app-capacitor-scaffold-shell.md` | — | — |
| TASK-026 | App list + detail comp (REQ-005 AC-1) | SPEC-003 | DONE 2026-11-01, SA-B re-review (sticky bar measured); AC-1 comp waits for PM — `tasks/TASK-026-app-list-detail-comp.md` | PM Porter (comp) | TASK-025 |
| TASK-027 | App M1: real sign-in + list + 2 APKs (D35) | SPEC-003 | DONE 2026-11-01, SA-B review (build/39 tests/APK SHAs re-run); `cornerchat-fake.apk` ready for the owner's phone — `tasks/TASK-027-app-m1-signin-list-apks.md` | — | TASK-026 |
| TASK-028 | App LINE screens | SPEC-003 | DONE 2026-11-01, SA-B review (48 tests re-run; live link proven) — `tasks/TASK-028-app-line-screens.md` | — | TASK-027 |
| TASK-029 | App sign-out, detail, conditions, Zimbra, offline | SPEC-003 | DONE 2026-11-01, SA Sober reviewed (84 pass; AC-5 on emulator); mail reply UNVERIFIED (B2) — `tasks/TASK-029-app-signout-detail-conditions-mail-offline.md` § Review | FE Fern (Team A) | A: TASK-025 · B: TASK-027, 028 |
| TASK-030 | App phone push | SPEC-003 | DONE 2026-11-01, SA-B review (104 tests + APK SHAs re-run; AC-2 in Doze ≤ 32 s) — `tasks/TASK-030-app-phone-push.md` | — | TASK-029 |
| TASK-021 | Admin web: month picker in Thai month + Buddhist year (P3) | SPEC-001 | DONE 2026-11-01, SA Sober reviewed (input only; grid header stays 2026) — `tasks/TASK-021-admin-month-picker-thai.md` § Review | FE Fern | TASK-009 |
| TASK-023 | Rule-decided "about" line (ตรงกฎของคุณ: …), not "AI ไม่ได้ตรวจ" | SPEC-001 | DONE 2026-11-01, SA Sober reviewed (331/0) — `tasks/TASK-023-rule-decided-about-line.md` § Review | BE Jason | TASK-005, TASK-007 |
| TASK-031 | DEF-1: AI token budget 4096 + timeout 40 s + log tokens; about-line head + word-boundary cut | SPEC-001 | DONE 2026-11-01, SA Sober reviewed (367/0, real probe 0/16) — `tasks/TASK-031-ai-token-budget-and-about-line-head.md` § Review | BE Jason | TASK-006, TASK-023 |
| TASK-032 | Unhandled errors logged without data fields (SA-B's note) | SPEC-001 | DONE 2026-11-01, SA Sober reviewed (375/0, real PG check) — `tasks/TASK-032-safe-error-log.md` § Review | BE Jason | — |
| TASK-020 | Register LINE notifier + live push check | SPEC-002 | DONE 2026-11-01, SA-B reviewed (95/0 LINE re-run) — `tasks/TASK-020-line-register-notifier-and-live-push.md` § Review | BE Bob | TASK-013, TASK-007 |
| TASK-022 | LINE fails closed without a token | SPEC-002 | DONE 2026-11-01, SA-B reviewed (100/0 LINE, 321/0 repo re-run) — `tasks/TASK-022-line-fail-closed-without-token.md` § Review | BE Bob | TASK-020 |

### QA / Tests
| REQ | TEST | Status (date, pointer) | Verdict |
|-----|------|------------------------|---------|
| REQ-001 | TEST-001 | run 3 2026-11-01, Tanya: app rows PASS on browser 360 px + native APK on emulator-5554 (app `bc72845c…`, back `f930f30b…`); emulator slot returned — `tests/TEST-001-req-001-accounts-and-isolation.md` § Run 3 | **TEST_PASSED** |
| REQ-004 | TEST-003 | run 4 2026-11-01, Tanya: app rows PASS on browser 360 px + native APK on emulator-5554 (app `bc72845c…`) — `tests/TEST-003-req-004-conditions-and-ai-filter.md` § Run 4 | **TEST_PASSED** |
