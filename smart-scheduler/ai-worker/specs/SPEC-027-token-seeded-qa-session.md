# SPEC-027: A token-seeded browser session for QA — without adding anything reachable
- Source: @Porter's routed design question (painted-UI wall, 2026-08-02)
- Status: ACTIVE

## The problem
QA can authenticate over the API but **cannot type a credential into a login form** — correctly. So the painted
screens (collapsed inputs, nav, the expired-voucher red alert) stay unverified, and **that is exactly the class
of defect this role exists to catch**: TASK-081 was reviewed, correct in code, and unusable on screen.

Porter rejected `SKIP_AUTH` and he's right — we spent two days on a finance endpoint that answered without a
login; putting an unauthenticated frontoffice on a reachable host is the same mistake with a bigger blast
radius.

## As-built
The frontoffice uses **NextAuth with a Credentials provider** (`auth.ts`) whose `authorize` calls the backend —
the backend stays the source of truth. Session strategy is **JWT** (`auth.config.ts`), and the session carries
`backendToken`, `role`, `username`. The browser holds a **signed session cookie**.

## Design — mint the cookie locally; add nothing to the deployed app
**Do not add a provider, a route, an env flag, or a bypass.** A NextAuth session cookie is a JWT signed with
`AUTH_SECRET`. So:

> A **local script** takes (a) a **real backend token**, obtained through the API login QA can already do, and
> (b) `AUTH_SECRET`, which the **operator** holds — and prints the session cookie. Whoever drives the browser
> sets that cookie and loads the page already signed in.

**Why this shape and not a seeding endpoint:**
- **The reachable attack surface does not grow by one byte.** Nothing new is deployed, nothing new answers over
  HTTP. Compare `SKIP_AUTH` or a token provider: both add a way in, on a host that is reachable.
- **It grants nothing the token didn't already grant.** The minted session *carries* the backend token QA
  already holds — it converts an API session into a browser session, it does not create authority. If the
  script leaks it does nothing, because `AUTH_SECRET` already protects every session in the product.
- **It cannot drift into production**, because there is nothing to accidentally leave enabled.

⚠️ **The operator holds `AUTH_SECRET`, and we never see it.** The script reads it from the environment where it
is run. **Nobody on this team runs this against `sid`** — same standing rule.

## What it does not solve, stated so nobody over-claims it
A seeded session gets QA **onto** the painted screens. It does **not** make the pane paint. If the Browser pane
still can't composite, this buys the *authenticated* half and the click-scripts remain the path for the rest.
**Say which of the two is the wall before building**, so we don't ship a session that lands on the same blank
page.

## Tasks
- **TASK-090** (Fern, `smart-scheduler-front`): the minting script + operator instructions.

## Questions
(Sober asks; Porter answers as `> answer: ...`)
1. **⚠️ Check the premise before Fern builds it.** If the pane's problem is *painting* rather than *auth*, this
   changes nothing and I'd rather find that out in a sentence from you than in a day of work. QA's own reports
   say she reads through the accessibility tree **after logging in via mock** — which suggests auth is genuinely
   the `sid` blocker, but you're closer to it.
2. **No approval needed for the design** — it adds nothing reachable, so there is no new exposure to weigh. The
   only thing the owner must agree to is **handing `AUTH_SECRET` to whoever runs the script**, and she already
   holds it.
3. **FYI, folding in your other instruction:** `1st Trial` having no package price-group is correct and an
   attempt to sell against it should be refused like any other non-existent combination. **That goes in
   REQ-027's spec as one more row in the same table** — not a special case, per Jason's *"a rule with an
   exception in it stops being a rule."*
