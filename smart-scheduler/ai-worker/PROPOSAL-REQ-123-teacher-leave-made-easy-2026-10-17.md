# PROPOSAL: make the teacher's advance leave easy (REQ-123 §2), for the owner's OK (@Porter, 2026-10-17)
**Sources:**
- Tanya's friction list, by an admin walking the real flow on sid (`tests/TEST-107…` §2, ranked worst first);
- Sober's code map (`MAP-teacher-advance-leave-2026-10-17.md`, §7 gaps).

**Already moving:**
- **TASK-813** (create no longer refused for a planned-absence week; on sid, proof pending);
- **TASK-814** (cancel a FUTURE leave; copy awaiting the owner).

## What is hard today (worst first)
| # | friction (Tanya) | the code fact (Sober) |
|---|---|---|
| 1 | Create refused even with the planned absence, and **no warning until Create** | the guard ignores status (fixed by 813). Generate plan never checks leave |
| 2 | A recorded leave **can't be removed or corrected** | the back route exists; no screen calls it (814: future only) |
| 3 | **No date range**: 3 days = **24 clicks** + the reason typed 3 times | one day per record |
| 4 | The result lists the affected classes **by time only**: no child, no link, nothing to act on | the list is informational |
| 5 | The calendar banner "is away — 1 class(es)" **can't be clicked** | ruled "not a control" earlier |
| 6 | **No list of upcoming leave** anywhere | none exists |
| 7 | The entry is **buried under Teachers ⋮** | the only entry point |
| 8 | The date is **pre-filled with "tomorrow"** | default |
| 9 | **"ลา" means 3 things**: a child's leave, a teacher's leave, a planned absence | three features share the word |
| + | One "leave" button does **two different things by date** (future = block only; today/past = cancel classes + tell families) · the teacher can't see their own days · camp's coach-on-leave list is shown nowhere | MAP §7 |

## What we propose (two phases)
### Phase 1: the admin's daily job, easy (proposed next)
| P | change | fixes |
|---|---|---|
| P1 | **Generate plan warns** on a leave week, with a one-click "tick as planned absence" | 1 |
| P2 | **A date RANGE** (from–to) with **one reason**: one record, many days | 3 |
| P3 | **The affected classes listed with child + program + a link**, each with its next step (open the booking: move / another teacher / cancel) | 4 |
| P4 | **The calendar banner opens the leave**: its days, its affected classes, and **Cancel leave** (future, from 814) | 5, 2 |
| P5 | **"Teacher leave" list**: upcoming + past, per teacher, with Cancel (future), reachable from the **calendar AND the Teachers page** | 6, 7 |
| P6 | Default date = **the day you clicked on the calendar** (or empty), never "tomorrow" | 8 |
| P7 | **Say clearly before saving what the button will do**: "future = only blocks the day" vs "today = cancels N classes and tells N families" | the two-in-one button |

### Phase 2: later
- **Undo** a today/past leave (restore classes? re-notify families?): it needs rules from Khwan.
- **One word per meaning** (child "ลา" vs teacher "หยุด/ลา" vs "ลาล่วงหน้าตอนสร้างคอร์ส"): copy approval, all languages.
- The **teacher sees their own leave days** (their login, REQ-097).
- **Camp's coach-on-leave** shown on the camp screens.

## Ask
1. **The owner OKs Phase 1** (all P1–P7, or picks some).
2. Then the SAs size and cut it. **All new wording comes back for copy approval before it ships.**
3. Phase 2 waits.
