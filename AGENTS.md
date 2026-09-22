# AGENTS.md — entry point for any AI agent working in this workspace

> **Vendor-neutral.** Auto-loaded by agents that read `AGENTS.md` (Kimi Code and
> others). Claude Code reads `CLAUDE.md` instead — **and `CLAUDE.md` in this same
> folder is the rulebook for everyone.** This file exists so a non-Claude agent
> lands on the same rules; it deliberately does **not** restate them, because two
> copies of a rule is how rules drift.

## Do this first, before anything else

1. **Read `CLAUDE.md` in this folder.** It is the workspace rulebook: amnesia-first,
   the hard chain, paths & machines, the workspace-level identities, git. It is not
   optional and it is not a summary of something else — it is the source.
2. Identify **which role you are** (it is in your session starter, your identity
   config, or your skill). You are exactly one role, forever, in this session.
3. Read your charter and follow its startup ritual:
   `<project>/ai-worker/PROTOCOL.md` + your role file.

## Two different worlds — never confuse them

The session may be opened at the drive root (`H:\`), so both of these are visible
at once. They are not the same thing and they follow different rules.

| | **The workspace** | **A code repo** |
|---|---|---|
| What it is | where the AI team coordinates: REQ, SPEC, TASK, board, inbox, logs | the actual product source code |
| Where | `ai-agent-workplace/ai-agent-workspace/` | anywhere on the drive — **you do not guess** |
| How it is named in writing | **a path relative to the workspace root**: `smart-scheduler/ai-worker/board.md` | **its logical name only**: `smart-scheduler-front` |
| How you find it | it is right there | look up the logical name in **`machine.local.md`** at the workspace root |
| Git | **agents never commit here, ever** | only if a TASK explicitly says so |

**The rule that follows from this, and it is absolute:**

- **Never write an absolute path into any committed file.** Not into a board, a
  TASK, a REQ, a log, or a charter. The owner moves between machines; an absolute
  path is wrong on the next one.
- **`machine.local.md` is the only place absolute paths live.** It is git-ignored
  and per-machine. If a path there is missing or wrong, **stop and ask the owner**,
  then fix it there — never "fix" it by editing a committed file.
- When you mention a file in a message or a log, make it obvious which world it is
  in: a workspace path starts with the project folder
  (`pun-kub-fang/ai-worker/inbox/FE.md`); a code file is named under its logical
  repo (`smart-scheduler-front → src/components/BookingModal.tsx`).

## The other folders on this drive are not yours

The drive holds many repos that are **not** part of this workspace. If a folder is
not listed in `machine.local.md` and not under `ai-agent-workplace/`, it is out of
scope: do not read it for context, do not edit it, do not use it as an example.

## A code repo that belongs to someone else

Some repos have a main developer who is not on this team. There, you are a **guest**:
you touch only the files your TASK names, you never restructure, and **you never add
your own instruction files** (`AGENTS.md`, `CLAUDE.md`, rule files) to their repo —
everything about how we work lives on the workspace side.

## Session discipline (matters more on agents that auto-compact)

Do **one** coherent unit of work per session — one REQ written, one TASK
implemented, one review, one test run — then write your files and stop. Do not
start a second unit. Long sessions lose the middle of their own context; the files
are the memory, so a short session loses nothing.
