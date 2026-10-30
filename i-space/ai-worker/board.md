# Board — i-space

> Single source of truth for CURRENT state. Update me at the end of every session
> (see PROTOCOL.md). **File discipline:** detail lives in the TASK/REQ/TEST file;
> a board cell is ONE line (status + date + owner + pointer); a log entry is ≤ 15
> lines. Never paste evidence or keep old text here. Sweep `DONE` / `DELIVERED`
> rows to `archive/board-closed.md` the moment they close.

## Project info

- Description: **I-Space (Intelligent Space)** — the owner's own product, two parts of one
  project: **Blueprint** (an AI interview turns sources into a confirmed spec version) and
  **CAW** (the AI-workforce runner that executes Blueprint's confirmed versions with Claude CLI
  workers, *"เสมือน Atom"*). Brownfield: built earlier by another AI desk, whose memory is not
  here yet (`legacy/README.md`). Everything the owner has said is in
  **`SYSTEM-FACTS.md` — read it first, every session.**
- Repos (logical names only — absolute paths in the workspace-root
  `machine.local.md`), all on branch `atom`: Team A `blueprint-back`, `blueprint-front` ·
  Team B `caw-back`, `caw-front`. Seams: `PROTOCOL.md` § Hard boundaries.
- Stack: Bun, TypeScript; backs Hono + zod-openapi + Drizzle; fronts Next 16 / React 19 (in the code)
- Mode: manual (`<Name>-ISP` sessions in tmux, never `claude -p`)
- Environments: this machine only; live Claude CLI runs only on the owner's word
- Team: the PM (PM / BA / PO / UX writer) · QA — both teams · Team A (Blueprint): SA · BE · FE · Team B (CAW): SA · BE · FE — names in `TEAMS.md`. New IDs start at 101.
- Read first: `SYSTEM-FACTS.md`, then `PROTOCOL.md` + your role file, then this
  board, then your inbox, then today's log.

## Requirements

| Id | Title | Priority | Status (date, owner, pointer) | Ball |
|----|-------|----------|-------------------------------|------|
| REQ-108 | Live E2E: Health Board via Blueprint → CAW → real CLI | HIGH (owner 13:02) | phase 2 TEST_FAILED (2026-10-30 15:29, Tanya; TEST-106 § Phase 2) → P2-1 = REQ-118, P2-2/3 = REQ-119; phase 3 (AC-4 live) after both committed (PM 15:3x) | — (waits 118/119) |
| REQ-118 | A spec entered by hand reaches every CAW worker | HIGH (PM, from TEST-106 P2-1) | IN_SPEC (2026-10-30 15:4x, Sober; A side SPEC-115 → TASK-145/146, after REQ-115 commit; Q1 answered 15:4x) · B side SPEC-117 → TASK-149/150, ON HOLD until REQ-119 committed (Silver 16:1x) | Jason (TASK-134 first) · Bob (after REQ-119) |
| REQ-119 | A run does not end while a card is workable; hand-off names people | HIGH (PM, from TEST-106 P2-2/3) | r1 DELIVERED + COMMITTED (2026-10-30 16:4x; caw-back 7956aa7 · caw-front 7a2a6a5, PM verified) · r2 (DEF-1, req 4/AC-4) SPEC_DONE (16:4x, Silver; TASK-151 DONE, § AC check AC-4; uncommitted: caw-back 2 paths on 7956aa7) | PM → QA (AC-4 stub) |
| REQ-115 | Each gateway call uses a model that fits the task | MEDIUM (owner via Atom 09:49) | DELIVERED + COMMITTED (2026-10-30 16:4x; bp-back 93249a7 · bp-front b08d23a, PM verified) | — |

## Tasks

| Id | Title | Source SPEC | Status (date, owner, pointer) | Owner | Depends on |
|----|-------|-------------|-------------------------------|-------|------------|
| TASK-145 | blueprint-back — `requirements` in every part context, v1 + v2 (REQ-118) | SPEC-115 | TODO, ON HOLD until REQ-115 committed (2026-10-30 15:4x, Sober; `tasks/TASK-145-blueprint-back-requirements-in-context.md`) | BE Jason (A) | REQ-115 committed |
| TASK-146 | blueprint-front — gen:api for `requirements` (REQ-118) | SPEC-115 | TODO, ON HOLD (2026-10-30 15:4x, Sober; `tasks/TASK-146-blueprint-front-gen-api-requirements.md`) | FE Fern (A) | TASK-145 openapi · REQ-115 front committed |
| TASK-151 | caw-back — `no_progress` line counts turns since the card's last progress (REQ-119 r2) | SPEC-116 D4 | DONE (2026-10-30 16:4x, Silver; `tasks/TASK-151-caw-back-stop-line-counts-turns-since-progress.md` § Review) | BE Bob (B) | REQ-119 r1 committed (7956aa7) ✓ |
| TASK-149 | caw-back — requirements route, chat prompt block, requirement anchors, coverage, pull flag (REQ-118) | SPEC-117 | TODO, ON HOLD (2026-10-30 16:1x, Silver; `tasks/TASK-149-caw-back-requirements-reach-workers.md`) | BE Bob (B) | REQ-119 committed |
| TASK-150 | caw-front — gen:api for the requirements route (REQ-118) | SPEC-117 | TODO, ON HOLD (2026-10-30 16:1x, Silver; `tasks/TASK-150-caw-front-gen-api-requirements.md`) | FE Fanta (B) | TASK-149 openapi · REQ-119 front committed |

## QA / Tests

| REQ | TEST | Status (date, pointer) | Verdict |
|-----|------|------------------------|---------|
| REQ-101 | TEST-101 | TEST_PASSED (2026-10-29 01:20, Tanya; `tests/TEST-101-understand-all-the-code.md` § Verdict) — 11/11 AC PASS, named NOT_TESTED, seam notes S-F1…F6 | TEST_PASSED → PM |
| REQ-102 | TEST-102 | TEST_PASSED (2026-10-29 12:02, Tanya, round 2; `tests/TEST-102-gap-owner-intent-vs-code.md` § Verdict) — 7/7 AC; DEF-1 fixed | TEST_PASSED → PM |
| REQ-107 | TEST-103 | TEST_PASSED (2026-10-29 12:36, Tanya; `tests/TEST-103-caw-wake-workers-study.md`) — AC-1 cites + AC-4; Q1 (claude --help) non-blocking | TEST_PASSED → PM |
| REQ-103 | TEST-104 | TEST_PASSED (2026-10-29 14:27, Tanya; `tests/TEST-104-blueprint-spec-store.md` § Verdict) — 11/11 AC; git-step condition O-1 (TASK-109 mixed in) | TEST_PASSED → PM |
| REQ-104 | TEST-105 | TEST_PASSED (2026-10-29 14:45, Tanya; `tests/TEST-105-caw-live-cli-view.md` § Verdict) — 7/7 AC on stub evidence; O-2 split-secret question; O-5 traces keep secrets | TEST_PASSED → PM |
| REQ-108 | TEST-106 | TEST_FAILED phase 2 (2026-10-30 15:29, Tanya; `tests/TEST-106-e2e-live-dashboard.md` § Phase 2) — AC-4 FAIL (P2-1); 6 live hops, gateway 0 | TEST_FAILED → PM |
| REQ-110 | TEST-107 | TEST_FAILED round 4 (2026-10-30 02:25, Tanya; `tests/TEST-107-blueprint-interview-honest.md` § Round 4) — AC-2…9 PASS (AC-8 9/9, AC-9 120 s kept); AC-1 live FAIL: DEF-4 (URLs as `api` path); 3/6 calls | TEST_FAILED → PM |
| REQ-111 | TEST-108 | TEST_PASSED (2026-10-29 16:53, Tanya; `tests/TEST-108-caw-workers-work-in-folder.md` § Verdict) — AC-1/2/3/5; Q1 accepted by the owner (REQ-113); verdict = fp 18ca4d833a46 / 686c119cd01c; committed 80e3e88 / f071c02 = tested tree (17:11) | TEST_PASSED → PM |
| REQ-113 | TEST-109 | TEST_PASSED round 2 (2026-10-29 17:50, Tanya; `tests/TEST-109-caw-workers-cannot-act-as-operator.md` § Round 2) — DEF-1 fixed, 40 bypass variations refused; DEF-2 MINOR (`--json` to own port refused) | TEST_PASSED → PM |
| REQ-105 | TEST-110 | TEST_PASSED (2026-10-30 11:54, Tanya; `tests/TEST-110-caw-reads-latest-spec.md` § Re-check after TASK-140) — joint run 24/24 + all suites; R-22/R-23 added | TEST_PASSED → PM |
| REQ-114 | TEST-111 | TEST_PASSED round 2 (2026-10-30 13:11, Tanya; `tests/TEST-111-blueprint-stores-service-urls.md` § Round 2) — AC-1…4; DEF-2 Thai-glued URL, DEF-3 prefix (MINOR) open | TEST_PASSED → PM |
| REQ-112 | TEST-112 | TEST_PASSED round 2 (2026-10-30 14:43, Tanya; `tests/TEST-112-caw-card-rules-coverage.md` § Round 2) — AC-5 + DEF-1 closed live; R-25/R-26 green | TEST_PASSED → PM |
| REQ-117 | TEST-113 | TEST_PASSED (2026-10-30 14:57, Tanya; `tests/TEST-113-caw-starting-team-review-report.md`) — fresh root first hop starts; review line in report + board; suites green | TEST_PASSED → PM |
| REQ-116 | TEST-114 | TEST_PASSED (2026-10-30 15:17, Tanya; `tests/TEST-114-blueprint-url-catcher-edges.md`) — AC-1…3; Q1/Q2 non-blocking → PM | TEST_PASSED → PM |
| REQ-115 | TEST-115 | TEST_PASSED (2026-10-30 16:3x, Tanya; `tests/TEST-115-gateway-model-per-task.md`) — AC-1…6; live 2 of 6 calls | TEST_PASSED → PM |
| REQ-119 | TEST-116 | TEST_PASSED (2026-10-30 16:36, Tanya; `tests/TEST-116-caw-run-honest-end-named-handoff.md`) — AC-1…3, stub CLI; DEF-1 MINOR | TEST_PASSED → PM |

## Blocked / waiting

| Item | Waiting on | Since | Pointer |
|------|-----------|-------|---------|
