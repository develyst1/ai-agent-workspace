# SPEC-124: A card reaches review only with a note; a BE card goes to an FE only with a reason (REQ-125)
- Source: REQ-125 (Q1 (a)–(f) accepted by the PM 2026-10-31 00:3x)
- Status: DONE (2026-10-31 01:1x, Silver — TASK-166/167 DONE; REQ-125 SPEC_DONE) · was ACTIVE (2026-10-31 00:4x, Silver)
- Read: caw-back 2426d9a (`atom`, 2026-10-31): `src/cards/service.ts:126-201`, `src/http/routes/cards.ts:86-98`, `src/http/errors.ts:16-20`, `src/core/reduce.ts:18-27,71,131-147`, `src/core/state.ts:23`, `src/mcp/server.ts:85-95`, `src/runner/prompt.ts:24-36`; roles `src/http/routes/workers.ts:9`.

## Overview
Two checks in the API, where every worker write already goes through (`mcp/server.ts:1-4`). The MCP tools gain three optional fields; one prompt line says what review needs. No table, no event type, no column.
- **D1 the card's builder role** (Q1 a). `madeFor(s, c)` = the `fromWorkerId` of the card's **first `handoff` note** (note ids are time-ordered, `reduce.ts:71`), else `c.assigneeId`. `cardRole` = `BE` if that worker has BE and not FE, `FE` if FE and not BE, else `null`.
  *Why not a new state field:* `CardState` is loaded from the tables (`state.ts:23`), and a rebuild-check compares replay with tables. A `madeForId` field made 36 errors in a first probe (a column + migration). Derived from the notes, it needs neither.
- **D2 hand-off rule** (Q1 b, c). In `handOff`, after the chain check: if `cardRole` is BE/FE, the recipient does **not** have that role **and** has the other builder role, and `reason` is empty → **409 `wrong_role`**. With a reason, the hand-off goes through, and the note text = `text` + blank line + `reason` (the worker's own words, no new label). QA, SA, PM, BA, `other` never need a reason. **Not recorded** as a refused note (only `chain_broken` is, `service.ts:164-166`).
- **D3 review note** (Q1 d, e). In `setStatus`: `status === "review"` by a `worker:` actor with `done` or `howToTry` empty (after trim) → **409 `review_note_missing`**, `details.missing` = the empty names. With both → **one write, two events**: `card.commented` with text `ทำแล้ว: <done>\nลองได้โดย: <howToTry>` (paths rewritten like `addComment`, `service.ts:132`), then `card.status_set`. The operator is never asked. Given both, its note is written too. `done` set directly is unchanged.
- Messages = the PM's table (Q1 f), plus which field to fill, because the worker reads the message:
  - `wrong_role`: `ส่งต่อการ์ดนี้ไม่ได้ — การ์ดนี้เป็นงานของ {role} ถ้าต้องให้ {other} ช่วย ให้บอกเหตุผลในการส่งต่อ (ใส่ใน reason)` — `{role}` / `{other}` = `BE` / `FE`
  - `review_note_missing`: `ยังส่งตรวจไม่ได้ — เขียนบันทึกก่อนว่าทำอะไรไปบ้าง และเจ้าของจะลองได้อย่างไร (ใส่ใน done และ howToTry)`

## API / Interface Design
- `POST /v1/cards/{cardId}/handoff` body: `{ toWorkerId, text, reason? }` — `reason`: string ≤ 2000, optional. New 409 code `wrong_role`, `details: { cardRole, toRoles }`.
- `PATCH /v1/cards/{cardId}/status` body: `{ status, done?, howToTry? }` — each string ≤ 4000, optional. New 409 code `review_note_missing`, `details: { missing: ("done" | "howToTry")[] }`.
- `src/http/errors.ts` 409 list gains `wrong_role · review_note_missing`.
- MCP `hand_off` gains `reason?`; `set_status` gains `done?`, `howToTry?` (sent only when given; `lineBreaks` on both, as `comment`).
- Exact form: `tests/harness/spec125.patch` (5 files, 59 ± lines).
- `openapi.json` changes ⇒ caw-front `gen:api` + `typecheck` (TASK-167; the front calls neither route with the new fields, spec-rules §2 still asks for the pair).
Consumers (probe): probe-change.sh caw-back spec125.patch → 22 errors (full checks, SA 00:4x on 2426d9a, fp `e1be4e88f4d1`; paired caw-front typecheck 0 / tests 0)
caw-back → src/runner/main.test.ts:216 (fail) tick — automatic mode (TASK-C-031) > nothing workable ends the run (once) — later ticks do not open another one → TASK-166
caw-back → src/runner/main.test.ts:234 (fail) tick — automatic mode (TASK-C-031) > the operator switches again after a run ended → a new run opens (and only then) → TASK-166
caw-back → src/runner/main.test.ts:271 (fail) tick — automatic mode (TASK-C-031) > AC-3: switching to manual mid-hop — the hop finishes `commented`, no new hop starts,… → TASK-166
caw-back → src/runner/main.test.ts:295 (fail) tick — automatic mode (TASK-C-031) > AC-4 under automatic mode: the runner dies mid-hop, a new one takes over — old hop i… → TASK-166
caw-back → src/runner/main.test.ts:322 (fail) tick — automatic mode (TASK-C-031) > AC-5: a worker asks the operator → its card and the card that depends on it wait; an… → TASK-166
caw-back → src/runner/main.test.ts:332 (fail) tick — automatic mode (TASK-C-031) > a card whose hop FAILED is not hopped again in the same run — the run goes on with t… → TASK-166
caw-back → src/runner/main.test.ts:502 (fail) tick — automatic mode (TASK-C-031) > a card the API refuses a hop for (400 not_a_member: its assignee is not in the chain… → TASK-166
caw-back → src/runner/main.test.ts:514 (fail) tick — automatic mode (TASK-C-031) > a TRANSIENT API failure on a hop start (network, 5xx, unreadable body) does not ban … → TASK-166
caw-back → src/runner/main.test.ts:560 (fail) tick — automatic mode (TASK-C-031) > R6: a card sent back from review twice ends the run failed_review_twice, in REQ-012'… → TASK-166
caw-back → src/runner/main.test.ts:611 (fail) tick — automatic mode (TASK-C-031) > a report that cannot be built does not leave the run open: it ends with the reason a… → TASK-166
caw-back → src/runner/main.test.ts:821 (fail) chat hops: the entry worker answers an operator message (TASK-C-034) > dispatcher with an open run and a workable card: t… → TASK-166
caw-back → src/runner/main.test.ts:857 (fail) chat hops: the entry worker answers an operator message (TASK-C-034) > a card hop waits for a running chat hop the same way → TASK-166
caw-back → src/runner/hop.test.ts:100 (fail) runHop — outcome comes from what the worker wrote to the store > the LAST write by this worker on this card decides: comme… → TASK-166
caw-back → test/db/file.test.ts (fail) a file-backed PGlite keeps its rows across a close and a re-open (migrations applied once) → TASK-166 (re-run only: not touched by the patch; passes on the base 12/0 twice, SA 00:4x — inferred a load flake of the probe; a real fail with the patch goes back to me)
caw-back → test/scripts/db-scripts.test.ts (fail) Case C: data in caw.events, or CAW rows with other timestamps, or a duplicated row — inspect says CASE C; the fix ref… → TASK-166 (re-run only: not touched by the patch; passes on the base 12/0 twice, SA 00:4x — inferred a load flake of the probe; a real fail with the patch goes back to me)
caw-back → test/mcp/server.test.ts:117 (fail) comment · set_status · hand_off · ask_operator: each one API call as this worker; the results are the API's JSON → TASK-166
caw-back → test/mcp/server.test.ts:255 (fail) v1.13 scope: hand_off and ask_operator are NOT converted (D-078 asked for reply and comment only) — asserted so nobody wi… → TASK-166
caw-back → test/http/handoff-refused.test.ts:54 (fail) along the chain: no refused note; the hand-off works as before → TASK-166
caw-back → test/http/cards.test.ts:158 (fail) AC-4 hand-off: along a chain edge → 200 (the card moves to the next worker + a handoff note); off the chain → 409 chain_b… → TASK-166
caw-back → test/http/hop-guard.test.ts:48 (fail) a running hop of that worker on that card → every guarded write passes → TASK-166
caw-back → test/http/code-map.test.ts:224 (fail) comment and ask_operator (a worker on a card hop): text, proposedDefault and cases are rewritten; the operator's own c… → TASK-166
caw-back → test/http/rebuild-sequence.test.ts:50 (fail) rebuild-check → same:true after a sequence touching every event type of A-071 + A-072 → TASK-166

## Flow
- A worker's step ends with `set_status review` + `done` + `howToTry`. CAW writes the note and the status together, and the owner sees the note in the card's notes, as any comment.
- Without the fields → 409 with the PM's words → the worker reads it in the same step (the refusal is the tool's result) and tries again.
- `hand_off` BE card → FE without `reason` → 409 `wrong_role` → the worker either keeps the card or adds a reason.
- The runner's outcome rule (`hop.ts` OUTCOME) is unchanged: a refused write leaves no event, so a hop that only got refusals ends as today (`failed`, "no result").

## Prompt (D4)
`src/runner/prompt.ts` rule 3 adds one sentence: `To send a card to review, \`set_status\` with \`review\` needs \`done\` (what you did) and \`howToTry\` (how the owner tries it).` The hand-off rule is **not** added to the prompt: the refusal says it when it applies (as SPEC-116 did for the chain).

## Non-functional
One notes scan per hand-off (one project's notes, in memory). Nothing else.

## Risks
- **R1:** a live model may still skip the fields once; the refusal tells it what to add. AC-4 (live) shows whether once is enough.
- **R2 (D1 edge):** an operator re-assign (`card.assigned`) without a hand-off makes the new assignee "made for". Accepted: the operator's choice wins.

## Tasks
- TASK-166: caw-back — D1–D4 + the 22 consumers — owner: BE Bob (depends on: REQ-122 committed 2426d9a ✓; caw-back tree clean since 23:5x)
- TASK-167: caw-front — `gen:api` + `typecheck` against TASK-166's `openapi.json` — owner: FE Fanta (depends on: TASK-166's openapi)
  Consumers (probe): probe-change.sh caw-back spec125.patch → 22 errors — the same run as § API (all 22 listed there → TASK-166); the paired caw-front run: typecheck 0, tests 0 → 0 errors

AC map: AC-1 → D3 (TASK-166) · AC-2 → D3 + the card's notes on screen (QA) · AC-3 → D2 (TASK-166) · AC-4 → QA live · AC-5 → both TASKs' suites.

## Questions
