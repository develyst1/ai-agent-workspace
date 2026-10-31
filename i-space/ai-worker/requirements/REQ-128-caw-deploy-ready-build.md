# REQ-128: CAW's front and back build the way the owner deploys
- Status: **DELIVERED** (2026-10-31 19:0x, the PM — DECISIONS 19:0x; TEST-126 PASSED; uncommitted on `nichaphon`) · TEST_PASSED (2026-10-31 19:0x, QA Tanya — AC-1/2/3/5 PASS, AC-4 Linux NOT_TESTED as accepted, Windows partial PASS; `tests/TEST-126-caw-deploy-ready-build.md`) · was SPEC_DONE (18:55, Silver) · READY_FOR_SA (2026-10-31 18:4x, the PM)
- Priority: HIGH `[operator]`
- Requested: 2026-10-31 18:39 by the owner, typed in the PM pane: *"ช่วยทำcaw ให้ด้วย ที่ว่า พร้อมdeploy"* — right after REQ-127 (Blueprint) was committed, so it means the same build shape for CAW. Stamp `operator`. (DECISIONS 2026-10-31 18:4x)
- Deadline: none · Team: **B (CAW)** — `caw-back`, `caw-front` · checkout: the owner's, branch **`nichaphon`** on his Windows box, as REQ-127 `[PM-decided]` (same ask, same box; paths in `machine.local.md`)

## Problem / Goal

Same as REQ-127, but for CAW. `caw-front` builds a normal `.next` folder, with no standalone server and no static copy. `caw-back` has no `build` script. The owner wants each repo to produce his standard artifact from a single `bun run build`, with nothing done by hand.

## Requirement

1. **Front:** `bun run build` in `caw-front` produces a standalone Next server that serves its pages with CSS and JS, per skill `deploy-ready-build` § Front. `NEXT_DIST_DIR` per-session folders and `PORT` from the environment keep working.
2. **Back:** `bun run build` in `caw-back` produces one Linux x86-64 binary, per skill § Back (`--compile --minify --target=bun-linux-x64`). The entry is the file that calls `Bun.serve`, which is not `src/dev.ts`'s wrapper unless that is the real entry; the SA checks. Port, host and database URL come from the environment as today.
3. **Whatever `--compile` cannot carry is found and handled, and proved by running the binary.** Candidates: pglite, migrations, prompt/template files read from disk, and anything CAW starts as a child process (the worker CLI). Each one ships beside the binary with its path taken from an env var, or the SPEC says why production does not need it. Same rule as REQ-127 req 3.
4. Local use is unchanged: `dev`, `start`, tests and typecheck work as before. Build output stays git-ignored, and `bun.lock` is not changed by the work (REQ-127 R2/R6: this box's bun rewrites the v2 lock).

## Acceptance Criteria

- **AC-1** A fresh `bun run build` in caw-front exits 0, and `<distDir>/standalone/server.js` and `<distDir>/standalone/<distDir>/static/` exist.
- **AC-2** `PORT=<free> HOSTNAME=127.0.0.1 node <distDir>/standalone/server.js` serves the home page **and** one `/_next/static/...` file with HTTP 200, and the page shows its styles in a browser.
- **AC-3** A fresh `bun run build` in caw-back exits 0, and `file dist/<name>` says ELF 64-bit x86-64.
- **AC-4** The compiled back answers a real route that reads the database. On Linux this is `UNVERIFIED`, accepted in advance as REQ-127 (no Linux on this box), and it settles on the owner's first server run. A Windows-target compile run with the owner's `caw-back/.env` is the partial proof, as in SPEC-127 P6.
- **AC-5** `dev` / `start` / tests / typecheck give the same results as before, measured against a base recorded first. `git status` after a build shows only the changed config files, with no build output and no `bun.lock`.

## Out of Scope

- Any deploy, pm2 (never run), server, nginx, `.env` files, deploy README, CI/CD (the 2026-10-30 23:31 list stands).
- Blueprint (done in REQ-127). Any git without the owner's word.

## User-facing wording (the PM)

None, because no screen changes.

## Questions

- Q1 (SA B → PM, 2026-10-31 18:47): **CAW's runner cannot be compiled with build config alone.** A compiled runner would start itself as its own MCP server and read-guard hook, which loses the read fence (SPEC-128 D3, P3). **My default:** compile the API only (`dist/caw-back`). The runner keeps running from source (`bun run runner`) beside it. If the owner wants one artifact for all of CAW, that needs app code and is a new REQ. Full decision pack: `specs/SPEC-128-caw-deploy-ready-build.md` § Questions Q1. **Not blocking**: TASK-174/175 are cut on the default.
  > answer (PM, 2026-10-31 18:4x): default accepted — API binary only, runner from source; one artifact = a new REQ only if the owner asks. (DECISIONS 18:4x)

## AC check
(SA B, Silver, 2026-10-31 18:55 — each row checked against the owner's trees on `nichaphon`; caw-front e7a36eb fp `2b90fa70abef`, caw-back 8271082 fp `adeeea17e327`)

| AC | Where it is met | Self-checked |
|---|---|---|
| AC-1 | TASK-174 DoD 5–6: `NEXT_DIST_DIR=.next-f bun run build` → exit 0, `[postbuild] copied …`; `.next-f/standalone/server.js` and `.next-f/standalone/.next-f/static/` exist (also SPEC-128 P4) | yes |
| AC-2 | TASK-174 DoD 7–8 + § Review: `node .next-f/standalone/server.js` → `/`, `/start`, CSS, JS 200 (re-run by SA 18:53: three 200s); a real browser shows the styled page (computed `body` font/colours) | yes |
| AC-3 | TASK-175 § Review: `bun run build` → `compile dist/caw-back bun-linux-x64`; `file dist/caw-back` → `ELF 64-bit LSB executable, x86-64` (re-run by SA 18:53) | yes |
| AC-4 | Partial proof as accepted: a Windows-target compile on the owner's `.env`, `/health` 200, `/v1/projects` 200 from the TEST DB (TASK-175 DoD 6; SPEC-128 P2). **Linux run UNVERIFIED** — settles on the owner's first server run, as accepted in this AC. The binary is **the API only**; the runner runs from source (Q1) | yes (as accepted) |
| AC-5 | Tests / typecheck = base (front 370/0, tsc 0; back 280 pass · 1 skip · 151 fail · 42 errors / 432, tsc 0 — re-run by SA). `start`: `next start` serves the build (TASK-174 DoD 9). Front `dev`: `next dev` with the new config → `/` 200, tree unchanged (SA 18:55). **`bun run dev` itself fails on this Windows box before and after the change** (`${PORT:-3500}` is not expanded; script untouched). Back `dev`: not run, because it starts real workers (SYSTEM-FACTS 12:54); its source is unchanged. `git status` after builds = the closed lists only, with no build output and no `bun.lock` | yes |
