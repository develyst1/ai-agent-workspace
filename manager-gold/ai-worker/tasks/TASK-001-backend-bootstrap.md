# TASK-001: Backend bootstrap (Bun + Hono + Drizzle/SQLite)
- Source: SPEC-001
- Status: DONE
- Assignee: Jason (BE)
- Depends on: none

## What to do
Stand up a runnable backend skeleton in `H:\manager-gold\manager-gold-back`.
- Init a Bun + Hono + TypeScript project (`bun init`; add `hono`, `drizzle-orm`,
  `drizzle-kit`). SQLite via Bun's built-in `bun:sqlite` driver + Drizzle.
- App entry serves on `PORT` (default **4020**). Add **CORS** allowing
  `FRONT_ORIGIN` (default `http://localhost:3020`) with `credentials: true`.
- Wire Drizzle: a `db` module, `drizzle.config.ts`, and a `migrate` step that
  runs on start (or a `bun run migrate` script). DB file from `DATABASE_URL`
  (default `./manager-gold.sqlite`, git-ignored).
- Add a public route `GET /` → `{ ok: true, service: "manager-gold-back" }`
  (no auth) so the server is verifiably up. (The protected `/api/health` is
  added in TASK-003 once the session middleware exists.)
- Commit `.env.example` with `PORT`, `DATABASE_URL`, `FRONT_ORIGIN`, `NODE_ENV`.
  Confirm `.env` and `*.sqlite` are git-ignored (they already are).
- `package.json` scripts: `dev` (watch), `migrate`, `test`.

Follow `../architecture-baseline.md` for all conventions. Do NOT build auth here.

## Definition of Done
- [x] `bun install` succeeds; repo has no committed `node_modules`/`.env`/`*.sqlite`.
- [x] `bun run dev` starts the server on :4020 with no errors.
- [x] `curl http://localhost:4020/` returns `{ "ok": true, "service": "manager-gold-back" }`.
- [x] A cross-origin request from `http://localhost:3020` passes CORS (preflight OK, `Access-Control-Allow-Credentials: true`).
- [x] Drizzle migrate runs cleanly and creates the SQLite file (empty schema is fine at this stage).
- [x] `.env.example` committed with the four keys above.

## Implementation Notes
Implemented by Jason on 2026-07-27 in `H:\manager-gold\manager-gold-back`
(branch `dong`, commit `9aff7f1`).

**What changed (all new unless noted):**
- `package.json` — `type: module`; scripts `dev` (watch), `start`, `migrate`,
  `db:generate`, `test`. Deps: `hono@4.12.32`, `drizzle-orm@0.45.2`;
  dev: `drizzle-kit@0.31.10`, `@types/bun`, `typescript`. `bun.lock` committed.
- `tsconfig.json` — Bun/strict config.
- `src/env.ts` — env with defaults (PORT 4020, DATABASE_URL ./manager-gold.sqlite,
  FRONT_ORIGIN http://localhost:3020, NODE_ENV). Bun auto-loads `.env`.
- `src/app.ts` — Hono app (exported for tests); `hono/cors` with
  `origin=FRONT_ORIGIN, credentials:true`; `GET /` → `{ok:true, service:"manager-gold-back"}`.
- `src/index.ts` — entry: runs migrations then serves via Bun `export default {port, fetch}`.
- `src/db/index.ts` — Drizzle over `bun:sqlite` (opening the DB creates the file).
- `src/db/schema.ts` — intentionally empty (auth tables are TASK-003).
- `src/db/migrate.ts` — `runMigrations()`; applies migrations if a journal exists;
  runnable via `bun run migrate`.
- `drizzle.config.ts` + `drizzle/meta/_journal.json` (empty, from `db:generate`).
- `.env.example` — the four keys. `.gitignore` already covers `.env` + `*.sqlite`
  (verified via `git check-ignore`).
- `README.md` — setup/run/test/env/layout.
- `test/smoke.test.ts` — GET / body + CORS credentials + preflight.

**Verification (evidence):**
- `bun install` → 0 errors; no `node_modules`/`.env`/`*.sqlite` tracked
  (`git ls-files` clean of them).
- `bun run migrate` → `migrate: ok`; `manager-gold.sqlite` created (12 KB).
- `bun run dev` → `manager-gold-back listening on http://localhost:4020` (no errors).
- `curl http://localhost:4020/` → `{"ok":true,"service":"manager-gold-back"}`.
- CORS preflight `OPTIONS /` with `Origin: http://localhost:3020` →
  `204`, `Access-Control-Allow-Origin: http://localhost:3020`,
  `Access-Control-Allow-Credentials: true`.
- `bun test` → **3 pass / 0 fail** (6 assertions).

**Notes for review:**
- `bun.lock` is committed (workspace house style). Not pushed to origin — commit
  is local on `dong` only; say the word if you want it pushed.
- DB schema is deliberately empty here; TASK-003 adds `users`/`sessions` and the
  first real migration, plus `/api/health` behind the session guard.
- DoD checklist below all ticked.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE** — Sober, 2026-07-27 (reviewed commit `9aff7f1` on branch `dong`).

Checked the real code against SPEC-001 + baseline, and independently verified hygiene:
- **Git hygiene ✅** `git ls-files` = source + config + `bun.lock` only; `git check-ignore`
  confirms `.env`, `*.sqlite`, `node_modules` are ignored. No secrets/DB/deps committed.
- **Contract ✅** `app.ts`: CORS `origin: FRONT_ORIGIN` (explicit, credentials:true, no
  wildcard — correct for cookie auth); `GET /` returns the exact `{ok:true,
  service:"manager-gold-back"}`. App exported apart from the server entry for tests.
- **Conventions ✅** `env.ts` defaults match baseline §2/§4 (PORT 4020, DB path, FRONT_ORIGIN,
  NODE_ENV); `index.ts` migrate-on-start; `db/migrate.ts` guards on the journal so the empty
  bootstrap schema is a clean no-op.
- **Scope discipline ✅** No auth built; `/api/health` and the real schema correctly deferred
  to TASK-003. Surgical — every file traces to this task.
- **Tests ✅** `test/smoke.test.ts` covers body + CORS credentials + preflight (matches DoD).

Minor, non-blocking (no action needed): `typescript ^7.0.2` in devDeps — accepted since
`bun install` + `bun test` pass as reported; note it if a version pin ever bites.
Optional: keep `bun.lock` committed (workspace house style — fine). No need to push `dong`
yet; that's the human's call at integration time.

DoD: all 6 items met. → TASK-003 (auth backend) is now unblocked.
