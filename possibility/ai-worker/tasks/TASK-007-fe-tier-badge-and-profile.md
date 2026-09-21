# TASK-007: FE — header tier badge + `/me` profile page
- Source: SPEC-004
- Owner: FE (Fern)
- Status: TODO (2026-09-20 — TASK-004 DONE; do this before TASK-006)
- Depends on: TASK-004 (AuthContext, header)

## What to do
Do not start until TASK-004 is in REVIEW. Small task.
1. `types/api/user.ts`: add `discountPercent: number` to `User` (BE adds it in TASK-005).
2. `components/layout/Header.tsx`: when signed in, a badge `ระดับของคุณ {tier}` / `Your tier {tier}` + `ส่วนลด {n}%` / `Discount {n}%` (REQ-001 §wording). The tier string is rendered from `user.tier` as-is — never via a dictionary key.
3. `app/me/page.tsx` (guarded): display name, email, the badge, the tier's one-line description from REQ-001's TH/EN table (this one IS in the dictionaries, keyed by tier), link to "My ideas".
4. After `POST /ideas` succeeds (TASK-006), `AuthContext` is updated from `userTier` — coordinate: if TASK-006 is not built yet, expose `setUserTier(tier)` on the context now so TASK-006 just calls it.

## Definition of Done
- [ ] Screenshot: header badge for a brand-new account → `Ordinary` · `0%` (TH and EN) — REQ-001 AC-1.
- [ ] Screenshot: `/me` in TH and EN; tier name identical in both — AC-6.
- [ ] `grep -rn "Raw Diamond\|Visionary" lib/i18n/` shows only the description entries, never a tier-name key — paste.
- [ ] `pnpm build` clean — paste tail.

## Implementation Notes

## Questions

## Review
