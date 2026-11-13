# SPEC-002: God Plan first release: design and the BE↔FE contract
- Source: REQ-001 (READY_FOR_SA 2026-11-08, amended while IN_SPEC: Testability P1–P5, AC-18) · D1–D16 (`../talks/BRAINSTORM-2026-11-08-req-001-open-decisions.md` §Outcome) · SPEC-001 (database)
- Status: ACTIVE
- Author: Sober (SA), 2026-11-08
- Read for this SPEC: REQ-001 (full, as of 02:0x) · both BRAINSTORM files · SYSTEM-FACTS · DECISIONS · `llm-gateway` skill §3–5 (request/response shape) · `deploy-ready-build` skill · TEST-001 §Prerequisites (QA's P1–P4).
- **Greenfield.** Both repos are empty on GitHub (`main` only, 2026-11-07) and **not cloned yet**, so there is no code to read. Every path below is new.

## Overview
- **Back** `god-plan-back`: Bun + Hono, TypeScript, Drizzle ORM + `postgres` (postgres.js), PostgreSQL database `god_plan` (SPEC-001).
  `[operator 00:39 for Bun+Hono+Postgres; SA-decided: Drizzle, postgres.js]`
- ~~**Front** `god-plan-front`: Next.js (App Router) + TypeScript + Tailwind CSS. No component library. Thai font via `next/font`
  (IBM Plex Sans Thai). `[operator 00:39 for Next.js; SA-decided: the rest]`~~ Superseded 2026-11-08 13:17 (F-003).
- **Front** `god-plan-front`: **Next.js 16 + React 19 + HeroUI v3 + Tailwind CSS v4**, following the owner's house skill
  `nextjs-heroui-pattern`. Use its **exact pinned versions** for `next`, `react`, `react-dom`, `@heroui/react`, `framer-motion`,
  `lucide-react`, `dayjs`, `typescript`, `tailwindcss`, `@tailwindcss/postcss`. **The skill's code samples are HeroUI v2; the
  pinned 3.1.0 is v3** (no provider; `@import "@heroui/styles"`; compound components such as `Card.Content`, `Dropdown.Item`,
  `Drawer.Dialog`). Build against the installed `.d.ts`, as TASK-010 did. (Found by the FE and checked by the SA on 2026-11-08.)
  `[operator 2026-11-08 13:17: "base on heroUI"]`. **Not taken from that skill** `[SA-decided]`: NextAuth, axios and React Query.
  The back owns the session (`gp_session` cookie), and plain `fetch` through `/api` is enough. Thai font: IBM Plex Sans Thai via
  `next/font`. The look must be clearly better than the rejected comp. Routine visual choices inside HeroUI are the FE's under
  DECISIONS 13:17.
- ~~**One origin for the browser.** The front proxies `/api/*` to the back through a Next `rewrites()` rule, so the session cookie is
  first-party and there is no CORS. The front's server reads `BACK_ORIGIN`.~~ Superseded 2026-11-08 (DEF-1, F-008).
- **One origin for the browser, through an explicit proxy route** (amended 2026-11-08 for DEF-1): `src/app/api/[...path]/route.ts` in
  the front forwards `/api/*` to `${BACK_ORIGIN}/api/*` with its own **27 s** abort. The rewrite proxy was opaque: a fixed 30 s timeout,
  `ECONNRESET` → 500 "Internal Server Error", and calls finishing at 42–237 s under `next dev` (TEST-001 round 2). Its behaviour under
  `next start` was unknown. **Timeout chain, each layer shorter than the one outside it:** back→gateway 25 s < front proxy 27 s <
  browser fetch 28 s < AC-8 30 s. Proxy errors use the standard error body: `504 {"error":{"code":"UPSTREAM_TIMEOUT"}}` on its own
  timeout, `502 {"error":{"code":"UPSTREAM_UNAVAILABLE"}}` when the back can't be reached. The front maps both through its existing
  rule (AI calls → the AI error string; anything else → `saveFailed`). The session cookie stays first-party, with no CORS.
- **Local only** (D4): back `bun run dev` on `127.0.0.1:4310`, front `next dev` on `127.0.0.1:4300`. Nothing deployed. Both repos
  are built in the owner's deploy shape (`deploy-ready-build`) so a later deploy needs no rework.
- **Roles.** Exactly one **owner** (D14). Everyone else is an **invitee**, who sees only projects they are a member of. Invitees
  view and comment only (AC-6). The owner sees every project.
- **All user-facing text lives in the front**, in one file `src/strings.th.ts` (D6). The back returns **codes**, never Thai
  text. The front maps codes to the PM's strings.

## Interpreted (SA), each reversible
- **Owner can rename and delete a task.** AC-6 forbids an invitee to "edit or delete a task", which implies the owner can.
  Project rename and delete are **not** built (no AC asks for them).
- **AC-18 and D13 together.** A link does not know the email of the person it was made for (the owner types a name only). So
  **any signed-in person who opens an invite link** sees the AC-18 message, and nothing is consumed. To use a link with an
  existing account (AC-14), the person must be signed out, then enters their email and existing password on the invite page.
- **Invite "same person" (D8: a new link cancels the old unused one)** = same project + same name typed by the owner
  (case-insensitive, trimmed). Reset: same user.
- **Display name.** The owner types a name when making an invite. The invitee sees it pre-filled on the invite page and may
  change it (1–100 characters). An existing account keeps its name.
- **Task order:** by creation time, oldest first. No reordering (drag-and-drop is out of scope).
- **Members list** (names and emails) is shown to the **owner only**. Invitees see the other people's names only as comment
  authors.
- **Session:** 30 days, sliding is not needed. Sign-out deletes it. A password reset deletes all of that user's sessions.

## Data Model
Migrations are generated by `drizzle-kit generate` from `src/db/schema.ts` and applied with `bun run db:migrate` to `god_plan` on
the owner's dev server. That is the team's dev database (workspace `CLAUDE.md` rule 4, DECISIONS 00:39), and the BE runs it.
Nothing exists in `god_plan` yet, so no existing rows are affected. The intended SQL, which the generated migration must
match in substance:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- gen_random_uuid(); built in from PG13, harmless if present
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE CHECK (email = lower(btrim(email)) AND length(email) BETWEEN 3 AND 254),
  display_name text NOT NULL CHECK (length(btrim(display_name)) BETWEEN 1 AND 100),
  password_hash text NOT NULL,
  is_owner boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX users_one_owner ON users (is_owner) WHERE is_owner;          -- D14: at most one owner
CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE,                                               -- sha256 hex of the cookie value
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 100),
  description text NOT NULL DEFAULT '' CHECK (length(description) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE project_members (                                                   -- invitees only; the owner is implicit
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, user_id)
);
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 200),
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','doing','stuck','done')),
  stuck_reason text CHECK (stuck_reason IS NULL OR length(stuck_reason) <= 500),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((status = 'stuck') = (stuck_reason IS NOT NULL AND length(btrim(stuck_reason)) > 0))  -- AC-2a, AC-17 (D12)
);
CREATE INDEX tasks_project ON tasks (project_id, created_at);
CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES users(id),
  body text NOT NULL CHECK (length(btrim(body)) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX comments_task ON comments (task_id, created_at);
CREATE TABLE link_tokens (                                                       -- D8 invite, D9 reset
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purpose text NOT NULL CHECK (purpose IN ('invite','reset')),
  token_hash text NOT NULL UNIQUE,                                               -- sha256 hex; the raw token is never stored
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,                     -- invite only
  invitee_name text,                                                             -- invite only, as the owner typed it
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,                           -- reset only
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((purpose = 'invite' AND project_id IS NOT NULL AND invitee_name IS NOT NULL AND user_id IS NULL)
      OR (purpose = 'reset'  AND user_id IS NOT NULL AND project_id IS NULL))
);
CREATE TABLE ai_summaries (                                                      -- D3: the last summary only
  project_id uuid PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
```
- A link is **valid** when `used_at IS NULL AND cancelled_at IS NULL AND expires_at > now()`. Consuming it is one
  `UPDATE … SET used_at = now() WHERE id = $1 AND used_at IS NULL AND cancelled_at IS NULL AND expires_at > now()`, and it must
  affect 1 row inside the same transaction as the membership or password change. 0 rows means `LINK_INVALID`.
- Tokens: 32 random bytes, base64url (43 characters). Hash: sha256 hex. Session cookie value: the same scheme.
- Passwords: `Bun.password.hash` (argon2id default) / `Bun.password.verify`.

## API / Interface Design — the BE↔FE contract
**General.** Base path `/api`. JSON in and out, UTF-8. Field names are **camelCase exactly as written here**. Times are ISO-8601
UTC strings (`"2026-11-08T02:10:00.000Z"`); the front formats them in Asia/Bangkok. ids are uuid strings.
**Auth:** cookie `gp_session` (httpOnly, `SameSite=Lax`, `Path=/`, `Secure` when `COOKIE_SECURE=true`). No header auth.
**Error body, always:** `{ "error": { "code": "<CODE>", "field": "<field>"?, "max": <n>? } }`.

| HTTP | code | when |
|---|---|---|
| 400 | `VALIDATION` | with `field` and `rule`: `"required"` (empty after trim) · `"tooLong"` (+ `max`) · `"tooShort"` (password, + `min: 8`) · `"invalid"` (bad email shape, bad status) |
| 401 | `UNAUTHENTICATED` | no or expired session on a protected route |
| 401 | `INVALID_CREDENTIALS` | wrong email or password (sign-in, invite accept with an existing email) |
| 403 | `FORBIDDEN` | signed in, can see the project, but the action is owner-only (AC-6) |
| 404 | `NOT_FOUND` | the thing doesn't exist **or** the viewer may not see it. **The two are never distinguished** (AC-4). |
| 409 | `SIGNED_IN` | invite accept while a session cookie is valid (AC-18) |
| 410 | `LINK_INVALID` | invite/reset link used, expired or cancelled (AC-13) |
| 429 | `AI_BUSY` | an AI call for this project is already in flight (D1) |
| 429 | `RATE_LIMITED` | > 10 AI presses in the last 60 s by this user (D1) |
| 502 | `AI_UNAVAILABLE` | gateway unreachable, non-2xx, `success:false`, timeout (25 s), empty or unparseable content (AC-8) |
| 400 | `VALIDATION` `field: "body"` | body not JSON or not an object (`rule: "invalid"`), or over 64 KB (`rule: "tooLong"`, `max: 65536`). Added 2026-11-08 at TASK-004 review |
| 500 | `INTERNAL` | anything unhandled. The body is the code only, and the log keeps the error name only. Added 2026-11-08 at TASK-004 review |

The `rule` key is part of `VALIDATION`: `{ "error": { "code": "VALIDATION", "field": "title", "rule": "tooLong", "max": 200 } }`.
Visibility check order on every project-scoped route: session → can see the project (owner, or member) else **404** → owner-only
action else **403**. So a non-member always gets 404 and never learns the project exists (AC-4).

**Shapes used below**
- `User` = `{ "id", "email", "displayName", "isOwner" }`
- `Project` = `{ "id", "name", "description", "createdAt" }`
- `ProjectListItem` = `Project` + `"taskCounts": { "todo": n, "doing": n, "stuck": n, "done": n }`
- `Task` = `{ "id", "projectId", "title", "status": "todo"|"doing"|"stuck"|"done", "stuckReason": string|null, "commentCount": n, "createdAt", "updatedAt" }`
- `Comment` = `{ "id", "taskId", "body", "createdAt", "author": { "id", "displayName" } }`
- `Summary` = `{ "stuck": [ { "taskId", "title", "stuckReason" } ], "ai": { "content", "createdAt" } | null }`

| # | Method + path | Who | Request | 2xx response | Errors |
|---|---|---|---|---|---|
| A1 | `POST /api/auth/sign-in` | public | `{ "email", "password" }` | 200 `{ "user": User }` + Set-Cookie | 400, 401 `INVALID_CREDENTIALS` |
| A2 | `POST /api/auth/sign-out` | any | — | 204, cookie cleared, session row deleted | — |
| A3 | `GET /api/me` | signed in | — | 200 `{ "user": User }` | 401 |
| P1 | `GET /api/projects` | signed in | — | 200 `{ "projects": [ProjectListItem] }` (owner: all; invitee: member of), newest first | 401 |
| P2 | `POST /api/projects` | owner | `{ "name", "description"? }` | 201 `{ "project": Project }` | 400, 401, 403 |
| P3 | `GET /api/projects/:projectId` | can see | — | 200 `{ "project": Project, "tasks": [Task], "viewer": { "isOwner": bool } }` | 401, 404 |
| T1 | `POST /api/projects/:projectId/tasks` | owner | `{ "title" }` | 201 `{ "task": Task }` status `todo` | 400, 401, 403, 404 |
| T2 | `POST /api/projects/:projectId/tasks/bulk` | owner | `{ "titles": [string] }` 1–50 items | 201 `{ "tasks": [Task] }`, all or none (one transaction) | 400 (`field: "titles[3]"` for item 3), 401, 403, 404 |
| T3 | `PATCH /api/tasks/:taskId` | owner | any of `{ "title", "status", "stuckReason" }` | 200 `{ "task": Task }` | 400, 401, 403, 404 |
| T4 | `DELETE /api/tasks/:taskId` | owner | — | 204 (its comments go with it) | 401, 403, 404 |
| C1 | `GET /api/tasks/:taskId/comments` | can see | — | 200 `{ "comments": [Comment] }` oldest first | 401, 404 |
| C2 | `POST /api/tasks/:taskId/comments` | can see | `{ "body" }` | 201 `{ "comment": Comment }` | 400, 401, 404 |
| I1 | `POST /api/projects/:projectId/invites` | owner | `{ "name" }` (1–100) | 201 `{ "url": "<FRONT_ORIGIN>/invite/<token>", "expiresAt" }`. Cancels this project's earlier unused invite with the same name (D8). | 400, 401, 403, 404 |
| I2 | `GET /api/invites/:token` | public | — | 200 `{ "projectName", "inviteeName", "ownerName", "expiresAt" }`. `ownerName` = the owner's `displayName` (added 2026-11-08, TASK-008 Q-F5: the PM's invite heading names him) | 410 |
| I3 | `POST /api/invites/:token/accept` | public, **signed out** | `{ "email", "password", "displayName"? }` | 200 `{ "user": User, "projectId" }` + Set-Cookie | 409 `SIGNED_IN` (checked first), 410, 400, 401 `INVALID_CREDENTIALS` |
| M1 | `GET /api/projects/:projectId/members` | owner | — | 200 `{ "members": [ { "id", "displayName", "email" } ], "pendingInvites": [ { "id", "inviteeName", "expiresAt" } ] }` | 401, 403, 404 |
| R1 | `POST /api/users/:userId/reset-links` | owner | — | 201 `{ "url": "<FRONT_ORIGIN>/reset/<token>", "expiresAt" }`. Cancels that user's earlier unused reset link. Refused for the owner himself (400 `VALIDATION`, `field: "userId"`, `rule: "invalid"`): he uses `owner:set`. | 400, 401, 403, 404 (user not a member of any project) |
| R2 | `GET /api/resets/:token` | public | — | 200 `{ "displayName" }` | 410 |
| R3 | `POST /api/resets/:token` | public | `{ "password" }` | 204. Deletes all that user's sessions (AC-15). | 400, 410 |
| S1 | `GET /api/projects/:projectId/summary` | can see | — | 200 `Summary`. **Never calls the gateway** (AC-9, AC-11). | 401, 404 |
| S2 | `POST /api/projects/:projectId/summary` | can see | — | 200 `Summary` with the new `ai` (stored, replaces the old one) | 401, 404, 429, 502 |
| G1 | `POST /api/projects/:projectId/ai/task-proposals` | owner | — | 200 `{ "proposals": [ { "title" } ] }` 1–20 items. **Writes nothing** (D10, AC-7a). | 401, 403, 404, 429, 502 |
| H1 | `GET /api/health` | public | — | 200 `{ "ok": true }` | — |

**Rules behind the routes**
- **Trim** every text field before validating. Email is also lowercased (D7). Email shape: one `@`, something either side, ≤ 254.
- **I3 accept:** (1) a valid `gp_session` cookie → 409 `SIGNED_IN`, and the token is untouched (AC-18). (2) Token invalid → 410.
  (3) Email exists → verify password (401 on mismatch, token untouched) → add membership (no-op if already a member) → consume →
  new session. (4) Email new → password ≥ 8, `displayName` (default: the invite's name) 1–100 → create user → membership →
  consume → new session. Steps 3 and 4 each run in one transaction. **Amended 2026-11-08 (TASK-005 review):** inside that
  transaction the link is **consumed first**, then the user, membership and session are created. The loser of a race then fails
  before creating anything. The owner's own email is treated like any existing account.
- **T3 status rules (AC-2, AC-2a, AC-17):** `status: "stuck"` needs a non-empty `stuckReason` in the same request, else
  400 `VALIDATION field: "stuckReason" rule: "required"`, and nothing changes. Any other status sets `stuck_reason` to NULL.
  `stuckReason` alone while the task is stuck changes the reason; sent while not stuck, it is ignored. `updated_at = now()`.
  Any status → any status (D5).
- **HTML is stored as typed** and is never rendered as HTML by the front (AC-16). The back does not strip it.

## AI — gateway use (D1, D2, D10, D11, AC-7..9, AC-11, AC-12)
- One module `src/ai/gateway.ts`: `POST ${LLM_GATEWAY_URL}/chat`, no `provider` (default chain), **no auth header** (skill §5: no key
  today), `temperature: 0.3`, `max_tokens: 800` (proposals) / `600` (summary), **timeout 25 s** (AbortController), **no retry**.
  It returns `content` only when the HTTP status is 200, `success === true` and `data.content` is a non-empty string. Anything else
  → `AI_UNAVAILABLE`. It never logs the request body.
- **Guards (in memory, one process is enough for local):** a per-project in-flight flag → 429 `AI_BUSY`. A per-user sliding
  window of 60 s holding ≤ 10 presses → 429 `RATE_LIMITED`. A press counts when it passes both guards.
- **What is sent (AC-12, D2): only these, never comments, never user names or emails.**
  - G1: system = a Thai instruction: *answer with a JSON array of 3–15 short Thai task titles and nothing else*. User =
    `ชื่อโปรเจกต์: <name>\nรายละเอียด: <description>`.
  - S2: system = a Thai instruction: *summarise progress and blockers in at most 5 short Thai sentences, plain text*. User = the
    project name, then one line per task: `- <title> — <ยังไม่เริ่ม|กำลังทำ|ติดอยู่|เสร็จแล้ว>[ — เหตุผล: <stuck_reason>]`.
  - The exact prompt wording is the BE's. The **inputs** are fixed by this list.
- **G1 parsing:** strip a surrounding ``` fence if present, `JSON.parse`, require an array. Keep string items, trim them, drop
  empty ones, cut each to 200 characters, keep the first 20. If nothing is left → `AI_UNAVAILABLE`.
- **S2:** the trimmed content, cut to 4000 characters, upserted into `ai_summaries` with `created_at = now()`. `stuck` is always
  read from `tasks` (status `stuck`, oldest first), never from the AI.

## Testability seams (REQ-001 §Constraints P1–P5)
- **P1 + P2: stand-in gateway** at `god-plan/ai-worker/tests/harness/gateway-stub/` (workspace, not a product repo; written by
  the BE in TASK-006). It is a Bun script, `bun gateway-stub/server.ts`, listening on `127.0.0.1:4399`:
  - `POST /chat` answers in the gateway's exact shape (`llm-gateway` skill §4). It answers per the **mode**, read from the file
    `gateway-stub/mode.txt` on every request: `ok` (a JSON array of 5 Thai titles if the system prompt mentions JSON, else 3
    Thai sentences) · `500` (HTTP 500 `{ "success": false, "error": "stub 500" }`) · `hang` (no answer for 40 s) · `empty`
    (`success: true`, `content: ""`) · ~~`malformed` (`content: "not json ["`)~~ **`malformed` = HTTP 200 whose body is not valid
    JSON** (e.g. `{"success":true,"data":`), so **both** G1 and S2 must show the AI error and save nothing (AC-8). (Amended
    2026-11-08 at TASK-006 review: the old content-level `malformed` was a valid summary for S2, so it could not meet AC-8. SA's
    SPEC defect, F-005.) G1's "content is not a JSON array" case stays covered by the unit tests. QA switches it with `echo hang > mode.txt`: no code
    change, no restart.
  - Every request is appended to `gateway-stub/calls.jsonl` as `{ "at": ISO, "body": <request JSON> }`. `GET /calls` returns
    `{ "count": n, "calls": [...] }`. `DELETE /calls` empties it. `calls.jsonl` and `mode.txt` are scratch (git never applies here).
  - The back points at it with `LLM_GATEWAY_URL=http://127.0.0.1:4399`. **The live gateway is never set in any `.env` while
    building or testing** (REQ Out of Scope, D11).
- **P3:** `INVITE_TTL_SECONDS` (default `604800` = 7 days) sets both the invite and reset lifetime. QA sets `60` locally.
- **P4: `bun run owner:set`** in `god-plan-back` reads three lines from stdin (email, display name, password). It creates the
  owner if there is none, else updates the existing owner's email, name and password and deletes his sessions. It prints
  `owner created` / `owner updated` and nothing else (never the password). On the dev database the BE runs it once with a
  **synthetic** owner and writes the sign-in to the file **`god-plan-qa.env`, placed in the same folder that holds the code repos**
  (the parent folder of `god-plan-back` in `machine.local.md`; precedent: `call-scribe-qa.env`). Two lines:
  `OWNER_EMAIL=…`, `OWNER_PASSWORD=…`. **Never inside the workspace.** I checked on 2026-11-08: `git check-ignore` reports
  nothing ignored under `god-plan/ai-worker/tests/harness/`, and Atom commits the workspace. Never paste it into a TASK, log or chat.
  The stand-in's `calls.jsonl` / `mode.txt` hold synthetic data only, so they may sit in the workspace.
- **P5: `.env.example`** in each repo lists every key with a one-line comment and no values (owner rule, workspace `CLAUDE.md` rule 4).

## Environment keys
**Back** (`god-plan-back/.env`, git-ignored; SPEC-001 Q-S1):
| Key | What it is for | Dev value |
|---|---|---|
| `PORT` | port the back listens on | `4310` |
| `HOST` | bind address | `127.0.0.1` |
| `DATABASE_URL` | Postgres connection to `god_plan` | the owner's URL with the database name `god_plan`; never printed |
| `FRONT_ORIGIN` | base of the invite/reset URLs the back returns | `http://127.0.0.1:4300` |
| `COOKIE_SECURE` | `true` adds `Secure` to the cookie (https only) | `false` |
| `LLM_GATEWAY_URL` | base URL of the AI gateway | `http://127.0.0.1:4399` (the stand-in) |
| `INVITE_TTL_SECONDS` | invite and reset link lifetime | `604800` |

**Front** (`god-plan-front/.env.local`, git-ignored): `BACK_ORIGIN` (where `/api/*` is proxied; dev `http://127.0.0.1:4310`).

## Front — pages (all Thai, D6)
| Route | Who | Shows |
|---|---|---|
| `/sign-in` | signed out | email + password form (A1). Any route below redirects here on 401. |
| `/` | signed in | project list (P1) with status counts. Owner: a "new project" form (P2). |
| `/projects/[id]` | can see | **the AC-10 page:** tasks with status and Stuck reason. Owner: add task, change status (Stuck asks for the reason), rename, delete. A task's comment thread (C1/C2) opens beside or below it. Owner: "ให้ AI ช่วยแตกงาน" (G1, the proposal panel: tick boxes, editable titles, "บันทึกงานที่เลือก" → T2). Links to summary and (owner) members. |
| `/projects/[id]/summary` | can see | the Stuck list + last AI summary with "สรุปเมื่อ …" or "ยังไม่มีสรุป…", button "สรุปใหม่" (S1/S2) |
| `/projects/[id]/members` | owner | members + pending invites (M1). Make an invite (I1) → "คัดลอกลิงก์เชิญ". Per member: make a reset link (R1) → copy. |
| `/invite/[token]` | public | I2, then the accept form (I3). On 409 → the AC-18 message. On 410 → the invite-link message. |
| `/reset/[token]` | public | R2, then the new-password form (R3) |
| `not-found.tsx`, `error.tsx` | any | Thai pages ("ไม่พบหน้านี้"); no English framework defaults (D6) |
- **Text is rendered as text** (React default). `dangerouslySetInnerHTML` is forbidden anywhere (AC-16).
- **Limits are checked in the front too** (same numbers as the back, D16), with the "ยาวเกิน <N> …" message, but the back is the authority.
- Every AI button is **disabled while its call is running**. On any error it shows the AI error string, and nothing on screen
  changes except the message (AC-8). The proposal lives only in component state (D10).

## Non-functional
- AI: 25 s timeout on the back, so the error shows within 30 s (AC-8). **The server's `idleTimeout` must be above 25 s** (Bun's
  default of 10 s cuts a waiting AI call). `src/index.ts` sets 30. Found in TASK-006. Any deploy proxy needs a read timeout above 25 s too. The front's own fetch timeout is 28 s, mapped to the same message.
- Security: passwords argon2id. Tokens and sessions stored only as sha256. The cookie is httpOnly. Every route checks visibility
  before ownership (404 before 403). Run `/security-review` before the SA marks TASK-004/005 DONE.
- Deploy shape from day one (`deploy-ready-build`): front `output: "standalone"` + the copy script; back
  `bun build --compile --target=bun-linux-x64`. **Nothing is deployed.**
- Tests: `bun test` in the back runs against **PGlite in memory** (`@electric-sql/pglite` + `drizzle-orm/pglite`, the same migrations),
  never against `god_plan`, so test runs leave the QA's dev data alone. `[SA-decided]` PGlite is an in-process library, not a
  Postgres install or service (rule 4).

## Tasks
Order of value (REQ-001 line 3): the owner's loop → invite/view/comment → AI. AC-10's comp comes before the full front build.
| TASK | Title | Owner | Depends on |
|---|---|---|---|
| ~~TASK-002~~ | ~~AC-10 comp: one static page~~ (rejected by the owner 13:17; F-003) | FE | — |
| TASK-010 | AC-10 comp, redone: scaffold `god-plan-front` on HeroUI + the project page with mock data | FE | none |
| TASK-003 | Back scaffold: Hono, Drizzle schema + migration, env, `owner:set`, health, deploy shape, PGlite tests | BE | repos cloned (Atom); TASK-001 for migrate/owner:set on dev |
| TASK-004 | Back: auth, projects, tasks, comments (A1–A3, P1–P3, T1–T4, C1–C2) | BE | TASK-003 |
| TASK-005 | Back: invites, resets, members (I1–I3, M1, R1–R3) | BE | TASK-004 |
| TASK-006 | Back: AI endpoints (S1, S2, G1) + the stand-in gateway (P1, P2) | BE | TASK-004 |
| TASK-007 | Front: sign-in + project list + project page wired to the back (owner loop), on TASK-010's scaffold | FE | TASK-004 · TASK-010 · owner's yes on the comp (AC-10) |
| TASK-008 | Front: comments, members, invite and reset pages | FE | TASK-005 · TASK-007 |
| TASK-009 | Front: AI proposals + summary page | FE | TASK-006 · TASK-007 |

**AC → TASK:** AC-1 → 004/007 · AC-2 → 004/007 · AC-2a → 004/007 · AC-3 → 004/007 · AC-3a → 005/008 · AC-4 → 004/005/006 (404
rule, S2 404) · AC-5 → 004/008 · AC-6 → 004/007 · AC-7 → 006/009 · AC-7a → 006/009 · AC-8 → 006/009 · AC-9 → 006/009 · AC-10 →
002 (+ the owner) · AC-11 → 006/009 · AC-12 → 006 · AC-13 → 005/008 · AC-14 → 005/008 · AC-15 → 005/008 · AC-16 → 004/007/008 ·
AC-17 → 004/007 · AC-18 → 005/008. P1/P2 → 006 · P3 → 005 · P4 → 003 · P5 → 003/007.
**Every task's DoD also includes:** `.env` and `.env.local` reported by `git check-ignore` in their repo, and no URL, password or
host in any TASK, log or chat.

## Risks and unknowns
- **Repos not cloned** (Atom clones on branch `atom`). Blocks TASK-003 onward. → the PM (owner/Atom).
- **TASK-001 blocked** (owner's run). Blocks `db:migrate` and `owner:set` on dev only. The back can be built and unit-tested
  against PGlite meanwhile.
- **AI wording quality** is unknown until D11's live run (owner's yes). The stand-in proves wiring only.
- The **in-memory AI guards** reset on restart and do not work across several processes. Enough for local release 1.
  Revisit at deploy.
- **Gateway key** may be needed later (skill §5). On 401/403 from the gateway: DATA REQUEST, never an invented header.
- **No sign-in throttle or lockout** in release 1 (TASK-004 review, 2026-11-08). Acceptable while local with synthetic people only.
  **It must be designed before any deploy.** The deploy REQ has to carry it.
- **A PATCH race** (a reason-only edit and a status change at the same moment) can hit the CHECK and return 500. It fails closed. Accepted with one owner.

## Close-out (SA, 2026-11-08): REQ-001 → SPEC_DONE, with one explicit gate
- **DONE:** TASK-004, 005, 006, 011, 012 (back), TASK-007, 008, 009, 010 (front). TASK-002 was superseded by TASK-010. Every AC maps to a
  DONE TASK (see §Tasks AC → TASK). AC-10 was met by the owner (layout B, 15:53).
- **Proven on:** the real back running on **PGlite in memory** (`tests/harness/back-pglite/`) + the stand-in gateway, driven by the real
  front in a browser. Back unit/API tests: 77 pass.
- 🔴 **Not proven, and it gates DELIVERED, not testing:** the real-Postgres run. TASK-001 (create `god_plan`, the owner's run) → TASK-003
  steps 6–7 (`db:migrate`, `owner:set`, `god-plan-qa.env`) → the BE boots `src/index.ts` on it and re-runs one curl sequence. Until
  then, `SPEC_DONE` means "built and proven on PGlite". The PM must not set `DELIVERED` before that run passes.
- **Also open (the owner's):** D11, the 4-call live AI run (AI wording quality is NOT_TESTED). **Carried to the release gate:** `/impeccable`,
  real phone, keyboard / screen reader. Before any deploy: a sign-in throttle (§Risks), and a proxy read timeout above 25 s.
- **For QA:** TEST-001 can run now on `back-pglite` + `gateway-stub` + the front (`next dev -p 4300`). Stub `malformed` = a non-JSON body (F-005).

## Questions
- **Q-S2 (SA → PM, BLOCKS TASK-002, then 007–009): strings the screens need that the wording table doesn't list.** "Never
  invent". Please add the Thai for each, or strike the ones you'd rather not show:
  sign-in page title · email label · password label · sign-in button · sign-out · project list title · empty project list ·
  new project: name label, description label, create button · task list empty · add task: title placeholder, add button ·
  change status (control label) · Stuck reason label (input) · save · cancel · rename task · delete task + its confirm question ·
  comments heading · no comments yet · comment placeholder · send comment · comment count (e.g. "<n> คอมเมนต์") · link to summary ·
  link to members · members page title · pending invites heading · invitee name label (owner types it) · make invite link ·
  make reset link · copied (reset) · invite page heading (with project name) · your name · email · password · join button ·
  hint for people who already have an account (use your existing password) · reset page heading · new password · save new
  password · password changed (then sign in) · reset link used/expired/replaced · AI busy (429 `AI_BUSY`) · too many presses (429 `RATE_LIMITED`) · AI proposal
  panel heading · loading (AI working) · back to project list.
  `Checked: REQ-001 §User-facing wording (14 rows, 02:0x) — not covered because these screens were not listed there.`
  > answer (Porter, PM, 2026-11-08): all written, none struck — REQ-001 §User-facing wording, table "Added 2026-11-08 for
  > SPEC-002 Q-S2". One product rule came with it `[PM-decided]`: deleting a task deletes its comments; the confirm says so.
  > Repos: cloning is Atom's (owner's channel) — asked of the owner 2026-11-08.
