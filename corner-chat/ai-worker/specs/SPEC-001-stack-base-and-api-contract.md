# SPEC-001: Stack, back-end base, data model and the API contract (round 1)
- Source: REQ-001, REQ-002, REQ-004 (Team A builds) · contract and seams also for REQ-003, REQ-005 (Team B builds against §3, §4)
- Team: A (SA Sober)
- Status: ACTIVE — 2026-11-01

## 1. Overview

Round 1 is one Bun + Hono API (`corner-chat-back`) with a local Postgres, an admin web for the owner
(`corner-chat-front`) and an Android app (`corner-chat-app`). One back-end process does everything:
HTTP API, the LINE webhook, the mail poller, the filter pipeline, the outbox for mail replies and the notifier.
No queue service, no Redis, no Docker: **local only, no deploy** (SYSTEM-FACTS "How the owner wants the desk to work";
D16). Builds are still shaped the owner's way (`deploy-ready-build` skill), so a later deploy needs no rework.

**Decisions** `[SA-decided 2026-11-01]`, each listed for the owner's review by the PM:

| # | Decision | Why | The other choice |
|---|---|---|---|
| S1 | Back = **Bun + Hono** | Web-standard `Request/Response`, runs unchanged on Bun, mature middleware (validator, CORS), Atlas recommended it | Elysia: faster benchmarks, but ties types to Bun-only APIs; nothing here is CPU-bound |
| S2 | DB access = **`Bun.sql`** (built-in Postgres client) + **plain SQL migration files** run by our own ~40-line runner | Zero dependency; plain SQL files mean two teams add migrations without merge conflicts (no generated snapshot) | Drizzle/Prisma: generated snapshots conflict between two teams writing at once |
| S3 | Sessions = **opaque random token**, only its SHA-256 stored in `sessions` | "Disabled cannot sign in" and "reset password" must cut a session at once (REQ-001 AC-4/5); a DB lookup per request is cheap here | JWT: cannot be revoked without a deny-list |
| S4 | Passwords = `Bun.password` (argon2id) | built in | bcrypt package |
| S5 | Zimbra password = **AES-256-GCM** with `SECRET_KEY` from `.env` (WebCrypto) | REQ-002 req 7 / D14; reversible because IMAP needs the plain password | — |
| S6 | Mail: **`imapflow`** (IMAP), **`mailparser`** (MIME → text), **`nodemailer`** (SMTP) | the standard, maintained Node mail stack | hand-written IMAP: no |
| S7 | Admin web = **Next.js 16 + React 19 + Ant Design v6** (`nextjs-antd-pattern` skill), `output: "standalone"` | the owner's house pattern | — |
| S8 | ~~Android app = **Flutter** (stable channel) + `firebase_messaging`~~ **Overturned by the owner 2026-11-01** (*"ฉันไม่ชอบflutter ดิ เวลาเทสมันยากมั้ยวะ สมมุตจ ะทำสคริปเทส"*, DECISIONS D36): not Flutter; it must be easy to test with scripts. The app stack now belongs to **SPEC-003 (SA-B)**. The HTTP contract in §3 does not change, whatever the app is built in | — | (my miss: I weighed iOS reach and the push library, not how the owner and QA test — F-entry) |
| S9 | Background work = **in-process loops** (`setInterval`) with state in Postgres (`mail_accounts.last_uid`, `mail_outbox`) | one local process; state in DB survives a restart (REQ-002 AC-2 "no duplicate after restart") | a job-queue library |
| S10 | AI defaults: ~~layer 1 `deepseek` / `deepseek-v4-flash` · layer 2 `gemini` / `gemini-2.5-pro`~~ **changed 2026-11-01 (TASK-006 review):** layer 1 `deepseek` / `deepseek-flash` · layer 2 `deepseek` / `deepseek-v4-pro`, temperature 0. Why: the gateway's `GET /models` no longer lists `deepseek-v4-flash`, and `gemini-2.5-pro` answered with Google's free-tier daily quota exceeded. Probe on 3 made-up messages with the new pair: 100 / 0 / 95, all correct | a fast cheap model + a stronger one, as the owner described; **settings, replaced by the corpus run** (REQ-004 AC-6) | no provider ⇒ the gateway's fallback chain |

## 2. What I read (evidence base)

- `corner-chat-back` · `main` · HEAD `d1152f1` · read 2026-11-01 — README only. `corner-chat-front` · `main` · `0f8c0bc` —
  README only. `corner-chat-app` · `main` · `f5e060d` — README only. ⇒ greenfield, nothing to stay compatible with.
- This machine, 2026-11-01: `bun 1.3.14`, `node v22.23.2`, `psql 18.4`, `pg_isready` → `localhost:5432 - accepting
  connections`. **Not installed:** `flutter`, `dart`, `java`, `adb`, Android SDK (`%LOCALAPPDATA%\Android\Sdk` absent),
  `docker`. ⇒ Team B cannot build the app on this machine yet (§8 B9).
- `.claude/skills/llm-gateway/SKILL.md` §2–§5 — `POST /chat` body `{provider?, model?, temperature?, max_tokens?,
  messages[]}`; response `{success, data:{provider, model, content, usage?, latency_ms}}`; failure HTTP 500
  `{success:false, error}`; **no key needed today** ("เกตเวย์ไม่ต้องใช้คีย์ ณ ตอนนี้", owner 2026-10-28) ⇒ the board's
  B4 is not needed; keep an optional `LLM_GATEWAY_KEY`. Local gateway `http://localhost:3009`, prod `https://ai.develyst.online`.
- `.claude/skills/deploy-ready-build/SKILL.md` — front `output: standalone` + asset copy; back
  `bun build --compile --target=bun-linux-x64`; settings from env `PORT`, `HOST`.
- LINE docs (opened 2026-11-01, see understanding doc §Q2-SA): bot gets every group message; mentions carry `userId`;
  one OA per group. "Tag all" (mentionee `type: all`) — **doc-verified by Team B**, SPEC-002 §"What I read" (LINE
  Messaging API reference, 2026-11-01); REQ-003 AC-8 keeps its test-group check.
- REQ-001…005, `DECISIONS.md`, `../../project-docs/decisions-for-owner-review.md` D1–D17, B1–B6.

## 3. API contract — HTTP (BE ↔ FE, BE ↔ app). **Both sides implement this text.**

### 3.1 Rules for every endpoint
- Base path **`/api/v1`**. JSON, UTF-8. **Field names are camelCase, exactly as written here.** Times are ISO-8601 UTC
  strings (`"2026-11-01T03:04:05.000Z"`). Ids are UUID strings.
- Auth: header `Authorization: Bearer <token>`. Missing/unknown/expired token → **401** `UNAUTHENTICATED`.
  A token of a disabled user → **401** `ACCOUNT_DISABLED`.
- **Error body, always:** `{ "error": { "code": "<CODE>", "message": "<English, for developers>" } }`.
  Clients show the **Thai wording from the REQ, chosen by `code`** — never `message`.
- Validation failure → **400** `VALIDATION` with `"fields": { "<field>": "<why>" }` inside `error`.
- An id that does not exist **or belongs to another user** → **404** `NOT_FOUND` (same answer for both: REQ-001 AC-3).
- An `/admin/*` call by a non-owner → **403** `FORBIDDEN`.
- CORS: allow origin from env `ADMIN_WEB_ORIGIN` (default `http://localhost:3000`). The app is not a browser.
- `GET /api/v1/health` (no auth) → 200 `{ "ok": true, "db": true }`; DB unreachable → 503 `{ "ok": false, "db": false }`.

### 3.2 Auth (REQ-001) — Team A
| Method + path | Request | 200/201 response | Errors |
|---|---|---|---|
| `POST /auth/login` | `{ "email": string, "password": string }` | 200 `{ "token": string, "user": User }` | 401 `INVALID_CREDENTIALS` · 403 `ACCOUNT_DISABLED` · 429 `TOO_MANY_ATTEMPTS` + header `Retry-After: <seconds>` |
| `POST /auth/logout` | — | 204 | 401 |
| `GET /me` | — | 200 `{ "user": User }` | 401 |

`User = { "id", "name", "email", "role": "owner" | "user", "status": "active" | "disabled", "createdAt" }`.
Email is stored and compared **lower-cased and trimmed**.
Lockout (REQ-001 AC-6 as amended by the PM 2026-11-01): **5 wrong passwords in a row for one email (no time window) →
that email is refused for 5 min** (429 with `Retry-After`); a right password after the lock ends works and resets the
count to 0. Unknown emails are
counted too (no user enumeration). `[SA-decided]`
The admin web signs in with the same endpoint and **refuses a `role: "user"` itself** (shows REQ-001 wording and drops
the token); every `/admin/*` route also answers 403 — so AC-2 holds even if the web is bypassed.

### 3.3 Admin (REQ-001, REQ-003 req 8, REQ-004 req 6) — Team A, owner only
| Method + path | Request | Response | Errors |
|---|---|---|---|
| `GET /admin/users` | — | 200 `{ "users": User[] }` (newest first) | |
| `POST /admin/users` | `{ "name": string 1–100, "email": string, "password": string ≥ 8 }` | 201 `{ "user": User }` | 400 `VALIDATION` · 409 `EMAIL_TAKEN` |
| `POST /admin/users/:id/disable` | — | 200 `{ "user": User }` — also deletes all its sessions | 404 · 400 `CANNOT_DISABLE_OWNER` |
| `POST /admin/users/:id/enable` | — | 200 `{ "user": User }` | 404 |
| `POST /admin/users/:id/password` | `{ "password": string ≥ 8 }` | 204 — also deletes all its sessions | 404 · 400 |
| `GET /admin/stats/line-pushes?month=YYYY-MM` | `month` optional, default current month in Asia/Bangkok | 200 `{ "month": "2026-11", "count": number }` | 400 |
| `GET /admin/settings/ai` | — | 200 `AiSettings` | |
| `PUT /admin/settings/ai` | `AiSettings` | 200 `AiSettings` | 400 `VALIDATION` (provider not in the gateway's `GET /models`, or model not listed under it) |
| `GET /admin/ai-models` | — | 200 the gateway's `GET /models` body passed through | 502 `GATEWAY_UNAVAILABLE` |

`AiSettings = { "layer1": { "provider": string | null, "model": string | null }, "layer2": { "provider": string | null, "model": string | null } }`.
`null` provider = let the gateway's fallback chain choose. **Known behaviour (2026-11-01, TASK-009):** `PUT` validates
**both** layers, so if the gateway drops a model that is saved for one layer, saving fails (400, that layer's field named)
until that layer is re-picked. Intended: a saved model the gateway no longer serves must be visible, not kept silently. The owner account is created at start-up from `.env`
(`OWNER_EMAIL`, `OWNER_PASSWORD`, `OWNER_NAME`) if no owner exists; it is never created through the API. `[SA-decided]`

### 3.4 Messages and decisions (REQ-004, REQ-005 screens) — Team A
| Method + path | Request | Response | Errors |
|---|---|---|---|
| `GET /messages?tab=notified\|held&channel=mail\|line&before=<cursor>&limit=<1–100, default 30>` | `tab` required; `channel` optional | 200 `{ "items": MessageSummary[], "nextCursor": string \| null }` newest first | 400 |
| `GET /messages/:id` | — | 200 `{ "message": MessageDetail }` | 404 |
| `POST /messages/:id/correction` | `{ "outcome": "notified" \| "held" }` | 200 `{ "message": MessageDetail }` | 404 · 400 |
| `POST /messages/:id/replies` | `{ "body": string 1–20000 }` | 202 `{ "reply": Reply }` | 404 · 400 `NOT_MAIL` (LINE is receive-only) · 409 `MAIL_NOT_CONNECTED` |
| `POST /replies/:id/retry` | — | 202 `{ "reply": Reply }` | 404 · 409 `NOT_FAILED` |

```
MessageSummary = {
  "id", "channel": "mail" | "line",
  "sender": { "name": string, "key": string },          // mail: lower-case address · line: LINE userId
  "groupName": string | null,                            // line only
  "subject": string | null,                              // mail only
  "preview": string,                                     // first 2 non-empty lines of the text, ≤ 200 chars
  "aboutLine": string | null,                            // REQ-004 req 4. AI decision: "[ch · group|sender] <summary>" ·
                                                         // rule decision (DECISIONS 2026-11-01): "[ch · group|sender] ตรงกฎของคุณ: <kind label> <value>" ·
                                                         // null only for ai_unavailable (consumers then show "AI ไม่ได้ตรวจ")
  "outcome": "notified" | "held",                        // after any user correction — decides the tab
  "decidedBy": "rule" | "ai" | "ai_unavailable" | "user",
  "score": number | null,                                // 0–100 whole number
  "recipientKind": "to" | "cc" | "list" | "mention" | "mention_all" | "reply_to_me" | "name_match",
  "hasAttachments": boolean, "attachmentNames": string[],
  "receivedAt", "notifiedAt": string | null
}
MessageDetail = MessageSummary + {
  "text": string,                                        // full plain text
  "mail": { "to": string[], "cc": string[], "messageIdHeader": string } | null,
  "decision": {
    "decidedBy": "rule" | "ai" | "ai_unavailable",       // the system's own decision (before correction)
    "outcome": "notified" | "held",
    "rule": { "id", "kind", "value", "action" } | null,
    "summary": string | null, "score": number | null, "bar": number, "reason": string,
    "layer1": { "provider": string, "model": string } | null,
    "layer2": { "provider": string, "model": string } | null,
    "promptVersion": string | null, "decidedAt"
  },
  "correction": { "outcome": "notified" | "held", "at" } | null,
  "replies": Reply[]                                     // oldest first; [] for line
}
Reply = { "id", "body", "status": "queued" | "sending" | "sent" | "failed", "error": string | null, "createdAt", "sentAt": string | null }
```
A message the filter has **not decided yet** (`outcome` null, seconds after intake) is in neither tab, and `GET /messages/:id` /
`POST …/correction` answer 404 for it `[SA-decided 2026-11-01, TASK-005 review]`.
`reason` for a rule decision is `"กฎของคุณ: <kind label> <value>"` built from REQ-004 wording; for `ai_unavailable` it is
`"AI ไม่ได้ตรวจ"`. Cursor = opaque string (base64 of `receivedAt|id`).

### 3.5 Conditions (REQ-004) — Team A
| Method + path | Request | Response | Errors |
|---|---|---|---|
| `GET /conditions` | — | 200 `Conditions` | |
| `PUT /conditions/settings` | `{ "bar": 0–100 int, "sentences": string ≤ 2000 }` | 200 `Conditions` | 400 |
| `POST /conditions/rules` | `{ "kind": "sender" \| "keyword" \| "group", "value": string 1–200, "action": "always" \| "never" }` | 201 `{ "rule": Rule }` | 400 · 409 `RULE_EXISTS` (same kind+value) |
| `DELETE /conditions/rules/:id` | — | 204 | 404 |

`Conditions = { "bar": number, "sentences": string, "rules": Rule[] }` · `Rule = { "id", "kind", "value", "action", "createdAt" }`.
Rule `value`: `sender` = the message's `sender.key` (lower-case email, or LINE userId — the app offers "from this
sender" on a message detail); `keyword` = substring, case-insensitive, matched on subject + text; `group` = LINE
group id (picked from §3.7 groups). **If an `always` and a `never` rule both match, `always` wins** `[SA-decided:
same direction as fail-open D3; listed]`. New user: `bar` 70, `sentences` "".

### 3.6 Channels — mail (REQ-002) — Team A
| Method + path | Request | Response | Errors |
|---|---|---|---|
| `GET /channels` | — | 200 `{ "mail": MailChannel, "line": LineChannel }` | |
| `PUT /channels/mail` | `{ "email": string, "password": string }` | 200 `{ "mail": MailChannel }` after a real IMAP **and** SMTP login succeeds | 422 `MAIL_LOGIN_FAILED` (nothing stored) · 502 `MAIL_SERVER_UNREACHABLE` |
| `DELETE /channels/mail` | — | 204 (password deleted; messages kept) | |

`MailChannel = { "connected": boolean, "email": string | null, "lastSyncAt": string | null, "lastError": string | null }`.
The password is **never** returned. Host/ports from env (`ZIMBRA_IMAP_HOST`, `ZIMBRA_IMAP_PORT`=993,
`ZIMBRA_SMTP_HOST`, `ZIMBRA_SMTP_PORT`=465/587), default host `mail.entronica.in.th`.

### 3.7 Channels — LINE (REQ-003) — **Team B builds these; the shapes are fixed here**
| Method + path | Request | Response | Errors |
|---|---|---|---|
| `POST /channels/line/link-code` | — | 201 `{ "code": "6 digits", "expiresAt" }` (10 min, one use; a new code voids the old) | |
| `DELETE /channels/line` | — | 204 unlink | |
| `GET /channels/line/groups` | — | 200 `{ "groups": [{ "id", "name", "lastSeenAt" }] }` | |
| `GET /channels/line/names` · `PUT /channels/line/names` | PUT `{ "names": string[] (≤ 20, each 1–50) }` | 200 `{ "names": string[] }` | 400 |
| `POST /webhooks/line` (no bearer; LINE signature header `x-line-signature`) | LINE's body | 200 | 401 `BAD_SIGNATURE` |

`LineChannel = { "linked": boolean, "displayName": string | null }` — **built by Team A in `GET /channels`** from the
`line_links` table (§5) so the app gets one call.

### 3.8 Devices (REQ-005 push) — Team A
> **Not used by the app since 2026-11-01 (D41, no Firebase).** The app polls `GET /messages` every 30 s and shows the notification
> itself (SPEC-003 D-B14). It never calls `/devices`. `[SA-decided 2026-11-01]`
> - **Kept as is:** the endpoints and the FCM sender (TASK-007, DONE). They are off by construction: with `FCM_SERVICE_ACCOUNT_JSON`
>   empty, `notify.ts:61` skips FCM and nothing is sent. The `devices` table stays empty.
> - **Why kept:** removing them is a new TASK on tested code, and it changes nothing a user sees. Keeping them means a return to
>   Firebase costs nothing.
> - The LINE OA push is unaffected.
| Method + path | Request | Response |
|---|---|---|
| `PUT /devices` | `{ "fcmToken": string, "platform": "android" }` | 204 (upsert; the token moves to this user if another had it) |
| `DELETE /devices/:fcmToken` | — | 204 (the app calls it on sign-out, before `/auth/logout`) |

**Push payload (FCM HTTP v1), Team A sends, the app receives:** notification `title` = `aboutLine` (or
`"AI ไม่ได้ตรวจ"` + sender name when no AI ran), `body` = `preview`; `data` = `{ "type": "message", "messageId": "<uuid>" }`.
Tap → the app opens `MessageDetail` for `messageId`.

## 4. Seams inside `corner-chat-back` (Team A base ↔ Team B LINE module)

- **Folder claim:** Team B writes only `src/modules/line/**` and migration files named `migrations/*_line_*.sql`.
  Everything else in the back repo is Team A's (board → Batch claims). Team A creates the empty
  `src/modules/line/index.ts` exporting `registerLine(app, deps)` so the app wiring exists before Team B starts.
- **Team A provides** (in `src/core/`, stable signatures — changing one is an SA↔SA matter through the PM):
  - `ingestMessage(input: IngestInput): Promise<{ messageId: string, duplicate: boolean }>` — stores first, then
    queues the filter (REQ-001 req 6). Idempotent on `(userId, channel, externalId)`. A disabled or unknown user →
    throws an `Error` whose `name === "IngestRefused"` (Team B maps it; anything else is a real error).
    `IngestInput = { userId, channel: "line", externalId, sender: { key, name }, groupId, groupName, text,
    recipientKind, hasAttachments, attachmentNames, receivedAt }`.
  - `registerNotifier("line", (n: Notification) => Promise<void>)` — the notify module calls every registered notifier
    plus FCM for each message the **filter** decides `notified`. A user's later correction to `notified` does
    **not** send a notification `[SA-decided]`. `Notification = { userId, messageId, aboutLine, preview, senderName }`.
  - `db` (the `Bun.sql` instance), `config`, `requireUser` (auth middleware giving `c.get("user")`), `apiError(code, status)`.
  - Team A also **reads** Team B's `line_names (user_id, name, position)` for AI layer 1 (the user's names list) — read
    only; Team B keeps those three columns `[SA-decided 2026-11-01, TASK-006 Q1]`.
- **Team B writes** into `line_links`, `line_link_codes`, `line_groups`, `line_user_groups`, `line_own_messages`,
  `line_pushes` (§5). Team A only **reads** `line_links` (for `GET /channels`) and `line_pushes` (for the admin count).

## 5. Data model — the first migration (Team A, `migrations/202611010001_core_init.sql`)

Run **only against the local database** by the engineer (`bun run migrate`). Nothing real exists, so no existing rows.

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;              -- gen_random_uuid()

CREATE TABLE schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,                         -- lower-cased by the app
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('owner','user')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE sessions (
  token_hash text PRIMARY KEY,                        -- hex SHA-256 of the bearer token
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE login_attempts (
  email text PRIMARY KEY, failed_count int NOT NULL DEFAULT 0,
  first_failed_at timestamptz, locked_until timestamptz
);

CREATE TABLE user_conditions (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bar int NOT NULL DEFAULT 70 CHECK (bar BETWEEN 0 AND 100),
  sentences text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('sender','keyword','group')),
  value text NOT NULL,
  action text NOT NULL CHECK (action IN ('always','never')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, kind, value)
);

CREATE TABLE mail_accounts (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  email text NOT NULL,
  password_enc text NOT NULL,                         -- base64(iv | ciphertext | tag), AES-256-GCM
  uid_validity bigint, last_uid bigint NOT NULL DEFAULT 0,
  last_sync_at timestamptz, last_error text,
  connected_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('mail','line')),
  external_id text NOT NULL,                          -- mail: Message-ID header (or uidvalidity:uid if none) · line: LINE message id
  sender_key text NOT NULL, sender_name text NOT NULL,
  group_id text, group_name text,
  subject text, text text NOT NULL,
  mail_to text[], mail_cc text[], mail_message_id text, mail_references text,
  recipient_kind text NOT NULL CHECK (recipient_kind IN ('to','cc','list','mention','mention_all','reply_to_me','name_match')),
  has_attachments boolean NOT NULL DEFAULT false, attachment_names text[] NOT NULL DEFAULT '{}',
  received_at timestamptz NOT NULL,
  stored_at timestamptz NOT NULL DEFAULT now(),
  filter_state text NOT NULL DEFAULT 'pending' CHECK (filter_state IN ('pending','done')),
  outcome text CHECK (outcome IN ('notified','held')),            -- after correction
  notified_at timestamptz,
  UNIQUE (user_id, channel, external_id)
);
CREATE INDEX messages_list ON messages (user_id, outcome, received_at DESC, id DESC);

CREATE TABLE decisions (
  message_id uuid PRIMARY KEY REFERENCES messages(id) ON DELETE CASCADE,
  decided_by text NOT NULL CHECK (decided_by IN ('rule','ai','ai_unavailable')),
  outcome text NOT NULL CHECK (outcome IN ('notified','held')),
  rule_id uuid REFERENCES rules(id) ON DELETE SET NULL, rule_snapshot jsonb,
  addressed text, meaning text, summary text,                       -- layer 1
  score int CHECK (score BETWEEN 0 AND 100), reason text NOT NULL,  -- layer 2
  bar int NOT NULL,
  layer1_provider text, layer1_model text, layer2_provider text, layer2_model text,
  prompt_version text, error text,
  decided_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE corrections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  outcome text NOT NULL CHECK (outcome IN ('notified','held')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE ai_calls (                                -- every gateway call, for REQ-004 AC-1/2 "no AI call" checks
  id bigserial PRIMARY KEY, message_id uuid REFERENCES messages(id) ON DELETE SET NULL,
  layer int NOT NULL, provider text, model text, ok boolean NOT NULL, latency_ms int, error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE mail_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sending','sent','failed')),
  attempts int NOT NULL DEFAULT 0, error text, smtp_message_id text,
  sent_copy_saved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(), sent_at timestamptz
);

CREATE TABLE devices (
  fcm_token text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('android')),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE notifications_log (
  id bigserial PRIMARY KEY, message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  target text NOT NULL,                                -- 'fcm' | 'line'
  ok boolean NOT NULL, error text, created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE app_settings (key text PRIMARY KEY, value jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
INSERT INTO app_settings (key, value) VALUES
 ('ai', '{"layer1":{"provider":"deepseek","model":"deepseek-v4-flash"},"layer2":{"provider":"gemini","model":"gemini-2.5-pro"}}');
```
**Second core migration** `migrations/202611010002_core_ai_defaults.sql` (Team A, TASK-006 rework): moves the seeded `ai`
setting to the S10 defaults, **only if it still holds the old seed** (an owner's own choice is never overwritten):
```sql
UPDATE app_settings
   SET value = '{"layer1":{"provider":"deepseek","model":"deepseek-flash"},"layer2":{"provider":"deepseek","model":"deepseek-v4-pro"}}',
       updated_at = now()
 WHERE key = 'ai'
   AND value = '{"layer1":{"provider":"deepseek","model":"deepseek-v4-flash"},"layer2":{"provider":"gemini","model":"gemini-2.5-pro"}}'::jsonb;
```
**LINE tables** (`line_links`, `line_link_codes`, `line_groups`, `line_user_groups`, `line_own_messages`, `line_pushes`)
are **Team B's** migration `migrations/<ts>_line_init.sql`, with at least: `line_links(user_id uuid PK → users,
line_user_id text UNIQUE NOT NULL, display_name text, linked_at timestamptz)` and `line_pushes(id bigserial,
user_id uuid, message_id uuid, pushed_at timestamptz NOT NULL DEFAULT now())` — Team A's code reads exactly these
columns. `line_own_messages` keeps **ids only, no text** ("ได้ เก็บเลข").

## 6. Flow

**Intake (mail, Team A).** Every 60 s, for each `mail_accounts` row of an **active** user: IMAP login → `INBOX` →
if `UIDVALIDITY` changed, reset `last_uid` to the current highest (no backfill) → fetch UIDs > `last_uid` → for each:
parse with `mailparser` (text, or HTML → text when no text part), classify `recipient_kind` in this order: user's address
in To → `to`; in Cc → `cc`; a `List-Id` header, or `Precedence: list|bulk` → `list`; otherwise (the user was in **Bcc**)
→ `to` (REQ-002 amendment 2026-11-01: Bcc counts as "to me"), insert into `messages` with
`ON CONFLICT DO NOTHING` (dedupe by Message-ID), then advance `last_uid`. Errors → `last_error`, retried next tick.
**First connect takes in nothing older than the connect time** `[SA-decided: no backfill flood; listed]`.

**Filter (Team A), for each `filter_state='pending'` message, in received order, at most 4 at a time:**
1. Rules (no AI): match `sender` / `keyword` / `group`. Any match → decision `rule`; `always` beats `never`. Done.
2. Layer 1 → gateway, model from `app_settings.ai.layer1`, temperature 0, ~~`max_tokens` 300~~ **`max_tokens` 4096** (DEF-1,
   see the note under step 5), JSON-only prompt
   (`src/filter/prompts/v1.ts`, `promptVersion` `"v1"`) returning
   `{ "addressed": "yes"|"no"|"unclear", "meaning": "request"|"question"|"info"|"ad"|"spam"|"chatter"|"other", "summary": "<Thai, ≤ 60 chars>" }`.
3. Layer 2 → **always**, even if `meaning` is `spam` — model from `layer2`, temperature 0, ~~`max_tokens` 300~~ **4096**, input =
   raw text + layer-1 JSON + the user's `sentences` + `recipient_kind`, returning `{ "score": 0–100, "reason": "<Thai, ≤ 200 chars>" }`.
4. `score >= bar` → `notified`, else `held`. `aboutLine` = `"[" + channelLabel + " · " + (groupName ?? senderName) + "] " + summary`,
   cut to 80 characters (REQ-004 AC-10), `channelLabel` = `อีเมล` | `LINE`. **Amended 2026-11-01 (PM wording, TEST-003):**
   for mail, `senderName` = the display name, or the part before `@` when there is none · a line over 80 characters is cut at
   the last **word boundary** (`Intl.Segmenter("th", { granularity: "word" })`) that leaves room for `…`, never mid-word.
5. Gateway 500 / unparsable JSON / a `score` that is not a JSON integer 0–100 (never clamped) → **one retry** of that layer.
   **Timeout (20 s) or gateway unreachable → no retry** `[SA-decided 2026-11-01, TASK-006 Q2: a dead gateway must not delay
   the fail-open notification past REQ-005's 1 minute]`. Then, then decision `ai_unavailable`, outcome
   `notified`, reason `AI ไม่ได้ตรวจ` (D3). Every call logged in `ai_calls`.
   **DEF-1 (TEST-003, 2026-11-01) — cause found by an SA probe on the real gateway:** the deepseek models spend hidden
   *reasoning* tokens out of `max_tokens` before they write the JSON. At 300, H07 failed in **10 of 16** calls, and every failure
   had `completion_tokens` = exactly 300 (7 empty, 3 cut-off JSON). At 1500: 0 of 16, but one call used 1268 tokens. Hence
   **4096**, a per-call **timeout of 40 s** (was 20 s, because the longer answers take longer), and `ai_calls.completion_tokens`
   logged (migration `202611010003_core_ai_calls_tokens.sql`: `ALTER TABLE ai_calls ADD COLUMN completion_tokens int;`,
   null when the gateway gives no `usage`). Worst case with a hanging gateway: the fail-open notification comes after up to
   2 × 40 s, inside REQ-005's 1 minute only for the typical case. Accepted for round 1; the timeouts are a setting.
6. Write `decisions`, set `messages.outcome`, `filter_state='done'` in one transaction; then notify if `notified`.
A disabled user's messages: not taken in at all (mail poller skips them; `ingestMessage` refuses — REQ-001 req 4).

**Notify (Team A).** For `notified`: FCM to every `devices` row of the user + each registered notifier (`line`, Team B).
Each attempt → `notifications_log`. A failed push does not change the outcome. Without Firebase credentials
(`FCM_SERVICE_ACCOUNT_JSON` unset) FCM is skipped and logged `ok=false, error='fcm not configured'`.

**Reply (Team A).** `POST /messages/:id/replies` → `mail_outbox` `queued` → the outbox loop (every 10 s) sends via SMTP
from the user's address with `In-Reply-To: <mail_message_id>`, `References: <mail_references> <mail_message_id>`,
subject `Re: ` + original (not doubled), plain text body; then IMAP `APPEND` to the user's Sent folder (special-use
`\Sent`, fallback name `Sent`). Network/SMTP error → `failed` + `error`; retry only on the user's `POST /replies/:id/retry`.
A sent row is never sent twice: status moves `queued → sending` with `UPDATE … WHERE status='queued' RETURNING`.

## 7. Non-functional
- Every user-data query filters by `user_id` from the session — never from the request body (REQ-001 AC-3).
- Never log: passwords, tokens, the decrypted mail password, message bodies at info level. The mail password exists
  decrypted only in memory during an IMAP/SMTP session.
- `.env` git-ignored; `.env.example` committed with every key and no values (§9).
- Performance: none required beyond REQ-002 "within 2 minutes" and REQ-005 "notification within 1 minute".
- **`/security-review` by the SA before REQ-002 is `SPEC_DONE`** (auth, secrets, stored passwords) — D14.
  **Widened 2026-11-01 (F-010):** one `/security-review` of the whole back end (auth, sessions, lockout, admin, FCM key, mail
  password encryption, the LINE webhook seam) is a **gate before any of REQ-001 / REQ-002 / REQ-004 goes `SPEC_DONE`**. It
  covers TASK-002 and TASK-007, which were set DONE without it. Findings become TASKs.
  **Run 2026-11-01 (round 1, before REQ-001/REQ-004 SPEC_DONE): no finding at the bar** (>80 % exploitable).
  - **Scope:** `corner-chat-back` `src/**`, `migrations/**`, `scripts/**`; read-only, by a review subagent.
  - **Checked by the subagent:** per-user filtering on every `:id` route; `requireOwner` on `/admin/*`; created users are
    `role 'user'` only; tagged SQL everywhere; token and link-code randomness; GCM IV per encryption; the LINE HMAC over
    the raw body with `timingSafeEqual`; no password, token or key in responses or logs; SSRF only through config values.
  - **Spot-checked by me:** `line/webhook.ts:207–217` (raw text, then `JSON.parse`) · `line/signature.ts:12`
    (`timingSafeEqual`) · `core/crypto.ts:22` (`getRandomValues` IV) · `admin/index.ts:12` (`admin.use("*", requireOwner)`) ·
    the only two `.unsafe(` calls carry no request data.
  - **Under the bar, noted:** LINE link codes are 6 digits, with an in-memory per-LINE-id guess limit (rate-limit class). A
    known FCM token can be moved to another user by `PUT /devices` (it needs the victim's secret token).
  - **REQ-002** (TASK-003/004: mail password at use, SMTP) gets its own review run before its `SPEC_DONE`.
    **Run 2026-11-01: no finding at the bar.** Scope: `src/modules/mail/**`, `core/crypto.ts`, `channels/index.ts`, the replies
    part of `messages/index.ts`. Checked by the subagent: every query is scoped to the caller · the recipient is always the
    stored `From` · headers are built by nodemailer's MailComposer, with CR/LF stripped from `In-Reply-To`/`References` · the
    password is scrubbed from `last_error`/`error` and never returned · tagged SQL only · only the plain-text part is stored
    (no HTML returned) · host and port come from config only. Spot-checked by me: `mail/connection.ts:15–23` (TLS required for
    any non-local host, implicit on 993/465, plain only on 127.0.0.1/localhost/::1) · no `rejectUnauthorized` anywhere in `src`
    · `mail/parse.ts:68` stores `mail.text` only. **Not covered:** real Zimbra TLS/certificates (B2).

## 7a. Testability — local only (REQ-001 § Questions, PM 2026-11-01, from QA Tanya / Tefany)
| QA needs | How | TASK |
|---|---|---|
| Pause between intake and the filter | `.env` `FILTER_PAUSED=true` → the filter loop does not start; messages stay `filter_state='pending'` (stored, undecided). Restart with `false` to resume. Refused at start-up unless `HOST` is `127.0.0.1`/`localhost` | TASK-005 |
| IMAP/SMTP host + port, gateway URL as settings | already `.env` (§9): `ZIMBRA_*`, `LLM_GATEWAY_URL` | TASK-001/003/006 |
| AI stub per layer: fixed %, broken answer, none (500 / never answers) | **a fake gateway in the harness**, not a switch in product code: `tests/harness/fake-gateway/` scripted per layer; point `LLM_GATEWAY_URL` at it | TASK-006 step 6 |
| AI-call log | table `ai_calls` (§5): one row per gateway call, with layer, model, ok, latency | TASK-006 |
| Row listing (privacy before/after) | Team B's `bun run line:rows` lists every public table's count (SPEC-002) | Team B |
| Decision time | `messages.stored_at` and `decisions.decided_at` (§5); `notifications_log.created_at` for the push | TASK-005/007 |

## 8. Risks, assumptions, unknowns
- RISK: `imapflow`/`nodemailer` under Bun — both target Node; Bun's Node compatibility is good but sockets/TLS are where
  gaps show · medium/high · **TASK-003 starts with a 15-minute spike** against the local test (§B2) before building on it.
- RISK: Zimbra may also save a copy of SMTP-submitted mail to Sent ⇒ two copies · low/low · TASK-004 checks the Sent
  folder after one send; if Zimbra saves it, drop the APPEND (switch `MAIL_APPEND_SENT=false`).
- RISK: LLM % wobbles between runs · covered by temperature 0 and REQ-004 AC-6's 3-run method (QA).
- RISK: two teams in one back repo · designed out by §4 (folder + migration-name claim, stable core signatures).
  **Missed until 2026-11-01:** both teams' `bun test` runs shared one test database, and each run drops its schema. Concurrent
  runs blocked or wiped each other (seen at the TASK-005 review). Designed out by **TASK-019**: one database per test run.
- ASSUMED (internal): one back-end process is enough for round 1 (a handful of users the owner adds).
- UNKNOWN → **owner inputs, through the PM** (each a block only when its TASK reaches it):
  - ~~**B8 (new): local Postgres** — a connection string for the server on `localhost:5432`.~~ **Replaced 2026-11-01
    (PM, §Questions):** the team runs **its own cluster**, never touching :5432 — see §8a.
  - **B9 (new, Team B's): Flutter SDK + Android SDK + JDK** are not installed on this machine (§2); building the app
    needs them installed (or the owner's go for the FE to install them).
  - B2 test mailboxes — TASK-003/004 live checks. B3 Firebase service account — TASK-007 live push. B1 test OA — Team B.
  - **B4 is not needed today:** the gateway takes no key (llm-gateway skill §5).

## 8a. The team's own local Postgres cluster `[SA-decided 2026-11-01, on the PM's direction in §Questions]`
> **SUPERSEDED 2026-11-01 evening by the owner (D43; `SYSTEM-FACTS.md` "env keys and the database"). Carried by TASK-033.**
> - No local Postgres, ever: the only server is the owner's (`<host>:5432`; the address is in `SYSTEM-FACTS`, the URL only in `.env`).
> - The app uses the database `corner_chat`. Tests use `corner_chat_test` as the base, and each run gets its own
>   `corner_chat_test_r<pid>_<6 hex>`, dropped after the run.
> - Nothing else on that server is touched, and `config.ts` / `test/setup.ts` refuse any other name.
> - TLS is required; if the server refuses it, the owner decides.
>
> The text below is history.
- PostgreSQL 18 binaries already on PATH (`initdb`, `pg_ctl`, `psql` — `/c/Program Files/PostgreSQL/18/bin/`, PM checked).
- **Data folder `corner-chat-back/.local/pgdata/`, log `.local/pg.log`** — inside the repo, git-ignored (`.local/`).
- **Port 5433, listen `127.0.0.1` only.** I checked 2026-11-01: `pg_isready -h 127.0.0.1 -p 5433` → `no response` (free).
  Override with `PG_LOCAL_PORT` if it is ever taken.
- Superuser `corner_chat`, password from `.env` `PG_LOCAL_PASSWORD` (the engineer generates it locally; never written
  anywhere else), auth `scram-sha-256`, encoding UTF8, `--locale=C`.
- Databases `corner_chat_dev` and `corner_chat_test`.
- `DATABASE_URL=postgres://corner_chat:<pw>@127.0.0.1:5433/corner_chat_dev`, `DATABASE_URL_TEST=…/corner_chat_test`.
- Script `bun run db:local <init|start|stop|status>` (`scripts/db-local.ts`). `init` refuses if the data folder already
  exists; `start`/`stop` use `pg_ctl -D .local/pgdata -o "-p <port> -h 127.0.0.1"`. **No command anywhere targets port
  5432**; the script refuses `PG_LOCAL_PORT=5432`.

## 9. `.env.example` (back) — every key, no values
> **Amended 2026-11-01 (D43, TASK-033):** `PG_LOCAL_*` are gone. `DATABASE_URL_TEST` is optional (derived), and `TEST_MAIL_A_EMAIL`,
> `TEST_MAIL_A_PASSWORD` and `TEST_MAIL_B_EMAIL` are added. `.env.example` carries a one-line comment on every key.
>
> **Keys the OWNER fills** (the PM asks him, one pack, before anyone needs them):
> - `DATABASE_URL` (his Postgres, database `corner_chat`);
> - `SECRET_KEY`;
> - `OWNER_EMAIL` / `OWNER_PASSWORD`;
> - `TEST_MAIL_A_EMAIL` / `TEST_MAIL_A_PASSWORD` / `TEST_MAIL_B_EMAIL` (B2);
> - `LINE_CHANNEL_SECRET` / `LINE_CHANNEL_ACCESS_TOKEN` (Team B);
> - `FCM_SERVICE_ACCOUNT_JSON` — not needed now: D41, no Firebase.
>
> Every other key has a working default.
`PORT=8080` `HOST=127.0.0.1` `PG_LOCAL_PORT=5433` `PG_LOCAL_PASSWORD=` `DATABASE_URL=` `DATABASE_URL_TEST=` `SECRET_KEY=` (32 bytes, base64) `OWNER_EMAIL=`
`OWNER_PASSWORD=` `OWNER_NAME=` `ADMIN_WEB_ORIGIN=http://localhost:3000` `ZIMBRA_IMAP_HOST=mail.entronica.in.th`
`ZIMBRA_IMAP_PORT=993` `ZIMBRA_SMTP_HOST=mail.entronica.in.th` `ZIMBRA_SMTP_PORT=465` `MAIL_POLL_SECONDS=60`
`MAIL_APPEND_SENT=true` `FILTER_PAUSED=false` `LLM_GATEWAY_URL=http://localhost:3009` `LLM_GATEWAY_KEY=` `FCM_SERVICE_ACCOUNT_JSON=`
`LINE_CHANNEL_SECRET=` `LINE_CHANNEL_ACCESS_TOKEN=` `LINE_API_BASE=https://api.line.me` (the last three are Team B's,
read by their code — SPEC-002 § Config; Team A writes them into `.env.example` because the file is Team A's).

## 10. AC coverage (Team A's REQs)
| REQ · AC | Carried by | Note |
|---|---|---|
| REQ-001 AC-1 | TASK-002 (API) · TASK-008 (admin web) | app sign-in screen = Team B (REQ-005) |
| REQ-001 AC-2 | TASK-002 (403) · TASK-008 (web refuses) | |
| REQ-001 AC-3 | TASK-002 (`requireUser`, 404 rule) · TASK-005 (every query) | isolation test in TASK-005 DoD |
| REQ-001 AC-4 | TASK-002 (sessions cut, login refused) · TASK-003 (poller skips) · TASK-007 (no notify) | |
| REQ-001 AC-5 · AC-6 | TASK-002 | lockout rule §3.2 |
| REQ-002 AC-1…4, AC-7, AC-8 | TASK-003 | |
| REQ-002 AC-5, AC-6 | TASK-004 | |
| REQ-004 AC-1…5 | TASK-005 (rules, bar, API) · TASK-006 (AI layers, fail open) | AC-3 stubbed |
| REQ-004 AC-6 | TASK-006 builds the corpus **runner**; corpus content + labels = the team via PM/QA (D6) | not a BE judgement |
| REQ-004 AC-7, AC-8 | TASK-005 | app screens = Team B |
| REQ-004 AC-9 | TASK-006 (settings API) · TASK-009 (admin web page) | |
| REQ-004 AC-10 | TASK-006 | eye check = QA + PM |
| REQ-003 req 8 (admin push count) | TASK-007 (endpoint) · TASK-009 (page) | Team A's front claim; Team B writes `line_pushes` |

## 11. Tasks (Team A)
- TASK-001: back-end base — owner: BE Jason (depends on: — ; own local cluster §8a)
- TASK-002: accounts, sessions, lockout, admin users API — owner: BE Jason (depends on: TASK-001)
- TASK-003: Zimbra connect + mail intake — owner: BE Jason (depends on: TASK-002)
- TASK-004: mail reply outbox — owner: BE Jason (depends on: TASK-003)
- TASK-005: conditions, rules, messages API, corrections — owner: BE Jason (depends on: TASK-002)
- TASK-006: AI layers via the gateway, settings, fail open, corpus runner — owner: BE Jason (depends on: TASK-005)
- TASK-007: notify (FCM + notifier registry), devices API, admin LINE push count — owner: BE Jason (depends on: TASK-006)
- TASK-008: admin web — scaffold, owner sign-in, users page — owner: FE Fern (depends on: — ; integrates with TASK-002)
- TASK-009: admin web — AI settings page + LINE push count — owner: FE Fern (depends on: TASK-008; API from TASK-006/007; wording: REQ-004 Questions)

## Questions
(Engineers ask here; answer as `> answer: …`.)
- **PM on §8 owner inputs (2026-11-01)** `[PM-decided under the owner's standing instruction — listed D27, D28]`:
  - **B8 is not asked.** `initdb`/`pg_ctl` (PostgreSQL 18) are on this machine's PATH (`I checked: which initdb pg_ctl`
    → `/c/Program Files/PostgreSQL/18/bin/`). PM's preference: the team runs **its own local cluster** — a data folder
    that git ignores, its own role and password from `.env`, a port other than 5432 — and never touches the existing
    server on 5432. How exactly is your call.
  - **B9: the FE may install** Flutter (stable), the Android SDK command-line tools and a JDK **user-level, from the
    official sources only** (flutter.dev / developer.android.com / a vendor JDK), with no admin rights and no system-wide
    change. The paths go in `machine.local.md`.
  - B4 dropped (gateway has no key) — noted.
  > answer (SA Sober, 2026-11-01): carried — own cluster on 127.0.0.1:5433 in `.local/pgdata`, §8a; TASK-001 amended
  > (step 0, closed list, DoD). B9 is Team B's (SA-B).
