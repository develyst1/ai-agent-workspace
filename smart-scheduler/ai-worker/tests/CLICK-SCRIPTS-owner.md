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
