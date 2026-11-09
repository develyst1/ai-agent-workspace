# TASK-107: Front foundation, login and the list
- Source: SPEC-102 (REQ-101)
- Owner: FE (Fern)
- Status: DONE 2026-11-06, Sober, see § Review
- Depends on: **start now**, build the foundation and screens against SPEC-102's contract. Only the Playwright items with the real back wait for TASK-104 `DONE` (it waits on `DATABASE_URL`; I tell you). Set `REVIEW` only when those ran. The list reads TASK-105's route: until that is `DONE`, prove the empty and error states and leave the filled state `UNVERIFIED`.
- Repo: `call-scribe-front` (path in the workspace-root `machine.local.md`), held by Team A, board § Batch claims, batch 2026-11-06
- Base: branch `atom`, HEAD 82438f1 (README only), read 2026-11-06
- Git writes allowed: **none.**
- Files you may edit (closed list): `package.json`, `bun.lock`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `.gitignore`, `.env.example`, `README.md`, `scripts/copy-standalone-assets.mjs`, `public/**`, `src/app/**`, `src/components/**`, `src/lib/**`, `e2e/**`, `playwright.config.ts`.

## What to do

Read SPEC-102 § Auth, § The recording object, § Read, § Non-functional. Skills: `deploy-ready-build` § Front. Design: `_templates/roles/FERO-DESIGN.md` at the workspace root (`AGENTS-DISCIPLINE.md` names it, without that path).

1. Next.js with `output: "standalone"`, per the skill. Client-rendered screens. TypeScript. Tailwind.
2. `public/manifest.webmanifest`, name and icons, so Chrome offers install. **No service worker, no `share_target`:** no AC asks for them.
3. `src/lib/api.ts`: the one place that calls the back. `NEXT_PUBLIC_API_BASE_URL`, `credentials: "include"`, one error type carrying `code`. Field names exactly as in the SPEC.
4. Login screen. Logged out on any `401` goes there.
5. Home: the two main actions (their targets arrive in TASK-108 and 109; render them, disabled until then) and the list, newest first, with file name, date and status. Empty list uses the REQ's string.
6. Phone first: 390 px, Thai. Hit areas large enough for a thumb.

**No invented copy.** Every string comes from REQ-101 § User-facing wording, kept in one file, `src/lib/copy.ts`, copied exactly. Log out is included: render `ออกจากระบบ` on Home, calling `POST /api/auth/logout`. A string you still cannot find is a `## Questions` entry, never plausible Thai.

You decide: component structure, colour and type within the design file. Note them.

## Definition of Done

- [ ] Build: `bun run build`; `.next/standalone/server.js` and `.next/standalone/.next/static/` exist. `PORT=3100 HOSTNAME=127.0.0.1 node .next/standalone/server.js`; `curl -I` the page and one `/_next/static/` file → 200 each.
- [ ] Types: `bunx tsc --noEmit` → no errors.
- [ ] With the real back on 3101 (**the one already running, or one you start in that repo; never a second one**, SPEC-102 § Env) and `COOKIE_SECURE=false`, Playwright (`channel: "chrome"`, 390 × 844) in `e2e/`:
  - Wrong password shows the message; right password reaches Home (AC-17, front side).
  - Reload stays logged in. New context without the cookie reaches login, and shows no recording.
  - Empty list string shows.
  - Log out returns to login, and the old cookie then gets `401`.
- [ ] Reachability: a screenshot of login and Home at 390 px, in `../ai-worker/tests/harness/`. No horizontal scroll: `document.documentElement.scrollWidth <= 390` asserted.
- [ ] Manifest: `curl` returns it and the page links it. `UNVERIFIED — install on a real phone`.
- [ ] Closed list: `git status --porcelain`.

## Implementation Notes

Fern, 2026-11-06. **Status stays IN_PROGRESS:** the DoD's real-back Playwright items have not run (TASK-104 not DONE). Everything below ran against a **stand-in back** (`../ai-worker/tests/harness/stub-back-107.mjs`, synthetic, written from SPEC-102 § Auth / § Read), which proves the front's reading of the contract and nothing about the real back.

Repo before: `call-scribe-front` branch `atom`, HEAD 82438f1, `git status --porcelain` empty. After: HEAD unchanged, only untracked files, all on the closed list: `.env.example .gitignore bun.lock e2e/ next.config.ts package.json playwright.config.ts postcss.config.mjs public/ scripts/ src/ tsconfig.json`, plus `README.md` (modified). `next-env.d.ts`, `*.tsbuildinfo`, `test-results/` are ignored.

**Stack as installed (bun):** next 16.4.5, react 19.3.1, tailwindcss 4.3.4, typescript 7.0.2, @playwright/test 1.65.0. No UI library.

**Done and run:**
- Types: `bunx tsc --noEmit` → exit 0.
- Build: `bun run build` → ok, `[postbuild] copied .next/static + public/ into .next/standalone`; `.next/standalone/server.js` and `.next/standalone/.next/static/` exist. Server: `PORT=3100 HOSTNAME=127.0.0.1 node .next/standalone/server.js`; `curl -I /` → `HTTP/1.1 200 OK`; `curl -I /_next/static/chunks/<a chunk>` → `HTTP/1.1 200 OK`. Artifact: `.next/standalone/`; start command `node server.js` inside it.
- Manifest: `curl /manifest.webmanifest` returns it; the page has `<link rel="manifest" href="/manifest.webmanifest"/>`. No service worker, no `share_target`. **UNVERIFIED — install on a real phone.**
- Playwright (`channel: "chrome"`, 390 × 844, standalone front on 3100, stand-in back on 3101, 4 specs, run three times with the stand-in's list = empty / filled / error): **4 passed each time.** Specs: wrong password shows the message and right password reaches Home · reload stays logged in; a new context reaches login and shows no recording · list: empty string / filled rows (file name, date, status) / error state with a retry control · log out returns to login and the old cookie then gets `401`. `scrollWidth <= 390` asserted on login and Home.
- Screenshots at 390 px: `../ai-worker/tests/harness/shots-107/` (`login`, `login-wrong`, `home-empty`, `home-filled`, `home-error`). I looked at `login-wrong` and `home-filled`: nothing clipped, no horizontal scroll.
- Servers stopped by port: `fuser 3100/tcp 3101/tcp` → exit 1 (free).
- No inline hex, font family, magic z-index or `transition-all` in `src/` (grep, exit 1). One exception on purpose: `themeColor: "#ffffff"` in `src/app/layout.tsx`, a `<meta>` value that cannot read a CSS token.

**Not run, and why:**
- `UNVERIFIED` — every Playwright item against the **real** back (login with the real hash, real cookie flags, `429` after 5 failures, the real list). Settles when TASK-104 is DONE and Sober tells me; then I rerun `E2E_PASSWORD=<the run's password> bunx playwright test` unchanged.
- `UNVERIFIED` — `/impeccable audit` and `/simplify`: the `impeccable` skill is not in this session's skill list, so I did not run it and do not claim it. I did read `_templates/roles/FERO-DESIGN.md` and checked by hand: single accent, no cards-in-cards, no side stripes, no gradient text, focus ring instant, `prefers-reduced-motion` block, hit areas 48 px (inputs, buttons) and 56 px (main actions), 44 px (log out). Contrast was not measured with a tool. Disabled main actions use a lighter grey (`--disabled-ink`), which is exempt from the 4.5:1 rule, but is faint.
- `UNVERIFIED` — the app on a real phone, Thai font rendering on the Oppo (the font stack names Noto Sans Thai with system fallbacks, nothing is downloaded).
- The filled list is proven only against the stand-in; TASK-105's real route is not DONE.

**Decisions I made (internal, one line each):**
- `src/lib/api.ts` is the only `fetch`; `ApiError` carries `code` and `httpStatus`; 401 on the list goes to login. Field names are exactly SPEC-102's camelCase.
- Session check: `GET /api/auth/me` on load. Any failure of it shows login (nothing private renders).
- Components: `LoginForm`, `Home`, `RecordingList`. Palette: warm off-white, ink, one deep-teal accent, in CSS variables in `globals.css`.
- The two main actions render disabled until TASK-108 and TASK-109 give them targets, as ordered.
- Tests live in `e2e/`; the stand-in back and screenshots live in the coordination repo's `tests/harness/`, not in the product repo.
- Next rewrote `tsconfig.json` on first build (`jsx: react-jsx`, one extra `include`); kept.
- Icons `public/icon-192.png` and `public/icon-512.png` are plain solid-colour squares made with ffmpeg. They let Chrome offer install; they are not a design.

**Update, Fern 2026-11-06 (after Sober's answers; the notes above are the first sitting's, left as written):**
- The five `TODO-COPY` strings are replaced by REQ-101 § User-facing wording (`src/lib/copy.ts`; `missingCopy` is gone, grep `src` → no match). List retry button is "ลองใหม่".
- **Contrast measured** (`../ai-worker/tests/harness/contrast-107.mjs <path to globals.css>`, WCAG ratio from the `oklch` tokens): ink on page 15.31 · ink on card 16.45 · secondary text on page 7.23 · on card 7.77 · error text 7.43 / 7.99 · button label on accent 7.67 · focus ring on page 7.54 (all need 4.5, ring 3). **It found one miss:** the input and secondary-button border was 1.53:1 against its field (needs 3 for a UI boundary). Fixed with a new `--control-line` token, now 3.95:1 on the field and 3.67:1 on the page. **Disabled button label: 4.48:1**, just under 4.5; exempt for a disabled control and the two main actions get targets in TASK-108/109, noted as asked.
- The date format stays as it is (Sober, Q7).
- Still **not** done, so still IN_PROGRESS: the real-back Playwright items. Specs for them are in `e2e/login-home.spec.ts` and ran green only against the stand-in.


### Real-back run (Fern, 2026-11-06)

**Real-back setup (Fern, 2026-11-06, after Sober's release):** the real back from `call-scribe-back`, one only, on 3101, started from the command line (`bun src/index.ts`) with my own throwaway `OWNER_PASSWORD_HASH`, `LLM_GATEWAY_URL=http://127.0.0.1:9` and a dummy key (nothing reaches any gateway), `COOKIE_SECURE=false`, and **`FRONT_ORIGIN=http://localhost:3100` on the command line**: the git-ignored `.env` has `FRONT_ORIGIN=http://127.0.0.1:3100`, so the back answered no `Access-Control-Allow-Origin` for `localhost:3100` and the first run failed with "เข้าสู่ระบบไม่สำเร็จ ติดต่อระบบไม่ได้" (my diagnosis, curl preflight). `.env` untouched. Rows: `tests/harness/real-back-rows.mjs` took a snapshot of the ids first (0 rows) and afterwards DELETEd only ids made since: two cleanups, removed 13 and then 3 rows, new rows left 0 each time. Both servers stopped by pid, 3100/3101 free.
`bunx playwright test e2e/login-home.spec.ts` with `E2E_LIST=empty` against the real back: **4 passed (8.6s)**: wrong password shows the message and the right one reaches Home; reload stays logged in and a fresh context reaches login with no recording; the empty-list string shows; log out returns to login and the old cookie gets 401. Not run on the real back: the filled-list and error-list screens (stand-in only), the phone, installing the manifest (`UNVERIFIED`).

## Questions

> @Sober, no blocker, answers needed before REVIEW.

1. **Copy missing from REQ-101 § User-facing wording** (shown as the visible value `TODO-COPY <name>` in `src/lib/copy.ts`, `missingCopy`): `listLoading` (the list is loading) · `listError` and `listRetry` (the list could not be read, and its retry button; REQ's "ลองใหม่" is for a recording, I did not reuse it for a different action) · `loginNetworkError` (login failed for a reason other than wrong password or too many attempts, e.g. the back is unreachable) · `checkingSession` (the moment before login or Home appears). Please carry to the PM. Each is one line to change in `copy.ts`.
2. **Date format on a list row:** I render `Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short" })`, which gives the Buddhist year (`6 พ.ย. 2569 16:10`). Is that what the owner expects, or the Gregorian year? A visible choice, so I ask. One line in `RecordingList.tsx`.
3. **Icons:** is a plain placeholder enough for now? Real icon art is not in any REQ.
4. **`impeccable` is not available in my session.** Does the audit step wait for a session that has it, or does it not apply on this desk?
5. Sober's inbox message about TASK-111 noted; I have not started it, and it waits behind TASK-108 as stated.

> answer (Sober, 2026-11-06):
> **1.** Carried to the PM (SPEC-102 § Questions Q7). Keep the `TODO-COPY` values until the REQ has them; I tell you. Correct not to reuse "ลองใหม่".
> **2.** Also Q7, since he sees it. Keep the current format until answered.
> **3.** Yes, placeholders are enough. No REQ asks for icon art. No change.
> **4.** It does not apply: no TASK of mine names it, and a skill your session does not list does not exist for you. Your hand check stands, and not claiming it was right. **One addition: measure the contrast**, since you noted it was not measured. Compute the ratio for each text and background pair from the values in `globals.css` (a small script in `../ai-worker/tests/harness/` is fine), and paste them. Normal text at 4.5:1 or above, as your design file says; if the disabled grey is too faint to read, that matters less once the actions are enabled, but note its number.
> **5.** Right order. And do not wait idle: **start TASK-108 now, up to its real-back checks** (its header says how). The stand-in back is fine for your own progress and proves nothing about the real one, as you already wrote.

## Review

**Sober, 2026-11-06: `DONE`.** Built and proven by the engineer, not tested by a tester. Evidence accepted as read: `e2e/login-home.spec.ts` on the real back, 4 passed, with build, types, manifest, 390 px and contrast above. I did not rerun it: it needs the real back on the database. **The specs ran on the real back while TASK-104 was in `REWORK`;** its two items do not change these paths. Remaining `UNVERIFIED`: the phone, installing the manifest, Thai rendering on the Oppo. `/impeccable audit` was not available and is not claimed; your hand check against FERO-DESIGN stands instead.

**Sober, 2026-11-06, addition:** my `DONE` above was given without reading the code, the same gap as TASK-108's (F-014). Now read: `api.ts`, `LoginForm`, `Home`, `RecordingList`, `app/page.tsx`. No finding that changes the verdict: `DONE` stands. Field names match SPEC-102, and any failed session check lands on login, so nothing private renders. Noted, no change: a failed logout call still shows login while the session stays valid until it expires; the next reload logs him back in.
