# TASK-014: DEF-3 — a visible scroll signal on the `/services` table

- Source: **DEF-3** (`tests/TEST-004-req002-site-wide-acceptance.md` §Defects,
  Tanya 2026-09-05) via **SPEC-002** §Flow item 2. Ships inside REQ-002 on the
  owner's `Q24 = ใส่สัญญาณเลื่อน` (2026-09-05).
- Status: **DONE** (Sober 2026-09-05 — reviewed; built by Fern 2026-09-05)
- Owner: Fern (FE)
- Depends on: none. Touches
  `front/src/components/partials/Services/ServicesTable.module.css`
  (and, only on the fallback below, `ServicesTable.tsx`). Disjoint from
  TASK-013 and TASK-015; any order is fine.
- Repo: `portfolio-nichaphon-web`, `front/src/components/partials/Services/`
- Gates: **no AC.** DEF-3 is committed work, not an acceptance criterion.
  Porter will not read DELIVERED as "nothing outstanding on a phone" while it
  stands, so it is real work with no tick attached.
  **QA already wrote the check for it:** REGRESSION **S14** (`No section's content
  is stranded at 360px`), added by TEST-004 and standing **FAIL 2026-09-05**.
  **S14's re-run by Tanya is the authority on this fix, not your screenshot** —
  your screenshots are evidence for my review.

## The defect, as QA measured it

`/services` at **360x740**. `.ServicesTable_scroller` is 303px wide, the table
inside it is **887px**. Only the "Service" column is on screen; the six service
names sit beside ~530px of empty rows whose height is set by the two hidden
columns. There is **no scrollbar, no edge fade, no hint** — the section reads as
broken rather than as scrollable. The page itself does not overflow
(`scrollWidth === clientWidth === 345`), so **S8 correctly passes** and no
existing check would have caught this. Console clean. Evidence:
`../project-docs/qa-test004-2026-09-05/b6-services-table-360.png`,
`mobile-services-full.png`.

Provenance is **UNKNOWN and stays unknown** — nobody tested a pre-step-up tree.
Do not chase it.

## What the owner bought, and what he did not

`ใส่สัญญาณเลื่อน` = **add a scroll signal, now.** It is not "rethink the phone
layout later" and not "accept as-is". It does **not** redesign the table:
SPEC-002 §Flow item 2 keeps `/services` a `<table>` on purpose, because cards
would delete the three `<th scope="col">` strings (`Service`, `What it covers`,
`Stack` — visible text, so R4) and destroy the `role="region"` structure
§Non-functional says a restyle may not break.

## The design decision — mine, made here so you do not have to ask

**Two CSS-only signals on `.scroller`. No new copy, no JS, no change to the
`<table>` element or its contents.**

**(1) A permanently visible horizontal scrollbar — required.**
`scrollbar-width: thin` + `scrollbar-color` for Firefox, and
`::-webkit-scrollbar` / `-thumb` / `-track` rules for Chromium and Safari.
Styling `::-webkit-scrollbar` with an explicit `height` opts the element out of
Chromium's *overlay* scrollbars, so the bar is present **before** any
interaction — which is the whole point. Track `var(--site-surface)`, thumb
`var(--mantine-color-anchor)`, radius from `var(--mantine-radius-*)`.

**(2) A right-edge shadow that shows only while content is hidden to the right —
required.** Preferred mechanism, in this order:

- **(2a) The layered `background-attachment: local` / `scroll` gradient trick**,
  entirely inside `.scroller`, no DOM change and no JS: two "cover" layers
  pinned `local` (they travel with the content and mask the shadow when you
  reach the edge) over two `scroll` shadow layers pinned to the box. It
  self-hides at both ends, which no static fade does.
  **Known risk, stated up front so you do not discover it as a surprise:**
  `.scroller`'s ground is `background: var(--site-glass-bg)` =
  `rgba(120,96,200,0.10)` — **translucent**, and the cover layers have to match
  the ground to hide the shadow. If translucency makes the trick read wrong,
  do not fight it —
- **(2b) Fallback, sanctioned in advance:** wrap the existing scroller in one
  `position: relative` `<div>` and put the fade on that wrapper's `::after`.
  The wrapper **may not** touch the `<table>`, the three `<th scope="col">`,
  `role="region"`, `aria-label` or `tabIndex={0}` — those stay exactly where
  they are, on the same element. If you take 2b, say in §Implementation Notes
  what 2a did wrong; a static fade that never hides at the right edge is
  acceptable here, a broken-looking one is not.

**Rejected, with reasons, so nobody re-proposes them:**

- *Hint text* ("swipe to see more") — a new visible string on a route whose R4 /
  H5 baseline question is still open. Not worth it when a scrollbar says the
  same thing.
- *Cards instead of a table* — forbidden, SPEC-002 §Flow item 2.
- *JS arrows / an intersection observer* — would make `/services` mount a client
  component. **SQ11** is already open on client code reaching routes through the
  `ui` barrel; adding some deliberately would be perverse.
- *New ARIA* — **not needed.** The scroller already has `tabIndex={0}`,
  `role="region"` and `aria-label`, so keyboard and AT users can already reach
  and scroll it. This defect is a **visual** gap only. Do not add ARIA to fix a
  visual problem.

## What to do

1. Add the two signals above to `ServicesTable.module.css` using **existing
   tokens only** (`--site-surface`, `--site-glass-border`, `--site-hairline`,
   `--site-accent-wash`, `--mantine-color-anchor`, `--mantine-radius-*`).
2. **No new one-off colour, and no new named token.** A new token is a SPEC
   decision of mine, not a task decision. If existing tokens cannot carry it,
   **stop and ask in §Questions** — do not invent a hex.
3. Do not change the breakpoint behaviour of the table, `min-width: 780px`,
   the column `min-width`/`max-width` rules, or the sticky `thead`.

## Definition of Done

- [ ] Files modified: `ServicesTable.module.css`, plus `ServicesTable.tsx`
      **only if** you took fallback 2b. `git status --porcelain` proves it.
- [ ] `git diff` of `ServicesTable.tsx` (if touched) shows the `<table>`, the
      three `<th scope="col">` strings, `role="region"`, `aria-label` and
      `tabIndex={0}` **unchanged**.
- [ ] Rendered on `npm run dev` at **360x740**, before touching anything else:
      a screenshot of the table area showing the scrollbar **at rest, with no
      prior interaction**, and the right-edge shadow.
- [ ] Rendered at 360 **after scrolling the region fully right**: state whether
      the shadow hides (2a) or stays (2b). Either is a pass; an unreported one
      is not.
- [ ] Rendered at **1280**, where the table does not overflow: state whether any
      new bar or shadow is visible. A permanent artefact on a non-overflowing
      table at desktop is a **fail** — the owner ticked AC2 on that view.
- [ ] Measured contrast **thumb vs track >= 3:1** (WCAG 1.4.11, non-text UI).
      Report the two computed colours and the ratio. Under 3:1 is a
      stop-and-ask, not a shipped guess.
- [ ] The region is still reachable by keyboard (Tab to it, arrow keys scroll)
      and still announces its `aria-label`. Say how you checked.
- [ ] `npx tsc --noEmit` clean. Console clean on `/services` at both widths.
- [ ] §Implementation Notes records which mechanism you took and why.

## Implementation Notes

**Mechanism: 2a. `ServicesTable.tsx` was not touched** — no wrapper, no DOM change,
no JS. Scope: `git status --porcelain` shows exactly two paths, and the other one
is TASK-013's `HomeHero.module.css`, already at REVIEW:

```
 M front/src/components/partials/Home/HomeHero.module.css      <- TASK-013, not this
 M front/src/components/partials/Services/ServicesTable.module.css   66 insertions, 1 deletion
```

`git diff -- .../ServicesTable.tsx` is **empty**, so the `<table>`, the three
`<th scope="col">` strings, `role="region"`, `aria-label` and `tabIndex={0}` are
byte-unchanged. The single deleted line is `background: var(--site-glass-bg);`,
replaced by `background-color: var(--site-glass-bg);` plus the layer stack.

### Signal 1 — the scrollbar

`::-webkit-scrollbar { height: 8px }` + `-track` (`--site-surface`) + `-thumb`
(`--mantine-color-anchor`), both `--mantine-radius-sm`.

**Two mechanisms cannot both be live, and the SPEC asked for both.** In Chromium
a non-`auto` `scrollbar-color` / `scrollbar-width` switches the
`::-webkit-scrollbar` rules **off** — which would put the overlay bar straight
back. So the Firefox pair is fenced: `@supports not selector(::-webkit-scrollbar)`.
Measured in the browser: `CSS.supports('selector(::-webkit-scrollbar)')` is
`true`, and computed `scrollbar-width` / `scrollbar-color` on `.scroller` both
read `auto` — i.e. the fence held and the webkit rules are the live ones here.
**The Firefox leg is written but UNVERIFIED — I have no Firefox in this harness.**

**A/B that the bar is genuinely new**, same page, same instant: a throwaway
`overflow-x:auto` probe div with no class reserved `offsetHeight - clientHeight`
= **0px** (Chromium overlay scrollbar — exactly the "no scrollbar" QA saw),
while `.scroller` reserved **8px**. Present before any interaction, `scrollLeft`
still 0.

### Signal 2 — the self-hiding edge shadow

Six background layers on `.scroller`, order top→bottom: left cover, right cover,
then the left/right shadow **twice each**. Covers `local` (they travel with the
content), shadows `scroll` (pinned to the box). Covers 40px, shadows 18px.

- **Covers are `--site-surface`.** That is not a coincidence I relied on blind —
  `--site-glass-bg` `rgba(120,96,200,.10)` over the page ground `#0b0916`
  composites to rgb(22,18,40), and `--site-surface` is rgb(21,17,34). An opaque
  cover is invisible against the panel it sits in.
- **The shadow is laid down twice, and that is the one judgement call I made.**
  A single pass of `--site-hairline` (my first build) and a single pass of
  `--site-glass-border` are both invisible at 360 — I only found the first one by
  magnifying the edge 6x. Two passes of `--site-glass-border` (0.18 → effective
  0.328) lands at rgb(79,70,110) against rgb(22,18,40) and reads plainly in an
  unmagnified screenshot. **No new hex and no new named token** — it is the
  panel's own border colour reading inward — but "the same token twice" is a
  strength decision, so it is flagged as **FQ40** below rather than assumed.
- Fading to `transparent` does **not** grey out: CSS gradients interpolate in
  premultiplied alpha, so only the alpha ramps. Verified visually — no vignette.

### What was rendered, at what width

`next dev` on **3031**. Port 3000's orphan (PID 8508) routed around, never
touched; server stopped afterwards, `front/.next` left with no `BUILD_ID`, as
found. Chrome extension was not connected this session, so this is the Browser
pane; the tab was fronted and screenshotted first so `document.hidden` went
false before any scrolling.

- **QA's exact geometry reproduced.** At viewport **345** (the width headed
  Chrome actually lays out at inside an emulated 360 — my TASK-013 finding) the
  scroller measures `clientWidth` **303** and `scrollWidth` **887**: the same two
  numbers TEST-004 reports. Also rendered at 360 (`clientWidth` 318).
- **At rest, no prior interaction (360 and 345):** right edge carries the glow
  full height, left edge is clean, `scrollLeft` 0. Screenshots taken.
- **Scrolled fully right** (`scrollLeft` 569 = max): the right shadow is **gone**
  and the left one has appeared. It self-hides — 2a behaves as SPEC-002 said.
- **Non-overflowing width:** at emulated 1280 the scroller measures `clientWidth`
  1054 == `scrollWidth`, `overflow` false, bar reserved **0px**. Rendered and
  eyeballed at **995 doc width** (`clientWidth` 929 == `scrollWidth`, bar 0):
  three columns, **no bar and no shadow at either edge**. Clean.
  *Why 995 and not 1280:* the Browser pane downscales an emulated 1280 and its
  screenshots of a scrolled page came back blank/misaligned — a harness artefact,
  not the page. 1280 is measured, not seen; 995 is both. Flagged as a limit.
- **Contrast, thumb vs track:** `--mantine-color-anchor` **#a488ff**
  (L 0.32721) on `--site-surface` **#151122** (L 0.00676) → **6.646:1**.
  Computed from the live custom properties in the page, WCAG formula. Passes
  1.4.11 (>= 3:1) with room.
- **Console clean** on `/services` — React DevTools info and one dev-only Fast
  Refresh notice, nothing else, no errors.
- `npx tsc --noEmit` → **exit 0**.

### Keyboard — partly UNVERIFIED, and I will not round it up

Verified in the page: the scroller is in the focusable sequence (position 3,
right after the header buttons), `document.activeElement` becomes it on focus,
`role="region"` / `aria-label="Services table"` / `tabindex="0"` all still read
back off the live element, and focus paints a 2px `rgb(164,136,255)` outline.
Programmatic `scrollLeft` drives the region to its max (569) and back.

**What I could not check: arrow keys.** Ten `ArrowRight` and one `End` sent
through the pane changed neither `scrollLeft` nor `window.scrollY` — the harness
was not delivering key events to the page (`End` should have moved the window and
did not). That is a harness failure, not a finding about the page. The `.tsx`
diff is empty, so nothing I did can have changed key handling — but I did not see
it, so it stands **UNVERIFIED**, for QA's S14 run.

### Not done, deliberately

No hint text, no cards, no JS, no new ARIA, no new token, no new hex. The
breakpoint behaviour, `min-width: 780px`, the column `min-width`/`max-width`
rules and the sticky `thead` are untouched. **S14 is not ticked by me** — these
are my own measurements, not a pass.

## Questions

(Fern asks; Sober answers as `> answer: ...`)

**FQ40 (non-blocking, but it is a real decision — please rule).** The edge shadow
is `--site-glass-border` painted as **two** background layers rather than one, to
get from alpha 0.18 to an effective 0.328. One layer is invisible on this ground
(so is one layer of `--site-hairline`); I measured both before doubling. No new
colour value and no new named token is introduced — the token is used twice — but
if you read "existing tokens only" as "each token once, at its own alpha", then
this ground cannot carry a visible fade with the sanctioned list and the shadow
half of DEF-3 needs a token decision from you. I chose to ship the doubled layer
and flag it rather than stall the task; say the word and I will take it back to a
single pass, or to whatever you name.

> **answer (Sober, 2026-09-05): ship as built. Two layers of `--site-glass-border`
> is not a new token and does not need one.** My rule, written down so nobody
> re-opens it: *"existing tokens only" bars a new **value** — a hex, an rgba, or a
> new `--site-*` name. Compositing a sanctioned token with itself introduces no new
> value into the system, and the result still moves with the token if the token ever
> changes.* That last property is what decides it: a hand-written `rgb(79,70,110)`
> would be a second source of truth; your two layers are not. I considered the two
> alternatives and rejected both — a new named token (`--site-edge-shadow` or
> similar) buys one consumer a permanent piece of design-system API surface, and
> `--site-node-edge` (`rgba(196,178,255,0.38)`) is the right alpha and already
> exists but means *machine-graphic node edge* in the step-up layer; borrowing it for
> a panel edge shadow is semantic drift, which is worse than the doubled layer. You
> were right to flag it rather than assume it. The rule goes into SPEC-002 §Retired
> patterns. **Keep the comment you wrote above the block** — it is the only thing
> that makes the doubling legible to the next reader.

**FQ41 (observation, no action taken).** At 360/345 the scroller is **1156px
tall**, so its horizontal scrollbar sits ~1150px below the top of the table —
roughly a viewport and a half down. A visitor reading the first rows sees the
**edge glow only**; the bar is a second, later confirmation. Both signals ship as
you specified, and I changed nothing about the height (the empty rows are set by
the two off-screen columns, which is DEF-3's own cause and out of this task's
scope). Raising it because "add a scroll signal" reads differently if you assumed
the bar was the primary one at the top of the table.

> **answer (Sober, 2026-09-05): recorded; no change to your task, and I am not
> extending it.** You are right that "add a scroll signal" reads differently once the
> bar sits ~1150px below the top of the table: at 360 the **glow is the primary
> signal** and the bar is a later confirmation. That is still what the owner bought
> (`ใส่สัญญาณเลื่อน` = a signal, now), and both signals ship as specified, so
> TASK-014 stands as scoped. But the thing underneath your observation — a 1156px-tall
> section showing one column beside ~530px of empty rows whose height is set by two
> off-screen columns — is a **phone-layout problem that the scroll signal makes
> navigable rather than solves**. That is not yours to fix and not mine to invent: a
> different `/services` layout at phone widths is scope, and scope is the owner's. It
> goes to Porter as **SQ13** (SPEC-002 §Questions), non-blocking. **No action from
> you.**

## Review

**Verdict: DONE — Sober, 2026-09-05.** Re-verified by me in the working tree. Two
items are **routed onward** below; neither is rework and neither holds this task.

- **Scope proven.** `git status --porcelain` shows five paths; this task's is
  `ServicesTable.module.css` alone (`--stat` **67** = 66 insertions + 1 deletion, as
  you reported). `git diff -- ServicesTable.tsx` is **empty**, and I read the file
  itself: `<table>`, the three `<th scope="col">` strings, `role="region"`,
  `aria-label="Services table"` and `tabIndex={0}` are all still there, byte-unchanged.
  Mechanism **2a**, no wrapper, no DOM, no JS — the strongest of the sanctioned options.
- **The one deletion is correct and necessary.** `background:` → `background-color:`
  had to happen: the shorthand would reset `background-image` on every later
  declaration. Good catch to call it out rather than let it read as churn.
- **The layer stack is right.** I checked it against the diff, not the prose: two
  40px covers `local` over four 18px shadow layers `scroll`, `no-repeat`, positions
  paired left/right. Covers are `--site-surface`; your composite arithmetic
  (glass-bg 0.10 over the page ground → rgb(22,18,40) vs `--site-surface` rgb(21,17,34))
  holds, and because each cover is itself a gradient the residual delta is a soft
  ramp, not an edge. Nothing behind the scroller contradicts it —
  `MachineGround`'s lattice is `rgba(164,136,255,0.045)`, well under the difference
  you already tolerated.
- **The `@supports` fence is the right answer to a real conflict** — I asked for both
  mechanisms and you found that in Chromium they cannot both be live. Fencing the
  Firefox pair and **measuring** that the fence held (`scrollbar-width` computes
  `auto`, `::-webkit-scrollbar` rules are the live ones) is what I wanted. **The
  Firefox leg is accepted as declared, not as tested** — it stays UNVERIFIED in
  writing, here and on the board.
- **The bar is provably new**, not assumed: the unclassed `overflow-x:auto` probe
  reserving 0px on the same page while `.scroller` reserves 8px is exactly the A/B
  that turns "Chromium overlay" from a story into a measurement.
- **Contrast**: `--mantine-color-anchor` (#a488ff, iris[3]) on `--site-surface`
  (#151122) → 6.646:1, recomputed by me from the live dark tokens. Passes WCAG
  1.4.11 (>= 3:1) with room.
- **QA's geometry reproduced exactly** (clientWidth 303 / scrollWidth 887 at the 345
  layout width), and the self-hide at both ends was **seen**, not argued.
- **`npx tsc --noEmit` re-run by me: exit 0.**

### Two carries — routing, not rework

**(a) Desktop is now painted too, and 1280 was measured but never seen.** At >= 48em
the two opaque 40px cover layers are still painted at both edges of a
non-overflowing scroller. Your composite reasoning says they are invisible and your
995-doc-width render says the same by eye — but `/services` at 1280 is a view the
owner has already ticked (AC1/AC2), and the harness gave you measurement there
without a picture. You flagged that limit plainly instead of papering over it, which
is why this is a carry and not a REWORK. **I am asking Porter to add a QA eye on
`/services` at 1280** alongside S14 at 360. Nothing for you to do unless QA sees a
band.

**(b) Arrow-key scrolling stays UNVERIFIED.** The harness delivered no key events at
all (`End` moved the window by 0), so this is a harness failure, not a finding about
the page — and the empty `.tsx` diff means nothing you did can have changed key
handling. Correctly not rounded up. It belongs to **S14's** run.

**DEF-3's provenance stays UNKNOWN** and nobody chased it. **S14 is not ticked here
and I do not tick it** — Tanya's re-run is the authority, exactly as the task said.

**FQ40 ruled above (ship as built, rule recorded in SPEC-002). FQ41 recorded above
and routed to Porter as SQ13.** Nothing carried back to you.
