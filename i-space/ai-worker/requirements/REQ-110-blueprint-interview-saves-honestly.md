# REQ-110: Blueprint's interview must store what it agrees to — and never claim a save that did not happen

- Status: **DELIVERED + COMMITTED** (2026-10-30 08:5x: Owner (typed by Atom, 08:4x) "ขึ้น git REQ-110" → SA A: blueprint-back e2c3326 · blueprint-front b041cbd, pushed; PM verified origin = local, author develyst, 21 / 7 paths) · DELIVERED (2026-10-30 02:4x, the PM, on the owner's choice relayed as *"เจ้าของเลือก (ก)"*, `DECISIONS.md` 2026-10-30 02:4x) — AC-2…AC-9 PASS; AC-1 accepted with point 1 (the 4 service URLs) split to **REQ-114**. **Not committed:** git waits for the owner's own "ขึ้น git REQ-110" typed in the PM pane (a relay does not count for git). · was TEST_FAILED (round 4, 2026-10-30 02:25, QA Tanya — AC-1 live FAIL (DEF-4: the model sends the 4 services as `api` parts with a full URL in `path` → refused; the URLs are in no stored part after 2 rounds); AC-2…AC-9 PASS on fp `0285007b7e05` / `2486e8159750`; 3 of the owner's 6 calls used, 3 unspent; `tests/TEST-107-blueprint-interview-honest.md` § Round 4 — AC-1 LIVE) · was TEST_FAILED (round 3, 2026-10-29 22:16, QA Tanya — AC-1 live FAIL (DEF-3: the accept round's reply wrote `type` for `op` → `protocol`, nothing stored; point 1's URLs not in the spec); 5 of the owner's 6 calls used; `tests/TEST-107-blueprint-interview-honest.md` § Round 3 — AC-1 LIVE) · AC-2…AC-7 PASS (19:35, fp `3a8865972bb7` / `3824d4a9b343`, no gateway call; `tests/TEST-107-blueprint-interview-honest.md` § Round 3) · was TEST_FAILED (round 2, 2026-10-29 17:33, QA Tanya — AC-1 fails live again with the last 2 calls: 2 parts stored, 20 refused for the model's shapes; AC-2…AC-7 PASS; the owner's 8 calls are used up; `tests/TEST-107-blueprint-interview-honest.md` § Round 2) · round 1: TEST_FAILED 16:15 · was READY_FOR_SA (2026-10-29, the PM)
- Priority: HIGH `[PM-decided]` — P1-2 is a trust defect. Team A order: after REQ-103, unless the SA sees a cheaper fix that fits now. Build order stays the SA's call.
- Requested: 2026-10-29 by the PM, from QA's live finding in TEST-106 (REQ-108 phase 1). Stamp `team-proposed` (defect route). Owner intent it rests on: `DECISIONS.md` 10:51 (a), 11:41 item 10 (the interview stays on the gateway).
- Numbered 110: REQ-109 is reserved for "deploy-ready on Linux" in `../project-docs/plan-next-th.md`.
- Team: **A (Blueprint)**.

## Problem / Goal

QA pasted a small, clear spec (the REQ-108 Health Board, `tests/harness/test-106/spec.txt`) as the first interview message and ran
3 rounds the way a user would. Nothing was stored (0 parts), and the bot's replies told the user it had been saved. A PM using
Blueprint would walk away believing the spec is in. (`tests/TEST-106-e2e-live-dashboard.md` § Phase 1 findings P1-1, P1-2, P1-3.)

## Reproduction (from QA's run, 2026-10-29 ~13:10–13:24)

1. blueprint-back + blueprint-front locally at f60b934 / e46322a, real gateway (owner allowed for REQ-108).
2. Create a project in the dialog. Paste the text of `tests/harness/test-106/spec.txt` as the first chat message. Press Enter.
3. Observed: round ends `changes_rejected`, log `[round] changes_rejected reason=validation`, `changeSetId: null`. The reply says
   *"…ผมจึงรวมรายละเอียด…ไว้ในเนื้อหาของหน้าเว็บแทน…"* (implies saved). The model proposed part kind `feature`, which
   `spec/registry.ts` does not have.
4. Send "save it again": `changes_rejected` again; the reply says *"แก้ไขให้ถูกต้องแล้วครับ"*.
5. Picker "เก่งที่สุด" (flagship): `bot_could_not_answer`, `reason=timeout` after 382 s.
Evidence: `tests/harness/test-106/messages-*.json`, `1-chat-after-round1.png`, `2-round2.png`, `4-round3-flagship.png`.

## Requirement

1. When a user gives the interview a clear spec like the Health Board text, the parts it proposes are stored (or proposed for "ตามนั้น") in kinds the registry accepts.
2. When a round's changes are rejected, the chat says plainly that **nothing was saved**, and why, in words a PM understands. It never says "saved / แก้แล้ว" for a rejected round.
3. When the model does not answer in time, the user sees that, and can retry with a lower tier.
4. **AMENDED 2026-10-29 by the PM** (TEST-107 DEF-1 + O-4): when some proposed changes are valid and some are not, the valid ones are **stored** and the refused ones are reported to the user one by one, with the reason. A whole round is no longer thrown away for one bad change (SPEC-105 § Risks names this step). `[PM-decided]`
5. **AMENDED 2026-10-29** (O-4): every refused change is recorded with **which** change it was and **why**, readable by the team after a live run, so a failure can be diagnosed without spending new gateway calls. Never the key; never a secret. `[PM-decided]`
6. **AMENDED 2026-10-29 22:2x by the PM** (TEST-107 round 3 DEF-3): when the user accepts the bot's own offer ("ตามนั้น"), the agreed answer and the parts the model sends with it are **stored**. A reply that is readable except for a small naming slip the team can recognise (live: `type` written where the protocol reads `op`) is not thrown away whole; what cannot be read is recorded per req 5. How to read it is the SA's design. `[PM-decided]`
7. **AMENDED 2026-10-29 22:2x by the PM** (TEST-107 O-9): a whole-spec first message on the default tier must not be lost to the time limit when the answer is merely slow. Live, the answer arrived at 91.2 s against a 90 s limit, and the user was told "too slow" and the paid answer was dropped. The user may wait up to about **3 minutes** for a first answer before the timeout sentence shows. Req 3 (timeout sentence + retry) still applies past that. `[PM-decided]`

## Acceptance Criteria

- [ ] **AC-1** — **Given** a new project **When** the user pastes `tests/harness/test-106/spec.txt` as the first message **Then** after at most 2 rounds (accepting with "ตามนั้น" where offered) the project has parts covering all 6 points and the "ไม่ทำ" list.
  - Check: QA, `GET /v1/projects/{id}` part count + spec pages. Needs the real gateway (Q1).
- [ ] **AC-2** — **Given** a round whose changes are rejected (forced in a test with a fake model that proposes an unknown kind) **When** the reply shows **Then** it contains the § Wording "nothing saved" sentence, and no sentence claiming the change was made.
  - Check: QA, with the stub gateway — no live call needed.
- [ ] **AC-3** — **Given** the fake model proposes kind `feature` **When** the round runs **Then** either it is mapped to an existing kind, or it is rejected with AC-2's message. It is never silently dropped.
  - Check: QA, stub gateway.
- [ ] **AC-4** — **Given** the model times out **When** the user looks at the chat **Then** the § Wording timeout sentence shows, with a way to retry on a lower tier.
  - Check: QA, stub gateway that sleeps past the limit.
- [ ] **AC-6** (added 2026-10-29, req 4) — **Given** a fake model that proposes 5 changes of which 1 is invalid **When** the round runs **Then** the 4 valid ones are stored and the chat names the 1 refused change and its reason.
  - Check: QA, stub gateway.
- [ ] **AC-7** (added 2026-10-29, req 5) — **Given** that round **When** the team looks at the stored round record **Then** it shows which change was refused and why.
  - Check: QA, API/DB read (no live call needed).
- [ ] **AC-8** (added 2026-10-29 22:2x, req 6) — **Given** the recorded live accept reply from TEST-107 round 3 (`tests/harness/test-107/r3/ac1-round3-accept-messages.json`, `roundRaw`, changes written with `type`) **When** it is replayed through the round with a stub **Then** its changes are stored (incl. the `data` part with the 4 URLs), or each one that is not is named with its reason.
  - Check: QA, stub replay — no live call.
- [ ] **AC-9** (added 2026-10-29 22:2x, req 7) — **Given** a stub that answers a first message after 120 s **When** the round runs **Then** the answer is stored, not dropped as a timeout; a stub that never answers still gets AC-4's timeout sentence.
  - Check: QA, stub gateway.
- [ ] **AC-5** (regression) — the interview rounds that TEST-101 saw work with the stub (send, accept, answer, park, retry, undo) still behave the same; blueprint-back tests still pass.
  - Check: QA.

## User-facing wording (the PM)

| Where | TH | EN |
|---|---|---|
| round rejected | รอบนี้ยังไม่ได้บันทึกอะไรเลย — {เหตุผลสั้น ๆ} ลองพิมพ์ใหม่หรือแก้ตามนี้ได้ครับ | Nothing was saved this round — {short reason}. Try again or adjust as suggested. |
| model timeout | AI ตอบไม่ทันเวลา — ยังไม่ได้บันทึกอะไร ลองใหม่ หรือเปลี่ยนเป็นรุ่นที่เร็วกว่า | The AI didn't answer in time — nothing was saved. Retry, or switch to a faster model. |

## Constraints

- **LLM gateway:** AC-2/3/4 use the stub (no live call). AC-1 needs live calls: **ask the owner first (Q1)**. REQ-108's permission covers only that test project.
- Claude CLI is not involved. No change to the seam.

## Out of Scope

- Moving the interview off the gateway (owner 11:41 item 10: it stays). · Hand-entered requirements (REQ-103).

## Questions

- **Q1 (PM → owner, when AC-1 is ready to test — does not block the build)** — AC-1 needs a few live gateway rounds to prove the real model now stores the spec. Ask at test time, with the expected number of calls.
  > answer: **ANSWERED 2026-10-29 15:5x by the owner, typed in the PM pane, `[operator]`** — *"ได้ ใช้ gateway ไม่เกิน 8 ครั้ง (REQ-110 Q1, ให้ Tanya เทส AC-1)"*: QA may make at most 8 gateway calls for AC-1. (`DECISIONS.md` 15:5x)
- **Q5 (SA A → PM, wording for round 3 — does not block; FE builds the default)** — a part was saved, but one malformed optional field was left out (SPEC-105 E9). One line per such item, under the saved/not-saved lines: "{ชื่อรายการ} — บันทึกแล้ว แต่ตัดช่อง {field} ออก" / EN "{item} — saved, without its {field} field". Correct it if wrong.
  > answer: accepted as written. — Porter (PM) 2026-10-29 `[PM-decided]`
- **Q6 (SA A → PM, for the owner — how many live calls the next AC-1 proof needs)** — ask for **6**, expect 2–4: 2 rounds, each 1 call, +1 for a correction, +1 if a reply is unreadable, and R8 can double a failing transport call. If round 1 stores the spec, round 2 isn't spent. If the 6 run out, the stored record says why with no further call (SPEC-105 § Round 3).
  > PM: will ask the owner for 6 when round 3 reaches SPEC_DONE (so the calls are spent on a finished build). — Porter 2026-10-29
  > answer (owner via Atom 2026-10-29 20:02): *"REQ-110 Q6 อนุมัติ ใช้ gateway จริงเพิ่มได้ไม่เกิน 6 ครั้ง ให้ Tanya เทส AC-1 ได้เลย"* — up to 6 live gateway calls for AC-1; none beyond that without asking again (`DECISIONS.md` 20:02). — Porter
- **Q4 (SA A → PM, wording for req 4 / AC-6 — does not block; FE builds the defaults)** — correct only the line that is wrong:
  - **some saved, some not (header):** "บันทึกแล้ว {n} รายการ — ยังไม่ได้บันทึก {m} รายการ:" / EN "Saved {n} — {m} not saved:"
  - **one line per refused item:** "{ชื่อรายการ} — {เหตุผล}". The reasons:
    - `unknown_kind`: "AI เสนอข้อมูลแบบ “{kind}” ที่ Blueprint ยังไม่รองรับ" (as already accepted)
    - `needs_user_words`: "การแก้หรือลบสิ่งที่คุณพูดไว้เองต้องใช้คำของคุณ" (as already accepted)
    - `invalid_change`: "ข้อมูลไม่ครบหรือไม่ถูกรูปแบบ"
    - `depends_on_refused`: "ผูกกับรายการที่ไม่ได้บันทึก"
  - **past 50 items:** "และอีก {n} รายการ"
  - **nothing saved:** the accepted "รอบนี้ยังไม่ได้บันทึกอะไรเลย — …" sentence, then the same list.
  - The model's own text isn't shown when anything was refused (SPEC-105 E5c).
  > answer: all lines accepted as written; part of REQ-110's decided wording. — Porter (PM) 2026-10-29 `[PM-decided]`
- **Q3 (SA A → PM — the gate for SPEC_DONE)** — TASK-109 and TASK-110 are DONE, and AC-2…AC-5 check yes. AC-1 is "no" in my AC check only because it can't be checked without a live gateway call (Q1, the owner's word). The REQ itself gives AC-1 to QA's live run. **May REQ-110 go SPEC_DONE → QA**, with AC-1 explicitly left to that live run? Default: yes. If no, REQ-110 waits at IN_SPEC until the owner allows the live rounds.
  > answer: **yes** — SPEC_DONE → QA for AC-2…AC-5 now; AC-1 explicitly left to the live run. The PM asks the owner for Q1 now (≤ 8 gateway calls: up to 2 rounds × 2 attempts, plus one re-run). — Porter (PM) 2026-10-29 `[PM-decided]`
- **Q2 (SA A → PM, wording — does not block; FE builds the defaults)** — the `{เหตุผลสั้น ๆ}` in the "round rejected" sentence, one per reason code. The defaults are in `specs/SPEC-105-blueprint-interview-honest.md` § Questions Q2; correct only the line that is wrong.
  > answer: all four reason strings accepted (SPEC-105 § Questions). — Porter (PM) 2026-10-29 `[PM-decided]`
- **Note (SA A, for the PM's planning, not a question)** — root cause: the prompt never listed the kinds the server accepts. SPEC-105 adds that list, but AC-1 is proven only by the live run (Q1). If the model still strays, the next step is applying the valid changes and reporting the refused ones (size M) — see SPEC-105 § Risks.
- **Round 4 (PM → SA A, 2026-10-29 22:2x)** — TEST-107 round 3 live: TEST_FAILED on AC-1 only (DEF-3 `type` for `op` voided the accept round; O-9 90 s limit dropped a 91.2 s answer). Added req 6–7, AC-8, AC-9. Please also say: (a) if the stored `roundRaw` (cut at 4000 chars) is enough for AC-8's replay — if not, write AC-8 as "the changes that fit in the record", and tell me; (b) how many live calls the next AC-1 proof needs (the owner has 1 of his 6 unspent; I ask him for more only at SPEC_DONE).
  > answer (a): **yes, enough. AC-8 stays as written.** The 4000-char `roundRaw` is cut only inside its last key (`…], "contradictions`). Closed with `": [] }` it parses, and holds all **9 changes** and 2 questions (the `data` part with the 4 URLs, 3 decisions, the SCR-001 update, 4 links). Nothing the replay needs is lost. Checked by Sober 22:3x with a scratch parse of `tests/harness/test-107/r3/ac1-round3-accept-messages.json`. The closing `": [] }` is the test's addition, named in TASK-130. — Sober (SA A) 2026-10-29
  > answer (b): ask for **6 in total**: his 1 unspent counts, so 5 more. Expect 3–4: round 1 = 1 call (+1 correction); round 2 "ตามนั้น" = 1 (+1 correction, +1 re-ask if unreadable). The 3-minute first answer should save the call L1 lost. Detail: SPEC-105 § Round 4. — Sober (SA A) 2026-10-29
  > owner (2026-10-30 01:1x): *"ได้ 5 ครั้ง (รวมที่เหลือเป็น 6 ครั้ง) ให้ Tanya เทส AC-1 ของ REQ-110 แบบ live ได้เลย ถ้าครบ 6 แล้วไม่ผ่านให้หยุดแล้วถามใหม่"* — `DECISIONS.md` 2026-10-30 01:1x; relayed to QA. — Porter
  > note (inferred, for QA to confirm at the re-test): in L3 the user's accept itself **was** stored. The response carries `changeSetId 72171499…` (D-023), and the final spec holds Q-001 `answered`. Only the model's parts were lost.

## Verification (by QA)

Build: HEAD a4bf924 / a52e022 + Team A's REQ-110 working-tree changes (fp `d833b2d400d0` / `75ac7c78ec4e`). Detail: `tests/TEST-107-blueprint-interview-honest.md` § Results.

| AC | Verdict | What I checked myself |
|---|---|---|
| AC-1 | **FAIL** | round 1 (6 calls): 2 rounds `changes_rejected` / `invalid_change`, 0 parts. **Round 2 (last 2 calls):** round 1 `applied`, 2 parts, 20 refused (8 invalid model shapes: refs, missing/mistyped bodies; 12 cascades); round 2 ended `http_503` when the correction hit the cap. Owner's 8 calls used up (DEF-1) |
| AC-6 | PASS (round 2) | 5 proposed, 1 invalid → 4 stored; the chat names the refused one and why |
| AC-7 | PASS (round 2) | the bot row lists the refused change (`item`, `kind`, `reason`, `detail`); live it made the failure diagnosable with no extra call. Gap O-6: lost when the correction call fails |
| AC-2 | PASS | a fake model's "บันทึกให้แล้วครับ" never shows; the "nothing saved" sentence shows in clean-blue, luxury-gold and minimal-mono; the stored bot row has empty content (#1–2) |
| AC-3 | PASS | `feature` → `changes_rejected` / `unknown_kind` / note `feature`, named in the sentence, 0 parts (#1, #3) |
| AC-4 | PASS | a 100 s model → ~91 s, exactly 1 call, the timeout sentence; "ลองใหม่" re-runs and applies; "เปลี่ยนโมเดล" → "เร็ว" sets `tier:small` (audited) (#4–6) |
| AC-5 | PASS | send → applied → undo on screen; back 249/16/0; front 219 unit, 4 + 34 + 948 required items 0 failures (#7–8) |
| **Round 3** (19:35, fp `3a8865972bb7` / `3824d4a9b343`) | AC-2…AC-7 **PASS** · AC-1 **NOT_TESTED** | AC-2/3/4/6/7 re-run as round 2; replay of the live round-2 shapes (stub): 8/8 parts stored, nothing refused, each repair named; "saved, but field X left out" lines in 3 themes (behind "ดูรายละเอียด" in 2: TEST-107 Q7); unreadable reply → `protocol` + `roundRaw` kept; back 267/16/0 (`--timeout 30000`, see TEST-107 instrument note), front 234 / 4 / 34 / 948 |
| **Round 3 live** (22:16, same fp, 5 of 6 calls) | AC-1 **FAIL** | round 1: timeout (answer came at 91.2 s) → "ลองใหม่" → applied, **16 stored / 1 refused**, points 2–6 + "ไม่ทำ" stored; point 1's API URLs not stored. Round 2 "ตามนั้น" on Q-001 → `protocol` ×2: the model wrote `type` for `op` (`roundRaw`), losing a reply that held the 4 URLs (DEF-3) |
| **Round 4** (02:21, fp `0285007b7e05` / `2486e8159750`, no gateway) | AC-2…AC-9 **PASS** | AC-8: the recorded live accept reply, replayed through "ตามนั้น" in the page on the rebuilt live state → 9/9 stored in 1 call, DATA-001 with the 4 URLs, 9 × `op_renamed`. AC-9: a 120 s first answer stored; a 200 s one → timeout sentence at ~181 s. AC-2…7 as before; back 276/16/0 (`--timeout 30000`), front 235 / 4 / 34 / 948 |
| **Round 4 live** (02:25, same fp, 3 of 6 calls) | AC-1 **FAIL** | round 1 answered in 87.4 s → `applied`, 6 saved / 8 refused: the 4 services sent as `api` parts with a full URL in `path` → `invalid_change` (+ 4 links). Round 2 "ตามนั้น" ×2 → 14 saved / 2 refused; points 2–6 + "ไม่ทำ" stored; **the 4 URLs in no part** (DEF-4). Stopped with 3 calls unspent |

## AC check (SA A — Sober, 2026-10-29 15:4x)

| AC | Where it is met (deliverable) | Self-checked |
|---|---|---|
| AC-1 | Build side only: E1, the registry-generated kinds list in the prompt (`blueprint-back → src/interview/context.ts` `kindsBlock()`; test "E1: the prompt holds every model kind…", TASK-109). **That the real model now stores the Health Board spec can only be shown by a live gateway run** (this REQ's Q1, the owner's word). | **no** — not self-checkable without a live call (see Q3) |
| AC-2 | `test/interview/honest.test.ts` "E2 / AC-3: … no reply text…" (TASK-109); real render "รอบนี้ยังไม่ได้บันทึกอะไรเลย — …" in 4 themes, the model's text never shown (TASK-110 DoD 4). | yes |
| AC-3 | `honest.test.ts`: `feature` twice → `changes_rejected`, `unknown_kind`, note `feature`, 0 parts (TASK-109); the sentence names "feature" on the real page (TASK-110 DoD 4). Rejected and named, never dropped. | yes |
| AC-4 | `honest.test.ts` "E3 / AC-4: … exactly 1 call, … reason timeout" (TASK-109); the timeout sentence plus ลองใหม่ / เปลี่ยนโมเดล on the real page with a stub sleeping past 90 s (TASK-110 DoD 4). | yes |
| AC-5 | Back 249/16/0 (one existing test changed, E2, listed in TASK-109 DoD 4); front 219 unit, states 34, isolation 4 (TASK-110). **Round 2:** back 258/16/0 (two `round.test.ts` changes, E5, listed in TASK-123 DoD 3); front 227 unit, states 34, isolation 4 (TASK-124). | yes |
| AC-6 *(round 2, Sober 17:2x)* | `test/interview/partial.test.ts` "AC-6": 5 changes, 1 bad → 4 stored, `saved` 4, 1 refused, 1 gateway call (TASK-123). Real render: "บันทึกแล้ว 4 รายการ — ยังไม่ได้บันทึก 1 รายการ:" + the item line on its own line, in 4 themes (TASK-124 DoD 4 + rework). | yes |
| AC-7 *(round 2)* | `partial.test.ts` "AC-7": `GET …/messages` → `roundRefused` with item/op/kind/ref/key/title/reason/detail, 50 + `more`, plus `roundSaved` (TASK-123). The stored row on the real run: `{"roundSaved":4,"roundRefused":[{"item":"changes[4]",…,"reason":"unknown_kind",…}]}` (TASK-124 DoD 4). | yes |
| AC-1 *(round 2 note)* | Unchanged: still only provable live. Round 2 makes a live failure diagnosable from the stored record, with no extra call (AC-7). Q3's ruling (AC-1 left to the live run) is applied again for this SPEC_DONE. | **no** — live only (Q1, Q3) |
| AC-1 *(round 3, Sober 18:2x)* | Build side: types + ref rule in the prompt (E7), safe repairs (E8), optional-field drop (E9). **The real model's recorded round-2 answer, replayed, now stores all 20 changes it lost live** (`test/interview/shapes.test.ts` "live replay", TASK-126). Only a new live run proves the model itself (Q6: 6 calls, expect 2–4). | **no** — live only (Q3 ruling applied again) |
| Req 5 / O-6 *(round 3)* | E10: an unreadable reply keeps reason `protocol`, note `then <reason>`, and `roundRaw` (≤ 4000) (`shapes.test.ts` E10, TASK-126). A repaired-and-saved part is named in the chat when a field was dropped (TASK-127 real render, 4 themes). | yes |
| AC-5 *(round 3)* | back 267/16/0 (one existing test changed, E7, listed in TASK-126 DoD 3); front 234 unit, states 34, isolation 4 (TASK-127). | yes |
| AC-8 *(round 4, Sober 2026-10-30)* | E11 `blueprint-back → src/interview/protocol.ts:41-47` reads `type` as `op`. `test/interview/op-slip.test.ts` replays the recorded live accept reply (`test/fixtures/op-slip-accept-reply.json` = `roundRaw` + `": [] }`): `applied`, **all 9 changes stored**, nothing refused, 1 call, DATA-001 holds the 4 URLs, `roundAdjusted` = 9 × `op_renamed` (TASK-130). E11b: the prompt names `"op"` (`context.ts:64`). | yes |
| AC-9 *(round 4)* | E12 `client.ts` `firstAnswerTimeoutMs` 180 s; only the round's first call uses it (`round.ts:659`). `op-slip.test.ts` (scaled: 40 ms limit, 200 ms first answer): an answer at 120 ms is stored; one that never comes → `timeout` at ~200 ms (TASK-130). QA's real 120 s stub is the check the AC names. | yes (scaled test; real-time check is QA's) |
| Req 6 / AC-1 *(round 4)* | Build side: the reply that lost the URLs live now stores them (AC-8 row). That the real model stores the whole spec in ≤ 2 rounds is still **live only** (Q3 ruling applied again; calls: § Questions Round 4 answer (b), 6 in total). | **no** — live only |
| AC-5 *(round 4)* | back: `test/interview` + `test/seam` 113/0 (Sober's re-run); full suite 275/16/1, the 1 = AC-A3 load timeout that passes alone and in that run (TASK-130 § Review); one existing test changed (`honest.test.ts:145`). front: unit 235/0, check:api matches, typecheck 0 (TASK-131). | yes |
