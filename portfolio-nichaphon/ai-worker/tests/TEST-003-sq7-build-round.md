# TEST-003: the BUILD round — SQ7's three triggers, S13 and S11 on a `npm run build` output

- Source REQ: REQ-002 (**AC8**'s open half = REGRESSION **S11**). The SQ7 defect
  itself predates REQ-002; the round was granted by Porter as
  tests/TEST-002-sq7-modal-drawer-repro.md §Questions **QQ1**.
- Status: **TEST_PASSED**
- Environment: **local only** — `cd front && npm run build`, then the built output
  served on **two** local ports (see §How this round was run). Production
  (`portfolio.develyst.online`) was not contacted, not even a GET.
- Tested: 2026-09-05 by Tanya
- Harness: `tests/harness/test003-2026-09-05.cjs` (Playwright, real Chromium via
  `channel: 'chrome'`, **headed**; playwright installed OUTSIDE the repo and
  reached via `NODE_PATH`; `front/package.json` untouched). Two scratch probes
  (six-route sweep, S13 settle probe) are transcribed in the evidence folder.
- Evidence folder: `../project-docs/qa-test003-2026-09-05/`
  (`standalone/` and `next-start/` shots + seven `.txt` transcripts)

## Scope

**Covers**, on a production build and nothing else:

1. **S11 / AC8 first half** — does `npm run build` complete with no errors?
2. **The same three SQ7 triggers TEST-002 ran on `next dev`**, now on the built
   output: T1 `/portfolio` "Project detail" → `Modal`; T2a `/about` "View
   certificate" and T2b "Read full conversation" → `ImageLightbox` `Modal`;
   T3 `/` @390px burger → `Drawer`. Open **and** close, with the hydration
   control beside each one.
3. **REGRESSION S13** — do DEF-1's nine `/about` thumbnails behave the same in
   the built output? (Porter's QQ1 wording: observation, not a fix.)
4. **AC8's second half on the build** — all six routes serve locally with no
   console errors, at desktop and mobile.

**Does NOT cover** — stated plainly so silence is not read as a pass:

- The **look** of the modal / drawer skin. Unchanged from TEST-002: this round
  asks *does it open*, not *is it right*. **SQ7's look gate is still Sober's and
  is not ticked here.**
- The **full REGRESSION sweep**. TEST-005 re-ran the dev-mode set today; this
  round adds only the build-mode checks above plus S1/S2/S6/S7/S8 as supporting
  evidence for AC8. H5 is still `NOT_TESTED` (Porter's QQ8 — do not rewrite it).
- **Checkout state.** Per the standing rule (REQ-001) no role tracks or reasons
  about the human's git activity. This is what the built output served me on
  2026-09-05, and nothing more is asserted about which tree it came from.
- **Firefox**, and any browser other than the machine's Chrome.

## How this round was run

- `front/.next` held a **dev** output with no `BUILD_ID` at the start (as the
  board recorded). I deleted it before building — dev output and build output
  must not share that directory.
- `npm run build` → **exit 0**. The repo's build script is
  `next build && node scripts/copy-standalone-assets.mjs`, and
  `front/next.config.ts` sets **`output: 'standalone'`**.
- Serving it raised a real fork, so **I ran both surfaces rather than pick one**:
  - **`next start` (`npm run start`) on port 3042** — the literal command in
    Porter's QQ1 grant. It serves, but Next prints
    `⚠ "next start" does not work with "output: standalone" configuration. Use "node .next/standalone/server.js" instead.`
  - **`node .next/standalone/server.js` on port 3041** — the shape the build
    script itself prepares assets for.
  **Every observation below was taken on both, and the two agree on every
  check.** Which one the owner's deploy actually uses is not mine to assert —
  see §Questions **QQ10**.
- Port **3000** is held by an orphan `next` (PID 8508) that is nobody's on this
  team. Routed around, never touched, still listening at the end.
- Run rules obeyed (REGRESSION §How to run it): headed Chrome, tab fronted and
  one throwaway screenshot taken before any measurement, whole document scrolled
  with one `requestAnimationFrame` per step before measuring. No `el.focus()`.
- Both my servers were stopped at the end and `front/.next` was deleted, so the
  next `npm run dev` starts clean.

## Cases

| # | Case (from AC / REGRESSION) | Type | Viewport | Steps | Expected | Actual | Result |
|---|------|------|----------|-------|----------|--------|--------|
| 1 | **S11 / AC8** — `npm run build` exits 0 with no errors | happy | — | delete `front/.next`, `cd front && npm run build` | exit 0, no error lines | **exit 0.** `✓ Compiled successfully in 21.3s`, types + lint clean, `✓ Generating static pages (10/10)`, all 7 app routes `○ (Static)`, shared JS 102 kB, then `[postbuild] copied .next/static + public/ into .next/standalone`. **Zero error lines and zero warning lines in the whole transcript** — `build-transcript.txt` | **PASS** |
| 2 | **T1** `/portfolio` `ProjectModal` opens on the build | happy | desktop 1280x900 | load `/portfolio` (200), scroll whole doc, click "Project detail" on card 1 of 9 | a modal mounts and paints | 9 trigger buttons found; after the click `[role=dialog]`=1, `.mantine-Modal-content`=1, overlay=1, `body[data-scroll-locked]="1"`, overflow `hidden`; dialog text starts "DTE Platform…". **Seen in the shot**: title, summary, "What it does" list, stack chips, "Open live project" | **PASS** |
| 3 | T1 closes again | happy | desktop | press `Escape` | unmounts, lock released | dialogs 0, content 0, overlay 0, lock `null`, overflow `visible` | PASS |
| 4 | **T2a** `/about` certificate lightbox opens | happy | desktop | click "View certificate" (4 found) | modal mounts with the certificate | dialog=1, content=1, overlay=1, scroll-locked; title "Prompt Engineering with GitHub Copilot certificate, issued by BorntoDev Academy"; the image **inside** the modal measures 1035x720 box / 1100x810 natural / `complete: true`, and reads legibly in the shot | **PASS** |
| 5 | T2a closes | happy | desktop | `Escape` | unmounts | all counters 0, lock released | PASS |
| 6 | **T2b** `/about` testimonial lightbox opens | happy | desktop | click "Read full conversation" (5 found) | modal mounts with the conversation | dialog=1, content=1, overlay=1, scroll-locked; title "Client conversation 1"; image inside the modal 1035x720 box / 1100x485 natural / `complete: true` | **PASS** |
| 7 | T2b closes | happy | desktop | `Escape` | unmounts | counters 0, lock released | PASS |
| 8 | **T3** burger `Drawer` opens on the build | happy | mobile 390x844 | load `/` (200), click the burger | drawer mounts with the six nav links | burger visible; after the click dialog=1, `.mantine-Drawer-content`=1, overlay=1, scroll-locked; text "NavigationHomeAboutServicesPortfolioBlogContact". **Seen in the shot**: right-hand drawer, "Navigation" title, all six links, Home marked active | **PASS** |
| 9 | T3 closes | happy | mobile | click the drawer's own close button | drawer unmounts | counters 0, lock released | PASS |
| 10 | **Hydration control** beside every trigger | control | both | scroll 400px, read `header[data-scrolled]` | flips `false` → `true` | flips on `/portfolio`, `/about` and `/` @390 in **both** legs. Client state runs, so nothing above is masked by a dead bundle | PASS |
| 11 | **S13** — all 9 `/about` thumbnails have a non-zero box **and** paint | regression | desktop 1280 | load `/about`, scroll whole doc, settle, probe frame box + `complete`/`naturalWidth` | 9/9 non-zero and painted, no `fill…height value of 0` warning | **9/9 painted** at every settle checkpoint (+2s/+5s/+10s), boxes 244x183 (certs) and 337x210 (testimonials); all nine `/_next/image` responses **200**. **Zero** `has "fill" and a height value of 0` warnings in either leg. DEF-1's signature is absent from the build | **PASS** |
| 12 | **S13** at mobile | regression | mobile 360x740 | same | 9/9 painted | **9/9 painted**, boxes 303x227 (certs) and 303x189 (testimonials). Full-page shot shows every certificate and every conversation | **PASS** |
| 13 | **AC8 second half** — all six routes serve on the build with no console errors | happy | desktop **and** mobile | load `/`, `/about`, `/services`, `/portfolio`, `/blog`, `/contact`, scroll each | 200, one `h1`, own `<title>`, dark scheme, no console error, no failed request | **12/12 loads clean**: status 200, `h1` count 1, distinct `<title>`, `data-mantine-color-scheme="dark"`, body `rgb(11, 9, 22)`, horizontal overflow **0 px**, no 404 text, **0 console errors, 0 pageerrors, 0 failed requests, 0 responses ≥400** — `six-route-sweep.txt` | **PASS** |

Both legs (`next start` 3042 and standalone 3041) were run end to end and agree
on cases 2–12. Case 1 and case 13 were run once each (the build is one artifact;
the six-route sweep was run on the standalone leg).

## Defects

**None.** No defect was found in this round, and none of TEST-004's or
TEST-005's closed defects reappeared on the built output.

## Observations (not defects — recorded because I saw them)

- **OBS-7 — a build-only console warning.** On pages left open for several
  seconds, Chrome logs `The resource …/_next/static/css/<hash>.css was preloaded
  using link preload but not used within a few seconds from the window's load
  event.` — 18 times in each leg, four distinct CSS hashes, on `/portfolio` and
  `/about`. It is a **warning**, never an error, and it did **not** appear at
  all in the six-route sweep (those pages were open ~2 s). REGRESSION **S6**
  counts errors, pageerrors and failed requests — all zero — so this does not
  fail anything. It is new relative to dev, where TEST-004/005 saw a clean
  console; it is a property of the production build's CSS preload, not of any
  REQ-002 edit, and **I name no cause**. Added to REGRESSION §Known and accepted.
- **OBS-8 — the two largest testimonial images are slow on a cold image cache.**
  On the very first pass over `/about` after the build, thumbnails 8 and 9 were
  still `complete: false` about 3 s after the scroll pass (frames already sized
  correctly at 337x210 — **not** DEF-1's 0x0 collapse). With a warm
  `/_next/image` cache all nine were painted 2 s after the scroll pass in both
  legs. This is why S13's "wait, then re-probe" wording exists; it is timing,
  and nothing on this page renders wrong once settled.

## Verdict

**`TEST_PASSED`** — the production build is not broken for a visitor.
`npm run build` exits 0 with no error and no warning line (**S11 PASSES**, and
that is **AC8's open half**); all three SQ7 triggers open, paint and close on the
built output on **both** serving surfaces, with the hydration control flipping
beside each one; DEF-1's nine `/about` thumbnails paint at both viewports
(**S13 holds on the build**); and all six routes serve with zero console errors
at desktop and mobile.

What this verdict does **not** say, so nobody reads more into it:

- It does **not** tick the modal / drawer **look**. That gate is Sober's and
  this round did not touch it — unchanged from TEST-002.
- It does **not** assert anything about which tree the build came from, and it
  does not speak for the live site.
- **H5 remains `NOT_TESTED`** (Porter's QQ8) and is untouched by this round.
- **Nothing here makes REQ-002 `DELIVERED`.** AC8's build half is now met by
  measurement; ticking AC8 and moving the REQ is **Porter's**, not mine.

## Questions

(For Porter; he answers as `> answer: ...`)

- **QQ10 — which served surface is the one that counts, and does the build's own
  warning matter to anyone?** `front/next.config.ts` sets
  `output: 'standalone'`, and Next itself prints that **`next start` "does not
  work"** with that setting — yet `npm run start` served all six routes and every
  trigger identically to `node .next/standalone/server.js`. I ran both rather
  than choose, so **this verdict holds either way and nothing is blocked on the
  answer.** But the wording of your QQ1 grant (`npm run build && npm run start`)
  names a command the framework calls unsupported for this repo's config, and
  which surface the owner's deploy actually runs is a fact I may not go and look
  at. Two things I am **not** deciding: (a) whether future QA rounds should test
  `next start`, the standalone server, or both; (b) whether that warning is worth
  telling the owner about at all. Both are yours to route.

  > answer (Porter, PM, 2026-09-05): **QQ10 is answered in two halves, and
  > neither half changes your verdict — thank you for running both instead of
  > picking one; that is why AC8 could be ticked today.**
  >
  > **(a) Which surface future rounds use is YOURS, not mine.** I ask for
  > outcomes and never for method, and that rule does not bend because the
  > question is uncomfortable. Run whichever surface (or both) you judge gives
  > the honest answer. The **one business constraint** I add: any round whose
  > verdict I will quote to the owner as "the build is fine" must **name the
  > surface it ran on**, exactly as this file does — so he is never told
  > something broader than what was measured.
  >
  > **(b) Yes, the warning goes to the owner** — in one line, as **Q26**, a
  > DATA REQUEST: which surface his droplet (`pm2` process
  > `portfolio-frontend`) actually serves. That is a production fact and no
  > role on this team may go and look at it. It is **non-blocking**: both
  > surfaces agreed on every check, so **AC8 is TICKED and REQ-002 is
  > `DELIVERED` today** without waiting for it. When he answers, the only thing
  > it decides is what your future rounds mirror.
  >
  > **My QQ1 grant's wording (`npm run build && npm run start`) was mine and it
  > was imprecise** — I named a command the framework calls unsupported for this
  > repo's config. Recorded here rather than quietly fixed. Recorded in
  > requirements/REQ-002-whole-site-step-up-five-routes.md §Questions Q26 and
  > §Delivery.

## Footprint

- Deleted `front/.next` **before** the build (it held a dev output with no
  `BUILD_ID`) and **again after** the round, so the next `npm run dev` starts
  clean. `.next` is a regenerable build artifact; no source file was touched.
- Started two servers of my own, on **3041** (standalone) and **3042**
  (`next start`), and stopped both — verified with `netstat`. Port **3000**'s
  orphan (PID 8508) was routed around and is still listening, untouched.
- Wrote only: this file, `tests/harness/test003-2026-09-05.cjs`, the evidence in
  `../project-docs/qa-test003-2026-09-05/`, plus the REGRESSION / board / log /
  `inbox/PM.md` lines PROTOCOL requires. **No product code was changed** — the
  set of modified paths under `front/src` was identical before and after my
  round.
- Playwright reached via `NODE_PATH` from outside the repo;
  `front/package.json` unchanged.
- No git write, no deploy, no `pm2`, no ssh, no release/merge script.
  Production was not contacted, not even a GET.
