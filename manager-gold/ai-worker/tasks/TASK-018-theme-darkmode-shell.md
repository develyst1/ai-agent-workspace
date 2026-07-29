# TASK-018: Theme foundation + dark mode + AppShell
- Source: SPEC-005
- Status: DONE
- Assignee: Fern (FE)
- Depends on: none

## What to do
In `manager-gold-front`, establish the redesign foundation (no per-screen restyle yet — that's
TASK-019/020):
- **Theme:** a single `createTheme({...})` (one `primaryColor`, `defaultRadius`, heading scale +
  font stack, spacing, light Button/Input/Card defaults) passed to `MantineProvider` in `app/layout.tsx`.
  Minimal + consistent — Mantine tokens, no bespoke design system.
- **Dark mode:** add a light/dark toggle in the header (`useMantineColorScheme().setColorScheme`);
  set `MantineProvider defaultColorScheme` and rely on Mantine's built-in localStorage persistence
  (`ColorSchemeScript` is already in the layout → no flash). Both modes must look right.
- **Header/shell:** convert the app to Mantine **`AppShell`** (header + content). The header shows the
  app name, the color-scheme toggle, and the existing signed-in user + Log out (`AppHeader`). Keep the
  `AuthProvider`/`AuthGate` wiring intact.
- Responsive: header wraps and content uses a sensible `Container` at mobile width.

Change theme/shell only — do not restyle individual screens or change any behaviour/API calls.

## Definition of Done
- [x] `createTheme` (`lib/theme.ts`) applied via `MantineProvider`; app renders with it —
      `--mantine-primary-color-filled` = `#3b5bdb` (indigo) confirmed in the browser.
- [x] Light/dark toggle in the header works (light `#fff` → dark `rgb(36,36,36)`); choice
      **persists across reload** (`localStorage mantine-color-scheme-value=dark`, still dark after
      reload); no flash (`ColorSchemeScript` pre-paint); both legible — dark card `rgb(46,46,46)` +
      body text `rgb(201,201,201)`, `.mg-md` inner `--default-hover=#3b3b3b` (dark).
- [x] Header is an `AppShell` header with app name + toggle + user/logout; guard works
      (clicked Log out → redirected to `/login`).
- [x] No horizontal scroll at 375px (`scrollWidth == clientWidth == 375`); header intact.
- [x] `bun run build` clean; no behaviour change (auth/list/guard all still work). Walkthrough below.

## Implementation Notes
Implemented by Fern, 2026-07-29 in `manager-gold-front` (branch `dong`, commit `5c8d86a`).
Design discipline: product register, restrained color (one accent), system font (no new dep),
legible in both modes, no AI-slop.

**Files:**
- `lib/theme.ts` (new) — one `createTheme`: `primaryColor: "indigo"`, `defaultRadius: "md"`,
  system font stack + mono, `headings.fontWeight: 600`, `Card` default `withBorder`. Mantine tokens only.
- `app/layout.tsx` (mod) — `MantineProvider theme={theme} defaultColorScheme="light"`;
  `ColorSchemeScript defaultColorScheme="light"`; renders `<Shell>` inside `AuthProvider`.
- `components/Shell.tsx` (new) — client boundary holding Mantine **`AppShell`** (header 56 + `Main`
  with a `Container size="sm"`), wrapping `AuthGate`. (AppShell needs client context — composing it in
  the RSC server layout errored on prerender; the client boundary is the standard fix.)
- `components/AppHeader.tsx` (mod) — AppShell header content: brand dot + name, a **light/dark toggle**
  (`useMantineColorScheme().setColorScheme` + `useComputedColorScheme`, inline sun/moon SVG — no icon
  dep), and the existing user + Log out; email hidden on very narrow width (`visibleFrom="xs"`).

**Verification (evidence) — my own backend on :4020 + real browser on :3020 (§7):**
- Theme applied: primary var `#3b5bdb` (indigo). AppShell header shows name + toggle + user + Log out.
- Toggle: light (body `#fff`) → dark (`rgb(36,36,36)`), `localStorage` set to `dark`. **Reload → stays
  dark** (persist); `ColorSchemeScript` handles pre-paint (no flash).
- Legible in dark: card `rgb(46,46,46)`, text `rgb(201,201,201)`; `.mg-md` inner bg var `#3b3b3b`.
- Mobile 375px: `scrollWidth == clientWidth`, **no horizontal scroll**; header intact.
- Guard: Log out → redirected to `/login` (AuthGate untouched). `bun run build` clean.
- Ports free pre-launch (mine); stopped my own instances — released.

**⚠️ One console note for Sober (honest):** in the **dev** server React 19 logs
*"Encountered a script tag while rendering React component…"* — its source is **Mantine's
`ColorSchemeScript`** (the inline pre-paint script that gives us no-flash; the two head scripts are
its `try { localStorage.getItem("mantine-color-scheme-value") … }`). It's a React-19 dev-only warning
about inline scripts (Strict-Mode double-render duplicates the tag in dev); it does **not** fire in a
production build, and the color-scheme feature works (no-flash + persist + toggle all verified). It's
from Mantine's required component, not the redesign code, and pre-dates this task (ColorSchemeScript
has been in the layout since TASK-002). I did **not** remove the script (that would reintroduce the
flash). Flagging for a quick production-console confirm at deploy time; not a functional defect.

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE** — Sober, 2026-07-29 (commit `5c8d86a` on `dong`). Read `lib/theme.ts`,
`app/layout.tsx`, `components/Shell.tsx`, `components/AppHeader.tsx`:
- Minimal `createTheme` (indigo, radius md, system font stack — no new dep, Card defaults) applied via
  `MantineProvider`. Clean, tokens-only.
- Dark toggle (`useMantineColorScheme`/`useComputedColorScheme`, inline SVG icons) works + persists
  (`localStorage`), no flash (`ColorSchemeScript`), dark legible incl. the `.mg-md` AI cards — all with
  concrete browser evidence.
- `AppShell` correctly isolated in a client boundary (`Shell.tsx`) with `AuthProvider` above and
  `AuthGate` intact; logout→/login still works; no horizontal scroll at 375px. Build clean; no behaviour change.
- **Accepted framework note:** the React-19 dev-console "script tag" warning comes from Mantine's
  `ColorSchemeScript` (the required no-flash inline script) — dev-only, not in prod builds; Fern rightly
  did NOT remove it (that would reintroduce the flash). Confirm clean in the prod console at deploy — not
  a defect, and pre-dates this task.

DoD: all 5 met. → TASK-019 + TASK-020 (screen restyle) are ready.

**Note for TASK-019/020 (Fern):** `Shell` now wraps content in one `<Container size="sm">`. When
restyling, drop the pages' own inner `<Container>`/`<Paper mx="auto">` wrappers where they'd double up
(avoid nested containers / double padding) — align page width to the shell container.
