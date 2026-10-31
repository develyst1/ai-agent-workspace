# TASK-121: caw-back — tell the worker to follow every rule; `GET …/coverage` lists spec parts no card covers
- Source: SPEC-109 (REQ-112, Team B side) — D1, D2, D4, § API
- Owner: BE (Bob)
- Status: **DONE** (Silver, 2026-10-30 10:0x — § Review) · was REVIEW (Bob, 2026-10-30 09:5x) — **released 2026-10-30 09:3x** (SA): REQ-105 committed in caw-back (27cbd1b). Build and test on the fake Blueprint now — the PM's 09:0x decision (DECISIONS § ตัดสินใจแทนเจ้าของ) has REQ-112 B wait for this commit only. TASK-117 (Team A's real `relatedDecisions`) is needed for the **live** proof of REQ-112 AC-1, not for this build.
- Depends on: REQ-105 committed (27cbd1b) in caw-back ✓ · TASK-117 shipped — for QA's joint/live proof only, not for this TASK
- **SA notes at release (2026-10-30 09:3x, base 27cbd1b):** (1) the fake's v2 part context has no `relatedDecisions` today (`test/helpers/fake-blueprint.ts` serves the recorded context reshaped, SPEC-106 route 2) ⇒ `test/helpers/fake-blueprint.ts` **is** on your list: add a synthetic `mode.related: Record<key, RelatedDecision[]>` merged into the context, marked `// synthetic — SPEC-106 REQ-112 addition, until recorded`. (2) Renumbering the prompt breaks `src/runner/prompt.test.ts:159-161` (pins "5. In `comment`…" after "4. If you cannot go on") — update those to the new numbers; list it in Notes. Grepped: `grep -rn '"[0-9]\. ' src/runner/prompt.test.ts test` → no other numbered prompt line is pinned; MCP tests only check `description` is a string (`test/mcp/server.test.ts:56`).

## What to do

Closed file list (caw-back): `src/runner/prompt.ts` · `src/runner/prompt.test.ts` · `src/mcp/server.ts` · `src/projects/coverage.ts` (new; was `src/coverage/service.ts` — git-ignored, Q1) ·
`src/http/routes/projects.ts` (the route) · `openapi.json` (re-emitted by `bun run openapi:emit`, never by hand) · `test/http/coverage.test.ts` (new) ·
`test/helpers/fake-blueprint.ts` **only if** TASK-114 left it without a v2 `spec` / part context that can carry `relatedDecisions` — say so. No git.

1. **D1 prompt.** In `buildPrompt` (`src/runner/prompt.ts:13-22`) add after the `card_context` line, as its own numbered line:
   `Follow every rule in spec.decisions and spec.relatedDecisions of your card's context — a rule on a related part applies to your card too.`
   Renumber the lines after it. `card_context`'s description (`src/mcp/server.ts:75`) becomes: `Everything you need to do a card: the card,
   the part of the spec it is anchored to (as Blueprint has it), the decisions covering that part (spec.decisions) and those on the steps
   and works around it (spec.relatedDecisions), the notes on it (oldest first) and the decisions already made for it.`
   Add one `prompt.test.ts` assertion that the prompt contains `relatedDecisions`.
2. **D2 service** `coverage(db, blueprint, projectId, proposalId?)` in `src/projects/coverage.ts` (Q1), exactly SPEC-109 D2 steps 1–5, using
   TASK-114's `blueprint.spec(bp)` and `readLatestPart(db, blueprint, project, key)`. Memo: a module-level `Map`, key
   `${projectId}|${revision}|${anchors.sort().join(",")}`, at most 200 entries (drop the oldest). A proposal not in this project → 404
   `not_found` "proposal".
3. **Route** `GET /v1/projects/{projectId}/coverage` in `src/http/routes/projects.ts`, query `proposalId` (optional uuid), response
   schema exactly SPEC-109 § API (camelCase: `revision`, `uncovered[].key/kind/title/decisions`), errors 400/404/502 as listed.
   Then `bun run openapi:emit`.
4. **Tests** (`test/http/coverage.test.ts`, fake Blueprint): TEST-106's shape — DEC-001…003 cover STEP-002, DEC-005 covers SCR-001,
   one card anchored on SCR-001:
   (a) its context **without** `relatedDecisions` → `uncovered` lists STEP-002 with DEC-001…003;
   (b) **with** `relatedDecisions` carrying them → `uncovered: []`;
   (c) `proposalId` whose item anchors on STEP-002 → STEP-002 not listed, though no card covers it yet;
   (d) a decision covering nothing → listed under itself;
   (e) unknown proposal / another project's proposal → 404; bad uuid → 400; Blueprint down → 502;
   (f) two calls with the same revision and anchors → Blueprint's `spec` read once (count the fake's calls).

## Definition of Done

- [ ] 1. Before. `cd caw-back && git status --short | wc -l` → `0` (base: `0` on 27cbd1b, SA 2026-10-30 09:3x)
- [ ] 2. `bun --no-env-file test src/runner/prompt.test.ts test/mcp` → 0 fail (base: `Ran 60 tests across 3 files`, `0 fail`, SA 2026-10-30 09:3x on 27cbd1b)
- [ ] 3. `bun --no-env-file test test/http/coverage.test.ts` → 0 fail, ≥ 8 tests (base: n/a — new: this TASK creates the file)
- [ ] 4. `grep -c relatedDecisions src/runner/prompt.ts src/mcp/server.ts` → `≥1` each (base: `0` and `0`)
- [ ] 5. `grep -c '/coverage' openapi.json` → ≥ `1` (base: `0`)
- [ ] 6. `bunx tsc --noEmit -p .` → exit 0, no output (base: exit 0, no output, 2026-10-29 15:0x)
- [ ] 7. `bun --no-env-file test` (whole suite) → the known machine fail only (base: `863 pass · 1 skip · 1 fail`, `Ran 865 tests across 70 files` — Bob's TASK-115 run 2026-10-29 19:1x on exactly the tree now committed as 27cbd1b; not re-run by the SA. DoD 4/5/6 base re-run by the SA 09:3x: `0`/`0`, `0`, tsc exit 0)

## Implementation Notes
Bob, 2026-10-30. Repo `caw-back`, branch `atom`, base `27cbd1b`, tree clean at the start (DoD 1: `git status --short | wc -l` → `0`). Nothing committed (SA's). Every command as `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT bun --no-env-file …`; no live CLI, no real DB.

### What changed (7 paths: 5 modified, 2 new)
- **D1 prompt** `src/runner/prompt.ts`: new numbered rule **2** after the `card_context` line — "Follow every rule in `spec.decisions` and `spec.relatedDecisions` of your card's context — a rule on a related part applies to your card too." — the old 2–5 are now 3–6. `src/mcp/server.ts`: the `card_context` description is the text in the TASK, word for word (it also drops "confirmed" from "the confirmed spec", as the TASK's text does).
- **D2 service** `src/projects/coverage.ts` (new; Q1 moved it from `src/coverage/service.ts`, which `.gitignore:31` hid): `coverage(db, blueprint, projectId, proposalId?)`. Anchors = every **work** card's key (any status) + the proposal's item keys; covered = an anchor that is itself a decision + every key in `readLatestPart(K).body.decisions[]` and `.relatedDecisions[].decision` (missing → `[]`; a part is read as `{key}` or a bare key); a gone anchor (`null`) adds nothing; uncovered = every `decision` part of `spec.parts` not covered, grouped under the parts its `covers` links name, or under itself; `uncovered` sorted by key, `decisions` sorted. Memo: module `Map`, key `projectId|revision|sorted anchors`, 200 entries, oldest dropped.
- **Route** `src/http/routes/projects.ts`: `GET /v1/projects/{projectId}/coverage?proposalId=<uuid>` (`projectId` as in the SPEC, not `id`); schema `Coverage` camelCase exactly as SPEC-109 § API; 400 / 404 / 502. `openapi.json` re-emitted: `110 insertions(+)`, no deletion (`git diff -U0 | grep '^-'` → none).
- **Fake** `test/helpers/fake-blueprint.ts` (SA note 1): three synthetic knobs, each marked `// synthetic — SPEC-106 v2 + the REQ-112 addition, until recorded`: `mode.snapshot` (the `parts`/`links` of `/spec`; default none, as before), `mode.related` (the `relatedDecisions` a context carries, with `relatedDecisionsMore: false`), `mode.decisionsOn` (the `decisions` a context carries). With none set, every answer is what it was.
- **Tests** `src/runner/prompt.test.ts` (SA note 2): the rule-5 test is now rule **6** (`"6. In \`comment\`…"`, after `"5. If you cannot go on"`) and its title says 6; + 1 new test (the prompt contains `relatedDecisions`, rule 2, after `card_context`). `test/http/coverage.test.ts` (new, 8).

### Decisions I made (reviewer may overturn)
1. **`Interpreted` TEST (f).** The TASK says two calls with the same revision and anchors → "Blueprint's `spec` read once". The memo's key contains `spec.revision`, which is learnt **from** `/spec` — so `/spec` is read once **per call**, and what the memo skips is each part's **context** read. Test (f) asserts exactly that: 2 calls → 2 `/spec` reads, 1 context read; a new revision or a new card reads again. If you meant one `/spec` read in total, the memo would need a key that does not contain the revision — that would serve a stale answer after an edit, so I did not.
2. A `spec()` that is `null` (Blueprint has no such project) → `404 blueprint_project_not_found`, as `createProject` does. A Blueprint that does not answer → 502 (`BlueprintUnreachable`, the common handler).
3. A `covers` link whose target is not in `spec.parts` is still listed, with `kind` and `title` empty (nothing to show but the key).
4. `question` cards are not anchors (D2 step 2 says **work** cards).

### Existing tests changed (each: why)
- `src/runner/prompt.test.ts` — the rule-5 pin → rule 6 (SA note 2). Nothing else.
- No other existing test changed: the fake's three knobs are off by default.

### New tests (`test/http/coverage.test.ts`, 8)
(a) no `relatedDecisions` → STEP-002 with DEC-001…003 · (b) with them → `[]` (revision bumped: the memo is per revision) · (c) a proposal anchored on STEP-002 covers it; without `proposalId` it is still listed · (d) a decision covering nothing is listed under itself; grouped and sorted · (e) 404 for an unknown project, an unknown proposal and **another project's** proposal (found on its own project) · (e) bad uuid → 400, Blueprint down → 502, no event written · (f) memo, as in Decision 1 · done card counts, gone anchor adds nothing.

### DoD evidence (real output, 2026-10-30)
1. `git status --short | wc -l` → `0` on `27cbd1b` (before).
2. `bun --no-env-file test src/runner/prompt.test.ts test/mcp` → `61 pass · 0 fail · Ran 61 tests across 3 files` (base 60: +1 new test).
3. `bun --no-env-file test test/http/coverage.test.ts` → `8 pass · 0 fail` (≥ 8).
4. `grep -c relatedDecisions src/runner/prompt.ts src/mcp/server.ts` → `src/runner/prompt.ts:2` · `src/mcp/server.ts:1` (base `0` / `0`).
5. `grep -c '/coverage' openapi.json` → `1` (base `0`).
6. `bunx tsc --noEmit -p .` → exit `0`, no output (after the move too).
Q1 evidence: `git status --short --untracked-files=all | grep coverage` → `?? src/projects/coverage.ts` and `?? test/http/coverage.test.ts`; `git check-ignore -v src/projects/coverage.ts` → exit `1` (not ignored).
7. `bun --no-env-file test` (whole suite, after the Q1 move) → `872 pass · 1 skip · 1 fail · Ran 874 tests across 71 files` (base 863 / 1 / 1 on 70 files: +9 tests, +1 file). The one fail is `src/runner/settings.test.ts` (`withReadGuard … PreToolUse hook`, the known machine fail; file untouched). After: no listener on :45xx, `pgrep -fc 'output-format [s]tream-json'` → `0`.

### UNVERIFIED
- The `relatedDecisions` shape (`[{ via, decision: Part }]`) and the parts/links of `/spec` are SYNTHETIC (SPEC-106 REQ-112 addition, not built: TASK-117 is Team A's) — a real blueprint-back may differ → QA's joint/live proof (REQ-112 AC-1).
- A `relatedDecisionsMore: true` context (> 50) may list a covered decision as uncovered — the SPEC's stated limit; not tested.
- `silent-failure-hunter`: not available here, not run. The new code has no `catch` of its own; errors propagate to the common handler.

## Questions

**Q1 (Bob, 2026-10-30 09:2x — blocks only the commit, not the build or the tests).** The closed list says `src/coverage/service.ts` (new). caw-back's `.gitignore:31` is `coverage` (a test-coverage output dir), and it matches the **directory** `src/coverage/`: `git check-ignore -v src/coverage/service.ts` → `.gitignore:31:coverage	src/coverage/service.ts` (exit 0), and `git status --short --untracked-files=all` does not list it, while every other new path shows. So a plain `ขึ้น git` would commit the route (`routes/projects.ts` imports it) **without** the service, and the pushed tree would not build. The service is written and tested at that path now.
  Options: (a) move it to `src/projects/coverage.ts` (not matched by the pattern — it matches a whole name `coverage`, and `coverage.ts` is not that; `test/http/coverage.test.ts` already shows as untracked); one import line changes in `routes/projects.ts`. (b) keep the path and change `.gitignore:31` to `/coverage` (a repo-wide rule, not on my list). (c) keep both, and the SA force-adds the one file at commit.
  My default if no answer: **(a)** — it needs no repo-wide change and no special step at commit time. I will not move it before you say so, because the path is on your closed list.
  Checked: TASK-121 closed file list; SPEC-109 § Tasks (no path named there); `.gitignore:31`.
  > answer: **(a), yes** — move it to `src/projects/coverage.ts` and change the one import in `src/http/routes/projects.ts`; the closed list and step 2 now name that path. SA checked 2026-10-30 09:4x: `git check-ignore -v src/coverage/service.ts` → `.gitignore:31:coverage` (it is hidden, as you say); `git check-ignore -v src/projects/coverage.ts` → exit 1 (not ignored). `.gitignore` stays untouched. Add to DoD evidence: `git status --short --untracked-files=all | grep coverage` → `src/projects/coverage.ts` and `test/http/coverage.test.ts` both listed. Good catch — my path. — Silver (SA) 2026-10-30 09:4x

## Review
**Verdict: DONE** — Silver (SA), 2026-10-30 10:0x. Against SPEC-109 D1, D2, § API and the Q1 answer.
- **Evidence re-run by me** (`env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT`, `--no-env-file`): `bunx tsc --noEmit -p .` → `0`; `bun test src/runner/prompt.test.ts test/mcp test/http/coverage.test.ts test/http/projects.test.ts` → `84 pass · 0 fail · Ran 84 tests across 5 files`. Whole suite (872/1/1, only the known `settings.test.ts`) taken from the Notes, not re-run.
- **Scope:** `git status --short --untracked-files=all` → exactly the 8 listed paths (6 modified, `src/projects/coverage.ts` + `test/http/coverage.test.ts` new); `git status --ignored -- src test` → nothing ignored (Q1 trap closed). `openapi.json` diff: 0 deleted lines.
- **D1:** read `src/runner/prompt.ts:17-23` — rule 2 is the SPEC sentence word for word, after `card_context`; 3–6 renumbered; the prompt test pins rule 6 after 5. MCP description = the TASK text.
- **D2:** `src/projects/coverage.ts` (64 lines) writes nothing; memo capped at 200 (`:15`, `:61`, oldest dropped).
- **Decisions:** 1 **accepted — my TASK text was wrong**: the memo key holds `spec.revision`, which only `/spec` can give, so `/spec` is read on every call and the memo saves the part-context reads (a key without the revision would serve a stale answer after an edit, against D2 step 5). 2 (no such Blueprint project → 404 `blueprint_project_not_found`), 3 (a `covers` target missing from `parts` still listed, empty kind/title), 4 (question cards are not anchors — D2 step 2) **accepted**.
- **UNVERIFIED (carried, not blocking):** `relatedDecisions` and `/spec` `parts`/`links` are synthetic in the fake until Team A's TASK-117 → QA's live proof of REQ-112 AC-1; `relatedDecisionsMore: true` path untested (the SPEC's stated limit).
