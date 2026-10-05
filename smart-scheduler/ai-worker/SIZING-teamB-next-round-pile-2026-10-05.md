# SIZING — Team B's pile for the next round (six items) — @Silver, 2026-10-05
**This file only sizes the work.** 🚫 No TASK numbers, no claims, nothing cut. Every fact was read in code or the record today. **CERTAIN** and **INFERRED** are marked.

## 🔴 First, two corrections to what the pile assumes
1. **REQ-101 and REQ-102 are NOT waiting on the owner. Both were ruled, built, passed on `sid` and shipped to uat on 2026-09-23.**
   - **CERTAIN:**
     - the rulings are in REQ-101 §4–§7 and REQ-102 §4–§8;
     - Tanya: *"✅ REQ-101 (ECA Manage plan) + REQ-102 (money mask/leak) PASS on sid"* (`log/2026-09-22.md:3,7`);
     - TASK-426…435 are ✅ DONE (`archive/board-closed.md:565-574`);
     - the keys 57/58/59 are on uat (`log/2026-09-24.md:167`).
   - The only stale part is the files' **header line**, which still says `Status: DISCUSSION`. That is how they look unruled. The header is Porter's to correct (REQ files are not mine to edit).
2. **TASK-637 is already dispatched to @Fern (Team A)** (`board.md:233`, queued after the batch), and the split says Team A keeps "our tooling". **Who owns it is Porter's call;** I size it below either way.

## The table
| # | Item | Side | Size | Needs before a line is written |
|---|---|---|---|---|
| 1 | **TASK-624**: swap ANY teacher on an ECA series | FE | **S**, plus a related **S** gap (1b) | the `partials/OtherSeries/*` claim · title wording · a rate ruling (1b) |
| 2 | **REQ-101** (ECA) | — | **0**, shipped 09-23 | tracking fix only · 2 small owner questions |
| 3 | **REQ-102** (money visibility) | — | **0**, shipped 09-23 | one uat read (which role holds key 57) |
| 4 | **9 uat LINE accounts, no menu** | diagnosis only | **S** (owner runs the reads) | a DATA REQUEST |
| 5a | A COMPLETED (and EXPIRED) course's plan says "was cancelled" | FE | **XS** | wording approval |
| 5b | The grid legend has no NO-SHOW entry | FE | **XS** | none (the label already exists) |
| 6 | **TASK-637**: front mutation sets carry their own test list | tooling | **XS** (runner) / **S** (with a meta-test) | the ownership question |

---

## 1. TASK-624: swap any teacher, not only the primary · **FE S**
**CERTAIN:**
- **The back end already does it** (TASK-629, done but inert). `PATCH /other-series/:key/teacher` takes `{ from, to, fromDate | onDate, rateMinor? }`. It finds where `from` sits on the row, primary or extra (`other-series.service.ts:281`, `:293`), and handles both.
- **The screen cannot reach it:**
  - the only Swap button sits beside the primary (`OtherSeriesModal.tsx:111-114`), and extras get only Remove (`:120-122`);
  - the dialog always sends the primary as `from` (`OtherSeriesDialogs.tsx:157`, `swapBody(seriesRef, series.teacherId, to)`);
  - the title, the outcome line and the success message also hard-code the primary (`:167`, `:226`, `:159`).
- **FE change:**
  - a Swap button on each extra, carrying its teacher id;
  - the dialog uses that id instead of `series.teacherId` (3 sites).
  - About 30–60 lines plus 2 DOM tests, and a pin that the primary swap is unchanged. **No back-end change.**
- **Files:** `partials/OtherSeries/OtherSeriesModal.tsx`, `OtherSeriesDialogs.tsx`, maybe `lib/scheduler/other-series.ts`, plus the dictionary keys for the title. ⚠️ **`OtherSeries/*` is not Team B's yet.** Porter claims it.

**1b. 🔴 A gap the swap inherits, found while sizing (CERTAIN):**
- Since TASK-625, a **"from here on"** swap to a teacher the series has never paid is **refused with `RATE_REQUIRED`** (`other-series.service.ts:303`).
- But the Other-series dialog shows the rate box **only for a one-session cover** (`coverRateRequired`, `lib/scheduler/series-scope.ts:67`). Its comment still says the server "writes no rate at all" over the rest of the series, **which has not been true since TASK-625.**
- ⇒ The admin is refused **and has no field to answer with.** That is true for primary swaps today. TASK-624 makes it more common.
- **TASK-634 already fixed exactly this for the GROUP swap dialog** (an optional rate field). The Other-series dialog never got the same fix.
- **FE S** to mirror TASK-634.

## 2. REQ-101 (ECA) · **0: shipped**
**CERTAIN, every ask exists:**
- the Manage-plan **modal** (`OtherSeriesModal.tsx`, per the §6 re-spec);
- add / remove / add dates / header edit (`other-series.service.ts:202`, `:244`, `:374`, `:403`);
- **confirm all** (`:145`);
- **cancel-all** behind its own key, with the family notice (`:173`, `:196`);
- teacher notices on add / remove / swap (`:220`, `:253`, `:348-349`).

**Only one thing was never built, and that was by ruling:** a notice on a date/time **move** (§5-B parked it as a separate small task, BE S, INFERRED).

## 3. REQ-102 (money visibility) · **0: shipped**
**CERTAIN:**
- key **57** `action:teachers.budget-view` masks the four freelance-ceiling figures and closes the `GET /teachers` leak (TASK-426/427);
- key **59** `action:bookings.coach-rate`, see equals edit, independent of 57 (TASK-431/432/434).

**How TASK-607 relates:** it is **separate** (its source is REQ-111 §6.6), but it **reuses** REQ-102's rule (`canSeeBudget`): the drawn/refunded rows *are* the ceiling ledger.
- ⚠️ **Nuance on the deploy step:** the code is fail-closed (nobody holds 57 by default). But **the owner granted 57/58/59 on sid and uat after the 09-22/23 deploys** (`log/2026-09-22.md:179,286`).
- **Which uat role holds 57 is not recorded.** ⇒ A read of the uat Roles screen settles whether the TASK-607 grant is even still needed.

## 4. The 9 uat accounts with no menu link · **diagnosis S**
**CERTAIN, why the count looks wrong:**
- **"unlinked" is ambiguous by construction.** `getUserRichMenuId` returns `null` on **any** non-OK response (`lib/line-rich-menu.ts:639-646`). So "no per-user link", "unknown user", "blocked", 403 and 429 all read the same.
- **The apply's "246 re-linked, 0 failed" counts ACCEPTED link calls, not links that stuck** (`scripts/line-relink-menus.ts:53-67`). There is no read-back.
- **Nothing handles unfollow events** (no `unfollow` anywhere in `src`), so the DB never learns that a family has left the OA.

**INFERRED, the likeliest cause:** LINE accepts the link for an id that is no longer a follower (they blocked or unfollowed), and then the per-user read returns nothing. The odd phone formats among the 9 (e.g. `85255304329`) hint at old or imported rows.

**The diagnosis, read only, one row per id. All of it is a DATA REQUEST for the owner on uat:**
1. **SQL (SELECT only):** where each id comes from (`parents` / `family_line_links` / `teachers` / the admin list in `app_settings`), with suspended/archived and created dates.
2. **LINE GET calls, recording the HTTP status:**
   - `GET /v2/bot/profile/{userId}` (200 means still a follower; 404 means not a friend, blocked, or unknown);
   - `GET /v2/bot/user/{userId}/richmenu` (a 404 "no link", or something else).
   - Plus one known-good `ok` account as a control.
3. **How to read it:** profile 404 ⇒ not a follower, and the "0 failed" was harmless. Profile 200 plus no link right after a 2xx ⇒ a real failure, and then a fix gets sized.

📌 **A cheap follow-up worth naming, not proposing now:** make the read distinguish 404 from failure, so the next sweep says which kind of "unlinked" it found (BE XS).

## 5a. A completed course's plan says "This course was cancelled…" · **FE XS** · ⚠️ pre-existing
**CERTAIN:**
- `course.endedNoWrites` (EN `dictionaries.ts:1257`, TH `:3220`) shows whenever the course is "ended": not writable and not paused (`PlanModal.tsx:270-273`).
- Writable means **only** `ACTIVE` (`course-lifecycle.ts:43`).
- ⇒ **COMPLETED (used ≥ size) and EXPIRED both hit "was cancelled".** The string dates from `3f19d60` (2026-08-25), long before this round.

**Draft wording (TH + EN; the owner approves before anything ships):**

| Status | TH | EN |
|---|---|---|
| COMPLETED | **คอร์สนี้เรียนครบแล้ว จึงเพิ่มหรือแก้คาบไม่ได้** | **This course is complete, so sessions can no longer be added or changed.** |
| EXPIRED | **คอร์สนี้หมดอายุแล้ว จึงเพิ่มหรือแก้คาบไม่ได้** | **This course has expired, so sessions can no longer be added or changed.** |
| cancelled / ended early | *unchanged* (today's sentence is true there) | *unchanged* |

- ⚠️ **One fact for the owner on EXPIRED:** an admin **can** move an expiry date (`updateCourseExpiry`). So "can no longer" holds only until the expiry is extended. Should the EXPIRED line say so? *My proposal: no.* Keep it to the fact, because the expiry editor is where an admin who wants to extend already goes.

## 5b. The legend has no NO-SHOW entry · **FE XS · NO new wording**
**CERTAIN:**
- `STATUS_LEGEND` (`Calendar/Calendar.config.ts:5-12`) lists 6 statuses. NO_SHOW was never one of them.
- Red (`danger`) is shared by NO_SHOW, PENDING_RESCHEDULE and CANCELLED, and only PENDING_RESCHEDULE is in the legend.
- **The labels already exist and are approved:** `bookingStatus` NO_SHOW = *"ไม่มาเรียน / No-show"*. ⇒ Adding it is one entry and reuses existing copy.
- 📌 **No current code writes NO_SHOW** (the day-end job auto-attends). Red NO_SHOW cells are **historical** (e.g. 15 sessions on 2026-08-23).
- **One small owner question:** also add **CANCELLED**? Its cells appear in red when the grid's "include cancelled" option is on, and its label also exists. *My proposal: yes, same cost.*

## 6. TASK-637: front mutation sets carry their own test list · **XS (runner) / S (with a meta-test)**
**CERTAIN:**
- The back runner accepts `{ tests, mutations }` and refuses a set with no list anywhere (`back scripts/mutation/run.ts:84-92`).
- The front runner reads **only a bare array** (`front scripts/mutation/run.ts:66`) and takes the list only from `--tests` (`:60`).
- **The port is ~8–10 lines at `run.ts:60-66`**, plus the README and folding in Fern's parked `task-634.json.pending-637`.
- **Optional meta-test** (the back end's `mutation-sets-task627.test.ts` has no front equivalent), about 60 lines.
  - ⚠️ It must **exempt the ~27 older front sets** that have no list, because TASK-637 forbids inventing lists for old sets.

---

## Proposed ORDER (if Porter gives Team B all of it)
1. **5b legend**: XS, no wording, done today.
2. **6 TASK-637 port** (if it stays Team B's): XS. Every later front review depends on it.
3. **1 + 1b TASK-624 with the rate field**: S + S, one FE pass through the same dialog. 🔑 **Ship them together:** a Swap on every teacher that then refuses with no field to answer would be TASK-644's lesson again.
4. **5a completed/expired sentence**: XS, once the wording is approved.
5. **4 the 9 accounts**: whenever the owner runs the reads. No build until the result is in.
- 2 and 3 need no build.

## Every OWNER decision, in one place
1. **5a wording:** approve the COMPLETED and EXPIRED sentences above (and should EXPIRED mention extending? I propose no).
2. **5b:** add CANCELLED to the legend too? (I propose yes; no new words.)
3. **1 TASK-624:** the swap dialog title, now that it is not always the primary. A draft comes with the TASK.
4. **1b:** a **"from here on"** swap to a never-paid teacher asks for a rate, the same answer he already ruled for the GROUP swap (TASK-634). Confirm it carries over.
5. **2 REQ-101:** does he want the parked "notify on a date/time move" now? And has Khwan been told REQ-101/102 shipped on 09-23?
6. **3 + 4, data requests on uat:**
   - (a) which role holds key 57 (the Roles screen);
   - (b) the read-only diagnosis of the 9 accounts (SQL + LINE GETs above).

**Porter's own calls:**
- the `partials/OtherSeries/*` claim (item 1);
- who owns TASK-637 (dispatched to Fern);
- correcting the REQ-101/102 header status lines.

---

## ADDENDUM 2026-10-06: REQ-101's released item "tell the parent when an ECA session's DATE or TIME is moved"
**Porter: check what already fires before sizing.** CERTAIN, from the code:
- **The notice already exists and the ECA path already rides it.**
  - `moveBooking` (`scheduler.service.ts:4223`), which serves `PATCH /bookings/:id` (`routes/api.ts:349`), ends in `announceMove(tx, id, current)` (`:4292`).
  - That is **TASK-516** (owner: "ย้ายคาบแจ้งทั้งคู่"): on a REAL move (date or start time changed), of a CONFIRMED or EXTENDED class, it tells **every coach of the class** (`class_moved_teacher`) and **the family** (`class_moved_parent`, via `familyAccountsOfRow`).
  - `moveBooking` has **no OTHER/ECA exclusion**; it even handles ECA series rows itself (TASK-562, `:4258-4268`).
  - The ECA screen moves a session through the same door (`BookingModal.tsx` `MoveBookingForm` → `useMoveBooking` → `PATCH /bookings/:id`).
- ⇒ **Coaches are told today. A family is told today whenever the ECA row NAMES a student.**
- 🔑 **What decides "the parent is told" for ECA is DATA, not code:**
  - an ECA row is usually a class title plus a head count, with **no student** (e.g. `otherTitle "ABC / Balance Camp"`, `otherKind "ECA"`);
  - then `familyAccountsOfRow` finds no household, and there is **no parent on record to tell.**
- **Size: 0 code.** Nothing new to build, and no new wording (the `class_moved_*` notices are shipped copy).
- **The one thing the owner may mean, and only he can say:** if he expects ECA *families* to hear about moves, those children would first have to be **on the ECA rows as students**. That is a change to how ECA is booked, not a notice.
  - ▶️ **Question for him:** "ECA moves already notify the coaches, and any family whose child is on the row. Do your ECA classes carry the children's names, or should we treat 'coaches are told' as done?"
