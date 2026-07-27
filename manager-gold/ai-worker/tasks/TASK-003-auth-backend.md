# TASK-003: Auth backend — accounts, sessions, guard
- Source: SPEC-001
- Status: TODO
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
- [ ] `bun run migrate` creates `users` + `sessions`.
- [ ] `bun test` passes, covering: register→200/cookie set; duplicate email→409;
      login good→200, login bad password→401, unknown email→401 (same body);
      `/auth/me` with cookie→200, without→401; logout→204 then `/auth/me`→401;
      `/api/health` without session→401, with session→200.
- [ ] **Isolation check (automated or scripted curl):** two registered users;
      user A's session cannot read a record scoped to user B (demonstrated on
      `/api/health` returning A's own `userId`, and documented as the pattern
      REQ-002 tables must follow). Include the commands in Implementation Notes.
- [ ] No `password_hash` appears in any API response (grep the test output/JSON).
- [ ] Cookie attributes verified (httpOnly + SameSite=Lax present in `Set-Cookie`).

## Implementation Notes
(Jason fills this in: files changed, how verified, `bun test` output.)

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review
(Sober fills this in at REVIEW.)
