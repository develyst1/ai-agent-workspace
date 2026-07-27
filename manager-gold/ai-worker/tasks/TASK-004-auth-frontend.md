# TASK-004: Auth UI — register / login / logout + route guard
- Source: SPEC-001
- Status: REVIEW
- Assignee: Fern (FE)
- Depends on: TASK-002 (integration also needs TASK-003's endpoints running)

## What to do
Build the auth screens and session handling in `manager-gold-front`, against the
SPEC-001 API contract (you can build the UI before TASK-003 lands; integrate once
it is up).
- **Register page** (`/register`): email + password (+ optional display name) form
  (Mantine). Calls `POST /auth/register`. On 201 → treat as logged in, go to the
  app home. Show field errors on 400, "email already used" on 409.
- **Login page** (`/login`): email + password. Calls `POST /auth/login`. On 200 →
  logged in → app home. On 401 → single generic "invalid email or password" message.
- **Logout**: a control in the app shell → `POST /auth/logout` → clears client auth
  state → redirect to `/login`.
- **Auth state + guard:** on app load, call `GET /auth/me`. If 200 → logged in
  (store `user` in context); if 401 → not logged in. Protected pages (everything
  except `/login` and `/register`) **redirect to `/login` when not authenticated**.
  Show the signed-in user's email/displayName in the header.
- All API calls go through `lib/api.ts` with `credentials: "include"`.

## Definition of Done
- [x] With backend (TASK-003) running: register a new account → lands logged-in on home
      (browser-verified: registered `qa+…@example.com` → `/`, header shows "Fern QA").
- [x] Log out → redirected to `/login`; visiting a protected page while logged out redirects
      to `/login` (browser-verified both: logout → `/login`; hitting `/` logged out → `/login`).
- [x] Log in with the account → back on home; header shows the user (browser-verified).
- [x] Wrong password shows the single generic "Invalid email or password" (no "user not found"
      leak) — browser-verified, stays on `/login`.
- [x] Two accounts each see only their own session — verified with two cookie jars:
      `/auth/me` returned distinct users (A→User A, B→User B), no cookie → 401.
- [x] `bun run build` succeeds, no type errors (routes `/`, `/login`, `/register` prerendered).

## Implementation Notes
Implemented by Fern, 2026-07-27 in `manager-gold-front` (branch `dong`, commit `9c9aebd`).
Built against the **as-built** backend contract (read `auth/routes.ts` + `auth/service.ts`,
not just SPEC-001), verified end-to-end against Jason's real TASK-003 backend on :4020.

**Files (new unless noted):**
- `lib/auth.tsx` — `AuthProvider` + `useAuth`. On mount calls `GET /auth/me`: 200 →
  `authenticated` (stores `user`); 401/error → `unauthenticated`. Exposes `setUser`
  (adopted by login/register on success), `refresh`, and `logout` (`POST /auth/logout`
  then clears local state even if the call fails).
- `components/AuthGate.tsx` — client route guard. `loading` → spinner; `unauthenticated`
  on a protected path → `router.replace("/login")`; `authenticated` on `/login|/register`
  → `router.replace("/")`. Renders nothing while a redirect is queued so protected content
  never flashes.
- `components/AppHeader.tsx` — app-shell header; shows the signed-in user
  (`displayName ?? email`) + a Log out button only when authenticated.
- `app/login/page.tsx` — email + password. `POST /auth/login`; 200 → `setUser` → `/`.
  401 **and** 400 both show one generic "Invalid email or password" (no enumeration).
- `app/register/page.tsx` — email + password + optional display name. `POST /auth/register`;
  201 → `setUser` → `/`; 409 → "That email is already in use"; 400 → per-field errors from
  the backend's `fields` map (`email`/`password`/`displayName`).
- `app/layout.tsx` (mod) — wraps the app in `MantineProvider` → `AuthProvider` →
  `AppHeader` + `AuthGate`(children).
- `app/page.tsx` (mod) — now the protected home: greets the user + shows their email
  (the TASK-002 backend-connectivity demo is retired; that DoD was already accepted).
- `lib/api.ts` (mod) — folded in Sober's deferred tweak: only set `Content-Type: application/json`
  when a body is present, so bodiless `GET /auth/me` and `POST /auth/logout` stay CORS-simple
  and skip the preflight. `credentials: "include"` still on every call.

**Verification (evidence) — real backend on :4020, real browser on :3020:**
- `bun run build` → ✓ compiled, TypeScript passed; `/`, `/login`, `/register` prerendered.
- Guard: `GET /` logged out → redirected to `/login` (`location.pathname === "/login"`).
- Register `qa+…@example.com` / "Fern QA" → landed on `/`, header shows "Fern QA", home
  reads "Signed in as qa+…", **console clean**.
- Logout (header button) → `/login`, header user cleared.
- Wrong password → generic "Invalid email or password", stayed on `/login`.
- Correct login → `/`, header shows the user, **console clean**.
- Isolation (two cookie jars via curl): `/auth/me` → distinct users (A/B); no cookie → 401.
- Servers stopped, ports :3020/:4020 freed. Committed on `dong` (`9c9aebd`), not pushed.

**For Sober:**
- Closes the deferred `lib/api.ts` preflight tweak (from TASK-002 review).
- Not in scope / left for later: "remember me", password reset, email verification (all
  out of REQ-001 per SPEC-001). No client-side token storage — identity comes only from the
  httpOnly-cookie-backed `GET /auth/me`.
- Cross-site cookie caveat (your baseline §3 note): `SameSite=Lax` works for this same-origin
  dev setup; a cross-site prone deploy would need `SameSite=None; Secure` on the backend — no FE change.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review
(Sober fills this in at REVIEW.)
