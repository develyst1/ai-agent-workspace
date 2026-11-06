# SPEC-002: LINE groups in + LINE 1-on-1 notify (Team B)
- Source: REQ-003 (as amended 2026-11-01)
- Team: B (SA Silver) · builds inside the seams of **SPEC-001 §3.7, §4, §5** (Team A, ACTIVE 2026-11-01)
- Status: ACTIVE — 2026-11-01

## What I read
- REQ-003 (73 lines, incl. the 2026-11-01 amendments + testability list), REQ-001/002/004/005, `SYSTEM-FACTS.md`,
  `DECISIONS.md`, `decisions-for-owner-review.md`, understanding doc §1c, §Q2-SA, §Q3-SA, § Team round.
- **SPEC-001** (428 lines): §3.1 rules, §3.7 LINE endpoint shapes (fixed there), §3.8 devices, §4 seams, §5 tables,
  §6 flow. Team A TASK-001 (creates `src/modules/line/index.ts` with `registerLine(app, deps)`), TASK-002
  (`requireUser`), TASK-005 (`src/core/intake.ts` `ingestMessage`).
- `corner-chat-back`: README only (greenfield, 2026-11-01).
- **LINE Messaging API reference, read 2026-11-01** (`developers.line.biz/en/reference/messaging-api/index.html.md`):
  - mentionee `type`: *"`user`: User or bot."* / *"`all`: Entire group."* `userId` only for `type:user`; `isSelf` true
    for the bot itself. ⇒ **"tag all" is in the docs.** SPEC-001 §2 and REQ-003 AC-8 still say `UNVERIFIED`: they are
    now doc-verified. AC-8 keeps its test-group check.
  - text message: `quotedMessageId`, *"Only included when the received message quotes a past message."*
  - Get group chat member user IDs: *"available only for verified or premium accounts"* (403 otherwise) ⇒ **not used**.
  - Get group chat member profile `GET /v2/bot/group/{groupId}/member/{userId}`: no account restriction stated; 404 for
    a user who *"hasn't joined a group"*. Response has `displayName` (`inferred` from the profile object; checked in TASK-011).
  - Get group chat summary `GET /v2/bot/group/{groupId}/summary` → `groupId`, `groupName`, `pictureUrl`.
  - Push `POST https://api.line.me/v2/bot/message/push`. A 409 = *"same retry key has already been accepted"*. The
    header name `X-Line-Retry-Key` is `inferred` (that section was not in the part I read).
  - Signature: header `x-line-signature` = Base64(HMAC-SHA256(channel secret, raw body)) (from the doc's code samples).
  - Reply `POST /v2/bot/message/reply` with `replyToken` (used only for the link-code answer, 1-on-1).
  - Get profile (1-on-1 friend) `GET /v2/bot/profile/{userId}` → `displayName` (`inferred`: not opened).

## Overview
corner-chat's OA sits in users' LINE groups. For each group message the webhook decides **in memory** whether it
concerns linked users. Only then does it call Team A's `ingestMessage`, once per concerned user, and from there the
REQ-004 filter takes over. Everything else is dropped unread. When the filter decides `notified`, Team A's notifier calls
our registered `"line"` notifier, which pushes 1-on-1. A user links LINE with a one-time code, keeps a names list, and
sees the groups the OA shares with them.

## Seams — as fixed by SPEC-001 (Team B implements the right-hand side only)
| Seam | Owner | Contract |
|---|---|---|
| LINE → `POST /api/v1/webhooks/line` | **B** | SPEC-001 §3.7 (relative to §3.1's base path, as `registerLine(api, deps)` is mounted on `/api/v1` in `src/app.ts`, read 2026-11-01); signature below |
| `/api/v1/channels/line/*` (link-code, unlink, groups, names) | **B** | SPEC-001 §3.7, shapes copied below **exactly** |
| `ingestMessage(IngestInput)` | A provides (TASK-005), B calls | SPEC-001 §4 |
| `registerNotifier("line", fn)` | A provides (TASK-007), B registers | SPEC-001 §4; `Notification = { userId, messageId, aboutLine, preview, senderName }` |
| `GET /channels` → `LineChannel { linked, displayName }` | A builds, reads our `line_links` | SPEC-001 §3.7 |
| Admin push count `GET /admin/stats/line-pushes` | A (TASK-007 API, TASK-009 page), reads our `line_pushes` | SPEC-001 §3.3 |
| FCM + `/devices` | A (TASK-007) | SPEC-001 §3.8 |
| Files Team B may write | — | `src/modules/line/**`, `migrations/*_line_*.sql`, tests `test/line-*.test.ts` + `test/fixtures/line/**` `[SA-decided: so the two teams never touch the same test file]` |

## Intake rule (REQ-003 req 3–4, AC-2, AC-3, amended rules)
Per webhook event, in this order, **in memory first**:
1. **Group message** (`source.type:"group"`, `type:"message"`):
   a. If the sender (`source.userId`) is a **linked** user (row in `line_links`) whose `users.status='active'`: insert
      `{message_id, user_id, group_id}` into `line_own_messages` (id only, never text) and upsert `line_user_groups`
      (`last_seen_at=now()`). **Their own message is never taken in for them** (amended rule).
   b. If `message.type` is not `text` → stop here. Only text carries mentions and quotes in round 1 (D-B5).
   c. Candidates `C` = active linked users with a `line_user_groups` row for this group, minus the sender.
   d. For each `u` in `C`, the first that holds sets `recipientKind`:
      - a mentionee `type:"user"` with `userId` = u's `line_user_id` → `"mention"`
      - a mentionee `type:"all"` → `"mention_all"`
      - `quotedMessageId` is in `line_own_messages` with `user_id = u` → `"reply_to_me"`
      - u's names list matches → `"name_match"`. Match = substring of the message text. Latin letters compare
        case-insensitively; Thai and every other script compare as written (REQ-003 amendment). Implement as
        `text.toLowerCase().includes(name.toLowerCase())`: `toLowerCase` changes only cased scripts, so Thai stays as
        written. Names are trimmed when saved. No AI.
   e. **Nobody concerned → return. Nothing written.** No row, no log line with ids or text, no AI call (AC-3).
   f. Otherwise, for each concerned `u`: `ingestMessage({ userId: u, channel:"line", externalId: message.id,
      sender:{ key: source.userId, name: <displayName> }, groupId, groupName, text: message.text, recipientKind,
      hasAttachments:false, attachmentNames:[], receivedAt: <event timestamp → ISO> })`.
      `displayName`: member-profile API, cached in memory for 1 h per (groupId, userId). On failure, `"LINE"` `[SA-decided]`.
      `groupName`: `line_groups.name`. If missing, call the summary API and upsert.
      `ingestMessage` throws (e.g. user disabled) → skip that user and log `line.ingest_refused userId=<our id>`.
      Any other failure → answer **500** so LINE redelivers. Redelivery is safe: `ingestMessage` is idempotent.
2. **1-on-1 text** (`source.type:"user"`) → the link-code check (§Linking). Any other 1-on-1 message is ignored and
   stored nowhere (1-on-1 is not an incoming channel: REQ-003 Out of Scope).
3. **`join`** (OA added to a group) → upsert `line_groups` (summary API for the name, `left_at=null`). Then, for each
   active linked user, call member-profile: 200 → upsert `line_user_groups`; 404 → nothing. Users are few (the owner adds
   them), so this is N calls per join.
4. **`leave`** → `line_groups.left_at=now()`; delete that group's `line_user_groups` rows.
5. **`memberJoined` / `memberLeft`** → upsert/delete `line_user_groups` for linked users in `joined.members[]` /
   `left.members[]`.
6. **`unfollow`** (the user blocked the OA) → delete their `line_links` row (they show as not linked; pushes would fail).
   `follow` → nothing.
7. Any other event → ignored.

**Logging rule (AC-3):** never log a request body, a message text, or the LINE id of someone who is not linked. Allowed
in logs: event type, counts, our own user ids, LINE request ids, errors with no payload.

## "My groups" — answers REQ-003 Q1 (`[SA-decided; D-B1]`)
A group is listed for a user when a `line_user_groups` row exists. One is written by any of: the join check (step 3);
linking (the same member-profile check across every open group); `memberJoined`; the user writing in the group
(step 1a). This is stronger than the PM's "once seen": a quiet user who never writes still sees the group right after
adding the OA. The member-list API is not used: verified/premium accounts only (doc, above).

## Linking (REQ-003 req 1, AC-1, D10)
- `POST /api/v1/channels/line/link-code` → 6 random digits, `expiresAt = now + 10 min`. Expired open codes of any user
  are first marked used, since the open-code index is unique on `code` (found by Bob, TASK-011 Q3), and a clash with a
  live code retries. Any older unused code of the
  same user is marked used (void).
- A 1-on-1 text, trimmed, matching `^\d{6}$`:
  - an open, unexpired code, and this LINE id is not linked to **another** user → insert/replace `line_links(user_id,
    line_user_id, display_name, linked_at)`. `display_name` comes from the profile API (null on failure). Mark the code
    used. **Reply** (free, no quota) `เชื่อม LINE แล้ว`. Then run the membership check (step 3) for this user across all
    groups with `left_at IS NULL`.
  - otherwise (wrong, expired, used, or this LINE id already belongs to another user, amended rule) → reply
    `รหัสไม่ถูกต้องหรือหมดอายุ ขอรหัสใหม่ในแอป`.
  - Brute force: 5 wrong codes from one LINE id within 10 min → that id gets no reply and no check for 10 min. Counter
    in memory `[SA-decided; D-B3]`.
- Text that is not 6 digits → no reply, nothing stored.
- `DELETE /api/v1/channels/line` → delete the user's `line_links`, `line_user_groups` and `line_own_messages` rows.
  The names list is kept.

## LINE notifier (REQ-003 req 6, AC-4; SPEC-001 §4)
`registerLine(app, deps)` calls `deps.registerNotifier("line", notifyLine)`:
- no `line_links` row for `n.userId` → return (nothing to push; Team A logs the attempt).
- text = `n.aboutLine + "\n" + n.preview` (REQ-003 wording `{about line}\n{first 2 lines}`; `preview` is already
  "first 2 non-empty lines ≤ 200 chars", SPEC-001 §3.4). If `aboutLine` is null (AI did not run):
  `"AI ไม่ได้ตรวจ · " + n.senderName + "\n" + n.preview`, the same rule as SPEC-001 §3.8's FCM title.
- `POST {LINE_API_BASE}/v2/bot/message/push`, `{ "to": line_user_id, "messages": [{ "type":"text", "text": … }] }`,
  header `X-Line-Retry-Key: <one UUID per notifyLine call>`. On a network error or 5xx: up to 3 retries after the first try (2 s, 10 s, 30 s), with the same retry key, so at most 4 calls.
  A 409 counts as sent. Any other 4xx → throw at once (Team A logs it).
- **Sent → one `INSERT INTO line_pushes (user_id, message_id) … ON CONFLICT (message_id, user_id) DO NOTHING`.** Only
  sent pushes get a row, so Team A's `count(*)` per month is AC-7's number. Not sent → throw an `Error` whose message
  carries the LINE status code and no payload.
- Only the **test** OA's credentials are in `.env` during the build (REQ-003 Constraints, B1).

## API — `/api/v1`, SPEC-001 §3.1 rules (Bearer via `requireUser`, error body, 404 for others' ids); camelCase exactly
| Method + path | Request | Response | Errors |
|---|---|---|---|
| `POST /channels/line/link-code` | — | 201 `{ "code": "482913", "expiresAt": "2026-11-01T03:10:00.000Z" }` | 401 |
| `DELETE /channels/line` | — | 204 (also when not linked) | 401 |
| `GET /channels/line/groups` | — | 200 `{ "groups": [ { "id": "Cxxxxxxxx", "name": "ทีมขาย", "lastSeenAt": "…" } ] }`: open groups only (`left_at IS NULL`), newest `lastSeenAt` first | 401 |
| `GET /channels/line/names` | — | 200 `{ "names": ["เอ", "Aey"] }` (saved order) | 401 |
| `PUT /channels/line/names` | `{ "names": string[] }` ≤ 20 items, each trimmed 1–50 chars; duplicates (case-insensitive) are dropped, first kept | 200 `{ "names": [...] }` as saved | 400 `VALIDATION` `fields.names` · 401 |
| `POST /webhooks/line` (= `/api/v1/webhooks/line`; no Bearer, so not behind `requireUser`) | LINE's raw body + `x-line-signature` | 200 `{}` | 401 `BAD_SIGNATURE` (missing or wrong: **nothing parsed or stored**, AC-6) · 500 (ingest failed: LINE redelivers) |

The webhook reads the **raw** body (`await c.req.text()`) for the HMAC **before** `JSON.parse`, and compares with
`crypto.timingSafeEqual`. `lastSeenAt` = `line_user_groups.last_seen_at`.

## Data model — `migrations/202611010100_line_init.sql` (Team B; runs after `…0001_core_init.sql` by file order)
```sql
CREATE TABLE line_links (                              -- SPEC-001 §5 minimum columns + nothing Team A reads beyond them
  user_id      uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  line_user_id text NOT NULL UNIQUE,                   -- one LINE account ↔ one user (amended rule)
  display_name text,
  linked_at    timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE line_link_codes (
  code       char(6) NOT NULL,
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  used_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX line_link_codes_open ON line_link_codes (code) WHERE used_at IS NULL;
CREATE TABLE line_names (
  user_id  uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position int  NOT NULL,
  name     text NOT NULL CHECK (length(name) BETWEEN 1 AND 50),
  PRIMARY KEY (user_id, position)
);
CREATE UNIQUE INDEX line_names_uniq ON line_names (user_id, lower(name));
CREATE TABLE line_groups (
  group_id  text PRIMARY KEY,
  name      text NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  left_at   timestamptz
);
CREATE TABLE line_user_groups (
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id     text NOT NULL REFERENCES line_groups(group_id) ON DELETE CASCADE,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, group_id)
);
CREATE TABLE line_own_messages (                       -- ids only, never text ("ได้ เก็บเลข")
  message_id text PRIMARY KEY,                         -- LINE message id
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id   text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE line_pushes (                             -- SPEC-001 §5 columns exactly; one row per SENT push
  id         bigserial PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  pushed_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id)
);
```
Existing rows: none (greenfield). Who runs it: the BE, **local database only**, `bun run migrate` (SPEC-001 §5).
`PUT names` replaces the user's rows in one transaction (delete + insert with `position` 0…n).

## Config (`corner-chat-back/.env`, never in git)
**Fail closed (amended 2026-11-01, TASK-022):** an empty `LINE_CHANNEL_ACCESS_TOKEN` means no LINE call leaves the machine, so a dev server with no test-OA token can never reach real LINE.
`LINE_CHANNEL_SECRET`, `LINE_CHANNEL_ACCESS_TOKEN` (already in SPEC-001 §9) + **`LINE_API_BASE`** (default
`https://api.line.me`, read in code). Tests set it in-process to the fake LINE API. **Team B does not edit
`.env.example` or `package.json`** (Team A's files): `LINE_API_BASE` is optional and documented here; scripts run as
`bun <path>`, not as package scripts.

## Testability (REQ-003 Questions, QA list (a)–(f))
- (a) `bun src/modules/line/scripts/rows.ts` prints a row count for **every table in the
  database** (`information_schema.tables`, schema `public`), not just ours, so AC-3's before/after diff is one command.
- (b) AI-call log = Team A's `ai_calls` (SPEC-001 §5). (c) AI stub switch = Team A (TASK-006). (e) `decisions.decided_at` = Team A.
- (d) `LINE_CHANNEL_SECRET` in local `.env`. `bun src/modules/line/scripts/send-event.ts <file.json>`
  signs a webhook body with it and POSTs it to the local server. Tefany's harness uses the same script.
- (f) the debug APK pointing at the local back end = SPEC-003.
- A **fake LINE API** (`src/modules/line/testing/fake-line-api.ts`, a `Bun.serve` on a random port) answers push,
  reply, summary, member-profile and profile, and records each call. The tests run against it with `LINE_API_BASE`
  pointing there. Real LINE is used only with B1, through a temporary tunnel, test OA only, never left running (D16).

## Real-LINE live run plan (REQ-003 Q8 leftovers; B1 · D16 · D44) — Silver, SA-B, 2026-11-01
Closes what TEST-004 § Verdict names NOT_TESTED: **AC-8** (real "tag all"), the **real push** to a LINE account, and
AC-1 on the real OA. AC-5's refusal (B7, needs a second test OA) and #1b (a 10-minute wait) stay out unless the owner wants them.
One sitting, **owner present the whole time, about 45 minutes**. Nothing is left running afterwards.

**What the owner must have or install (before the sitting):**
1. **cloudflared** on this PC (Cloudflare's quick tunnel: no account, no domain, the URL dies when it stops):
   `winget install --id Cloudflare.cloudflared`. He installs it himself; no role downloads it.
2. **The test OA's LINE Developers console** open (he has the login): Messaging API tab.
3. **Two LINE accounts on two phones:** his own (= user U1 in corner-chat) and **one more person** (= member M) who agrees
   to be in a test group for 45 minutes. A third person is not needed.
4. **A new LINE group** "corner-chat test" with only those two people. The OA joins it during the sitting.

**What the owner does in the console (each is a change to the real OA, so it is his hand, in the sitting):**
- Webhook URL = `https://<the tunnel name QA reads out>.trycloudflare.com/api/v1/webhooks/line` → **Verify** (expect Success) →
  **Use webhook: ON**.
- **Allow bot to join group chats: ON** (LINE Official Account Manager → Settings, if it is off).
- **Auto-reply messages: OFF** and Greeting message as he likes (otherwise LINE answers codes by itself).
- At the end: **Use webhook: OFF**. The tunnel URL is dead by then anyway.

**What QA (Tefany) runs, nothing else on the machine talks to LINE:**
- Back end from `corner-chat-back` with, **on the command line only** (D44; Bun keeps process env over `.env`):
  `LINE_LIVE=1 LINE_API_BASE=https://api.line.me DATABASE_URL=<owner's server>/corner_chat_test_qa_b` + the AI **stub**
  (so pass/hold is chosen, not guessed). The startup line must read `line: target=live`; anything else → stop.
- `cloudflared tunnel --url http://localhost:<port>` in its own window; QA reads the `trycloudflare.com` name to the owner.
- The app: the web build or the APK on `cc_phone_360`, signed in as U1's corner-chat test user.

**The run (TEST-004 rows, each with the owner's or M's phone):**
| # | Who does what | Expected |
|---|---|---|
| 1 | U1 opens `/channels/line`, adds the OA as a friend, sends the 6-digit code | OA replies "เชื่อม LINE แล้ว"; the app shows the link within ~3 s |
| 2 | U1 sends `123456` (never issued) | OA replies the wrong-code wording; still linked once |
| 26-lite | the owner adds the OA to the test group | the group appears under "กลุ่มของฉัน" |
| 7 | M tags U1 | U1 gets a 1-on-1 push from the OA (about line + 2 lines) and a phone notification |
| 8 | U1 writes; M quote-replies it | taken in for U1 |
| 10 | M writes U1's nickname untagged | taken in |
| **AC-8** | M uses **@All** ("แท็กทุกคน") | taken in for U1 (`type:"all"`), or not; **either way the result is recorded as the fact**, it is the open question |
| 17 | M writes "ใครกินข้าวยัง" | nothing stored, no push (DB snapshot before/after) |
| 22 | AI stub = hold; M tags U1 | no push |
- Pushes used: about 10, well inside a free OA's monthly quota.

**Closing (QA, written in TEST-004):** stop the tunnel and the server; check the ports are closed; the owner turns the webhook
OFF; the OA may stay in the test group (harmless with the webhook off) or he removes it. `LINE_LIVE` is never written to a file.

**Risks:** the only real people reached are U1 and M, by the OA, in a group made for this. The real secret and token stay in
`.env` (never printed; the guard keeps every other run closed). If the startup line is not `target=live`, nothing is sent and
we stop.

## Non-functional
- The webhook does the in-memory match and at most N small inserts before answering. Measured once in TASK-011
  (time for a 1-event body, local).
- No secret, body, text or non-user LINE id in logs.

## AC coverage (REQ-003)
| AC | Carried by | Note |
|---|---|---|
| AC-1 linking | TASK-010 (code logic) · TASK-011 (webhook + reply) · TASK-012 (link-code API) · ~~TASK-016~~ TASK-028 (app screen, DONE; live link proven locally) | live: B1 |
| AC-2 four cases | TASK-010 (pure rule, unit) · TASK-011 (end-to-end on fake LINE + local DB) | live + AC-8: B1, test group |
| AC-3 no row, no AI | TASK-010 (rule returns nothing) · TASK-011 (`rows.ts` before/after + `ai_calls` count) | |
| AC-4 push + app | TASK-013 (LINE notifier) · ~~Team A TASK-007 (FCM)~~ TASK-030 (the app's own watcher, SPEC-003 D-B14; no Firebase, D41) | live: B1 (LINE); the app part is local, no B3 |
| AC-5 one OA per group | ~~TASK-016~~ TASK-028 (help text on the groups screen, DONE) | LINE gives no event (`inferred`) |
| AC-6 bad signature | TASK-010 (verify fn) · TASK-011 (route: 401, `rows.ts` unchanged) | |
| AC-7 push count | TASK-013 (one `line_pushes` row per sent push) · Team A TASK-007/009 (API + page) | |
| AC-8 tag all | doc-verified (above) · TASK-010 handles `type:"all"` · test-group check with B1 | SA + QA |
| req 5 names | TASK-012 (API) · TASK-016 (screen) | |
| req 2 my groups | TASK-011 (events) · TASK-012 (API) · TASK-016 (screen) | |

## Tasks
- TASK-010: LINE core: signature, intake rule, names match, link codes, fake LINE API (pure, unit-tested) — owner: BE Bob (depends on: Team A TASK-001)
- TASK-011: LINE migration + webhook route + events + `ingestMessage` calls + the `rows.ts` / `send-event.ts` scripts — owner: BE Bob (depends on: TASK-010, Team A TASK-005)
- TASK-012: `/api/v1/channels/line/*` endpoints — owner: BE Bob (depends on: TASK-011, Team A TASK-002)
- TASK-013: LINE notifier + `line_pushes` — owner: BE Bob (depends on: TASK-011, Team A TASK-007)
- TASK-020: register the notifier with Team A's notify module + the live push check (split from TASK-013 at review) — owner: BE Bob (depends on: TASK-013, Team A TASK-007)
- TASK-022: fail closed — no LINE call when `LINE_CHANNEL_ACCESS_TOKEN` is empty (after the TASK-020 incident) — owner: BE Bob (depends on: TASK-020)
(The app screens, TASK-016, are in SPEC-003.)

## Decisions to list for the owner (the PM adds them to `decisions-for-owner-review.md`)
- **D-B1** "My groups": a group is listed after a membership check (when the OA joins, or when the user links) or when
  the user is seen there. LINE's member-list API is not used: it needs a verified/premium OA. Other choice: buy a
  verified OA.
- **D-B3** Link code: 6 digits, 10 min, single use. 5 wrong tries → that LINE account is ignored for 10 min.
- **D-B4** A LINE push is retried 3 times, then given up. The app notification is sent either way.
- **D-B5** Images, stickers and files in groups are never taken in during round 1. Only text can tag or name someone.
- **D-B6** Unlinking LINE deletes the link, the group list and the stored message ids. The names list is kept.

## Questions
(Engineers ask here; answer as `> answer: …`.)

- **Q-LIVE (for the PM → the owner; urgent, 2026-11-01 ~20:15, Silver).**
  - **What I found:** `corner-chat-back/.env` now holds the real LINE secret (32 chars) and token (171 chars) **and** `LINE_API_BASE=https://api.line.me`. I checked names, lengths and the base URL only; the base URL is not a secret.
  - **What that means:** fail-closed (TASK-022) no longer protects us. Every `bun run dev` from this `.env` — Jason's, Bob's, an FE recipe, QA's — talks to the **real** LINE OA. The webhook's linking reply would be real, and every passed message for a linked user would be a real push that counts toward the paid quota (AC-7). That breaks `DECISIONS.md` line 21 ("in dev, `LINE_API_BASE` points at the fake LINE API … a call to the real LINE … needs the owner's go each time").
  - **Tests are mostly safe:** `test/line-*.test.ts` point `LINE_API_BASE` at the fake. But `test/setup.ts` does not neutralise LINE for the other test files, so a Team A test that ingests for a LINE-linked user would reach the real API (`inferred`; not seen).
  - **My proposal (A), `[SA-proposed]`:**
    1. The owner keeps the real keys in `.env` but sets `LINE_API_BASE` to the fake (`http://127.0.0.1:<fake port>`) or leaves it out of the default `.env`. The real base is set **only on the command line** for the planned real-LINE test window (test OA only, tunnel only while testing, D16).
    2. Team A's `test/setup.ts` blanks `LINE_CHANNEL_ACCESS_TOKEN` for every test run (1 line, Sober's file).
  - **Until he answers:** nobody starts the back end from this `.env`, unless they set `LINE_API_BASE` to the fake on the command line.
  - **Other choice (B):** keep the real base, and every server start becomes a real LINE session needing his go each time. I do not recommend it.
  - (Not mine to touch: `.env` is the owner's, and I do not edit secrets.)
  > answer `[PM-decided 2026-11-01, D44]`: **neither A nor B: the owner is not asked to edit `.env` again.** He has just
  > asked not to be sent back for env work. Make it safe in code instead:
  > - The back end uses the real `api.line.me` **only when `LINE_LIVE=1` is set on the command line**, for a planned
  >   real-LINE window (test OA, tunnel only while testing, D16).
  > - Without it, the LINE client goes to the fake, or fails closed, whatever `LINE_API_BASE` says.
  > - Plus your point 2: `test/setup.ts` blanks the token for every test run.
  >
  > **The hold stands until both are in.** The SAs decide who writes which file.
  > SA-B (2026-11-01): the guard is in our file `line-api.ts` → **TASK-034** (Bob). `test/setup.ts` is Team A's → Sober, as the PM routed it.

## Security review (2026-11-01, Silver; remedy for F-011)
`/security-review` over `corner-chat-back` `src/modules/line/**` + `migrations/202611010100_line_init.sql` (untracked tree, after TASK-013):
**no HIGH/MEDIUM finding.** Checked: SQL (all Bun.sql tagged templates; the one `db.unsafe` is the `rows.ts` CLI on
`information_schema` names) · signature (raw body, empty secret fails closed, `timingSafeEqual`, parse after verify) ·
IDOR on `/channels/line/*` (`requireUser`, every query on the session id) · link-code takeover (live code needed, LINE id
↔ one user + UNIQUE, single-use transactional UPDATE, CSPRNG digits) · privacy (nobody concerned → nothing written or
logged) · SSRF (fixed/env host, encoded segments) · secrets in errors/logs. The SA re-read signature + store paths himself.
The subagent's other lines are labelled `UNVERIFIED — subagent`.
Low note, not a finding: Team A's `handleError` logs a whole unexpected error. A unique-violation race in linking could
log the linking person's own LINE id. Out of our files, so it is told to the PM for Team A.
