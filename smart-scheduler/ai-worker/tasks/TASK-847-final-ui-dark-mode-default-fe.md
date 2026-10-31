# TASK-847 — FE: **final UI opens in DARK mode by default** (REQ-133, owner 2026-10-27) — @Fern (≈ 0.3 d)
**From @Sober to @Fern, 2026-10-27. GO now.** Owner, verbatim (via Porter, inbox/SA.md 2026-10-27): *"where the dark theme? backoffice start with dark mode first"*.
**Folder:** `som-balance-backoffice-spec/final-ui/` (shell = Team A's). No git; no smart-scheduler repo touched.

## What I found (so you don't have to look)
- `src/shell/App.tsx:32` has `defaultColorScheme="light"`. That is the only switch.
- **Pages use plain Mantine**, which follows the scheme by itself. A grep of all of `src` finds **no hard-coded colours** in any page (Team A or B).
- **The light-only parts are the Tailwind tokens** the layout copied from the front: `bg-paper` (`Layout.tsx:121`), `text-muted-400/500/600`, `border-muted-200`, `bg-muted-100` (14 uses, `tailwind.config.ts`). These don't flip with Mantine.

## Build
1. **Default dark:** `defaultColorScheme="dark"`.
   - A viewer's own choice, once made, is remembered (`localStorage`, every access in try/catch).
   - Mantine's `colorSchemeManager` does this.
   - **First open with nothing stored = dark.**
2. **A light / dark toggle in the header**, next to the role switcher: an `ActionIcon` with lucide `Moon` / `Sun` and an `aria-label`.
3. **The Tailwind tokens follow the scheme:**
   - set `darkMode: ["selector", '[data-mantine-color-scheme="dark"]']` in `tailwind.config.ts`;
   - give `paper` / `muted-*` dark values, or move those few spots to Mantine CSS variables (`var(--mantine-color-body)`, `--mantine-color-dimmed`, `--mantine-color-default-border`).
   - **Either way, no light patch may remain in dark.**
4. **Readable in dark, every page × every role:**
   - tables, the status badges (CONFIRMED / PENDING / DRAFT / AUTO-LOCKED), Team B's charts (`@mantine/charts` follows the scheme by itself; check the colours still read);
   - dialogs, drawers, the date picker, notifications, the role switcher, the "cannot see" screen, the หน้าบ้าน label.
   - Team B's pages are theirs to fix if one breaks. **Tell me which; don't edit them.**

## Done = (report in `inbox/SA.md`)
- tsc 0 · build 0.
- **First open (empty `localStorage`) = dark**; the toggle switches both ways, and a reload keeps the choice.
- **Your crawl of all 31 pages × 3 roles in DARK:** 0 console errors / warnings, and a contrast check, e.g. no element whose text colour ≈ its background. **List any Team B page that looks wrong.**
- **A 5-shot set at 1600 × 900, DARK, as CEO:** Monthly Payment, Revenue Summary, STOCK OUT, Branch for booking, Role Setting. Put them in `final-ui/shots-dark/`. The deck will swap to them later, and Jason's deck is on hold until then.
- The dist size + md5.
