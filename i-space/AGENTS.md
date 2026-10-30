# AGENTS.md — i-space

> **Pointers only.** The desk signpost, read by every vendor. The rules live one level up in
> `../AGENTS.md` → `../CLAUDE.md`, and in `ai-worker/PROTOCOL.md`; this file only says where
> things are for **this desk**. Two copies of a rule is how rules drift, so nothing here
> restates one.
>
> ⚠️ **This file cannot tell you who you are.** Every role on this desk loads it. Your identity
> comes from your session starter (`/desk i-space <Name>`) and `ai-worker/TEAMS.md`. You
> are exactly one role, forever, in this session. If you cannot find your charter, **STOP and
> say so. Never improvise your own authority.**

## What this desk is

`i-space` — **I-Space (Intelligent Space)**, the owner's own product: **Blueprint** + **CAW**,
built earlier by another AI desk (brownfield). **Two SA teams split by product:** Team A =
Blueprint, Team B = CAW; the PM and the QA serve both. First work:
`ai-worker/requirements/REQ-101-understand-all-the-code.md`.

🔴 **The two teams meet only at the seams, and every seam change goes through the PM. Live
Claude CLI runs only on the owner's word.** `ai-worker/PROTOCOL.md` § Hard boundaries.

## Where things are

- **Coordination lives in `i-space/ai-worker/`** — `board.md`, `inbox/` (Team B's carry `-B`),
  `log/`, `requirements/`, `specs/`, `tasks/`, `tests/`, `legacy/`, and the role charters.
- **Who is who:** `ai-worker/TEAMS.md` (people, teams, inboxes), `ai-worker/SEATS.md` (human
  seats), `ai-worker/DECISIONS.md` (what the operator already decided).
- **The old team's IDs** (`SPEC-A/B/C-…`, `REQ-001…017`, `D-…`) and the import still to come:
  `ai-worker/legacy/README.md`. New IDs start at 101.
- **Code repos, by logical name, all on branch `atom`** — absolute paths are in
  `machine.local.md` at the workspace root, never in a committed file, never guessed:

  | Logical name | What it is | Whose |
  |---|---|---|
  | `blueprint-back` | Blueprint API; owns the seam contract | Team A — the BE |
  | `blueprint-front` | Blueprint web | Team A — the FE |
  | `caw-back` | CAW API, MCP server, runner; consumes the seam | Team B — the BE |
  | `caw-front` | CAW web | Team B — the FE |

## Startup ritual — in this order, every session

1. `../AGENTS.md` → `../CLAUDE.md` — the workspace rulebook.
2. `ai-worker/SYSTEM-FACTS.md` — what the owner has already said.
3. PM and SA only: `ai-worker/RESUME-HERE.md`.
4. `ai-worker/PROTOCOL.md` (its Hard boundaries first) + your own role file
   (PM `PM.md` · SA `SA-Lead.md` · FE `FE.md` · BE `BE.md` · QA `QA.md` — one per role, both teams).
5. `../AGENTS-DISCIPLINE.md`.
6. `ai-worker/board.md`, then your inbox (`TEAMS.md` names it), then `ai-worker/FAILURES.md`
   (last 5 entries), then `ai-worker/log/<TODAY>.md`.
7. `node check-hygiene.mjs i-space` from the workspace root.

Then do the work waiting for your role, and nothing else.
