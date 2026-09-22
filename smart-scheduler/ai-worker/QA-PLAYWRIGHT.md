# Tanya — how UI evidence is produced here (Playwright)

> Companion to `TANYA.md`. Distilled from Tanya's own rounds on this workspace
> (`TEST-055`, `TEST-099` and ~20 harnesses), not from general Playwright docs.
> **Read this before your first UI round; it is the difference between a result
> and an opinion.**

## 0. The ruling that defines this file

**Owner's decision, 2026-09-23: Playwright FIRST. The real browser is an
escalation, not a default.**

You have two paths to UI evidence:

| Path | When |
|---|---|
| **Playwright harness** (this file) | **Always start here. This is the default and it is what your verdicts are built on.** |
| **Real browser** (`kimi-webbridge` — drives the owner's actual Chrome) | Only when Playwright genuinely cannot reach the case: a real third-party login, a device-only interaction, something that needs his live session. |

**Why Playwright is the default:** a harness is a committed, re-runnable script.
Anyone can execute it again next month and get the same answer. A live browser
session is unrepeatable and dies with the chat — it produces a claim, not evidence.

🔴 **What the real browser costs, and why it is never casual.** It drives the
owner's Chrome **with his logged-in sessions**. That means it can reach the
customer's system **as him** — and nothing technical stops a write there. Your
read-only rule on the customer's system is then the *only* guard that exists.
**The absence of a technical guard is not permission.**

⇒ **Before using the real browser: say what you are about to do and why Playwright
cannot do it, and get Porter's go.** Never open it just because it is easier.
Never point it at the customer's system to "have a look".

If neither path can reach a case, it is `NOT_TESTED` with the reason, escalated to
Porter. You never substitute a code read for a run.

## 1. The setup that actually works here

```js
// ESM ignores NODE_PATH — resolve Playwright out of the front repo explicitly.
const PW = process.env.PW_PATH ?? "<front repo>/node_modules/playwright/index.mjs";
const { chromium } = await import(pathToFileURL(PW).href);

const browser = await chromium.launch({ channel: "chrome", headless: true });
```

- **`channel: "chrome"`, not bundled Chromium.** You need the *real compositing
  engine* — clipping, painting and stacking are what you are measuring, and
  Chromium's defaults are not what the user's browser does.
- **Headless is fine** for measurement and screenshots. It is not fine for
  anything that depends on a real GPU or a real font fallback — say so if you hit
  that.
- **Playwright lives in the product repo's `node_modules`** (it is already a
  dependency there). You do not install anything into the product repo, and you do
  not add a dependency to it. Ever.

## 2. Where a harness lives, and what it may touch

- **File:** `smart-scheduler/ai-worker/tests/harness/<env>-<subject>.mjs`
  The prefix names the environment it runs against, so nobody has to open it to
  find out: `local-…`, `<devserver>-…`, `prod-…`.
- **Output:** JSON on stdout (so the numbers land in your TEST file) **plus**
  screenshots into `../project-docs/qa-<YYYY-MM-DD>/`.
- 🔴 **Nothing is written into the product repo.** No test file, no fixture, no
  config, no dependency. The harness reads the running app from the outside.
- **A harness is committed and re-runnable.** Head comment states: what it proves,
  the exact command to run it, and what it deliberately does not prove.

## 3. Local + mock: what it can and cannot prove

Running the front end locally in mock mode (e.g. `NEXT_PUBLIC_USE_MOCK=true`) is
the cheapest real-render you can get, and **no real environment or credential is
involved** — the mock auth branch accepts any local input.

**Say this explicitly in every TEST file that used it:**

> This is enough for **layout** and enough for **render**. It is **NOT** enough
> for **behaviour** — the mock resolves unconditionally and returns one shape for
> every id, so server refusals and alternate DTOs are **untested, not passed.**

That sentence is the whole discipline. A mock round that quietly reports "PASS"
on behaviour is worse than no round, because it spends the team's trust.

For behaviour you need the **deployed dev server**, authenticated the way that
project documents (a session-minting script, a test account from Porter). Never
put a credential or token in a harness, a TEST file, or any tracked file, and
never print one into output you paste.

## 4. 🔴 The lesson that has caught the most defects: Playwright can lie to you

**Playwright's actionability check is not a human's reachability.**

Real case, `TEST-099`: at 375 px a table was **283 px wider than the card that
clips it** (`scrollWidth` 624 vs `clientWidth` 341), the card was
`overflow-x: hidden`, and the page had no horizontal scroll at all. The "Manage"
button was **off the painted surface and unreachable by a person.**

A Playwright *trial click* **passed** — because `scrollIntoViewIfNeeded` can scroll
an `overflow:hidden` container **programmatically**. A user cannot.

⇒ **The hit-test and the screenshot are the truth.**

```js
// Is this actually on the painted surface where a finger would land?
const hit = await page.evaluate(([x, y]) => {
  const el = document.elementFromPoint(x, y);
  return el ? el.outerHTML.slice(0, 120) : null;   // null === unreachable
}, [cx, cy]);
```

**Three numbers, together, or you have not measured anything:**

| Measure | Question it answers |
|---|---|
| `scrollWidth` vs `clientWidth` (+ computed `overflow-x`) | is content wider than what clips it, and can anyone scroll to it? |
| `document.documentElement.scrollWidth == clientWidth` | does the *page* offer a horizontal escape? |
| `document.elementFromPoint(cx, cy)` | is the control actually **hittable** at its own centre? |

Plus the screenshot. If the numbers and the picture disagree, **the picture wins
and you investigate**; never report the number that was more convenient.

## 5. The standing widths

Measure every responsive claim at **1600 · 1280 · 768 · 375**, and state the
number at each — not "looks fine at mobile".

For each element under test record: its box, its parent's box, overflow, and the
hit-test. A table gets per-`th` widths — that is how you find the column that
vanished rather than the layout that "feels tight".

> If the owner has ruled a breakpoint out of scope (it has happened: phone widths
> on an admin-only screen), a failure there is **MINOR/backlog**, not a blocker —
> and you say which ruling you are applying.

## 6. Zero residue, declared

Same rule as `TANYA.md` §3, and Playwright makes it easy to forget:

- Anything the harness creates — a booking, a user, an upload, a row — is removed
  before the round closes, and listed in `## Test data created` with removed ✅/❌.
- A harness that changes state **declares the end state**; it never quietly
  restores it and says nothing.
- Screenshots may contain real names or numbers. They go to `project-docs/`, and
  you say so — never paste personal data into a log entry.

## 7. Your round, end to end

1. Read the REQ's AC. Decide the cases **before** you open a browser.
2. Write/extend the harness. Head comment: what it proves, how to run it, what it
   does not prove.
3. Run local+mock first (layout, render). Then the deployed build (behaviour).
4. Record actual numbers, hit-tests, screenshot paths — per case, mapped to an AC.
5. Anything unreachable → `NOT_TESTED` **with the reason**, and carry on
   (`TANYA.md` §6 — the default is carry on).
6. Verdict, defects, footprint, questions. One report at the end.
7. Add the escaped case to `tests/REGRESSION.md`.
