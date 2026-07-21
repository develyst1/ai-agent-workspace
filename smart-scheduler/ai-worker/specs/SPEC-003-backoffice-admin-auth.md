# SPEC-003: Backoffice admin authentication (login + real JWT)
- Source: REQ-002
- Status: DONE (tasks 013/014 DONE — 2026-07-20)
- Unblocks: REQ-001 go-live (live acceptance blocked on the 403 "ต้อง login admin").

## Overview
Give the backoffice a real admin login by **mirroring the scheduling app's proven
pattern**: an `hono/jwt` HS256 login on the ops API + a lightweight token session on
the backoffice-front. The **security boundary is the ops API** verifying the JWT for
real (replacing today's presence-only stub); the FE login is the UX that obtains and
carries the token.

Deliberately **not** adopting scheduling-front's NextAuth v5 **beta** on the
backoffice — it has no auth dependency today, and a single shared admin doesn't need
the provider ecosystem. Lightweight cookie+JWT keeps deps minimal and the security is
enforced server-side by ops. (NextAuth is the heavier alternative if we later want
multi-user SSO — token contract below is identical either way.)

### As-built gaps (from the 2026-07-20 code sweep)
- **ops** `src/middleware/auth.ts`: `adminAuth` only checks a Bearer header is *present*
  (`// TODO: verify JWT against JWT_SECRET`, line 25); `adminOrService` admin branch is
  the same stub (line 45). No `/auth` route, no JWT lib imported (but `hono/jwt` ships
  with the existing `hono` dep), `JWT_SECRET` in `.env.example` only, no `ADMIN_*` vars.
- **backoffice-front**: no auth dep, no login page, no `proxy.ts`/`middleware.ts`; single
  axios instance `lib/api/client.ts` with `// TODO (auth wave): attach the admin JWT`
  (line 24); `(admin)/layout.tsx` is the server gate point ("Auth guard lands in a later
  wave"); `Header.tsx:18` hardcodes `"แอดมิน"`.

## API / Interface Design (ops, :4010, `/api/v1`)
- **`POST /api/v1/auth/login`** (public — mounted under `v1` before the guards).
  Request `{ username, password }` (zod). Check against env `ADMIN_USERNAME` /
  `ADMIN_PASSWORD` (plain equality, single admin — mirrors scheduling; a users table can
  replace this later without changing the contract). Wrong creds → `401 UNAUTHORIZED`.
  Success → `{ token, user: { username, role: "admin" } }`.
- **JWT** (`src/lib/jwt.ts`, new): `hono/jwt` `sign`/`verify`, HS256, secret
  `process.env.JWT_SECRET` (throw if unset), claims `{ sub: username, role: "admin",
  exp }`, TTL `JWT_TTL_SECONDS` (default 43200 = 12h). Mirror scheduling's `lib/jwt.ts`.
- **`adminAuth`** upgrade: when `SKIP_ADMIN_AUTH!=="true"`, verify the Bearer JWT via
  `verifyToken`; missing/invalid/expired → `401 UNAUTHORIZED`; set `c.set("user", claims)`.
- **`adminOrService`** upgrade: service-token branch unchanged (scheduling keeps calling
  with `X-Service-Token`); the **admin branch must verify the JWT** (not just presence).
- No change to which endpoints are guarded (the 8 `adminAuth` + 4 `adminOrService`
  mutations already carry guards; all GETs stay public as today).

## Frontend Design (backoffice-front, :3018)
- **Login page** `src/app/login/page.tsx` (client, Mantine form; outside `(admin)` so the
  admin shell doesn't wrap it). POSTs to ops `/auth/login`; on success stores the token
  (see session) + redirects to `?next` (validated to start with `/`) or `/dashboard`; wrong
  creds → clear Mantine error (parse the shared `{error:{code,message}}` envelope).
- **Session storage**: the JWT in a cookie **`bo_token`** (`SameSite=Lax`, `Secure` in
  prod, ~12h). A JS-readable cookie (not httpOnly) so both the `proxy.ts` guard (server)
  and the axios interceptor (client) can read it — acceptable for an internal single-admin
  tool; the ops JWT check is the real control. Also keep the username (from the token or a
  second cookie) for the Header.
- **Route guard** `src/proxy.ts` (Next 16's renamed middleware — mirrors scheduling-front):
  redirect any request without `bo_token` to `/login?next=<path>`. Matcher = the admin
  pages (`/dashboard`, `/freelance-budgets`, `/ftpt-salary`, `/items`, `/inventory`,
  `/reports`, `/wallet`, `/payroll`); exclude `/login` + static.
- **Token attach**: request interceptor in `lib/api/client.ts` (the line-24 TODO) sets
  `Authorization: Bearer <bo_token>`. Response interceptor: on `401` clear `bo_token` +
  redirect to `/login?next=...`.
- **Header** `Header.tsx:18`: show the signed-in admin username + a **logout** control
  (clears `bo_token` → `/login`).

## Non-functional
- **Auth enforced in prod**: ops runs `SKIP_ADMIN_AUTH=false`; a raw `POST` with no/invalid
  token → 401. Dev keeps `SKIP_ADMIN_AUTH=true`.
- **Secrets**: ops needs `JWT_SECRET` (+ `ADMIN_USERNAME`/`ADMIN_PASSWORD`) set at deploy;
  add all to ops `.env.example`. No `AUTH_SECRET` (no NextAuth).
- **Scope**: single shared admin, single `role:"admin"`. No multi-user/RBAC/password-reset
  (REQ-002 out of scope).

## Tasks
- **TASK-013** (@Jason, ops): `lib/jwt.ts` + `POST /api/v1/auth/login` + real verify in
  `adminAuth`/`adminOrService` + env vars. (dep: —)
- **TASK-014** (@Fern, backoffice-front): login page + cookie session + `proxy.ts` guard +
  axios Bearer/401 interceptors + Header identity/logout. (dep: TASK-013)

## Questions
(Jason/Fern ask here; Sober answers as `> answer: ...`)
- Answered in REQ-002 `## Questions`: single shared admin (yes, launch); **separate** ops
  credential recommended (own `ADMIN_USERNAME`/`ADMIN_PASSWORD`/`JWT_SECRET`), or same as
  scheduling if คุณฟีน prefers one login — business confirm routed to @Porter (non-blocking;
  mechanism identical either way).
