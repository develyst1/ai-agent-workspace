# TASK-152: caw-back — the number typed for "อัตโนมัติ" is this run's steps (remove the project-wide budget check)
- Source: SPEC-118 (REQ-120)
- Owner: BE (Bob, Team B)
- Status: DONE (2026-10-30 18:10, Silver — § Review)
- Depends on: REQ-118 committed (caw-back 3efcc1a) ✓

## What to do

Read SPEC-118 § Overview and § D1 first (5 minutes). Base: caw-back `atom` 3efcc1a, tree clean. No git.

**Closed file list — exactly these 5 (2 source, 3 tests), nothing else:**
`src/hops/service.ts` · `src/runner/main.ts` · `src/runner/main.test.ts` · `test/http/hops-runs.test.ts` ·
`test/http/chat-hops-budget.test.ts` — every path the DoD below names is on it (F-047).

1. `src/hops/service.ts` — delete the `if (!message && project.mode === "dispatcher" && project.hopsUsed >=
   project.hopBudget) { throw … "the project's hop budget (…) is spent" }` block (lines 50-52). Extend the
   comment above it (line 49) with one line: the run's budget is the only one (REQ-120). The exact patch the SA
   probed is `i-space/ai-worker/tests/harness/spec120-probe.patch` — use it as the reference.
2. `src/runner/main.ts:278` — only the trailing comment: `// the project's budget, which the plan cannot see` →
   `// the run's budget, filled since the listing (REQ-120: the only budget)`. The code on that line stays.
3. `src/runner/main.test.ts:185` — rewrite the test `the PROJECT's budget can refuse a hop the run's budget would
   allow …` as REQ-120 AC-1/AC-2 (keep its place in the `describe`):
   name: `REQ-120: a second run with the same number takes its own steps — the first run's hops do not count`.
   With `auto(5, 2)`: drive run 1 → `budget_spent`, 2 hops in it. Switch to `manual`, then `dispatcher` with
   `hopBudget: 2` again (as the screen does: `PATCH …/mode`), drive the runner again. Expect: 2 runs; the newest
   ended `budget_spent` with **2** hops whose `runId` is its id; its `report` contains `- 2 ก้าว จากงบ 2` and
   `- เหตุที่จบรอบ: ใช้งบครบแล้ว`; project `hopsUsed` = 4 (lifetime count unchanged in meaning).
   (How run 2 opens: the runner's `open_run` after its one quiet tick, `main.ts:247-252`, with the project's
   `hopBudget` 2 — or call `POST …/runs {hopBudget: 2}` yourself as `actions.ts` does; either is fine, say which.)
4. `test/http/hops-runs.test.ts:69` — the test `budget (dispatcher only): hopsUsed ≥ hopBudget → 409 no_budget; …`
   now pins the opposite. Rename to `REQ-120: no project-wide budget — dispatcher hopsUsed ≥ hopBudget no longer
   refuses; manual mode has no limit; switching modes never resets hopsUsed`. Keep every `hopsUsed` assertion
   (REQ-011 AC-6). Change the two `no_budget` expectations (`:80`, `:90`) to `201`, and finish those hops so the
   later steps still hold (no hop left running before the next `hopOn`).
5. `test/http/chat-hops-budget.test.ts:20` — the test `dispatcher, hopsUsed = hopBudget: a CARD hop → 409
   no_budget, a CHAT hop → 201` → make the card hop's refusal come from a **run**: open `POST …/runs {hopBudget: 1}`
   and send the card hops with that `runId`; the expectations (`409 no_budget` for the 2nd card hop, `201` for the
   chat hop) stay. Rename: `a run at its budget: a CARD hop → 409 no_budget, a CHAT hop → 201 (REQ-120: the run's
   budget is the only one)`. Update the file's header comment (lines 1-2: "exempt from the project's budget
   (dispatcher) and from a run's budget") to name the run's budget only.

## Definition of Done
- [ ] 1. Before: `git status --short --untracked-files=all | wc -l` → `0` (base: `0` on `3efcc1a`, SA 17:58)
- [ ] 2. `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT bun --no-env-file test src/runner/main.test.ts` → `0 fail`, 63 tests, the REQ-120 test named in the output (base: `63 pass · 0 fail · Ran 63 tests across 1 file`, SA 17:58 on `3efcc1a`)
- [ ] 3. Same form, `test/http/hops-runs.test.ts test/http/chat-hops-budget.test.ts` → `0 fail`, 15 tests (base: `9 pass · 0 fail` and `6 pass · 0 fail`, SA 17:58 on `3efcc1a`)
- [ ] 4. `grep -rn "project's hop budget" src | grep -v '\.test\.ts:'` → no output (base: `src/hops/service.ts:51:…`, SA 18:00 on `3efcc1a`; the `main.test.ts:833` hit is a mocked chat-hop refusal text in another test — not on the closed list's changes, leave it)
- [ ] 5. `bunx tsc --noEmit -p .` → exit `0` (base: `0` on `3efcc1a`, SA 17:58)
- [ ] 6. Whole suite, same env form: `… bun --no-env-file test --timeout 30000` → `916 pass · 1 skip · 1 fail`, the one fail the known `withReadGuard` (`src/runner/settings.test.ts`) (base: `916 pass · 1 skip · 1 fail · Ran 918 tests across 72 files`, fail = withReadGuard, SA 18:01 on `3efcc1a`)
- [ ] 7. `bun run openapi:emit` then `git diff --stat openapi.json` → no output (base: emit exit 0, `git diff --stat openapi.json` empty, SA 18:00 on `3efcc1a`; SPEC-118 probe: the same after the patch)
- [ ] 8. After: `git status --short --untracked-files=all` → exactly the 5 closed-list paths, all ` M`; `pgrep -fc 'output-format [s]tream-json'` → `0` (base: n/a — new: the list is this TASK's)

## Implementation Notes
Built in `caw-back` on `3efcc1a`, nothing committed by me, exactly the 5 closed-list paths. Every command ran as `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT … bun --no-env-file …`; no live hop, no real DB.

**What changed**
- `src/hops/service.ts`: the project-wide `no_budget` block is gone; the comment above it carries the REQ-120 line. The `src` diff is the same as `spec120-probe.patch` for these two files (read back with `git diff`).
- `src/runner/main.ts:278`: trailing comment only.
- `main.test.ts`: the old PROJECT-budget test is rewritten as `REQ-120: a second run with the same number takes its own steps — the first run's hops do not count` (same place in the `describe`). `auto(5, 2)`, run 1 drives to `budget_spent` with 2 hops; `PATCH …/mode` manual then dispatcher `hopBudget: 2`; the same runner drives again. **Run 2 is opened by the runner's own `open_run`** (one quiet tick, then the project's `hopBudget` 2), not by a `POST …/runs` of mine. Asserts: 2 runs, the newest `budget_spent` with 2 hops of its own `runId`, report holds `- 2 ก้าว จากงบ 2` and `- เหตุที่จบรอบ: ใช้งบครบแล้ว`, project `hopsUsed` 4.
- `hops-runs.test.ts`: renamed as asked; the two `no_budget` expectations are `201`, and each of those hops is finished. Because those hops now happen, the lifetime counts in the later `hopsUsed` assertions read `3`, `3`, `4`, `5` (they were `2`, `2`, `3`) and the last card gets a hop too — same assertions in kind (REQ-011 AC-6: never reset by a mode switch or a typed number), different numbers.
- `chat-hops-budget.test.ts`: the card hops now carry a run (`POST …/runs {hopBudget: 1}`, `runId` on both); the expectations (`409 no_budget` for the 2nd card hop, `201` for the chat hop) are unchanged; renamed and the header comment names the run's budget only.

**Evidence (real output)**
- DoD 1: `git status --short --untracked-files=all | wc -l` → `0` at start (HEAD `3efcc1a`).
- DoD 2: `bun --no-env-file test src/runner/main.test.ts` → `63 pass · 0 fail · Ran 63 tests across 1 file`.
- DoD 3: `bun --no-env-file test test/http/hops-runs.test.ts test/http/chat-hops-budget.test.ts` → `15 pass · 0 fail` (9 + 6); the three files together `78 pass · 0 fail · Ran 78 tests across 3 files`.
- DoD 4: `grep -rn "project's hop budget" src | grep -v '\.test\.ts:'` → no output.
- DoD 5: `bunx tsc --noEmit -p .` → exit `0`.
- DoD 6: whole suite `--timeout 30000` → `916 pass · 1 skip · 1 fail · Ran 918 tests across 72 files`; the fail = the known `withReadGuard … PreToolUse hook` (`settings.test.ts`).
- DoD 7: `bun run openapi:emit` → `wrote …/openapi.json`; `git diff --stat openapi.json | wc -l` → `0` (empty).
- DoD 8: `git status --short --untracked-files=all` → ` M src/hops/service.ts`, ` M src/runner/main.test.ts`, ` M src/runner/main.ts`, ` M test/http/chat-hops-budget.test.ts`, ` M test/http/hops-runs.test.ts`; `pgrep -fc 'output-format [s]tream-json'` → `0`.
- **The new tests do test the change:** with the old project-wide check put back for one run, `main.test.ts` + the two HTTP files gave `76 pass · 2 fail` — the REQ-120 `main.test.ts` case and the REQ-120 `hops-runs.test.ts` case failed; the line was then removed again (`grep -c MUTATION src/hops/service.ts` → `0`, and the files re-run green above).

**UNVERIFIED:** no live run on a real runner (guardrail) — QA's O-1 re-run (TEST-117) settles the screen-to-report path.

## Questions

## Review
**DONE** — Silver, 2026-10-30 18:10. Re-run by me on caw-back 3efcc1a + the 5 paths (uncommitted):
- Scope: `git status --short --untracked-files=all` → exactly the 5 closed-list paths, all ` M` (44+/30−). Source diff of `src/hops/service.ts` and `src/runner/main.ts` = `tests/harness/spec120-probe.patch` line for line (SPEC-118 D1).
- DoD 2+3: the three test files together → `78 pass · 0 fail · Ran 78 tests across 3 files`.
- DoD 4: `grep -rn "project's hop budget" src | grep -v '\.test\.ts:'` → no output (exit 1). DoD 5: `bunx tsc --noEmit -p .` → 0.
- DoD 6: whole suite → `916 pass · 1 skip · 1 fail · Ran 918 tests across 72 files`, the fail = known `withReadGuard` (= base).
- DoD 7: `openapi:emit` → `git diff --stat openapi.json` empty. DoD 8: `pgrep -fc 'output-format [s]tream-json'` → 0.
- Tests read against SPEC-118: the `main.test.ts` REQ-120 case is AC-1 + AC-2 through the real runner and in-memory API (run 2 opened by the runner's own `open_run`, 2 own hops, report `- 2 ก้าว จากงบ 2` / `ใช้งบครบแล้ว`, lifetime `hopsUsed` 4). `hops-runs.test.ts`: the new counts 3/3/4/5 follow from the hops that are now allowed; every "never reset" assertion kept (REQ-011 AC-6). `chat-hops-budget.test.ts`: the refusal now comes from a run's budget, chat exemption unchanged. Bob's mutation check (old check back → the two REQ-120 cases fail) is accepted as stated; I did not repeat it.
- caw-front untouched (1287772, clean): `bun test src` → `355 pass · 0 fail` (REQ-120 AC-3, 18:10).
- tree-fp at review: caw-back 3efcc1a fp `a95143c64740` (249 paths).
UNVERIFIED (QA's): the screen path — a second "อัตโนมัติ" with the same number from caw-front against a stub runner.
