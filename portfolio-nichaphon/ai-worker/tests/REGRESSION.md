# REGRESSION — portfolio-nichaphon

> The standing checklist of what the site must still render and do. Owned by
> Tanya (QA). Every delivered REQ adds to it; every escaped defect adds the case
> that would have caught it. Run on **local only** (`cd front && npm run dev`,
> http://localhost:3000) — production is never touched by QA.
>
> Opened 2026-08-30 from TEST-001 (REQ-001, Home). Detail, evidence and
> screenshots live in the TEST file, not here.

## How to run it

Real browser, real render (Playwright against the machine's Chrome, installed
**outside** `front/` — see TEST-001 §How this round was run). Harness:
`tests/harness/home-sweep.cjs`. The harness prints observations; the verdict
always comes from what was seen.

Minimum viewports every round: **1280x900 desktop** and **360x740 mobile**.

## Site-wide — must hold on every route

| # | Check | Added by | Last run |
|---|-------|----------|----------|
| S1 | All six routes return 200 and none renders the 404 page: `/`, `/about`, `/services`, `/portfolio`, `/blog`, `/contact` | REQ-001 | 2026-08-30 PASS |
| S2 | Every route has an `h1` and its own `<title>` | REQ-001 | 2026-08-30 PASS |
| S3 | All six header nav links land on their own path | REQ-001 | 2026-08-30 PASS |
| S4 | All five footer nav links land on their own path | REQ-001 | 2026-08-30 PASS |
| S5 | Mobile drawer opens from the burger, lists exactly the six routes, navigates, and closes after navigating | REQ-001 | 2026-08-30 PASS |
| S6 | No console **errors**, no `pageerror`, no failed requests on a clean load of any route | REQ-001 | 2026-08-30 PASS |
| S7 | Dark scheme everywhere: `<html data-mantine-color-scheme="dark">`, body background `rgb(11, 9, 22)` | REQ-001 | 2026-08-30 PASS |
| S8 | No horizontal overflow at 360px (`scrollWidth === clientWidth`, no element past the right edge) | REQ-001 | 2026-08-30 PASS |
| S9 | No invisible or unreadable text — nothing rendering at the same value as its own ground. Verify against the screenshot, never against a contrast script alone: a translucent `rgba(..., 0.1)` panel makes a naive ratio lie | REQ-001 (the false positives it produced) | 2026-08-30 PASS |
| S10 | The three webfonts actually **load**, not merely declare: Space Grotesk, IBM Plex Sans Thai, JetBrains Mono | REQ-001 | 2026-08-30 PASS |
| S11 | `cd front && npm run build` exits 0 with no errors | REQ-001 | 2026-09-02 PASS |

## Home (`/`) — added by REQ-001

| # | Check | Last run |
|---|-------|----------|
| H1 | **No light/dark toggle** anywhere in the header, and no colour-scheme control anywhere in the document (R10) | 2026-08-30 PASS |
| H2 | Between one and three of the four R5 quotes appear — never all four (R5). Today: quote 4 (hero) and quote 2 (statement band) | 2026-09-02 PASS |
| H3 | Every rendered quote matches its R5 string **character-for-character**, compared as exact node text, straight quote marks included. `lang` is set per language | 2026-09-02 **NOT TICKED** — quote 2's Thai renders `ผมไม่ทำงาน…` where R5 says `ผมไม่ได้ทำงาน…`. **No agreed baseline until Porter answers TEST-001 Q4** — do not assert this check either way. Quote 4 and quote 2's English are R5-exact. See TEST-001 §Re-verify round |
| H4 | None of the reference screenshot's own content appears, in text or in source: `FAEK`, `150+`, `Win Awards`, `12Years`, `Li Europan`, `Get Started`, `CREATIVE`, `agency.` (R9) | 2026-08-30 PASS |
| H5 | No client-facing string on Home is new or altered except the quotes — check every visible text node against the last pre-REQ baseline (R4) | 2026-08-30 PASS |
| H6 | **Reduced motion**: with `prefers-reduced-motion: reduce`, `document.getAnimations()` is empty at first paint, two settled frames are identical, **and the hero is fully visible** (not stuck at the animation's start state). Always run the `no-preference` control too — a check that cannot detect motion proves nothing | 2026-08-30 PASS |
| H7 | **Skip link by keyboard**: Tab once → "Skip to content" with a visible focus ring; Enter → `#main`; **the next Tab lands inside `<main>`**. `activeElement` staying on `<body>` is not a failure — the next Tab is the check | 2026-08-30 PASS |
| H8 | Hero renders its full set at 360x740 above the fold: name, nickname/role, lead, both CTAs, hero quote | 2026-09-02 PASS |

## Known and accepted — do NOT re-report as defects

- At **1280x600** the lead paragraph is cut at the fold and both CTAs and the
  hero quote fall below it. Evidence supplied to the owner as item **C**; his
  accept/reject call. Re-check only when the hero layout changes.
- The display `h1` applies to the five out-of-scope routes (`/about` runs to
  seven lines). Item **G**, the owner's scope question, not a defect.
- The 1px band along the top edge at scroll 0 (contrast step 1.15–1.43:1). Item
  **B**, measured, the owner's judgment.
- `/contact` required-field asterisks at 4.37:1. Item **F**, a scope question.
- Footer reads `© 2025`; predates REQ-001, TEST-001 Q1 open with Porter.
- `/blog` post titles are not links and `/blog/[slug]` does not exist —
  pre-existing gap, explicitly out of scope.
- A `next dev` warning about `scroll-behavior: smooth` on route transitions. A
  warning, not an error; dev-mode only.

## Never done by QA

`/contact` is never submitted with valid values — it sets
`window.location.href = mailto:…` and would launch the owner's mail client
(item **D**, his alone). Production (`portfolio.develyst.online`) is never
opened, not even a GET. No product code is ever changed to make a check pass.
