# TASK-012: `/api/v1/channels/line/*`: link code, unlink, groups, names
- Source: SPEC-002 § API (the four `/channels/line` rows), § Linking (code creation, unlink) · SPEC-001 §3.1, §3.7 · REQ-003 req 1, 2, 5 · REQ-001 AC-3
- Owner: BE (Bob)
- Status: DONE (Silver, 2026-11-01. See § Review; the TASK-005 ingest wiring moved to TASK-013)
- Depends on: **TASK-011** (DONE) · Team A **TASK-002** (DONE 2026-11-01). Import `requireUser(deps)` from
  `src/core/auth.ts` (exported there, line 30; it is not on `Deps`); `c.get("user").id` is the session's user. Read it, don't edit it.
- **Also, when Team A's TASK-005 is DONE** (`src/core/intake.ts` exists): wire `index.ts` to its `ingestMessage` in
  place of `ingestNotAvailable`, then add TASK-011's `UNVERIFIED` checks (AC-2 → four `messages` rows; redelivery → one
  row) to `test/line-webhook.test.ts`. If TASK-005 is not DONE at your REVIEW, say so.

- Repo: `corner-chat-back`. Team B claim only.
- Files you may edit (closed list):
  - `src/modules/line/index.ts` (mount the routes), `src/modules/line/routes.ts`, `src/modules/line/store.ts`
  - `test/line-api.test.ts`, `test/line-webhook.test.ts` (only for the TASK-005 wiring checks above)
- Git writes allowed: **none.**

## What to do
Implement the four rows of SPEC-002 § API **exactly**: paths under `/api/v1`, Bearer via `requireUser`, JSON keys
`code`, `expiresAt`, `groups[].id`, `groups[].name`, `groups[].lastSeenAt`, `names`. Errors through `apiError` with
SPEC-001 §3.1's body. `PUT names` uses `normalizeNames` (TASK-010) and writes `line_names` in one transaction
(delete + insert with `position`). Over the limits → 400 `VALIDATION`, `fields.names` = the reason.
**New link code (amended 2026-11-01, from TASK-011 Q3):** in one transaction, (1) mark used every open code that has
expired (`used_at IS NULL AND expires_at <= now()`, any user), because `line_link_codes_open` is unique on `code` among
open rows, so a stale code would block the same digits forever; (2) mark used this user's open codes (void); (3) insert
the new code. A unique-violation on insert (a live code of another user has the same digits) → retry with fresh digits,
up to 5 times, then 500. `DELETE /channels/line` removes the link, `line_user_groups` and `line_own_messages`
rows of that user and keeps the names (D-B6). Every query filters by the session's user id, never by a request field.

## Definition of Done (paste real output)
- [ ] `bun test test/line-api.test.ts` green on the test DB:
  - no token → 401 `UNAUTHENTICATED` on all five routes;
  - link-code → 201, `code` matches `/^\d{6}$/`, `expiresAt` ≈ now + 10 min; a second call voids the first (the first code, sent to the webhook, is refused);
  - an expired, unused code `"123456"` of user U2 does not stop a new `"123456"` for U1 (force the digits through an injectable generator) · a live clash retries;
  - names: PUT `[" เอ ","Aey","aey"]` → 200 `{"names":["เอ","Aey"]}`; GET returns the same; 21 names → 400 `VALIDATION` with `fields.names`;
  - groups: U1 sees G1 (open) and not G2 (`left_at` set), and not U2's group G3 (**REQ-001 AC-3** isolation);
  - unlink → 204; then `GET /api/v1/channels` (Team A's, if merged in your tree) shows `line.linked:false`. Not merged → `UNVERIFIED — needs Team A's /channels`; names are still there.
- [ ] Live, local: `curl` each route with a real login token from Team A's `/auth/login` (paste the commands and the JSON; the token is cut to its first 6 chars in Notes).
- [ ] `git status --porcelain` → only closed-list files.

## Implementation Notes
**Bob, 2026-11-01.** Test-first: `test/line-api.test.ts` (13 tests) RED (`Cannot find module '../src/modules/line/routes'`) → `routes.ts`, store additions, `index.ts` mount → GREEN. No new dependency, no git writes, closed list held (`routes.ts`, `store.ts`, `index.ts`, `test/line-api.test.ts`). Team A's `src/core/auth.ts` and `src/modules/auth/body.ts` are imported read-only (`requireUser`, `readBody`).

Decisions (internal):
- `registerLineRoutes(api, deps, { newCode? })` is a separate export so tests can inject the digit generator; `registerLine(app, deps)` keeps its signature and calls it with the default (`newCode()` of TASK-010). `requireUser` guards the whole `/channels/line` sub-app.
- `createLinkCode` follows the amended TASK to the letter: in one transaction, expired open codes of anyone → used; this user's open codes → used (void); insert. Unique violation (PG `23505`, read from the error's `errno`/`code`) → retry with fresh digits, 5 tries, then throw → 500. On the last failure I throw a **new** `Error("no free link code after 5 tries")` instead of the Postgres error, because that error's `detail` line prints the clashing code and a live code must not reach the log (Team A's `handleError` logs the thrown object).
- `PUT /names`: body must be a JSON object (Team A's `readBody`); `names` not an array of strings → 400 `fields.names "must be an array of strings"`; `normalizeNames` limits → 400 with its message in `fields.names`. Saved in one transaction (delete + insert with `position`).
- `DELETE` removes the link, `line_user_groups` and `line_own_messages` rows of the session user in one transaction; names and any open link code are left (SPEC-002 lists only the three).
- Groups: open groups only, `last_seen_at desc, group_id` as tie-break; `lastSeenAt` ISO.
- No `console.` in `routes.ts` / `store.ts`.

Evidence:
```
$ bun test --preload ./test/setup.ts test/line-api.test.ts test/line-webhook.test.ts test/line-core.test.ts
 75 pass / 0 fail / 1189 expect() calls         (line-api: 13)
   (two "Unhandled error" blocks are handleError logging the two EXPECTED 500s: "no free link code after 5 tries" and "db down")
$ bunx tsc --noEmit | grep -E "modules/line|line-(core|webhook|api)"      → no output (no errors in LINE files)
   whole repo still has errors in Team A's in-progress tests (test/filter-rules.test.ts, test/messages-api.test.ts → ../src/core/intake), not mine.
```
Covered: no token → 401 `UNAUTHENTICATED` on all five routes · link-code 201, `/^\d{6}$/`, `expiresAt` = now + 10 min ± 5 s, row belongs to the caller · a second call voids the first (first code sent to the webhook → refusal reply, no `line_links` row; second code → `เชื่อม LINE แล้ว`, row written) · U2's expired unused `123456` does not block U1's `123456` (stale row marked used) · a live clash retries and U2's code stays open · 5 clashes → 500 and no row for U1 · names: `[" เอ ","Aey","aey"]` → `{"names":["เอ","Aey"]}`, GET same, second PUT replaces, another user sees `[]`, 21 names / 51 chars / non-array / non-string / no body → 400 (21 names: stored list unchanged) · groups: U1 sees G4 then G1 (newest first), not G2 (`left_at`), not U2's G3 (**REQ-001 AC-3**) · DELETE → 204, U1's link/groups/own-ids gone, names kept, U2's rows untouched; 204 also when not linked.

Live, local (server on :8091; 8080 is someone else's process), real login token of the local seed owner from `.env` (`m5mSeH…`, cut), credentials not echoed:
```
no token                 POST /channels/line/link-code   → 401 {"error":{"code":"UNAUTHENTICATED","message":"Missing or malformed bearer token"}}
POST /channels/line/link-code                            → 201 {"code":"824494","expiresAt":"2026-10-31T20:20:36.625Z"}
PUT  /channels/line/names {"names":[" เอ ","Aey","aey"]} → 200 {"names":["เอ","Aey"]}
GET  /channels/line/names                                → 200 {"names":["เอ","Aey"]}
GET  /channels/line/groups                               → 200 {"groups":[]}
PUT  /channels/line/names (21 names)                     → 400 {"error":{"code":"VALIDATION","message":"Invalid input","fields":{"names":"more than 20 names"}}}
DELETE /channels/line                                    → 204
GET  /channels/line/names (after DELETE)                 → 200  (names kept)
```
(My first live attempt showed `"??"` for the Thai name: that was this Windows shell mangling the `-d` string before curl sent it. Re-sent as explicit UTF-8 bytes: the DB holds `e0b980e0b8ad` = `เอ`, so the server is right.) Left in the local dev DB: one open link code for the seed owner (expires in 10 min); I reset the owner's names to `[]`.

```
$ git status --porcelain -uall | grep -i line      (Team B files only; src/filter/pipeline.ts is Team A's and only matches "line" in "pipeline")
?? src/modules/line/routes.ts          (new, this TASK)
?? test/line-api.test.ts               (new, this TASK)
   src/modules/line/index.ts, store.ts (edited, this TASK) · the rest are TASK-010/011 files
```

**UNVERIFIED / not done:**
- **TASK-005 is not DONE** (`src/core/intake.ts` does not exist in my tree): I did **not** wire `index.ts` to `ingestMessage` and did **not** add the `messages`-row checks to `test/line-webhook.test.ts`. `ingestNotAvailable` is still in place. That part of this TASK waits for TASK-005.
- `GET /api/v1/channels` showing `line.linked:false` after unlink: Team A's `/channels` is not in my tree → `UNVERIFIED — needs Team A's /channels`. Names are still there (tested).
- A real LINE account (B1) — nothing here talks to real LINE.

## Questions

## Review
**Verdict: DONE** for the endpoints. Silver (SA, Team B), 2026-11-01. Built and proven by the engineer. Not a test verdict.

Re-run by the SA on the same tree, 2026-11-01:
```
$ bun test --preload ./test/setup.ts test/line-api.test.ts test/line-webhook.test.ts test/line-core.test.ts → 75 pass, 0 fail, 1189 expect() [2.32s]
$ bunx tsc --noEmit | grep -E "modules/line|line-"                                                        → nothing (Team A's in-progress tests have errors, not ours)
```
Read against SPEC-002 § API + this TASK:
- All five routes match the paths and keys exactly (`code`, `expiresAt`, `groups[].id/name/lastSeenAt`, `names`). `requireUser`
  guards the whole `/channels/line` sub-app (imported, not edited). Every query is keyed on `c.get("user").id` ✔ (REQ-001 AC-3, tested).
- `createLinkCode`: the amended order in one transaction (expired → used, own → void, insert); 23505 → retry ×5. A fresh
  `Error` keeps the clashing code out of the log. Good judgement, kept ✔ (fixes F-006).
- `PUT names`: type check, then `normalizeNames`, then delete+insert in one transaction ✔. `DELETE`: the three tables only, names kept ✔ (D-B6).
- Live curl evidence on :8091 matches the table. The `"??"` Thai issue was diagnosed to the shell, not the server, with the stored bytes as proof ✔.
Not part of this verdict: the TASK-005 ingest wiring → **moved to TASK-013** (same file, Bob, after Team A's files land) ·
`GET /channels` `line.linked:false` after unlink → `UNVERIFIED — needs Team A's /channels` (TASK-003/005 area), re-checked by QA.
