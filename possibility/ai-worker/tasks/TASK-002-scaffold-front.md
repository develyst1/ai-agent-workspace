# TASK-002: Scaffold `possibility-front` (Next.js 16 + UI library per SPEC-001 Q-1)
- Source: SPEC-001 §Frontend layout
- Owner: FE (Fern)
- Status: TODO
- Depends on: none (Q-1 settled 2026-09-19: Ant Design)

## What to do
Q-1 is settled — go.
- UI library: **Ant Design**, exactly per the workspace skill `nextjs-antd-pattern` (owner, 2026-09-19). Use that skill's lockset (`antd 6.4.3` with next 16.2.9 / react 19.2.7) and its provider/SSR setup. `FRONTEND-STANDARD.md` §1 design rules still apply; its Mantine-specific gotchas in §2 do not.
1. In `possibility-front` (path in `machine.local.md`; today only `README.md`): create the Next.js 16 App Router project with the exact pinned lockset from SPEC-001 §Frontend layout and the folder architecture from the workspace skill `nextjs-pattern-generator` (`app/ · components/{ui,common,layout,partials} · hooks/ · services/ · lib/api/ · types/ · context/`, `@/*` alias, React Query provider with `staleTime: 0, gcTime: 0`).
2. `lib/api/api-main.ts`: axios instance with `baseURL = NEXT_PUBLIC_API_BASE_URL`, `withCredentials: true`, and an interceptor that maps the SPEC-001 §D6 error envelope to a typed `ApiError { code, status }`.
3. `lib/i18n/`: `th.ts`, `en.ts` dictionaries (empty except `app.title`), a `useT()` hook, and a `lang` cookie (default `th`) — REQ-005 R3/R5. The header gets a `TH | EN` switch (REQ-005 W). No other pages yet.
4. `.env.example` with `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`; `.env*.local` git-ignored.
5. Apply `FRONTEND-STANDARD.md` §1 from the first commit: one token system, no pure `#000/#fff`, roman headings.

## Definition of Done
- [ ] Install with the skill's package manager, no peer warnings — paste tail.
- [ ] `.env.example` exists with `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (names only) — paste it; the owner fills `.env.local` (tell Sober when it exists).
- [ ] `pnpm dev` serves `http://localhost:3000` showing the app title in Thai; switching to EN changes it and a reload keeps EN — paste the terminal output and describe the check (screenshot path in `ai-worker/tests/harness/` if taken).
- [ ] `pnpm build` passes with zero type errors — paste tail.
- [ ] `git status` shows no `.env*.local`.

## Implementation Notes

## Questions

## Review
