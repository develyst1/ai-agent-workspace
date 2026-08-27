# TEST-058: REQ-036 — end a course early (ยกเลิกคอร์ส)
- Source REQ: REQ-036
- Status: TEST_PASSED (sid) — Part A (Tanya read-only + owner before/after) + Part B (owner-verified live: extra-session→409 zero rows); uat = owner decision
- Environments: dev-server (`sid`)
- Tested: 2026-08-24 by Tanya

## Constraint
The cancel is a **write and irreversible**. This QA session cannot perform sid writes, and an irreversible action is
not auto-run regardless. So Tanya verified the **preview sentence — the safety mechanism Porter named as the whole
point — read-only**, and the actual cancel + its effects are routed to the owner (Tanya signs on his before/after).
Fixture: **มิลล่า's Skateboard course** — the awkward case that took a leave (Leave 1/2, EXTENDED make-up 01/Oct, ends
1 Oct 26). **Dialog opened only; "Cancel the course" never clicked. Zero footprint.**

## Cases
| # | Case | Result |
|---|------|--------|
| 1a | Preview is server-driven and names the count | **PASS** — "Cancel the Skateboard course for มิลล่า — this removes the **6 remaining sessions**. It cannot be undone." |
| 1a2 | The count excludes history | **PASS** — 6 remaining = 27/Aug·03/Sep·10/Sep·17/Sep·24/Sep·01/Oct; the 20/Aug **ON LEAVE** session is not counted |
| 1b | Re-open re-fetches (not stale) | **NOT RUN** — script errored on re-open; code is built to re-fetch (no cache) but not proven by run |
| 6a | Reason gate (client) | **PASS** — 3 radios; "Cancel the course" DISABLED with "Pick a reason to continue"; ENABLES once a reason is picked; note optional |
| 2 | Cancel → exactly those 6 gone, no others | **OWNER** — needs the write |
| 3 | No make-up re-owed (no new EXTENDED, size/end unchanged, 0 remaining) | **OWNER** — *most likely failure mode* |
| 4 | Delivered history + `used_sessions` unchanged | **OWNER** |
| 5 | Idempotent (re-cancel → already-ended, no Confirm) | **OWNER** (+ alreadyEnded UI not seen — no ended course yet) |
| 6b | API cancel with no reason refused server-side | **OWNER** (write) |
| 7 | All three reasons round-trip (ADMIN_ERROR esp.) | **OWNER** (write ×3) |
| 8 | No money moved — `bo.movement` count identical | **OWNER** — internal ledger, SQL DATA REQUEST |

## Test data created
| What | Where | Removed? |
|------|-------|----------|
| (none — preview only, never confirmed; มิลล่า's course untouched) | dev-server | ✅ n/a |

## Signed on owner-measured before/after (2026-08-25, cancel run on มิลล่า's Skateboard course)
| field | before | after | required | |
|---|---|---|---|---|
| pending | 5 | 0 | 0 | ✅ |
| extended | 1 | 0 | 0 | ✅ no re-owe (the #1 risk) |
| used_sessions | 0 | 0 | unchanged | ✅ |
| size | 6 | 6 | unchanged | ✅ |
| bo.movement rows | 26 | 26 | unchanged | ✅ no money moved |
| end_reason | null | ADMIN_ERROR | recorded | ✅ |
| ended_at | null | set | set | ✅ |
Preview said **6 remaining**; DB before = pending 5 + extended 1 = **6** → matched, then exactly those 6 → CANCELLED
(soft-cancel: rows marked CANCELLED, 20/Aug ON LEAVE preserved, header "Ends no live sessions"). **Item 5 UI PASS**
(read-only): re-opened dialog shows "This course has already been cancelled." + no Confirm button.

## Observation
The ended course carries a **PENDING `EXTRA` session (25/Aug 09:00 Haris · Onewheel E-Skate)** — residue of the Part B
billing hole (extra added before TASK-185's guard). Inconsistent state (ended course + a live session); cleanup is the
owner's, and it is precisely what Part B's re-break check must prove is no longer possible.

## Part B (owner-verified live, 2026-08-25)
`เพิ่มคาบ(คิดเงิน)` on the ended course → **409 COURSE_ENDED**, **zero rows** (booking count held at 8 = 20/Aug ลา +
25/Aug + 6 cancelled; refusal-moment screenshot showed no new row — proven from the list AND the count). The stray
25/Aug EXTRA residue is now **ยกเลิก** — sid consistent.

## Verdict
**REQ-036 = TEST_PASSED on `sid`, feature complete.** Part A: preview + reason-gate + item-5 UI verified read-only by
Tanya; items 2/3/4/7(ADMIN_ERROR)/8 on the owner-measured before/after. Part B: owner-verified live (extra-session →
409, zero rows; residue cleared). **Accepted risks (on record, not oversights):** item 7 — only ADMIN_ERROR
round-tripped (the other two share the identical server-validated path; where to look first if a stored reason is ever
wrong); item-5 API re-cancel not separately run (the UI makes it unreachable — no Confirm on an ended course).
Re-fetch-on-reopen (1b) not proven by a run. **`uat` remains the owner's decision — production is off QA's hands.**
