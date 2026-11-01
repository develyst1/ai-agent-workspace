# TASK-002: Accounts — owner seed, login/logout/me, sessions, lockout, admin users API
- Source: SPEC-001 §3.1, §3.2, §3.3 (users rows only), §5 (`users`, `sessions`, `login_attempts`) · REQ-001
- Owner: BE (Jason)
- Status: DONE (SA Sober, 2026-11-01)
- Depends on: TASK-001

- Repo: `corner-chat-back` — Team A claim "Batch 2026-11-01" · base as TASK-001 · git writes: **none**
- Files you may edit (closed list):
  - `src/core/auth.ts` (`requireUser`, `requireOwner` middleware)
  - `src/core/crypto.ts` (token create/hash; keep it to what this TASK needs)
  - `src/modules/auth/**`, `src/modules/admin/users.ts`, `src/modules/admin/index.ts`
  - `src/app.ts` (only: mount the new routers + call the owner seed at start-up)
  - `test/auth.test.ts`, `test/admin-users.test.ts`

## What to do
1. **Owner seed** at start-up: if no `users` row with `role='owner'` exists and `OWNER_EMAIL`/`OWNER_PASSWORD` are set,
   create it (`OWNER_NAME` default `"Owner"`). Never through the API.
2. `POST /auth/login` exactly per §3.2: lower-case + trim the email; `Bun.password.verify`; on success create a 32-byte
   random token (base64url), store **only** its hex SHA-256 in `sessions`, return `{ token, user }`.
   Disabled user with the right password → 403 `ACCOUNT_DISABLED`. **Lockout:** §3.2 rule (5 wrong in a row for one
   email, **no time window** → refused 5 min → 429 + `Retry-After`; unknown emails counted the same; a right password
   resets the count). Use `login_attempts` (`first_failed_at` stays unused).
3. `requireUser`: bearer → hash → `sessions` join `users`; unknown → 401 `UNAUTHENTICATED`; user disabled → 401
   `ACCOUNT_DISABLED`; sets `c.get("user")` = `{ id, role, … }` and updates `last_used_at` at most once a minute.
   `requireOwner` = `requireUser` + `role==='owner'` else 403 `FORBIDDEN`.
4. `POST /auth/logout` (delete this session) → 204 · `GET /me`.
5. Admin users endpoints exactly per §3.3 (list, create, disable, enable, password). Disable and password reset **delete
   all sessions of that user**. Disabling the owner → 400 `CANNOT_DISABLE_OWNER`. Create → 409 `EMAIL_TAKEN` on a duplicate.
   New user → also insert its `user_conditions` row (bar 70, sentences '').
6. `User` JSON exactly per §3.2 (camelCase, `createdAt` ISO). Never return `password_hash`.

## Definition of Done (paste real output for each)
- [ ] `bun test test/auth.test.ts test/admin-users.test.ts` green, covering: login ok · wrong password 401 · disabled 403 ·
      5 wrong → 6th 429 with `Retry-After` · after the lock (fake the clock or set `locked_until` in the past) right password → 200 ·
      token of a disabled user → 401 `ACCOUNT_DISABLED` · password reset → old token 401, old password 401, new 200 ·
      a `role:user` token on `/admin/users` → 403 `FORBIDDEN` · duplicate email → 409.
- [ ] Live, against the dev DB: `curl` login as the seeded owner → token; `POST /admin/users` creates U1; login as U1 → 200;
      U1's token on `GET /admin/users` → 403 (paste the four responses, tokens shortened to 6 chars).
- [ ] `psql "$DATABASE_URL" -c "select token_hash from sessions limit 1"` shows a 64-hex hash, not the token.
- [ ] `git status --porcelain` — only closed-list files.

## Implementation Notes
Test-first: wrote `test/auth.test.ts` (16 tests) and `test/admin-users.test.ts` (11) and ran them RED (admin tests failed on missing routes; `auth.test.ts` could not load for the missing `crypto.ts`/`seed.ts`), then implemented. Working tree only, no git. 2026-11-01.

**Files (all on the closed list; `src/modules/auth/body.ts` and `seed.ts` fall under `src/modules/auth/**`):** `src/core/{crypto,auth}.ts`, `src/modules/auth/{index,body,seed}.ts`, `src/modules/admin/{index,users}.ts`, `src/app.ts` (mounts + seed), the two tests.

**Decided alone (declared — none changes what a client sees beyond SPEC):**
- **Lockout is race-free:** login runs in one transaction that takes `select … for update` on the email's `login_attempts` row, so parallel guesses for one email queue up. The "5" and "5 minutes" are literals in that SQL (comment in the file).
- **Count keeps going after a lock ends** (it resets only on a right password): a wrong guess right after the lock expires is the 6th in a row and locks again. Stricter reading of "5 in a row, no time window"; say if you want a restart at lock end instead.
- Unknown emails get a `login_attempts` row too (SPEC: counted). Cost: an attacker spamming random emails grows that table; no cleanup job is in scope — flagging, not fixing.
- Unknown email still pays one `Bun.password.verify` against a dummy hash (same response time, no enumeration).
- The 429 is built in the login handler with `errorBody(...)` + `Retry-After` header, because `errors.ts` (TASK-001) has no header support and is not on this TASK's list.
- `app.ts`: `await seedOwner(...)` at module load, **skipped when `NODE_ENV==='test'`** (the schema does not exist yet when tests import `app.ts`; `auth.test.ts` calls `seedOwner` itself). The seeded owner also gets a `user_conditions` row (bar 70) like any user.
- `seedOwner` throws loudly on an invalid `OWNER_EMAIL`, an `OWNER_PASSWORD` under 8 characters, or an `OWNER_EMAIL` already used by a non-owner; warns (does not fail) when no owner exists and `OWNER_*` is unset.
- Validation I chose where SPEC is silent: name trimmed 1–100; email `^[^\s@]+@[^\s@]+\.[^\s@]+$`, ≤254; password 8–1024 (login: required, ≤1024); non-UUID `:id` → 404 `NOT_FOUND`; malformed or non-object JSON → 400 `VALIDATION`.
- `disable` also on an already-disabled user → 200 (idempotent); `enable` on an active one → 200. A password reset does **not** clear that email's lockout row.
- Sessions have no expiry (the §5 schema has no column for it); `last_used_at` is touched at most once a minute by a single conditional `UPDATE`.
- Because admin `disable` deletes the sessions, the old token then answers 401 `UNAUTHENTICATED`; `ACCOUNT_DISABLED` (401) is what a token gets when the status flips with its session still present (tested by direct SQL).
- Bun quirk: `await expect(asyncFn()).rejects.toThrow(...)` hung until the test timeout in `bun test` 1.3.14 for the owner-seed test (the same call in a plain script rejects at once); the test captures the rejection with `.then(() => null, e => e)` instead.

**Evidence (real output):**
- RED: `bun run test` before the code → admin tests `(fail)` on missing routes, `auth.test.ts` failed to load.
- `bun test --preload ./test/setup.ts --timeout 20000 test/auth.test.ts test/admin-users.test.ts` → `27 pass · 0 fail · 111 expect() calls · Ran 27 tests across 2 files`. Covers every DoD case: login ok · wrong password 401 · disabled 403 · 5 wrong → 6th 429 with `Retry-After` 291–300 · `locked_until` set in the past → right password 200 and `failed_count=0` · token of a user disabled by SQL → 401 `ACCOUNT_DISABLED` · password reset → old token 401, old password 401, new 200 · `role:user` token on all five admin routes → 403 `FORBIDDEN` · duplicate email (other case) → 409.
- Live, dev DB, `bun src/index.ts` (owner seeded from `.env` at start-up, log `Owner account created for owner@corner-chat.local`):
  1. `POST /auth/login` owner → `200 {"token":"iC31FR...","user":{…"role":"owner","status":"active"…}}`
  2. `POST /admin/users` → `201 {"user":{"id":"7b9822ba-…","name":"U One","email":"u1-21653@test.local","role":"user","status":"active",…}}`
  3. `POST /auth/login` U1 → `200 {"token":"KyPMPT...","user":{…"role":"user"…}}`
  4. `GET /admin/users` with U1's token → `403 {"error":{"code":"FORBIDDEN","message":"Owner only"}}`
- `select token_hash, length(token_hash) from sessions limit 1` (dev DB) → `0593c07877a9673747f88fdddf84c7e820d529e058a8d51977fddaa6c5daf04f | 64`; the owner token was 43 chars of base64url starting `iC31FR`.
- `tsc --noEmit` → 4 errors, **all in `test/line-webhook.test.ts`** (Team B's mid-work file); none in my files. `git status --porcelain --untracked-files=all` → my 10 files are exactly the closed list; the other untracked paths belong to TASK-001/Team B.
- `.env` additions (`OWNER_EMAIL/PASSWORD/NAME`, generated into the file, never printed) are git-ignored.

**UNVERIFIED:** parallel-login behaviour under real concurrency (the row-lock design is read-correct, not load-tested); `Retry-After` is tested as a range, not an exact second.

## Questions
- **For the SA (TASK-001 test now fails because of Team B's migration):** `bun run test` over the whole tree → `68 pass · 3 fail`. Two failures are in my TASK-001 `test/base.test.ts`: "setup created the 15 tables" (`Expected: 15 · Received: 22`) and "running again applies nothing" (`schema_migrations` count 1 → 2), because `migrations/202611010100_line_init.sql` (Team B) now runs too. `base.test.ts` is not in this TASK's closed list, so I did not touch it. Proposed fix, one small edit: assert that the 15 core tables exist and that a second `migrate()` returns `[]`, instead of exact counts. Tell me to do it (or put it in a TASK).
- The third failure is Team B's `test/line-webhook.test.ts` (their RED: missing `src/modules/line/store`, `webhook`) — theirs, not mine.
- SA note 2026-11-01 03:00 (no action needed): SA Team B saw `tsc --noEmit` fail on `test/admin-users.test.ts(77,25)` TS2345
  while this TASK was IN_PROGRESS (a mid-work tree). I re-ran `bunx -p typescript tsc --noEmit -p .` at 03:00 → exit 0.
  The review re-runs it anyway. **BE: keep `tsc` green whenever you stop typing.** Team B builds in the same tree.
  > answer (SA Sober, 2026-11-01) to the `base.test.ts` question: yes, exactly your proposal. Assert that the 15 core tables
  > exist (not an exact table count) and that a second `migrate()` applies nothing. It is now **TASK-005 step 0**, with
  > `test/base.test.ts` added to TASK-005's closed list. Team B's own failing test is theirs.

## Review
**Verdict: DONE** — SA Sober, 2026-11-01. Reviewed against SPEC-001 §3.1–§3.3, §5, REQ-001 (with the PM's amendments) and the
evidence above. Re-run by me: `bun test --preload ./test/setup.ts test/auth.test.ts test/admin-users.test.ts` → `27 pass · 0 fail ·
111 expect()`. `git status` → your 10 files are the closed list; the other untracked paths are TASK-001's and Team B's
(`src/modules/line/**`, `*_line_*` migration). Read `src/core/auth.ts` in full: the bearer goes to SHA-256, then a session join; a
disabled user gets 401 `ACCOUNT_DISABLED`; `requireOwner` → 403. Read the lockout SQL (`for update`, 5 → `now() + 5 minutes`,
reset on success).
Rulings on your declared decisions — all accepted:
- The count keeps going after a lock ends. That is the PM's exact rule ("in a row", reset only on a right sign-in).
- Unknown emails get a row. Growth with no clean-up is a known, accepted risk for round 1 (local only).
- 429 built in the handler, the seed skipped under test, the validation choices, idempotent disable/enable, sessions with no
  expiry: all inside the TASK's latitude. Sessions with no expiry match SPEC §5.
Unverified, accepted: real concurrency on the row lock (the design is right by reading); `Retry-After` checked as a range.
FE TASK-008's live rerun can now run against this.
