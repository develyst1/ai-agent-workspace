# smart-scheduler — PROJECT STATUS (resume-here / cross-machine memory)

> **Source of truth for resuming on any machine.** git-synced, so it travels; local `.claude/memory/` does not.
> Resume: `git pull` → `ai-worker/PROTOCOL.md` + your role file → this + `ai-worker/board.md` + the newest
> `ai-worker/log/*.md` → act on your role's ball.
>
> **Last updated:** **2026-08-23 (evening)** by Porter (PM). Human twin: `PROJECT-STATUS.html`.
> Code repos: **`H:\scheduler`** · uat deploy paths: `C:\som-balance-project\{frontoffice,backoffice}\back\dist`

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

## Where we are (2026-08-23 evening) — READ THIS FIRST

**The customer is running their business on `uat`.** 137 students · 115 families · **60 imported courses**, ~43 of
them created by them on 23 Aug alone. **Saturday and Sunday are their business; Mon–Fri are nearly empty.**

### Shipped and live on BOTH boxes
- **REQ-055 wave 1** — 111 students imported, zero duplicates.
- **REQ-058** — 19 programs, every teacher linked. Adding a program is now one command (`subjects:add`).
- **REQ-063** — **discount** on all five sale types, two posting moments, both proven in the ledger.
- **REQ-064** — imported courses no longer append unbought sessions.
- **REQ-065** — `1st Trial` removed from the program pickers.
- **REQ-066** — every program has a 1-hour price (฿1,390).
- **REQ-069 + REQ-067 Part B** — **week is Monday→Sunday** everywhere, teacher LINE schedule rewritten.
- **REQ-060 Part A + Part B.1** — gender/nationality normalised on write, and the stored `Male`/`Thai`
  rows repaired in place (`demographics:repair`, owner-run, both boxes).
- **REQ-059** — the importer **UPDATES in place**; wipe-and-re-import is retired as the correction path.
  Run on `uat` (divergent data — not sid-first).
- **REQ-061** — Onewheel priced correctly; 10 h sellable; `SINGLE_SESSION` guard.
- **Sale catalogue seeded on both boxes (22 items).** Before 08-22 **no sale had ever posted** — `sale:ensure-items`
  had never been run. **It belongs in the standard deploy sequence.**

### In flight
| who | what |
|---|---|
| **@Sober** | **REQ-068 + REQ-052 re-spec** — calendar cell + **display toggle** + **session note**, built ONCE |
| **@Fern** | **TASK-167** (modal field alignment) → **TASK-176** (labels `1st Trial` / `1 HR`) |

### Owed by the owner
`ชวินท์`'s ฿9,790 sale never posted (decide) · register an admin via the bot (REQ-049 AC-1) · 11 phone numbers +
8 nationalities from the customer · REQ-066 AC-2 (฿1,390 posts at day-end — on `sid`).

### Parked / not built
REQ-045 · REQ-047 · REQ-051 · REQ-062
(blocked on: when do staff press `ยืนยัน + แจ้งเตือน Line`?) · REQ-035 · backoffice reads need no token (TASK-068) ·
no build stamp anywhere (cost two round trips).

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
excluded (`ยังไม่พร้อม`, owner-confirmed); the **24** rows that held `Male`/`Thai` are **repaired** (REQ-060 Part B.1, owner-run).
**Wave 2 = the customer's real courses** — still blocked on **them**: program · package size · sessions used ·
day+time · coach, per student. Their `Course` sheet is a progress tracker, **not** this data.
Files: `project-docs/2026-08-22-student-list.csv`, `…-yellow-rows.txt`.

## Open work, ranked
1. **REQ-057** — scoped cleanup tool. **GO 2026-08-23 — the owner lifted his 08-22 hold; @Sober to cut.**
   Target is **named**: student `Test` / parent `SOM Team` (0924912848), 1 Skateboard course (4/10 used) + its
   bookings, sitting in the customer's system. ⚠️ **Building it is authorised; running it against `uat` is a
   separate decision** — *"เราไม่ลบ…จนกว่าเขาจะแจ้ง"* still stands until the owner says otherwise.
2. **REQ-068 + REQ-052 re-spec** — the calendar cell (program + booking type), the **display toggle** and the
   **session note** are one cell and must be built **once**. TASK-142 is **not** ready to build until it is re-cut.
   Palette approved, **no emoji, icons only** (AC-9). **@Sober — the longest open lane.**
3. **`ชวินท์`'s sale is not in the books** — needs a targeted back-post; `recordSale` fires at sale time only.
4. **REQ-051** (walk-in QR) — `READY_FOR_SA`, **nothing owed by the owner** (Q1 answered 08-16, Q2 resolved by
   Porter: one QR for the centre).
5. **REQ-062** (advance leave in LINE) — ⛔ **do not spec yet**: the picker filters `CONFIRMED` and course sessions
   are born `PENDING`, so widening the date range alone would ship and do nothing. Owner owes Q4 — *when do staff
   press `ยืนยัน + แจ้งเตือน Line`?*
6. **REQ-049 AC-1** — owner registers an admin via the bot (`สมัคร` → 3 → `229`) so a leave notification has a
   recipient. ⚠️ A link request is sitting *"รอการอนุมัติ"* — confirm whether that is the admin one.
7. **REQ-060 Part B.2** (forgiving readers) — SPECced, **not cut**. LOW, FE+BE, needs Fern. Porter to schedule.
8. **REQ-035** (sell-side stock + revenue) — owner's instruction: **last**.

## Deferred tests (grouped into wave-2 acceptance, named not dropped)
REQ-053 AC-2 (crafted `PATCH` refusal — needs a real course) · REQ-054 AC-6 (reports read a course as one program) ·
REQ-049 AC-1 (admin actually notified) · the LINE flows on `uat` itself.

## Open questions owed by the owner
- **REQ-062 Q4 — when do staff press `ยืนยัน + แจ้งเตือน Line`?** (at course creation / the day before / on the
  day). It decides the whole design, because that button also **messages the parent**. **This blocks REQ-062.**
- **11 students need phone numbers** from the customer (listed in `log/2026-08-22.md`), + 2 sheet cells to fix.
- **`ชวินท์`'s ฿9,790 sale** — record it retroactively, or leave it?
- ~~**REQ-061:** does the customer sell a plain 1-hour session on the bike/skate programs?~~ — **ANSWERED and
  BUILT.** Yes: **REQ-066** put a 1-hour price (฿1,390) on every program including `bike-skate`, delivered to both
  boxes 08-23. Closing it here so it stops reading as owner-blocked.
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
