# REQ-5000 (Atom desk), imported: the Voucher tab can't find a child who has a voucher. CLOSED, no code
**Imported by Porter, 2026-10-26.** Source, read-only: `smart-scheduler-atom/ai-worker/requirements/REQ-5000-*.md` + `tests/TEST-5000-*.md`. Children's names are left out here, per our rule.
**Atom** = the owner's mobile bot. It opens the computer and runs this same team for him. Its desk numbers from 5000 and its code branch is `atom`.

## The ask (owner via Atom, 2026-10-26 17:38)
> "การจองแบบ voucher มันไม่เห็นเด็กคนหนึ่ง ทั้งๆที่เด็กคนนั้นก็สมัคร voucher ไว้ แต่พอปรับแท็บประเภทการจองเป็นแบบอื่น หาเด็กคนนี้เจอตลอด ยกเว้นแค่ voucher"

## Cause (Tanya, read-only on uat, TEST-5000)
- The same parent has **two records of that child**:
  - one **active**, with no voucher;
  - one **archived 2026-10-16**, which holds the ACTIVE voucher (15 h, 11 left, exp 2027-06-13).
- The other tabs (`GET /students?q=`) find the active record.
- The Voucher tab (`GET /students/eligible?type=VOUCHER`) lists only usable-voucher children who are **not archived** (TASK-392), so it finds neither.
- **Product gap:** `archiveStudent` blocks only on future bookings, not on a live voucher.

## Decision (owner via Atom, 2026-10-26 18:13): *"ปล่อยไว้แบบเดิม จบเคส"*
- The rule stays: archiving a child with a live voucher is allowed. **No code.**
- **Fix = the customer's own, in-app:** People → แสดงที่เก็บแล้ว → คืนสถานะ on the archived record. Then she can archive the empty duplicate if it has no future bookings.
- Recorded in `SYSTEM-FACTS.md` (2026-10-26).
