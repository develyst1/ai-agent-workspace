# SPEC-001: Stack + AI provider — DECIDED
- Source: SA-Lead.md §Your first job; **SYSTEM-FACTS.md §Stack (owner's decision, 2026-09-18)**; REQ-001..005
- Status: ACTIVE — revised 2026-09-18 by Sober to record the owner's decision. The proposal that preceded it is summarised in §History; the decision is what binds.
- Author: Sober (SA)

## Overview
The owner decided the stack himself (SYSTEM-FACTS §Stack, verbatim *"stack พวกนี้ฉันตัดสินเอง"*).
This SPEC records those facts and fills the gaps he explicitly left to Sober ("Sober's call"),
so that every later SPEC/TASK builds on one written base. Where the owner spoke, his line wins;
where he said "Sober's call", the choice is marked **(Sober)** and is reversible by him via Porter.

## The decided stack

| # | Area | Decision | Source |
|---|---|---|---|
| D1 | Backend | **Bun + Hono**, TypeScript | owner |
| D2 | Database | **PostgreSQL 18**, database `possibility_db` on the owner's SIT server | owner |
| D2a | Schema tool | **Drizzle ORM + drizzle-kit** — schema in `src/db/schema.ts`, SQL migration files in `drizzle/`; every migration is named in the SPEC that introduces it and applied with `bunx drizzle-kit migrate` | (Sober) — Bun-native, migrations are plain SQL Sober can review |
| D3 | Frontend | **Next.js 16 + React 19 + Ant Design**, exactly per workspace skill `nextjs-antd-pattern` (lockset next 16.2.9 · react 19.2.7 · antd 6.4.3) | owner — Q-1 settled 2026-09-19: *"Ant Design"* |
| D4 | AI | **The owner's gateway `https://ai.develyst.online`** — `POST /chat`, called only from the backend. Contract read from `bruno-ai-develyst` (read-only) | owner |
| D4a | Provider/model | **Per step, never global** (owner, 09-19): each analysis step has its own `provider`, `model`, `maxTokens`, `temperature` in `possibility-back/config/ai-steps.json` (path overridable by `AI_STEPS_CONFIG`), read at startup, editable by the owner with no code change. The env vars `AI_PROVIDER`/`AI_MODEL` from TASK-001 are **removed** in TASK-005. Step design + defaults: SPEC-003 | owner (per-step rule) · (Sober) file format + defaults |
| D4b | Output handling | The gateway returns free text in `data.content`. Every step instructs its model to answer **only** a JSON object with that step's schema (SPEC-003); the BE strips code fences, `JSON.parse`s and validates with zod. Any step failing after one automatic retry = AI failure (REQ-003 R6/AC-7/AC-12, REQ-001 AC-7): nothing saved, 502 `AI_FAILED` | (Sober) |
| D5 | Auth | Google Identity Services button on FE → Google ID token → `POST /api/v1/auth/google` → BE verifies with `google-auth-library` → upsert user → BE sets httpOnly `SameSite=Lax` cookie `possibility_session` (HS256 JWT, 7 days, `hono/jwt`) | owner accepted Sober's proposal |
| D6 | Contract | REST/JSON · **camelCase every field** · base `/api/v1` · UUID v4 ids · ISO-8601 UTC dates · error envelope `{ "error": { "code", "message" } }` · tier values are the exact strings `Ordinary`/`Seeker`/`Raw Diamond`/`Visionary`/`The Possibility` in DB and on the wire · status codes 200/201/400/401/404/409/502 as listed in §Contract conventions | owner accepted Sober's proposal |
| D7 | Git | **None.** The owner controls git entirely; the team edits files. "Ready to deploy" = Porter tells the owner after `TEST_PASSED` | owner |
| D8 | Environments | **No local database.** Dev and test both run against the SIT PostgreSQL via `DATABASE_URL` in `.env` (the owner fills it; the value is never written in any committed file). Apps themselves run on each person's machine: FE `http://localhost:3000`, BE `http://localhost:4000` | owner |
| D8a | Env files | Each repo commits `.env.example` (names only) and git-ignores `.env` | owner |
| D8b | Shared-DB discipline | Because everyone shares one DB: Tanya's fixtures carry the prefix `qa-` in emails/idea text and live in `ai-worker/tests/harness/`; engineers never delete rows they did not create; schema migrations are applied by **Jason only**, after Sober marks the TASK holding them `DONE` — one applier, one order | (Sober) |

## Contract conventions (D6, binding on every later SPEC)
- Validation on the BE with `zod` via `@hono/zod-validator`; the FE mirrors limits for UX only. BE is the truth.
- 400 `VALIDATION_FAILED` (plus a specific code where a REQ names one, e.g. `IDEA_TOO_SHORT`) · 401 `NOT_SIGNED_IN` · 404 `NOT_FOUND` (also for "not yours") · 409 `ALREADY_EXISTS` · 502 `AI_FAILED`.
- CORS: allow `FRONTEND_ORIGIN` with credentials. Cookie is sent automatically; FE never reads it.
- `lang: "th" | "en"` travels only in the analyse request body (REQ-003 R3). All labels are FE-side (REQ-005).

## Backend layout (D1, binding for TASK-001)
```
possibility-back/
  src/index.ts            # Hono app, CORS, error envelope middleware, route mount
  src/env.ts              # zod-validated process env (fails fast on missing var)
  src/db/client.ts        # drizzle(postgres) using DATABASE_URL
  src/db/schema.ts        # all tables
  src/routes/<area>.ts    # auth.ts, ideas.ts, hire-requests.ts, admin.ts
  src/services/<area>.ts  # business logic, no HTTP
  src/lib/ai-gateway.ts   # the ONE place that calls ai.develyst.online
  src/lib/session.ts      # sign/verify cookie JWT, requireUser / requireAdmin middleware
  drizzle/                # SQL migrations
  config/ai-steps.json    # per-step provider/model/maxTokens/temperature (SPEC-003)
  .env.example            # DATABASE_URL, SESSION_SECRET, GOOGLE_CLIENT_ID, ADMIN_EMAILS (comma-separated; SPEC-005 §Amendment), AI_GATEWAY_URL, AI_STEPS_CONFIG (optional), COMPANY_REFERENCE_PATH (optional), FRONTEND_ORIGIN, PORT
```
**Ports (amended 2026-09-23, TASK-016 Q-2):** the BE listens on `.env` `PORT`; **4000 is only the default when the var is absent** — on the dev machine it has been 4019. Every role reads `PORT` (or the SIT URL) and never assumes 4000. The FE dev server is `3000` unless taken.
```
```

## Frontend layout (D3, binding for TASK-002 once Q-1 is answered)
The `nextjs-antd-pattern` skill as written (Q-1 settled: Ant Design): `app/ · components/{ui,common,layout,partials} · hooks/ · services/ · lib/api/ · types/ · context/`; `api-main.ts → service → hook (React Query) → partial`; `@/*` alias; thin server pages → `"use client"` Content components. Exact pinned versions per the skill's lockset (`next 16.2.9 · react 19.2.7 · react-dom 19.2.7 · @tanstack/react-query 5.101.0 · axios 1.17.0 · typescript 6.0.3`) plus `antd 6.4.3`. **Security patches (amended 2026-09-20):** a patch/minor bump of `next` or `axios` within the same major to clear an `npm audit` advisory is Sober-approved and recorded in the TASK that does it; `antd`/`react` bumps still follow the skill. i18n: a plain TH/EN dictionary in `lib/i18n/` with a `lang` cookie (REQ-005 R3); no third-party i18n lib. **Note (2026-09-21, TASK-006):** pins now `next 16.3.5` · `axios 1.20.0` (security re-pin, audit 0); `next.config.ts` sets `agentRules: false` because Next ≥16.3 otherwise writes `AGENTS.md`/`CLAUDE.md` into the repo on `next dev`.

## Risks recorded (not blockers)
- R-1 The gateway has **no authentication** as documented. Anyone who finds the URL can spend the owner's provider credits. Our BE will not fix that; noted for the owner.
- R-2 One shared DB for dev + test means a half-built feature can disturb Tanya's run. D8b is the only mitigation; the owner chose this knowingly.
- R-3 Plain-text JSON from a chat model will occasionally be malformed; D4b's validate-and-retry covers it and REQ-003 AC-7 shows the user W-6, never a wrong tier.

## Tasks
- TASK-001: Scaffold `possibility-back` (Bun + Hono + Drizzle + env + health route) — owner: BE (depends on: —)
- TASK-002: Scaffold `possibility-front` (Next.js 16 + Mantine per skill architecture) — owner: FE (depends on: Q-1 answer)

## Questions
- ~~Q-1~~ **settled 2026-09-19 by the owner: Ant Design** (was: the skill has no Mantine variant — Mantine on the skill architecture vs Ant Design).
- ~~DR-2~~ **done 2026-09-19** — `GOOGLE_CLIENT_ID` is in `possibility-back/.env`; the FE public copy goes into `possibility-front/.env.local` once TASK-002 creates `.env.example`.

## History
- 2026-09-18 v1 (DRAFT): Sober proposed NestJS · Postgres+Prisma · Next.js+Mantine · Anthropic `claude-opus-5` · BE-owned Google auth · REST camelCase · `develop` branch · Docker Postgres.
- 2026-09-18 v2 (ACTIVE): owner overrode D1–D4, D7, D8; accepted D5, D6. DR-1 (Anthropic key) and DR-3 (Docker) void.
- 2026-09-19 v3: D3 → Ant Design (owner); D4a/D4b → per-step AI configuration (owner rule, SPEC-003 design); Q-1, DR-2, DR-4 closed.

## SIT deploy checklist (added 2026-09-22 — Porter's request after the first SIT deploy; the owner deploys)
Everything that differs from local. Values are the owner's; names are ours.
| Where | Setting | SIT value / rule |
|---|---|---|
| Google Cloud OAuth client | Authorised JavaScript origins | `https://possibility.develyst.online` (done 2026-09-21 — this was the sign-in failure) |
| FE build (`possibility-front/.env.local` **at build time**) | `NEXT_PUBLIC_API_BASE_URL` | the public URL the browser reaches the API on — **recommended: same host, `https://possibility.develyst.online/api/v1` reverse-proxied to the BE port**, so the session cookie is first-party and CORS is moot |
| FE build | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | same public client id as local |
| BE (`possibility-back/.env`) | `FRONTEND_ORIGIN` | `https://possibility.develyst.online` |
| BE | `NODE_ENV` | `production` → cookie gets `Secure` (required over https) |
| BE | `DATABASE_URL`, `SESSION_SECRET`, `GOOGLE_CLIENT_ID`, `ADMIN_EMAIL`, `AI_GATEWAY_URL` | as local; a **different `SESSION_SECRET`** on SIT is fine and expected (QA-minted local cookies will not work there — by design) |
| BE | `PORT` | whatever the proxy forwards to |
| If the API is on a **different host** than the FE | cookie | must become `SameSite=None; Secure` and CORS must allow the FE origin with credentials — avoid by proxying under the same host (row 2) |
**DR-8 confirmed (owner, 2026-09-22):** the API on SIT is `https://possibility.develyst.online/api/v1` — same host; the cookie stays `SameSite=Lax`, no CORS concern.
