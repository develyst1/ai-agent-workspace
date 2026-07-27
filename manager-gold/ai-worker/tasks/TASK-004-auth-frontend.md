# TASK-004: Auth UI — register / login / logout + route guard
- Source: SPEC-001
- Status: TODO
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
- [ ] With backend (TASK-003) running: register a new account → lands logged-in on home.
- [ ] Log out → redirected to `/login`; manually visiting a protected page while
      logged out redirects to `/login` (verify: acceptance criterion "protected
      pages not reachable when logged out").
- [ ] Log in with the account → back on home; header shows the user.
- [ ] Wrong password shows the single generic error (no "user not found" leak).
- [ ] Two different accounts in two browsers/profiles each see only their own
      session (`/auth/me` returns the correct distinct user for each).
- [ ] `npm run build` succeeds (no type errors).

## Implementation Notes
(Fern fills this in.)

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review
(Sober fills this in at REVIEW.)
