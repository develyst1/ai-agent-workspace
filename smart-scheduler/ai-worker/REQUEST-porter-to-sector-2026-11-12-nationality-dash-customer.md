# REQUEST 2026-11-12 · Porter → Sector: which customer has nationality "-" (uat, read-only)
ขวัญ, private chat 15:38 (CUSTOMER-ANSWERS 2026-11-12): *"รบกวนพี่โด่งขอดูของคนนี้ที่เป็น - ให้ด้วยได้ไหมคะ"*. It is on the SOM Dashboard Nationality card (9 Aug – 12 Nov 2026, "based on 242 of 317 customers"), where "-" counts 1.

Use `scripts/uat-select.mjs` only (SELECT, your SA read grant), with one log line: seat · purpose · tables, no values.
1. Find the customer behind "-". Give the child's name and the parent's name, if the parent has one. When the parent name is NULL, give the child, as you did for the 3 addresses on 11-10. Also say where ขวัญ fixes it herself (which screen and field).
2. Count only, no names: how many customers have each near-duplicate value: China vs Chinese, Foreign, Thai&German. Is each value typed free-text, or picked from a list? This tells us whether she can clean them herself.

Put the **names in `.private/khwan-nationality-dash-2026-11-12.txt`** only. The answer here is counts and the screen/field; personal data stays out of shared files.
Answer under `## Answer`, then add one line to inbox/PM.md.

## Answer
**Sector (SA, Team C), 2026-11-12, uat read-only** (`scripts/uat-select.mjs`, host 154.197.124.29; 5 SELECTs on `students`, `parents`, `bookings` and `course_packages`; counts only here).

**1. Who is "-"?** On uat, **4 students** (none archived) have the nationality typed as `-`, not 1.
- The dashboard counts only the ones in its base set. The base is the active course and voucher holders, plus the 1 HR children of the last 3 months. That's why the card shows 1.
- **All 4 should be fixed.** As each child's course or voucher state changes, a different one of them will show up on the card.
- **Names:** `ai-worker/.private/khwan-nationality-dash-2026-11-12.txt` holds the child, nickname and parent for each. **None of the 4 parents has a name** (phone only), so the file gives the children.
- **Their entitlements, no names:**
  - k1: a 10-class course, 10/10 used;
  - k2: a voucher, last class 30 Aug;
  - k3: a voucher, last class 24 Oct;
  - k4: a 1st Trial, then a 6-class course, 6/6 used, last class 12 Nov.
- I did not work out which one the card counts today. That would mean re-running the dashboard's whole base rule on uat. Fixing all 4 settles it either way.
- **Where ขวัญ fixes it herself:** front office (smart-scheduler) → **People** → the child → **Edit student** → **Nationality**.
  - Pick **Thai**, or **Foreign** and type the country in the box beside it, or **None** (none leaves it blank, and blank counts as "unknown" rather than "-").
  - `StudentFormModal.tsx:163–185`.

**2. The near-duplicates.** Students on uat, all non-archived unless noted:

| Value | Students |
|---|---|
| China | 3 |
| Chinese | 1 |
| Foreign | 19 (18 active) |
| Thai&German | 1 |

For context: Japan 2 / Japanese 1 · India 6 · British 2 · American 1 · Korean 1 · Taiwan 1 · Thai («ไทย») 413.

**How each value is entered:**
- **Only Thai is picked from a fixed choice.** It is saved as «ไทย».
- **Every other value is free text,** typed in the Country box after choosing **Foreign**. That's why China/Chinese and Japan/Japanese both exist.
- **«Foreign» (19) is the word itself typed as the country.** The child's country was not given.

**So ขวัญ can clean them all herself** through the same Nationality field, one child at a time (no bulk tool). Possible later improvement, not asked for: a pick list of countries instead of free text. That would be a small FE change and would need her OK.
