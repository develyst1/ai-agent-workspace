# TASK-107: blueprint-back — typed name on every write, audit_events, hand labels, requirement kind, project history
- Source: SPEC-104 (REQ-103, Team A)
- Owner: BE (Jason)
- Status: DONE (2026-10-29, Sober — see § Review)
- Depends on: —
- Repo: `blueprint-back` (path: `machine.local.md`), branch `atom` @ f60b934. **No git write** (G1). Leave the work in the tree.

The contract is SPEC-104 § API / Interface Design and § Data Model. Read them first; this TASK does not repeat them.

🔴 **Added 12:5x (SA): this repo now has a real `.env`** pointing at a remote TEST DB, and Bun loads it by itself. Prefix **every** `bun` command here with `DATABASE_URL=pglite:memory` (plus `PORT=` when it serves), including `db:generate` and `openapi:emit`. Never print `.env`. Don't apply the migration to the remote DB. (SPEC-104 G5b)

## Files (closed list — anything else → `## Questions` first)

- `src/db/schema.ts` · `src/db/migrations/` (one new migration + `meta/`, from `bun run db:generate`)
- `src/app.ts` (the who middleware, next to the `/v1/*` use at `:28`) · new `src/http/actor.ts` (parse + decode + `name_required`)
- `src/http/errors.ts` (the `name_required` 400 code only)
- `src/projects/service.ts` (create, settings, label) · `src/http/routes/projects.ts` · `src/http/routes/versions.ts` (label body, new `GET …/labels`)
- `src/spec/store.ts` (`by` on apply/undo; `partHistory` + new project history) · `src/spec/registry.ts` (requirement) · `src/spec/keys.ts` (only `REQ` in `KEY_RE`, Q1 answer) · `src/spec/stuck.ts` (skip) · `src/spec/types.ts` (HistoryEntry `by`)
- `src/http/routes/change-sets.ts` · `src/http/routes/parts.ts` · new `src/http/routes/history.ts`
- `src/sources/link.ts` (the test-only allow-list, SPEC-104 § Test-only seam) · `src/sources/service.ts` + `src/http/routes/sources.ts` (audit rows) · `src/interview/round.ts` (pass `by`; `messages.by` on user rows) · `src/quiz/store.ts` + `src/http/routes/quizzes.ts` (pass `by`; quiz events) · `src/http/routes/rounds.ts`
- new `src/audit/events.ts` (insert helper)
- `openapi.json` (from `bun run openapi:emit`, after the code)
- `test/**` — new tests, plus changes to existing tests **only** where SPEC-104 D2 removes a refusal (each change listed, see DoD 4)

**Not to touch:** `src/seam/**` (seam unchanged, AC-9) except reading; `src/gateway/**`.

## What to do

0. **Base first.** On the untouched tree, `bun install --frozen-lockfile`, then `DATABASE_URL=pglite:memory GATEWAY_URL=http://127.0.0.1:9 CAW_NOTIFY_URL= HOST= bun test` and `bunx tsc --noEmit`. Paste both summary lines. The expected test line is 218 pass / 16 skip / 0 fail (TASK-101). If `tsc` errors on the base, paste the count: that becomes the bar not to exceed.
1. Migration + schema per SPEC-104 § Data Model. Read the generated SQL back and paste it. It must equal the SPEC's SQL in effect.
2. Who middleware (`X-Blueprint-By`): required on every POST/PATCH/PUT/DELETE under `/v1/` except `…/locate` and `…/amendments`. Missing or bad → 400 `name_required`, nothing written. Put the decoded name on the Hono context, and pass it into every service call that writes.
3. `audit_events` rows for `project_create`, `settings`, `source_add`, `source_refetch` (old content kept — confirm in Notes that no code path deletes an old original from `SOURCES_DIR`, with a `grep -n`), `label`, `quiz_start`, `quiz_ask`, `quiz_mark`. Each is written in the same transaction as its change.
4. Labels: `POST …/versions` takes `{ label }`. `confirmedBy` = name. The D2 gates are gone. `last_change_set` may be null. `notifyConfirmed` still runs after commit. New `GET …/labels`.
5. Requirement kind + the stuck skip (SPEC-104 D6, D7). The interview must not be able to add or change one: test it through `runRound` with a stub gateway whose reply proposes a `requirement` add.
6. `GET …/history` (merge, newest first, `limit`), plus `by` on per-part history. Then `bun run openapi:emit` and paste `git diff --stat openapi.json`.
7. Seam check (AC-9): all `test/seam/**` tests pass with no assertion changed. `git diff test/seam` shows only the `notify.test.ts` trigger-shape lines allowed in Q3; every other seam test file has zero diff. Add one test: for a version row written before the migration columns are used (label null), `GET …/versions/{n}` and `GET …/versions?after=0` return exactly the same keys as before (no `label`, no `by`).

## Definition of Done (each with its command and real output, pasted)

1. Base lines from step 0.
2. `DATABASE_URL=pglite:memory GATEWAY_URL=http://127.0.0.1:9 CAW_NOTIFY_URL= HOST= bun test --timeout 30000` → 0 fail (`--timeout` added 13:0x, Q2). Paste the summary line.
3. `bunx tsc --noEmit` → no more errors than the base.
4. A table of every **existing** test you changed: file:line · old assertion · new · "REQ-103 D2" (or another SPEC-104 reason). An unlisted change = REWORK.
5. New tests, named in Notes, one per row:
   - 400 `name_required` on each write route group (projects, change-sets, undo, rounds, sources, quizzes, versions), with no row written;
   - locate and amendments still work without the header;
   - the AC-5 scenario through the HTTP app (name "โด่ง": add source, re-fetch a failed link with the old text kept in `before`, change model, change creativity, label) → `GET …/history` holds those 5 audit entries with `by: "โด่ง"`;
   - label refused for "" and "   " (400, no row);
   - label allowed with stuck items and no quiz;
   - two labels, then a part edit → still 2 rows in `GET …/labels` (AC-2);
   - requirement add / update / remove → 3 history entries with `by`, never in `GET …/stuck`;
   - the AI can't add a requirement;
   - `BLUEPRINT_LINK_TEST_ALLOW`: allowed only for a listed host:port, ignored without `pglite:`, and a redirect off the list refused;
   - the seam test from step 7.
6. `bun run openapi:emit` done and `git diff --stat` pasted. **Tell the SA in the TASK when this lands** — FE's `gen:api` waits on it.
7. `git status --short` pasted at the end: only files on the closed list. `env | grep -c BLUEPRINT_GATEWAY_LIVE` → 0. `ss -ltnp | grep -E ':(4200|4299|4298|4296)\b'` → empty.

## Implementation Notes

### Step 0 — base (Jason, 2026-10-29 12:53–13:02, untouched tree)
```
$ git branch --show-current; git log -1 --oneline; git status --short; env | grep -c BLUEPRINT_GATEWAY_LIVE
atom / f60b934 chore: add merge and release workflows / (status empty) / 0
$ bun install --frozen-lockfile        -> Checked 238 installs across 319 packages (no changes)
$ bunx tsc --noEmit                    -> no output, exit 0 (0 errors) — the bar is 0
$ DATABASE_URL=pglite:memory GATEWAY_URL=http://127.0.0.1:9 CAW_NOTIFY_URL= HOST= bun test     (12:53:39–12:58:54)
 214 pass / 16 skip / 4 fail / 1 error     Ran 234 tests across 34 files. [315.72s]
```
**The base is not 0 fail with the TASK's command.** The 4 failures (+ 1 "Unhandled error between tests", an ENOENT on a
temp dir that a timed-out test left behind) are tests that take 5.0–6.6 s each on this box and so hit bun's default
5 s per-test timeout:
`test/quiz/answer.test.ts` "AC-10: every gateway failure leaves a failed item…" · `test/interview/guard.test.ts` "R2: a source's stamp only…" ·
`test/interview/round.test.ts` "A-023 step 2: a quote counts only from 10 characters…" and "AC-10: every gateway failure ends bot_could_not_answer…".
Re-run of just those 3 files on the same untouched tree (load average ~3.7 from other sessions):
```
$ bun test test/quiz/answer.test.ts test/interview/guard.test.ts test/interview/round.test.ts    (12:59:16–13:00:44)
 27 pass / 5 fail / 1 error     [87.39s]     (the 5th: "R3: question/contradiction edits…" 5020 ms — a different test failed this time)
$ bun test --timeout 30000 <same 3 files>                                                          (13:00:44–13:02:11)
 32 pass / 0 fail     [87.60s]
```
So these failures are timing, not logic, and which test trips varies run to run. My TASK-101 run (218 / 16 / 0) used `--timeout 30000`.
**From here every full run uses `bun test --timeout 30000`** (same env prefix); the bar is 218 pass / 16 skip / 0 fail before my new tests. This is a change to DoD 2's command — SA: please accept or say otherwise.

### Steps 1–7 — what was built (Jason, 2026-10-29 12:55–13:40; every `bun` command prefixed `DATABASE_URL=pglite:memory`, `.env` never printed)

**Step 1 — migration** `src/db/migrations/0006_woozy_jocasta.sql` (from `DATABASE_URL=pglite:memory bun run db:generate`, read back):
```
CREATE TABLE "audit_events" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, "project_id" uuid NOT NULL, "at" timestamp with time zone DEFAULT now() NOT NULL,
  "by" text NOT NULL, "action" text NOT NULL, "entity" text NOT NULL, "before" jsonb, "after" jsonb);
ALTER TABLE "versions" ALTER COLUMN "last_change_set" DROP NOT NULL;
ALTER TABLE "change_sets" ADD COLUMN "by" text;      ALTER TABLE "messages" ADD COLUMN "by" text;      ALTER TABLE "versions" ADD COLUMN "label" text;
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ...;
CREATE INDEX "audit_events_project_at_idx" ON "audit_events" USING btree ("project_id","at");
```
= SPEC-104 § Data Model in effect (same 5 changes + table + index; only the statement order differs). No row trigger fires on DDL; `versions_immutable` untouched. Applied only on `pglite:memory` (by the tests). `db:migrate` / `db:create` never run; the remote DB was not touched.

**Step 2 — who.** New `src/http/actor.ts`: middleware `actor` registered in `src/app.ts` right after the body limit; required on POST/PATCH/PUT/DELETE under `/v1/` except `…/locate` and `…/amendments`; `parseName` = `decodeURIComponent` → trim → 1–100 chars, no NUL; failure throws `NameRequired` → `errors.ts` maps it to 400 `{ error: { code: "name_required", message: "type your name first" } }`; the handler never runs, so nothing is written. Every write route reads `byOf(c)` and passes it down (projects, change-sets, undo, rounds, sources, quizzes, versions).
**BE-decided (SA may veto, cheap to reverse):** the service functions take `by` as an optional trailing argument (`createProject`, `updateProject`, `applyChangeSet` opts, `undoChangeSet`, `addFile`, `addLink` after `deps`, `startQuiz`, `addItem`, `askQuestion`, `markItem` opts, `runRound` opts), and a direct caller that passes none writes no audit row (`by` null on the change set). The HTTP layer always passes it (`byOf` throws if the middleware did not run), so no HTTP write is unrecorded. Reason: seam tests and fixtures build specs by calling these services and must stay unchanged.

**Step 3 — audit.** `src/audit/events.ts` `recordAudit(q, …)`, always called with the same `tx` as the change: `project_create` (`createProject`, now a transaction), `settings` (`updateProject`: before/after `{model, creativity}`), `source_add` (`addRow`: after = the source with `text`), `source_refetch` (`retryLink`: before = the old row incl. `text`, `sha256`, `storedAs`, `status`, `reason`; after = the new one), `label` (`confirmVersion`), `quiz_start` (`startQuiz`), `quiz_ask` (`addItem`), `quiz_mark` (`markItem`, both the right and the wrong path). Spec changes keep `change_sets`/`changes` plus `change_sets.by`; a round's change set and its `user` chat row carry the sender (`messages.by`); a wrong quiz mark's change set carries the marker.
Old originals kept — evidence:
```
$ grep -rnE "unlink|rmSync|rmdir|\brm\(|fs\.rm" src      -> only the identifiers "unlinked_part" (spec/types.ts:95, spec/stuck.ts:7,64,69,71); no file deletion
$ grep -nE "writeFile|rename|mkdir|existsSync" src/sources/store.ts
3: import { existsSync } …   17: if (!existsSync(target)) {   18: await mkdir(…)   21: await writeFile(temp, bytes);   22: await rename(temp, target);
```
`saveOriginal` writes a new content-addressed file only when `target` does not exist (`store.ts:17`); the `rename` moves the temp file onto that new name. Nothing in `src/` removes a stored file, so the failed link's original stays on disk after a re-fetch.

**Step 4 — labels.** `confirmVersion(db, projectId, confirmedBy, label?)` (`projects/service.ts`): the D2 gates are gone (empty spec, unchanged since last label, stuck, quiz missing / not 100 / stale); `confirmedBy` = the typed name; `last_change_set` may be null (test: label on a project with no change set); the quiz is frozen as it stands (`freeze(latestQuiz)` or null); `notifyConfirmed` still runs after commit. Route `POST …/versions` (`routes/versions.ts`): body `{ label }` (zod: trim, 1–80), 201 `{ version, label }`, 409s removed, 404 kept. New `GET …/labels` → `{ labels: [{ version, label|null, labelledAt, by }] }` newest first (reads only those columns, never the snapshot). `label` is required on the route; the service lets it be omitted only so seam tests/fixtures that build versions keep working (that makes a row like an old one, label null).

**Step 5 — requirement.** `registry.ts`: `requirement: { prefix: "REQ", body: strict { text 1–4000 } }`; `checkLink` refuses any link from/to a requirement ("a requirement stands alone — no link may touch it"; needed because `covers`/`about`/`conflicts` have `to: "any"`); `stuck.ts` skips it in `unlinked_part`; `keys.ts:3` `REQ` added to `KEY_RE` (Q1, SA yes). The interview cannot add or change one: `round.ts` `MODEL_KINDS` (`:27`) is a whitelist and `requirement` is not in it — test `D6` drives `runRound` with a stub gateway whose reply proposes a `requirement` add → `changes_rejected`, spec still empty. Q1's load/update/remove test = `AC-4` in `spec-store.test.ts` (`GET /v1/projects/{id}` with REQ-001 in the spec, update, remove).

**Step 6 — history.** New `src/http/routes/history.ts` `GET /v1/projects/{id}/history?limit=` (1–500, default 200) → `{ entries: [{ at, by, kind, entity, op, before, after, changeSetId }] }`: `projectHistory` (`spec/store.ts`) reads `changes`⨝`change_sets` and `audit_events` newest-first, each with the limit, and merges them (audit first on an equal timestamp, each source keeps its own order). Per-part history entries gain `by`.
```
$ DATABASE_URL=pglite:memory bun run openapi:emit        -> wrote …/openapi.json   (13:15; re-emitted 13:3x after the last src change: byte-identical)
$ git diff --stat openapi.json
 openapi.json | 224 ++++++++++++++++++++++++++++++++++++++++++++++++++++++-----
 1 file changed, 205 insertions(+), 19 deletions(-)
```
**openapi.json emitted — FE's `gen:api` can start.**

**Step 7 — seam (AC-9).** Compared the six seam routes' documents (old `HEAD:openapi.json` vs new, `$ref`s inlined): `GET versions?after`, `POST locate`, `POST amendments` — **identical**; `GET /v1/projects/{id}`, `GET …/versions/{n}`, `GET …/parts/{key}/context` — **identical except `"requirement"` as one more value of the `kind` enum of `Part`** (listed as finding 1 below). `git diff --stat -- test/seam` → `test/seam/notify.test.ts | 20 +++++++++++---------` only (see DoD 4). The six other seam test files have zero diff. New test `AC-9` in `spec-store.test.ts`: for a version with label null and for a labelled one, `GET …/versions/{n}` has exactly `confirmedAt confirmedBy links parts quiz summary version` and `GET …/versions?after=0` exactly `changedSinceLatest latest versions` / entry `changes confirmedAt confirmedBy summary version` — no `label`, no `by`.

### DoD
**1. Base** — see Step 0 above (218 / 16 / 0 with `--timeout 30000` per Q2; `tsc` 0 errors).
**2.** `DATABASE_URL=pglite:memory GATEWAY_URL=http://127.0.0.1:9 CAW_NOTIFY_URL= HOST= bun test --timeout 30000` (13:34:07–13:40:04, `[357.27s]`):
```
 236 pass
 16 skip
 0 fail
 1182 expect() calls
Ran 252 tests across 35 files. [357.27s]      exit=0
```
= 218 base + 18 new (17 in `test/http/spec-store.test.ts` + 1 `requirement` row in `registry.test.ts`'s per-kind test). Same 16 skips.
**3.** `bunx tsc --noEmit` → exit 0, no output (0 errors; base 0).
**4. Existing tests I changed** (HEAD line numbers; none touched except as listed):
| file:line (HEAD) | old | new | reason |
|---|---|---|---|
| `test/helpers/by.ts` (new) | — | `BY = { "x-blueprint-by": … "โด่ง" }` | REQ-103 D4 helper |
| `test/http/api.test.ts:17` (helper) · `:152-153` · `:225` · `:233` | write requests carry no name | headers add `...BY` (helper also sends it on body-less writes) | REQ-103 D4 |
| `test/http/models.test.ts:29` · `quizzes.test.ts:17` · `rounds.test.ts:24` (helpers) · `size.test.ts:50` | same | same | REQ-103 D4 |
| `test/sources/http.test.ts:22,28,93,107,124` · `rework.test.ts:118,121,126` · `interview/guard.test.ts:139,142` | same | same | REQ-103 D4 |
| `test/http/api.test.ts:164-187` "AC-10/11" | `{confirmedBy:"operator"}`; expects 409 `confirm_blocked` while Q-001 open, 400 for blank, 201 `{version:1}` after a passing quiz, 409 `already_confirmed`; `confirmedBy` "operator" | `{label}`; 201 `{version:1,label}` while stuck, 400 for blank label, 201 `{version:2,label}` on the same spec; `confirmedBy` "โด่ง"; `/versions/3` is 404; unused `passingQuiz` import removed | REQ-103 D2 + D4 |
| `test/projects/service.test.ts:47` "AC-10" | `ConfirmBlocked` with `items`, no row | label allowed while stuck; row has label, `confirmedBy`, `quiz` null | REQ-103 D2 |
| `:58` "empty project" | `NothingToConfirm` | empty project labelled (trimmed; `lastChangeSet` null); unknown project still `NotFound`; blank label `ValidationError`, no row | REQ-103 D2 |
| `:66` "A-050" | `AlreadyConfirmed {version}`, `QuizNot100` after an edit | second label on same state → v2; fresh empty quiz no longer blocks; edit → v3; undo → v4; 4 rows | REQ-103 D2 |
| `:7` import | `AlreadyConfirmed, ConfirmBlocked, NotFound, NothingToConfirm, QuizNot100, ValidationError` | `NotFound, ValidationError` | unused after the rewrites |
| `test/quiz/confirm.test.ts:36` "AC-7" | `QuizMissing`; `QuizNot100 {right:4, marked:5}` | v1 with quiz null; v2 with frozen quiz `right 4, marked 5, score 80` | REQ-103 D2 |
| `:55` "AC-8" | `QuizStale` | label made; frozen quiz is the 5/5 one | REQ-103 D2 |
| `:83` "order" | `ConfirmBlocked` | label made while stuck | REQ-103 D2 |
| `:90` "AC-A5" · `:99` · `:110` | `ConfirmBlocked`; final `{version:1}` | first label allowed (v1); final `{version:2}`; title says so | REQ-103 D2 |
| `:9` import | `ConfirmBlocked, QuizMissing, QuizNot100, QuizStale` | removed | unused after the rewrites |
| `test/spec/registry.test.ts:16` | per-kind table without `requirement` | adds `requirement: { text }` | new kind (D6) |
| `:49-51` "link rules" | `decision covers` every kind → allowed | allowed for every kind except `requirement` (refused, "stands alone"); plus `requirement → step` refused | REQ-103 D7 |
| `test/seam/notify.test.ts:28` (helper), `:34,49,66,81,92,104` | no name header; bodies `{ confirmedBy: "operator" }` | helper sends `BY`; bodies `{ label: "operator" }` | REQ-103 D2/D4: request shape of the trigger only (SA Q3) |
| `test/seam/notify.test.ts:52,69` | trigger response `[201, { version: 2 }]` | `[201, { version: 2, label: "operator" }]` | REQ-103 D2/D4: the label route's own response (SA Q4). No push assertion (receiver body, status handling, timeout, log codes) changed. |
**5. New tests** — all in `test/http/spec-store.test.ts` (17), by row of the TASK:
name_required on each write group → "AC-6: a write with no name is 400 … every write route group" (projects, PATCH settings, change-sets, undo, rounds, sources link + multipart, quizzes, versions; then history/labels/sources/messages/quizzes/project unchanged) and "AC-6: a name that is empty, blank, undecodable, over 100 characters or holds a NUL is refused; 100 is fine" · locate/amendments without the header → "AC-9: the seam's locate and amendments still work with no name" · AC-5 → "AC-5: add source, re-fetch a failed link, change model, change creativity, label — five entries by โด่ง" (real local page on 127.0.0.1 through `BLUEPRINT_LINK_TEST_ALLOW`; failed row kept in `before`, new text in `after`) · plus "a spec change keeps its own home, with the name; undo carries the name of who undid it" · label "" and "   " → "AC-7: an empty or blank label is 400 validation and saves nothing" · label with stuck, no quiz → "AC-1 + D2: a label is allowed with stuck items, no quiz, and even on an empty project" · two labels then an edit → "AC-2: two labels, then a part edit — still exactly 2 rows" · requirement add/update/remove → "AC-4: a requirement is added, edited and removed by hand — 3 history entries with the name, never stuck" + "D7: no link may touch a requirement; a body outside the schema is refused" · AI can't add one → "D6: the interview cannot add a requirement" · plus "a round carries the name: the change set and the user's chat row, not the bot's" and "quiz: start, ask and mark leave quiz events with the name; a wrong mark's change set carries it too" · `BLUEPRINT_LINK_TEST_ALLOW` → three tests: "allowed only for a listed host:port", "ignored with a real database, and said so once", "a listed address is fetched; a redirect off the list is refused; unset = refused as before" · seam → "AC-9: for a version with no label, getVersion and versionsAfter return exactly the keys they did before".
**6.** `openapi:emit` done; stat above. **FE: `gen:api` can start (since 13:15; final byte-identical re-emit 13:3x).**
**7. End state** (13:40:14):
```
$ git status --short     -> 33 modified + 7 untracked, all on the closed list (+ the Q1 file src/spec/keys.ts; test/helpers/by.ts and test/http/spec-store.test.ts are new test files under test/**)
$ env | grep -c BLUEPRINT_GATEWAY_LIVE   -> 0
$ ss -ltnp | grep -E ":(4200|4299|4298|4296)\b"
LISTEN 127.0.0.1:4296 (pid 833685) · 4298 (pid 833906) · 4299 (pid 801181) · 4200 (pid 738998)
```
**`ss` is NOT empty, and none of those are mine.** I started no server on those ports in this TASK (my tests use `app.request` and ephemeral `port: 0`); the four listeners are another session's. Re-checked at 13:4x with `ps`: :4200 (pid 738998) and :4299 (pid 801181) are `bun run src/index.ts` servers I did not start; :4296/:4298 (pids 833685, 833906) had already exited — they were short-lived processes of someone else's run (probably `test:states`; inferred). I did not touch any of them (shared machine, G6), so DoD 7's "empty" cannot be shown while another desk member's servers run; SA: please say if you want me to re-check later. `ls data` → no such directory, so no test wrote `./data/sources`.

### Findings for the SA (listed, not fixed)
1. **The `Part.kind` enum in three seam responses gains `"requirement"`** (`GET /v1/projects/{id}`, `GET …/versions/{n}`, `GET …/parts/{key}/context`; everything else on the seam is identical). Once a person adds a requirement, it appears in those payloads. Whether CAW's client accepts an unknown kind is Team B's code (G9, not read) — **a seam question for the PM** before the owner adds a first requirement in a project CAW reads.
2. **The interview can still *remove* a requirement.** `round.ts:151` refuses a removal only when the user's own words are missing (`!userSaid`); it has no kind check, unlike add (`:143`) and update (`:148`). With a quote, a model change `part.remove` on `REQ-001` would apply. Read from the code, not run. D6 says "can't add or change"; if "remove" should be refused too, it is one line — not done (off scope).
3. **`POST /v1/nope` with no name now answers 400 `name_required`, not 404** — the middleware runs before routing. Inferred from `app.ts`, not tested.
4. **Services skip the audit row when no `by` is passed** (BE-decided above). Safe over HTTP; a future direct caller (a script) would write unrecorded changes.
5. **The default 5 s test timeout fails 4–5 slow tests on this box** (Step 0) — flaky on a loaded machine, not caused by this change.
6. **A change set and its audit rows share one timestamp** when written in one transaction (a wrong quiz mark: `quiz_mark` + the question's `part.add`); the history merge puts the audit row first. Order within that pair is by rule, not by clock.
7. `security-review` run on this tree: no findings at confidence ≥ 8 (it covered the header parsing, the new history route, the allow-list and the label route). Silent-failure pass done by hand: no empty `catch` added; `parseName`'s `catch` returns `null` → a 400, not a swallow.

## Questions

1. **`src/spec/keys.ts` is not on the file list but must change.** `keys.ts:3` is `KEY_RE = /^(WRK|STEP|INT|ROLE|SCR|API|SYS|DATA|DEC|Q|CON)-\d{3,}$/`, hard-coded.
   A `requirement` part gets key `REQ-001` (prefix from the registry, `nextKey` `keys.ts:28`), which fails `KEY_RE`: `partRow` (`spec/store.ts:56`) then says "no live part" for every
   update/remove of a requirement, and `compareKeys` → `split` (`keys.ts:10`) **throws** `not a part key` — which `loadSpec` (`spec/store.ts:83`) calls to sort parts, so one requirement would break `GET /v1/projects/{id}`.
   Proposed one-token change: add `REQ` to the alternation. I will not touch `keys.ts` until you say yes. Meanwhile I do everything else.
   > answer (Sober, SA A, 2026-10-29 13:0x): **Yes.** `src/spec/keys.ts` is added to the file list, for exactly that one change: `REQ` in the `KEY_RE` alternation at `:3`. Good catch: my SPEC missed that `KEY_RE` is hard-coded and not built from the registry. Add one test: a project with a requirement loads (`GET /v1/projects/{id}` 200, parts sorted) and `REQ-001` updates and removes. No other hard-coded prefix list exists in either repo (`grep -rn "WRK|STEP"` → only `keys.ts:3`).
2. **(Step 0) DoD 2's command gets `--timeout 30000`.**
   > answer (Sober, SA A, 2026-10-29 13:0x): **Accepted.** The bar is your base re-run with `bun test --timeout 30000` and the same env prefix: 218 pass / 16 skip / 0 fail before your new tests. This matches TASK-101. DoD 2 now reads `… bun test --timeout 30000`. Base evidence accepted as pasted.

3. **`test/seam/notify.test.ts` cannot stay unchanged** (Step 7 / AC-9 say `git diff --stat test/seam` must be empty). Its 5 tests (`AC-7`, `AC-6`, "a receiver answering 500",
   "env empty", "a URL that is not http(s)") start the push by calling `POST /v1/projects/{id}/versions` with `{ confirmedBy: "operator" }` (`notify.test.ts:34,49,66,81,92,104`).
   That route is not a seam route, but SPEC-104 changes it (body `{ label }`, name in `X-Blueprint-By`), so all 5 now get 400 `name_required` — a test of the **push**, failing for a reason that is not the push.
   Smallest change I see: the `call` helper at `notify.test.ts:25-30` sends `x-blueprint-by`, and the 6 bodies become `{ label: "operator" }`. No assertion about the push (receiver body, timeout, log line) changes.
   The other seam tests (`amend`, `context`, `feed`, `locate`) are unchanged and pass. I have **not** touched `test/seam/**`. May I make that change (and list it under DoD 4 as "REQ-103 D4")?
   > answer (Sober, SA A, 2026-10-29 13:1x): **Yes, exactly that and no more.**
   > - The `call` helper (`notify.test.ts:25-30`) sends `x-blueprint-by`, and the 6 bodies become `{ label: "operator" }`.
   > - No assertion about the push changes: receiver body, status handling, timeout, log codes.
   > - List it under DoD 4 as "REQ-103 D2/D4: request shape of the trigger only".
   > - Step 7's "unchanged" now reads: `git diff test/seam` shows **only** those helper and body lines (paste the diff), and `amend`/`context`/`feed`/`locate` stay at zero diff.
   > - My miss: I didn't grep the seam tests for the confirm route when I wrote step 7.

4. **Follow-up to Q3 — two more assertion lines in `test/seam/notify.test.ts`.** With your Q3 change applied, 3 of the 5 pass; `AC-7` (`:52`) and `AC-6` (`:69`) still fail on
   `expect([confirmed.status, confirmed.body]).toEqual([201, { version: 2 }])` — the **trigger route's own response** is now `{ version: 2, label: "operator" }` (SPEC-104 § Labels: 201 `{ version, label }`).
   It is the confirm's response, not the push (the receiver's body, log line and feed assertions are untouched). Change: `{ version: 2 }` → `{ version: 2, label: "operator" }` on those two lines. That is beyond "request shape only", so I am asking. Yes / no?
   > answer (Sober, SA A, 2026-10-29 13:3x): **Yes.** Those two lines assert the label route's own 201 body, which SPEC-104 § Labels changes on purpose; no push assertion moves. List them in DoD 4 with Q3's lines. Step 7's allowed `notify.test.ts` diff = the trigger's request and response shape, and nothing about the push. Right to ask.

## Review

### Verdict — DONE (Sober, SA A, 2026-10-29 13:4x)

Reviewed against SPEC-104 and the evidence, not the claim.

**Re-run by me (pglite only):**
- `DATABASE_URL=pglite:memory GATEWAY_URL=http://127.0.0.1:9 CAW_NOTIFY_URL= HOST= bun test --timeout 30000 test/http/spec-store.test.ts test/seam` → **45 pass / 0 fail**, 299 expect() calls, 6 files `[68.36s]`.
- `bunx tsc --noEmit` → exit 0.
- `git status --short`: 33 M + 7 ?? — every path is on the closed list (plus `keys.ts` per Q1).
- I read `src/http/actor.ts` in full: `SEAM_WRITES` exempts exactly `locate` and `amendments`, and the name is checked before any handler runs.

**Checked against the SPEC:**
- The migration matches § Data Model.
- D1–D7: all present.
- The label route has no gates, and labels are listed.
- History merges spec changes with `audit_events`.
- The re-fetch keeps the old row, and no code deletes an original (grep pasted).
- Seam shapes are identical except finding 1.
- Every existing-test change is listed with its reason, and the `notify.test.ts` changes stay within Q3/Q4.
- The full suite went from 218 to 236 pass, with the same 16 skips.

**Rulings on the BE decision and the findings:**
- **Optional `by` in services (BE-decided): accepted.** HTTP always passes it, and `byOf` throws if it's missing. Finding 4's risk (a future script writing unrecorded changes) is recorded here. If one is ever written, it must pass `by`.
- **Finding 1 (`"requirement"` joins `Part.kind` in 3 seam responses): raised to the PM** as REQ-103 Q5, because CAW's tolerance of a new enum value is Team B's code (G9). It doesn't block this TASK. QA should include one requirement in its AC-9 seam run.
- **Finding 2 (the interview can remove a requirement with the user's own quoted words): accepted as is.** Interpreted D6 ("the AI doesn't write requirements") as covering add and update by the model. A removal carries the person's own words, which is the same rule the old team set for every person-stated part (`round.ts:151`), so it counts as the person's act. Noted in SPEC-104 D6. Reversible: one line.
- **Finding 3 (POST to an unknown `/v1/` path with no name → 400, not 404): accepted.** It's harmless, and the front always sends the name.
- **Findings 5, 6 and 7: noted.** No action needed.
- **DoD 7 ports: accepted on the evidence.** `ps` shows the listeners are other sessions' `bun run src/index.ts` (likely Fern's step 7–8 back end), and Jason's tests use `app.request` and port 0.

The work stays in the tree. No git until the owner's own "ขึ้น git" for REQ-103, after QA.
