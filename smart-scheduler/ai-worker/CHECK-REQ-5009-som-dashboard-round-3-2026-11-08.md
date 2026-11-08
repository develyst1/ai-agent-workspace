# CHECK: REQ-5009 — SOM Dashboard round 3: items 1–4
**Silver (SA-B), 2026-11-08.** Read only.
- **Code read:** `smart-scheduler-back` and `smart-scheduler-front`, `dong` working tree.
- **Data read:** uat, through `scripts/uat-select.mjs` only (host printed .29 = uat every time). Counts and ids only, no names and no addresses. Queries are logged in today's log.
- **Item 5** waits for the owner's call with her. It is not in this file.

## 1. Order, colours, renames: screen-only ✅
- Every label she names is a front string: `smart-scheduler-front/src/lib/i18n/dictionaries.ts:1871` `newCourseThisMonth: "New Course this month"`, `:1875` `notRenewed`, and the other cards beside them.
- Card order and colour are set in the SOM partials (`src/components/partials/Som/`).
- The back sends counts under fixed keys, with no labels and no order. **No back-end or API change** for item 1.

## 2. Coach Capacity: ECA + Camp hours, and the new numbers. **Back only, ≈ 0.5 d**
**Today** (`smart-scheduler-back/src/lib/som-contract.ts`):
- `:588–591` sets the capacity constants: FT weekday 5 h, weekend 6 h (FT and PT share one constant), PT weekday 0, FL 0.
- A PT coach's own `teachers.weekend_capacity_hours` overrides the PT weekend rate (`:650`).
- `:639`: the booked hours count lessons + the GROUP row only. **ECA and Camp are explicitly left out** ("never ECA / camp", comment `:636`).

**On uat:**
- **Where ECA and Camp live:** both are `bookings` rows with `booking_type = 'OTHER'`.
  - ECA = `other_kind = 'ECA'`.
  - Camp = `other_kind = 'CAMP'` (the derived camp hours, `camp_week_day_id` set).
  - Since 1 Oct, not cancelled: ECA 52 rows / 52 h, Camp 45 rows / 45 h, and 15 OTHER rows with no kind.
  - Every row has a teacher and both times, so they can be counted in clock hours like the lessons are.
- **Coaches:** active, not archived: FT 6, PT 6, FL 11. **One PT coach already has his own weekend rate = 4**.
  - *Inferred:* that is Karn ("Karn 4 hr"). It stays 4 with no code change. Confirm by the coach's row on the screen.

**The change:**
1. **The constants:**
   - FT weekday **4**;
   - FT weekend **5**;
   - PT weekend default **5** (Karn's own 4 stays);
   - PT weekday 0 (her "PT ที่มารับ FL วันธรรมดา ไม่ต้องคำนวณ", unchanged);
   - FL 0.
   - Split the shared weekend constant into FT and PT, so the two can differ later.
2. **The booked hours:** count `OTHER` rows whose `otherKind` is `ECA` or `CAMP`, plus any extra coach on `booking_teachers`, as today. They're counted in clock minutes, weekday or weekend by date, with the same not-cancelled and badge rules.
   - `SomBooking` gains `otherKind` (the service mapper next to `som-contract.service.ts:53`).
   - **FREE / KOL / no-kind OTHER rows stay out.** She named ECA and CAMP only. *(SA decision; reversible)*
3. **Tests:** the TASK-742 capacity tests pin 5 / 6 today, so they move to 4 / 5.
   - New tests: an ECA hour and a camp hour count, and a FREE row doesn't.
   - The mutation set (`som-nvr-capacity-task742.mutations.json`) gets the new filter.

**Front:** none. The copy has no numbers (`dictionaries.ts:1910–1914`), and the shape is unchanged.
**Who and when:** Bob (BE-B), one small TASK after TASK-870, riding the same SB sid deploy. *Say go and I'll cut it.*

## 3. "based on 166 of 202 students · not specified 36": where it comes from
**The rule in code:**
- **Who is counted:** `som-contract.ts:316` (attended) and `:320` (people). The people in every demographics card (gender, nationality, age, address) are the **distinct children with at least one ATTENDED lesson in the chosen period**:
  - the 4 lesson types: 1st Trial, 1 HR, course, voucher;
  - badge-filtered;
  - a DUO row counts both children.
- **The coverage line:** each card shows **its own** coverage, "based on {known} of {total} students" (front `dictionaries.ts:1824`, `DemographicsSection.tsx:227`). Here `known` = children with that field filled, and `not specified` = the children whose field is blank.

**On uat, November so far** (1–8 Nov, all badges; query run 2026-11-08):

| period | children who attended | gender filled | nationality filled |
|---|---|---|---|
| 2026-11 | **203** | 167 | **166** |
| 2026-10 | 377 | 281 | 282 |
| all data | 540 | 382 | 385 |

- Her "166 of 202 · not specified 36" = the **November** card, nationality filled 166 of 202. *Inferred:* one more child attended after her screenshot, so it's 203 now. Settled by a re-read of the screen today.
- **Why it matches neither of her numbers:**
  - **Not "all registered students":** it counts only children who **came to class this month**. Children who didn't come this month aren't in it.
  - **Not Total Customer:** that card counts children **holding an active course or voucher**, whether or not they came this month. This card instead includes 1st Trial and 1 HR children (who hold nothing), and leaves out holders who didn't come.
  - The **36** are children in that group whose gender or nationality was never filled in. **Staff can fill them on each child's profile**, and the number drops with no code.
- **If they want the base to be Total Customer instead:** that's a choice of meaning, so it's a question for her, with this default.
  - Default: keep "children who attended in the period". It's what the card has been since REQ-013, and it moves with the month picker.
  - Switching = one people-set change in the back, **≈ 0.5 d**, and every demographics card follows.

## 4. Address: the typed-in sub-parts
**What she's seeing:**
- The **Province** view groups on `parents.province`.
- Today the form only accepts one of the 77 provinces (`smart-scheduler-back/src/lib/thai-provinces.ts`, `PROVINCE_UNKNOWN` refusal).
- **On uat, 3 active parents** still hold an older free-typed value there (a whole address line), so each shows as its own "province" row.
  - None of the 3 has a district code either.
  - Of the 494 active parents: 395 hold one of the 77, 96 hold none, 209 hold a district code.

| parent id | children |
|---|---|
| `5fbfe507-a1d3-4cde-8809-2d859dd7b868` | 1 |
| `a4accdcb-45c4-4713-9961-692c5abeb5a0` | 2 |
| `d9d5b64c-e989-4924-82d2-cf520ce20900` | 3 |

**What "เอาออก" can mean:**
- **A. Staff fix the 3 parents** (recommended, **no code**). Open each parent and pick the province, plus the district and sub-district if known. Saving forces one of the 77. The 3 odd rows disappear on the next load, and the children land in the right province.
- **B. Hide them in the report** (≈ 0.25 d back). A province that isn't one of the 77 counts as "not specified" instead of its own row. The data is untouched, but those children then sit in "not specified" until A is done anyway.
- **C. Our team cleans the data:** a write on her system, so a DATA REQUEST to the owner. Not needed, since A is 3 records.

New free text can't arrive any more (the 77-only refusal), so A alone is enough. B is only a guard.

## Summary for Porter
| # | owner | size | next |
|---|---|---|---|
| 1 | screen (front strings + SOM partials) | — | Palm / the owner, as Porter said |
| 2 | Bob (BE-B) | ≈ 0.5 d | Porter's go ⇒ I cut the TASK; rides the SB deploy after TASK-870 |
| 3 | explained above | 0 (or ≈ 0.5 d if she wants the Total Customer base) | Porter: the explanation to her; staff can fill the 36 |
| 4 | staff, 3 parents (A) | 0 | Porter: ids above to the admins; B only if she asks |

## 5. Activity / Program: real counts for the sample table (Silver, 2026-11-08, uat via `scripts/uat-select.mjs`, host .29)
**Who is counted:**
- **Total Customer:** children holding an **active course** or an **active voucher** today (8 Nov).
- **Plus 1 HR (last 3 months):** children with a non-cancelled 1 HR dated 1 Sep–30 Nov who never opened a course.
- Archived children are out. Counts are **distinct children**; no names.

**How my SQL reads "active".** It is the dashboard's rule, re-written in SQL, so it's close but not the same code:
- **Active course:** not ended, not paused, sessions left, not expired, and a class booked after today.
- **Active voucher:** not ended, not expired, hours left.
- Its Total Customer = **227**. *Inferred:* it should match the screen's Total Customer today within a few. A look at the screen settles it.
- 1 HR-only children = **85**, so **312** children in all.

**Activity:**
- The program name exactly as her screens show it (`subjects.name`).
- A course has one program.
- **A voucher has no program of its own.** Its program = the programs of its booked classes, so a voucher used for 2 programs counts in both.
- A voucher with no class booked yet shows as "(no class booked yet)".

| activity | Course 4 | Course 6 | Course 10 | Voucher 5 h | Voucher 10 h | Voucher 15 h | 1 HR (last 3 months) |
|---|---|---|---|---|---|---|---|
| Private SURFSKATE | 6 | 11 | **61** | 2 | 6 | 15 | 15 |
| Private INLINE SKATE | 6 | 9 | 26 | – | 6 | 13 | 24 |
| Private BIKE | 10 | 4 | 9 | – | 9 | 9 | **35** |
| Private SKATEBOARD | 1 | 2 | 13 | – | 1 | 1 | 11 |
| Private SURFSKATE & INLINESKATE | – | 2 | 6 | – | 1 | – | – |
| Private BALANCE BIKE | – | 1 | 2 | 1 | – | 1 | 6 |
| Balance Play (Private) | – | 2 | 3 | – | – | – | 4 |
| Private BABY SKATE | – | – | 2 | – | – | 1 | 1 |
| Duo INLINE SKATE | – | – | 2 | – | – | – | – |
| Private ONEWHEEL E-SKATE | – | – | 1 | – | – | – | 2 |
| Balance Play (Group) | – | 1 | 1 | – | – | – | – |
| Private SURFSKATE & BIKE | – | – | 1 | – | – | – | 1 |
| Private SURFSKATE & SKATEBOARD | – | – | 1 | – | – | – | – |
| Private CRUISER | – | – | 1 | – | – | – | – |
| Private SCOOTER | 1 | – | – | – | – | – | – |
| Private BIKE & SCOOTER | – | – | – | – | – | – | 1 |
| (no class booked yet) | – | – | – | – | – | 3 | – |

**Two or more activities:**
- **Yes, a child is counted once in each activity row he holds.** **27 of the 312** children are in 2+ rows: two courses in different programs, a course + a voucher, or a voucher used across programs.
- So the rows add up to more than 312. **A "Total" column must count distinct children, not sum the rows.** This is the choice to show ขวัญ.
- Package is per entitlement too: a child with a Course 10 and a Voucher 15 h is in both columns.
- **Voucher hour sizes seen:** 5 / 10 / 15 h. **Course sizes:** 4 / 6 / 10. No "other" course size exists today.

### §5 reconciliation with Tanya's gate (TEST-146), Silver, 2026-11-08 (uat, host .29; one query)
**(a) The card's 96 vs my 85.** My query reproduces the card's rule exactly: **96** = children with a non-cancelled 1 HR from 1 Sep to 30 Nov and no live course. The 11 between them are:
- **2 archived children.** The 1 HR card counts them, but Total Customer and my base leave archived children out.
- **9 children who also hold an active voucher.** A voucher doesn't take a child off the 1 HR card (`SINGLE_SESSION_MOVES_OUT_ON_VOUCHER = false`), but they're already in the 227 Total Customer. So my "1 HR-only" count left them out to avoid counting them twice.
- None of the 11 has only a cancelled course.
- So 96 − 2 − 9 = **85**, and 227 + 85 = 312 distinct children.

**(b) Why the 1 HR column sums to 100.** The column counts **every non-archived child with a 1 HR in that activity: 94 children.** That includes the 9 voucher holders who are also in Total Customer, so the column isn't limited to the 85.
- **6** of the 94 took 1 HR in 2 activities, so the column sums to 94 + 6 = **100**.
- If the sample's 1 HR column should match the card, label it "every child who took a 1 HR in the last 3 months (a child may also hold a voucher)".
