# TEST-109: CAW workers cannot act as the operator — API ports and identity headers refused
- Team: B (CAW, SA Silver) · TASKs: TASK-125
- Source REQ: REQ-113 (ACs tested: AC-1 … AC-4; design carried over from TEST-108 § Round 2)
- Status: **TEST_PASSED** (round 2, 2026-10-29 17:50, Tanya — DEF-1 fixed; DEF-2 MINOR open; § Round 2) · round 1: TEST_FAILED 17:25 (DEF-1, MAJOR, security).
- Build under test: `caw-back` 80e3e88 (REQ-111 commit) + Team B's working-tree changes, fp `54269c3053be` (10 files, all `src/runner/*`).
  Built as a clean HEAD export + `git diff HEAD`; unchanged at 17:2x.
- Surfaces: the real read-guard hook (as Claude Code runs it, with the runner's real port list) · the real runner + QA stub · real `curl` 8.14.1 against QA's own echo server
- Designed and tested: 2026-10-29 17:11–17:25 by Tanya (created with `new-id.mjs`)

## Scope and instruments

- **The hook** (`tests/harness/test-109/hook-api-cases.mjs`, 34 cases). The third argument is the runner's own port list from
  `serverPortsOf` (config.ts): default `["127.0.0.1:3500","127.0.0.1:4500","127.0.0.1:4200","127.0.0.1:3100"]`; moved by env
  `["127.0.0.1:3500","127.0.0.1:4510","localhost:4210","127.0.0.1:3110"]`. caw-front's 3500 is in the list, so the front is covered too.
- **Real `curl`** against QA's echo server on :4561 (replies with the headers it got). It proves what curl really sends for a command the
  hook allowed. CAW and Blueprint themselves were never called.
- **The runner** (`runner-api.ts` + `test-108/qa-claude.ts` mode `api`): the soft refusal and its words, and the ports the runner writes into the hook.
- Out of scope, as REQ-113 says: a worker's own script calling the API (`bun run x.ts`; TEST-108 Q2, needs a login → REQ-109).
- Chat hops: they deny `Bash` outright (`hop.ts:202,217`), so their empty port list does not matter.

## Results

| # | AC | Actual | Result |
|---|---|---|---|
| 1 | AC-1 | TEST-108 Q1's calls (mode/budget, accept, workspace roots, Blueprint versions, change-sets) → all `caw-refused api` | PASS (as written) |
| 1b | AC-1 | other spellings refused: `localhost:4500`, `[::1]:4500`, `127.0.0.1:4500` without scheme, `--url`, `wget`, :4200, :3100, :3500 → `api`; `127.1`, `0.0.0.0`, `127.0.0.2`, `2130706433`, `[::ffff:127.0.0.1]` → `network`; lower-case header, `--header`, `wget --header=` → `api`; `curl -K cfg` → `network`; `printf 'X-CAW-Actor: operator' > h2.txt` → `api` | PASS |
| 1c | AC-1 (runner) | a refused API call → hop `commented`; note "คำสั่งนี้ทำไม่ได้: worker เรียก API ของ CAW หรือ Blueprint ตรง ๆ ไม่ได้ — ใช้เครื่องมือของ CAW แทน — ทำต่อด้วยวิธีอื่น" | PASS |
| **1d** | **req 1 + 2** | **allowed by the hook:** `curl http://127.0.0.1:04500/…`, `:004500`, `localhost:04200/…` (leading-zero port) · `curl -H @h.txt …`, `-H@h.txt`, `--header @h.txt` (header from a file) · **and together** `curl -H @h.txt http://127.0.0.1:04500/v1/proposals/X/accept`. Real curl: `04561` reaches port 4561, and `-H @h.txt` sends `X-CAW-Actor: operator` (echo server replied `{"path":"/v1/proposals/X/accept","xCawActor":"operator"}`) | **FAIL → DEF-1** |
| 2 | AC-2 | `curl -s http://127.0.0.1:3900/api/status`, `curl -I http://localhost:3900/`, `curl http://localhost:5173/` → allowed | PASS |
| 3 | AC-3 | moved ports: `127.0.0.1:4510`, `localhost:4510`, `127.0.0.1:4210`, `localhost:4210`, `127.0.0.1:3110` → `api`; the old 4500 is then allowed (it is not CAW any more) · runner: the hook it wrote carries the env ports (4551, the fake Blueprint's port, 3119) | PASS |
| 4 | AC-4 | TEST-108's 48 hook cases (R-19) on this build: 0 on the wrong side · caw-back `bun test` **826 / 1 skip / 1 fail**: the one fail is the known `execPath` "@" test (matches the SA's AC check); stub log 0 · MCP tools: the stub's worker-actor comment landed through the API (the MCP path itself is unchanged code) | PASS |

## Defects

### DEF-1 — a worker can still call CAW's API as the operator: a leading-zero port, plus a header from a file — MAJOR (security)
- Build: caw-back 80e3e88 + fp `54269c3053be`; the hook as the runner writes it (default ports).
- Repro (from a clean state; the hook alone, no CAW needed):
  1. A worker writes `h.txt` in its folder containing `X-CAW-Actor: operator`. Claude's Write tool is not checked for headers; only Bash is.
  2. It runs `curl -H @h.txt http://127.0.0.1:04500/v1/proposals/X/accept`.
  3. `bun read-guard.ts '<readable>' '[]' '<ports>'` with that command → **exit 0 (allowed)**.
  4. Real curl sends it to port 4500 with `X-CAW-Actor: operator` (shown against QA's echo server on 4561 with `04561`).
- Expected (REQ-113 req 1–2): a worker's command cannot reach CAW's or Blueprint's API port and cannot carry `X-CAW-Actor` / `X-Blueprint-By`.
- Actual: the port rule compares the written port with the list, so `04500` / `004500` are not seen as 4500. The header rule reads only
  inline header words, so `-H @file` / `--header @file` pass.
- Each half alone: `-H @h.txt` to a listed port is still refused by the port rule; `04500` without a header is refused by the API (no
  actor). Together they give full operator access, as TEST-108 Q1 described.
- Frequency: always. Evidence: `hook-api-cases.json` rows marked BAD; the echo replies above (this file, 1d).
(No fix proposed.)

## Observations (not ours)

- **O-1 — host tricks are refused as `network`, not `api`.** `127.1`, `0.0.0.0`, `127.0.0.2`, `2130706433`, `[::ffff:127.0.0.1]` are kept
  out by the network rule (not 127.0.0.1 / localhost / [::1]). Safe; the reason the worker reads is "network", not "API".
- **O-2 — the note gives two instructions back to back:** "…ใช้เครื่องมือของ CAW แทน — ทำต่อด้วยวิธีอื่น". REQ-113's reason sits inside
  REQ-111's sentence, which already ends in "ทำต่อด้วยวิธีอื่น". Wording only.

## Test data created

| What | Where | End state |
|---|---|---|
| hook folders, `h.txt` | session scratchpad `t109/hookdirs`, `tests/harness/test-109/h.txt` | left (`h.txt` holds a test header, no secret) |
| runner run root + DB | `/tmp/qa109-root-*` | left (tmp) |
| QA echo server :4561, API :4551, runner | this machine | stopped; `ss` 0 |

## Verdict

**`TEST_FAILED`.** AC-1…AC-4 pass as written: Q1's four calls, many other spellings, own ports, moved ports, the soft refusal, the 48-case
regression. But REQ-113's requirements 1–2 are not met: `curl -H @h.txt http://127.0.0.1:04500/…` is allowed and reaches CAW as the
operator (DEF-1). The hole REQ-113 exists to close is still open by that route.

## Evidence (decisive)

- `tests/harness/test-109/hook-api-cases.json` + the extra probe (this file, 1d): the hook allows the leading-zero and `@file` forms.
- The echo server's replies: real curl delivers `04561` to 4561 and sends the file's header.

## Questions

(none — DEF-1 is a defect against REQ-113's requirement text, not a reading question)

## Round 2 (2026-10-29 17:39–17:50) — after SA B's rework (SPEC-110 D6 ports as numbers, D7 header sources, D8 routing); REQ-113 AC-5 added

- Build: caw-back 80e3e88 + Team B's tree fp **`9ca932a8dab7`** (10 files), clean HEAD export + `git diff HEAD`; unchanged at 17:50.
- Evidence: `tests/harness/test-109/r2/` (`variations.mjs` / `variations.json`, `caw-back-test.txt`).

| # | AC | Actual | Result |
|---|---|---|---|
| R2-1 | regression | round 1's 34 cases: **0 on the wrong side** (DEF-1's `04500` and `-H @h.txt` now `api`); TEST-108's 48: 0 | PASS |
| R2-2 | AC-5 (as written) | `04500`, `004500`, `localhost:04200`, `localhost`, `[::1]` → `api`; `0.0.0.0`, the box's own hostname `grok-bot-vm-430905844` → `network`; `-H @h.txt`, `-H@h.txt`, `--header @h.txt` → `api`; `-K cfg.txt` → `network`; `"X-CAW-Actor: $ACTOR"` → `shell_feature`; **DEF-1's combined command** `curl -H @h.txt http://127.0.0.1:04500/v1/proposals/X/accept` → `api` | PASS |
| R2-3 | AC-5 (QA's own) | port / host: `0x1194`, `[::]`, `[0:0:0:0:0:0:0:1]`, `x@127.0.0.1:4500`, `127.0.0.1:4500@example.invalid`, `LOCALHOST`, `localhost.`, two URLs, `-:` → refused · header: no space after the colon, `-H @-` / `@/dev/stdin` from stdin, `--variable h@h.txt --expand-header '{{h}}'`, lower-case `x-blueprint-by` → refused · URL out of sight: `--variable u@u.txt --expand-url '{{u}}'`, `wget -i u.txt`, `wget --input-file=`, `--next` → refused · routing: `--connect-to` (both forms), `--resolve`, `--unix-socket`, `-x 127.0.0.1:4500` (the API as a proxy), `--preproxy`, `--proxy` → refused. **40 attack variations, 0 allowed** | PASS |
| R2-4 | AC-2 | own port: `curl -s http://127.0.0.1:3900/api/status`, `curl -L http://localhost:3900/`, POSTs with `-d '{"a":1}'`, `-d 'a=1'`, `-H 'content-type: application/json' -d …`, a query string → allowed. **But** `curl -s --json '{"a":1}' http://127.0.0.1:3900/api/x` → refused `network` (DEF-2) | PASS, with DEF-2 |
| R2-5 | AC-1 / AC-3 (runner) | soft refusal: hop `commented`, REQ-113's sentence in the note; the hook the runner wrote carries the env ports (4551, the fake Blueprint's port, 3119) | PASS |
| R2-6 | AC-4 | caw-back `bun test` **835 / 1 skip / 1 fail** (the known `execPath` "@" test); TEST-108's 48 hook cases unchanged | PASS |

### DEF-1 — fixed (round 2)
`04500` / `004500` / `localhost:04200` and `-H @file` / `--header @file` are refused; the combined command is refused (R2-2). With no
allowed bypass left, there was nothing to prove against the echo server this round.

### DEF-2 — `curl --json` to the worker's own port is refused — MINOR
- Build: caw-back 80e3e88 + fp `9ca932a8dab7`; the real hook, default ports.
- Repro: `curl -s --json '{"a":1}' http://127.0.0.1:3900/api/x` → `caw-refused network: "{'a':1}" reaches the network — only 127.0.0.1, localhost and [::1] are allowed …`.
- Expected (REQ-113 AC-2, req 3): a call to a port the worker started works.
- Actual: the policy does not know that `--json` takes an argument, so it judges the JSON body as a host. The same POST with `-d` passes.
- Workaround: `-d` (+ a content-type header). Frequency: always for `--json`.
(No fix proposed.)

### Verdict, round 2
**`TEST_PASSED`.** AC-1 … AC-5 pass. 40 bypass variations of QA's own and AC-5's list are refused at the real hook. DEF-1 is fixed. DEF-2 is MINOR,
with a workaround (`-d`). It is a defect for the SA's list; by the desk's severity table it does not stop delivery.
The verdict covers caw-back 80e3e88 + fp `9ca932a8dab7` only.
