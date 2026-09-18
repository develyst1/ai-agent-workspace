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
| D3 | Frontend | **Next.js 16 + React 19 + Mantine**, architecture per workspace skill `nextjs-pattern-generator` | owner — **see Q-1 below: the skill has no Mantine variant** |
| D4 | AI | **The owner's gateway `https://ai.develyst.online`** — `POST /chat`, called only from the backend. Contract read from `bruno-ai-develyst` (read-only) | owner |
| D4a | Provider/model | `AI_PROVIDER=openai`, `AI_MODEL=gpt-4o`, `temperature 0.2`, `max_tokens 400` — env-configurable, never hard-coded | (Sober) — best plain-text JSON instruction-following among the four; swap by editing `.env` |
| D4b | Output handling | The gateway returns free text in `data.content`. The backend instructs the model to answer **only** a JSON object `{"feasibility":int,"impact":int,"interestingness":int,"reason":string}`, strips code fences, `JSON.parse`s, and validates: three integers 0–100, `reason` non-empty ≤ 3 sentences. Anything else = AI failure (REQ-003 R6/AC-7, REQ-001 AC-7): nothing saved, 502 `AI_FAILED`. One automatic retry on parse failure before giving up | (Sober) |
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
  .env.example            # DATABASE_URL, SESSION_SECRET, GOOGLE_CLIENT_ID, ADMIN_EMAIL, AI_GATEWAY_URL, AI_PROVIDER, AI_MODEL, FRONTEND_ORIGIN, PORT
```

## Frontend layout (D3, binding for TASK-002 once Q-1 is answered)
The `nextjs-pattern-generator` architecture as written: `app/ · components/{ui,common,layout,partials} · hooks/ · services/ · lib/api/ · types/ · context/`; `api-main.ts → service → hook (React Query) → partial`; `@/*` alias; thin server pages → `"use client"` Content components. Exact pinned versions per the skill's lockset (`next 16.2.9 · react 19.2.7 · react-dom 19.2.7 · @tanstack/react-query 5.101.0 · axios 1.17.0 · typescript 6.0.3`) plus the UI library from Q-1. i18n: a plain TH/EN dictionary in `lib/i18n/` with a `lang` cookie (REQ-005 R3); no third-party i18n lib.

## Risks recorded (not blockers)
- R-1 The gateway has **no authentication** as documented. Anyone who finds the URL can spend the owner's provider credits. Our BE will not fix that; noted for the owner.
- R-2 One shared DB for dev + test means a half-built feature can disturb Tanya's run. D8b is the only mitigation; the owner chose this knowingly.
- R-3 Plain-text JSON from a chat model will occasionally be malformed; D4b's validate-and-retry covers it and REQ-003 AC-7 shows the user W-6, never a wrong tier.

## Tasks
- TASK-001: Scaffold `possibility-back` (Bun + Hono + Drizzle + env + health route) — owner: BE (depends on: —)
- TASK-002: Scaffold `possibility-front` (Next.js 16 + Mantine per skill architecture) — owner: FE (depends on: Q-1 answer)

## Questions
- **Q-1 @Porter → owner (DATA REQUEST, blocks FE scaffold only):** the workspace skill `nextjs-pattern-generator` offers Ant Design (its house default), HeroUI, shadcn, MUI, Chakra, PrimeReact — **there is no Mantine variant**. Which does the owner want? (a) the skill's *architecture* with **Mantine** pinned by Sober (`@mantine/core` + `@mantine/hooks` latest 8.x, matches `FRONTEND-STANDARD.md`) — **Sober recommends (a)**; or (b) **Ant Design** exactly as the skill ships it. One word settles it.
- **DR-2 (open):** Google OAuth client ID with authorised JavaScript origin `http://localhost:3000`. Engineers can build against the env var name `GOOGLE_CLIENT_ID`; Tanya cannot test sign-in until the owner supplies the value.

## History
- 2026-09-18 v1 (DRAFT): Sober proposed NestJS · Postgres+Prisma · Next.js+Mantine · Anthropic `claude-opus-5` · BE-owned Google auth · REST camelCase · `develop` branch · Docker Postgres.
- 2026-09-18 v2 (ACTIVE): owner overrode D1–D4, D7, D8; accepted D5, D6. DR-1 (Anthropic key) and DR-3 (Docker) void.
