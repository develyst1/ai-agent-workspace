# AGENTS.md — smart-scheduler

> **Pointers only.** Auto-loaded for any agent working in this folder (Kimi Code
> loads one `AGENTS.md` per subdirectory). The rules live one level up in
> `../AGENTS.md` → `../CLAUDE.md`; this file just says where things are for **this
> project**. Two copies of a rule is how rules drift, so nothing here restates one.
>
> ⚠️ **This file cannot tell you who you are.** Every role working on
> smart-scheduler loads it — Fero and Tanya in the same folder. Your identity comes
> from your session starter, your `[identity]` config, or your skill. You are
> exactly one role, forever, in this session.

## Where things are

- **Coordination lives in `smart-scheduler/ai-worker/`** — `board.md`, `inbox/`,
  `log/`, `requirements/`, `specs/`, `tasks/`, `tests/`, and the role charters.
- **Code repos, by logical name** — absolute paths are in `machine.local.md` at
  the workspace root, never in a committed file, never guessed:

  | Logical name | What it is | Port | Role |
  |---|---|---|---|
  | `smart-scheduler-back` | scheduling API, Bun + Drizzle | 4006 | BE |
  | `smart-scheduler-front` | staff calendar UI, Next.js | 3016 | FE |
  | `smart-scheduler-backoffice-back` | finance API (`bo` schema) | 4010 | BE |
  | `smart-scheduler-backoffice-front` | admin money UI, Next.js | 3018 | FE |
  | `smart-scheduler-requirement` | the owner's requirement repo | — | — |

- 🔴 **`develop` is the canonical branch in every repo** (owner, 2026-08-28), and
  **another team also builds on it**. Before speccing anything on shared ground,
  read what `develop` already does — never build against a remembered tree. The
  full statement, with the merge evidence, is in `ai-worker/SYSTEM-FACTS.md`.

## Startup ritual — in this order, every session

1. `../AGENTS.md` → `../CLAUDE.md` — the workspace rulebook.
2. `../AGENTS-DISCIPLINE.md` — how the work is done, on any vendor.
3. `ai-worker/SYSTEM-FACTS.md` — what the owner has already said and how the
   running system behaves. **Never re-derive these from the logs.**
4. `ai-worker/PROTOCOL.md` + your own role file, including its Hard boundaries.
5. `ai-worker/board.md`, then `ai-worker/inbox/<YOUR-ROLE>.md` — act on what is
   waiting, then **delete what you processed**.
6. Settle TODAY, then `ai-worker/log/<TODAY>.md` (create it if missing).

Then do the work waiting for your role, and nothing else.

## This project only

- **The QA role is on trial here** and nowhere else. Tanya talks to **Porter only**
  — never the SA Lead, never the engineers — and she never fixes code.
- **Exactly two servers: `sid` (ours) and `uat` (the customer's).** Tanya is
  read-only on `uat`; every write there is a DATA REQUEST for the owner. Engineers
  get no access to the customer's system at all. The table is in `SYSTEM-FACTS.md`.
- **The owner is the only LINE-capable tester.** QA cannot test LINE, ever.
