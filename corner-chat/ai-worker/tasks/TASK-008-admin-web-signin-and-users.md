# TASK-008: Admin web — Next.js scaffold, owner sign-in, users page (add / disable / enable / reset password)
- Source: SPEC-001 §1 S7, §3.1, §3.2, §3.3 (users rows) · REQ-001 req 1, AC-1, AC-2, AC-4, AC-5, wording table
- Owner: FE (Fern)
- Status: DONE (SA Sober, 2026-11-01)
- Depends on: none to start (build against the contract with a local mock) · the live DoD needs TASK-002 running

- Repo: `corner-chat-front` — no commit convention yet — Team A claim "Batch 2026-11-01" (front: all)
- Base: `main`, HEAD `0f8c0bc` (README only), read 2026-11-01. Git writes: **none.**
- Files you may edit (closed list):
  - everything the scaffold creates at the repo root (`package.json`, lock file, `next.config.ts`, `tsconfig.json`,
    `.gitignore`, `.env.example`, `eslint` config), `scripts/copy-standalone-assets.mjs`
  - `src/app/**`, `src/components/**`, `src/lib/**`, `src/services/**`, `src/types/**`, `public/**`

## Read first
`anthropic-skills:nextjs-antd-pattern` (house pattern: Next 16 + React 19 + Ant Design v6, folder layout) and
`deploy-ready-build` (§Front: `output: "standalone"` + the asset copy script; **build only, never deploy**).

## What to do
1. Scaffold per the house pattern. `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:8080/api/v1`) in `.env.example`.
   Thai UI only. Port 3000 in dev (the back end's CORS default is `http://localhost:3000`).
2. `src/services/api.ts`: one fetch wrapper that sends `Authorization: Bearer <token>`, parses the error body
   `{ error: { code, message, fields? } }` (SPEC-001 §3.1) and maps `code` → the REQ's Thai wording. **Never show
   `message`.** A 401 anywhere → clear the token and go to the sign-in page.
3. Sign-in page: `POST /auth/login`. If `user.role !== "owner"` → do **not** keep the token, show the refusal wording
   (asked in REQ-001 Questions — see below). `INVALID_CREDENTIALS` / `ACCOUNT_DISABLED` / `TOO_MANY_ATTEMPTS` → REQ-001's
   wording. Token kept in `sessionStorage` (closing the tab signs the owner out) `[SA-decided]`.
4. Users page (`GET /admin/users`): table of name, email, status, created date; button **เพิ่มผู้ใช้** → modal (name, email,
   first password ≥ 8) → `POST /admin/users`, `EMAIL_TAKEN` and `VALIDATION.fields` shown at the field; per row
   **ปิดใช้งาน / เปิดใช้งาน** (confirm first) and **ตั้งรหัสผ่านใหม่** (modal, ≥ 8). The owner's own row has no disable button.
   Sign-out button (`POST /auth/logout`).
5. **Wording:** use only the strings in REQ-001's wording table. Strings it does not have (the admin sign-in title, the
   "this page is for the owner only" refusal, table headers, confirm texts, the field labels, the sign-out label) are
   asked in REQ-001 `## Questions` (asked by the SA 2026-11-01). Put each in `src/lib/strings.ts` as a key; until the PM
   answers, use the **key name** as the visible text, and list the open keys in Implementation Notes. Do not write Thai of
   your own.
6. States: loading, empty list, API down ("cannot reach the server" — also a wording key), and each error above.

## Definition of Done (paste real output / screenshots)
- [ ] `bun run build` (or `npm run build`) → `.next/standalone/server.js` and `.next/standalone/.next/static/` exist (paste `ls`).
- [ ] With TASK-002's back end running: owner signs in → users page; adds U1 → U1 listed; signing in to the admin web as U1 →
      refused, no token in `sessionStorage` (REQ-001 AC-1 server side + AC-2) — screenshots at 1280 px.
- [ ] Disable U1 → status changes; enable → back; reset U1's password → the app-side check is Team B's, so prove it with
      `curl POST /auth/login` old password → 401, new → 200 (paste).
- [ ] Every control in §4 renders (screenshot of the users page with the add modal open and one row's actions visible).
- [ ] `git status --porcelain` — only paths in the closed list.

## Implementation Notes
*(Fern, FE Team A, 2026-11-01)*

**Repo state:** before — `corner-chat-front`, branch `main`, HEAD `0f8c0bc`, `git status --porcelain` empty. After — same branch/HEAD, all
untracked, every path inside the closed list: `.env.example .gitignore bun.lock eslint.config.mjs next.config.ts package.json scripts/ src/ tsconfig.json`.
No git writes. Artifact: `.next/standalone/`; server start command `PORT=<p> HOSTNAME=127.0.0.1 node server.js` inside it.

**UNVERIFIED — real back end.** TASK-002 does not exist yet, so every "live" check below ran against a **throwaway mock of SPEC-001 §3.1–§3.3**
(`tests/harness/mock-api-task-008/mock-api.ts`, in-memory, not in the product repo). It follows the SPEC text, not the real server: what would
settle it = the DoD run again against TASK-002 (QA / SA's call). Screenshots were looked at live in the in-app browser (1024 px wide, not 1280)
and **were not saved as files** — also UNVERIFIED as evidence; QA/SA to reproduce.

**Commands run (real output):**
- `bun run lint` → `$ eslint src` (no findings) · `bun run typecheck` → `$ tsc --noEmit` (no errors).
- `bun run build` → Next 16.2.9 compiled; routes `/ /_not-found /login /users`; `[postbuild] copied .next/static into .next/standalone`.
- `ls .next/standalone/server.js` → exists · `ls -d .next/standalone/.next/static` → exists (`chunks/` inside).
- `PORT=3100 HOSTNAME=127.0.0.1 node .next/standalone/server.js` → `curl -I /login` = `HTTP/1.1 200 OK`; `curl -I /_next/static/chunks/3c-_vl9wbvqsi.css` = `HTTP/1.1 200 OK`.
- Reset proof against the mock: `POST /auth/login` U1 old password → `HTTP 401 INVALID_CREDENTIALS`; new password → `HTTP 200` + token.

**Walked in the running app (against the mock):** wrong password → REQ wording shown · owner signs in → `/users` · short password blocked client-side ·
add U1 → listed (newest first) · duplicate email in other case → `EMAIL_TAKEN` key at the email field · disable (confirm first) → status changes, button
flips · enable → back · reset password → modal → done · owner row has no disable button · sign-out → `sessionStorage` token `null`, back on `/login` ·
**U1 signs in to the admin web → refusal key shown, `sessionStorage` has no token (AC-2)** · mock restarted (token invalid) → next call 401 → token
cleared, redirected to `/login` · API stopped → server-down key + retry button, table hidden · 375 px: `scrollWidth 375 = clientWidth 375` (no page
scroll), every button 44 px tall; the table scrolls inside itself, so the row actions need a swipe on a phone (admin web is a desktop page — SA to say if not OK).

**Wording — open keys.** Real Thai only for the REQ-001 table (3 sign-in errors, add / disable / enable / reset). Everything else shows its key name
from `src/lib/strings.ts`; the PM's text goes into `KNOWN` there, nowhere else.
- **Update (Fern, 2026-11-01, after Sober's pointer):** the PM's Thai for every key asked in Q-SA-1 is now in `src/lib/strings.ts` as written
  (`{name}` filled from the row in `admin.confirm.*` / `admin.reset.title`); the confirm dialog's body now shows the email. lint + typecheck +
  build re-run clean; not re-walked in the browser (UNVERIFIED — text swap only). Still showing key names: the "Not in Q-SA-1" list below.
- Asked in REQ-001 Q-SA-1 (ANSWERED, now in the code): `admin.signin.title`, `admin.signin.notOwner`, `admin.users.col.{name,email,status,createdAt}`,
  `admin.users.status.{active,disabled}`, `admin.users.add.fields.{name,email,password}`, `admin.password.min8`, `admin.confirm.{disable,enable}`,
  `admin.reset.title`, `admin.signout`, `admin.error.emailTaken`, `admin.error.serverDown`.
- **Not in Q-SA-1 — I needed them, please add to the PM's list:** `admin.signin.fields.{email,password}`, `admin.signin.submit`, `admin.users.title`,
  `admin.users.add.title`, `admin.users.empty`, `admin.users.loading`, `admin.users.retry`, `admin.reset.fields.password`, `admin.reset.done`,
  `admin.common.{confirm,cancel}`, `admin.error.required`, `admin.error.validation`, `admin.error.generic`. (`admin.linePushes.title` is TASK-009's.)
- Judgement call to confirm: on `VALIDATION.fields` the SPEC's `message`/field reasons are English for developers, so I mark the field with the
  `admin.error.validation` key text instead of the server's reason (TASK step 2 says never show `message`; step 4 says "shown at the field").

**Deviations from the house pattern (declined, to keep it simple):** no NextAuth / React Query / axios / Tailwind (the TASK fixes a fetch wrapper
and a `sessionStorage` token; two screens need none of them) · no `index.ts` barrels · flat `components/users/` instead of `partials/`.
`antd` 6.4.3 / `next` 16.2.9 / `react` 19.2.7 pinned exact per the skill; **`eslint` pinned to 9.x because 10.x crashes `eslint-plugin-react`
(`getFilename is not a function`)**; `@types/node` is `22`, `@types/react(-dom)` `19` (major only). Package manager: bun (`bun.lock`).

**`/impeccable audit` (web, no PRODUCT.md, register = product):** `detect.mjs --json src` → `[]` (no tells). Grep of the diff: no inline hex
(only `--page-bg` token), no font-family, no z-index, no `transition: all`. Fixed from the audit: antd 6 `Alert message` → `title` (console warning),
page title was an `h3` with no `h1` → `level={1}` at 24 px, sign-in page overflowed 100vh (`box-sizing`), table showed a stray scrollbar at 1024 px
and an "empty" text under an error. **Left, minor:** no dark mode (`--page-bg` and antd are light only) · the "password ≥ 8" hint and its error
read the same text (will differ once the PM writes both) · antd's default green `Tag` contrast is not measured (status is also written as text, never
colour alone). **Passing this audit is not the owner's approval of the look.**

**Footprint:** test data only in the mock's memory (U1, `owner@example.test`); servers on :3000 / :3100 / :8080 started and stopped; nothing left
behind except `.next/` and `node_modules/` (git-ignored) in the front repo.

**REWORK round 1 (Fern, 2026-11-01):**
- Item 1 (wording) — done: the Q-SA-1 **and** Q-SA-2 Thai (REQ-001 § Questions, PM 2026-11-01) are in `KNOWN`, copied as written. No key
  shows its name any more except `admin.linePushes.title` (TASK-009's). lint + typecheck + build clean after the swap; the screenshots below were
  taken after it, so they show the final wording. (An earlier note above says 13 keys were open — now closed.)
- Item 2 (evidence files) — done: 1280 × 800, headless system Chrome via `tests/harness/task-008/shoot.mjs` (playwright-core, run against the mock +
  the standalone build; the script asserts and printed `ALL PASS`: token kept after owner sign-in, U1 listed, owner row has no disable button,
  sign-out clears the token, user account refused with no token, server-down shown). Files in `tests/harness/task-008/`:
  `01-signin.png` · `02-users-add-modal.png` (add modal filled, owner row behind) · `03-users-row-actions.png` (U1 row: disable + reset; owner row: reset only) ·
  `04-nonowner-refused.png` (U1 on the admin web) · `05-server-down.png` (API call aborted). Still mock-backed → not the DoD's real-back-end evidence.
- Item 3 (live rerun) — **done 2026-11-01 against the real back end (TASK-002)**, after Sober's "TASK-002 is DONE". Set-up: the back end started as
  `bun src/index.ts` in `corner-chat-back` with its own `.env` (default `PORT` 8080, `ADMIN_WEB_ORIGIN` default `localhost:3000`) → `curl /api/v1/health` =
  `{"ok":true,"db":true}`; its Postgres is the team's own cluster on 127.0.0.1:5433 — it was **already running** (my `db:local start` answered
  "another server might be running … Permission denied" and changed nothing); migrations: `bun run migrate` → `Nothing to apply.`; I never touched :5432.
  The owner's login was read from that `.env` by the script at run time — not printed, not stored in any file I wrote.
  Run: `tests/harness/task-008/shoot-live.mjs` (headless Chrome, 1280 px, the standalone build on :3000) → **`ALL PASS`**:
  owner signs in to the admin web → users page · add U1 (unique email `u1-live-<stamp>@example.test`) → listed · U1 signs in with the first password
  (AC-1, API) · duplicate email in other case → `EMAIL_TAKEN` at the field · disable (confirm) → server says `disabled`, U1's login → `403 ACCOUNT_DISABLED` ·
  enable → `active`, login `200` · reset via the modal → old password `401 INVALID_CREDENTIALS`, new `200` (done with `fetch` in the script, equal to the
  DoD's `curl POST /auth/login`; a literal `curl` would need the generated passwords, which live only in the script's memory) · sign out → U1 on the
  admin web → refusal text shown, `sessionStorage` token `null` (AC-2). Screenshots: `live-01-signin.png` · `live-02-add-modal.png` ·
  `live-03-row-actions.png` · `live-04-nonowner-refused.png` (all 1280 × 800, in `tests/harness/task-008/`).
  Not covered live: the 375 px / server-down views (mock screenshots above stand) and every call outside TASK-002.
  Seen live, not a defect of this TASK: the LINE push panel (TASK-009) shows its error state + retry on the real back end, because
  `/admin/stats/line-pushes` doesn't exist until TASK-007 — an honest check of that state. And: the "password changed" toast from the reset is still on
  screen for a moment after sign-out, over the sign-in page (P3, antd's message outlives the route).
  **Footprint:** test user `u1-live-mvwu26yq@example.test` (now active, password set by the run) stays in the team's local dev database
  `corner_chat_dev` — the API has no delete; the BE can drop it. The back end and the front I started are stopped; the Postgres cluster was not mine and
  is still running.

## Questions
- To SA (non-blocking): the wording keys above; phone-width reachability of row actions (see "Walked"); real-back-end rerun of the DoD after TASK-002.
  > answer (SA Sober, 2026-11-01): (1) The Q-SA-1 Thai is answered in REQ-001 § Questions — put it into `KNOWN`. Your 13
  > extra keys are now REQ-001 **Q-SA-2**, asked of the PM. (2) Your `VALIDATION.fields` call is right: show the
  > `admin.error.validation` text at the field, never the server's reason. (3) Phone width: the admin web is the owner's
  > desktop page; ≥ 1024 px is the target, and a table scrolling inside itself below that is accepted. (4) The live rerun
  > against TASK-002 is part of this TASK's DONE — see Review.

## Review
**Verdict: REWORK (small) — SA Sober, 2026-11-01.** The build, lint, type check, standalone artifact, closed list and the walk
against the mock are good, and the evidence is honest about what it does not prove. Not DONE yet, for three reasons, each its
own item:
1. **Wording (do now):** put the PM's Thai from REQ-001 Q-SA-1 into `src/lib/strings.ts` `KNOWN`, copied exactly, `{name}`
   placeholders filled. Add the Q-SA-2 Thai when the PM answers. Until then those 13 keys may still show their key names;
   list which ones are still open.
2. **Evidence files (do now):** save the screenshots the DoD asks for as files under
   `../ai-worker/tests/harness/task-008/` (sign-in, users page with the add modal open, a row's actions, the non-owner
   refusal, the server-down state) at **1280 px**, and name them in the Notes. "Looked at live" cannot be re-checked by anyone.
3. **Live rerun (waits on TASK-002, BE Jason):** run the DoD's live lines against the real back end, not the mock (owner
   sign-in → add U1 → U1 refused on the admin web; disable/enable; reset via `curl`). I'll tell you when TASK-002 is DONE. Set
   this TASK to `BLOCKED (waiting: TASK-002)` after items 1–2, and back to `REVIEW` after item 3.
The mock in `tests/harness/mock-api-task-008/` stays a harness file — fine. Your house-pattern deviations (no NextAuth / React
Query / axios / Tailwind), the eslint 9 pin and bun as the package manager are accepted.

**Round 2 verdict: DONE** — SA Sober, 2026-11-01. Items 1–3 are met. The live rerun ran against the real back end (TASK-002) and
the team's own cluster on :5433, never :5432, with no secrets printed. I checked `tests/harness/task-008/shoot-live.mjs`
(targets `localhost:8080`, asserts AC-1, AC-2, EMAIL_TAKEN, disable → 403 `ACCOUNT_DISABLED`, reset → old 401 / new 200,
`sessionStorage` null). I looked at `live-03-row-actions.png` (03:07): it shows real back-end rows — the `.env`-seeded owner
(reset only, no disable), Jason's `U One` and your live U1 — with the PM's Thai throughout.
Accepted as is: the reset checked with `fetch` instead of a literal `curl` (same call), the live test user left in the local dev DB,
and the LINE panel's error state (TASK-007 is not built yet).
**Carried to TASK-009:** the "password changed" toast still shows over the sign-in page after sign-out (P3). It is in your
files, so fix it with TASK-009's remaining items.
