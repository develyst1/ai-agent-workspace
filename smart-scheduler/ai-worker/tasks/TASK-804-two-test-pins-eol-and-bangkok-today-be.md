# TASK-804 — BE (test-only): **two red pins on the committed tree, neither a product defect** — 803's "generated" pin vs Windows line endings · TASK-445's camp test vs the Bangkok clock after midnight — @Jason (XS ≈ 1 h incl. +10 percent)
**From @Sober to @Jason, 2026-10-13.** @Porter / @Silver: the committed back `ec820c5` is red in a SAFE run. **Diagnosed by me on a clean copy of `ec820c5`: `4668 pass · 3 fail`** — 1 in `area-english-overrides-task803.test.ts`, 2 in `camp-week-500-family-dedupe-req104.test.ts`. **No product change, no redeploy:** sid and uat run the right data and the right code.
✅ **Claim (Team A):** back `src/lib/area-english-overrides-task803.test.ts` · `src/lib/camp-week-500-family-dedupe-req104.test.ts` (TASK-445, ours). 🚫 **Team B's open TASK-737 files** (`openapi/document.ts`, `routes/api.ts`, `types/contract.ts`, `validation.ts`, the `daily-report*` files) — do not touch; run your numbers in a clean room.

## 1 · 803 "GENERATED, not typed … the SAME bytes" — a line-ending artefact
- The pin hashes the override file **as it sits on disk** and compares it with the generator's fresh output.
- **The COMMITTED blob is exactly the generator's output:** `git cat-file -p ec820c5:src/data/thai-geography.en-overrides.json` ⇒ **197,354 B · SHA-256 `82ffa69e…`** = the regenerated file's hash. ✅ **The data is right.**
- **On disk it is `99b6a330…`, 201,437 B:** this checkout has `core.autocrlf=true`, so Git writes the file out with CRLF line endings. Strip the CRs and it hashes to `82ffa69e…` again. It passed when you ran it, because the file on disk was then the one the generator had just written (LF).
- **Fix:** compare **content with line endings normalised** (`\r\n` → `\n` on both sides before hashing). That keeps the pin's meaning — generated, not typed — on any checkout.
- *(Optional, the owner's git, NOT this task: a `.gitattributes` line `src/data/*.json -text` would keep these files byte-exact on disk too. Say so in your report; do not add it.)*

## 2 · TASK-445's camp test — red between 00:00 and 07:00 Bangkok
- The test computes `TODAY = fmtDate(new Date())` with the **process's local clock**; the service decides "today" with **`bangkokNow()`**. On this box the process clock is UTC (the test's comment assumes local = Bangkok), so **from midnight to 07:00 Bangkok the two dates differ**: the test builds its camp day for 2026-10-12, the service calls that day past and derives nothing ⇒ `null` instead of the 409, and the root-app test hits `Invalid Date`.
- Seen by me at 00:04 on 2026-10-13: expected `วันที่ 2026-10-12 …`, the service on 2026-10-13. **Pre-existing (TASK-445, 2026-09-22), nothing to do with 803.**
- **Fix:** take `TODAY` from the service's own clock (`bangkokNow().date`), so the test and the service always agree on the date.
- **Prove it:** run the file with the clock in the window (e.g. `TZ=UTC` and a fixed time between 17:00 and 24:00 UTC, i.e. 00:00–07:00 Bangkok, if your runner allows; otherwise say how you proved it).

## ✅ Done means
- Both pins green on a clean copy of `ec820c5` + your 2 files, **including with the file on disk in CRLF** (copy it in as Git writes it) **and inside the midnight–07:00 window**.
- tsc 0 · full suite DB-unreachable, every setting blanked · **counts** · `unhandled-between-tests: 0` · `70 = 70`. Sets `803` 9/9 · `445`'s set if it has one.
- **Test files only** — `git diff` touches nothing else.
**Then:** my verification → owner commit. No redeploy.

---
## ✅ 2026-10-13 — Jason (BE) → @Sober: TASK-804 DONE — both pins fixed, TEST-ONLY (2 files). Nothing committed.
**Files (the only two touched, both claimed in this brief; none of Team B's 737 files):**
- `src/lib/area-english-overrides-task803.test.ts` — the "GENERATED, not typed … SAME bytes" pin now hashes content with `\r\n`→`\n` on BOTH sides (`lf()`), so it holds on a CRLF checkout.
- `src/lib/camp-week-500-family-dedupe-req104.test.ts` — `TODAY = bangkokNow().date` (was `fmtDate(new Date())`, the process clock); import swapped (`fmtDate` out, `bangkokNow` in).
**Proof — clean room of `ec820c5` (git archive + these 2 files, node_modules junction, own git), override file rewritten as CRLF on disk, process clock forced to 03:00 Bangkok 2026-10-13 (= 20:00 UTC 10-12, via a `--preload` that calls `setSystemTime`):**
- OLD camp test in that window: **2 fail** (red, reproduced) · OLD 803 pin on the CRLF file: **1 fail** (red, reproduced).
- NEW both files, same CRLF + same window: **22 pass / 0 fail**.
- Clean room whole: tsc 0 · **suite 4,671 pass / 0 fail** · unhandled-between-tests 0 · migrations 70 = 70 · mutation set 803 **9/9 BITE**, checksum identical. (TASK-445 has no mutation set of its own.)
- Shared-tree `git diff` for my 2 files: 6 + 5 lines, tests only.
- 📌 As you asked, not done: `.gitattributes` `src/data/*.json -text` would keep these data files byte-exact on disk — the owner's git call.
▶️ **Ball: Sober — verify → owner commit. No redeploy.**
