# SPEC-005: Fix อ.6 item 7 "ระยะเวลาการอนุญาต" source (TOTAL_DAYS → T_T_LICENSE.PERIOD_TEXT)

- Source: REQ-005
- Status: ACTIVE (DR-1/DR-2 answered 2026-08-05 — join = T_T_LICENSE.REQUEST_ID; @Sober to write TASK)

## Overview
Fix DEF-1 (= SPEC-001 lead D3): อ.6 item 7 prints `EMPLOYER.TOTAL_DAYS + " วัน"`
but the business-confirmed source is **`T_T_LICENSE.PERIOD_TEXT`** (already a full
text value, e.g. "90 วัน นับแต่วันที่ได้รับอนุญาต"). The fix reads PERIOD_TEXT and
drops the hardcoded `" วัน"` suffix.

## Root cause (confirmed in code)
`A6CheckListReportBuilder.buildFromDb` lines 83-85:
```java
String permitDuration = (employer != null && employer.getTotalDays() != null)
        ? employer.getTotalDays() + " วัน" : "";
```
Wrong table + a hardcoded unit. QA (TEST-002 DEF-1) saw "111/90/350 วัน" — the raw
day counts, not the business duration text.

## Intended fix (shape — pending the DATA REQUEST below)
1. Add a minimal read path for `T_T_LICENSE.PERIOD_TEXT` (new `@Entity` +
   `Repository`, or a projection) — the project has **no** `T_T_LICENSE` entity today.
2. In the builder, set `permitDuration = <PERIOD_TEXT for this request>` with **no**
   `" วัน"` suffix (PERIOD_TEXT already carries its own wording).
3. Null/blank-safe: if no license row / null PERIOD_TEXT (e.g. a pure อ.6 คำขอ
   before the อ.7 license exists), print `""` (blank), matching current empty-case.
4. Touch **only** item 7 — no other field changes.

## DATA REQUEST (blocks the executable TASK — @Porter → human)
The join from a requestId to the correct `T_T_LICENSE` row is **not known from code**
and must not be assumed. `T_T_REQUEST_SPECIAL` has `REF_LICENSE_ID` (+ `REF_LICENSE_NO`)
which *look* like the link, but that is unconfirmed. Please confirm and run:

- **DR-1 (join + value):**
  ```sql
  SELECT rs.REQUEST_ID, rs.REF_LICENSE_ID, l.ID AS license_id, l.PERIOD_TEXT
  FROM   T_T_REQUEST_SPECIAL rs
  JOIN   T_T_LICENSE l ON l.ID = rs.REF_LICENSE_ID       -- is THIS the correct FK?
  WHERE  rs.REQUEST_ID IN (38240, 38272, 38273);
  ```
  Confirm: (a) is `REF_LICENSE_ID → T_T_LICENSE.ID` the right join (or is it
  `REFERENCE_NO`, or another key)? (b) exact column name/type of `PERIOD_TEXT`.
  (c) the returned PERIOD_TEXT for those 3 ids (this is also the DEF-1 proof the
  board is already waiting on — one query covers both).
- **DR-2 (edge):** can `REF_LICENSE_ID` be NULL for a valid อ.6 request (คำขอ before
  อ.7)? If so, item 7 blank is correct — confirm.

## Confirmed design (post DR-1/DR-2 — supersedes the "Intended fix" assumptions above)
- **Join = `T_T_LICENSE.REQUEST_ID = :requestId`** (the request's own id). `REF_LICENSE_ID`
  is NULL and must NOT be used — the earlier assumed `REF_LICENSE_ID → l.ID` join was wrong.
- `permitDuration = T_T_LICENSE.PERIOD_TEXT` verbatim (full sentence) — **no `" วัน"` suffix**.
- **No license row → blank `""`** (38240 had none; matches current empty-case).
- **>1 license row (license history):** DR noted join-by-REQUEST_ID can return multiple.
  **SA decision: take the latest by `ID` DESC** (highest ID = most recent). This needs only
  the PK `ID` (a safe assumption — every entity here uses `ID`), no extra schema. If the
  business later needs a status/date-based selection instead, that's a follow-up to @Porter.

## Definition of Done (of the eventual TASK, once unblocked)
- Item 7 for 38240/38272/38273 prints `T_T_LICENSE.PERIOD_TEXT`, not `TOTAL_DAYS + " วัน"`
  (38240 blank, 38272/38273 their PERIOD_TEXT).
- No duplicated unit ("…วัน วัน").
- Compiles; QA re-runs the REQ-001 item-7 check via the /a6/db seam → DEF-1 closed.

## Tasks
- TASK-003: source อ.6 item 7 from T_T_LICENSE.PERIOD_TEXT (join by REQUEST_ID, latest
  by ID, blank when none; drop " วัน"). Status TODO.

## Questions
- See DATA REQUEST DR-1/DR-2 above. (@Porter to relay; answers land in project-docs/
  and here as `> answer: ...`, then I write the TASK and unblock.)
  > answer (Porter, from human, 2026-08-05 — full data in
  > `project-docs/REQ-005-DR1-license-join-result.md`):
  > - **Correct join = `T_T_LICENSE.REQUEST_ID = T_T_REQUEST_SPECIAL.REQUEST_ID`**
  >   (by request id). `REF_LICENSE_ID` is NULL — do NOT use it. So the SPEC's
  >   assumed `REF_LICENSE_ID → l.ID` join was wrong; use REQUEST_ID.
  > - **PERIOD_TEXT is a full sentence** ("ใช้ได้จนถึง 27 ก.ค. 2569 นับแต่วันที่ได้รับอนุญาต")
  >   → drop the hardcoded `" วัน"` suffix entirely (DoD already says this).
  > - **No-license case (DR-2): YES** — 38240 returned no T_T_LICENSE row → item 7
  >   must be **blank** for such requests (matches current empty-case handling).
  > - **DEF-1 proven 100%:** 38272 real PERIOD_TEXT vs printed "90 วัน" — different value.
  > - **Open for you to decide:** join-by-REQUEST_ID may return >1 license row
  >   (license history); sample had ≤1 each. Pick the selection rule (latest / by
  >   status); if you need a business rule for multiples, raise it to @Porter.
  > @Sober: DR-1/DR-2 answered — please write the executable TASK for Jason and unblock REQ-005.
