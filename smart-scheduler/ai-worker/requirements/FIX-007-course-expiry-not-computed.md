# FIX-007: The course expiry date is never computed — it is whatever the caller typed
- Status: READY_FOR_SA
- Priority: **HIGH** — it decides the `EXPIRED` status we shipped 2026-08-25, and REQ-011 (Drop) depends on it
- Reported: 2026-08-25 by the owner — *"วันหมดอายุใน booking course คำนวนผิดพลาด"*

## The rule, stated by the owner (2026-08-25) — this is the authority
> *"วันตามที่ซื้อ — ลาแล้วไม่เลื่อน คาบชดเชยต้องอยู่ในกรอบเดิม เช่น ซื้อเริ่มวันที่ 1 สี่คอร์ส ลาได้ 1 ก็จะเป็น 4+1
> ก็คือห้าสัปดาห์ก็จบ วันที่เผื่อลาแล้วนั่นแหละ"*

**Expiry = start + (size + leave quota) weeks.** A leave does **not** extend it; the make-up must fit inside the
window the purchase already paid for. His arithmetic matches the constants we already have:

| size | leave quota | weeks | constant |
|---|---|---|---|
| 4 | 1 | **5** | `MAX_WEEK_BY_SIZE[4] = 5` ✅ |
| 6 | 2 | **8** | `MAX_WEEK_BY_SIZE[6] = 8` ✅ |
| 10 | 3 | **13** | `MAX_WEEK_BY_SIZE[10] = 13` ✅ |

📌 **Side effect: close a long-standing "assumption".** `lib/leave.ts:13` still reads *"(6→8 is an ASSUMPTION —
confirm.)"* and the board has carried it as unconfirmed since 2026-08-01. **The owner has now derived all three
from the same rule.** Delete the comment; it is confirmed.

## The defect — one line
`scheduler.service.ts:1107` and `:1153`:
```ts
expiryDate: input.expiryDate, // taken, not computed
```
**The expiry is supplied by the caller and never derived.** Whatever the create form or the importer put in is what
the course carries forever. ⇒ **The owner's rule is enforced nowhere.**

**Proven live on `uat` from the owner's own screenshots — one course, two end dates 13 days apart:**
- Aileen's card: **`expires 2026-09-27`** (stored `expiryDate`)
- Aileen's plan modal: **`สิ้นสุด 10 Oct 26`** (`deriveLiveEndDate` — `max(date)` over live sessions)

## Why this is not cosmetic
1. 🔴 **It decides the `EXPIRED` status we shipped last night.** `courseStatus()` (`course-status.ts:38`) tests
   **`expiryDate < today`** — the stored value — while `course-plan.ts:44` documents that field as *"only the
   MAX_WEEK ceiling"* and says the displayed end date must **never** come from it. **`Expired (2)` on `uat` may be
   wrong in either direction**; the owner has been told not to act on it until this lands.
2. 🔴 **A course can schedule live sessions past its own expiry** (Aileen: sessions to 10 Oct, expiry 27 Sep) —
   so "expired" and "still has classes booked" are simultaneously true.
3. **REQ-011 (Drop) is blocked by it** — Drop resumes *"โดยแอดมินแก้วันหมดอายุให้"*, which is meaningless while
   nobody knows which date is authoritative.

## Requirement
1. **Compute the expiry on creation** from `start + MAX_WEEK_BY_SIZE[size]` weeks. **Not taken from input.**
2. **Every creation path** — the admin form, `courses/import`, and anything else that writes a course. SA to
   enumerate from the routes (**the TASK-185 lesson: buttons are not the only door**).
3. **A leave never moves it.** The make-up must land inside the window; the existing `EXTENSION_CEILING` refusal
   is the correct behaviour and stays.
4. **Repair existing rows** — dry-run first, owner-run, on both boxes. ⚠️ **Imported courses are the hard case:**
   their real start may predate the import. SA to decide what "start" means for them and **say so explicitly**
   rather than silently picking one.
5. Once expiry is trustworthy, **`courseStatus` keeps using it** — the field becomes correct rather than replaced.

## Acceptance Criteria
- [ ] **AC-1** — A new 4/6/10-session course created on day D expires **D + 5/8/13 weeks**, whatever the form sends.
- [ ] **AC-2** — Taking a leave does **not** change `expiryDate`.
- [ ] **AC-3** — No live session can be scheduled after `expiryDate` (the ceiling refusal still fires).
- [ ] **AC-4** — After the repair, **no course has a live session dated after its `expiryDate`** — one query, both boxes.
- [ ] **AC-5** — `Expired` in the four-status filter means *the window has closed*, and re-checking `uat`'s
      **Expired (2)** either confirms them or reclassifies them, **with the reason written down**.
- [ ] **AC-6** — Re-running the repair changes nothing.

## Question for SA
**Q1:** for imported courses, what is "start"? The first session in the plan, the import date, or a column in the
sheet? **Do not guess** — this decides ~170 real customers' expiry dates.

---

## ✅ Q1 ANSWERED — owner, 2026-08-28: **derive the REAL start for imported courses**
> *"1 ม.ค. (วันเริ่มจริง) + 13 สัปดาห์"*

**Imported courses are measured from when the course actually began, not from when we first saw it.**
The real start is **derivable from data we already hold** — courses run weekly, and `prior_sessions` records how
many were taught before the import:

```
realStart = firstSessionInPlan − (priorSessions × 1 week)
expiryDate = realStart + MAX_WEEK_BY_SIZE[size] weeks
```

**Worked example (the owner's own):** 10-session course, 4 taught before import, first remaining session **5 Feb**.
→ realStart = 5 Feb − 4 weeks = **8 Jan** → expiry = 8 Jan + 13 weeks ≈ **early April**.
Measuring from 5 Feb instead would have given **7 May — five extra weeks, free**, for an imported family versus one
who bought the same course today. **Rejected: everyone gets the same window.**

### ⚠️ Consequence the owner must see BEFORE the repair commits
This **shortens** the expiry for imported courses against what they carry today. **Some will land in the past and
flip straight to `EXPIRED`.** That is the correct answer arithmetically and a real customer-facing change.
⇒ **The dry-run must report, by name: how many courses change, and which ones become `EXPIRED` on commit.**
**The owner reads that list before anything is written.** A silent repair that expires live families is the worst
possible way to be right.

- [ ] **AC-7** — For an imported course, `expiryDate = (firstSessionInPlan − priorSessions weeks) +
      MAX_WEEK_BY_SIZE[size] weeks`.
- [ ] **AC-8** — The dry-run lists **every course whose expiry changes**, and **separately** those that become
      `EXPIRED` as a result, by student name and both dates. Nothing commits until the owner has read it.
