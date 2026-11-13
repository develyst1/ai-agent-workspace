# SPEC-003: Code-standard audit of release 1, and the refactor (no behaviour change)
- Source: `DECISIONS.md` 2026-11-09 14:59 (owner, via Atom: *"เขียน code ให้ professional นะ scalable , reusable , clean , config , ไม่มีการ hardcode ทั้ง front + back …"*) · REQ-001 §Constraints · SPEC-002
- Status: ACTIVE
- Author: Sober (SA), 2026-11-09
- Read for this audit (2026-11-09, branch `atom`, both trees uncommitted on top of the initial commits): `god-plan-back/src/**` (grep for numeric
  literals, URLs and hosts; read `src/env.ts`, `src/app.ts`, `src/index.ts`, `src/ai/*`, `src/auth/session.ts`, the routes) · `god-plan-front/src/**`,
  `next.config.ts` (same grep; read `src/lib/api.ts`, `src/lib/limits.ts`, `src/app/api/[...path]/route.ts`, the pages) · the owner's skill
  `nextjs-heroui-pattern` §Folder Structure, §Data Flow, §Naming, §Key Rules.

## Rule: what counts as "config" here, and what doesn't `[SA-decided, under DECISIONS 14:59]`
1. **Operational settings → env, with a validated default, listed in `.env.example`:** hosts, ports, origins, timeouts, rate limits, lifetimes,
   body size, AI model / provider / tokens / temperature. These can differ per machine or environment without a code change.
2. **Product rules that are part of the contract or the database → one constants module per repo, never scattered literals:** the D16 field
   limits, password min/max, bulk max, proposal and summary caps. They are **not** env, because the DB CHECKs in the migration enforce them;
   changing one is a REQ + migration, not a setting. The front keeps its own copy, because two repos can't share a module; SPEC-002 is
   the single written source.
3. **Thai UI text** stays in `strings.th.ts` (PM's reading in DECISIONS 14:59). HTTP status codes in the code become named constants or helpers.
4. **Fail loudly on missing required config.** No hidden fallback to a developer's address (e.g. the front's `?? "http://127.0.0.1:4310"`).
5. **Behaviour unchanged.** Every default equals today's value, so a run without the new keys behaves exactly as now.

## Findings
### Back (`god-plan-back`)
| # | Where (read 2026-11-09) | What is hardcoded | Action |
|---|---|---|---|
| B1 | `src/index.ts:16` | `idleTimeout: 30` | env `SERVER_IDLE_TIMEOUT_S` (default 30) |
| B2 | `src/auth/session.ts:9` | session lifetime 30 days | env `SESSION_TTL_DAYS` (default 30) |
| B3 | `src/ai/gateway.ts:6` | `AI_TIMEOUT_MS = 25_000` | env `AI_TIMEOUT_MS` (default 25000) |
| B4 | `src/ai/guards.ts:6–7` | window 60 000 ms, 10 presses | env `AI_RATE_WINDOW_MS` (60000), `AI_RATE_MAX` (10) |
| B5 | `src/ai/routes.ts:73,91` + gateway | `max_tokens` 600 / 800, temperature 0.3 | env `AI_MAX_TOKENS_SUMMARY` (600), `AI_MAX_TOKENS_PROPOSALS` (800), `AI_TEMPERATURE` (0.3) |
| B6 | gateway request | provider/model not settable | optional env `LLM_PROVIDER`, `LLM_MODEL` (unset = the gateway's default chain, as today) |
| B7 | `src/app.ts:23` | `BODY_MAX_BYTES = 64 * 1024` | env `BODY_MAX_BYTES` (default 65536) |
| B8 | routes: `tasks` 55/69/70/90/97/99, `projects` 55/56, `comments` 43, `invites` 29/74, `validate` 45/51; `ai/routes` 11–13; `schema.ts` CHECKs | the D16 and product limits as literals in many files | one module `src/config/limits.ts`, imported by routes, validation, AI parsing **and** `schema.ts` (the regenerated migration must be **identical**, with no new migration) |
| B9 | `src/env.ts` | config spread between `env.ts` and module constants | move it to `src/config/env.ts` (one typed `Config` object passed through `createApp` deps). Boot check of the invariant **`AI_TIMEOUT_MS < SERVER_IDLE_TIMEOUT_S × 1000`**, else exit naming both keys |

### Front (`god-plan-front`)
| # | Where | What | Action |
|---|---|---|---|
| F1 | `src/app/api/[...path]/route.ts:19` | `BACK_ORIGIN ?? "http://127.0.0.1:4310"`: a hidden fallback | server config `BACK_ORIGIN` **required**. If missing, the route answers `502 UPSTREAM_UNAVAILABLE` and logs once `BACK_ORIGIN is not set` (no value) |
| F2 | `route.ts:9` | `BOUND_MS = 27_000` | server env `API_PROXY_TIMEOUT_MS` (default 27000) |
| F3 | `src/lib/api.ts:42` | `TIMEOUT_MS = 28_000` | client env `NEXT_PUBLIC_API_TIMEOUT_MS` (default 28000; build-time, documented as such) |
| F4 | `src/lib/limits.ts` | the right idea, wrong home | move to `src/config/limits.ts` (no value change) |
| F5 | pages: `page.tsx`, `projects/[id]/page.tsx`, `members`, `summary`, `invite`, `reset`, `thread.tsx` | raw `401/403/404/409/410` checks + the same load / missing / fatal pattern repeated 5+ times | `src/lib/api/http-status.ts` (named constants + `isNotFound(err)` etc.), and one hook `src/hooks/common/useLoad.ts` for the repeated page-load pattern |
| F6 | `src/lib/api.ts` (one file: transport + every endpoint + error mapping) | mixes layers | split per the skill's data flow: `src/lib/api/client.ts` (the `call()` transport), `src/lib/api/api-main.ts` (endpoint functions, SPEC-002 names), `src/lib/api/errors.ts` (`messageFor`, `aiMessageFor`); `src/types/api/main/*.ts` for the shapes |
| F7 | `src/components/*` flat | not in the skill's layout | `components/partials/<Feature>/` (`ProjectBoard`, `Thread`, `AiPanel`, `Members`, `Summary`, …, each with `index.ts`) and `components/ui/` for any thin HeroUI wrapper. Barrels per directory. `@/` imports only |

**Not taken from the skill, on purpose `[SA-decided]`:** NextAuth (the back owns the session), axios (fetch + our bounded `call()`), React Query
(a state-model change: it would alter loading and caching behaviour, and this refactor promises none). Its v2 provider samples: we stay on the v3 API
(SPEC-002 front line). Revisit React Query in a later REQ if wanted.

## Environment keys (additions)
**Back `.env.example`:** `SERVER_IDLE_TIMEOUT_S`, `SESSION_TTL_DAYS`, `AI_TIMEOUT_MS`, `AI_RATE_WINDOW_MS`, `AI_RATE_MAX`, `AI_MAX_TOKENS_SUMMARY`,
`AI_MAX_TOKENS_PROPOSALS`, `AI_TEMPERATURE`, `LLM_PROVIDER`, `LLM_MODEL`, `BODY_MAX_BYTES`. Each has one comment line with its default, and no
value. **Front `.env.example`:** `BACK_ORIGIN` (required), `API_PROXY_TIMEOUT_MS`, `NEXT_PUBLIC_API_TIMEOUT_MS`.
**Timeout chain stays** 25 < 27 < 28 < 30 by default. The back enforces its half at boot. The front documents its half in `.env.example`.

## Tasks
- TASK-016: back config + limits refactor (B1–B9). Owner: BE. Depends on: none.
- TASK-017: front config + structure refactor (F1–F7). Owner: FE. Depends on: none. It runs in parallel with TASK-016; the seam is untouched.
- Then QA regression (the PM's call): the same TEST-001 rounds on the refactored trees.

## Proof of "no behaviour change"
- Back: `bun test` unchanged count or more, all pass. `bun run db:generate` after B8 produces **no new migration** (the CHECK SQL is identical). Boot with
  no new keys → the same listening line.
- Front: `task-007/008/009.mjs` against `back-pglite` + `gateway-stub` all pass. `bun run build` passes. A checksum of `strings.th.ts` is unchanged.

## Questions
(none: every choice above is reversible and doesn't change what a user sees)
