# TEST-002: SQ7 repro — do `Modal` and `Drawer` ever open?

- Source REQ: REQ-002 §Questions SQ7 (the defect itself predates REQ-002)
- Status: **CANNOT_REPRODUCE** (see §Verdict — this is a real outcome, not a
  failure). Note: PROTOCOL's TEST vocabulary is
  `IN_TEST | TEST_PASSED | TEST_FAILED | NOT_TESTED`; **`CANNOT_REPRODUCE` is
  not one of the four.** I used it because it is the outcome Porter asked for by
  name and none of the four says it — `TEST_PASSED` would claim the modal *look*
  was accepted (it was not) and `NOT_TESTED` would be a lie (it was run). If
  Porter wants it mapped onto the standard four, that is his call, not mine.
- Environment: local only — `cd front && npm run dev`, http://localhost:3000
- Tested: 2026-09-03 by Tanya
- Harness: `tests/harness/test002-modal-drawer-2026-09-03.cjs` (Playwright, real
  Chromium via `channel: 'chrome'`; playwright installed OUTSIDE the repo, so
  `front/package.json` is untouched)
- Evidence folder: `../project-docs/qa-test002-2026-09-03/`

## Scope

**Covers** the one question Porter asked: on the locally served site, does a
Mantine `Modal` or `Drawer` ever open? Three triggers, the ones named in SQ7:

| | Trigger | Component | Overlay |
|---|---|---|---|
| T1 | `/portfolio` → a card's "Project detail" button | `PortfolioContent` → `ProjectModal` | `Modal` |
| T2 | `/about` → a lightbox thumbnail | `AboutCertificates` / `AboutTestimonials` → `ImageLightbox` | `Modal` |
| T3 | `/` at 390px → header burger | `SiteHeader` | `Drawer` |

**Does NOT cover** — say so plainly rather than let silence read as a pass:

- The **look** of the modal / drawer skin (TASK-006's `Modal` skin, TASK-008's
  lightbox, TASK-009's `ProjectModal`). This round asks *does it open*, not *is
  it right*. Those ticks are still Sober's gate and are still not ticked here.
- A **production build**. Only `next dev` was exercised. `next build` +
  `next start` was not run, so nothing here speaks for the built output.
- **Checkout state.** I tested what the running dev server served on 2026-09-03.
  Per the standing rule (REQ-001), no role tracks or reasons about the human's
  git activity, so "clean `develop`" is asserted by nobody here — see §Questions
  QQ1, which is the one thing Porter must not read past.

## Cases

| # | Case | Type | Viewport | Steps | Expected | Actual | Result |
|---|------|------|----------|-------|----------|--------|--------|
| 1 | T1 `ProjectModal` opens | happy | desktop 1280x900 | load `/portfolio` (200), click "Project detail" on card 1 of 9 | a modal mounts and paints | `[role=dialog]`=1, `.mantine-Modal-content`=1, overlay=1, `body[data-scroll-locked]="1"`, body overflow `hidden`; dialog text starts "DTE Platform…"; screenshot shows the full detail card — title, summary, "What it does" list, stack chips, "Open live project" button | **PASS (opens)** |
| 2 | T1 closes again | happy | desktop | press `Escape` | modal unmounts, scroll lock released | `[role=dialog]`=0, `.mantine-Modal-content`=0, overlay=0, scroll-lock `null`, overflow `visible` | PASS |
| 3 | T2a certificate lightbox opens | happy | desktop | load `/about` (200), click "View certificate" (4 found), | modal mounts with the certificate image | `[role=dialog]`=1, content=1, overlay=1, scroll-locked; title "Prompt Engineering with GitHub Copilot certificate, issued by BorntoDev Academy"; the certificate image renders full-size in the shot | **PASS (opens)** |
| 4 | T2a closes | happy | desktop | `Escape` | unmounts | all overlay counters back to 0, lock released | PASS |
| 5 | T2b testimonial lightbox opens | happy | desktop | click "Read full conversation" (5 found) | modal mounts with the conversation image | `[role=dialog]`=1, content=1, overlay=1; title "Client conversation 1"; the chat screenshot renders | **PASS (opens)** |
| 6 | T2b closes | happy | desktop | `Escape` | unmounts | counters 0, lock released | PASS |
| 7 | T3 burger `Drawer` opens | happy | mobile 390x844 | load `/` (200), burger visible, click it | drawer mounts with the six nav links | `[role=dialog]`=1, `.mantine-Drawer-content`=1, overlay=1, scroll-locked; dialog text "NavigationHomeAboutServicesPortfolioBlogContact"; screenshot shows the right-hand drawer, "Navigation" title, all six links, Home marked active | **PASS (opens)** |
| 8 | T3 closes | happy | mobile | click the drawer's close button | drawer unmounts | counters 0, lock released | PASS |
| 9 | Hydration control | control | all three pages | scroll 400px, read `header[data-scrolled]` | flips `false` → `true` on every page | flips on `/portfolio`, `/about` and `/` | PASS |
| 10 | Console clean during the overlay work | regression | all | collect `error` + `pageerror` + `warning` | no errors | **0 errors, 0 pageerrors.** 9 warnings, all one kind, all on `/about` — see DEF-1 | PASS (for SQ7) |

Case 9 matters: if the page had never hydrated, a dead `Modal` would prove
nothing about `Modal`. It hydrates, client state runs, and the overlays still
mount — so nothing here is masked by a broken bundle.

Run twice, ~3 minutes apart, same results both runs.

## Defects

### DEF-1 — every lightbox thumbnail on `/about` renders at 0x0 — MAJOR
**Not SQ7.** Found while running T2; reported because I saw it, not because it
was asked for. Routing is Porter's call, not mine.

- Viewport: desktop 1280x900 (dark, the only scheme)
- Repro (from a clean load): 1. `npm run dev` 2. open `/about` 3. scroll to
  "Certifications and training" and to "Client conversations"
- Expected: each certificate / conversation shows its image thumbnail above the
  caption, with the "View certificate" / "Read full conversation" hint on it.
- Actual: **no image is visible anywhere in either grid.** All **9**
  `ImageLightbox` frames measure `0x0` px, and so do the `<img>` boxes inside
  them. The images themselves load fine (natural sizes read 320x235, 320x225,
  422x186, 422x340 …), and the modal shows them full-size when opened — it is
  only the thumbnail frame that has collapsed. What a visitor sees is a bare
  outlined hint bar and a caption.
- Console (9 warnings, one per image): `Image with src "…" has "fill" and a
  height value of 0. This is likely because the parent element of the image has
  not been styled to have a set height.`
- Evidence: `../project-docs/qa-test002-2026-09-03/t2-cert-before.png` (the
  certificates grid — four hint bars, zero images),
  `obs-about-fullpage.png` (the whole route),
  `t2-cert-after-click.png` / `t2-testi-after-click.png` (the same images
  rendering correctly *inside* the modal, which is why this reads as a
  thumbnail-frame problem and not a missing-asset one).
- I do not propose the fix and have not looked for one. What broke and how to
  see it is mine; why and how to repair it is Sober's.

## Verdict

**CANNOT_REPRODUCE.** All three SQ7 triggers open on the locally served site on
2026-09-03: the Portfolio `ProjectModal`, both `/about` lightbox `Modal`s, and
the mobile burger `Drawer`. Each one mounts, paints its content, locks scroll,
and closes again. The portal is not empty — I have the screenshots.

That is the verdict on **what the site served me today**. It is *not* a
statement that Fern's report was wrong: he reported it on 2026-09-02, I ran on
2026-09-03, and the tree in between is outside what any role here may reason
about. Whether "the defect is gone" or "the defect was never in this tree" is
**not something I can tell from a browser**, and I am not guessing it — QQ1.

One separate MAJOR defect fell out of the round: DEF-1.

## Questions

(For Porter; he answers as `> answer: ...`)

- **QQ1 — the one that decides what this verdict is worth.** SQ7's value to the
  owner is "is the site broken for visitors". I can answer that for today's
  local tree: **no, the overlays work.** I cannot answer "was it ever broken,
  and did something change" — that needs the checkout state, and the standing
  rule (REQ-001) puts git off-limits for every role including me. **Do you want
  a second round on a `next build` + `next start` output** (the shape closest to
  what ships), which is the only other surface I am allowed to test? I have not
  run it and will not assume it behaves like `next dev`.
- **QQ2 — DEF-1's routing.** `/about` is TASK-008's live surface and that task
  is BLOCKED on the board. Is DEF-1 (a) already known to Sober/Fern and
  in-flight, (b) a new finding you want relayed to Sober, or (c) out of scope
  for REQ-002 and its own thing? I am not routing it myself — QA reports, PM
  routes.
- **QQ3 — the scope half of SQ7 is still the owner's, and it may have changed
  shape.** REQ-002 §Questions SQ7 says the scope call ("fix now as its own
  defect REQ vs ship visual-only with the modal look UNVERIFIED") goes back to
  the owner once a verdict exists. The verdict now exists and it is
  cannot-reproduce — which may dissolve the first half but does **not** by
  itself tick the modal *look*. That tick is still Sober's gate and this round
  did not touch it.

  > answer (Porter, 2026-09-03) — **QQ1: yes. Run the build round; it is
  > granted as TEST-003** (`cd front && npm run build && npm run start`, local
  > only, never the droplet). Two reasons, and neither is "to be thorough":
  > `next dev` is not the shape that ships, so a dev-only verdict cannot answer
  > the owner's actual question ("is the site broken for visitors"); and your
  > own §Footprint says a `next build` output was sitting in `front/.next`
  > before you cleared it — the built surface is therefore untested by anyone.
  > Scope: the same three triggers T1/T2/T3, plus one look at whether DEF-1's
  > 9 thumbnails behave the same in the built output (your REGRESSION S13 —
  > observation only, not a fix). Everything you excluded stays excluded: the
  > modal **look** is still not yours to tick, and checkout state stays
  > unasserted — do not reason about it, that rule has not moved. If the build
  > cannot be produced or served, `NOT_TESTED` with the reason is a complete
  > answer; do not substitute a dev run for it.
  >
  > answer (Porter, 2026-09-03) — **QQ2: (b). DEF-1 is a NEW finding and I have
  > relayed it to Sober**; you were right not to route it. I grepped `specs/`
  > and `tasks/` — no collapsed thumbnail is recorded anywhere, so it is not
  > known-and-in-flight, and `/about` is TASK-008's live surface (BLOCKED), so
  > it is not a distant unrelated thing either. Sober places it; I do not, and
  > neither of us proposes the fix. One thing I explicitly did **not** decide
  > and you should not either: whether DEF-1 pre-existed or arrived with
  > TASK-008's built files. Nobody has established that. It is in
  > `inbox/SA.md` and in REQ-002 §Questions.
  >
  > answer (Porter, 2026-09-03) — **QQ3: correct, and it stays the owner's.**
  > The verdict does not tick the modal look and I am not treating it as if it
  > did. I have put the scope half to him in Thai today, in its new shape (ship
  > REQ-002 with the modal look unverified, or hold until it is verified).
  > Whether your verdict lifts Sober's gate is **Sober's** call — relayed to
  > him as a fact, not as an instruction from me.
  >
  > answer (Porter, 2026-09-03) — **on `CANNOT_REPRODUCE` not being one of
  > PROTOCOL's four: accepted as written, I am not remapping it.** Your reason
  > is the right one — `TEST_PASSED` would claim the modal look was accepted
  > and `NOT_TESTED` would be false. The board carries it verbatim. The
  > vocabulary gap is real and noted; PROTOCOL is not mine to edit, so it goes
  > no further than this note unless the owner wants it closed.

## Footprint

- Started `npm run dev` on **port 3000** (it was free) and stopped it at the end
  of the session. No other process touched.
- Deleted `front/.next` before starting dev — a `next build` output was sitting
  there and dev must not run on top of one. It is a regenerable build artifact;
  no source file was touched.
- Wrote only: this file, `tests/harness/test002-modal-drawer-2026-09-03.cjs`,
  the screenshots in `../project-docs/qa-test002-2026-09-03/`, plus the board /
  log / `inbox/PM.md` lines PROTOCOL requires.
- Playwright is installed outside the repo and reached via `NODE_PATH`;
  `front/package.json` is unchanged.
- Production (`portfolio.develyst.online`) was not contacted, not even a GET.
