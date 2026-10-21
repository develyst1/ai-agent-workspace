# TEST-110: REQ-125, a teacher's own login misses a multi-teacher ECA (sid, NEW build with TASK-823)

- **QA:** Tanya
- **Date:** 2026-10-19
- **Environment:** sid (`som.develyst.online`), back **`01d7f04` (TASK-823 fix)** + front `692f798`. The owner deployed it before this run (Porter's ⚠️ entry in `inbox/QA.md`).
- **Brief:** Porter's ▶️ GO TEST-110 entry plus his ⚠️ TEST-110 CHANGE entry (2026-10-19)

**Verdict: ✅ CLOSED, PASS on the new build (2026-10-19).**
- **Teacher's own view: ✅** qatt75's own Weekly shows A (qatt75 3rd, Khwan's missing case) and B (1st). This comes from the owner's screenshot, see §DR-1 answered at the end. Daily is covered by TASK-823's by-value tests.
- **Admin calendar: ✅ unchanged on the new build.** It shows the class in all 3 columns, matching what Khwan saw.
- **Not checked, by Porter's call:** the teacher's own check-in and leave lists (§3), Sober's side finding 2 (skipped for now), and LINE "ตารางของฉัน" (not observable by QA).
- **Fixture A and B: cancelled** (§Clean-up).
- **§old-build: not captured on sid.** The fix was deployed before this run. The old-build evidence is:
  - Khwan's own uat screens (REQ-125 intake; uat still runs the old build);
  - TASK-823's mutation set, which bites when the fix is reverted.

## The recipe
**Setup:** created as admin through `POST /bookings` (the same body the "New booking → Other" dialog sends):
- `bookingType OTHER`, `otherKind ECA`, `headCount 8`;
- 3 QA teachers, `teacherId` = the first, `additionalTeacherIds` = the other two.

| Row | id | 27 Oct, time | Teacher order (1st → 3rd) | Position of the viewer `qatt75` |
|---|---|---|---|---|
| **A** "QA-T110-A INLINE SKATE" | `c8d222d1` | 09:00 | QACT → qatt75b → **qatt75** | **3rd** (Khwan's case: Camp was not first) |
| **B** "QA-T110-B INLINE SKATE" | `afd9d0ac` | 15:00 | **qatt75** → QACT → qatt75b | **1st** |

All 3 teachers work Tuesdays. 14:00 and 16:00 were refused with `409 SLOT_TAKEN` because older QA rows already held them. Nothing was created there. 09:00 and 15:00 were the first slots free for all 3.

## 1 · The admin calendar (sid, admin): ✅ all 3 columns, both rows
| View | Filter | QA-T110-A | QA-T110-B |
|---|---|---|---|
| Daily 27 Oct | Teacher = QACT, qatt75, qatt75b | **3×**, one cell per column; each cell reads "With …" the other two | **3×** |
| Weekly 26 Oct – 1 Nov | same | **3×** | **3×** |

**Screenshots:** `project-docs/qa-2026-10-19/test110/admin-daily-27oct-qa3.png` and `admin-weekly-27oct-qa3.png`.

**What the API sends (admin `GET /calendar?date=2026-10-27`, day and week alike):**
- Each row sits in **one** slot only: the **first** teacher's column (A under QACT, B under qatt75).
- Its `teachers` list carries all 3, first-listed first: A = `[QACT, qatt75b, qatt75]`, B = `[qatt75, QACT, qatt75b]`.
- So the other two columns on the admin screen are filled by the front from `teachers`. The API does not place them.

This is a fact about what the API sends, not a ruling on the cause. Sober's REQ-125 read already covers that.

## 2 · The teacher's own view (`qa-coach-qatt75`, Daily + Weekly): 🔒 not run yet (needs DR-1)
**The login to use:**
- sid user **`qa-coach-qatt75`** exists. It is linked to teacher **qatt75** (`7508e641`), enabled, with `menu:calendar` only and no role, so it sees the teacher's own column.
- I read this from the admin `/users` list (no password involved).

**Expected on this (new) build:**

| | Daily 27 Oct | Weekly 26 Oct – 1 Nov |
|---|---|---|
| A (qatt75 3rd) | **shown** (it was missing on the old build, per Khwan's uat screens) | **shown** |
| B (qatt75 1st) | shown | shown |

## 3 · The teacher's own check-in and own leave: 🔒 same session needed (DR-1)
Once DR-1 is answered, I will check:
- whether `qa-coach-qatt75`'s **check-in list** for 27 Oct offers row A;
- whether **"report my leave"** for 27 Oct lists row A.

Nothing is recorded or saved in either flow; I only look at what the list offers. Sober's audit says these reads include extra teachers, so A should appear in both.

The same session also covers the rest of Porter's change entry:
- **Sober's side finding 2:** can a group's EXTRA coach check in a single child's seat? This needs a group fixture with qatt75 as extra coach, which I create only once DR-1 is answered.
- **The LINE "ตารางของฉัน" list:** not observable. `qa-coach-qatt75` has no LINE link (`lineLinked false`) and QA has no LINE account; same limit as TEST-108 L1. The owner would have to check this on a LINE-linked teacher, so it is part of DR-1 option a.

## DR-1 · DATA REQUEST to Porter / the owner (pick one)
- **Option a (owner looks):**
  1. Log in on sid as `qa-coach-qatt75`.
  2. Open Schedule → Daily → **27 Oct 2026**, then Weekly for the same week.
  3. Say whether **"QA-T110-A INLINE SKATE" (09:00)** and **"QA-T110-B INLINE SKATE" (15:00)** each appear. A screenshot of each view is ideal.
4. Optional, for the uat self-serve tip: on any LINE-linked teacher who is 2nd on a class, does LINE "ตารางของฉัน" list that class?
- **Option b (I look):**
  - The owner allows me, in writing in `inbox/QA.md`, to log in **headless** on sid as `qa-coach-qatt75`. That account's password is already in the access file, and I would not print it.
  - I then run Daily, Weekly, check-in and leave myself, read-only, with screenshots.
- **Either way,** once it is answered I complete §2 and §3, then clean up.

## Clean-up
- **2026-10-19, after DR-1:** rows A (`c8d222d1`) and B (`afd9d0ac`) cancelled as admin with `PATCH /bookings/:id/status {action: cancel, reasonCode: ADMIN_ERROR}`, both ⇒ 200.
  - Read back: **0** on the 27 Oct grid; both in the cancelled tray as `CANCELLED`.
  - The first try without a `reasonCode` was refused with `400 REASON_REQUIRED`, so nothing changed then. Script: `t110f.js`.
- Nothing else was created. No password was typed and no account was created.

**Scripts (scratchpad):**
- `t110a.js`: the dialog survey (nothing saved).
- `t110b.js`: create the rows, plus the admin API and screen checks.
- `t110c.js`: the DTO fields.
- `t110d.js`: the filtered screenshots.
- `t110e.js`: the linked users (read).
- `t110-ids.json`: the row ids.

## DR-1 answered by the owner, 2026-10-19 (his screenshot, option a): ✅ PASS on the NEW build
- Logged in on sid as **QA Coach qatt75**, **Weekly** view, 26 Oct – 1 Nov 2569. On **Tue 27 Oct**, both fixture classes show in qatt75's own row:
  - **QA-T110-A 09:00 INLINE SKATE** · ECA · "ร่วมกับ QACT, qatt75b" (qatt75 is **3rd**): **shown** (this was Khwan's missing case);
  - **QA-T110-B 15:00 INLINE SKATE** · ECA · "ร่วมกับ QACT, qatt75b" (qatt75 1st): shown.
- The Daily view was not screenshotted. Day + week are covered by TASK-823's by-value tests (Sober).
- Recorded by Porter from the owner's screenshot.
