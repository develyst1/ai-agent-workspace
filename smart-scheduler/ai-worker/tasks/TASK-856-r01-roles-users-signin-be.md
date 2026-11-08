# TASK-856 — BE: R0.1 roles + users + sign-in (backoffice-back) — @Jason — REQ-120 wk 1
**From @Sober, 2026-11-08. BUILD GO (owner, REQ-120 §14).** SPEC: `specs/SPEC-097-r0-roles-users-signin-contract.md` (read whole). Repo: `smart-scheduler-backoffice-back`, branch `dong`. **Git only on the owner's word.**
**This is the spine's first link — Team C's Revenue waits on the role contract. Priority.**

## Steps
0. **Read first (brownfield):** `src/routes/auth.ts`, `src/middleware/auth.ts`, `src/db/schema.ts` (the existing `accounts` is financial, not users), and the front office's auth in `smart-scheduler-front` (NextAuth) enough to fix the seed strategy (SPEC §3).
1. **Schema:** add `bo_role` pgEnum (`ceo`/`admin`/`coach`) + `bo_users` (SPEC §2). **One migration, claimed through `MIGRATION-QUEUE.md` (Team A's first wk-1 slot).** Reversible; never truncate/drop/`db:push` on sid.
2. **Auth:** `POST /auth/login` → `{token, user:{username, role, teacherId}}` validating `bo_users`; keep the single-admin stub **only** under `SKIP_ADMIN_AUTH`.
3. **Gate:** `requireAuth` (sets `c.var.user`) + `requireRole(...Role[])` → 403 `FORBIDDEN`. Replace the single-admin gate; export both for the other teams.
4. **Seed:** one `ceo` (credentials from the owner via Porter — **ask through me, never hard-code**; until given, seed only under `SKIP_ADMIN_AUTH`).
5. **`.env.example`:** confirm every key the new code reads is listed with a one-line purpose (rule 8). Send me any new key for the owner.

## Done = (evidence in `## Implementation Notes`: command + real output)
- `bunx tsc --noEmit` 0 · the suite green (safe env) · the migration applies through the queue on sid (show the ledger line).
- `requireRole` shown 3 ways on a probe route: ceo 200 · admin 403 (ceo-only) · coach 403 · no token 401.
- `POST /auth/login` round-trip (a seeded user → token → `/me` or the probe).
- `git status` = only your claimed files. **No git command run.**

## Questions / Implementation Notes / Review
_(—)_

## Addendum — Sober, 2026-11-08: CEO seed credentials (env-read; no password through any of us)
- **Seed reads from env, never hard-coded, never through a file/inbox/chat.** Add to `backoffice-back/.env.example` with a one-line purpose each (BB's existing keys already have purposes — add these two):
  - `BO_SEED_CEO_USERNAME` — `# seed the CEO (พี่ฟีน) back-office user; owner sets on sid; unset ⇒ no CEO seed (dev stub only)`
  - `BO_SEED_CEO_PASSWORD` — `# CEO seed password; hashed on first seed; owner sets on sid; never commit a real value`
- **Seed logic:** on `bun run seed`, if both are set, create/ensure one `ceo` `bo_user` (hash the password); if unset, seed nothing (the `SKIP_ADMIN_AUTH` dev stub stays). Idempotent (re-run safe).
- **Decision (D-seed, mine, build-only):** env-read seed, **not** a first-login set-password flow — one CEO, simplest, matches "no password through us". Recorded in DECISIONS-REQ-120-build.md.
- **API_BASE is NOT a BB key** — BB is the API, not a caller. It belongs in whatever repo *calls* BB (the Revenue FE in `backoffice-front`), so it is not added to BB's `.env.example`. (Flagged to Porter for Sector.)


## Jason (BE) 2026-11-08 — TASK-856 built + migration applied on sid; ⏸ ONE pin file needs your GO before the suite is green
**State:** `bunx tsc --noEmit` = 0. Suite (safe env) = **157 pass / 2 fail**. The 2 failures are both in ONE existing pin file, `src/middleware/auth.test.ts` (the TASK-013 login tests); I have NOT edited it. My 2 new test files: **22 pass / 0 fail**. Migration `0007_bo_users_roles` is **applied and verified on sid** (below). No git command run.

**PIN FILE FOR YOUR GO — `src/middleware/auth.test.ts`, `describe("POST /auth/login (TASK-013)")` (lines 46–58), 2 tests:**
1. `correct env creds → 200 with a token + user` expects admin/admin to log in with `SKIP_ADMIN_AUTH="false"` and the user to `toEqual({username:"admin", role:"admin"})`. Your TASK retires exactly that: the env stub works **only under `SKIP_ADMIN_AUTH`**, and the user object is now `{username, role, teacherId}`.
2. `wrong password → 401` goes through the real route, which now looks the user up in `bo.users` ⇒ with no DB it is a 500 (with a DB it is 401).
- **Proposed edit (test file only, ~6 lines):** (1) run it with `SKIP_ADMIN_AUTH="true"` and expect `{username:"admin", role:"admin", teacherId:null}`; (2) build the file's app from `makeAuthRoutes(async () => undefined)` (the injectable lookup I added), so a wrong password is a DB-free 401. The 5 other tests in the file (adminOrService / adminAuth, signing with `{sub, role:"admin"}`) pass untouched. **Say GO and I make that edit and re-run the suite.**
- Not a pin edit, but yours to decide: `src/routes/bo.test.ts:102` finds guarded routes by `handler.name === "adminAuth"`. I kept `adminAuth` under that exact name (so nothing changes for the 14 routes in `bo.ts`), but a Team C route guarded with `requireRole("ceo")` would NOT count as guarded in that walk. When they add one there, that line should also accept `"requireRole"` / `"requireAuth"`. I did not touch it.

**What I built (files; every one is in my claim):** `src/db/schema.ts` (`boRole` enum + `boUsers`) · `drizzle/0007_bo_users_roles.sql` + `drizzle/meta/_journal.json` (hand-authored, idempotent, journal-registered per this repo's rule; the `drizzle-kit generate` output was a full re-create of the live tables, so I discarded it and its snapshot) · `src/lib/migration-witness.ts` (the witness the verify step and its test require for every journal tag) · `src/lib/jwt.ts` (`Role = "ceo"|"admin"|"coach"`, `ROLES`, claims `{sub, role, teacherId?}`, a token with another role is rejected) · `src/middleware/auth.ts` (**`requireAuth`**, **`requireRole(...roles)`** → 403 `FORBIDDEN`; `adminAuth` kept, now = ceo/admin, coach 403; `adminOrService` keeps the service token, JWT must be ceo/admin) · `src/services/bo-user.service.ts` (`Bun.password` argon2id, `checkLogin`, `createBoUser`) · `src/routes/auth.ts` (`POST /login` against `bo.users`, one sentence for unknown / wrong / inactive; response `{token, user:{username, role, teacherId}}`; the admin/admin stub only under `SKIP_ADMIN_AUTH`) · `src/routes/api.ts` (`GET /api/v1/me`, `requireAuth`) · `src/db/seed-bo-ceo.ts` + `package.json` `db:seed-bo-ceo` · `.env.example` · tests `src/middleware/roles-task856.test.ts`, `src/routes/auth-login-task856.test.ts`.

**Migration through the queue (`MIGRATION-QUEUE.md`, two lines written):** `applying` → `bunx drizzle-kit migrate` on the sid DB (`.env.sid`) → `applied · verified`. Evidence: ledger `drizzle.__drizzle_migrations_bo` **id 8 · created_at 1794075519530 · hash 9f507f1366af** (8 rows now, was 7); `bo.role` = `ceo,admin,coach`; `bo.users` 8 columns + `bo_users_username_uq` (+ pkey); 0 rows; `db:verify`: "Schema witnesses: 6 applied" (0007 included). Only additive DDL; nothing dropped, truncated or pushed. ⚠️ `db:verify` still prints "0006_bo_movement_audit NOT recorded" — it did **before** my migration too (the first read-only verify, same line); not mine and not touched.

**Done list:**
- **`requireRole` on a probe route, 3 ways (+ none), `src/middleware/roles-task856.test.ts`:** `requireRole("ceo")`: **ceo 200 · admin 403 · coach 403 · no token 401** (+ garbage token 401); `requireRole("ceo","admin")`: ceo 200 · admin 200 · coach 403 · none 401; `requireAuth` passes every role and carries a coach's `teacherId`; `adminAuth`/`adminOrService`: coach 403, service token still 200.
- **Login round trip (`auth-login-task856.test.ts`, user lookup injected):** login as ceo / admin / coach → `{token, user:{username, role, teacherId}}` (coach carries `teacherId`) → `GET /me` with that token returns the same user; wrong password · unknown user · inactive user = 401 with **the same** sentence; no hash in the response; admin/admin = 401 when enforced, 200 under `SKIP_ADMIN_AUTH=true`.
- **NOT done: a login round trip against the real sid DB.** `bo.users` has 0 rows and I have no CEO credentials. I did not seed a probe user into the shared DB. Say if you want one (a throw-away coach, removed after).
- `.env.example`: every key the new code reads is listed with a one-line purpose. **New keys for the owner:** `BO_CEO_USERNAME`, `BO_CEO_PASSWORD` (read only by `bun run db:seed-bo-ceo`; the script refuses without them, except under `SKIP_ADMIN_AUTH=true` where it seeds a `dev-ceo` with a random password printed once). **Please ask the owner for the CEO username + password**; I will seed on sid when you hand them to me (never in the repo).
- `git status` (backoffice-back): my files above **plus 2 that are not mine** — `drizzle.config.ts` (modified) and `src/db/schema-revenue.ts` (new), which Team C appears to have in the same tree; I did not touch them.

**Decisions I made on defaults — tell me if any is wrong (each is one small edit):**
1. Names: `bo.role` / `bo.users` (schema-qualified, matching `bo.item` / `bo.movement`), the SPEC's `bo_role` / `bo_users`.
2. `teacher_id` is a plain uuid, **no FK** to `public.teachers` (that table belongs to smart-scheduler-back; `bo.item.owner_ref` already does the same). Your SPEC says FK; I need your call.
3. Token `sub` = the **username** (like the old stub; the audit actor), not the row id.
4. The gate reads the token only (no DB read per request), so a user deactivated mid-session keeps access until the token expires (`JWT_TTL_SECONDS`, 12 h). Login does reject an inactive user. A per-request check is a follow-up if you want it.
5. Under `SKIP_ADMIN_AUTH=true` with no token, a request is a dev **ceo** (so Team C can reach `requireRole("ceo")` in dev); a valid Bearer still wins. With auth enforced, none of this exists.
Ball: Sober (GO on the one pin file; the CEO credentials from the owner).


## Jason (BE) 2026-11-08 — TASK-856 addendum applied (CEO seed from env) — still ⏸ waiting for your GO on the one pin file
Your addendum is in: the seed reads **`BO_SEED_CEO_USERNAME` + `BO_SEED_CEO_PASSWORD`** from the environment (renamed from my `BO_CEO_*`; no other reference to the old names remains). If either is unset it seeds **nothing** and exits 0 (the `SKIP_ADMIN_AUTH` dev stub stays; my random dev-ceo is gone). If both are set it creates the one `ceo` (argon2id-hashed) or leaves an existing username as it is, so a re-run is safe. `bun run seed` runs it (`db:seed-bo-ceo` is the same script; the old `db:seed` is the dormant ops seed and is untouched). `.env.example` has the two keys with your one-line purposes; no `API_BASE`. `bunx tsc --noEmit` = 0. I have not run the seed on sid: the owner sets the two values there, then `bun run seed`.
**Still open from my last report:** the GO on `src/middleware/auth.test.ts` (2 TASK-013 login tests, 157 pass / 2 fail until then), and my 5 default decisions (teacher_id no FK · sub = username · no per-request active check · dev-ceo under SKIP · `bo.role`/`bo.users` names).
Ball: Sober.

## Addendum 2 — Sober, 2026-11-08: `API_BASE` IS a BB key (Porter's correction, verified)
- `scripts/smoke.ts:5` reads `process.env.API_BASE` (the smoke test's target URL) and it is **not** in `.env.example`. Add it: `API_BASE=http://localhost:4010  # base URL the smoke test hits (default matches PORT)`. My earlier "not a BB key" was wrong — I reasoned instead of grepping the repo (F-036).

## Review — Sober, 2026-11-08: GO on the pin + 5 defaults ruled + re-apply to sid (code APPROVED; not DONE until 0007 is on sid)

**Code: strong. The role/user model, the `requireRole`/`requireAuth` gate (3 ways + none proven), the login round-trip with an injected lookup, argon2id hashing, the env-read idempotent CEO seed, the hand-authored additive 0007 — all match SPEC-097. tsc 0; your 22 new tests pass.** Two things block DONE, both below; neither is a code defect.

**1. Pin GO — GRANTED.** `src/middleware/auth.test.ts`, the 2 `describe("POST /auth/login (TASK-013)")` tests — make your proposed ~6-line edit:
- (1) run with `SKIP_ADMIN_AUTH="true"`, expect `{username:"admin", role:"admin", teacherId:null}` — this now asserts the **dev stub** still works and returns the R0.1 shape (a real, mutation-biting assertion).
- (2) build the app from `makeAuthRoutes(async () => undefined)` so a bad login is a DB-free 401.
- Coverage is NOT lost: the real `bo.users` login path (wrong password vs correct, unknown, inactive, enforced-vs-SKIP) is fully covered by your new `auth-login-task856.test.ts` (22 tests). These 2 edited tests keep the **stub** path covered. The pin's point is preserved and a mutation still bites. This is Team A's own test file, minimal edit — within my grant. Make the edit, re-run, confirm the suite is 159/0.

**2. The 5 defaults — all ACCEPTED:**
1. **`bo.role` / `bo.users`** schema-qualified (matching `bo.item`/`bo.movement`) — ✅ correct; the SPEC's `bo_role`/`bo_users` was shorthand. SPEC-097 §2 updated to the as-built names.
2. **`teacher_id` = plain uuid, NO FK** to `public.teachers` — ✅ **your call is right**, not my SPEC's. A cross-schema FK to a table smart-scheduler-back owns is coupling we don't want; `bo.item.owner_ref` is the precedent. Integrity stays at seed/app level. SPEC-097 §2 corrected (no FK, documented).
3. **Token `sub` = username** (audit actor) — ✅. SPEC-097 §4 updated.
4. **Token-only gate, no per-request `active` read** (deactivation takes effect at token expiry, 12 h; login rejects inactive) — ✅ **for R0.1**. The per-request active check is a **deferred R-later hardening** — I've recorded it in SPEC-097 §4 so it isn't lost; don't build it now.
5. **SKIP_ADMIN_AUTH + no token ⇒ dev ceo** (valid Bearer still wins; nonexistent under enforced auth) — ✅; it's gated behind SKIP, which must be false in prod.

**Your `bo.test.ts:102` note (`handler.name === "adminAuth"` won't catch `requireRole`/`requireAuth`):** correct and important — but **do NOT touch it in TASK-856.** Keeping `adminAuth` under its exact name was the right move (the 14 `bo.ts` routes don't change). The walk-accepts-requireRole fix belongs with **Team C's first `requireRole("ceo")` revenue route** TASK. Recorded in SPEC-097 §4 as a Team-C heads-up; Porter will relay to Sector. Not your defect.

**3. 🔴 0007 is on uat, not sid — re-apply to sid before this is DONE (F-038, mine).** Your "applied · verified on sid" used `.env.sid`, but BB's `.env`/that host was **154.197.124.29 = uat** (the customer's system), not sid (154.197.124.206). Not your fault — my TASK said "on sid" with no host gate, and `db:verify` proves *schema present*, not *which host*. Current state (Porter, host-checked):
- The owner has **repointed BB `.env` to sid** (Porter verified host only: 154.197.124.206 = sid).
- The owner **keeps** 0007's objects on uat — **nobody touches them** (undoing is a uat write, his call). Do not try to drop/revert anything on uat.
- **Re-apply 0007 to sid now:** write a **fresh `applying` line** in `MIGRATION-QUEUE.md`, then migrate, then `applied · verified` — and that line must **name the host** it was proven against.
- **🔑 The standing host check, every DB command from now (F-038):** before you run, print **the host only** of the `DATABASE_URL` the command will use (never the value) and confirm it is **154.197.124.206 = sid**. Mismatch ⇒ stop. Team C's migration follows after your `applied · verified — sid` line.

**4. CEO seed — not through me.** The owner types `BO_SEED_CEO_USERNAME` / `BO_SEED_CEO_PASSWORD` into sid's env himself (Porter is relaying the key names); then `bun run seed` on sid creates the one `ceo`. **Do not ask me for the values and do not seed a real CEO until the owner has set them.** No throw-away probe user in the shared sid DB — your injected-lookup round-trip already proves the path; a real round-trip waits for the seeded CEO. Until then the `SKIP_ADMIN_AUTH` dev stub covers local.

**Ball: Jason** — (a) make the pin edit, suite → 159/0; (b) re-apply 0007 to **sid** with the host check + fresh queue lines; (c) report the sid ledger line. Then I mark TASK-856 DONE. The CEO seed runs when the owner has set the env (Porter).


## Jason (BE) 2026-11-08 — TASK-856 follow-ups DONE: pin edited (suite green), 0007 host-checked on sid, CEO seed untouched — GREEN
1. **Pin `src/middleware/auth.test.ts` edited as proposed** (`git diff --stat`: 13 insertions, 8 deletions, that one file): the file's app is built from `makeAuthRoutes(async () => undefined)`; the env-creds test now runs under `SKIP_ADMIN_AUTH="true"` and expects `{username:"admin", role:"admin", teacherId:null}` (restored in a `finally`). The other 5 tests untouched. **`bunx tsc --noEmit` = 0 · suite (safe env) = 209 pass · 0 fail** (17 files). It is 209, not your 159, because the tree also holds Team C's new revenue tests (`revenue-ledger*.test.ts`); mine are the 22 + the 2 re-aimed ones. `bo.test.ts` untouched, as you said.
2. **0007 on sid, with the host gate:** `.env` and `.env.sid` now both resolve to host `154.197.124.206` = sid (`.env.uat` does not); I checked **host only** (a boolean, the URL never printed) before every command, in the shell that ran it. Fresh `applying` line written, then `drizzle-kit migrate` on that host = "migrations applied successfully", `db:verify` = 8 journal / **8 ledger rows**, "Schema witnesses: 6 applied", and a read of that host shows **ledger id 8 · created_at 1794075519530 · hash 9f507f1366af**, `bo.role` = ceo,admin,coach, `bo.users` 8 columns + `bo_users_username_uq`, 0 rows. `applied · verified` written **naming the host** (154.197.124.206 = sid). The row was already there when I read it before re-running (the re-run was a no-op, the SQL is idempotent). ⚠️ Honest note for F-038: my first apply on 11-08 ran with the variables exported from `.env.sid`, whose host I masked and saw as `.206`, and the sid ledger moved from 7 to 8 rows in that same shell; I cannot tell from here how a copy also reached UAT. I never touched `.env.uat` or its host, and I do not touch the UAT objects.
3. **CEO seed: not run, nothing seeded into sid** (no real CEO, no probe user). It waits for the owner to set `BO_SEED_CEO_USERNAME` / `BO_SEED_CEO_PASSWORD` on sid; I did not ask you for the values.
**Frozen** until your review. `git status` in backoffice-back also shows Team C's revenue files (not mine). No git command run.
Ball: Sober.

## Review — Sober, 2026-11-08: ✅ DONE
Both blockers cleared, evidence verified:
- **Pin:** one file, 13 ins / 8 del; env-creds test now under `SKIP_ADMIN_AUTH="true"` with a `finally` restore; `bo.test.ts` untouched. `tsc` 0 · suite **209 / 0** (209 incl. Team C's revenue tests in the tree; Jason's own = 22 + the 2 re-aimed). Pin's point kept, mutation still bites. ✅
- **0007 on sid:** host-only check passed (154.197.124.206 = sid) before every command; fresh `applying` line; `applied · verified` line **names the host**; ledger id 8. Team C's migration is now unblocked (its line in MIGRATION-QUEUE follows A's `applied · verified — sid`). ✅
- **CEO seed:** correctly NOT run — nothing seeded into sid, no probe user, values not asked of me. Waits on the owner's env (`BO_SEED_CEO_USERNAME`/`PASSWORD` on sid, via Porter). ✅
- **F-038 honesty:** Jason's note (identical `created_at`, re-apply no-op) actually shows 0007 reached **sid** on run 1; the "uat landing" was Porter's inference from the plain `.env` host, never a confirmed uat read — unconfirmable by us and harmless (owner keeps uat untouched). Clarified in F-038. The real defect (no host gate in the TASK) and its fix (standing host-only check) stand.

**R0.1 is delivered on sid:** sign-in + the three roles + `requireAuth`/`requireRole` gate + the `bo.users` model, all the contract Team C consumes. **The only thing not on sid is the real CEO row**, which is the owner's env step, not a code gap — so this does not block Team C or the demo.
**Ball: Porter** — (1) Team C (Sector) is cleared to apply its migration and mount `/revenue`; (2) the owner's env step for the CEO seed remains open (key names already with you).


## Jason (BE) 2026-11-08 — TASK-856 Addendum 2 applied (one line) — nothing else open on my side
Read your ✅ DONE. Your Addendum 2 was still open: `API_BASE=http://localhost:4010` is now in `backoffice-back/.env.example` with the one-line purpose "Base URL the smoke test (`bun run smoke`) hits". One honest detail: `scripts/smoke.ts:5` defaults to `http://localhost:3002` when it is unset, so the example value (4010, the example `PORT`) differs from the code's own default; I used your text and did not change the script. `.env.example` only; no other file, no git.
Ball: none (waiting for the next assignment).


## Jason (BE) 2026-11-08 — CEO seed run on sid: `bo.users: 1 row, role=ceo`
Host-only check passed first (the shell's `DATABASE_URL` host == 154.197.124.206 = sid, a boolean; both `BO_SEED_CEO_*` names set; no value printed). `bun run seed` = the seed-bo-ceo script only (the dormant ops `db:seed` untouched); exit 0, created one ceo (its output was withheld, it can contain the username). Read after: **`bo.users: 1 row, role=ceo`**. No MIGRATION-QUEUE line (data, not schema). No git.
Ball: Sober.

## Seed step closed — Sober, 2026-11-08
CEO seed run on sid by Jason after the host-only check (154.197.124.206 = sid, boolean; both env names set by the owner; **no value printed**). Result: `bo.users: 1 row, role=ceo`. No MIGRATION-QUEUE line (data, not schema) — correct. **R0.1 is now fully live on sid**: sign-in + 3 roles + the gate + the user model + the real CEO. The CEO login is provable only by the owner/QA who hold the credential — not by us. Nothing further open on TASK-856.
