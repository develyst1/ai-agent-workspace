# TASK-222: FE — the cancel dialog must say when this session's revenue is already in the books

- Source: SPEC-069 (Porter's ORDER 2026-08-29)
- Status: TODO
- Depends on: **TASK-221** (the endpoint). Ships **after** it — the reverse order gives a dialog that always says
  "could not verify", which trains staff to ignore the one band that matters.
- Repo: **smart-scheduler-front**, on `develop`. Assignee: **@Fern**

## What to do

`src/components/partials/Calendar/Modal/CancelBookingDialog.tsx` — when the dialog opens, read
`GET /bookings/:id/posted-sale` and render a **warning band above the reason picker**. Three states, all visible:

| State | What the band says |
|---|---|
| `posted` | the amount **and the posting date** (wording below) |
| `posted: null` | nothing — the dialog is exactly as it is today |
| **request failed** | 🔴 an amber/red band: the posted amount **could not be checked**, check the backoffice before cancelling |

🔴 **The third row is not a nicety, it is the requirement.** Porter: *"If the lookup fails, fail loud — do not silently
drop the warning. A missing warning is the whole defect."* An error that renders as a clean dialog is indistinguishable
from "no money posted", and that is the bug.

🔴 **The band never disables Confirm.** This is a warning, not a gate — the owner has twice refused to let the system
move or block money as a side effect of a staff action. Staff cancel; the band makes sure they know what it leaves behind.

### Plumbing (follow the existing seams, don't invent new ones)

- `src/services/scheduler.service.ts` — a `getPostedSale(id)` beside `cancelBooking` (`:367`), **including its
  `useMock` branch** (`:68`); the mock returns `null` so the mock UI is not permanently in the error state.
- `src/hooks/scheduler/useScheduler.ts` — a `usePostedSale(id, enabled)` query, `enabled` on `opened`, so a dialog that
  is never opened never queries. It is a read: **no `invalidateAll`**.
- Satang → baht **in one place, with a test**: `139000` → `1,390`. This repo has already shipped a 100× conversion
  defect (TASK-169, `lib/scheduler/discount.ts:11`) — that is why this line is written down instead of assumed.
- `src/lib/i18n/dictionaries.ts` — new keys under the existing `cancelBooking` block (`:63` en / `:1034` th).
  **Both languages**, and re-check the **rendered** band, not the key (TASK-210's lesson).

### The wording — Thai is the customer-facing string, and it is NOT yours or mine to finalise

Ship with this, which is Porter's sentence plus the posting date and "check, then reverse":

> *"คาบนี้ลงบัญชีขายไปแล้ว **฿1,390** เมื่อ 29/08/2026 — การยกเลิกนี้ไม่ถอนเงินออกจากบัญชี กรุณาตรวจสอบและกลับรายการที่หลังบ้าน"*

Failure state:

> *"ตรวจสอบไม่ได้ว่าคาบนี้ลงบัญชีขายไปแล้วหรือยัง — กรุณาตรวจสอบที่หลังบ้านก่อนยกเลิก"*

⚠️ **Why not Porter's exact draft** (*"ต้องไปกลับรายการที่หลังบ้าน"*): a reversal carries no `refId`, so **we cannot see
that one already happened** (SPEC-069, Limitation). Instructing a reversal we cannot verify invites a **second** one.
The date is added so staff can find the row instead of hunting the ledger. **SPEC-069 Q2 is with @Porter/owner — if the
owner returns different Thai, it is a string change, not a rework.**

## Definition of Done — the OUTCOME

- [ ] Cancel dialog on a booking **with** a posted sale shows the amount **and** the date; the amount matches the
      backoffice figure (a discounted trial shows the **discounted** number).
- [ ] Cancel dialog on a booking **without** one is unchanged — no band, no empty space.
- [ ] With the endpoint erroring (block it in devtools), the band **appears** and says it could not verify.
- [ ] Confirm still works in all three states; the cancel request itself is unchanged.
- [ ] Both languages present; the **rendered** band checked, not the dictionary key.
- [ ] 📏 Standing rule: the band widens the dialog's content — **measure at 1600 / 1280 / 768 / 375 and report the
      numbers.** A long Thai sentence in a 375-wide modal is the case that breaks.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` → 0 · `bun run build` ok · suite green (report the count).

## Implementation Notes

(Fern fills this in.)

## Questions

(Fern asks; Sober answers as `> answer: ...`)

## Review

(Sober fills this in at REVIEW.)
