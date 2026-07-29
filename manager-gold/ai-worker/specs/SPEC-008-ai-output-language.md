# SPEC-008: AI output follows the user's selected language
- Source: REQ-008
- Status: DONE (TASK-024/025 accepted 2026-07-29; REQ-008 → SPEC_DONE, pending Porter acceptance)
- Baseline: `../architecture-baseline.md`. Small change on top of SPEC-003 (AI) + SPEC-007 (i18n).

## Overview
The AI-generated **advice** and **note summary** should come back in the user's currently-selected
UI language (Thai/English, matching the REQ-007 switcher; **default Thai**). This is a small prompt
change (BE) plus passing the selected language from the FE. No new endpoints, no data changes.

## Design decisions (Sober)
- **BE:** `POST /api/people/:id/advice` and `/summary` accept an optional `language: "th" | "en"`
  (default **`th`**). The prompt builders append a final instruction: **"Respond entirely in Thai."**
  / **"Respond entirely in English."** Everything else (profile prompt, sections, error/ownership
  handling, gateway call) is unchanged. Invalid `language` (present but not th/en) → `400` validation.
- **FE:** `getAdvice`/`getSummary` send `{ language }` = the current i18n language (`useLang()` from
  SPEC-007). When Thai is selected, advice + summary come back in Thai; English → English.
- Default Thai keeps behaviour sensible before/without a selection.

## API / Interface (delta only)
- `POST /api/people/:id/advice` body: `{ topic?, language? }` — `language ∈ {th,en}`, default `th`.
- `POST /api/people/:id/summary` body: `{ language? }` — same.
- Responses unchanged (`{advice:{content,provider,model}}` / `{summary:{…}}`); content is now in the
  requested language.

## Non-functional
- Tests **mock the gateway** (no real AI). Assert: the outgoing prompt contains the correct
  "Respond entirely in <language>" line; default `th` when omitted; `en` when passed; invalid → 400.
- No isolation/ownership change — still `getOwnedPerson` first; `502 ai_unavailable` unchanged.

## Tasks
- TASK-024: BE — add optional `language` (default th) to advice + summary; thread "Respond entirely
  in <language>" into the prompt builders; mock tests (depends: —) **[startable now]**
- TASK-025: FE — `getAdvice`/`getSummary` send the current i18n language (`useLang`) (depends: TASK-024
  + SPEC-007 TASK-021 for the language state)

## Questions
(Jason / Fern ask here; Sober answers as `> answer: ...`)
