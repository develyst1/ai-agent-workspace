# Board — portfolio-nichaphon

> Single source of truth for CURRENT state. Update me at the end of every session
> (see PROTOCOL.md). **File discipline (workspace-root `DISPATCHER.md`, binds all
> roles):** detail lives in the TASK/REQ file; a board cell is ONE line (status +
> date + owner + pointer); a log entry is ≤ 15 lines. Never paste evidence or
> keep old text here.

## Project info

- Description: **Personal portfolio / freelance-services website for Nichaphon
  Sayvav**, live at `portfolio.develyst.online`. Six routes — Home, About,
  Services, Portfolio, Blog, Contact — all static content, no backend.
- Code repository (single repo, brownfield — a working site already ships):
  logical name **`portfolio-nichaphon-web`**; absolute path only in the
  workspace-root `machine.local.md`. Frontend lives in `front/`.
- Stack (verified from the repo 2026-08-29): Next.js 15.5.24 App Router ·
  React 19.2 · TypeScript 5 · **Mantine 8.3.18** + `@tabler/icons-react` ·
  CSS Modules via `postcss-preset-mantine`. **No Tailwind, no backend, no
  database** — the repo-root `README.md` claiming NestJS + Prisma + Tailwind is
  stale; `front/README.md` is the accurate one.
- As-built survey (read-only, gathered before the team existed):
  `../project-docs/as-built-survey-2026-08-29.md`. It is source material, not a
  requirement — Porter still writes the first REQ from the human's words.
- Team: Porter (PM) · Sober (SA Lead) · Fern (FE — the only engineer) ·
  Tanya (QA — Senior Tester, local Playwright only).
  **No BE role** (no backend exists). A **QA role (Tanya)** now exists — she
  runs acceptance tests on local only and reports to Porter; the human still
  gives final business sign-off via Porter. If a backend ever appears, that is
  the human's scope decision, not a team improvisation.
- 🤖 Run mode: **DISPATCHER** (workspace-root `DISPATCHER.md`) — one session
  spawns the roles as subagents. Files remain the only channel; PROTOCOL
  unchanged. Dispatcher run log: `dispatcher-state.md`.
- Standing rules: git writes (`add`/`commit`/`push`, branches) are the human's
  alone — the team hands work off as edited files on `develop`. **Nobody
  deploys**: the live droplet, `pm2`, ssh, `merge-workflow.sh` and
  `release-workflow.sh` are the human's hands only. Real-world material (copy,
  screenshots, client facts) arrives via DATA REQUEST into `../project-docs/`.
- Branches on the repo: `develop` (current checkout) · `main` · `production`
  (+ `origin/D1`). Which branch a change targets is the human's call via Porter.

## Requirements

| ID | Title | Priority | Status | Owner of next step |
|----|-------|----------|--------|--------------------|
| REQ-001 | Visual identity rebuild — Home page first | HIGH | SPEC_DONE 2026-09-02, Porter — owner told the team to stop tracking his commits; N1-N3 withdrawn, QA re-verify round issued instead — see requirements/REQ-001-ui-visual-redesign.md §Standing rule + §QA re-verify round | Tanya (re-verify) + Human (AC1, AC2) |

## Tasks

| ID | Title | Source | Status | Assignee | Depends on |
|----|-------|--------|--------|----------|------------|
| TASK-001 | Token layer + fonts + dark-only mount | SPEC-001 | DONE 2026-08-30, Sober — see tasks/TASK-001-token-layer-fonts-dark-only.md §Review | — | — |
| TASK-002 | Shared primitives + quotes content | SPEC-001 | DONE 2026-08-30, Sober — see tasks/TASK-002-shared-primitives-and-quotes.md §Review | — | TASK-001 |
| TASK-003 | Shell rebuild (header, footer, eyebrow) | SPEC-001 | DONE 2026-08-30, Sober — FQ3/FQ4/FQ5 answered; drawer check carried to TASK-005 #18-19; see tasks/TASK-003-shell-rebuild.md §Review | — | TASK-001 |
| TASK-004 | Home rebuild — four sections | SPEC-001 | DONE 2026-08-30, Sober — FQ8 answered (min-height is a floor); 2 boxes carried to TASK-005 c16/c20; see tasks/TASK-004-home-rebuild.md §Review | — | TASK-002, TASK-003 |
| TASK-005 | Acceptance sweep before handover | SPEC-001 | DONE 2026-08-30, Sober — FQ9-FQ12 answered, c20(a) text corrected; see tasks/TASK-005-acceptance-sweep.md §Review | — | — |

## QA / Tests

| ID | Title | Source REQ | Status | Tester |
|----|-------|------------|--------|--------|
| TEST-001 | REQ-001 Home acceptance — independent QA round | REQ-001 | TEST_PASSED (partial) 2026-09-02, Tanya — re-verify done; R5 Thai differs from canonical, referred to Porter as Q4/Q5, not ticked — see tests/TEST-001-req001-home-acceptance.md §Re-verify round | Tanya |
| REGRESSION | Standing site regression checklist | — | OPEN 2026-09-02, Tanya — 19 checks; H3 has no agreed baseline until Q4 is answered; see tests/REGRESSION.md | Tanya |

## Blocked / waiting

| Item | Waiting on | Question (short) |
|------|-----------|------------------|
| REQ-001 acceptance | Human (owner) | 8 items (AC1+AC2 blocking; B, C, D, F, G, and new H footer-year non-blocking); A and E closed by QA — see requirements/REQ-001-ui-visual-redesign.md §Home acceptance review |
| REQ-001 quote-2 Thai | Porter → Human | Page renders `ผมไม่ทำงาน…`, R5 says `ผมไม่ได้ทำงาน…` (one word, not punctuation) — which is canonical? See tests/TEST-001-req001-home-acceptance.md §R5 difference + Q4/Q5 |
