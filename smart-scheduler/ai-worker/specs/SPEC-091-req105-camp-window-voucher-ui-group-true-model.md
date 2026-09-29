# SPEC-091 — `REQ-105` §1 camp per-coach window · §2 cancelled-voucher UI · §3 the GROUP true model (+ §5 answers, the edge) — EXISTS vs GAP + sizes (Sober, 2026-09-23). **Analysis only; nothing dispatched.**

---
## §1 CAMP — a per-COACH time window inside a day

**Exists.** `camp_week_days` (`schema.ts:1109`) = `{ camp_week_id, date, teacher_ids uuid[], start_time, end_time, edited_at }` — **ONE window per DAY, shared by every coach on it**; `syncCampDayRows` derives `teachers × the window's hours`, one derived `OTHER/CAMP` row per coach per hour (TASK-418), and since TASK-443 each row carries that coach's day rate. `'{}'` teachers ⇒ no block.

**Gap.** Coach A 10:00–12:00 and coach B 13:00–15:00 on the same date cannot be expressed: both get the whole window.

**Design — the day's coach list becomes rows, not an array.** `camp_week_day_teachers (camp_week_day_id, teacher_id, start_time, end_time, PK(day, teacher))`, defaulting to the day's window when a coach is added; `camp_week_days.start_time/end_time` stay as the DAY's default and as the fallback for a week-level edit. `teacher_ids[]` is **read** in the sync and the roster only, so the move is: the new table becomes the source, `teacher_ids[]` is dropped in the same migration (one backfill statement inside it — every existing coach gets the day's window, so nothing changes behaviour on `uat`), and the TASK-443 rate table joins it by the same PK. `syncCampDayRows` then derives each coach's OWN hours (its diff already inserts/deletes per `teacherId|HH:MM` — the wanted-set builder is the only change). The kid COUNT on the block (§5) is a read of the day's `camp_days` rows, not a coach fact — one number on the roster/grid DTO.
**Size: BE S–M** (`0053`: the table + backfill + drop; the wanted-set; the DTO; the count) · **FE S** (a from/to per coach row in the day editor, defaulting to the day's window; the count on the calendar block).
**Owner decisions:** (a) may two coaches' windows overlap? (I say yes — two blocks at 10:00 is two coaches teaching, which §11 already allows); (b) a coach whose window is outside the day's default — allowed, or clamp? (I say allow, the day's window becomes a default only).

---
## §2 Cancelled VOUCHERS in their own place

**Exists.** REQ-103 gave a voucher `status: ACTIVE|EXHAUSTED|EXPIRED|ENDED` and the card its `Ended · Nh left` chip (TASK-439/440); the voucher list is the Bookings page's `VoucherPanel`, **one flat list, no separation** — a cancelled voucher sits among the active ones. Courses are NOT separated by section today either (`CoursePackagePanel` marks a cancelled course with a `Ban` icon in place); so "like cancelled courses" describes the customer's *wish*, not an existing pattern to copy.

**Design.** One sort + one style, both surfaces: live entries first (by date), then ENDED/EXPIRED/EXHAUSTED at the BOTTOM, faded (`opacity` + the existing chip), under a small `ยกเลิก/หมดอายุ` divider row; no separate page, no route. Pure `sortEntitlements(rows)` value-tested, shared by the voucher and course panels so the two cannot drift.
**Size: FE S · BE 0.** **Owner decision:** apply the same bottom+faded rule to cancelled COURSES at the same time (I recommend yes — one rule, and it is what "like cancelled courses" assumes).

---
## §3 GROUP — the customer's true model vs ours (the infographic + §5 answers)

**What the customer means:** a recurring slot that **exists permanently on the calendar every week even with ZERO students** (two colour states: has-students / no-students), **pinned to a Head Coach** (swappable), headcount free and **uncapped**, kids enrol/renew freely, it runs **until an admin closes it** (no end date); on an **empty** date the coach is FREE — Private bookings may be taken in that slot (**overbook allowed**); on a date with ≥ 1 enrolled kid, no Private and the slot occupies the coach; an extra coach may be added to **one specific session** when it is busy.

**What we have (TASK-397/399/441).** A GROUP series = one **GROUP booking row per date** (`group_key`, `head_count`, primary + extras + rates), born CONFIRMED, with each child's COURSE seat row (`group_id`) drawn from that child's own package. Against the list:
| customer's rule | today | verdict |
|---|---|---|
| a slot that renders weekly with ZERO students | **the GROUP row EXISTS on its own** — it is a real booking row holding the coach's hour, with or without seats | ✅ **fits** (Porter's suspicion that the slot is only materialised by bookings is not the case — the row is the slot) |
| runs until closed, no end date | rows are created for the dates asked for; there is **no "open-ended" generator** — someone must add dates | 🟠 **gap (small):** a rolling extender (keep N weeks of rows ahead; a job or an "add dates" default) + a `closed_at` on the series |
| pinned to a Head Coach, swappable | the row's primary teacher, swappable from a date (seats follow) | ✅ fits — "Head Coach" is the primary; a label, not a model change |
| headcount free, no cap | `head_count` is a **hard cap** (`seatOnGroup` refuses past it) | 🟠 **gap (small):** cap nullable ⇒ unlimited (the cap check skipped when null) |
| two colour states on the calendar | the grid shows one GROUP block; no empty/occupied distinction | 🟠 **gap (FE S):** the DTO already knows the seat count |
| empty date ⇒ coach FREE, Private may be booked in the slot (overbook) | 🔴 **the GROUP row HOLDS the slot** — `slot-holder.ts` counts it, so a Private in that hour is refused (`SLOT_TAKEN`) | 🔴 **the real gap.** The slot-holder predicate is ONE rule in five mirrors (SYSTEM-FACTS); it must become "a GROUP row holds the coach's hour **only when it has ≥ 1 live seat**". That is a change to the shop's most load-bearing rule — it needs its own task, its own pins, and a careful read of the five mirrors. **BE M.** |
| ≥ 1 enrolled kid ⇒ no Private | falls out of the same predicate (the row holds again once a seat exists) | ✅ by construction once the above lands |
| add an extra coach to ONE session | TASK-441 gives add/remove extras **from a date onward**; a single-session extra is the same call with `fromDate = that date` and a remove after — clumsy | 🟠 **gap (S):** an `onDate` option on the add |

**🔴 The edge Porter asked me to flag, and it is the sharp one.** *A Private is booked on an empty group date; then a kid tries to enrol for that date.* Once the slot no longer holds while empty, the two rules collide. Three honest options: **(a) refuse the enrolment for that date** (the Private won the hour; the kid's session lands as a make-up / another date) — simplest and truthful, my recommendation; (b) allow both and let the coach be double-booked deliberately (the customer did say "overbook allowed" — but she meant *the coach may take Privates in an empty slot*, not *a kid and a Private at once*); (c) refuse the Private at booking time whenever any kid *could* still enrol — which is every date, and kills the feature. **Owner must rule (a) or (b).** Also: the enrolment refusal must name the Private clearly, or an admin will not understand why one date of a course is missing.

**Sizes for §3 if all taken:** BE **M–L** (the slot-holder change M + rolling extender S + cap nullable S + `closed_at` S + single-session extra S; one migration) · FE **M** (the two colour states, the manage surface's new doors, the enrolment refusal's sentence). **This is the biggest single change in the list — the slot-holder rule is the one the whole calendar leans on.** I would take it as its own slice, after the held batch ships.

---
## §4 What I would tell the owner
1. §1 camp per-coach window — S–M + S, clean, no rule changes. Safe to take any time.
2. §2 voucher/course ordering — FE S, an afternoon.
3. §3 GROUP — everything fits today **except the empty-slot-frees-the-coach rule**, which is a change to the predicate every booking in the system consults. One task, its own round, and the edge above ruled first. Nothing else in §3 is more than S.

---
## §5 — AMENDMENT (owner via Porter, `REQ-105 §8`, 2026-09-23): the clash is ALLOWED and VISIBLE, and my §3 recommendation is withdrawn
**The ruling:** a kid may still enrol on a date where a Private was taken in the empty group slot. The clash stays **visible until an admin resolves it**, and the resolution offers two actions — **① move the Private (the default: the group coach keeps the group)**, ② swap the group's coach for that session. My §3 recommendation (a) — refuse the enrolment — is withdrawn; it was the wrong default and the customer has said so.

### 🔴 The fact that decides how this can be built at all
**One coach-hour can hold at most one booking, and that is enforced by the DATABASE, not by our code:** `bookings_teacher_slot_uq` is a PARTIAL UNIQUE INDEX on `(teacher_id, date, start_time)` over exactly the rows that "hold" a slot (`lib/slot-holder.ts`: a live status AND `group_id IS NULL`). So **"two bookings visibly clashing on the same coach-hour" cannot be stored.** Postgres refuses the second one with a `23505` — which is precisely the class of failure TASK-449 has just finished cleaning up after.
⇒ A visible clash must be modelled as **the group slot YIELDING its hour, and saying so** — not as two holders:
- a Private taken on an empty group date ⇒ the GROUP row is marked **yielded** (an explicit column, e.g. `slot_yielded_at`, read by the ONE predicate) and the Private holds the hour;
- a later enrolment on that date creates a seat as normal and **does not un-yield** the group row — so nothing hits the index — while the calendar shows a **CLASH** state on both rows: the group has students and does not hold its coach;
- **resolve ①** move the Private ⇒ the group row un-yields and takes its hour back (re-checked against the index at that moment); **resolve ②** swap the group's coach ⇒ the group row un-yields against the NEW coach, the Private keeps the old one;
- the yield is never implicit: only a Private booked into an empty group date sets it, and only a resolution clears it.

### What this does to the size
§3's core change was already the slot-holder predicate (BE M). This adds a column, a third state to that ONE predicate and its five mirrors, two resolution actions with their own refusals, and a clash state on the grid. **BE M–L · FE M.** It remains its own slice, after the held batch, and it is now the largest single piece in REQ-105 — the calendar's most load-bearing rule gains a third case.

### One question the ruling does not answer (owner, before any build)
**May the coach be left double-booked permanently — i.e. can an admin simply ignore the clash for ever?** If yes, the yield state is a permanent, legitimate state and the grid must be honest about it every week. If no, say what forces the issue (the reminder? the day-end? nothing but the admin's eye?). I recommend: it stays visible for ever, nothing forces it — an alarm nobody can silence is an alarm everybody learns to ignore — but the DAY-END must not silently "resolve" it, and the coach's own daily message must show only the session that actually holds their hour.
