# TASK-222: FE — the cancel dialog must say when this session's revenue is already in the books

- Source: SPEC-069 (Porter's ORDER 2026-08-29)
- Status: ✅ DONE — code (Sober 2026-09-01) · 🔴 rendered 3-state check + 375 measurement = @Tanya (routed)
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

## Implementation Notes (Fern, 2026-09-01)

**Repo:** `smart-scheduler-front`, `H:\scheduler\smart-scheduler-front`, HEAD **`b8b6fde`**
(`dong` ≡ `develop` ≡ `origin/develop`, `rev-list --left-right --count` = `0 0`). Uncommitted — git is the human's.
Landed in the same working tree as TASK-227.

**Contract read from TASK-221's code, not from the task text:** `PostedSale` at
`smart-scheduler-back/src/lib/sale-post.ts:226-242`, route at `src/routes/api.ts:267` returning
`{ posted: PostedSale | null }`, deliberately **not** wrapped in a try/catch.

### What changed

| File | Change |
|---|---|
| `types/api/contract.ts` | `PostedSale` + `PostedSaleResponse`, mirroring the BE's fields **and its warning** — `amountMinor` carries the 🔴 "render this, never re-derive it" note **in the type**, where the next person meets it |
| `services/scheduler.service.ts` | `getPostedSale(id)` beside `cancelBooking`, with its `useMock` branch |
| `services/scheduler.mock.service.ts` | mock `getPostedSale` → `null` |
| `hooks/scheduler/useScheduler.ts` | `POSTED_SALE_KEY` + `usePostedSale(id, enabled)` |
| `components/…/CancelBookingDialog.tsx` | the three-state band, above the reason picker |
| `lib/i18n/dictionaries.ts` | 5 keys × 2 languages under the existing `cancelBooking` block |
| `lib/ui/money-display.test.ts` | **new** — the satang→baht conversion, pinned |

### The three states, and why each is shaped that way

- **`posted`** — amber `Alert`, wallet icon, amount **and** date. Renders `amountMinor` **verbatim**;
  `listMinor`/`discountMinor` are typed but deliberately unused, and the reason is written at the call site.
- **`posted: null`** — nothing renders. Not an empty box, not a "no sale posted" line: the dialog is byte-identical
  to today, which is the DoD.
- **request failed** — amber `Alert`, `AlertTriangle`, "could not verify — check the backoffice before cancelling".
  🔴 **`retry: false` on the query, on purpose.** react-query's default retries would leave the dialog looking
  *clean* for several seconds while staff can already press Confirm — a clean dialog is indistinguishable from
  "no money posted", which is the exact defect. Failing fast is what makes the band honest.
- A quiet "Checking the books…" line while it is in flight, so the gap before a band appears is not silence.

🔴 **Confirm is untouched in all three states** — `disabled={!reasonCode}` only, exactly as before. The cancel
request itself is byte-identical. This adds a sentence, never a gate and never a way to move money.

### Two unit decisions, both deliberate

1. **Satang → baht goes through `formatPriceMinor` (`types/app/pricing/index.ts:39`) — the repo's EXISTING single
   converter.** The task says *"in one place, with a test"*; writing a new helper beside the dialog would have
   created a **second** place, which is the very shape of TASK-169's 100× defect. So I reused the one place and
   supplied the missing test: `139000 → "1,390"`, plus the two failure shapes (`"13.9"` / `"139,000"`) asserted as
   *not* the answer, plus the discounted-trial case `139000 + (-20000) → "1,190"` — which is the same arithmetic
   the "never re-derive" ruling is about, stated as numbers instead of as a comment.
2. **The date renders through `formatDateDisplay` → `29/Aug/26`, not the task's `29/08/2026`.** Same reasoning:
   that helper's own doc calls itself *"the ONE place a table turns a stored date into what the user reads"*, and
   inline `DD/MM/YYYY` here would put a second date convention on one screen. `postedAt` is an ISO timestamp, so I
   slice the date part rather than let a timezone shift the day. **See Q1 — one line if you want the task's format.**

### Verified — commands and output

- `bunx tsc --noEmit` → **exit 0**, no output.
- `bun test` → **51 pass / 0 fail**, 82 expect() calls, 8 files (was 46/0 across 7 after TASK-227; +5 here).
- `bun run build` → ok, all routes emitted; postbuild standalone copy ran.

### 🔴 Not done, and I am not dressing it up

**Two DoD items are unmet by me: the *rendered* band check (both languages, all three states) and the
1600/1280/768/375 measurement.** Same wall as TASK-227: `/scheduler/*` sits behind the auth proxy and the only
way through is typing into a password field, which I may not do; there is no QA-session route in this repo.

⚠️ **And for this task the mock is not enough even for whoever gets past the login.** `getPostedSale`'s mock
returns `null` **by design** (a throwing mock would leave the offline dialog permanently in the "could not verify"
state and train staff to ignore the one band that matters). So offline shows the *unchanged* dialog only.
**The `posted` and `error` bands can only be seen against the real endpoint — i.e. on `sid`, which is Tanya's
environment and nobody else's.**

**@Sober — please route to @Tanya via @Porter, with all three states named**, since two of them cannot be reached
by accident:

1. **`posted`** — cancel an **ATTENDED** `FIRST_TRIAL`/`SINGLE_SESSION` on `sid` whose day-end sale has run; the
   band must show the amount **and** the date, and the amount must match the backoffice figure. 🔴 **A
   *discounted* trial is the case worth choosing** — it is the one where re-deriving instead of rendering
   `amountMinor` would show a plausible but too-high number (฿1,590 where the truth is ฿1,190).
2. **`posted: null`** — any booking with no posted sale: **no band, no empty space.**
3. **failure** — block `GET /bookings/:id/posted-sale` in devtools; the band must **appear** and say it could not
   verify, and **Confirm must still work**.
4. **Both languages rendered** (TASK-210's lesson: check the band, not the key), and the **375** case — a long
   Thai sentence inside a Mantine `Modal` is what the measurement is for.

Static analysis I can offer meanwhile, **labelled as such**: the band is a Mantine `Alert` inside the modal's
existing `Stack`, so it inherits the modal width and adds height, not width — the risk is vertical (a long Thai
sentence pushing Confirm below the fold on a short viewport), not horizontal overflow. **That is a guess about
where it will hurt, not a measurement.**

## Questions

**Q1 (cosmetic, one line — I chose the repo's convention over the task's literal string).**
The task's Thai draft reads `เมื่อ 29/08/2026`; I render `29/Aug/26` via `formatDateDisplay`, the repo's single
date formatter, rather than introduce a second date format on the same screen. If the owner's Thai (SPEC-069 Q2,
still with @Porter) comes back with `DD/MM/YYYY`, it is one line — but then it should probably become a *second
named formatter* rather than an inline `dayjs` call, or we are back to two conventions.

**Q2 (worth a decision before this ships, not a blocker).**
The band says *"check the backoffice and reverse it there **if it should come out**"* — I kept your softening of
Porter's imperative, and the reasoning (a reversal has no `refId`, so we cannot see one already happened —
SPEC-069 §Limitation) is now written into both dictionaries so the next editor does not "fix" it back into
*"ต้องไปกลับรายการ"*. **Flagging one consequence:** because we cannot see a reversal, a booking cancelled twice —
or looked at twice — shows the **identical** band both times, even after someone has already reversed it. The
band cannot distinguish "not reversed yet" from "already reversed". That is inherent to the data, not a bug in
this task, but it is the exact thing that could produce a double reversal, and I would rather it be a recorded
decision than a surprise. If that matters to the owner, it is a `refId`-on-reversal change in the backoffice —
a different REQ.

## Review

(Sober fills this in at REVIEW.)

## Review — Sober, 2026-09-01: ✅ **PASS.** The `retry: false` reasoning is the best line in this task.

**Reproduced:** `tsc --noEmit` → **0** · `bun test` → **51 pass / 0 fail** · `useScheduler.ts:368` `retry: false`
with its reason on the line above · `CancelBookingDialog.tsx:117-118` renders `formatPriceMinor(amountMinor)` and
`formatDateDisplay(postedAt)` · Confirm still `disabled={!reasonCode}` only.

📌 **`retry: false` — you found a failure mode neither Porter nor I had named.** react-query's default retries
would leave the dialog looking **clean** for several seconds while Confirm is already pressable, and *a clean
dialog is indistinguishable from "no money posted"* — the precise defect this whole task exists to close. Porter's
rule was *"if the lookup fails, fail loud"*; the default retry would have obeyed the letter and broken it in
practice. **Failing fast is what makes the band honest.**

📌 **"There already IS one place" beats following my instruction.** I wrote *"satang → baht in one place, with a
test"*; you noticed a second helper beside the dialog **would create** the second place, which is the exact shape
of TASK-169's 100×. Reusing `formatPriceMinor` and supplying the **missing test** is strictly better than what I
asked for. And pinning the discounted case `139000 + (-20000) → "1,190"` states the *"render `amountMinor`, never
re-derive"* ruling as **numbers** — a comment can be read past; `฿1,590 ≠ ฿1,190` cannot.

### Your two questions

> **Q1 — `29/Aug/26` via `formatDateDisplay`, not my `29/08/2026`.** ✅ **Your call, same reasoning as the money,
> and I would rather have one date convention on the screen than my literal string.** Keep it.

> **Q2 — the band reads identically whether or not the sale has already been reversed.** ✅ Correct, inherent to
> the data (a reversal carries no `refId` — SPEC-069 §Limitation), and **not a defect in this task**.
> **It goes to @Porter NOW, not after the Thai comes back** — because the two are the same conversation: the
> wording only says *"check, then reverse"* instead of *"go and reverse"* **because** of this limitation, and the
> owner should decide with the risk in front of him. **The double-reversal path is the concrete harm**: two IN
> movements against one sale, and the P&L simply nets to a negative. Whether reversals should carry `refId` is a
> backoffice REQ (SPEC-069 Q3), his to rank.

### The two states that need `sid` — routed, not waived
🔴 **Neither `posted` nor `error` is provable offline, and your mock is right to return `null`** (a throwing mock
would leave the offline dialog permanently in "could not verify" and train staff to ignore the one band that
matters — the same trained-blindness argument as `retry: false`). ⇒ **Both states are only reachable against the
real endpoint.** Routing to @Tanya via @Porter with your three named cases, and I am keeping your instruction to
**pick a DISCOUNTED trial** for the `posted` case: it is the one input where re-deriving instead of rendering
shows a **plausible** wrong number (฿1,590 where the truth is ฿1,190), and a plausible wrong number is the only
kind that survives a test.

**Status → DONE (code).** The three rendered states, both languages and the 375 case are QA's.
