# SPEC-001: User accounts & authentication
- Source: REQ-001
- Status: DONE (all 4 tasks accepted 2026-07-27; REQ-001 → SPEC_DONE, pending Porter acceptance)
- Baseline: see `../architecture-baseline.md` (stack, session model, isolation)

## Overview
Greenfield app. This SPEC (a) bootstraps both repos to a runnable skeleton and
(b) implements email + password auth using **server-side opaque sessions** in a
cookie (`mg_session`), with **argon2id** password hashing via `Bun.password`.
All app data routes live under `/api/*` and require a valid session; per-user
data isolation is enforced server-side by filtering every query on the
authenticated `userId` (see baseline §3). We deliberately keep the MVP small:
no OAuth, no email verification, no password reset (out of scope per REQ-001).

Login identifier = **email** (unique). Chosen because it is the natural unique id
and the stakeholder already operates by email; no verification email is sent.

## API / Interface Design

Base URL = `http://localhost:4020`. JSON bodies. Auth cookie `mg_session`
(httpOnly, Secure, SameSite=Lax). All responses JSON except 204.

| Method | Path | Auth | Body | Success | Errors |
|--------|------|------|------|---------|--------|
| POST | `/auth/register` | no | `{ email, password, displayName? }` | `201 { user }` + `Set-Cookie mg_session` | `400` validation, `409` email taken |
| POST | `/auth/login` | no | `{ email, password }` | `200 { user }` + `Set-Cookie mg_session` | `400` validation, `401` bad credentials |
| POST | `/auth/logout` | session | — | `204` + clears cookie, deletes session row | `401` if no valid session |
| GET | `/auth/me` | session | — | `200 { user }` | `401` if no valid session |
| GET | `/api/health` | session | — | `200 { ok: true, userId }` | `401` — proves the guard works |

- `user` shape: `{ id, email, displayName, createdAt }` — **never** includes `passwordHash`.
- Validation: email format; password length ≥ 8. On failure → `400 { error, fields }`.
- `401` body: `{ error: "unauthorized" }`. `409` body: `{ error: "email_taken" }`.
- **Uniform bad-credentials response:** wrong email and wrong password both return
  `401` with the same message (no user-enumeration).

## Data Model
SQLite via Drizzle. First migration creates:

**`users`**
- `id` TEXT PK (uuid)
- `email` TEXT UNIQUE NOT NULL (stored lowercased)
- `password_hash` TEXT NOT NULL
- `display_name` TEXT NULL
- `created_at` INTEGER NOT NULL (epoch ms)

**`sessions`**
- `id` TEXT PK (opaque random, ≥32 bytes base64url) — this is the cookie value
- `user_id` TEXT NOT NULL → `users.id` (ON DELETE CASCADE)
- `created_at` INTEGER NOT NULL
- `expires_at` INTEGER NOT NULL (created_at + 30 days)

Index: `sessions.user_id`. Future domain tables (REQ-002/003) will carry
`user_id` and follow the isolation rule; not created here.

## Flow
1. **Register:** validate → lowercase email → reject if email exists (`409`) →
   `Bun.password.hash` (argon2id) → insert user → create session row →
   set `mg_session` cookie → `201 { user }`.
2. **Login:** validate → look up by lowercased email → if none, still run a
   dummy hash compare then `401` (constant-ish time, no enumeration) →
   `Bun.password.verify` → on match create session + cookie → `200 { user }`;
   else `401`.
3. **Session middleware:** read `mg_session` → look up session → if missing or
   `expires_at` ≤ now → `401` (and if expired, delete the row). Else attach
   `userId`. Applied to `/auth/logout`, `/auth/me`, and all `/api/*`.
4. **Logout:** delete the session row → clear cookie (`Max-Age=0`) → `204`.
   Logging out then hitting a protected route → `401`.
5. **`/auth/me`:** returns the current `user` (used by the frontend to decide
   logged-in vs logged-out on load).
6. **Edge cases:** duplicate email → 409; wrong password / unknown email → 401
   identical; expired/tampered cookie → 401; concurrent sessions allowed (each
   login = new session row) — logout ends only the current one.

## Non-functional
- Passwords: argon2id (`Bun.password`), never logged, never returned.
- Cookie: httpOnly + Secure + SameSite=Lax; value is opaque (no PII).
- CORS: allow `FRONT_ORIGIN` with `credentials: true` (baseline §5).
- Input validation on every endpoint; 400 with field errors.
- Logging: log auth failures at info (no passwords, no session ids).
- **Out of scope (MVP):** rate limiting / lockout, email verification, password
  reset, OAuth, "remember me" toggle. Note as candidates for later REQs.

## Tasks
- TASK-001: BE — backend bootstrap (Bun+Hono+Drizzle/SQLite skeleton, CORS, health) (depends on: —)
- TASK-002: FE — frontend bootstrap (Next.js+TS+Mantine skeleton, API client, layout) (depends on: —)
- TASK-003: BE — auth: users/sessions schema + register/login/logout/me + session middleware (depends on: TASK-001)
- TASK-004: FE — auth UI: register/login/logout pages + auth guard for protected routes (depends on: TASK-002; integrates with TASK-003)

## Questions
(Jason / Fern ask here; Sober answers as `> answer: ...`)
