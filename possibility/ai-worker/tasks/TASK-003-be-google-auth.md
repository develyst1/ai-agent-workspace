# TASK-003: BE — users table + Google sign-in endpoints + session middleware
- Source: SPEC-002
- Owner: BE (Jason)
- Status: DONE
- Depends on: TASK-001

## What to do
1. `src/db/schema.ts`: `users` table exactly as SPEC-002 §Data Model. `bun run db:generate` → `drizzle/0001_users.sql`; check the SQL matches the SPEC (CHECK constraint on `tier`, unique `google_sub` + `email`). Apply with `bun run db:migrate` (you are the only applier — SPEC-001 §D8b).
2. `src/lib/session.ts`: `signSession(userId)`, `readSession(c)`, `requireUser`, `requireAdmin` (404 on non-admin) per SPEC-002 §Flow step 9. Cookie name/flags per §API.
3. `src/services/auth.ts`: `verifyGoogleIdToken(idToken)` with `google-auth-library` (`audience = env.GOOGLE_CLIENT_ID`, require `email_verified`), `upsertUserFromGoogle(payload)`.
4. `src/routes/auth.ts`: the three endpoints with the exact codes/bodies in SPEC-002 §API. `User` DTO mapper (`isAdmin` computed, snake→camel here and nowhere else).
5. Add `GOOGLE_CLIENT_ID`, `ADMIN_EMAIL`, `SESSION_SECRET` handling to `src/env.ts` if not already.

## Definition of Done
- [x] `drizzle/0000_users.sql` content pasted; `bun run db:migrate` output pasted; `psql`/Drizzle query showing the `users` table exists on `possibility_db` (0 rows) pasted.
- [x] `curl -s -X POST localhost:4000/api/v1/auth/google -H 'content-type: application/json' -d '{}'` → 400 `VALIDATION_FAILED` — paste.
- [x] Same with `{"idToken":"garbage"}` → 401 `INVALID_GOOGLE_TOKEN`, and `select count(*) from users` still 0 — paste both.
- [x] `curl -s localhost:4000/api/v1/auth/me` (no cookie) → 401 `NOT_SIGNED_IN` — paste.
- [x] `curl -s -X POST localhost:4000/api/v1/auth/logout -i` → 204 with a `Set-Cookie` clearing `possibility_session` — paste headers.
- [ ] Happy path with a REAL Google ID token: if the owner's `GOOGLE_CLIENT_ID` is in your `.env`, obtain a token via the GIS playground or the FE once TASK-004 lands, post it, paste the 200 body (mask the email domain if you like) and the `Set-Cookie` header; then `GET /auth/me` with that cookie → 200 same user; second sign-in → `count(*)` unchanged. If you have no client ID: write `UNVERIFIED — needs DR-2 value`.
- [x] `grep -rn "password" src/` returns nothing — paste (REQ-002 AC-6).

## Implementation Notes
(Jason, 2026-09-19)

**Files in `possibility-back`** (no git writes): `src/db/schema.ts` (`users` per SPEC-002 §Data Model + exported `TIERS`) · `drizzle/0000_users.sql` + `drizzle/meta/*` (generated) · `src/lib/session.ts` (`signSession`, `setSessionCookie`, `clearSessionCookie`, `readSession`, `requireUser`, `requireAdmin` → 404, `isAdmin`) · `src/services/auth.ts` (`verifyGoogleIdToken` via `google-auth-library` 11.1.0 exact-pinned, audience = `GOOGLE_CLIENT_ID`, requires `email_verified`; `upsertUserFromGoogle` on `google_sub`, refreshes email/display_name, tier untouched, `isNew` from `xmax = 0`) · `src/routes/auth.ts` (3 endpoints, `toUserDto` — the only snake→camel/`isAdmin` place; one sign-in log line `user.id`, `email`, new|returning; token never logged) · `src/index.ts` mounts `/api/v1/auth`. Step 5: `env.ts` already had all three vars from TASK-001 — nothing to add. `bunx tsc --noEmit` clean.

**Deviation to note:** drizzle-kit numbers from `0000`, so the file is `drizzle/0000_users.sql` (generated with `drizzle-kit generate --name users`), not `0001_users.sql`. Renaming by hand would desync `meta/_journal.json`; I left drizzle-kit's name. Say if you want otherwise.

**No `.env` on this machine (DR-4 open).** Every run below used env vars inline in the shell with a dummy `DATABASE_URL`; no real DB touched, nothing written to disk.

`drizzle/0000_users.sql` (matches SPEC — CHECK on tier, UNIQUE google_sub + email):
```sql
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"google_sub" text NOT NULL,
	"email" text NOT NULL,
	"display_name" text NOT NULL,
	"tier" text DEFAULT 'Ordinary' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_google_sub_unique" UNIQUE("google_sub"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_tier_check" CHECK ("users"."tier" IN ('Ordinary','Seeker','Raw Diamond','Visionary','The Possibility'))
);
```
**UNVERIFIED — `bun run db:migrate` + `users` exists with 0 rows:** needs the owner's `DATABASE_URL` (DR-4). Per your TASK-001 note, run as `bun --env-file=.env run db:migrate` (drizzle-kit does not auto-load `.env`). I apply it the moment `.env` lands.

Server up with dummy env, then:
```
$ curl -s -i -X POST localhost:4000/api/v1/auth/google -H 'content-type: application/json' -d '{}'
HTTP/1.1 400 Bad Request
{"error":{"code":"VALIDATION_FAILED","message":"idToken is required"}}

$ curl -s -i -X POST localhost:4000/api/v1/auth/google -H 'content-type: application/json' -d '{"idToken":"garbage"}'
HTTP/1.1 401 Unauthorized
{"error":{"code":"INVALID_GOOGLE_TOKEN","message":"Google token could not be verified"}}
```
`select count(*) from users` still 0 after the garbage token — **UNVERIFIED** (no DB); by code, `upsertUserFromGoogle` is only reached after a non-null verified payload.
```
$ curl -s -i localhost:4000/api/v1/auth/me
HTTP/1.1 401 Unauthorized
{"error":{"code":"NOT_SIGNED_IN","message":"Not signed in"}}
(same 401 NOT_SIGNED_IN with a bogus cookie `possibility_session=abc.def.ghi`)

$ curl -s -i -X POST localhost:4000/api/v1/auth/logout
HTTP/1.1 204 No Content
set-cookie: possibility_session=; Max-Age=0; Path=/
```
Cookie flags + JWT round-trip (harness `ai-worker/tests/harness/task-003-session-cookie.ts`, no DB):
```
Set-Cookie: possibility_session=eyJhbGciOiJIUzI1NiIs…; Max-Age=604800; Path=/; HttpOnly; SameSite=Lax
verified payload: { sub: "11111111-…", iat, exp } exp-iat(s)= 604800
```
(`Secure` is added only when `NODE_ENV=production`, per SPEC-002 §API.)

**UNVERIFIED — happy path with a real Google ID token: needs DR-2 value** (and DR-4 for the DB). Also covers `GET /auth/me` with a valid cookie → 200 and second sign-in → count unchanged.

`grep -rn "password" src/` → no output, exit 1 (nothing found).

DoD: 400 ✔ · 401 garbage ✔ (count=0 UNVERIFIED) · /me 401 ✔ · logout 204 + clearing cookie ✔ · grep ✔ · migration apply UNVERIFIED (DR-4) · real-token happy path UNVERIFIED (DR-2 + DR-4).

**Proof run (Jason, 2026-09-19 10:20, owner's `.env` present — values never printed):**
```
$ sed -n 's/^([A-Z_]*)=.*//p' .env      # keys only
DATABASE_URL SESSION_SECRET GOOGLE_CLIENT_ID ADMIN_EMAIL AI_GATEWAY_URL AI_PROVIDER AI_MODEL FRONTEND_ORIGIN PORT
$ git status --short                       # empty — .env is ignored (owner has committed the scaffold: 16b17cc)
$ bun --env-file=.env run db:migrate
Using 'postgres' driver for database querying
[⣯] applying migrations...error: script "db:migrate" exited with code 1
$ bun --env-file=.env run <connect-check>   # postgres client, select current_database()
ERROR: 3D000 database "possibility_db" does not exist
```
→ migration NOT applied; DB DoD lines still UNVERIFIED — blocked on Q-2 below.

**Proof run 2 (Jason, 2026-09-19 11:45 — `possibility_db` exists, DR-6). Owner's `.env`, values never printed.**
```
$ bun --env-file=.env x drizzle-kit migrate
Using 'postgres' driver for database querying
exit=0                                  # applies 0000_users + 0001_ideas together (drizzle-kit runs all pending)
$ bun --env-file=.env run ai-worker/tests/harness/db-tables.ts     # read-only
database: possibility_db
idea_steps               rows=0
ideas                    rows=0
users                    rows=0
$ curl -s localhost:4000/api/v1/health
{"status":"ok","db":"ok"}                 # TASK-001's open line — closed
$ curl -s -X POST localhost:4000/api/v1/auth/google -H 'content-type: application/json' -d '{"idToken":"garbage"}'
{"error":{"code":"INVALID_GOOGLE_TOKEN","message":"Google token could not be verified"}}
→ users count still 0 (db-tables.ts, run right after)
$ curl -s -X POST localhost:4000/api/v1/auth/google -H 'content-type: application/json' -d '{}'
{"error":{"code":"VALIDATION_FAILED","message":"idToken is required"}}
```
Session → DB path proven with a **dev fixture user** (see TASK-005 notes — `dev-jason-a@example.com`, cookie signed by `signSession`):
```
$ curl -s localhost:4000/api/v1/auth/me -H "Cookie: possibility_session=<jwt>"
{"user":{"id":"337a5516-…","email":"dev-jason-a@example.com","displayName":"Dev Jason A","tier":"Ordinary","discountPercent":0,"isAdmin":false,"createdAt":"2026-09-19T04:39:03.839Z"}}
```
`git status --short` → `.env` absent (ignored). `grep -rn password src/` → nothing.
**UNVERIFIED — proven by Tanya via FE (REQ-002 TEST):** the real Google ID-token happy path (200 + Set-Cookie, `/me` 200, second sign-in count unchanged) — per Sober's Q-2 answer.

## Questions
- **Q-2 DATA REQUEST @Sober (Jason, 2026-09-19 10:25):** with the owner's `.env` in place, `bun --env-file=.env run db:migrate` fails; a direct connect shows `ERROR 3D000: database "possibility_db" does not exist` on the SIT server (the connection itself works — host/credentials are right). I did NOT run `CREATE DATABASE` — creating a database on the owner's server is beyond "read/write the working DB" (SPEC-001 §D8). Need one of: (a) the owner creates `possibility_db` (`CREATE DATABASE possibility_db;` as the postgres user), or (b) written authorisation for me to run that one statement. Then I rerun the migration + DoD lines. Also: the real-token happy path needs a Google ID token that only a human sign-in in a browser produces — I cannot obtain one myself; propose Tanya proves it end-to-end via the FE once TASK-004 lands, or the owner pastes a token to Sober. Until then that line stays UNVERIFIED.
  > answer (Sober, 2026-09-19): correct not to create it. Raised to Porter → owner as **DR-6**: create `possibility_db` on SIT (or authorise you in writing to run that one `CREATE DATABASE`). Real-token happy path: agreed — Tanya proves it through the FE once TASK-004 lands; mark that DoD line `UNVERIFIED — proven by Tanya via FE (REQ-002 TEST)` and it will not block DONE.
- **Q-1 @Sober (Jason, 2026-09-19):** migration file is `drizzle/0000_users.sql` (drizzle-kit's numbering) instead of `0001_users.sql` — acceptable, or do you want SPEC-002 §Data Model's filename amended? Not blocking.
  > answer (Sober, 2026-09-19): `0000_users.sql` is fine — keep drizzle-kit's numbering, never rename by hand. SPEC-002 §Data Model amended to `drizzle/0000_users.sql`.

## Review
**Review (Sober, 2026-09-19 00:20) — code accepted, no REWORK; status BLOCKED until the owner-gated proof lands.**
Read every file, not the notes: `schema.ts` + `0000_users.sql` match SPEC-002 §Data Model exactly (CHECK on the five exact strings, UNIQUE google_sub/email, timestamptz) · `session.ts` cookie flags/7-day exp/HS256 per §API, `requireAdmin` → 404 per §Flow 9 · `services/auth.ts` verifies audience + `email_verified`, upserts on `google_sub`, leaves `tier` alone on return, `display_name = email` fallback · `routes/auth.ts` codes/bodies match §API, DTO is the single snake→camel point, token never logged · mounted at `/api/v1/auth` · `google-auth-library` exact-pinned.
Noted, not rework: (1) `readSession` passes the JWT `sub` straight to a uuid column — unreachable without the secret, acceptable. (2) A returning Google account whose new email collides with another row's `email` would hit the UNIQUE constraint and surface as 500 — extreme edge, log it if it ever appears; no change now.
**What turns this DONE** (Jason re-opens to REVIEW after `.env` lands): `bun --env-file=.env run db:migrate` output + `users` exists with zero rows; garbage-token → count still zero; and, once DR-2 is in `.env`, the real-token happy path (200 + Set-Cookie, `/me` 200, second sign-in count unchanged). Everything else in the DoD is evidenced.
**Verdict: DONE** (Sober, 2026-09-20 23:15). Proof run 2 closes every DB line: migration applied to `possibility_db`, three tables at 0 rows, health `db:"ok"` (also closes TASK-001's open line), garbage token leaves `users` at 0, session→DB path proven with a declared dev fixture. Remaining line — real Google ID-token happy path — is by design **Tanya's via the FE** (REQ-002 TEST); it does not block DONE. Fixture users `dev-jason-a/b@example.com` are declared per SPEC-001 §D8b.
