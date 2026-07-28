# REQ-005: UI/UX redesign — clean, minimal, modern (+ dark mode)
- Status: READY_FOR_SA
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
- [ ] Main screens are visibly restyled to a consistent clean/minimal/modern Mantine
      theme (spacing, typography, hierarchy) — not the current default look.
- [ ] Light/dark toggle works and persists; both modes are polished.
- [ ] Layout is responsive (no broken layout on mobile width).
- [ ] All existing flows still work (no behaviour regressions).
- [ ] **Stakeholder reviews the new look and approves it** (visual sign-off — the
      final gate, since "nice" is the stakeholder's judgment).

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
