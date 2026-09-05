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
**outside** `front/` — see TEST-001 §How this round was run). Harnesses:
`tests/harness/home-sweep.cjs` (REQ-001 era) and
`tests/harness/test004-2026-09-05.cjs` + `-b` + `-c` (the whole S1–S13 / H1–H8
sweep, the R9 six-route sweep and the SQ8 eyes) and
`tests/harness/test005-2026-09-05.cjs` + `-b` + `-c` + `-d` (H8, S14, S15, S16
and the `/services` desktop eye) and `tests/harness/test003-2026-09-05.cjs` (the
**build** leg — S11, S12's three triggers, S13, on a `npm run build` output).
The harness prints observations; the verdict always comes from what was seen.

**Serving a build (S11):** clear `front/.next` first, `npm run build`, then serve
it. `front/next.config.ts` sets `output: 'standalone'`, so `next start` warns it
"does not work" with that config — it does serve, but run
`node .next/standalone/server.js` beside it and check they agree. Delete
`front/.next` again afterwards so the next `npm run dev` is not sitting on a
build output.

Minimum viewports every round: **1280x900 desktop** and **360x740 mobile**.

**Three run rules, each written here because ignoring one produced a wrong
reading (2026-09-05):**

1. Launch **headed** (`headless: false`), **front the tab and take one throwaway
   screenshot** so `document.hidden` goes false, then **scroll the whole
   document**, one `requestAnimationFrame` per step, before measuring anything.
   Without the wake step a headed background tab still will not scroll or run
   transitions. A harness that
   never scrolls and never runs a frame cannot see lazy images, entrance
   animations, or anything below the fold — that is what left five checks
   unverified for a week.
2. Reach focus with **real `Tab` presses**, never `el.focus()`. `:focus-visible`
   does not apply to a programmatic focus, so the ring you are looking for will
   not be there and you will report a defect that does not exist.
3. **Ports:** 3000/3010/3011 are often held by orphan or foreign `next` servers.
   Start on a free port and declare it. Never run `npm run dev` on top of a
   `next build` output in `front/.next`, and never run a build while a server
   you do not own is using that same directory.

## Site-wide — must hold on every route

| # | Check | Added by | Last run |
|---|-------|----------|----------|
| S1 | All six routes return 200 and none renders the 404 page: `/`, `/about`, `/services`, `/portfolio`, `/blog`, `/contact` | REQ-001 | 2026-09-05 PASS |
| S2 | Every route has an `h1` and its own `<title>` | REQ-001 | 2026-09-05 PASS |
| S3 | All six header nav links land on their own path | REQ-001 | 2026-09-05 PASS |
| S4 | All five footer nav links land on their own path | REQ-001 | 2026-09-05 PASS |
| S5 | Mobile drawer opens from the burger, lists exactly the six routes, navigates, and closes after navigating | REQ-001 | 2026-09-05 PASS — 360px nav driven end to end for the first time (SQ8's 7th eye) |
| S6 | No console **errors**, no `pageerror`, no failed requests on a clean load of any route. **Warnings are not counted here** — see §Known and accepted before reporting one | REQ-001 | 2026-09-05 PASS — dev leg TEST-004/005; **build leg TEST-003**: 12/12 route/viewport loads with 0 errors, 0 pageerrors, 0 failed requests, 0 responses ≥400 |
| S7 | Dark scheme everywhere: `<html data-mantine-color-scheme="dark">`, body background `rgb(11, 9, 22)` | REQ-001 | 2026-09-05 PASS |
| S8 | No horizontal overflow at 360px (`scrollWidth === clientWidth`, no element past the right edge). **A wide element inside an `overflow-x: auto` wrapper is NOT a page overflow — walk the ancestors before calling it one, then run S14** | REQ-001 | 2026-09-05 PASS |
| S9 | No invisible or unreadable text — nothing rendering at the same value as its own ground. Verify against the screenshot, never against a contrast script alone: a translucent `rgba(..., 0.1)` panel makes a naive ratio lie | REQ-001 (the false positives it produced) | 2026-09-05 PASS |
| S10 | The three webfonts actually **load**, not merely declare: Space Grotesk, IBM Plex Sans Thai, JetBrains Mono. **A font missing on one route is only a failure if something on that route asks for it** — count the elements resolving to it before reporting (`/contact` legitimately loads no mono) | REQ-001 | 2026-09-05 PASS |
| S11 | `cd front && npm run build` exits 0 with no errors. **The build is a separate surface from `next dev` — running it means clearing `front/.next` first, and the built output must then be SERVED and driven, not just compiled.** `front/next.config.ts` sets `output: 'standalone'`, so `next start` prints a "does not work with output: standalone" warning; both it and `node .next/standalone/server.js` were exercised and agree | REQ-001 | **2026-09-05 PASS** — exit 0, 10/10 pages, **zero error AND zero warning lines** in the transcript; six routes then served clean on the built output. See tests/TEST-003-sq7-build-round.md |
| S12 | **Every overlay actually opens AND closes.** Three triggers: `/portfolio` card "Project detail" → `ProjectModal`; `/about` "View certificate" and "Read full conversation" → `ImageLightbox`; `/` @390px burger → `Drawer`. Each must reach `[role=dialog]`=1 with visible content and a scroll-locked body, then return to 0 on Escape / close. **Always run the hydration control with it** (`header[data-scrolled]` false→true on scroll) — a dead overlay on a dead bundle proves nothing about the overlay. **Run it on a production build too, not only on `next dev`** — a dev-only pass does not speak for the shape that ships | TEST-002 (SQ7) | 2026-09-05 PASS — dev leg TEST-004; **build leg TEST-003**, all three triggers open + close on both `next start` and the standalone server, hydration control flips beside each |
| S13 | **No image renders at 0x0, and every image actually paints.** Every `ImageLightbox` frame (and any `next/image` with `fill`) has a non-zero box **and** `complete === true` with `naturalWidth > 0`. A loaded image is not a rendered image, and a sized box is not a painted one: check both, and treat a console `has "fill" and a height value of 0` warning as a failure. **Lazy images only load once they intersect — scroll the whole document first, and wait: on a cold `next dev` the nine `/about` images need far longer than a second** | TEST-002 DEF-1 — the escaped defect this check would have caught | **2026-09-05 PASS** — dev leg: all 9 `/about` thumbnails painted at 1280 and 360, **DEF-1 closed** (TEST-004 §DEF-1). **Build leg also PASS** (TEST-003): 9/9 painted at both viewports, all nine `/_next/image` 200, zero `fill…height 0` warnings. On a **cold** image cache the two largest testimonials need >3 s — re-probe before calling one unpainted |
| S14 | **No section's content is stranded at 360px.** Where a block is wider than the viewport and sits in an `overflow-x: auto` wrapper, the visitor must be told it scrolls — a scrollbar, an edge fade, or hint text. S8 passes on exactly this case, so S8 does not cover it. **A signal that is only drawn at the bottom of a block taller than the viewport is not enough on its own — check what is on screen when the block FIRST arrives** | TEST-004 DEF-3 — the escaped defect this check would have caught | **2026-09-05 PASS** — `/services`: an 8px non-overlay scrollbar (gutter measured) **and** a right-edge shadow that swaps to the left edge at the far right; hidden columns reachable by touch and by arrow keys. **DEF-3 closed**, see TEST-005 case 2 |
| S15 | **No colour-scheme control on ANY route** — `/about`, `/services`, `/portfolio`, `/blog`, `/contact` as well as Home, at desktop **and** mobile **and inside the open mobile drawer** (REQ-002 AC7, owner `เอาออก`). Each header must hold exactly one control, the burger. **`light` is a substring of `ImageLightbox` — a class-name probe reports nine false positives on `/about`; count `*ColorScheme*` nodes and look at the header instead** | TEST-005 (REQ-002 AC7 — H1 had only ever run on Home) | **2026-09-05 PASS** — 0 controls, 0 `*ColorScheme*` nodes, 0 source hits, on all five non-Home routes at both viewports and in the drawer |
| S16 | **A scroll region that can be reached by keyboard can also be USED by keyboard**: it takes a visible focus ring and the arrow keys move it in both directions. Reached with real `Tab` presses from a clean load — never `el.focus()`, never a programmatic `scrollLeft` | TEST-005 (TASK-014 carry (b), left UNVERIFIED because the engineer's harness sent no key events) | **2026-09-05 PASS** — `/services` scroller is the 4th Tab stop; ring `rgb(164,136,255) solid 2px`; ArrowRight ×11 → 440/584, ArrowLeft ×3 → 320. `End`/`Home` do NOT jump to the edges (OBS-6, not a failure — no check asks for them) |

## Home (`/`) — added by REQ-001

| # | Check | Last run |
|---|-------|----------|
| H1 | **No light/dark toggle** anywhere in the header, and no colour-scheme control anywhere in the document (R10) | 2026-09-05 PASS |
| H2 | Between one and three of the four R5 quotes appear — never all four (R5). Today: quote 4 (hero) and quote 2 (statement band) | 2026-09-02 PASS |
| H3 | Every rendered quote matches its R5 string **character-for-character**, compared as exact node text, straight quote marks included. `lang` is set per language. **Baseline: R5 as it stands in REQ-001 from 2026-09-02** (quote 2 Thai = the 42-char `ผมไม่ทำงาน…`, owner-ruled Q4) | 2026-09-02 PASS — all three rendered strings R5-exact (quote 4; quote 2 Thai 42 chars; quote 2 English 46 chars). Ancestor containers concatenate th+en and are not quote strings — do not read them as a diff. See TEST-001 §Confirm-tick round |
| H4 | None of the reference screenshot's own content appears, in text or in source: `FAEK`, `150+`, `Win Awards`, `12Years`, `Li Europan`, `Get Started`, `CREATIVE`, `agency.` (R9). **Since 2026-09-05 this runs on all SIX routes, not Home alone** (REQ-002 AC6) | 2026-09-05 PASS — 0 hits in 96 text + 96 source checks |
| H5 | No client-facing string on Home is new or altered except the quotes — check every visible text node against the last pre-REQ baseline (R4) | **2026-09-05 NOT_TESTED** — the baseline this check needs does not exist anywhere QA may read. Unrunnable as written until one is supplied or it is rewritten; see TEST-004 QQ7. **This check stays `NOT_TESTED` and is NOT rewritten by QA** — whether the gap is closed at all is the owner's **Q25** (Porter, QQ8 2026-09-05); capturing a baseline now would close it by default |
| H6 | **Reduced motion**: with `prefers-reduced-motion: reduce`, `document.getAnimations()` is empty at first paint, two settled frames are identical, **and the hero is fully visible** (not stuck at the animation's start state). Always run the `no-preference` control too — a check that cannot detect motion proves nothing | 2026-09-05 PASS — `reduce` 0 animations + hero `opacity:1`/`transform:none`; control `no-preference` 1 (`HomeHero_rise`) |
| H7 | **Skip link by keyboard**: Tab once → "Skip to content" with a visible focus ring; Enter → `#main`; **the next Tab lands inside `<main>`**. `activeElement` staying on `<body>` is not a failure — the next Tab is the check. **Do not click the page first** — a click moves the sequential-focus start point and the first Tab then lands on the wrong element | 2026-09-05 PASS |
| H8 | Hero renders its full set at 360x740 above the fold: name, nickname/role, lead, both CTAs, hero quote | **2026-09-05 PASS** — all six above the fold with 49px to spare: name 167–256, role 268–293, lead 309–520, CTA 1 544–588, CTA 2 "Get in touch" 600–644, quote 664–691 (fold 740). **DEF-2 closed**, see TEST-005 case 1 |

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
- A **production-build** warning, `The resource …/_next/static/css/<hash>.css was
  preloaded using link preload but not used within a few seconds from the
  window's load event` — four CSS hashes, seen on `/portfolio` and `/about` when
  a page is left open for several seconds. A warning, not an error; **build-mode
  only**, and absent from the dev console. S6 counts errors, not warnings, so
  this is not a failure. No cause is named. TEST-003 **OBS-7**.

## Never done by QA

`/contact` is never submitted with valid values — it sets
`window.location.href = mailto:…` and would launch the owner's mail client
(item **D**, his alone). Production (`portfolio.develyst.online`) is never
opened, not even a GET. No product code is ever changed to make a check pass.
