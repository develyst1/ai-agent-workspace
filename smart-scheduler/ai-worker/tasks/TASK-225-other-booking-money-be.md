# TASK-225: BE — charging an อื่นๆ booking: a typed amount **or** a catalogue item, posted at day-end

- Source: SPEC-070 (REQ-078 · AC-4 / AC-5 / AC-6)
- Status: ✅ DONE — code (Sober 2026-09-01) · 🔴 one follow-up: exclude own sale items from `/catalog-items`
- Depends on: **TASK-224** (the columns must exist)
- Repo: **smart-scheduler-back**, on `develop`. Assignee: **@Jason**

## Why `recordSale` cannot serve this

`recordSale` derives the amount from `bo.item.unit_price_minor` for a **product code** in `SALE_ITEMS`
(`sale-post.ts:70-95`, resolved by `external_source = 'smart-scheduler'` + `external_ref`). A **typed amount** has
no product code, and a **backoffice catalogue item** has no `external_source = 'smart-scheduler'`. Both fall
outside it. So this adds a sibling that posts **by item id, with an explicit amount** — it does not change
`recordSale`, whose two rules (never fail the booking, never fail silently) stay exactly as they are.

## What to do

### 1. `postBookingSale` — beside `recordSale` in `src/lib/sale-post.ts`
```ts
postBookingSale({ itemId, amountMinor, refId, idempotencyKey }): Promise<SalePostResult>
  → bo.movement { item_id, qty: -1, value_minor: amountMinor,
                  reason: "SALE", ref_type: "SALE", ref_id, idempotency_key }
```
- 🔴 **Sign:** `qty` negative = OUT, `value_minor` **positive** (`bo-money.ts:17`). **Pin it in a test** — a flipped
  sign here is invisible until a month-end number does not add up.
- Idempotent on `idempotencyKey`, the same up-front-read + unique-index shape `recordSale` already uses. **No
  second pattern for idempotency in this codebase.**
- Same loudness rule: a non-post is `console.error` with the ref, never silent.

### 2. Day-end (`jobs.service.ts`, the revenue block at `:107`)
Extend the attended-sweep to `OTHER`, and post **only when the booking is charged**:
- `otherPriceItemId` set → `amountMinor` = **that item's `unit_price_minor`, read at posting time**, `itemId` = it.
  Same rule the stored discount already follows (`:131`) — the price could have changed between booking and
  day-end, and the posted number must be the one that is true when it posts. **AC-6: attribution is the item id.**
- `otherPriceMinor` set → `itemId` = the `other-booking` INCOME item, `amountMinor` = the typed amount.
- **Neither set → write nothing at all (AC-4).** 🔴 **Not a ฿0 movement.** A zero row reads in the ledger as a sale
  that happened; "free" and "sold for nothing" are different claims and the books must not conflate them.
- `idempotencyKey = 'rev:<bookingId>'` — **the same key the trial/single path uses.** That is deliberate:
  SPEC-069's "revenue already posted" warning then covers อื่นๆ **the day this lands**, with no second lookup and no
  type list to keep in sync.
- ⚠️ If the chosen catalogue item is missing / inactive at posting time: **`console.error` loudly and post
  nothing** — the TASK-066 lesson. Never fall back to a default price.

### 3. The `other-booking` INCOME item (`sale-items.ts` + `sale:ensure-items`)
One new code for the typed-amount case. Its `unit_price_minor` is a **placeholder that is never read** — the amount
always comes from the booking. 🔴 **Say that in a comment on the entry**, or the next reader will assume the item's
price is the price of something.
⚠️ **`sale:ensure-items` never updates an existing item** (board, Blocked/waiting). It must be run on a box before
an อื่นๆ typed-amount booking can post there — state that in the deploy note.

### 4. The catalogue list the form needs — `GET /catalog-items` (or beside the other reads in `routes/api.ts`)
Active **INCOME** `bo.item` rows: `{ id, name, unitPriceMinor }`. Read-only, direct on the shared DB like every
other `bo` read in this repo (`sale-post.ts:84`). It exists so TASK-226's picker shows real items with real prices
instead of the frontoffice product codes.
> **@Sober's call, recorded:** "catalogue" here means the **backoffice `bo.item` catalogue** (SPEC-070 Q2 with
> @Porter). It must **not** be the `sale-items.ts` product codes — selling "a course-6" as an อื่นๆ booking would
> post course revenue with no course behind it.

### 5. VAT
Every price in `sale-items.ts` is **VAT-inclusive** (`PRICES_ARE_VAT_INCLUSIVE`). A typed amount is the **final
amount** on the same footing. Do not add tax, do not derive a net figure.

## Definition of Done — the OUTCOME
- [ ] Charged with a **typed ฿500** → attended → day-end posts **exactly ฿500** (`value_minor = 50000`, positive).
- [ ] Charged with a **catalogue item** → posts the **item's own price**, on **that item's** `item_id` (a report can
      break it down — AC-6).
- [ ] **Not charged → no movement exists at all** for that booking. Assert absence, not a zero.
- [ ] Re-running the day-end job writes **nothing extra** (idempotent on `rev:<bookingId>`).
- [ ] A missing/inactive chosen item posts nothing and logs loudly.
- [ ] The four existing types' posting is **byte-identical** — `git diff` on their path, plus the existing day-end
      tests still green.
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` → 0 · `bun test` green (report the count).
- [ ] 🚫 Nothing run against any database.

## Implementation Notes (Jason, 2026-09-01)
| | |
|---|---|
| Repo | `H:\scheduler\smart-scheduler-back` — the `machine.local.md` row |
| `git rev-parse HEAD` | `6dfa5a7` (your commit of TASK-218/221/223/224) |
| Branch | `dong` — ⚠️ still ahead of `develop`, per your note; merging is the human's |

🔴 **No migration.** `drizzle/*.sql` = **30** = journal tags, counted just now — unchanged from `0029`. TASK-224
already added the three columns this task reads; **this task is code only.**

### What changed

| File | Change |
|---|---|
| `src/lib/sale-post.ts` | **new** `postBookingSale({ itemId, amountMinor, refId, idempotencyKey })` |
| `src/lib/sale-items.ts` | **new** `OTHER_BOOKING_REF` + its `SALE_ITEMS` entry (with honest metadata) |
| `src/services/jobs.service.ts` | `OTHER` joins the attended sweep; **new** `postOtherBookingSale` |
| `src/services/scheduler.service.ts` | **new** `getCatalogItems()` |
| `src/routes/api.ts` | **new** `GET /catalog-items` |
| `src/services/other-booking-money.test.ts` **(new)** | 21 tests |
| `src/lib/sale-items.test.ts` | two existing invariants updated — see below |

**No script change needed:** `ensure-sale-items.ts` iterates `SALE_ITEMS`, so the new code is seeded by the
existing `bun run sale:ensure-items`.

### The parts worth your eye

**The `other-booking` item's price is 0, and that broke a real invariant.** `sale-items.test.ts` asserted *"every
item has a price > 0"* — a good test that caught exactly what it was built for. I did **not** relax it to `>= 0`:
that would let a genuine card price silently become 0 one day. It now carves out **that one code by name**, and
asserts the placeholder is what it says it is. And the seeded row carries
`priceSource: "NOT A PRICE — the amount is typed on each booking"`, so the honesty is **in `bo.item`**, not only
in a comment in this repo — `ensure-sale-items.ts` would otherwise have stamped it *"owner price card"*, which
would be a lie.

**AC-4 is enforced before anything is read.** The uncharged branch returns first: no lookup, no movement, no ฿0
row. A zero row reads in the ledger as a sale that happened, and then a report has to explain it.

**One defect I introduced and fixed before submitting.** My first cut had the two `bo.item` lookups **outside**
any `try`. `postBookingSale` protects its own writes, but those reads were mine — an unreachable `bo` schema
would have thrown straight out of `runEndOfDayJob`, losing that day's auto-attend, quota deduction **and** its
`job_runs` row to a bookkeeping read. That is precisely rule 1 of `sale-post.ts` ("never fail the thing it
describes"), and I had broken it one file over. Wrapped, logged loudly with the booking id, and pinned with a
test.

**Two of my own assertions were wrong, not the code** — worth recording because both are traps in source tests:
`toContain("vat")` matches "deacti**vat**ed" in a comment, and an ordering assertion measured my own prose
because the function's comment names `postBookingSale` before the first lookup. Both now strip comments and use
word boundaries. A guard that cries wolf on an English word is a guard someone deletes.

### Verified
```
bunx --package typescript@5.6.3 tsc --noEmit   → exit 0
bun test                                        → 1028 pass / 0 fail (+24 on TASK-224's 1004)
drizzle/*.sql = 30 = journal tags (no migration in this task)
```

### 🚫 What is NOT proven, and is not mine to prove
Every DoD line about a movement landing needs a database: ฿500 typed → `value_minor = 50000`; a catalogue charge
on that item's id; **no movement at all** for an uncharged booking; the re-run writing nothing extra. I have run
nothing against any environment.

### 🚦 Deploy note — one ordering dependency
**`bun run sale:ensure-items` must run on a box BEFORE any typed-amount อื่นๆ booking can post there.** It is
insert-only and never updates an existing item, so it is safe to re-run; without it the `other-booking` bucket
does not exist and every typed-amount charge logs `NOT POSTED` and vanishes — TASK-066's exact failure. The code
names the script in that error message, so the fix is in the log line rather than in someone's memory.
Order per box: `db:migrate` → `db:verify` ✅ → `sale:ensure-items` → restart.

## Questions
- 🔴 **A consequence of joining the day-end sweep that I do not think anyone has walked through: an อื่นๆ
  booking nobody marks gets AUTO-ATTENDED at 23:30, and then it CHARGES.** That is not new machinery — it is
  the same consequence `jobs.service.ts:76-85` names for trial/single after REQ-070 — but it lands differently
  here. A ฿1,390 trial that nobody marked is at least a session that was scheduled to happen; a **charged อื่นๆ
  booking** might be a school visit that was cancelled by phone and never touched in the system, and it will
  invoice itself overnight. **I implemented the sweep as the TASK specifies** (AC-9 says อื่นๆ auto-attends, and
  I am not inventing an exception). Flagging it because the owner has twice refused to let money move as a side
  effect, and this is money moving with nobody present. If he wants the charge to require a human mark, that is
  a booking-type carve-out in the auto-attend block — a different task, and it needs his word, not mine.

- **`GET /catalog-items` returns every active INCOME `bo.item` — including the frontoffice sale items this repo
  itself seeds** (`first-trial`, `course-*`, `voucher-*`, the rentals, and now `other-booking`). Your ruling was
  that the picker must not offer the **`sale-items.ts` product codes**, and it does not — but those codes have
  `bo.item` rows, so they come back through the catalogue read anyway, and TASK-226's picker would list
  "Course 6h (onewheel)" as a chargeable อื่นๆ item. **Do you want them filtered out?** The clean filter is
  `external_source <> 'smart-scheduler' OR external_source IS NULL` — one predicate, and it makes the endpoint
  mean *"backoffice catalogue"* rather than *"every income item"*. I did **not** add it: your recorded call was
  about which catalogue, and excluding this repo's own items is a slightly different decision that I would
  rather you make than assume. **This gates TASK-226's picker, so it is worth answering before Fern builds it.**

- **`other-booking` will show up in that same picker** (it is an active INCOME item). Selecting it as a
  "catalogue item" would post its placeholder ฿0 — which `postBookingSale` refuses loudly, so it fails safe
  rather than posting a zero. Still worth excluding in whatever answer you give above.

- **Not blocking, for the record:** the `bo.item` a staff member picks may be one backoffice also uses for other
  purposes, so อื่นๆ revenue and that item's other revenue share a line in a report. AC-6 asks for attribution
  by item, which this satisfies exactly — I mention it only so nobody later reads a mixed line as a defect.

## Review
(Sober fills this in at REVIEW.)

## Review — Sober, 2026-09-01: ✅ **PASS.** And the two things you flagged are both real.

**Reproduced:** `tsc --noEmit` → **0** · `other-booking-money` + `sale-items` + `other-booking` + `sale-post` →
**105 pass / 0 fail** · `drizzle/*.sql` = 30 = journal tags, **no migration** — re-counted, not read off your notes.
(I did not run the full `bun test`: it reaches the live `sid` DB via `eligible.route.test.ts:13`, which I have
routed to @Porter as a standing risk.)

**Checked at source:** `sale-post.ts:196-197` — `qty: -1`, `valueMinor: opts.amountMinor` **positive**, with the
comment saying the amount is the caller's and never the item's. `jobs.service.ts:190` — the uncharged branch
returns **before** any lookup, so AC-4 is *no movement*, not a ฿0 row. `:198` — the two `bo.item` reads are inside
the `try`. `:208` — a missing/inactive item logs loudly and posts nothing.

📌 **The best judgement in this task is the one you nearly got wrong and didn't: refusing to relax
`price > 0` to `>= 0`.** Widening an invariant to fit one exception is how a real card price silently becomes 0
a year from now, and nobody would ever see it. Carving out **one code by name** keeps the guard's teeth. And
putting `priceSource: "NOT A PRICE — the amount is typed on each booking"` into **`bo.item` itself** is the part
I would not have thought to ask for: a backoffice reader looking at that row would otherwise have seen
*"owner price card"* and believed it.

📌 **The defect you found in your own first cut is the more important one.** Two bookkeeping *reads* outside the
`try` would have thrown out of `runEndOfDayJob` and cost that night its auto-attend, its quota deductions **and**
its `job_runs` row — the whole day, to a lookup that only decides a ledger line. That is rule 1 of `sale-post.ts`
broken one file over, and it is exactly the class of bug that hides until the one night `bo` is unreachable.

📌 And the two source-assertion traps (`toContain("vat")` matching *"deacti**vat**ed"*, and an ordering assertion
measuring your own comment) are worth the line you gave them: **a guard that cries wolf on an English word is a
guard someone deletes.**

### ✅ Your question — the `/catalog-items` filter: **EXCLUDE this repo's own items. Add the predicate.**

You were right to ask rather than assume, and right that it is a *different* decision from the one I recorded —
but it resolves the same way, one layer down. My ruling was *"not the `sale-items.ts` product codes"*, and those
codes **are** `bo.item` rows wearing a display name. Leaving them in would put **"Course 6h (onewheel)"** in
Fern's picker, and charging an อื่นๆ booking to it posts **course revenue with no course behind it** — the exact
outcome I forbade, arrived at by a different door.

⇒ **Add `external_source IS DISTINCT FROM 'smart-scheduler'`** (or the equivalent on `SALE_SOURCE`) to
`getCatalogItems()`. Note the consequence and keep it: **`other-booking` itself is excluded too**, which is
correct — it is the typed-amount bucket, not something a human picks. The picker should offer only items a human
created in the backoffice.
⚠️ Add a test that the seeded codes are absent from the result, or the next `sale:ensure-items` entry quietly
re-appears in a staff-facing dropdown.

### 🔴 Your second flag — auto-attend charges overnight — goes to @Porter, and you framed it correctly

You implemented AC-9 as written and did **not** invent an exception. That is right: a carve-out in the
auto-attend block is a money rule, and money rules are the owner's.

**What I am carrying up is the part that is genuinely new, not the part that already existed.** A trial or 1HR
auto-attending and posting has been true since REQ-070, and the owner has lived with it: the exposure is bounded
by the price card — ฿1,390. **An อื่นๆ charge is a typed amount with no ceiling.** So an unattended school visit
can invoice itself overnight for ฿5,000 or ฿50,000, and nobody was present at either end. That is a different
size of consequence from the same mechanism, and it is the sentence @Porter should put to the owner.

**Not blocking. Nothing changes in this task.**

### Deploy note, carried
🚦 Per box: `db:migrate` → `db:verify` ✅ → **`bun run sale:ensure-items`** → restart. Without that seed the
`other-booking` bucket does not exist and every typed-amount charge logs `NOT POSTED` and vanishes — TASK-066
exactly. Good call naming the script **inside the error line**; that is the difference between a fix that is
discoverable and one that depends on someone remembering this conversation.

**Status → DONE (code).** The movement-landing DoD lines are `sid`/QA, as you said.
