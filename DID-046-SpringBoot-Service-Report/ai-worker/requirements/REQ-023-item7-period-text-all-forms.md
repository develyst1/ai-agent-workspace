# REQ-023: ข้อ 7 "ระยะเวลาการอนุญาต" = `T_T_LICENSE.PERIOD_TEXT` — for EVERY checklist form

- Status: READY_FOR_SA
- Priority: HIGH
- Requested: 2026-08-18 by human (dev@smartalliance.co.th)
- Deadline: none (blocks REQ-022 acceptance — อ.14 must be built this way from the start)

## Problem (DEF-10) — อ.9 prints the wrong item 7

Real request **38362** (อ.9, produced end-to-end by the real system, no hand-editing) renders:

```
7. ระยะเวลาการอนุญาต  01/01/2569 ถึง 01/07/2569
```

It must render:

```
7. ระยะเวลาการอนุญาต  180 วัน นับแต่วันที่ได้รับอนุญาต
```

`T_T_LICENSE` for REQUEST_ID 38362 holds `PERIOD_TEXT = "180 วัน นับแต่วันที่ได้รับอนุญาต"`.

### How we got it wrong (Porter owns this)
During DEF-4, sample 18847 had **no** `T_T_LICENSE` row but did have MOVE `START_DATE`/`END_DATE`.
Porter concluded from that single incomplete sample that อ.9 uses the MOVE date range and directed
the change **"item7 = MOVE START/END date range (dropped LICENSE.PERIOD_TEXT)"** (board, DEF-4 row).
That was a wrong generalisation from a request whose licence had not been issued yet. It also
contradicted the rule already delivered for อ.6 (REQ-005).

## Requirement — one concept, all forms

> *"ขอ ให้เป็น คอนเซ้ปนี้หมดนะ"*

1. **Every checklist report** sources item 7 "ระยะเวลาการอนุญาต" from
   **`T_T_LICENSE.PERIOD_TEXT`, printed verbatim** — no computed date range, no `" วัน"` suffix,
   no reformatting. Applies to **อ.6, อ.9 (both variants), อ.14–อ.16, and อ.4–อ.8 when built.**
2. **Join by `REQUEST_ID` only** — `T_T_LICENSE.REQUEST_ID = <the request's REQUEST_ID>`.
   Do **not** filter on `T_T_LICENSE.FORM_ID`: the licence row carries the **licence's** form id, not
   the request's (38362 is an อ.9 request and its licence row has `FORM_ID = 10`). `REF_LICENSE_ID`
   is not the linkage — this is the same join the human corrected us on in REQ-005.
3. **No licence row ⇒ print blank.** (Human decision.) A request with no `T_T_LICENSE` row simply has
   no approved period yet; item 7 stays empty. Do **not** fall back to MOVE `START_DATE`/`END_DATE`.
4. Revert the DEF-4 change on อ.9 that switched item 7 to the MOVE date range.
5. Oracle 11.2-safe lookup — the repo convention is `List` + `firstOrNull`, never `FETCH FIRST`
   (DEF-2). If more than one licence row exists for a request, take the same one อ.6 takes and say so
   in the SPEC.

## Acceptance Criteria
- [ ] อ.9 / 38362 prints `180 วัน นับแต่วันที่ได้รับอนุญาต` — verified on the **real DB seam**.
- [ ] อ.9 / 18847 (no licence row) prints **blank**, not "null" and not a date range.
- [ ] อ.6 is unchanged (38272/38273 still exact per REQ-005 DR-1; 38240 still blank) — no regression.
- [ ] อ.14 (REQ-022) is built to this rule from the start, not patched later.
- [ ] The rule is written into the shared checklist conventions so อ.4–อ.8 inherits it.

## Constraints
- `.jasper` changes regenerate into `src/main/resources` + `clean compile` + restart (DEF-7 lesson).
- Verify on the real DB path, not the mock preview (DEF-5 lesson).

## Traceability
- Same rule as REQ-005 (อ.6 item 7). This requirement generalises it to every form and reverts the
  อ.9 deviation introduced under DEF-4.

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`)
