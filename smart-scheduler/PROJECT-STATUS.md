# smart-scheduler — PROJECT STATUS (resume-here / cross-machine memory)

> **Source of truth for resuming on any machine.** git-synced, so it travels; local `.claude/memory/` does not.
> Resume: `git pull` → `ai-worker/PROTOCOL.md` + your role file → this + `ai-worker/board.md` + the newest
> `ai-worker/log/*.md` → act on your role's ball.
>
> **Last updated:** **2026-08-22** by Porter (PM), reconciled against the board and
> `ai-worker/log/2026-08-22.md`. Human twin: `PROJECT-STATUS.html`. Code repos: **`H:\scheduler`**.

## 🚦 Environments (owner's names — "prod" is not a word we use)
| | **`sid`** — the team builds & verifies here | **`uat`** — the customer's system |
|---|---|---|
| frontoffice | som.develyst.online | frontoffice.develyst.online |
| backoffice | backoffice-som.develyst.online | backoffice.develyst.online |
| who touches it | team verifies (owner deploys) | **owner only** |

**Migrations: `sid` first, verified, then `uat`.** Both boxes are now at **20/20 migrations, `db:verify` GREEN**.

## 🚦 The UAT gate (owner's rule, 2026-08-19 — written into `PM.md` and `QA.md`)
**Nothing reaches `uat` without BOTH Porter and Tanya green-lighting it**, and we carry that responsibility.
Tanya answers *"does it work?"* from a run on the deployed `sid` build; Porter answers *"is it the right thing,
is now the right moment, is the customer impact understood?"* **Not a green light:** code-complete · SA-reviewed ·
tests pass · a dry run · "worked locally" · nobody objecting. A green light is a written block naming the build,
what was tested, **what was NOT**, migrations, rollback, customer impact, and both names.

## Where we are (2026-08-22 — read this first)
- 🟢 **GO-LIVE WAVE 1 IS COMPLETE ON `uat`.** All 8 batches in. Today closed the last four off the **updated**
  workbook: **111 students (105 new + 6 sibling merges), zero duplicates.** `uat` = **115 parents / 137 students**,
  verified by query.
- 🟢 **REQ-058 DELIVERED — 19 programs** on both boxes (the nine requested + `Baby Skate`), all `bike-skate`
  (4h 4,790 / 6h 6,490 / 10h 9,790, voucher-eligible), **every teacher linked to every program**.
  **Adding a program is now one command, not a deploy** — that was the real gap and it is closed.
- 🟢 **REQ-060 Part A shipped** — the importer normalises gender/nationality on write, so the 111 arrived with
  **visible** gender. Proven by re-running the dry runs and showing **nothing moved** (3 · 47 · 55 · 6).
- 🔴 **A revenue hole was found and closed.** `uat` had **zero** sale items — every sale had nothing to post to —
  and the first real customer sale (`ชวินท์`, 08-21, ฿9,790) **is still not in the books**.
  `sale:ensure-items` has now run on both boxes (20 items each) and **belongs in the standard deploy sequence**
  (SA endorsed). Also found: `onewheel` 6h is ฿90 wrong and its 10h **cannot be sold at all** → **REQ-061**.
- 🟢 Owner-run tools added: `subjects:add` · `teacher-subjects:link-all` (dry-run-first, insert-only).
- 🟢 Earlier and still true: LINE menus + leave flow verified live; `uat` ledger repaired; both boxes 20/20 GREEN.

## Two rules this week keeps teaching the hard way
1. **Data being right and the screen showing it are different facts.** REQ-060 existed because gender was in the
   database and **invisible in the product**. Check the screen, not the row.
2. **"sid first" is load-bearing for MIGRATIONS and misleading for DATA IMPORTS.** `sid` holds the old-name
   rehearsal, so re-running an import there **duplicates**. Config → both boxes. Divergent data → `uat` only.

## Go-live (REQ-055) — wave 1 DONE, wave 2 still blocked on the customer
**Wave 1 = people. ✅ COMPLETE on `uat`.** Rules used: `0`-prefix phones (exactly 10 digits or held) · DOB sanity ·
no-phone ⇒ held · parent-name rows donate the family name, never become students · **yellow excluded** ·
day-by-day batches · row-keyed report.
**Still outstanding from wave 1:** **11 students need phone numbers from the customer**; **2 are fixable in the
sheet** (rows 69 `ยูจีน ธีภพ`, 109 `วุฒิ ปัญญาวุฒิ` — two phone numbers in one cell); 29 yellow rows deliberately
excluded (`ยังไม่พร้อม`, owner-confirmed); **24 earlier-imported rows still hold `Male`/`Thai`** ⇒ REQ-060 Part B.
**Wave 2 = the customer's real courses** — still blocked on **them**: program · package size · sessions used ·
day+time · coach, per student. Their `Course` sheet is a progress tracker, **not** this data.
Files: `project-docs/2026-08-22-student-list.csv`, `…-yellow-rows.txt`.

## Open work, ranked
1. **REQ-057** — scoped cleanup tool. Target is **named**: student `Test` / parent `SOM Team` (0924912848),
   1 Skateboard course (4/10 used) + its bookings, sitting in the customer's system. **Next up with SA.**
2. **REQ-059** — importer must UPDATE in place. **31 student names were edited** in the sheet; on `uat` only
   `เอแคลร์` and `อาร์ตี้` are affected (both already carry courses) — the scale problem lives on `sid`.
3. **REQ-060 Part B** — repair the **24** rows still holding `Male`/`Thai` (+ `sid`'s rehearsal). Must skip
   `คุณมะเหมี่ยว`, already fixed by the customer.
4. **REQ-061** — `onewheel` 6h → 7,900 (**hand-edit in the backoffice on BOTH boxes**; `sale:ensure-items` is
   insert-only and will never correct it) · 10h → add at 11,900 · **refuse `SINGLE_SESSION` where the price group
   has no 1-hour rate** (today `isSellable` is checked only on course creation, so that revenue silently never posts).
5. **`ชวินท์`'s sale is not in the books** — needs a targeted back-post; `recordSale` fires at sale time only.
6. **REQ-052** — TASK-142 unblocked; palette approved with **no emoji, icons only** (AC-9).
7. **REQ-051** (walk-in QR) — `READY_FOR_SA`, **nothing owed by the owner** (Q1 answered 08-16, Q2 resolved by
   Porter: one QR for the centre).
8. **REQ-062** (advance leave in LINE) — ⛔ **do not spec yet**: the picker filters `CONFIRMED` and course sessions
   are born `PENDING`, so widening the date range alone would ship and do nothing. Owner owes Q4 — *when do staff
   press `ยืนยัน + แจ้งเตือน Line`?*
9. **REQ-049 AC-1** — owner registers an admin via the bot (`สมัคร` → 3 → `229`) so a leave notification has a
   recipient.
10. **REQ-035** (sell-side stock + revenue) — owner's instruction: **last**.

## Deferred tests (grouped into wave-2 acceptance, named not dropped)
REQ-053 AC-2 (crafted `PATCH` refusal — needs a real course) · REQ-054 AC-6 (reports read a course as one program) ·
REQ-049 AC-1 (admin actually notified) · the LINE flows on `uat` itself.

## Open questions owed by the owner
- **REQ-062 Q4 — when do staff press `ยืนยัน + แจ้งเตือน Line`?** (at course creation / the day before / on the
  day). It decides the whole design, because that button also **messages the parent**. **This blocks REQ-062.**
- **11 students need phone numbers** from the customer (listed in `log/2026-08-22.md`), + 2 sheet cells to fix.
- **`ชวินท์`'s ฿9,790 sale** — record it retroactively, or leave it?
- **REQ-061:** does the customer sell a plain 1-hour session on the bike/skate programs, or is 1st Trial the only
  one-hour product there?
- ~~REQ-051's three security decisions~~ — **NOT owed.** Q1 was answered 2026-08-16, Q3 is an SA question, and
  Q2 (one QR or one per area) was resolved by Porter: **one QR**. Corrected 2026-08-22; it had been mis-listed as
  owner-blocked for six days.

## Parked by the owner (his explicit decisions — do not re-raise)
Dashboards + the 8-item meeting wishlist (REQ-033/034/036/039) · the `.dump` pushed to git (`0b8966c`) ·
the two open DB whitelists (`49.237.170.101`, `110.171.40.169`) · `.env.local` pointing at `uat` ·
`QA-prod-*` residue · REQ-056 (`สาขา`/`จังหวัด` are **badge names**, not untranslated strings — closed, not a defect).

## Team & workflow
PM=Porter · SA=Sober · BE=Jason · FE=Fern · QA=Tanya. Chain: Human→Porter→Sober→(Jason/Fern); QA hangs off Porter.
Everything lives in `ai-worker/`. **Write the log entry in the day's file** — a status without an owner, or work
without a log line, is how three items went missing this week.
