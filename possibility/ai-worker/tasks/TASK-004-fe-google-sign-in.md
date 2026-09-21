# TASK-004: FE — Google sign-in button, AuthContext, header, guard
- Source: SPEC-002
- Owner: FE (Fern)
- Status: DONE
- Depends on: TASK-002; TASK-003 endpoints reachable at `NEXT_PUBLIC_API_BASE_URL`

## What to do
Start once TASK-002 is in REVIEW. UI components: Ant Design (Q-1 settled).
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
_Fern, 2026-09-20. Repo `possibility-front`, paths relative to it. Built on TASK-002 (still in REVIEW)._

**Files (new unless marked):**
- `src/types/api/main/auth.ts` — `User`, `Tier`, `UserResponse`, `GoogleSignInRequest` exactly per SPEC-002 §User shape. (Observed: the live `/auth/me` also returns `discountPercent` — not in SPEC-002's shape; ignored here, presumably SPEC-004/TASK-007.)
- `src/lib/api/api-main.ts` (edited) — `postAuthGoogleApi`, `getAuthMeApi`, `postAuthLogoutApi` on `/api/v1/auth/*` via the TASK-002 client (`withCredentials`).
- `src/services/auth.service.ts` — `signInWithGoogle`, `getCurrentUser` (401 → `null`, anything else rethrown), `signOut`.
- `src/context/auth/AuthContext.tsx` — `useQuery(["authMe"])` on mount; exposes `{ user, status: 'loading'|'signedOut'|'signedIn', signInWithIdToken, signOut }`; mutations write the query cache after **cancelling any in-flight `/auth/me`** (see bug below). `src/hooks/useAuth.ts` re-exports it. `src/context/AppProviders.tsx` (edited) adds `AuthProvider` inside `QueryProvider`.
- `src/components/common/GoogleSignInButton.tsx` — loads `https://accounts.google.com/gsi/client` once, `initialize({ client_id: NEXT_PUBLIC_GOOGLE_CLIENT_ID, callback })`, `renderButton({ text: "signin_with", locale: <ui lang>, … })`, re-rendered on language change; credential → `POST /auth/google`; BE 401 `INVALID_GOOGLE_TOKEN` → `onCancelled`. Popup dismissal → `onCancelled` via a **heuristic** (Q-1). Missing client id → `console.error`, nothing rendered. `src/types/google-gsi.d.ts` — minimal GIS typing.
- `src/components/partials/Landing/{LandingContent.tsx,Landing.module.css,index.ts}` — signed-out landing: the Google button; W-3 (`auth.cancelled`) as an antd `Alert` only after a cancelled/denied flow.
- `src/components/common/RequireUser.tsx` + `index.ts` — guard: `loading` → nothing, `signedOut` → `<LandingContent/>` in place (no redirect), `signedIn` → children.
- `src/app/ideas/new/page.tsx` — `<RequireUser><main data-page="ideas-new"/></RequireUser>`; **no heading** (Q-2). `src/app/page.tsx` + `src/components/partials/Home/` — `/` shows the landing when signed out, an empty `<main/>` when signed in (TASK-006 fills it).
- `src/components/layout/Header/Header.tsx` + `.module.css` (edited) — when `signedIn`: display name, email, W-2 sign-out `Button` (44 px); no admin link anywhere. Identity wraps under the controls ≤ 600 px.
- `src/lib/i18n/{th,en}.ts` (edited) — `auth.signOut` = W-2, `auth.cancelled` = W-3, Porter's exact strings. `en.ts` is now typed `Record<keyof typeof th, string>` so a key missing in one language is a compile error. W-1 is not in the dictionaries: Google renders the button label itself (`text: "signin_with"` + `locale`) — Q-3.

**Bug found and fixed during verification (worth a REGRESSION line):** a real click on *Sign out* focuses the window → React Query's `refetchOnWindowFocus` fires `GET /auth/me` a few ms before `POST /auth/logout`; that refetch resolved *after* the logout wrote `null`, so the header kept showing the user until the next navigation. Fix: `queryClient.cancelQueries(["authMe"])` before every auth-state write. Reproduced with a real click before the fix (network log: `/auth/me 200, 200, /auth/logout 204`, header unchanged) and proven fixed after (`/auth/me 200, <cancelled>, /auth/logout 204`, header cleared).

**Local setup used:** `possibility-front/.env.local` now exists on this machine (git-ignored) with `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000` and **`NEXT_PUBLIC_GOOGLE_CLIENT_ID` empty** — the owner's public client id still has to go in (DR-2). BE run locally from `possibility-back` with its own `.env` (`bun src/index.ts`, :4000, `FRONTEND_ORIGIN=http://localhost:3000`) — Jason's code untouched. Session for the signed-in checks minted with Jason's idempotent `tests/harness/task-005-dev-fixtures.ts` (upsert on his existing `dev-jason-a`; **no new rows**), cookie placed in the browser by hand; signed out at the end (`/auth/logout` 204).

**DoD evidence (2026-09-20, in-app browser against the local FE :3000 + BE :4000):**
1. Signed-out landing: `/` and `/ideas/new` both render `LandingContent` (`main.landing` present, `[data-page=ideas-new]` absent, no idea box, header shows only title + TH|EN). **Google button itself UNVERIFIED — needs DR-2** (`NEXT_PUBLIC_GOOGLE_CLIENT_ID` empty → console: `NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set — the Google button cannot render.`). No screenshot files saved; checks were read from the DOM live.
2. Real Google sign-in: **UNVERIFIED — needs DR-2.** Proven instead with a minted session cookie (fixture `dev-jason-a`): header → `Possibility · Dev Jason A · dev-jason-a@example.com · ออกจากระบบ · TH EN`; `/ideas/new` renders the guarded page; **reload keeps it** (`GET /auth/me → 200`); switch EN → button reads `Sign out`, reload keeps EN + signed-in.
3. Sign out (real click): `POST /auth/logout → 204`, `possibility_session` gone from `document.cookie`, header → `Possibility · TH EN`, page swaps to the landing in place; `/ideas/new` afterwards → landing, not the page (AC-4, AC-1).
4. Cancel popup → W-3: **UNVERIFIED — needs DR-2** (no popup without a client id). The Alert wiring is exercised only by code read; W-3 strings are in both dictionaries.
5. `npm run build` tail:
```
✓ Compiled successfully
  Finished TypeScript ...
✓ Generating static pages using 5 workers (4/4)
Route (app)
┌ ƒ /
├ ƒ /_not-found
└ ƒ /ideas/new
```
Zero type errors. `git status --short` unchanged from TASK-002 (`?? .env.example next.config.ts package-lock.json package.json src/ tsconfig.json`); no `.env*.local`. Token grep of `src/`: zero new hits. 375 px: no horizontal scroll, sign-out 44 px, identity wraps under the controls (was colliding with the title — fixed).
Dev-only note: `/auth/me` is requested twice per page load — React StrictMode double-mount with `gcTime: 0`; single request in a production build (not measured — UNVERIFIED, would need `npm start`).

## Questions
- Q-1 (Sober): **GIS has no cancel callback for the rendered button.** SPEC-002 §Flow 8 wants W-3 "only when arriving from a cancelled/denied Google flow". Implemented as a heuristic: click on the button → when the window regains focus and no credential arrives within 1.5 s → cancelled. It cannot be verified without DR-2 and may misfire with Google's FedCM dialog (no popup, no focus change). Alternatives: (a) accept the heuristic and let Tanya judge it on the real flow; (b) show W-3 whenever the user *reaches* `/ideas/new` signed out (simpler, deterministic, but shows W-3 on a plain first visit — contradicts AC-1 "just the button"). I went with (a); say if you prefer (b).
- Q-2 (Sober → Porter, copy): the placeholder `/ideas/new` was to have "only a heading" — **no heading copy exists** for that page in REQ-003 (its wording covers the box placeholder, button, counter, axis labels, list title). Rendered with no heading for now; give me the TH/EN pair and it is one line.
- Q-3 (Sober, wording): the Google button's label is rendered by Google (`text: "signin_with"`, `locale: th|en`), not by us — in Thai Google's own string is what shows, which may differ from Porter's W-1 "เข้าสู่ระบบด้วย Google". Exact W-1 text would require a custom button, which GIS does not support for the ID-token flow. Flagging so Porter/Tanya do not log it as a wording defect.

## Review
**Verdict: DONE** (Sober, 2026-09-20 00:10). Guard, header, sign-out, reload persistence and the in-place landing are proven against the real BE with a declared fixture cookie; the focus-refetch race you found and fixed is exactly the kind of thing review cannot catch — logged to Porter for Tanya's REGRESSION list. Three lines stay **UNVERIFIED until the owner puts the public client id into `possibility-front/.env.local`** (raised as **DR-7** via Porter): Google button renders, real sign-in creates/reads the user, cancel → W-3. Those are Tanya's to prove in REQ-002's TEST once DR-7 lands; they do not block DONE.
Answers: **Q-1** — (a) accepted; SPEC-002 §Flow 8 amended to say the cancel signal is best-effort (GIS gives none). If Tanya sees W-3 on a plain first visit, that becomes a defect; if she sees no W-3 after a real cancel, it is noted, not blocking. **Q-2** — no heading needed; TASK-006 replaces that page; Porter has the copy question for the record. **Q-3** — correct; Porter is told W-1 is rendered by Google in its own words so nobody logs it as a wording defect.
