# TASK-025: `GET /ws` — the real WebSocket over the chain (frames, abort, `busy`, tests — NO real call)
- Source: SPEC-007
- Status: **DONE** (2026-09-13, Sober — §Review)
- Depends on: TASK-024 `DONE` (met 2026-09-13)
- Owner: Fern (FE)

## What to do

All in `back/`. **Zero requests to `https://ai.develyst.online`** — stub or dead port only.
This is the owner-mandated transport (Q37b): a real WebSocket, Bun native, via
`createBunWebSocket` from `hono/bun` (SPEC-007 D1). HTTP streaming is not an alternative.

0. **FQ40 follow-through (test-side only, two lines, before anything else).** Make the
   PROJECTS.md drift guard EOL-agnostic so an LF checkout on another machine does not fail on
   line endings while the content is identical: in `test/projects-md.test.ts` (i) compare
   `onDisk` and `renderProjectsMd()` after normalising CRLF to LF on both (regex `\r\n` → `\n`);
   (ii) replace the "has CRLF" assertion with "line endings are uniform" (either every line ends
   CRLF or none does).
   The generator and `knowledge/PROJECTS.md` are NOT changed (still CRLF). `bun test` stays 31/31
   before step 1 starts.
   **As-built names to use (TASK-024 §Review):** `runChain(question, { knowledge, id }, onEvent, signal)`
   — pass the `accepted.id` as `deps.id` so the `[chain] id=…` log lines match the frame; the chain
   throws `ChainError { kind, at_step, detail, status? }` and emits no `error` event (FQ41) — the
   `error` frame + `done` are built in your catch; `knowledge` is the `export const knowledge`
   already in `src/index.ts`.
1. **`src/ws.ts`** — `const { upgradeWebSocket, websocket } = createBunWebSocket()`; export
   both. `app.get("/ws", upgradeWebSocket(...))` in `src/index.ts`; `Bun.serve({ port,
   fetch: app.fetch, websocket })`. Per-socket state: `{ running: AbortController | null }`.
2. **Frames** exactly as SPEC-007 §Frames. On `ask`: `validateQuestion()` (extract the
   existing checks from `POST /ask` into `src/validate.ts` and use it in both places — the
   HTTP behaviour must not change: same 400 messages) → `guard(clientKey)` (the same no-op,
   SPEC-006 D8 — this is the WS path's single cap point) → `accepted {id}` (random, e.g.
   `crypto.randomUUID()`, never stored) → `runChain(question, deps, send, signal)` → every
   `ChainEvent` forwarded as-is → `done`. `ChainError` → `error {kind, message, at_step}` →
   `done`. A second `ask` while `running` → `error busy at_step 0` (the running chain is not
   affected). A non-`ask` or non-JSON frame → `error bad_request at_step 0`; socket stays open.
3. **Close mid-chain** → `running.abort()`; the chain must stop before its next step and the
   in-flight `askGateway` is aborted through its `signal` (SPEC-006 already supports it). No
   frame is sent after close (guard every `send` with `ws.readyState`).
4. **Messages per kind** — extend SPEC-006's `MESSAGE_BY_KIND` map (move it to
   `src/gateway/messages.ts`) with `step_malformed`, `knowledge_missing`, `busy`, `bad_request`.
   Fixed short sentences; the gateway `detail` stays in the log (D9).
5. **`scripts/ws-client.ts`** — `bun run ws-client "<question>"` (env `ASK_WS_URL`, default
   `ws://localhost:3001/ws`): opens, sends `ask`, prints every frame as one JSON line, exits on
   `done`. This is how QA/SA inspect the chain (SPEC-007 D8/D11).
6. **Tests `test/ws.test.ts`** — start the app with `Bun.serve` on port 0 (fetch + websocket)
   and the stub in-process, `KNOWLEDGE_DIR` → fixtures; use the global `WebSocket` client.
   Named tests: frame order on the happy path is exactly `accepted, step1 started, step1 done,
   step2 started, step2 done, step3 started, step3 done, answer, done` · off-topic order ·
   `stub:fail@2` → `error at_step 2` then `done` · `busy` when a second `ask` arrives during
   `stub:slow` · closing the client during `stub:slow` → the stub receives no further `POST
   /chat` (count requests in the stub) · blank question → `error bad_request`, no gateway
   request · an `ask` frame with an extra key → `bad_request` · `POST /ask` still behaves as
   in SPEC-006 (its existing tests untouched).
7. **README** — a "WebSocket" section: the frame table (copy from SPEC-007), the `ws-client`
   command, and the note that the stub + markers are the zero-cost way to see every state.

## Definition of Done
- [x] `cd back && bun test` — all green, the tests above exist by name; SPEC-006 + TASK-024 tests passing (TASK-024's `projects-md.test.ts` changed only as step 0 says).
- [x] `bunx tsc --noEmit` → 0.
- [x] `grep -rn "from \"hono" src/chain src/knowledge src/gateway` → 0 hits (`src/ws.ts` and `src/index.ts` may import hono).
- [x] Own run against the stub: `bun run ws-client "Can you build a realtime site with WebSocket?"` prints the nine frames; `bun run ws-client "stub:none …"` prints `coverage:"none"`; kill the stub → `error unreachable at_step 1` then `done`.
- [x] Logs from that run carry ids, kinds, tokens, lengths — **no question text, no excerpt, no answer text** (paste the lines).
- [x] `grep -rn "ai.develyst.online" src` → `config.ts` only.
- [x] Zero requests reached `https://ai.develyst.online` — stated in §Implementation Notes.
- [x] Port 3001 freed after your runs; port 3000 never touched.

## Implementation Notes
(Fern, 2026-09-13)

**Zero requests reached `https://ai.develyst.online`.** Every test and every own run had
`GATEWAY_BASE_URL` pinned to the in-process/local stub (or a killed port for `unreachable`); no
`.env` was read or opened. REQ-007 ledger stays `0 / ?`; SPEC-006's stays 3 / 5.

### Step 0 (FQ40) — done first, in isolation
`test/projects-md.test.ts`: (i) both sides normalised `\r\n` → `\n` before `toBe`; (ii) "has CRLF"
replaced by "line endings are uniform" (CRLF count is 0 or equals the newline count); the
section/id scans split on `\r?\n`. Generator and `knowledge/PROJECTS.md` untouched (still CRLF).
`bun test` was 31/31 after step 0 and before step 1.

### Files — all under `back/` (nothing under `front/`; `git status` = `?? back/` only)
New:
- `src/ws.ts` — `export const { upgradeWebSocket, websocket } = createBunWebSocket()` and
  `wsEvents(c, knowledge)` → the per-socket `{ onOpen, onMessage, onClose }`. Per-socket state:
  `running: AbortController | null` + the raw Bun socket (its `readyState` is live; hono's
  per-event `WSContext.readyState` is a snapshot, so the guard uses `raw.readyState === WebSocket.OPEN`).
  `ask` → `validateQuestion(rest)` (frame minus `type`) → `busy` check → `guard(clientKey)` →
  `accepted { id: crypto.randomUUID() }` → `runChain(question, { knowledge, id }, send, signal)` with every
  `ChainEvent` forwarded as-is → `done`. `ChainError` → `error { kind, message, at_step }` → `done`
  (built in the catch; the `detail` is already in the `[chain] … fail` log line). `onClose` → `running.abort()`.
- `src/validate.ts` — `validateQuestion(body): { ok, question } | { ok, message }`, the SPEC-006 checks moved verbatim
  (same order, same five 400 sentences, `QUESTION_MAX = 2000`). Imports nothing.
- `src/gateway/messages.ts` — `MESSAGE_BY_KIND` moved here and extended with `step_malformed`, `knowledge_missing`,
  `busy`, `bad_request` (type `ErrorKind`). Imports only `./types`.
- `scripts/ws-client.ts` — `bun run ws-client "<question>"`; env `ASK_WS_URL` (default `ws://localhost:3001/ws`);
  one JSON line per frame; exits 0 on `done`, 1 if the socket cannot open, 2 on no question.
- `test/ws.test.ts` — 11 tests over a REAL socket (`Bun.serve` port 0 + global `WebSocket`), named as the TASK lists
  them: happy-path frame order (exactly the nine) · off-topic order · `stub:none` · `stub:fail@2` → `error at_step 2`
  then `done` (+ a retry on the same socket works) · `busy` during `stub:slow` (and the first chain's `step 1 done`
  still arrives) · close during `stub:slow` → stub call count stays 1 after 3 s · blank → `bad_request`, 0 gateway
  requests · extra key / non-`ask` / non-JSON → `bad_request`, socket still usable · `POST /ask` unchanged (400
  sentences + 200) · `index.ts` wires `/ws` itself (knowledge-independent).
Edited:
- `src/index.ts` — imports `validateQuestion`, `MESSAGE_BY_KIND`, `{ upgradeWebSocket, websocket, wsEvents }`;
  `POST /ask` validation = `validateQuestion(body)` (JSON-parse failure still `"Body must be a JSON object."`);
  `app.get("/ws", upgradeWebSocket((c) => wsEvents(c, knowledge)))`; `Bun.serve({ port, fetch: app.fetch, websocket })`;
  banner now also prints `ws://localhost:<port>/ws`. `QUESTION_MAX` and the local `MESSAGE_BY_KIND` removed (moved).
- `package.json` — `"ws-client": "bun run scripts/ws-client.ts"`.
- `README.md` — "WebSocket — `GET /ws`" section (both frame tables, the `ws-client` command, stub + markers as the
  zero-cost way); tests paragraph mentions `ws.test.ts`.
Untouched: `src/chain/*`, `src/knowledge/*`, `src/gateway/{ask,classify,log,types}.ts`, `src/limits.ts`, `src/config.ts`,
`test/{ask,chain,classify}.test.ts`, `test/stub-gateway.ts`, fixtures. New files CRLF like the rest of `back/`.

### Test-harness note (why `ws.test.ts` mounts the handler itself)
`index.ts` runs `loadKnowledge()` at import time and `bun test` shares modules across files, so by the time
`ws.test.ts` runs, `index.ts`'s `knowledge` is whatever the FIRST importer's env produced (the real `knowledge/`,
no PROFILE.md → every chain would be `knowledge_missing`; I hit exactly this on the first full-suite run). The test
therefore builds `new Hono().get("/ws", upgradeWebSocket((c) => wsEvents(c, loadKnowledge(FIXTURES)))).route("/", indexApp)`
— the same handler, the same `websocket` object, fixture knowledge — and covers `index.ts`'s own `/ws` wiring with a
knowledge-independent test (`ping` → `bad_request`). Nothing in `src/` was changed to accommodate this.

### DoD evidence (2026-09-13, all against the stub)
- `bun test` → **42 pass, 0 fail, 175 expect()** across 5 files (31 before + 11 new). `bunx tsc --noEmit` → exit 0.
- `grep -rn "from \"hono" src/chain src/knowledge src/gateway` → 0 hits. `grep -rn "ai.develyst.online" src` → `config.ts:48` only.
- Own run: stub `STUB_PORT=3999`; back `PORT=3001 GATEWAY_BASE_URL=http://127.0.0.1:3999 KNOWLEDGE_DIR=<back>/test/fixtures/knowledge`.
  `bun run ws-client "Can you build a realtime site with WebSocket?"` → the nine frames
  (`accepted`, 1 started/done, 2 started/done, 3 started/done, `answer` coverage `covered` 2 citations `calls:3`, `done`).
  `bun run ws-client "Do you fly helicopters? stub:none"` → step-2 `result.coverage:"none"`, `answer` `coverage:"none"`
  `citations:[]`, `done`. Stub killed → `accepted`, `step 1 started`, `error unreachable at_step 1`, `done`.
- Logs from that run (verbatim, content-free — ids, kinds, tokens, lengths only):
  ```
  [chain] id=e719726f-cf9e-4845-9d44-5b48e4c24063 step=1 ok provider=deepseek model=deepseek-flash tokens=14/1/15 latency_ms=636 wall_ms=16 retried=0 len=141
  [chain] id=e719726f-cf9e-4845-9d44-5b48e4c24063 step=2 ok provider=deepseek model=deepseek-flash tokens=14/1/15 latency_ms=636 wall_ms=1 retried=0 len=407
  [chain] id=e719726f-cf9e-4845-9d44-5b48e4c24063 step=3 ok provider=deepseek model=deepseek-flash tokens=14/1/15 latency_ms=636 wall_ms=0 retried=0 len=155
  [chain] id=e719726f-cf9e-4845-9d44-5b48e4c24063 end coverage=covered calls=3 wall_ms=20
  [chain] id=3dec6273-6b58-4d2b-8eae-32917b6fac23 step=1 ok provider=deepseek model=deepseek-flash tokens=14/1/15 latency_ms=636 wall_ms=1 retried=0 len=129
  [chain] id=3dec6273-6b58-4d2b-8eae-32917b6fac23 step=2 ok provider=deepseek model=deepseek-flash tokens=14/1/15 latency_ms=636 wall_ms=0 retried=0 len=32
  [chain] id=3dec6273-6b58-4d2b-8eae-32917b6fac23 step=3 ok provider=deepseek model=deepseek-flash tokens=14/1/15 latency_ms=636 wall_ms=0 retried=0 len=87
  [chain] id=3dec6273-6b58-4d2b-8eae-32917b6fac23 end coverage=none calls=3 wall_ms=2
  [chain] id=bc7933b8-267f-4f57-9fc4-9102e206e4b2 fail kind=unreachable at_step=1 calls=0 wall_ms=1 detail="Error: Unable to connect. Is the computer able to access the url?"
  ```
  The `id` in each line equals the `accepted.id` of the matching run.
- Ports: 3999 and 3001 were mine and are freed (`netstat` after: only 3000, PID 17120, which was there before and was never touched).
- Note: `bun run dev` on the real `knowledge/` dir (no PROFILE.md yet) answers every `ask` with
  `accepted → error knowledge_missing at_step 0 → done` by design (D5) — use `KNOWLEDGE_DIR=test/fixtures/knowledge` for demos until TASK-021.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

- **FQ42 (non-blocking, decision recorded — say if you want it the other way).** SPEC-007 §Frames says `done` is
  "the last frame of every question, success or error", and the TASK's step 2 names `busy` and `bad_request` as
  `error … at_step 0` without mentioning `done`. I send **no `done` after `busy` or `bad_request`**: neither was
  `accepted` (no id was opened), and in the `busy` case a `done` right after the rejection would be read by the
  browser as the END of the chain that is still running — a correctness hazard for TASK-026's state machine. `done`
  therefore closes exactly one `accepted`. If you prefer the literal reading, it is one line in `src/ws.ts` and two
  test expectations.
  > answer (Sober, 2026-09-13): **Accepted as built — your reading is the correct one, and SPEC-007 §Frames now says
  > so explicitly** (amended today: `done` closes exactly one `accepted`; `busy` / `bad_request` are rejected before
  > `accepted` and get no `done`). Your hazard is real: TASK-026's state machine ends `running` on `done`, so a `done`
  > after `busy` would kill the live chain in the browser. TASK-026 already says "never rely on the server's `busy`"
  > (its submit is disabled while running), so nothing there changes. Not a REWORK.
- **FQ43 (FYI, no action).** In the installed `hono@4.13.7`, `createBunWebSocket` is marked `@deprecated` in favour
  of importing `upgradeWebSocket` / `websocket` directly from `hono/bun` (same objects — the factory just returns
  them). I used `createBunWebSocket` as SPEC-007 D1 / TASK step 1 name it; `tsc` is clean (a deprecation is a hint,
  not an error). Switching is a one-line change whenever you want the non-deprecated spelling.
  > answer (Sober, 2026-09-13): Noted, no action. D1 names the factory because SPEC-006 D1 did; the objects are the
  > same. If a later hono bump removes the factory, that is a one-line TASK step then, not now. No new SQ.
- **FQ44 (FYI, no action).** Abort-on-close maps to `ChainError("timeout", …)` (SPEC-006's own-abort kind, as
  TASK-024 noted) — it only reaches the log (`fail kind=timeout`), never a frame, because the socket is closed. If a
  distinct log kind for "client went away" is wanted later, that is a chain-side change, not WS.
  > answer (Sober, 2026-09-13): Noted, no action. The log line is content-free and never reaches a frame, so
  > `timeout` is an honest-enough label for "our own abort"; recorded in §Review so TASK-027's log reading is not
  > surprised by `fail kind=timeout` after a closed tab.

## Review

**Verdict: DONE — 2026-09-13, Sober.** Every DoD line re-run by me, zero real calls.

- **Read** `src/ws.ts`, `src/validate.ts`, `src/gateway/messages.ts`, `src/index.ts`, `scripts/ws-client.ts`,
  `test/ws.test.ts`, the step-0 change in `test/projects-md.test.ts`, the README section, and `src/chain/run.ts`
  for the abort path — against SPEC-007 §Frames / D1 / D2 / D9 / D11 and TASK steps 0–7. Order in `onMessage` is
  validate → busy → guard → `accepted` (busy checked before the cap point: a rejected `ask` never touches
  `guard`, the better reading of R6); `runChain` receives `accepted.id`, so the `[chain] id=` lines match the
  frame. `send` is gated on the raw Bun socket's live `readyState` — the WSContext snapshot would not do.
- **Re-run with `GATEWAY_BASE_URL=http://127.0.0.1:9` (dead port) on every command:** `bun test` **42 pass / 0 fail,
  175 expects, 5 files**; the eleven `ws.test.ts` names match the TASK's step-6 list (happy-path nine, off-topic,
  `stub:none`, `stub:fail@2` + retry on the same socket, `busy` with the first chain's `step 1 done` still arriving,
  close-during-slow → stub count stays 1 after 3 s, blank → `bad_request` with 0 gateway requests, extra key /
  non-`ask` / non-JSON → `bad_request` and the socket still usable, `POST /ask` unchanged, `index.ts` wires `/ws`).
  `bunx tsc --noEmit` → 0. `grep "from \"hono"` over `src/chain src/knowledge src/gateway` → 0 hits.
  `grep "ai.develyst.online" src` → `config.ts:48` only. No `.env*`. `git status` = `?? back/`.
- **Own run** (stub on **3998**, back on **3012**, `KNOWLEDGE_DIR` = fixtures): `/health` `profile:true, projects:true`;
  `ws-client "Can you build a realtime site with WebSocket?"` → exactly the nine frames, `coverage:"covered"`,
  `calls:3`; `"… stub:none"` → `coverage:"none"`, `citations:[]`; stub killed → `accepted`, `step 1 started`,
  `error unreachable at_step 1`, `done`. My own three-frame probe: `"not json"`, `{ask, question, provider}` and
  `{ask, question:"   "}` each → `bad_request at_step 0`, socket open throughout. Back log lines carry id / kind /
  tokens / lengths only — no question, excerpt or answer text.
- **Real `knowledge/` dir (no `PROFILE.md` yet):** `/health` `profile:false`, one `[knowledge] missing` warn line,
  `ask` → `accepted` → `error knowledge_missing at_step 0` → `done` — D5 as designed. This is the state TASK-021 ends.
- **Zero requests reached `https://ai.develyst.online` in this review. REQ-007 ledger `0 / 30` (Q49 answered today,
  SPEC-007 §Call ledger opened); SPEC-006's 3 / 5 untouched.**
- FQ42 accepted and folded into SPEC-007 §Frames (answer above). FQ43 / FQ44 noted, no action.
- Ports 3998 / 3012 were mine and are freed; 3000 never touched; all my processes killed.
- **Consequence:** TASK-026 is startable now (its only gate was this DONE). TASK-027 stays BLOCKED on TASK-021's
  `PROFILE.md` + TASK-026.
