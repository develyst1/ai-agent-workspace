# TEST-120: TASK-748 (REQ-129 = B), the per-coach "Total (+Group)" = confirmed lessons + group work in hours, on sid

- **QA:** Tanya
- **Date:** 2026-10-25
- **Environment:** sid: back **`bd69978`** (front unchanged)
- **Brief:** Porter's ⏸️ / ▶️ TASK-748 entries in `inbox/QA.md`

**Verdict: ✅ PASS on sid.** The uat check follows the owner's uat deploy.

## The rule, read from the change (`lib/daily-report.ts`, `WORKLOAD_STATUSES = CONFIRMED_STATUSES`)
- A coach's `total` grows by **1 (one hour) per row in CONFIRMED · ATTENDED · NO_SHOW**, of any kind (lesson, ECA / Other hour, camp hour, group), for the main AND each extra coach.
- **On leave, pending / extended, paused and cancelled add nothing.**
- A coach with only such rows is still **listed, with Total 0**.

## 1 · API = my independent recount (the new rule), every coach, 6 days: ✅
| Day | All teachers (workload rows) | `?teacherId`, all 29 coaches | Coaches listed with Total 0 |
|---|---|---|---|
| 20 Oct | ✅ = recount | ✅ 29 / 29 | 1 of 6 |
| 21 Oct | ✅ | ✅ | 2 of 7 |
| 22 Oct | ✅ | ✅ | 1 of 8 |
| 23 Oct | ✅ | ✅ | 2 of 8 |
| 24 Oct | ✅ | ✅ | 3 of 6 |
| 25 Oct | ✅ | ✅ | 2 of 3 |

## 2 · "A 2-hour ECA counts 2" (a QA fixture, then cancelled): ✅
- **25 Nov, qatt75:** a QA class "QA-T748 ECA" of **3 hour rows** (09:00, 10:00, 11:00); **09:00 + 10:00 confirmed**, 11:00 left **pending**.

| | qatt75 Total (+Group) |
|---|---|
| before | 0 |
| **with the 2 confirmed hours + 1 pending** | **2** ✅ (the pending hour adds 0) |
| after cancelling all 3 (ADMIN_ERROR) | 0 ✅ (restored) |

Others Program for the same day: ECA "QA-T748 ECA" 5 kids (head count once per class, as before).

## Note for Silver / Porter (a consequence, not a judgement)
- **An ECA / Other hour that is still PENDING now adds 0 to the coach's Total.** On sid, Other rows in 20–25 Oct are only CANCELLED or ATTENDED, so nothing changed there.
- On uat the expected values (25 Oct Kid 6; 24 Oct Kid 5, Toth 4, Tarb / Ek 0) follow from TEST-118's rows: exactly the confirmed / attended lessons, with no group work on those days. **To check after the uat deploy.**

**Script:** `t748.js` (scratchpad).
