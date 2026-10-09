# TASK-707 — FE: **REQ-116 — saving a camp day sends each coach's hours WHOLE: both times when they are the coach's own, neither when they are the day's** — @Fern (S, ≈ ½ day) · 🔴 LIVE on uat, the camp starts MON 12 Oct
**From @Sober to @Fern, 2026-10-08.** `requirements/REQ-116-camp-add-coach-false-clash-and-time-refusal.md` — Khwan's two refusals in the camp week's edit dialog. **One cause for both, in ONE front function. No back-end change. No new words. No migration.**
✅ **Claim (Team A, @Porter's batch):** front `src/lib/camp/grid.ts` (`teacherEntry` / `dayPatch`) · `src/components/partials/Camp/OpenWeekDialog.tsx` (only if needed) · their tests. 🚫 Back end untouched.

## The cause (read in code: front `f60d7e7`, back `6f7a40f` = what uat runs)
`teacherEntry` (`grid.ts`) sends a coach's `startTime` / `endTime` **each only if it differs from what the server sent** for that coach. The server (`camp.service.ts` `setDayTeachers`) treats the coach row as **a whole replacement**: times omitted ⇒ `NULL` ⇒ *"use the day's window"*, and **one time without the other ⇒ 400**. So:
- **Symptom 1 — the false clash naming another coach:** adding Kowjoe changes the roster ⇒ **every** coach is sent. **Bank had his OWN hours (10–12); unchanged, so `teacherEntry` sends him with NO times ⇒ the server resets him to the day's window 10–15 ⇒ the sync wants Bank at 13:00 ⇒ Bank's private class at 13:00 ⇒ `409 SLOT_TAKEN` "… 13:00 ครู Bank มีคาบแล้ว".** The message is TRUE about the state the save would have created — it is the save that is wrong.
  🔴 **And when no clash happens, the same save SUCCEEDS and SILENTLY widens every own-hours coach to the full day** (more camp blocks, more hours on their schedule).
- **Symptom 2 — "set both times" when both are set:** Toth and Pop on the day's 10–15, set to **13:00–15:00** ⇒ start changed, **end equals what the server sent (15:00) ⇒ omitted** ⇒ the server gets a start without an end ⇒ 400 *"ครูที่ตั้งเวลาเองต้องระบุทั้งเวลาเริ่มและเวลาจบ"*.

## The fix — `teacherEntry` decides per COACH, against the DAY's window, and never sends half
For each coach on the edited day:
- **the coach's edited window ≠ the edited day's window ⇒ send BOTH `startTime` and `endTime`** (their own hours, kept or changed);
- **equal to the day's window ⇒ send NEITHER** (on the day's default — a later day-window change still reaches them, which is what the old comment wanted).
- **A half-typed window** (one box empty) is the admin's own unfinished input: **keep today's behaviour** (send what was typed; the server's 400 says so) — 🚫 do not invent the other half.
- Rates: unchanged.
⚠️ **Compare against the EDITED day window** (the admin may change the day's hours and a coach's in the same save).

## ✅ Done means
**`tsc` · `bun test` with COUNTS · `unhandled-between-tests: 0` · build** · **by value (the body sent):**
- add a coach to a day where another coach has OWN hours (Bank 10–12, day 10–15) ⇒ Bank is sent **`{ startTime: "10:00", endTime: "12:00" }`**, the new coach with no times;
- set a coach from the day's 10–15 to **13–15** ⇒ **both** times sent (no half);
- set a coach back to exactly the day's window ⇒ **neither** sent;
- change the DAY's window with a coach on the default ⇒ that coach sent with neither (follows the day); a coach with own hours ⇒ both (keeps them);
- a genuinely half-typed coach ⇒ unchanged behaviour;
- an untouched day ⇒ still no PATCH at all.
**Mutations (`{tests, mutations}` set — TASK-637):** an own-hours coach sent without times · only the changed half sent · compared to the server's window instead of the day's · a default coach sent with times (freezes them).
⏱️ **Size: S ≈ ½ day (estimate ≈ 3 h + 10 percent ≈ 3½ h).** Bigger ⇒ say so at once. **Then: my verification → owner commit → sid (front only) → @Tanya → uat — front-only redeploy, no migration.**

---
## 📋 @Fern REPORT — 2026-10-08 — 🔨 BUILT, ready for @Sober (size: inside the ½-day estimate)
(Re-read the front repo first: `grid.ts`, `OpenWeekDialog.tsx`, the two camp tests.)
**The fix (`src/lib/camp/grid.ts`, `teacherEntry` + `dayPatch`):** `teacherEntry` now takes the EDITED day's window as a third argument and decides per coach: a touched window ≠ the edited day's ⇒ **BOTH times**; equal to the edited day's ⇒ **NEITHER**; an **untouched** coach is judged by what the server sent — on the day's ORIGINAL window ⇒ default ⇒ neither (never frozen), on his own window ⇒ both; **half-typed ⇒ today's behaviour** (sent as typed, no invented half); cleared (both blank) ⇒ neither; rates untouched. `dayPatch` passes the edited day and — because an unchanged own-hours coach now rides whole — decides "did a coach change?" by comparing each entry with what the SAME coach produces untouched (so an untouched day still sends **no PATCH**). `OpenWeekDialog.tsx`: **one stale comment** corrected (it said `teacherEntry` omits unchanged values); no behaviour.
**By value, your bullets (`camp-day-whole-windows-task707.test.ts`, 14 tests):** add Kowjoe (Bank 10–12, day 10–15) ⇒ Bank `{startTime:"10:00",endTime:"12:00"}`, Toth and Kowjoe no times · Toth 10–15→13–15 ⇒ both · end-only change ⇒ both · Bank back to the day's 10–15 ⇒ neither · cleared ⇒ neither · day window changed: default coach neither, own-hours coach both (`teacherEntry`) · day + coach changed in one save compared with the EDITED day (11–16 = the day ⇒ follows; 12–16 ⇒ both) · half-typed unchanged · untouched day ⇒ `null` / `[]` · a changed rate still rides beside a whole own-hours coach.
⚠️ **One reading to confirm:** your bullet *"change the DAY's window with a coach on the default ⇒ that coach sent with neither; own hours ⇒ both"* — I implemented it in `teacherEntry` (tested directly), but when ONLY the day's times change, `dayPatch` still sends **just the day's times, no `teachers[]`** (today's behaviour; nothing else changed). The coaches keep their rows server-side. If you want `teachers[]` to ride on a day-window-only save, say so — it is one line.
⚠️ **A question for the server side, not a claim:** the server replaces the coach row whole. I send each coach's RATE only when it changed (unchanged rule, "Rates: unchanged"). If a roster change also resets an unchanged coach's rate to the default the way it reset the hours, that is the same defect one field over — worth asking @Jason; I did not touch it.
**One existing pin re-aimed, declared in-file:** `camp-rate-credit.test.ts` expected `{ startTime: "12:00" }` (the changed half only) — that was the defect; it now expects the pair. Claim unchanged (only the touched coach carries times).
**Verification:** tsc 0 · `bun test` **1132 pass / 0 fail, 126 files** · **unhandled-between-tests: 0** · build OK.
**Mutations** `scripts/mutation/task-707.json` (`{tests, mutations}`, run with NO `--tests`, list printed: the new file + `camp-rate-credit.test.ts` + `grid.test.ts`; baseline 37/0; CHECKSUM identical): C1 own-hours coach sent without times — **BITES** 28/9 · C2 only the changed half — **BITES** 25/12 · C3 compared with the server's window instead of the edited day's — **BITES** 36/1 · C4 default coach sent with times — **BITES** 28/9 · C5 untouched-day check lost (sends a PATCH) — **BITES** 32/5. None touches `dictionaries.ts`; nothing here edits it. No git.
**BALL: @Sober** (then your verification → owner commit → sid front-only → @Tanya → uat).
