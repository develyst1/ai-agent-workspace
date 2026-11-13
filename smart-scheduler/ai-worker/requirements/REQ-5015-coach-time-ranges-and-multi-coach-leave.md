# REQ-5015: Coach time ranges (part-day leave, working hours) + leave for several coaches at once
**Status:** SPEC_DONE 2026-11-13 (Sector) · SPEC-108 · TASK-965 + TASK-966 DONE · next: the full-tree gate → ขึ้น git → deploy → Tanya · **Written:** 2026-11-13 by Porter (PM) · **Priority:** MED-HIGH. This work is **free**: the owner says it was owed from the early front office (SYSTEM-FACTS 2026-11-13; REQ-038 item 6 «ช่วงเวลาทำงานของครู» was marked 🟡 partial).
**Source:**
- ขวัญ 2026-11-13 00:46 and 01:02 (CUSTOMER-ANSWERS);
- Sector's sizes in REQUEST-porter-to-sector-2026-11-13-khwan-0043-batch.md § B–D.

## Problem
- Coach leave and coach working time are whole days only.
- She can't record "leave 10–12 only".
- She can't set "this coach works weekend afternoons".
- She can't take several coaches out at once (e.g. a meeting); she has to do it one coach at a time.

## Acceptance criteria
1. **Several coaches at once:** in «Record teacher leave», she can pick several coaches and save one leave for each. Same date or range, same behaviour as today's single leave.
2. **Part-day leave:** a leave can have a start and end time on its day(s). Only those hours are blocked, and make-ups skip only those hours. The leave strip and the coach's LINE message show the time. A leave with no time = the whole day, as today.
3. **Working hours per day:** in Teachers → «วันทำงาน», each ticked day can have from/to hours. Booking outside them is refused with a clear message, and the slot picker greys those hours out. No hours set = the whole day, as today.
4. Existing leaves and coaches behave exactly as today. The regression suite stays green.

## Out of Scope
- Changing whole-school closing (REQ-5013).
- Pay rules.

## Notes
- **Sizes (Sector):** AC1 ≈ 0.5 d (FE) · AC2 ≈ 2 d · AC3 ≈ 1.75–2 d. Total ≈ 4–4.5 d.
- **Order:** sequence it with F1 (multi-day), since both touch where classes may land. Sector decides the order and tells me the dates.
- Questions go in `## Questions` below.

## Questions
- **Sector, 2026-11-13:** two questions with defaults, in SPEC-108 §7.
  1. **LINE copy for a part-day leave:** «เวลา {from}–{to}» is added. Default: yes; it is sent without the time until the owner approves the words.
  2. **One leave per coach per day.** Default: yes.
  > answer (Porter, 2026-11-13): Q2 — yes, one leave per coach per day [PM-decided, cheap to reverse]. Q1 — go with the default (send without the time); I take the words «เวลา {from}–{to}» to the owner for approval and file his answer here.
  - Checked: COPY-REVIEW-2026-09-29:370 (advance leave = whole day, owner-approved). This REQ changes exactly that, so the new words need his approval. SYSTEM-FACTS has nothing on two windows per day.
