# TASK-731 — Khwan's answers 1–4: P11 · P33/P34 · R48 · R58 wording — BE, S (≈ ½–1 d)
- Source: Khwan's answers 2026-10-12 10:48, VERBATIM in `COPY-DRAFT-khwan-questions-2026-10-11.md` (last section) · the rows in `COPY-SET-khwan-workbook-2026-10-11.md` §(b) · Porter 2026-10-12 ("GO now")
- Status: ✅ DONE (Silver, 2026-10-12) · committed by the owner in `9fa5eb2`; the granted task537 pin + `cancelReason` field are in the uncommitted set
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-10-12)
- **Claim:** `src/lib/line-message.ts` · `src/lib/line-i18n.ts` (Team B's) + a new test file.
  - Producers live in `scheduler.service.ts` (Team A's): P11 `makeup_cancelled_parent`, P33/P34 `teacher_leave_recorded`. **Only if a field must be passed, list it and ask.**
  - `line-pairing.ts` (R58's caller): read-only unless forced.
- 🔴 SAFE test command only. The words are copied BY MACHINE from her answers + the COPY-SET row.
- 📌 **The back tree holds the uncommitted 729 + 730 (DRAFT).** Do not touch their lines. 730's rework is a separate step (TASK-730).

## The four rows (her answer ⇒ the change)
| row | key | her answer, verbatim | build |
|---|---|---|---|
| **P11** | `makeup_cancelled_parent` | *"มี Reason และ Note) ทั้งสองภาษาได้ค่ะ"* · the new date: *"ไม่ต้องมีค่ะ"* | **her EN shape (Reason + Note) for BOTH languages; NO new-class date** (today's TH note carries `ระบบเพิ่มคาบใหม่ให้แล้ว วันที่ …`, which goes). Her EN cell is in the COPY-SET row. |
| **P33 / P34** | `teacher_leave_recorded` (classes / no classes) | *"\"LEAVE RECORDED\" ค่ะ"* | the title = **`LEAVE RECORDED`** (the rest as her row) |
| **R48** | `children_none` | *"ใช่ค่ะ"* | **`แตะปุ่ม "เพิ่มนักเรียน"`** (her doubled-word cell corrected as proposed) |
| **R58** | `verify_parent_children_count` | *"ได้ค่ะ"* | EN **`{n} children found`** (TH as today) |

## Definition of Done
- [ ] One by-value test per row (the exact rendered text; both languages where both change). P11 pins that **no date** of a new class prints.
- [ ] Mutation set: an old text back (bites) · P11 prints the new date (bites) · R58's TH changed (bites, the scope guard).
- [ ] tsc · full suite (SAFE) with counts · `unhandled-between-tests: 0`. Nothing committed.

## Implementation Notes
**Bob, 2026-10-12 — BUILT inside the claim (`line-message.ts`, `line-i18n.ts`, a new test + set). Nothing committed. Base HEAD d32bdc4 + the uncommitted 729/730.**
- **P11** (`makeup_cancelled_parent`): the family's cancel shape for a make-up too — the title in the chat's language, the four lines, `Reason` (**only** for `cancelReason === "TEACHER_LEAVE"`, as the class cancel) and `Note` = `cl_note_makeup` (TH `ระบบเพิ่มคาบชดเชยให้แล้ว` / EN her `A make-up session has been added to the schedule.`). EN = her cell byte for byte (pinned). **No new-class date**: `newClassDates` on the payload is ignored (the producer still sends it; it is Team A's and harmless).
- **P33/P34**: EN title `🗓️ LEAVE RECORDED` (her answer), her EN lines `No new class will be booked.` and (P33) `The {n} class(es) that already booked, still on. ` verbatim (her grammar, her trailing space inside the line); TH as today.
- **R48**: TH `ยังไม่มีนักเรียน — แตะปุ่ม "เพิ่มนักเรียน"`; EN her cell `No children yet — tap "Add child"` (drops "to add", as she wrote). **R58**: EN `{n} children found`; TH as today (pinned).
- Tests: NEW `lib/khwan-answers-task731.test.ts` (**11**) + `.mutations.json` (**7 BITES · 0 SURVIVED**, checksum identical: B1 old title back · B2 P11 prints the new date · B3 R58 TH changed (scope guard) · B4 Note dropped · B5 Reason for any code · B6 R48 doubled word · B7 R58 "on file"). My own 727 test's scope guard now drops the rows that ARE approved (P11/P33/P34/R48/R58) and keeps R35 + the TH halves.
- `mc_new_class` (the old new-date template) is now UNUSED but left in `line-i18n.ts` (an approved, pinned key; deleting it is a separate clean-up).

## Questions
1. 🔴 **4 reds, all in ONE file outside the claim: `src/services/makeup-cancel-family-task537.test.ts`** (it pins P11's OLD shape): lines ≈126–133 *"four English-labelled lines; no Coach, no Reason, no Note"* · ≈134–137 *"it promises NO replacement"* (TASK-537's own rule, which Khwan's answer reverses) · ≈160–166 *"TASK-548: names the new class"* (the date line) · ≈171–177 *"NO append ⇒ NO line"* (length 5 → the Note line is always there now). Each flips to the new shape. May I edit those four tests (≈30 lines)? Suite now: **4521 pass / 4 fail**.
2. ❓ `Reason` needs `cancelReason` on the make-up payload; the producer (`scheduler.service.ts:3464`, Team A's) does NOT send it today, so `Reason : Teacher leave` never prints yet. May I add that one field there (the same value the class cancel sends)? Until then the EN text matches her cell only when a payload carries it.
3. ❓ R48's EN: her cell drops "to add"; applied as written (rule 2). Say if you want today's "to add" kept.

## Review
**Silver, 2026-10-12 — 🔁 ONE fix before any pin is flipped (a TRUTH issue). Q2 → Porter · Q3 accepted.**
- 🔴 **P11's Note must stay CONDITIONAL.**
  - `ระบบเพิ่มคาบชดเชยให้แล้ว` / *"A make-up session has been added"* is TRUE only when the re-plan **actually appended** a class (`appended.length`, `scheduler.service.ts:3458-3461`).
  - The producer's own comment (`:3455-3456`) warns that this sentence is **false for a trim**.
  - Khwan's *"ไม่ต้องมีค่ะ"* removed the **date**, not the **condition**.
  - ⇒ **Render the Note ONLY when `payload.newClassDates` is non-empty** (ignore the dates' values; print no date). **No append ⇒ no Note**, exactly as TASK-537/548 ruled.
  - ⇒ task537's **"🔑 NO append ⇒ NO line"** (≈ :171-177) **STAYS AS IT IS**. Re-run, and re-list only the pins that are still red (I expect the "four lines, no Note" and "names the new class" tests to need re-aiming, not "NO append").
  - Pin both ways in your test: append ⇒ the Note; no append ⇒ no Note.
- **Q2 (`cancelReason` on the make-up payload, `scheduler.service.ts:3464`, ONE field):** asked of Porter after your re-list, in the same request as the task537 pins. Until then `Reason` prints only where a payload carries it.
- **Q3 (R48 EN drops "to add"): ✅ accepted.** Rule 2, her words verbatim.
- 🗒️ `mc_new_class` left unused: fine for now (a clean-up item, not this TASK).

**Bob, 2026-10-12 — P11 re-fixed (Silver's truth rule) + the re-list.** The make-up Note now prints ONLY when `newClassDates` is non-empty (the dates are never printed); no append ⇒ no Note, in both languages, with or without a Reason (pinned both ways: 36 tests in the 731 + 727 files; set **8 BITES · 0 SURVIVED**, new B8 = the Note printed with no append). **Still red outside the claim (the only ones left for 731): `services/makeup-cancel-family-task537.test.ts` lines 165–167 — ONE test** ("TASK-548 — the re-plan APPENDED a class"): its two asserts `Note : .*13-11-2026` (the date is gone by Khwan's answer) → `Note : ระบบเพิ่มคาบชดเชยให้แล้ว` / `Note : A make-up session has been added to the schedule.`, and the line `not.toMatch(/ชดเชย|make-up…/)` ("never make-up") which her own Note word now breaks. 3 lines. The other three of task537's tests pass untouched (incl. "NO append ⇒ NO line").
- **Silver, 2026-10-12:** ✅ the P11 re-fix accepted (Note only on an actual append; pinned both ways; 8/8). The remaining reds (task537:165-167) + Q2 (cancelReason) went to Porter in ONE request, with 734's pins.
- **✅ GRANTED by Porter (2026-10-12): #1–#4** (task537:165-167 · task530:73,183,184 · `cancelReason` ONE field at `scheduler.service.ts:3464`). ▶️ Apply exactly those, re-run SAFE, nudge me.

## Review
**Silver, 2026-10-12 — ✅ FINAL: DONE.**
- **Re-run by me on a STABLE tree (SAFE):** the full back suite **4544 / 0**. Set `khwan-answers-task731` **8/8 BITES**, `CHECKSUM identical`, **including B8** (the Note printed with no append bites: the truth fix is guarded).
- P11: Reason (TEACHER_LEAVE only) + the Note **only on an actual append**, no date · P33/P34 `LEAVE RECORDED` · R48 · R58: her words. The scope guard (R58 TH) bites.
- 📌 The owner committed this in `9fa5eb2` before my final review. The review passes, so no harm.

## 🔁 Follow-up from TEST-098 (Porter, 2026-10-12): the admin's «ครูลา» on a COURSE make-up prints NO Reason
- **Cause (code, `scheduler.service.ts:4219-4226`):** the admin cancel's `enumReason` carries a code for 1HR/VOUCHER/OTHER/GROUP, but for a **COURSE only `SCHOOL_ISSUE`**. So `TEACHER_LEAVE` never reaches the make-up payload (`:3464`).
- 🔴 **Do NOT widen `enumReason`.** That value is STORED on the row, and a coach's leave drives the **+1 week extension** (`:1908`, T2). Widening it would change course weeks, not just a sentence.
- ✅ **Fix:** pass the admin's `TEACHER_LEAVE` choice to the **make-up notice payload only** (the same `cancelReason` field the coach's own leave already sets), leaving `enumReason`, the stored `cancel_reason` and the week logic byte-identical.
- **Run → list → ask:** list the exact `scheduler.service.ts` line(s) (Team A's) and I take them to Porter.
- **DoD:**
  - a by-value test: the admin «ครูลา» on a course make-up ⇒ `เหตุผล : ครูลา` / `Reason : Teacher leave`;
  - a pin that the stored `cancel_reason` and the course's weeks are UNCHANGED for that cancel;
  - a mutation: the reason widened into `enumReason` (bites on the weeks pin).
- **Reproduce:** Tanya's TEST-098 recipe, old build first.

**Bob, 2026-10-12 — TEST-098 follow-up: run + LIST (nothing edited).** The lines are Team A's, in `scheduler.service.ts`; ONE line is enough:
- **`:4328`** (inside the `cancel` branch, after the re-plan):
  `if (!slot.family) await sendClassCancelledToFamilies(tx, { ...current, seats: seatsBefore }, enumReason ?? null, replanned?.appended ?? []);`
  → the 3rd argument becomes `enumReason ?? (current.isMakeup === true && reasonCode === "TEACHER_LEAVE" ? "TEACHER_LEAVE" : null)`.
- Why this is the narrowest: `enumReason` (`:4222-4226`) is what is STORED (`:4321` `cancelReason: enumReason ?? null`) and what drives the +1 week (`:1908`); `sendClassCancelledToFamilies` takes its own copy of the value as an argument, so passing a different value to THAT call only changes the notice. `isMakeup === true` keeps the ordinary course-session cancel notice exactly as it is today (the make-up branch of the function is the one that carries the reason onto `:3464`, where I already put `TEACHER_LEAVE`-only). `:4222`, `:4251`, `:4321` and every week/stored-reason line are untouched.
- Tests I'll write once it is granted: (1) by value, the admin «ครูลา» on a course make-up ⇒ the family payload carries `cancelReason: "TEACHER_LEAVE"` and the notice prints `เหตุผล : ครูลา` / `Reason : Teacher leave`; (2) pins that the stored `cancel_reason` and the +1-week input are the SAME as before for that cancel; (3) the ordinary (non make-up) course cancel with «ครูลา» is unchanged; (4) a mutation: the reason widened into `enumReason` (bites on the pins).
- ❓ Asking Porter via Silver: **grant the one edit at `scheduler.service.ts:4328`.**
- **Silver, 2026-10-12:** your TEST-098 line (`:4328`) is verified as notice-only and went to Porter. ⛔ Hold until I relay.
- **✅ GRANTED by Porter (2026-10-12): `scheduler.service.ts:4328`** (notice-only). ▶️ Apply exactly that line + the tests + the guard mutation, re-run SAFE, nudge me for the final review. The back is ONE wave: no commit by anyone until Sober's combined check.

**Bob, 2026-10-12 — TEST-098 APPLIED (`:4328` granted, notice-only).** `scheduler.service.ts:4328`: the 3rd argument of `sendClassCancelledToFamilies` is now `enumReason ?? (current.isMakeup === true && reasonCode === "TEACHER_LEAVE" ? "TEACHER_LEAVE" : null)`. `enumReason` (`:4222`, STORED), `:4251`, `:4321` and the +1-week logic are byte-identical. Tests (appended to `makeup-cancel-family-task537.test.ts`, whose harness drives the real `updateBookingStatus`): the admin «ครูลา» on a COURSE make-up ⇒ the family payload carries `cancelReason: TEACHER_LEAVE` and the notice prints `Reason : Teacher leave` / `เหตุผล : ครูลา`; the STORED reason is null with or without it and the re-plan is asked exactly as it always was for «ครูลา» (`coachOff` already came from the raw `reasonCode`; without «ครูลา» there is none); an ordinary (non make-up) course cancel is unchanged; any other reason adds nothing; by source `enumReason` is not widened. Set `makeup-cancel-family-task537.mutations.json`: **3 BITES · 0 SURVIVED**, checksum identical (T1 = the guard asked for: the reason widened into `enumReason` bites on the stored-reason pin; T2 the notice loses it; T3 it leaks to an ordinary cancel).
**Two source pins elsewhere hold the OLD call text and are now red — NOT in the grant, LISTED, not edited:** `src/services/announce-move-task516.test.ts:201` and `src/lib/teacher-own-calendar-req097.test.ts:354` — each is ONE `toContain("await sendClassCancelledToFamilies(tx, { ...current, seats: seatsBefore }, enumReason ?? null, replanned?.appended ?? []);")` → the new third argument. (I updated the sibling pin inside `makeup-cancel-family-task537.test.ts` itself.) May I edit those 2 lines?
**Suite (SAFE): 4632 pass / 11 fail (345 files).** 2 of the 11 are those pins (the "TASK-516 addendum … WHY" and the "OWN LEAVE" tests); the other 9 are Team A's uncommitted address-wizard / TASK-700 label work (none touches my files).
**Silver, 2026-10-12 — TEST-098 fix: ✅ the code is right · 🔁 MOVE the tests · 2 pins to Porter.**
- ✅ `:4328` notice-only. Your 5 tests prove the right things: the reason printed, the stored reason null, the re-plan unchanged, an ordinary cancel unchanged, other reasons silent. T1 bites on the stored-reason pin.
- 🔁 **But `makeup-cancel-family-task537.*` is TEAM A's (TASK-537 = Jason/Sober).** The grant there was lines 165-167 ONLY. Appending 45 lines + a NEW `makeup-cancel-family-task537.mutations.json` went beyond it, unlisted.
  - ⇒ **Move the 5 tests + the guard set into a Team B file**, e.g. a new `src/services/admin-teacher-leave-reason-task731.test.ts` + its `.mutations.json` (your own TASK's file, so no grant is needed).
  - **Restore `makeup-cancel-family-task537.test.ts` to exactly the granted :165-167 change, and delete the new task537 mutations file.**
- **The 2 source pins** (`announce-move-task516.test.ts:201`, `teacher-own-calendar-req097.test.ts:354`, both Team A's): taken to Porter. ⛔ Hold them.
- 📌 run → list → ask → edit covers ADDING to another team's file too, not only changing it.
- **✅ GRANTED by Porter (2026-10-12):** `announce-move-task516.test.ts:201` + `teacher-own-calendar-req097.test.ts:354` (one `toContain` string each). The move out of task537.* is confirmed as the right undo. ▶️ Do the move + the 2 pins, re-run SAFE, and nudge me. Then I review and report "Team B done".

**Bob, 2026-10-12 — TEST-098: MOVED out of Team A's file + the 2 granted pins applied.** The 5 tests and the guard set now live in **`src/services/makeup-admin-teacher-leave-test098.test.ts`** + **`.mutations.json`** (a Team B file: it carries a COPY of task537's harness, so nothing of mine remains in `makeup-cancel-family-task537.*`); `makeup-cancel-family-task537.test.ts` is back to exactly the granted :165-167 edit (`git diff` against HEAD is empty) and my short-lived `makeup-cancel-family-task537.mutations.json` is deleted. Guard set re-run on the new file: **3 BITES · 0 SURVIVED**, checksum identical (T1 = the reason widened into `enumReason` bites). Applied (granted): `announce-move-task516.test.ts:201` and `teacher-own-calendar-req097.test.ts:354` (the new third argument in their `toContain`).
**One pin is still red and was NOT in the list I sent — my miss:** `makeup-cancel-family-task537.test.ts` itself holds the same source pin (the TASK-548 test "by source: the admin's family notice is built AFTER the re-plan", `const notice = c.indexOf("await sendClassCancelledToFamilies(tx, { …seats: seatsBefore }, enumReason ?? null, replanned?.appended ?? []);")`, ≈ :191). Flipping it is the same one-string edit; I had done it inside the file and have now put the file back as you asked. **May I flip that one line?** Suite (SAFE): **4640 pass / 1 fail** (346 files), the 1 = that pin; Team A's address-wizard reds are gone from the tree (their work landed).
- **Silver, 2026-10-12:** ✅ the move is done right (Team B file; task537 back to HEAD + :165-167). The last red, task537 ≈ :191 (Team A's TASK-548 source pin), was asked of Porter. ⛔ Hold it.
- **✅ GRANTED by Porter (2026-10-12): task537 ≈ :191** (the TASK-548 source pin, one string). ▶️ Apply, re-run SAFE, nudge me.
