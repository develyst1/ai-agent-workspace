# TASK-005: BE — idea submission, 5-step AI chain, tier computation, ideas endpoints
- Source: SPEC-003
- Owner: BE (Jason)
- Status: IN_PROGRESS (Jason 2026-09-19 — code + migration file; DB apply waits on TASK-003 Q-2)
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
- [ ] `drizzle/0001_ideas.sql` pasted + migrate output + both tables exist (0 rows).
- [ ] Startup with a bogus model in `ai-steps.json` → exits naming the step — paste.
- [ ] Tier harness: all REQ-001 AC-3 boundaries print the expected tier — paste.
- [ ] Real run: `POST /ideas` with a signed-in cookie and a ~200-char idea → 201 body pasted (scores, tier, reason in `lang`), plus the 5 `idea_steps` rows (step, provider, model, latency_ms) — paste a `select`.
- [ ] Recompute by hand: min(scores) → tier matches `ideaTier`; `discountPercent` matches REQ-001 R6 — state it.
- [ ] `AI_GATEWAY_URL` pointed at a dead port → 502 `AI_FAILED` and `select count(*) from ideas` unchanged — paste both (AC-7/AC-12).
- [ ] Change one step's model in `ai-steps.json`, restart, submit again → that step's row shows the new model, the others unchanged — paste (AC-11).
- [ ] `GET /ideas/:id` with a second user's cookie → 404 — paste (AC-6). `GET /admin/ideas/:id/steps` with a non-admin cookie → 404; with `siegkung@gmail.com` → 200 — paste (or `UNVERIFIED — need the admin account signed in` if you cannot).
- [ ] Text of 19 chars → 400 `IDEA_TOO_SHORT`; 3001 chars → 400 `IDEA_TOO_LONG` — paste.

## Implementation Notes

## Questions

## Review
