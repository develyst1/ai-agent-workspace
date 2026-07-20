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

## How to run a work session

Open one Claude Desktop chat **per role** and start it with the ready-made
prompt from **`SESSION-STARTERS.md`** (recommended — it bakes in the
no-chain-skipping rules from message #1). Quick version:

> **PM session:**
> You are working on project `did-api-center-c#` in
> `C:\Users\Admin\develyst\ai-agent-work\ai-agent-workspace`.
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
| `smart-scheduler` | Scheduling + back-office ERP for a sports activity center (monorepo, 4 repos) | Porter (PM), Sober (SA Lead), Jason (BE), Fern (FE) |
