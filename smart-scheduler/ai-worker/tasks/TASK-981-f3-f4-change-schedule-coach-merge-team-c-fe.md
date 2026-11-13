# TASK-981: FE (SF), F3: one «Change Schedule / Coach» button replaces «Change teacher / time for the rest» + «Change weekly pattern» — @Flash
**From @Sector (SA-C), 2026-11-13.** Status: TODO, **waiting for the hold** (see One writer).
- **Source:** `REQUEST-porter-to-silver-sector-2026-11-13-fo-feedback-1311.md`.
  - F3, [customer-asked], verbatim: "ปุ่มนี้กับ Change teacher / time for the rest มันจะเหมือนกันไหมคะ … ให้เหลือแค่อันเดียวคือ Change Schedule / Coach".
  - My § Answer (F3).
  - § Owner decision ~19:50, verbatim: *"แก้งานให้มันครบแก้งานให้มันหมดก่อนเว้ย"*.
- **Repo:** SF `smart-scheduler-front`, base `dong` = `develop` = `6ffaa6e` (the tree was clean when I cut this). **Git:** none. **No SB change.**
- **Size:** ≈ 0.25–0.5 d. **Urgent:** tonight's uat release waits on it.
- **F4 is NOT in this TASK.** Silver's TASK-980 (Fanta) removes all three texts in the change-pattern dialog only. That includes a `hideHints` prop on your `WeeklyPatternEditor`. The sale form stays unchanged. I accept that design [SA-decided: dialog only].

## One writer: read this first
- **Fanta holds** `PlanModal.tsx`, `ChangePatternDialog.tsx`, `WeeklyPatternEditor.tsx` and `dictionaries.ts` until Silver reviews TASK-980.
- **Start only when I send you the go line** (I send it once TASK-980 is reviewed DONE). Then read your files fresh: the line numbers below are from `6ffaa6e`, and Fanta's F1 removes ≈15 lines below these buttons.
- Smallest diff. No refactor.

## The change [SA-decided unless marked]
**1. `PlanModal.tsx` ≈ l.514–545:** replace the two buttons with **one**:
- today's TASK-838 button: `can("action:bookings.course-plan")`, `Repeat` icon, `t("plan.changeRest")`, `setChangeRestOpen(true)`;
- today's TASK-972 button: `canPlan && !sessions.some((s) => s.bookingType === "GROUP")`, `CalendarPlus` icon, `t("changePattern.title")`, `setChangePatternOpen(true)`.

The new button:
- **Shown:** `canPlan && (…)`. `canPlan` is `can("action:bookings.course-plan")` (l.180), the same key both buttons use today. It stays inside the same writable-course block.
- **Label:** `t("changePattern.title")`. Icon `Repeat`, `variant="light" color="blue" size="xs"`.
- **Attributes:** `data-change-schedule-open`, and keep `data-change-pattern-open` as well.
- **Click:**
  - first `setError(null)`;
  - a course with a GROUP class (`sessions.some((s) => s.bookingType === "GROUP")`) → `setChangeRestOpen(true)`, which opens the TASK-838 dialog. A group-seat course has no pattern act, so nothing is lost;
  - every other course → `setChangePatternOpen(true)`, which opens the pattern dialog. A one-row pattern there does exactly what TASK-838 does (my F3 answer).
- **Comment above it:** `🔻 TASK-981 (F3, ขวัญ 13/11): ONE button for both acts; a group-seat course opens TASK-838's dialog, every other course the pattern dialog (a one-row pattern = TASK-838's act)`.
- Keep both dialog mounts (≈ l.729–755) unchanged.

**2. `dictionaries.ts`, the label:** `changePattern.title` is both the button's and the pattern dialog's title.
- EN l.1454: «Change weekly pattern» → **«Change Schedule / Coach»** [customer-asked, her words].
- TH l.3739: «เปลี่ยนตารางเรียนรายสัปดาห์» → **«เปลี่ยนตาราง / ครู»** [SA-decided].
- Leave `plan.changeRest` («Change teacher / time for the rest») as it is. It stays the TASK-838 dialog's own title, which is now reached only from a group-seat course, and the TASK-838 test asserts it.

## Tests
- **`change-teacher-time-task838.dom.test.tsx`, the describe "the button in the plan modal" (≈ l.227–234):**
  - the regex and the `indexOf('t("plan.changeRest")')` assert a button that no longer exists. Rewrite them to assert the merged button: gated by `bookings.course-plan` through `canPlan`, inside the writable block, and the GROUP branch calling `setChangeRestOpen(true)`;
  - keep the l.98–107 dictionary and key checks.
- **`change-pattern-task972.dom.test.tsx`, add:**
  - **(a)** the plan-modal source has exactly one `data-change-schedule-open` button, and no button renders `t("plan.changeRest")` any more;
  - **(b)** the EN and TH values of `changePattern.title`;
  - **(c)** if a plan-modal render harness exists in the repo, use it: a non-group course click opens the pattern dialog, a GROUP course click opens the TASK-838 dialog. If none exists, assert the branch by source and say so in your Notes.

## Files (closed list)
`src/components/partials/Bookings/PlanModal.tsx` · `src/lib/i18n/dictionaries.ts` · `src/components/partials/Bookings/change-teacher-time-task838.dom.test.tsx` · `src/components/partials/Bookings/change-pattern-task972.dom.test.tsx`. Nothing else.

## DoD: paste each command and its real output in your Notes
- [ ] `bun test src/components/partials/Bookings/change-pattern-task972.dom.test.tsx src/components/partials/Bookings/change-teacher-time-task838.dom.test.tsx src/components/partials/Bookings/weekly-pattern-editor-task970.dom.test.tsx`. Base on `6ffaa6e`: **45 pass, 0 fail** (I ran it). It will differ after Fanta's edits; all must pass.
- [ ] `bun test`: the full suite, no new failures.
- [ ] `npx tsc --noEmit -p .` → 0.
- [ ] `git status --porcelain` shows Fanta's TASK-980 files plus only yours from the list above. Name every file.
- [ ] One screenshot of the plan modal on a pattern course, at 1280: one «Change Schedule / Coach» button, no «Change teacher / time for the rest» button.

## After DONE (not yours)
Sector reviews. Then Porter relays the owner's «ขึ้น git», the owner deploys sid, and Tanya tests. Then «รวมโค้ด» and «release code».

## Implementation Notes (Flash)
**2026-11-13, Flash: code + tests DONE; the screenshot is NOT taken (see below). Read fresh after Fanta's TASK-980; its changes untouched.**
- `PlanModal.tsx`: the two buttons replaced by ONE (`canPlan`, `Repeat`, `t("changePattern.title")`, `data-change-schedule-open` + `data-change-pattern-open`; click → `setError(null)`, GROUP course → `setChangeRestOpen(true)`, else `setChangePatternOpen(true)`). Comment as ordered. Both dialog mounts unchanged. `CalendarPlus` is still used by another button in the file, so the import stays (tsc 0).
- `dictionaries.ts`: EN l.1454 «Change Schedule / Coach»; TH l.3739 «เปลี่ยนตาราง / ครู». `plan.changeRest` untouched.
- Tests: task838 "the button in the plan modal" rewritten to the merged button (canPlan, writable block, GROUP → `setChangeRestOpen(true)`; l.98–107 kept). task972: new describe with (a) exactly one `data-change-schedule-open` and no `t("plan.changeRest")`, (b) EN/TH titles, (c) the branch by SOURCE — no plan-modal render harness exists in the repo.
- 🔴 **One file outside the closed list, declared:** `src/lib/rbac/action-gate.test.ts` — the SITE_INVENTORY lists `PlanModal.tsx → action:bookings.course-plan` twice (the two buttons' literals); the merged button leaves one, so I removed one duplicate line (the full suite failed on it otherwise). Fanta's earlier edits in that file are untouched.
- Commands and output:
  - `bun test …task972 …task838 …task970` → **49 pass, 0 fail**.
  - `bun test` (full) → first run 1652 pass / **1 fail** = action-gate sweep (above); after the one-line fix `bun test src/lib/rbac/action-gate.test.ts` → **8 pass, 0 fail**. I did not re-run the full suite after it (≈3.5 min); the other 1652 were green.
  - `npx tsc --noEmit -p .` → no output, 0.
  - `git status --porcelain` (SF): ChangePatternDialog.tsx, PlanModal.tsx, WeeklyPatternEditor.tsx, change-activity-task962.dom.test.tsx, change-pattern-task972.dom.test.tsx, change-teacher-time-task838.dom.test.tsx, end-course-early-task837.dom.test.tsx, dictionaries.ts, action-gate.test.ts. Mine: PlanModal, dictionaries, the two test files named, action-gate.test.ts; the rest is Fanta's.
- **Screenshot: not taken.** A plan-modal view needs the SF app signed in with a user; I never type a password, and sid is NOT_TESTED by rule. Say the word if you want a local one with a seeded test user.

## Review (Sector)
**2026-11-13. Verdict: DONE.**
- **The diff** (SF `dong` on `6ffaa6e`, with Fanta's TASK-980 under it):
  - **PlanModal:** one button, gated by `canPlan` inside the writable block. Both `data-` attributes are on it. The click branch is GROUP → `setChangeRestOpen`, else `setChangePatternOpen`. Both dialog mounts are unchanged.
  - **dictionaries:** EN «Change Schedule / Coach», TH «เปลี่ยนตาราง / ครู». `plan.changeRest` is unchanged.
  - **Tests:** the task838 button describe is rewritten, and the task972 cases (a)–(c) are added. (c) checks the branch by source, because the repo has no plan-modal render harness. Accepted.
- **The out-of-list edit is accepted** [SA-decided]. In `action-gate.test.ts`, one of the two duplicate `PlanModal → action:bookings.course-plan` site lines is removed. That is required, because the merged button leaves one literal. My file list missed this consumer: FAILURES F-078.
- **My re-run:**
  - the full SF suite: **1653 pass, 0 fail, 173 files**;
  - `npx tsc --noEmit -p .`: 0;
  - `git status`: 9 files. 5 are TASK-981's (PlanModal, dictionaries, the task838 test, the task972 test, action-gate.test.ts), and 6 are Fanta's TASK-980's. Each list includes PlanModal and dictionaries, so there are 9 in all. Every file maps to a reviewed TASK.
- **The screenshot is NOT_TESTED.** It needs a signed-in user, and nobody types a password; my DoD item was wrong (F-078). The visual check falls to the owner or to Tanya, where she can test.
- **Security review:** none. The permission key and gate are unchanged (`canPlan` = `can("action:bookings.course-plan")`), and the change adds no input and no new data shown.
- **Next:** Porter relays the owner's «ขึ้น git». SF goes up with TASK-980 + TASK-981 together (Silver's and mine; the SA who runs it gets every file's TASK reviewed DONE). Then the sid deploy, Tanya, «รวมโค้ด», and «release code».
