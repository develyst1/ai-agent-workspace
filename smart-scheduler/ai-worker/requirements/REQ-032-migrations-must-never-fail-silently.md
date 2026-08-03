# REQ-032: A migration must never be skipped silently — and the two repos must stop sharing one ledger

- Status: READY_FOR_SA
- Priority: 🔴 **HIGHEST — this is the only item that must be finished before anything is deployed to production**
- Requested: 2026-08-02 by the project owner
- Deadline: before go-live **2026-08-20**, and before **any** production deploy
- Source: owner, after the second `sid` outage in two days:
  > *"ไม่ด่วน ทำความเข้าใจว่าปัญหาเกิดจากอะไร แล้วแก้ให้ไม่เกิดขึ้นอีก แบบนี้ไปเกิดที่ production ไม่ได้เด็ดขาด"*

## What happened (twice, in two days)

| | |
|---|---|
| **2026-08-01** | `bo.item.external_ref` missing → every `bo` query 500s → `GET /teachers` dead → frontoffice unusable |
| **2026-08-02** | `teacher_link_requests` + `subjects.price_group` missing → calendar, bookings and teachers all 500 |

Both times: **the new code was deployed, the migration was not applied, and nothing said so.** On 2026-08-02
`bun run db:migrate` **completed successfully and applied nothing.**

## Root cause — three layers, all confirmed by measurement

### Layer 1 — the two backends share ONE migrations ledger
Neither `drizzle.config.ts` sets `migrationsTable` / `migrationsSchema`, so `smart-scheduler-back` and
`smart-scheduler-backoffice-back` both use the default `drizzle.__drizzle_migrations` **in the same database**.
Each repo owns a different schema (`public` vs `bo`) but they write their history to the same table.

### Layer 2 — the migrator applies only what is NEWER than the last recorded entry
From the deployed migrator itself:
```js
const last = (await db.all(sql`select … from __drizzle_migrations order by created_at desc limit 1`))[0];
for (const m of migrations) if (!last || Number(last.created_at) < m.folderMillis) { …apply… }
```
It assumes **one linear history**. With two repos writing to one table, that assumption is false.

### Layer 3 — the `when` values are hand-authored and were never coordinated
Because `db:generate` is unusable in both repos (incomplete snapshot chains — the TASK-042 finding), journal
entries are **written by hand**, so `when` is invented rather than generated. Two independent invented series
ended up in one shared ledger:

| Repo | series | newest |
|---|---|---|
| `smart-scheduler-back` | synthetic `1783000000001…013` | **1783000000013** |
| `smart-scheduler-backoffice-back` | real epoch ms | **1785542400000** |

**Applying backoffice `0005` on 2026-08-01 stamped the shared ledger with a timestamp later than EVERY
scheduling migration.** From that moment, scheduling's migrator finds `last.created_at > folderMillis` for all
of them and applies nothing — **silently, exit code 0.**

> **Yesterday's fix is the direct cause of today's outage**, and the two are only connected through a table
> neither repo knows it is sharing.

### 🔴 The part that makes this urgent rather than embarrassing

**`smart-scheduler-back` can no longer apply ANY migration, on any environment, ever** — not until its `when`
values exceed backoffice's. This is not a transient state; it is now the permanent behaviour.

**And production has never had these migrations either.** `frontoffice.develyst.online` is running a build from
around 2026-07-18. When it is eventually updated it will meet **the same shared ledger and the same silent
skip** — except there it is real customers, real bookings and real money. **This defect is not a `sid` problem
that happened to appear twice; it is a production defect that `sid` found for us.**

## Requirement

1. **A migration that does not apply must fail loudly.** A deploy step that cannot fail visibly is not a
   control. Success must mean *"the schema is now what this build expects"*, not *"the command returned 0"*.
2. **Each repo must own its migration history**, so applying a migration in one can never affect the other.
3. **Adopting the fix must not re-run or skip what is already applied.** A fresh ledger would believe nothing
   has run and try to replay from `0000`; the current shared ledger no longer accurately describes either repo.
   **This is the delicate part and it is why this is a design task, not an edit.**
4. **The application should refuse to serve — or at least complain unmistakably — when the database is behind
   the code.** Today the first symptom is a customer-facing 500 on an unrelated screen (`GET /teachers` died
   because of a *finance* column). Failing at startup would have turned both outages into a failed deploy.
5. The fix must work for **an operator who is not an engineer** — the owner deploys, and she must be able to
   tell whether a migration landed **without reading Postgres error text**.

## Acceptance Criteria

- [ ] Applying a migration in one repo has **no effect** on the other repo's ability to migrate.
- [ ] A skipped or failed migration produces a **clear, unmissable failure** — non-zero exit and a plain
      statement of what is missing.
- [ ] After the fix, migrations already applied are **not re-run**, and pending ones **do** run.
- [ ] Starting the API against a database that is behind the code fails or warns unmistakably — **it does not
      start up healthy and 500 on the first user request.**
- [ ] `smart-scheduler-back` can apply a new migration again (today it cannot, at all).
- [ ] There is a way for the owner to answer *"did the migration land?"* in one step, with a yes/no answer.

## Constraints

- **Never run raw SQL against a live database as the fix.** The whole point is a procedure the owner can run.
- Both `sid` and production must end up consistent — **production has NOT had 0015–0017**, and its state must be
  established rather than assumed.
- The 2026-08-02 batch (`0015`, `0016`, `0017`) is still unapplied on `sid`; the site is broken there and
  **the owner has explicitly said this is not urgent** — do it properly rather than quickly.
- HOW (per-repo `migrationsTable`, a verification step, a startup schema check, or something better) is the
  SA's design.

## Out of Scope

- The `db:generate` snapshot-chain problem itself (TASK-042's finding). It is *why* `when` is hand-authored,
  so it is related — but fixing it is not required to stop the silent skip.

## Questions

1. **Should the API refuse to start when the schema is behind, or start and warn?** *(Porter's lean: refuse.
   Both outages presented as 500s on screens unrelated to the change — a finance column killed the teacher list.
   A process that will not start is diagnosable in seconds; a process that starts and fails per-request is what
   we have been debugging from stack traces for two days. But it is a real trade-off — a strict check that is
   wrong takes the app down by itself, so this is the SA's call.)*
2. **What is production's actual migration state?** Nobody knows, and it must be established — **not guessed** —
   before it is ever migrated. This likely needs a read-only DATA REQUEST to the owner.
3. **Is there a third consumer of that shared table** we have not noticed? Two were found by accident; the
   question is whether anyone has checked.

---

## 🔻 CORRECTION 2026-08-02 — my timeline was WRONG, and it changes the conclusion

I wrote, in this REQ, on the board, and to the owner:

> ~~*"Yesterday's fix is the direct cause of today's outage."*~~ **This is false.**

**Jason re-derived it from the journals and corrected me.** Backoffice `0003` / `0004` are
**1784531451038 / 1784531451039** — **already above scheduling's entire journal** (max **1783000000013**)
**before `0005` existed.** So the wall went up the moment **backoffice's `db:migrate` first ran against this
database — the REQ-006 `bo` rebuild** — not with yesterday's fix. `0005` raised the bar further; it did not
create it.

**Why the correction matters more than the blame it removes:**
**scheduling's migrations have been silently un-appliable for far longer than a day.** Every scheduling
migration since the REQ-006 rebuild may or may not have landed, and `db:migrate` would have reported success
either way. ⚠️ **Nobody should assume any environment's schema matches its journal** — including production,
which has never been checked. That is what the new `db:verify` is for, and running it is now the first thing
worth doing anywhere.

**I built a causal story from two data points I had in front of me and stopped looking** — I compared
scheduling's newest against backoffice's newest, found the inversion, and never checked whether an *earlier*
backoffice row already cleared the bar. The measurement was right; the conclusion drawn from it was not.
