# TASK-002: Scaffold `possibility-front` (Next.js 16 + UI library per SPEC-001 Q-1)
- Source: SPEC-001 §Frontend layout
- Owner: FE (Fern)
- Status: DONE
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
_Fern, 2026-09-20. Repo `possibility-front`; all paths below are relative to it._

**Files created** (`src/` layout per the `nextjs-antd-pattern` skill, `@/*` → `src/*`):
- `package.json` (exact pins, no `^`/`~`: next 16.2.9 · react/react-dom 19.2.7 · antd 6.4.3 · @ant-design/nextjs-registry 1.3.0 · @tanstack/react-query 5.101.0 · axios 1.17.0 · typescript 6.0.3), `package-lock.json`, `tsconfig.json`, `next.config.ts`, `.env.example`.
- `src/app/layout.tsx` — AntdRegistry + ConfigProvider(theme) + AppProviders + Header; reads the `lang` cookie server-side and sets `<html lang>` so a reload renders the remembered language with no flash. `src/app/page.tsx` — empty `<main/>` (no other pages yet). `src/app/globals.css` — the token system.
- `src/lib/theme.ts` — antd theme tokens mirroring `globals.css` (antd needs parseable colors; documented as one source, change together).
- `src/lib/i18n/{th.ts,en.ts,index.ts,useT.ts}` — dictionaries (only `app.title`), `Lang`, `LANG_COOKIE="lang"`, `DEFAULT_LANG="th"`, `translate()`, `useT()`.
- `src/context/lang/LangProvider.tsx` (writes `lang=<th|en>; path=/; max-age=1y; SameSite=Lax` + `documentElement.lang`), `src/context/query/QueryProvider.tsx` (`staleTime: 0, gcTime: 0`), `src/context/AppProviders.tsx`.
- `src/lib/api/client.ts` — axios instance, `baseURL = NEXT_PUBLIC_API_BASE_URL`, `withCredentials: true`, response interceptor mapping the §D6 envelope `{error:{code,message}}` → `ApiError { code, status, message }` (non-envelope failures → `ApiError("NETWORK_ERROR", status|0)`). `src/lib/api/api-main.ts` re-exports it; endpoint functions arrive with TASK-004+. `src/types/api/main/common.ts` — `ApiError`, `ApiErrorEnvelope`.
- `src/components/layout/Header/{Header.tsx,Header.module.css,index.ts}`, `src/components/layout/index.ts` — title + antd `Segmented` `TH | EN` (labels are Porter's, REQ-005 W). Empty dirs `components/{ui,common,partials}`, `hooks/`, `services/` exist for the skill layout but hold nothing yet (git will not show them until a file lands).

**Deviations, stated:** (a) package manager is **npm** (the skill's), not pnpm as the DoD wording says — `npm run dev` / `npm run build`. (b) `next-auth`, `tailwindcss`, `dayjs`, `lucide-react` from the skill's lockset are **not installed**: auth is Google Identity + BE cookie (SPEC-001 D5, not NextAuth); Tailwind would be a second color system (FRONTEND-STANDARD §1 "do not mix two color systems"); the other two have no use yet. Trivial to add when a TASK needs them. (c) `next build` rewrote two `tsconfig.json` values itself (`jsx: react-jsx`, added `.next/dev/types/**/*.ts` to `include`) — kept as Next wrote them.

**FRONTEND-STANDARD §1:** tokens are OKLCH CSS vars on `:root` (paper/ink/line/accent, one warm anchor hue, no `#000`/`#fff`); fonts via `next/font` = Noto Sans Thai (body) + Noto Serif Thai (display; roman headings, `font-style: normal`); `:focus-visible` ring with `transition: none`; 4pt spacing vars. Grep of `src/` for inline hex / `font-family:` / `transition-all`: only the comment line in `globals.css` and the mirrored tokens in `lib/theme.ts`. Hit target: the switch was 32 px by antd default → overridden to 44 px (measured) for §3.2. `hallmark audit` **UNVERIFIED** — not installed in this repo (Q-3); today there is one header on an empty page.

**DoD evidence**
1. Install (`npm install`, 2026-09-20) — tail, no peer warnings:
```
added 121 packages, and audited 122 packages in 39s
14 packages are looking for funding
4 vulnerabilities (3 high, 1 critical)
```
`npm ls react` → single `react@19.2.7` (next, react-dom, styled-jsx all `deduped`). The 4 audit findings are in the **pinned lockset itself** (next ≤16.3.2, axios ≤1.17.0, transitive postcss, sharp) — Q-2 below; nothing bumped.
2. `.env.example` (names only):
```
# Copy to .env.local and fill in. Names only here — never commit values.
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```
`.env.local` does not exist yet — the owner fills it (public copy of `GOOGLE_CLIENT_ID` per DR-2; `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000` per SPEC-001 D8).
3. `npm run dev`:
```
▲ Next.js 16.2.9 (Turbopack)
- Local:         http://localhost:3000
✓ Ready in 627ms
```
Screen check in the in-app browser, 2026-09-20 ~23:40: first visit (no cookie) → `<html lang="th">`, no `lang` cookie, header shows the title with **TH** selected. Click **EN** → `document.cookie` = `lang=en`, `<html lang="en">`. Reload → still `lang="en"`, **EN** selected. Click **TH** → reload keeps `th`. Console: no errors, no hydration warnings. 375 px: no horizontal scroll, switch 44 px tall. Server-side proof, reproducible: `ai-worker/tests/harness/task-002-lang-cookie.sh` →
```
no cookie   -> <html lang="th"
lang=en     -> <html lang="en"
lang=th     -> <html lang="th"
lang=bogus  -> <html lang="th"
```
**Caveat on "title in Thai":** the title reads `Possibility` in both languages because no Thai title exists in any REQ (Q-1) — what visibly changes on switch is the selected segment and `<html lang>`. Screenshots were viewed live, not saved to disk.
4. `npm run build` tail (run twice; last after the hit-target fix):
```
✓ Compiled successfully in 6.8s
  Running TypeScript ...
  Finished TypeScript in 2.8s ...
✓ Generating static pages using 4 workers (3/3)
Route (app)
┌ ƒ /
└ ƒ /_not-found
```
Zero type errors.
5. `git status --short` (read-only):
```
?? .env.example
?? next.config.ts
?? package-lock.json
?? package.json
?? src/
?? tsconfig.json
```
No `.env*.local`, no `.next/`, no `node_modules/` (already in the repo's `.gitignore`). No git writes by me.

## Questions
- Q-1 (Sober → Porter, copy): `app.title` — the only Thai/English copy available is the product name **"Possibility"**; no Thai title exists in REQ-001..005 or SYSTEM-FACTS. I used `Possibility` in both dictionaries (a name, not invented copy — same treatment as the tier "The Possibility", EN kept in Thai UI). If Porter wants a Thai title or tagline, give me the two strings and I swap them in one line each.
- Q-2 (Sober, lockset): `npm audit` flags the pinned `next@16.2.9` (critical: middleware bypass GHSA-6gpp-xcg3-4w24, DoS + SSRF in Server Actions — none used by this app today) and `axios@1.17.0` (high, prototype pollution). The lockset is the skill's/owner's decision; I did not bump. If SPEC-001 §Frontend layout should move to a patched next/axios, say so and I re-pin, re-install, re-build.
- Q-3 (Sober, FRONTEND-STANDARD §4): should `hallmark` be installed into `possibility-front` (`npx skills add nutlope/hallmark` writes `.agents/skills/…` into the owner's repo)? Until answered, the audit line in each FE DoD reads UNVERIFIED.

## Review
**Verdict: DONE** (Sober, 2026-09-20 00:05). Checked the repo, not the notes: pins exact (next 16.2.9 · react 19.2.7 · antd 6.4.3 · axios 1.17.0), `.env.example` names only, `withCredentials` + envelope→`ApiError` interceptor present, `lang` cookie 1 y SameSite=Lax, token grep clean (only the comment + `var(--font-*)`), build clean, no `.env*.local` in `git status`. Deviations (npm not pnpm; no next-auth/tailwind/dayjs/lucide) are correct readings of SPEC-001 — accepted. Server-side lang harness is a good addition.
Answers: **Q-1** → Porter (copy); until he answers, `Possibility` in both is right. **Q-2** — yes: security patches within the same major are mine to approve, not the owner's: re-pin `next` to the latest patched 16.x and `axios` to the latest patched 1.x (exact, no `^`), keep antd/react; folded into TASK-006 item 0 with `npm audit` output as evidence. SPEC-001 §Frontend layout amended. **Q-3** — yes, install `hallmark` into `possibility-front` (`.agents/skills/…`) — `FRONTEND-STANDARD.md` §1 says every FE repo; it is dev tooling, not product code. Porter informs the owner it is there.
