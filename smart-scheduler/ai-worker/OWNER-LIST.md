# The OWNER'S list — the status the CUSTOMER is told (2026-08-30, verbatim from the owner)

> 🔴 **This is the list that matters to the business.** The board's REQ-001…075 is *our* internal numbering; this
> is the one the customer reads. **Quote these numbers to the owner; use board numbers inside tasks.**
> (PROJECT-STATUS.md rule 5 — "two numbering systems and two vocabularies".)
>
> Given to Porter in chat on **2026-08-30** and written here the same session. Supersedes the phase table in
> `../project-docs/2026-08-23-timeline-current-picture.md`, which is now stale on status (its **sizing and
> ordering logic still stands** and is still the best reference for the backoffice phase).

## 1. ระบบหน้าบ้าน (frontoffice) — 10 of 12 Completed

| Owner's # | Title (his words) | Owner's status | Board equivalent (Porter's mapping) |
|---|---|---|---|
| REQ-001 | upload ข้อมูล กิจกรรม | ✅ Completed | REQ-058 (+ `subjects:add`, TASK-153/155) — *mapping believed, not confirmed by him* |
| REQ-002 | upload ข้อมูล นักเรียน | ✅ Completed | REQ-025 / REQ-059 / REQ-060 importer work — *mapping believed* |
| REQ-003 | ส่วนลดรายครั้ง | ✅ Completed | **REQ-063** — ⚠️ see Risk 2 |
| **REQ-004** | **เช่าอุปกรณ์** | 🔨 **In Progress (Testing)** | **REQ-028 / SPEC-031 / `tests/TEST-062`** |
| **REQ-005** | **การจองลงตาราง แบบ other (อื่นๆ)** | 📋 **ToDo** | **`requirements/REQ-005…md` §"booking type OTHER"** |
| REQ-006 | popup confirm ตอนกด มาเรียน / confirm ส่งไลน์ครู | ✅ Completed | REQ-073 |
| REQ-007 | ช่อง Note ทุกประเภทการจอง + ส่งถึงครูในไลน์ | ✅ Completed | REQ-068 + TASK-201 + TASK-219 |
| REQ-008 | ปุ่มยกเลิกคอร์ส กดเองได้ | ✅ Completed | REQ-036 |
| REQ-009 | ปุ่มยกเลิกการจอง 1HR / Voucher + popup เหตุผล 3 ข้อ | ✅ Completed | REQ-074 (+ **TASK-220**) — ⚠️ see Risk 1 |
| REQ-010 | คำย่อวัน Mon/Tue/Wed + "Weekly course" → "Course" | ✅ Completed | REQ-075 + REQ-067 |
| REQ-011 | ปุ่ม Drop Course (สถานะที่ 5, กลับมาเรียนต่อได้) | ✅ Completed | REQ-071 |
| REQ-012 | Confirm ยกคอร์ส + แจ้ง LINE (คอร์ส/วันเริ่ม/ตาราง/วันลา/note) + แจ้งวันเริ่มเรียน | ✅ Completed | REQ-072 (4 parts) |

## 2. ระบบหลังบ้าน (backoffice) — 0 of 6, all ToDo, **untouched and unplanned**

| Owner's # | Title (his words) | Size (his 08-23 estimate) |
|---|---|---|
| REQ-BO-001 | เชื่อมหน้าบ้าน เรื่อง กิจกรรม | 🟡 medium — 2 rounds |
| REQ-BO-002 | เชื่อมหน้าบ้าน เรื่อง dashboard | 🔴 large — 3+ · **his own plan puts this LAST** (a dashboard reads what BO-001…005 create) |
| REQ-BO-003 | เชื่อมหน้าบ้าน เรื่อง เพดาน freelance | 🟡 medium — 2 |
| REQ-BO-004 | เชื่อมเงินเดือนครู | 🔴 large — 3–4 · **must follow BO-003** (salary is computed from the ceiling) |
| REQ-BO-005 | ตัดคอร์ส จาก Frontoffice | 🔴 large — 3+ ·直接 money link ⇒ needs a stable frontoffice |
| REQ-BO-006 | รองรับการยกเลิก 1HR / Voucher จากหลังบ้าน (พร้อมเหตุผล) | *not sized on 08-23* — **probably the cheapest of the six**: it is REQ-009's twin, and the reason enum + service path already exist (`0025`, `REASON_ENUM_REQUIRED`) |

## 3. งานแก้ปัญหา (FIX) — all 7 Completed

FIX-001 ลาแล้วเป็น extended · FIX-002 ชื่อ `1st trial` ผิด · FIX-003 booking-type labels ·
FIX-004 ข้อความไลน์ครูอ่านยาก · FIX-005 ทุกกิจกรรมมีราคา 1hr (board REQ-066) ·
FIX-006 เอาข้อจำกัดเปลี่ยนครูล่วงหน้า 3 วันออก · FIX-007 วันหมดอายุคำนวณผิด (board FIX-007).

---

## 🔴 Three places where the owner's list and our records DISAGREE — Porter owes him these

**Risk 1 — REQ-009 is marked Completed, but a 1st Trial still cannot be cancelled on `uat`.**
He hit this himself on 2026-08-29 (booking `680c7659…`). **TASK-220** (the FE condition + the BE reason-enum line)
fixes it, is code-complete and Sober-reviewed, and is **NOT deployed and NOT QA-run**. Until it ships, "Completed"
is true for 1HR/Voucher only. *(His original REQ-009 said 1HR/Voucher, so this is a scope gap, not a defect —
but the customer-facing word is still wrong today.)*

**Risk 2 — REQ-003 (ส่วนลด) is marked Completed; our REQ-063 says the requirement was never confirmed.**
The code is live on `uat` and Tanya passed it on `sid` (08-23). But the **four requirement answers are the
owner's own assumptions, not the customer's** — recorded that way deliberately in REQ-063. If the customer meant
something different (e.g. automatic/rule-based discounts rather than a manual per-sale one), "Completed" has
already been communicated. **One question to the customer closes this.**

**Risk 3 — REQ-001 is marked Completed; AC-9/AC-10 of board REQ-058 are `NOT_TESTED`.**
Tanya passed everything she is allowed to run (`tests/TEST-063`); the `teacher-subjects:link-all` bulk + dry-run
behaviour is a **server CLI run** outside QA's charter and needs the owner's dry-run counts. Low risk, but it is
the difference between *verified* and *assumed*.

## 📌 Not on the owner's list at all — work the team has in flight

He never asked for these; they came from Porter or from the team finding something. **They are not customer scope
and should not silently consume the customer's rounds:**

- **SPEC-069 / TASK-221 + TASK-222** — warn the admin when cancelling a booking whose revenue **already posted**
  (money silently stays in the books today). Porter's order, 08-29. TASK-221 in REVIEW, TASK-222 `TODO`.
- **TASK-218** — per-recipient reminder idempotency. 🔴 carries **migration `0028`** ⇒ `sid` first.
- **TASK-223** — the `link-all` script no longer documents the policy the owner revoked on 08-29.
- The open items in `PROJECT-STATUS.md` §"Open — PARKED BY THE OWNER" (REQ-057 cleanup never run on `uat`,
  the `sm-jobs` secret in git, `ชวินท์`'s ฿9,790 sale, REQ-062's Q4, LINE reach).
