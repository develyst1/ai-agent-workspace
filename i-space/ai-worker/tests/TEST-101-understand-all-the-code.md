# TEST-101: Understand all the code (Blueprint + CAW)
- Teams: A (Blueprint, SA Sober) · B (CAW, SA Silver) · TASKs: TASK-101, TASK-102 (A) · TASK-103, TASK-104 (B) · maps under test: `maps/blueprint.md` (COMPLETE 01:02), `maps/caw.md` (complete 01:00)
- Source REQ: REQ-101 (ACs tested: AC-1 … AC-11)
- Status: **TEST_PASSED** (2026-10-29 01:20, Tanya). Some named items are NOT_TESTED: see § Verdict.
- Build under test: the four repos on branch `atom` at the REQ-101 AC-11 HEADs: `blueprint-back` f60b934 · `blueprint-front` e46322a · `caw-back` 102a130 · `caw-front` 4b58bf3
- Surfaces: local (this machine) · desktop web (Playwright) for AC-6/AC-7 · shell for the rest
- Designed: 2026-10-29 by Tanya · Tested: 2026-10-29 00:58–01:20 by Tanya (Bun 1.4.2, local Google Chrome, this machine)

## Scope

The deliverable here is **the SAs' maps, not product code**. So this round checks that each map
**matches what really runs on this machine**. It does not check whether the map is well written.
Every case compares a claim in a map with something I run or list myself.

- In scope: both maps (Blueprint, CAW), the seam descriptions on both sides, the four repos' git state.
- Not in scope: whether the product is *right*. Failing product tests are findings for the map's
  AC-10 list, not TEST-101 defects. A TEST-101 defect is a **map claim that does not match the
  run**, or a repo left changed.
- Each team is judged only on its own map. The seam (AC-5) is judged as a pair.

## Instrument limits

- **Shell runs (install / test / start).** These prove the commands and the counts on this
  machine only. They prove nothing about the deploy server.
- **Next dev server + Playwright with mocked backends (AC-6/AC-7).** This proves that screens
  render and that a page is reachable. It does **not** prove backend behaviour. Mocked API answers
  are layout evidence only.
- **Code reading (AC-8 citations, AC-9, AC-10).** AC-8 and AC-9 ask for code citations, so
  reading is the check there. Reading is enough to say "the cited line says X". It is **not**
  enough to say "it behaves like X". Wherever the claim is about behaviour, I add a run.
- **`claude` stub on PATH.** For every caw-back run I put a stub `claude` first on PATH. The stub
  logs its arguments to `tests/harness/` and exits non-zero. A real Claude CLI therefore cannot
  start from my runs, and any attempt to launch it is recorded as evidence.
  **Correction at run time:** PATH alone is not enough. The runner's default is the absolute path
  `~/.local/bin/claude` (`caw-back → src/runner/config.ts:40`), so I also set
  `CLAUDE_BIN=<stub>` and unset `CAW_WORKSPACE_ROOT` for every caw-back run. Stub file:
  `tests/harness/bin/claude`. Call log: `tests/harness/test-101/claude-stub.log`, **0 bytes at
  the end**.
- **LLM-gateway stub** (added for the PM's 2026-10-29 constraint). `tests/harness/test-101-gateway-stub.mjs`
  logs every request.
  - **`refuse` mode** (:4396, every request → 503) was used for blueprint-back's `bun test` and the
    `test:required` back end. Log: 0 calls.
  - **`fake` mode** (:4397) gives the same canned answer that blueprint-front's own
    `tests/states.spec.ts` stand-in gives. It was used only for the seam run, so a quiz could be
    answered without a real model. Log: 10 × `POST /chat` (2 quizzes × 5 questions), all
    answered by the local stub. The real `https://ai.develyst.online` was never addressed.
  - Limit: an interview round answered by a fake model proves nothing about the real model's
    output. Those steps are NOT_TESTED.
- **Seam end-to-end run** (`tests/harness/test-101-seam-e2e.mjs`). All four apps ran together on
  spare ports with in-memory databases: blueprint-back :4210 · caw-back :4510 (no runner) ·
  blueprint-front :3110 · caw-front :3520 (http mode). This goes **beyond** what AC-5 asks,
  which is comparing descriptions. I added it because the seam is where two one-sided
  descriptions can both be right and still not fit together. It proves the calls connect,
  locally. It proves nothing about production.

## Baseline (taken 2026-10-29 00:39, read-only, before the teams start)

`git rev-parse --abbrev-ref HEAD`, `git log -1`, `git status --porcelain [--ignored]`:

| Repo | Branch | HEAD | Tracked changes | Ignored files | `node_modules` |
|---|---|---|---|---|---|
| blueprint-back | atom | f60b934 | none | 0 | absent |
| blueprint-front | atom | e46322a | none | 0 | absent |
| caw-back | atom | 102a130 | none | 0 | absent |
| caw-front | atom | 4b58bf3 | none | 0 | absent |

Top-level `src/` folders (`find src -mindepth 1 -maxdepth 1 -type d`). This is the oracle for AC-1/AC-2:

- blueprint-back: `db gateway http interview projects quiz scripts seam sources spec` (10)
- blueprint-front: `app core dev features themes` (5)
- caw-back: `blueprint cards chain chat core db follow hops http mcp projects proposals runner scripts seam workers` (16)
- caw-front: `api app components lib theme` (5)

Toolchain: `bun` 1.4.2 on PATH.

Note: **caw-back also has a `src/seam/`**. `SYSTEM-FACTS.md` describes the seam as
`caw-back/src/blueprint/client.ts` only. AC-5 / AC-9 must say what `caw-back/src/seam/` is.

## Cases

Risk ranking: **AC-8 (live run) and AC-11 (code left as found)** have the highest impact.
AC-8 can spend the owner's quota, and AC-11 means product code changed. **AC-5 (seam)** is the
most likely to be wrong, because two teams describe one contract from opposite sides. AC-3 is
likely to drift, since test counts move and env vars go missing.

| # | Case (from AC) | Type | Surface | Steps / command | Expected | Actual | Evidence | Result |
|---|---|---|---|---|---|---|---|---|
| 1 | AC-11 before my own runs | regression | shell | per repo: branch, `git log -1`, `git status --porcelain` (00:58) | `atom`, baseline HEAD, no tracked change | all four `atom` at f60b934 / e46322a / 102a130 / 4b58bf3; tracked changes 0; ignored only `node_modules/` + the teams' build output | QA's shell output at 00:58 (same shape as § Baseline) | PASS |
| 2 | AC-1: Blueprint folders | happy | shell | 10 back + 5 front top-level `src/` folders vs map §1 | 15/15 named and cited | 15/15 named, each with a one-line purpose and a citation | maps/blueprint.md §1 | PASS |
| 3 | AC-1: citations real | negative | shell | `sed -n` on 16 Blueprint citations (index.ts:13,14 · gateway/client.ts:73 · locate.ts:11 · routes/seam.ts:45 · versions.ts:75 · projects/service.ts:121 · notify.ts:3 · app.ts:24 · ready/load.ts:138,145 · ready/words.ts:25 · api/client.ts:7 · isolation/guard.ts:5 · check-required.ts:180 · ready/actions.ts:55) | each line says what the map claims | 16/16 match | session output | PASS |
| 4 | AC-2: CAW folders | happy | shell | 16 back + 5 front folders vs maps/caw.md § Folders | 21/21, `mcp` and `runner` covered | 21/21, `mcp` and `runner` described at length | maps/caw.md § Folders | PASS |
| 5 | AC-2: citations real | negative | shell | `sed -n` on 30 CAW citations (app.ts:25,40 · index.ts:19,23 · client.ts:28 · hop.ts:139-156,97-101,269 · config.ts:30,40 · main.ts:339,359 · mcp/server.ts:175 · projects/service.ts:23 · seam/service.ts:38 · errors.ts:6 · settings.ts:29 · hop.test.ts:48,429 · testkit.ts:15 · e2e/run.ts:3 · auto.ts:12 · caw-front start/page.tsx:23 · blueprint.ts:5 · test-reset/route.ts:11 · words.ts:102,255,257 · layout.tsx:35 · README.md:5) | each says what the map claims | 30/30 match | session output | PASS |
| 6 | AC-3: install | happy | shell | `bun install --frozen-lockfile` × 4 | exit 0, no tracked change | warm: "Checked … (no changes)" in all four (map gives the warm/cold wording); no tracked change from install | tests/harness/test-101/*-test.txt, blueprint-front-static.txt | PASS |
| 7 | AC-3: tests and counts | happy | shell | caw-back `bun test` (stub) · caw-front `bun test src`, typecheck, build, `test:e2e` · blueprint-back `bun test --timeout 30000` (gateway stub) · blueprint-front typecheck, check:no-fetch, check:api, `bun test src`, build, test:isolation, test:states, test:required (back end :4299) | the map's numbers | caw-back **677 pass / 1 skip / 1 fail**, 679 tests across 60 files [91.18s] (map: 1–2 fails expected) · caw-front 328/0, tsc clean, build exit 0, **257 passed (2.6m)** · blueprint-back **218 pass / 16 skip / 0 fail** [343.55s] · blueprint-front tsc clean, 98 theme files 0 problems, schema matches, **186/0**, build exit 0, isolation **4 passed**, states **34 passed**, required **1 passed** (896 items) | tests/harness/test-101/caw-back-test.txt, caw-front-unit.txt, caw-front-build-e2e.txt, blueprint-back-test.txt, blueprint-front-static.txt, blueprint-front-e2e.txt, blueprint-front-required.txt | PASS |
| 8 | AC-3: start | happy | shell | caw-back `api`, `dev` (no root), `mcp` · caw-front `dev:mock` · blueprint-back `dev` (stub gateway) · blueprint-front `next start` with the back end down | as the map says | caw-back: "caw-back API on http://127.0.0.1:4500", /health `{"ok":true}`, openapi 200; runner refuses "CAW_WORKSPACE_ROOT is not set", API stays up; mcp "CAW_WORKER_ID is required", exit 1 · caw-front dev:mock Ready, / 200 · blueprint-back silent apart from bun's own line, /health `{"ok":true,"service":"blueprint-back"}`, /nope 404 not_found · blueprint-front with the back end down shows "Blueprint ต่อระบบไม่ได้ตอนนี้" + "ลองใหม่" | tests/harness/test-101/caw-back-start.txt; session output | PASS |
| 9 | AC-4: unhappy steps recorded | negative | shell | every failure I hit vs the map's run sections | each in the map | settings.test.ts:162 failed exactly as recorded (execPath with "@") · db-scripts Case C **passed** in my run, which fits "flaky" and does not refute it · test:required with no back end → `ConnectionRefused` as recorded · test:states left blueprint-back on :4298 as recorded (an orphan whose parent had exited; its GATEWAY_URL was the :4296 stand-in, not the real gateway); I stopped it by pid · 16 skips split **1** (live.smoke) + **15** (sit), which settles the map's UNVERIFIED | tests/harness/test-101/blueprint-back-test.txt, blueprint-front-e2e.txt | PASS |
| 10 | AC-4: nothing invented | negative | read | env values in both maps vs `.env.example` / code | none invented | every env the maps give exists in code or `.env.example`; recipes use `pglite:memory` and dead ports, no invented keys | maps §2 / § Run | PASS |
| 11 | AC-5: every call on both sides | happy | read | 6 calls side by side: maps/blueprint.md §4 vs maps/caw.md § read-API seam | each call in both with I/O | 6/6 in both, with inputs and outputs. Blueprint also describes call 7, the push `POST CAW_NOTIFY_URL`; CAW's seam section does not (finding S-F2) | maps | PASS |
| 12 | AC-5: disagreements listed | negative | read + code | compare field by field; check that each team cited only its own repo | mismatches listed, not resolved by a team | neither team crossed into the other's repo. Five findings from my comparison: S-F1…S-F5 in § Observations. None is a broken call. | § Observations | PASS |
| 13 | AC-5: calls the list does not name | boundary | shell | CAW `client.ts` exports, BP `src/seam/*`, CAW `src/seam/`, CAW `/v1/notify` | all in the maps or listed | CAW `src/seam/` = CAW's own proxy routes for locate/amend (maps/caw.md § Folders). CAW's `/v1/notify` receiver appears in CAW's route list only (S-F2). Field limits agree on both sides: locate ≤1000, amend ≤4000, about ≤20; CAW's `from` is 77 chars ≤ BP's 100 | code | PASS |
| 14 | AC-5: front link, run end to end | happy | Playwright | seed a confirmed BP version (fake gateway), click "ส่งไปสร้างที่ CAW" on blueprint-front's ready screen | lands on CAW's board for that project | href `http://127.0.0.1:3520/start?project=<bp>&version=1` · click → CAW board showing "TEST-101 seam" · a second click → the same CAW project (409 already_exists followed) | tests/harness/test-101/seam/seam.json, S1-ready.png, S1-caw-board.png | PASS |
| 14b | AC-5: read API, run end to end | happy | shell | through CAW's own routes against a real local blueprint-back: create (getProject + getVersion), parts/{key} (partContext), locate, amendments, then confirm v2 on BP | each call works and errors map as described | create 200 (latestSeenVersion 1) · partContext 200 pass-through; unknown key → CAW 404 `part_not_found` · locate 200, 10 candidates · amend 201 and the text lands in BP's chat; unknown `about` → CAW 400 `amendment_refused` with BP's message · BP v2 confirm → push → CAW latestSeenVersion **2**, and BP logged no `[notify] failed` · back-links `/p/<bp>/web?part=API-001` and `/p/<bp>/chat` → 200 on blueprint-front | tests/harness/test-101/seam/seam.json, seam/caw-project-after-v2.json | PASS |
| 15 | AC-6: Blueprint main flow | happy | Playwright | home → create by dialog → open card → overview → chat → spec pages (two-level nav) → ready → build link → PDF control | each step matches map §3 | all reached by clicks. /p/<id> → 307 to overview · dialog created "TEST-101 dialog" (shown on home) · chat composer present · flowchart, stuck, work-order, sequence, screens, api, web, history, ready all reached · build link on for confirmed v2 · "ส่งออก PDF" present. My first script run reported 5 BAD; they were script errors: the nav has two levels ("สิ่งที่เราเข้าใจ" / "เบื้องหลังเทคนิค") and my submit check was too strict. Re-run: tests/harness/test-101/bp-walk/bp-nav2.mjs | tests/harness/test-101/bp-walk/*.png, walk.json | PASS |
| 16 | AC-6: not-reachable marks | negative | Playwright | `/dev/isolation` without the flag; links to `/export/print` or `/dev` on overview, ready, chat | as map §3 | /dev/isolation → 404 · no print or dev link on any of the three | tests/harness/test-101/bp-walk/walk.json | PASS |
| 17 | AC-7: CAW main flow by clicks | happy | Playwright (dev:mock, :3530) | /start known v3 → board → card → ทีม → การรัน → แชต → โปรเจกต์ (home) | matches the map's table | every step landed as mapped. Card "ดู spec" href = `http://127.0.0.1:3100/p/<bp>/web?part=Q-001`. My first run timed out on "แชต": the tab carries a count badge ("แชต 1") and my exact-text locator was wrong. Re-run by link role: OK. Nit: the map says "five columns (12 cards)"; the columns hold 11, and the 12th (card …011) is the open-question panel above them (S-F6) | tests/harness/test-101/caw-walk/*.png, walk.json | PASS |
| 18 | AC-7: not reachable / negative /start | negative | Playwright | no `/start` link on board, team, runs, chat, home · /start with no query, version=abc, version=99 · POST /test-reset without the flag | as the map's /start table | no `/start` link anywhere · "ลิงก์นี้ไม่ครบ ต้องมีโปรเจกต์และเวอร์ชัน" × 2 · "เวอร์ชันนี้ยังไม่ได้ยืนยันใน Blueprint" · /test-reset 404 | tests/harness/test-101/caw-walk/walk.json, N1–N3.png | PASS |
| 19 | AC-8: launch site cited | happy | read | hop.ts:269, 139-156, 97-101 · config.ts:30,40 · main.ts:339,359 | as the map says | all match, including the argument list and the env allow-list | code | PASS |
| 20 | AC-8: test double is real | happy | shell | full caw-back `bun test` with the stub on PATH and as CLAUDE_BIN | stub never called | claude-stub.log **0 bytes** after the test run, after the start cases and after the seam run | tests/harness/test-101/claude-stub.log | PASS |
| 21 | AC-8: no live run | negative | read | TASK-103/104 evidence, SPEC-102 G1, today's log | none | TASK-103 lists `CAW_WORKSPACE_ROOT` and `CLAUDE_BIN` as unset, with no runner and no e2e script run; TASK-104 says "no live Claude CLI". My own runs: stub at 0. | tasks/TASK-103 §Implementation Notes, TASK-104 :53 | PASS |
| 22 | AC-9: Atlas's lines | happy | read + shell | per line, re-counted myself | verdict + evidence, my re-check agrees | CAW: src 9253 / test 5183 · front 13401 / 2567 · atom~1 = origin/main (cc7839a, 60f9745) · diff = 2 workflow files. Blueprint: src 4113 / test 4356 · front 17830 / 938 · seam 299 · HEAD~1 = nichaphon (8d73609, a766cc0) · ports :4200/:3100/:4500/:3500 seen in #8 and the seam run. All agree with both maps | session output | PASS |
| 23 | AC-9: SYSTEM-FACTS untouched by the SAs | negative | read | `SYSTEM-FACTS.md` now (119 lines) vs at desk open (104) | only the PM / Atom wrote | the 15 new lines are in "Open questions for the owner", marked Atom (owner-delegated). No SA line. Limit: the file is not in git here, so this is judged from the attribution on the text | SYSTEM-FACTS.md :100-119 | PASS |
| 24 | AC-10: risk lists | happy | read | maps/blueprint.md §6, maps/caw.md § Open questions | one list per product, evidence + severity as the SA's | Blueprint: 15 items, severity "SA's guess" · CAW: 10 items, header "severity is the SA's guess" | maps | PASS |
| 25 | AC-10: listed, not fixed | negative | shell | cross-check with #26 | nothing fixed | no tracked change from any team in any repo | #26 | PASS |
| 26 | AC-11 after everything | regression | shell | as #1 + `--ignored` (01:17) | `atom`, baseline HEAD, no tracked change | all four `atom` at baseline HEAD. **caw-front had 1 tracked change, and it was mine**: `tsconfig.json` +2 lines, written by Next.js because I chose `NEXT_DIST_DIR=.next-t`. I removed the 2 lines with the editor; `git hash-object tsconfig.json` = `HEAD:tsconfig.json` = aa88246; `git status` empty. No git command used. FAILURES F-003. The teams left no tracked change. | session output; FAILURES.md F-003 | PASS (teams) — QA footprint declared |

Deliberately not tested:
- Production / deploy-server behaviour (`PROTOCOL.md` § Environments).
- Any live Claude CLI run (owner's word only).
- Whether the map is easy to read (no AC asks for it).

## Defects

None. Every map claim I checked matched the run. No AC failed.

## Observations (not ours)

Seam findings from laying the two maps side by side, and from the end-to-end run (AC-5). They
are for the PM to carry. **None of them is a call that fails.** Each one names which side's text
it concerns.

- **S-F1 — CAW map overstates the actor rule.** maps/caw.md § Run says *"every call needs the
  actor header"*. The code exempts `/v1/notify` and `/v1/projects/{id}/rebuild-check`
  (`caw-back → src/http/actor.ts:17` `NO_ACTOR`). This matters at the seam: Blueprint's push
  sends no actor and is accepted. Seen: the BP v2 confirm moved CAW to version 2 (#14b).
- **S-F2 — CAW's seam section leaves out the push receiver.** Blueprint describes call 7
  (`POST ${CAW_NOTIFY_URL}`, body `{event, projectId, version, confirmedAt}`, 2 s, no retry).
  CAW names `POST /v1/notify` only in its route list (`follow.ts:9`), not in § read-API seam.
  The two do fit: the CAW route schema has the same four fields (`follow.ts:10-11`), and the run
  worked.
- **S-F3 — some legitimate Blueprint answers become "unreachable" in CAW.** BP `locate` can
  answer **409 `no_confirmed_version`** (maps/blueprint.md §4 row 5). BP `locate` / `amend` answer
  **404** for an unknown project. CAW turns any non-200 (locate) or non-201/400 (amend) into
  `BlueprintUnreachable`, which is a 502 `blueprint_unreachable` to its caller
  (`caw-back → src/blueprint/client.ts:73,81`). So "Blueprint said no" reads as "Blueprint is
  down". It is likely rare: a CAW project exists only for a confirmed version, so the 409 should
  not occur. **Not run** — producing it needs a BP project deleted or reset under a live CAW project.
- **S-F4 — Team A's "getProject returns the live draft" risk does not apply to CAW today.**
  CAW reads only `project.name` from getProject (`client.ts:62-65`). Every spec read goes through
  getVersion / partContext, which are frozen snapshots. Answers maps/blueprint.md §6 item 11 from CAW's side.
- **S-F5 — field names agree.** CAW reads Blueprint answers with casts, not validation (CAW risk
  5). I checked each field CAW reads against Blueprint's schema: `project.name`, `version`,
  `confirmedAt`, and the `VersionFeed` fields. All exist with the same names. CAW types
  `summary` as `unknown`, which is compatible with BP's object. The risk is real for the future
  but not broken today.
- **S-F6 — CAW map nit (AC-7 row 2).** "Five columns (12 cards)": the columns hold 11, and the
  12th card is the open-question panel above them (tests/harness/test-101/caw-walk/1-board.png).
- **O-1 — blueprint-front home has hidden sample links to a project that does not exist.** The
  new-project dialog's theme previews link to `/p/d01a63a7-…/sequence?step=…` from
  `src/core/model/samples.ts` (HTTP 404 if followed). They are not visible to a user (#15 1b), so
  this is information only.
- **O-2 — a trap for whoever runs caw-front next.** Any new `NEXT_DIST_DIR` name makes Next.js
  rewrite the tracked `tsconfig.json`. The map's `.next-f` is safe because it is already
  listed. Worth one line in maps/caw.md § Run (it bit QA: F-003).

## Test data created

| What (id / marker) | Where | End state (removed / left + why) |
|---|---|---|
| `.next-t/` (caw-front build + dev output) | `caw-front`, git-ignored | left: ignored, allowed by AC-11. Its side effect on `tsconfig.json` was **removed** (#26, F-003) |
| `.next/`, `test-results/`, `registry.generated.ts` (rebuilt by my build/e2e) | `blueprint-front`, git-ignored, already there from the team | left, overwritten in place |
| `test-results/` | `caw-front`, git-ignored | left |
| in-memory DBs: BP projects "TEST-101 seam" (dd3ed5cb-…, versions 1–2, 1 amendment message), "TEST-101 dialog"; CAW project 4aed7f5d-… | `pglite:memory` processes on :4210 / :4510 | **gone**: the processes were stopped, the memory went with them |
| servers I started on :4500, :3530, :4299, :4396, :4397, :4210, :4510, :3110, :3520 | this machine | all stopped by their own pid; `ss` on every port → 0 listeners (01:16) |
| orphan blueprint-back on :4298 (left by `test:states`, a known team finding) | this machine | stopped by its pid 480569 |
| `claude` stub, gateway stub, walk/seam scripts, outputs, screenshots | `tests/harness/` | left, as evidence |

## Verdict

**`TEST_PASSED`.** All 11 ACs pass on this machine. Both maps match what really runs: folders,
citations, install/test/start, counts, unhappy paths, both main flows by clicks, the Claude CLI
launch and its test doubles, and Atlas's lines. The seam was also run end to end (#14, #14b): every
call connects and fails the way both sides say. No team left a tracked change. No live Claude CLI
call and no real gateway call happened in my runs.

NOT_TESTED, named:
- Blueprint interview send, accept, answer, park and retry (map §3 4b–4c), and quiz answers from a
  real model. Reason: these need a live gateway call (owner's word). Only the fake stub answered.
- CAW hops and workers doing real work (the runner). Reason: this needs a live Claude CLI run
  (owner's word), per the Q1 answer.
- PDF export: the control is present, but the export was not run (it starts a local Chrome print job).
- CAW's amendment reply link (maps/caw.md front link 3): it never appeared, because operator
  amendments do not show it in CAW's chat. Its target `/p/<bp>/chat` answers 200.
- S-F3's 409/404 → 502 path: not produced (see Observations).

Accuracy items for the PM to route (none blocks): S-F1, S-F2, S-F6, O-2.

## Evidence (decisive)

- `tests/harness/test-101/seam/seam.json` + `S1-caw-board.png` — the Blueprint button lands on a real CAW board
  built from a real Blueprint version, and the 6 read calls plus the push work end to end (AC-5).
- `tests/harness/test-101/claude-stub.log` (0 bytes) and `tests/harness/test-101/gateway-stub.log` (0 calls) — no live Claude CLI and no
  real gateway in any run (AC-8 and the PM's constraint).
- `tests/harness/test-101/caw-back-test.txt`, `tests/harness/test-101/blueprint-back-test.txt` — 677/1/1 and 218/16/0, matching the maps (AC-3).

## Questions

(For the PM. None blocks the design.)

- **Q1 — Interpretation, recorded instead of asked.** When I start caw-back (#8) and walk CAW
  (#17), a `claude` stub that refuses to run is first on PATH. If a step can only work with a
  real worker, I record it as `NOT_TESTED — needs a live run (owner's word)` and do not ask for
  that run myself. Interpreted from `PROTOCOL.md` § Hard boundaries ("Live Claude CLI runs only
  on the owner's word"). Correct me if a live run is wanted.
  > answer: your reading holds — no live run is wanted for REQ-101 (its Constraints and AC-8 forbid one). Record such steps `NOT_TESTED — needs a live run (owner's word)`; I report them to the owner with the result. — Porter (PM) 2026-10-29 `[PM-decided]`
