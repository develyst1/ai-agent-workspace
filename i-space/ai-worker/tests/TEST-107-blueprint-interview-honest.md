# TEST-107: Blueprint's interview stores what it agrees — and never claims a false save
- Team: A (Blueprint, SA Sober) · TASKs: TASK-109 (back), TASK-110 (front)
- Source REQ: REQ-110 (ACs tested now: AC-2, AC-3, AC-4, AC-5 · AC-1 waits for the owner's word on live gateway calls, REQ-110 Q1)
- Status: **TEST_FAILED** (round 4, 2026-10-30 02:25, Tanya — AC-1 live FAIL, DEF-4: the 4 service URLs refused; AC-2…AC-9 PASS; § Round 4 — AC-1 LIVE) · round 3 TEST_FAILED 2026-10-29 22:16 (AC-1 live, DEF-3) · round 2 TEST_FAILED 17:33 · round 1 **TEST_FAILED** (2026-10-29 16:15, Tanya). **AC-1 FAIL** in the live run: 2 rounds, 0 parts stored. AC-2…AC-5 PASS (stub), and the honest behaviour also held live.
- Build under test: **committed HEAD + Team A's working-tree changes (REQ-110 only)**. `blueprint-back` a4bf924 (REQ-103 commit) + tree fp `d833b2d400d0` (11 paths incl. untracked migration 0007 + `honest.test.ts`) · `blueprint-front` a52e022 + tree fp `75ac7c78ec4e` (4 files: `schema.d.ts`, `chat/load.ts`, `load.test.ts`, `words.ts`). Unchanged at 16:18. The front ran as **clean HEAD export + `git diff HEAD` applied** (see O-1).
- Ports: BP API 4231 · BP web 3141 · Playwright 3151 · mode stub 4398 · refusing stub 4396 · `test:required` back end 4299
- Surfaces: local · desktop web 1440 (Playwright, clicks) · API reads of the stored bot rows
- Designed: 2026-10-29 by Tanya

## Scope

- The user's view of a failed round: what the chat **says**, what is **stored**, and whether the user can **recover**.
  The UI sentence is checked against what the back end stored, and no model text may reach either.
- Not in: whether the real model now stores the Health Board spec (AC-1, live, owner's word).

## Instrument limits

- `tests/harness/test-107-gateway-modes.mjs`: a local fake gateway, mode read per request (`feature` / `good` / `sleep`).
  It speaks the interview protocol the team's own `test/interview/honest.test.ts` uses. It proves the server's and
  the screen's handling of those answers. It proves nothing about what the real model sends (AC-1).
- The client's timeout is a fixed 90 s (`blueprint-back → src/gateway/client.ts:75`), so AC-4 waits ~90 s per round.

## Cases

| # | Case (from AC) | Type | Steps | Expected | Actual | Result |
|---|---|---|---|---|---|---|
| 1 | AC-3 / AC-2: the model proposes `feature` | negative | mode `feature`; chat: "ผมอยากได้ฟีเจอร์ใหม่ ช่วยเพิ่มให้หน่อย" → Enter | the bot row: `roundStatus changes_rejected`, `content ""`, reason `unknown_kind`, note `feature`; 0 parts; the chat shows "รอบนี้ยังไม่ได้บันทึกอะไรเลย — {reason naming feature} ลองพิมพ์ใหม่หรือแก้ตามนี้ได้ครับ"; **no** "บันทึกให้แล้ว" anywhere on the page | | |
| 2 | AC-2: same, after reload and in another theme | state | reload; switch the project theme (luxury-gold, minimal-mono) | same sentence, no model text | | |
| 3 | AC-3: never silently dropped | negative | API: messages + parts after #1 | rejected and **named**, nothing half-stored | | |
| 4 | AC-4: timeout | negative | mode `sleep`; send a message | ~90 s, exactly **1** gateway chat call (no retry, E3); the bot row `bot_could_not_answer` / `timeout`; the chat shows "AI ตอบไม่ทันเวลา — ยังไม่ได้บันทึกอะไร ลองใหม่ หรือเปลี่ยนเป็นรุ่นที่เร็วกว่า" + a retry control + a way to change the model | | |
| 5 | AC-4: the retry works | state | mode `good`; press the retry control | the round runs again and is `applied` (1 part) | | |
| 6 | AC-4: switch to a lower tier from there | state | the model control from the timeout message | the project's model changes to a lower tier (audited with the name, REQ-103) | | |
| 7 | AC-5: send → applied → undo | regression | mode `good`; send; then "ย้อนกลับ" on the change set | applied then undone, both audited | | |
| 8 | AC-5: suites | regression | blueprint-back `bun test` (refusing stub), blueprint-front unit + states + isolation (+ required on :4299) | no test that passed before fails | | |
| 9 | QA footprint | regression | snapshot only; repos' fingerprints before/after | unchanged by QA | | |

Not run here: accept / answer / park need the model to propose those (the stub sends plain changes). They are covered
by the team's tests in #8 and by TEST-101/TEST-104's states run.

## Results (run 2026-10-29 15:46–16:18) — evidence in `tests/harness/test-107/`

| # | AC | Actual | Result |
|---|---|---|---|
| 1 | AC-3/AC-2 | mode `feature`, "ผมอยากได้ฟีเจอร์ใหม่ ช่วยเพิ่มให้หน่อย" → bot row `changes_rejected`, content `""`, `unknown_kind`, note `feature`; the chat reads **"รอบนี้ยังไม่ได้บันทึกอะไรเลย — AI เสนอข้อมูลแบบ “feature” ที่ Blueprint ยังไม่รองรับ ลองพิมพ์ใหม่หรือแก้ตามนี้ได้ครับ"**; "บันทึกให้แล้ว" appears nowhere (the stub's own text was exactly that) | PASS |
| 2 | AC-2 | the same sentence in **luxury-gold** and **minimal-mono** projects (and clean-blue, #1); no model text | PASS |
| 3 | AC-3 | 0 parts after the round; 2 gateway calls (round + one correction); rejected and named, nothing half-stored | PASS |
| 4 | AC-4 | mode `sleep` (100 s): after ~91 s the row is `bot_could_not_answer` / `timeout`, **exactly 1** gateway call (no retry); the chat shows "AI ตอบไม่ทันเวลา — ยังไม่ได้บันทึกอะไร ลองใหม่ หรือเปลี่ยนเป็นรุ่นที่เร็วกว่า" with "ลองใหม่" and "เปลี่ยนโมเดล" | PASS |
| 5 | AC-4 | "ลองใหม่" (explicit click) → the round runs again (1 call) and is `applied` | PASS |
| 6 | AC-4 | "เปลี่ยนโมเดล" focuses the model picker; "เร็ว" → `tier:small`, settings record `{tier:medium} → {tier:small}` by "โด่ง"; the change itself sends no chat | PASS |
| 7 | AC-5 | mode `good`: send → `applied` (+1 part) → "ย้อนกลับ" → part gone, `undo` record by "โด่ง" | PASS |
| 8 | AC-5 | back `bun test` **249 / 16 skip / 0 fail** (refusing stub, 0 calls) · front typecheck clean, `check:api` matches, `bun test src` **219 / 0**, build exit 0 (HEAD + diff), isolation **4**, states **34**, required **1** (948 items, 0 failures) | PASS |
| 9 | — | QA ran from snapshots / exports; fingerprints unchanged before and after | PASS |
| 10 | AC-1 | **LIVE** (owner's yes, ≤ 8 calls; cap enforced by `test-107-gateway-cap-proxy.mjs`): new project (default `tier:medium`) → `spec.txt` as the first message → `changes_rejected` / `invalid_change`, 0 parts, nothing offered to accept → round 2 "ช่วยบันทึกตามที่เล่าไว้ลงใน spec อีกครั้งครับ" → `changes_rejected` / `invalid_change`, **0 parts** (`ac1-round1.json`, `ac1-round2.json`, `ac1-final-spec.json`) | **FAIL** |
| 10b | AC-2 (live) | both live rejected rows: content `""`, reason stored; no "saved" claim. The honesty fix holds with the real model | PASS |

QA-side corrections during the run (not the product): my first stub replies lacked `sure: true`, so rounds ended
`protocol`, and I fixed the stub; a theme cannot be changed by PATCH, so I used one project per theme; my first
model-picker click missed the Ant Design dropdown, so I re-ran #4–#6 in a watched script.

## Live-call ledger (AC-1, owner's yes 2026-10-29, cap 8) — `tests/harness/test-107/live-calls.log`

| # | Time (UTC) | Call | Result | Round |
|---|---|---|---|---|
| 1 | 09:07:29 | POST /chat | 200 in 48.3 s | round 1, the answer |
| 2 | 09:07:34 | POST /chat | 200 in 5.3 s | round 1, the correction → still invalid |
| 3 | 09:10:06 | POST /chat | **network error** after 137 s upstream (the client had already given up at 90 s) | round 2 |
| 4 | 09:11:19 | POST /chat | 200 in 72.6 s | round 2, the client's one retry after a non-timeout failure (R8) |
| 5 | 09:12:40 | POST /chat | 200 in 81.5 s | round 2, the answer |
| 6 | 09:12:48 | POST /chat | 200 in 8.0 s | round 2, the correction → still invalid |
| — | — | **6 of 8 used**, 2 left unspent (AC-1 allows 2 rounds; both were used) · no GET /models: the rounds were sent through the API the chat page uses, not by loading the page | | |

Round 2 took **299 s** for the user (network error + retry + answer + correction).

## Defects

### DEF-1 — the interview still stores nothing from the Health Board spec — MAJOR
- Build: HEAD a4bf924 + REQ-110 tree fp `d833b2d400d0`; real gateway, project model `tier:medium` (default).
- Repro (clean state): new project → paste `tests/harness/test-106/spec.txt` as the first chat message → send.
  Then send "ช่วยบันทึกตามที่เล่าไว้ลงใน spec อีกครั้งครับ".
- Expected (REQ-110 AC-1): after ≤ 2 rounds, parts covering the 6 points and the "ไม่ทำ" list.
- Actual: both rounds `changes_rejected`, reason `invalid_change`, `changeSetId null`, `GET /v1/projects/{id}` → **0 parts**. The
  unknown-kind failure of TEST-106 is gone (the kinds list works), but the proposed set still fails validation as a whole.
- Frequency: 2 of 2 rounds.
- Evidence: `ac1-round1.json`, `ac1-round2.json`, `ac1-final-spec.json`, `live-calls.log`, server log `[round] changes_rejected reason=validation` ×2.
(No fix proposed. SPEC-105 § Risks already names the SA's next step if this happens.)

## Observations (not ours)

- **O-1 — my snapshot of blueprint-front would not build** (`next/font/google` "module-not-found" for Noto Sans Thai Looped, twice),
  while **clean HEAD + the team's exact `git diff HEAD`** built at once. The snapshot also carried the engineer's `.git` and a stale
  `tsconfig.tsbuildinfo`. It is a QA-side artefact, not REQ-110's. For future rounds: build the front from HEAD + diff, not from a tree copy.
- **O-2 — one unexplained chat call in my first script run** (08:56:06, a retry I did not click, right after a page reload). The
  watched re-run showed the model change sends nothing and the retry fires only on its click. Not reproduced, so it is
  recorded here, not filed.
- **O-4 — nobody can see which change was invalid.** The stored row says `invalid_change` with no note, the server log says
  `validation`, and the model's answer is kept nowhere. QA's proxy logs no bodies by design. So after a live failure the
  team has nothing to diagnose from, and every diagnosis costs new live calls.
- **O-5 — a slow, failing upstream doubles the wait.** Round 2's first call failed after 137 s upstream; the client retried
  (R8 still applies to non-timeout failures), so the user waited 299 s for a rejection.
- **O-3 (for TEST-104 O-1): resolved.** At the REQ-103 commits (a4bf924 / a52e022), `check:api` passes on a clean export,
  and `openapi.json` has no `roundNote`. The commit carried none of TASK-109.

## Test data created

| What | Where | End state |
|---|---|---|
| projects "TEST-107 honest", "… luxury-gold", "… minimal-mono", "… timeout" | `pglite:memory` (:4231) | gone: stopped 16:18 |
| snapshots / exports `t107`, `t107h`, `t107p` | session scratchpad | left |
| stubs, scripts, screenshots, logs | `tests/harness/test-107*` | left, as evidence |
| servers 4231 / 3141 / 4396 / 4398 / 4299 and the :4298 orphan | this machine | stopped by pid; `ss` 0 |

## Verdict

**`TEST_FAILED` — AC-1 fails live (DEF-1, MAJOR): two rounds with the real model stored nothing (`invalid_change`).**

**AC-2…AC-5: PASS.** A rejected round now says plainly that nothing was saved, names the reason, and never shows
the model's claim. A timeout costs one call (~90 s, not ~360 s), says so, and offers retry and a faster model, both of
which work. The interview's normal paths (send, apply, undo) and every suite are unchanged.
The honest half of REQ-110 works, live and with the stub: the user is no longer told a false "saved". The storing half does not. 6 of
the 8 allowed live calls were used and the last 2 were left unspent. Any re-test of AC-1 needs the owner's word again.

## Questions

(round 1: none — round 3's Q7 is under § Round 3, "Questions")

## Round 2 (2026-10-29 17:18–17:33) — REQ-110 amended (req 4–5, AC-6, AC-7); evidence in `tests/harness/test-107/r2/`

- Build: HEAD a4bf924 / a52e022 + Team A's round-2 trees, fp **`1b5450d6bf59`** (back, 15 paths incl. untracked migrations 0007–0008, `honest.test.ts`, `partial.test.ts`) / **`d8174a1546ae`** (front, 7 paths). Clean HEAD export + `git diff HEAD` + untracked; unchanged at 17:33.

| # | AC | Actual | Result |
|---|---|---|---|
| R2-1 | AC-2 / AC-3 | `feature` round: stored row `changes_rejected` / `unknown_kind` / note `feature`, content `""`; "รอบนี้ยังไม่ได้บันทึกอะไรเลย — …“feature”…" in clean-blue, luxury-gold, minimal-mono; no model text; 0 parts | PASS |
| R2-2 | AC-4 | timeout: 1 call, ~91 s, the sentence; "เปลี่ยนโมเดล" → "เร็ว" sets `tier:small` (audited "โด่ง"), sends no chat; "ลองใหม่" → applied (watched script) | PASS |
| R2-3 | AC-6 | stub `partial` (work, role, screen, system + invalid `feature`) → **4 parts stored**, round `applied`, 2 gateway calls; the chat: **"บันทึกแล้ว 4 รายการ — ยังไม่ได้บันทึก 1 รายการ:"** + "ฟีเจอร์ที่ไม่มีจริง — AI เสนอข้อมูลแบบ “feature” ที่ Blueprint ยังไม่รองรับ" on its own line; no "บันทึกให้แล้วครับ" (`ac6-partial.png`) | PASS |
| R2-4 | AC-7 | the bot row: `roundSaved 4`, `roundRefused [{item "changes[4]", op part.add, kind feature, ref $f, title, reason unknown_kind, detail}]`; no key / secret (`ac7-bot-row.json`) | PASS |
| R2-5 | AC-5 | send → applied → undo (audited); back `bun test` **258 / 16 / 0** (refusing stub 0 calls); front typecheck clean, `check:api` matches, unit **227 / 0**, build exit 0, isolation **4**, states **34**, required **1** (948 items, 0 failures) | PASS |
| R2-6 | AC-1 **live** | the last **2** of the owner's 8 calls (cap proxy at 2): **round 1** (1 call, 50 s) → `applied`, **2 parts** (ROLE-001, WRK-001 whose goal states the spec in prose); 20 changes refused (8 `invalid_change`, 12 `depends_on_refused`). **Round 2** ("ช่วยบันทึกส่วนที่ยังไม่ได้บันทึก…", call #2, 76 s) needed a correction; the correction and its retry were **refused locally by the cap**, so the round ended `bot_could_not_answer` / `http_503`. Final: **2 parts** — the screen, the 4 services, the rules and the "ไม่ทำ" list are not parts | **FAIL** |

**What AC-7 now shows about the live failure (no extra call):** the 8 invalid changes are the model's shapes, not unknown kinds:
- `ref` values that do not match `^\$[A-Za-z0-9_]+$` (5 changes: data, 2 steps, 2 interactions);
- a `system` part with **no `body`**;
- a `screen` whose `fields` / `actions` / `states` are strings, not lists;
- a `decision` whose `cases` is a string and `open` a boolean.
Every link to those 8 was then `depends_on_refused` (12). `ac1-bot-row.json` holds all 20.

Live-call ledger, round 2 (`r2/live-calls.log`): #1 POST /chat 200 in 50.4 s · #2 POST /chat 200 in 76.3 s · 2 more attempts **refused locally** (cap reached), never sent. **Owner's 8 calls: all used** (6 in round 1 of this test, 2 here).

### DEF-1 (round 2) — still: the real model's spec is not stored — MAJOR
Same repro as DEF-1 above. After round 2's build: round 1 stores 2 of the spec's parts and refuses 20, with the reasons above. AC-1 not met
within its 2 rounds. Partial saving and diagnosis work as designed (AC-6/7); the model's output shapes are the cause now.

### O-6 — when the correction call fails, the first answer's refusals are lost
Round 2's first answer was refused (so a correction was asked), and the correction call failed (here: the cap; in real life: a network
error). The bot row then holds only `bot_could_not_answer` / `http_503`, with `roundRefused` empty. Requirement 5's "every refused change is
recorded" does not hold on that path.

### Verdict, round 2
**`TEST_FAILED`** — AC-1 fails live (DEF-1, MAJOR). **AC-2 … AC-7 PASS** (stub). No gateway call is left. Any further live check needs the
owner's word again. QA is not spending more.

## Round 3 (2026-10-29 18:52–19:35) — SPEC-105 E7–E10 (TASK-126/127); **no gateway call**; evidence in `tests/harness/test-107/r3/`

- Build: HEAD **a4bf924 / a52e022** + Team A's round-3 trees, fp **`3a8865972bb7`** (back, 18 paths incl. untracked migrations 0007–0009, `honest`/`partial`/`shapes.test.ts`) / **`3824d4a9b343`** (front, 7 paths). fp = sha256 of `git diff HEAD` + each untracked file (path + bytes), first 12. Run from a clean HEAD export + diff + untracked; unchanged at 19:35. Trees as restored by TASK-128/129 after the 18:24 reboot.
- Ports: API 4231 · web 3141 · Playwright 3151 · stub `r3/gateway-r3.mjs` 4398 · refusing stub 4396 · required back 4299 · states back 4298. All stopped 19:35 (`ss` 0).
- New stub modes: `replay` = the **shapes** the real model sent live in round 2 (hyphen refs, `system` without body, screen lists as strings, decision `cases` string + `open` boolean), written by QA from `r2/ac1-bot-row.json`; `unreadable` = a non-JSON reply. They prove the server's and screen's handling of those shapes, **not** what the real model will send (AC-1).

| # | AC | Actual | Result |
|---|---|---|---|
| R3-1 | AC-2 / AC-3 | `feature`: row `changes_rejected` / `unknown_kind` / note `feature`, content `""`; "รอบนี้ยังไม่ได้บันทึกอะไรเลย — AI เสนอข้อมูลแบบ “feature” …" in clean-blue, luxury-gold, minimal-mono; no "บันทึกให้แล้ว"; 0 parts; 2 calls (`ui.out`) | PASS |
| R3-2 | AC-4 | timeout: 1 call; API probe **90.0 s** (`probe-timeout.json`), watched UI ~92 s; the sentence + "ลองใหม่" / "เปลี่ยนโมเดล"; "เร็ว" → `tier:small`, audited "โด่ง", no chat sent; "ลองใหม่" → applied (`ui-timeout.out`) | PASS |
| R3-3 | AC-6 | `partial`: 4 parts stored, round `applied`, 2 calls; "บันทึกแล้ว 4 รายการ — ยังไม่ได้บันทึก 1 รายการ:" + "ฟีเจอร์ที่ไม่มีจริง — AI เสนอข้อมูลแบบ “feature” …"; no model claim (`partial.out`, `ac6-partial.png`) | PASS |
| R3-4 | AC-7 | row: `roundSaved 4`, `roundRefused [{item changes[4], op, kind feature, ref $f, title, reason unknown_kind, detail}]`; no key / secret (`ac7-bot-row.json`) | PASS |
| R3-5 | Req 1 build side (E8/E9) | `replay`, 3 themes: round `applied`, **8 of 8 parts stored, 6 links, nothing refused, 1 call** (round 2 live: 2 stored, 20 refused). `system` body `{}`; decision `cases` → list, `open` dropped; screen string lists dropped. `roundAdjusted` names every repair with title (3 `ref_renamed`, `body_defaulted`, `wrapped_in_list cases`, 4 `field_dropped`) (`r3.out`, `e8-*-bot-row.json`) | PASS |
| R3-6 | Req 5 / Q5 wording (E9) | the 4 lines "หน้าแดชบอร์ด QA — บันทึกแล้ว แต่ตัดช่อง fields/actions/states ออก", "เกณฑ์สถานะ QA — … open ออก" are in each theme; no "not saved" sentence on a saved round. **Painted:** luxury-gold shows all 4 at once; clean-blue and minimal-mono clamp the bubble (1–2 lines + "…") until "ดูรายละเอียด", then all 4 show (`e9-replay-*.png`, `e9-details-*.png`) → Q7 | PASS |
| R3-7 | Req 5 / O-6 (E10) | `unreadable` twice: row `bot_could_not_answer` / `protocol`, note null, **`roundRaw` = the reply** kept, content `""`, 2 calls, 0 parts; the chat shows "บอทตอบไม่ได้ตอนนี้" + "ลองใหม่" / "เปลี่ยนโมเดล"; raw text not shown (`e10-bot-row.json`, `e10-unreadable.png`) | PASS |
| R3-8 | AC-5 | back `bun test --timeout 30000` **267 / 16 / 0** [357 s], 32 requests all to the refusing stub · front typecheck 0, `check:api` matches, unit **234 / 0**, build exit 0, isolation **4**, states **34**, required **1** (948 items, 0 failures) | PASS |
| R3-9 | AC-1 | **NOT_TESTED** — live only; the owner has not given new calls (REQ-110 Q6, asked 18:30). | NOT_TESTED |

**Instrument note (AC-5).** With bun's default 5 s per-test limit, the back suite gave 263 / 16 / **4 fail**, all "timed out after 5000ms" (5.0–6.0 s; `blueprint-back-test-default-timeout.txt`). The same three files on **clean HEAD a4bf924** time out **6** tests, a superset of the 4. Not REQ-110's: this box runs those tests at ~5–6 s since the reboot. The verdict count above is with `--timeout 30000`; the team's own runs (267/16/0) used the default.

### Observations, round 3
- **O-7 — one UI timeout round took 327 s, not ~90 s** (first `ui.mjs` run, 11:53:44 → row 11:59:11, 1 gateway call), while the back suite ran beside it. Not reproduced: the API probe 90.0 s, the watched UI run ~92 s. Recorded, not filed.
- **O-8 — QA-side:** a `node_modules` symlink in my export made Turbopack refuse to build ("points out of the filesystem root"); a real `bun install --frozen-lockfile` in the export fixed it. Not the product's.

## Questions
- **Q7 (QA → PM, does not block round 3)** — in clean-blue and minimal-mono, the "saved, but field X left out" lines sit inside the bubble's existing collapse: the user sees the first line cut with "…" and must press "ดูรายละเอียด" to see the rest (luxury-gold shows all). Q5 said "one line per such item, under the saved/not-saved lines". Is "behind ดูรายละเอียด" acceptable? Default: yes (the existing collapse for every long bot message; nothing is hidden for good). I count R3-6 as PASS on that default.
  > answer: yes, acceptable — the lines follow the bubble's existing collapse like every long bot message; nothing is lost. — Porter (PM) 2026-10-29 19:4x `[PM-decided]`

### Verdict, round 3
**AC-2 … AC-7 PASS; AC-1 `NOT_TESTED`** (waits for the owner's live calls, Q6). The round-3 build stores every change of the model's round-2 shapes with the stub (8/8, nothing refused) and names each repair; that is the build side only, not AC-1. REQ-110 stays **`IN_TEST`** until the live AC-1 run; no `TEST_PASSED` before it.

## Round 3 — AC-1 LIVE (2026-10-29 20:05–22:16) — evidence in `tests/harness/test-107/r3/ac1-*`, `live-calls.log`

- Owner's word: *"REQ-110 Q6 อนุมัติ ใช้ gateway จริงเพิ่มได้ไม่เกิน 6 ครั้ง ให้ Tanya เทส AC-1 ได้เลย"* (via Atom 20:02, `DECISIONS.md`). Cap enforced by `test-107-gateway-cap-proxy.mjs` at 6 (:4397).
- Build: same as § Round 3 — fp `3a8865972bb7` / `3824d4a9b343`, re-checked unchanged before the first call. API :4231 from the clean export, `pglite:memory`, project model default `tier:medium`. Driven through the API the chat page uses (`r3/ac1-live.mjs`, one round per run so QA read the spec before spending the next).

| # | Round | What was sent | Calls | Result |
|---|---|---|---|---|
| L1 | 1 | `spec.txt` as the first message | #1 (upstream **200 in 91.2 s**) | `bot_could_not_answer` / `timeout` at 90 s — the answer arrived 1.2 s too late and was dropped; 0 parts. The timeout path itself behaved as REQ-110 req 3 says |
| L2 | 1, retried | `retry: true` = the chat page's "ลองใหม่" (same tier) | #2 answer 75.0 s · #3 correction 6.9 s | `applied`: **16 saved, 1 refused** (`covers` link to `$decision_service_health`, a part the model never added — `invalid_change`), 7 parts + 9 links; question Q-001 offered (web services: 2xx/3xx = ทำงาน) |
| L3 | 2 | "ตามนั้น" on Q-001 (`accept: ["Q-001"]`), as AC-1 allows | #4 22.3 s · #5 10.4 s (re-ask) | `bot_could_not_answer` / **`protocol`** both times; nothing stored; Q-001 still open |
| — | — | **5 of 6 calls used; 1 left unspent.** AC-1's 2 rounds are used up; no further call. | | |

**Coverage after the 2 rounds** (`ac1-round3-accept-spec.json` = the final spec):

| spec.txt | Stored? |
|---|---|
| 1. the 4 services **with their URLs** | **partial** — the 4 names are in WRK-001's goal; `:3100` / `:3500` only inside Q-001's cases; **`:4200/health` and `:4500/health` are stored nowhere** |
| 2. name · ทำงาน green / ไม่ตอบ red · ms · last checked | yes — SCR-001 fields + states |
| 3. every 10 s + "เช็คตอนนี้" | yes — INT-002 + SCR-001 action |
| 4. no answer in 3 s → ไม่ตอบ | yes, in prose — INT-002 reply, SCR-001 states (the decision part the model linked to never came) |
| 5. :3900, no login, no DB | yes — WRK-001 goal |
| 6. Thai | yes — WRK-001, INT-001 |
| ไม่ทำ: login, notifications, history, deploy | yes, in prose — WRK-001 goal |

### DEF-3 (round 3) — accepting the bot's own offer ends "unreadable": the model writes `type` where the protocol needs `op` — MAJOR
- Build: as above; real gateway, `tier:medium`.
- Repro: L1–L2 above (or any project where the bot offered a question), then accept the offered question ("ตามนั้น").
- Expected (AC-1): the accept round stores the agreed answer (and here, the parts the model added with it).
- Actual: twice `bot_could_not_answer` / `protocol`; 0 changes stored. The stored `roundRaw` (E10, 4000 chars, cut there) shows a well-formed reply whose every change is `{"change": {"type": "part.update" | "part.add", …}}`. Earlier replies used `"op"`. `src/interview/protocol.ts:12` reads `change: { op: string }`, so one wrong field name voids the whole reply. **That lost reply held exactly what AC-1 still lacks:** a `data` part listing all 4 URLs (`:4200/health`, `:3100`, `:4500/health`, `:3500`) and a status decision.
- Frequency: 2 of 2 attempts in that round (one reply seen; the re-ask's raw is not stored).
- Evidence: `ac1-round3-accept.json`, `ac1-round3-accept-messages.json` (`roundRaw`), `live-calls.log` #4–#5.
(No fix proposed.)

### Observations, AC-1 live
- **O-9 — the default tier's first answer took 91.2 s against a fixed 90 s client limit** (L1). The user waits 90 s, is told "too slow", and must retry; that cost one of the owner's calls. Round 2's live first answer took 50 s, so it varies. For the PM: is a 90 s limit right for a whole-spec first message on `tier:medium`?
- **O-10 — the retry (L2) counted here as finishing round 1.** If the PM reads "at most 2 rounds" as counting the timed-out attempt, then round 2 was the retry, and the accept round (L3) was outside AC-1. That changes nothing: the spec is short of point 1 after L2 as well.

### Verdict, round 3 (final)
**`TEST_FAILED`** — AC-1 fails live (DEF-3, MAJOR): after 2 rounds the spec covers points 2–6 and the "ไม่ทำ" list but not point 1's URLs, and the round that would have added them was thrown away as unreadable (`type` for `op`). **AC-2 … AC-7 PASS.** Big progress on round 2 live (2 stored / 20 refused → 16 stored / 1 refused). 5 of the owner's 6 calls used; 1 left, not spent. Any further live check needs the owner's word.

## Round 4 (2026-10-30 01:20–02:21) — req 6–7, AC-8, AC-9 (SPEC-105 E11/E12, TASK-130/131); **no gateway call**; evidence in `tests/harness/test-107/r4/`

- Build: HEAD **a4bf924 / a52e022** + Team A's round-4 trees, fp **`0285007b7e05`** (back, 21 paths) / **`2486e8159750`** (front, 7 paths); same fp method as round 3; unchanged at 02:21. Clean HEAD export + diff + untracked; front `node_modules` by `bun install --frozen-lockfile`.
- Stub `r4/gateway-r4.mjs` (:4398). New modes: `sleep` now answers at **200 s** (past the new 180 s first-answer limit, E12); `slow120` answers at 120 s (AC-9); `live-r2` rebuilds the **live** project of round 3 (its 7 parts, from `r3/ac1-round2-spec.json`, all `team-proposed` as live, Q-001 offered); `accept` returns the **recorded live accept reply** (`r3/ac1-round3-accept-messages.json` `roundRaw` + `": [] }`, as SPEC-105 § Round 4 says).
- Box memory was low (≈ 2.3 GB free at start), so builds, UI runs and suites ran one at a time.

| # | AC | Actual | Result |
|---|---|---|---|
| R4-1 | **AC-8** | live state rebuilt (7 parts, all team-proposed) → **"ตามนั้น" clicked on Q-001 in the page** → round `applied`, **1 call, nothing refused**; **all 9 changes stored**: DATA-001 with **all 4 URLs** (`:4200/health`, `:3100`, `:4500/health`, `:3500`), DEC-001…003, SCR-001 updated (`responseMs`, status enum), 4 links, Q-001 `answered`, + the reply's 2 new questions (Q-002/003) offered with "ตามนั้น"; `roundAdjusted` = **9 × `op_renamed`**; the page shows "เพิ่ม 10 · แก้ 2" and the model's reply (`r4-ac8.out`, `ac8-bot-row.json`, `ac8-spec.json`, `ac8-accept.png`) | PASS |
| R4-2 | AC-8 (negative, from my first run) | the same replay where my rebuild wrongly made SCR-001 **user-stated** (`operator`): the SCR-001 update alone was refused `needs_user_words`, named with item and reason; everything else stored; 1 correction call. The guard still holds after E11 (`r4-first-run.out`) | PASS |
| R4-3 | **AC-9** | `slow120`: a first answer at 120 s → `applied`, 1 part, 1 call (round 140 s) — stored, not dropped (`r4-first-run.out`, `ac9-slow120.json`) | PASS |
| R4-4 | AC-9 / AC-4 | `sleep` (200 s): `bot_could_not_answer` / `timeout` after **~181 s**, exactly 1 call; the timeout sentence + "ลองใหม่" / "เปลี่ยนโมเดล"; watched: "เร็ว" → `tier:small` audited "โด่ง", no chat sent; "ลองใหม่" → applied (`ui.out`, `ui-timeout.out`) | PASS |
| R4-5 | AC-2 / AC-3 | `feature`: `changes_rejected` / `unknown_kind` / note `feature`, content `""`; the "nothing saved" sentence in 3 themes; 0 parts (`ui.out`) | PASS |
| R4-6 | AC-6 / AC-7 | 4 stored / 1 named with reason; record `roundSaved 4` + `roundRefused`; no secret (`partial.out`) | PASS |
| R4-7 | Round 3 E8–E10 (regression) | `replay` 8/8 in 3 themes, repairs named, "ตัดช่อง … ออก" lines; `unreadable` → `protocol` + `roundRaw` (`r3.out`) | PASS |
| R4-8 | AC-5 | send → applied → undo, audited (`ui.out` #7); back `bun test --timeout 30000` **276 / 16 / 0** [480 s], 0 requests even to the refusing stub · front typecheck 0, `check:api` matches, unit **235 / 0**, build exit 0, isolation **4**, states **34**, required **1** (948 items, 0 failures) | PASS |
| R4-9 | AC-1 | **NOT_TESTED** — live only; waits for the owner's calls (PM asking: 5 more, 6 in total). | NOT_TESTED |

`ui.mjs` #6 (model change) misses the Ant dropdown again, as in rounds 1 and 3; the watched `ui-timeout.mjs` is the check (R4-4).

### Verdict, round 4
**AC-2 … AC-9 PASS; AC-1 `NOT_TESTED`** (live, the owner's calls). The live accept reply that DEF-3 lost now stores all 9 changes, the 4 URLs included, in one call; a 120 s first answer is kept; a model that never answers still gets the timeout sentence at ~180 s. This proves the build against the model's recorded output, not the model itself. REQ-110 stays **`IN_TEST`** until the live AC-1 run.

## Round 4 — AC-1 LIVE (2026-10-30 02:22–02:25) — evidence in `tests/harness/test-107/r4/ac1-*`, `live-calls.log`

- Owner's word (`DECISIONS.md` 2026-10-30 01:1x): *"ได้ 5 ครั้ง (รวมที่เหลือเป็น 6 ครั้ง) ให้ Tanya เทส AC-1 ของ REQ-110 แบบ live ได้เลย ถ้าครบ 6 แล้วไม่ผ่านให้หยุดแล้วถามใหม่"*. Cap proxy at 6 (:4397).
- Build: the round-4 trees above, fp `0285007b7e05` / `2486e8159750` (checked 02:21). API :4231 from the clean export, `pglite:memory`, default `tier:medium`. `r4/ac1-live.mjs`, one round per run.

| # | Round | Sent | Calls | Result |
|---|---|---|---|---|
| L1 | 1 | `spec.txt` as the first message | #1 answer **87.4 s** · #2 correction 6.9 s | `applied`: **6 saved, 8 refused**. The 4 services came as `api` parts with the **full URL in `path`** (`http://127.0.0.1:4200/health` …); the schema reads `path` as starting with `/` → 4 × `invalid_change` "must start with "/" at path", + their 4 `covers` links `depends_on_refused`. Stored: WRK-001, SCR-001, STEP-001, Q-001 (check from the server side), Q-002 (2xx/3xx = ทำงาน) |
| L2 | 2 | "ตามนั้น" on both (`accept: [Q-001, Q-002]`) | #3 answer 21.5 s | `applied`: **14 saved, 2 refused** (2 links to `$api_check`, a part the model never added — `invalid_change`). Added DATA-001, DEC-001 (2xx/3xx; 3 s → ไม่ตอบ), INT-001/002, SYS-001, Q-003 |
| — | — | **3 of 6 calls used; 3 left unspent.** AC-1's 2 rounds are used; stopped as the owner said. | | |

**Coverage after the 2 rounds** (`ac1-round2-spec.json`, 11 parts, 8 links):

| spec.txt | Stored? |
|---|---|
| 1. the 4 services **with their URLs** | **NO** — names only (WRK-001 goal). `:4200/health`, `:3100`, `:4500/health`, `:3500` appear in **no** stored part (searched every part body). The only place they were sent — the 4 `api` parts of L1 — was refused |
| 2. name · ทำงาน green / ไม่ตอบ red · ms · last checked | yes — SCR-001, DATA-001 |
| 3. every 10 s + "เช็คตอนนี้" | yes — WRK-001, INT-001, SCR-001 action |
| 4. no answer in 3 s → ไม่ตอบ | yes — DEC-001 rule + cases, INT-002 |
| 5. :3900, no login, no DB | yes — WRK-001 |
| 6. Thai | yes — WRK-001 |
| ไม่ทำ | yes, in prose — WRK-001 |

### DEF-4 (round 4) — the 4 service URLs are refused: the model sends them as `api` parts with a full URL where the schema reads a path — MAJOR
- Build: round-4 trees; real gateway, `tier:medium`.
- Repro: new project → paste `tests/harness/test-106/spec.txt` → send.
- Expected (AC-1 point 1): the 4 services and their URLs are stored.
- Actual: 4 × `{kind: api, title: "Blueprint API Health" / "Blueprint เว็บ" / "CAW API Health" / "CAW เว็บ"}` refused `invalid_change`, detail `api body: ✖ Invalid string: must start with "/" → at path`; their links refused with them. Round 2 ("ตามนั้น") did not bring them back. Final spec: no URL of any of the 4 services.
- Frequency: 1 of 1 live run (round 3's live answer put them in a `data` field note instead).
- Evidence: `ac1-round1.json` (`refused`), `ac1-round1-spec.json`, `ac1-round2-spec.json`, `live-calls.log`.
(No fix proposed. Not a question of wording: a URL on another server has to fit somewhere in the registry, and today the model's first pick is refused.)

### Verdict, round 4 (final)
**`TEST_FAILED`** — AC-1 fails live (DEF-4, MAJOR): after 2 rounds every point but point 1 is stored. The 4 service URLs never get in. **AC-2 … AC-9 PASS** (§ Round 4). Live progress: round 3's failure (DEF-3, `type`/`op`) and the 90 s limit no longer bite; round 1 answered in 87.4 s. 3 of the owner's 6 calls used, 3 unspent; any further live check needs the owner again.
