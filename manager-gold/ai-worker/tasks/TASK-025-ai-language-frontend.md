# TASK-025: Send selected language to the AI calls (FE)
- Source: SPEC-008
- Status: DONE
- Assignee: Fern (FE)
- Depends on: TASK-024 (BE accepts `language`), SPEC-007 TASK-021 (the i18n language state)

## What to do
In `manager-gold-front`, pass the current UI language to the AI calls:
- `getAdvice`/`getSummary` in `lib/people.ts` send `{ language }` = the current i18n language
  (`useLang()` from the SPEC-007 provider). Since these are called from components, read the language
  in the component (AdvisorSection / NoteSummarySection) and pass it into the helper.
- Result: with **Thai** selected, the advice + summary come back in Thai; **English** → English.
  No other behaviour changes (loading / 502 / no-notes / save-to-interactions unchanged).

## Definition of Done
- [x] With the backend running: switch UI to Thai → generate advice → the card content is Thai; switch
      to English → advice content is English. Same for the note summary. (Verify vs a stub or the real gateway.)
- [x] The advice/summary requests include `language` matching the current switcher.
- [x] No regression in the advisor/summary panels; `bun run build` clean. Walkthrough in Notes.

## Implementation Notes
**Commit:** `0c22c0f` on `dong` (3 files, source only).

**Files touched**
- `lib/people.ts` — `getAdvice(id, topic, language: "th"|"en")` and `getSummary(id, language: "th"|"en")`
  now include `{ language }` in the POST body (advice: `{ topic, language }` or `{ language }` when no
  topic; summary: `{ language }`, which is why summary now sends a JSON body where it previously sent
  none). Matches the TASK-024 BE contract exactly (optional `language`, default `th`, invalid → 400).
- `components/AdvisorSection.tsx`, `components/NoteSummarySection.tsx` — read `const { lang } = useLang()`
  (the SPEC-007 provider) and pass it into the helper. No other change; loading / 502 / no-notes /
  save-to-interactions all unchanged.

**Verification** (own language-aware mock on `:4098`; front on `:3020` via `NEXT_PUBLIC_API_BASE`; Jason's
real `:4020` untouched; own PIDs stopped afterward — front 23108, mock 24888; both ports released). The
mock mirrors the BE contract: `language` absent → treated as `th` (default), `th`/`en` → that language,
anything else → 400 before returning content; the returned content is Thai when `th`, English when `en`,
so the FE can prove the switcher drives AI output.
- **Mock contract (curl):** `{}` → Thai content; `{"language":"en"}` → English; `{"language":"th"}` →
  Thai; `{"language":"fr"}` → **400**. Summary same.
- **Browser E2E** on `/people/p1`:
  - **Thai** selected → "ควรเข้าหาคนนี้อย่างไร?" → advice card = **Thai** ("โทน / อบอุ่น แต่ ตรงไปตรงมา …").
  - Switch **English** → regenerate → advice card = **English** ("Tone / Warm but direct …").
  - **Note summary** same: EN → English body, TH → Thai body.
  - Because the mock returns English content *only* when the request body carries `language:"en"` (default
    is Thai), the English render deterministically proves the request carried the switcher's language.
- `bun run build` → compiled + TypeScript clean; the only callers of the two helpers are these two panels
  (grep) so the added required param can't break another call site. No behaviour/API change beyond the
  added `language` field.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE** — Sober, 2026-07-29 (commit `0c22c0f` on `dong`). Read `lib/people.ts`
(`getAdvice`/`getSummary`) + grepped the call sites:
- Both helpers now take a required `language: "th"|"en"` and send `{language}` in the POST body —
  matches the TASK-024 BE contract (optional there, default th, invalid→400; the FE only ever sends
  th/en from the switcher). `getSummary` now sends a JSON body where it previously sent none — fine.
- `AdvisorSection` and `NoteSummarySection` read `useLang().lang` and pass it into the helper; nothing
  else changed (loading/502/no-notes/save unchanged). Grep confirms these are the only callers, so the
  now-required param can't leave a broken call site — build is clean.
- E2E (Fern): Thai selected → Thai advice+summary; English → English; §7 followed (own mock :4098; left
  Jason's :4020 alone).

DoD: all 3 met. **Last task of SPEC-008 — REQ-008 complete. This is the final engineering task of the
project (all 25 tasks DONE).**
