# TASK-023: The one recorded real round-trip through `back/` (call #3 of 5) + REQ-006 AC checklist
- Source: SPEC-006
- Status: DONE — 2026-09-13, Sober: every DoD line re-run by SA with the gateway pinned to a dead port (zero real calls in review; ledger stays 3 / 5) — see §Review
- Depends on: TASK-022 `DONE`
- Owner: Fern (FE)

## What to do

This task spends **exactly one** of the owner's remaining three real calls (SPEC-006
§Call ledger row 3). Read the ledger first. If row 3 is already filled by anyone, stop
and ask in §Questions.

0. **FQ37 trim line (no network, do this first).** In `back/src/index.ts` `POST /ask`, add a
   400 for a whitespace-only question — `question.trim().length === 0` → `bad("\`question\` must
   not be blank.")` — keep the existing 1–2000 check on the raw length and send the string as
   received. Add `JSON.stringify({ question: "   " })` to the bodies in the existing 400-path
   test in `back/test/ask.test.ts`. Run `cd back && bun test` → still **18 tests, 18 pass / 0 fail**
   (the new body joins the existing loop; the expect() count rises, the test count does not);
   paste the summary line. Nothing else in
   `back/` changes in this task (SPEC-006 §Flow 5 as amended 2026-09-13).
1. **Before firing:** open `specs/SPEC-006-back-gateway-client.md` §Call ledger and fill
   row 3's Date/Who **now** (Result stays "pending"). This is the append-before-you-fire
   rule; it is not optional.
2. Start `back/` with defaults (`cd back && bun run dev` — no env override, so
   `GATEWAY_BASE_URL` is production). Send **one** request:
   `curl -s -X POST http://localhost:3001/ask -H "Content-Type: application/json" -d '{"question":"Say OK."}'`
   — the same minimal shape SA used in call 2, so the cost stays at ~15 tokens.
3. **Record in §Implementation Notes**, verbatim: the date/time (+0700), the request, the
   full response body, HTTP status, the `[gateway] ok …` log line (provider, model,
   tokens, latency_ms, wall_ms). Then complete ledger row 3 with the result and set the
   running total to **3 / 5**.
4. **If step 2 fails:** do **not** retry. Record the failure exactly as in step 3 (the
   `[gateway] fail …` line and the response), fill row 3 as a failure, and ask in
   §Questions whether it was a `back/` bug or a gateway/provider event. Sober decides
   whether row 4 (the single retry) is spent.
5. **AC-d check (mechanical):** `cd front && npm run build`, then
   `grep -r "ai.develyst.online" front/.next` — paste the (expected empty) output. Also
   `grep -rn "ai.develyst.online" front/src` (expected empty).
6. **AC checklist:** in §Implementation Notes, go through REQ-006 AC-a … AC-f one line each
   with the evidence pointer (this task or TASK-022 §Implementation Notes). AC-c's four R5
   modes map to TASK-022's stub tests — say which test demonstrates which, and state that
   "quota" and "unknown-model" are stub-demonstrated and heuristic per SPEC-006 D2, not
   reproduced on production (that is the explicit "declared untestable on the real
   provider within the budget" the AC allows).

No git write, no deploy, no second call.

## Definition of Done
- [x] Step 0: `{"question":"   "}` → 400 against the stub (paste it); `bun test` summary pasted, 0 fail; no other file under `back/` changed.
- [x] SPEC-006 §Call ledger row 3 filled before and after the call; total reads 3 / 5 (or the failure is recorded and row 4 is untouched pending Sober).
- [x] Response body + log line pasted; `provider`, `model`, `usage`, `latency_ms`, `wall_ms` all present.
- [x] Both AC-d greps pasted and empty.
- [x] AC-a … AC-f each addressed with a pointer.
- [x] Statement in §Implementation Notes: "Total real calls fired by this task: 1" (or 0 if it failed before reaching the gateway).

## Implementation Notes
- 2026-09-13 13:17 +0700 (Fern): step 0 done (18/18), ledger row 3 appended; **about to fire call #3 once** — if this line has no follow-up, the call state is unknown: check the gateway side before anything else, do NOT fire again.
- **Follow-up 13:17:27 +0700: call #3 fired once and succeeded (below). Total real calls fired by this task: 1.**

### Step 0 — FQ37 trim line (no network)
Two files changed under `back/`, nothing else (mtimes: only `src/index.ts` and `test/ask.test.ts` at 13:16:20; the other 11 files still 13:06:45; both files CRLF by bytes, 0 bare LF):
- `back/src/index.ts` — one line after the existing 1–2000 raw-length check:
  `if (question.trim().length === 0) return bad("`question` must not be blank.");` — raw length still checked first, string sent as received.
- `back/test/ask.test.ts` — `JSON.stringify({ question: "   " })` added to the 400-path bodies (8 bodies now).
- `cd back && bun test` → `18 pass / 0 fail / 78 expect() calls / Ran 18 tests across 2 files. [289.00ms]` (was 74 expects; test count unchanged). `bunx tsc --noEmit` → exit 0.
- Against a running `back/` with `GATEWAY_BASE_URL=http://127.0.0.1:1` (dead port — nothing could reach production):
  `curl -X POST http://localhost:3001/ask -d '{"question":"   "}'` → **HTTP 400** `{"ok":false,"kind":"bad_request","message":"`question` must not be blank."}`; back log shows only the startup line, no `[gateway]` line (rejected before network). Process stopped, 3001 free.

### Steps 1–3 — the one real round-trip (SPEC-006 ledger row 3)
- Row 3 Date/Who written to SPEC-006 §Call ledger at 13:17:03 +0700, Result "pending", BEFORE starting `back/`.
- Shell had no `GATEWAY_*`/`PORT` env; `cd back && bun run dev` → `[back] portfolio-back 0.1.0 listening on http://localhost:3001 — gateway https://ai.develyst.online`.
- **Request, 2026-09-13 13:17:26 +0700:** `curl -s -X POST http://localhost:3001/ask -H "Content-Type: application/json" -d '{"question":"Say OK."}'`
- **Response, HTTP 200** (curl total 0.996 s), body verbatim:
  `{"ok":true,"answer":{"content":"OK","provider":"deepseek","model":"deepseek-flash","usage":{"prompt_tokens":18,"completion_tokens":1,"total_tokens":19},"latency_ms":568,"wall_ms":989}}`
- **Log line verbatim:** `[gateway] ok provider=deepseek model=deepseek-flash tokens=18/1/19 latency_ms=568 wall_ms=989 q_len=7 a_len=2`
- Ledger row 3 completed; running total **3 / 5**. Row 4 untouched. `back/` stopped, port 3001 free again. Port 3000 (foreign) never touched.
- Note for Sober: prompt_tokens 18 vs call 2's 14 — `back/` adds the dev placeholder system prompt (SPEC-006), expected; provider/model identical to call 2.

### Step 5 — AC-d (mechanical)
- `cd front && npm run build` → exit 0 (10/10 static pages, standalone copy done).
- `grep -r "ai.develyst.online" front/.next` → **(empty)**, exit 1.
- `grep -rn "ai.develyst.online" front/src` → **(empty)**, exit 1.
- `git status --short` at repo root → `?? back/` only (nothing in `front/` or root changed by this task; `.next/` is git-ignored).

### Step 6 — REQ-006 AC checklist
- **AC-a** (runs on Bun + Hono, health check): TASK-022 §Implementation Notes (`/health` 200, re-run by Sober in §Review); this task started it twice via `bun run dev` — both startup lines above.
- **AC-b** (recorded real round-trip with request/response/provider/usage/latency/date, running total written): this task, steps 1–3 above + SPEC-006 §Call ledger row 3 → 3 / 5, within the owner's 5.
- **AC-c** (one operation; four R5 failure modes each demonstrated or declared untestable): the one operation is `askGateway()` (TASK-022, SPEC-006 D1). R5 mapping to `back/test/ask.test.ts` (all against the local stub, zero cost):
  gateway down → `kind unreachable: closed port` (structural); timeout → `kind timeout: stub mode hang` (structural);
  quota exhausted → `kind quota: stub mode quota` — **stub-demonstrated, heuristic over the error string per SPEC-006 D2, not reproduced on production** (declared untestable on the real provider within the budget);
  unknown-model → `kind unknown_model: stub mode unknown_model` — **same: stub-demonstrated, heuristic per D2, not reproduced on production**.
  Plus `gateway_error` and `bad_response` (D2's two extra kinds) demonstrated the same way; every kind is a distinguishable HTTP status + `[gateway] fail` log line (TASK-022).
- **AC-d** (no key, no gateway base URL in the browser bundle): step 5 above — both greps empty; `back/` has no keys at all (TASK-022: no `.env*`, URL only in `back/src/config.ts`).
- **AC-e** (root README not made more wrong; `back/` explained where the next person looks): TASK-022 — root `README.md` byte-identical to `1dcc9b8` (`git diff --stat 1dcc9b8 -- README.md` empty, re-run by Sober); `back/README.md` exists and says what `back/` is. Unchanged by this task (mtime table above).
- **AC-f** (no deploy, no pm2, no ssh, no git write): none of those happened in this task; `git status` = `?? back/` — the commit/branch are the human's.

**Total real calls fired by this task: 1.**

## Questions
(Fern asks; Sober answers as `> answer: ...`)
- FQ39 (non-blocking, 2026-09-13): the mechanical AC-d grep matches the string `ai.develyst.online`; the SPEC/REQ also name the *base URL* as the thing that must never reach the browser — I did not grep for any other spelling (e.g. a bare hostname without the scheme is the same string, so it is covered; an IP or a proxied path would not be, and none exist in `front/`). Confirm the two greps are the whole of AC-d for this REQ.
  > answer (Sober, 2026-09-13): **Confirmed for REQ-006.** AC-d names two things — a key and the gateway
  > *base URL*. `back/` holds no key at all (TASK-022: no `.env*`, nothing secret in `config.ts`), so only
  > the URL can leak, and the string `ai.develyst.online` is the URL's only spelling anywhere in the repo
  > (`develyst-ai` publishes no IP, and `back/` never proxies a path to it). I widened the sweep myself:
  > `develyst.online` over `front/src` hits only the five pre-existing project links in `projects.ts`
  > (dte / root / laichill / yodbarber / avatar) — site content, none the gateway; `NEXT_PUBLIC_API_URL`
  > and `localhost:3001` appear nowhere in `front/src` or the built static bundle today. **For REQ-007
  > the check inherits unchanged** and gains nothing about `back/`'s own address: the browser *must* know
  > where `back/` is to open the WebSocket, and that address is not the gateway. SPEC-007 will say so.

## Review
**Verdict: DONE** (Sober, 2026-09-13 13:24 +0700). Every DoD line re-run by me, all with `GATEWAY_BASE_URL`
pinned to `http://127.0.0.1:1` (a dead port) so **nothing in this review could reach production — ledger stays
3 / 5.** Row 4 is now moot (its trigger was "#3 fails for a `back/` bug"; #3 succeeded).

- **Step 0 (diff read):** `index.ts` — exactly one new line, after the raw 1-2000 check, `question.trim().length === 0`
  → `bad("\`question\` must not be blank.")`, string still sent as received. `ask.test.ts` — one new body
  `JSON.stringify({ question: "   " })` in the existing 400 loop (8 bodies). mtimes: only these two files at
  13:16:20, the other 11 at 13:06:45. CRLF by bytes: `index.ts` 101 CRLF / 0 bare LF, `ask.test.ts` 121 / 0.
- **`bun test` → 18 pass / 0 fail / 78 expect() / 2 files (265 ms)** — count unchanged, expects +4 as predicted.
  `bunx tsc --noEmit` exit 0. `from "hono` in `src/gateway/` = 0 hits; `ai.develyst.online` in `back/src` = `config.ts:41` only; no `.env*`.
- **Live probe on my own run (port 3011, dead-port gateway):** `{"question":"   "}` → **400** `must not be blank`;
  `{"question":"\t\n"}` → **400** same; `{"question":"Say OK."}` → **503 unreachable**; `/health` 200. Log: startup
  line + ONE `[gateway] fail kind=unreachable … ` line for the real question only — the two blank bodies wrote no
  gateway line, i.e. rejected before network. Process stopped, 3011 free; 3001/3000 never touched.
- **Ledger:** SPEC-006 §Call ledger row 3 carries date/who/request/result/total **3 / 5**; row 4 "reserved", row 5
  "nobody" — untouched. The pasted response body has `provider`, `model`, `usage` (18/1/19), `latency_ms` 568,
  `wall_ms` 989; the pasted log line is content-free (`q_len=7 a_len=2`). The 18-vs-14 prompt-token delta is the
  longer dev-placeholder system prompt (64 chars vs 28) — expected, and it disappears when SPEC-007 replaces it.
  Fern's append-before-fire line (13:17 "about to fire") + its follow-up are both in §Implementation Notes as the rule asks.
- **AC-d, re-run:** `cd front && npm run build` exit 0, 0 error/warn lines, standalone copy done;
  `grep -r "ai\.develyst\.online" front/.next` → empty (exit 1); same over `front/src` → empty. Widened sweep in the
  FQ39 answer above. Root `README.md`: `git diff --stat 1dcc9b8 -- README.md` empty. `git status` = `?? back/` only.
- **AC checklist (step 6):** AC-a … AC-f each carry a pointer I could follow; the AC-c mapping test-name → R5 mode is
  correct against `ask.test.ts`, and the "quota / unknown_model are stub-demonstrated, heuristic per D2, not reproduced
  on production" declaration is exactly the "declared untestable within the budget" the AC allows. **"Total real calls
  fired by this task: 1"** is stated twice.
- **Nothing to rework.** No scope drift: two files, one line + one body, no deploy, no git write, one paid call.

**Consequence:** both SPEC-006 tasks are `DONE` → **SPEC-006 `DONE`, REQ-006 `SPEC_DONE`** — with Porter for acceptance.
