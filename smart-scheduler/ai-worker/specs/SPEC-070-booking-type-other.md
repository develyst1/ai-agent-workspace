# SPEC-070: อื่นๆ (OTHER) — a fifth booking type that is honest about being something else

- Source: **REQ-078** (the owner's REQ-005). Priority 🔴 HIGHEST — his #1 of the remaining frontoffice work.
- Status: **ACTIVE**
- Repos: `smart-scheduler-back` (schema, migration, create, day-end, cancel, LINE) · `smart-scheduler-front`
  (the form, the cell, every surface that names a booking)
- Tasks: **TASK-224** (BE core) → **TASK-225** (BE money) → **TASK-226** (FE form) · **TASK-227** (FE cell/naming,
  after 224) · **TASK-228** (BE LINE, after 224)

## Overview

`booking_type` gains a fifth value, `OTHER`. The admin configures each instance: student or no student, charged or
free, consuming an entitlement or not. Where there is no student, the admin **types a title**, and that title is the
booking's name everywhere it appears.

**The single most useful thing I found while grounding this: most of REQ-078 is already built.** The day-end engine
is type-agnostic, so three acceptance criteria come free (see the table). What is genuinely new is: the enum value,
three nullable/added columns, two price sources, and the FE.

## What the existing code already gives us — verified, not assumed

| REQ-078 asks | Already true at | So the work is |
|---|---|---|
| **AC-9** unmarked session auto-attends at 23:30 | `jobs.service.ts:42-72` — the auto-attend select filters on `status = CONFIRMED` + slot ended, **no booking-type condition** | **nothing** — it applies the day `OTHER` exists |
| **AC-7 / AC-8** consumes / does not consume | the same block deducts iff `courseId` / `voucherId` is set (`:55`, `:62`); the manual-attend path does the same (`scheduler.service.ts:2183`) | **nothing but validation** — "consume" IS "set `courseId`/`voucherId`" |
| **AC-13** cancel with a stored, queryable reason | `REASON_ENUM_REQUIRED` in `scheduler.service.ts:2211`; `0025`'s `cancel_reason` column + CHECK already carry the three reasons | **one line** — add `OTHER` to the set (the TASK-220 shape exactly) |
| **AC-6** revenue attributed to a real item | `bo.movement.item_id` is the attribution seam; `revenue-attribution.ts` in backoffice reads the item, not a label | post against the chosen item and the report breaks down for free |

📌 **Why this matters for sequencing:** the risk in this REQ is **not** the behaviour. It is the three `NOT NULL`
columns underneath it.

## 🔴 The real problem: `bookings` has three NOT NULL columns this feature must loosen

`db/schema.ts:344` — `student_id`, `teacher_id`, `subject_id` are **all `NOT NULL` with FK `restrict`**.

| Column | REQ-078 needs | Verdict |
|---|---|---|
| `student_id` | **explicitly optional** (requirement 2, AC-2, AC-10) | **nullable.** Not negotiable — it is the requirement. |
| `subject_id` | an อื่นๆ booking has **no program** — "ประชุมทีม" is not a sport | **nullable.** See below. |
| `teacher_id` | implied by **AC-17 only** | 🔴 **QUESTION to @Porter — not built. See Q1.** |

### `subject_id` → nullable, NOT a placeholder subject row

The tempting shortcut is a hidden `อื่นๆ` row in `subjects` (the way `1st Trial` sits there inactive). **Reject it.**
REQ-065 exists precisely because `1st Trial` being a subject leaked into the program picker and had to be filtered
back out at `toTeacherDTO`. A fake `อื่นๆ` program would leak the same way — into the picker, into `link-all`, into
`price_group` (a NULL price group is how a program silently loses its prices, board ⚠️), and into Porter's
*"which programs can't be booked?"* query. **A booking with no program should have no program**, and the DTO should
say `subject: null` rather than name a fiction.

### `student_id` → nullable, and ONE computed display name

`toBookingDTO` calls `studentRef(b.student)` unconditionally (`mappers.ts:110`) and would throw on null. The FE has
**31 booking-surface readers** of `.studentName` / `.nickname`.

🔴 **Do not make 31 call sites each invent their own fallback.** The DTO gains:

```
student:     StudentRef | null      // null ⇒ TypeScript points at the callers that genuinely need the object
title:       string | null          // the admin's words, OTHER only
displayName: string                 // ← what every surface renders: title ?? nickname ?? name
```

`displayName` is computed **once, on the BE**, for **every** booking type — a 1HR booking's `displayName` is its
student's nickname, unchanged behaviour. That is what keeps the FE change a rename rather than 31 conditionals, and
it is what makes AC-10's *"never a cell labelled blank or 'other'"* a property of one function instead of a promise
repeated in 31 places.

## Data model

**One migration.** ⚠️ **Count the files at the moment you write it** (board rule: *"no migration" is a CLAIM*).
Today `drizzle/*.sql` = 28 and journal tags = 28, newest `0027` ⇒ the next is **`0028`** — but **TASK-218 also claims
`0028`**; whichever lands second takes `0029`. Hand-authored + journal-registered per `drizzle/README.md` (do **not**
run `db:generate` — the snapshot chain stops at 0003), with a witness in `migration-witness.ts` probing the **last**
object it creates.

```sql
ALTER TYPE "booking_type" ADD VALUE IF NOT EXISTS 'OTHER';
ALTER TABLE "bookings" ALTER COLUMN "student_id" DROP NOT NULL;
ALTER TABLE "bookings" ALTER COLUMN "subject_id" DROP NOT NULL;
ALTER TABLE "bookings" ADD COLUMN "other_title"          text;
ALTER TABLE "bookings" ADD COLUMN "other_price_minor"    integer;
ALTER TABLE "bookings" ADD COLUMN "other_price_item_id"  uuid;   -- → bo.item(id)
-- structural, not policy: the two price sources are mutually exclusive (AC-12)
ALTER TABLE "bookings" ADD CONSTRAINT "booking_other_price_chk"
  CHECK ("other_price_minor" IS NULL OR "other_price_item_id" IS NULL);
```

⚠️ **Two migration traps, both real:**
1. **`ALTER TYPE … ADD VALUE` and using the new value cannot share a transaction.** Nothing in this migration
   *uses* `'OTHER'`, so it is safe — **keep it that way**; do not add a backfill or a CHECK naming `'OTHER'` to
   this file.
2. **`DROP NOT NULL` is not witnessable by existence.** *"Does `student_id` exist?"* is true before and after — the
   same blindness that let `0022` hide (board 🔴 MIGRATION CHECK). **Witness on the newly-created object**
   (`booking_other_price_chk` or `other_title`), which exists only after this migration.

🔴 **Standing rule, and it has teeth here:** *"หากเรามีการ migrate ก็ต้องลองที่ sid ก่อน ห้ามพลาด"* — run and verify
on **`sid` first**, `db:verify` ✅ **before** any restart, then `uat`. **The TASK must state how it was proven on
`sid`.** `uat` holds the customer's real families and real money.

**Why the CHECK is allowed here and the `course_size_chk` lesson does not apply:** `0027` removed a *price card*
from the DB — a business rule that changes when the owner changes it. "These two columns are never both set" is
**structural integrity**, it changes only if the design changes, and the app enforces the same rule with a real
message (AC-12). One is policy in the wrong place; the other is a shape.

## Money — the two price sources (AC-4 / 5 / 6 / 12)

`recordSale` cannot serve this: it derives the amount from `bo.item.unit_price_minor` for a **product code** in
`SALE_ITEMS` (`sale-post.ts:70-95`). A typed amount has no product, and a backoffice catalogue item has no
`external_source = 'smart-scheduler'`. So the money path is **post by item id with an explicit amount**:

```
postBookingSale({ itemId, amountMinor, refId: bookingId, idempotencyKey: `rev:${bookingId}` })
  → bo.movement { item_id, qty: -1, value_minor: amountMinor, reason/ref_type: 'SALE', ref_id, idempotency_key }
```

- **Catalogue item chosen** → `itemId` = that item, `amountMinor` = **its own `unit_price_minor`, read at posting
  time** (the same "re-read the price when you post" rule the day-end discount already follows,
  `jobs.service.ts:131`). Attribution is correct by construction — AC-6.
- **Typed amount** → `itemId` = a dedicated INCOME item `other-booking` (seeded by `sale:ensure-items`),
  `amountMinor` = the typed amount. A generic bucket is acceptable **only here**, because the admin's title is the
  breakdown and there is no product to attribute to.
- **Neither** → **nothing is written at all** — AC-4. Not a zero movement: a ฿0 row would appear in the ledger as a
  sale that happened, which is a different claim from "this was free".

🔴 **Same sign rule as everywhere:** `qty` negative = OUT, `value_minor` **positive** (`bo-money.ts:17`). Pin it in a
test; a flipped sign here is invisible until month end.

📌 **It reuses `rev:<bookingId>`**, so **SPEC-069's "revenue already posted" warning covers อื่นๆ the day it lands**,
with no second lookup and no type list to update. That is the payoff of keying detection on what the poster writes.

⚠️ **VAT:** every price in `sale-items.ts` is **VAT-inclusive** (`PRICES_ARE_VAT_INCLUSIVE`). A typed amount must be
treated the same — the number the admin types is the final amount. Say so on the field (TASK-226) or the first
person to type a net figure silently misstates a month.

## Flow

1. **Create** — type `อื่นๆ`; student optional; title required when there is no student; charge off / typed amount /
   catalogue item (exactly one); consume off / a course / a voucher. `subjectId` not required.
2. **Confirm** — teacher LINE per AC-16/17 (TASK-228).
3. **Attend** — manually, or auto at 23:30 (existing engine). Entitlement deducts iff linked (existing engine).
4. **Day-end** — if charged, post once, keyed `rev:<bookingId>`; if not, write nothing.
5. **Cancel** — the existing reason dialog, reason stored and queryable (one line, AC-13).

### Error cases (the negatives ARE the requirement here)
- No student **and** no title → refuse, *"กรุณาระบุชื่อรายการ"* (AC-10). Never a blank cell, never "อื่นๆ" as a name.
- Amount `0`, negative, or not a number → refuse, *"กรุณาระบุจำนวนเงินให้ถูกต้อง"*, **nothing booked** (AC-11).
- Both price sources set → refuse (AC-12). The DB CHECK is the backstop; the message is the product.
- 🔴 **Refuse, never clamp, never silently pick one.** The same line REQ-063 held on discounts.

## Non-functional

- Auth/roles: unchanged. **No new admin-only gate** — an อื่นๆ booking is ordinary staff work. (`assertMayDiscount`
  stays exactly as it is; a *discount* on an อื่นๆ booking is out of scope, see below.)
- The calendar hot path must not gain a query. `displayName` is computed from rows already loaded.
- No change to the four existing types anywhere — **AC-14 is a regression test, not a hope.**

## Out of scope (named so nobody guesses)

- Recurring อื่นๆ bookings; blocking a whole day/rink in one action (REQ-078 §Out of Scope).
- Reversing a charged อื่นๆ booking — backoffice, as everywhere.
- **A discount on an อื่นๆ booking.** REQ-063's five types do not include it and REQ-078 does not ask; a typed amount
  already lets the admin charge whatever they mean to. `createBooking`'s `discount` stays refused for `OTHER`.
- Voucher-program exclusion rules (`VOUCHER_EXCLUDED_GROUPS`) against an อื่นๆ that consumes a voucher — no program
  is involved, so the rule has nothing to test. Flagged, not decided.

## Tasks

| Task | Repo | Depends on | What |
|---|---|---|---|
| **TASK-224** | back | — | migration + schema + create/validate + DTO (`title`, `displayName`, nullable student/subject) + cancel enum |
| **TASK-225** | back | 224 | `postBookingSale`, the `other-booking` item, day-end charging, the catalogue-item list the form needs |
| **TASK-226** | front | 225 | the booking form: type, title, charge (amount \| item), consume |
| **TASK-227** | front | 224 | calendar cell + legend + every surface renders `displayName`; อื่นๆ visually distinct |
| **TASK-228** | back | 224 | teacher LINE — AC-16 (title names it) / AC-17 (no teacher ⇒ silence by design) |

---

# 🔄 AMENDMENT 2026-08-31 — the owner answered Q1 and **widened it**: an อื่นๆ booking may have MANY teachers

> Owner: *"ทุกการจองต้องมีครู แค่การจองนั้น อาจจะครูหลายคนได้"* · *"1. yes 2. yes ถ้าครูหลายคน ไม่ต้องมีให้ใส่การได้ตังค์"*
> · Q7 = **(ก) the teacher's pay**, not the customer charge.

**Q1 is closed the way the build already assumed — teacher is REQUIRED — and AC-17 is WITHDRAWN, not deferred.**
Everything above stands. What follows amends it. **New criteria: AC-18 · AC-19 · AC-20 · AC-21 · AC-22 · AC-23.**

## Data model for many teachers — `teacher_id` stays, additional teachers get a join table

```sql
CREATE TABLE "booking_teachers" (
  "booking_id" uuid NOT NULL REFERENCES "bookings"("id") ON DELETE CASCADE,
  "teacher_id" uuid NOT NULL REFERENCES "teachers"("id") ON DELETE RESTRICT,
  PRIMARY KEY ("booking_id", "teacher_id")
);
```

- `bookings.teacher_id` stays **`NOT NULL`** and holds the **first** teacher. Every existing reader, index, hold
  and report keeps working untouched — **this is additive, and AC-20 (the four types still take exactly one) is
  then true by construction rather than by a guard.**
- `booking_teachers` holds the **additional** teachers only, and only for `OTHER`.
- 🔴 **`ON DELETE CASCADE` is what makes AC-18's "cancels as one" free** — there is one booking row; a cancel is
  one status change that every teacher's column reads.
- 🔴 **One accessor, never two reads.** A single mapper answers *"who teaches this booking?"* —
  `teachers = [row.teacher, ...row.additionalTeachers]` — and **nothing outside it may read either source
  directly.** Two call sites reading two sources is how the two get to disagree. `teachers[0]` is always
  `teacher_id`, so ordering is stable and the DTO can carry `teachers` for **every** type (length 1 for four of
  them, which keeps the FE on one shape).

## What multi-teacher does NOT change

- **AC-20** — course / 1HR / trial / voucher take **exactly one** teacher. Validation refuses
  `additionalTeacherIds` on those four types outright, so the join table can only ever hold `OTHER` rows.
- **The customer charge is unaffected** (Q7 = ก): a multi-teacher อื่นๆ **can still bill the customer**. The
  `คิดเงินรายการนี้` toggle and everything in §Money above is untouched by the teacher count.
- **The calendar's cell key** (`date|teacher.id|startTime`) is unchanged — the booking is simply placed once per
  assigned teacher (TASK-227).

## 🔴 AC-21 — an อื่นๆ booking draws NO freelance budget, from anyone

Today **any** booking on a FREELANCE teacher draws an hour when its status becomes holding:
`reconcileBookingHolds` → `heldTarget(status)` → a `bo.movement` keyed `fl:<bookingId>:<item>:held1`
(`scheduler.service.ts:195-231`). `heldTarget` is **status-only** — it has never had a booking-type opinion — so
**an อื่นๆ booking would silently draw an hour off a freelance ceiling today.**

**Fix at ONE place: guard inside `reconcileBookingHolds` itself — `bookingType === "OTHER"` ⇒ hold nothing,
release nothing, return.** There are **six** call sites (`:1984 · :2061 · :2398 · :2482 · :2956` and the move
path); guarding six is how five stay right and one drifts. 🚫 **Do not touch `heldTarget`** — it answers "what does
this *status* hold", which is still correct; the type question is a different one and belongs where the booking
is known.

## ✅ AC-22 / AC-23 — @Porter's technical question, ANSWERED: there is **no build**

> *"does an explicit per-booking teacher-pay input exist in the product today at all?"*

**No. It does not exist, and AC-22 is satisfied by absence.** Verified rather than remembered:

| Checked | Result |
|---|---|
| `createBooking` request schema (`validation.ts:99-128`) | no pay / earning / rate field of any kind |
| `bookings` table (`db/schema.ts:340-400`) | no pay column |
| BE grep `teacherPay\|payMinor\|earning\|teacher_rate` | only `rateMinor`, which is **the teacher's own freelance setting** (`schema.ts:212`, `validation.ts:383`), set on the teacher — never on a booking |
| **FE** grep `teacherPay\|payMinor\|earning\|ค่าสอน\|ค่าตอบแทน` | **zero matches in `src/`** |

Teacher money on this project is **only** the freelance monthly ceiling drawn automatically by attendance
(REQ-001/004). There is no field to hide, on any booking type.

⇒ **AC-22 = a verification, not a task: "no teacher-pay control is offered" is already true of every form.**
⇒ **AC-23 is satisfied identically** — a single-teacher อื่นๆ gets the same (absent) pay behaviour as every other type.
⇒ **@Porter — this also resolves the consistency you flagged:** AC-21 and AC-22 are consistent precisely *because*
the automatic ceiling draw is the only mechanism. AC-21 turns it off for อื่นๆ; AC-22 refers to a field that has
never existed. **If the owner expected to type a teacher's pay on a booking, that is a NEW requirement, not this
one** — and worth putting to him in exactly those words, because "the field is absent" will look identical to
"the feature was built" on his screen.

## Where the amendment lands

| Task | Added |
|---|---|
| **TASK-224** | `booking_teachers` in the same migration · `additionalTeacherIds` validation (อื่นๆ only, AC-19/AC-20) · `teachers[]` on the DTO via ONE accessor · the `reconcileBookingHolds` OTHER guard (AC-21) |
| **TASK-226** | the form takes several teachers for อื่นๆ; **at least one is required** (AC-19); one teacher only for the other four (AC-20) |
| **TASK-227** | one booking rendered in **every** assigned teacher's column, recognisable as one (AC-18) |
| **TASK-228** | **each** assigned teacher gets the LINE + schedule line (AC-16 revised); **AC-17 deleted from the task** |

---

## Questions

**Q1 — ✅ ANSWERED 2026-08-31 (kept for the record; superseded by the amendment above).**
*Must an อื่นๆ booking be creatable with NO TEACHER?*

REQ-078's requirement list says *"with or without a **student**"* and never says "without a teacher". **AC-17** and the
*"ปิดปรับปรุงลาน"* example imply teacher-less, and the owner's Q4 answer (*"ไม่มีครูก็ไม่ต้อง"*) **describes** that
case — but describing a case is not the same as ordering the system to support it, and here the difference is
structural:

> 🔴 **The calendar is a grid of teacher columns.** `getCalendar` keys every cell
> `${date}|${teacher.id}|${startTime}` (`scheduler.service.ts:461`). **A booking with no teacher has no column to
> render in** — it would save successfully and then be invisible on the one screen this feature exists to fix. Making
> it visible is a calendar redesign (an all-teachers band, or a rink-level row), not a nullable column.

**I am building teacher-REQUIRED** (student optional, which is what the REQ actually requires) so the owner's #1 starts
now and AC-1…AC-16 all land. **AC-17 is the only criterion this leaves open**, and I would rather hand you 16 of 17 with
the 17th named than guess a calendar redesign into a HIGHEST-priority build.

**Two ways to close it, for the owner:**
- **(a)** อื่นๆ always has a teacher — *"ปิดปรับปรุงลาน"* is booked against whoever is affected, or a staff row. AC-17
  becomes unreachable-by-design and should be struck. **Zero extra work.**
- **(b)** teacher-less อื่นๆ is real ⇒ it needs its own **place on the calendar**, and that is a separate REQ with its
  own design. Say the word and I spec it after this one.

**Q2 — @Porter: what does "an existing catalogue item" mean to the owner — the BACKOFFICE catalogue?**
I have built it as `bo.item` (INCOME, active) — the backoffice's own item list, which is what "catalogue" names in
this system since REQ-006. The alternative reading is the frontoffice product codes in `sale-items.ts`
(`course-6`, `voucher-10`, …), which would be wrong for this purpose — selling "a course-6" as an อื่นๆ booking would
post course revenue with no course behind it. **Not blocking:** I am proceeding with `bo.item` and will say so in the
TASK; correct me if he meant something else.

**Q3 — @Porter, for the record, no answer needed before the build:** AC-6 says revenue is attributed to the chosen
item. The **typed-amount** case necessarily lands in one `other-booking` bucket — there is no product to attribute to.
That satisfies AC-5 and does not contradict AC-6 (which is scoped to the catalogue case), but if the owner expects
typed-amount อื่นๆ revenue to break down by anything finer, the answer is "choose a catalogue item instead", and he
should hear that from you rather than discover it in a report.
