# REQ-004: Each message is judged against the user's own conditions, and only what fits reaches them
- Status: READY_FOR_SA
- Priority: HIGH `[team-proposed]` — the reason the product exists
- Requested: 2026-11-01 by the owner — stamp: operator (shape) · operator-delegated (pipeline, `DECISIONS.md`)
- Deadline: none
- Depends on: REQ-001 · fed by REQ-002 and REQ-003 · shown by REQ-005
- Source: `SYSTEM-FACTS.md` · `DECISIONS.md` (AI filter shape) · understanding doc § "Team round" (SA + QA replies)

## Problem / Goal
Too much noise reaches people. Each user sets what matters to them; an AI does the reading.
> "เกิดมา เพื่อรวม และ กรอง ตามกฏ กติกาที่เราตั้งไว้ เอไอ ทำการกรองช่วย" · "ชั้นแรก วิเคราะห์ ก่อน ว่าข้อความที่เข้ามานี่ ถึงเรามั้ยวะ … สรุปออกมา แล้ว เอามาทั้งข้อความเพียวๆ และข้อความที่สรุปได้มา ตั้งคำถามว่า มันเข้าเงื่อนไข ของผู้ใช้มั้ยวะ เข้ากี่% ถ้าเข้าเกณ ก็ ส่งข้อความนั้นให้ผู้ใช้ พร้อมบอกด้วย เขาทักมาเเกี่ยวกับ อะไร" (operator, 2026-11-01)

## Requirement
1. Each user has **fixed rules** — from this sender / contains this word / from this group → *always notify* or
   *never notify* — and **a few plain Thai sentences** the AI reads ("ใช่ ทั้งสอง").
2. Order for every taken-in message (`DECISIONS.md`): (a) fixed rules, no AI — a matching rule decides and wins;
   (b) **layer 1** (a fast model): is it addressed to the user? what does it mean? a one-line Thai summary;
   (c) **layer 2** (a stronger model), on every message left even if layer 1 thinks it is spam: raw text + summary vs
   the user's sentences → a whole number 0–100 % + a reason; (d) **% ≥ the user's bar → notify** (REQ-003, REQ-005).
3. The bar is one number per user, default **70 %** `[D5]`, changeable in the app. Exactly at the bar notifies.
4. The notification's "about" line is `[channel · group or sender] <layer-1 summary>` `[D12]`.
5. Each decision is kept with the message: who decided (rule / AI), the %, the bar, the reason, the summary, the model
   used per layer, the prompt version. The user can read the reason in the app.
6. The model for each layer is a **setting**, not code ("เลือกใช้ได้หลายตัว แล้วแต่เหตุการณ์"); all AI calls go through the
   owner's gateway (`llm-gateway` skill).
7. Gateway down or a broken answer → **notify anyway**, marked "AI ไม่ได้ตรวจ" `[D3]`. Nothing is silently held.
8. The user can correct a decision: a held message → "แจ้ง", a passed one → "ไม่ต้องแจ้ง"; recorded, no auto-learning `[D4]`.
9. A **test corpus** of 30 made-up Thai messages (group chatter, ads, untagged name, @All, Cc mail, a real request…),
   each labelled must-notify / must-hold by the team `[D6]`, lives in `tests/harness/` and is run against the real
   gateway 3× per change of model, prompt or bar.

## Acceptance Criteria
- [ ] **AC-1** — **Given** a rule "from <sender> → always notify" **When** that sender's message arrives **Then** it notifies, with no AI call.
  - Check: QA — AI-call log.
- [ ] **AC-2** — **Given** a rule "contains 'โปรโมชั่น' → never notify" **When** such a message arrives **Then** it is held with reason "กฎของคุณ", no AI call.
  - Check: QA.
- [ ] **AC-3** — bar logic with the AI stubbed: % = bar−1 → held · bar → notify · bar+1 → notify.
  - Check: QA — stubbed run, exact.
- [ ] **AC-4** — every AI-judged message has a whole-number % 0–100, a reason, a summary, and the models used, readable in the app.
  - Check: QA.
- [ ] **AC-5** — **Given** the gateway is stopped **When** a message arrives **Then** the user is notified with "AI ไม่ได้ตรวจ".
  - Check: QA.
- [ ] **AC-6** — corpus run (3 runs, real gateway): **0 wrong holds** on must-notify messages · **≤ 2 wrong passes** ·
  **0 flips** on must-notify (pass line set by the PM **before** the run, `[team-proposed]`, Tanya's method).
  - Check: QA — runs the corpus; the default bar is the highest bar meeting this line.
- [ ] **AC-7** — the user changes the bar in the app → the next message uses the new bar.
  - Check: QA.
- [ ] **AC-8** — the user marks a held message "แจ้ง" → it moves to the notified list and the correction is recorded.
  - Check: QA.
- [ ] **AC-9** — changing the layer-1 or layer-2 model in settings changes the model shown on the next decision, with no code change.
  - Check: QA.
- [ ] **AC-10** — the about line is present, Thai, one line, ≤ 80 characters, and says what the message is about (human eye on 10 corpus samples).
  - Check: QA + PM (eye check).

## User-facing wording
| Where | TH |
|---|---|
| Conditions screen title | เงื่อนไขของฉัน |
| Sentences field hint | เขียนเป็นประโยคว่าอยากให้แจ้งเรื่องแบบไหน เช่น "แจ้งเฉพาะเรื่องงานที่ต้องตอบ ไม่เอาโฆษณา" |
| Rule: always / never | แจ้งเสมอ / ไม่ต้องแจ้ง |
| Rule kinds | จากคนนี้ · มีคำว่า · จากกลุ่มนี้ |
| Bar setting | แจ้งเมื่อตรงเงื่อนไขตั้งแต่ {n}% |
| Reason header | ทำไมถึงแจ้ง / ทำไมไม่แจ้ง |
| Rule reason | กฎของคุณ: {rule} |
| AI down marker | AI ไม่ได้ตรวจ |
| Correct buttons | แจ้ง / ไม่ต้องแจ้ง |

## Constraints
- AI only through the owner's gateway; key in `.env` (B4). Message content may go to the gateway's outside providers ("ได้", operator 2026-11-01).
- Temperature 0 for both layers `[team-proposed, SA]`. Corpus messages are made up, never real.

## Out of Scope
Auto-reply · learning from corrections · per-channel bars · sentiment · English prompts/UI.

## Questions

**Q-SA-1 — wording for the owner's AI settings page (SA Sober, 2026-11-01).** Not blocking (TASK-009 uses keys until answered).
`Checked:` wording table above — req 6 says "a setting" but gives no page words. One Thai line each: `admin.ai.title` ·
`admin.ai.layer1` / `admin.ai.layer2` (with a one-line hint each: "fast first read" / "decides against the user's conditions") ·
`admin.ai.provider` · `admin.ai.model` · `admin.ai.gatewayChooses` (provider = let the gateway pick) · `admin.ai.saved` ·
`admin.ai.gatewayDown`.
> answer `[PM, UX writer, 2026-11-01]`: `admin.ai.title` ตั้งค่า AI กรองข้อความ · `admin.ai.layer1` ชั้นที่ 1: อ่านและสรุป — hint
> อ่านเร็ว ดูว่าถึงผู้ใช้ไหม และสรุปเป็นหนึ่งบรรทัด · `admin.ai.layer2` ชั้นที่ 2: เทียบเงื่อนไข — hint เทียบกับเงื่อนไขของผู้ใช้
> แล้วให้คะแนนเป็น % · `admin.ai.provider` ผู้ให้บริการ · `admin.ai.model` รุ่น · `admin.ai.gatewayChooses` ให้ gateway เลือกเอง ·
> `admin.ai.saved` บันทึกแล้ว · `admin.ai.gatewayDown` ติดต่อ AI gateway ไม่ได้ ข้อความจะยังแจ้งเตือนโดยติดป้าย "AI ไม่ได้ตรวจ"

~~**Q-SA-2 — who owns the corpus content?**~~ Withdrawn by the SA the same session: already settled — Tanya's
`tests/harness/corpus-req-004/corpus.md`, labels confirmed by the PM (amendment below). TASK-006's runner reads that file.

**Q-SA-2 — two more admin-web wording points (SA Sober, 2026-11-01, from FE Fern's TASK-009).** Not blocking.
`Checked:` Q-SA-1 answer here and REQ-001 Q-SA-1/Q-SA-2 answers — not covered. (a) `admin.common.save` — the save button on
the AI settings page (one Thai word or phrase). (b) `admin.linePushes.title` reads "ข้อความ LINE ที่ส่งเดือนนี้", but the panel has
a month picker, so it can show October while the title says "this month". Keep it, or give a title for any month, e.g. with
`{month}`? My default: a title with `{month}`.
> answer `[PM, UX writer, 2026-11-01]`: (a) `admin.common.save` บันทึก · (b) your default — `admin.linePushes.title`
> becomes **ข้อความ LINE ที่ส่งในเดือน {month}** (e.g. "พฤศจิกายน 2569"); REQ-001's Q-SA-1 line is replaced by this one.

**SA notes for the record** `[SA-decided 2026-11-01, SPEC-001 §3.5, §6]`: if an *always* and a *never* rule both match, *always*
wins (same direction as D3) · a user's correction to "แจ้ง" moves the message but sends no notification · first models: layer 1
deepseek-v4-flash, layer 2 gemini-2.5-pro, both temperature 0, replaced by the corpus run · a new mailbox takes in only mail
that arrives after it is connected (no flood of old mail).
- **Testability requirement (from QA Tefany, TEST-004 Q6 / TEST-005 Q5; PM 2026-11-01) — the filter and the base must
  provide it for both teams** (also REQ-001 § Questions): an AI stub per layer (fixed % / broken / none), the gateway URL
  as a setting, an AI-call log (one line per call: message id, layer, model) · an AI stub switch
  (pass / hold / down) · the decision time stored per message · one way to list every row intake wrote. Same lines in REQ-003.
- **Amended 2026-11-01 by the PM** (QA Tanya TEST-003 Q3/Q4, PM-decided): two matching fixed rules disagree → "always
  notify" wins · "contains this word" = plain substring, Latin case-insensitive, no spelling variants · the ≤ 80
  characters in AC-10 count the whole line. Corpus labels confirmed by the PM 2026-11-01 (TEST-003 Q2).
