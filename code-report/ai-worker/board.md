# Board — code-report

> Single source of truth for CURRENT state. Update me at the end of every session
> (see PROTOCOL.md). **File discipline (workspace-root `DISPATCHER.md`, binds all
> roles):** detail lives in the TASK/REQ file; a board cell is ONE line (status +
> date + owner + pointer); a log entry is ≤ 15 lines. Never paste evidence or
> keep old text here. Full pre-compaction boards:
> `archive/board-2026-08-21-pre-compaction.md`,
> `archive/board-2026-08-25-pre-compaction.md`.
> **`ai-worker/inbox/` now exists** (per DISPATCHER.md): the inbox is a delivery
> channel — read, act, then delete; the log remains history only.

## Project info

- Description: web tool that takes a git repository (public, or private via PAT),
  analyses the codebase + commits for a chosen day/date range, accepts extra
  free-text context, and produces a readable written dev-work summary — on
  screen, later optionally emailed. Stakeholder infrastructure: AI API CENTER
  (his multi-provider AI API), PostgreSQL, SMTP.
- Product name on screen: `KnowCode` (REQ-001 Req 14; repos/folders NOT renamed).
- Repos: `C:\Users\Admin\develyst\code-report\code-report-back` (Jason) ·
  `C:\Users\Admin\develyst\code-report\code-report-front` (Fern).
- Team: Porter (PM) · Sober (SA Lead) · Jason (BE) · Fern (FE) · Tanya (QA,
  operational since 2026-08-21, **local-only** — no deployed environment; no-SQL
  rule not relaxed for her; nothing handed to her yet). See PROTOCOL.md.
- 🧪 Trial ground for the DISPATCHER (workspace-root `DISPATCHER.md`): one
  session spawns the roles as subagents. Files remain the only channel;
  PROTOCOL unchanged.
- Standing rules still live: no SQL / real environments for the team (human is
  the data source, via DATA REQUEST); copy bundle CLOSED by Q14 (new strings
  need a TASK line + human yes/no); dates rendered `DD/MMM/YY` per Req 15.
- **Copy rule refined 2026-08-24 (Q37):** an English word inside a Thai screen is
  **not** an inconsistency here (he counts it as Thai). **Language scope (Q39):**
  Thai-primary applies to everything **the stakeholder reads**; team-internal
  artifacts (REQ/SPEC/TASK, board, log) stay English. **UI reword (Q40 =
  "แก้เลย"):** the team rewords existing UI strings Thai-primary → **REQ-007**
  (overrides Q37 for that pass). **Q41 open (NON-BLOCKING,** REQ-001
  §Questions**):** do reworded strings still come back for his yes/no — working
  default = yes.
- **Frontend toolchain (Q34/Q35): bun only, npm dropped permanently.** He
  committed the lockfile swap himself at `d44f523`.
- **REQ-001 consolidated 2026-08-25:** full Q&A trail archived at
  `archive/REQ-001-2026-08-25-pre-consolidation.md`; Req numbering unchanged.

## Requirements

| ID | Title | Priority | Status | Owner of next step |
|----|-------|----------|--------|--------------------|
| REQ-001 | Readable dev-work report from a git repo | HIGH | IN_SPEC — Reqs 16/17/18 TASK lines still unwritten (parked queue item 8); Q41 open NON-BLOCKING (REQ-001 §Questions) | Sober (queue) |
| REQ-002 | *(number RESERVED, unwritten — see parked facts)* Email the finished report | — | not written yet | Porter (PM) |
| REQ-003 | Frontend UI quality + folder-structure overhaul | HIGH | IN_SPEC — TASK-015 open; TASK-016 blocked on paper only, Q-SA-17 answered "ก" awaiting Sober's transcription (REQ-003 §Questions) | Sober · Fern (TASK-015) |
| REQ-004 | New-report form usability + back from report page | HIGH | IN_SPEC 2026-08-21 — SPEC-003 ACTIVE; 017/018/019 DONE, only TASK-020 left; Q32/Req 7d freeze widening unwritten (REQ-004 §Questions) | Fern (TASK-020) · Sober (7d widening) |
| REQ-005 | Frontend repo runs on bun instead of npm | HIGH | DELIVERED 2026-08-24 (Porter) — evidence in REQ-005 + TASK-021 §Review | — |
| REQ-006 | Inconsistencies on the new-report screen | HIGH | SPEC_DONE — PM acceptance 2026-08-25; visual confirm Q-REQ006-1 with the human (REQ-006 §Questions); on his "ok" → DELIVERED | Human → Porter |
| REQ-007 | Reword existing UI strings Thai-primary (Q40) | MEDIUM | IN_SPEC 2026-08-24 — SPEC-006 ACTIVE; TASK-024 BLOCKED on Q-SA-22 sign-off (SPEC-006 §Questions) | Porter (relay Q-SA-22) → Fern |
| REQ-008 | Deeper backend AI pipeline — 5-stage redesign | HIGH | DELIVERED 2026-08-25 (Porter) — all sign-offs cleared at `4bfc21e`; detail in REQ-008 + SPEC-007 §Questions | — · Sober (optional appendix-cleanup assessment, NON-BLOCKING) |
| REQ-009 | Show AI_CURIOUSNESS + AI_UNDERSTANDING as their own progress steps | MEDIUM | SPEC_DONE 2026-08-25 — both SPEC-008 tasks DONE (`803a44c` BE, `e75346e` FE); labels DRAFT pending Q-SA-26 (SPEC-008 §Questions) | Porter (acceptance run + relay Q-SA-26, both NON-BLOCKING) |

## Specs

| ID | Title | Source | Status | Owner of next step |
|----|-------|--------|--------|--------------------|
| SPEC-001 | Report API, data model, git + AI pipeline | REQ-001 | ACTIVE — amendments queued (parked queue) | Sober |
| SPEC-002 | Frontend UI redesign + folder rebuild | REQ-003 | ACTIVE — Decision 3.4 WITHDRAWN; freeze items 1+4 partially released for SPEC-003 (annotations in SPEC-002) | Fern (TASK-015) |
| SPEC-003 | New-report form usability + back | REQ-004 | ACTIVE 2026-08-21 — 017/018/019 DONE, only TASK-020 open; 7d freeze widening unwritten | Fern (TASK-020) · Sober |
| SPEC-004 | bun replaces npm | REQ-005 | DONE 2026-08-24 — REQ-005 DELIVERED | — |
| SPEC-005 | New-report screen: button alignment + date-format parity | REQ-006 | DONE 2026-08-24 — both tasks DONE (`859148a`, `68a1475`) | — (REQ-006 with Porter/human) |
| SPEC-006 | Thai-primary UI reword | REQ-007 | ACTIVE 2026-08-24 — Form 2 ruled; scope = `th` values in `dictionaries.ts` only; drafts gated on Q-SA-22 | Porter (Q-SA-22) · Fern (TASK-024) |
| SPEC-007 | 5-stage AI pipeline, env model+max_tokens per call | REQ-008 | DONE 2026-08-25 — TASK-025..029 all DONE; Q-SA-24/Q-SA-25 answered + transcribed; REQ-008 DELIVERED | — · Sober (appendix cleanup, NON-BLOCKING) |
| SPEC-008 | Surface the two reasoning stages in progress | REQ-009 | DONE 2026-08-25 — TASK-030/031 DONE; combined live-highlight run = Porter/human follow-up; Q-SA-26 open | Porter (Q-SA-26 + acceptance run) |

## Tasks

| ID | Title | Source | Status | Assignee | Depends on |
|----|-------|--------|--------|----------|------------|
| TASK-001 | BE — skeleton, config, schema, seed | SPEC-001 | IN_PROGRESS — code complete; DoD close is Sober's review call (parked queue item 3) | Jason | none |
| TASK-002 | BE — auth | SPEC-001 | DONE 2026-08-20 — TASK-002 §Review | Jason | 001 |
| TASK-003 | BE — git layer | SPEC-001 | DONE 2026-08-20 at `2e441bf` — TASK-003 §Review | Jason | 001 |
| TASK-004 | BE — AI client + 3-stage pipeline | SPEC-001 | DONE 2026-08-20 at `e3453a8` — TASK-004 §Review | Jason | 001 |
| TASK-005 | BE — report endpoints + worker | SPEC-001 | DONE 2026-08-21 at `4101551` — TASK-005 §Review | Jason | 002-004 |
| TASK-006 | FE — shell, login, i18n | SPEC-001 | DONE 2026-08-20 — TASK-006 §Review | Fern | none |
| TASK-007 | FE — new-report form | SPEC-001 | DONE 2026-08-20 — TASK-007 §Review | Fern | 006 |
| TASK-008 | FE — report view | SPEC-001 | DONE 2026-08-20 at `f00e78d` — TASK-008 §Review | Fern | 006 |
| TASK-009 | BE+FE — acceptance run th+en, runs 1–11 | SPEC-001 | TODO — working arrangement: team writes click-through script, human runs (Q24 closed 2026-08-21); re-scope is Sober's | Jason + Fern | 005, 008 (DONE) |
| TASK-010 | FE — folder rebuild | SPEC-002 | DONE 2026-08-21 at `9b6345c` — TASK-010 §Review | Fern | none |
| TASK-011 | FE — shell + login redesign (cobalt theme, KnowCode) | SPEC-002 | DONE 2026-08-21 at `0b63dec` — TASK-011 §Review | Fern | 010 |
| TASK-012 | FE — new-report form redesign | SPEC-002 | DONE 2026-08-21 at `8cac881` — TASK-012 §Review | Fern | 011 |
| TASK-013 | FE — report view redesign | SPEC-002 | DONE 2026-08-21 at `1f90b87` — TASK-013 §Review | Fern | 011, 012 |
| TASK-014 | BE — one real API-driven job (Postgres path + AI tier) | SPEC-001 | Phase A DONE 2026-08-24 (runbook FINAL); BLOCKED (waiting: human via Porter — run output into `../project-docs/`) — TASK-014 §Review | Porter (relay) → Jason (Phase B) | 005 (DONE) |
| TASK-015 | FE — session-expired line (Q-SA-14) | SPEC-002 | TODO 2026-08-21 — behaviour only, no new string | Fern | 013 (DONE) |
| TASK-016 | FE — local acceptance hand-over (Q-SA-15/Q23) | SPEC-002 | BLOCKED on paper only — Q-SA-17 answered "ก"; Sober transcribes + re-scopes (REQ-003 §Questions) | Fern, via Sober | 015 |
| TASK-017 | BE — repo inspection endpoints | SPEC-003 | DONE 2026-08-21 at `d1f0993` — TASK-017 §Review | Jason | none |
| TASK-018 | FE — re-shaped form | SPEC-003 | DONE 2026-08-21 at `f70fb02` — TASK-018 §Review | Fern | 017, 019 |
| TASK-019 | FE — back from the report page | SPEC-003 | DONE 2026-08-21 at `32e8eed` — TASK-019 §Review | Fern | 013 |
| TASK-020 | FE — Req 7 usability pass, every screen | SPEC-003 | TODO, STARTABLE 2026-08-21 — ceiling Req 7c until Sober writes the 7d widening; 2 carried-in gaps in its file | Fern | 018 (DONE) |
| TASK-021 | FE — verify bun toolchain (REQ-005 AC 1) | SPEC-004 | DONE 2026-08-24 at `d44f523` — TASK-021 §Review | Fern | none |
| TASK-022 | FE — load buttons align with dropdowns (REQ-006 Req 1) | SPEC-005 | DONE 2026-08-24 at `859148a` — TASK-022 §Review | Fern | none |
| TASK-023 | FE — period inputs render `DD/MMM/YY` (REQ-006 Req 3) | SPEC-005 | DONE 2026-08-24 at `68a1475` — TASK-023 §Review | Fern | 022 (DONE) |
| TASK-024 | FE — apply approved Thai-primary `th` strings | SPEC-006 | BLOCKED (waiting: stakeholder sign-off via Porter — Q-SA-22) | Fern | Q-SA-22 answered |
| TASK-025 | BE — per-stage model+max_tokens config | SPEC-007 | DONE 2026-08-24 at `1663ee9` — TASK-025 §Review | Jason | none |
| TASK-026 | BE — RepoInspector over the live clone | SPEC-007 | DONE 2026-08-24 at `157e5a2` — TASK-026 §Review | Jason | none |
| TASK-027 | BE — client flip + 5-stage pipeline + worker wiring | SPEC-007 | DONE 2026-08-25 at `23df16f` — TASK-027 §Review | Jason | 025, 026 |
| TASK-028 | BE — real AI_CURIOUSNESS text-action loop | SPEC-007 | DONE 2026-08-25 at `75acb5f` — TASK-028 §Review | Jason | 026, 027 |
| TASK-029 | BE — model-level fallback (Req-7) | SPEC-007 | DONE 2026-08-25 at `4bfc21e` — TASK-029 §Review | Jason | 027 |
| TASK-030 | BE — wire stage list six→eight, identity map | SPEC-008 | DONE 2026-08-25 at `803a44c` — TASK-030 §Review | Jason | none |
| TASK-031 | FE — eight-stage ledger + two draft labels | SPEC-008 | DONE 2026-08-25 at `e75346e` — TASK-031 §Review | Fern | none |

## Blocked / waiting

Closed/answered rows from before 2026-08-25 are archived verbatim in
`archive/board-2026-08-25-pre-compaction.md` (each carried a Detail pointer into
its REQ/SPEC/TASK file, where the answers live).

| Item | Waiting on | Question (short) |
|------|-----------|------------------|
| EVIDENCE HAND-OVER (open) — TASK-014 Run A + Run B output into `../project-docs/` | human; Porter relays | Blocks TASK-014 Phase B only. Detail: TASK-014 §Review |
| Q-SA-22 (open) — REQ-007 loanword policy + Q41 sign-off gate | human; Porter relays | Blocks TASK-024. Detail: SPEC-006 §Questions |
| Q-REQ006-1 (open) — visual confirm of the two REQ-006 fixes | human | Blocks REQ-006 DELIVERED only. Detail: REQ-006 §Questions |
| Q-SA-26 (open, NON-BLOCKING) — the two draft step labels for REQ-009 | human; Porter relays | Final wording = one-line dict edit. Detail: SPEC-008 §Questions |
| Q41 (open, NON-BLOCKING) — do reworded strings still come back for his yes/no | human; Porter relays | Working default = yes. Detail: REQ-001 §Questions |
| BRUNO COOKIE CARRY (2026-08-24) — does Bruno carry `cr_session` Step 2 → 3/4 itself? | @Jason, inside the D3 rework | Not a human question; if unestablishable, `curl` stays primary. Detail: TASK-014 §Questions |
| Q-BE-24 (2026-08-24, NON-BLOCKING) — `Step N` English or Thai inside the Thai `docs` blocks | @Sober, at the TASK-014 review | Jason kept it English and said why. Detail: TASK-014 §Questions |
| DEPLOYMENT NOTE — cookie `Secure` needs https + `NODE_ENV=production` | whichever TASK first deploys | No deployment TASK exists; parked so it is not lost. Origin: Q-BE-3 in TASK-002 |

## Sober's parked queue (state, one unit per session; detail at the pointers)

0. **Still open from the running top item:** **Q-SA-17 → TASK-016** (transcribe +
   move + re-scope the hand-over — he starts the backend too), then the
   **Q32/Req 7d freeze widening → TASK-020** (7c released; how far SPEC-002's
   freeze opens is an unwritten design unit; 7e keeps sanitizer + PAT rules out,
   Q14 keeps copy out), then **TASK-009's re-scope** on Q24's recorded
   recommendation. Also NEW 2026-08-25: **the optional REQ-008 appendix-cleanup
   assessment** (orphaned `REPORT_STRUCTURE`/`stage3System`; if useless → SPEC-007
   amendment + NEW task, not a rework). All prior sub-items CLOSED — history in
   `archive/board-2026-08-25-pre-compaction.md`.
1. TASK line for the flaky auth test (1-in-20 tampered-token false pass).
   Evidence: TASK-003 §Review — rework pass.
2. Decide if the two swallowed git-layer failure paths get SPEC-001 error codes
   (worker-side rule already bound into TASK-005 item 6). Origin: TASK-003 review.
3. TASK-001 DoD review call — migrate/seed evidence in
   `../project-docs/db-migrate-seed-run-2026-08-20.md` and
   `../project-docs/seed-users-run-2026-08-21.md` (caveats: no exit code printed;
   `updated`, not `created`).
4. Whether TASK-005's dummy-token PAT-grep evidence uses that same database.
5. ~~KnowCode TASK line~~ CLOSED 2026-08-21 — folded into TASK-011.
6. Query-string secret in repo URL (`?token=…` stored/echoed/written to
   `.git/config`) — SPEC-001 line before TASK line. Origin: TASK-005 review.
7. Q-SA-11 answered (b): distinct th/en sentence for credentialed-URL
   `INVALID_URL` — one string pair + `ValidationIssue`; wording goes to the human
   for yes/no (Q-SA-4 precedent).
8. TASK lines for Reqs 16/17/18 (16 = BE, also adds the "reproduce dates exactly"
   rule to `stage2System` per TASK-004 review; 17/18 = FE).
9. One SPEC-001 error-table amendment covering Q-BE-10 (`REPORT_NOT_FOUND`) +
   Q-BE-12 (refused private host row) + the implementing BE TASK line.
10. Candidate (ranked last): per-run nonce delimiter for `REPO_CLOSE` blocks.
    Origin: TASK-004 review.
11. (Q-FE-17) real rendering question — artefact hypothesis FALSIFIED 2026-08-21;
    next probe (named by Fern, not run): scan missed logical-property longhands
    (`border-block-start-color` etc.). Error still carried by icon + words +
    `aria-invalid`, never colour alone. Detail: TASK-012 review + TASK-013 §9.
12. (Q-BE-14, candidate) Should `finished_at` be readable through
    `GET /api/reports/:jobId` at all? Written on all terminal transitions but in
    no SELECT/type/wire shape; nothing asks for it. Origin: TASK-014 Phase A review.
13. Standing lesson: `../project-docs/` shorthand is wrong the moment it is handed
    to someone in a different directory — stakeholder-facing artifacts carry
    **absolute paths**.
14. (TASK-017 review) The inspection clone is UNBOUNDED — no semaphore on
    `POST /api/repos/committers` full clones; a SPEC-003 decision before a TASK
    line (share worker semaphore / separate bound / new config key). Nothing blocked.
15. (Q-BE-17 + Q-BE-18, candidate, ranked last) Relocate `classifyRunFailure` +
    duplicated `renderIssues` into `src/errors/` in one TASK. Cosmetic. Origin:
    TASK-017 review.
16. (Q-FE-25, candidate, ranked last) Period pre-fill on a browser not on the
    Asia/Bangkok day — default value only, no wrong submission possible; fix would
    be a human question. Origin: TASK-018 review.

## Facts parked during compaction (2026-08-21 + 2026-08-25)

- **ID desync (bookkeeping, numbering stays as-is):** REQ-002 is
  reserved-but-unwritten (email feature) and **SPEC-002 pairs with REQ-003**,
  not REQ-002. No renumbering.
- Everything removed in the two compactions (session narratives, answered-question
  histories, review evidence prose, the closed Blocked/waiting rows) exists
  verbatim in `archive/board-2026-08-21-pre-compaction.md`,
  `archive/board-2026-08-25-pre-compaction.md`, the daily logs, and the
  TASK/REQ/SPEC files' own sections.
- REQ-001's full Q&A trail: `archive/REQ-001-2026-08-25-pre-consolidation.md`.
- Old dispatcher runs (2026-08-20-a … 2026-08-24-g):
  `archive/dispatcher-state-2026-08-25.md`.
