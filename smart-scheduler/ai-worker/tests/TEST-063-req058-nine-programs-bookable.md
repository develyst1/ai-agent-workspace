# TEST-063: REQ-058 — the nine new programs are real, selectable and bookable
- Source REQ: REQ-058 (Add nine programs + a repeatable way to add the next one)
- Status: TEST_PASSED (with two ACs explicitly NOT_TESTED — see Verdict)
- Environments: **`sid` only** (`som.develyst.online`, deployed build). No local run — REQ-058 is data on a
  deployed box; a local suite would prove nothing about it.
- Tested: 2026-08-30 by Tanya (this round). See §Session note at the end — the session later continued into 2026-09-01.

## Scope

REQ-058 has sat at `IN_TEST` since the owner ran the runsheet. What was verified before today was **data**
(Porter counted 19 subject rows on both boxes). What was never exercised is the part the REQ actually asks for:
**AC-2 "each can be selected when creating a course / single session / trial / voucher"** and
**AC-3 "at least one teacher is attached, and booking that program with that teacher succeeds"**.
Counting rows in a table is not either of those. This round runs them in the product.

Also re-checked while I was in there: AC-1 (exact names), AC-4 (price), AC-5 (regression), AC-6 (a program
added by command, no deploy).

**Deliberately NOT in scope:** AC-9 / AC-10 (`teacher-subjects:link-all` bulk + dry-run) — those are an
owner-run CLI on the server; running scripts on `sid` is operating the box, not testing on it. And the whole
`uat` side — outside my charter.

## Cases

| # | Case (from AC) | Type | Steps | Expected | Actual | Result |
|---|----------------|------|-------|----------|--------|--------|
| 1 | AC-1 — the nine exist with the customer's exact spelling | happy | Log in to `sid`; open the booking modal's Subject picker (teacher Bank) and read every option | All nine present, spelled exactly as the REQ lists them | 19 selectable programs. All nine present verbatim: `Bike` · `Balance Cruiser` · `Balance Bike` · `Scooter` · `Inline Skate & Bike` · `Surfskate & Bike` · `Surfskate & Inline Skate` · `Bike & Scooter` · `Surfskate & Freeskate`. No near-miss spelling, no abbreviation | **PASS** |
| 2 | AC-2 — selectable on a **1 HR** (single session) | happy | Schedule → `+` on Bank / 2026-08-31 → tab **1 HR** → open Subject | all nine listed | all nine listed (19 total) | **PASS** |
| 3 | AC-2 — selectable on a **1st Trial** | happy | same modal → tab **1st Trial** → open Subject | all nine listed | identical 19-item list | **PASS** |
| 4 | AC-2 — selectable on a **Voucher** | happy | same modal → tab **Voucher** → open Program | all nine listed | **16** listed — all nine present; `Onewheel E-Skate`, `Balance Play (Private)`, `Balance Play (Group)` correctly absent | **PASS** |
| 5 | AC-2 — selectable on a **Course** | happy | Bookings/Students → **New course** → teacher Bank → open Program | all nine listed | identical 19-item list | **PASS** |
| 6 | AC-3 — a new program actually **books** (1 HR) | happy | 1 HR · student `QA-req072-fixture` · teacher Bank · subject **Bike & Scooter** · 2026-08-31 09:00 · QA session note → Save | booking is created and appears on the calendar | Saved. Cell renders `1 HR · Bike & Scooter`, status PENDING, note shown. The `&` in a combined name renders clean — no escaping fault | **PASS** |
| 7 | AC-3 — a new program actually **books** (1st Trial, different program) | happy | 1st Trial · same student · teacher Bank · subject **Surfskate & Freeskate** · 2026-09-01 09:00 → Save | booking is created | Saved. Cell renders `1st Trial · Surfskate & Freeskate`, PENDING | **PASS** |
| 8 | AC-3 — "at least one teacher attached to each" | happy | derived from cases 2/3/5: teacher Bank's own subject list | ≥1 teacher per new program | Bank is linked to **all nine** ⇒ every new program has a teacher who can be booked on it | **PASS** |
| 9 | AC-4 (money) — a new combined program prices off the customer's card | happy | New course → Bank → **Surfskate & Inline Skate** → read the price at each course size | 4 h 4,790 · 6 h 6,490 · 10 h 9,790 (`bike-skate`) | `4 sessions` → **฿4,790** · `6 sessions` → **฿6,490** · `10 sessions` → **฿9,790**, "price includes VAT". Leave quota/extension shown as 1→wk5 · 2→wk8 · 3→wk13 | **PASS** |
| 10 | AC-4 — a 1-hour session on a new program has a price at all | edge | 1 HR tab, subject `Bike & Scooter` | a price, not a refusal | **฿1,390**, Save enabled. (REQ-058's own note 3 said `bike-skate` had **no** 1-hour price; REQ-066/TASK-174 has since closed that, and this is the running-system proof) | **PASS** |
| 11 | AC-5 (regression) — the pre-existing programs are untouched | regression | read the same pickers | all 8 originals still there, incl. the KEPT combined `Bike / Scooter / Balance Cruiser` | All 8 present. `Bike / Scooter / Balance Cruiser` still selectable and still carries its live course (KKTEST, 2026-08-30 13:00) — not renamed, not merged, not migrated | **PASS** |
| 12 | AC-5 (regression) — existing prices unchanged | regression | New course → Bank → **Surfskate** (pre-existing) → 6 sessions | ฿6,490 | **฿6,490** — identical to the new programs, i.e. the nine joined the `bike-skate` line without moving it | **PASS** |
| 13 | AC-5 (regression) — REQ-027 voucher exclusions still hold | regression | Voucher tab program list | Onewheel + both Balance Play excluded | all three excluded; nothing else lost | **PASS** |
| 14 | AC-6 — a tenth program needs no code change / deploy | happy | look for `Surfskate & Skateboard`, added by the owner on `sid` on 2026-08-29 via `subjects:add` | present and selectable everywhere | Present in **all four** pickers (Course, 1 HR, 1st Trial, Voucher). ⚠️ my half is "it is live and selectable"; the "no deploy happened" half rests on Porter's 2026-08-29 log entry, not on anything I observed | **PASS (partial evidence — see Questions)** |
| 15 | AC-9 / AC-10 — `link-all` bulk + dry-run | — | — | — | **NOT RUN.** Owner-run CLI on the server; running it would make me an operator of `sid`, which my charter forbids | **NOT_TESTED** |
| 16 | AC-3 executed on the **Voucher** and **Course** paths | — | — | — | **NOT RUN.** Cases 4/5 prove the program is *selectable*; I did not create a voucher or a course on a new program. A course cannot be deleted (only soft-cancelled) and a voucher sale writes a `bo.movement` I cannot reverse — the footprint outweighs the marginal evidence, given cases 6+7 already prove a new program books | **NOT_TESTED** |

## Defects

**None.** Nothing failed in this round.

Two observations that are *not* defects, recorded so they are not lost:

- **OBS-1 — the cancel dialog says nothing about posted revenue.** Cancelling my 1 HR row asked for a reason
  (`ADMIN_ERROR`) and took a note, but showed no line about money already in the books. That is exactly the gap
  Porter ordered work on in the 2026-08-29 log ("warn when cancelling a booking whose revenue has ALREADY
  posted") and it is **not yet built**, so this is a confirmation of the known gap, not a new finding. My rows
  had no posted sale, so nothing was mis-stated to me.
- **OBS-2 — `Cancel booking` is present and works on a `1st Trial`** (seen while cleaning up case 7). That is
  TASK-220's FE half, visible and functioning on the deployed `sid` build. ⚠️ **This is NOT the TASK-220 `sid`
  check** Sober asked for: he named *cancel an **ATTENDED** first trial → CANCELLED + reason stored + freelance
  hold released*. Mine was **PENDING**, and I deliberately did not mark it ATTENDED because that posts revenue
  at day-end and I cannot reverse a `bo.movement`. **TASK-220 remains unverified on `sid`.**

## Test data created

| What | Where | Removed? |
|------|-------|----------|
| Booking `QA-req072-fixture` · 1 HR · **Bike & Scooter** · Bank · 2026-08-31 09:00–10:00, note "QA REQ-058 AC-3 test 2026-08-30 - delete after" | `sid` | ✅ **CANCELLED** (`ADMIN_ERROR`, note "QA cleanup - REQ-058 AC-3 test row"). Verified as `CANCELLED` in Bookings → All bookings. No hard delete exists in the product — cancel is the softest removal, same as every prior round |
| Booking `QA-req072-fixture` · 1st Trial · **Surfskate & Freeskate** · Bank · 2026-09-01 09:00–10:00, note "QA REQ-058 AC-3 trial test 2026-08-30 - delete after" | `sid` | ✅ **CANCELLED** (`ADMIN_ERROR`, note "QA cleanup - REQ-058 AC-3 trial test row"). Verified as `CANCELLED` in the same list |
| Course-plan **previews only** — `Surfskate & Inline Skate` at sizes 4/6/10 and `Surfskate` at 6 (cases 9 + 12) | `sid` | ✅ **nothing created** — I read the price in the form and pressed **Cancel**; "Generate plan" was never pressed |
| Student / parent rows | — | ✅ **none created.** I reused the QA-owned `QA-req072-fixture` from an earlier round precisely because students cannot be deleted |
| Money | — | ✅ **no `bo.movement` written.** Neither booking was confirmed or marked ATTENDED, so nothing posted |
| LINE | — | ✅ **no message sent.** `Confirm + LINE` was never pressed — it reaches a real recipient |
| Other people's data | — | ✅ **untouched.** Only rows I created today were written; the older `QA-req072-fixture` Onewheel course sessions were read, never modified |
| Server state | — | ✅ no restart, no redeploy, no script run, no setting changed |
| `uat` / `frontoffice.develyst.online` | — | ✅ **no contact of any kind** |

## Verdict

**`TEST_PASSED`** — on `sid`, all nine REQ-058 programs exist with the customer's exact spelling, are selectable
on **all four** booking types, price off the `bike-skate` card at 4,790 / 6,490 / 9,790 (and 1,390 for a single
hour), and **two of them were actually booked to a teacher and saved**. The pre-existing programs, their prices
and REQ-027's voucher exclusions are unchanged.

**What this verdict does NOT cover — read this before treating REQ-058 as finished:**
1. **AC-9 / AC-10 (`link-all` bulk + dry-run) — `NOT_TESTED`.** Owner-run CLI; outside my environment rules.
2. **AC-3 was executed on 1 HR and 1st Trial only.** Course and Voucher are proven *selectable*, not *booked*.
3. **Everything here is `sid`.** `uat` is the owner's box; nothing in this file is evidence about it.
4. **TASK-220 is still unverified on `sid`** (see OBS-2) — the ATTENDED-first-trial path was not run.

So REQ-058 is, in my lane, **done and working**. Whether that is enough to call it `DELIVERED` is Porter's
call, and it needs the AC-9/AC-10 answer from the owner first.

## Questions

(For Porter; he answers as `> answer: ...`)

1. **AC-9 / AC-10 need someone other than me.** `teacher-subjects:link-all` is run on the server, and after the
   2026-08-29 policy change it is `sid`-only anyway. Do you want the owner to re-run it on `sid` with a dry run
   first and paste the counts (teachers × programs × created/skipped, and **0 created** on a second run), so
   those two ACs can be closed with evidence rather than left open? I can read the output; I cannot produce it.
   > answer: _pending_

2. **AC-6's "no deploy" half.** I can see `Surfskate & Skateboard` live and selectable in all four pickers,
   which is the observable part. The claim that adding it required **no code change and no redeploy** comes from
   your 2026-08-29 entry, not from anything I ran. Confirm that and AC-6 is closed on the record.
   > answer: _pending_

3. **TASK-220 still has no `sid` behavioural check.** Sober's stated check is *cancel an **ATTENDED** first
   trial*. Marking a booking ATTENDED posts revenue at day-end and I have no way to reverse a `bo.movement`, so
   I did not do it on my own initiative. If you want that check run, say so and tell me whether the resulting
   money row is acceptable residue (or whether the owner will reverse it in the backoffice).
   > answer: _pending_

---

## Session note + answers received (2026-09-01)

**On the date, because I nearly corrupted this file trying to "fix" it.** This session stayed open across days:
the round above ran on **2026-08-30** (the app's own header read `24 Aug – 30 Aug 2026 · Today`), and the
session then continued into **2026-09-01**. `PROTOCOL.md` §Date discipline covers exactly this — *"a session
that crosses midnight switches files at midnight"* — so **`2026-08-30` on this file is correct**, my entry
belongs in `log/2026-08-30.md` where it is, and the 2026-09-01 work goes in its own file.

📌 **Kept because I got it wrong first.** On resuming I read the session's current-date context (`2026-09-01`)
against my *memory* of the app showing `30 Aug`, and concluded I had misdated the whole round. I edited this
file and the footprint ledger to say `2026-09-01`, and drafted a question asking whether `sid`'s **server clock**
was two days adrift. **All of that was wrong**, and wrong in the expensive direction: it would have sent the
owner to check a healthy server, and it stamped a false date on evidence that was correctly dated. Reverted in
full. **The lesson is not "check the clock" — it is that a remembered screen is not evidence.** I should have
re-read the screen before rewriting the record; one page load settled it in seconds.

### Answers received since the round above

- **Q2 — ANSWERED by Porter: YES, no code change and no redeploy.** `Surfskate & Skateboard` went in via
  `subjects:add --group bike-skate` + a named-list link INSERT — scripts against the DB, no build, no
  `pm2 restart`; his own record of running it. ⇒ **AC-6 is closed**: case 14 upgrades from
  *PASS (partial evidence)* to **PASS**, with the "no deploy" half carried by PM evidence, not by a test.
- **Q3 — WITHDRAWN. TASK-220 is not mine to verify.** Porter, 2026-08-31 22:04: the owner confirmed
  *"deploy TASK-220 ไปนานแล้วโว้ย เขาใช้แล้ว"* — it shipped long ago and the customer uses that path daily.
  ⇒ **OBS-2 above is superseded**: real usage beats a re-proof, and the `bo.movement`-residue question I was
  holding is moot. **Stood down; no ATTENDED-first-trial run.**
- **Q1 — still open with the owner** (AC-9/AC-10 `link-all` dry-run counts). Unchanged: `NOT_TESTED`.

⇒ **Verdict unchanged: `TEST_PASSED`**, with AC-9/AC-10 still `NOT_TESTED` and the Course/Voucher paths still
proven *selectable* rather than *booked*.
