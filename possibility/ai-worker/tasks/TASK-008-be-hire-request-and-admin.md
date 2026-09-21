# TASK-008: BE — hire_requests table, hire endpoint, admin list + contacted PATCH
- Source: SPEC-005
- Owner: BE (Jason)
- Status: DONE
- Depends on: TASK-005

## What to do
Read SPEC-005 first. Start when TASK-005 is DONE (Sober sets this TODO).
1. Schema `hire_requests` per SPEC-005 §Data Model → `drizzle/0002_hire_requests.sql`; apply.
2. `src/services/hire-requests.ts`: `create(userId, ideaId)` (idea must be user's → else not-found; insert snapshot from `user.tier` + `discountFor`; unique violation → `ALREADY_EXISTS`), `listForAdmin()` (join users + ideas, newest first), `setContacted(id, contacted)`.
3. Routes: `POST /ideas/:id/hire-request` in `routes/ideas.ts`; `GET /admin/hire-requests`, `PATCH /admin/hire-requests/:id` in `routes/admin.ts` (`requireAdmin`). DTOs exactly per SPEC-005 §Shapes.
4. `Idea` DTO: `hireRequested` = row exists (SPEC-003 shape already has the field).
5. One log line per request (no idea text).

## Definition of Done
- [x] `0002_hire_requests.sql` pasted + migrate output + table exists.
- [x] As user A with an analysed idea: `POST /ideas/:id/hire-request` → 201 body; second call → 409 `ALREADY_EXISTS`; `select count(*)` = 1 — paste all.
- [x] `GET /ideas/:id` now shows `"hireRequested": true` — paste.
- [x] As user B: `POST /ideas/<A's id>/hire-request` → 404 — paste.
- [x] Admin list as `siegkung@gmail.com` cookie → 200 with the row (user, idea preview 120 chars, scores, tiers, discount, contactedAt null); as user A → 404 — paste both (or `UNVERIFIED — Tanya via FE` for the admin cookie if you cannot sign in as the owner).
- [x] `PATCH … {"contacted":true}` → `contactedAt` set; `{"contacted":false}` → null — paste.
- [x] AC-5 proof: after A's user tier rises (submit a higher idea), `GET /admin/hire-requests` still shows the old `userTierAtRequest`/discount — paste.

## Implementation Notes
(Jason, 2026-09-20 — no git writes; owner's `.env`, values never printed)

**Files in `possibility-back`:** `src/db/schema.ts` (`hireRequests` per SPEC-005 §Data Model) → `drizzle/0002_hire_requests.sql` · `src/services/hire-requests.ts` (`createHireRequest` — idea must be mine else null→404, snapshot `user.tier` + `discountFor`, UNIQUE violation → `HireRequestExists`; `hireRequestedIdeaIds`; `listForAdmin` join users+ideas newest first; `setContacted`) · `src/routes/ideas.ts` (`POST /:id/hire-request` 201/409/404; `toIdeaDto` now takes `hireRequested` = row exists; `toHireRequestDto`) · `src/routes/admin.ts` (`GET /hire-requests`, `PATCH /hire-requests/:id` with zod body; `AdminHireRequest` DTO, `textPreview` 120 chars). One log line per request, no idea text. `bunx tsc --noEmit` clean. `grep -rn password src/` → nothing.

**Migration `drizzle/0002_hire_requests.sql`** (generated `--name hire_requests`; matches SPEC — UNIQUE(idea_id), FKs, CHECKs on tier and discount ∈ {0,5,10,20,30}, index `created_at DESC`):
```sql
CREATE TABLE "hire_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"idea_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"user_tier_at_request" text NOT NULL,
	"discount_percent_at_request" integer NOT NULL,
	"contacted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hire_requests_idea_id_unique" UNIQUE("idea_id"),
	CONSTRAINT "hire_requests_user_tier_at_request_check" CHECK ("hire_requests"."user_tier_at_request" IN ('Ordinary','Seeker','Raw Diamond','Visionary','The Possibility')),
	CONSTRAINT "hire_requests_discount_percent_at_request_check" CHECK ("hire_requests"."discount_percent_at_request" IN (0,5,10,20,30))
);
ALTER TABLE "hire_requests" ADD CONSTRAINT "hire_requests_idea_id_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id");
ALTER TABLE "hire_requests" ADD CONSTRAINT "hire_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");
CREATE INDEX "hire_requests_created_idx" ON "hire_requests" USING btree ("created_at" DESC NULLS LAST);
```
```
$ bun --env-file=.env x drizzle-kit migrate
[✓] migrations applied successfully!   exit=0
$ bun --env-file=.env run tests/harness/db-tables.ts
hire_requests rows=0 | idea_steps rows=15 | ideas rows=3 | users rows=2
```
**Fixtures used** (declared): dev users A `dev-jason-a@example.com` / B `dev-jason-b@example.com` from TASK-005; B's idea `c7645adc-…` (Ordinary). New rows this task: 1 `hire_requests` row (`5500ab47-…`), 1 more idea by B (+5 steps) for AC-5.

**User B (Ordinary) on own idea:**
```
GET  /ideas/c7645adc-…                → "hireRequested":false
POST /ideas/c7645adc-…/hire-request   → {"hireRequest":{"id":"5500ab47-…","ideaId":"c7645adc-…","userTierAtRequest":"Ordinary","discountPercentAtRequest":0,"contactedAt":null,"createdAt":"2026-09-20T16:14:15.318Z"}} [201]
POST (second call)                    → {"error":{"code":"ALREADY_EXISTS","message":"A hire request already exists for this idea"}} [409]
GET  /ideas/c7645adc-…                → "hireRequested":true
select count(*) from hire_requests    → 1
server log: hire-request hireRequest.id=5500ab47-… idea.id=c7645adc-… user.id=c141f1bf-… tier=Ordinary
```
(First run of the second call returned **500** — drizzle wraps `PostgresError` in `DrizzleQueryError`, pg `code` sits on `cause`. Fixed in `createHireRequest`, re-run → 409 above.)

**User A on B's idea / no cookie / non-admin:**
```
POST /ideas/c7645adc-…/hire-request (A)        → {"error":{"code":"NOT_FOUND","message":"Not found"}} [404]
POST … (no cookie)                             → 401 NOT_SIGNED_IN
GET  /admin/hire-requests (A, non-admin)       → 404 NOT_FOUND
PATCH /admin/hire-requests/<any> (A, non-admin)→ 404 NOT_FOUND
```
**Admin list + PATCH — run with `ADMIN_EMAIL=dev-jason-a@example.com` set in the SHELL for that server process only** (env override, no DB row with the owner's email, `.env` untouched), cookie A:
```
GET /admin/hire-requests → [200]
{"hireRequests":[{"id":"5500ab47-…","ideaId":"c7645adc-…","userTierAtRequest":"Ordinary","discountPercentAtRequest":0,"contactedAt":null,"createdAt":"2026-09-20T16:14:15.318Z",
  "user":{"displayName":"Dev Jason B","email":"dev-jason-b@example.com"},
  "idea":{"id":"c7645adc-…","text":"I want a simple website…","textPreview":"<≤120 chars>","scores":{"feasibility":90,"impact":10,"interestingness":20},"ideaTier":"Ordinary","createdAt":"2026-09-19T04:39:53.564Z"}}]}
PATCH {"contacted":true}   → "contactedAt":"2026-09-20T16:15:01.911Z"   (again → 200, no-op)
PATCH {"contacted":false}  → "contactedAt":null
PATCH {"contacted":"yes"}  → {"error":{"code":"VALIDATION_FAILED","message":"contacted (boolean) is required"}} [400]
PATCH unknown id           → 404 NOT_FOUND
GET /admin/hire-requests (B, still non-admin) → 404
```
**UNVERIFIED — admin as the real `siegkung@gmail.com` cookie:** Tanya/owner via FE (same as TASK-005's line). The routes themselves are proven above; only the identity differs.

**AC-5 — snapshot survives a tier rise:** B submits the farmers idea → `"ideaTier":"Visionary","userTier":"Visionary"`; then
```
GET /admin/hire-requests → "userTierAtRequest":"Ordinary","discountPercentAtRequest":0     ← unchanged
select: user_tier_at_request=Ordinary discount=0 … user_tier_now=Visionary
```
DoD: migration ✔ · 201/409/count=1 ✔ · hireRequested true ✔ · B's idea as A → 404 ✔ · admin list 200 (env-override admin) ✔ / real owner cookie UNVERIFIED · non-admin 404 ✔ · PATCH true/false ✔ · AC-5 ✔.

## Questions

## Review
**Verdict: DONE** (Sober, 2026-09-20 23:25). Migration matches SPEC-005 §Data Model (UNIQUE idea_id, tier + discount CHECKs, FKs, DESC index) and is applied. Endpoints proven on `possibility_db`: 201 → 409 with count 1, `hireRequested` flips, not-mine 404, no-cookie 401, non-admin 404 on both admin routes, PATCH true/false/invalid/unknown, and the AC-5 snapshot surviving B's rise to Visionary. Code check: the 23505-on-`cause` fix is in `services/hire-requests.ts` (good catch on the 500), admin router applies `requireAdmin` at `.use("*")`. The env-override admin proof is acceptable for the routes; the identity line (real `siegkung@gmail.com`) stays with Tanya via FE, as on TASK-005. Fixtures declared.
