# DEV-SERVER FOOTPRINT — `sid` (som.develyst.online)

> Owner: Tanya (QA). The single running ledger the stakeholder asked for
> (*"ต้อง track ได้"*). Everything I create on `sid`, and whether it is gone.
> One place Porter can open to answer *"what has QA touched?"* without reading
> every TEST file.
>
> **Rules I follow (Porter [morning]/[afternoon] 2026-08-02):** every record I
> create carries a visible **`QA-`** marker; I never edit a row I did not create;
> I never message a real person; I clean up and declare what I could not.
> `sid` DB host = `154.197.124.206` (confirmed dev by the owner).

## Records created

| Date | What | Marker | TEST | Removed? |
|------|------|--------|------|----------|
| 2026-08-02 | Parent `1405dbbc-4466-40f6-a060-0d08d9f62930` phone 0900000091 | name **QA-expv-parent**, note "QA expired-voucher test…" | TEST-022b | ❌ **no delete endpoint** — suspend is the only off-switch. Left in place, QA-marked. |
| 2026-08-02 | Student `be5192a8-9634-4b81-a1c8-cb7a7f855995` under that parent | name **QA-expv-student**, nickname **QA-expv** | TEST-022b | ❌ no delete endpoint. Left in place, QA-marked. |
| 2026-08-02 | Voucher `13c369bc-23a5-4e89-95b0-92c7cbf8199f` 5h, expiry forced to 2026-04-05 (via a past first booking) | belongs to QA-expv-student | TEST-022b | ❌ no delete endpoint. **Expired + 0/5 used** → inert; cannot be spent (that is the test). |
| 2026-08-02 | Revenue movement from the voucher sale (`createVoucher` → `recordSale`, if wired on `sid`) | via QA voucher above | TEST-022b | ❌ **cannot remove** — no delete path for `bo.movement`. Small residue on the money ledger; flagged to @Porter. |
| 2026-08-02 | Booking #1 `e009b01c-e12b-4d3e-b15b-8c55831f0c2c` (voucher, 2026-01-05 09:00) | note "QA expired-voucher test" | TEST-022b | ✅ **CANCELLED** (status→CANCELLED; the softest removal the API offers). |
| 2026-08-02 | Booking #2 (2026-08-05) — **never created** (the 400 under test) | — | TEST-022b | ✅ n/a — rejected. |

## Rejected/rolled-back write attempts (created nothing — logged for traceability)

| Date | Attempt | Result | Residue |
|------|---------|--------|---------|
| 2026-08-02 | `POST /courses` Onewheel **size 10** (forbidden combo) | 400 "ไม่มีแพ็กเกจ 10 ชั่วโมง" — refused **before** the DB transaction | none |
| 2026-08-02 | `POST /courses` Balance Play (Private) **size 4** (forbidden combo) | 400 "ไม่มีแพ็กเกจ 4 ชั่วโมง" — refused **before** the transaction | none |
| 2026-08-02 | `POST /courses` Onewheel **size 6** (allowed) with a **nonexistent** student id | 400 "ข้อมูลอ้างอิงไม่ถูกต้อง" — passed the sellable gate, failed at student resolution **inside** the tx → rolled back | none (atomic tx rollback) |

## Notes

- All entries above are `POST` attempts that the server **rejected**; no course,
  no booking, and no `bo.movement` revenue row was written. Recorded here anyway
  because "attempted a write on `sid`" is exactly what the owner wants traceable.
- The size-6 rollback relies on transaction atomicity (Drizzle/postgres-js). If a
  future audit ever finds an orphaned Onewheel size-6 course with no student, this
  is the entry to check it against.
