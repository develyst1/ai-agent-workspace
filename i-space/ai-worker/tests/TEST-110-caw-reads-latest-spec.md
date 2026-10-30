# TEST-110: CAW always reads the latest spec; a label is a tag — CAW side, on QA's Blueprint stand-in
- Source REQ: REQ-105 (Team B side: SPEC-107, TASK-114/115/116)
- Status: **TEST_PASSED** (2026-10-30 11:54, Tanya — after TASK-140; § Re-check after TASK-140) · joint run TEST_FAILED 11:40 (DEF-1 only) · IN_TEST 09:05 (CAW side on the stand-in)
- Asked by: the PM, 2026-10-30 (`inbox/QA.md`; REQ-105 Q5 answer 08:2x `[PM-decided]`: "QA runs the CAW-side ACs on the stand-in now … no gateway")
- Environment: local (this machine) · no gateway call · **no live Claude CLI** (QA's stub as `CLAUDE_BIN`) · no `.env` read
- Tested: 2026-10-30 by Tanya

## Build under test
- `caw-back` **a17ff11** + Team B's tree fp **`02d4d26377b6`** (44 paths) · `caw-front` **f071c02** + fp **`9fe6b0658829`** (24 paths). fp = sha256 of `git diff HEAD` + each untracked file (path + bytes), first 12. Run from a clean HEAD export + diff + untracked (no `.env` in either export); fingerprints unchanged at 09:05.
- Surfaces: API (`x-caw-actor` operator / worker) · the runner with QA's stub CLI · caw-front production build, desktop 1440 (Playwright).

## Instruments and their limits
- **Blueprint = QA's own stand-in** `tests/harness/test-110/bp-standin.mjs`, written from **SPEC-106 § "Seam contract v2"** — not Team B's test fake. Seeded with the worked seed **recorded** from a real blueprint-back (caw-back `test/fixtures/blueprint/project-200` + the v1 contexts). QA edits it through `/qa/*` (edit a part, add a label); its state is a file, so stop + start resumes (AC-5). It logs every call CAW makes.
  SA B also offered a runnable stand-in (`tests/harness/stand-in-blueprint-105.ts`, REQ-105 Q5 note 08:3x), which serves Team B's own test fake. **Not used, on purpose:** a check built on the builders' own fake can only agree with them. Mine differs in two ways that matter: it is written from SPEC-106, not from the fake, and its "down" **stops the process** (connection refused), as REQ-105 AC-5 says ("stopping blueprint-back"), where the SA's answers 500.
  **It proves CAW against QA's reading of the contract, not against Blueprint.** Two readers of SPEC-106 (Team B's fake and this) agreeing lowers the drift risk; only the joint run with TASK-113 removes it.
- **Worker = QA's stub CLI** `test-110/qa-claude.ts` (through the real runner): reads its card exactly as CAW's MCP `card_context` does (`x-caw-actor worker`, `x-caw-hop` this hop) and posts what it was given as a comment. Mode `pin` reads at start, waits for QA's go (QA edits the part meanwhile), reads again.
- `CAW_POLL_MS` **unset** (the shipped 10 s default, SPEC-107 D9) and **no push** configured: every "CAW noticed" below is the poll alone, the harder case.
- Driver `test-110/r110.ts`; output `r110.out`; evidence `test-110/out/` (screens, JSON, the stand-in's call log, API / runner logs).

## Cases (run 3 of `r110.ts`, 2026-10-30 ~08:50; runs 1–2 failed on QA's harness, see § QA-side)

| # | AC | Type | Actual | Result |
|---|---|---|---|---|
| 1 | AC-3 | happy | `/start?project=<a Blueprint project with no label>` → lands on `/p/<id>`; no "ลิงก์นี้ไม่ครบ"; header "ยังไม่มีป้าย" (`ac3-start-no-label.png`) | PASS |
| 2 | AC-3 | negative | `/start` with no project → "ลิงก์นี้ไม่ครบ ต้องมีโปรเจกต์" (Q3's new words), no "เวอร์ชัน" | PASS |
| 3 | AC-3 | API | `POST /v1/projects {blueprintProjectId}` (no version) → 201, `version 0`, `latestLabel null`, `spec {revision 1, reachable true}` | PASS |
| 4 | AC-4 | state | card A cut with no label → `anchorLabel null`, `anchor.version 0`; card page "ตัดงานก่อนมีป้าย" | PASS |
| 5 | AC-4 | state | label "v1" added in the stand-in (a label alone, no edit) → CAW shows it after **7.1 s**; card B cut then → `anchorLabel "v1"` | PASS |
| 6 | AC-4 | state | label "v2" → project shows v2 after **10.2 s**; card B still `anchorLabel "v1"`; board header "ป้าย v2"; card B page "ตัดงานที่ป้าย v1" (not v2); projects list chip "ป้าย v2", no "spec เวอร์ชัน" (`ac4-*.png`) | PASS |
| 7 | AC-4 | content | after v2 and an edit, card B's context = the latest text (#8–#10), not v1's | PASS |
| 8 | AC-1 *(stand-in only)* | happy | edit STEP-004's title, no label → card flagged (`specChangedVersion 2`) and the part reader shows the new text after **7.2 s** (≤ 30 s, poll only); board "spec เปลี่ยน"; the card **stays workable** (D7, Q2 answer) | PASS *(indicator — AC-1's verdict waits for TASK-113)* |
| 9 | AC-2 | state | hop 1 on card B (stub `pin`): start read = "QA-AC1 …" r2 `pinned=true` → QA edits STEP-004 to "QA-AC2 …" mid-hop (the operator already reads "QA-AC2") → hop 1's **second read still "QA-AC1 …" r2 pinned** → hop 2 reads **"QA-AC2 …" r3** (`ac2-worker-reads.txt`, the worker's own comments) | PASS |
| 10 | AC-2 (D5) | neighbour | after hop 1 ended: hop 1's **worker** with its hop id → still the pin (QA-AC1, `pinned true`); the **operator** with that hop id → latest (`pinned false`); hop 1's id on **another card** → latest | PASS |
| 11 | AC-5 | unhappy | stand-in stopped → `spec.reachable false` after **10.9 s**; card context 200 `fromCache true` with the last text; part reader 200; a hop started while down → the worker read the last text (`fromCache true`, 200); board and card page show "ติดต่อ Blueprint ไม่ได้ตอนนี้ — ทำงานต่อจาก spec ล่าสุดที่อ่านได้" (`ac5-*-down.png`) | PASS |
| 12 | AC-5 | recovery | stand-in down **60 s**, started again (same state) + an edit → CAW reachable, new text, card flagged **6.3 s** after the edit; **same API process** (no restart); the first pull after the outage asked `after=<CAW's last revision>`; the sentence is gone (`ac5-board-back.png`) | PASS |
| 13 | AC-6 | regression | `POST /v1/notify`: `version.confirmed` 202 · no `event` 400 · `spec.changed` 202 · unknown event 202 (SPEC-107 D8) | PASS |
| 14 | AC-6 (D1) | regression | the stand-in's call log: **0** v1 `versions` / `locate` / versioned-context calls from CAW | PASS |
| 15 | AC-6 | regression | `rebuild-check` after `spec.revised` / label events → `{"same": true}` | PASS |
| 16 | AC-6 | suites | caw-back `bun test` **863 pass / 1 skip / 1 fail** — the one = the known `withReadGuard` `execPath` "@" test (same fail in TEST-105: 749/1/1); CLI stub called 0 times · caw-front unit **340 / 0**, typecheck 0, build exit 0, e2e **270 passed, 1 failed** (O-1) | PASS (see O-1) |
| 17 | AC-1 | — | **NOT_TESTED** — needs the real Blueprint v2 (Team A's TASK-113) and both apps together | NOT_TESTED |
| 18 | joint run | — | **NOT_TESTED** — re-run #1–#16 against the real blueprint-back once TASK-113 is built; that settles contract drift (SPEC-107 Risks) | NOT_TESTED |

## Defects
None in Team B's change.

## Observations
- **O-1 — `caw-front tests/board.spec.ts:158` failed once in the full e2e run** ("the line leaves within 4 s of the team coming up": `[data-team-down]` still 1 after 4000 ms), and passed **3 of 3** run alone (4.7–4.8 s each). A 4 s timing bound under full-suite load. It is REQ-104's team-down line (TASK-111), not REQ-105's. Recorded, not filed (`caw-front-e2e.txt`, `caw-front-e2e-board158-rerun.txt`).
- **O-2 — the operator reads the latest live, not the last pull.** Mid-hop, the operator's card context showed the edit **0.01 s** after it was saved (SPEC-107 D4 reads Blueprint on each call); the board's flag waits for the poll (≤ 10 s). As designed; noted because the two can disagree for up to 10 s.

## QA-side (not the product)
- Run 1: my driver created the worker with `skills: []` (the API requires ≥ 1) and without the guard hooks the runner checks at start → no hop ran (`r110-run1-harness-bugs.out`, `out-run1/runner.err.log`: "guard hook missing"). Fixed as TEST-108 does (a `qa` skill + the workspace's `scripts/` linked into the run root).
- Run 2: my D5 check asked for hop 1's pin as the **operator**; D5 gives the operator the latest, so the check was wrong, not CAW. Re-run 3 asks as hop 1's worker and as the operator separately (#10).

## Test data created
| What | Where | End state |
|---|---|---|
| 3 CAW projects, 1 worker, 2–3 cards each, 3–4 hops per run | `pglite:file` in `/tmp/qa110-*` (runs 1–3) | deleted after this file was written |
| stand-in state files | `/tmp/qa110-*/bp-state.json` | deleted with the run folders |
| exports of both repos | session scratchpad `t110/` | left (scratch) |
| servers 4290 (stand-in), 4541 (API), 3541 (web), the runner, 3551/3552 (e2e) | this machine | stopped; `ss` clear at 09:05 |
| scripts, logs, screens | `tests/harness/test-110/` | left, as evidence |

## Verdict
**CAW side PASS on QA's stand-in: AC-2, AC-3, AC-4, AC-5, AC-6** (with AC-1's behaviour shown on the stand-in as an indicator). **AC-1 and the joint run: `NOT_TESTED`** until Team A's TASK-113. REQ-105 is not `TEST_PASSED` until then. No defect in Team B's change.

## Questions
(none)

## Joint run (real blueprint-back + caw HEADs) — ON HOLD (PM 2026-10-30: SA B's 2 XS fixes for a nameless old label → "ป้าย null", REQ-105 Q6)
- Harness ready: `test-110/joint/r110j.ts` + `qa-net.mjs` — real blueprint-back (TASK-113 tree) on pglite:memory, both real fronts, AC-3 through Blueprint's own "ส่งไปสร้างที่ CAW" button, AC-1 poll-only AND with the real `spec.changed` push, AC-5 by taking QA's proxy between CAW and Blueprint down 60 s (blueprint-back keeps its in-memory data; a process stop would lose it), the real v2 answers recorded to `joint/out/real-v2-*.json`.
- Run 1 (2026-10-30 ~10:3x, before the hold reached me) **does not count**: my seed change-set lacked `origin` (blueprint-back `src/spec/types.ts:59,76` requires it) → 400, no parts, so every AC needing parts failed on my harness (`joint/r110j-run1-seed-400.out`). What it did show on the real Blueprint, for the record only: Blueprint's button on a project with no label → `/start?project=…` → a CAW board "ยังไม่มีป้าย"; no v1 call from CAW. Fixed (origin added; the driver now stops at a failed seed). Rerun when the PM releases it.
- **Released 2026-10-30 (PM)** — joint run 3 (`joint/r110j.out`): **24 OK / 0 BAD** on blueprint-back 9578d51 + TASK-113 fp `bfa66c01b56c` · blueprint-front b041cbd · caw-back 58ab883 + TASK-138 fp `f80e56880896` · caw-front 7ef4a1e + TASK-139 fp `1c1cf758f4de`. Runs 1–2 failed on QA's harness (seed without `origin`; Q6 card without chain member + a check on script text) — fixed. Suites running; verdict to follow in this section.

### Joint run — results (run 3, 2026-10-30 ~11:2x; suites to 11:40) — evidence `tests/harness/test-110/joint/`

| # | AC | Actual (real blueprint-back + both real fronts + caw API + runner, QA stub worker) | Result |
|---|---|---|---|
| J1 | AC-3 | blueprint-front `/p/<no-label project>/ready` → "ส่งไปสร้างที่ CAW" href `…:3541/start?project=<id>` (no version) → a CAW board, "ยังไม่มีป้าย", no "ลิงก์นี้ไม่ครบ" (`ac3-from-blueprint-button.png`) · API 201, `spec.revision 1` | PASS |
| J2 | **AC-1** | an edit saved in Blueprint (change-set `part.update`, no label): **poll only** (push dropped by QA) → card flagged and the part reader shows the new title after **7.0 s**; **with Blueprint's real `spec.changed` push** → **0.3 s** (1 push relayed); board "spec เปลี่ยน" | PASS |
| J3 | AC-4 | Blueprint labels v1, v2 (its own route) → CAW 0.3 s each; card A "ตัดงานก่อนมีป้าย", card B keeps v1 "ตัดงานที่ป้าย v1", header "ป้าย v2", card B shows the latest title | PASS |
| J4 | AC-2 | hop 1 reads "(แก้ครั้งที่ 1)" r3 pinned, Blueprint edit mid-hop, hop 1 still reads r3; hop 2 reads "(แก้กลางก้าว)" r4 (`ac2-worker-reads.txt`) | PASS |
| J5 | AC-5 | QA's proxy between CAW and Blueprint down **60 s** (blueprint-back kept running — on `pglite:memory` a stop would lose the projects; to CAW it is the same refused connection): unreachable after 2.1 s, context `fromCache`, a hop still read the last text, the PM's sentence; an edit saved in Blueprint during the outage → back: CAW caught up 2.1 s after the proxy came up, first pull `after=4` (its last revision), same API process | PASS |
| J6 | Q6 | QA's proxy rewrote `latestLabel.label` → null (Blueprint can no longer make a nameless label; SPEC-106 allows `string \| null`): CAW 201 `latestLabel {version 2, label null}`; header, projects-list chip **"ป้าย 2"**, card "ตัดงานที่ป้าย 2"; **no "null" painted** (`q6-*.png`) | PASS |
| J7 | AC-6 / D1 | the proxy log: **0** v1 versions / locate / versioned-context calls from CAW; `rebuild-check` same; Blueprint's v1 `versions?after=0` still answers (2 labels) | PASS |
| J8 | AC-6 | blueprint-back `bun test --timeout 30000` **302 / 16 / 0** · caw-back **874 / 1 / 1** (known `execPath`) · caw-front unit 346/0, typecheck 0, e2e **274 passed** · blueprint-front unit 235/0, typecheck 0, isolation 4, states 34, required 948/0 · gateway calls **0** | PASS |
| J9 | AC-6 | **blueprint-front `check:api` FAILS** against TASK-113's `openapi.json` (DEF-1) | **FAIL** |
| — | recorded | the real v2 answers (`real-v2-spec.json`, `-context`, `-changes`, `-locate`) — for the contract-drift record SPEC-107 Risks asks for | — |

### DEF-1 (joint) — blueprint-front's own contract check goes red with TASK-113 — MINOR
- Build: blueprint-back 9578d51 + TASK-113 tree fp `bfa66c01b56c`; blueprint-front b041cbd (clean).
- Repro: in blueprint-front beside that blueprint-back, `bun run check:api`.
- Expected (AC-6 "both repos' tests pass"; every earlier round counted `check:api` as a front check): exit 0, "matches the OpenAPI document".
- Actual: exit 1 — "src/core/api/schema.d.ts differs from the OpenAPI document (run `bun run gen:api`)"; the diff is **additive only** (296 lines added, 0 removed): the 4 new v2 routes `/spec`, `/spec/changes`, `/spec/locate`, `/spec/parts/{key}/context`. No runtime effect seen (the front does not call them; its unit, typecheck and browser suites pass).
- Evidence: `joint/bp-front-check-api.txt`. (No fix proposed; the line in quotes is the tool's own message.)

### Verdict, joint run
**`TEST_FAILED`** — AC-6: blueprint-front's contract check fails after TASK-113 (DEF-1, MINOR, additive). **AC-1 … AC-5 PASS on the real Blueprint**, Q6 PASS, every other suite green. Not rounded up: the AC names the tests passing, and one gate does not.

## Re-check after TASK-140 (2026-10-30 11:4x–11:54) — DEF-1 · final
- Trees (fps re-taken 11:54; three unchanged since the joint run): **blueprint-back 9578d51 + fp `bfa66c01b56c`** (17 paths) · **blueprint-front b041cbd + fp `61317ffea9b1`** (1 path: `src/core/api/schema.d.ts`, +296 — the exact size of DEF-1's diff) · **caw-back 58ab883 + fp `f80e56880896`** (10 paths) · **caw-front 7ef4a1e + fp `1c1cf758f4de`** (8 paths).
- blueprint-front, clean HEAD export + its diff, beside the tested blueprint-back export: `check:api` **"matches the OpenAPI document"** · typecheck 0 · unit **235 / 0** · build exit 0 · isolation **4** · states **34** · required **1** (948 items, 0 failures) (`joint/bp-front-recheck.txt`). Gateway: only the refusing stub (32 requests from the suites' own back ends, all refused locally).
- Nothing else changed, so the joint run's J1–J8 stand on the same three trees. **DEF-1 fixed.** R-22, R-23 added to `REGRESSION.md`.

### Verdict, final
**`TEST_PASSED`** — REQ-105 AC-1 … AC-6 and Q6 met on the real Blueprint (joint run 3, 24/24) and every suite of the four repos green on the trees above (caw-back's one known `execPath` fail is not REQ-105's, as in TEST-105). For git, the tested trees are exactly the four fingerprints listed here.
