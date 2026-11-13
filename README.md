# AI Agent Workspace

A multi-session AI team workflow for Claude Desktop. Each project has an AI team
(PM, SA Lead, Backend Engineer). You open **one Claude Desktop session per role**,
and the roles collaborate through shared files — the file system is their chat room.

## How it works

```
 YOU (the human / stakeholder)
  │  tell requirements in plain words
  ▼
 PM (Porter)          — turns your words into REQ-xxx files
  │  requirements/REQ-xxx.md
  ▼
 SA Lead (Sober)      — turns REQ into technical SPEC + TASK files
  │  specs/SPEC-xxx.md  +  tasks/TASK-xxx.md
  ▼
 BE (Jason)           — implements TASKs, reports back
  │  updates tasks/ + writes code in the real project repo
  ▼
 SA Lead reviews → PM confirms with YOU → everyone logs to log/YYYY-MM-DD.md
```

All coordination state lives in each project's `ai-worker/` folder:

```
<project-name>/
├── ai-worker/
│   ├── PROTOCOL.md          # shared rules everyone follows (read first)
│   ├── PM.md                # role charter: Project Manager
│   ├── SA-Lead.md           # role charter: SA Lead
│   ├── BE.md                # role charter: Backend Engineer
│   ├── board.md             # live task board — single source of truth
│   ├── requirements/        # REQ-001-*.md   (written by PM)
│   ├── specs/               # SPEC-001-*.md  (written by SA Lead)
│   ├── tasks/               # TASK-001-*.md  (written by SA, updated by BE)
│   └── log/                 # 2026-07-17.md  daily log, all roles append
└── project-docs/            # raw material you drop in (PDFs, notes, images)
```

    ## Two work modes (same files, switch freely — even mid-project)

| | **Manual mode** (multi-session) | **Dispatcher mode** |
|---|---|---|
| How | One chat per role; the human routes and nudges | One session spawns roles as subagents (`DISPATCHER.md`); stops at checkpoints with a digest |
| The human is | MD/PM/PO — deep in the details | CEO — answers questions at checkpoints |
| Best for | Custom, design-heavy work you want to steer closely | Routine delivery, speed, lower token burn |
| Start | Role starters in `SESSION-STARTERS.md` | `อ่าน DISPATCHER.md แล้วรัน <project>` |

Both modes read and write the same `ai-worker/` files, so nothing migrates
when you switch. Workspace-level identities: **Atlas** (`ATLAS.md`, architect),
**Marie** (`MARIE.md`, workflow operations), **Otto** (`OTTO.md`, release &
platform — the shared server, knowledge in `SERVER-FACTS.md`), **Bunny**
(`BUNNY.md`, weaver of each desk's memory), **Iso** (`ISO.md`, independent verifier — inspects the machine that produces the work: the rules,
the seats, the maps, and every "it is done"; verdicts in `ISO-LEDGER.md`), **PokerVault**
(`POKERVAULT.md`, access operator — the workforce's keyholder; logs in and unlocks
sessions the Anthropic-bound desks cannot, keeps them fresh hourly, and wakes on a
`REQUEST-*-to-pokervault-*.md` dropped at the workspace root; log in `POKERVAULT-LOG.md`),
**Atom** (`ATOM.md`, draft — the owner's mobile mouth and ears), **Prox** (`PROX.md`, plugin
maintainer — owns the Harness plugin layer and the Workforce Console that bridges the Claude desks
and the DeepSeek seats; inventory in `PLUGINS.md`) and **Charlotte** (`CHARLOTTE.md`, trial —
Atlas's challenger on DeepSeek: other options and objections before Atlas proposes; wakes on a
`REQUEST-atlas-to-charlotte-*.md`, answers in `IDEAS-Charlotte-*.md`) and **Modio** (`MODIO.md`,
`team-proposed` — AI engineer for local/open-weight models with two brains: Claude thinks and teaches,
DeepSeek + scripts act; goal: cut the Claude plan $200 → $20 (or $100) and prove whether owning a GPU
pays; log in `MODIO-LOG.md`, tooling in `llm-rent/`).

## How to run a work session (manual mode)

Open one Claude Desktop chat **per role** and start it with the ready-made
prompt from **`SESSION-STARTERS.md`** (recommended — it bakes in the
no-chain-skipping rules from message #1). Quick version:

> **PM session:**
> You are working on project `<project>` in this workspace folder.
> Read `ai-worker/PROTOCOL.md` and `ai-worker/PM.md`, then read `ai-worker/board.md`
> and do your job. Here is my requirement: ...

> **SA Lead session:**
> Same as above but read `ai-worker/SA-Lead.md`. Then: check the board for
> requirements with status READY_FOR_SA and process them.

> **BE session:**
> Same as above but read `ai-worker/BE.md`. Then: check the board for tasks
> with status TODO and work on them.

You can run the sessions one after another (PM first, then SA, then BE) or keep
all three open and ping each one when the board shows work waiting for it.

## Starting a new project

Copy the `_templates/project` folder to a new `<project-name>/` folder, then
fill every 🔧 mark (project name, repos, stack, environments, mode) and delete
the roles the desk does not have. **Seed `ai-worker/SYSTEM-FACTS.md` before the
team's first session** — with what the owner said and a read-only survey of the
repos — and register the repo paths in `machine.local.md`. Finish with
`node check-hygiene.mjs <project-name>`; a fresh copy of the template passes
with zero warnings. (Since 2026-09-17 the template ships with `SYSTEM-FACTS.md`,
`inbox/`, `tests/` + `tests/harness/`, `QA.md` and `FE.md` — a new desk is born
with the rules older desks had to learn.) Opening a desk is Marie's job
(`MARIE.md`); ask her rather than copying another desk raw.

## Projects

| Project | Description | Team |
|---------|-------------|------|
| `smart-scheduler` | Scheduling + back-office ERP for a sports activity center (monorepo, 4 repos) | Porter (PM/BA) · **Team A** Sober (SA Lead), Jason (BE), Fern (FE) · **Team B** Silver (SA Lead), Bob (BE), Fanta (FE) · **Team C** Sector (SA Lead), Brew (BE), Flash (FE) · **Tanya + Twenty (QA — trial, both `QA · all`)** |
| `i-space` | **I-Space (Intelligent Space)** — one product in two halves: **Blueprint** (an AI interview turns sources into a confirmed spec version) and **CAW** (the AI-workforce runner that executes confirmed versions with Claude CLI workers, *"เสมือน Atom"*). Brownfield, 4 repos on branch `atom`, **MANUAL mode** (8 sessions `<Name>-ISP`), IDs from 101 | Porter (PM/BA/PO/UX writer), Tanya (QA) · Team A (Blueprint): Sober (SA), Jason (BE), Fern (FE) · Team B (CAW): Silver (SA), Bob (BE), Fanta (FE) |
| `develyst-ai` | Develyst AI Gateway — Bun+Hono multi-provider AI API (single backend repo) | Porter (PM), Sober (SA Lead), Jason (BE) |
| `portfolio-nichaphon` | Personal portfolio / freelance-services site for Nichaphon Sayvav (`portfolio.develyst.online`) — Next.js 15 + Mantine 8, frontend only, single repo `portfolio-nichaphon-web`. **Dispatcher-run** | Porter (PM), Sober (SA Lead), Fern (FE) — no BE, no QA |
| `dte` | **DTE — "Disrupt Thai Education"**: online learning platform with a per-course AI Teacher, live at `dte.develyst.online`. **Brownfield, real users.** Single repo `dte` = `back/` (Bun + ElysiaJS + PostgreSQL, raw SQL, no ORM) + `front/` (Next.js 15 + React 19 + Tailwind); AI via the `develyst-ai` gateway. **Dispatcher-run**, branch `develop`. Born 2026-09-06 with `SYSTEM-FACTS.md` + `inbox/` + `tests/` | Porter (PM), Sober (SA Lead), Jason (BE — `back/`), Fern (FE — `front/`) — no QA |
| `possibility` | Freelance / innovation platform — a user says what they want, the AI analyses feasibility, social impact and interest; five user tiers. **Greenfield, MANUAL mode**, three repos (`possibility-back`, `possibility-front`, `possibility-spec` = the owner's requirement repo). Stack TBD (SPEC-001). | Porter (PM/BA/PO/UX writer), Sober (SA Lead), Jason (BE), Fern (FE), Tanya (QA) |
| `pun-kub-fang` | ปั่นกับฟ่าง — smoothie/drinks shop. **The front exists and belongs to another developer**; our team builds the **backend** (`pun-kub-fang-back`, Bun + Hono, greenfield) and touches the front only at the API seam. **MANUAL mode.** ⚠️ parent folder on disk is misspelled `pub-` | Porter (PM/BA/PO), Sober (SA — public API contract), Jason (BE), Fern (FE, guest), Tanya (QA) |
| `corner-chat` | Unified inbox with an AI guard — LINE, Discord, Zimbra Mail, Web Chat (later Teams) in one place, AI filtering before people, auto-reply rules, dashboard. **Greenfield, MANUAL mode**, two repos (`corner-chat-back` = Bun + Hono or Elysia, never NestJS, + Postgres; `corner-chat-front` = Dashboard + Web Chat, stack in SPEC-001), **both teams share both repos** via the PM's batch claims. Opened 2026-11-01 | Porter (PM) · Team A: Sober (SA), Jason (BE), Fern (FE), Tanya (QA) · Team B: Silver (SA), Bob (BE), Fanta (FE), Tefany (QA) |
| `smart-scheduler-atom` | **Fork of `smart-scheduler` on Atom's own box** (owner's option C, 2026-10-26): reads that desk's knowledge, writes only to itself, IDs from **5000**, code branch `atom`. **MANUAL mode**, 8 sessions `<Name>-SOMA`. Not the same tree as `smart-scheduler` | same eight people as `smart-scheduler`: Porter (PM), Tanya (QA) · A: Sober (SA), Jason (BE), Fern (FE) · B: Silver (SA), Bob (BE), Fanta (FE) |
| `code-class` | **Freelance teaching** — programming basics (the same in every language) plus AI. Makes teaching material, not an app: the course repo `code-class-docs`, shown to clients on Fastwork, and a class schedule. Learners reached only through the owner. **Greenfield, MANUAL mode**, sessions `<Name>-CLS`. Opened 2026-11-12 (ORDER 65) | Porter (PM), Tanya (QA) · Team A: Sober (SA — curriculum + folder structure), Fern (FE — slides, lessons, example code) — no BE |
| `buddy-screen` | **Parked 2026-10-29** — the owner dropped it from the active codebase list (*"ลบบัดดี้สกรีนออกไปเลย เพราะเราโค้ดขึ้น git แล้ว"*); the folder and the desk stay on disk, never deleted, no new work. One team (BUD) | Porter (PM), Tanya (QA), Sober (SA), Fern (FE), Jason (BE) — no second team |
