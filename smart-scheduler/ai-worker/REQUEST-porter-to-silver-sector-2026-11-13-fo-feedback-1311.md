# REQUEST 2026-11-13 · Porter → Silver (Team B) + Sector (Team C): ขวัญ's front-office notes on sid, 13/11

Source: ขวัญ 15:09–15:13, verbatim `project-docs/customer-2026-11-13-line-som-system/khwan-feedback-2026-11-13-part2-VERBATIM.md`. She is looking at **sid** (plan modal, SOM SCHEDULE). Images read by Porter.
These touch the paid front-office work (REQ-5014 change activity, REQ-5016 pattern). The build pause does not cover the front office. Nothing goes to uat from this until the owner's «release code».

| # | Image / place | Her words | Proposed change | Owner |
|---|---|---|---|---|
| F1 | #2 plan modal buttons | "เจ้าเมนู Add extra (charged) เอาออกได้ไหมคะ ตอนนี้ไม่ได้ใช้" | Hide «Add extra (charged)» | the SA whose file it is (say) |
| F2 | #2 plan modal buttons | "ขอแก้คำ ปุ่ม End Course early เป็น Cancel" | Button label «End course early» → «Cancel» (check it can't be confused with the dialog's own Cancel) | same |
| F3 | #2 + #4 | "ปุ่ม Change weekly pattern = Change Schedule / Coach · ปุ่มนี้กับ Change teacher / time for the rest มันจะเหมือนกันไหมคะ ต่างแค่เลือกวันได้หลายอัน เพราะงั้น ถ้าเสร็จแล้วเอามารวมกันนะคะ ให้เหลือแค่อันเดียวคือ Change Schedule / Coach" | Rename «Change weekly pattern» → «Change Schedule / Coach»; **merge** it with «Change teacher / time for the rest» into one button. **Sector:** is the pattern act a superset of TASK-838's change-teacher-time (one-slot pattern = today's act)? Size + risk. | Sector (design), Silver (TASK-838 side) |
| F4 | #4 Change weekly pattern dialog (3 boxed texts) | "ข้อความพวกนี้เอาออกค่ะ" | Remove: the «Pick the day, time and coach… one row is a normal weekly class» help under New pattern; «One row is a normal weekly class — add a second to make a pattern»; «This is the current pattern. Change a slot to move classes.» | Fanta's ChangePatternDialog (Silver) |
| F5 | #6 / #7 Change activity dialog | "เปลี่ยนกิจกรรม ถ้าส่วนต่างที่ต้องจ่ายเพิ่มใช้คำว่า Add แทน Difference ค่ะ ถ้าไปกิจกรรมที่ราคาน้อยกว่าให้ขึ้นส่วนต่างเหมือนกัน ใช้คำว่า Refund ค่ะ" | Label «Difference» → «Add» when the new activity costs more. **The cheaper case is NOT decided:** REQ-5014 is option A (no refund, shows 0); showing a Refund amount is the owner's call. Until he answers: label only (Add), cheaper case unchanged. | Silver (Bob/Fanta, REQ-5014) |

**Ask:**
1. Silver: F1, F2, F4, F5 (Add label only): which files, who, size. Sector: F3 yes/no + size + risk, with Silver on the TASK-838 side.
2. Do any of these touch SB/SF files that are frozen for the uat release (PLAN-2026-11-13 joint commit)? If yes, they wait for the owner's «release code»; say which.
3. One line each in inbox/PM.md. No build until I say go (F3 and F5 need the owner).

## Answer (Silver, SA Team B, 2026-11-13) — F1, F2, F4, F5 (size only, no build)
Read at SF `dong` = `develop` = `6ffaa6e` (tree clean). All strings live in `src/lib/i18n/dictionaries.ts` (EN + TH).

| # | Where (file:line) | Change | Who | Size |
|---|---|---|---|---|
| F1 | `PlanModal.tsx` ≈ l.580–592 (the «Add extra (charged)» button + its tooltip; key `plan.extra` l.1568) | Hide the button only. The extra-session dialog/code (l.1103) stays, unreachable, so it can come back by one line [SA-decided] | Fanta | XS |
| F2 | `PlanModal.tsx` ≈ l.575 (`endCourse.action`); dialog `endCourse.title` / `confirm` (dictionaries l.211–226) | ⚠️ **Plain «Cancel» clashes:** the same plan modal already has a per-session «Cancel» (`plan.cancelSession`, dictionaries l.1560) and every dialog has a «Cancel» that closes it. **Default: «Cancel course»** on the button and the confirm, title «Cancel this course?». The LINE reason «Course ended early» stays. Also: the old words are **owner-APPROVED verbatim (REQ-126, 2026-10-25)**, so the new label needs his OK, the same as any approved copy. | Fanta | XS |
| F4 | (c) «This is the current pattern…»: `ChangePatternDialog.tsx` l.178 (`changePattern.unchanged`, my Amd 1b) | Remove the text. Confirm still stays off for an unchanged pattern (the guard stays, only the hint goes) | Fanta | XS |
| F4 | (a) «Pick the day, time and coach…» and (b) «One row is a normal weekly class…»: `WeeklyPatternEditor.tsx` l.39 / l.103 (`weeklyPattern.hint` / `.oneRow`) | **Team C's file** (Flash, TASK-970); the editor is shared by the sale form and this dialog. Removing them everywhere is one-line each; removing them in the dialog only needs a prop. → **Sector's call** | Flash | XS |
| F5 | `ChangeActivityDialog.tsx` l.295 (`changeActivity.difference`, l.780 / TH l.3180) | Label only: EN «Difference {x} ฿» → **«Add {x} ฿»**; TH «ส่วนต่าง» → **«จ่ายเพิ่ม {x} ฿»** [SA-decided]. The cheaper case stays «0 ฿ · no refund» until the owner rules on Refund | Fanta | XS |

**Team B total:** one small TASK for Fanta, **≈ 0.25 d** incl. updating 3 DOM tests that assert these strings (`change-activity-task962`, `change-pattern-task972`, `end-course-early-task837`). No BE change.

**Frozen? Yes, all of them.** Every file above is in the SF commit `6ffaa6e` that is merged to `develop` and waits for the owner's «release code» / uat deploy. The owner deploys from the local checkout, so the SF tree must stay clean until he says the deploy is done. **No edit in SF before that.** I cut the TASK now if you want it ready, and Fanta starts after «deploy done» + your go.
**F3 (merge the two buttons):** Sector's design call. Team B side: TASK-838's change-teacher-time is in `PlanModal` + SB `scheduler.service.ts`; I answer Sector's questions through you if he needs them.

## Answer (Sector, SA Team C, 2026-11-13): F3, merge the two buttons (size only, no build)
I read SB `course-pattern-change.service.ts` l.22–75, SB `scheduler.service.ts` l.6762–6808 (`runCourseTeacherTimeChange`, TASK-838), and SF `PlanModal.tsx` ≈l.515–540, all on `dong` today.

**Yes: the pattern act is a superset.** A one-row pattern does what TASK-838 does today, with the same writes:
- the rows move (teacher · date · start);
- the reconfirm goes back to PENDING;
- the freelance holds follow;
- the expiry grows;
- `latestTeacherId` / `coachChangedAt` (TASK-860) are set;
- the coach notices go out;
- a one-slot result leaves no `course_slots` (l.52–53).

So one button, «Change Schedule / Coach», can open the pattern dialog. There are **three gaps**, and the first two are defects today:
1. **The pattern act misses the part-day coach-leave and working-hours checks.** TASK-838 calls `assertTeacherBookable(…, { startTime })` (TASK-965, REQ-5015). The pattern act calls it **without** the time (`course-pattern-change.service.ts` l.39). Without the time, the helper checks neither the part-day leave nor the coach's hours (`scheduler.service.ts` l.1057).
   - So a pattern change can put a class inside a coach's 13:00–15:00 leave.
   - *Inferred from the two call sites; a sid case would settle it.*
   - **Fix:** one argument plus a test (≈0.25 d, Brew).
2. **TASK-838 on a pattern course leaves the old pattern behind.** It sets `weekday` / `startTime` but never touches `course_slots`, so the plan summary and a later resume still read the old pattern.
   - The merge removes this path from the screen.
   - The endpoint stays, but nothing calls it from SF.
3. **A group-seat course has no pattern act** (PlanModal hides the pattern button there, ≈l.530). For those, the merged button opens the existing TASK-838 dialog, so nothing is lost.

**Size [SA-estimate]:**
- SF ≈ 0.5 d (Flash):
  - one button «Change Schedule / Coach»: pattern dialog by default, TASK-838 dialog for a group-seat course;
  - the dialog title renamed;
  - the old button removed;
  - tests for both branches.
- SB ≈ 0.25 d (Brew): gap 1.

**Risk:** low. No migration and no new endpoint. Both acts are already tested and previewed by the server.

**Frozen? Yes.** `PlanModal.tsx`, `ChangePatternDialog.tsx` and `dictionaries.ts` (SF `6ffaa6e`), and `course-pattern-change.service.ts` (TASK-971), are all in the uat release. So the work waits for the owner's «release code» / «deploy done», the same as Silver's items. It also needs one writer with F4 (Fanta's `ChangePatternDialog`): F4 first, then F3.

**Gap 1 is a defect in work that has already shipped to sid** (REQ-5016 AC5 × REQ-5015). Porter's call: whether Tanya confirms it on sid, and whether it rides with the next SB commit or waits.

## Owner decision 2026-11-13 ~19:20: fix gap 1 (D-159-3) BEFORE the uat release
Owner, verbatim: *"แก้ก่อนเลย"*. Tanya reproduced it on sid as D-159-3 (`tests/TEST-159-req5016-weekly-pattern-sid.md`).
- **Sector (Team C):** cut the TASK for Brew: pass `{ startTime }` to `assertTeacherBookable` in `course-pattern-change.service.ts` (≈ l.39), plus a test for part-day leave and working hours. ≈ 0.25 d. Unfreezes SB for this one change only.
- Order after the build: Sector reviews → Porter relays the owner's «ขึ้น git» → owner deploys sid → Tanya re-tests D-159-3 → owner's «release code» for uat.
- Only gap 1. F1–F5, F3 and gap 2 still wait for the uat deploy and the owner's calls.

## Owner decision 2026-11-13 ~19:50: build F1–F5 + F3 NOW, before tonight's uat release
Owner, verbatim: *"คืนนี้ค่อยรีลีสโค้ด … แก้งานให้มันครบแก้งานให้มันหมดก่อนเว้ย"*. The freeze lifts for these items. Release code waits until they pass.
- **Go:** F1 (hide Add extra), F2, F4 (all 3 texts, in the dialog only unless Sector prefers everywhere), F5 label, F3 merge (one button «Change Schedule / Coach»; group-seat → TASK-838 dialog).
- **F2 [PM-decided, owner to see]:** Silver's default «Cancel course» (button + confirm), title «Cancel this course?». Plain «Cancel» clashes with the per-session Cancel.
- **F5 [PM-decided]:** label only: «Add {x} ฿» / «จ่ายเพิ่ม {x} ฿». A cheaper activity stays «0 ฿ · no refund» (REQ-5014 option A). The Refund amount is NOT built; it is the owner's call later.
- **Order (one writer):** F4 in `ChangePatternDialog` (Fanta) first, then F3 (Flash). Silver and Sector agree the sequence between them; tell me the claim line.
- **Then:** reviews → owner «ขึ้น git» → sid deploy → Tanya → «รวมโค้ด» → «release code» tonight.
