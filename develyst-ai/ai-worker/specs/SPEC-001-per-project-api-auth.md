# SPEC-001: Per-project API authentication for the gateway

- Source: REQ-001
- Status: ACTIVE

## Overview

Add a lightweight, DB-free authentication layer to the gateway. Each calling
project gets its own opaque bearer key. A Hono middleware protects the
AI-invoking routes (`/chat`, `/chat/multi`), looks the presented key up in a
small key store, rejects anything unknown/disabled with a generic 401, and
attaches the resolved project name to the request context for attribution
logging.

**Why this approach (and not a DB or a signed-token/JWT scheme):** the repo has
no database and the requirement is service-to-service auth for a known, small
set of projects. Opaque random keys checked against a human-managed file give us
per-project identity, instant revocation, and zero new infrastructure — matching
the project's existing "`.env`-style secret supplied by the human" model. No
master/signing secret is introduced (keys are compared directly, not verified
cryptographically), which keeps the surface minimal.

## API / Interface Design

### Credential transport

- Header: `Authorization: Bearer <project-key>`.
- One scheme only (no `x-api-key` alias) to keep the contract unambiguous.

### Protected routes

- `POST /chat` and `POST /chat/multi` (mounted under `/chat/*`).
- **Unprotected (unchanged):** `GET /`, `GET /models`, `GET /tiers` — these are
  static info endpoints that invoke no provider and leak no secrets. (Flagged for
  Porter in Questions in case the human wants them gated too.)

### Success

- Request/response shape of a successful call is **unchanged** (still
  `{ success: true, data: AIResponse }`). Auth is transparent to a valid caller.

### Failure (all 401, identical body — no leak of "unknown vs disabled")

```
HTTP/1.1 401 Unauthorized
{ "success": false, "error": "unauthorized" }
```

Returned when: no `Authorization` header, malformed header, key not in store, or
key present but `disabled: true`. The response never says which of these it was.

## Data Model

No database. A gitignored JSON key store at the repo root, supplied/edited by the
human like `.env`:

**`api-keys.json`** (real file — gitignored, human-managed, never committed):
```json
[
  { "key": "dvl_proj_alpha_9f3c...", "project": "project-alpha", "disabled": false },
  { "key": "dvl_proj_beta_7a1d...",  "project": "project-beta",  "disabled": true }
]
```

- `key`   — opaque random string the human generates (e.g. `openssl rand -hex 24`,
  prefixed for readability). Compared as an exact string.
- `project` — human-readable project identifier used in attribution logs.
- `disabled` — `true` revokes that key without touching others.

Committed to the repo instead: **`api-keys.example.json`** with dummy values, so
the shape is documented. `api-keys.json` added to `.gitignore`.

### Revocation without redeploy

The store module caches the parsed file but **re-reads it when the file's mtime
changes** (cheap `stat` per request; reload only on change). So editing
`api-keys.json` (flip `disabled` to `true`, or remove the entry) takes effect on
the next request — no restart, no redeploy, other keys unaffected. If the file is
missing or unparseable, the store treats it as "no valid keys" (all requests 401)
and logs a warning — it never crashes the server and never falls open.

## Flow

1. Request hits `/chat/*`. Middleware runs before the route handler.
2. Read `Authorization` header. Missing/not `Bearer <token>` → 401.
3. Ensure store is fresh (stat `api-keys.json`; reload if mtime changed).
4. Look up the token. Not found, or found with `disabled: true` → 401.
5. Found & enabled → `c.set("project", entry.project)`, log one attribution line
   (`[auth] project=<project> POST /chat`), call `next()`.
6. Handler runs unchanged; provider/`.env` secrets never enter the response.

Edge cases:
- Empty/missing `api-keys.json` → every request 401 (fail closed), warn once.
- Duplicate `key` entries → first match wins (note in store, not a hard error).
- `/chat/multi` authenticates once at the middleware; the whole batch is
  attributed to the one calling project.

## Non-functional

- **Auth:** as above; fail-closed on any store problem.
- **Attribution/logging:** one structured stdout line per authorized request
  including `project` and path. No key material is ever logged (log the project
  name, never the `key`). This satisfies REQ-001 #4 "record which project called"
  — persistent usage storage/quotas are explicitly out of scope.
- **Secrets:** `api-keys.json` is gitignored; keys referred to by project name in
  logs. No key value printed/logged/committed.
- **Performance:** one `stat` + a Map lookup per request; negligible.

## Tasks

- TASK-001: API key store module + example file + gitignore (depends on: —)
- TASK-002: Auth middleware, wiring, generic 401, attribution log, docs/Bruno
  (depends on: TASK-001)

## Questions

(Jason asks here; Sober answers as `> answer: ...`)

- (Sober → Porter, non-blocking) REQ-001 lists `/chat`, `/chat/multi`, "and any
  other AI-invoking endpoint". I am leaving `GET /`, `/models`, `/tiers` open
  (static info, no provider call, no secrets). If the human wants those gated
  too, say so and I'll extend the middleware — not blocking the build.
