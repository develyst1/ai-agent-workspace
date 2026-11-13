# TASK-980 — FE (SF): ขวัญ's front-office notes 13/11 — F1 hide Add extra · F2 «Cancel course» · F4 drop 3 texts · F5 «Add» — @Fanta

**From @Silver (SA-B), 2026-11-13.** Source: `REQUEST-porter-to-silver-sector-2026-11-13-fo-feedback-1311.md` (her verbatim, my § Answer, **§ Owner decision ~19:50**: *"แก้งานให้มันครบแก้งานให้มันหมดก่อนเว้ย"*, the freeze lifts for these).
Repo **SF** `smart-scheduler-front`, base `dong` = `develop` = `6ffaa6e` (tree clean). **No git** (I commit on the owner's «ขึ้น git»). No SB change.
Status: TODO · Owner: Fanta (FE-B) · **Urgent: tonight's uat release waits on it.**

## One writer — read this first
- **You hold** `PlanModal.tsx`, `ChangePatternDialog.tsx`, `WeeklyPatternEditor.tsx`, `ChangeActivityDialog.tsx`, `src/lib/i18n/dictionaries.ts` until my review.
- **Then Flash takes them for F3** (the button merge, Team C). So: no refactors, no moves, smallest diff; Flash edits the same lines next.

## F1 — hide «Add extra (charged)» [customer-asked: "เจ้าเมนู Add extra (charged) เอาออกได้ไหมคะ ตอนนี้ไม่ได้ใช้"]
`PlanModal.tsx` l.578–592: remove the `Tooltip` + `Button` block that opens `{ kind: "extra" }` from the plan modal's buttons. Leave the extra-session edit code (≈ l.1103) and the dictionary keys in place (unreachable; it can come back in one line) [SA-decided]. If TS/lint flags an unused import (`Ticket`), drop only that import.

## F2 — «End course early» → «Cancel course» [customer-asked: "ขอแก้คำ ปุ่ม End Course early เป็น Cancel"; PM-decided «Cancel course», owner to see]
Plain «Cancel» clashes with the per-session «Cancel» (`plan.cancelSession`) and every dialog's close button, hence «Cancel course». Words only, behaviour unchanged. `dictionaries.ts`:
| key | EN (l.≈211 / 210–226) | TH (l.2655–2670) |
|---|---|---|
| `endCourse.action` | «Cancel course» | «ยกเลิกคอร์ส» |
| `endCourse.title` | «Cancel this course?» | «ยกเลิกคอร์สนี้?» |
| `endCourse.confirm` | «Cancel course» | «ยกเลิกคอร์ส» |
- Keep `confirmLine`, `done`, the reasons and `ENDED_EARLY` («Course ended early», the coach's LINE reason) as they are. Update the «✅ APPROVED … REQ-126» comment above `action` to say: *changed 2026-11-13 on ขวัญ's ask, PM-decided «Cancel course», owner to see (REQUEST-porter-to-silver-sector-2026-11-13-fo-feedback-1311.md)*.
- `EndCourseDialog.tsx` reads the keys; no change there.

## F4 — drop the three texts in the change-pattern dialog only [customer-asked: "ข้อความพวกนี้เอาออกค่ะ"]
1. `ChangePatternDialog.tsx` l.176–179: remove the `changePattern.unchanged` text. **Keep the guard**: Confirm still stays off for an unchanged pattern (TASK-972 Amd 1b).
2. `WeeklyPatternEditor.tsx` (Flash's file; you edit it under the hold above): add an optional prop **`hideHints?: boolean`** (default `false`). When `true`, don't render `weeklyPattern.hint` (l.39) or `weeklyPattern.oneRow` (l.103). The sale form (`CreatePlanFlow.tsx` l.596) passes nothing, so **it is unchanged** [SA-decided: dialog only, as the owner's decision says; Sector may still choose «everywhere» later by flipping the default].
3. `ChangePatternDialog.tsx` l.175: pass `hideHints`.
- Leave the dictionary keys (`changePattern.unchanged`, `weeklyPattern.hint`, `.oneRow`) in place (the sale form still uses two).

## F5 — «Difference» → «Add» [customer-asked: "ถ้าส่วนต่างที่ต้องจ่ายเพิ่มใช้คำว่า Add แทน Difference ค่ะ"; PM-decided label only]
`dictionaries.ts` `changeActivity.difference`: EN l.780 «Difference {difference} ฿» → **«Add {difference} ฿»**; TH l.3180 «ส่วนต่าง {difference} ฿» → **«จ่ายเพิ่ม {difference} ฿»**. The cheaper case stays `noRefund` «0 ฿ · no refund» (REQ-5014 option A). Leave `recordDifference` as it is. `ChangeActivityDialog.tsx` needs no code change.

## Tests (update what asserts the old strings; add the two checks below)
- `change-activity-task962.dom.test.tsx`, `change-pattern-task972.dom.test.tsx`, `end-course-early-task837.dom.test.tsx`: old strings → new.
- Add: (a) the plan modal has **no** «Add extra (charged)» button (with the permission granted); (b) the change-pattern dialog shows none of the three texts, and Confirm is still disabled for an unchanged pattern; (c) `WeeklyPatternEditor` without `hideHints` still shows `weeklyPattern.hint` (the sale form is unchanged).

**Files (closed list):** `src/components/partials/Bookings/{PlanModal, ChangePatternDialog, WeeklyPatternEditor}.tsx` · `src/lib/i18n/dictionaries.ts` · the 3 test files above (new cases go in them). Nothing else.

## Done = (paste command + output in Implementation Notes)
- `npx tsc --noEmit -p .` → 0.
- The 3 test files → all pass; then the **full** SF suite → 0 fail (paste the totals line; it was 1648/0 at TASK-972).
- `git status --porcelain` → exactly the closed list (paste it). `git diff --stat` pasted.
- `grep -n "Add extra (charged)\|End course early\|Difference {difference}" src/lib/i18n/dictionaries.ts` → `plan.extra`/`extraSession` lines may stay (keys kept); no «End course early» on `action`/`confirm`; no «Difference {difference}».
- Hand-off line to me in inbox/SA-B.md; I review, then the files pass to Flash for F3.

## Questions
_(—)_

## Implementation Notes
**Fanta, 2026-11-13.** All four items built, SF only, closed list respected; no git.
- **F1** `PlanModal.tsx`: the `can("action:bookings.course-extra-session")` Tooltip+Button block removed (one comment left in its place); `Ticket` import dropped. Extra-session edit code and dictionary keys untouched.
- **F2** `dictionaries.ts`: `endCourse.action/title/confirm` → EN «Cancel course» / «Cancel this course?» / «Cancel course»; TH «ยกเลิกคอร์ส» / «ยกเลิกคอร์สนี้?» / «ยกเลิกคอร์ส». `confirmLine`, `done`, reasons, `ENDED_EARLY` unchanged. REQ-126 comment (EN) updated as told.
- **F4** `ChangePatternDialog.tsx`: `changePattern.unchanged` text removed, `hideHints` passed; the `unchanged` guard still gates Confirm. `WeeklyPatternEditor.tsx`: optional `hideHints` (default false) hides `weeklyPattern.hint` and `weeklyPattern.oneRow`. Sale form passes nothing.
- **F5** `changeActivity.difference` → EN «Add {difference} ฿», TH «จ่ายเพิ่ม {difference} ฿».
- **Tests:** old strings updated in the 3 files. New: F4 «none of the three texts, EN+TH, Confirm still off» and «Editor without hideHints still shows hint + one-row line; with it, neither» (change-pattern-task972); F1 as a source-text pin in end-course-early-task837 (PlanModal has no `setEdit({ kind: "extra" })`, no `action:bookings.course-extra-session`, no `Ticket`) — I did not mount PlanModal for it (no suite of the closed list does).
- **Results:** `npx tsc --noEmit -p .` → 0. The 3 files → 73 pass / 0 fail. Full SF suite → **1648 pass / 2 FAIL** (1650 tests): both in `src/lib/rbac/action-gate.test.ts` (outside the closed list): «the snapshot… exactly two keys have no FE site» and «the sweep… SITE_INVENTORY». Cause: F1 removed the only FE site of `action:bookings.course-extra-session`.
- **NEEDS SILVER:** that test lists `PlanModal.tsx → action:bookings.course-extra-session` in `SITE_INVENTORY` and expects exactly two no-site keys. Proposed fix (2 lines, `action-gate.test.ts`): delete that SITE_INVENTORY line; add `"action:bookings.course-extra-session"` to the no-site list (l.338, sorted). Not done by me: the file is not on the closed list.
- `git status --porcelain` → the 7 files of the closed list only (3 components, dictionaries.ts, 3 tests). `git diff --stat`: 7 files, +79 −59.
- grep: only `plan.extra: "Add extra (charged)"` (key kept, unreachable) remains; no «End course early» on action/confirm; no «Difference {difference}».

**Amendment 1 done (Fanta, 2026-11-13):** `src/lib/rbac/action-gate.test.ts` only: dropped the `PlanModal.tsx → action:bookings.course-extra-session` line from `SITE_INVENTORY`; no-site list = `["action:bookings.course-extra-session", "action:people.student-create", "action:teachers.calendar-link"]`; title «exactly three keys»; comment adds the extra-session note. `actions.ts` untouched. `npx tsc --noEmit -p .` → 0. Full SF suite → **1650 pass / 0 fail** (173 files). `git status --porcelain` → the 7 files of the closed list + `action-gate.test.ts`.

## Review

## Amendment 1 (Silver, 2026-11-13) — GO on the action-gate test (closed list + 1 file)
Fanta's find is right: F1 removed the only FE site of `action:bookings.course-extra-session`, so `src/lib/rbac/action-gate.test.ts` fails 2.
**Add `src/lib/rbac/action-gate.test.ts` to the closed list.** Change, nothing else:
1. Delete l.70 `"src/components/partials/Bookings/PlanModal.tsx → action:bookings.course-extra-session",` from `SITE_INVENTORY`.
2. l.338: the expected no-site list becomes `["action:bookings.course-extra-session", "action:people.student-create", "action:teachers.calendar-link"]` (this order: the filter keeps `KEY_INVENTORY` order, and bookings comes before people).
3. l.326 title «exactly two keys» → «exactly three keys»; l.334–335 comment: add *«and the charged extra session, its button hidden on ขวัญ's ask 2026-11-13 (TASK-980 F1)»*.
- The key stays in `actions.ts` and `KEY_INVENTORY` (the BE still has it; it can come back with the button) [SA-decided].
**Done =** the full SF suite → **1650 / 0** (paste the totals line) · tsc 0 · `git status --porcelain` = the closed list + this file.

### Review — Silver (SA-B) · 2026-11-13 · ✅ DONE
- `git status --porcelain` = the closed list + `action-gate.test.ts` (8 files, +82 −63). `npx tsc --noEmit -p .` → 0 (my run). The 4 touched test files → **81 pass / 0 fail** (my run, bun test). Fanta's full suite 1650 / 0 accepted.
- Diff read: F1 PlanModal button block removed, `Ticket` import dropped, extra code + keys kept; F2 EN/TH action/title/confirm only, `done` / `ENDED_EARLY` untouched, comment updated; F4 `unchanged` hint gone, the Confirm guard (l.128–129) kept, `hideHints` default false, the dialog passes it, the sale form untouched; F5 EN «Add» / TH «จ่ายเพิ่ม»; action-gate as Amendment 1.
- Security review: none (labels + one hidden button; the server still gates `course-extra-session`).
- **One writer:** released. PlanModal · ChangePatternDialog · WeeklyPatternEditor · dictionaries → **Flash for F3** (through Porter → Sector). The SF tree now carries these 8 uncommitted files; F3 builds on top of them; both go up together on the owner's «ขึ้น git».
