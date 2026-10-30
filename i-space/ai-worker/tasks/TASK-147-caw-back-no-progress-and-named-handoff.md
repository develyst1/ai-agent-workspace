# TASK-147: caw-back — a commented card gets a second turn; `no_progress` names the card; hand-off recipients by name + role; hand-off by name
- Source: SPEC-116 (REQ-119)
- Owner: BE (Bob)
- Status: DONE (2026-10-30 16:0x [corrected 16:4x, was written "17:0x" — F-043], Silver — § Review)
- Depends on: REQ-117 committed (`4cc3241`) ✓

## What to do
Read SPEC-116 D1–D3 first (short). Repo `caw-back`, branch `atom`, base `4cc3241`. **No git.** Every command
`env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT … bun --no-env-file …`. No live hop, no real DB.

1. **Planner (D1, D2)** — `src/runner/plan.ts`:
   - `StopReason` + `"no_progress"`; `Action` `finish_run` gains `cardId?: string`.
   - Turns per `${cardId}|${workerId}` over `hopsInRun` (ended, not `interrupted`): used up after 2 `commented` hops (`COMMENT_TURNS = 2`) or 1 hop of any other outcome.
   - Pick: lowest-numbered workable card with an assignee and **0** turns; else lowest-numbered with turns left (one `commented`); else — if any workable card with an assignee exists → `{ kind: "finish_run", runId, reason: "no_progress", cardId: <lowest-numbered such card> }`; else `nothing_workable` (as now).
   - `plan.test.ts`: `:74-76` changes (one commented hop → `start_hop` c1); add: commented twice → `no_progress` with `cardId: "c1"`; failed once on the only card → `no_progress`; c1 commented once + c2 untouched → c2 first (`:65-67` stays green unchanged); no workable → `nothing_workable` (unchanged).
2. **Stop reason everywhere (D2)** — `src/core/events.ts:52`, `src/runner/api.ts:23`, `src/http/routes/hops.ts:14` + `"no_progress"`; `src/db/schema.ts:124` check list + `'no_progress'`, then `bun run db:generate` → one new migration `0013_*.sql` + `meta/0013_snapshot.json` + `_journal.json` (its SQL = SPEC-116 § Data Model; read it back). If drizzle-kit names it oddly that is fine — say the name in the Notes.
3. **Report words (D2)** — `src/runner/main.ts`: `stopWords.no_progress = "มีงานที่ยังทำต่อได้ แต่ไม่คืบ"`; at `case "finish_run"` (`:226`), for `no_progress` with a `cardId`, call `endRun(project.id, runId, "no_progress", words)` where `words` = `#${card.number} ${card.title} ยังทำต่อได้ แต่ทำ ${n} รอบแล้วไม่คืบ — กด "อัตโนมัติ" เพื่อลองต่อ หรือเปิดการ์ดดู` (exact characters, incl. the straight double quotes around อัตโนมัติ); `n` = hops of the open run on that card, any worker, ended and not `interrupted`. Card unreadable → the generic `stopWords` (no throw — `endRun` must still close the run). `src/runner/report.ts`: **no change**.
   `main.test.ts`: one stub-runner case — a card whose fake hop only comments twice → the run's `stopReason` = `no_progress` and its report contains `- เหตุที่จบรอบ: #1 ` … `ยังทำต่อได้ แต่ทำ 2 รอบแล้วไม่คืบ` and **not** `ไม่มีงานที่ทำต่อได้`. Existing `nothing_workable` cases (`:204,222,286,312,342`) — if one now ends `no_progress` because a workable card is left, tell me in `## Questions` with the case before changing its expectation.
4. **Card context `handOffTo` (D3.1)** — `src/cards/service.ts` `cardContext`: `handOffTo: { id, name, roles }[]` = workers the card's assignee has an edge to (`state.edges`, `from === card.assigneeId`), not deleted, ordered by id. `CardContext` type (`:90`) and `CardContextSchema` (`src/http/routes/cards.ts:33-42`) + `handOffTo` (openapi description: "who the card's worker may hand it to, by name and role").
5. **Refusal + by name (D3.3, D3.4)** — `handOff` (`service.ts:137-155`): resolve `toWorkerId` (allowed id → it; else trimmed value = the `name` of exactly one allowed recipient → its id; else refuse). Refusal details `{ from, allowed, allowedWorkers: [{ id, name, roles }] }` (that key order), message `the chain has no hand-off from the card's worker to that worker — you may hand to: แบงค์ (BE) <id>, ฝน (FE) <id>` (`nobody` when empty; each `name (roles joined " + ") id`). `recordRefusedHandOff` keeps writing `allowed` ids only (event unchanged). Body description of `toWorkerId` in `routes/cards.ts` and `hand_off` in `src/mcp/server.ts:85-89`: "the worker's id or name (see `handOffTo` in your card context)".
   Tests to update (they pin `details`): `test/http/cards.test.ts:150,166`, `test/http/handoff-refused.test.ts:22`, `test/mcp/server.test.ts:140` (add `allowedWorkers`). New cases in `test/http/cards.test.ts`: hand-off by name → 200 and `card.handed_off.toWorkerId` = the id; name of two recipients → 409; `card_context.handOffTo` = `[{ id, name, roles }]` for a card whose worker has one edge, `[]` for no edge.
6. **Card hop prompt (D3.2)** — `src/runner/api.ts`: `chain(projectId)` = `GET /v1/projects/{id}/chain` (members + edges). `src/runner/prompt.ts` `buildPrompt` takes `recipients: { name: string; roles: string[] }[]` and, when non-empty, adds after line 3:
   `You may hand off to: แบงค์ (BE), ฝน (FE) — pass the name (or the id) as \`toWorkerId\` of \`hand_off\`.` `src/runner/hop.ts:326` passes the recipients (edges from `worker.id`, names/roles from the workers list, id order). `prompt.test.ts`: the line with two recipients; absent with none.
7. `bun run openapi:emit` → `openapi.json` changes (stop-reason enum ×2, `CardContext.handOffTo`, descriptions) — read the diff back; nothing else in it.

Closed file list (anything else → `## Questions` first): `src/runner/{plan,plan.test,main,main.test,api,prompt,prompt.test,hop}.ts`, `src/core/events.ts`, `src/http/routes/{hops,cards}.ts`, `src/db/schema.ts`, `src/db/migrations/0013_*.sql`, `src/db/migrations/meta/{0013_snapshot,_journal}.json`, `src/cards/service.ts`, `src/mcp/server.ts`, `test/http/{cards,handoff-refused}.test.ts`, `test/mcp/server.test.ts`, `openapi.json`. New paths are not git-ignored (`git check-ignore -v src/db/migrations/0013_run_no_progress.sql` → exit 1, SA 15:5x).

## Definition of Done
- [ ] 1. Before: `git status --short | wc -l` → `0` (base: `0` on `4cc3241`, SA 15:5x)
- [ ] 2. `grep -c no_progress src/runner/plan.ts src/db/schema.ts src/http/routes/hops.ts src/core/events.ts src/runner/api.ts src/runner/main.ts` → each ≥ 1 (base: all six `0`, SA 15:5x)
- [ ] 3. `ls src/db/migrations/*.sql | wc -l` → `14`, and the new file holds `'no_progress'` in the check list (base: `13`, SA 15:5x)
- [ ] 4. `bun --no-env-file test src/runner/plan.test.ts src/runner/main.test.ts src/runner/prompt.test.ts src/runner/report.test.ts` → `0 fail`, the new cases named (base: `Ran 145 tests across 4 files`, `0 fail`, SA 15:5x); `report.test.ts` untouched (REQ-117 line, AC-3)
- [ ] 5. `bun --no-env-file test test/http/cards.test.ts test/http/handoff-refused.test.ts test/mcp/server.test.ts test/http/hops-runs.test.ts` → `0 fail` (base: `Ran 41 tests across 4 files`, `0 fail`, SA 15:5x)
- [ ] 6. `bunx tsc --noEmit -p .` → exit `0` (base: `0` on `4cc3241`, SA 15:5x)
- [ ] 7. `bun --no-env-file test --timeout 30000` (whole suite) → only the known `src/runner/settings.test.ts` fail (base: `883 pass · 1 skip · 1 fail · Ran 885 tests across 71 files`, SA 15:5x on `4cc3241`)
- [ ] 8. `bun run openapi:emit && git diff --stat openapi.json` → changed; the diff = stop-reason enums + `handOffTo` + descriptions only (base: emit on `4cc3241` leaves `git status` empty, SA 15:5x)
- [ ] 9. `grep -c "handOffTo" src/cards/service.ts` → ≥ 1 and `grep -c allowedWorkers src/cards/service.ts` → ≥ 1 (base: `0`, SA 15:5x)
- [ ] 10. After: `git status --short --untracked-files=all` → only the closed list; `pgrep -fc 'output-format [s]tream-json'` → `0` (base: n/a — new: the list is this TASK's)

## Implementation Notes
All seven steps built in caw-back (base `4cc3241`, nothing committed by me). **Q1 answered (your default): AC-7's one expectation now reads the `no_progress` line for #3 (`main.test.ts:458`); DoD 4/7 re-run below.** Every command ran as `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT … bun --no-env-file …`; no live hop, no real DB.

**What changed**
- `plan.ts`: `StopReason + no_progress`, `Action.finish_run.cardId?`, `COMMENT_TURNS = 2`. Per `card|worker` pair: `commented` hops counted, any other ended outcome (not `interrupted`) spends it at once. Pick = lowest-numbered card with no turn → else lowest with a turn left → else `no_progress` (lowest workable card with an assignee) → else `nothing_workable`.
- Stop reason `no_progress` in `core/events.ts`, `runner/api.ts`, `routes/hops.ts`, `db/schema.ts` check list. Migration `0013_reflective_toxin.sql` (+ `meta/0013_snapshot.json`, `_journal.json` idx 13). SQL read back = SPEC-116 § Data Model exactly (DROP + ADD CONSTRAINT with `'no_progress'` last).
- `main.ts`: `stopWords.no_progress = "มีงานที่ยังทำต่อได้ แต่ไม่คืบ"`; `case "finish_run"` reads the card and ends the run with `#${number} ${title} ยังทำต่อได้ แต่ทำ ${n} รอบแล้วไม่คืบ — กด "อัตโนมัติ" เพื่อลองต่อ หรือเปิดการ์ดดู` (`n` = ended, non-`interrupted` hops of the open run on that card, any worker). Card unreadable → logged, `endRun` with the generic words (tested). `report.ts` / `report.test.ts` untouched (`git diff` empty).
- `cards/service.ts`: `recipientsOf` (edges from the assignee → live workers `{id,name,roles}`, by id); `cardContext.handOffTo`; `handOff` resolves an allowed id, else a trimmed name that is exactly one recipient, else 409 `chain_broken` with `{ from, allowed, allowedWorkers }` and message `… — you may hand to: Ben (FE) <id>` (`nobody` when empty). The recorded `card.handoff_refused` is unchanged (`allowed` ids only; a refused name is not a worker id so nothing is recorded, as for any unknown id). `CardContextSchema` + `toWorkerId` description in `routes/cards.ts`, `hand_off` in `mcp/server.ts`.
- `api.chain`, `buildPrompt({ …, recipients? })` (line after rule 3), `hop.ts` `recipientsOf` → the hop prompt.

**Declared decisions (internal, one line each — overturn cheaply)**
1. "after line 3" of the prompt = right after **rule 3** (`3. End this step with exactly one…`), the line that names `hand_off`; rules 4–6 not renumbered.
2. The runner takes names/roles from `GET …/chain` **members** (they are the same workers, with `name` and `roles`) — one call, not chain + `GET /v1/workers`. A chain that cannot be read is logged and the hop goes on without the line (the line is an aid; the refusal still names everyone).
3. `allowed` and `allowedWorkers` are both sorted by id (the DB gave `allowed` in no stated order; contents unchanged) so the two lists match.
4. `buildPrompt`'s `recipients` is optional (`[]` = no line), so the other callers and tests stand unchanged.

**Evidence (real output)**
- DoD 1: `git status --short | wc -l` → `0` at start.
- DoD 2: `grep -c no_progress …` → `main.ts:4 events.ts:1 schema.ts:1 api.ts:1 hops.ts:1 plan.ts:2`.
- DoD 3: `ls src/db/migrations/*.sql | wc -l` → `14`; `grep -c "'no_progress'" 0013_reflective_toxin.sql` → `1`.
- DoD 4: `bun --no-env-file test src/runner/{plan,main,prompt,report}.test.ts` → (re-run after Q1) `153 pass · 0 fail · Ran 153 tests across 4 files`. New cases: plan ×6 (second turn; commented twice → `no_progress` c1; failed once → `no_progress`; c1 commented + c2 fresh → c2 first, then c1; several stuck → lowest named; stuck card without assignee → `nothing_workable`), main ×2 (commented twice → `stopReason no_progress` and the report holds `- เหตุที่จบรอบ: #1 … ยังทำต่อได้ แต่ทำ 2 รอบแล้วไม่คืบ` and not `ไม่มีงานที่ทำต่อได้`; unreadable card → generic words, run closed), prompt ×1. The five `nothing_workable` cases you listed (`:204,222,286,312,342`) all still pass.
- DoD 5: `bun --no-env-file test test/http/cards.test.ts test/http/handoff-refused.test.ts test/mcp/server.test.ts test/http/hops-runs.test.ts` → `43 pass · 0 fail · Ran 43 tests across 4 files` (new: hand-off by name → 200 and the stored `toWorkerId` = the id; unknown name and a non-recipient's name → 409; `card_context.handOffTo` = `[{id,name,roles}]` / `[]` for no edge / `[]` for no assignee).
- DoD 6: `bunx tsc --noEmit -p .` → exit `0`.
- DoD 7: whole suite `--timeout 30000` → (re-run after Q1) `893 pass · 1 skip · 1 fail · Ran 895 tests across 71 files`: only the known `settings.test.ts` (`withReadGuard … PreToolUse hook`); `tsc` exit `0`; `pgrep -fc 'output-format [s]tream-json'` → `0`; `git status --short | wc -l` → `21` (19 modified + 2 new migration files, all on the closed list).
- DoD 8: `bun run openapi:emit` → `openapi.json | 32 +++++-` ; diff read back = `handOffTo` (+ `required`), `no_progress` in the two stop-reason enums, the `toWorkerId` description — nothing else.
- DoD 9: `grep -c handOffTo src/cards/service.ts` → `2`; `grep -c allowedWorkers …` → `1`.
- DoD 10: changed paths = 19 modified + the two new migration files, all on the closed list; `pgrep -fc 'output-format [s]tream-json'` → `0`.

**UNVERIFIED**
- The "a name matching two recipients is refused" half of D3.4 is **unreachable** through the API (see Q2); the code takes `named.length === 1` only, no test can drive it.
- No live hop: the hop-prompt line is tested through `buildPrompt` and the chain read through the in-process API, not through a real `claude` run (guardrail).
- Migration `0013` ran on PGlite only (tests), not on any real database.

## Questions
**Q1 (blocks DoD 4 / 7 — an existing test).** `src/runner/main.test.ts:~456` (AC-7, "a run of 3 hops (commented, asked, stopped)") pinned `- เหตุที่จบรอบ: ไม่มีงานที่ทำต่อได้`. With D1/D2 the run now ends `no_progress`: card #3 (`C is blocked`) had its one hop `stopped` and is still workable, so the report line is `- เหตุที่จบรอบ: #3 C is blocked ยังทำต่อได้ แต่ทำ 1 รอบแล้วไม่คืบ — กด "อัตโนมัติ" เพื่อลองต่อ หรือเปิดการ์ดดู`. That is what SPEC-116 D2 says should happen. Checked: SPEC-116 D2 (workable card with an assignee left → `no_progress`). **My default: change that one expectation to the new line** (it is the only test of the five-listed `nothing_workable` set plus AC-7 that moved), and nothing else in `main.test.ts`. Correct only if you want AC-7's fixture changed instead (e.g. give #3 a done dependency so nothing is workable).
**Q2 (non-blocking — a SPEC premise).** SPEC-116 D3.4 says names "are not unique by construction". They are unique among live workers (`workers_name_live`, `src/db/schema.ts:24`, v1.14; the API answers `409 name_taken`), and recipients are always live. So two recipients can never share a name; the "name of two → refused" branch cannot happen. I kept the SPEC's one-line rule (`exactly one`), built no test for it, and listed it under UNVERIFIED. Tell me if you would rather I remove the dead branch.

> answer Q1 (Silver, 2026-10-30 16:4x): **your default — change that one expectation to the new line**, nothing else in `main.test.ts`. #3's one hop was `stopped` and it is still workable, so `no_progress` naming #3 is exactly D2 and REQ-119 AC-1 ("never `nothing_workable` while a card is workable"); changing the fixture would hide the case the REQ is about.
> answer Q2 (Silver, 2026-10-30 16:4x): **you are right** — `workers_name_live` (`src/db/schema.ts:24`) + `409 name_taken` (`src/workers/service.ts:32`) make live names unique; my SPEC premise was not read. Keep the code as built (`exactly one` = the only reachable case; no dead-branch removal, no test for it); your UNVERIFIED line stands. SPEC-116 D3.4 + R3 corrected. Set REVIEW when DoD 4/7 are re-run.

## Review
**DONE** (Silver, 2026-10-30 17:0x) against SPEC-116 D1–D3 and the evidence.
- **Scope:** `git status --untracked-files=all` → 19 modified + `0013_reflective_toxin.sql` + `meta/0013_snapshot.json` = the closed list exactly.
- **Read:** `plan.ts` — fresh pair first, then a second `commented` turn (`COMMENT_TURNS = 2`), any other ended outcome spends the pair; no pick + a workable card with an assignee → `no_progress` + `cardId` (lowest number), else `nothing_workable` (D1/D2). `main.ts` — words exactly D2, `n` = ended non-interrupted hops of the run on that card, unreadable card → generic words, run still closes. `service.ts` — `recipientsOf` (edges, live workers, id order) feeds `handOffTo`, the id-or-name resolve and the refusal `{ from, allowed, allowedWorkers }` + named message; the refusal event still records ids only (`handoff-refused.test.ts:33` green). Prompt line exactly D3.2. Migration SQL = SPEC-116 § Data Model. `openapi.json` diff = `handOffTo`, `no_progress` ×2, the `toWorkerId` description — nothing else. AC-7's changed expectation = the Q1 answer (#3 `stopped` once, still workable).
- **My re-run:** `bunx tsc --noEmit -p .` → `0` · plan/main/prompt/report + cards/handoff-refused/mcp server/hops-runs → `196 pass · 0 fail · Ran 196 tests across 8 files` · `report.ts`/`report.test.ts` untouched (`git diff --quiet`) — REQ-117 line unchanged (AC-3) · whole suite `--timeout 30000` → `893 pass · 1 skip · 1 fail · Ran 895 tests across 71 files`, the fail = the known `withReadGuard … PreToolUse hook` (`settings.test.ts`).
- **Security** (input on a write path): `toWorkerId` is compared by equality with the card's own allowed recipients only; the refusal names workers already in that chain to a worker of that chain. No auth change.
- Accepted UNVERIFIED: no live hop (guardrail; QA's stub/live run), migration on PGlite only, the two-names branch unreachable (Q2).
