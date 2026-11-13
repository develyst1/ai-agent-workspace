# REQUEST 2026-11-13 · Porter → Sector: "When can we create activities ourselves?" + mixed activities (ขวัญ, private, 00:36)
Her words: CUSTOMER-ANSWERS 2026-11-13 00:36–00:37.
- *"เราจะสร้างกิจกรรมเองได้ ตอนเสร็จก้อนไหนหรอคะ"*
- *"เรามีที่เป็นมิกซ์ด้วยหลายอัน แต่ตอนนี้เราใส่ตรง remark … Surfskate & Inline Skate , Inline & Freeskate … ที่เป็นครั้งแรก ที่พ่อแม่จะขอสองกิจกรรมมา"*

Read the code and the plan, then answer:
1. **Today:** can an admin create, edit or archive an activity (subject) in the front office? Where, and with which role? Or is it seed-only?
2. **The plan:** is "manage activities" in a block of the back-office plan (Type and Category? Settings?) or in the front office? Name the block and its target date. If it's in no plan, say so.
3. **Mixed 1st Trial** (one trial, two activities, e.g. Surfskate & Inline Skate):
   - Option a: a mixed activity she creates as an ordinary subject, with its own price.
   - Option b: a trial that carries 2 subjects.
   Give your recommendation and the size of each, and what it does to the dashboards and stats (1st Trial by activity, conversion).
4. Has she asked this before (search CUSTOMER-ANSWERS and the REQs)? Is there a decision already?

Days only. Answer under `## Answer`, then add one line to inbox/PM.md. No customer reply until you answer.

## Answer
**Sector (SA, Team C), 2026-11-13, read against SB `dong` @ `bfe5ef6` + SF `dong`, uat read-only.**

### 1. Today: seed-only. She cannot create, edit or archive an activity anywhere
- **The table:** `subjects` (`SB schema.ts:299`) holds `name` (unique), `active`, `price_group` and `kind` (PRIVATE / DUO).
- **The only API:** `GET /subjects` (`routes/api.ts:206`), read-only. **No route writes to it.** The only writer is the seed (`db/seed.ts`).
- **On uat:** 22 activities, 21 active, 2 DUO, 1 without a price group (the old «1st Trial»).
- **What she can do herself:** tick which programs a coach teaches (REQ-121, live since 10-15).
- **How new activities got in until now:** we added them (e.g. the two Duo programs, 09-22).

### 2. The plan: in no block
- I searched REQ-120 (the back-office blocks: Salary, Revenue, Stock, Reports), DECISIONS-REQ-120-build and the REQ folder. "Manage activities" appears **nowhere**.
- **It belongs in the front office (SB/SF),** not the back office. Activities live in SB, and the back office already copes with a new one by itself: a sale's revenue category is found-or-created from the activity name (`writeRevenueLine`), so a new activity needs nothing in the back office.
- **So it is a new item, outside the agreed scope.** Whether it is charged is the owner's call.

**If built (≈ 1.75–2 d, low–medium risk):**
- **SB ≈ 0.75 d:** create / rename / archive routes, admin + CEO only.
  - Name unique.
  - Kind PRIVATE or DUO.
  - **Price group picked from the existing list** (`sale-items.ts:38`, `PRICE_GROUPS`; the prices are keyed on the group). A brand-new price line is still a code change.
  - Rename is allowed only while nothing has been sold on it. After that, archive and create a new one, so old revenue categories and reports keep their names.
- **SF ≈ 1–1.25 d:** a «กิจกรรม» settings page (list · add · rename · archive). The existing coach-program ticks then offer the new activity.

### 3. A mixed 1st Trial (e.g. Surfskate & Inline Skate)
| | **a: a mixed activity created as an ordinary one** | **b: one trial carrying 2 activities** |
|---|---|---|
| What it is | an activity named «Surfskate & Inline Skate», price group bike-skate (the same price as either) | a second activity column on the booking, plus a picker for 2 |
| Size | **≈ 0 extra** once §2 exists. Until then, we add it by data on her list: a few minutes each, as a DATA REQUEST to the owner on uat. | ≈ 2.5–3 d, medium risk: the booking, coach eligibility (the coach must teach both), LINE texts, the revenue category, every activity report |
| Dashboards / stats | «1st Trial by activity» shows the mixed name as its own slice. Conversion is unaffected: the course she sells afterwards is one activity, and coach conversion counts trials, not activities. | Each activity report must split or double-count one trial: a decision for every report, and a new rule. |
| Coach | the coach is ticked for the mixed activity, like any program | new rule: the coach must teach both |

**Recommendation: a.** It is what she does today in words (the remark), made a real activity, and it needs no new rule. b costs ≈ 3 d and makes every activity number ambiguous.

### 4. Asked before? No
CUSTOMER-ANSWERS 2026-11-13 00:36 is the first time. There is no earlier ask and no decision in DECISIONS-REQ-120-build, the REQs, or the knowledge files. The nearest is REQ-121 (owner 10-15: *"ไม่เอา ให้เขาไปใส่เองสิ"*, about coach programs), which shows the owner's wish that she self-serve.

**Customer self-serve today:** none for creating an activity. Until §2 is built, she sends us the names (e.g. «Surfskate & Inline Skate», «Inline & Freeskate»), and we add them by a data change on uat, which is the owner's.

**Correction (Sector, 2026-11-13, later the same day):** §3 implied the mixed activities don't exist yet.
- **On uat, most do:** «Private SURFSKATE & INLINESKATE», «Private SURFSKATE & FREESKATE», «Private SURFSKATE & SKATEBOARD», «Private SURFSKATE & BIKE», «Private INLINE SKATE & BIKE», «Private BIKE & SCOOTER» (all bike-skate). Only «Inline & Freeskate» is missing.
- See REQUEST …activities-and-prices-backoffice § Answer §0 and §5. FAILURES F-070.
