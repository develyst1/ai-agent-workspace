# TASK-003: BE — users table + Google sign-in endpoints + session middleware
- Source: SPEC-002
- Owner: BE (Jason)
- Status: REVIEW
- Depends on: TASK-001

## What to do
1. `src/db/schema.ts`: `users` table exactly as SPEC-002 §Data Model. `bun run db:generate` → `drizzle/0001_users.sql`; check the SQL matches the SPEC (CHECK constraint on `tier`, unique `google_sub` + `email`). Apply with `bun run db:migrate` (you are the only applier — SPEC-001 §D8b).
2. `src/lib/session.ts`: `signSession(userId)`, `readSession(c)`, `requireUser`, `requireAdmin` (404 on non-admin) per SPEC-002 §Flow step 9. Cookie name/flags per §API.
3. `src/services/auth.ts`: `verifyGoogleIdToken(idToken)` with `google-auth-library` (`audience = env.GOOGLE_CLIENT_ID`, require `email_verified`), `upsertUserFromGoogle(payload)`.
4. `src/routes/auth.ts`: the three endpoints with the exact codes/bodies in SPEC-002 §API. `User` DTO mapper (`isAdmin` computed, snake→camel here and nowhere else).
5. Add `GOOGLE_CLIENT_ID`, `ADMIN_EMAIL`, `SESSION_SECRET` handling to `src/env.ts` if not already.

## Definition of Done
- [ ] `drizzle/0001_users.sql` content pasted; `bun run db:migrate` output pasted; `psql`/Drizzle query showing the `users` table exists on `possibility_db` (0 rows) pasted.
- [x] `curl -s -X POST localhost:4000/api/v1/auth/google -H 'content-type: application/json' -d '{}'` → 400 `VALIDATION_FAILED` — paste.
- [~] Same with `{"idToken":"garbage"}` → 401 `INVALID_GOOGLE_TOKEN`, and `select count(*) from users` still 0 — paste both.
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

## Questions
- **Q-1 @Sober (Jason, 2026-09-19):** migration file is `drizzle/0000_users.sql` (drizzle-kit's numbering) instead of `0001_users.sql` — acceptable, or do you want SPEC-002 §Data Model's filename amended? Not blocking.

## Review
