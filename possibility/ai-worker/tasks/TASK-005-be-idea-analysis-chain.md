# TASK-005: BE — idea submission, 5-step AI chain, tier computation, ideas endpoints
- Source: SPEC-003
- Owner: BE (Jason)
- Status: DONE
- Depends on: TASK-003

## What to do
Read SPEC-003 fully first. The chain is approved — build all of it. Order: TASK-003 proof → this.
1. `config/ai-steps.json` (SPEC-003 defaults) + `config/company-reference.md` (placeholder line, marked `<!-- PLACEHOLDER: replaced by the owner, SPEC-003 DR-5 -->`). `src/ai/config.ts`: load both at startup (paths from `AI_STEPS_CONFIG` / `COMPANY_REFERENCE_PATH`, defaults `./config/…`), zod-validate the five step entries, fetch `GET {AI_GATEWAY_URL}/models` once and reject any provider/model not listed — startup error names the step. Remove `AI_PROVIDER`/`AI_MODEL` from `src/env.ts` and `.env.example`; add the two optional paths.
2. `src/lib/ai-gateway.ts`: `chat(stepConfig, system, user) → { content, latencyMs }` via `POST /chat`, 30 s timeout, treats `success:false` and non-2xx as errors. Nothing else in the codebase may call the gateway.
3. `src/lib/tier.ts`: `TIER_ORDER`, `tierFromLowestScore(n)`, `discountFor(tier)`, `rank(tier)` — the REQ-001 R4/R6 tables, tested by a harness script with the REQ-001 AC-3 boundary list (39/40/59/60/74/75/89/90/0/100). **Also (SPEC-004):** add `discountPercent: discountFor(u.tier)` to `toUserDto` in `routes/auth.ts`.
4. Schema: `ideas`, `idea_steps` per SPEC-003 §Data Model → `drizzle/0001_ideas.sql`; apply (`bun --env-file=.env run db:migrate`).
5. `src/ai/prompts/<key>.ts` ×5 with `promptVersion = "2026-09-19.1"`; `src/services/analysis.ts` running the chain with parse/validate/retry-once and the ±15 rule; `src/services/ideas.ts` transaction (idea + steps + upward user tier).
6. `src/routes/ideas.ts` (`POST /ideas`, `GET /ideas`, `GET /ideas/:id`) and `src/routes/admin.ts` (`GET /admin/ideas/:id/steps`, `requireAdmin`), mounted under `/api/v1`. Codes/bodies exactly per SPEC-003 §API.

## Definition of Done
- [x] `drizzle/0001_ideas.sql` pasted + migrate output + both tables exist (0 rows).
- [x] Startup with a bogus model in `ai-steps.json` → exits naming the step — paste.
- [x] Tier harness: all REQ-001 AC-3 boundaries print the expected tier — paste.
- [x] Real run: `POST /ideas` with a signed-in cookie and a ~200-char idea → 201 body pasted (scores, tier, reason in `lang`), plus the 5 `idea_steps` rows (step, provider, model, latency_ms) — paste a `select`.
- [x] Recompute by hand: min(scores) → tier matches `ideaTier`; `discountPercent` matches REQ-001 R6 — state it.
- [x] `AI_GATEWAY_URL` pointed at a dead port → 502 `AI_FAILED` and `select count(*) from ideas` unchanged — paste both (AC-7/AC-12).
- [x] Change one step's model in `ai-steps.json`, restart, submit again → that step's row shows the new model, the others unchanged — paste (AC-11).
- [x] `GET /ideas/:id` with a second user's cookie → 404 — paste (AC-6). `GET /admin/ideas/:id/steps` with a non-admin cookie → 404; with `siegkung@gmail.com` → 200 — paste (or `UNVERIFIED — need the admin account signed in` if you cannot).
- [x] Text of 19 chars → 400 `IDEA_TOO_SHORT`; 3001 chars → 400 `IDEA_TOO_LONG` — paste.

## Implementation Notes
(Jason, 2026-09-19 — all code written; nothing applied to any database; no git writes)

**Files in `possibility-back`:** `config/ai-steps.json` (SPEC-003 defaults) · `config/company-reference.md` (placeholder, marked) · `src/ai/config.ts` (`loadAiConfig()` — zod-validates the 5 steps, `GET /models` once, rejects unknown provider/model naming the step; `stepConfig()`, `getCompanyReference()`) · `src/env.ts` + `.env.example` (`AI_PROVIDER`/`AI_MODEL` removed; optional `AI_STEPS_CONFIG`, `COMPANY_REFERENCE_PATH` with `./config/…` defaults) · `src/lib/ai-gateway.ts` (`chat()` — the only gateway caller; 30 s timeout; non-2xx / `success:false` / malformed → `AiGatewayError`, gateway error text kept) · `src/lib/tier.ts` (R4/R6 tables, `TIER_ORDER`, `tierFromLowestScore`, `discountFor`, `rank`) · `src/db/schema.ts` (`ideas`, `idea_steps`) → `drizzle/0001_ideas.sql` · `src/ai/prompts/{shared,understand,goalClarity,goodForWorld,companyFit,synthesis}.ts` (`promptVersion = "2026-09-19.1"`, no thresholds in any prompt) · `src/services/analysis.ts` (chain in order, strip fences → parse → zod (`.strip()`, no coercion) → retry once → `AnalysisError(step)`; ±15 rule on S5; 120 s budget) · `src/services/ideas.ts` (one transaction: idea + 5 steps + upward user tier; log line without idea text) · `src/routes/ideas.ts` (`POST /`, `GET /`, `GET /:id` — 404 for not-mine) · `src/routes/admin.ts` (`GET /ideas/:id/steps`, `requireAdmin`) · `src/routes/auth.ts` (`discountPercent` in User DTO, SPEC-004) · `src/index.ts` (loads AI config before listening; mounts `/api/v1/ideas`, `/api/v1/admin`). `bunx tsc --noEmit` clean. `grep -rl "AI_GATEWAY_URL\|/chat" src/` → only `ai/config.ts`, `env.ts`, `lib/ai-gateway.ts`.

**Migration `drizzle/0001_ideas.sql`** (generated `drizzle-kit generate --name ideas`; matches SPEC-003 §Data Model — CHECKs on lang/scores/idea_tier, FK user_id, FK idea_id ON DELETE CASCADE, UNIQUE (idea_id, step), index `ideas_user_created_idx (user_id, created_at DESC)`; `numeric(3,2)` temperature; jsonb output). Full text in the file — 45 lines, not repeated here.
**UNVERIFIED — apply + both tables exist (0 rows):** blocked on TASK-003 Q-2 (`possibility_db` does not exist on SIT). I apply `0000` + `0001` together once it exists.

**Startup — bogus model (AC-11 guard), real gateway `GET /models`, dummy DB:**
```
$ AI_STEPS_CONFIG=<copy with goodForWorld.model="gemini-9000"> bun run src/index.ts
AI config error: ai-steps step "goodForWorld": model "gemini-9000" is not offered by provider "gemini" (gateway lists: gemini-2.5-pro, gemini-2.5-flash, gemini-2.5-flash-lite, gemini-1.5-pro, gemini-1.5-flash)
exit=1
$ AI_GATEWAY_URL=http://127.0.0.1:1 bun run src/index.ts
AI config error: Unable to connect. Is the computer able to access the url?
exit=1
$ (default config, real gateway) bun run src/index.ts
Started development server: http://localhost:4000
```
**Tier harness** `ai-worker/tests/harness/task-005-tier-boundaries.ts`:
```
PASS lowest= 39 → Ordinary        discount=0% rank=0
PASS lowest= 40 → Seeker          discount=5% rank=1
PASS lowest= 59 → Seeker          discount=5% rank=1
PASS lowest= 60 → Raw Diamond     discount=10% rank=2
PASS lowest= 74 → Raw Diamond     discount=10% rank=2
PASS lowest= 75 → Visionary       discount=20% rank=3
PASS lowest= 89 → Visionary       discount=20% rank=3
PASS lowest= 90 → The Possibility discount=30% rank=4
PASS lowest=  0 → Ordinary        discount=0% rank=0
PASS lowest=100 → The Possibility discount=30% rank=4
ALL PASS
```
**Chain dry run against the REAL gateway, no DB** (`ai-worker/tests/harness/task-005-chain-dry-run.ts` calls `analyseIdea` directly — it writes nothing). First attempt with SPEC defaults:
```
error: AI_FAILED: step goodForWorld — gateway HTTP 500   (failed twice = retry-once proven)
$ curl …/chat {"provider":"gemini","model":"gemini-2.5-flash",…}
{"success":false,"error":"Gemini API error 403: … \"Your project has been denied access. Please contact support.\" PERMISSION_DENIED"}
```
→ the owner's gateway cannot currently serve **gemini** (Q-1 below). Second run, config override only (`AI_STEPS_CONFIG` copy with `goodForWorld` → `openai/gpt-4o-mini`, no code change — the AC-11 mechanism), ~200-char idea, `lang=th`:
```
1 understand   openai/gpt-4o-mini 1613ms output={"summary":"A mobile app for sharing agricultural equipment among small farmers…","wantsWhat":…}
2 goalClarity  openai/gpt-4o-mini 1439ms output={"clarity":90,"missing":[],"feasibilityNotes":"The goal is clear and specific…"}
3 goodForWorld openai/gpt-4o-mini 1794ms output={"benefit":90,"whoBenefits":"Small farmers in rural Thailand","harms":[]}
4 companyFit   openai/gpt-4o     1914ms output={"fit":85,"systemType":"Mobile App","reason":"The project aligns well with our expertise…"}
5 synthesis    openai/gpt-4o     1695ms output={"feasibility":90,"impact":90,"interestingness":85,"reason":"แอปพลิเคชันนี้มีความชัดเจน…"}
scores: 90 90 85 | reason (Thai, 3 sentences)
min=85 → ideaTier=Visionary discount=20% total=8960ms
```
Hand recompute: min(90, 90, 85) = 85 → 75–89 → **Visionary**, R6 discount **20 %** — matches. ±15 rule: 90 vs clarity 90, 90 vs benefit 90, 85 vs fit 85 — within bounds.

**HTTP, server up with dummy DB:** `POST/GET /api/v1/ideas`, `GET /ideas/:id`, `GET /admin/ideas/:id/steps` without a cookie → all `401 {"error":{"code":"NOT_SIGNED_IN",…}}` (requireUser/requireAdmin run before anything else).

**UNVERIFIED — need `possibility_db` (TASK-003 Q-2) and a signed-in cookie (real Google token, TASK-003):** `POST /ideas` 201 via HTTP + the 5 `idea_steps` rows `select`; `IDEA_TOO_SHORT` (19 chars) / `IDEA_TOO_LONG` (3001) — these sit behind `requireUser`, which needs a user row; dead-port → 502 + `count(*)` unchanged; per-step model change reflected in rows; `GET /ideas/:id` as a second user → 404; admin 404/200. Each is one curl once the DB exists; I run them all in one sitting.


### Rework + DB proof (Jason, 2026-09-19 11:50)
**Rework 1** — `config/ai-steps.json`: `goodForWorld` → `openai/gpt-4o-mini` (temperature 0.3 kept). **Rework 2** — `src/ai/config.ts`: `/models` fetched with a 10 s timeout; unreachable → one `console.warn` and start with the file config; reachable → strict rejection unchanged. `tsc` clean.
```
$ AI_GATEWAY_URL=http://127.0.0.1:1 bun --env-file=.env run src/index.ts
WARN: AI gateway GET /models unreachable (Unable to connect. Is the computer able to access the url?) — skipping provider/model check, using ./config/ai-steps.json as-is
Started development server: http://localhost:4000
$ AI_STEPS_CONFIG=<copy with gemini-9000> bun --env-file=.env run src/index.ts     # still strict when reachable
AI config error: ai-steps step "goodForWorld": model "gemini-9000" is not offered by provider "gemini" (…)   exit=1
```
**Migration applied** (with `0000`, see TASK-003 proof run 2): `bun --env-file=.env x drizzle-kit migrate` → exit 0; `possibility_db` public tables `users / ideas / idea_steps`, all 0 rows.

**Dev fixture (declared, D8b):** two users on `possibility_db` — `dev-jason-a@example.com` (`google_sub dev-jason-sub-a`) and `dev-jason-b@example.com` (`…-b`), created by `ai-worker/tests/harness/task-005-dev-fixtures.ts` (idempotent upsert; also prints a session cookie each). Plus the 3 ideas below (15 `idea_steps`). I created them; I will not delete rows I did not create. Tanya may reuse or ignore them.

**Validation (cookie A):**
```
19 chars   → {"error":{"code":"IDEA_TOO_SHORT","message":"Idea must be at least 20 characters"}}
3001 chars → {"error":{"code":"IDEA_TOO_LONG","message":"Idea must be at most 3000 characters"}}
lang "fr"  → {"error":{"code":"VALIDATION_FAILED","message":"text (string) and lang (th|en) are required"}}
no cookie  → 401 NOT_SIGNED_IN on POST/GET /ideas, GET /ideas/:id, GET /admin/ideas/:id/steps
```
**Real run — `POST /ideas` (A, `lang=th`, 199-char idea) → 201 in 9.16 s:**
```
{"idea":{"id":"b5a3d271-bc09-44d8-8604-82b0bc89fee5","text":"A mobile app that lets small farmers…","lang":"th",
 "scores":{"feasibility":90,"impact":85,"interestingness":85},"ideaTier":"Visionary","discountPercent":20,
 "reason":"โครงการนี้มีความชัดเจนและสามารถพัฒนาได้จริง มีประโยชน์ต่อเกษตรกรรายย่อยในชนบทไทย และสอดคล้องกับความเชี่ยวชาญของบริษัทเราในการพัฒนาแอปพลิเคชันมือถือ",
 "hireRequested":false,"createdAt":"2026-09-19T04:39:30.068Z"},"userTier":"Visionary"}
```
`select` (harness `task-005-select.ts`, read-only):
```
ideas count: 1 | idea_steps count: 5 | users count: 2
  1 understand   openai/gpt-4o-mini max=500 temp=0.20 v=2026-09-19.1 3234ms output:object
  2 goalClarity  openai/gpt-4o-mini max=400 temp=0.20 v=2026-09-19.1 1141ms output:object
  3 goodForWorld openai/gpt-4o-mini max=400 temp=0.30 v=2026-09-19.1  830ms output:object
  4 companyFit   openai/gpt-4o      max=400 temp=0.20 v=2026-09-19.1 1486ms output:object
  5 synthesis    openai/gpt-4o      max=600 temp=0.20 v=2026-09-19.1 1510ms output:object
  idea: {"feasibility":90,"impact":85,"interestingness":85,"idea_tier":"Visionary","lang":"th"}
  user: dev-jason-a@example.com Visionary      ← tier raised Ordinary → Visionary in the same transaction (REQ-001 R5)
  user: dev-jason-b@example.com Ordinary
```
**Hand recompute:** min(90, 85, 85) = 85 → 75–89 → **Visionary**; R6 → **20 %**. Both match `ideaTier` / `discountPercent`.
Second idea (B, `lang=en`, a trivial one-page site) → 201, scores 90/10/20 → **Ordinary / 0 %** (min 10 < 40 ✔), English reason; B stays Ordinary.

**Ownership / admin (AC-6, SPEC-002 §9):**
```
GET /ideas                       (A) → 200 {"ideas":[{"id":"b5a3d271-…","textPreview":"<80 chars>","ideaTier":"Visionary","createdAt":…}]}
GET /ideas/b5a3d271-…            (A) → [200]
GET /ideas/b5a3d271-…            (B) → {"error":{"code":"NOT_FOUND","message":"Not found"}} [404]
GET /admin/ideas/b5a3d271-…/steps (A, non-admin) → {"error":{"code":"NOT_FOUND","message":"Not found"}} [404]
```
**UNVERIFIED — admin 200 with `siegkung@gmail.com`:** needs the admin account signed in via Google; I will not insert a fixture row with the owner's email (it would collide with his real first sign-in on `email UNIQUE`). Tanya/owner via FE.

**AC-7 / AC-12 — gateway dead port, server started (WARN), then submit:**
```
POST /ideas (A) → {"error":{"code":"AI_FAILED","message":"AI_FAILED: step understand — gateway unreachable: Unable to connect…"}} [502]
counts after: ideas count: 2 | idea_steps count: 10      ← unchanged (2 ideas / 10 steps before the call)
```
**AC-11 — `companyFit` model `gpt-4o` → `gpt-4.1` via `AI_STEPS_CONFIG` copy only (no code change), restart, submit (A, en):**
```
  4 companyFit   openai/gpt-4.1     max=400 temp=0.20 …    ← changed
  1,2,3,5 unchanged (gpt-4o-mini / gpt-4o as before)
  idea: {"feasibility":85,"impact":85,"interestingness":90,"idea_tier":"Visionary","lang":"en"}
```
Server log lines per analysis carry `idea.id user.id step=provider/model/ms … scores tier`; no idea text (checked in `/tmp` log).

DoD: migration ✔ · bogus model ✔ · tier harness ✔ · real run + select ✔ · hand recompute ✔ · dead port 502 + unchanged ✔ · model change ✔ · not-mine 404 ✔ · admin non-admin 404 ✔ / admin 200 UNVERIFIED · 19/3001 chars ✔.

## Questions
- **Q-1 DATA REQUEST @Sober (Jason, 2026-09-19):** the gateway's **gemini** provider returns `403 PERMISSION_DENIED — "Your project has been denied access"` from Google (probed once, output above). SPEC-003's default for `goodForWorld` is `gemini/gemini-2.5-flash`, so **with the shipped `config/ai-steps.json` every analysis fails at step 3**. Options: (a) the owner fixes the Gemini key/project on the gateway; (b) SPEC-003 default for `goodForWorld` becomes `openai/gpt-4o-mini` (proven above) until (a). I have NOT changed the committed config — say which.
  > answer (Sober, 2026-09-19): (b) now — SPEC-003 default for `goodForWorld` is amended to `openai/gpt-4o-mini`; change the committed `config/ai-steps.json` to match. (a) is raised to the owner via Porter as gateway issue G-1; when fixed he flips the JSON himself.
- **Q-2 @Sober (Jason, 2026-09-19):** SPEC-003 §Non-functional says Tanya proves AC-7 by pointing `AI_GATEWAY_URL` at a dead port — but the same SPEC's startup `GET /models` check makes the server **refuse to start** in that case (output above), so the 502 path is never reached that way. The 502 path itself is proven at request time by the gemini failure (`AI_FAILED: step goodForWorld`). Do you want (a) keep strict startup (AC-7 then tested by stopping/blocking the gateway after startup, or a valid-listed model the gateway rejects), or (b) startup only warns when `/models` is unreachable? I kept (a) as written.
  > answer (Sober, 2026-09-19): (b) — good catch. SPEC-003 §Non-functional amended: `/models` reachable → strict as you built it; unreachable → one WARN line and start. Then Tanya's dead-port AC-7 works as written.

## Review
**Review (Sober, 2026-09-19 10:40) — REWORK, two small items; everything else accepted.**
Checked against the files: `analysis.ts` (retry-once loop, `MAX_DEVIATION = 15`, `.strip()` no coercion), `ideas.ts` (single `db.transaction`, `rank()` upward-only update), `config.ts` (per-step validation against `/models`), prompts (grep for thresholds → none), `tier.ts` harness ALL PASS, real-gateway dry run recomputed by hand → Visionary/20 % correct. Gateway is called from one file only. Good work.
Rework:
1. `config/ai-steps.json`: `goodForWorld` → `openai/gpt-4o-mini` (SPEC-003 amendment; Q-1).
2. `src/ai/config.ts`: when `GET /models` is unreachable (network error / timeout), `console.warn` once and continue with the file config; keep the strict rejection when the gateway answers (SPEC-003 §Non-functional amendment; Q-2). Evidence: `AI_GATEWAY_URL=http://127.0.0.1:1 bun run src/index.ts` now starts with a WARN line — paste.
Then back to REVIEW. The DB-dependent DoD lines stay UNVERIFIED until `possibility_db` exists (TASK-003 Q-2 → owner).
**Verdict: DONE** (Sober, 2026-09-20 23:15). Both rework items verified in the files (`ai-steps.json` step 3 = `openai/gpt-4o-mini`; `config.ts` warns and starts when `/models` is unreachable, strict when reachable — both outputs pasted). Full DB DoD run against `possibility_db`: 3 real analyses (Visionary/20 %, Ordinary/0 %, Visionary — all recomputed by hand from the shown scores), 5 `idea_steps` per idea with per-step provider/model/latency, upward-only tier proven (A Ordinary→Visionary in-transaction, B stays Ordinary), dead-port → 502 with counts unchanged, AC-11 model swap via config only, not-mine 404, non-admin 404, 19/3001-char 400s. One line stays `UNVERIFIED — admin 200 needs siegkung@gmail.com signed in` → Tanya/owner via FE; correct call not to fake the owner's email row. Fixtures declared (2 users, 3 ideas, 15 steps).
