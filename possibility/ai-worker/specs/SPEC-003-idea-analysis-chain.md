# SPEC-003: Submit an idea → AI analysis chain → scores, tier, reason
- Source: REQ-003 v2 (R1–R10, AC-1..12); REQ-001 R3–R6 (score→tier rule, discounts — the computation lives here, the display ACs get SPEC-004); SYSTEM-FACTS §Idea intake, §AI analysis pipeline; SPEC-001 §D4/D4a/D4b/D6
- Status: ACTIVE — §Chain APPROVED by the owner 2026-09-19 ("โอเค", via Porter; SYSTEM-FACTS). DR-5 deferred: placeholder company reference stands until he writes the file.
- Author: Sober (SA), 2026-09-19

## Overview
A signed-in user posts free text. The backend runs a **chain of five AI calls** through the
owner's gateway, one step at a time, each with its own provider/model/maxTokens/temperature from
`config/ai-steps.json`. Each step returns strict JSON that we validate; every step's output is
kept. Step 5 produces the three axis scores and the reason; the **tier is computed by our code**
from the lowest score (REQ-001 R4), never by the AI. Only when all five steps succeed do we save
the idea, its steps, and (upward only) the user's tier — in one transaction. Any failure ⇒ nothing
saved, `502 AI_FAILED`, the user sees W-6 and can retry.

## Chain (Sober's redesign of the owner's 5-step example — for his approval)
I kept the owner's five steps 1:1 so he recognises them; what I added is a **fixed output for
each step** so later steps and our validation have something exact to consume, and a stated
mapping from steps to the three axes the user sees.

| # | key | Question (owner's words) | Input | Output JSON (validated) | Feeds |
|---|---|---|---|---|---|
| 1 | `understand` | *"วิเคราะห์ว่าที่ลูกค้าพิมพ์มาพยายามสื่ออะไร"* | idea text | `{ "summary": str, "wantsWhat": str, "forWhom": str, "why": str, "assumptions": [str] }` | 2–5 |
| 2 | `goalClarity` | *"เป้าหมายลูกค้าชัดมั้ย"* | text + S1 | `{ "clarity": 0–100, "missing": [str], "feasibilityNotes": str }` | 5 (feasibility) |
| 3 | `goodForWorld` | *"ลูกค้าต้องการไปทำเรื่องดีมีประโยชน์ต่อโลก ต่อมนุษย์มั้ย"* | text + S1 | `{ "benefit": 0–100, "whoBenefits": str, "harms": [str] }` | 5 (impact) |
| 4 | `companyFit` | *"เทียบกับข้อมูลของบริษัทเรา ตรงโจทย์ที่เราชอบหรือเปล่า"* | S1 + **company reference (DR-5)** | `{ "fit": 0–100, "systemType": str, "reason": str }` | 5 (interestingness) |
| 5 | `synthesis` | *"สรุปทุกข้อรวมกัน แล้วให้คะแนน"* | text + S1–S4 outputs + `lang` | `{ "feasibility": int 0–100, "impact": int 0–100, "interestingness": int 0–100, "reason": str }` | the user |

Rules that make it deterministic enough to test:
- **Axis mapping (Porter's reading, REQ-003 §Questions — confirmed here as the design):** feasibility ← S2 + S1, impact ← S3, interestingness ← S4 (fit) + novelty from S1. S5 is told these mappings and the intermediate numbers; it may deviate by at most ±15 from S2.clarity / S3.benefit / S4.fit — a larger deviation is a validation failure (retry once, then `AI_FAILED`). This stops S5 from ignoring the earlier steps.
- **Thresholds never appear in any prompt** (REQ-003 R7). Prompts are in `src/ai/prompts/<key>.ts`, versioned by a `promptVersion` string saved with each step output.
- **`reason`** ≤ 3 sentences, in `lang` (th/en); everything else in the chain is in English (cheaper, more stable); S5 is instructed to write `reason` in `lang` only.
- **Company reference (DR-5, owner-deferred):** `config/company-reference.md` — free text the owner writes later (a list of system types we build, and/or the company thesis). S4's prompt embeds the file verbatim. **Until the owner supplies it, the file ships with a one-line placeholder** *"Possibility builds custom software: web apps, mobile apps, SaaS, ERP/CRM, IoT and AI systems."* — marked as placeholder in §Questions so it is replaced, not forgotten.
- **Default step config** (`config/ai-steps.json`, the owner can change any value without code):

```json
{
  "understand":   { "provider": "openai", "model": "gpt-4o-mini",      "maxTokens": 500, "temperature": 0.2 },
  "goalClarity":  { "provider": "openai", "model": "gpt-4o-mini",      "maxTokens": 400, "temperature": 0.2 },
  "goodForWorld": { "provider": "gemini", "model": "gemini-2.5-flash", "maxTokens": 400, "temperature": 0.3 },
  "companyFit":   { "provider": "openai", "model": "gpt-4o",           "maxTokens": 400, "temperature": 0.2 },
  "synthesis":    { "provider": "openai", "model": "gpt-4o",           "maxTokens": 600, "temperature": 0.2 }
}
```
  Rationale (Sober, reversible): cheap/fast models for the comprehension steps; the strongest available model for the two judgement steps; low temperature everywhere because we parse JSON. Providers/models must be ones the gateway lists (`GET /models`); the config loader rejects unknown keys and validates the four fields at startup.

- **Gateway call** (`src/lib/ai-gateway.ts`, the only caller): `POST {AI_GATEWAY_URL}/chat` with `{ provider, model, max_tokens, temperature, messages:[{role:"system",content},{role:"user",content}] }`, 30 s timeout per call. Response `data.content` → strip ``` fences → `JSON.parse` → zod schema of the step. On network error, `success:false`, non-JSON, or schema failure: **one retry of that step**, then abort the chain with the failing step key in the error message (`AI_FAILED: step goodForWorld`). Total chain budget 120 s.

## API / Interface Design
Base `/api/v1`, all camelCase, envelope per SPEC-001 §D6. All routes `requireUser` (SPEC-002).

### `POST /ideas` — submit and analyse
Body `{ "text": string, "lang": "th" | "en" }`. Validation: `text.trim()` length 20–3000 (REQ-003 R1) → 400 `IDEA_TOO_SHORT` / `IDEA_TOO_LONG`; missing/invalid `lang` → 400 `VALIDATION_FAILED`.
- 201 `{ "idea": Idea, "userTier": Tier }` — `userTier` is the user's tier **after** this idea (REQ-001 R5, REQ-003 AC-9).
- 502 `AI_FAILED` — message names the step; **nothing saved** (AC-7, AC-12).

### `GET /ideas` — my ideas, newest first
- 200 `{ "ideas": IdeaSummary[] }`.

### `GET /ideas/:id`
- 200 `{ "idea": Idea }` only if `idea.userId === me`; else 404 `NOT_FOUND` (AC-6).

### `GET /admin/ideas/:id/steps` — `requireAdmin` (404 to anyone else, SPEC-002)
- 200 `{ "ideaId", "steps": IdeaStep[] }` (AC-10). The FE admin page is REQ-004's; this endpoint just exists so it can show them.

### Shapes
```json
Idea = {
  "id": "uuid", "text": "…", "lang": "th",
  "scores": { "feasibility": 80, "impact": 62, "interestingness": 95 },
  "ideaTier": "Raw Diamond", "discountPercent": 10,
  "reason": "…", "hireRequested": false,
  "createdAt": "2026-09-19T01:00:00.000Z"
}
IdeaSummary = { "id", "textPreview": "<first 80 chars>", "ideaTier", "createdAt" }
IdeaStep = { "step": "understand", "order": 1, "provider", "model", "maxTokens", "temperature",
             "promptVersion", "output": {…}, "latencyMs": 1234, "createdAt" }
```
`hireRequested` is always `false` until REQ-004's SPEC adds the hire request; it is in the shape now so the FE does not change later.

## Data Model
Migration `drizzle/0001_ideas.sql` (generated; applied by Jason, SPEC-001 §D8b):
```sql
CREATE TABLE ideas (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES users(id),
  text             text NOT NULL,
  lang             text NOT NULL CHECK (lang IN ('th','en')),
  feasibility      integer NOT NULL CHECK (feasibility BETWEEN 0 AND 100),
  impact           integer NOT NULL CHECK (impact BETWEEN 0 AND 100),
  interestingness  integer NOT NULL CHECK (interestingness BETWEEN 0 AND 100),
  idea_tier        text NOT NULL CHECK (idea_tier IN ('Ordinary','Seeker','Raw Diamond','Visionary','The Possibility')),
  reason           text NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ideas_user_created_idx ON ideas (user_id, created_at DESC);

CREATE TABLE idea_steps (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id         uuid NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  step            text NOT NULL,
  step_order      integer NOT NULL,
  provider        text NOT NULL,
  model           text NOT NULL,
  max_tokens      integer NOT NULL,
  temperature     numeric(3,2) NOT NULL,
  prompt_version  text NOT NULL,
  output          jsonb NOT NULL,
  raw_content     text NOT NULL,
  latency_ms      integer NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (idea_id, step)
);
```
Existing rows: none. `users.tier` is updated in the same transaction (see Flow 8).

## Flow
1. Validate body (400s above). Load `user` from session.
2. Run steps 1→5 in memory (`src/services/analysis.ts`), each: build prompt → gateway → parse → validate → keep `{output, raw, config, latency}`. Retry-once rule per step. Any failure → 502, nothing written (AC-7, AC-12).
3. Validate S5 against the ±15 rule; compute `ideaTier = tierFromScores(min(f, i, n))` with the REQ-001 R4 table, `discountPercent` from the R6 table — both in `src/lib/tier.ts`, the **only** place these tables exist (SPEC-004 FE display reads the tier name and looks up its own copy of the discount label from Porter's wording; numbers come from the BE).
4. Transaction: insert `ideas`; insert 5 `idea_steps`; `UPDATE users SET tier = <ideaTier> WHERE id = me AND rank(tier) < rank(ideaTier)` (upward only, REQ-001 R5).
5. Return 201 with `Idea` + the user's resulting `userTier` (re-read after the update).
6. Log one line per analysis: `idea.id`, `user.id`, per-step `provider/model/latencyMs`, final scores. Never log the idea text.
Edge cases: gateway returns 200 with `success:false` → treated as failure; JSON with extra keys → accepted (zod `.strip()`); integers as `"80"` strings → rejected (REQ-001 AC-7 wants failure, not coercion); `lang` mismatch in `reason` is not machine-checked (Tanya's AC-8 by eye).

## Non-functional
- Timeouts: 30 s per gateway call, 120 s per request; the FE shows W-4 the whole time.
- Config: `config/ai-steps.json` + `config/company-reference.md` are read once at startup and validated (unknown provider/model vs `GET /models` → startup error naming the step). Changing them = restart, no code change (AC-11).
- `.env.example` loses `AI_PROVIDER`/`AI_MODEL`, gains optional `AI_STEPS_CONFIG`, `COMPANY_REFERENCE_PATH`.
- Tanya's AC-7: point `AI_GATEWAY_URL` at an unreachable port in `.env` and submit.

## Tasks
- TASK-005: BE — ideas + idea_steps tables, config loader, gateway client, 5-step chain, tier module, 4 endpoints — owner: BE (depends on: TASK-003 DONE; **owner approval of §Chain**)
- TASK-006: FE — idea box page, result page, "My ideas" list, W-1..W-6 wording, tier/discount display — owner: FE (depends on: TASK-004; TASK-005 endpoints)
- REQ-001's remaining display ACs (profile/header tier + discount, AC-1/AC-6) → SPEC-004, small, after this.

## Questions
- **@Porter → owner, APPROVAL needed (blocks TASK-005):** the §Chain table — five steps as he listed, with the fixed outputs, the axis mapping (feasibility←S2, impact←S3, interestingness←S4) and the default models above. "โอเค" or name the line to change.
- **@Porter → owner, DR-5 re-raised as designed:** `config/company-reference.md` is the compare-step input. He can write it in any form (system-type list, thesis, both), Thai or English, any length up to ~1 page; until then a one-line placeholder is used and every idea's `companyFit` is judged against that placeholder — acceptable for building/testing, not for real users.
- **@Porter, confirm-only:** Porter's assumption in REQ-003 §Questions (S5 still yields the three 0–100 axes + lowest-score rule) is what this SPEC implements.
  > answer (Porter 2026-09-19): confirmed — S5 yields the three 0–100 axes; tier by lowest score per REQ-001 R4. Chain approval + DR-5: carried to the owner 2026-09-19, awaiting his word.
  > answer (Porter 2026-09-19): **APPROVED by the owner ("โอเค")** — §Chain as written, incl. default models and the company-reference placeholder. DR-5 stays deferred (owner writes `config/company-reference.md` whenever); record in SYSTEM-FACTS.
