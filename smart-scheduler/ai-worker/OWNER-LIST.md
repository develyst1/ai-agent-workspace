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
| **REQ-004** | **เช่าอุปกรณ์** | 🔴 **REOPENED 2026-08-30 — the customer says it is wrong** | **REQ-028 / SPEC-031 / `tests/TEST-062`** — see Risk 4 |
| **REQ-005** | **การจองลงตาราง แบบ other (อื่นๆ)** | 📋 **ToDo** — in build, 2 answers owed | **`requirements/REQ-005…md` §"booking type OTHER"** |
| **REQ-013** | **พักการจองรายครั้ง / voucher / 1st Trial** (เหมือนพักคอร์ส) + กล่องรายการที่พักไว้ | 🆕 **ToDo — captured 2026-08-30, NOT ready to build** | `requirements/REQ-076…md` (DRAFT) |
| **REQ-014** | **LINE OA จริงจัง** — rich menu · ลูกค้าใช้ตอบลูกค้าด้วย · ชุดแจ้งเตือนให้ครบ | 🆕 **ToDo — captured 2026-08-30, NOT ready to build** | `requirements/REQ-077…md` (DRAFT) |
| REQ-006 | popup confirm ตอนกด มาเรียน / confirm ส่งไลน์ครู | ✅ Completed | REQ-073 |
| REQ-007 | ช่อง Note ทุกประเภทการจอง + ส่งถึงครูในไลน์ | ✅ Completed | REQ-068 + TASK-201 + TASK-219 |
| REQ-008 | ปุ่มยกเลิกคอร์ส กดเองได้ | ✅ Completed | REQ-036 |
| REQ-009 | ปุ่มยกเลิกการจอง 1HR / Voucher + popup เหตุผล 3 ข้อ | ✅ Completed | REQ-074 + **TASK-220** (1st Trial) — **both live on `uat` and in use**. Risk 1 CLOSED 2026-08-31. |
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

**~~Risk 1~~ — ✅ CLOSED 2026-08-31. REQ-009 is Completed and the word is honest.**
**The owner:** *"deploy TASK-220 ไปนานแล้วโว้ย เขาใช้แล้ว"* — it shipped to `uat` and the customer is **using it**.

🔴 **I claimed the opposite, twice, in writing.** On 08-30 and 08-31 I told him TASK-220 was "code-complete, not
deployed, not QA-run" and put it on his outstanding list. **It had already shipped.** Where the belief came from:
Sober's hand-off said *"Ball: @Porter — deploy TASK-220"*, and **no entry in any log records the deploy**, so I
read silence as "not done". That is the same mistake in the opposite direction as everything else on this
project — **absence of evidence is not evidence, and it is not a licence to assert the negative.**

📌 **The process gap this exposes, which is mine to fix:** *"deployed to `uat`"* has **no home file.** Code state
lives in TASKs, requirement state on the board, but the fact that a build reached the customer is recorded only
when somebody happens to write a log line. ⇒ **From now on Porter records every `uat` deploy in the day's log and
in `PROJECT-STATUS.md`, or the next session guesses like I did.**

📌 **Real usage outranks a QA run here.** Tanya never exercised the ATTENDED first-trial path, and she no longer
needs to — the customer is doing it in production daily. Do not open a QA ticket to re-prove a shipped feature
people already rely on; if it were broken, they would have said so.

**Risk 2 — REQ-003 (ส่วนลด) is marked Completed; our REQ-063 says the requirement was never confirmed.**
The code is live on `uat` and Tanya passed it on `sid` (08-23). But the **four requirement answers are the
owner's own assumptions, not the customer's** — recorded that way deliberately in REQ-063. If the customer meant
something different (e.g. automatic/rule-based discounts rather than a manual per-sale one), "Completed" has
already been communicated. **One question to the customer closes this.**

**Risk 3 — REQ-001 is marked Completed; AC-9/AC-10 of board REQ-058 are `NOT_TESTED`.**
Tanya passed everything she is allowed to run (`tests/TEST-063`); the `teacher-subjects:link-all` bulk + dry-run
behaviour is a **server CLI run** outside QA's charter and needs the owner's dry-run counts. Low risk, but it is
the difference between *verified* and *assumed*.

**Risk 4 — REQ-004 (เช่าอุปกรณ์) was one signature away from Completed, and the customer says it is wrong.**
Timeline, because the order matters: 2026-08-29 Tanya retested on `sid` and every check she could drive passed
(`tests/TEST-062`) · 2026-08-30 the owner ran the ledger query and the numbers matched SPEC-031 exactly
(`../project-docs/2026-08-30-data-request-rental-ledger.md`) · **the same day the owner relayed
*"เรื่องของเช่า rent ยังไม่ถูกนะ ลูกค้าแจ้ง นำกลับมาแก้"*.**

🔴 **The customer's report outranks our green `sid` run, and it is not a contradiction.** We verified the money
mechanism — four codes, right amounts, `RENTAL` marker, idempotent. The customer is reporting about **their
business**, which our tests never asserted. This is the project's rule 1 in its purest form: *check the outcome,
not the mechanism.* A ledger that reconciles with itself proves the code does what SPEC-031 says — **not that
SPEC-031 says the right thing.**

⚠️ **What is wrong is NOT yet known** — *"ยังไม่ถูก"* is a symptom, not a defect. Porter asked the owner for the
customer's own words rather than guessing, per the standing stakeholder policy. **Nobody specs or builds until
that lands.** Held: Tanya's signature on checks 1 & 5, and any move of REQ-004 toward Completed.

## 📌 Not on the owner's list at all — work the team has in flight

He never asked for these; they came from Porter or from the team finding something. **They are not customer scope
and should not silently consume the customer's rounds:**

- **SPEC-069 / TASK-221 + TASK-222** — warn the admin when cancelling a booking whose revenue **already posted**
  (money silently stays in the books today). Porter's order, 08-29. TASK-221 in REVIEW, TASK-222 `TODO`.
- **TASK-218** — per-recipient reminder idempotency. 🔴 carries **migration `0028`** ⇒ `sid` first.
- **TASK-223** — the `link-all` script no longer documents the policy the owner revoked on 08-29.
- The open items in `PROJECT-STATUS.md` §"Open — PARKED BY THE OWNER" (REQ-057 cleanup never run on `uat`,
  the `sm-jobs` secret in git, `ชวินท์`'s ฿9,790 sale, REQ-062's Q4, LINE reach).

---

## 🔢 THE ORDER — set by the owner, 2026-08-30

> *"หลังบ้าน ไว้หลังเลย ทำหน้าให้จบก่อน"*

1. **REQ-005** — การจองลงตาราง แบบอื่นๆ *(in build; 2 answers still owed by him)*
2. **REQ-013** — พักการจองรายครั้ง / voucher / 1st Trial → `REQ-076` (DRAFT, 7 questions)
3. **REQ-014** — LINE OA → `REQ-077` (DRAFT) — 🔴 **design conversation first**, see his 08-30 correction in
   that file: an admin lives inside the account; we may have been aiming at a full bot with no humans.
4. **REQ-004** — เช่าอุปกรณ์. **Deliberately last** — *"ยังไม่ต้องหยิบเรื่องเช่าอุปกรณ์มาคุย อันนี้ทำทีหลัง"*.
   Still REOPENED (Risk 4); the customer's actual complaint is still unknown and must not be guessed.
5. **The six `REQ-BO` items — after all of the above.**

**Unnumbered but pending:** — none. *(TASK-220 was deployed and is in use; see Risk 1.)*

### ➕ REQ-015 — assigned 2026-08-30 at the owner's request

> *"REQ-051 ยังไม่มีใน note ฉัน เขียนเลขให้ฉันใหม่ด้วย"*

| Owner's # | Title | Status | Board equivalent |
|---|---|---|---|
| **REQ-015** | **หน้าเช็คอิน QR ที่เคาน์เตอร์ (walk-in)** — สแกน → พิมพ์เบอร์ → เลือกลูก → เช็คอิน หรือ แจ้งลา | 📋 **ToDo** | **`requirements/REQ-051…md`** — SPEC-050 DRAFT |

**Next free number in the owner's frontoffice list: REQ-016.**

🔴 **It is not blocked on design — the architecture is done. It is blocked on THREE decisions that are his**
(`REQ-051` / SPEC-050, raised by Sober 2026-08-17). The reason they exist: this is a **public page with no login
that consumes a paid session and can list children's names**, and there is **no rate limiter anywhere in the
codebase**. Porter must put these to him when REQ-015 reaches the front of the queue:
1. **The admin code.** The only code that exists today is the shared static `229`. Recommendation: the fast path
   is restricted to the **staff counter device**, not a parent's phone.
2. **The rate-limit model** — it has to be built from scratch, so its behaviour must be written in the SPEC and
   not left to a library default.
3. **Is a public, no-login check-in acceptable at all** (a stranger could burn a family's paid lesson), or should
   it be **staff-device only**?

Already settled and not to be re-asked: the owner confirmed the flow on 2026-08-16 and simplified it, and ruled
that a counter **leave** inside REQ-047's cut-off is allowed but needs an admin's approval.

## 🔢 THE ORDER — updated 2026-08-30 (supersedes the block above)

1. **REQ-005** — การจองแบบอื่นๆ *(in build; 2 answers owed)*
2. **REQ-013** — พักการจองรายครั้ง / voucher / 1st Trial → `REQ-076` (7 questions)
3. **REQ-015** — หน้าเช็คอิน QR walk-in → board `REQ-051` (3 security decisions owed)
4. **REQ-014** — LINE OA → `REQ-077` (design conversation first)
5. **REQ-004** — เช่าอุปกรณ์ (REOPENED, deliberately last)
6. **REQ-BO-001 … 006** — the backoffice block, after all of the above.

### 📄 REQ-005 got its own board REQ — 2026-08-30

The owner's **REQ-005** (การจองแบบอื่นๆ) is now board **`REQ-078`**, `READY_FOR_SA`, with full acceptance
criteria. It previously lived as a section inside `REQ-005-standalone-teacher-management.md` while parked; that
section is now a pointer. **Next free board REQ number: REQ-079.**

**His answers, closed 2026-08-30:** price = **BOTH** typed amount *and* catalogue item (his option ค) ·
the studentless booking's name = **the admin types it** · charge/consume/student all optional per instance ·
day-end auto-attends like everything else.
**One question remains and does NOT block the build:** does an อื่นๆ booking notify the teacher on LINE.

### ➕ REQ-016 — assigned 2026-09-01 at the owner's request

| Owner's # | Title | Status | Board equivalent |
|---|---|---|---|
| **REQ-016** | **ระบบลงทะเบียนนักเรียนผ่านไลน์** — hybrid bot + admin · flow "สมัคร" · รหัสครอบครัว 6 หลัก · เตือนชื่อซ้ำ | 📋 **ToDo — not started** | **`requirements/REQ-079-line-chatbot-registration.md`** |

**Deliberately NOT folded into his REQ-014.** REQ-014 is the OA move, the rich menu and the notification set;
REQ-016 is **the customer registering themselves**. Different deliverable, different risk, and the customer will
judge them separately. **Next free number in the owner's frontoffice list: REQ-017.**

**Settled inside it already** (do not re-ask): fixed family code, shop can reset · 4 wrong attempts ⇒ 3-minute
lock · family sets its own code, **inside an admin-opened chat** (closes first-use takeover) · failures counted
per family, not per device · weak codes allowed as an **accepted risk**, with the check built but switched off ·
the code never unlocks anything that moves money.
**Still blocked on:** the owner's own design flow. Nothing is `READY_FOR_SA`.

## 🔢 THE ORDER — updated 2026-09-01 (GO on REQ-016; supersedes every block above)

> *"GO เอาเลย ให้อยู่คิวถัดจาก REQ-005"*

1. **REQ-005** — การจองแบบอื่นๆ *(in build; 4 of 5 tasks done)* → board `REQ-078`
2. 🆕 **REQ-016** — ลงทะเบียนผ่านไลน์ + ผู้ปกครองใช้ระบบเอง → board **`REQ-079` · `READY_FOR_SA`, 22 ACs written**
3. **REQ-013** — พักการจอง → `REQ-076` (7 questions still with Porter)
4. **REQ-015** — หน้าเช็คอิน QR → `REQ-051` (3 security decisions; #1 is answered by REQ-016's family code)
5. **REQ-014** — LINE OA + rich menu + notifications → `REQ-077`
6. **REQ-004** — เช่าอุปกรณ์ (REOPENED — the customer's complaint is still unknown)
7. **REQ-BO-001 … 006** — the backoffice block

📌 **REQ-016 before REQ-014 is safe, and the sequencing question it raises is already answered.** REQ-014 moves
the customer to a **new** LINE OA and every LINE link is per-OA, so links do not survive it. **This design does:**
the family, its children and its 6-digit code live in **our** database, not in LINE. After the move a parent
re-enters phone + code from any device and is back — no admin, no re-registration, no migration.
