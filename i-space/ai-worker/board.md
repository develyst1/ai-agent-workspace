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
| REQ-128 | CAW front + back build the way the owner deploys (standalone / Bun binary) | HIGH (owner 2026-10-31 18:39) | READY_FOR_SA (2026-10-31 18:4x, PM; DECISIONS 18:4x; skill deploy-ready-build; nichaphon) | SA B (Silver) |
| REQ-127 | Blueprint front + back build the way the owner deploys (standalone / Bun binary) | HIGH (owner 2026-10-31 via Atlas) | DELIVERED + COMMITTED (2026-10-31 18:38 on nichaphon; bp-front fbf3424 · bp-back d8df886, PM verified; AC-4 NOT_TESTED → first server run) | — |
| REQ-108 | Live E2E: Health Board via Blueprint → CAW → real CLI | HIGH (owner 13:02) | DELIVERED (2026-10-30 18:0x, PM; TEST-106 phase 3 PASSED live; committed trees) — P3-1/P3-2 → REQ-121 | — |
| REQ-121 | CAW's starting team works card by card, each role on its own card | HIGH (PM, from TEST-106 P3-1/P3-2) | DELIVERED + COMMITTED (2026-10-30 18:5x; caw-back d33e586 · caw-front 04e2874, PM verified) | — |
| REQ-122 | CAW workers stay open like Atom; whole team works at once (was "REQ-106") | HIGH (owner 2026-10-29 11:41 items 5/7/9) | DELIVERED + COMMITTED (2026-10-30 22:3x; caw-back 2426d9a · caw-front a009d2c, PM verified) | — |
| REQ-124 | A new project built through I-Space end to end, locally (full-loop rehearsal) | HIGH (owner 2026-10-30 23:32) | DELIVERED (2026-10-31 03:2x, PM; TEST-122 r2 PASSED live on committed HEADs, no git needed; DEF-2 → REQ-126 r2; DECISIONS 03:2x) | — |
| REQ-126 | CAW chat: each question its own answer; no second open plan; no worker junk in the product | HIGH (PM, from TEST-122 F-1/F-2/F-5) | r1 COMMITTED (caw-back 5b49f65 · caw-front 7f68c42) · r2 DELIVERED + COMMITTED (2026-10-31 05:12; caw-back 8271082 · caw-front e7a36eb, PM verified; O-2 accepted, DECISIONS 05:1x) | — |
| REQ-125 | A card in review always has a note; a server card stays with the BE | HIGH (owner 2026-10-31 00:24) | DELIVERED + COMMITTED (2026-10-31 01:3x; caw-back 5779554 · caw-front ce5ca8d, PM verified; AC-4 live in REQ-124 r2) | — |
| REQ-123 | I-Space can be set up on a Linux server from its own docs (was "REQ-109") | HIGH (owner 2026-10-29 13:04) | **CANCELLED** (owner 2026-10-31 00:24; work removed: bp-back 08e1e4d · bp-front 6a64527, CAW uncommitted work discarded; DECISIONS 2026-10-30 23:3x…2026-10-31 00:2x) | — |
| REQ-118 | A spec entered by hand reaches every CAW worker | HIGH (PM, from TEST-106 P2-1) | DELIVERED + COMMITTED (2026-10-30 17:5x; bp-back 6123018 · bp-front 6692a16 · caw-back 3efcc1a · caw-front 1287772, PM verified) | — |
| REQ-120 | A second CAW run with the same number works, or says why not | HIGH (PM, from TEST-117 O-1) | DELIVERED + COMMITTED (2026-10-30 18:1x; caw-back 3795236, PM verified) | — |
| REQ-119 | A run does not end while a card is workable; hand-off names people | HIGH (PM, from TEST-106 P2-2/3) | r1 DELIVERED + COMMITTED (2026-10-30 16:4x; caw-back 7956aa7 · caw-front 7a2a6a5, PM verified) · r2 DELIVERED + COMMITTED (2026-10-30 16:5x; caw-back b6fbfaf, PM verified) | — |
| REQ-115 | Each gateway call uses a model that fits the task | MEDIUM (owner via Atom 09:49) | DELIVERED + COMMITTED (2026-10-30 16:4x; bp-back 93249a7 · bp-front b08d23a, PM verified) | — |

## Tasks

| Id | Title | Source SPEC | Status (date, owner, pointer) | Owner | Depends on |
|----|-------|-------------|-------------------------------|-------|------------|
| TASK-172 | blueprint-front — standalone output + static copy in `build` (REQ-127) | SPEC-127 | DONE + COMMITTED (2026-10-31 18:38, Sober; bp-front fbf3424 on nichaphon; `tasks/TASK-172-blueprint-front-standalone-build.md` § Review) | FE Fern (A) | none (nichaphon 6a64527) |
| TASK-173 | blueprint-back — `build` compiles one Linux binary; prove what it carries (REQ-127) | SPEC-127 | DONE + COMMITTED (2026-10-31 18:38, Sober; bp-back d8df886 on nichaphon; DoD 6–7 UNVERIFIED no Linux; `tasks/TASK-173-blueprint-back-compile-linux-binary.md` § Review) | BE Jason (A) | none (nichaphon 08e1e4d) |
| TASK-170 | caw-back — a later plan adds only work not open on the board; `Proposal.onBoard` (REQ-126 r2) | SPEC-126 | DONE + COMMITTED (2026-10-31 05:12, Silver; caw-back 8271082; `tasks/TASK-170-caw-back-plan-adds-only-new-work.md` § Review) | BE Bob (B) | REQ-126 r1 committed 5b49f65 ✓ |
| TASK-171 | caw-front — plan reads `onBoard`: copy badge / partial line; mock; gen:api (REQ-126 r2) | SPEC-126 | DONE + COMMITTED (2026-10-31 05:12, Silver; caw-front e7a36eb; `tasks/TASK-171-caw-front-plan-on-board-line.md` § Review) | FE Fanta (B) | r1 front committed 7f68c42 ✓ · TASK-170 openapi (gen:api only) |
| TASK-161 | blueprint-front — theme fonts from the repo (`next/font/local`), fresh clone builds first time (REQ-123 r2) | SPEC-122 | DONE + COMMITTED (2026-10-30 22:04, Sober; bp-front 119942e; `tasks/TASK-161-blueprint-front-local-fonts.md` § Review) | FE Fern (A) | REQ-123 r1 committed 3096bca ✓ |
| TASK-155 | blueprint-back — start checks, `start`, pm2 file, `.env.example`, README (REQ-123) | SPEC-121 | DONE + COMMITTED (2026-10-30 20:49, Sober; bp-back 861e35a; pm2 DoD 8 HELD; `tasks/TASK-155-blueprint-back-start-checks-pm2-readme.md` § Review) | SA Sober (A) | none (base 6123018) |
| TASK-156 | blueprint-front — start check, `start`, pm2 file, `PORT`, README (REQ-123) | SPEC-121 | DONE + COMMITTED (2026-10-30 20:49, Sober; bp-front 3096bca; DoD 10 pm2 HELD; `tasks/TASK-156-blueprint-front-start-check-pm2-readme.md` § Review) | FE Fern (A) | none (base 6692a16) |
| TASK-168 | caw-back — plan accepted once; worker temp folder; review/done refused on a temp folder in the work folder (REQ-126) | SPEC-125 | DONE + COMMITTED (2026-10-31 02:4x; caw-back 5b49f65; `tasks/TASK-168-caw-back-plan-copy-temp-folder-refusal.md` § Review) | BE Bob (B) | REQ-125 committed 5779554 ✓ |
| TASK-169 | caw-front — answers kept and sent as one message; start waits; plan copy shown accepted (REQ-126) | SPEC-125 | DONE + COMMITTED (2026-10-31 02:4x; caw-front 7f68c42; `tasks/TASK-169-caw-front-answers-together-plan-copy.md` § Review) | FE Fanta (B) | REQ-125 front committed ce5ca8d ✓ · TASK-168 openapi (gen:api only) |
| TASK-166 | caw-back — review needs a note (done + howToTry); BE card → FE only with a reason (REQ-125) | SPEC-124 | DONE (2026-10-31 01:0x, Silver; uncommitted on 2426d9a, fp a8e76ef8bc69; `tasks/TASK-166-caw-back-review-note-role-handoff.md` § Review) | BE Bob (B) | REQ-122 committed 2426d9a ✓ |
| TASK-167 | caw-front — gen:api for the review note + hand-off reason (REQ-125) | SPEC-124 | DONE (2026-10-31 01:1x, Silver; uncommitted on a009d2c; `tasks/TASK-167-caw-front-gen-api-review-note.md` § Review) | FE Fanta (B) | TASK-166 openapi.json |
| TASK-163 | caw-back — API + runner start lines; a new work root prepares itself with shipped hooks (REQ-123 B) | SPEC-123 | REMOVED (owner's order 2026-10-30 23:46, Silver 23:5x; REQ-123 cancelled; tree back to 2426d9a) | BE Bob (B) | REQ-122 committed 2426d9a ✓ |
| TASK-164 | caw-back — README, `.env.example`, pm2 file (REQ-123 B) | SPEC-123 | REMOVED (owner's order 2026-10-30 23:46, Silver 23:5x; REQ-123 cancelled; tree back to 2426d9a) | BE Bob (B) | TASK-163 DONE |
| TASK-165 | caw-front — offline build (local font), start check, hint, `.env.example`, pm2 file, README (REQ-123 B) | SPEC-123 | REMOVED (owner's order 2026-10-30 23:46, Silver 23:5x; REQ-123 cancelled; tree back to a009d2c) | FE Fanta (B) | REQ-122 front committed a009d2c ✓ |
| TASK-162 | caw-back runner — restart rule reads the last call's context, not the summed usage (REQ-122 r2) | SPEC-120 r2 | DONE + COMMITTED (2026-10-30 22:3x; caw-back 2426d9a; `tasks/TASK-162-caw-back-restart-rule-reads-real-context.md` § Review) | BE Bob (B) | TASK-160 DONE ✓ · PM's release ✓ |
| TASK-157 | caw-back — one running hop per worker and per card; check-in sessions (REQ-122) | SPEC-120 | DONE (2026-10-30 20:2x, Silver; uncommitted on d33e586; `tasks/TASK-157-caw-back-hop-per-worker-and-team-sessions.md` § Review) | BE Bob (B) | REQ-121 committed d33e586 ✓ |
| TASK-158 | caw-front — gen:api sessions; live screen "ว่าง · เปิดรอรับงาน" (REQ-122) | SPEC-120 | DONE (2026-10-30 20:3x, Silver; uncommitted on 04e2874, fp 3ce60b3d3217; `tasks/TASK-158-caw-front-sessions-idle-screen.md` § Review) | FE Fanta (B) | TASK-157 openapi.json ✓ |
| TASK-159 | caw-back runner — parallel planner `start_hops`; MCP hop id per call (REQ-122) | SPEC-120 | DONE (2026-10-30 20:3x, Silver; uncommitted on d33e586; `tasks/TASK-159-caw-back-runner-parallel-planner.md` § Review) | BE Bob (B) | TASK-157 DONE ✓ |
| TASK-160 | caw-back runner — open worker process per (project, worker), restart rule, crash, sessions (REQ-122) | SPEC-120 | DONE (2026-10-30 21:0x, Silver; uncommitted on d33e586; `tasks/TASK-160-caw-back-runner-open-worker-process.md` § Review) | BE Bob (B) | TASK-159 DONE |
| TASK-145 | blueprint-back — `requirements` in every part context, v1 + v2 (REQ-118) | SPEC-115 | DONE (2026-10-30 17:28, Sober; uncommitted on 93249a7; `tasks/TASK-145-blueprint-back-requirements-in-context.md` § Review) | BE Jason (A) | REQ-115 committed 93249a7 ✓ |
| TASK-146 | blueprint-front — gen:api for `requirements` (REQ-118) | SPEC-115 | DONE (2026-10-30 17:30, Sober; uncommitted on b08d23a; `tasks/TASK-146-blueprint-front-gen-api-requirements.md` § Review) | FE Fern (A) | TASK-145 openapi ✓ · REQ-115 front committed b08d23a ✓ |
| TASK-151 | caw-back — `no_progress` line counts turns since the card's last progress (REQ-119 r2) | SPEC-116 D4 | DONE (2026-10-30 16:4x, Silver; `tasks/TASK-151-caw-back-stop-line-counts-turns-since-progress.md` § Review) | BE Bob (B) | REQ-119 r1 committed (7956aa7) ✓ |
| TASK-149 | caw-back — requirements route, chat prompt block, requirement anchors, coverage, pull flag (REQ-118) | SPEC-117 | DONE (2026-10-30 17:1x, Silver; `tasks/TASK-149-caw-back-requirements-reach-workers.md` § Review) | BE Bob (B) | REQ-119 r2 committed (b6fbfaf) ✓ |
| TASK-153 | caw-back — card worker does its own card: rule 2, other-cards line, rule 7; chat rule 3 by role (REQ-121) | SPEC-119 | DONE (2026-10-30 18:27, Silver; `tasks/TASK-153-caw-back-card-worker-does-its-own-card.md` § Review) | BE Bob (B) | REQ-120 committed 3795236 ✓ |
| TASK-154 | caw-front — BE ↔ FE edges in the starting team (REQ-121) | SPEC-119 | DONE (2026-10-30 18:20, Silver; caw-front uncommitted, fp 868b4b0843c5; `tasks/TASK-154-caw-front-starting-team-be-fe-edges.md` § Review) | FE Fanta (B) | REQ-120 committed 3795236 ✓ |
| TASK-152 | caw-back — the typed number is this run's steps; remove the project-wide budget check (REQ-120) | SPEC-118 | DONE (2026-10-30 18:10, Silver; `tasks/TASK-152-caw-back-run-budget-is-per-run.md` § Review) | BE Bob (B) | REQ-118 committed 3efcc1a ✓ |
| TASK-150 | caw-front — gen:api for the requirements route (REQ-118) | SPEC-117 | DONE (2026-10-30 17:1x, Silver; `tasks/TASK-150-caw-front-gen-api-requirements.md` § Review) | FE Fanta (B) | TASK-149 openapi · REQ-119 front committed (7a2a6a5) ✓ |

## QA / Tests

| REQ | TEST | Status (date, pointer) | Verdict |
|-----|------|------------------------|---------|
| REQ-101 | TEST-101 | TEST_PASSED (2026-10-29 01:20, Tanya; `tests/TEST-101-understand-all-the-code.md` § Verdict) — 11/11 AC PASS, named NOT_TESTED, seam notes S-F1…F6 | TEST_PASSED → PM |
| REQ-102 | TEST-102 | TEST_PASSED (2026-10-29 12:02, Tanya, round 2; `tests/TEST-102-gap-owner-intent-vs-code.md` § Verdict) — 7/7 AC; DEF-1 fixed | TEST_PASSED → PM |
| REQ-107 | TEST-103 | TEST_PASSED (2026-10-29 12:36, Tanya; `tests/TEST-103-caw-wake-workers-study.md`) — AC-1 cites + AC-4; Q1 (claude --help) non-blocking | TEST_PASSED → PM |
| REQ-103 | TEST-104 | TEST_PASSED (2026-10-29 14:27, Tanya; `tests/TEST-104-blueprint-spec-store.md` § Verdict) — 11/11 AC; git-step condition O-1 (TASK-109 mixed in) | TEST_PASSED → PM |
| REQ-104 | TEST-105 | TEST_PASSED (2026-10-29 14:45, Tanya; `tests/TEST-105-caw-live-cli-view.md` § Verdict) — 7/7 AC on stub evidence; O-2 split-secret question; O-5 traces keep secrets | TEST_PASSED → PM |
| REQ-108 | TEST-106 | TEST_PASSED phase 3 (2026-10-30 18:03, Tanya; `tests/TEST-106-e2e-live-dashboard.md` § Phase 3) — full live loop, 5 hops, gateway 0 | TEST_PASSED → PM |
| REQ-110 | TEST-107 | TEST_FAILED round 4 (2026-10-30 02:25, Tanya; `tests/TEST-107-blueprint-interview-honest.md` § Round 4) — AC-2…9 PASS (AC-8 9/9, AC-9 120 s kept); AC-1 live FAIL: DEF-4 (URLs as `api` path); 3/6 calls | TEST_FAILED → PM |
| REQ-111 | TEST-108 | TEST_PASSED (2026-10-29 16:53, Tanya; `tests/TEST-108-caw-workers-work-in-folder.md` § Verdict) — AC-1/2/3/5; Q1 accepted by the owner (REQ-113); verdict = fp 18ca4d833a46 / 686c119cd01c; committed 80e3e88 / f071c02 = tested tree (17:11) | TEST_PASSED → PM |
| REQ-113 | TEST-109 | TEST_PASSED round 2 (2026-10-29 17:50, Tanya; `tests/TEST-109-caw-workers-cannot-act-as-operator.md` § Round 2) — DEF-1 fixed, 40 bypass variations refused; DEF-2 MINOR (`--json` to own port refused) | TEST_PASSED → PM |
| REQ-105 | TEST-110 | TEST_PASSED (2026-10-30 11:54, Tanya; `tests/TEST-110-caw-reads-latest-spec.md` § Re-check after TASK-140) — joint run 24/24 + all suites; R-22/R-23 added | TEST_PASSED → PM |
| REQ-114 | TEST-111 | TEST_PASSED round 2 (2026-10-30 13:11, Tanya; `tests/TEST-111-blueprint-stores-service-urls.md` § Round 2) — AC-1…4; DEF-2 Thai-glued URL, DEF-3 prefix (MINOR) open | TEST_PASSED → PM |
| REQ-112 | TEST-112 | TEST_PASSED round 2 (2026-10-30 14:43, Tanya; `tests/TEST-112-caw-card-rules-coverage.md` § Round 2) — AC-5 + DEF-1 closed live; R-25/R-26 green | TEST_PASSED → PM |
| REQ-117 | TEST-113 | TEST_PASSED (2026-10-30 14:57, Tanya; `tests/TEST-113-caw-starting-team-review-report.md`) — fresh root first hop starts; review line in report + board; suites green | TEST_PASSED → PM |
| REQ-116 | TEST-114 | TEST_PASSED (2026-10-30 15:17, Tanya; `tests/TEST-114-blueprint-url-catcher-edges.md`) — AC-1…3; Q1/Q2 non-blocking → PM | TEST_PASSED → PM |
| REQ-115 | TEST-115 | TEST_PASSED (2026-10-30 16:3x, Tanya; `tests/TEST-115-gateway-model-per-task.md`) — AC-1…6; live 2 of 6 calls | TEST_PASSED → PM |
| REQ-119 | TEST-116 | TEST_PASSED round 2 (2026-10-30 16:52, Tanya; `tests/TEST-116-caw-run-honest-end-named-handoff.md` § Round 2) — AC-4, DEF-1 fixed; AC-1…3 regression | TEST_PASSED → PM |
| REQ-118 | TEST-117 | TEST_PASSED (2026-10-30 17:46, Tanya; `tests/TEST-117-hand-entered-spec-reaches-workers.md`) — AC-1…5 joint, stub; AC-6 = REQ-108 ph.3 | TEST_PASSED → PM |
| REQ-120 | TEST-118 | TEST_PASSED (2026-10-30 18:14, Tanya; `tests/TEST-118-caw-second-run-honest-budget.md`) — AC-1…3, stub; TEST-117 O-1 fixed | TEST_PASSED → PM |
| REQ-121 | TEST-119 | TEST_PASSED (2026-10-30 18:45, Tanya; `tests/TEST-119-caw-team-works-card-by-card.md`) — AC-1/2/4 stub, AC-3 live 13 hops | TEST_PASSED → PM |
| REQ-123 | TEST-120 | A round 2 TEST_FAILED (2026-10-30 21:58, Tanya; `tests/TEST-120-linux-deploy-ready-team-a.md` § Round 2) — AC-9 PASS (DEF-1 fixed); AC-10 DEF-2 MINOR (✓ → √) | TEST_FAILED (A r2) → PM |
| REQ-122 | TEST-121 | TEST_PASSED round 2 (2026-10-30 22:23, Tanya; `tests/TEST-121-caw-open-workers-parallel.md` § Round 2) — AC-8 live: one session per worker, DEF-1 fixed | TEST_PASSED → PM |
| REQ-124 | TEST-122 | r2 TEST_PASSED (2026-10-31 03:18, Tanya; `tests/TEST-122-full-loop-rehearsal-new-project.md` § Round 2) — new product, 8/8 work, 0 interventions, 9/9 notes; r1 TEST_FAILED 00:54 | TEST_PASSED → PM |
| REQ-125 | TEST-123 | TEST_PASSED (2026-10-31 01:29 stub + AC-4 live 03:18 in REQ-124 r2, Tanya; `tests/TEST-123-review-note-and-builder-handoff.md`) — complete | TEST_PASSED → PM |
| REQ-127 | TEST-125 | TEST_PASSED (2026-10-31 18:3x, Tanya; `tests/TEST-125-blueprint-deploy-ready-build.md`) — AC-1/2/3/5 PASS; AC-4 NOT_TESTED (no Linux, PM-accepted) | TEST_PASSED → PM |
| REQ-126 | TEST-124 | r2 TEST_PASSED (2026-10-31 05:08, Tanya; `tests/TEST-124-chat-answers-plan-copy-temp-folders.md` § Round 2) — AC-7/8/9 PASS, DEF-2 fixed; O-2 noted | TEST_PASSED → PM |

## Blocked / waiting

| Item | Waiting on | Since | Pointer |
|------|-----------|-------|---------|
