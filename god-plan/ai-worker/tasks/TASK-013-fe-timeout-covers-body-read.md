# TASK-013: Front — the 28 s request timeout must also cover reading the body (hardening for TEST-001 OBS-1)
- Source: SPEC-002 §Non-functional ("the front's own fetch timeout is 28 s") · REQ-001 AC-8 (the error within 30 s) · TEST-001 OBS-1
- Owner: FE (Fern)
- Status: DONE (2026-11-08, SA review; the gap was reproduced on the old code and is gone on the same recipe)
- Depends on: none
- Git: none by you.

## Why (a hypothesis, not a proven cause: `reproduce-first.md` §4)
OBS-1: once in 4 runs, "ให้ AI ช่วยแตกงาน" in stand-in `hang` mode still spun after 35 s, and Tanya couldn't reproduce it. **Read by
the SA in `god-plan-front/src/lib/api.ts` (`call()`, lines ~45–63):** `clearTimeout(timer)` runs in `finally` as soon as `fetch()` resolves, which
is when the **headers** arrive. `res.json()` then reads the **body** with no timer. So any response whose headers arrive and whose body stalls
leaves the spinner up with no end. The front's 28 s guard doesn't bound the whole request.
**Whether this is OBS-1's cause is not known.** Nobody has seen headers-then-stall in that run. It is a gap either way, and AC-8 needs the
bound to hold whatever the cause, so it gets fixed. If OBS-1 recurs after this fix, it is something else, and QA's repro script stays the tool.

## What to do
1. **Step 0, reproduce the gap on the current code:** a throwaway server, `god-plan/ai-worker/tests/harness/stall-body/server.ts`
   (Bun, `127.0.0.1:4312`). On any `/api/*` request it sends status 502, `content-type: application/json` and the first bytes
   `{"error":` immediately, then **never finishes the body** (keep the stream open ~60 s). Run the front with `BACK_ORIGIN=http://127.0.0.1:4312`
   (or intercept with CDP, your choice). Press "ให้ AI ช่วยแตกงาน" as a signed-in owner (any way you can reach the board; CDP to fake
   the page data is fine) and record that **no error appears by 30 s** on the current code. Paste. If Step 0 does *not* hang, stop and
   write it in `## Questions`: the hypothesis is then wrong.
2. **Fix (one file, `src/lib/api.ts`):** the timer and the abort signal cover the whole call, headers **and** body. Clear the timer only
   after `res.json()` (or the 204 return) has finished. An abort while reading the body becomes the same `ApiError(0, "NETWORK")`, so
   `aiMessageFor` / `messageFor` show their existing strings. Don't change `TIMEOUT_MS`.
3. **Same recipe after the fix:** the error string appears at about 28 s, the button is enabled again, and nothing on the board changed. Paste.
4. Re-run `task-009.mjs` against `back-pglite` + `gateway-stub` (AC-8 `hang` must still show the error at about 25 s, from the back's 502). Paste the summary line.

## Definition of Done
- [ ] Step 0 output (hangs > 30 s on the old code). Step 3 output (error at about 28 s on the new code). Same recipe both times.
- [ ] `task-009.mjs` → all pass. `bunx tsc --noEmit` → clean. `bun run build` passes. Paste.
- [ ] `git status --short` shows only `src/lib/api.ts` changed beyond what was already there. Paste. The stall server is stopped (by its own PID or `timeout`).

## Implementation Notes
**Fern, 2026-11-08.** Repo `god-plan-front`, branch `atom`, HEAD `a41cbd0` before and after (no git by me).

**The recipe (same both times).** `tests/harness/stall-body/server.ts` (Bun, `127.0.0.1:4312`) is a pass-through to the real back (`back-pglite` on :4310) so the owner can sign in and reach the board; for one call, `POST /api/projects/:id/ai/task-proposals`, it answers **HTTP 502, `content-type: application/json`, the first bytes `{"error":`, then holds the stream open 60 s**. The front ran with `BACK_ORIGIN=http://127.0.0.1:4312`. `tests/harness/task-013-recipe.mjs` signs in as the owner (headless Chrome, real clicks), opens the board, presses `ให้ AI ช่วยแตกงาน`, and checks every second whether the AI error string is on screen and whether the button is enabled again, up to 40 s.

**Step 0, OLD code (`src/lib/api.ts` md5 `0d7defc0…`, timer cleared when the headers arrive):**
```
t=10s  error shown: false  button still disabled/"AI กำลังคิด…": true
t=20s  error shown: false  button still disabled/"AI กำลังคิด…": true
RESULT error string at: NEVER within 40 s · button enabled again at: NEVER within 40 s · tasks on the board before/after: 6/6
```
The hypothesis holds: headers then a stalled body leaves the spinner up with no end (the 30 s and 35 s progress lines were skipped by the loop's timing; the RESULT line covers the full 40 s).

**Fix (one file, `src/lib/api.ts`, `call()`, md5 now `8af1b6ae…`).** One timer and one abort signal for the whole call. `clearTimeout` moved into a `finally` around the whole body, so it runs only after `res.json()` (or the 204 return) has finished. An abort while reading the body becomes `ApiError(0, "NETWORK")`, the same as a failed request, so `aiMessageFor` / `messageFor` show their existing strings. A body that is simply not JSON still reads as `null`, as before. `TIMEOUT_MS` (28 000) unchanged.

**Step 3, NEW code, same recipe:**
```
t=10s  error shown: false  button still disabled/"AI กำลังคิด…": true
t=20s  error shown: false  button still disabled/"AI กำลังคิด…": true
RESULT error string at: 28526 ms · button enabled again at: 28526 ms · tasks on the board before/after: 6/6
```
The error appears at about 28.5 s, the button is enabled again at the same moment, and the board is unchanged (6 tasks before and after).

**DoD**
- `node ai-worker/tests/harness/task-009.mjs` (real back + `gateway-stub`, front on the default back) → `37/37 passed`; the AC-8 `hang` cases still show the error at 25 098 ms (task press) and 25 536 ms (summary press), from the back's 502.
- `bunx tsc --noEmit` → `TSC_OK` (also after the build). `bun run build` → passes (`[postbuild] copied .next/static into .next/standalone`; routes as before).
- **Only `src/lib/api.ts` changed:** I took an md5 of every file under `src/` plus `package.json` and `next.config.ts` before the fix (25 files) and after, and `diff` shows exactly one line pair, `src/lib/api.ts`. `git status --short` is unchanged (` M README.md` and the untracked scaffold; the repo has no commits of its own to diff against, so the checksum diff is the proof). Branch `atom`, HEAD `a41cbd0`.
- All my servers (the stall server, the back, the gateway stand-in, the front dev) are stopped by their own pids; nothing is listening on 4310, 4312, 4399 or 4300. `gateway-stub/mode.txt` is `ok`.

**Not claimed.** This closes a real gap, but it is not proven to be OBS-1's cause (the TASK says so too): nobody saw headers-then-stall in QA's run. If OBS-1 recurs after this, it is something else.

**UNVERIFIED:** only what the earlier TASKs already carry (`/impeccable`, real phone, keyboard pass).

## Questions
- None.

## Review
**DONE — Sober (SA), 2026-11-08.**
- Read `src/lib/api.ts` `call()`: one `AbortController` + one timer. The single `clearTimeout` (line 82) sits in the outer `finally`, after the
  body read. An abort while reading → `ApiError(0, "NETWORK")`. A non-JSON body still gives `null`. `TIMEOUT_MS` unchanged. `bunx tsc --noEmit` → `TSC_OK` (re-run by me).
- **The hypothesis is confirmed as a real gap on the same recipe:** old code → no error within 40 s. New code → error and button re-enabled at
  28 526 ms, board unchanged (6/6). That meets `reproduce-first.md` §4 for this gap. **It is still not proven to be OBS-1's cause.** If OBS-1
  recurs, QA's `repro-case21-ui.mjs` is the tool, and this TASK rules out the stalled-body path.
- `task-009.mjs` 37/37 with AC-8 hang at about 25 s (from the back's 502) is accepted. The checksum diff showing only `api.ts` changed is accepted as the scope proof.
