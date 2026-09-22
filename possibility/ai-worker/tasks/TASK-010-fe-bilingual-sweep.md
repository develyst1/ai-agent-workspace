# TASK-010: FE — bilingual sweep (all pages, TH + EN) and i18n guards
- Source: SPEC-006 (REQ-005)
- Owner: FE (Fern)
- Status: BLOCKED (waiting: TASK-009 — all pages must exist)
- Depends on: TASK-009

## What to do
Last FE task. Nothing new to design — verify and tighten.
0. **Compact phone header (SPEC-004 amendment, TASK-007 Q-2):** hide the tier badge in the header below 600 px; `/me` keeps it. Also apply whatever Porter answered for the 404 wording and Thai month abbreviations (TASK-006 Q-2/Q-3, see REQ-003 §Wording).
1. Walk every page signed-out and signed-in in TH then EN: landing, idea box, result, My ideas, `/me`, admin (as the admin fixture via env override, and as a non-admin → the not-found page, also bilingual). Fix any string that is hard-coded, missing in one language, or a raw key.
2. Add `scripts/i18n-check.mjs` (dev-only, run by `npm run build` via `prebuild`): fails if any key of `th` is missing in `en` or vice-versa, if any dictionary value is an empty string, or if a tier NAME appears as a dictionary value (SPEC-006 rule 3). Keep it under 40 lines.
3. Confirm the cookie survives sign-out → sign-in (REQ-005 AC-3) and that `lang=bogus` → TH (AC-1).
4. Confirm the not-found page (`app/not-found.tsx`) has both languages.

## Definition of Done
- [ ] Screenshots under `ai-worker/tests/harness/task-010/` — every page × TH/EN — named `<page>-<lang>.png`.
- [ ] `grep -rn "[ก-๙]" src --include=*.tsx --include=*.ts | grep -v "lib/i18n/th.ts"` → nothing (no Thai outside the TH dictionary) — paste.
- [ ] `node scripts/i18n-check.mjs` → `OK <n> keys`; then temporarily delete one EN key → it fails naming the key — paste both, restore.
- [ ] Sign in (fixture cookie), switch EN, sign out, sign in again → still EN — describe with `document.cookie` evidence.
- [ ] `npm run build` clean.

## Implementation Notes

## Questions

## Review
