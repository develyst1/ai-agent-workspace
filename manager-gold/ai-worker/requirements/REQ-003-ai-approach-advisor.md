# REQ-003: AI "Approach Advisor"
- Status: DELIVERED (CORE + optional note-summary tier)
- Priority: MEDIUM
- Requested: 2026-07-26 by stakeholder (dev@smartalliance.co.th)
- Deadline: set by stakeholder but intentionally not disclosed

## Problem / Goal
The payoff feature. Given a person (from REQ-002) and a topic/goal the user wants
to discuss, the system uses **AI** to advise HOW to approach that person: who to
talk to about what, in what tone, what storyline/points to use, and what to avoid.
Stakeholder's words (Thai): "...เวลาฉันจะเข้าหาใครเรื่องอะไร ... ต้องพูดในเนื้อเรื่อง
แบบไหน เป็นเว็บเกี่ยวกับการให้คำแนะนำในการเข้าหาคนคนนั้น ๆ".

## Requirement
1. From a person's profile, the user can ask "How should I approach this person?",
   optionally entering a specific topic or goal.
2. The system must generate the advice by calling the **existing AI Center API**
   (the develyst-ai gateway) using that person's stored profile + the user's
   topic/goal as input.
3. The advice output should be a practical **"approach card"**: suggested tone,
   opening line(s), key points to make, things to say / avoid, and timing.
4. The system may also use AI to summarize a person's long free-form notes into a
   concise profile summary.
5. Generated advice is viewable and (nice-to-have) can be saved into that person's
   interaction history.

## Acceptance Criteria
- [x] From a person, the user receives AI-generated approach advice for a given topic.
- [x] The advice clearly reflects that person's stored profile (not generic filler).
- [x] The AI call is routed through the AI Center API (not a hardcoded/other provider).
- [x] If the AI Center is unreachable, the user sees a clear error — no crash.

## PM Acceptance
- Accepted by Porter (PM) on 2026-07-28 against the 4 criteria above (the CORE).
- Evidence: BE `17e1da5` — 45 tests + a **live** call to `https://ai.develyst.online`
  returning HTTP 200 (`deepseek`) with a **profile-specific** approach card; FE
  `1aec437` — browser 200 (advice card + save-to-interactions) and the 502 "AI
  unavailable" friendly-error path. Reviewed by Sober (real code). Commits local on `dong`.
- Status → DELIVERED (CORE).
- **Optional "may also" tier** (requirement #4, AI note-summarization — TASK-013 BE
  + TASK-015 FE): stakeholder chose to build it (2026-07-28); **accepted by Porter
  on 2026-07-28.** Evidence: BE `11ed8a2` (`POST /api/people/:id/summary`; 49 tests;
  same isolation + 400/404/502 posture as the CORE), FE `bb2e74d` ("Summarize notes"
  panel; no-notes / 502 friendly states). Reviewed by Sober (real code).
- **REQ-003 fully DELIVERED** — CORE + optional tier. All SPEC-003 tasks (012–015) DONE.
- Known cosmetic (not a defect, deferred): AI cards render the model's literal markdown
  (`**Tone:**`) as plain text. Nicer markdown rendering would be a small new REQ if wanted.

## Constraints
- Depends on REQ-001 and REQ-002.
- AI MUST be powered by the existing AI Center API — the **develyst-ai gateway**.
  Human-provided reference (Bruno collection): `H:\chipint\develyst-ai\bruno`
  — a chat gateway with endpoints observed as: Chat (Default / OpenAI / Gemini /
  DeepSeek / xAI Grok / Multi-model), Models, Info. (Endpoint/contract details are
  the SA Lead's to specify.)
- Real AI Center base URL / API keys / environment values come from the **human
  via DATA REQUEST** — never guessed or committed.
- FE Next.js + Mantine; BE Bun + Hono.

## Out of Scope
- Building or hosting the AI models themselves (the AI Center already provides them).
- Any model fine-tuning / training.

## Questions
(SA Lead asks here; PM answers as `> answer: ...`)
