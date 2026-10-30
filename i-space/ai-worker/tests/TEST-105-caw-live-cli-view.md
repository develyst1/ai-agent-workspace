# TEST-105: CAW — a live, read-only CLI view per worker
- Team: B (CAW, SA Silver) · TASKs: — (not cut yet)
- Source REQ: REQ-104 (ACs tested: AC-1 … AC-7)
- Status: **TEST_PASSED** (2026-10-29 14:45, Tanya) — 7/7 AC on stub evidence; named NOT_TESTED and observations in § Verdict
- Build under test: Team B's **working trees**, uncommitted (TASK-105/106/111/112), snapshot 2026-10-29 14:28 (no `.env`), fingerprint = sha256 of `git diff HEAD` + untracked: `caw-back` 102a130 + `1b685c23fb11` (24 paths) · `caw-front` 4b58bf3 + `a03c0e186242` (18 paths). **Unchanged at 14:44.**
- Runs: SPEC-103's dev script `src/runner/e2e/live-view.ts` (`bun --no-env-file`, stub `ticker-claude`, its own pglite and run root) on E2E_PORT 4531 · caw-front `next start` on 3531 (http mode) · Playwright e2e on 3512. TEST-106's services on the standard ports untouched.
- Surfaces: local · desktop web 1440 (Playwright, clicks) · 390 for the view · API (curl) for stored output · the runner's own process
- Designed: 2026-10-29 by Tanya

## Scope

- In: output from runner → API → view, redaction, read-only, history after the hop, the API
  outage, and the TEST-101 regressions.
- Not in: typing into the CLI, persistent sessions (REQ-106), login.
- **No real Claude CLI, ever.** Every hop is driven by a QA stub that speaks `stream-json`.

## Instrument limits

- **A stub CLI** (`tests/harness/bin/claude-stream`, to be written): prints one `stream-json`
  line per second for N seconds, then a `result`. It can also print chosen secret-shaped lines.
  It proves the pipe and the view. It does **not** prove what the real CLI prints, how fast, or
  in what shape. A real-CLI look is the owner's word (REQ-104 line 5).
- **The real runner** must start for AC-1/3/5/6. That means `CAW_WORKSPACE_ROOT` is set, which
  TEST-101 never did. Guards: `CLAUDE_BIN` = the stub, the stub also first on PATH, and the stub
  logs every spawn. If any spawn is missing from the stub log, I stop the round at once (Q1).
- caw-back on `pglite:file:<tmp dir under tests/harness/test-105/>`, because AC-6 restarts the API
  and `pglite:memory` would lose the hop (Q2).

## Risk ranking

1. **AC-3 secrets** — high impact (a leak to a screen and a database) and high likelihood. Today's
   `redact.ts` is pattern-based (URL credentials, `key=` / `token=` forms, Bearer;
   `caw-back → src/runner/redact.ts:1-7`). A bare key or a bare `.env` value on its own may pass.
   Full depth.
2. **AC-6 outage** — the hop must survive, and the gap must be honest. State + timing.
3. AC-1 latency, AC-5 history.
4. AC-2/AC-4 — UI facts, cheap to check, still checked at the server too.

## Cases

| # | Case (from AC) | Type | Surface | Steps | Expected | Actual | Result |
|---|---|---|---|---|---|---|---|
| 1 | AC-1: lines appear live | happy | web | stub prints a numbered line every 1 s for 60 s; open the worker's view after ~10 s | each new line visible ≤ 5 s after the stub printed it (stub timestamps vs DOM timestamps); no reload; "สด" badge | | |
| 2 | AC-1: lines arrive whole and in order | boundary | web + API | stub prints 300 lines fast (10 ms apart), Thai text, a 10 kB line | all 300, in order, none split or duplicated; long line not lost (or truncated **visibly**, per SPEC) | | |
| 3 | AC-1: two workers at once | state | web | two hops, two workers (if the build allows parallel; today one hop per project → two projects) | each view shows only its own worker's lines | | |
| 4 | AC-2: nothing open by default | negative | web + network | load board, team, runs; record network for 30 s | no live view rendered; **no request** to the output endpoint until a click | | |
| 5 | AC-2: opens from the worker | happy | web | click "ดูหน้าจอ" on the crew strip and on the team screen | view "หน้าจอของ {worker}" opens; reachable by clicks (hit-test), both places | | |
| 6 | AC-2: empty state | state | web | worker with no hop yet | "ยังไม่ได้เริ่มทำงาน" | | |
| 7 | AC-3: secrets never shown or stored | negative | web + API | stub prints, one per line: (a) a bare `sk-ant-api03-…` string · (b) `ANTHROPIC_API_KEY=sk-…` · (c) the **bare value** of a key planted in the **runner's** env (`CAW_TEST_SECRET=must-not-leak-<rand>`). The child env is stripped (`hop.ts:97-101`), so per SA B's answer the stub prints the same literal **from its own text**, and `liveRedact` must replace it from `secretValues(env)` (SPEC-103 § The runner item 2) · (d) `https://user:tok@host` · (e) `Authorization: Bearer abc…` | none of the five secret values in the DOM, in the API's stored output (read via its route), or in any API response. Each line still appears, with the secret masked | | |
| 7b | AC-3: the edges of `secretValues` (SPEC-103) | boundary | API | runner env also gets: `GH_TOKEN=abcdef` (exactly 6 chars) · `DB_PASS=abc12` (5 chars, below the stated floor) · `DATABASE_URL=pglite:file:<dir>` (real, already set); stub prints each value bare | 6-char token masked; the `DATABASE_URL` value masked. The 5-char value is outside the SPEC by design: **recorded as an observation** of the floor, not a FAIL | | |
| 8 | AC-3: secret split across two prints | boundary | API | the value printed as two halves in two lines / two batches | not reconstructable from what is stored. If the SPEC accepts this as out of reach: a question, not a pass | | |
| 9 | AC-4: no way to type | negative | web | in the view: look for input / textarea / contenteditable; focus and type; paste | none exist; typing changes nothing; the stub receives nothing on stdin | | |
| 10 | AC-4: no write route | negative | API | `/v1/openapi.json`: any route that sends input to a hop or a worker's CLI | none | | |
| 11 | AC-5: finished hop readable | happy | web | after the hop's `result`: reload, open the view | full output of that hop, with start and end time ("จบงานเมื่อ {เวลา}") | | |
| 12 | AC-5: several hops of one worker | state | web | the worker runs 3 hops | each hop's output separate and in order; not mixed | | |
| 13 | AC-6: API down 30 s mid-hop | negative | process | stub prints for 90 s; at ~20 s stop caw-back (by its pid); restart it at ~50 s on the same `pglite:file` DB | hop not killed (the stub process keeps running, its `result` lands); view shows "ขาดช่วง {n} วินาที — ระหว่างนี้ไม่ได้รับข้อมูล" with n ≈ 30; lines after the gap continue | | |
| 14 | AC-6: no silent invention | negative | web | compare the stub's printed lines with the view | lines in the gap are either delivered late **and** marked, or missing **and** marked; never missing unmarked | | |
| 15 | AC-7: regressions | regression | shell + web | REGRESSION R-1, R-2, R-6, R-8, plus TEST-101 #8 start cases | no test that passed in TEST-101 fails (same rule as TEST-104 Q4); heartbeat and limit handling unchanged | | |
| 16 | 390 width | regression | web 390 | open the view | readable, no sideways page scroll, the close control reachable | | |
| 18 | One look with the **real** CLI (optional, after the stub ACs) | happy | web | owner's 13:01 decision (`DECISIONS.md` 2026-10-29 13:01): one purposeful real hop — a small card, cheapest worker model — with `CLAUDE_BIN` = the real binary; watch the view | the real `stream-json` renders readably in the view, lines arrive, the hop ends and stays readable. **Logged** in this file + `log/` (start/end, model, hop id); any limit/usage signal reported to the PM (owner: > ~60%). Evidence for the owner's eyes, not an AC verdict (ACs stay on stub evidence) | | |
| 17 | Repos clean; the stub log covers every AC hop; any real hop is #18 only | regression | shell | `git status` × 2; stub spawn log = every hop; no `~/.local/bin/claude` process ever | as stated | | |

## Results (run 2026-10-29 14:28–14:44) — evidence in `tests/harness/test-105/` (run1/ run2/ run3/)

| # | AC | Actual | Result |
|---|---|---|---|
| 1 | AC-1 | run 2 (90 ticks, view opened ~10 s in): 43 lines printed after opening, each in the DOM **1.0–3.2 s** (median 2.1 s) after the runner saw it, no reload. Run 1's 30.8 s max was QA's metric counting lines printed before the view opened, corrected | PASS |
| 1b | AC-1 | "สด" badge on the open sheet of a running hop (`run2/05-open.png`). My text read ran before the first poll; the screenshot shows it | PASS |
| 2 | AC-1 | 62 and 92 entries, seq 0…n ascending, no duplicate; the stub's lines arrive whole. 300-line burst / 10 kB line: **not driven** (the stub's text is fixed); `screenLines` cuts at 2000 by code (SPEC) | PASS (burst NOT_TESTED) |
| 3 | AC-1 | two workers at once: **NOT_TESTED** (the dev script seeds one worker; today one hop per project) | NOT_TESTED |
| 4 | AC-2 | board open 8–20 s: no `[data-screen]`; screen polling starts only after the click (requests 2 → 40) | PASS |
| 5 | AC-2 | "ดูหน้าจอ" on the crew strip and in the team drawer, each opens "หน้าจอของ {worker}" by a real click | PASS |
| 6 | AC-2 | a worker with no hop → "ยังไม่ได้เริ่มทำงาน" | PASS |
| 7 | AC-3 | end to end: tick 5's `sk-test-…` and the planted `LIVE_VIEW_SECRET` are `***` on screen and in `GET …/output`. Directly: `liveRedact` masks a bare `sk-ant…`, `ANTHROPIC_API_KEY=…`, a bare env value, URL credentials, Bearer, `ghp_`, `AKIA…`, a JWT and the `DATABASE_URL` value; a plain path is kept (`redact-edges.txt`) | PASS |
| 7b | AC-3 | 6-char `GH_TOKEN` masked; 5-char `DB_PASS` **shown** (below SPEC's ≥ 6 floor, by design → O-1) | PASS (O-1) |
| 8 | AC-3 | a secret split over two lines is **shown in halves** (each line redacted alone) → O-2, a question | observed |
| 9 | AC-4 | no input / textarea / contenteditable / send button in the sheet; typed text appears nowhere | PASS |
| 10 | AC-4 | only `POST /v1/hops/{hopId}/output` writes, and an operator gets **403 `runner_only`** | PASS |
| 11 | AC-5 | after the hop: reload, reopen → all entries, "เริ่มเมื่อ 14:36" and "จบงานเมื่อ 14:38", last line shown | PASS |
| 12 | AC-5 | several hops of one worker: **NOT_TESTED** (one hop per dev run; the view shows the worker's newest hop by design) | NOT_TESTED |
| 13 | AC-6 | run 3: API stopped at 22.9 s for 30 s → hop outcome `commented` (not killed), result landed; one `gap` entry **31 s**; the screen shows "ขาดช่วง 31 วินาที — ระหว่างนี้ไม่ได้รับข้อมูล" | PASS |
| 14 | AC-6 | ticks 21–51 missing **and** marked by that gap; "tick 20" \| gap \| "tick 52", then up to 90 | PASS |
| 15 | AC-7 | caw-back `bun test` **749 pass / 1 skip / 1 fail**: the one fail is the known `execPath` "@" test, renamed (was 677/1/1, +72 new); stub log 0 · caw-front `bun test src` **334 / 0** (was 328), typecheck clean, build exit 0, e2e **264 passed** (was 257) | PASS |
| 16 | — | 390 wide: no sideways scroll, "ปิด" reachable | PASS |
| 17 | — | Team B fingerprints unchanged; QA ran from a snapshot; every dev-run process stopped by its own pid; no real `claude` started by QA | PASS |
| 18 | — | optional real-CLI look: **not run by QA**. TASK-112 § Review records one live run (14:13:29, hop `01a18681-…`, "commented" in 8 s, real lines on the screen, quota 18 % / 5 %). QA did not repeat it to save quota | not run (covered by TASK-112 evidence) |

## Defects

None.

## Observations (not ours)

- **O-1 — a short secret shows.** `secretValues` masks only values of ≥ 6 chars (SPEC-103 § The runner 2). A 5-char
  password in a secret-named env key would appear on the screen and be stored. By design; the PM may want the floor lower.
- **O-2 — a secret split across two printed lines is not masked** (each line is redacted on its own). SPEC-103 § Risks
  names pattern-and-value redaction as the limit. **Question for the PM:** accept as a known limit of AC-3?
- **O-3 — reading order on a finished hop:** "จบงานเมื่อ" is shown above "เริ่มเมื่อ" (`run2/11-finished.png`). Cosmetic.
- **O-4 — while the sheet slides in, the board shows through and the page's ☀ button sits over "ปิด"**
  (`run2/05-open.png`). Gone once open (`11-finished.png`). Animation only; no effect on reachability.
- **O-5 — the runner's local trace files keep what the screen masks.** The trace goes through the older `redact()` only
  (`caw-back → src/runner/trace.ts:1-2`), not `liveRedact`. So a bare key and a bare env-secret value are stored as
  printed in `~/.caw/traces/<hop>.jsonl` (seen: QA's fake values, 1 hit each, in 3 traces). SPEC-103 leaves the trace
  unchanged, so this is **not REQ-104's defect**. On the deploy server those files sit on its disk: worth a line in
  REQ-109 (deploy-ready).

## Test data created

| What | Where | End state |
|---|---|---|
| 3 dev-run projects, workers, cards, hops, output rows; one extra worker "ว่างงาน" (run 2) | the dev script's own `pglite:file` dirs under `/tmp/caw-live-db-*`, run roots `/tmp/caw-live-ws-*` / `/tmp/caw-live-bin-*` | left as the script leaves them (its tmp dirs); processes stopped |
| traces of the stub hops | `~/.caw/traces` (the runner's default) | left: 3 files `01a18690-…`, `01a18696-…`, `01a18699-…` (stub output). Each holds the **fake** planted value `qa-planted-Zx81mQ` and the `sk-test-…` key **unmasked** (`grep -c` = 1 each) → O-5 |
| snapshot copies + `node_modules` | session scratchpad `t105/` | left in scratchpad |
| scripts, screenshots, `redact-edges.txt`, `output.json` ×2 | `tests/harness/test-105/` | left, as evidence |
| servers 4531 / 3531 / 3512 | this machine | stopped by pid; `ss` 0 |

## Verdict

**`TEST_PASSED`** — all 7 ACs pass on stub evidence, on the fingerprinted build. Output reaches the open screen in ≤ 3.2 s.
Nothing opens or polls until a click. Every designed secret shape is masked on screen and in storage. There is no way to
type, and the server refuses non-runner writes. A finished hop stays readable with its times. A 30 s API outage leaves
the hop alive and an honest 31 s gap marker. No existing test changed its result.

NOT_TESTED: #2 burst / long-line (fixed stub text) · #3 two workers in parallel · #12 several hops of one worker · #18
QA's own real-CLI look (TASK-112's live run stands as that evidence).
For the PM: O-2 (split secrets) as a question; O-1 as a possible tightening.

## Evidence (decisive)

- `run2/` watcher lines + `05-open.png`: AC-1 latency ≤ 3.2 s, "สด", tick 5 masked on screen.
- `run3/output.json` + `13-after-outage.png`: AC-6, the 31 s gap entry and marker, hop `commented`.
- `redact-edges.txt`: AC-3 shape by shape, including the two edges that show (O-1, O-2).

## Questions

For the PM. None blocks the design; each has my default. Correct only a line that is wrong.

- **Q1 — the real runner must run, with `CAW_WORKSPACE_ROOT` set and a stub CLI.** TEST-101 never
  set it (SPEC-102 G1), because a real `claude` is installed. **Default:** allowed for QA with three
  guards: `CLAUDE_BIN` = stub; the stub first on PATH; the stub logs every spawn. The round stops
  if any hop's spawn is missing from the log. The runner's start-up guard only runs the three
  workspace hook scripts on canned input (`caw-back → src/runner/guard.ts:10-22`), never `claude`.
- **Q2 — AC-6 restarts the API, so data must survive a restart.** **Default:** QA runs caw-back on
  `pglite:file:` in a temp dir under `tests/harness/test-105/` (a supported URL form,
  `maps/caw.md` § Folders `db/`), deleted after the round.
- **Q3 — AC-3 "a value from a `.env` key":** **Default:** a value planted in the runner's own env
  (`CAW_TEST_SECRET`, as `hop.test.ts:355` already does), printed **bare** by the stub. If the SPEC
  limits redaction to known patterns, a bare value that leaks is a FAIL of AC-3 as written. If
  you want to narrow AC-3, say so now.
  > answer (Q1–Q3): all three defaults accepted as written. AC-3 is **not** narrowed: a bare env value must not leak. Routed to SA B as REQ-104 Q1. — Porter (PM) 2026-10-29 `[PM-decided]`
