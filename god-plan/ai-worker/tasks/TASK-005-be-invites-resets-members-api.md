# TASK-005: Back — invites, resets, members (I1–I3, M1, R1–R3)
- Source: SPEC-002 (§API rows I1–I3, M1, R1–R3; §Rules — I3 accept; §Data Model `link_tokens` + validity/consume rule; §Interpreted; P3)
- Owner: BE (Jason)
- Status: DONE (2026-11-08, SA review; the real-Postgres run is carried to TASK-003 steps 6–7)
- Depends on: TASK-004 (DONE)
- Git: none by you.

## What to do
Files (closed list): `src/links/tokens.ts` (create/hash/validate/consume, lifetime from `INVITE_TTL_SECONDS`), `src/invites/routes.ts`,
`src/resets/routes.ts`, `src/members/routes.ts`, `src/app.ts` (mount), `src/env.ts` (add `INVITE_TTL_SECONDS`, default 604800),
`.env.example` (add the key if missing), `test/api.links.test.ts`, and for the added step below, `src/http/validate.ts` + `test/api.core.test.ts`.
- **Added 2026-11-08 at TASK-004 review (SA):** a request body limit of **64 KB** on `/api/*` (Hono `bodyLimit`) → 400
  `{ "error": { "code": "VALIDATION", "field": "body", "rule": "tooLong", "max": 65536 } }`. `password()` refuses over **256
  characters** → 400 `VALIDATION field "password" rule "tooLong" max 256`. Applies to A1, I3, R3. Add one test for each.
- I1 cancels this project's earlier **unused** invite with the same name (case-insensitive, trimmed). R1 cancels that user's earlier unused reset.
- I3 order: valid session cookie → 409 `SIGNED_IN` first, token untouched (AC-18) · invalid link → 410 · existing email → password
  check (401, token untouched) → membership (idempotent) → consume → session · new email → create → membership → consume →
  session. Steps run in one transaction. The consume UPDATE must affect exactly 1 row.
- R3 deletes every session of that user. R1 for the owner himself → 400 (`field: "userId"`, `rule: "invalid"`).
- Returned URLs are `${FRONT_ORIGIN}/invite/<token>` and `${FRONT_ORIGIN}/reset/<token>`. The raw token is never stored and never logged.

## Definition of Done
- [ ] `bun test` → all pass, with these cases: link used twice → second 410 · link past its lifetime (TTL 1 s + wait) → 410 · a new
      link for the same name → the old one 410 (AC-13) · existing account accepts a second project's link with the old password →
      sees both in P1, still 1 users row (AC-14) · accept while signed in → 409 and the link still works afterwards for a
      signed-out person (AC-18) · reset → the old password 401, the new one 200, the old session 401 (AC-15) · the invitee can't
      call I1/M1/R1 (403) · a non-member gets 404 on I1/M1. Paste the output.
- [ ] Two parallel accepts of one link → exactly one succeeds (test or script). Paste.
- [ ] `grep -rn "console.log" src/links src/invites src/resets` → none prints a token. Paste.

## Implementation Notes
**Done (Jason, 2026-11-08), all on PGlite.** Repo `god-plan-back`, branch `atom`, nothing committed. Not run: the same routes on real Postgres (needs TASK-001/003 steps 6–7).

Files: `src/links/tokens.ts`, `src/invites/routes.ts`, `src/resets/routes.ts`, `src/members/routes.ts`, `src/app.ts` (mounts + body limit + exported `AppDeps`), `src/env.ts` (`inviteTtlSeconds`, default 604800, must be an integer ≥ 1), `src/http/validate.ts` (`password()` max 256, new `newPassword()` min 8), `test/api.links.test.ts` (new, 16 tests), `test/api.core.test.ts` (2 `createApp` calls updated + 2 new tests). `.env.example` already had `INVITE_TTL_SECONDS`. **Outside the closed list, needed:** `src/index.ts` passes `frontOrigin` and `inviteTtlSeconds` to `createApp`.

Evidence:
```
$ bun test
 47 pass
 0 fail
 313 expect() calls
Ran 47 tests across 3 files.        (8 schema + 23 core + 16 links; was 29 before this TASK)
$ bun x tsc --noEmit → no output, exit 0
$ grep -rn "console.log" src/links src/invites src/resets → no match (exit 1)
```
(Core went 21 → 23: the body-limit test and the password-256 test.)
DoD cases, each its own test with exact status/body: link used twice → 410 · TTL 1 s + 1.3 s wait → 410 (I2 and accept) · new link, same name (case-insensitive, trimmed) → old 410, other name/other project untouched (AC-13) · existing account + old password on a second project → both in P1, `users` rows for that email = 1, name kept; wrong password → 401 with the link still valid (AC-14) · signed-in accept → 409 `SIGNED_IN`, link then works signed-out; 409 even for a dead token; a garbage cookie counts as signed out (AC-18) · reset: old password 401, new 200, the old *and a second* session 401, link single-use (AC-15) · invitee 403 on I1/M1/R1; non-member 404 on I1/M1; no cookie 401 · two parallel accepts → statuses `[200, 410]`, one account · added step: 64 KB body → 400 `body tooLong max 65536` on A1 and on P2, 60 KB passes · password 257 chars → 400 `tooLong max 256` on A1, I3, R3 (256 passes).
**Mutation check:** I removed the `rows.length !== 1` guard in `consumeLink`; the parallel-accept test failed (15 pass / 1 fail). Restored; the 47 pass again.

Decisions (mine, reversible):
1. **I3 consumes the link FIRST inside the transaction**, then creates the user, the membership and the session (SPEC lists create → membership → consume). Reason: the link row lock makes two parallel accepts take turns, and the loser gets 410 before it inserts anything; with create-first, two accepts using different emails could each create an account. Observable results are the same.
2. I3 order: 409 → link 410 → body 400/401 → transaction. A bad body never consumes the link. The Set-Cookie is added only after the transaction commits.
3. R1 order: session → owner (403) → unknown user 404 → owner himself 400 → member of no project 404. R3 order: link 410 → password 400 → transaction.
4. `INVITE_TTL_SECONDS` applies to invites and resets. `FRONT_ORIGIN`'s trailing slash is stripped in the URLs. Raw tokens exist only in the response and are never stored or logged (a test searches the stored rows for the raw token).
5. M1 pending list: unused, not cancelled, not expired; oldest first. Members: oldest first.

`UNVERIFIED`: true database-level concurrency. PGlite runs one connection and serialises transactions, so the parallel test proves the consume guard (the mutation shows it), not Postgres row-lock timing. `kill -9`-style failure after commit and the real-Postgres run: after TASK-001. `/security-review`: not run (untracked tree); my read: all queries through drizzle, tokens 32 random bytes stored as sha256, hash compare by DB equality, no token/password in any log or error.

## Questions

## Review
**DONE — Sober (SA), 2026-11-08.** Proven on PGlite. The real-Postgres run is carried to TASK-003 steps 6–7 (TASK-001).
- Re-ran: `bun test` → 47 pass, 0 fail · `bun x tsc --noEmit` → clean. `git status` matches the list, plus `src/index.ts` (needed to
  pass the new deps; accepted).
- Read `src/links/tokens.ts`, `src/invites/routes.ts`, `src/resets/routes.ts`, `src/members/routes.ts`, and the body limit in `src/app.ts`:
  - The consume is one guarded `UPDATE … RETURNING`, and anything but 1 row → 410. Raw tokens appear only in the response, and only hashes are stored.
  - I3: the 409 check comes first, before the token is touched (AC-18). The existing-account path verifies its own password and keeps
    its name (AC-14). The cookie is set only after the commit. R3 deletes every session (AC-15). M1 is owner-only, so invitees never see emails.
  - Jason's mutation check (removing the 1-row guard makes the parallel test fail) shows the test bites. Good practice.
- **Deviation accepted (decision 1):** I3 consumes the link **first** inside the transaction. That is better than SPEC-002's order:
  the loser of a race fails before creating anything. SPEC-002 §Rules is amended to match. Decisions 2–5 are also accepted.
- Noted, no action: two accepts of **different** links with the **same new email** at the same instant would hit `users.email UNIQUE` → 500,
  rolled back. It fails closed. Rare with one owner making links by hand.
- `UNVERIFIED`, carried forward: Postgres row-lock timing (PGlite serialises transactions). Settled by the real-Postgres run after TASK-001.
