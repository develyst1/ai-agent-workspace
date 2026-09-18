# SPEC-009: `/login` — surface the backend's "unverified email" answer and make the resend reachable
- Source: REQ-009
- Status: DONE (2026-09-13, Sober — TASK-024 reviewed `DONE`; AC 5 with Porter)

## Overview

The backend already tells the truth. `back/src/routes/auth.ts:122-131` answers an unverified-email
login with **HTTP 403** and `{ success:false, message:'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ',
requiresEmailVerification:true, email }`, distinct from the **401** it gives wrong-password / unknown
email. The frontend throws that answer away twice: `services/api.ts:102-108` keeps only `message`
(as `new Error(message)`), and `contexts/AuthContext.tsx:83-85` `login()` catches every error and
returns `false`, so `LoginForm` (`components/partials/Login/LoginContent.tsx:43-44`) shows the generic
string for every failure and its `catch` — the only caller of `setNeedsVerification(true)` — never
runs. The resend button (`:106-118`) and `handleResendVerification` (`:61-77`) exist and are wired
to `authApi.resendVerification` (`api.ts:164`); they are only unreachable.

**So this is frontend-only.** `back/` is untouched: no route, field or string changes. The fix is to
carry the backend's *kind* of failure through the two layers that discard it, and to switch on the
kind — not on the message text (`:51` sniffs `'ยืนยันอีเมล'` out of the string today; that goes).

**Establishing FE-vs-BE (REQ-009 §Constraints, "Sober's to establish"):** FE only. Verified by
code read that `AuthContext.login()` has exactly one caller in `front/src` (`LoginContent.tsx:40`);
`/register` and `/verify-email` call `authApi.*` directly and never `login()` — so changing
`login()`'s return type touches one screen (REQ-009 AC 4 stays cheap; DoD 8 still states it).

## Findings from the code read that are NOT in scope (routed to Porter, §Questions Q1–Q3)

These decided nothing here but must not be lost. F2/F3 are code reads, `UNVERIFIED` by a run. **F1 is run-confirmed** (TASK-024 DoD 5a/6/8b, 2026-09-13): register and resend both answer "sent"; the backend only prints `[DEV] Verify token …`.

- **F1 — no email is ever sent.** `back/` has no mailer (no `nodemailer`/SMTP code; `.env.example`
  lists `SMTP_*` but nothing reads them). `/auth/register:76-77` and `/auth/resend-verification:224`
  only `console.log` the token, and the resend still answers `success:true, 'ส่งลิงก์ยืนยันอีเมลแล้ว
  กรุณาตรวจสอบ inbox ของคุณ'`. The "sent" the user will see (REQ-009 req. 2) is therefore the backend's
  own claim, not a fact — the one thing A50 is against. Owner's call, via Porter.
- **F2 — the camelCase transform is not applied.** `back/src/db.ts:21` passes
  `postgres.toCamelCase`, which is not an export of `postgres@3.4.9` (`toCamel`/`camel` are), so
  `transform.column.from` is `undefined` and rows stay `snake_case`. Consequences: (a) the login
  403 branch reads `user.is_email_verified` — **reachable** (good for this SPEC); (b) `safeUser()`
  deletes `passwordHash`, which does not exist, so **`password_hash` is returned to the client** on
  every successful login and `/auth/profile` — a security defect; (c) `/auth/verify-email:181`
  reads `record.userId` → `undefined` → postgres.js refuses undefined parameters → **the verify
  link can never verify anyone**.
- **F3 — together, F1 + F2(c) mean no self-registered user can become verified today** without a
  hand-flip of `users.is_email_verified`. That is the state the owner was answering from (A50).

## API / Interface Design (the seam, as it exists — no BE change)

`POST /auth/login` — body `{ email, password }`. The FE classifies **by status + field**, never by
message text:

| Backend answers | Status | Body (exact field names) | FE kind |
|---|---|---|---|
| unknown email / wrong password | 401 | `{ success:false, message:'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }` | `other` |
| **email not verified** | **403** | `{ success:false, message:'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ', requiresEmailVerification:true, email }` | **`unverified`** |
| success | 200 | `{ success:true, accessToken, user }` | `ok` |
| anything else (network, 5xx, malformed) | — | — | `other` |

`unverified` ⇔ `status === 403 && body.requiresEmailVerification === true`. Everything not `ok`
and not `unverified` is `other` and shows today's generic string — REQ-009 req. 3, kept literally
(today a network error also shows the generic string; not widened, noted as §Q5).

`POST /auth/resend-verification` — body `{ email }`, always 200 `{ success:true, message }`.
Unchanged; already called by `handleResendVerification`.

### Frontend interface changes (three files, all in `front/src`)

1. **`services/api.ts`** — add and export
   `class ApiRequestError extends Error { status: number; body: unknown }`; in `apiRequest`, where
   `:108` throws `new Error(errorMessage || …)`, throw `new ApiRequestError(sameMessage, response.status,
   errorData)` instead. `error.message` is byte-identical to today, so every existing `catch` that
   reads `.message` (register, verify-email, classroom, teach, Navbar…) is unaffected. `handleApiError`
   already rethrows `Error` instances untouched.
2. **`contexts/AuthContext.tsx`** — `login` returns a discriminated result instead of `boolean`:
   ```ts
   export type LoginResult =
     | { ok: true }
     | { ok: false; kind: 'unverified'; message: string }
     | { ok: false; kind: 'other' };
   ```
   In the `catch`: `err instanceof ApiRequestError && err.status === 403 &&
   (err.body as { requiresEmailVerification?: boolean })?.requiresEmailVerification === true`
   → `{ ok:false, kind:'unverified', message: err.message }`; else `{ ok:false, kind:'other' }`.
   The success path returns `{ ok:true }`. `AuthContextType.login` type updated to
   `Promise<LoginResult>`. Nothing else in the file changes (`register`, `logout`, `withAuth`,
   `checkAuth`, the `console.log`s stay).
3. **`components/partials/Login/LoginContent.tsx`** — `handleSubmit` (`:33-59`) switches on
   `result.kind`: `ok` → `router.push(redirectTo)` (as today); `unverified` → `setError(result.message)`
   + `setNeedsVerification(true)`; `other` → `setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')` (today's literal,
   `:44`). The `catch` block (`:46-55`) is deleted — its string-sniffing (`:50-53`) is what this SPEC
   replaces; keep a `finally { setIsLoading(false) }`. Every other line — the banner div, the
   resend button and its label, `handleResendVerification`, fields, classes — stays byte-identical.

## Data Model

None. No schema, no seed change. The evidence user is created at run time by `POST /auth/register`
on a **local** backend + **local** Postgres (`is_email_verified` defaults `FALSE`, `schema.sql:71`).

## Flow

1. User submits email + password → `login()` → `authApi.login` → `POST /auth/login`.
2. 200 → as today (token stored by `authApi.login`, `dte_user` set, redirect).
3. 403 + `requiresEmailVerification:true` → banner shows the backend's `message`
   (`กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ`) and, inside the banner, the existing `ส่งอีเมลยืนยันอีกครั้ง`
   button (`BaseButton danger block`, `Send` icon, `mt-3`).
4. Click → `handleResendVerification` → `POST /auth/resend-verification` with the typed email →
   antd `message.success(data.message)` (`ส่งลิงก์ยืนยันอีเมลแล้ว กรุณาตรวจสอบ inbox ของคุณ`) or
   `message.error(err.message)` on failure. Button shows `กำลังส่ง...` while pending.
5. Any other failure → banner shows `อีเมลหรือรหัสผ่านไม่ถูกต้อง`, no button (today's behaviour).
6. A new submit clears both `error` and `needsVerification` first (`:35-36`, already so).

**What happens to the look (SPEC-006 rule, per control touched):** no class string changes. The
banner is today's; the resend button is the one coded in TASK-004's migration (`BaseButton danger`),
**never yet rendered on anyone's screen** — its look is therefore first seen by the owner under
REQ-009 AC 5. If he dislikes it, that is a SPEC-006 Phase 3 (`/login` look) item, not a rework here.
**Hypothesis, measured in TASK-024 DoD 6 — CONFIRMED 2026-09-13:** the antd `message` toast does
render inside `<App component={false}>` on this screen (`.ant-message` innerText = S3, 1 notice; TASK-004 §Q3 territory).

## User-facing strings (REQ-009 req. 4 — the concrete list for the owner, via Porter)

All exist in the code today; **none is invented**. Reused as-is unless the owner objects.

| # | Where | String | Shown when |
|---|---|---|---|
| S1 | `back/src/routes/auth.ts:126` | `กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ` | banner, unverified login |
| S2 | `LoginContent.tsx:116` | `ส่งอีเมลยืนยันอีกครั้ง` / `กำลังส่ง...` | the resend button / while pending |
| S3 | `auth.ts:227` (FE fallback `:70` `ส่งอีเมลยืนยันใหม่เรียบร้อยแล้ว`) | `ส่งลิงก์ยืนยันอีเมลแล้ว กรุณาตรวจสอบ inbox ของคุณ` | toast after resend (⚠️ F1: nothing is actually sent) |
| S4 | `LoginContent.tsx:72` | `เกิดข้อผิดพลาดในการส่งอีเมล` | toast if the resend call fails without a message |
| S5 | `LoginContent.tsx:63` | `กรุณากรอกอีเมลของคุณก่อน` | resend clicked with empty email (unreachable via the form's `required`; kept) |
| S6 | `LoginContent.tsx:44` (= `auth.ts:110/118`) | `อีเมลหรือรหัสผ่านไม่ถูกต้อง` | every other failure — **unchanged** |

## Non-functional

- Emoji harness stays at **93** (post-TASK-023). No emoji added or removed.
- No new dependency. No `themes.css`, no `ui/`, no shared-component change (the shared-component
  rule is not engaged: `api.ts` and `AuthContext.tsx` are shared *code*, not shared *rendering* —
  their observable behaviour for every other caller is unchanged by construction, DoD 8 checks it).
- `ApiRequestError` keeps `body` so a later screen can use other fields without another seam change.

## Tasks

- TASK-024: `/login` — carry the 403 `requiresEmailVerification` answer through `api.ts` +
  `AuthContext` and show it with the existing resend button — owner: FE (Fern) (depends on: none;
  TASK-022 is `DONE` and its edit is on disk)

## Acceptance mapping (REQ-009)

- AC 1 (unverified → its own message) — TASK-024 DoD 5 (real local backend + local DB, registered
  unverified user) or, if no local stack can run on Fern's machine, DoD 5-alt (mocked 403 body) with
  AC 1 carried as **UNVERIFIED against a real backend** — stated, never laundered.
- AC 2 (resend visible, click calls it, sent/failed shown) — DoD 6 (button in DOM, network call
  observed, toast text in DOM).
- AC 3 (401 paths unchanged) — DoD 7.
- AC 4 (`/register`, `/verify-email` as today) — DoD 8 (code: `login()` has one caller; run:
  register flow's own resend still toasts; verify-email page renders both its states).
- AC 5 (**the owner's own eyes**) — not closable here; carried by Porter when TASK-024 is `DONE`.

## Questions

- **Q1 (for Porter → owner, business, blocks nothing in TASK-024 but shapes what "sent" means):**
  F1 — the backend sends no email; the resend's "ส่งลิงก์ยืนยันอีเมลแล้ว" is not true. Does the owner
  (a) want real sending wired (its own REQ; SMTP account + credentials are his to supply, never ours
  to guess), or (b) accept the resend as-is for now, or (c) want S3 reworded to something true? I
  design nothing on this until he says.
- **Q2 (for Porter → owner, defect report):** F2(c) — `/verify-email` cannot mark anyone verified
  (`record.userId` is undefined without the transform). Proposed: its own REQ, BE. Not fixed here.
- **Q3 (for Porter → owner, security defect report):** F2(b) — `password_hash` is returned in the
  login and profile responses. Proposed: its own REQ, BE, small. Not fixed here.
- **Q4 (for Porter → owner, copy):** the §Strings table S1–S5 — reuse as-is, or replacements? Only
  needed before AC 5; TASK-024 builds with today's strings (REQ-009 req. 4 allows exactly this).
- **Q5 (observation, no action asked):** a network/5xx failure also shows S6 today and after; REQ-009
  req. 3 says keep it. Noted so nobody later calls it a regression.
- **Q6 (observation for Porter, copy, no action asked):** the `/login` demo line
  `ทดสอบด้วยบัญชีตัวอย่าง: john@example.com / password123` (`LoginContent.tsx:180`) names a user
  `back/db/seed.sql` does not create (seeded users use `Demo1234!`, `seed.sql:29`). Whether it exists
  in production is a DATA REQUEST nobody has raised; the line is copy and stays as-is here.

(Engineers ask here; Sober answers as `> answer: ...`)
