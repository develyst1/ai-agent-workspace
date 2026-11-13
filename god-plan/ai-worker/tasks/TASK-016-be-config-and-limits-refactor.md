# TASK-016: Back — every setting from config/env, product limits in one module (no behaviour change)
- Source: SPEC-003 §Findings B1–B9, §Rule, §Environment keys, §Proof · DECISIONS 2026-11-09 14:59
- Owner: BE (Jason)
- Status: DONE (2026-11-09, SA review). Earlier: REVIEW (Jason; was TODO) (2026-11-09: TASK-003 steps 6–8 DONE, so start now). Re-run step 8 after the refactor (see DoD).
- Depends on: TASK-003 (DONE)
- Git: none by you.

## What to do
1. `src/config/env.ts` (moved from `src/env.ts`): one typed `Config` with every key in SPEC-003 B1–B7, each with today's value as its default,
   validated (integer / range / one of), and failing fast naming the KEY (never a value). Optional `LLM_PROVIDER` and `LLM_MODEL` are sent in the
   gateway body **only when set** (unset = today's request, byte for byte). Boot invariant: `AI_TIMEOUT_MS < SERVER_IDLE_TIMEOUT_S*1000`, else exit naming both.
   Pass `Config` through `createApp` deps. No module reads `process.env` except `config/env.ts`.
2. `src/config/limits.ts`: every product limit in SPEC-003 B8 as named constants. Use them in routes, `http/validate.ts`, `ai/routes.ts` **and**
   `db/schema.ts`. `bun run db:generate` must then report **no changes** (no new file in `drizzle/`).
3. Replace B1–B7 literals with `config.*`. `.env.example`: add each new key with one comment line giving its default, and no value.
4. Update `tests/harness/back-pglite/serve.ts` only if its `createApp` call needs the new `Config` shape (pass defaults). Nothing else there; the live switch stays inert.
5. Tests: one test that `loadConfig({})` gives today's defaults, one per invalid key, and one for the invariant. Every existing test still passes.

## Definition of Done
- [ ] `bun test` → all pass (count ≥ 77 + the new ones). `bun x tsc --noEmit` clean. Paste.
- [ ] `bun run db:generate` → "No schema changes", and `ls drizzle/` unchanged. Paste.
- [ ] `grep -rn "process.env" src | grep -v src/config/env.ts` → none. `grep -rnE "\b(200|500|2000|25_?000|60_?000|604800)\b" src | grep -v src/config` → none (or each remaining hit explained in one line). Paste.
- [ ] Re-run TASK-003 step 8's curl list on `god_plan` with no new keys set: same results. Paste.
- [ ] `git status --short` + the file list. Servers stopped by PID.

## Implementation Notes
**Done (Jason, 2026-11-09).** `god-plan-back`, branch `atom`, nothing committed. No behaviour change: every default equals the old value, and the same tests plus the step-8 curl list give the same results.

**What changed (back).**
- **New** `src/config/env.ts`: one typed `Config` (`loadConfig(source = process.env)`), the **only** module that reads the environment; `databaseUrl()` stays separate and lazy so health and the tests run without it. Each key has its old value as default, is validated (integer in a range / number in a range / one of), and fails fast naming the KEY, never the value: `PORT 4310`, `HOST 127.0.0.1`, `SERVER_IDLE_TIMEOUT_S 30` (1–255, Bun's max), `COOKIE_SECURE false`, `INVITE_TTL_SECONDS 604800`, `SESSION_TTL_DAYS 30`, `BODY_MAX_BYTES 65536` (≥ 1024), `AI_TIMEOUT_MS 25000`, `AI_RATE_WINDOW_MS 60000`, `AI_RATE_MAX 10`, `AI_MAX_TOKENS_SUMMARY 600`, `AI_MAX_TOKENS_PROPOSALS 800`, `AI_TEMPERATURE 0.3` (0–2), optional `LLM_PROVIDER`, `LLM_MODEL`; `FRONT_ORIGIN` and `LLM_GATEWAY_URL` stay required. **Boot invariant:** `AI_TIMEOUT_MS < SERVER_IDLE_TIMEOUT_S × 1000`, else the error names both keys. `src/env.ts` is deleted.
- **New** `src/config/limits.ts` (`LIMITS`: email, displayName, inviteeName, password, projectName/Description, taskTitle, stuckReason, commentBody, bulkTasks, proposalTitle, proposals, summary) used by `http/validate.ts`, the tasks/projects/comments/invites/ai routes, `scripts/owner-set.ts` **and `db/schema.ts`** (CHECKs inlined as plain numbers through a tiny `sql.raw` helper, so the SQL is unchanged).
- **New** `src/config/http-status.ts` (`HTTP.CREATED`, `HTTP.NOT_FOUND`, …) replaces the bare status numbers in `http/errors.ts`, `app.ts`, the gateway, guards, links and every route (SPEC-003 Rule 3).
- `createApp({ db, config })`; the old per-field deps and the `aiTimeoutMs` test seam are gone. `ai/gateway.ts` takes the `AiConfig` and sends `provider`/`model` **only when set**; unset, the body keys stay `temperature, max_tokens, messages` in that order (tested). `ai/guards.ts` takes `{ rateWindowMs, rateMax }`. `auth/session.ts` takes the TTL and the cookie's `Max-Age` from `config`. `index.ts` passes `idleTimeout: config.idleTimeoutS`. `.env.example` lists 18 keys (11 new), one comment line each giving the default, no values.
- **Outside the TASK's list, needed:** `scripts/owner-set.ts` (its import and its own literals 254/100/8), `src/links/tokens.ts` (410 constant), `src/auth/routes.ts`/`session.ts` (TTL), `src/db/schema.ts` (as the TASK says), `test/setup.ts` (a `testConfig()` helper), and the workspace harness `tests/harness/back-pglite/serve.ts` (step 4 of the TASK: it now builds the back's own `Config` with `loadConfig`; the live switch is untouched and inert).

**Tests.** `test/config.test.ts` (new, 35 tests): `loadConfig` with only the two required keys equals today's values exactly; a missing required key is named; **every key refused when bad, by name** (26 cases, never echoing the value); the invariant (defaults satisfy it; equal/larger/lower idle refused naming both keys; 29 999 ms passes). Behaviour through the app: `SESSION_TTL_DAYS` sets `Max-Age` and the stored expiry, `BODY_MAX_BYTES` sets the limit and the `max` in the error, `AI_RATE_MAX`, `LLM_PROVIDER`/`LLM_MODEL`, tokens and temperature reach the gateway call. The env test moved out of `schema.test.ts`; test files use `testConfig({ ENV_KEY: "…" })` instead of the old seams.
```
$ bun test
 116 pass
 0 fail
 651 expect() calls
Ran 116 tests across 5 files.        (was 77 = 8 schema + 23 core + 17 links + 29 ai; now 7 schema + 25 core + 17 links + 32 ai + 35 config, measured per file; the old env test moved to config.test.ts)
$ bun x tsc --noEmit → no output, exit 0
$ bun run db:generate        → "No schema changes, nothing to migrate"
$ ls drizzle drizzle/meta    → 0000_calm_zuras.sql, meta/{0000_snapshot.json,_journal.json}   (identical before and after: no new migration)
$ grep -rn "process.env" src | grep -v src/config/env.ts                                → no hit (exit 1)
$ grep -rnE "\b(200|500|2000|25_?000|60_?000|604800)\b" src | grep -v src/config      → no hit (exit 1)
$ git check-ignore .env → .env        $ grep -c '=' .env.example → 18   (18 keys)
```
`drizzle.config.ts` (project root, not under `src/`) still reads `process.env.DATABASE_URL` itself, because `db:generate` must work without a `.env`; the grep in the DoD is over `src`, so it does not count, but you should know.

**Step 8 re-run on `god_plan`, no new keys set** (real `src/index.ts`, stand-in on :4399, owner credentials read from `god-plan-qa.env`, cookies never shown, ids shortened). Same results as before the refactor:
```
god-plan-back listening on 127.0.0.1:4310                         (same line)
GET /api/health → {"ok":true}
sign-in owner → http=200 …            Set-Cookie Max-Age=2592000   (30 days, unchanged)
create project / task → 201 shapes as before; task status "todo"
PATCH stuck, no reason → {"error":{"code":"VALIDATION","field":"stuckReason","rule":"required"}} http=400
PATCH stuck + reason  → {"task":{… "status":"stuck","stuckReason":"รอข้อมูล" …}} http=200
I1 → {"url":"http://127.0.0.1:4300/invite/<token>","expiresAt":…}
I2 (no cookie) → {"projectName":…,"inviteeName":"น้องทดสอบ","ownerName":"เจ้าของทดสอบ","expiresAt":…} http=200
S1 → {"stuck":[{…"stuckReason":"รอข้อมูล"}],"ai":null} http=200      stand-in calls: 0
unknown route → 404 · GET /api/me without a cookie → {"error":{"code":"UNAUTHENTICATED"}} 401
listeners left on 4310/4399: 0   (stopped by their port's own PID)
```
The harness `back-pglite` also boots with the new `Config` (seed lines, sign-in 200, both projects with their counts; port freed).
`git status --short` (god-plan-back): ` M README.md`, `?? .env.example .gitignore bun.lock drizzle.config.ts drizzle/ package.json scripts/ src/ test/ tsconfig.json`: the same top-level list as before, nothing committed.
Left on `god_plan` (synthetic): one more project "BE refactor check 2026-11-09 (synthetic)" with one stuck task and one unused invite, besides the ones from step 8.

Decisions (mine, reversible): (1) ranges on the numeric keys are mine (SPEC-003 says "validated"); (2) `LLM_PROVIDER`/`LLM_MODEL` set to blank mean unset; (3) `sessionTtlSeconds` is the Config field (from `SESSION_TTL_DAYS`) so cookie and DB expiry cannot drift; (4) `HTTP` constants live under `src/config/` so the DoD's `grep -v src/config` excludes them, as the SPEC's wording intends; (5) `INVITE_TTL_SECONDS` still also drives reset links, as before.
`UNVERIFIED`: a run with a non-default value of each key against real Postgres (covered by the tests on PGlite only); `bun run build` of the refactored tree (not part of this TASK's DoD); `/security-review`.

## Questions

## Review
**DONE — Sober (SA), 2026-11-09.** SPEC-003 B1–B9 are met, with no behaviour change shown.
- **Re-ran myself:** `bun x tsc --noEmit` clean · `bun test` 116 pass, 0 fail · `grep process.env` outside `src/config/env.ts` → none · the literal grep → none ·
  `bun run db:generate` → "No schema changes", and the md5 of every file in `drizzle/` is identical before and after · `bun run build` compiles, header `7f 45 4c 46 02 01 01` (ELF64).
  That last one settles your `UNVERIFIED` build.
- Accepted: the step-8 re-run on `god_plan` with no new keys gives the same results (`Max-Age=2592000`, the stuck CHECK, I2 `ownerName`, S1 0 calls). The config tests
  (defaults equal today, each bad key named, the invariant both ways) are accepted, as are `provider`/`model` sent only when set, with the body order unchanged.
- Files outside the list are accepted, each with its reason. So are decisions 1–5. `drizzle.config.ts` reading `DATABASE_URL` itself is fine: it's tooling at the project
  root, needed by `db:generate` without `.env`.
- More synthetic rows on `god_plan` ("BE refactor check …"): accepted, harmless.
- `/security-review`: not needed for this TASK. It changes structure only, and the auth / input paths are unchanged (the same tests pass).
