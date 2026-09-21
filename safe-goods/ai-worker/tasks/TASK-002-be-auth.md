# TASK-002: BE auth — register / login / me, JWT middleware, role guard
- Source: SPEC-001
- Owner: BE (Jason)
- Status: DONE (2026-09-21, Sober)
- Depends on: TASK-001

## What to do
Implement SPEC-001 endpoints 2, 3, 4 and the two middlewares every protected route
will use. Contract shapes: SPEC-001 §Shared shapes (`Me`) and §Endpoints rows 2–4.

1. `src/routes/auth.ts`
   - `POST /api/v1/auth/register` — zod: `displayName` 1..50, `email` (email, stored
     lower-cased), `password` 8..72. Duplicate email → `409 EMAIL_TAKEN`. Hash with
     `Bun.password.hash(password, { algorithm: "argon2id" })`. Returns `201 { token, user: Me }`.
   - `POST /api/v1/auth/login` — wrong email **or** wrong password → the same
     `401 UNAUTHENTICATED` "invalid credentials" (do not reveal which). Returns `{ token, user: Me }`.
   - `GET /api/v1/auth/me` — requires auth; returns `Me`.
2. Token: `hono/jwt` `sign({ sub: user.id, role: user.role, exp: now + 24h }, JWT_SECRET, "HS256")`.
3. `src/middleware/auth.ts`
   - `requireAuth`: reads `Authorization: Bearer <jwt>`; missing/invalid/expired →
     `401 UNAUTHENTICATED`; loads the user row; sets `c.var.user` (id, role, displayName).
   - `requireAdmin`: after `requireAuth`; `role !== "ADMIN"` → `403 FORBIDDEN`.
4. `src/domain/credit.ts`: `goodCloseCount(userId)` = count of rooms with
   `status = 'COMPLETED'` and (`buyer_id = userId` or `seller_id = userId`). Used by
   `Me` and (TASK-003) `UserPublic`. Returns 0 now — there are no rooms yet.
5. `bun test`: a test for register→login→me happy path and for duplicate email, using
   an in-memory SQLite (`DATABASE_PATH=:memory:`) — keep the test harness in `src/**/*.test.ts`.

## Definition of Done
- [x] `curl -s -X POST localhost:3001/api/v1/auth/register -H 'content-type: application/json' -d '{"displayName":"Tanya","email":"t1@local.test","password":"password1"}'` → `201` with `token` and `user.role = "USER"` — paste.
- [x] Same call again → `409` `EMAIL_TAKEN` — paste.
- [x] Login with the seeded admin → `user.role = "ADMIN"`; login with a wrong password → `401 UNAUTHENTICATED` — paste both.
- [x] `GET /api/v1/auth/me` with the token → `Me`; without a token → `401`; with a garbage token → `401` — paste all three.
- [x] `bun test` output pasted, all green.
- [x] Password hashes never appear in any response (grep the pasted outputs).

## Implementation Notes
(Jason, 2026-09-20. Local only — `data/safe-goods.sqlite`, server `bun src/index.ts` on 3001. No git write. Tokens below are local throwaway JWTs signed with the `.env.example` placeholder secret.)

**Files:** `src/routes/auth.ts` (register / login / me), `src/middleware/auth.ts` (`requireAuth`, `requireAdmin`, `AuthEnv` type for `c.var.user`), `src/lib/jwt.ts` (`signToken` HS256 24 h `{ sub, role, exp }`, `verifyToken`), `src/domain/credit.ts` (`goodCloseCount(db, userId)` = COUNT rooms COMPLETED where buyer or seller), `src/serializers/user.ts` (`toMe`, `toUserPublic` — TASK-003 reuses the latter). Mounted in `src/app.ts` as `api.route("/auth", auth)`.
Email is lower-cased before store/lookup (plus the DB's COLLATE NOCASE). `requireAdmin` exists and is unit-tested only indirectly (no admin route yet) — TASK-004 wires it.
**Test harness:** `bunfig.toml` preloads `src/test/setup.ts` (`DATABASE_PATH=:memory:`, `JWT_SECRET=test-secret`); `src/db/seed.ts` now exports `seed()` and only self-runs as main; `src/test/helpers.ts` (`api()`, `readJson()`). `src/routes/auth.test.ts`: happy path, duplicate email (case-insensitive), validation, wrong-pw vs unknown-email same 401, seeded admin role, me without / garbage token.

**DoD evidence:**
```
$ curl -s -X POST localhost:3001/api/v1/auth/register -H 'content-type: application/json' -d '{"displayName":"Tanya","email":"t1@local.test","password":"password1"}'
{"success":true,"data":{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjZWQ3MDdkNS0wZmJmLTRjMDctOTgxZi01ODNjYWFlZjFlYjgiLCJyb2xlIjoiVVNFUiIsImV4cCI6MTc5MDAwODg5MX0.WJ3P4mK5cwcEfzH5E20hFRDkAoOuvaa6dY3NOsJxI14","user":{"id":"ced707d5-0fbf-4c07-981f-583caaef1eb8","email":"t1@local.test","displayName":"Tanya","role":"USER","credit":{"goodCloseCount":0}}}}
HTTP 201
$ (same call again)
{"success":false,"error":{"code":"EMAIL_TAKEN","message":"email already registered"}}
HTTP 409
$ curl -s -X POST localhost:3001/api/v1/auth/login -H 'content-type: application/json' -d '{"email":"admin@local.test","password":"admin1234"}'
{"success":true,"data":{"token":"eyJ…(HS256)…","user":{"id":"fee00967-7743-4e31-b851-0577126f432a","email":"admin@local.test","displayName":"Admin","role":"ADMIN","credit":{"goodCloseCount":0}}}}
HTTP 200
$ curl -s -X POST localhost:3001/api/v1/auth/login -H 'content-type: application/json' -d '{"email":"admin@local.test","password":"wrong"}'
{"success":false,"error":{"code":"UNAUTHENTICATED","message":"invalid credentials"}}
HTTP 401
$ curl -s localhost:3001/api/v1/auth/me -H "Authorization: Bearer <Tanya's token>"
{"success":true,"data":{"id":"ced707d5-0fbf-4c07-981f-583caaef1eb8","email":"t1@local.test","displayName":"Tanya","role":"USER","credit":{"goodCloseCount":0}}}
HTTP 200
$ curl -s localhost:3001/api/v1/auth/me
{"success":false,"error":{"code":"UNAUTHENTICATED","message":"missing bearer token"}}
HTTP 401
$ curl -s localhost:3001/api/v1/auth/me -H "Authorization: Bearer garbage.token.here"
{"success":false,"error":{"code":"UNAUTHENTICATED","message":"invalid or expired token"}}
HTTP 401
```
Password hashes: no `argon2` / `password_hash` / `passwordHash` string appears in any output above (the tests assert it too). `bunx tsc --noEmit` → exit 0.

**`bun test`:**
```
src\app.test.ts:
src\routes\auth.test.ts:
 10 pass
 0 fail
 38 expect() calls
Ran 10 tests across 2 files. [579.00ms]
```

**`git status --short`:** ` M .gitignore`, ` M README.md`, `?? .env.example bun.lock bunfig.toml drizzle.config.ts drizzle/ package.json src/ tsconfig.json` — no commit/branch/tag.

**UNVERIFIED:** token expiry after 24 h (would settle it: sign a token with `exp` in the past and call `/me` → 401; the garbage-token path exercises the same `verifyToken` catch).

## Questions

## Review
**Verdict: DONE (Sober, 2026-09-21).** Evidence complete for every DoD line; re-ran the suite (46/46) and logged in as `ADMIN@local.test` (upper-case) myself → 200, so the NOCASE + lower-casing pair works. Same 401 for wrong password and unknown email, as specified. Expiry path is a reasonable UNVERIFIED — the garbage-token test exercises the same catch; accepted.
Unblocks TASK-006 (Fern).
