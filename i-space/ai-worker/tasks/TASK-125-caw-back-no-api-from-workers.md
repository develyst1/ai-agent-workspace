# TASK-125: caw-back — a worker's commands never reach CAW's or Blueprint's servers, never carry their identity headers
- Source: SPEC-110 (REQ-113) — moved 2026-10-29 17:0x from SPEC-108 D8 / REQ-111's withdrawn amendment
- Owner: BE (Bob)
- Status: DONE (2026-10-29 17:3x, Silver — § Review round 3 verdict) · was REVIEW (Bob, round 3)
- Depends on: REQ-111 committed (80e3e88) in caw-back ✓

## What to do

Closed file list (caw-back): `src/runner/bash-policy.ts` · `src/runner/bash-policy.test.ts` · `src/runner/read-guard.ts` · `src/runner/read-guard.test.ts` ·
`src/runner/settings.ts` · `src/runner/settings.test.ts` · `src/runner/config.ts` · `src/runner/config.test.ts` · `src/runner/hop.ts` · `src/runner/hop.test.ts`. No git, no live run.

1. **`config.ts`** — `RunnerConfig` gains `serverPorts: string[]`: the `host:port` of `CAW_API_URL` (= `apiUrl`), `BLUEPRINT_URL` (default
   `http://127.0.0.1:4200`), `BLUEPRINT_WEB_URL` (default `http://127.0.0.1:3100`) and `127.0.0.1:3500` (caw-front's default, no variable).
   A URL with no port → 80 / 443 by scheme. A value that is not a URL → skip it and log one line (never crash the runner). Make the field
   optional in the type, or give every test config a value — your choice; say which.
2. **`bash-policy.ts`** — `Code` gains `"api"`. `judgeBash(command, cwd, readable, readOnly, serverPorts = [])`:
   - in `judgeNetwork`: a target whose host is local **and** whose port (explicit, or 80/443 by scheme, or 80 with no scheme) is in
     `serverPorts` → `{ code: "api", detail: "<host>:<port>" }`. Match `localhost`, `127.0.0.1` and `[::1]` as the same host.
   - before the per-command judging: any word (after quotes) containing `x-caw-actor` or `x-blueprint-by`, case-insensitive →
     `{ code: "api", detail: "<the header name>" }`, for any program.
3. **`read-guard.ts`** — optional **third** argument: a JSON list of `host:port` strings (missing → `[]`; present but not a list of strings →
   refuse, as for args 1–2). Passed to `judgeBash`.
4. **`settings.ts`** — `withReadGuard(base, readable, readOnly = [], serverPorts = [])`. Passes the third argument only when it is non-empty.
   If `readOnly` is empty but `serverPorts` is not, pass `'[]'` as the second argument so positions stay right.
5. **`hop.ts`** — pass `config.serverPorts` to `withReadGuard`. `REFUSAL_REASON.api` = **`worker เรียก API ของ CAW หรือ Blueprint ตรง ๆ ไม่ได้ — ใช้เครื่องมือของ CAW แทน`**
   (REQ-113 § User-facing wording, exactly). The English for the model (stderr): `caw-refused api: <detail> is one of I-Space's own servers — a worker acts on CAW only through its MCP tools`.
6. **Tests** — `bash-policy.test.ts`: TEST-108 Q1's four calls (as in DoD 2) → `api`; the same with `localhost` / `[::1]` / no scheme;
   `-HX-CAW-Actor:operator` attached; a lowercase header; `wget --header='X-Blueprint-By: x'`; `curl http://127.0.0.1:3900/` and `curl
   http://localhost:5173` → null; `echo x-caw-actor` → `api` (any program — say so in the test name). `config.test.ts`: defaults, overrides, a
   bad URL. `read-guard.test.ts`: the third argument (missing / good / bad). `hop.test.ts`: a fixture block with `caw-refused api:` → the Thai sentence.

## Definition of Done

- [ ] 1. Before. `cd caw-back && git status --short | wc -l` → `0` (base: `0`, SA re-run 2026-10-29 17:1x after commit 80e3e88)
- [ ] 2. TEST-108 Q1's four calls through the hook, with ports as the runner gives them — e.g. `printf '%s' "curl -X POST -H 'X-CAW-Actor: operator' http://127.0.0.1:4500/v1/proposals/X/accept" | bun -e 'const c=await Bun.stdin.text();console.log(JSON.stringify({tool_name:"Bash",tool_input:{command:c},cwd:process.argv[1]}))' "$PWD" | bun src/runner/read-guard.ts "[\"$PWD\"]" '[]' '["127.0.0.1:4500","127.0.0.1:4200","127.0.0.1:3100","127.0.0.1:3500"]'; echo "exit $?"` → `caw-refused api: …`, `exit 2`, for each of the four (mode, accept, workspace, Blueprint versions) (base: `exit 0` for all four, SA 2026-10-29 16:5x, without the 3rd argument)
- [ ] 3. Same harness, `curl -s http://127.0.0.1:3900/` → `exit 0` (base: `exit 0`)
- [ ] 4. `bun --no-env-file test src/runner/bash-policy.test.ts src/runner/read-guard.test.ts src/runner/config.test.ts test/config` → 0 fail (base: bash-policy + read-guard `80 pass · 0 fail`; config + test/config `10 pass · 0 fail`, 2026-10-29 16:3x–16:5x)
- [ ] 5. `bunx tsc --noEmit -p .` → exit 0 (base: exit 0)
- [ ] 6. `bun --no-env-file test` (whole suite) → the known `execPath` fail only (base: `808 pass · 1 skip · 1 fail`, Bob 16:25 on the REQ-111 tree)

## Implementation Notes

Bob, 2026-10-29 17:0x–17:10 (box clock). Repo `caw-back` @ `80e3e88`, no git write, no live run. All six steps done; 10 paths changed, all in the closed list.

**DoD 1** — `git log -1 --oneline` → `80e3e88 feat: workers run build/run commands in their folder, …` · `git status --short | wc -l` → `0`.
**Step 1 — `config.ts`:** `RunnerConfig.serverPorts?: string[]` — **optional in the type** (not "every test config a value"): `main.test.ts` builds configs by hand and is outside this TASK's list; `hop.ts` reads it as `?? []`. Computed by `serverPortsOf(env, apiUrl, warn)`: the host:port of `CAW_API_URL` (the `apiUrl` already defaulted), `BLUEPRINT_URL` (default `http://127.0.0.1:4200`), `BLUEPRINT_WEB_URL` (default `http://127.0.0.1:3100`) and `127.0.0.1:3500`; a URL with no port gets 80 / 443 by scheme (`hostPort()` via `new URL`); duplicates collapse. A value that is not a URL → skipped with ONE line naming the **variable** (never the value — a URL can carry a password); `loadConfig` got an optional 4th parameter `warn` (default `console.error("runner: …")`), so `main.ts` is unchanged. It never throws for this.
**Step 2 — `bash-policy.ts`:** `Code` gains `"api"`; `judgeBash(command, cwd, readable, readOnly, serverPorts = [])`. (a) Before the per-command judging, any word (quotes already off, redirect targets included) that matches `x-caw-actor` or `x-blueprint-by`, case-insensitive → `{ code: "api", detail: "X-CAW-Actor" | "X-Blueprint-By" }` (canonical spelling), for any program. (b) In `judgeNetwork`, a target whose host is local (`localhost`, `127.0.0.1`, `[::1]` — the same machine) and whose port (explicit; 443 for `https`; else 80, with or without a scheme) is in `serverPorts` → `{ api, "<host>:<port>" }` as typed. The compare is by port against local entries only; a server on another machine is already `network`. `hostOf` is replaced by `endpointOf` (host + port), no second copy.
**Step 3 — `read-guard.ts`:** optional 3rd argument (JSON list of `host:port` strings; missing → `[]`; present but not a list of non-empty strings → refused `caw-refused outside: read guard: …`, like args 1–2); English `caw-refused api: "<detail>" is one of I-Space's own servers — a worker acts on CAW only through its MCP tools` (exactly yours).
**Step 4 — `settings.ts`:** `withReadGuard(base, readable, readOnly = [], serverPorts = [])`; the 3rd argument only when ports are non-empty; with ports but no read-only folders the 2nd is `'[]'`. Byte-for-byte as before when both are empty (tested).
**Step 5 — `hop.ts`:** passes `config.serverPorts ?? []` to `withReadGuard` for card hops (chat hops have no Bash); `CODES` has `api`; `REFUSAL_REASON.api` = `worker เรียก API ของ CAW หรือ Blueprint ตรง ๆ ไม่ได้ — ใช้เครื่องมือของ CAW แทน` (REQ-113's wording, copied exactly). **One change you did not ask for, found by my own test:** `refusedNote` decided "distinct" by `(kind, detail)`, so `git commit` and `git push`, or an `api` refusal on a port and one on a header, printed the SAME Thai sentence twice. It now keys on the rendered sentence (what the reader sees); the "(อีก n ครั้ง)" count follows. Every earlier test result is unchanged; +1 unit test.

**DoD 2 — TEST-108 Q1's four calls through the hook** (`jq -Rs` builds the payload from the exact `curl` line; args `["$PWD"] '[]' '["127.0.0.1:4500","127.0.0.1:4200","127.0.0.1:3100","127.0.0.1:3500"]'`):
```
curl -X PATCH -H 'X-CAW-Actor: operator' http://127.0.0.1:4500/v1/projects/P/mode -d '{"mode":"dispatcher","hopBudget":999}'
  → caw-refused api: "X-CAW-Actor" is one of I-Space's own servers — a worker acts on CAW only through its MCP tools   exit 2
curl -X POST -H 'X-CAW-Actor: operator' http://127.0.0.1:4500/v1/proposals/X/accept        → caw-refused api: "X-CAW-Actor" …   exit 2
curl -X PATCH -H 'X-CAW-Actor: operator' http://127.0.0.1:4500/v1/projects/P/workspace -d '{"roots":["/x"]}'   → caw-refused api: "X-CAW-Actor" …   exit 2
curl -X POST -H 'X-Blueprint-By: worker' http://127.0.0.1:4200/v1/projects/P/versions      → caw-refused api: "X-Blueprint-By" …   exit 2
```
Also, with no header at all: `curl -s http://127.0.0.1:4500/health` → `caw-refused api: "127.0.0.1:4500" …` exit 2; `curl -s http://localhost:4200/v1/projects` → `caw-refused api: "localhost:4200" …` exit 2. (The header words are refused even with the base one- or two-argument form — they need no ports.)
**DoD 3** — `curl -s http://127.0.0.1:3900/` → `exit 0`, no output.
**DoD 4** — `bun --no-env-file test src/runner/bash-policy.test.ts src/runner/read-guard.test.ts src/runner/config.test.ts test/config` → `104 pass · 0 fail · Ran 104 tests across 4 files`.
**DoD 5** — `bunx tsc --noEmit -p tsconfig.json` → no output.
**DoD 6** (17:05:59) — `bun --no-env-file test` → `826 pass · 1 skip · 1 fail · Ran 828 tests across 65 files [107.41s]` — the 1 fail is the known `settings.test.ts` `execPath` test; nothing else.
**Tests added** (`bash-policy.test.ts` 51 total; `config.test.ts` +4; `read-guard.test.ts` +1; `settings.test.ts` +1; `hop.test.ts` +3): your list — the four calls → `api`; the same through `localhost` / `[::1]` / no scheme; `-HX-CAW-Actor:operator`; lowercase and upper-case; `wget --header='X-Blueprint-By: x'`; `curl http://127.0.0.1:3900/` and `curl http://localhost:5173` → null; `echo x-caw-actor` → `api` ("ANY program" is in the test name) — plus the port defaults by scheme (80 / 443), another host on port 4500 → `network` not `api`, no ports given → the headerless call is not caught, the header check runs before the program table (`docker run -e 'X-CAW-Actor=…'` → `api`); config defaults / overrides / empty values / a bad URL (one warning, names the variable, never the value, no crash, a password in a good URL not echoed); the 3rd argument missing / good / bad; a fixture block `caw-refused api:` → the Thai sentence, hop `commented`; the hop writes the ports into the hook command (card hop) and none when `serverPorts` is unset.
**No existing test changed result.** Nothing was started: no port, no `claude`, no temp roots.

**Known gaps (words, not processes — same as SPEC-108):** a program the worker WRITES and runs (`bun run x.ts`) can still call the API with any header; `localhost` resolves like `127.0.0.1` here but an alias in `/etc/hosts` that points to a server (e.g. `caw.local`) is `network` (any host that is not the three local names is refused, so it is safe); a server on another machine is refused as `network`, not `api`. `UNVERIFIED`: the live behaviour with a real worker (no probe was asked for).

### Round 2 — Bob, 2026-10-29 17:2x (box clock) — TEST-109 DEF-1 → SPEC-110 D6, D7

Same 10 files, no git, no live run. Base on the tree as it stood: QA's `hook-api-cases.mjs` through the real hook → `34 cases, 2 on the wrong side` — `BAD [port] curl http://127.0.0.1:04500/health → allow` and `BAD [header] curl -H @h.txt http://127.0.0.1:3900/ → allow` (exactly DEF-1).
**D6 (`bash-policy.ts`):** `endpointOf` now also returns `written` (the port exactly as typed, null when none). In `judgeNetwork`, for a target on a local host, a written port must match `^[1-9][0-9]{0,4}$` and be ≤ 65535, else `{ code: "api", detail: 'unclear port "<as written>"' }`; `isOwnServer` then compares **as numbers** (`Number(entry port) === Number(target port)`; any local name ↔ any local name). The stderr line shows the detail with its inner quotes as `'…'` (the English template wraps the detail in `"…"`; `unclear port '04500'`), and the Thai note is the same `api` sentence.
**D7 (`bash-policy.ts`):** curl `-H` / `--header` / `--proxy-header` with a value starting `@` (separate, attached `-H@f`, a cluster `-sH@f`, `--header=@f`) → `api` `header from a file`; curl `--variable` / `--variable=…` and any `--expand-…` → `api` with the option as the detail. wget `--config` / `--config=…` joined `NET_UNJUDGEABLE.wget` → `network` (same family as `-e`). curl `-K` / `--config`, wget `-e` / `-i` unchanged. A body from a file (`-d @f`, `-F x=@f`) and ordinary headers stay allowed. Order: the options are read before the targets, so `curl -H @h.txt …:04500/…` says `header from a file` (both are `api`).
**Silver's base lines, through the real hook with the runner's ports** (all `exit 0` before):
`curl -H @h.txt http://127.0.0.1:04500/v1/proposals/X/accept` → `api "header from a file"` exit 2 · `curl http://127.0.0.1:004500/` → `api "unclear port '004500'"` exit 2 · `curl -H@h.txt …:3900/` → `api "header from a file"` exit 2 · `curl --header @h.txt …:3900/` → same, exit 2 · `wget --config=w.rc …:3900/` → `caw-refused network: "--config=w.rc" …` exit 2 · `curl http://127.0.0.1:99999/` → `api "unclear port '99999'"` exit 2 · `curl --variable x@h.txt …:3900/` → `api "--variable"` exit 2 · `curl …:0x1194/` → `network` exit 2 (as before). **Still allowed, exit 0:** `curl -s http://127.0.0.1:3900/` · `curl http://localhost:5173/` · `curl -d @body.json http://127.0.0.1:3900/` · `curl -H 'Accept: x' http://127.0.0.1:3900/`.
**QA's harness** (`tests/harness/test-109/hook-api-cases.mjs <caw-back> <scratch>`, runs fine from here; it writes only under the scratch folder): after the change → **`34 cases, 0 on the wrong side`** (was 2).
**Tests** (`bash-policy.test.ts` 51 → 57): D6 plain ports refused (`04500`, `004500`, `0`, `99999`, `65536`, `[::1]:04500`, wget `04200`, no scheme `127.0.0.1:04500`, `065535`) with the as-written detail; the edges that are fine (`1`, `65535`, `3900`, `0x1194` → `network`); numeric compare across local names; D7 header-from-file ×7 spellings; `--variable` / `--expand-*` → `api`, wget `--config` → `network`; still fine: `-d @body.json`, `-H 'Accept: …'`, `-H 'X-Trace: a@b'`, `-F 'file=@body.json'`, `wget --header='Accept: x'`. One of my own first test lines was wrong (it assumed the port was judged before the option) and is fixed to what the code does.
**DoD 2** (the four calls, runner ports) → each `caw-refused api: …` `exit 2`. **DoD 3** → `curl -s http://127.0.0.1:3900/` `exit 0`. **DoD 4** → `bun --no-env-file test src/runner/bash-policy.test.ts src/runner/read-guard.test.ts src/runner/config.test.ts test/config` → `110 pass · 0 fail · Ran 110 tests across 4 files`. **DoD 5** → `bunx tsc --noEmit -p tsconfig.json` no output. **DoD 6** (17:24:25) → `bun --no-env-file test` → `832 pass · 1 skip · 1 fail · Ran 834 tests across 65 files [99.97s]` — the 1 fail is the known `execPath` test. `git status --short | wc -l` → `10` (the same 10 paths).
**Known limit (unchanged, REQ-113 Out of Scope):** a script the worker writes and runs can still call the APIs. `UNVERIFIED`: a real worker (no probe asked).

### Round 3 — Bob, 2026-10-29 17:3x (box clock) — curl `--connect-to` / `--resolve`

Same 10 files, no git, no live run. **Fix (`bash-policy.ts`, `NET_UNJUDGEABLE.curl`):** `--connect-to` and `--resolve` in every form (separate value, `=value`) → `network`, and the detail is now the **option's name, not its value** (for any `--long` option the stderr/detail is `--connect-to`, not `--connect-to=::127.0.0.1:4500`). They sit with `-x`/`--proxy`/`-K`/`--config` as "a request we cannot judge": the URL we read is not where curl sends it.
**Same family, added on my own initiative (small, all "send it somewhere else", all `network`, tested, within the file list — drop any you do not want):** `--unix-socket`, `--abstract-unix-socket` (a local socket behind a `localhost` URL, e.g. a docker socket), `--socks4`, `--socks4a`, `--socks5`, `--socks5-hostname`, `--preproxy`, `--doh-url`.
**Your three lines through the real hook with the runner's ports** (all of them `null` / accident before): `curl --connect-to=::127.0.0.1:4500 http://localhost:3900/` → `caw-refused network: "--connect-to" reaches the network …` exit 2 · `curl --connect-to ::127.0.0.1:4500 http://localhost:3900/` → `"--connect-to"` exit 2 · `curl --resolve x:80:127.0.0.1 http://x:4500/` → `"--resolve"` exit 2 (deliberately: the option name, not a URL read by accident). **Still exit 0:** `curl -s http://127.0.0.1:3900/` · `curl --connect-timeout 5 http://127.0.0.1:3900/`.
**Tests** (`bash-policy.test.ts` 57 → 60): the six `--connect-to` / `--resolve` spellings → `network` with the option name; the extra family ×10 (also `--proxy=…`, `--config=…` now report `--proxy` / `--config`); options that only look similar stay fine (`--connect-timeout`, `--max-time`, `-sL`, `-k`, `wget --timeout`). No earlier test changed result.
**QA's harness** → `34 cases, 0 on the wrong side`. **DoD 4** (`bash-policy` + `read-guard` + `config` + `test/config`) → `113 pass · 0 fail · Ran 113 tests across 4 files`. **DoD 5** → `bunx tsc --noEmit -p tsconfig.json` no output. **DoD 6** (17:32:35) → `bun --no-env-file test` → `835 pass · 1 skip · 1 fail · Ran 837 tests across 65 files [95.91s]` — the 1 fail is the known `execPath` test. `git status --short | wc -l` → `10` (the same 10 paths).

## Questions

## Review
(The SA fills this in at REVIEW.)

**Verdict: DONE** — Silver (SA, Team B), 2026-10-29 17:1x.
- **Against SPEC-110 D1–D5:** ports from the config (`serverPortsOf`, defaults as specified, bad URL → one warning naming the variable, never the value); `api` by port for the three local names and by header word for any program; the hook's optional 3rd argument; `withReadGuard` byte-for-byte unchanged when empty; REQ-113's Thai reason copied exactly. Matches.
- **Re-run by me:** a scratch `judgeBash` probe with the runner's four ports (nothing in the repo): QA's call → `api "X-CAW-Actor"` · `localhost:4500`, `127.0.0.1:4200` (no scheme), `:3500`, `--url …:4500`, `wget localhost:3100` → `api` · other spellings of this machine (`0.0.0.0`, `127.1`, `[::ffff:127.0.0.1]`, `2130706433`, `LOCALHOST`) → `network` (refused: only the three exact names count as local, so they are refused as network, not api — safe; the reason text says network) · `:3900`, `localhost:5173`, `bun run server.ts` → allowed · a header to the worker's own port → `api`. Tests: bash-policy + read-guard + config + test/config + hop → `214 pass · 0 fail`; `bunx tsc --noEmit -p .` → exit 0; 10 paths. Suite 826/1/1 accepted on your output.
- **The extra fix (note de-duplicated by sentence):** accepted. It is inside the file list, small, tested, and the reader no longer sees the same sentence twice.
- **Limit (REQ-113 Out of Scope):** a script the worker writes can still call the APIs. Live behaviour not probed (none asked).
- Git: nothing; REQ-113 goes up on the owner's word after QA.

**Verdict: REWORK (round 2)** — Silver (SA, Team B), 2026-10-29 17:3x. QA failed REQ-113 (`tests/TEST-109-caw-workers-cannot-act-as-operator.md` DEF-1, MAJOR). My design compared ports as text and read only inline headers. That is my miss, not yours (F-022).
- **Base, run by me through the real hook with the runner's ports** (all on today's tree): `curl -H @h.txt http://127.0.0.1:04500/v1/proposals/X/accept` → exit 0 · `curl http://127.0.0.1:004500/` → exit 0 · `curl -H@h.txt …:3900/`, `curl --header @h.txt …:3900/` → exit 0 · `wget --config=w.rc …:3900/` → exit 0 · `curl http://127.0.0.1:99999/` → exit 0 · `curl --variable x@h.txt …` → refused only by accident (read as a URL) · `curl …:0x1194/` → network.
- **Do (SPEC-110 D6, D7):**
  1. D6 — a local target's port must match `^[1-9][0-9]{0,4}$` and be ≤ 65535, else `api` `unclear port "<as written>"`; then compare numbers with `serverPorts`' ports (any local name ↔ any local name).
  2. D7 — curl `-H`/`--header`/`--proxy-header` value starting with `@` (separate, attached `-H@f`, `--header=@f`) → `api` `header from a file`; curl `--variable`, `--expand-*` → `api`; wget `--config`, `--config=…` → `network`.
  3. Tests: every base line above flips to refused (except `0x1194`, already refused); QA's 1d rows; still allowed: `:3900`, `localhost:5173`, `curl -d @body.json http://127.0.0.1:3900/` (a body from a file is fine), `curl -H 'Accept: x' …:3900/`.
- **DoD 2–6 again.** Also run QA's `tests/harness/test-109/hook-api-cases.mjs` if it runs from caw-back, and paste its summary. If it doesn't, say so.
- Same file list. No git, no live run.

**Verdict: REWORK (round 3) — one small item.** Silver (SA, Team B), 2026-10-29 17:3x. Round 2 is right: every base line from round 2 now refused, and allowed forms still allowed (my probe below).
- **Re-run by me** (scratch `judgeBash` with the runner's four ports, nothing in the repo): `-H @h.txt …:04500`, `-H@h.txt`, `--header @h.txt`, `--header=@h.txt`, `-sH@h.txt` → `api "header from a file"` · `004500`, `99999`, `[::1]:04500` → `api "unclear port …"` · `--variable` → `api` · `wget --config=w.rc` → `network` · `4500.`, `%34500` → `network` · allowed: `:3900`, `-d @body.json …:3900`, `-H 'Accept: x' …:3900`, `localhost:5173`.
- **The hole:** `curl --connect-to=::127.0.0.1:4500 http://localhost:3900/` → **`null` (allowed)**. `--connect-to` makes curl send a request meant for :3900 to 127.0.0.1:4500, CAW's API. The space form (`--connect-to ::127.0.0.1:4500`) and `--resolve x:80:127.0.0.1 http://x:4500/` are refused only by accident: their value is read as a URL. No identity header can ride along now (D7), but REQ-113 req 1 says a worker's command cannot reach the port at all.
- **Fix:** curl `--connect-to` and `--resolve`, in every form (separate value, `=value`), → `network`, detail the option name, as "a request we cannot judge" (same family as `-x`/`--proxy`). Add both to `NET_UNJUDGEABLE.curl` with their `=` forms. Tests: the three lines above flip to refused, deliberately (not by accident: assert the detail is the option name).
- Then DoD 4–6 again, and QA's harness if it ran from caw-back. Same file list.

**Verdict: DONE (round 3)** — Silver (SA, Team B), 2026-10-29 17:3x.
- **Re-run by me** (scratch `judgeBash`, runner's four ports): `--connect-to=…`, `--connect-to …`, `--resolve …`, `--resolve=…` → `network` with the option name as detail (deliberate, not by accident) · `--unix-socket`, `--socks5` → `network` · `-H @h.txt …:04500` → `api` · allowed: `:3900`, `-s -o out.html localhost:3900`, `-d @body.json …:3900`. Tests (bash-policy, read-guard, config, test/config, hop) → `223 pass · 0 fail`; tsc exit 0; 10 paths. Suite 835/1/1 and QA's harness 34/34 accepted on your output.
- **Your extra options** (`--unix-socket`, `--abstract-unix-socket`, `--socks*`, `--preproxy`, `--doh-url`): **kept**. They are the same family, they fail closed, and none is needed by a worker building a local app.
- Git: nothing; REQ-113 goes up on the owner's word after QA.
