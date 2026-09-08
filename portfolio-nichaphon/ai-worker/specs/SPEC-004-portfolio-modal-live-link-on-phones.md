# SPEC-004: The project modal's live-link button, pinned to the modal's own foot

- Source: REQ-004
- Status: **DONE** — 2026-09-05, Sober. TASK-018 `DONE` (one task, one file, one rule). AC-a…AC-g still want a QA picture round — Porter's call, not requested here.
- Scope: **one CSS rule in one CSS Module.** No TSX file changes, no theme value
  changes, no content string changes, no new token. See §Scope fence.

> SQ-numbers continue the global SA series (SPEC-003 ended at SQ17), so a board
> row never carries two SQ7s. New here: **SQ18, SQ19, SQ20**.

## Overview

REQ-004 asks for one thing: on a 360x740 phone the **"Open live project"** button
must be inside the viewport when a project's detail modal opens, with no
scrolling (Requirement 1, AC-a/AC-b).

The design is: **pin the modal's existing `.footer` to the bottom of the modal's
own scroll area** with `position: sticky; bottom: 0`. Nothing moves in the DOM,
nothing is re-ordered, nothing is re-worded — the last block of the modal simply
stops scrolling away.

**Why this and not something else — three reasons, each checked against the real
tree, not assumed:**

1. **The scroll container is known and is the right anchor.** Mantine's
   `Modal.Content` (`.m_54c44539` in
   `front/node_modules/@mantine/core/styles/Modal.css`) carries
   `overflow-y: auto` and
   `max-height: calc(100dvh - var(--modal-y-offset) * 2)` with
   `--modal-y-offset: 5dvh`. At 740 that is **90dvh = 666px**, which is exactly
   the modal box QA measured (`324x666 at (18,37)`, TEST-006 case 9). The modal
   body scrolls *inside* that element; the page behind does not move. A sticky
   child of the body therefore pins against precisely the edge REQ-004 calls
   "the modal's fold" (~y=703).

2. **This modal already does exactly this, at the other end.** Mantine's modal
   header (`.m_b5489c3c` in `ModalBase.css`) is already
   `position: sticky; top: 0; z-index: 1000`, and `front/src/theme/theme.ts`
   (Modal `styles.header`) already re-grounds it to `var(--site-surface)` with
   the comment *"The sticky title bar defaults to `--mantine-color-body`; it has
   to follow the content ground or the panel reads as two tones."* QA's own
   scrolled picture (`m-learning-curve-modal-foot-wheel-mobile-360.png`) shows
   that header pinned. So the mechanism is **proven in this container** and the
   house rule for what a pinned bar's background must be **already exists** —
   the footer follows the pattern rather than inventing one.

3. **It is self-limiting, which is why it needs no viewport guard.** `position:
   sticky` does nothing at all unless the element would otherwise scroll out of
   the scrollport. At 1280x900 the modal does not overflow today (QA measured
   the button at 165x44 (285,735) / (285,760), inside a 900px viewport), so the
   rule is **inert on desktop** and Requirement 4 is met by the rule doing
   nothing. See §Why no media query.

## Interface Design

No API. One component's stylesheet.

**File:** `front/src/components/partials/Portfolio/Modal/ProjectModal.module.css`
**Rule:** the existing `.footer` block — properties **added**, none removed:

| Property | Value | Why |
|---|---|---|
| `position` | `sticky` | the whole mechanism |
| `bottom` | `0` | pin to the scrollport's bottom edge, i.e. the modal's fold |
| `z-index` | `1` | `.highlight::before` is `position: absolute`, so the footer must be in the positioned paint layer to cover the bullets it scrolls over. **Stays far below the header's `1000`** — the title bar must keep winning |
| `background-color` | `var(--site-surface)` | the modal's own ground (`theme.ts` Modal `styles.content`). Same token, same reason, as the header override already in `theme.ts`. Without it the bullets read *through* the footer |
| `padding-bottom` | `var(--mantine-spacing-lg)` | the button must not sit flush against the modal's bottom edge once pinned |
| `margin-bottom` | `calc(var(--mantine-spacing-lg) * -1)` | **cancels that padding in flow.** See §The layout-neutrality trick |

`margin-top: 32px`, `padding-top: 20px`, `border-top`, `display: flex`,
`align-items: center`, `gap: 16px` are all **left exactly as they are**.

`--mantine-spacing-lg` is the token, not a `20px` literal, because it is the
same token `Modal padding="lg"` resolves `--mb-padding` to — the two must move
together if the modal's padding is ever re-chosen. The design-system boundary is
SA's; this is the call.

## The layout-neutrality trick (read this before reviewing the diff)

Mantine's modal body (`.m_5df29311`) has `padding: var(--mb-padding)` = **lg**,
so there are already `lg` of ground below the footer. A naive
`padding-bottom: lg` would therefore add a **second** `lg` gap at the bottom of
every modal on every viewport — a desktop change, which Requirement 4 forbids.

`margin-bottom: calc(var(--mantine-spacing-lg) * -1)` pulls the footer's flow box
back up by the same amount. Net effect:

- **Not pinned** (desktop today, and any modal that fits): the footer's *flow*
  position is unchanged to the pixel, so the modal's scroll height is unchanged.
  The extra padding paints into the body's existing bottom padding, which was
  empty ground anyway. **Nothing on desktop moves.**
- **Pinned** (a phone, or any window short enough to overflow): sticky clamping
  is against the containing block's *padding* box — the body's padding box, which
  extends the full `lg` lower — so the footer can travel all the way to the
  scrollport edge, its background covers to that edge, and the button keeps `lg`
  of ground beneath it.

This is the one non-obvious line in the change. **TASK-018 verifies it by
measurement, not by reading** — the modal's `scrollHeight` at 1280x900 must be
identical before and after.

## Why no media query (an SA decision, deliberately not `47.99em`)

The repo's precedent for a phone-only fix is a `@media (max-width: 47.99em)`
block (`HomeHero.module.css`, `SiteHeader.module.css`; TASK-013's whole diff was
one). **This change does not use one, on purpose.**

The condition being fixed is *"the modal overflows its scrollport"*, not *"the
viewport is narrow"*. A laptop window at 1280x700, or a longer entry than today's
longest, hits the identical failure. A `47.99em` guard would leave those broken
while claiming the REQ is met. Because sticky is inert without overflow
(§Overview reason 3), the unguarded rule is **strictly safer** than the guarded
one: where the guard would have applied, behaviour is identical; where it would
not, the button becomes *more* visible, never less.

Requirement 4 ("desktop must not regress") is therefore met by measurement, not
by scoping — TASK-018 must report which of the two states actually held at
1280x900 (inert, or pinned), and AC-d is checked against the picture either way.

## Flow — what a visitor sees at 360x740

1. Visitor taps a project card on `/portfolio`. `PortfolioContent` sets
   `project`, `ProjectModal` opens (`opened={project !== null}`).
2. Modal content paints at 324x666, top-left (18,37); its bottom edge — the
   "fold" — is **y≈703**. Title bar pinned at the top (already true today).
3. Body renders summary → "What it does" → bullets → "Stack" → chips → footer.
   Total body height exceeds 666, so the content scrolls.
4. **New:** the footer is pinned at the scrollport's bottom. The
   "Open live project" button is **on screen without any scrolling**, i.e. inside
   both the viewport (0–740) and the modal (37–703).
   **MEASURED 2026-09-05 (TASK-018 step 3): `y = 634 → 678`** on the five entries
   that overflow; 632.69 → 676.69 and 601.94 → 645.94 on the two that do not.
   *Corrected 2026-09-05, Sober — this line first **predicted** `y ≈ 639 → 683`
   off a 20px `lg`. `front/src/theme/theme.ts:74` sets `spacing.lg` to **24px**,
   so the prediction was 5px out and is replaced here by the measurement. The
   design was never affected — the padding and the cancelling margin are the same
   token, which is exactly why a token was specified and not a literal. See
   TASK-018 §Questions FQ47.*
5. Visitor scrolls the modal. The bullets and chips pass **behind** the footer;
   the footer's `--site-surface` ground and `z-index: 1` keep it legible.
6. At the very bottom of the scroll the footer un-pins into its normal flow
   position — the border-top lands under the chips exactly as today.
7. `Escape` closes; scroll lock releases. **No JS ran. No handler changed.**

### Edge cases

- **A modal that fits** (desktop today; a short entry): sticky never engages,
  §The layout-neutrality trick keeps the flow identical. **No-op.**
- **The four entries with no `link`** — see §Coverage: the footer renders the
  `NO_PUBLIC_DEMO` note instead of a button, and gets pinned the same way.
  **Accepted deliberately, one rule, no branch** — see SQ19.
- **`prefers-reduced-motion` / animations**: untouched, nothing animates here.
- **The overlay, focus trap, `Escape`, scroll lock**: untouched — this is a
  paint-order and position change inside the body, nothing else. AC-g is
  expected to pass unchanged, and is still measured, not assumed.

## Coverage — which modals actually carry a button (answers AC-c by enumeration)

Read from `front/src/constant/content/projects.ts` on 2026-09-05. Eleven
entries; **seven have a `link`, four do not.** AC-c says silence about an entry
is not coverage, so here is the list, not a sample:

| # | Entry | `link`? | AC-c bar |
|---|-------|---------|----------|
| 01 | Learning Curve | yes | AC-a |
| 02 | Ong Match | yes | AC-b |
| 03 | DTE Platform | yes | must meet AC-a's bar |
| 04 | Develyst Company Website | yes | must meet AC-a's bar |
| 05 | Laichill | yes | must meet AC-a's bar |
| 06 | RAG Chatbot for CRM Sales | **no** | **named exception:** no button exists to raise — the footer holds `NO_PUBLIC_DEMO` |
| 07 | Enterprise Backend Optimisation | **no** | **named exception**, same reason |
| 08 | YodBarber Queue Booking | yes | must meet AC-a's bar |
| 09 | AI Voice Avatar | yes | must meet AC-a's bar |
| 10 | Develyst AI Gateway | **no** | **named exception**, same reason |
| 11 | R1-BEV Voice Command Robot | **no** | **named exception**, same reason |

So **AC-c's real scope is 7 modals**, and the four exceptions are named with a
reason, as AC-c demands. This is Q31's default (*all of them*) applied honestly —
it is not narrowed to the two new entries. **The counts and the four link-less
entries are a fact read from the file; reading that as satisfying AC-c is mine,
not the owner's** — SQ18 puts it to Porter.

## Which REQ-004 defaults this design consumes

| Q | Porter's default | Does SPEC-004 depend on it? |
|---|---|---|
| **Q30** — "no scrolling at all"? | yes | **Yes.** The design meets the strict bar, so if the owner later says he meant the softer one, nothing has to be undone |
| **Q31** — all eleven, or only the two new? | all | **Yes** — applied as the 7-with-a-button table above |
| **Q32** — may the button move up the reading order? | yes | **NO.** Sticky keeps the button last in the DOM and last in the reading order. **Q32's default is not consumed** and the design does not depend on his answer either way — see SQ20 |

None of these is treated as settled. They remain the owner's, on the board.

## Non-functional

- **Accessibility.** DOM order, tab order and screen-reader order are unchanged
  (sticky is a paint/position change, not a re-order). The button stays a real
  `<a>` (`component="a"`), keyboard-reachable in the same place as today. The
  pinned footer must not cover the **last** bullet or chip when the modal is
  scrolled fully to the bottom — it un-pins there; TASK-018 checks that at 360.
- **Contrast / legibility.** `--site-surface` on the footer is the same ground
  the content already paints on, so no new colour and no contrast question.
- **Performance.** No JS. One more compositing layer on an already-composited
  overlay. Not measured; not a risk worth a check.
- **Untouched by contract:** every `href` / `target` / `rel` (Requirement 2,
  AC-e), every approved string (Requirement 3, AC-f), `projects.ts`,
  `Portfolio.config.ts`, `PortfolioGrid`, `PortfolioContent`, `theme.ts`.

## Scope fence — the whole permitted diff

**Exactly one file may change: `ProjectModal.module.css`, the `.footer` rule.**

`ProjectModal.tsx` is **not** in scope: no prop, no `classNames`, no wrapper, no
conditional. If the implementation appears to need a TSX change, the design is
wrong — **stop and ask; do not extend the diff** (§Fallback).

REQ-003's R5 is lifted for REQ-004 only, and this SPEC still spends that licence
on one rule. REQ-001 / REQ-002's visual identity stands.

## Fallback — the one thing that could go wrong, and what to do about it

Sticky is proven in this container (the header pins today), so the expected
outcome is that this works first try. But **the gate is the measurement, not the
argument**: if TASK-018's step 3 shows the button's box still below y=703 at
360x740, then something in the tree defeats sticky and **Fern stops and raises a
Question — Fern must not improvise a second approach.**

Where SA would go next, so Fern knows the direction (**not a licence to build
it**): make the modal body a flex column via `classNames={{ body: ... }}` and
give the footer `order: -1` under `@media (max-width: 47.99em)`. That is a bigger
diff, it touches the TSX, and it **does** consume Q32's default — which is why it
is second, not first.

## Tasks

- **TASK-018**: Pin the project modal's footer to the modal's foot (depends on: —)

QA's acceptance leg (AC-a…AC-g as *pictures*) is a separate round Porter requests
from Tanya. TASK-018's own measurements are the **implementation** gate; they are
the implementer's own load and do not tick a "seen as a picture" AC — the same
rule that kept AC-d open on TASK-017.

## Questions

- **SQ18 (new 2026-09-05) — AC-c's real scope is seven modals, not eleven.**
  `projects.ts` gives four entries no `link`, so their modals render the
  `NO_PUBLIC_DEMO` note and have **no button to raise**. I have written them up
  as AC-c's "named exceptions" (§Coverage). The counts are a fact from the file;
  **reading that as satisfying AC-c is mine, not the owner's.** Non-blocking —
  I am proceeding on it. @Porter: correct me if he meant something else by
  "every other entry".
- **SQ19 (new 2026-09-05) — the fix costs ~85px of the phone's reading area, and
  it changes how the modal LOOKS.** A pinned footer sits over the scrolling body.
  That is what "raise the button" buys, and it lands on a modal whose *look* has
  never been eyeballed by the owner (**SQ7 is still open**). It also pins the
  `NO_PUBLIC_DEMO` note on the four link-less entries — one rule, no branch in
  the component, because a `:has()` or a prop would be a second code path for no
  visitor benefit. **This is an SA design call, taken, not a question that
  blocks.** @Porter: it belongs in whatever he is shown at sign-off.
- **SQ20 (new 2026-09-05) — Q32 is not consumed and the design does not need
  it.** Pinning leaves the button last in the DOM and last in the reading order,
  so the owner's answer to *"may the button move up the reading order?"* changes
  nothing here either way. It stays open as his, but Porter should not hold
  anything for it. FYI, not a question.
- **SQ17 — CLOSED 2026-09-05, Sober.** Its text lives in
  `specs/SPEC-003-portfolio-content-refresh.md` §Questions and is closed there
  against the git state Porter re-read. Recorded here only so the SQ series has
  no gap.

- **SQ21 (new 2026-09-05, from TASK-018 FQ48) — the fix moved 5 of the 7, not 7
  of 7.** Measured at 360x740: **Develyst Company Website** (`scrollHeight` 661 =
  `clientHeight` 661) and **Laichill** (600 = 600) **never overflowed**, so sticky
  is inert on them and their buttons were already on screen before the change.
  **AC-c is not narrowed by this** — all seven meet AC-c's bar ("inside the
  viewport with no scrolling") and QA should still shoot all seven. But if the
  owner is shown *what changed*, the honest number is **five modals**, and he
  should not be left believing seven were broken. Non-blocking, nothing to
  decide — a fact for Porter to carry into sign-off. @Porter.
- **SQ19 — UPDATE 2026-09-05: its cost is now measured, not predicted.** The
  pinned footer's box is **~89px** (612.9 → 701.9 at full scroll), so the "~85px
  of the phone's reading area" estimate in SQ19 was right. SQ19 itself is
  unchanged and still belongs in whatever the owner is shown.

(Fern asks here; Sober answers as `> answer: ...`)
