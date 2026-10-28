# AGENTS.md — buddy-screen

> **Pointers only.** The desk signpost, read by every vendor. The rules live one level up in
> `../AGENTS.md` → `../CLAUDE.md`, and in `ai-worker/PROTOCOL.md`; this file only says where
> things are for **this desk**. Two copies of a rule is how rules drift, so nothing here
> restates one.
>
> ⚠️ **This file cannot tell you who you are.** Every role on this desk loads it. Your identity
> comes from your session starter (`/desk buddy-screen <Name>`) and `ai-worker/TEAMS.md`. You
> are exactly one role, forever, in this session. If you cannot find your charter, **STOP and
> say so. Never improvise your own authority.**

## What this desk is

`buddy-screen` — **AI for Kids V1**, the owner's own product (greenfield). Requirement:
`ai-worker/requirements/REQ-001-ai-for-kids-v1.md` (the owner's words, verbatim).

🔴 **Children's faces, voices and names: synthetic data only — never real child data in any
file, fixture or log.** `ai-worker/PROTOCOL.md` § Hard boundaries.

## Where things are

- **Coordination lives in `buddy-screen/ai-worker/`** — `board.md`, `inbox/`, `log/`,
  `requirements/`, `specs/`, `tasks/`, `tests/`, and the role charters.
- **Who is who:** `ai-worker/TEAMS.md` (people), `ai-worker/SEATS.md` (human seats),
  `ai-worker/DECISIONS.md` (what the operator already decided).
- **Code repos, by logical name** — absolute paths are in `machine.local.md` at the workspace
  root, never in a committed file, never guessed:

  | Logical name | What it is | Whose |
  |---|---|---|
  | `buddy-screen-spec` | the owner's requirement repo | **READ-ONLY for every role** |
  | `buddy-screen-front` | the frontend | the FE |
  | `buddy-screen-back` | the backend — **not cloned yet (owner: later)** | the BE (seat idle until then) |

## Startup ritual — in this order, every session

1. `../AGENTS.md` → `../CLAUDE.md` — the workspace rulebook.
2. `ai-worker/SYSTEM-FACTS.md` — what the owner has already said.
3. PM and SA only: `ai-worker/RESUME-HERE.md`.
4. `ai-worker/PROTOCOL.md` (its Hard boundaries first) + your own role file
   (PM `PM.md` · SA `SA-Lead.md` · FE `FE.md` · BE `BE.md` · QA `QA.md`).
5. `../AGENTS-DISCIPLINE.md`.
6. `ai-worker/board.md`, then `ai-worker/inbox/<YOUR-ROLE>.md`, then `ai-worker/FAILURES.md`
   (last 5 entries), then `ai-worker/log/<TODAY>.md`.
7. `node check-hygiene.mjs buddy-screen` from the workspace root.

Then do the work waiting for your role, and nothing else.
