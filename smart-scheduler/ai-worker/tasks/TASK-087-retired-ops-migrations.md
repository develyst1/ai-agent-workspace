# TASK-087: backoffice-back — a third verdict for migrations that will never apply (`ops` is retired)
- Source: the 2026-08-02 backoffice dry-run (`0001`, `0002` → not-applied) — REQ-032
- Status: DONE  (reviewed 2026-08-02 by Sober — `retired` is a probe kind in the same union, exemption scoped to exactly those tags and tested both ways so it cannot become an off-switch, masking check clean; **and he corrected my emptied-ledger framing: ordering does NOT protect — the unguarded baseline + single transaction does**; tsc 0 both, 131/0 + 374/0)
- Depends on: TASK-086 (DONE)
- Assignee: @Jason (smart-scheduler-backoffice-back, port 4010)

## The decision — mine, and here it is
**Do not apply `0001_item_pl` / `0002_item_external`, and do not silently exclude them either.**

Both touch **only `ops.*`** — the schema REQ-006/TASK-027 retired. Applying them would add columns to a schema
nothing reads, and per Porter's ordering analysis **`drizzle-kit migrate` can't even reach them** (their
`folderMillis` is older than the newest seeded row), so "apply" really means *hand-run SQL against a dead
schema* — which we don't do.

But excluding them quietly is the other failure. **The thing we have spent two days undoing is exactly a ledger
that says nothing while the truth is elsewhere.**

**So: a third verdict.** Not `applied`, not `not-applied` — **`retired`**: *never applied, never will be, and
here is why.* It is **not seeded into the ledger** (that would be a claim nobody verified), and the verifier
**prints it on every run** and stays green.

> **Why green rather than red:** a verifier that is permanently red gets ignored, and then the next real skip
> is invisible. **A guard nobody trusts is worse than no guard** — the whole reason this exists is that a
> failure was silent. A verdict that is visible, justified, and stable keeps the check meaningful.

**Reuse the vocabulary you already built** — scheduling's `0002` is `superseded-by: 0007` and inherits strictly.
This is the same idea: an entry that cannot be observed because the world moved. **One mechanism, not a special
case**, and if you think `retired` should be expressed as `superseded-by` with a reason, that's fine — say which
you chose.

## What to do
- Add the `retired` classification to the **shared witness map** with a per-entry reason naming
  **REQ-006/TASK-027** (so the next reader learns *why*, not just *that*).
- `db:verify` reports them as retired, **exits 0**, and lists them every run — never hides them.
- The seeder **does not insert rows for them**.
- ⚠️ **State what happens if the ledger is ever emptied and reseeded**, because that's the one path where
  drizzle could try to apply them. If the answer is "it can't, because ordering", say so; if it can, guard it.

## Definition of Done
- [ ] `0001` / `0002` are classified `retired` with a reason citing REQ-006/TASK-027; no ledger rows for them.
- [ ] `bun run db:verify` on backoffice **exits 0** and **prints them** as retired.
- [ ] A genuinely unrecorded, non-retired migration still makes verify go **red** — test both, or "retired"
      becomes a way to switch the guard off.
- [ ] `bunx tsc --noEmit` clean; `bun test` green. The classification logic is pure and tested.
- [ ] Updated operator line for @Porter: what backoffice's dry-run and verify should now print.

## Porter's second question — "is there a reason to keep `ops` at all?"
**Worth a REQ, and not before go-live. I looked rather than guessing:**
- Only **`/auth` and `/bo`** are mounted (`routes/api.ts:11`). `catalog.ts` — the `ops` surface — is mounted
  **nowhere**, so those tables are unreachable over HTTP.
- **But `resolveOrganization` reads `organizations`** and is imported by `pricing.service` and
  `parties.service`, so **at least one table in that family may still be load-bearing.**

**So "retire `ops`" is not a delete; it's an investigation with a destructive ending**, on a live database,
18 days before launch, for a schema that is currently costing us nothing now that the ledger is split. **The
risk/benefit is wrong this month and right next month.** @Porter: worth raising as a REQ **after go-live**, and
the first question in it is *what still reads `organizations`* — not *when do we drop it*.

## Implementation Notes

**I ran nothing against a database** — only `bunx tsc` and `bun test`, offline.

### Which form I chose: a **probe kind**, not a boolean
You said either was fine if I said which. `retired` is `{ kind: "retired"; since: string }` in the same
discriminated union as `superseded-by` — because it resolves **without a query**, exactly like it does. That
makes it the same mechanism rather than a flag bolted alongside one, and `describeProbe` renders it as
*"RETIRED — target schema retired by REQ-006 / TASK-027; will never be applied"*, so the operator reads the
reason and not just a verdict. `since` is a field rather than prose so it can't be filled in vaguely.

### What falls out for free, and what didn't
`blockers()` and `appliedTags()` already excluded anything that isn't `needs-human`/`not-applied`/`applied`,
so **retired is non-blocking and unseeded with no change** — the vocabulary was the right shape. One thing did
need work: the verifier's *ledger* check (`missingMigrations`) is hash-based and knew nothing about verdicts,
so it would have gone permanently red on the two unrecorded entries. That's now narrowed by `retiredTags()`.

⚠️ **That exemption is the one place `retired` softens a check, so I kept it deliberately narrow**: it excuses
**exactly those tags** and nothing else. There's a test asserting a genuinely unrecorded, non-retired
migration still turns verify red, and another that a non-retired `not-applied` + `rerunnable: false` still
**halts** — otherwise `retired` would be indistinguishable from switching the guard off, which is your DoD.

### ✅ Your "could this mask something?" check — done, and it's clean
This was the one way the decision could be wrong, so I checked rather than assumed:
- The columns `0001`/`0002` add (`ops.catalog_items.item_group`/`item_type`/`external_source`,
  `ops.stock_movements.amount_minor`) are referenced **only** by `routes/catalog.ts`, `routes/recurring.ts`
  and the dormant ops P&L service.
- `routes/api.ts:11` mounts **`/auth` and `/bo` only**. Neither of those files is mounted.

**So no live code path reads what these migrations add**, and `retired` masks nothing. If that ever changes —
if someone mounts the `ops` surface — these two stop being retired and this map is where they'd be corrected.

### ⚠️ "What if the ledger is emptied and reseeded?" — ordering does NOT protect, but something else does
You asked me to say plainly which it is, and the honest answer is **not** "it can't, because ordering":
- An empty ledger means `!lastDbMigration`, and drizzle's condition is
  `if (!lastDbMigration || created_at < folderMillis)` — so it would attempt **everything from 0000**,
  `0001`/`0002` included. Ordering only protects a *populated* ledger.
- **What actually stops it is the baseline.** `0000_friendly_moonstone` has **42 `CREATE` statements and
  zero `IF NOT EXISTS`** — the very first is `CREATE SCHEMA "ops";`, which raises `42P06` against a database
  where `ops` exists. And since the whole run is **one transaction** (TASK-086's finding), the batch rolls
  back: **nothing applies, `db:migrate` exits non-zero, and the operator sees it.**

So the failure mode is **loud and harmless**, and it's structural rather than a guard I added. Worth noting
the belt-and-braces: even if `0000` were ever made idempotent and the run got as far as `0001`/`0002`, both
are **fully `IF NOT EXISTS`-guarded** (`0001` also wraps its `CREATE TYPE`s in `DO $$ … EXCEPTION`), so the
worst case is two unused columns on a dormant schema. **I did not add a code guard**, because inventing one
for a path already blocked by a loud transactional failure would be speculative — but say the word and I'll
add an explicit refusal in the seeder instead.

### Updated operator line for @Porter
Backoffice only; scheduling's output is unchanged from TASK-086.
```
bun run db:seed-ledger        # dry-run
#   Expect: 0000/0003/0004/0005 ✅ applied · 0001/0002 ℹ️ retired · 0 not applied · 0 need a human
#   Summary line ends: "· 2 retired · 0 need a human"
#   and: "Retired (never applied, never will be, NOT seeded): 0001_item_pl, 0002_item_external"
#   🔴 STOP if 0001/0002 show as anything other than retired, or if any row needs a human.

bun run db:seed-ledger --apply   # seeds 4 rows — NOT 6
bun run db:migrate               # applies nothing; verify prints the 2 retired and exits 0 (green)
```
`db:verify` now prints the retired block **on every run, pass or fail** — the point is that they're visible,
not that they're quiet — and ends with
*"✅ every migration is recorded in the ledger AND witnessed in the schema (retired excepted)."*

### Verification
- `bunx tsc --noEmit` → **clean** in both repos.
- `bun test` → backoffice **131 pass / 0 fail** (13 files, was 124 — **+7**); scheduling **374 / 0**,
  unchanged (this task touches backoffice only).
- Tests cover: both entries classified `retired` citing REQ-006/TASK-027 and `rerunnable: false` · the verdict
  resolves without a query · **no ledger row** for them · **they don't block** · 🔴 **a genuinely unrecorded
  non-retired migration still goes red** · 🔴 a non-retired `not-applied` + not-re-runnable still **halts** ·
  and `describeProbe` carries the reason.
- I also tightened the pre-existing "one row per journal entry" test rather than loosening it: it now asserts
  `applied + retired === journal length` **and** that the retired pair is exactly `0001`/`0002`.
- ⚠️ Nothing verified against a database; the probe SQL is unchanged from TASK-086 and reviewed by reading.

**DoD:** `0001`/`0002` classified `retired` with a reason citing REQ-006/TASK-027, no ledger rows ✓ ·
`db:verify` exits 0 and **prints them every run** ✓ · a genuinely unrecorded non-retired migration still goes
red — **both halves tested** ✓ · tsc clean, tests green, classification logic pure and tested ✓ · operator
line updated ✓ · emptied-ledger path answered explicitly (ordering doesn't protect; the unguarded baseline +
single transaction does) ✓.

### On your Porter note (no action from me)
Agreed and nothing to do here: `retire ops` is an investigation with a destructive ending on a live database
18 days before launch, and the ledger split already removed the cost of leaving it. I'll add only that
`resolveOrganization` reaching `organizations` is reachable **only** through the unmounted `pricing`/`parties`
services — so even that thread is currently dormant, which strengthens "after go-live, and start by asking
what still reads it".

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- **Do not hand-run the two `ops` migrations**, and don't add a path that lets someone do it accidentally.
- If you find that a `retired` classification could mask a migration that *should* have applied, **stop and tell
  me** — that's the one way this decision could be wrong, and I'd rather hear it than have it discovered later.

## Review
(Sober fills at REVIEW.)

## Review
**Verdict: DONE ✅ (Sober, 2026-08-02).** Verified myself: `{ kind: "retired"; since }` is a member of the same
discriminated union (`migration-witness-core.ts:39`), `retiredTags` exists and is used to narrow the ledger
check, and `0000_friendly_moonstone` really does open with **`CREATE SCHEMA "ops";`** and carry **42 `CREATE`s
with zero `IF NOT EXISTS`**. `tsc` 0 both repos · backoffice **131/0** · scheduling **374/0** unchanged.

### 🔴 You corrected my framing on the emptied-ledger question, and the correction is the valuable part
I wrote *"if the answer is 'it can't, because ordering', say so."* **It isn't.** An empty ledger means
`!lastDbMigration`, and drizzle's condition short-circuits — it would attempt **everything from `0000`**,
`0001`/`0002` included. **Ordering only protects a populated ledger**, and I'd have accepted the wrong reason
if you'd given it.

What actually protects us is the **baseline being unguarded**: `0000` starts with `CREATE SCHEMA "ops"` against
a database where `ops` exists → `42P06`, and because the whole run is one transaction, **the batch rolls back,
`db:migrate` exits non-zero, and the operator sees it.** Loud and harmless, and **structural rather than a guard
you added** — which is the better kind. Taking a leading question and answering the real one is exactly what I
want; I gave you an easy out and you didn't take it.

### The exemption is where this could have gone wrong, and you kept it narrow
`retired` is the one place a verdict **softens** a check. You scoped it to **exactly those tags** via
`retiredTags()`, and then tested the two ways it could have become an off-switch: a genuinely unrecorded
**non-retired** migration still turns verify **red**, and a non-retired `not-applied` + `rerunnable: false`
still **halts**. Without both, "retired" would be indistinguishable from disabling the guard — which is the
whole reason that DoD line existed.

**And the masking check came back clean because you ran it, not because it was obvious.** The columns these two
add are referenced only by `routes/catalog.ts`, `routes/recurring.ts` and the dormant ops P&L service — none of
which is mounted (`api.ts:11` mounts `/auth` and `/bo` only). **So `retired` masks nothing today**, and you said
where it would be corrected if someone ever mounts that surface. That's the honest version: not "it's fine", but
"here is the condition under which it stops being fine, and here is where you'd change it."

### Form
Choosing a **probe kind** over a boolean was right, and your reason is the one I'd have given: it resolves
**without a query**, exactly like `superseded-by`, so it's the *same mechanism* rather than a flag living next
to one. `since` as a field rather than prose is a small thing that stops it being filled in vaguely.

**TASK-087 → DONE. The migration work is complete: scheduling recovered, backoffice reconciled, and both
verifiers are honest — green when the world is fine, red when it isn't, and explicit about the two entries that
will never apply.**

⏳ **@Porter — backoffice's remaining steps are yours**, dry-run first as always. Expect `4 applied · 2 retired ·
0 need a human`, verify **green**, and the two `ops` entries **printed with their reason** — if they ever stop
being printed, that's the regression to catch.
