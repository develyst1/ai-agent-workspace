# TASK-011: LINE migration, webhook route, events, `ingestMessage` calls, linking reply, `rows.ts` / `send-event.ts`
- Source: SPEC-002 § Intake rule (all steps), § Linking (webhook side), § "My groups", § Data model, § Testability (a), (d) · REQ-003 req 1–4, 9 · AC-1, AC-2, AC-3, AC-6
- Owner: BE (Bob)
- Status: DONE (Silver, 2026-11-01. See § Review)
- Depends on: **TASK-010** (DONE 2026-11-01). Needs the local Postgres connection string in `.env` (SPEC-001 §8, an owner input via the PM), same as Team A.
  **Amended by the SA 2026-11-01: start now, do not wait for Team A's TASK-005.** Only the `ingestMessage` call needs it.
  - In `webhook.ts` export `createLineWebhook(lineDeps: { db; config; ingestMessage: (input: IngestInput) => Promise<{ messageId: string; duplicate: boolean }> })`.
    Declare `IngestInput` locally in `src/modules/line/types.ts`, copied **exactly** from SPEC-001 §4. Do not edit Team A's `Deps` type or `src/app.ts`.
  - `registerLine(app, deps)` wires `ingestMessage` from `src/core/intake.ts` once that file exists (TASK-005). Until then
    it mounts the route with an `ingestMessage` that throws `"ingest not available yet"`, so LINE gets a 500 and redelivers.
  - Tests build the webhook with an **injected stub `ingestMessage`** that records its calls. The AC-2 checks assert the
    recorded `IngestInput` (user, `recipientKind`, sender name, group name) instead of `messages` rows. When TASK-005 is
    in your tree, add the end-to-end assertions on `messages` rows. If it is still missing at REVIEW, write
    `UNVERIFIED — needs TASK-005` for those lines only.

- Repo: `corner-chat-back`. Team B claim only.
- Files you may edit (closed list):
  - `migrations/202611010100_line_init.sql`: **exactly** the SQL in SPEC-002 § Data model
  - `src/modules/line/index.ts` (`registerLine(app, deps)`: mount the webhook; keep its exported name and signature)
  - `src/modules/line/webhook.ts`, `src/modules/line/store.ts` (all SQL of the LINE tables), `src/modules/line/line-api.ts` (summary, member-profile, profile, reply; base URL `process.env.LINE_API_BASE ?? "https://api.line.me"`)
  - `src/modules/line/scripts/rows.ts`, `src/modules/line/scripts/send-event.ts`
  - `test/line-webhook.test.ts`, `test/fixtures/line/*.json` (made-up events only)
- Git writes allowed: **none.**

## What to do
1. Migration file as written in SPEC-002. Run `bun run migrate` on the **local** dev DB only.
2. `POST /webhooks/line` on the `api` app `registerLine` receives, so the full path is **`/api/v1/webhooks/line`** (SPEC-002 § API; no `requireUser`). Read the raw text first, then `verifyLineSignature` with
   `LINE_CHANNEL_SECRET` → bad → 401 `BAD_SIGNATURE` via `apiError`, **before** `JSON.parse`, nothing written.
3. For each event, apply SPEC-002 § Intake rule steps 1–7 in order. Load the context for `decideGroupMessage` from the
   LINE tables + `users.status = 'active'`. Write `line_own_messages` / `line_user_groups` as the rule says. For each
   concerned user call `deps.ingestMessage` with **exactly** SPEC-001 §4 `IngestInput`; `sender.name` from member-profile
   (in-memory 1 h cache; failure → `"LINE"`). A refused ingest (disabled) → skip + log the line SPEC-002 gives; any
   other error → 500.
4. 1-on-1 text → linking per SPEC-002 § Linking: limiter, open code, the one-LINE-id-one-user rule, reply text
   `เชื่อม LINE แล้ว` / `รหัสไม่ถูกต้องหรือหมดอายุ ขอรหัสใหม่ในแอป`, then the membership check over open groups.
   (The link-code **endpoint** is TASK-012. Here, tests insert a code row directly.)
5. `join` / `leave` / `memberJoined` / `memberLeft` / `unfollow` per steps 3–6.
6. Logging rule of SPEC-002: no body, no text, no non-user LINE id. `grep` your own code for `console.` and list each call in Notes.
7. `scripts/rows.ts`: connect with `DATABASE_URL` (or `DATABASE_URL_TEST` when `--test`), print `table<TAB>count` for every
   table in schema `public`, sorted by name. `scripts/send-event.ts <file.json> [--url http://127.0.0.1:8080/api/v1/webhooks/line]
   [--bad-signature]`: signs the file's bytes with `LINE_CHANNEL_SECRET` and POSTs them, then prints the status + body.

## Definition of Done (paste real output)
- [ ] `bun run migrate` on the local dev DB → applies `202611010100_line_init.sql`; `psql "$DATABASE_URL" -c '\dt line_*'` lists the 7 tables.
- [ ] `bun test test/line-webhook.test.ts` green, end-to-end through the Hono app on the **test DB** with the fake LINE API, covering:
  - **AC-6:** wrong signature → 401 `BAD_SIGNATURE`; every table's count is unchanged (compare the `rows.ts` output before/after);
  - **AC-2:** U1 linked + member of G1; four events from another member (mention, mention-all, quote of U1's earlier message, untagged nickname) → four `messages` rows for U1 with `recipient_kind` `mention`, `mention_all`, `reply_to_me`, `name_match`; `sender_name` = the fake's `"สมชาย"`; `group_name` set;
  - **AC-3:** an event that concerns nobody → **every** table's count unchanged and `ai_calls` unchanged;
  - redelivery of the same event → still one `messages` row;
  - U1's own message → one `line_own_messages` row (id only: assert the table has no text column) and **no** `messages` row;
  - mention-all with U1 and U2 both members → one row each;
  - a disabled U2 → no row for U2, U1 still gets one;
  - `join` → `line_groups` row with the fake's group name; linked members get `line_user_groups` rows (fake member-profile 200), a non-member does not (404);
  - linking: right code → `line_links` row, the fake recorded a reply `"เชื่อม LINE แล้ว"`; expired code → the refusal reply, no row; a LINE id linked to U1 sends U2's code → refused; 5 wrong codes → the 6th gets no reply;
  - `unfollow` → `line_links` row gone.
- [ ] Live, local: `bun run dev`, then `bun src/modules/line/scripts/send-event.ts test/fixtures/line/mention.json` → `200`;
      with `--bad-signature` → `401`. Paste both, plus `rows.ts` before/after for the bad one.
- [ ] One timing: the `send-event.ts` round trip for `mention.json`, 5 runs, local (paste the ms). For SPEC-002 § Non-functional.
- [ ] `git status --porcelain` → only closed-list files.

## Implementation Notes
**Bob, 2026-11-01.** Test-first: `test/line-webhook.test.ts` (29 tests) was RED (`Cannot find module '../src/modules/line/store'`), then migration + `store.ts`, `line-api.ts`, `webhook.ts`, `index.ts`, `types.ts` (+`IngestInput`, copied from SPEC-001 §4), `scripts/rows.ts`, `scripts/send-event.ts`, `test/fixtures/line/mention.json` → GREEN. No new dependency, no git writes, closed list held. Local databases only (dev + test cluster on :5433).

Decisions (internal; reviewer may overturn):
- `createLineWebhook(deps)` returns the Hono handler; `registerLine` mounts it with `ingestNotAvailable` (throws → 500) until Team A's `src/core/intake.ts` exists. Wiring it later is a one-line change in `index.ts`.
- **Empty `LINE_CHANNEL_SECRET` → 401, always.** HMAC with an empty key is computable by anyone, so an unset secret must not let signed requests in (test included).
- Signature valid but body not JSON → 400 `BAD_BODY`.
- `ensureGroup`: a group with no `line_groups` row is created from the summary API only when something must be written (a linked sender's own message, `memberJoined`). Summary failure → the group id is used as the name (column is NOT NULL); a later `join` fixes it. A message does not re-open a group with `left_at` set (SPEC-002 is silent).
- Linking: every refusal (wrong, expired, used, LINE id owned by another user) counts toward the 5-wrong limit. The code is marked used and the link written in one transaction (`UPDATE … WHERE used_at IS NULL AND expires_at > now()` first, so a race loses cleanly). Reply and membership-check failures are logged and swallowed: the code is already spent, a 500 would make LINE redeliver into a refusal.
- `join` lets LINE API errors on member-profile propagate (500, idempotent redelivery). The link-time membership check does not (see above).
- Sender with no `userId` in the event → `sender.key` `"unknown"`, name `"LINE"`.
- Per-user ingest refusal is recognised as an Error named `IngestRefused` — **assumption, see Questions**.
- `countAllTables` lives in `store.ts` so the test and `rows.ts` use the same code.

Evidence:
```
$ bun run migrate                          (local dev DB)
Applied:
  202611010100_line_init.sql
$ psql "$DATABASE_URL" -c '\dt line_*'     → 7 rows: line_groups, line_link_codes, line_links, line_names,
                                             line_own_messages, line_pushes, line_user_groups

$ bun test --preload ./test/setup.ts test/line-webhook.test.ts test/line-core.test.ts
 62 pass / 0 fail / 1136 expect() calls          (webhook file: 29 pass, run on the TEST DB with the fake LINE API)
$ bunx tsc --noEmit                         → no output (whole repo clean)
```
Covered: AC-6 (401 + `BAD_SIGNATURE` + all 22 table counts equal + no LINE call; missing header; empty secret; non-JSON → 400; verify ping `{}`; real `createApp()` mount) · AC-2 (U1 linked + member: `mention`, `mention_all`, `reply_to_me` after U1's own message, `name_match` for `AEY`; asserted `IngestInput`: user, kind, `externalId`, `sender {Lx, "สมชาย"}`, `groupName "ทีมขาย"`, `receivedAt`, text) · AC-3 (nobody concerned → counts unchanged, `ai_calls` 0, zero LINE API calls) · sticker + tag-all → nobody · own message → one `line_own_messages` row, columns are exactly `created_at, group_id, message_id, user_id` (no text), `last_seen_at` refreshed, no ingest · tag-all with U1+U2 → one each · disabled U2 skipped (and `IngestRefused` thrown for U2 → skipped, 200) · other ingest error → 500 · name cache (one member-profile call for two events) and failure → `"LINE"` · `join` (name from summary, linked member 200 → row, 404 → none) · `leave` · `memberJoined`/`memberLeft` · `unfollow` · linking (right code incl. reply headers/token/text and membership rows, expired, used, other user's LINE id, 5 wrong → 6th silent, non-6-digit silent) · fixture `mention.json`.

Live, local (server on **:8091**: port 8080 on this machine is held by another process that answers `401 UNAUTHENTICATED "dev message for…"`, which is not this repo; I left it alone). Secret passed on the command line, `.env` untouched:
```
$ PORT=8091 LINE_CHANNEL_SECRET=dev-test-secret bun run dev      {"ok":true,"db":true} on /api/v1/health
$ bun src/modules/line/scripts/send-event.ts test/fixtures/line/mention.json
200 {} (19 ms)
$ … --bad-signature
401 {"error":{"code":"BAD_SIGNATURE","message":"Bad signature"}} (15 ms)
$ bun src/modules/line/scripts/rows.ts  (before) vs (after the bad one) vs (after the good ones) → diff: identical
  (ai_calls 0, line_* 0, messages 0, schema_migrations 2, users 2, 22 tables)
Timing, 5 runs of mention.json, round trip incl. process-to-server: 16, 16, 17, 18, 17 ms   (first, cold: 19 ms)
```
`mention.json` is from an unlinked sender in an unknown group, so the good send writes nothing and reaches no ingest. The ingest path is covered by the tests, not by the live run.

`console.` calls in `src/modules/line` (outside `scripts/`), all without body, text or foreign LINE id:
1. `webhook.ts:25` `warn(tag, e)` → tag and, for LINE API errors, `status=<code>`.
2. `webhook.ts:104` `line.ingest_refused userId=<our id>` (the line SPEC-002 gives).
3. `webhook.ts:209` `line.webhook_secret_missing`.
Tags used by `warn`: `line.group_summary_failed`, `line.member_profile_failed`, `line.reply_failed`, `line.membership_check_failed`.

```
$ git status --porcelain -uall | grep -i line
?? migrations/202611010100_line_init.sql
?? src/modules/line/{index,intake-rule,line-api,link-code,names,signature,store,types,webhook}.ts
?? src/modules/line/scripts/{rows,send-event}.ts
?? src/modules/line/testing/fake-line-api.ts
?? test/fixtures/line/mention.json
?? test/line-core.test.ts
?? test/line-webhook.test.ts
```
Only closed-list files (TASK-010's are included; `index.ts` is Team A's file, edited as the list allows).

**UNVERIFIED:**
- "Redelivery → still one `messages` row" and the `messages`-row assertions of AC-2 — needs Team A's real `ingestMessage` (TASK-005). Covered here only as: the stub receives the same user + `externalId` on redelivery.
- Real LINE payloads and the real `LINE_API_BASE` — fake only (needs B1).
- Whole suite (`bun run test`): **2 failures, both in Team A's `test/base.test.ts`**, caused by my migration being the second one: `setup created the 15 tables of §5` (now 22) and `running again applies nothing` (`schema_migrations` count expected 1, now 2). They pass again once the expected numbers are 22 and 2. Not my file, not touched.

## Questions
- **Q1 (non-blocking), for the SA:** how does Team A's `ingestMessage` mark the "refused: disabled/unknown user" throw (TASK-005 says "refuse (throw)")? I recognise an `Error` with `name === "IngestRefused"`; anything else becomes a 500. If Team A throws something else, it is a one-line change in `webhook.ts` (`isIngestRefused`). Today the case is mostly unreachable: disabled users are filtered out of the candidates by the query.
- **Q2 (for Team A, via the SA):** `test/base.test.ts` hard-codes 15 tables and 1 migration; the LINE migration makes them 22 and 2. Needs a Team A edit.
- **Q3 (non-blocking, TASK-012):** `line_link_codes_open` is `UNIQUE (code) WHERE used_at IS NULL`, so an expired-but-unused code still blocks a new identical code. TASK-012's `link-code` endpoint should void a user's old open codes (SPEC-002 says so) and be ready for a rare collision with another user's expired code.
  > answer (SA, Q1): reasonable assumption. I asked the PM to have Team A confirm in TASK-005 that the refusal is an
  > `Error` with `name === "IngestRefused"`. Keep `isIngestRefused` as is. If Team A picks another marker, the one-line
  > change happens when `index.ts` is wired to `src/core/intake.ts`.
  > answer (SA, Q2): Team A's file. Sent to the PM for Sober (expected 22 tables / 2 migrations, or count core tables only).
  > answer (SA, Q3): good catch, a real defect in **my** SPEC-002. Fixed in TASK-012 § What to do (void expired open
  > codes before insert + retry on a unique clash). No change in this TASK.
  > answer (SA Team A Sober, 2026-11-01, asked via the PM): **Q1 confirmed.** `ingestMessage` refuses a disabled or unknown
  > user by throwing an `Error` with `name === "IngestRefused"`. That is now in SPEC-001 §4 and TASK-005 step 2, so keep
  > `isIngestRefused`. **Q2:** already Team A's work — TASK-005 step 0 makes `base.test.ts` check that the 15 core tables
  > exist and that a second `migrate()` applies nothing, so it does not depend on Team B's tables.

## Review
**Verdict: DONE**. Silver (SA, Team B), 2026-11-01. Built and proven by the engineer. Not a test verdict (that is QA's).

Re-run by the SA on the same tree, 2026-11-01:
```
$ bun test --preload ./test/setup.ts test/line-webhook.test.ts test/line-core.test.ts   → 62 pass, 0 fail, 1136 expect() [1.95s]
$ bunx tsc --noEmit                                                                     → exit 0 (Team A fixed their TS2345)
$ diff <SPEC-002 § Data model SQL> migrations/202611010100_line_init.sql                → identical
$ bun test --preload ./test/setup.ts   (whole repo)                                     → 97 pass, 2 fail: both in Team A's test/base.test.ts (hard-coded 15 tables / 1 migration), as Bob reported
```
The two "Unhandled error" blocks in the full run are `handleError` logging a thrown 500, in a Team A test and in our
"other ingest failure → 500" test. They are expected and not failures.

Read against SPEC-002:
- Signature before parse, on the raw text. An **empty secret → 401**: a better rule than mine, adopted. Non-JSON → 400 `BAD_BODY` (accepted).
- Group message: `activeLinks`/`membersOf` join `users.status='active'` ✔. Own message → id-only row + `last_seen_at` ✔.
  Nobody concerned → return before any sender-name call, ingest or write ✔ (AC-3). Sender name is fetched only for concerned messages ✔.
- `IngestInput` fields match SPEC-001 §4 exactly ✔. Refusal is skipped per user. Any other error → 500 ✔.
- Linking: the code is used + linked in one transaction with a conditional `UPDATE` ✔. One LINE id ↔ one user ✔. Every
  refusal counts for the limiter (accepted). Reply/membership failures are swallowed after the code is spent: correct, a
  500 there would redeliver into a refusal.
- join / leave (left_at + rows deleted, one transaction) / memberJoined / memberLeft / unfollow ✔ per steps 3–6.
- Logging: the 3 `console.` sites listed carry no body, text or foreign LINE id ✔.
- `index.ts` keeps `registerLine`'s signature. `ingestNotAvailable` → 500 until TASK-005 ✔ (TASK-011 amendment).
- Live run on :8091 (8080 is someone else's process; left alone, correctly). Bad signature leaves `rows.ts` identical. Round trip 16–19 ms.

Still `UNVERIFIED` (carried, not blocking DONE): `messages`-row assertions + redelivery dedupe through Team A's real
`ingestMessage` (TASK-005; re-check when `index.ts` is wired) · real LINE payloads (B1).
Follow-ups: wiring `index.ts` to `src/core/intake.ts` goes into TASK-012 (same file, Bob) once TASK-005 is DONE.
