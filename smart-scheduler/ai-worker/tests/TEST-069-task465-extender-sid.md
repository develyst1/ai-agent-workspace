# TEST-069: TASK-465 — group-series rolling extender, apply on `sid`

- Source: REQ-105 §3 extender (TASK-456), fixed in TASK-465 (NaN "weeks ahead" ⇒ NaN horizon + a TEXT
  date-compare infinite loop; the leading explanation of the 2026-09-24 `sid` Postgres incident).
- Status: **PASS (with one observation).** The extender stocked the horizon correctly and did **not** hang.
- Surface: `sid` (`som.develyst.online`), read-only API + admin calendar UI. I did **not** trigger the job —
  the owner applied it (runId `97aa638b-9bbf-4a9c-8028-12523ae5943a`); follow-up dry run `wouldCreate: 0`.
- Tested: 2026-09-25 by Tanya. Horizon = 2026-11-20 (weeks ahead = 8).

## The applied plan (Porter's brief) vs what exists now
Dry run promised `wouldCreate: 5` across 3 series:
| Series (coach, time) | Planned dates | Now on the calendar |
|---|---|---|
| ครามพราว Inline Skate (Bank, 17:00) | 11-16 | **11-16 created, empty (Seats 0/2)** ✅ |
| คราม & พราว / Inline Skate (Camp, 14:00) | 11-09, 11-16 | **both created, empty (Seats 0/2)** ✅ |
| Balance Play Monday (Camp, 12:00) | 11-09, 11-16 | **11-16 created empty (Seats 0/3)**; **11-09 NOT created** — see the clash |

So **4 of the 5 planned dates were created**; the 5th (Balance Play Monday **11-09**) was correctly skipped.

## Checks (Porter's brief)
1. **Created dates exist, match, empty, right colour** — ✅ Each new row inherits its series' weekday / time /
   title / coach (ครามพราว coach `2fb4f78d` rate 7000; คราม&พราว coach `16bb60dd` rate 300; BPM coach
   `16bb60dd`), 0 live seats, the amber "empty group" tone. No extra coaches/rates on these series to carry.
2. **No duplicates, nothing beyond the horizon, no other series touched** — ✅ Each of the 3 series' date list
   has **no duplicate**; the **max date is 2026-11-16** (≤ horizon 2026-11-20). Only the 3 planned series
   gained rows; the follow-up dry run `wouldCreate: 0` confirms the horizon is fully and correctly stocked.
   (Note: "Balance Play" `6a846d07` runs to 2027-02-08, but it **starts 2026-12-07** — pre-existing data past
   the horizon, not this run's doing; the extender only fills up to 2026-11-20.)
3. **Private on a target coach-hour ⇒ how the clash shows** — ✅ **This is the missing 11-09.** On 2026-11-09
   the Camp coach's 12:00 hour is already held by a PRIVATE — "**Aiwa · Course · Balance Play (Group)**" (a
   COURSE_PACKAGE, the LAST session). The extender could not put the group row on an occupied coach-hour, so
   it **skipped that date and continued** (TASK-456's "a clashing date is reported and the run continues").
   How it SHOWS: the group date is simply **absent** — no Balance Play Monday block at Camp 12:00 on 9 Nov,
   the Private stands alone. There is **no `group.clash` flag** here (that only arises when an existing group
   row yields to a Private; here the group row was never created). **I did not resolve anything.**
4. **Admin screens responsive (no hang)** — ✅ The calendar rendered both target weeks fully and instantly;
   every read returned at once. The infinite-loop symptom (no HTTP response) did **not** occur.

## Observation for Porter/@Sober (not a defect in the calendar state)
The dry run's `wouldCreate: 5` **over-counted by 1** versus the apply's real result (**4 created**): the dry run
listed Balance Play Monday 11-09, but the apply could not create it (the coach-hour was taken by the Aiwa
Private). The dry run does **not** pre-detect coach-hour conflicts — so a plan can promise a date the apply
then legitimately skips. The end calendar is CORRECT (never double-booked); only the plan-vs-actual count
differs. Sober's promised read-only "last job runs" view (TASK-465 round) would surface the skipped date.

## Verdict
**PASS.** The extender fix works: the horizon is stocked to 2026-11-20, the created group dates are empty and
match their series, no duplicates, nothing past the horizon, no hang. The one un-created planned date is the
**correct** outcome of a Private already sitting on that coach-hour — reported here, not resolved.

## Evidence — `../project-docs/qa-2026-09-25/`
- `task465-week-16nov-new-empties.png` — admin weekly 16–22 Nov: the 3 NEW empty group blocks on Mon 16 Nov
  (Bank 17:00 ครามพราว 0/2, Camp 12:00 Balance Play Monday 0/3, Camp 14:00 คราม&พราว 0/2).
- `task465-week-09nov-clash.png` — admin weekly 9–15 Nov: Camp 12:00 on Mon 9 Nov is the Private "Aiwa ·
  Course · Balance Play (Group)"; NO Balance Play Monday group there (the skipped clash date), while คราม&พราว
  14:00 that day was created empty (0/2).

## Footprint
None. Read-only throughout — the owner ran the apply; I only read the API and the admin calendar. No job
triggered by me, nothing created/changed/resolved.
