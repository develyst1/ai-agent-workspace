# Board — corner-chat

> Single source of truth for CURRENT state. Update me at the end of every session
> (see PROTOCOL.md). **File discipline:** detail lives in the TASK/REQ/TEST file;
> a board cell is ONE line (status + date + owner + pointer); a log entry is ≤ 15
> lines. Never paste evidence or keep old text here. Sweep `DONE` / `DELIVERED`
> rows to `archive/board-closed.md` the moment they close.

## Project info

- Description: corner-chat — a unified inbox with an AI guard: messages from LINE, Discord, Zimbra Mail,
  Web Chat (later Microsoft Teams) in one place, filtered by AI before they reach people; auto-reply
  rules and a dashboard. The owner's requirement, verbatim:
  `../project-docs/requirements-from-owner-2026-11-01.md`. Everything the owner has said is in
  **`SYSTEM-FACTS.md` — read it first, every session.**
- Repos (logical names only — absolute paths in the workspace-root
  `machine.local.md`): `corner-chat-back`, `corner-chat-front` — both empty (README only), greenfield;
  branches `main` (checked out), `develop`, `atom`, `sit`, `uat`, `production`; **working branch
  undecided** (Blocked / waiting). Third repo `corner-chat-app` (Android app; owner 2026-11-01; README only) — written
  by the FE (Atlas 2026-11-01, `PROTOCOL.md` repo table). **Both teams work in all three repos**, split by the claims below.
- Stack: back = **Bun + Hono or Bun + Elysia only, never NestJS**, + Postgres (the SA chooses in SPEC-001)
  · front = the owner's admin web (owner 2026-11-01) · app = Android first, iOS later (owner 2026-11-01) — stacks in
  SPEC-001 · AI through the owner's LLM gateway. First round shape: `../project-docs/requirement-understanding-2026-11-01.md` §1c.
- Mode: **manual** (one session per role) — `DECISIONS.md` 2026-11-01.
- Environments: local only. Real systems: read when needed; any send or change needs the owner's go
  each time (DATA REQUEST through the PM) — `SYSTEM-FACTS.md`.
- Team: the PM (both teams) · Team A: SA, BE, FE, tester · Team B: SA, BE, FE, tester — names,
  inboxes (`-B` = Team B) and session names in `TEAMS.md`.
- Read first: `SYSTEM-FACTS.md`, then `PROTOCOL.md` + your role file, then this
  board, then your inbox, then today's log.

## Batch claims

> **State only — one line per ACTIVE batch.** The PM claims a file area per team
> **before either team starts** (`PROTOCOL.md` → "Two teams — batch claims"). Format:
> `Batch YYYY-MM-DD: Team A → <areas> · Team B → <areas>`
> An item spanning both claimed areas is not split — it goes to one team whole.

Batch 2026-11-01 (REQ-001…005): Team A → `corner-chat-back` all except the LINE area (base, auth, admin, mail, filter) · `corner-chat-front` all · Team B → `corner-chat-back` LINE area only (its folder named in Team A's SPEC-001, after the base lands) · `corner-chat-app` all, except TASK-029's file list → Team A FE Fern, reviewer Sober (D30 carried to SPEC-003 rev 2; `DECISIONS.md` 2026-11-01)

## Requirements

| Id | Title | Priority | Status (date, owner, pointer) | Ball |
|----|-------|----------|-------------------------------|------|
| REQ-001 | Accounts + owner's admin web | HIGH | DELIVERED 2026-11-01 (PM) — TEST-001 run 3 PASS; `tests/TEST-001-req-001-accounts-and-isolation.md` | PM |
| REQ-002 | Zimbra mail in + reply | HIGH | IN_SPEC 2026-11-01, SA Sober — SPEC-001, TASK-003/004; live checks need B2 | SA Team A |
| REQ-004 | User conditions + AI filter | HIGH | DELIVERED 2026-11-01 (PM) — TEST-003 run 4 PASS; `tests/TEST-003-req-004-conditions-and-ai-filter.md` | PM |
| REQ-003 | LINE groups in + LINE 1-on-1 notify | HIGH | IN_TEST 2026-11-01, QA Tefany — run 1 local all PASS; APK rows wait for emulator; real LINE NOT_TESTED (B1) — `tests/TEST-004-line-groups-in-and-line-notification.md` § Run 1 | QA Tefany |
| REQ-005 | Android app | HIGH | IN_TEST 2026-11-01, QA Tefany — web build 39/39 PASS; APK + push rows wait for emulator; mail parts NOT_TESTED (B2) — `tests/TEST-005-android-app.md` § Run 1 | QA Tefany |

## Tasks

| Id | Title | Source SPEC | Status (date, owner, pointer) | Owner | Depends on |
|----|-------|-------------|-------------------------------|-------|------------|
| TASK-001 | Back-end base | SPEC-001 | DONE 2026-11-01, SA Sober reviewed (tests re-run, migration = SPEC §5) — `tasks/TASK-001-back-end-base.md` § Review | BE Jason | — |
| TASK-002 | Accounts, sessions, admin users API | SPEC-001 | DONE 2026-11-01, SA Sober reviewed (27/0 re-run) — `tasks/TASK-002-accounts-sessions-admin-users.md` § Review | BE Jason | TASK-001 |
| TASK-003 | Zimbra connect + intake | SPEC-001 | BLOCKED 2026-11-01 (waiting: B2 for live lines; PM wording REQ-002 Q-SA-1) — code accepted on stand-in by SA — `tasks/TASK-003-zimbra-connect-and-intake.md` § Review | BE Jason | TASK-002 |
| TASK-004 | Mail reply outbox | SPEC-001 | BLOCKED 2026-11-01 (waiting: B2 for live lines) — code accepted on stand-in by SA (357/0) — `tasks/TASK-004-mail-reply-outbox.md` § Review | BE Jason | TASK-003 code |
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
| TASK-034 | LINE live guard: real api.line.me only with LINE_LIVE=1 (D44) | SPEC-002 | TODO 2026-11-01, SA-B — hold on .env servers until this + Team A setup.ts are in — `tasks/TASK-034-line-live-guard.md` | BE Bob | — |
| TASK-033 | Owner's Postgres server (no local cluster) + complete .env.example (D43) | SPEC-001 §8a | TODO 2026-11-01, SA Sober — live part waits on the owner's DATABASE_URL in .env — `tasks/TASK-033-owner-postgres-and-env-example.md` | BE Jason | — |
| TASK-020 | Register LINE notifier + live push check | SPEC-002 | DONE 2026-11-01, SA-B reviewed (95/0 LINE re-run) — `tasks/TASK-020-line-register-notifier-and-live-push.md` § Review | BE Bob | TASK-013, TASK-007 |
| TASK-022 | LINE fails closed without a token | SPEC-002 | DONE 2026-11-01, SA-B reviewed (100/0 LINE, 321/0 repo re-run) — `tasks/TASK-022-line-fail-closed-without-token.md` § Review | BE Bob | TASK-020 |

## QA / Tests

| REQ | TEST | Status (date, pointer) | Verdict |
|-----|------|------------------------|---------|
| REQ-001 | TEST-001 | run 3 2026-11-01, Tanya: app rows PASS on browser 360 px + native APK on emulator-5554 (app `bc72845c…`, back `f930f30b…`); emulator slot returned — `tests/TEST-001-req-001-accounts-and-isolation.md` § Run 3 | **TEST_PASSED** |
| REQ-002 | TEST-002 | DRAFT 2026-11-01, Tanya, 23 cases, 3 questions for PM — `tests/TEST-002-req-002-zimbra-mail-in-and-reply.md` | — (after SPEC_DONE; B2 needed) |
| REQ-004 | TEST-003 | run 4 2026-11-01, Tanya: app rows PASS on browser 360 px + native APK on emulator-5554 (app `bc72845c…`) — `tests/TEST-003-req-004-conditions-and-ai-filter.md` § Run 4 | **TEST_PASSED** |
| REQ-003 | TEST-004 | run 1 2026-11-01, Tefany: API/webhook 48/48 + app screens PASS on back `f930f30b…`, app `bc72845c…`; 0 defects — `tests/TEST-004-line-groups-in-and-line-notification.md` § Run 1 | IN_TEST (APK slot; B1/B7 NOT_TESTED) |
| REQ-005 | TEST-005 | run 1 2026-11-01, Tefany: web build 360 px 39/39 PASS, 0 defects; APK rows next — `tests/TEST-005-android-app.md` § Run 1 | IN_TEST (waiting: emulator slot from PM) |

## Blocked / waiting

| Item | Waiting on | Since | Pointer |
|------|-----------|-------|---------|
| Owner-only inputs B1–B4 + B6 (test LINE OA, test mailboxes, Firebase, gateway key, working branch) — listed, not asked (standing instruction 2026-11-01); no deploy (B5 dropped) | owner | 2026-11-01 | `../project-docs/decisions-for-owner-review.md` §B |
