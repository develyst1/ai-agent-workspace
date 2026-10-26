# AGENTS.md — smart-scheduler-atom (FORK of smart-scheduler)

> **Pointers only.** Auto-loaded for any agent working in this folder (Kimi Code
> loads one `AGENTS.md` per subdirectory). The rules live one level up in
> `../AGENTS.md` → `../CLAUDE.md`; this file just says where things are for **this
> project**. Two copies of a rule is how rules drift, so nothing here restates one.
>
> ⚠️ **This file cannot tell you who you are.** Every role working on
> smart-scheduler-atom loads it. Your identity comes from your session starter,
> your `[identity]` config, or your skill. You are exactly one role, forever, in
> this session. The roster (names, inboxes, session names `<Name>-SOMA`) is
> `ai-worker/TEAMS.md`.

## What this desk is (owner via Atom, 2026-10-26 17:23 — `MARIE.md` ORDER 35)

- A **FORK of `smart-scheduler`** (option C). It **READS** knowledge from the original desk
  (`../smart-scheduler/`, READ-ONLY); **all working writes go only to `smart-scheduler-atom/`.**
  🔴 **No role on this desk writes anything under `smart-scheduler/`.**
- Later the owner, at the main desk, orders the pull of this desk into main and then empties it —
  a separate order, not yours.

## Where things are

- **Coordination lives in `smart-scheduler-atom/ai-worker/`** — `board.md`, `inbox/`
  (incl. `RELAY.md`), `log/`, `requirements/`, `specs/`, `tasks/`, `tests/`, and the role charters.
- **IDs start at 5000** — `REQ-5000`, `SPEC-5000`, `TASK-5000`, `TEST-5000`.
- **Code repos, by logical name** — absolute paths are in `machine.local.md` at
  the workspace root, never in a committed file, never guessed:

  | Logical name | What it is | Port | Role |
  |---|---|---|---|
  | `smart-scheduler-back` | scheduling API, Bun + Drizzle | 4006 | BE |
  | `smart-scheduler-front` | staff calendar UI, Next.js | 3016 | FE |

- 🔴 **Working branch: `atom`** (cut from `develop`) in both repos. `develop` is the canonical branch and
  **another team also builds on it** — read what `develop` already does before speccing on shared ground.

## Git (`../CLAUDE.md` §6 — the owner's word only)

- **Code:** `รวมโค้ด` (merge-workflow) **only after a real test pass** — Tanya's `TEST_PASSED` on `sid` —
  and only on the owner's own command, relayed by the PM to the SA. **No migration without the owner's go**
  (journal collision with `dong`'s 0072).
- **Workspace:** this desk's files are synced **only at the real end of a job, by the owner.** No agent
  commits or pushes them.

## Sessions — models and permission mode (owner via Atom, 2026-10-26)

| Roles | Model | Effort | Permission mode |
|---|---|---|---|
| PM (Porter) · SA (Sober, Silver) · QA (Tanya) | opus | medium | `auto` |
| Engineers (Jason, Fern, Bob, Fanta) | sonnet | medium | `auto` |

## Startup ritual — in this order, every session

1. `../smart-scheduler/ai-worker/SYSTEM-FACTS.md` and `../smart-scheduler/ai-worker/OWNER-LIST.md`
   — **READ-ONLY**, what the owner had already said before the fork. Then this desk's own
   `ai-worker/SYSTEM-FACTS.md` / `OWNER-LIST.md` (new facts go there, below the `FORK 2026-10-26` line).
   **Never re-derive these from the logs.**
2. `../AGENTS.md` → `../CLAUDE.md` — the workspace rulebook.
3. `../AGENTS-DISCIPLINE.md` — how the work is done, on any vendor.
4. `ai-worker/PROTOCOL.md` + your own role file, including its Hard boundaries.
5. `ai-worker/board.md`, then `ai-worker/inbox/<YOUR-ROLE>.md` and `ai-worker/inbox/RELAY.md` —
   act on what is waiting, then **delete what you processed**.
6. Settle TODAY, then `ai-worker/log/<TODAY>.md` (create it if missing).

Then do the work waiting for your role, and nothing else.

## This project only

- **The QA role is on trial here.** Tanya talks to **Porter only** — never the SA Lead,
  never the engineers — and she never fixes code.
- **Exactly two servers: `sid` (ours) and `uat` (the customer's).** Tanya is
  read-only on `uat`; every write there is a DATA REQUEST for the owner. Engineers
  get no access to the customer's system at all. The table is in the original desk's `SYSTEM-FACTS.md`.
- **The owner is the only LINE-capable tester.** QA cannot test LINE, ever.
