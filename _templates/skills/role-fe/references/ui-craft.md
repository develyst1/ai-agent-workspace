# UI craft — the checklist behind "not AI-generated"

You implement the design you're given. These rules keep an implementation from quietly getting
worse, and stop review from finding the same five things every time. **A visual decision the TASK
doesn't make is a `## Questions` item.** Don't make the choice yourself. The host's design system
and the desk's design record (accepted and rejected looks) override everything here.

## The design system comes first

- Use **the UI library and tokens already in the repo**, and nothing else. Don't add a second UI
  system or mix two colour systems. Don't hard-code a value the system already names.
- If the design needs something the system can't express, that's a question, not a one-off
  inline style.
- Desk design records are history. Read the rejected looks before building anything visual.

## Hierarchy, spacing, layout

- One clear primary action per view. Secondary actions look secondary, and a primary action reads
  as a button, not a tag.
- Use a 4pt (web) or the system's spacing scale with semantic names. **Vary the density.** Uniform
  gaps everywhere read as a wireframe.
- Use one containment layer. No card-in-card, no table in a card inside a panel. Cards are the
  lazy answer, so use one only when it really is the right affordance.
- Flex for one dimension, grid for two. Use a semantic z-index scale (dropdown → sticky → backdrop
  → modal → toast → tooltip), never 999.
- Popovers and dropdowns inside an `overflow` container get clipped. Use a portal, a fixed position,
  or the native popover/dialog.
- Collapse 2–3 inline row actions into an overflow menu that works on tap and on keyboard.

## Typography

- Body line length 65–75ch. Use `tabular-nums` (or the platform's tabular figures) on every number,
  date, time, count and price column.
- Pair a display face with a body face, or use one family in clearly contrasting weights. Never two
  near-identical faces.
- Roman headings, not italic. Carry emphasis with weight, size or accent.
- Display letter-spacing no tighter than -0.04em. Balance h1–h3, and use pretty-wrap on prose.
- Test long real copy (including Thai, which has no spaces and different line height) at every
  breakpoint. Text overflowing its box is a defect.

## Colour

- **One accent, on about 3% of the viewport or less:** links, active nav, focus ring, primary CTA.
  Never as a large fill.
- Tinted neutrals carry low chroma of one anchor hue. No pure `#000`/`#fff`.
- **Restraint means low chroma.** Muted palettes (chroma around 0.06 or less for UI surfaces) read
  calm. Hue-coding many categories at high chroma reads neon, especially in dark mode.
- Dark mode shifts lightness and chroma only, never hue. Show elevation with lighter surfaces, not
  shadows.
- Contrast: 4.5:1 for body text (placeholder text counts as body text), 3:1 for large text and UI
  boundaries. Gray text on a coloured background looks washed out, so use a darker shade of that
  background's hue instead.
- Status never by colour alone: add an icon, a shape or a label.

## Interaction — 8 states, every control

default · hover · **focus-visible (instant, never transitioned)** · active · disabled · loading ·
error · success. Nothing is reachable by hover only, so give every hover affordance a focus and a
touch path. Each target must be hittable at its own centre at every breakpoint: 44px or more on
web, 48dp on Flutter.

## Data views — 4 states

Loading (a skeleton shaped like the content) · empty (says what's missing and what to do, using copy
from the SPEC) · error (recoverable, with retry where it makes sense) · success. Tables never
truncate data: use no-wrap plus horizontal scroll, pin the anchor columns (select and actions), and
watch for library components that ellipsise their own labels. Use one date/time format helper
everywhere.

## Motion

- Cut motion before you add it. Allow one orchestrated entrance. Everything else just *is there*.
- Use exponential ease-out (quart, quint, expo). No bounce or elastic on UI. Don't animate layout
  properties. Never use `transition-all`.
- Honour `prefers-reduced-motion` (Flutter: `MediaQuery.disableAnimations`) with an instant or
  crossfade alternative.
- **A reveal must enhance content that is already visible.** Never gate visibility on a transition
  firing.

## Absolute bans — if you're about to write one, restructure instead

Gradient text · coloured side-stripe borders on cards, alerts or list items · glassmorphism by
default · hero-metric template (big number, small label, gradient) · identical icon + heading + text
card grids · tracked uppercase eyebrow above every section · 01/02/03 section markers that aren't a
real sequence · blanket `hover:scale` · celebratory success toasts · confirmation modals for
reversible actions · invented numbers that fill a slot.

## Accessibility floor

Use semantic elements (web) or `Semantics` and labelled widgets (Flutter). Every input has a label.
Make focus order logical and keep focus visible. Images get alt text or are marked decorative. Make
sure screen-reader output makes sense. Check with the vision-deficiency emulator and the keyboard,
not only a contrast calculator.

## Performance and state hygiene

- No unbounded list render: virtualise or paginate (Flutter: `ListView.builder`). No fetch inside a
  render or build loop. Images go through the framework's image pipeline with explicit sizes.
- State lives at the lowest level that needs it. Derive, don't duplicate. No stale copies of server
  data in local state. Cancel or ignore responses that come back after the view is gone.
- Web: watch for unnecessary client components and hydration mismatches. Flutter: use `const`
  constructors, avoid rebuilding big subtrees, dispose controllers.

## Audit is a floor, not approval

`/impeccable audit` must pass before `REVIEW`. Then look at the screen as the operator will: is it
calm, is it scannable in a few seconds, is there less text than you think there should be? If you
wouldn't defend it to a principal designer, it isn't done.
