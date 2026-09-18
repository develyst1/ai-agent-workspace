# TEST-009: REQ-007 AC-a / AC-d / AC-g — Home "Ask the AI" answering from the owner's real gateway, in a real browser

- Source REQ: REQ-007 (AC-a, AC-d QA sample, AC-g live frames) — brief: REQ-007 §Acceptance pass
  "TEST-009" + `inbox/QA.md`; budget: SPEC-007 §Call ledger **rows 8–10 (reserve 11–12), Tanya**,
  written by Sober 2026-09-13 BEFORE this round (read and confirmed present before anything was started)
- Status: **TEST_PASSED** — 2026-09-13, Tanya — **`calls=3`** (planned 3, cap 5, 0 retries); AC-a seen,
  AC-d 6/6 claims backed, AC-g clean
- Environment: **local `back/` on its defaults** (real `back/knowledge/`, gateway
  `https://ai.develyst.online` — the owner's own service, authorised by him; **not** this project's
  production `portfolio.develyst.online`, which is never opened), the built `front/` served locally
  on 3072 (same surface as TEST-008: `BUILD_ID Twf3FOdhYYaVXTKRSnGEp`, standalone server), a real headed
  Chrome at 1280x900 (+ the answered state at 360x740)
- Tested: 2026-09-13 by Tanya
- Evidence: `../../project-docs/qa-test009-2026-09-13/` — 13 pictures + `frames.jsonl` (every WebSocket
  frame the browser sent/received) + `back.log` (the `calls=` record) + `run.txt` (the raw run)
- Harness: `tests/harness/test009-2026-09-13.cjs`

## The commitment — written BEFORE Ask was pressed (the ledger's second record)

| | |
|---|---|
| Question (exact, typed by hand into the input, not a chip) | **`What did you build for the robotic kiosk, and how long did it take?`** |
| Why this one | Mine, not Run A/B/C's and not a chip. The profile answers it from `PROFILE.md` lines 21–32 (GFAI kiosk: about three weeks, QR / PIN / card, conversation, MQTT door, Next.js · TypeScript · Bun.js · Hono) — several concrete facts to trace for AC-d, and a duration the profile states in one exact phrase ("about three weeks") so a drifted number would show |
| Planned calls | **3** (one chain: understand → match → answer) |
| Hard cap | **5** (SPEC-007 D4 — the chain's own one-retry-per-step is the only retry; none by hand) |
| Presses of Ask | **one, once.** A technical failure of any kind is the result — recorded, not retried |
| Clock time written | **2026-09-13 21:21** (real clock) — `back/` pid 18760 started on defaults at 21:21:37; Ask pressed right after, once |
| Count I report | the `[chain] … end|fail … calls=` line of the `back/` log (0 if no `[chain]` line) |

## Run

**One press. `calls=3`. Planned 3, cap 5, 0 retries, 0 errors.** Ledger: 7 → **10 / 30** once Sober
fills rows 8–10 (rows 11–12 unused, return to unallocated).

Pre-fire checks, in the order promised: SPEC-007 §Call ledger rows 8–10 in my name — present (read
before anything started) · `back/` shell env printed: `GATEWAY_BASE_URL=[] KNOWLEDGE_DIR=[]
GATEWAY_PROVIDER=[] GATEWAY_MODEL=[] PORT=[] STUB_PORT=[]` · `back/` (pid 18760, `bun run src/index.ts`,
21:21:37) first log line `gateway https://ai.develyst.online`, no `[knowledge] missing` · `GET /health`
→ `{"ok":true,…,"knowledge":{"profile":true,"projects":true}}` · headed Chrome 1280x900, tab fronted,
`document.hidden=false`. **Before the real fire the harness was dry-run once on the stub (zero cost,
`GATEWAY_BASE_URL=http://127.0.0.1:3999`, fixture knowledge) so a harness bug could not waste a call**;
that stub and that `back/` were stopped and 3001/3999 verified free before the real `back/` started.

The press: the question typed key by key into the input (not a chip), Ask clicked once at
**21:21:57.492 local** (`run.txt` `[press]` line). The browser opened one socket, `ws://localhost:3001/ws`,
sent one `ask` frame, received 9 frames, `done` at +4318 ms. `back/` log, verbatim (`back.log`):

```
[chain] id=ee83989e-c1fd-4b55-89a0-6d12b6759825 step=1 ok provider=deepseek model=deepseek-flash tokens=231/60/291 latency_ms=607 wall_ms=1013 retried=0 len=204
[chain] id=ee83989e-c1fd-4b55-89a0-6d12b6759825 step=2 ok provider=deepseek model=deepseek-flash tokens=3507/339/3846 latency_ms=1638 wall_ms=1912 retried=0 len=1273
[chain] id=ee83989e-c1fd-4b55-89a0-6d12b6759825 step=3 ok provider=deepseek model=deepseek-flash tokens=486/118/604 latency_ms=1256 wall_ms=1350 retried=0 len=565
[chain] id=ee83989e-c1fd-4b55-89a0-6d12b6759825 end coverage=partial calls=3 wall_ms=4281
```

| # | Case | Seen | Picture | Result |
|---|---|---|---|---|
| 1 | **AC-a** — Home, free text in, the steps painting with REAL provider badges, then the answer with citation links, one picture | +38 ms step 1 `Running…`; +1576 ms step 1 **`deepseek · deepseek-flash · 607 ms`**, step 2 `Running…`; +3051 ms step 2 **`… 1638 ms`**, step 3 `Running…`; +4533 ms step 3 **`… 1256 ms`**; then the answer paragraph (565 chars) and **`Sources` with 5 links**; `Ask` re-enabled | **`06-answered-desktop.png`** — the picture the owner asked for · the steps landing: `02-steps-38ms`, `03-steps-1576ms`, `04-steps-3051ms`, `05-steps-4534ms` · `07-answered-from-heading-desktop.png` · `answered-desktop-full.png` | **PASS** |
| 2 | the answered state at 360x740 (same page resized — no second ask) | timeline one column, three real badges, the whole answer legible, `Sources` below; `scrollWidth` 345 ≤ 360 | `08-answered-phone-a.png`, `09-answered-phone-b.png`, `10-answered-phone-c.png`, `answered-phone-full.png` | PASS |
| 3 | **AC-d** QA sample — the table below | 6 claims, 6 lines, 0 unbacked | `06-answered-desktop.png` + `PROFILE.md` | **PASS** |
| 4 | **AC-g** live — below | every probe 0; every citation `href` = `/about` → HTTP 200 on 3072 | `frames.jsonl`, `run.txt` | **PASS** |
| 5 | counts | console errors 0 · pageerrors 0 · failed requests 0 · **non-local requests from the browser 0** (the gateway is reached by `back/`, never by the page) | `run.txt` last line | PASS |

## AC-d — the QA sample: every factual claim in the answer, one row each

The answer, verbatim (`answer` frame `text`; `coverage:"partial"`, `calls:3`):

> For the robotic kiosk, the owner shipped a reception kiosk in about three weeks. It was a robotic kiosk
> web app built to replace front-desk receptionists in client office lobbies, handling walk-in visitors
> and pre-scheduled appointments with conversational AI and QR scanning, deployed onto client robots.
> Features included QR, PIN and card scan, conversation, and MQTT door open. The owner led the whole
> scope: gathering requirements, setting up cloud infrastructure and preparing the production
> environment. It was built with Next.js, TypeScript, Bun.js and Hono.

| # | Claim in the answer | Backing line (`back/knowledge/PROFILE.md`, read 2026-09-13) | Backed? |
|---|---|---|---|
| 1 | shipped a reception kiosk **in about three weeks** | L23 `Shipped a reception kiosk in about three weeks: …` | yes |
| 2 | a robotic kiosk web app built to replace front-desk receptionists in client office lobbies | L26–27 `…a robotic kiosk web app built to replace front-desk receptionists in client office lobbies.` | yes |
| 3 | handles walk-in visitors and pre-scheduled appointments, with conversational AI and QR scanning, deployed onto client robots | L28–29 `The kiosk handles walk-in visitors and pre-scheduled appointments, with conversational AI and QR scanning, deployed straight onto client robots.` | yes |
| 4 | features: QR, PIN and card scan, conversation, MQTT door open | L23–24 `…QR / PIN / card scan, conversation, MQTT door open.` | yes |
| 5 | led the whole scope: gathering requirements, setting up cloud infrastructure and preparing the production environment | L30–31, verbatim | yes |
| 6 | built with Next.js, TypeScript, Bun.js and Hono | L32 `Built with Next.js, TypeScript, Bun.js and Hono.` | yes |

**6 / 6 backed, 0 invented.** No capability "Yes/No" in this answer (D15 not exercised). **No reference
name, no "Chatuchak", no phone number, no third-party person anywhere in the answer text** (REQ-005
Q41) — "GFAI" appears only inside the citation labels, which are the profile's own heading. Every
citation excerpt is a verbatim `PROFILE.md` line (D6): the five `citations[]` excerpts equal step 2's
five `matches[]` excerpts one-for-one — nothing dropped, nothing added by the answer step.

## AC-g — the frames as the browser received them

Captured in the browser by Playwright's `websocket` events (`frames.jsonl`: 1 sent + 9 received —
`accepted` → `step 1 started/done` → `step 2 started/done` → `step 3 started/done` → `answer` → `done`).
Probed over the raw payloads: `ai.develyst.online` **0** · `STEP: ` **0** · `api_key` 0 · `apiKey` 0 ·
`Bearer` 0 · `sk-` 0 · `x-api-key` 0 · `Authorization` 0. The only URL the page opened is
`ws://localhost:3001/ws`; the page's request log has **no non-local host**. Provider names (`deepseek`,
`deepseek-flash`) are present on purpose (idea D). Step 3's `result` is `{"text_len":565}` only. **All
five citation links are `/about`** and `GET http://127.0.0.1:3072/about` → **200** for each — a local route.

## Defects

None.

## Observations (not defects — for Porter)

- **OBS-14** — the real answer says **"the owner shipped"** / **"The owner led"**: the third-person
  "the owner" phrasing Porter flagged as a prompt echo for the `none` answer (standing fact (b),
  SQ38(b)) appears in a **covered** answer too. Every fact is right; the voice is not the site's ("I").
  Noted, not failed — a prompt-wording matter (Sober's, via you); the owner may not mind.
- **OBS-15** — step 2 judged `coverage:"partial"` although all six claims trace to `PROFILE.md` and the
  answer needed nothing outside it; the UI shows no "partial" wording (per SPEC only `none` gets a hint).
- **OBS-16** — the five `Sources` links carry the **same label** five times (the profile section
  heading `AI & Robotics Developer — GFAI R&I Thailand Co., Ltd. — 2026`), told apart only by the excerpt
  under each. A look matter — the owner's eye — recorded because it is what he will see in
  `06-answered-desktop.png`.

## Verdict

**`TEST_PASSED`** — Home + the real provider in one picture (`06-answered-desktop.png`): three steps
painted in order with real `deepseek · deepseek-flash` badges and latencies, then a 565-character answer
with five verbatim citations, on the built front served locally, from one press. AC-d sample 6/6
backed, nothing invented, nothing barred by Q41. AC-g clean over the live frames. **`calls=3`** —
exactly the plan; ledger **10 / 30** once Sober fills rows 8–10 (rows 11–12 unused).

Footprint closed: `back/` (pid 18760) stopped, 3001 free; front server on 3072 stopped at session end;
`front/.next` untouched; 3000 never touched; no `.env` opened anywhere; `portfolio.develyst.online`
never opened; git untouched.

## Questions

(For Porter; he answers as `> answer: ...`)

None blocking. OBS-14/15/16 are yours to route or drop.
