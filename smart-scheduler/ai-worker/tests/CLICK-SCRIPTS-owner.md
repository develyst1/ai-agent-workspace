# Owner click-scripts — painted checks QA can't reach through the login wall

> For the owner (via Porter). Each is a numbered path with the expected result per step, so her presses are
> few and well-aimed. These cover the **painted** things — pixel widths, a hidden nav item, a rendered alert —
> that my role can test everywhere *except* the final rendered screen. Backend behaviour under each is already
> verified separately (TEST-022b, TEST-024, TEST-027); these confirm only what the eye must confirm.
>
> Environment: **`sid` = som.develyst.online** (dev). Not production.
> **After running #3, nothing to clean up** — it uses data I already created (QA-expv-*) and only *views* it.

---

## Script 1 — REQ-024 / TASK-081: the custom date inputs are usable (not collapsed)

**Why:** these inputs shipped once collapsed to a few pixels — present but unusable. Backend date-range filtering
already passes (TEST-024); this is only about whether the two inputs are wide enough to use.

1. Open **`/scheduler/bookings`** → the **All bookings** tab (not Courses).
2. In the filter row, find the **date range** control and choose **custom / กำหนดเอง** (not a preset).
3. Two inputs appear — **From** and **To**.
   - ✅ **Expected:** each is a normal, full-width date field you can read and click a date in — roughly the
     width of the other filter selects.
   - ❌ **Fail (the old defect):** either input is a thin sliver (~a few characters wide), clipped, or you
     can't see the selected date.
4. Pick a From and a To a few weeks apart → the list filters to that range.
5. **Tell Porter:** pass/fail, and if you can, the approximate width (or a screenshot). One screenshot settles it.

---

## Script 2 — REQ-026 Stage 1: the extra "Dashboard" nav item is gone, nothing else lost

**Why:** four "statistics" menus was too many; one was hidden (hidden, not deleted).

1. Look at the **left navigation**.
   - ✅ **Expected:** the old **Dashboard** entry is **no longer listed**.
   - ✅ **Expected — still present and working:** **SOM dashboard**, **Daily report**, and **Needs attention**.
     Open each once; each should load normally.
   - ❌ **Fail:** the Dashboard entry is still there, OR one of the three above disappeared / errors.
2. (Optional, proves "hidden not deleted") In the address bar, visit the old dashboard route directly if you
   remember it — it should **still load** when typed, just not appear in the menu.
3. **Tell Porter:** which items you see in the nav, and that the three above still open.

---

## Script 3 — REQ-022: the expired-voucher **red alert** actually renders

**Why:** this is the four-round-open promise. The backend correctly refuses the booking (I proved it:
`400 "วอยเชอร์หมดอายุแล้ว"`). This step confirms the staff-facing **red alert** shows that reason instead of a
Save button that silently does nothing.

**I have prepared the data for you — no setup needed:**
- Student **`QA-expv`** (full name QA-expv-student) already has a **5-hour voucher that is expired** (expiry
  2026-04-05). It is unused, so it is inert except for this test.

1. Open the **New booking** modal → the **Voucher** tab.
2. In the student field, search **`QA-expv`** and pick **QA-expv-student**.
3. Their expired voucher should be the entitlement in context. Fill anything else required and press **Save /
   ยืนยัน**.
   - ✅ **Expected:** a **red alert** appears with the reason **"วอยเชอร์หมดอายุแล้ว"** (voucher expired). The
     booking is not created.
   - ❌ **Fail (the exact defect this project keeps hitting):** Save appears to do nothing, no message, and it
     looks like a broken button.
4. **Tell Porter:** did the red alert with that Thai text appear? A screenshot is ideal.
5. **Cleanup:** nothing — you only viewed/attempted; no booking is created on a rejected save.

> ⚠️ If the Voucher tab does **not** list QA-expv-student's expired voucher at all (e.g. expired vouchers are
> filtered out of the picker before you can select one), that itself is worth telling Porter — it would mean the
> red-alert path can't be reached from the UI the normal way, which is its own finding.

---

# Added 2026-08-04 (Tanya) — the two LINE scripts

> These cover the **only** acceptance criteria left in the batch that need a real phone. Everything
> around them is already verified from my side: the staff screen loads, the pending-request API answers,
> the digest job runs and stamps its last-send time. What neither I nor any harness can do is **be a
> LINE user** — I never message real people, and a teacher claim can only be made from a real account.
>
> Environment: **`sid` = som.develyst.online** (dev). Not production.
> Both scripts are safe: script 4 creates one pending request that you resolve yourself; script 5 only
> reads, except for one optional step that is clearly marked.

---

## Script 4 — REQ-020: a LINE teacher claim QUEUES, and staff approve / reject it

**Why:** before this change, typing a teacher's nickname on LINE **granted access immediately** — including
to someone who simply guessed a name. Now it should only create a request that a human approves. With ~22
teachers due to link, this is the gate that protects the whole roster.

**You need:** a phone with LINE and the OA added; a browser on `/scheduler/link-requests`.

1. On LINE, send the bot the teacher-claim message you'd normally use, giving a **teacher nickname**
   (use a real teacher's nickname — e.g. one you know is not linked yet).
   - ✅ **Expected:** the bot replies that the request is **waiting for staff approval** — and you get
     **no teacher access yet** (asking for "my schedule" should still refuse or treat you as unlinked).
   - ❌ **Fail (the old hole):** it says you're linked, or teacher features start working straight away.
2. In the browser open **`/scheduler/link-requests`**.
   - ✅ **Expected:** your claim is listed — who claimed, the **LINE display name**, and which teacher
     they claim to be.
3. **If several teachers share that nickname:** the screen should let you **pick which person** it is,
   rather than guessing for you.
   - ✅ **Expected:** a chooser appears. ❌ **Fail:** it silently picks one.
4. Press **Approve**.
   - ✅ **Expected:** the request disappears from the pending list, and **on LINE the teacher now has
     access** (ask the bot for the schedule — it should answer for that teacher).
5. Repeat step 1 with a second claim, and this time press **Reject**.
   - ✅ **Expected:** the person is told politely that it wasn't approved, and **gets nothing** — no
     teacher access.
6. **Unlink:** on the same screen, use **Unlink** on the account you just approved.
   - ✅ **Expected:** that account stops being a linked teacher and stops receiving pushes.
7. **Cleanup:** unlink anything you linked for the test (step 6 covers it). Nothing else to undo.
8. **Tell Porter:** for each of steps 1–6, what happened. Screenshots of the pending list and of the
   bot's replies settle it fastest.

> ⚠️ If a claim **immediately grants access** at step 1, stop and tell Porter — that is the exact defect
> this REQ exists to close, and it would be a release blocker.

---

## Script 5 — REQ-023: the daily digest is ONE message, silent when there's nothing, and never doubles

**Why:** the web half is verified — the panel shows *"Digest last sent: 4 Aug 2026, 08:00"* with each
check and its count. What can't be verified from a browser is what actually lands on the admins' phones.

**You need:** the phone that receives admin LINE notifications.

1. **The morning after any day the system flags something**, look at the admin LINE chat around **08:00**.
   - ✅ **Expected:** exactly **ONE** digest message in the morning.
   - ❌ **Fail:** two or more identical messages, or none at all while the web panel lists items.
2. Read the message against the web panel (`/scheduler/attention`) for the same morning.
   - ✅ **Expected:** each flagged check appears with a **count** and enough detail to act on
     (e.g. "teachers not linked to LINE: 21", "students with incomplete info: 11").
   - ❌ **Fail:** a bare "you have notifications" with nothing actionable, or counts that disagree with
     the panel.
3. **Silence when there's nothing** — on a morning when the panel shows **no** outstanding items:
   - ✅ **Expected:** **no** message at all that day. ❌ **Fail:** an "all clear" message arrives anyway.
   - (If every day has something outstanding, tell Porter and we'll clear the checks once deliberately.)
4. **No duplicates (optional, only if you're comfortable):** ask the person who runs the server to trigger
   the digest a **second time on the same day**.
   - ✅ **Expected:** **no second message** — the day's run is already recorded.
   - ❌ **Fail:** a duplicate arrives. ⚠️ Skip this step if you'd rather not; steps 1–3 are the important ones.
5. **Tell Porter:** the time the message arrived, whether it was one or several, and whether the counts
   matched the panel. A screenshot of the LINE message beside the panel answers all three at once.

---

# Script 6 — CUSTOMER-PROD post-deploy smoke (2026-08-11 deploy)

> **Why this is a click-script and not a QA run:** the target is
> **`frontoffice.develyst.online` — the customer's production server.** My role card says production is
> never mine (*"not read, not write, not 'just a GET'"*), and TASK-090's `mint-session.mjs` refuses that
> host on purpose. So this is written for the owner (or whoever holds prod), the same way Scripts 1–5 were.
> **Everything below was already accepted on `sid` against the same build** — so this is a
> *did-the-deploy-land* check, not a fresh feature test. It should take ~10 minutes.
>
> **Rules while running it:** don't create data you won't remove; don't touch rows you didn't create; and
> **do not trigger anything that sends LINE messages** (no digest run, no teacher-link approval) — those
> reach real people.

**Report back to Porter:** for each numbered step, just ✅ or ❌ + a screenshot if ❌.

---

## A. It's the new build at all (30 seconds — do this first; if A fails, stop)

1. Open **`/scheduler/calendar`**.
   - ✅ **Expected:** the filter row shows **FOUR** controls: **Find student** · Teacher · Type · Badge.
   - ❌ **Fail:** only three (Teacher / Type / Badge) → the frontoffice front build did **not** land. Stop and tell Porter.

## B. REQ-038 #3 — the student search (the newest feature)

2. Type part of a student's name into **Find student**.
   - ✅ Only that student's sessions stay on the grid; everyone else's disappear.
3. Type nonsense (e.g. `zzzz`).
   - ✅ The grid goes **empty** (it really filters — it doesn't ignore the box).
4. Clear the box (the ✕).
   - ✅ The full schedule comes back.
5. Switch **Weekly → Daily** and repeat step 2 on a day that has sessions.
   - ✅ The day grid filters the same way.
6. **Width check** — make the browser window **narrow** (about half your screen), then very narrow.
   - ✅ The four controls **wrap onto more lines** and each stays a normal, usable width.
   - ❌ **Fail:** any control squeezes to a thin sliver (a few characters wide) or the page scrolls sideways.
   - *(Measured on `sid`: 4 controls, wrapping 2 → 3 → 4 lines, narrowest 115 px, no sideways scroll.)*

## C. REQ-038 #5 — deduction history

7. **Bookings / Students** → Courses tab → on any course card press **History**.
   - ✅ A **Deduction history** panel opens with `Used / Leave used / Remaining / Ends` and a dated list of
     what happened to that course.
   - ✅ At the bottom: *"Who made each change isn't tracked yet — the branch shares one login."*
   - ❌ **Fail:** the panel is empty on a course that clearly has activity, or you see odd code-like text
     such as `kindNo-show` instead of "No-show".

## D. The rest of the set (quick looks)

8. **#2 — course picker:** calendar → click an empty slot → **Weekly course** tab → search a student who has
   a course. ✅ Each course appears as its own line showing the subject and progress (e.g. `(1/4)`).
9. **#4 — voucher shows its class:** Bookings / Students → **All bookings** → set Type = **Voucher**.
   ✅ Every voucher row has a **Subject** filled in (not blank, not "—").
10. **#107 — voucher exclusions:** calendar → empty slot → **Voucher** tab → open the **Program** list.
    ✅ **Onewheel** and **Balance Play** are **not** offered.
11. **#109 — rental:** Bookings / Students → **All bookings** tab → **Record rental**.
    ✅ A form opens asking for Equipment + Hours. **Press Cancel — do not record one.**
12. **#102/122 — settings:** open **Settings** in the left menu.
    ✅ The two rules are listed with their values (teacher-change notice 3 days · check-in 30 minutes).
    ⚠️ **Please don't change them here** — the override/reset path was already proven on `sid`.

## E. REQ-030 / REQ-037 — the plan editor (⚠️ this one writes data)

> Steps 13–15 **create and change bookings**. The customer's env has master data but **no real bookings
> yet**, so the safe way is: use a course you are happy to edit, and undo what you can.
> **If you'd rather not touch it, skip E entirely and tell Porter "E skipped"** — this exact behaviour was
> fully accepted on `sid`, so skipping it costs little.

13. Course card → **Manage plan**. ✅ The session table opens with a summary line (size · leave · end date).
14. Press **Edit** on one row, change the time, **Save**.
    ✅ A **"Your plan will become…"** preview appears **before** anything is saved, listing the resulting
    sessions and the new end date. Confirm it → the row moves.
    ❌ **Fail:** it saves immediately with no preview.
15. Find a session already marked **attended** (if none exists, skip).
    ✅ It shows **"Attended — locked"** with **no** Edit / Mark absence, but it **does** offer **Cancel**;
    pressing Cancel asks for a **reason (required)** before it will proceed. Press *Cancel* on the dialog
    to back out — you don't need to actually cancel anything.
16. **"เพิ่มคาบ (คิดเงิน)" / Add extra (charged)** — just confirm the button is **there and visibly
    different** (purple, beside the blue "Insert make-up"). ✅ Don't press it.

---

## What to send Porter

- A ✅/❌ per numbered step (steps 1–12 at minimum; 13–16 optional).
- Any screenshot where you answered ❌.
- Whether you skipped section E.

That's everything QA needs to convert the `sid` verdicts into DELIVERED for the customer env.
