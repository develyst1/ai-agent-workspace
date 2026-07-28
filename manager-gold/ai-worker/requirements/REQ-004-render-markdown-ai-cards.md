# REQ-004: Render markdown in the AI cards
- Status: DELIVERED
- Priority: MEDIUM
- Requested: 2026-07-28 by stakeholder (dev@smartalliance.co.th)
- Deadline: none (a deadline exists for the overall project but is not disclosed)

## Problem / Goal
The AI Center returns lightly-formatted markdown (e.g. `**Tone:**`, headings,
lists). The current AI cards show that markup **as literal text** (`**` visible),
which looks unpolished and is harder to read. The stakeholder wants the AI output
to render nicely. This is a visual polish on already-delivered REQ-003 features.

## Requirement
1. The **Approach Advisor** card must render the model's markdown — bold, headings,
   lists, and line breaks — instead of showing raw markdown characters.
2. The **Notes-summary** card must render the same way, with **consistent styling**
   to the advisor card (both AI cards should look like one family).
3. Rendering must be **safe**: model output is untrusted text and must not be able
   to inject HTML/script (no XSS) or break the page layout.
4. Existing behaviour is unchanged: loading state, the friendly "AI unavailable"
   (502) message, the "add some notes first" (no-notes) state, and save-to-interactions.

## Acceptance Criteria
- [x] In the advisor card, `**Tone:**` (and similar) shows as real bold / headings,
      not literal `**`.
- [x] The note-summary card renders markdown the same way and looks consistent
      with the advisor card.
- [x] Model output containing HTML/script (e.g. `<img onerror=…>`) is rendered
      inertly — no script executes, layout intact.
- [x] Loading, 502 friendly-error, no-notes, and save-to-interactions still work.

## PM Acceptance
- Accepted by Porter (PM) on 2026-07-28 against the 4 criteria above.
- Evidence: FE `ded3086` — shared `components/Markdown.tsx` (react-markdown, **no
  `rehype-raw`, no `dangerouslySetInnerHTML`**, `allowedElements` excludes `a`/`img`)
  used by both AI cards; browser test rendered a live XSS payload (`<img onerror>` /
  `javascript:` / `<script>`) **inert** (alert never fired, layout intact); markdown
  renders (no literal `**`); loading/502/no-notes/save regression clean; build clean.
  Sober security-focused real-code review. Commit local on `dong`.
- Status → DELIVERED.

## Constraints
- Frontend-only change expected (Next.js + Mantine); no new backend behaviour
  anticipated. (Final technical approach + any markdown library = SA/engineer decision.)
- Applies to the AI cards delivered in REQ-003 (advisor + summary) — keep them consistent.

## Out of Scope
- Changing what the AI returns or the prompt.
- Deployment (tracked separately as a human/Porter item).

## Questions
(SA Lead asks here; PM answers as `> answer: ...`)
