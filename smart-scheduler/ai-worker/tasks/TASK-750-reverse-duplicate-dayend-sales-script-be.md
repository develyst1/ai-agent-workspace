# TASK-750 — REQ-130: a one-off, owner-run script that reverses the DUPLICATE day-end sales (the 18 Oct re-run) — BE, S (≈ 0.5 d → 0.6 d)
- Source: REQ-130 · TEST-123 · Silver's "URGENT reply" (inbox/PM.md 10-25, option B) · the owner's pick, verbatim *"B ขึ้น uat พรุ่งนี้"* (via Porter, inbox/SA-B.md 10-25) · the uat SQL result: only 2026-10-18, 13 bookings (9 FIRST_TRIAL + 4 SINGLE_SESSION), 13 extra sales, ≈ 17,751.00 THB
- Status: ✅ DONE again 2026-10-25 (the reopen reviewed: 5209/0, set 15/15) · NOT committed (on top of `5382fe4`) · awaits the owner's ขึ้น git
- Repo: `smart-scheduler-back` · Assignee: @Bob · From: @Silver (2026-10-25)
- **Claim:**
  - NEW `src/lib/duplicate-sale-reversal.ts` (the pure planner);
  - NEW `scripts/reverse-duplicate-sales.ts`;
  - ONE line in `package.json` (`"sale:reverse-duplicates"`, next to `sale:reconcile-prices`);
  - NEW test + mutation set;
  - NEW run doc `docs/RUN-reverse-duplicate-sales.md` (Thai, for the owner).
  - 🔴 Run → list → ask before any other line. 🔴 SAFE command for tests: the repo `.env` points at the customer's system. **The script is NEVER run by us**: no engineer or SA runs it against any database. Git only on the owner's word.

## Why
- Before `d33e249`, every re-run of a date posted its trial / 1 HR / priced OTHER sales again (`rev:<id>#n`). On uat the owner's 18 Oct re-run doubled 13 sales.
- The current back office's P&L / Revenue by activity / Customer spend show them.

## Build (mirror `scripts/reconcile-sale-prices.ts` + `lib/price-reconcile-plan.ts`)
1. **The planner, pure:** given one booking's ledger rows (the keys `rev:<id>` / `rev:<id>#g`, `rev-undo:<id>` / `rev-undo:<id>#g`, `discount:<id>` / `discount:<id>#g`, with `value_minor` and `item_id`, `qty`), return the reversals to write.
   - **live = the sales whose generation has NO `rev-undo` of the same generation.**
   - **live > 1 ⇒ reverse the LOWEST live generations, and keep only the HIGHEST one live.**
   - 🔴 **The HIGHEST must stay live.** `reverseBookingSale` (a later attendance Undo) reverses `postedGeneration = revGeneration − 1`, the highest. If the script reversed the highest instead, a later Undo would hit an already-reversed key and leave the remaining sale in the books while the attendance is undone.
   - live ≤ 1 ⇒ nothing.
   - Each reversal is exactly what `reverseBookingSale` writes for that generation:
     - `item_id` of the sale; `qty: −sale.qty`;
     - `value_minor: −(sale + that generation's discount)`; a net 0 ⇒ skip;
     - `ref_type 'SALE'`; `ref_id` = the booking;
     - reason `"REVERSAL — duplicate day-end re-run"`;
     - key `revUndoKey(id, g)`.
     - Reuse `revUndoKey` / `revKey` / `discountKey` from `lib/sale-post.ts`; don't re-spell the keys.
2. **The script:**
   - reads every `bo.movement` with a `rev:` / `rev-undo:` / `discount:` key whose booking is dated **since 2026-09-06**;
   - plans; prints one line per booking (id · date · type · generations reversed · net THB), then the count + the total THB;
   - **DRY RUN BY DEFAULT**: everything in a transaction that is rolled back. **`--commit` writes.**
   - Append-only: it never edits or deletes a movement. It touches no booking, attendance, quota or outbox (no LINE).
   - Idempotent: a reversal whose key already exists is skipped, so a second `--commit` run writes 0.
   - The console shows ids + amounts only, no names.
3. **The run doc (Thai, for the owner):** where to run it (the box, in the back's folder, with that box's own env), the two commands (`bun run sale:reverse-duplicates` then `… -- --commit`), what the dry run should list (uat: 13 bookings of 2026-10-18, ≈ 17,751.00; sid: Tanya's 4, 4,470.00), and how to check after: SQL 1 returns 0 rows. No secrets, no env values.

## Definition of Done
- [ ] **By value (planner):**
  - 2 sales, 0 reversals ⇒ reverse gen 0 only, gen 1 stays live;
  - a re-run with 3 sales ⇒ reverse gens 0 + 1;
  - a normal undo → re-attend (2 sales + rev-undo of gen 0) ⇒ nothing;
  - 1 sale ⇒ nothing;
  - a discount on gen 0 ⇒ the reversal is the net (1,390 − 319 ⇒ −1,071);
  - a 100 % discount ⇒ skipped;
  - an already-written duplicate reversal ⇒ not planned again.
- [ ] **🔴 By value, after the plan is applied (a stateful fake ledger, like `day-end-double-post-task749.test.ts`):**
  - `liveRevenue` = true (exactly one live), so the next day-end posts nothing;
  - THEN an attendance Undo (`reverseBookingSale`) reverses the remaining live sale, and `liveRevenue` = false;
  - THEN a re-attend posts the next generation once.
- [ ] **The script:** the dry run writes nothing (rolled back); `--commit` twice writes once.
- [ ] **Mutation set:**
  - reverse the HIGHEST generation instead (bites on the Undo-after case);
  - the list price instead of the net;
  - the 100 % discount not skipped;
  - the dry run not rolled back;
  - the existing-key skip removed;
  - the date floor removed.
- [ ] tsc · the full SAFE suite at 0 fail · every existing set still bites.

## After DONE (not this TASK)
- **sid rehearsal (Tanya gates):** the dry run lists exactly her 4 (4,470.00) → `--commit` → a second `--commit` writes 0 → SQL 1 returns 0 rows.
- **uat:** the owner, after 749 + `d33e249` are deployed, and only after he has read the dry-run list.

## Implementation Notes
**Evidence (Bob, 2026-10-25):** full SAFE **5205 pass / 0 fail (371 files)** · tsc 0 · new test `src/lib/duplicate-sale-reversal-task750.test.ts` **19 pass** · new set `duplicate-sale-reversal-task750.mutations.json` **11/11 BITES, CHECKSUM identical** · every other set still bites in full: **749 27/27 · 737 11/11 · 743 25/25 · 748 9/9 · 741 45/45 · 742 47/47** · `getDailyReport` / old SOM files untouched. **The script was NEVER run against any database** — only its function, against a fake ledger. Nothing committed.

**Files (exactly the claim):** NEW `src/lib/duplicate-sale-reversal.ts` (the pure planner) · NEW `scripts/reverse-duplicate-sales.ts` · ONE line in `package.json` (`"sale:reverse-duplicates"`, right after `sale:reconcile-prices`) · NEW test + set · NEW `docs/RUN-reverse-duplicate-sales.md` (Thai, for the owner).

**The planner (`planDuplicateReversals`, pure):** a booking's LIVE sales = the `rev:` sales whose generation has no `rev-undo:` of the same generation. More than one live ⇒ reverse the LOWEST live generations, keep only the HIGHEST (the one a later attendance Undo — `reverseBookingSale`, `postedGeneration = revGeneration − 1` — targets). Each reversal is exactly what `reverseBookingSale` writes for that generation: the sale's item, `qty: −sale.qty`, `value_minor: −(sale + that generation's discount)`, `ref_type SALE`, `ref_id` = the booking, the key `revUndoKey(id, g)`; reason `"REVERSAL — duplicate day-end re-run"`. A net of 0 (a 100 % discount) is skipped. Keys come from `lib/sale-post.ts` (`revKey` / `revUndoKey` / `discountKey`), not re-spelled. `planAll` applies the floor (`DUPLICATE_SALE_FLOOR = "2026-09-06"`, the day TASK-258 made re-posting keys fresh), groups per booking and returns only bookings that need a reversal, oldest first; `formatDuplicatePlan` prints id · date · type · generations · THB and the count + total (ids and amounts only).
**The script (`reverseDuplicates(exec, commit, log)`, exported; `main` only under `import.meta.main`):** ONE transaction. It reads every `bo.movement` with a `rev:` / `rev-undo:` / `discount:` key joined to its booking (`ref_id = bookings.id::text`) for the date and type; plans; prints; a DRY RUN (the default) throws at the end ⇒ rolled back; `--commit` inserts with `ON CONFLICT DO NOTHING … RETURNING` and counts only what was written. I used `ON CONFLICT DO NOTHING` rather than catching a unique violation: inside a Postgres transaction a caught 23505 aborts the rest of it. A second `--commit` plans 0 (the first one's reversals make those duplicates non-live). No booking, attendance, quota, outbox or LINE is touched; no name is read (pinned).
**By value (stateful fake ledger):** DRY RUN lists and writes nothing; `--commit` writes the gen-0 reversal, the second writes 0; original rows untouched and a pre-floor booking left alone; a discounted duplicate reverses the NET (−1,071 of 1,390 − 319); a 100 % discounted one writes no row; a reversal that loses a race is not counted; 🔴 **after the plan is applied**: `liveRevenue` = true so the next day-end posts nothing → an attendance Undo (`reverseBookingSale`) reverses the remaining live sale and `liveRevenue` = false → a re-attend posts the next generation (`rev:<id>#2`) exactly once.
**Mutants:** Q1 reverse the HIGHEST (bites 10 tests incl. the Undo-after case) · Q2 list price instead of net · Q3 the 100 % discount not skipped · Q4 the dry run not rolled back · Q5 the already-reversed skip removed · Q6 the floor removed · Q7 the qty sign · Q8 the wrong ref_id · Q9 a generation gap missed · Q10 the key shape · Q11 a conflicting insert counted as written (this one SURVIVED at first — no test lost a race — so I added that test; now it bites).
**The run doc (Thai):** where (the box, in the back's folder, with that box's env), the two commands, what the dry run must list (uat: 13 bookings of 2026-10-18, ≈ 17,751.00; sid: Tanya's 4, 4,470.00), STOP if it does not match, the second `--commit` shows 0, and the check after: «SQL 1» returns 0 rows. No secrets, no env values; I did not write the SQL 1 text into it (it is the owner's existing query).
**Routing note:** the doorbell for this entry reached me from Porter on Silver's behalf (Silver's sends were capped); the work itself is Silver's entry in my inbox, which is what I acted on.

## Questions
None.

## Review
### ✅ Silver, 2026-10-25
- **Re-run myself (SAFE):** full suite **5205 pass / 0 fail** (371 files) · tsc 0 · the 750 set **11 / 11 bite** · the 749 set still 27 / 27, both checksums identical.
- **The planner:**
  - live = a `rev:` of generation g with no `rev-undo:` of g; > 1 live ⇒ reverse the lowest, keep the highest;
  - net = sale + that generation's discount; a 0 net is skipped; the keys come from `lib/sale-post.ts`;
  - the floor is 2026-09-06.
  - ✅ The Undo-after-apply case is pinned by value on a stateful ledger, and the reverse-the-HIGHEST mutant bites.
- **The script:**
  - a dry run by default (rolled back); `--commit` writes;
  - `onConflictDoNothing` relies on `bo_movement_idempotency_uq` (backoffice-back `0004_bo_schema.sql:71`), which exists;
  - append-only; no booking / attendance / LINE; ids + amounts only.
- **The run doc (Thai):** no secrets; the expected lists for sid / uat; it stops if the list doesn't match; the after-check = SQL 1 at 0 rows.
- **A known limit (not a defect for the cases at hand):** a booking that was doubled AND then had its attendance undone (the Undo reversed the highest, so 1 live sale is left on an undone booking) is not planned: it has only 1 live sale. uat's 13 have 0 reversals, so none is in this shape. The sid dry run shows whether any is.
- **Named files (not committed):**
  - NEW `src/lib/duplicate-sale-reversal.ts`;
  - NEW `scripts/reverse-duplicate-sales.ts`;
  - `package.json` (1 line);
  - NEW `src/lib/duplicate-sale-reversal-task750.test.ts`;
  - NEW `src/lib/duplicate-sale-reversal-task750.mutations.json`;
  - NEW `docs/RUN-reverse-duplicate-sales.md`.

## 🔁 REOPENED 2026-10-25 — where it runs (the owner) + say which DB it is pointed at
- **The owner, verbatim (via Porter):** *"รันที่ local สิ ที่ server ไม่ได้ ฉัน build เป็น dist ไป มันรันไม่ได้"*. The servers hold a built dist only, so the script runs from **the owner's local back checkout**, with the env file of the target box.
- **The sid dry run** listed 4 bookings / 7,250.00 against an expected 4,470.00. One booking (2026-10-23, SINGLE_SESSION) has generations 0, 1, 2 to reverse.
  - **The code is right IF that booking has 4 live `rev:` sales** (= 4 posts and 0 reversals; the planner keeps #3). 7,250 − 4,470 = 2,780 = 2 × 1,390: exactly two more copies of a 1 HR at 1,390.
  - This is consistent with that date being in the window of two more pre-fix runs on sid. Tanya confirms from its ledger.
- **Change 1, the script:** before the plan, print the TARGET: `current_database()` and the server host (`inet_server_addr()` / the URL's host). **Never the user, the password or the URL.** The line reads e.g. `เป้าหมาย: <db> @ <host>`.
- **Change 2, the run doc (Thai):** replace "on the box" with:
  - run in the owner's **local** `smart-scheduler-back` checkout, at `dong` ≥ `5382fe4`;
  - choose the env with `bun --env-file=.env.sid run sale:reverse-duplicates` (uat: `.env.uat`). ⚠️ The plain `.env` points at the customer's system;
  - **before any `--commit`, read the target line**: it must be that box's DB. If not, stop;
  - the expected lists come from SQL 1 / SQL 2 run on that box just before (not from a number in the doc): the dry run's total must equal SQL 2's.
- **DoD:**
  - a by-value test that the target line is printed BEFORE the plan, and carries no user / password / URL;
  - the doc shows the two `--env-file` commands and no env values;
  - a mutant that drops the target line;
  - the full SAFE suite at 0 fail; tsc; the sets bite.
- Claim unchanged (`scripts/reverse-duplicate-sales.ts`, `docs/RUN-reverse-duplicate-sales.md`, the 750 test / set). Never run against any DB. Git only on the owner's word.

### Reopened change (Bob, 2026-10-25) — the target line + the run doc
**Evidence:** full SAFE **5209 pass / 0 fail (371 files)** · tsc 0 · 750 test **23 pass** · 750 set **15/15 BITES** (+T1–T4) · sets 749 27/27 · 737 11/11 · 743 25/25 · 748 9/9 · 741 45/45 · 742 47/47, all CHECKSUM identical. **Never run against any database; no env value printed or written anywhere.** Nothing committed.
**Change 1, the script (`scripts/reverse-duplicate-sales.ts`, `lib/duplicate-sale-reversal.ts`):** the FIRST line of every run (dry run and `--commit`) is now the target: `เป้าหมาย: <db> @ <host>`. It is read FROM THE SERVER inside the transaction — `select current_database(), coalesce(inet_server_addr()::text, 'local-socket')` (`readTarget`) — so it is what is REALLY connected, never an env value; `formatTarget` prints the database name and the host and nothing else (no user, password or URL; the script reads no `process.env` at all — pinned). The planner is unchanged.
**Change 2, the Thai run doc (`docs/RUN-reverse-duplicate-sales.md`):** «on the box» replaced by the owner's LOCAL `smart-scheduler-back` checkout (`dong` ≥ `5382fe4`; servers hold a dist only); the two commands per box — `bun --env-file=.env.sid run sale:reverse-duplicates` / `bun --env-file=.env.uat run sale:reverse-duplicates` (+ `-- --commit`) — with the warning that the plain `.env` points at the customer's system; the steps: SQL 1 / SQL 2 on that box first (the expected numbers come from that box at that moment, NOT from the doc — the fixed 17,751.00 / 4,470.00 are gone), read the target line before any `--commit` (stop if it is not that box's DB), the dry run's total must equal SQL 2's, the second `--commit` shows 0, SQL 1 returns 0 rows after. No env values.
**Pins:** the target is the FIRST line in a dry run and in a commit and is followed by the plan; the output contains neither the environment's DATABASE_URL nor its user/password/`postgres://` (the credential pair checked whatever its length; pieces of ≥ 3 characters checked singly); the script holds `current_database()` / `inet_server_addr()` and no `process.env`; the doc holds both `--env-file` commands, the local-checkout line, the target-line line, SQL 2, and no env value. **Mutants:** T1 the target line dropped · T2 printed AFTER the plan · T3 leaks `DATABASE_URL` · T4 database and host swapped.
**On the sid dry run (7,250.00 vs the expected 4,470.00):** not touched here — the planner stands as accepted; Tanya confirms the 4-live-sales reading from sid's ledger.
**Files:** `scripts/reverse-duplicate-sales.ts` · `src/lib/duplicate-sale-reversal.ts` · `src/lib/duplicate-sale-reversal-task750.test.ts` · `src/lib/duplicate-sale-reversal-task750.mutations.json` · `docs/RUN-reverse-duplicate-sales.md`. (The doorbell for this entry came via Porter for Silver; I acted on Silver's inbox entry.)

### ✅ Silver, 2026-10-25 — the reopen reviewed
- **Re-run (SAFE):** **5209 pass / 0 fail** · tsc 0 · the 750 set **15 / 15 bite**, checksum identical.
- **The target line:** read from the server inside the transaction (`current_database()` + `inet_server_addr()`), printed FIRST; the script reads no env. The planner's diff = only `formatTarget` / `RunTarget` added; the logic is untouched.
- **The doc:** the owner's local checkout; both `--env-file` commands; the plain-`.env` warning; SQL 1 / 2 on that box first; the dry-run total = SQL 2's; no env values.
- **Named files (not committed):** `scripts/reverse-duplicate-sales.ts` · `src/lib/duplicate-sale-reversal.ts` · `src/lib/duplicate-sale-reversal-task750.test.ts` · `src/lib/duplicate-sale-reversal-task750.mutations.json` · `docs/RUN-reverse-duplicate-sales.md`.

### Wording fix (Bob, 2026-10-25) — the run doc no longer states what `.env` points at
`docs/RUN-reverse-duplicate-sales.md` line 29 now reads only: «ไฟล์ `.env` ปกติอาจชี้ไปที่ฐานข้อมูลไหนก็ได้ — ใส่ `--env-file` ทุกครั้ง และอ่านบรรทัด `เป้าหมาย:` ก่อนเสมอ». No existing pin read the old words; the doc pin now asserts the new sentence and that «ระบบจริงของลูกค้า» is gone (same intent: always `--env-file` + the target line). **Evidence:** full SAFE **5209 pass / 0 fail (371 files)** · tsc 0 · 750 set **15/15**, CHECKSUM identical. Files: `docs/RUN-reverse-duplicate-sales.md` (one line) · `src/lib/duplicate-sale-reversal-task750.test.ts` (the doc pin).
