# REQ-007: Thai/English bilingual UI (default Thai)
- Status: READY_FOR_SA
- Priority: MEDIUM
- Requested: 2026-07-28 by stakeholder (dev@smartalliance.co.th)
- Deadline: none (a deadline exists for the project but is not disclosed)

## Problem / Goal
The app should be usable in **Thai first**. The stakeholder wants a **Thai/English
language switcher**, with **Thai as the default**, so the app is primarily Thai now
and can be used in English too. Stakeholder's words (Thai): "ขอ base on ภาษาไทย
ใช้งานไทย เป็นไทยก่อน แล้วปรับเป็นอังกฤษได้" + chose "ทำสวิตช์ ไทย/อังกฤษ เลย".

## Requirement
1. All user-facing UI text is localized in **Thai and English**, built on an i18n
   structure (so languages are easy to maintain/extend).
2. **Default language is Thai.**
3. A visible **language switcher** lets the user toggle **Thai ↔ English**; the
   choice **persists** across reloads.
4. Coverage: all screens and states — register/login, people list & forms, person
   profile, the AI advisor + summary panels' labels/buttons, error messages,
   empty states, and navigation.

## Acceptance Criteria
- [ ] On first load the UI is in **Thai** across all screens.
- [ ] A switcher toggles Thai ↔ English; **all** UI chrome text switches; the choice
      persists across reloads.
- [ ] No hardcoded untranslated strings remain on the main flows.

## Constraints
- Frontend (Next.js + Mantine). i18n library/approach = SA/FE decision.
- **Coordinate with REQ-005 (UI redesign)** — both touch every screen; SA to
  sequence so text extraction + restyle happen efficiently (ideally together).

## Out of Scope / open question
- **Language of AI-generated content** (the advice card + note summary text) is
  produced by the AI model and is **NOT** covered here (this REQ is UI chrome only).
  If the stakeholder also wants the AI's advice/summary written in Thai, that's a
  separate small change to the prompt (REQ-003 area) — flag for a decision; not
  included in this REQ.

## Questions
(SA Lead asks here; PM answers as `> answer: ...`)
