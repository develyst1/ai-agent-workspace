# TASK-115: caw-back — follow Blueprint by revision; push `spec.changed`; project label + reachability; poll 10 s
- Source: SPEC-107 (REQ-105, Team B)
- Owner: BE (Bob)
- Status: **DONE** (Silver, 2026-10-29 19:2x — § Review) · was REVIEW (Bob, 2026-10-29 19:1x) — **released 2026-10-29 18:2x** (SA): TASK-114 DONE, same tree. REQ-105 Q4 **answered 2026-10-29 18:2x (PM: accepted as written)** → the Q4 step below (SPEC-107 D12) is part of this TASK; do it after the follow work.
- Depends on: TASK-114 DONE (same topic, same tree, sequential files) · REQ-113 committed (a17ff11) in caw-back ✓ (PM order 2026-10-29 17:0x) · PM go ✓ (Porter 2026-10-29 17:1x: "start the moment REQ-113 is committed")

## What to do

Read SPEC-107 § Design D6–D10, § API (Project), § Events (`spec.revised`), § Tests, § Guardrails; SPEC-106 route 4 (`…/spec/changes`)
and route 5 (the push body). Migration 0011 already holds the `follow_state` columns (TASK-114).

1. **Pull** (`src/follow/pull.ts`): `specChanges(bp, after = follow_state.last_pulled_revision)`, again while `more`. Flag cards whose
   `anchorKey` ∈ a change's `changed ∪ removed` and `anchorRevision < change.rev`. Write **one** `spec.revised` event per pull only
   if it flagged a card or `latestLabel` differs from the project's; otherwise only `follow_state`. Set `last_pulled_revision`,
   `last_pull_at`, `last_pull_ok = true`; on `BlueprintUnreachable`: `last_pull_ok = false`, one codes-only log line (as today), no throw.
   Keep the one-at-a-time queue.
2. **Event** (`src/core/events.ts`, `src/core/reduce.ts`): `spec.revised` per SPEC-107 § Events. Keep `card.spec_changed` for replay.
3. **Push** (`src/http/routes/follow.ts`): SPEC-107 D8 — `version.confirmed` exactly as today (bad body → 400 as today);
   `spec.changed { projectId, revision ≥ 0, at }` → 202 + `pullFor`; any other `event` string → 202 `{}`, no pull; no string
   `event`/`projectId` → 400. The OpenAPI description says all three.
4. **Project view** (`src/projects/service.ts` `getProject` / `listProjects`, `src/http/routes/projects.ts:24`): add `latestLabel` and
   `spec { revision, reachable, lastPullAt }` (from `follow_state`; no row → `{ revision: 0, reachable: true, lastPullAt: null }`).
5. **Poll default** (`src/index.ts:23-24`): unset/empty `CAW_POLL_MS` → `10_000`; the comment at `:22` says 10 s and why (AC-1).
6. `bun run openapi:emit`.
7. **Tests:** extend `test/follow/pull.test.ts` (synthetic `…/spec/changes` in the fake, from TASK-114): flags only newer-than-anchor
   cards; no event for a change touching no card; label change alone writes one event; `more: true` paging; down → `reachable: false`,
   back up → catches up from the last revision with no restart (AC-5). Push cases (three kinds + 400) in `test/http/runner-actor.test.ts`
   or a new `test/http/notify.test.ts`. List every changed existing assertion in Notes.

**Closed file list:** `src/follow/pull.ts`, `src/http/routes/follow.ts`, `src/core/events.ts`, `src/core/reduce.ts`,
`src/projects/service.ts`, `src/http/routes/projects.ts`, `src/index.ts`, `openapi.json`, `test/helpers/fake-blueprint.ts`,
`test/follow/pull.test.ts`, `test/http/runner-actor.test.ts`, `test/http/notify.test.ts` (new, optional), `test/http/projects.test.ts`,
**and for REQ-105 Q4 (SPEC-107 D12, added 2026-10-29 18:2x):** `src/cards/view.ts`, `src/cards/service.ts`, `src/http/routes/cards.ts`,
`src/core/rebuild.ts` (its `HANDLED` list), `test/http/cards.test.ts`, one new `test/http/anchor-removed.test.ts`,
**and by Q1/Q2 answers (2026-10-29 18:4x):** `src/http/routes/chat.ts` (+ `test/http/chat*.test.ts` only if a `project` assertion breaks),
`src/db/schema.ts`, `src/core/state.ts`, `src/db/migrations/0012_*.sql`, `src/db/migrations/meta/0012_snapshot.json`,
`src/db/migrations/meta/_journal.json`, new `test/db/migration-0012.test.ts`.
Anything else → `## Questions` first.

**Q4 step (SPEC-107 D12, do it after the follow work):** `card.anchor_removed` / `card.anchor_restored` from the pull (a set's
`removed` / `added` holding a card's anchor key) · `CardState.anchorRemovedRevision` · `Card.anchorRemoved: boolean` + `CardSchema` ·
`isWorkable` false while removed · `card_context` → **404 `anchor_removed`** `part <key> was removed from the spec` (a worker's own pinned hop
still gets its pin) · `openapi:emit`. Tests: removed → 404 + not workable + no hop starts; restored → workable again; pinned hop still
served; rebuild-check `same: true`. DoD: `grep -c anchor_removed openapi.json` → ≥ 1 (base: `0`, SA 2026-10-29 18:2x). **No git.** Guardrails SPEC-107 G1–G5.

## Definition of Done

Every caw-back command runs as `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT <command>` (G2).

- [ ] 1. `grep -n 'z.literal("version.confirmed")' src/http/routes/follow.ts` → still present for the `version.confirmed` branch, plus a `spec.changed` branch (base: `11:      event: z.literal("version.confirmed"), …` only, SA 14:2x)
- [ ] 2. `grep -n '10_000' src/index.ts` → the default (base: `23:… ? 30_000 : …` · `24:… : 30_000);`, SA 14:2x)
- [ ] 3. `bun test test/follow test/http/runner-actor.test.ts --timeout 30000` → 0 fail, each case in What-to-do 7 named (base: `Ran 14 tests across 2 files` · `0 fail`, SA 14:3x)
- [ ] 4. Live push check, API only, no runner: `env -u CLAUDE_BIN DATABASE_URL=pglite:memory CAW_POLL_MS=0 PORT=4531 BLUEPRINT_URL=http://127.0.0.1:1 bun --no-env-file run src/index.ts`, then `curl -s -w ' %{http_code}' -X POST localhost:4531/v1/notify -H 'content-type: application/json' -d '{"event":"spec.changed","projectId":"p1","revision":12,"at":"2026-10-29T07:00:00Z"}'` → `{} 202`; same with `"event":"something.else"` → `{} 202`; `{"event":"version.confirmed","projectId":"p1"}` → `400` (base: `spec.changed` → `{"error":{"code":"validation",…"expected \"version.confirmed\""…}} HTTP 400`; `version.confirmed` full body → `{} HTTP 202`, SA 14:2x). Stop the server by the **bun pid** from `ss -ltnp | grep 4531` (killing the shell leaves bun up — seen 14:2x)
- [ ] 5. `bun test test/http/projects.test.ts --timeout 30000` → 0 fail with `latestLabel` and `spec` asserted (base: part of `Ran 22 tests across 2 files` · `0 fail` with test/follow, SA 14:2x)
- [ ] 6. `bun test --timeout 30000` → only the known machine fail `settings.test.ts:162` (base: `749 pass / 1 skip / 1 fail` — Bob, TASK-112 14:15, not re-run by the SA)
- [ ] 7. `bunx tsc --noEmit; echo $?` → `0` (base: `tsc exit 0`, SA 14:2x)
- [ ] 8. After: `ss -ltn | grep -c ':4531 '` → `0`; `pgrep -fc 'output-format [s]tream-json'` → `0` (base: `0` / `0`, SA 14:3x)

## Implementation Notes
Bob, 2026-10-29. Repo `caw-back`, branch `atom`, base `a17ff11` + TASK-114's tree. Nothing committed (SA's). Every command as `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT bun --no-env-file …`; no live CLI, no real DB, `DATABASE_URL` never printed.
**Machine fact:** the owner's 18:24 reboot wiped `node_modules` in the repos; I restored caw-back with `bun install --frozen-lockfile` (121 packages; `bun.lock` and `package.json` unchanged — `git status` clean for both).

### What changed
- **Pull** `src/follow/pull.ts` (D6): `specChanges(bp, after = follow_state.last_pulled_revision)`, again while `more`; flags cards whose `anchorKey` ∈ `changed ∪ removed` of a set with `anchorRevision < rev`; ONE `spec.revised { revision, latestLabel, cardIds }` per pull, only if a card was flagged or the label differs; otherwise only `follow_state` moves. Success → `last_pull_ok = true`, `last_pull_at`, `last_pulled_revision`. `BlueprintUnreachable` (or a body whose `changes` is not an array) → `last_pull_ok = false`, one `[pull] blueprint_unreachable` line, `last_pulled_revision`/`last_pull_at` untouched. One-at-a-time queue kept.
- **Events** `events.ts`, `reduce.ts`, `rebuild.ts`: `spec.revised` (cards: `specChangedVersion = revision`; project: `latestLabel`, `latestSeenVersion = label number or 0`); `card.spec_changed` stays for replay.
- **Push** `routes/follow.ts` (D8): union of `version.confirmed` (unchanged fields), `spec.changed { projectId, revision ≥ 0, at }`, and any other `event` string + `projectId` → `202 {}`, no pull; anything else → 400.
- **Project view** `projects/service.ts` `projectView`, `routes/projects.ts`, `routes/chat.ts` (Q1): `spec { revision, reachable, lastPullAt }` on create/list/get/mode/workspace and the chat context's project; no `follow_state` row → `{0, true, null}`. `latestLabel` was TASK-114's.
- **Poll** `src/index.ts`: unset/empty `CAW_POLL_MS` → `10_000`, comment says why (AC-1).
- **Q4 / D12:** migration `0012_card_anchor_removed` (Q2: `ADD COLUMN "anchor_removed_revision" integer`, drizzle-generated, equal to Silver's SQL), `schema.ts`, `state.ts`; `CardState.anchorRemovedRevision` (`null` at every builder); events `card.anchor_removed` / `card.anchor_restored`; `Card.anchorRemoved`; `isWorkable` false while removed; `card_context` → `404 anchor_removed` `part <key> was removed from the spec` (also when Blueprint says 404 before the pull saw it); a worker's own pinned hop still gets its text.
- `openapi.json` re-emitted: only additions (`Project.spec`, `Card.anchorRemoved`, the notify body as `anyOf` of three, `spec`/`anchorRemoved` in `required`); the removed lines are the old notify body, re-indented inside the `anyOf`.

### Decisions I made (reviewer may overturn)
1. **`lastPullAt` = when a pull last GOT THROUGH**, not the last attempt (an outage must not make the data look fresh).
2. **One `spec.revised` per pull carries ONE revision — the newest set the pull saw — for every card it flags** (SPEC D6 says one event). A card flagged by set 2 shows `specChangedVersion` 4 if the same pull also saw set 4. Exact per-card revisions would need one event per revision.
3. A pull that fails halfway through paging **discards** the sets already read; the next pull starts again from `last_pulled_revision`.
4. D12: per part key the **last** set that removed or (re)added it decides (a set listing a key in both = replaced = present); `anchor_removed` only for a card with `anchorRevision < rev`; events grouped per (kind, revision). Removed then re-added inside one pull → no anchor event.
5. `anchor_removed` also marks **question** cards on that key (the existing flagging does not exclude them); question cards are built with `null`, as Silver wrote in Q2.
6. A bad `version.confirmed` body is still 400 `validation`, but the message is now `a known event has its own fields → at event` (base: `expected "version.confirmed"`). Code and status unchanged.
7. **For Silver (not changed, outside my list):** the 409 `not_workable` text in `src/hops/service.ts:47` says "(a question, done, in review, or waiting on a card)" — it does not name a removed anchor, which now also stops a hop. Client-visible, so your call.
8. **Q3 deviation:** `spec-latest.test.ts:130` stays `502` (see § Questions, under Q3).

### Existing tests changed (each: why)
- `test/follow/pull.test.ts` — **rewritten** (11 tests): all 9 old ones were built on the v1 `versions?after=` feed; each is replaced by its revision-based counterpart (flag newer-than-anchor only, no-event pull, label alone, `changed ∪ removed` + paging, clear sticks, anchor revision, down/up catch-up, push to legacy duplicates, start/poll/stop, two pulls at once) + not-a-change-feed.
- `test/http/projects.test.ts` — create: key list gains `spec`, `spec` asserted; +2 tests (`spec` on every project route incl. outage; chat context).
- `test/http/cards.test.ts` — Card key list gains `anchorRemoved`; context for a removed part `502 blueprint_unreachable` → `404 anchor_removed` (title updated).
- `test/core/events.test.ts` — vocabulary 39 → 42 names (Q3). `test/http/spec-latest.test.ts:127` → `anchor_removed` (Q3); `:130` unchanged in status, comment added.
- `test/helpers/fake-blueprint.ts` — `mode.pageSize` (synthetic paging) and `mode.changesBody` (synthetic non-feed body), both marked synthetic.
- `test/http/rebuild-sequence.test.ts` (Q4) — AC-6 test: change sets rev 2 (STEP-004) + rev 3 (STEP-001) pushed into the fake before `pullAll()`; `latestSeenVersion` 3 → 1 (the label number, unchanged); event list `card.spec_changed` → `spec.revised`; statuses unchanged (`1:todo:-`, `3:todo:3`); tables = rebuilt printed equal; 3 pass in that file.
- `test/http/chat*.test.ts` — **no change needed** (nothing asserted the project's keys).

### New tests
`test/http/notify.test.ts` (5: spec.changed incl. revision 0, version.confirmed, other event, unknown project, 14 bad bodies → 400, no pull on any refusal) · `test/http/anchor-removed.test.ts` (5: removed, own pinned hop, restored, same-pull remove+restore, not-yet-pulled 404) · `test/db/migration-0012.test.ts` (1).

### DoD evidence (real output, 2026-10-29 ~19:0x)
1. `grep -n 'z.literal("version.confirmed")' src/http/routes/follow.ts` → `11:const VersionConfirmed = z.object({ event: z.literal("version.confirmed"), …`; and `12:const SpecChanged = z.object({ event: z.literal("spec.changed"), …`.
2. `grep -n '10_000' src/index.ts` → `23:const poll = … ? 10_000 : Number(process.env.CAW_POLL_MS);` · `24:follow.start(… ? poll : 10_000);`.
3. `bun test test/follow test/http/runner-actor.test.ts` → `16 pass · 0 fail · Ran 16 tests across 2 files` (11 follow + 5 runner-actor); every What-to-do-7 case is a named test in `pull.test.ts` (flag newer-than-anchor only; no event for a card-less set; label alone writes one; `more: true` paging `after=1,2,3`; down → `reachable:false`, up → catches up `after=1` with no restart).
4. Live push, API only (`DATABASE_URL=pglite:memory CAW_POLL_MS=0 PORT=4531 BLUEPRINT_URL=http://127.0.0.1:1 bun --no-env-file run src/index.ts`; `4531` free before: `0`): `spec.changed` → `{} 202` · `something.else` → `{} 202` · `version.confirmed` full body → `{} 202` · `version.confirmed` without `version` → `{"error":{"code":"validation","message":"✖ a known event has its own fields\n  → at event"}} 400` · `{"projectId":"p1"}` → `…"Invalid input"}} 400`. Stopped by bun pid 48961.
5. `bun test test/http/projects.test.ts` → `15 pass · 0 fail` (`latestLabel` and `spec` asserted on create, get, list, mode, workspace, chat context).
6. `bun test --timeout 30000` (whole suite) → `863 pass · 1 skip · 1 fail · Ran 865 tests across 70 files` (re-run 19:1x after Q4). The one fail is `src/runner/settings.test.ts:165` (`withReadGuard … PreToolUse hook`, the known machine fail; file untouched; base cited it as `:162`). First run (before Q4's edit) was 862/1/2, the second fail being `rebuild-sequence.test.ts:105`.
7. `bunx tsc --noEmit; echo $?` → `0` (after Q1's `chat.ts` change; before it: 1 error in `chat.ts`).
8. After: `ss -ltn | grep -c ':4531 '` → `0`; `pgrep -fc 'output-format [s]tream-json'` → `0`.
Q4 step DoD: `grep -c anchor_removed openapi.json` → `1` (base `0`); `bun test test/http/anchor-removed.test.ts test/db` → `5 pass` · `16 pass` (0 fail).

### UNVERIFIED
- `silent-failure-hunter` (pr-review-toolkit agent): not available in this session — **not run**. I read my own error paths by hand: the only `catch` in `pull.ts` rethrows anything but `BlueprintUnreachable` / the internal `NothingToWrite`; the queue still logs `[pull] error <name>` for the rest. What would settle it: that agent over `src/follow/pull.ts`.
- `/security-review`: not run (it reviews the workspace branch, not `caw-back`). The new input surface is `/v1/notify`, validated by the union above (14 bad bodies → 400, none starts a pull).
- The v2 `/spec/changes` answers (incl. `more`, `added`) are SYNTHETIC (SPEC-106, not recorded): a real blueprint-back may differ in a field name or in what `added` means for a re-created part → QA's joint run against TASK-113.
- Migration 0012 on PGlite only (up from 0011 with a row); not on a real Postgres.

## Questions

Bob, 2026-10-29 18:4x. Both are files outside the closed list; steps 1–7 (follow, push, project view, poll) are being built meanwhile.

**Q1 (blocks `tsc` only).** `Project` now carries `spec` (step 4). `GET /v1/chat/{messageId}/context` also returns `project: ProjectSchema` (`src/http/routes/chat.ts:39`), so `bunx tsc --noEmit` fails there: `Property 'spec' is missing in type …` (run 2026-10-29 18:4x, only error). SPEC-107 § API says "every route returning a project", so the chat route should carry `spec` too. Fix = one handler line in `src/http/routes/chat.ts` (`projectView(db, r.project)`, imported from `projects/service`), plus `test/http/chat.test.ts` if an assertion on `project` breaks. May I add `src/http/routes/chat.ts` (and that test) to the list? Default if no answer: I make no change there and `tsc` stays red until you answer.
  Checked: TASK-115 closed file list; SPEC-107 § API (Project); `grep -rn ProjectSchema src` → `routes/projects.ts`, `routes/chat.ts:8,39` only.
  > answer: **yes** — add `src/http/routes/chat.ts` (serve the project through `projectView`, as you propose) and `test/http/chat.test.ts`, `test/http/chat-retry.test.ts`, `test/http/chat-hops-budget.test.ts` only if an assertion on `project` breaks (list each in Notes). SA re-ran `grep -rn 'ProjectSchema' src test` → `chat.ts:8,39` + `projects.ts` only; `ProjectSummarySchema` (`projects.ts:37`) extends it and is already yours via `service.ts:142`. My consumer gap (FAILURES). — Silver (SA) 2026-10-29 18:4x

**Q2 (blocks the Q4 / D12 step only).** `card.anchor_removed` / `card.anchor_restored` need `CardState.anchorRemovedRevision`, which is **replayed** state, so `loadState`/`saveState` must carry it and `rebuild-check` must stay `same: true` (DoD 9 of TASK-114 style). No card column holds it today (`grep -rn anchor_removed src` → nothing; newest migration `0011_spec_latest`). It needs `cards.anchor_removed_revision integer` (nullable) → `src/db/schema.ts`, `src/db/migrations/0012_*.sql`, `meta/0012_snapshot.json`, `meta/_journal.json` — none is on the closed list, and a schema change is a SPEC decision. May I add exactly that one nullable column (drizzle-generated, local PGlite only, new `test/db/migration-0012.test.ts`)? Default if no answer: I do not start the Q4 step.
  Checked: SPEC-107 D12 (names the state field, not its column); TASK-115 closed file list; SPEC-107 § Data Model (0011 only).
  > answer: **yes, exactly that column, as a new 0012** (do not edit 0011): `ALTER TABLE "caw"."cards" ADD COLUMN "anchor_removed_revision" integer;` — nullable, no default; existing rows → NULL = not removed. Drizzle `anchorRemovedRevision: integer("anchor_removed_revision")`; carry it in `src/core/state.ts` (row → state, as `anchorRevision` at `:25`) and `saveState`. Added to the list: `src/db/schema.ts`, `src/core/state.ts`, `src/db/migrations/0012_*.sql`, `meta/0012_snapshot.json`, `meta/_journal.json`, new `test/db/migration-0012.test.ts`. Local PGlite only (G2). Also every place a `CardState` is built (`grep -rn 'anchorRevision:' src` → `reduce.ts:134,163`, `state.ts:25`) sets `anchorRemovedRevision: null`. SPEC-107 § Data Model + D12 updated. — Silver (SA) 2026-10-29 18:4x
  > answer:

**Q3 (Bob, 2026-10-29 18:5x — blocks only DoD 6 "whole suite: only the known fail").** Q4 makes three existing assertions fail, in files that are not on the closed list; I have **not** touched them:
  1. `test/core/events.test.ts:83` — the event-vocabulary list; it must gain `spec.revised`, `card.anchor_removed`, `card.anchor_restored` (the received list differs by exactly those 3 names; run 18:5x).
  2. `test/http/spec-latest.test.ts:127` and `:130` — `…/context` for a card whose part has left the spec expects `502`; D12 makes it `404 anchor_removed` (run 18:5x: received `404`, `"anchor_removed"`).
  May I edit exactly those two files for exactly those lines (list in Notes)? Default if no answer: untouched, and DoD 6 shows these 2 tests failing.
  Checked: TASK-115 closed file list + Silver's Q1/Q2 additions; SPEC-107 D12.
  > answer: **yes, both, those lines only.** (1) `test/core/events.test.ts:83` — add the 3 names in `EVENT_TYPES` order and fix the count in the test title (`39 names` → the new count, with "REQ-105: spec.revised, card.anchor_removed/restored"). (2) `test/http/spec-latest.test.ts:127,130` — expect `[404, "anchor_removed"]` at both; keep the cache-row assertion at `:128` (the "outage cannot revive it" point still holds, now with the right reason). Both are what SPEC-107 § Events + D12 require, and TASK-114's 502 was "kept for now" until Q4. SA read both spots 2026-10-29 18:5x. — Silver (SA) 2026-10-29 18:5x
  > Bob 19:0x: applied both. **One deviation:** `spec-latest.test.ts:130` stays `502` — with Blueprint down, the cache row dropped and no pull having seen the removal, CAW does not know the part is gone, so it cannot say `anchor_removed`; your literal "404 at both" failed there (run: expected `anchor_removed`, received `blueprint_unreachable`). `:127` is `anchor_removed`. Overturn it if you disagree.

**Q4 (Bob, 2026-10-29 19:0x — blocks only DoD 6).** Whole suite: 862 pass / 1 skip / 2 fail. One is the known `src/runner/settings.test.ts` (read-guard, `process.execPath`; file untouched). The other is mine and in a file outside the list: `test/http/rebuild-sequence.test.ts:90-110` ("AC-6 … spec changes: rebuild = tables"). It relies on the v1 feed: `follow.pullAll()` at `:90` used to flag cards 1 and 3 from the recorded v2/v3 feed and move `latestSeenVersion` to 3; with the revision pull there is no change set, so nothing is flagged (received `latestSeenVersion: 1`, statuses `3:todo:-`).
  Proposed edit, that test only: before `:90` push change sets `{rev 2, changed STEP-004}` and `{rev 3, changed STEP-001}` into the fake (`mode.changes`, `mode.spec.revision = 3`); expected values `latestSeenVersion: 1` (label unchanged — the label is a tag now) and cards 1 and 3 flagged `3` (one `spec.revised` carries the newest revision); the `card.spec_changed` entry in the event-type list at `:110` becomes `spec.revised`. Rebuild-equals-tables stays the assertion. May I edit `test/http/rebuild-sequence.test.ts` for that? Default if no answer: untouched, DoD 6 shows 2 fails.
  Checked: TASK-115 closed file list + Q1–Q3 additions; SPEC-107 § API Consumers (names `rebuild-sequence.test.ts` for `specChangedVersion`).
  > answer: **yes, that test only, as you propose** — change sets rev 2 (STEP-004) + rev 3 (STEP-001) in the fake before `:90`; `latestSeenVersion` = the fake's label number (label is a tag, D2); cards 1 and 3 flagged `3`, then card 1 cleared (so `1:todo:-`, `3:todo:3` as before); `card.spec_changed` → `spec.revised` in the `:110` list; `rebuild-check same: true` and rebuilt = tables stay. SA read `:84-111` and `reduce.ts:184-190` 2026-10-29 19:0x. SPEC-107 named this file as a consumer but no TASK owned it — my gap. — Silver (SA) 2026-10-29 19:0x
  > on Q3 `:130` staying 502: **accepted in principle** — D12 records a removal only from the pull; with Blueprint down, no cache and no pull, CAW cannot tell gone from down, so `blueprint_unreachable` is the honest reason. Final at review against your run. — Silver (SA) 2026-10-29 19:0x

## Review
**Verdict: DONE** — Silver (SA), 2026-10-29 19:2x. Against SPEC-107 D6–D8, D12, § API (Project, Card), § Data Model 0012, and the Q1–Q4 answers.
- **Evidence re-run by me** (`env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT`, `--no-env-file`): `bunx tsc --noEmit` → `0`; `bun test test/follow test/http/{notify,anchor-removed,projects,cards,spec-latest,rebuild-sequence,runner-actor,chat}.test.ts test/core/events.test.ts test/db` → `100 pass · 0 fail · Ran 100 tests across 24 files`. Whole suite (863/1/1, only the known `settings.test.ts`) taken from the Notes, not re-run.
- **Scope:** `git status` vs the TASK-114 tree (my 18:3x snapshot): the new paths are exactly `routes/chat.ts`, `rebuild-sequence.test.ts`, `0012_card_anchor_removed.sql`, `meta/0012_snapshot.json`, `migration-0012.test.ts`, `anchor-removed.test.ts`, `notify.test.ts` — all on the list (Q1–Q4). `0012` = `ALTER TABLE "caw"."cards" ADD COLUMN "anchor_removed_revision" integer;` = SPEC SQL.
- **Push route** (`routes/follow.ts` diff read): union of the three kinds; only `version.confirmed` / `spec.changed` start a pull; 14 bad bodies → 400 (notify.test). No new auth surface — the route was already actor-free (SPEC-A-005).
- **Decisions:** 1 (`lastPullAt` = last pull that got through), 2 (one revision per pull for all flagged cards — the flag means "changed since cut"; D6 asks one event), 3 (discard partial pages), 4 (last set per key decides), 5 (question cards marked too), 6 (400 message wording) — **accepted**. 7 (`not_workable` text in `hops/service.ts:47` doesn't name a removed anchor): **no change** — caw-front never shows that message (`front: src/components/Board.tsx:166` swallows `not_workable`), and the card itself shows the PM's removed-part sentence (TASK-116). 8 / Q3 `spec-latest.test.ts:130` stays 502: **accepted** — Blueprint down, no cache, no pull has seen the removal ⇒ CAW cannot tell gone from down; when Blueprint answers 404 before the pull, it is `anchor_removed` (anchor-removed.test "not-yet-pulled 404").
- **UNVERIFIED (carried, not blocking):** v2 `/spec/changes` answers are synthetic until Team A's TASK-113 → QA's joint run; 0012 on PGlite only; silent-failure-hunter not available — I read `pull.ts`'s catch path via the Notes (rethrows everything but `BlueprintUnreachable`).
