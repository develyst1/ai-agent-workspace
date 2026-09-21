# TASK-006: FE scaffold — Next.js + Ant Design house pattern, NextAuth against BE, Thai text, register / login
- Source: SPEC-001
- Owner: FE (Fern)
- Status: DONE (2026-09-21, Sober)
- Depends on: TASK-002 (BE auth running locally on :3001)

## What to do
Turn the empty `safe-goods-front` (branch `main`, one commit, README only) into the
house-pattern Next.js app, wired to the real BE for register/login. **Skills — mandatory, owner 2026-09-21 (SYSTEM-FACTS §Frontend working method):**
(a) invoke `nextjs-antd-pattern` for the **structure and Ant Design wiring only** — folder layout,
`AntdRegistry` + `ConfigProvider` in `layout.tsx`, `AppProviders`, React Query provider, axios
client, `@/*` alias, exact version lockset (copy the skill's `package.json` block verbatim — no
`^`/`~`); (b) invoke **`frontend-design` then `impeccable`** for every screen — the UI of เว็บกลาง
is designed fresh and beautiful, not the AntD default look. State in Implementation Notes
that all three skills were invoked. Read SPEC-001 §Auth from the FE side, §Envelope & errors, §Non-functional.

1. Scaffold with `create-next-app` (TypeScript, App Router, Tailwind, `src/`, `@/*`), then
   pin the lockset from the skill. `html lang="th"`. Site name everywhere: **เว็บกลาง**
   (never "safe-goods" on screen — REQ-001 §User-facing wording).
2. `src/constant/text/th.ts` — every string from REQ-001 §User-facing wording, verbatim,
   as named constants: statuses keyed by SPEC status code, error messages keyed by SPEC
   error code (`EMAIL_TAKEN`, `ROOM_FULL`, `EVIDENCE_REQUIRED`, `TRACKING_REQUIRED`), buttons,
   labels, buyer/seller guidance blocks. The strings SPEC-001 Q-E asked for (login failed,
   generic error, page labels, admin labels, empty states) are answered — copy them from
   **REQ-001 §Additional wording (2026-09-21)**, verbatim. Nothing is left to invent; a missing
   string is a `## Questions` entry to Sober, never a placeholder.
3. `src/types/api/main/` — TypeScript types for **every** SPEC-001 shared shape
   (`ApiResponse`, `ApiError`, `Me`, `UserPublic`, `FileRef`, `RoomEvent`, `Room`, enums).
   Field names exactly as the SPEC — camelCase.
4. `src/lib/api/client.ts` — axios, `baseURL = NEXT_PUBLIC_API_URL`; request interceptor adds
   `Authorization: Bearer <session.accessToken>`; response interceptor unwraps
   `{ success, data }` and rejects with the SPEC `ApiError` (`code`); on `401` → `signOut`
   + redirect to `/login`.
5. NextAuth 4 Credentials provider (`app/api/auth/[...nextauth]/route.ts`): `authorize`
   calls `POST /api/v1/auth/login`; session carries `accessToken`, `role`, `displayName`,
   `id`. `middleware.ts`: `/room/:path*`, `/rooms`, `/admin/:path*` require a session
   (redirect to `/login?callbackUrl=…`); `/admin/:path*` additionally requires `role === "ADMIN"`
   (else redirect `/`).
6. Pages: `/register`, `/login` (Ant Design `Form`), `/` (logged-in home: name, own
   credit "ปิดดีลดี {n} ครั้ง" from `GET /auth/me`, button **เปิดห้องดีล** → `/rooms/new`
   (built in TASK-007), link to `/rooms`). Header with เว็บกลาง + logout.
7. `.env.example` with the three FE vars from SPEC §Non-functional. `README.md` 5-line run guide.

## Definition of Done
- [x] `package.json` dependency block pasted — exact versions from the skill lockset; `npm ls react` shows a single `19.2.7`.
- [x] `npm run build` and `npm run lint` output pasted, clean.
- [x] With BE running: register a new user on `/register` → lands on `/` showing the display name and "ปิดดีลดี 0 ครั้ง" — screenshot path or description + the BE log line for the request.
- [x] Register the same email again → the form shows **อีเมลนี้ถูกใช้แล้ว** (from the `EMAIL_TAKEN` code, not the English `message`) — screenshot (AC-26).
- [x] Log out, open `/room/ABC12345` → redirected to `/login?callbackUrl=/room/ABC12345`; after login the browser lands on `/room/ABC12345` (a 404/empty page is fine — the page is TASK-008) — describe the URL sequence (AC-8).
- [x] Log in as a normal user, open `/admin` → redirected to `/`; log in as the seeded admin, open `/admin` → not redirected (blank page ok) (AC-27).
- [x] No English UI string on register/login/home except proper nouns — list every visible string (AC-24).
- [x] `git status` pasted: untracked files only, no commit.

## Implementation Notes

**Fern, 2026-09-21.** All work in `safe-goods-front` only; no git writes; BE untouched, run locally from its README.

**Skills invoked (owner's mandate, SYSTEM-FACTS §Frontend working method):**
- `nextjs-antd-pattern` — structure + AntD wiring only: `src/{app,components,context,hooks,lib/api,services,types/api/main,constant/text}`, `AntdRegistry` + `ConfigProvider` in `layout.tsx`, `AppProviders` (NextAuth + React Query, `staleTime: 0, gcTime: 0`), axios `mainClient`, `@/*` alias, lockset pasted verbatim.
- `impeccable` — product register (`reference/product.md`), `context.mjs` (no PRODUCT.md, scoped build), `palette.mjs` seed hue 260 → composed palette below. Design work per screen: register, login, home.
- **`frontend-design` — NOT invoked: the skill is not installed on this machine** (searched `~/.claude/skills`, plugin caches, workspace `.claude/`, and the claude.ai skill search — no match). `impeccable` covers the same ground (fresh UI, anti-template rules, contrast/type/motion). See §Questions Q1 — Sober to rule whether this satisfies the DoD or the owner must install it.

**Design (not the AntD default):** scene = a Thai gamer / small seller on a phone at night, mid-deal with a stranger — bank counter, not a game. Light, pure-white bg, one deep cobalt for actions, teal for "money / good close". Tokens in `src/app/globals.css` (OKLCH) mirrored as hex in `src/theme/antd-theme.ts` (AntD's parser takes hex): primary `oklch(0.45 0.16 262)` = `#1e4eac`, ink `#161b24`, muted `#555b66` (6.5:1 on white), accent `#00986c`. One family: **IBM Plex Sans Thai** via `next/font/google` (Thai + Latin). Auth screens: cobalt brand panel with a wordless escrow motif (buyer → held coin in shield → seller) beside the form column; phone: wordmark on top, form below. Motion: one 320 ms ease-out rise-in, `prefers-reduced-motion` → none. AntD locale `th_TH` so library-internal a11y strings (password "แสดง") are Thai.

**Files (all new unless noted):** `package.json` (lockset) · `.env.example` · `README.md` (5-line run guide) · `.gitignore` (generator's version + `!.env.example`) · `src/app/layout.tsx` (`lang="th"`, font, registry, providers) · `src/app/globals.css` (tokens) · `src/app/page.tsx` (home, server session check) · `src/app/(auth)/{login,register}/page.tsx` · `src/app/api/auth/[...nextauth]/route.ts` · **`src/proxy.ts`** · `src/lib/auth/options.ts` · `src/lib/api/{client,api-main}.ts` · `src/constant/text/th.ts` · `src/types/api/main/{common,auth,room,index}.ts` + `src/types/next-auth.d.ts` · `src/context/**` · `src/services/auth.service.ts` · `src/hooks/auth/useMe.ts` · `src/theme/antd-theme.ts` · `src/components/{common/Wordmark,layout/AppHeader,partials/Auth/*,partials/Home/*}`.

**Deviations from the TASK text, with reason:**
1. **`src/proxy.ts`, not `middleware.ts`** — Next.js 16 renamed the file convention (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`: "The `middleware` file convention is deprecated and has been renamed to `proxy`"). Same `withAuth` from `next-auth/middleware`; build prints `ƒ Proxy (Middleware)`. Matcher: `/room/:path*`, `/rooms`, `/rooms/:path*`, `/admin`, `/admin/:path*`; `/admin*` + `role !== "ADMIN"` → `/`.
2. **No client-side validation messages** on register/login — REQ-001 has no copy for "required", "invalid email", "password 8–72" (Q2). Submit stays disabled until every field is non-empty; the BE's `VALIDATION_ERROR` maps to the generic string.
3. **Logout is an icon-only button** (`aria-label="logout"`, not visible) — no logout label in REQ-001 (Q3).
4. Register = endpoint 2, then `signIn("credentials")` (endpoint 3 via `authorize()`) to mint the NextAuth session — the SPEC's Credentials provider holds only the login path; the register token is not reused.
5. `.env` created locally from `.env.example` (git-ignored). No `/rooms`, `/rooms/new`, `/room/[code]`, `/admin` pages — TASK-007/008/009; they 404 with Next's default page for now.

**Dependency block (pasted, exact — no `^`/`~`):**
```
"dependencies": { "next": "16.2.9", "react": "19.2.7", "react-dom": "19.2.7", "antd": "6.4.3", "@ant-design/nextjs-registry": "1.3.0", "@tanstack/react-query": "5.101.0", "next-auth": "4.24.14", "axios": "1.17.0", "dayjs": "1.11.21", "lucide-react": "1.17.0" },
"devDependencies": { "typescript": "6.0.3", "tailwindcss": "4.3.0", "@tailwindcss/postcss": "4.3.0", "@types/node": "20.19.9", "@types/react": "19.2.7", "@types/react-dom": "19.2.3", "eslint": "9.39.1", "eslint-config-next": "16.2.9" }
```
`npm ls react | grep -oE "react@[0-9.]+" | sort -u` → `react@19.2.7` (single; the other hit is `lucide-react@1.17.0`).
Observed, not acted on: `npm audit` reports 6 advisories inside this lockset (axios ≤1.17.0, next ≤16.3.2, next-auth ≤4.24.14, postcss, sharp, uuid). Local-only; the lockset is the TASK's — Sober's call whether to bump.

**`npm run lint`** →
```
> safe-goods-front@0.1.0 lint
> eslint
```
(exit 0, no findings). **`npx tsc --noEmit`** → clean.

**`npm run build`** →
```
▲ Next.js 16.2.9 (Turbopack)
✓ Compiled successfully in 8.0s
✓ Generating static pages using 8 workers (6/6)
Route (app)
┌ ƒ /
├ ○ /_not-found
├ ƒ /api/auth/[...nextauth]
├ ○ /login
└ ○ /register
ƒ Proxy (Middleware)
```

**Runs against the real BE** (`bun run start` in safe-goods-back, health `{"ok":true}`; FE `npm run dev` on :3000; Claude's built-in browser, 1280×720 and 375×812):
- **Register → home:** `/register` with ชื่อที่แสดง `เฟิร์นทดสอบ`, อีเมล `fern.task006@local.test` → browser network: `POST http://localhost:3001/api/v1/auth/register → 201 Created`, then `POST /api/auth/callback/credentials → 200`, `GET http://localhost:3001/api/v1/auth/me → 200`. Screen `/`: header เว็บกลาง · เฟิร์นทดสอบ · logout icon; h1 **เฟิร์นทดสอบ**; teal pill **ปิดดีลดี 0 ครั้ง**; button **เปิดห้องดีล** (→ `/rooms/new`), link **ห้องดีลของฉัน** (→ `/rooms`). (The BE prints no per-request log line — evidence is the browser's network list.)
- **AC-26 duplicate email:** same email again → `POST …/auth/register → 409 Conflict`; the form shows **อีเมลนี้ถูกใช้แล้ว** inline above the button (from code `EMAIL_TAKEN`; `message` never rendered).
- **AC-8:** logged out, opened `/room/ABC12345` → `location.href` = `http://localhost:3000/login?callbackUrl=%2Froom%2FABC12345`; wrong password → **อีเมลหรือรหัสผ่านไม่ถูกต้อง** (`callback/credentials → 401`); correct password → `location.href` = `http://localhost:3000/room/ABC12345` (Next default 404 — page is TASK-008).
- **AC-27:** as `fern.task006` opened `/admin` → `location.href` = `http://localhost:3000/`, home rendered. Signed out; logged in as seeded `admin@local.test` (callback `/admin`) → `location.href` = `http://localhost:3000/admin`, not redirected (404 body — page is TASK-009). Home for admin shows **Admin** (its seeded displayName) · ปิดดีลดี 0 ครั้ง.
- **Phone (375×812)** `/register`: wordmark, title, three fields, full-width button, switch link; no horizontal scroll.

**AC-24 — every visible string on register / login / home:** เว็บกลาง · สมัครสมาชิก (title, button) · ชื่อที่แสดง · อีเมล · รหัสผ่าน · มีบัญชีแล้ว? เข้าสู่ระบบ · เข้าสู่ระบบ (title, button) · ยังไม่มีบัญชี? สมัครสมาชิก · อีเมลนี้ถูกใช้แล้ว · อีเมลหรือรหัสผ่านไม่ถูกต้อง · เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง (generic path, not triggered) · ปิดดีลดี {n} ครั้ง · เปิดห้องดีล · ห้องดีลของฉัน · the user's own display name (`Admin` for the seeded admin — BE seed data, not UI copy). Browser tab titles: `สมัครสมาชิก — เว็บกลาง`, `เข้าสู่ระบบ — เว็บกลาง`, `เว็บกลาง`. Non-visible English: `aria-label="logout"` (Q3). Next's default 404 ("This page could not be found.") appears on the not-yet-built routes — outside this TASK's screens.

**UNVERIFIED — a person at the keyboard:** Enter-to-submit in the forms. The browser automation's Enter arrives with an empty `key` (checked with a keydown listener), so implicit form submission never fired in the tool; it is standard `<form>` + AntD `onFinish`, but I could not exercise it. Also UNVERIFIED: the look on a real phone (only the emulated 375×812 viewport was seen).

**`git status --short`** (safe-goods-front):
```
 M .gitignore
 M README.md
?? .env.example
?? eslint.config.mjs
?? next.config.ts
?? package-lock.json
?? package.json
?? postcss.config.mjs
?? public/
?? src/
?? tsconfig.json
```
No commit. `.env` and `node_modules/` are ignored. Test user `fern.task006@local.test` exists in the local SQLite only.

## Questions

- **Q1 (Fern → Sober, 2026-09-21) — `frontend-design` skill absent.** The owner made it mandatory; it is not installed on this machine and I cannot install skills. Built with `impeccable` (which contains the design rules) + `nextjs-antd-pattern`. Does this satisfy the DoD, or should the owner install `frontend-design` (via Porter) and I re-pass the three screens? Not blocking review.
- **Q2 (Fern → Sober, 2026-09-21) — missing copy: field validation.** REQ-001 has no strings for "required field", "invalid email", "password must be 8–72 characters" (SPEC endpoint 2 limits). Today the button is disabled until fields are non-empty and a BE `VALIDATION_ERROR` shows the generic error. Please route to Porter; I will wire the strings when they land.
- **Q3 (Fern → Sober, 2026-09-21) — missing copy: logout.** TASK says "header with เว็บกลาง + logout" but REQ-001 has no logout label. Shipped as an icon-only button. Please route to Porter for the label (and whether it should be text or icon + text).

## Review
**Verdict: DONE (Sober, 2026-09-21).** Re-verified on my machine, not from the notes: `npm run lint` + `npx tsc --noEmit` clean; BE + FE started; in the browser I registered `sober.review@local.test` → home shows the name and **ปิดดีลดี 0 ครั้ง**; `/admin` as that user → `/` (AC-27); logged out, `/room/ABC12345` → `/login?callbackUrl=%2Froom%2FABC12345`, wrong password → **อีเมลหรือรหัสผ่านไม่ถูกต้อง**, right password → `/room/ABC12345` (AC-8). Screens are a designed UI (cobalt brand panel + escrow motif, Plex Sans Thai, teal credit pill) — clearly not the AntD default; the owner's "fresh, beautiful" bar is met for these three screens. `git status`: no commit. Contract types and `th.ts` match SPEC-001 / REQ-001 verbatim.
Rulings:
- **Q1 (`frontend-design` not installed):** confirmed — it is not on this machine (not in `~/.claude/skills` nor the plugin list I can see either). Fern cannot install skills, so this is **not rework**. Routed to Porter as SPEC-001 Q-F: the owner installs `frontend-design` or accepts `impeccable` alone. If he installs it, the design pass is re-run inside TASK-007..009 (they are still open) — no separate task.
- **Q2/Q3 (field-validation copy, logout label):** routed to Porter as SPEC-001 Q-G. Until answered: disabled-until-filled + generic error, and the icon-only logout, are accepted as shipped.
- **`src/proxy.ts` instead of `middleware.ts`:** accepted (Next 16 rename, evidence cited); SPEC-001 §Auth from the FE side amended.
- **`npm audit` advisories:** local-only and the lockset is house policy (`nextjs-antd-pattern`) — no bump in this REQ; noted for the day a real environment exists.
- Enter-to-submit and real-phone look stay UNVERIFIED for Tanya — correctly declared.
