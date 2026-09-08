# SPEC-075 — REQ-076: พักการจองรายครั้ง, grounded in the status enum and the slot index

**Status:** ACTIVE · **From:** @Sober (2026-09-06) · **Source:** `REQ-076` AC-1…AC-18 (`READY_FOR_SA`)
**`uat` batch #3** — the largest item, and the one whose size was least known.

> **The sentence everything must agree with, the owner's:** *a hold, and nothing else.* It moves no money,
> returns no entitlement, forgives no expiry and asks for no reason. **Every richer behaviour belongs to REQ-081.**

---

## §1 The representation: a new `PAUSED` status, and the ORIGINAL slot is kept

A paused booking is *"dateless"* to the calendar (AC-10) but the tray must still show **the original date/time**
(AC-12). ⇒ **keep `date` / `start_time` exactly as they are** — they become *the slot it came from* — and let the
**status** carry the fact that it is not scheduled.

🚫 **Do NOT null the date.** `bookings.date` is `NOT NULL` and the entire product assumes it. Making it nullable
to express "paused" would put a null in every query in the codebase to solve a problem the status already solves —
**and it would destroy AC-12 in the same move.**

⇒ **`PAUSED` joins `SLOT_INACTIVE_STATUSES`.** That one list is what AC-17 is made of: `bookings_teacher_slot_uq`'s
predicate is built from it, and so is every application availability check (TASK-239 made them one literal).

## §2 🔴 This needs a migration — and it needs **TWO**, for a reason that will not be obvious

`bookingStatus` is a **`pgEnum`** (`schema.ts:50`). Adding `PAUSED` is
`ALTER TYPE booking_status ADD VALUE 'PAUSED'`.

🔴 **A new enum value cannot be USED in the same transaction that adds it**, and this repo's migrations run in
one. The index predicate references `'PAUSED'` as a value of that type ⇒ **a single migration that adds the value
and rebuilds the index will fail.**

⇒ **Two hand-authored migrations, both registered in the journal:**
| | |
|---|---|
| **`0033`** | `ALTER TYPE booking_status ADD VALUE 'PAUSED'` |
| **`0034`** | `DROP INDEX bookings_teacher_slot_uq` + recreate it with `'PAUSED'` in the `NOT IN` list |

⚠️ **`db:verify` (REQ-032) needs a witness for each, on an object that exists only after it ran** — the enum
**label** for `0033`, and the **new index predicate** for `0034`. **Not the index's existence** — it exists
before and after; only its `WHERE` changes. **This is the `0022` blindness exactly, and it is easy to repeat here.**
🔴 **It runs on `uat`, a customer's live box:** dropping and recreating a unique index takes a lock. **State the
expected duration and put it in the deploy note** — this is the batch's only schema change and the only step that
can block writes.

## §3 🚫 Why NOT reuse `PENDING_RESCHEDULE`, which looks like a free ride

It is already in `SLOT_INACTIVE_STATUSES` **and already in the index predicate** — so reusing it would need **no
migration at all.** ⇒ **Refuse it anyway.** The schema calls it *"legacy rows from the old B.1 flow"*, it carries
`incomingBookingId` / `proposedTo` semantics, and `course-history` maps it to **`scheduled`**.
📌 **The tray would then show 2023's abandoned reschedules beside today's pauses, and nothing could tell them
apart.** **Two meanings on one status is the class of thing this project keeps removing** — and the saving is one
migration, paid for with a permanently ambiguous status.

## §4 The tray is FRONTEND — and the batch has not accounted for that
AC-9…AC-12 are a calendar-page component: visible without navigating or opening anything, **never a cell in the
grid**, deliberately-empty when empty, and each row naming student · type · original date/time.
⚠️ **@Porter: the batch was sequenced for one engineer, and this item has an FE half.** It is the only one that
does. **That is a scheduling fact, not a problem** — it can run in parallel — **but @Fern has not been briefed on
this batch at all.**

## §5 The two LINE messages — no new machinery
AC-7 (paused) and AC-15 (resumed) are two new `kind`s through the existing
`enqueueLine` → outbox → `formatOutboxMessage` path, with @Porter's copy verbatim.
⚠️ **AC-7's "no teacher ⇒ no message" is an ENQUEUE rule, not a rendering one** — the same rule SPEC-072 §5 set
for a studentless อื่นๆ: **no recipient ⇒ no row**, never a SKIPPED row implying we tried.
✅ **`recipientType: "teacher"` ⇒ TASK-253's audience projection applies for free.**

## §6 Resuming (AC-13/14/16)
Any date and time, not only the original. **AC-14 must reuse the existing clash refusal** — REQ-078 AC-24's
message shape, `slotClashMessage` — **one clash rule in the product, not two.**
📌 **AC-16 needs no work if §1 is right:** a resumed booking is `CONFIRMED` with a date, and every downstream path
already treats it as ordinary. **If AC-16 requires code, §1 was wrong** — that is the check on the design.

## §7 What must not move
- 🚫 **REQ-071's course pause and its wording** (AC-3) — untouched.
- 🚫 **No money, no entitlement, no expiry change** (AC-4/5/6). ⚠️ **AC-6 is an absence: the expiry clock keeps
  running.** Assert that nothing touches `expiryDate` on this path.
- 🚫 **No reason code** (AC-8) — REQ-009's list must not appear. Offering it teaches staff that pause and cancel
  are the same act.
- 🚫 **AC-2:** an `ATTENDED` booking is never pausable.

## §8 Split
1. **BE** — status, the two migrations, the slot/day-end exclusion, pause/resume endpoints, the two LINE messages.
2. **FE** — the tray, the pause and resume controls. **Needs @Fern**, and needs @Porter to place her in the batch.
🅿️ **AC-18's other half** (does a parent see a paused booking in `คอร์สของฉัน` at all) is **Open in the REQ and
does not block either** — one line of LINE copy, and it can follow.
