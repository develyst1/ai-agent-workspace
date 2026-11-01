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

Batch 2026-11-01 (REQ-001…005): Team A → `corner-chat-back` all except the LINE area (base, auth, admin, mail, filter) · `corner-chat-front` all · Team B → `corner-chat-back` LINE area only (its folder named in Team A's SPEC-001, after the base lands) · `corner-chat-app` all

## Requirements

| Id | Title | Priority | Status (date, owner, pointer) | Ball |
|----|-------|----------|-------------------------------|------|
| REQ-001 | Accounts + owner's admin web | HIGH | IN_SPEC 2026-11-01, SA Sober — SPEC-001 ACTIVE, TASK-001/002/008 cut; wording Q-SA-1 for PM (non-blocking) | SA Team A |
| REQ-002 | Zimbra mail in + reply | HIGH | IN_SPEC 2026-11-01, SA Sober — SPEC-001, TASK-003/004; live checks need B2 | SA Team A |
| REQ-004 | User conditions + AI filter | HIGH | IN_SPEC 2026-11-01, SA Sober — SPEC-001, TASK-005/006/009; Q-SA-1 wording for PM (non-blocking) | SA Team A |
| REQ-003 | LINE groups in + LINE 1-on-1 notify | HIGH | IN_SPEC 2026-11-01, SA-B, `specs/SPEC-002-line-groups-in-and-line-notify.md` (ACTIVE); Q1 answered in REQ | SA Team B |
| REQ-005 | Android app | HIGH | IN_SPEC 2026-11-01, SA-B, `specs/SPEC-003-android-app.md` (ACTIVE) | SA Team B |

## Tasks

| Id | Title | Source SPEC | Status (date, owner, pointer) | Owner | Depends on |
|----|-------|-------------|-------------------------------|-------|------------|
| TASK-001 | Back-end base | SPEC-001 | DONE 2026-11-01, SA Sober reviewed (tests re-run, migration = SPEC §5) — `tasks/TASK-001-back-end-base.md` § Review | BE Jason | — |
| TASK-002 | Accounts, sessions, admin users API | SPEC-001 | DONE 2026-11-01, SA Sober reviewed (27/0 re-run) — `tasks/TASK-002-accounts-sessions-admin-users.md` § Review | BE Jason | TASK-001 |
| TASK-003 | Zimbra connect + intake | SPEC-001 | TODO 2026-11-01, SA, `tasks/TASK-003-zimbra-connect-and-intake.md` — live needs B2 | BE Jason | TASK-002 |
| TASK-004 | Mail reply outbox | SPEC-001 | TODO 2026-11-01, SA, `tasks/TASK-004-mail-reply-outbox.md` — live needs B2 | BE Jason | TASK-003 |
| TASK-005 | Conditions, rules, messages API | SPEC-001 | DONE 2026-11-01, SA Sober reviewed (93/0 on a private test DB) — `tasks/TASK-005-conditions-rules-messages-api.md` § Review | BE Jason | TASK-002 |
| TASK-019 | Test database per run (both teams test in one tree) | SPEC-001 | DONE 2026-11-01, SA Sober reviewed (2 runs at once green, no leftovers) — `tasks/TASK-019-test-database-per-run.md` § Review | BE Jason | TASK-005 |
| TASK-006 | AI layers, settings, corpus runner, fake gateway | SPEC-001 | DONE 2026-11-01, SA Sober reviewed (224/0, migration = SPEC) — `tasks/TASK-006-ai-layers-gateway-settings-corpus-runner.md` § Review | BE Jason | TASK-005 |
| TASK-007 | Notify (FCM + LINE seam), devices, push count | SPEC-001 | REVIEW 2026-11-01, BE Jason — step 0 + all DoD run (262 pass, live without Firebase); real push UNVERIFIED (needs B3 + app) — `tasks/TASK-007-notify-devices-line-push-count.md` | SA Sober | TASK-006 |
| TASK-008 | Admin web: sign-in + users | SPEC-001 | DONE 2026-11-01, SA Sober reviewed (live rerun on real back end) — `tasks/TASK-008-admin-web-signin-and-users.md` § Review round 2 | FE Fern | TASK-002 (DONE) |
| TASK-009 | Admin web: AI settings + LINE count | SPEC-001 | BLOCKED 2026-11-01 (waiting: TASK-006/007 live) — code accepted on mock by SA; wording item done by FE Fern — `tasks/TASK-009-admin-web-ai-settings-and-line-count.md` § Review | FE Fern | TASK-006, TASK-007 |
| TASK-010 | LINE core (signature, intake rule, codes, fake LINE API) | SPEC-002 | DONE 2026-11-01, SA-B reviewed (tests re-run) — `tasks/TASK-010-line-core-pure-logic.md` § Review | BE Bob | TASK-001 |
| TASK-011 | LINE migration, webhook, events, ingest | SPEC-002 | DONE 2026-11-01, SA-B reviewed (62/0 re-run); ingest wiring moved to TASK-012 — `tasks/TASK-011-line-webhook-migration-events.md` § Review | BE Bob | TASK-010 |
| TASK-012 | LINE app endpoints | SPEC-002 | DONE 2026-11-01, SA-B reviewed (75/0 re-run); ingest wiring moved to TASK-013 — `tasks/TASK-012-line-app-endpoints.md` § Review | BE Bob | TASK-011, TASK-002 |
| TASK-013 | LINE notifier + push rows (+ ingest wiring) | SPEC-002 | DONE 2026-11-01, SA-B reviewed (87/0 LINE, 180/0 repo re-run); registration → TASK-020 — `tasks/TASK-013-line-notifier-and-push-rows.md` § Review | BE Bob | TASK-012 |
| TASK-014 | App toolchain + scaffold + shell | SPEC-003 | TODO 2026-11-01, SA-B, `tasks/TASK-014-app-toolchain-scaffold-shell.md` | FE Fanta | — |
| TASK-015 | App list + detail comp (REQ-005 AC-1) | SPEC-003 | TODO 2026-11-01, SA-B, `tasks/TASK-015-app-message-list-detail-comp.md` | FE Fanta | TASK-014 |
| TASK-016 | App LINE screens | SPEC-003 | TODO 2026-11-01, SA-B, `tasks/TASK-016-app-line-screens.md` | FE Fanta | TASK-014 (live: TASK-012) |
| TASK-017 | App sign-in, messages, conditions, Zimbra, offline | SPEC-003 | TODO 2026-11-01, SA-B, `tasks/TASK-017-app-signin-messages-conditions-mail-offline.md` | FE Fanta | TASK-015, TASK-016 |
| TASK-018 | App phone push | SPEC-003 | TODO 2026-11-01, SA-B, `tasks/TASK-018-app-phone-push.md` — live needs B3 | FE Fanta | TASK-017 (live: TASK-007) |
| TASK-020 | Register LINE notifier + live push check | SPEC-002 | BLOCKED 2026-11-01 (waiting: Team A TASK-007 notify.ts), SA-B — `tasks/TASK-020-line-register-notifier-and-live-push.md` | BE Bob | TASK-013, TASK-007 |

## QA / Tests

| REQ | TEST | Status (date, pointer) | Verdict |
|-----|------|------------------------|---------|
| REQ-001 | TEST-001 | DRAFT 2026-11-01, Tanya, 21 cases, 3 questions for PM — `tests/TEST-001-req-001-accounts-and-isolation.md` | — (after SPEC_DONE) |
| REQ-002 | TEST-002 | DRAFT 2026-11-01, Tanya, 23 cases, 3 questions for PM — `tests/TEST-002-req-002-zimbra-mail-in-and-reply.md` | — (after SPEC_DONE; B2 needed) |
| REQ-004 | TEST-003 | DRAFT 2026-11-01, Tanya, 28 cases, 4 questions for PM; corpus labels need PM confirm — `tests/TEST-003-req-004-conditions-and-ai-filter.md` | — (after SPEC_DONE; B4 needed) |
| REQ-003 | TEST-004 | DRAFT 2026-11-01, Tefany, 36 cases; PM answered Q1–Q7, case 33 waits on SA-B (Q3) — `tests/TEST-004-line-groups-in-and-line-notification.md` | — (after SPEC_DONE; B1, B7) |
| REQ-005 | TEST-005 | DRAFT 2026-11-01, Tefany, 28 cases; PM answered Q1–Q5 — `tests/TEST-005-android-app.md` | — (after SPEC_DONE; B3 for push) |

## Blocked / waiting

| Item | Waiting on | Since | Pointer |
|------|-----------|-------|---------|
| Owner-only inputs B1–B4 + B6 (test LINE OA, test mailboxes, Firebase, gateway key, working branch) — listed, not asked (standing instruction 2026-11-01); no deploy (B5 dropped) | owner | 2026-11-01 | `../project-docs/decisions-for-owner-review.md` §B |
