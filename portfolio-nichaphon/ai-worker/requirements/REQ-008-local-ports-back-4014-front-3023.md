# REQ-008: Local ports — `back/` on 4014 by env; `front/` on 3023 if its port is locked
- Status: **READY_FOR_SA** for R1 (the `back/` half). **R2 (the `front/` half) is HELD on Q54** — the owner's
  ask is conditional ("if it is locked"), and the answer to his condition is mixed (see §Constraints), so R2
  is not to be specced until he answers. Nothing in R1 waits on Q54.
- Priority: MEDIUM (small; local-run convenience — no visitor-facing change)
- Requested: 2026-09-13 by the owner (Nichaphon)
- Deadline: none stated

## Problem / Goal

The owner's words, verbatim (2026-09-13):

> backend  ทำเป็น env port 4014
> frontend มี lock port มั้ย ถ้ามีlock ไว้ ขอ port3023

Read as: (1) the backend's port must be an **environment value**, and that value must be **4014**;
(2) a question — *is the frontend's port locked?* — with a conditional ask: *if it is, I want it on
3023.* He runs both halves on his own machines, where the current numbers collide with other things
(QA saw port 3000 already taken by a foreign process on this machine, TEST-008 §Surface, 2026-09-13).
Nothing here changes what a visitor sees; it changes where the two processes listen locally.

## Requirement

1. **R1 — `back/` listens on port 4014, and the number comes from the environment, not from code.**
   When the owner starts `back/` the way the README tells him to (`bun run dev` / `bun run start`) with
   no extra typing, it listens on **4014**. The port must be readable/changeable as an env value
   (`PORT` already is — see §Constraints); what is missing is that 4014 is what he gets.
2. **R1a — everything that talks to `back/` locally follows the new port without hand-editing**: the
   Home "Ask" section's default WebSocket target (REQ-007 — today `ws://localhost:3001/ws`), the
   `back/` README, and any local recipe (`ws-client`, curl lines, `/health`) that names 3001. A visitor
   on Home must still get an answer from a `back/` on 4014 without anyone editing a URL by hand.
3. **R2 — HELD on Q54.** If the owner confirms, `front/` runs on **3023** for `npm run dev` and
   `npm run start`, again without extra typing, and every place that names the front's port follows.
   Until Q54 is answered, R2 is a question, not a requirement.
4. **R3 — no other behaviour changes.** No route, string, or feature moves; REQ-005/006/007 stay as
   delivered. The deployed site (`portfolio.develyst.online`) and the droplet's ports are the owner's
   hands only (standing rule) — this REQ is about local runs; whatever he does on the droplet is his.

## Acceptance Criteria

- [ ] AC-a: `back/` started per its README with **no** extra flag or exported variable listens on **4014**
      (`GET /health` answers on 4014; nothing answers on 3001), and the number is visibly an env value
      (documented in `back/README.md`'s env table as 4014, not a bare constant in code).
- [ ] AC-b: With `back/` on 4014, the Home "Ask" section on a locally served `front/` completes one
      **stub** ask (zero real calls — the TEST-008 stub recipe) with no URL edited by hand.
- [ ] AC-c: Read-only grep of the repo: no local recipe, README line, or default still points a
      *local* client at `3001` for `back/` — or each remaining `3001` is listed with a reason (e.g. a
      Docker file the owner keeps as is).
- [ ] AC-d (only if Q54 = yes): `front/` via `npm run dev` and `npm run start` listens on **3023** with no
      extra typing; the site's six routes load there; `front/README.md` says 3023.
- [ ] AC-e: Nothing else changes — `tsc` 0, `npm run build` 0, and REQ-007's stub happy path + REQ-005's
      strings unchanged (a short QA re-run on the new ports, zero real calls).

## Constraints

- **Verified read-only by Porter 2026-09-13 in the code repo (`portfolio-nichaphon-web`)** — facts, not
  design:
  - `back/src/config.ts:44–45` already reads `PORT` from the environment, **default 3001**. There is **no
    `.env` / `.env.example` under `back/`**; `back/README.md:33` documents `PORT` = `3001`.
  - `front/package.json` scripts are plain `next dev` / `next start` — **no port flag**; Next's own default
    (3000) applies, and Next honours `PORT` / `-p`. So the front's port is **not locked in the scripts**.
  - The front's port **is pinned in Docker artefacts**: `front/Dockerfile:43–45` `EXPOSE 3000` + `ENV
    PORT=3000`; `docker-compose.yml:35` `"3000:3000"`.
  - `back/` is pinned in `docker-compose.yml:11/14/21` (`"3001:3001"`, `PORT=3001`, a healthcheck on
    `localhost:3001/api`) and `:38` `NEXT_PUBLIC_API_URL=http://localhost:3001`.
  - The Home "Ask" WebSocket default lives in `front/src/constant/ask.ts:6` — `NEXT_PUBLIC_ASK_WS_URL ??
    'ws://localhost:3001/ws'` (TASK-026); `front/README.md:35` documents it. It is **baked at build time**
    (SPEC-007 SQ36).
- **How** the env value is supplied (a `.env` file, a changed default, a script) is Sober's design, not
  mine. The owner's words fix only two things: *env* and *4014*. **Q53** asks him one thing Sober may
  want before choosing: does the **code default** also become 4014, or does 4014 live only in an env
  file? — non-blocking; SA may pick and record his default, and the owner overrules if he minds.
- Standing rules: no deploy, no git write, no real gateway call is needed for this REQ (stub only).
- Docker files: the compose/Dockerfile pins are pre-existing artefacts (some predate `back/` — the
  healthcheck path `/api` does not exist on today's `back/`). Whether they are updated or left is Sober's
  call, **listed either way under AC-c**; nothing in this REQ asks anyone to run Docker.

## Out of Scope

- The droplet / pm2 / nginx ports of the live site (the owner's, SQ36 / Q43).
- Any change to what `back/` or `front/` do beyond the port they listen on.
- The stale root `README.md` (SQ33) — unless Sober folds the two port lines into it while there.

## Questions

(SA Lead asks here; Porter answers as `> answer: ...`. Owner questions are numbered Q53+, asked in Thai.)

- **Q53 (owner, non-blocking)** — 4014 as an env file value only, or also as the code default when no env is
  set? *Default if unanswered: Sober picks, records it in SPEC-008, and AC-a holds either way (the README
  must say 4014).*
  > SA default taken (Sober 2026-09-13): **the code default becomes 4014** (`back/src/config.ts:45`), `PORT` in the
  > environment or an optional git-ignored `back/.env` still overrides — because `.gitignore` ignores `.env*`, so an
  > env file never reaches his other machines. If he answers "env file only", it is a one-line revert + his own
  > `.env` by hand — see specs/SPEC-008-back-port-4014-by-env.md §Overview + D1/D2.
- **Q54 (owner, BLOCKS R2 only)** — the front is **not** locked in its run scripts (Next default 3000,
  changeable by `PORT`/`-p`); it **is** pinned to 3000 in the Docker files. Does he want 3023 made the
  front's fixed local port anyway (dev + start + README), or leave the front alone? *No default taken.*
