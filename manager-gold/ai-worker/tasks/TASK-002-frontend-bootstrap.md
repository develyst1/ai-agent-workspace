# TASK-002: Frontend bootstrap (Next.js + TypeScript + Mantine)
- Source: SPEC-001
- Status: TODO
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
- [ ] `npm install` (or `bun install`) succeeds; no committed `node_modules`/`.env`.
- [ ] `npm run dev` serves on :3020 with no console errors; a Mantine-styled page renders.
- [ ] With TASK-001's backend running, the `/` page successfully fetches `GET :4020/`
      using `credentials: "include"` and displays `ok: true` (verifies CORS+cookies path).
- [ ] `lib/api.ts` sends `credentials: "include"` on all calls (grep-verifiable).
- [ ] `.env.example` committed with `NEXT_PUBLIC_API_BASE`.

## Implementation Notes
(Fern fills this in.)

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review
(Sober fills this in at REVIEW.)
