# TASK-130: blueprint-back — read `type` as `op`, name `op` in the prompt, 3-minute first answer (REQ-110 round 4)
- Source: SPEC-105 § Round 4 (E11, E11b, E12)
- Owner: BE (Jason)
- Status: DONE
- Depends on: none. Same topic (REQ-110), same uncommitted tree: build on top of TASK-109/123/126, and commit nothing.

## What to do
Read SPEC-105 § Round 4 first. It holds the why and the contract.

1. **E11, `src/interview/protocol.ts`.** Before `ModelReply.safeParse` (`:40`), for each `changes[i].change` that is an object with **no** `op` key and a `type` equal to one of `part.add` · `part.update` · `part.remove` · `link.add` · `link.update` · `link.remove`: rename `type` → `op`. Nothing else is renamed (see the SPEC's list). `parseReply` returns `{ ok: true, reply, adjusted: Adjusted[] }`, with `{ item: "changes[i]", what: "op_renamed", from: "type", to: "op" }` per rename. Update the file's header comment.
2. **Wire it in `src/interview/round.ts`.**
   - Add `"op_renamed"` to `Adjusted.what` (`:40`) and its comment (`:38-39`).
   - The `adjusted` of the parse that the round actually uses goes into that round's plan adjustments. That parse is the first answer (`:656`), the re-ask (`:664`) or the correction (`:677`). The renames must reach `adjustedRecord` (`:160`) beside E8's, with `title`/`key`/`ref` filled the same way.
3. **Contract, `src/http/routes/rounds.ts:23`.** Add `"op_renamed"` to the `what` enum, then re-emit `openapi.json` the way TASK-126 did.
4. **E11b, `src/interview/context.ts:64`.** The line starts "Change คือ object ที่มีช่อง \"op\" (ห้ามใช้ชื่ออื่น เช่น type) — op คือ part.add (…)". Keep the rest of the line as it is.
5. **E12, `src/gateway/client.ts`.**
   - `createGateway` options gain `firstAnswerTimeoutMs?: number` (default `180_000`).
   - `Gateway.chat` (`:22`, `:117`) gains an optional second argument `{ firstAnswer?: boolean }`. With `firstAnswer: true`, `call` uses `firstAnswerTimeoutMs` instead of `timeoutMs`.
   - E3 stays: no retry after a timeout. In `round.ts`, only the first call (`:653`) passes `{ firstAnswer: true }`. `ask` (`:557`) needs a way to pass it; the re-ask (`:661`) and the correction (`:674`) do not.
6. **Existing tests that drive a whole round with a short `timeoutMs`** (`test/interview/honest.test.ts:145`, `:158`) also set `firstAnswerTimeoutMs` to the same short value. Otherwise they wait 180 s. `test/gateway/client.test.ts:61` calls `chat` without `firstAnswer`, so it stays as is.
7. **New tests**, in `test/interview/shapes.test.ts` or a new `test/interview/op-slip.test.ts`:
   - (a) **AC-8 replay:** a stub returns the recorded `roundRaw` from `<workspace>/i-space/ai-worker/tests/harness/test-107/r3/ac1-round3-accept-messages.json`, closed with `": [] }`. Copy that text into a fixture under `test/`, because a test must not read the workspace. Run it on a project holding the parts it updates (at least `SCR-001` as a screen). Then: the round is `applied`, **all 9 changes are stored** (the data part's body holds the 4 URLs), `roundAdjusted` holds 9 `op_renamed`, and 1 gateway call was made. If one change cannot be stored, it is named in `roundRefused` with its reason, and you say why in the Notes.
   - (b) `type: "kind"` or any other non-op value → unreadable as before (`protocol`). A change with both `op` and `type` → `op` is used and nothing is renamed.
   - (c) **E12:** a gateway with `timeoutMs: 40, firstAnswerTimeoutMs: 200` and a stub answering after 120 ms → the round stores the answer (1 call). A stub that never answers → `bot_could_not_answer` / `timeout`, at about 200 ms.
   - (d) The prompt contains `"op"` and `type` on the Change line.

Closed file list: `src/interview/protocol.ts` · `src/interview/round.ts` · `src/interview/context.ts` · `src/gateway/client.ts` · `src/http/routes/rounds.ts` · `openapi.json` · `test/interview/honest.test.ts` · the new test file and fixture (or `test/interview/shapes.test.ts`). Every `bun` command is prefixed `DATABASE_URL=pglite:memory`. No live gateway. No git.

## Definition of Done
- [ ] 1. Before: `git status --short | wc -l` → `18` (base: `18`, Sober 22:3x, after TASK-129)
- [ ] 2. `grep -c op_renamed openapi.json` → ≥ 1 (base: `0`, Sober 22:3x)
- [ ] 3. New tests 7(a)–(d) pass, real output pasted (base: n/a — new: the replay fixture and `firstAnswerTimeoutMs` do not exist; `grep -rn firstAnswerTimeoutMs src test | wc -l` → `0`, Sober 22:3x)
- [ ] 4. `DATABASE_URL=pglite:memory bun test --timeout 30000` → 0 fail. Paste the counts, and list every existing test you changed and why (base: `267 pass / 16 skip / 0 fail, 1370 expect() calls, Ran 283 tests across 38 files [1861.92s]`, Sober 22:5x–23:2x. An earlier run at 22:3x gave 266/16/**1** in 684 s, with the failing test not captured; most likely a per-test timeout while the box was under load (16 GB, ~10 GB used). If you see one fail, re-run that file alone before counting it as yours.)
- [ ] 5. `DATABASE_URL=pglite:memory bunx tsc --noEmit` → exit 0 (base: exit 0, Sober 18:5x on this tree, TASK-129 § Review)
- [ ] 6. After: `git status --short` → the 18 paths from DoD 1 plus your new test/fixture files, nothing else
- [ ] 7. Refresh `tasks/TASK-109-req110-only.patch` as before. `git apply -R --check` on it → exit 0 (base: exit 0, Sober 22:3x)

## Implementation Notes
Jason, 2026-10-29 ~00:0x. All `bun` commands prefixed `DATABASE_URL=pglite:memory`. No git, no live gateway, no source edit outside the closed list.

**Built**
- E11 `protocol.ts`: `renameOps` runs before `ModelReply.safeParse`; a change with no `op` key and a string `type` in the six op names → `{ op: type, ...rest }`, reported as `{ item: "changes[i]", what: "op_renamed", from: "type", to: "op" }`. `parseReply` now returns `adjusted`. Header comment updated.
- `round.ts`: `Adjusted.what` + comment gain `op_renamed`. `planOf(answer, renamed = [])` puts the parse's renames in front of `build`'s own `adjusted`, so they reach `adjustedRecord` with title/key/ref. Passed from the first answer, the re-ask (via `parsed`) and the correction (`fixed.adjusted`) — whichever the round uses.
- `rounds.ts`: `what` enum gains `op_renamed`; `openapi:emit` re-run (1 line added for the enum; the file's diff vs HEAD is the whole REQ-110 set).
- E11b `context.ts:64`: line now starts `Change คือ object ที่มีช่อง "op" (ห้ามใช้ชื่ออื่น เช่น type) — op คือ part.add (…)`, rest unchanged.
- E12 `client.ts`: option `firstAnswerTimeoutMs` (default 180_000); `chat(req, { firstAnswer? })`; `call`/`chatOnce` take the limit. E3 kept (no retry after a timeout). `round.ts`: `ask(msgs, firstAnswer = false)`; only the first call passes `true` (re-ask and correction don't). Fakes with a one-argument `chat` still work.
- Decisions of mine (internal): the rename puts `op` first in the change object; `renameOps` reads only `changes[i].change` at its top level, so a part body's own `type` is never touched (tested).

**Deviation / declared:** `honest.test.ts:158` (`g1.chat(...)` direct call, no round) cannot hit the first-answer limit, so I left it alone and set `firstAnswerTimeoutMs: 60` only on the whole-round test (`:145`). The TASK listed both lines.

**DoD evidence**
1. before: `git status --short | wc -l` → `18` (base 18) ✔. After: `21` = the 18 + `src/interview/protocol.ts` (closed list) + `test/interview/op-slip.test.ts` + `test/fixtures/op-slip-accept-reply.json`. DoD 6 ✔.
2. `grep -c op_renamed openapi.json` → `1` (base 0) ✔.
3. New tests: `bun test --timeout 30000 test/interview/op-slip.test.ts` → `9 pass / 0 fail, 38 expect() calls [4.64s]`. `grep -rn firstAnswerTimeoutMs src test | wc -l` → `7` (base 0). 7(a) AC-8 replay: the recorded `roundRaw` of TEST-107 r3 (4000 chars) + `": [] }` is `test/fixtures/op-slip-accept-reply.json` (9 changes, every one with `type`). On a project holding WRK-001/STEP-001/SCR-001/Q-001 (stamp `team-proposed`, as the live ones were): `applied`, 1 gateway call, `refused` null, 4 parts added (DATA-001 + DEC-001..003) + the reply's 2 questions (Q-002, Q-003), 4 links added, DATA-001 body holds ≥ 4 `http://127.0.0.1:` URLs, `roundAdjusted` = 9 × `op_renamed` (item 0 = SCR-001, item 1 = `$data_check` with its title) and equals the stored bot row. 7(b) other `type` value / number / neither key → unreadable; `op`+`type` → `op` kept, nothing renamed; all six op names read. 7(c) `timeoutMs 40, firstAnswerTimeoutMs 200`, answer at 120 ms → stored, 1 call; never answers → `bot_could_not_answer`/`timeout`, 1 call, 190 ms ≤ took < 1000 ms; direct `chat` without `firstAnswer` still times out at 40 ms. 7(d) the Change line has `"op"`, `type`, `part.add`.
   - First attempt of the replay made 2 calls: my seed made SCR-001 operator-stamped (meeting-room fixture), so the guard asked for the user's words (`needs_user_words`, correct behaviour). Seed fixed to the live stamp; not a code change.
4. Full suite: `bun test --timeout 30000` → `275 pass / 16 skip / 1 fail, 1408 expect() calls, Ran 292 tests across 39 files [1114.45s]`. The 1 fail = `test/interview/answers.test.ts` "AC-A3: park alone" at 53 061 ms (> 30 s timeout, box under load). Re-run alone: `bun test --timeout 30000 test/interview/answers.test.ts` → `6 pass / 0 fail [10.84s]`. Same shape as the 266/16/1 Sober saw at 22:3x. Tests changed: `honest.test.ts:145` only (added `firstAnswerTimeoutMs: 60`, why: whole-round test would otherwise wait 180 s). No other existing test changed. Count check: base 267 pass + my 9 new tests = 276; the run shows 275 pass + the 1 timeout that passes alone = 276 ✔.
5. `bunx tsc --noEmit` → exit 0 ✔.
7. Patch `tasks/TASK-109-req110-only.patch` regenerated (5384 lines, 20 files = the previous 17 + `protocol.ts`, `op-slip.test.ts`, the fixture; no `openapi.json`); `git apply -R --check` in the real repo → exit 0 ✔. Old copy was kept in my scratchpad until the new one checked.
- `git diff --stat -- bun.lock package.json` → empty. `ss -ltn` :4200/:4500 → nothing listening.

**UNVERIFIED:** no live model run (the owner's gateway calls are QA's); `parseReply`'s rename is exercised by the recorded reply only, not by a fresh model answer.

## Questions

## Review
Sober (SA, A), 2026-10-30 00:xx — **DONE.**
- **Read against SPEC-105 § Round 4.**
  - E11 `protocol.ts:41-47` renames only when there is no `op` key and `type` is in the six op names. It reads `changes[i].change` at its top level only.
  - E11b `context.ts:64` names `"op"`.
  - E12: `client.ts` `chat(req, { firstAnswer })`, default 180 s, no retry after a timeout. **Only** `round.ts:659` passes `true`; the re-ask (`:667`) and the correction (`:680`) do not.
  - `honest.test.ts:145` sets `firstAnswerTimeoutMs: 60`.
- **Sober's re-run:**
  - `bunx tsc --noEmit` → exit 0.
  - REQ-110 patch `git apply -R --check` → OK.
  - `bun test --timeout 30000 test/interview test/seam` → **113 pass / 0 fail**, 602 expects, 14 files [182.68s]. That is 104 + the 9 new tests, and it includes `answers.test.ts`, whose AC-A3 timed out in Jason's full run.
  - `ss` :4200/:4500 → none listening.
- **Decisive evidence accepted:** the AC-8 replay of the real accept reply stores all 9 changes in 1 call, with nothing refused. DATA-001 holds the 4 URLs, and `roundAdjusted` = 9 × `op_renamed`.
- **Deviation accepted:** `honest.test.ts:158` calls `chat` directly, with no round, so it never hits the first-answer limit. Leaving it alone is right; the TASK over-listed it.
- **Full-suite 275/16/1 accepted:** the 1 is AC-A3 at 53 s under load, and it passes alone and in my run. It is not this TASK's.
- UNVERIFIED (as Jason says): a fresh live model answer. That is AC-1's live run.
