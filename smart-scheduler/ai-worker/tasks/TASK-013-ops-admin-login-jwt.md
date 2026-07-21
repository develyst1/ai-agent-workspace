# TASK-013: ops — admin login endpoint + real JWT verification
- Source: SPEC-003
- Status: DONE
- Depends on: none
- Assignee: @Jason (smart-scheduler-backoffice-back, port 4010)

## What to do
Mirror the scheduling app's auth (`smart-scheduler-back` `lib/jwt.ts` + `routes/auth.ts` +
`authMiddleware`) into ops. `hono/jwt` ships with the existing `hono` dep — **no new package.**

1. **`src/lib/jwt.ts`** (new): `signToken({sub, role})` + `verifyToken(token)` using
   `sign`/`verify` from `hono/jwt`, HS256. Secret = `process.env.JWT_SECRET` (throw if unset).
   Claims `{sub, role:"admin", exp}`; `exp = now + (JWT_TTL_SECONDS ?? 43200)`.
2. **`src/routes/auth.ts`** (new): `POST /login`, validate `{username, password}` (zod, add to
   `validation.ts`). Compare to `process.env.ADMIN_USERNAME` / `ADMIN_PASSWORD` (plain equality;
   no fallback in prod — but a dev fallback of `admin`/`admin` is OK, mirroring scheduling).
   Wrong → `throw unauthorized(...)` (Thai msg). Success → `{ token: signToken({sub:username,
   role:"admin"}), user:{username, role:"admin"} }`. Mount in `routes/api.ts` under `v1`:
   `.route("/auth", authRoutes)` → **`POST /api/v1/auth/login`** (public, before/independent of guards).
3. **`src/middleware/auth.ts`** — replace the stubs with real verification:
   - `adminAuth`: keep `SKIP_ADMIN_AUTH==="true"` bypass; else read the Bearer token and
     `verifyToken` it — missing/invalid/expired → `unauthorized` (401); on success
     `c.set("user", claims)`. (Change the current `forbidden` on missing to `unauthorized` for
     consistency with scheduling: 401 = unauthenticated.)
   - `adminOrService`: service-token branch **unchanged** (scheduling calls with `X-Service-Token`
     = `SERVICE_TOKEN` — must keep working); the admin (Bearer) branch must `verifyToken` instead
     of accepting any Bearer.
4. **`.env.example`**: add `ADMIN_USERNAME=admin`, `ADMIN_PASSWORD=admin`, `JWT_TTL_SECONDS=43200`,
   `SKIP_ADMIN_AUTH=true` (dev); `JWT_SECRET` already present. Note in comments that prod sets real
   values + `SKIP_ADMIN_AUTH=false`.

## Definition of Done
- [ ] `POST /api/v1/auth/login` with correct env creds → `{token, user}`; wrong creds → 401.
- [ ] With `SKIP_ADMIN_AUTH=false`: a guarded mutation (e.g. `POST /catalog/items`) with **no**
      token → 401; with an **invalid/expired** Bearer → 401; with a **valid** login token → passes.
- [ ] `adminOrService` still passes a valid `X-Service-Token` (scheduling's calls unbroken) AND a
      valid admin Bearer; rejects neither-present.
- [ ] `SKIP_ADMIN_AUTH=true` still bypasses (dev).
- [ ] `bun test` + `bunx tsc --noEmit` clean; add tests: login ok/bad, verify pass/fail, service-token path.

## Implementation Notes
Mirrored `smart-scheduler-back`'s auth into `smart-scheduler-backoffice-back` — same token contract,
no new dependency (`hono/jwt`).

- **`src/lib/jwt.ts`** (new) — `signToken({sub, role:"admin"})` + `verifyToken` via `hono/jwt` HS256.
  Secret = `JWT_SECRET` (throws if unset); `exp = now + (JWT_TTL_SECONDS ?? 43200)`. `Role = "admin"`
  (ops has no staff role). `AuthClaims {sub, role, exp}`.
- **`src/routes/auth.ts`** (new) — `POST /login`, zod `v.login`, compares env `ADMIN_USERNAME`/
  `ADMIN_PASSWORD` (dev fallback `admin`/`admin`); wrong → `unauthorized` (401); success →
  `{token, user:{username, role:"admin"}}`. Mounted first under `v1`: **`POST /api/v1/auth/login`** (public).
- **`src/middleware/auth.ts`** — replaced the stubs with real verification:
  - `adminAuth`: keeps `SKIP_ADMIN_AUTH==="true"` bypass; else requires a Bearer, `verifyToken`s it,
    `c.set("user", claims)`; missing/invalid/expired → **401** (changed from the old `forbidden`/403).
  - `adminOrService`: **service-token branch unchanged** (`X-Service-Token`/Bearer == `SERVICE_TOKEN` →
    pass, so scheduling's calls keep working); the admin-Bearer branch now `verifyToken`s instead of
    accepting any Bearer. Added the `ContextVariableMap { user }` declaration for typed `c.get("user")`.
  - `serviceAuth`: unchanged.
- **`.env.example`** — added `ADMIN_USERNAME=admin`, `ADMIN_PASSWORD=admin`, `JWT_TTL_SECONDS=43200`,
  `SKIP_ADMIN_AUTH=true` (dev) with a prod note (set real creds + `SKIP_ADMIN_AUTH=false`).

**Verification**
- `bunx tsc --noEmit` → clean; `bun test` → **28 pass / 0 fail** (added `jwt.test.ts` 3 + `middleware/auth.test.ts`
  8): login ok/bad; `adminOrService` valid service-token passes, valid admin Bearer passes, neither → 401;
  `adminAuth` no-token/invalid → 401, valid → passes; JWT sign↔verify round-trip + wrong-secret/garbage reject.
  Tests run a real Hono app with `SKIP_ADMIN_AUTH=false`.
- `SKIP_ADMIN_AUTH=true` dev bypass verified by inspection (simple early-return; the suite forces `false`).

**@Fern — TASK-014 unblocked.** Login: `POST /api/v1/auth/login {username,password}` → `{token, user}`.
Send the token as `Authorization: Bearer <token>` on admin calls (mutations were already `adminOrService`/
`adminAuth`). For go-live the deploy env must set `SKIP_ADMIN_AUTH=false` + real `ADMIN_*`/`JWT_SECRET`.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

- None — mirrors scheduling exactly. Note: this only fixes the **backoffice** 403 (REQ-002). Scheduling
  already had its own auth. The go-live flip is `SKIP_ADMIN_AUTH=false` in the ops deploy env (deploy gate).
  > answer (Sober): Correct — added the ops auth env (`SKIP_ADMIN_AUTH=false` + `ADMIN_*`/`JWT_SECRET`) to
  > the deploy gate + the REQ-001 runbook §1 so go-live can't miss it.

## Review
**Verdict: DONE** ✅ (Sober, 2026-07-20). Re-ran `backoffice-back`: `bun test` → **28 pass / 0 fail**,
`tsc` exit 0. Read the real middleware — the stub is genuinely gone:
- `adminAuth`: `SKIP_ADMIN_AUTH` bypass kept; else extracts the Bearer, `if (!token) → 401`,
  `c.set("user", await verifyToken(token))`, verify throw → **401**. Real HS256 verify against `JWT_SECRET`. ✓
- `adminOrService`: **service-token branch unchanged** (`X-Service-Token`/Bearer == `SERVICE_TOKEN` → pass →
  scheduling's machine calls keep working) and the **admin branch now `verifyToken`s** the Bearer (was
  accept-any). ✓ `serviceAuth` untouched.
- `POST /api/v1/auth/login` mirrors scheduling's contract exactly (`hono/jwt`, no new dep). Tests run a real
  Hono app with `SKIP_ADMIN_AUTH=false` covering login ok/bad + verify pass/fail + service-token path.
No rework. **TASK-014 unblocked (and DONE).**
