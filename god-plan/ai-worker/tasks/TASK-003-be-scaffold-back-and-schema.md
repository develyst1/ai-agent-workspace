# TASK-003: Back scaffold — Hono, Drizzle schema + migration, env, `owner:set`, health, deploy shape, PGlite tests
- Source: SPEC-002 (§Overview, §Data Model, §Testability P4/P5, §Environment keys, §Non-functional)
- Owner: BE (Jason)
- Status: DONE (2026-11-09, SA review of steps 6–8: the real-Postgres gate passed). Earlier: REVIEW (Jason, steps 6–8 done) · (2026-11-09: TASK-001 DONE, `god_plan` created by Atom for the owner). Do steps 6–8. **If your session's permission check
  refuses any of them** (likely candidates: writing `.env` from `call-scribe-back/.env`, `db:migrate`, `owner:set`, booting on the real DB): stop at
  that step, don't go around it, and write in `## Questions` the **exact** command(s) still needed, in order, so the PM can ask the owner
  once for all of them. Earlier: BLOCKED (waiting: TASK-001, for steps 6–7). Steps 1–5 were reviewed and **accepted** by the SA on 2026-11-08 (see §Review).
- **Steps 6–7 = REQ-001's real-Postgres gate (SPEC-002 §Close-out).** Added by the SA on 2026-11-09. After TASK-001 passes, run in order and
  paste each: step 6 (`.env` written and ignored, `bun run db:migrate`), step 7 (`owner:set` with a synthetic owner →
  `god-plan-qa.env` beside the repos). Then **step 8, new:** start the real `src/index.ts` on `god_plan` (`LLM_GATEWAY_URL` = the stand-in
  on :4399 only), and by curl: health · owner sign-in · create project + task · stuck with reason · make an invite (I1) + read it (I2 with
  `ownerName`) · S1 summary (0 gateway calls). Stop the server by its own PID. Values redacted, cookies never shown. If `db:migrate`
  fails on the server's Postgres version (no `gen_random_uuid`), stop and report. Don't add the extension yourself.
- Depends on: TASK-001 for steps 6–7 only
- Base, read by the SA 2026-11-08: `god-plan-back` on `atom`, HEAD `277bcc9 Initial commit`. The tree holds only `README.md`, so
  `README.md` in the closed list means **replace its content**.
- Git: **none by you.** Leave the work in the tree; git happens only on the owner's command, typed by the SA.

## What to do
Repo: `god-plan-back` (path in workspace-root `machine.local.md`). Before writing, confirm `git branch --show-current` → `atom`.
1. `bun init` a TypeScript project. Dependencies: `hono`, `drizzle-orm`, `postgres`; dev: `drizzle-kit`, `@electric-sql/pglite`,
   `@types/bun`. Nothing else without asking.
2. Files (closed list): `package.json`, `tsconfig.json`, `.gitignore` (must ignore `.env`, `dist/`, `node_modules/`), `.env.example`
   (every key in SPEC-002 §Environment keys, one comment line each, **no values**), `drizzle.config.ts`, `src/index.ts`
   (`Bun.serve` with the Hono app, reads `PORT`/`HOST`), `src/app.ts` (Hono app; `GET /api/health` → `{ "ok": true }`; the error
   body shape from SPEC-002 for unknown routes → 404 `NOT_FOUND`), `src/env.ts` (reads and checks env; fails fast naming the
   missing key, **never printing values**), `src/db/schema.ts` (all tables of SPEC-002 §Data Model, including the CHECKs and the
   partial unique index), `src/db/client.ts` (postgres.js for runtime; a factory that accepts a PGlite instance for tests),
   `drizzle/` (generated migration), `scripts/owner-set.ts`, `test/setup.ts` (PGlite in memory + migrations applied),
   `test/schema.test.ts`, `README.md` (how to run, 10 lines).
3. Scripts in `package.json`: `dev` (`bun --watch src/index.ts`), `test` (`bun test`), `db:generate`, `db:migrate`,
   `owner:set` (`bun scripts/owner-set.ts`), `build`:
   `bun build src/index.ts --compile --minify --target=bun-linux-x64 --outfile dist/god-plan-back` (`deploy-ready-build` skill).
4. Generate the migration. Read it against SPEC-002's SQL: same tables, columns, CHECKs, indexes. Note any difference in
   Implementation Notes.
5. `test/schema.test.ts` against PGlite proves the constraints: a second owner is refused · a `stuck` task without a reason is
   refused · a non-stuck task with a reason is refused · an uppercase email is refused · a title of 201 characters is refused.
6. **Needs TASK-001 done.** Write `.env` (git-ignored, check first) per SPEC-001 Q-S1: `DATABASE_URL` = the owner's URL from
   `call-scribe-back/.env` with the database name changed to `god_plan`, **never printed**. Other keys per SPEC-002 dev values.
   Then `bun run db:migrate`.
7. `owner:set` per SPEC-002 P4: stdin lines email, name, password. Run it once on dev with a **synthetic** owner (e.g.
   `owner@godplan.test`, `เจ้าของทดสอบ`, a generated 16-character password). Write `god-plan-qa.env` in the folder that holds
   the code repos (SPEC-002 P4). Never print the password.

## Definition of Done
- [ ] `bun test` → all pass, including the 5 constraint cases. Paste the output.
- [ ] `bun run build` → `dist/god-plan-back` exists, and `file dist/god-plan-back` says ELF x86-64. Paste both.
- [ ] `bun run dev` then `curl -s http://127.0.0.1:4310/api/health` → `{"ok":true}`, and `curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:4310/api/nope` → `404`. Paste both.
- [ ] `git check-ignore .env` → `.env`; `grep -c '=' .env.example` equals the number of keys in SPEC-002 (7). Paste both.
- [ ] (after TASK-001) `bun run db:migrate` output pasted, values redacted. `owner:set` prints `owner created`.
      `ls -l <codebases folder>/god-plan-qa.env` pasted (no content).
- [ ] `git status --short` pasted, so the SA sees the whole file list.

## Implementation Notes
**Steps 1–5 done (Jason, 2026-11-08). Steps 6–7 and their two DoD lines: NOT RUN — blocked on TASK-001.** Repo `god-plan-back`, branch `atom` (confirmed), nothing committed.

Files (closed list; `index.ts` from `bun init` removed): `package.json`, `tsconfig.json` (bun init default), `.gitignore` (bun init default, already ignores `.env`, `dist`, `node_modules`), `.env.example`, `drizzle.config.ts`, `src/{index,app,env}.ts`, `src/db/{schema,client}.ts`, `drizzle/0000_calm_zuras.sql` + `meta/`, `scripts/owner-set.ts`, `test/{setup,schema}.test.ts`, `README.md` (replaced), `bun.lock`. Deps: hono 4.13.17, drizzle-orm 0.45.4, postgres 4.1.0; dev drizzle-kit, @electric-sql/pglite 0.5.15, @types/bun. Bun 1.4.4.

**Migration vs SPEC-002 SQL (read line by line): same 8 tables, columns, CHECKs, FKs, indexes, partial unique `users_one_owner`.** Differences:
1. No `CREATE EXTENSION pgcrypto` — drizzle emits `gen_random_uuid()`, built in from PG13. `UNVERIFIED` on the owner's server: its Postgres version is unknown; `bun run db:migrate` (step 6) settles it. If it is < 13, add the extension line by hand.
2. `tasks.stuck_reason` length ≤ 500 is its own CHECK (`tasks_stuck_reason_len_check`), not inline; constraint names are drizzle's/mine. Same effect.

Decisions (mine, reversible): `src/env.ts` requires `FRONT_ORIGIN` and `LLM_GATEWAY_URL`, defaults only `PORT`/`HOST`/`COOKIE_SECURE` (no silent fallback on the others). `DATABASE_URL` is asked for only by code that connects (`databaseUrl()`), so health and tests run without it. `INVITE_TTL_SECONDS` is in `.env.example` (7 keys) but not in `env.ts` — TASK-005 adds it there. `owner-set.ts` exports `setOwner(db, …)` so PGlite can test it (create → update → sessions deleted; one extra test beyond the 5 required). Test refusals assert the constraint name, so they cannot pass on an unrelated error.

Evidence (all real output):
```
$ bun test
 8 pass
 0 fail
 20 expect() calls
Ran 8 tests across 1 file.
```
(5 required constraint cases: second owner → `users_one_owner`; uppercase email → `users_email_check`; stuck w/o reason and non-stuck with reason → `tasks_stuck_reason_check`; 201-char title → `tasks_title_check` (200 accepted). Plus owner:set create/update and the env fail-fast test.) `bun x tsc --noEmit` → no output.
```
$ bun run build
 [420ms] compile  dist/god-plan-back
-rwxr-xr-x 1 box box 109144240 Nov  8 11:37 dist/god-plan-back
```
`file` is not installed here; ELF header read instead: `7f 45 4c 46 02 01 01` + machine `3e` → `ELF class64 machine x86-64`.
```
$ FRONT_ORIGIN=http://127.0.0.1:4300 LLM_GATEWAY_URL=http://127.0.0.1:4399 bun run dev   (then)
$ curl -s http://127.0.0.1:4310/api/health                        → {"ok":true}
$ curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:4310/api/nope → 404   (body {"error":{"code":"NOT_FOUND"}})
```
Dev server stopped afterwards (port 4310 free). Missing key: `env -u FRONT_ORIGIN bun src/index.ts` → `error: Missing required environment variable: FRONT_ORIGIN`.
```
$ git check-ignore .env      → .env
$ grep -c '=' .env.example   → 7
$ git status --short
 M README.md
?? .env.example  ?? .gitignore  ?? bun.lock  ?? drizzle.config.ts  ?? drizzle/  ?? package.json
?? scripts/  ?? src/  ?? test/  ?? tsconfig.json
```
`UNVERIFIED`: `db:migrate` on `god_plan`, `owner:set` against real Postgres (only PGlite), `god-plan-qa.env` — all need TASK-001. No `.env` written yet. `/security-review`: not run (no auth/query surface yet beyond `owner-set`'s password hashing).
*(The three UNVERIFIED items above are now settled by steps 6–8 below.)*

### Steps 6–8 on the real dev Postgres (Jason, 2026-11-09) — no step was refused
No connection string, host, user or password appears in this TASK or the log (the connection-string grep from the TASK-001 DoD, run on this file and on `log/2026-11-09.md` → `0` and `0`). All values below are redacted by construction: I ran scratch scripts (in the session scratchpad, not in any repo or the workspace) that read the one key and never print it.

**Step 6 — `.env`.** `git check-ignore .env` (before writing) → `.env`. Written with `DATABASE_URL` = the owner's connection from `call-scribe-back/.env` with the database name replaced by `god_plan` (SPEC-001 Q-S1; owner 2026-11-08 00:39: *"ใช้ DB_URL แบบเดิมเลย แค่สร้าง database ของโปรเจคนี้เอง"*), plus the SPEC-002 dev values. File mode `-rw-------`, 7 keys: `PORT, HOST, DATABASE_URL, FRONT_ORIGIN, COOKIE_SECURE, LLM_GATEWAY_URL, INVITE_TTL_SECONDS`; `LLM_GATEWAY_URL` is the stand-in on :4399 only. `git check-ignore .env` after → `.env`.
```
$ bun run db:migrate        (spinner frames removed, no values in the output)
$ drizzle-kit migrate
Reading config file '…/drizzle.config.ts'
Using 'postgres' driver for database querying
[✓] migrations applied successfully!          exit=0
```
That also answers the two open questions: **`god_plan` exists** (TASK-001's proof, SA's condition), and **`gen_random_uuid()` works on the server** (the table defaults were accepted; no pgcrypto line needed). I added no extension.

**Step 7 — `owner:set`.** Synthetic owner `owner@godplan.test` / `เจ้าของทดสอบ`, a generated 16-character password passed through stdin only:
```
owner:set exit 0 | stdout: ['owner created']
$ ls -l /workspace/codebases/god-plan-qa.env
-rw------- 1 box box 63 Nov  9 14:58 god-plan-qa.env       (keys OWNER_EMAIL, OWNER_PASSWORD; content never shown)
```
It sits in the codebases folder beside the repos, not in the workspace.

**Step 8 — the real `src/index.ts` on `god_plan`** (stand-in gateway on :4399 started for it; the sign-in credentials read from `god-plan-qa.env` into shell variables, cookie jar in scratch and deleted; ids shortened):
```
god-plan-back listening on 127.0.0.1:4310
GET /api/health                       → {"ok":true}
POST /api/auth/sign-in (owner)        → {"user":{"id":"…","email":"owner@godplan.test","displayName":"เจ้าของทดสอบ","isOwner":true}}  http=200
POST /api/projects                    → {"project":{"id":"…","name":"BE gate 2026-11-09 (synthetic)","description":"TASK-003 step 8, Jason","createdAt":"2026-11-09T07:58:36.565Z"}}
POST …/tasks                          → {"task":{… "title":"งานทดสอบ real Postgres","status":"todo","stuckReason":null,"commentCount":0 …}}
PATCH status stuck, no reason         → {"error":{"code":"VALIDATION","field":"stuckReason","rule":"required"}}  http=400
PATCH status stuck + reason           → {"task":{… "status":"stuck","stuckReason":"รอข้อมูล" …}}  http=200
POST …/invites (I1)                   → {"url":"http://127.0.0.1:4300/invite/<token>","expiresAt":"2026-11-16T07:58:45.750Z"}
GET /api/invites/<token> (I2, no cookie) → {"projectName":"BE gate 2026-11-09 (synthetic)","inviteeName":"น้องทดสอบ","ownerName":"เจ้าของทดสอบ","expiresAt":"2026-11-16T07:58:45.750Z"}  http=200
GET …/summary (S1)                    → {"stuck":[{"taskId":"…","title":"งานทดสอบ real Postgres","stuckReason":"รอข้อมูล"}],"ai":null}  http=200
stand-in calls after S1: 0
listeners left on 4310 / 4399: 0       (stopped by their port's own PID)
```
So on **real Postgres**: the CHECK for stuck/reason, the ordinary inserts and updates, the invite link and I2's `ownerName` all behave as they did on PGlite, and S1 made 0 gateway calls.

**Left behind on `god_plan` (synthetic, by design of the step):** the owner row; one project "BE gate 2026-11-09 (synthetic)" with one stuck task; one unused invite for `น้องทดสอบ` (7-day link, token not stored by me and not shown). There is no delete-project route and I run no SQL, so I did not clean them up. QA may want a fresh project name; the seed for her TEST-001 is hers.
`UNVERIFIED` still: true row-lock timing of two parallel invite accepts on real Postgres (not part of step 8; a script that fires two accepts at the real server would settle it); `bun run build` binary booted on `god_plan` (the binary was built in step 3, but step 8 ran `bun src/index.ts`); `/security-review` not run.

## Questions

## Review
**Steps 1–5: accepted. Sober (SA), 2026-11-08.** The TASK is not DONE until steps 6–7 run after TASK-001.
- Re-ran myself in `god-plan-back`: `bun test` → 8 pass, 0 fail · `bun run build` → `dist/god-plan-back` compiled. Its header
  `7f 45 4c 46 02 01 01 … 3e 00` = ELF64 x86-64 (`file` is not installed; I read the bytes with `od`).
- `git status --short` matches the closed list. `README.md` is the only tracked change. `.gitignore` covers `.env`, `.env.local`,
  `dist`, `node_modules`. `.env.example` has the 7 keys, each with one line of comment and no values (P5).
- Migration `drizzle/0000_*.sql` read against SPEC-002: every table, CHECK, FK, cascade and index is present, as is the partial unique
  `users_one_owner`. Both differences Jason noted are accepted. The missing pgcrypto line is fine on PG ≥ 13, and step 6 settles it.
  Splitting the stuck_reason length CHECK into its own constraint is equivalent.
- `scripts/owner-set.ts`: it never prints the password or the raw error (only the code), and it deletes sessions on update (P4). Good.
- Jason's decisions are accepted: `env.ts` fails fast without printing values, and `DATABASE_URL` is required only where a connection opens.
- Nit, no action: `package.json` `peerDependencies: { typescript: "^7" }` is a `bun init` default. Leave it.
- `/security-review`: not needed yet (no routes). It is required on TASK-004/005.

**Steps 6–8: DONE — Sober (SA), 2026-11-09. REQ-001's real-Postgres gate (SPEC-002 §Close-out) is passed.**
- Re-checked myself: `git check-ignore .env` → `.env`, mode `600` · `god-plan-qa.env` beside the repos, mode `600` · the connection-string grep on this TASK
  and `log/2026-11-09.md` → `0` / `0` · `drizzle/` holds only `0000_calm_zuras.sql` + `meta` (no extra migration).
- Accepted: `db:migrate` exit 0 on `god_plan`. That also closes TASK-001's proof (the database exists) and the pgcrypto question (`gen_random_uuid`
  works). `owner:set` → `owner created`. The full curl list on the **real** `src/index.ts` covers health, sign-in, project, task, the stuck CHECK
  (400 then 200), I1, I2 with `ownerName`, and S1 with 0 gateway calls. No step was refused. Nothing secret was printed.
- Synthetic leftovers on `god_plan` (one owner, one project with a stuck task, one unused invite) are accepted. They are synthetic and harmless, and QA seeds her own.
- `UNVERIFIED`, carried and **not** gating: parallel-accept row-lock timing on real Postgres, and the compiled binary booted on `god_plan`. Both belong at
  the release / deploy gate.
