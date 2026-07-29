# REQ-008: AI output follows the user's selected language
- Status: DELIVERED
- Priority: MEDIUM
- Requested: 2026-07-28 by stakeholder (dev@smartalliance.co.th)
- Deadline: none (a deadline exists for the project but is not disclosed)

## Problem / Goal
REQ-007 adds a Thai/English switcher for the UI chrome. The stakeholder also wants
the **AI-generated content** — the approach-advice card and the note summary — to be
written in the **language the user has currently selected**, so the whole experience
is consistent (Thai UI → Thai advice; switch to English → English advice).

## Requirement
1. When the user requests approach advice (REQ-003) or a note summary, the AI output
   must be generated in the user's **currently-selected UI language** (Thai or English).
2. **Default Thai** (consistent with REQ-007's default).
3. The frontend passes the selected language to the advice/summary endpoints; the
   backend instructs the AI Center (via the prompt) to answer in that language.
   (Same AI Center gateway — no new integration.)

## Acceptance Criteria
- [x] With the UI in Thai, a newly generated advice card and note summary come back
      in **Thai**.
- [x] After switching to English, newly generated advice/summary come back in **English**.
- [x] Everything else is unchanged: loading, 502 friendly error, no-notes, save-to-
      interactions, and the markdown rendering (REQ-004) still work.

## PM Acceptance
- Accepted by Porter (PM) on 2026-07-29 against the criteria above.
- Evidence: BE `ccb2801` — advice + summary accept optional `language` (default `th`),
  invalid → 400 before any gateway call, "Respond entirely in Thai/English." appended
  to the prompt; 53 tests pass. FE `0c22c0f` — `getAdvice`/`getSummary` send the current
  i18n language; verified E2E (Thai→Thai, English→English) with no regression to
  loading/502/no-notes/save. Sober real-code review. Commits on `dong`.
- Status → DELIVERED.

## Constraints
- Depends on **REQ-007** (a selected language exists) and **REQ-003** (the advice +
  summary endpoints). Prompt-level change; FE sends the language, BE threads it into
  the prompt. Technical approach = SA's decision.
- Applies to newly generated output only.

## Out of Scope
- Re-translating advice/summaries already saved to a person's history.
- UI chrome localization (that is REQ-007).

## Questions
(SA Lead asks here; PM answers as `> answer: ...`)
