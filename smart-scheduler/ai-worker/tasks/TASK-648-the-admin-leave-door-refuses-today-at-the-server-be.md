# TASK-648 — BE: **the admin leave door REFUSES today and the past — at the SERVER** (QA F1, owner ruling) 🔴 **BLOCKS uat**
**From @Sober to @Jason.** ✅ **Owner ruled 2026-10-04.** 🔑 **His reason: a call that accepts today CANCELS that day's classes and NOTIFIES the families in the same call — one wrong call is irreversible, and the customer has already seen it.** *A door the screen refuses must not be standing open behind it.*

## 1. 📌 How the door came to be open — **mine**
**`TASK-608` (mine) gave the admin door the WHOLE act, both branches. `TASK-611` (mine) made "future only" a rule of the DIALOG alone.** ⇒ **a screen-only rule, with the server behind it accepting today and cancelling.** **Tanya's API call went straight past the screen.**

## 2. 🔴 WHERE the refusal goes — **and where it must NOT go**
✅ **At the ADMIN ROUTE (`POST /teacher-leave-days`), before the act is called.**
🚫 **NOT inside `reportTeacherLeave`.** **Two reasons, both binding:**
1. **The TEACHER's own door (`POST /teachers/me/leave`) shares the act and MUST keep accepting today** — that is a coach's legitimate same-day cancel.
2. **`TASK-608`'s own pin: `onBehalf` decides only WHO IS TOLD, never WHAT HAPPENS, and must never reach the fork.** ⇒ **refusing inside the act on `onBehalf` would break the invariant you built.**
🔑 **Use the SAME predicate — `isAdvanceLeave` — 🚫 never a second date comparison.** **One rule, now asked by two callers; the act still holds exactly one fork.** ⚠️ **If the `isAdvanceLeave(` exactly-once pin counts call sites across files rather than in the act, say so and re-scope it with the reason — do not just loosen it.**

## 3. ✅ Does anything rely on the door accepting today? **I checked: NO.**
**`reportTeacherLeave` has exactly two callers — the teacher's own route and the admin route.** **No job, no internal caller.** ⇒ **refusing at the admin route touches nothing else.**

## 4. ✅ Done means
1. **`tsc` · the no-DB suite with COUNTS · migrations balanced.**
2. 🔴 **Through the ROOT app: admin door with TODAY ⇒ `400`, nothing cancelled, nobody notified · with a PAST date ⇒ the same · with a FUTURE date ⇒ unchanged.**
3. 🔴 **And the teacher's OWN door with TODAY ⇒ still the cancelling act, UNCHANGED.** 🔑 **That is the regression this fix is most likely to cause.**
4. **The refusal sentence names what to do instead (handle the day's classes one by one on the calendar).** 📋 **Draft it; copy is mine.**
5. **Mutations, filed and named: the route guard removed (must BITE) · the guard moved into the act (must BITE, because the teacher's door breaks).**
📌 **The QA line `§1.1` has been CORRECTED to this ruling — the old text kept, quoted, with whose error it was.**

## ✅ 2026-10-04 — @Jason: DONE — refused at the door, with the act untouched
**`tsc` 0 · suite 3887 pass · 0 fail · 65 = 65.** **Set: `src/lib/admin-leave-future-only-task648.mutations.json` — 6 / 6 BITE, baseline 44, CHECKSUM identical.**
- **`if (!isAdvanceLeave(input.date)) throw ADMIN_LEAVE_FUTURE_ONLY();`** at `POST /teacher-leave-days`, **before the act**. 🚫 **Not inside it, and not a second date comparison (`A4` hand-rolls one and bites).**
- ✅ **Through the ROOT app: TODAY ⇒ 400 with the act NEVER CALLED · a PAST date ⇒ the same · a FUTURE date ⇒ unchanged.** 🔑 **"Never called" is asserted, not inferred — the refusal is before the act, not a rollback inside it.**
- 🔴 **The regression you named is pinned: the TEACHER's own door with TODAY still cancels, unchanged.** ✅ **The act still holds EXACTLY ONE fork, and nothing in it reads `onBehalf` to decide what happens — `A2` (guard moved into the act) and `A3` (guard on `onBehalf`) both bite.**
- ⚠️ **§2's question, answered rather than loosened:** the exactly-once pin was scoped to **the act**, where "one fork" is the real claim. **The predicate now has THREE call sites in the product** — the lib's own refusal, the act's fork, the route's guard — **and the test names them, with the route's call pinned separately.** 🚫 **Not a loosened count.**
- 📋 **DRAFT (copy is yours):** *"บันทึกวันลาแทนครูได้เฉพาะวันถัดไปเป็นต้นไป — ถ้าต้องการยกเลิกคาบของวันนี้ กรุณาจัดการรายคาบในปฏิทิน"* — it names what to do instead, and is Thai-only like every refusal beside it.
- ✅ **`A5` is the owner's exact case: the boundary slipping by one, so TODAY is accepted while only the past is refused. It bites.**
- 📌 **`TASK-608`'s `H1` re-cut** — the route now guards first, so `H1` attacks a hand-rolled date comparison replacing the shared predicate. Why and when are in that set's note.
