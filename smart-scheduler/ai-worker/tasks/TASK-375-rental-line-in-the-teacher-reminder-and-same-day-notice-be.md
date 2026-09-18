# TASK-375 — The teacher learns of a rental: a `Rental :` line in the daily reminder + a separate notice ONLY for a same-day add (`REQ-091` Deploy B, T4-BE) — BE, copy GATED

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-17)
**Owner ruling (`REQ-091 §9`):** my recommendation taken — **(1) a `Rental : …` line in the teacher's EXISTING daily reminder for a session that carries a rental; (2) a separate notice ONLY when a rental is added the SAME DAY after the reminder went** (the coach would otherwise not know). House style is a hard constraint; **the copy for (2) is GATED: drafted TH+EN to me → @Porter → the owner before the send path is final**, exactly as TASK-370.
**Size S+S.** ⛔ Chain stopped. After TASK-373 (the rows exist then). Deploy B.

---

## §1 The prior facts (verify)
- The reminder: `runDailyReminderJob` (`jobs.service.ts:346`) loads today's bookings with relations in ONE query and builds `TodayRow`s (`line-today-schedule.ts`); `renderTodaySchedule` prints one block per session; **`attendeeNote` already rides per booking as a `Remark :` line (TASK-304, `*ถ้ามี` rule — printed only when present, never `(-)`).** A `Rental :` line is that line's twin.
- The value: `Rent {price} / {tier} ({remark})` — the customer's print shape (TASK-372's `rentalPrintLine` on the FE; **one source on the BE: put the print rule in `lib/rental-row.ts` beside `toRentalDTO` and let the FE keep its own — two repos, one shape, both pinned to the same example**).
- Sends to teachers: `enqueueLine({ recipientType: "teacher" })`, SKIPPED when unlinked.

## §2 The contract
**(1) The reminder line:** `TodayRow.rental?: string | null` (already rendered by the caller, like `remaining`) ⇒ `Rental : Rent 200 / Full Set (inline skate size 18-19 CM)` printed after `Remark`, only when present, **on the TEACHER's copy** — ❓ and the parent's? The parent rented it; my reading: the parent's reminder prints it too (they should see what they are paying at the shop), **unless the audience omit table says a parent never sees money lines — check `AUDIENCE_OMITS` and say**. The relation `rental` rides the job's one query (TASK-371's relation) — no extra read.
**(2) The same-day notice — `rental_added_teacher`:** enqueued by `recordBookingRental` (TASK-371's writer) **only when `booking.date === today (Bangkok)` AND the reminder for today has already run** (`reminderRanToday` exists — `:350`); otherwise nothing — the reminder will carry it. 18th kind; walkers move to 18 with the reason; house shape = `leave_notice`'s stamp + block + the `Rental :` line. **Draft the copy (TH+EN) in `inbox/SA.md` FIRST; build with PLACEHOLDER keys.** 🚫 No parent message; no notice on a whole-course creation (the reminder carries each day); no notice on mark-paid.

## Definition of Done
- [ ] **Drafted copy for (2) in `inbox/SA.md` FIRST**
- [ ] Suite, **count** · tsc · **36 = 36** (or as TASK-373 left it)
- [ ] Pinned: a session with a rental ⇒ the reminder prints `Rental : …` after `Remark`; without ⇒ no line, byte-for-byte today · same-day add after the reminder ⇒ ONE teacher row; before the reminder ⇒ none; a future date ⇒ none; unlinked ⇒ SKIPPED · the print rule with the customer's example
- [ ] 🔑 Break-and-watch, `finally`, CHECKSUM

## Question — ⚠️ to the OWNER'S LIST
❓ The reminder to the PARENT — print the rental line or not (see §2). Say what the omit table implies; build what it implies.

---

## §3 📋 CONTRACT + COPY — verified against the tree; the parent question answered from the omit table (@Jason, 2026-09-17, before building)

**(1) The reminder line — confirmed, with the one source named.** `TodayRow.rental?: string | null` arrives already rendered (like `remaining`) and prints as `Rental : <line>` right after `Remark`, in `Remark`'s own shape (`*ถ้ามี`: printed only when present, never `(-)`, indented under its entry in the multi-entry form). The line is built ONCE, on the BE, by **`rentalPrintLine(code, remark)` in `lib/rental-row.ts`** beside `toRentalDTO` — `Rent {price} / {tier}` + ` ({remark})` — with the price from `rentalPriceList()` (the one authority) and the tier in the customer's words. The job's one query gains `rental: true` (TASK-371's relation) — no extra read; the `ReminderSession` carries the rendered string.
📌 **The parent — what the omit table implies, built as implied:** `AUDIENCE_OMITS` is `{ parent: [], teacher: [] }` — **no field is hidden from either audience**; `Remaining` and `*Expiry date` (the money-adjacent lines) already print to the parent, and `Remark` prints to both. ⇒ **the parent's reminder prints `Rental :` too** — they rented it and pay for it at the shop, and the table has no rule that would make this the first hidden line. Pinned for both audiences. *If the owner wants it teacher-only, it is one entry in `AUDIENCE_OMITS` — the table exists for exactly that — and nothing else moves.*

**(2) The same-day notice — confirmed, one correction on WHERE the gate reads.** Enqueued by `recordBookingRental` (TASK-371's writer) after the row is written, **only when `booking.date === bangkokNow().date` AND the reminder already ran today** — `reminderRanToday(runDate)` is module-private in `jobs.service.ts` and `jobs.service` imports `scheduler.service`, which (since TASK-373) imports `rental.service` — importing it back would close a cycle. ⇒ **the predicate moves to `lib/reminder-run.ts`** (`reminderRanOn(runDate, exec)` — the same `job_runs` read, byte for byte, `attempted === true`) and both callers import it from there; `jobs.service` keeps its name as a one-line re-use. Otherwise nothing: a future date, or today before the reminder ⇒ the reminder carries it. Kind **`rental_added_teacher`**, the 18th — the three output walkers move 17 → 18 with the reason, as TASK-370 did; `TemplateKey` `rental_added` = `leave_notice`'s field list. Unlinked ⇒ `SKIPPED` by `enqueueLine`. 🚫 No parent message; nothing on a whole-course creation (TASK-373's rows are born with the course, the reminder carries each day); nothing on mark-paid; nothing on the whole-course reconcile copy.
🚫 **No migration (36 = 36)** — TASK-373 left it there.

### 📝 THE DRAFTED COPY for (2) — `rental_added_teacher` — placeholder MINE, the owner has NOT seen it
**Mirrors `leave_notice` line for line** (the shape TASK-370's two stamps already ship in): the bilingual stamp with `‼️`, the customer's `Label : value` block in his order, then the appended line in the `Remark` shape. **The only new WORDS are the stamp.** The `Rental :` label is the customer's own section word (TASK-372's `section: "Rental"`), and the value is the customer's own print shape, ruled in `§6`/`§9`.
```
RENTAL ADDED / เพิ่มอุปกรณ์เช่า ‼️
Student : มะขิด
Program : Freeskate 6 HR
Date : 17-09-2026
Time : 12:00-13:00
Coach : Ek
Rental : Rent 200 / Full Set (inline skate size 18-19 CM)
```
EN: identical labels (the customer's are English in both languages), identical stamp (Thai-and-English in both, as `LEAVE NOTICE / แจ้งลา ‼️` and TASK-370's are — the audience is coaches). **The value is language-invariant on purpose:** `Rent {price} / {tier}` with the tier in the customer's words (`Helmet · Pad · Helmet + Pad · Ride only · Full Set`) and `({remark})` only when there is one — the FE's `rentalPrintLine` renders the same example; two repos, one shape, both pinned to `Rent 200 / Full Set (inline skate size 18-19 CM)`.

▶️ **Building the plumbing now with the stamp as a placeholder key (the `ob_deduct_title_voucher` convention: form pinned, bytes not); the word lands after the owner's eye.**

---

# 📤 REPORT — @Jason → @Sober (2026-09-17)

✅ **PLUMBING DONE (code); the ONE new word (the stamp) stays gated on the owner.** **2266 pass / 0 fail**, **182 files** (+1) · `tsc --noEmit` clean · 🚫 **no migration (36 = 36)**.

## §4 What was built
- **`lib/rental-row.ts`**: `RENTAL_TIER_WORDS` (the customer's five words) + **`rentalPrintLine(code, remark)`** — `Rent {price} / {tier}` + ` ({remark})`; the price from `rentalPriceList()`; the customer's example byte for byte. One source on the BE, beside `toRentalDTO`.
- **`lib/reminder-run.ts`** (new): `REMINDER_JOB` + **`reminderRanOn(runDate)`** — `jobs.service`'s read moved verbatim (TASK-209's `attempted` key and its note included); `jobs.service` keeps `reminderRanToday` as a one-line delegation and re-exports the constant. The reason: `jobs.service` → `scheduler.service` → `rental.service` (since TASK-373) — importing the predicate back would have closed a cycle.
- **(1) The reminder line**: `TodayRow.rental?` / `ReminderSession.rental?` — rendered ONCE by the job (`rentalPrintLine`, beside `remaining`), the builder routes it untouched, `renderTodaySchedule` prints `Rental :` **right after `Remark`, in `Remark`'s shape** (present or absent, never `(-)`; indented under its entry in the multi-entry form). The job's one query gains `rental: true` — no extra read. **Both audiences** — what `AUDIENCE_OMITS` (empty for both) implies.
- **(2) The notice**: `rental_added_teacher` — the 18th kind, `leave_notice`'s stamp + block + the `Rental :` line (`TemplateKey` `rental_added` = `leave_notice`'s fields, asserted equal); i18n `ob_rental_added_title` (PLACEHOLDER, marked) + `ob_f_rental` ("Rental" — the customer's section word). **`notifyRentalAddedSameDay`** in `rental.service`: called ONLY from `recordBookingRental` after the row is written; `booking.date === bangkokNow().date` AND `reminderRanOn(today)`, else `null`; one `enqueueLine` to the teacher with `{ code, remark }` on the payload; unlinked ⇒ SKIPPED. Not on paid, not on remove, not on the course create, not on the reconcile (pinned by absence).
- 🔻 **Pins moved, with reasons:** the three walkers 17 → 18 (five assertions); TASK-332/337's survivor count 8 → 9; `message-time-format`'s `Record<TemplateKey>` refused to compile until `rental_added` declared its `Time` owner (the eighth firing); TASK-208's `reminderRanToday` pin now reads the predicate from `lib/reminder-run.ts` and asserts the delegation.

## §5 Pinned (`lib/rental-reminder-and-notice-req091.test.ts`, 15 tests)
- **The print rule with values:** the customer's example `Rent 200 / Full Set (inline skate size 18-19 CM)`; every tier's word and price; blank remark ⇒ no parentheses; an unknown code prints honestly (`Rent — / <code>`), never throws inside a message.
- **The reminder line:** with a rental ⇒ `Rental :` right after `Remark`; without ⇒ byte for byte the same message minus that line; alone when there is no Remark; under its own entry in the multi-entry form; **the parent's copy prints it (and `AUDIENCE_OMITS` is `{ parent: [], teacher: [] }`)**; the builder carries the string, the job renders it and loads the relation.
- **The notice's FORM:** the stamp's shape (bytes not frozen — the owner has not seen the word), the block equal to `leave_notice`'s, the `Rental :` line with the example; EN identical (the value is language-invariant); no payload rental ⇒ no bare label; the i18n marker.
- **The gate at the source:** the two conditions in order, each `return null`; one enqueue; the row's code + remark on the payload; `teacher?.lineUserId ?? null`; called once, after the insert, from the session writer only; absent from paid/remove/the course create/the reconcile; the predicate's home, its read, the delegation, and no `jobs.service` import in `rental.service`.

## §6 🔑 Mutation — eleven, `finally`, checksum — all bite
A the date gate dropped · B the reminder gate dropped · C the notice fires on mark-paid · D the print rule drops the remark (4 fail) · E the code instead of the tier word (4) · F the line prints BEFORE Remark · G `(-)` when absent (2) · H the job forgets the relation · I the job passes the raw code · J the predicate keys on `sent` — TASK-209's regression (2) · K a bare `Rental :` label. Every restore byte-identical.

## §7 ❓ The owner's-list question — answered by the table, built as implied
The parent's reminder prints the `Rental :` line: `AUDIENCE_OMITS` hides nothing from either audience, `Remaining` / `*Expiry date` / `Remark` already reach the parent, and the parent pays for the rental at the shop. **If the owner wants it teacher-only it is one entry — `parent: ["rental"]`-shaped — in the omit table, which exists for exactly that, and nothing else moves.** *(Today the line is appended beside `Remark` rather than a block field, so that entry would need the line to consult the table — one `if`; say so and I add it with the entry.)*
📌 **Open for the owner: the stamp `RENTAL ADDED / เพิ่มอุปกรณ์เช่า ‼️`** — the only new word. Everything else is a shipped key or the customer's own.
