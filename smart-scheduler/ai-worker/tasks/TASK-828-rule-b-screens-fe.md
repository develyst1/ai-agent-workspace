# TASK-828 — FE: **ruling B on the screens: P7 split counts · "continues with {names}" rows · the strip counts only "to handle"** (DESIGN §2, §6) — @Fern (M ≈ 2.75 d incl. +10 percent)
**From @Sober, 2026-10-20.** Source: REQ-125 ruling B (owner: *"B"*), the design `DESIGN-REQ-125-one-teacher-leaves-a-multi-teacher-class-2026-10-19.md` (**read it whole: it is the spec**). Owner, 10-20: *"D1-D5 ตามแนะนำ ข้อความ OK เริ่มได้"*:
- **D1** the next main = the first extra in **name order**;
- **D2** Cancel leave puts the teacher back **as an extra**;
- **D3** a promoted GROUP coach's ceiling: **the group swap's existing refusal**;
- **D4** no free teacher to be main → **that class is left as it is and listed for the admin** (the D4 sentence), no cancel, no family notice;
- **D5** LINE the remaining coaches: **yes**, one per coach per day.

**The 7 strings in DESIGN §6 are APPROVED word for word** (COPY-REVIEW 2026-10-20). Use them verbatim, marked APPROVED; any change comes back to me.
**Claims GRANTED** as DESIGN §8. **Exception:** `services/other-series.service.ts`. **Ask me before touching it.** Own-team pins: ask me (standing rule). Nothing committed; one release with 824–828.

**HOLD until I say GO:** it builds on TASK-826's published contract. Then start on mocks first.
## Build
- **The dialog's "what saving will do"** (P7, `ReportLeaveDialog.tsx`):
  - today (teacher's door): "cancels N…" + the approved "{n} co-taught class(es) go on with the other teachers, without you.";
  - future / range (admin): + the approved co-taught line.
- **The record result + the leave panel rows** (`LeaveClassRow.tsx`, `LeaveDayPanel.tsx`):
  - a continuing class shows the approved tag "Continues with {names}" and **no action needed**;
  - a `toHandle` / D4 class shows as today, with the approved D4 sentence where it applies.
- **The calendar strip** (`LeaveDayBanner.tsx`): "{n} class(es) to handle" counts **only** `toHandle`.
- Approved strings verbatim; dictionary keys marked APPROVED.

## ✅ Done means
- Tests by value + a mutation set beside them (each bite shown).
- BE: tsc 0 · SAFE suite · counts · `unhandled-between-tests: N` · migrations N = N. FE: tsc 0 · `bun test` · build.
- `git status --short -uall` in full in your report. Nudge me after each task; I verify before the next.

---
## ➕ 2026-10-20 — @Sober: your question RULED. The counts come from a server PREVIEW, never from `additionalTeachers`
- TASK-826 now publishes `previewTeacherLeave`:
  - **teacher's own:** `GET /teachers/me/leave?preview=YYYY-MM-DD`;
  - **admin:** `GET /teacher-leave-days/preview?teacherId&from&to`;
  - per class `outcome: continues | cancel | toHandle | cannot` + `with` names + per-day counts.
- **The dialog reads it** for P7's split and for the "continues with {names}" tags before saving. **No approximation on the front.**
- **Claim addition requested from @Porter:** `src/lib/scheduler/teacher-scope.ts` (Team B's per 10-02): ONE line adding `"GET /teachers/me/leave"` to the scoped calendar's route list (the walk test), if the dialog's call needs it.
- Still **HOLD** until 826 reports its shape.

---
## ✅ @Fern — 2026-10-20 — TASK-828 FE DONE: ruling B on the screens, built on 826's published contract. Nothing committed.
**What shipped (front):**
- **Contract mirrored** in `types/api/contract.ts`: `LeaveContinuedClass · LeaveToHandleClass · LeaveSplit · RestoredLeaveClass · LeavePreview{,Day,Class,Counts,Outcome}`, `continues?` on the list's day, the split keys on the record answers (one day, and each range day + `continuedClasses`), `restored?` on the range lift. **Service + hook:** `getOwnLeavePreview` (`GET /teachers/me/leave?preview=`) · `getTeacherLeavePreview` (`GET /teacher-leave-days/preview?teacherId&from[&to]`) · `useLeavePreview` (mock answer = nothing co-taught).
- **P7, "what saving will do"** → new `Calendar/Modal/LeaveWillDo.tsx` (its own file: the dialog keeps holding no new data hook, TASK-406's pin). **Read from the server's PREVIEW, never from `additionalTeachers`** (a pin forbids that word in every leave screen); nothing is said until the preview has answered, or if it fails. **Teacher, today:** "cancels N" = the TICKED classes the preview does not say continue, + the approved *"{n} co-taught class(es) go on with the other teachers, without you."*. **Teacher, a future day:** "N class(es) stay" = what is left to handle (last-teacher + D4), never the ones that continue. **Admin (day or range):** the approved *"{n} co-taught class(es) will go on with the other teachers; {name} is taken off them."* — asked for that teacher over the span, never for today, with no date, or before a teacher is picked.
- **Rows** (`LeaveClassRow.tsx`): `LeaveContinuesRow` = time + the approved tag *"Continues with {names}"* (the teachers it has NOW, main first), **no Open, no status — nothing to do**; `LeaveCannotNote` = the approved D4 sentence under the left-as-is class (teacher name + time). Used in the one-day result, each day of the range result, and the leave panel (`continues` per day). "Nothing is booked" is no longer said while co-taught classes continue.
- **The strip** counts `bookings` (what the back leaves to handle), never `continues` — a pin checks both the count and that the banner never mentions `continues`. `LeaveDayBanner.tsx` needed no change.
- **Strings:** the 4 FE strings of DESIGN §6, **verbatim, TH + EN, marked APPROVED** (`coTaughtOwn · coTaughtAdmin · continuesWith · cannotTakeOff`); the other 3 are Jason's LINE words.
**Numbers:** `tsc` 0 · `bun test` **1302 pass / 0 fail** (140 files) · `bun run build` exit 0 · `unhandled-between-tests: 0` · new test `leave-co-taught-task828.dom.test.tsx` (24). **Sets (final tree, one runner at a time): 828 22/22 · 818 25/25 · 820 22/22 · 822 18/18**, 0 survivors, every CHECKSUM identical.
**Own-team pins:** exactly ONE, as ruled — `teacher-scope.test.ts` §6 key count **43 → 47** + a declared comment. `teacher-scope.ts` NOT touched (the scoped walk doesn't walk the dialog; it stayed green). A second pin went red on its own — `t-arg-shape.test.ts` (the sweep lists every `t()` site carrying a DTO time) — and I fixed it on MY side (the D4 time is formatted before the `t()` call), no pin edited. **Declared test re-aims (mine):** 818's will-line tests now answer the preview (same numbers asserted); set 818: R12/R14 follow the will-line into `LeaveWillDo.tsx`, R13 (admin door states a count) retired — set 828 guards the admin line instead (W5/W6/W7); set 822: F2c/F2d anchors moved with a wrapper `<div>`.
**⚠️ One thing I must tell you plainly — a mutation was left in the tree for a while, and is fixed.** I started two mutation runs by mistake in the background at the same time; the overlap made one restore fail, and **set 818's R16 (`Math.min(31, …)`) stayed applied in `ReportLeaveDialog.tsx` line 88** until a baseline-not-clean told me. It is restored, and I **audited all seven sets (814 · 816 · 818 · 820 · 821 · 822 · 828) against the tree**: every mutation's original text is present and no mutated text remains (0 suspicious). The final numbers above are from the clean tree, after that.
**Mutation table (828):** W1 cancel counts every tick · W2 co-taught line missing · W3/W4 the future count adds continues / forgets D4 · W5 admin line wrong number · W6 admin line with nothing co-taught · W7/W8 preview asked for today / before ready (incl. an admin with no teacher picked mistaken for the teacher's own door) · W9 a number said before the answer · W10/W11 the preview's wire (day, `to`) · W12/W13 the tag / name order · W14 D4 under every class · W15 "Nothing is booked" while classes continue · W16/W17/W18 continuing rows dropped (one day / range day / panel) · W19 strip counts continues · W20 marker dropped · W21/W22 the approved EN / TH words altered.
**Inventory lines added to `action-gate.test.ts`:** none (no new gate).
**Not proven / open for you:** a real browser; the real preview against the real back (faked at the wire with 826's published shapes). **One thing I did not build because the task did not ask:** after a SAME-DAY leave the dialog still closes on a toast (its counts are right — the back's `cancelled` now counts only the really-cancelled classes); a D4 class left as-is on a same-day leave is therefore not shown to the teacher. If you want the result view for same-day when `toHandle`/`continues` are present, say so — it is a small follow-up.
**`git status --short -uall` (front, on top of committed `90a11da`; 14 files):**
```
 M scripts/mutation/task-818.json
 M scripts/mutation/task-822.json
 M src/components/partials/Calendar/LeaveClassRow.tsx
 M src/components/partials/Calendar/LeaveDayPanel.tsx
 M src/components/partials/Calendar/Modal/ReportLeaveDialog.tsx
 M src/components/partials/Calendar/Modal/leave-range-task818.dom.test.tsx
 M src/hooks/scheduler/useScheduler.ts
 M src/lib/i18n/dictionaries.ts
 M src/lib/scheduler/teacher-scope.test.ts
 M src/services/scheduler.service.ts
 M src/types/api/contract.ts
?? scripts/mutation/task-828.json
?? src/components/partials/Calendar/Modal/LeaveWillDo.tsx
?? src/components/partials/Calendar/Modal/leave-co-taught-task828.dom.test.tsx
```
**BALL: @Sober.**

---
## ✅ 2026-10-20 — @Sober: TASK-828 VERIFIED (fresh run after the mutation incident)
- **Clean copy** of front `692f798` + 14 files: tsc 0 · `bun test` **1,302 / 0** · unhandled 0 · build 0 (the tree unchanged by it).
- **Sets:** 828 **22/22** · 818 25/25 · 820 22/22 · 822 18/18.
- The 4 approved strings verbatim; the one own-team pin (43 → 47) exactly as granted; `teacher-scope.ts` untouched.
- **The strip needs no change:** a class the teacher was taken off leaves their leave list (`ownScopeWhere`), so the count is "to handle" only.
- **The incident:** your overlapping runs left 818 R16 in the tree for a while, and my first verify copied it (1301/1). I audited all 7 front sets against the tree (every `from` present, 0 leftovers), froze you, and re-ran from scratch: clean.
- Your open item (same-day toast / D4 not surfaced) → Porter, as a follow-up.

---
## 🔧 2026-10-21 — @Sober → @Fern: TASK-828 REWORK (TEST-111 F1 + F2). Claim = the same front files as TASK-828 (Porter). Front only
The release is committed (front `3e4a337`, back `55cdb53`). **You are UNFROZEN for this rework.**
- **F1 🟠 the teacher's own SAME-DAY dialog says "cancels 2" when the server cancels 1.** It counts the D4 class (`cannot`: left as is, no family) as a cancel.
  - **Fix:** the counts come **only from the preview's outcomes**, exactly as on the admin's door: cancelled = `cancel`; continuing = `continues`; `cannot` shown with the approved D4 sentence; **never** a count from the session list.
- **F2 🟠 the teacher's own FUTURE-DAY dialog has no co-taught line,** although the preview returns 3 `continues`.
  - **Fix:** the teacher's door shows the approved co-taught line too ("{n} co-taught class(es) go on with the other teachers, without you." for today; for a future day, the same approved P7 line set as the admin's, from the preview).
  - If a future-day line for the teacher's own door has **no approved string**, stop and tell me (no new words).
- **Tests by value:** the TEST-111 cases:
  - same-day with 1 sole + 1 D4 → "cancels 1" + the D4 sentence;
  - future-day with 3 continuing → the co-taught line with 3, on the teacher's door.
- **Mutations:**
  - `cannot` counted as cancel (must bite);
  - the teacher's door missing the co-taught line (must bite).
- **List every pin file before editing.** No two mutation sets at once on one tree. Re-run sets 828 + 818 + 820 + 822, tsc, test, build. Nudge me.
- **NOT in this rework:** O1's confirm wording (waits for the owner) and K1 (waits for the owner).

---
## ✅ @Fern — 2026-10-21 — TASK-828 REWORK DONE (TEST-111 F1 + F2). Front only, no new wording. Nothing committed.
**Pins: none edited** (listed first, as asked — the files I touched are `LeaveWillDo.tsx`, a one-line prop in `ReportLeaveDialog.tsx`, my own 828 test and the sets; no Team A test file changed, and the full suite went green without any).
**F1 — the teacher's own SAME-DAY dialog counted a D4 class as a cancel.** `LeaveWillDo.tsx` own-door counts now come **only from the preview's outcomes**: *cancels N* = the ticked classes whose outcome is `cancel` (a `cannot` — left as it is, no family told — and a `continues` are NOT cancels; a ticked class the preview does not name is not counted either); the approved D4 sentence is shown under each `cannot` class (the MAIN teacher's name from that class's row, the time from the preview; **no guessed name** — if the row is not among the day's rows we hold, no sentence). TEST-111's case: 1 sole + 1 D4 (+ a third class ticked in the list but unnamed by the preview) → **"cancels 1"** + the D4 sentence.
**F2 — the teacher's own FUTURE-day dialog had no co-taught line.** Both days now show the approved co-taught line from `counts.continues` (future day: beside "N class(es) stay", which is `toHandle + cannot`); 3 continuing → "3 co-taught class(es) go on with the other teachers, without you." TH too.
**⚠️ One wording call to confirm (you said stop if there is no approved string):** for the teacher's own FUTURE day I used the approved **"…go on with the other teachers, without you."** (`coTaughtOwn`) — the DESIGN labels it "a teacher's own leave today", but it carries no `{name}` and reads correctly for a future day; the admin's line needs a `{name}` that the teacher's own dialog does not hold. If you would rather have the admin-form there, tell me and I will say what name it should carry. **No new string was added.**
**Tests by value (mine, in `leave-co-taught-task828.dom.test.tsx`, now 31):** same-day 1 sole + 1 D4 → "cancels 1" + the D4 sentence (EN and TH) · only a D4 class → no "cancels" line · the D4 sentence only under `cannot` classes · a D4 class not among the rows → none · future day, 3 continuing → the line with 3 (EN + TH) and "0 class(es) stay" · a future day with nothing co-taught → no line.
**Numbers:** `tsc` 0 · `bun test` **1309 pass / 0 fail** (140 files) · `bun run build` exit 0 · `unhandled-between-tests: 0`. **Sets, one runner at a time (I checked no runner was alive before and after, and audited the tree for leftovers after each: 0): 828 26/26 · 818 25/25 · 820 22/22 · 822 18/18**, every CHECKSUM identical.
**Your two required bites:** **X1** `cannot` counted as cancel (the old `!== "continues"`) → BITES (51 pass / 2 fail) · **X2** the teacher's door missing the co-taught line on a future day → BITES (51 pass / 2 fail). Plus X3 (D4 sentence not shown: 49/4) and X4 (D4 sentence under every non-continuing class: 51/2). Existing W1/W3/W4 and 818's R12/R14 anchors followed the code into the new tail (declared in each set's `_why`).
**`git status --short -uall` (front, on top of committed `3e4a337`; 5 files):**
```
 M scripts/mutation/task-818.json
 M scripts/mutation/task-828.json
 M src/components/partials/Calendar/Modal/LeaveWillDo.tsx
 M src/components/partials/Calendar/Modal/ReportLeaveDialog.tsx
 M src/components/partials/Calendar/Modal/leave-co-taught-task828.dom.test.tsx
```
**Note for you:** running a SUBSET (`src/components/partials/Calendar src/lib/scheduler`) shows 4 red TASK-822 backstop tests that pass in the full run — an existing order-dependency between test files' module mocks, not caused by this rework (the full suite is the gate and is green). **BALL: @Sober.** I stay unfrozen but will not run two sets at once.

---
## ➕ 2026-10-21 — @Sober → @Fern: O1 APPROVED by the owner ("O1 A"). Fold it into THIS rework
- **The conditional line in BOTH cancel confirms** (`cancelBody` one day · `cancelRangeBody` all future days), verbatim (COPY-REVIEW 2026-10-21):
  - **when the leave took the teacher off n > 0 co-taught classes**, replace «คาบที่มีอยู่แล้วไม่มีอะไรเปลี่ยน» / «Existing classes don't change.» with:
    - **TH:** ครู {name} จะกลับเข้าคาบที่สอนร่วม {n} คาบที่ถูกนำออกไปตอนบันทึกลา คาบอื่นไม่มีอะไรเปลี่ยน
    - **EN:** {name} goes back on the {n} co-taught class(es) they were taken off when the leave was recorded. Other classes don't change.
  - **n = 0** → today's text, **unchanged**, word for word.
- **n comes from the list's `continues`** for that day (one day) / the future days of that range (all future days). Never a guess.
- **Tests:** n = 0 → today's sentence; n = 2 → the new one with 2, TH and EN; a range with mixed days counts only the future ones. **A mutation showing the new line at n = 0 must bite.**
- New dictionary key(s) marked APPROVED. **List any pin first** (the §6 key count is own-team: ask me).

## ✅ 2026-10-21 — @Sober: the 828 REWORK (F1 + F2) VERIFIED
- **Clean copy** of front `3e4a337` + 5 files: tsc 0 · `bun test` **1,309 / 0** · unhandled 0 · build 0 (the tree unchanged by it).
- **Sets:** 828 **26/26** (incl. X1 "cannot as cancel" + X2 "no co-taught line on the teacher's future day") · 818 25/25 · 820 22/22 · 822 18/18.
- The tree audited before the run: every `from` present, 0 leftovers.
- **Next in the same tree: O1** (the approved conditional line, above).

---
## ✅ @Fern — 2026-10-21 — O1 DONE (the approved conditional line in BOTH cancel confirms), in the same tree as the 828 rework. Nothing committed.
**What it does:** when the leave took the teacher off **n > 0** co-taught classes, the confirm's «Existing classes don't change.» / «คาบที่มีอยู่แล้วไม่มีอะไรเปลี่ยน» is replaced by the approved «{name} goes back on the {n} co-taught class(es) they were taken off when the leave was recorded. Other classes don't change.» / «ครู {name} จะกลับเข้าคาบที่สอนร่วม {n} คาบที่ถูกนำออกไปตอนบันทึกลา คาบอื่นไม่มีอะไรเปลี่ยน». **n = 0 ⇒ today's body, untouched, word for word.** Done as two new full bodies in `leaveDays` (`cancelBodyRestores` · `cancelRangeBodyRestores`, EN + TH, marked APPROVED 2026-10-21 "O1 A") — the old `cancelBody` / `cancelRangeBody` are not edited.
**Where n comes from (never a guess):** the list's `continues` — **one day** = that day's `continues.length` (the panel's per-day Cancel and the Teachers list's one-day record); **a range** = the sum over its **FUTURE** days only (a day that has begun is not put back): the panel sums `shown` days after today, the Teachers list's record now carries its `rows`. Files: `LiftLeaveConfirm.tsx` + `LiftRangeConfirm.tsx` (a `restoreN` prop, `restoreN > 0` switches the body) · `CancelLeaveButton.tsx` (hands `restores` on) · `LeaveDayPanel.tsx` · `Teachers/TeacherLeaveList.tsx` · `lib/i18n/dictionaries.ts`.
**Pins: none edited** (listed first — the new keys live in `leaveDays`, so the `teacherLeave` §6 count is unchanged; the full suite stayed green with no pin touched).
**Tests (new `Calendar/cancel-restores-o1.dom.test.tsx`, 11):** each confirm directly — n = 0 / no n ⇒ the exact old body, EN and TH · n = 2 (one day) and n = 3 (range) ⇒ the whole approved body with the name and the number, EN and TH, and the old sentence is gone · through the panel: a day with `continues` 2 ⇒ the new body with 2, a day with none ⇒ today's · a range with MIXED days (past day 3, future days 1 + 2 + 0) ⇒ **3, not 6** · future days with none ⇒ today's range body · the Teachers list: a one-day record uses its own day, a range its future days · the approved bodies marked APPROVED once per language, the old two unchanged.
**Numbers:** `tsc` 0 · `bun test` **1320 pass / 0 fail** (141 files) · `bun run build` exit 0 · `unhandled-between-tests: 0`. **Sets (one runner at a time; I checked none was alive before and after, and audited every set against the tree: 0 leftovers): new `task-828-o1.json` 13/13 · 828 26/26 · 820 22/22**, every CHECKSUM identical (820's P11 anchor followed the per-day Cancel's new `restores` prop — declared in its `_why`).
**Your required bite:** **A1** the new sentence shown at n = 0 (one-day confirm) → BITES; **A2** the same in the range confirm → BITES. The rest: A3/A4 the range counts days that have begun · A5/A6 wrong n from the day · A7 name missing · A8/A9 the confirm never switches · A10 the button doesn't hand its count on · A11 marker dropped · A12/A13 the EN / TH words altered.
**`git status --short -uall` (front, on top of committed `3e4a337`; 14 files = the 828 rework's 5 + O1's):**
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
?? scripts/mutation/task-828-o1.json
?? src/components/partials/Calendar/cancel-restores-o1.dom.test.tsx
```
**BALL: @Sober** (verify O1 + the rework together). **Next on my side: TASK-829's FE part** — I'll start it only after you say, since you asked to verify O1 + the rework together first and 829 touches the same dialog.

---
## ✅ 2026-10-21 — @Sober: TASK-828 REWORK (F1 + F2) + O1 VERIFIED
- **Clean copy** of front `3e4a337` + 14 files: tsc 0 · `bun test` **1,320 / 0** · unhandled 0 · build 0 (the real tree unchanged by it).
- **Sets:** 828-o1 **13/13** · 828 **26/26** · 818 25/25 · 820 22/22 · 822 18/18. 0 survivors, checksums identical.
- The front tree is held for the commit together with TASK-829 FE (Fern works on top of it).

---
## 🔧 2026-10-21 — @Sober → @Fern: REWORK F3 (TEST-111 re-check), front only, same claim. ≈ 0.25 d incl. +10%
**Finding:** on the teacher's same-day dialog, the before-save co-taught line and the D4 sentence count the WHOLE day. Only the cancel count follows the ticked sessions. The act touches only the ticked sessions (`input.sessionIds`).
- **Fix: a front filter. No back change.**
  - The preview already answers per class: `days[].classes[] = { bookingId, outcome, with, promoted? }`.
  - Every before-save count and sentence (co-taught n, cancel n, the D4 sentence and its classes) comes from `classes` **filtered to the ticked bookingIds**. Never from `day.counts`, which is the whole day.
  - Preview = act: no ticks changed → the same numbers as today.
  - Apply this on **every door that has ticks**: the teacher's door, and the admin's if it ticks too.
- **No new words.**
- **Tests by value:**
  - 1 sole + 2 co-taught + 1 D4, only the sole ticked → "cancels 1", **no** co-taught line, **no** D4 sentence;
  - the co-taught and D4 classes ticked → their lines with the right n;
  - everything ticked → today's numbers.
- **Mutations:**
  - the co-taught n from `day.counts`;
  - the D4 sentence shown for an unticked D4 class.
  - Both must bite.
- **List pins first.** One mutation set at a time. Re-run sets 829 · 828-o1 · 828 · 818 · 820 · 822, tsc, test, build. Nudge me.

---
## ✅ @Fern — 2026-10-21 — REWORK F3 DONE (TEST-111 re-check): the before-save lines follow the TICKS. Front only, no new words. Nothing committed.
**The fix** (`Calendar/Modal/LeaveWillDo.tsx`, the teacher's own door): the preview's per-class `classes` are filtered to the TICKED bookingIds on a same-day save (the act touches only `sessionIds`), and **every** count and the D4 sentence come from that filtered list — cancel n, the co-taught n, the D4 sentences. **Never `day.counts`** (it is no longer read on the own door; the admin's door has no ticks and keeps its span total). A FUTURE day records the whole day (no chooser, no ticks) so its scope is every class. Preview = act: nothing unticked ⇒ the same numbers as before.
**Pins: none edited** (listed first: the change is in `LeaveWillDo.tsx` + my own 828 test/set; no Team A test file touched).
**Tests by value (mine, `leave-co-taught-task828.dom.test.tsx`, now 37; the fixture gained a 4th class):** 1 sole + 2 co-taught + 1 D4 — **everything ticked ⇒ today's numbers** (cancels 1 · 2 go on without you · one D4 sentence) · **only the sole ticked ⇒ "cancels 1", NO co-taught line, NO D4** · co-taught classes ticked (D4 not) ⇒ the line with **2**, then **1** after unticking one of them, no D4 · the D4 class ticked alone ⇒ its sentence only · nothing ticked ⇒ nothing said · a future day ⇒ the co-taught line counts every continuing class.
**Numbers:** `tsc` 0 · `bun test` **1343 pass / 0 fail** (142 files) · `bun run build` exit 0 · `unhandled-between-tests: 0`. **Sets, one at a time, tree audited after (0 leftovers): 829 17/17 · 828-o1 13/13 · 828 30/30 · 818 25/25 · 820 22/22 · 822 18/18**, every CHECKSUM identical. (Four older mutations' anchors — 828's W2/X2, 818's R12/R14 — moved into the new `scope` code; the runner said ANCHOR MISSING, nothing was applied; re-aimed and the two sets re-run.)
**Your two required bites:** **F3a** the co-taught n from `day.counts` → BITES (55 pass / 4 fail) · **F3b** the D4 sentence for an UNTICKED D4 class → BITES (56 / 3). Also F3c (cancel count ignores the ticks: 56/3) and F3d (the ticks never applied: 54/5).
**`git status --short -uall` (front, on top of committed `99d27a5`; 4 files):**
```
 M scripts/mutation/task-818.json
 M scripts/mutation/task-828.json
 M src/components/partials/Calendar/Modal/LeaveWillDo.tsx
 M src/components/partials/Calendar/Modal/leave-co-taught-task828.dom.test.tsx
```
**BALL: @Sober** (verify F3; I read TASK-830 and start it in the same tree only after your verify, as you ordered).

## ✅ 2026-10-21 — @Sober: F3 VERIFIED
- **The code:**
  - on a same-day leave, every before-save line (cancel n · co-taught n · the D4 sentence) comes from the preview's `classes` filtered to the ticked ids;
  - an advance day uses the whole day.
  - The admin door is always advance (never `sessionIds`), so its whole-day count is right.
- **Clean copy** of front `99d27a5` + 4 files: tsc 0 · `bun test` **1,343 / 0** · unhandled 0 · build 0 (the tree unchanged by it).
- **Sets, one at a time:** 828 **30/30** (F3a/F3b bite) · 829 17/17 · 828-o1 13/13 · 818 25/25 · 820 22/22 · 822 18/18. 0 survivors, checksums identical.
- ▶️ @Fern: TASK-830 GO in the same tree. ONE front list with F3.
