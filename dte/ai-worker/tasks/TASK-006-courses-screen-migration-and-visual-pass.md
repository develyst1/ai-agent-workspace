# TASK-006: The `/courses` screen — migration **+** the second visual-improvement pass

- Source: **SPEC-006 Phase 2** (the look) **+ SPEC-001 §Decision 9** (the substrate and the order)
- Owner: **FE (Fern)**
- Status: **REVIEW** — written 2026-09-09 (Sober); implemented and submitted 2026-09-09 (Fern)
- Depends on: **TASK-005 (`DONE`) and TASK-020 (`DONE`)** — `/` is the reference this screen copies.
  Nothing here is gated on the owner's preview: he named the courses page himself as the **second**
  screen (`SYSTEM-FACTS.md` **A43**), and **A44** settled that "หน้าคอร์ส" is the **list page
  `/courses`** — not a course-detail page, which does not exist (see §Findings 1).

🔴 **`/` (home) is the reference, and `/login` is not.** TASK-005 + TASK-020 are `DONE` and their
result is the look this screen aligns to. Where a rule below quotes a class string, copy the idiom
from `front/src/components/partials/Home/HomeContent.tsx` **exactly** rather than re-inventing it.

Files as read by Sober in the `dte` repo on **2026-09-09**; every line number below is from that
read of `front/src/app/courses/page.tsx` (190 lines).

## What to do — three things, in this order, in one pass over one screen

### 1. Extract the screen (SPEC-001's folder pattern) — a pure move first

- `front/src/app/courses/page.tsx` keeps **only**: the `Metadata` export (unchanged,
  **byte-for-byte** — `title: 'ทักษะทั้งหมด'` is REQ-005 `DELIVERED` work, do not touch it) and a
  thin default export rendering `<CoursesContent />`.
- The body moves to **`front/src/components/partials/Courses/CoursesContent.tsx`** (default export
  named `CoursesContent`; today's function is named `SkillsPage` — the **file** is renamed, the
  route is not), with **`front/src/components/partials/Courses/index.ts`** =
  `export { default as CoursesContent } from "./CoursesContent";` — exactly the shape
  `partials/Home/` and `partials/Login/` already have.
- **`front/src/components/partials/index.ts` stays `export {};`** and **no `ui/` root barrel** is
  created (TASK-003/004 rule, unchanged).
- **No `'use client'`** unless the build actually demands it — today's `/courses` is a server
  component and stays one. **No `<Suspense>`**: this screen reads no search params.
- Do the move **first and verify the build**, so any later breakage is attributable to the visual
  pass and not to the move.
- **Delete the unused import on line 4** — `CategoryCard` is imported and never rendered on this
  page (the category row at `:47-59` is hand-written `<button>`s). Removing a dead import is part
  of the move; nothing else in the import block is dropped in step 1.

### 2. Icons — REQ-001 requirement 3 and SPEC-001 §Decision 5

**a. The 4 Heroicons become lucide** (`lucide-react@0.546.0`, already installed). Note these are
imported from `@heroicons/react/24/**solid**` on this screen, not `outline`:

| today (`@heroicons/react/24/solid`) | lucide-react |
|---|---|
| `AcademicCapIcon` (`:29`, `:95`) | `GraduationCap` |
| `StarIcon as StarIconSolid` (`:134`) | `Star` — **add `fill-current`** so it stays a filled star |
| `UserGroupIcon` (`:138`) | `Users` |
| `ClockIcon` (`:142`) | `Clock` |

Keep each icon's existing size classes (`w-5 h-5`, `h-20 w-20`, `h-4 w-4`) exactly as found; the
colour classes on them are re-decided in step 3. **Do not remove `@heroicons/react` from
`package.json`** — SPEC-001 §Decision 5: it leaves with the last screen, and `/about` and `/teach`
still import it.

**b. The 3 emoji in this file become icons** (SPEC-006 §Non-functional: an emoji becoming an icon is
not a copy change; **rewording is, and no Thai string is reworded here**):

| emoji | where (line, 2026-09-09) | becomes |
|---|---|---|
| `🤖` | `:37`, end of `…ที่โต้ตอบได้ตลอดเวลา 🤖` | text becomes exactly `ที่โต้ตอบได้ตลอดเวลา`, and a `<Bot className="w-5 h-5" />` sits beside it — wrap that trailing run in `<span className="inline-flex items-center gap-1 align-middle">`, the same shape TASK-005 used for `🚀` |
| `✨` | `:72`, end of `…ที่โต้ตอบได้ตลอดเวลา ✨` | same treatment, `<Sparkles className="w-5 h-5" />` |
| `🔍` | `:169`, the whole `<div className="text-5xl mb-4">🔍</div>` | that `<div>` is replaced by `<Search className="w-12 h-12 mx-auto mb-4" />` (its colour comes from step 3) |

**c. The two `→` glyphs (`:154`, `:182`) become `<ArrowRight className="w-4 h-4" />`** — SPEC-006
**R-MODERN-6**. The motion they carried moves with them: `group-hover:translate-x-1
transition-transform` goes onto the SVG at `:154`; the `:182` one carries no motion and gains none.

**d. `skill.instructorAvatar` (`:127`) is NOT in scope.** Those emoji live in
`front/src/lib/mockData.ts` — a data file this task does not open — and an avatar is not an
interface icon. `check-no-emoji.mjs` will keep reporting them tree-wide; they are pre-existing and
**not** attributable to this task. Say so in your report rather than "fixing" it.

### 3. The visual pass — SPEC-006 §"The design rules" + §Rulings

Apply **R-SPACE-1…5, R-COLOUR-1…6, R-MODERN-1…6** to `CoursesContent.tsx`. Section by section:

- **Hero (`:25-41`) — the sky→cyan band goes.** `bg-gradient-to-r from-sky-600 to-cyan-600
  text-white py-20` becomes the page background plus the major rhythm: `relative py-24 lg:py-32`
  (R-SPACE-2, R-COLOUR-3). Container `max-w-7xl` → `max-w-6xl` (R-SPACE-1).
  - **Badge (`:28-31`)**: `bg-white/20 backdrop-blur-sm` → the `/` badge idiom, copied verbatim from
    `HomeContent.tsx:30` — `bg-[var(--color-primary-strong)] text-[var(--text-inverse)]`, keeping
    `rounded-full`, `px-4 py-2`, `mb-6` (R-SPACE-2a leaves element padding alone).
  - **`h1` (`:32-34`)**: the white→sky-50→cyan-50 clip-text was a gradient **on** a gradient. It
    becomes **the one gradient this page keeps** (R-COLOUR-3), using `/`'s exact span —
    `bg-gradient-to-r from-sky-600 via-cyan-400 to-blue-600 bg-clip-text text-transparent
    animate-gradient bg-[length:200%_auto]`. The responsive size `text-4xl sm:text-6xl` stays as
    found (R-MODERN-4 governs `h2`, not this `h1`).
  - **Lead `<p>` (`:35-38`)**: `text-xl text-sky-50` → `text-lg sm:text-xl text-theme-secondary`
    (R-MODERN-4, R-COLOUR-2); the inner `font-bold text-white` span →
    `font-semibold text-[var(--color-primary-strong)]` (the `HomeContent.tsx:44` idiom). Ladder per
    R-SPACE-5: headline → lead `mt-6`; there is no search block and no stats row on this screen, so
    R-SPACE-5's other two rungs do not apply. `mb-4` on the lead is dropped in favour of `mt-6` on
    it. `<br />` stays. `max-w-3xl mx-auto` stays (a reading width, not a section wrapper).
- **Category filter bar (`:44-62`)** — behaviour is untouched: it stays `sticky top-16 z-40` and it
  stays non-functional (see §Findings 2 — **do not** wire it up).
  - 🔴 `bg-theme-primary/95` **emits no CSS at all** — `.bg-theme-primary` is a hand-written rule in
    `front/src/styles/themes.css:100`, not a Tailwind colour utility, so Tailwind generates no `/95`
    variant. This is the same defect class as R-COLOUR-3a. Corrected to the plain
    **`bg-theme-primary`** and the now-dead **`backdrop-blur-sm` is removed** alongside
    (SPEC-006 **R-COLOUR-2a**). A sticky bar with no background is what ships today; a real one is
    what makes the bar readable while the grid scrolls under it. **Report what it looked like before
    and after** — this is the one change on this screen most likely to surprise.
  - Container `max-w-7xl` → `max-w-6xl`; `py-6` on the bar stays (R-SPACE-2a).
  - Active pill (`:52`): the gradient + `shadow-lg hover:shadow-xl` → flat
    `bg-[var(--color-primary-strong)] text-[var(--text-inverse)]` (R-COLOUR-3, R-MODERN-3).
    Inactive pill (`:53`) keeps its theme classes as found. `hover:scale-105` goes (R-MODERN-2);
    `transition-all` becomes `transition-colors duration-300` (R-MODERN-2). `animate-fade-in` and
    the staggered `animationDelay` **stay** (entrance animation, R-MODERN-2).
  - `flex gap-3` is a non-grid flex gap — R-SPACE-4a leaves it. `scrollbar-hide` is a class nothing
    in this repo defines; **leave it as found** and see §Findings 3.
- **Main content wrapper (`:65`)**: `max-w-7xl` → `max-w-6xl`; `py-12` → the minor rhythm
  `py-16 lg:py-20` (R-SPACE-2).
- **Section header (`:67-74`)**: `h2` `text-3xl` → `text-3xl sm:text-4xl` (R-MODERN-4), `mb-3` →
  `mb-4`, block `mb-12` → `mb-14` (R-SPACE-3). The `text-lg text-theme-secondary` lead stays.
- **Skill grid (`:77`)**: `gap-8` → `gap-6` (R-SPACE-4). **Drop `xl:grid-cols-4`** — inside a
  `max-w-6xl` container a 4-up row is ~264 px per card; the grid ends at `lg:grid-cols-3`.
  `mb-16` stays (it separates the grid from the CTA block, which R-SPACE-3a leaves alone).
- **The skill card (`:79-158`) — this markup is local to this screen, so unlike Phase 1 the card
  interior IS in scope.**
  - Card shell (`:82`): `hover:border-sky-400` → `hover:border-[var(--color-primary)]`
    (R-COLOUR-2); **`hover:shadow-2xl` and `hover:-translate-y-2` go** (R-MODERN-2/3) and are
    replaced by one soft `shadow-md`; `rounded-2xl` stays (R-MODERN-1); `transition-all
    duration-300` stays; `animate-fade-in-up` + the staggered delay stay.
  - **Thumbnail (`:86-93`) — the 6-way gradient palette goes** (R-COLOUR-3b): the whole
    `skill.thumbnail` ternary chain is replaced by one flat token tint,
    `bg-[var(--color-primary)]/10`, keeping `relative h-48 flex items-center justify-center
    overflow-hidden`. `GraduationCap` inside it gets `text-[var(--color-primary-strong)]` instead of
    `text-white opacity-90`, and **loses `group-hover:scale-125 group-hover:rotate-12`**
    (R-MODERN-2); `transition-all duration-500` goes with them. `skill.thumbnail` in `mockData.ts`
    is **not** edited — see §Findings 4.
  - **"ฟรี" badge (`:98-102`)**: the emerald→green gradient → `bg-[var(--color-primary-strong)]
    text-[var(--text-inverse)]` (R-COLOUR-3/4/6); `shadow-lg` goes (R-MODERN-3); **`animate-pulse`
    goes** (R-MODERN-5 — a looping animation may not sit on a text-bearing element). `rounded-full`,
    `px-3 py-1.5`, `text-xs font-bold` and the `absolute top-4 right-4` position all stay.
  - **Hover overlay (`:105`)**: `bg-black/20` is a hard-coded colour that is **always on** (the
    `group-hover:opacity-100` does nothing without a base `opacity-0`). Delete the `<div>` —
    R-COLOUR-1 and R-MODERN-2. Nothing replaces it.
  - **Category badge (`:111`)**: `bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400` →
    `bg-[var(--color-primary)]/10 text-[var(--color-primary-strong)]` (R-COLOUR-2/6). The
    `dark:` pair disappears because the tokens are theme-scoped — that is the point of R-COLOUR-6.
  - **Title (`:116`)**: `group-hover:text-sky-600` → `group-hover:text-[var(--color-primary-strong)]`
    (R-COLOUR-2). `line-clamp-2 min-h-[3.5rem]` stays.
  - **Stat icons (`:134`, `:138`, `:142`)**: `text-yellow-400`, `text-sky-600`, `text-cyan-600` all
    → **`text-[var(--text-tertiary)]`** (R-COLOUR-4b). The star also gets `fill-current` so it
    stays filled. The rating number keeps `font-bold text-theme-primary`.
  - **Price (`:149`)**: the sky→cyan clip-text gradient → `text-[var(--color-primary-strong)]`,
    keeping `text-2xl font-bold` (R-COLOUR-3).
  - **"เรียนเลย" (`:152`)**: `text-sky-600` → `text-[var(--color-primary-strong)]`;
    `group-hover:gap-2 transition-all` stays (a 4 px gap change is not a large-block transform).
- **CTA block (`:163-186`)** — R-SPACE-3a: it is not a section header and keeps its own spacing.
  - **The decorative blur `<div>` (`:166`) is deleted** — gradient + `blur-2xl` + `animate-pulse`
    (R-COLOUR-3, R-MODERN-5). With it goes the `relative inline-block` wrapper's only reason to
    exist; keep the wrapper only if the build needs it, otherwise the inner card is the child.
  - **The card (`:168`)**: `bg-gradient-to-r from-sky-600 to-cyan-600 … text-white shadow-2xl` →
    `bg-theme-secondary border border-theme-primary text-theme-primary shadow-md`;
    `rounded-3xl` → **`rounded-2xl`** (R-MODERN-1); `p-12` stays.
  - `h3` (`:170`) keeps `text-3xl font-bold mb-4`. Lead `<p>` (`:173`): `text-sky-50` →
    `text-theme-secondary`; the inner `font-bold text-white` span →
    `font-semibold text-[var(--color-primary-strong)]`.
  - The `Search` icon from step 2b gets `text-[var(--color-primary-strong)]`.
  - **The `<Link>` (`:177-183`)**: `bg-white text-sky-600 … hover:scale-105 hover:shadow-xl` →
    `/`'s CTA idiom — `btn-primary inline-flex items-center justify-center gap-2 px-8 py-4
    rounded-full font-bold shadow-lg transition-all duration-300` (R-MODERN-1/2/3). Its `→` is
    already handled by step 2c.

**Explicitly NOT in this task — do not, not even "while I was in there":**

- **No edit to `ui/AnimatedBackground.tsx`, `ui/CategoryCard.tsx`, or any other `ui/` or `common/`
  component** — SPEC-006 §"The shared-component rule"; five screens the owner has not seen render
  them. This is the hard boundary of this task.
- **No edit to `front/src/lib/mockData.ts`** — not the avatars, not `thumbnail`, not a field.
- **No edit to `app/layout.tsx`, `themes.css`, `globals.css`, `tailwind.config.ts`,
  `theme-tokens.ts`, `AntdConfigProvider`, `ThemeContext`**, or any other route. **No new token is
  added** — `--color-primary-strong` already exists (TASK-020).
- **No wiring of the category filter, no new route, no `/courses/[id]` page** — §Findings 1 and 2
  are findings I carry upward, not work.
- **No antd component is introduced on this screen**; nothing here is a form control.
- **No new Thai string and no reworded one.** Every string is copied byte-for-byte; the only text
  change permitted is deleting the three emoji named in step 2b.
- **No new dependency, no new colour, no hex literal.**
- **No `sed -i`** and no line-ending conversion (`SYSTEM-FACTS.md` A40) — keep each file's endings as
  found and say what they were.

## Definition of Done

Paste the **actual command and its actual output** for each (PROTOCOL.md §Evidence — a claim without
output is `REWORK`). Anything you could not run is `UNVERIFIED — <what would settle it>`.

1. `npm run build` succeeds with no new warning; paste the route table and the `/courses` row.
2. `npm run dev`, open `/courses` — paste what you saw in **light and dark**, per section
   (R-COLOUR-5). Your `/login` + `/` method (real computed styles, transition throttling noted) is
   the standard.
3. **Measured contrast, both themes**, computed not inferred — these five are the ones I authored
   from a code read and cannot verify (SPEC-006 §Rulings, the lesson of R-COLOUR-6):
   a. card **category badge** text `--color-primary-strong` on `bg-[var(--color-primary)]/10` over
      `bg-theme-secondary` — needs **≥ 4.5:1**;
   b. **"ฟรี" badge** text `--text-inverse` on `--color-primary-strong` — **≥ 4.5:1**;
   c. **price** text `--color-primary-strong` on `bg-theme-secondary` — **≥ 4.5:1**;
   d. **thumbnail icon** `--color-primary-strong` on `bg-[var(--color-primary)]/10` — **≥ 3:1**
      (non-text);
   e. **stat icons** `--text-tertiary` on `bg-theme-secondary` — **≥ 3:1**.
   Any ratio that misses is a **§Questions item for me**, not a colour you pick.
   🔴 **Measure against the composited backdrop, not the token pair** — `AnimatedBackground` is
   `fixed inset-0 -z-10` and paints blurred orbs at ~20% alpha behind this page too, and (a) and (d)
   stack a `/10` tint on top of that, so a token-pair calculation is optimistic here. This is the
   limit I named myself in `tasks/TASK-020-…md` §Review; Phase 2 is where it first bites.
4. **The sticky bar actually paints**: with the grid scrolled under it, paste the computed
   `background-color` of the filter bar in both themes — a real `rgb()`, not `rgba(0, 0, 0, 0)`.
   (This is the R-COLOUR-2a fix; if it still computes transparent, stop and ask me.)
5. `node tests/harness/check-no-emoji.mjs <front/src>` — **0 hits** in `app/courses/page.tsx` and
   `components/partials/Courses/`. Report the whole-tree count as `before → after` with the delta
   attributed to this task, and name the surviving `mockData.ts` hits as pre-existing (step 2d).
   **Do not re-baseline the harness** and do not widen its ranges (my own unit, later).
6. `grep -n "sky-\|cyan-\|purple-\|green-\|pink-\|emerald-\|yellow-\|stone-\|blue-\|black/\|white/\|#[0-9a-fA-F]\{3,6\}" front/src/components/partials/Courses/CoursesContent.tsx front/src/app/courses/page.tsx`
   → the **only** surviving hits are inside the one `h1` gradient span (R-COLOUR-1/2/3). Paste them.
7. `grep -n "py-\|max-w-\|gap-\|rounded-" …CoursesContent.tsx` → section wrappers show only
   `py-24 lg:py-32`, `py-16 lg:py-20` and `max-w-6xl`; the card grid shows only `gap-6`; radii are
   only `rounded-2xl` and `rounded-full`. Element padding (`py-2`, `py-3`, `py-1.5`, `p-6`, `p-12`)
   and non-grid flex gaps (`gap-1`, `gap-2`, `gap-3`, `gap-4`) are governed by no rule (R-SPACE-2a /
   R-SPACE-4a) — list them so I can see them, do not change them.
8. `grep -rn "@heroicons" front/src/app/courses/page.tsx front/src/components/partials/Courses/` →
   **no hits**; `@heroicons/react` still present in `package.json`; `/about` and `/teach` still
   import it (paste that grep too).
9. `/courses` at **375 px** and at desktop width — no horizontal scroll on the page itself, the
   filter row still scrolls horizontally on its own, and the grid reflows 1 → 2 → 3 columns. State
   the rendered card width at 1280 px.
10. `git status --porcelain` (read-only, **commit nothing**) — the only changed/added paths are
    `front/src/app/courses/page.tsx` and `front/src/components/partials/Courses/*`. Any other path
    in that output is a defect of this task; say so rather than explaining it away.
11. State each touched file's line endings as found and confirm they are unchanged.

## Findings — carried, not fixed (do not act on these; they are Sober's to route)

1. 🔴 **`/courses/[id]` does not exist.** Every card links to `` `/courses/${skill.id}` ``
   (`:81`) and `common/SearchAI.tsx:86` builds the same link — `find src/app -name page.tsx` returns
   no `courses/[id]`. So the primary action of this screen, and of the home page's AI search, is a
   dead link on every row. **UNVERIFIED** — a code read, not an observed 404; nobody here opens the
   live site. This is a product decision (build the page, or change what the card does), so it goes
   to Porter, not into this task.
2. **The category filter does nothing.** `:47-59` renders `<button>`s with no `onClick` and no
   state, and the active pill is hard-coded to `category === 'ทั้งหมด'`; the file is a server
   component. Pre-existing. **Do not wire it up** — that is a new requirement, not a visual pass.
3. **`scrollbar-hide` is undefined.** Nothing in `globals.css`, `themes.css` or
   `tailwind.config.ts`'s plugin declares it, and Tailwind v4 has no such built-in — so the filter
   row shows a scrollbar today. Defining it means editing `globals.css`, a whole-site cost a screen
   TASK may not pay. Left as found; report what the row looks like at 375 px (DoD 9).
4. **`skill.thumbnail` becomes unread by this screen** once the gradient chain is replaced. The
   field stays in `mockData.ts` and in the `Skill` type — removing it is a data-file change and its
   own (tiny) unit later. Not this task.

## Implementation Notes

Filled by **Fern 2026-09-09**. Status moved `TODO` → `IN_PROGRESS` → **`REVIEW`**.
Repo `dte` (path from workspace-root `machine.local.md`). Dev server: my own port **3061**.

### Files changed — exactly three paths

| Path | What |
|---|---|
| `front/src/app/courses/page.tsx` | reduced to `Metadata` (byte-identical) + `export default function SkillsPage(){ return <CoursesContent />; }` |
| `front/src/components/partials/Courses/CoursesContent.tsx` | **new** — the whole body, default export `CoursesContent` |
| `front/src/components/partials/Courses/index.ts` | **new** — `export { default as CoursesContent } from "./CoursesContent";` |

`components/partials/index.ts` still reads `export {};` (verified) and **no `ui/` root barrel exists**
(`ls front/src/components/ui/index.ts` → *No such file or directory*). No `'use client'`, no `<Suspense>` —
`/courses` is still `○ (Static)` in the route table below.

**Metadata byte-check** (not an eyeball): `git show HEAD:front/src/app/courses/page.tsx | sed -n '13,16p' | md5sum`
→ `539bb34f38be21c537a6bc3832bb21bc`; `sed -n '4,7p' front/src/app/courses/page.tsx | md5sum` →
`539bb34f38be21c537a6bc3832bb21bc`. **Identical.**

**Thai-copy round-trip check** (the "no reworded string" rule, machine-checked not asserted): a script
extracted every Thai run from `HEAD:…/courses/page.tsx` and from the two new files, and diffed the sets →
`old runs: 21  new runs: 21 · MISSING FROM NEW: [] · EXTRA IN NEW: []`. The only text deleted is the three
emoji of step 2b.

**Step 1 was done and built first, alone**, exactly as ordered: the pure move built clean
(`✓ Compiled successfully in 2.7s`, `/courses` still `○`) *before* any icon or colour was touched, so
nothing below is attributable to the extraction.

### DoD 1 — `npm run build`

```
> next build --turbopack
▲ Next.js 16.2.9 (Turbopack)
(node:19268) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///H:/dte/dte/front/tailwind.config.ts ... is not specified
✓ Compiled successfully in 2.5s
  Running TypeScript ...
  Finished TypeScript in 3.4s ...
✓ Generating static pages using 11 workers (10/10) in 460ms

Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /about
├ ƒ /classroom/[id]
├ ○ /courses          ← still prerendered as static content
├ ○ /login
├ ○ /register
├ ○ /teach
└ ○ /verify-email
```

**No new warning.** The `MODULE_TYPELESS_PACKAGE_JSON` line is pre-existing (it is in the pre-move build too).

### DoD 2 — `/courses` in a real browser, light AND dark, per section

`npm run dev` on 3061; measured with real `getComputedStyle`, both themes (theme switched via the app's own
`localStorage['dte-theme']` + reload). **Throttling noted, and it bit:** the pane tab reports
`document.hidden`, so CSS animations and the global `* { transition: background-color .2s }` sit frozen at
`currentTime 0` — a first read of the card returned `background-color: rgba(0,0,0,0)` purely because the
0.2 s transition had not advanced. Every number below is taken **after**
`document.getAnimations().forEach(a=>a.finish())` + settle; the card then reads `rgb(41,37,36)`. Anyone
re-running this without that step will see false transparents.

| Section | Light (`html.light`, `--bg-primary #FAFAF9`) | Dark (`html.dark`, `#1C1917`) |
|---|---|---|
| Hero `<section>` | `background-color: rgba(0,0,0,0)`, `background-image: none`, padding `96px/96px` — **the sky→cyan band is gone**, the page ground shows through | same |
| Hero badge | bg `rgb(3,105,161)` / text `rgb(255,255,255)` — **5.93:1** | bg `rgb(14,165,233)` / text `rgb(28,25,23)` — **6.31:1** |
| `h1` | `background-image: linear-gradient(to right, …)`, `color: rgba(0,0,0,0)`, `-webkit-background-clip: text`, 60px @1280 / 36px @375 | same (the gradient is theme-independent by design — R-COLOUR-3) |
| Hero lead | `rgb(87,83,78)` on body — **7.30:1**; `font-size 20px` @1280 / 18px @375; `margin-top: 24px` | `rgb(214,211,209)` — **11.74:1** |
| Hero lead accent span | `rgb(3,105,161)` on body — **5.68:1** | `rgb(14,165,233)` — **6.31:1** |
| Sticky filter bar | `rgb(250,250,249)`, **alpha 1**, `backdrop-filter: none` | `rgb(28,25,23)`, **alpha 1**, `backdrop-filter: none` |
| Active pill | bg `rgb(3,105,161)`, `background-image: none`, `box-shadow: none`, text `rgb(255,255,255)` — **5.93:1**, transition `color, background-color, … | 0.3s` | bg `rgb(14,165,233)`, text `rgb(28,25,23)` — **6.31:1** |
| Inactive pill | bg `rgb(245,245,244)`, text `rgb(41,37,36)`, border `rgb(231,229,228)` — unchanged idiom | theme-swapped equivalents |
| Section header `h2` | 36px @1280 / 30px @375, `margin-bottom: 16px`, `rgb(41,37,36)` | `rgb(245,245,244)` |
| Card shell | bg `rgb(245,245,244)` **alpha 1**, border `rgb(231,229,228)`, shadow `rgba(0,0,0,.1) 0 4px 6px -1px, rgba(0,0,0,.1) 0 2px 4px -2px` (one soft `shadow-md`) | bg `rgb(41,37,36)`, border `rgb(57,50,48)`, same shadow |
| Thumbnail | `oklab(0.684673 -0.0798082 -0.12445 / 0.1)` → composited over the card = **#DEEDF3**; icon `rgb(3,105,161)`, `height 80px`, no hover transform | composited **#263238**; icon `rgb(14,165,233)` |
| "ฟรี" badge | bg `rgb(3,105,161)`, text `rgb(255,255,255)`, **`animation-name: none`**, **`box-shadow: none`** | bg `rgb(14,165,233)`, text `rgb(28,25,23)` |
| Category badge | same tint as the thumbnail, text `rgb(3,105,161)` | text `rgb(14,165,233)` |
| Stat icons | all three `rgb(120,113,108)`; the star's `fill` is `rgb(120,113,108)` (filled), the other two `fill: none` | all three `rgb(168,162,158)`, star filled |
| Price | `color: rgb(3,105,161)`, **`background-image: none`** (the clip-text gradient is gone) | `rgb(14,165,233)` |
| Hover overlay | `document.querySelector('.bg-black\\/20')` → **false**, i.e. deleted | same |
| CTA card | bg `rgb(245,245,244)`, border `rgb(231,229,228)`, `border-radius: 16px`, `shadow-md`, text `rgb(41,37,36)` | bg `rgb(41,37,36)`, border `rgb(57,50,48)` |
| CTA link (`btn-primary`) | bg `rgb(14,165,233)` / text `rgb(255,255,255)` → **2.77:1** 🔴 see §Questions Q1 | bg `rgb(14,165,233)` / text `rgb(28,25,23)` → **6.31:1** |

Screenshots I actually looked at (4): light desktop hero+bar+header, light desktop card grid (3-up),
light desktop CTA block, dark desktop card grid, plus light 375 px hero+bar. They match the table.

🔴 **Screenshot honesty:** the Browser pane's screenshot compositor returned **stale/blank frames after any
programmatic scroll** on this page. I worked around it by hiding earlier sections in the live DOM (a
throwaway devtools manipulation, no file changed) so each section could be shot at scroll 0. So the visual
record is real but assembled section-by-section, **never one continuous scroll of the finished page**.
`UNVERIFIED — a person scrolling the whole /courses page top to bottom in both themes.`

### DoD 3 — the five measured contrasts (composited, both themes)

Computed in-page: Chrome returns the `/10` tints as `oklab(… / 0.1)`, so I converted oklab → linear sRGB →
sRGB, alpha-composited over the real backdrop, then applied the WCAG relative-luminance formula.

| # | What | Light | Dark | Needs | Verdict |
|---|---|---|---|---|---|
| a | category-badge text on `/10` tint over card | **4.95** | **4.76** | ≥ 4.5 | ✅ |
| b | "ฟรี" badge text on `--color-primary-strong` | **5.93** | **6.31** | ≥ 4.5 | ✅ |
| c | price on card | **5.44** | **5.47** | ≥ 4.5 | ✅ |
| d | thumbnail icon on `/10` tint over card | **4.95** | **4.76** | ≥ 3 | ✅ |
| e | stat icons on card | **4.40** | **6.01** | ≥ 3 | ✅ |

**All five clear. Nothing in DoD 3 is a §Questions item.**

🔴 **Your composited-backdrop warning, resolved with evidence rather than assumed away.** You were right to
demand it and it turned out **not** to bite here, for a reason I checked rather than hoped:
`AnimatedBackground` computes `position: fixed; z-index: -10` (I enumerated every fixed element with a
negative z-index; it is the only one), and the card itself computes `background-color` with **alpha
exactly 1** (`rgb(245,245,244)` light / `rgb(41,37,36)` dark). An opaque surface at z-index 0 over an
orb layer at −10 means **nothing from the orbs reaches (a)–(e)** — all five live inside the card. The
`/10` tints in (a) and (d) therefore composite over the *card*, not over the page, which is what the two
`compositedOverCard` hexes above are (#DEEDF3 light, #263238 dark). The token-pair shortcut you warned
about would have been wrong in *method*; here it lands on the same numbers because the stack is opaque.
The place your warning does still apply on this screen is the **hero**, where the section is transparent
and the orbs are genuinely behind the text — the hero numbers above are token-pair-on-body and are
therefore the optimistic bound; they clear by 5.68–11.74 so the orbs' ~20 % alpha cannot take any of them
under threshold, but I am naming the limit rather than hiding it.

### DoD 4 — the sticky bar actually paints

Scrolled to `scrollY 1600` at 1280×900, **3 course cards intersecting the bar's rect**, and
`document.elementFromPoint(bar centre)` returns a **`BUTTON`** (the bar is on top, not underneath):

- dark: `background-color: rgb(28, 25, 23)`, **alpha 1** — a real `rgb()`, not `rgba(0,0,0,0)`
- light: `background-color: rgb(250, 250, 249)`, **alpha 1**
- `backdrop-filter: none` in both (the dead `backdrop-blur-sm` is gone)

**Before → after, as you asked.** Before: `bg-theme-primary/95 backdrop-blur-sm` emitted **no background at
all** — the identical R-COLOUR-3a defect — so course cards scrolled *visibly through* the filter row, with
only the bottom border to suggest a bar. After: an opaque bar in both themes; the grid disappears cleanly
under it. **This is the largest visible change on the screen and the one most likely to read as "new".**

### DoD 5 — emoji harness

`node tests/harness/check-no-emoji.mjs front/src` (run from the repo root, harness path absolute):

- `app/courses/page.tsx` and `components/partials/Courses/` → **0 hits** (grep of the harness output for
  `courses` returns nothing).
- Whole tree: **115 occurrence(s) in 50 file(s) → 110 occurrence(s) in 52 file(s)**. Delta **−5**, all five
  attributable to this task and exactly the five the TASK named: `🤖` (`:37`), `✨` (`:72`), `🔍` (`:169`),
  `→` (`:154`), `→` (`:182`). File count 50 → 52 because this task adds two files.
- **Surviving `mockData.ts` hits are pre-existing and NOT this task's** — they are `skill.instructorAvatar`
  and friends in a data file this task never opened (step 2d). The harness will keep reporting them
  tree-wide until whoever owns that data file is given a unit for it.
- Harness **not** re-baselined and its ranges **not** widened.

### DoD 6 — no palette literal survives except the one gradient

```
$ grep -n "sky-\|cyan-\|purple-\|green-\|pink-\|emerald-\|yellow-\|stone-\|blue-\|black/\|white/\|#[0-9a-fA-F]\{3,6\}" \
    front/src/components/partials/Courses/CoursesContent.tsx front/src/app/courses/page.tsx
CoursesContent.tsx:29:  <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-sky-600 via-cyan-400 to-blue-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
```

**One hit, and it is the `h1` gradient span** — `/`'s exact span, copied from `HomeContent.tsx`. Zero hits in
`page.tsx`. No hex literal anywhere.

### DoD 7 — spacing / radii inventory

Section wrappers: `relative py-24 lg:py-32` (hero) and `relative … py-16 lg:py-20` (main) — **no third
value**. Containers: `max-w-6xl` ×3 (hero, filter bar, main). Card grid: **`gap-6` only**
(`gridTemplateColumns: 346.656px 346.672px 346.656px`, `gap: 24px` measured at 1280). Radii: **`rounded-2xl`
and `rounded-full` only** (`border-radius: 16px` on card and CTA measured).

Two `max-w-*` that are **reading widths, not section wrappers**, left as found per the TASK: `max-w-3xl
mx-auto` on the hero lead, and the pre-existing `max-w-md mx-auto` on the CTA lead.

Listed for you, changed by nobody (R-SPACE-2a / R-SPACE-4a):
element padding `px-4 py-2` (hero badge), `py-6` (filter bar), `px-6 py-3` (pill), `p-6` (card body),
`px-3 py-1.5` ("ฟรี"), `px-3 py-1` (category badge), `pb-4` / `pt-4` (card dividers), `p-12` (CTA card),
`px-8 py-4` (CTA link); non-grid flex gaps `gap-1` (×4), `gap-2` (×2), `gap-3` (filter row), `gap-4` (stats).

### DoD 8 — Heroicons

```
$ grep -rn "@heroicons" front/src/app/courses/page.tsx front/src/components/partials/Courses/
(no hits)
$ grep -n "heroicons" front/package.json
13:    "@heroicons/react": "^2.2.0",
$ grep -rn "@heroicons" front/src/app/about front/src/app/teach
front/src/app/about/page-new.tsx:10:} from '@heroicons/react/24/outline';
front/src/app/about/page.tsx:10:} from '@heroicons/react/24/outline';
front/src/app/about/page.tsx.backup:12:} from '@heroicons/react/24/outline';
front/src/app/teach/page.tsx:16:} from '@heroicons/react/24/outline';
```

The dependency stays; `/about` and `/teach` still import it. Nothing removed from `package.json`.

### DoD 9 — 375 px and desktop

| | 375 × 812 | 1280 × 900 |
|---|---|---|
| `document.documentElement.scrollWidth` | **375** (= viewport → **no horizontal page scroll**) | **1272** (< 1280 → none) |
| grid | `gridTemplateColumns: 327px` — **1 column** | `346.656px 346.672px 346.656px` — **3 columns** |
| **rendered card width @1280** | — | **346.66 px** |
| filter row | `scrollWidth 2144` vs `clientWidth 327`, `overflow-x: auto` → **still scrolls on its own** | `2144` vs `1088` → scrolls |
| CTA card width | 327 px | **1088 px** (full container — see the note below) |

The 2-column rung is `sm:grid-cols-2` (Tailwind `sm` = 640 px) and `lg:grid-cols-3`, so 1 → 2 → 3 holds;
I measured the two endpoints, not 640 px. `xl:grid-cols-4` is dropped as ordered.
The only elements whose right edge exceeds 375 px are (i) an `AnimatedBackground` orb, which lives inside
that component's own `overflow-hidden` fixed layer, and (ii) the filter `<button>`s inside the
`overflow-x-auto` row — i.e. exactly the two intended overflows, neither of which moves the page.

🔴 **§Findings 3 confirmed by eye, as you asked:** at 375 px the filter row shows a **visible native
scrollbar** under the pills (`scrollbar-hide` is undefined, so nothing hides it). Left as found.

⚠️ **One consequence of the TASK's own instruction, reported not hidden:** deleting the decorative blur
`<div>` took away the `relative inline-block` wrapper's reason to exist, and per the TASK I dropped the
wrapper ("otherwise the inner card is the child"). The CTA card is therefore **no longer shrink-to-fit —
it now spans the full `max-w-6xl` container (1088 px at 1280)** where before it hugged its text. It is the
second-most visible change after the sticky bar. If you wanted it to stay shrink-to-fit, that is a one-class
rework and it is yours to call, not mine.

### DoD 10 — `git status --porcelain` (read-only; nothing committed, nothing staged)

```
 M front/next-env.d.ts
 M front/src/app/courses/page.tsx        ← THIS TASK
 M front/src/app/page.tsx
 M front/src/components/partials/Login/LoginContent.tsx
 M front/src/components/ui/Button/BaseButton.tsx
 M front/src/components/ui/Checkbox/BaseCheckbox.tsx
 M front/src/components/ui/Input/BaseInput.tsx
 M front/src/styles/themes.css
?? front/src/components/partials/Courses/     ← THIS TASK
?? front/src/components/partials/Home/
```

I captured this **same command before touching anything**, and the pre-task baseline was byte-for-byte the
list above **minus** `front/src/app/courses/page.tsx` and `front/src/components/partials/Courses/`. So this
task's footprint is exactly those two entries; every other line is the still-uncommitted output of
TASK-004/005/018/019/020, which is the human's to commit (git is out of our scope, A23). I am naming them
rather than explaining them away.

### DoD 11 — line endings

All three touched paths were/are **CRLF**, unchanged: `file` reports `with CRLF line terminators` for
`app/courses/page.tsx`, `partials/Courses/CoursesContent.tsx` and `partials/Courses/index.ts`. The two new
files were written CRLF deliberately to match `partials/Home/`. **No `sed -i` was used anywhere in this
task** (A40) — the edits were made by explicit Node file writes.

### Things the TASK forbade, and what I actually did

- `ui/AnimatedBackground.tsx`, `ui/CategoryCard.tsx`, any other `ui/`/`common/` component — **untouched**
  (`git status` proves it). `CategoryCard`'s dead import was deleted from the *page*, the component was not.
- `lib/mockData.ts` — **untouched**. `skill.thumbnail` is now unread by this screen (§Findings 4) and the
  field is still there.
- `app/layout.tsx`, `themes.css`, `globals.css`, `tailwind.config.ts`, `theme-tokens.ts`,
  `AntdConfigProvider`, `ThemeContext`, any other route — **untouched. No new token added.**
- Category filter **not** wired; no new route; no `/courses/[id]`; no antd on this screen; no new dependency;
  no new/reworded Thai string; no hex literal.

## Questions

**Q1 → Sober. The CTA link you told me to copy measures 2.77:1 in the light theme.** The TASK's step 3
says the `<Link>` becomes "`/`'s CTA idiom — `btn-primary` …", so I used `btn-primary` exactly. Measured on
the running page:

| | light | dark |
|---|---|---|
| `.btn-primary` background | `rgb(14,165,233)` (`--color-primary`) | `rgb(14,165,233)` |
| `.btn-primary` colour | `rgb(255,255,255)` (`--text-inverse`) | `rgb(28,25,23)` |
| **contrast** | **2.77:1** 🔴 | **6.31:1** ✅ |

`themes.css:157-162` declares `.btn-primary { background-color: var(--color-primary); color:
var(--text-inverse); … }` — i.e. it uses `--color-primary`, **not** `--color-primary-strong`. That is
precisely the pair your own **R-COLOUR-6** identified as failing ("flattening the badge gradient took its
text to **2.77** in both themes"), and TASK-020 fixed it *for the badge* by introducing
`--color-primary-strong` — but `.btn-primary` itself was never moved onto the new token, so **the same
2.77:1 button is on `/` today** (TASK-005/020 shipped this idiom) and now on `/courses` as well.

I did **not** change it, for two reasons, both rules of yours: `.btn-primary` is an **existing** declaration
in `themes.css`, and "changing an existing `themes.css` declaration remains a whole-site cost and stays
forbidden to a screen TASK" (SPEC-006 §R-COLOUR-6); and every screen with a primary button would move at
once. **This is a look/whole-site decision, so it is yours.** Three shapes I can see, all cheap, none mine
to pick: (i) point `.btn-primary` at `--color-primary-strong` (one line in `themes.css`, moves every screen
including four the owner has not seen); (ii) leave `.btn-primary` alone and give this one CTA the flat
`bg-[var(--color-primary-strong)] text-[var(--text-inverse)]` pair the rest of the screen already uses
(screen-local, but then `/` and `/courses` CTAs differ); (iii) accept 2.77 as deliberate for a large
`text-lg`-ish button and record it.
**It gates nothing** — the screen is otherwise complete and I have moved the TASK to `REVIEW`; but Phase 1
and Phase 2 both carry this button, so the owner will be looking at it.

**Q2 → Sober (FYI, no decision needed unless you disagree).** The CTA card is now full-width — see the
⚠️ note in DoD 9. I followed the TASK's literal instruction to drop the `relative inline-block` wrapper. Say
the word and it goes back to shrink-to-fit.


## Review

**Verdict: `DONE`. No rework.** Reviewed by **Sober 2026-09-09** against SPEC-006 (§"The design
rules" + both §Rulings blocks) and SPEC-001 §Decision 9. Every DoD carries a real command and real
output, which is the bar (PROTOCOL.md §Evidence); nothing was laundered.

### What I re-ran myself in the `dte` repo, rather than believing the notes

| Check | My result |
|---|---|
| DoD 6 — the palette-literal grep, verbatim | **one hit**, `CoursesContent.tsx:29`, the `h1` gradient span. Zero in `page.tsx`. Matches. |
| DoD 8 — `grep -rn "@heroicons"` on both paths | **no hits**; `front/package.json:13` still has `@heroicons/react`; `/about` (×3, incl. the two strays) and `/teach` still import it. Matches. |
| DoD 1 substrate — the extraction shape | `app/courses/page.tsx` is 11 lines: `Metadata` + `export default function SkillsPage(){ return <CoursesContent />; }`. `partials/Courses/index.ts` is the exact one-line barrel. `partials/index.ts` still `export {};`. `components/ui/index.ts` → **No such file**. No `'use client'`, no `<Suspense>`. Matches. |
| DoD 11 — line endings | `cat -A` on `app/courses/page.tsx` shows `^M$` on every line: **CRLF, unchanged**. Matches. |
| The whole 172-line component, read line by line | Every instruction I wrote is present and **nothing beyond them**: hover overlay gone, `xl:grid-cols-4` gone, thumbnail is the single `bg-[var(--color-primary)]/10` tint with no `group-hover:scale/rotate`, `animate-pulse` gone from "ฟรี", stat icons all `--text-tertiary` with `fill-current` only on the star, price flat `--color-primary-strong`, sticky bar plain `bg-theme-primary` with **no** `backdrop-blur-sm`, `scrollbar-hide` left as found, entrance animations + staggered delays kept. |
| The forbidden list | `themes.css`, `globals.css`, `tailwind.config.ts`, `mockData.ts`, every `ui/` and `common/` component: **unedited**. Her `git status --porcelain` baseline attribution is exactly right. |

**Two pieces of method on the record, because both are better than what I asked for.** (1) The
Metadata "byte-for-byte" and the "no reworded Thai string" rules were discharged by **md5 and a
Thai-run set-diff (21 → 21, none missing, none extra)**, not by eye — that is how a byte rule should
be checked. (2) My composited-backdrop warning in DoD 3 was **answered with evidence rather than
assumed away**: card `background-color` alpha is exactly 1 and `AnimatedBackground` is the only fixed
negative-z layer, so the orbs provably cannot reach (a)–(e). The hero numbers are correctly named as
the optimistic token-pair bound. All five ratios clear, **4.40–6.31, in both themes**.

### UNVERIFIED carried out of this task (Porter takes these to the owner with the screen)

1. **Nobody has scrolled the finished `/courses` top to bottom** in either theme — the pane's
   screenshot compositor returned stale frames after a programmatic scroll, so the visual record was
   assembled section by section from scroll 0. Settled by a person opening the page.
2. **The hero's contrast numbers are token-pair-on-body**, not composited over the orbs. They clear
   by 5.68–11.74, so ~20 % alpha orbs cannot take them under 4.5:1 — but it is a bound, not a
   measurement.

### Q1 — ANSWERED. You were right to stop, and right not to touch `themes.css`.

> **answer (Sober, 2026-09-09):** Not your defect and not this task's. `.btn-primary`
> (`themes.css:157-162`) is a **pre-existing whole-site declaration**; you followed the TASK exactly
> and the 2.77:1 is inherited, not introduced by Phase 2. **No rework on `/courses`.**
>
> I checked the blast radius before choosing, and it is wider than either of us said:
> `grep -rn "btn-primary" front/src` returns **`layout/Navbar.tsx:102` and `:184`** as well as
> `HomeContent.tsx:146` and your `:162`. The Navbar is in the **root layout**, so this button is on
> **every screen in the app already**, including the four the owner has not been shown. That kills
> your option (ii) — a screen-local pair would leave `/courses` disagreeing with both `/` and the
> navbar sitting directly above it — and it kills (iii), because I will not record a measured 2.77:1
> as deliberate against a rule (R-COLOUR-6) I wrote myself.
>
> **Decision: option (i), as its own one-file TASK, never folded into a screen TASK.** `.btn-primary`
> moves onto the theme-scoped accent. Recorded as **SPEC-006 §R-COLOUR-7**. The cost is bounded and
> one-directional: `--color-primary-strong` is `#0EA5E9` in `.dark` — **identical to today's**
> `--color-primary` — so **no dark-theme screen changes at all**; in light the accent darkens
> `#0EA5E9` → `#0369A1`, both already on that file's own sky ramp, so no new colour enters the system.
>
> **A second and worse finding out of the same read, and it is why this cannot queue behind six
> screens:** `.btn-primary:hover` (`:164-169`) sets `background-color: var(--color-primary-light)` =
> `#E0F2FE` (sky-50) while `color` stays `--text-inverse` = `#FFFFFF` in light — **white on
> near-white, ≈1.15:1**. In the light theme the primary button's label appears to **vanish on hover**:
> on `/`, on `/courses`, and in the navbar of every route. **UNVERIFIED — computed from the token
> values in `themes.css`, not observed in a browser**; the hover state was in nobody's DoD. Confirming
> it and fixing it belong in that same TASK.
>
> **Sequencing — my call, with the reason written down rather than fudged:** that TASK goes **next**,
> ahead of REQ-007, and **before** the owner answers the Phase-1 "ให้ดูก่อน" gate, so his answer lands
> on the fixed button instead of reopening a screen he has already passed. It is an accessibility fix
> inside the mandate he gave (A43: **สี**), not new scope. Porter gets one FYI line; it is **not** a
> new question for the owner, who has four open already.
>
> **It gates nothing here. TASK-006 is `DONE` today.**

### Q2 — ANSWERED. Keep the full-width CTA card; no rework.

> **answer (Sober, 2026-09-09):** My instruction caused it, you flagged it instead of quietly
> reverting, and I am keeping it. A full-width `max-w-6xl` card with `p-12` closing the page reads as
> the deliberate rhythm this pass is for; the shrink-to-fit `inline-block` existed only to give the
> deleted blur `<div>` something to sit in, and the lead still carries `max-w-md mx-auto` so the
> reading width survives. **Nothing to change** — and it is named for the owner as the second most
> visible change on this screen, after the sticky bar.

### The four §Findings — where each now lives

1. **`/courses/[id]` does not exist** — with **Porter** since 2026-09-09 (board Blocked row +
   `inbox/PM.md`); still UNVERIFIED, still a product decision, still gates nothing.
2. **Inert category filter** — carried unchanged; a new requirement if the owner wants it, never a
   visual pass.
3. **`scrollbar-hide` is undefined — now CONFIRMED by eye** at 375 px (a visible native scrollbar
   under the pills). Defining it costs `globals.css`, i.e. the whole site; it stays a finding.
4. **`skill.thumbnail` is now unread by this screen** — a tiny `mockData.ts` unit for later.
