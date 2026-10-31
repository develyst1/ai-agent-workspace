# TEST-119: CAW's starting team works card by card — each role on its own card
- Source REQ: REQ-121 (Team B: SPEC-119, TASK-153 caw-back, TASK-154 caw-front) — from TEST-106 phase 3 P3-1, P3-2
- Status: **TEST_PASSED** (2026-10-30 18:45, Tanya) — AC-1, AC-2, AC-4 stub; AC-3 live (one run)
- Environment: local (this machine) · stub `CLAUDE_BIN` for AC-1/2/4 · **live `claude` 2.1.314** for AC-3 (`CLAUDE_BIN=/home/box/.local/bin/claude`, logged) · no gateway (refusing stub :4396, 0 calls)
- Tested: 2026-10-30 by Tanya · harness `tests/harness/test-121/` (stub: `r121.mjs`; live: `live/`) — named after the REQ; the TEST number came from `new-id.mjs`
- Build under test (`bash ai-worker/tools/tree-fp.sh`, at the start 18:28 and the verdict 18:45 — **the same**, and the same as the PM's line):
  - `tree-fp caw-back HEAD 3795236 fp 9ce8cc10134e (249 paths: 249 tracked, 0 untracked, 0 deleted)` — 4 modified paths (TASK-153)
  - `tree-fp caw-front HEAD 1287772 fp 868b4b0843c5 (145 paths: 145 tracked, 0 untracked, 0 deleted)` — 2 modified paths (TASK-154)
  - live only, committed and clean: `tree-fp blueprint-back HEAD 6123018 fp c51f8477e700` · `tree-fp blueprint-front HEAD 6692a16 fp 3a86ddf81dbf`
  - Run from clean HEAD exports + diff.

## Scope
REQ-121 req 1 (BE ↔ FE in the starting chain; a page card goes to the FE), req 2 (a worker does its own card's work and leaves the rest), req 3 (nothing else changes). Out: the owner's review step itself (QA acted as owner, see § Instruments), other team shapes.

## Instruments and their limits
- `r121.mjs` = TEST-118's `r120.mjs` (S1–S8 = REQ-117/119/120 regression) + **S9** (AC-1, AC-2): the real caw-back API + runner + caw-front, the starting team by the real button, runs by the real "อัตโนมัติ" dialog; the stub CLI (TEST-116's) acts as the worker and records the prompt and `card_context` it got.
- `live/` (AC-3): phase 3's tools (`hand.mjs`, `label.mjs`, `live.mjs`, `accept-q.mjs`, `ac4.mjs`), a **new** Blueprint project and a **new** folder `health-board-121`, the same hand-typed spec. **ONE run** (budget 24). Two observers: `fs-trace.log` (the folder's files, size + md5, at every change, labelled with the running hop) and the hop traces (every `Write`/`Edit` per hop).
- **QA acted as the owner at the review step** (`approver.mjs`): a card that reached `review` was approved (operator `PATCH status done`) within a second, with its last note logged — so the one run could reach cards #2–#8 (in phase 3 the run stopped at #1's review). The review step is out of REQ-121's scope; every approval is in `live.log`.
- What this cannot prove: that a model always keeps to its card — it is asked (rules 2, 7, the other-cards line); one live run is the proof the REQ asks for, not a guarantee.

## Cases

| # | AC | Type | Actual | Result |
|---|---|---|---|---|
| 1 | **AC-1** | happy | S9: แบงค์ (BE)'s prompt: "You may hand off to: **ฝน (FE)**, มิ้นท์ (QA)"; `card_context.handOffTo` holds ฝน (FE) (`out/s9-prompt-*.txt`) | PASS |
| 2 | AC-1 | happy | S9: แบงค์ hands #1 to "ฝน" by name → 200, #1 now ฝน's · ฝน's prompt offers "**แบงค์ (BE)**, มิ้นท์ (QA)" back | PASS |
| 3 | **AC-2** | happy | S9: แบงค์'s hop on #1 is told rule 2 "Do only your card's work — its title and its `todo`. Every requirement … binds how you do it …; they are not a list of work for this card.", rule 7 "If you find work that no card holds, say so in a `comment` … — do not build it yourself.", and "Other cards hold their own work — leave it to them, even if you could do it now: **#2 ทำหน้าเว็บ (ฝน FE, todo)**" (its own card not listed); ฝน's hop gets the same | PASS |
| 4 | **AC-3** | live | proposal (ปลา, opus): 8 cards, **page cards to ฝน** (#4 frame, #5 data per service, #6 10 s + button, #7 Thai), server cards to แบงค์ (#1 :3900, #2 the 4 checks, #3 the 3 s rule), #8 to มิ้นท์; chain shows แบงค์ ↔ ฝน (`proposal.json`, `chain.json`) | PASS |
| 5 | **AC-3** | live | **card #1 left the others their work**: its hop wrote a static file server on 127.0.0.1:3900 only — no service checks (#2), no timeout (#3) — and two page placeholders, `app.js` = `// โค้ดฝั่งหน้าเว็บของ Health Board (ฝนเติมต่อ)` (traces 335ffdea) | PASS |
| 6 | **AC-3** | live | **each later card had its own work when its turn came** — per hop writes (traces): #2 แบงค์ edits `server.js` (the API) · #3 แบงค์ edits `server.js` (3 s) + its test · **#4 ฝน writes `index.html` (1.3 KB) + `style.css`** · **#5 ฝน writes `app.js`** · #6 ฝน edits `app.js` (10 s + button) · #7 ฝน small edits (Thai words) · #8 มิ้นท์ tests, cleans its temp files (`fs-trace.log`) | PASS |
| 7 | AC-3 | live | the run: 13 hops (2 chat + 11 card), all 8 cards done, "รอคุณ — ไม่มี", `nothing_workable` (true), **0 `ask_operator` calls**; QA approved 6 reviews as owner (#3–#8, each after มิ้นท์'s or ฝน's note); #1, #2 were closed by the workers | PASS |
| 8 | **AC-4** | regression | REQ-108's AC-4 on this build: `node server.js` → the page shows the 4 services ทำงาน with ms and "เช็คล่าสุด", a "เช็คตอนนี้" button; QA's caw-web stopped → "CAW เว็บ · ไม่ตอบ · -" **in 6.9 s**, by itself (`live/out/ac4-*.png`) | PASS |
| 9 | AC-4 | regression | S1–S8 again: REQ-119 (honest stop, names, 2 turns, count 0), REQ-120 (second run takes its own steps), REQ-117 (review line, "รอคุณ — ไม่มี") — **all OK** (`r121.out`) | PASS |
| 10 | AC-4 | suites | caw-back **922 / 1 skip / 1 fail** — the known `withReadGuard` test only · caw-front typecheck 0, unit **355 / 0**, build 0 (`caw-back-test.txt`, `caw-front.txt`) | PASS |

## Observations (non-blocking, for the PM)
- **O-1 — แบงค์ handed the server card #1 to ฝน, and ฝน closed it** (hop ecfa25b2: no file written, status → done). Allowed by the new BE → FE edge; it cost one hop and moved a BE card through the FE for no work. The page placeholders were the likely reason.
- **O-2 — ฝน edited `server.js` on #7** ("ข้อความบนหน้าเป็นภาษาไทย": 3 small edits, Thai words the server sends). Within the card's own goal; the FE touched the BE's file.
- **O-3 — #5 reached review with no note** (ฝน wrote `app.js`, said nothing); the owner reviewed it blind. #4's note said "ยังไม่ได้เปิดดูจริง".
- **O-4 — no README** this time (phase 3 had one); `package.json` has `start`. REQ-108 AC-4 says "per its README".

## Live-run ledger (`live/out/ledger.txt`)
13 hops — opus ×5 (chat ×2, มิ้นท์ ×3), sonnet ×8 (แบงค์, ฝน) — **≈ 52.5 k out**, ≈ 5.1 M cache-read; 18:33–18:44; gateway 0; no limit or usage signal. The run's report: "11 ก้าว จากงบ 24".

## Test data created
| What | Where | End state |
|---|---|---|
| live: Blueprint project | `pglite:memory` (:4200) | gone: stopped |
| live: CAW project, 8 cards, 13 hops | `pglite:file` in QA scratch | left on disk, unserved |
| live: the built dashboard | `/workspace/caw-workspaces/health-board-121` | left, as evidence |
| stub: 9 CAW projects (S1–S9) | `pglite:file` in `/tmp/qa119-…` | left in /tmp |
| servers 4200 / 3100 / 4500 / 3500 / 3900 / 4292 / 4541 / 3541 / 4396, runners | this machine | stopped; `ss` clear 18:45 |
| scripts, outputs, screens, traces | `tests/harness/test-121/` | left, as evidence |

## Verdict
**`TEST_PASSED`** — AC-1 (แบงค์ ↔ ฝน in the starting chain; hand-off BE → FE works), AC-2 (every card hop is told to do only its card and is shown the other cards), AC-3 (live, one run: page cards went to ฝน and ฝน wrote the page on them; card #1 built only the server shell and left #2–#8 their work; every card done, no operator question), AC-4 (REQ-108's AC-4 still met — "ไม่ตอบ" in 6.9 s; REQ-117/119/120 cases all OK; suites green but the known test). TEST-106 P3-1 and P3-2 are fixed. O-1…O-4 for the PM. **Tested trees for git (tree-fp.sh, same 18:28 and 18:45):** caw-back **3795236 fp `9ce8cc10134e`** · caw-front **1287772 fp `868b4b0843c5`**.

## Questions
(none)
