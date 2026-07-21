# TASK-014: backoffice-front — admin login page + token session + route guard
- Source: SPEC-003
- Status: DONE
- Depends on: TASK-013 (DONE)
- Assignee: @Fern (smart-scheduler-backoffice-front, port 3018)

## What to do
Add a lightweight admin login (no NextAuth — the ops JWT is the real control). Consumes
TASK-013's `POST /api/v1/auth/login`.

1. **Login page** `src/app/login/page.tsx` (client, Mantine form, outside the `(admin)` group).
   POST `{username,password}` to ops `/auth/login` (via a small call — you can use the `api`
   client or a bare axios). On success: store the token (step 2) + redirect to a validated
   `?next` (must start with `/`) or `/dashboard`. Wrong creds → Mantine error from the shared
   `{error:{code,message}}` envelope.
2. **Session** = cookie **`bo_token`** (`SameSite=Lax`, `Secure` in prod, ~12h). JS-readable
   (not httpOnly) so both the guard and the interceptor can read it. Keep the username too
   (decode the JWT or a `bo_user` cookie) for the Header. Add a tiny `lib/auth.ts`
   (`setToken/getToken/clearToken/getUser`).
3. **Route guard** `src/proxy.ts` (Next 16 renamed `middleware` → `proxy`; mirror
   `smart-scheduler-front/src/proxy.ts`): no `bo_token` → redirect `/login?next=<path>`.
   Matcher: `/dashboard`, `/freelance-budgets`, `/ftpt-salary`, `/items`, `/inventory`,
   `/reports`, `/wallet`, `/payroll` (exclude `/login`, `/_next`, static).
4. **API client** `src/lib/api/client.ts` (the line-24 TODO): **request interceptor** attaches
   `Authorization: Bearer <bo_token>`; **response interceptor** on `401` → `clearToken()` +
   redirect to `/login?next=<current>`.
5. **Header** `src/components/layout/AdminLayout/Header/Header.tsx:18`: replace the hardcoded
   `"แอดมิน"` with the signed-in username + a **logout** button (clearToken → `/login`).

## Definition of Done
- [ ] Visiting any admin page while unauthenticated → redirected to `/login`.
- [ ] Correct creds → logged in → create/edit freelance budgets, FT/PT salaries, items with **no 403**.
- [ ] Wrong creds → clear error, not logged in. Refresh keeps the session (cookie persists); logout → `/login`.
- [ ] A `401` from the API (expired token) auto-redirects to `/login`.
- [ ] `bunx tsc --noEmit` + `bun run build` clean.

## Implementation Notes
Repo: `smart-scheduler-backoffice-front`. Lightweight cookie+JWT admin session per SPEC-003
(NO NextAuth — the ops JWT verify from TASK-013 is the real control). Built against TASK-013's
frozen contract: `POST /api/v1/auth/login {username,password}` → `{token, user:{username,role}}`.

**Files added**
- `src/lib/auth.ts` — `setToken/getToken/clearToken/getUser` on the **`bo_token`** cookie
  (`SameSite=Lax`, `Secure` in prod, 12h, JS-readable). `getUser` decodes the JWT `sub` claim
  (display only). `safeNext()` — only allows same-origin relative redirects (blocks `//`, `/\`,
  absolute → prevents open-redirect via `?next`).
- `src/services/auth.service.ts` — `login(username,password)` → `POST /v1/auth/login` via the `api` client.
- `src/app/login/page.tsx` — Mantine login form, **outside** `(admin)` (so the admin shell doesn't wrap it).
  On success: `setToken` + `router.replace(safeNext(?next))`. Wrong creds → Mantine Alert from the shared
  `{error:{code,message}}` envelope. Reads `next` from `window.location` (no `useSearchParams` → no Suspense/
  dynamic-render needed).
- `src/proxy.ts` — Next 16 route guard (renamed middleware). No `bo_token` cookie → redirect
  `/login?next=<path>`. Matcher = the 8 admin pages (dashboard, freelance-budgets, ftpt-salary, items,
  inventory, reports, wallet, payroll); `/login` + `/_next` + static excluded.

**Files changed**
- `src/lib/api/client.ts` — **request** interceptor attaches `Authorization: Bearer <bo_token>`;
  **response** interceptor on `401` → `clearToken()` + redirect to `/login?next=<current>`, **skipped for
  `/auth/login`** so wrong-creds shows the inline error instead of bouncing. Also updated the stale default
  baseURL `3002`→`4010` (matches TASK-011 / `.env`).
- `src/components/layout/AdminLayout/Header/Header.tsx` — replaced hardcoded `"แอดมิน"` with `getUser()`
  (read in `useEffect` after mount to avoid an SSR/client hydration mismatch) + a **logout** button
  (`clearToken` → `/login`).

**Verification (evidence)**
- `bunx tsc --noEmit` → **exit 0**; `bun run build` → **exit 0** — `/login` route emitted and
  **`ƒ Proxy (Middleware)`** listed (the guard is wired).
- **Live guard check (no creds, no real env):** `bun run dev`, cleared the cookie, visited
  `/freelance-budgets` → **redirected to `/login?next=/freelance-budgets`** and the login form rendered
  (username + password). That's **DoD #1 verified end-to-end**.
- ⚠️ **Not executed live (needs the ops API + a valid credential — deploy/real-env):** the correct-creds
  login round-trip (POST → token → access with no 403), the `401`→`/login` auto-redirect, and the
  `SKIP_ADMIN_AUTH=false` enforcement. These depend on TASK-013 running with real `ADMIN_*`/`JWT_SECRET` —
  a go-live/deploy step, not something I drive under the brownfield/no-real-login rules. I did **not** enter
  any credentials. Contract is Jason's TASK-013; token/cookie/interceptor logic verified by inspection + the
  build, and the guard verified live.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

- **Heads-up: built against TASK-013 while it's in REVIEW** (contract frozen in SPEC-003 + Jason delivered
  it exactly). If your TASK-013 review changes the login response shape (`{token,user}`) or the
  `/api/v1/auth/login` path, ping me — small change. Recommend reviewing TASK-013 before TASK-014.
- **Design note (non-blocking):** used a **JS-readable `bo_token` cookie** (not httpOnly), exactly as
  SPEC-003 specifies, so the `proxy.ts` server guard and the axios client interceptor can both read it.
  The real security is ops verifying the JWT; this is an internal single-admin tool. Flag if you'd rather
  an httpOnly cookie + a `/api/session` echo route for the username instead (heavier; not in SPEC scope).
  > answer (Sober): **JS-readable `bo_token` is correct — keep it** (exactly SPEC-003). ops verifying the
  > JWT is the real control; httpOnly + a session-echo route is over-engineering for an internal single-admin
  > tool. Nice touch adding `safeNext` open-redirect protection — that wasn't even called out, good instinct.
- **Built against TASK-013 in REVIEW:** fine — I reviewed TASK-013 first, it's **DONE** with the exact
  contract you built to (`{token,user}`, `POST /api/v1/auth/login`). No change → no adjustment on your side.

## Review
**Verdict: DONE** ✅ (Sober, 2026-07-20). Re-ran `backoffice-front` `tsc` → exit 0 (build 0 per notes;
guard verified live by Fern → unauthenticated `/freelance-budgets` redirects to `/login?next=…`). Read the
security-critical paths:
- `client.ts`: request interceptor attaches `Bearer <bo_token>`; `401` interceptor `clearToken()` +
  redirect **but skips `/auth/login`** (`!url.includes("/auth/login")`) → wrong creds show inline, no bounce. ✓
- `auth.ts`: `bo_token` cookie helpers; **`safeNext` blocks protocol-relative/absolute redirects**
  (open-redirect guard on `?next`). ✓
- `proxy.ts`: reads the `bo_token` cookie, redirects to `/login` preserving `next`; matcher = the admin pages. ✓
- `Header.tsx`: real username via `getUser()` (post-mount, avoids hydration mismatch) + logout. ✓
Correct-creds round-trip / `SKIP_ADMIN_AUTH=false` enforcement are live/real-env (deploy step) — accepted
under the brownfield rule; the guard + logic are verified. No rework. **REQ-002 build complete.**
