# REQ-115: Each LLM gateway call uses a model that fits the task — cheap models for easy work
- Status: **DELIVERED + COMMITTED** (2026-10-30 16:4x — blueprint-back 93249a7 · blueprint-front b08d23a, pushed, PM verified) · DELIVERED (2026-10-30 16:3x, the PM — QA's TEST_PASSED; O-1…O-3 accepted [PM-decided, DECISIONS 16:3x]; not committed — git word asked of the owner/Atom; tested trees blueprint-back f10f8cb fp `3f9eb04bbf99` · blueprint-front 09f2717 fp `4bb3a8887d1a`) · was TEST_PASSED (2026-10-30 16:3x, QA Tanya — AC-1…AC-6; AC-6 live in 2 calls; `tests/TEST-115-gateway-model-per-task.md`) · SPEC_DONE (2026-10-30 16:0x, Sober, per the board) · READY_FOR_SA (2026-10-30, the PM)
- Priority: MEDIUM `[PM-decided]` — saves money, nothing is broken. Team A takes it after the current queue (REQ-114 → TASK-113 for REQ-105 → TASK-117 for REQ-112). Build order stays the SA's.
- Requested: 2026-10-30 09:49 by the owner (via Atom) — `SYSTEM-FACTS.md` § "LLM gateway model choice"
- Deadline: none
- Team: **A (Blueprint)** — only blueprint-back calls the gateway. CAW makes no gateway call (`DECISIONS.md` 2026-10-29 11:41 item 8).

## Problem / Goal

The owner: *"เวลาใช้llm gateway อ่ะ มันมีตั้งหลาย model ตอนนี้ใช้ตัวไหนอยู่ ทำให้มัน dynamicนะ แล้วแต่เรื่องหรือสถานการณ์ เพราะ งานง่ายๆ โง่ๆ แค่ตัดสินใจ หรือ แค่ตอบ อยากให้ช่วยประหยัดลงหน่อย สลับไปมาแล้วแต่โมเดลได้ งานง่ายก็deepseek ตัวนี้ก็ได้หรือ ตัวนั้นก็ได้ หรือ xai บ้างก็ได้"*.
Today every gateway call in a project uses that project's one model (`project.model`, default `tier:medium`): the
interview's first answer (`blueprint-back → src/interview/round.ts:560`), its corrections and re-asks and later rounds
(same call), and the quiz answer (`src/quiz/answer.ts:57`). A short "fix this field" correction costs the same as
reading a whole spec. Goal: spend less on easy calls without losing what REQ-110/REQ-114 now store.

## Requirement

1. Every gateway call has a **task kind**, and the model is chosen per kind. Starting kinds (the SA may split further):
   **heavy** = the interview's first answer to a long message, and any round that proposes spec changes ·
   **light** = a correction or re-ask after a refused/unreadable reply, the quiz answer, and any other short
   decide-or-answer call.
2. **Light** calls use a cheaper model than the project's main one (the gateway's `tier:small`, or a named cheap
   model such as a deepseek or xai one — the SA picks from `GET /models`). **Heavy** calls keep the project's model
   (the user's picker choice still decides them).
3. **Fallback up, once:** if a light call fails (timeout, unreadable, refused for shape), the same step is retried once
   on the project's main model before the user sees a failure. Never more than one extra call per step.
4. The model each call used, its kind, and whether it was a fallback are **recorded** with the round (readable by the
   team, like REQ-110's record), so the saving and any quality loss can be seen without new calls. Never a key.
5. The choice is **configurable** (env or one config file), not hard-coded in several places, so the owner can change
   which model is "cheap" without a code change.
6. REQ-110 and REQ-114 behaviour stays: refused changes named, nothing claimed saved that was not, addresses stored.

## Acceptance Criteria

- [ ] **AC-1** — **Given** a stub gateway that records the model of each request **When** a round runs whose first reply is refused and corrected **Then** the first call used the project's model and the correction used the light model; both are in the round record with their kind.
  - Check: QA, stub.
- [ ] **AC-2** — **Given** the stub **When** a quiz answer runs **Then** it used the light model.
  - Check: QA, stub.
- [ ] **AC-3** — **Given** the stub fails the light call once **When** the step runs **Then** exactly one retry goes to the project's model; the record shows `fallback`; at most one extra call.
  - Check: QA, stub.
- [ ] **AC-4** — **Given** the cheap-model setting is changed in config **When** the next light call runs **Then** it uses the new model, with no code change.
  - Check: QA, stub.
- [ ] **AC-5** (regression) — REQ-110 AC-2…AC-9 and REQ-114 AC-1/AC-3 still pass with the stub; blueprint-back and blueprint-front suites pass.
  - Check: QA.
- [ ] **AC-6** (live, small) — **Given** the real gateway **When** QA runs the Health Board spec (`tests/harness/test-106/spec.txt`) once **Then** the light calls went to the cheap model and the spec is stored as well as REQ-114's live run stored it.
  - Check: QA, live — **at most 6 gateway calls** (`DECISIONS.md` § "ตัดสินใจแทนเจ้าของ รอทบทวน" 2026-10-30, PM's ≤ 6 per test round).

## User-facing wording (the PM)

No new sentence. The model picker keeps its words. If the SA wants the user to see "ใช้รุ่นประหยัด" anywhere, that wording comes to the PM.

## Constraints

- Gateway calls in tests: stub only, except AC-6. No seam change. The gateway is a third-party API with no auth (`SYSTEM-FACTS.md` 10:51).

## Out of Scope

- CAW (no gateway calls today; Claude CLI work is not the gateway). · An AI that picks the model by itself ("decision AI" for routing) — plain rules by task kind are enough for now. · Cost reports or dashboards.

## Questions
(the SA and the QA ask here; the PM answers as `> answer: ...`)

## AC check
(Sober, SA A, 2026-10-30 16:0x — against the deliverable on blueprint-back `f10f8cb` + TASK-134's 17 paths and blueprint-front `09f2717` + TASK-135's 2 paths; all re-run by me)

| AC | Where it is met | Self-checked |
|---|---|---|
| AC-1 | blueprint-back `src/interview/round.ts` (`first` heavy via `modelFor`, `correction` via `askLight`; `calls` on the bot row + `Round`) · test `test/gateway/weights.test.ts:56` (first → project model, correction → `tier:small`, both in `roundCalls`) | yes |
| AC-2 | `src/quiz/answer.ts` (`ask` = light) · test `weights.test.ts:73` (`tier:small`, item `calls` = [answer/light]) | yes |
| AC-3 | `round.ts` `askLight` + `answer.ts` `ask` (one fallback, never on the same model) · tests `weights.test.ts:83,95,107,119,128,160` (transport / unreadable / still refusing / never two / quiz / project on tier:small) | yes — O-1 quiz edge accepted (TASK-134 § Review) |
| AC-4 | `src/gateway/models.ts:9-19` (env read at call time, invalid → project model, no value logged) · test `weights.test.ts:140` | yes |
| AC-5 | blueprint-back full suite 329 pass / 16 skip / 0 fail (incl. `test/interview/{honest,partial,guard,shapes,op-slip,…}` for REQ-110 and `url-catcher`, `service-urls` for REQ-114; 7 count-only changes listed in TASK-134) · blueprint-front check:api, typecheck 0, 238/0 (TASK-135) | yes — QA's own REQ-110/114 scripts are QA's run |
| AC-6 | live, QA only (≤ 6 gateway calls, the PM's scope line 08:4x); nothing more to build | yes (no SA work; QA's run decides) |

## Verification (by QA)
Tanya, 2026-10-30 16:3x — tree-fp.sh: blueprint-back f10f8cb fp `3f9eb04bbf99`, blueprint-front 09f2717 fp `4bb3a8887d1a`; detail TEST-115.

| AC | Verdict | What I checked myself |
|---|---|---|
| AC-1 | PASS | recording stub: refused first reply → HTTP `tier:medium` then `tier:small`; `first/heavy` + `correction/light` in the round and the stored bot row |
| AC-2 | PASS | quiz → 1 call on `tier:small`, recorded on the item |
| AC-3 | PASS | unreadable / still refusing / quiz → exactly one fallback on `tier:medium`, marked; both fail → stops at 3; project on `tier:small` → no fallback |
| AC-4 | PASS | `GATEWAY_LIGHT_MODEL=deepseek/deepseek-chat` → light calls ask it, no code change; an invalid value → project model, value never logged |
| AC-5 | PASS | REQ-110 scripts 49 OK, REQ-114/116 30 OK (known BADs only); back 329/16/0; front check:api, typecheck 0, 238/0, build 0 |
| AC-6 | PASS | live, 2 of ≤ 6 calls: round 1 heavy `tier:medium` → gpt-5.6-terra, 15 parts incl. the 4 addresses (≥ REQ-114's live run); quiz light `tier:small` → deepseek-flash, right answer |

Non-blocking: O-1 (a transport failure asks the cheap model twice — the client's R8 retry — then falls back), O-2 (an all-unreadable quiz now costs 4 calls), O-3 (REQ-110's "nothing saved" case now costs 3 calls).
