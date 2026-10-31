# TASK-170: caw-back — a later plan adds only the work not already open on the board; `Proposal.onBoard` (REQ-126 round 2)
- Source: SPEC-126 D1, D2, § API
- Owner: BE (Bob)
- Status: DONE (2026-10-31 04:1x, Silver — § Review) · was REVIEW (2026-10-31, Bob; DoD 1–6 run — see Implementation Notes)
- Depends on: REQ-126 r1 committed (caw-back 5b49f65) ✓ — caw-back tree clean at 03:44
- Git: none

## What to do
Closed file list (caw-back): `src/proposals/service.ts`, `src/http/routes/proposals.ts`, `openapi.json` (emitted), `test/http/plan-copy.test.ts`, `test/http/proposals.test.ts`. Nothing else. A need outside it → `## Questions`, and stop.

1. **D1 + D2 + the schema field:** apply `ai-worker/tests/harness/spec126-r2.patch` (desk side) by hand to `src/proposals/service.ts` and `src/http/routes/proposals.ts`. It is the SPEC's design exactly, and the probe ran it. Keep its comments. In short: `liveCards` / `onBoardOf` / `proposalView(s, p)`; in `accept`, all on the board → 409 `plan_already_accepted` (`แผนนี้ตกลงไปแล้ว`), else cards for the fresh items only (consecutive numbers, `dependsOn` on a skipped item → the open card(s) with its key, `cardIds` = the new ones); `ProposalSchema.onBoard`.
2. `bun run openapi:emit`.
3. **The 4 probed tests** (SPEC-126 § API, probe line), rewritten to the round 2 rule, each keeping its name's point:
   - `plan-copy.test.ts` "B with one title changed → 200": now **→ 409** — same key, other words = the same work (this is DEF-2's case). Rename the test to say so. Keep the trimmed-title part (also 409).
   - `plan-copy.test.ts` "a different anchor, a different worker, or a different number of items is a different plan": other anchor → 200 (1 card) · **other worker, same key → 409** (key only, SPEC-126 D2 table) · same item + one new key (`STEP-005`) → **200 with exactly 1 new card, on STEP-005**. Rename to match.
   - `proposals.test.ts:69` (propose 201 shape): add `onBoard: []` to the expected object.
   - `proposals.test.ts:199` (second accept / not_a_member): give `p2`'s item another anchor (e.g. `STEP-003`) so it is new work and the `not_a_member` path is still reached.
   Update `plan-copy.test.ts`'s header comment (lines 1–2) to the round 2 rule.
4. **New tests in `test/http/plan-copy.test.ts`** (one `test` each, the existing `world()` helper; requirement keys via `w.fake.mode.extraParts["REQ-00n"] = { kind: "requirement", … }` as `proposals.test.ts` REQ-118 does):
   - **AC-7, word for word:** `ai-worker/tests/harness/spec126-r2-plans.json` (desk side). Seed REQ-001…REQ-009 as requirements; map role BE → `chain.a` or `b`, FE and QA → the others (any 3 members). Propose + accept `first` (9 cards); propose `second` → `onBoard` = `[0,1,2,3,4,5,6,7,8]`; accept → 409 `plan_already_accepted`, card count still 9, no event written. Copy the titles/todos into the test as literals (the test must not read a desk file).
   - **AC-8:** accept a plan on STEP-004; then a plan [same STEP-004 item reworded, a new STEP-005 item with `dependsOn: [0]`] → `onBoard` `[0]`; accept → 200, exactly 1 card (STEP-005), whose `dependsOn` = the id of the STEP-004 card from the first plan; the proposal's `cardIds` has 1 id.
   - **Done does not count (Q2 C):** accept a STEP-004 plan, set its card `done` (operator), propose STEP-004 again → `onBoard` `[]`, accept → 200, 1 new card.
   - **Removed does not count (3d), read side only:** propose + accept a STEP-004 plan (a STEP-004 card exists), propose STEP-004 again (open, `onBoard` `[0]`), then remove STEP-004 the way `test/http/anchor-removed.test.ts:16-33` does (`s.fake.mode.changes.push({ … removed: ["STEP-004"] })` + `follow.pullAll()`): the open proposal's `onBoard` on `GET …/proposals` → `[]`. (Accepting it would be 422 `anchor_not_in_version` anyway, since the part is gone.) If that world cannot be built inside `plan-copy.test.ts` without a new helper file, write `UNVERIFIED — <why>` in Implementation Notes and skip it.
   - **Read side:** `GET …/proposals` → the open proposal carries `onBoard`, an accepted one `[]`.
   Keep the existing "a plan that was never accepted blocks nothing" test passing (its point is unchanged).
5. Do **not** change the MCP tool text, the prompt, or anything about how the chat worker proposes (REQ § Round 2 Out of Scope).

## Definition of Done
From caw-back, every `bun` line as `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT DATABASE_URL=pglite:memory bun --no-env-file …`.
- [ ] 1. `git status --short --untracked-files=all` → exactly the closed list, nothing else (base: empty, SA 03:44 on 5b49f65)
- [ ] 2. `bun test test/http/plan-copy.test.ts test/http/proposals.test.ts` → 0 fail, ≥ 21 tests (base: `16 pass · 0 fail · 2 files`, SA 03:44; with the patch as probed: 4 fail — the 4 above)
- [ ] 3. `node_modules/.bin/tsc --noEmit --pretty false` → exit 0 (base: exit 0, SA 03:44)
- [ ] 4. `bun test` (whole) → only the known `withReadGuard … ONE argument` fail (base: `1008 pass · 1 skip · 1 fail`, the fail = `withReadGuard … ONE argument`, SA 03:53 on 5b49f65 run alone. Run at 03:47 beside a probe it gave 4 fail + 1 error: run it alone)
- [ ] 5. `bun run openapi:emit`, then `grep -c '"onBoard"' openapi.json` → ≥ 1 (base: `0`, SA 03:4x: `grep -c onBoard openapi.json` → 0 on 5b49f65; the probe's patched copy → 2)
- [ ] 6. `git diff --stat` names only `src/proposals/service.ts`, `src/http/routes/proposals.ts`, `openapi.json`, the two test files (base: n/a — new: the change)
No new file, so no `git check-ignore` line.

## Implementation Notes
Built in `caw-back` on `5b49f65` (tree clean at start), nothing committed by me. Every command ran as `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT … bun --no-env-file …`. No live Claude. Exactly the 5 closed-list files changed.

**What changed** (`spec126-r2.patch`, applied by hand with the editor, comments kept; no difference from the patch)
- `proposals/service.ts`: `liveCards` (the project's work cards that are not `done` and whose `anchorRemovedRevision` is null, optionally for one key), `onBoardOf(s, p)` (indexes of an OPEN proposal's items whose anchor key is on a live card; `[]` for accepted / superseded), `proposalView(s, p)` adds `onBoard`; `propose` and `listProposals` pass the state. `accept`: all items on the board → 409 `plan_already_accepted` (`แผนนี้ตกลงไปแล้ว`), nothing written; otherwise cards for the fresh items only, numbered consecutively from the next free number, `dependsOn` of an item that points at a skipped (on-board) item = the live card(s) holding that key, `proposal.accepted.cardIds` = the new ids only, and the response is those cards. Round 1's "same items" check is replaced by this (an identical copy is one case of it).
- `http/routes/proposals.ts`: `ProposalSchema.onBoard` (`int ≥ 0` array, with its description). `openapi.json`: `Proposal.onBoard` and its `required` entry only.

**The 4 probed tests**, each keeping its name's point: `plan-copy` "B with one title changed" → now **409** (same key, other words = the same work; the trimmed-title part also 409), renamed; "a different anchor, a different worker…" → other part 200 with 1 card · other worker on the SAME part 409 · same item + a new `STEP-005` → 200 with exactly 1 new card, on `STEP-005`, renamed; `proposals.test.ts` propose-201 shape gains `onBoard: []`; the second-accept / `not_a_member` test gives `p2` another anchor (`STEP-003`) so its item is new work and the 400 is still reached. The header comment of `plan-copy.test.ts` is the round 2 rule. "A plan that was never accepted blocks nothing" is untouched and green.

**New tests in `plan-copy.test.ts`** (one `test` each, the existing `world()`): **AC-7 word for word** — the 9-item `first` and the reworded 9-item `second` of TEST-122 round 2 as literals in the test (no desk file read), REQ-001…009 seeded through `extraParts`, roles BE/FE/QA → the chain's three workers: accept `first` → 9 cards; `second.onBoard` = `[0…8]`; accept → 409, 9 cards still, no event written · **AC-8** — `[STEP-004 reworded, new STEP-005 depends on 0]` → `onBoard [0]`, accept → 1 card (STEP-005), `dependsOn` = the first plan's STEP-004 card id, number = that card's + 1, `cardIds` = that 1 id, rebuild-check clean · **done does not count** (Q2 C) · **removed does not count** (3d, read side; built inside this file with `fake.mode.changes` + `follow.pullAll()` as `anchor-removed.test.ts` does, no new helper) · **read side** (open → `onBoard`, accepted / superseded → `[]`).

**Evidence (real output)**
- DoD 1/6: `git status --short --untracked-files=all` → ` M openapi.json`, ` M src/http/routes/proposals.ts`, ` M src/proposals/service.ts`, ` M test/http/plan-copy.test.ts`, ` M test/http/proposals.test.ts`; `git diff --stat` → `5 files changed, 163 insertions(+), 27 deletions(-)`.
- DoD 2: `plan-copy.test.ts proposals.test.ts` → `21 pass · 0 fail · Ran 21 tests across 2 files` (base 16; the 4 probed fails are the 4 rewritten above).
- DoD 3: `tsc --noEmit --pretty false` → exit `0`. DoD 4: whole suite, run alone → `1013 pass · 1 skip · 1 fail · Ran 1015 tests across 76 files`; the fail = the known `withReadGuard … ONE argument`; `pgrep -fc 'output-format [s]tream-json'` → `0`.
- DoD 5: `bun run openapi:emit`, `grep -c '"onBoard"' openapi.json` → `2` (the property and its `required` entry); the diff is those lines only.

**UNVERIFIED:** nothing live — whether the entry worker's real reposts now show the right `onBoard` on the screen is QA's run with TASK-171's front; the AC-7 plans were seeded with fake requirement parts (no real Blueprint).

## Questions

## Review
**DONE (Silver, 2026-10-31 04:10).** Against SPEC-126 D1, D2 and § API, re-run by me on Bob's tree:
- `src/proposals/service.ts` and `src/http/routes/proposals.ts` are **byte-identical** to the probed `spec126-r2.patch` result (`cmp` against my scratch copy). Scope: `git status` → exactly the 5 closed-list files.
- `bun test test/http/plan-copy.test.ts test/http/proposals.test.ts` → 21 pass · 0 fail (base 16). tsc → 0. `openapi:emit` re-run → byte-identical to Bob's `openapi.json` (`onBoard` + its `required` entry only).
- Every case the TASK asked for is a test: the 4 probed ones rewritten (each name keeps its point); AC-7 word for word — all 18 titles of `tests/harness/spec126-r2-plans.json` appear as literals (checked by script); AC-8 with `dependsOn` = the first plan's STEP-004 card; done does not count (Q2 C); removed does not count (3d, read side, the anchor-removed pull pattern); read side `onBoard` on open / `[]` on accepted.
- Whole suite: my first run (04:03, load 2.4 from other sessions) → 1010 / 1 / 4 fail + 1 error. The 3 extra (`test/follow/pull.test.ts` ×2, `test/scripts/db-scripts.test.ts` Case C) **pass alone, twice each** (14/0, 11/0), and match the base's run under load (03:47: 4 fail + 1 error). Re-run alone 04:08–04:10 → **1013 pass · 1 skip · 1 fail** (the known `withReadGuard … ONE argument`), = Bob's.
- caw-back fp after review: `8beff9850492` (HEAD 5b49f65, 256 paths). TASK-171 step 7 (`gen:api`) released.
