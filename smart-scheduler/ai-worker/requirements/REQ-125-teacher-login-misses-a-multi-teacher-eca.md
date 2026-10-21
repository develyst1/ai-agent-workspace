# REQ-125: A teacher's own login is MISSING a class that the admin calendar shows in that teacher's column (a multi-teacher ECA/Other)
**Intake:** Khwan, LINE, 2026-10-19/20 (owner's screenshots, 2026-10-20). Verbatim:
> *"ตารางในยูเสอครูหายไป เกิดจากอะไรได้บ้างคะ"*

**Owner:** *"งั้นมาแก้เคสนี้"*.

## What the screenshots show (facts only; the cause is NOT confirmed)
- **Admin calendar, uat, Tuesday 20 Oct 2026, Daily view:**
  - at 14:00, ONE class appears in **three** teacher columns (Camp · Haris · Kid);
  - the class is **"STA / 2.40-3.40 PM / INLINE SKATE"**, booking type **Other**, tag **ECA**;
  - each card says *"With <the others> +1"*, e.g. under Camp: *"With Tarb, Kid +1"*.
- **Teacher Camp's own login on his phone** (`frontoffice.develyst.online` = uat, 18:00), the same day:
  - shown: 10:00 a 1st Trial · 11:00 a 1 HR · 17:00 a course, which match the admin calendar's Camp column;
  - **the 14:00 STA ECA is missing**.
- Khwan sent the teacher's username and password in the chat so the owner could look. **That login is NOT recorded anywhere in this workspace**, and no agent uses it.

## Checked first (the screenshot-is-not-an-intake rule)
- **REQ-097**: a teacher login sees ONLY their own classes ("own" = the user↔teacher link; Sober's read in SPEC-083).
- **REQ-095 / REQ-101**: Other/ECA bookings can carry **several teachers**.
- **Not found:** any rule saying a teacher who is not the first-listed one should NOT see the class. So a co-teacher missing from his own view looks like a defect. **The SA confirms the mechanism before anything goes to Khwan.**

## Order (standing rule: reproduce her situation first)
1. **Tanya, sid (or local if a teacher session needs it), within her limits.** No typing passwords on a non-local host and no creating accounts there. If she needs a teacher session on sid, that is a DATA REQUEST to the owner.
   - Build an Other/ECA class with **3 teachers** on one day, the QA teacher **not first**.
   - The admin calendar shows it in all 3 columns. Does the QA teacher's own view show it? Repeat with the QA teacher **first**.
   - Exact behaviour, screenshots, by value.
2. **SA Sober (Team A, the teacher login, REQ-097):** confirm the mechanism from Tanya's recipe, with file:line. Also check the other "own" reads the same way:
   - the teacher's LINE daily schedule (REQ-016/109);
   - the reminders;
   - check-in on the teacher's own classes;
   - the teacher's own leave (REQ-123: does it see the co-taught class as affected?).

   Then give the fix, its size and the claims.
3. Porter grants → build → Silver/Sober verify → the owner commits → sid → Tanya runs the same recipe on the new build → uat → **then** the answer to Khwan.

**Customer self-serve:** none known yet. If Tanya finds that a teacher can see the class some other way (e.g. a weekly view), it goes to Khwan first.

## Sober's read (2026-10-19, `inbox/PM.md`): ONE place, from code, to be tied to TEST-110
- The own-calendar **fetches** the class: "mine" includes extra teachers (`lib/own-scope.ts:25-29`).
- But the class is then **filed under the MAIN teacher's column only** (`scheduler.service.ts:571`), and a teacher's login receives only its own column (`:516`) ⇒ dropped.
  - The admin calendar looks right because the FRONT copies the class into every assigned column (TASK-227).
- **Every other "own" read already includes extras:** LINE "ตารางของฉัน", the daily reminder, the weekly digest, ICS, check-in, own leave, the daily report.
- **Fix: TASK-823** (Jason, BE XS 0.35 d). GRANTED by Porter 10-19.
- **Side findings:**
  - **(1) for the owner:** a same-day leave by an EXTRA teacher cancels the whole class and tells its families. There is no ruling for "one of three coaches off, the class still runs".
  - **(2)** a group extra coach checking in a single seat may fail: confirm on sid.
  - **(3)** an extra coach doesn't draw on their own FL ceiling: parked for REQ-120 pay.

## Owner ruling, 2026-10-19: side finding 1 = **B** (verbatim: *"B"*)
Asked: when ONE teacher of a multi-teacher class takes leave that day:
- A = cancel the whole class (today's behaviour);
- **B = remove only that teacher. The class still runs, and the families are NOT told.**

**Ruling: B.** Porter's reading, to be confirmed in Sober's design:
- It applies to **any** teacher of the class, the main one included, as long as **at least one teacher remains**. If the main teacher leaves, the next one becomes main.
- **Only when the LAST teacher of the class is on leave** does today's cancel + family notice happen.
- **The same rule for same-day AND advance leave** (REQ-123's ranges, "what saving will do", the leave panel).
- **TASK-823 is NOT held for this.** It ships on its own.

## 2026-10-19: TASK-823 LIVE on uat (back `01d7f04`). TEST-110 PASS on sid. Khwan draft: `COPY-DRAFT-khwan-teacher-missing-class-fixed-2026-10-19.md`. **Ruling-B leave work: the design is waiting on the owner** (D1–D5, 7 strings, GO).

## Owner, 2026-10-20: *"D1-D5 ตามแนะนำ ข้อความ OK เริ่มได้"*
- **D1:** the next main teacher = the first extra in name order.
- **D2:** Cancel leave puts the teacher back as an extra.
- **D3:** the group swap's existing ceiling refusal.
- **D4:** the leave goes through; a class with no free new main is left as it is and listed for the admin (no cancel, no family notice).
- **D5:** LINE goes to the remaining coaches, one per coach per day.
- **The 7 strings: APPROVED** (COPY-REVIEW 2026-10-20).
- **GO: TASK-824…828** (Team A): A 824 · B 825 · C 826 (migration **0071**) · D 827 (Jason) · E 828 (Fern). ≈ 10.5 engineer-days.

## 2026-10-20: ruling B READY (TASK-824…828 verified; `DEPLOY-REQ-125-rule-b-teacher-leave-2026-10-20.md`). back 76 + front 14, **migration 0071**. Follow-up (Sober §5, NOT in this release): after a SAME-DAY leave, a D4 class left as-is isn't surfaced afterwards. A small FE follow-up, parked until after uat.

## Owner, 2026-10-21: *"O1 A, K1 b"*. O1 (Cancel-leave conditional line) is APPROVED and rides the 828 rework. **K1 = TASK-829**: the same-day result view + an admin LINE alert for a D4 class left as is. Its alert string is pending the owner's approval. One release with F1 / F2.

## ✅ 2026-10-21: LIVE on uat (back `fa1a04c` + front `c743304`, migration 0071). TEST-111 + TEST-112 PASS on sid, plus a uat read-only smoke. Khwan draft: `COPY-DRAFT-khwan-coteacher-leave-and-english-address-2026-10-21.md`.
