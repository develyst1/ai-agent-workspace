# TASK-166: caw-back — review needs a note (done + howToTry); a BE card goes to an FE only with a reason (REQ-125)
- Source: SPEC-124 D1–D4
- Owner: BE (Bob)
- Status: DONE (2026-10-31 01:0x, Silver — § Review) · was REVIEW (2026-10-31, Bob; DoD 1–9 run — see Implementation Notes)
- Depends on: REQ-122 committed (2426d9a) ✓ — caw-back tree clean (REQ-123's uncommitted work removed 2026-10-30 23:5x, owner's order)
- Git: none

## What to do
Closed file list (caw-back): `src/cards/service.ts`, `src/http/routes/cards.ts`, `src/http/errors.ts`, `src/mcp/server.ts`, `src/runner/prompt.ts`, `openapi.json` (by `bun run openapi:emit` only), `test/http/review-note.test.ts` (new), and the probe's consumers: `src/runner/main.test.ts`, `src/runner/hop.test.ts`, `src/runner/prompt.test.ts`, `test/mcp/server.test.ts`, `test/http/handoff-refused.test.ts`, `test/http/cards.test.ts`, `test/http/hop-guard.test.ts`, `test/http/code-map.test.ts`, `test/http/rebuild-sequence.test.ts`, plus `src/runner/testkit.ts` **only if** a stub worker's `set_status review` lives there.

1. **Build `ai-worker/tests/harness/spec125.patch`** (desk side; 5 product files, 59 ± lines) as written, with the editor. It is SPEC-124 D1 (`madeFor`, `cardRole`, read from the notes, **no** reducer change), D2 (`reason`, 409 `wrong_role`), D3 (`done` + `howToTry`, 409 `review_note_missing`, one note + the status in one write), D4 (one prompt sentence). Differences go in Implementation Notes.
2. **The 22 consumers** (SPEC-124 § Consumers). Where a test's stub worker moves a card to `review`, give it `done` + `howToTry`. Where a test pins the request bodies or the prompt text, update the pin. The meaning of every existing case stays.
   `test/db/file.test.ts` and `test/scripts/db-scripts.test.ts` are **not** in the list on purpose: run them, and if they fail with the change, stop and tell me (they passed on the base twice).
3. **`test/http/review-note.test.ts`** (new), through the HTTP API on `pglite:memory`:
   - (a) a worker's `review` with no fields → 409 `review_note_missing`, `missing: ["done","howToTry"]`, the card unchanged, no event;
   - (b) only `done` → `missing: ["howToTry"]`;
   - (c) both → 200, status `review`, and the card's notes end with one `comment` `ทำแล้ว: …\nลองได้โดย: …` by that worker;
   - (d) the operator's `review` with no fields → 200, no note;
   - (e) a BE-made card handed by the BE to an FE-only worker with no `reason` → 409 `wrong_role`, `details.cardRole` `BE`, the card still the BE's;
   - (f) the same with `reason` → 200, and the hand-off note = text + blank line + reason;
   - (g) the BE hands the same card to a QA worker with no reason → 200;
   - (h) a card made for an SA (no builder role) → any hand-off along the chain works;
   - (i) the D1 boundary: a card made for the BE, handed BE → QA → (back to) BE → FE-only: still `wrong_role` (made-for = the first hand-off's sender = BE);
   - (j) a worker with BE + FE receiving a BE card → 200.
4. `bun run openapi:emit`: the diff = `reason`, `done`, `howToTry` and the two codes' text only.

## Definition of Done
From caw-back, every `bun` line as `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT bun --no-env-file …`.
- [ ] 1. `git status --short --untracked-files=all` → only the closed list (base: empty, SA 00:5x on 2426d9a)
- [ ] 2. `git check-ignore -v test/http/review-note.test.ts` → exit 1, no output (base: exit 1, SA 00:5x)
- [ ] 3. `bun test test/http/review-note.test.ts` → 0 fail, ≥ 10 tests (base: n/a — new file)
- [ ] 4. `bun test test/http/cards.test.ts test/http/handoff-refused.test.ts test/mcp/server.test.ts` → 0 fail (base: `14 · 6 · 15 pass · 0 fail`, SA 00:5x)
- [ ] 5. `bun test src/runner/main.test.ts src/runner/hop.test.ts src/runner/prompt.test.ts` → 0 fail (base: `67 · 124 · 50 pass · 0 fail`, SA 00:5x)
- [ ] 6. `bun test test/db/file.test.ts test/scripts/db-scripts.test.ts` → 0 fail (base: `12 pass · 0 fail` twice, SA 00:4x)
- [ ] 7. `node_modules/.bin/tsc --noEmit --pretty false` → exit 0 (base: exit 0, SA 23:2x — unchanged tree since)
- [ ] 8. `bun test` (whole) → only the known `withReadGuard … ONE argument` fail (base: `976 pass · 1 skip · 1 fail`, SA 21:5x on the content committed as 2426d9a)
- [ ] 9. `bun run openapi:emit` then `git diff --stat openapi.json` → changed; `grep -c 'review_note_missing' openapi.json` ≥ 1 (base: `0`, SA 00:5x)

## Implementation Notes
Built in `caw-back` on `2426d9a` (tree clean at start: REQ-123's uncommitted work was removed by the owner's order, REQ-123 cancelled), nothing committed by me. Every command ran as `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT … bun --no-env-file …`. No live Claude.

**What changed** (`spec125.patch`, applied by hand with the editor — no difference from the patch in the 5 product files)
- `cards/service.ts`: `madeFor` (the sender of the card's first hand-off, else its assignee — read from the notes, **no reducer change**) and `cardRole` (BE / FE / null); `handOff(…, reason?)` → 409 `wrong_role` (`details { cardRole, toRoles }`) when a BE card goes to a worker who is FE and not BE (or the other way round) with no `reason`, and the note text = `text` + blank line + `reason`; `setStatus(…, note)` → a worker's `review` without both `done` and `howToTry` → 409 `review_note_missing` (`details.missing`), and with both CAW writes ONE `card.commented` (`ทำแล้ว: …\nลองได้โดย: …`, paths rewritten for the actor) and the status in the same write.
- `http/routes/cards.ts`: `reason` on hand-off, `done` / `howToTry` on status; `http/errors.ts`: the two codes in the 409 text; `mcp/server.ts`: `reason` on `hand_off`, `done` / `howToTry` on `set_status` (line-break pairs converted like `comment`); `runner/prompt.ts`: the one sentence on rule 3.

**The 22 consumers** (found by running the suite after the patch: 20 failures, as probed): the stub workers that move a card to `review` now send `done` + `howToTry` (`main.test.ts` ×4, `hop.test.ts` ×1); every hand-off of a BE card to the FE-only test worker now carries a `reason` (`cards.test.ts`, `test/mcp/server.test.ts` ×2, `handoff-refused.test.ts`, `hop-guard.test.ts`, `code-map.test.ts`, `rebuild-sequence.test.ts`), and where a test pinned the note text it now reads `text\n\nreason`. The meaning of each case is unchanged. `testkit.ts` did not need a change (no stub there moves a card to review). One pin added in `prompt.test.ts` for the new rule-3 sentence.

**Declared:** the role check, as probed, applies to **any** actor that hands off (the operator's own hand-off goes through the same function); the SPEC's cases (a)–(j) only exercise workers. A `wrong_role` / `review_note_missing` refusal records nothing (only `chain_broken` is recorded, as before) — case (k).

**Evidence (real output)**
- DoD 1: `git status --short --untracked-files=all` → the 15 ` M` paths (`openapi.json`, `src/cards/service.ts`, `src/http/errors.ts`, `src/http/routes/cards.ts`, `src/mcp/server.ts`, `src/runner/{hop.test,main.test,prompt.test,prompt}.ts`, `test/http/{cards,code-map,handoff-refused,hop-guard,rebuild-sequence}.test.ts`, `test/mcp/server.test.ts`) + `?? test/http/review-note.test.ts` — all on the closed list. DoD 2: `git check-ignore -v test/http/review-note.test.ts` → exit `1`.
- DoD 3: `review-note.test.ts` → `11 pass · 0 fail` (a–k). DoD 4: `cards.test.ts handoff-refused.test.ts test/mcp/server.test.ts` → `35 pass · 0 fail` (base 14 + 6 + 15). DoD 5: `main` → `67 pass`, `hop` → `124 pass`, `prompt` → `51 pass` (+1), all `0 fail`.
- DoD 6: `test/db/file.test.ts test/scripts/db-scripts.test.ts` → `12 pass · 0 fail` (passed with the change). DoD 7: `tsc --noEmit --pretty false` → exit `0`.
- DoD 8: whole suite `--timeout 30000` → `988 pass · 1 skip · 1 fail · Ran 990 tests across 74 files`; the fail = the known `withReadGuard … ONE argument`. After: `pgrep -fc 'output-format [s]tream-json'` → `0`.
- DoD 9: `bun run openapi:emit` → `openapi.json | 35 insertions, 20 deletions`; `grep -c 'review_note_missing' openapi.json` → `21`. The 20 deletion/addition pairs are the one repeated 409 description (one per route that lists it); the rest is `reason` (max 2000), `done` and `howToTry` (max 4000) with their descriptions — nothing else.

**UNVERIFIED:** no live worker: whether a real model sends `done` + `howToTry` when told by the rule-3 sentence is QA's live run. The caw-front side (showing the review note / the refusals) is TASK-167.

## Questions

## Review

**2026-10-31 01:0x, Silver — DONE.**
- Re-run by me on caw-back 2426d9a + 16 paths (the closed list; `review-note.test.ts` `??`): `review-note` + `cards` + `handoff-refused` + `test/mcp/server` + `prompt` + the two db tests → `109 pass · 0 fail` · tsc exit 0 · whole suite `988 pass · 1 skip · 1 fail · Ran 990 tests across 74 files`, the fail = the known `withReadGuard … ONE argument` · `openapi:emit` again → byte-identical (`cmp`).
- Against the probe: `routes/cards.ts`, `errors.ts`, `mcp/server.ts`, `prompt.ts` are **byte-identical** to `spec125.patch`'s result; `service.ts` differs only in where one existing comment sits (above `handOff`, where it belongs) — no code differs.
- Cases (a)–(k) cover SPEC-124 D1–D3, the D1 boundary (i) and QA → never a reason (g). The two db tests pass with the change, so my "probe-load flake" reading holds for this run.
- Declared accepted: the role rule also guards an operator's call of the hand-off route; the operator re-assigns through `PATCH …/assignee`, which ignores the chain (`service.ts:203`). Refusals record nothing, as SPEC-124 D2 said.
- UNVERIFIED as Bob wrote: a real model sending `done` + `howToTry` → QA's AC-4. tree-fp 01:08: caw-back `a8e76ef8bc69`.
- **TASK-167 released** to Fanta (the `openapi.json` is final).
