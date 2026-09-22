# TASK-011: BE — email + password register/login on the existing session
- Source: SPEC-007
- Owner: BE (Jason)
- Status: DONE
- Depends on: none (code); Q-1 (start)

## What to do
Read SPEC-007 in full.
1. Schema: `googleSub` nullable, `passwordHash` nullable, CHECK one-credential → `drizzle/0003_password_login.sql`; apply with `bun --env-file=.env x drizzle-kit migrate` (SIT DB — additive only, verify the SQL before applying).
2. `src/services/auth.ts`: `registerWithPassword({email,password,displayName})` (lower-case email, `Bun.password.hash`, insert; unique violation on email → `EmailTaken`), `loginWithPassword({email,password})` (load by email; verify against the row's hash or a fixed dummy hash when absent/Google-only → constant time; null on failure).
3. `src/lib/session.ts`: `isAdmin(user)` now requires `googleSub !== null` too — update `toUserDto` and `requireAdmin` callers.
4. `src/routes/auth.ts`: `POST /register` (201/400/409 `EMAIL_TAKEN`), `POST /login` (200/401 `INVALID_CREDENTIALS`/400); both set the cookie via `setSessionCookie`; in-memory rate limit 10/(ip,email)/15 min → 429 `TOO_MANY_ATTEMPTS`.
5. Never log or echo `password`. Sign-in log line unchanged.

## Definition of Done
- [x] `0003_password_login.sql` pasted + migrate output; existing rows unchanged (`select count(*) from users where google_sub is null` = 0 before any register) — paste.
- [x] `POST /register` valid → 201 + Set-Cookie + `User` with tier Ordinary; `GET /auth/me` with that cookie → same user — paste.
- [x] `POST /register` same email again → 409 `EMAIL_TAKEN`; with a Google user's email (a `dev-jason-*` fixture) → 409 — paste; users count unchanged.
- [x] `POST /register` password 7 chars → 400 naming `password`; missing displayName → 400 — paste.
- [x] `POST /login` right password → 200 + cookie; wrong password → 401 `INVALID_CREDENTIALS`; unknown email → 401 same body; a Google-only email + any password → 401 same body — paste all four.
- [x] `select email, left(password_hash,10) from users where email='<yours>'` → `$argon2id$` — paste.
- [x] Register with `ADMIN_EMAIL` (env-override to a fresh address for the test) → `isAdmin:false` on `/auth/me`; `GET /admin/hire-requests` with that cookie → 404 — paste.
- [x] 11 rapid wrong logins → the 11th is 429 — paste the last two.
- [x] `grep -rn "password" src/ | grep -i "console\|log"` → nothing — paste.
- [x] Declare fixtures created (emails) for Tanya.

## Implementation Notes
(Jason, 2026-09-22 — no git writes; owner's `.env`, values never printed; BE listens on the `.env` PORT, 4019 today)

**Files in `possibility-back`:** `src/db/schema.ts` (`googleSub` nullable, `passwordHash` nullable, CHECK `users_one_credential_check`) → `drizzle/0003_password_login.sql` · `src/services/auth.ts` (`registerWithPassword` — trim + lower-case email, `Bun.password.hash` argon2id, 23505 → `EmailTaken`; `loginWithPassword` — loads by email, always runs `Bun.password.verify` against the row's hash **or a fixed dummy argon2id hash** → constant time; null for unknown / wrong / Google-only) · `src/lib/session.ts` (`isAdmin(user)` = `googleSub !== null && email === ADMIN_EMAIL`; `requireAdmin` + `toUserDto` updated) · `src/lib/rate-limit.ts` (in-memory 10 per (ip, email) per 15 min) · `src/routes/auth.ts` (`POST /register` 201/400/409/429, `POST /login` 200/400/401/429; both `setSessionCookie` exactly as `/google`; 400 message names the field(s)). `/google`, `/me`, `/logout`, `requireUser` untouched. `bunx tsc --noEmit` clean.

**Migration `drizzle/0003_password_login.sql`** — read twice; three additive/relaxing statements, identical to SPEC-007 §Data Model:
```sql
ALTER TABLE "users" ALTER COLUMN "google_sub" DROP NOT NULL;
ALTER TABLE "users" ADD COLUMN "password_hash" text;
ALTER TABLE "users" ADD CONSTRAINT "users_one_credential_check" CHECK ("users"."google_sub" IS NOT NULL OR "users"."password_hash" IS NOT NULL);
```
```
BEFORE  users columns: google_sub:NOT NULL            | users count: 7 | google_sub is null: 0
$ bun --env-file=.env x drizzle-kit migrate   → [✓] migrations applied successfully!  exit=0
AFTER   users columns: google_sub:nullable, password_hash:nullable | users count: 7 | google_sub is null: 0   ← rows unchanged
```
(harness `tests/harness/task-011-select.ts`, read-only)

**Register / me:**
```
$ POST /auth/register {"email":"Dev-Jason-PW1@example.com","password":"correct-horse-8","displayName":"Dev Jason PW1"}
HTTP/1.1 201 Created
set-cookie: possibility_session=<jwt…>; Max-Age=604800; Path=/; HttpOnly; SameSite=Lax
{"user":{"id":"c5233ee6-…","email":"dev-jason-pw1@example.com","displayName":"Dev Jason PW1","tier":"Ordinary","discountPercent":0,"isAdmin":false,"createdAt":"2026-09-21T19:50:06.033Z"}}
   ↑ email stored lower-cased
$ GET /auth/me  (cookie from POST /auth/login below)
{"user":{"id":"c5233ee6-…","email":"dev-jason-pw1@example.com",…,"tier":"Ordinary","isAdmin":false,…}}   ← same user
```
**Register conflicts / validation (users count 8 before, 8 after the two 409s):**
```
same email again            → {"error":{"code":"EMAIL_TAKEN","message":"An account with this email already exists"}} [409]
Google fixture dev-jason-a@ → {"error":{"code":"EMAIL_TAKEN",…}} [409]
password "1234567" (7)      → {"error":{"code":"VALIDATION_FAILED","message":"Invalid field(s): password"}} [400]
missing displayName         → {"error":{"code":"VALIDATION_FAILED","message":"Invalid field(s): displayName"}} [400]
```
**Login — four outcomes:**
```
right password              → HTTP/1.1 200 OK + set-cookie: possibility_session=<jwt…>; Max-Age=604800; Path=/; HttpOnly; SameSite=Lax
wrong password              → {"error":{"code":"INVALID_CREDENTIALS","message":"Email or password is incorrect"}} [401]
unknown email               → {"error":{"code":"INVALID_CREDENTIALS","message":"Email or password is incorrect"}} [401]   (same body)
Google-only dev-jason-a@    → {"error":{"code":"INVALID_CREDENTIALS","message":"Email or password is incorrect"}} [401]   (same body)
malformed body              → {"error":{"code":"VALIDATION_FAILED","message":"Invalid field(s): email, password"}} [400]
```
**Hash on disk:** `select email, left(password_hash,10), google_sub … where email='dev-jason-pw1@example.com'` → `{"email":"dev-jason-pw1@example.com","h":"$argon2id$","google_sub":null}`.

**Admin rule (R7)** — server run with `ADMIN_EMAIL=dev-jason-admin-pw@example.com` set in the shell only:
```
POST /auth/register {email: dev-jason-admin-pw@example.com, …} → 201; GET /auth/me → …"email":"dev-jason-admin-pw@example.com",…,"isAdmin":false
GET /admin/hire-requests (that cookie) → {"error":{"code":"NOT_FOUND","message":"Not found"}} [404]
```
**Rate limit** — key (ip, email) for `dev-jason-pw1@`: 4 attempts already counted (register, login ok, login wrong, login ok), then a loop of wrong passwords; the **11th attempt overall = loop #7** flipped:
```
loop 6  → 401 INVALID_CREDENTIALS      (10th attempt — still allowed)
loop 7  → {"error":{"code":"TOO_MANY_ATTEMPTS","message":"Too many attempts, try again in 15 minutes"}} [429]   (11th)
loop 8…11 → 429 (same body)
```
**Logs:** `sign-in user.id=c5233ee6-… email=dev-jason-pw1@example.com new` / `… returning` — same line as Google. `grep -rn "console\.\(log\|warn\|error\)" src/ | grep -i password` → nothing (exit 1). (The looser DoD grep matches the identifiers `loginBody`/`loginWithPassword` only — not log calls.)

**Fixtures created on `possibility_db` (for Tanya):** email+password accounts `dev-jason-pw1@example.com` (password `correct-horse-8`, Ordinary) and `dev-jason-admin-pw@example.com` (password `admin-try-123`, Ordinary, non-admin). Existing Google fixtures `dev-jason-a/b@example.com` untouched. Final: users 9, `google_sub is null` = 2. Dev fixture passwords are test values, not secrets.

DoD: migration + rows unchanged ✔ · register 201 + cookie + /me ✔ · 409 ×2, count unchanged ✔ · 400 password / displayName ✔ · login 200/401/401/401 ✔ · `$argon2id$` ✔ · admin-email register non-admin + 404 ✔ · 11th → 429 ✔ · grep ✔ · fixtures declared ✔.

## Questions

## Review
**Verdict: DONE** (Sober, 2026-09-22 03:00). Migration is exactly SPEC-007 §Data Model, applied to the SIT DB with rows untouched (7 before/after). Every endpoint outcome proven on the real DB: 201 + cookie, `/me` round-trip, 409 for both a password and a Google email with count unchanged, 400 naming the field, 200/401/401/401 with one identical body, `$argon2id$` on disk, admin-email registration stays non-admin + 404, 11th attempt 429. Code check: dummy-hash constant-time verify (`DUMMY_HASH`), `isAdmin` requires `googleSub`, rate-limit code present, `/google`/`/me`/`/logout` untouched. Fixtures declared with their test passwords — fine for Tanya.
