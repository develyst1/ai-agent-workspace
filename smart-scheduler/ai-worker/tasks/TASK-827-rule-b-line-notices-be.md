# TASK-827 — BE: **the LINE notices for ruling B** (DESIGN §4, D5) — @Jason (S ≈ 0.55 d incl. +10 percent) — after 826
**From @Sober, 2026-10-20.** Source: REQ-125 ruling B (owner: *"B"*), the design `DESIGN-REQ-125-one-teacher-leaves-a-multi-teacher-class-2026-10-19.md` (**read it whole: it is the spec**). Owner, 10-20: *"D1-D5 ตามแนะนำ ข้อความ OK เริ่มได้"*:
- **D1** the next main = the first extra in **name order**;
- **D2** Cancel leave puts the teacher back **as an extra**;
- **D3** a promoted GROUP coach's ceiling: **the group swap's existing refusal**;
- **D4** no free teacher to be main → **that class is left as it is and listed for the admin** (the D4 sentence), no cancel, no family notice;
- **D5** LINE the remaining coaches: **yes**, one per coach per day.

**The 7 strings in DESIGN §6 are APPROVED word for word** (COPY-REVIEW 2026-10-20). Use them verbatim, marked APPROVED; any change comes back to me.
**Claims GRANTED** as DESIGN §8. **Exception:** `services/other-series.service.ts`. **Ask me before touching it.** Own-team pins: ask me (standing rule). Nothing committed; one release with 824–828.

## Build
- **To each remaining coach**, ONE LINE per coach per day:
  - the approved "{name} is away on {date}. These classes go on with you: {list}";
  - plus "(you are now the main teacher of this class)" where they were promoted.
  - From both the same-day (825) and advance (826) paths. Not on a duplicate; not to the leaving teacher.
- **`teacher_leave_recorded`** gains the approved line "{n} co-taught class(es) continue with the other teachers" when n > 0.
- **Families: never** for a continuing class (tests prove 0 family messages).
- The approved TH/EN strings, verbatim; `line-message.ts` / `line-i18n.ts`.

## ✅ Done means
- Tests by value + a mutation set beside them (each bite shown).
- BE: tsc 0 · SAFE suite · counts · `unhandled-between-tests: N` · migrations N = N. FE: tsc 0 · `bun test` · build.
- `git status --short -uall` in full in your report. Nudge me after each task; I verify before the next.

---
## ✅ 2026-10-20 — Jason (BE) → @Sober: TASK-827 GREEN — the LINE notices for ruling B (D5 + the leaver's extra line), approved strings verbatim. Back only, nothing committed.
**The 3 APPROVED strings, verbatim, TH + EN (`line-i18n.ts`, marked «✅ APPROVED by the owner 2026-10-20 (REQ-125 ruling B), COPY-REVIEW-2026-09-29.md, verbatim»):**
| key | TH | EN |
|---|---|---|
| `ob_tl_coach_continues` — to each REMAINING coach | ครู {name} ลาวันที่ {date} — คาบต่อไปนี้ยังเรียนตามปกติกับคุณ: {list} | {name} is away on {date}. These classes go on with you: {list} |
| `ob_tl_coach_now_main` — suffix on the class where they were promoted | (คุณเป็นครูหลักของคาบนี้แทน) | (you are now the main teacher of this class) |
| `ob_tl_co_taught_continue` — one extra line on the LEAVER's `teacher_leave_recorded`, only when n > 0 | คาบที่สอนร่วม {n} คาบ ครูท่านอื่นจะสอนต่อ | {n} co-taught class(es) continue with the other teachers |
**Code:** new outbox kind **`teacher_coleave_continues`** rendered in `line-message.ts` (payload `{ leaver, date, classes: [{ startTime, title, becameMain }] }`; `{list}` = «title HH:mm» joined by «, », the suffix on a promoted class only; date as dd-mm-yyyy). `teacher_leave_recorded` appends the extra line iff `continued` > 0 (absent/0 ⇒ **byte-identical** to today; never on the lift). **One function sends them — `sendCoLeaveNotices`** (`scheduler.service.ts`): ONE `enqueueLine` per remaining coach per DAY, `recipientType: "teacher"`, **in the SAME transaction** that took the leaver off (the notice exists iff the change does), called by exactly two committing paths: the same-day act (825, after its loop) and the advance take-off (826, end of the per-day function — so a range sends per day). Duplicates are impossible by construction (a class already off the leaver is not collected again: re-recording a day sends nothing). A coach with no LINE link lands the SKIPPED row (TASK-152). The leaver's payload carries `continued` on the single-day and range records.
**Your conditions, all by value in tests + a mutation each:**
- **P stays true:** the preview never calls the sender; a preview makes **0 outbox rows of ANY kind** (826's condition-P test re-run + a new explicit one; mutation **N12** «the preview enqueues» bites).
- **Families: 0** from both paths for a continuing class (`outbox` has no non-teacher row; the family sender is never even asked) — **N9** «a family is told» bites.
- **One per coach per day:** two co-taught classes, same remaining coach, one day ⇒ ONE message listing BOTH (same-day AND advance); **N7** «one per class» bites.
- **Not to the leaver:** no coach notice to the leaver (the leaver gets only their own `teacher_leave_recorded`) — **N8** bites. The suffix only on the promoted class — **N3** bites; the words — **N1/N2/N4** bite.
**Pin files (as you ruled, listed before editing):** `coach-notice-inventory-task512.test.ts` + `[${S}#sendCoLeaveNotices]` in NAMED_BY_DESIGN (reason: the REMAINING teachers of a co-taught class, a day-level notice; never the leaver, never a family) · `message-trailing-req085-16-3.test.ts` :74/:121, `no-iso-date-leak.test.ts` :104, `no-placeholder-leak.test.ts` :48/:130 — kind count **43 → 44** (+ chain comment). **The three probe files pass with the new kind as-is — no renderer change was needed, no probe touched.** Mine: `same-day-leave-co-taught-task825.test.ts` (captures the enqueued LINEs; coaches get `lineUserId`) and `advance-leave-co-taught-task826.test.ts` (the leaver's notice found by kind; coach-notice assertions; `otherTitle` on the fake row).
**New tests:** `coleave-notices-task827.test.ts` (12: the 3 strings verbatim + marked APPROVED; renderer EN/TH, no title, empty list, no raw ISO/placeholder; the leaver's line at n>0 / 0 / range / lift; the sender is one function in the caller's tx, to a TEACHER, no family sender reachable; both callers) + the by-value sender tests added to the 825 and 826 files.
**Sets (final tree, all CHECKSUM identical, 0 survivors):** **827 13/13** (new) · **826 15/15** · **825 10/10** · 824 11/11 · 823 4/4 · 819 17/17 · 817 16/16 · 815 6/6 · 814 7/7 · 813 8/8 · old 632 8/8 · 634 10/10. **The 4 probe/inventory files: 23 pass / 0 fail.**
**No-.env clean room** (HEAD + my files, no `.env`, `JWT_SECRET` unset): sets 827 13/13 (baseline 57), 825 10/10, 826 15/15 (baseline 63), **suite 5,048 pass / 0 fail**.
**tsc 0 · SAFE suite 5,048 pass / 0 fail, 362 files · unhandled-between-tests 0 · migrations 72 = 72.**
**`git status --short -uall` (back): 76 lines, verbatim in `GIT-STATUS-back-827-2026-10-20.txt`.** New in this task: `coleave-notices-task827.{test.ts,mutations.json}`; changed: `line-i18n.ts`, `line-message.ts`, `scheduler.service.ts`, and the pin/test files listed above.
**New wording beyond the approved 3: none.** ▶️ **Ball: Sober — verify. 828 is Fern's (front); nothing else in my queue for REQ-125.**


---
## ✅ 2026-10-20 — @Sober: TASK-827 VERIFIED. **Ruling B back end COMPLETE (824 · 825 · 826 · 827)**
- **Clean copy** (`01d7f04` + 76 files, no `.env`): tsc 0 · SAFE suite **5,048 / 0**, 362 files · unhandled 0 · **72 = 72**.
- **Sets:** 827 **13/13** · 826 **15/15** · 825 **10/10**, 0 survivors, checksums identical.
- **Copy:** the 3 approved TH+EN strings are present **verbatim** (string-matched against DESIGN §6 / COPY-REVIEW 2026-10-20).
- **Pins:** the kind counts 43 → 44 only; the inventory entry as granted; the probe files pass with the new kind, with no renderer or probe change.
- **Conditions shown by value + biting mutations:** the preview makes 0 outbox rows (N12) · families 0 (N9) · one per coach per day (N7) · not to the leaver (N8) · the promoted suffix only on that class (N3).
- Report written BEFORE the nudge this time. 👍
