# TEST-5000: REQ-5000 — why "Lewis" is missing from the Voucher tab (uat, READ-ONLY investigation)

- REQ: `requirements/REQ-5000-voucher-booking-child-not-found.md` (step 1 of §Plan)
- Tester: Tanya (QA) · 2026-10-26 · surface: `uat` API (frontoffice.develyst.online), READ-ONLY
- Authorization: Porter, `inbox/QA.md` 2026-10-26 (Q1 answered owner via Atom 17:48)
- Status: CLOSED 2026-10-26 — REQ-5000 closed by the owner 18:13 (no code change; see REQ-5000 §Questions Q3). Investigation only; no verdict, nothing was built to test.
- Code read at: `smart-scheduler-back` `atom` @ `d9c0cf3`, `smart-scheduler-front` `atom` @ `46c6ee1`. The uat build is
  older; the uat **behaviour** below comes from uat itself, not from this code.

## Finding (from uat, 2026-10-26 ~17:56 local)

There are **two** child records called Lewis, **under the same parent** (`c1fba534…`):

| Record | id | State | Voucher |
|---|---|---|---|
| "Lewis Lui" | `f9100442…` | active | **none** (0 vouchers) |
| "Lewis Liu" | `d43e7f0d…` | **ARCHIVED 2026-10-16 05:31 UTC** (12:31 Bangkok time) | `444d5925…` **ACTIVE** — 15 h, 4 used, **11 left**, expires 2027-06-13, not ended |

- **Other tabs** (1st Trial / 1 HR / Other) use `GET /students?q=` → find **"Lewis Lui"** (active record). That record has no voucher.
- **Voucher tab** uses `GET /students/eligible?type=VOUCHER` → lists only children whose voucher is usable **and who are
  not archived** (TASK-392, `scheduler.service.ts` `getEligibleStudents`). The voucher sits on **"Lewis Liu"**, which is
  archived → filtered out. Result: 0 rows for "Lewis" (47 voucher-eligible children in total, Lewis not among them).
- So "it only fails on Voucher" is two different records: staff see Lui on the other tabs, and the voucher is on Liu,
  who is hidden because he is archived.

**Why it could happen (code read, not run):** `archiveStudent` (`parent.service.ts`) refuses an archive only when
there are **future live bookings**. An **active voucher with hours left does not block it**, and nothing warns or moves
the voucher. Most likely Lui was created as a duplicate or misspelling and Liu was archived on 2026-10-16. That is a
guess: the logs don't say who archived him or why.

## What this means for REQ-5000 (Porter's / owner's call, not QA's)

Two separate things, both for the owner to decide:
1. **The data on uat:** this one child's 11 voucher hours are stranded on an archived record. Fixing it is a **write on uat**
   (e.g. un-archive Liu, or move the voucher to Lui, plus what to do with the duplicate). QA does not do this — DATA REQUEST /
   owner's decision.
2. **The product gap:** archiving a child who still has a usable voucher (or course) is allowed and leaves no trace on
   the Voucher tab. Whether to block, warn or transfer is a business rule for the owner (REQ-5000 Out of Scope already
   says a rule change comes back to him).

## Evidence

- Command: `node smart-scheduler-atom/ai-worker/tests/harness/uat-req5000-probe.mjs <uat credentials file> Lewis`
  (host-locked to uat; the only POST is the app's own login; every other call is a GET; secrets never printed).
  Key output lines:
  ```
  [1] GET /students?q= (other tabs' picker) → HTTP 200, 1 row(s)
    student f9100442 · name="Lewis Lui" · nick="Lewis Lui" · archived=- · hasParent=true
  [2] GET /students/eligible?type=VOUCHER&q= (Voucher tab) → HTTP 200, 0 row(s)
  [3] GET /students/eligible?type=VOUCHER (no q) → HTTP 200, 47 row(s) total
  [5] GET /vouchers?studentId=f9100442 → HTTP 200, 0 voucher(s)
    (q-match voucher on a student NOT in [1]) voucher 444d5925 · student d43e7f0d "Lewis Liu" · status=ACTIVE
      voucher: total=15 used=4 remaining=11 · exp=2027-06-13 · ended=-
      [6] /students default q="Lewis Liu" → 0 row(s), this student found=false
      [6] /students archived=true q="Lewis Liu" → 1 row(s), this student found=true
          archivedAt=2026-10-16T05:31:46.714Z · parent c1fba534 · other-tab Lewis parent(s): c1fba534
  ```
  This proves the voucher is on a different record (Liu) from the one the other tabs find (Lui), and that Liu is archived.
- **Screenshots: none taken.** The UI booking modal was not driven on uat (a real customer's child, and an API read was
  enough to find the cause). If the owner wants to see it on screen: open a booking → Voucher tab → type "Lewis" → empty;
  then People → archived children → "Lewis Liu".

## NOT_TESTED

- The painted Voucher tab on uat (UI) — the API that tab calls was checked instead (see above).
- Who archived Liu and why — not visible through these reads (`archivedBy` was not returned).

## Test data created

None. Read-only. Footprint on uat: one login via the app's own login form (POST /api/auth/login) plus GETs. No row
created or changed.

## Questions

- (for Porter) Data fix on uat for this child + product rule for archiving a child with a live voucher/course — owner's decision; see "What this means".
