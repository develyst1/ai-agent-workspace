# SPEC-110: A CAW worker's commands cannot reach I-Space's own servers or carry their identity headers
- Source: REQ-113 (Team B only; no seam change)
- Status: DONE (2026-10-29 17:3x, Silver — SA, Team B) — TASK-125 DONE (rounds 1–3: D1–D7 + curl --connect-to/--resolve and same-family options refused)
- Origin: first written as SPEC-108 D8 (16:5x) for REQ-111's amendment. The owner withdrew the amendment and opened REQ-113
  (`DECISIONS.md` 17:0x), so the design moved here unchanged except for the wording, which is now REQ-113's.
- Builds on SPEC-108 (D1–D5: the command policy in the read-guard hook, `caw-back → src/runner/bash-policy.ts`), as committed with REQ-111.

## What exists (read and run, 2026-10-29 16:5x)

- `judgeNetwork` (`caw-back → src/runner/bash-policy.ts:218-237`) allows `curl`/`wget` to any port on `127.0.0.1` / `localhost` / `[::1]`, with any header.
- Base run through the real hook (`bun src/runner/read-guard.ts '["<root>"]'`): TEST-108 Q1's four calls (CAW mode, accept proposal,
  workspace, Blueprint versions) → `exit 0` (allowed); `curl -s http://127.0.0.1:3900/` → `exit 0`.
- The runner knows `CAW_API_URL` (`caw-back → src/runner/config.ts:42`, `apiUrl`, default `http://127.0.0.1:4500`). `BLUEPRINT_URL`
  and `BLUEPRINT_WEB_URL` are in caw-back's `.env` (`SYSTEM-FACTS.md` § Environment), which Bun loads for the runner too.

## Design `[SA-decided]` unless marked; each cheap to reverse

- **D1 — Ports from the config, never a fixed list** (REQ-113 req 1, AC-3). `RunnerConfig.serverPorts` = the `host:port` of
  `CAW_API_URL`, `BLUEPRINT_URL` (default `http://127.0.0.1:4200`), `BLUEPRINT_WEB_URL` (default `http://127.0.0.1:3100`), plus `127.0.0.1:3500`
  (caw-front's default; caw-back has no variable for it). A URL with no port → 80/443 by scheme. `Interpreted`: the two **web** servers
  act as the operator through their server actions, so they are fenced with the APIs. REQ-113 names the API ports; without the webs
  its goal ("cannot act as the operator") has a side door.
- **D2 — Refuse by port.** `curl`/`wget` to a local host whose port is in `serverPorts` → code **`api`**, detail `<host>:<port>`.
  `localhost`, `127.0.0.1` and `[::1]` count as the same host. Every other local port stays open (REQ-113 req 3, AC-2).
- **D3 — Refuse by header.** Any command word containing `x-caw-actor` or `x-blueprint-by` (case-insensitive) → code `api`, for any
  program (REQ-113 req 2).
- **D4 — Soft, like REQ-111.** The hop goes on (SPEC-108 D4). Model text (stderr): `caw-refused api: <detail> is one of I-Space's own
  servers — a worker acts on CAW only through its MCP tools`. Hop note reason = **REQ-113's wording, exactly**:
  `worker เรียก API ของ CAW หรือ Blueprint ตรง ๆ ไม่ได้ — ใช้เครื่องมือของ CAW แทน`.
- **D5 — Hook contract.** `read-guard.ts` takes an optional **third** argument, a JSON list of `host:port` strings (missing = none).
  `withReadGuard(base, readable, readOnly = [], serverPorts = [])` passes `'[]'` as the 2nd argument when only ports are given.
- **D6 — A local port must be written plainly** (REQ-113 AC-5, TEST-109 DEF-1; added 2026-10-29 17:3x). For a target on a local host,
  the port must match `^[1-9][0-9]{0,4}$` and be ≤ 65535; anything else (`04500`, `004500`, `99999`, `0`) → refused, code `api`,
  detail `unclear port "<as written>"`. Then it is compared **as a number** against the ports of `serverPorts` (any local name ↔ any
  local name). Why not compare the text: curl reads `04500` as 4500 (QA's echo server, TEST-109 1d).
- **D7 — A header the check cannot read is refused** (AC-5). curl `-H` / `--header` / `--proxy-header` whose value starts with `@` (also
  attached: `-H@f`, `--header=@f`) → `api`, detail `header from a file`. curl `--variable` and any `--expand-…` option (they build
  values from files or env) → `api`. wget `--config` / `--config=…` → `network` (a wgetrc can set any header; same family as wget `-e`, already
  refused). Already refused and kept: curl `-K` / `--config`, wget `-e` / `-i`, `$` anywhere (env expansion), `{ }` (curl `{{var}}`).
- **D8 — curl options that move where it connects are refused** (TASK-125 review round 3): `--connect-to`, `--resolve`, `--unix-socket`, `--abstract-unix-socket`, `--socks*`, `--preproxy`, `--doh-url`, every form → `network`, detail = the option. With them a request written to :3900 could land on :4500.
- **Why not an allow-list of ports** (the PM allowed it): "ports the worker itself started" cannot be read from a command's words, and a
  project has no declared ports today. The host side already is an allow-list (only `127.0.0.1` / `localhost` / `[::1]`; every other
  name, the box's own hostname and IP included, is `network`, TEST-109 1b). D6 makes the port side fail closed.
- **Limit (REQ-113 Out of Scope):** a program the worker writes and runs can still reach those ports. Only a login closes that.

## API / Interface Design

No HTTP shape changes. The hook's argument list grows (D5).
Consumers: `grep -rn "withReadGuard\|runGuardCli\|judgeBash" src test` → `caw-back → src/runner/settings.ts` (builder), `src/runner/hop.ts`
(caller), `src/runner/read-guard.ts` (CLI), `src/runner/bash-policy.test.ts`, `src/runner/read-guard.test.ts`, `src/runner/settings.test.ts`,
`src/runner/hop.test.ts` — all in TASK-125's list. `RunnerConfig`: `grep -rn "RunnerConfig\b" src` → `src/runner/config.ts:10`,
`src/runner/hop.ts:7,42`; tests build configs (`config.test.ts`, `hop.test.ts`, `main.test.ts`). The field is optional so those stay
unchanged (TASK-125 step 1).

## Tasks

- TASK-125: caw-back — `serverPorts`, refuse by port and by header, code `api`, the PM's reason — owner: BE Bob (depends on: REQ-111 committed)

## AC → work

| AC | Where |
|---|---|
| AC-1 four calls refused, hop goes on | TASK-125 (D2–D4) |
| AC-2 own port works | TASK-125 (D2) |
| AC-3 changed ports still refused | TASK-125 (D1) |
| AC-4 regression | TASK-125 (suite; REQ-111 tests) |

## Questions

None. (Web ports: `Interpreted` in D1, reversible.)
