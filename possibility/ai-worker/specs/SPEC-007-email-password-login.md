# SPEC-007: Email + password sign-up / sign-in, next to Google
- Source: REQ-006 (R1–R8, AC-1..10); SPEC-002 (the session it must join); SYSTEM-FACTS §Sign-in decision 2026-09-22
- Status: ACTIVE — Q-1 settled 2026-09-22 by the owner ("ok follow sa"): built as designed, no NextAuth.
- Author: Sober (SA), 2026-09-22

## Overview
The outcome the owner asked for: anyone (and QA on SIT) can create an account with email +
password and get **the same session** a Google user gets; Google stays the prominent way in.
The design that delivers it with no rewrite: the BE gains two endpoints (`/auth/register`,
`/auth/login`) that end in the **same `possibility_session` cookie** SPEC-002 already issues;
the `users` table gains a nullable `password_hash` and `google_sub` becomes nullable. Hashing is
argon2id via Bun's built-in `Bun.password` — no new dependency, nothing to configure. The FE adds
one form under the Google button. Nothing about Google, sessions, guards or admin changes.

**Why not NextAuth (the owner's named means) — stated plainly, decision his (Q-1):** NextAuth issues
*its own* session cookie on the Next.js side. Our BE does not know it; every API call is guarded by
the BE cookie from SPEC-002. Putting NextAuth in the middle means either (a) two sessions to keep in
step (NextAuth's for pages, ours for the API — the login-then-401 class of bug), or (b) moving the
whole session to NextAuth and rewriting the BE guard, the Google flow that REQ-002 already
DELIVERED, and TEST-001. Neither gives the owner anything the design below does not: credentials
are stored in *our* database either way. I recommend the design below; if he wants NextAuth by
name, option (b) is the honest version and costs roughly a week plus a re-test of REQ-002.

## API / Interface Design
Base `/api/v1`, camelCase, envelope per SPEC-001 §D6. Both new routes are rate-limited in memory:
10 attempts per (IP, email) per 15 min → 429 `TOO_MANY_ATTEMPTS` (not a REQ line; basic hygiene).

### `POST /auth/register`
Body `{ "email": string, "password": string, "displayName": string }`.
Validation (zod): email trimmed + lower-cased, RFC-shaped; password ≥ 8 chars (no upper bound below 200); displayName 1–80 chars trimmed.
- 201 `{ "user": User }` + `Set-Cookie` exactly as `/auth/google` (SPEC-002 §API). User created with `tier = 'Ordinary'`, `google_sub = NULL`, `password_hash = argon2id`.
- 400 `VALIDATION_FAILED` (message names the field; FE maps `password` → W-3).
- 409 `EMAIL_TAKEN` — any existing row with that email, Google or not (REQ-006 R2/AC-4 → W-5).

### `POST /auth/login`
Body `{ "email": string, "password": string }`.
- 200 `{ "user": User }` + the same `Set-Cookie`.
- 401 `INVALID_CREDENTIALS` for **all** of: unknown email, wrong password, **Google-only account** (no hash). One code, one message → W-4 (REQ-006 R3/AC-6). Constant-time: always run `Bun.password.verify` against a real or dummy hash.
- 400 `VALIDATION_FAILED` on a malformed body only.

### Unchanged
`GET /auth/me`, `POST /auth/logout`, `POST /auth/google`, `requireUser`, `requireAdmin` — byte-for-byte as SPEC-002. `User` shape unchanged; `isAdmin` is **now** `email === ADMIN_EMAIL && googleSub !== null` (REQ-006 R7 — an email account can never be admin, even with the owner's address).

## Data Model
Migration `drizzle/0003_password_login.sql` (generated; Jason applies — SIT DB, so it runs against the live schema; both statements are additive/relaxing, zero rows touched):
```sql
ALTER TABLE users ALTER COLUMN google_sub DROP NOT NULL;
ALTER TABLE users ADD COLUMN password_hash text;
ALTER TABLE users ADD CONSTRAINT users_one_credential_check
  CHECK (google_sub IS NOT NULL OR password_hash IS NOT NULL);
```
`UNIQUE (google_sub)` stays (Postgres treats NULLs as distinct). `UNIQUE (email)` is what enforces REQ-006 R2 across both kinds. Existing rows: all have `google_sub`, `password_hash` NULL — unaffected.

## Flow
1. Landing (signed out): Google button first and dominant (REQ-006 AC-1); W-1 divider; then the **sign-in** form (email, password, "Sign in", link "No account? Create one"). The link swaps the block to the **sign-up** form (display name, email, password, "Create account", link back). One component, two modes, no route change.
2. Sign-up → `POST /auth/register` → 201 → `AuthContext` set from the body (same path as Google) → `router.replace('/ideas/new')` (AC-2). 409 → W-5 inline under the email field, mode stays sign-up. 400 on password → W-3.
3. Sign-in → `POST /auth/login` → 200 → same as above (AC-5). 401 → W-4 inline, fields kept, password cleared.
4. Client-side: submit disabled until name/email non-empty (sign-up) or email/password non-empty (sign-in); password < 8 → W-3 shown live and submit disabled (AC-3). The BE re-validates — the FE rules are UX only.
5. Sign-out: unchanged (`/auth/logout`), same for both kinds (R5).
6. Everything after sign-in (ideas, tier, hire, admin 404) is the same code path — no branching on account kind anywhere except `isAdmin` and `/auth/login`'s hash check (AC-7, AC-8).

Edge cases: email case — stored lower-cased, compared lower-cased. A Google user later tries to register the same email → 409 W-5 (by design; no "link accounts" in scope). Register with the admin email + password → 409 if the owner's Google row exists (it does, TEST-001), else creates a non-admin row (`isAdmin` requires `google_sub`) — safe either way. Password in logs: the sign-in log line stays `user.id email new|returning`, never the body; the global error handler never echoes request bodies.

## Non-functional
- Hash: `Bun.password.hash(pw)` (argon2id defaults) / `Bun.password.verify` — Bun ≥ 1.0 built-in.
- AC-9 for Tanya: `select email, left(password_hash, 10) from users where email = '<hers>'` shows `$argon2id$`.
- No new env vars. Rate-limit map is per-process (fine for one SIT instance).

## Tasks
- TASK-011: BE — migration 0003, `/auth/register`, `/auth/login`, `isAdmin` rule, rate limit — owner: BE (depends on: Q-1 answered)
- TASK-012: FE — email sign-in/sign-up block under the Google button, wording W-1..W-5, `AuthContext` reuse — owner: FE (depends on: TASK-011 endpoints)

## Questions
- **Q-1 @Porter → owner (blocks TASK-011):** REQ-006 R8 names NextAuth. As designed above the login lives in our backend and reuses the session Google already uses — credentials are stored in our database, QA signs itself in, nothing already delivered changes. Using NextAuth by name would mean a second session system or a rewrite of the delivered sign-in. **Sober recommends: build it as designed, without NextAuth.** One word from the owner: "ตามที่ Sober ออกแบบ" or "ต้อง NextAuth".
  > answer (Porter 2026-09-22) Q-1: **owner: "ok follow sa"** — build as designed, no NextAuth. Recorded in SYSTEM-FACTS; REQ-006 R8 amended.
