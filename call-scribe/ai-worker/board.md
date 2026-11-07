# Board — call-scribe

> Single source of truth for CURRENT state. Update me at the end of every session
> (see PROTOCOL.md). **File discipline:** detail lives in the TASK/REQ/TEST file;
> a board cell is ONE line (status + date + owner + pointer); a log entry is ≤ 15
> lines. Never paste evidence or keep old text here. Sweep `DONE` / `DELIVERED`
> rows to `archive/board-closed.md` the moment they close.

## Project info

- Description: call-scribe — an app on the owner's Oppo Android phone that records or takes a call recording, has AI
  transcribe it, then says who said what and summarises the conversation. Solo use, no computer. The owner's
  requirement, verbatim: `../project-docs/requirements-from-owner-2026-11-06.md`. Everything the owner has said is in
  **`SYSTEM-FACTS.md` — read it first, every session.**
- Repos (logical names only — absolute paths in the workspace-root
  `machine.local.md`): `call-scribe-back`, `call-scribe-front` (Team A; greenfield) · `develyst-ai` (Team B first;
  the owner's gateway, brownfield). Branch `atom` in all 3.
- Stack: back = **Bun + Hono or Bun + Elysia only** · front = **never Flutter**; mobile web/PWA first (REQ-101
  Q1, delegated) · Postgres = the owner's dev Postgres, never a local one · AI through the owner's gateway.
- Mode: **manual** (one session per role) — `DECISIONS.md` 2026-11-06.
- IDs start at **101** (REQ, SPEC, TASK, TEST).
- Environments: local + the owner's dev Postgres. No dev server or production for this app yet.
- Team: the PM (both teams) · Team A: SA, BE, FE, tester · Team B: SA, BE, FE, tester — names, inboxes (`-B` = Team B)
  and session names in `TEAMS.md`.
- Read first: `SYSTEM-FACTS.md`, then `PROTOCOL.md` + your role file, then this
  board, then your inbox, then today's log.

## Batch claims

The PM claims a file area per team here before either team starts. Starting split (Atlas's design): Team A →
`call-scribe-back`, `call-scribe-front` · Team B → `develyst-ai`.

Batch 2026-11-06 (REQ-101): Team A → `call-scribe-back/*` · `call-scribe-front/*` · Team B → `develyst-ai/*` (audio endpoint and what it touches)

## Requirements

| Id | Title | Priority | Status (date, owner, pointer) | Ball |
|----|-------|----------|-------------------------------|------|
| REQ-101 | Call recording to transcript, who said what, summary | HIGH (team-proposed) | IN_SPEC 2026-11-06, Silver, contract `specs/SPEC-101-gateway-audio-endpoint.md`; app `specs/SPEC-102-app-intake-processing-results.md`; REQ `requirements/REQ-101-call-capture-transcript-summary.md` | Tanya (Q11 probe, then stub cases), owner (Q9 keys; `ขึ้น git` for TASK-110) |

## Tasks

| Id | Title | Source SPEC | Status (date, owner, pointer) | Owner | Depends on |
|----|-------|-------------|-------------------------------|-------|------------|
| TASK-101 | Gateway `/audio/*` routes, byte checks, jobs, stub | SPEC-101 | DONE 2026-11-06, Silver, restored by TASK-112, `tasks/TASK-101-gateway-audio-routes-jobs-stub.md` | BE (Bob) | none |
| TASK-102 | Gemini and xAI adapters, stubbed fetch only | SPEC-101 | DONE 2026-11-06, Silver, restored by TASK-112, `tasks/TASK-102-gateway-audio-gemini-xai-adapters.md` | BE (Bob) | TASK-101 |
| TASK-112 | Put back lost tracked edits, prove `/audio/*` again | SPEC-101 | DONE 2026-11-06, Silver, review and one open hang in `tasks/TASK-112-gateway-reapply-lost-tracked-edits.md` | BE (Bob) | none |
| TASK-103 | Provider check on synthetic Thai audio | SPEC-101 | BLOCKED (waiting: PM — owner's own word on US$0.50) 2026-11-07, Silver, prep DONE on stand-ins, no real call, `tasks/TASK-103-gateway-audio-provider-check.md` | BE (Bob) | TASK-112, owner's yes |
| TASK-104 | Back foundation, schema, login | SPEC-102 | DONE 2026-11-06, Sober, engineer-proven, review in `tasks/TASK-104-back-foundation-auth.md` | BE (Jason) | none |
| TASK-111 | Phone check page for AC-13 | SPEC-102 | DONE 2026-11-06, Sober, engineer-proven, no phone run, review in `tasks/TASK-111-front-phone-check-page.md` | FE (Fern) | TASK-108 |
| TASK-105 | Upload, intake, list, read, delete | SPEC-102 | DONE 2026-11-06, Sober, one test failure unreproduced (1 of 14 runs), review in `tasks/TASK-105-back-upload-intake.md` | BE (Jason) | TASK-104 |
| TASK-106 | Worker, gateway client, retry | SPEC-102 | DONE 2026-11-06, Sober, engineer-proven, review in `tasks/TASK-106-back-worker-gateway.md` | BE (Jason) | TASK-105 |
| TASK-107 | Front foundation, login, list | SPEC-102 | DONE 2026-11-06, Sober, engineer-proven, no phone run, review in `tasks/TASK-107-front-foundation-login-list.md` | FE (Fern) | none to start; real-back checks need TASK-104 |
| TASK-108 | Pick a file, strip, send | SPEC-102 | DONE 2026-11-06, Sober, engineer-proven, no phone run, review in `tasks/TASK-108-front-file-pick-send.md` | FE (Fern) | TASK-105, TASK-107 |
| TASK-109 | Record in the app | SPEC-102 | DONE 2026-11-06, Sober, engineer-proven, no phone run, review in `tasks/TASK-109-front-in-app-recording.md` | FE (Fern) | TASK-108 |
| TASK-110 | Result, retry, delete | SPEC-102 | DONE 2026-11-06, Sober, engineer-proven, no phone run, review in `tasks/TASK-110-front-result-actions.md` | FE (Fern) | TASK-106, TASK-107 |
| TASK-113 | One log line when a request or the worker's database call is slow | SPEC-102 Q11 | DONE 2026-11-07, Sober, engineer-proven, in e8a635f, not deployed, review in `tasks/TASK-113-back-slow-request-log.md` | BE (Jason) | none |
| TASK-114 | Add the error's code to the back's error log lines | SPEC-102 Q11 | DONE 2026-11-07, Sober, engineer-proven, in d7e36dc, not deployed, review in `tasks/TASK-114-back-log-error-code.md` | BE (Jason) | none |
| TASK-115 | A database call with no answer fails after 10 s, instead of hanging | SPEC-102 Q11 | DONE 2026-11-07, Sober, engineer-proven, in 22d8de8; real-database rerun outstanding, review in `tasks/TASK-115-back-bounded-database-wait.md` | BE (Jason) | none |
| TASK-116 | The hourly clean-up removes an audio folder with no row | SPEC-102 Q11 | TODO 2026-11-07, Sober, not started, `tasks/TASK-116-back-sweep-orphan-folders.md` | BE (Jason) | TASK-115 |

## QA / Tests

| REQ | TEST | Status (date, pointer) | Verdict |
|-----|------|------------------------|---------|
| REQ-101 AC-11 | TEST-101 | IN_TEST 2026-11-07, 61 cases 0 differences on 6711807, stubbed; rerun at SPEC_DONE, `tests/TEST-101-gateway-regression-ac11.md` | none yet |
| REQ-101 all other tester ACs | TEST-102 | DRAFT 2026-11-07, stub round 1 stopped: 48 PASS, 17 sorted as harness or pause, no confirmed defect; desk paused 12:18, harness fixes written, unproven; rerun on the PM's word, `tests/TEST-102-req-101-app-acceptance.md` § State at the desk pause | none yet |

## Blocked / waiting

| Item | Waiting on | Since | Pointer |
|------|-----------|-------|---------|
| Desk PAUSED for God Plan. All on git, ค้างตรวจ (pending review, no tester pass): back 22d8de8, front 4070f78, gateway 6711807, workspace 0fba0c2. No more merge | Owner (develyst-ai merge; Atlas; machine; budget word) | 2026-11-07 | `RESUME-HERE.md` |
| REQ-101 AC-9 only | Owner: one LINE test call when he has a free minute; the build does not wait | 2026-11-06 | REQ-101 § Questions Q4 |
| TASK-103 live calls, every real AI result | Owner: his own word in the PM's pane; ceiling US$0.50, small models, no DeepSeek; Silver re-sizes | 2026-11-07 | `DECISIONS.md`, 2026-11-07 lines |
| TEST-102's 9 real cases | Voices: provider TTS, if the Q9 keys come and it works; no install retry | 2026-11-06 | TEST-102 § Questions Q1 |
