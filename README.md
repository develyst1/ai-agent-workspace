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
when you switch. Workspace-level identities: **Atlas** (`ATLAS.md`, architect)
and **Marie** (`MARIE.md`, workflow operations).

## How to run a work session (manual mode)

Open one Claude Desktop chat **per role** and start it with the ready-made
prompt from **`SESSION-STARTERS.md`** (recommended — it bakes in the
no-chain-skipping rules from message #1). Quick version:

> **PM session:**
> You are working on project `did-api-center-c#` in
> `H:\ai-agent-workplace\ai-agent-workspace`.
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

Copy the `_templates/project` folder to a new `<project-name>/` folder,
then edit the team names in the role files if you want different personas.

## Projects

| Project | Description | Team |
|---------|-------------|------|
| `did-api-center-c#` | DID API Center (C#) | Porter (PM), Sober (SA Lead), Jason (BE) |
| `smart-scheduler` | Scheduling + back-office ERP for a sports activity center (monorepo, 4 repos) | Porter (PM/BA), Sober (SA Lead), Jason (BE), Fern (FE), **Tanya (QA — trial)** |
| `develyst-ai` | Develyst AI Gateway — Bun+Hono multi-provider AI API (single backend repo) | Porter (PM), Sober (SA Lead), Jason (BE) |
| `manager-gold` | TBD — awaiting first requirement (full-stack: Node/Bun backend + Next.js frontend, 2 repos at `H:\manager-gold`) | Porter (PM), Sober (SA Lead), Jason (BE), Fern (FE) |
| `DID-046-SpringBoot-Service-Report` | Spring Boot service generating Thai govt PDF permit docs (weapons-factory forms อ.1/อ.3/อ.6/อ.7) via JasperReports from Oracle DIDPERMIT. Code repo at `C:\Users\Admin\sa-project\service-report2\DID-046-SpringBoot-Service-Report` | Porter (PM), Sober (SA Lead), Jason (BE), **Tanya (QA — trial)** |
| `api-linkage2` | Four Thai govt API linkage/proxy services (DOPA, DGA, RD, IEAT) — JWT check → upstream token exchange → forward → log. Code repo at `C:\Users\Admin\sa-project\api-linkage2` | Porter (PM), Sober (SA Lead), Jason (BE) |
| `code-report` | TBD — awaiting first requirement. **Dispatcher trial ground** (see `DISPATCHER.md` — one session spawns all roles as subagents). Greenfield repos at `C:\Users\Admin\develyst\code-report\code-report-back/-front` | Porter (PM), Sober (SA Lead), Jason (BE), Fern (FE) |
