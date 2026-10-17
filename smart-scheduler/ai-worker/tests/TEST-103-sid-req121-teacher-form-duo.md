# TEST-103 — REQ-121 on sid: the teacher form offers every active program, incl. DUO (back `d29e9d0` · front `d1d0a99`)

**Tester:** Tanya (QA) · **Date:** 2026-10-15 · **Env:** sid, headless · **Brief:** `inbox/QA.md` → "⏸️ WAIT … REQ-121" + "▶️ GO: REQ-121 is on sid"
**Verdict: ✅ PASS, 4 of 4.**
- The OLD-build proof was the owner's: "Du" offered only Duo INLINE SKATE.
- **Writes (sid, QA only):**
  1. qatt75b gained **Duo SURFSKATE**;
  2. ONE DUO course for the QA family, **`5622d9f1`**: QAChatOne + QAChatTwo, 6 sessions PENDING, Thursdays 10:00, 22 Oct → 26 Nov.

  Both are left in place as the proof.

**Build identity:** `GET /subjects` (new, TASK-805) ⇒ **200**, 21 active programs, kind DUO: `Duo INLINE SKATE`, `Duo SURFSKATE`. Before my step, **Duo SURFSKATE was on nobody** (`/teachers`), which is the customer's situation.

| # | Check | Result | |
|---|---|---|---|
| 1 | **Teachers → ⋮ → Edit qatt75b → Subjects → type "Du"** | options **`["Duo INLINE SKATE", "Duo SURFSKATE"]`**. The owner's old-build proof offered only Duo INLINE SKATE (`01-teacher-form-du-both-duo.png`). | ✅ |
| 2a | **Tick Duo SURFSKATE → Save** | `PATCH /teachers/7c9bbc14` **200**. `/teachers`: qatt75b = `Private SURFSKATE (PRIVATE), Duo SURFSKATE (DUO)` (`02-teachers-qatt75b-after-save.png`) | ✅ |
| 2b | **New course → DUO → qatt75b → Program** | options **`["Duo SURFSKATE"]`** (`03-new-course-duo-qatt75b-program.png`). Control: DUO + QADT3 ⇒ `["Duo INLINE SKATE"]` | ✅ |
| 2c | **A DUO course can be created** | Student QAChatOne · Second child QAChatTwo · rate 500 · qatt75b · Duo SURFSKATE · 6 sessions.<br>⇒ the plan preview shows 6 rows "qatt75b · Duo SURFSKATE · PENDING" (`07-duo-plan-preview.png`);<br>⇒ **Create plan** ⇒ `POST /courses` **201**, toast "Course registered · Created 6 weekly sessions".<br>**Read back:** course `5622d9f1`, `courseKind DUO` · subject **Duo SURFSKATE** · QAChatOne + co-student **QAChatTwo** · `classRateMinor 50000` · size 6 · ACTIVE; 6 rows COURSE_PACKAGE, Duo SURFSKATE, PENDING, 22 Oct → 26 Nov. | ✅ |
| 3 | **The Private course picker still hides DUO** (box cleared, the full list) | Private + qatt75b ⇒ `["Private SURFSKATE"]` (no Duo SURFSKATE, although he now has it) (`04-…private…png`). Private + QADT3 ⇒ `["Private FREESKATE"]` (his Duo INLINE SKATE hidden). Private + Bank ⇒ 19 options, **no Duo**. | ✅ |
| 4 | **A Teachers-only user can load the form (no 403)** | (a) **`qa-nostatus-077`** (menus: Schedule + Teachers only, no actions) ⇒ `GET /subjects` **200**, both DUO listed; the Teachers page loads with **no 4xx/5xx**. It has no Edit/Add buttons (no `action:teachers.edit`), so it has no form to open: by design. The back gates `/subjects` on `read(TEACHERS)` only (`route-access.ts:134`).<br>(b) **`qa-norate-076`** (not super-admin, has `action:teachers.edit`) ⇒ Edit form opens, "Du" ⇒ `["Duo INLINE SKATE", "Duo SURFSKATE"]`, **no 4xx/5xx** (`08-non-superadmin-form-du.png`). Closed with Cancel. | ✅ |

## Notes (not faults of REQ-121)
- 🟡 **The Program box shows a stale name after the kind toggle.** In New course, pick qatt75b under **Private** (Program auto-fills "Private SURFSKATE"), then switch to **DUO**: the box still **shows "Private SURFSKATE"**.
  - The selection itself is cleared: with both children and the rate filled, **Generate plan stays disabled** (`06-stale-program-generate-state.png`), and the list offers only Duo SURFSKATE.
  - Switching back to Private empties the box.
  - So nothing wrong can be created; it is display-only. **Workaround:** pick DUO before the teacher.
- 🟡 **Copy:** the Subjects hint still says *"Pick from existing subjects"*. Since REQ-121 it lists every active program, including ones no teacher has yet.
- ℹ️ My first DUO read showed an empty list. That was my test's doing: it typed into a box that still held the old name, which filters the list. The clean order (rows 2b and 3) is the evidence.

Evidence: `project-docs/qa-2026-10-15/test103/`. QA names only (QAChatOne/QAChatTwo, QA coaches).
Scripts (scratchpad): `t103a`–`t103l.js`.

---
# §uat — REQ-121 on uat, READ-ONLY · 2026-10-15
**Verdict: ✅ PASS.**
- 🚫 **Zero app writes.** After login every non-GET was aborted; only 2 Cloudflare `cdn-cgi/rum` beacons were attempted.
- Nothing ticked, nothing saved. The form was closed with Cancel.

| Check | uat | |
|---|---|---|
| **Build identity, back `d29e9d0`** | `GET /subjects` (new in TASK-805) ⇒ **200**, 21 active programs, DUO = `Duo INLINE SKATE`, `Duo SURFSKATE`. The old back had no such route. | ✅ |
| **Build identity, front `d1d0a99`** | opening the teacher form makes the front request **`GET /subjects`** (TASK-806's `useSubjects`); the old front built the list from the roster | ✅ |
| Data before | **no uat teacher has a DUO program** (`/teachers`), which matches the REQ's facts | ⚪ |
| **Teachers → ⋮ → Edit "Bank" → Subjects → "Du"** | options **`["Duo INLINE SKATE", "Duo SURFSKATE"]`**. On the old build the owner saw neither (`test103-uat/uat-teacher-form-du.png`, program names only) | ✅ |

Next: **Khwan ticks the DUO programs herself** (owner's ruling).
