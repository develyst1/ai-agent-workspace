# SPEC-001: Frontend foundation — house folder pattern, component library, icons not emoji
- Source: REQ-001
- Status: ACTIVE (2026-09-07 — **no owner gate is open**; C5(a) library = antd, C5(b) upgrade = run it, `SYSTEM-FACTS.md` A15/A16)
- Written: 2026-09-07 by Sober (SA Lead)

## Overview

REQ-001 asks for three things that are really one substrate change: a **documented folder
pattern**, **one component library**, and **icons instead of emoji**. The owner has fixed the
shape of the work — incremental, screen by screen ("ค่อยย้ายทีละหน้า"), Next 16 approved in
direction but its plan shown to him first, and the library pick reserved to him
("เสนอแล้วผมเคาะ").

The approach here is therefore **substrate first, screens after**:

1. Land the **skeleton** of the house folder pattern next to the existing tree (new folders,
   barrels, `@/*` alias — which already exists). Nothing moves yet, so nothing breaks.
2. Run the **Next 15 → 16 + Tailwind 3 → 4** upgrade as its own sequenced TASK with a rollback
   (TASK-001) — the owner sees that plan before it runs.
3. Install the chosen library **after his yes**, wire its provider + theme tokens to the
   existing `ThemeContext`/`themes.css`, and then migrate screens **one at a time**, each
   screen independently shippable and independently checkable by his own eyes.
4. The **no-emoji** standard is enforced by a script that a person can run and read, not by
   inspection.

Why this order: the version upgrade and the library install both touch every page's runtime.
Doing them before any screen is rewritten means a failure is attributable to one change, and
the rollback is a single `git checkout` of `package.json` + lockfile, not a half-migrated tree.

**Everything below is design read out of the code on 2026-09-07 (read-only, `develop` as it sits
on disk). Nothing in this SPEC has been executed. No build, no dev server, no browser — those are
the engineer's evidence, in the TASK.**

---

## Decision 1 — the component library: **Ant Design v6** ✅ APPROVED BY THE OWNER 2026-09-07

REQ-001 C5(a) is **CLOSED**: Porter carried the proposal below and the owner answered **"antd"**
(`SYSTEM-FACTS.md` A15). TASK-003 and the per-screen migrations are no longer gated.
⚠️ He approved the **library, not a schedule** — Q2 "ค่อยย้ายทีละหน้า" stands, so migration
remains screen by screen, one TASK per screen.
*(The text below is the proposal as it was carried to him; kept as the record of what he approved.)*

### The proposal

**Ant Design v6** (`antd@6.4.3` + `@ant-design/nextjs-registry@1.3.0`), with **lucide-react** as
the single icon set.

### Rationale, against the alternatives he named

- **It is one of the two libraries the owner himself named** ("อาจจะเป็น mantine , antd").
- **It is the only candidate that satisfies C1 without tension.** C1 mandates the folder
  structure from the `nextjs pattern generator` skill. That skill split into one skill per
  library; **Ant Design is its stated house default**, and on this machine only three of the six
  variants are actually installed (`nextjs-antd-pattern`, `nextjs-chakra-pattern`,
  `nextjs-heroui-pattern` — shadcn / MUI / PrimeReact are listed in the selector but **not
  present**). Picking antd means the mandated pattern is read from a skill that exists here.
- **Mantine is the C1 tension REQ-001 Q1 asked to be stated plainly: there is no Mantine pattern
  skill.** Choosing Mantine means either inventing a folder pattern (breaking C1, an owner
  instruction) or applying the antd-shaped pattern to a library it was not written for. That is a
  real cost and the reason Mantine is not the recommendation — not a judgement on Mantine itself.
- **DTE's real surface is form- and data-heavy, and that is where antd is strongest.** What is
  already built or coming: register/login with validation (342 + 236 lines today), the teacher
  page (415 lines), a classroom with chat (411 lines), course listing/filtering, and — from
  REQ-002 and the schema — payments, payouts, reviews, verification queues. `Form`, `Table`,
  `Upload`, `Steps`, `Tabs`, `Modal`, `Result`, `Skeleton` cover those out of the box.
- **Dark/light already exists here and antd can be driven by it** — `ConfigProvider` +
  `theme.darkAlgorithm` takes its cue from the existing `ThemeContext.actualTheme`, so the
  owner's current toggle keeps working instead of being replaced (see Decision 4).

### What is worse about it, stated honestly

- antd's default look is **enterprise, not consumer**. DTE's marketing surface (home, about)
  wants a lighter feel. Mitigation: those pages stay Tailwind-first; antd is used for app
  surfaces (auth, teach, classroom, course management). This is a per-screen decision recorded
  in each migration TASK, not a blanket re-skin — the owner ruled out a re-skin anyway (REQ-001
  §Out of Scope).
- antd is **CSS-in-JS**; without `@ant-design/nextjs-registry` there is FOUC and hydration
  mismatch on SSR. The registry is in the lockset for exactly this and is non-optional.
- **Bundle size** grows. Not measured here — measuring it is part of TASK-003's evidence, not a
  claim this SPEC gets to make.
- Tailwind utilities lose specificity fights with antd's own styles; the house pattern's answer
  is `!`-suffixed utilities on wrapper components (`h-10! rounded-lg!`). Ugly, but it is the
  pattern's own convention and it keeps the fight in `components/ui/` instead of every page.

### Runner-up, if he rejects antd

**HeroUI** — a pattern skill for it is installed, it is Tailwind-native (no CSS-in-JS registry,
no specificity war), and its default look suits a consumer learning product better. It is
weaker on the data/form components DTE will need for payouts and course management, which is
why it is second. **Chakra UI** is the third installed option; same trade-off as HeroUI plus a
heavier theming layer to reconcile with `themes.css`.

> ✅ **GATE CLOSED 2026-09-07 — "antd".** TASK-003 and the per-screen migration TASKs may now be
> written. TASK-001 and TASK-002 remain deliberately **library-independent** and run first.

---

## Decision 2 — Next.js 15 → 16: **upgrade**, as its own sequenced TASK

REQ-001 Q3 delegated the 15-vs-16 call to Sober on merit; the owner then settled the direction
himself ("อัปไปเลย") and asked to see the plan first ("เอามาให้ดูก่อน").

**Decision: upgrade to Next 16.** Reasoning on merit, not on the lean:

- The pattern skills' entire lockset is written for **Next 16.2.9 + React 19.2.7**. Applying the
  pattern on 15 means diverging from C1's own source on day one and re-diverging at every future
  bump.
- The repo is **already on React 19.2.3** and **already runs Turbopack for both `dev` and
  `build`** (`front/package.json`) — the two changes that usually make a 15→16 jump painful are
  already absorbed here.
- Node on this machine is **v22.23.2** (observed 2026-09-07), above Next 16's floor.
- The alternative — apply the pattern on 15 now, upgrade later — pays the migration cost twice
  and does the upgrade **after** screens have been rewritten, when a regression is no longer
  attributable to one change.

**Cost and risk are NOT known yet and this SPEC does not pretend otherwise.** Nothing was built
or run. The upgrade is TASK-001, it carries its own rollback and blast radius, and per C5(b)
**Porter shows that TASK to the owner before Jason/Fern execute it.**

Bundled into the same upgrade window, because it is the same class of change and the same
rollback: **Tailwind 3.4.17 → 4.x**, which the house pattern also requires
(`@tailwindcss/postcss`). Rationale and the specific hazards are in TASK-001.

## Decision 3 — Tailwind stays. It is not replaced by the library.

REQ-001 AC requires this stated explicitly:

- **Tailwind is kept**, and remains the layout/spacing/typography tool. The component library
  supplies *components*, not utilities.
- The existing **`src/styles/themes.css` remains the single source of brand colour** (it already
  holds `--color-primary` … `--color-ai` and the light/dark blocks). The library's theme is
  *fed from* it, never a second palette (Decision 4).
- Division of labour, written into the convention doc so Fern does not re-decide it per screen:
  **library** = interactive/stateful components (Form, Table, Modal, Upload, Select, DatePicker,
  Steps, Tabs, message/notification). **Tailwind** = page layout, grid, spacing, marketing
  surfaces, and anything the library does not have.

### Two defects found while reading, NOT fixed here

Recorded so nobody "fixes" them mid-migration and confuses a regression with a pre-existing bug.

- **`front/tailwind.config.ts` declares theme colours as `rgb(var(--bg-primary) / <alpha-value>)`,
  but `themes.css` defines those variables as hex (`--bg-primary: #FAFAF9`).** `rgb(#FAFAF9)` is
  not valid CSS, so those Tailwind colour utilities (`bg-primary`, `text-primary`, `accent`, …)
  cannot be producing the intended colour. The pages mostly use the plain CSS classes
  `.bg-theme-primary` / `.text-theme-primary` defined in `themes.css`, which do work — which is
  probably why this was never noticed. **UNVERIFIED — reading only; confirming it needs a build
  and a browser.** Repair belongs in the Tailwind 4 step of TASK-001, where the config is
  rewritten anyway.
- **`@headlessui/react` is installed and imported by nothing** in `front/src` (checked
  2026-09-07). Removing an unused dependency is not in REQ-001's scope; noted for the owner.

## Decision 4 — how the library meets the existing theming (this is also the answer to REQ-001 Q4)

`front/` has load-bearing pieces the pattern does not mention, and they are **kept**:

| Existing | Fate | Why |
|---|---|---|
| `src/contexts/ThemeContext.tsx` (light/dark/system + `localStorage` `dte-theme`) | **KEEP as-is** | Works, and is the source the library's theme reads from. No `next-themes`. |
| `src/contexts/AuthContext.tsx` (hand-rolled JWT against `back/`'s `/auth`) | **KEEP as-is** | The house pattern ships NextAuth 4. Replacing DTE's own auth is an **auth-architecture change with backend consequences — not a folder-structure change**, and REQ-001 is foundation-only. **Deliberate deviation from the pattern, stated, not silent.** |
| `src/services/api.ts` (one file, `fetch`, all DTOs) | **Split later, per screen** | The pattern wants `lib/api/` + `services/<feature>.service.ts` + `types/`. Splitting it wholesale is a big-bang; each screen migration carves out its own slice instead. |
| TanStack React Query (pattern default) | **NOT adopted in REQ-001** | It changes how every screen fetches. That is a separate decision, after the foundation lands. Same reason as auth. |
| `src/constants/` | **KEEP**; `portfolio.ts` / `services.ts` are REQ-003's, untouched here | C4. |
| `src/styles/themes.css` | **KEEP — it is the palette of record** | Decision 3. |
| `ThemeToggle.tsx` | **KEEP** | The owner's existing control keeps working; only its icons change (Heroicons → lucide). |

**Bridge, concretely:** `ConfigProvider` is mounted in `src/app/layout.tsx` **inside**
`ThemeProvider`, reads `useTheme().actualTheme`, and selects `theme.defaultAlgorithm` /
`theme.darkAlgorithm`; its `token.colorPrimary` etc. are set from the same hex values that
`themes.css` already declares (`--color-primary: #0EA5E9`, `--color-danger: #EF4444`, …), so
there is **one palette with two consumers**, never two palettes. `AntdRegistry` wraps the whole
body for SSR. Exact code is TASK-003's, not this SPEC's.

> **Answer to REQ-001 Q4 is this whole section** (also recorded as `> answer:` in the REQ).

## Decision 5 — the icon set: **lucide-react**, one set, Heroicons retired per screen

- Two sets are installed today. `@heroicons/react` is imported by **12** files;
  `lucide-react` by **1** (`components/ui/PasswordInput.tsx`) — counted 2026-09-07.
- **lucide-react wins** anyway: it is what the house pattern ships, and the emoji-replacement
  work needs a much wider vocabulary (robot/AI, target, chart, trophy, book, sparkle…) than
  Heroicons' outline/solid set covers.
- **Heroicons is not ripped out in one commit.** A screen converts its icons when that screen is
  migrated; `@heroicons/react` is removed from `package.json` only when the last import is gone,
  and that removal is the final step of the last migration TASK.

---

## Target folder structure (C1 — from the `nextjs pattern generator` house pattern)

```
front/src/
├── app/                     # routes only; pages stay thin, delegate to partials
├── components/
│   ├── ui/<Component>/      # thin library wrappers + index.ts   (Base<Component>.tsx)
│   ├── common/              # generic shared (DataTable, SearchBar, …)
│   ├── layout/              # Navbar, Footer, shells
│   └── partials/<Feature>/  # per-feature sections: <Feature>Content.tsx ("use client"),
│                            # <Feature>Header.tsx, <Feature>.config.ts, index.ts
├── hooks/{common,<feature>}/
├── services/<feature>.service.ts
├── lib/api/{client.ts,interceptor.ts,api-main.ts}
├── types/{api/,app/}
├── context/                 # pattern spells it `context/`; see mapping note below
└── constant/
```

**Mapping to what exists** (the deltas Fern actually performs):

| Today | Target | When |
|---|---|---|
| `components/*.tsx` flat (`Navbar`, `Footer`, `AIChat`, `SearchAI`, `ThemeToggle`, `AnimatedSearchPlaceholder`) | `components/layout/` (Navbar, Footer) · `components/common/` (the rest) | TASK-002 (skeleton) + per screen |
| `components/ui/*.tsx` flat (`CategoryCard`, `FeatureCard`, `StatCounter`, `PasswordInput`, `AnimatedBackground`) | `components/ui/<Name>/<Name>.tsx` + `index.ts` | per screen |
| `contexts/` | **stays `contexts/`** — the pattern's `context/` is a naming preference; renaming a load-bearing folder for a singular/plural buys nothing and touches every import. **Deliberate, stated deviation.** | — |
| `services/api.ts` (single file) | `lib/api/` + `services/<feature>.service.ts` + `types/` | carved per screen |
| `lib/mockData.ts` (feeds `/courses`) | stays until `/courses` is wired to the API — **that is not REQ-001 work** | — |

Per-screen migration order (each its own TASK, each independently shippable):

1. `login` → 2. `register` → 3. `verify-email` → 4. `/` (home) → 5. `courses` → 6. `teach` →
7. `classroom/[id]`

> 🔴 **SUPERSEDED 2026-09-09 by §Decision 9** (`SYSTEM-FACTS.md` A43): the order is now `/` (home) → the courses page → `register` → `verify-email` → `teach` → `classroom/[id]`, with `login`'s substrate already done. Read §Decision 9, not this list.

Rationale: auth screens are the smallest self-contained forms and exercise the library's Form +
validation the hardest; `classroom/[id]` (chat, streaming, 411 lines) is last because it is the
highest-risk screen on a live site. `/about` is deliberately **not** in this list — its content
is unsettled (`SYSTEM-FACTS.md` A10, About copy is an open DATA REQUEST); `/portfolio`,
`/services`, `/contact`, `/blog` are **never migrated** — REQ-003 deletes them.

## The no-emoji check (REQ-001 AC — a check a person runs and reads)

- Script: **`tests/harness/check-no-emoji.mjs`** in **this coordination repo** (PROTOCOL.md:
  throwaway verification scripts live here, not in the product repo). Takes the `front/src` path
  as an argument, prints `file:line` and the offending character for every hit, exits non-zero if
  any, prints `OK — 0 emoji in <n> files scanned` if none.
- **Scope of "emoji"**: Unicode ranges `U+1F000–U+1FAFF`, `U+2600–U+27BF`, `U+2B00–U+2BFF`, plus
  `U+FE0F`. Arrows `→ ←` and `✓ ✕` used as text glyphs are **also** flagged (they are icon usage
  by another name) — a screen replaces them with lucide icons as it migrates.
- **Baseline, measured 2026-09-07** (read-only scan of `front/src`, that same range set):
  **15 files, ~160 occurrences** — superseded by the harness's own measurement, **124 occurrences in
  14 files (39 scanned), 2026-09-07**; the 33-hit difference is `about/page.tsx.backup`, whose
  extension the checker deliberately does not scan. Reconciliation: TASK-002 §Review. Heaviest: `lib/mockData.ts` 39, `about/page.tsx.backup` 33,
  `about/page.tsx` 17, `about/page-new.tsx` 17, `teach` 7, `Navbar` 6, `classroom/[id]` 6,
  `register` 6, `courses` 5, `page.tsx` 5, `login` 4, `SearchAI` 4, `services/aiChat.ts` 4,
  `verify-email` 3, `AIChat` 1.
- The check runs **per screen**, on the files that screen owns. The whole-tree run only reaches
  zero after REQ-003 (which deletes 4 of the offending pages) and after the `/about` copy
  arrives — so **"0 across `front/src`" is not an exit condition for REQ-001**; "0 in the files
  this TASK touched" is.

## Decision 6 — the antd shared-chunk cost: **CLOSED 2026-09-09** (recorded open 2026-09-08, owned by Sober)

Measured in TASK-003, not predicted: mounting `AntdConfigProvider` in the **root** layout adds
**+100.8 kB uncompressed First Load JS to every one of the 13 routes** (`/` 561.7 → 662.5 kB),
because the root layout imports antd's `ConfigProvider` + `theme` and drags the token/algorithm
engine and `@ant-design/cssinjs` into the shared chunk. Numbers and the AFTER table I re-verified
myself: `tasks/TASK-003-…md` §Step 8 + §Review.

- **Settled:** lazy-loading the provider with `ssr: false` is **rejected** — it reintroduces the
  FOUC/hydration mismatch `AntdRegistry` exists to prevent. The cost **stands as shipped**; the
  bridge is correctly built and is not reverted.
- **Open:** whether to scope the provider below the root layout — a route group over the app
  surfaces (`/login`, `/register`, `/verify-email`, `/teach`, `/classroom/[id]`, `/courses`) with
  the marketing pages (`/`, `/about`) left antd-free. That decision needs the **compressed**
  delta, which does not exist yet (TASK-003 §Questions Q3, `UNVERIFIED`).
- **Not a blocker.** TASK-004…010 may be written and run meanwhile: if the provider later moves
  into a route-group layout, only layout files change, no screen's own code.
- **Next unit, mine:** a small measurement TASK (compressed delta, method written down), then
  this decision. Nobody measures ad hoc and nobody uninstalls antd to get a BEFORE.

### The measurement is now written: **TASK-019** (2026-09-09, Sober)

`tasks/TASK-019-antd-shared-chunk-compressed-measurement.md` — **`DONE` 2026-09-09, Fern**. Measurement
only: it produced numbers and closed nothing. **The decision was mine and is now taken — see §CLOSED
below.**

- **Method: two states of the same tree, one variable.** **A** = as shipped; **B** = the same tree
  with only the two antd imports and their two wrapper elements removed from
  `front/src/app/layout.tsx`. **antd is not uninstalled** (my 2026-09-08 answer to TASK-003 Q3),
  `package.json`/`node_modules` are untouched, and the edit is reverted and *proved* reverted in the
  same session.
- **Why that edit is a valid BEFORE — checked in the real code 2026-09-09, not assumed:** `antd` /
  `@ant-design` is imported by exactly **four** files (`app/layout.tsx`,
  `contexts/AntdConfigProvider.tsx`, and the `ui/Button` + `ui/Input` wrappers), and **nothing
  imports the two wrappers**. So the root layout is the only door antd enters by, and State B is
  antd-free in the entry graph.
- **State B is not a proxy — it is the hypothetical itself.** A page with the provider scoped away
  from it is a page whose entry graph has no antd. B's `/` and `/about` numbers *are* the
  post-scoping marketing-page numbers.
- **gzip AND Brotli, both states, identical settings.** What the live server negotiates is a
  production fact nobody here has or may go and fetch; measuring both brackets it, so the decision
  never rests on a guessed server setting.
- 🔴 **TASK-003's numbers are not reused.** That tree had 13 routes; today's has 9 (TASK-014) and
  four gained a `layout.tsx` (TASK-016/017). State A is re-measured from scratch; matching
  `+100.8 kB` would be a sanity check on the method, not the finding.
- 🔴 **The risk this TASK carries is `layout.tsx` itself** — it holds REQ-005's root
  `title.default`/`template`, so a bad restore silently breaks all 8 titles. Hence a hashed backup
  in the coordination repo, restore by copy (never a re-edit), `sha256`+byte+CRLF proof (A40), and
  a live re-proof of the 8 titles and `/`'s pipe count **0** (A31) after restoring.
- Still **not a blocker**: TASK-004…010 may be written and run while this is open.

---

### ✅ CLOSED 2026-09-09 by Sober, on TASK-019's numbers

TASK-019 is `DONE` (reviewed 2026-09-09; I re-ran the measurement myself and got State A back
byte-identically — `tasks/TASK-019-…md` §Review). The number it was written to produce:

| Metric | Δ per route, all 9 routes | Share of that route's First Load JS |
|---|---|---|
| raw | **+103192 B** (`+103.2 kB`), **identical to the byte on all nine** | ~16% |
| gzip (level 9) | **+40.55 kB** (spread 3 B) | **~20–21%** |
| Brotli (Node default) | **+35.71 kB** (spread 22 B) | **~20–22%** |

Uniform on every route, chunk count −2 everywhere, and `A` vs `A-rerun` differ by **exactly zero** —
so this is the shared chunk pair, measured, not noise. What the live server negotiates is a
production fact nobody here may fetch, so the decision below is taken against **gzip +40.6 kB as the
pessimistic bound and Brotli +35.7 kB as the optimistic one** — never one guessed number.

**DECISION: the antd provider STAYS in the root layout. Scoping it below root — the route group over
the app surfaces, `/` and `/about` left antd-free — is REJECTED.** Nothing is reverted, nothing moves,
TASK-003 stands exactly as shipped, and TASK-004…010 are written against the root-layout provider.

Why, given that the saving is real:

1. 🔴 **`Navbar` and `Footer` render in the ROOT layout, outside `{children}`, on every route** —
   including `/` and `/about` (read in `front/src/app/layout.tsx`, 2026-09-09). Scoping the provider
   below root puts both **outside** `AntdRegistry` and `ConfigProvider`. The first time either uses
   one antd component — a mobile-nav `Drawer`, a user `Dropdown`/`Avatar`, both entirely natural on
   this Navbar — the provider returns to root and the split is dead, having cost two refactors and a
   re-verification of seven screens. **That prior decision does not exist yet, and it is not mine to
   pre-empt inside a bundle-size call.**
2. **For anyone who enters an app surface this is a deferral, not a reduction.** The same chunk loads
   on the first app-route navigation, and Next prefetches in-viewport links — a login link in the
   Navbar starts pulling it shortly after `/` loads anyway. The genuine win is narrow and worth
   naming honestly: the **first paint** of `/` and `/about`, and visitors who never enter an app
   surface at all.
3. **Worst evidence-to-risk ratio we have.** It is a change with *no visible effect* that can
   nonetheless break SSR style extraction on seven screens, on a site that serves real users, with
   **no QA role** — verification would be our own eyes claiming that nothing changed. REQ-001 §Out of
   Scope also forbids a redesign, and every per-screen TASK is meant to be independently checkable by
   the owner. A silent structural move is the opposite of that.
4. The "it is cheapest now" argument is real and is rejected **on its own terms**: it is cheapest now
   only if the eventual answer is "scope". Point 1 says that answer is not available yet.
5. Today the cost buys nothing at all — **zero screens use an antd component** (nothing imports the
   two `ui/` wrappers, re-checked 2026-09-09). That is temporary **by plan**, not a defect: it
   resolves as TASK-004…010 land. It is not an argument for restructuring; it is an argument for
   getting on with the screens.

**Re-open trigger — both conditions, or not at all.** Nobody re-opens this on the numbers in this
file; re-measure with TASK-019's own instrument first.

- (a) `Navbar` and `Footer` are ruled **antd-free in writing**, in whichever SPEC migrates them; **and**
- (b) after TASK-004…010 land, `/` and `/about` still carry the full delta and their First Load JS is
  still **≥ ~130 kB Brotli**, i.e. the ~36 kB is still worth ≥20% of the page.

**Standing constraint this measurement established, binding on every future SPEC here:** anything
mounted in the root layout is paid for by `/` and `/about` too. `Navbar`/`Footer` sit there, so a
component library reaching either of them is a whole-site cost — decide it deliberately, never
"while I was in there".

**No owner gate.** This is a technical call reserved to me (REQ-001 C2; the owner approved the
library, not its mounting point), it changes nothing he can see, and it is not carried to him.

## ~~Decision 7 — how "the look does not change" is achieved: **the `ui/` wrapper's DEFAULT look IS today's look**~~ 🔴 **STRUCK 2026-09-09 (Sober) — its premise was a misread ruling; see §Decision 8**

> 🔴 **STRUCK IN WHOLE, 2026-09-09, by me, the same day I wrote it.** Every line below is kept
> verbatim as the record — nothing here is actionable any more, and no TASK may cite it.
>
> **Why.** This decision's single premise is the first line of its own text: *"Forced by the owner's
> ruling `SYSTEM-FACTS.md` A41 … the answer is (b) preserve today's look."* **A41 is struck.** It was
> Porter's misreading of the owner, and the owner corrected it himself the next message —
> **`SYSTEM-FACTS.md` A42**, verbatim: *"re UI ไม่ได้หมายถึง ให้ ย้อนเป็น หน้าตาเดิม หมายถึงให้ทำ
> หน้าตาใหม่ให้ดีขึ้น และ แค่ เอา emojiออก ใช้icon"*. **TASK-004 §Questions Q1 option (b) is NOT his
> answer.** A rework whose purpose is visual restoration is not what he asked for, so "the wrapper's
> default look IS today's look" — a rule I wrote to bind **all seven** screens — has nothing behind
> it. It goes now, before TASK-005…010 copy it.
>
> **Attributed, by name: the defect chain is two mistakes, both ours, neither Fern's.** Porter's was
> reading "re UI" as option (b) (he attributed it himself in A41's strike-through). **Mine was
> building a seven-screen mechanism on that reading inside one session, and shipping it to an
> engineer as a `REWORK` before the reading had been back to the owner once.** Fern implemented
> exactly what she was told, twice, and flagged the collision both times.
>
> **What is NOT struck with it, so nobody over-reverts:** §Decision 3's finding that dropping "the
> classes antd now owns" silently changes the look **is a real finding and stands** — the classes did
> carry the look, and a screen TASK that only says what to delete is still a defective TASK. What is
> struck is the *answer* I gave (restore the legacy recipe as the wrapper default), not the
> *observation* that the question must be answered. §Decision 8 says who answers it and when.
>
> Also **not** struck, and carried into §Decision 8 unchanged because A42 does not touch them: the
> standing constraint that nothing goes in the root layout / `AntdConfigProvider` /
> `theme-tokens.ts`; the rule that a look no wrapper case covers is a question to me and never a
> class on a page; and the accepted dev-only `[antd: App] … cssVar` warning recorded at the end of
> this section (TASK-004 §Q4 — still accepted, still not to be re-litigated per screen).

Forced by the owner's ruling **`SYSTEM-FACTS.md` A41** — *"re UI เอง และ แค่ เอา emojiออก ใช้icon"*
— read against `tasks/TASK-004…md` §Questions Q1: the answer is **(b) preserve today's look**, and
it binds **all seven** SPEC-001 screens. Porter recorded the ruling and, correctly, **no mechanism**;
the mechanism is mine and is this decision.

**This is a correction to §Decision 3 as TASK-004 applied it.** §Decision 3 said "drop the classes
the antd component now owns" — but those classes were carrying the *look*, and dropping them
changed it. On `/login` that showed up as **six** controls, not the three TASK-004's author (Fern)
measured: inputs 50→40 px, submit ≈50→32 px **and its `sky-600 → cyan-600` gradient replaced by a
flat antd primary**, social buttons ≈50→40 px, the resend button's translucent-red `rounded-md`
`text-sm` look replaced by antd `danger`, and the `จดจำฉัน` native checkbox replaced by antd's own
box at `colorPrimary` `#0EA5E9` instead of `sky-600`.

**The rule, binding on every screen TASK from here:**

- The legacy Tailwind recipe **moves into the `ui/` wrapper**, with the `!` suffix where antd wins
  the specificity fight (FRONTEND-CONVENTIONS.md §2). The wrapper's *default* render is the look
  the screen has today.
- **No page-level override**, no new `variant` prop, **and nothing in `AntdConfigProvider` /
  `constants/theme-tokens.ts` / the root layout.** The last one is the standing constraint from
  §Decision 6 §CLOSED: a root-layout change is paid for by `/` and `/about` too.
- Where one antd component must serve several looks, they are keyed off the **antd props the page
  already passes** (`type="primary"` / `danger` / neither), so pages stay clean and there is one
  source of truth for height and colour.
- **A look that none of the wrapper's cases covers is a question to me** — never a class on a page
  and never a silent second recipe. The set of cases is not frozen; it grows by my ruling.
- Two things `ConfigProvider` tokens cannot do, which is why they are not the mechanism: they
  cannot express a **gradient**, and they are a **whole-site** change.

**Editing a wrapper created by an earlier `DONE` TASK is allowed** when a later screen TASK
authorises it in writing — TASK-004's rework carries that authorisation for `ui/Button`, `ui/Input`
and `ui/Checkbox`. As of 2026-09-09 `/login` is the **only** consumer of all three (`grep -rn` over
`front/src`, run by me), which is what makes this surgical rather than site-wide; once more screens
consume them, a wrapper change is a cross-screen change and gets its own TASK.

**Known, accepted, dev-only warning (TASK-004 §Questions Q4 — do not re-litigate it per screen):**
mounting `<App component={false}>` inside a partial makes antd log
`Warning: [antd: App] When using cssVar, ensure "component" is assigned a valid React component
string.` once per load. It was **measured harmless**: the message holder carries
`ant-message-css-var` and the toast computes themed dark colours. `component={false}` is kept —
`component="div"` reintroduces the wrapper `div` the local mount exists to avoid, for no measured
gain. If it ever produces a real symptom (an untinted toast/modal), that is a new question to
Sober, not a silent fix.

## Decision 8 — replaces the struck §Decision 7: **the wrapper's default look is NOT mine to fix today; it is HELD until REQ-001 §Q7 is answered** (2026-09-09, Sober)

Source of authority: **`SYSTEM-FACTS.md` A42** (owner, 2026-09-09) — the correction that struck A41.

**What A42 settles, and I therefore rule now:**

1. **"Restore today's look" is dead as a design rule.** No SPEC, TASK or wrapper in this project may
   take "make it look as it did" as its goal. The new appearance the antd substrate brings is **not
   a defect to be undone** — that is the owner's word, not my reading.
2. **emoji → icons stands** (REQ-001 §Requirement 3; he has now said it three times). Everything
   TASK-004 did under that heading is untouched by all of this and is not re-opened.
3. **The look MAY change, and he wants it changed for the better** — "ทำหน้าตาใหม่ให้ดีขึ้น".

**What A42 does NOT settle, and I will NOT fill in — this is the whole point of this decision:**
*how far* "ให้ดีขึ้น" goes. Porter has asked it as **REQ-001 §Questions Q7**: (ก) antd's own default
appearance already IS "better", or (ข) a deliberate visual-improvement pass he wants to see on
`/login` first. **Both answers are live and they demand opposite code.** Under (ก) the legacy recipes
now sitting in `ui/{Button,Input,Checkbox}` are reverted to antd defaults; under (ข) they are the
starting point for a pass whose target nobody has described yet. Picking one would be me inventing
the owner's visual intent — the exact class of mistake that produced A41 and this section.

**So, held. Concretely, and binding until Q7 is answered:**

- **No code is reverted and no code is added on my word today.** `tasks/TASK-004…md` is
  **`BLOCKED (waiting: Porter → owner — REQ-001 §Q7)`**, not `DONE` and not a second `REWORK`; the
  reasons are in that file's §Review addendum.
- **TASK-005…010 stay unwritten.** They were already gated on TASK-004 landing; they are now gated on
  Q7 as well, because every one of them would have to state a wrapper default.
- **No wrapper's default look changes** in the meantime, by anyone, for any screen.
- Carried over from the struck §Decision 7 and still binding: **nothing in the root layout /
  `AntdConfigProvider` / `constants/theme-tokens.ts`** (the §Decision 6 §CLOSED standing constraint);
  **no page-level look override and no new `variant` prop invented by an engineer** — a look no
  wrapper case covers is a question to me; and the **accepted dev-only** `[antd: App] … cssVar`
  warning stays accepted (TASK-004 §Q4), not re-litigated per screen.

**What each answer to Q7 will trigger — written now so the next hop is mechanical, not a re-think:**

- **Q7 = (ก)** → one FE TASK, bounded to the same four files TASK-004's rework touched: revert
  `ui/{Button,Input,Checkbox}` to antd's defaults (+ only what the screen functionally needs), re-run
  DoD 1–6/8, done. TASK-004's accepted half is not re-opened. Fern's R1a/R5a/R6a all evaporate.
- **Q7 = (ข)** → the improvement target is **user-facing appearance the owner has opinions about**,
  so it is not mine to author from nothing: I write the SPEC only once Porter has something concrete
  from him (which screen, what "better" means to him). It becomes its own REQ/SPEC scope, **not** a
  silent widening of REQ-001 (whose §Out of Scope still reads "visual redesign / rebranding").

**Standing rule I am keeping out of this wreck, because it was right for a different reason:** a
screen TASK must say **what happens to the look** of every control it touches — as an explicit,
stated outcome, not as a side effect of "drop the classes antd now owns". §Decision 7 answered that
question wrongly; the requirement to answer it survives.

## Decision 9 — **A43 applied**: the hold is LIFTED, the screen order changes, and the LOOK moves to its own SPEC (2026-09-09, Sober)

Source of authority: **`SYSTEM-FACTS.md` A43** (owner, 2026-09-09) — the answer to REQ-001 §Q7.
**Q7 = (ข)**: a deliberate visual-improvement pass; criteria **ระยะห่าง (spacing) + สี (colour),
โมเดิร์น (modern)**; **the home page first, the courses page second, both seen by him before the
other screens copy the result**. He did not take Q7's proposed `/login` as the first screen.

§Decision 8 held the wrapper default look **"until Q7 is answered"**. It is answered. The hold is
lifted, and §Decision 8's own (ข) branch fires: *"I write the SPEC only once Porter has something
concrete from him (which screen, what 'better' means to him). It becomes its own REQ/SPEC scope."*
Porter has now delivered both. That SPEC is **`specs/SPEC-006-visual-improvement-pass.md`**.

**1. Where the LOOK now lives.** SPEC-001 owns the **substrate** — folder pattern, antd wrappers,
lucide icons, the theme bridge. **SPEC-006 owns the appearance.** They meet **one screen at a time**:
a screen's TASK does the migration *and* the visual pass in **one pass over one file**, because
touching a live screen twice is worse than once. No screen's look is authored anywhere else.

**2. The `ui/{Button,Input,Checkbox}` defaults are NOT reverted, and are NOT the reference.** They
carry the legacy recipes Fern implemented under the withdrawn §Decision 7. Reverting them today
would be a change to a live screen made to satisfy a rule that no longer exists — the same reasoning
I used on R6a. They stand as an **interim** state until `/login`'s turn in SPEC-006 Phase 3, when
they are re-authored against the look the owner has by then approved. **Nobody copies them.**

**3. TASK-004 is `DONE`** — see its **§Review addendum, 2026-09-09 (third)**. The reason I withheld
`DONE` was that it would bless the restored legacy look as the reference six screens copy. A43 kills
that risk outright: **the reference is now the home page the owner approves**, not `/login`.

**4. The per-screen order at §"Per-screen migration order" (`login → register → verify-email → / →
courses → teach → classroom`) is SUPERSEDED.** The order is now, per A43:

1. ~~`login`~~ **substrate DONE** (TASK-004); its **look** is revisited in Phase 3.
2. **`/` (home)** — **TASK-005** · 3. **the courses page** — TASK-006, gated on REQ-001 §Q8 (*which*
   courses page) · 4. `register` — TASK-007 · 5. `verify-email` — TASK-008 · 6. `teach` — TASK-009 ·
   7. `classroom/[id]` — TASK-010.

**TASK-005 is therefore the HOME screen, not `/register`.** Every earlier line in this SPEC and in
`inbox/SA.md` that reads "TASK-005 (`/register`)" is superseded by this paragraph. The reserved
004…010 block is unchanged in size; only which screen sits in which slot moved.

**5. TASK-006…010 stay unwritten, and the gate is his eyes, not my judgement.** "ให้ดูก่อน" is an
instruction: TASK-007…010 are not written until the owner has seen `/` **and** the courses page.
TASK-006 additionally needs §Q8 answered. This is the one thing in this decision that is his and not
mine, and I will not shorten it.

**6. Still binding, carried forward unchanged:** nothing in the root layout / `AntdConfigProvider` /
`constants/theme-tokens.ts` (§Decision 6 §CLOSED); no page-level look override and no `variant` prop
invented by an engineer; the accepted dev-only `[antd: App] … cssVar` warning; **no new user-facing
string, ever**; and the rule that survived §Decision 7 — **a screen TASK must state what happens to
the look of every control it touches**. Under SPEC-006 that statement is no longer "unchanged"; it is
the rule number in SPEC-006 §"The design rules" that the control now follows.

## Non-functional

- ~~**No visual redesign** (REQ-001 §Out of Scope). A migrated screen must look and behave as it
  did; the substrate changes, not the design.~~ 🔴 **AMENDED 2026-09-09 (Sober) per `SYSTEM-FACTS.md`
  A42.** The second half is wrong: a migrated screen **need not look as it did**, and the owner has
  said so. REQ-001 §Out of Scope's "visual redesign / rebranding" is Porter's line and still stands
  as written — but it does **not** mean "restore the previous pixels", and no TASK here may read it
  that way again. The live question is §Decision 8 / REQ-001 §Q7.
- **No backend change.** `back/` is untouched by every TASK in this SPEC.
- **Live site.** Nothing here is deployed by an agent. Each TASK's evidence is a local
  `npm run build` + `npm run dev` and what the engineer actually saw, plus the owner's own eyes.
- **`front/src/app/layout.tsx` currently sets `title: "DTE - Disrupt Thai Education"`** — the
  superseded name (`SYSTEM-FACTS.md` A6). The owner has since **cleared the rename** ("เปลี่ยน",
  A17) but stated **neither the exact `<title>` string nor whether the old name's other
  occurrences in `front/` are included** (REQ-001 §Out of Scope, both ⚠️ still open).
  **Sober's call on where it lands (2026-09-07, the call Porter left to me):** it is **its own
  TASK**, not folded into TASK-001 or TASK-002 — a one-line copy change does not belong inside a
  framework upgrade or a folder move, where a rollback would drag it along. That TASK stays
  **unwritten** until the owner gives the exact string; nobody invents user-facing copy, and
  "Develyst The Education" as a bare `<title>` is a guess at formatting, not an instruction.
  It is a DATA REQUEST already on the board, restated to Porter.

## Tasks

- **TASK-001**: Next 15 → 16 + Tailwind 3 → 4 upgrade — owner: FE (Fern) — depends on: none.
  ✅ **TODO since 2026-09-07** — the owner saw the plan and said "รันเลย" (A16). Cleared to run.
- **TASK-002**: Folder-pattern skeleton + `front/FRONTEND-CONVENTIONS.md` + the no-emoji harness
  script — owner: FE (Fern) — depends on: TASK-001. ✅ **DONE — reviewed 2026-09-07 (Sober).**
  *(library-independent by design; deliberately installs no antd)*
- **TASK-003**: Install and wire **Ant Design v6** (`AntdRegistry`, `ConfigProvider`, the
  `themes.css` → token bridge, the first `components/ui/<Name>/` wrappers) — owner: FE —
  depends on: TASK-002. ✅ **DONE — reviewed 2026-09-08 (Sober); no rework.** Bridge measured
  live in both themes; the two escalations it raised are answered in that TASK's §Questions
  (`cssVar` **closed** — v6's default is kept; the shared-chunk cost → **Decision 6**, now
  **CLOSED 2026-09-09**). One `UNVERIFIED` carried: the compressed First Load JS delta.
  `tasks/TASK-003-antd-install-and-theme-bridge.md`. Scope as written: exact pins
  `antd@6.4.3` + `@ant-design/nextjs-registry@1.3.0` and **no other dependency**;
  `constants/theme-tokens.ts` as a mirror of `themes.css` with a grep drift-guard;
  `contexts/AntdConfigProvider.tsx` inside `ThemeProvider`; **exactly two** wrappers
  (`ui/Button`, `ui/Input`) and **no `ui/` root barrel**; a throwaway `/dev-antd-check` probe
  that is deleted before the task closes. Deferred by design and named in the TASK: antd
  `locale` + `dayjs` (decided by the first TASK using a locale-sensitive component) and
  `cssVar`. TASK-002's deferred `/` bundle-weight measurement is folded in as BEFORE/AFTER
  route tables.
- **TASK-019**: measure the antd shared-chunk cost **compressed** (gzip + Brotli), A/B on today's
  tree — owner: FE (Fern) — depends on: none. ✅ **DONE — reviewed 2026-09-09 (Sober); no rework.**
  Δ **+103192 B raw / +40.55 kB gzip / +35.71 kB Brotli**, uniform on all 9 routes. **§Decision 6 is
  now CLOSED on those numbers: the provider stays in the root layout.**
  `tasks/TASK-019-antd-shared-chunk-compressed-measurement.md`.
  *(Numbered 019, not 004: 004…010 stay reserved for the per-screen units below.)*
- **TASK-004**: migrate the **`/login`** screen — owner: FE (Fern) — depends on: TASK-003.
  ✅ **WRITTEN 2026-09-09 (Sober), status `TODO`.** Written against the **root-layout** provider
  (§Decision 6 §CLOSED); no route group. `tasks/TASK-004-login-screen-migration.md`. Scope as
  written: page → `components/partials/Login/`, primitives → `ui/Button`/`ui/Input` + a new
  `ui/Checkbox` wrapper, the 4 harness-flagged emoji **plus a 5th the harness misses** → lucide
  icons + antd `message`, and the hand-rolled spinner SVG → `BaseButton loading`.
  **Three calls taken in the TASK and binding on the later screens until I say otherwise:**
  - **(a) antd `Form`/`rules` is NOT introduced yet.** Each rule needs a Thai validation message
    and **nobody invents user-facing copy**; antd's own defaults are English, and turning them
    Thai means setting `locale`, which §Decision 3 reserves to me. This is a **correction to the
    per-screen rationale above** ("auth screens exercise Form + validation hardest") — that half
    is deferred, not delivered, until the owner gives the strings. → REQ-001 §Questions Q5 (Sober
    → Porter, 2026-09-09).
  - **(b) the `services/api.ts` carve-out does NOT happen per §Decision 4's letter here.**
    `/login`'s slice *is* the auth slice, and it is shared by `contexts/AuthContext.tsx`,
    `/register` and `/verify-email` — carving it at the first screen edits three files that TASK
    cannot verify, on a live site. It becomes **its own TASK, written after the three auth screens
    land**. §Decision 4's "carved per screen" stands for slices that are genuinely one screen's.
  - **(c) antd `App` (for `message`) is mounted LOCALLY in the partial, `component={false}`,
    never in the root layout** — the standing constraint from §Decision 6 §CLOSED.
- **TASK-005…010**: one per screen, in the order above — owner: FE — each depends on TASK-003.
  🔴 **SUPERSEDED 2026-09-09 — see §Decision 9.** TASK-005 is the **HOME** screen (written 2026-09-09); TASK-006 is the courses page (gated on REQ-001 §Q8); TASK-007…010 are `register`, `verify-email`, `teach`, `classroom/[id]` and are **not written until the owner has seen `/` and the courses page**.
  🚫 **Not written yet.**

> 🔎 **Harness gap found 2026-09-09 (Sober), recorded not fixed:** `⏳` **U+23F3** is a plain
> emoji that `check-no-emoji.mjs` does **not** flag — U+23F3 is outside the ranges this SPEC fixed
> (`U+1F000–1FAFF`, `U+2600–27BF`, `U+2B00–2BFF`, `U+FE0F`). There is one in
> `app/login/page.tsx:107`. The ranges are **not widened in TASK-004**: the harness's
> `124-occurrence / 2026-09-07` baseline is cited in TASK-002/003/014/018 reviews, and moving it
> mid-flight invalidates them. TASK-004 removes the character by an explicit named grep instead.
> Widening the ranges + re-baselining is its own small unit, mine, after the auth screens.
- ~~**TASK-0NN (page-`<title>` rename)**~~: **SUPERSEDED 2026-09-08 — moved out of this SPEC.**
  The owner answered both open parts (exact string A19, scope A20/A21/A22), the rename turned out
  to reach `back/` too, and it now lives in **REQ-004 → `specs/SPEC-002-product-name-rename.md`**
  (TASK-011 FE, TASK-012 BE). Nothing in SPEC-001 depends on it.

Session record: TASK-001 was written 2026-09-07 (session A) and unblocked the same day
(session B). TASK-002 was written in session B. TASK-003 was written 2026-09-07, run by Fern the
same day, and reviewed DONE 2026-09-08. TASK-019 was written, run and reviewed `DONE` on 2026-09-09,
and **§Decision 6 closed the same day**. TASK-004 (`/login`) was written 2026-09-09, run by Fern,
reviewed `REWORK` by me the same day on the struck A41, and **the rework was run**. 🔴 **As of
2026-09-09 TASK-004 is `BLOCKED (waiting: Porter → owner — REQ-001 §Q7)`**: A42 struck the ruling my
`REWORK` rested on, so §Decision 7 is struck and **§Decision 8** holds the wrapper's default look
until Q7 is answered. **TASK-005 (`/register`) stays unwritten** — it was gated on TASK-004 landing
and is now gated on Q7 too, because it would have to state a wrapper default.

## Questions

- **Q1 → Porter → the owner (the C5(a) gate).** Ant Design v6 is proposed above with rationale,
  runner-up HeroUI. Does he approve antd? *(Nothing is migrated until he answers.)*
  > answer (Porter, 2026-09-07, `SYSTEM-FACTS.md` A15): **"antd"** — approved. Gate closed.
  > The approval is of the library only; the screen-by-screen pace (Q2) is unchanged.
- **Q2 → Porter (no owner needed, just a decision recorded).** The house pattern also mandates
  **NextAuth 4** and **React Query**. This SPEC deliberately does **not** adopt either under
  REQ-001 (Decision 4), because both are architecture changes rather than folder structure, and
  one of them touches `back/`. Porter should know that C1 is being applied to the *folder
  pattern* and not to the pattern's auth/data-fetching stack, in case the owner reads "ใช้ skill
  nextjs pattern generator" more broadly than I have.
- **Q3 → Porter (finding, not a request).** `layout.tsx` ships the superseded product name in the
  page `<title>`. Fixing user-facing copy needs the owner's word; it is not done here.
