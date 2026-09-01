# TASK-229: BE — `/catalog-items` must not offer this repo's own sale items

- Source: SPEC-070 Q2 · @Jason's question on TASK-225 (he found it and deliberately did not decide it)
- Status: ✅ DONE (Sober 2026-09-01) · DATA REQUEST routed to @Porter (does not block)
- Depends on: TASK-225 (the endpoint). 🔴 **This GATES TASK-226** — Fern's picker reads it.
- Repo: **smart-scheduler-back**, on `develop`. Assignee: **@Jason** (one predicate + one test)

## What to do

`getCatalogItems()` (`scheduler.service.ts:1197`) returns every active **INCOME** `bo.item`. That includes the
rows **this repo seeds** from `sale-items.ts` — `first-trial`, `course-*`, `voucher-*`, the rentals, and now
`other-booking`. Add the exclusion:

```ts
// …existing: direction INCOME + active
ne(boItem.externalSource, SALE_SOURCE)   // or `IS DISTINCT FROM` — NULL external_source must still be INCLUDED
```

⚠️ **Careful with the NULL case.** A backoffice-created item has `external_source IS NULL`, and in SQL
`NULL <> 'smart-scheduler'` is **NULL, not true** — a plain `ne()` would filter out exactly the items the picker
exists to show. Use `IS DISTINCT FROM`, or `OR external_source IS NULL`. **This is the whole task; get it wrong
and the list comes back empty, which will look like "the endpoint is broken".**

## Why — the ruling, so it is not re-litigated

My recorded call on SPEC-070 Q2 was *"catalogue" = the backoffice `bo.item` catalogue, **not** the `sale-items.ts`
product codes*. Those codes **have `bo.item` rows**, so without this predicate **"Course 6h (onewheel)" appears in
the staff picker** — and charging an อื่นๆ booking to it posts **course revenue with no course behind it**. Same
outcome I forbade, reached through a different door.

📌 **`other-booking` is excluded too, and that is correct:** it is the typed-amount bucket, not something a human
picks. The picker offers only items a person created in the backoffice.

## Definition of Done
- [ ] A backoffice-created INCOME item (`external_source IS NULL`) **is** in the list — this is the case a naive
      `<>` silently breaks.
- [ ] `first-trial` / `course-*` / `voucher-*` / rental codes / `other-booking` are **absent**. Assert by code, so
      the next `sale:ensure-items` entry cannot quietly reappear in a staff dropdown.
- [ ] An inactive or EXPENSE item is still excluded (unchanged).
- [ ] `bunx --package typescript@5.6.3 tsc --noEmit` → 0 · `bun test` green. No migration. 🚫 Nothing run against a DB.

## Implementation Notes (Jason, 2026-09-01)
| | |
|---|---|
| Repo | `H:\scheduler\smart-scheduler-back` — the `machine.local.md` row |
| `git rev-parse HEAD` | `6dfa5a7` |
| Branch | `dong` |

🔴 **No migration** (`drizzle/*.sql` = 30 = journal tags). Two files: one predicate, one test file.

### The predicate
```ts
sql`${boItem.externalSource} is distinct from ${SALE_SOURCE}`
```
added to the existing `INCOME + active` `and(...)` in `getCatalogItems`, with your NULL warning written at the
site rather than only here.

### 🔴 I did not want to take the NULL trap on trust, so I made the SQL show me
Your warning is the whole task, and *"a plain `<>` returns an empty list"* is the kind of claim that is easy to
nod at and hard to verify without a database — which I cannot use. So the test asserts the **emitted SQL**:
`db.select()…​.toSQL()` builds a query offline and executes **nothing**, so it is legal for me and it is real
evidence rather than a source grep.

- the chosen construct compiles to **`is distinct from`** ✅
- `ne(boItem.externalSource, SALE_SOURCE)` compiles to **`<>`** ✅ — the operator that yields NULL against a NULL
  column, so the row is excluded. **That is the shipped-empty-picker bug, now recorded as evidence in the suite
  rather than as folklore in a task file.**
- the service uses the first and not the second, and the two pre-existing clauses are still in the same `AND`.

### The "assert by code" DoD line — how I read it, since a literal reading would have been weaker
You asked that the seeded codes be asserted *"by code, so the next `sale:ensure-items` entry cannot quietly
reappear in a staff dropdown"*. **Listing `first-trial` / `course-*` / … in the test would be a second list that
drifts** — the exact failure this project keeps paying for. What actually gives the guarantee is that
`ensure-sale-items.ts` stamps **every** `SALE_ITEMS` row with `externalSource: SALE_SOURCE`, and the predicate
excludes that source. So the test asserts **the seeder and the filter agree on one value**, plus a spot-check
that the covered set really does include the named codes. A code added to `SALE_ITEMS` tomorrow is excluded
without anybody editing this test — which is the property you asked for, rather than the list you named.

📌 `other-booking` is excluded by the same one predicate — no special case, as you said.

### Verified
```
bunx --package typescript@5.6.3 tsc --noEmit   → exit 0
bun test                                        → 1058 pass / 0 fail (+8)
```
🚫 Nothing run against any database — `.toSQL()` compiles, it does not connect.

### ⚠️ What is still NOT proven, and cannot be by me
**That the list comes back non-empty on a real box.** The predicate is right and the SQL is now witnessed, but
*"a backoffice-created INCOME item appears"* needs a row in `bo.item` with `external_source IS NULL` — and I do
not know that `sid` has one. If backoffice has only ever created items through a path that stamps a source, the
picker will be **correctly** empty and will still look broken to Fern. **Worth one read-only SELECT before
TASK-226 is judged** — offered in §Questions.

## Questions
- 🔴 **DATA REQUEST — one read-only SELECT, and I think it should land before TASK-226 is judged.**
  The predicate is correct and the emitted SQL is now witnessed, but **"the picker shows something" is a
  different claim from "the filter is right"**, and only data answers it. If every `bo.item` on `sid` happens to
  carry an `external_source`, the picker is **correctly empty** — and Fern will reasonably read an empty
  dropdown as a broken endpoint and spend an afternoon on it. That is the same misdiagnosis-in-the-wrong-place
  that this task's own NULL trap was about, one layer up.

  Pure SQL, read-only, for the owner in his own psql session:
  ```sql
  SELECT COALESCE(external_source, '(null)') AS source, direction, active, count(*)
  FROM bo.item GROUP BY 1, 2, 3 ORDER BY 1, 2, 3;
  ```
  **What I need from it:** the count of rows with `source = '(null)'` (or any source that is not
  `smart-scheduler`) that are `INCOME` **and** `active`. That number **is** the length of Fern's dropdown.
  - **> 0** ⇒ ship; TASK-226 has real items to render.
  - **= 0** ⇒ the endpoint is right and the picker is empty **by data, not by defect**. Then the owner needs to
    create the อื่นๆ chargeable items in the backoffice first, and TASK-226 needs an empty-state that says so
    ("ยังไม่มีรายการในแคตตาล็อก — สร้างที่หลังบ้านก่อน") instead of an empty box. **That is a real FE
    requirement that nobody has written down yet**, and it is cheap now and expensive after the owner sees a
    blank dropdown.

  Routing it as a DATA REQUEST rather than guessing, per the standing policy. **Not blocking my task** — 229 is
  complete either way.

- **A smaller note on the same endpoint:** it returns every active INCOME `bo.item` that backoffice owns, with no
  notion of "is this appropriate to charge a customer for". If backoffice carries INCOME items that are not
  customer-facing, they will appear. I did **not** add any further filter — you ruled on *source*, and inventing
  a second axis (a metadata flag, a name convention) without the owner would be exactly the kind of guess this
  task exists to remove. Naming it so it is a decision rather than a discovery.

## Review
(Sober fills this in at REVIEW.)

## Review — Sober, 2026-09-01: ✅ **PASS.** You turned my warning into evidence, which is better than obeying it.

**Reproduced:** `tsc --noEmit` → **0** · `catalog-items.test.ts` → **8 pass / 0 fail** · `drizzle/*.sql` = 30 =
journal tags (no migration). At source: `scheduler.service.ts:1216` uses
`sql\`${boItem.externalSource} is distinct from ${SALE_SOURCE}\`` inside the existing `INCOME + active` `and(...)`,
with the NULL reasoning written **at the site**, not only in the task.

📌 **Asserting the emitted SQL is the best thing in this task, and it generalises.** My warning — *"a plain `<>`
returns an empty list"* — is exactly the kind of claim that gets nodded at and never checked, because checking it
looks like it needs a database. `.toSQL()` **compiles without connecting**, so you produced real evidence inside
the rule that forbids you a DB. And you pinned **both** sides: that the chosen construct emits `is distinct from`
**and** that `ne()` emits `<>`. **The trap is now in the suite instead of in folklore** — the next person who
"simplifies" it to `ne()` gets a red test with the reason attached, rather than an empty dropdown and an
afternoon.

📌 **You read the "assert by code" DoD line better than I wrote it.** I asked for the seeded codes to be asserted
by name; you saw that a list in the test **is a second list that drifts** — the failure this project keeps paying
for — and asserted the property instead: **the seeder and the filter agree on one value**, plus a spot-check.
A code added to `SALE_ITEMS` tomorrow is excluded with nobody editing the test. **That is the guarantee I wanted
and not the mechanism I named. Correct to overrule the literal reading.**

### Your DATA REQUEST — ✅ taken, and you are right that it should land before TASK-226 is judged

**The distinction you drew is the important part: "the filter is right" and "the picker shows something" are
different claims, and only data answers the second.** If every `bo.item` on `sid` carries a source, the endpoint
is **correctly** empty and @Fern spends an afternoon on a non-defect — the same misdiagnosis-in-the-wrong-place
as the NULL trap, one layer up.

**Routing your SELECT to @Porter as written** (pure SQL, read-only). And I am taking the second half of your note
as a requirement rather than a contingency:

🔴 **TASK-226 gets an explicit EMPTY STATE regardless of what the query returns.** Not conditional on `= 0`.
*"ยังไม่มีรายการในแคตตาล็อก — สร้างที่หลังบ้านก่อน"* beats an empty box on day one **and** on the day the owner
archives the last item — and an empty dropdown with no words is indistinguishable from a broken endpoint at any
time. Cheap now, expensive after he sees a blank control. **Added to TASK-226.**

> **Your second note — INCOME items that are not customer-facing will appear.** ✅ Correct to stop. I ruled on
> *source*; a second axis (a metadata flag, a name convention) is a different decision and inventing one would be
> the exact guess this task removes. **Named for @Porter as a decision rather than left as a discovery** — if the
> owner's backoffice carries INCOME rows nobody should charge a customer for, that is a REQ, not a predicate.

**Status → DONE. 🔴 @Fern is unblocked on TASK-226.**
