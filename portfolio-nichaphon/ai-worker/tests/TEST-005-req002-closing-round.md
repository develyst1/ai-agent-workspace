# TEST-005: REQ-002 closing round — H8, S14, the five-route AC7 look, `/services` at 1280, arrow keys

- Source REQ: REQ-002 (**AC3** + **AC7**), plus two carries from TASK-014
  (`/services` at 1280 never seen; arrow keys UNVERIFIED). Brief:
  requirements/REQ-002-whole-site-step-up-five-routes.md §TEST-005 request.
- Status: **TEST_PASSED** — all five checks pass. **DEF-2 and DEF-3 are closed.**
- Environment: local only — `cd front && npx next dev -p 3021`,
  **http://localhost:3021**. Production was never opened, not even a GET.
- Tested: 2026-09-05 by Tanya
- Harness (4 rounds, all in `tests/harness/`, Playwright installed OUTSIDE the
  repo and reached via `NODE_PATH`; `front/package.json` untouched):
  `test005-2026-09-05.cjs` (the five checks + a trust set) ·
  `test005b-…` (S14 at deviceScaleFactor 3) · `test005c-…` (header re-capture)
  · `test005d-…` (the clean-load keyboard walk)
- Browser: the machine's Chrome via `channel: 'chrome'`, **headed**
  (`headless: false`).
- Evidence folder: `../project-docs/qa-test005-2026-09-05/` — 40 files: 33
  evidence shots, 6 `_wake*.png` throwaways (the wake step, not evidence), and
  `_raw-results.json`. **Ignore `a3-header-desktop-*.png`** — those five were
  clipped after the document had been scrolled and frame the wrong strip; the
  header evidence is `c-header-desktop-*.png` / `c-header-mobile-*.png`. They
  are left in place rather than deleted so the record is complete.

## Scope

**Covers** exactly the five checks Porter asked for, plus a **trust set** I chose
(see below) on the two routes the three fixes touched.

**Does NOT cover** — stated rather than left to silence:

- **`npm run build` / S11 / AC8's open half.** That is TEST-003, still open and
  separate. `front/.next` is a **dev** output with no `BUILD_ID` and I left it
  that way.
- **H5.** Still unrunnable as written (no baseline exists anywhere QA may read).
  Porter does not count it against AC3 (QQ7). See §Questions QQ8.
- **SQ13** (`/services` is 1156px tall on a phone). Explicitly out of this round;
  the layout underneath the fix is the owner's scope call, not mine. I record
  what I measured and stop there.
- **The modal / lightbox / drawer *look*.** Sober's gate, not mine.
- **Cause or blame.** I did not test a pre-fix tree, and per the REQ-001
  standing rule I do not track or reason about the human's git. "H8 passes
  today" is not "TASK-013 fixed it" — it is what the running site served me.
- **Checkout state.** I tested what the dev server served on 2026-09-05.

### The trust set I chose, and why it is this size

Porter left it to me. The three edits were a Home-hero mobile CSS block, the
`/services` scroller CSS, and the deletion of a component mounted nowhere plus
its barrel re-export — so a full REGRESSION sweep would mostly re-prove what
TEST-004 proved this morning. What a **barrel** deletion *can* break is any
route importing through it, so I re-ran the cheap site-wide checks on every
route I loaded (S6 console, S7 dark, S8 overflow) and took a fresh **desktop
full-page eye on `/about`, `/portfolio`, `/blog` and `/contact`** after the
edits. That is proportionate; it is not the full sweep and I do not claim it is.

## How this round was run

- **Port 3021, not 3000.** Port 3000 is still held by PID 8508 — a `next`
  server for this repo that this session did not start and does not own. I did
  not touch it. My own server (PID 17892) was started on 3021 and stopped at the
  end; `front/.next` was left a dev output.
- Every page was **fronted and given one screenshot before anything was
  measured**, so `document.hidden` goes false and scrolling, transitions and
  lazy content actually run (`docHidden: false` is recorded in
  `_raw-results.json`). Then the whole document was scrolled end to end, one
  `requestAnimationFrame` per step.
- Keyboard checks used **real `Tab` / `Arrow` presses**, never `el.focus()` and
  never a programmatic `scrollLeft`.
- Every verdict below comes from a screenshot I opened and read. Harness lines
  are quoted as measurements, never as the result.
- **Headed Chrome lays an emulated 360 out at `clientWidth` 345** (the
  engineer's finding, reproduced again here). The fold is `innerHeight` = 740.

---

## Cases

| # | Check (from the TEST-005 brief) | Type | Viewport | Actual | Result |
|---|---|---|---|---|---|
| 1 | **REGRESSION H8** — hero renders name, nickname/role, lead, **both** CTAs and the hero quote above the fold | happy | mobile 360×740 | All six parts above the fold, none cut: name 167–256, "Dong · Senior / AI Software Engineer" 268–293, lead 309–520, CTA 1 "View my work" 544–588, **CTA 2 "Get in touch" 600–644**, hero quote "Don't say why me. Say try me." **664–691**. Fold = 740. Read off `a1-h8-fold-360x740.png`, where all six are legible in one screen | **PASS** |
| 2 | **REGRESSION S14** — is the visitor *told* the `/services` table scrolls | happy | mobile 360×740 | **Two signals, both seen.** (a) A real, non-overlay horizontal **scrollbar**: the scroller's own gutter is 8px of layout height (`offsetHeight` 1156 vs `clientHeight` 1146, 2px of which is border), and a purple thumb spanning ~⅓ of the track is plainly visible at the scroller's bottom edge in `b2-scroller-bottom-360-x3.png`. (b) A **right-edge shadow** visible along the full right edge the moment the table arrives on screen (`b1-scroller-top-360-x3.png`), which **swaps to the left edge** once the table is scrolled to its far right (`b3-…`). Content is reachable: at `scrollLeft` 584 the whole "Stack" column is readable | **PASS** — DEF-3 closed |
| 3 | **No colour-scheme control on the five non-Home routes** (`/about`, `/services`, `/portfolio`, `/blog`, `/contact`) | happy | desktop 1280 + mobile 360 + drawer | **0 colour-scheme controls on all five, at both viewports and inside the open mobile drawer.** Each route's `<header>` holds exactly **one** control — the burger, `aria-label="Open navigation"` — and seven links (logo ×2 + the six routes). 0 `*ColorScheme*` nodes; 0 source hits for `ColorSchemeToggle` / `useMantineColorScheme` / `toggleColorScheme`; `<html data-mantine-color-scheme="dark">` and body `rgb(11,9,22)` on all ten loads. The drawer holds six route links and a close button, nothing else. Seen in `c-header-desktop-*.png`, `c-header-mobile-*.png`, `a3-drawer-open-about-360.png` | **PASS** |
| 4 | **A desktop eye on `/services` at 1280** after the DEF-3 change | regression | desktop 1280 | The page looks right. The scroller does **not** overflow at this width (`scrollWidth === clientWidth === 1054`), so **no scrollbar and no edge shadow are drawn** — the two covers hide them exactly as intended. All three columns are laid out and readable: Service @106–437, What it covers @437–769, Stack @769–1160; six rows, all stack chips rendering. No stray band, no clipped text, no page overflow (1265 = 1265). Seen in `a4-services-table-1280.png` and `a4-services-full-1280.png` | **PASS** |
| 5 | **Arrow-key scrolling of the `/services` scroller** (carry, not an AC) | edge | mobile 360×740 | **Reachable and usable.** From a **clean load, no click, no programmatic scroll**, the scroller is the **4th** Tab stop (1 skip link → 2 logo → 3 burger → 4 scroller). It takes a **visible focus ring** — `outline: rgb(164,136,255) solid 2px`, offset 2px, seen around the whole box in `a5-scroller-after-keyboard-360.png`. `ArrowRight` ×3 → `scrollLeft` 0→120 (40px/press); ×11 → 440 of a 584 max, with "What it covers" and "Stack" brought on screen; `ArrowLeft` ×3 → back to 320. Both directions work | **PASS** |

## Trust set (my call, not requested)

| # | Check | Where | Actual | Result |
|---|---|---|---|---|
| S6 | No console errors / pageerrors | all six routes, both viewports, across all four harness rounds | **0** errors, **0** pageerrors | **PASS** |
| S7 | `data-mantine-color-scheme="dark"`, body `rgb(11,9,22)` | the five non-Home routes, both viewports | Holds on all ten loads | **PASS** |
| S8 | No horizontal page overflow at 360 | `/` and `/services` | `scrollWidth === clientWidth === 345` on both | **PASS** |
| S13 | `/about` thumbnails still painted | desktop 1280 | All nine frames render their image in `e-full-1280-about.png` | **PASS** (unchanged) |
| — | Desktop eye after the barrel deletion | `/about`, `/portfolio`, `/blog`, `/contact` at 1280 | All four render complete — hero, sections, cards, footer; nothing missing or unstyled. `e-full-1280-*.png` | **PASS** |

## Defects

**None found in this round.** The two open defects are closed:

### DEF-2 — Home hero did not fit at 360×740 — **CLOSED by this round**
REGRESSION **H8 now PASSES**: the second CTA and the hero quote are both above
the fold with 49px to spare. Evidence `a1-h8-fold-360x740.png`.

### DEF-3 — `/services` table scrolled with no visible affordance — **CLOSED by this round**
REGRESSION **S14 now PASSES**: a real scrollbar plus a directional edge shadow,
both seen at 360; the hidden columns are reachable by touch **and** by keyboard.
Evidence `b1-…`, `b2-…`, `b3-…`, `a5-…`.

## Observations (not defects — recorded so nobody re-discovers them)

- **OBS-5 — the scrollbar is at the bottom of an 1156px-tall block, so it is not
  on screen when a phone visitor first meets the table.** What they see first is
  the right-edge shadow; the scrollbar only enters view near the end of the
  table. Both signals exist and S14 asks for *a* signal, so this is a PASS, not
  a defect — but it is the reason the fix needed two signals, and it is the same
  underlying fact as SQ13 (the block is taller than the phone). Recorded for
  whoever answers SQ13, and for nobody to re-litigate S14 from it.
- **OBS-6 — `End` / `Home` do not jump the scroller to its far edges.** Only the
  arrow keys move it. Not raised as a defect: the carry asked whether arrow-key
  scrolling works, and it does. No AC or check mentions `End`/`Home`.
- **OBS-3 (from TEST-004) is unchanged** — `/blog` row meta still wraps
  inconsistently (rows 1–2 put "N min read" on its own line, rows 3–6 keep it
  inline). Still COSMETIC, still no check covers it. `e-full-1280-blog.png`.
- **OBS-4 (from TEST-004) is unchanged** — the footer still reads `© 2025` on
  every route. Already open as TEST-001 Q1.
- **The nine "suspects" my colour-scheme probe reports on `/about` are false
  positives** and must not be read as an AC7 miss: the word list contains
  `light`, and the class name is `ImageLightbox_trigger`. The buttons are the
  four "View certificate" and five "Read full conversation" lightbox triggers.
  Confirmed by looking at the headers and by the 0 `*ColorScheme*` node count.

## Verdict

**`TEST_PASSED`** — all five requested checks pass, on the running site, at the
viewports each one names, every one read off a screenshot.

**What this settles, in Porter's terms:**
- **AC3 ticks** — H8 passes at 360×740.
- **AC7 ticks** — no colour-scheme control on any of the five non-Home routes,
  desktop, mobile, or in the drawer.
- **DEF-2 and DEF-3 are both closed.**
- **Both TASK-014 carries are settled**: `/services` at 1280 has now been *seen*
  and is fine; arrow-key scrolling works and the scroller is the 4th Tab stop.

**What this does NOT settle, and REQ-002 still needs:**
- **AC8's open half — `npm run build` (REGRESSION S11) — is TEST-003's**, still
  open, still unrun. REQ-002 is **one more QA round** from being testable-complete.
- **H5 stays `NOT_TESTED`** (no baseline). See QQ8.

## Questions

(For Porter; he answers as `> answer: ...`)

- **QQ8 — H5.** I am not rewriting H5 on my own judgment, because any rewrite I
  invent changes what the check *means*, and R4 ("no new or altered
  client-facing string") is a business rule, not a QA one. Two options I can
  run, and I want you to pick — or bring Q25's answer back:
  **(a)** capture today's rendered Home strings as a **named, dated baseline**
  file in `../project-docs/` and rewrite H5 as "no client-facing string on Home
  differs from that baseline" — which then catches *future* drift but can never
  catch anything that already drifted; or
  **(b)** leave H5 permanently `NOT_TESTED` and say so in REGRESSION.
  I will not do either silently.
- **QQ9 — SQ13 and OBS-5.** DEF-3 is closed and I am not reopening it. But the
  fact underneath both is one fact: the scroller is 1156px tall on a 740px
  phone, so its scrollbar is off-screen while the visitor reads the top of the
  table. If you want that carried to the owner as part of SQ13 rather than as a
  QA note, say so and I will keep it in this file only. **Not a defect; not
  blocking; not my scope call.**
