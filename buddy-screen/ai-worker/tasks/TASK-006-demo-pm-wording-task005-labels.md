# TASK-006: Demo — apply the PM's review of the TASK-005 labels (3 replacements, no ร่าง left)
- Source: SPEC-002 §4 + REQ-002 "PM review of TASK-005 draft labels, 2026-10-28" `[PM-decided]`
- Owner: FE (Fern)
- Status: DONE (2026-10-28, SA review)
- Depends on: TASK-005 (DONE)
- Repo: `buddy-screen-spec`, file `demo/src/strings.ts` only. **No git writes.**

## What to do
1. Replace the Thai text of `screenOvertimeDeclined`, `buyBackInfo` and `buyBackDone` with the PM's text, **read from the REQ-002 table, not retyped**, the same method as TASK-004. Keep `{minutes}` as the placeholder.
2. Turn all 8 TASK-005 `draft(...)` calls (lines 112–119 today) into `pm(...)`. The `draft` helper stays as it is.

## Definition of Done (run in `demo/`, paste each command + real output)
- [ ] `for s in "ทีวี: หลังผู้ปกครองไม่อนุมัติ" "ยืมเวลาวันอาทิตย์ไป {minutes} นาที · ชั่วโมงละ 12.50 บาท คิดตามนาทีจริง" "ซื้อคืนแล้ว เวลาวันอาทิตย์กลับมาครบ"; do grep -qF "$s" src/strings.ts && echo "OK $s" || echo "MISSING $s"; done` → 3 × `OK`.
- [ ] `grep -c "draft('" src/strings.ts` → `0` (base today: `8` — SA ran it).
- [ ] The TASK-005 33-string loop (11 PM + 22 §13) → 33 OK.
- [ ] `npm test` → 8 passed · `npm run build` → exit 0.
- [ ] Browser, against a fresh `npm run dev`:
  - the walk shows 20 screens loaded, 0 console errors, origins localhost only;
  - the TASK-005 click paths (decline → TV; borrowed → quota → ซื้อคืน) still work;
  - `.draft-badge` count over the index, all screens and both clicked states = **0**;
  - paste the buy-back text after the button is pressed.
- [ ] `git -C .. status --porcelain` → the same 4 entries; HEAD `0e6e911`; `buddy-screen-front` clean.

## Implementation Notes
2026-10-28, Fern (FE). `buddy-screen-spec` `main`, HEAD `0e6e911` before and after; `buddy-screen-front` status empty. Only `demo/src/strings.ts` changed.
Method (as TASK-004): one node script fed by a quoted heredoc **read the 3 PM rows out of REQ-002's table itself** (nothing retyped), asserted exactly one `draft('…')` match per key and 8 `draft('` calls in total (threw otherwise), replaced the 3 texts (`{minutes}` kept), then turned all 8 TASK-005 `draft(` calls into `pm(`. One editor-tool edit: the section comment "draft: TASK-005 additions (PM to review)" → "PM-approved: TASK-005 additions". The `draft` helper and the `'draft'` source value are untouched.

- 3 PM texts: `OK ทีวี: หลังผู้ปกครองไม่อนุมัติ` · `OK ยืมเวลาวันอาทิตย์ไป {minutes} นาที · ชั่วโมงละ 12.50 บาท คิดตามนาทีจริง` · `OK ซื้อคืนแล้ว เวลาวันอาทิตย์กลับมาครบ` — 3 × OK, no `MISSING`.
- `grep -c "draft('" src/strings.ts` → `0`; `grep -n "draft" src/strings.ts` → lines 1 (top comment), 2 (type), 5 (helper) only.
- 33-string loop (11 PM + 22 §13) → `33 OK`, no `MISSING`.
- `npm test` → `Tests 8 passed (8)`; `npm run build` → `✓ built in 526ms`, exit 0.
- Browser (fresh `npm run dev`, 375×667): `index lists 20 screens`, `loaded=yes` × 20 and `loaded=NO` × 0, `console errors: 0 []`, `request origins: [ 'http://localhost:5173' ]`.
- Click paths (`task006.mjs`): decline → TV text `วันนี้พอแค่นี้ก่อนนะ เก่งมากเลย`; borrowed → quota: info `ยืมเวลาวันอาทิตย์ไป 30 นาที · ชั่วโมงละ 12.50 บาท คิดตามนาทีจริง`, amount `ยอดที่ต้องชำระ 6.25 บาท`; after ซื้อคืน: `ซื้อคืนแล้ว เวลาวันอาทิตย์กลับมาครบ`.
- Badge count: the script counts `.draft-badge` on the index (0), on a fresh load of each of the 20 screens (0), in the declined state (counted in the total) and in the bought-back state → `TOTAL .draft-badge (index + all screens + both clicked states): 0`.
- `git -C .. status --porcelain` → the same 4 entries (` M README.md`, `?? REQUIREMENTS-V1.md`, `?? demo/`, `?? diagrams/`); HEAD `0e6e911`. Dev server on 5173 stopped after the run.

UNVERIFIED — how the new, longer buy-back strings look on a 375 px screen (checked by overflow measure and text, no screenshot viewed).

## Questions

## Review
**2026-10-28 — the SA — verdict: DONE.**
Re-run by the SA:
- the 3 PM texts and a sample of the PM/§13 strings → 8 × OK;
- `grep -c "draft('"` → `0`; `draft` appears only on lines 1, 2 and 5;
- `npm test` 8 passed · build ok;
- git: same 4 entries, HEAD `0e6e911`, front clean.

On a fresh dev server, with the SA's click script:
- decline → `#/tv/overtime-declined`, text `🌙วันนี้พอแค่นี้ก่อนนะ เก่งมากเลย`;
- borrowed → quota → `6.25` → `ซื้อคืนแล้ว เวลาวันอาทิตย์กลับมาครบ`;
- **distinct ร่าง labels over the index, 20 screens and both clicked states: 0**;
- 0 console errors;
- `walk.mjs`: 20 loaded, overflow 0, no button < 44 px, origins localhost only.

The FE's UNVERIFIED item is settled: in the SA's 375×667 screenshot of the bought-back state, the longer buy-back strings wrap inside the frame and nothing is clipped.
