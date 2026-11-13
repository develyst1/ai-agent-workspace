# CHECK: REQ-5004, SOM Dashboard round 2 (@Silver, 2026-11-06)
**Read only: nothing changed.** Back = `smart-scheduler-back` at `dc9cb7d`, `src/lib/som-contract.ts`. Front = `smart-scheduler-front`, `src/components/partials/Som/*`, read only. No uat numbers here: I don't read uat.

## §4.1 Back or Palm's screen
| row | back (ours) | Palm's screen |
|---|---|---|
| **T** headings | nothing | `lib/i18n/dictionaries.ts:1832, 1857, 1906, 1914, 1915`: 5 English strings. Thai labels aren't in her list |
| **1** all data + from–to | new query: `from` + `to`, no period = all data. `month` keeps working, so **the back can deploy first** without changing today's screen | `SomContent.tsx:20` opens on the current month. `SomFilters.tsx` has only a month picker: it needs All / month / from–to. Section labels (`monthLabel`, `som.capacityMonth`), the service params, the list modal's params, `types/app/som` |
| **2** 1st moves out | all | nothing |
| **3** Total = Active | all | nothing |
| **4** capacity | the rates, PT, FL, Karn | `CoachCapacitySection.tsx`, `Figures` + `Period`: always draw "x / y h", a % and a bar. **FL must show hours taught only** (AC-5). The back sends FL as 0 available, same shape; the screen hides it by `teacherType` |

**So Palm's list is: 5 strings · the period control and its default · the FL display. His doc (`docs/backend-som-dashboard.md` §0.1, §2, §4) also goes out of date.** For Porter, through the owner.

## §4.2 "วันทำงาน", and leave
- **Source:** `teachers.work_days` (a set of weekdays, default all 7), read at `:619`. Nothing else stores working days.
- **Leave:** recorded days (`teacher_leave_days`, through `recordedLeaveDays`) are deducted today. Her words don't say. **I keep the deduction:** a day on recorded leave isn't a working day, and it's what her 101 / 234 h already did. If anyone wants it off, it's one line.
- **Limits, for the definitions list:**
  - `work_days` has no history. A past period uses today's set.
  - A coach still on the default all-7 is counted as working all 7 days. **Check before the gate:** Tanya reads each coach's type + work days, read only, so a wrong setting isn't taken for a bug.

## §4.3 Karn
- **Today nothing knows:** there are no per-coach hours (CHECK-REQ-124 M7), and I found no use of that name in the code.
- **Recommendation: a setting.** One nullable column on `teachers`, `weekend_capacity_hours` (migration 0073 unless Team A takes that number first). Null = the type's rate. No name in the code.
- **Setting it:** one `UPDATE` per environment, bare SQL for the owner (DATA REQUEST), by the id Tanya reads from the teacher list. **No Teachers-page field:** one coach doesn't justify a form. If it becomes common, it's small.

## §4.4 PT + FL on one person
- **F3 isn't built:** `teachers.type` holds one value, so a PT + FL coach is simply typed PT or FL. `UNDERSTANDING-backoffice-2026-10-13.md:336` names 5 of them: Toth · Kid · Fit · Karn · Print. **It works without F3**, by the day: for a PT, a weekday class is the FL part (REQ-120 R1.1).
- **Confirmed design for a PT row:**
  - **Hours (x / y)** = weekend booked / weekend capacity. Weekday FL classes stay out of both.
  - **Weekday cell:** taught hours stay real, capacity 0, % 0. So they **still show as hours taught**, in their own cell, and don't inflate the fraction. Palm may want to hide the "/ 0".
- **A limit:** one of the 5 typed FL shows as FL (no capacity at all) until someone changes the type. Tanya's coach list shows it.
- **By type:** the sums follow the same rule.

## §4.5 Line 10 (1st Trial, no course)
**Not touched.** Row 2 is card 3 only. Line 10 stays "no course bought by the end of the period; a voucher doesn't convert" (REQ-124 Q3.4, her 11-05 line). So a 1st Trial child who opened a voucher leaves card 3 but stays on line 10, which is what each line says.
- **Trap for the build:** `boughtByAsOf` and its one switch `TRIAL_MOVES_OUT_ON_VOUCHER` also feed **card 4** (`:241`). Flipping it would make a voucher move a child off 1 HR too, and REQ-5002 says 1 HR leaves only on a course. The two cards must stop sharing the switch.
- **"After the 1st" (AC-3):**
  - a course or voucher moves the child whatever the order (TEST-109 N1, as today);
  - a 1 HR moves the child only if dated on or after the 1st Trial, and on or before the as-of date. A 1 HR before the trial isn't "came to the 1st, then opened a 1 HR".
  - A child moved by a 1 HR appears on card 4 instead.

## §4.6 Active in a past range; what "all data" means
- **The as-of day = the range's end, capped at today.** The same rule as REQ-5002 §6.1 with a longer window: ACTIVE that day, and a live class dated after it. All data ⇒ as of today.
- **Total** = distinct children on those same courses and vouchers, so it moves with them. **Archived students stay out** (REQ-5002 §7.3 isn't overturned), so in the rare case of an archived child holding an active course, Total differs from cards 1 + 2. Tell me if AC-4 should win.
- **All data = from the earliest non-cancelled lesson row to today.** Future-dated classes aren't in it. **The month view is unchanged.**
- **Card 3 + 4's "last 3 months"** = the 3 calendar months ending at the range's end.
- **🔧 New Course lines over a range: my decision, please read.** "This month" and "previous" can't mean the selected month any more: on all data nothing is "before", so New previous would always be 0. **Rule per row: a first course opened in the range, with the 1st Trial in the same calendar month as the purchase (this month) or an earlier one (previous).** On a single month this gives exactly the same answer as today, so REQ-5002's numbers hold.
- **Capacity over a range:** the range's days × the rates. **A rough number on all data:** a coach hired later would count from the data's start, so I start each coach at the later of that and `teachers.created_at`. No start-date history beyond that.
- **Others (Demographics, Activity):** they read the same range. Today stays locked to today.

## Effect on REQ-5002's definitions
Lines 3, 5 and Coach capacity change, as the REQ says. **Line 7 + 8's wording** gets "same month as the purchase" (above). The rest hold.

## Sizes + TASKs (⏸️ HELD for Porter's GO; Bob)
| TASK | what | size (+10 %) |
|---|---|---|
| **TASK-756** | rows 2, 3, 4 + Karn's column | ≈ 1.7 d |
| **TASK-757** | row 1 on the back: `from` / `to` / all data, every section and the list endpoint | ≈ 2.8 d |

**Total ≈ 4.5 d back.** The period is the large part: `month` is threaded through 44 lines of the counters, with its pins and mutants. **756 can ship alone;** it needs no screen except FL's display. **Palm's part isn't sized by me.**

**Claims to grant:** `src/lib/som-contract.ts` + the 741 / 742 tests and sets · `src/services/som-contract.service.ts` · `src/validation.ts` (`somQuery`) · `src/db/schema.ts` + the new migration + `migration-witness.ts` (756).

**Gate:** Tanya's recount, no numbers from me. Rows 2–4 change cards I can't count from here.
