# TASK-002: Frontend bootstrap (Next.js + TypeScript + Mantine)
- Source: SPEC-001
- Status: REVIEW
- Assignee: Fern (FE)
- Depends on: none

## What to do
Stand up a runnable frontend skeleton in `H:\manager-gold\manager-gold-front`.
- Create a Next.js (App Router) + TypeScript app. Add **Mantine** (`@mantine/core`,
  `@mantine/hooks`) and wrap the app in `MantineProvider` (+ Mantine's SSR/ColorScheme
  setup in the root layout).
- Dev server on port **3020** (`next dev -p 3020` in the `dev` script).
- Add a tiny **API client** module (e.g. `lib/api.ts`) that calls
  `NEXT_PUBLIC_API_BASE` (default `http://localhost:4020`) with
  `credentials: "include"` on every request — this is required for the auth cookie.
- Base layout with a simple app shell (header + content). One public page `/`
  that renders a Mantine component and shows the result of `GET /` from the
  backend (proves FE↔BE wiring + CORS). Auth pages come in TASK-004.
- Commit `.env.example` with `NEXT_PUBLIC_API_BASE`. Confirm `.env*` is git-ignored.

Follow `../architecture-baseline.md`. Do NOT build auth screens here.

## Definition of Done
- [x] `bun install` succeeds; no committed `node_modules`/`.env` (git status shows only source + `bun.lock`).
- [x] `bun run dev` serves on :3020, Mantine-styled page renders, no console errors (browser-verified).
- [x] `/` fetches `GET :4020/` with `credentials: "include"` and displays `ok: true` — browser-verified
      against the **real** TASK-001 backend: page showed `{ ok: true, service: "manager-gold-back" }`, clean console.
- [x] `lib/api.ts` sends `credentials: "include"` on all calls (grep-verified).
- [x] `.env.example` committed with `NEXT_PUBLIC_API_BASE` (commit `6e35d94` on `dong`).

## Implementation Notes
Implemented by Fern, 2026-07-27 (Bun package manager, matching workspace house style).

**Stack installed** (`manager-gold-front`): Next.js 16.2.12 (App Router, Turbopack),
React 19.2.8, `@mantine/core` + `@mantine/hooks` 9.5.0, TypeScript 6.0.3.
- ⚠️ Bun first resolved **TypeScript 7.0.2**, which Next 16 rejects ("does not provide
  the compiler API required by Next.js"). Pinned `typescript@6` per Next's own message.
  Flagging in case Jason hits the same on the backend.

**Files added:**
- `package.json` — scripts: `dev`/`start` on **:3020**, `build`. Lockfile `bun.lock`.
- `app/layout.tsx` — root layout (server component): imports `@mantine/core/styles.css`,
  uses `ColorSchemeScript` + `MantineProvider` + `mantineHtmlProps` (Mantine SSR/color-scheme
  setup), plus a simple app-shell header ("manager-gold") + `Container` for content. The header
  is where TASK-004's logout control will go.
- `app/page.tsx` — public `/` (client component): renders Mantine components and calls `GET /`
  via `lib/api.ts`; shows the JSON on success or a graceful "Backend not reachable" alert otherwise.
- `lib/api.ts` — thin `fetch` wrapper; reads `NEXT_PUBLIC_API_BASE` (default
  `http://localhost:4020`) and sends `credentials: "include"` on **every** call. All FE→BE
  calls must go through here.
- `.env.example` (`NEXT_PUBLIC_API_BASE=http://localhost:4020`), `tsconfig.json`, `next.config.ts`.
- `.env` / `.env*.local` / `node_modules` are git-ignored (confirmed via `git check-ignore`).

**Verification (evidence):**
- `bun install` → OK; `git status` shows only source files + `bun.lock` (no `node_modules`/`.env`).
- `bun run build` → ✓ compiled, TypeScript passed, `/` and `/_not-found` prerendered static.
- `bun run dev` → Ready on `http://localhost:3020`, `GET / 200`, dev log clean.
- End-to-end (real browser): loaded `http://localhost:3020` against a throwaway mock on :4020
  (mirrors baseline §5: `Allow-Origin: http://localhost:3020`, `Allow-Credentials: true`,
  answers the `OPTIONS` preflight). Page displayed `{ "ok": true, "service": "mock" }` from
  `GET /` with `credentials: "include"`; **console had zero errors**. Mock torn down; :4020 left free.

**For Sober:**
- Did NOT build auth screens (TASK-004 scope).
- Contract note to relay to Jason if useful: `lib/api.ts` sets `Content-Type: application/json`
  on all requests, so cross-origin **GETs also trigger a CORS preflight** — the backend must
  answer `OPTIONS` for `/` and `/api/*`. (Jason's log says TASK-001 already returns
  `Allow-Credentials: true`; a live end-to-end check against the real backend can be done when
  you coordinate it.)
- Work is in the **working tree, not committed** (Jason committed his to branch `dong`; I held off
  on git ops pending the team's go-ahead on branch/commit flow). Ready to commit on your word.

**Rework addressed (2026-07-27, both items from Sober's Review):**
1. **Committed** to branch `dong` in `manager-gold-front` per baseline §6 — commit
   `6e35d94` "TASK-002: frontend bootstrap …", includes `.env.example` + all source
   (8 files). Verified no `node_modules`/`.env`/`.next` staged; not pushed (default
   branch is the human's call). Tree clean.
2. **Live re-confirm vs the real backend:** ran `manager-gold-back` on :4020
   (`bun install` → `bun run migrate` → `bun run start`; `GET /` →
   `{ok:true,service:"manager-gold-back"}`, preflight from :3020 →
   `Allow-Credentials: true`). Loaded `http://localhost:3020/` in a real browser →
   page rendered `{ "ok": true, "service": "manager-gold-back" }` via
   `credentials: "include"`, **console clean (zero errors)**. Servers stopped, ports freed.
- Deferred (Sober's optional, non-blocking): only set `Content-Type` when a body is
  present so bodiless GETs skip the preflight — I'll fold this into TASK-004 rather than
  re-touch `lib/api.ts` in this rework. Flag if you'd rather I do it now.

## Questions
- Fern: held off on git ops pending the team's branch/commit flow.
  > answer (Sober): **Commit to branch `dong`** in `manager-gold-front` (matches Jason).
  > Each TASK = at least one commit referencing the TASK id; commit `.env.example` + all
  > source; never commit `.env`/`node_modules`/`.next`. Do NOT push or merge to the default
  > branch — that's the human's call at deploy. Full rule now in `architecture-baseline.md` §6.
- Fern: `lib/api.ts` sets `Content-Type: application/json` on every request, so cross-origin
  GETs also trigger a CORS preflight — backend must answer `OPTIONS`.
  > answer (Sober): Noted and relayed to Jason (TASK-003). TASK-001's CORS already answers
  > `OPTIONS` for all paths, so this works today. Minor cleanup you *may* do (not required):
  > only set `Content-Type` when there's a body, so bodiless GETs skip the preflight.

## Review
**Verdict: REWORK** — Sober, 2026-07-27. The code is correct and matches SPEC-001
(reviewed working-tree `lib/api.ts`, `app/layout.tsx`, `app/page.tsx`, `package.json`,
`.env.example`): credentials on every call, proper Mantine SSR setup, :3020, graceful
backend-error state, no auth (scope-correct). Good catch flagging the TS7→TS6 issue and
the preflight-on-GET behavior. Two DoD gaps to close — small:

1. **Commit the work** to branch `dong` (see convention above / baseline §6), **including
   `.env.example`**. Right now the whole deliverable is untracked (`git ls-files` shows only
   the initial commit) — DoD "commit `.env.example`" is unmet and uncommitted work isn't "done".
2. **Live re-confirm** DoD item 3 against the **real** backend (TASK-001 is DONE and runnable),
   not the mock: start `manager-gold-back` on :4020, load `http://localhost:3020/`, confirm the
   page shows `{ ok: true, service: "manager-gold-back" }` via `credentials:"include"` with a
   clean console. Paste the result into Implementation Notes.

Nothing else needs to change. Re-submit to REVIEW when these two are done.
