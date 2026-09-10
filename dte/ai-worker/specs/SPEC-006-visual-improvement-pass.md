# SPEC-006: The visual-improvement pass — home page first, courses page second

- Source: **REQ-001 §Questions Q7**, answered by the owner as **`SYSTEM-FACTS.md` A43**
- Status: **ACTIVE** — written 2026-09-09 (Sober)
- Companion: `specs/SPEC-001-frontend-foundation.md` **§Decision 9** (which screen, in what order)

## Overview

The owner answered REQ-001 §Q7 with **(ข)**: antd's defaults are **not** the finish line — he wants
a **deliberate visual-improvement pass**. Verbatim: **"ข ทำ /หน้าแรกเลย และ หน้าคอร์สต่อ ให้ดูก่อน
เน้นระยะห่างกับสีให้ดูโมเดิร์น"** (A43). Three things come from him and only from him:

1. **Order** — the **home page first**, the **courses page second**.
2. **Gate** — **"ให้ดูก่อน"**: he sees those two **before** the other screens copy the result.
3. **Criteria** — **ระยะห่าง (spacing)** and **สี (colour)**, aiming at **โมเดิร์น (modern)**.

Those are the only stated criteria and nobody here adds "his taste" beyond them. What they mean in
code is a design decision, and under SPEC-001 §Decision 8's (ข) branch it is **mine to author now
that Porter has delivered the screen and the criteria** — written below as numbered rules an
engineer implements and a reviewer can check, never as adjectives.

**Division of labour with SPEC-001:** SPEC-001 owns the **substrate** (folder pattern, antd
wrappers, lucide icons, the theme bridge). **This SPEC owns the appearance.** They meet **one screen
at a time**: a screen's TASK does the migration *and* the visual pass in one pass over one file,
because touching a live screen twice is worse than once.

## Phases — and the gate between them

| Phase | Screen | TASK | Gate |
|---|---|---|---|
| **1** | **`/` (home)** | **TASK-005 `DONE` + TASK-020 `DONE`** (both reviewed 2026-09-09) | none. ✅ **Phase 1 is COMPLETE; the A43 owner-preview gate is OPEN.** |
| **2** | **`/courses`** — the course **LIST** page | **TASK-006 — written 2026-09-09, `TODO`** | none. **REQ-001 §Q8 is ANSWERED "ก"** (`SYSTEM-FACTS.md` **A44**): "หน้าคอร์ส" is the list page `/courses`, not a detail page (which does not exist at all — TASK-006 §Findings 1). Phase 2 is **not** gated on the owner's preview of Phase 1: he named this screen himself as the second one. |
| **3** | `register`, `verify-email`, `teach`, `classroom/[id]`, **and `/login`'s look** | TASK-007…010 — **not written** | **the owner's own eyes on Phase 1 + Phase 2.** "ให้ดูก่อน" is an instruction, not a courtesy. |

Phase 3 includes `/login` deliberately: TASK-004 migrated its substrate, and its present appearance
(the legacy recipes now sitting in the `ui/{Button,Input,Checkbox}` defaults) is an **interim state,
not the reference** — SPEC-001 §Decision 9 §2. Nobody copies it and nobody reverts it today.

## The design rules — this is what "ระยะห่าง + สี + โมเดิร์น" means, concretely

Authored by Sober 2026-09-09 against the code as it stands in `dte` on that date. Every rule is
checkable by grep or by a measurement. A case no rule covers is a **question to Sober**, never an
engineer's own call.

**Spacing (ระยะห่าง)** — the page's real problem today is that it has no single rhythm: section
padding is `pt-14 pb-24` / `py-16` / `py-24` / `py-20`, containers are `max-w-5xl` / `7xl` / `4xl` /
`3xl`, header blocks are `mb-12` / `mb-16`, grid gaps are `gap-4` / `gap-6` / `gap-8`. One rhythm is
most of what reads as "จัดระยะห่างดี".

- **R-SPACE-1 — one container.** Every section body: `mx-auto max-w-6xl px-6 lg:px-8`. No other
  `max-w-*` on a section wrapper.
- **R-SPACE-2 — two section rhythms only.** Major section `py-24 lg:py-32`; minor section
  `py-16 lg:py-20`. No third value anywhere on the page.
- **R-SPACE-3 — one section-header block.** `h2` then optional lead paragraph; the `h2` gets
  `mb-4`, the block gets `mb-14`. Nothing else.
- **R-SPACE-4 — one grid gap.** `gap-6` for every card grid on the page.
- **R-SPACE-5 — one hero ladder.** headline → lead `mt-6`; lead → search `mt-10`; search → stats
  `mt-16`. The badge keeps `mb-6`.

**Colour (สี)**

- **R-COLOUR-1 — no new colour.** Every colour resolves to a custom property already declared in
  `front/src/styles/themes.css`. **No hex literal** may appear in a file this SPEC touches.
- **R-COLOUR-2 — no fixed Tailwind palette literals for foreground/accent.** `text-sky-600`,
  `bg-sky-600/10`, `border-sky-600` and friends are replaced by the theme tokens as arbitrary
  utilities — `text-[var(--color-primary)]`, `bg-[var(--color-primary)]/10`,
  `border-[var(--color-primary)]`. **Why this is not cosmetic:** `sky-600` is *one fixed value in
  both themes*; on dark (`--bg-primary: #1C1917`) it is the low-contrast case Fern already measured
  on `/login`. The tokens track the theme; the literals do not. (Exception: R-COLOUR-3.)
- **R-COLOUR-3 — exactly ONE gradient on the page**, the hero headline. The badge pill, the CTA
  section's `opacity-10` overlay and every page-level glow become flat token surfaces. Dropping
  gradients is the single largest "modern" lever available on this page.
- **R-COLOUR-4 — accent budget: primary + neutral.** `--color-primary` (sky) plus the stone
  neutrals carry the page. `--color-secondary` (cyan) appears **only** inside the one hero gradient.
  `--color-accent` / `--color-course` / `--color-instructor` / `--color-ai` do **not** appear.
- **R-COLOUR-5 — both themes are evidence, not inference.** Light **and** dark are checked on every
  section and the result is pasted into the TASK. "It uses tokens so it must be fine" is not
  verification (PROTOCOL.md §Evidence).

**Modern (โมเดิร์น)**

- **R-MODERN-1 — radii:** surfaces `rounded-2xl`; pills and CTAs `rounded-full`; nothing else.
- **R-MODERN-2 — motion is calmed, not removed.** Entrance animations (`animate-fade-in*`,
  `animate-scale-in`, the `delay` props) **stay**. Hover *transforms* on large blocks go —
  `hover:scale-105` on the badge and on the two CTA links. Transitions that stay are `duration-300`.
- **R-MODERN-3 — one elevation.** Page-level surfaces get one soft shadow; `hover:shadow-2xl` at
  page level is dropped.
- **R-MODERN-4 — type scale:** `h1` keeps its responsive triple; every `h2` is
  `text-3xl sm:text-4xl`; body text is `text-base` or `text-lg`, nothing else.

## Rulings — 2026-09-09, after TASK-005 measured Phase 1

The rules above were authored from a code read. TASK-005 measured them in a real browser and three
of them did not survive contact. **All three are defects in my text, not in the implementation**;
they are corrected here so Phase 2 and Phase 3 inherit the corrected rule, and implemented on `/` by
**TASK-020**. Full reasoning and the numbers: `tasks/TASK-005-…md` §Questions.

- **R-SPACE-2a / R-SPACE-4a — scope, so nobody re-asks.** R-SPACE-2 governs `<section>` padding and
  R-SPACE-4 governs **card grids**. **Element padding** (`py-2.5` on a pill, `py-4` on a button) and
  **non-grid flex gaps** (`gap-2` icon→label, `gap-4` between two buttons) are governed by no rule
  and are left at today's values. `gap-6` between two pill buttons reads as a gap, not a rhythm.
- **R-SPACE-3a — scope.** R-SPACE-3 governs a section **header** block: an `h2` (+ optional lead)
  introducing a grid. A centred call-to-action block is not a section header and keeps its own
  spacing.
- **R-COLOUR-3a — `bg-theme-secondary/50` was never a background.** `bg-theme-secondary` is a
  hand-written rule in `themes.css`, not a Tailwind colour utility, so Tailwind emits no `/50`
  variant and the categories band has always computed `rgba(0,0,0,0)` — in both themes, at `HEAD`
  too. **The band separation this SPEC leaned on did not exist.** Corrected to the plain
  `bg-theme-secondary` (the repo's own idiom; every other usage in `front/src` is the plain class),
  with the now-dead `backdrop-blur-sm` removed alongside. After R-COLOUR-3 removed the CTA overlay,
  this band is the only page-level surface distinction left on `/`.
- **🔴 R-COLOUR-6 — one accent token is not enough for two themes; R-COLOUR-1 is amended to admit a
  theme-scoped one.** R-COLOUR-2 replaced `text-sky-600` with `--color-primary`, which fixed dark
  (4.27 → 6.31) and broke light (3.92 → **2.65**), and flattening the badge gradient took its text
  to **2.77** in both themes. Cause: `--color-primary` is a single `:root` value (`#0EA5E9`,
  sky-500) and **no single sky step clears 4.5:1 on both `#FAFAF9` and `#1C1917`**.
  **Rule: an accent that carries text declares a value per theme.** Concretely
  `--color-primary-strong` in `themes.css` — `.light: #0369A1` (sky-700), `.dark: #0EA5E9`
  (sky-500) — both steps on the sky ramp already in that file, so no new colour enters the system.
  Text on an accent **surface** uses `--text-inverse` (already theme-scoped), never hard-coded
  `text-white`, matching what `.btn-primary` does. Results: accent-on-background **5.68 light /
  6.31 dark**; badge text **5.93 light / 6.31 dark**.
  **Adding a token to `themes.css` is admitted** — it adds declarations of a property no other file
  references, so no unseen screen can move; proven by grep in the TASK's DoD. Changing an **existing**
  `themes.css` declaration remains a whole-site cost and stays forbidden to a screen TASK.

**Consequence the four rulings above had for the phase gate (Phase 1, now spent):** Phase 1 was
**not** ready for the owner's eyes until TASK-020 landed — showing him a "ระยะห่าง + สี" pass whose
only surface distinction was invisible and whose two accent spans sat under 3:1 would have had him
judge something we already knew was wrong. TASK-020 is `DONE`; the gate is open and unmet.

## Rulings — 2026-09-09, authored while writing Phase 2 (TASK-006)

Five cases `/courses` has and `/` did not. Authored by Sober from a code read of
`front/src/app/courses/page.tsx` on 2026-09-09 — **each is a hypothesis until measured**, so the
measurement is in TASK-006's DoD, not asserted here. **None of them reopens Phase 1**: `/` is `DONE`
and nothing on it is revisited by these.

- **R-COLOUR-2a — a hand-written `.bg-theme-*` class takes no Tailwind opacity modifier.** The
  generalisation of R-COLOUR-3a: `.bg-theme-primary` / `.bg-theme-secondary` / `.bg-theme-hover` are
  plain rules in `themes.css`, so `bg-theme-primary/95` emits **no CSS** — it is not a faint
  background, it is none. Any such usage is corrected to the plain class, and a `backdrop-blur-*`
  that was only there to soften it goes with it. (Live case: the `/courses` sticky filter bar.)
- **R-COLOUR-3b — a decorative surface keyed to data is one flat token tint, not a palette.** The
  `/courses` card thumbnails branch six ways over `skill.thumbnail` into blue/purple/green/pink/cyan/
  stone gradients — six colour families outside the accent budget, and gradients besides. They
  become one `bg-[var(--color-primary)]/10` with the icon in `--color-primary-strong`. The data
  field itself is never edited by a screen TASK.
- **R-COLOUR-4b — small meta/stat icons are neutral.** A rating star, a students count, a duration:
  `--text-tertiary`, filled where they were filled (`fill-current`). **Amber `--color-accent` is not
  admitted even for a rating star** — `#FBBF24` on `--bg-primary` `#FAFAF9` is ≈1.7:1, under the 3:1
  a non-text glyph needs, and the light theme is where it fails. This is R-COLOUR-6's lesson applied
  before it costs a session.
- **R-MODERN-5 — a looping animation may not sit on a text-bearing element.** `animate-pulse` /
  `animate-bounce` on a badge, a price, a heading: dropped. On an **icon** it stays (the `/` hero
  `Sparkles` is untouched, deliberately).
- **R-MODERN-6 — a text glyph used as an icon becomes a lucide icon.** `→` in a CTA or a card
  footer is an icon drawn with a character; it becomes `ArrowRight` and any motion it carried moves
  onto the SVG. This is a look rule, **not** REQ-001 requirement 3 (which is about emoji) and **not**
  a copy change — an arrow is not a word.

## Ruling — 2026-09-09, after TASK-006 measured Phase 2

- **🔴 R-COLOUR-7 — `.btn-primary` itself must move onto the theme-scoped accent; until it does,
  every primary button in the app fails contrast in the light theme.** R-COLOUR-6 introduced
  `--color-primary-strong` and TASK-020 moved the *badge* onto it, but `.btn-primary`
  (`themes.css:157-162`) was never moved and still resolves `background-color: var(--color-primary)`
  with `color: var(--text-inverse)` — **measured 2.77:1 in light / 6.31:1 in dark** on the `/courses`
  CTA (TASK-006 DoD 2, Fern). `grep -rn "btn-primary" front/src` gives four call sites:
  `HomeContent.tsx:146`, `Courses/CoursesContent.tsx:162` and **`layout/Navbar.tsx:102` + `:184`** —
  the Navbar is in the **root layout**, so this button already ships on every route.
  **Rule: an accent that carries text is `--color-primary-strong`, and that includes the shared
  button classes, not only screen markup.** Blast radius is bounded and one-directional:
  `--color-primary-strong` is `#0EA5E9` in `.dark`, **identical to today's `--color-primary`**, so
  **no dark-theme screen changes**; light darkens `#0EA5E9` → `#0369A1`, already on this file's sky ramp.
  **Same ruling, second defect — `.btn-primary:hover` (`:164-169`)** sets
  `background-color: var(--color-primary-light)` = `#E0F2FE` (sky-50) while `color` stays
  `--text-inverse` = `#FFFFFF` in light: **≈1.15:1 — the label appears to vanish on hover, site-wide**.
  🔴 **UNVERIFIED** — computed by Sober from the token values on 2026-09-09, not observed in a
  browser; no DoD has ever covered a hover state. Both go in **one** TASK against `themes.css`
  alone, with a browser measurement of the resting **and** hover state in both themes as its DoD.
  This is the one admitted exception to "changing an existing `themes.css` declaration is forbidden
  to a screen TASK" (R-COLOUR-6): it is **not** a screen TASK, and it is sequenced **before** the
  owner answers the Phase-1 gate so his answer lands on the fixed button. Reasoning: TASK-006 §Q1.

## The shared-component rule — the constraint that shapes Phase 1

`components/ui/FeatureCard`, `ui/CategoryCard`, `ui/StatCounter`, `ui/AnimatedBackground` and
`components/common/SearchAI` are **also** rendered by `/about` (`page.tsx` *and* the stray
`page-new.tsx`), `/courses`, `/teach`, `/register` and `/verify-email` — verified by grep over
`front/src` on 2026-09-09. **Editing them restyles five screens the owner has not been shown**,
which is exactly what "ให้ดูก่อน" forbids.

**So: Phase 1 edits `app/page.tsx` and its new `components/partials/Home/` only, and does NOT edit
those five components.** The card *interiors* will therefore look as they do today; the page around
them — rhythm, containers, section colour, hero, CTA — is what changes, plus the icons passed into
the cards at the call site.

🔴 **Porter must tell the owner exactly that before he looks**, so he judges what was actually done.
If he wants the card interiors changed too, that is a **five-screen** change; it is priced and
scheduled as its own decision after Phase 1 — not slipped in.

## Data model

None. No `back/` change, no schema, no API, no new dependency.

## Non-functional

- **No new user-facing string, ever.** Every Thai string is copied byte-for-byte from today's file.
  An emoji becoming an icon is not a copy change (REQ-001 requirement 3); rewording is.
- **emoji → icons still stands** — REQ-001 requirement 3, re-affirmed by the owner three times.
- **Both themes and both viewports** are part of every screen's acceptance.
- **Nothing is deployed by an agent.** Evidence is a local `npm run build` + `npm run dev` and what
  the engineer actually saw; the owner's own eyes are the gate that follows.
- **An engineer never authors a look.** A control no rule above covers is a question to Sober.

## Tasks

- **TASK-005**: `/` (home) — SPEC-001 migration **+** this SPEC's visual pass, in one pass —
  owner: **FE (Fern)** — depends on: TASK-003 (`DONE`). ✅ **`DONE` — reviewed 2026-09-09.**
- **TASK-020**: `/` (home) — the three §Rulings above (band background, `--color-primary-strong`,
  badge text) — owner: **FE (Fern)** — depends on: TASK-005 (`DONE`). ✅ **`DONE` — reviewed
  2026-09-09; 7 of 10 DoD re-run by me, all 4 ratios recomputed, plus the production CSS bundle
  checked. 1 UNVERIFIED carried (the band painted).** 🔴 **Phase 1's gate is now OPEN.**
- **TASK-006**: **`/courses`** — SPEC-001 migration **+** this SPEC's visual pass, in one pass —
  owner: **FE (Fern)** — depends on: TASK-005 + TASK-020 (both `DONE`). ✅ **`DONE` — reviewed
  2026-09-09; 5 of 11 DoD re-run by me plus a line-by-line read of the finished component, no
  rework. All five ratios clear both themes (4.40–6.31); the sticky bar had emitted no background
  at all and now paints. 2 UNVERIFIED carried (no continuous scroll by a person; hero ratios are
  the token-pair bound).** Unlike Phase 1 the card interior **was** in scope: local markup, not a
  shared component. 🔴 **Phase 2's gate is now OPEN.**
- **TASK-021**: `.btn-primary` resting **and** hover states onto the theme-scoped accent
  (§R-COLOUR-7) — owner: **FE (Fern)** — `themes.css` only, no screen file — depends on: none.
  ✅ **DONE — built by Fern and reviewed `DONE` by Sober 2026-09-09; all 10 DoD pass and all four
  after-ratios are MEASURED in real Chrome with a real pointer-hover (5.93 / 7.56 / 6.31 / 8.16), 6 of
  them re-run by Sober** — `tasks/TASK-021-btn-primary-theme-scoped-accent.md` §Review. Resting →
  `--color-primary-strong`; hover → a **new** theme-scoped `--color-primary-strong-hover`
  (`.light` `#075985` / `.dark` `#38BDF8`, both already on this file's sky ramp), because one
  `:root` hover colour cannot clear 4.5:1 on both themes — the R-COLOUR-6 lesson again. Both tokens
  also get a `:root` default: `ThemeContext` adds the theme class **in an effect**, so a
  `.light`/`.dark`-only token would paint the button **transparent** until hydration. The four
  after-ratios in the TASK are Sober's arithmetic; **DoD 5–7 measure resting AND hover in a real
  browser**, both themes, plus the no-theme-class window.
  🔴 **§R-COLOUR-7 is now CLOSED.** What did **not** change: the old light hover ≈1.15:1 stays
  **computed, never observed, UNVERIFIED** (TASK-021 §Q1), and the ~200 ms colour-in on every load
  (`transition: all` + theme-class-in-an-effect) is a **pre-existing whole-site** finding, parked
  for after the seven screens, not a TASK (TASK-021 §Q2).
- **TASK-007…010**: `register`, `verify-email`, `teach`, `classroom/[id]` (and `/login`'s look) —
  🚫 not written, gated on **the owner's eyes** on Phase 1 and Phase 2.

## Questions

- **Q1 — ✅ ANSWERED by Porter 2026-09-09.**
  > **answer (Porter, 2026-09-09):** REQ-001 **§Out of Scope is amended** — it now bans rebranding
  > and product-surface work only; **the visual pass is in scope by A43**. No new REQ; this SPEC
  > keeps citing A43. Nothing in the SPEC or in TASK-005/020 changes as a result.

- **Q1 (original text) → Porter (bookkeeping, not design; not blocking TASK-005).** `requirements/REQ-001…md`
  §Out of Scope still reads *"visual redesign / rebranding"* — which **A43 now contradicts**, since
  the owner asked for a deliberate visual pass in answer to a REQ-001 question. Scope is yours, not
  mine: either amend REQ-001's §Out of Scope to admit the pass, or open it as a new REQ that this
  SPEC re-points at. I cite **A43** as this SPEC's authority meanwhile and I am not widening
  REQ-001 silently — but the REQ should not stay self-contradictory on the record.
- **Q2 → Porter (needed before the owner looks at Phase 1).** Tell him what he is being shown:
  page-level **spacing and colour on `/` only**, with the **card interiors unchanged on purpose**
  because five other screens share them (§"The shared-component rule"). Otherwise he will judge the
  pass by the part of it we deliberately did not do.
