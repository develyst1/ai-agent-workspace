# TASK-009: FE — hire button on result page + `/admin` hire-requests page
- Source: SPEC-005
- Owner: FE (Fern)
- Status: DONE
- Depends on: TASK-006, TASK-008

## What to do
Read SPEC-005 §API/§Flow first. Build on the TASK-013 dark theme (SPEC-008 §Pages 4 hire slot, §8 admin).
0. **Lazy-load the email auth block** on the landing (`next/dynamic`, below the fold) — TASK-013 Q-1 (c); paste the Lighthouse mobile score after.
1. `services/hire-requests.service.ts` + hooks: `useCreateHireRequest(ideaId)`, `useAdminHireRequests()`, `useSetContacted()`.
2. Result page: replace TASK-006's placeholder slot — W-1 button (REQ-004 wording) when `!idea.hireRequested`; on 201 **or** 409 show W-2 once (interpolate `{email}` from `AuthContext.user.email`, `{discount}` = `{discountPercentAtRequest}%`) then W-3 disabled; invalidate the idea query.
3. `app/admin/page.tsx`: rendered only when `user.isAdmin`; otherwise the app's not-found page (never a "forbidden"). **No link to it anywhere in the UI** (REQ-004 AC-6). Ant Design `Table`: date `DD/MMM/YY HH:mm`, name, email, idea preview (120 chars) with expand row → full text, three scores (`tabular-nums`), idea tier, user tier at request + discount, contacted state with a toggle (`Switch` or button) → PATCH → row refresh. Empty state per REQ-004 wording. Optional: "steps" drawer via `GET /admin/ideas/:id/steps`.
4. All strings TH/EN via dictionaries; `FRONTEND-STANDARD.md` §2 table rules (no truncation, sticky first column at 375 px) + §3 gate.

## Definition of Done
- [ ] Screenshots: result page before/after pressing W-1 (TH + EN), W-2 text with real email + discount; reload shows W-3.
- [ ] `/admin` as the owner's account: list with ≥ 1 row, expanded row, contacted toggled and kept after reload — screenshots (or `UNVERIFIED — needs the owner's Google account`; then Tanya/owner prove it).
- [ ] `/admin` as a normal user → not-found; header/nav contains no admin link — screenshot + `grep -rn "/admin" components/ app/` output.
- [ ] `pnpm build` clean; `hallmark audit` on `/admin` — paste.

## Implementation Notes

(Fern, 2026-09-23)

**Files changed (possibility-front):**
- `src/components/partials/Landing/LandingContent.tsx` — item 0: `EmailAuthBlock` now via `next/dynamic` (`ssr: false`), split out of the landing bundle.
- `src/types/api/main/hire-requests.ts` — NEW: `HireRequest`, `AdminHireRequest`, `IdeaStep`, response envelopes (SPEC-005 §Shapes, read from the BE route DTOs, not guessed).
- `src/lib/api/api-main.ts` — `postHireRequestApi`, `getAdminHireRequestsApi`, `patchAdminHireRequestApi`, `getAdminIdeaStepsApi`.
- `src/services/hire-requests.service.ts` — NEW.
- `src/hooks/hire-requests/` — NEW: `useCreateHireRequest(ideaId)` (invalidates the idea query onSettled), `useAdminHireRequests()`, `useSetContacted()` (writes the PATCHed row into the list cache).
- `src/components/partials/IdeaResult/IdeaResultContent.tsx` + `.module.css` — block 8 filled: W-1 (gold-outline) when `!hireRequested`; on 201 or 409 W-2 once (`{email}` from `AuthContext.user.email`, `{discount}` = `discountPercentAtRequest%`; on 409 the stored value is unknowable → user's current `discountPercent` is shown — assumption, see Q-2), then W-3 disabled.
- `src/app/admin/page.tsx` + `src/components/partials/Admin/` — NEW: guarded by `user.isAdmin`, else `notFound()` (never a forbidden). AntD `Table`, `scroll={{x:"max-content"}}`, first column (date) `fixed:"left"`, nowrap cells, `tabular-nums`, date `DD/MMM/YY HH:mm` via new `formatDateTime` in `src/lib/format.ts`, expandable row → full idea text + steps drawer (`GET /admin/ideas/:id/steps`), contacted `Switch` + text label (not color alone) → PATCH → row cache update. Empty state = REQ-004 wording.
- `src/lib/i18n/th.ts` / `en.ts` — REQ-004 W-1/W-2/W-3 + admin strings; `admin.col.*` / `admin.steps` / `admin.loadFailed` are **PROVISIONAL** (Q-1).

**Verified (run locally: BE `bun run dev` :4019, FE `next dev`/`next start` :3000 with `NEXT_PUBLIC_API_BASE_URL=http://localhost:4019`; throwaway account `fern-task009-evidence@example.com` on the shared SIT dev DB):**
- TH result: before → `2026-09-23-task-009-result-th-before-w1.png`; after press → `...-th-after-w2.png` (W-2 shows real email + `20%` = the user's tier discount at request); reload → `...-th-reload-w3.png` (W-2 gone, W-3 disabled — AC-2).
- EN result (second idea): `...-en-before-w1.png` → `...-en-after-w2.png` ("Request sent — we'll contact you at fern-task009-evidence@example.com with a quote that includes your 20% discount.").
- 375 px: `...-result-375px-w3.png` — no clipping, no page h-scroll, 44 px targets. 768/960: same single column as the 1280 px shots above; nothing changes between them (no admin table on this page).
- `/admin` as a normal signed-in user → the app not-found page: `...-admin-nonadmin-notfound.png`. No admin link anywhere: `grep -rn "/admin" src/components src/app` → **0 matches** (exit 1).
- `/admin` **as the owner** (list, expand, contacted toggle, reload-keeps-it, steps drawer, empty state): **UNVERIFIED — needs the owner's Google account (`siegkung@gmail.com`)**; per DoD, Tanya/owner prove it on SIT.
- `npx tsc --noEmit` → exit 0. `npm run build` (no `pnpm` on this machine) → clean, all 7 routes incl. `/admin` built, standalone assets copied.
- `hallmark audit` on the admin code (`.agents/skills/hallmark` v1.1.0, code-mode — the screen itself needs the owner login): **0 critical · 0 major · 1 minor** — minor: literal `border-radius: 8px` in `Admin.module.css` / `IdeaResult.module.css` (no `--radius` token exists in globals.css yet; antd theme uses 8). Verdict: **close, fix the minors** (better than "reads as AI-generated").
- Lighthouse mobile (prod build, `next start`, simulated throttling): **performance 74** (LCP 5.7 s · TBT 250 ms · CLS 0) — top of the accepted TASK-013 baseline (71–74, SPEC-008 §Non-functional). Dev-server run measured 61; not meaningful (unminified).

## Questions

- **Q-1 (copy, to @Sober → Porter):** the admin table column headers and the steps-drawer labels have no Porter wording (REQ-004 covers only W-1..W-3, title, contacted states, empty). Reused existing keys where they exist (`auth.displayName`, `auth.email`, `ideas.axis.*`); added PROVISIONAL keys `admin.col.date/idea/ideaTier/userTier`, `admin.steps`, `admin.loadFailed` in both dictionaries. Swap is dictionary-only when Porter's copy lands.
- **Q-2 (behaviour, to @Sober):** on a 409 the FE cannot know `discountPercentAtRequest` (the 409 envelope carries no row). W-2 then shows the user's *current* `discountPercent`. Correct per intent, or should W-2 on 409 omit the discount?

## Review
**Verdict: DONE** (Sober, 2026-09-23 05:10). Hire flow proven on the real BE in TH and EN — W-1 → W-2 with the real email and discount → reload shows W-3 disabled (AC-1/AC-2); `/admin` gives the not-found page to a non-admin and no admin link exists anywhere (grep 0 matches, AC-6); FRONTEND-STANDARD §2 table rules applied (sticky first column, nowrap, tabular-nums, contacted state not by colour alone); item 0 lazy-load landed and Lighthouse holds at the accepted 74. Admin-as-owner stays **UNVERIFIED — Tanya/owner on SIT** (REQ-004 AC-3/AC-4 + steps drawer), as the DoD allowed.
Answers: **Q-1** provisional keys were the right call; Porter has the copy request, swapping is dictionary-only. **Q-2** on a 409, **omit the discount clause** instead of showing a possibly-wrong number — the snapshot is the business fact (REQ-004 AC-5) and the user's current tier may be higher than the one recorded. One line, folded into TASK-015.
Minor for later, not rework: add a `--radius` token when the design system is next touched (TASK-015).
