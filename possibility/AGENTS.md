# AGENTS.md — possibility

> **Pointers only.** Auto-loaded for any agent working in this folder (Kimi Code loads
> one `AGENTS.md` per subdirectory). The rules live one level up in `../AGENTS.md` →
> `../CLAUDE.md`; this file only says where things are for **this project**. Two copies
> of a rule is how rules drift, so nothing here restates one.
>
> ⚠️ **This file cannot tell you who you are.** Every role on possibility loads it —
> Fero and Tanya in the same folder. Your identity comes from your session starter, your
> `[identity]` config, or your skill. You are exactly one role, forever, in this session.
>
> 🔑 **"project possibility" always means THIS folder** — the workspace folder
> `possibility/`. It never means the drive-root code folder of the same name. If you
> cannot find your charter, **STOP and say so. Never improvise your own authority.**

## Where things are

- **Coordination lives in `possibility/ai-worker/`** — `board.md`, `inbox/`, `log/`,
  `requirements/`, `specs/`, `tasks/`, `tests/`, and the role charters.
- **Code repos, by logical name** — absolute paths are in `machine.local.md` at the
  workspace root, never in a committed file, never guessed:

  | Logical name | What it is | Whose |
  |---|---|---|
  | `possibility-front` | the frontend | Fero (FE) |
  | `possibility-back` | the backend | Jason (BE) |
  | `possibility-spec` | the owner's requirement repo | **READ-ONLY for every role.** Porter reads it; nobody writes to it. |
  | `bruno-ai-develyst` | Bruno collection documenting the LLM gateway | read-only reference |

## The decided stack — do not re-open it, and do not re-derive it

Settled by the owner himself on 2026-09-18 (*"stack พวกนี้ฉันตัดสินเอง"*), overriding
SPEC-001 line by line. Full detail and provenance: `ai-worker/SYSTEM-FACTS.md` →
**"Stack — DECIDED by the owner himself"**.

- **Backend** Bun + Hono · **Database** PostgreSQL 18
- **Frontend** Next.js + **Ant Design** (skill `nextjs-antd-pattern`) — corrected
  2026-09-19; **not Mantine**, whatever an older line says
- **AI** the owner's own gateway **AI Develyst** (`https://ai.develyst.online`), **not
  the Anthropic API**. Provider and model are chosen **per step**, never locked globally.
- **Git** the owner controls git entirely and does not care about branches. The team
  works on files; *"ready to deploy"* is a message from Porter to the owner.

⚠️ **There is an older line in `SYSTEM-FACTS.md` (dated 2026-09-17) saying the stack and
the branch are undecided. It is SUPERSEDED by the above.** Newer wins. It has already
made one reader confidently wrong — do not let it make you the second.

## Environments — read before you touch a database

- **No local backend database.** The team develops **and** tests against the PostgreSQL
  on the owner's **SIT** server, database `possibility_db` (owner, 2026-09-18).
- That SIT database is the shared **dev + test** database — the working DB. **It is not
  production.** No production environment exists.
- 🔴 **The connection string is never written into any committed file.** The team creates
  `.env.example` (variable names, no values); **the owner fills `.env` himself.**

## Startup ritual — in this order, every session

1. `../AGENTS.md` → `../CLAUDE.md` — the workspace rulebook.
2. `../AGENTS-DISCIPLINE.md` — how the work is done, on any vendor.
3. `ai-worker/SYSTEM-FACTS.md` — what the owner has already said. **Never re-derive it
   from the logs**, and when two lines disagree, **the newer one wins**.
4. `ai-worker/PROTOCOL.md` + your own role file, including its Hard boundaries.
5. `ai-worker/board.md`, then `ai-worker/inbox/<YOUR-ROLE>.md` — act on what is waiting,
   then **delete what you processed**.
6. Settle TODAY, then `ai-worker/log/<TODAY>.md` (create it if missing).

Then do the work waiting for your role, and nothing else.

## This project only

- **QA is not a trial here** — Tanya is part of the desk from day one (owner,
  2026-09-17), unlike smart-scheduler. She talks to **Porter only**, and never fixes code.
- **Fern and Fero are the same role** (Frontend Engineer). Renamed 2026-09-23 by the
  owner's decision; older files, board rows and logs still say Fern. **Do not rename them.**
