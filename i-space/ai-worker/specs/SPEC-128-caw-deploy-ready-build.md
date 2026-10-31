# SPEC-128: CAW's front and back build the way the owner deploys
- Source: REQ-128
- Status: DONE (2026-10-31 18:55, Silver — SA, Team B; TASK-174 + TASK-175 DONE; REQ-128 § AC check)
- Skill: `deploy-ready-build` — applied to `caw-front` and `caw-back`; shape copied from SPEC-127 (Team A, proven 18:38). Where CAW differs, this SPEC says why.
- Read (2026-10-31 18:4x, read-only, the owner's Windows checkouts, branch `nichaphon`, `machine.local.md`): `caw-front` e7a36eb — `package.json`, `next.config.ts`, `.gitignore`, `playwright.config.ts:3,28-35`, `README.md:15-19`, `src/api/index.ts:9,25`, `src/api/http.ts:20`; `caw-back` 8271082 — `package.json`, `.gitignore:92`, `bunfig.toml`, `src/index.ts`, `src/dev.ts`, `src/db/client.ts`, `src/db/migrations-config.ts:5`, `src/runner/hop.ts:176-184`, `src/runner/settings.ts:65-76`, `src/runner/prompt.ts:46`, `src/runner/config.ts`. Probes in **scratch clones** (same HEADs) in my session scratchpad, never in a repo.
- **Checkout: the owner's, branch `nichaphon`, on his Windows box** — `[PM-decided]` DECISIONS 2026-10-31 18:4x (line 126), same as REQ-127. No git without his word.

## Overview

Build configuration only (DECISIONS 16:5x (1), applied to REQ-128 at 18:4x): one `next.config.ts` line, one copied script, two `build` scripts, one `.gitignore` line per repo. **No app code change, no API shape change, no `openapi.json` change** ⇒ no seam, no `gen:api` pair (spec-rules §2). The two TASKs are independent and may run in parallel.

**The one way CAW differs from Blueprint:** caw-back is not one server. Production needs the **API** (`src/index.ts`, the `Bun.serve` file) **and the runner** (`src/runner/main.ts`), and the runner starts the MCP server and the read-guard hook as `<bun> run <file>.ts` (D3). Only the API can be compiled with build config alone (P1/P2). The runner cannot (P3) → Q1.

Consumers (probe): `probe-change.sh` not run — the change has no TS or API shape (same reason as SPEC-127 D1/D2); run instead in scratch clones (P1–P5). Build-script consumers by `git grep -n 'run build\|"build"\|next start\|run start\|NEXT_DIST_DIR'` (2026-10-31), each listed in D1/D2.

## D1 — Front (`caw-front`) — TASK-174 (FE)

| File | Change |
|---|---|
| `next.config.ts` | add `output: "standalone",` on the line after `distDir` (keep `distDir: process.env.NEXT_DIST_DIR \|\| ".next"`, `agentRules`, `allowedDevOrigins` as they are; keep the file's CRLF) |
| `scripts/copy-standalone-assets.mjs` | **new**, byte for byte from the skill's `references/copy-standalone-assets.mjs` (workspace `.claude/skills/deploy-ready-build/references/`) |
| `package.json` | `"build": "next build && node scripts/copy-standalone-assets.mjs"`; `dev`, `dev:mock`, `start`, `test:e2e` unchanged |
| `.gitignore` | add `*.zip` (skill § Before you hand back). Build output is already ignored: `.gitignore:12` `/.next/`, `:39` `/.next-*/` |

- **Artifact:** `<distDir>/standalone/` (default `.next/standalone/`). `public/` does not exist in this repo, so only `<distDir>/static` is copied. **Server start command:** `node server.js` inside it, with `PORT`, `HOSTNAME=127.0.0.1`, and `CAW_API_URL` (default `http://127.0.0.1:4500`, `src/api/index.ts:25`) / `BLUEPRINT_URL` from the environment. Both are read at run time, not baked in: the front reads no `NEXT_PUBLIC_*` (grep 2026-10-31).
- `NEXT_DIST_DIR` per-session folders keep working: the config and the copy script read the same variable (P4 used `.next-f`).
- Patch kept: SA scratch `spec128-front.patch` (next.config.ts + package.json; the copy script added as a new file).

Consumers (probe): scratch run of the change (P4) → 0 errors
caw-front → playwright.config.ts:34 `bunx next start -p <port>` on the build → untouched — `next start` on a standalone build still serves `/` and its CSS, both 200, with one harmless warning line (P5, corrected; as SPEC-127) `[SA-decided]`
caw-front → package.json `start` (`next start -p ${PORT:-3500}`) → untouched — same as above (P5)
caw-front → README.md:15-16 `NEXT_DIST_DIR=.next-b bun run build` / `bun run start` → untouched — both still true (P4, P5)

## D2 — Back (`caw-back`) — TASK-175 (BE)

| File | Change |
|---|---|
| `package.json` | add `"build": "bun build src/index.ts --compile --minify --target=bun-linux-x64 --outfile dist/caw-back"` after `"api"` |
| `.gitignore` | add `*.zip`. `dist` is already ignored (`.gitignore:92`; `git check-ignore -v dist/caw-back` → `.gitignore:92:dist`) |

- Entry = `src/index.ts`: it calls `Bun.serve` (`:19`), with `HOST` (default `127.0.0.1`), `PORT` (default 4500) and `DATABASE_URL` (required, `:7-10`) from the environment already ⇒ no code change. `src/dev.ts` is the local two-process wrapper and is **not** the entry (it spawns `index.ts` and `runner/main.ts` by path, `dev.ts:15-16,37`).
- **Artifact:** `dist/caw-back`, one ELF x86-64 file = **the API only**. **Server start command:** `./caw-back`, with `PORT`, `HOST`, `DATABASE_URL` (a Postgres URL), `BLUEPRINT_URL`, `CAW_POLL_MS` from the environment / the `.env` in its working directory.

Consumers (probe): scratch run of the change (P1, P2) → 0 errors; `git grep -n 'run build\|"build"\|dist/'` in caw-back → 0 hits (2026-10-31)

## D3 — What `--compile` cannot carry (REQ-128 req 3) — result table

| Item | Where | In the API binary? | Production needs it? | Decision |
|---|---|---|---|---|
| **The runner** | `src/runner/main.ts` (`bun run runner`) | No — a separate entry | **Yes** — it runs every CAW worker (SYSTEM-FACTS 10:51 c) | **Q1.** Default: it runs from source with `bun` on the server, as today |
| MCP server started for each worker | `src/runner/hop.ts:176,184` `command: process.execPath, args: ["run", SERVER]`, `SERVER` = `../mcp/server.ts` | n/a (the runner's child) | Yes | Cannot be compiled as written — **proved, P3**: inside a compiled binary `process.execPath` is the binary itself, it ignores `run <file>` and starts its own entry again, and `SERVER` resolves into the bundle (`B:\~BUN\mcp\server.ts`), not a file on disk. → Q1 |
| Read-guard hook (the read fence, TASK-C-042) | `src/runner/settings.ts:65,76` `<execPath> <read-guard.ts> …` | n/a | Yes — client data must never reach the model | Same as above (P3). A compiled runner would run **itself** as the hook: the fence would be lost, not refused. **Never ship a compiled runner without a code change.** → Q1 |
| Shipped starter skills | `src/runner/prompt.ts:46` `../../skills/` (repo root `skills/role-*`) | n/a | Yes (fallback skills) | Runner-side, travels with the source → Q1 |
| Drizzle migrations folder | `src/db/migrations-config.ts:5` | No (read from disk) | No — read only on the `pglite:*` path (`client.ts:18-20`); a real database is migrated by the operator (`client.ts:14-15`, `bun run db:migrate` from source) | Not shipped; how the server DB is migrated is deployment side, off limits (23:31) |
| PGlite | `src/db/client.ts:1,19` | Imported (bundled JS); its data files are not | No — production `DATABASE_URL` is Postgres | The binary needs a Postgres `DATABASE_URL`. `pglite:memory` / `pglite:file:` in the binary: `inferred` to crash at start as Blueprint's did (SPEC-127 P2), not probed for CAW — stays for source runs |
| Blueprint follower (`[pull]`) | `src/follow/pull.ts` via `index.ts:15,24` | Yes (HTTP only) | Yes | Bundled — P2 printed `[pull] blueprint_unreachable` (no Blueprint on :4200 here), i.e. it ran |

## Probes (2026-10-31 18:42–18:44, scratch clones, this Windows box, bun 1.3.14 / node 22.23.2; `bun install --no-save` → 121 / 439 packages, `git status` clean)

- **P1** back, Linux target: `bun build src/index.ts --compile --minify --target=bun-linux-x64 --outfile <scratch>/caw-back` → `bundle 300 modules`, `compile … bun-linux-x64-v1.3.14`; `file` → `ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 3.2.0`. (The runner entry compiles too, 17 modules, but see P3.)
- **P2** back, a **Windows-target** compile of the same source, run in a scratch folder holding a copy of the owner's `caw-back/.env` (Postgres TEST DB, SYSTEM-FACTS 12:54; never printed; the copy was deleted after), `PORT=4595 HOST=127.0.0.1 CAW_POLL_MS=0` → `caw-back API on http://127.0.0.1:4595` · `GET /health` → 200 · `GET /v1/projects` (`X-CAW-Actor: sa`) → 200 with the TEST DB's projects (read only — nothing written). Stopped by port (pid 24564). ⇒ the compiled API reaches Postgres. **Still UNVERIFIED: the Linux binary itself** (no Linux here) = AC-4, accepted in advance (REQ-128 AC-4).
- **P3** a 4-line probe compiled with `bun build --compile` and run as `probe.exe run <scratch>/x.ts` → `argv=["B:/~BUN/root/probe.exe","run","…/x.ts"]` (its own code ran; the `.ts` was not), `server=B:\~BUN\mcp\server.ts`, exit 0. ⇒ `hop.ts:184` and `settings.ts:76` start the wrong program in a compiled runner. (`BUN_BE_BUN=1 probe.exe --version` → `1.3.14`: the binary can act as bun, but only for a `.ts` file that exists on disk — i.e. the source must ship anyway.)
- **P4** front, D1 applied (CRLF kept): `NEXT_DIST_DIR=.next-f bun run build` → exit 0, `[postbuild] copied .next-f/static into .next-f/standalone`; `.next-f/standalone/server.js` and `.next-f/standalone/.next-f/static/` exist; `git status` → only ` M next.config.ts`, ` M package.json`, `?? scripts/`. `PORT=4396 HOSTNAME=127.0.0.1 CAW_API=mock node .next-f/standalone/server.js` → `/` 200 · `/start` 200 · `/_next/static/chunks/2oraxoj-x1o5_.css` 200 · one `/_next/static/chunks/*.js` 200. Stopped by port (pid 10136).
- **P5** `NEXT_DIST_DIR=.next-f bunx next start -p 4397` on the same build → `/` 200, the same CSS 200. ~~no warning line printed~~ **Corrected 18:5x (F-064):** it prints `⚠ "next start" does not work with "output: standalone" configuration. Use "node .next/standalone/server.js" instead.` (`front-start.out:6`; my `grep -i warn` could not match it). This is the same warning as SPEC-127 P4, and it is harmless: the pages still serve. Stopped by port (pid 5240).

## Lockfile (REQ-128 req 4)

The owner's plain `bun install` (~18:3x) left ` M bun.lock` in both checkouts (v2 lock rewritten as v1 by bun 1.3.14 — SPEC-127 R2). `[PM-decided]` DECISIONS 18:4x: SA B restores. Done 18:44: backups in SA scratch (`lock-backup/caw-*.bun.lock.owner-1839`), each lock replaced by `cp` from a fresh scratch clone of the same HEAD (its working-tree form), no git write → `git status --short` empty in both. Both TASKs install with **`bun install --no-save`** only; `bun.lock` is on neither closed list.

## Risks / assumptions

- **R1** The Linux binary was built on Windows (cross-compile). P1 shows a correct ELF; that it runs is only known on Linux (AC-4).
- **R2** As SPEC-127 R6: with the v2 lock ignored here, `node_modules` are re-resolved, not the locked versions. Not changed by REQ-128.
- **R3** The front build may fetch fonts at build time (not checked for caw-front; P4 built with the internet on). Not changed here.
- **R5 (pre-existing, base run 18:45, owner's tree 8271082):** on this Windows box `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT bun --no-env-file test` → **280 pass / 151 fail** (432 tests, 76 files, 46.9 s): 82 lines `Can't find meta/_journal.json` (the `new URL(…).pathname` migrations path on Windows, as Blueprint's SPEC-127 R5) plus POSIX-only runner tests (hop files, process groups, `ps`). `bunx tsc --noEmit -p .` → exit 0. So AC-5 on this box = **the same 280 / 151** after the change, and the suite's green state stays UNVERIFIED on Windows. Not REQ-128's; a fix is app code.
- **R4** Deploying the API binary alone gives a CAW **with no workers**: the screen says the team is not running (`dev.ts` header). Until Q1 is settled the runner must be started from source beside it.

## Tasks

- TASK-174: caw-front — standalone output + static copy in `build` — owner: FE Fanta (depends on: none; base e7a36eb on `nichaphon`)
- TASK-175: caw-back — `build` compiles the API to one Linux binary; prove it — owner: BE Bob (depends on: none; base 8271082 on `nichaphon`)

## Questions

- **Q1 (SA → PM, 2026-10-31 18:45) — the runner.** `Checked: DECISIONS 16:5x (1) "build configuration only", 18:4x "same rules as REQ-127" · SYSTEM-FACTS 10:51 c (CAW's main work = CLI workers on the server) · REQ-128 req 2/3 — not covered: Blueprint has one process, so neither says what to do with a second entry that starts children by source path.` **I will do: compile the API only (D2); the runner stays a source run (`bun run runner` in a caw-back checkout with `bun install`) beside the binary**, and TASK-175 says so as the artifact line. Cases: owner deploys `dist/caw-back` + a source checkout for the runner → works as today · owner deploys the binary alone → API up, no workers (R4) · owner wants **one** artifact for all of CAW → a new REQ (app code: `hop.ts:176-184` and `settings.ts:65-76` take their child command from the binary, e.g. one binary with a sub-command for `mcp` and `read-guard`, plus `skills/` beside it with its path from an env var; it touches the read fence ⇒ `/security-review`, sized M). Correct only the line that is wrong. **Not blocking** — both TASKs are cut on the default.
  > answer (PM, 2026-10-31 18:4x, REQ-128 § Questions): default accepted — API binary only, runner from source; one artifact = a new REQ only if the owner asks. (DECISIONS 18:4x)
