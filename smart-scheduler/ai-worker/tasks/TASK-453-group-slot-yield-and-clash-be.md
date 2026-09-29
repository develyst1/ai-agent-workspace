# TASK-453 — `REQ-105 §3/§8/§8.1` (SPEC-091 §3+§5): the GROUP slot YIELDS its coach-hour to a Private and says so — a third case in the ONE hour-holding predicate · the two resolutions · the clash on the attention list and in both coach messages · + the small group gaps (no end date · no cap · a one-session extra coach) — BE, M–L, **CONTRACT FIRST**

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-23) · **Size M–L.** Migration expected (`0053`). Its own slice — **after** the held batch reaches `uat`; nothing here joins that batch.

## §0 The rules, as the owner and the customer settled them
- A group slot **exists permanently** on the calendar every week, with or without students; pinned to a Head Coach (the primary, swappable); **no seat cap**; runs until an admin closes it.
- On an **empty** date the coach is FREE: a Private may be booked in that hour. On a date **with students** the slot occupies the coach.
- A kid may still **enrol on a date whose hour a Private has taken**. The clash is **allowed and visible until an admin resolves it** (`§8`), and it is **never forced** (`§8.1`): ① **move the Private** (the default — the group coach keeps the group) or ② **swap the group's coach for that session**.
- While unresolved: **on the admin's daily attention list**; **both the coach's daily reminder AND the weekly digest show BOTH classes** with a *"CLASH — awaiting admin"* note (the kids will turn up regardless — this corrects my earlier recommendation that the coach see only the hour-holder); **the day-end never auto-resolves it.**

## §1 The fact this design exists to respect
`bookings_teacher_slot_uq` is a **partial UNIQUE INDEX** on `(teacher_id, date, start_time)` over exactly the slot-holding rows (`lib/slot-holder.ts`: a live status AND `group_id IS NULL`). **Two holders of one coach-hour cannot be stored.** So a visible clash is not two rival bookings — it is the group row **yielding** and saying so. Read `slot-holder.ts` and its FIVE mirrors (`describeSlotClash`, `assertAdditionalTeacherFree`, `findFreeExtensionDate`, `getSlotAvailability`, and the index itself) before proposing anything: the predicate is the rule every booking in this system consults, and it has already been the site of one silent drift (SYSTEM-FACTS).

## §2 What I propose — confirm or correct before code
- **`bookings.slot_yielded_at timestamptz NULL` on the GROUP row** + the predicate's third case: a row holds its hour when *live AND `group_id IS NULL` **AND `slot_yielded_at IS NULL`***. **The index's WHERE clause must move with it, in the same migration** (a partial index and its code mirror are one fact in two places — if they can drift, they will; say how you pin them equal).
- **Who sets it:** ONLY the act of booking a Private into an empty group date (the booking creator, in the same tx: the group row for that hour is marked yielded, then the Private is inserted — so the index sees one holder at every instant). **Never implicit, never a job.** An enrolment onto a yielded date creates its seat as normal and **does not clear the yield** (no collision, by construction).
- **Empty means empty:** a group row with ≥ 1 live seat may not yield — the Private is refused with today's words (`SLOT_TAKEN`). Say what "live seat" is by value.
- **The two resolutions** (one route each, `menu:calendar`, `booking-edit`): ① `move the Private` — the existing move; on success the group row un-yields **and is re-checked against the index at that moment** (if the coach has since been taken, the refusal must say so and leave the clash standing); ② `swap the group's coach for this session` — the group row takes its hour on the NEW coach and un-yields; the Private keeps the old coach. Both in one tx, both by value.
- **The clash state is DERIVED, never stored twice:** a group row is "in clash" when `slot_yielded_at IS NOT NULL AND it has ≥ 1 live seat`. One predicate, one place, read by the attention list, both coach messages and the grid DTO.
- **The surfaces:** an attention item per clashing date (`lib/attention.ts`) that persists until resolved; **the coach's daily reminder and weekly digest list BOTH classes with the note.** ⚠️ **Language:** follow each message's own existing rule — the daily reminder is bilingual, the weekly digest is **English-only** (REQ-104 §3). Draft the added line's bytes for both and put them in your report: **the owner wants to read them before they ship** (📖 gated — do not treat them as final).
- **The small gaps, same object, same task:** `head_count` nullable ⇒ **uncapped** (the cap check skipped when null; every other use of the number unchanged); a **`closed_at`** on the series (closed ⇒ no new dates, no enrolment; existing rows untouched); a **rolling extender** so a series with no end date always has N weeks of rows ahead (a job beside the existing ones — say which, and it must be idempotent); an **`onDate`** option on add-extra-teacher (TASK-441 added extras from a date onward; one session needs one call).
- 🚫 No auto-resolution anywhere; the day-end must not clear a yield (pinned by absence); no change to what a SEAT does; OTHER/CAMP rows untouched.
- ❓ for you: (1) the index/mirror pinning (§2.1); (2) anything in the five mirrors that a third case breaks; (3) whether the rolling extender belongs to this task or is better cut separate once you have read the job wiring.

## Definition of Done
- [ ] Contract confirmed via @Sober BEFORE code · suite **count** · tsc 0 · migration count · preflight `[]` · the predicate's three cases by value + the index's WHERE moved with it and pinned equal · yield set only by the Private path, in one tx (the index never sees two holders) · an enrolment on a yielded date by value (seat created, yield kept, no error) · both resolutions by value incl. the re-check refusal · the clash derived in ONE place · the attention item · both coach messages showing BOTH classes, each in its own language rule, **bytes in the report for the owner** · the four small gaps by value · day-end never resolves (absence) · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM · contract lines for @Fern · report here + `inbox/SA.md` + log.

---

# 📋 CONTRACT — @Jason → @Sober (2026-09-24) — §1 read; your three ❓ answered; two corrections; the owner's bytes drafted; no code yet

## §1 The predicate and its mirrors — read, and the news is good
`slot-holder.ts` is already the ONE definition and everything consults it:
- `slotHolderWhere(b)` (SQL) is called by **all four** service mirrors — `describeSlotClash` `:1067`, `assertAdditionalTeacherFree` `:1186`, `getSlotAvailability` `:2435`, `findFreeExtensionDate` `:2639` — and an existing test asserts each uses it AND restates no status list. ⇒ **the third case reaches all four for free**; nothing there breaks (❓2 answered: nothing, provided the term goes INTO the helper and not into any caller).
- `holdsSlot(row)` (the pure mirror) has **no product caller at all today** — only tests. It gains the third case for symmetry, and I will say so rather than let a reader assume it guards something.
- The index itself: `schema.ts:529`, `.where(sql\`${t.status} not in (${sql.raw(SLOT_INACTIVE_SQL)}) and ${t.groupId} is null\`)`.
⚠️ **The one thing that does NOT flow automatically** is the SQL-level index, because Postgres holds its own copy of the predicate — which is your §2.1 question.

## §2 ❓1 — how the index and the mirror are pinned equal
**Three places must say one thing:** the migration's `CREATE UNIQUE INDEX … WHERE …`, the schema's `.where(sql…)` (what `db:generate` would emit), and `slotHolderWhere`'s rendered SQL. The pin: a test **parses the predicate out of `0054`'s SQL, renders `slotHolderWhere(bookings)` through `PgDialect().sqlToQuery` with its params substituted, reads the schema's `.where` text — normalises all three (lower-case, collapse whitespace, strip `"bookings".` qualifiers and quotes) — and asserts the three strings are EQUAL**, plus that each contains `slot_yielded_at is null`. That is the TASK-439 `CHECK ⇔ END_REASONS` shape applied to an index: a fourth status, a renamed column or a term added on one side only fails the suite. The witness is `index-predicate` with `contains: "slot_yielded_at"` — the 0022/0041 precedent exactly (the index exists before AND after; only its predicate changes, so existence proves nothing).
🔴 **Correction 1 — the number: this is `0054`, not `0053`.** TASK-454 took `0053` yesterday (54 = 54 now), so this migration is `0054_group_slot_yield` ⇒ **55 = 55**. Shape: `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS slot_yielded_at timestamptz` → `DROP INDEX "bookings_teacher_slot_uq"` → `CREATE UNIQUE INDEX … WHERE status not in (…) AND group_id IS NULL AND slot_yielded_at IS NULL` (0041's own shape, the column added first so the new predicate can name it). ⚠️ The DROP+CREATE takes ACCESS EXCLUSIVE on `bookings` — the HOT table — for the rebuild; I will say so in the header with the honest estimate, as `0045` did.

## §3 The rest of §2, confirmed — with the values I will pin
- **Yield set ONLY by the Private path**, inside `insertBooking`'s own transaction and BEFORE the insert, so the index never sees two holders at any instant (pinned by order AND by a fake tx that fails if the insert lands first). Never a job, never implicit.
- **"Empty" by value:** a group row may yield only when it has **no live seat** — `bookings WHERE group_id = <row> AND status IN COURSE_LIVE_STATUSES` (the same set `cancelSeatsOfGroup` and `assertSeatFree` use; a CANCELLED seat does not count, an ATTENDED one does — it happened). Otherwise the Private is refused with today's `SLOT_TAKEN` and `describeSlotClash`'s existing sentence.
- **An enrolment onto a yielded date** creates its seat and leaves the yield alone — by construction, because a seat has `group_id` set and never touches the index. Pinned by value: seat created, `slot_yielded_at` unchanged, no error, and the clash becomes visible the moment the seat exists.
- **The clash is DERIVED, one predicate:** `lib/group-clash.ts` `isGroupSlotClash(row)` = `slot_yielded_at IS NOT NULL AND live seat count ≥ 1`. The attention list, both coach messages and the grid DTO read that one function (pinned by source: no second spelling).
- **The two resolutions**, one route each (`menu:calendar`, `action:calendar.booking-edit`), both in ONE tx:
  ① `POST /bookings/:id/resolve-clash/move` — the existing move applied to the PRIVATE; on success the group row un-yields **and the un-yield is re-checked at that moment**: if another holder has taken the coach-hour since, the whole tx rolls back with `409 SLOT_TAKEN` naming it and **the clash stands** (pinned by value — this is the case that makes the re-check worth having).
  ② `POST /bookings/:id/resolve-clash/swap-coach { teacherId }` — the GROUP row moves to the new coach and un-yields there (its seats follow, as `swapGroupTeacher` already does for a group date); the Private keeps the old coach. Refused if the new coach is not free that hour, with the same words.
- **The small gaps:** `head_count` nullable ⇒ the cap check skipped when null (`assertSeatFree`), every other reader unchanged (the reminder prints `Seats : n/n` — pinned); `closed_at` on the series ⇒ no new dates, no enrolment, existing rows untouched; `onDate` on add-extra-teacher ⇒ the same `seriesRowsFrom` filtered to one date (TASK-441's function, one argument).
- 🚫 No auto-resolution; the day-end never clears a yield (pinned by absence in `runEndOfDayJob`); a SEAT's behaviour unchanged; OTHER/CAMP untouched.

## §4 ❓3 — the rolling extender: **cut it separate, and here is why**
Every scheduled job in this system is a Windows Task Scheduler **exe** hitting an internal route (`scripts/*.ts` → `POST /internal/jobs/*`, the `INTERNAL_JOB_SECRET`, a `job_runs` row always written) — TASK-441's weekly digest was exactly that, and **the box registration is a human deploy line I cannot do**. So the extender is: a new job + route + exe + `package.json` script + a registration the owner performs — one moving operational part, idempotent by "N weeks ahead exists" rather than by a stamp. That is a clean S on its own and it is **not** in the path of anything else in this task. 👉 **Recommend: cut it as its own S task after this one.** If you would rather have it here, say so and I will fold it in — but it will not shorten this task by a line.

## §5 📖 The owner's bytes — drafted, NOT final
The two messages follow different rules, and one of them is not the rule your note assumed:
- **The daily reminder** renders in the chat's own `line_lang` for its FIELD labels — but its appended per-entry lines (`Seats`, `Heads`, `Remark`, `Rental`) are printed with **`TEMPLATE_LANG = "EN"`**, the customer's own printed template (`lib/line-message-fields.ts:36`). ⇒ 🔴 **Correction 2:** a new appended line there is **English by the template's rule, not bilingual**, unless the owner wants the template broken. I will follow the existing rule and flag it, rather than invent a bilingual line in a block whose siblings are all EN.
  Draft (one line under EACH of the two entries, after `Coach`, before `Remark`):
  `⚠️ CLASH : awaiting admin`
  If the owner wants Thai there, the honest form is the template's own shape and it changes the four sibling lines too — his call, and a separate decision.
- **The weekly digest** is ENGLISH-ONLY by REQ-104 §3 (pinned under both `line_lang` values). Draft (a suffix on BOTH clashing lines):
  `06-10-2026 · 15:00-16:00 · Skate Kids ⚠️ CLASH — awaiting admin`
- Both lines appear on **both** entries (the group and the Private), on **both** coaches' messages when the swap has not happened yet — the kids turn up regardless, which is your §0 correction and the reason this is not "show the hour-holder only".
⛔ **I will not ship either byte until the owner has read them** (📖 gated, as you asked).

## DoD as I will run it
Contract confirmed · suite count · tsc 0 · **55 = 55** · preflight `[]` · the predicate's three cases by value + **the three-way index/schema/mirror equality pin** · yield set only by the Private path, before the insert, in one tx · "empty" by value · enrolment on a yielded date by value · both resolutions by value incl. the re-check refusal that leaves the clash standing · the clash derived in ONE place · the attention item (a new `ATTENTION_CHECKS` entry + its `att_*` title key) · both coach messages by value, each under its own language rule · the three small gaps by value · the day-end's absence · break-and-watch with `BASELINE=`, `finally`, CHECKSUM · @Fern's lines · report ×4.

⛔ Waiting on your confirm — **`0054` not `0053`** · the three-way pin · the daily line being EN by the template's rule (Correction 2) · the extender cut separate · the two draft bytes going to the owner — before code.

---

# ✅ CONFIRMED — @Sober → @Jason (2026-09-24) — build to §2–§5; five answers
1. **`0054_group_slot_yield` ⇒ 55 = 55 — yes,** my number was stale (454 took 0053). Column first, then DROP+CREATE the index; say the ACCESS EXCLUSIVE on `bookings` in the header with the honest estimate, as `0045` did.
2. **The three-way equality pin — approved exactly as written** (migration SQL ⇄ schema `.where` ⇄ `slotHolderWhere` rendered, normalised, each containing `slot_yielded_at is null`), witness `index-predicate` with `contains`. It is the `CHECK ⇔ END_REASONS` idea applied to an index, and it is the right standard. Note in the file that `holdsSlot` has no product caller, so no reader assumes it guards something.
3. **Correction 2 accepted — the daily reminder's appended lines are EN by the customer's own printed template, so the clash line is EN there.** You were right not to invent a bilingual line among EN siblings; that would have broken the template. It goes to the owner in exactly those terms.
4. **The extender: cut separate — agreed, it is TASK-456.** Not in this task's path.
5. **The two draft bytes go to Porter now** and stay 📖 gated until the owner answers. Build everything else so a yes costs one line.
Everything else in §3 as you wrote it — "empty" by the live-seat set (an ATTENDED seat counts — good catch), the re-check that leaves the clash standing, the clash derived once in `lib/group-clash.ts`. Fern's lines come with your report.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-24) — built to the confirmed contract; `0054` ⇒ 55 = 55; 2880 pass / 0 fail; 19/19 mutations bite

**Numbers:** `bun test` **2880 pass / 0 fail**, 222 files (+1: `src/lib/group-slot-yield-req105.test.ts`, 32 tests) · `tsc --noEmit` **0** · 🔴 **`drizzle/0054_group_slot_yield.sql` — 55 = 55** (idx 54, the last) · offline preflight `0054` alone `[]` and the batch 0038 → 0054 `[]` · 34 pins moved (the census 54 → 55 in 33 files, then the ten claims below).

## §1 The three-way pin — built exactly as approved, and it is the part I would keep if I could keep only one
`group-slot-yield-req105.test.ts` takes the predicate from all THREE places and compares them as one string:
- the migration's `CREATE UNIQUE INDEX … WHERE` (parsed out of `0054`'s text),
- the schema's `.where(sql\`…\`)` — **rendered through `getTableConfig(bookings)` + `PgDialect`, not read as source**, so it is what drizzle would emit, not what the line looks like,
- `slotHolderWhere(bookings)` rendered, with its `$1…$4` params substituted back in.
Normalised (lower-case · unqualify `"bookings".` · unquote · collapse) and asserted **EQUAL**, plus each containing `slot_yielded_at is null`, `group_id is null` and every `SLOT_INACTIVE_STATUSES` label. 📌 There is a guard ON the guard: a test proves `norm` does not collapse everything to a constant (a deliberately wrong predicate must NOT compare equal), because a normaliser that over-eats would make the whole pin decorative. Mutations A, B and C remove the third term from one side each — **all three bite**.

## §2 What was built
- **`0054`** — `slot_yielded_at` + `group_closed_at` (both nullable, metadata-only), then `DROP INDEX IF EXISTS` + `CREATE UNIQUE INDEX … AND "slot_yielded_at" is null`. The column is added FIRST because the predicate names it (mutation D moves it after the rebuild — bites). ⚠️ The header says the **ACCESS EXCLUSIVE on `bookings` for the rebuild** in plain words, with the honest reason CONCURRENTLY is not an option (it cannot run inside the transaction `db:migrate` wraps each file in). Witness = the PREDICATE (`index-predicate`, contains `slot_yielded_at`) — 🚫 not the index's existence (0007/0033/0041's lesson) and 🚫 **not the column either, because both columns land before the rebuild and a column probe would pass on a file that stopped half way** (mutation S swaps it for an existence probe — bites).
- **The yield** — `yieldEmptyGroupSlot(exec, input)` runs in `insertBooking`, **BEFORE the insert, in the caller's own transaction** (pinned by the ORDER of the recorded ops through a fake tx, and by source; every `insertBooking` call site passes a `tx` — pinned). Only the four lesson types trigger it (`YIELD_TAKING_TYPES`, named); a GROUP / OTHER / CAMP row and a SEAT never do. "Empty" by value = **no live seat** (`COURSE_LIVE_STATUSES`); with a kid on it the function simply does not yield, the insert meets the index, and `describeSlotClash` refuses in today's words — 🚫 no new refusal, no second wording. Mutations E (yield after the insert), F (yield with a kid on it), G (a GROUP row displaces a group), H (a seat displaces its own group) — all bite.
- **An enrolment onto a yielded date** keeps the yield by CONSTRUCTION: a seat carries `group_id`, so the function returns before it reads anything. Pinned by value (the seat is inserted, nothing else is written).
- **The clash is derived once** — `lib/group-clash.ts` `isGroupSlotClash({slotYieldedAt, liveSeats})`. The DTO and the attention card both call it and neither re-spells the two halves (pinned by source; mutations J and K bite).
- **① `POST /bookings/:id/resolve-clash/move`** — the Private moves, then the group un-yields, one tx. 🔑 **The re-check IS the unique index**: clearing `slot_yielded_at` puts the group row back INTO `bookings_teacher_slot_uq`, so if anything took that hour meanwhile the UPDATE raises `23505`, the whole transaction rolls back, and **the clash stands** — the refusal names the new holder through `describeSlotClash` and says so in the sentence. 🚫 No hand-written "is it still free?" read: a second predicate is exactly what drifts from an index. It also calls `assertBookingCourseWritable` — 🔴 **found by the suite, not by me: without it an ENDED course's session could be relocated through a brand-new door** (TASK-185's rule wearing a third verb). Mutations L (swallow the 23505) and M (un-yield first) bite.
- **② `POST /bookings/:id/resolve-clash/swap-coach`** — the group row takes the new coach AND un-yields in ONE update (so the index judges the pair it will actually hold), its live seats follow, the Private is never written. Mutation N (move but stay yielded) bites.
- **The attention card** `group_slot_clashes` (the ELEVENTH) + its `att_` heading in both languages. 📌 It names the CLASS and the COACH and the seat count — **never a child** (`namesPeopleInDigest` stays off). Mutation O (list every yielded date) bites.
- **The three gaps:** `head_count` NULL ⇒ **uncapped** (the check returns early; `seatCap: null` accepted, the 2..12 rule for a NUMBER untouched; the coach's `Seats : 2/2` line already handled a missing cap and is unchanged — pinned by value) · `group_closed_at` ⇒ no new enrolment, no new date, **existing rows untouched** and closing is idempotent · `onDate` on add-extra-teacher ⇒ one session, the SAME live filter restated for one date, and `fromDate` + `onDate` together is a 400 rather than a silent ranking. Mutations I, Q, R bite.
- 🚫 **No auto-resolution anywhere:** exactly two `slotYieldedAt: null` writes exist in `src` (pinned by count), `jobs.service.ts` contains neither `slotYielded` nor `resolveClash`, and the day-end is unchanged.

## §3 📖 The bytes — built so a YES costs one line, and NOT shipped
`CLASH_NOTE_DAILY = "⚠️ CLASH : awaiting admin"` and `CLASH_NOTE_WEEKLY = "⚠️ CLASH — awaiting admin"` live in `group-clash.ts` with the reasoning beside them. **Neither renderer prints them** — pinned by ABSENCE: the daily is rendered under BOTH `line_lang` values and the weekly once, and neither output contains `CLASH`; neither file mentions `CLASH_NOTE`. 🔴 Mutation P adds the note to `remarkLine` — i.e. it ships the owner's un-read bytes to a coach — **and it bites.** That is the gate, enforced, not promised.
📌 **The "BOTH classes" half needed no code and I want that said plainly:** the yield is not a status and not a filter, so a yielded group row stays `CONFIRMED` and keeps appearing on both coaches' daily and weekly schedules exactly as it did (pinned: `yieldEmptyGroupSlot` writes no `status`, and neither reminder file knows the word `slotYielded`). What is missing until the owner answers is only the NOTE.

## §4 ⚠️ One thing I did NOT do, and you should decide it
**A CANCELLED Private leaves the group row yielded.** §2 says the yield is cleared by the two resolutions only, so I built exactly that — but cancelling the Private is a third way the clash stops being real, and nothing clears the yield then: the group keeps its class, the hour stays "not held" until an admin resolves it, and the attention card keeps listing it. 🚫 I did not add a silent un-yield on cancel, because it is a WRITE nobody asked for on a path that today writes only a status, and because the un-yield can fail (the index) — a cancel that half-fails would be worse than a card that lingers. 👉 Options, your call: (a) leave it — the admin resolves it, which is the rule everywhere else here; (b) a cancel of a Private attempts the un-yield and keeps the cancel if it collides; (c) the card's label says "the private is cancelled" so the admin knows it is one click. I would take (b) as its own S task, after the owner has seen the card.

## §5 Break-and-watch — `mut453.mjs`, 19 mutations, **19 bite** (`try/finally`, sha-256 restore byte-identical, `BASELINE=142`)
A the mirror loses the third case · B the schema's predicate does · C the migration's does · D the column added after the rebuild · E the yield after the insert · F a group with a kid yields · G a GROUP/OTHER/CAMP displaces · H a seat displaces · I NULL cap = full again · J the clash drops its second half · K the DTO invents its own rule · L the un-yield's 23505 swallowed · M the un-yield before the move · N the swap leaves it yielded · O the card lists every yielded date · P 📖 the gate breaks · Q a closed series takes a child · R `onDate` means "from here on" · S the witness probes existence.
🔑 L PASSED on the first run (the outer catch's TEXT was still there) — the pin is sharper now: the update must sit DIRECTLY in the try whose catch re-throws, and `catch {` may not appear in the resolution at all.

## §6 Contract lines for @Fern
- `booking.group` gains **`yieldedAt: string | null`** (ISO — the hour was given to a Private), **`closedAt: string | null`** (the series takes no new child), **`clash: boolean`** (DERIVED: yielded AND ≥ 1 live seat — 🚫 do not re-derive it client-side, read the flag). `seatCap` may now be **`null` = uncapped** — print the seat count with no denominator.
- `POST /bookings/:id/resolve-clash/move` `{ teacherId?, date?, startTime? }` (≥ 1 required) — ① the default. `409 SLOT_TAKEN` either when the Private's new hour is taken, or when the group's hour has been taken since: **the second one means the clash is still there**, and the sentence says so (…`ชั่วโมงนี้ถูกจองไปแล้ว กลุ่มจึงยังทับอยู่`).
- `POST /bookings/:id/resolve-clash/swap-coach` `{ teacherId }` — ② the group session moves to another coach; the Private stays. `409 SLOT_TAKEN` naming the class already on that coach's hour. Either route may be called with the PRIVATE's id; ② also accepts the GROUP row's id.
- `409 NOT_IN_CLASH` = this booking is not standing in a yielded group's hour (a stale screen).
- `POST /group-series/:key/close` ⇒ `{ closed, alreadyClosed }`; afterwards enrolment and add-dates answer `409 GROUP_SERIES_CLOSED`.
- `POST /{other,group}-series/:key/teachers` takes **`onDate`** (one session) as an alternative to `fromDate`; sending both ⇒ 400.

📦 Deploy (the human's): `db:migrate` (verify **55**) — a deploy-window statement, see the header. 🚫 No deploy request. ⛔ Only you mark this DONE. 📖 The two byte drafts are with Porter for the owner; a yes is one line in each renderer.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-24), and my §4 ruling
Re-run by me: **2880 pass / 0 fail** · tsc 0 · **55 = 55** (`0054_group_slot_yield`) · `lib/group-clash.ts` present.
Three of his decisions I am keeping as standards:
1. **The three-way pin renders the schema through `getTableConfig` + `PgDialect` rather than reading source**, and puts a guard ON the normaliser so it cannot pass by collapsing everything. A pin that can be satisfied by its own tidying is not a pin; that guard is the part to copy.
2. **The witness is the PREDICATE, not the column** — both columns land before the rebuild, so a column probe passes on a file that stopped half way. That is the 0007/0033/0041 lesson carried one step further and it is now the rule for any migration whose last act is a rebuild.
3. **"The re-check IS the index"** — the un-yield re-enters the unique index, a 23505 rolls the whole transaction back and the clash stands, named. Better than re-reading and hoping: the check and the thing it checks are the same act.
Also right: the move resolution was a new door and the suite caught it missing `assertBookingCourseWritable` — a new door around an existing guard is exactly what TASK-185 exists to prevent.
**§4 — a CANCELLED Private leaves the group yielded. My ruling: (c) now, (b) never.** The card's label says the Private is cancelled, so the admin sees in one glance that it is one click — no new write on a path that today writes only a status, and no cancel that can half-fail. (a) leaves an admin guessing why a resolved-looking clash is still listed; (b) buys a rare convenience with a write that can collide on the system's most contended index, which is the trade this whole task exists to avoid. **Fold (c) into TASK-456's report** (one label, no new route) rather than a task of its own.

---

# ✅ TASK-453b CODE DONE — @Jason → @Sober (2026-09-24) — the owner said YES: both CLASH lines are LIVE; 2899 pass / 0 fail; 10/10 mutations bite

**Numbers:** `bun test` **2899 pass / 0 fail** (+3 in the existing file; no new file) · `tsc --noEmit` **0** · 🚫 no migration (55 = 55) · 6 pins moved.

## The two lines, as the owner read them
- **Daily reminder** — `⚠️ CLASH : awaiting admin`, FIRST among the appended lines, i.e. directly under `Coach` and above the roll, so a coach sees it before the names. ENGLISH under BOTH `line_lang` values, because that block prints with `TEMPLATE_LANG` — the customer's own template, the existing rule, not a choice made for this line.
- **Weekly digest** — `… ⚠️ CLASH — awaiting admin` suffixed on the clashing line. English by REQ-104 §3, pinned under both languages.
- 🔑 Both are pinned **by value**, and mutation J (one byte edited — `CLASH :` → `CLASH:`) bites: the words the owner approved cannot drift after his yes.

## What it took beyond "one line each", and why
The line is one line. Deciding **which entries carry it** is the rest, and it is the half that had to be right:
- **BOTH classes, on the COACH's message** — keyed on the coach-HOUR (`teacher|date|HH:MM`), because the group that yielded and the Private that took it are two rows on one hour and the kids turn up for both (your §0 correction). A yielded GROUP row is still a normal live row, so it was never missing from either schedule — only the note was.
- ⚠️ **The PARENT's copy does NOT carry it.** A family cannot resolve a clash, and telling them their child's class is disputed is a phone call somebody else has to take. Pinned by value (mutation C sends it to the parent — bites).
- **One coach-hour, not one coach-day:** the key carries the HOUR, so the coach's 16:00 lesson stays clean while their 15:00 is marked. 🔴 Mutation H (drop the hour from the key) PASSED on the first run — no by-value case had the same coach twice in one day. There is one now, and it bites.
- 🔑 **One derivation, two messages:** both renderers go through `clashingSlotKeys` → `isGroupSlotClash`; neither re-spells what a clash is (pinned by source).

## 🔴 The bug this nearly shipped with, found by the by-value test
The daily reminder's rows carry seats that the JOB has **already filtered to `REMINDABLE`** — they hold a name and a balance and **no `status` at all**. My first `clashingSlotKeys` re-filtered them by `COURSE_LIVE`, counted **zero**, and the note would simply never have appeared on a real day: green suite, silent feature. So `clashingSlotKeys` now takes the COUNT as the caller's function (the daily passes `seats.length` with the reason written beside it; the weekly passes `liveSeatsOfRow` for raw DB rows) while the CLASH RULE stays in one place. Mutation E restores the wrong filter and bites. 📌 The general shape is TASK-403's: *a feature behind a condition that is always false is indistinguishable from one nobody wrote.*
⚠️ One read changed for it: the weekly digest's query now loads `seats: true` — it needs the live-seat half to answer the question at all.

## Break-and-watch — `mut453b.mjs`, 10 mutations, **10 bite** (`try/finally`, sha-256 restore byte-identical, `BASELINE=87`)
A the daily line dropped · B the daily line on every entry · C the PARENT told · D only the group row marked (the private's coach never learns) · E the seats re-filtered by a status they do not carry · F the weekly suffix dropped · G the weekly suffix on every line · H the key loses the hour · I an EMPTY yielded date counts as a clash · J the approved bytes edited.

📦 Nothing to deploy beyond the usual release: no migration, no job, no registration. ⛔ Only you mark this DONE.

# ✅ 453b DONE — REVIEWED by @Sober (2026-09-24)
Re-run by me: **2899 pass / 0 fail** · tsc 0 · 55 = 55 · both approved strings live as constants (`CLASH_NOTE_DAILY` / `CLASH_NOTE_WEEKLY`).
🔴 **The finding is worth more than the line:** his own by-value test caught that the reminder's seats arrive **already filtered to `REMINDABLE` and carrying no `status`**, so his first clash filter re-filtered them by `COURSE_LIVE`, counted zero, and **the note would never have appeared on a real day — with a green suite**. That is TASK-403's shape exactly (a feature that is silent in production and perfect in tests), and it was caught only because the test asserted the rendered VALUE rather than that the function was called. Keeping the count as the caller's job while the clash RULE stays in one place is the right separation.
Also right: the note is keyed on the coach-HOUR so both classes carry it (the owner's §8.1 correction), the family's copy never does — a family cannot resolve a clash — and mutation J bites on a single byte, so the approved words cannot drift after his yes.
