# TASK-004: Back — auth, projects, tasks, comments (A1–A3, P1–P3, T1–T4, C1–C2)
- Source: SPEC-002 (§API / Interface Design rows A1–A3, P1–P3, T1–T4, C1–C2; §Rules behind the routes; §Data Model notes on tokens and passwords)
- Owner: BE (Jason)
- Status: DONE (2026-11-08, SA review; the dev-DB curl is carried to TASK-003 steps 6–7) (2026-11-08: TASK-003 steps 1–5 accepted). The DoD's curl-on-dev line waits for TASK-001. Write it as
  `UNVERIFIED — needs TASK-001` until then. Everything else runs on PGlite.
- Depends on: TASK-003 steps 1–5 (accepted)
- Git: none by you.

## What to do
In `god-plan-back`, implement exactly the routes listed, with the **exact field casing, status codes and error bodies** of
SPEC-002. Files (closed list): `src/app.ts` (mount), `src/auth/session.ts` (cookie `gp_session`, token create/hash/lookup,
30 days), `src/auth/routes.ts`, `src/auth/require.ts` (middleware: session → 401; helpers `canSeeProject` → 404, `requireOwner` → 403),
`src/http/errors.ts` (the error body + codes), `src/http/validate.ts` (trim, required, max length, email shape),
`src/projects/routes.ts`, `src/tasks/routes.ts`, `src/comments/routes.ts`, `test/api.*.test.ts` (PGlite).
Key rules, all in SPEC-002:
- 404 before 403, and the same 404 for "doesn't exist" and "can't see" (AC-4).
- T3: `stuck` needs `stuckReason` in the same request. Any other status clears it (AC-2a, AC-17).
- T2 bulk is one transaction, 1–50 titles. A bad item → 400 with `field: "titles[i]"`, nothing written.
- C2: any viewer, body 1–2000 after trim. HTML stored as typed.
- `commentCount` on every Task. `taskCounts` on every ProjectListItem.

## Definition of Done
- [ ] `bun test` → all pass. The tests must include, each as its own case: owner creates a project + 3 tasks → all `todo` (AC-1) ·
      stuck without a reason → 400 and the status unchanged (AC-2a) · stuck → doing clears `stuckReason` (AC-17) · an invitee
      (a membership row inserted in the test) gets 403 on P2, T1, T3, T4 (AC-6) · a non-member gets 404 on P3, C1, C2, and P1
      omits the project (AC-4) · an invitee comments, and the owner's C1 shows the author's displayName (AC-5) · a 2001-character
      comment → 400 `tooLong` `max: 2000` · `<script>` comment stored and returned byte-identical (AC-16) · wrong password → 401
      `INVALID_CREDENTIALS`. Paste the output.
- [ ] A curl sequence against `bun run dev` on the dev database with the synthetic owner from `god-plan-qa.env`: sign-in →
      create project → create task → PATCH to stuck with reason → GET project. Paste requests and responses (cookie value redacted).
- [ ] `/security-review` findings, or "none", pasted. The SA also runs it before DONE.

## Implementation Notes
**Done (Jason, 2026-11-08), all on PGlite. Two DoD items NOT done: the dev-DB curl sequence (`UNVERIFIED — needs TASK-001` + `god-plan-qa.env`) and the `/security-review` command (see below).** Repo `god-plan-back`, branch `atom`, nothing committed.

Files (closed list): `src/app.ts`, `src/index.ts` (needed to pass `db`; now also requires `DATABASE_URL` at start), `src/auth/{session,require,routes}.ts`, `src/http/{errors,validate}.ts`, `src/projects/routes.ts`, `src/tasks/routes.ts`, `src/comments/routes.ts`, `test/api.core.test.ts` (one file, 21 tests; `api.*.test.ts` pattern). `taskColumns`/`toTask` live in `tasks/routes.ts` and `projects/routes.ts` imports them (no extra file).

Evidence:
```
$ bun test
 29 pass
 0 fail
 175 expect() calls
Ran 29 tests across 2 files.        (8 from TASK-003 + 21 new)
$ bun x tsc --noEmit  → no output, exit 0
```
DoD cases, each its own test, all asserting exact status and body: AC-1 (project + 3 bulk + 1 task → all `todo`, creation order) · AC-2a (stuck without/blank reason → 400 `stuckReason required`, status unchanged) · AC-17 (stuck → doing clears the reason) · AC-6 (invitee 403 on P2, T1, T2, T3, T4; can read P3) · AC-4 (non-member 404 on P3, T1, T3, T4, C1, C2; P1 omits; same body as a missing id; non-uuid id → 404; nothing written) · AC-5 (invitee comments, owner's C1 shows `ผู้ร่วมงานทดสอบ`) · 2001-char comment → 400 `tooLong` `max: 2000` · AC-16 `<script>` byte-identical in the response, C1 and the DB row · wrong password → 401 `INVALID_CREDENTIALS`, unknown email gives the identical body. Extras: cookie flags (HttpOnly, SameSite=Lax, Path=/, Max-Age=2592000; `Secure` only with `COOKIE_SECURE`), session stored as sha256 only, expired session → 401, sign-out deletes the row, bulk all-or-none (`titles[1]`), T4 cascades comments, P1 counts and ordering, `commentCount`.

Decisions (mine, reversible — veto in Review):
1. Check order everywhere: session 401 → can-see 404 → owner 403 → body 400.
2. PATCH with no recognised field, or `stuckReason` on a non-stuck task, is a no-op returning the task unchanged (`updatedAt` not bumped). SPEC is silent.
3. Malformed/non-object JSON body → 400 `VALIDATION field "body" rule "invalid"` (not in the SPEC table). A non-string field → `rule "invalid"`; project/task-id not a uuid → 404.
4. T2 sets `created_at = now + i ms` per item, because rows of one statement share `now()` and would tie (order is by `created_at`).
5. Passwords are not trimmed. Unknown email still verifies a dummy hash (no timing hint). Unhandled errors log only `err.name` and return `500 {"error":{"code":"INTERNAL"}}` (query params may carry comments/hashes).
6. Lengths count characters (code points), like Postgres `length()`.

Security pass (my own read; **`/security-review` the command was not run** — it reviews the git diff and this tree is untracked; the SA runs it): no SQL string building (drizzle, one hard-coded subquery); every project/task route resolves visibility before the action; `isOwner` is never read from input; no token/password/hash in any response or log. **Open, for the SA to decide:** (a) no sign-in rate limit or lockout (only argon2 cost); (b) no request body size limit (Bun's default is large; a huge `password` is hashed); (c) concurrent PATCH `stuckReason`-only vs. a status change could hit the CHECK and return 500. None is in SPEC-002.

Verified in this tree: `git check-ignore .env` → `.env`. No `.env` exists yet (TASK-003 step 6). Only two console calls in `src/` (listen line; error name).
`UNVERIFIED`: the real-Postgres behaviour of any query (PGlite only; Postgres 13+ assumed); the dev-DB curl sequence.

## Questions

## Review
**DONE — Sober (SA), 2026-11-08.** Built and proven on PGlite. One DoD line carried forward (below).
- Re-ran in `god-plan-back`: `bun test` → 29 pass, 0 fail · `bun x tsc --noEmit` → clean. `git status --short` = the closed list.
- **Security review, by reading** (SA): I ran no `/security-review` command, because the tree is untracked and that command reviews
  a git diff. Read: `src/auth/{session,require,routes}.ts`, `src/tasks/routes.ts`, `src/comments/routes.ts`,
  `src/projects/routes.ts`, `src/http/validate.ts`, the error handler in `src/app.ts`.
  - Every project/task route resolves `visibleProject`/`visibleTask` (404) before `requireOwner` (403). The non-member path
    can't tell missing from forbidden (AC-4). `isOwner` comes from the DB row, never from input.
  - All queries go through drizzle. The one raw `sql` (commentCount) has no input in it. Tokens are 32 random bytes, stored as
    sha256 only. The cookie flags match SPEC. A dummy hash evens out sign-in timing. Errors return codes only, and the log keeps `err.name` only.
  - Comment bodies are stored as typed and returned as JSON. Rendering is the front's job (no `dangerouslySetInnerHTML`, TASK-007/008).
- **Jason's decisions 1–6: all accepted.** I'm adding 3 (`field: "body"`, `rule: "invalid"`) and the 500 `INTERNAL` body to SPEC-002's error table.
- **His open security notes, ruled:**
  - (a) no sign-in throttle → **deferred to deploy time.** Local-only release 1 with synthetic users. Logged in SPEC-002 §Risks.
  - (b) no body size limit → **fix in TASK-005** (step added there): a 64 KB body limit → 400 `VALIDATION field "body" rule "tooLong" max 65536`,
    and password max 256 characters → 400 `tooLong` (reuses the existing front string).
  - (c) the PATCH race into the CHECK → 500 → **accepted.** There is one owner, so it needs two simultaneous edits by him. It fails closed, with no bad row.
- **Carried forward:** the dev-DB curl sequence is `UNVERIFIED — needs TASK-001`. It is done as part of TASK-003 steps 6–7, not by reopening this TASK.
