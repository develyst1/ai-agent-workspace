# Spec — workforce skills (Atlas, 2026-10-05) — read fully before writing any skill

## Why

Desks were copying ~80 KB of charters each; copies drift ("Rules travel as a package, not as
copies" — workspace CLAUDE.md). The owner asked: put the profession in skills, keep the desk light.

## The split — the one rule every skill author must obey

| Lives in a SKILL (portable, one copy, versioned in this repo) | Lives on the DESK (`<desk>/ai-worker/`) |
|---|---|
| The **craft** of the role at Senior → C-level: mindset, judgement, standards | **Who**: names, teams, handles, inboxes (`TEAMS.md`) |
| The role's generic **method**: how to write a REQ / SPEC / TASK / TEST, statuses it may set, review discipline, artifact templates | **Chain**: who may talk to whom on this desk (`PROTOCOL.md`) |
| Generic desk mechanics shared by all roles (inbox, log, date, rituals, editing files, evidence) → `workforce-protocol` | **Project facts**: repos, stack, environments, guest rules, claims, decisions, seats, board, logs, FAILURES |
| Which other skills to call, when (exact names below) | Anything that would be wrong on another desk |

**A skill never names a person** (no Porter/Sober/Fern/Tanya…, no team letters as facts) and never
states who you may talk to — it says "per the desk's chain (`PROTOCOL.md`)". It never names a
project, repo, or customer. If a sentence would be false on some other desk, it does not belong.

**Desk wins.** Every skill states near the top: *"If the desk's files disagree with this skill,
the desk wins; report the disagreement to the PM."*

## Skills to write (folder = name, under `ai-agent-workspace/.claude/skills/`)

`workforce-protocol` · `role-pm` · `role-ba` · `role-sa` · `role-fe` · `role-be` · `role-qa`

Frontmatter:
```
---
name: role-fe
description: "<when to load — 'Load when acting as the FE (frontend engineer) role of the AI workforce on a desk in ai-agent-workspace, e.g. via /desk <desk> <Name>. ...' — and when NOT>"
---
```

## Required structure of each role skill (keep headings; content is yours)

1. **Who you are — the bar.** Senior → C-level, concretely: what this level *does* that a junior
   does not (decides with incomplete information and says so; pushes back with evidence; owns
   outcomes not tasks; protects the operator's time; knows when to stop). No fluff adjectives —
   behaviours only.
2. **What you own / what you never own.** Generic to the profession; chain specifics → desk.
3. **Standards — your definition of done.** Checkable bullets.
4. **Method.** Step-by-step for the role's core loop. Artifact templates go in
   `references/<artifact>-template.md` (progressive disclosure), linked from here.
5. **Skills you call — routing table.** Situation → exact skill name (from the list below). Say
   which are mandatory (e.g. FE: `/impeccable audit` before calling any UI done).
6. **Anti-patterns you will be tempted by.** Generalised from the real FAILURES (e.g. translating
   "ดูง่าย" into ACs that add text; checking the gate but not the generator; a method existing is not
   the user reaching it; editing through a shell string; relaying vividness; stacking a snapshot).
7. **Desk handshake.** "Before work: identity line, then the desk signpost `<desk>/CLAUDE.md`
   reading list. The chain, names and repos come from the desk."

Size: SKILL.md ≤ ~12 KB; push templates/long lists into `references/`. Write in English (rules);
Thai examples where the craft is about Thai writing.

## Installed skills you may route to (use exact names; verify any others exist before citing)

- **superpowers:** brainstorming · writing-plans · executing-plans · subagent-driven-development ·
  test-driven-development · systematic-debugging · verification-before-completion ·
  requesting-code-review · receiving-code-review · finishing-a-development-branch ·
  using-git-worktrees · dispatching-parallel-agents
- **mattpocock-skills:** grill-me · grilling · grill-with-docs · to-spec · to-tickets · wayfinder ·
  triage · domain-modeling · codebase-design · improve-codebase-architecture · prototype ·
  research · diagnosing-bugs · tdd · code-review · pr · handoff · to-questionnaire · wait-what ·
  teach · writing-for-agents · ask-matt
- **andrej-karpathy-skills:karpathy-guidelines** (always-on baseline for anyone writing code)
- **impeccable:impeccable** (`/impeccable audit|critique|polish|harden|…`) · **frontend-design:frontend-design**
- **dart-flutter:** flutter-apply-architecture-best-practices · flutter-build-responsive-layout ·
  flutter-fix-layout-issues · flutter-add-widget-test · flutter-add-integration-test ·
  flutter-add-widget-preview · flutter-setup-declarative-routing · flutter-setup-localization ·
  flutter-implement-json-serialization · flutter-use-http-package · dart-run-static-analysis ·
  dart-fix-runtime-errors · dart-add-unit-test · dart-generate-test-mocks · dart-collect-coverage ·
  dart-resolve-package-conflicts · dart-use-pattern-matching · dart-write-documentation ·
  api-review · natural-writing · code-review  (plus the Dart MCP server)
- **humanizer:humanizer** (strip AI tells from prose)
- **pr-review-toolkit** agents: code-reviewer · silent-failure-hunter · pr-test-analyzer ·
  type-design-analyzer · comment-analyzer · code-simplifier; command `/review-pr`
- **context7** MCP (current library docs — use before trusting memory of an API)
- **built-in:** `/code-review` · `/security-review` · `/simplify`
- **anthropic-skills:** requirement-hub · galaxy-spec · docs · docx · xlsx · pdf · pptx ·
  java-springboot-scalable-pattern · nextjs-pattern-generator (+ per-library nextjs-*-pattern) ·
  develyst-deploy
- Workspace: `FRONTEND-STANDARD.md` (web UI bar), `AGENTS-DISCIPLINE.md`

Route to a skill only where it truly fits the role. Platform-specific routes (Flutter vs web vs
Spring) are written as "if the desk's stack is X → …".

## Sources to mine (read; extract only the GENERIC parts)

- `usb-oda/ai-worker/{PROTOCOL,PM,SA-Lead,FE,BE,QA}.md` (newest, 3-team) and
  `mychannel-mc2/ai-worker/{PM,SA-Lead,FE,QA,PROTOCOL,DESIGN}.md` (lessons since F-001…F-023)
- `mychannel-mc2/ai-worker/FAILURES.md` (anti-patterns) · workspace `CLAUDE.md` (harness — do not
  restate it; point to it) · `AGENTS-DISCIPLINE.md` · `FRONTEND-STANDARD.md` · `ATLAS.md` (last 3 sections)
- Read-only OLD workspace for extra craft: `/Users/entronica/Develyst/ai-agent-workspace/smart-scheduler/ai-worker/`
  (`REPORT-porter-pm-failures-2026-09-28.md`, `QA-PLAYWRIGHT.md`, `FE-DESIGN.md`, `COPY-REVIEW-*.md`)

## Do not

Edit any desk file, the workspace CLAUDE.md, or another author's skill folder. Use Write/Edit only
(no `sed -i`/`node -e` — hook-blocked). No absolute paths inside skills (paths relative to the
workspace root). No commits.
