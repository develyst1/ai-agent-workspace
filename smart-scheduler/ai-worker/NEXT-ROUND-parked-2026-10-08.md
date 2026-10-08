# NEXT ROUND — everything parked, in ONE place (@Porter, 2026-10-08)
Written after round 1 + REQ-115 + 704 + 705 went live on uat (TEST-087 PASS). **Nothing here blocks anything live.** Each line says whose move it is.

## A. 🔜 Owed to the OWNER first (morning)
| # | item | his move | source |
|---|---|---|---|
| A1 | **TASK-706 to uat** (back `a2185b2`, no migration, back-only restart). **Switch the back `.env` to uat values first.** Not urgent: uat has no GROUP series yet. | deploy when Tanya's sid PASS is in | `DEPLOY-uat-2026-10-08-task706.md` |
| A2 | **47 live sentences nobody approved.** They were held "until after uat", and that condition is now met. | read and approve/edit | `COPY-SET-live-unread-2026-10-07.md` |
| A3 | **Atlas:** 28 FAILURES entries NEW (gate FAILs at 10+) + 3 reports | open Atlas: `อ่าน ATLAS.md — review FAILURES ของ smart-scheduler` | `FAILURES.md` · `REPORT-porter-to-atlas-2026-10-06/07/08-*.md` |
| A4 | Khwan: the "a LINE user" locator answer (no condition stated: unconfirmed; the TIME + a mid-registration phone/child; offer a "people waiting" list) | send the draft | `COPY-DRAFT-khwan-line-user-locator-2026-10-08.md` |

## B. Owner decisions — product, customer-visible
| # | item | notes |
|---|---|---|
| B1 | **Duplicate "CONFIRMED"** when a cancelled make-up is re-booked into the SAME slot | noisy, not false · `TEST-085` D3 · `TEST-086` |
| B2 | **TASK-551, second look:** now that make-ups are announced, should ANY cancel re-book into the very date it cancelled? | 551 says "yes, silently". Sober flagged it · `inbox/PM.md` 2026-10-08 |
| B3 | **"Your class is back on"** after an Undo of a leave | pre-existing · needs new words · usually the family asked for the Undo |
| B4 | **Group make-ups queue one per week** in the coach's slot | pre-existing · `DEPLOY-uat-2026-10-09.md` §7 |
| B5 | **Admin LINE link hangs off the web user** (~4.5 days) | `SIZING-admin-line-link-to-web-user-2026-10-07.md` |
| B6 | **"เล่นไม้แข็ง"**: strict data entry with an "ยังไม่ระบุ" escape and a findable list for admins | `NOTE-owner-direction-strict-data-2026-10-07.md` |
| B7 | **Khwan's 192-string workbook**, incl. rows 45/46 (Voucher/Camp CONFIRMED SCHEDULE) and the "1 ชม." cut-off setting | `project-docs/req111-message-inventory/message-inventory-KHWAN-EDITS-2026-10-06.xlsx` |
| B8 | REQ-114 (iii) | `requirements/REQ-114-*.md` · `ANALYSIS-REQ-114-undo-chain-2026-10-05.md` |
| B9 | *(optional)* `NODE_ENV=production` for the uat process, to silence Bun's "development server" line | env only, no visible effect today · Sober, `inbox/PM.md` 2026-10-08 |

## C. Team hygiene — no owner decision needed
- `makeup_not_confirmed`: flip the code comment from "DRAFT" to APPROVED (noted in `TASK-702`).
- Team B's `722` mutation set has no test list, so the runner refuses it on its own (TASK-637 rule) → @Silver.
- `TASK-702` §2f local abort proof: still unrun (no local DB). Tanya runs it the day one exists.
- `TASK-639` / `TASK-652`.
- `action-gate.test.ts`: give its bare counts named inventories.
