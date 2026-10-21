# TASK-830 — FE: **the address picker shows ENGLISH area names on the EN page** (REQ-118 follow-up, Khwan 10-21) — @Fern, ≈ 0.4 d incl. +10%
**From @Sober, 2026-10-21.** The first of Team A's 830–859 block. **Starts after the TASK-828 F3 rework is verified.**

## Why (from code, 10-21)
- **The back already serves English.**
  - `GET /areas/provinces|districts|subdistricts` answer `{ code, nameTh, nameEn }` from OUR dataset (TASK-800/802).
  - The names include TASK-803's 583 DOPA-cited corrections (closed 10-12, back `ec820c5`, on sid + uat).
  - `nameEn` falls back to `nameTh` when a row has no English.
- **The front throws it away.** TASK-580 (09-30) removed `nameEn` from `AreaPick` (`lib/register/entry.ts`), because the OLD package's English was garbled ("Khnong Tntnai").
  - Both pickers label every option `r.nameTh`, in both languages: `RegisterContent.tsx` `asOptions` and `People/AreaPicker.tsx` `options`.
  - TASK-800 moved the data to our own dataset and 803 fixed its English, but the front was never switched back.
- **Already right, no change:** the admin parent CARD shows `addressEn` on the EN page (`lib/people/parent-address.ts`). No LINE message prints the address. The SOM contract is a Thai document: Thai by design.

## The change (front only)
1. `AreaPick` gets `nameEn` back, filled from the route's `nameEn` (`uniqueByCode` keeps it).
   - Rewrite TASK-580's comment: the reason is gone (our dataset + 803), so say so.
2. **Option labels follow the language:** `lang === "en" ? r.nameEn : r.nameTh`, in BOTH pickers (the register page and the admin parent form).
   - The searchable box then matches English typing on the EN page.
3. **Unchanged:**
   - option VALUES (the geocodes);
   - what is SENT and STORED: the codes, plus the Thai joined line from `nameTh` and `joinAddress`;
   - the TH page, byte for byte;
   - the field labels (already translated).
4. **The confirm/summary line on the EN register page shows the same picks in English.**
   - **Display only:** what is sent stays the Thai line.
   - If that summary is the very string that is sent, keep a Thai copy for sending and an English one for display. **Never send English.**
5. **No new words:** the names come from the dataset. If a line needs words, stop and tell me.

## Pins (Team A's own: TASK-580 / 355 / 801; granted on the usual terms)
- Expected:
  - `lib/register/entry.test.ts`;
  - `lib/register/register-page.test.ts`;
  - `Register/register-required.dom.test.tsx`;
  - `scripts/mutation/task-580.json`;
  - any AreaPicker test.
- The terms: **the minimal edit**, and each pin's point is kept or turned around on purpose. "Nothing garbled reaches a screen" becomes "the EN label comes from OUR dataset's `nameEn`".
- **List them before editing.** Anything outside Team A goes to me first.

## Tests by value
- On the EN page: a province, a district and a sub-district show the route's `nameEn`. Use an 803-corrected row, e.g. the one that was "Khnong Tntnai".
- On the TH page: `nameTh`, exactly as today.
- The submitted body is identical on TH and EN: the same codes and the same Thai line.
- The admin form: the same, both languages.
- A row whose `nameEn` equals its Thai (the fallback) shows the Thai.

## Mutations (each must bite)
- The EN label from `nameTh` (today's behaviour).
- The TH label from `nameEn`.
- The EN page sends the English line.
- `uniqueByCode` drops `nameEn`.
- The admin picker left on `nameTh`.

## Done means
Tests by value, plus set `task-830.json` with each bite shown · tsc 0 · `bun test` · build · `unhandled-between-tests: N` · `git status` in full. Re-run set 580. Nothing committed.

---
## ✅ 2026-10-21 — GRANTED by @Porter (claims as listed). Release shape
- **F3 + 830 ride ONE front commit list**, on top of front `99d27a5`, which is the owner's commit of the 828 rework + O1 + 829.
- The back is already committed: `fa1a04c`.
- **Order:** sid → Tanya (F3 + 830) → **uat with everything** (back `fa1a04c` + this front + migrate 0071).
- **@Fern:** start 830 in the same tree **once I've verified F3**. If 830 slips well past F3, say so: F3 then ships first.

## ✅ 2026-10-21 — @Sober: Fern's pin list (8 items, inbox/SA.md) RATIFIED. All Team A's own (580 / 801 / 353)
The sent body (codes + Thai `addressLine`) and a language-free `joinAddress` stay pinned. #6 and `task-801.json` are touched only if a `from` text moves.

---
## FE report — Fern, 2026-10-21 — TASK-830 DONE (front only)
**What changed**
- `lib/register/entry.ts`: `AreaPick` has `nameEn` again; new `areaLabel(pick, lang)` (TH → `nameTh`; else `nameEn || nameTh`); loader + `uniqueByCode` keep `nameEn`. `joinAddress` untouched (language-free).
- `Register/RegisterContent.tsx`: option label = `areaLabel(r, lang)`; new display-only `addressShown` (EN join of the picks) on the confirm row. Sent body unchanged (codes + Thai parts); `addressLine` (Thai) kept.
- `People/AreaPicker.tsx`: option label = `areaLabel(r, lang)`. No new words. Admin parent card untouched (already shows `addressEn`).
**Pins turned (ratified list, minimal):** #1 `entry.test.ts` rows now carry `nameEn` (value check); #2 `register-page.test.ts` lang count 6→9 + label string; #3 §8b label/`nameEn: string`/confirm `: addressShown} />` (still: join language-free, sent parts `nameTh`); #4 same confirm string; #5 `uniqueByCode` signature (+ title reversed); `:221` confirm string. `:237` ("line is never sent") left on `addressLine`. **#6 province-repair and `task-801.json`: NOT touched** (no `from` moved). #7 `register-required.dom.test.tsx` fixtures NOT edited: they lack `nameEn`, so they exercise the Thai fallback (still green).
**Re-aimed task-580 mutations (old → new `what`):**
- A5: "🔴 F-D — the garbled English names come back to the parent's dropdowns" → "🔻 TASK-830 (was: garbled English comes back) — the option label goes back to Thai-only on the EN page, 580's old behaviour".
- A6: "the English name rides the row again (an unused garbled field waiting for a reader)" → "🔻 TASK-830 (was: English rides the row) — the loader's dedupe drops the English name".
- A7 (anchor was ALREADY stale at HEAD, from TASK-591's move): `from` re-aimed to `const addressLine = joinAddress({ subDistrict: subPick?.nameTh…`; `what` unchanged.
- 580 is an array with no `tests` field, so the runner refuses it; I ran it with `--tests` register-page + entry + register-required (baseline 106/0). The 93/0 in the old report used another list — please say if you want a `tests` field added.
**New tests:** `Register/address-english-task830.dom.test.tsx` (5): EN options English + blank-English falls back to Thai; EN confirm row English while the REQUEST is Thai names + codes; TH toggle → options and confirm row Thai; admin picker EN and TH.
**Sets (one at a time, no runner alive before/after):** `task-830.json` E1–E10 all BITE (baseline green, CHECKSUM identical); 580 A1–A8 BITE; 801 24 BITE; 828 30 BITE; 829 17 BITE; none SURVIVED / ANCHOR MISSING / NO RESULT.
**Gates:** tsc 0 · `bun test` 1348 pass / 0 fail · build 0 · `unhandled-between-tests: 0`.
**Not done / caveats:** nothing tried in a real browser; the English text depends on the back serving `nameEn` (TASK-803 corrections) — I faked it at the wire. F3's 4 files intact.
**`git status --short -uall` (front):**
```
 M scripts/mutation/task-580.json
 M scripts/mutation/task-818.json
 M scripts/mutation/task-828.json
 M src/components/partials/Calendar/Modal/LeaveWillDo.tsx
 M src/components/partials/Calendar/Modal/leave-co-taught-task828.dom.test.tsx
 M src/components/partials/People/AreaPicker.tsx
 M src/components/partials/Register/RegisterContent.tsx
 M src/lib/register/entry.test.ts
 M src/lib/register/entry.ts
 M src/lib/register/register-page.test.ts
?? scripts/mutation/task-830.json
?? src/components/partials/Register/address-english-task830.dom.test.tsx
```

## ✅ 2026-10-21 — @Sober: TASK-830 VERIFIED → READY for the commit with F3 (`DEPLOY-F3-and-TASK-830-front-2026-10-21.md`)
- **The code:** `areaLabel` (TH → `nameTh`; else `nameEn || nameTh`) in both pickers; the display-only `addressShown` on the confirm row; the sent Thai `addressLine` + codes unchanged; `joinAddress` untouched.
- **Clean copy** of front `99d27a5` + 12 files: tsc 0 · `bun test` **1,348 / 0** · unhandled 0 · build 0.
- **Sets:** 830 **10/10** · 580 8/8 (explicit tests) · 801 12/12 · 828 30/30 · 829 · 828-o1 · 818 · 820 · 822. 0 survivors.
- **Fern's question:** give `task-580.json` a `tests` field? **Not now:** it is a follow-up, outside this commit. Noted.
- 🧊 The front tree is frozen.
