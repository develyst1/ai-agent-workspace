# SPEC-127: Blueprint's front and back build the way the owner deploys
- Source: REQ-127
- Status: DONE (2026-10-31 18:2x, Sober — SA, Team A; TASK-172 + TASK-173 DONE; REQ-127 § AC check)
- Skill: `deploy-ready-build` (Atlas) — this SPEC applies it to `blueprint-front` and `blueprint-back`; where they differ, this SPEC says why.
- Read (2026-10-31, read-only, the owner's Windows checkout named in his own words, SYSTEM-FACTS § "The owner's deploy build shape"; branch `nichaphon`, clean): `blueprint-front` 6a64527 — `package.json`, `next.config.ts`, `.gitignore`, `playwright.config.ts`, `scripts/check-required.ts:180-200`; `blueprint-back` 08e1e4d — `package.json`, `.gitignore`, `src/index.ts`, `src/db/client.ts`, `src/scripts/migrate.ts`, `src/sources/link.ts:94-100`. Probes ran in **scratch clones** of both (same HEADs) in my session scratchpad — never in a repo.
- **Checkout: the owner's, on his Windows box, branch `nichaphon`** — owner typed in the PM pane *"nichaphon on this PC"* (DECISIONS 2026-10-31 17:0x, line 122); paths in `machine.local.md`. Not `atom`. No git without his word.

## Overview

Build configuration only (`[PM-decided]` DECISIONS 16:5x (1)): two `package.json` `build` scripts, one `next.config.ts` line, one copied script, one `.gitignore` line per repo. **No app code changes, no API shape change, no `openapi.json` change** ⇒ no seam, no `gen:api` pair (spec-rules §2). The two TASKs are independent and may run in parallel.

Consumers (probe): per repo in D1 and D2 → 0 type/API consumers; build-script consumers listed and ticked there.


## D1 — Front (`blueprint-front`) — TASK-172 (FE)

| File | Change |
|---|---|
| `next.config.ts` | add `output: "standalone",` next to `distDir` (keep `distDir: process.env.NEXT_DIST_DIR \|\| ".next"`, `agentRules`, `experimental` as they are) |
| `scripts/copy-standalone-assets.mjs` | **new**, copied byte for byte from the skill's `references/copy-standalone-assets.mjs` (workspace `.claude/skills/deploy-ready-build/references/`) |
| `package.json` | `"build": "next build && node scripts/copy-standalone-assets.mjs"`; `prebuild` (gen:themes), `dev`, `start` unchanged |
| `.gitignore` | add `*.zip` (skill § Before you hand back); `.next*` output is already ignored (`.gitignore:12` `/.next/`, `:56` `/.next-*/`) |

- **Artifact:** `<distDir>/standalone/` (default `.next/standalone/`). **Server start command:** `node server.js` inside it, `PORT` + `HOSTNAME=127.0.0.1` from the environment. `public/` does not exist in this repo, so only `<distDir>/static` is copied.
- `NEXT_DIST_DIR` per-team folders keep working: the config and the copy script read the same variable.
- `probe-change.sh` was **not run**: it symlinks the real repo's `node_modules`, and neither checkout has one (the engineer installs it, `--no-save`), so base and patched would fail alike and "0 errors" would prove nothing. The change has no TS or API shape; it was run instead in a scratch clone (§ Probes P4; base `typecheck` exit 0, re-run after the change in TASK-172 DoD 10). Patch kept: SA scratch `spec127-front.patch` (54 lines). Build-script consumers, by `git grep -n 'run build\|"build"'` 2026-10-31, each run in P4:

Consumers (probe): scratch run of the change (P4) → 0 errors
blueprint-front → playwright.config.ts:21 `bun run start -- -p <port>` (= `next start`) after a build → untouched — `next start` on a standalone build still serves `/`, static, `/dev/isolation/none` 200 (P4), one warning line
blueprint-front → scripts/check-required.ts:191-193 `bun run build`, then `next start -p <port>` → untouched — same as above (P4)


## D2 — Back (`blueprint-back`) — TASK-173 (BE)

| File | Change |
|---|---|
| `package.json` | add `"build": "bun build src/index.ts --compile --minify --target=bun-linux-x64 --outfile dist/blueprint-back"` |
| `.gitignore` | add `*.zip`; `dist` is already ignored (`.gitignore:92`) |

- `probe-change.sh` not run — same reason as D1; one `package.json` script and one `.gitignore` line, no TS or API shape. Run instead: § Probes P1 (compile → ELF), P2. Patch kept: SA scratch `spec127-back.patch` (21 lines).

Consumers (probe): scratch run of the change (P1) → 0 errors; `git grep -n 'run build\|"build"\|dist/'` → 0 hits (2026-10-31)

- Entry = `src/index.ts` — it is the file that calls `Bun.serve` (`src/index.ts:14`), with `HOST` (default `127.0.0.1`), `PORT` (default 4200) and `DATABASE_URL` (required, `:5-9`) from the environment already ⇒ no code change.
- **Artifact:** `dist/blueprint-back` (one ELF x86-64 file). **Server start command:** `./blueprint-back` with `PORT`, `HOST`, `DATABASE_URL` (a Postgres URL — D3) from the environment / the `.env` in its working directory.

## D3 — What `--compile` cannot carry (REQ-127 item 3) — result table

| Item | Where | In the binary? | Production needs it? | Decision |
|---|---|---|---|---|
| PGlite WASM / data files | `src/db/client.ts:1,17` | **No — proved** (P2: `ENOENT … open 'B:\~BUN\root\pglite.data'`, crash at start) | **No.** Production's `DATABASE_URL` is a Postgres URL; only `pglite:memory` builds a PGlite (`client.ts:13-21`) | Not shipped. **The binary needs a Postgres `DATABASE_URL`.** `pglite:memory` stays for source runs (`bun run dev`, `bun test`) |
| Drizzle migrations folder | `client.ts:11,18`; `src/scripts/migrate.ts:8` | No (read from disk by the migrator at run time) | No. Read only on the `pglite:memory` path; a real database is migrated by the operator himself (`client.ts:14`) with `bun run db:migrate` from source | Not shipped. How the owner migrates his server DB is deployment side — off-limits (23:31) |
| `sources/link.ts` pglite-only branch | `src/sources/link.ts:94-100` | n/a | No — ignored with any real database | none |
| File parsers (`unpdf`, `mammoth`, `exceljs`, `file-type`) | source upload | Bundled as JS (P1: 1098 modules); a PDF parsed inside a compiled binary (P6, Windows target) — Linux binary UNVERIFIED | Yes — source upload | TASK-173 DoD 7: one upload through the binary on Linux; not runnable ⇒ `UNVERIFIED` |

## Probes (2026-10-31, scratch clones, this Windows box, bun 1.3.14 / node 22.23.2)

- **P1** back, Linux target: `bun build src/index.ts --compile --minify --target=bun-linux-x64 --outfile <scratch>/blueprint-back` → `bundle 1098 modules`, `compile … bun-linux-x64-v1.3.14`; `file` → `ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 3.2.0`.
- **P2** back, a Windows-target binary from the same source, `DATABASE_URL=pglite:memory PORT=4291` → crash at start, `ENOENT: no such file or directory, open 'B:\~BUN\root\pglite.data'`; `curl /v1/projects` → `000`. (Windows binary: the Linux one cannot run here. The failure is in PGlite's own file loading, not OS paths — `inferred` for Linux; settled by TASK-173 DoD 6 on Linux.)
- **P3** `bun install --frozen-lockfile` → `error: lockfile had changes, but lockfile is frozen` in **both** repos; plain `bun install` → ` M bun.lock` (both). `bun install --no-save` (back) → 227 packages, `git status --short` empty. ⇒ R2.
- **P6** back, after the owner placed `blueprint-back/.env` (Postgres URL + `PORT`; SYSTEM-FACTS 18:0x), 18:06–18:07: a **Windows-target** compile of the owner's tree (`bun build src/index.ts --compile --minify` → SA scratch), run with cwd = the checkout so it loads that `.env`, `PORT=4295` and `SOURCES_DIR=<scratch>` overriding: `GET /v1/projects` → 200 (5 projects) · `POST /v1/projects` (`x-blueprint-by: Sober`, name "SA probe REQ-127 compiled binary (safe to delete)") → 201 `e38bc9e5-f4a8-444a-b3b0-8e1efeb23e1d` · `POST …/sources` multipart `test/fixtures/sources/rooms.pdf` → 201, `status: "read"` · `GET …/sources/83123a6e-…` → 200, the PDF's Thai text (280 chars). ⇒ in a compiled binary the Postgres path, the static PGlite import and `unpdf` all work; the stored file went to scratch, the repo stayed ` M .gitignore` ` M package.json`. Stopped by port (pid 24464). **Still UNVERIFIED: the Linux binary itself** (no Linux here) — P6 proves the code paths under `--compile`, not the `bun-linux-x64` runtime. One probe project + one source stay in the TEST DB.
- **P4** front: base `bun run build` → exit 0, `.next/standalone` absent. With D1 applied (patch keeps the file's CRLF): `bun run build` → exit 0, `[postbuild] copied .next/static into .next/standalone`; `.next/standalone/server.js` and `.next/standalone/.next/static/` exist. `PORT=4391 HOSTNAME=127.0.0.1 node .next/standalone/server.js` → `/` 200 · `/_next/static/chunks/061_6pbo_e1nh.css` 200 · `/dev/isolation/none` (BLUEPRINT_DEV_PAGES=1) 200. **`next start -p 4392` on the same build → the same three 200s**, with one warning line `⚠ "next start" does not work with "output: standalone" configuration…` ⇒ the two consumers (`playwright.config.ts:21`, `check-required.ts:193`) keep working unchanged `[SA-decided]`. Both servers stopped by port (pids 27176, 27416), 17:06.

## Linux / AC-4

This box has **no Linux** (`wsl.exe -l -v` prints the WSL usage text — no distribution installed) and **no `blueprint-back/.env`** (no Postgres TEST URL here). So on this box AC-4 (the binary on Linux answering a DB route) and TASK-173 DoD 6–7 cannot run ⇒ `UNVERIFIED`, and the PM decides (REQ-127 AC-4). Atom's box is Linux and has `blueprint-back/.env` (SYSTEM-FACTS 2026-10-29 12:54), but its checkout is `atom`, not the `nichaphon` tree the owner chose. ⇒ After Q1, **AC-4 is `UNVERIFIED` on this box; the PM decides** (REQ-127 AC-4) — e.g. the owner's first server run, or a Linux run he provides. TASK-173 still carries DoD 6–7 so whoever has Linux can run them as written.

## Risks / assumptions

- **R1** Binary + `pglite:memory` crashes with a long minified stack, not a one-line message (P2). Asked as Q2 (default: no code change).
- **R2** `bun install` on bun 1.3.14 rewrites `bun.lock` (P3) — a later `ขึ้น git` would sweep it in. Both TASKs install with `bun install --no-save`; `bun.lock` is on neither closed list. `[SA-decided]` — reversible.
- **R2 follow-up (18:13):** cause found — the committed `bun.lock` is `"lockfileVersion": 2` (a newer bun); bun 1.3.14 here prints `Unknown lockfile version … Ignoring lockfile` and resolves from scratch, so any plain install writes it back as v1. The owner ran plain `bun install` in both repos at ~18:10 (PM 18:12) → both ` M bun.lock`. `[SA-decided]` restored both to HEAD's working-tree form by `cp` (no git write; backups in SA scratch); trees back to the closed lists. Don't commit a v1 rewrite.
- **R6 (18:13):** because the lock is ignored here, `node_modules` on this box are **re-resolved, not the locked versions** — the build this desk proves may use newer patch versions than the owner's own build with his bun. Settles when the owner builds with his bun (it reads v2). Not changed by REQ-127.
- **R3** The Linux binary was built on Windows (cross-compile). P1 shows a correct ELF; that it *runs* is only known from DoD 6 on Linux.
- **R4** The front build fetches Google fonts at build time (TEST-120 DEF-1, back since REQ-123's removal) — the build needs the internet, as before. Not changed here.

- **R5 (pre-existing, found 17:08, not REQ-127's):** on this Windows box the **base** back cannot start with `DATABASE_URL=pglite:memory`: `bun run dev` → `error: Can't find meta/_journal.json file` at `src/db/client.ts:18` (scratch clone 08e1e4d). `inferred — new URL("./migrations", import.meta.url).pathname` gives a `/C:/…` path on Windows (`client.ts:11`; same form in `scripts/migrate.ts:8`); settles with one `fileURLToPath` probe. The base `bun test` here gives 0 pass / 14 fail in its first four files (10 of them this error), then no output for 17 min (stopped by pid 17:24). So "dev / tests as before" (AC-5) on this box means "the same failures as before" (TASK-173 DoD 8), and the suite's green state is UNVERIFIED on Windows. Raised to the PM as Q3 — a fix is app code, outside this REQ.

## Tasks

- TASK-172: blueprint-front — standalone output + static copy in `build` — owner: FE Fern (depends on: none — Q1 answered 17:0x; base 6a64527 on `nichaphon`)
- TASK-173: blueprint-back — `build` compiles one Linux binary; prove what it carries — owner: BE Jason (depends on: none — Q1 answered 17:0x; base 08e1e4d on `nichaphon`)

## Questions

- Q2 (SA → PM, 2026-10-31): the compiled back cannot run `DATABASE_URL=pglite:memory` — it crashes at start with a long minified stack (P2, R1). `Checked: DECISIONS 16:5x (1) "build configuration only" · SYSTEM-FACTS § deploy build shape — not covered: neither says what the binary does with pglite:memory.` **I will do: no app code change — the SPEC and TASK-173 state that the binary needs a Postgres URL.** Cases: owner runs the binary with a Postgres URL → works (to prove in DoD 6) · with `pglite:memory` → crash, as today in P2 · alternative if you want it: one guard in `src/index.ts` printing one line `the binary needs a Postgres DATABASE_URL` and exiting 1 (app code, outside "build config only"). Correct only the line that is wrong. **Not blocking** — the TASKs are cut on the default.
  > answer (PM, 2026-10-31 17:2x): default accepted — no app code change; the binary needs a Postgres URL. (DECISIONS 17:2x)
- Q3 (SA → PM, 2026-10-31): R5 — on the owner's Windows box blueprint-back's own `pglite:memory` (dev and the tests that use it) fails at start, before and after REQ-127. `Checked: DECISIONS — nothing on running Blueprint on Windows; SYSTEM-FACTS 2026-10-29 14:20 says only pglite:memory is accepted locally.` **I will do: nothing in REQ-127** — TASK-173 records it as the base. If you want it fixed, it is a separate small REQ (Team A, `src/db/client.ts:11` + `src/scripts/migrate.ts:8`, a path fix, tests on Windows). **Not blocking.**
  > answer (PM, 2026-10-31 17:2x): no REQ now — recorded as the base. AC-4 UNVERIFIED accepted; it settles on the owner's first server run. (DECISIONS 17:2x)
