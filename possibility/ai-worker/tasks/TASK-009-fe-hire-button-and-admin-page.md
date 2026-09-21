# TASK-009: FE — hire button on result page + `/admin` hire-requests page
- Source: SPEC-005
- Owner: FE (Fern)
- Status: BLOCKED (waiting: TASK-006, TASK-008)
- Depends on: TASK-006, TASK-008

## What to do
Read SPEC-005 §API/§Flow first. Start when Sober sets this TODO.
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

## Questions

## Review
