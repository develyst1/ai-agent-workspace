# REQ-003: Submit an idea and see the AI analysis
- Status: READY_FOR_SA
- Priority: HIGH
- Requested: 2026-09-17 by the owner
- Deadline: none
- Source: chat 2026-09-17 / 2026-09-18; SYSTEM-FACTS.md §What the product is, §Idea intake

## Problem / Goal
The core of Possibility: a signed-in user types what they want built, in free text, and
the AI analyses it for feasibility, impact on society, and interestingness. The user sees
three 0–100 scores, the tier (REQ-001), a short reason, and the discount.

## Requirement
1. One free-text box, single field, no structured form. Min 20 characters, max 3,000.
2. Submitting sends the text to the AI; while waiting the user sees a loading state (W-4).
3. The AI returns: three integer scores 0–100 (feasibility, impact on society,
   interestingness) and a short reason (at most 3 sentences) in the user's current UI language.
4. The result page shows: the submitted text, the three scores with their labels, the
   idea tier + its description (REQ-001 wording), the discount, the reason, and the
   "interested in hiring" button (REQ-004).
5. Every idea is saved with its scores, tier, reason, date, and owner user; the user
   sees a list of their own past ideas (newest first) and can open any result again.
6. If the AI fails or returns anything outside the contract, nothing is saved and the
   user sees W-6 with a retry.
7. The AI judges the idea only: it must not produce content unrelated to the three
   axes, and must not reveal the score thresholds.

## Acceptance Criteria
- [ ] AC-1 — **Given** a signed-in user **When** they type a valid idea and submit **Then** after the loading state a result appears with three integer scores each 0–100, a tier name from REQ-001, the matching discount, and a non-empty reason.
- [ ] AC-2 — **Given** the result page **When** the tier is computed **Then** it equals the REQ-001 rule applied to the three shown scores (Tanya recomputes by hand).
- [ ] AC-3 — negative: text shorter than 20 characters → submit is disabled and W-2 shows; text over 3,000 → cannot type further and the W-3 counter turns red.
- [ ] AC-4 — negative: empty / whitespace only → submit disabled.
- [ ] AC-5 — **Given** a user with 3 past ideas **When** they open "My ideas" **Then** the 3 ideas are listed newest first with date, tier, and the first 80 characters of the text; opening one shows its saved result unchanged (no re-analysis).
- [ ] AC-6 — **Given** user A's idea **When** user B tries to open it by its address **Then** B gets "not found", never A's content.
- [ ] AC-7 — negative: the AI call fails (Tanya simulates by cutting the AI key/network) → W-6 is shown, no idea is saved, retry re-sends the same text.
- [ ] AC-8 — **Given** UI language English **When** an idea is analysed **Then** the reason is in English; in Thai → Thai.
- [ ] AC-9 — regression: REQ-001 AC-4/AC-5 — the user tier updates only upward after a result.

## User-facing wording (Porter as UX writer)
- W-1 box placeholder: "เล่าไอเดียที่คุณอยากให้เราทำ — อยากได้อะไร เพื่อใคร ทำไม" / "Tell us the idea you want us to build — what, for whom, and why."
- W-2 too short: "เขียนอย่างน้อย 20 ตัวอักษร" / "Write at least 20 characters."
- W-3 counter: "{n} / 3000"
- W-4 loading: "AI กำลังวิเคราะห์ไอเดียของคุณ…" / "The AI is analysing your idea…"
- W-5 submit button: "วิเคราะห์ไอเดีย" / "Analyse my idea"
- Axis labels: "ความเป็นไปได้" / "Feasibility" · "ผลกระทบต่อสังคม" / "Impact on society" · "ความน่าสนใจ" / "Interestingness"
- Reason heading: "เหตุผลจาก AI" / "Why the AI thinks so"
- W-6 failure: "วิเคราะห์ไม่สำเร็จ ลองอีกครั้ง" / "Analysis failed — please try again." · button "ลองอีกครั้ง" / "Try again"
- List: "ไอเดียของฉัน" / "My ideas" · empty state: "ยังไม่มีไอเดีย — เริ่มเล่าไอเดียแรกของคุณ" / "No ideas yet — tell us your first one."

## Constraints
- Signed-in only (REQ-002). Which AI model/provider is Sober's call in SPEC-001, subject to the owner's approval via Porter.
- Scores are produced by the AI; the tier is computed by the system (REQ-001).

## Out of Scope
- Editing or deleting an idea. Re-analysing the same idea. Sharing results publicly.

## Questions
