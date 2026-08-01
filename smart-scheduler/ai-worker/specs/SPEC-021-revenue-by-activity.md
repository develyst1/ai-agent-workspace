# SPEC-021: Backoffice — revenue by activity + per-customer spend
- Source: REQ-014
- Status: ACTIVE

## Overview
Two executive-only numbers on the backoffice: **monthly revenue split by sport**, and **each customer's spend +
history**. Access needs no work — the backoffice login *is* the executive's (REQ-002), and front staff have no
backoffice account, so "finance = executive-only" is satisfied by keeping this here.

## As-built — where a sale actually is, and what it does and doesn't know
> ## 🔴 CORRECTED 2026-08-01 — read this before the design below
> Jason blocked TASK-064 on a premise check and was right on all three counts. **Two of the errors are mine:**
> 1. **`bo.item.externalRef` does not exist.** It has `ownerRef` + `externalSource`. I read
>    `recordSale(externalRef, …)` in `ops-client.ts` and assumed the parameter named the *destination* column;
>    it named the **ops** `catalog_items` key, a schema we retired. **I asserted a column from a function
>    signature instead of opening the schema.** → **TASK-066** adds `bo.item.external_ref` (our own schema).
> 2. **"Retroactive coverage — every historical sale is attributed too" is NOT achievable**, and I sold it as a
>    reason to prefer this design. Repair attributes sales **going forward**; the past holds only the one-shot
>    backfill's residue, which cannot include courses or vouchers because **those INCOME items never existed**.
>    The design is still right — it just doesn't buy us history. **@Porter: correct this before คุณปุ้ม hears it.**
> 3. **And the input is broken, not just mis-named:** `catalogRoutes` is mounted **nowhere** (verified), both
>    call sites are `void recordSale(...)`, so **no sale has been recorded since the REQ-006 rebuild
>    (2026-07-28)** and nothing said so. → **TASK-066** repairs the write path, **TASK-067** makes its silence
>    impossible.
>
> **The design below stands unchanged; only its input had to be built first.** TASK-064 is held until TASK-066
> lands, keyed on `external_ref`.

Every sale is a `bo.movement` row with `refType: "SALE"` (`lib/ops-client.ts:112`). Two fields identify it:
the **item's product code** (`external_ref`, added by TASK-066) says *what kind*, and **`refId`** says
*which row*:

| Product code | `refId` points at | Sport knowable? |
|---|---|---|
| `course-{size}` | `course_packages.id` | ✅ via its bookings' `subjectId` |
| `first-trial` / `single-session` | `bookings.id` | ✅ `bookings.subjectId` directly |
| `voucher-{hours}` | `vouchers.id` | ❌ **structurally not** — see below |

`bo.movement` itself carries **no subject and no student**. Both are reachable by following `refId`.

## Design decision 1 — derive by joining, don't tag going forward
The REQ offers "tag each sale with its sport" vs "per-subject income items". **Neither.** The link already
exists via `refId`, so a **read-side attribution map** — `(productCode, refId) → { studentId, subjectId | null }`
— gives us the answer with:
- **no migration on the read side** (TASK-066's `external_ref` is on the write side, and it's our own schema),
- **nothing to keep in sync**: it's derived at read time, so it can't drift from the sale it describes,
- ~~retroactive coverage over every historical sale~~ — **withdrawn, see the correction above.** Attribution
  starts when the write path is repaired; the pre-repair period has no SALE rows to attribute at all.

Per-subject income items would multiply the catalogue by the number of sports and re-open the price model. No.

**One map, both features.** `revenue by sport` groups it by `subjectId`; `per-customer spend` groups the *same*
map by `studentId`. Building it twice is how the two screens end up disagreeing about one month's total.

## Design decision 2 — backoffice-back reads `public` directly (read-only)
Since REQ-006 there is **one database** (`public` = scheduling, `bo` = finance). backoffice-back's Drizzle schema
declares only `ops`/`bo`, so it must add **read-only declarations** for the `public` tables it joins
(`course_packages`, `vouchers`, `bookings`, `students`, `subjects`).

> **Ownership rule, stated so it can't erode: backoffice-back READS these tables and never writes or migrates
> them.** `public` migrations stay owned by scheduling-back. This is the mirror of the arrangement REQ-006
> already chose in the other direction (scheduling-back reads/writes `bo.item` directly rather than over HTTP),
> so it's the established pattern here, not a new liberty. An HTTP hop would add a failure mode and a second
> copy of the attribution rule for no gain — same database, read-only.

## ⚠️ Design decision 3 — voucher revenue is NOT attributable to a sport, and the report must say so
A voucher is **generic hours**. At the moment of sale there is no sport, and once used its sessions may be
**different sports**. So no join can attribute it, and no amount of tagging at sale time would be honest.

Therefore **`revenue by sport` carries an explicit `unattributed` bucket** — vouchers, plus any sale whose
`refId` no longer resolves. Same rule as SPEC-020's `unknown`: a finance report that silently drops what it
can't classify shows a clean split that doesn't add up to the month's real revenue, and **that is the number an
executive would act on**. The bucket is not a defect to hide; it's the honest part of the answer.

The alternative — recognising voucher revenue **per session as it's consumed** — is a **revenue-recognition
change**, i.e. a finance decision, not an SA one. Raised in Questions; **not assumed**.

## ⚠️ What this does NOT deliver — stating it so nobody infers it
This answers **revenue by sport**. It does **not** answer **revenue by branch / onsite-vs-online**, which is
REQ-021 finding 9: badges attach to *bookings*, `bo.movement` has no badge link, and the frontoffice has no
per-booking price. That stays structurally blocked and is not in this REQ's scope.

## API (backoffice-back, port 4010 — alongside the existing `GET /bo/reports/pl`)
- **`GET /bo/reports/revenue-by-activity?month=YYYY-MM`** → `{ month, totalMinor, buckets: [{ subjectId, name,
  amountMinor }], unattributedMinor, unattributedReason }`. Buckets + `unattributed` **sum to `totalMinor`** —
  that identity is the report's correctness check and should be asserted in a test.
- **`GET /bo/reports/customer-spend?month=…&q=…`** → per student: `{ studentId, name, totalSpendMinor,
  courses, vouchers, sessions }` from the same map.

Both behind the existing backoffice admin auth. Read-only.

## Data Model
**None. No migration.** Only read-only Drizzle declarations of existing `public` tables.

## Tasks
- **TASK-064** (Jason, backoffice-back :4010): the attribution map + both endpoints; the sum identity tested.
- **TASK-065** (Fern, backoffice-front :3018): the two report screens, **`unattributed` shown, never hidden**.

## Questions
(Sober asks; Porter answers as `> answer: ...`)
1. **The REQ's open "method" question is answered without needing คุณปุ้ม** — derive by join (no migration,
   retroactive) rather than tagging sales or exploding the item catalogue. Recording it, not routing it.
2. **⚠️ A real finance question, and the only one here: when does voucher revenue belong to a sport?** Today the
   whole voucher lands in `unattributed`. The alternative is to recognise it **per session as used**, which
   changes *when* revenue is recognised, not just how it's grouped — that's คุณปุ้ม's call, not mine.
   **Non-blocking:** the report ships with the honest bucket, and if she wants per-session attribution it is a
   follow-up, not a redesign. Worth asking with the number in front of her ("vouchers were ฿X of last month").
3. **FYI, not a question:** this gives revenue **by sport only**. "ยอดตามสาขา / onsite-vs-online" is still
   structurally impossible (REQ-021 finding 9) — please make sure that isn't what คุณปุ้ม is expecting from this.
