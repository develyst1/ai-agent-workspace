# TASK-114: caw-back — read the latest spec (client v2, cache, hop pin, no-label start)
- Source: SPEC-107 (REQ-105, Team B)
- Owner: BE (Bob)
- Status: DONE (2026-10-29 18:2x, Silver — § Review) · was REVIEW (Bob) · was: released 2026-10-29 17:5x (SA): REQ-113 committed (a17ff11), PM go given 17:1x. Citations re-checked against a17ff11 (two moved, fixed; see SPEC-107).
- Depends on: REQ-113 committed (a17ff11) in caw-back ✓ (PM order 2026-10-29 17:0x: REQ-111 → REQ-113 → REQ-105 → REQ-112) · PM go ✓ (Porter 2026-10-29 17:1x: "start the moment REQ-113 is committed")

## What to do

Read SPEC-107 first: § Design D1–D5, D11, § API, § Data Model, § Events, § Tests, § Guardrails. Blueprint's routes and shapes:
`specs/SPEC-106-seam-latest-spec.md` § "Seam contract v2" routes 1–3 (field casing exact).

1. **Client** (`src/blueprint/client.ts`): add `spec(bp)`, `specContext(bp, key)`, `specLocate(bp, request)`, `specChanges(bp, after)` with
   the same error rules as today (`get`: 404 → null, else non-200 / network / not JSON → `BlueprintUnreachable`; `specLocate` like `locate`).
   Types from SPEC-106. Keep the v1 functions.
2. **Migration 0011** — exactly SPEC-107 § Data Model (all of it, also the `follow_state` columns TASK-115 uses). `bun run db:generate`
   as for 0010; the generated SQL must equal the SPEC's statements.
3. **`src/blueprint/latest.ts`** (new): `readLatestPart` (D4) and `pinHop` (D5).
4. **Events / state** (`src/core/events.ts`, `reduce.ts`, `state.ts`): `project.created` optional `latestLabel`, `revision`;
   `card.created` `anchor.label`, `anchor.revision`; card state `anchorLabel`, `anchorRevision`; project state `latestLabel`
   (absent in old events → null / 0). `spec.revised` is TASK-115's.
5. **Services:** `createProject` (D11 — label + revision from `spec(bp)`, write `follow_state.last_pulled_revision`, no 409
   `version_not_confirmed`) · `createCard` + proposal accept (anchor version/label/revision from the read; key not live → 422
   `anchor_not_in_version`) · `checkAnchors` in `src/proposals/service.ts` (latest, `proposal.version` = label number) ·
   `readPart` (latest, `version` ignored) · `cardContext(db, blueprint, cardId, actor, hopId)` (pin first, else D4; adds `specRead`) ·
   `src/seam/service.ts` `locate` → `specLocate` · **D7 (PM's Q2 answer): the flag no longer stops a card** — drop the
   `specChangedVersion === null` term from `isWorkable` (`src/cards/view.ts:25` (was :23 before REQ-111)), drop "or its spec changed" from the 409 message
   (`src/hops/service.ts:47`), drop the spec-changed term from the stuck count (`src/projects/service.ts:121`); "clear" stays.
   Test: a flagged card is workable and a hop starts on it.
6. **Routes:** `cards.ts` (context passes actor + hop; `anchor.version` optional; Card `anchorLabel`; CardContext `specRead`) ·
   `hops.ts` (card hop → `pinHop` after `startHop`, before the 201) · `projects.ts` (create body `version` optional) ·
   `proposals.ts` (item `anchor.version` optional) · `src/mcp/server.ts:112` (`version` optional, new description). Then
   `bun run openapi:emit` → `openapi.json`.
7. **Tests** — synthetic v2 in `test/helpers/fake-blueprint.ts` (SPEC-107 § Tests: each v2 answer commented `// synthetic — SPEC-106 v2,
   until recorded`; a way for a test to change a part's text and bump the revision, and `down`). New file `test/http/spec-latest.test.ts`
   covering: no-label start; card read = latest text; **pin**: start a card hop, change the part, `card_context` with that hop's
   `X-CAW-Hop` → old text, without it → new text; Blueprint down → `fromCache: true` with the last text; down + nothing cached → 502;
   failed pin does not fail the hop. Update existing tests that asserted v1 behaviour and **list each one** in Notes with why.

**Closed file list** (anything else → ask in `## Questions` first): `src/blueprint/client.ts`, `src/blueprint/latest.ts` (new),
`src/db/schema.ts`, `src/db/migrations/0011_*.sql` (new), `src/db/migrations/meta/0011_snapshot.json` (new),
`src/db/migrations/meta/_journal.json`, `src/core/events.ts`, `src/core/reduce.ts`, `src/core/state.ts`, `src/projects/service.ts`,
`src/cards/service.ts`, `src/cards/view.ts`, `src/hops/service.ts` (the 409 message only), `src/proposals/service.ts`, `src/seam/service.ts`, `src/http/routes/cards.ts`,
`src/http/routes/hops.ts`, `src/http/routes/projects.ts`, `src/http/routes/proposals.ts`, `src/mcp/server.ts`, `openapi.json`,
`test/helpers/fake-blueprint.ts`, `test/http/spec-latest.test.ts` (new), `test/db/migration-0011.test.ts` (new), `test/mcp/server.test.ts`,
and existing files under `test/blueprint/`, `test/http/` that break because of this change (listed in Notes). SPEC-107 § API "Consumers"
lists every grepped hit. `src/follow/pull.ts` and `src/http/routes/follow.ts` are TASK-115's, not yours. **No git.** Guardrails SPEC-107 G1–G5.

## Definition of Done

Every caw-back command below runs as `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT <command>` (G2).

- [ ] 1. Before you start: `git -C <caw-back> log --oneline -1` → `a17ff11 feat: a worker's commands cannot reach I-Space's own servers …` and `git status --short` → empty (base: `a17ff11`, 0 paths, SA 2026-10-29 17:5x right after the REQ-113 commit)
- [ ] 2. `grep -c '/spec' src/blueprint/client.ts` → ≥ 4 (base: `0`, SA 14:2x)
- [ ] 3. `grep -c 'spec_parts\|hop_spec' src/db/schema.ts` → ≥ 2 (base: `0`, SA 14:2x)
- [ ] 4. `bun test test/db --timeout 30000` → 0 fail, the new migration-0011 test among them (base: `Ran 14 tests across 12 files` · `0 fail`, SA 14:2x)
- [ ] 5. `bun test test/http/spec-latest.test.ts --timeout 30000` → 0 fail, each case in What-to-do 7 named (base: n/a — new: this TASK creates the file)
- [ ] 6. `bun test test/blueprint test/http/projects.test.ts test/http/cards.test.ts test/http/proposals.test.ts test/http/seam.test.ts test/http/part-read.test.ts test/http/hops-runs.test.ts test/follow --timeout 30000` → 0 fail; every changed assertion listed in Notes (base: `Ran 69 tests across 8 files` · `69 pass` · `0 fail`, SA 14:2x)
- [ ] 7. `bun test --timeout 30000` (whole suite) → only the known machine fail `settings.test.ts:162` (base: `749 pass / 1 skip / 1 fail` — Bob's TASK-112 run 2026-10-29 14:15, not re-run by the SA)
- [ ] 8. `bunx tsc --noEmit; echo $?` → `0` (base: `tsc exit 0`, SA 14:2x)
- [ ] 9. `POST /v1/projects/{id}/rebuild-check` in a test after cards with labels exist → clean (replayed columns match) (base: n/a — new columns)
- [ ] 10. After: `ss -ltn` shows no port you opened; `pgrep -fc 'output-format [s]tream-json'` → `0` = no CLI child a runner started (plain `pgrep claude` counts the team's own sessions) (base: `0`, SA 14:3x)

## Implementation Notes
Bob, 2026-10-29. Repo `caw-back`, branch `atom`, base `a17ff11`. Nothing committed (SA's). Every command run as `env -u CLAUDE_BIN -u DATABASE_URL -u CAW_WORKSPACE_ROOT bun --no-env-file …`; no live CLI, no real DB, `DATABASE_URL` never printed.

### What changed (all inside the closed list; `src/app.ts` by Silver's Q1 answer, one token)
- **Client** `src/blueprint/client.ts`: `spec`, `specContext` (404 → null), `specLocate`, `specChanges` (non-200 / 404 → `BlueprintUnreachable`); v1 functions kept, no service calls them any more.
- **Schema + migration** `0011_spec_latest` (generated by drizzle, equal in effect to SPEC-107): `projects.latest_label`, `cards.anchor_label/anchor_revision`, `follow_state.last_pulled_revision/last_pull_ok`, tables `spec_parts`, `hop_spec`.
- **Core** `events/reduce/state`: `project.created` gets optional `latestLabel`, `revision`; `card.created` anchor gets optional `label`, `revision`; question card copies the asker's. Old events replay unchanged.
- **`src/blueprint/latest.ts` (new)**: `readLatestPart` (200 → upsert `spec_parts`; 404 → null + delete cache row; unreachable → cached row `fromCache:true`, else rethrow → 502; a 200 without an integer `revision` counts as unreachable), `pinHop` (never throws; codes-only log line), `pinnedRead`, `cardAnchor`, `labelOf`.
- **Services/routes**: project start without label/version (D11, no 409 `version_not_confirmed`); `GET parts/{key}` ignores `?version`; card create ignores `anchor.version` (422 `anchor_not_in_version` if the key is not live); proposals/accept read the latest; `locate` goes to `/spec/locate`; `card_context` returns `specRead{revision,readAt,fromCache,pinned}` and gives a worker's OWN hop on that card its pinned text (also after the hop ended); `hops` route pins a card hop after `startHop` (chat hops not pinned); D7: flagged card is workable, 409 text and stuck count drop the spec-changed term, `clear` stays; MCP `propose_cards` `version` optional.
- `openapi.json` re-emitted: only removed lines are descriptions, `minimum` 1→0 and `version` leaving `required` (relaxations) — no field removed (checked with `git diff -U0`).

### Decisions I made (reviewer may overturn)
1. `card_context` when the anchor key has left the current spec → 502 `blueprint_unreachable` (old behaviour kept). A distinct code would be client-visible → **Silver's call**, not changed.
2. Proposal items are STORED with the label number CAW's own read carried (0 = none); `proposal.version` = max of them.
3. Project `spec{revision,reachable,lastPullAt}` and everything in `src/follow/pull.ts` / `routes/follow.ts` left to TASK-115; `pull.ts` still reads v1 feed, so a label-less project's follow is TASK-115's to fix.

### Existing tests changed (each: why)
- `test/core/events.test.ts` — expected project state gains `latestLabel: null` (new ProjectState field).
- `test/http/projects.test.ts` (4): create → keys + `latestLabel`, calls `…/spec` not `…/versions/1`, event data + `latestLabel`,`revision`; errors test: `version` optional/ignored (no 400 for missing/0, no 409 `version_not_confirmed`; negative/non-number still 400); AC-1 event keys; v1.15 order test (no `version_not_confirmed`).
- `test/http/cards.test.ts` (5): anchor errors (no 422 `version_not_confirmed`, version ignored); POST keys + `anchorLabel`; Blueprint down → a part read before is served from cache (201), unread part → 502; context = v2 context + `specRead`, down → `fromCache`, part gone → 502; spec-change clear: flagged card was already workable.
- `test/http/part-read.test.ts` — rewritten for latest read (`?version` ignored; cache; 404 drops cache row; read saves `spec_parts`, no event).
- `test/http/proposals.test.ts` (4): version omitted/ignored and stored label number; locate answer has `revision`; missing `key` is the 400; accept with Blueprint down → 502 only after clearing `spec_parts`; no `version_not_confirmed`.
- `test/http/seam.test.ts` (2): locate via `/spec/locate`, answer has `revision` not `version`; "no spec text stored" now exempts `spec_parts.body` / `hop_spec.body` (their job, SPEC-107 D3) — events and every other table still must hold none.
- `test/mcp/server.test.ts` (1): `card_context` through the worker's hop is pinned (differs from operator's `specRead` only).
- `test/follow/pull.test.ts` (2, TASK-115 owns the file's future): flagged card now `workable:true`; the "anchored at v2" card is made by setting `anchor_version=2` directly (version in the body is ignored now). Nothing else of pull touched.
- `test/helpers/fake-blueprint.ts`: added synthetic v2 routes `/spec`, `/spec/parts/{key}/context`, `/spec/locate`, `/spec/changes?after=`, each marked `// synthetic — SPEC-106 v2, until recorded`; `mode.spec`, `mode.changes`. Context text = recorded v1/v2 fixtures reshaped (STEP-004 title differs v1 vs v2 — that is how tests "edit" a part).

### New tests
`test/db/migration-0011.test.ts` (old rows keep values + defaults, keys/FKs hold); `test/http/spec-latest.test.ts` (11): no-label start (+ later label), start 404/502 writes nothing, card read = latest text, **pin** (old text for own hop incl. after it ended, new text for operator / no header / other card's hop), outage → `fromCache` / 502 / cache row dropped on 404, failed pin never fails the hop, D7 workable + 409 text + stuck count, rebuild-check clean after labelled cards (DoD 9), client v2 error rules.

### DoD evidence (real output)
1. `git log --oneline -1` → `a17ff11 feat: a worker's commands cannot reach I-Space's own servers …`; start tree was clean.
2. `grep -c '/spec' src/blueprint/client.ts` → `4`.
3. `grep -c 'spec_parts\|hop_spec' src/db/schema.ts` → `2`.
4. `bun test test/db` → `15 pass · 0 fail · Ran 15 tests across 13 files`.
5. `bun test test/http/spec-latest.test.ts` → `11 pass · 0 fail`.
6. the 8-file group → `70 pass · 0 fail · Ran 70 tests across 8 files`.
7. whole suite → `848 pass · 1 skip · 1 fail · Ran 850 tests across 67 files`; the one fail is `src/runner/settings.test.ts:162` (`process.execPath`, known machine fail, file untouched).
8. `bunx tsc --noEmit` → exit `0`.
9. rebuild-check `{same:true}` asserted in spec-latest (label 0 start, label 3 card) and in proposals accept.
10. `ss -ltn` → only pre-existing listeners (1337–1340, 2375, 6080, 13610, 14010, 26500, 50052), none mine; `pgrep -fc 'output-format [s]tream-json'` → `0`.

### UNVERIFIED
- The v2 Blueprint answers are SYNTHETIC (SPEC-106 v2, not recorded yet): a real blueprint-back may differ in a field name or an error shape → settle with QA's joint run against TASK-113.
- Migration applied on PGlite only (up from 0010 with rows); not on a real Postgres.

## Questions

**Q1 (Bob → Silver — blocks only the hop-pin wiring and its tests).** D5 has the **hops route** pin a card hop after `startHop` (`readLatestPart` needs the Blueprint client). `hopRoutes(app, db)` has no client today; `src/app.ts` calls `hopRoutes(app, db)` and has the client in scope (`cardRoutes(app, db, blueprint)` right above it). The fix is one token: `hopRoutes(app, db, blueprint)` in `src/app.ts:31`. `src/app.ts` is **not** in the closed list. May I make that one-token change? (No other route is reachable without it: the pin must run in the same request as the hop start, and I will not reach for a default client inside `hops.ts` — it would ignore the one the app was given.)
  Checked: TASK-114 closed file list (names `src/http/routes/hops.ts`, not `src/app.ts`); SPEC-107 D5.
  > answer (Silver, 2026-10-29 18:0x): **yes.** `src/app.ts` is added to the closed list for exactly that one change: `hopRoutes(app, db)` → `hopRoutes(app, db, blueprint)`. Read: it is `src/app.ts:32` on a17ff11, the only call site (`grep -rn "hopRoutes(" src test` → `src/app.ts:32`, `src/http/routes/hops.ts:29`), and `blueprint` is already in scope there (`cardRoutes(app, db, blueprint)` at `:31`). Tests build the app through `test/helpers/api.ts`, so they get it the same way. My miss: D5 needs the client in the route, and I did not list its wiring (F-026).

## Review

**Verdict: DONE** — Silver (SA, Team B), 2026-10-29 18:2x.
- **Against SPEC-107 D1–D7, D11:** v2 client (four routes; v1 kept, unused); migration 0011 equal in effect to the SPEC's SQL; `readLatestPart` (200 → cache, 404 → null and the cache row dropped, unreachable → cached row `fromCache`, else 502); `pinHop` never fails the hop; `card_context` gives the pinned text **only** to the worker's own hop on that card (`cards/service.ts:96-101`, read by me), everyone else the latest; no-label start; D7 (flag no longer stops a card). Matches.
- **Re-run by me:** spec-latest + test/db + cards + projects + proposals + seam + part-read + test/mcp + test/follow + test/core → `122 pass · 0 fail · Ran 122 tests across 24 files`; `bunx tsc --noEmit -p .` → exit 0; 33 paths. Suite 848/1/1 accepted on your output.
- **Your three decisions:** (2) proposal items keep the label number read — **accepted**; (3) follow left to TASK-115 — **accepted** (that is the split); (1) `card_context` for a part that left the spec keeps the old 502 `blueprint_unreachable` — **accepted for now**: not a regression, and rare. The reason it gives is misleading (it is not an outage), so a distinct answer + its words go to the PM as REQ-105 Q4. Built in TASK-115/116 once worded.
- **Carried, not this TASK's:** the v2 Blueprint answers are synthetic (TASK-113, Team A, not built yet) → REQ-105 is only provable end to end after TASK-113 + a joint run. Told to the PM.
- Git: nothing. TASK-115 is released.
