# REQ-005: UI/UX redesign — clean, minimal, modern (+ dark mode)
- Status: DELIVERED
- Priority: MEDIUM
- Requested: 2026-07-28 by stakeholder (dev@smartalliance.co.th)
- Deadline: none (a deadline exists for the project but is not disclosed)

## Problem / Goal
The stakeholder tried the app and found the UI unattractive and not pleasant to
use. Goal: make the whole app look and feel **clean, minimal, and modern** (a tidy
SaaS look) while staying on the **Mantine** component library. Same features — just
a much better-looking, easier-to-use interface.

## Requirement
1. Restyle the app to a **clean / minimal / modern** visual system using Mantine:
   consistent theme (colors, typography, spacing), clear visual hierarchy, tidy
   forms, cards, buttons, and navigation/header.
2. Cover all the main screens: register, login, people list, person profile
   (including the AI advisor card + note-summary card), and app navigation.
3. Provide a **light / dark mode** toggle; the choice persists across reloads and
   **both** modes look polished.
4. **Responsive** — usable and tidy on a narrow window / mobile width.
5. No functional regressions — every existing flow keeps working (auth, people
   CRUD, interactions/feelings/tags, search/filter/export, AI advice + summary).

## Acceptance Criteria
- [x] Main screens are visibly restyled to a consistent clean/minimal/modern Mantine
      theme (spacing, typography, hierarchy) — not the current default look.
- [x] Light/dark toggle works and persists; both modes are polished.
- [x] Layout is responsive (no broken layout on mobile width).
- [x] All existing flows still work (no behaviour regressions).
- [x] **Stakeholder reviews the new look and approves it** — approved 2026-07-29
      ("REQ-005 ผ่านละ") after a live review of the running app.

## PM Acceptance
- Accepted by Porter (PM) on 2026-07-29. Criteria 1–4 verified by Sober's real-code
  review + Fern's browser checks (FE `5c8d86a`/`6b30c73`/`9298ae6` on `dong`);
  criterion 5 met by the stakeholder's live review + explicit approval.
- Status → DELIVERED.
- Note: this REQ is the visual redesign only. Thai default + language switcher is
  REQ-007, and AI-output language is REQ-008 — both still pending (the app is in
  English with no switcher until those land; expected, not a defect).

## Constraints
- Must stay on **Mantine** (stakeholder-mandated). Frontend-only expected.
- **Coordinate with REQ-007 (Thai/English i18n)** — both rework all screens; SA to
  sequence so they don't clash (e.g. do them together, or redesign then i18n).
- The exact palette/theme tokens are the SA/FE's proposal; the stakeholder approves
  the result.

## Out of Scope
- New features or screens (this is a visual/UX pass on what exists).
- Backend changes.

## Questions
(SA Lead asks here; PM answers as `> answer: ...`)
