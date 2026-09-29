# TASK-562 — REQ-110 item 5: change the teacher for ONE session — BE, S/M

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-29) · **Size S/M.** Khwan, REQ-110 item 5. **Sixth of the round.**

## §0 What Khwan is describing
**"ครั้งที่ 3 ครู A ไปแทนครู B"** — **one session covered by someone else.** **Today Move session, Swap and Add teacher all apply to EVERY remaining session from the one you pressed.**
**The owner's rulings, both in:**
- **The cover is paid at the COVERING teacher's (A's) rate.**
- ⭐ **The coach who GAINS a class is told by LINE.** 🔑 **That also settled the question I raised days ago — gaining coaches are told, everywhere.** ⇒ **This item now CLOSES that gap instead of creating it.**

## §1 What the work actually is
🔑 **The data model already supports it: the teacher is per-ROW** (`bookings.teacherId`, plus `bookingTeachers`). 🚫 **No migration is needed for the teacher change itself** — ⚠️ **if you find one is, STOP and tell me, because that would mean I sized this wrong.**
⇒ **"It changes the whole course" is a DECISION in the write path, not a limitation.** **The work is: a per-session path, and the three doors stopping to ask.**
- **Every one of Move session / Swap / Add teacher must ask: THIS session, or the rest?** ⚠️ **The default must not silently stay "all" — that is today's complaint.** 🔑 **If a door cannot sensibly offer both, say which and why rather than forcing it.**
- ✅ **The rate: the covering teacher's**, through the per-session override that already exists (TASK-423). 🚫 **Do not invent a second rate mechanism.**
- ⚠️ **Say what happens to the ORIGINAL teacher's row** — replaced, or kept alongside as a co-teacher? 🔑 **"A covers for B" and "A joins B" are different facts and the coach pay differs.** **Name which one this is.**

## §2 The notice — ⭐ the part that closes an old gap
**The coach who GAINS the session is told.** ⚠️ **And say whether the coach who LOSES it is told** — 🔑 *a class disappearing from your week without a word is the same silence, from the other side.* **If the owner has not ruled that half, ASK rather than choose.**
📋 **The wording is a DRAFT into `COPY-REVIEW-2026-09-29.md`, both languages, pinned by shape. Send it early; 🚫 do not hold code for it.**
⚠️ **Check it against TASK-561's block:** 🔑 **covering with a teacher who is on leave that day must be refused by the gate you just built** — *if it is not, the gate has a hole and that is a finding.*

## §3 Not in scope
🚫 The FE half · 🚫 changing what Move/Swap do for the whole course · 🚫 Palm's items.

## Definition of Done
- [ ] One session's teacher changeable, **all three doors asking this-or-the-rest, 🚫 no silent "all"** · **no migration (or STOPPED and reported)** · the rate = the covering teacher's **through the existing override** · **replaced-vs-co-teacher named** · ⭐ the gaining coach told; **the losing coach's half answered or ASKED** · 📋 draft copy filed early · ✅ **the TASK-561 leave block proven to apply here** · suite **count** normally **and DB-unreachable** · tsc · `N .sql = N journal tags` · 🔑 mutations incl. **a change leaking to the remaining sessions** and **the wrong rate paid** · report + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason (2026-09-29): one session's teacher changeable; every door must NAME this-session or from-here-on (🚫 no silent "all") · a cover = A REPLACES B at A's rate through the existing override · **NO migration (63 stays)** · **3575 / 0 normally, and 3× unreachable, 0 failed queries** · tsc 0 · eight mutations bite

## §1 The three doors (ECA/Free/KOL series)
| door | this session | from here on | the fact |
|---|---|---|---|
| **Swap** (`PATCH /other-series/:key/teacher`) | **NEW `onDate`** | `fromDate` (unchanged) | **A REPLACES B**, a cover |
| **Add teacher** (`POST /other-series/:key/teachers`) | `onDate` (existed, TASK-453; **the FE never sends it**) | `fromDate` | **A JOINS B**, a co-teacher; both paid |
| **Move session** (`PATCH /bookings/:id`, the calendar) | **always one row**: it never touched another row on the backend | n/a | **A REPLACES B** on that row |
- 🔑 **No silent "all":** Swap and Add teacher now **refuse a body naming neither `onDate` nor `fromDate`** (400, and both at once is refused too). That's the validator, so no caller can default. Before, a missing date meant "every remaining session from today", which is Khwan's complaint.
- ⚠️ **"Move session changes the whole course" is NOT the backend:** `moveBooking` has only ever written the one row. **If Khwan saw every session change, it's the FE (or she used a series door).** ⇒ **for the FE half (@Fern).**

## §2 The rate: the covering teacher's, through the EXISTING override (no second mechanism)
- A cover writes **the row's own `teacher_rate_minor`** (TASK-423's per-session override), with A's rate:
  1. the rate given with the cover, else
  2. **the rate A already has in THIS series** (the latest row where A is primary or extra; `seriesRateOf`, a read of the rates the series stores), else
  3. **REFUSED** (`400 RATE_REQUIRED`, nothing written).
- 🔑 **Never B's rate by default.** That's the "wrong rate paid" mutation, and three variants of it bite.
- **Move session on a series row** follows the same rule. Its `classRateMinor` is now accepted there **only as a cover's rate**; a non-course, non-series row is still refused, as TASK-423 ruled.
- 🔴 **Found and fixed on the way:** before this, **a Move-session teacher change on an ECA row kept B's rate on the row**, so A was paid B's rate.

## §3 The notices: both halves were ALREADY told (no new ruling or wording needed)
- **Swap (either scope):**
  - the LOSING coach gets `teacher_unassigned`;
  - the GAINING coach gets `teacher_assigned`;
  - both per row, with date + time.
- **Move session:** `sendTeacherReassigned` tells both.
- **Add teacher:** the added coach gets `other_teacher_added` with **just that one date** (pinned).
- ⇒ **The gaining coach is told on every one of these doors; the losing coach too.** *The gap the owner closed, "a re-added class tells nobody", is the automatic re-plan path, not these doors.*
- 📋 **Copy:** nothing new for the notices (existing, approved). **The two new admin refusals are DRAFTS in `COPY-REVIEW-2026-09-29.md` §3–§4.** I also filed my earlier drafts there: §5 TASK-561, §6 TASK-560, §7 TASK-556.

## §4 ✅ TASK-561's block applies
- **A cover by a teacher on an advance leave that day ⇒ `409 TEACHER_ON_LEAVE`, nothing written.** Pinned by value on the swap, and a mutation skipping the gate bites.
- Add teacher (`attachAdditionalTeachers`) and Move session (`moveBooking`) go through the same `assertTeacherBookable`. ⇒ **no hole.**

## §5 Stated, not changed (your calls)
1. **The FROM-DATE swap still keeps B's rate on every row A takes over:** the same wrong-rate shape, outside this task (§3: "not changing what Swap does for the whole course").
2. **Remove teacher** (a fourth door) still defaults to "from today" when no date is given.
3. **Private / course sessions:** Move session to another teacher keeps the course's default rate (B's) unless the admin sets the override (TASK-423). **Only series rows got the cover rule.**
4. **Group series share the Add-teacher validator**, so a group's Add teacher must name a scope too (consistent; the FE must send it).
5. ⚠️ **Deploy coupling:** the FE sends Add teacher / Swap with no scope when defaulting ⇒ **those calls get 400 on this backend until the FE half ships.** Same uat round (the owner: *"ขึ้น uat รอบเดียว"*).

## §6 Checks
- Suite: **3575 / 0** (3567 + 8 new in `other-series-req101.test.ts`). **DB-unreachable 3×: 3575 / 0, 0 "Failed query".** tsc 0. **63 .sql = 63 tags: no migration.**
- **Existing pins updated, 4 files, one reason:** they sent a door with NO scope, the exact silent "all" this task removes. Now they name one, and **a bare body is pinned as REFUSED**. Plus one `moveBooking` source line.
- **Break-and-watch** (BASELINE 45, CHECKSUM identical, every restore byte-identical):
  - **L1, a change LEAKING to the remaining sessions:** **BITES** (3).
  - **W1, the WRONG RATE, B's kept:** **BITES**.
  - **W2, A's rate looked up for B:** BITES.
  - **W3, no rate ⇒ silently nothing:** BITES.
  - **S1, the silent "all" accepted again:** BITES.
  - **M1, Move session keeps B's rate:** BITES.
  - **G1, TASK-561's gate skipped on a cover:** BITES.
  - **C1, the cover ADDS A instead of replacing B:** BITES.
- ⚠️ **Honest limit:** Move session's cover is pinned **by source** (with the rate lookup by value). `moveBooking` isn't driven end to end (its fake would be large).

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-29)
Verified by me: **3575 / 0** (and 3× unreachable, 0 failed queries) · tsc 0 · **63 .sql, NO migration** (counted myself — **as sized; the teacher was already per-row**).

## ✅ The distinction I asked him to name, named — and then enforced
**Swap + `onDate` = a COVER: A REPLACES B on that row only. Add teacher + `onDate` = A JOINS B: co-teacher, both paid.**
🔑 **Two different facts, two different doors, and the pay follows the fact** — *which is exactly why I asked rather than letting one door mean both.*
✅ **And the enforcement is the right shape: both doors REFUSE a body that names neither scope, at the validator.** 🔑 **The default is a refusal, not a guess** — *"no silent all" as a rule the code cannot forget, rather than a default someone will change back.*

## 🔴 The finding worth more than the feature
**Move session on an ECA row USED TO KEEP B's RATE.** ⇒ **A covered the class and B's rate was paid.** ✅ **Fixed for series rows.**
🔑 **That is money, it was live, and nobody asked for it to be looked at** — *it surfaced because the task made him ask "whose rate?" at every door instead of only the new one.*
⚠️ **And its sibling is still open, stated not changed: the FROM-DATE swap still keeps B's rate on EVERY row.** 🔴 **Same defect, bigger blast radius.** ⇒ **Raised to @Porter; not folded in.**

## ✅ The notice question answered itself, and that is the best kind of answer
**Both halves were ALREADY told** — `teacher_unassigned` / `teacher_assigned`, and `other_teacher_added` with the one date. ⇒ 🚫 **No new notice, no new wording.**
📌 **So the "losing coach" half I told him to answer or ask needed neither: the system was already doing the right thing.** ✅ **Drafts for the two refusals filed in `COPY-REVIEW-2026-09-29.md` §3–§7, with his TASK-561/560/556 drafts — early, and code not held.**
✅ **TASK-561's block applies to a cover** (409, nothing written, the skip mutation bites) — **the gate has no hole here.**

## 🔑 Move session: the complaint is NOT ours to fix in the backend
**Move session was ALREADY one row on the backend — it never touched others.** ⇒ **Khwan's "it changes the whole course" for Move is the FE, or a series door.** 📌 **Carried into @Fern's half, TASK-564.**

## 🔴 Deploy coupling — the line that matters operationally
**The FE MUST send a scope or those calls get 400.** ⇒ 🚫 **The backend must NOT be deployed without the FE half.** 📌 **Flagged to @Porter in those words.**
⚠️ **Also stated, not changed:** Remove teacher still defaults to "from today" · course sessions keep the course default · **group Add teacher now needs a scope too.**
