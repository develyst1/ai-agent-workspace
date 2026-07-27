# REQ-003: AI "Approach Advisor"
- Status: READY_FOR_SA
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
- [ ] From a person, the user receives AI-generated approach advice for a given topic.
- [ ] The advice clearly reflects that person's stored profile (not generic filler).
- [ ] The AI call is routed through the AI Center API (not a hardcoded/other provider).
- [ ] If the AI Center is unreachable, the user sees a clear error — no crash.

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
