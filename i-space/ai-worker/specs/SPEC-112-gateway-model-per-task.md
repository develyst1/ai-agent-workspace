# SPEC-112: Each gateway call picks its model by task — heavy keeps the project's model, light goes cheap, one fallback up
- Source: REQ-115 (Team A)
- Status: DONE (2026-10-30 16:0x, Sober — TASK-134/135 DONE; REQ-115 SPEC_DONE)
- Repos read: `blueprint-back` on `atom` (e2c3326 + REQ-114's uncommitted TASK-132 tree), 2026-10-30 10:0x, Sober.

## What I read
- **Every call uses `project.model`.** Interview: one `ask` (`back: src/interview/round.ts:559-560`), used by the first call (`:659`, heavy since E12: 180 s), the re-ask after an unreadable reply (`:667`), and the one correction (`:680`). Quiz: `ask` (`src/quiz/answer.ts:57`), first call plus one re-ask if unreadable (`:61-67`).
- **A model id** is `"tier:<small|medium|flagship>"` or `"<provider>/<model>"` (`src/gateway/client.ts:35-44`; anything else throws). With `tier:small` the gateway picks the provider itself; its default chain is deepseek → xai → gemini → openai (the owner's gateway, `llm-gateway` skill). That is the owner's "deepseek or xai" without naming one. **I did not call `GET /models`**, because a gateway call needs the owner's word.
- **What is recorded today:** the bot row's `model` = the provider/model that answered (`modelOf`, `:561`). A quiz item's `model` (`src/db/schema.ts:157`) likewise. Which step or weight it was, and any fallback, is recorded nowhere.
- **Config today:** env only, read in place (`GATEWAY_URL` `client.ts:74`; `CAW_NOTIFY_URL` read at call time, `src/seam/notify.ts:8`).

## Design `[SA-decided]` (cheap to reverse)
- **G1 — Weights, one place.** New `src/gateway/models.ts`:
  - `export type Weight = "heavy" | "light"`;
  - `modelFor(weight, projectModel): string`. `heavy` → `projectModel`. `light` → `process.env.GATEWAY_LIGHT_MODEL?.trim() || "tier:small"`, **read at call time**, so a changed `.env` applies on the next call after a restart and no code change is needed (AC-4). If that value fails `modelRequest`, it logs `[gateway] GATEWAY_LIGHT_MODEL invalid — using the project's model` (never the value) and returns `projectModel`. A bad setting never breaks a round.
- **G2 — Which call is which** (REQ-115 req 1):

  | step | where | weight |
  |---|---|---|
  | interview `first` | `round.ts:659` | heavy (project's model, 180 s, E12 unchanged) |
  | interview `reask` (after an unreadable first reply) | `:667` | light |
  | interview `correction` (after refused items) | `:680` | light |
  | quiz `answer` | `answer.ts` first call | light |
  | quiz `reask` (after an unreadable reply) | `answer.ts:62` | light |

- **G3 — One fallback up per step** (req 3). A light step whose model ≠ the project's model is asked **once more on the project's model** when:
  - the call fails on transport (any reason, timeout included; E3 still means the client itself never retries a timeout);
  - or the reply is unreadable (`parseReply` / quiz `parse` fails);
  - or (correction only) the reply parses but still leaves items refused (`planOf(…).refused.length > 0`, the "refused for shape" case).

  At most one extra call per step. The result used:
  - **transport or unreadable:** the fallback's, if it is readable; otherwise the step fails exactly as today (re-ask failed → `protocol`; correction failed → E5b, the first answer pruned and applied);
  - **correction still refusing:** the fallback's plan if it parses with **fewer** refused items, else the light one's.

  When light = the project's model (a project already on `tier:small`), there is no fallback, so no call repeats on the same model.
- **G4 — Record every call** (req 4). Each gateway call of a round or a quiz answer appends `{ step, weight, asked, model, fallback, ok, reason }`:
  - `step`: `"first"|"reask"|"correction"|"answer"`;
  - `weight`: `"heavy"|"light"`;
  - `asked`: the model id requested, e.g. `"tier:small"`;
  - `model`: `"<provider>/<model>"` that answered, or `null` on failure;
  - `fallback`: `true` on the up-retry;
  - `ok`: the call returned content **and** it was readable;
  - `reason`: the failure code or `null`.
  - Stored on the round's bot row as `messages.round_calls jsonb` (every bot row a round writes, failures included) and on `quiz_items.calls jsonb`. Never a key and never content. Old rows stay null.
- No change to the picker or to any user-facing text (REQ-115 § Wording). The bot row's `model` stays "the model whose answer was used".

## API / Interface (blueprint-back)
- `GET /v1/projects/{projectId}/messages`: each message gains `roundCalls: Call[] | null`.
- `POST …/rounds` → the `Round` response gains `calls: Call[] | null`.
- Quiz item responses (`src/http/routes/quizzes.ts` item schema, beside `notInSpec` at `:15`) gain `calls: Call[] | null`.
- `Call = { step: "first"|"reask"|"correction"|"answer", weight: "heavy"|"light", asked: string, model: string|null, fallback: boolean, ok: boolean, reason: string|null }`. Field casing exactly as written.
- `openapi.json` re-emitted, so the front regenerates its types (TASK-135). The front shows nothing new.
- **Consumers** (grepped 10:0x): `grep -rn "roundRaw" src` (back, non-test) → `src/db/schema.ts:134`, `src/interview/round.ts:83,549,597,719`, `src/http/routes/rounds.ts:70`. `roundCalls` goes beside each (TASK-134). Front `grep -rn "roundRaw\|roundAdjusted" src` (non-generated) → `src/features/chat/load.ts:29-32,122`. Those read only `roundAdjusted`, so they are untouched; `schema.d.ts` is regenerated (TASK-135). Quiz: `src/quiz/answer.ts` (`Answered` type `:42`) + `src/quiz/store.ts:240` (the one caller) + `quizzes.ts` item schema. `grep -c "round_calls\|roundCalls"` → 0 in `schema.ts` and `openapi.json` today.

## Data Model
```sql
ALTER TABLE messages ADD COLUMN round_calls jsonb;
ALTER TABLE quiz_items ADD COLUMN calls jsonb;
```
A drizzle migration after REQ-114's tree (the next number after `0009`). Existing rows stay null. Run on `pglite:memory` only (SPEC-104 G5b).

## Config (req 5)
`GATEWAY_LIGHT_MODEL` — optional. Default `tier:small`. Any id `modelRequest` accepts, e.g. `tier:small` or `deepseek/deepseek-chat`. It goes in the setup docs REQ-109 will write. Nothing is added to `.env` by an agent.

## AC → work
| AC | Covered by |
|---|---|
| AC-1 first = project model, correction = light, both recorded | TASK-134 (G1–G4), stub test |
| AC-2 quiz = light | TASK-134, stub test |
| AC-3 one fallback, recorded | TASK-134, stub failing the light call once (transport, unreadable, still refusing) |
| AC-4 config change applies | TASK-134, test sets/unsets `GATEWAY_LIGHT_MODEL` between two calls |
| AC-5 regression | TASK-134 (back suite; REQ-110 tests whose stubs count calls may need the light model allowed: list each one) · TASK-135 (front gen + suite) |
| AC-6 live (≤ 6 calls) | QA only |

## Risks
- **Quality on light corrections.** After REQ-110 a correction rewrites the whole JSON, which is not small work. G3's "still refusing → fallback" is the guard, and G4's record shows how often it fires. If it fires on most rounds, the saving is negative: report it, and make `correction` heavy (a one-word change in G2).
- **Worst-case calls per round go from 3 to 5:** first + reask + its fallback + correction + its fallback. AC-6's 6-call cap still covers 1 round. QA plans for it.
- `tier:small` is the gateway's choice of provider, so the model can change without us knowing. G4 records what actually answered.

## Tasks
- TASK-134: blueprint-back — weights, fallback, record, config (G1–G4) — owner: BE (depends on: REQ-114 committed, TASK-113 + TASK-117 committed; build order in § Order)
- TASK-135: blueprint-front — regenerate API types for `roundCalls`/`calls` — owner: FE (depends on: TASK-134 openapi)

## Order `[SA-decided]`
blueprint-back is one tree, committed per topic (F-013). The queue is REQ-114 (at QA) → REQ-105 TASK-113 → REQ-112 TASK-117 → REQ-115 TASK-134. TASK-134 depends on the commit before it.

## Questions
(none — `tier:small` default per REQ-115 req 2; wording: none needed)
