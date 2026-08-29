# REQ-058: Add nine programs (subjects) the customer needs — and a way to add the next one
- Status: READY_FOR_SA
- Priority: 🔴 **HIGH** — the customer is using the system now and cannot book what does not exist
- Requested: 2026-08-20 by stakeholder (owner), from the customer
- Deadline: none stated; blocks correct course/booking creation on `uat`

## Problem / Goal
The customer needs these programs, which the system does not have:

`Bike` · `Balance Cruiser` · `Balance Bike` · `Scooter` · `Inline Skate & Bike` · `Surfskate & Bike` ·
`Surfskate & Inline Skate` · `Bike & Scooter` · `Surfskate & Freeskate`

Note the shape: **four single activities and five COMBINED ones** (`X & Y`). The combined names are the
customer's own vocabulary for a session that covers two activities — we take their words, we do not model them as
two programs.

🔴 **And the structural half of this REQ: there is no way to add a program at all.** `subjects` rows exist only in
`db/seed.ts` — **no screen, no API, no admin action.** So every future program the school invents becomes an
engineer ticket. That is the actual defect; nine rows is just today's symptom.

## Requirement
1. **The nine programs above exist**, spelled exactly as the customer wrote them.
2. **Each is bookable end to end** — it must appear in the booking modal, be assignable to a course, and be
   selectable on a session. A program that exists but cannot be picked is not done.
3. **Teachers must be able to teach them.** Bookings resolve a teacher's subjects (`teacher_subjects`); a program
   with no teacher attached **cannot be booked by anyone**. So the REQ is not complete until the customer's
   teachers are attached to the right new programs.
4. **Each carries whatever a program needs to price correctly** — `price_group` exists on `subjects` (migration
   0016) and REQ-027's price-card rules key off it. A program with the wrong group prices wrongly and silently.
5. **A repeatable way to add the next one.** At minimum an owner-runnable, dry-run-first command in the family of
   `db:reset` / `import:students`; ideally the admin screen — SA's call which is proportionate, but **"edit the
   seed and redeploy" is not an answer for a live customer.**

## Acceptance Criteria
- [ ] **AC-1** — All nine exist with the exact names above; no near-miss spellings, no invented abbreviations.
- [ ] **AC-2** — Each can be selected when creating a **course**, a **single session**, a **trial** and a
      **voucher** booking on `uat`.
- [ ] **AC-3** — At least one teacher is attached to each new program, and booking that program with that teacher
      succeeds.
- [ ] **AC-4 (money)** — Each new program's `price_group` is set deliberately, and a booking on it produces the
      **price the customer expects** — verified against the price card, not assumed.
- [ ] **AC-5 (regression)** — The nine existing programs, their teachers, their prices and REQ-027's voucher
      exclusions are unchanged.
- [ ] **AC-6 (repeatable)** — Adding a tenth program later does not require a code change or a deploy.

## Constraints
- **Owner-run on `uat`** like every environment action; `sid` first per the standing rule.
- Additive only — no renaming or removing existing programs.

## Out of Scope
- Prices themselves (the price card is the customer's), teacher rosters beyond attaching the new programs, and any
  change to how combined programs are billed.

## Questions
- **Q1 (to owner → customer): what `price_group` does each of the nine belong to?** The existing card groups
  programs (e.g. the `bike-skate` group); **the five combined programs are the ones I cannot guess** — is
  `Surfskate & Bike` priced as Surfskate, as Bike, or as its own thing?
  > answer: _pending_
- **Q2 (to owner): which teachers teach which of these?** Without that, AC-3 cannot pass and the programs are
  unbookable in practice.
  > answer: _pending_
- **Q3 (to owner): may a voucher be used for the combined programs?** REQ-027 excludes vouchers from some
  programs; a new program silently inherits nothing, so this needs a decision rather than a default.
  > answer: _pending_
- **Q4 (to SA):** how are `subjects` created today, and what is the smallest honest path to requirement 5 — an
  owner-run script now, or the admin screen? Say which, and what it costs.

---

## ✅ OWNER DECISION — 2026-08-22: the combined program stays, the 3 courses stay put
Raised by Porter from the `uat` DATA REQUEST: `uat` already carries a **combined** program
**`Bike / Scooter / Balance Cruiser`** with **3 live courses** on it (น้องเก่ง · เอสร่า · มาดี).

**Owner:** *"เก็บอันรวมไว้ด้วย 3 คอร์สนั้นไม่ต้องย้าย"*

⇒ Binding for this REQ:
1. **`Bike / Scooter / Balance Cruiser` is KEPT** — not renamed, not deactivated, not merged.
2. **The 3 existing courses are NOT migrated.** They keep pointing at it. **No back-fill, no data change of any
   kind.** This REQ is therefore **purely additive** and carries **zero migration risk to live courses** — say so
   plainly in the SPEC so nobody "tidies" it later.
3. The nine new programs are **added alongside** it.

**Consequence to design around (not a question — a known trade-off the owner has accepted):** after this,
`Bike`, `Scooter`, `Balance Cruiser` **and** `Bike / Scooter / Balance Cruiser` are all selectable, so staff see
four overlapping choices and REQ-013/REQ-014 will report the combined one as its own bucket. That is the
consequence of keeping history intact and it is the right call — but the SPEC must **not** try to fold the
combined bucket into the split ones in reporting, because that would silently rewrite what those 3 families bought.

### Where subject count lands
`uat` has **9 subjects today → 18 after this REQ.**

### Still owed by the owner (unchanged, and these DO block the build)
- **`price_group` for each of the nine** — especially the five combined ones. ⚠️ `subjects.price_group` is
  **nullable and NULL means "cannot be sold"** — the sale refuses loudly rather than guessing a price. So a program
  added without this answer is **visible but unsellable**.
- **Which teachers teach each one** (`teacher_subjects`), or the program cannot be booked to anybody.
- **Voucher eligibility** per program (REQ-027 exclusions).

---

## ✅ PRICE GROUP — ANSWERED 2026-08-22 (customer's official price card, supplied by the owner)
**All nine new programs sell on the existing `bike-skate` line.** No new price group, no change to the
`PriceGroup` union, no new items, **no deploy needed for the mapping** — `subjects.price_group` is data.

The card's blue block prices **one line for six programs** — Bike/Scooter · Baby Skate · Surfskate · Inline Skate
(Rollerblade) · Skateboard · Freeskate — at **4h 4,790 · 6h 6,490 · 10h 9,790**, which is exactly `bike-skate` in
`sale-items.ts:61`. Every one of the nine is a combination drawn from that same block:

| New program | Price group |
|---|---|
| Bike · Balance Cruiser · Balance Bike · Scooter | `bike-skate` |
| Inline Skate & Bike · Surfskate & Bike · Surfskate & Inline Skate · Bike & Scooter · Surfskate & Freeskate | `bike-skate` |

⇒ **Requirement:** the nine are created with `price_group = 'bike-skate'`. They are sellable at 4 / 6 / 10 hours at
the standard price on creation — the owner does **not** have to come back and price them, and the earlier fallback
plan (add them unpriced, book via IMPORT only) is **no longer needed**.

### ⚠️ Two notes carried out of this, deliberately kept OUT of REQ-058's scope
1. **The owner relayed the customer as saying "6 / 6790"; the official card says 6,490** and the system already
   holds 6,490. Porter has **not** changed anything — flagged to the owner. If 6,790 is a price rise, it is its own
   decision, not a detail of adding programs.
2. **The audit found two real faults in `onewheel` pricing → raised as REQ-061.** Unrelated to the nine programs,
   but found here and not left lying: 6 h is ฿90 too high, and the card's **10 h (11,900) cannot be sold at all**.
3. **`bike-skate` has no 1-hour price** — correct per the card, but it means a single session booked on any of the
   nine has no product code for its revenue (REQ-061 Q3).

### Still owed by the owner (unchanged)
- **Which teachers teach each of the nine** (`teacher_subjects`) — without this they cannot be booked to anybody.
- **Voucher eligibility** per program (REQ-027 exclusions).

---

## ✅ TEACHERS + VOUCHERS — 2026-08-22. Owner: *"ปกติก็ควรจะได้มั้ย"* — and for vouchers that is already true.
**Vouchers: nothing to do. It already works.** `sale-items.ts:43` —
`VOUCHER_EXCLUDED_GROUPS = { onewheel, balance-private, balance-group }`, i.e. **vouchers are allowed on exactly
one price line: `bike-skate`.** All nine new programs are on `bike-skate` ⇒ **vouchers work on all nine the moment
they exist, with no extra work and no decision.** The owner's instinct was right and the system already agrees.

**Teachers: also not a blocking decision — it becomes staff's own job the moment the programs exist.** Once the
nine `subjects` rows are created they appear in the teacher edit screen's subject list (the REQ-003 limit is that
the form can only pick from **existing** subjects — it lists them all, it just cannot create new ones). So staff
assign teachers themselves in the product, per teacher, whenever they like.

**Porter's proposal for a sensible starting point** (so the programs are not born unbookable — the owner can
change any of it in the UI in seconds):
- A teacher who already teaches the combined `Bike / Scooter / Balance Cruiser` gets **Bike · Scooter ·
  Balance Cruiser · Balance Bike · Bike & Scooter**.
- A combined program naming **two** activities (`Inline Skate & Bike`, `Surfskate & Bike`,
  `Surfskate & Inline Skate`, `Surfskate & Freeskate`) goes to teachers who already teach **both** components.
- Nobody is given a program they do not already effectively teach. **Nothing is removed from anybody.**
⇒ **@Sober: seed the mapping this way, and say in the SPEC that it is a starting point staff can edit — not a rule
the code enforces.** If the owner would rather assign every one by hand, he says the word and we seed none.

---

## ✅ Q2 ANSWERED — 2026-08-22. Owner: *"ให้ทุกครูเห็นสอนได้ทุกอันไปเลย แล้วให้เขามาแก้ทีหลังเอา"*
**Decision: link EVERY teacher to EVERY program**, and let the customer's staff narrow it down themselves later.
That is a deliberate "open by default, correct in the product" choice and it is his to make.

### 🔴 Why this cannot be done with the tool we shipped this morning
`subjects:add --teacher` takes **one teacher, one program, per invocation**. `uat` has **24 teachers** and now
**19 programs** ⇒ **456 commands.** That is not a runsheet, it is a trap: nobody completes 456 lines without a
mistake, and a half-finished pass leaves a roster that looks configured and is not.

**⇒ New requirement 6 (to SA):** a **bulk link** — one owner-run command that links every active teacher to every
active program, insert-if-missing, dry-run first, printing counts (teachers × programs × links created/skipped).
The obvious shape is a flag on the existing tool (`subjects:add --link-all-teachers`, or a sibling
`teachers:link-all`) rather than a new mechanism — `teacher_subjects` has composite PK `(teacherId, subjectId)`, so
the insert is idempotent by construction, exactly as Jason already verified for the single-teacher path.
- [ ] **AC-9** — **Given** `uat`'s 24 teachers and 19 programs, **When** the command runs with `--commit`,
      **Then** every (teacher, program) pair exists, a re-run reports **0 created**, and **no teacher, program or
      booking row is modified in any other way.**
- [ ] **AC-10** — dry-run first, and the dry run prints what it *would* create without writing.

### ⚠️ The one consequence, stated once and accepted
Every teacher's booking dropdown will list **all 19 programs**, and `teacher_subjects` stops carrying real meaning
("who can actually teach this") until staff prune it. **That is the owner's explicit intent** — the alternative is
the nine programs staying invisible while somebody assembles the real matrix. It is reversible in the product at
any time, per teacher. **Recorded so that a future reader does not mistake a deliberate choice for sloppy data.**

### Also added — `Baby Skate`
Spotted by Porter on the customer's price card (blue block, no subject row existed); owner ran it the same minute.
**`Baby Skate` → `bike-skate`.** It must be run on **both** boxes like the other nine, and it is included in the
bulk teacher link above ⇒ **19 programs, not 18.**

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| REQ-058 | ➕ **Nine new programs** (Bike · Balance Cruiser · Balance Bike · Scooter · Inline Skate & Bike · Surfskate & Bike · Surfskate & Inline Skate · Bike & Scooter · Surfskate & Freeskate) **+ a repeatable way to add a program** | 🔴 **HIGH** | 🟢 **IN_TEST — 19 programs LIVE on both boxes** (owner ran the runsheet; Porter verified `sid`=`uat`=19 byte-identical). AC-1/4/5/6 ✅ verified in data. **Q2 answered — owner: every teacher × every program.** Last step cut: **SPEC-055 + TASK-155 (`teacher-subjects:link-all`) → @Jason** — bulk idempotent link; owner runs on both boxes ⇒ closes AC-2/AC-3 ⇒ **DELIVERED**. (`subjects:add` = SPEC-053/TASK-153, SA-reviewed tsc 0 · 578/0.) —_build note:_ Grounded BE/data-only, **no FE change**: booking UI reads `teacher.subjectOptions` (data) ⇒ AC-2 by construction; price+voucher key off `price_group`, all nine=`bike-skate` ⇒ AC-4 & **Q3 voucher eligibility answered** (`voucherAllowsProgram("bike-skate")=true` → all nine eligible, owner only acts to EXCLUDE). Build = the missing **owner-run `subjects:add`** (dry-run-first, insert-if-missing by unique name, validated group, optional `--teacher` link) — satisfies AC-6 (add tenth = a command, not a deploy) & AC-5 (insert-only can't touch existing rows / the KEPT combined program). **Only owner-owed blocker left: Q2 which teachers teach which** (AC-3 proof; mechanism ships now). | @Sober + owner. Structural: `subjects` are created **only** in `db/seed.ts:46` — there is no API/UI to add a program (the limit already noted under REQ-003). ✅ **CLOSED — owner: “เก็บอันรวมไว้ด้วย 3 คอร์สนั้นไม่ต้องย้าย”** ⇒ the combined program `Bike / Scooter / Balance Cruiser` is **KEPT** and its 3 live courses (น้องเก่ง · เอสร่า · มาดี) are **NOT migrated** ⇒ REQ-058 is **purely additive: no back-fill, zero migration risk to live courses** (9 → 18 subjects). ⚠️ SPEC must NOT fold the combined program into the split ones in REQ-013/014 reporting — that would rewrite what those 3 families bought. ✅ **PRICE ANSWERED 2026-08-22 (customer’s official card): all nine sell on the existing `bike-skate` line** (4h 4,790 · 6h 6,490 · 10h 9,790 — byte-identical to `sale-items.ts:61`) ⇒ **no new price group, no `PriceGroup` change, no new items, no deploy for the mapping.** Still owed by owner (does NOT block creating them): which teachers teach each · voucher eligibility: `price_group` per program (esp. the 5 combined ones) · which teachers teach them · voucher eligibility. |
```

## Verdict — TEST_PASSED on `sid`, 2026-08-30 (Tanya) — full evidence in `tests/TEST-063`

Board cell trimmed to a pointer on 2026-08-30 (hygiene); nothing lost — the detail is in `tests/TEST-063` and
in `log/2026-08-30.md`. Recorded here so the REQ carries its own verdict:

- **PASSED on the deployed `sid` build:** AC-1 (all nine present, customer's exact spelling; 19 selectable
  programs) · AC-2 (selectable on Course · 1 HR · 1st Trial · Voucher; voucher list correctly shows 16,
  REQ-027's exclusions hold) · AC-3 (two **actually booked** and cancelled — `Bike & Scooter` 1 HR,
  `Surfskate & Freeskate` 1st Trial) · AC-4 (prices 4,790 / 6,490 / 9,790 at sizes 4/6/10, VAT-inclusive; and
  the 1-hour gap REQ-058 note 3 flagged is **closed** — 1 HR prices at ฿1,390 via REQ-066/TASK-174) ·
  AC-5 (pre-existing programs untouched) · AC-6 (`Surfskate & Skateboard`, added 08-29, live in all four pickers).
- 🔴 **`NOT_TESTED`, named rather than rounded up:** **AC-9 / AC-10** — the `teacher-subjects:link-all` bulk
  and dry-run behaviour is a **CLI run on the server**, which QA's charter forbids. It needs the owner's
  dry-run counts. **AC-3 covered 1 HR + 1st Trial only** (course/voucher proven selectable, not booked —
  a course has no delete and a voucher sale writes an unreversible `bo.movement`). **`sid` only — no `uat` evidence.**
- ⇒ **Not `DELIVERED`.** Porter holds it at `TEST_PASSED` until AC-9/AC-10 land. (Porter answered Tanya's
  AC-6 "no code change / no redeploy" half from his own 08-29 run record: scripts against the DB, no build,
  no `pm2 restart`.)
