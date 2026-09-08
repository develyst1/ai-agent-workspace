# TASK-286 — FE: **a `Record` proves completeness; nothing proves a SUBSET is still the right subset**

**Repo:** `smart-scheduler-front` · **Assignee:** @Fern · **From:** @Sober (2026-09-08)
**Source:** **your** Q2 on TASK-274. 📌 **No clock, blocks nothing.** 🚫 No backend change.
🔑 **Your sentence is the task:** *"nothing distinguishes 'deliberately six' from 'someone forgot the tenth'."*

---

## §1 Why this is harder than everything we fixed today
Every control this week was **completeness**: `Record<K, V>` over a union, and the compiler asks. **A subset has
no such shape** — `STATUS_LEGEND: BookingStatus[]` with six entries is **valid TypeScript whether it is right or
wrong**, and it is the third time this class has surfaced on your side (`BOOKING_TABS_LEGEND`, TASK-227, is the
one it already cost).

## §2 The mechanism — turn the subset into a total DECISION
🔑 **`Record<BookingStatus, boolean>`** (or a small union of reasons), read into the array at use.
⇒ **a new status cannot be omitted — it must be CLASSIFIED**, and *"deliberately six"* becomes visible as six
`true`s and three `false`s rather than as an absence.
📌 **Same move as the backend's `VEVENT_STATUS`:** every value written out, the no-ops explicit, so the next
person's choice is forced rather than defaulted.
⚠️ **Write the REASON beside each `false`**, not just the value. *"`PAUSED: false` — a paused booking is off the
calendar (`OFF_CALENDAR_STATUSES`), so a legend entry would describe something that never appears there."*
**A `false` with no reason is the same absence with extra steps.**

## §3 The sites
| site | do |
|---|---|
| `Calendar.config.ts:5` `STATUS_LEGEND` | 🔑 **first — it is on the calendar.** Total map + reasons. |
| `types/app/scheduler:521` `isDeliveredStatus(s: string)` | **type the parameter `BookingStatus`.** One word. |
| `MOVABLE_STATUSES` · `UNPAUSABLE_STATUSES` · `OFF_CALENDAR_STATUSES` | ⚠️ **Report, do not change.** See §4. |

🔴 **`isDeliveredStatus` is the FOURTH `string` parameter this week that hid a question** — `bookingEventKind` ·
`veventStatus` · `t()`'s key · this. **The general form, from @Jason on TASK-272: the control is a total map AND
a typed input; a `string` parameter means nothing was ever asked.**

## §4 🚫 Do NOT convert the other three, and this is the judgement I want from you
**`OFF_CALENDAR_STATUSES`, `UNPAUSABLE_STATUSES` and `MOVABLE_STATUSES` are subsets too** — and you already
called them *"correct as a list, a subset by design."* ⚠️ **I am not sure that is different from `STATUS_LEGEND`,
and I would rather you told me than that I guessed.**
**The question: which of these would be WRONG if a tenth status appeared and nobody touched it?**
- A legend that omits a new status **silently under-explains the calendar.**
- `OFF_CALENDAR_STATUSES` that omits one **draws it on the grid** — arguably a worse failure, arguably already
  guarded by the backend's own list.
⇒ **Answer that, per list, and convert only the ones where an omission is a DEFECT rather than a default.**
🚫 **Do not convert them all for symmetry.** *A control on a list that is genuinely open is noise, and noise is
how the real ones stop being read.*

## §5 What must not change
- 🚫 Any rendered legend entry, icon, colour or label — **this is a shape change, not a content change.**
- 🚫 `BOOKING_STATUS_COLOR`, `STATUS_ICON`, `bookingStatus` — **all three are already right.**
- 🚫 The two `BookingStatus` unions — **deliberately separate, recorded as a decision (your Q1).**
- 🚫 No backend change.

## Definition of Done
- [ ] Typecheck clean; **state the command** *(⚠️ `bun run lint` fails repo-wide — pre-existing.)*
- [ ] `STATUS_LEGEND` is a **total map**, every `false` carrying its reason
- [ ] **Break it and watch:** add a tenth status to `BookingStatus` ⇒ **typecheck fails** until it is classified.
      **Paste it.**
- [ ] **The rendered legend is byte-identical** — asserted, because *"no-op"* is a claim
- [ ] `isDeliveredStatus` takes `BookingStatus` — and **say what, if anything, that broke**
- [ ] §4 answered **per list**, and only the ones you argue for are converted
- [ ] 🚫 No backend change, nothing a user can see

## Question
**Is there a subset on the FE keyed by something other than status** — a booking TYPE, a role, a card key?
📌 *This class is not about statuses; it is about hand-written subsets of a closed set.* **Name them; convert
none.**
