# TASK-101: blueprint-back — run it, map its folders, record the seam from Blueprint's side
- Source: SPEC-101 (REQ-101, Team A)
- Owner: BE (Jason)
- Status: DONE (2026-10-29, Sober — see § Review)
- Depends on: none
- Repo: `blueprint-back` (path: `machine.local.md`), branch `atom` @ f60b934. **No code change. No git write.**

## What to do

A study, not a build. Run the repo on this machine, read it, and write what you saw into
`## Implementation Notes` below — the SA turns it into the map. **Read SPEC-101 § Guardrails G1–G10
first; they are part of this TASK.** In one line: nothing tracked changes, no live gateway call, no
script that writes a tracked file or a real DB, failures are recorded, not fixed.

1. **Before.** In the repo: `git branch --show-current; git log -1 --oneline; git status --short`;
   `env | grep -c BLUEPRINT_GATEWAY_LIVE`.
2. **Install:** `bun install --frozen-lockfile`. Paste the last lines.
3. **Test:** `bun test 2>&1 | tail -40`. Paste the runner's summary line (pass / fail / skip / files) and
   every failing test's name with its error. Note the skipped live smoke test by name.
4. **Start:** `DATABASE_URL=pglite:memory GATEWAY_URL=http://127.0.0.1:9 PORT=4200 bun run dev` in the
   background; then `curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:4200/health` (and the
   OpenAPI/doc route if the app serves one — find it in `src/app.ts`). Stop it. Paste the start output and
   the curl results. If `/health` is not the route, say what is, with `file:line`.
5. **Folder map:** for every top-level entry under `src/` (`app.ts`, `index.ts`, `db`, `gateway`, `http`,
   `interview`, `projects`, `quiz`, `scripts`, `seam`, `sources`, `spec`) one line: what it is for + one
   `file:line` that shows it. Also one line per table in `src/db/schema.ts`. And `test/` top-level folders,
   one line each.
6. **Outbound calls:** every place the back end calls something outside itself (`grep -rn 'fetch(' src`,
   plus spawn/exec if any): what, where (`file:line`), which env var controls it, default. Confirm with
   `grep -rniE 'claude|spawn|exec' src` whether anything starts Claude CLI — paste the output.
7. **Read-API seam (AC-5):** for each of the six calls + the push in SPEC-101 § API / Interface Design,
   fill the per-call record listed there. Map the SPEC's names to routes by path; if a starting point the
   SA gave is wrong, say so with the right `file:line`. Also list every route in `src/http/routes/*.ts`
   in one table (method, path, file:line) so the SA can see which are seam and which are front-only.
8. **Findings:** anything that looks wrong or unexplained (failing test, dead code, TODO/FIXME —
   `grep -rnE 'TODO|FIXME|XXX|HACK' src`, a comment that contradicts its code, a risk). One line each,
   with evidence. **List, don't fix.**
9. **After:** `git status --short` (must be empty) and
   `ss -ltnp | grep -E ':(4200|4298|4296)\b'` (must be empty).

## Definition of Done

- [x] DoD 1 — before/after state pasted: branch `atom`, HEAD `f60b934`, `git status --short` empty both
      times (base checked by the SA 2026-10-29: empty), `env | grep -c BLUEPRINT_GATEWAY_LIVE` → `0`.
- [x] DoD 2 (done early 2026-10-29 00:42, Jason; evidence in Implementation Notes) — `bun install --frozen-lockfile` output pasted; `node_modules/` exists afterwards
      (`ls -d node_modules`). **Tick this as soon as it is done and write one line to `inbox/SA.md`** —
      TASK-102's Playwright step waits for it.
- [x] DoD 3 — folder map: every name from step 5 has a line with a `file:line` (SA checks with
      `ls src` against your list).
- [x] DoD 4 — test and start output pasted exactly as printed (steps 3–4), with the time you ran them.
- [x] DoD 5 — seam table complete for all seven rows of SPEC-101 (per-call record), plus the all-routes table.
- [x] DoD 6 — outbound-calls list and the claude/spawn grep output pasted.
- [x] DoD 7 — findings list (may be empty — then say "none found" and which greps you ran).
- [x] DoD 8 — `ss` check empty at the end (step 9).

## Implementation Notes

(The engineer fills this in: what you ran, real output, `file:line` evidence. Anything not run is
`UNVERIFIED — <what would settle it>`.)

### Steps 1–2 (Jason, 2026-10-29 00:42, repo `blueprint-back`)

Before (step 1):
```
$ git branch --show-current; git log -1 --oneline; git status --short; env | grep -c BLUEPRINT_GATEWAY_LIVE
atom
f60b934 chore: add merge and release workflows
(status empty)
0
```
Install (step 2, `bun install --frozen-lockfile`, tail):
```
+ zod@4.6.5
227 packages installed [1048.00ms]
$ ls -d node_modules
node_modules
$ git status --short
(empty)
```
### Step 3 — test (Jason, started 2026-10-29 00:48:54, ended 00:54:16)

A first `bun test | tail -40` started 00:43:05 printed nothing for 5+ minutes; I stopped it (my own
process) and re-ran with the output in a file and `--timeout 30000`. Observation: the suite is slow
(322 s), not hung; it prints progress per file while running.
```
$ bun test --timeout 30000      (bun test v1.4.2)
 218 pass
 16 skip
 0 fail
 1056 expect() calls
Ran 234 tests across 34 files. [322.25s]
exit=0
```
Failing tests: none. Skips — two groups, found by `grep -rnE 'skip|todo\(' test`:
- `test/gateway/live.smoke.test.ts:5` `describe.skipIf(process.env.BLUEPRINT_GATEWAY_LIVE !== "1")` — the live smoke test (env count is 0).
- `test/sit/rules.sit.test.ts:33` `describe.skipIf(process.env.BLUEPRINT_SIT !== "1")` "SIT Postgres rules" — not in the SA's G-list; skipped because `BLUEPRINT_SIT` is unset. inferred — it presumably needs a real Postgres; reading its setup would settle it.
- How the 16 split between the two groups: inferred — a verbose run (another 5 min) would settle it.
Console noise seen, not failures: "Warning: Indexing all PDF objects" (`test/sources/http.test.ts`, `test/interview/round.test.ts`).
After the run: `git status --short` empty; `ss -ltnp | grep -E ':(4200|4298|4296)\b'` empty.

### Step 4 — start (Jason, 2026-10-29 00:54:43)
```
$ DATABASE_URL=pglite:memory GATEWAY_URL=http://127.0.0.1:9 PORT=4200 bun run dev     (background)
$ bun run src/index.ts                       <- the whole start output; no "listening" line is printed
GET /health            -> 200  {"ok":true,"service":"blueprint-back"}      (src/app.ts:24)
GET /v1/openapi.json   -> 200  {"openapi":"3.1.0","info":{"title":"Blueprint API","version":"1.0.0"},...}  (src/app.ts:44-50)
GET /nope              -> 404  {"error":{"code":"not_found","message":"no route GET /nope"}}
ss: LISTEN 127.0.0.1:4200 bun.exe  (127.0.0.1 = default HOST, src/index.ts:14)
```
Stopped with `kill <pid>` of the process I started; `ss -ltnp | grep -E ':(4200|4298|4296)\b'` → empty
afterwards. (A `pkill` by name was blocked by the workspace hook and never ran; no other process was touched.)
Other sessions' processes were running on this machine during my test run (a `bun run dev`, caw-front
e2e); I did not touch them.

### Step 5 — folder map (all `file:line` from `grep -n` / `nl -ba`, 2026-10-29)

`src/` top level (`ls src`: `app.ts db gateway http index.ts interview projects quiz scripts seam sources spec` — all 12 of the SA's names present, nothing extra):
- `app.ts` — builds the Hono/zod-openapi app, body limits, mounts every route group, `/health`, `/v1/openapi.json` — `src/app.ts:20` `createApp`.
- `index.ts` — process entry: reads `DATABASE_URL` (exits 1 if empty), serves on `HOST`/`PORT` — `src/index.ts:14`.
- `db/` — database access: `client.ts:15` `createDb` (`pglite:memory` = in-memory PGlite with all migrations applied, anything else = postgres-js); `schema.ts` (tables below); `migrations/` = `0000_eminent_proteus.sql` … `0005_spotty_cardiac.sql` + `meta/`.
- `gateway/` — the only client of the LLM gateway: `client.ts:70` `createGateway` (`POST /chat` at `:98`, `GET /models` at `:110`); base URL `client.ts:73`.
- `http/` — HTTP layer: `errors.ts:65` `onError` (one error body, domain error → status); `routes/*.ts` one file per resource (all routes in step 7).
- `interview/` — the AI interview: `round.ts:254` `runRound` (one round: context → gateway → validated change set); `context.ts:121` `buildRequest` (prompt/context assembly); `protocol.ts:33` `parseReply` (model reply parsing).
- `projects/` — project + version lifecycle: `service.ts:89` `confirmVersion` (the confirm gate: stuck check, quiz check, freeze, then notify), `:125` `getVersion`, `:70` `getProject`, `:145` `updateProject`.
- `quiz/` — the understanding quiz that gates confirm: `store.ts:116` `startQuiz`, `:168` `markItem`, `:212` `freeze`; `answer.ts:44` `answerQuestion` (asks the gateway, answers only from the spec).
- `scripts/` — three CLI scripts (all forbidden by G3, not run): `emit-openapi.ts:1` (writes `openapi.json`), `create-db.ts:1` (creates DB `blueprint`), `migrate.ts:1` (applies migrations to `DATABASE_URL`).
- `seam/` — the read/notify API for CAW: `context.ts:19` `partContext`, `feed.ts:50` `versionFeed`, `locate.ts:65` `locate`, `amend.ts:30` `addAmendment`, `notify.ts:7` `notifyConfirmed`.
- `sources/` — the interview's source material: `service.ts:98` `addFile`, `:112` `addLink`; `link.ts:163` the guarded link fetch (SSRF guard, ≤3 redirects, 10 s); `extract.ts:94` text extraction (pdf/docx/xlsx); `store.ts:13` `saveOriginal` (writes under `SOURCES_DIR`).
- `spec/` — the spec model: `store.ts:97` `applyChangeSet`, `:72` `loadSpec`, `:250` `undoChangeSet`; `registry.ts:5` part kinds, `:92` link kinds; `types.ts:31` `Part`, `:41` `Link`; `stuck.ts:61` `computeStuck`; `diagrams.ts:57/68/80` sequence/swimlane/flowchart; `keys.ts:3` key format; `errors.ts:5` domain errors.

Tables in `src/db/schema.ts` (11):
`organisations` :9 (a tenant row; projects default to `DEFAULT_ORGANISATION_ID`) · `projects` :15 (name, theme, model, creativity) · `parts` :29 (live spec parts, PK project+key, soft-delete `removedAt`) · `links` :39 (typed edges between parts) · `change_sets` :55 (one row per edit, cause, `undoes`) · `changes` :64 (per-entity before/after inside a change set) · `versions` :75 (confirmed versions: frozen `snapshot`, `summary`, `lastChangeSet`, frozen `quiz`) · `sources` :88 (uploaded files/links the bot reads, unique per project+sha256) · `messages` :106 (the chat, `role` incl. `caw`) · `quizzes` :119 (a quiz run) · `quiz_items` :126 (its questions, answers, marks).

`test/` (`ls test`): `app.test.ts` (file, app-level) · `db/` schema/rules/theme tests · `fixtures/` sample spec (`meeting-room.ts`), `gateway/`, `sources/` data · `gateway/` client tests + `live.smoke.test.ts` (skipped, see step 3) · `helpers/` shared test setup (`db.ts`, `quiz.ts`) · `http/` API-level tests · `interview/` round/context/retry/guard tests · `projects/` service test · `quiz/` quiz tests · `seam/` amend/context/feed/locate/notify tests · `sit/` Postgres SIT (skipped, step 3) · `sources/` http/link/rework tests · `spec/` store/registry/keys/stuck/diagrams tests.

### Step 6 — outbound calls
`grep -rn 'fetch(' src`:
```
src/sources/link.ts:18:  fetch: (url, init) => fetch(url, init),
src/sources/link.ts:163:      res = await deps.fetch(url.toString(), { redirect: "manual", signal: AbortSignal.timeout(TIMEOUT_MS) });
src/gateway/client.ts:74:  const doFetch: GatewayFetch = options.fetch ?? ((url, init) => fetch(url, init));
src/seam/notify.ts:18:    const res = await fetch(url, {
```
| What | Where | Env var | Default |
|---|---|---|---|
| LLM gateway `POST /chat`, `GET /models` (timeout 90 s, one retry on chat) | `gateway/client.ts:79-95` (called `:98`, `:110`) | `GATEWAY_URL` (`client.ts:73`) | `https://ai.develyst.online` |
| Fetch a user-supplied link as a source (SSRF-guarded, DNS lookup `link.ts:17`) | `sources/link.ts:163` | none | only when a link source is added |
| Tell CAW a version was confirmed (`POST`, 2 s, one attempt) | `seam/notify.ts:18`, called `projects/service.ts:121` | `CAW_NOTIFY_URL` (`notify.ts:8`) | empty ⇒ never any call |

Other env reads (`grep -rnE 'process\.env|Bun\.env' src`): `DATABASE_URL` (`index.ts:5`, `scripts/*`), `HOST`/`PORT` (`index.ts:14`), `SOURCES_DIR` (`app.ts:37`, default `./data/sources`).
`grep -rniE 'claude|spawn|exec' src --include=*.ts` (migrations excluded) printed only three regex `.exec(` calls: `sources/link.ts:45`, `interview/protocol.ts:35`, `quiz/answer.ts:34`. No `spawn`, no child process, no mention of Claude CLI ⇒ **blueprint-back starts no Claude CLI** (AC-8 spirit confirmed). The word "claude" does not occur in `src/` at all.

### Step 7 — read-API seam, Blueprint side
Common to all seven: auth **none** (`grep -rniE 'authori|bearer|api[-_]?key|cors|token' src` → only `MAX_TOKENS` at `gateway/client.ts:32`; `index.ts:13` says "v1 has no login"; the only guard is `HOST` defaulting to 127.0.0.1, `index.ts:14`). Errors come from `http/errors.ts:65` `onError`, body `{"error":{"code","message","details?"}}` (`errors.ts:13`); a bad request is 400 `validation`; non-UUID or unknown project is 404 `not_found` with message `project not found` (`projects/service.ts:28`, `seam/feed.ts:14`); a 5 MB body cap gives 413 `too_large` (`app.ts:26`); anything unmapped is 500 `internal` (`errors.ts:98`). Casing is camelCase everywhere in the wire shapes below. `Part` = `{key, kind, title, body:{…}, origin:{stamp, date "YYYY-MM-DD", channel?, note?, sourceId?}, createdIn}` (`spec/types.ts:31`); `Link` = `{id, kind, fromKey, toKey, position:int|null, label:string|null, origin}` (`types.ts:41`).

1. **getProject** — `GET /v1/projects/{projectId}` · route `http/routes/projects.ts:51` (createRoute `:49`) · handler `projects/service.ts:70` → `loadSpec` `spec/store.ts:72` · params `projectId: string` (UUID checked in the service) · 200 `{project:{id, organisationId, name, createdAt, theme, model, creativity:number}, parts:Part[], links:Link[]}` (`projects.ts:54`) · 404 · **reads the LIVE draft spec, not a confirmed version** · SA's start confirmed.
2. **getVersion** — `GET /v1/projects/{projectId}/versions/{version}` · `routes/versions.ts:35` · `projects/service.ts:125` · params `projectId: string`, `version: z.coerce.number().int().min(1)` · 200 `{version, confirmedAt, confirmedBy, parts, links, summary:{parts, links, partsByKind:{kind:int}}, quiz: FrozenQuiz|null}` (`versions.ts:42-60`; FrozenQuiz = `{id, createdAt, items:[{position, question, status "answered"|"failed", answer|null, notInSpec, parts:string[], mark "right"|"wrong"|null, note|null}], right, marked, score|null}`) · 404 (`project not found` / `version N not found`, `service.ts:133`), 400 (version <1 or not a number) · reads the frozen row only (`service.ts:134`) · SA's start confirmed.
3. **versionsAfter** — `GET /v1/projects/{projectId}/versions?after=N` · `routes/versions.ts:74` (**not `:11`** — see finding 3) · `seam/feed.ts:50` `versionFeed` · query `after: z.coerce.number().int().min(0).default(0)` (`versions.ts:75`) · 200 `{versions:[{version, confirmedAt, confirmedBy, summary, changes:{added:string[], changed:string[], removed:string[]}}], latest:{version, confirmedAt}|null, changedSinceLatest:boolean}` (`versions.ts:81-92`) · 400, 404 · reads only; `changes` computed on every read from snapshots (`feed.ts:24`).
4. **partContext** — `GET /v1/projects/{projectId}/versions/{version}/parts/{key}/context` · `routes/seam.ts:45` · `seam/context.ts:19` · params `projectId`, `version` (coerce int ≥1), `key: string` · 200 `PartContext` `{projectId, version, confirmedAt, part:Part, neighbours:[{direction "out"|"in", linkKind, label|null, position|null, part:{key, kind, title}}], decisions:Part[], flows:[{work:{key,title}, steps:[{key,title,position|null}], at:string[]}], questions:Part[]}` (`seam.ts:15-31`) · 404 (project, version, or `part KEY in version N`, `context.ts:23`), 400 · reads a frozen snapshot, never the draft.
5. **locate** — `POST /v1/projects/{projectId}/locate` · `routes/seam.ts:55` · `seam/locate.ts:65` · body `{request: string, min 1, max 1000}` (`seam.ts:58`) · 200 `{version, notInSpec:boolean, candidates:[{key, kind, title, score:number, matched:string[], where:("title"|"body"|"link label")[]}]}` (`seam.ts:33-40`); threshold 0.5 `locate.ts:11`, ≤10 candidates `:12` · 400, 404, **409 `no_confirmed_version`** (`seam.ts:63,70`) · reads only; deterministic Thai word match, **no gateway call** (`locate.ts:1`).
6. **amend** — `POST /v1/projects/{projectId}/amendments` · `routes/seam.ts:77` · `seam/amend.ts:30` `addAmendment` · body `{from: string 1..100, request: string 1..4000, about?: string[] ≤20}` (`amend.ts:15-19`; NUL characters refused) · 201 the new chat message `{id, role:"caw", content, model:"caw", creativity:0, roundStatus:null, changeSetId:null, createdAt}` (`amend.ts:22,51`; route declares `MessageSchema` from `routes/rounds.ts`, whose fields I did not read — UNVERIFIED that they match) · 400 (incl. `about: not a live part of this project: …`, `amend.ts:42`), 404 · **writes one `messages` row** (`amend.ts:48`), spec untouched; content is `[CAW <from>] about: <keys>\n<request>` (`amend.ts:28`).
7. **(push)** — outbound `POST` to `CAW_NOTIFY_URL` · `seam/notify.ts:18`, called after commit from `projects/service.ts:121` · body `{event:"version.confirmed", projectId, version, confirmedAt}` (`notify.ts:21`, `service.ts:118`) · header `content-type: application/json`, no auth · 1 attempt, 2 s (`notify.ts:3`), no retry; failure only logged `[notify] failed reason=…` (`:25`,`:28`) · empty/non-http(s) URL ⇒ no call (`:9`,`:12`). Never blocks or fails the confirm, but the confirm response waits for it (`service.ts:121`, awaited).

SA's starting points: 1, 2, 4, 5, 6, 7 confirmed; **3 corrected** (`versions.ts:11` is `POST …/versions` = confirm; the feed is `:74`).

All routes (`grep -n -B1 'path:' src/http/routes/*.ts` for method; `app.ts` for the two root ones). "Seam" = one of the SPEC-101 calls; for the rest I only say "not a seam call per SPEC-101" — whether the front uses it is not checked here (front is TASK-102).
| Method | Path | file:line | |
|---|---|---|---|
| GET | `/health` | `app.ts:24` | not seam |
| GET | `/v1/openapi.json` | `app.ts:44` | not seam |
| GET | `/v1/models` | `routes/models.ts:8` | not seam (gateway model list) |
| POST | `/v1/projects` | `routes/projects.ts:29` | not seam |
| GET | `/v1/projects` | `routes/projects.ts:45` | not seam |
| GET | `/v1/projects/{projectId}` | `routes/projects.ts:51` | **seam: getProject** |
| PATCH | `/v1/projects/{projectId}` | `routes/projects.ts:61` | not seam (model/creativity) |
| POST | `/v1/projects/{projectId}/rounds` | `routes/rounds.ts:37` | not seam (interview round) |
| GET | `/v1/projects/{projectId}/messages` | `routes/rounds.ts:72` | not seam |
| POST | `/v1/projects/{projectId}/change-sets` | `routes/change-sets.ts:14` | not seam |
| POST | `/v1/projects/{projectId}/change-sets/{changeSetId}/undo` | `routes/change-sets.ts:33` | not seam |
| GET | `/v1/projects/{projectId}/change-sets/{changeSetId}` | `routes/change-sets.ts:48` | not seam |
| GET | `/v1/projects/{projectId}/parts/{key}/history` | `routes/parts.ts:11` | not seam |
| GET | `/v1/projects/{projectId}/stuck` | `routes/stuck.ts:14` | not seam |
| GET | `/v1/projects/{projectId}/diagrams/{kind}/{key}` | `routes/diagrams.ts:36` | not seam |
| POST | `/v1/projects/{projectId}/sources` | `routes/sources.ts:30` | not seam (20 MB upload) |
| GET | `/v1/projects/{projectId}/sources` | `routes/sources.ts:75` | not seam |
| GET | `/v1/projects/{projectId}/sources/{sourceId}` | `routes/sources.ts:82` | not seam |
| POST | `/v1/projects/{projectId}/quizzes` | `routes/quizzes.ts:41` | not seam |
| GET | `/v1/projects/{projectId}/quizzes/latest` | `routes/quizzes.ts:48` | not seam |
| POST | `/v1/projects/{projectId}/quizzes/{quizId}/questions` | `routes/quizzes.ts:55` | not seam |
| POST | `/v1/projects/{projectId}/quizzes/{quizId}/items/{itemId}/mark` | `routes/quizzes.ts:71` | not seam |
| POST | `/v1/projects/{projectId}/versions` | `routes/versions.ts:11` | not seam (confirm; triggers the push) |
| GET | `/v1/projects/{projectId}/versions/{version}` | `routes/versions.ts:35` | **seam: getVersion** |
| GET | `/v1/projects/{projectId}/versions` | `routes/versions.ts:74` | **seam: versionsAfter** |
| GET | `/v1/projects/{projectId}/versions/{version}/parts/{key}/context` | `routes/seam.ts:45` | **seam: partContext** |
| POST | `/v1/projects/{projectId}/locate` | `routes/seam.ts:55` | **seam: locate** |
| POST | `/v1/projects/{projectId}/amendments` | `routes/seam.ts:77` | **seam: amend** |

Cross-check with the tracked `openapi.json` (read only, `python3` listing of `paths` × methods): it has 23 paths / 27 operations (`python3`: `len(paths)`, sum of methods) = the 26 `/v1` routes above + `/v1/openapi.json` itself; path and method sets agree with the route files (compared by eye against the table, not by script). `/health` is not in the document (`app.ts:24` is a plain `app.get`). Field-level comparison of each seam response against `openapi.json`: not done — UNVERIFIED; running `openapi:emit` to diff would write the tracked file (G3).

### Step 8 — findings (list, not fixed)
1. `bun test` takes 322 s here (`[322.25s]`, step 3). A plain `bun test | tail -40` prints nothing until it ends, so it looks hung; the first attempt was stopped at ~5 min and re-run. QA re-running AC-3 should expect ~6 min.
2. A second skipped group exists beyond the live smoke test: `test/sit/rules.sit.test.ts:33` (`BLUEPRINT_SIT=1`). The 16 skips are split between the two groups in an unknown way — UNVERIFIED (a verbose run would show it). Not run: needs a real Postgres (inferred).
3. SPEC-101's starting point for versionsAfter (`versions.ts:11`) is the confirm `POST`, not the feed (`versions.ts:74`). Evidence: `versions.ts:10-11` `method: "post"`.
4. **No authentication and no CORS handling anywhere** in `src/` (grep above); `index.ts:13` states it is deliberate for v1. Protection is only `HOST` defaulting to `127.0.0.1` (`index.ts:14`): if anyone sets `HOST=0.0.0.0` on a server, every endpoint incl. `POST …/amendments` and `POST …/versions` is open. `amend.ts` `from` is free text, so a sender cannot be verified.
5. `getProject` (seam call 1) returns the **live draft**, while the other read calls return confirmed snapshots (`service.ts:72` vs `:134`). Fine if CAW only uses it for the project row; a caller that reads `parts` from it gets unconfirmed content. Whether CAW does is Team B's side — not looked at (G9).
6. The confirm response waits for the push (`projects/service.ts:121` is awaited, timeout 2 s, `notify.ts:3`): a dead `CAW_NOTIFY_URL` adds up to 2 s to every confirm. Inferred from the code; not measured.
7. `locate` is a deterministic Thai word match with a 0.5 threshold (`locate.ts:11`); the quality of its answers was not assessed (tests print sample scores, e.g. `test/seam/locate.test.ts` output in step 3).
8. `src/index.ts` prints nothing when the server is up (step 4) — no "listening" line, so a launcher cannot tell started from still-starting except by polling `/health`.
9. Uploaded originals go to `SOURCES_DIR` (default `./data/sources`, `app.ts:37`); `.gitignore` ends with `/data/`. After the test run `ls -d data` → no such directory, so the tests did not write there (they presumably use a temp dir — inferred).
10. Test output noise, not failures: `Warning: Indexing all PDF objects` (step 3).
No `TODO|FIXME|XXX|HACK` in `src/`: `grep -rnE 'TODO|FIXME|XXX|HACK' src | grep -v migrations` → empty. No comment contradicting its code was noticed in the files I read (`app.ts`, `index.ts`, `seam/*`, `routes/seam.ts`, `routes/versions.ts`, `routes/projects.ts`, `http/errors.ts`, `db/*`, `gateway/client.ts:60-123`, `sources/link.ts:1-30,150-175`); the rest of `src/` I listed (exports) but did not read in full.

### Step 9 — after (2026-10-29 00:59:19)
```
$ git status --short            -> (empty)
$ ss -ltnp | grep -E ':(4200|4298|4296)\b'   -> (empty)
$ git log -1 --oneline; git branch --show-current   -> f60b934 chore: add merge and release workflows / atom
```
Not run, by G3/G4: `openapi:emit`, `db:generate`, `db:create`, `db:migrate`; `BLUEPRINT_GATEWAY_LIVE` never set (`env | grep -c` → 0 at 00:42:43). `ls -d node_modules` exists; `git status --short --ignored` shows only `!! node_modules/`. No caw-back / caw-front file was opened (G9).

## Questions

## Review

**2026-10-29 · Sober (SA, A) · verdict: DONE.**

Checked against SPEC-101 and the evidence. These I re-read myself with `nl -ba`:
- `routes/versions.ts:10-11` is `post` (confirm) and `:73-75` is the `get` feed with `after`. **Finding 3 is right.** My SPEC row said "`:11` or `:74` — to confirm"; it is now settled as `:74`.
- `routes/seam.ts:63,70`: 409 `no_confirmed_version`, mapped in the route.
- `projects/service.ts:120-121`: `await notifyConfirmed(…)` after the commit (finding 6 holds as read; the 2 s delay is inferred and not measured, as you labelled it).
- `src/index.ts:13`: "v1 has no login (SPEC-A-001 § Non-functional)" (finding 4).
- The 16 skips: a static count does not settle the split (live smoke file: 1 `test(`; `test/sit/rules.sit.test.ts`: 13–19 depending on the pattern). Your UNVERIFIED label is correct, and the map keeps it.

Per DoD:
- DoD 1, 8 (state, ports): met. You stopped by pid, didn't touch other sessions' processes, and the `pkill` attempt was blocked and is reported. Good.
- DoD 2, 4 (install, tests, start): met. The runner line is pasted, and the 322 s slowness is explained rather than hidden.
- DoD 3 (folders and tables): met. All 12 `src/` names, 11 tables, and `test/` folders.
- DoD 5 (seam): met. All 7 rows have method/path, route, handler, auth, exact-casing shapes and errors. `amend`'s `MessageSchema` is marked UNVERIFIED, and the `openapi.json` field-level comparison is UNVERIFIED with the reason (G3). Both labels are correct.
- DoD 6 (outbound calls and the claude/spawn grep): met. blueprint-back starts no Claude CLI.
- DoD 7 (findings): met. You also said which files you read in full and which you didn't.
- G1–G10: no breach found.
