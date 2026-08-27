# TASK-024: FE — apply the approved Thai-primary `th` strings
- Source: SPEC-006
- Status: BLOCKED (waiting: the stakeholder's sign-off on the reword drafts, via Porter — SPEC-006 §Questions Q-SA-22)
- Depends on: Q-SA-22 answered

## What to do

Reword the flagged **`th`** values in
`src/constant/text/dictionaries.ts` to be Thai-primary, exactly as the stakeholder
approves in SPEC-006 §Questions (Q-SA-22). This is the **only** file you touch, and
you touch **only** string values inside the `th` object.

- Apply **only** the strings the stakeholder said yes to. If he keeps a given git
  term in English, leave that `th` value exactly as it is now — do not translate it
  on your own initiative.
- The candidate set and the proposed drafts are the table in SPEC-006 `## Flow`.
  The authoritative wording is whatever Q-SA-22's answer settles; if his answer
  changes a draft, use his wording, not the draft.
- **Do NOT touch** the `en` object, any other file, or the language switch. Add no
  key, remove no key — the `MessageKey` set and `en`'s `Record<MessageKey,string>`
  must still match key-for-key (a mismatch is a typecheck error).
- **Do NOT touch** `app.name` ("KnowCode"), `reports.new.branch` / 
  `reports.view.params.branch` ("Branch", kept per Q37), the URL placeholder, the
  `Asia/Bangkok` identifier, or the `TH`/`EN` short codes.

If Q-SA-22's answer needs a Thai word you are unsure of, do **not** guess — ask in
`## Questions` (`@Sober`); a wrong Thai string is copy the stakeholder reads.

## Definition of Done
- [ ] Only `th`-object string values in `dictionaries.ts` changed; `git diff`
      touches that one file and no others.
- [ ] Every changed string matches the wording the stakeholder approved in Q-SA-22
      (no un-approved copy shipped).
- [ ] `en` object, `MessageKey` set, and all excluded keys unchanged.
- [ ] `bun run typecheck` exit 0 (proves `th`/`en` still key-match).
- [ ] `bun run build` green, same four routes (`/`, `/login`, `/reports/new`,
      `/reports/[jobId]`); `API_PROXY_TARGET` set before build per the standing
      proxy rule.
- [ ] `git status --porcelain` empty after commit; commit hash recorded here.

## Implementation Notes
(Fern fills this in.)

## Questions
(Fern asks; Sober answers as `> answer: ...`.)

## Review
(Sober fills this in at REVIEW.)
