# TASK-006: Back — AI endpoints (S1, S2, G1) + the stand-in gateway (P1, P2)
- Source: SPEC-002 (§API rows S1, S2, G1; §AI — gateway use; §Testability P1/P2) · `llm-gateway` skill §3–5
- Owner: BE (Jason)
- Status: DONE (2026-11-08, SA re-review after the rework; the real-DB boot is carried to TASK-003 steps 6–7)
- Depends on: TASK-004
- Git: none by you. **No call to the live gateway, ever, in this TASK** (REQ-001 Out of Scope, D11).

## What to do
**A. Stand-in** (workspace, not a product repo): `god-plan/ai-worker/tests/harness/gateway-stub/server.ts`, `README.md`.
Exactly as SPEC-002 §Testability P1/P2: port 4399; `mode.txt` read on every request (`ok`, `500`, `hang`, `empty`, `malformed`;
missing file = `ok`); `calls.jsonl` appended per request; `GET /calls`, `DELETE /calls`.
**B. Back** files (closed list): `src/ai/gateway.ts`, `src/ai/guards.ts`, `src/ai/prompts.ts`, `src/ai/routes.ts`, `src/app.ts`
(mount), `test/api.ai.test.ts` (mock `fetch`, never the network).
- Only the inputs listed in SPEC-002 §AI go into a prompt. **Never comments, never a user's name or email** (AC-12).
- Timeout 25 s, no retry, no auth header, no logging of bodies.
- S1 never calls the gateway. S2 stores, replacing the old summary. G1 writes nothing.
- Guards: per-project in-flight → 429 `AI_BUSY`; > 10 presses per user per 60 s → 429 `RATE_LIMITED`.

## Definition of Done
- [ ] `bun test` → all pass, with: gateway 500 / `success:false` / empty content / malformed / abort after the timeout →
      502 `AI_UNAVAILABLE` and no row changed (AC-8) · G1 parses a fenced JSON array, drops empty items, caps 20 · S1 makes 0
      fetch calls (AC-11) · second concurrent S2 on a project → 429 `AI_BUSY` · 11th press in 60 s → 429 `RATE_LIMITED` ·
      a comment, invitee name and email each containing `MARKER-X1` → the recorded fetch bodies have 0 hits (AC-12). Paste the output.
- [ ] With the stub running and `LLM_GATEWAY_URL=http://127.0.0.1:4399`: one G1 and one S2 by curl as the synthetic owner, then
      `curl -s 127.0.0.1:4399/calls | head -c 600`. Paste (cookie redacted). Then `echo hang > mode.txt` and time one S2:
      `curl -w '%{time_total}'` → 502 in under 30 s. Paste.
- [ ] `grep -rn "ai.develyst.online" <repo> god-plan/ai-worker/tests/harness/gateway-stub` → 0 hits. Paste.

## Implementation Notes
**Done (Jason, 2026-11-08).** Back on PGlite + a mocked `fetch`; the stand-in run over real HTTP. No call to the live gateway anywhere. Repo `god-plan-back`, branch `atom`, nothing committed.

Files. Workspace: `tests/harness/gateway-stub/server.ts`, `README.md`. Back: `src/ai/{gateway,guards,prompts,routes}.ts`, `src/app.ts` (mount, `AppDeps` + `llmGatewayUrl`, optional `aiTimeoutMs`), `test/api.ai.test.ts` (29 tests; the 9 failure modes are generated in a loop). **Outside the closed list, needed:** `src/index.ts` passes `llmGatewayUrl` and sets **`idleTimeout: 30`**; 2 `createApp` calls in `test/api.core.test.ts` and 1 in `test/api.links.test.ts` got the new required dep.

Evidence:
```
$ bun test
 76 pass
 0 fail
 552 expect() calls
Ran 76 tests across 4 files.        (8 schema + 23 core + 16 links + 29 ai)
$ bun x tsc --noEmit → no output, exit 0
$ grep -rn "ai.develyst.online" <back src/test/scripts/README/.env.example> gateway-stub → no match (exit 1)
$ grep -rn "console\." src/ai → no match
```
DoD cases, each its own test: 500 · `success:false` · 201 (only 200 counts) · empty / blank content · content not a string · no `data` · body not JSON · network error · abort after the timeout (50 ms in the test, a second test cuts a body that never finishes) → all **502 `AI_UNAVAILABLE`**, the same body for S2 and G1, `ai_summaries` row (content and `createdAt`) and task count unchanged, and the **next press works** (the flag was released). G1: fenced ```` ```json ```` and bare ```` ``` ```` arrays, plain array, empties/non-strings dropped, titles trimmed and cut to 200, capped at 20; not an array / `[]` / all-empty / prose / broken fence → 502; G1 writes nothing. S1: **0 fetch calls** (also after a summary exists), stuck list from `tasks`, invitee allowed, non-member 404. Concurrent S2 → **429 `AI_BUSY`** (S2 and G1 share the project's flag; another project is free; the refused press never reaches the gateway). **11th press → 429 `RATE_LIMITED`**, per user, G1 counts in the same window, 403/404 presses do not count; the 60 s window slides (test with an injected clock). **AC-12:** `MARKER-X1` put in two comments, the invitee's display name and the owner's email (and read back from the API first, so it is really there) → the recorded fetch bodies have 0 hits, and no `@godplan.test`; the S2 prompt is asserted line by line (name, then `- title — status[ — เหตุผล: reason]`). Request shape asserted: `POST <url>/chat`, only a `content-type` header (no auth), no `provider`/`model`, `temperature` 0.3, `max_tokens` 600 (S2) / 800 (G1), an abort signal. No prompt, answer or error text reaches the log or the response (test).
**Mutation checks (restored after):** S2 not releasing the project → 5+ failures; limit `>=` → `>` → the 11th-press test and the window test fail.

Stand-in over real HTTP (stub on 4399 + the real app via `Bun.serve` on 4310, **PGlite in memory** because the dev DB does not exist yet, synthetic owner; cookie not shown; ids shortened):
```
G1 (ok)  → {"proposals":[{"title":"ออกแบบหน้าจอ"},{"title":"เขียน API"},{"title":"ทดสอบระบบ"},{"title":"เตรียมข้อมูลตัวอย่าง"},{"title":"สรุปผลการทำงาน"}]}
S2 (ok)  → {"stuck":[{"taskId":"…","title":"ออกแบบ","stuckReason":"รอข้อมูล"}],"ai":{"content":"โปรเจกต์คืบหน้าไปได้ดี …","createdAt":"2026-11-08T07:15:13.625Z"}}
$ curl -s 127.0.0.1:4399/calls | head -c 300
{"count":2,"calls":[{"at":"2026-11-08T07:15:13.615Z","body":{"temperature":0.3,"max_tokens":800,"messages":[{"role":"system","content":"คุณเป็นผู้ช่วยวางแผนงาน ตอบเป็น JSON array …
$ echo hang > mode.txt ; curl -w 'http=%{http_code} time_total=%{time_total}s' -X POST …/summary
http=502 time_total=25.007045s   {"error":{"code":"AI_UNAVAILABLE"}}      (G1 in hang: http=502 time_total=25.010636s)
mode 500 → 502 · mode empty → 502
```
**A real bug found by the hang run and fixed:** Bun's default `idleTimeout` is 10 s, so my first hang run dropped the connection (`http=000` after 12 s) while the AI call was still waiting; the three presses after it got 429 `AI_BUSY` because the dropped request was still in flight. `src/index.ts` now sets `idleTimeout: 30`; the re-run above shows 502 at 25.0 s. (The scratch server I used mirrors that option; `src/index.ts` itself was **not** started here, because it needs `DATABASE_URL` — `UNVERIFIED` until TASK-001.)

Decisions (mine, reversible):
1. **Stub mode `malformed` (content `not json [`) breaks G1 only.** For S2 any non-empty text is a valid summary, so S2 stores it (seen: mode malformed → S2 200). I read the DoD's "malformed" as a malformed *gateway response* (body not JSON, no `data`, wrong types), which is tested for both endpoints.
2. Stuck list order (S1/S2): `created_at` asc, then id — the same order as the project page. SPEC says "oldest first" only.
3. Checks run in this order: session 401 → visible 404 → (G1) owner 403 → guards 429 → gateway. S2 with no tasks still calls the gateway.
4. The system prompt of G1 contains the word "JSON" (the stand-in keys on it); S2's does not. Prompt wording is mine; only the inputs are fixed by the SPEC.
5. `aiTimeoutMs` is an optional `createApp` dep (default 25 000) used only by tests.
6. The stub answers `hang` after 40 s with a normal reply; unknown `mode.txt` values answer HTTP 500 `stub: unknown mode` (loud, not silently `ok`).

`UNVERIFIED`: the real gateway's wording quality and its real response (D11, the owner's yes); `src/index.ts` booting against the real database; guard behaviour with more than one process (in-memory, by design). `/security-review` not run (untracked tree). My read: prompts hold only the allowed fields; the gateway URL comes from env; no auth header; user-controlled text (project and task titles) goes to the gateway by design, so a prompt-injection can only change the text of a summary or proposal, never write data (G1 writes nothing; S2 stores text only).

**Rework (Jason, 2026-11-08, one item as ruled in §Review).** `gateway-stub/server.ts`: mode `malformed` now answers **HTTP 200 with the body `{"success":true,"data":`** (not valid JSON); `README.md` mode list updated. Decision 1 above is superseded for the stub: both S2 and G1 now fail on this mode; the old content-level case (`content: "not json ["`) stays covered by the unit tests. Nothing else changed; `src/` and `test/` untouched, so the 76-test result above still stands (not re-run: no file under `god-plan-back` changed).
```
$ echo malformed > mode.txt ; curl -s -i -X POST 127.0.0.1:4399/chat -d '{"messages":[]}' | sed -n '1p;$p'
HTTP/1.1 200 OK
{"success":true,"data":
(a previous summary exists, created in mode ok at 2026-11-08T07:22:09.093Z)
S2 → {"error":{"code":"AI_UNAVAILABLE"}} ← http=502
G1 → {"error":{"code":"AI_UNAVAILABLE"}} ← http=502
S1 after → identical to S1 before (cmp: no difference): same content, same createdAt
```
Same set-up as before: stub on 4399 + the real app on 4310 over **PGlite**, synthetic owner, ports freed and `mode.txt`/`calls.jsonl` deleted afterwards. Recorded as `F-006` in FAILURES.md (my side: I flagged the mismatch but shipped it instead of asking first).

## Questions

## Review
**REWORK — Sober (SA), 2026-11-08. One item, and the cause is my SPEC, not your build (F-005).** Everything else is accepted.
- Re-ran: `bun test` → 76 pass, 0 fail · `tsc` clean · `src/index.ts` has `idleTimeout: 30` with its reason. Read `src/ai/prompts.ts`:
  G1 sends name + description only. S2 sends name + `- title — status[ — เหตุผล: reason]`. No comment, no person's name or email (AC-12). ✓
- **The rework (one item):** stub mode `malformed` must now be **HTTP 200 whose body is not valid JSON** (e.g. `{"success":true,"data":`),
  per SPEC-002 §Testability as amended today. Then both S2 and G1 → 502 `AI_UNAVAILABLE` with nothing saved, which is what QA's AC-8 check
  expects. Update `gateway-stub/server.ts` (the `malformed` case) and `README.md` (the mode list). **DoD for this item:** with the stub on
  `malformed`, one S2 and one G1 by curl → both `http=502 {"error":{"code":"AI_UNAVAILABLE"}}`. Then S1 shows the previous summary
  unchanged. Paste. Your decision 1 was the right flag. The old content-level case stays covered by your unit tests.
- **The idleTimeout fix:** a real bug, found by actually running the hang mode. Accepted, and good catch. SPEC-002 §Non-functional notes it.
- Decisions 2–6 accepted. Files outside the list (`src/index.ts`, the extra `createApp` calls in two test files) accepted.
- Your prompt-injection read is accepted: model output can only become proposal text (the owner saves it himself) or summary text. It is rendered as text.
- Carried forward, `UNVERIFIED`: `src/index.ts` booting on the real DB (TASK-001 → TASK-003 steps 6–7). Live wording (D11, the owner's).

**Re-review after the rework: DONE — Sober (SA), 2026-11-08.**
- `server.ts` `malformed` → `new Response('{"success":true,"data":', { status: 200 })`. The README is updated.
- **I ran it myself:** started the stub with `timeout 6`, set `malformed`, and `POST /chat` → body `{"success":true,"data":` `http=200`. The stub
  stopped on its own. I removed `mode.txt` (there was none before) and `DELETE /calls` emptied `calls.jsonl` (scratch, synthetic).
- `bun test` → 76 pass, 0 fail. Your S2/G1 → 502 with S1 byte-identical evidence is accepted.
- Your F-006 is noted. The root cause is mine (F-005).
