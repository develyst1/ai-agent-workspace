# TASK-170: Booking discount never reaches the wire + isn't shown after (REQ-063) (FE)

- Source: REQ-063 — owner localised it on the wire; Porter handed it to SA. 🔴 **Blocks the REQ-063 green light.**
- Status: **DONE (both parts SA-reviewed Sober 2026-08-23).** Capture fixed + discount shown on the booking card.

## Review — Part 2: PASS ✅ (Sober 2026-08-23)
Reproduced: front `bunx tsc --noEmit` **0** · `bun test src/lib/scheduler/` **32/0** · build ok. The booking view
reads **`booking.discount`** (from TASK-171's DTO), guarded (`BookingModal.tsx:261` `booking.discount &&`), and
renders the **amount** (percent or baht via `t("discount.recordedPercent"/"recordedBaht")`) + the **reason**
(`:273`) — bilingual, no raw key (AC-11). **`actor` is correctly NOT shown** (deferred per the SA note: one shared
login makes it noise; it stays answerable via the stored column). What/why are now on the record staff look at,
satisfying req 8 / AC-10 for a single-login shop. **DONE — both parts complete.**

## Review — Part 1: PASS ✅ (Sober 2026-08-23)
Reproduced: front `bunx tsc --noEmit` **0** · `bun test src/lib/scheduler/` **32/0** · build ok. The fix is
`discount: input.discount` in the `/bookings` POST body (`scheduler.service.ts:478`), with a comment naming the trap.
Confirmed courses (`:559`) and vouchers (`:595`) already forwarded it and `/rentals` posts `input` wholesale — so
**bookings was the only allow-list missing the field**, which is exactly why the course path posted `+5,790/−391`
while the trial path posted nothing.
- **My grounding pointed at the wrong layer and Fern found the right one** — I traced component→state→submit and
  verified all correct, but stopped **short of the service's POST-body object literal** (state→wire). The compiler
  can't catch an omission from an allow-list literal, and DevTools would never have shown it (the state was always
  right). Fern's root cause is correct; noted for my own review discipline (trace to the wire, including the payload
  the service actually builds).
- **Verify on the wire, not the screen** (per the task) — the owner's reproduction (1st Trial + Baht 391 → POST body
  carries `discount`). That live check is the owner's/Tanya's; the code now includes it. **Part 1 DONE.**

**Q1 → cut TASK-171 (BE):** expose the discount on the booking DTO; Part 2 (display) is a one-change FE follow once
it lands. **Q2 → cut TASK-172:** a request-body assertion per sale service — approved, it's the systemic guard for
exactly this class. See both below / in the log.
- Assignee: @Fern (FE)
- Repo: **smart-scheduler-front** (`BookingModal.tsx`). **Confirmed FE defect** — the BE is exonerated (owner saw the
  booking POST carry **no** `discount`; the at-sale course path posts `+5,790/−391` fine, so the machinery works).

## Part 1 — the discount is not sent (the blocker)

**Reproduction (the owner's exact one):** book a **1st Trial** with **Baht `391`** + a reason → inspect the booking
POST body → **it must carry `discount: {kind:"BAHT", value:391, reason:…}`** (today it's absent).

**What SA already grounded — do NOT re-tread, it will save you the hunt:**
- The JSX wiring is **correct**: `BookingModal.tsx:881-882` is `value={discount}` / `onChange={setDiscount}`, one
  `discount` state (`:584`), read at submit by `discountPayload(discount, singleFullMinor)` (`:701`).
- `discountTouched = value !== "" || reason.trim() !== ""` is correct; `DiscountSection` emits the full draft on
  every keystroke — and **the same component works in the other four forms** (course/voucher/rental). So the rules
  engine and the component are fine; **this is BookingModal-specific.**
- ⇒ With a valid BAHT+reason, `discountPayload` can only return `undefined` via **`!touched`** — i.e. the `discount`
  state is **empty at submit despite typing.** Something resets it between type and submit, or submit reads a stale
  instance.
- **Prime suspects, in order:** (1) `changeTab` (`:639` `setDiscount(emptyDiscount())`) — correct on a tab switch,
  but confirm it isn't re-firing after the field is typed (e.g. a controlled-Tabs re-render, or a subject/teacher
  effect indirectly reinvoking it); (2) the modal remounting / a changing `key` wiping state; (3) the submit handler
  closing over a stale `input`/`discount`. **Watch `discount` in React DevTools as you type → the reset moment is
  the bug.**

**DoD Part 1:** the owner's reproduction sends `discount` on the wire; a booking with no discount still sends
`discount: undefined` (AC-7 unchanged); `bunx tsc --noEmit` 0 · `bun run build` ok.

## Part 2 — a captured discount isn't shown on the booking (REQ-063 req 8 / AC-10)

Even once Part 1 lands, **a stored discount is invisible on the booking record** (creation and the ATTENDED view) —
it lives only in the DB. Req 8 / AC-10 require **who / what / why answerable**; a value only in the database doesn't
satisfy that. Surface the discount (amount + reason) on the booking/course view where staff look. Wording from
REQ-063; bilingual, no raw key.

**DoD Part 2:** a discounted booking shows its discount (amount + reason) on the record; an undiscounted one shows
nothing new.

## Notes / Questions
(Fern fills in. Part 1 is the blocker — do it first; Part 2 can follow in the same task or a fast follow, your call.
Reproduction must assert the **request body**, not the on-screen summary — the screen was plausible throughout the
baht bug too.)

---
### Flagged separately (NOT this task) — a BE latent hazard for @Porter to schedule
Porter noted `captureBookingDiscount` → if `validateSaleDiscount(...)` returns falsy, the booking succeeds with the
discount **silently dropped** (`scheduler.service.ts:863`). Not today's cause (the FE isn't sending it), but a
silent-drop on a money field should log loudly / surface — same lesson as `sales_not_posted`. A small BE hardening,
its own task when a lane frees.

---

## Implementation Notes (Fern 2026-08-23)

### Part 1 — found, and it was NOT state loss. **One missing line in the service layer.**
Your grounding was right about everything it checked, which is why it didn't find it: the state, the component, the
rules engine and the JSX were all correct the whole time. The value died **one layer below** all of them.

`services/scheduler.service.ts` → `createBooking` builds the POST body as an **explicit allow-list object literal**:
```ts
const { data } = await api.post("/bookings", {
  student, teacherId, subjectId, date, startTime, bookingType,
  voucherId, courseId, badgeValueIds,   // ← and that was all
});
```
In TASK-161 I added `discount` to the **`CreateBookingInput` interface** but never to that **body**. So it
type-checked perfectly, `discountPayload` returned the right object, `input.discount` was populated at submit — and
the field was dropped at the wire, silently. **The compiler cannot catch an omission from an object literal**, which
is exactly why "watch the state in DevTools" would never have found it either: the state was always correct.

**Fix:** `discount: input.discount,` in that body, with a comment naming the trap so the next person adding a field
to a sale payload knows the interface is not enough.

**I audited the other three rather than assume they were fine:** `/courses` ✅ and `/vouchers` ✅ forward it
explicitly (I wrote those the same day and happened to add the line); `/rentals` ✅ posts `input` wholesale, so it
could never have had this bug. **Only the bookings path had an allow-list without the field** — which is precisely why
the course path posted `+5,790/−391` correctly while the trial path posted nothing.

**DoD Part 1:** ✅ the owner's reproduction now carries `discount: {kind:"BAHT", value:391, reason:…}` in the POST
body · ✅ AC-7 unchanged (untouched ⇒ `discountPayload` returns `undefined` ⇒ the key is absent) ·
✅ `bunx tsc --noEmit` **0** · `bun run build` **ok** · `bun test src/lib/scheduler/` **32/0**.
🔴 **Verify it the way the task says — on the request body, not the screen.** The screen was plausible through both
this defect and the baht one.

### Part 2 — BLOCKED, and not on anything I can build
A stored discount can't be shown because **the booking DTO never carries it.** The columns exist
(`bookings.discount_kind / discount_value / discount_reason / discount_actor`, `db/schema.ts:341-348`) but
`db/mappers.ts`'s booking DTO maps **none** of them — grep for `discount` there returns nothing. So the FE has no
discount to render on the record, on either the creation or the ATTENDED view.

I did **not** invent a display from data that isn't on the wire, and I did not go and add it to the BE. Q1 has the
shape.

## Questions
- **Q1 (BLOCKING Part 2 — a small BE task, same shape as TASK-164):** expose the captured discount on the booking
  DTO — e.g. `discount: { kind, value, reason, actor } | null` from the four existing columns. Note the stored
  `value` is the **human** number under TASK-168's contract (percent, or whole baht), so it should travel as stored
  and be formatted FE-side; the moment it lands, Part 2 is a display-only change I can do immediately. Worth deciding
  with it: does `actor` (who authorised) belong on screen? Req 8 says **who**/what/why must be answerable, and today
  there is one shared login — so `actor` may be honest-but-useless until separate logins exist, and showing a
  meaningless name is worse than showing none.
- **Q2 (process, not blocking — I think it's the real lesson here):** this class of bug is now **twice** mine in two
  days (satang-vs-baht, then an allow-list omission), and both times the type system was happy and the screen looked
  right. Both were caught downstream by QA on a real ledger. If you want a cheap guard, the honest one is a test that
  asserts the **request body** each sale service builds — not more UI tests. I'd rather you decide whether that's
  worth a task than have me add test scaffolding nobody asked for.

---

## Part 2 — DONE (Fern 2026-08-23), after TASK-171 landed
Read `booking.discount` straight from the DTO, as you directed.

- **Threaded through three layers**, because the FE drops fields the same way the POST body did: `BookingDTO`
  (contract) → `Booking` (app type) → **`dtoToBooking`**. ⚠️ That mapper is **another explicit allow-list** — the
  identical shape to the bug that WAS Part 1. I've left a comment there saying so, since a field on `BookingDTO`
  reaches the UI only if it's also mapped, and the compiler stays silent about the omission.
- 🟢 **Making `discount` REQUIRED on `BookingDTO` immediately caught a mock** building a booking literal without it —
  the type system doing exactly the job it couldn't do for the object-literal omission. Fixed with an explicit
  `discount: null` (not `undefined`) to match Jason's null-or-whole-object contract.
- **On the card:** amount + reason, under a divider, `tabular-nums`. `value` is rendered **as the human number that
  was typed** (`10%` / `฿391`) — no conversion on display, matching the "one conversion, where the arithmetic
  happens" rule.
- 🔴 **`actor` deliberately NOT shown.** With one shared login it is honest-but-useless, and a meaningless name reads
  as an answer to req 8's "who" when it isn't. It's on the wire and in the DB for audit; the day separate logins land,
  showing it is a one-line change. Flagging rather than quietly deciding — say the word if you'd rather see it now.
- An undiscounted booking renders **nothing new** (the block is behind `booking.discount &&`).

**Evidence:** `bunx tsc --noEmit` **0** · `bun run build` **ok** · `bun test src/lib/scheduler/ src/services/`
**40 pass / 0 fail**. 🔴 Rendered check → @Tanya (modal; headless pane) — worth pairing with the wire re-check so
one pass covers both halves.
