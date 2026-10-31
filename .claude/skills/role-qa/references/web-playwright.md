# Web UI evidence — the Playwright harness method

Applies when the desk's stack is web. The desk's own UI-testing file, if any, wins.

## 0. Harness first; a live browser is an escalation

| Path | When |
|---|---|
| **Playwright harness** (a committed, re-runnable script) | Default. Verdicts are built on this. Anyone can re-run it next month and get the same answer. |
| **A live/real browser** (a browser-control tool, the operator's own browser) | Only when the harness genuinely cannot reach the case: a real third-party login, a device-only interaction, something needing a live session. |

A live session is unrepeatable and dies with the chat — it yields a claim, not evidence. A
browser driving someone's logged-in profile can reach real systems *as them*, and nothing
technical stops a write there. Before using one: say what you will do and why the harness cannot,
and get the go per the desk's chain. Never point it at a customer system "to have a look".

Neither path reaches it → `NOT_TESTED` with the reason. Never a code read instead.

## 1. Setup

- Use the Playwright already present in the product repo's dependencies; **install nothing into
  the product repo**. ESM ignores `NODE_PATH`, so resolve it explicitly:
  ```js
  import { pathToFileURL } from "node:url";
  const PW = process.env.PW_PATH ?? "<front repo>/node_modules/playwright/index.mjs";
  const { chromium } = await import(pathToFileURL(PW).href);
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  ```
- `channel: "chrome"` (the real engine) rather than bundled Chromium — clipping, painting and
  stacking are what you measure.
- Headless is fine for measurement and screenshots; not for anything depending on a real GPU or
  real font fallback — say so if you hit that.

## 2. Where a harness lives

- `tests/harness/<env>-<subject>.mjs` in the desk's area. The prefix names the environment
  (`local-…`, `<devserver>-…`) so nobody must open it to know where it points.
- Head comment: what it proves, the exact command to run it, what it deliberately does not prove.
- Output: JSON on stdout (numbers go into the TEST file) + screenshots into the desk's evidence
  folder (e.g. `project-docs/qa-<YYYY-MM-DD>/`).
- Nothing is written into the product repo: no test file, fixture, config or dependency.
- No credential or token in a harness, TEST file or pasted output. Authenticate the way the desk
  documents (a session-minting script, a test account handed to you via the chain).
- **The sanctioned auth path is a self-login harness you run yourself** (e.g. `sid-session.mjs`:
  read an **out-of-repo** access file → `POST /api/auth/login` → mint the cookie with the project's
  own tool → `context.addCookies`). You never open, read, type or print the secret; nothing is
  written to disk or stdout; the harness **hard-refuses any host that is not the cleared test
  env** (production is never in scope). This is ordinary test tooling, not "typing a password into
  a field" — the latter is what is prohibited, and the harness never does it. **This holds for the
  app's OWN backend login; if the project signs in through a separate identity provider (Entra ID,
  Google, Okta — not the app's own server), you do NOT perform that sign-in by any route — reuse a
  token a human already minted (inject it from an out-of-repo file).** If `node …session.mjs`
  is **refused**, that is a **permission mode not enabled** (bypass / `Bash(node *)` allow-rule),
  **not** a machine-level refusal and **not** a model limit: name it, ask the desk to enable it,
  and carry on — do not park the whole round on a permission prompt.

## 3. Local + mock: what it can and cannot prove

Say this in every TEST file that used it:

> Enough for **layout** and **render**. **Not** enough for **behaviour** — the mock resolves
> unconditionally and returns one shape, so server refusals and alternate payloads are
> **untested, not passed.**

Behaviour needs the deployed environment the desk clears you for.

## 4. The known trap: Playwright can lie to you

**Playwright's actionability check is not a human's reachability.** `scrollIntoViewIfNeeded`
can scroll an `overflow: hidden` container programmatically; a user cannot. A trial click can
pass on a button that sits off the painted surface — e.g. a table far wider than the card that
clips it, card `overflow-x: hidden`, page with no horizontal scroll.

The hit-test and the screenshot are the truth:

```js
const hit = await page.evaluate(([x, y]) => {
  const el = document.elementFromPoint(x, y);
  return el ? el.outerHTML.slice(0, 120) : null;   // null or a different element === unreachable
}, [cx, cy]);
```

Three numbers together, or you have not measured anything:

| Measure | Question |
|---|---|
| element `scrollWidth` vs `clientWidth` + computed `overflow-x` | is content wider than what clips it, and can anyone scroll to it? |
| `document.documentElement.scrollWidth == clientWidth` | does the page offer a horizontal escape? |
| `document.elementFromPoint(cx, cy)` at the control's own centre | is it actually hittable? |

Plus the screenshot. If numbers and picture disagree, the picture wins and you investigate;
never report the more convenient number.

## 5. Standing widths

Measure every responsive claim at the desk's widths (default **1600 · 1280 · 768 · 375**) and
state the number at each. Per element: its box, its parent's box, overflow, hit-test. Tables get
per-column widths — that finds the column that vanished. If a breakpoint was ruled out of scope,
a failure there is MINOR/backlog — cite the ruling.

## 6. Zero residue, declared

Anything the harness creates is removed before the round closes and listed in
`## Test data created` with its end state. A harness that changes state declares it; it never
quietly restores and says nothing. Screenshots may contain real data — keep them in the evidence
folder, crop/blur, never paste personal data into a log.

## 7. A UI round, end to end

1. Read the ACs; decide the cases before opening a browser.
2. Write/extend the harness (head comment as above).
3. Local + mock first (layout, render); then the deployed build (behaviour).
4. Record numbers, hit-tests, screenshot paths per case, mapped to an AC.
5. Optionally run `/impeccable audit` as one more input — its pass is not acceptance.
6. Unreachable → `NOT_TESTED` with reason; carry on.
7. Verdict, defects, footprint, questions — one report. Add escaped cases to the regression list.
