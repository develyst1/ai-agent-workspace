# DEPLOY — REQ-125 follow-up: TASK-828 rework (F1/F2) + O1 + TASK-829 — sid first, then uat — @Sober, 2026-10-21
**For @Porter → the owner.** Agents commit nothing. **Both apps go together.** **No migration, no env change, no script, no menu step.**

## 0 · What is in it
- **TASK-828 rework (TEST-111):**
  - **F1:** the teacher's own same-day dialog counts only the preview's `cancel` outcomes as cancels; a D4 class left as is is shown with the approved sentence, not counted as cancelled.
  - **F2:** the teacher's own future-day dialog shows the approved co-taught line.
- **O1 (owner "O1 A"):** both Cancel-leave confirms (one day · all future days) say the teacher goes back on the {n} co-taught classes the leave took them off. When n = 0, today's text is unchanged.
- **TASK-829 (owner "K1 b"):**
  - **BE:** after a teacher's SAME-DAY leave leaves class(es) as is (D4), ONE LINE alert goes to the admins (`notifyAdmins`) listing them. Never from the preview, advance or range paths; never to a coach or a family. The same-day answer gains `adminsAlerted` (only when a class was left as is).
  - **FE:** after a same-day save that involved a co-taught class, a result view shows each class: continues (with whom) / cancelled / left as is. The approved "admins have been told" line shows **only when `adminsAlerted > 0`**. A sole-teacher-only day is exactly today's toast.
- **All new strings are owner-approved and present verbatim:** the admin alert (TH/EN) · O1 (TH/EN) · "admins have been told" (TH/EN). No «copy pending» left.

## 1 · Verified by me on clean copies of both whole trees (final)
| | result |
|---|---|
| **back** `55cdb53` + 10 files (no `.env`) | tsc 0 · SAFE suite **5,063 / 0**, 363 files · unhandled 0 · migrations 72 = journal 72 (unchanged) · sets 829 **11/11** · 825 10/10 · 826 15/15 · 827 13/13 (+ 824 11/11 on the approved-text tree) |
| **front** `3e4a337` + 18 files | tsc 0 · `bun test` **1,337 / 0**, 142 files · unhandled 0 · **build 0** (the tree unchanged by it) · sets 829 **17/17** · 828-o1 13/13 · 828 26/26 · 818 25/25 · 820 22/22 · 822 18/18 |

0 survivors, checksums identical, sets run one at a time.
**Not proven yet:** a real DB, a real LINE send and a real browser. That is sid, with Tanya.

## 2 · Commit lists (exactly these; `git status --short -uall` taken by me, both trees frozen)
### back: `smart-scheduler-back` (10 entries)
```
    M src/lib/advance-leave-co-taught-task826.test.ts
     M src/lib/line-i18n.ts
     M src/lib/line-message.ts
     M src/lib/message-trailing-req085-16-3.test.ts
     M src/lib/no-iso-date-leak.test.ts
     M src/lib/no-placeholder-leak.test.ts
     M src/lib/same-day-leave-co-taught-task825.test.ts
     M src/services/scheduler.service.ts
    ?? src/lib/left-as-is-alert-task829.mutations.json
    ?? src/lib/left-as-is-alert-task829.test.ts
```
### front: `smart-scheduler-front` (18 entries)
```
    M scripts/mutation/task-818.json
     M scripts/mutation/task-820.json
     M scripts/mutation/task-828.json
     M src/components/partials/Calendar/CancelLeaveButton.tsx
     M src/components/partials/Calendar/LeaveDayPanel.tsx
     M src/components/partials/Calendar/LiftLeaveConfirm.tsx
     M src/components/partials/Calendar/LiftRangeConfirm.tsx
     M src/components/partials/Calendar/Modal/LeaveWillDo.tsx
     M src/components/partials/Calendar/Modal/ReportLeaveDialog.tsx
     M src/components/partials/Calendar/Modal/leave-co-taught-task828.dom.test.tsx
     M src/components/partials/Teachers/TeacherLeaveList.tsx
     M src/lib/i18n/dictionaries.ts
     M src/types/api/contract.ts
    ?? scripts/mutation/task-828-o1.json
    ?? scripts/mutation/task-829.json
    ?? src/components/partials/Calendar/Modal/LeaveSameDayResult.tsx
    ?? src/components/partials/Calendar/Modal/leave-same-day-task829.dom.test.tsx
    ?? src/components/partials/Calendar/cancel-restores-o1.dom.test.tsx
```

## 3 · Deploy, in this order: **sid**, then (after Tanya passes) **uat**
1. **Back:** pull, `bun install`, restart. No migration (journal stays 72).
2. **Front:** the usual build + restart.
3. Back before or together with the front. The front reads `adminsAlerted` and hides the line when it's absent.

## 4 · Tanya's gate on sid (then uat read-only)
- **F1:** a teacher's own same-day leave with 1 sole class + 1 D4 class → the dialog says "cancels 1" and shows the D4 sentence.
- **F2:** a teacher's own future-day leave with co-taught classes → the co-taught line, with the right n.
- **O1:** Cancel leave (one day, and all future days) after the leave took the teacher off n > 0 co-taught classes → the new line with n. With n = 0 → today's text.
- **K1 (829):** a teacher's own same-day leave with a D4 class:
  - ONE LINE alert to each linked admin listing the class(es) left as is;
  - the result view shows continues / cancelled / left as is + "admins have been told";
  - no alert and no such line when there's no D4;
  - nothing to a family or a coach from the alert.
  - **On a desk with no linked admin:** the outbox has one SKIPPED row, and the "admins have been told" line is NOT shown.
- **A sole-teacher-only day:** exactly as before (toast + close).
