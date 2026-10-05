# TASK-655 — BE: **the migration ledger accepts EITHER line ending (guard) · `drizzle/*.sql` pinned to LF (fix)** — tooling, Team A
**From @Sober to @Jason.** ⚖️ **Owner APPROVED both, 2026-10-06 ("ตามแนะนำ ทำเลย"), via @Porter — ship them TOGETHER.** **Background and the evidence: `SYSTEM-FACTS.md` → "Migration ledger: ONE migration, TWO fingerprints"; `DATA-REQUEST-ledger-read-2026-10-06.md`.**
✅ **Claim:** `scripts/verify-migrations.ts` · `scripts/seed-ledger-from-schema.ts` · `src/lib/migration-ledger.ts` + `migration-ledger.test.ts` · a NEW `.gitattributes` at the back repo root (one line). 🚫 **Nothing else.**
🔴 **GIT IS THE OWNER'S: you WRITE the `.gitattributes` line; you do NOT commit it, and you run no git command that writes (no `add --renormalize`, no `checkout`).** **The owner commits it and refreshes his own working copies.**
🔴 **NO LEDGER ROW IS DELETED, BY ANYONE, EVER.** The 48 / 21 doubles stay; this task makes them harmless.
⚠️ **No database anywhere — the DB-unreachable run only.** 📌 **Do not write "root cause confirmed" anywhere: it is "confirmed on every count and ONE pair of 69" until the raw rows are matched.**

---

## 1. Why
**The ledger fingerprint is sha256 of the `.sql` TEXT.** **The repo stores LF; a Windows checkout has CRLF** ⇒ every migration has TWO fingerprints. **`db:verify` hashes the file on the MACHINE RUNNING IT** and asks whether that one fingerprint is in the ledger ⇒ **a migration recorded under the OTHER ending reads MISSING ⇒ RED**, and `seed-ledger` "repairs" it by adding a second row. **sid went RED with 48 doubles; uat GREEN with 21 — what decides it is the running machine's ending, not the count.**
🔑 **It never makes drizzle skip anything** (drizzle decides by the newest `created_at`; both rows of a pair share one). **A RED of this kind is ledger-only.**

## 2. ▶️ The GUARD — every comparison accepts either fingerprint
- **One helper in `migration-ledger.ts`:** from a file's text, BOTH fingerprints — **normalise to LF first** (`\r\n` → `\n`), hash that; then the CRLF form of the normalised text, hash that. 🔑 **Normalise before hashing, so a file with MIXED endings still yields exactly the two fingerprints drizzle could have written.**
- **`OwnMigration` carries both** (or a set) — 🚫 not a second parallel list that can drift.
- **`missingMigrations`: a migration is missing only if NEITHER fingerprint is in the ledger.**
- 🔴 **`verify-migrations.ts`'s `ledgerLies` must use the SAME rule** — today it looks up ONE hash (`hashOf`). **If you fix `missing` and leave `ledgerLies`, a migration recorded under the other ending with its schema ABSENT is NOT flagged — the dangerous case goes silent.** **Both checks, one helper.**
- **`attributeLedger` and `seed-ledger`'s "already present": either fingerprint counts as present.** ⇒ **the seed stops adding doubles.** **When the seed DOES insert, it writes the LF fingerprint** (the one every machine produces after the pin). **State that choice in the code.**
- ✅ **Unchanged:** the legacy tag-as-hash rule (`via: "legacy-tag"`), `--through` scoping, the schema-witness half, and every message's meaning.

## 3. ▶️ The FIX — one line, the owner commits it
**Back repo root `.gitattributes`:**
```
drizzle/*.sql text eol=lf
```
**Scoped to that folder ONLY** — 🚫 never repo-wide (we refused that before). 📌 **The repo already stores these files LF, so no committed content changes; only a Windows working copy starts matching the server — AFTER the owner refreshes those files.** **Say that in your report so he knows the pin is inert on an existing checkout until then — and that the guard covers the gap meanwhile.**

## 4. 🔴 The test that must exist — @Porter's condition, and the point of the task
**"A test must prove the guard accepts a row written under the OTHER ending, or we have fixed today's symptom and kept tomorrow's."**
- **Build both texts IN MEMORY** — 🚫 never depend on how this machine checked the files out (that is the very thing that varies).
- **Value tests:** a ledger holding ONLY the CRLF fingerprint ⇒ not missing · ONLY the LF ⇒ not missing · BOTH ⇒ not missing and counted once · NEITHER ⇒ missing · a schema-absent migration recorded under the OTHER ending ⇒ **flagged as a ledger lie** · the seed with the other ending present ⇒ inserts NOTHING · a mixed-ending file ⇒ the same two fingerprints as its clean forms.
- **A pin on real data:** `0011_freelance_budgets` ⇒ LF `119846e1a44b…`, CRLF `5f7e19afaf0c…` (the pair the owner's read found on BOTH boxes).
- 🔑 **Fail-before / pass-after:** the "only the other ending" case must FAIL on today's code. **Say in the report that you saw it fail first.**

## 5. ✅ Done means
1. **`tsc` · the DB-unreachable suite with COUNTS · `65 = 65` (no migration).**
2. **Mutations, filed, test list IN the file:** revert `missingMigrations` to one fingerprint (BITES) · revert `ledgerLies` alone to one fingerprint (BITES — 🔴 the silent case) · seed counts only one fingerprint as present (BITES) · drop the LF normalisation before hashing (BITES on the mixed-ending case) · the seed writes the CRLF fingerprint (BITES).
3. **The `.gitattributes` line written, uncommitted, and named in the report as the owner's to commit.**
4. 🚫 **No ledger row touched; no script run against any database.**

## 6. 🚫 Not in this task
Deleting or merging doubles · any `drizzle-kit` change · `migrate-through.ts` beyond what the shared helper changes for free (if it compares hashes on its own, LIST it for me, don't fix it) · a repo-wide `.gitattributes`.

## ✅ 2026-10-06 — @Jason: DONE — the guard, the pin, and the fail-before I watched
**`tsc` 0 · 65 .sql = 65 journal tags (no migration) · 🚫 no database touched, no script run, no ledger row changed.**
**Set: `src/lib/migration-ledger-eol-task655.mutations.json` — 7 / 7 BITE**, baseline 50, CHECKSUM identical, test list in the file.
⚠️ **Suite: 3989 pass · 5 fail — and the five are NOT mine.** See the last section; I have not touched those files.

### §2 — the guard: ONE helper, ONE predicate, every comparison
- **`migrationFingerprints(text)` ⇒ `{ lf, crlf, all }`** — **normalised to LF first**, then the CRLF form derived from the normalised text. ⇒ **a MIXED-ending file still yields exactly the two fingerprints drizzle could have written** (hashing the raw text first gives a third that matches nothing — `E4` and `E6` do that and both bite).
- **`OwnMigration.hashes`** carries both, built from the same text as `hash` — 🚫 not a parallel list that can drift.
- **`isRecorded(m, present)` is THE predicate**, and all three comparisons ask it: `missingMigrations`, `verify`'s **`ledgerLies`**, and the seed's "already present". 🔴 **`E2` makes `isRecorded` answer on one fingerprint and it bites — that is the silent case you named: fix `missing`, leave `ledgerLies`, and a migration recorded under the other ending with its schema ABSENT stops being flagged at all.**
- **`attributeLedger`** maps EVERY fingerprint to its tag (`E7`: a row under the other ending is called foreign and never copied — bites).
- **The seed writes the LF fingerprint**, with the reason at the line: it is the one every machine produces once the pin is in effect. (`E5` writes CRLF — bites.)
- ✅ **Unchanged: the legacy tag-as-hash rule, `--through` scoping, the schema-witness half, every message's meaning.**

### §4 — the test, and the fail-before
**Both texts are built IN MEMORY** — how this machine checked the files out is the very thing that varies.
**Cases: only CRLF ⇒ not missing · only LF ⇒ not missing · both ⇒ not missing · neither ⇒ missing · the legacy tag ⇒ still answers · a schema-absent migration under the other ending ⇒ flagged (the `ledgerLies` rule) · the seed with the other ending present ⇒ inserts nothing · a mixed file ⇒ the same two fingerprints and no third · a file with no line breaks ⇒ ONE fingerprint, not a duplicated pair.**
📌 **Real data pinned: `0011_freelance_budgets` ⇒ LF `119846e1a44b…`, CRLF `5f7e19afaf0c…` — I computed both from the repo file and they match the owner's read on both boxes exactly.**
🔑 **FAIL-BEFORE, watched, not assumed:** I reverted `missingMigrations` to the single-fingerprint rule and ran the file — **"a ledger holding ONLY the OTHER ending ⇒ NOT missing" FAILED**, 27 pass / 1 fail; restored, 28 / 0. **The mutation run says the same thing afterwards (`E1`), but I saw it fail first.**

### §3 — the pin, and what it does NOT do yet
**`.gitattributes` at the back repo root, ONE line: `drizzle/*.sql text eol=lf`.** 🚫 **Scoped to that folder only, never repo-wide.**
🔴 **It is WRITTEN and UNCOMMITTED. Git is the owner's: I ran no writing git command — no `add`, no `--renormalize`, no `checkout`.**
⚠️ **For the owner, plainly: the repo already stores these files LF, so committing it changes no content. It is INERT on an existing Windows checkout until those files are refreshed** (his `git add --renormalize` / re-checkout) — **until then a Windows box still hashes CRLF, and it is the GUARD that keeps verify green meanwhile.** 📌 **A test pins that the line is exactly that one line and nothing wider.**

### ⚠️ Two things LISTED, not fixed
1. **`scripts/migrate-preflight.ts` still compares ONE fingerprint** (`missingMigrations(mine, …)` with a single-hash `OwnMigration`). **It is not in the claim, so I left it — and I made `hashes` OPTIONAL precisely so it keeps compiling and keeps TODAY's behaviour rather than being changed from outside its claim.** 🔑 **Same class as `ledgerLies`: on a Windows box its "pending" list can name a migration that is already applied.** ▶️ **Yours to claim; it is one line once you do.** 📌 **There is no `scripts/migrate-through.ts` in this repo — nothing else compares hashes on its own.**
2. ⚠️ **Mutations `E3` and `E5` SURVIVED the first run** — nothing imports `seed-ledger-from-schema.ts` (it opens a connection at the top level), so pinning the predicate proved the RULE and not that the seed ASKS it. 🔑 ***A shared helper is only shared where somebody calls it, and a test of the helper cannot see the call.*** ⇒ **source pins added for both scripts; both now bite.** **The same reasoning is why `verify`'s half is pinned at source too.**
⚠️ **And one of my own: `E4`/`E6` were written with REAL control characters where the source has the literal two-character `\r\n` text, so they matched nothing. `TASK-627`'s integrity test caught it BEFORE the set was ever run — third time it has paid for itself.**

### 🔴 NOT MINE — five RED tests in the shared tree, and the batch is about to ship
**`src/lib/camp-on-grid-req095-11.test.ts` (4) and the camp day-rate file (1) are FAILING on this tree.** **The camp week-day SYNC inserts and deletes NOTHING** (`{ inserted: 2, deleted: 1 }` ⇒ `{ 0, 0 }`) **and its clash no longer raises `SLOT_TAKEN`.**
✅ **Not caused by me, checked rather than assumed:** my working tree holds only the ledger files, `.gitattributes` and the new set; **the failures persist with `.gitattributes` moved aside**; and they are in files I have never opened. **They were green at `3916 · 0 fail` when I reported `TASK-645`, and the commits since are `2384916 "Refactor phone validation and student search logic"` and `feb01ae` (my comment).** 🚫 **I have not touched them and will not — not my claim.** ▶️ **Telling you at once because the sid batch is otherwise ready and this is a RED in the shared tree.**

## 📌 2026-10-06 — @Sober: VERIFIED (tsc 0 · 65 = 65 · set 7/7 BITE, CHECKSUM identical). Follow-ups granted: `scripts/migrate-preflight.ts` (claimed for Team A, ledger tooling) onto `isRecorded`, then `hashes` required if no caller lacks it, one mutation; soften the seed comment that states the doubles cause as fact. Suite 3989/5 — the 5 are a Team B camp DATE BOMB (literal 2026-10-05 vs a past-day skip), not this task.

## ✅ 2026-10-06 — @Jason: both follow-ups DONE
**`tsc` 0 · 65 = 65 · suite 3990 pass · 5 fail (the camp DATE BOMB you diagnosed — not mine, untouched).** **Set now 8 / 8 BITE, baseline 71, CHECKSUM identical, every restore byte-identical.**

### ▶️ 1. `migrate-preflight.ts` — on the same predicate, and `hashes` is now REQUIRED
- **It builds both fingerprints and asks `missingMigrations`/`isRecorded` like `verify` and the seed.** 🔑 **Written at the line: preflight and verify must mean ONE thing by "pending", and this is the script that decides whether a deploy goes ahead.**
- ✅ **`hashes` is REQUIRED on `OwnMigration`** — nothing builds a single-hash one any more. 🔑 **Your sentence is in the type's doc: *an optional field that every caller fills is a trap for the next caller who does not.*** ⇒ **the compiler is now what stops a FOURTH comparison being written on one fingerprint.**
- ⚠️ **The test that pinned the OLD fallback is RETIRED with its reason, not deleted** — and what replaces it is stronger than an assertion: a `@ts-expect-error` on an `OwnMigration` built without `hashes`. **If omitting it ever stops being a compile error, this file stops compiling.**
- **`E8`: preflight on one fingerprint ⇒ BITES.** 📌 **Caught by a SOURCE pin — nothing imports that script either, the same reason `E3`/`E5` needed one.**

### ▶️ 2. The seed's comment — softened to what the evidence says
**Now:** the single-fingerprint check is **ONE way** a migration gains a second row, and it no longer does. 🚫 **It is NOT established as the source of the 48 / 21** — the read is confirmed on every count and ONE pair of 69, not row by row, **and a Windows-run `migrate` writes the other ending too, not only the seed.** ✅ **`E3`'s description in the set is softened the same way.** 🔑 **Your rule, written at the line: *a code comment outlives the evidence it was written on; it must not claim more than that evidence.***

### ⚠️ One more of my own, worth the line
**`E2` and `E7` ROTTED the moment `hashes` became required — they anchored on the `?? [m.hash]` fallback I had just removed.** 🔴 **The mutation RUNNER did not complain; `TASK-627`'s integrity test is what caught it.** 🔑 **A set can be stale in a way that only shows as a mutation quietly not applying — which is indistinguishable, in the run's own output, from a mutation that applied and was caught.** **Re-anchored; both bite.**

## ✅ 2026-10-06 — @Sober: DONE · VERIFIED (follow-ups in: preflight on `isRecorded`, `hashes` required, seed comment softened). tsc 0 · 65=65 · suite 3990/5 (Team B camp date bomb, unrelated) · set 8/8 BITE, CHECKSUM identical. READY reported to Porter. `.gitattributes` uncommitted — the owner commits.
