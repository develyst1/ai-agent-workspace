# TASK-009: BE + FE — acceptance run against the public sample repo, both languages
- Source: SPEC-001
- Status: TODO
- Assignee: Jason (BE) drives; Fern (FE) supplies the UI evidence
- Depends on: TASK-005, TASK-008

## What to do

This is the one **network-touching** exercise in the project (SPEC-001
"Testing"). It walks SPEC-001's "Acceptance mapping" table end to end and
produces the evidence Porter needs for REQ-001 acceptance.

Sample repository (DATA REQUEST 2, answered by the human, **public — no token**):
`https://github.com/develyst1/smart-scheduler-front.git`

Runs to perform, through the **UI**, logged in as a seeded user:

1. **Public repo, no token, date range, language `th`** → a report renders on
   screen, readable end to end, no download step.
2. **Same run, language `en`** → the whole report body is English; identifiers,
   file paths and shas are untranslated in both.
3. **Single day** (`dateFrom == dateTo`) on a day that has commits → the report
   covers that day only, counted in **Asia/Bangkok**.
4. **A day with no commits** → `NO_COMMITS`: a clear "no work in this period"
   result presented as success, not an error.
5. **Author filter** (a real author string from that repo) and **branch filter**,
   each alone and both together → the commit appendix contains only matching
   commits.
6. **Extra context** — run twice with the same parameters, once with a distinctive
   instruction in the extra-context box, and show the difference in the output
   (REQ-001 AC 7).
7. **Project context** — the report uses the repo's own vocabulary from its
   README/`docs` (REQ-001 AC 6).
8. **Logged out** — with the session cookie cleared, the report URL and a direct
   `POST /api/reports` both refuse (`401 AUTH_REQUIRED`) and no job is created.
9. **PAT hygiene** — run once against a repository using a dummy token, then grep
   the DB dump and all logs for it: **zero hits** (REQ-001 AC / SPEC-001 PAT
   handling 7). If no private repo is available, the TASK-005 dummy-token
   evidence stands in — say so explicitly.
10. **Negative token case** — a private repo URL with **no** token must produce
    `REPO_AUTH_FAILED` with the "may need a valid access token" message, not a
    bare "not found" (SPEC-001 error table).
11. **The four TASK-006 auth flows, against the REAL backend** (added by Sober
    2026-08-20 as the condition of answering Q-FE-3 with "(a)"). TASK-006's
    manual check was performed against a throwaway fake of the three SPEC-001
    auth endpoints, because `code-report-back` had no auth yet. That proved the
    frontend against the contract; it proved nothing about Jason's
    implementation of the same contract. Re-run all four here against
    `code-report-back`: correct login lands on the report form; wrong password
    shows an **inline** error carrying the **server's own** message with the
    typed username preserved; logout returns to login; a deleted/expired
    `cr_session` cookie sends the next navigation back to login with the
    session-expired notice. Also confirm `Accept-Language` end to end — the
    same wrong-password attempt must return Thai with the UI on `th` and
    English with the UI on `en`, composed by the backend, not the frontend.

**Runs 12 and 13 are no longer part of this TASK.** Sober split them out into
**TASK-014** on 2026-08-21. Reason: this TASK is joint and PAUSED until TASK-013
is `DONE` (its runs 1–11 exercise the three screens being rebuilt under
SPEC-002), while runs 12 and 13 touch **no screen** and are not invalidated by
the rework. They are re-anchored there to a job submitted through the API
instead of "from run 1"; nothing else about them changed. Do not re-run them
here — if TASK-014 has already landed, cite it.

## Definition of Done
- [ ] Every numbered run above executed, with evidence in `## Implementation
      Notes`: screenshots for the UI, and the `GET /api/reports/:jobId` JSON
      (`status`, `stage`, `commitCount`) for each.
- [ ] The th and en reports of run 1/2 pasted (or attached) in full.
- [ ] The grep commands and their empty output for run 9.
- [ ] A tick-list mapping each row of SPEC-001's "Acceptance mapping" table to
      the run that proves it — anything unproven is named, not silently skipped.
- [ ] Full `bun test` (backend) and `bun run build` (frontend) green.
- [ ] Run 11's four flows evidenced against the real backend, with the th/en
      wrong-password messages pasted — this is the line TASK-006 could not
      close for real.

## Implementation Notes
(Jason + Fern fill this in with the evidence.)

## Questions

- **Q-SA-6 (BLOCKS THIS TASK ONLY — raised by Sober 2026-08-20, with Porter):**
  runs 1–8 need a **live AI API CENTER**, which is the stakeholder's own running
  service, not something this team may switch on. PROTOCOL forbids us from
  touching real environments on our own initiative. Needed from the human, via
  `@Porter`:
  1. Which endpoint may we call for the acceptance run — a local
     `http://localhost:3009` he starts for us, or `https://ai.develyst.online`?
  2. Is he happy for real AI calls (token spend) to be made against it, and any
     rate/volume limit we should stay under?

  **TASK-001…008 are unaffected** — they are built and tested against the fake
  `AiClient` and a fixture repo, with no network.

  > answer (2026-08-20, human, verbatim, via Porter — transcribed into this TASK
  > by Sober 2026-08-21; it had been recorded in REQ-001 `## Questions` only):
  > "Q-SA-6=https://ai.develyst.online ใช้ได้ แต่ ลองใช้model ต่ำๆไปก่อน".
  > So: use `https://ai.develyst.online` (the production endpoint, **not** a
  > local `:3009` he starts for us), real AI calls are authorised, and start with
  > lower-tier models. Q-SA-8 adds: **no spend ceiling**; Q-SA-7 makes the tier a
  > **rule per step** (mid-tier where a step reads code, cheap for procedural
  > steps), so "low" is the default, not a cap. **Q-SA-6 no longer blocks this
  > TASK.** What still holds this TASK is Sober's ordering decision (paused until
  > TASK-013 is `DONE`), not a missing answer.

- **NOT answered here — the database.** Runs 1–11 also need a real
  `DATABASE_URL`, and no database is authorised for the team. That question is
  **Q-SA-16**, raised in TASK-014 (which hits it first). Its answer applies to
  this TASK too; do not start runs 1–11 before it lands.

(Jason/Fern ask; Sober answers as `> answer: ...`)

## Review
(Sober fills this in at REVIEW.)
