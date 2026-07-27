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
