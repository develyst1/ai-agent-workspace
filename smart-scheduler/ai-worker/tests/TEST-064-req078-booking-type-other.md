# TEST-064: REQ-078 — การจองลงตาราง แบบ other (อื่นๆ)
- Source REQ: REQ-078 (the owner's REQ-005)
- Status: **TEST_FAILED**
- Environments: **`sid` only** (`som.develyst.online`, the deployed build Porter confirmed). `uat` never touched.
- Tested: 2026-09-01 by Tanya

## Scope

The whole REQ-078 acceptance list as it stands in `requirements/REQ-078-booking-type-other.md` — 25 criteria
(AC-1…AC-16, AC-18…AC-25; **AC-17 was withdrawn by the REQ itself** and was not tested, correctly).

Covered here: the type exists and saves · studentless + typed title · multi-teacher · the negatives (no title,
no teacher, bad amount, both price sources) · the clash warning · cancel-with-reason · the calendar cell and its
measurement · the `0029` regression on the other four types.

**Deliberately NOT covered, each named in the table:** anything that requires the **23:30 day-end** to run
(AC-4, AC-9, and the *posting* halves of AC-5/AC-6/AC-7/AC-8/AC-21), and **anything that sends LINE** (AC-16).
Reasons are in §Not tested — they are environment and safety limits, not omissions.

## Cases

| # | Case (from AC) | Type | Steps | Expected | Actual | Result |
|---|----------------|------|-------|----------|--------|--------|
| 1 | **AC-1** the type exists | happy | Schedule → `+` on an empty cell → read the type tabs | อื่นๆ offered beside the four | Tabs are `1st Trial · 1 HR · Voucher · Other`. Selecting **Other** yields a working form and a saveable booking | **PASS** |
| 2 | **AC-2** no student + typed title | happy | Other · teacher Bank · **no student** · Title `QA-078 ประชุมทีม b8` · 09:00 → Save | saves; cell shows **that title** | Saved. Calendar cell reads `QA-078 ประชุมทีม b8` / `Other`. The typed title is the display name — the word "อื่นๆ"/"Other" is only the *type* label on its own line. Thai renders correctly | **PASS** |
| 3 | **AC-10** no student, no title | negative | Other tab, clear the title | refused, message says what is missing | Inline banner **"Please enter a title"**; `Save` is `disabled=true`. Never a silent save | **PASS** |
| 4 | **AC-19** no teacher | negative | Other tab → remove the last teacher chip | refused with a message | Banner **"Select at least one teacher."** appears and Save is disabled — **but an uncaught `TypeError` is thrown at the same moment, and the next keystroke in Title destroys the page.** See **DEF-1** | **FAIL** |
| 5 | **AC-11** bad amount — zero | negative | Charge ON → Amount `0` | refused, nothing booked | **"Please enter a valid amount"**, Save disabled | **PASS** |
| 6 | **AC-11** bad amount — negative | negative | Amount `-500` | refused | The field **rejects the input entirely** (value stays empty); message persists; Save disabled | **PASS** |
| 7 | **AC-11** bad amount — not a number | negative | Amount `abc` | refused | Same — input rejected, value empty, Save disabled | **PASS** |
| 8 | **AC-12** both price sources at once | negative | Charge ON → inspect the price controls | must not silently pick one | **Impossible by construction**: `Type an amount` / `Pick a catalogue item` is a **mutually exclusive segmented control**, not two independent inputs. Stronger than the AC's minimum | **PASS** |
| 9 | **AC-18** many teachers, one booking | happy | Other · teachers **Bank + Dewy + Ek** · title · Save | appears in all three columns, recognisable as ONE booking | Appears in **all three**. Each column names the others — Bank's cell reads `With Dewy, Ek`, Dewy's `With Bank, Ek`, Ek's `With Bank, Dewy`. Detail modal shows `Teacher: Bank, Dewy, Ek` and a single `OTHER` badge | **PASS** |
| 10 | **AC-18** cancel removes it from all three | happy | cancel that booking once | vanishes from all three columns | Cancelled once → gone from Bank, Dewy **and** Ek | **PASS** |
| 11 | **AC-13** cancel uses the REQ-074 reason path | happy | อื่นๆ → ⋮ → Cancel booking | same reason popup, reason stored | Popup identical to 1HR/Voucher: `Customer changed activity` / `Customer no longer wants it` / `Admin entered it by mistake` (`PROGRAM_CHANGED` / `CUSTOMER_CANCELLED` / `ADMIN_ERROR`) + optional note; refuses to proceed without a reason. Dialog names the booking by its typed title | **PASS** (but "queryable" is undermined — see **DEF-3**) |
| 12 | **AC-24** clash warning — **CONFIRMED** booking | negative | Camp already has Ally's **CONFIRMED** course 2026-09-08 11:00. Create อื่นๆ · Camp · 11:00 → Save | a warning **naming teacher + clashing booking**, and the admin **can continue and save anyway** | 🔴 **Hard refusal.** `This slot is already booked — Ally · Bike / Scooter / Balance Cruiser (11:00) — you can only overbook when the previous student is on leave.` Buttons are **Back / Close** only. **There is no way to continue.** The booking was not created. See **DEF-2** | **FAIL** |
| 13 | **AC-24** clash — over an **ON LEAVE** booking | edge | Camp had Ally's **ON LEAVE** session 2026-09-01 11:00. Same steps | at minimum a warning | **Saved silently — no warning of any kind.** So in the one case where overbooking *is* permitted, the admin is told nothing. Part of **DEF-2** | **FAIL** |
| 14 | **AC-25** no false alarm | negative | อื่นๆ on Bank/Dewy/Ek at a time all three are free → Save | no warning | Saved straight through, **no warning** | **PASS** |
| 15 | **AC-15** the cell is distinguishable | happy | read the calendar legend and an อื่นๆ cell | อื่นๆ visually distinct from the four paid types | Legend row now carries a fifth chip **`Other`** beside `1st Trial · 1 HR · Course · Voucher`; the อื่นๆ cell renders in its own amber token, clearly unlike the course/trial cells | **PASS** |
| 16 | **AC-15** the standing measurement rule | edge | measure the status/type legend row at 1600 / 1280 / 768 / 375 | wraps, no page h-overflow | `1600` → 1284 × 73 · `1280` → 964 × 73 · `768` → 708 × 99 (wraps) · `375` → 341 × 148 (wraps). **`document.scrollWidth === innerWidth` at every width — no page horizontal overflow**, and the `Other` chip is present at all four | **PASS** |
| 17 | **AC-20 / AC-14** the other four types still take exactly ONE teacher | regression | open 1st Trial / 1 HR / Voucher | a single teacher control, not the multi-chip picker | 1 HR and 1st Trial show a **single `Teacher` select**; Voucher states *"A voucher booking doesn't pick a teacher — this session is with Bank"*. Multi-teacher is **only** on อื่นๆ | **PASS** |
| 18 | **AC-14** the `0029` regression — a 1 HR with no student must still be refused | regression | 1 HR · teacher Bank · subject `Surfskate` · **no student** | refused | `Save` is `disabled=true` with the student empty. The contract survives `0029` dropping the DB NOT NULLs | **PASS (client only — see §Not tested)** |
| 19 | **AC-22** multi-teacher ⇒ no teacher-pay control | negative | open อื่นๆ with 3 teachers and read every control | **no** pay/earnings control offered | The form offers only `Charge for this booking` (customer charge) and `Deduct from course / voucher`. **No teacher-pay control exists in either state** — so nothing is present-and-ignored. Confirms Sober's "AC-22 needs no build" **on the running build** | **PASS (vacuously satisfied)** |
| 20 | **AC-23** single teacher unaffected | happy | same form with one teacher | whatever pay behaviour exists elsewhere is available | Identical form; no pay control in either case ⇒ nothing was taken away. Collapses with AC-22 | **PASS (vacuously satisfied)** |
| 21 | **AC-22 / Q7** the customer charge still works with several teachers | happy | อื่นๆ with 3 teachers → `Charge for this booking` | the charge toggle is still offered | Offered and expands normally. Matches the owner's Q7 answer (only *teacher pay* is withheld) | **PASS** |
| 22 | Bookings list can find an อื่นๆ booking | edge | Bookings/Students → All bookings → Type = **Other** | the อื่นๆ bookings are listed | 🔴 Counter reads **"2 found"**; the table body reads **"No bookings match the filters"** and renders **zero** rows. See **DEF-3** | **FAIL** |
| 23 | An อื่นๆ booking must not hide an existing session | edge | book อื่นๆ over Ally's ON LEAVE 11:00, then cancel it | the existing session stays visible | While mine existed, **Ally's session vanished from Camp's column**; cancelling mine **brought it back**. Data was never altered (verified `ON LEAVE` in the bookings list throughout). See **DEF-4** | **FAIL** |

## Defects

### DEF-1 — an อื่นๆ booking form is DESTROYED by removing the last teacher and then typing — BLOCKER
- **Environment:** `sid`, deployed build, 2026-09-01. Reproduced **3 of 3**.
- **Repro (from a clean state):**
  1. Log in to `sid` → Schedule.
  2. Click `+` on any empty calendar cell → **New booking** opens (Teachers is pre-filled with that row's teacher).
  3. Click the **Other** tab.
  4. Click the **×** on the teacher chip to remove the last teacher.
     → the banners `Select at least one teacher.` + `Please enter a title` appear and Save is disabled — this part
     is correct — **but an uncaught error is thrown at this moment.**
  5. Click the **Title** field and type **any single character**.
- **Expected (AC-19):** the form stays up and refuses to save until a teacher is chosen.
- **Actual:** the entire page is replaced by **"This page couldn't load / Reload to try again, or go back."**
  Everything typed is lost; only a reload recovers. Console at step 4:
  `Uncaught TypeError: Cannot read properties of null (reading 'value')`
  at `_next/static/chunks/2nykiepra7i1k.js:1:95704`.
- **Why it matters:** an admin who picks the wrong teacher and removes the chip to fix it, then carries on filling
  the form, loses the whole form. That is an ordinary correction, not a contrived path — and AC-19 is the rule the
  owner **promoted from an edge case** on 2026-08-31.
- **Evidence:** console message above; the crash screen; 3 independent runs (24 chars · 1 char · 24 chars).

### DEF-2 — the clash rule is REFUSE, but the owner ruled WARN — BLOCKER
- **Environment:** `sid`, 2026-09-01.
- **Repro A (refuses when it must warn):** Camp has Ally's **CONFIRMED** course on 2026-09-08 11:00–12:00.
  Create an อื่นๆ for **Camp** at **11:00** on **2026-09-08** → Save.
  - **Expected (AC-24):** a warning naming the teacher and the clashing booking, with **บันทึกต่อไป** so the admin
    **can save anyway**. *"It must never block the save."*
  - **Actual:** a red dialog — **"This slot is already booked · Ally · Bike / Scooter / Balance Cruiser (11:00) —
    you can only overbook when the previous student is on leave"** — with only **Back** and **Close**.
    **The booking cannot be created at all.**
- **Repro B (silent when it may proceed):** the same steps against an **ON LEAVE** session (Camp, 2026-09-01 11:00)
  **save with no warning whatsoever.**
- **Why it matters:** the owner settled this explicitly — *"เตือนพอ ไม่ห้าม"*. What shipped is the pre-existing
  slot-uniqueness rule, unchanged: it forbids exactly what he asked to allow, and stays silent in the only case it
  does allow. **AC-24 is not implemented in either direction**, and AC-25 passes only because no warning exists.
- **Evidence:** the refusal dialog; the silently-saved ON-LEAVE booking (`QA-078 clash b11`).

### DEF-3 — the Bookings list says "2 found" and shows nothing — MAJOR
- **Environment:** `sid`, 2026-09-01.
- **Repro:** Bookings / Students → **All bookings** → Status `All statuses` → Type = **Other**.
- **Expected:** the อื่นๆ bookings are listed.
- **Actual:** the counter reads **`2 found`** while the table body reads **`No bookings match the filters`** and
  renders zero rows. Verified in the DOM: `found: "2 found"`, `tbody` text `"No bookings match the filters"`.
  The two are my studentless อื่นๆ bookings; the row renderer appears to require a student.
- **Why it matters:** All-bookings is the audit surface. **The central new object of this REQ cannot be reviewed,
  found, or exported there** — and it makes AC-13's *"stored and **queryable**"* untrue in the product, even though
  the reason is captured. A studentless booking is also unreachable by the student-name search, so there is no
  other route to it.

### DEF-4 — an อื่นๆ booking hides an existing session on the calendar — MAJOR
- **Environment:** `sid`, 2026-09-01.
- **Repro:** Camp, 2026-09-01 11:00, already showing Ally's `Course · Bike / Scooter / Balance Cruiser`
  (status **ON LEAVE**). Create an อื่นๆ for Camp at the same date and time (this saves — see DEF-2 repro B).
- **Expected:** both are visible, or at minimum the existing one is not lost from the view.
- **Actual:** Ally's session **disappears from Camp's column** — not overlapped, absent from the rendered DOM.
  Cancelling my อื่นๆ **restores it**.
- **Data is intact:** Ally's 01/Sep 11:00 row stayed `ON LEAVE` in the bookings list the whole time. **This is a
  display fault, not data loss** — stated plainly so nobody escalates it as the latter.
- **Why it matters:** combined with DEF-2's silent save, a booking can be placed over a real session and the real
  session then vanishes from the screen staff plan from.

### DEF-5 — the same uncaught error kills the page during ordinary editing — MAJOR, intermittent
- **Environment:** `sid`, 2026-09-01. **Observed twice more** in ~20 minutes of using the อื่นๆ form, on paths
  unrelated to DEF-1: once right after toggling `Charge for this booking`, once when typing in Title with the
  charge block open.
- 🔴 **I could not reduce these two to a reliable repro** — I retried both deliberately and they did not recur.
  I am reporting them as **intermittent and unproven**, not as a second reproducible defect, because a repro I
  cannot give an engineer is not a repro.
- **The lead worth following:** it is the **same** uncaught `TypeError: Cannot read properties of null (reading
  'value')` as DEF-1. Fixing DEF-1's null read may well fix these; whoever takes DEF-1 should check whether that
  handler can fire from the charge/title paths too.

## Not tested — and exactly why

| AC | Why it was not run |
|---|---|
| **AC-4 · AC-9** (free ⇒ nothing posted · unmarked ⇒ auto-attends at 23:30) | Both need the **23:30 day-end job** to run. I cannot make it run, and waiting for it means leaving fixtures on `sid` overnight — the thing Porter explicitly warned against. `NOT_TESTED`. |
| **AC-5 · AC-6** (typed amount posts exactly · catalogue item posts at its own price) | The **form halves are verified** (amount accepted with a VAT-included note; both price sources present and mutually exclusive). The **posting halves cannot be observed without letting a real `bo.movement` be written on `sid`, and there is no reversal I can run.** Porter's guidance was "small amount, cancel the same day" — but cancelling before day-end means nothing posts, so the posted amount is still never seen. **These two need either the owner's agreement to leave a real movement, or a backoffice read after a day-end.** `NOT_TESTED`. |
| **AC-7 · AC-8** (consumes / does not consume an entitlement) | The `Deduct from course / voucher` toggle exists and is off by default. Proving the deduction needs an **attended** session against a real course quota, i.e. day-end again, plus a student's quota I would be spending. `NOT_TESTED`. |
| **AC-21** (freelance budget byte-identical) | Needs a **freelance** teacher and an attended อื่นๆ — day-end again. On a full-timer the AC proves nothing, as Porter said. `NOT_TESTED`. |
| **AC-16** (every assigned teacher gets the LINE confirmation, named by the typed title) | 🔴 **Forbidden right now.** Porter's own standing instruction, 2026-09-01: *"Until he answers, nobody fires an outbound LINE test from `sid`"* — because `sid` may share `uat`'s LINE channel and **2 real teachers are linked**. `Confirm + LINE` was never pressed. This is the single highest-value untested item in the REQ and it needs the owner's channel answer first. `NOT_TESTED`. |
| **AC-3** (อื่นๆ **with** a student appears on that child's record) | Not run — I spent the round on the crash and the clash. Honest gap, no blocker behind it. `NOT_TESTED`. |
| **AC-14** API half | I proved the **client** still refuses a studentless 1 HR. I did **not** POST directly to the API, which would mean handling a session token — outside what I will do. So the `0029` regression is proven at the UI, not at the endpoint. |

## Test data created

| What | Where | Removed? |
|------|-------|----------|
| อื่นๆ booking `QA-078 ประชุมทีม b8` — teachers **Bank + Dewy + Ek**, 2026-09-02 09:00–10:00, no student, charge OFF | `sid` | ✅ **CANCELLED** (`ADMIN_ERROR`, note "QA cleanup - REQ-078 b8"). Confirmed gone from all three teacher columns |
| อื่นๆ booking `QA-078 clash b11` — teacher **Camp**, 2026-09-01 11:00–12:00, no student, charge OFF | `sid` | ✅ **CANCELLED** (`ADMIN_ERROR`, note "QA cleanup - REQ-078 b11"). Confirmed gone from the calendar, and Ally's session reappeared |
| ⚠️ **Cleanup could not be re-verified in the bookings list** — Type=Other renders no rows (**DEF-3**). Both cancels were confirmed on the calendar and in the cancel dialog instead | `sid` | ⚠️ verified by a different route, stated rather than glossed |
| อื่นๆ on Camp 2026-09-08 11:00 (`QA-078 clash CONFIRMED b12`) | — | ✅ **never created** — refused by DEF-2's dialog before any write |
| อื่นๆ with a charge (`QA-078 charged b14`) | — | ✅ **never created** — the page crashed before Save both times it was attempted (DEF-5) |
| Money | — | ✅ **no `bo.movement` written.** Every fixture was created with `Charge for this booking` **OFF**, nothing was confirmed or marked ATTENDED, and both were cancelled well before the 23:30 day-end |
| LINE | — | ✅ **no message sent.** `Confirm + LINE` was never pressed on any booking |
| Other people's data | — | ✅ **untouched.** Ally's and Aileen's sessions were read only; Ally's `ON LEAVE` status was the same before and after (DEF-4 is a display fault, and I verified the row in the bookings list) |
| Settings / server | — | ✅ nothing changed, no script run, no restart, no redeploy |
| `uat` | — | ✅ **no contact of any kind** |

## Verdict

**`TEST_FAILED`** — REQ-078 must not go to `uat`.

**Two blockers:**
1. **DEF-1** — the form destroys the page on an ordinary correction (remove the last teacher, keep typing).
   Deterministic, 3 of 3, with the exact console error to work from.
2. **DEF-2** — **AC-24 is the opposite of what the owner decided.** He ruled *"เตือนพอ ไม่ห้าม"* (warn, don't
   forbid); the build **forbids** the clash it should warn about, and is **silent** in the only case it allows.

**Two more that should not ship either:** **DEF-3** (the new booking type is invisible in the bookings list, which
also makes AC-13's "queryable" untrue) and **DEF-4** (an อื่นๆ hides a real session on the calendar).

**What genuinely works, and is worth saying:** the type, the studentless typed title, **multi-teacher — which is
the new capability and it is well built** (three columns, each naming the others, one booking, one cancel clears
all three), every input negative except the teacher one, the REQ-074 cancel path, the calendar token, and the
responsive measurements at all four widths.

**Nine criteria are `NOT_TESTED`** (AC-3 · 4 · 5 · 6 · 7 · 8 · 9 · 16 · 21). **Do not read this verdict as
"four defects away from done"** — every money criterion in this REQ is still unverified, and **AC-16 (the LINE
message) is blocked on the owner's channel answer**, not on effort.

## Questions

(For Porter; he answers as `> answer: ...`)

1. **DEF-2 is a requirement conflict, not just a bug — please confirm which rule stands.** The build enforces the
   old *"you can only overbook when the previous student is on leave"*. AC-24 says warn and allow, always. If the
   owner's ruling stands, the existing slot guard has to be relaxed for อื่นๆ, which is a bigger change than a
   warning dialog — worth him hearing before it is cut as a task.
   > answer: _pending_

2. **AC-5 / AC-6 need a decision about money on `sid`, not more testing effort.** The posted amount can only be
   seen after a real `bo.movement` exists, and I cannot reverse one. Options: (a) the owner accepts one small
   movement on `sid` and I let a ฿20 อื่นๆ post overnight, then he reverses it in the backoffice; (b) he reads the
   backoffice figure after any day-end and reports it; (c) they stay `NOT_TESTED` into `uat`. **My recommendation
   is (a)** — an unverified money path is the worst of the three, and ฿20 on `sid` is the cheapest way to close it.
   > answer: _pending_

3. **AC-16 stays blocked until the LINE channel question is answered.** You recorded it yourself: if `sid` shares
   `uat`'s channel, an outbound test messages 2 real teachers. The moment he confirms an isolated channel — or
   gives me a recipient that is only him — this is a 10-minute check and it is the one thing in REQ-078 nobody
   has ever seen work.
   > answer: _pending_

4. **Is a studentless booking meant to be findable anywhere?** DEF-3 aside, the All-bookings page is organised
   around a student. Even once the rendering is fixed, staff will look for *"the team meeting on Tuesday"*, not for
   a child. If searching by **title** is expected, that is a requirement gap rather than a defect, and better
   raised now than after the customer asks.
   > answer: _pending_

---

## Round 2 — 2026-09-01 (later): the owner-approved ฿20 overnight money run is SET UP

Porter relayed the owner's approval of my Q2 recommendation: **one อื่นๆ with a typed ฿20, charge ON, left to
post at the 23:30 day-end on `sid`, and the owner reverses the movement in the backoffice afterwards.**
That residue is planned, named here, and reversed by the one person who can. Two fixtures are now live.

### Fixtures deliberately LEFT IN PLACE overnight (this is the point of them)

| Fixture | What | Booking id | Purpose |
|---|---|---|---|
| **F1** | อื่นๆ · teacher **Bank** · **2026-09-01 14:00–15:00** · no student · **Charge ON, typed ฿20** · Deduct OFF · title `QA-078 F1 money test 20B` · left **PENDING/unmarked** | **`4014e65e-72f2-4fba-b9f2-788c8f76cd22`** ⇒ the sale's key will be **`rev:4014e65e-72f2-4fba-b9f2-788c8f76cd22`** | **AC-5** (posted amount == typed amount) · **AC-9** (unmarked ⇒ auto-attends at 23:30) |
| **F2** | อื่นๆ · teacher **Dewy** · **2026-09-01 13:00–14:00** · no student · **Charge OFF** · Deduct OFF · title `QA-078 F2 free control` · left **PENDING/unmarked** | **`25d695c3-3ace-4b8d-9689-4c49d75d1a55`** | **AC-4** (free ⇒ **nothing** posted) · **AC-9** · the control that makes F1's result mean something |

Both were created through the UI, both returned **HTTP 201**, both render on the calendar as `Other` with the
typed title. **Neither was confirmed and `Confirm + LINE` was not pressed on either.**

### What must be checked tomorrow, and by whom
1. **Both become `ATTENDED`** without anyone touching them ⇒ **AC-9**.
2. **F1 posts exactly ฿20** — `rev:4014e65e-…` — and **F2 posts nothing at all** ⇒ **AC-5** + **AC-4**.
   ⚠️ **I cannot read this myself**: the backoffice (`backoffice-som.develyst.online`) is not in my access file.
   Either the owner reads the movement and reports the number, or Porter gets me backoffice read access.
3. **The owner then reverses `rev:4014e65e-…`** and confirms it, closing the residue.

⚠️ **Timing caveat, stated rather than assumed:** I do not know the server clock's time-of-day. If tonight's
23:30 pass has already run when these were created, they simply carry to the **next** night. Nothing is lost
either way — the fixtures stay valid until the job sees them.

### 🔴 New observation from setting this up — OBS-3: the charged amount is WRITE-ONLY

**MAJOR, and it makes AC-5 hard to trust even once it posts.**
After saving, **the typed ฿20 cannot be read back anywhere in the product**:
- the booking detail modal shows Teacher / Date / Time / Badge — **no amount**;
- the `POST /api/bookings` **201 response carries no price field at all** (`discount: null`, no amount, no item)
  — F1 (charged ฿20) and F2 (free) come back **structurally identical**.

⇒ An admin who types an amount can never check it, correct it, or even tell a charged อื่นๆ from a free one
before 23:30 turns it into money. Combined with Porter's own warning that this type posts **with no ceiling**,
a typo of `2000` instead of `20` is invisible until it is in the books. **Not a blocker against a written AC,
but it is the practical risk those ACs exist to protect against**, and it should be settled before `uat`.

### ACs I now know I CANNOT close, with the exact reason and the exact thing needed

| AC | Blocker found today | What would unblock it |
|---|---|---|
| **AC-21** (freelance budget unchanged) | 🔴 **All 10 freelance teachers on `sid` read `฿0/h`, `SET PAY BEFORE BOOKING`, `This month's income ฿0 · 0 h`.** None has a pay rate or budget, and the screen states a freelancer cannot be booked before pay is set. Setting one would mean **modifying a teacher row I did not create** — forbidden. A 0 → 0 comparison would prove nothing anyway. | The **owner** sets a pay rate + budget on **one** freelance teacher on `sid` and names it; I run the AC in ten minutes. |
| **AC-7 / AC-8** (consumes / does not consume) | No **QA-owned** student has an active course or voucher — the `Courses + leave` Active list is nine **real** customers and no `QA-*`. Deducting from a real family's quota is forbidden; creating a course for myself writes a **course sale** far larger than the sanctioned ฿20. | Either the owner sanctions **one** QA course on `sid` (reversed like the ฿20), or he points me at a disposable course that already exists. |
| **AC-6** (catalogue item price) | Deliberately **not** run tonight. The owner approved **฿20**; a catalogue item posts **its own** price, which I was not authorised to spend and which is likely far more. | One line from the owner: "run it, same deal" — I will name the cheapest item and the expected amount **before** running it — or a second night after the ฿20 result is in. **I did not assume the approval stretched to it.** |
| **AC-16** (the rendered LINE) | **Held by Porter's own instruction** — the owner is linking **himself** as the test teacher; I wait for Porter's line confirming the link is live before pressing `Confirm + LINE` on anything. | Porter's confirmation. Then it is a 10-minute check. |

### Footprint delta for this round

| What | Where | Removed? |
|---|---|---|
| **F1** `QA-078 F1 money test 20B` — `4014e65e-72f2-4fba-b9f2-788c8f76cd22`, charge **฿20** | `sid` | ⏳ **DELIBERATELY LEFT** to post at 23:30 — **owner-approved residue**. Expected `bo.movement` key `rev:4014e65e-72f2-4fba-b9f2-788c8f76cd22`, **to be reversed by the owner**. Not closed until he confirms the reversal. |
| **F2** `QA-078 F2 free control` — `25d695c3-3ace-4b8d-9689-4c49d75d1a55`, charge **OFF** | `sid` | ⏳ **DELIBERATELY LEFT** to auto-attend. **Must post nothing.** I cancel it once AC-4/AC-9 are read. |
| No student/parent created · no teacher row touched · no LINE sent · no setting changed · `uat` never contacted | — | ✅ |

**Verdict unchanged: `TEST_FAILED`.** The two blockers (DEF-1, DEF-2) are with @Sober and are untouched by this
run. This round only converts four `NOT_TESTED` money criteria into "observable tomorrow".

## Questions (round 2, for Porter)

5. **Who reads the money tomorrow?** I have no backoffice access (`sm-test-access.txt` covers the frontoffice
   only). Either the owner reports what `rev:4014e65e-…` posted, or I get read access to
   `backoffice-som.develyst.online`. **Without one of those, AC-5 stays `NOT_TESTED` even after the job runs** —
   the booking flipping to ATTENDED only proves AC-9.
   > answer: _pending_

6. **AC-21 needs one freelance teacher with a pay rate on `sid`** (all ten are ฿0/h and unbookable). Which one may
   he set up? I will not touch a teacher row myself.
   > answer: _pending_

7. **AC-7/AC-8 need one disposable course** on a QA-owned student, or his sanction to create one (it writes a
   course sale, much bigger than ฿20). Which?
   > answer: _pending_

8. **Does the ฿20 approval extend to AC-6's catalogue item?** It posts the item's own price, not ฿20. I held it
   rather than assume. If yes, I will name the item and the expected amount **before** running it.
   > answer: _pending_

9. **OBS-3 — should the charged amount be visible after saving?** Right now it is write-only, so a ฿2,000 typo is
   undetectable until it is in the books. That reads like a requirement gap in REQ-078 rather than a defect
   against a written AC — your call, but worth settling before `uat`.
   > answer: _pending_

---

## Round 3 — 2026-09-01: **AC-16 fired.** The send path works; the *content* verdict is not mine to give yet.

Porter confirmed the owner is linked on `sid` as teacher **Bank**, and released AC-16. Two fixtures created and
**confirmed with `Confirm + LINE`** — the first outbound LINE this project has deliberately sent in testing.

| Fixture | What | Booking id | Result of the confirm |
|---|---|---|---|
| **F3** — single teacher | อื่นๆ · **Bank** (= the owner) · 2026-09-02 **09:00** · no student · charge **OFF** · title **`ประชุมทีม QA-078 F3`** | **`94db6903-5470-42b1-a980-1ff3cf0d3ebd`** | `PATCH …/status` → **200**, `status: CONFIRMED`, **`notification: {"channel":"line","status":"queued"}`** |
| **F4** — multi-teacher | อื่นๆ · **Bank + Dewy** · 2026-09-02 **10:00** · no student · charge **OFF** · title **`ประชุมทีม QA-078 F4 หลายครู`** | **`4357f125-1028-429b-944e-2203c25e704b`** | `PATCH …/status` → **200**, `status: CONFIRMED`, **`notification: {"channel":"line","status":"queued"}`** |

Both API responses carry `title` **and** `displayName` = the **admin's typed Thai title**, never "อื่นๆ"/"Other",
and F4's `teachers[]` correctly holds **both** Bank and Dewy.

### 🔴 AC-16 is **NOT** passed yet — and I will not mark it so
What I proved: the confirm reaches the server, the booking becomes `CONFIRMED`, a LINE notification is **queued**
for it, and the payload the message is built from carries the right title. **What AC-16 actually asks is what the
message says on a phone**, and I cannot see the owner's phone. ⚠️ Note also that the field reads
**`"status":"queued"` — not `sent`** — so a queued-then-failed push would look identical from here. **Only the
device settles it.** ⇒ **AC-16 stays `NOT_TESTED` until the owner reports the two messages.**

**What I need from him (Porter to relay) — the whole of AC-16 turns on it:**
1. For **F3**: is the message named **`ประชุมทีม QA-078 F3`**? (never the word "อื่นๆ"/"Other", never a blank
   label where a student name would go, per TASK-219's rule)
2. For **F4**: same question for **`ประชุมทีม QA-078 F4 หลายครู`** — **and did he receive it at all**, given it is
   a two-teacher booking?
3. Ideally a screenshot of each into `../project-docs/`; the exact text pasted is enough.

### 🔴 DEF-6 — the confirm dialog names only ONE teacher on a multi-teacher booking — MAJOR
- **Repro:** create an อื่นๆ with **Bank + Dewy** → `Confirm + LINE`.
- **Expected (AC-16 revised):** the admin is told that **each assigned teacher** will be messaged.
- **Actual:** the dialog reads **"Confirm this booking? — Bank will be sent the schedule on LINE."**
  **Only the first teacher is named.** Dewy is not mentioned anywhere, though the booking carries her.
- **Why it matters:** the admin is deciding *who gets messaged*. On a three-teacher meeting this sentence tells
  them one name — so it either under-reports a send that does reach everyone (misleading), or accurately reports
  that only one teacher is messaged (**an AC-16 failure**). **Both readings are bad, and the dialog is the only
  thing the admin sees.** Which one it is cannot be settled from the UI — see the limit below.

### 🔴 A limit I cannot design around: ONE linked recipient cannot prove "every teacher"
AC-16 revised says **each** assigned teacher receives the message. On `sid` exactly **one** teacher (Bank = the
owner) has a LINE link. Dewy has none, so "did Dewy get it?" is unobservable — nothing to observe on.
Two pieces of evidence point the wrong way and neither is conclusive:
- the confirm dialog names only Bank (**DEF-6**), and
- the API returns a **single** `notification` object for a two-teacher booking, not one per teacher.

⇒ **The multi-teacher half of AC-16 cannot be closed with the current setup.** It needs a **second** linked
recipient — a second phone the owner controls, or a teacher he is willing to link temporarily. **I am flagging
this rather than passing AC-16 on the single-teacher result**, because "Bank got his message" says nothing about
whether Dewy would have got hers.

### Footprint delta

| What | Where | Removed? |
|---|---|---|
| **F3** `ประชุมทีม QA-078 F3` — `94db6903-5470-42b1-a980-1ff3cf0d3ebd` · **CONFIRMED**, charge OFF | `sid` | ⏳ left in place until the owner reads the message. **Charge OFF ⇒ it will auto-attend at 23:30 and post nothing.** I cancel it once AC-16 is settled. |
| **F4** `ประชุมทีม QA-078 F4 หลายครู` — `4357f125-1028-429b-944e-2203c25e704b` · **CONFIRMED**, charge OFF | `sid` | ⏳ same. |
| **2 LINE messages sent — to the OWNER only** (teacher Bank), under Porter's explicit release | owner's phone | n/a — deliberate, sanctioned, and the point of the test |
| **The 2 real teachers on the shared channel** | — | ✅ **never messaged.** Every fixture used Bank (the owner) and Dewy (a `sid` fixture with no LINE link). |
| Money · students · teacher rows · settings · `uat` | — | ✅ untouched. Charge OFF on both; nothing created beyond the two bookings. |

⚠️ **When I cancel F3/F4, that may itself push a LINE to the owner.** That is acceptable — it is him — and I will
report whatever arrives, since a cancel notification on an อื่นๆ is worth knowing about too.

## Questions (round 3, for Porter)

10. **The two message texts** — F3 and F4 — from the owner's phone. Without them **AC-16 stays `NOT_TESTED`**;
    with them it closes in minutes. (Text pasted is enough; a screenshot into `../project-docs/` is better.)
    > answer: _pending_

11. **DEF-6 needs the owner's intent, not just a code fix.** Is a multi-teacher อื่นๆ meant to message **every**
    assigned teacher (then the dialog is wrong and must list them all), or only the primary one (then **AC-16
    revised is wrong** and the REQ needs correcting)? I can test either once it is decided.
    > answer: _pending_

12. **AC-16's multi-teacher half needs a SECOND linked recipient.** One phone cannot prove "each teacher gets it".
    Can the owner link a second device, or temporarily link one more `sid` fixture teacher? Otherwise that half
    ships unverified and I will say so in the verdict.
    > answer: _pending_

---

# Round 4 — 2026-09-02: the final round on the defect build. **VERDICT: `TEST_FAILED` (narrowly).**

Porter released the final round after the owner deployed **TASK-236 · 237 · 238 · 239 · 241** on `sid` (code-only;
`0029` was already applied and witnessed). Scope was his: the two crash paths · `SICK_LEAVE` vs an additional
teacher · DEF-3's list · DEF-6's dialog · the two owner queries.

## Results

| # | What | Expected | Actual | Result |
|---|---|---|---|---|
| R1 | **DEF-1** — remove the last teacher chip, then type in Title | form survives, refuses to save | **Form survives.** Both banners render (`Select at least one teacher.` + `Please enter a title`), Save disabled, and **no `TypeError` in the console** — the only console entry is a `401` from my own earlier `fetch` probe, unrelated. Repeated through several add/remove/type cycles | ✅ **FIXED** |
| R2 | **DEF-5** — toggle `Charge for this booking`, then type in Title | no crash | **No crash**, through toggle-on → type → toggle-off → type → re-open the teacher picker. The charge block expands and collapses cleanly | ✅ **FIXED** |
| R3 | **DEF-3** — `All bookings` → Type = **Other** | the rows it counts are rendered | **`6 found` → 6 rows rendered.** Studentless อื่นๆ rows show the **typed title** in the STUDENT column, `—` for subject, and **every** teacher in TEACHER (`Bank, Dewy, Ek`). The count and the table finally agree | ✅ **FIXED** |
| R4 | **DEF-6** — the confirm dialog on a multi-teacher booking | every assigned teacher named + Fern's count | **`The schedule will be sent on LINE to 3 teachers: Bank, Camp, Dewy`** — all three named **and** the count line Porter kept over Sober's objection. On the earlier build this said only *"Bank will be sent…"* | ✅ **FIXED** |
| R5 | **TASK-239** — `SICK_LEAVE`/on-leave must NOT refuse an additional teacher (UC-004) | the overbook saves | อื่นๆ · **Dewy + Ek** · 2026-09-03 10:00, over Dewy's **on-leave** course session → **saved, no refusal.** The new additional-teacher guard is **not** too wide | ✅ **PASS** |
| R6 | **AC-24 revised / TASK-238** — the refusal must name **the teacher** and the clashing booking | `ครู{ชื่อ} มีคาบสอนช่วงเวลานี้อยู่แล้ว ({ชื่อคาบ} {เวลา}) กรุณาเลือกเวลาอื่น` | **Partially.** Thai refusal reads **`ช่วงนี้มีการจองอยู่แล้ว` / `Ally · Bike / Scooter / Balance Cruiser (11:00) — จองทับได้เฉพาะกรณีที่นักเรียนคนเดิมลาเท่านั้น`**. It names the **clashing booking** ✅ but **never the teacher** ❌ | ⚠️ **PARTIAL — DEF-7** |
| R7 | **DEF-4** — must an อื่นๆ no longer hide an existing session? | unreachable now that the form refuses overlap | 🔴 **STILL REACHABLE.** See **DEF-4 (reopened)** | ❌ **NOT FIXED** |
| R8 | **AC-9 / AC-4 / AC-5** — the overnight day-end | F1/F2 auto-attend; F1 posts ฿20, F2 posts nothing | 🔴 **F1 and F2 are both still `PENDING`** the next day (2026-09-02). The 23:30 pass did not attend them | ⏳ **UNRESOLVED — see below** |
| R9 | The Thai wording table (REQ-078 §User-facing wording) | the eight strings as written | **All match**, verbatim: type tab **อื่นๆ** · **ครู** · **นักเรียน (ไม่บังคับ)** · **ชื่อรายการ** · placeholder **เช่น ประชุมทีม, ปิดปรับปรุงลาน** · **คิดเงินรายการนี้** · **ตัดสิทธิ์จากคอร์ส / Voucher** · error **กรุณาระบุชื่อรายการ** | ✅ **PASS** |

## 🔴 DEF-4 — REOPENED. The deferral's premise is disproven. — MAJOR

The plan was: *the form now refuses overlap, so DEF-4's hidden-session state is unreachable; @Sober confirms no
other path can create it.* **There is another path, and it is the one the product deliberately allows.**

- **Repro (from a clean state):** Dewy has an **on-leave** course session — `Aileen · Inline Skate`, 2026-09-03
  10:00. Create an อื่นๆ · **Dewy + Ek** · same date · **10:00** → it **saves** (correctly — R5/UC-004).
- **Then:** `Aileen · Inline Skate` **disappears from Dewy's column entirely.** Not overlapped — **absent from
  the rendered DOM** (verified by reading `innerText`: no `Aileen … Inline Skate` anywhere in the grid).
- **Proof it is a display fault and the data is fine:** I cancelled my อื่นๆ, reloaded, and
  **`10:00 Aileen · คอร์ส · Inline Skate` came straight back.** Nothing was ever lost.
- **Why it still matters:** on-leave overbooking is the *sanctioned* path, so this is not an edge case — it is
  what that feature is for. Staff book a meeting into a slot and the record of a child being on leave that slot
  **vanishes from the screen they plan from.**
- **What genuinely improved:** the state is now confined to the **on-leave overbook** case. It can no longer be
  reached over an active booking, because the form refuses that. **That is a real narrowing** and it is why I
  flag this as MAJOR rather than a blocker of the old kind.

## ⚠️ DEF-7 (new) — the clash refusal never says WHICH teacher — MINOR–MAJOR

- **Repro:** อื่นๆ · **Camp + Dewy** · 2026-09-08 11:00, where **only Camp** clashes (Ally's confirmed course).
- **Actual:** the message is **byte-identical** to the single-teacher case — it names Ally's booking, never Camp.
- **Why it is not pedantic:** อื่นๆ is **the multi-teacher type**. Assign five teachers to a meeting, hit the
  refusal, and the admin has to work out which one by elimination. AC-24 revised leads with `ครู{ชื่อ}` for
  exactly this reason, and Porter's own principle from the count line applies — *a message that cannot identify
  the culprit is one nobody can act on.*
- 📌 The rest of AC-24 revised **is** met: it names the clashing booking, and it is not a generic error.

## ⏳ R8 — the day-end did not attend F1/F2, and I cannot tell you why

**Observation:** F1 (`4014e65e…`, ฿20) and F2 (`25d695c3…`, free), both **2026-09-01**, both left unmarked, are
**still `PENDING` on 2026-09-02**. AC-9 says an unmarked อื่นๆ becomes `ATTENDED` at 23:30.

🔴 **I am not calling this a defect, because three readings fit and I cannot separate them from the UI:**
1. the 23:30 job did not run on `sid` last night (environmental — nothing to do with อื่นๆ);
2. the job runs but only promotes `CONFIRMED` → `ATTENDED` and leaves `PENDING` alone — in which case อื่นๆ
   behaves *"the same as every other type"* and **AC-9 is satisfied**, and my fixtures were simply the wrong shape;
3. อื่นๆ is genuinely skipped by the job — **a real defect**.
**Reading 2 is entirely plausible and would make this a mistake in my fixture design, not a product fault.**
⇒ **AC-4 · AC-5 · AC-9 remain `NOT_TESTED`.** They resolve the moment the owner runs the two queries — and if
the movement query returns nothing, that is consistent with all three readings, so **the `job_runs` row for last
night is the thing that actually separates them.**

## Verdict

# `TEST_FAILED` — but narrowly, and the shape has changed completely.

**Everything the defect round set out to fix, it fixed.** DEF-1, DEF-5, DEF-3 and DEF-6 are all genuinely gone
from the running product, and TASK-239's guard is correctly scoped. The Thai wording is exact. Multi-teacher —
the actual new capability — works well.

**What stops a pass, and it is only these:**
1. 🔴 **DEF-4 is still reachable** through the on-leave overbook path, and the premise on which it was deferred
   (*"no other path can create it"*) is **disproven**. A real session disappears from the calendar.
2. ⚠️ **DEF-7** — the clash refusal cannot say which teacher, on the one booking type that has several.
3. ⏳ **Every money/day-end AC is still unproven** (AC-4 · 5 · 9), plus the accepted gaps.

📌 **A judgement Porter should overrule if he wants to:** DEF-4 is now confined to one sanctioned path and is a
**display** fault with the data provably intact. **He and the owner may reasonably accept it as a named gap and
ship.** I am not making that call by rounding my verdict up — but I am saying plainly that this build is close,
and that the distance is one rendering bug and one missing name, not a broken feature.

## 🅿️ PARK NOTE — REQ-078, every AC's final state

**Passing on the running `sid` build (18):** AC-1 · AC-2 · AC-10 · AC-11 · AC-12 · AC-13 · AC-14 · AC-15
(incl. the 1600/1280/768/375 measurement) · AC-18 · AC-19 · AC-20 · AC-22 · AC-23 · AC-25 · the Thai wording
table · DEF-1 · DEF-3 · DEF-6 fixes.

**Not passing (2):** **AC-24** partial (DEF-7 — teacher not named) · **DEF-4** reopened (not an AC, a defect).

**`NOT_TESTED` — named gaps, NOT passes (7):**
| AC | Why | Who unblocks it |
|---|---|---|
| **AC-4 · AC-5 · AC-9** | the day-end did not attend F1/F2; no backoffice access to read a movement | owner: the two queries + last night's `job_runs` row |
| **AC-6** | catalogue-item charge — outside the ฿20 approval; posts its own price | owner: one line of approval (accepted gap, Porter) |
| **AC-7 · AC-8** | no QA-owned course/voucher exists to deduct from; a real family's quota is off-limits | owner: one disposable course (accepted gap, Porter) |
| **AC-16** | the send fires and queues (`notification {line, queued}`) and the dialog now names everyone — but **only one recipient is linked**, so *"every assigned teacher receives it"* is unprovable, and nobody has read the message text back to me | owner: the message text + a **second** linked recipient |
| **AC-21** | all 10 `sid` freelancers are `฿0/h · SET PAY BEFORE BOOKING`; setting one is editing a row I did not create | owner: pay + budget on one freelancer (accepted gap, Porter) |
| **AC-17** | **withdrawn by the REQ itself** — correctly never tested | — |

### 🔴 Live QA fixtures on `sid` — ids, and who retires each

| id | what | disposal |
|---|---|---|
| `4014e65e-72f2-4fba-b9f2-788c8f76cd22` | **F1** ฿20 charged, 2026-09-01 14:00, **PENDING** | **owner** reverses `rev:4014e65e-…` **if** it ever posts; then Tanya cancels. **Do not cancel before the movement question is settled** — it is the only ฿20 evidence. |
| `25d695c3-3ace-4b8d-9689-4c49d75d1a55` | **F2** free control, 2026-09-01 13:00, **PENDING** | Tanya cancels once AC-4/AC-9 are read. Posts nothing. |
| `94db6903-5470-42b1-a980-1ff3cf0d3ebd` | **F3** LINE single-teacher, 2026-09-02 09:00, **CONFIRMED** | Tanya cancels once the owner reports the message text. |
| `4357f125-1028-429b-944e-2203c25e704b` | **F4** LINE multi-teacher, 2026-09-02 10:00, **CONFIRMED** | as F3. |
| `56fa6ee3-43a1-4dd3-bfaa-390b0fac71a2` | **R4a** `QA-078 R4 crash retest XYZ2`, Bank+Camp+Dewy, 2026-09-03 09:00, **CONFIRMED** | Tanya — purpose served, retire whenever. |
| — | **R4b** `QA-078 R4 leave-overbook`, Dewy+Ek, 2026-09-03 10:00 | ✅ **already CANCELLED** (`ADMIN_ERROR`, note "QA cleanup R4 leave-overbook") |
| — | two clash attempts (2026-09-08 11:00) | ✅ **never created** — refused before any write |

⚠️ **Why I did not cancel the rest today, stated so it is a decision and not neglect:** F3/F4/R4a are
**CONFIRMED**, and cancelling a confirmed booking may push a LINE **to the owner's own phone** (he is teacher
Bank). Retiring three of them would spray his phone with cancellation notices for no test value while he is
mid-way through reading the two messages. **The "never message a real person unnecessarily" rule outranks tidy
housekeeping here.** If Porter would rather have them gone now, say so and I will retire them in one pass.

### 🥇 The ONE thing a fresh session does first
**Read `log/2026-09-02.md` and this file's §Round 4, then ask Porter for the owner's two query results**
(the `bo.movement` for `rev:4014e65e-…`, and last night's `job_runs` row). **Everything still open on REQ-078
funnels into those two answers plus the DEF-4 decision** — do not re-run any of the passing cases.

## Questions (round 4, for Porter)

13. **DEF-4 is your call and the owner's.** It is now confined to the on-leave overbook path and the data is
    provably intact. **Accept it as a named gap and ship, or hold?** I have deliberately not decided that by
    softening the verdict.
    > answer: _pending_

14. **DEF-7 — worth a line, or park it?** One FE string (`ครู{ชื่อ}` in the refusal). It only bites on
    multi-teacher bookings, which is exactly what อื่นๆ is for.
    > answer: _pending_

15. **AC-9 needs last night's `job_runs` row, not another test from me.** If the 23:30 pass simply did not run,
    my F1/F2 fixtures are still valid and tonight settles it. **If it did run, please also tell me whether it
    promotes `PENDING` bookings at all** — if it only touches `CONFIRMED`, AC-9 is satisfied and my fixtures
    were the wrong shape, which is my error to own.
    > answer: _pending_

16. **Do you want F3/F4/R4a retired now**, accepting that the owner may get cancellation LINEs, or left until he
    has read the two messages?
    > answer: _pending_

---

# Round 5 — 2026-09-05: the ฿20 money round, **in the right fixture shape this time**

Porter released it (`inbox/QA.md`) once two facts landed that I had been reasoning without:

| I had assumed | The fact |
|---|---|
| the day-end runs at **23:30** | 🔴 **18:30** — owner closed `C-03`. My Round-4 reasoning was built on Porter's stale number |
| the day-end might skip `OTHER` | @Sober's source read: the auto-attend select has **no `bookingType` filter**, and the revenue select names **`OTHER` explicitly** ⇒ an อื่นๆ **is** swept and it **does** post |
| a `PENDING` fixture would be swept | 🔴 **The day-end selects `CONFIRMED` only — a `PENDING` row sits forever.** |

📌 **That last line is the answer to my own open AC-9 question, and it lands on me, not the product.** In
`TEST-064` §Round 4 I recorded F1/F2 sitting `PENDING` overnight and offered three readings, one of which was
*"the job only promotes CONFIRMED ⇒ my fixtures were the wrong shape, which is my error to own."* **That is the
one that was true.** I flagged it as a possibility rather than filing a defect — the right call — but the fixture
was mine to get right and I got it wrong. **F1 and F2 were never going to post, and no amount of waiting would
have changed that.**

## The fixtures — created and CONFIRMED today, ending before 18:30

Server clock read **14:35** when I started (Overview header, browser agrees) — ~4 hours before the pass.

| Fixture | What | Booking id | Proves |
|---|---|---|---|
| **M1** | อื่นๆ · teacher **Ek** · **2026-09-05 15:00–16:00** · no student · **Charge ON, typed ฿20** · **`CONFIRMED`** | **`5788d6fe-6099-40a4-8440-712ed7ceac5e`** ⇒ expected sale key **`rev:5788d6fe-6099-40a4-8440-712ed7ceac5e`** | **AC-5** (posted == typed) · **AC-9** (auto-attend) |
| **M2** | อื่นๆ · teacher **Kowjoe** · **2026-09-05 15:00–16:00** · no student · **Charge OFF** · **`CONFIRMED`** | **`6ac8c7d4-95e0-4370-bf93-0534df5ed5de`** | **AC-4** (free ⇒ nothing posts) · **AC-9** · the control that gives M1's result meaning |

Both `POST /api/bookings` → **201**, both `PATCH …/status` → **200** with `"status":"CONFIRMED"`.

🟢 **Teacher choice was deliberate, and the API confirmed it worked:** Ek and Kowjoe are **not LINE-linked**, so
confirming sent nothing to a real person. Both responses carry
**`notification: {channel:"line", status:"skipped", reason:"ผู้รับยังไม่ผูก LINE userId"}`**.
📌 **Worth recording as a small good thing:** the outbox says **`skipped` with a reason** rather than silently
doing nothing — a send that never happened is visible as such. Bank (the owner) and **Haris** (a real teacher)
are the only linked accounts and **neither was used**.

## What must be read after 18:30 tonight — and by whom

1. **Both M1 and M2 become `ATTENDED`** with nobody touching them ⇒ **AC-9**, closed by me from the calendar.
2. **M1 posts exactly ฿20** on `rev:5788d6fe-…`, **M2 posts nothing** ⇒ **AC-5** + **AC-4**.
   🔴 **I still cannot read this.** The backoffice (`backoffice-som.develyst.online`) is not in my access file —
   it is the board's own open item for the human. **Per Porter's instruction and my own rule all week: I will
   not infer a money outcome I could not observe.** If the movement is not shown to me, **AC-4 and AC-5 stay
   `NOT_TESTED` even after a successful sweep** — the ATTENDED flip alone only proves AC-9.
3. **The owner reverses `rev:5788d6fe-…`** afterwards, as agreed for the earlier ฿20.

## Still blocked, and neither is mine to unblock

- **AC-21 (freelance budget unchanged)** — all 10 `sid` freelancers remain **`฿0/h · SET PAY BEFORE BOOKING`**.
  **One rate on one freelancer** and this is a ten-minute check. Porter is carrying it as a DATA REQUEST; per his
  instruction I did **not** park the round on it, and AC-4/5/9 do not depend on it.
- **AC-7 / AC-8 (consumes / does not consume)** — still no QA-owned course or voucher to deduct from.

## 🧹 Retired: F1 and F2 are now known-dead, not merely unread

`4014e65e-…` (F1, ฿20) and `25d695c3-…` (F2, free) are **`PENDING` on 2026-09-01**. Now that the selection rule
is known, **they can never be swept** — waiting on them is waiting on nothing. They are superseded by M1/M2 and
should be cancelled; recorded here so no future session re-adopts them as live evidence.

## Test data created

| What | Where | Removed? |
|------|-------|----------|
| **M1** `QA-078 M1 money 20B` — `5788d6fe-6099-40a4-8440-712ed7ceac5e`, **฿20**, CONFIRMED | `sid` | ⏳ **left deliberately** to post at 18:30 — **owner-approved residue**. **Owner reverses `rev:5788d6fe-…`**; then I cancel |
| **M2** `QA-078 M2 free control` — `6ac8c7d4-95e0-4370-bf93-0534df5ed5de`, charge OFF, CONFIRMED | `sid` | ⏳ **left deliberately**. Must post **nothing**; I cancel once read |
| **No LINE message reached anyone** — both pushes `skipped`, recipients unlinked. Bank and Haris untouched | — | ✅ |
| No student · no parent · no teacher row · no setting · no script · no restart | — | ✅ |
| **`uat`** — 🔴 **no contact of any kind.** The read grant (owner, 09-04) is live in principle but the frontoffice `PRODUCTION_HOSTS` guard still refuses, and **I did not look for another route to it** | — | ✅ |
| Superseded: **F1 `4014e65e-…` · F2 `25d695c3-…`** — proven unsweepable, to be cancelled | `sid` | ⏳ pending cleanup |

## Questions

25. **Who reads the ฿20 tonight?** Unchanged from Q5 and still the single thing that decides whether this round
    produces a verdict or another `NOT_TESTED`: either the owner reports what `rev:5788d6fe-…` posted, or I get
    **backoffice read access**. **The fixture is now correct — the observation is the only missing piece.**
    > answer: _pending_

26. **AC-21 needs one freelance rate**, still. Naming it again only because it is the last cheap AC in REQ-078.
    > answer: _pending_
