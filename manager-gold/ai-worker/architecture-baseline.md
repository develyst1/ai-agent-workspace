# Architecture Baseline — manager-gold

> Owned by Sober (SA Lead). Shared technical decisions that every SPEC builds on.
> If a decision here changes, update this file and note it in the affected SPECs.
> Last updated: 2026-07-26 (for SPEC-001).

## 1. Stack (confirmed)

| Layer | Choice | Notes |
|-------|--------|-------|
| Backend runtime | **Bun + Hono** (TypeScript) | Stakeholder-mandated. |
| Data store | **SQLite** via **Drizzle ORM** | `.gitignore` hinted SQLite; Drizzle gives typed schema + migrations. Single-file DB, no server to run — right size for MVP. |
| Password hashing | **`Bun.password`** (argon2id) | Built into Bun — no extra dependency. |
| Session model | **Server-side opaque sessions** in a `sessions` table | Simpler + revocable vs JWT (logout = delete row). Cookie carries only an unguessable session id. |
| Frontend | **Next.js (App Router) + TypeScript + Mantine** | Stakeholder-mandated. |
| FE↔BE transport | `fetch` with `credentials: "include"` | Cookie-based auth across origins. |

## 2. Dev conventions (Sober's call — avoid collisions with other workspace projects)

- Backend dev port: **4020** (existing projects use 4006/4010).
- Frontend dev port: **3020** (existing projects use 3016/3018).
- Backend base path: all app data routes under **`/api/*`** (protected); auth routes under **`/auth/*`**.
- Repo roots: `H:\manager-gold\manager-gold-back`, `H:\manager-gold\manager-gold-front`.

## 3. Auth & data-isolation model (the backbone for REQ-001/002/003)

- Auth = **httpOnly, Secure, SameSite=Lax** cookie named `mg_session` holding an
  opaque random session id (≥32 bytes, base64url). Never store user data in the cookie.
- A **session middleware** on the backend resolves `mg_session` → session row →
  `user_id`, and attaches `userId` to the request context. All `/api/*` routes
  require it; missing/invalid/expired session → **401**.
- **Per-user isolation is enforced server-side, always:** every domain table
  (people, notes, advice, …) carries a `user_id` column, and **every query is
  filtered by the authenticated `userId`** — never by an id sent from the client.
  The client is never trusted to say "whose data" this is.
- Session lifetime: **30 days**, fixed expiry (`expires_at`). Expired → treated as 401.
- **Deployment note (raise via Porter before REQ-001 delivery):** `SameSite=Lax` +
  `Secure` works in dev (front :3020 / back :4020 are both `localhost` = same-site) and in
  production **only if** frontend and API share a registrable domain (e.g. `app.example.com`
  + `api.example.com`). If they end up **cross-site** (different domains), the cookie must
  switch to `SameSite=None; Secure` and CORS must keep the exact origin. Depends on the
  (still-undisclosed) hosting topology — a DATA REQUEST when hosting is decided.

## 4. Config / secrets

- All secrets and environment-specific values live in **`.env`** (git-ignored),
  never committed. Each repo ships a committed **`.env.example`** listing required keys.
- Backend env (initial): `PORT=4020`, `DATABASE_URL=./manager-gold.sqlite`,
  `FRONT_ORIGIN=http://localhost:3020`, `NODE_ENV`.
- Frontend env (initial): `NEXT_PUBLIC_API_BASE=http://localhost:4020`.
- **Real external values (e.g. AI Center base URL / API keys for REQ-003) come from
  the human via DATA REQUEST — never guessed or committed.**

## 5. CORS

- Backend allows origin `FRONT_ORIGIN` with `credentials: true` and the methods/headers
  the API uses. No wildcard origin (cookies require an explicit origin).

## 6. Source control / commit convention (Sober, 2026-07-27)

Each repo (`manager-gold-back`, `manager-gold-front`) is its own git repo.
- **Commit to branch `dong`** in each repo (matches Jason's TASK-001). Independent
  branches per repo — that's expected; the repos don't share history.
- **Each TASK produces at least one commit** whose message references the TASK id
  (e.g. `TASK-002: frontend bootstrap`). "Done" means committed, not just in the tree.
- **Commit** `.env.example` and all source. **Never commit** `.env`, `*.sqlite`,
  `node_modules`, or build output (`.next`, `dist`) — the `.gitignore`s already cover these.
- **Do not push / merge to the default branch** — pushing and any merge to
  `main`/`master` is the human's call at integration/deploy time (via Porter), not the
  engineers'. Keep commits local on `dong` unless told otherwise.

## 7. Local dev / live-check convention (Sober, 2026-07-28)

Ports :4020 (back) and :3020 (front) are shared across all sessions, so overlapping
live checks can collide (both Jason and Fern hit `EADDRINUSE` / a server disappearing
mid-run). Rules to make live checks safe:
- **Only ever stop the exact server PID you launched.** NEVER kill `//IM bun.exe` /
  `//IM node.exe` (that nukes the other engineer's servers). Reliable pid sources on
  Git-Bash/Windows: (a) recommended — the server logs its own pid at startup
  (`console.log("pid", process.pid)`); (b) a pidfile; (c) **acceptable fallback** —
  the pid listening on the port, but ONLY if you verified that port was free *before*
  you launched (so the bound pid is unambiguously yours). Note `echo $!` gives the
  bash job id, not the OS pid — don't feed it to `taskkill //PID`.
- A live check that needs the backend starts its **own** backend instance, and stops
  **only that instance** (by its recorded PID) the moment the check is done.
- Before running a live E2E that will hold :4020 (FE) or :3020, **announce it in the
  log** ("running :4020 for a TASK-0xx E2E") and note when you've torn it down, so the
  other engineer doesn't start a competing instance at the same moment.
- Automated `bun test` uses a throwaway `test.sqlite` and no ports — unaffected; prefer
  it over live curls whenever it can prove the DoD.
