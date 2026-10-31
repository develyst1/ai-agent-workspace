# REQ-123: I-Space can be set up on a Linux server from its own docs
- Status: **Team A round 2 TEST_FAILED** (2026-10-30 21:58, QA Tanya — AC-9 PASS (fresh clones build with and without internet, after a half-way stop); AC-10 FAIL on DEF-2 MINOR (clean-blue "✓" now "√"); TEST-120 § Round 2) · **Team A side TEST_PASSED** (2026-10-30 20:43, QA Tanya — DEF-1 MINOR, R1 DATA REQUEST; Team B / pm2 parts not yet tested; `tests/TEST-120-linux-deploy-ready-team-a.md`) · READY_FOR_SA (2026-10-30 19:0x, the PM)
- Priority: HIGH `[owner-approved 2026-10-29]` — planned under the name "REQ-109" in `../project-docs/plan-sit-th.md` step 6 and `RESUME-HERE.md`; `new-id.mjs` gave it 123 (the PM never picks a number). Every "REQ-109" in those plans means this REQ.
- Requested: 2026-10-29 13:04 by the owner (via Atom): *"…ทำการแก้ไข หรือทดลอง กันจนเสร็จถูกต้อง100% เดี๋ยวจะเอา i space เนี่ย ไป deploy บน linux server ให้ แล้วลองใช้จริง"* (`DECISIONS.md` 2026-10-29 13:04) · how he deploys today, 2026-10-30 16:17: *"ปกติฉัน เป็นคน cloneโค้ดมาเอง แล้วbuild แล้วหิ้วไปขึ้นserverเอง แล้ว pm2 restart เองเลย"* (`SYSTEM-FACTS.md` § "100% done"). Stamp `operator`.
- Deadline: none — before the local dress rehearsal (plan step 7), which uses these docs.
- Teams: **A** (`blueprint-back`, `blueprint-front`) may start now · **B** (`caw-back`, `caw-front`) after REQ-122 is committed (same caw-back tree, F-013) `[PM-decided]`

## Problem / Goal

The owner will clone the four repos, build them and run them with pm2 on a Linux SIT server, then create a real project through I-Space and expect the team to finish it like he would. Today he could not do that from the repos alone: three of the four READMEs are 10–17 bytes (I checked: `wc -c` on blueprint-back 16, blueprint-front 17, caw-back 10; caw-front 2293), and what the services need — which env vars, which order, the Claude CLI login for CAW, the database migration, CAW's work folder — lives only in this desk's files and the team's heads. Goal: **a person who has only the four repos and a Linux server can install, configure, start and restart I-Space**, and nothing in the product assumes a Mac.

## What is there today (evidence, read-only, PM 2026-10-30 19:0x)

- `.env.example` exists in all four; keys: blueprint-back `DATABASE_URL PORT HOST SOURCES_DIR GATEWAY_URL CAW_NOTIFY_URL` · blueprint-front `BLUEPRINT_API_URL CAW_URL` · caw-back `DATABASE_URL PORT BLUEPRINT_URL CAW_POLL_MS CAW_WORKSPACE_ROOT BLUEPRINT_WEB_URL CAW_API_URL RUNNER_POLL_MS RUNNER_HOP_MAX_MS CLAUDE_BIN RUNNER_TRACE_DIR` · caw-front `CAW_API CAW_API_URL BLUEPRINT_URL PORT`. Whether every variable the code reads is listed: not checked (the SA's).
- `blueprint-front → scripts/check-required.ts:185` runs `cp -cR` (macOS clone flag) and falls back to `cpSync` at :186 — works on Linux via the fallback; a dev script, not the product.
- `caw-front → src/words.ts:153` the folder hint shows a Mac path to the user: *"ใส่ path เต็ม เช่น /Users/…/my-repo"*.
- `caw-front → src/api/mock.ts:300-301` mock data uses `/Users/operator/...` paths (mock mode only).
- `caw-back` has `skills/role-*` in the repo; TEST-112's F-0b showed "ใช้ทีมเริ่มต้น" fails when those skills are missing from CAW's work root (fixed for that root in REQ-117 — whether a brand-new root on a new server is prepared by CAW itself: not checked, the SA's).
- caw-back runs as separate processes (`package.json` scripts `api`, `mcp`, `runner`, `dev`).

## Requirement

1. **Each repo's README lets a newcomer set it up on Linux**: prerequisites (with versions), install, every env var (what it is, an example, required or optional), build, start, stop, restart, and how to check it is up. `[operator]` (13:04 "deploy บน linux server")
2. **One place says how the four fit together**: which service talks to which (URLs/ports), the order to start them, and a full first-time checklist for a new server — database migration, CAW's work folder, the Claude CLI installed and logged in to the subscription on the server user CAW runs as. Where it lives is the SAs' design (the PM prefers it repeated briefly in each README rather than in a file only one team owns). `[PM-decided]`
3. **The owner's way of deploying is written as steps he can repeat**: clone/pull on branch `atom` → install → build → `pm2` start the first time / `pm2 restart` after an update — one pm2 process per service, with names. A pm2 ecosystem file per repo is acceptable if the SA prefers it. `[operator]` (16:17) — no automation (Out of Scope).
4. **Configuration comes only from env vars** (or `.env`): no machine path, host or Mac-only command in product code; every variable the code reads is in that repo's `.env.example`. Mock data and tests may keep example paths. `[operator]` (DoD per DECISIONS 2026-10-29 13:04)
5. **A missing or wrong required setting stops that service at start with one line naming the variable** — not a crash later on the first request. `[PM-decided]` (on a server the owner reads the pm2 log; a late crash is the costly kind)
6. **CAW prepares a brand-new work root by itself** on first start (the role skills and anything else a worker needs there), so "ใช้ทีมเริ่มต้น" works on a new server without copying files by hand. `[PM-decided]` (from TEST-112 F-0b)
7. **Production builds work on Linux**: both fronts build for production and start from the build; both backs start in their production mode. `[operator]`
8. Everything that works today keeps working (REQ-101…122 behaviour, all suites). `[PM-decided]`

How each item is met is the SAs' design.

## Acceptance Criteria

- [ ] **AC-1** — **Given** a fresh `git clone` of the four repos (branch `atom`, committed HEADs) into a new empty folder on this Linux box, with no file copied from the working repos **When** QA follows only the READMEs (req 1–3), with its own new `.env` files (pglite or the TEST DB, stub `CLAUDE_BIN`, a new empty `CAW_WORKSPACE_ROOT`, ports other than the working ones) **Then** all services start under pm2 with the documented names, each health check in the docs answers, and a project made on Blueprint reaches CAW through "ส่งไปสร้างที่ CAW". Every step QA had to guess or fix is a defect. Check: QA, command log + pm2 list + screenshots.
- [ ] **AC-2** — **Given** AC-1's setup **When** QA follows the documented update steps (pull → build → `pm2 restart`) **Then** every service comes back up and the project made in AC-1 is still there. Check: QA, pm2 list before/after + the project on both screens.
- [ ] **AC-3** — **Given** AC-1's new empty work root **When** QA presses "ใช้ทีมเริ่มต้น" and starts one run (stub CLI) **Then** the team is made and its first hop starts with the role skills in place, with no file copied by hand. Check: QA, stub; listing of the root + hop record.
- [ ] **AC-4** — **Given** each required env var in turn left out (or a port already in use) **When** that service is started **Then** it exits at start, and its log's first error line names the variable (or the port). Check: QA, one start per variable; log lines.
- [ ] **AC-5** — **Given** the four repos' product code (not tests, not mock data) **When** searched for `/Users/`, `/opt/homebrew`, `darwin`-only commands and hard-coded hosts/paths **Then** none is found, and every env var the code reads appears in that repo's `.env.example`. Check: SA's grep in the SPEC, re-run by QA.
- [ ] **AC-6** — **Given** the CAW folder screen **When** the user looks at the "add folder" hint **Then** it reads the Linux example below. Check: QA, the screen.
- [ ] **AC-7** — **Given** AC-1's clean clone **When** both fronts are built for production **Then** the build exits 0 and the built app serves its first page. Check: QA, build output + page.
- [ ] **AC-8** (regression) — all four suites pass as on their committed HEADs; REQ-108 AC-4 (dashboard on :3900) still runs on the working setup. Check: QA.

## User-facing wording (the PM)

| Where | Today | New TH | New EN (if the screen has EN) |
|---|---|---|---|
| caw-front folder hint (`words.ts` workspace.hint) | ใส่ path เต็ม เช่น /Users/…/my-repo | ใส่ path เต็ม เช่น /home/…/my-repo | Full path, e.g. /home/…/my-repo |

The startup error lines of req 5 are read by the owner in a pm2 log: English, form `<service>: missing required setting <VAR> — see README § Configuration`. Any other user-visible line: the SA asks, the PM writes it.

## Constraints

- The team never deploys and never touches SIT or any server (`PROTOCOL.md` § Environments). AC-1/2 run on this box only, in a fresh folder, with ports that do not collide with the working setup.
- Never write the real `DATABASE_URL` or any secret into a README, `.env.example`, log or commit.
- Git per repo per topic on the owner's word, as always.
- LLM gateway: 0 calls — AC-1's project is typed by hand (as REQ-108 phase 3). Live Claude CLI: not needed (stub).

## Out of Scope

- CI/CD or any auto deploy (owner 16:17: *"ไว้ ทำงานนี่จบก่อนค่อยมาคุยก็ได้"* — PM raises it after the dress rehearsal). · Docker / containers, unless the SA shows pm2 alone cannot meet req 3. · Login / auth (owner 10:51: later). · nginx, SSL, firewall, domain names on SIT (the owner's server; the README may say which ports must be reachable). · The dress rehearsal on a new project (plan step 7 — QA, after this REQ). · Choosing the SIT database.

## Round 2 — Team A (DEF-1, PM 2026-10-30 20:5x) `[PM-decided]` (DECISIONS 20:4x)

Round 1 Team A committed: blueprint-back 861e35a · blueprint-front 3096bca (owner typed by Atom 20:48, PM-verified). TEST-120 DEF-1: on a clean clone the first `bun run build` of blueprint-front failed on the Google-font step (`Can't resolve '@vercel/turbopack-next/internal/font/google/font'`), and kept failing until `.next` was deleted — a step the README does not give.

- **Req 9.** The README's build step works on a fresh clone the first time, with no undocumented step; and a failed build does not leave the next one failing. If the build still needs the internet (e.g. fonts), the README says so under prerequisites, and the build failure says what to do in one line. Which (local fonts, cleanup, or docs) is the SA's design; the PM prefers a build that does not need the internet, because the owner's server network is not known (Q1).
- **AC-9** — **Given** a fresh clone of blueprint-front at the round-2 commit **When** QA runs the README's install + build steps 3 times, each in a new clone, and once more right after a build that was stopped half way **Then** every build exits 0 with no step outside the README, and the built app serves `/`. Check: QA, build logs.
- **AC-10** (regression) — the font and the look of the pages do not change (QA compares a screenshot of one page before/after); suites as round 1.

## Questions
(the SA and the QA ask here; the PM answers as `> answer: ...`)

- **Q1 (PM, non-blocking) — the SIT server's OS and what is already installed are not recorded.** PM default `[PM-decided]`: write the docs for a plain Linux server (Ubuntu-like, systemd) with the prerequisites listed and how to check each (`bun --version`, `node --version`, `pm2 --version`, `claude --version`); pm2 is assumed installed since the owner already uses it. If the owner says otherwise, the docs get a line, not a redesign.
  > SA A (Sober, 19:4x): taken as is. Blueprint READMEs list each prerequisite with its check command (SPEC-121 D6 step 2).
- **Q2 (SA A, non-blocking) — the PDF export is likely blocked on a server.** Checked: DECISIONS / SYSTEM-FACTS — nothing on PDF on a server. `blueprint-front → src/features/export/pdf.ts:25-30` lets Chrome load only `localhost`/`127.0.0.1`. The route prints `new URL(…, req.url)`, so when a user opens the site by the server's IP or name, the print page itself is refused (inferred; my probe was not clean, SPEC-121 R2). It is not in REQ-123's ACs. **My default: not in REQ-123. QA tries it once in AC-1 (export a PDF through the LAN address) and records it as an observation.** If it fails, the PM decides whether it becomes its own REQ. Cases: works → nothing · fails → new REQ (the fix is the front's, small: print through `127.0.0.1:<own port>`, not `req.url`).
- **Q3 (SA A, non-blocking) — pm2 is not installed on this box** (`pm2: command not found`, SPEC-121 E11), and AC-1/2 need it. ~~My default: QA runs `npx -y pm2@7.0.4` with its own short `PM2_HOME`~~ **Superseded 19:4x by the owner's order (DECISIONS 19:3x): no pm2 on this box until F-048's cause is accepted.** F-048 records the cause: a long `PM2_HOME` socket path → `EINVAL` → pm2-axon retries `listen` without limit → ~2 GB per daemon, and a new daemon on every CLI call. Until then, the pm2 lines of TASK-155/156 and AC-1/2's pm2 steps are held. When the PM releases pm2: `PM2_HOME` must be short (e.g. `/tmp/<name>-pm2`), one daemon, `pm2 kill` + `ps`/`free -m` pasted after.
- **Q4 (SA A, non-blocking) — start-up lines beyond the PM's form.** The PM gave `<service>: missing required setting <VAR> — see README § Configuration`. Blueprint also needs these. Same form, English, read only in the pm2 log:
  `wrong setting DATABASE_URL (not pglite:memory or a postgres:// URL)` · `wrong setting PORT ("<value>" is not a port number)` · `wrong setting DATABASE_URL (cannot reach the database, code <code>)` · `database is not migrated — run bun run db:migrate` · `cannot listen on <host>:<port> (<code>)` · `port <port> is in use` (front). **My default: these words (SPEC-121 D2/D3); the TASKs are cut with them.** Correct only the line that is wrong.
  > answer (Porter, PM, 2026-10-30 19:4x) `[PM-decided]`: **Q2 accepted** — not in REQ-123; QA tries one PDF export through the LAN address in AC-1 and records it as an observation; fails → its own small REQ (the owner will open SIT by its address, so it is not dropped). **Q3** — pm2 stays held per the owner's order (DECISIONS 19:3x). F-048 now records the cause; the PM asks the owner/Atom to release pm2 on your conditions (short `PM2_HOME` like `/tmp/<name>-pm2`, one daemon, `pm2 kill` + `ps`/`free -m` pasted after). Until the owner says so, cut and build everything else, with the pm2 lines held. **Q4 accepted** — those words, each line starting with `<service>: ` like the missing-setting line.

## AC check — Team A side (Sober, SA A, 2026-10-30 20:2x)
Team A = `blueprint-back` + `blueprint-front` (SPEC-121; TASK-155 DONE 20:24, TASK-156 DONE 19:59; uncommitted on 6123018 / 6692a16, tree-fp `fa2163a9aafd` / `af68a69a5652`). Team B's rows come from SA B's own check. The pm2 runs are HELD by the owner's order (DECISIONS 19:3x): the files and the README steps exist and were tried once in a scratch copy (SPEC-121 E9/E10), but no pm2 run on the finished code. **That is QA's, after pm2 is released.**

| AC | Where it is met (Team A) | Self-checked |
|---|---|---|
| AC-1 | Both READMEs (D6 steps 1–11 + D7 "I-Space on one server", identical in both, `diff` empty): prerequisites with check commands, install, every variable, database (back), build (front), pm2 start/stop/restart/logs, health check. `ecosystem.config.cjs` in each (`blueprint-back` / `blueprint-front`). `bun run start` → `/health` / `/` 200 (TASK-155 DoD 7, TASK-156 DoD 7) | yes, except the pm2 run (HELD) and `git clone`/`pull`/`db:create`/`db:migrate` (UNVERIFIED, listed in both TASKs) → QA |
| AC-2 | README § Update in both (pull → install → `db:migrate` / `build` → `pm2 restart <name>`). Restart frees the port: back E9, front SIGTERM check (TASK-156 § Review) | yes, except the pm2 run (HELD) → QA |
| AC-3 | Team B (CAW work root) | n/a for A |
| AC-4 | back: 6 lines (`src/startup.ts`, `src/index.ts`), all 5 reproducible ones re-run by me, first stderr line, exit 1 (TASK-155 § Review); front: 3 lines (`scripts/start-settings.mjs`), PORT and in-use re-run by me (TASK-156 § Review). No secret in any line | yes |
| AC-5 | SPEC-121 D5: the grep → no `/Users/`, homebrew, darwin-only command in either product `src/`; hosts are env-backed defaults. `.env.example` now lists every variable the code reads: back 10/10 (TASK-155 DoD 10), front 13 + `PORT` | yes |
| AC-6 | Team B (caw-front words) | n/a for A |
| AC-7 | blueprint-front: fresh clone of 6692a16 → `bun run build` exit 0 (SPEC-121 E7); TASK-156 DoD 6 build exit 0 + `bun run start` → `/` 200 on the built app. blueprint-back has no build (Bun runs TS) | yes |
| AC-8 | back `bun test` 340/16/0 (base 335 + 5, my run 20:2x); front `bun test src scripts` 246/0 (base 238 + 8, my run 19:5x), typecheck 0, check:api OK, isolation 4/4 (Fern). REQ-108 AC-4 on the working setup: QA. Risk R1: the working TEST DB must be migrated or blueprint-back now refuses to start | yes for the suites; working-setup run → QA |

## AC check — Team A round 2 (Sober, SA A, 2026-10-30 21:26)
SPEC-122 DONE, TASK-161 DONE (Fern; uncommitted on 3096bca, tree-fp `7977f1cccca9`).

| AC | Where it is met | Self-checked |
|---|---|---|
| Req 9 | The build fetches nothing: the 4 theme fonts are files in the repo (`src/themes/*/fonts/`), loaded by `next/font/local` (SPEC-122 D1/D2). README unchanged, because no internet step remains (D3) | yes |
| AC-9 | Offline build on the real tree → exit 0 (my re-run 21:2x). Killed at 9 s → exit 137, then an offline rebuild → exit 0 (SPEC-122 E4 + TASK-161 DoD 9, done twice by Fern). The base offline build fails (E2). The 3 fresh clones are QA's | yes for one tree; 3 clones → QA |
| AC-10 | Same font versions (E6). Families, weight ranges, `display: swap`, mono's fallback list and gold's CSS variables are kept (patch). Headless Chrome: all 4 faces `loaded` and painted (TASK-161 § Review). typecheck 0, 246/0. The page before/after screenshot is QA's (SPEC-122 R1: fallback face before swap) | yes for fonts + suites; screenshot → QA |

## Verification (by QA) — Team A side
Tanya, 2026-10-30 20:43 — a clean `git clone -b atom` + the tree under test (tree-fp.sh = blueprint-back 6123018 `fa2163a9aafd` · blueprint-front 6692a16 `af68a69a5652`, same 20:30 and 20:43), READMEs only, no pm2, stub gateway. Detail TEST-120.

| AC | Verdict (A side) | What I checked myself |
|---|---|---|
| AC-1 | PASS (A part, no pm2) | prerequisites, install, `.env`, `bun run start`, health checks on the clean clone; a project shows back → front |
| AC-2, AC-3, AC-6 | not yet | wait for Team B / pm2 (DECISIONS 20:2x) |
| AC-4 | PASS (8 of 9) | each documented line first on stderr, exit 1, no secret; "not migrated" NOT_TESTED (no QA Postgres) |
| AC-5 | PASS (A repos) | no Mac path / darwin command; hosts env-backed; every read variable in `.env.example` |
| AC-7 | PASS with DEF-1 | the front's build failed twice on the font fetch until `.next` was deleted (not in the README); then exit 0 and `/` 200 |
| AC-8 | PASS (A) | back 340/16/0, front 246/0, check:api, typecheck 0; REQ-108 AC-4 on a working-shape setup "ไม่ตอบ" in 6.9 s; R1 (real TEST DB migrated?) NOT_TESTED → DATA REQUEST in TEST-120 |

Q2 observation: the PDF export through the LAN address works here (a real PDF, 0 requests aborted).

**Round 2 (Team A)** — Tanya, 2026-10-30 21:58 — tree-fp.sh: blueprint-front 3096bca fp `7977f1cccca9` (same 21:43 / 21:58). Detail TEST-120 § Round 2.

| AC | Verdict | What I checked myself |
|---|---|---|
| AC-9 | PASS | 3 fresh clones: README build exit 0 with network and offline (`unshare -rn`); after a build stopped half way (2 s SIGKILL; a hung one) the next build exit 0, nothing deleted; `/` 200 |
| AC-10 | **FAIL (DEF-2, MINOR)** | same page before/after, 3 themes: luxury-gold identical; clean-blue's "✓" button now draws "√"; minimal-mono header 1–2 px wider; suites 246/0, typecheck 0, check:api matches |

## AC check — Team B side (Silver, SA B, 2026-10-30 23:2x)
Team B = `caw-back` + `caw-front` (SPEC-123; TASK-163/164/165 DONE; uncommitted on 2426d9a / a009d2c, tree-fp `cd8dfd83981c` / `1b01369237d6`). pm2 runs are HELD (DECISIONS 19:3x): the files exist and are syntax-checked, but no pm2 run → QA after release.

| AC | Where it is met (Team B) | Self-checked |
|---|---|---|
| AC-1 | caw-back README (SPEC-123 D8: prerequisites incl. jq/perl/Claude CLI, § Configuration of every variable, § Database, § CAW work folder, § Claude CLI, pm2 two names, `/health` + runner `started —`) · caw-front README (production on top, `## Development` kept) · `ecosystem.config.cjs` in both · shared section identical to Blueprint's in both (diff empty) · README API start run as written → `{"ok":true}` (TASK-164 § Review) | yes, except the pm2 run (HELD) and `db:migrate` on Postgres (UNVERIFIED) → QA |
| AC-2 | § Update in both (pull → install → `db:migrate` / `build` → `pm2 restart`) | yes, except the pm2 run (HELD) → QA |
| AC-3 | `caw-back → src/runner/root.ts` `prepareRoot` + shipped `hooks/` (cmp-equal, 755); a root that did not exist → 3 `prepared …` lines → `started —` (TASK-163 8e, re-run by me); skills from CAW's own copies (REQ-117) | yes — stub; "ใช้ทีมเริ่มต้น" + first hop on a fresh root = QA |
| AC-4 | caw-back-api 6 lines (`src/startup.ts`, `src/index.ts`), caw-back-runner 7 lines (`src/runner/startup.ts`, `main.ts`), caw-front 3 lines (`scripts/start-settings.mjs`); first stderr line, exit 1, never a URL value; 8a + PORT=abc re-run by me (TASK-163/165 § Review) | yes; the two Postgres rows only with a fake `sql` → QA |
| AC-5 | SPEC-123 D7 grep → no Mac path in product `src` but `words.ts:153` (fixed) and mock data (allowed); hosts env-backed. Every product-read variable in `.env.example`: caw-back `comm` → empty (TASK-164 DoD 2), caw-front + `NEXT_DIST_DIR` | yes |
| AC-6 | `caw-front → src/words.ts:153` `ใส่ path เต็ม เช่น /home/…/my-repo` (the PM's words); `words.test.ts:36` follows | yes — the screen itself = QA |
| AC-7 | caw-front builds **with no internet**: local IBM Plex Sans Thai (SPEC-123 D6), offline build exit 0 (my re-run, TASK-165 § Review); start from the build → `/` 200 (Fanta); caw-back has no build (Bun runs TS) | yes; fresh clone = QA |
| AC-8 | caw-back whole `1006 pass · 1 skip · 1 fail` (known withReadGuard) · caw-front `bun test src scripts` 369/0, typecheck 0, e2e 276 on the offline build (Fanta) | yes for the suites; working-setup REQ-108 AC-4 → QA |
| Font look (PM: QA as AC-9) | same page before/after at 1280, ≈ 1 px in one button row (TASK-165 § Review) | yes for my eye; QA's compare is the verdict |
