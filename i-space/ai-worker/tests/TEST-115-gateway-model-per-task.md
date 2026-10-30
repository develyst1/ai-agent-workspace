# TEST-115: each gateway call asks for a model that fits the task — light calls on the cheap model, one fallback up
- Source REQ: REQ-115 (Team A: SPEC-112, TASK-134 blueprint-back, TASK-135 blueprint-front)
- Status: **TEST_PASSED** (2026-10-30 16:3x, Tanya) — AC-1…AC-6; AC-6 live in 2 calls; O-1…O-3 non-blocking
- Asked by: the PM, 2026-10-30 (`inbox/QA.md`) · stub for AC-1…AC-5 · AC-6 live, ≤ 6 gateway calls (DECISIONS 2026-10-30 09:5x)
- Tested: 2026-10-30 by Tanya · harness `tests/harness/test-115/`

## Build under test
- **`bash ai-worker/tools/tree-fp.sh`, at the verdict** (QA.md § TEST template, ORDER 45 — the rule reached my inbox during this run):
  - `tree-fp blueprint-back HEAD f10f8cb fp 3f9eb04bbf99 (156 paths: 152 tracked, 4 untracked, 0 deleted)`
  - `tree-fp blueprint-front HEAD 09f2717 fp 4bb3a8887d1a (305 paths: 305 tracked, 0 untracked, 0 deleted)`
- At the start (before the rule) I used my old recipe: blueprint-back `25ef6b62c010`, blueprint-front `e01fb497c3b0` — **the same values again at the verdict**, so the trees did not change during the run. Changed paths: blueprint-back 17 (13 modified + `src/gateway/models.ts`, `test/gateway/weights.test.ts`, migration `0011_majestic_vengeance.sql` + its snapshot) · blueprint-front 2 (`src/core/api/schema.d.ts`, `src/features/ready/load.test.ts`). Clean HEAD export + diff + untracked, `--no-env-file`, `pglite:memory`.
- Ports: cases API 4251 · regression API 4231 + web 3141 · stubs 4398.

## Instruments and their limits
- `gateway-115.mjs` — a stub gateway that **records the model each HTTP request asks for** (`tier` or `provider/model` from the request body) and answers from a per-run script (`good`, `refused` = one part the server refuses, `unreadable`, `http500`, `quiz`). So every case is judged twice: what Blueprint **recorded** (`calls` on the round / quiz item, and the stored bot row) and what actually **left the server** (the stub's log).
- `cases.mjs main|env` — the API the chat and quiz pages post to (`POST /rounds`, `POST /quizzes/{id}/questions`), then `GET /messages` and `GET /quizzes/latest` for the stored record.
- The stub cannot show a real cheap model's quality — that is AC-6's live run.
- Three harness bugs of mine were found and fixed before any verdict: a key-order compare (jsonb reorders keys), a quiz setup round that ate the first scripted answer, and a stub that did not restart a script written twice. Final outputs: `main.out`, `env1.out`, `env3.out`.

## Cases

| # | AC | Type | Actual (stub log = what left the server · record = `calls`) | Result |
|---|---|---|---|---|
| 1 | AC-1 | happy | first reply refused (a `feature` part) → HTTP `tier:medium` then `tier:small`; record `first/heavy/tier:medium/ok`, `correction/light/tier:small/ok`; the **stored bot row's `roundCalls` = the same** (`ac1.json`) | PASS |
| 2 | AC-1 | neighbour | a clean round → exactly 1 call, heavy, `tier:medium` · an unreadable first reply → the re-ask goes light on `tier:small` · a project on the picker's named model (`stub/qa-main`) → heavy keeps it, the correction still `tier:small` | PASS |
| 3 | AC-2 | happy | a quiz question → 1 call on `tier:small`, `answer/light`, stored on the quiz item (`GET /quizzes/latest`) (`ac2.json`) | PASS |
| 4 | AC-3 | negative | correction **unreadable** on light → exactly one more call, `tier:medium`, `fallback: true`; round applied (`ac3-unreadable.json`) | PASS |
| 5 | AC-3 | negative | correction readable but **still refusing** → one fallback on `tier:medium` | PASS |
| 6 | AC-3 | boundary | light **and** fallback unreadable → stops at 3 HTTP calls (first, light, fallback) — no fourth; re-ask path the same (3, `bot_could_not_answer`) | PASS |
| 7 | AC-3 | negative | quiz light unreadable → one fallback on `tier:medium`, answered | PASS |
| 8 | AC-3 | boundary | project already on `tier:small` → no fallback (light IS the project's model): 2 calls, both `tier:small`, none marked fallback | PASS |
| 9 | AC-3 | observe | correction light **transport failure (HTTP 500)** → HTTP: `tier:small` **twice**, then `tier:medium`; record shows the light step once (`http_500`) + the fallback → **O-1** (`ac3-transport.json`) | PASS (see O-1) |
| 10 | AC-3 | observe | quiz, every reply unreadable → 4 calls: answer light + fallback, re-ask light + fallback (`ac3-quiz-all-bad.json`) → **O-2** | PASS (see O-2) |
| 11 | AC-4 | happy | API restarted with `GATEWAY_LIGHT_MODEL=deepseek/deepseek-chat` (no code change) → the correction and the quiz ask `deepseek/deepseek-chat` (`env1.out`) | PASS |
| 12 | AC-4 | negative | `GATEWAY_LIGHT_MODEL=QA-NOT-A-MODEL-7f3` → light calls use the project's model (`tier:medium`); the log says "GATEWAY_LIGHT_MODEL invalid — using the project's model", **the value printed 0 times** (`env3.out`, `api-env3.log`) | PASS |
| 13 | AC-5 | regression | REQ-110 AC-2…AC-9 scripts (TEST-114's five, same stub modes): **49 OK** + the known `ui.mjs` #6 miss (Ant dropdown, every round since TEST-107) (`reg.out`). One count moved, as REQ-115 req 3 says: the "feature" case now makes **3** calls (round + correction + its fallback) where it made 2 → **O-3** | PASS |
| 14 | AC-5 | regression | REQ-114 AC-1 + AC-3/AC-4 (`ac1.mjs`, `r2.mjs`) and REQ-116 edges (`edges.mjs`): **30 OK**; the one BAD = host:port without a scheme, TEST-111 Q1 (accepted out of scope) (`req114.out`) | PASS |
| 15 | AC-5 | suites | blueprint-back `bun test --timeout 30000` **329 / 16 skip / 0 fail** (gateway = refusing URL) · blueprint-front `check:api` matches, typecheck 0, unit **238 / 0**, build 0 (`blueprint-back-test.txt`, `blueprint-front-static.txt`) | PASS |
| 16 | **AC-6** | **live** | cap proxy at 6; **2 calls used** (`live/live-calls.log`). **Round 1** (spec.txt, 72.7 s): 1 call, `first/heavy` asked `tier:medium` → `openai/gpt-5.6-terra`, `applied`, nothing refused, **15 parts**: API-001…004 = the 4 addresses (`url_kept` ×4), WRK-001 :3900, INT-001 10 s, INT-002 "เช็คตอนนี้", DEC-001 3 s, DATA-002 "ทำงาน / ไม่ตอบ", SCR-001, Q-001/Q-002 — **at least what REQ-114's live run stored** (10 parts, all 4 addresses, points 2–6 + "ไม่ทำ"). No light step arose (the first reply was clean), so **one quiz question**: `answer/light` asked `tier:small` → **`deepseek/deepseek-flash`**, 1.3 s, answered "ระบบตรวจสอบซ้ำทุก 10 วินาที (และตรวจทันทีเมื่อเปิดหน้า)" citing INT-001 — right (`live/ac6-*.out`, `ac6-*.json`) | PASS |

## Observations (non-blocking, for the PM)
- **O-1 — a light call that fails on transport is asked twice on the cheap model before the fallback.** The client's own R8 retry (older than REQ-115) runs inside the light call, so HTTP shows `tier:small` ×2 then `tier:medium` ×1, and the record shows the light step once (`http_500`). Req 3 ("never more than one extra call per step") holds per step as recorded; the inner retry is not visible in `calls`. Costs one cheap call more, only on transport failures.
- **O-2 — a quiz whose replies are all unreadable now costs 4 calls** (answer and re-ask, each with its one fallback); before REQ-115 it was 2. One extra per step, as req 3 allows.
- **O-3 — a correction that still refuses now gets its fallback**, so REQ-110's "nothing saved" case costs 3 calls instead of 2; the sentence and the stored record are unchanged (`reg.out` #3).
- The quiz item has no `model` field (it never had; the model is in `calls`) — noted, not asked by the REQ.

## Test data created
| What | Where | End state |
|---|---|---|
| ~20 projects "TEST-115 …", REQ-110/114 script projects | `pglite:memory` (:4251, :4231) | gone: APIs stopped |
| AC-6 live project "TEST-115 AC-6 Health Board" | `pglite:memory` (:4251) | gone: stopped; the real gateway keeps no project |
| 2 live gateway calls (of ≤ 6) | `ai.develyst.online` via cap proxy :4397 | `live/live-calls.log` |
| servers 4251 / 4231 / 3141 / 4398 / 4397 | this machine | stopped; `ss` clear |
| scripts, outputs | `tests/harness/test-115/` | left, as evidence |

## Verdict
**`TEST_PASSED`** — AC-1 (heavy first on the project model, light correction on `tier:small`, both recorded on the round and the stored row), AC-2 (quiz on `tier:small`), AC-3 (one fallback up on the project's model, marked, never a second; none when light is the project's model), AC-4 (`GATEWAY_LIGHT_MODEL` changes it with no code change; an invalid value falls back and is never logged), AC-5 (REQ-110 / REQ-114 / REQ-116 scripts and both suites), AC-6 (live: 2 calls — the spec stored as fully as REQ-114's run, the light call went to `deepseek/deepseek-flash`). O-1…O-3 for the PM, none blocking. **Tested trees for git (tree-fp.sh):** blueprint-back **f10f8cb fp `3f9eb04bbf99`** · blueprint-front **09f2717 fp `4bb3a8887d1a`** — unchanged during the run.

## Questions
(none)
