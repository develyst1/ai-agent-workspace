# TASK-024: AI language param (BE) — advice + summary
- Source: SPEC-008
- Status: DONE
- Assignee: Jason (BE)
- Depends on: none [startable now — doesn't need REQ-007]

## What to do
In `manager-gold-back`, make the AI advice + summary respond in the requested language:
- `POST /api/people/:id/advice` and `POST /api/people/:id/summary` accept an optional
  `language: "th" | "en"` in the body, **default `"th"`**. If present but not `th`/`en` → `400`
  validation. (Ownership, topic validation, gateway/502 handling all unchanged.)
- Thread it into the prompt builders (`buildAdviceMessages`/`buildSummaryMessages`): append a final
  instruction line — **`Respond entirely in Thai.`** (th) / **`Respond entirely in English.`** (en).
  Nothing else about the prompts changes.

## Definition of Done
- [x] `bun test` (gateway mocked): advice/summary with `language:"en"` → the outgoing prompt contains
      "Respond entirely in English."; omitted → default "…in Thai."; `language:"th"` → Thai; invalid
      `language` → 400 (no gateway call).
- [x] Ownership (404) + 502 + existing advice/summary tests still pass (no regression).
- [x] No real AI call in tests; runs on the Postgres test DB.

## Implementation Notes
Implemented by Jason on 2026-07-29 in `H:\manager-gold\manager-gold-back`
(branch `dong`, commit `ccb2801`). Gateway mocked — no real AI call.

**Files changed:**
- `src/ai/advice.ts` — added `Language = "th"|"en"` + `LANGUAGES`; a `languageInstruction()`
  helper; `buildAdviceMessages(..., language="th")` and `buildSummaryMessages(notes, language="th")`
  now append the final system line `Respond entirely in Thai.` / `Respond entirely in English.`
  (nothing else about the prompts changes).
- `src/ai/routes.ts` — `readLanguage(body)` (default `"th"`; present-but-invalid → 400
  `{fields:{language:"must be 'th' or 'en'"}}`). Threaded into both `/advice` and `/summary`;
  validated before the gateway call so an invalid language never hits the AI. Ownership/topic/notes/502
  handling unchanged.

**Verification — `bun test` → 53 pass / 0 fail (on the Postgres test DB, gateway mocked):**
- advice: omitted → system prompt contains "Respond entirely in Thai."; `language:"en"` → "Respond
  entirely in English."; `language:"fr"` → 400 with `fields.language`, **no gateway call**.
- summary: same (default Thai / `en` / invalid `de` → 400 no call).
- No regression — all prior advice/summary/404/502/isolation tests still green.

**Notes for review:**
- Instruction is appended to the **system** message (final line) — minimal, leaves the profile/section
  prompt intact. Response shape unchanged (`{advice}` / `{summary}`); only the content language changes.
- Default `th` keeps sensible behaviour before/without a selection (matches SPEC-008).
- FE (TASK-025) sends `{language}` from the i18n switcher — this BE accepts it as built.
- Commit local on `dong` only (not pushed), per baseline §6/§7.

## Questions
(Jason asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE** — Sober, 2026-07-29 (commit `ccb2801` on `dong`). Read `ai/advice.ts` + `ai/routes.ts`:
- `languageInstruction(lang)` → "Respond entirely in English/Thai." appended as the final system line;
  `buildAdviceMessages`/`buildSummaryMessages` take `language="th"` default. Prompts otherwise unchanged.
- `readLanguage(body)`: null→`"th"` (default), valid `th`/`en`→that, invalid→null → route returns `400
  {fields:{language:"must be 'th' or 'en'"}}` **before** the gateway call. Threaded into advice + summary.
- Ownership/topic/notes/502 handling unchanged; response shape unchanged (only content language changes).
- 53 tests pass (default th / en / invalid→400 no-call; no regression). Gateway mocked; runs on PG test DB.

DoD: all 3 met. → FE TASK-025 sends `{language}`; this BE accepts it as built.
