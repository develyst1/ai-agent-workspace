# TASK-113: blueprint-back — seam v2: revision counter, latest-spec reads, changes feed, `spec.changed` push
- Source: SPEC-106 (REQ-105, Team A side)
- Owner: BE (Jason)
- Status: DONE (2026-10-30 12:0x, Sober)
- Depends on: **REQ-103 committed (`a4bf924`, 2026-10-29 15:3x) · REQ-110 committed (`e2c3326`, 2026-10-30 08:5x) · REQ-114 round 1 committed (`9578d51`, 2026-10-30 10:4x)** ✓ in blueprint-back. REQ-114 was added 2026-10-30: it comes before REQ-105 in the owner's order (`DECISIONS.md` 2026-10-30 02:4x) and uses the same tree (TASK-132). *(ORDER 42 form.)*
- Repo: `blueprint-back` (path: `machine.local.md`), branch `atom`. **No git write.**

🔴 Prefix every `bun` command with `DATABASE_URL=pglite:memory` (and `PORT=` when it serves). Never print `.env`. No gateway, no CLI.

The contract is SPEC-106 § Seam contract v2 and § Data Model. **Team B builds against it**, so any change to a field or code is a question to the SA first.

## Files (closed list — anything else → `## Questions` first)

- `src/db/schema.ts` + one new migration (+ `meta/`). The backfill `UPDATE` is hand SQL in the generated file; say so in Notes.
- `src/spec/store.ts` (assign `rev` in `applyChangeSet` and `undoChangeSet`; a `revisionOf(projectId)` helper)
- new `src/seam/spec.ts` (current spec, context-at-latest, locate-at-latest, changes feed). Reuse `context.ts`/`locate.ts` scoring by passing them the live `{parts, links}`, without copying them; refactor them only as far as that needs.
- `src/seam/context.ts`, `src/seam/locate.ts` (only to take a `{parts, links}` input; v1 behaviour byte-for-byte the same)
- `src/seam/notify.ts` (`notifySpecChanged`, not awaited) · the places that call it after commit (`src/spec/store.ts` callers, or one hook after `applyChangeSet`/`undoChangeSet` returns)
- `src/http/routes/seam.ts` (4 new routes) · `src/http/actor.ts` (exempt `spec/locate`)
- `openapi.json` (via `openapi:emit`)
- `test/seam/**` — **new files only**. The existing seam test files stay at zero diff.
- `test/db/rules.test.ts:22,94` · `test/sit/rules.sit.test.ts:91,180,247` · `test/spec/store.test.ts:160` — add `rev: 1` to each `changeSets` insert, nothing else (Q1, added 2026-10-30).

## What to do

1. `rev` + migration + backfill, per SPEC-106 § Data Model. Test: concurrent saves on one project get distinct consecutive revs; undo raises rev too.
2. The four v2 routes, exactly as specified (shapes, 404/400, `more` paging at 500).
3. `spec.changed` push after every committed change set, not awaited; `version.confirmed` unchanged.
4. v1 unchanged: `git diff --stat test/seam/{amend,context,feed,locate,notify}*` → empty (base: empty — `git diff --stat test/seam/` → 0 lines on `9578d51`, Sober 10:4x); the existing seam tests pass.

## Definition of Done (each with its command and real output, pasted)

1. Base: `bun test --timeout 30000` (full env prefix) on the committed tree. Paste the summary line. (Expected `279 pass / 16 skip / 0 fail` — TASK-132's full run on exactly the content now committed as `9578d51`, accepted by Sober 09:3x. Run it again yourself as the base; a lone load timeout is re-run alone.)
2. After: same → 0 fail (base: 279/16/0, as above). `bunx tsc --noEmit` → 0 (base: exit 0, Sober 09:3x on this content).
3. New tests, named in Notes:
   - each v2 route's shape, field by field;
   - `revision` 0 on an empty project; +1 per save of each cause (round, hand edit, requirement, undo, wrong mark); sources, settings and labels do **not** raise it;
   - changes feed classification: add, update, remove, restore, link change marks both ends; `after` ≥ revision → `[]` (base: n/a — new route); `more` paging;
   - locate-latest with no label at all → candidates from the live spec (base: n/a — new route; v1 locate refuses with no label, `src/seam/locate.ts:37`);
   - push: a fake receiver gets `spec.changed` with the right `revision` after a save. The request doesn't wait for a slow receiver (receiver sleeps 3 s; the save returns in < 1 s);
   - `spec/locate` needs no name header;
   - v1 regression: zero diff in the existing seam tests, all pass.
4. `openapi:emit`, with `git diff --stat openapi.json`. Then write "contract emitted" in Notes, so the PM can tell Team B.
3b. Every new-test line in 3 is new behaviour (base: n/a — new: no v2 route, `rev` or `spec.changed` exists before this TASK).
5. `git status --short` → only closed-list files (base: `0` paths on `9578d51`, Sober 10:4x). Ports free. `env | grep -c BLUEPRINT_GATEWAY_LIVE` → 0 (base: `0`, Sober 14:4x).

## Implementation Notes
Jason, 2026-10-30 ~11:3x. All `bun` commands prefixed `DATABASE_URL=pglite:memory`. No git, no gateway, no CLI, `.env` never printed.

**Built (all in `blueprint-back`)**
- `src/db/schema.ts` + migration `0010_brave_black_tom.sql` (+ `meta/0010_snapshot.json`, `_journal.json`): `change_sets.rev integer NOT NULL` + unique index `change_sets_project_rev_idx (project_id, rev)`. **The backfill `UPDATE … row_number() OVER (PARTITION BY project_id ORDER BY at, id)` is hand SQL** that I put into the generated file (drizzle writes `ADD COLUMN … NOT NULL`, which fails on existing rows): add nullable → backfill → `SET NOT NULL` → index, exactly the order of SPEC-106 § Data Model.
- `src/spec/store.ts`: `revisionOf(q, projectId)` (max rev, 0 when none, exported); `rev = revisionOf + 1` in `applyChangeSet` and `undoIn`, both after `requireProject(…, true)` (the project lock), so two saves cannot read the same max; the unique index is the backstop. After the transaction commits, `void notifySpecChanged(…)`. `undoChangeSet` does the same; the dry run in `wouldUndo` (rolled back) never reaches it. The public results (`{changeSetId, keys}` / `{changeSetId}`) are unchanged.
- `src/seam/notify.ts`: one private `send(payload)` with the old body byte-for-byte; `notifyConfirmed` and new `notifySpecChanged` call it. Same rules: http(s) only, 2 s, codes-only log, empty URL = no call; `notifySpecChanged` is never awaited.
- new `src/seam/spec.ts`: `currentSpec`, `specContext`, `specLocate`, `specChanges`. **Internal decision:** `revision` is read BEFORE the spec, so a save landing in between can only make the parts newer than the revision (CAW re-reads on its next poll), never older. Feed classification = the v1 feed rules (add / restore → `added`, now removed → `removed`, other part row → `changed`, a link row marks both ends `changed` unless that end is added/removed in the same set). Extra rule of mine: a part made and removed inside one set is in neither list.
- `src/seam/context.ts` (`contextIn({parts, links}, key)` extracted; `partContext` builds the same body, key order `projectId, version, confirmedAt, part, …` unchanged) and `src/seam/locate.ts` (`locateIn(spec, request)` extracted; `locate` returns `{version, …locateIn}` in the same order). v1 behaviour is the same: all v1 seam tests pass and `git diff --stat test/seam/` shows no existing file.
- `src/http/routes/seam.ts`: the 4 routes, `src/http/actor.ts`: `spec/locate` joins the name-free regex. `latestLabel` = `listLabels()[0]` (the v1 label list's newest row), null with no label.
- Q1 (Sober, 11:1x): `rev: 1` added to the 6 test inserts in `test/db/rules.test.ts` (2) · `test/sit/rules.sit.test.ts` (3) · `test/spec/store.test.ts` (1). One token each, no assertion change.

**Migration down:** none written. Every migration in this repo is a forward-only drizzle file (no `down` exists for 0000–0009 either). Reverse by hand if ever needed: `DROP INDEX change_sets_project_rev_idx; ALTER TABLE change_sets DROP COLUMN rev;` (no data lost beyond the counter, which `row_number()` re-derives). Flagged for the reviewer. **Not applied anywhere real** (SPEC-104 G5b); the TEST DB is untouched.

**contract emitted** — `openapi:emit` run; `git diff --stat openapi.json` → `1 file changed, 663 insertions(+), 27 deletions(-)`. The text diff is mostly components moving; compared semantically (old HEAD json vs new, script in my scratchpad): **changed paths: none · new paths: `/v1/projects/{projectId}/spec`, `…/spec/changes`, `…/spec/locate`, `…/spec/parts/{key}/context` · changed schemas: none · new schemas: `CurrentSpec`, `SpecChanges`, `SpecLocated`, `SpecPartContext`.** So Team B can build on it now.

**DoD evidence**
1. Base on the committed tree: `bun test --timeout 30000` → `279 pass / 16 skip / 0 fail, Ran 295 tests across 40 files [356.45s]` ✔ (before any edit, `git status` = 0 paths, HEAD 9578d51).
2. After: `bun test --timeout 30000` → `302 pass / 16 skip / 0 fail, Ran 318 tests across 42 files [610.25s]` (279 + my 23 new = 302 ✔; no load timeout this time). `bunx tsc --noEmit` → exit 0 ✔.
3. New tests (`test/seam/spec-v2.test.ts` 17, `test/seam/spec-push.test.ts` 6 — `17 pass / 0 fail` and `6 pass / 0 fail` on their own runs):
   - revision: `0` on an empty project; `+1` for each of hand edit, interview round (`message`), `source`, requirement part, undo, wrong quiz mark → `[1,2,3,4,5,6]`; a source added, a `right` mark and a label do **not** raise it; 5 concurrent saves → distinct consecutive revs; a refused set takes none.
   - `GET /spec`: key list and each field; `parts`/`links` equal `GET /v1/projects/{id}`'s; empty project → `0`, `savedAt` null; unknown project → 404 `not_found`; `latestLabel` null then `{version,label,labelledAt,by}`; live after a label (an edit after the label shows).
   - context: field list, `revision/savedAt/latestLabel` in, `version/confirmedAt` out, `part/neighbours/decisions/flows/questions` equal v1's for the same state; unknown key → 404.
   - locate: **no label at all** → 200 with `STEP-004` among candidates while v1 `locate` on the same project → 409 `no_confirmed_version`; empty spec → `notInSpec: true`; empty request → 400; sees a part added after the label; **no name header** on any of the routes (the helper sends none).
   - changes: shape field by field; `after ≥ revision` → `[]`; default after 0; `-1`, `1.5`, `abc` → 400 `validation`; unknown project 404; classification: add · link add marks both ends · update · remove (+ its link's other end `changed`) · restore by undo (`cause: "undo"`); made-and-removed in one set → in no list; paging: 503 sets → first answer 500 + `more: true`, `after=500` → `[501,502,503]`, `more: false` (503 sets written straight to `change_sets`; the feed reads that table).
   - push: after a save a local receiver gets exactly `{ event: "spec.changed", projectId, revision, at }` (`at` = the set's time); HTTP hand edit then undo give revisions `n`, `n+1`; **slow receiver (sleeps 3 s): `applyChangeSet` returns in < 1 s**, then one `[notify] failed reason=timeout`; receiver down → the save still lands, one codes-only line; refused set, the `undoable` dry run and a label send no `spec.changed`, and the label still sends `version.confirmed` alone; empty URL → `fetch` not called.
   - **backfill on existing rows** (the one thing the in-memory tests cannot show, since they migrate empty): `tests/harness/test-113/backfill-check.mjs` applies 0000–0009, seeds 2 projects with 4 sets (one inserted out of time order), then runs 0010 → `[A 1 operator, A 2 source, A 3 message, B 1 operator]` `backfill by time, per project: OK`, `rev is_nullable after: NO`, a duplicate `(project, rev)` → refused by `change_sets_project_rev_idx`.
3b. Every line above is new behaviour (base: n/a — no v2 route, `rev` or `spec.changed` existed).
4. `openapi:emit` + diff stat: see "contract emitted" above.
5. `git status --short` → 17 paths: ` M` `openapi.json`, `src/db/migrations/meta/_journal.json`, `src/db/schema.ts`, `src/http/actor.ts`, `src/http/routes/seam.ts`, `src/seam/context.ts`, `src/seam/locate.ts`, `src/seam/notify.ts`, `src/spec/store.ts`, and the 3 test files Sober added; `??` `src/db/migrations/0010_brave_black_tom.sql`, `src/db/migrations/meta/0010_snapshot.json`, `src/seam/spec.ts`, `test/seam/spec-push.test.ts`, `test/seam/spec-v2.test.ts`. `git diff --stat test/seam/` → 0 lines; `bun.lock`/`package.json` diff → 0; `ss -ltn` :4200/:4500 → nothing; `env | grep -c BLUEPRINT_GATEWAY_LIVE` → `0`.

**UNVERIFIED:** (a) the 3 `rev: 1` edits in `test/sit/rules.sit.test.ts` — those tests are among the 16 skips (they run only against a real database), so they are typechecked (`tsc` 0) but not executed; the two other files' edits ran and pass (`test/db/rules.test.ts`, `test/spec/store.test.ts`). (b) `spec.changed` against the real CAW receiver — Team B's side; Q1 of SPEC-106 (does CAW ignore an unknown `event`) is still open with the PM. (c) The migration on the remote TEST DB (not mine to apply).

## Questions
**Q1 (Jason → Sober, 2026-10-30 ~11:0x) — `rev NOT NULL` breaks 6 existing test inserts that are outside the closed list.** SPEC-106 § Data Model makes `change_sets.rev` `NOT NULL`, with no default (a per-project counter cannot be a column default). Six test lines insert a `change_sets` row directly, with no `rev`, and now fail: `test/db/rules.test.ts:22,94` · `test/sit/rules.sit.test.ts:91,180,247` · `test/spec/store.test.ts:160`. Measured: `bun test test/db/rules.test.ts test/spec/store.test.ts` → `5 pass / 3 fail`, each `null value in column "rev" of relation "change_sets" violates not-null constraint` (base: 8 pass / 0 fail on 9578d51). No product code does this; only those tests seed a set by hand.
- **Proposal (default I will use unless you say otherwise):** add `rev: 1` to those 6 `values({ … })` objects (test-only, one token each, no assertion changes), and list the 3 files in Notes. Every one of them inserts a single set into a fresh project, so `1` is the true next rev.
- Alternative: make `rev` nullable and number only new sets. I don't recommend it: it breaks SPEC-106's unique-and-complete counter.
- Not blocking the rest: I am building the routes/push/tests meanwhile and will not touch those 3 files until you answer.
  > answer (Sober, 2026-10-30 11:1x): **yes — add `rev: 1` to the 6 inserts, exactly as proposed.** I re-checked each one: all 6 seed one set into a project made in the same test (`setup()` in `store.test.ts`, `project(tx)` in the sit file, `insert(projects)` in `rules.test.ts`), so `1` is the true next rev and the unique `(project_id, rev)` index holds. **The closed list gains** `test/db/rules.test.ts`, `test/sit/rules.sit.test.ts` and `test/spec/store.test.ts`, with that one token per insert only and no assertion change; list them in Notes. Keeping `rev` NOT NULL is right. The gap is mine: SPEC-106's consumer grep (`insert(changeSets)`) ran on `src` only (FAILURES F-034).
## Review
Sober (SA, A), 2026-10-30 12:0x — **DONE.**
- **Contract vs SPEC-106:** the emitted `openapi.json` schemas carry exactly the SPEC's fields (`CurrentSpec`: projectId, revision, savedAt, latestLabel, parts, links · `SpecPartContext`: v1's part/neighbours/decisions/flows/questions + revision/savedAt/latestLabel · `SpecLocated`: revision, notInSpec, candidates · `SpecChanges`: revision, latestLabel, changes[rev, at, by, cause, added, changed, removed], more). No v1 path or schema changed (Jason's semantic diff).
- **Correctness read:**
  - `rev = revisionOf(tx) + 1` is taken inside the transaction, after the project lock, in apply and undo.
  - `notifySpecChanged` fires only after `db.transaction` returns. That holds for the round too: its bot row is written in `inTx`, inside the same transaction (`round.ts:589-596`), and every caller passes the top-level `db` (`grep -rn "applyChangeSet(\|undoChangeSet(" src`: quiz/store.ts:199, routes/change-sets.ts:30,43, round.ts:589).
  - Migration 0010 is in SPEC order: nullable → backfill → NOT NULL → unique index.
- **Sober's re-run:**
  - `bunx tsc --noEmit` → exit 0;
  - `bun test --timeout 30000 test/seam test/spec test/db` → **119 pass / 0 fail** [130 s];
  - `git diff --stat test/seam/` → 0 lines (v1 tests untouched);
  - `tests/harness/test-113/backfill-check.mjs` (in-memory pglite) → `A 1,2,3 · B 1`, `backfill by time, per project: OK`, `is_nullable NO`, duplicate refused;
  - no listeners on :4200/:4500.
- **Full suite 302/16/0 accepted** from the evidence (279 + 23 new).
- **Migration down — accepted as forward-only.** No migration 0000–0009 has a down; the reverse SQL in Notes is enough. It is not applied to the remote TEST DB (no one has asked for it).
- **UNVERIFIED as Jason says:** the 3 sit-test edits only typecheck (the sit tests skip without a real DB); `spec.changed` against the real CAW receiver is Team B's side (SPEC-106 Q1 open with the PM).
