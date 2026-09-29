# TASK-494 — pin that a migration's `when` can never sit below the ledger's newest row — BE, XS

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-26) · **Size XS.** No migration. Closes the `sid` ledger investigation with a guard instead of a memory.

## §0 Why this exists — the evidence the owner produced
The owner ran the read-only count on both boxes:
- **`sid`:** 97 rows · 97 distinct hashes · min `1782154751279` · **max `1783000000052`**
- **`uat`:** 78 rows · 78 distinct hashes · min `1782154751279` · **max `1783000000052`**

**What that settles:** no duplicates anywhere (count = distinct), and **the newest ledger row on both boxes is `0056`'s own `when`** — so the surplus rows are pre-split history with **real** timestamps (`1782…`), all of them **below** our hand-assigned `1783…` series. 📌 **My hypothesis was wrong in the useful direction:** I thought the extra rows might be the backoffice repo's, carried across and *newer* than ours, which would have made every future migration skip in silence. They are older. **There is no live hazard on either box, and `0057`'s `when` is `…053`, above the newest row — I have checked.**

## §1 🔴 But the safety is currently an accident of how we number
Drizzle decides what to apply by comparing **one number — the newest `created_at` in the ledger — against each migration's `when`**, never by hash. **Everything above holds only because our hand-assigned `1783…` series happens to sit above the real timestamps in those rows.** Nothing in the repo enforces it. One migration generated with a real `Date.now()` (which is drizzle's own default) would land at `1790…`, and **every migration after it would be skipped in silence, with exit 0** — the TASK-085 failure mode, which is the most expensive class of bug this project has had.

## §2 Build — a test, nothing else
- Read the real `drizzle/meta/_journal.json` and assert:
  1. every `when` is **strictly greater** than the previous one (in journal order);
  2. every `when` is in **our assigned series** (`1783000000000`-ish, above the highest real timestamp we have seen in a ledger: `1782154751279`) — pin that bound **with the owner's measurement quoted as the reason**;
  3. the **count of tags equals the count of `.sql` files** — if that is already pinned elsewhere, say where and do not duplicate it.
- ⚠️ **Make the failure message teach.** Whoever trips this will be adding a migration and will not know why a number matters: the message must say **that drizzle compares one number and skips silently**, not just "when out of range".
- 🚫 No change to any migration, to `drizzle.config.ts`, or to the ledger scripts.
- 📌 **Say whether `db:generate` can be made to produce a `when` in our series automatically.** If it can, that is a better long-term answer than a test that catches it afterwards — **tell me, do not build it in this task.**

## Definition of Done
- [ ] The three assertions over the REAL journal · the bound justified with the owner's measured `max`/`min` quoted · a failure message that explains the silent-skip mechanism · the existing count invariant referenced rather than duplicated · a recommendation on `db:generate` · suite **count** · tsc 0 · 58 = 58 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation giving a migration a real `Date.now()`-shaped `when` and one that makes two tags share a `when` · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason → @Sober (2026-09-26) — `src/lib/migration-when-series.test.ts`: strictly increasing, in our series from 0004, tied to the owner's measured max; the message teaches the mechanism. 3205 pass / 0 fail · tsc 0 · 58 = 58 · 4/4 mutations bite

**Numbers:** `bun test` **3205 pass / 0 fail**, twice (+5) · `tsc` **0** · **58 = 58**. No migration, no change to `drizzle.config.ts` or the ledger scripts. **Only a test file was added.**

## ⚠️ One premise corrected (read before the bound)
- §2.2 asks for "every `when` in our series … above **the highest real timestamp we have seen in a ledger: `1782154751279`**". **`1782154751279` is the MINIMUM the owner measured, not the highest.** It is also exactly **0000's own `when`**.
- **Our own journal holds three real timestamps above it:** 0001 `1782743601027`, 0002 `1782743623109`, 0003 `1782747790472`. The series starts at **0004** (`1783000000000`).
- So **"every `when` in the series" is literally false for 0000–0003**, and the test states the rule as: **from 0004 on, every `when` is in `[1783000000000, 1783001000000)`**, with **the four pre-series entries frozen by value as history**.
- **What the measurement does NOT tell us: the highest real timestamp among the 40 / 21 surplus ledger rows.** We only know min and max, and the max is ours (0056). The safety argument doesn't need it: those rows are all ≤ `1783000000052`, and every later `when` is pinned above that.

## The mechanism, confirmed from the installed source (not from memory)
- **`drizzle-orm` `pg-core/dialect.js`:** `select … order by created_at desc limit 1`, then `if (!lastDbMigration || Number(lastDbMigration.created_at) < migration.folderMillis)` applies, **else skips, silently**. `folderMillis` is the journal's `when` (`migrator.js`).
- **`drizzle-kit` `bin.cjs`, `generate`:** `journal.entries.push({ idx, version, when: +new Date(), tag, breakpoints })`. **Every `db:generate` writes a real clock stamp** (today ~`1790…`), with **no flag or config to change it**.

## The test: four assertions over the REAL journal
1. **Strictly increasing** in journal order: an equal or lower `when` is skipped on any box that has the one before it.
2. **From 0004, in our series** `[1783000000000, 1783001000000)`. That is a million migrations of headroom, far below any real clock of this era, so a `Date.now()`-shaped `when` is refused.
3. **The four pre-series entries frozen by value** (tag + `when`), each below the series start.
4. **Tied to the owner's measurement:** 0056's `when` **is** `1783000000052`, the newest ledger row on sid AND uat (quoted in the header with the full counts), and **every later migration is above it**.
- The count (files = tags) is **referenced, not duplicated**: already pinned as 58 = 58 in the census tests (`camp-day-rate-req104.test.ts`, `booking-rental-row-req091.test.ts`, and a dozen others).

## 🔑 The failure message teaches
On any violation the test throws, not a bare `expect`. The message says:
- that drizzle applies a migration **only if its `when` is GREATER than the newest ledger `created_at`, and SKIPS everything else in silence, exit 0 (TASK-085)**;
- that `drizzle-kit generate` always writes a real `Date.now()` (~`1790…`), which would make **every later** migration skip forever;
- **the fix:** the previous entry's `when` + 1;
- **each offending entry, with the exact value to set** ("`0057_…: when 1790467200000 is outside our series → set it to 1783000000053`").

A fifth test pins that the message says this.

## 📌 Can `db:generate` emit a `when` in our series? **Not by configuration. Yes by a wrapper script. I did not build it.**
- `drizzle-kit` hardcodes `when: +new Date()`: no option in `drizzle.config.ts` and no CLI flag (`--prefix` only changes the FILE name).
- **Recommended, as its own small task:** make `db:generate` = `drizzle-kit generate && bun run scripts/journal-series.ts`. The script rewrites **only the newest journal entry's** `when` to the previous + 1 when it is outside the series, and prints what it changed.
  - This test stays as the backstop, for hand-written migrations and for anyone who runs `drizzle-kit generate` directly.
- 📌 **Worth knowing: today EVERY `db:generate` produces the hazard.** The series has survived because every migration since 0004 had its `when` set by hand. This test is the first thing that notices when someone forgets.

## Break-and-watch: `mut494.mjs`, 4 mutations on the REAL journal, **4 bite**
`BASELINE=38` (this file, `migration-witness`, `migrate-through-plan`), read off a real run. `finally` + sha-256 restore, byte-identical. **CHECKSUM `c2e77522…` identical before and after.**
- **A — 0057 generated with a real `Date.now()`** (`1790467200000`): **bites, 1 fail** (the series).
- **B — two tags share a `when`** (0057 given 0056's `…052`): **bites, 2 fail** (increasing, and the measured max).
- **C — 0057 below the ledger's newest row** (`…050`): **bites, 2 fail**.
- **D — a mid-series entry (0030) set to `Date.now()`**, so every later one sits below it: **bites, 2 fail** (increasing and series).

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-26)
Re-run by me, twice: **3205 pass / 0 fail** · tsc 0 · 58 = 58.

🔴 **He confirmed the mechanism from the installed source, and it is worse than I wrote it: `drizzle-kit generate` hardcodes `when: +new Date()`, so EVERY `db:generate` creates the hazard.** I had described it as something that *could* happen if someone generated a migration the default way. It is what the tool does **every time**, and our safety has been a person remembering to renumber. **That is not a latent risk; it is a live one that we have been getting right by hand.**
📌 **And the test now stands between us and the most expensive bug this project has had** — a migration that skips in silence with exit 0.

✅ **My premise was wrong and he corrected it:** `1782154751279` is the measured **MIN** (and `0000`'s own `when`), not the highest real stamp. `0001`–`0003` are real stamps above it, so "every `when` is in the series" holds only **from `0004`** — and those four are frozen by value instead of being forced into a rule they never followed. 📌 **He also noticed the argument does not need the surplus rows' highest stamp at all**, since all of them are ≤ `0056`'s. **Declining to assert something we cannot measure, while showing the conclusion holds without it, is exactly right** — I had quoted a number as a bound without checking which end of the range it was.
✅ **The failure message explains the silent skip and gives the exact value to set** — the point of the guard is the person who trips it, and they will be mid-task and unaware that a number matters.
✅ **The count invariant is referenced, not duplicated.**

## ▶️ Ruling on his recommendation: **yes, its own small task — and I want it.**
`db:generate` is not configurable, so he proposes a wrapper that renumbers only the newest entry to *previous + 1*. **Cut it (TASK-495, XS).** The test catches the mistake **after** it is made, at the cost of a confusing moment for whoever hits it; the wrapper stops it being made. **Both, not one:** the wrapper prevents the common case, the test catches the uncommon one (a hand-edited journal, a merge).
