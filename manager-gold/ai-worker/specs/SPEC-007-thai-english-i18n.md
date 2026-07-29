# SPEC-007: Thai/English bilingual UI (default Thai)
- Source: REQ-007
- Status: DONE (TASK-021/022/023 accepted 2026-07-29; REQ-007 → SPEC_DONE, pending Porter acceptance)
- Baseline: `../architecture-baseline.md`. FE-only; sits on the (delivered) REQ-005 redesign.

## Overview
Localize all UI **chrome** (labels, buttons, placeholders, errors, empty states, nav) into
**Thai + English**, default **Thai**, with a persistent language switcher. This is done AFTER the
redesign (REQ-005 DELIVERED) so string extraction is a clean sweep over settled markup.
**Out of scope:** the AI-generated advice/summary **content** language — that's REQ-008 (this SPEC
translates the AI panels' labels/buttons/error text only, not the model output).

## Design decisions (Sober; FE owns the exact keys/copy)
- **Lightweight typed i18n (no routing locales needed — the app is client-rendered):** a small
  `I18nProvider` + `useT()` hook over a typed message **catalog** (`th` + `en`), with simple
  `{var}` interpolation (e.g. counts). Keep it minimal — a maintained lib (`react-i18next`) is
  acceptable if Fern prefers, but do NOT add URL-locale routing.
- **Default Thai:** provider defaults to `th`; on mount it reads the stored preference
  (`localStorage["mg-lang"]` → `th|en`) and applies it. Render `th` on first paint to avoid a
  hydration mismatch; a stored `en` applies just after mount (acceptable brief flash for non-default).
- **Switcher:** a TH/EN control in the `AppShell` header (beside the dark-mode toggle); `setLang`
  persists to `localStorage`. Choice survives reload.
- **Catalog structure:** grouped by area (`common`, `nav`, `auth`, `people`, `person`, `ai`,
  `errors`) so it's easy to maintain/extend. Keys are stable identifiers; both `th` and `en` must
  have every key. `t("missing.key")` falls back to the key (visible in dev, never a crash).
- **Coverage rule:** no hardcoded user-facing string left in the screen components on the main
  flows — every label/button/placeholder/error/empty-state goes through `t()`.

## Scope of screens
Header/nav · auth (login, register + `AuthCard`) · people list (+ filters/export, states) ·
`PersonForm` (labels, axis Select option labels?, buttons) · person profile (fields labels,
feelings/interactions/tags sections) · AI panels (advisor + summary **labels/buttons/error/no-notes
text** — NOT the generated content).

> Axis **values** (reason/emotion/…) are stored data, not UI chrome — their **display labels** may be
> translated in the Select, but the stored value stays the canonical English token (don't translate
> what's persisted/validated). Fern: translate the label shown, keep the value sent to the API.

## Non-functional
- Default Thai on first load across all screens; switch flips **all** chrome; persists across reload.
- No behaviour/API changes; the axis/enum **values** sent to the backend are unchanged.
- `bun run build` clean. FE-only.

## Tasks
- TASK-021: FE — i18n foundation: `I18nProvider` + `useT` + typed `th`/`en` catalog scaffold +
  `LanguageSwitcher` in the header (default Thai, persist); wire common/nav strings (depends: —)
- TASK-022: FE — translate auth + people list + `PersonForm` strings into the catalog (depends: TASK-021)
- TASK-023: FE — translate person profile + feelings/interactions/tags + AI panel labels/buttons/
  error/empty states into the catalog (NOT the AI content) (depends: TASK-021)

## Questions
- **Note (non-blocking):** Thai copy will be **engineer-drafted** (Fern). If the stakeholder wants
  wording refinements, that's a minor copy-tweak follow-up, not a gate. Flagging so Porter can offer
  the stakeholder a copy pass if they want one.
  (Fern asks further here; Sober answers as `> answer: ...`)
