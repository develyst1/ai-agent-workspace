# TASK-003: Auth backend — accounts, sessions, guard
- Source: SPEC-001
- Status: REVIEW
- Assignee: Jason (BE)
- Depends on: TASK-001

## What to do
Implement email + password auth exactly as specified in SPEC-001 (§API, §Data
Model, §Flow). In `manager-gold-back`:
- **Schema + migration:** `users` and `sessions` tables per SPEC-001 §Data Model
  (Drizzle schema + generated migration; index on `sessions.user_id`; ON DELETE
  CASCADE from sessions → users).
- **Password hashing:** `Bun.password.hash` (argon2id) on register;
  `Bun.password.verify` on login. Never store/return/log the hash.
- **Endpoints:** `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`,
  `GET /auth/me` with the exact request/response shapes + status codes in SPEC-001.
  Email stored + matched lowercased. Password min length 8. `409` on duplicate.
  **Bad email and bad password both return an identical `401`** (no enumeration);
  on unknown email, still perform a dummy verify before returning 401.
- **Session cookie `mg_session`:** opaque random id ≥32 bytes base64url, stored as
  `sessions.id`; cookie httpOnly + Secure + SameSite=Lax; `expires_at` = now + 30d.
- **Session middleware:** resolves `mg_session` → valid session → attaches `userId`;
  missing/invalid/expired → `401` (delete row if expired). Apply to `/auth/logout`,
  `/auth/me`, and all `/api/*`.
- Add protected `GET /api/health` → `{ ok: true, userId }` (proves the guard).

## Definition of Done
- [x] `bun run migrate` creates `users` + `sessions`.
- [x] `bun test` passes, covering: register→200/cookie set; duplicate email→409;
      login good→200, login bad password→401, unknown email→401 (same body);
      `/auth/me` with cookie→200, without→401; logout→204 then `/auth/me`→401;
      `/api/health` without session→401, with session→200.
- [x] **Isolation check (automated or scripted curl):** two registered users;
      user A's session cannot read a record scoped to user B (demonstrated on
      `/api/health` returning A's own `userId`, and documented as the pattern
      REQ-002 tables must follow). Include the commands in Implementation Notes.
- [x] No `password_hash` appears in any API response (grep the test output/JSON).
- [x] Cookie attributes verified (httpOnly + SameSite=Lax present in `Set-Cookie`).

## Implementation Notes
Implemented by Jason on 2026-07-27 in `H:\manager-gold\manager-gold-back`
(branch `dong`, commit `284aa11`).

**Files changed (new unless noted):**
- `src/db/schema.ts` (mod) — `users` (id/email UNIQUE/password_hash/display_name/
  created_at) + `sessions` (id PK = cookie value, user_id FK→users ON DELETE CASCADE,
  created_at, expires_at) with `index sessions_user_id_idx`.
- `src/db/index.ts` (mod) — `PRAGMA foreign_keys = ON` so the cascade is enforced.
- `drizzle/0000_pretty_green_goblin.sql` (+ snapshot/journal) — first real migration.
- `src/http.ts` — shared `AppEnv` type (`Variables.userId`).
- `src/auth/service.ts` — validation (`parseRegister`/`parseLogin`), argon2id
  `Bun.password` hash/verify, `verifyDummy` (unknown-email timing guard),
  opaque 32-byte base64url session id + cookie (httpOnly/Secure/SameSite=Lax/30d),
  `startSession`/`endSession`, and the `requireAuth` guard.
- `src/auth/routes.ts` — `POST /auth/register|login|logout`, `GET /auth/me`.
- `src/app.ts` (mod) — mounts auth routes; `app.use("/api/*", requireAuth)`;
  protected `GET /api/health`. CORS stays first so preflight is answered before the guard.
- `bunfig.toml` + `test/setup.ts` — tests run against a throwaway `./test.sqlite`
  (migrated fresh), never the dev DB.
- `test/auth.test.ts` — 11 auth tests (smoke suite still 3).

**Verification (evidence):**
- `bun run db:generate` → `2 tables` (users, sessions); `bun run migrate` → `migrate: ok`;
  dev DB now has `__drizzle_migrations, sessions, users`.
- `bun test` → **14 pass / 0 fail** (50 assertions) across `smoke` + `auth`.
- Live curl against `:4020` (server up, register `live-*@example.com`):
  - register → `201`; `Set-Cookie: mg_session=…; Max-Age=2592000; Path=/; HttpOnly;
    Secure; SameSite=Lax`; CORS `Allow-Origin: http://localhost:3020` + `Allow-Credentials: true`;
    body has no `password`/`hash`.
  - `GET /api/health` **with** cookie → `200 {ok:true,userId:<A>}`; **without** → `401`.
  - login wrong password → `401 {"error":"unauthorized"}`; login unknown email →
    **identical** `401 {"error":"unauthorized"}` (no enumeration).
  - logout → `204`; subsequent `/auth/me` → `401` (session invalidated).

**Isolation (DoD) — automated + reproducible curl:**
- Automated: `auth.test.ts` "each session only ever sees its own userId" registers
  users A and B and asserts `health.userId === own id` and `!== the other's` — the exact
  pattern every REQ-002 domain table must follow (filter every query by the guard's
  `c.get("userId")`, never a client-supplied id).
- Scripted curl equivalent:
  ```bash
  curl -s -c a.txt -X POST :4020/auth/register -H 'Content-Type: application/json' -d '{"email":"a@x.com","password":"supersecret"}'
  curl -s -c b.txt -X POST :4020/auth/register -H 'Content-Type: application/json' -d '{"email":"b@x.com","password":"supersecret"}'
  curl -s -b a.txt :4020/api/health   # -> {"ok":true,"userId":"<A>"}
  curl -s -b b.txt :4020/api/health   # -> {"ok":true,"userId":"<B>"}  (A never sees B)
  ```

**Notes for review:**
- Login validation returns `400` only for malformed requests (bad email format /
  missing password); well-formed-but-wrong credentials return the uniform `401`.
  Password-length policy (≥8) is enforced on register only.
- `Secure` cookie is set always (correct on `localhost`, which is a secure context).
- `PRAGMA foreign_keys=ON` added — SQLite otherwise ignores the CASCADE.
- Relay handled: CORS middleware is registered before the guard, so `OPTIONS`
  preflight on `/auth/*` and `/api/*` returns `Allow-Credentials: true` (test:
  "CORS preflight"). Addresses your note re: Fern's JSON content-type preflighting GETs.
- Commit is local on `dong` only (not pushed), per baseline §6.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review
(Sober fills this in at REVIEW.)
