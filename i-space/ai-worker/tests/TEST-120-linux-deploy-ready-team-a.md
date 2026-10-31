# TEST-120: Linux deploy-ready — Team A side (blueprint-back, blueprint-front), followed from the READMEs on a clean clone
- Source REQ: REQ-123 (Team A: SPEC-121, TASK-155 back, TASK-156 front). Team B's side, the pm2 steps, AC-2, AC-3, AC-6 and the Blueprint → CAW part of AC-1 wait (DECISIONS 2026-10-30 20:2x; pm2 held by the owner's 19:28 order).
- Status: **round 2 TEST_FAILED (AC-10, DEF-2 MINOR) — AC-9 PASS, DEF-1 fixed** (2026-10-30 21:58, Tanya; § Round 2) · round 1: **TEST_PASSED — Team A side** (2026-10-30 20:43, Tanya) — DEF-1 MINOR; DATA REQUEST (R1); Team B / pm2 parts wait
- Environment: local (this machine), a clean clone in QA scratch, ports 4271 / 3171 (trial) and 4200 / 3100 (working-shape check) · stub gateway (refusing, :4396, 0 calls) · no CAW hop
- Tested: 2026-10-30 by Tanya · harness `tests/harness/test-123/` (named after the REQ; the TEST number came from `new-id.mjs`)
- Build under test (`bash ai-worker/tools/tree-fp.sh`, at the start 20:30 — the same as the PM's line; the clean clone + overlay gives the same values):
  - `tree-fp blueprint-back HEAD 6123018 fp fa2163a9aafd (160 paths: 157 tracked, 3 untracked, 0 deleted)`
  - `tree-fp blueprint-front HEAD 6692a16 fp af68a69a5652 (309 paths: 305 tracked, 4 untracked, 0 deleted)`

## Scope
REQ-123 for Team A only: AC-1 (Team A part, without pm2 and without CAW), AC-4 (Team A lines), AC-5 (Team A repos), AC-7, AC-8 (Team A suites + REQ-108 AC-4 on a working-shape setup), Q2 (PDF through the LAN address, as an observation).

## Instruments and their limits
- **Clean clone:** `git clone -b atom` of each repo (committed HEAD) into a new empty folder, then the uncommitted tree under test laid over it (diff + 3/4 untracked files) — `tree-fp.sh` on the clone = the PM's fps. No file copied from the working repos (no `.env`, no `node_modules`). Every command and its output: `cmdlog.txt`.
- **README only:** prerequisites (each check command run), install, config (`cp .env.example …` then QA's own values: `pglite:memory`, the refusing gateway, ports 4271 / 3171), build, start with the README's non-pm2 command (`bun run start`), "Check it is up".
- **Not used:** pm2 (held by the owner's order; `pm2: command not found` here, as SA A noted), any real database (the working TEST DB was not touched — see AC-8 / R1).

## Cases

| # | AC | Type | Actual (`cmdlog.txt`, files in `tests/harness/test-123/`) | Result |
|---|---|---|---|---|
| 1 | AC-1 (A, no pm2) | happy | blueprint-back README on the clean clone: `bun --version` 1.4.2, `psql --version` 17.11, `pm2 --version` → not found (held); `bun install --frozen-lockfile` 227 packages; `cp .env.example .env` + QA's values; `bun run start` → **"Check it is up" answers `{"ok":true,"service":"blueprint-back"}`** on 4271 | PASS |
| 2 | AC-1 (A, no pm2) | happy | blueprint-front README: bun, node 24.22.1, google-chrome 156 checked; install 219 packages; `cp .env.example .env.local` + PORT / BLUEPRINT_API_URL; build (see #3); `bun run start` → **200** on 3171; a project made on this back shows on this front (name + requirement text) | PASS |
| 3 | AC-7 | happy | `bun run build` on the clean clone: **exit 1 twice** (`Module not found: Can't resolve '@vercel/turbopack-next/internal/font/google/font'` — the Google font fetch at build), **exit 0 only after QA deleted `.next`** (a step the README does not give) → **DEF-1**; the built app then serves `/` 200. blueprint-back has no build (README: Bun runs TS) | PASS (DEF-1) |
| 4 | AC-4 | negative | blueprint-back, one start per case (`--no-env-file`, explicit env): no `DATABASE_URL` · `mysql://x` · `PORT=abc` · postgres on 127.0.0.1:1 · port 4271 in use → each **first stderr line** = the README's line word for word ("blueprint-back: missing required setting DATABASE_URL — see README § Configuration", "… wrong setting DATABASE_URL (not pglite:memory or a postgres:// URL) …", "… wrong setting PORT ("abc" is not a port number) …", "… (cannot reach the database, code ECONNREFUSED) …", "… cannot listen on 127.0.0.1:4271 (EADDRINUSE) …"), **exit 1 in 0.24 s** (port in use 1.9 s); no value of `DATABASE_URL` in any line (`ac4.txt`) | PASS |
| 5 | AC-4 | negative | blueprint-front: `PORT=abc` · port 3171 in use · port 80 (no root) → "blueprint-front: wrong setting PORT ("abc" is not a port number) …", "… port 3171 is in use …", "… cannot listen on port 80 (EACCES) …", **exit 1 within 50 ms** | PASS |
| 6 | AC-4 | — | "database is not migrated — run bun run db:migrate": **NOT_TESTED** — no local Postgres on this box and QA does not touch the TEST DB; SA A re-ran it (TASK-155 § Review). Settles with: a QA-owned Postgres, or the owner's word | NOT_TESTED |
| 7 | AC-5 | static | Team A product code (`src/`, `scripts/`; tests and mocks out): no `/Users/`, `/opt/homebrew`, darwin-only command, `/Library/`; the 4 host literals are env-backed defaults (`GATEWAY_URL`, `BLUEPRINT_API_URL`, `CAW_URL`) or an example inside the AI prompt text; **every `process.env` name the code reads is in its `.env.example`** (back 8, front 10) (`ac5.txt`) | PASS |
| 8 | AC-8 | suites | from the clean clone: blueprint-back **340 / 16 skip / 0** · blueprint-front `check:api` matches, typecheck 0, `bun test src scripts` **246 / 0** (`bp-back-test.txt`, `bp-front-suite.txt`) | PASS |
| 9 | AC-8 | regression | REQ-108 AC-4 on a working-shape setup: this Blueprint (clean clone, pglite) on 4200 / 3100 + CAW (phase 3's committed export) on 4500 / 3500, the phase-3 dashboard on :3900 → 4 services ทำงาน; QA's caw-web stopped → "CAW เว็บ · ไม่ตอบ" **in 6.9 s** (`working/`) | PASS |
| 10 | AC-8 / R1 | — | whether the **real TEST DB** is migrated (else blueprint-back now refuses to start there): **NOT_TESTED** — QA never starts a service against it → **DATA REQUEST** below | NOT_TESTED |
| 11 | Q2 | observe | PDF export through the LAN address `http://172.30.0.2:3171/p/…/export/pdf` → **200, a real PDF** (`%PDF-1.4`, project name and requirement in its text), front log `allowed=41 aborted=0` — the same as through 127.0.0.1. SA A's concern did not show on this box | — |

## Defects
### DEF-1 — a fresh clone's first production build failed on the font fetch, and later builds kept failing until `.next` was deleted — a step the README does not give — MINOR
- Environment: blueprint-front clean clone (6692a16 + TASK-156), this box, `fonts.googleapis.com` reachable (200).
- Repro, as it happened: `bun install --frozen-lockfile` → `bun run build` → exit 1, 16 errors `Module not found: Can't resolve '@vercel/turbopack-next/internal/font/google/font'` (`front-build-1.txt`) → `bun run build` again → the same → `rm -r .next && bun run build` → exit 0 (`front-build-2.txt`).
- Expected (REQ-123 req 1, 7; AC-1 "every step QA had to guess or fix is a defect"): the README's build step works, or the README says what the build needs (network to Google Fonts at build time) and how to recover from a failed build.
- Not proven which of the two caused the second failure (a still-failing download, or the failed `.next` left behind); the same symptom happened once before on this box (TEST-112) and cleared the same way. On an owner's server with a flaky or closed outbound network, the documented "Update" steps (pull → install → build) would stop here with no hint.

## Questions
- **DATA REQUEST (QA → PM → owner):** is the working TEST DB migrated to blueprint-back's latest migration? (SA A's R1: after TASK-155, blueprint-back refuses to start on a database that is behind, with "database is not migrated — run bun run db:migrate".) QA does not connect to it; the owner (or the SA on his word) can run `bun run db:migrate` there, or tell QA it is done.

## Test data created
| What | Where | End state |
|---|---|---|
| clean clones of blueprint-back / blueprint-front, their `.env` / `.env.local` (pglite, no secret) | QA scratch `t123/` | left in scratch; no repo touched |
| 1 Blueprint project ("TEST-123 clean clone") + the working-shape run's | `pglite:memory` | gone: stopped |
| CAW (working-shape check) | `pglite:file` in `test-123/caw-db` (QA's slip: inside the workspace) | deleted 20:4x (QA's own throw-away data) |
| servers 4271 / 3171 / 4200 / 3100 / 4500 / 3500 / 3900 / 4396 | this machine | stopped; `ss` clear 20:43 |

## Verdict
**`TEST_PASSED` (Team A side)** — on a clean clone followed from the READMEs alone: the back and the front install, configure, start and answer their health checks (AC-1 A part, no pm2); every documented start-up error line appears first, word for word, with exit 1 (AC-4, 8 of 9 lines; "not migrated" NOT_TESTED); no Mac path or hard-coded host, every variable in `.env.example` (AC-5); the production build works and serves (AC-7, after DEF-1's guessed step); suites and REQ-108 AC-4 hold (AC-8). **DEF-1 MINOR** (build failure needs an undocumented `.next` delete) for the PM. NOT_TESTED: the "not migrated" line, R1 on the real TEST DB (DATA REQUEST), and everything waiting for Team B / pm2. Q2: PDF via LAN works here. **Tested trees for git (tree-fp.sh, same 20:30 and 20:43):** blueprint-back **6123018 fp `fa2163a9aafd`** · blueprint-front **6692a16 fp `af68a69a5652`**.

## Round 2 — REQ-123 req 9, AC-9, AC-10 (DEF-1), 2026-10-30 21:4x–21:58, Tanya
- Build under test (`bash ai-worker/tools/tree-fp.sh`, start 21:43 and verdict 21:58 — **the same**, and the same as the PM's line): `tree-fp blueprint-front HEAD 3096bca fp 7977f1cccca9 (317 paths: 309 tracked, 8 untracked, 0 deleted)` — round 1 committed (3096bca) + TASK-161 (3 font files changed, 4 woff2 + 4 OFL files added). blueprint-back: `861e35a fp fa2163a9aafd` (round 1 committed, unchanged).
- Instruments: 3 fresh `git clone -b atom` + the TASK-161 overlay (tree-fp of each clone = `7977f1cccca9`), README install (`bun install --frozen-lockfile`, `.env.local`), README build. **Offline builds** run in a network namespace (`unshare -rn`, loopback brought up, outside network gone: a probe to fonts.gstatic.com answers 000) — the build cannot fetch anything. Commands: `r2/cmdlog.txt`; logs `r2/build-*.txt`.
- Instrument slips of mine (no verdict on them): the first offline try left loopback DOWN, so Turbopack (local sockets) hung — stopped after ~10 min; a 9 s kill came after a cached rebuild had already finished (exit 0, not a stop) — redone at 2 s.

| # | AC | Type | Actual | Result |
|---|---|---|---|---|
| R2-1 | **AC-9** | happy | clone 1, README build **with** network → exit 0 in 22 s; clone 3, fresh, **offline** → exit 0 in 20 s; the built app serves `/` 200 | PASS |
| R2-2 | **AC-9** | state | clone 2: a build stopped half way (QA's hung namespace, killed after ~10 min, `.next` left) → the next README build, offline, nothing deleted → **exit 0 in 22 s** | PASS |
| R2-3 | **AC-9** | state | clone 3: a build **SIGKILLed at 2 s** (exit 137, during "Running TypeScript") → the next README build, offline, nothing deleted → **exit 0 in 5 s** | PASS |
| R2-4 | AC-9 | — | no step outside the README in any of the 5 builds; no Google-font line in any build log; `.next` never deleted by QA — **TEST-120 DEF-1 fixed** | PASS |
| R2-5 | **AC-10** | painted | the same page (`/p/{id}/requirements`, one project per theme) on the round-1 build (Google fonts fetched at build) vs the round-2 build (fonts in the repo), Chrome 1280 px: **luxury-gold identical**; **minimal-mono** 1–2 px width shifts in the header ("โปรเจกต์ทั้งหมด", "แชต"); **clean-blue: the "✓" button now shows "√"** — the same character U+2713, drawn from the theme font both times (`Anuphan` → `cleanBlueFont`), a different glyph (3× zoom: `ac10-zoom-check-before.png` / `-after.png`) → **DEF-2** (`ac10-*.png`, `ac10.json`) | **FAIL** |
| R2-6 | AC-10 | static | before: static per-weight files (e.g. Anuphan 400/500/600/700); after: one variable file per family over the same range (400–700 / 400–800; serif 500–700 + sans 400–600) — the families and ranges are kept, as SPEC-122 says | — |
| R2-7 | AC-10 | suites | blueprint-front on a round-2 clone: typecheck 0, `bun test src scripts` **246 / 0**, `check:api` matches (pointed at blueprint-back's openapi.json — the clone has no sibling folder); blueprint-back unchanged since round 1 (340 / 16 / 0) | PASS |

### DEF-2 — after the switch to local font files, clean-blue's "✓" button shows a different glyph ("√"), and minimal-mono's header shifts 1–2 px — MINOR
- Environment: blueprint-front 3096bca + TASK-161, Chrome 156, 1280 px; compared with 3096bca as committed.
- Repro: any project in clean-blue → the requirements page (or any page with the name box) → the confirm button beside "พิมพ์ชื่อคุณก่อน…": before ✓, after √ (same text node "✓", `aria-label` unchanged).
- Expected (REQ-123 AC-10): "the font and the look of the pages do not change".
- Actual: the glyph of U+2713 differs between the font file Next fetched from Google and the one now in the repo; minimal-mono's bold header text is 1–2 px wider. Everything else on the three pages matches.
- No fix proposed.

### Verdict, round 2
**`TEST_FAILED` (round 2, AC-10)** — **AC-9 PASS**: on fresh clones the README's build works the first time, with and without internet, and right after a build stopped half way (TEST-120 DEF-1 fixed); **AC-10 FAIL on DEF-2 (MINOR)**: the clean-blue confirm button's "✓" now draws as "√", and minimal-mono's header shifts 1–2 px — the look changed, slightly; suites pass. The PM may accept DEF-2 as is; QA does not round it up. **Tested trees (tree-fp.sh, same 21:43 and 21:58):** blueprint-front **3096bca fp `7977f1cccca9`** · blueprint-back **861e35a fp `fa2163a9aafd`**.
