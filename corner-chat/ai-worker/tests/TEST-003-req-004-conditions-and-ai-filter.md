# TEST-003: Each message is judged against the user's own conditions
- Team: A · TASKs: TASK-005, TASK-006, TASK-007, TASK-009, TASK-023, TASK-031 (DEF-1 fix) · SPEC-001
- Source REQ: REQ-004 (ACs tested: AC-1 … AC-10, plus requirements 2(c), 5, 7)
- Status: **TEST_PASSED** (2026-11-01, run 2, Team A scope: back end) — DEF-1 fixed and verified; app surface
  `NOT_TESTED`, named in § Verdict. Run 1 was `TEST_FAILED` (DEF-1) — kept below as history
- Build under test (run 2): `corner-chat-back` `main` `d1152f1` + uncommitted working tree, fingerprint
  **`945cad21c9ecacac`** (53 files; the same at 09:41Z before and 09:52Z after the run). Run 1 was on `8ed1ce4b46a72309`.
  The corpus runs imported `src/filter/*` from the same tree.
- Surfaces: QA's own back end 127.0.0.1:8191 / DB `corner_chat_qa_tanya` with the **fake gateway** (`harness/fake-gateway`,
  script `harness/qa-a/gw.json`, :3991) for the exact cases · the **owner's real gateway** `https://ai.develyst.online`
  for the corpus (D33; no key needed — SPEC-001 §2) · app: not built
- Tested: 2026-11-01 by Tanya — run 1 16:04–16:24 +07 · run 2 16:41–16:52 +07

## Scope
- In: fixed rules decide with no AI call, rule order, bar logic at its boundary, the decision record, fail open,
  bar change, corrections, model as a setting, the about line, and the labelled corpus run.
- Risk call: **a wrong hold is the costly defect** (a real message the user never hears about). AC-5 (fail open) and
  AC-6 (0 wrong holds) get the most cases. Wrong passes are measured but cost less.
- Notification **delivery** (LINE push, app push) is REQ-003 / REQ-005, Team B's. Here "notify" is checked as the
  stored decision = notify and a notification handed to the sender side; the user actually receiving it is Tefany's.
- Not in this round: auto-reply, learning from corrections, per-channel bars, English (Out of Scope).

## Instrument limits
- **AI stubbed** (fixed %, malformed answer, timeout — seam: Q1): proves the code's decision logic exactly. Proves
  nothing about the AI's judgement.
- **Real gateway, corpus:** proves the judgement **on these 30 made-up messages, with these models and this prompt
  version** — not on real traffic. A model/prompt change voids the result until the corpus is re-run.
- Temperature 0 does not make a model deterministic; that is why each run is 3×.
- The about line "says what it is about" is a human judgement (PM + me), recorded as such, never as an automatic PASS.

## The corpus (AC-6, AC-10)
`tests/harness/corpus-req-004/corpus.md` — 30 made-up messages, one test user profile, **labels proposed by me,
to be confirmed by the PM before the first run** (Q2). Scoring method is in that file.

## Cases
| # | Case (from AC) | Type | Surface | Steps | Expected | Actual | Evidence | Result |
|---|---|---|---|---|---|---|---|---|
| 1 | AC-1 "from sender → always notify" | happy | back end (AI-call log) | rule on sender X; message from X with ad-like text | notify; reason "กฎของคุณ: …"; **0 AI calls** for it | | | |
| 2 | AC-2 "contains 'โปรโมชั่น' → never notify" | happy | back end + app | message "มีโปรโมชั่นพิเศษ" | held, "กฎของคุณ: …", 0 AI calls | | | |
| 3 | AC-2 word spelt differently / as part of a word | boundary | back end | "โปรโมชัน" · "โปรโมชั่นส์" · "PROMOTION" for rule "promotion" | reported per matching rule chosen (Q3 default: plain substring, case-insensitive Latin) | | | |
| 4 | Rule kind "from this group → …" | happy | back end | LINE group rule | decided by the rule, 0 AI calls | | | |
| 5 | Two rules disagree | boundary | back end | "always" on sender X + "never" on a word, message matches both | Q3 default: **always notify wins** | | | |
| 6 | No rule matches | state | back end | — | goes to layer 1 then layer 2 | | | |
| 7 | AC-3 bar−1 | boundary | stub | bar 70, stub % = 69 | held | | | |
| 8 | AC-3 bar | boundary | stub | stub % = 70 | notify | | | |
| 9 | AC-3 bar+1 | boundary | stub | stub % = 71 | notify | | | |
| 10 | AC-3 ends | boundary | stub | bar 0 with % 0 · bar 100 with % 100 and 99 | notify · notify / held | | | |
| 11 | Req. 2(c) layer 2 runs even if layer 1 says spam | state | stub (call log) | stub layer 1 = spam | layer 2 is still called | | | |
| 12 | AC-4 record present | happy | app + back end | any AI-judged message | whole-number % 0–100, reason, summary, model per layer, prompt version, bar used; reason readable under "ทำไมถึงแจ้ง / ทำไมไม่แจ้ง" | | | |
| 13 | AC-4 AI returns 70.5 / "70%" / 120 / -5 / missing % | negative | stub | each | never stored as given: treated as a broken answer → fail open (AC-5) | | | |
| 14 | AC-5 gateway down | negative | local, gateway URL → closed port (Q1) | message arrives | notified, marked "AI ไม่ได้ตรวจ"; decision record says so | | | |
| 15 | AC-5 gateway times out | negative | stub (slow) | stub never answers | after the timeout: notified "AI ไม่ได้ตรวจ" — the timeout length recorded | | | |
| 16 | AC-5 broken answer | negative | stub | stub returns non-JSON / wrong shape | notified "AI ไม่ได้ตรวจ" | | | |
| 17 | AC-5 layer 1 ok, layer 2 down | negative | stub | — | notified "AI ไม่ได้ตรวจ" (nothing silently held, req. 7) | | | |
| 18 | AC-6 corpus run | statistical | real gateway | corpus × 3 runs, no fixed rules on the test user | **0 wrong holds on must-notify · ≤ 2 wrong passes · 0 flips on must-notify** at the bar found; per-message %s recorded | | | |
| 19 | AC-6 default bar | statistical | from #18's recorded %s | compute outcomes for every bar 0–100 offline | default = highest bar meeting the pass line; if **no** bar meets it → `TEST_FAILED` (not a bar to lower) | | | |
| 20 | AC-7 change bar | state | app | 70 → 80; a message the stub scores 75 | held under 80 (was notify under 70) | | | |
| 21 | AC-7 bar outside 0–100 / not whole | negative | app + API | 101, -1, 70.5 via API | refused at the server; app does not offer them | | | |
| 22 | AC-8 held → "แจ้ง" | state | app | correct a held message | moves to the notified list; correction recorded with who/when | | | |
| 23 | AC-8 passed → "ไม่ต้องแจ้ง" | state | app | correct a passed one | moves to held; recorded; nothing new sent | | | |
| 24 | AC-8 no learning | regression | stub | after #22, a similar message | judged as before (no auto-learning, D4) | | | |
| 25 | AC-9 model as a setting | happy | back end + app | change layer-1 and layer-2 model in settings, no code change, no rebuild | the next decision shows the new models | | | |
| 26 | AC-10 about line shape | happy | real gateway, corpus | all 30 | present, Thai, one line, ≤ 80 characters (Q4), form `[channel · group or sender] <summary>` | | | |
| 27 | AC-10 about line meaning | eye check | corpus | 10 samples, PM + me | says what it is about; no invented facts — recorded as a human check | | | |
| 28 | Isolation | regression | API | TEST-001 #8 for rules, sentences, bar, decisions | U1 never reaches U2's | | | |

## Run 1 — 2026-11-01 — results per case
How: `harness/qa-a/test-003-stub.ts` (43 checks, exact, fake gateway; it stops the fake gateway itself for #14) ·
`harness/qa-a/corpus-full.ts` run twice on the real gateway (3 runs × 30 messages each), results
`harness/qa-a/corpus-run-1.json`, `corpus-run-2.json`. Every judgement is kept, with its layer-1 summary.

| # | Result | Actual (short) |
|---|---|---|
| 1 | **PASS** | sender rule `always` → notified, decidedBy `rule`, **0 AI calls**, notify step ran (2 `notifications_log` rows: fcm + line, both "not configured") |
| 2 | **PASS** | keyword `โปรโมชั่น` `never` → held, reason "กฎของคุณ: มีคำว่า โปรโมชั่น", 0 AI calls, 0 notifications |
| 3 | **PASS** | "โปรโมชัน" (no rule) → AI decides · "PROMOTION" vs rule "promotion" → held by rule · "โปรโมชั่นส์" → held (substring) |
| 4 | **PASS** | group rule `never` → held, 0 AI calls |
| 5 | **PASS** | `always` (sender) + `never` (keyword) both match → notified by the `always` rule |
| 6 | **PASS** | no rule → layer 1 then layer 2 (`ai_calls` layers 1, 2) |
| 7–9 | **PASS** | bar 70: score 69 → held (0 notifications) · 70 → notified · 71 → notified; bar recorded 70 |
| 10 | **PASS** | bar 0 / score 0 → notified · bar 100 / 100 → notified · bar 100 / 99 → held |
| 11 | **PASS** | layer 1 says `spam` → layer 2 still called |
| 12 | **PASS** (API) · app screen NOT_TESTED | record has whole % 71, reason, summary, layer1 deepseek/deepseek-flash, layer2 deepseek/deepseek-v4-pro, promptVersion v1, bar 70 |
| 13 | **PASS** | score 70.5 · "70%" · 120 · -5 · missing → never stored; 1 retry (2 failed calls) → notified, `ai_unavailable`, score null, "AI ไม่ได้ตรวจ", aboutLine null |
| 14 | **PASS** | fake gateway stopped (connection refused) → notified "AI ไม่ได้ตรวจ" in 1.7 s, 1 call, no retry |
| 15 | **PASS** | gateway never answers → notified "AI ไม่ได้ตรวจ" after 21.8 s, 1 call (20 s timeout, no retry) |
| 16 | **PASS** | layer 1 not JSON → fail open as #13 |
| 17 | **PASS** | layer 1 ok, layer 2 HTTP 500 → fail open as #13 |
| 18 | **FAIL — DEF-1** | see DEF-1: 12/90 judgements fail per corpus run → 5 and 6 must-hold messages notified at bar 70 (line ≤ 2) |
| 19 | **FAIL** (follows #18) | in the product's own terms (a failed judgement is notified) **no bar 0–100 meets the line** in either run |
| 20 | **PASS** | bar 80 → score 75 held (bar 80 recorded) · back to 70 → notified |
| 21 | **PASS** (API) · app control NOT_TESTED | bar 101 / -1 / 70.5 / "70" → 400 `VALIDATION`; bar stays 70 |
| 22 | **PASS** (API) · app button NOT_TESTED | held → "notified": 200, in the notified tab, `decidedBy` user, system decision kept (ai/held), 1 correction row, **no new notification** |
| 23 | **PASS** (API) | notified → "held": in the held tab; unknown outcome → 400 |
| 24 | **PASS** | after a correction, a similar message is judged the same (held) |
| 25 | **PASS** (API) | owner sets layer1 openai/gpt-4o-mini, layer2 gemini/gemini-2.5-flash → next decision and the `ai_calls` row show them; an unlisted model → 400. Admin web page (TASK-009) not driven in this run |
| 26 | **PASS** | stub: `[LINE · กลุ่มทดสอบ QA-A] ขอให้ยืนยันนัด`; long summary / long group name → exactly 80 characters. Corpus: 78/78 answered lines one line, ≤ 80, Thai summary |
| 27 | my half **PASS** · PM half open | I read all 30 run-1 lines: each says what the message is about, no invented facts. PM: please read the 10 below |
| 28 | **PASS** | TEST-001 #8/#9 cover rules, sentences, bar, decisions, corrections across users |

Rule-decided about line (D32, TASK-023): **PASS** on build `8ed1ce4b…`, which is TASK-023's DONE build:
`[LINE · กลุ่มทดสอบ QA-A] ตรงกฎของคุณ: จากคนนี้ u-rule-sender`, the SPEC-001 §3.4 form. On the earlier 16:04 build it
was `null`, so before TASK-023 a rule-decided push would have been titled "AI ไม่ได้ตรวจ".

**AC-10 eye check — 10 samples for the PM** (run 1; message → about line):
| id | message | about line |
|---|---|---|
| N01 | @สมชาย พรุ่งนี้ประชุมลูกค้า 10 โมง ช่วยยืนยันหน่อยว่าเข้าได้ไหม | [LINE · ทีมโปรเจกต์ A] แจ้งประชุมลูกค้าพรุ่งนี้ 10 โมง ขอให้ยืนยันเข้าร่วม |
| N03 | ชายๆ งานสรุปยอดเดือนนี้ต้องส่งก่อนบ่ายสามนะ | [LINE · ทีมโปรเจกต์ A] แจ้งให้ชายส่งสรุปยอดเดือนนี้ก่อนบ่ายสาม |
| N07 | เรื่อง: แผนส่งมอบ — คุณสมชาย (cc) ช่วยยืนยันวันส่งมอบระบบด้วยครับ | [อีเมล · pm@acme.example.test] ขอให้สมชายยืนยันวันส่งมอบระบบ |
| N10 | @สมชาย ด่วน โทรกลับด้วย | [LINE · ทีมโปรเจกต์ A] ถูกแท็กให้โทรกลับด่วน |
| N14 | ตกลงตามที่เสนอครับ แต่ขอแก้ข้อ 3 เป็นจ่ายสองงวดได้ไหม | [LINE · ทีมโปรเจกต์ A] ตอบรับข้อเสนอ แต่ขอแก้ข้อ 3 เป็นจ่ายสองงวด |
| H04 | @All ใครสนใจสั่งชานมไข่มุกบ้าง | [LINE · ทีมโปรเจกต์ A] ถามทุกคนว่ามีใครสนใจสั่งชานมไข่มุกบ้าง |
| H05 | เมื่อวานไปเที่ยวชายหาดมา สวยมาก | [LINE · เพื่อนมัธยม] เพื่อนเล่าว่าเมื่อวานไปเที่ยวชายหาดมา สวยมาก |
| H06 | เรื่อง: แจ้งเพื่อทราบ ตารางเวรเดือนธันวาคม (ไม่ต้องตอบกลับ) | [อีเมล · admin@acme.example.test] แจ้งตารางเวรเดือนธันวาคม ไม่ต้องตอบกลับ |
| H09 | 👍 | [LINE · ทีมโปรเจกต์ A] ตอบกลับด้วยอีโมจิโป้งรับทราบข้อความของผู้ใช้ |
| H16 | ขอบคุณครับ | [LINE · ทีมโปรเจกต์ A] สมาชิกในกลุ่มกล่าวขอบคุณผู้ใช้ |

> **PM eye check, 2026-11-01 (Porter): PASS.** All 10 say what the message is about with no invented facts. One mild
> stretch: H09 adds "รับทราบข้อความของผู้ใช้" to a bare 👍. That is acceptable. On the Observation (mail lines cut mid-word),
> the PM decides as UX writer (REQ-004 § Questions): show the sender's display name, or the part before `@` when there is
> none, and cut at a word boundary with `…`, never mid-word.

## Run 2 — 2026-11-01 — after TASK-031 (build `945cad21…`)
How: the same scripts. QA's instance restarted on a fresh `corner_chat_qa_tanya` (migration `…0003` applied). The exact
suite was updated to TASK-031's settled behaviour (40 s timeout, word-boundary cut with `…`, mail head) and gained 5
checks. The corpus runner now uses the product's own timeout (`LLM_TIMEOUT_MS`, default 40 s), as `gatewayFrom(config)`
does, and keeps every gateway call's log (layer, latency, `completionTokens`).

| What | Result | Actual — evidence |
|---|---|---|
| Exact suite (#1–#17, #20–#26) | **48/48 PASS** | `harness/qa-a/test-003-stub-result.json` (09:47Z) |
| #15 gateway never answers | **PASS** | notified "AI ไม่ได้ตรวจ" after **42.1 s**, 1 call, no retry (TASK-031: 40 s) |
| #26 long summary / long group name | **PASS** | 80 characters, ends `…`, the text before `…` ends on an `Intl.Segmenter("th")` word boundary; a line ≤ 80 is left untouched |
| #26 mail head | **PASS** | `"Anna Lee"` → `[อีเมล · Anna Lee] …` · name stored as the address → `[อีเมล · anna] …` · rule line → `[อีเมล · deals] ตรงกฎของคุณ: มีคำว่า โปรโมชั่น` |
| #12 `ai_calls.completion_tokens` | **PASS** | filled on all 88 successful calls (the fake gateway sends `usage`) |
| **#18 AC-6 corpus, run 3** (30 × 3, real gateway) | **PASS** | **0/90 failed judgements**, 0/180 failed calls · bar 70: 0 wrong holds · 0 wrong passes · 0 flips · bars meeting the line 11–90 · must-notify min 90 · must-hold max 30 — `harness/qa-a/corpus-run-3.json` |
| **#18 AC-6 corpus, run 4** (30 × 3, real gateway) | **PASS** | **0/90 failed judgements**, 0/180 failed calls · bar 70: 0 / 0 / 0 · bars meeting 11–95 · must-notify min 95 · must-hold max 55 — `corpus-run-4.json` |
| #19 default bar | **PASS** (see Q5) | the highest bar meeting the line in **both** runs is **90**; the current default 70 meets it in both |
| #26 corpus about lines | **PASS** | 180/180 one line, ≤ 80; none needed a cut with the new mail head |
| TEST-001 regression (the messages API changed) | **67/67 PASS** | `harness/qa-a/test-001-result.json` (same build) |

Real-gateway calls: the biggest answer used **2418** completion tokens (budget 4096; under the old 300 it would have been
cut). The slowest call took **22.1 s** against the 40 s timeout, and the median was about 2.5 s. The closest must-hold message is
**H04** (@All "ใครสนใจสั่งชานมไข่มุกบ้าง"): 30/15/15 and 25/10/55. The 55 is the one wobble worth watching, still 15
under bar 70.

## Run 3 — 2026-11-01 — app surface (after TASK-026/027/029 DONE)
Build: app `src/` **`43a13788302c50d1`** · back **`f930f30b0d6abb6f`** (after TASK-032; both unchanged before/after). Same
instrument as TEST-001 run 2: the app's browser build at 360×800 against QA's own back end and the fake gateway, by
`data-testid`. `harness/qa-a/app-surface.mjs` → `app-surface-result.json` **30/30 PASS** (12 are TEST-003's).

| # | Result | Actual (app) |
|---|---|---|
| 2 (app) | **PASS** | rule "มีคำว่า โปรโมชั่น → ไม่ต้องแจ้ง" added in the app shows in the list; a matching message is held, and its why card reads "กฎของคุณ: มีคำว่า โปรโมชั่น · ตัดสินโดย: กฎของคุณ" — `a06-conditions.png`, `a07-detail-rule.png` |
| 12 (app) | **PASS** | why card: "ทำไมไม่แจ้ง", reason, "ตรงเงื่อนไข 69% · เกณฑ์ 70%", "ตัดสินโดย: AI", "โมเดล: deepseek-flash / deepseek-v4-pro" — `a04-detail-held-why.png` |
| 14 (app) | **PASS** | an `ai_unavailable` message shows "AI ไม่ได้ตรวจ" on its list row |
| 20 (app) | **PASS** | slider 70 → 80 + save → API bar 80; the next message (score 75) is held; back to 70 saved |
| 21 (app) | **PASS** | label "แจ้งเมื่อตรงเงื่อนไขตั้งแต่ {n}%"; the slider stops at 100 (End, then →) and 0 (Home) |
| 22 (app) | **PASS** | held → "แจ้ง" → "คุณย้ายข้อความนี้มาเอง"; API outcome notified / decidedBy user; the why card keeps the system's "ทำไมไม่แจ้ง" — `a05-detail-moved.png` |
| 23 (app) | **PASS** | notified → "ไม่ต้องแจ้ง" → the row is in the held tab |
| 26 (app) | **PASS** | the list row shows the about line **without** the `[LINE · …]` head (D42) |

Not run: #25's admin-web AI page.

## Run 4 — 2026-11-01 — native APK on the emulator (PM slot, Q6)
Same run as TEST-001 § Run 3: app `bc72845c…`, back `f930f30b…`, APK `harness/qa-a/cornerchat-qa-a-8191.apk`,
`emulator-5554` only, the real phone never addressed. `harness/qa-a/app-emu-result.json` **17/17 PASS** (5 are TEST-003's).
The browser checks re-ran on `bc72845c…`: 30/30.

| # | Result | Actual (APK) |
|---|---|---|
| 12 (APK) | **PASS** | why card "ทำไมไม่แจ้ง · ตรงเงื่อนไข 69% · เกณฑ์ 70% · ตัดสินโดย: AI · โมเดล: deepseek-flash / deepseek-v4-pro" — `shots/e04-why.png` |
| 14 (APK) | **PASS** | the `ai_unavailable` row says "AI ไม่ได้ตรวจ" — `e03-list.png` |
| 20 (APK) | **PASS** | bar to 80 + save → label 80%, API bar 80 — `e06-conditions-80.png` |
| 22 (APK) | **PASS** | held → "แจ้ง" → "คุณย้ายข้อความนี้มาเอง"; API notified / decidedBy user — `e05-moved.png` |

Observations (Team B's REQ-005, not judged here): on the detail screen, a dark toast "ให้ corner-chat ทำงานตลอดเวลา เพื่อแจ้ง
ข้อความใหม่ได้ทันที" covers the lower part of the screen (`e04-why.png`), even though the battery exemption was pre-granted
with `dumpsys deviceidle whitelist`. A notification icon sits in the status bar after sign-in (`e08`). For Tefany's TEST-005.

## Defects
### DEF-1 — **FIXED, verified 2026-11-01 on `945cad21…` (TASK-031)**: 0/180 failed judgements in two corpus runs (was 24/180)
#### (run 1 record, kept) on the real gateway about 1 in 8 AI judgements fails, so must-hold messages are notified "AI ไม่ได้ตรวจ" — BLOCKER (AC-6)
- Build / environment: back `8ed1ce4b…` · owner's gateway `https://ai.develyst.online` · default models (SPEC-001 S10):
  layer 1 `deepseek/deepseek-flash`, layer 2 `deepseek/deepseek-v4-pro`, temperature 0
- Preconditions: the confirmed corpus `harness/corpus-req-004/corpus.md` (30 messages, PM-confirmed labels)
- Repro (from a clean state, from the `corner-chat-back` checkout):
  `LLM_GATEWAY_URL=https://ai.develyst.online bun <ai-worker>/tests/harness/qa-a/corpus-full.ts <ai-worker>/tests/harness/corpus-req-004/corpus.md out.json --runs 3`
  (the product's `createJudge` + `buildAboutLine`, with its own one retry per layer; no database)
- Expected (REQ-004 AC-6): at some bar, 0 wrong holds · ≤ 2 wrong passes · 0 flips over 3 runs.
- Actual: **12 of 90 judgements failed in run 1, and 12 of 90 in run 2** (24/180, 13 %), each after the product's
  retry. Error text, verbatim, with counts over both runs:
  `layer 2 failed after 2 tries: gateway answered with empty content` ×13 ·
  `layer 1 failed after 2 tries: gateway answered with empty content` ×5 ·
  `layer 2 failed after 2 tries: unusable answer: answer is not valid JSON` ×5 ·
  `layer 1 failed after 2 tries: unusable answer: answer is not valid JSON` ×1.
  The product turns each one into a notification marked "AI ไม่ได้ตรวจ" (D3, #13–#17). At bar 70 that is
  **5 wrong passes in run 1 (H02, H04, H07, H11, H14) and 6 in run 2 (H04, H06, H07, H11, H12, H14)**; 0 wrong
  holds, 0 flips. No bar 0–100 meets the line. The SA's runner (`harness/corpus/run-corpus.ts`) scores failures the
  same way.
- For contrast, not a pass: where the AI did answer, it judged every message right: must-notify scores 90–100,
  must-hold 0–15. Any bar from 16 to 90 would separate them. The failure is answers that never arrive, not wrong answers.
- Frequency: 24 of 180 judgements; failing messages differ between runs (it is not a few "hard" messages)
- Evidence: `harness/qa-a/corpus-run-1.json`, `corpus-run-2.json` (every run's error text and every answered judgement)
- Linked cases: #18, #19
(No proposed fix.)

## Observations (not ours)
- ~~Four mail about lines are cut mid-word at 80 characters (e.g. `…ตอบกลับภายในวั`), because the head carries the full sender
  address. In the corpus the "sender" is an address; real mail usually has a display name, so this may not show in use.
  AC-10 is met (≤ 80). It is a wording point for the PM.~~ Settled by the PM's wording (display name / part before `@`, cut
  at a word with `…`) and built in TASK-031. Verified in run 2.
- The working tree changed during the run (TASK-023, mail work). Every exact case was re-run on one fingerprinted build.

## Test data created
| What (id / marker) | Where | End state (removed / left + why) |
|---|---|---|
| corpus (30 made-up messages) | `tests/harness/corpus-req-004/` | kept — it is the regression gate (req. 9) |
| corpus text sent to the owner's gateway: 2 runs × 90 judgements (≈ 360 calls incl. retries) | owner's gateway → outside providers | made-up text only (REQ-004 Constraints, D33) |
| run 2: 2 more corpus runs × 90 judgements (360 calls, 0 retries needed) | owner's gateway → outside providers | made-up text only (D33) |
| users `f-*@qa-a.test`, `u*-*@qa-a.test`, made-up messages, rules, corrections; AI settings set to openai/gemini (#25) | QA's own DB `corner_chat_qa_tanya` (reset before run 2) | left — QA's own; nobody else reads it |
| fake-gateway script `harness/qa-a/gw.json` | harness | kept — re-run input |

## Verdict
**`TEST_PASSED`** (run 2, build `945cad21…`) for REQ-004 as Team A built it. Every AC passes: AC-1–AC-5, AC-7–AC-9
(exact suite 48/48) · **AC-6: 0 wrong holds, 0 wrong passes, 0 flips at bar 70 in two corpus runs of 30 × 3 on the real
gateway, with 0 failed judgements** · AC-10 automatic part plus the eye check (mine and the PM's: PASS) · D32 rule wording.
DEF-1 is fixed and verified. TEST-001 regression 67/67.
Run 3 (2026-11-01): the app screens for the rule, reason, bar, corrections and the about line (#2, #12, #14, #20–#23, #26)
**PASS** on the app's browser build at 360 px.
Run 4 (2026-11-01): the app rows **PASS as a native APK on `emulator-5554`** (#12, #14, #20, #22).
NOT_TESTED, named: a real phone (by design) · admin-web
AI-settings page (#25) — not driven; the API is · the phone notification itself — REQ-005 / TASK-030 (no Firebase any
more, D-B14); here the notify step is proved by `notifications_log` rows only.
Run 1 (`8ed1ce4b…`): `TEST_FAILED` on DEF-1. That record is kept above.

## Evidence (decisive)
- `harness/qa-a/corpus-run-3.json` + `corpus-run-4.json` — run 2's AC-6: 0/90 failed judgements per run; bar 70 → 0 / 0 / 0
- `harness/qa-a/test-003-stub-result.json` — 48/48 exact checks on `945cad21…` (rules, bar ±1, fail open in 5 shapes, 40 s
  timeout, corrections, model setting, word-boundary cut, mail head)
- `harness/qa-a/corpus-run-1.json` + `corpus-run-2.json` — run 1's DEF-1 (12/90 failed per run), kept as the before
- `harness/qa-a/app-surface-result.json` + `shots/a04-detail-held-why.png` — the app rows (run 3)

## Questions
(For the PM — answers as `> answer: ...`. Defaults are what I test if the answer is "yes".)
- **Q1 — test seams (for the SA, via you).** Cases #7–#17 need, on local only: **an AI stub mode** that returns a fixed
  %, a broken answer, or no answer per layer; and **the gateway URL as a setting**. Without them, AC-3 and AC-5 are
  `NOT_TESTED`. Same family as TEST-001 Q3 / TEST-002 Q1.
- **Q2 — corpus labels.** D6 says the team labels the corpus. I drafted 30 messages with proposed labels; the tester
  should not be the only one who sets the answer key she grades against. Default: **you confirm or change each label
  in `corpus.md` before the first run**; I do not run AC-6 on unconfirmed labels.
- **Q3 — rules.** (a) Two rules disagree → default **"always notify" wins** (nothing silently held, same spirit as D3).
  (b) "contains this word" → default **plain substring; Latin letters case-insensitive; no spelling variants** (the
  user adds both spellings). Checked: DECISIONS (AI filter shape — "a matching rule decides and wins") — the case of
  two matching rules is not covered.
- **Q4 — the 80 characters** (AC-10): default **the whole line, including `[channel · group or sender]`**.

> answers `[PM-decided 2026-11-01, under the owner's standing instruction]`: Q1 → SA Team A (testability requirement:
> AI stub per layer — fixed % / broken / none — and the gateway URL as a setting). · **Q2 — labels: I read all 30 in
> `harness/corpus-req-004/corpus.md` and confirm every one as written (14 N / 16 H)**, `[PM-confirmed 2026-11-01]`;
> the owner may relabel later (D6). The pass line stays as REQ-004 AC-6. · Q3 (a) and (b) defaults accepted —
> "always notify" wins a tie; plain substring, Latin case-insensitive. · Q4 default accepted — whole line ≤ 80.

- **Q5 — the default bar (run 2, 2026-11-01).** AC-6 says *"the default bar is the highest bar meeting this line"*. Read
  literally, that is **90**, the highest bar meeting the line in both runs. But at 90 the lowest must-notify score in
  run 3 was exactly 90, so there is **no margin**: one point lower next time and a real message is held. At 70 there is
  20 points of room below the must-notify scores (min 90) and 15 above the highest must-hold score (55, H04).
  **Default: keep 70** and record in AC-6 that "highest meeting the line" is read as the upper limit, not the setting.
  The other choice is 90, which follows the text and has no margin. This changes nothing I test (70 passes); it changes
  what the user gets. Checked: D5 (70 default, "replaced by the bar found in the corpus run") · REQ-004 AC-6 — they
  disagree once the found bar sits on the edge.

- **Q6 — an emulator slot (run 3, 2026-11-01).** The app rows pass on the browser build. The native APK has not been run:
  native HTTP and Android storage, where the token and the saved list live. I need a slot on `cc_phone_360` in which I
  may run `npx cap sync android` + `gradlew assembleDebug` with `VITE_API_BASE` pointing at my own back end (10.0.2.2:8191),
  install it on **`emulator-5554` only**, and run about 10 of the rows above plus TEST-001's (sign-in wording, disabled/reset
  kick-out, the list wiped after a 401, sign-out). No `android/` source edits. **Default: you give the slot after TASK-030's
  current step**; until then the rows stay NOT_TESTED on device. Note: a real phone (`21ec5dd6`) is attached over adb on
  this machine. I will not address it.
  > answer `[PM-decided 2026-11-01, listed D38]`: **keep 70.** A wrong hold (a real message lost) costs more than a
  > wrong pass, so the default needs room below the must-notify scores. REQ-004 AC-6 is amended: the corpus run gives the
  > *upper limit*; the default is set with margin under it.
  > answer to Q6 `[PM, 2026-11-01]`: **your default.** The token and the saved list live in native storage, so the APK run is
  > needed before DELIVERED. I am asking SA-B for a slot after TASK-030's current step, on `emulator-5554` only, with no
  > `android/` source edits. The real phone stays untouched. REQ-001 and REQ-004 stay TEST_PASSED until that run.
