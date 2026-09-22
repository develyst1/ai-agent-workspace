# Fero — design rules for an implementer

> Companion to `FE.md`. Distilled from the workspace owner's `impeccable` skill
> (2.4 MB) down to **what an engineer implementing a TASK actually needs**.
>
> ⚠️ **Scope:** you are not redesigning anything. Fero implements what the SPEC and
> the design say. These are the rules that keep an implementation from quietly
> degrading — and the bans that stop code review from finding the same five things
> every time. **A visual decision that is not in the TASK is a `## Questions` item**,
> not a choice you make here.

## Contrast — the single most common failure

- Body text **≥ 4.5:1** against its background. Large text (≥18px, or bold ≥14px)
  **≥ 3:1**. **Placeholder text is body text** — it needs 4.5:1 too, not the muted
  default the component ships with.
- The classic miss: **muted gray body text on a tinted near-white.** If it is even
  close, move the text toward the ink end of the ramp. Light gray "for elegance" is
  the top reason a screen is hard to read.
- Gray text on a **colored** background always looks washed out. Use a darker shade
  of that background's own hue, or a transparency of the text color.

## Typography

- Body line length capped at **65–75ch**.
- Never pair two fonts that are similar-but-not-identical (two geometric sans, two
  humanist sans). Contrast axis, or one family in several weights.
- Display headings: `clamp()` max **≤ 6rem**; letter-spacing floor **≥ -0.04em**.
  Tighter and the letters touch — that reads as broken, not designed.
- `text-wrap: balance` on h1–h3; `text-wrap: pretty` on long prose.

## Layout

- **Flexbox for 1D, Grid for 2D.** Do not reach for Grid where `flex-wrap` is
  simpler.
- Responsive grid without breakpoints: `repeat(auto-fit, minmax(280px, 1fr))`.
- **Cards are the lazy answer.** Use one when it is genuinely the right affordance.
  **Nested cards are always wrong.**
- **Semantic z-index scale** — dropdown → sticky → modal-backdrop → modal → toast
  → tooltip. Never `999`, never `9999`.
- Vary spacing for rhythm; uniform gaps everywhere read as a wireframe.

## Interaction — the bug you will hit

- **A dropdown/popover with `position: absolute` inside an `overflow: hidden` or
  `overflow: auto` container WILL be clipped.** Use the native `<dialog>` /
  popover API, `position: fixed`, or a portal to escape the stacking context.
  (QA finds this one repeatedly; it is cheaper to not write it.)
- Every interactive element: real `<button>` / `<a>`, visible focus, reachable by
  keyboard, and **hittable at its own centre at every breakpoint** — QA measures
  exactly that (`QA-PLAYWRIGHT.md` §4).

## Motion

- Motion is part of the build, not decoration added at the end.
- **Ease out with exponential curves** (ease-out-quart / quint / expo). **No bounce,
  no elastic.**
- Do not animate layout properties unless there is no alternative.
- **`@media (prefers-reduced-motion: reduce)` is not optional** — every animation
  needs a crossfade or instant alternative.
- 🔴 **A reveal animation must enhance an already-visible default.** Never gate
  content visibility on a class-triggered transition: transitions pause on hidden
  tabs and in headless renderers, so the reveal never fires and **the section ships
  blank** — and that is exactly how QA's headless harness will see it.
- Staggering items inside one list is fine. One identical entrance applied to every
  section is the reflex to avoid.

## Absolute bans — match and refuse

If you are about to write one of these, restructure the element instead.

- **Side-stripe borders** — `border-left/right` > 1px as a colored accent on cards,
  list items, callouts, alerts. Use full borders, a background tint, a leading
  number/icon, or nothing.
- **Gradient text** (`background-clip: text` + gradient). One solid color; emphasis
  via weight or size.
- **Glassmorphism as a default.** Rare and purposeful, or not at all.
- **The hero-metric template** — big number, small label, supporting stats,
  gradient accent.
- **Identical card grids** — same-size cards, icon + heading + text, repeated.
- **Tiny uppercase tracked eyebrow above every section.**
- **Numbered section markers (01 / 02 / 03) as scaffolding.** Numbers earn their
  place only when the section really is a sequence.
- **Text that overflows its container.** Long heading words + big `clamp()` + narrow
  grid = overflow on tablet/mobile. **The viewport is part of the design:** test the
  real copy at 1600 / 1280 / 768 / 375 — the same widths QA will measure.

## The four states, every time

Any view that loads data ships **loading · empty · error · success**, each designed.
An "empty" that looks like "loading" is a defect, and it is one QA will file.

## Using the project's design system

- Use **the UI library that is already in the repo**, through its theme tokens.
  Never add a second one. Never hard-code a color or spacing value the system names.
- If the design asks for something the system cannot express, that is a
  `## Questions` item for Sober — not a one-off inline style.
