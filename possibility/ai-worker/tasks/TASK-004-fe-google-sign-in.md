# TASK-004: FE — Google sign-in button, AuthContext, header, guard
- Source: SPEC-002
- Owner: FE (Fern)
- Status: BLOCKED (waiting: TASK-002 scaffold, itself waiting on SPEC-001 Q-1)
- Depends on: TASK-002; TASK-003 endpoints reachable at `NEXT_PUBLIC_API_BASE_URL`

## What to do
Do not start until Sober sets this `TODO`.
1. `services/auth.service.ts` + `hooks/useAuth.ts` over `POST /auth/google`, `GET /auth/me`, `POST /auth/logout` (SPEC-002 §API; `withCredentials` from TASK-002's api-main).
2. `context/AuthContext.tsx`: loads `/auth/me` on mount; exposes `{ user, status: 'loading'|'signedOut'|'signedIn', signOut }`.
3. `components/common/GoogleSignInButton.tsx`: loads `https://accounts.google.com/gsi/client`, `initialize` with `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `renderButton` with `locale` = current UI lang and text per REQ-002 W-1; on `credential` → `POST /auth/google`; on dismiss/error → set a `cancelled` flag that shows REQ-002 W-3 on the landing page.
4. `components/layout/Header.tsx`: TH|EN switch (from TASK-002) + when signed in: display name, email, W-2 sign-out button. No admin link anywhere (REQ-004 AC-6).
5. Route guard: a `RequireUser` wrapper for the idea page (placeholder page `/ideas/new` with only a heading for now — REQ-003 builds the box) → when `signedOut`, render the landing with the button (REQ-002 AC-1).
6. All strings via the TH/EN dictionaries — Porter's exact wording from REQ-002 §User-facing wording; nothing invented.

## Definition of Done
- [ ] Landing signed-out: Google button visible, no idea box; paste a screenshot path under `ai-worker/tests/harness/`.
- [ ] Sign in with a real Google account (needs the owner's client ID in `.env.local` — else `UNVERIFIED — needs DR-2`): header shows name + email; reload keeps it (cookie) — screenshot.
- [ ] Sign out → landing again; `/ideas/new` shows the button not the page — screenshot.
- [ ] Cancel the Google popup → W-3 shown in the current language — screenshot in TH and EN.
- [ ] `pnpm build` clean — paste tail.

## Implementation Notes

## Questions

## Review
