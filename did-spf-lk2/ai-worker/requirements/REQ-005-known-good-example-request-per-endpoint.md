# REQ-005: A known-good example request for every endpoint
- Status: READY_FOR_SA
  *(The team prepares the call sheet; the **stakeholder** executes it — Q5-1 answered ก.)*
- Priority: HIGH
- Requested: 2026-09-10 by stakeholder (human)
- Deadline: none

## Problem / Goal

A manual that only describes parameters is not enough — the customer's tech team
needs a request they can paste and see a real licence come back. Otherwise their
first call returns an empty list and they cannot tell "no match" from "I did it
wrong".

Stakeholder's words: *"ทำการทดสอบ call ไปเรื่อยๆ แล้ว ทำ body หรือ request ที่ทำให้เจอ
ใบนึงแน่ๆ หากมี licenseno ก็เอาให้เลย และหากไม่มี field เฉพาะ ก็ให้ทำโดยใช้ชื่อเต็มบริษัท"*.

Feeds REQ-004 — the examples produced here are what the manual embeds.

## How this REQ runs (settled 2026-09-10)

Three steps, and the middle one is not ours:

1. **Team** produces a ready-to-run **call sheet** — one copy-pasteable request per
   endpoint, complete with headers, against
   `https://e-connect-did.mod.go.th/service-did-dopa`.
2. **Stakeholder** runs it and drops the output into `../project-docs/`.
3. **Team** compiles the observed results into the per-endpoint examples below, and
   REQ-004's manual embeds them.

## Requirement

1. For **each of the ten real licence endpoints**, produce one request that is known
   to return **at least one row**, with the actual response it produced.
2. Choose the search value by what the endpoint accepts:
   - **Endpoints that accept `licenseNo`** — `license-import`, `license-move`,
     `license-sale-domestic`, `license-sale-international`: give a real `licenseNo`
     that is known to match.
   - **Endpoints that do not** — `license-export`, `license-transit`,
     `license-yp2`, `license-yp3`, `license-yp4`, `license-yp5`: use the
     **full company name** in `traderName`, exactly as it is stored.
3. Record, for each endpoint: the full request (path + query + which credential
   family), the HTTP status, and the response body it returned.
4. **Where no such request exists, say so plainly** instead of inventing one. Some
   endpoints may genuinely have no qualifying data — form 9 returned an empty list
   for weeks because its rows sat at `STATUS=30` while the query filters
   `STATUS=40`. An endpoint with no matching data is a **finding to report**, not a
   gap to paper over with a fabricated example.
5. Values must be **real and reproducible** — taken from an actual response, not
   composed from a schema, and not taken from the `-sandbox` endpoints (those return
   fixed dummy rows and prove nothing about real data).

## Acceptance Criteria

- [ ] All ten real licence endpoints are covered.
- [ ] Each entry carries a request, the status code, and the response body actually
      observed — no example is presented that was not run.
- [ ] Endpoints accepting `licenseNo` use a `licenseNo`; the rest use a full
      `traderName`.
- [ ] Any endpoint with no data-returning request is listed explicitly, with what
      was tried and the likely reason.
- [ ] No example comes from a `-sandbox` route.
- [ ] Nothing in the output is a value nobody observed.

## Constraints

- **The AI team is barred from real environments** (`PROTOCOL.md`, "Missing
  knowledge & real-world data"): never run SQL, never connect to a real database,
  server or environment. Calling the deployed host is exactly that — which is why
  the call sheet, not the calling, is the deliverable (Q5-1).
- The data involved is **real company and personal identifiers**. Whatever ends up
  in the customer-facing manual is the stakeholder's decision to publish; PM's
  recommendation is to prefer juristic-person examples (`juristicId`, company name)
  over any row carrying a personal `citizenId`.
- **Nobody on this team calls the deployed host.** Settled by Q5-1; this is the
  normal `PROTOCOL.md` position, not a special restriction for this REQ.
- **Do not brute-force.** "Call until something comes back" over ten endpoints
  against a government host is not a plan. The efficient path is to ask the
  stakeholder for one `SELECT` per licence form that names a trader/licence known
  to satisfy each endpoint's filter, then make **one** confirming call each.
  That also makes each result explainable rather than lucky.
- No credential values are written into any artifact of this REQ.

## Out of Scope

- Changing the API, its filters, or its data.
- Fixing endpoints found to have no qualifying data — that is a finding, and a
  separate decision for the stakeholder.
- Writing the manual itself — REQ-004.

## Questions

- **SA-7 (Sober → Porter, open, NON-BLOCKING) — sequencing, so the board reads
  honestly and nobody waits on the wrong thing.**

  TASK-005 delivers the call sheet with **blank, clearly marked** search values.
  That is the correct output: we cannot know which licence number or company name
  returns a row without either Q5-2's `SELECT` results or the calls themselves, and
  we do neither. The sheet's value is complete, header-accurate, per-endpoint
  scaffolding around those blanks.

  **The consequence you need before you plan around it: TASK-005 going `DONE` will
  NOT make REQ-005 `SPEC_DONE`.** Every acceptance criterion in this REQ describes
  **step 3** — "the status code and response body **actually observed**" — which
  cannot exist until the stakeholder has run step 2. I will hold REQ-005 open
  awaiting that output rather than declare the requirement met on a document nobody
  has run. Compiling the observed results becomes a further TASK once
  `../project-docs/` has the file.

  **And Q5-2 is worth pushing before step 2, not after.** With it, each entry is one
  confirming call and every result is explainable. Without it the stakeholder is
  choosing search values at the moment of testing — and a guessed value that returns
  zero rows is **indistinguishable** from an endpoint that genuinely has no
  qualifying data. That is precisely the confusion this REQ exists to remove. Your
  call on how hard to push, but I would not skip it.

  > answer (Porter, 2026-09-10): **accepted in full — and thank you for saying it
  > before I put the sheet in front of the stakeholder.** You are right that
  > TASK-005 `DONE` must not become REQ-005 `SPEC_DONE`; every criterion here
  > describes step 3, and I will not mark a requirement met on a document nobody has
  > run. REQ-005 stays open until the stakeholder's output is in `../project-docs/`,
  > then step 3 becomes a further TASK.
  > **And I am pushing Q5-2 again, not skipping it** — your point about a guessed
  > value returning zero rows being indistinguishable from an endpoint with no data
  > is exactly the failure this REQ exists to prevent, so I have put it to the
  > stakeholder as the one thing that decides whether the run produces answers or
  > more questions.

- **Q5-1 — ANSWERED 2026-09-10: option (ก). The stakeholder runs the calls.**
  Their words: *"ก. ฉันยิงเอง"*. **No exception to `PROTOCOL.md` was granted and none
  is to be inferred later** — no agent on this team calls
  `e-connect-did.mod.go.th`, or any other deployed host, for this REQ or any other.
  The team's deliverable is therefore the **call sheet**, not the calls.
- **Q5-2 (PM → stakeholder):** can you supply a `SELECT` result naming, per licence
  form, one trader or licence number that currently satisfies that endpoint's
  filter? This turns ten guessing sessions into ten confirming calls, and it is the
  difference between "we found one" and "we can explain why it is found".
