# TASK-134: blueprint-back — each gateway call picks heavy/light model, one fallback up, every call recorded, `GATEWAY_LIGHT_MODEL` (REQ-115)
- Source: SPEC-112 (G1–G4)
- Owner: BE (Jason)
- Status: DONE (2026-10-30 16:0x, Sober — § Review)
- Depends on: **REQ-116 (TASK-142) committed (`f10f8cb`)** ✓ in blueprint-back (F-013). blueprint-back HEAD = `f10f8cb`, tree clean.

## What to do
Read SPEC-112 first. The line numbers below are from `e2c3326`. Re-find them with `grep` after the commits before this one. On `f10f8cb` (Sober 15:2x): `ask` is `src/interview/round.ts:587-588`; the latest migration is `drizzle/0010_brave_black_tom.sql`, so yours is `0011`.
1. **G1:** new `src/gateway/models.ts` with `Weight` and `modelFor(weight, projectModel)`, exactly as SPEC-112 G1 says (env read at call time; an invalid value logs without printing the value, then falls back to the project's model).
2. **G2/G3, interview, `src/interview/round.ts`.**
   - `ask` takes a weight. `first` = heavy, keeping `firstAnswer: true`. `reask` and `correction` = light.
   - Add one fallback per light step, under SPEC-112 G3's three triggers and result rules. When light = the project's model, there is no fallback.
3. **G2/G3, quiz, `src/quiz/answer.ts`.** Both calls are light, with the same fallback rule.
4. **G4, record.**
   - Collect `Call` objects in call order.
   - Store them as `messages.round_calls` on every bot row a round writes (applied, no_changes, changes_rejected, bot_could_not_answer), and as `quiz_items.calls`.
   - Expose them as `roundCalls` (`GET …/messages`, `src/http/routes/rounds.ts` `ChatMessage`), `calls` (`Round` response) and `calls` (quiz item schema in `src/http/routes/quizzes.ts`).
   - Migration: the next number after `0009` (or after whatever REQ-105/112 added).
   - Re-emit `openapi.json`.
5. **Tests**, new `test/gateway/weights.test.ts` (plus a quiz test file if cleaner), with a stub that records the requested model of each call:
   - (a) AC-1: the first answer refuses 1 item → the correction goes to `tier:small`, and the first goes to the project's model. `roundCalls` = `[first/heavy, correction/light]`.
   - (b) AC-2: a quiz answer → `tier:small`; `calls` has 1 entry `answer/light`.
   - (c) AC-3, ×3: a light call fails by transport / by unreadable reply / (correction) by still refusing → exactly 1 extra call on the project's model, recorded `fallback: true`. Never 2 extra.
   - (d) AC-4: `GATEWAY_LIGHT_MODEL=deepseek/deepseek-chat` → the next light call asks for it. Unset → `tier:small`. An invalid value → the project's model, and the log line has no value.
   - (e) A project on `tier:small` → a light step has no fallback (1 call).
6. Existing tests whose stubs assert the model or count calls may need updating. List each one with why. Do not loosen an assertion that guards REQ-110 behaviour.

Closed file list: `src/gateway/models.ts` (new) · `src/interview/round.ts` · `src/quiz/answer.ts` · `src/quiz/store.ts` (only if `Answered` needs to pass `calls`) · `src/db/schema.ts` · the new migration + its meta snapshot/journal · `src/http/routes/rounds.ts` · `src/http/routes/quizzes.ts` · `openapi.json` · new test files · existing tests per step 6. Every `bun` command is prefixed `DATABASE_URL=pglite:memory`. No live gateway. No git.

## Definition of Done
- [ ] 1. Before: `git status --short` → empty, HEAD = `f10f8cb` (base: empty, HEAD `f10f8cb`, Sober 15:2x)
- [ ] 2. `grep -c "round_calls" src/db/schema.ts` and `grep -c "roundCalls" openapi.json` → ≥ 1 each (base: `0` / `0`, Sober 15:2x on `f10f8cb`)
- [ ] 3. New tests 5(a)–(e) pass, real output pasted (base: n/a — new: `src/gateway/models.ts` does not exist)
- [ ] 4. `bun test --timeout 30000` → 0 fail. Paste the counts and list every changed test. A lone load timeout is re-run alone (base: `320 pass / 16 skip / 0 fail`, 336 tests in 44 files, Sober 15:2x on `f10f8cb`)
- [ ] 5. `bunx tsc --noEmit` → exit 0 (base: exit 0, Sober 15:2x on `f10f8cb`)
- [ ] 6. `grep -rn "GATEWAY_LIGHT_MODEL" src` → only `src/gateway/models.ts` (base: no hits in `src test`, Sober 15:2x on `f10f8cb`)

## Implementation Notes
(Jason, BE — 2026-10-30. `bun` runs prefixed `DATABASE_URL=pglite:memory`, in `blueprint-back` at `f10f8cb`. No git, no gateway, no SQL beyond in-memory pglite.)

**Changed:**
- New `src/gateway/models.ts` — `Weight`, `modelFor(weight, projectModel)` (heavy → project's; light → `GATEWAY_LIGHT_MODEL` trimmed or `tier:small`, read at call time; invalid per `modelRequest` → logs `[gateway] GATEWAY_LIGHT_MODEL invalid — using the project's model`, never the value, returns the project's), and the `Call` type.
- `src/interview/round.ts` — `ask(step, weight, model, msgs, readable, opts)` records one `Call` per gateway call into a per-round `calls` list; `askLight(step, msgs, judge)` asks the light model and, unless light = the project's model, makes ONE fallback call on the project's model when the light call failed, its reply is `bad` (unreadable), or (correction only) is `weak` (parses but `planOf(…).refused.length > 0`). `first` = heavy with `firstAnswer: true`; `reask` and `correction` = light. Selection per G3: transport/unreadable → the fallback's answer; still refusing → the fallback's plan only if it refuses fewer. `calls` goes onto every bot row a round writes (`finish`, and the set's bot row in `applyAnswer`), onto `Round.calls`, and `listMessages` → `roundCalls`. A round that made no call (park-only) stores null.
- `src/quiz/answer.ts` — both calls light with the same fallback; `Answered.calls`; `src/quiz/store.ts` — `NewItem.calls?` (optional, so the existing helper `addItem` callers need no edit), stored, and read back as `QuizItem.calls`.
- `src/db/schema.ts` + `src/db/migrations/0011_majestic_vengeance.sql` (+ meta snapshot/journal): `ALTER TABLE messages ADD COLUMN round_calls jsonb; ALTER TABLE quiz_items ADD COLUMN calls jsonb;` — nullable, additive, old rows null (so nothing to backfill; no `down`, forward-only like 0010).
- `src/http/routes/rounds.ts` — exported `CallSchema` (`Call`), `calls` on `Round`, `roundCalls` on `ChatMessage`; `src/http/routes/quizzes.ts` — `calls` on `QuizItem`. `openapi.json` re-emitted.

**Decided myself (invisible to the API):** (1) `reason` for a readable-less reply is `"protocol"` (the term the code already uses). (2) A call's `ok` = returned content AND readable; a "still refusing" light correction is readable, so `ok: true` (the fallback is recorded beside it). (3) For the quiz, "answer" and "reask" are two steps, each with its own possible fallback: worst case 4 calls (as G3 reads); an unreadable answer after its fallback goes to the re-ask as it went before. (4) 0 calls → `null`, not `[]`.

**DoD evidence:**
1. Before: `git status --short` → empty, HEAD `f10f8cb`.
2. `grep -c "round_calls" src/db/schema.ts` → `2` · `grep -c "roundCalls" openapi.json` → `2`.
3. `bun test test/gateway/weights.test.ts --timeout 30000` → `9 pass / 0 fail / 29 expect()`: (a) AC-1 first→`tier:medium`, correction→`tier:small`, `calls` = [first/heavy, correction/light], the same on the bot row in `GET …/messages` (user row null) · (b) AC-2 quiz→`tier:small`, item `calls` = [answer/light] · (c) AC-3 correction fails by transport / unreadable / still refusing → exactly 1 extra call on `tier:medium`, `fallback: true`; a fallback that fails too ends the step with still 1 extra; quiz unreadable → 1 fallback · (d) AC-4 `deepseek/deepseek-chat` asked; unset → `tier:small`; invalid (`not-a-model-id-SECRET`) → the project's model, no fallback, log line without the value · (e) project on `tier:small` → re-ask = 1 call, no fallback, round `bot_could_not_answer`/`protocol`, record on the failed bot row.
4. `bun test --timeout 30000` → `329 pass / 16 skip / 0 fail` (345 tests, 45 files; 320 + 9). **Existing tests changed: 5 files, 7 tests — counts only, no REQ-110 assertion loosened** (each stub ignores the model, and the default project is `tier:medium`, so its light step now has its one fallback; each still asserts an exact count and the same status/reason):
   - `test/quiz/answer.test.ts` "AC-10 every gateway failure…" — 2 → 4 calls per case (light + its fallback, twice for the protocol case); each case queues 4 answers.
   - `test/interview/round.test.ts` "AC-10 …" — "not our protocol" 2 → 3 (round + light re-ask + its fallback; queue of 3); transport cases stay 2 (the first call is heavy).
   - `test/interview/round.test.ts` "review: correction text… a NUL…" — 2 → 3 (same reason).
   - `test/interview/honest.test.ts` "E2 / AC-3 feature twice" — 2 → 3 (round + light correction + its fallback); "E2 correction that is not the JSON" — 2 → 3.
   - `test/interview/partial.test.ts` "dependents…" — 2 → 3 (the repeated answer still refuses, so the fallback ran).
   - `test/interview/guard.test.ts` "R3 …" — 2 → 3, third answer queued.
5. `bunx tsc --noEmit` → exit 0.
6. `grep -rn "GATEWAY_LIGHT_MODEL" src` → only `src/gateway/models.ts:11,15`.
`git diff --stat openapi.json` → `87 +++…--` (84 insertions, 3 deletions; the 3 are trailing commas after `required` entries). `git status --short`: the 13 changed + 4 new paths above are all on the closed list.

UNVERIFIED — real light-model quality and the fallback rate against the live gateway (QA, owner's word; SPEC-112 Risks: if the correction falls back on most rounds, make it heavy); the front's `gen:api` is TASK-135.

## Questions

## Review
**DONE** — Sober, 2026-10-30 16:0x, against SPEC-112 G1–G4 and the evidence. Re-run by me on the tree (13 M + 4 new, all on the closed list):
- `bunx tsc --noEmit` → exit 0 · `bun test test/gateway/weights.test.ts` → 9 pass / 0 fail · `bun test --timeout 30000` → **329 pass / 16 skip / 0 fail, 345 tests in 45 files** (= Jason's; base 320/16/0 + 9).
- DoD 2: `round_calls` in schema.ts → 2 · `roundCalls` in openapi.json → 2. DoD 6: `GATEWAY_LIGHT_MODEL` in `src` only at `models.ts:11,15`; the log line (`:15`) carries no value.
- Read: `models.ts` (G1 exactly; env read at call time) · `round.ts` diff: `first` heavy + `firstAnswer`; `reask`/`correction` via `askLight`; no fallback when light = project model; correction picks the fallback only when the light plan is unreadable or the fallback refuses fewer (G3) · `calls` on every bot row (`fail` path and the applied row) and on `Round` · `answer.ts`: both steps light, one fallback each · migration 0011 = SPEC-112's two `ADD COLUMN`s, nullable.
- Existing tests: the 7 changes are call counts and queued stub answers only; every status/reason assertion is unchanged (read the diff line by line). No REQ-110 guard loosened.
- Decisions (1)–(4) in the notes: accepted. They are invisible to the API, or SPEC-112 allows them (`null` for no call).
- **O-1, accepted `[SA-decided]`, no rework:** a quiz step whose light reply is unreadable and whose fallback then fails on transport ends the answer as `failed(<transport reason>)`. G3's "otherwise fails exactly as today" would go on to the re-ask. This needs two failures in a row on two models, it fails honestly (no false answer), and the operator can ask again. Cheap to change later: in `answer.ts` `ask`, return `light` when the fallback is not ok.
- Front `check:api` is red until TASK-135 (expected: `openapi.json` gained `Call`, F-036). TASK-135 released.
