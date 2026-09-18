# TASK-024: `/login` — surface the 403 "unverified email" answer and reach the existing resend button
- Source: SPEC-009
- Owner: FE (Fern)
- Status: DONE (reviewed 2026-09-13, Sober)
- Depends on: none (TASK-022 is `DONE`; its 3-line deletion is on disk and stays)

## What to do

Three files in `front/src`, nothing in `back/`. Read SPEC-009 §API / Interface Design first — the
exact types are there; this is the file-by-file cut.

1. **`services/api.ts`** — add, exported:
   ```ts
   export class ApiRequestError extends Error {
     constructor(message: string, public readonly status: number, public readonly body: unknown) {
       super(message);
       this.name = 'ApiRequestError';
     }
   }
   ```
   In `apiRequest`, line 108 `throw new Error(errorMessage || \`HTTP …\`)` becomes
   `throw new ApiRequestError(errorMessage || \`HTTP …\`, response.status, errorData)` — the message
   expression stays exactly as it is. Nothing else in the file changes.

2. **`contexts/AuthContext.tsx`** — export `LoginResult` (SPEC-009 §API, item 2), change
   `AuthContextType.login` to `(email, password) => Promise<LoginResult>`, and in `login()`:
   `return true` → `return { ok: true }`; the `catch` becomes
   ```ts
   } catch (error) {
     console.error('Login failed:', error);
     if (
       error instanceof ApiRequestError &&
       error.status === 403 &&
       (error.body as { requiresEmailVerification?: boolean } | null)?.requiresEmailVerification === true
     ) {
       return { ok: false, kind: 'unverified', message: error.message };
     }
     return { ok: false, kind: 'other' };
   }
   ```
   Import `ApiRequestError` from `@/services/api`. `register`, `logout`, `withAuth`, `checkAuth`,
   `finally { setLoading(false) }` and the existing `console.log`s stay untouched.

3. **`components/partials/Login/LoginContent.tsx`** — replace lines 39-58 (the `try/catch/finally`
   in `handleSubmit`) with:
   ```ts
   try {
     const result = await login(email, password);
     if (result.ok) {
       router.push(redirectTo);
     } else if (result.kind === 'unverified') {
       setError(result.message);
       setNeedsVerification(true);
     } else {
       setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
     }
   } finally {
     setIsLoading(false);
   }
   ```
   Lines 33-37 (`preventDefault`, the two resets, `setIsLoading(true)`) stay. **Everything else in
   the file is byte-identical**: the banner `div` (`:101-120`), the resend `BaseButton` and its
   `ส่งอีเมลยืนยันอีกครั้ง` / `กำลังส่ง...` label, `handleResendVerification` (`:61-77`), fields, links,
   classes, the demo line, the social block.

**Do not:** change any Thai string, any class, `themes.css`, anything in `ui/`, `back/`, the port
defaults (`api.ts:4`, `back/src/index.ts:19` — unsettled, SYSTEM-FACTS A7 has a fact but no REQ;
use env vars for your local run instead), or the seed. Do not sniff message text anywhere. If you
find a fourth file needs editing, stop and ask in §Questions.

CRLF: the repo is CRLF (`core.autocrlf=true`); use exact-match edits as in TASK-023, no `sed -i`.

## Definition of Done

Run each yourself and paste the **real output** into §Implementation Notes. A claim with no output
is `REWORK`. Instrument for the browser DoDs: your real-Chrome Playwright harness against
`npx next start` (state the port; stop it after). Nothing below assumes the Chrome extension.

- [x] 1. `npm run build` in `front/` — exit 0, **9 routes**. Paste the table.
- [x] 2. `npx tsc --noEmit` in `front/` — exit 0. (This is the one that proves the `login()` type
  change reached every caller — there is exactly one; if tsc names a second, stop and ask.)
- [x] 3. `grep -rn "ยืนยันอีเมล') || \|includes('verify')" src` from `front/` — **no matches** (the
  string-sniff is gone). `grep -rn "ApiRequestError" src` — hits in exactly `services/api.ts` and
  `contexts/AuthContext.tsx`. Paste both.
- [x] 4. `node <harness>/check-no-emoji.mjs src` from `front/` — still **93**. Do not re-baseline.
- [x] 5. **AC 1, real stack.** Run `back/` locally against a **local** Postgres you own
  (`bun run db:migrate`, then `PORT=<n> bun run dev`; `DATABASE_URL`/`JWT_SECRET` in your local
  `.env` — never a real DB, never `dte.develyst.online`). Start `front/` with
  `NEXT_PUBLIC_API_URL=http://localhost:<n>`. Then:
  (a) `curl -s -X POST localhost:<n>/auth/register -H 'content-type: application/json' -d
  '{"email":"task024-unverified@example.test","password":"password123","firstName":"T","lastName":"024"}'`
  → 201; paste the body (the `[DEV] Verify token` console line proves no email was sent — SPEC-009 F1).
  (b) `curl -s -i -X POST localhost:<n>/auth/login -d '{"email":"task024-unverified@example.test","password":"password123"}' …`
  → **403** with `requiresEmailVerification:true`; paste headers + body.
  (c) In the browser: `/login`, type that email + password, submit → banner text is exactly
  `กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ` and **not** `อีเมลหรือรหัสผ่านไม่ถูกต้อง`; paste
  `document.querySelector('form div.text-red-500')?.innerText`. Screenshot both themes:
  `tests/harness/login-unverified-{light,dark}.png`.
  **5-alt, only if no local Postgres can exist on your machine:** `page.route('**/auth/login')` fulfilling
  status 403 + the exact SPEC-009 body; run (c); and write **`AC 1 UNVERIFIED against a real backend —
  <what stopped the local stack>`** in the notes. Say which of 5 / 5-alt you did, in the first line.
- [x] 6. **AC 2.** In the state of 5(c): the button with text `ส่งอีเมลยืนยันอีกครั้ง` is in the DOM inside
  the banner (`querySelectorAll('form div.text-red-500 button').length === 1`). Click it; capture the
  request via `page.waitForRequest('**/auth/resend-verification')` — paste method + JSON body (email
  matches). Then paste the toast: `document.querySelector('.ant-message')?.innerText` (or the harness
  equivalent) — expected to contain the backend's `message`. **If the toast never appears, that is a
  finding, not a failure to hide** — SPEC-009 §Flow calls it a hypothesis; report it in §Questions.
  Under 5-alt, also route the resend to a 200 `{ success:true, message:'…' }` and say so.
- [x] 7. **AC 3.** Wrong password for `student.one@example.com` (seeded, verified) → banner
  `อีเมลหรือรหัสผ่านไม่ถูกต้อง`, **no button** (`…button').length === 0`). Unknown email → same. Paste both.
  Then the correct password — **`Demo1234!`** per `back/db/seed.sql:29` (the on-screen demo line
  `john@example.com / password123` names a user the seed does not create; do not use it, and do not
  edit it — it is copy) → redirect to `/` and `localStorage.dte_user` set. Paste.
- [x] 8. **AC 4.** (a) `grep -rn "login(" src --include=*.tsx --include=*.ts | grep -v "authApi.login\|AuthContext.tsx"`
  → exactly the one `LoginContent.tsx` hit; paste. (b) `/register`: register a second throwaway,
  see the success state, click its resend, paste the `alert`/toast text it produces (unchanged file, so
  this is the seam check for `ApiRequestError` → `.message`). (c) `/verify-email?token=bogus` → renders
  its error state with the backend's `ลิงก์ยืนยันอีเมลไม่ถูกต้องหรือหมดอายุแล้ว`; paste innerText. Under
  5-alt, (b)/(c) are `UNVERIFIED — needs the local stack`, said so.
- [x] 9. `git diff --stat` from the repo root → exactly the 3 files (plus nothing; TASK-022/023 are
  reviewed but may still show if uncommitted — say so, as before). Paste. Do NOT commit (A23).

## Implementation Notes

**DoD 5 real stack** — a real local `back/` on a real local Postgres; **nothing mocked anywhere below.**
Built 2026-09-13 by Fern. Status `REVIEW`.

**Local stack (footprint declared).** The owner's own Postgres 18 cluster on 5432 wants a password I do not
have and did not guess — instead I ran `initdb` for a **throwaway cluster of my own** in my session scratchpad
(trust auth, `localhost:5433`, db `dte_task024`), `bun run db:migrate` + `bun run db:seed` against it, and
started `back/` with env vars on the command line only (`DATABASE_URL=postgresql://postgres@localhost:5433/dte_task024
JWT_SECRET=<throwaway> PORT=4013 FRONTEND_URL=http://localhost:3000 bun run src/index.ts`) — **no `back/.env`
was created, nothing under `back/` was touched** (`ls back/.env` → no such file). Port 4013 = SYSTEM-FACTS A7,
via env only; `api.ts:4` / `index.ts:19` defaults unchanged. Front: `NEXT_PUBLIC_API_URL=http://localhost:4013
npm run build`, then `npx next start -p 3001` (3000 was held by an unrelated process; backend CORS allows 3001).
After the run: `next start`, `bun`, and the cluster stopped (`pg_ctl stop`), the cluster's data dir **deleted**;
`netstat` shows nothing on 3001/4013/5433. Nothing touched `dte.develyst.online` or any real DB.

**Files changed (3, all `front/src`, exact-match Node edits, CRLF kept — bare LF = 0 in all three):**
- `services/api.ts` — `export class ApiRequestError` (status + body) after `API_BASE_URL`; `:108` throw → `new ApiRequestError(<same message expr>, response.status, errorData)`. 391→398 CRLF lines.
- `contexts/AuthContext.tsx` — `export type LoginResult`; `AuthContextType.login` → `Promise<LoginResult>`; `login()` returns `{ ok:true }` / classifies the catch exactly as the TASK's snippet. Import of `ApiRequestError` added. 186→198.
- `components/partials/Login/LoginContent.tsx` — `handleSubmit` `:39-58` replaced by the TASK's snippet (switch on `result.kind`, `catch` + string-sniff gone, `finally` kept). Nothing else. 225→218.

### DoD evidence (real output)

**1. build** — `NEXT_PUBLIC_API_URL=http://localhost:4013 npm run build` → `build exit=0`, **9 routes**:
```
┌ ○ /              ├ ○ /_not-found   ├ ○ /about        ├ ƒ /classroom/[id]   ├ ○ /courses
├ ○ /login         ├ ○ /register     ├ ○ /teach        └ ○ /verify-email
```
**2. tsc** — `npx tsc --noEmit` → `tsc exit=0` (no second caller named).
**3.** `grep -rn "ยืนยันอีเมล') || \|includes('verify')" src` → no output, `exit=1`. `grep -rn "ApiRequestError" src` →
```
src/contexts/AuthContext.tsx:5:import { authApi, ApiRequestError, type AuthResponse, type RegisterResponse } from '@/services/api';
src/contexts/AuthContext.tsx:91:        error instanceof ApiRequestError &&
src/services/api.ts:6:export class ApiRequestError extends Error {
src/services/api.ts:9:    this.name = 'ApiRequestError';
src/services/api.ts:115:      throw new ApiRequestError(errorMessage || `HTTP ${response.status}: ${response.statusText}`, response.status, errorData);
```
**4. emoji** — `node …/check-no-emoji.mjs src` → `93 occurrence(s) in 52 file(s) scanned.` (not re-baselined).

**5. AC 1, real stack.**
(a) `curl -s -X POST localhost:4013/auth/register …task024-unverified@example.test…` → **HTTP 201**
`{"success":true,"message":"สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี","email":"task024-unverified@example.test"}`
backend console: `[DEV] Verify token for task024-unverified@example.test: c6a7a27e…6301` — no email sent (SPEC-009 F1 confirmed by run).
(b) `curl -s -i -X POST localhost:4013/auth/login …` →
```
HTTP/1.1 403 Forbidden
Content-Type: application/json;charset=utf-8
{"success":false,"message":"กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ","requiresEmailVerification":true,"email":"task024-unverified@example.test"}
```
(c) harness `tests/harness/measure-login-unverified.mjs` (real Chrome, real backend), both themes:
`document.querySelector('form div.text-red-500')?.innerText` = `"กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ\nส่งอีเมลยืนยันอีกครั้ง"`
(the second line is the button's label inside the same div); `อีเมลหรือรหัสผ่านไม่ถูกต้อง` absent. Identical in light and dark.
Screenshots: `tests/harness/login-unverified-light.png`, `login-unverified-dark.png`.

**6. AC 2.** `querySelectorAll('form div.text-red-500 button').length` = **1**, text `ส่งอีเมลยืนยันอีกครั้ง`. Click →
`request : POST http://localhost:4013/auth/resend-verification body= {"email":"task024-unverified@example.test"}` →
`response: 200 {"success":true,"message":"ส่งลิงก์ยืนยันอีเมลแล้ว กรุณาตรวจสอบ inbox ของคุณ"}` →
`document.querySelector('.ant-message')?.innerText` = `"ส่งลิงก์ยืนยันอีเมลแล้ว กรุณาตรวจสอบ inbox ของคุณ"` (1 notice).
**SPEC-009 §Flow hypothesis confirmed: the antd toast DOES render on this screen.** Screenshot `login-unverified-after-resend.png`.

**7. AC 3.** wrong password `student.one@example.com` → backend 401 `{"success":false,"message":"อีเมลหรือรหัสผ่านไม่ถูกต้อง"}`,
banner `"อีเมลหรือรหัสผ่านไม่ถูกต้อง"`, buttons **0**. Unknown email `nobody-task024@example.test` → 401, same banner, buttons **0**.
Correct `Demo1234!` → 200, `url: http://localhost:3001/`, `localStorage.dte_user` =
`{"id":"00000000-0000-0000-0000-000000000010","display_name":"สมชาย ใจดี","email":"student.one@example.com","role":"student"}`.

**8. AC 4.** (a) `grep -rn "login(" src --include=*.tsx --include=*.ts | grep -v "authApi.login\|AuthContext.tsx"` →
```
src/components/partials/Login/LoginContent.tsx:40:      const result = await login(email, password);
src/services/api.ts:129:  async login(email: string, password: string): Promise<AuthResponse> {
```
— the second line is the *definition* of `authApi.login` (the grep filter excludes `authApi.login(` calls, not the method
head); the only **caller** of the context's `login()` is `LoginContent.tsx:40`. Reported literally.
(b) `/register` with `task024-second@example.test` / `Second024!` (the screen's own strength rules) → `POST /auth/register` 201;
success state shows `เราได้ส่งอีเมลยืนยันไปที่:` + the email; its resend → `POST body= {"email":"task024-second@example.test"}` →
`alert`: `"✅ ส่งลิงก์ยืนยันอีเมลแล้ว กรุณาตรวจสอบ inbox ของคุณ"` (unchanged file, seam intact).
(c) `/verify-email?token=bogus` → `main` innerText:
`"ยืนยันอีเมล\nเกิดข้อผิดพลาด\n\nลิงก์ยืนยันอีเมลไม่ถูกต้องหรือหมดอายุแล้ว\n\nโทเคนอาจหมดอายุหรือไม่ถูกต้อง\n\nลงทะเบียนใหม่\nกลับไปหน้าเข้าสู่ระบบ"`.
That string exists **only** in `back/src/routes/auth.ts:173` (grep of `front/src` = 0 hits), so it arrived via
`ApiRequestError.message` from the real backend (`curl` direct: 400 + the same body). My listener attached after the
page's own request fired, hence "no request seen" in the harness line — the source grep + curl settle it.

**9.** `git diff --stat` from the repo root:
```
 front/src/app/about/page.tsx                       | 72 ++++++++--------------
 .../src/components/partials/Login/LoginContent.tsx | 20 ++----
 front/src/contexts/AuthContext.tsx                 | 22 +++++--
 front/src/services/api.ts                          |  9 ++-
```
`about/page.tsx` = TASK-023 (`DONE`, uncommitted) and the `LoginContent.tsx` hunk also carries TASK-022's 3-line
deletion (`DONE`, uncommitted) — as before, not reverted. Scoped to this TASK: exactly the 3 files. Not committed (A23).

**Instrument:** new throwaway `tests/harness/measure-login-unverified.mjs` (coordination repo; nothing in `front/`).
One harness workaround, not a product change: `page.check('#terms')` on `/register` reports "did not change its state"
in headless Chrome, so the harness sets `checked` directly — pre-existing screen behaviour, outside this TASK, noted only.

**UNVERIFIED:** the owner's own eyes (REQ-009 AC 5) — the resend button's look is first seen by him.

## Questions

(Fern asks; Sober answers as `> answer: ...`)

## Review

**Verdict: `DONE`** — 2026-09-13, Sober. Reviewed against SPEC-009 §API / §Flow and REQ-009 AC 1–4.

**Re-run by me (read-only, no browser, no DB, no git write):** `git diff` of the 3 files — byte-for-byte
the SPEC-009 §Frontend interface changes and this TASK's three snippets, nothing extra (the
`LoginContent.tsx` hunk also carries TASK-022's reviewed deletion, as stated). DoD 3 both greps
reproduce exactly; DoD 4 = 93; `npx tsc --noEmit` exit 0; CRLF 398/198/218, bare LF 0 in all three;
`back/.env` absent; `handleApiError` rethrows `Error` instances untouched, so `ApiRequestError`
survives to `AuthContext` (the seam holds by construction). Both theme screenshots + the after-resend
one looked at: banner S1 + `BaseButton danger` S2 inside it, matches SPEC-009 §Flow step 3.

**Evidence quality:** DoD 5 done on the real stack — own throwaway cluster, env-only, torn down and
declared. That is the standard REQ-009 AC 1 asked for; nothing mocked, nothing laundered.

**Rulings on what Fern reported:**
- DoD 8a's second grep line is the `authApi.login` *method head*, not a caller — **my grep was
  imprecise, Fern reported the literal output correctly.** One caller of the context's `login()`
  stands (`LoginContent.tsx:40`); tsc is the real proof and passed.
- DoD 8c "no request seen" — settled by the source grep (string lives only in `auth.ts:173`) +
  direct curl; accepted.
- `page.check('#terms')` harness workaround on `/register` — pre-existing, outside scope, noted only.
- **SPEC-009 §Flow hypothesis (antd toast renders on `/login`) — CONFIRMED by measurement**; recorded in SPEC-009.
- **SPEC-009 F1 upgraded from code read to run-confirmed:** register + resend both answer "sent" while the
  backend only logs `[DEV] Verify token` — carried to Porter as SPEC-009 §Q1, unchanged in scope.

**Carried up, not closed here:** REQ-009 AC 5 (the owner's eyes) — Porter. REQ-009 → `SPEC_DONE`.
