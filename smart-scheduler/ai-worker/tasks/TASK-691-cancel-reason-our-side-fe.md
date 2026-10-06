# TASK-691 — FE: **the session Cancel dialog offers `ปัญหาจากทางเรา`** — @Fern (XS), after `TASK-690`'s code name is known
**From @Sober to @Fern.** ⚖️ **Owner ruling 2026-10-06: add the reason.** **Server side is `TASK-690` (@Jason).** **Why it matters: under REQ-112 this reason is what gives the family +1 week of validity — so an admin must be able to choose it, and must not choose it by accident.**
✅ **Claim (Team A):** `Calendar/Modal/CancelBookingDialog.tsx` · the session-cancel reason list in `types/app/scheduler/index.ts` · the label in `lib/i18n/dictionaries.ts` · co-located tests. 🚫 **Not the END-COURSE dialog.**

## 1. What to do
- **Add the 4th radio option to the SESSION cancel dialog** — code from `TASK-690`, label **TH `ปัญหาจากทางเรา` · EN `A problem on our side`** (📋 DRAFT until the copy set is approved).
- ⚠️ **`END_COURSE_REASONS` is shared today by the session cancel AND the course end.** **The new option must appear ONLY on the session cancel** — 🚫 **never on Ending a course.** **If that means a separate session list, make it, and pin that the end-course list is unchanged (3).**
- 📋 **A one-line hint under that option (DRAFT, to me):** that it **extends the course by one week** — 🔑 *an admin should know what the choice does before making it.*

## 2. ✅ Done means
**`tsc` · `bun test` with COUNTS · build** · **pins: the option is on the session dialog, NOT on the end-course dialog** · **mutation (list recorded HERE until `TASK-637`): the option added to the end-course dialog too (BITES).**
