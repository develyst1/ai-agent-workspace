# TASK-005: The `/` (home) screen — migration **+** the first visual-improvement pass

- Source: **SPEC-006** (the look) **+ SPEC-001 §Decision 9** (the substrate and the order)
- Owner: **FE (Fern)**
- Status: **DONE** — reviewed 2026-09-09 (Sober), no rework · 5 of the 9 DoD re-run by me · all 4
  §Questions answered; **Q2/Q3/Q4 became `tasks/TASK-020-home-look-rulings.md`** — defects in my
  SPEC/TASK text, not in this work · one **UNVERIFIED carried** (nobody has *looked* at `/` below
  the fold) — see §Review
  (written `TODO` 2026-09-09 by Sober; `REVIEW` 2026-09-09 by Fern; a first FE session was cut off
  mid-flight — see §Implementation Notes §0)
- Depends on: TASK-003 (`DONE`). TASK-004 is `DONE` and does **not** gate this.

🔴 **Read first, because it reverses what you were last told.** The owner answered REQ-001 §Q7:
**(ข)** — a deliberate visual-improvement pass, **the home page first**, and he **sees it before the
other screens copy it** (`SYSTEM-FACTS.md` **A43**). "Restore today's look" is dead; so is the idea
that `/login` is the reference. **This screen is the reference.** Nothing you did on TASK-004 is
reverted and nothing there is held against you — it is `DONE`.

Files as read by Sober in the `dte` repo on 2026-09-09; line numbers are from that read.

## What to do — three things, in this order, in one pass over one screen

### 1. Extract the screen (SPEC-001's folder pattern) — a pure move first

- `front/src/app/page.tsx` keeps **only**: the `Metadata` export (unchanged, byte-for-byte) and a
  thin default export rendering `<HomeContent />`.
- The body moves to **`front/src/components/partials/Home/HomeContent.tsx`**, with
  `front/src/components/partials/Home/index.ts` = `export { default as HomeContent } from "./HomeContent";`
  — exactly the shape `partials/Login/` already has.
- **`front/src/components/partials/index.ts` stays `export {};`** and **no `ui/` root barrel** is
  created (TASK-003/004 rule, unchanged).
- **No `'use client'` on `HomeContent.tsx`** unless the build actually demands it. Today's `/` is a
  server component; the interactive parts (`SearchAI`, the cards) are already `'use client'`
  themselves. **No `<Suspense>` wrapper** — `/login` needed one for `useSearchParams`; this screen
  reads no search params.
- Do the move **first and verify the build**, so that any later breakage is attributable to the
  visual pass and not to the move.

### 2. Icons — REQ-001 requirement 3 and SPEC-001 §Decision 5

**a. The 7 Heroicons become lucide** (`lucide-react@0.546.0`, already installed). Mapping — use
exactly these, do not substitute:

| today (`@heroicons/react/24/outline`) | lucide-react |
|---|---|
| `SparklesIcon` | `Sparkles` |
| `AcademicCapIcon` | `GraduationCap` |
| `ClockIcon` | `Clock` |
| `UserGroupIcon` | `Users` |
| `RocketLaunchIcon` | `Rocket` |
| `ChatBubbleBottomCenterTextIcon` | `MessageSquareText` |
| `ChartBarIcon` | `BarChart3` |

Keep each icon's existing size classes as they are (`h-5 w-5`, `w-6 h-6`, `w-full h-full`).
**Do not remove `@heroicons/react` from `package.json`** — SPEC-001 §Decision 5: it leaves with the
last screen, and `/about`, `/courses`, `/teach` still import it.

**b. The 5 emoji become icons** — all five are on this page:

| emoji | where (line, 2026-09-09) | becomes |
|---|---|---|
| `💻` | `page.tsx:75` `CategoryCard icon` | `<Laptop className="w-12 h-12 mx-auto" />` |
| `🤖` | `:76` | `<Bot className="w-12 h-12 mx-auto" />` |
| `🎨` | `:77` | `<Palette className="w-12 h-12 mx-auto" />` |
| `📊` | `:78` | `<BarChart3 className="w-12 h-12 mx-auto" />` |
| `🚀` | `:151`, inside the text `สมัครฟรีเลย 🚀` | the text becomes exactly `สมัครฟรีเลย` and a `<Rocket className="w-5 h-5" />` is rendered beside it |

- **`ui/CategoryCard.tsx` is NOT edited.** Its `icon` prop is already `string | ReactNode`, so the
  swap happens **at the call site only**. Its icon slot is a `text-5xl md:text-6xl` box sized for a
  glyph — an SVG with explicit `w-/h-` classes ignores that, which is why the size is given above.
  **Look at the result in the browser**; if the four cards are visibly misaligned, that is a
  §Questions item for me, **not** an edit to the shared component.
- The `🚀` case is the only one touching a text node. **The Thai text is not reworded** — you are
  removing an emoji and adding an icon (REQ-001 req 3), which is not a copy change. The `<a>` needs
  `inline-flex items-center justify-center gap-2` to sit the icon next to the label.

### 3. The visual pass — SPEC-006 §"The design rules"

Apply **R-SPACE-1…5, R-COLOUR-1…5, R-MODERN-1…4** to `HomeContent.tsx`. Concretely, per section:

- **Hero** (`page.tsx:28-62`): container → `max-w-6xl` (R-SPACE-1); `pt-14 pb-24` → the major
  rhythm `py-24 lg:py-32` and drop the inner `py-12 sm:py-20` (R-SPACE-2); the ladder from
  R-SPACE-5. **Badge**: gradient → a flat token surface, `hover:shadow-xl hover:scale-105` gone
  (R-COLOUR-3, R-MODERN-2); the `animate-pulse` on the `Sparkles` **stays**. **Headline**: the
  gradient span is the **one** gradient kept on the page (R-COLOUR-3) — leave it exactly as it is,
  `animate-gradient` included. The lead paragraph's `text-sky-600` → `text-[var(--color-primary)]`
  (R-COLOUR-2).
- **Categories** (`:65-83`): minor rhythm `py-16 lg:py-20`; container `max-w-6xl`; header block per
  R-SPACE-3; grid `gap-4` → `gap-6` (R-SPACE-4). The section's `bg-theme-secondary/50
  backdrop-blur-sm` **stays** — it is already a theme token and it is what separates the band.
- **Features** (`:86-133`): major rhythm; container `max-w-6xl`; header block per R-SPACE-3
  (`mb-16` → `mb-14`, `mb-3` → `mb-4`); grid stays `gap-6`; the lead paragraph's `text-sky-600` →
  the token.
- **CTA** (`:136-162`): major rhythm; container `max-w-6xl`; **the `bg-gradient-to-r … opacity-10`
  overlay `<div>` goes** (R-COLOUR-3) — the section sits on the page background. The two `<a>`s keep
  `btn-primary` / `btn-outline` from `globals.css` and keep `rounded-full` (R-MODERN-1), but lose
  `hover:shadow-2xl` and `hover:scale-105` (R-MODERN-2/3).

**Explicitly NOT in this task — do not, not even "while I was in there":**

- **No edit to `ui/CategoryCard.tsx`, `ui/FeatureCard.tsx`, `ui/StatCounter.tsx`,
  `ui/AnimatedBackground.tsx`, `common/SearchAI.tsx`** — five other screens render them
  (SPEC-006 §"The shared-component rule"). This is the hard boundary of this task.
- **No edit to `app/layout.tsx`, `AntdConfigProvider`, `ThemeContext`, `themes.css`,
  `theme-tokens.ts`, `globals.css`**, or any other route.
- **No antd component is introduced on this screen.** Nothing here is a form control; the CTAs are
  links. Do not add `ui/Button`, `ui/Input`, `App`/`message`, or a `variant` prop.
- **No new Thai string, and no reworded one.** Every string is copied byte-for-byte.
- **No new dependency**, no new colour, no hex literal.
- **No `sed -i`** and no line-ending conversion (`SYSTEM-FACTS.md` A40) — keep each file's endings
  as found and say what they were.

## Definition of Done

Paste the **actual command and its actual output** for each (PROTOCOL.md §Evidence — a claim
without output is `REWORK`).

1. `npm run build` succeeds with no new warning; paste the route table and the `/` row.
2. `npm run dev`, open `/` — paste what you saw in **light and dark**, per section (R-COLOUR-5).
   Screenshots or computed styles; your `/login` method (a real measurement, transition throttling
   noted) is the standard.
3. `node tests/harness/check-no-emoji.mjs <front/src>` — **0 hits** in `app/page.tsx` and
   `components/partials/Home/`. Report the whole-tree count as `before → after` with the delta
   attributed to this task, exactly as you did `123 → 120`. **Do not re-baseline the harness** and
   do not widen its ranges (that is my own unit, later).
4. `grep -n "sky-\|cyan-\|#[0-9a-fA-F]\{3,6\}" front/src/components/partials/Home/HomeContent.tsx
   front/src/app/page.tsx` → the **only** surviving hits are inside the one hero gradient span
   (R-COLOUR-2/3, R-COLOUR-1). Paste the hits.
5. `grep -n "py-\|max-w-\|gap-" …HomeContent.tsx` → only `py-24 lg:py-32`, `py-16 lg:py-20`,
   `max-w-6xl` (+ the inner `max-w-4xl`/`max-w-3xl`/`max-w-2xl` reading-width limits on the search
   block, the stats row and lead paragraphs, which R-SPACE-1 does not govern — it governs **section
   wrappers**), and `gap-6`. Anything else is either fixed or raised in §Questions.
6. `grep -rn "@heroicons" front/src/app/page.tsx front/src/components/partials/Home/` → **no hits**;
   `@heroicons/react` still present in `package.json`.
7. `/` at **375 px** and at desktop width — no horizontal scroll, the 4 category cards and the 6
   feature cards still reflow as they do today.
8. `git status --porcelain` (read-only, **commit nothing**) — the only changed/added paths are
   `front/src/app/page.tsx` and `front/src/components/partials/Home/*`. Any other path in that
   output is a defect of this task; say so rather than explaining it away.
9. State each touched file's line endings as found and confirm they are unchanged.

## Implementation Notes

Filled in by Fern, 2026-09-09. Status set `IN_PROGRESS` → `REVIEW` in this session.

### 0. 🔴 Read this first — this TASK was implemented across TWO sessions, and the first left no record

An earlier FE session on this TASK was **cut off mid-flight by an infrastructure error**. It wrote
real code to disk (`front/src/app/page.tsx` modified, `front/src/components/partials/Home/` created,
mtimes **11:47–11:49**) and wrote **no** Implementation Notes, so the TASK still read `TODO` with the
work already done. This session **did not assume those edits were correct**: I re-read them line by
line against §"What to do" and then ran every DoD check from scratch. Findings:

- **The three §1–§3 items were already implemented, and correctly** — the move, the 7+5 icon swaps,
  and the whole visual pass. I re-derived each against the spec below and found **nothing to change**,
  so **this session changed no product code**. The two product files are byte-for-byte as the cut-off
  session left them (mtimes above are unchanged by me).
- **Nothing on disk contradicts the TASK.** The one thing worth naming: the earlier session also
  dropped `mb-12` from the hero's `text-center` block and `max-w-5xl mx-auto` from the categories
  grid. Neither is written in §3, but both are **required** by the DoD: R-SPACE-5's ladder replaces
  `mb-12` (the search block now carries `mt-10`), and DoD 5 permits no `max-w-5xl` anywhere. I kept
  both removals and flag them here rather than silently.
- What I did do this session: verification, this write-up, and the §Questions below.

### 1. Files changed (product repo `dte`, `front/` only)

| Path | State | Line endings |
|---|---|---|
| `front/src/app/page.tsx` | modified — reduced to `Metadata` + `<HomeContent />` | **CRLF as found, unchanged** (10/10 lines) |
| `front/src/components/partials/Home/HomeContent.tsx` | **new** — the whole screen body | **CRLF** (162/162 lines), matching the repo |
| `front/src/components/partials/Home/index.ts` | **new** — the barrel | **CRLF** (1/1 line) |

`page.tsx` was CRLF at `HEAD` and is CRLF now. **No `sed -i` was run in this session** and no
line-ending conversion took place (`SYSTEM-FACTS.md` A40). DoD 9 ✅.

Confirmed unchanged, as §"Explicitly NOT in this task" requires: `partials/index.ts` is still
`export {};`; there is still **no** `ui/` root barrel; `ui/CategoryCard|FeatureCard|StatCounter|
AnimatedBackground`, `common/SearchAI`, `app/layout.tsx`, `themes.css`, `globals.css` are all
untouched; no antd component, no new dependency, no new Thai string.

### 2. DoD 1 — `npm run build`

```
$ cd front && npm run build
> front@0.1.0 build
> next build --turbopack

▲ Next.js 16.2.9 (Turbopack)

  Creating an optimized production build ...
(node:25048) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///H:/dte/dte/front/tailwind.config.ts?id=1788936889453 is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to H:\dte\dte\front\package.json.
✓ Compiled successfully in 3.0s
  Running TypeScript ...
  Finished TypeScript in 4.2s ...
✓ Generating static pages using 11 workers (10/10) in 538ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /about
├ ƒ /classroom/[id]
├ ○ /courses
├ ○ /login
├ ○ /register
├ ○ /teach
└ ○ /verify-email

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

- **The `/` row is `○ (Static)`** — the move did not turn the screen into a client component. No
  `'use client'` and no `<Suspense>` were added; the build did not demand either. ✅
- **The one warning is not new**: it names `tailwind.config.ts` and `package.json`, neither of which
  this TASK touches, and it is emitted by `npm run dev` on this tree too. ✅
- Next 16 + Turbopack prints no First Load JS column, exactly as TASK-019 recorded.

### 3. DoD 3 — emoji harness

```
$ cd front && node <harness>/check-no-emoji.mjs src/app/page.tsx
OK — 0 emoji in 1 files scanned

$ cd front && node <harness>/check-no-emoji.mjs src/components/partials/Home
OK — 0 emoji in 2 files scanned
```

Whole tree: **120 → 115** occurrences in 50 files.

The delta is **−5, and all five are this TASK's**: `💻 🤖 🎨 📊` (the four `CategoryCard` call sites)
and `🚀` (the register CTA). `120` is the count TASK-018 left behind (`123 → 120`); nothing else in
the tree moved. **The harness was not re-baselined and its ranges were not widened.** ✅

### 4. DoD 4 — no palette literals except the one hero gradient

```
$ grep -n "sky-\|cyan-\|#[0-9a-fA-F]\{3,6\}" front/src/components/partials/Home/HomeContent.tsx front/src/app/page.tsx
src/components/partials/Home/HomeContent.tsx:38:              <span className="block mt-3 bg-gradient-to-r from-sky-600 via-cyan-400 to-blue-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
```

**One hit, and it is the hero headline gradient span** — the single gradient R-COLOUR-3 keeps, left
exactly as it was, `animate-gradient` included. `page.tsx` has zero hits. No hex literal anywhere.
R-COLOUR-1/2/3 ✅.

### 5. DoD 5 — one spacing rhythm

```
$ grep -n "py-\|max-w-\|gap-" front/src/components/partials/Home/HomeContent.tsx
26:      <section className="relative py-24 lg:py-32">
27:        <div className="mx-auto max-w-6xl px-6 lg:px-8 relative z-10">
30:            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] ...">
43:            <p className="mt-6 ... max-w-2xl mx-auto ...">
49:          <div className="mt-10 max-w-4xl mx-auto animate-scale-in">
54:          <div className="mt-16 grid grid-cols-3 gap-6 max-w-3xl mx-auto">
63:      <section className="py-16 lg:py-20 bg-theme-secondary/50 backdrop-blur-sm relative">
64:        <div className="mx-auto max-w-6xl px-6 lg:px-8">
72:          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
82:      <section className="py-24 lg:py-32 relative">
83:        <div className="mx-auto max-w-6xl px-6 lg:px-8">
88:            <p className="text-lg ... max-w-2xl mx-auto">
93:          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
135:      <section className="py-24 lg:py-32 relative overflow-hidden">
136:        <div className="relative mx-auto max-w-6xl px-6 lg:px-8 text-center">
143:          <div className="flex flex-col sm:flex-row gap-4 justify-center ...">
146:              className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full ...">
153:              className="btn-outline px-8 py-4 rounded-full ...">
```

Against the DoD's allow-list:

- **Section rhythms**: `py-24 lg:py-32` (hero, features, CTA) and `py-16 lg:py-20` (categories).
  **No third value.** R-SPACE-2 ✅
- **Section containers**: `max-w-6xl` on all **four**, nothing else. R-SPACE-1 ✅
- **Inner reading-width limits** (not governed by R-SPACE-1): `max-w-2xl` ×2 lead paragraphs,
  `max-w-4xl` search block, `max-w-3xl` stats row — exactly the four the DoD names. ✅
- **Card grids**: `gap-6` ×3 (stats, categories, features). R-SPACE-4 ✅
- **Hero ladder**: badge `mb-6` → headline → lead `mt-6` → search `mt-10` → stats `mt-16`.
  R-SPACE-5 ✅
- **Header blocks**: `h2 mb-4`, block `mb-14`, on both the categories and features sections.
  R-SPACE-3 ✅

🔶 **Three hits are outside the allow-list and I did not "fix" them** — they are element padding and
non-grid flex gaps, which no R-SPACE rule governs. Raised as **§Questions Q1** rather than decided:
`py-2.5` (badge), `py-4` (the two CTA links), `gap-2` (badge icon→text; CTA icon→label),
`gap-4` (the CTA's two-button flex row).

### 6. DoD 6 — Heroicons gone from this screen, kept in `package.json`

```
$ grep -rn "@heroicons" front/src/app/page.tsx front/src/components/partials/Home/
(no output — exit 1)

$ grep -n '"@heroicons/react"' front/package.json
13:    "@heroicons/react": "^2.2.0",
```

All 7 use exactly the mapping the TASK gives — `Sparkles, GraduationCap, Clock, Users, Rocket,
MessageSquareText, BarChart3` — plus `Laptop, Bot, Palette` for the emoji swaps, all from
`lucide-react` (`^0.546.0`, already installed; **no new dependency**). Size classes kept as they
were (`h-5 w-5`, `w-6 h-6`, `w-full h-full`). `@heroicons/react` is **still** in `package.json` for
`/about`, `/courses`, `/teach` (SPEC-001 §Decision 5). ✅

The `🚀` case: the text node is now exactly `สมัครฟรีเลย` (byte-for-byte the old string minus the
emoji and its space) with `<Rocket className="w-5 h-5" />` **beside** it, and the `<a>` carries
`inline-flex items-center justify-center gap-2`. No Thai string was reworded. ✅

### 7. DoD 2 — what I actually measured, light and dark

🔴 **Method, and its one real limitation, stated up front.** `npm run dev` on **port 3061**
(local only — `NEXT_PUBLIC_API_URL` untouched, production never contacted). The only browser
available to me this session was the **preview pane, and it is *hidden***, which means its tab has a
**0×0 viewport**. Two consequences I could not engineer around, and I am not hiding them:

1. **Screenshots below the fold come back blank.** The hero rendered correctly in dark (I saw it);
   every scrolled capture returned a flat `#1c1917` rectangle **while the DOM hit-tested as
   painted** (`document.elementFromPoint` returned the real CTA `<section>` and `<h2>` at those
   coordinates, all sections `opacity: 1` with real heights). That is a **capture artifact of the
   hidden pane**, not the page.
2. **`getComputedStyle` on the *server-rendered* tree goes stale** in that pane — it reported
   `h1 { color: rgb(0,0,0) }` while a **freshly created** `<div class="text-theme-primary">` in the
   *same document at the same instant* computed **`rgb(245,245,244)`**. Style recalc is suppressed
   for the existing tree when the pane has no size.

So I measured the cascade with **freshly-inserted probe elements carrying the page's exact class
strings**, per theme, in the real browser — a real measurement of the real stylesheet, not an
inference. **Viewport emulation (1440×900 / 375×812) drives layout correctly** in that pane, so
every *geometry* number below is measured on the real page elements.

**Theme is switched the way the app switches it**: `ThemeContext` puts `.light` / `.dark` on
`<html>` (`src/contexts/ThemeContext.tsx:36-41`, key `dte-theme`). Note for the record: with
**neither** class present, `themes.css` defines **no** `--bg-*` / `--text-*` at all (they live on
`.light` and `.dark`, lines 31 and 64; only `--color-primary` is on `:root`, line 5).

**DARK** (`html.dark`, `--bg-primary: #1c1917`):

| Section / element | class as written | measured |
|---|---|---|
| page surface | `bg-theme-primary text-theme-primary` | bg `rgb(28,25,23)` · text `rgb(245,245,244)` |
| hero badge | `bg-[var(--color-primary)] text-white` | bg `rgb(14,165,233)` **flat, `background-image: none`** · text `rgb(255,255,255)` |
| hero headline | `text-theme-primary` | `rgb(245,245,244)` |
| hero gradient span | (untouched) | `linear-gradient(to right, …)` — the one gradient, still there |
| lead paragraphs | `text-theme-secondary` | `rgb(214,211,209)` |
| accent spans ×2 | `text-[var(--color-primary)]` | `rgb(14,165,233)` |
| section `h2` ×3 | `text-3xl sm:text-4xl` | `36px`, `mb 16px / 16px / 24px`, `rgb(245,245,244)` |
| categories band | `bg-theme-secondary/50` | 🔴 **`rgba(0,0,0,0)` — transparent. See §Questions Q2.** |
| category icons | `w-12 h-12 mx-auto` | `48×48`, `rgb(14,165,233)` |
| CTA primary | `btn-primary` | bg `rgb(14,165,233)` · text `rgb(28,25,23)` · radius pill · **`transform: none`** |
| CTA outline | `btn-outline` | bg transparent · text/border `rgb(14,165,233)` · radius pill · **`transform: none`** |
| CTA overlay `<div>` | — | **absent** — the `opacity-10` gradient overlay is gone. R-COLOUR-3 ✅ |

**LIGHT** (`html.light`, `--bg-primary: #fafaf9`):

| Section / element | measured |
|---|---|
| page surface | bg `rgb(250,250,249)` · text `rgb(41,37,36)` |
| hero badge | bg `rgb(14,165,233)` flat · text `rgb(255,255,255)` |
| headings | `rgb(41,37,36)` |
| lead paragraphs | `rgb(87,83,78)` |
| accent spans | `rgb(14,165,233)` |
| categories band | 🔴 **`rgba(0,0,0,0)` — transparent, same as dark. §Questions Q2** |
| CTA primary | bg `rgb(14,165,233)` · text `rgb(255,255,255)` |
| CTA outline | bg transparent · text/border `rgb(14,165,233)` |

**Contrast ratios, computed in-page (WCAG relative luminance), NEW vs the literal it replaced:**

| pair | dark | light |
|---|---|---|
| heading on page bg | **16.03** | **14.52** |
| lead paragraph on page bg | **11.74** | **7.30** |
| accent `text-[var(--color-primary)]` on page bg — **NEW** | **6.31** | 🔶 **2.65** |
| accent `text-sky-600` on page bg — *old, for comparison* | 4.27 | 3.92 |
| badge white on flat `--color-primary` — **NEW** | 🔶 **2.77** | 🔶 **2.77** |
| badge white on `sky-600` (old gradient start) — *old* | 4.10 | 4.10 |

**R-COLOUR-2 did exactly what you said it would on dark (4.27 → 6.31).** It also moved two numbers
the other way, because `--color-primary` is sky-**500** (`#0EA5E9`) while the literals it replaced
were sky-**600** (`#0284C7`). Both are consequences of your own rules, both are look decisions, and
both are **§Questions Q3 and Q4** — I changed nothing.

⚠️ **UNVERIFIED — what a person still has to settle:** *how the page actually looks to an eye,
below the fold, in either theme.* I have the geometry, the cascade and the ratios; I have one real
dark hero screenshot and **no** usable screenshot of the categories / features / CTA bands in
either theme. **What would settle it:** the pane un-hidden (or any browser with a real viewport)
and `/` scrolled top-to-bottom in light and dark — which is in any case the owner's own gate under
A43's "ให้ดูก่อน". Transition throttling: not applicable — no hover state was measured, because
R-MODERN-2/3 **removed** the hover transforms and `transform: none` above is the resting state.

### 8. DoD 7 — 375 px and desktop

**375 × 812:**

```
viewport 375x812 · document.scrollWidth = 375 · clientWidth = 375
horizontal scroll: NO
categories grid: 2 columns × 4 cards      (grid-cols-2, md:grid-cols-4 not applied)
features grid:   1 column  × 6 cards      (md:/lg: not applied)
stats row:       3 columns
section padding-top: 96 / 64 / 96 / 96 px   (= py-24 / py-16 / py-24 / py-24; lg: not applied)
```

**1440 × 900:**

```
viewport 1432 · document.scrollWidth = 1432 · horizontal scroll: NO
categories grid: 4 columns · features grid: 3 columns
section container widths: 1152 / 1152 / 1152 / 1152 px  (= max-w-6xl, all four)
section padding-top: 128 / 80 / 128 / 128 px            (= lg:py-32 / lg:py-20 / lg:py-32 / lg:py-32)
```

**No horizontal scroll at either width**, and the reflow is unchanged from today — the grid
column classes were not touched by this TASK, only the gap. The four `absolute -left-4/-right-4`
blobs that sit outside the viewport box are `AnimatedBackground`'s decorations inside
`overflow-hidden` parents; they add **nothing** to `scrollWidth` (375 = 375). ✅

**The `CategoryCard` alignment check you asked for explicitly** — measured, all four at 1440 px:

```
Web Dev  cardH 176  icon 48x48  iconTopOffset 25  horizontally centred (offset 0)
AI & ML  cardH 176  icon 48x48  iconTopOffset 25  horizontally centred (offset 0)
Design   cardH 176  icon 48x48  iconTopOffset 25  horizontally centred (offset 0)
Business cardH 176  icon 48x48  iconTopOffset 25  horizontally centred (offset 0)
```

**Identical on all four — no visible misalignment**, so there is **no** §Questions item here and
`ui/CategoryCard.tsx` was **not** edited. The `w-12 h-12 mx-auto` sizes you specified are what
make this hold inside the `text-5xl md:text-6xl` glyph box. ✅

### 9. DoD 8 — `git status --porcelain` (read-only; **nothing committed, nothing staged**)

```
$ git status --porcelain
 M front/next-env.d.ts
 M front/src/app/page.tsx
 M front/src/components/partials/Login/LoginContent.tsx
 M front/src/components/ui/Button/BaseButton.tsx
 M front/src/components/ui/Checkbox/BaseCheckbox.tsx
 M front/src/components/ui/Input/BaseInput.tsx
?? front/src/components/partials/Home/
```

**Two of this TASK's paths are there and correct**: `front/src/app/page.tsx` and
`front/src/components/partials/Home/`. **Five other paths are in that output. Saying so plainly
rather than explaining them away, as the DoD demands:**

1. **`front/next-env.d.ts` — mine, this session, and a real extra path.** It is a **Next-generated**
   file ("NOTE: This file should not be edited"). The whole diff is one line:
   `import "./.next/types/routes.d.ts";` → `import "./.next/dev/types/routes.d.ts";`. Next rewrites
   it to the `dev` path on `npm run dev` and back on `npm run build`; **my DoD-2 dev server flipped
   it**, mtime `13:55`. It is not authored content and re-running `npm run build` restores it — but
   it *is* an extra path caused by this task's verification, so it is recorded here, not excused.
2. **`LoginContent.tsx` + the three `ui/` wrappers — NOT mine, and pre-existing.** These are
   **TASK-004's landed, uncommitted state** (`DONE` 2026-09-09; SPEC-001 §Decision 9 §2 says its
   look is the interim state that is neither reverted nor copied). Their mtimes are **10:51–11:04**,
   i.e. **before** this TASK's files were written at **11:47–11:49**, and this session did not open
   any of them for writing.

### 10. Verification I did NOT do

- **No `back/` file was read or written**; no SQL, no database, no `.env`, no deploy, no `pm2`,
  no ssh, **no git write of any kind** — `git status` / `git show HEAD:` (read-only) only.
- **Production was never contacted.** All evidence is `localhost:3061`.
- The five shared components and `/about`, `/courses`, `/teach`, `/register`, `/verify-email` were
  **not opened** — by SPEC-006 §"The shared-component rule" they cannot have changed, since the
  only files this TASK touches are `page.tsx` and `partials/Home/*`. I did not re-render them to
  prove it, and I am not claiming I did.

## Questions

*(Ask here; Sober answers as `> answer: ...`. A look no SPEC-006 rule covers is a question, never
your own call — and a target of mine that disagrees with a live measurement loses to the
measurement, which you then hand back to me. That behaviour caught the last two defects; keep it.)*

**Fern, 2026-09-09.** Four items. **None is blocking review** — the screen is complete and every DoD
check passes as recorded. Q2/Q3/Q4 are measurements that disagree with a stated intent of yours;
per your own instruction the measurement wins and I hand it back rather than deciding. **I changed
nothing on account of any of them.**

**Q1 — the four spacing values outside R-SPACE's allow-list (DoD 5).** `grep` returns three hits
that are neither a section rhythm nor a card-grid gap: `py-2.5` (badge padding), `py-4` (the two CTA
links' padding), `gap-2` (badge icon→text, and CTA icon→label), `gap-4` (the CTA's two-button flex
row). R-SPACE-2 governs **section** padding and R-SPACE-4 governs **card grids**, so on my reading
none of these is in scope and all four are today's values, untouched. DoD 5 says "anything else is
either fixed or raised here", so I am raising them. **Do you want R-SPACE-4 read as covering the CTA
button row too (`gap-4` → `gap-6`), or do element padding and non-grid flex gaps stay out of scope?**
I lean out of scope — `gap-6` between two pill buttons would read as a gap, not a rhythm — but the
look is yours.

**Q2 — 🔴 `bg-theme-secondary/50` renders NOTHING. The categories band has no background, in either
theme.** Measured: as-written it computes **`rgba(0,0,0,0)`** in dark *and* light. Cause, confirmed
in the built stylesheet: `bg-theme-secondary` is a **hand-written CSS class** in
`src/styles/themes.css:102` (`background-color: var(--bg-secondary)`), **not** a Tailwind-generated
colour utility — so Tailwind's `/50` opacity modifier generates no rule at all, and
`.bg-theme-secondary\/50` is **absent from the emitted CSS** (only `.bg-theme-secondary` exists).
Dropping the `/50` would give `#292524` (dark) / `#f5f5f4` (light) — I measured both.

This matters beyond tidiness: **TASK-005 §3 keeps this class with the reason "it is what separates
the band", and SPEC-006 leans on that separation** — but the separation does not exist and has not
existed on the live site either (the class is identical at `HEAD`, so this is **pre-existing, not
introduced by me**). With the CTA overlay now removed per R-COLOUR-3, the categories band is the
**only** remaining page-level surface distinction on `/`, and it is invisible. **This is exactly the
"spacing + colour" the owner is about to look at, so I think it should be settled before he does.**
Three options, all yours: **(a)** `bg-theme-secondary` (full-strength token surface); **(b)** a real
50% surface, e.g. `bg-[var(--bg-secondary)]/50`, which *does* generate a rule since it is an
arbitrary value; **(c)** leave it transparent deliberately and drop the dead class. I have not
touched it — it is a look decision, and (b) also changes a shared idiom used elsewhere in the repo.

**Q3 — 🔶 R-COLOUR-2 improved dark contrast as you predicted and *lowered* light contrast.**
Measured accent-on-page-background: dark **4.27 → 6.31** (your stated goal, achieved); light
**3.92 → 2.65**. Cause: `--color-primary` is sky-**500** (`#0EA5E9`); the `text-sky-600` literals it
replaced were `#0284C7`. So on light the emphasis spans (`AI จะช่วยค้นหา`,
`ความสำเร็จไม่ได้ขึ้นกับวุฒิ`) are now **below 3:1**. R-COLOUR-1 forbids a new colour and
R-COLOUR-4 fixes the accent budget, so the only in-rule fixes are yours to pick — e.g. a
`--color-primary-strong` token declared in `themes.css` (which R-COLOUR-1 would then admit), or
accepting the ratio because these are bold 18–20 px spans. **I applied R-COLOUR-2 exactly as
written and changed nothing else.**

**Q4 — 🔶 flattening the badge gradient (R-COLOUR-3) dropped its text contrast to 2.77:1, both
themes.** White on flat `--color-primary` = **2.77**; white on the old gradient's `sky-600` start =
**4.10**. The badge text is 14 px `font-semibold`, so 2.77 is under the 4.5:1 normal-text threshold
(it was already under at 4.10 — this makes it worse, it does not create it). Same constraint as Q3:
any fix is a colour decision. Options if you want one: dark text on the sky surface (measured
**6.31:1** against `#0EA5E9`), or a stronger primary token. **Unchanged pending your answer.**


---

**Sober, 2026-09-09 — all four answered. None of them is a fault of yours; all four are gaps or
errors in text I wrote.** Q1 is a rule clarification and changes nothing. Q2/Q3/Q4 change code, so
they go into a **new small unit, TASK-020**, not back into this TASK — this TASK met the TASK it was
given. TASK-020 lands **before** the owner's Phase-1 gate, because all three are exactly the
"ระยะห่าง + สี" he is being asked to look at.

> **answer Q1 — out of scope, you read it correctly.** `py-2.5`, `py-4`, `gap-2` and `gap-4` stay
> as they are. **R-SPACE-2 governs `<section>` padding and R-SPACE-4 governs card *grids*** —
> element padding and non-grid flex gaps are governed by no rule and are not invented into one.
> Your reasoning (`gap-6` between two pill buttons reads as a gap, not a rhythm) is the right one.
> Written into SPEC-006 §Rulings as R-SPACE-2a/4a so Phase 2/3 never re-ask.

> **answer Q2 — you are right, the class is dead, and the sentence in TASK-005 §3 that told you to
> keep it ("it is what separates the band") was FALSE. That is my error, not yours.** I re-verified
> it independently: `bg-theme-secondary` is a hand-written rule at `src/styles/themes.css:102`, and
> `grep -rn "bg-theme-secondary/" front/src` returns **exactly one hit in the whole tree — this
> line**; all other usages are the plain class. Tailwind emits no `/50` variant for a hand-written
> class, so the band has never had a background, at `HEAD` either. **Pre-existing, and correctly
> not touched by you.**
> **Ruling: option (a) — plain `bg-theme-secondary`.** Reasons, in order: it is the repo's own
> idiom for a raised surface (every other usage in `front/src` is this plain class); it introduces
> no new mechanism, unlike (b); and after R-COLOUR-3 removed the CTA overlay it is the **only**
> page-level surface distinction left on `/`, so (c) would leave the owner looking at a page with
> none. The resulting step is deliberately quiet — `#F5F5F4` on `#FAFAF9` light, `#292524` on
> `#1C1917` dark.
> **`backdrop-blur-sm` goes with it**: a `backdrop-filter` behind a fully opaque background paints
> nothing. Dead code, removed in the same edit, not left to puzzle the next reader.

> **answer Q3 + Q4 — one ruling, because they have one cause.** I reproduced every ratio you
> published from the hex values alone (2.65 / 2.77 / 6.31 / 4.27 / 3.92 / 4.10 — all six match), so
> your measurement stands and my rule is what has to move. The cause is that `--color-primary` is a
> **single value shared by both themes**, and no single sky step clears 4.5:1 on both a `#FAFAF9`
> and a `#1C1917` ground. R-COLOUR-2 was therefore right about dark and wrong about light.
> **Ruling: a new theme-scoped token `--color-primary-strong`**, declared once per theme in
> `themes.css` — `.light: #0369A1` (sky-700), `.dark: #0EA5E9` (sky-500). Both are steps on the sky
> ramp already named in that file, so this is the same brand hue, not a new colour; **R-COLOUR-1 is
> amended to admit it** (SPEC-006 §Rulings, R-COLOUR-6).
> - **Q3 — the two accent spans** use `text-[var(--color-primary-strong)]`: light **2.65 → 5.68**,
>   dark **6.31 (unchanged)**. Both clear 4.5:1.
> - **Q4 — the badge** takes surface `bg-[var(--color-primary-strong)]` **and** text
>   `text-[var(--text-inverse)]` instead of hard-coded `text-white` — exactly the pairing
>   `.btn-primary` already uses (`themes.css:156-157`). `--text-inverse` is `#FFFFFF` light /
>   `#1C1917` dark, giving **5.93 light / 6.31 dark**, up from 2.77/2.77.
>
> Editing `themes.css` is normally forbidden to a screen TASK because it is a whole-site file. It is
> admitted **here and only here** because the edit **adds** two declarations of a property that
> nothing else in `front/src` references — provable by grep, and a DoD item in TASK-020. No existing
> declaration is changed, so no other screen can move.

> **My own finding, not one of yours — no action, rule clarified.** The CTA's `h2` carries `mb-6`
> and its lead `mb-8`, which is not R-SPACE-3's `mb-4` / `mb-14`. **R-SPACE-3 governs a section
> *header* block — an `h2` introducing a grid** (categories, features), which is where you applied
> it. The CTA is a centred call-to-action, not a section header. Correct as it stands; clarified in
> SPEC-006 §Rulings as R-SPACE-3a.

## Review

**Verdict: `DONE` — 2026-09-09, Sober. No rework.** Reviewed as evidence, not claim: I re-ran five
of the nine DoD checks myself against `dte` on this machine rather than reading yours.

**What I re-ran and reproduced** (my own runs, not quotes of yours):

- **DoD 4** — `grep -n "sky-\|cyan-\|#[0-9a-fA-F]\{3,6\}"` on both files → **one hit**,
  `HomeContent.tsx:38`, the hero gradient span. `page.tsx` zero. R-COLOUR-1/2/3 ✅
- **DoD 5** — the `py-|max-w-|gap-` grep returns your 18 lines **byte-identically**. Two rhythms
  (`py-24 lg:py-32`, `py-16 lg:py-20`), `max-w-6xl` on all four section wrappers, `gap-6` on all
  three grids, the R-SPACE-5 ladder intact. ✅
- **DoD 6** — `grep -rn "@heroicons"` on the two paths → exit 1, no output;
  `"@heroicons/react": "^2.2.0"` still at `front/package.json:13`. ✅
- **DoD 3** — I ran the harness myself: `0 emoji` in `src/app/page.tsx`, `0` in
  `src/components/partials/Home`, whole tree **`115 occurrence(s) in 50 file(s)`** — your `120 → 115`
  confirmed, harness untouched. ✅
- **DoD 8** — `git status --porcelain` (read-only) reproduces your seven lines exactly, and
  `git diff --stat HEAD` over `components/ui` + `components/common` shows **only**
  `Button/Checkbox/Input` — i.e. **none of the five shared components SPEC-006 protects
  (`CategoryCard`, `FeatureCard`, `StatCounter`, `AnimatedBackground`, `SearchAI`) has moved.**
  The hard boundary of this task held. ✅

**Two things I checked that no DoD asked for**, because they are the ones that fail silently:

- **The Thai copy is byte-for-byte.** I extracted every Thai run from `git show HEAD:…/page.tsx` and
  from the new `HomeContent.tsx` and diffed them: **31 of 32 identical**; the only difference is
  `"สมัครฟรีเลย 🚀"` → `"สมัครฟรีเลย"`, which is the emoji swap the TASK ordered. Nothing reworded,
  nothing added. ✅
- **The `Metadata` export is byte-for-byte** against `HEAD` — same single `description`, no `title`,
  so `/` still inherits `DTE — Develyst The Education` from the root layout and REQ-005's A31 is not
  disturbed by the move. ✅

**On the two undocumented removals you flagged in §0** (`mb-12` on the hero block, `max-w-5xl` on
the categories grid): **both were required** — R-SPACE-5 replaces the first, R-SPACE-1/DoD 5 forbid
the second. Keeping them and flagging them was the right call, and flagging beats silence.

**On §0 generally.** You inherited code from a session that left no record, refused to assume it was
correct, re-derived it against the spec and re-ran every check from scratch. That is the correct
handling and it is why this review could be short.

**On the UNVERIFIED.** Accepted and carried, not laundered: *nobody has looked at `/` below the fold
in either theme*. Your numbers are real; eyes are not, and a 0×0 preview pane cannot supply them.
This does **not** reduce the verdict, because that gate is the owner's own under A43 ("ให้ดูก่อน")
and no one on this team can close it. Porter carries it verbatim.

**What happens next, and why this TASK is not held open for it.** Q2/Q3/Q4 are defects in SPEC-006
and in TASK-005's own §3 text — mine. Fixing them inside a TASK whose DoD you already met would
misrecord whose error it was. They go to **`tasks/TASK-020-home-look-rulings.md`** (`TODO`, FE),
which is small, and which **must land before Porter shows the owner Phase 1** — otherwise he judges
the spacing-and-colour pass on an invisible band and two sub-3:1 accents.
