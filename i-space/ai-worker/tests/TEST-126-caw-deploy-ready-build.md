# TEST-126: CAW front + back build the way the owner deploys
- Source REQ: REQ-128 (SPEC-128, TASK-174, TASK-175)
- Status: TEST_PASSED — AC-1/2/3/5 PASS; AC-4 Linux NOT_TESTED (accepted in the AC), Windows-target partial proof PASS
- Environment: local — the owner's Windows box, his checkouts on branch `nichaphon` (paths: `machine.local.md`); bun 1.3.14, node 22.23.2
- Tested: 2026-10-31 18:56–19:02 by Tanya
- Build under test (`tools/tree-fp.sh` by path — TEST-125 O-1), at start and at the verdict, identical, = the PM's inbox line:
  - `tree-fp H:/ispace/caw-front HEAD e7a36eb fp 2b90fa70abef (147 paths: 146 tracked, 1 untracked, 0 deleted)` — ` M .gitignore` ` M next.config.ts` ` M package.json` `?? scripts/`
  - `tree-fp H:/ispace/caw-back HEAD 8271082 fp adeeea17e327 (256 paths: 256 tracked, 0 untracked, 0 deleted)` — ` M .gitignore` ` M package.json`

## Scope

Team B's build-config change only, diffs read at start = SPEC-128 D1/D2: front `output: "standalone"`, `build` + copy script (`cmp` = the skill's reference: SAME), `.gitignore *.zip`; back `build` compiling `src/index.ts` (the API only — runner stays source, DECISIONS 18:4x), `.gitignore *.zip`. The runner was **never started** (no live workers, no Claude CLI).

## Cases

| # | Case (from AC) | Type | Steps | Expected | Actual | Result |
|---|---|---|---|---|---|---|
| 1 | AC-1 fresh front build, default distDir | happy | no `.next` existed; `bun run build` 18:57:53 | exit 0; `.next/standalone/server.js` + `.next/standalone/.next/static/` | exit 0, `[postbuild] copied .next/static into .next/standalone`; both exist (`qa126-front-build.log`) | PASS |
| 2 | AC-2 standalone server | happy | API from source `PORT=4730 CAW_POLL_MS=0 bun run src/index.ts` (owner's `.env`); `PORT=4731 HOSTNAME=127.0.0.1 CAW_API_URL=http://127.0.0.1:4730 node server.js` | `/` 200, a static file 200, styled | `/` 200 · `chunks/2oraxoj-x1o5_.css` 200 `text/css` · `chunks/07nldpx3i6mc_.js` 200 `application/javascript`; browser: styled dark home with the TEST-DB project card (`ac2-home-standalone-4731.jpg`) | PASS |
| 3 | AC-2 negative | negative | `/_next/static/chunks/nope-qa.css` | 404 | 404 | PASS |
| 4 | Smoke: a real page through the standalone front | happy | open "myChannel 2.0" | project page from the API | renders team, chat, banners "team not running — `cd caw-back && bun run runner`" and Blueprint unreachable — both expected (no runner, no Blueprint up; SPEC-128 R4) (`smoke-project-page-4731.jpg`) | PASS |
| 5 | AC-3 fresh back build | happy | moved old `dist/` to my scratch; `bun run build`; `file dist/caw-back` | exit 0, ELF x86-64 | exit 0, `bundle 300 modules`, `compile dist/caw-back bun-linux-x64-v1.3.14`; `ELF 64-bit LSB executable, x86-64 … GNU/Linux 3.2.0` | PASS |
| 6 | AC-4 partial: compiled API on the owner's `.env` | happy | Windows-target compile of the same tree → my scratch; run with cwd = caw-back (loads `.env`), `PORT=4732 CAW_POLL_MS=0` | `/health` 200, a DB route 200 | `caw-back API on http://127.0.0.1:4732`; `/health` 200; `/v1/projects` (`X-CAW-Actor: sa`) 200 with TEST-DB rows. Read only | PASS (partial, as the AC asks) |
| 7 | AC-4 the Linux binary | happy | — | — | no Linux on this box (TEST-125 case 5) | NOT_TESTED — accepted in the AC; settles on the owner's first server run |
| 8 | AC-5 front typecheck + tests | regression | `bun run typecheck`; `bun test src` | exit 0; 370/0 (base) | exit 0; 370 pass, 0 fail | PASS |
| 9 | AC-5 back typecheck + tests vs a base QA recorded | regression | base: scratch `git clone` of HEAD 8271082 (no change), `bun install --no-save`; both: `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT bun --no-env-file test`; sorted `(fail)` names diffed | same as base | base 280 pass · 1 skip · 151 fail · 42 errors / 432; after: the same numbers; 109 distinct fail names, `diff` IDENTICAL (`qa126-back-base.out`, `qa126-back-test.out`); `tsc --noEmit` exit 0. Suite green state UNVERIFIED on Windows (SPEC-128 R5) | PASS (as before) |
| 10 | AC-5 front `bun run dev` | regression | `bun run dev` | as before | exit 1, `'${PORT:-3500}' is not a non-negative number` — the `dev` line is unchanged by the diff, so this is the base on Windows (`qa126-bundev.log`) | PASS (as before) — see O-1 |
| 11 | AC-5 front `next dev` with the new config | regression | `CAW_API=mock NEXT_DIST_DIR=.next-f-dev npx next dev -p 4734` (a name `tsconfig.json` already lists — F-063 lesson) | `/` 200, tree unchanged | 200; tree-fp unchanged | PASS |
| 12 | AC-5 `start` / playwright consumer | regression | `CAW_API=mock npx next start -p 4733` on the build | `/` 200 | 200 + the expected `⚠ "next start" does not work with "output: standalone"` line | PASS |
| 13 | AC-5 no build output / no lock in git | regression | `git status --short` after all runs | closed lists only | front 4 entries, back 2; no `.next`, `dist`, `bun.lock` | PASS |
| — | Back `dev` (`src/dev.ts`) | — | not run | — | it starts the runner = real workers (SYSTEM-FACTS 12:54); source untouched by the diff | NOT_TESTED — by rule |

## Defects

None.

## Observations (not ours)

- **O-1** caw-front `bun run dev` / `start` scripts use `${PORT:-3500}`, which does not expand on this Windows box (bun's script shell) — pre-existing, script unchanged by REQ-128. Fine on Linux/macOS shells (`inferred`).
- **O-2** A `bun.exe install` (pid 24092) was running at 19:01 that is not mine (my scratch install had exited 0). Left alone.
- **O-3** Deploying `dist/caw-back` alone gives a CAW with no workers — the project page says so (case 4). As SPEC-128 R4 / Q1: the runner runs from source beside it.

## Test data created

| What | Where | End state |
|---|---|---|
| Fresh `.next/` (default distDir; none existed before) | caw-front, git-ignored | kept — the owner's artifact |
| Fresh `dist/caw-back` (old one moved to my scratch `prev-build-caw/back-dist`) | caw-back, git-ignored | kept |
| `.next-f-dev/` (my dev output) | caw-front | removed |
| Windows binary, base clone | my scratchpad | scratch only |
| TEST DB | remote TEST Postgres | **read only** — GET health/projects, home and one project page; nothing written; runner never started |
| Servers :4730–:4734 | local | all stopped by port 19:01 |
| Evidence | `tests/harness/test-126-build/` (2 screenshots, 5 logs) | kept |

## Verdict

`TEST_PASSED` — both CAW repos produce the owner's artifacts from one `bun run build` (standalone front serving styled pages + static; API as a Linux ELF), the compiled API reads the TEST DB (Windows-target), and local use is exactly as before (front 370/0, tsc 0; back failures name-for-name = a base QA recorded). **NOT_TESTED: AC-4 on Linux** (accepted in the AC) and back `dev` (would start real workers).

Decisive evidence:
1. `harness/test-126-build/ac2-home-standalone-4731.jpg` — the standalone server alone serves the styled CAW home with real data.
2. Case 5's `file` line — `dist/caw-back` is a Linux x86-64 ELF.
3. `qa126-back-base.out` vs `qa126-back-test.out` — 109 = 109 fail names, identical: the change broke nothing in the back.

## Questions

None.
