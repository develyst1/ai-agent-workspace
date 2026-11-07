# TEST-101: Gateway regression after the audio change (AC-11)
- Team: B · TASKs: TASK-101, TASK-102, TASK-112 (compared); TASK-103 (blocked, not in this build)
- Source REQ: REQ-101 (AC tested: AC-11 only; Tanya holds the other tester ACs)
- Status: IN_TEST — AC-11 comparison last ran 2026-11-07 on commit 6711807: 0 differences. **Not `TEST_PASSED` yet:** REQ-101 is not `SPEC_DONE` and TASK-103 can still change the code.
- Build baselined: repo `develyst-ai`, branch `atom`, HEAD 790f63a (exported copy; repo tree clean before and after)
- Build under test: `develyst-ai`, branch `atom`, commit 6711807, `git status` clean (2026-11-07 run). The 2026-11-06 runs were on the same content before it was committed: 790f63a plus uncommitted edits, `git diff HEAD` sha256 prefix d7b9c3cf456be299
- Environment: local only, Bun scratch copy, every provider stubbed, no key, no spend, no database, no audio
- Tested: 2026-11-06 by Tefany

## Paused 2026-11-07 (DECISIONS.md 12:16 line)

State when the desk paused: `IN_TEST`, no final verdict. AC-11: 61 cases, 0 differences on `develyst-ai` 6711807, stubbed. Nothing of mine is running (checked by cwd and command line: 0).
**To resume:** run § How to run on the commit then at the top of `atom`, once REQ-101 reaches `SPEC_DONE`. `รวมโค้ด` or TASK-103 may move that commit; a different commit means the 6711807 result no longer applies. No new run during the pause.

## Scope

Does the existing gateway still behave the same after the audio change? AC-11's wording: status codes, response shape and
error cases match a baseline from 790f63a, on a local copy; the reply text is not compared; provider calls may be stubbed.

Not in scope: the new `/audio/*` routes (they have no baseline; SPEC-101 AC coverage is elsewhere), real provider behaviour,
the deployed gateway.

## Instrument limits

- **Stubbed providers:** proves how the gateway handles a provider reply of a fixed shape. It does **not** prove real providers
  still answer, or that their real replies have this shape. The stub's shape is written by me from the gateway's own parsing.
- **Local copy:** nothing here says anything about what is deployed. The live commit is unknown (REQ-101 Q10).
- **Bruno files are replayed by my harness, not by Bruno.** The collection's own `tests` blocks were not run.

## How to run

Paths: `<repo>` from `machine.local.md`; `<work>` an empty scratch folder. Harness: `tests/harness/local-gateway-regression.mjs`,
stub `tests/harness/local-gateway-stub.ts`, baseline `tests/harness/TEST-101-baseline-790f63a.json` (holds the frozen requests).

```
bun local-gateway-regression.mjs capture --repo <repo> --tree --work <work> --replay TEST-101-baseline-790f63a.json --out after.json
bun local-gateway-regression.mjs compare TEST-101-baseline-790f63a.json after.json
```
Use `--rev <sha>` instead of `--tree` if the change is committed. Exit 0 means no difference. The requests are frozen, so Bruno
files that Team B adds or edits do not change what is compared.

## Cases

61 requests, 5 server configurations. Result at baseline, on 790f63a:

| # | Case (from AC-11) | Type | Count | Baseline actual | Comparison |
|---|---|---|---|---|---|
| 1 | The 10 Bruno requests | regression | 10 | All 200 | PASS |
| 2 | `/tiers`, unknown route, `GET /chat`, CORS preflight | regression | 4 | 200, 404, 404, 204 | PASS |
| 3 | Auth on the 4 protected routes: no header, unknown key, disabled key, wrong scheme | permission | 16 | All 401 `unauthorized` | PASS |
| 4 | Missing or blank required fields | negative | 6 | All 400 | PASS |
| 5 | Body is not JSON, or multipart | negative | 4 | All 500, plain text `Internal Server Error` | PASS |
| 6 | Provider returns 429, unknown provider, provider timeout | negative | 5 | All 500 with `success:false` | PASS |
| 7 | Tier selection | regression | 2 | 200; `flagship` sends gpt-5.6-sol | PASS |
| 8 | Fallback chain: 1 down, 3 down, all down | state | 3 | 200 from xai, 200 from openai, 500 | PASS |
| 9 | `/chat/multi` with one provider down | state | 1 | 200; the failed entry has no `usage` | PASS |
| 10 | Tavily down; classifier gets prose; classifier's model down | negative | 3 | 500; 200 and 200 with `classifier_parse_failed` | PASS |
| 11 | No provider keys in env | negative | 4 | All 500 | PASS |
| 12 | Auth off | state | 1 | 200 with no key | PASS |
| 13 | No `api-keys.json` | permission | 1 | 401, fails closed | PASS |
| 14 | Search kill-switch off | state | 1 | 500 `web search unavailable` | PASS |

Compared per case: status · `content-type` and two CORS headers · response shape, with the values of `success`, `error`,
`provider`, `model`, `search`, `query`, `reason` · full values of the open GETs · each outbound provider call (URL, method, body)
with the injected date/time masked. Latency and reply text are compared by type only.

**Outbound calls go beyond AC-11's wording.** A difference there is reported to the PM as a finding, not an automatic fail.

## Is the instrument trustworthy? (ran 2026-11-06, 16:23-16:24, Bun 1.4.2)

| Check | Why | Result |
|---|---|---|
| Baseline captured twice from fresh copies | Would it flag noise as change? | `61 cases compared (790f63a vs 790f63a): 0 difference(s)`, exit 0. My first attempt showed 20 false differences from a bug in my date masking; fixed, then re-run |
| A scratch clone with 5 planted changes: a 400 made 422; disabled keys accepted; a model removed from the list; `latency_ms` dropped from a failed multi entry; `max_tokens` renamed in the outbound body | Can it go red? | `23 difference(s)`, exit 1. All 5 seen |
| A scratch clone that only adds `POST /audio/transcriptions` | Would the planned change raise a false alarm? | `0 difference(s)`, exit 0 |
| Containment | Did anything try to leave the box? | 33 outbound calls per run, all caught by the stub; `to an unexpected host: 0` |
| Secrets | Is anything real in the baseline? | Env is built clean, `.env` and `api-keys.json` are removed from the copy, and the baseline holds only my made-up test keys |

## Comparison run (2026-11-06, about 18:00, Bun 1.4.4; baseline taken on Bun 1.4.2)

Requested by the PM after TASK-112 (inbox/QA-B). No key, no provider, no database, no audio.

| Step | Why | Result |
|---|---|---|
| Scratch copy, `AUTH_ENABLED=false`, stub providers: `GET /audio/jobs/x` | Is the change really there? A green without it proves nothing | `{"success":false,"error":"job_not_found"} [404]`: the route's own 404, so mounted |
| `capture --tree` then `compare`, run 1 | AC-11 | `61 cases compared (790f63a vs working tree): 0 difference(s)`, exit 0; outbound 33, unexpected host 0 |
| The same, run 2, from a fresh copy | Noise, given TASK-112's one unexplained hang | The same line, exit 0; outbound 33, unexpected host 0 |
| Copy of this same tree with one planted break (`/search/*` auth line removed), through `--tree` | Can this path go red on this tree? Each capture took about 1 s, so I checked rather than assumed | `16 difference(s)`, exit 1; the `/search` auth cases went 401 to 400 |
| `GET /` and `/tiers`, server with and without `AUDIO_*_PROVIDER=stub`, `cmp` of the bodies | The harness's env has no audio keys; does setting them change these? | Both 200, bytes identical. These two routes only |

**What this does not prove:**
- Real providers: all stubbed. A real reply is outside this run, as in § Instrument limits.
- The deployed gateway: not touched.
- **Silver's hang in the `capacity` suite (TASK-112 § Review):** this comparison never calls `/audio/*` under load, so it says nothing about that hang, either way. The hang is outside AC-11; not judged here.
- The code after TASK-103, and the code once committed. The edits are uncommitted.

## Harness leak, found by the PM 2026-11-07 (my defect, F-entry written)

- **What:** my 4 captures of 2026-11-06 (`ac11-work`, `ac11-t1`, `ac11-t2`, `ac11-m`) left 5 stub gateway servers each: 20 processes, ppid 1, running for hours. The PM counted 21 and about 560 MB; the 21st match was my own lookup shell.
- **Cause, from the wrapper's text and the ppid; the fix below confirms it:** on this box `bun` on PATH is a `/bin/sh` wrapper that runs `bun.exe` as a child. `proc.kill()` stopped the wrapper only. The harness's success output never checked the server.
- **What they could do:** each listened on all interfaces (`*:<port>`) with the stub preloaded, made-up test keys only, and one config has auth off. No real key or provider. Not known whether anything else connected.
- **Do the results stand? Yes.** 20 listeners on 20 different ports: each capture picks a free port and bound its own 5 servers, so no capture reached an older server. The planted break going red on its own copy agrees.
- **Stopped 2026-11-07:** one by one by port, each checked by cwd and command line first: `stopped=20 skipped=0`. Afterwards 0 processes from my `ac11-*` folders.
- **Fixed in `tests/harness/local-gateway-regression.mjs`:** it spawns `process.execPath` rather than `bun`, and after each kill requires the connection to be refused, or the capture fails.

| Check, 2026-11-07, Bun 1.4.4 | Result |
|---|---|
| Fixed harness on 6711807: `capture --tree`, `compare` | `61 cases compared (790f63a vs working tree): 0 difference(s)`, exit 0; outbound 33, unexpected host 0 |
| Processes left from that capture | 0 |
| Harness copy with the old `"bun"` spawn: can the new check fail? | `server main still answers on http://localhost:38541 after kill`, exit 1. Its one server was stopped by port, checked by cwd; port refuses |

The 61-case baseline itself is unaffected: it holds requests and responses, not processes. No other harness file on this desk spawns `"bun"` this way (grep); no other orphaned `bun.exe` was running when I looked.

## Defects

None. 0 differences across the 61 cases.

## Observations (not ours; at 790f63a, before any Team B change)

For the PM to carry onward. None of these is part of the verdict, and the baseline records them as they are, so AC-11 will
expect them to stay the same.

1. **`bruno/GET Info.bru` looks out of date.** Its test expects `endpoints` to have exactly 2 keys; the running gateway returned 5.
   Its docs also show version 1.0.0, while the gateway returned 1.1.0. The count is from a run; that the assertion would fail is
   from reading it, since I did not run Bruno.
2. **A body that is not JSON gets a bare 500** on `/chat`, `/chat/multi` and `/search`, not a 400 with the `success` envelope.
   Silver reported the multipart case first; this adds the other routes.
3. **`no provider keys: default chain` reports only `OPENAI_API_KEY is not set`**, the last provider tried, although all four are missing.
4. **An unknown provider returns 500**, though the request itself is what is wrong.

## Finding 2026-11-06 17:27: Team B's audio change is no longer whole in `develyst-ai`

**Closed for AC-11 by TASK-112:** `/audio/*` answers again (§ Comparison run). Kept as written, for the record.

Not an AC-11 defect and not a verdict. It decides what the comparison would mean, so it is recorded here. I have not proposed a fix.

- **What I saw:** `git status --short` lists only new files: `src/audio/`, `src/routes/audio.ts`, 3 Bruno files. No tracked file is modified.
- **What the TASKs say:** TASK-101 § Implementation Notes lists `M .env.example`, `M CLAUDE.md`, `M docs/consumer-guide.md`, `M src/index.ts`. TASK-102 reports the same set. `grep -i audio` finds nothing in `src/index.ts`, `.env.example` or `CLAUDE.md`. `git diff --stat HEAD` is empty; `docs/consumer-guide.md` was not grepped separately.
- **Run, scratch copy of the working tree, Bun 1.4.4, `AUTH_ENABLED=false`, no key, no provider, port 3977, stopped by `timeout`:**
  `GET /` 200 · `GET /audio/jobs/x` 404 · `POST /audio/transcriptions` 404 · `POST /audio/summaries` 404. The new code is on disk and nothing imports `src/routes/audio.ts`.
- **When:** `git reflog` shows `HEAD@{2026-11-06 17:18:01 +0700}: reset: moving to origin/atom`, and the four files' times are 17:18:01. `call-scribe-back` and `call-scribe-front` show the same reset at 17:17:51. `/workspace` also holds `ai-agent-workspace.broken-20261106`. **My inference, not shown by any file:** the box was restored, and the reset dropped edits to tracked files. New files were put back; I do not know who ran it or why.
- **Not found:** no stash; `git fsck --lost-found --dry-run` printed nothing; a grep for `app.route("/audio"` in `index.ts` under `/workspace` and `/tmp/claude-1000` found no copy. Places outside those were not searched.
- **Consequence for the reviews:** TASK-101 and TASK-102 were reviewed DONE at 16:44 and 17:08, before the reset. Those runs do not describe the tree as it is now. I did not rerun the audio harness.
- **Consequence for AC-11:** the comparison would pass on this tree and prove nothing, because the change it judges is absent. Not run against this tree, on purpose. It runs on a tree where `/audio/*` answers, and I will check that first.
- **Other repos:** the two app repos track only their README, and their work is all untracked, so I expect no such loss. Not checked against the TASKs. Desk files: live desk compared with the broken copy; the live copy holds everything the broken copy has in `log/` and the board differs only by later updates. `inbox/PM.md` was seen to differ and I did not diff it.

**Instrument on this box:** `capture --rev 790f63a` then `compare`, Bun 1.4.4 (baseline was 1.4.2): `61 cases compared (790f63a vs 790f63a): 0 difference(s)`, exit 0; outbound 33, unexpected host 0.

## Test data created

| What | Where | End state |
|---|---|---|
| Scratch copy for the 17:27 run; instrument re-run output | session scratchpad | Copy removed; outputs left there, nothing real in them. Repo unchanged by me |
| 20 stub servers left running by my captures, 2026-11-06 | this box | **Missing from this table until 2026-11-07.** All stopped 2026-11-07; § Harness leak |
| Harness, stub, baseline JSON (`tests/harness/local-gateway-*`, `TEST-101-baseline-790f63a.json`) | this desk | Left; needed for the comparison |
| Scratch copies, clones, generated `api-keys.json` with made-up keys | session scratchpad and harness work folders | Work folders removed by the harness; the two scratch clones and earlier run outputs are left in the session scratchpad, holding nothing real |
| In `develyst-ai` | — | None. `git status --short` is empty and HEAD is 790f63a before and after; no `node_modules`, `.env` or `api-keys.json` there |
| Dev Postgres, deployed gateway, providers | — | Not touched |

## Verdict

**AC-11: PASS on the commit named in the header; status `IN_TEST`, not `TEST_PASSED`.** 61 cases, 0 differences, stubbed providers.
The final verdict comes from one more comparison when REQ-101 reaches `SPEC_DONE`, because TASK-103 is still blocked and may change the code. A different commit means this result no longer applies.

## Evidence (decisive)

- `tests/harness/TEST-101-baseline-790f63a.json` — what 790f63a did, per case, with the requests that produced it.
- § Comparison run — the change present, 0 differences twice, and a planted break on this same tree going red.
- § Is the instrument trustworthy — the checker stays quiet on the same code and on a pure addition, and goes red on real breaks.

## Questions

For the PM: § Finding 2026-11-06 17:27 is for Silver, who owns TASK-101 and TASK-102. Whether the box restore was meant to drop these edits, and whether Team B's other work is affected, is not mine to judge.
  > answer: `[PM-decided 2026-11-06]` Confirmed by my own check: reflog reset at 17:18:01, `git diff HEAD` empty, 0 lines with "audio" in all 4 files. Carried to Silver. Told the owner; default is to re-apply unless he says the drop was meant. I tell you when `/audio` answers and is re-proven; then you compare. Porter.

No question blocks me. Default I am working to: the comparison runs when REQ-101 reaches `SPEC_DONE`, as in the PM's first message of
2026-11-06 (the later message moved only the baseline). If Team B's change has to differ on any existing route, SPEC-101 must say so
first; otherwise I report that difference as a failure.
