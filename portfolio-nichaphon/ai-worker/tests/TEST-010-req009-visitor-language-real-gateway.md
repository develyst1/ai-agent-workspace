# TEST-010: REQ-009 AC-a…e — Home "Ask the AI" in the visitor's language, first person, plain sources, step-2 re-run

- Source REQ: REQ-009 (AC-a, AC-b, AC-c re-run, AC-d, AC-e) — brief: REQ-009 §QA brief (Porter, 2026-11-01) +
  `inbox/QA.md`; budget: SPEC-009 §Call ledger **rows 11–25, Tanya** (planned 9, hard cap 15), written by Sober
  BEFORE this round — read and confirmed present before anything was started. AC-f is Sober's ledger, not mine.
- Status: **TEST_PASSED** — 2026-11-01, Tanya — 7/7, 0 defects, **`calls=9`** (planned 9, cap 15, 0 retries)
- Environment: local only. `back/` = working tree on `D1` (HEAD `b068fba` + TASK-029/031 uncommitted: 8 `M`,
  1 `??`), on its **defaults** (real `back/knowledge/`, gateway `https://ai.develyst.online` — the owner's own
  service; this project's production `portfolio.develyst.online` is never opened), port 4014. `front/` **rebuilt
  by me 2026-11-01** with the per-run env `NEXT_PUBLIC_ASK_WS_URL=ws://localhost:4014/ws` (ledger row's
  instruction; **not a code change** — the source still defaults to 3001 until SQ40), `npm run build` exit 0,
  `BUILD_ID 2HhS-E6cVK5UTvV32mdpa` (replaced `RFfY5rwI1IZ5PnpONGt09`), built chunk contains `localhost:4014/ws`
  and no `localhost:3001/ws`; served as `node .next/standalone/server.js` on 127.0.0.1:3072. Browser: Chrome via
  playwright-core, **headless** (owner's standing rule: no visible Chrome pop-ups), 1280x900 + answered state at 360x740.
- Tested: 2026-11-01 by Tanya
- Evidence: `../../project-docs/qa-test010-2026-11-01/` — one folder per press (`p1-thai/`, `p2-chip-websocket/`,
  `p3-chip-databases/`): pictures, `frames.jsonl`, `run.txt`; `back.log` = the `back/` log for all three presses.
- Harness: `tests/harness/test010-2026-11-01.cjs` — dry-run once on the stub first (`dry-stub/`, zero cost:
  `GATEWAY_BASE_URL=http://127.0.0.1:3999`, fixture knowledge; socket `ws://localhost:4014/ws`, 9 frames, done)
  so a harness bug could not waste a real call.

## The commitment — written BEFORE the first real press

| | |
|---|---|
| Press 1 (AC-a, AC-e) | typed by hand, mine: **`คุณเคยทำระบบ kiosk หุ่นยนต์อะไรบ้างครับ`** — Thai with one English tech word (D1: any Thai char → Thai); the profile answers it (GFAI kiosk) |
| Press 2 (AC-b, AC-d, AC-e) | chip **`Can you build a realtime site with WebSocket?`** |
| Press 3 (AC-c, AC-d, AC-e) | chip **`Which databases have you worked with?`** |
| Planned calls | **9** (3 per press) · hard cap **15** — the chain's own one-retry-per-step is the only retry |
| Presses | **one each, once, in this order.** A technical failure is the result — recorded, never re-pressed |
| Count I report | the `[chain] … end|fail … calls=` line per press in the `back/` log |
| AC-c reads | every `[chain] … step=2 …` line: any `malformed` line, and step 2's `completion_tokens` (> 1024 proves the gateway honours D8's 4096) |

## Run

**Three presses, one each. `calls=9` (3 · 3 · 3) — planned 9, cap 15, 0 retries, 0 errors, 0 `malformed` lines.**
Ledger rows 11–19 used, 20–25 unused → Sober fills: **10 → 19 / 30**.

Pre-fire checks: SPEC-009 §Call ledger rows 11–25 in my name — present · `back/` shell env printed empty
(`GATEWAY_BASE_URL=[] KNOWLEDGE_DIR=[] GATEWAY_PROVIDER=[] GATEWAY_MODEL=[] PORT=[]`) · first log line
`listening on http://localhost:4014 … — gateway https://ai.develyst.online` · `GET /health` →
`"knowledge":{"profile":true,"projects":true}` · stub and stub-backed `back/` stopped and 3999/4014 free before the
real `back/` started (01:00 local). `document.hidden=false` on every run. Each press: one socket
`ws://localhost:4014/ws`, 1 frame sent, 9 received, 0 console errors, 0 page errors, 0 non-local requests.

`back.log`, verbatim (every `[chain]` line of the round):

```
[chain] id=02218608-61b7-432c-a543-9a7a0ce65101 step=1 ok provider=deepseek model=deepseek-flash tokens=305/136/441 latency_ms=1755 wall_ms=2056 retried=0 len=213
[chain] id=02218608-61b7-432c-a543-9a7a0ce65101 step=2 ok provider=deepseek model=deepseek-flash tokens=3584/2273/5857 latency_ms=11633 wall_ms=11772 retried=0 len=892
[chain] id=02218608-61b7-432c-a543-9a7a0ce65101 step=3 ok provider=deepseek model=deepseek-flash tokens=557/215/772 latency_ms=1669 wall_ms=1760 retried=0 len=414
[chain] id=02218608-61b7-432c-a543-9a7a0ce65101 end coverage=covered calls=3 wall_ms=15592
[chain] id=8f1d63aa-af64-472a-8e20-03aa7e458011 step=1 ok provider=deepseek model=deepseek-flash tokens=302/185/487 latency_ms=1486 wall_ms=1558 retried=0 len=171
[chain] id=8f1d63aa-af64-472a-8e20-03aa7e458011 step=2 ok provider=deepseek model=deepseek-flash tokens=3576/426/4002 latency_ms=2829 wall_ms=2907 retried=0 len=610
[chain] id=8f1d63aa-af64-472a-8e20-03aa7e458011 step=3 ok provider=deepseek model=deepseek-flash tokens=432/78/510 latency_ms=954 wall_ms=1028 retried=0 len=329
[chain] id=8f1d63aa-af64-472a-8e20-03aa7e458011 end coverage=covered calls=3 wall_ms=5494
[chain] id=b336ab8b-2e78-4346-a917-f7c7739fde98 step=1 ok provider=deepseek model=deepseek-flash tokens=298/95/393 latency_ms=1304 wall_ms=1366 retried=0 len=176
[chain] id=b336ab8b-2e78-4346-a917-f7c7739fde98 step=2 ok provider=deepseek model=deepseek-flash tokens=3574/1309/4883 latency_ms=7022 wall_ms=7079 retried=0 len=1129
[chain] id=b336ab8b-2e78-4346-a917-f7c7739fde98 step=3 ok provider=deepseek model=deepseek-flash tokens=532/75/607 latency_ms=1029 wall_ms=1097 retried=0 len=347
[chain] id=b336ab8b-2e78-4346-a917-f7c7739fde98 end coverage=covered calls=3 wall_ms=9544
```

**For Sober (AC-c):** step-2 `completion_tokens` = **2273 · 426 · 1309**. Two of three are **above the old 1024 cap**
— the gateway honours D8's 4096, and under the old cap press 1 and press 3 would each have been cut (H1's shape).
`grep -c malformed back.log` → **0**.

## Cases

| # | AC | Press · surface | Seen (verbatim from the page) | Picture | Result |
|---|---|---|---|---|---|
| 1 | **AC-a** Thai in → Thai out | P1, typed, 1280x900 + 360x740 | *"เคยครับ ผมทำ reception kiosk ซึ่งเป็น robotic kiosk web app ตัวแรกของทีม in-house … ส่งมอบได้ในประมาณสามสัปดาห์ครับ นอกจากนี้ยังมี R1-BEV Voice Command Robot … สั่งงานได้ครับ"* — Thai sentences, **ผม** + **ครับ** (SQ42 default); English terms kept inline → OBS-17 | `p1-thai/06-answered-desktop.png`, `08-answered-phone.png` | **PASS** |
| 2 | **AC-b** English in → English out (regression) | P2, chip | *"Yes. I built YodBarber Queue Booking, a real-time barbershop queue and booking system, with WebSocket updates …"* — English throughout | `p2-chip-websocket/06-answered-desktop.png` | **PASS** |
| 3 | **AC-c** databases re-run — no step-2 failure | P3, chip | answered, no failure panel; step 2 `ok retried=0`, ct **1309** (> 1024); 0 `malformed` lines in the whole round | `p3-chip-databases/06-answered-desktop.png`, `back.log` | **PASS (re-run leg)** — one press shows the fix holding, it cannot prove the rate: Porter saw 1 in 3 before. The AC's "fixed" judgement stays Sober's finding + this log |
| 4 | **AC-d** first person — WebSocket chip | P2 | *"Yes. I built …"*; no "the profile / the site / the owner" | `p2-…/06-answered-desktop.png` | **PASS** |
| 5 | **AC-d** first person — databases chip | P3 | *"I work with PostgreSQL, MySQL, MSSQL, MongoDB and SQLite. … I have also built with MongoDB …"*; no third person | `p3-…/06-answered-desktop.png` | **PASS** |
| 6 | **AC-e** no raw marks in any source line (all 3 answers) | P1·P2·P3, page text of the answer region | probes `**` `__` `` ` `` `](` `\n- ` `\n* ` `#` → **0 on all three**. The exact line Porter saw now reads **`Databases — PostgreSQL · MySQL · MSSQL · MongoDB · SQLite`** (P3 Sources, first entry) | `p3-…/06-answered-desktop.png`, each `run.txt` `[ac-e]` | **PASS** |
| 7 | regression — phone, socket, frames | all 3 | `scrollWidth 360 = innerWidth 360` at 360x740; socket `ws://localhost:4014/ws`; frames contain `ai.develyst.online` / key-like strings: 0 | `*/08-answered-phone.png`, `run.txt` | PASS |

## Observations (not defects — for Porter / the owner at sign-off)

- **OBS-17 — the Thai answer keeps many English phrases that are not names.** Besides names (R1-BEV, QR / PIN), P1 keeps
  *"walk-in visitors"*, *"pre-scheduled appointments"*, *"registered operator"*, *"camera-based face recognition"*,
  *"front-desk"*, *"in-house"* in English — copied from the English excerpts. D2 keeps names only; these are not.
  AC-a as written ("the answer is in Thai") holds — the sentences are Thai — so I did not fail it. Whether this reads
  the way he would answer a Thai visitor is his call. Picture: `p1-thai/06-answered-desktop.png`.
- **OBS-18 — source excerpts end mid-sentence.** P1 shows *"…QR / PIN / card scan, conversation,"* and *"…with
  conversational"* — a verified excerpt is one wrapped line of the source file, so a dangling comma/word shows. Not
  raw formatting (AC-e holds); pre-dates REQ-009.
- **OBS-16 again** — identical source labels: 3× *"AI & Robotics Developer — GFAI R&I Thailand Co., Ltd. — 2026"* (P1),
  3× *"YodBarber Queue Booking"* (P2). Already with the owner since 2026-09-13.
- **OBS-19 — longer wait when step 2 writes more.** P1's step 2 took **11.6 s** (ct 2273); whole answer 15.6 s, vs
  4.3 s in TEST-009. The steps keep painting meanwhile (`p1-thai/04-steps-14436ms-desktop.png`). FYI for Sober with
  the token numbers above, not a finding.

## Defects

None.

## Test data created

None — no database on this project. Footprint: `front/.next` rebuilt (git-ignored build output; BUILD_ID above);
servers I started (stub 3999, `back/` 4014, front 3072) — stopped at the end, ports re-checked free.
Real calls: see Run (owner's gateway, ledger rows 11–25).

## Verdict

**`TEST_PASSED` — 7/7 cases, 0 defects, `calls=9` (planned 9, cap 15).** AC-a, AC-b, AC-d (both chips), AC-e (all
three answers) seen on the built front against the real gateway. AC-c: the QA re-run passed (no failure, no
`malformed`, step-2 ct 1309 > 1024) — one press cannot prove the old 1-in-3 rate is gone; the "fixed" call rests on
Sober's finding plus these token numbers. AC-f is Sober's ledger (rows 11–19 to fill). Not tested: anything on
production (never in scope); a Thai question on a chip (no Thai chips exist); off-topic Thai (SQ43, English by design).

Decisive evidence:
1. `p1-thai/06-answered-desktop.png` — a Thai question answered in Thai, ผม/ครับ (AC-a).
2. `p3-chip-databases/06-answered-desktop.png` — the databases chip answered in the first person, source line
   `Databases — PostgreSQL · …` with no `**` (AC-c, AC-d, AC-e).
3. `back.log` — 12 `[chain]` lines, 0 `malformed`, step-2 ct 2273 / 426 / 1309, `calls=3` ×3 (AC-c, budget).

## Questions
