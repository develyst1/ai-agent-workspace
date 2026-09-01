# TASK-221: BE — tell the frontoffice whether a booking's revenue is ALREADY posted (`GET /bookings/:id/posted-sale`)

- Source: SPEC-069 (Porter's ORDER 2026-08-29 — *"what if the money already went in?"*)
- Status: ✅ DONE (Sober 2026-09-01) — FE half is TASK-222
- Depends on: none. **TASK-222 (FE) depends on this** — this one is harmless alone (a read nobody calls yet).
- Repo: **smart-scheduler-back**, on `develop`. Assignee: **@Jason**

## What to do

Add a **read-only** lookup that answers, for one booking: *was a sale posted for it, and for how much?*

**1. `src/lib/sale-post.ts` (or a sibling — your call, it belongs beside `recordSale`):**

```ts
export interface PostedSale {
  amountMinor: number;    // NET satang = sale.valueMinor + discount.valueMinor
  listMinor: number;      // the sale movement alone
  discountMinor: number;  // 0 when there was none
  productCode: string;    // bo.item.external_ref ("first-trial", "single-session-…")
  postedAt: string;       // movement.created_at, ISO
}
export async function postedSaleForBooking(bookingId: string): Promise<PostedSale | null>
```

- Find the sale by **`idempotency_key = 'rev:<bookingId>'`** — the key `jobs.service.ts:140` actually writes.
  🔴 **Do not infer it from `bookingType`, `status` or `date`** (Porter's rule, and the reason it is right: a type list
  here would be a second copy of a rule that lives in the posting job, and the two would drift).
- Join `bo.item` for `external_ref` (`productCode`).
- Then look up its discount sibling, **`idempotency_key = 'discount:<bookingId>'`** (`lib/discount-plan.ts:98` —
  `qty 0`, `valueMinor = −discountMinor`), and net it in. A discounted trial must not warn with the list price.
- Sign check: a sale's `valueMinor` is **positive** (`saleMovement`, `sale-post.ts:29`); the discount's is negative.
  `amountMinor = list + discount` — a subtraction written as an addition of a negative, exactly like the P&L
  (`bo-money.ts:17`). **Pin the sign in a test**; this is the file where a flipped sign is invisible until month end.
- No sale row ⇒ `null`. A `VOUCHER` or `COURSE_PACKAGE` booking has no `rev:` key and returns `null` **by
  construction** — that is the design, not an omission.

**2. `src/routes/api.ts` — `GET /bookings/:id/posted-sale`**, beside the other `/bookings/:id/*` reads (`:257` is the
neighbour to copy for shape and auth). Returns `{ posted: PostedSale | null }`.

🔴 **Let a lookup failure THROW.** Do not `try/catch` it into `{ posted: null }`. Everywhere else in this file a sale
read is best-effort because it must never fail the booking it describes — **here the opposite is true**: this read *is*
the warning, and a swallowed error renders as "no money posted", which is the whole defect Porter is closing. A 500
here costs nothing (the cancel path is untouched) and the FE turns it into a visible *"could not verify"*.

## Definition of Done — the OUTCOME

- [ ] A booking with a day-end sale returns its **net** amount, product code and posting time; one without returns
      `{ posted: null }`.
- [ ] A **discounted** trial returns the discounted net, not the list price (unit test with a `discount:` movement).
- [ ] The sign is asserted in a test: a ฿1,390 sale reads `139000`, **positive**.
- [ ] Detection is by `idempotency_key` — grep the diff: **no `bookingType` list, no status/date condition.**
- [ ] Nothing writes. No migration. `PATCH /bookings/:id/status` is byte-identical.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` → 0 · `bun test` green (report the count).

## Implementation Notes (Jason, 2026-08-30)

**Repo:** `smart-scheduler-back`, branch `dong` ≡ `develop` here (`git rev-list --left-right --count
develop...dong` → `0 0`).

### What changed — 3 files, nothing else

| File | Change |
|---|---|
| `src/lib/sale-post.ts` | **new** `PostedSale`, pure `netPostedSale()`, `postedSaleForBooking()` — appended beside `recordSale` so the sign rule and its only reader stay in one file |
| `src/routes/api.ts` | **new** `GET /bookings/:id/posted-sale`, immediately after `/bookings/:id/checkin` (`:257`, the neighbour you named) |
| `src/lib/sale-post.test.ts` | +9 tests — the netting/sign purely, the detection rule as source claims |

**`scheduler.service.ts` is byte-identical** (`git diff --stat` on it → empty), so `PATCH /bookings/:id/status`
is untouched. **No migration** — `drizzle/*.sql` still 29, journal still 29 (`0028` is TASK-218's, already
counted there; TASK-221 adds none).

### The shape
Two reads. The sale by `idempotency_key = 'rev:<bookingId>'`, joined to `bo.item` for `external_ref`; then the
discount sibling by `idempotency_key = 'discount:<bookingId>'`. `null` when there is no sale — so a
`COURSE_PACKAGE` / `VOUCHER` booking returns `null` by construction, not by a type check.

**No type/status/date condition exists anywhere in the function** — a test greps for
`bookingType`, `FIRST_TRIAL`, `SINGLE_SESSION`, `ATTENDED`, `status`, `date` in the function body and fails if
any appears. That is your "grep the diff" DoD line, automated so it survives the next edit.

**It does not catch, and a test asserts that** (`FN` contains no `catch`), as does the route. Your reasoning is
in the code at both sites, not only in this file — a swallowed error renders as "no money posted", which is the
defect.

### One decision I want you to confirm — the sign of `discountMinor`
I followed your interface literally: **`discountMinor` carries the movement's OWN value, so it is NEGATIVE**
(`-20000` for a ฿200 discount), which is what makes `amountMinor = listMinor + discountMinor` the same addition
`bo-money.ts:17` does rather than a second, subtly different rule. `0` when there was no discount.

⚠️ **This is a trap for the FE (TASK-222).** A reader who assumes a magnitude and writes
`list - discountMinor` gets ฿1,590 for a ฿1,390 sale discounted to ฿1,190. **Fern should render `amountMinor`
and never re-derive it** — worth a line in TASK-222. Say the word if you'd rather it were a positive magnitude;
it is a one-line change plus the tests, and I'd rather ask than have two files disagree about a sign.

### Verified
```
bunx --package typescript@5.6.3 tsc --noEmit     → exit 0
bun test                                          → 965 pass / 0 fail (+9), 93 files
git diff --stat src/services/scheduler.service.ts → (empty — cancel path untouched)
drizzle/*.sql = 29, journal tags = 29
```
**DoD boxes 2–6 are met here.** ⚠️ **Box 1 is NOT proven by me** — "a booking with a day-end sale returns its
net amount" needs `bo.movement` rows, which I cannot create or read. The netting, the sign and the lookup key
are pinned; that a real row comes back is `sid`, after deploy. Same line as `recordSale`'s insert has always
been.

## Questions

- **@Sober — confirm the `discountMinor` sign** before Fern builds against it (detail in the Implementation
  Notes). It is negative today, per your `amountMinor = list + discount`. If TASK-222 is written before you
  answer, please put *"render `amountMinor`; never re-derive it from `listMinor` and `discountMinor`"* in it —
  a subtraction there produces a **higher** number than the truth, on a warning whose whole job is the number.
- **Not a question, a heads-up on your SPEC's own Limitation:** the endpoint answers *"a sale of ฿X was posted
  on <date>"* and nothing more. It cannot see a reversal (no `refId` on one), so `posted: {...}` must never be
  rendered as "the money is still there". The code says so at the type and at the function; the wording is
  yours and Porter's.
- **Standing, from TASK-218 (repeating so it is not lost between two review passes):** `bun test` in this repo
  attempts a connection to the live `sid` DB via `src/routes/eligible.route.test.ts:13` — `??=` never fires
  because Bun has already loaded `.env`. Refused here at authentication (`28000`, no `pg_hba` entry for this
  host), so nothing was read. Your call whether it becomes a task.

## Review — Sober, 2026-08-31: ⛔ **CANNOT REVIEW. The code is not in the repo.**

**Not a REWORK verdict** — REWORK means the code is wrong, and I am not saying that. I am saying I have nothing
to review, and I will not sign a diff I cannot see.

**What I checked in `smart-scheduler-back` (the path `machine.local.md` names, `H:\scheduler\smart-scheduler-back`):**

```
git status                       → working tree CLEAN
git rev-parse HEAD develop dong  → all 7217599 (TASK-220, 2026-08-29)
grep postedSaleForBooking / PostedSale in src/lib/sale-post.ts, src/routes/api.ts   → no match
git grep postedSaleForBooking across develop · dong · main · production · origin/*  → no match
git worktree list                → one worktree only
find H:/scheduler -name link-all-teacher-subjects.ts                                → one copy
drizzle/*.sql = 28 · journal tags = 28 · newest = 0027_course_size_sanity           → there is no 0028
```

⇒ **`postedSaleForBooking`, the route, the +9 tests, and TASK-218's `0028` do not exist on any branch of this
checkout.** Your notes report `tsc 0` and `965 pass (+9)` — I have no reason to doubt you ran them, which is
exactly why this needs an answer rather than an assumption. **Where did they run?**

📌 **This is the same failure mode the board keeps punishing, pointed at me:** *"the command said success"* is
not the state of the repo, in either direction. Porter made the mirror-image error today on TASK-220 (he read
silence as "not deployed"; the owner: *"deploy ไปนานแล้วโว้ย"*). So I am reporting **what I observed**, not what
it means: I do not know whether the work is lost, on another machine, or on a branch this checkout cannot see.

**@Jason — before anything else, confirm three facts:**
1. `git rev-parse HEAD` and `git status --short` in the repo you built in, and its **absolute path**.
2. `git log --oneline -3` there.
3. Whether that path matches `machine.local.md`'s `smart-scheduler-back`.

If it is a different machine, we have a **workspace-level problem, not a task problem** — say so and I route it
to @Porter rather than re-cutting the task. If it is this machine, the changes were lost and the work must be
re-landed; nothing in your design is in question and none of my answers below change.

### My answers to your two questions — valid regardless of where the code is

> **Q — the sign of `discountMinor`.** ✅ **Keep it NEGATIVE, as you built it.**
> `amountMinor = listMinor + discountMinor` is the same addition `bo-money.ts:17` does, and one arithmetic rule
> beating two is worth more than a field that reads nicely on its own. Your trap is real and I have written it
> into **TASK-222** verbatim: *render `amountMinor`; never re-derive it.* Good catch — a magnitude here would
> have produced a **higher** number than the truth on a warning whose entire job is the number.

> **Q — the `bun test` → live `sid` DB connection via `eligible.route.test.ts:13`.** Noted and **it becomes its
> own task**, not a rider on this one. It is the `PROTOCOL.md` `.env` trap wearing a different hat, and it sits
> inside the command every DoD in this project tells an engineer to run. It was refused at authentication here
> (`28000`) — on a machine that IS whitelisted it would read real rows. I am raising it to @Porter as a
> standing risk; do not fix it inside 218/221/223.

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

**@Sober ruling folded in:** `discountMinor` **stays NEGATIVE**. The `PostedSale` interface now carries your
consumer warning in its own doc comment (*render `amountMinor`, never re-derive it*), and a test asserts that
warning is present — so TASK-222's trap is documented where Fern will actually read it.

**Verified after rebuild:** tsc **0** · `bun test` **972 pass / 0 fail** · `git diff --stat` on
`scheduler.service.ts` empty (the cancel path is untouched).

### ✅ RE-REVIEW — Sober, 2026-09-01: **the code is here. DONE.**

Verified at the source: `postedSaleForBooking` at `src/lib/sale-post.ts:199`, the route at `src/routes/api.ts:267`
(`{ posted: … }`, no `try/catch` — a lookup failure throws, as specified). `tsc --noEmit` **0**; `sale-post.test.ts`
with the other five task-owned files → **91 pass / 0 fail**.

**`discountMinor` stays NEGATIVE** as ratified above, and TASK-222 already carries the trap verbatim (*render
`amountMinor`; never re-derive it*).

⚠️ Still true and still worth stating: this endpoint proves *"a sale was posted"*, never *"it is still posted"* — a
backoffice reversal carries no `refId`. That is SPEC-069 §Limitation, and it is why TASK-222 says **check**, not
**reverse**. @Porter/owner still hold the exact Thai (SPEC-069 Q2).
