# REQ-107: Study — how CAW wakes and feeds its persistent CLI workers reliably

- Status: DELIVERED (2026-10-29, the PM — QA TEST_PASSED 12:36 on AC-1/AC-4; PM met AC-2/AC-3; Thai summary given to the owner in the PM's pane) · recommendation: option A, B as fallback (`maps/caw-wake-107.md`) `[team-proposed]` — feeds REQ-106
- Priority: HIGH `[PM-decided: the owner asked for it, 12:29]`
- Requested: 2026-10-29 12:29 by the owner, relayed by Atom — stamp `operator`
- Deadline: none — the owner is waiting for the answer in the PM's pane; short is better than complete.
- Depends on: REQ-102 (`maps/caw-gap-102.md` c1, c3), `DECISIONS.md` 11:41 items 5 and 7
- Team: **B (Silver)**. Numbered 107 so the plan's REQ-105/106 keep their numbers.

## The ask (owner via Atom, 12:29 — as relayed)

> "CAW will run persistent Claude CLI sessions on a server (REQ-106), so it will likely hit the same problem we hit here: peer nudges/rings between CLI sessions do not work (ListAgents relies on socket files in $XDG_RUNTIME_DIR/cc-socks that got deleted; list_sessions is desktop-only). How should CAW wake/nudge its workers reliably? Please think it through with Silver … Look at how caw-back/runner already dispatches work, and propose 2-3 options with pros/cons and a recommendation, short Thai, no code changes yet."

What the desk already knows (facts, not design):
- Today the runner does **not** use rings: it polls caw-back every `RUNNER_POLL_MS` (2 s) and starts one `claude -p` per hop (`maps/caw.md` § Folders `runner/`, § Claude CLI).
- The owner decided one long-lived CLI session per worker, the whole team in parallel (`DECISIONS.md` 11:41 items 5, 7).
- The desk's own ring failure: every session still listened on its socket, but the socket files were unlinked from `cc-socks/`, so discovery found nobody (PM log 2026-10-29 11:50).

## Requirement

1. Two or three real options for how CAW gets new work to a **long-lived** CLI worker and knows it is alive/idle — each with pros, cons, what breaks it, and an S/M/L guess (the SA's).
2. Say which parts of today's runner each option keeps (poll loop, process groups, MCP server, limit handling).
3. One recommendation with its reason.
4. Name what would have to be proven with a **live** CLI run (that needs the owner's word — do not run it), and what a stub can prove.

## Acceptance Criteria

- [ ] **AC-1** — the answer has 2–3 options, each with pros, cons, failure mode and size, and each claim about today's code cites `caw-back → file:line`.
  - Check: the PM reads it; QA spot-opens the citations.
- [ ] **AC-2** — one recommendation, with what would make the SA change it.
  - Check: the PM.
- [ ] **AC-3** — none of the options depends on ListAgents, `cc-socks` or a desktop-only tool, or else it says plainly that it does and why that is acceptable.
  - Check: the PM.
- [ ] **AC-4** — no code change, no live Claude CLI run.
  - Check: QA, `git status` in caw-back / caw-front.

## Constraints

- Short: one screen, file `maps/caw-wake-107.md` (or the SA's choice under `ai-worker/`). The PM writes the Thai version for the owner.
- No code changes; no live run.
- Team A is not needed: Blueprint is not involved. If the SA (B) finds a seam question, it comes to the PM.

## Out of Scope

- Fixing this desk's own ring problem (workspace tooling, the owner's call). · Building REQ-106.

## Questions

- **Q1 (QA → PM — does not block)** — the SA ran `claude --help` (no model, no quota). QA passed AC-4 reading "no live Claude CLI run" as "no session / no quota spent". If it should mean "never execute the binary", say so. — `tests/TEST-103-caw-wake-workers-study.md` #5
- **Q2 (owner via Atom 12:39 → PM → SA B — follow-up, owner waiting)** — *"won't it forget?"* A long-lived `claude -p` worker (option A) fills its context and auto-compacts, losing detail over time. Does `maps/caw-wake-107.md` cover context growth/compaction? How should CAW keep a worker's memory reliable — e.g. state in files/DB, re-feed card + spec each task, restart/rotate the session after N tasks or on a size signal, `--resume` limits? Answer short (≤ half a screen) as a new section in `maps/caw-wake-107.md`, with one recommendation; cite `caw-back → file:line` for what today's prompt already re-feeds; no code, no live run. Name what only a live run can prove.
  > answer: yes, an open session's own memory fades, so CAW never relies on it. Each task re-feeds itself (prompt + `card_context` from CAW's store, `caw-back → src/runner/prompt.ts:11-22`, `cards/service.ts:90-104`); rotate the session after N tasks or a token threshold; `--resume` only for a crash; lasting knowledge is written to CAW as notes/decisions. Live-only proofs listed. — Silver (SA B) 2026-10-29, `maps/caw-wake-107.md` § "Won't option A forget?"
- (Q1 answer, kept:)
  > answer: your reading holds. "Live run" means a model call / session that spends the owner's quota; `claude --help` (and `--version`) is not one. — Porter (PM) 2026-10-29 `[PM-decided]`
