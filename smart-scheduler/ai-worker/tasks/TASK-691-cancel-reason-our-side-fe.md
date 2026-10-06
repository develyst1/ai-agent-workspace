# TASK-691 — FE: **the session Cancel dialog offers `ปัญหาจากทางเรา`** — @Fern (XS), after `TASK-690`'s code name is known
**From @Sober to @Fern.** ⚖️ **Owner ruling 2026-10-06: add the reason.** **Server side is `TASK-690` (@Jason).** **Why it matters: under REQ-112 this reason is what gives the family +1 week of validity — so an admin must be able to choose it, and must not choose it by accident.**
✅ **Claim (Team A):** `Calendar/Modal/CancelBookingDialog.tsx` · the session-cancel reason list in `types/app/scheduler/index.ts` · the label in `lib/i18n/dictionaries.ts` · co-located tests. 🚫 **Not the END-COURSE dialog.**

## 1. What to do
- **Add the 4th radio option to the SESSION cancel dialog** — code from `TASK-690`, label **TH `ปัญหาจากทางเรา` · EN `A problem on our side`** (📋 DRAFT until the copy set is approved).
- ⚠️ **`END_COURSE_REASONS` is shared today by the session cancel AND the course end.** **The new option must appear ONLY on the session cancel** — 🚫 **never on Ending a course.** **If that means a separate session list, make it, and pin that the end-course list is unchanged (3).**
- 📋 **A one-line hint under that option (DRAFT, to me):** that it **extends the course by one week** — 🔑 *an admin should know what the choice does before making it.*

## 2. ✅ Done means
**`tsc` · `bun test` with COUNTS · build** · **pins: the option is on the session dialog, NOT on the end-course dialog** · **mutation (list recorded HERE until `TASK-637`): the option added to the end-course dialog too (BITES).**

---

# 📋 REPORT — @Fern → @Sober (2026-10-06) — **TASK-691 DONE: the session Cancel dialog offers `ปัญหาจากทางเรา`, and nothing else does.**

**Front repo re-read first** (tree clean apart from this task's files). **Code `SCHOOL_ISSUE`** — confirmed against Jason's TASK-690 text, not from your nudge alone.

| gate | result |
|---|---|
| **`tsc --noEmit`** | ✅ exit 0 |
| **`bun test`** | ✅ **1064 pass / 0 fail across 119 files** · `unhandled-between-tests: 0` |
| **`bun run build`** | ✅ exit 0 |
**Break-and-watch: 10 mutations, 10 BITES, 0 SURVIVED, 0 NO RESULT, 0 ANCHOR, baseline 11 clean, CHECKSUM identical.**

## What was built
- **A SIBLING list, not a fourth member.** `END_COURSE_REASONS` is shared by **four** dialogs (session cancel · ending a course · ending a voucher · cancelling a series), so adding the code there would have offered *"a problem on our side — extends the course a week"* when **ending** a course, where it means nothing and the hint would be a lie. New: `SESSION_ONLY_CANCEL_REASONS = ["SCHOOL_ISSUE"]` and `SESSION_CANCEL_REASONS = [...END_COURSE_REASONS, ...SESSION_ONLY_CANCEL_REASONS]` — **derived by spread, never re-typed** (Jason's twin is derived the same way). **The end-course contract is unchanged and pinned: three reasons, there is no fourth.**
- **The session Cancel dialog renders the three exactly as before, then the new one**, with the owner's A6 line as the radio's description. **Nothing pre-selected** and Confirm shut until a choice is made — *a pre-selected "our problem" would hand a family a week on every cancel.* **The other three dialogs never mention it** (pinned by source).
- **The wire:** `cancelBooking` / `useCancelBooking` take `SessionCancelReason`; `endCourse` / `endVoucher` still take the three (pinned).
- **Copy, the owner's own (A5 / A6, approved 10-06), verbatim, both languages counted:** `endCourse.SCHOOL_ISSUE` = **ปัญหาจากทางเรา** / *A problem on our side* · `cancelBooking.schoolIssueHint` = *เลือกข้อนี้เมื่อคาบถูกยกเลิกเพราะทางเรา — ระบบจะขยายอายุคอร์สให้ 1 สัปดาห์* / *Choose this when we cancelled the class — the course is extended by one week.*

## ⚠️ One thing beyond the dialog, and why
**The cancelled-sessions tray reads a row's reason.** Without a label, a session cancelled with the new reason would show **no reason at all**. I added it to `cancelReasonDisplay` through **its own branch** (`SESSION_ONLY_CANCEL_REASONS`) and **deliberately NOT to `CANCEL_REASON_CODES`** — that READ set is pinned at four by the frozen `teacher-scope.test.ts`, which I did **not** touch and which still passes. **`cancelled-tray.ts` is outside the file list in your task** — it was needed for the choice to be visible after it is made; tell me if you would rather it were separate.

## Pins
- **Clicked (`cancel-session-reason-task691.dom.test.tsx`, 5 tests):** four radios in order · the hint appears **once**, under the new one only · **nothing pre-selected, Confirm shut, pressed-anyway sends nothing** · choosing it sends `{ action: "cancel", reasonCode: "SCHOOL_ISSUE" }` and an old reason sends **exactly what it always sent** · both languages counted (4 strings).
- **Source (`session-cancel-reasons-task691.test.ts`, 6 tests):** the end-course list is the three · the session list is spread-derived · the read set is not widened · only the session dialog renders the session-only list · the other dialogs never mention it · the wire types.

## Mutation test list (recorded here until TASK-637)
```
src/components/partials/Calendar/Modal/cancel-session-reason-task691.dom.test.tsx
src/lib/scheduler/session-cancel-reasons-task691.test.ts
```
| # | mutation | verdict |
|---|---|---|
| V1 | 🔴 **the code is added to the shared `END_COURSE_REASONS`** (the one you asked for) | **BITES** 5/6 |
| V2 | 🔴 the course-END dialog is switched to the session list | **BITES** 10/1 |
| V3 | 🔴 the session list stops carrying the new reason | **BITES** 10/1 |
| V4 | 🔴 the option is not rendered on the session dialog | **BITES** 6/5 |
| V5 | ⚠️ the hint line is removed | **BITES** 10/1 |
| V6 | 🔴 the new reason is pre-selected | **BITES** 10/1 |
| V7 | ⚠️ the hint is shown under every option | **BITES** 10/1 |
| V8 | ⚠️ the tray stops reading the code | **BITES** 10/1 |
| V9 | 🔴 the READ set is widened instead (the shortcut) | **BITES** 10/1 |
| V10 | ⚠️ the Thai label is not the customer's words | **BITES** 10/1 |

**Files:** `types/app/scheduler/index.ts` · `services/scheduler.service.ts` · `hooks/scheduler/useScheduler.ts` · `Calendar/Modal/CancelBookingDialog.tsx` · `lib/scheduler/cancelled-tray.ts` · `lib/i18n/dictionaries.ts` · new: the two test files and `scripts/mutation/task-691.json`.
**⚠️ For your combined run of 658 + 691:** both sets are filed with their test lists; they touch **different files** except `dictionaries.ts` and `types/app/scheduler/index.ts`, so run them **one after the other**, not at once.

---
## 🔻 @Fern — 2026-10-07 (TASK-694 follow-up): V4–V7 RETIRED, set re-run
V4–V7's subject (the 4th radio + hint on `CancelBookingDialog`) was removed on purpose by TASK-694 ⇒ retired, not re-anchored; **superseded by `task-694.json` W3**. The runner reads a bare array, so retired entries cannot stay inside `task-691.json` without printing NOT RUN; the four are kept (ids, text, reason) in `scripts/mutation/task-691.retired.json.txt`. `task-691.json` now holds V1, V2, V3, V8, V9, V10.
**Re-run from the file, list as recorded above (2 files): V1 BITES 7/6 · V2 BITES 12/1 · V3 BITES 12/1 · V8 BITES 12/1 · V9 BITES 12/1 · V10 BITES 12/1 — 6/6, no NOT RUN, CHECKSUM identical.**
