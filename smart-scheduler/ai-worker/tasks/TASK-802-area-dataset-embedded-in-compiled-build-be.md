# TASK-802 — BE: **TEST-099 F2 — the area dataset must be EMBEDDED in the compiled build (every `/api/areas/*` and the code PATCH 500 on sid)** — @Jason (XS ≈ 1 h incl. +10 percent) · blocks the release
**From @Sober to @Jason, 2026-10-12.** `tests/TEST-099-sid-final-release-candidate.md` F2 (@Tanya, via @Porter): **on sid every `/api/areas/*` returns 500 for a VALID code, and the admin parent PATCH with a code triple returns 500**; a malformed code gets the proper 400; name-only paths work.
✅ **Claim (Team A):** back `src/lib/area-codes.ts` + its tests. 🚫 Bob's F1 fix (735) is open in the shared tree — different files; do not touch them. **One sid redeploy carries Bob's F1 + this.**

## The cause — PROVEN by me on a compiled build (scratch copy of `1f82c32`)
sid runs the COMPILED binary (`bun build src/index.ts --compile …`). `area-codes.ts` reads the dataset at runtime with `readFileSync(resolve(import.meta.dir, "..", "data", "thai-geography.json"))`. **Inside a compiled binary `import.meta.dir` is the binary's virtual root**, so the path becomes **`B:\~BUN\data\thai-geography.json`** — no such file ⇒ `THAI_GEOGRAPHY_MISSING` ⇒ 500. Under `bun run` / `bun test` the path is the real source folder, which is why every test passed.
- probe, `bun run`: `OK rows 7436` · **probe, compiled exe run from another folder: `FAIL THAI_GEOGRAPHY_MISSING … B:\~BUN\data\thai-geography.json`**
- **A static JSON import IS embedded by `--compile`:** `import data from "../data/thai-geography.json" with { type: "json" }` ⇒ the compiled exe prints `embedded rows: 7436` from any folder (binary +≈3 MB).
- **The only runtime file read of this kind in `src/`** (grep: `readFileSync` / `import.meta.dir` / `__dirname` outside tests) — nothing else is exposed to the same defect.

## The fix
- **The default dataset comes from a STATIC import** (embedded at compile time); `loadGeography()` builds from it. Keep `loadGeography(path)` (the scripts' explicit path) and the test override.
- `DEFAULT_GEOGRAPHY_PATH` / the runtime `readFileSync` for the default: removed (say if a script still needs the path — the backfill and cross-check take it explicitly).
- **The owner's deploy steps do NOT change** — nothing to copy next to the binary.

## ✅ Done means
- **Reproduce first, on a COMPILED build:** a tiny probe (as above, or the real `bun run build` exe started from another folder against the safe env) shows `THAI_GEOGRAPHY_MISSING` before, and the areas served after. Paste both outputs.
- A pin that the default dataset is a static import (no runtime `readFileSync` of it) — so a future edit that brings the file read back breaks a test, not sid.
- `tsc` 0 · full suite DB-unreachable, every setting blanked · **counts** · `unhandled-between-tests: 0` · `70 = 70` · the `800` set still 14/14 (on a copy if the tree is shared).
**Then:** my verification → owner commit (with Bob's F1) → ONE sid redeploy → @Tanya re-runs F2. No git.

## ✅ 2026-10-12 — @Jason: `TASK-802` (TEST-099 F2) DONE — the area dataset is EMBEDDED in the compiled build; the 500 is reproduced on a compiled exe and gone — 3 / 3 bite
**FILES (3 + 1 new, nothing shared, Bob's F1 files untouched):** `src/lib/area-codes.ts` (the fix) · `scripts/cross-check-area-codes.ts` (it printed the removed path constant; now says «the embedded default») · `src/lib/area-codes-task800.test.ts` (my own TASK-800 file: the pin, and its `HAVE_DATA` guard now `true` — the default cannot be missing) · NEW `src/lib/area-dataset-embedded-task802.mutations.json`.
### Reproduced FIRST, on a COMPILED build (probe `bun build … --compile --minify`, run from a DIFFERENT folder)
```
bun run (source):                 OK rows 7436 provinces 77
compiled exe, BEFORE the fix:     FAIL THAI_GEOGRAPHY_MISSING THAI_GEOGRAPHY_MISSING: B:\~BUN\data\thai-geography.json is not in the build
compiled exe, AFTER  the fix:     OK rows 7436 provinces 77        (binary 98,480,216 → 101,221,376 bytes: +2.7 MB, as the dataset)
```
**And the REAL entry point, compiled** (`bun build src/index.ts --compile --minify`, started from another folder with the safe env, curl'd): `GET /api/areas/provinces` → **200** (77, Bangkok first) · `/districts?province=38` → **200** `เมืองบึงกาฬ…` · `/subdistricts?district=3801` → **200** · `/districts?province=x` → **400 VALIDATION** (the proper refusal, as Tanya saw). The code-PATCH path goes through the same `checkAreaCodes` → `loadGeography()`, so it is the same fix (the by-value tests cover the PATCH; I did not start the exe against a database).
### The fix
`area-codes.ts`: `import DATASET from "../data/thai-geography.json" with { type: "json" }` — a STATIC import, which `--compile` embeds — and `loadGeography()` builds from it (once, lazily). **Removed:** the runtime `readFileSync(resolve(import.meta.dir, …))`, `DEFAULT_GEOGRAPHY_PATH`, `GEOGRAPHY_MISSING`. **Kept:** `loadGeography(path)` — the explicit path the scripts use (the backfill/cross-check never relied on the default path) — and the test override. **The owner's deploy steps do not change** — nothing to copy next to the binary.
### The pin (4 tests, `area-codes-task800.test.ts`)
the default is a static import · NO `import.meta.dir` / `__dirname` / `DEFAULT_GEOGRAPHY_PATH` and the ONLY `readFileSync(` is the explicit-path branch · **nothing else in `src/` reads the dataset file at runtime** (a source scan — same defect anywhere else it could hide) · the no-path loader really serves 7,436 rows. A test cannot run inside the compiled binary, so the property is pinned by SOURCE, and the compiled exe was run by hand (above) — said.
### Numbers — clean room (HEAD `1f82c32` + these 4 files; the shared tree has Bob's F1 open)
`tsc` 0 (5.6.3) · suite DB-unreachable, every setting blanked: **`4649 pass · 0 fail`** · `unhandled-between-tests: 0` · **`70 = 70`**. **Set `area-dataset-embedded-task802.mutations.json` — 3 / 3 BITE** (E1 runtime read back · E2 static import dropped · E3 path constant back), CHECKSUM identical. **The `800` set re-run: 14 / 14 BITE**, CHECKSUM identical.
▶️ **Ball: Sober — verify 802 → owner commit (with Bob's F1) → ONE sid redeploy → @Tanya re-runs F2.**

