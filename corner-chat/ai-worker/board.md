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
| REQ-002 | Zimbra mail in + reply | HIGH | DELIVERED 2026-11-01 (PM) — TEST-002 run 2 PASS incl. the owner's real-Zimbra window; `tests/TEST-002-req-002-zimbra-mail-in-and-reply.md` § Verdict | PM |
| REQ-003 | LINE groups in + LINE 1-on-1 notify | HIGH | DELIVERED 2026-11-01 (PM) — TEST-004 run 2 + the real-LINE live run (AC-8 @All ✅); B7 NOT_TESTED — `tests/TEST-004-line-groups-in-and-line-notification.md` | PM |
| REQ-005 | Android app | HIGH | DELIVERED 2026-11-02 (PM) — TEST-005 run 6 8/8; a real phone UNVERIFIED — `tests/TEST-005-android-app.md` § Verdict | PM |

## Tasks

| Id | Title | Source SPEC | Status (date, owner, pointer) | Owner | Depends on |
|----|-------|-------------|-------------------------------|-------|------------|
| TASK-003 | Zimbra connect + intake | SPEC-001 | DONE 2026-11-01, SA Sober — live on real Zimbra (to/cc rows, nothing read, 0 password in log); Thai on the real server UNVERIFIED — `tasks/TASK-003-zimbra-connect-and-intake.md` § Review | BE Jason | TASK-002 |
| TASK-004 | Mail reply outbox | SPEC-001 | DONE 2026-11-01, SA Sober — live: reply sent, 1 Sent copy each, retry no dup; threading in B needs the owner's look — `tasks/TASK-004-mail-reply-outbox.md` § Review | BE Jason | TASK-003 code |
| TASK-043 | App: header + tab bar inside the phone's safe area (owner's phone, HIGH) | SPEC-003 | DONE 2026-11-03, SA-B review (diff, 130 tests, APK cert/SHA/bundle re-checked); new APK d9ec28e2…; owner's phone UNVERIFIED — `tasks/TASK-043-app-safe-area-system-bars.md` | FE Fanta | emulator free |
| TASK-042 | App: release APK must not expose WebView debugging (TEST-006 Q2, MINOR) | SPEC-003 | DONE 2026-11-02, SA-B review — cause = userdebug emulator; release guard in, signed APK rebuilt (3edb05dc…); real phone UNVERIFIED; QA re-test Q2 — `tasks/TASK-042-release-apk-webview-debugging.md` | FE Fanta | TASK-041, emulator free |
| TASK-041 | App: release APK (signed, HTTPS, SIT API) | SPEC-003 | DONE 2026-11-02, SA-B review (cert, APK SHA, bundle, manifest re-checked); APK built, not sent; owner to back up the key folder — `tasks/TASK-041-app-release-apk.md` § Review | FE Fanta | — |
| TASK-038 | App: back key closes an open dialog/menu first (D46 extended) | SPEC-003 | DONE 2026-11-01, SA-B review (130 tests re-run; 4 overlay rows + 5 back rows on device); ready for QA re-test — `tasks/TASK-038-app-back-key-closes-dialogs.md` § Review | FE Fanta | TASK-037 |
| TASK-037 | App: grouped-notification tap opens the message (DEF-2) + back key = back arrow (D46) | SPEC-003 | DONE 2026-11-01, SA-B review (122 tests re-run; cause confirmed ranker_group; device 5/5, 3/3, 3/3); ready for QA re-test #4 #5 #17 — `tasks/TASK-037-app-notification-group-and-back-key.md` § Review | FE Fanta | — |
| TASK-035 | App: no password/token/message text in logcat (DEF-1) | SPEC-003 | DONE 2026-11-01, SA-B review (APK config read); DEF-1 ready for QA re-test (local APK needs the D43 DB URL) — `tasks/TASK-035-app-no-sensitive-logs.md` | — | — |
| TASK-034 | LINE live guard: real api.line.me only with LINE_LIVE=1 (D44) | SPEC-002 | DONE 2026-11-01, SA-B review (24 guard tests re-run); hold stays until Team A setup.ts is in — `tasks/TASK-034-line-live-guard.md` | — | — |
| TASK-033 | Owner's Postgres server (no local cluster) + complete .env.example (D43) | SPEC-001 §8a | DONE 2026-11-01, SA Sober reviewed (407/0 on the owner's server, unencrypted per D45) — `tasks/TASK-033-owner-postgres-and-env-example.md` § Review | BE Jason | — |
| TASK-036 | App: retry a failed reply from the message detail (REQ-002 DEF-1) | SPEC-001 §3.4 | DONE 2026-11-01, SA Sober (109 pass; live row-18: mail once) — `tasks/TASK-036-app-detail-reply-retry.md` § Review | SA Sober | TASK-029 |
| TASK-039 | Back end recovers by itself after the DB drops its connection (TEST-005 obs.) | SPEC-001 §8a | DONE 2026-11-02, SA Sober — pool timeouts (60 s idle / 30 min life); drop cause not established — `tasks/TASK-039-db-reconnect-after-dropped-connection.md` § Review | BE Jason | TASK-033 |
| TASK-040 | Test script timeout 30 s for the remote DB | SPEC-001 §8a | DONE 2026-11-02, SA Sober (bun run test → 409/0, 347 s) — `tasks/TASK-040-test-timeout-for-remote-db.md` § Review | BE Jason | TASK-039 |

## QA / Tests

| REQ | TEST | Status (date, pointer) | Verdict |
|-----|------|------------------------|---------|
| REQ-002 | TEST-002 | run 2 2026-11-01, Tanya: stand-in 48/48, app 15/15 (app `25db8739…`), owner window qa7k all PASS; DEF-1 fixed — `tests/TEST-002-req-002-zimbra-mail-in-and-reply.md` § Run 2 | **TEST_PASSED** |
| REQ-003 | TEST-004 | run 3 2026-11-01, Tefany: REAL LINE live — link, codes, group, reply, name, mention, @All (type all), hold, push ×4 all PASS; closed, DB dropped — `tests/TEST-004-line-groups-in-and-line-notification.md` § Run 3 | **TEST_PASSED** (B7, #1b NOT_TESTED) |
| REQ-001…005 (SIT) | TEST-006 | round 1 final 2026-11-03, Tanya: rows 1–11 PASS for corner-chat's part; 0 open defects; entronica→Gmail forward blocked outside corner-chat (relay spam reject) — `tests/TEST-006-sit-release-pass-round-1.md` § Verdict | **TEST_PASSED** |
| REQ-005 | TEST-005 | run 6 2026-11-02, Tefany: APK `05fbbbca…` (TASK-037/038) on owner's server 8/8; 0 open defects — `tests/TEST-005-android-app.md` § Run 6 | **TEST_PASSED** |

## Blocked / waiting

| Item | Waiting on | Since | Pointer |
|------|-----------|-------|---------|
| Owner: `TEST_MAIL_A_PASSWORD` (B2) + `DATABASE_URL` with his new password (D43) + create branch D1 (B6). B1 given; B3/B4/B5 dropped | owner | 2026-11-01 | `../project-docs/decisions-for-owner-review.md` §B · `SYSTEM-FACTS.md` |
