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

12. **Which model actually answered** (added by Sober 2026-08-20 as the
    condition of answering Q-BE-6 with "no `model` key"). We send no `model` and
    no `provider`, so AI API CENTER's own fallback chain picks. Q-SA-7's answer
    was a *rule* — mid-tier where a step reads code, cheap for procedural steps
    — and mapping it to real ids needs a fact nobody has: the `.bru` docs list
    models **per provider** and never say whether a `model` is honoured, ignored
    or rejected when the chain is doing the choosing. Every call already logs
    `provider` and `model`, so: **from run 1's logs, record the provider and
    model that answered each of the three AI stages**, and say plainly whether
    that is an acceptable tier under Q-SA-7. Two lines of output. If it is not,
    Sober writes the mapping TASK line against this evidence — not against a
    guess. This is the only run here whose purpose is a decision rather than a
    proof.

## Definition of Done
- [ ] Run 12's provider/model per AI stage recorded from the real run's logs,
      with a one-line verdict against Q-SA-7's tier rule.
- [ ] Every numbered run above executed, with evidence in `## Implementation
      Notes`: screenshots for the UI, and the `GET /api/reports/:jobId` JSON
      (`status`, `stage`, `commitCount`) for each.
- [ ] The th and en reports of run 1/2 pasted (or attached) in full.
- [ ] The grep commands and their empty output for run 9.
- [ ] A tick-list mapping each row of SPEC-001's "Acceptance mapping" table to
      the run that proves it — anything unproven is named, not silently skipped.
- [ ] Full `bun test` (backend) and `npm run build` (frontend) green.
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

(Jason/Fern ask; Sober answers as `> answer: ...`)

## Review
(Sober fills this in at REVIEW.)
