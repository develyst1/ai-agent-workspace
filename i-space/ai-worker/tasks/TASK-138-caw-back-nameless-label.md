# TASK-138: caw-back — a label with no name (`label: null`) passes through as null
- Source: SPEC-107 (REQ-105 Q6, PM's yes 2026-10-30 — "ป้าย {version}"; Team B)
- Owner: BE (Bob)
- Status: **DONE** (Silver, 2026-10-30 12:2x — § Review) · was REVIEW (Bob, 2026-10-30) — released 2026-10-30 11:5x (SA)
- Depends on: REQ-112 committed (58ab883) in caw-back ✓ — same repo, previous topic

## Why
The real blueprint-back v2 sends `latestLabel.label: string | null` (`blueprint-back → src/seam/spec.ts:16`): null = a version confirmed
before REQ-103's named labels (`src/projects/service.ts:131-135`). CAW types it `string`, so its contract (openapi) promises a string it
may not get, and the front prints "ป้าย null". Found in the SA's real-seam smoke (REQ-105 Q6). Cards are already safe: `labelOf`
(`src/blueprint/latest.ts:21-23`) turns a non-string name into `null`.

## What to do
Widen the project label's **name** from `string` to `string | null` everywhere it is typed — no behaviour change, no new field, no migration
(`projects.latest_label` is `jsonb`; only its TS `$type` changes):
1. `src/blueprint/client.ts:16` — `LatestLabel.label: string | null`.
2. `src/db/schema.ts:43` — `$type<{ version: number; label: string | null }>()`.
3. `src/core/events.ts:61` (`project.created.latestLabel`) and `:84` (`spec.revised.latestLabel`) — `label: string | null`.
4. `src/core/reduce.ts:11` — `ProjectState.latestLabel: { version: number; label: string | null } | null`.
5. `src/http/routes/projects.ts:28` — `label: z.string().nullable()`, and the description says "its words, or null when Blueprint's label has
   none (a version from before named labels)". Then `bun run openapi:emit` (never by hand).
6. Whatever `tsc` names after 1–5 (e.g. `src/follow/pull.ts:70-71`, `src/projects/service.ts:38` copy the pair) — fix the type only; if it
   needs a file not listed here → `## Questions` first.
7. **Tests:** `test/helpers/fake-blueprint.ts:21` — widen `FakeSpec.label` to `{ version: number; label: string | null } | null` (synthetic,
   marked). In `test/http/projects.test.ts` add one test: the fake's `spec.label = { version: 3, label: null }` → `POST /v1/projects` 201 and
   `GET /v1/projects/{id}` → `latestLabel: { version: 3, label: null }`. In `test/follow/pull.test.ts` add one: a pull whose `latestLabel` has a
   null name writes `spec.revised` with `label: null`, and `rebuild-check` stays `{ same: true }`.

**Closed file list:** the 6 `src` files above (+ any `tsc` names, via Questions), `openapi.json`, `test/helpers/fake-blueprint.ts`,
`test/http/projects.test.ts`, `test/follow/pull.test.ts`. **No git.** Every command as
`env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT … bun --no-env-file …` (SPEC-107 G2).

## Definition of Done
- [ ] 1. Before. `git status --short | wc -l` → `0` (base: `0` on 58ab883, SA 2026-10-30 11:5x)
- [ ] 2. `grep -c 'label: string | null' src/blueprint/client.ts` → `1` (base: `0`)
- [ ] 3. `bun -e 'const o=JSON.parse(await Bun.file("openapi.json").text()); console.log(JSON.stringify(o.components.schemas.Project.properties.latestLabel.properties.label))'` → a type that allows null, e.g. `{"type":["string","null"]}` (base: `{"type":"string"}`)
- [ ] 4. `bun --no-env-file test test/http/projects.test.ts test/follow test/core --timeout 30000` → 0 fail, the 2 new tests named (base: `Ran 45 tests across 4 files`, `0 fail`, SA 11:5x)
- [ ] 5. `bunx tsc --noEmit -p .` → exit 0 (base: `tsc 0`, SA 11:5x)
- [ ] 6. `bun --no-env-file test --timeout 30000` (whole suite) → only the known `src/runner/settings.test.ts` fail (base: `872 pass · 1 skip · 1 fail` — Bob's TASK-121 run on the tree now committed as 58ab883; not re-run by the SA)
- [ ] 7. `git status --short --untracked-files=all` → only listed paths; `git status --short --ignored -- src test | grep -c '^!!'` → `0` (base: `0`)

## Implementation Notes
Bob, 2026-10-30. Repo `caw-back`, branch `atom`, base `58ab883`, tree clean at the start (DoD 1: `git status --short | wc -l` → `0`). Nothing committed (SA's). Every command as `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT bun --no-env-file …`; no live CLI, no real DB.

### What changed (10 paths, 40 insertions / 9 deletions, types only + 2 tests)
- Steps 1–5, exactly the listed lines: `src/blueprint/client.ts` `LatestLabel.label: string | null` (+ a one-line comment why) · `src/db/schema.ts` `$type<{ version: number; label: string | null }>()` · `src/core/events.ts` both `latestLabel` types · `src/core/reduce.ts` `ProjectState.latestLabel` · `src/http/routes/projects.ts` `label: z.string().nullable()` with the description from the TASK. `openapi.json` re-emitted by `bun run openapi:emit`: the only change is that one property (`"type": "string"` → `["string","null"]` + its description).
- Step 6: `tsc` named **no `src` file** beyond 1–5 (`follow/pull.ts` and `projects/service.ts` needed nothing: they copy the pair without naming its type). It named one **test** file, outside the list → asked as Q1; Silver: yes, one token → `test/http/part-read.test.ts:12` helper parameter `label: string` → `string | null`. No assertion changed there.
- Step 7: `test/helpers/fake-blueprint.ts:21` `FakeSpec.label` widened (marked synthetic); `test/http/projects.test.ts` + 1 test (`spec.label = { version: 3, label: null }` → `POST /v1/projects` 201 and `GET` → `latestLabel: { version: 3, label: null }`; also the event's data, and `rebuild-check` `{ same: true }`); `test/follow/pull.test.ts` + 1 test (a pull whose label has a null name writes ONE `spec.revised` with `label: null`, the project follows it, the same nameless label again writes nothing, `rebuild-check` clean).
- No behaviour change: `labelOf` (cards) and `createProject`'s copy of the pair already passed a null through; the runtime values were never `"null"` text here, only the declared type and the contract said `string`.

### Decisions I made (reviewer may overturn)
1. The new `projects.test.ts` test also checks `latestSeenVersion` and `version` (both 3, the label number) and the stored event, not only the two things the TASK names — no extra file, same test.
2. Nothing else: no new field, no migration, no behaviour.

### Existing tests changed
None changed in meaning. `test/http/part-read.test.ts:12` — one type token (Q1). `test/helpers/fake-blueprint.ts:21` — one type (step 7).

### DoD evidence (real output)
1. `git status --short | wc -l` → `0` on `58ab883` (before).
2. `grep -c 'label: string | null' src/blueprint/client.ts` → `1` (base `0`).
3. `bun -e '…Project.properties.latestLabel…'` → `{"description":"the latest label Blueprint showed: its number and words; null = none (REQ-105)","properties":{"label":{"description":"its words, or null when Blueprint's label has none (a version from before named labels)","type":["string","null"]},"version":{"type":"integer"}},"required":["version","label"],"type":["object","null"]}` — the `label` type allows null (base `"type":"string"`).
4. `bun --no-env-file test test/http/projects.test.ts test/follow test/core --timeout 30000` → `47 pass · 0 fail · Ran 47 tests across 4 files` (base 45 across 4 files: +2, the two new tests named above).
5. `bunx tsc --noEmit -p .` → exit `0` (before Q1's token: 2 errors, both in `part-read.test.ts`).
6. `bun --no-env-file test --timeout 30000` (whole suite) → `874 pass · 1 skip · 1 fail · Ran 876 tests across 71 files` (base 872 / 1 / 1 on 71 files: +2 tests). The one fail is `src/runner/settings.test.ts` (`withReadGuard … PreToolUse hook`, the known machine fail; file untouched). After: `pgrep -fc 'output-format [s]tream-json'` → `0`.
7. `git status --short --untracked-files=all` → the 10 paths above, all listed or Q1's; `git status --short --ignored -- src test | grep -c '^!!'` → `0`.

### UNVERIFIED
- The nameless label from a **real** blueprint-back: the fake's `label: null` is synthetic (marked); the shape is the SA's reading of `blueprint-back → src/seam/spec.ts:16` in her real-seam smoke (REQ-105 Q6).

## Questions

**Q1 (Bob, 2026-10-30 11:xx — blocks only DoD 5, `tsc`).** After steps 1–5 `bunx tsc --noEmit -p .` has exactly one complaint, in a file not on the list: `test/http/part-read.test.ts(28,52)` and `(40,54)` — the helper `v2(name, spec: { revision; savedAt; label: { version: number; label: string } | null })` at `:12` is given `fake.mode.spec` whose `label` is now `{ version; label: string | null }` (the widened `FakeSpec`, step 7). Fix = widen that one parameter type at `:12` to `label: string | null` — type only, no assertion changes. May I edit `test/http/part-read.test.ts:12` for that? Default if no answer: untouched, and `tsc` stays red (2 errors, only there).
  Checked: TASK-138 closed file list; step 6 ("if it needs a file not listed → Questions first"); `bunx tsc --noEmit -p .` output 2026-10-30.
  > answer: **yes** — add `test/http/part-read.test.ts` for that one token only (`:12` helper `label: string` → `string | null`); list it in Notes. SA read `:12-14` 2026-10-30 12:0x. My miss: the consumer grep I ran for this TASK covered `src` only, not `test` (FAILURES). — Silver (SA)

## Review
**Verdict: DONE** — Silver (SA), 2026-10-30 12:2x. Against SPEC-107 D13 and the Q1 answer.
- **Evidence re-run by me** (`env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT`, `--no-env-file`): `bunx tsc --noEmit -p .` → `0`; `bun test test/http/projects.test.ts test/follow test/core test/http/part-read.test.ts` → `52 pass · 0 fail · Ran 52 tests across 5 files`; openapi `Project.latestLabel.label` → `{"type":["string","null"]}` (base `{"type":"string"}`). Whole suite 874/1/1 (known `settings.test.ts` only) from the Notes, not re-run.
- **Scope:** exactly 10 paths (the listed ones + `part-read.test.ts` by Q1); nothing ignored. `src` diff read in full: type-only (`client.ts:16`, `events.ts:61,84`, `reduce.ts:11`, `schema.ts:43` `$type` — no migration, `routes/projects.ts:28` + description). No behaviour change.
- **Tests read:** projects — create with `{ version: 3, label: null }` → 201, GET returns it (Decision 1's extra checks of `version`/`latestSeenVersion` = 3 and the event accepted); pull — `spec.revised` carries `label: null`, a repeat is not news, `rebuild-check` `{ same: true }`.
- **UNVERIFIED (carried):** a nameless label from a real blueprint-back cannot be made any more (only pre-REQ-103 data) — the shape is from reading `blueprint-back → src/seam/spec.ts:16`.
