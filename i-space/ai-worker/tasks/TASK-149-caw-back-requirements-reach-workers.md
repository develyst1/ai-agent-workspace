# TASK-149: caw-back — requirements route, chat system-prompt block, requirement anchors, coverage, pull flag, prompt + skills line (REQ-118)
- Source: SPEC-117 (REQ-118, Team B side; contract = SPEC-115)
- Owner: BE (Bob)
- Status: TODO, ON HOLD until REQ-119 committed in caw-back — I release it with the hash and re-run the bases (2026-10-30 16:1x, Silver)
- Depends on: REQ-119 committed (`<hash>`) — same files (`prompt.ts`, `hop.ts`, `runner/api.ts`, `openapi.json`)

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
(bases run on `4cc3241` by the SA 15:5x; **I re-run every base on the REQ-119 commit when I release this TASK**)
- [ ] 1. Before: `git status --short | wc -l` → `0` (base: `0`)
- [ ] 2. `grep -c "spec.requirements" src/runner/prompt.ts skills/*/SKILL.md` → each `1` (base: all `0`)
- [ ] 3. `grep -c "/requirements" src/http/routes/projects.ts src/runner/api.ts openapi.json` → each ≥ 1 (base: all `0`)
- [ ] 4. `grep -c '"requirement"' src/projects/coverage.ts src/proposals/service.ts` → each ≥ 1 (base: both `0`)
- [ ] 5. `bun --no-env-file test test/http/coverage.test.ts test/follow/pull.test.ts test/http/proposals.test.ts test/mcp/chat-tools.test.ts src/runner/prompt.test.ts src/runner/hop.test.ts test/http/requirements.test.ts` → `0 fail`, the new cases named (base: first six files `190 pass · 0 fail · Ran 190 tests across 6 files`; `requirements.test.ts` n/a — new)
- [ ] 6. AC-2 by stub: a chat hop with the stub `CLAUDE_BIN` on an 8-requirement fake spec → the `--append-system-prompt-file` file the stub received holds all 8 texts verbatim (a `hop.test.ts` case reading the file the args point at) (base: n/a — new: no block today)
- [ ] 7. `bunx tsc --noEmit -p .` → exit `0` (base: `0`)
- [ ] 8. `bun --no-env-file test --timeout 30000` (whole suite) → only the known `src/runner/settings.test.ts` fail (base: `883 pass · 1 skip · 1 fail · Ran 885 tests across 71 files` — to re-run on the REQ-119 commit)
- [ ] 9. `bun run openapi:emit && git diff --stat openapi.json` → changed: the new route only (base: emit leaves the tree clean)
- [ ] 10. After: `git status --short --untracked-files=all` → only the closed list; `pgrep -fc 'output-format [s]tream-json'` → `0` (base: n/a — new)

## Implementation Notes
(Bob fills this in. Anything not run → `UNVERIFIED — <what would settle it>`.)

## Questions

## Review
