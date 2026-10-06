# Risk-based test design from ACs

The ACs are the source of truth. Design from them, not from the build — the build will
happily pass the cases it was written to pass.

## 1. Rank by risk first

For each AC, ask two questions and test the high/high cells hardest:

| | Low likelihood | High likelihood |
|---|---|---|
| **High impact** (money, personal data, permissions, data loss, the main user path) | targeted negative + boundary cases | full depth: every technique below |
| **Low impact** | one happy case or skip (say so) | happy + the obvious edge |

Likelihood rises with: new code, code touched by several TASKs, integration seams (API ↔ UI,
service ↔ service), date/time/currency/locale handling, concurrency/retries, anything that
failed before (check the regression list and past defects).

Write down what you deliberately skipped. A skipped case you named is a decision; one you
did not name is a gap.

## 2. Techniques — apply per AC

- **Equivalence classes.** Partition inputs into classes the system should treat alike
  (valid, each kind of invalid, empty, missing). One case per class, not ten per class.
- **Boundaries.** At, just below, just above every limit: min/max length, 0/1/many, first/last
  page, date at expiry vs one day after, quota exactly used vs one over, time zone midnight.
- **Negative paths.** What the system must *refuse*: wrong role, expired/used entitlement,
  forbidden combination, malformed input, duplicate submit. A refusal must be visible to the
  user (message, not a silent no-op) and must leave no residue.
- **State transitions.** Draw the states (e.g. pending → confirmed → attended / cancelled).
  Test each allowed transition, at least one forbidden transition per state, and repeat/retry
  of the same transition (idempotency: a retry must not double-send or double-charge).
- **Permissions.** Each role that can see the feature: allowed actions work, forbidden ones are
  refused at the server — not merely hidden in the UI. Unauthenticated reads included.
- **Reachability.** For every capability in an AC, the user path to it exists and works: the
  item appears in the picker, the button is on the painted surface, the route is linked.
  The function working is not the user reaching it.
- **Surfaces.** If users see it on a phone, the phone (or a faithful mobile render) is the test.
  Responsive claims are measured at the desk's standing widths (default 1600 · 1280 · 768 · 375).
- **Data shape.** Real-looking data: long names, Thai and mixed scripts, empty optional fields,
  large lists, zero results.
- **Regression neighbours.** What else calls the touched code? Pull the matching lines from the
  regression list into this round.

## 3. Map back

Every case cites its AC. Every AC has at least one case, or a named NOT_TESTED with the reason.
If an AC cannot be turned into an observable check, or contradicts the SPEC, that is a question
for the PM — mark it `BLOCKED`; never guess the intent.

## 4. Order of execution

Cheapest real instrument first, each layer stating what it proves:

1. Static analysis + the existing suites, as checked out (proves: compiles, existing tests hold).
2. Local end-to-end (proves: layout, render, local flows; with mocks, not behaviour).
3. Deployed end-to-end on an environment the desk clears you for (proves: behaviour,
   integrations, real data shapes).
4. Human click-script for what only a person/device can do.

A defect found at layer 1 is cheaper than one found at layer 3 — but a layer-1 pass never
stands in for layer 3.
