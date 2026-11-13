# TASK-015: Harness — an explicit, opt-in switch so `back-pglite` can use the live gateway for D11 only
- Source: `DECISIONS.md` 2026-11-09 14:52 (owner, via Atom: *"ให้เรียก AI จริง 4 ครั้งได้"*: one live run of exactly 4 calls, AC-7 ×1 + AC-9 ×3, run by QA) · TASK-011 · `llm-gateway` skill (prod base `https://ai.develyst.online`, no key today)
- Owner: BE (Jason)
- Status: DONE (2026-11-09, SA review)
- Depends on: none
- Git: none by you. **You make no live call in this TASK.** The 4 calls are QA's, and only QA's.

## Why
`tests/harness/back-pglite/serve.ts:83` fixes `llmGatewayUrl` to the stand-in (`http://127.0.0.1:4399`). That is right by design, and it must stay the
default. For D11, QA needs the same real back pointed at the live gateway, without editing the file and without any chance of it happening by accident.

## What to do (one file, `tests/harness/back-pglite/serve.ts`, plus one line in its `README.md`)
- Default unchanged: the stand-in at `http://127.0.0.1:4399`.
- **The live gateway is used only when BOTH** `GP_LIVE_GATEWAY_URL` is set **and** `GP_LIVE_GATEWAY_CONFIRM=D11-4-calls`. Then
  `llmGatewayUrl = GP_LIVE_GATEWAY_URL` (QA sets it to `https://ai.develyst.online`). One var without the other → exit 1 with a message naming
  the missing one. Never a silent fallback either way.
- When live, the listening line says so loudly, e.g. `back-pglite listening on 127.0.0.1:4310 (seeded …) — LIVE GATEWAY (D11)`. When not, it says
  nothing new. Never print anything else from those vars.
- No key and no auth header (skill §5: none today). If the gateway answers 401/403, that's QA's to report, not something to work around.
- README: one line on the switch, saying it is for D11 only (4 calls, the owner's 2026-11-09 14:52).

## Definition of Done
- [ ] Default start (no new vars) → the listening line as before, and a G1 by curl lands on the stand-in (`curl -s 127.0.0.1:4399/calls` count goes 0→1). Paste.
- [ ] Only `GP_LIVE_GATEWAY_URL` set → exit 1 naming `GP_LIVE_GATEWAY_CONFIRM`. Only the confirm set → exit 1 naming the URL var. Paste.
- [ ] Both set, to a **local dummy URL** (`http://127.0.0.1:4398`, nothing listening) → the LIVE line prints, and one G1 → 502 `AI_UNAVAILABLE`
      (the call went to the dummy, not the stand-in: the stand-in count stays 0). **Never set it to the real gateway yourself.** Paste.
- [ ] `grep -n "ai.develyst.online" tests/harness/back-pglite/serve.ts` → 0 (the URL comes only from the env, set by QA). Paste. Servers stopped by PID.

## Implementation Notes
**Done (Jason, 2026-11-09). I made no live call, and never set the real gateway anywhere.** Files: `tests/harness/back-pglite/serve.ts` (the switch, ≈20 lines; the gateway line and the listening line) and `README.md` (one line, 14 lines in all). Nothing in `god-plan-back` changed.

The rule as built: stand-in `http://127.0.0.1:4399` unless **both** `GP_LIVE_GATEWAY_URL` is set **and** `GP_LIVE_GATEWAY_CONFIRM` is exactly `D11-4-calls`. A URL without the confirm (or with a wrong confirm value) → exit 1 naming `GP_LIVE_GATEWAY_CONFIRM`; a confirm without the URL → exit 1 naming `GP_LIVE_GATEWAY_URL`; a URL that is not `http(s)://…` → exit 1 naming the var. No value is ever printed. The listening line ends `— LIVE GATEWAY (D11)` only when live. No key and no auth header (unchanged back code).

Evidence (random seed passwords in env, never printed; a first attempt found the ports taken by someone else's run, so I left it alone, ran the port-free checks, waited until 4310/4399 were free, then ran the rest):
```
=== 1. default start (no new vars)
stand-in calls before: 0
back-pglite listening on 127.0.0.1:4310 (seeded: owner, A, B, P1, P2)
{"proposals":[{"title":"ออกแบบหน้าจอ"},{"title":"เขียน API"},…   (G1 landed on the stand-in)
stand-in calls after: 1
=== 2. one var without the other (exit before any port is opened)
URL only            → Missing or wrong environment variable: GP_LIVE_GATEWAY_CONFIRM (needed together with GP_LIVE_GATEWAY_URL)   exit=1
CONFIRM only        → Missing required environment variable: GP_LIVE_GATEWAY_URL (needed together with GP_LIVE_GATEWAY_CONFIRM)   exit=1
URL + wrong confirm → Missing or wrong environment variable: GP_LIVE_GATEWAY_CONFIRM …   exit=1
bad URL + confirm   → Invalid environment variable: GP_LIVE_GATEWAY_URL (an http(s) URL is expected)   exit=1
=== 3. both set, to the local dummy http://127.0.0.1:4398 (0 listeners there)
back-pglite listening on 127.0.0.1:4310 (seeded: owner, A, B, P1, P2) — LIVE GATEWAY (D11)
{"error":{"code":"AI_UNAVAILABLE"}}  ← G1 http=502
stand-in calls after (must stay 0): 0
listeners left on 4310/4399/4398: 0
$ grep -n "ai.develyst.online" tests/harness/back-pglite/serve.ts → no match (exit 1)
```
Servers stopped by their port's own PID; `mode.txt`/`calls.jsonl` deleted.
Decisions (mine): the confirm value is compared exactly; a bad URL shape is refused (extra, so a typo cannot silently become a "live" start that fails later). The check does **not** stop QA from setting the URL to anything, by design: the URL is QA's, the 4-call limit is the owner's and QA's to keep.
`UNVERIFIED`: a start against the real gateway (not mine to do, D11).

## Questions

## Review
**DONE — Sober (SA), 2026-11-09.**
- Ran myself: the URL without the confirm → `Missing or wrong environment variable: GP_LIVE_GATEWAY_CONFIRM …`, exit 1 (it exits before any port opens).
  `grep` shows the stand-in default at `serve.ts:33`, the both-or-exit checks at 34–45, the LIVE suffix only when live (105), no real
  gateway URL in the file, and the README line 13.
- Your evidence for the default (G1 → stand-in, count 0→1) and the dummy-live run (502, stand-in count stays 0) is accepted. So are the extra
  checks for the exact confirm and a bad URL shape. No live call was made by the BE.
- 🔴 **WITHDRAWN 2026-11-09 (SA): do NOT start the live switch.** D11 was already run by QA at 14:55 through her own capped forwarder
  (`harness/live-gateway-cap.mjs`; TEST-001 §D11 live run). The owner's 4 calls are used. Any further live call needs his new word, via the PM.
  The switch stays in the file, inert unless both vars are set. The recipe below is struck and is kept only as history.
- ~~**For QA's D11 run (via the PM):** start `back-pglite/serve.ts` (no stand-in needed) with `GP_LIVE_GATEWAY_URL=https://ai.develyst.online`
  `GP_LIVE_GATEWAY_CONFIRM=D11-4-calls`, check that the listening line ends `— LIVE GATEWAY (D11)`, then make exactly 4 presses: AC-7 ×1, AC-9 ×3.
  A failed live call still counts (DECISIONS 2026-11-09 14:52). Synthetic seed data only (D2).~~
- **Follow-up for the BE (one line, `tests/harness/back-pglite/README.md`):** add under the D11 line: "D11's 4 calls were used on 2026-11-09 at
  14:55 (QA). Do not start live without the owner's new word, via the PM."
