# TEST-107 — REQ-123 reproduced on sid: a weekly course can't be created when one week falls on the teacher's leave day

**Tester:** Tanya (QA) · **Date:** 2026-10-17 · **Env:** sid (current build), admin, headless · **Brief:** `inbox/QA.md` → "🔴 LIVE: REPRODUCE on sid … (REQ-123)"
**Verdict: ✅ REPRODUCED, exactly as Khwan says, for Private and DUO.** Marking the week as a planned absence does **not** help. **One self-serve route works today** (§4 C). Facts only; no cause.

## Setup (sid, QA data)
- **Leave recorded the way an admin does it:** Teachers → ⋮ → **Record leave in advance** → date **Sat 7 Nov 2026**, reason "QA TEST-107 REQ-123 repro" → **Block this day**.
  - Done for **qatt75** (Private) and **QADT2** (DUO).
  - The server confirmed it each time: `POST /teacher-leave-days` 200, `mode advance`, 0 bookings, 0 families or coaches notified.
- **Course:**
  - New course → student **QAChatOne** (DUO: + QAChatTwo, rate 500);
  - teacher **qatt75** · Private SURFSKATE (DUO: **QADT2** · Duo INLINE SKATE);
  - **4 sessions**, first session **Sat 24 Oct 2026**, 10:00;
  - weeks: 24/10 · 31/10 · **7/11** · 14/11.

## 1. Create as-is → refused
- **Generate plan:** **accepted.** The preview shows 4 rows, including `Sat 07/Nov/26 10:00 qatt75 … PENDING`, with **no warning** about the leave (`02-private-after-generate.png`).
- **Create plan:** **refused.** `POST /courses` → **409 `TEACHER_ON_LEAVE`**. The plan dialog stays open with a red alert, exact text:
  > **ครู qatt75 ลาวันที่ 2026-11-07 — เพิ่มคาบกับครูในวันนั้นไม่ได้ กรุณาเลือกครูอื่นหรือวันอื่น**

  (`03-private-after-create.png`)

## 2. Mark that week as a planned absence ("ลาล่วงหน้า") → still refused
- In the create preview, **7 Nov row → Actions**. The only item is **"Planned absence"**.
- After clicking it:
  - 7 Nov shows **ON LEAVE**, and a week is **appended on Sat 21 Nov** (CONFIRMED · EXTENDED);
  - the footer reads "New plan: 4 sessions · absent 1 · ends 21/Nov/26";
  - the preview answers `absentWeeks:[3]` (`05-private-marked-absent.png`).
- **Create plan:** **refused again, same 409 and the same text** (`05-private-after-create.png`).
- **The request the screen sends** (by value): `sessions` still lists **all 4 dates incl. `2026-11-07`** with teacher qatt75, plus `"absentWeeks":[3]`.

## 3. DUO (the same New course dialog, DUO toggle)
QADT2 on leave 7 Nov · QAChatOne + QAChatTwo · Duo INLINE SKATE:
- **as-is:** 409, «ครู QADT2 ลาวันที่ 2026-11-07 — เพิ่มคาบกับครูในวันนั้นไม่ได้ กรุณาเลือกครูอื่นหรือวันอื่น»;
- **with 7 Nov marked Planned absence** (21 Nov appended): **the same 409 and text.**

DUO is not a separate flow and behaves identically (`13-duo-*.png`).

## 4. What Khwan could do herself today
| Way | Result |
|---|---|
| **A. Change that session's date or teacher in the create preview** | ❌ **Not possible.** In create mode a row's Actions menu holds only "Planned absence". Its Date and Teacher cells have no controls, and clicking them does nothing. |
| **B. Start the course after the leave** (first session Sat 14 Nov) | ✅ **Created** (`POST /courses` 201, "Course registered · Created 4 weekly sessions", course `73f34c29`, 14 Nov → 5 Dec). But it is **not** the course she wants (it loses 24/10 and 31/10). |
| **C. Create with a teacher who is NOT on leave, then fix it in Manage plan** | ✅ **Works.** Course `ec8803df` (QAChatTwo), created with **qatt75b**, 24 Oct → 14 Nov: **201**. Then in **Manage plan**:<br>1. **24/10 → Edit → Teacher qatt75 → Save → "Apply this plan"** ⇒ "Plan updated" ✅.<br>2. **31/10**, the same ⇒ ✅.<br>3. **7/11 → "Mark absence" → Apply** ⇒ 7/11 becomes SICK_LEAVE ("ON LEAVE") and **Sat 21/11 is appended** ✅. The child's leave quota is **not** used (`leaveUsed 0`), and the course window grows (maxWeek 5→6, expiry 21→28 Nov).<br>**Result:** `24/10 qatt75 · 31/10 qatt75 · 07/11 SICK_LEAVE · 14/11 qatt75b · 21/11 qatt75b`. |
| …C, two details she will meet | **(i) One change per "Apply this plan":** if you Edit and then Mark absence before applying, only the last change is applied. Apply after each one. **(ii)** Editing **7/11** itself to the teacher on leave is refused with the same «ครู qatt75 ลาวันที่ 2026-11-07 …» text. **14/11** and **21/11** could not be moved to qatt75 in my run, but only because **my own course B** already has qatt75 at 10:00 on those Saturdays («ครูมีคาบในช่วงเวลานี้แล้ว»). For Khwan, with no such clash, they move like 24/10. |
| D. Remove the leave, create the course, record the leave again | ❌ **Not self-serve:** the front office has **no button to remove a recorded leave day**. The day shows only as a banner, and the screen never calls the delete route. |

**For Khwan, while the fix is built (route C):**
1. Create the course with any other teacher who is free that Saturday.
2. In Manage plan, Edit each week back to Tarb, pressing Apply after each one.
3. On the leave day, press "Mark absence"; a week is added at the end.
4. Edit that added week to Tarb too.

## Left on sid (QA only)
- **Leave days:** qatt75 and QADT2 on 2026-11-07. There's no remove button; they can stay as fixtures for the fix's re-run.
- **Course `73f34c29`** (QAChatOne · qatt75 · 14/11–5/12, PENDING).
- **Course `ec8803df`** (QAChatTwo · from 24/10, as in C).
- Nothing on uat. No family other than QA.

Evidence: `project-docs/qa-2026-10-17/test107/`:
- `01-record-leave-dialog-*` · `02/03/05-private-*` · `08-private-after-leave-*`;
- `09-substitute-*` · `10-edit-*` · `11/12-selfserve-*` · `13-duo-*`.

Scripts (scratchpad): `t107a`–`t107h.js`.

---
## Sober's read-only expectations, checked (Porter's ➕ entry)
- **Refusal text, with and without the planned absence:** expected «ครู <name> ลาวันที่ <date> — เพิ่มคาบกับครูในวันนั้นไม่ได้ กรุณาเลือกครูอื่นหรือวันอื่น». **Seen: exactly that** («ครู qatt75 ลาวันที่ 2026-11-07 — …», and «ครู QADT2 …» for DUO), both ways (§1–§3). ✅ matches.
- **"Change THAT week's teacher in the preview":** ❌ not possible in the create preview (§4 A). It is possible only **after** the course exists, in Manage plan → Edit, and even there 7/11 with the teacher on leave is refused with the same text (§4 C ii).
- **"Create the course without that week":** the only way the create preview offers is **Planned absence**, and that is refused (§2). Sizes are fixed (4 / 6 / 10 sessions), there's no "skip this date", and starting after the leave works but drops the earlier weeks (§4 B).
- 🔁 Per the owner's ruling, **nothing from §4 goes to Khwan**; it stays as facts for the redesign.

---
# §2 — the teacher advance-leave flow, used as an admin (friction list, worst first)
**Owner:** *"การจองวันลาล่วงหน้า ของครู แอบใช้งานยากด้วยนะ"*.

**The job I did on sid** (QA teacher **qatt75**):
- **one day with a class:** Sat 31 Oct (QAChatTwo's course at 10:00);
- **a 3-day range:** Mon 9 – Wed 11 Nov;
- I then looked at what the screens tell me afterwards.

**Click path for ONE day (7 clicks + typing):**
1. Sidebar **Teachers**.
2. Scroll to the teacher's card, press **⋮** (its accessible name is "Edit").
3. Menu **Record leave in advance**.
4. Press the **Date** field.
5. Pick the day (+1 per month forward).
6. Type a **Reason \***.
7. Press **Block this day for qatt75**.
8. Read the result, press **Close**.

Evidence: `test107/s2/01–09`.

| # | Friction | What I saw (by value) | Kind |
|---|---|---|---|
| 1 | **The recorded leave blocks creating a course, even with that week marked as a planned absence**, and the refusal comes only at the last button | **Generate plan** shows the leave day as a normal PENDING row with **no warning**. Only **Create plan** answers «ครู … ลาวันที่ … เพิ่มคาบกับครูในวันนั้นไม่ได้ …». The suggested way out ("เลือกครูอื่นหรือวันอื่น") **can't be done in that preview**: no per-row date or teacher (§1–§4) | dead end |
| 2 | **A recorded leave can't be removed or corrected** | No "remove / undo" anywhere: the dialog, the Teachers card and the calendar banner offer none. A wrong date stays. (The front office never calls the delete route.) | dead end |
| 3 | **No range: each day is a separate round** | The Date field takes **one day** (the picker closes after one click). Mon–Wed = **3 rounds = 24 clicks + 3 page loads, and the reason typed 3 times**. A week of leave would be ~56 clicks. Each round shows its own result and must be closed. | clicks |
| 4 | **The result names the affected classes only by time** | After saving: *"1 class(es) already booked with qatt75 that day: **10:00 – 11:00** · NOTHING HAS BEEN CANCELLED … they are yours to handle one by one"*. There is **no child, course, status or link** to that class, and the only button is **Close**. I had to guess where to go next (the calendar). | guess |
| 5 | **The calendar banner is only a sentence** | Daily 31 Oct: a pill *"qatt75 is away — 1 class(es) to handle"*. It is **not clickable**, doesn't say which class, and isn't next to qatt75's column. In the grid the class is marked only by a **small "person-×" icon** on its card (`08-qatt75-column-31oct.png`). | guess |
| 6 | **Nowhere to see a teacher's upcoming leave** | The Teachers card shows **nothing** after recording (still "Every day … Available"). The column header on the leave day shows nothing either (its "+" slots are simply gone). The only places it shows: the per-day calendar banner, and the refusal message when you try to book. **There is no list of leave days.** | guess |
| 7 | **The entry point is buried and mislabelled** | It lives only in **Teachers → the teacher's ⋮** (that button's name is "Edit"), next to Edit / Change type / Archive. It's not on the Schedule, which is where an admin is when the teacher calls in. | clicks |
| 8 | **The date is pre-filled with tomorrow** | The dialog opens with **"Date 18 Oct 2026"** already set, with no weekday shown. Pressing Block without touching the date records the wrong day, and #2 means it can't be undone. | risk |
| 9 | **The word "leave" means three different things** | (a) the teacher's advance leave ("Record leave", "Block this day", "is away"); (b) the child's **planned absence** in a course plan, which shows the status **"ON LEAVE"** (SICK_LEAVE in data); (c) the **«ครูลา»** cancel reason on a class. In the create preview, a week marked "Planned absence" reads "ON LEAVE", right beside the teacher-leave refusal. | unclear words |
| 10 | **"Reason \*" is required free text** | No hint and no choices; it's re-typed on every day of a range. | clicks |
| 11 | **The teacher isn't told** | *"qatt75 has not been told — their LINE account is not linked. You will need to tell them yourself."* This is correct, but it's one more manual step. | manual step |
| 12 | Past dates in the picker look selectable | The October picker shows no disabled days before today. I didn't finish checking what saving a past date does (my click timed out). Unverified. | ⚪ unverified |

**What works well (for balance):**
- The dialog says up front that **nothing is cancelled and no family is told**.
- The result repeats it in capitals ("NOTHING HAS BEEN CANCELLED").
- On the leave day the teacher's column has **no "+"**, so no new class can be started there by mistake.

**Data left on sid (QA):** qatt75 leave days **31 Oct, 7 Nov, 9 Nov, 10 Nov, 11 Nov**; QADT2 **7 Nov**. They can't be removed from the screen (#2). The 9/10 Nov days had qatt75's existing QA classes (2 + 1, untouched). No family was notified.
Scripts (scratchpad): `t107i`–`t107m.js`.

---
# §after — TASK-813 after-proof on sid (back `c1d90d8`) · 2026-10-17
**Verdict: ✅ PASS, all 3 rules, Private + DUO.** Same recipe as the reproduction (New course → weekly Saturdays → Generate plan → Actions → "Planned absence" → Create plan), using the leave days already recorded: qatt75 on **31 Oct** and **7 Nov**, QADT2 on **7 Nov**. I used 13:00 / 15:00 to avoid my earlier 10:00 QA courses.

| Case | Plan | Result | |
|---|---|---|---|
| **A · Private, leave week ticked** | qatt75 · from Sat 7 Nov 13:00 · 4 sessions · 7/11 ticked "Planned absence" (the request carries `absentWeeks:[1]`) | **`POST /courses` 201**, "Course registered · Created 5 weekly sessions", course **`242749b7`**. Rows: **07/11 SICK_LEAVE** · 14/11 · 21/11 · 28/11 PENDING · **05/12 appended** (week pushed to the end). `leaveUsed 0` (the child's leave quota is untouched), maxWeek 6. | ✅ |
| **A · DUO, leave week ticked** | QADT2 · QAChatOne + QAChatTwo · from 7 Nov 13:00 · 7/11 ticked | **201**, "Created 5 weekly sessions", course **`b679ef52`**. Rows: 07/11 SICK_LEAVE · 14–28/11 PENDING · 05/12 appended, all with co-student QAChatTwo. | ✅ |
| **B · Private, NOT ticked** | qatt75 · from 7 Nov 15:00 | **409 `TEACHER_ON_LEAVE`**, **the same text**: «ครู qatt75 ลาวันที่ 2026-11-07 — เพิ่มคาบกับครูในวันนั้นไม่ได้ กรุณาเลือกครูอื่นหรือวันอื่น» | ✅ |
| **B · DUO, NOT ticked** | QADT2 · from 7 Nov 13:00 | **409**, «ครู QADT2 ลาวันที่ 2026-11-07 — …» | ✅ |
| **C · two leave days, one ticked** | qatt75 · from Sat 24 Oct 15:00 (weeks 24/10, **31/10**, **7/11**, 14/11) · only **7/11** ticked | **409**, and it names the **un-ticked** day: «ครู qatt75 ลาวันที่ **2026-10-31** — เพิ่มคาบกับครูในวันนั้นไม่ได้ กรุณาเลือกครูอื่นหรือวันอื่น» | ✅ |

- **The leave stays:** after A, `/teacher-leave-days` still lists **qatt75 2026-11-07** and **QADT2 2026-11-07** (with 31/10 and 9–11/11 also still there).
- ⚪ **Not new, noted only:** the appended last week is created **CONFIRMED** while the other weeks are PENDING. The create preview already showed it as "CONFIRMED · EXTENDED" before TASK-813 (§2 of the reproduction).
- **Left on sid (QA):** courses `242749b7` (QAChatOne · qatt75) and `b679ef52` (QAChatOne + QAChatTwo · QADT2).
- Evidence: `test107/a1-*`, `a2-*`, `b1-*`, `b2-*`, `c1-*`.
