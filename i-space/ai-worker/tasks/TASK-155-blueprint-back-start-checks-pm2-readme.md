# TASK-155: blueprint-back — start checks, `start` script, pm2 file, `.env.example`, README (REQ-123)
- Source: SPEC-121 (D2, D4, D5, D6, D7)
- Owner: BE (Jason)
- Status: DONE (2026-10-30 20:24, Sober — § Review; DoD 8 pm2 HELD, DECISIONS 19:3x) · was REVIEW (Jason, rework done)
- Depends on: none. Base `6123018` (REQ-118 committed). Tree clean at 19:4x.

## What to do
Read SPEC-121 first, all of it. The evidence table E1–E11 shows what the base does today.
1. **New `src/startup.ts`**, D2's table exactly: `checkSettings(env)` (→ the full line or `null`) and `checkDatabase(…)` (Postgres only: one connection, one query `select count(*) from drizzle.__drizzle_migrations`, compared with the number of entries in `src/db/migrations/meta/_journal.json`; codes as `src/scripts/migrate.ts:19-20`). Every line: `blueprint-back: <text> — see README § Configuration`. Never the value of `DATABASE_URL`.
2. **`src/index.ts`**: run `checkSettings` before anything else, then (`url !== "pglite:memory"`) `checkDatabase`. On a line: `console.error(line)`, `process.exit(1)`. Wrap `Bun.serve` in `try/catch` → D2's listen line with the error's `code`. Its existing comments stay.
3. **`package.json`**: add `"start": "bun run src/index.ts"`. Nothing else in the file.
4. **New `ecosystem.config.cjs`**: D4's blueprint-back line exactly, plus one comment: `interpreter: "none"` because pm2's Bun mode `require()`s the entry, and `src/index.ts` uses top-level await (SPEC-121 E8).
5. **`.env.example`**: add `GATEWAY_LIGHT_MODEL` (app section, comment: cheap model for light gateway calls; empty = `tier:small`), then a `# --- tests only ---` section with `BLUEPRINT_LINK_TEST_ALLOW`, `BLUEPRINT_GATEWAY_LIVE`, `BLUEPRINT_SIT` commented out, one comment line each, saying what it does (from the code comments at `src/sources/link.ts:92-95`, `test/gateway/live.smoke.test.ts:1`, `test/sit/rules.sit.test.ts:2`). The existing lines stay as they are.
6. **`README.md`**: replace it, following D6 steps 1–11 for blueprint-back (no step 6 build; step 2 without node/Chrome), with **D7's section copied word for word** as the last section. Configuration table = all 10 variables of D5. Start-up errors table = D2's 6 lines. Every command in the README is one you ran (DoD 8).
7. **New `test/startup.test.ts`**:
   - (a) `checkSettings`: missing / empty `DATABASE_URL`; `mysql://x` and `not a url` → wrong; `pglite:memory`, `postgres://u@h/blueprint`, `postgresql://…` → `null`; `PORT` `abc`, `0`, `70000`, `4200x` → wrong (value in the line); `PORT` unset / `""` / `4200` → `null`. Each line equals D2's text exactly.
   - (b) `checkDatabase` on a PGlite **without** migrations → the "not migrated" line. On a PGlite **with** them (as `src/db/client.ts:16-20`) → `null`. Pass whatever handle your signature takes.
   - (c) `checkDatabase` against `postgres://u:p@127.0.0.1:1/blueprint` → `wrong setting DATABASE_URL (cannot reach the database, code ECONNREFUSED)`. The line holds neither `u:p` nor the URL.

Closed file list: `src/startup.ts` (new) · `src/index.ts` · `package.json` (one line) · `ecosystem.config.cjs` (new) · `.env.example` · `README.md` · `test/startup.test.ts` (new).
Every `bun` command is run with `DATABASE_URL=pglite:memory` unless a DoD line says otherwise. **Never start anything against the remote `DATABASE_URL` in `.env`.** For DoD 6–7, `cd` into a scratch folder (no `.env`) and run `bun run <repo>/src/index.ts`, as SPEC-121 E1–E4 did. **pm2: not at all** (DoD 8 is HELD, F-048). Ports: 4290–4299 only, and free yours when done (stop by port, never by name). No gateway. No git.

## Definition of Done
- [ ] 1. Before: `git status --short` → empty; `git log --oneline -1` → `6123018 …` (base: empty, `6123018`, Sober 19:4x)
- [ ] 2. `DATABASE_URL=pglite:memory bun test test/startup.test.ts` → (a)(b)(c) pass, output pasted (base: n/a — new: the file does not exist)
- [ ] 3. `DATABASE_URL=pglite:memory bun test --timeout 30000` → 0 fail, counts pasted (base: `335 pass / 16 skip / 0 fail`, 351 tests / 46 files, 462 s, Sober 19:5x on a clean clone of `6123018`. A first run at 19:3x, during the pm2 memory squeeze of F-048, showed 1 fail + 1 error; the re-run on a quiet box is clean, so treat any fail as yours to explain)
- [ ] 4. `bunx tsc --noEmit` → exit 0 (base: exit 0, Sober 19:4x on a clean clone of `6123018`)
- [ ] 5. `git diff --stat openapi.json` → empty (base: empty — D1, no shape change)
- [ ] 6. From a scratch folder without `.env`, each start's **first stderr line**, pasted (base, SPEC-121 E1–E4: E1 `DATABASE_URL is not set (use pglite:memory for local)`; E2 Bun source lines first, then `error: Failed to start server. Is port 4292 in use?`; E3 `RangeError … NaN`; E4 starts, then 500 on first call):
   - no `DATABASE_URL` → `blueprint-back: missing required setting DATABASE_URL — see README § Configuration`, exit 1 (base: E1 `DATABASE_URL is not set (use pglite:memory for local)`, exit 1)
   - `DATABASE_URL=pglite:memory PORT=abc` → the PORT line, exit 1 (base: E3 source lines, then `RangeError: The value of "options.port" is out of range … Received NaN`, exit 1)
   - `DATABASE_URL=postgres://u:p@127.0.0.1:1/blueprint PORT=4291` → the "cannot reach" line with `ECONNREFUSED`, exit 1, and `u:p` appears nowhere in the output (base: E4 starts, `/health` 200, first data call 500 + `[http] 500 Error code=ECONNREFUSED`)
   - a `pglite:memory` server on 4292, then a second on 4292 → `blueprint-back: cannot listen on 127.0.0.1:4292 (EADDRINUSE) — see README § Configuration`, exit 1 (base: E2 source lines, then `error: Failed to start server. Is port 4292 in use?`, exit 1)
- [ ] 7. `DATABASE_URL=pglite:memory PORT=4293 bun run start` (in the repo) → `curl -s 127.0.0.1:4293/health` → `{"ok":true,"service":"blueprint-back"}` (base: n/a — new: there is no `start` script; `bun run dev` gives the same `/health` on base, E9)
- [ ] 8. 🚫 **HELD — do not run pm2.** Owner's order (DECISIONS 2026-10-30 19:3x): no role starts pm2 on this box until the cause of F-048 is accepted and the PM says pm2 may be used again. Write `HELD — DECISIONS 19:3x` here and go on. The `ecosystem.config.cjs` is still written (step 4); its pm2 check runs later. When released: with a scratch `.env` copy holding `DATABASE_URL=pglite:memory` and `PORT=4294` (copy the repo to scratch, never write `.env` in the repo), `pm2 start ecosystem.config.cjs` → `pm2 ls` shows `blueprint-back` online with 0 restarts after 10 s; `/health` answers; `pm2 restart blueprint-back` → `/health` again within 10 s; `pm2 stop blueprint-back` → port 4294 free (`ss -ltn`). Paste each (base: E9 — the same form in a scratch copy: online, 3 restarts OK, port freed)
- [ ] 9. README: every command in it was run, by you, in this TASK or in DoD 6–8. List any you could not run as `UNVERIFIED — <why>`. In particular, `db:create` / `db:migrate` need a real Postgres: **do not run them against the remote TEST DB.** Mark them UNVERIFIED, QA runs them. `grep -n "I-Space on one server" README.md` → 1 hit, and its text = SPEC-121 D7 (`diff` of the section against D7's block → empty) (base: README is 16 bytes, `# blueprint-back`)
- [ ] 10. `.env.example`: for each of the 10 names in SPEC-121 D5, `grep -c "<NAME>=" .env.example` → ≥ 1 (base: 6 of 10; missing `GATEWAY_LIGHT_MODEL BLUEPRINT_LINK_TEST_ALLOW BLUEPRINT_GATEWAY_LIVE BLUEPRINT_SIT`)
- [ ] 11. `git status --short` → exactly ` M .env.example`, ` M README.md`, ` M package.json`, ` M src/index.ts`, `?? ecosystem.config.cjs`, `?? src/startup.ts`, `?? test/startup.test.ts` (base: empty)
- [ ] 12. `git check-ignore -v src/startup.ts test/startup.test.ts ecosystem.config.cjs` → exit 1, no output (base: exit 1 for each, Sober 19:4x)

## Implementation Notes
(Jason, BE — 2026-10-30. Base `6123018`. `bun` runs prefixed `DATABASE_URL=pglite:memory` unless a line says otherwise. Starts ran from a scratch folder without `.env` (DoD 6) or in the repo with the env override (DoD 7). **Nothing was started against the `.env` database, no pm2, no git, no gateway.**)

**Changed (closed list):**
- New `src/startup.ts` — `checkSettings(env)` → D2's full line or `null`; `checkDatabase(applied, shipped = migrationsShipped())` (takes `applied: () => Promise<number>`, so a PGlite or a `postgres` client both fit; throws with `42P01` → the "not migrated" line, any other code → "cannot reach … code <code>", no code → `none`; also "not migrated" when `applied < shipped`); `countOnPostgres(sql)` = the one query `select count(*) as n from drizzle.__drizzle_migrations`; `migrationsShipped()` = entries of `src/db/migrations/meta/_journal.json` (12); `listenLine(host, port, err)`.
- `src/index.ts` — `checkSettings` first; for a non-`pglite:memory` URL one `postgres` connection (`max: 1`) runs `checkDatabase` and is ended before `createDb`; `Bun.serve` in `try/catch` → listen line. Each problem: `console.error(line)`, `process.exit(1)`. Existing comments kept.
- `package.json` — one line: `"start": "bun run src/index.ts"`. New `ecosystem.config.cjs` — D4's line + the E8 comment.
- `.env.example` — `GATEWAY_LIGHT_MODEL` in the app section, then `# --- tests only ---` with the three commented. `README.md` — replaced, D6 steps 1–11 (no build step; no node/Chrome), configuration table = all 10 of D5, start-up errors table = D2's 6 lines, D7 last, word for word.
- New `test/startup.test.ts` (5 tests).
**Decided myself:** `checkDatabase` takes a count function, not a client (the TASK left the type to me; it keeps the PGlite test and the real-client test on one code path). The "not migrated" line is `… database is not migrated — run bun run db:migrate — see README § Configuration` (D2's rule: every line ends with the see-README tail).

**DoD evidence:**
1. Before: `git status --short` → empty; `git log --oneline -1` → `6123018 feat: every part context carries all the spec's requirements …`.
2. `bun test test/startup.test.ts` → `5 pass / 0 fail / 27 expect()`: (a) DATABASE_URL missing/empty/`mysql://x`/`not a url`/the 3 good forms; PORT `abc` `0` `70000` `4200x` (value in the line) and unset/`""`/`4200`/`1`/`65535` — each line equals D2's text exactly; no secret in the line · (b) PGlite without migrations → not-migrated line; with `migrate(...)` as `client.ts:16-20` → `null`; one more shipped than applied → not-migrated · (c) `postgres://u:p@127.0.0.1:1/blueprint` → `… (cannot reach the database, code ECONNREFUSED) …`, no `u:p`, no URL · plus the listen line (code and `none`).
3. `bun test --timeout 30000` → `340 pass / 16 skip / 0 fail` (356 tests, 47 files, 455.77 s; 335 + 5).
4. `bunx tsc --noEmit` → exit 0.
5. `git diff --stat openapi.json` → empty.
6. From `…/scratchpad/bp-scratch` (no `.env`), first stderr line, exit 1 each:
   - `env -u DATABASE_URL bun run <repo>/src/index.ts` → `blueprint-back: missing required setting DATABASE_URL — see README § Configuration`
   - `DATABASE_URL=pglite:memory PORT=abc …` → `blueprint-back: wrong setting PORT ("abc" is not a port number) — see README § Configuration`
   - `DATABASE_URL=postgres://u:p@127.0.0.1:1/blueprint PORT=4291 …` → `blueprint-back: wrong setting DATABASE_URL (cannot reach the database, code ECONNREFUSED) — see README § Configuration`; `grep -c 'u:p'` of the whole output → `0`
   - a `pglite:memory` server on 4292 (`/health` → `{"ok":true,"service":"blueprint-back"}`), then a second on 4292 → `blueprint-back: cannot listen on 127.0.0.1:4292 (EADDRINUSE) — see README § Configuration`; the first one's stderr was empty.
   Ports 4292 and 4293 were freed by their port (`ss -ltnp 'sport = :429x'` → pid → kill); `ss` shows 0 listeners on 4290–4299 after. (`lsof` is not installed on this box, so the first free attempt did nothing; the second one did.)
7. `DATABASE_URL=pglite:memory PORT=4293 bun run start` (in the repo) → `curl -s 127.0.0.1:4293/health` → `{"ok":true,"service":"blueprint-back"}`.
8. **HELD — DECISIONS 19:3x.** pm2 was not run. `ecosystem.config.cjs` is written; its pm2 check runs when released.
9. README commands: RAN by me — `bun --version` (→ `1.4.2`), `bun install --frozen-lockfile` (→ `Checked 238 installs across 319 packages (no changes)`), `cp .env.example .env` (in a scratch folder, never in the repo), `bun run start`, `curl -s …/health`. **UNVERIFIED** — `psql --version`; `git clone -b atom <repo URL>` (the URL is a placeholder, the clone was not run); `git pull`; `bun run db:create` / `bun run db:migrate` (need a real Postgres; **not** run against the remote TEST DB — QA runs them); every `pm2 …` command and `npm install -g pm2` (HELD). `grep -n "I-Space on one server" README.md` → 1 hit (line 116); the section equals SPEC-121 D7's block — checked by extracting D7's block from the SPEC and comparing: `README ends with D7 text: True`.
10. `.env.example`, `grep -c "<NAME>=" .env.example`: `DATABASE_URL 2` (one is the tests-only comment text), `PORT 1`, `HOST 1`, `SOURCES_DIR 1`, `GATEWAY_URL 1`, `GATEWAY_LIGHT_MODEL 1`, `CAW_NOTIFY_URL 1`, `BLUEPRINT_LINK_TEST_ALLOW 1`, `BLUEPRINT_GATEWAY_LIVE 1`, `BLUEPRINT_SIT 1`.
11. `git status --short` → ` M .env.example`, ` M README.md`, ` M package.json`, ` M src/index.ts`, `?? ecosystem.config.cjs`, `?? src/startup.ts`, `?? test/startup.test.ts`.
12. `git check-ignore -v src/startup.ts test/startup.test.ts ecosystem.config.cjs` → no output, exit 1.

UNVERIFIED — a start against a migrated real Postgres, and against one that is behind (the "not migrated" line is proved on PGlite only); R1 (the working setup's TEST DB may now refuse to start until `db:migrate`); everything under pm2.

**Rework (Jason, 2026-10-30, Sober's one line):** README § Configuration, the `CAW_NOTIFY_URL` example is now `http://127.0.0.1:4500/v1/notify` (was `/caw/notice`, my guess from a test URL — I had not checked CAW's route). Only `README.md` line 39 changed.
- `grep -n CAW_NOTIFY_URL README.md` → `39:| `CAW_NOTIFY_URL` | CAW's notice address (http/https): after each confirmed version and each saved change Blueprint posts a notice there. Empty = no outbound call; CAW reads the API instead | `http://127.0.0.1:4500/v1/notify` | optional, empty |`
- `grep -c 'caw/notice' README.md` → `0`. Nothing else re-run (a README text change; code, tests and `.env.example` untouched).

## Questions

## Review
**REWORK (one line)** — Sober, 2026-10-30 20:11.

**Fix:** README § Configuration, the `CAW_NOTIFY_URL` example says `http://127.0.0.1:4500/caw/notice`, but CAW's notice route is `POST /v1/notify` (`caw-back → src/http/routes/follow.ts:17`, read-only, 2026-10-30 20:1x). Make it `http://127.0.0.1:4500/v1/notify`. Nothing else changes. Then set REVIEW again with the `grep -n CAW_NOTIFY_URL README.md` line pasted. An example in a setup README gets copied as is, so a wrong path there is a silent misconfiguration: CAW gets a 404, Blueprint only logs `[notify] failed reason=http_404`.

Everything else is checked and accepted, against SPEC-121 D2/D4/D5/D6/D7. My re-runs on 6123018 + 7 paths:
- Scope: `git status --short` = the 7 closed-list paths. `package.json` +1 line, `.env.example` = D5's 4 names (1 app + 3 tests-only, commented).
- Code = D2: `checkSettings` before anything else; for Postgres one `max: 1` connection runs `checkDatabase` and is ended before `createDb`; `Bun.serve` in `try/catch`. Jason's choice (`checkDatabase(applied: () => Promise<number>)`) is accepted: one code path for PGlite and `postgres`. No `DATABASE_URL` value in any line (codes only, as `migrate.ts`).
- `bun test test/startup.test.ts` → 5 pass / 0 fail / 27 expect() · `bunx tsc --noEmit` → exit 0 · `git diff --stat openapi.json` → empty.
- First stderr line, from a scratch folder without `.env`, each exit 1:
  - no `DATABASE_URL` → `blueprint-back: missing required setting DATABASE_URL — see README § Configuration`
  - `PORT=abc` → `blueprint-back: wrong setting PORT ("abc" is not a port number) — see README § Configuration`
  - `postgres://u:p@127.0.0.1:1/blueprint` → `blueprint-back: wrong setting DATABASE_URL (cannot reach the database, code ECONNREFUSED) — see README § Configuration`; `grep -c 'u:p'` → 0
  - `mysql://x` → `blueprint-back: wrong setting DATABASE_URL (not pglite:memory or a postgres:// URL) — see README § Configuration`
  - a pglite server on 4292 (`/health` → `{"ok":true,"service":"blueprint-back"}`), then a second → `blueprint-back: cannot listen on 127.0.0.1:4292 (EADDRINUSE) — see README § Configuration`
- README read in full: D6 order, all 10 variables, 6 start-up lines, D7 last (Jason's comparison: identical).
- Full suite (mine, `DATABASE_URL=pglite:memory bun test --timeout 30000`, started 20:10 on the pre-rework tree; the rework touched only `README.md`) → `340 pass / 16 skip / 0 fail`, `Ran 356 tests across 47 files` (base 335 + 5).

**Re-review → DONE** — Sober, 2026-10-30 20:24. Rework checked: `grep -n CAW_NOTIFY_URL README.md` → line 39, example `http://127.0.0.1:4500/v1/notify` = caw-back's route. `git status --short` still the 7 paths. tree-fp blueprint-back = `fa2163a9aafd` (HEAD 6123018, 3 untracked). DoD 8 (pm2) stays HELD (DECISIONS 19:3x).
- UNVERIFIED, as Jason wrote: "not migrated" against a real Postgres that is behind (proved on PGlite only); `db:create`/`db:migrate`; pm2 (HELD). QA settles them in AC-1/2/4.
