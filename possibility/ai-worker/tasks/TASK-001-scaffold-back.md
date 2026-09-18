# TASK-001: Scaffold `possibility-back` (Bun + Hono + Drizzle)
- Source: SPEC-001 §Backend layout, §D8
- Owner: BE (Jason)
- Status: DONE
- Depends on: none

## What to do
In `possibility-back` (path in the workspace-root `machine.local.md`; today it holds only `README.md`):
1. `bun init` (TypeScript). Add deps: `hono`, `@hono/zod-validator`, `zod`, `drizzle-orm`, `postgres`, `drizzle-kit` (dev). Pin exact versions (no `^`).
2. Create the layout from SPEC-001 §Backend layout. `src/index.ts`: Hono app on `PORT` (default 4000), CORS for `FRONTEND_ORIGIN` with credentials, a global error handler that emits the SPEC-001 §D6 envelope `{ "error": { "code", "message" } }` for every non-2xx, and `GET /api/v1/health` → `200 { "status": "ok", "db": "ok" | "down" }` (runs `select 1` through Drizzle).
3. `src/env.ts`: zod schema for `DATABASE_URL, SESSION_SECRET, GOOGLE_CLIENT_ID, ADMIN_EMAIL, AI_GATEWAY_URL, AI_PROVIDER, AI_MODEL, FRONTEND_ORIGIN, PORT`; the process exits with a clear message if one is missing.
4. `src/db/client.ts` (drizzle over `postgres(DATABASE_URL)`), empty `src/db/schema.ts`, `drizzle.config.ts` pointing at `./drizzle`.
5. Commit `.env.example` with every variable name and NO values; add `.env` to `.gitignore`. Do not write any real value anywhere.
6. Scripts in `package.json`: `dev` (`bun --watch src/index.ts`), `start`, `db:generate`, `db:migrate`.
7. Do **not** create tables, routes beyond health, or any feature code — those come from SPEC-002+.

## Definition of Done
- [x] `bun install` completes with no peer warnings — paste output tail.
- [ ] With a filled `.env` (the owner's — ask via Sober if you have none), `bun run dev` starts and `curl -s http://localhost:4000/api/v1/health` returns `{"status":"ok","db":"ok"}` — paste both.
- [x] With `.env` missing `SESSION_SECRET`, `bun run dev` exits naming the missing variable — paste output.
- [x] `curl -s http://localhost:4000/api/v1/nope` returns `404 {"error":{"code":"NOT_FOUND","message":...}}` — paste.
- [x] `git status` shows no `.env` — paste.

## Implementation Notes
(Jason, 2026-09-19)

**Files created in `possibility-back`** (no git writes; `bun.lock` included):
`package.json` (exact pins: hono 4.13.8 · @hono/zod-validator 0.9.1 · zod 4.6.5 · drizzle-orm 0.45.2 · postgres 3.4.9 · dev: drizzle-kit 0.31.10 · @types/bun 1.4.2 · typescript 5.9.3; scripts `dev`/`start`/`db:generate`/`db:migrate`) · `tsconfig.json` (bun init default) · `src/index.ts` (Hono, CORS `FRONTEND_ORIGIN`+credentials, `notFound` + `onError` → `{error:{code,message}}`, `GET /api/v1/health` running `select 1` via Drizzle) · `src/env.ts` (zod; PORT coerced, default 4000; exits 1 naming the missing vars) · `src/db/client.ts` · `src/db/schema.ts` (empty) · `drizzle.config.ts` (out `./drizzle`) · `.env.example` (names only). `bun init`'s `index.ts` removed. Existing `.gitignore` already lists `.env` (line 81) — untouched. `src/routes|services|lib` and `drizzle/` exist but are empty, so git will not track them until a later TASK fills them.

**No `.env` exists on this machine** (the owner has not filled one). All runs below used env vars set inline in the shell with a dummy `DATABASE_URL=postgres://x:x@127.0.0.1:1/x` — nothing written to any file, no real DB touched.

`bun install` (fresh, after `rm -rf node_modules`) — tail, no peer warnings:
```
+ drizzle-orm@0.45.2
+ hono@4.13.8
+ postgres@3.4.9
+ zod@4.6.5

26 packages installed [800.00ms]
```
`bunx tsc --noEmit` → clean (exit 0).

Missing `SESSION_SECRET` → `bun run src/index.ts`:
```
Missing or invalid environment variable(s): SESSION_SECRET
exit=1
```
Server up (`Started development server: http://localhost:4000`), then:
```
$ curl -s -i http://localhost:4000/api/v1/health
HTTP/1.1 200 OK
{"status":"ok","db":"down"}          # dummy DATABASE_URL → "down" branch proven

$ curl -s -i http://localhost:4000/api/v1/nope
HTTP/1.1 404 Not Found
{"error":{"code":"NOT_FOUND","message":"No route for GET /api/v1/nope"}}

$ curl -s -i -X OPTIONS -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: GET" .../api/v1/health
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
```
`git status --short` (no `.env` present):
```
?? .env.example
?? bun.lock
?? drizzle.config.ts
?? package.json
?? src/
?? tsconfig.json
```
**UNVERIFIED — `{"status":"ok","db":"ok"}`**: needs the owner's real `DATABASE_URL` in `possibility-back/.env`. Same command (`bun run dev` + the health curl) settles it; the `select 1` success path is the only untested branch. See `## Questions`.

## Questions
- **Q-1 @Sober (2026-09-19, Jason):** `possibility-back/.env` does not exist on this machine, so health `db:"ok"` is UNVERIFIED. Can the owner (via Porter) fill `.env` from `.env.example` on his machine — or is Tanya's run the place this gets proven? Not blocking REVIEW; everything else in the DoD is evidenced.
  > answer (Sober, 2026-09-19): the owner fills `.env` on the machine you run on — raised to Porter as DR-4. Not Tanya's job. Until it lands, `db:"ok"` stays UNVERIFIED and is re-proven by TASK-003's migration DoD, which cannot pass without it. Start TASK-003 code now; the DB steps wait for `.env`.

## Review
**Verdict: DONE** (Sober, 2026-09-19 00:10). Reviewed the evidence against the files in `possibility-back`, not the claim:
- `package.json` exact pins, scripts as specified; `src/env.ts` fail-fast names the missing vars; `src/index.ts` CORS with credentials, `notFound` + `onError` emit the §D6 envelope, health runs `select 1`; `.env.example` names only; `grep` for any real connection string in the repo → none. Matches SPEC-001 §Backend layout.
- Minor, no rework: `drizzle.config.ts` uses `process.env.DATABASE_URL!` directly (drizzle-kit runs outside `env.ts`) — fine, but `db:generate`/`db:migrate` will need `.env` present; Bun auto-loads `.env`, drizzle-kit does not. In TASK-003 run them as `bun --env-file=.env run db:migrate` or with `dotenv` — note it there.
- Open: DoD line 2 (`db:"ok"`) UNVERIFIED — carried into TASK-003 (needs the owner's `.env`, DR-4 via Porter).
