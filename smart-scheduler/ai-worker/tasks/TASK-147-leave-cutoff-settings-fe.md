# TASK-147: Leave cut-off settings — dictionary keys (FE)
- Source: SPEC-048 (REQ-047)
- Status: TODO
- Assignee: @Fern (FE)
- Depends on: TASK-146 (the two new setting keys)

## What to do (smart-scheduler-front)
The settings screen already renders every `type:"number"` rule as a NumberInput card — the two new leave-
cut-off rows appear automatically. Only copy is needed: add `dictionaries.ts` entries (TH+EN) for the two
new settings — help text per the REQ:
- label — TH `แจ้งลาล่วงหน้าอย่างน้อย (ชั่วโมง)` · EN `Minimum leave notice (hours)`
- help — TH `ผู้ปกครองแจ้งลาเองได้จนถึง {n} ชั่วโมงก่อนคาบเริ่ม หลังจากนั้นต้องให้แอดมินทำให้` · EN `Parents can take leave themselves until {n} hours before the session; after that only an admin can.`
(differentiate the two rows as ครูประจำ / ฟรีแลนซ์ · full-time / freelance).

⚠️ The settings-row **label** is BE-supplied Thai-only today (the pending settings-label-i18n follow-up from
TASK-137 Q1). So the bilingual *label* rides that follow-up; the **help** text (`settings.help.<key>`) is
FE-renderable now.

## Definition of Done
- [ ] The two leave-cut-off rows show a Thai + English help line; the number editors work (persist + reset).
- [ ] No component change; numeric-row rendering unregressed.
- [ ] `bunx tsc --noEmit` 0 · `bun run build` ok.

## Implementation Notes / Questions
(Fern fills in.)

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-147 | scheduler-front (FE): dict keys (label/help TH+EN) for the 2 leave-cut-off settings rows | SPEC-048 (REQ-047) | **TODO** (dep TASK-146) | Fern | TASK-146 |
```
