# REQ-009: Fix the color-scheme toggle hydration mismatch (Sun/Moon icon)
- Status: READY_FOR_SA
- Priority: MEDIUM
- Requested: 2026-07-29 by stakeholder (dev@smartalliance.co.th)
- Deadline: none

## Problem / Goal
While using the running app, the stakeholder hit a **React hydration mismatch** in the
header light/dark toggle. When dark mode is **persisted** (localStorage) and the page
reloads, the **server** renders the Moon icon (default light scheme) but the **client**
renders the Sun icon (persisted dark scheme) → `Hydration failed because the server
rendered HTML didn't match the client`. React recovers (regenerates on the client), so
the app still works, but it logs a console error and can flash the wrong icon on load.

A **second** console message also appears — `Encountered a script tag while rendering`
from Mantine's `ColorSchemeScript` (layout.tsx). Per the team's earlier notes this is a
**dev-only React-19 warning** from the required no-flash script and is **not a defect**;
this REQ only asks to **verify** it's absent in a production build.

## Requirement
1. The header color-scheme toggle must **not cause a hydration mismatch**: the Sun/Moon
   icon must render consistently between server and client (e.g. resolve the icon after
   mount / Mantine's `getInitialValueInEffect`, or equivalent) — the toggle keeps working
   and persisting exactly as now.
2. Loading the app with **either** persisted scheme (light or dark) produces **no
   hydration-mismatch console error** and no wrong-icon flash.
3. **Verify** the `ColorSchemeScript` "script tag" message is dev-only and **absent in a
   production build** (`bun run build` + start) — document the result; no code change if
   it's confirmed prod-clean.

## Acceptance Criteria
- [ ] With dark mode persisted, reloading produces NO hydration-mismatch error; the icon
      is correct with no flash.
- [ ] Same clean load with light mode persisted.
- [ ] A production build's console is free of the hydration error; the `ColorSchemeScript`
      message is confirmed dev-only (present in dev, absent in prod) with evidence.

## Constraints
- Frontend only (Next.js + Mantine); the fix lives in the header toggle / color-scheme
  handling (`AppHeader` / `Shell` / `layout.tsx`). No change to the toggle's behaviour
  (still switches + persists). Defect against REQ-005 (TASK-018); REQ-005 stays DELIVERED.

## Out of Scope
- Any other visual/behaviour change.

## Reproduction — CONFIRMED by the stakeholder on current `dong` (2026-07-29, REOPENED)
TASK-026's "does not reproduce / already-mitigated" conclusion was **incorrect**. The
stakeholder restarted the frontend cleanly (`bun run dev` → "Ready in 448ms", **fresh
code, not stale**) and the error **still fires in dev** on `/login` and `/people/:id`.

**Missing repro condition (why TASK-026 missed it):** it only fires when **dark mode is
persisted** — `localStorage["mantine-color-scheme-value"] = "dark"`. With the default
(light) or cleared storage, both sides render the Moon icon → no mismatch. The stakeholder
had dark persisted.

Exact repro:
1. Toggle to dark once (stores `mantine-color-scheme-value=dark`).
2. Reload any page.
3. Console: `Hydration failed …` at `SunIcon` (`components/AppHeader.tsx:19`). Server rendered
   the **Moon** `<path d="M21 12.8…">` (default light), client rendered the **Sun** `<circle>`
   (persisted dark) at the toggle-icon position → divergence.

**Implication:** `useComputedColorScheme("light", { getInitialValueInEffect: true })` is NOT
keeping the icon's first client paint on the default — so the SPEC-009 **"still reproduces"
branch applies**: gate the toggle icon on a `mounted` flag (render the default/placeholder
icon until mounted, then swap post-mount) so SSR and the first client paint are identical.
Verify with **dark persisted** this time (both schemes, dev + prod console clean).

## Questions
(SA Lead asks here; PM answers as `> answer: ...`)
