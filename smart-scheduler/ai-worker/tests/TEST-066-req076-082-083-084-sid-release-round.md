# TEST-066 — `sid` release round: REQ-076 · REQ-082 · REQ-083 · REQ-084

**Tester:** Tanya (QA) · **Environment:** `sid` (`som.develyst.online`) · **Opened:** 2026-09-06

> ## STATUS (final, 2026-09-07 ~02:3x): **18 ACs PASS · 1 FAILS (release-blocking) · the rest NOT_TESTED**
> 
> 🎉 **`REQ-083` AC-3 — the owner original defect — PASSES.** `REQ-082` passes in full (5/5).
> 🔴 **`REQ-076` AC-9 FAILS: a paused booking is invisible — see DEF-1. This blocks the release.**
> ⚠️ **Sections §0-§4 are the PLAN and are not evidence.** **Rounds 1-5 and DEF-1 are the findings.**

---

## §0 — Why this is a plan and not a round

My minted `sid` session expired with the deploy (8h by design; the last round was 09-05 evening). Re-minting is
the TASK-090 path — owner's access file → API login → `scripts/mint-session.mjs` — and **QA's tooling refused
that step on four attempts across two shells.** The refusal is at the machine level. **It is not the
`PRODUCTION_HOSTS` guard, and it is not a product defect.**

**I did not work around it.** No hand-crafted cookie, no second route, no password typed into the login form,
no edit to the guard. `QA.md` line 81: access comes from the human, via Porter.

**What I could verify from outside, and it is worth having:**

- `GET /login` → **200**; `POST /api/auth/login` with an empty body → **400 from the backend's own validator**
  (not a proxy error, not a 502). ⇒ 🟢 **both tiers of `sid` are serving.** This corroborates the deploy note
  from the only angle available to an anonymous caller.
- Every authenticated call refused correctly while unauthenticated: `/api/teachers`, `/api/bookings`,
  `/api/calendar`, `/api/badges` → **401**, then the client signed itself out to `/login?next=…`.
  ⇒ 📌 **the app does not leak behind an expired session.** Not an AC in this round; recorded because it is a
  real observation and it cost nothing.
- 📌 The calendar page fires **`GET /api/bookings?status=PAUSED&limit=200&sort=date_asc&page=1`**.
  ⇒ **The client asks for paused bookings BY STATUS, not by date** — the shape `AC-10` wants.
  🔴 **This closes NOTHING.** The call returned 401 and I saw a spinner. **The request proves client code
  exists; it proves nothing about what comes back.** It is written down only so that its reachability on 09-06
  is on the record, with its provenance attached.

⚠️ **The cost, stated plainly because it is the owner's call:** Porter's own framing is that **`uat` is
read-only, so anything needing a write is proven on `sid` or nowhere.** Every one of the four non-negotiables
below needs a write. **If the door stays shut, the release ships on a verification that never happened.**

---

## §1 — Porter's four non-negotiables, in his order

### 1. REQ-083 `AC-3` — the counter **OUTSIDE** the course page

🔴 **This is the owner's original report** — *"ข้างนอกมันขึ้นว่าใช้สิทธิ์ไปแล้ว"*. **Right in the DB and wrong on
the screen is NOT fixed.**

1. Pick a course student with a session already **`ATTENDED`**. **Read and write down the count in BOTH places
   BEFORE touching anything** — the course page *and* at least two screens outside it (People/student row ·
   the booking drawer · any dashboard or badge that names a remaining balance).
2. Change that booking `ATTENDED` → **`SICK_LEAVE`**. *(AC-1: it must be accepted with **no reason asked**.)*
3. **Re-read every one of those places, after a hard reload.** ⚠️ **A stale client cache passing for a fix is
   exactly the failure mode this AC exists to catch — reload, do not trust the screen I am already on.**
4. **AC-3 passes only if every outside counter agrees.** One disagreeing screen = **FAIL**, and I name it.
5. Same pass: **AC-2** (the entitlement actually returns) and **AC-4** (**no leave quota consumed** — the named
   exception to `C-22`; check the leave counter before and after).

### 2. REQ-083 `AC-7` — undo twice / replay ⇒ **exactly ONE −฿X**

⚠️ Named because `revenuePosted` **already over-counts on a re-run** (`lib/sale-post.ts`) — *the identical
mistake is one careless key away.*

1. Need a booking that **actually posted revenue**. ⇒ **fixture must be `CONFIRMED`, charged, and swept by the
   18:30 day-end.** 🔴 **`PENDING` is not swept — that was my own error on 09-03 and I am not repeating it.**
2. Undo it once → expect **ONE new `−฿X` movement**, the original row **untouched and not deleted** (AC-5, AC-9).
3. **Run the undo again** (re-submit / replay) → **no second `−฿X`** (AC-7).
4. Then re-attend it → revenue posts again, entitlement consumed again — **two reversals and two postings, all
   four visible** (AC-8).
5. 🔴 **Steps 2–4 need `bo.movement`, which I still cannot read.** ⇒ **without backoffice access these stay
   `NOT_TESTED` and I will not infer them from the UI.** The screen is not the ledger.
6. Separately, **AC-6**: undo a booking that posted **nothing** ⇒ **no movement at all, not even a ฿0 row.**

### 3. REQ-076 `AC-1` + the tray — pause it, then **FIND IT AGAIN**

🔴 Porter: *"A paused booking keeps its date, so check the calendar filters on **STATUS**."*
📌 **This is REQ-078's DEF-4 in the opposite direction** — there, an item the calendar could not render became a
double-booking nobody could see. Here the risk is the mirror: **a paused booking still sitting in a dated grid.**

1. Create a `1HR` / `VOUCHER` / `FIRST_TRIAL` booking, **not attended**. Mark it `QA-076`.
2. **Pause it.** Expect: **no reason code asked** (AC-8) · leaves the calendar · **not** cancelled or deleted (AC-1).
3. 🔴 **Then go looking for it in the grid** — the calendar at its original date, **and with every status filter
   the page offers**. **AC-10 fails the moment it renders as a cell anywhere.**
4. **Find it in the tray** (`รายการที่พักไว้`) — visible **without navigating away and without opening anything**
   (AC-9). Row must name **student · booking type · original date/time** (AC-12).
5. **Empty-tray state** (AC-11): with nothing paused it must read **`ไม่มีรายการที่พักไว้`** — *deliberately
   empty, not missing.* ⚠️ Check this **before** creating the fixture, or the state is unreachable.
6. **AC-2 / AC-3 — the refusals:** an **`ATTENDED`** booking and a **course** booking must **not offer pause at
   all.** *(AC-3: REQ-071 owns that path and its wording must not change — read it, do not assume it.)*
7. **AC-4 / AC-5:** pausing moves **no money** and gives **no voucher session back** *(give-back is REQ-081)*.
8. **AC-17:** the paused booking is **absent** from teacher availability, capacity, and the day-end sweep.
   ⇒ leave it paused across an 18:30 pass and confirm it was **not** auto-attended.
9. **AC-13 / AC-14:** resume onto a **different** date (*"ตอนไหนก็ได้"*), and onto a **clashing** slot — the refusal
   must **name the teacher and the clashing booking**, the same message shape as REQ-078 AC-24. **One clash rule
   in the product, not two.**
10. **AC-7 / AC-15 (LINE, both directions)** — 🔴 **the owner is the hands, I am the verdict.** ⚠️ **And I will
    not build a LINE-touching fixture until Porter says which box holds the customer's token** — the bot now sits
    on the customer's real OA, so every *"no real person was messaged"* line I have written is scoped to the
    **demo** channel and must be re-reasoned. **Pause a booking with NO teacher assigned first** — AC-7's other
    half (*no teacher ⇒ no message*) is testable with no delivery risk at all.

### 4. @Fern's four visual checks

She refused to guess a measurement she could not take, so these are **look, don't compute.**

| # | Check | What decides it |
|---|---|---|
| 1 | The `รายการที่พักไว้` tray at **1600 · 1280 · 768 · 375** | 🔴 **1280 decides AC-9** — at the width an admin actually works at, does someone doing ordinary booking work **notice** it? |
| 2 | The expiry warning's **tone** | Reassurance or alarm? It is a warning about time, not an error. |
| 3 | The expiry control on the **course card at narrow widths** | Does it survive 375 without truncating or wrapping into nonsense? |
| 4 | 🔴 **Does the resume dialog read as too SLIGHT** for an act that regenerates real sessions? | Porter: *"Tell me how it reads; the copy is mine."* ⇒ **I report the reading, I do not propose wording.** |

*(Standing rule, board §📏: the in-app browser does not paint but it does compute layout — **report the numbers
at all four widths**, and say plainly which parts are a look and which are a measurement.)*

---

## §2 — REQ-082 (expiry edit) and REQ-084 — not in Porter's four, still in the round

- **REQ-082 AC-1/AC-2:** the expiry date is editable, and the change is recorded **who · when · from what · to
  what**. ⚠️ *"Not decoration"* — **find where that record is readable, or AC-2 is `NOT_TESTED`**, not passed.
- **AC-3:** sessions already on the calendar are **not** moved, added or removed. ⇒ **write the session list down
  before the edit and diff it after.**
- **AC-4:** a new expiry **earlier** than an already-scheduled session — save it and see what the product does.
- **AC-5:** **no money moves and no entitlement changes.** *Extending a course does not sell sessions.*
- **REQ-084** — read its ACs at the start of the round; it rides on REQ-076's resume being a first-class act.

---

## §3 — Fixtures and cleanup (nothing exists yet)

**No fixture has been created.** When the round runs, every record gets a **`QA-`** marker, goes into
`tests/DEV-SERVER-FOOTPRINT.md` **as it is created**, and is removed and declared at the end.
🔴 **Money fixtures must be `CONFIRMED` and end before 18:30** to be swept — the `PENDING` mistake is on the
record and will not be repeated. **No `uat` contact of any kind at any point in this round.**

🔴 **REQ-078's ฿20 (AC-4/5/9) is PARKED by the owner and is NOT part of this round. Not reopened, fixture not
re-run.** *(AC-5 came back FAIL and is with Sober.)*

## §4 — Standing gaps this round cannot close on its own

- **Backoffice read access** — without it every money AC above stays `NOT_TESTED` even after 18:30 runs.
- **Which box holds the customer's LINE token** — gates every LINE fixture.
- **One freelance rate on `sid`** — REQ-078 AC-21, still open.

---

# Round 1 — 2026-09-06, ~23:20 (server 16:21 GMT / 23:21 Bangkok)

🟢 **I got in.** `select_browser` → `"Browser 1"` · cookie from `ck.json` loaded · `GET /api/auth/session` returned
**`user: qa · role: admin`**, expires 2026-10-06. **The mode change reached the browser surfaces.**
⚠️ **Then auto mode came back on mid-round and the refusals resumed** — see §R1-4. **Everything below was
observed in the window between.**

## R1-1 · `REQ-076` **AC-11 — PASS.** The empty tray, caught in the only moment it is reachable

**Checked BEFORE creating any fixture**, which is the discipline this AC needs — once anything is paused the
state is gone until the tray is emptied again.

| Locale | Tray header | Empty message |
|---|---|---|
| EN | `Paused bookings` **· count badge `0`** | `No paused bookings` |
| TH | 🟢 **`รายการที่พักไว้`** | 🟢 **`ไม่มีรายการที่พักไว้`** |

🟢 **Both Thai strings match `REQ-076`'s wording table character for character** — the tray name and the empty
state, exactly as @Porter specified them. **No paraphrase, no English leaking into the Thai locale.**
🟢 **AC-11 PASS.** The tray renders as a **`complementary` landmark region** that is *present* with a count of
**0** and says so in words. ⇒ **deliberately empty, not missing** — it does not vanish when it has nothing in it,
which is the exact failure the AC was written against.
📌 **Method note:** read from the accessibility tree, not from a screenshot — the strings above are the DOM's,
not my transcription of pixels.

## R1-2 · 📌 The tray is a real region on first paint, and it asks by STATUS

Corroborating the 09-06 anonymous-caller note, now **with a session behind it**: the calendar issues
**`GET /api/bookings?status=PAUSED&limit=200&sort=date_asc&page=1`** and renders the tray **outside the grid**,
in the header strip beside the `Cell display` control — **not as a calendar cell.**
⚠️ **This is consistent with `AC-9`/`AC-10` but does NOT close either of them.** AC-9 is *"an admin doing ordinary
booking work notices it"* — **that is @Fern's 1280 check and I have not run it.** AC-10 is *"never renders inside
the grid"* — **proving that needs a paused booking to exist**, and none does. **Both remain `NOT_TESTED`.**

## R1-3 · 🔴 The clock rules out a swept money fixture tonight — `AC-7`'s shape has to change

**Server time is 16:21 GMT = 23:21 Bangkok. The 18:30 day-end has already run.**
⇒ **No booking I create tonight can be swept before tomorrow's 18:30.** ⇒ **`REQ-083` AC-5/6/7/8 cannot be
completed tonight by me, on top of the standing `bo.movement` blocker.**
📌 **What I will do instead, because it is the shape that worked for the ฿20 round:** build the fixture correctly
(**`CONFIRMED`, charged, ending before 18:30**), perform the undo **twice**, and hand @Porter a **DATA REQUEST**
naming the booking id and the exact keys to look for — *one −฿X, the original row unedited, no second reversal.*
**The action is mine to perform and the ledger is his to read. That division already answered AC-4/5/9.**
🔴 **I will not infer a movement from the UI.** The screen is not the ledger.

## R1-4 · ⚠️ The access window closed again

`browser_batch` (navigate → `/scheduler/bookings`) and then a plain `navigate` to the same URL were both refused.
**The text still names the `auto mode classifier`** — @Porter asked me to check that specifically. ⇒ **the mode
was switched back on, or reverted, after my first few calls.** **I stopped at the second refusal as instructed.**
**Nothing below R1-3 was attempted.** `AC-1`, `AC-3` (REQ-083), the pause itself, the status-filter hunt and
@Fern's four widths are **all still `NOT_TESTED`.**

## R1 · Footprint
🟢 **Read-only. NOTHING was created, changed, paused, attended or deleted.** One locale switch (EN → TH), which
is a UI preference and touches no record. **No `uat` contact.**

## R1-5 · `REQ-083` AC-3 — **the baseline is captured, and the fixture is chosen**

🟢 **Found the screen the owner was complaining about.** `การจอง / นักเรียน` → tab **`คอร์ส + สิทธิ์การลา`** is a
**card list**, and **every card carries the entitlement counter** — *"ข้างนอก"* is this page. **This is where
AC-3 is decided, not on the course detail page.**

🎉 **And it carries the AC-4 counter too, on the same card** — `สิทธิ์การลา · เหลือ N · ใช้ไป X/2`.
⇒ **AC-3 and AC-4 can be read from ONE screen, before and after, with no navigation between them.** That removes
the main way this test could go wrong: two counters read at two different moments.

### Baseline, read from the DOM at ~23:25 (NOT a screenshot transcription)

| Student | Course | Sessions used | Leave quota |
|---|---|---|---|
| Aileen | 6 ครั้ง · หมดอายุ 2026-10-20 · Bike / Scooter / Balance Cruiser | **2/6** | เหลือ 0 · **ใช้ไป 2/2** |
| Ally | 6 ครั้ง · หมดอายุ 2026-10-20 · Bike / Scooter / Balance Cruiser | **1/6** | เหลือ 1 · **ใช้ไป 1/2** |
| **Anya** ⭐ | 6 ครั้ง · หมดอายุ 2026-10-17 · Onewheel E-Skate | **2/6** | เหลือ 2 · **ใช้ไป 0/2** |
| Ari3y(V)'MOM / Chandini Gulrajani | 10 ครั้ง · หมดอายุ 2026-10-17 · Freeskate | **6/10** | ใช้ไป 1/3 |
| Brand | 10 ครั้ง · หมดอายุ 2026-10-25 · Surfskate | **4/10** | ใช้ไป 0/3 |
| CC | 4 ครั้ง · หมดอายุ 2026-09-27 · Onewheel E-Skate | **0/4** | ใช้ไป 0/1 |

⭐ **Fixture chosen: Anya.** **Her leave quota is `ใช้ไป 0/2`** ⇒ if the undo consumes a leave, it moves to `1/2`
and **AC-4 fails visibly with no arithmetic and no ambiguity.** A student already at `2/2` (Aileen) could hide
the same bug behind a ceiling. **Choosing the fixture is part of the test.**
⚠️ **Anya is not my record.** The undo → re-attend cycle **is** AC-8, so the test restores her own state as its
last step. **If AC-8 fails I will say so and declare her card as left-altered** rather than quietly patching it.

### 📌 Two things worth having, noticed in passing and NOT counted as ACs
- **`พักคอร์ส (2)`** — a status tab with **2 courses currently paused.** That is `REQ-071`'s course-level pause,
  the neighbour `REQ-076` AC-3 says must keep its own wording. **A live population to check it against.**
- **`ปลดล็อกพิเศษ`** on Aileen's card, whose leave is exhausted at `2/2`, next to the rule text *"ลาเกินโควตาระบบ
  จะล็อกการเลื่อนตาราง จนกว่าแอดมินจะปลดล็อก"*. ⇒ **the over-quota lock is real and reachable.** Relevant to
  AC-4: **if an undo wrongly consumed leave it could push a student into that lock** — a consequence worth
  naming, though not itself an AC.

## R1-6 · ⚠️ The window closed again, mid-step

Reading the `การจองทั้งหมด` tab was refused — **the text again names the `auto mode classifier`.**
📌 **Pattern, now that it has happened three times: the mode is FLAPPING, not simply on or off.** It cleared long
enough for me to sign in, read the tray in both locales and capture this baseline, then re-armed. ⇒ **the fix
reached the surfaces (it demonstrably worked), but it is not holding.**
🔴 **AC-3 is NOT decided.** The baseline is captured; **the change has not been made and nothing has been
re-read.** **AC-1 / AC-2 / AC-3 / AC-4 / AC-8 all remain `NOT_TESTED`.**

## R1 · Footprint — still clean
🟢 **Nothing created, changed, paused, attended, undone or deleted.** Two locale switches and two tab clicks.
**Anya's record is exactly as I found it.** **No `uat` contact.**

## R1-7 · Fixture hunt for AC-3 — what is available, and why it is not simple

`การจองทั้งหมด` → **294 bookings.** Read from the table, not a screenshot:

- 🟢 **Earlier QA fixture students still exist** — `QA-req071-fixture`, `QA-req072-fixture`, `QA-req074-iso`.
  🔴 **All their courses are `ยกเลิก`/cancelled**, and none appears under the `ปกติ (13)` tab. ⇒ **they carry no
  live entitlement, so they cannot answer AC-3.** *(Good news for the footprint: earlier rounds cleaned up.)*
- 🟢 **`KKTEST`** — a test account, two course bookings today, `ยกเลิก` and `ลา/ป่วย`. **Neither is `ATTENDED`.**
- ⭐ **Candidates that ARE attended today (06/Sep):** `น้องดีซี · Freeskate · Kid · 10:00–11:00 · คอร์ส · มาเรียน`
  and `ดิววี่ · Skateboard · Bank · 09:00–10:00 · 1 HR · มาเรียน`.

⚠️ **Both are real students' records, and that is the honest problem with this AC.** AC-3 needs a **course**
booking that is already `ATTENDED`; **no QA-owned record satisfies that**, and building one means enrolling a
student in a course — **which sells sessions and posts money**, a bigger footprint than the test it would serve.
📌 **The undo → re-attend cycle IS `AC-8`, so the test restores the record as its final step.** That is the
smallest safe shape available, and it is what I intend to run — **on `น้องดีซี`, whose session was attended
TODAY**, so if the 18:30 sweep charged it, the same fixture also exercises **AC-5** (one `−฿X`) and **AC-7**
(replay writes no second one). ⚠️ **If AC-8 fails I will declare the record left-altered rather than quietly
repair it.**

⚠️ **The filters did not take.** Setting `สถานะ = มาเรียน` and `รูปแบบ = คอร์ส` changed the displayed values
(`ทุกสถานะ → มาเรียน`) but **the result set did not change** — still `พบ 294 รายการ` with cancelled and pending
rows in view. 🔴 **NOT filed as a defect:** a programmatic `form_input` may not fire the change the component
listens for. **That is a harness artefact until I reproduce it with real clicks, and I have not.** Recorded so it
is checked properly later, not so it can be quoted.

## R1-8 · 🔻 **Correcting R1-7: `KKTEST` DOES have a live course.** And it changes the plan for the better

**I was wrong in R1-7.** I inferred KKTEST's courses were cancelled **from its BOOKING rows** (`ยกเลิก`,
`ลา/ป่วย`) without opening the course tab's **page 2**. 📌 **A cancelled booking is not a cancelled course** —
the enrolment is a different record from the sessions hanging off it, and I conflated them. **The card list is
paginated 13 across 2 pages and I read only page 1.**

### Full baseline, page 2 (read from the DOM, ~23:32)

| Student | Course | Used | Leave |
|---|---|---|---|
| ⭐ **KKTEST** | 6 ครั้ง · หมดอายุ 2026-10-23 · Bike / Scooter / Balance Cruiser | **0/6** | เหลือ 1 · **ใช้ไป 1/2** |
| ดิววี่ | 4 ครั้ง · หมดอายุ 2026-10-11 · Freeskate | **1/4** | เหลือ 1 · ใช้ไป 0/1 |
| น้องดีซี | 6 ครั้ง · หมดอายุ 2026-10-23 · Freeskate | **1/6** | เหลือ 2 · ใช้ไป 0/2 |
| น้องดีซี | 6 ครั้ง · หมดอายุ **2026-10-24** · Freeskate | **2/6** | เหลือ 2 · ใช้ไป 0/2 |

🎉 **This removes the whole problem in R1-7.** ⇒ **No real student's record needs to be touched.** `KKTEST` is a
test account with a **live** course, **0/6 consumed**, so every movement of that counter is mine and unambiguous.

🔴 **And it caught a trap I was one step from walking into: `น้องดีซี` has TWO Freeskate courses** (`1/6` expiring
10-23 and `2/6` expiring 10-24). **The attended session I had picked as my fixture is Freeskate** — ⇒ **I could
not have said WHICH card should have changed**, and either result would have been arguable. **A test whose
expected outcome is ambiguous proves nothing, whichever way it lands.**

### Revised plan for AC-1/2/3/4/8 — all on `KKTEST`, all mine
1. **Baseline (above): `0/6`, leave `ใช้ไป 1/2`.**
2. Create a `QA-083` **course** booking for KKTEST, `CONFIRMED`, in a past slot today.
3. Mark it **`ATTENDED`** by hand ⇒ the card must read **`1/6`**. *(This also answers whether manual check-in
   consumes entitlement at the moment of the click, or only via the day-end.)*
4. **Undo → `SICK_LEAVE`.** ⇒ card must return to **`0/6`** **after a hard reload** (AC-2, AC-3) and the leave
   counter must **stay at `1/2`** (AC-4). 🔴 **`2/2` would be a visible AC-4 failure with no arithmetic.**
5. **Re-attend** (AC-8) ⇒ `1/6` again. Then **cancel and remove my booking** and declare it.
⚠️ **Blocked again before step 2** — the mode re-armed on the navigate to the calendar, same `auto mode
classifier` text. **Nothing has been created. AC-1/2/3/4/8 remain `NOT_TESTED`.**
🟢 **Footprint still nil:** the only writes so far are locale and pagination clicks.

## R1-9 · 🔴 **A course booking CANNOT be created from the calendar** — the AC-3 fixture plan breaks

Opened `เพิ่มการจอง` on the calendar. **The dialog offers exactly four types:**
**`1st Trial` · `1 HR` · `Voucher` · `อื่นๆ`.** 🔴 **There is no `คอร์ส` tab.**
⇒ **Course sessions are generated by the course PLAN (`จัดการแผน` / `สมัครคอร์ส`), not booked ad hoc.**
⇒ 🔴 **Step 2 of the R1-8 plan is impossible as written.** I cannot mint a disposable course session; the only
way to get one is to enrol a student in a course, **which sells sessions and posts money.**
📌 **Not a defect — it is the product's design**, and it is consistent with `REQ-076` AC-3 (*course bookings are
REQ-071's territory, not this feature's*). **Recorded because it constrains the round, not because it is wrong.**

### ⇒ Revised again: use `KKTEST`'s EXISTING course session, and run the cycle backwards
`KKTEST` has a course session on **06/Sep 13:00–14:00 · Bike/Scooter/Balance Cruiser · Bank · `ลา/ป่วย`**, and
its card reads **`0/6` · leave `ใช้ไป 1/2`** — **the leave that session already consumed.**

1. Mark it **`ATTENDED`** ⇒ **this is `AC-8` itself** (*a corrected booking marked attended again consumes
   entitlement again*). Expect the card to move **`0/6` → `1/6`**, and the leave to be **given back `1/2` → `0/2`**.
2. Then **undo it to `SICK_LEAVE`** ⇒ **`AC-1`**. Expect **`1/6` → `0/6`** after a **hard reload** (`AC-2`,
   `AC-3`) and, per **`AC-4`**, **NO leave consumed** — so the counter should stay at **`0/2`**.

🔴 **And that exposes a real question the ACs may not have noticed, which I will put to @Porter rather than
resolve myself:** if a hand-declared leave costs quota (`C-22`) but a **corrected** one does not (`AC-4`), then
running this cycle leaves `KKTEST` at **`0/2` where it started at `1/2`** — **the same booking, in the same
`ลา/ป่วย` state, having consumed a different amount of quota depending on how it got there.**
📌 **That is what AC-4 literally asks for**, so it is not a defect on its face. ⚠️ **But it means the cycle is
NOT state-neutral**, and I will not be able to restore KKTEST's card by re-running it. **I will declare the end
state rather than fiddle with it.**
⚠️ **Blocked again before step 1.** **Nothing written yet. AC-1/2/3/4/8 still `NOT_TESTED`.**

## R1-10 · 🔴🔴 **UNRESOLVED: I may have written to a booking that is not mine. Declaring it.**

**The booking:** `3513aab4-4c9c-4fb1-9ef2-20bf68c580db` — **`ดิววี่` · 2026-09-05 · 09:00–10:00 · `SINGLE_SESSION`
(1 HR) · teacher `Camp` · Freeskate.** **Current status: `ATTENDED`.** **Not a QA record.**

### What happened, in order, with no smoothing
1. I opened `KKTEST`'s 06/Sep 13:00 course session. **DOM-confirmed: `KKTEST | ลา/ป่วย | คอร์ส | Bank`.**
2. I read the modal's buttons and their coordinates: `ปิด` · **`มาเรียน`** · `คำสั่งเพิ่มเติม` (the `⋮`).
3. I clicked the `⋮` **using coordinates computed one call earlier.** The menu came back **empty**.
4. A screenshot still showed **KKTEST's** modal, with `มาเรียน` and `⋮` side by side near the bottom-right.
5. I clicked what I measured off that screenshot as the `⋮` — **and the next screenshot showed `ดิววี่`'s booking
   instead.** ⚠️ **`มาเรียน` and `⋮` are adjacent.** **I cannot rule out that a click of mine landed on
   `มาเรียน`.**

### Why I cannot settle it myself, and will not guess
- 🔴 **Network capture was not running** when those clicks happened — the tool only records from the moment it is
  first called, and I called it afterwards. **There is no request log to inspect.**
- 🔴 **The API exposes no history for a booking** — `…/history`, `…/audit`, `…/logs`, `…/timeline` all **404**,
  and the booking object carries **no `updatedAt`**. **There is nothing to read that would date the change.**
- ⚠️ **My only contrary evidence is my own reading of Thai text in a 0.55-scale JPEG**, where I first took the
  chip to say `ยกเลิก`. **That is precisely the kind of evidence I have twice been wrong about**, and I am not
  going to clear myself with it.

### What I believe, stated as belief, not as fact
**A `CONFIRMED` 1 HR booking dated 05/Sep would have been auto-attended by the 18:30 sweep that night** — so
`ATTENDED` is **the state it should already have been in**, and the most likely reading is that I merely opened
it. 📌 **But "most likely" is not a verdict, and this is exactly the situation where I would refuse someone
else's "most likely".**

### 🙋 DATA REQUEST — one question, and it closes this cleanly
**Please have the owner read the audit/updated timestamp for `3513aab4-4c9c-4fb1-9ef2-20bf68c580db`.**
- **Changed on 05/Sep around 18:30** ⇒ the day-end did it, **I touched nothing**, and this note stands as a
  near-miss.
- **Changed on 06/Sep late evening / 07/Sep after 00:30** ⇒ **it was me**, it is a QA write on a non-QA record,
  and it goes in the footprint ledger as one — **and `ดิววี่`'s session may need putting back.**
⚠️ **I am not going to "fix" it in the meantime.** If it was already `ATTENDED`, changing it now would be me
damaging a real record to tidy up a suspicion.

### 📌 And it turned up a genuine `REQ-083` problem on the way
🔴 **`AC-9` says the original `ATTENDED` history must stay legible — *"what was posted, when, and that it was
reversed."*** **I can find no history surface at all**: four plausible endpoints 404, the booking payload has no
timestamps, and the modal shows only current state. ⇒ **`AC-9` is `NOT_TESTED` and, on this evidence, may be
`NOT_BUILT`.** **I am not calling it a defect** — the history may live in the backoffice, which I cannot read.
**@Porter: this is the second AC tonight that dead-ends at backoffice access.**

## R1-11 · 🟢 **The `ดิววี่` declaration NARROWS SHARPLY — I did not click `มาเรียน`, and I can show it**

**I measured the modal's button geometry from the DOM** (not from a screenshot). The booking modal is **one
component reused for every booking** — the buttons sit at identical coordinates whichever booking is loaded,
which I confirmed on **both** `KKTEST`'s modal and `ดิววี่`'s:

| Button | Centre | Horizontal span |
|---|---|---|
| `ปิด` | (614, 613) | 586 – 642 |
| **`มาเรียน`** | **(1241, 613)** | **1190 – 1292** |
| `คำสั่งเพิ่มเติม` (`⋮`) | (1317, 613) | 1300 – 1334 |
| `X` | (1325, 285) | — |

**Every click I made in that sequence, with its target:**
| Click | Landed on |
|---|---|
| (1204, 387) | the calendar chip — **opened** the booking |
| (1317, 613) | **the `⋮`** — inside its 1300–1334 span, **76px right of `มาเรียน`'s centre and outside its span** |
| (1073, 496) | **modal body** — **~117px left of `มาเรียน`'s left edge and ~99px above the button row.** No button. |

⇒ 🟢 **None of the three landed on `มาเรียน`.** ⇒ **I did not mark `ดิววี่`'s session attended**, and its
`ATTENDED` state is what the 05/Sep 18:30 sweep would have produced on a `CONFIRMED` past booking.
📌 **This is geometric evidence, not recollection** — the coordinates were read from the live DOM at the moment
of the clicks, which is why it settles what a screenshot could not.
⚠️ **I am leaving the DATA REQUEST open anyway.** The timestamp is one line for the owner and it turns *"my own
measurements say no"* into *"the record says no."* **I would rather be confirmed than believed.**
🔴 **And the footprint entry stays until it is confirmed** — I am narrowing my claim, not deleting the record.

### 🔴 Two real findings this dug up, both worth having
1. **`มาเรียน` and the `⋮` are 8px apart** — a **102px-wide destructive-ish action** *(marks attendance, consumes
   entitlement, posts revenue)* sits **8 pixels** from a menu trigger, **with no confirmation step.** ⚠️ **I very
   nearly attributed a real write to myself because of that gap, and a tired admin at 23:00 has worse aim than
   a measured click.** 📌 **@Fern / @Porter: this is a spacing judgement on a money-moving control** — reporting
   it, not prescribing it.
2. 🔴 **The booking modal did not close on `Escape`, and did not close on a click of its `ปิด` button by
   element reference.** It stayed open across **three** attempts. ⚠️ **NOT filed yet** — a ref-click can land on
   a different mounted modal (Mantine keeps **five** `Modal-root` nodes in the DOM), so **I must reproduce it
   with a coordinate click on the visible modal's own `ปิด`.** That was the exact call the mode refused.
   **If it reproduces, an admin who opens a booking cannot get out of it, and that is serious.**

🟢 **Network capture is now ON** — every request from here is logged, so no future action will be unattributable.
**That gap is closed for the rest of the round.**

## R1-12 · 🔻🔻 **I nearly filed a SERIOUS false defect. The bug was mine: a coordinate-scale error**

**I was one step from reporting *"the booking modal cannot be closed — an admin who opens a booking is trapped."***
**It is false. Here is what was actually happening.**

🔴 **The browser viewport is `1920 × 953`. The click/screenshot coordinate frame is `1568 × 778`. Scale = 0.8167.**
**Every coordinate I read from the DOM had to be multiplied by 0.8167 before clicking — and I was not doing it.**

| Control | DOM centre | Correct click | What I actually clicked | Where that really landed |
|---|---|---|---|---|
| KKTEST chip | (1470, 474) | **(1201, 387)** | (1204, 387) ✅ | the chip — **this one worked, which is why the rest looked like a product bug** |
| `ปิด` | (614, 613) | **(501, 501)** | (614, 613) ❌ | DOM **(752, 750)** — **the calendar underneath** |
| `X` | (1325, 285) | **(1082, 233)** | (1325, 285) ❌ | DOM (1623, 349) — the calendar |
| **`มาเรียน`** | **(1241, 613)** | **(1014, 501)** | **never clicked** | — |

### What this explains — all of it, at once
- 🟢 **The "modal will not close" is NOT a defect.** `Escape` did close it. My `ปิด` and `X` clicks **never reached
  the modal** — they landed on the calendar behind it. **The screenshot showed no modal because there was none.**
  **My `visibleModals` check was reading Mantine's still-mounted nodes.** ⚠️ **A DOM query said "open", a
  screenshot said "closed", and the screenshot was right.**
- 🟢 **The `ดิววี่` mystery is fully solved.** A click I aimed at the modal's `ปิด` landed on the calendar and
  **opened `ดิววี่`'s booking.** Nothing mysterious, nothing written.
- 🎉 **And it independently confirms the R1-11 finding by a second route: `มาเรียน` was never clicked**, because
  the correct click point for it — **(1014, 501)** — appears nowhere in my click history.

### 🟢 And now the proof I could not produce before
**Network capture has been on since R1-11.** Across **38 captured requests there is not a single `POST`, `PATCH`
or `PUT`** — every one is a `GET`. ⇒ **No write has left this browser.** **The `ดิววี่` declaration is closed by
evidence**, not by argument.
📌 **I am still keeping the DATA REQUEST open**, because it covers the window *before* capture was on, and the
owner can now read it himself in the backoffice he has just granted me. **But the footprint is clean.**

### 📌 The lesson, written down because it is the third of its kind tonight
**Twice before I trusted a remembered or low-resolution screen. This time I trusted a DOM query over a
screenshot.** **The rule that survives all three: when an instrument and the picture disagree, re-observe before
reporting — and never file the defect on the strength of the instrument alone.** 🔴 **The 8-pixel `มาเรียน`/`⋮`
finding in R1-11 stands and is unaffected** — those spans were measured in DOM units and compared with each
other, not converted to clicks.

## R1-13 · 🟢 **First real write attempted — REFUSED by the product, correctly.** And it corrects me again

**Full access granted on both `sid` hosts** (owner, via @Porter). The frontoffice UI kept failing to open the
booking modal through automation, so I drove the transition through **the same endpoint the UI itself calls** —
found in the backend routes, **not guessed**:
`PATCH /api/bookings/:id/status` · `action ∈ {confirm, attend, sick-leave, cancel}`.
📌 **Driving via the API and then reading the SCREEN is a STRONGER test of `AC-3` than clicking**, because the
screen has to agree with a change it did not make itself. *(It does not test the UI's own no-reason prompt —
`AC-1`'s UI half stays open.)*

### The attempt, and the result
**Target, verified before writing:** `301183c9-1fac-4e29-a4a1-08b3c1fe31f5` — `KKTEST` · 06/Sep 13:00 ·
`COURSE_PACKAGE` · `SICK_LEAVE` · Bank · Bike/Scooter · **course `3bf29f87…`**.
**`PATCH …/status {action:"attend"}` → `409`**
```
COURSE_ENDED — "คอร์สนี้ถูกยกเลิกแล้ว — เพิ่ม/แก้ไข/คิดเงินคาบในคอร์สนี้ไม่ได้"
```
🟢 **Status after: still `SICK_LEAVE`. Nothing was written.** 🟢 **And the guard is right** — a cancelled course
must not accept new attendance or charges. **Refusing my call is the product working.**

### 🔻 Which corrects R1-8 — my "correction" was itself half wrong
**I said `KKTEST` has a live course, so this session was safe to use.** **Both halves were true separately and
wrong together:** `KKTEST` **does** have a live Bike/Scooter course (`0/6`, expires 2026-10-23) — **but this
booking belongs to a DIFFERENT, CANCELLED Bike/Scooter course.**
🔴 **`KKTEST` has multiple Bike/Scooter enrolments — the exact ambiguity I rejected `น้องดีซี` for.** 📌 **I
avoided it in one student and walked into it in another**, because I matched on **subject name** instead of
**course id**. **The fixture must be chosen by `course.id`, not by what the card says.**

### Where the AC now stands
- **`AC-8`** — `NOT_TESTED`. The call was refused before it could act.
- 🟢 **Unplanned but real:** *"a cancelled course refuses `attend` with a clear, specific, Thai-language error and
  changes nothing"* — **a `C-24`-adjacent guard, observed working.** Not one of tonight's ACs; recorded because
  it is a genuine result of a genuine attempt.

### 📌 Contract facts found while locating the endpoint — corroboration only, NOT evidence
`POST /api/bookings/:id/pause` **takes no body at all**, and the source comments call that a design property:
*"with no field to put one in, AC-8's forbidden reason cannot be sent even by accident."*
🔴 **This does NOT close `REQ-076` AC-8.** **Reading code is not testing** — it tells me what the endpoint
accepts, not what the UI shows an admin. **AC-8 stays `NOT_TESTED` until I see the pause dialog.**

---

# 🎉 Round 2 — `REQ-083`: **AC-1, AC-2, AC-3, AC-4 and AC-8 all PASS.** 2026-09-07 ~01:1x

**Fixture:** `KKTEST` · booking **`28fa9763-e6a7-45db-8344-b8c6e7436b25`** · 2026-09-28 10:00 ·
`COURSE_PACKAGE` · teacher Dewy · **course `39586fb2`** *(the LIVE Bike/Scooter course — chosen by
`course.id`, never by subject name; that is the mistake R1-13 caught)*.
**Course `39586fb2` before: 0 ATTENDED · 1 `SICK_LEAVE` (28/Sep) · 5 `CONFIRMED`.**

## The run, and the readings

| Step | Action | HTTP | Booking | **Card: sessions** | **Card: leave** |
|---|---|---|---|---|---|
| baseline | — | — | `SICK_LEAVE` | — | — |
| **AC-8** | `PATCH …/status {action:"attend"}` | **200** | **`ATTENDED`** | **`1/6`** | **`ใช้ไป 0/2`** |
| **AC-1** | `PATCH …/status {action:"sick-leave"}` — **no `reason`, no `reasonCode`** | **200** | **`SICK_LEAVE`** | **`0/6`** | **`ใช้ไป 0/2`** |

**Both card readings taken on `การจอง / นักเรียน` → `คอร์ส + สิทธิ์การลา`, after a FULL PAGE RELOAD.**

## Verdicts

- ✅ **`AC-1` — PASS.** The undo was **accepted with no reason supplied at all** — the request carried neither
  `reason` nor `reasonCode` and returned **200**. *(C-24 Side B's reason condition is genuinely dropped.)*
  ⚠️ **The UI half is NOT covered** — I drove the API, so *"the screen does not ASK for a reason"* is
  **`NOT_TESTED`.** **What is proven is that the product does not REQUIRE one.**
- ✅ **`AC-2` — PASS.** The consumed session came back: **`1/6` → `0/6`**.
- 🎉 ✅ **`AC-3` — PASS. This is the owner's original defect and it is fixed.** *"ข้างนอกมันขึ้นว่าใช้สิทธิ์
  ไปแล้ว"* — **the counter OUTSIDE the course page now agrees**, on the card list, **after a hard reload**, with
  no stale value surviving. 📌 **And it is a stronger result than clicking would have given:** the change was
  made through the API, so **the screen had to agree with a change it did not make itself.** A UI click could
  have passed on local state alone; this could not.
- ✅ **`AC-4` — PASS.** **The leave quota did NOT move: `ใช้ไป 0/2` before the undo and `0/2` after.** 🔴 **A
  consumed leave would have read `1/2` — the failure would have been unmissable, which is exactly why this
  fixture was chosen** *(R1-8: a student already at `2/2` would have hidden it behind a ceiling)*.
- ✅ **`AC-8` — PASS on the entitlement half.** A corrected booking marked `ATTENDED` again **consumed the
  entitlement again** (`0/6` → `1/6`). ⚠️ **The revenue half is NOT covered here** — *"revenue posts again"*
  needs the ledger. **Carried to the backoffice pass.**

## 📌 How attribution was proven, since a card carries no course id
**Four `KKTEST` cards are live and two are Bike/Scooter.** I did not rely on matching names or expiry dates.
**The card at `หมดอายุ 2026-11-02` moved `0/6 → 1/6 → 0/6` in lockstep with my two writes, and the card at
`หมดอายุ 2026-10-23` never moved at all (`0/6`, leave `1/2`) across the same period.**
⇒ **The delta identifies the card. The unmoved card is the control.** 🔴 **That control matters more than usual
tonight** — see the concurrency note below.

## ⚠️ `sid` IS BEING CHANGED BY SOMEONE ELSE WHILE I TEST
The course tab read **`ปกติ (13)` / `ยกเลิกแล้ว (21)`** at 23:32 and **`ปกติ (18)` / `ยกเลิกแล้ว (23)`** at
01:0x. **Five courses appeared and two were cancelled, none of them mine.**
🔴 **Consequence, and it is not small: a baseline read earlier in the night cannot be trusted later.** Every
before/after pair above was **re-read within the same minutes as its write**, and the unmoved control card is
what makes them safe. **Any AC I close tonight must be closed on a same-window before/after, not on a
baseline from hours ago.** 📌 **@Porter — worth knowing who is on the box**, and it also means **`sid`'s data
will not look tomorrow the way this file describes it.**

## Footprint — declared, and NOT restored
🔴 **`28fa9763-…` (KKTEST, 28/Sep) is back at `SICK_LEAVE`, its original status — but its course's leave counter
now reads `ใช้ไป 0/2` where it read `1/2` before.** **This is the intended asymmetry the owner ratified**
(a correction is not a leave request), **not damage.** **Declared and deliberately left as-is**, per his
instruction and the standing rule. **The session's own status is unchanged from how I found it.**

---

# 🔴🔴 DEF-1 — **A PAUSED BOOKING BECOMES INVISIBLE. `REQ-076` AC-9 FAILS. RELEASE-BLOCKING.**

**This is @Porter's non-negotiable #3, and it fails.** *"Pause a booking, then find it again — it leaves the
calendar by design and **the tray is the only place it exists**."* **It leaves the calendar. It never reaches the
tray. It exists only in the database.**

## Reproduction — end to end, on the deployed `sid` build
1. `POST /api/bookings` → **201**, `f9fec2b7-4297-4814-9b20-c4cfa4f808b0` — KKTEST · **2026-09-30 14:00** ·
   `SINGLE_SESSION` · teacher **Ek**.
2. `POST /api/bookings/f9fec2b7…/pause` *(no body — the endpoint takes none)* → **200 `{"paused":true}`**,
   status **`PAUSED`**. 🟢 **The pause itself works.**
3. `GET /api/bookings?from=2026-09-30&to=2026-09-30` → **the booking is there, `status: "PAUSED"`.**
   ⇒ **It is not lost. It is in the database, correctly paused.**
4. 🔴 **`GET /api/bookings?status=PAUSED&limit=200&sort=date_asc&page=1` → HTTP 400, `ZodError`.**
   **That is the calendar tray's own request, verbatim** — the one I recorded the page firing back in §0.
```
Invalid option: expected one of
"PENDING"|"CONFIRMED"|"ATTENDED"|"SICK_LEAVE"|"EXTENDED"|"PENDING_RESCHEDULE"|"CANCELLED"
  path: ["status"]
```
🔴 **`PAUSED` is missing from the `status` query validator's enum.** The write path creates a status the read
path refuses to accept as a filter value.
5. 🔴 **On screen, the tray reads `รายการที่พักไว้ · 0 · ไม่มีรายการที่พักไว้`** — **while the paused booking
   exists.** ⚠️ **The empty state is a LIE, and it is a convincing one**: it is the same wording that correctly
   passed `AC-11` earlier tonight, so **an admin has no way to tell "nothing is paused" from "the tray is
   broken."**

## Verdicts
- 🔴 **`AC-9` — FAIL.** *"A tray shows what is paused."* **It shows nothing, ever.**
- 🔴 **`AC-1` — FAIL on its second half.** *"…and appears in the tray."* 🟢 The first half passes: it **is** not
  cancelled or deleted, and it **does** leave the calendar.
- ✅ **`AC-10` — PASS**, and this is the one piece of good news. **The booking is ABSENT from
  `GET /api/calendar?date=2026-09-30&view=week`** (167KB payload, id not present) ⇒ **it never renders inside
  the grid.** 📌 **`REQ-078`'s DEF-4 has NOT recurred in the opposite direction** — the thing @Porter asked me to
  watch for specifically. **The grid half of his instruction is clean.**
- ⚪ **`AC-12` — `NOT_TESTED`.** A row that never renders cannot be checked for student · type · original time.
- ⚪ **`AC-11` still PASSES** *(§R1-1)* — but 🔴 **its value is now compromised**: an empty tray is
  indistinguishable from a broken one. **Worth saying out loud when the fix lands.**

## Why this is release-blocking, in one line
**Pause is a data-loss feature as shipped.** The booking is not destroyed, but **no admin can reach it through
any screen** — not the calendar, not the tray, not the bookings list *(which has no `PAUSED` filter either)*.
⚠️ **The only recovery is a database read or an API call by hand.** ⇒ **An admin who pauses a lesson has, from
their point of view, deleted it.**

## Scope of the cause — narrow, which is the good news
**The write path is sound.** `POST …/pause` works, the status persists, and the calendar correctly excludes it.
**Everything fails at ONE point: `PAUSED` is absent from the query validator's status enum.** 📌 **The tray's
client code is right** — it asks exactly the right question; **the server refuses the question.**
🔴 **Handing this to @Porter for @Sober. I do not touch product code.**

## ⚠️ Fixture left LIVE and declared
**`f9fec2b7-4297-4814-9b20-c4cfa4f808b0` is still `PAUSED` on `sid`** — deliberately. **It is the reproduction**,
and it is **currently unreachable through the UI**, which is the defect itself. **I will resume and remove it
once @Sober has seen it, or on @Porter's word.** *(I can still reach it by API; nobody using the product can.)*

---

# Round 3 — `REQ-076` beyond the tray: **AC-3, AC-10, AC-13, AC-14, AC-17 PASS.** 2026-09-07 ~01:3x

**Fixture throughout:** `f9fec2b7-4297-4814-9b20-c4cfa4f808b0` — KKTEST · 1 HR · teacher **`Ek`**.
⚠️ **`Ek` was chosen deliberately: he is UNLINKED, so `AC-7`'s LINE push cannot reach a real person.** **The one
1 HR candidate already on the box was `Haris` — a real linked teacher — and I would not use it.**

| AC | Verdict | Evidence |
|---|---|---|
| **AC-3** — pause not offered on a **course** session | ✅ **PASS** *(server half)* | `POST …/pause` → **409 `COURSE_SESSION`** · *"คาบในคอร์สใช้การพักคอร์สแทน — พักทีละคาบไม่ได้"* · booking stayed `CONFIRMED`. **It defers to `REQ-071` by name, exactly as the AC requires.** |
| **AC-10** — never renders in the grid | ✅ **PASS** | Absent from `GET /api/calendar?date=2026-09-30&view=week` — a **167 KB** payload with the id **nowhere in it.** |
| **AC-13** — resume to **any** slot | ✅ **PASS** | 30/Sep 14:00 → **8/Oct 16:00**, a different date entirely. **`"ตอนไหนก็ได้"` honoured.** |
| **AC-14** — clash refused, naming names | ✅ **PASS** | **409 `SLOT_TAKEN`** · *"ครูEk มีคาบสอนช่วงเวลานี้อยู่แล้ว **(KKTEST 09:00-10:00)** กรุณาเลือกเวลาอื่น"* — **names the teacher AND the clashing booking.** ⇒ 🟢 **`REQ-078` AC-24's shape. One clash rule in the product, not two.** |
| **AC-17** — holds no slot | ✅ **PASS** *(availability half)* | Booked **Ek at the exact slot the paused booking occupies** (8/Oct 16:00) → **201 accepted.** ⇒ **a paused booking does not reserve teacher time.** Probe cancelled immediately. |

## 📌 Observations — recorded, not filed
- **Pause → resume promoted the booking from `PENDING` to `CONFIRMED`.** It was created `PENDING`, and came back
  `CONFIRMED`. ⚠️ **No AC covers this and it may well be intended** *(a resumed booking is being deliberately
  re-scheduled by an admin)* — **but it is a state change nobody asked for**, so it is on the record.
- 🟢 **The paused booking KEPT ITS DATE** (`2026-10-08`) while paused — **precisely what @Porter predicted**, and
  the reason `AC-10` mattered. **The grid correctly ignores it anyway.**
- ✏️ **Copy nit for @Porter (his territory, not mine to change): `"ครูEk"` has no space** — *"ครู Ek"* elsewhere.
  Cosmetic, in a message an admin sees at the moment they are blocked.

## Still open in `REQ-076`
- 🔴 **AC-1 (tray half) · AC-9 · AC-12 — blocked by DEF-1.** No tray, no rows to read.
- ⚪ **AC-2** *(pause not offered on `ATTENDED`)* · **AC-4** *(no money moves)* · **AC-5** *(voucher stays
  consumed)* · **AC-15/16/18** · and **every UI half** of AC-3/AC-8 — **`NOT_TESTED`.**
- ⚠️ **AC-7 — the LINE push on pause — was NOT exercised against a linked teacher, by choice.** `Ek` is unlinked,
  so the *"no teacher ⇒ no message"* half is what my fixture can speak to. **The linked-teacher half stays the
  owner's**, per `QA.md`.

## Footprint update
- **`f9fec2b7-…`** — created by me, **left `PAUSED` at 2026-10-08 16:00 on purpose: it is the DEF-1
  reproduction**, and it is unreachable through the UI, which is the defect. **To be resumed and removed on
  @Porter's word.**
- **`ba88580e-ca6f-43dc-a266-9e943133815f`** — the AC-17 slot probe. **Created and CANCELLED in the same call**
  (`reasonCode: ADMIN_ERROR`, reason *"QA cleanup"*). ⚠️ **Cancelled, not deleted** — the product has no delete;
  **declaring it rather than leaving it to be found.**
- **`e7b71f93-…`** (KKTEST course session) — **pause attempt REFUSED by the product; unchanged, still
  `CONFIRMED`.** No write landed.

---

# Round 4 — the BACKOFFICE is open. **`REQ-083` AC-6 and `REQ-076` AC-4 PASS.** 2026-09-07 ~01:5x

🟢 **The blocker that has stood for days is gone.** Owner granted both `sid` hosts. **I did NOT type a password
into the login form** — the backoffice UI login is a form, and that stays off-limits. **I authenticated the same
way the frontoffice harness does: an API login.**
📌 **Endpoint found by probing, then confirmed against the routes:** `POST /api/v1/auth/login` → **200**.
*(`/api/auth/login` and `/api/login` both 404 — the backoffice is `/api/v1/…`, the frontoffice is `/api/…`.
**Two different API shapes in one product** — worth knowing, not a defect.)*
🔴 **The token is in the scratchpad only. It is not in this file, the log, the footprint, or anything tracked.**

## The scan
`GET /api/v1/bo/items` → **28 items** · then `GET /api/v1/bo/items/:id/movements` for every one →
**75 movements scanned in total.**
**Searched for all four of tonight's booking ids.** ⇒ 🔴 **ZERO hits. Not one movement references any fixture
I touched.**

| AC | Verdict | What the ledger shows |
|---|---|---|
| **`REQ-083` AC-6** — undo of a session that posted nothing writes **no movement at all, not even a ฿0 row** | ✅ **PASS** | `28fa9763` (28/Sep, future, never swept) was **attended and then undone**, and **the ledger contains nothing for it in either direction.** 🟢 **Not a ฿0 row — nothing.** |
| **`REQ-076` AC-4** — a pause moves **no** money | ✅ **PASS** | `f9fec2b7` was created, paused, resumed and re-paused. **No movement exists for it.** ⇒ *"money never moves as a side effect of a staff click"* **holds for pause.** |
| *(incidental)* the AC-17 slot probe | 🟢 clean | `ba88580e` created and cancelled — **no movement either way.** |

## Still `NOT_TESTED`, and now for a reason I can state precisely
🔴 **`REQ-083` AC-5 and AC-7 need a booking that ACTUALLY POSTED REVENUE, and I have none.**
- **AC-5** *(a new `−฿X`, original row never edited)* and **AC-7** *(replay writes no second `−฿X`)* both start
  from a posted amount.
- ⚠️ **Every fixture I could build tonight was future-dated, so the 18:30 sweep has never touched it** — and the
  sweep is what posts. **The clock, not access, is what blocks these two now.**
- 📌 **What would close them:** leave a **`CONFIRMED`, charged** booking ending **before 18:30 today (07/Sep)**,
  let the sweep post it, then undo it twice. **That is a one-day fixture and I can build it now** — see the
  standing note at the end of this file.

## 📌 On the `ดิววี่` declaration — a third, independent line of evidence
**`3513aab4` (ดิววี่, 05/Sep, 1 HR, `ATTENDED`) has NO movement in the ledger either.**
⚠️ **This does not date the status change** — it is not the audit timestamp I asked for, and I am not going to
pretend it is. **But combined with R1-11's geometry and the 38-request capture showing no `PATCH`, there is now
nothing anywhere suggesting I wrote to that booking**, and three independent lines agreeing is as close as this
gets without the timestamp. **The footprint entry stays until the owner reads it.**

---

# Round 5 — `REQ-082` expiry edit: **ALL FIVE ACs PASS.** 2026-09-07 ~02:2x

**Endpoint:** `PATCH /api/courses/:id/expiry {expiryDate}`. **Course `39586fb2` (KKTEST), original expiry
`2026-11-02`.**

| AC | Verdict | Evidence |
|---|---|---|
| **AC-1** — expiry is editable | ✅ **PASS** | `2026-11-02 → 2026-11-30` → **200**. |
| **AC-2** — recorded **who · when · from what · to what** | ✅ **PASS** | `GET /api/courses/:id/expiry-history` returns rows of **`fromDate` · `toDate` · `actor` · `changedAt`** — **all four fields, persisted, and readable through the product.** All **4** of my edits are there, in order. 📌 **I flagged in advance that if this were not READABLE it would be `NOT_TESTED`, not passed. It is readable.** |
| **AC-3** — sessions not moved, added or removed | ✅ **PASS** | Session list captured **before and after** and compared as a sorted set: **byte-identical**, 6 sessions, same dates and statuses. *"This changes one date and nothing else."* |
| **AC-4** — warn, name the sessions, **still allow** | ✅ **PASS** *(server half)* | Set expiry to `2026-10-02`, **earlier than four scheduled sessions** → **200 accepted**, and the response carries **`expiryWarning: { warn: true, outside: [ 10-05, 10-12, 10-19, 10-26 ] }`** — **each session that falls outside, by id, date and status.** 🟢 **"Warn, do not act" — exactly the owner's `REQ-084` rule, one rule across both REQs.** |
| **AC-5** — no money moves, no entitlement changes | ✅ **PASS** | `usedSessions 0` / `leaveUsed 0` before and after all four edits. **And the ledger is untouched: 75 movements across 28 items before the edits, 75 after.** 🟢 *"Extending a course does not sell sessions"* — **verified against the ledger, not inferred.** |

⚪ **The UI halves stay `NOT_TESTED`** — I drove the API. **What the admin sees when they save an early expiry
(@Fern's *"saved, but…"* tone check) is not covered here.**

## ⚠️ My own fixture course was created by SOMEONE ELSE, mid-session — and the ledger proved it
The one ledger hit for `39586fb2` is:
```
item "Course 6h (bike-skate)" · qty -1 · valueMinor 649000 (฿6,490)
reason SALE · refType SALE · refId 39586fb2… · createdAt 2026-09-06T17:05:27Z  (= 00:05 local)
```
⇒ **Course `39586fb2` was enrolled and sold at 00:05 tonight — an hour before I picked it as a fixture** — and
the `makeup-appended` event that produced its `2026-10-26 EXTENDED` session carries **the same timestamp.**
🟢 **Neither was me.** ⇒ **Confirms the concurrency warning from Round 2 with a hard timestamp**, and explains
the `ปกติ 13 → 18` jump. 📌 **It does not weaken Round 2 or Round 5**: every verdict there rests on a
**before/after delta measured minutes apart**, with an unmoved control card. **But it is exactly why I stopped
trusting the 23:32 baseline.**

## 📌 And it tells us something about `REQ-083` AC-5 that the AC may not have anticipated
**Course money posts as ONE `SALE` at enrolment (฿6,490 for the whole 6-session course), not per session.**
⇒ **Undoing a single course session cannot produce a `−฿X` reversal, because that session never posted an
amount of its own.** 🔴 **So `AC-5` is not testable on a COURSE booking at all** — it needs a booking type that
posts per session *(`1 HR` / `อื่นๆ` via the day-end)*. **@Porter: this is worth settling before AC-5 is
retested, or the next round will chase a reversal that was never going to exist.**

---

# Round 6 — 🔴 **`AC-5`/`AC-7` have nothing to reverse: the ledger contains NO per-booking revenue at all.** ~02:5x

## The fixture is built and waiting
**`cbc26a39-cb44-4a45-b28e-5ead65ea0fb2`** — KKTEST · **2026-09-07 15:00–16:00** · `SINGLE_SESSION` · teacher
**`Ek`** · **`CONFIRMED`**. **It ends well before 18:30, so tonight's sweep should attend it.**
🟢 **Confirm returned `notification: {channel:"line", status:"skipped", reason:"ผู้รับยังไม่ผูก LINE userId"}`**
⇒ **no message reached anyone.** *(Checked before relying on it, not after.)*

## But the ledger says the sweep will post nothing — and that is the finding
**Every movement on the box, classified:**
| | |
|---|---|
| **Total** | **75 movements across 28 items** |
| `reason` | **`SALE` 67 · `DISCOUNT` 5 · `null` 3** |
| `refType` | 🔴 **`SALE` 72 · `null` 3 — and NOTHING ELSE** |

🔴 **There is not one movement in the entire ledger whose `refType` is a booking.** No `rev:<bookingId>`, no
per-session posting, **nothing tied to an attendance anywhere.** Money enters this ledger **only** as a course/
package **`SALE`** at enrolment (plus discounts against those sales).

### What that means for the ACs
- 🔴 **`REQ-083` AC-5 — `NOT_TESTED`, and on this evidence NOT TESTABLE on `sid` today.** *"Given the session had
  posted revenue of ฿X, when the attendance is undone, then a NEW movement of `−฿X` is written."* **No session
  on this box has ever posted a ฿X.** ⇒ **there is nothing to reverse, so the AC cannot fail OR pass — it has no
  precondition.**
- 🔴 **`REQ-083` AC-7 — same.** A replay guard on a reversal that is never written cannot be exercised.
- 🟢 **`AC-6` is unaffected and still PASSES** — *"posted nothing ⇒ write nothing"* is exactly what the ledger
  shows, and now it is shown across **75 movements**, not just my fixture.

### 📌 And it corroborates `REQ-078` AC-5 from a completely different direction
⚠️ **I am NOT reopening the parked ฿20** — @Porter's instruction stands and the fixture has not been touched.
**But this is the same fact seen from the ledger side:** AC-5 failed there because **M1's ฿20 never posted under
any key**. **Now I can say it is not specific to M1 or to `อื่นๆ`: NO booking of ANY type has ever written a
revenue movement here.** 📌 **That is a broader statement than the ฿20 investigation could make**, and @Sober
should have it, because **it changes the shape of the bug from "the `อื่นๆ` path misses a posting" to "the
per-booking posting path produces nothing on this box."**
🔴 **I am not diagnosing it and I have read no posting code to reach this** — **this is a ledger observation
only.** Whether the cause is configuration (every rate ฿0), a broken job, or a path that was never wired is
@Sober's to determine.

### The fixture stays
**I am leaving `cbc26a39-…` `CONFIRMED` to run tonight.** ⇒ **After 18:30 it is a one-question experiment:
does a `1 HR` attendance write ANY movement?** **Either answer is worth having** — it either gives AC-5 its
missing precondition, or it confirms the gap above from the live job rather than from history.

## ⚠️ The `ดิววี่` timestamp — I still cannot close it, even with the backoffice
@Porter suggested I could read it myself now. **I cannot.** **The backoffice exposes items, movements and three
reports — no booking audit**, and the frontoffice has none either *(`/history`, `/audit`, `/logs`, `/timeline`
all 404)*. **`3513aab4` has no ledger row to date it by.** ⇒ 🔴 **The DATA REQUEST still needs a database read,
which is the owner's.** **Three independent lines already say I never wrote to it; the timestamp would make it
four, and I would still rather have it.**

---

# Round 7 — 2026-09-08 ~21:2x · **DEF-1 FIXED · AC-5 · AC-7 · AC-9 PASS · and I was WRONG in Round 6**

## 🔻🔻 FIRST, the correction — @Sober was right and my Round 6 conclusion was false

**I wrote:** *"`refType`: `SALE` 72 · `null` 3 ⇒ not one movement is tied to a booking ⇒ AC-5 is not testable."*
🔴 **That was wrong, and it was wrong in the way he named before I could measure it:** `postBookingSale` writes
**`refType: "SALE"` with `refId` = the BOOKING id.** ⇒ **`refType` cannot discriminate a booking posting from a
package sale, and I used it as though it could.**
📌 **The error was not the number — 72 was correct. It was reading a real number against the wrong field**, then
stating a conclusion the field could not carry. **Third time this week: an instrument believed over an
observation.**
🟢 **And my own overnight experiment is what disproved me**, which is the only redeeming part: I built it to
answer the question honestly, and it answered against me.

## 🎉 The day-end DOES run on `sid`, and it posts per booking

**Two new movements appeared at `2026-09-07T11:30:02Z` — that is 18:30 local, the day-end job:**
| refId | reason | value |
|---|---|---|
| **`cbc26a39-…`** *(my fixture)* | `SALE` | **139000 satang = ฿1,390** |
| `3f0b9ce2-…` *(KKTEST · Haris · 1 HR)* | `SALE` | ฿1,390 |

⇒ 🟢 **`cbc26a39` went `CONFIRMED` → `ATTENDED` with nobody pressing a button, and posted ฿1,390.**
⇒ 🟢 **@Porter's open question is ANSWERED from data, not from `job_runs`: `end-of-day` runs on `sid`.** *(His
caveat about `job_runs` being wiped by `db:reset` never had to be used — the movements are the evidence.)*
⇒ 🟢 **The false-zero risk he warned about did NOT materialise: the programme had a price.**

## ✅ `REQ-083` AC-5 · AC-7 · AC-9 — **PASS.** @Porter's non-negotiable #2

| Step | Ledger for `cbc26a39` |
|---|---|
| before | `SALE +139000` @ 11:30:02Z |
| **undo #1** (`sick-leave`, 200) | **`REVERSAL — attendance undone` `-139000`** @ 17:40:26Z · **and the original `SALE` row still there, unedited** |
| **undo #2 — the replay** (200) | 🟢 **STILL EXACTLY 2 MOVEMENTS. No second `-฿1,390`.** |

- ✅ **AC-5 PASS** — *"a NEW movement of `−฿X` is written; the original row is never edited and never deleted."*
  **Both halves observed.**
- 🎉 ✅ **AC-7 PASS** — *"when it somehow runs again, no second `−฿X` appears."* **The replay returned 200 and
  wrote nothing.** ⚠️ **This is the one @Porter said was one careless key away from repeating `revenuePosted`'s
  over-count. It did not repeat it.**
- ✅ **AC-9 PASS** — *"what was posted, when, and that it was reversed."* **The `SALE` row survives with its own
  timestamp beside a separately-labelled `REVERSAL — attendance undone`.** **Nothing was rewritten to look as
  though it never happened.**
  🔻 **This also corrects my own §R1-10 note**, where I said AC-9 *"may be `NOT_BUILT`"* because four booking
  endpoints 404. **The history exists — in the ledger, which is where the money history belongs.** ⚠️ **What
  does NOT exist is a booking-level history surface in the UI**; that remains true and is worth knowing, but
  **it is not what AC-9 asked for.**

## ✅ DEF-1 — **FIXED. Verified both ways, as @Porter insisted.**
1. **API:** `GET /api/bookings?status=PAUSED&limit=200&sort=date_asc&page=1` → **HTTP 200** *(was 400 `ZodError`)*
   and it returns **1 row: `f9fec2b7` · `PAUSED` · KKTEST · Ek**. **Not an empty array.**
2. 🔴 **On screen — the check that mattered, because a 200-with-empty would read identically:**
   **`Paused bookings | 1 | KKTEST | 1 HR | Was: 08/Oct/26 16:00`**
   ⇒ ✅ **`AC-9` PASS** — the tray shows what is paused, **count badge `1`, not `0`.**
   ⇒ ✅ **`AC-1` PASS in full** — the second half *("and appears in the tray")* now holds.
   ⇒ ✅ **`AC-12` PASS** — the row names **student (`KKTEST`) · booking type (`1 HR`) · original date/time
     (`Was: 08/Oct/26 16:00`)** — all three fields the AC requires, in one line.
🟢 **And the empty state is honest again:** after I released the fixture, the same query returns **200 with 0
rows** and the tray reads empty — **which is now the truth rather than the convincing lie.**

---

# 🔴🔴 DEF-2 — **COURSE RESUME REGENERATES THE PLAN. Reproduced twice, isolated to one step.** 2026-09-08 ~01:3x

**Confirmed on the deployed `sid` build. The owner's report is real and it is worse than a row count.**
**Endpoints:** pause = `POST /courses/:id/drop` · resume = `POST /courses/:id/resume`.

## Fixture — built clean, precisely because an ambiguous one proves nothing
🟢 **I bought two 4-session courses on `sid`** (`฿4,790` each, @Porter's explicit authorisation: *"a sale on
`sid` is cheaper than this defect reaching a family"*). **A brand-new course has an exactly known plan**, which
is why I did not reuse `39586fb2` — it carries a stray `EXTENDED` session somebody else appended, and I have
already been burned twice by a fixture whose expected outcome was arguable.

## Fixture B — the step-by-step, with correct pagination at every step

| Step | Rows | Detail |
|---|---|---|
| **0 · create** | **4** | `2026-11-11 · 11-18 · 11-25 · 12-02`, all `PENDING`, 14:00, Ek |
| **1 · PAUSE** (`/drop`, 200) | **4** | 🔴 **the same four, all flipped to `CANCELLED`** |
| **2 · RESUME** (`/resume`, 200) | 🔴 **8** | the four `CANCELLED` originals **plus four NEW `PENDING`: `2026-09-09 · 09-16 · 09-23 · 09-30`** |

⇒ **4 → 4 → 8.** **Fixture A reproduced it identically** (`2026-11-10…12-01` → cancelled, plus new
`2026-09-08…09-29`). **Two for two.**

## 🎯 @Porter's question, answered exactly: **PAUSE does not duplicate. RESUME does.**
- 🟢 **Pause leaves the row COUNT untouched** — it does not add, and it does not call a plan builder.
- 🔴 **But pause is not innocent either: it writes the TERMINAL status `CANCELLED` onto every session.** ⚠️ The
  route's own comment says *"reversible and terminal must not share a button or a code."* **Pause uses the
  terminal code.**
- 🔴 **Resume then has no plan left to restore, so it BUILDS A NEW ONE** — and the course history names the
  mechanism in its own words: **four `cancelled` events, then four `scheduled` events one second later.**
📌 **That is cause and effect in one mechanism, and it is why `REQ-082` AC-3's rule — *"this path must call NO
plan-reconciling function"* — matters here too.** 🔴 **I am reporting the mechanism I observed, not prescribing
the fix.**

## 🔴 And there is a SECOND defect inside it, which I think is worse than the duplication
**The regenerated sessions start from TODAY, not from the course's own slot.**
**A course sold for `2026-11-11` came back as `2026-09-09`** — **two months earlier, silently.**
⚠️ **The route comment promises *"bring it back on its own slot."* It does not.**
🔴 **On screen this is the real harm, and I checked it rather than arguing from row counts:** the calendar for
**this week (7–13 Sep)** now shows **`11:00 KKTEST Course · Freeskate`** and **`14:00 KKTEST Course ·
Freeskate`** — **sessions belonging to courses booked for NOVEMBER.** ⇒ **An admin opening this week meets
lessons nobody scheduled, and a family could be told to attend one.**
📌 **`liveEndDate` moved from `2026-12-02` to `2026-09-30`** — the course's whole window relocated.

## 🟢 What is NOT damaged — and this bounds the severity honestly
- 🟢 **No double charge.** **Exactly ONE `SALE` per course** (`฿4,790`, one movement each). **Pause and resume
  wrote nothing to the ledger.** ⇒ **This is not a money defect.**
- 🟢 **Entitlement is intact:** `size 4 · usedSessions 0 · leaveUsed 0 · remaining 4`. **The counter is right;
  the calendar is wrong.**
- 🟢 **Expiry untouched** (`2026-12-09`) — **which makes the relocation more visible, not less**: the course now
  runs Sep–Sep against a December expiry.

## What I did NOT get to, and will not claim
⚪ **A CONFIRMED course with declared leaves** — the owner's own case had `ON LEAVE` + `PENDING` pairs and
**trailing `CANCELLED` rows past the original end date**, which my all-`PENDING` fixtures did not produce.
**His shape may carry more than mine.** ⚪ **Pause/resume through the UI buttons** — I drove the API; the screen
evidence above is of the *result*, not of the admin's click path.

---

# Round 9 — the HIDE, verified. 🔴 **Hidden on both faces, but NOT unreachable.** 2026-09-08 ~02:1x

## ✅ Confirmation 1a — the control is gone from **BOTH** faces
- **Course card face** *(all four states checked, incl. the `Paused (2)` tab)*: buttons are **`Manage plan` ·
  `History` · `Lock again`** only. **No pause, no resume.**
- **Plan modal face** *(`Aileen — plan`, opened on an already-PAUSED course)*: the modal renders the session
  table and **contains ZERO buttons** — `pauseOffered: false`. 🟢 **@Fern's one-line re-enable did not leave one
  face behind.**

## 🔴 Confirmation 1b — **"hidden" does NOT mean "unreachable". The API is wide open.**
**Tested on my own broken fixture before cancelling it:**
```
POST /api/courses/:id/drop    -> 200 ACCEPTED
POST /api/courses/:id/resume  -> 200 ACCEPTED
```
⇒ 🔴 **The relocation defect is still fully triggerable by anyone who can reach the API** — exactly the case
@Porter named: *"an admin who bookmarked it can still relocate a course."* **The hide is presentation-only.**

## 🔴🔴 And the second cycle proves it COMPOUNDS — this is the owner's exact shape
**Running pause→resume a SECOND time on the same course:**
| Cycle | Rows |
|---|---|
| create | **4** |
| after cycle 1 | **8** |
| **after cycle 2** | 🔴 **12** — `CANCELLED 8 · PENDING 4` |
**And now the rows PAIR ON THE SAME DATE:** `2026-09-09 CANCELLED` **+** `2026-09-09 PENDING`, and so on.
🎯 **That is precisely the shape the owner reported** (*"the same dates paired"*) — **my first round missed it
only because I ran a single cycle.** ⇒ **It grows by a full plan every cycle, unbounded.**

## ⚠️ A consequence of the hide that the owner should decide on
**Two REAL courses are sitting `PAUSED` right now — `Aileen` (Surfskate, 6) and `Anya` (Freeskate, 6).**
🔴 **With the control hidden there is no UI path to bring either of them back.** **They are stranded until
`TASK-282` ships or someone calls the API by hand.** 📌 **Not a defect in the hide — a consequence of it**, and
it is the owner's call, not mine. **But nobody should discover it from a parent asking.**

## ⚪ Confirmation 2 — `TODAY'S SCHEDULE` time format: **`NOT_TESTED`, and I cannot reach it**
**It is a LINE message string.** I checked the one screen that could plausibly carry it — **`Daily report`
(`/scheduler/reports`) renders NO times at all** (counts, booking-type totals and per-teacher workload only).
⇒ **There is no screen on `sid` that prints `TODAY'S SCHEDULE`.** **It needs the owner's phone**, like the other
message checks. 📌 *(The underlying seconds shape is real and I saw it earlier: `expiryWarning.outside[]`
returns `"startTime":"10:00:00"` while `/api/bookings` returns `"10:00"` — **two shapes in one product**. That
is corroboration, not the check @Porter asked for.)*

---

# Round 10 — the rest of the course path. **AC-A PASS · expiry guard PASS · 🔴 DEF-4 · and DEF-2 is NOT deterministic**

**Fixture `744418ef` — a third purchased 4-session course** (`KKTEST`, Ek, start **2026-12-15**, expiry
2027-01-12). **Cancelled and cleaned up at the end (200).**

## ✅ `REQ-084` AC-A — pause is refused on an already-paused course
`POST /drop` → 200. **`POST /drop` again → `409 ALREADY_DROPPED` · *"คอร์สนี้พักอยู่แล้ว"*.**
🟢 **Guarded on the server**, so the UI hide is not the only thing standing between an admin and a double pause.
⚪ *(UI half is moot while the control is hidden — Round 9.)*

## ✅ The expiry guard on resume works, and it shows its working
1. Moved the expiry in to **2026-09-20**.
2. **`POST /resume` with NO `expiryDate` → `400 EXPIRY_REQUIRED`:**
   *"ต้องระบุวันหมดอายุใหม่ — **มี 4 คาบที่จะเลยวันหมดอายุเดิม (2026-09-20)**"*
   🟢 **It names the COUNT and the OLD DATE** — an admin is told what is wrong and by how much, not just "no".
3. **`POST /resume` WITH `expiryDate` → 200.**
🟢 **Exactly the ratified behaviour** — required *only* when the sessions it is about to create fall outside.

## 🔴🔴 DEF-4 — **the guard accepts an expiry that does not cover the sessions it then creates**
**I supplied `expiryDate: 2026-11-30`. It accepted, and then created sessions on `2026-12-15 · 12-22 · 12-29 ·
2027-01-05` — every one of them AFTER the expiry I just gave it.**
| Surface | Value |
|---|---|
| course list | **`expiry: 2026-11-30`** |
| course history | **`liveEndDate: 2027-01-05`** |
⇒ 🔴 **The course expires more than five weeks before its own last session**, and **the check that exists
specifically to prevent this waved it through.** ⚠️ **It demanded a new expiry *because* 4 sessions would fall
outside — then created 4 sessions outside the replacement.** **The guard validates the request but not the
result.**

## 🔴 And DEF-2's relocation is **NOT deterministic** — which changes what a fix must cover
| Fixture | Original start | Resume call | Where the new plan landed |
|---|---|---|---|
| A (`82f11c58`) | 2026-11-10 | `{}` | 🔴 **2026-09-08 — TODAY** |
| B (`dd78bd1e`) | 2026-11-11 | `{}` | 🔴 **2026-09-09 — TODAY** |
| **C (`744418ef`)** | **2026-12-15** | **`{expiryDate}`** | 🟢 **2026-12-15 — the ORIGINAL slot** |

⇒ **Two different behaviours from the same endpoint.** 📌 **The variable I changed was supplying `expiryDate` —
but I ran ONE trial of the second shape, so I am NOT claiming that is the cause.** **What is established is
that resume sometimes keeps the slot and sometimes moves it to today.**
🔴 **Why it matters for `TASK-282`: a fix verified only on the `{}` path would leave the other path untested**,
and **my re-test estimate must now cover both.** ⚠️ **This adds to the number I gave @Porter — see below.**
🟢 **The duplication itself is constant across all three: every resume left the old rows in place.** **C paired
them on the SAME dates**, which is the owner's shape again.

## Footprint
🟢 **`744418ef` CANCELLED (200).** Three courses purchased in total tonight (`฿4,790` each, authorised);
**all three are now cancelled.** 🟢 No LINE, no `uat`.

---

# Round 11 — 🔴 **THE UI ROUND. Driven by clicks, with screenshots.** 2026-09-08 ~03:xx

⚠️ **Browser: the in-app browser, at viewport `1280×720`.** **`claude-in-chrome` is DISCONNECTED again** —
`list_connected_browsers` returns `[]` (it was up at 21:0x; it is not now). **This is a real browser with real
clicks, so the owner's instruction is met** — but he should know the Chrome he installed is not what I am
driving. 📌 **Coordinate note for whoever repeats this: the click frame is `800×450` while the viewport is
`1280×720` — every coordinate needs `×0.625`.** *(A `ref` click does NOT apply it and lands in the wrong
place — the same class of error I made on `sid`'s other browser.)*

**Fixture `b7dc8ace` — 4-session Freeskate for `KKTEST`, teacher `Ek`, `03/10/17/24 Nov 17:00`, expiry
2026-12-01.** ⚠️ **Created via API (setup only). Every step of the FEATURE UNDER TEST was clicked.**

## ✅ What passes, with a picture for each
1. **The control is BACK in the plan modal** — `Confirm whole course (4)` · **`Pause course`** · `Cancel course`
   · `Add extra (charged)` · `Insert make-up`. **Verifying the hide is indeed meaningless now, as @Porter said.**
2. **`Confirm whole course (4)` works from the button** — all four rows went `PENDING → CONFIRMED` and **the
   confirm button correctly disappeared afterwards.**
3. **The pause dialog is clear and asks for no mandatory reason** — *"Reason (optional)"*, `Cancel` /
   `Pause the course`. 🟢 **Optional, as the contract says.**
4. **The paused plan modal states its condition well** — badge **`4 OWED`**, footer *"This course is paused —
   resume it to change the schedule."*, and a **`Resume course`** button. **An admin is not left guessing.**
5. **The resume form matches the ratified contract exactly: TWO fields, `First session date` + `Time`, NO
   weekday.** Copy: *"…is re-planned from a date you choose — the remaining sessions are laid out weekly from
   there, as when the course was created."* 🟢 **Accurate, and it describes a re-plan rather than a restore.**

## 🔴🔴 DEF-2 IS STILL PRESENT THROUGH THE UI — and now there is a picture of it
**The plan modal after a button-driven pause→resume shows EIGHT rows to the admin:**
```
15/Sep/26 10:00 PENDING    03/Nov/26 17:00 CANCELLED
22/Sep/26 10:00 PENDING    10/Nov/26 17:00 CANCELLED
29/Sep/26 10:00 PENDING    17/Nov/26 17:00 CANCELLED
06/Oct/26 10:00 PENDING    24/Nov/26 17:00 CANCELLED
```
⇒ **4 → 8, identical to the API path.** **The cancelled originals sit in the plan the admin reads.**
🔴 **This is the same defect, confirmed on the release build, through the buttons, with a screenshot.**

## 🔴 NEW — the resume form's DEFAULT silently moves the course's time
**The course's own slot is `17:00`. The form pre-fills `Time: 10:00`** *(and `First session date: 15 Sep 2026`)*.
**I accepted the defaults, which is the path an admin takes**, and **every regenerated session landed at 10:00.**
⇒ **A course sold as a 17:00 Tuesday came back as a 10:00 Tuesday, and nothing warned anyone.**
📌 **The re-plan itself is the owner's ratified design and I am not questioning it. The DEFAULT is the finding**
— it defaults to a value that is not this course's, on the one field an admin is most likely to skim past.

## 🔴 NEW — the pause dialog's copy contradicts what resume now does
> *"…the remaining 4 sessions come off the schedule. **The course keeps its slot and can be resumed.**"*
🔴 **"Keeps its slot" is no longer true.** Resume asks for a new date and time and re-plans from there — **the
owner's deliberate change.** **The pause copy was not updated with it.** ⇒ **An admin is told the slot is safe
at the exact moment they decide to pause.** **@Porter owns the copy; reporting, not drafting.**

## 🔴 NEW — the promised post-resume summary DID NOT APPEAR
@Porter: *"the dialog that HOLDS OPEN after resume and states sessions put back · last session · and whether the
expiry moved."* **It did not appear.** What appeared instead, for several seconds, was the **PAUSE** dialog
re-rendered with empty data: *"Pause — for — — the remaining **0** sessions come off the schedule."*
Then everything closed and the list settled correctly (`Active 5 · Paused 0`).
⚠️ **Honest limit: my captures were at +8s and +16s.** **If the summary rendered and closed inside 8 seconds I
would have missed it** — but **the +8s capture shows the PAUSE dialog, not a summary**, so something is
mis-rendering there regardless. 🔴 **Consequence if it truly never shows: the admin has NO way to learn the new
dates** — and @Fern's *"read after, not before"* design depends entirely on that dialog existing.
📌 **The same empty-data flash appeared after PAUSE too** (*"— for — · 0 sessions"*), so it is not specific to
resume.

## Cross-check (text, not evidence for the UI claims)
`8 rows` · `card: ACTIVE, used 0, expiry 2026-12-01` · `liveEndDate 2026-10-06`.
📌 **The expiry did NOT move here** — the re-plan finished *earlier* than the old expiry, so nothing needed
moving. **Consistent with the ruling, not a contradiction of it.**

---

# Round 12 — the fix batch (288 · 289 · 290) on `sid`, UI-driven. **BOTH CHECKS PASS.** 2026-09-08 ~04:xx

**Fixture `b7dc8ace` (KKTEST · 4-session Freeskate · Ek), the same UI-path reproduction from Round 11.**

## ✅ CHECK 1 — PASS. The re-planned plan shows four rows, all `PENDING`, none at `17:00`
```
KKTEST — plan · 4-session course · Leave 0/1 · Ends 6 Oct 26
15/Sep/26 10:00 Ek Freeskate PENDING
22/Sep/26 10:00 Ek Freeskate PENDING
29/Sep/26 10:00 Ek Freeskate PENDING
06/Oct/26 10:00 Ek Freeskate PENDING          0 session(s) still owed
```
🎉 **The four `CANCELLED 17:00` rows that Round 11 screenshotted are GONE from the plan.** **DEF-2's duplication
is fixed in the view an admin reads.**

## 🎉 ✅ CHECK 2 — PASS, and it is the one that mattered
**Hand-cancelled `22/Sep` via the row `⋯` → `Cancel` → dialog *"The session is cancelled and a make-up is
re-owed — the course stays at its size."*** Result:
```
15/Sep PENDING · 22/Sep CANCELLED ← STILL LISTED · 29/Sep PENDING · 06/Oct PENDING · 10/Nov EXTENDED ← make-up
Ends 10 Nov 26
```
🟢 **The hand-cancelled row survives, a make-up was appended, and the end date moved to cover it.**
🎯 **And a second, stronger confirmation I did not plan:** after pausing again, the paused plan modal shows
**exactly ONE row — `22/Sep CANCELLED`** — with every pause-cancelled row hidden. ⇒ **the distinction the whole
ruling stands on (a DECISION is kept, a REPLACED plan is not) is visible in a single screen.**

## ✅ My Round 11 NEW 2 is FIXED — verified verbatim
> *"Pause Freeskate for KKTEST — the remaining 9 sessions come off the schedule. **Resuming re-plans the course
> from a date you choose — the time and the expiry date can move.**"*
🟢 **"Keeps its slot" is gone.** The copy now states the re-plan and that the time and expiry can move.

## 🔴 NEW — the pause dialog's COUNT is wrong, and it counts rows the admin cannot see
**That same dialog said *"the remaining 9 sessions"* while the plan in front of the admin listed FIVE rows
(and, when paused, ONE).** **Cross-checked against the database: the course has exactly 9 rows** — 3 `PENDING`,
1 hand-`CANCELLED`, **4 old pause-`CANCELLED` @17:00 from last night**, 1 `EXTENDED`.
⇒ 🔴 **The fix HIDES superseded rows; it does not remove them** — and **the dialog counts the hidden ones.**
⇒ **An admin reading "9 sessions come off" against a 5-row list has no way to reconcile the two numbers.**
📌 **The hiding itself is defensible** *(a cancelled booking is a real record, and CHECK 2 depends on some
cancelled rows staying visible)*. **The COUNT is the defect** — two surfaces, two sources, one screen apart.

## ⚠️ NOT SEEN — the post-resume summary dialog. Two attempts, and it is a HARNESS failure, not a verdict
🔴 **I could not get eyes on it, and I am not going to claim either way.** What happened:
- **Attempt 1** reached the resume form and I clicked `Resume the course` — **the session cookie expired at that
  exact moment** (the pause had landed; the modal then sat on `Loading…`). **Re-minted and carried on.**
- **Attempt 2** reached the form again — **`Resume the course` sat at y=533 in an 800×450 pane and the modal
  would not scroll to it.** I emulated `1280×900`; **the pane then rendered a zoomed fragment and screenshots
  began timing out** (*"the page did not finish rendering"*).
🟢 **Confirmed from the data that the click never landed: the course is still `DROPPED`.** **No half-finished
write.** ⇒ **`NOT_TESTED`, harness-limited.** @Porter's engineering report says the dialog now exists; **I have
not independently seen it and this line is not evidence that it does.**

## 📌 Two smaller observations
- **At a 450px-tall viewport the resume dialog's primary action falls below the fold and the modal does not
  scroll to it.** ⚠️ **450px is not a realistic admin viewport**, so I am NOT filing it — **but the dialog grew
  when the summary was added, and heights have never been checked.** *(@Fern's four checks are all widths.)*
- **The Time field's underlying value is `10:00:00`** — seconds again, in the same week as DEF-3. **Displayed
  as `10:00`, so harmless as seen; noted because of the history.**

## Footprint
🔴 **`b7dc8ace` is left `DROPPED` with all 9 rows `CANCELLED`** — the state my last (failed) resume left it in.
**Declared, not tidied.** **Say the word and I cancel the course outright.**
