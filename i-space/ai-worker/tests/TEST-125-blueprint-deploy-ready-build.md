# TEST-125: Blueprint front + back build the way the owner deploys
- Source REQ: REQ-127 (SPEC-127, TASK-172, TASK-173)
- Status: TEST_PASSED — AC-1/2/3/5 PASS; AC-4 NOT_TESTED (no Linux here — the AC's own UNVERIFIED path, PM-accepted 17:2x)
- Environment: local — the owner's Windows box, his checkouts on branch `nichaphon` (paths: `machine.local.md`); bun 1.3.14, node 22.23.2
- Tested: 2026-10-31 18:22–18:35 by Tanya
- Build under test (`tools/tree-fp.sh` by path — see O-1), at start and at the verdict, identical:
  - `tree-fp H:/ispace/blueprint-front HEAD 6a64527 fp 219729729f1a (306 paths: 305 tracked, 1 untracked, 0 deleted)` — `git status`: ` M .gitignore` ` M next.config.ts` ` M package.json` `?? scripts/copy-standalone-assets.mjs`
  - `tree-fp H:/ispace/blueprint-back HEAD 08e1e4d fp c460898d350b (157 paths: 157 tracked, 0 untracked, 0 deleted)` — `git status`: ` M .gitignore` ` M package.json`

## Scope

Team A's build-config change only: front `next.config.ts` `output: "standalone"`, `build` + copy script, `.gitignore *.zip`; back `build` (`--compile --target=bun-linux-x64`), `.gitignore *.zip`. Diffs read at start = SPEC-127 D1/D2; copy script `cmp` = the skill's reference (SAME).
"REQ-108 AC-4 smoke" (AC-5, PM's inbox line): REQ-108 AC-4 is a CAW-built product; the CAW repos are not on this box. `Interpreted` it as **Blueprint's own working setup end to end**: back from source on the owner's `.env` (TEST DB) + the new standalone front pointed at it, real data on screen.

## Cases

| # | Case (from AC) | Type | Steps | Expected | Actual | Result |
|---|---|---|---|---|---|---|
| 1 | AC-1 fresh front build | happy | moved the existing `.next` aside (to my scratch), `bun run build` 18:22:51→18:23:18 | exit 0; `.next/standalone/server.js`, `.next/standalone/.next/static/` | exit 0, `[postbuild] copied .next/static into .next/standalone`; both exist (`static/` = build id, `chunks`, `media`) — `harness/test-125-build/qa125-front-build.log` | PASS |
| 2 | AC-2 standalone server | happy | `PORT=4721 HOSTNAME=127.0.0.1 BLUEPRINT_API_URL=http://127.0.0.1:4720 node server.js` (cwd `.next/standalone`) | `/` 200, a static file 200, styled page | `/` 200 · `/_next/static/chunks/0s0d2aktaghw9.css` 200 `text/css` · `/_next/static/chunks/1gmgl1eoqr37p.js` 200 `application/javascript`; browser: styled home with 6 real project cards (`ac2-home-standalone-4721.jpg`) | PASS |
| 3 | AC-2 negative | negative | `/_next/static/chunks/nope-qa.css` | 404 | 404 | PASS |
| 4 | AC-3 fresh back build | happy | moved `dist/` aside, `bun run build`; `file dist/blueprint-back` | exit 0, ELF 64-bit x86-64 | exit 0, `bundle 1098 modules`, `compile dist/blueprint-back bun-linux-x64-v1.3.14`; `ELF 64-bit LSB executable, x86-64 … GNU/Linux 3.2.0` (`qa125-back-build.log`) | PASS |
| 5 | AC-4 Linux binary on a DB route | happy | `wsl.exe -l -v` 18:2x | a Linux to run it | prints WSL usage text — no distribution; no Linux on this box | NOT_TESTED — settles on the owner's first server run (PM 17:2x; SA probe P6 is partial proof on a Windows-target binary, not re-run by QA) |
| 6 | AC-5 front typecheck + tests | regression | `bun run typecheck`; `bun test src` | exit 0; 238/0 (base) | exit 0; 238 pass, 0 fail | PASS |
| 7 | AC-5 front `dev` | regression | `NEXT_DIST_DIR=.next-q bun run dev` (see F-063) | `/` 200 on 3100 | 200 (9.2 s first compile) | PASS |
| 8 | AC-5 front `start` / playwright consumer | regression | `next start -p 4722` on the standalone build | `/` 200 | 200, with the expected `⚠ "next start" does not work with "output: standalone"` line | PASS |
| 9 | AC-5 back `bun test` as before | regression | `DATABASE_URL=pglite:memory timeout 300 bun test`; sorted `(fail)` names vs `harness/task-173-bun-test.out` | same failures as the base | 229 lines, 0 pass, 14 fail, then silent → timeout (124); `diff` of the 14 names: IDENTICAL (`qa125-back-test.out`). Suite green state stays UNVERIFIED on Windows (SPEC-127 R5) | PASS (as before) |
| 10 | AC-5 back `dev` from source | regression | `PORT=4720 SOURCES_DIR=<scratch> bun run src/index.ts` (owner's `.env`) | serves | `GET /v1/projects` 200 (real TEST-DB rows) | PASS |
| 11 | AC-5 no build output in git | regression | `git status --short` after both builds | only the closed-list paths | front 4 paths, back 2; `.next/`, `dist/` ignored; no `bun.lock` | PASS |
| 12 | Smoke (interpreted, see Scope) | happy | standalone front :4721 → back :4720; open "myChannel 2.0" | project overview renders from the DB | overview with parts counts (หน้าจอ 11, API 7 …), styled (`smoke-project-overview-4721.jpg`) | PASS |

Lint: no `lint` script in either repo — nothing to run.

## Defects

None.

## Observations (not ours)

- **O-1** `tools/tree-fp.sh blueprint-front` (by logical name) → *"has no existing path in machine.local.md"* although the row is there: the script does not resolve this box's `H:\…` Windows paths. By path it works. Desk tool, not REQ-127.
- **O-2** The back binary is 99 MB (bun runtime inside) — normal for `--compile`; noted for the owner's carry to the server.

## Test data created

| What | Where | End state |
|---|---|---|
| Fresh `.next/` (replaces Fern's; hers moved to my scratch `prev-build/front-next`) | blueprint-front, git-ignored | kept — same config, the build the owner would make |
| Fresh `dist/blueprint-back` (old one moved to scratch `prev-build/back-dist`) | blueprint-back, git-ignored | kept |
| `.next-q/` (dev output) | blueprint-front | removed |
| `tsconfig.json` rewritten by `next dev` (2 include lines + LF) — **F-063** | blueprint-front, tracked | restored by hand: lines removed, CRLF back; tree-fp = start value 219729729f1a |
| TEST DB | remote TEST Postgres | **read only** — GET projects, home + one overview page; nothing written |
| Servers :4720 :4721 :4722 :3100 | local | all stopped by port 18:3x; no `bun.exe` left |
| Evidence | `tests/harness/test-125-build/` (2 screenshots, 3 logs) | kept |

## Verdict

`TEST_PASSED` — fresh builds of both repos produce the owner's artifacts (standalone server serving styled pages + static; Linux ELF), and local use is unchanged (front 238/0, typecheck 0, dev/start 200; back the same 14 Windows failures as its base). **NOT_TESTED: AC-4** (the binary on Linux on a DB route) — no Linux here; the PM accepted the UNVERIFIED path; it settles on the owner's first server run.

Decisive evidence:
1. `harness/test-125-build/ac2-home-standalone-4721.jpg` — the standalone server alone serves the styled home with real data.
2. `qa125-back-build.log` + `file` line in case 4 — the back build is a Linux x86-64 ELF.
3. `qa125-back-test.out` vs `task-173-bun-test.out`, 14 = 14 — the back's tests are exactly as before.

## Questions

None blocking. Smoke interpretation (Scope) is mine `[QA-interpreted]` — if the PM meant the CAW-built product of REQ-108, that needs the CAW repos on this box.
