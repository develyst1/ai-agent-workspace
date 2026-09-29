# TASK-459 — 🔴 BLOCKS `sid`: `0052`'s witness is unobservable since `0053` dropped the table it probes, so the ledger seeder calls it **not-applied** and would RE-CREATE the retired rates table — re-point it as INHERITED, and add the rule that makes this class impossible — BE, S

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-24) · **Size S.** No migration (55 = 55). **Nothing deploys until this is in.**

## §0 What the owner hit on `sid` (Porter, 09-24)
`db:migrate` applied `0053` + `0054`, then verify went red (the TASK-085 ledger gap for 0049–0052). `db:seed-ledger --dry-run`: 54 applied · 🔴 **`0052_camp_day_rates` not-applied — witness `table public.camp_week_day_rates exists → found=false`** · *"After seeding, db:migrate would apply: 0052"*. But **0052 DID run on `sid` on 09-22** — and **TASK-454's `0053` dropped that table on purpose** (the merge into `camp_week_day_teachers`). Applying it now would re-create the retired table: two stores for one fact, which is the exact thing the merge removed. Porter stopped the `--apply`. He was right to.

## §1 My miss, so it is on the record
I confirmed TASK-454's merge without asking **whose witness that table was**. The merge itself is sound; the hole is that a dropped object was another migration's only proof of having run. `0002` already carries the pattern for this (its index is replaced by `0007`, so its verdict is *inherited from 0007 — own effect no longer observable*, with the ⚠️ that re-running it would REGRESS the later one).

## §2 Build
1. **Re-point `0052`'s witness to INHERITED from `0053`**, in `0002`'s exact shape and with the same warning spelled out: 0052's own effect (the `camp_week_day_rates` table) no longer exists once 0053 has merged and dropped it, so it cannot be observed independently; the verdict is inherited; **re-running 0052 would REGRESS 0053** by re-creating the retired table. Say it in the file where the next reader will meet it.
2. 🔑 **The rule that makes the class impossible — this is the real deliverable.** A test that walks the witness table and asserts: **every witness that probes a database object either (a) probes an object the CURRENT schema still declares, or (b) is marked inherited with the tag it inherits from.** A witness pointing at something the schema no longer has is a witness that will one day read `found=false` on a correctly-migrated box — which is precisely this failure. Name in the test WHY: the ledger seeder trusts the witness to decide "applied", so a stale witness does not merely mislead a human, it proposes re-running a migration that would undo a later one.
3. Add the standing instruction to the migration rules the next task will read (the file where the witness conventions live): **any migration that drops or supersedes an object another migration uses as its witness must re-point that witness IN THE SAME TASK.** I will also carry it in SYSTEM-FACTS.
4. Verify by value: `db:seed-ledger --dry-run` logic over a fixture whose 0052 is inherited ⇒ **55 applied / 0 not-applied**, and "would apply: (none)".
- 🚫 No migration, no schema change, no touching 0053/0054.

## Definition of Done
- [ ] 0052 inherited, worded for the next reader · the walk test (both branches, and it FAILS on today's state before the fix — say so) · the standing rule written where migrations are authored · the dry-run verdict by value · suite **count** · tsc 0 · 55 = 55 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM · report here + `inbox/SA.md` + log. Then the owner re-runs: dry-run (expect **55 applied / 0 not-applied**) → `--apply` → `db:migrate` → verify **55**.

---

# ✅ CODE DONE — @Jason → @Sober (2026-09-24) — 0052 inherited; the walk test written FIRST (it failed on today's state, as you asked); 2906 pass / 0 fail; 8/8 mutations bite

**Numbers:** `bun test` **2906 pass / 0 fail**, 224 files (+1: `src/lib/witness-observability-req105.test.ts`, 7 tests) · `tsc --noEmit` **0** · 🚫 **no migration — 55 = 55**, 0053/0054 untouched · 1 pin corrected (my own, below).

## §1 The walk test, written BEFORE the fix — and what it said
As instructed, I wrote the rule first and ran it against today's tree. 🔴 **It failed, naming `0052_camp_day_rates → table camp_week_day_rates`** — the exact entry Porter's dry run stopped on. That is the "it FAILS on today's state before the fix" you asked me to state, and I can state it because it happened in that order.

⚠️ **The first run reported SIX, and five were the CHECKER's fault, not the witnesses'.** I am reporting that because a rule that cries wolf gets deleted by the next person:
- a `pgEnum` is a **FUNCTION** with properties (it is callable, to build columns), so my `typeof === "object"` test skipped every enum and `0032`'s `PAUSED` read as missing;
- four partial indexes (`teachers_calendar_token_uq`, `bookings_camp_week_day_idx`, `bookings_co_student_idx`, `bookings_other_series_idx`) exist **only in the hand-written SQL** and were never declared in `schema.ts` at all — which is legitimate here, because drizzle does not generate this repo's migrations.
⇒ So the rule is the honest one, not the convenient one: **an object still exists if the schema declares it OR no migration has dropped it** (statement-level, comments stripped — a comment mentioning a table is not a statement about it). Only `0052` fails both halves. The test also asserts it is **not vacuous** (every witness is classified; an unknown probe kind fails) and carries a **guard on the guard**: five fabricated stale witnesses — using the REAL objects `0053` dropped, not invented names — must all be caught.

## §2 The fix
`0052` is now `{ kind: "superseded-by", tag: "0053_camp_day_teachers" }`, `rerunnable: **false**`, in `0002`'s exact shape, and its `why` says in the file where the next reader meets it: its own effect cannot be observed once 0053 merged and dropped the table, the verdict is inherited, and ⚠️ **re-running 0052 would REGRESS 0053** by re-creating the retired rates table — two stores for one fact, the exact split the merge removed. 📌 It also states why the OTHER half of 0052 (the `deduction_notified_at` stamp) is still covered: 0053's own witness cannot be satisfied unless 0052 ran, because the backfill READS the rates table.

**By value, the seeder's own logic** over a correctly-migrated box (every probe true except 0052's, which is false — literally `sid`'s state): **55 applied / 0 not-applied**, 0052 reported as `inherited from 0053_camp_day_teachers (own effect no longer observable)` with `found: null` — 🚫 it never reports a probe result it did not take. And it **inherits, it does not assume**: with 0053 itself not applied, 0052 is `needs-human`, never `applied` (mutation E makes it assume — bites).

## §3 🔴 My own pin asserted the defect, and that is the part worth reading
TASK-454's suite contained this line, written by me:
> *"the witness entry stands (a box that has not run 0053 still needs it)"* — asserting `{ kind: "table", table: "camp_week_day_rates" }, rerunnable: true`.
It sounds right. It is not: a witness cannot serve a box that has not run 0053 **if it lies to every box that has** — and every correctly migrated box has. The reassuring half of my own sentence was the wrong half. The pin is corrected in place with that reasoning written beside it, so the next reader meets the correction rather than the claim.
📌 This is why your §1 note matters more than the fix: the merge was reviewed by two of us and neither asked *whose witness that table was*. The walk test is the question being asked automatically from now on.

## §4 The standing rule, where the next author will meet it
`drizzle/README.md` gains a section: **a migration that drops or supersedes an object another migration uses as its witness must re-point that witness IN THE SAME TASK** — with the consequence spelled out (the seeder proposes applying a migration that would undo yours), the three steps (re-point · `rerunnable: false` · say what re-running would REGRESS), the two worked examples (0002 → 0007, 0052 → 0053), and the date it cost a deploy. The last line of that section says the walk test will catch you, **but only after you have already thought about it, which is the wrong order**. Mutation H removes the section and bites.

## Break-and-watch — `mut459.mjs`, 8 mutations, **8 bite** (`try/finally`, sha-256 restore byte-identical, `BASELINE=44`)
A 🔴 the defect restored (0052 probes the dropped table) · B it inherits from the wrong tag · C `rerunnable` true again · D the REGRESS warning dropped · E an inherited verdict ASSUMED when its parent is unjudged · F `found` invented for an inherited entry · G the inherited probe stops describing itself · H the standing rule removed from the README.

## 📦 For the owner, in order
1. `bun run db:seed-ledger --dry-run` → expect **55 applied · 0 not-applied · "would apply: (none)"**.
2. `bun run db:seed-ledger --apply`
3. `bun run db:migrate` → `bun run db:verify` → **55**.
🚫 Nothing else changed; no migration, no schema change, 0053/0054 untouched. ⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-24)
Re-run by me: **2906 pass / 0 fail** · tsc 0 · **55 = 55** · `0052` now `superseded-by 0053_camp_day_teachers` beside `0002`'s own entry · the rule in `drizzle/README.md`.
Four things from this report are worth more than the fix:
1. **He wrote the rule BEFORE the fix and it failed on today's tree, naming `0052 → camp_week_day_rates`** — the exact entry Porter's dry run stopped on. A guard written after the fix only proves the fix; this one proved the bug.
2. 🔑 **The first run cried wolf six times and he fixed the CHECKER, not the witnesses.** Five were his own test's fault — a `pgEnum` is a callable function so his `typeof === "object"` skipped every enum, and four partial indexes live only in hand-written SQL because drizzle does not generate this repo's migrations. The honest rule that came out — *an object exists if the schema declares it **or** no migration has dropped it*, statement-level with comments stripped — is the one that will survive. A rule that cries wolf gets deleted by the next person; he saw that and said so.
3. **The guard on the guard:** five fabricated stale witnesses built from the REAL objects `0053` dropped (not invented names) must all be caught, and every witness must be classified — so the walk cannot pass by ignoring things.
4. 🔴 **He corrected a pin of MINE and quoted it.** TASK-454 carried my line *"the witness entry stands (a box that has not run 0053 still needs it)"* — which sounds right and is not: a witness cannot serve a box that has not run 0053 if it lies to every box that has, and every correctly-migrated box has. The reassuring half of my own sentence was the wrong half. That is the real record of this defect: **the merge was reviewed by two of us and neither asked whose witness that table was.**
Also right: an inherited verdict **inherits, it never assumes** — with 0053 unapplied, 0052 reads `needs-human`, and `found` is `null` rather than a probe result never taken.
