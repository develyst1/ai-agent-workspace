# REQ-001: User tiers — definitions, discounts, and the score → tier rule
- Status: READY_FOR_SA
- Priority: HIGH
- Requested: 2026-09-17 by the owner
- Deadline: none
- Source: chat 2026-09-17 / 2026-09-18 (`possibility-spec` is empty); facts in SYSTEM-FACTS.md §Tier definitions

## Problem / Goal
Possibility takes in freelance / innovation work. A user describes the idea they want to
hire us to build; the AI scores it; the user gets one of five tiers, which drives the
discount the owner gives when he quotes the hire (outside the system). This REQ fixes
the tier model. Submitting/scoring is REQ-003; the hire request is REQ-004.

## Requirement
1. There are exactly five tiers, in this order, with exactly these names (never
   paraphrased, in either UI language): **Ordinary · Seeker · Raw Diamond · Visionary · The Possibility**.
2. Every new user starts as **Ordinary**.
3. Each analysed idea has three scores, integers 0–100: feasibility, impact on society,
   interestingness (REQ-003 produces them).
4. **Idea tier** = from the LOWEST of the three scores:
   `< 40` Ordinary · `40–59` Seeker · `60–74` Raw Diamond · `75–89` Visionary · `>= 90` The Possibility.
   The tier is computed by this rule — the AI does not choose it.
5. **User tier** = the highest idea tier the user has ever received. A new idea can raise
   it, never lower it.
6. Discount per tier: Ordinary 0 % · Seeker 5 % · Raw Diamond 10 % · Visionary 20 % ·
   The Possibility 30 %. The system only DISPLAYS the discount; pricing is outside the system.
7. Each tier has a one-line description (wording below) shown with the tier.

## Acceptance Criteria
- [ ] AC-1 — **Given** a brand-new user who has just signed in for the first time **When** they open any page that shows their tier **Then** it shows `Ordinary` with discount `0%`.
- [ ] AC-2 — **Given** an idea scored (feasibility 80, impact 62, interesting 95) **When** the tier is computed **Then** the idea tier is `Raw Diamond` (lowest = 62).
- [ ] AC-3 — boundary: lowest score exactly 40 → `Seeker`; 59 → `Seeker`; 60 → `Raw Diamond`; 74 → `Raw Diamond`; 75 → `Visionary`; 89 → `Visionary`; 90 → `The Possibility`; 39 → `Ordinary`; 0 → `Ordinary`; 100 → `The Possibility`.
- [ ] AC-4 — **Given** a user whose user tier is `Visionary` **When** they submit a new idea that scores `Seeker` **Then** the idea shows `Seeker` but the user tier stays `Visionary`.
- [ ] AC-5 — **Given** a user whose user tier is `Seeker` **When** a new idea scores `Raw Diamond` **Then** the user tier becomes `Raw Diamond` immediately after the result is shown.
- [ ] AC-6 — **Given** any tier shown anywhere (result page, admin page, profile) **When** the UI language is Thai or English **Then** the tier NAME is the exact English string from Requirement 1 (no translation), and the discount shown matches Requirement 6.
- [ ] AC-7 — negative: a score outside 0–100 or non-integer from the AI must not produce a tier; the idea is shown as failed per REQ-003 AC-7 (retry), never as `Ordinary` by default.

## User-facing wording (Porter as UX writer)
Tier names: always the exact English strings. Descriptions (TH / EN):

| Tier | TH | EN |
|---|---|---|
| Ordinary | ไอเดียทั่วไป มีคนทำอยู่แล้วมากมาย | A common idea — many like it already exist. |
| Seeker | มีปัญหาชัดเจนและเหตุผลจริง ทำได้ แต่ยังไม่ใหม่ | A clear problem with a real reason — doable, not yet novel. |
| Raw Diamond | มีมุมใหม่จริง เป็นประโยชน์เกินกว่าตัวผู้ขอ | A genuinely new angle, useful beyond you. |
| Visionary | ทำได้จริง ดีต่อสังคมชัดเจน และน่าสนใจจนเราอยากทำ | Feasible, clearly good for society, and interesting enough that we want to build it. |
| The Possibility | หายากมาก — ไอเดียที่อาจเปลี่ยนชีวิตคนจำนวนมาก | Rare — an idea that could change how many people live or work. |

Labels: "ระดับของคุณ" / "Your tier" · "ส่วนลด" / "Discount", value shown as `5%` (Thai: `ส่วนลด 5%`).

## Constraints
- Tier names are the owner's exact words (SYSTEM-FACTS). Never paraphrased in code, DB, or UI.
- Stack undecided (SPEC-001) — this REQ is business-only.

## Out of Scope
- How the AI arrives at the three scores (REQ-003).
- Pricing / quoting the hire — done by the owner outside the system.

## Questions
