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

## Decision 6 — the antd shared-chunk cost: OPEN, owned by Sober (recorded 2026-09-08)

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

## Non-functional

- **No visual redesign** (REQ-001 §Out of Scope). A migrated screen must look and behave as it
  did; the substrate changes, not the design.
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
  (`cssVar` **closed** — v6's default is kept; the shared-chunk cost → **Decision 6**, open,
  mine). One `UNVERIFIED` carried: the compressed First Load JS delta.
  `tasks/TASK-003-antd-install-and-theme-bridge.md`. Scope as written: exact pins
  `antd@6.4.3` + `@ant-design/nextjs-registry@1.3.0` and **no other dependency**;
  `constants/theme-tokens.ts` as a mirror of `themes.css` with a grep drift-guard;
  `contexts/AntdConfigProvider.tsx` inside `ThemeProvider`; **exactly two** wrappers
  (`ui/Button`, `ui/Input`) and **no `ui/` root barrel**; a throwaway `/dev-antd-check` probe
  that is deleted before the task closes. Deferred by design and named in the TASK: antd
  `locale` + `dayjs` (decided by the first TASK using a locale-sensitive component) and
  `cssVar`. TASK-002's deferred `/` bundle-weight measurement is folded in as BEFORE/AFTER
  route tables.
- **TASK-004…010**: one per screen, in the order above — owner: FE — each depends on TASK-003.
  🚫 **Not written yet.**
- ~~**TASK-0NN (page-`<title>` rename)**~~: **SUPERSEDED 2026-09-08 — moved out of this SPEC.**
  The owner answered both open parts (exact string A19, scope A20/A21/A22), the rename turned out
  to reach `back/` too, and it now lives in **REQ-004 → `specs/SPEC-002-product-name-rename.md`**
  (TASK-011 FE, TASK-012 BE). Nothing in SPEC-001 depends on it.

Session record: TASK-001 was written 2026-09-07 (session A) and unblocked the same day
(session B). TASK-002 was written in session B. TASK-003 was written 2026-09-07, run by Fern the
same day, and reviewed DONE 2026-09-08. Next units, all mine and all still unwritten: the
Decision 6 measurement TASK, and TASK-004 (`/login`, the first screen).

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
