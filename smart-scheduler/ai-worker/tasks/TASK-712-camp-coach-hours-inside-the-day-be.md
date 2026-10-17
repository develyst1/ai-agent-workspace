# TASK-712 — BE: **camp: a coach's own hours outside the day's hours are REFUSED, naming the coach — at BOTH ends** — @Jason (S ≈ ½ day incl. +10 percent) · FINAL ROUND item 3 · after 711
**From @Sober to @Jason, 2026-10-11.** Owner APPROVED — `COPY-REVIEW-2026-09-29.md:592` (item 2): **refused at BOTH ends**, Thai only (server refusals stay Thai). No migration, no front (the dialog already shows the server's sentence).
✅ **Claim (Team A):** back `src/services/camp.service.ts` + tests. File list into this task before touching any existing test.

## The finding (reproduce FIRST)
`tests/TEST-089-req116-sid.md` Part 2 🟡: the day's end moved to 14:00 and coach QACT's own 13:00–15:00 stayed past it — **accepted silently**.

## The refusal — VERBATIM
`วันที่ {date} ครู {coach} ตั้งเวลา {start}-{end} อยู่นอกเวลาของวัน ({dayStart}-{dayEnd}) — ไม่ได้บันทึกอะไร`
(`{coach}` = the nickname as the camp's other refusals print it, `ครู {name}` with a space — TASK-671; times `HH:MM`; `{date}` as the camp's other refusals print it.)

## The rule
- **A coach's OWN hours must sit inside the day's hours:** `start < dayStart` or `end > dayEnd` ⇒ 400 with the sentence. Equal ends are inside.
- **Checked against the day's hours AFTER this save** (the admin may change the day and a coach in one save) — and **also when ONLY the day's hours change**: the stored own-hours coaches of that day are checked against the new window (Tanya's exact case; the front then sends no `teachers[]`).
- **Nothing is written on a refusal** (the whole save is one transaction). The first offending coach is named (say which order you pick).
- Coaches on the day's default hours (no own times) are never refused by this.
⚠️ Existing data outside its day (uat): that day's next save is refused, naming the coach — intended.

## ✅ Done means
- **Reproduce first:** TEST-089's case accepted today (failing test).
- By value: end past the day ⇒ refused, exact sentence · start before the day ⇒ refused · equal ends ⇒ saved · day window shrunk under a stored own-hours coach ⇒ refused, nothing written · day + coach changed together into a valid pair ⇒ saved · default coaches unaffected.
- `tsc` 0 · suite DB-unreachable, every setting blanked · **counts** · `unhandled-between-tests: 0` · `68 = 68`.
- **Mutations:** the end not checked · the start not checked · a day-only change not checked · checked against the OLD day window · the sentence changed. Regression: the camp sets of TASK-707's back half if any, `req104/105` camp tests.
**Then:** my verification → owner commit → sid (@Tanya: TEST-089 Part 2) → uat. No git.

## ✅ 2026-10-11 — @Jason: `TASK-712` BUILT — a camp coach's own hours outside the day's hours are REFUSED at both ends, naming the coach — 6 / 6 bite
**FILES: one source file, two new files, NO existing test touched.** `src/services/camp.service.ts` · new `src/services/camp-own-hours-inside-day-task712.{test.ts,mutations.json}`. (The existing camp tests — `camp-day-rate-req104`, `camp-per-coach-window-req105`, `camp-close-gates…`, `camp-on-grid…` — pass unchanged: their fixtures keep coaches on the day's default or inside it.)
**Numbers — CLEAN ROOM again** (HEAD `8431b33` + my 3 files; the shared tree is red right now with ~18 failures in the i18n / message-wording tests — that is Bob's `727` mid-edit in `line-i18n` / `line-message`, none of it camp): **`tsc` 0 (5.6.3) · DB-unreachable suite, no connection settings: `4411 pass · 0 fail` · `unhandled-between-tests: 0` · `68 .sql = 68 tags`.** **Set `camp-own-hours-inside-day-task712.mutations.json` — 6 / 6 BITE** (A end not checked · B start not checked · C a day-only change not checked · D checked against the OLD window · E the sentence changed · F check runs before the coaches' write), CHECKSUM identical. Regression `716` 11/11 · `713` 7/7 · `710` 4/4 re-run in the clean room, all bite (the camp tests ran inside the full suite, green).
### The rule (as ruled)
`assertOwnHoursInsideDay(tx, date, dayId, dayStart, dayEnd)` in `updateWeekDay`, **after** the day row and the coaches' rows are written in the transaction and **before** the sync: it reads the coaches' STORED rows back, takes those with OWN hours, and the first (in the day's own order — start time, then id) with `start < dayStart` or `end > dayEnd` ⇒ **400 with the owner's sentence, verbatim:** `วันที่ {date} ครู {coach} ตั้งเวลา {start}-{end} อยู่นอกเวลาของวัน ({dayStart}-{dayEnd}) — ไม่ได้บันทึกอะไร` (`{coach}` = the nickname with the literal space as TASK-671's refusals print it; times `HH:MM`; `{date}` = the camp's own `YYYY-MM-DD`, as its SLOT_TAKEN refusal prints it). **Equal ends are inside.** Because it reads AFTER this save's writes: a day + a coach changed together are judged as a pair, and **a day-only change is checked against the stored own-hours coaches** (Tanya's exact case — the front sends no `teachers[]`). Coaches on the day's default (NULL hours) are never refused. One transaction ⇒ a refusal writes nothing (the test's fake transaction rolls its recorded writes back, so "nothing written" is read, not assumed).
### By value
TEST-089 Part 2 reproduced as a failing test first (mutation A/C = the old behaviour accepts it): day PATCHed to end 14:00 with QACT 13:00–15:00 ⇒ refused, exact sentence, 0 writes, sync never ran · day-only change under a stored own-hours coach ⇒ refused, 0 writes · own start before the day ⇒ refused · equal ends ⇒ saved · day 10–15 → 08–12 with QACT moved to 09–11 in the same save ⇒ saved · default coaches with the day shrunk ⇒ saved · two offenders ⇒ the earlier-starting one is named.
### Said, not hidden
- **Only the DAY save is guarded (as briefed).** The WEEK-level window change (`updateWeek`, `windowStart`/`windowEnd`) re-derives the un-edited days and "touches nobody's own hours" — a coach with own hours outside the new week window is still accepted there, same defect, not in this brief. Say if you want it.
- **`createWeek`** has no coach hours (it only sets the window and the roster) — nothing to check.
- **Existing data outside its day (uat):** that day's next save is refused, naming the coach — intended, per your note.
- The comment on `setDayTeachers` ("a coach may sit OUTSIDE the day's default, deliberately") was the retired rule; rewritten to the new one.
▶️ **Ball: Sober — verify 712 (clean room) → owner commit → sid (@Tanya, TEST-089 Part 2) → uat. Next: 717; 711 waits for "727 landed".**


---
## ✅ 2026-10-11 — @Sober: VERIFIED (clean room HEAD `8431b33` + the 3 files) · ▶️ §B ADDED — the WEEK-level window change follows the same rule
**Re-run by me:** tsc 0 · `4411 / 0` (332 files) · unhandled 0 · set **6/6 BITE**, CHECKSUM identical · the 3 files md5-steady across my run · `camp.service.ts` diff = 712 only (no Team B line).
**§B — your question, ruled:** yes. The owner's rule is *a coach's own hours inside the day's hours, at BOTH ends*; a WEEK window change (`updateWeek`) that re-derives the days into a window that leaves a stored own-hours coach outside is the SAME defect by another door. ⇒ **refuse it with the SAME sentence** (the first offending day + coach, your order), nothing written. Reuse `assertOwnHoursInsideDay` per re-derived day. Same file, same set (add mutations: the week door not checked · checked against the old window). **Do it AFTER 717, before 711.** XS–S ≈ 2 h incl. +10 percent. Report as an addendum here.

## ✅ 2026-10-11 — @Jason: `TASK-712 §B` BUILT — the WEEK-level window change follows the same rule, by the other door — 9 / 9 bite (6 + 3)
**FILES: `src/services/camp.service.ts` (source) · my own `camp-own-hours-inside-day-task712.{test.ts,mutations.json}` (extended). NO existing test touched.**
**Numbers — clean room (HEAD `8431b33` + my files; Bob's 727 is still open in the shared tree):** `tsc` 0 · suite `4427 pass · 0 fail` · `unhandled-between-tests: 0` · `68 = 68`. **Set: 9 / 9 BITE** (the 6 of the day door + **G** the week door not checked · **H** the week door checked against the OLD window · **I** the days not taken in date order), CHECKSUM identical; `717` 4/4 and `716` 11/11 re-run, bite.
**The change:** in `updateWeek`, for each RE-DERIVED day (`edited_at IS NULL`, as before), after the day's window and (if sent) its roster are written and before its sync: `assertOwnHoursInsideDay(tx, d.date, d.id, ws, we)` — **the very same function and the very same sentence** as the day door, judged against the NEW week window. The first offending day + coach is named; **the days are now taken in DATE order** (`[...days].sort(…)`) so "the first offending day" is a fact, not an accident of the read; one transaction ⇒ nothing is written (an earlier valid day's sync is taken back with it — the test's fake transaction rolls the writes AND the inserts back). Days an admin edited by hand are not re-derived and not judged. A roster change alone (`teacherIds`) clears own hours (rows are re-written without times) so it can never trip the rule.
**By value (4):** narrowing the window under a stored own-hours coach of a re-derived day ⇒ refused, the exact sentence naming THAT day, 0 writes, 0 inserts · two offending days ⇒ the EARLIER date named whatever the read order · a widened window ⇒ saved, default-hours coaches never refused · a hand-edited day is not judged.
**Not changed:** `createWeek` (no coach hours to judge). The existing camp tests (`129`) pass untouched.
▶️ **Ball: Sober — verify §B. Then I am waiting only on "727 landed" for 711.**

