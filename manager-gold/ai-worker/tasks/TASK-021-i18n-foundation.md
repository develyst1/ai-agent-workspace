# TASK-021: i18n foundation (provider + switcher + catalog)
- Source: SPEC-007
- Status: DONE
- Assignee: Fern (FE)
- Depends on: none

## What to do
In `manager-gold-front`, build the i18n foundation (no full string sweep yet — that's 022/023):
- **Catalog** (`lib/i18n/catalog.ts` or `th.ts`/`en.ts`): a typed message catalog with `th` + `en`,
  grouped by area (`common`, `nav`, `auth`, `people`, `person`, `ai`, `errors`). Seed it with the
  `common`/`nav` strings (app name stays "manager-gold"; brand, Log out, the language + theme labels,
  loading, generic buttons). Both languages must have every seeded key.
- **Provider + hook** (`lib/i18n/index.tsx`): `I18nProvider` holding `lang` (default **`th`**),
  reading/writing `localStorage["mg-lang"]` (`th|en`); `useT()` → `t(key, vars?)` with simple `{var}`
  interpolation and key-fallback (never crash); `useLang()`/`setLang`. Render `th` on first paint,
  apply the stored pref in an effect (avoid a hydration mismatch).
- **Switcher** (`components/LanguageSwitcher.tsx`): a TH/EN control in the `AppShell` header (beside
  the dark toggle) → `setLang` (persists). 
- Wire `I18nProvider` into `app/layout.tsx` and swap the header's own chrome (brand tooltip, Log out)
  to `t()` as the first proof.

## Definition of Done
- [x] First load = **Thai**: `html lang="th"`, header chrome Thai (aria-labels "ภาษา" / "สลับโหมดสีสว่าง/มืด"),
      no stored pref (`localStorage["mg-lang"]` null → default th).
- [x] TH/EN switcher flips the header chrome (→ "Language" / "Toggle color scheme") and **persists across
      reload** (`mg-lang=en`, still en + `html lang="en"` after reload).
- [x] `translate()` interpolates `{var}` and falls back to the key — unit-verified: `"Hi Fern, 3 items"`;
      missing key → `"does.not.exist"` (no crash).
- [x] No hydration-mismatch error (console has only the known ColorSchemeScript dev warning — nothing
      about "hydration"/"did not match"). SSR + first client paint are both `th`.
- [x] `bun run build` clean. Walkthrough below.

## Implementation Notes
Implemented by Fern, 2026-07-29 in `manager-gold-front` (branch `dong`, commit `758c4cd`).
Hand-rolled, no new dep, no URL-locale routing (SPEC-007 allowed either).

**Files:**
- `lib/i18n/catalog.ts` (new) — `en` defines the keys; `th: Record<MsgKey,string>` (type-enforces
  parity). Grouped `common`/`nav` seed. Pure `translate(dict,key,vars)` = `dict[key] ?? key` with
  `{var}` interpolation → testable without React.
- `lib/i18n/index.tsx` (new) — `I18nProvider` (`lang` default **`th`**; reads/writes
  `localStorage["mg-lang"]`; sets `document.documentElement.lang` in an effect), `useT()` → typed
  `t(key,vars)`, `useLang()`.
- `components/LanguageSwitcher.tsx` (new) — TH/EN Mantine `SegmentedControl` in the header → `setLang`.
- `app/layout.tsx` (mod) — `<html lang="th">`; `I18nProvider` wraps `AuthProvider`→`Shell`.
- `components/AppHeader.tsx` (mod) — `LanguageSwitcher` added; Log out + toggle aria-labels via `t()`
  (first proof); user email now hidden below `sm` to fit the switcher on narrow width.

**Verification (evidence):**
- `bun run build` clean. `bun -e` unit check on `translate`: th/en lookup, `{var}` → "Hi Fern, 3 items",
  missing key → "does.not.exist".
- Browser (§7 note below): default load = `html lang="th"`, `mg-lang` null, header aria-labels Thai
  ("ภาษา"/"สลับโหมดสีสว่าง/มืด"). Clicked **EN** → aria-labels "Language"/"Toggle color scheme",
  `mg-lang=en`, `html lang=en`. **Reload → stays en** (persist). Console: only the ColorSchemeScript
  dev warning — **no hydration-mismatch error**.

**§7 note:** `:4020` was **Jason's real (Postgres) backend running** (his TASK-024 in REVIEW) — my mock
hit `EADDRINUSE`, and I left his instance alone. i18n is FE-only, so I verified the translated header
chrome via the `t()`-driven **aria-labels** (Thai default → EN switch → persist), which needs no backend
auth; the visible `Log out` string is wired through `t("common.logout")` and will show for a logged-in
user. Stopped only my own frontend (:3020); did NOT touch :4020.

This is the i18n **foundation** — TASK-022/023 do the full string sweep over auth/list/form and
profile/sections/AI-chrome; axis/enum **values** sent to the API stay canonical English (only labels translate).

## Questions
(Fern asks; Sober answers as `> answer: ...`)

## Review
**Verdict: DONE** — Sober, 2026-07-29 (commit `758c4cd` on `dong`). Read `lib/i18n/catalog.ts`,
`lib/i18n/index.tsx`, `components/LanguageSwitcher.tsx`:
- **Catalog type-enforces parity** — `en` defines the keys, `th: Record<MsgKey,string>` → a missing
  Thai string is a compile error. `translate` is a pure `dict[key] ?? key` + `{var}` interpolation
  (unit-testable, key-fallback never crashes). Good structure for the 022/023 sweep.
- **Default Thai, SSR-safe:** provider defaults `th`, applies the stored pref (`mg-lang`) post-mount →
  server + first client paint both `th` → no hydration mismatch (console clean bar the known
  ColorSchemeScript warning). `setLang` persists; `document.documentElement.lang` tracked.
- Switcher (Mantine `SegmentedControl` TH/EN) in the header; header chrome (Log out, toggle aria-labels)
  through `t()` as the first proof. Build clean; switch + reload-persist verified.
- **§7 discipline (called out):** `:4020` was Jason's real Postgres backend (his TASK-024) — Fern's mock
  hit `EADDRINUSE`, she **left his instance alone** and verified the FE-only i18n via aria-labels. Exactly right.

DoD: all 5 met. → TASK-022 + TASK-023 (string sweep) and TASK-025 (FE AI language) are unblocked.
