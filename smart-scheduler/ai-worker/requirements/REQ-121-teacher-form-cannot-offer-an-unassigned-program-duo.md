# REQ-121: The admin cannot give a teacher a program nobody teaches yet, so DUO cannot be booked on uat (LIVE)
> ✅ **CLOSED 2026-10-15: LIVE on uat (back `d29e9d0` + front `d1d0a99`, TASK-805/806). TEST-103 PASS on sid (4/4) and uat (read-only). Khwan was told and ticks the DUO programs herself.** 🟡 Parked, not blocking: the Program box keeps the old Private text after a Private→DUO toggle (display only); the teacher-form hint "Pick from existing subjects" is now stale (copy needs owner approval).
**Intake:** Khwan, LINE 2026-10-15 14:28: *"พี่โด่งคะ โปรแกรมดูโอ้ไม่ขึ้นให้เลือก เกิดจากอะไรได้บ้างคะ"*. Her screenshot: New course → DUO, Teacher "Tarb · Freelance", **Program greyed out**. The owner reproduced it (Teacher "Bank · Full-time").
**Owner ruling, 2026-10-15:** *"ไม่เอา ให้เขาไปใส่เองสิ"*. **No data fix by us.** The customer must be able to assign the DUO programs to teachers **herself**.

## Facts (Porter's intake; code and data, the SA to confirm the mechanism)
- **Data on uat** (the owner's reads, 10-15):
  - both DUO programs exist and are active (`Duo INLINE SKATE`, `Duo SURFSKATE`, kind DUO; seeded 09-22, `log/2026-09-22.md:286`);
  - **no teacher has either one** (`teacher_subjects` has no DUO row).
- **Data on sid:** Duo INLINE SKATE is on Bank + QADT…QADT4. **Duo SURFSKATE is on nobody.**
- **The DUO Program dropdown** lists the chosen teacher's programs of kind DUO only. Empty ⇒ disabled. Sources:
  - front `src/lib/scheduler/duo.ts:101`;
  - `CreatePlanFlow.tsx:99,458`;
  - REQ-095 §13.4a, TASK-437/438.
- **The teacher form's "Subjects" picker** is built as *"the union of subjects already assigned across the roster (no standalone subjects catalog exists on the FE — see TASK-017 Questions)"* (front `src/components/partials/Teachers/TeachersContent.tsx:61-67`).
  - ⇒ **a program that no teacher teaches can never be offered**, so the admin cannot fix this from the screen.

## What must be true after the fix
1. The admin opens a teacher's edit form and **can tick ANY active program**, including both DUO programs, even one nobody teaches yet.
2. After ticking it, **New course → DUO → that teacher → Program** lists it, and a DUO course can be created.
3. Nothing else changes:
   - the other course pickers still hide DUO programs (§13.4a);
   - inactive programs are not offered.

## Proof (reproduce first; the standing rule)
- **sid, the OLD build:** the teacher form offers **no "Duo SURFSKATE"** for any teacher. That is the customer's situation, reproduced.
- **sid, the NEW build:**
  - tick Duo SURFSKATE on a QA teacher;
  - DUO course create offers it.
- **uat after deploy:** read-only check that the form offers both DUO programs. **Khwan ticks them herself.**

## Reproduced on uat by the owner (2026-10-15)
Teachers → Edit teacher "Bank" → Subjects (hint *"Pick from existing subjects"*) → typing **"D"** offers only "Private SKATEBOARD" and "Private SURFSKATE & SKATEBOARD". **No "Duo INLINE SKATE" or "Duo SURFSKATE".** Owner: *"มันไม่มีให้ใส่นะ ที่UAT"*. This matches the facts above.

## Reproduced on sid by the owner (2026-10-15): the OLD-build proof
Edit teacher "Camp" → Subjects → typing **"Du"** offers **only "Duo INLINE SKATE"**, which is on Bank + QADT…QADT4 on sid. It does **not** offer "Duo SURFSKATE", which is on nobody. This is the same mechanism as uat, so the after-fix proof is "Duo SURFSKATE appears here".
