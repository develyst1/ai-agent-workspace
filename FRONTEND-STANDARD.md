# Frontend Standard — the bar every FE deliverable must clear

> Team-wide standard for all frontend work in this workspace (Fern builds to it; SA reviews against it; PM
> won't call a UI feature done until it passes). Born 2026-08-11 from a **professional frontend engineer**
> (`neeeeroooo`) grading our `frontoffice-front` UI "AI-generated." **He is the bar: learn from him, then
> surpass him.** This file is how we get there systematically instead of by luck.

## 0. The one-line goal
A screen we ship must not read as *"AI-generated."* If a competent FE engineer would call it slop, it isn't done.

## 1. The design foundation — `hallmark`
The reference design skill is installed at `smart-scheduler/smart-scheduler-front/.agents/skills/hallmark/`
(`npx skills add nutlope/hallmark`). It has an **`audit` verb** that scores a screen →
`ships as slop | reads as AI-generated | close, fix the minors`. **Run it on your own work before you ask for
review.** Install it in whatever FE repo you're in and treat its `references/anti-patterns.md` as the checklist.

### Non-negotiable design rules (from hallmark)
- **One locked token system.** Every color and font goes through a named token (`var(--color-accent)`), never an
  inline hex/OKLCH/`font-family`. One source of truth — **do not mix two color systems** (our biggest sin: Mantine
  theme + Tailwind `bg-default-*` at once → color sprawl).
- **OKLCH, no pure extremes.** No `#000`/`#fff`. Paper + ink + all neutrals carry a low-chroma tint of ONE anchor
  hue. Warm accent → warm greys, cool accent → cool greys.
- **One accent, ≤3% of the viewport.** Max two colors carry meaning; accent = links/active-nav/focus-ring/primary
  CTA only, never a >5% background fill.
- **Type pairing, roman headers.** A display face + a body face — "a one-font page is a template page." **No italic
  headings** (a top AI tell); carry emphasis with weight/accent/underline.
- **4pt spacing scale, semantic names; vary density.** Not every section padded identically.
- **Restraint.** Cut motion before adding it. No `transition-all`, no blanket `hover:scale-105`, no animate-on-scroll
  on everything, no bounce/elastic easings on UI. One orchestrated entrance; the rest just *is there*.
- **Full 8-state discipline** on every interactive element: default · hover · **`:focus-visible` (INSTANT — never
  transition the ring)** · active · disabled · loading · error · success.
- **Honest copy.** Never invent a number/metric to fill a slot; real value or a labelled `—`.
- **Dark mode = shift L and C only, never hue.** Elevation via lighter surfaces, not shadow.

## 2. Our-stack engineering rules (the concrete gotchas we got wrong)
Stack = Next.js + React + TS + **Mantine** + Tailwind. These are the exact mistakes the engineer fixed — bake them
in as convention:

- **Data tables never truncate data.** Use `whitespace-nowrap` + horizontal scroll, not `layout=fixed`/cell clipping.
- **Pin the anchor columns.** `position:sticky` does NOT work inside Mantine `Table.ScrollContainer` (transformed
  viewport). Use the shared **`StickyScrollArea`** (native scroll, `data-pin="lead"` left / `data-pin="action"` right,
  scroll-aware edge shadow) so the select/checkbox and the action column stay on-screen at 375px.
- **Kill framework-default truncation.** Mantine `Badge` ellipsises its own label ("PENDING"→"PEN…"). Apply the
  `NO_TRUNCATE` styles so chips size to their text.
- **`tabular-nums` on every numeric / date / time / count / price column.** Misaligned digits are an instant tell.
- **No card-in-card.** Don't wrap a table in `<Card>` inside a panel — pick one containment layer (table on paper).
- **Buttons must read as buttons.** A primary row action is `variant="filled"`, not `light`/`compact-xs` (that reads
  as a tag). Reserve subtle/light for genuinely secondary actions.
- **Collapse row actions into a `⋯` overflow menu** (Mantine `Menu` + `MoreHorizontal`) — never 2–3 inline mini
  buttons per row. The menu must work on tap + keyboard focus (no hover-only).
- **No hover-only affordances.** Anything revealed on hover also needs focus + touch.
- **Size for content, not cramped defaults.** Widen selects so labels don't clip; size modals to their table
  (`size="1100px"` beat a cramped `xl`); icons 14–16px, not 12/13.
- **Consistent, unambiguous formats.** Dates `DD/MMM/YY`; times `HH:mm`. One helper, everywhere.
- **Status never by color alone.** Red/green needs an icon or shape too (a11y + hallmark).

## 3. Definition of Done — the UI gate (a FE TASK is not `REVIEW`-ready until all pass)
1. **`hallmark audit` run on the screen** → verdict better than *"reads as AI-generated"*; minors listed + addressed.
2. **Responsive** verified at **375 / 768 / 960** — nothing clips, no page h-scroll, anchor columns pinned, hit
   targets ≥44px on phone.
3. **8 states** present on every control; **focus-visible ring is instant**.
4. **Contrast** meets 4.5:1 body / 3:1 UI boundaries (use the vision-deficiency emulator).
5. **One token source** — grep the diff for inline hex / `font-family` / arbitrary `z-index` / `transition-all`:
   zero hits.
6. **No anti-pattern** from `anti-patterns.md` that applies to tables/forms/modals/badges (card-in-card, side-stripe
   badge, over-confirm modal, celebratory success toast, wrap-to-two-lines clickable, 3-equal-column grid).

## 4. Process change (so this doesn't decay)
- **Fern self-audits with hallmark BEFORE marking a FE TASK `REVIEW`** and pastes the audit verdict in the TASK.
- **Add a UI-review pass** (SA or a design-lens check) to the FE review round — code-correct is not enough; it must
  clear §3.
- **Root cause we're fixing:** no design standard + Mantine gotchas unknown + no UI-review round. Note the engineer's
  fix commit was itself AI-authored — the delta was *the standard + the review*, not human-vs-AI. So the leverage is
  exactly here.

---
_Reference: `smart-scheduler/smart-scheduler-front/.agents/skills/hallmark/` · origin commits `neeeeroooo` on
`smart-scheduler-front@dong` (2026-08-11): `63f734d` responsive/pinned tables, `7f9456e` hallmark install._
