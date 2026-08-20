# TASK-002: BE — auth: login/logout/me, argon2id, session cookie, middleware
- Source: SPEC-001
- Status: **DONE** — reviewed by Sober 2026-08-20 (evidence independently re-run); implemented and committed (`1b07622`)
- Assignee: Jason (BE)
- Depends on: TASK-001

## What to do

Implement exactly the three endpoints in SPEC-001 "API → Auth" and nothing else.

1. `POST /api/auth/login` — body `{ username, password }`. Look up the user,
   verify with argon2id, on success set the session cookie and return
   `200 { user: { id, username, displayName } }`.
   On failure `401 INVALID_CREDENTIALS`.
   **Same message and same timing path for "no such user" and "wrong password"** —
   always run a hash comparison (against a dummy hash when the user is absent).
2. `POST /api/auth/logout` — clear the cookie, `204`.
3. `GET /api/auth/me` — `200 { user: {...} }` or `401 AUTH_REQUIRED`.
4. **Session** — JWT in cookie `cr_session`: `HttpOnly`, `SameSite=Lax`,
   `Secure` (in production), `Path=/`, **12-hour expiry**, signed with
   `SESSION_SECRET`. Payload: `sub` (user id), `iat`, `exp` — nothing else, no
   role claim. No refresh token, no remember-me.
5. **Middleware** `requireSession` applied to **every** `/api/reports*` route
   (used by TASK-005). Missing/expired/tampered cookie → `401 AUTH_REQUIRED`,
   and the handler must not run (REQ-001 AC "a logged-out visitor cannot run a
   report").

**Forbidden — adding any of these is a spec violation, not an improvement**
(SPEC-001 "API → Auth"; REQ-001 §10.2/§10.3/§10.4): register/sign-up, user
create/update/delete, change-password, forgot-password, reset-token, any role or
permission field, any endpoint whose behaviour differs per user identity.

## Definition of Done
- [x] `bun test` passes with tests for: successful login sets an HttpOnly cookie;
      wrong password → 401 `INVALID_CREDENTIALS`; unknown username → the
      **identical** code and message; `me` without a cookie → 401 `AUTH_REQUIRED`;
      `me` with an expired token → 401; logout clears the cookie; a protected
      test route rejects an unauthenticated call **without executing the handler**.
- [x] Cookie flags asserted in a test: `HttpOnly`, `SameSite=Lax`, 12 h expiry.
- [x] `grep -rniE "role|permission|isAdmin|register|forgot|reset-password|change-password" src/` returns
      nothing that implements such a thing — paste the output.
- [x] `bun run typecheck` passes.
- [x] No password or hash appears in any log line (grep the test-run output).

## Implementation Notes

Jason (BE), 2026-08-20. Repo `C:\Users\Admin\develyst\code-report\code-report-back`,
commit **`1b07622`** (TASK-001's files went in as `d41ea75` in the same session —
they were still untracked, per Sober's standing "commit before REVIEW"
instruction; `src/index.ts` is in the TASK-002 commit because it carries this
task's route mounts).

### Files added / changed

| File | What it is |
|------|------------|
| `src/auth/session.ts` | The session. `cr_session` JWT: `HttpOnly`, `SameSite=Lax`, `Secure` outside development, `Path=/`, `Max-Age=43200` (12 h). Payload is `sub`/`iat`/`exp` and nothing else — no role claim, because REQ-001 §10.1 makes one meaningless. `sign`/`verify` both pin **HS256** explicitly (Hono 4.13's `verify` requires the algorithm, and pinning it is what stops an `alg`-confusion forgery). `verifySession` collapses missing/expired/tampered into one `undefined` so no caller can leak which it was. |
| `src/auth/users.ts` | `UserRepository` — two parameterised read-only SELECTs (`findByUsername`, `findById`). No create/update/delete: accounts come from TASK-001's seed script only. `publicUser()` is the only shape that reaches the client — id, username, displayName, never the hash. |
| `src/auth/routes.ts` | The three endpoints. `createAuthRoutes(repo)` takes the repository so the routes are testable with no database; the default is the real one. |
| `src/auth/middleware.ts` | `requireSession` — 401 `AUTH_REQUIRED` and `next()` is never called, so the handler behind it does not run. Sets `userId` for TASK-005. |
| `src/index.ts` | Mounts `/api/auth` and puts `requireSession` on `/api/reports` **and** `/api/reports/*` now, before TASK-005 writes those routes — a route added later is protected by default rather than by remembering. App is typed `Hono<SessionEnv>` so `c.get("userId")` is typed for TASK-005. |
| `test/auth.test.ts` | 16 tests (below). |

### Choices worth flagging to review

- **Identical timing path** is a constant `ABSENT_USER_HASH` — a real argon2id
  hash of a throwaway string — verified against whenever the username is
  unknown. Without it, "no such user" returns in microseconds while "wrong
  password" takes an argon2 verify, and login becomes a username oracle. Same
  message, same status, same body bytes: the test asserts the two responses are
  byte-identical rather than merely both 401.
- **`Bun.password.verify`** matches TASK-001's `Bun.password.hash`
  (`algorithm: "argon2id"`), as that TASK's note asked.
- **A malformed/non-JSON login body answers `401 INVALID_CREDENTIALS`**, not
  `400 VALIDATION_ERROR`. SPEC-001's Auth table lists exactly one error for this
  endpoint, and a distinct 400 would tell an unauthenticated caller something
  about the shape of the request. Say the word if you want the 400 instead.
- **`GET /me` with a valid token whose user row is gone** answers
  `401 AUTH_REQUIRED`. SPEC-001 has no code for it, and the session genuinely no
  longer identifies anyone — inventing a code would be scope I don't own.
- **No logout-side token invalidation.** SPEC-001 specifies a stateless JWT with
  no refresh token, so logout is exactly "clear the cookie" and a copy of the
  token taken before logout would remain valid until `exp`. That is inherent to
  the design as specified, not an oversight — flagging it, not changing it.

### Verification

```
$ bun run typecheck
$ tsc --noEmit
(no output — clean)     [exit 0]
```

```
$ bun test
bun test v1.3.13 (bf2e2cec)
 39 pass
 0 fail
 136 expect() calls
Ran 39 tests across 5 files. [1015.00ms]
```

The 16 new tests cover every named DoD case:
- login with valid credentials → `200 { user: {id, username, displayName} }` and
  a `Set-Cookie` starting `cr_session=` with `HttpOnly`;
- **cookie flags asserted**: `HttpOnly`, `SameSite=Lax`, `Path=/`,
  `Max-Age=43200`, plus an assertion that the constant *is* 12 × 60 × 60;
- wrong password → `401 INVALID_CREDENTIALS`, and **no** `Set-Cookie`;
- unknown username → same status **and a byte-identical body** to the
  wrong-password response;
- both failures respond in th and en from the TASK-001 message table;
- a non-JSON body → `401 INVALID_CREDENTIALS`, not a 500;
- login response body contains neither the password, nor `argon2`, nor
  `passwordHash`;
- `me` with a fresh cookie → 200; without a cookie → `401 AUTH_REQUIRED`; with an
  **expired** token (signed at `now − 12 h − 60 s`) → 401; with a **tampered**
  token → 401;
- logout → `204` and `cr_session=; … Max-Age=0`;
- `requireSession` on a protected test route: unauthenticated → `401
  AUTH_REQUIRED` **and a flag proving the handler body never ran**; authenticated
  → the handler sees the right `userId`;
- the **real** app already answers 401 on `/api/reports` and
  `/api/reports/some-job-id`, and returns **404** for `/api/auth/register`,
  `/signup`, `/change-password`, `/forgot-password`, `/reset-password` and
  `/api/users` — the forbidden surface is asserted absent, not just left unwritten.

```
$ grep -rniE "role|permission|isAdmin|register|forgot|reset-password|change-password" src/
src/auth/routes.ts:9: * There is no register, no user CRUD, no change-password, no forgot-password
src/auth/session.ts:7: * The payload carries `sub`, `iat`, `exp` and NOTHING else — no role, no
src/auth/session.ts:8: * permission, no display name. REQ-001 §10.1: all users are identical, so a
src/auth/users.ts:14:/** What the API returns about a user. There is no role field, by requirement. */
```
Four hits, all **prose inside comments stating the absence**. Nothing implements
a role, a permission, a registration or any password-management route.

```
$ bun test > testout.txt 2>&1
$ grep -niE "correct-horse|argon2|password_hash|passwordHash|\$argon2id|smart2026" testout.txt
(no matches — exit 1)
```
No password, no hash and no hash prefix appears anywhere in the test-run output.

**Not verified (and not required by this DoD):** the two SELECTs in
`dbUserRepository` have never run against a real PostgreSQL — the same missing
database as TASK-001/Q11. Every route above is proven against an in-memory
repository holding real argon2id hashes; the first real execution of those two
statements will be whenever a database exists (TASK-009 at the latest).

## Questions
(Jason asks; Sober answers as `> answer: ...`)

- **Q-BE-3 — NON-BLOCKING, nothing waits.** TASK-002 §4 says the cookie is
  `Secure` **"in production"**, but nothing in this project defines what
  "production" is: TASK-001 fixed the config variable list and there is no
  environment/mode variable in it, and I may not add one on my own judgement.
  Implemented default: `process.env.NODE_ENV === "production"`. It cannot be
  unconditional — a browser silently drops a `Secure` cookie sent over plain
  http, so a local `bun run dev` would be unable to log in at all. If you would
  rather have an explicit config var (e.g. `COOKIE_SECURE`, or `APP_ENV`), that
  is one line in `session.ts` plus a line in `config.ts`/`.env.example`, and I
  need a TASK line to add it.

  > answer (Sober, 2026-08-20): **(a) — keep `process.env.NODE_ENV === "production"`.
  > No TASK line, no new config variable.** Reasons: it is the runtime's own
  > convention, it needs no new configuration surface, and your reasoning for why
  > it cannot be unconditional is correct — a `Secure` cookie over plain http is
  > silently dropped and local `dev` could not log in at all. You were right not
  > to invent a config variable on your own judgement.
  > **Two things recorded with the answer rather than left implicit:**
  > (1) This makes the cookie's `Secure` flag depend on an operational fact
  > nobody has stated yet — whether the deployed KnowCode is served over https,
  > and whether whoever starts the process sets `NODE_ENV`. There is no
  > deployment TASK on this project, so that is not yours and not mine to settle
  > now; it belongs to whichever task first deploys this, and I have put it on
  > the board so it cannot be lost. Do not act on it.
  > (2) `secureCookie()` reads `process.env` directly, bypassing TASK-001's
  > config module — see minor 1 in `## Review` below. Same fix, whenever you next
  > touch `session.ts`.

## Review

**Sober (SA Lead), 2026-08-20 — verdict `DONE`.**

I read the real files in `code-report-back/src/auth` and `src/index.ts` and
**re-ran every checkable item myself rather than trusting the paste**:

- `bun run typecheck` → `tsc --noEmit`, **exit 0**.
- `bun test` → **103 pass / 0 fail**, 286 expect() calls, 11 files (the suite has
  grown past your 39 because TASK-003 landed after it; the auth file's 16 are in
  there and green).
- The forbidden-surface grep reproduces **exactly the four hits you pasted**, all
  prose inside comments stating the absence. Nothing implements a role, a
  permission, a registration or any password-management route.
- `bun test > testout.txt` then grepped for the password, `argon2`,
  `password_hash`, `passwordHash`, `$argon2id` and `smart2026` → **no match**
  (grep exit 1). The test-run output is 6 lines and carries no secret.

**Contract conformance against SPEC-001 "API → Auth" — the parts worth naming:**

- The auth surface is **exactly** the three specified endpoints, and the absence
  of the rest is *asserted*, not merely unwritten: `/api/auth/register`,
  `/signup`, `/change-password`, `/forgot-password`, `/reset-password` and
  `/api/users` are each proven to answer 404 **from the real app object**. That
  is the right way to test REQ-001 §10.2–§10.4, because "we didn't write it" is
  not a property a future commit can violate, and "it 404s" is.
- The **username-oracle defence is real and tested as a property**, not as a
  status code. Asserting the two failure bodies **byte-identical** is a stronger
  test than the DoD asked for, and it is the one that would actually catch a
  regression — two different messages both returning 401 would pass the literal
  DoD wording and still leak which usernames exist. `ABSENT_USER_HASH` closes the
  timing half of the same hole. This is the single best decision in the task.
- HS256 pinned on **verify** as well as sign. Verifying with the algorithm the
  token's own header names is the classic `alg`-confusion forgery, and this
  cannot be reached from here.
- `verifySession` collapses missing / expired / tampered into one `undefined`, so
  no caller *can* leak which it was even by accident. All three are tested.
- The session payload is `sub`/`iat`/`exp` and nothing else. Given REQ-001 §10.1
  (all users identical), a role claim would be a field with no meaning that a
  later change could start trusting — its absence is correct by requirement, not
  by omission.
- `requireSession` mounted on `/api/reports` **and** `/api/reports/*` before
  TASK-005 exists: the routes that task writes are protected by construction
  rather than by someone remembering. Correct, and it is tested against the real
  app, not a stand-in.

**Your three "veto or discover" calls — all three accepted, with reasons, so
they are decided rather than tolerated:**

1. **Malformed / non-JSON login body → `401 INVALID_CREDENTIALS`, not
   `400 VALIDATION_ERROR`. Accepted.** SPEC-001's Auth table lists exactly one
   error for that endpoint, and a distinct 400 would tell an unauthenticated
   caller something about request shape that the 401 deliberately withholds. You
   read the spec correctly.
2. **`GET /me` with a valid token whose user row is gone → `AUTH_REQUIRED`.
   Accepted.** The session no longer identifies anyone, so that is the honest
   code; the frontend's central 401 → login handler then does exactly the right
   thing. Inventing a new code would have been scope you don't own — right call.
3. **No logout-side token invalidation. Accepted, and it is a SPEC property, not
   a defect.** SPEC-001 specifies a stateless JWT with no refresh token, so
   "clear the cookie" is the whole of logout and a token copied beforehand stays
   valid until `exp`. Flagging it instead of silently adding a denylist was
   correct. Recording the consequence so nobody rediscovers it: if the human ever
   asks for "log out everywhere" or "revoke a session", that is a REQ change with
   a server-side session store behind it, not a tweak.

**Three minors. None is a defect against this DoD and none reopens the task** —
fix them when you next touch these files (`session.ts` work lands naturally in
TASK-005):

1. **`sessionSecret()` calls `loadConfigOrExit()` on every sign and every
   verify** — i.e. on every authenticated request — while `config.ts`'s own
   header says the config is "parsed and validated once at startup". Behaviour is
   correct today because the environment does not change after boot, so this is
   not a bug; it is a per-request re-parse and, more to the point, it puts a
   `process.exit(1)` on a request path. Cache the loaded config at module scope.
2. **`secureCookie()` reads `process.env.NODE_ENV` directly**, bypassing the
   config module that TASK-001 established as the single place environment is
   read. Same one-line fix as minor 1, same time.
3. **The login endpoint has no request-body size limit**, and it is
   unauthenticated: an arbitrarily large `password` string is fed to an argon2id
   verify. For an internal tool with three users behind a login this is a note,
   not a risk, and no REQ/SPEC/TASK line asks for a body cap — **so I am
   deliberately not creating scope for it now.** Recorded here so it is a
   decision rather than an oversight; revisit if this is ever exposed more
   widely.

**Correctly not verified, and correctly declared:** the two parameterised SELECTs
in `dbUserRepository` have never run against a real PostgreSQL. Every route is
proven against an in-memory repository holding real argon2id hashes, which is
what this DoD asks for; the first real execution is TASK-009 (or sooner, once the
authorised database is seeded). Saying so plainly in the notes instead of letting
the green suite imply otherwise is exactly the right handling.
