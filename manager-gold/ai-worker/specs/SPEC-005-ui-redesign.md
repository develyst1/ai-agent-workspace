# SPEC-005: UI/UX redesign — clean, minimal, modern (+ dark mode)
- Source: REQ-005
- Status: DONE (TASK-018/019/020 accepted 2026-07-29; criteria 1–4 met → REQ-005 SPEC_DONE, pending Porter's stakeholder visual sign-off = criterion 5)
- Baseline: `../architecture-baseline.md`. FE-only; stays on Mantine.

## Overview
A visual/UX pass on the existing app (no new features): a clean, minimal, modern SaaS look on
**Mantine** — one consistent theme (color/typography/spacing), tidy header + screens, a light/dark
toggle that persists, and responsive layout. Every existing flow keeps working.

**Sequencing (SA decision):** do the **redesign (REQ-005) first, then i18n (REQ-007), then AI-language
(REQ-008)** — the REQs allow "redesign then i18n". Redesign stabilizes the markup; REQ-007 then
extracts the (final) strings; REQ-008 threads the selected language into the AI calls. This avoids
merging two REQs into one task (keeps each task → one SPEC) while satisfying the "coordinate" ask.

## Design decisions (Sober — FE owns the exact tokens; stakeholder approves the look)
- **One Mantine theme** via `createTheme` in the layout: a single `primaryColor`, a sensible
  `defaultRadius`, heading scale + font stack, spacing, and light component defaults (Button/Input/
  Card sizes + radius). Keep it minimal — use Mantine tokens, don't build a bespoke design system.
- **Dark mode:** Mantine `ColorSchemeScript` is already in the layout (TASK-002). Add a toggle
  (`useMantineColorScheme().setColorScheme`) in the header; set `MantineProvider defaultColorScheme`
  and rely on Mantine's built-in **localStorage persistence** (no flash — `ColorSchemeScript` handles
  the pre-paint). Both light AND dark must be polished (check contrast, borders, the AI cards' `.mg-md`).
- **Header/shell:** move to Mantine **`AppShell`** (header + content) — app name, the color-scheme
  toggle, and the existing signed-in user + Log out. Minimal, tidy.
- **Responsive:** `Container` sizing, `AppShell` header wraps, forms/cards stack on narrow width;
  verify at mobile width (~375px) — no broken layout, no horizontal scroll.
- Use Mantine components already in play (Card/Paper/Stack/Group/Badge/Button/TextInput/Select/…) —
  restyle via theme + props, not rewrites. Do NOT change behaviour, API calls, or the `<Markdown>`
  component's safety.

## Scope of screens (restyle only)
Auth (login, register) · people list (+ filters/export controls) · PersonForm (create/edit) ·
person profile (fields card, feelings/interactions/tags sections, **advisor + note-summary cards**) ·
loading/empty/error states · header/nav.

## Non-functional
- **No behaviour regressions** — auth, people CRUD, feelings/interactions/tags, search/filter/export,
  AI advice+summary all keep working after the restyle. `bun run build` clean.
- Dark + light both persist across reloads and look finished. Responsive at mobile width.
- FE-only; no backend/API/prompt changes. New deps only if needed for the theme (prefer none).

## Tasks
- TASK-018: FE — theme foundation (`createTheme`) + light/dark toggle (persist) + `AppShell`/header
  restyle + responsive shell (depends: —)
- TASK-019: FE — restyle auth (login/register) + people list (+ filter/export controls) + PersonForm
  to the new theme; responsive; no regression (depends: TASK-018)
- TASK-020: FE — restyle person profile (fields + feelings/interactions/tags + advisor + summary
  cards) + loading/empty/error states; responsive; no regression (depends: TASK-018)

## Acceptance / sign-off
Criteria 1–4 (restyle, dark toggle+persist, responsive, no regression) are engineer-verifiable and
what I review. Criterion 5 — **stakeholder visual sign-off** — is the final gate: after TASK-018–020
land, Porter shows the stakeholder (screenshots or a run) and gets approval before REQ-005 is DELIVERED.

## Questions
(Fern asks here; Sober answers as `> answer: ...`)
