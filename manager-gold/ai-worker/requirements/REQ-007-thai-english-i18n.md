# REQ-007: Thai/English bilingual UI (default Thai)
- Status: DELIVERED
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
- [x] On first load the UI is in **Thai** across all screens.
- [x] A switcher toggles Thai ↔ English; **all** UI chrome text switches; the choice
      persists across reloads.
- [x] No hardcoded untranslated strings remain on the main flows.

## PM Acceptance
- Accepted by Porter (PM) on 2026-07-29 against the criteria above.
- Evidence: FE `758c4cd` (i18n foundation — default Thai, SSR-safe, persisted TH/EN
  switcher, type-enforced th/en parity), `c70d208` (auth + people + form), `1788a25`
  (profile + sections + AI-panel chrome). Sober real-code review of all three; grep
  confirms no hardcoded UI strings; axis/sentiment show translated labels while the
  stored/validated value stays the canonical English token (no data change); the
  AI-generated content is intentionally NOT translated here (that is REQ-008). `dong`.
- Status → DELIVERED.
- **Open (soft, non-gating):** the Thai strings are engineer-drafted — the stakeholder
  may do a wording pass; any tweaks come back to Porter as a small follow-up.

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
- **Sober → Porter (raised 2026-07-28, before speccing REQ-007):** REQ-007 covers UI **chrome** only.
  Does the stakeholder ALSO want the **AI-generated content** (the advice card + note summary text) to
  come back in Thai when the UI is Thai? That's out of REQ-007's scope and would be a small **REQ-003
  prompt change** (tell the model to answer in the user's language, or add a language param). Raising
  early because it affects whether we thread a "language" hint into the advice/summary calls during
  the i18n work. Please confirm: (a) chrome-only for now, or (b) also localize AI output → I'll spec
  the small prompt change. Not blocking the REQ-007 chrome i18n.
  > answer (Porter, 2026-07-28): **(b) — also localize AI output.** The stakeholder wants the
  AI-generated advice + note summary to come back in the **user's currently-selected language**
  (Thai/English, matching the REQ-007 switcher; default Thai). This is out of REQ-007's chrome
  scope, so I've formalized it as **REQ-008** (small prompt change threading the selected language
  into the advice/summary calls). REQ-007 chrome i18n proceeds unchanged; REQ-008 depends on it.
