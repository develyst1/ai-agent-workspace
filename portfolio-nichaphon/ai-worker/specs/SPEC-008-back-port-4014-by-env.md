# SPEC-008: `back/` listens on 4014 — an env value with 4014 as its default; every local client follows
- Source: REQ-008 (**R1 + R1a + R3 only**). **R2 (`front/` on 3023) is NOT specced here — HELD on the owner's Q54.**
  When Q54 is answered "yes", R2 becomes a §R2 addendum to this SPEC + its own TASK; "no" closes it.
- Status: **ACTIVE** (2026-09-13, Sober — TASK-028 `TODO`)
- Builds on: SPEC-006 §Config D4 (`back/src/config.ts` — env with baked defaults, no `.env` read by code),
  SPEC-007 D11 (`front/src/constant/ask.ts` — `ASK_WS_URL`, baked at build) and the `ws-client` helper.

## Overview

`back/src/config.ts:44–45` already reads the port from the environment (`PORT`, via `num()`, default
`3001`). REQ-008 R1 asks for two things: **env** (kept — nothing else changes about *how* the port is
read) and **4014** (what the owner gets with no typing). The change is therefore one number in one
place, plus every local thing that names the old number (R1a). Zero real gateway calls are needed —
`/health` makes none, and AC-b runs on the stub.

**Design pick for Q53 (non-blocking, owner may overrule): the code default becomes 4014.** Reason: the
root `.gitignore` ignores `.env*`, so any env file written under `back/` stays on the machine it was
written on — and the owner runs the pair on several machines (REQ-008 §Problem). A default in
`config.ts` travels with every clone; `PORT` in the environment still overrides it, so "env" holds
in the sense that matters (changeable without touching code, documented in the env table). No env
file is added to the repo. **If Q53 comes back "env file only, code default stays 3001"**, the
delta is: revert `config.ts:45` to `3001`, add a git-ignored `back/.env` on his machines by hand (his,
not the team's — it cannot be committed as the repo stands), and the README says so — a one-line
follow-up TASK, not a redesign.

## Decisions

- **D1 — One number changes in code: `back/src/config.ts:45` `num("PORT", 3001)` → `num("PORT", 4014)`.**
  `num()`'s rules stay: unset/empty/non-numeric/≤0 → the default. `PORT=4099` still wins.
- **D2 — An optional, git-ignored `back/.env` is honoured, verified once, never committed.** Bun loads
  `.env` from the process cwd on its own (no code, no `dotenv`); `config.ts` reads `process.env`, so a
  file `PORT=4099` must move the port. TASK-028 proves this **once with a throwaway file that is deleted
  in the same session** — it exists so the README's sentence about it is true, not so a file ships.
  `config.ts`'s header comment "No .env file is needed or read" becomes "…needed; if one exists in
  `back/`, Bun loads it before this module runs."
- **D3 — R1a: everything local that names `3001` for `back/` follows.** Exact list (read 2026-09-13):
  | File | Line(s) | Change |
  |---|---|---|
  | `back/src/config.ts` | 45 (+ header comment, D2) | default `4014` |
  | `back/scripts/ws-client.ts` | 3, 8, 11 | `ws://localhost:4014/ws` (env `ASK_WS_URL` still wins) |
  | `back/README.md` | 18, 33, 60, 88, 109 (+ the `.env` paragraph at 28–29 per D2) | `4014`; env-table row: `PORT` · `4014` · "Port `back/` listens on — code default; `PORT` in the environment or an optional git-ignored `back/.env` overrides it" (the "`front/` dev uses 3000" clause stays — R2 is held) |
  | `front/src/constant/ask.ts` | 6 | `?? 'ws://localhost:4014/ws'` — nothing else in that file |
  | `front/README.md` | 35 | default column `ws://localhost:4014/ws` |
  `back/src/index.ts:101–103` prints `${port}` and needs no edit. `back/test/*` bind port 0 — untouched.
  SPEC-007 D11's quoted default (`3001`) is superseded by this SPEC; SPEC-007 is `DONE` and not edited.
- **D4 — Left as they are, each listed under AC-c with its reason (nothing in this REQ asks anyone to run them):**
  | File | Line(s) | Reason |
  |---|---|---|
  | `docker-compose.yml` | 11, 14, 21, 38 | The owner's deployment file (PROTOCOL "Repo layout & ownership") — no role edits it without a TASK naming it on his word. Already stale on its own terms: the healthcheck path `/api` does not exist on `back/`, and `NEXT_PUBLIC_API_URL` is read nowhere in `front/src` (grep 0). → **SQ39** |
  | `README.md` (root) | 25, 36, 99 | Stale NestJS-era text, already the owner's open question **SQ33**; REQ-008 §Out of scope leaves it unless "the two port lines" are folded in — R2 is held, so there is only one line; not folded |
  | `SERVER_MAINTENANCE.md` | 15, 152, 159 | The droplet's port map for a *different* service ("Develyst Frontend" on 3001) — not this `back/`, his infra |
  Not in the repo but names 3001: `ai-worker/tests/harness/reverify-2026-09-02.cjs:18` (QA's own comment about a *front* dev server that once landed on 3001) — Tanya's file, FYI to Porter only.
- **D5 — The front default is baked at build (SPEC-007 D11 / SQ36).** The `.next` built for TASK-026 /
  TEST-008 still carries `3001`; **AC-b and AC-e require a fresh `npm run build`** after D3, and the QA
  re-run must be on that fresh build. Read-only check: `grep -r "3001" front/.next/static` → 0 hits
  after the build; `4014` ≥ 1 hit.
- **D6 — A three-line guard test** so the default cannot drift back silently: new `back/test/config.test.ts`
  — `PORT` unset → `config.PORT === 4014`; `PORT=4099` → `4099`; `PORT=abc` → `4014`. Save and restore
  `process.env.PORT` around each case (the getter reads on access, SPEC-006 D4, so no re-import).
- **D7 — R3 / zero real calls.** Every run in TASK-028 pins `GATEWAY_BASE_URL` at the stub (`http://127.0.0.1:3999`)
  or a dead port. `/health` never calls the gateway. No SPEC-006 / SPEC-007 ledger row is opened; the
  count stays `10 / 30` and `3 / 5`. No prompt, string, route or theme value moves.
- **D8 — The front's own run port is untouched (R2 held).** For AC-b Fern serves `front/` on whatever
  free port the machine offers (`PORT=<free> npm run start`, as QA did on 3072 in TEST-008 because 3000 is
  taken by a foreign process on this machine); that is a per-run choice, not a port change, and nothing
  in `front/` names it.

## Flow (what the owner gets after TASK-028)

1. `cd back && bun run dev` (or `start`), nothing exported → `[back] … listening on http://localhost:4014
   (ws://localhost:4014/ws) …`; `GET /health` answers on 4014; 3001 refuses.
2. `bun run ws-client "<q>"` with no `ASK_WS_URL` → connects to 4014.
3. `cd front && npm run build && npm run start` (any front port) → Home "Ask" opens `ws://localhost:4014/ws`
   with no URL edited by hand; a stub `back/` on 4014 answers. `NEXT_PUBLIC_ASK_WS_URL` still overrides
   at build time (deploy day, SQ36 — unchanged).
4. `PORT=4099` in the environment, or in an optional git-ignored `back/.env`, moves `back/` to 4099.

## Non-functional

Nothing new: no auth, no storage, no logging change. The log line already prints the port.

## Tasks

- TASK-028: `back/` on 4014 — default, README, `ws-client`, front constant, guard test, fresh build, stub AC-b (depends on: —)
- (R2, if Q54 = yes): TASK-029 — not written; waits on the owner's word via Porter.

## Questions

(Fern asks here or in TASK-028; Sober answers as `> answer: ...`. SA notices to Porter are numbered SQ39+.)

**SQ39 (to Porter → owner, FYI, non-blocking)** — `docker-compose.yml` keeps `back/` on `3001` (lines 11/14/21)
and points a variable nobody reads at `http://localhost:3001` (38); its healthcheck hits `/api`, which this
`back/` does not serve. Left exactly as found (D4) because the file is his deployment artefact. If he wants
it to follow 4014 (and the healthcheck to hit `/health`), that is a TASK naming the file on his word — not
a team default. Same standing for `front/Dockerfile` `EXPOSE 3000` / `ENV PORT=3000` once Q54 is answered.
