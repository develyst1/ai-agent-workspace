# DESIGN — REQ-125 ruling B: one teacher's leave on a multi-teacher class removes only that teacher; the class runs on — @Sober, 2026-10-19
**For @Porter → the owner.** Design + size only; **nothing is built before your grant.** Code read on back `6bac497` (+ TASK-823 in the tree). Owner, verbatim: *"B"*: remove only that teacher, the class still runs, **the families are NOT told**. Only the **last** remaining teacher's leave keeps today's cancel + family notice.

## 0 · Which classes this touches
- **Multi-teacher classes exist in two shapes only:**
  - an **Other / ECA** booking: main teacher `bookings.teacher_id` + extra teachers in `booking_teachers` (schema `:613`);
  - a **GROUP** class row with extra coaches (on the group row; the children's SEATS are not teachers).
- **The four lesson types** (course, voucher, trial, 1 HR) **always have exactly one teacher** (by construction, schema comment `:604-611`). **They are untouched: their leave stays exactly as today.**
- **"A teacher remains"** = the class has at least one OTHER teacher who is **not on leave that day** (an advance leave recorded, or leaving in the same act). This is what makes "all teachers on leave" come out right (§5).

## 1 · The one new building block: "take one teacher off one class"
A single function used by every path below, never re-written per path:
- **I am an EXTRA teacher** → delete my `booking_teachers` row. That's all. (Extras hold no slot and no freelance budget.)
- **I am the MAIN teacher** → the **next eligible extra becomes main**:
  - `bookings.teacher_id` ← them; their `booking_teachers` row is removed;
  - **their own stored rate** becomes the class's main rate (`teacher_rate_minor`). TASK-625's rule: a teacher is paid at their own rate, never the outgoing one's;
  - **GROUP:** the seats' `teacher_id` and the freelance-budget hold move to the new main. **Reuse `swapGroupTeacher`'s internals** (`scheduler.service.ts:1753`), not a second copy.
  - **"Eligible"** = not on leave that day AND **free in that slot**: the one-teacher-per-slot rule (`bookings_teacher_slot_uq`, schema `:573`) applies to the main teacher only, so an extra may already have their own class at that hour.
  - **"Next" = a fixed order** (see decision D1).
- Nothing else about the class changes: date, time, children, status, the families' view.

## 2 · Every leave path, before → after
| path | today | with B |
|---|---|---|
| **Same-day leave** (teacher's own door; `scheduler.service.ts:3664-3682`) | every class of mine that day → CANCELLED, families + other coaches told | **co-taught with a teacher remaining → take me off (§1); NOT cancelled; families NOT told; the remaining coaches told (§4).** Sole/last teacher → **unchanged** (cancel + make-up + family notice) |
| **Advance leave, one day or a range** (admin door; TASK-813/817) | blocks the day(s); classes untouched, listed for the admin | **co-taught with a teacher remaining → take me off at record time (§1), and REMEMBER it** (§3). Sole/last teacher → unchanged (listed, the admin handles by hand) |
| **Cancel leave** (per day / range; TASK-814/819) | deletes the leave day(s); restores nothing | **also puts me back** on each class I was taken off, if the class is still live and I'm not already on it, **as an extra teacher** (D2) |
| **Revive gate** (confirm / attend / undo / join; `assertNoCoachOnLeave`) | refuses if any coach of the class is on leave | **unchanged rule**. After B I'm no longer on the co-taught classes, so it only fires when I'm still listed (the sole/last case), which is right |
| **New work on my leave day** (`assertTeacherBookable`) | refused | unchanged |
| **"What saving will do"** (P7, TASK-818) | future: "only blocks… N classes stay"; today: "cancels N classes and tells their families" | **split the counts:** N classes **continue with the other teachers** (you're taken off) + M classes cancelled / to handle. New wording (§6) |
| **The record result, the leave panel, the calendar strip** (TASK-818/820) | every class of the day listed "to handle" | **co-taught classes shown as "continues with {names}", with nothing to do.** The strip's "{n} class(es) to handle" counts only the sole/last ones |
| **Admin calendar afterwards** | the class sits in every assigned column | **automatic:** I'm no longer on the class, so it leaves my column and stays in the others'. A promoted teacher becomes the card's main ("With …" lists the rest) |

## 3 · Remembering what an advance leave took off (so Cancel leave can undo it)
- **New table** `teacher_leave_removals` (leave_day id · booking id · was main? · my stored rate). Additive **migration `0071`**, rerunnable.
- **Written** when an advance leave takes me off a class.
- **Read** by Cancel leave to put me back.
- **Cleared** when used, or when the class is cancelled or ended by other means.
- **Same-day leave records nothing** (it cannot be lifted today; that is REQ-123's Phase 2 "undo a today/past leave").

## 4 · Who is told
- **Families:** never, for a co-taught class that continues (the ruling).
- **The remaining coaches of that class: told on LINE.** One message per coach per day listing the classes, e.g. "Camp is away on 20/10: STA ECA 14:00 runs with you (you're now the main teacher)". **NEW wording (§6). Optional:** the owner may say no.
- **The leaving teacher:** as today (an admin-recorded advance leave sends `teacher_leave_recorded`). Its body gains one line: "N co-taught class(es) continue with the other teachers" (NEW wording).
- **The last teacher's leave:** exactly today's notices (families + coaches).

## 5 · Edge cases
1. **All the teachers of a class are on leave the same day:** each leave is taken in order. The first ones are taken off while others remain; **the last one is "the last teacher"**, so today's behaviour applies (same-day: cancel + families; advance: listed for the admin). The result never depends on luck: "remains" counts only teachers not on leave that day.
2. **GROUP:** the extra coaches come off like an Other's extras. **A main-coach promotion moves the seats and the freelance-budget hold** (via the group swap internals). ⚠️ If the new main's freelance ceiling can't hold that hour, the swap's own refusal fires (D3).
3. **No eligible extra can become main** (all clash in that slot or are on leave too): see D4.
4. **A course / voucher / trial / 1 HR:** single teacher, so unchanged.
5. **Rates:** the outgoing teacher's stored rate goes with them (and comes back on Cancel leave). The promoted teacher keeps their own.
6. **Pay counts (REQ-120 later):** they read the class's teachers, so the taken-off teacher is no longer counted for that hour. Correct by construction.

## 6 · NEW wording (DRAFTS for the owner's copy approval; nothing ships before it)
| where | TH (draft) | EN (draft) |
|---|---|---|
| P7 count, a teacher's own leave today (co-taught part) | อีก {n} คาบที่สอนร่วมกับครูท่านอื่นจะยังเรียนตามปกติ โดยไม่มีคุณ | {n} co-taught class(es) go on with the other teachers, without you. |
| P7 / admin range hint (advance, co-taught part) | คาบที่สอนร่วมกับครูท่านอื่น {n} คาบ จะนำครู {name} ออก และยังเรียนตามปกติ | {n} co-taught class(es) will go on with the other teachers; {name} is taken off them. |
| result / panel row tag | สอนต่อโดย {names} | Continues with {names} |
| LINE to a remaining coach | ครู {name} ลาวันที่ {date} — คาบต่อไปนี้ยังเรียนตามปกติกับคุณ: {list} | {name} is away on {date}. These classes go on with you: {list} |
| the same LINE, when they became main | (คุณเป็นครูหลักของคาบนี้แทน) | (you are now the main teacher of this class) |
| `teacher_leave_recorded` extra line | คาบที่สอนร่วม {n} คาบ ครูท่านอื่นจะสอนต่อ | {n} co-taught class(es) continue with the other teachers |
| D4 refusal (if chosen) | ยังนำครู {name} ออกจากคาบ {time} ไม่ได้ เพราะครูท่านอื่นของคาบนี้ไม่ว่างในเวลานั้น — กรุณาจัดการคาบนี้ในปฏิทิน | {name} can't be taken off the {time} class: no other teacher of it is free at that time. Please handle this class in the calendar. |

## 7 · Decisions for the owner (my recommendation first)
- **D1, who becomes main:**
  - **(rec.) the first extra teacher in name order** (stable, no migration);
  - or "in the order they were added", which needs a position column (+0.3 d).
- **D2, Cancel leave puts the teacher back as:**
  - **(rec.) an extra teacher** (safe: extras hold no slot);
  - or back as main (a swap back; it can clash with the promoted teacher's slot).
- **D3, the promoted GROUP coach's freelance ceiling can't hold the hour:**
  - **(rec.) the group swap's existing refusal** (the leave refuses for that class, as D4);
  - or allow it over the ceiling.
- **D4, no other teacher of the class is free to become main:**
  - **(rec.) the leave goes through for every other class, and THIS class is left as it is and listed for the admin to handle**, with the D4 sentence (no cancel, no family notice);
  - or cancel it as if I were the last teacher.
- **D5, LINE to the remaining coaches:**
  - **(rec.) yes**, one per coach per day;
  - or no notice.

## 8 · Size (est + 10%), split, claims
| TASK | who | what | size |
|---|---|---|---|
| A | Jason | the §1 building block (extra / main + promotion, GROUP via the swap internals, eligibility, D1/D3/D4) + its tests | M 2.5 → **2.75 d** |
| B | Jason | same-day path on B (split co-taught vs last; no family notice; remaining-coach LINE) | M 1.5 → **1.65 d** |
| C | Jason | advance leave + ranges on B + `teacher_leave_removals` (**migration 0071**) + Cancel leave restoring (per day + range) + the answers' "continues with" detail | M 2.5 → **2.75 d** |
| D | Jason | the LINE wording + `teacher_leave_recorded` line (after copy approval) | S 0.5 → **0.55 d** |
| E | Fern | the dialog's P7 split counts · the result rows / panel / strip "continues with {names}" · the strip counts only "to handle" | M 2.5 → **2.75 d** |
**BE ≈ 7.7 d (Jason) · FE ≈ 2.75 d (Fern) · ≈ 10.5 engineer-days + my verification.** Order: A → B → C → D (one file family); E after C's contract, on mocks first.
- **Claims (Team A):**
  - **back:** `scheduler.service.ts` (the leave act, the record/lift paths); `lib/teacher-leave.ts`; `routes/api.ts` (only if an answer shape changes); `db/schema.ts` + `drizzle/0071_…` + journal + `migration-witness.ts` + the migration-count pins 71 → 72; `lib/line-message.ts` / `line-i18n.ts` (the new LINE); `types/contract.ts`; new tests + sets;
  - **other-series / group swap internals:** if the reuse needs a small export in `services/other-series.service.ts`, I ask you first (it's Team A's history, but a shared door);
  - **front:** `Calendar/Modal/ReportLeaveDialog.tsx`, `Calendar/LeaveClassRow.tsx`, `Calendar/LeaveDayPanel.tsx`, `Calendar/LeaveDayBanner.tsx` (the count), `lib/i18n/dictionaries.ts` (approved keys only), tests + sets.
- **Separate from TASK-823**, which ships on its own.
