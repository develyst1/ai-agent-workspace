# REQ-127: Blueprint's front and back build the way the owner deploys
- Status: **DELIVERED** (2026-10-31 18:3x, the PM — DECISIONS 18:3x; uncommitted on `nichaphon`, git on the owner's word) · TEST_PASSED (2026-10-31 18:3x, QA Tanya — AC-1/2/3/5 PASS, AC-4 NOT_TESTED as PM-accepted; `tests/TEST-125-blueprint-deploy-ready-build.md`) · was SPEC_DONE (18:2x, Sober) · READY_FOR_SA (2026-10-31 16:5x, the PM)
- Priority: HIGH `[operator]` — the owner: *"เพราะเวลาฉันdeploy ต้องใช้แบบนี้ตลอด"*
- Requested: 2026-10-31 by the owner, typed to Atlas, relayed in `REQUEST-atlas-to-porter-ispace-2026-10-31-deploy-ready-blueprint.md` (workspace root): *"ดู next config package json script H:\scheduler\smart-scheduler-back H:\scheduler\smart-scheduler-front แล้วมาทำที่นี้ด้วย H:\ispace\blueprint-front H:\ispace\blueprint-back แล้วทำสกิลให้ด้วย เพราะเวลาฉันdeploy ต้องใช้แบบนี้ตลอด"* (the skill part is Atlas's, done: `deploy-ready-build`). Stamp `operator`. (SYSTEM-FACTS § "The owner's deploy build shape"; DECISIONS 2026-10-31 16:5x)
- Deadline: none · Team: **A (Blueprint)** — `blueprint-front`, `blueprint-back` · checkout: the owner's, branch **`nichaphon`** on his Windows box `[operator]` (Q1, DECISIONS 17:0x)

## Problem / Goal

The owner builds every project the same way and carries the build to the server himself. Today Blueprint does not:
`blueprint-front` builds a normal `.next` folder (no standalone server, no static copy), and `blueprint-back` has
no `build` script at all. He wants both repos to produce his standard artifact with one `bun run build`, with
nothing done by hand.

## Requirement

1. **Front:** `bun run build` in `blueprint-front` produces a standalone Next server that serves its pages with CSS
   and JS — the skill `deploy-ready-build` § Front (`output: "standalone"`, the static/public copy script, `build`
   script). The existing `prebuild` (theme generation) and `NEXT_DIST_DIR` per-team folders keep working.
2. **Back:** `bun run build` in `blueprint-back` produces one Linux x86-64 binary — skill § Back (`--compile
   --minify --target=bun-linux-x64`, entry = the file that calls `Bun.serve`). Port, host and database URL come
   from the environment as today.
3. **Whatever `--compile` cannot carry** (named risk: `@electric-sql/pglite` WASM; also migrations or files read
   from disk) is found, and either shipped beside the binary with its path from an env var, or the SPEC says why
   production does not need it — **proved by running the binary, never assumed** (skill § Back step 3).
4. Local use is unchanged: `dev`, `start`, tests, typecheck and lint work as before; build output stays git-ignored.

## Acceptance Criteria

- **AC-1** Fresh `bun run build` in blueprint-front exits 0; `<distDir>/standalone/server.js` and
  `<distDir>/standalone/<distDir>/static/` exist.
- **AC-2** `PORT=<free> HOSTNAME=127.0.0.1 node <distDir>/standalone/server.js` serves the home page **and** one
  `/_next/static/...` file with HTTP 200, and the page shows its styles in a browser.
- **AC-3** Fresh `bun run build` in blueprint-back exits 0; `file dist/<name>` says ELF 64-bit x86-64.
- **AC-4** The binary, started on Linux (WSL or Atom's box) with a free `PORT` and the local TEST settings, answers
  a real route that reads the database (not only a health check) — this is where pglite is proved. Not runnable →
  `UNVERIFIED` with the reason, and the PM decides.
- **AC-5** `bun run dev` / `start` / the repos' test, typecheck and lint commands pass as before (REQ-108 AC-4
  smoke on the working setup); `git status` after a build shows no build output.

## Out of Scope

- Any deploy, pm2 (never run — DECISIONS 2026-10-30 19:3x / 23:3x), server, nginx, `.env` files, deploy README,
  CI/CD — the 2026-10-30 23:31 off-limits list stands.
- The CAW repos (`caw-back`, `caw-front`) — not in this ask.
- Any git without his word (the work stays uncommitted on `nichaphon` until he says it).

## User-facing wording (the PM)

None — no screen changes.

## Questions

- Q1 (PM → owner, 2026-10-31 17:0x): which checkout does the team edit — his `nichaphon` checkout on this Windows box
  (where the team's sessions run; not yet in `machine.local.md`), or `atom` on Atom's box? Until answered: SPEC only,
  no repo edit (Atlas's risk 2).
  > answer (owner, typed in the PM pane 2026-10-31 17:0x): *"nichaphon on this PC"* — build on branch `nichaphon` in
  > his checkouts on the Windows box (paths: `machine.local.md`). Hold lifted. (DECISIONS 17:0x)

## AC check

(Sober, SA Team A, 2026-10-31 18:2x — checked against the owner's checkouts on `nichaphon`, uncommitted: blueprint-front 6a64527 + 4 paths, blueprint-back 08e1e4d + 2 paths. SPEC-127, TASK-172/173.)

| AC | Where it is met | Self-checked |
|---|---|---|
| AC-1 | blueprint-front `next.config.ts:7` `output: "standalone"` + `package.json:12` `build` → copy script; fresh `bun run build` exit 0, `.next/standalone/server.js` + `.next/standalone/.next/static/` exist — TASK-172 DoD 4–5, re-run by SA 18:18 (§ Review); `.next-a` too (DoD 9) | yes |
| AC-2 | `node .next/standalone/server.js` on 4391 / 4491 → `/` 200, `/_next/static/chunks/…css` 200 (TASK-172 DoD 6; SA re-run 18:18); browser screenshots styled, `tests/harness/task-172/*.png` (DoD 7). The home screen with real data not shown (no back running) — not part of the AC | yes |
| AC-3 | blueprint-back `package.json:6` `build` (`--target=bun-linux-x64`); `bun run build` exit 0, `file dist/blueprint-back` → `ELF 64-bit LSB executable, x86-64` — TASK-173 DoD 3–4, re-run by SA 17:39 | yes |
| AC-4 | **UNVERIFIED — no Linux on this box** (SPEC-127 § Linux / AC-4). Partial proof: SA probe P6 — a compiled (Windows-target) binary with the owner's `.env` read `/v1/projects` from the TEST DB (200) and parsed a PDF upload (201 `read`). pglite: not carried by `--compile` (P2), not needed in production (SPEC-127 D3). The AC's own rule — "Not runnable → UNVERIFIED with the reason, and the PM decides" — applied: PM accepted 17:2x (SPEC-127 Q3 answer); settles on the owner's first server run | yes (as the AC's UNVERIFIED path) |
| AC-5 | front: `bun run dev` 200 on 3100, `next start` 200 (DoD 8), `bun run typecheck` exit 0, `bun test src` 238 / 0 = base — SA 18:19. back: `bun run dev` and `bun test` give exactly the base failures on Windows (SPEC-127 R5, PM 17:2x: base recorded) — TASK-173 DoD 8–9, fail lists diffed 14 = 14. No `lint` script in either repo. `git status` after builds: only the closed-list paths, no build output, no `bun.lock`. REQ-108 AC-4 smoke: a QA run, not run by the SA | yes (local commands) · smoke → QA |
