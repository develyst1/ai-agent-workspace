# SPEC-032 — SOM dashboard: filter the figures by booking type

- Source: REQ-034 (owner relaying คุณปุ้ม, 2026-08-02).
- Status: DESIGN — MEDIUM, **NOT on the 2026-08-20 critical path** (owner may move it). REQ-013 already `TEST_PASSED`.
- Depends on: nothing new; extends `GET /api/reports/som` (SPEC-020 / `som-report.service.ts`).

Grounded in `som-report.service.ts` (read 2026-08-04). It's read-only; no migration.

## 1. The decision that resolves Q1 — and it falls out of the existing code

Today's **sport share is already "one unit per DISTINCT STUDENT"** (`§2`: each student → one `primarySport(...)` over
their bookings, so shares sum to 100%). So the filter is the **same computation restricted to a booking type**, and
that fixes Q1 without a new vocabulary:

> **The filter counts DISTINCT STUDENTS.** A student is "in" a type if they have ≥1 booking of that type; their sport
> under that filter is their **primary sport among their bookings OF THAT TYPE**.

Consequences, both **stated on the screen** (the REQ's hard requirement — a dashboard whose columns don't add up
loses trust):
- **The three type-filters do NOT sum to "All".** A student holding both a course and a voucher is counted under
  *both* Voucher and Weekly-Course. The screen must say: *"counts are by student; a student with more than one
  entitlement type appears under each, so the filters don't sum to All."*
- **"All" reproduces today's accepted numbers exactly** — by construction: "All" = every student, sport = primary
  over *all* their bookings = today's `sportShare` (AC #4, no regression). This is the reason to restrict the *same*
  function rather than write a second one.

## 2. The mechanism

- **`GET /api/reports/som?bookingType=ALL|FIRST_TRIAL|VOUCHER|COURSE_PACKAGE`** — one param, default `ALL`
  (= today's payload, unchanged). Keep the one-endpoint / FE-is-a-renderer shape (SPEC-020).
- Under a non-`ALL` filter, build `bookingsByStudent` from **only the bookings of that type**; everything downstream
  (`primarySport`, `breakdown`) is unchanged — it just sees a filtered input. So no duplicated logic.

## 3. Which sections honour the filter (Q2) — and which must say "not applicable"

The REQ is explicit: a section either honours the filter or **visibly states it can't** (a silent unfiltered number
under a filter is worse than an honest "N/A").

| Section | Under a type filter |
|---|---|
| **Sport share** (§2) | ✅ **Honours** — the named requirement. Students-of-type by their in-type primary sport. |
| **Demographics** (§4) | ✅ **Honours** — restrict the student set to students-of-type (gender/age/province/nationality of *who does this type*). Porter's lean, and the commercially interesting one — "who converts". |
| **Existing customers** (§1) | Already split by type (`byCourse`/`byVoucher`/`byRecentTrial`). Under a filter, **highlight the selected type's number**; it's inherently type-aware, no recompute. |
| **New vs renewing** (§3) | ⚠️ **Partial → state it.** `newByFirstTrial` is trial-only; `renewing` is course/voucher-only. Under a Voucher filter, "new by first trial" is **N/A** — show the sub-metrics that apply, mark the rest *"ไม่เกี่ยวกับตัวกรองนี้"*. |
| **Today** (§5) | ⚠️ `getDailyReport` isn't type-split. Either mark it **"ทุกประเภท (ไม่ถูกกรอง)"** under a filter, or split today's bookings by type — **SA call: mark not-filtered** (cheapest, honest; splitting today's attended/expected by type is a separate small piece if the owner wants it). |

## 4. 🔴 The voucher historical-data caveat (must be on screen)

Voucher bookings before **REQ-029 shipped (2026-08-04)** had `subjectId` auto-filled by array position (wrong).
So **voucher-filtered sport share is unreliable for historical bookings** — correctly (the *data* is wrong, not the
report). The report can't fix it. **Surface a note on the voucher-filtered sport share**: *"โปรแกรมของวอยเชอร์ก่อน
[REQ-029] อาจไม่ถูกต้อง — สัดส่วนกีฬาของวอยเชอร์ย้อนหลังอาจคลาดเคลื่อน."* Whoever reads the chart must be told; do
not let it imply a precision the rows don't have.

## 5. Open items (owner confirmation via @Porter — non-blocking; MEDIUM, off critical path)
1. **Unit = students** (my call, matches REQ-013 + your lean). Confirm the on-screen "doesn't sum to All" note is
   acceptable, or if the owner wants *entitlements* instead (then a course+voucher student = 2 rows, still no sum).
2. **Today section** under a filter = "not filtered" note (my call) vs splitting today by type (small extra). Confirm.
3. Everything else (sport-share + demographics honour; new-vs-renewing partial-N/A) is settled.

## 6. Tasks (cut on ack — after go-live unless the owner pulls it in)
- **BE TASK-110** — `bookingType` param on `getSomReport`; filter `bookingsByStudent` (sport share) + the student
  set (demographics) by type; per-section `applicable` flags for new-vs-renewing / today; the voucher caveat flag.
  Tests: `ALL` = byte-for-byte today's payload; a type filter restricts sport-share to in-type students; N/A flags set.
- **FE TASK-111** — a booking-type control (All default); render the filtered sections; render **"not applicable"**
  where flagged; the **doesn't-sum-to-All** note + the **voucher historical** caveat. No client recomputation.
