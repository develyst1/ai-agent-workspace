# TASK-930 — BE: R0.1 back-office user/login management — CEO-only create · list · reset-password · deactivate — backoffice-back — @Jason (lent; or Bob)

**From @Sober, 2026-11-09 (Porter, 🔴 R0.1 gap). BB has NO route to create users** — `createBoUser` (`bo-user.service.ts:49`) is called only by `seed-bo-ceo.ts`; its own comment says "later the user-management screen." Without this, no admin or coach can ever sign in, so a coach can't confirm their slip (R1.5) and an admin can't add entries. Repo `smart-scheduler-backoffice-back`, branch `dong`. **Chain: report + questions in this TASK `## Questions`; Sober reviews (R0.1 is Team A's).** Pairs with the FE (TASK-931, Fern).

## ⚠ Security + the recent lesson
- **Passwords:** reuse `createBoUser`'s existing hashing (never store plaintext; never log a password). The create/reset routes take a password and hash it server-side. Validate a minimum strength you can justify (length ≥ 8); do not echo it back in any response.
- **ROUTE-LEVEL TESTS ARE MANDATORY** (lesson from the /stock/in regex bug, FAILURES 2026-11-09): every route here gets a route-level test exercising its zod validator (a valid body passes, bad bodies 400) — service tests alone are NOT enough.

## Step 0 (map first, file:line, in `## Implementation Notes`)
- `bo-user.service.ts` (`createBoUser:49`, the user table/columns, the hashing, roles) + `seed-bo-ceo.ts` (how the CEO is seeded) + the auth middleware (`requireRole`/`adminAuth`, the token `{sub, role, teacherId}`) — reuse, don't reinvent.
- The roles R0.1 allows (CEO · admin · coach) and whether a coach row needs a `teacherId` link (it does — the token carries teacherId; a coach's slip/entries key on it). Confirm the user↔teacher link.
- **The login-page text question (answer in `## Questions` for Porter):** BF's login says «ใช้ชื่อผู้ใช้และรหัสผ่านเดียวกับหน้าบ้าน», but BB has its OWN `bo.users`. Is there a front-office↔back-office user SYNC, or are BB users independent? From the evidence (bo.users + createBoUser + this task) they look INDEPENDENT ⇒ the text is wrong. State what you find; the fix is the FE's (931), the ruling is Porter's.

## Build (CEO-only — `requireRole("ceo")` on all; no admin/coach may manage logins)
- **`POST /v1/users`** — create a login: `{ username, password, role: "admin"|"coach", teacherId? (required when role=coach) }` → the hashed user; 409 on a duplicate username; 400 on a coach without a valid teacherId. (CEO is seeded, not created here, unless the final UI says otherwise — confirm.)
- **`GET /v1/users`** — list the logins (username, role, teacherId, active, created) — **no password/hash in the response, ever**.
- **`POST /v1/users/:id/reset-password`** `{ password }` — set a new hash; 404 unknown.
- **`POST /v1/users/:id/deactivate`** (and re-activate if the final UI has it) — soft-disable a login so it can't sign in; never hard-delete (keep the audit trail).
- Mount on a tagged `/users` router; align with the token shape so a created coach can actually sign in and carry `teacherId`.

## Done = (evidence in `## Implementation Notes`)
- tsc 0 · DB-less suite green · tests incl. **route-level tests for every route** (valid passes, bad body 400, CEO-only → admin/coach 403, no token 401), create→list round-trip, no password in any response, duplicate username 409, coach-needs-teacherId, reset changes the hash, deactivate blocks sign-in. A sid rolled-back check (host-first) creating + listing + deactivating a test login (test password only — never a real one). `/security-review` line (password handling, CEO-only, no hash leak). Any migration additive + verified on sid (unique journal `when`). `git status` clean; no git command.

## Claim
backoffice-back: the `/users` routes + service (reuse `createBoUser`/the hashing) + route-level tests. **Sober reviews.** Questions → me. The People-page dialogs are TASK-931 (FE).

## Questions / Implementation Notes / Review
_(—)_

## RE-SCOPE (Sober, 2026-11-09, Porter ruling) — "same login as the front office" (SPEC-097 §3), NOT independent logins
Owner/Porter ruled: KEEP "same login as the front office" (SPEC-097 §3). So the user management is **admitting a front-office person into the back office** (seeding `bo_users` from the front-office identity so the SAME username/password signs in), + assigning their back-office **role (admin/coach) + teacherId** — **NOT creating arbitrary new logins with a typed back-office password.**
- **Step-0 now MUST read:** SPEC-097 §3 + the front-office auth (NextAuth in `smart-scheduler-front`) + how `bo_users` is seeded today (`seed-bo-ceo.ts`, `createBoUser`) + whether the password is copied-at-seed, synced, or SSO. **The exact seed/sync strategy is yours to resolve against SPEC-097 §3 in step-0 — bring it to me before building.** (SPEC-097 §3 left this as the wk-1 front-office read.)
- **Routes re-shaped:** `POST /v1/users` = **admit a front-office person** (identify them from the front-office user source; set role + teacherId; seed bo_users so their existing FO credentials work) — not "type a new password here." `GET /v1/users` list, `POST /:id/deactivate` (soft-disable) stay. **Reset-password:** only if SPEC-097's model lets the back office set a password that stays in sync with the front office — else it's a front-office action (resolve in step-0).
- The login-page text «ใช้ชื่อผู้ใช้และรหัสผ่านเดียวกับหน้าบ้าน» is now CORRECT — it stays (no FE text fix; see 931).
- Route-level tests still mandatory. Bring me the step-0 seed-strategy finding before the schema/routes.


## Step 0 findings: Jason (BE), 2026-11-09. NOTHING BUILT, awaiting Sober.

**Facts (read-only, file:line)**
- BB `bo.users` (`backoffice-back/src/db/schema.ts` ~:641): username, `password_hash` (Bun.password argon2id), role (ceo|admin|coach), `teacher_id` (plain uuid, no FK), active. Login = `checkLogin` in `bo-user.service.ts`; `/auth/login` signs `{sub: username, role, teacherId}`. `createBoUser` is called only by `seed-bo-ceo.ts` (CEO from env).
- FO identity = SB `public.users` (`smart-scheduler-back/src/db/schema.ts` ~:701): username (same `^[a-z0-9._-]{3,40}$`, lower-cased), `password_hash` (**same primitive: `Bun.password` argon2id**, `user.service.ts:82-83`), display_name, `is_super_admin`, `disabled_at`, `role_id` (FO RBAC role, NOT the BB role), `teacher_id` (FK to teachers, unique). FO web login = NextAuth Credentials wrapping SB `/auth/login` (`front/src/auth.ts`).
- BB and SB share one Postgres DB (BB `bo` schema, SB `public`). BB already reads `public.*` read-only (reports, salary), so BB can read `public.users` directly.
- Today the two tables are independent. "Same login" means nothing keeps them equal.

**Options for "same username and password"**
1. **Copy-at-admit (hash copied once).** Admit reads `public.users` (username, `password_hash`, `teacher_id`, `disabled_at`) and inserts `bo.users` with the SAME argon2id hash plus the chosen role. Works now, no new infra, no plaintext ever. DRIFT: a later FO password change or FO disable does not reach BB.
2. **Copy-at-admit + verify-through (recommended).** Same admit, but BB login ALSO re-checks `public.users` (read-only SELECT of hash and `disabled_at`) at sign-in and prefers it: password = FO's current hash; FO-disabled => BB refuses. `bo.users` then holds only role, teacherId, active (BB-only facts) and the hash is a fallback cache. No drift on password or disable; a deactivation in either place stops sign-in. Cost: `/auth/login` gains one read of `public.users`; no schema change beyond optional `fo_user_id`.
3. **SSO** (accept the FO token). SPEC-097 §3 names it a follow-up; needs a shared signing secret and a FE change. Not now.

**Recommendation: option 2.** Option 1 alone breaks the owner's ruling the first time someone changes their FO password.

**Questions for Sober (answers needed before schema/routes)**
1. Option 2 accepted? (BB login reads `public.users`; BB owns no password for admitted people.)
2. **Reset password** then is an FO action only: BB gets NO reset route. Agree?
3. **Admit input**: `POST /v1/users {username, role: admin|coach, teacherId?}`, the person must already exist in `public.users` (404 if not, 409 if already admitted). Coach: `teacherId` taken from FO `teacher_id` by default; if the FO row has none, require it in the body. OK?
4. **Role mapping**: BB role is CHOSEN by the CEO at admit (FO `is_super_admin` and `role_id` do NOT map automatically). Never admit as `ceo` via this route (CEO stays the env seed). OK?
5. The CEO's own `bo.users` row (env-seeded password) stays as is, not FO-verified. OK?
6. Deactivate = `bo.users.active=false` (soft); plus FO `disabled_at` is honoured at login. Token stays valid up to 12 h (SPEC-097 §4, accepted limit).
7. Migration: only if you want `fo_user_id uuid` (additive, unique `when`); otherwise none.

Plan after the go: `/v1/users` (`requireRole("ceo")`): GET list, POST admit, POST /:id/deactivate and /:id/reactivate; route-level tests (valid/400/403/401, round trip, no hash or password in any response, 409 dup, coach-needs-teacherId, deactivate and FO-disabled block sign-in); a rolled-back sid check with a test password only; `/security-review` line.

## Answers — Jason's 7 (Sober, SA Lead A, 2026-11-09). Excellent step-0; build to these.
**1. Option 2 — ACCEPTED.** BB login reads `public.users` at sign-in and prefers the LIVE FO hash + `disabled_at`; BB owns no password for admitted people. It's the cleanest "same login as FO" — no drift, a FO password change or disable carries over. Go.
**2. No BB reset route — AGREED.** The password lives in FO, so reset is an FO action; BB has none. (This drops the Reset dialog from 931 — I'm telling Fern.)
**3. Admit input — OK as you propose.** `POST /v1/users { username, role: "admin"|"coach", teacherId? }`; the person must already exist in `public.users` (404 if not); 409 if already admitted. Coach `teacherId` defaults from FO `teacher_id`; if the FO row has none, require it in the body (400 without).
**4. Role mapping — OK.** The BB role is CHOSEN by the CEO at admit; FO `is_super_admin`/`role_id` do NOT map. **Never admit `ceo` via this route** (CEO stays the env seed) — reject role="ceo" with 400.
**5. CEO's own row stays env-seeded, not FO-verified — OK.** The bootstrap CEO keeps its own password so the system always has a working CEO independent of FO. (In login: the verify-through to `public.users` applies only to ADMITTED rows [those with `fo_user_id`/an FO match]; the env-seeded CEO verifies against its own `bo.users` hash.)
**6. Deactivate — OK.** `bo.users.active=false` (soft) + honour FO `disabled_at` at login; an existing token valid up to 12 h (SPEC-097 §4 accepted). Add `/:id/reactivate` too (final UI may want it).
**7. Migration — YES, add `fo_user_id uuid` (additive, unique journal `when`).** The explicit link to `public.users.id` is more robust than matching on username (a username could change in FO); verify-through reads FO by that id. Set it at admit; it also cleanly answers "already admitted" (409). Make it NULL for the env-seeded CEO (so the CEO is never FO-verified, per #5).
**Plus:** route-level tests mandatory (every route); no password/hash in any response; a rolled-back sid check with a TEST password only (never a real FO password); `/security-review` (the cross-schema read of `public.users` is READ-ONLY, like the reports/salary reads). Build it. Ball: you (schema + routes).


## Implementation Notes: Jason (BE), 2026-11-09. BUILT to Sober's 7 answers. Ready for review.

**Files (BB `smart-scheduler-backoffice-back`)**
- `drizzle/0021_bo_users_fo_user_id.sql` + journal `when` 1794900000000 (unique) + witness entry (probe = index `bo_users_fo_user_id_uq`, rerunnable). Additive: `bo.users.fo_user_id uuid` + partial unique index. APPLIED on sid; `db:verify` clean (22 migrations, ledger 23 rows).
- `src/db/schema.ts`: `foUserId` + the index.
- `src/services/bo-user-admin.service.ts` (new): `admit`, `listUsers`, `deactivate`, `reactivate`, `foCredential`, `makeDbStore(d)` (injectable for tests / a tx). READ-ONLY selects on `public.users`.
- `src/services/bo-user.service.ts`: `checkLogin` verify-through: a row with `fo_user_id` verifies against the LIVE FO hash and refuses on FO `disabled_at` or a vanished FO person; a row without it (the env-seeded CEO) verifies on its own hash.
- `src/routes/users.ts` (new, mounted `/api/v1/users` in `api.ts`): GET list · POST admit (201) · POST `/:id/deactivate` · POST `/:id/reactivate`; `requireRole("ceo")` on every one. NO password route.
- `src/routes/auth.ts`: `makeAuthRoutes` takes an optional FO lookup (tests). `auth-login-task856.test.ts`: fixture gets `foUserId: null` only.

**Rules as built:** role in {admin, coach}, `ceo` 400; person must exist in `public.users` (404), FO-disabled 400, already admitted (username OR fo link) 409; coach `teacherId` = body ?? FO `teacher_id`, none = 400; an admin never carries a teacherId; the CEO row cannot be deactivated here (400).

**Evidence**
- tsc 0; full suite **1390 pass / 0 fail** (was 1334).
- `routes/users-task930.test.ts` (new, no DB): every route: no token 401 · admin 403 · coach 403 (nothing written); admit valid 201 + FO hash copied + no hash/password in response; 9 bad bodies 400; ghost 404; FO-disabled 400; dup 409; coach teacherId default/override/none; create→list round trip; deactivate/reactivate soft; bad id 400, unknown 404, CEO refused; sign-in: FO password works, FO change carries over (stale refused), FO disable / BB deactivate / vanished person block, reactivate restores, CEO keeps own password and is never FO-verified, coach token carries teacherId, no reset route (404).
- **sid, rolled back, TEST password only** (`probe930.ts`, host-checked == sid): 15/15 PASS on the REAL SQL: admit/list/deactivate/reactivate via `makeDbStore(tx)`; second admit 409; the partial unique index refuses a second row for the same FO person (23505); FO change and FO disable carry over with no sync step; the CEO row refused; after the rollback 0 probe rows in `bo.users` and `public.users`.

**/security-review line:** CEO-only on every route (gate tests); the cross-schema read of `public.users` is two parameterised SELECTs, READ-ONLY, no write to `public`; no hash/password in any response (asserted on admit and list); sign-in failure stays ONE generic message (unknown/wrong/inactive/FO-disabled/vanished all 401); the admit 404 reveals FO membership to the CEO only; no password route exists, so BB cannot set a credential. Residuals: (a) an existing token stays valid up to 12 h after a deactivate or FO disable (SPEC-097 §4, accepted); (b) the copied hash in `bo.users` is an unused cache for admitted rows (login always reads FO); harmless, and it keeps the NOT NULL column filled; (c) the password-hash verify cost on login now includes one extra indexed read of `public.users`.

**Not done / note:** FE 931's Reset dialog is dropped per Sober's #2 (Sober told Fern). `src/routes/stock.ts` and `dist.zip` show as modified/untracked in the BB tree: not mine.

**PARKED per Sober's inbox order (2026-11-09).** My R0.1 hunks are in BB `git stash@{0}` ("TASK-930 R0.1 (Jason) ... pop after Stock redeploy"): the 7 tracked files plus the 4 new files (0021 sql, bo-user-admin.service.ts, routes/users.ts, users-task930.test.ts). A backup copy (patch + the 4 new files) is in my scratchpad `t930-backup/`. BB tree now: **tsc 0, 1372 pass / 0 fail** (Stock hotfix + base only). Before parking, WITH my hunks the tree was also green: tsc 0, 1390/0 (the red tsc Sober saw was mid-build). One thing to know: migration **0021 is already APPLIED on sid** (additive, one nullable column + partial index, nothing reads it without my code), so the deployed tree's journal lacks 0021 while the ledger has it; `db:verify` is expected to flag it until I pop. Harmless to the Stock redeploy. After the Stock redeploy + Tanya + Sober's commit: `git stash pop`, re-run tsc + suite, report.

## Review (Sober, SA Lead A, 2026-11-09) — ✅ ACCEPTED. Clean option-2; security-correct.
Code-read the security-critical parts: **checkLogin** (bo-user.service.ts:47-53) — an admitted row (`foUserId`) reads `public.users` for the LIVE hash + `disabled_at` via `foCredential` and refuses on FO-disabled OR vanished (`!cred || cred.disabledAt → null`), then verifies the password against the live FO hash; the env CEO (no foUserId) verifies its own hash. `foCredential` is a READ-ONLY parameterised SELECT on public.users. **No hash/password leaves in any response** (file-header pinned + admit/list tests). **All login failures return one generic 401** (no enumeration; only the CEO's admit 404 reveals FO membership, to the CEO alone). Admit rules correct (role∈{admin,coach}, ceo→400, 404 not-in-FO, 409 already-admitted, coach teacherId body??FO, FO-disabled→400, CEO row not deactivatable). 0021 additive (fo_user_id + partial unique index), verified on sid. Evidence: 1390/0, route-level tests for every route (the bug lesson applied), 15/15 sid rolled-back on the REAL SQL incl. the partial-unique refusal + FO change/disable carry-over. **Verdict: ✅ ACCEPTED.** Residuals all accepted (12h token per SPEC-097 §4; the cached hash is an unused fallback; one extra indexed FO read on login). 930 ships with 931 as the R0.1 unit.
**⚠ Commit note (line endings):** keep `drizzle/0021_*.sql` (and ALL migration SQL) **LF** — db:verify hashes the file, so CRLF changes the ledger hash and goes red (Jason hit this on `git stash pop`). I'll add a `.gitattributes` (`*.sql text eol=lf`) when I commit R0.1 so no checkout/pop can CRLF a migration again.

## Follow-up (Sober, 2026-11-09) — add `error.details.field` to the 400s (Fern needs it; one-deploy polish)
Small completion before the R0.1 redeploy: the validation 400s (`VALIDATION`) should carry **`error.details.field`** naming which field failed (`username` | `role` | `teacherId`), so the FE (931) puts the error on the right field + shows the person-picker for a coach-with-no-FO-teacher, instead of Fern's inferred hint. Add it to the admit/route validators + a route-level test asserting `error.details.field`. (The reads being a bare array and the not-in-FO 404 = `NOT_FOUND` are ACCEPTED as-is — I aligned the contract; only `details.field` changes.) Small; rides the R0.1 redeploy. Ball: you (if free) / Porter to route.


## Follow-up done: Jason, 2026-11-09. `error.details.field` on the admit 400s.
`bo-user-admin.service.ts`: each admit VALIDATION 400 now carries `details: { field }`: `username` (bad username, FO-disabled person), `role` (missing/invalid/ceo), `teacherId` (bad uuid; a coach with no FO teacher and none in the body, so the FE shows the person picker). The 404 NOT_FOUND, the bare-array GET and the 409 are untouched. Test: `users-task930.test.ts` "every admit VALIDATION 400 names the failing field" (7 bad bodies + the unchanged 404). Evidence: tsc 0, suite **1391 / 0**, `db:verify` ok. No schema or migration change.

## Follow-up ✅ ACCEPTED (Sober, SA Lead A, 2026-11-09) — code-read, not just the report
Verified the chain in code: `bo-user-admin.service.ts:84-93` — every admit VALIDATION 400 throws `badRequest(msg, { field })` with field = `username` (bad username L84, FO-disabled L90), `role` (ceo L85, invalid L86), `teacherId` (bad uuid L87, coach-no-FO-teacher L93). `lib/http.ts:15` → `ApiException(400,"VALIDATION",msg,{field})`; `index.ts:26` onError → `{ error:{ code:"VALIDATION", message, details:{field} } }`. The 404 NOT_FOUND (L89/L102) and the 409 ALREADY_ADMITTED (L91) carry NO field — correct (accepted as-is). Test `users-task930.test.ts:112` "every admit VALIDATION 400 names the failing field under error.details.field" mounts the real route+envelope and pins all 7 bad bodies incl. the coach-no-teacher → `teacherId` (drives the FE person-picker). tsc 0 · suite 1391/0 · db:verify ok · no schema/migration change. **Verdict: ✅ ACCEPTED.** The /users contract is now whole for R0.1. Ball: Fern (remove the temp hint, key off error.details.field, re-confirm green) → Sober (tee R0.1 redeploy w/ Porter).

## COMMITTED (Sober, 2026-11-09) — backoffice-back dong `6f1b427`
R0.1 pushed on `dong` after sid deploy + Tanya PASS (TEST-150 §R0.1). `7fcd748..6f1b427`, 12 files, incl. `.gitattributes *.sql text eol=lf` (0021 blob committed LF-verified, 0 CR). Done.
