# TASK-067: scheduling (BE) — an 8th attention check: "sales sold but not posted"
- Source: SPEC-018 (REQ-023) — raised by Sober after TASK-064's finding
- Status: DONE  (reviewed 2026-08-01 by Sober — 8 registry entries, digest/job/panel/endpoint untouched (verified); extensibility qualification accepted and SPEC-018 amended; the unasked titleKey/i18n guard closes my TASK-053 gap permanently; tsc 0 / 280 tests)
- Depends on: TASK-066
- Assignee: @Jason (smart-scheduler-back, port 4006)

## Why
Sales stopped being recorded on 2026-07-28 and **nobody noticed for days**, because the write was best-effort
and its failure had no voice. TASK-066 repairs the pipe and makes the failure log loudly — but a log line is
only read by someone already looking.

**This is the third time this week the same failure mode has cost us:** two scheduled jobs that were never
registered, a daily digest that would have died silently (which is why its panel shows "never run"), and now
revenue quietly not posting. The pattern isn't bad luck — **anything that can stop without saying so
eventually will.** So the detector belongs where someone already looks every morning.

**And it proves the claim SPEC-018 made:** adding a check is supposed to be *one entry in the registry array*.
This is the first real chance to demonstrate that, on a check nobody imagined when the registry was written.

## What to do
Add **one entry** to `ATTENTION_CHECKS` in `lib/attention.ts` — nothing else changes. No new plumbing, no new
endpoint; the digest, the panel and the job pick it up for free.

**`sales_not_posted`** — entitlements sold in the last N days (`NOT_POSTED_WINDOW_DAYS = 7`, in the existing
constant block) that have **no matching `bo.movement`** with `refType: "SALE"` and their `refId`.
- Cover **courses, vouchers and attended trial/single bookings** — the three things `recordSale` is called for.
- **Counts only in the digest** (no `namesPeopleInDigest`): this is an ops fault, not a person, and the names
  add nothing an admin can act on. The web panel shows which ones behind login.
- If the check itself can't run, the existing per-check `try/catch` degrades it — no special handling.

If a fully-repaired pipeline makes this permanently zero, good: **that is what a healthy detector looks like**,
and it costs one array entry.

## Definition of Done
- [ ] Exactly **one** new entry in `ATTENTION_CHECKS`; **no change to the digest, the job, the panel or the
      endpoint** — if you find yourself editing those, stop and tell me, because SPEC-018's extensibility claim
      was wrong and I'd rather know.
- [ ] A course/voucher/trial sold inside the window with no SALE movement is counted; one **with** a movement is
      not; a sale **outside** the window is not.
- [ ] Counts only in the LINE digest; details visible in the web panel.
- [ ] `bunx tsc --noEmit` clean; `bun test` green — a pure predicate test alongside the other seven.

## Implementation Notes

### 📋 Your extensibility question, answered honestly: **the claim holds, with one precise qualification**
You asked me to report rather than work around, so here is the exact accounting.

**Untouched, as specified — and this is the load-bearing part of the claim:** the digest renderer
(`buildDigestMessage`), the decision rule (`decideDigest`), the job (`runDailyDigestJob`), the runner
(`runAttentionChecks`), the panel producer (`getAttention`) and the endpoint. **None of them knows this check
exists.** It appears in the LINE message, the web panel and the `job_runs` summary for free, exactly as SPEC-018
promised. The privacy layer picked it up for free too — it's not in `namesPeopleInDigest`, so the outbox row is
enqueued with `items: []` without my doing anything.

**The qualification:** *"adding a check = one array entry"* is true for a check over a data source the registry
**already has**. This one needed a source nobody had loaded before (`bo.movement` SALE refIds), so it also needed
**one `AttentionCtx.load` field + one loader in `buildCtx`** — because the registry is deliberately kept free of
query plumbing, which is the right design and I didn't want to break it by importing `db` into `lib/attention.ts`.
Plus **one i18n pair**, which any new check needs.

So the accurate claim is: **one array entry, plus one loader if the check needs data nobody has loaded yet.**
That's still a very good extensibility story — nothing structural moved — but "one entry, full stop" would
over-promise to whoever adds the ninth. Worth a one-line amendment to SPEC-018 rather than a redesign.

### What I built
- **`NOT_POSTED_WINDOW_DAYS = 7`** in the existing threshold block, and `salesWindowStart` on the ctx —
  following the `EXPIRING_WITHIN_DAYS` → `expiryCutoff` pattern already there, so the window is computed once
  in the service and both the loader and the check read the same value. No second copy of "7 days".
- **`isSaleUnposted(sale, postedRefIds)`** — a pure set-membership predicate. Deliberately *absence* of a
  movement, not any status field: `recordSale` writes the entitlement's own id as `ref_id`, so a missing row is
  the entire signal. Nothing new to keep in sync, and it can't disagree with what TASK-066 writes.
- **One registry entry, `sales_not_posted`**, counts-only (no `namesPeopleInDigest`) — an unposted sale is an
  ops fault, not a person, and a name adds nothing an admin can act on.
- **The loader** covers exactly the three things `recordSale` is called for: course sales, voucher sales, and
  **ATTENDED** `FIRST_TRIAL`/`SINGLE_SESSION` bookings (revenue recognised at day-end, so an unattended trial is
  correctly not expected to have posted yet). Memoised like the others.

### ⚠️ One deliberate imprecision, stated rather than hidden
The window compares a Bangkok **date** against `created_at` (a `timestamptz`), so at the boundary it can reach
back up to 7h further than 7×24h. **That is the safe direction and it's on purpose:** a detector that
over-includes shows something a few hours early; one that under-includes hides the very fault it exists to find.
This is not TASK-062's bug wearing a new hat — nothing here is bucketed by month and no money is attributed;
the output is a count of "look at these". If you'd rather it were exact I'll shift it, but I'd be trading a
harmless false-positive edge for a possible silent miss, which seems like the wrong trade for a detector.

### A note on what this will report on day one
Until TASK-066 is deployed **and** `sale:ensure-items` has run, this check will legitimately light up with every
course and voucher sold in the last 7 days — because per TASK-066's finding, none of them ever posted. **That's
correct behaviour, not a bug in the check**, but it's worth knowing before someone reads the first digest as an
alarm. Once the pipe is repaired it should settle to zero and stay there.

### Verification
- `bunx tsc --noEmit` → **clean (exit 0)**; `bun test` → **280 pass / 0 fail** (43 files, was 275 — **+5**).
- New pure tests alongside the other seven: an unposted sale **is** counted · one that reached the books is not ·
  **nothing posted at all → every sale flagged** (the exact state that went unnoticed for days) · a healthy
  pipeline reports **zero** ("that is what a working detector looks like", per the task).
- Updated the registry test 7 → 8. **I also added a guard I'd want regardless:** every check's `titleKey` must be
  `att_<key>` **and** must resolve in **both** TH and EN — `t()` returns the key itself when it's missing, so a
  future check could otherwise ship with a raw `att_foo` showing in the digest. That's the `titleKey` gap you
  owned on TASK-053, turned into something that fails a test instead of reaching a screen.
- ⚠️ The loader's queries are **deploy smoke** (brownfield). **Smoke:** with TASK-066 deployed, sell a course →
  `GET /api/attention` shows `sales_not_posted: 0`; temporarily point a sale at a missing item (or check before
  running `sale:ensure-items`) → the count rises and the panel lists which ones.

**DoD:** exactly one new `ATTENTION_CHECKS` entry, with the digest/job/panel/endpoint untouched ✓ (plus one
loader + one i18n pair — reported above, not worked around) · sold-in-window with no SALE movement counted, one
with a movement not counted, one outside the window not loaded ✓ · counts-only in LINE, details in the panel ✓ ·
tsc clean + `bun test` green with a pure predicate test beside the other seven ✓.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- If adding this turns out to need more than one registry entry, **that is a finding about SPEC-018, not a
  problem with this task** — report it rather than working around it.

## Review
**Verdict: DONE ✅ (Sober, 2026-08-01).** `bunx tsc --noEmit` → **0**; `bun test` → **280 pass / 0 fail**
(my own run). Registry is 8 entries; the digest renderer, `decideDigest`, the job, the runner, `getAttention`
and the endpoint are all untouched — I checked, not assumed.

### Your extensibility answer is exactly what I asked for, and I've amended SPEC-018 rather than argued
**"One array entry, plus one loader if the check needs data nobody has loaded yet."** That's the honest claim
and it's now written into SPEC-018, credited to this task. You could have quietly added the loader and reported
"one entry, as promised" — the accounting you gave instead is worth more than the check itself, because the
next person reads the spec, not this task.

And your reasoning for *why* the loader was needed is the right call, not a concession: keeping `lib/attention.ts`
free of query plumbing is what makes the predicates pure and testable. **Importing `db` into it to preserve a
slogan would have been the wrong trade.** The load-bearing half of the claim held completely — nothing
structural moved, and the privacy layer picked the check up for free (`items: []`, no `namesPeopleInDigest`)
without you touching it.

### The design choices I'd have wanted and didn't have to ask for
- **Absence of a movement is the whole signal** — no status field, nothing new to keep in sync, and it cannot
  disagree with what TASK-066 writes because it reads the same `ref_id`. A "posted" flag would have been a
  second source of truth about the same fact.
- **Only ATTENDED trial/single count**, because day-end is when that revenue is recognised — an unattended
  trial correctly isn't expected to have posted yet. That's the kind of thing a coarser check gets wrong and
  then cries wolf about every morning until someone mutes it.
- **`NOT_POSTED_WINDOW_DAYS` in the existing threshold block**, following the `EXPIRING_WITHIN_DAYS` →
  `expiryCutoff` pattern, so the window exists once and the loader and the check read the same value.

### The 7-day window imprecision — **accepted, and your reasoning is better than exactness would be**
You're right that this isn't TASK-062's bug in a new hat: nothing is bucketed by month, no money is attributed,
and the output is a count of "look at these". **A detector that over-includes shows something a few hours early;
one that under-includes hides the fault it exists to find.** Leave it. Stating the imprecision instead of
quietly living with it is what makes it a decision rather than a bug.

### The guard you added unasked is the best thing here
Asserting that every check's `titleKey` is `att_<key>` **and resolves in both TH and EN** — because `t()`
returns the key itself when it's missing — turns **the exact gap I owned on TASK-053** into something that
fails a test instead of reaching a screen. I fixed that gap once by hand; you made it unrepeatable. That's the
difference between correcting a mistake and closing it.

### Your day-one note is going to Porter
Until TASK-066 is deployed **and** `sale:ensure-items` has run, this check will legitimately light up with every
course and voucher sold in the last 7 days — because none of them ever posted. **Correct behaviour, alarming
first impression.** Flagged on the board so the first digest isn't read as a new emergency.

**TASK-067 → DONE. @Jason: TASK-064 resumes** — `bo.item.external_ref` now exists, so build the attribution map
keyed on it. TASK-050 after that.

## Moved from board.md (2026-08-29 housekeeping)

The board row below is reproduced verbatim as it stood before the 2026-08-29 compaction.
Full pre-compaction board: `archive/board-2026-08-29-pre-compaction.md`.

```
| TASK-067 | scheduling (BE): 8th attention check **`sales_not_posted`** — sold-but-unposted entitlements surface in the daily digest | SPEC-018 | ✅ **DONE** (Sober 2026-08-01 — 8 entries, **digest/job/panel/endpoint untouched** as promised; he reported the honest qualification instead of quietly absorbing it (**"one entry + one loader when the check needs an unloaded source"** — SPEC-018 amended, credited); absence-of-movement is the whole signal so it can't disagree with TASK-066; **+ an unasked guard that every `titleKey` resolves in TH *and* EN — turning the gap I owned on TASK-053 into a failing test**; tsc 0 / **280 tests**) ⚠️ **Day one it will legitimately light up** with every course/voucher sold in the last 7 days — none ever posted. Correct, not an emergency | Jason | TASK-066 |
```
