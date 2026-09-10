# SPEC-005: Call sheet for a known-good example request per endpoint
- Source: REQ-005
- Status: ACTIVE

## Overview

REQ-005 runs in three steps and **only the first and third are ours** (settled by
Q5-1: *"ก. ฉันยิงเอง"*):

1. **Team** → a ready-to-run **call sheet**: one copy-pasteable request per real
   licence endpoint, complete with headers.
2. **Stakeholder** → runs it against `https://e-connect-did.mod.go.th/service-did-dopa`
   and drops the output into `../project-docs/`.
3. **Team** → compiles the observed results; REQ-004's manual embeds them.

**This SPEC covers step 1 only.** Step 3 becomes a TASK when the output exists —
writing it now would mean inventing the results.

**No agent on this team calls the deployed host.** REQ-005 records that no exception
to `PROTOCOL.md` was granted and none may be inferred, and I am restating it here so
a future session reading this SPEC alone cannot mistake the call sheet for
permission to run it. The deliverable is a document, not a request.

## Fact base

**Do not duplicate it — SPEC-004 owns it.** Endpoint list, per-endpoint parameter
rules, auth sections and the four header rules are in
`SPEC-004-lk2-api-usage-manual-for-customer.md` → "The authoritative fact base",
verified against source on 2026-09-10. Two items from it drive this call sheet:

- **`licenseNo` is mandatory** on `license-import`, `license-move`,
  `license-sale-domestic`, `license-sale-international` — a call sheet entry for
  those four that omits it returns `400`, not a row. REQ-005 item 2 already routes
  a real `licenseNo` to exactly these four, which matches the code.
- The other six (`license-export`, `license-transit`, `license-yp2`…`yp5`) take
  `traderName` / `personalId` only, so their entry uses the **full company name**.

## Design of the call sheet

One Markdown file, one section per endpoint, each section self-contained so the
stakeholder can run them independently and in any order.

Each entry carries:

1. The endpoint and its Basic-auth section **name** (so they pick the right
   credential) — **never a password**.
2. A ready-to-paste `curl` **and** the equivalent Swagger "Try it out" field values,
   since the stakeholder may use either. All four required headers present in the
   `curl`, with `Authorization` left as a clearly marked placeholder.
3. The **search value** — from Q5-2 if it arrives, otherwise a marked blank.
4. A blank **result block** for them to paste into: HTTP status + response body.
5. A one-line "what a good result looks like" so they can tell success from a
   well-formed empty answer: `data` containing ≥1 object versus `data: []`.

### The dependency this SPEC will not paper over

REQ-005 item 1 wants a request **known to return at least one row**. We cannot know
that without either Q5-2's `SELECT` results or the calls themselves — and we do
neither. So the call sheet ships with the search values **blank and marked**, and
its value is the correct, complete, header-accurate scaffolding around them.

If **Q5-2 arrives** (one `SELECT` per licence form naming a qualifying trader or
licence number), those values are filled in and every entry becomes a single
confirming call. If it does not, the stakeholder supplies the values from their own
knowledge, which the sheet's structure makes cheap.

**What must not happen:** filling those blanks with a plausible-looking company name
or licence number. REQ-005 items 4 and 5 forbid it, and a fabricated value that
happens to return zero rows is indistinguishable from a broken endpoint — it would
send the stakeholder chasing a bug that does not exist. The TASK states this as a
hard rule.

**Expect at least one endpoint to legitimately return nothing.** `license-transit`
(form 9) and `license-export` (forms 8/19/20) sit at `STATUS=30` in the ELicensing
database while the query filters `STATUS=40`, recorded in `DATA-MAPPING.md`. Per
REQ-005 item 4 that is **a finding to report, not a gap to fill**. The call sheet
flags these two up front so an empty result is read correctly rather than as a
mistake in the sheet.

## Non-functional

- **No credential values** in the call sheet or any artifact of this REQ.
- **Real identifiers are involved.** Whatever ends up in the customer-facing manual
  is the stakeholder's call to publish; Porter recommends preferring
  juristic-person examples (`juristicId`, company name) over rows carrying a
  personal `citizenId`. The call sheet should say this once, so the choice is made
  deliberately at step 2 rather than discovered at step 3.
- **No brute force.** The sheet is one call per endpoint. It must not suggest
  iterating values against a government host.
- Language: the call sheet is an **internal working document** for the stakeholder,
  not the customer deliverable, so English with Thai where it helps is fine. The
  Thai-only rule belongs to REQ-004's manual.

## Tasks

- TASK-005: Write the call sheet (depends on: —)

Parallel with TASK-004 — they share SPEC-004's fact table but neither blocks the
other. Step 3 (compiling observed results into the manual) is a later TASK that
cannot start until `../project-docs/` has the output.

## Out of Scope

- **Running the calls.** Not ours, at all, ever (Q5-1).
- Changing the API, its filters or its data.
- Fixing an endpoint found to have no qualifying data — a finding, and the
  stakeholder's decision.
- Writing the manual — REQ-004 / SPEC-004.

## Questions

- **SA-7 (Sober → Porter, open, NON-BLOCKING) — sequencing, so nobody waits on the
  wrong thing.** TASK-005 produces the call sheet with **blank, marked** search
  values, because neither we nor BE may obtain qualifying values. That is
  deliverable and useful on its own. But **REQ-005's acceptance criteria cannot be
  met by us at all** — every one of them ("each entry carries the status code and
  response body actually observed") describes step 3, which needs the stakeholder's
  output first.

  So: **TASK-005 going `DONE` will not make REQ-005 `SPEC_DONE`.** I will hold
  REQ-005 open awaiting the step-2 output rather than declare the requirement met on
  a document nobody has run. Flagging it now so the board reads honestly and so you
  are not surprised when TASK-005 completes without closing the REQ.

  **Q5-2 is worth chasing before step 2, not after.** With it, each entry is one
  confirming call; without it the stakeholder is guessing values at the moment of
  testing, and a guess that returns zero rows cannot be told apart from an endpoint
  with no data. It is the difference between "we found one" and "we can explain
  why". Your call on how hard to push.
