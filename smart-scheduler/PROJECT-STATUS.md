# smart-scheduler — PROJECT STATUS (resume-here / cross-machine memory)

> **Source of truth for resuming on any machine.** git-synced, so it travels; local `.claude/memory/` does not.
> Resume: `git pull` → `ai-worker/PROTOCOL.md` + your role file → this + `ai-worker/board.md` → **the newest
> `ai-worker/log/*.md`** → act on your role's ball.
>
> **Last updated: 2026-08-29** by Porter (PM), written as a **machine-move handoff**.

---

## 🖥️ MOVING MACHINES — read this first, it is the part that does not travel in git

| what | where | travels? |
|---|---|---|
| code (4 repos) | `H:\scheduler\` — `smart-scheduler-back` · `-front` · `-backoffice-back` · `-backoffice-front` | ✅ git |
| workspace / logs / board | `H:\ai-agent-workplace\ai-agent-workspace\smart-scheduler\` | ✅ git |
| **`.env` in each repo** | repo root | 🔴 **NO — not in git. Copy by hand or nothing connects.** |
| **which box `.env` points at** | decides whether you are on `sid` or `uat` | 🔴 **NO** |
| Tanya's access file | `sm-test-access.txt` | 🔴 **NO** |
| server job scripts | `C:\sm-jobs\*.ps1` **on each server** (not the dev box) | 🔴 lives on the servers |
| local `.claude/memory/` | the old machine | 🔴 **NO — this file is the replacement** |

**Branch: `develop` is canonical in every repo.** `dong` / `dong3` are dead.
🔴 **`smart-scheduler-front` is SHARED with another team.** Check what exists on `develop` before building FE, or
you rebuild what they already did — that cost a full revert on 2026-08-28.

**First command on the new machine:** `bun run db:verify` in `smart-scheduler-back`. Not green ⇒ either the wrong
box or the ledger needs `db:seed-ledger`.

---

## 🚦 Environments (the owner's names — "prod" is not a word we use)

| | **`sid`** — the team builds & verifies here | **`uat`** — the customer's system |
|---|---|---|
| frontoffice | som.develyst.online | frontoffice.develyst.online |
| backoffice | backoffice-som.develyst.online | backoffice.develyst.online |
| server | 154.197.124.206 | 154.197.124.29 |
| who touches it | team verifies (owner deploys) | **owner only — never QA, not even a GET** |

🔴 **Both boxes report identical `db:verify` numbers.** They cannot be told apart from that output.
**Use `SELECT count(*) FROM course_packages` — `sid` ≈ 20, `uat` ≈ 201.** This cost two rounds of confusion.

## 🚦 The UAT gate (owner's rule, 2026-08-19)

**Nothing reaches `uat` without BOTH Porter and Tanya green-lighting it.** Tanya answers *"does it work?"* from a
run on the deployed `sid` build; Porter answers *"is it the right thing, is now the right moment, is the customer
impact understood?"*
**Not a green light:** code-complete · SA-reviewed · tests pass · "worked locally".
A green light is a **written block** naming the build, what was tested, **what was NOT**, migrations, rollback,
customer impact, and both names.

## 🚦 DEPLOY ORDER — two of this project's outages came from getting this wrong

1. **`db:migrate` → `db:verify` GREEN. Blocking.** `db:migrate` can print *"migrations applied successfully"* and
   exit 0 having applied **nothing** — that took the customer's calendar down on 2026-08-24.
2. If verify is red: **`db:seed-ledger`** (dry-run) → read it → `--apply` → `db:migrate` → verify.
   **Needed on 4 of the last 6 migrations.** Safe: it derives from that box's own schema.
3. **Restart BE → then FE.**
4. **Confirm from the SCREEN, not from the deploy command.** A stale FE bundle passed for a fresh one on 2026-08-28.

---

## Where we are — 2026-08-29

**The customer runs their business on `uat`.** ~201 courses · 180 parents · 20 teachers.
**Saturday and Sunday are their business; Mon–Fri are nearly empty.**

### ✅ Delivered and live on `uat` (the 2026-08-28/29 batch)

- **FIX-007** — course expiry is **computed**, not typed: `start + MAX_WEEK[size]` weeks, where
  **`MAX_WEEK = size + leaveQuota`** (4→5 · 6→8 · 10→13). Off-by-one fixed (week 1 **is** the start date).
  Native courses repaired; **`source = IMPORT` deliberately NOT rewritten** — owner:
  *"ลูกค้าเขาคิดบางอย่างมาดีแล้ว"*. That protected **164 real courses**.
- **REQ-070 — `NO_SHOW` no longer exists.** Day-end marks an unmarked `CONFIRMED` session **`ATTENDED`**.
  Owner's reasoning: the quota is cut either way, so the label was only a false claim about a child. Good vs
  ordinary customers are separated by **CRM points earned at check-in**, not by the status.
- **REQ-071 Drop / Pause** — a 5th status, resume with a new expiry, and **`SLOT_TAKEN` refuses rather than
  double-books**.
- **REQ-072 Confirm-whole-course** — bulk `PENDING→CONFIRMED` · LINE carrying the **leave DATES** · **the parent
  is notified too** · **`sm-daily-reminder` at 08:15** (one message **per person**, idempotent per day, writes a
  `job_runs` row).
- **REQ-073** confirm popups at 5 sites (`มาเรียน` is the light one — click→Enter, no reason field) ·
  **REQ-074** cancel a 1HR/Voucher using **REQ-036's shared reason enum** · **REQ-075** `Mon/Tue/Wed` + "Course".
- **The `เรียนอยู่แล้ว (ย้ายข้อมูล)` dialog** — sizes 4/6/10 plus an explicit **off-card {size, quota}**; a
  rejected size explains itself in Thai instead of a 500; expiry computed but still editable; closes on save.
- **REQ-007** — a note on every booking type **and** it reaches the teacher on both a single-booking confirm and a
  whole-course confirm.
- Earlier: REQ-036 cancel-course · REQ-052/068 calendar cell + note + display toggle · REQ-063 discount ·
  REQ-066 ฿1,390 for every program · REQ-069 Mon→Sun week · scheduled tasks on both boxes.

### ⏸️ Open — every one is PARKED BY THE OWNER, not forgotten

- **REQ-005 "other" booking type.** **Answered:** flexible per instance — charged **or not**, consumes an
  entitlement **or not**, **with or without a student**; day-end auto-attends it like everything else.
  🔴 **Unanswered, and NOT to be invented: (a) if charged, what price — a typed amount or a catalogue item;
  (b) what names the calendar cell and the teacher's LINE line when there is no student** (Porter's lean: a short
  required title such as *"ประชุมทีม"*).
- **The six `REQ-BO` backoffice items** — link programs · dashboard · freelance ceiling · teacher salary · course
  deduction from the frontoffice · cancel 1HR/Voucher from the back office. **Untouched, unplanned, the largest
  thing left on the owner's list.**
- **LINE reach: 2 of 20 teachers, 0 of 180 parents.** ⇒ the parent half of REQ-072 reaches nobody.
  **Owner parked both** (*"ยังไม่ผูกช่างมันไปเถอะ"*). **Do not run a campaign at 180 families.**
- **`ชวินท์`'s ฿9,790 sale** never posted — decide or leave.
- **REQ-062** (advance leave in LINE) — probably unblocked now that Confirm exists, but the **owner still owes Q4**
  (*when do staff press `ยืนยัน + แจ้งเตือน Line`?*).
- **REQ-004 rental** — the owner's own status is *In Progress (Testing)*; the team has not touched it.
- Low priority: TASK-218 per-recipient reminder idempotency · **the internal secret sits in plaintext in
  `sm-jobs/*.ps1`, committed to git** · bulkConfirm multi-select fan-out · **REQ-057 cleanup tool is built but has
  never been run on `uat`** (the `Test` / `SOM Team` household is still there).

### 🔴 Known-unverified — recorded as such, never as passed

- **`notification_outbox` == 1 row on a LINE-LINKED recipient** — proven only on the *skip* path.
  **If a family ever reports repeated messages on a confirm, look here first.**
- **`PROGRAM_CHANGED` / `CUSTOMER_CANCELLED` end-reasons** were never individually round-tripped (identical
  server-validated path to `ADMIN_ERROR`). **First place to look if a stored reason is ever wrong.**
- **A scheduled 08:15 run has never been watched actually delivering** — our own tests consumed the day each time.
- ⚠️ **The reminder guard eats the day: a manual trigger before 08:15 silently cancels that day's reminders for
  real families.** **Do not trigger it manually on `uat` in the morning.**

---

## The rules this project keeps re-learning

1. **Check the OUTCOME, not the mechanism.** *"It computes"* (the number was wrong) · *"the key exists"* (missing
   from the dictionary) · *"a source-aware branch exists"* (it still rewrote every import) · *"the value survives
   the schema"* (the row never landed). **Every one of those passed a review and failed on first contact with
   reality — and the owner caught most of them by looking at the actual value on the actual screen.**
2. **Data being right and the screen showing it are different facts.**
3. **A value a human typed is a hypothesis about their business, not an error in our data.** The owner has stopped
   the team rewriting customer data twice; the second time it was **164 courses**.
4. **Migration before code. Always.**
5. **Two numbering systems and two vocabularies.** The owner keeps his own list (REQ-001…012, FIX-001…007); the
   board runs REQ-001…075. **Quote his numbers to him; use board numbers in tasks.** And **name things by the
   label on the screen** — he could not recognise his own request after Porter renamed it.

## Team & workflow

PM=Porter · SA=Sober · BE=Jason · FE=Fern · QA=Tanya.

🔴 **Chain: Human → Porter → Sober → (Jason/Fern). QA hangs off Porter.**
**Porter does NOT hand work straight to Jason or Fern** — that removes the lead who decides order, and it left him
running a stale queue.

**Orders live in TODAY's dated log** (`ai-worker/log/YYYY-MM-DD.md`), never a previous day's file. Porter appended
to a three-day-old file once and Sober parked live work because he could not find the current priority.
**Keep order entries SHORT** — a two-line instruction buried in forty lines of reasoning does not get read.

**Tanya MAY write on `sid`** (board 154-159, answered by คุณฟีน 2026-08-04): remove what she creates, declare the
footprint in the TEST file, never touch data she did not create, never restart or redeploy. **`uat` is never
hers.** A QA fixture is retired with **cancel + `ADMIN_ERROR`** — there is still no course-delete anywhere.
