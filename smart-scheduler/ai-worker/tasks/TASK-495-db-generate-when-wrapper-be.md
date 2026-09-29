# TASK-495 — stop `db:generate` creating the silent-skip hazard every single time — BE, XS

**Repo:** `smart-scheduler-back` · **Assignee:** @Jason · **From:** @Sober (2026-09-26) · **Size XS.** No migration. Your recommendation from TASK-494, accepted.

## §0 Why
You confirmed from the installed source that **`drizzle-kit generate` hardcodes `when: +new Date()`**. ⇒ **every `db:generate` produces a `when` around `1790…`, above our whole `1783…` series** — and drizzle applies by comparing **one number** against the ledger's newest row, never by hash. So **every generated migration is one step away from making every later migration skip in silence, with exit 0.**
📌 **We have been getting this right by hand.** TASK-494's test catches the mistake **after** it is made; this stops it being made. **Both, not one** — the wrapper prevents the common case, the test catches a hand-edited journal or a bad merge.

## §1 Build
- A wrapper on `db:generate` that, **after** drizzle has written the journal, renumbers **only the newest entry** to **previous + 1**, and prints what it changed.
- 🔑 **Only the newest, and only when it is out of series.** It must be impossible for this script to touch an entry that has already been applied anywhere — 📌 **a tool that rewrites applied history is a worse hazard than the one it fixes.** Say how you guaranteed that.
- **It must be idempotent**: running it twice changes nothing the second time.
- **If the journal is not in the shape it expects, it must FAIL LOUDLY and change nothing.** A renumbering tool that guesses is not one I want in this repo.
- 🚫 No change to `drizzle.config.ts`, to any migration, or to the ledger scripts. 🚫 It does not touch the database.
- **TASK-494's test stays exactly as it is** — this does not replace it, and say in your report that it still passes on a freshly generated migration.

## Definition of Done
- [ ] `db:generate` produces an in-series `when` with no human step · only the newest entry is ever touched, **applied entries provably out of reach** (say how) · idempotent · an unexpected journal shape fails loudly and writes nothing · TASK-494's guard unchanged and passing · suite **count** · tsc 0 · 58 = 58 · 🔑 Break-and-watch with `BASELINE=`, `finally`, CHECKSUM — include a mutation that lets it renumber an older entry and one that makes it silently "fix" a malformed journal · report here + `inbox/SA.md` + log.

---

# ✅ REPORT — @Jason → @Sober (2026-09-26) — `db:generate` now renumbers the one entry it just created into our series; proven end to end with the real drizzle-kit. 3218 pass / 0 fail · tsc 0 · 58 = 58 · 6/6 mutations bite

**Numbers:** `bun test` **3218 pass / 0 fail**, twice (+12) · `tsc` **0** · **58 = 58**. No migration. `drizzle.config.ts`, every migration and the ledger scripts are untouched, and **TASK-494's test file is untouched and passing**.

## What it is
- **`package.json`:** `"db:generate": "bun run scripts/db-generate.ts"`. Every drizzle-kit flag passes through (`--custom`, `--name`, …).
- **`scripts/db-generate.ts`:** reads the journal **BEFORE** running `drizzle-kit generate`, runs it, then hands **before + after** to the planner. It writes **only** if the planner returned a change, prints `0058_x: when 1790… → 1783000000054`, and on any refusal **exits 1 having written nothing**. It never imports the DB and never reads `DATABASE_URL` or the config (pinned by source).
- **`src/lib/journal-series.ts`:** the pure planner (text in, text out), where the rules live and are tested.

## 🔑 How applied entries are provably out of reach
- **It is only ever handed the entry that `generate` added in THIS run.** Every entry present BEFORE must come back **byte-for-byte identical** (deep compare per entry), or it refuses ("an entry that may be applied is never edited here").
- **An entry that did not exist a second ago cannot have been applied on any box.** So the guarantee comes from construction, not from knowing the ledger. The script never needs the database to be sure.
- **The edit is one value, in place.** It replaces the single `"when": <value>` of that entry (refused unless the text is unambiguous: exactly one occurrence), then re-parses and checks the result equals "the after journal with only that `when` changed". **The file is never re-serialised**, so its CRLF line endings and layout stay byte-identical (pinned).
- **The four pre-series entries** (0000–0003, real clock stamps, *out* of series) are never candidates, and are pinned untouched. **A bad merge that left an existing entry out of series is NOT "fixed"**: the new entry can't follow it, so it refuses and TASK-494's test flags the journal.

## Idempotent, and it never guesses
- **A second run changes nothing,** both against the old journal and against itself. A new entry already in series (hand-numbered) is left alone, and "no new entry" is a no-op.
- **Fails loudly and writes nothing on:** invalid JSON · not a drizzle journal · an `idx` out of place · a tag whose prefix isn't its idx · a non-integer `when` · **two new entries in one run** · entries **removed** · an existing entry **changed** · an empty journal before (no series to follow) · the previous entry itself out of series · an ambiguous `when` text. Each is pinned by message, and every message ends "NOTHING was changed".

## ✅ Proven with the REAL drizzle-kit, not only with fixtures
- I ran `bun run scripts/db-generate.ts --custom --name probe --out ./.genprobe/drizzle` against a **temporary copy** of `drizzle/`:
  - drizzle-kit wrote `0058_probe.sql`, `0058_snapshot.json`, and a journal entry with **`when: 1790405891590`**;
  - the wrapper printed **`0058_probe: when 1790405891590 → 1783000000054`**;
  - **the resulting journal passes TASK-494's rules** (strictly increasing, in series from 0004).
- The copy was deleted afterwards. **The repo's `drizzle/` checksum (`7198834d…`) and the working-tree checksum were identical before and after.**
- **TASK-494's guard stays exactly as it is** and still passes: it is the backstop for hand edits and merges, and this wrapper is the prevention.

## ⚠️ Two things I found doing it: facts, not changes
1. **drizzle-kit can print an error and still exit 0.** My first probe gave it an absolute `--out`, which it joined onto the cwd, and it failed on a missing snapshot, **with exit code 0**. The wrapper then truthfully found "no new entry". **Its message now says that plainly:** "no new entry — no schema change, or generate failed: read its output above". So "nothing to renumber" can't be mistaken for "generate succeeded".
2. 🔴 **`drizzle/meta` holds snapshots only for 0000–0003.** Every migration since 0004 was hand-written without a snapshot. So a plain `db:generate` (a schema diff, not `--custom`) **would diff `schema.ts` against 0003's snapshot and emit a migration re-creating everything since 0004.** The `when` is now safe; **the SQL a diff-mode `generate` would write is not.** `--custom` (an empty file, hand-written) is the mode that matches how this repo actually works, and the one I proved.
   - This is worth a line in whatever tells people how to add a migration. **I didn't touch any snapshot**: regenerating 0058's baseline is a decision, not a fix.

## Break-and-watch: `mut495.mjs`, 6 mutations, **6 bite**
`BASELINE=17` (`journal-series` + `migration-when-series`), read off a real run. `finally` + sha-256 restore, byte-identical. **CHECKSUM `a796c1f7…` identical before and after.**
- **A — it renumbers an OLDER entry** (the first out-of-series one anywhere, i.e. 0001, applied everywhere): **bites, 6 fail**.
- **B — an existing entry changed during generate is let through**: **bites, 1 fail**.
- **C — a malformed journal "fixed" silently** (an idx out of place accepted): **bites, 1 fail**.
- **D — two new entries, the newest renumbered anyway**: **bites, 1 fail**.
- **E — not idempotent** (an in-series entry renumbered again): **bites, 2 fail**.
- **F — the script writes even when nothing changed**: **bites, 1 fail**.

⛔ Only you mark this DONE.

---

# ✅ DONE — REVIEWED by @Sober (2026-09-26)
Verified in the same tree as TASK-492: **3240 pass / 0 fail** (twice) · tsc 0 · 59 = 59.

✅ **"drizzle-kit can error and still exit 0", so the "no new entry" message says so.** That is the right instinct for a tool that edits the journal: **the failure it must survive is not its own, it is the one upstream that looks like success.**
🔴 **The find worth a SYSTEM-FACT: `drizzle/meta` holds snapshots only for `0000`–`0003`**, so a **diff-mode** `db:generate` would try to **re-create every migration from `0004` on**. ⇒ **`--custom` is the mode this repo actually works in**, and nobody had written that down. Anyone reaching for a plain `db:generate` to add a column would have produced a monster of a file and might well have applied it. **He named it and did not touch it, which is correct — it is a decision, not a defect.**
✅ Only the newest entry, provably out of reach of applied history; idempotent; a malformed journal **fails loudly and writes nothing** (two mutations for that case alone).
