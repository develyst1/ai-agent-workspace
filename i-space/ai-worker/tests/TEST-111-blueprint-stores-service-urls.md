# TEST-111: Blueprint's interview stores the address of a service the spec names
- Source REQ: REQ-114 (Team A: SPEC-111, TASK-132/133)
- Status: **TEST_PASSED** (round 2, 2026-10-30 13:11, Tanya — AC-1…AC-4 met, AC-2 live in 1 call; DEF-2/DEF-3 MINOR + O-2 to the PM; § Round 2) · round 1 TEST_FAILED 09:57 (DEF-1)
- Asked by: the PM, 2026-10-30 (`inbox/QA.md`). Gateway: the owner's remaining **3** calls (`DECISIONS.md` 2026-10-30 02:4x: *"…แยกปัญหา URL ของ 4 services ไปเป็น REQ ใหม่เล็กๆ (ใช้ gateway ที่เหลือ 3 ครั้ง)"*)
- Environment: local (this machine) · AC-1 / AC-3 stub gateway only
- Tested: 2026-10-30 by Tanya

## Build under test
- `blueprint-back` **e2c3326** (REQ-110 committed) + Team A's REQ-114 tree, fp **`4750edd216c3`** (5 paths: `context.ts`, `registry.ts`, `registry.test.ts`, untracked `service-urls-round1.json`, `service-urls.test.ts`) · `blueprint-front` **b041cbd**, clean (no REQ-114 change). Same fp method as TEST-107. Clean HEAD export + diff + untracked.
- Ports: API 4231 · web 3141 · stub `test-111/gateway-111.mjs` 4398.

## Instruments
- `gateway-111.mjs` = TEST-107 round 4's stub (every mode kept, for AC-3) plus:
  - `replay114` — **QA's rebuild** of the live round-1 answer of TEST-107 round 4. The reply was readable, so no `roundRaw` was kept. Rebuilt from what the record does keep: the parts it stored (`r4/ac1-round1-spec.json`, all inferred), its 2 questions, and the 4 `api` parts it sent, with the recorded ref and title, `method GET`, and the spec's URL in `path` (the refusal said `path` failed "must start with /"). The 4 `covers` links are **left out**: they hung on a decision that is in neither the stored parts nor the record (as SA A also found, REQ-114 § Questions).
  - `paths` — one `api` part per address form, to test the edges of SPEC-111 E13.
- It proves the server and the page against the model's shape, not what the real model sends (that is AC-2).

## Cases

| # | AC | Type | Actual | Result |
|---|---|---|---|---|
| 1 | AC-1 | happy | `replay114` through the real chat page (spec.txt pasted) → round `applied`, **1 call, nothing refused**; **API-001…004** = Blueprint API Health `GET http://127.0.0.1:4200/health` · Blueprint เว็บ `…:3100` · CAW API Health `…:4500/health` · CAW เว็บ `…:3500`; WRK/SCR/STEP/has_step/Q-001/Q-002 as live (`ac1.out`, `ac1-spec.json`, `ac1-chat.png`) | PASS |
| 2 | Req 1 "a reader can find it" | painted | every page of the project, counted: **`/api` shows 4/4** whole (`where-api.png`); `/ready` 1/4; others 0 (chat 4/4 = the user's own pasted message) (`where.out`) | PASS |
| 3 | neighbour | boundary | `/rooms`, `https://example.test/api/v1`, `http://127.0.0.1:4200/health?x=1#y` → stored | PASS |
| 4 | neighbour | negative | `ftp://127.0.0.1/x`, `javascript:alert(1)`, `https://` → refused `invalid_change`, each named; round still `applied` (REQ-110 req 4) | PASS |
| 5 | neighbour | boundary | **host:port without a scheme** — `127.0.0.1:4200/health`, `localhost:3100` → **refused** `invalid_change` "must start with "/" or be a full http(s) URL" (`paths-round.json`) | → Q1 |
| 6 | AC-3 | regression | REQ-110 AC-2…AC-9 with TEST-107 round 4's five scripts and stub modes: **49 OK** — "nothing saved" in 3 themes, timeout at ~181 s with 1 call, model change + retry (watched), AC-6/7 partial save + record, E8–E10, AC-8 live accept replay 9/9 with the 4 URLs, AC-9 120 s kept. The one BAD is `ui.mjs` #6 missing the Ant dropdown, as in every round; the watched `ui-timeout.mjs` #6 is OK (`reg.out`) | PASS |
| 7 | AC-3 | suites | back `bun test --timeout 30000` **279 / 16 / 0** [355 s], 0 requests to the refusing stub · front typecheck 0, `check:api` matches, unit **235 / 0**, build exit 0, isolation **4**, states **34**, required **1** (948 items, 0 failures) | PASS |
| 8 | **AC-2** | **live** | **3 of 3 calls** (cap proxy at 3, `live-calls.log`). **Round 1** (spec.txt): #1 83.8 s → `applied`, nothing refused, 15 parts: WRK, ROLE, SCR, 3 STEP, 3 INT, DATA-001 (a `url` field, no values), DEC-001 (3 s), DEC-002 (10 s + เช็คตอนนี้), SYS-001, Q-001, Q-002. **No `api` part was sent at all.** **Round 2** ("ตามนั้น" on Q-001 + Q-002): #2 17.6 s + #3 correction 6.7 s → `applied`, 5 saved, **2 refused: links to `$api_status`, an `api` part the model named but never sent** (`invalid_change` "no live part"); DEC-003 added. Final 18 parts: `:4200/health` and `:4500/health` in **no** part; `:3100` and `:3500` only inside Q-002's question text (`ac1-round1/2*.json`, `ac2-round1/2.out`) | **FAIL** |

## Questions
- **Q1 (QA → PM, does not block AC-1/AC-2)** — REQ-114 req 1 says the user's text may name addresses as "full URLs, host:port". SPEC-111 E13 stores a full `http(s)://` URL; an address written **host:port without a scheme** (`127.0.0.1:4200/health`, `localhost:3100`) is refused if the model sends it that way (case 5). No AC covers it; `spec.txt` uses full URLs. Is that acceptable for REQ-114? **Default: yes** — refused and named (REQ-110 req 4), the model is told to send a full URL (E13b); a later REQ if a real spec needs host:port. I count nothing as failed on it.
  > answer: yes, acceptable for REQ-114 — refused and named; a later REQ if a real spec needs host:port. — Porter (PM) 2026-10-30 10:1x `[PM-decided]`

## Defects

### DEF-1 — live, the model does not send the 4 services as parts at all, so their addresses are still not stored — MAJOR
- Build: blueprint-back e2c3326 + fp `4750edd216c3`, front b041cbd; real gateway, `tier:medium`.
- Repro: new project → paste `tests/harness/test-106/spec.txt` → send → "ตามนั้น" on what is offered.
- Expected (AC-2): after ≤ 2 rounds the 4 addresses are in stored parts.
- Actual: the model's answers held no `api` part (round 1) and, in round 2, two links to an `api` part `$api_status` it never sent (both refused, named). The addresses ended up only in the text of a question (2 of 4) or nowhere (2 of 4). The server's new rule (a full URL in `api.path`, SPEC-111 E13) was never exercised live — AC-1 shows it works when the model does send that shape.
- Frequency: 1 of 1 live run. The previous live run (TEST-107 round 4) did send `api` parts with full URLs; this one did not. The model's choice of where to put a service varies between runs.
- Evidence: `ac1-round1.json`, `ac1-round2.json` (`refused`), `ac1-round2-spec.json`, `live-calls.log`.
(No fix proposed.)

## Observations
- **O-1** — round 1 answered in 83.8 s, under the 180 s first-answer limit (REQ-110 req 7 held live).

## Test data created
| What | Where | End state |
|---|---|---|
| projects "TEST-111 …" | `pglite:memory` (:4231, :4299, :4298) | gone: servers stopped 09:57 |
| servers 4231 / 3141 / 4398 / 4396 / 4397 / 4299 / 3151 and the :4298 states back end | this machine | stopped by pid; `ss` clear 09:57 |

## Verdict
**`TEST_FAILED`** — AC-2 fails live (DEF-1, MAJOR): after 2 rounds the 4 service addresses are not in stored parts — this time because the model sent no `api` part for them, not because one was refused. **AC-1 PASS** (the rebuilt live answer stores all 4 full URLs, shown whole on `/api`) and **AC-3 PASS** (REQ-110 AC-2…9 and both suites). The owner's 3 calls are all used; no further live check without a new word.
| scripts, outputs, screens | `tests/harness/test-111/` | left, as evidence |

## Round 2 (2026-10-30 12:4x–13:11) — SPEC-111 § Round 2 (E14: Blueprint keeps every URL the user wrote that no part holds), TASK-136/137
- Build: blueprint-back **e4b2579** (REQ-105 committed) + fp **`7275c1bc9fb9`** (7 paths) · blueprint-front **282e426** + fp **`55e35d7e7b5e`** (4 paths). Evidence `test-111/r2/`.
- Stub `r2/gateway-r2.mjs`: `live111r1` / `live111r2` = QA's rebuilds of TEST-111's live rounds from the parts they stored (the replies were readable, so not kept); questions travel as questions, links to them left out. Edge modes `none`, `holds31000`, `live111r1-no3900`.
- So far: **AC-4 PASS** (round 1 with no `api` part → all 4 addresses kept as `GET` api parts API-001…004, nothing refused, `:3900` held by WRK-001 not duplicated, `url_kept` ×4 named with keys, the PM's line per address in the chat (behind "ดูรายละเอียด" — Q7's accepted collapse); round 2 "ตามนั้นทั้ง 2 ข้อ" adds none). **AC-1 PASS** (model's own api parts → 4, no copies, `url_kept` 0). Edges: brackets / trailing punctuation / duplicates / an address stored in an earlier round / ftp / https with query — all as designed. **Two defects** (DEF-2 Thai glued, DEF-3 prefix) — written below with the verdict. AC-3 regression running; suites and AC-2 live next.
- QA-side: my first front build failed on `next/font/google` (a stale `.next` left by a transient font fetch); a clean `.next` built at once; clean HEAD and the font host were fine. My first AC-4 rebuild carried links to questions → 2 refusals of my making; fixed.

### Round 2 — results (to 13:11)

| # | AC | Actual | Result |
|---|---|---|---|
| R2-1 | **AC-4** | QA's rebuild of TEST-111's live round 1 (no `api` part) through the chat page → `applied`, 1 call, nothing refused; **API-001…004 = `GET` :4200/health, :3100, :4500/health, :3500** (stamp team-proposed); `url_kept` ×4 with keys; `:3900` (in WRK-001) not duplicated; the chat names each "{address} — Blueprint เก็บไว้ใน {key} ให้แล้ว (AI ไม่ได้ใส่ไว้ในสเปก)" (after "ดูรายละเอียด"); round 2 "ตามนั้นทั้ง 2 ข้อ" → `applied`, no api part added, 4 still stored (`r2.out`, `ac4-*.png`) | PASS |
| R2-2 | AC-1 | the rebuilt live answer that DID send 4 `api` parts → 4 api parts, **no copies** (`url_kept` 0) (`ac1.out`) | PASS |
| R2-3 | E14 edges | brackets / trailing `.`/`,` stripped · a URL twice → one part · an address stored in an earlier round → not again · `ftp://` not caught · `https://…?q=1` whole | PASS |
| R2-4 | E14 edge | **Thai written right after the URL** (`ช่วยตรวจที่http://127.0.0.1:4500/healthทุก 10 วินาที`) → stored **`http://127.0.0.1:4500/healthทุก`** (with spaces → exact) | **DEF-2** |
| R2-5 | E14 edge | a part holding `http://127.0.0.1:31000` → the user's **`http://127.0.0.1:3100` counted as held and not kept** | **DEF-3** |
| R2-6 | E14 neighbour | when no part mentions `:3900` (the app's own address) → kept as `API-005 GET http://127.0.0.1:3900` | O-2 |
| R2-7 | AC-3 | REQ-110 scripts **49 OK** (+ the known `ui.mjs` #6 miss; watched #6 OK) · back `bun test --timeout 30000` **308 / 16 / 0** · front `check:api` matches, typecheck 0, unit **238 / 0**, build 0, isolation **4**, states **34**, required **1** (948, 0 failures) | PASS |
| R2-8 | **AC-2 live** | cap proxy 3; **1 call** (84.7 s): round 1 `applied`, nothing refused, 10 parts; **all 4 addresses in DATA-001** (`url` field note — the model put them there itself, so E14 had nothing to add); points 2–6 + "ไม่ทำ" stored (SCR-001, INT-001, DEC-001 3 s, WRK-001 :3900 / 10 s / Thai / no login-DB-history-alerts-deploy). AC-2 met after round 1 — round 2 not spent. **2 of 3 calls unspent** (`r2/live-calls.log`, `ac2-round1.out`, `ac1-round1-spec.json`) | PASS |

### DEF-2 (round 2) — a URL with Thai written right after it is stored with the Thai text in the address — MINOR
- Build: blueprint-back e4b2579 + fp `7275c1bc9fb9`. Repro (stub, any reply without that URL): new project → message `ช่วยตรวจที่http://127.0.0.1:4500/healthทุก 10 วินาที`.
- Expected (req 1): the address `http://127.0.0.1:4500/health` kept. Actual: an `api` part `GET http://127.0.0.1:4500/healthทุก`, named so in the chat. Thai is commonly written without a space before the next word. (`r2.out` edge "Thai written right after the URL".)
### DEF-3 (round 2) — an address counts as "held" when a part holds a longer address that starts with it — MINOR
- Repro (stub `holds31000`: the reply adds a part titled "บริการทดสอบ http://127.0.0.1:31000"): message `ตรวจ http://127.0.0.1:3100 ด้วยครับ`.
- Expected (req 1): `http://127.0.0.1:3100` kept. Actual: no part holds `:3100`; nothing kept, nothing named. (`r2.out` edge "a part holding :31000".)
(No fix proposed for either.)
### O-2 — the app's own address can be kept as an "API"
When no part happens to mention `http://127.0.0.1:3900` (where the Health Board itself runs), E14 keeps it as `GET` API-005, next to the 4 services it checks. As designed ("every URL"), but a reader may take it for a fifth service. For the PM.

### Verdict, round 2
**`TEST_PASSED`** — AC-1, AC-2 (live, 1 call), AC-3, AC-4 met. **Two MINOR defects against req 1 outside the ACs' text** (DEF-2 Thai glued to a URL, DEF-3 prefix) and O-2 — the PM accepts or routes them, as with REQ-113's DEF-2. Tested trees: **blueprint-back e4b2579 + fp `7275c1bc9fb9`** (7 paths) · **blueprint-front 282e426 + fp `55e35d7e7b5e`** (4 paths), unchanged at 13:11.
