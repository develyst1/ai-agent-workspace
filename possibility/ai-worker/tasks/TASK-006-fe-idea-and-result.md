# TASK-006: FE — idea box, loading, result page, "My ideas" list
- Source: SPEC-003 (+ REQ-003 wording, REQ-001 wording for tier descriptions)
- Owner: FE (Fern)
- Status: TODO (2026-09-20 — TASK-004 + TASK-005 DONE; after TASK-007)
- Depends on: TASK-004, TASK-005

## What to do
Read SPEC-003 §API/§Shapes first.
0. **Security re-pin (TASK-002 Q-2):** bump `next` to the latest patched 16.x and `axios` to the latest patched 1.x (exact pins), `npm install`, `npm audit` → paste before/after; build clean.
1. `services/ideas.service.ts` + hooks (`useSubmitIdea`, `useMyIdeas`, `useIdea`) over `POST /ideas`, `GET /ideas`, `GET /ideas/:id`.
2. `/ideas/new` (guarded, replaces TASK-004's placeholder): one `TextArea`, placeholder W-1, counter W-3 (turns red > 3000, input capped at 3000), W-2 under 20 chars, submit W-5 disabled when invalid (REQ-003 AC-3/4), sends `{ text, lang: <current UI lang> }`. While pending: W-4 + disabled form (calls may take up to ~2 min). On 502 `AI_FAILED`: W-6 + "Try again" button that re-sends the same text (AC-7).
3. `/ideas/[id]` result page: submitted text, three scores with Axis labels, `ideaTier` name (exact string, never translated) + REQ-001 description in the UI language, "ส่วนลด {n}%" / "Discount {n}%", reason under the Reason heading, and a **disabled placeholder** where REQ-004's hire button will go (no label yet). After a 201, also update `AuthContext.user.tier` from `userTier`.
4. `/ideas` "My ideas": newest first, date (`DD/MMM/YY HH:mm`), `ideaTier`, `textPreview`; empty state per REQ-003 wording; row click → result page (no re-analysis).
5. All strings through the TH/EN dictionaries; Porter's wording verbatim (REQ-003, REQ-001 tables). Ant Design components only; `FRONTEND-STANDARD.md` §1 + §3 gate.

## Definition of Done
- [ ] Screenshots (paths under `ai-worker/tests/harness/`): idea box empty/too-short/at-limit; loading; result (TH and EN); My ideas with ≥ 2 ideas; empty state.
- [ ] Result page tier/discount match the BE body (paste the JSON next to the screenshot).
- [ ] 502 path: with the BE's gateway pointed at a dead port → W-6 shown, Try again re-sends (network tab or console evidence).
- [ ] `pnpm build` clean — paste tail. `hallmark audit` verdict on the result page — paste.

## Implementation Notes

## Questions

## Review
