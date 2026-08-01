# TASK-077: scheduling (BE) — per-program prices, real availability, and the program on the sale
- Source: SPEC-024 (real price list 2026-08-01) — **unblocks REQ-014**
- Status: DONE  (reviewed 2026-08-01 by Sober — journal 17=17, VAT constant, availability via the catalogue with no new rule, retirement script dry-run + deactivate-never-delete; tsc 0 / 326 tests). 🔴 **2 routed:** bike-skate 1h price missing from the card · **voucher items may already exist at placeholder prices** if `sale:ensure-items` ran
- Depends on: TASK-066 (DONE — `bo.item.external_ref`)
- Assignee: @Jason (smart-scheduler-back, port 4006)

## Why
`lib/sale-items.ts` holds **one price per package size**. The owner's card prices **per program × package** — a
6-hour package is 6,490 / 7,990 / 7,490 / 5,290 depending on the program. One `course-6` cannot hold four
prices. Your placeholder warning was right, and the real card shows why: the per-hour rate **falls** with size,
which a flat hourly rate structurally cannot express.

## What to do

### 1. Migration — `subjects.price_group`
One nullable text column, hand-authored, **registered in `drizzle/meta/_journal.json` — no `db:generate`**.
Set the existing programs in the same migration:

| `price_group` | Programs |
|---|---|
| `bike-skate` | Bike/Scooter · Balance Cruiser · Surfskate · Freeskate · Skateboard · Inline Skate |
| `onewheel` | Onewheel E-Skate |
| `balance-private` | Balance Play (private 1:1) |
| `balance-group` | Balance Play (group) |

**Six programs share one price line**, which is why the key is the *group* and not the subject: keying by
subject would mean ~24 items where 10 are needed, and a seventh skate program would need a price invented
rather than inherited.

### 2. Item codes carry the group
`course-{group}-{size}` and `session-{group}` for the 1-hour row. **`voucher-{hours}` and `first-trial` are
unchanged** — neither is program-specific, and `first-trial` at 1,390 is already correct.

**Prices (THB — see §5):** `bike-skate` 4h/6h/10h = 4,790 / 6,490 / 9,790 · `onewheel` 1h/4h/6h = 1,690 /
5,790 / 7,990 · `balance-private` 1h/6h/10h = 1,390 / 7,490 / 11,390 · `balance-group` 1h/6h/10h = 1,090 /
5,290 / 7,790. Vouchers 5/10/15 h = 6,000 / 10,500 / 13,500.

Extend `sale:ensure-items` to create them. **Keep its rule that it never updates an existing item** — and
⚠️ **the placeholder rows from TASK-066 are now wrong and must not survive**: they carry
`metadata.pricePlaceholder: true`, so say in your notes how you'd retire them (a one-off script, or
deactivating them) — **do not silently overwrite prices**, since by deploy time some may have been corrected by
hand.

### 3. ⚠️ Availability falls out of the catalogue — do NOT add a rule
Onewheel has **no 10 h**; Balance Play has **no 4 h**. Those items simply don't exist, and your
`isKnownSaleItem` already refuses an unknown code **loudly**. Staff can currently sell a package that isn't
offered; afterwards the impossible combination has nothing to sell. **Reuse the guard; don't write an
availability table.**

### 4. `GET /api/sellable-packages`
The valid `(program, size, priceMinor)` combinations, so the FE offers only what exists instead of hard-coding
the card into a dropdown that will drift from it.

### 5. 🔴 VAT
**Every price on the cards is VAT-INCLUSIVE — the final amount the customer pays.** Post as-is; never add tax;
any net figure must be *derived*. Put that sentence on a **named constant**, not beside a bare number —
gross-vs-net is the assumption that gets made silently in a pricing constant and then misstates every report
built on top of it.

### 6. The sale must record the program
`createCoursePackage` knows the subject, so it can resolve the group and post to the right item. **This is what
unblocks REQ-014** — revenue-by-sport becomes a direct read of `external_ref` rather than a join back through
`refId` → course → bookings → subject.

## Definition of Done
- [ ] `subjects.price_group` exists via a hand-authored, **journal-registered** migration; existing programs
      mapped; **journal audit count stated**.
- [ ] Selling each (group, size) posts **one** `bo.movement` at the **card price**, VAT-inclusive, against
      `course-{group}-{size}`.
- [ ] Selling **Onewheel 10 h** or **Balance Play 4 h** fails **loudly** — no item, no silent ฿0.
- [ ] A subject with **no** `price_group` fails loudly too (it must never post to a default price).
- [ ] `GET /api/sellable-packages` returns exactly the combinations that exist.
- [ ] `first-trial`, vouchers, booking, entitlements, the freelance cap and the suspend gate are unchanged.
- [ ] Your plan for the now-wrong TASK-066 placeholder rows is stated (not executed silently).
- [ ] `bunx tsc --noEmit` clean; `bun test` green — a test asserting **every sellable combination has an item
      and every item has a price**, and that the unavailable combinations have neither.

## Implementation Notes

### 🔴 One thing on the card I will NOT guess — please route it
**`bike-skate` has no 1-hour row.** The card prices 4/6/10 h for the six skate programs, and a single hour
only for Onewheel (1,690), Balance Private (1,390) and Balance Group (1,090).

So **a `SINGLE_SESSION` booking on a skate program has no price**, and after this it **refuses loudly at
day-end** instead of posting. That is your rule applied ("a wrong price that looks right is worse than a loud
refusal") — but it's a **behaviour change on a path that may be common**, so it shouldn't be discovered from a
log line. **Q for คุณกุ้ง: what does one hour of Bike/Surfskate/Skateboard/etc. cost?** One number and it's a
one-line addition to `CARD`. Until then those sessions are visible in the `sales_not_posted` digest check
(TASK-067) rather than silently mispriced.

### The card, transcribed (all VAT-INCLUSIVE)
| group | 1 h | 4 h | 6 h | 10 h |
|---|---|---|---|---|
| `bike-skate` | ❌ (above) | 4,790 | 6,490 | 9,790 |
| `onewheel` | 1,690 | 5,790 | 7,990 | ❌ |
| `balance-private` | 1,390 | ❌ | 7,490 | 11,390 |
| `balance-group` | 1,090 | ❌ | 5,290 | 7,790 |

**12 program items** (3 session + 9 course) + 3 vouchers (6,000 / 10,500 / 13,500) + `first-trial` (1,390,
unchanged) = **16**. Every figure is pinned by a test against the card, so a typo can't drift in quietly.

**🔴 VAT** lives on `PRICES_ARE_VAT_INCLUSIVE`, a named constant carrying the sentence, exactly as you asked —
not a comment next to a number.

### Migration — `subjects.price_group` (0016)
Hand-authored, **journal idx 16, no `db:generate`**. ✅ **Journal audit: 17 entries = 17 `.sql` files.**
Maps the five seeded skate subjects (our `Bike / Scooter / Balance Cruiser` is one row covering three of the
card's six programs) plus the three others. **`1st Trial` is deliberately left NULL** — it isn't a package.
⚠️ **If a production subject was renamed, its group stays NULL and its sales refuse loudly** rather than
posting a wrong number. That's the safe failure, but it needs the smoke check below.

### Availability is the catalogue — no rule added, as specced
`isKnownSaleItem` already refuses an unknown code loudly, so "Onewheel has no 10 h" needed **no availability
table**: that item simply doesn't exist. `createCoursePackage` now resolves the group and refuses **before
creating anything** — previously staff could sell an unavailable package and the sale posted a price the owner
doesn't charge. A subject with **no** group is refused the same way.

### ⚠️ One thing the task didn't spell out, which I had to decide
Introducing `session-{group}` makes the old flat **`single-session`** obsolete — but the day-end path still
posted it. Leaving that would have priced every single session at one rate while the card charges three, so
**`revenueItemRef` now takes the price group** and the day-end job resolves it from the booking's subject.
`first-trial` is untouched (one price, all ages). **Flagging because it widened the change beyond the stated
scope** — say the word if you'd rather single sessions kept a flat code.

### 🔴 The placeholder rows — the plan, and a hole in it I found
DoD asks for the plan, not silent execution. `bun run sale:retire-placeholders` is **dry-run by default** and
sorts TASK-066's flagged rows into **three** buckets, because they are three different problems:
1. **Obsolete** (`course-4/6/10`, `single-session` — codes no longer sold) → safe; `--apply` **deactivates**
   them. Never `DELETE`: `bo.movement` rows reference them, and the FK cascades — deleting would take real
   posted revenue with it.
2. 🔴 **Still sold, wrong price** → **the script refuses to touch these.** Correcting a live price is a human
   decision, and it prints the current vs card figure for each so someone can fix it via `PATCH /bo/items/:id`.
3. **Already correct** (`first-trial`) → nothing to do; only its stale flag remains.

⚠️ **The hole, which matters for deploy order:** `sale:ensure-items` **never updates an existing item** (your
TASK-066 rule, still right). So **if TASK-066's script has already run in production, the voucher items exist
at the placeholder prices — 6,950 / 13,900 / 20,850 against a card of 6,000 / 10,500 / 13,500 — and nothing in
this task fixes them automatically.** They land in bucket 2 and need a human. If TASK-066's script has **not**
run yet (Porter still owns that deploy), everything is created correctly first time and bucket 2 is empty.
**Either way it is now visible instead of assumed** — but the deploy needs to know which world it's in.

### `GET /api/sellable-packages`
Returns each `(priceGroup, size, externalRef, priceMinor)` **with the subjects that sell on it**, plus
`vatInclusive: true` and — deliberately — **`unpricedSubjects`**, so the FE can say "this program has no price
group yet" instead of rendering an empty dropdown and looking broken.

### Unchanged
`first-trial`, vouchers, booking, entitlements, the freelance cap, the suspend gate, voucher validity. Revenue
still posts the same way — only *which item* it posts against changed.

### Verification
- `bunx tsc --noEmit` → **clean (exit 0)**; `bun test` → **326 pass / 0 fail** (45 files, was 316 — **+10**).
- ✅ **Journal audit: 17 = 17.**
- `lib/sale-items.test.ts` rewritten: **every sellable combination has an item and every item has a price** ·
  🔴 Onewheel 10 h, Balance Play 4 h and bike/skate 1 h have **neither** · a subject with no group can never be
  sold · every card figure asserted individually · VAT constant asserted · the day-end path returns
  `session-{group}` and **null when the group is unknown** · and a test that the **per-hour rate falls with
  package size**, which is the structural reason TASK-066's flat hourly placeholder could never have been right.
- ⚠️ DB behaviour is **deploy smoke** (brownfield). **Smoke, in order:**
  1. `bun run db:migrate` (0016) → then check **no active non-trial subject still has `price_group` NULL**
     (`GET /api/sellable-packages` → `unpricedSubjects` must contain only `1st Trial`). **This is the check
     that catches a renamed subject.**
  2. `bun run sale:retire-placeholders` (dry run) → read the three buckets; act on bucket 2 by hand.
  3. `bun run sale:ensure-items` → creates the 16; run twice, second run creates nothing.
  4. Sell Balance Group 6 h → **one** `bo.movement` at **5,290** against `course-balance-group-6`.
  5. Try Onewheel 10 h and Balance Play 4 h → **refused with a clear message**, nothing created.
  6. Attend a single session on Onewheel → day-end posts **1,690**; on a skate program → **refuses loudly**
     (the open question above).

**DoD:** `subjects.price_group` via a hand-authored, journal-registered migration, programs mapped, **audit
count stated** ✓ · each (group, size) posts one movement at the card price, VAT-inclusive ✓ (deploy smoke) ·
Onewheel 10 h / Balance Play 4 h fail loudly ✓ · a subject with no group fails loudly ✓ ·
`GET /api/sellable-packages` returns exactly what exists ✓ · `first-trial`/vouchers/booking/entitlements/cap/
suspend unchanged ✓ · **placeholder plan stated, not executed** ✓ · tsc clean + tests green incl. the
every-combination-has-an-item assertion ✓.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
- **Do not invent a price for anything.** If a combination on the card is ambiguous, flag it — a wrong price
  that looks right is worse than a loud refusal, which is the lesson your own placeholders taught us.
- If keying by group turns out to fight something in the schema, tell me before switching to per-subject
  items — I chose the group because six programs share one line, and I'd rather re-derive than have it drift.

## Review
(Sober fills at REVIEW.)
**Verdict: DONE ✅ (Sober, 2026-08-01).** `tsc` 0 · `bun test` **326/0** · `drizzle/*.sql` **17** =
`_journal.json` **17 tags** · `PRICES_ARE_VAT_INCLUSIVE` is a named constant. All my own runs.

### 🔴 Your card gap: correct to refuse, and I'm routing it — do not guess a number
**`bike-skate` has no 1-hour price.** So a `SINGLE_SESSION` on a skate program now refuses loudly instead of
posting. That is exactly the rule applied, and refusing beats the alternative — but you're right that it's a
**behaviour change on a possibly-common path**, and it must not be discovered from a log line. **@Porter:
one question for the owner — what does one hour of Bike / Surfskate / Skateboard / Inline cost?** One number,
one line in `CARD`. Until then those sessions surface in the `sales_not_posted` digest check rather than being
silently mispriced — which is your own TASK-067 catching your own TASK-077. That's the system working.

### 🔴 The deploy-order hole you found is the most valuable thing here
**If TASK-066's `sale:ensure-items` has already run in production, the voucher items exist at the placeholder
prices — 6,950 / 13,900 / 20,850 against a card of 6,000 / 10,500 / 13,500 — and nothing in this task fixes
them**, because `ensure-items` never updates (my TASK-066 rule, still right). That's a **30–55 % overstatement
on every voucher sale**, live, with no error anywhere.

You found it by reasoning about the *interaction* between two of your own tasks rather than testing this one in
isolation. It's now on the board as a deploy question that must be answered **before** the batch, not
discovered after: **has `sale:ensure-items` run on `sid` yet?** If no, everything is created correctly first
time. If yes, bucket 2 needs a human first.

### The retirement script is the right shape
Three buckets because they are three different problems, **dry-run by default**, and **it refuses to touch
"still sold, wrong price"** — correcting a live price is a human decision, so it prints current-vs-card and
stops. And **deactivate, never DELETE**, because `bo.movement` FKs cascade and deleting an item would take
**real posted revenue** with it. That last one would have been a very expensive lesson.

### Your scope-widening flag — accepted, and it was necessary
Introducing `session-{group}` made the flat `single-session` obsolete, so `revenueItemRef` had to learn the
group or every single session would post one rate while the card charges three. **That isn't scope creep, it's
the change being finished** — leaving it would have shipped a known-wrong price. Flagging it rather than
quietly widening is what I want; the answer here is keep it.

### Verified beyond the claims
The migration maps our five seeded subjects (our `Bike / Scooter / Balance Cruiser` row covers three card
programs) and **leaves `1st Trial` NULL deliberately** — it isn't a package. Your smoke step 1 is the one that
matters most: **a renamed production subject keeps a NULL group and refuses loudly**, so
`unpricedSubjects` must contain only `1st Trial`. Good that it's a check and not an assumption.

The test asserting **the per-hour rate falls with package size** is a nice touch — it encodes *why* a flat
hourly placeholder could never have been right, so nobody re-introduces one.

**TASK-077 → DONE. @Fern: TASK-078 unblocked** — `sellable-packages` also returns `unpricedSubjects`, so the
"this program has no packages set up" state is answerable without guessing.
