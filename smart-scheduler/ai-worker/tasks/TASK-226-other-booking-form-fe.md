# TASK-226: FE — the booking form: อื่นๆ, a typed title, charge (amount | catalogue item), consume

- Source: SPEC-070 (REQ-078 · AC-1 / 2 / 3 / 5 / 6 / 10 / 11 / 12)
- Status: ✅ DONE — code (Sober 2026-09-01) · local rendered check routed to @Tanya. Was: **REVIEW** (Fern 2026-09-01) — code complete. One DoD item not done by me (the rendered form +
  1600/1280/768/375 — auth wall; the **mock covers this one fully**, no `sid` needed). 2 questions.
- Depends on: **TASK-229** (the `/catalog-items` filter — without it the picker offers "Course 6h (onewheel)")
  → which depends on TASK-225. TASK-224 gives the shape.
- Repo: **smart-scheduler-front**, on `develop`. Assignee: **@Fern**
- ⚠️ **Shared repo — another team builds on `develop`.** `git show develop:<path>` before you edit anything on the
  booking form or the calendar; re-apply only what is genuinely missing (board standing rule).

## What to do

**`Calendar.config.ts:14`** — add `"OTHER"` to `BOOKING_TYPE_OPTIONS`, and `"OTHER"` to the `BookingType` union in
`types/app/scheduler/index.ts:71`. 📌 **The union is the lever:** `BOOKING_TYPE_ICON` / `BOOKING_TYPE_VAR` are
`Record<BookingType, …>` (`components/common/BookingCellBody.tsx:10,18`), so TypeScript will fail until every map
covers `OTHER` — that is the mechanism that stops a half-added type, not a checklist. (The cell itself is TASK-227.)

**The form (`Calendar/Modal/BookingModal.tsx`)** — when type is `อื่นๆ`:

| Control | Behaviour |
|---|---|
| **ครู (teachers)** | 🆕 **several may be chosen** for อื่นๆ (owner 2026-08-31). **At least one is required** — refuse with a message (AC-19). The other four types keep **exactly one** teacher picker, unchanged (AC-20). |
| **Student** | **optional** — the picker may be left empty |
| **ชื่อรายการ** (title) | shown always for อื่นๆ; **required when no student is selected**; placeholder *"เช่น ประชุมทีม, ปิดปรับปรุงลาน"* |
| **Program/subject** | **not required** — an อื่นๆ booking has no program |
| **คิดเงินรายการนี้** (charge) | off by default. On ⇒ **exactly one** of: a typed amount, or a catalogue item picked from the list (TASK-225's endpoint, showing each item's own price) |
| **ตัดสิทธิ์จากคอร์ส / Voucher** (consume) | off by default. On ⇒ pick the student's course or voucher (requires a student) |

**Wording — use REQ-078 §User-facing wording verbatim, both languages** (`lib/i18n/dictionaries.ts`, en `:63`-area
and th `:1034`-area). Errors: *"กรุณาระบุชื่อรายการ"* · *"กรุณาระบุจำนวนเงินให้ถูกต้อง"*.

🔴 **AC-12 — the two price sources must never both be live.** Prevent the combination in the UI (choosing one
clears/disables the other) **or** state plainly which will be charged. **Never silently pick one.** The server
refuses it and the DB has a CHECK behind that, but a user who can type both and gets a 400 has been told nothing
useful — the message is the product here.

⚠️ **Money is satang on the wire, baht on screen — convert in ONE place, with a test.** `bahtToMinor` already
exists (`lib/scheduler/discount.ts:18`) and exists **because this repo shipped a 100× error on exactly this**
(TASK-169). Reuse it; do not write a second conversion.
⚠️ **The typed amount is VAT-INCLUSIVE — the final amount the customer pays.** Say so on the field; otherwise the
first person to type a net figure silently misstates a month.

🚫 **Do not offer a teacher-less booking** — the owner confirmed *"ทุกการจองต้องมีครู"* (2026-08-31). At least one.
🚫 **No discount control on อื่นๆ** — the server refuses it (SPEC-070 §Out of scope).
🚫 **No teacher-pay / earnings control — on any booking type.** The owner's *"ถ้าครูหลายคน ไม่ต้องมีให้ใส่การได้ตังค์"*
refers to **teacher pay** (Q7 = ก), and **no such field exists anywhere in this product** (SPEC-070 §AC-22 —
verified in both repos: zero matches in `src/`). ⇒ **AC-22/AC-23 need no build; they are satisfied as things
stand.** 🔴 **Do not add one "for completeness"** — a pay field that records nothing is worse than none.
✅ **The customer-charge toggle is UNAFFECTED by the teacher count** (Q7): a multi-teacher อื่นๆ can still bill
the customer. Do not hide `คิดเงินรายการนี้` when several teachers are picked — that would be the wrong control.

### 🔴 The catalogue picker needs an EMPTY STATE — unconditionally, not as a contingency

`GET /catalog-items` (TASK-229) returns only **backoffice-created** active INCOME items. **It can legitimately
return zero** — on a box where nobody has created one yet, or the day the owner archives the last one. An empty
dropdown with no words is **indistinguishable from a broken endpoint**, and Jason's DATA REQUEST exists precisely
because that misdiagnosis would cost you an afternoon.

⇒ When the list is empty, say so and say what to do:
**TH** *"ยังไม่มีรายการในแคตตาล็อก — สร้างที่หลังบ้านก่อน"* · **EN** *"No catalogue items yet — create one in the
backoffice first."* The **typed amount must still work** in that state; an empty catalogue is not a reason to
block charging.
📌 Build it whatever the DATA REQUEST comes back with. It is cheap now and expensive after the owner opens a blank
control.

### 🆕 One line that belongs to neither task, and would have fallen through the crack (Fern, TASK-227 Q3)

**`BOOKING_TYPE_OPTIONS` is the bookings-table FILTER**, and it is a hand-written array — widening `BookingType`
does not add a row and **the compiler says nothing.** So staff can create อื่นๆ bookings and then have no way to
filter to them, on the page REQ-024 exists to make searchable. **Add `OTHER` to it here**, and check the
**rendered** filter, not the constant.
📌 Fern found this while building 227 and correctly declined to widen a submitted task. Same class as the
`CalendarLegendBar` array she caught: **a `Record<BookingType, …>` fails the build when the union widens; a
hand-written array of the same type does not.** Worth a look for a third one.

## Definition of Done — the OUTCOME
- [ ] **AC-1** อื่นๆ is selectable and a booking saves.
- [ ] **AC-2** no student + a typed title → saves; **AC-3** with a student → behaves like any other booking.
- [ ] **AC-10** no student + no title → **refused with the message**, nothing booked.
- [ ] **AC-11** amount 0 / negative / non-numeric → refused with the message, nothing booked.
- [ ] **AC-12** both price sources cannot end up set; the screen says which applies.
- [ ] **AC-5 / AC-6** a typed ฿500 reaches the server as `50000`; a picked item sends its id and shows its price.
- [ ] **AC-19** several teachers can be chosen for อื่นๆ; **zero teachers is refused with a message.**
- [ ] **AC-20 regression:** the four existing types still show **one** teacher picker and still take exactly one.
- [ ] **AC-22/23** no teacher-pay control appears — before or after picking several teachers — and
      `คิดเงินรายการนี้` **stays available** with several teachers.
- [ ] **AC-14 regression:** creating each of the four existing types is unchanged — every field, every validation.
- [ ] Both languages; the **rendered** form checked, not the dictionary key (TASK-210's lesson).
- [ ] 📏 **Standing rule — the form gains controls in a shared column: measure at 1600 / 1280 / 768 / 375 and
      report the numbers.** The charge row (toggle + amount + item picker) at 375 is the case that breaks.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` → 0 · `bun run build` ok · suite green (report the count).

## Implementation Notes (Fern, 2026-09-01)

**Repo:** `smart-scheduler-front`, `H:\scheduler\smart-scheduler-front`. `git rev-parse HEAD` = **`4ed910f`**
(the human's commit of the TASK-147 + 222 + 227 batch). Branch `dong`; `develop` is one commit behind it, so
`dong` is the newer tree and nothing on `develop` is missing here — checked with
`git rev-list --left-right --count HEAD...develop` = `1 0`, not assumed.

**The union + the `Record` maps were already done by TASK-227**, so the lever the task describes had already
fired. What remained was the two hand-written arrays, the form, and the plumbing.

### The three hand-written arrays — all now carry a comment naming the trap

Your ruling was *"worth looking for a third one"*. **There is a third, and it is the create-form's own tabs.**

| Array | File | Effect if `OTHER` were missing |
|---|---|---|
| `BOOKING_TYPE_OPTIONS` | `Calendar.config.ts` | the bookings-table **filter** cannot reach อื่นๆ (my TASK-227 Q3) |
| `BOOKING_TABS` | `BookingModal.tsx` | 🆕 **staff could not create one at all** — this is the tab list |
| `BOOKING_TABS_LEGEND` | `CalendarLegendBar.tsx` | done in TASK-227 |

`OTHER` is **last** in the tabs on purpose: it is not a product, and it should not sit among the four things the
school sells.

### The form (`BookingModal.tsx` → `CreateForm`)

A **third branch**, not a widening of the lesson branch: `isVoucher ? … : isOther ? … : <the four lesson types
exactly as they were>`. That is what makes **AC-14 and AC-20 regressions true by construction** — the lesson
branch is not edited, so it still renders one teacher `Select` and every field and validation it had.

- **Teachers → `MultiSelect`** (AC-19). The clicked column is pre-filled as a *fact*, not a guess (the same
  reasoning the voucher branch uses); staff may add or swap. `teacherIds[0]` becomes `teacherId`, the rest
  become `additionalTeacherIds` — matching TASK-224's "`teachers[0]` is always the row's `teacher_id`".
- **Student optional**, labelled *"นักเรียน (ไม่บังคับ)"*. **No program picker at all** — an อื่นๆ has none, and
  a disabled-but-present control would imply one exists.
- **Title** always shown, `required` only when there is no student.
- **Charge** — a `Switch`, off by default, then a `SegmentedControl` for the source. 🔴 **AC-12 is satisfied
  structurally: the source is ONE value, so "both set" is unrepresentable rather than merely refused.** The task
  offered "prevent the combination **or** state which applies"; a state that cannot exist beats a message
  explaining a state that can. (The server refusal and the DB CHECK remain the backstops.)
- **Amount** — `NumberInput`, `min={1}`, integers only, with *"ยอดสุทธิที่ลูกค้าจ่ายจริง — รวม VAT แล้ว"* on the
  field. VAT is said **on the control**, not in a task note, because the first person to type a net figure
  misstates a month and nothing downstream can detect it.
- **Consume** — a `Switch`, then the **selected student's own** course/voucher rows. Gated on `student?.id`, not
  on `student`: a name typed into `StudentSelect` has no id and therefore no entitlements, so the form says
  *which step is missing* instead of showing an empty dropdown. "Consume" is just `courseId`/`voucherId`, which
  the existing day-end engine already deducts from (SPEC-070 AC-7/8 — nothing new to build).
- 🚫 **No discount control, no teacher-pay control** (AC-22/23 — satisfied by absence, and I did not add one
  "for completeness"). ✅ `คิดเงินรายการนี้` is **not** gated on the teacher count — Q7 = ก was about teacher pay.

### The empty state — built unconditionally, as you ruled

`useCatalogItems(enabled)` only fires while the charge toggle is on **and** the source is `ITEM`, so opening the
form on a lesson type queries nothing. Zero items renders a worded `Alert` — *"ยังไม่มีรายการในแคตตาล็อก —
สร้างที่หลังบ้านก่อน"* + *"ยังคิดเงินได้โดยระบุจำนวนเงินเอง"* — and the typed amount keeps working from there.
The refusal message for "source = ITEM, nothing picked" points at the same escape: *"กรุณาเลือกรายการจาก
แคตตาล็อก หรือระบุจำนวนเงินเอง"*.

### 🔴 Two defects the compiler could not see, found and fixed

1. **`createBooking` would have refused EVERY อื่นๆ booking client-side.** `resolveSubjectId`
   (`scheduler.service.ts`) **throws** an `ApiClientError` when it cannot resolve a program name — and an
   อื่นๆ has none. The request would never have been made, and the error would have read like a validation
   rule rather than a code path. Now branched on the type, with `student` omitted entirely (not `{name: ""}`,
   which would ask the BE to find-or-create a nameless guardian).
2. **The offline mock built อื่นๆ bookings with `displayName: ""` — a blank calendar cell, the exact AC-10
   failure.** The wire and a `Booking` name these fields **differently** (`otherTitle` → `title`,
   `additionalTeacherIds` → `teachers`), so spreading `...input` silently dropped both. `title` is optional and
   the extra keys ride along harmlessly, so **tsc was perfectly happy**. Mapped explicitly, with the mock's
   input type widened to see them.

📌 And the wire body is an **allow-list literal** — the shape that dropped `discount` (TASK-170) and
`endedAt`/`endReason` (TASK-183). The four new fields are added there explicitly and **gated on the type**,
because the BE *refuses* them outright on the four lesson types rather than ignoring them.

### Verified — commands and output

- `bunx tsc --noEmit` → **exit 0**, no output.
- `bun test` → **76 pass / 0 fail**, 158 expect() calls, 10 files (was 58/0 across 9; **+18**).
- `bun run build` → ok, all routes emitted; postbuild standalone copy ran.

**New: `lib/scheduler/other-booking.ts` + `.test.ts` (18 cases).** Same shape and the same reason as
`discount.ts`: the rules are a pure function so they can be tested, and because a rule that only lives in JSX
cannot be — the lesson TASK-147 just landed on. Pinned: AC-19 (zero refused, several accepted), AC-10 (trimmed,
and optional once a student exists), AC-11 (`""`/0/negative/12.5 all refused; **฿500 → `50000`**, asserted as a
number and explicitly *not* `500` or `5000000` — the TASK-169 magnitude), AC-12 (only the **active** source
reaches the payload, so a lingering `itemId` after switching back cannot leak), AC-4 (charge off writes
**nothing**, which is different from charging zero), the deduction rules, and one-pass collection.

🔴 **The last block is the one worth reading.** The problem keys are rendered through a **template** (`t(k)`),
and `lib/i18n/keys.test.ts` scans only literal `t("…")` — it names templated keys as a known gap. **So nothing
else in this repo would notice a key here resolving to nothing.** The test asserts every emitted key exists in
**both** dictionaries, *and* that the evaluator emits no key outside that list — so a key added later without
copy fails here rather than printing `booking.errOtherNoTitle` at a staff member.

### 🔴 Not done: the rendered form and the 375 measurement

Same auth wall (no password from me; no QA-session route). **Route it like TASK-147, not like TASK-222/227:**
everything here is reachable offline — the mock serves two catalogue items, the fixtures include อื่นๆ
bookings, and mock auth accepts any credentials. **No `sid`, no real data, no test account.**

```bash
NEXT_PUBLIC_USE_MOCK=true NEXT_PUBLIC_API_URL="http://127.0.0.1:9/api" AUTH_URL="http://localhost:3017" PORT=3017 bun run dev
```

**What to look at, in this order:**
1. **AC-10** — pick อื่นๆ, no student, no title → the refusal appears and Save is disabled. Type a title → saves,
   and the new cell shows **the title**, not a blank.
2. **AC-11** — charge on, amount `0` / empty → refused. `500` → saves.
3. **AC-12** — flip the source back and forth with both fields filled; only the visible one can apply.
4. **The empty state** — 🔴 **the mock deliberately returns two items, so this state is NOT reachable as
   shipped.** Set `getCatalogItems` in `scheduler.mock.service.ts` to `delay([])` for one run. (Stated here so
   nobody concludes the empty state was skipped.)
5. **AC-20/AC-14** — the other three tabs: one teacher picker, every field as before.
6. 📏 **1600 / 1280 / 768 / 375.** The DoD names "the charge row (toggle + amount + item picker)" — **in this
   implementation that is a vertical stack, not a row**, so the case the DoD anticipated does not exist as
   described. **The real 375 risk is elsewhere and I would rather name it than let it be looked for in the wrong
   place:** the two-segment `SegmentedControl` carrying *"ระบุจำนวนเงินเอง"* / *"เลือกจากแคตตาล็อก"* at ~50%
   width each, and the teacher `MultiSelect` once several pills wrap. Both are static analysis, **not**
   measurements — I could not take one.

## Questions

**Q1 (a decision I made structurally; reverse it in one line if you disagree).**
AC-12 says *"prevent the combination in the UI **or** state plainly which will be charged"*. I took the first:
the price source is a single `SegmentedControl` value, so both-set is **unrepresentable** rather than refused.
The cost is that switching source hides the other field rather than showing both greyed — staff cannot see the
amount they typed while on the item tab. I judged an impossible state worth more than a visible one; the draft
keeps both values, so nothing is lost by switching back. If you want both visible with one clearly marked as
the one that applies, say so.

**Q2 (not blocking; a consequence of the design, and yours or Porter's to place).**
`handleSubmit` runs `detectConflict` against **`teacherIds[0]` only** — which mirrors the BE exactly
(`bookings_teacher_slot_uq` is on `teacher_id`, and you ruled additional teachers deliberately not slot-checked).
**So an อื่นๆ can be saved onto a second teacher who already has a lesson in that slot, with no warning at
either end.** That is the same residue you routed to @Porter for the soft-warning question, arriving through the
create form instead of the calendar — and it is the point where a warning would actually be useful, because it
is where someone is choosing the teachers. I did **not** build one (it is not in this task, and a client-side
check that the server does not enforce is its own kind of lie). Flagging so the two halves are decided together
rather than one at a time.

## Review
(Sober fills this in at REVIEW.)

## Review — Sober, 2026-09-01: ✅ **PASS.** The third array would have shipped the feature unusable.

**Reproduced:** `tsc --noEmit` → **0** · `bun test` → **76 pass / 0 fail** (+18). At source:
`BookingModal.tsx:688` — `BOOKING_TABS` now carries `OTHER`; `scheduler.service.ts:523` — the `resolveSubjectId`
bypass with the reasoning on the line; `lib/scheduler/other-booking.ts` + its 18 tests.

### The three findings, in the order they would have hurt

📌 **1. `BOOKING_TABS` — the worst of the three, and you found it because I asked for a third.**
Every other piece of REQ-078 could have shipped and worked: the type, the migration, the money, the cell, the
LINE, the filter — and **staff would have had no way to create an อื่นๆ booking at all.** A feature that is
complete everywhere except its own entry point. Putting the trap **on the line in all three arrays** is the right
fix: *a `Record<BookingType,…>` fails the build when the union widens; an array of the same type does not.*

📌 **2. `resolveSubjectId` throws for a booking with no program.** The request would never have been made, and
the error would have read as a **validation rule** — so the first person to hit it looks at the form, the zod
schema and the BE, and never at a helper that raises client-side. tsc could not see it because throwing is a
perfectly typed thing to do.

📌 **3. The mock built `displayName: ""` — a blank cell, which is AC-10's exact failure.** `...input` silently
dropped `otherTitle`→`title` and `additionalTeacherIds`→`teachers` because the wire and the app object name them
differently; `title` is optional and extra keys ride along, **so both sides typechecked.** Same family as the
allow-list literal that dropped `discount` (TASK-170): **a name mismatch across a boundary is invisible to types
on both sides of it.** Worth remembering that this one surfaced in the *mock* — the cheap environment caught the
defect the expensive one would have shown to the owner.

📌 **And the templated-key block matters beyond this task.** `keys.test.ts` scans literal `t("…")` only, so a key
built from a template resolves to nothing with **nothing in this repo noticing**. You closed it for these keys in
both directions — every emitted key exists, and no key is emitted outside the list. That is a gap in a guard,
found while using it.

### Your two questions

> **Q1 — AC-12 as one `SegmentedControl` value, so "both set" is unrepresentable.** ✅ **Better than what I asked
> for, and keep it.** The task offered *"prevent the combination **or** state which applies"*; **a state that
> cannot exist beats a message explaining a state that can.** The BE refusal and the DB CHECK remain as the
> backstops they were always meant to be, rather than as the primary defence. The cost you name (switching the
> source hides the other field) is the correct trade — a hidden field the user is not using is not a loss.

> **Q2 — `detectConflict` runs against `teacherIds[0]` only, mirroring the BE.** ✅ **Right not to build it, and
> for the right reason: a client-side check the server does not enforce is its own kind of lie.** But your other
> point stands and is the useful one — **the form is where a warning would actually help**, because it is where
> someone picks the teachers. ⇒ I am **merging this with the clash question already with @Porter** so he decides
> **both halves at once**: whether the state is allowed at all, and if so where the human is told. Three separate
> reports of the same residue (Jason's index note, your day-cell drop in TASK-227, this) is enough to make it one
> decision rather than three notes.

### 📏 The 375 case — your correction accepted
The DoD named *"the charge row (toggle + amount + item picker)"*; you report that in this implementation it is a
**vertical stack, not a row**, so the case I anticipated does not exist. **Correct to say so rather than measure
something else and call it done.** The risks you name instead — the two-segment control at ~50% each carrying
*"ระบุจำนวนเงินเอง"* / *"เลือกจากแคตตาล็อก"*, and the teacher `MultiSelect` once pills wrap — are the real ones,
and they are **labelled as static analysis, not as a measurement**. Routed with the rendered check.

**Rendered check → LOCAL, like TASK-147**, not the `sid` queue: everything here is reachable offline. ⚠️ Your
caveat is carried verbatim — **the empty state is not reachable as shipped** (the mock returns two items; it
needs `delay([])` for one run), so it is named in the routing rather than quietly assumed covered.

**Status → DONE (code). This is the last task of REQ-078 ⇒ the REQ goes SPEC_DONE.**
