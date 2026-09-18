# TASK-022: Scaffold `back/` — the one gateway operation, its failure classes, routes, stub and tests (NO real call)
- Source: SPEC-006
- Status: DONE (2026-09-13, Sober — see §Review; FQ37/FQ38 answered in §Questions)
- Depends on: none
- Owner: Fern (FE)

## What to do

Read SPEC-006 first — §Observed contract is the truth about the gateway (two real calls
already recorded; **you fire none in this task**). Build under `back/` in
`portfolio-nichaphon-web` (path in workspace-root `machine.local.md`; `back/` is empty
today). Bun 1.3.14 is on this machine.

1. **Project files.** `back/package.json` (`name: portfolio-back`, `version: 0.1.0`,
   `type: module`, scripts `dev` = `bun run --hot src/index.ts`, `start` = `bun run
   src/index.ts`, `test` = `bun test`, `stub` = `bun run test/stub-gateway.ts`; deps
   `hono ^4.6.0`; devDeps `@types/bun`), `back/tsconfig.json` (copy the gateway's shape:
   ESNext, bundler resolution, strict). Do **not** add a `.env` or `.env.example` (SPEC-006 D4).
2. **`src/config.ts`** — reads env with the defaults in SPEC-006 §Config; exports a typed,
   frozen object. The base URL default `https://ai.develyst.online` lives here and nowhere
   else in `back/`.
3. **`src/gateway/types.ts`** — exactly the types in SPEC-006 §Internal operation.
4. **`src/gateway/classify.ts`** — `classifyFailure(input)` pure function implementing the
   SPEC-006 §Classification table, in that order.
5. **`src/gateway/ask.ts`** — `askGateway(messages, opts?)`: one `fetch` to
   `${GATEWAY_BASE_URL}/chat` with the body in SPEC-006 (no provider/model/tier unless
   `GATEWAY_PROVIDER` is set), `AbortController` at `GATEWAY_CLIENT_TIMEOUT_MS` combined
   with `opts.signal`, measures `wall_ms`, returns `GatewayAnswer` or throws `GatewayError`
   via `classifyFailure`. **This file must import nothing from `hono`** (SPEC-006 D1).
6. **`src/gateway/log.ts`** — the two one-line formats in SPEC-006 §Flow 3–4. Never log
   message content; lengths only (D9).
7. **`src/limits.ts`** — `export function guard(clientKey: string): void {}` with a comment
   naming it as REQ-007 R6's single cap point. No counting.
8. **`src/index.ts`** — Hono app on `PORT`: `GET /health` and `POST /ask` exactly as
   SPEC-006 §HTTP routes (validation → `guard` → dev-placeholder system prompt → `askGateway`
   → status map → log). The placeholder system prompt is one sentence, clearly commented as
   *dev placeholder, replaced by SPEC-007, never shown to a visitor*. `POST /ask` must not
   accept `messages`, `provider`, `model`, headers or anything but `question`.
9. **`test/stub-gateway.ts`** — SPEC-006 §Stub, all six modes, `x-stub-mode` header;
   listens on `process.env.STUB_PORT ?? 0` and prints its port. Exports a `startStub()` for
   tests and runs standalone under `bun run stub`.
10. **`test/classify.test.ts`** + **`test/ask.test.ts`** — with the stub started in-test:
    one named test for the happy path (asserts the call-2 shape round-trips into
    `GatewayAnswer`) and **one named test per kind**: `unreachable` (closed port),
    `timeout` (mode `hang`, `GATEWAY_CLIENT_TIMEOUT_MS` overridden to ~200 ms for the test),
    `quota`, `unknown_model`, `gateway_error` (mode `all_failed`), `bad_response` (mode
    `html`). Plus one `POST /ask` test for the 400 path.
11. **`back/README.md`** — what `back/` is (a client of the owner's gateway, no keys, no
    auth, no DB), the one command to run, the env table, how to run the stub and point
    `GATEWAY_BASE_URL` at it, and a one-line pointer to SPEC-006's call ledger with the
    rule "append a row before you fire". Do **not** touch the repo-root `README.md`,
    `docker-compose.yml` or any root script (SPEC-006 D10, PROTOCOL).

Nothing in `front/` changes. No git write, no deploy.

## Definition of Done
- [ ] `cd back && bun install && bun run dev` starts; `curl http://localhost:3001/health` → `{"ok":true,...}` and the response contains no URL.
- [ ] `cd back && bun test` → all green; the run lists, by name, the happy path + all six kinds + the 400 path (paste the summary line in §Implementation Notes).
- [ ] `grep -rn "from \"hono" back/src/gateway/` → no hits.
- [ ] `grep -rn "ai.develyst.online" back/src` → exactly one hit, in `src/config.ts`.
- [ ] `POST /ask` against the stub (`GATEWAY_BASE_URL=http://127.0.0.1:<stub port> bun run dev`) with `{"question":"Say OK."}` → `200 {"ok":true,"answer":{...provider:"deepseek",model:"deepseek-flash"...}}`; paste it.
- [ ] Log lines for one success and one failure pasted; they contain no question text.
- [ ] **Zero requests reached `https://ai.develyst.online`** — state it in §Implementation Notes in those words. SPEC-006's ledger still reads 2 / 5.
- [ ] `back/README.md` exists; root `README.md` byte-identical to `1dcc9b8` (`git diff --stat -- README.md` empty).
- [ ] No `.env*` file created under `back/`.

## Implementation Notes

**Fern, 2026-09-13.** **Zero requests reached `https://ai.develyst.online`** — every run below had
`GATEWAY_BASE_URL` pointed at the local stub or a closed port; `bun test` sets it in `beforeAll`
before any `askGateway` call; the classify tests do no network at all. SPEC-006's ledger still reads
**2 / 5**. `H:\chipint\develyst-ai\.env` was not opened; only its `tsconfig.json`, `package.json`
and `src/index.ts` were read for shape.

**Files created (all new, all under `back/`, CRLF by bytes like the rest of the tree; nothing in
`front/` or at the repo root changed; `git status` = `?? back/` only):**
`package.json` · `tsconfig.json` · `bun.lock` (written by `bun install` — hono **4.13.7**,
`@types/bun` **1.4.2**) · `README.md` · `src/config.ts` · `src/limits.ts` · `src/index.ts` ·
`src/gateway/{types,classify,ask,log}.ts` · `test/{stub-gateway,classify.test,ask.test}.ts`.
No `.env*` under `back/`. `back/node_modules/` is git-ignored by the root `.gitignore`.

**Shape, and the four places I made a call the TASK left open (all reversible):**
1. `config.ts` exports a **frozen object whose properties are getters** reading `process.env` on
   access (not cached at import). Reason: item 10 asks the tests to override
   `GATEWAY_CLIENT_TIMEOUT_MS` to ~200 ms and re-point `GATEWAY_BASE_URL` at the stub / a closed
   port per test; a snapshot at import would force dynamic re-imports. Same defaults as §Config.
2. `classifyFailure(input)` takes `{phase:"fetch", error, aborted}` or `{phase:"response", status,
   bodyText}` and returns a `GatewayError` — or **`null` for a valid 2xx body** (the table has no row
   for "not a failure"; `ask.ts` treats `null` as success).
3. `POST /ask` **rejects any key other than `question` with 400** ("must not accept `messages`,
   `provider`, `model`… or anything but `question`" read as reject, not ignore) — FQ38 below.
4. `tsconfig.json` copies the gateway's shape plus `noEmit` + **`skipLibCheck: true`** (bun-types
   1.4.2 fails `tsc` on its own `.d.ts` without `@types/node`; the gateway never runs `tsc`) and
   `include` also covers `test/**`. `bunx tsc --noEmit -p tsconfig.json` → exit 0.
Also: `ask.ts` has the SPEC's allowed test-only `opts.headers` passthrough (for `x-stub-mode`);
`index.ts` never sets it. `ask.ts` imports only `../config`, `./classify`, `./types`. Client IP for
`guard()` comes from `getConnInfo` (`hono/bun`) in `index.ts`, `"unknown"` when there is no socket
(`app.request()` in tests). The server starts only under `import.meta.main`, so the test can import
`app` without listening. `latency_ms` falls back to `0` if the gateway ever omits it. The startup
console line prints the configured gateway base URL (stdout only — no response carries a URL).

**Evidence — DoD, in order:**
- `cd back && bun install` → 5 packages · `bun run dev` → `[back] portfolio-back 0.1.0 listening on
  http://localhost:3001 …` · `curl -i http://localhost:3001/health` → `HTTP/1.1 200` body
  `{"ok":true,"service":"portfolio-back","version":"0.1.0"}` — no URL in it. Port 3001 was free
  before (netstat: no listener) and is free again after.
- `bun test` → **`18 pass / 0 fail / 74 expect() calls — Ran 18 tests across 2 files. [267.00ms]`**.
  Named (from the junit reporter): `happy path: the recorded call-2 shape round-trips into
  GatewayAnswer` · `kind unreachable: closed port` · `kind timeout: stub mode `hang`, client
  deadline 200 ms` · `kind quota: stub mode `quota`` · `kind unknown_model: stub mode
  `unknown_model`` · `kind gateway_error: stub mode `all_failed`` · `kind bad_response: stub mode
  `html` (Cloudflare 502 page)` · `400 path: empty, too long, non-string, extra keys, bad JSON — no
  network` · plus 10 `classifyFailure` row tests incl. the quota-before-unknown_model order.
- `grep -rn "from \"hono" back/src/gateway/` → no hits (exit 1).
- `grep -rn "ai.develyst.online" back/src` → exactly one: `back/src/config.ts:41`. (Whole `back/`
  excluding `node_modules`: the same single hit.)
- Stub on `STUB_PORT=3999`, `GATEWAY_BASE_URL=http://127.0.0.1:3999 bun run dev`, `POST /ask`
  `{"question":"Say OK."}` → `HTTP/1.1 200` body
  `{"ok":true,"answer":{"content":"OK","provider":"deepseek","model":"deepseek-flash","usage":{"prompt_tokens":14,"completion_tokens":1,"total_tokens":15},"latency_ms":636,"wall_ms":70}}`.
  Re-pointed at closed port 3998 → `HTTP/1.1 503` `{"ok":false,"kind":"unreachable","message":"The AI gateway could not be reached."}`.
  400 samples: `{"question":"hi","provider":"openai"}` → `Body must contain only `question`.`;
  `{"question":""}` → ``question` must be 1 to 2000 characters.`
- Log lines, verbatim, no question text:
  `[gateway] ok provider=deepseek model=deepseek-flash tokens=14/1/15 latency_ms=636 wall_ms=70 q_len=7 a_len=2`
  `[gateway] fail kind=unreachable status=- wall_ms=118 detail="Error: Unable to connect. Is the computer able to access the url?"`
- `back/README.md` exists; `git diff --stat 1dcc9b8 -- README.md` → empty (root README byte-identical).
- No `.env*` under `back/` (`find` → none).

**Machine notes (declared, not acted on):** port 3000 is held by the human's `next start-server`
(PID 17120) — untouched. A foreign `bun run dev` (PID 280, parent = a VS Code bash, listening on
nothing) exists — not mine, untouched. All processes I started were stopped; `tasklist` shows no
bun of mine. No git write, no deploy, nothing outside `back/`.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

**FQ37 (non-blocking, Fern 2026-09-13) — whitespace-only question.** SPEC §Flow 5 says 1–2000 chars
→ I check `question.length` only, so `"   "` passes validation and would spend a real call. Should
`POST /ask` also 400 a whitespace-only string (a trim check), or is the literal rule intended? Shipped
literal; one-line change either way.

**FQ38 (non-blocking, Fern 2026-09-13) — extra keys → 400, or ignore?** I read "must not accept
`messages`/`provider`/`model`… or anything but `question`" as *reject the body* (400 `Body must contain
only `question`.`). If you meant *silently ignore*, say so and I drop the key check.

> answer (FQ37, Sober 2026-09-13): **Trim it — a whitespace-only question is a 400.** The gap is in my
> own SPEC-006 §Flow 5 wording (now amended to "after `trim()`"), and I reproduced it myself: `{"question":"   "}`
> against the stub returned 200 and would have spent a real call. Not a REWORK for one pre-network line:
> it is **TASK-023 step 0** — add the trim check + one body in the existing 400-path test, `bun test` green,
> *before* ledger row 3 is touched. Rule: 400 when `question.trim().length === 0`; the 1–2000 rule stays
> on the raw length; send the string as received (no silent rewriting of what the caller sent).

> answer (FQ38, Sober 2026-09-13): **Reject stands — 400 on any key other than `question`.** That is D7's
> meaning: `POST /ask` is not a proxy, and a silently dropped `messages`/`provider` would hide a caller's
> mistake instead of surfacing it. I verified the rejection myself (`{"question":"hi","provider":"openai"}`
> → 400 `Body must contain only `question`.`). No change.

## Review

**Verdict: DONE (Sober, 2026-09-13).** Reviewed every file under `back/` line by line against SPEC-006,
then re-ran the DoD myself — with `GATEWAY_BASE_URL=http://127.0.0.1:9` exported for every command so
nothing could reach production even if a test had forgotten to set it. **Zero requests reached
`https://ai.develyst.online` during this review; the ledger still reads 2 / 5.**

What I re-ran, in DoD order:
- `bun test` → **18 pass / 0 fail / 74 expect()** (463 ms); junit names checked: happy path + `unreachable`
  · `timeout` · `quota` · `unknown_model` · `gateway_error` · `bad_response` + the 400 path, and 10
  `classifyFailure` row tests incl. the quota-before-unknown_model order. 0 `<failure>` elements.
- `grep -rn "from \"hono" back/src/gateway/` → none (exit 1). `grep -rn "ai.develyst.online" back/src`
  → exactly `src/config.ts:41`; same single hit across all of `back/` minus `node_modules`.
- No `.env*` under `back/`. `git diff --stat 1dcc9b8 -- README.md` → empty; `git status` = `?? back/` only.
- `bunx tsc --noEmit -p tsconfig.json` → exit 0. Lock: hono **4.13.7**, `@types/bun` **1.4.2**.
- Runtime, my own processes: stub on 3997, `back/` on 3001 pointed at it. `GET /health` → 200
  `{"ok":true,"service":"portfolio-back","version":"0.1.0"}` (no URL). `POST /ask` `{"question":"Say OK."}`
  → 200, `provider:"deepseek"`, `model:"deepseek-flash"`, usage 14/1/15, `latency_ms:636`, `wall_ms:14`.
  Stub killed → `POST /ask` → **503** `{"ok":false,"kind":"unreachable",...}`. Log lines seen:
  `[gateway] ok provider=deepseek model=deepseek-flash tokens=14/1/15 latency_ms=636 wall_ms=14 q_len=7 a_len=2`
  and `[gateway] fail kind=unreachable status=- wall_ms=0 detail="Error: Unable to connect. ..."` — no
  question text in either. Ports 3001/3997 free before and after; the human's 3000 untouched.
- Two probes beyond the DoD: (1) a client-sent `x-stub-mode: quota` header on `POST /ask` is **not**
  forwarded — the stub still answered `ok` (SPEC §Stub "must not be reachable from `POST /ask`" holds);
  (2) `{"question":"   "}` → 200 — FQ37 confirmed real, answered above.

Fern's four open calls — all **accepted**: (1) lazy env getters — the right trade for per-test env
overrides, nothing reads config at import; (2) `classifyFailure` → `null` on a valid 2xx — the table had
no success row, `ask.ts` treats it correctly; (3) extra keys → 400 — FQ38 above; (4) `skipLibCheck` —
`tsc` is not in the DoD and the reason (bun-types 1.4.2 vs `@types/node`) is documented in the notes.

Non-blocking notes, no action asked: `package.json` has `"@types/bun": "latest"` — reproducible only
while `bun.lock` travels with `back/` (it does; it is the human's to commit together). `latency_ms`
falls back to 0 when absent — fine for display, TASK-023's paste will show the real one.

**Consequence:** TASK-023 is unblocked and now carries **step 0** (the FQ37 trim line). SPEC-006 §Flow 5
amended. REQ-006 stays `IN_SPEC` until TASK-023 is `DONE`.
