# TASK-218: Daily reminder — a manual pre-08:15 trigger eats the scheduled day (SA guard decision) (scheduler-back)

- Source: Porter's open-item flag (2026-08-29) — *"a manual pre-08:15 trigger silently eats the day"*. 🟢 LOW /
  non-blocking (the batch is LIVE). On `develop`.
- Status: ✅ DONE (Sober 2026-09-01)
- Repo: **scheduler-back**.

## The gap (my decision, since Porter flagged it as mine)
`runDailyReminderJob` guards on `reminderAlreadySent(runDate)` = "is there a `job_runs` row with `attempted === true`
for today?" (TASK-209). That guard was right for its problem (a zero-reach re-run must not fire all morning) but creates
a new one: **a manual trigger before 08:15 sets `attempted:true`, so the real 08:15 scheduled run then skips — the day's
reminder is silently eaten.** A QA/ops test-trigger suppresses the morning send.

## The decision — idempotency belongs at the RECIPIENT, not the JOB
Neither `sent` nor `attempted` at the **job** level is right (one re-runs on zero reach, the other eats the day). Move
the idempotency to **per-(recipient, day)**, mirroring the day-end job's `rev:<bookingId>` pattern:
- Each person gets **at most one reminder per day**, keyed on the outbox (e.g. `reminder:<recipientType>:<personId>:<day>`).
- The job can then run **any number of times** that day: each run sends only to people **not already reminded today**.
  A manual pre-08:15 trigger reminds whoever is due; the 08:15 run reminds the rest — **no eaten day, no double-send.**
- Keep the `job_runs` row (the `attempted`/`sent`/reach observability from TASK-209) — it stays for "did it fire", but
  it is **no longer the thing that suppresses a send**; the per-recipient key is.

## DoD — the OUTCOME
- [ ] A manual trigger at 07:00 then the 08:15 run: **every due person gets exactly one reminder** (the 07:00 ones +
      the rest), none twice, none missed. Assert: a person reminded at 07:00 is skipped at 08:15; a person not yet
      reminded is sent at 08:15.
- [ ] Two runs with no gap still send each person once (double-run safe).
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` 0 · `bun test` green.

## Notes
(Jason fills in. This supersedes the job-level `reminderAlreadySent` guard for *suppression*; keep it only if it still
earns its place for observability. The daily-digest job is one-message-to-admins so its job-level guard is fine — the
reminder differs because it is per-person.)

---

## Implementation Notes (Jason, 2026-08-30)

**Repo:** `smart-scheduler-back`, branch `dong` — which is byte-identical to `develop` here
(`git rev-list --left-right --count develop...dong` → `0 0`), so this is on the canonical branch per the
standing rule.

### 🔴 There IS a migration — `0028`. The board's migration line must be re-counted before the next deploy.
Files 29 · journal tags 29 · no orphan either way (checked at the moment of writing, per the board's
"'no migration' is a CLAIM, not a state" rule).

### What changed (7 files + 2 new)

| File | Change |
|---|---|
| `drizzle/0028_outbox_idempotency.sql` **(new)** | `notification_outbox.idempotency_key` (nullable) + **UNIQUE** index `notification_outbox_idempotency_uq` |
| `drizzle/meta/_journal.json` | idx 28 registered (hand-authored per `drizzle/README.md` — no `db:generate`) |
| `src/db/schema.ts` | the column + `uniqueIndex(...)`; table gains its 3rd `pgTable` arg |
| `src/lib/migration-witness.ts` | witness for `0028` — probe = the index (the LAST object it creates) |
| `src/lib/daily-reminder.ts` | **new pure** `reminderKey()` + `dueReminders()` |
| `src/lib/line.ts` | `enqueueLine` takes an optional `idempotencyKey`; new result status `duplicate` |
| `src/services/jobs.service.ts` | the job-level suppression is **gone**; per-recipient gate; `reminderAlreadySent` → `reminderRanToday` (observability only) |
| `src/lib/daily-reminder.test.ts` | +6 behavioural tests (the DoD's 07:00→08:15 scenario, purely) |
| `src/db/outbox-idempotency.test.ts` **(new)** | migration↔schema pairing + the two properties the design rests on |
| `src/services/day-end-auto-attend.test.ts` | the 6 TASK-208/209 source assertions this task supersedes, rewritten |

### The shape

`runDailyReminderJob` no longer returns early. Every run: reads the day → groups per person → reads which of
today's keys already exist in the outbox (**one** `inArray` query) → sends to the remainder → writes its
`job_runs` row. Key = `reminder:<recipientType>:<personId>:<business-date>`.

**Two decisions worth your review, both deliberate:**

1. 🔴 **A SKIPPED row never stores the key.** An unlinked person was *not reminded* — they were *unreachable*.
   If the SKIPPED row claimed the key, a parent who is unlinked at the 07:00 trigger and links LINE by 08:15
   would be permanently skipped for that day: the same silent miss this task removes, one layer over. The cost
   is a duplicate SKIPPED row per extra run — outbox noise, no message. I took noise over a silent miss.
2. **The up-front read is only the fast path; the UNIQUE INDEX is the guarantee.** Read-then-write is a race
   when both boxes fire at 08:15. `enqueueLine` catches `23505` and reports `duplicate` — and *only* when a key
   was passed, so a genuine constraint failure on an unkeyed insert still throws. ⚠️ Documented on the option:
   a keyed send must stay **outside** a transaction (swallowing 23505 inside one leaves it aborted). Every
   `exec: tx` caller passes no key; the reminder is the only keyed caller and uses the default connection.

`reminderAlreadySent` → **`reminderRanToday`**, kept for the one question it answers ("was 08:15 the first
firing today, or did something beat it?") and recorded as `priorRunToday`. It is never read in an `if`, and a
test asserts that (`not.toMatch(/if \(\s*(await )?reminderRanToday/)` + exactly one `return` in the body).

`summary` / return value now: `{ attempted, sent, skipped, alreadyReminded, priorRunToday, ...reach }`.
`alreadyReminded` is kept **separate** from `skipped` on purpose — "already had it" and "cannot be reached" are
the two answers an operator is choosing between when a morning looks short.

⚠️ **The re-run return shape changed.** It used to be `{ date, skipped: "already-sent", sent: 0 }`; there is no
such branch now. Only `routes/internal.ts:55` consumes it (it just JSON-encodes the result), so nothing breaks
— flagging it because it is a contract change, not a private one.

### Verified
```
bunx --package typescript@5.6.3 tsc --noEmit     → exit 0
bun test                                          → 956 pass / 0 fail (+12), 92 files
drizzle *.sql = 29, journal tags = 29, no orphans either way
```
DoD box 3 is met. **Boxes 1 and 2 are behavioural and are NOT met by me** — the pure decider (`dueReminders`)
is tested to exactly those two scenarios, but "a manual trigger at 07:00 then the 08:15 run, on a live box"
needs `0028` applied and a real recipient. That is `sid` + Tanya, after the deploy.

## Questions

- **@Sober — a pre-existing finding, out of this TASK's scope, reported not fixed.** `bun test` in this repo
  **attempts a connection to the live `sid` database.** `src/routes/eligible.route.test.ts:13` sets
  `process.env.DATABASE_URL ??= "…localhost…"` and comments *"lazy — never connected here"* — but Bun has
  already auto-loaded `.env`, so `??=` never fires and the "control" case (`GET /students?…`, line 29) issues a
  real query. On my machine it was **refused at authentication** — `PostgresError: no pg_hba.conf entry for
  host "49.237.17.39" … code 28000` — so nothing was read and no data reached me. **On a whitelisted machine
  the same `bun test` would read real rows.** This is the `env -u DATABASE_URL` trap already in `PROTOCOL.md`,
  wearing a different hat, and it is in the command every one of our DoDs tells an engineer to run. I did not
  touch it — it is not in TASK-218's scope and it is your call whether it becomes its own task. (Related: the
  board's ⚠️ 08-16 note that the owner's remote-DB whitelist line on `uat` must be closed.)

## Review — Sober, 2026-08-31: ⛔ **CANNOT VERIFY the code** · ✅ **the DESIGN passes**

**Two separate verdicts, kept separate on purpose.**

### 1. The code is not in the repo — same finding as TASK-221 and TASK-223
`H:\scheduler\smart-scheduler-back` (the path `machine.local.md` names) has **28 `drizzle/*.sql`, 28 journal tags,
newest `0027_course_size_sanity`**. There is **no `0028`**, no `daily-reminder.ts`, no
`outbox-idempotency.test.ts`; working tree clean, HEAD `7217599` on `develop`≡`dong`, and no branch carries them.
Full evidence and the three questions for you are in **TASK-221 §Review** — one cause, three tasks; answer it once,
there.

### 2. The design — ✅ **PASS, and both of your judgement calls are right**

> **1. A SKIPPED row never stores the key.** ✅ Correct, and for the reason you gave: unreachable ≠ reminded. A
> parent who links LINE between 07:00 and 08:15 must get the 08:15 message. You traded **outbox noise** for **not
> silently missing a person** — that is the same trade this whole task exists to make, applied one layer down.
> Consistent, not merely defensible.

> **2. Read-then-write as the fast path, the UNIQUE INDEX as the guarantee.** ✅ This is the right shape and it
> mirrors `recordSale` (`sale-post.ts:84` reads first, `bo_movement_idempotency_uq` catches the concurrent case) —
> **one pattern for idempotency in this codebase, not two.** Catching `23505` **only when a key was passed** is the
> detail that makes it safe: an unkeyed insert still throws.
> 🔴 **The transaction caveat is the load-bearing part of this task and it must not be lost.** Swallowing `23505`
> inside a transaction leaves it aborted, so a keyed send must stay outside one. You documented it on the option;
> when this re-lands, make sure that comment sits on `enqueueLine`'s signature where the next caller reads it, not
> only in a task file. A future `exec: tx` caller passing a key is the one way this design breaks.

> **Keeping `job_runs` for observability but not for suppression** — ✅ exactly the split I asked for, and the
> rename `reminderAlreadySent` → `reminderRanToday` earns its place: the old name asserted a fact the function no
> longer establishes.

**Nothing to change. When it re-lands, this is a PASS on sight** — subject only to the DoD's own outcome check
(a 07:00 trigger then the 08:15 run: everyone due gets exactly one).

📌 **Standing risk you raised, promoted out of this task:** `bun test` reaches the live `sid` DB through
`eligible.route.test.ts:13` because Bun loads `.env` before the `??=`. Refused at authentication here (`28000`), but
**on a whitelisted machine the same command reads real rows** — and it is the command every DoD in this project
tells an engineer to run. Not yours to fix inside 218; I am routing it to @Porter as its own item.

---

## Rebuild — 2026-08-31 (Jason)

🔴 **This code was built on 2026-08-30, then destroyed before review.** A branch sweep in `smart-scheduler-back`
(`dong → develop → production → dong`) at **2026-08-30 04:26:26** restored every tracked file and removed the new
ones. Evidence and the full root cause are in **TASK-221 §Review**. Agents never commit (`CLAUDE.md` rule 6), so
BE output lives only as an uncommitted working tree — **which is not storage.**

**Rebuilt in full from the Implementation Notes above**, which are the only reason this was recoverable.

🛟 **A recovery patch for all three tasks now exists:**
`ai-worker/archive/patch-TASK-218-221-223-scheduler-back.diff` (base `7217599`; `git apply` from the repo root).
Interim measure only — where finished agent work should live is a workspace decision for the human, raised via
@Sober in TASK-221 §Review.

**@Sober review point folded in:** the transaction caveat now lives on **`enqueueLine`'s own JSDoc** — above the
function and on the `idempotencyKey` option — not only in a task file. A test asserts it is there
(`outbox-idempotency.test.ts` → *"the transaction caveat lives on `enqueueLine` itself"*).

**Verified after rebuild:** tsc **0** · `bun test` **972 pass / 0 fail** · migrations 29 = journal 29.

### ✅ RE-REVIEW — Sober, 2026-09-01: **the code is here. DONE.**

It landed with TASK-224 (Jason gave the repo facts: `H:\scheduler\smart-scheduler-back`, HEAD `7217599`, 23 working-
tree entries, plus a patch kept outside the repo). **Verified rather than assumed:** `drizzle/0028_outbox_idempotency.sql`
exists, journal idx 28 registered, `src/lib/daily-reminder.ts` present; `tsc --noEmit` **0**; `daily-reminder.test.ts` +
the other five task-owned files → **91 pass / 0 fail**.

The design verdict above is unchanged and stands — **PASS**. Nothing was re-litigated.

⚠️ Carried, not closed: the transaction caveat on `enqueueLine` (a future `exec: tx` caller passing a key), and the
`bun test` → live-`sid` connection, which is now with @Porter as its own item.
