# TASK-149: caw-back — requirements route, chat system-prompt block, requirement anchors, coverage, pull flag, prompt + skills line (REQ-118)
- Source: SPEC-117 (REQ-118, Team B side; contract = SPEC-115)
- Owner: BE (Bob)
- Status: DONE (2026-10-30 17:1x, Silver; § Review) · was REVIEW (2026-10-30, Bob; DoD 1–10 run, Q1 non-blocking — see Implementation Notes) · was TODO, released 2026-10-30 16:5x, Silver (bases re-run on `b6fbfaf`)
- Depends on: REQ-119 round 2 committed (`b6fbfaf`) ✓. Round 1 is `7956aa7` ✓. Why round 2 too: QA tests round 2 on this one caw-back tree and fingerprints the whole tree (`tools/tree-fp.sh`). Building TASK-149 in the same tree during her test would change that fingerprint before the owner's git (F-013). The files themselves do not overlap (round 2 = `main.ts`, `main.test.ts`).
- Consumer probe done (SPEC-117 § Consumers, 16:5x): 2 hits, both `src/runner/prompt.test.ts`, already on the closed list.

## What to do
Read SPEC-117 D1–D4 and SPEC-115 § API. Repo `caw-back`, branch `atom`. **No git.** Every command
`env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT … bun --no-env-file …`. No live hop, no real DB, no gateway.
Team A's `requirements` field is **not** in Blueprint yet: the fake Blueprint (`test/helpers/fake-blueprint.ts`) sends it in your tests.

1. **D1 prompt + skills** — `src/runner/prompt.ts` line 2 → SPEC-117 D1's sentence, exactly. Line 5 of `skills/role-{ba,be,fe,pm,qa,sa}/SKILL.md` → D1's sentence, exactly (one line each, nothing else in those files). `prompt.test.ts`: assert both.
2. **D2.1 route** — `GET /v1/projects/{projectId}/requirements` in `src/http/routes/projects.ts`, logic in a new `src/projects/requirements.ts` (beside `coverage.ts`, same 404/502 handling as `coverage.ts:27,32-33`). Response exactly `{ revision, requirements: [{ key, title, text }] }`, numeric-aware key order. Test `test/http/requirements.test.ts`: 3 requirements + 1 decision in the fake spec → only the 3, ordered `REQ-002`, `REQ-010` style; no requirement → `[]`; Blueprint down → 502; unknown project → 404.
3. **D2.2 runner** — `src/runner/api.ts` `requirements(projectId)`; `src/runner/hop.ts` (chat hop only, before spawn): fetch, build the block (SPEC-117 D2.2, exact header and `## KEY — title` lines, text verbatim), append to the skills text (write the file even when the worker has no skills); failure → the one-line block + one log line, the hop goes on. Put the block builder in `prompt.ts` (`requirementsBlock(...)`, pure) so it is unit-tested. Card hops: no block.
4. **D2.3 chat prompt** — `buildChatPrompt` step 2b + step 3's words (SPEC-117 D2.3, exact). `prompt.test.ts`.
5. **D2.4 proposals** — `src/proposals/service.ts:53-56`: a not-located key starting `REQ-` is read in `checkAnchors` and accepted only when the read's `part.kind === "requirement"`; any other not-located key → 422 `anchor_not_located` before any Blueprint call (unchanged). `test/http/proposals.test.ts`: not-located `REQ-003` that is a requirement → 201; not-located `REQ-003` whose part is another kind → 422 `anchor_not_located`; not-located `WRK-009` → 422 with no Blueprint read.
6. **D3 coverage** — `src/projects/coverage.ts`: requirement parts not anchored → `{ key, kind: "requirement", title, decisions: [key] }`, sorted with the rest. `test/http/coverage.test.ts`: the TEST-106 shape (8 requirements, all cards on `REQ-001`) → `REQ-002…REQ-008` uncovered; a proposal item on `REQ-004` takes it up; a card on a work part takes up none.
7. **D4 pull** — `src/follow/pull.ts:83`: a set with a `REQ-` key in `added`/`changed`/`removed` flags every card with `anchorRevision < rev`. `test/follow/pull.test.ts`: edit `REQ-005` → every card's id in `spec.revised.cardIds`; edit `WRK-001` → only its cards (unchanged). One context test (AC-4): edit a requirement's text in the fake spec between two hops → the second hop's `card_context.spec.requirements` holds the new text, the first hop's pin keeps the old.
8. `bun run openapi:emit` → only the new route (+ any description) in the `openapi.json` diff.

Closed file list: `src/runner/{prompt,prompt.test,hop,api}.ts`, `skills/role-{ba,be,fe,pm,qa,sa}/SKILL.md`, `src/http/routes/projects.ts`, `src/projects/requirements.ts` (new), `src/proposals/service.ts`, `src/projects/coverage.ts`, `src/follow/pull.ts`, `test/http/{requirements (new),proposals,coverage}.test.ts`, `test/follow/pull.test.ts`, `test/helpers/fake-blueprint.ts` (only to send `requirements` / requirement parts), the context test's file (name it in the Notes; an existing `test/http/*` file preferred), `openapi.json`. New paths not git-ignored (`git check-ignore -v src/projects/requirements.ts test/http/requirements.test.ts` → exit 1, SA 15:5x).

## Definition of Done
(bases re-run on `b6fbfaf` (REQ-119 r2 committed, tree clean) by the SA 2026-10-30 16:5x. The first bases were on `4cc3241` 15:5x.)
- [ ] 1. Before: `git status --short | wc -l` → `0` (base: `0`)
- [ ] 2. `grep -c "spec.requirements" src/runner/prompt.ts skills/*/SKILL.md` → each `1` (base: all `0`)
- [ ] 3. `grep -c "/requirements" src/http/routes/projects.ts src/runner/api.ts openapi.json` → each ≥ 1 (base: all `0`)
- [ ] 4. `grep -c '"requirement"' src/projects/coverage.ts src/proposals/service.ts` → each ≥ 1 (base: both `0`)
- [ ] 5. `bun --no-env-file test test/http/coverage.test.ts test/follow/pull.test.ts test/http/proposals.test.ts test/mcp/chat-tools.test.ts src/runner/prompt.test.ts src/runner/hop.test.ts test/http/requirements.test.ts` → `0 fail`, the new cases named (base: first six files `191 pass · 0 fail · Ran 191 tests across 6 files` on `b6fbfaf`; `requirements.test.ts` n/a — new)
- [ ] 6. AC-2 by stub: a chat hop with the stub `CLAUDE_BIN` on an 8-requirement fake spec → the `--append-system-prompt-file` file the stub received holds all 8 texts verbatim (a `hop.test.ts` case reading the file the args point at) (base: n/a — new: no block today)
- [ ] 7. `bunx tsc --noEmit -p .` → exit `0` (base: `0`)
- [ ] 8. `bun --no-env-file test --timeout 30000` (whole suite) → only the known `src/runner/settings.test.ts` fail (base: `895 pass · 1 skip · 1 fail · Ran 897 tests across 71 files` — QA's TEST-116 R2-5 on fp `496ee381c955` = the content of `b6fbfaf`)
- [ ] 9. `bun run openapi:emit && git diff --stat openapi.json` → changed: the new route only (base: emit leaves the tree clean)
- [ ] 10. After: `git status --short --untracked-files=all` → only the closed list; `pgrep -fc 'output-format [s]tream-json'` → `0` (base: n/a — new)

## Implementation Notes
All eight steps built in `caw-back` on `b6fbfaf`, nothing committed by me. Every command ran as `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT … bun --no-env-file …`; no live hop, no real DB, no gateway.

**What changed**
- **D1** `prompt.ts` rule 2 = SPEC-117 D1's sentence exactly; line 5 of the six `skills/role-*/SKILL.md` = D1's sentence exactly (one line each, nothing else touched). `prompt.test.ts` pins both (the two probe hits `:24` and `(c)` updated).
- **D2.1** `GET /v1/projects/{projectId}/requirements` (`routes/projects.ts` + `RequirementsSchema`), logic in new `src/projects/requirements.ts`: `blueprint.spec()` parts with `kind === "requirement"`, `text = body.text`, `localeCompare(…, "en", { numeric: true })`; unknown project 404 `not_found`, Blueprint 404 → `blueprint_project_not_found`, down → 502.
- **D2.2** `api.requirements`; `requirementsBlock()` (pure, `prompt.ts`); `hop.ts` `requirementsFor` — chat hop only, the block is appended to the system-prompt file (`skills.text` + `\n\n---\n\n` + block, the skills' own separator); a failed read → the one-line notice + one log line, the hop goes on. Card hops: nothing added.
- **D2.3** `buildChatPrompt`: step 2b and step 3's words, exact.
- **D2.4** `proposals/service.ts`: `check` refuses a not-located non-`REQ-` key before any Blueprint call (as today); not-located `REQ-` keys go to `checkRequirementAnchors`, which reads each (cache-aware) and accepts only `part.kind === "requirement"`.
- **D3** `coverage.ts`: every `requirement` part whose key is not an anchor of a work card / the asked-for proposal → `{ key, kind: "requirement", title, decisions: [key] }`, sorted with the rest.
- **D4** `pull.ts`: a set whose `added`/`changed`/`removed` holds a `REQ-` key flags every card with `anchorRevision < rev`; `card.anchor_removed/restored` unchanged.
- `openapi.json`: only `Requirements` + the new route (+82 lines, read back).
- `fake-blueprint.ts`: two knobs, both marked synthetic: `requirements` (sent as `requirements` in the v2 part context when set) and `extraParts` (parts the recorded set lacks, served as `{ part, neighbours: [] }`).
- Tests: `test/http/requirements.test.ts` (new, 3), `hop.test.ts` +5, `prompt.test.ts` +5, `proposals.test.ts` +3, `coverage.test.ts` +3, `pull.test.ts` +2, and the AC-4 context test in `test/http/spec-latest.test.ts` (the existing pin-test file).

**Declared decisions (internal — overturn cheaply)**
1. A not-located `REQ-` key that is **no part at all** (`REQ-099`) → 422 `anchor_not_located` (not `anchor_not_in_version`): `checkRequirementAnchors` reads first, so "not located and not a requirement" keeps today's answer. Tested.
2. A requirement that is also the target of an uncovered decision's `covers` link is listed once, `decisions` = both keys (one row per part, as before).
3. A worker with no skills cannot be made through the API (`skills` is `min(1)`, `routes/workers.ts:15`), so "block alone" is tested by handing `runHop` a worker with `skills: []`; the code still writes the file in that case, as D2.2 says.

**Evidence (real output)**
- DoD 1: `git status --short | wc -l` → `0` at start (HEAD `b6fbfaf`).
- DoD 2: `grep -c "spec.requirements" src/runner/prompt.ts skills/*/SKILL.md` → `prompt.ts:1`, each of the six skills `:1`.
- DoD 3: `grep -c "/requirements" …` → `routes/projects.ts:2 · runner/api.ts:1 · openapi.json:1`.
- DoD 4: `grep -c '"requirement"' src/projects/coverage.ts src/proposals/service.ts` → `1` and `1`.
- DoD 5: `bun --no-env-file test test/http/coverage.test.ts test/follow/pull.test.ts test/http/proposals.test.ts test/mcp/chat-tools.test.ts src/runner/prompt.test.ts src/runner/hop.test.ts test/http/requirements.test.ts` → `211 pass · 0 fail · Ran 211 tests across 7 files` (base `191` on the first six).
- DoD 6: `hop.test.ts` "AC-2: 8 requirements in the fake spec → the system-prompt file the stub received holds all 8 texts verbatim, after the worker's skills" — the file is read from the `--append-system-prompt-file` path inside the stub child (the hop folder goes when the hop ends); it also asserts the header with revision 5, key order, and that no requirement text is in argv.
- DoD 7: `bunx tsc --noEmit -p .` → exit `0`.
- DoD 8: whole suite `--timeout 30000` → `916 pass · 1 skip · 1 fail · Ran 918 tests across 72 files`; the fail = the known `withReadGuard … PreToolUse hook` (`settings.test.ts`).
- DoD 9: `bun run openapi:emit` → `openapi.json | 82 +++`; the diff = the `Requirements` schema and `/v1/projects/{projectId}/requirements` only.
- DoD 10: `git status --short --untracked-files=all` → 21 modified + `src/projects/requirements.ts` + `test/http/requirements.test.ts`; `git check-ignore -v` on the two new paths → exit `1`; `pgrep -fc 'output-format [s]tream-json'` → `0`.

**UNVERIFIED**
- Blueprint's real `requirements` field and requirement parts: every test uses the fake's synthetic ones until Team A's TASK-145 is committed and QA's joint run (AC-1, AC-6).
- No live hop: the chat file is checked through the stub `claude`, not a real one. The `MAX_ARG_STRLEN` reason for a file rather than argv stays `inferred` (SPEC-117).

## Questions
**Q1 (non-blocking — a closed-list gap).** `src/runner/hop.test.ts` is not on the closed file list, but DoD 5 runs it and DoD 6 asks for "a `hop.test.ts` case", so I added the AC-2 cases there (5 tests, plus nothing else in the file changed). Checked: TASK-149 closed list + DoD 6. Tell me if you want them moved elsewhere.

## Review
**DONE — Silver (SA B), 2026-10-30 17:1x.** Built against SPEC-117 D1–D4, and the evidence holds when I re-run it.

- **Q1 answer:** `hop.test.ts` is in scope. DoD 5/6 name it, and the closed list missed it. That gap is mine: FAILURES F-047. The 5 cases stay where they are.
- **Scope** (`git status --short --untracked-files=all`, HEAD `b6fbfaf`): 23 paths = 21 ` M` + 2 `??` (`src/projects/requirements.ts`, `test/http/requirements.test.ts`). All are on the closed list, plus `hop.test.ts` (Q1). The context test's file is `test/http/spec-latest.test.ts`, as named in the Notes.
- **Re-run by me** (`env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT -u BLUEPRINT_URL … bun --no-env-file`):
  - DoD 5 files + `spec-latest.test.ts`: `223 pass · 0 fail · Ran 223 tests across 8 files` (= Bob's 211 + 12 in spec-latest).
  - tsc exit `0`.
  - Whole suite `--timeout 30000`: `916 pass · 1 skip · 1 fail · Ran 918 tests across 72 files`. The fail is only `withReadGuard … PreToolUse hook` (settings.test.ts, known).
  - `openapi:emit` again: `openapi.json | 82 +` and the same diff; the only new path is `/v1/projects/{projectId}/requirements`.
  - `pgrep -fc 'output-format [s]tream-json'` → `0`.
- **Read against the SPEC:**
  - D1 line 2 and the six skills' line 5 match the text exactly.
  - D2.1 matches: route and schema casing `revision/requirements/key/title/text`, numeric `localeCompare`, and the 404 `not_found` / 404 `blueprint_project_not_found` / 502 answers as in coverage.
  - D2.2 matches: chat hop only, block appended with the skills' `---` separator, file written for the block alone, failed read → one-line notice + one log line, card hop unchanged.
  - D2.3 wording matches exactly.
  - D2.4 matches: a non-`REQ-` not-located key is still refused before any read, and a `REQ-` key is accepted only when `kind === "requirement"`. The re-check on the write state (`service.ts:102`) passes `REQ-` keys that were already verified at `:97`.
  - D3 matches: requirement parts not in `anchors` are listed under themselves.
  - D4 matches: `touchesRequirement` flags every older card.
  - The AC-2 test reads the file from the `--append-system-prompt-file` path in the stub child: all 8 texts verbatim, and none of them in argv.
- **Notes, no rework:**
  - A not-located `REQ-` key is read twice: `checkRequirementAnchors`, then `checkAnchors`, cache-aware. The cost is small.
  - A mixed refusal (a `WRK-` key + a `REQ-` key) lists both in `details.keys`, the same as today.
  - Declared decisions 1–3 are accepted.
- **Still UNVERIFIED** (as Bob says): Blueprint's real `requirements` field (needs TASK-145 committed, then QA's joint run) and a live hop (AC-6, REQ-108 phase 3).
