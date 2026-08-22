# TASK-154: Importer normalises gender & nationality on write (REQ-060 Part A) (BE)

- Source: SPEC-054 (REQ-060 Part A — requirements 1+2, AC-1/2/3)
- Status: DONE (SA-reviewed Sober 2026-08-22) — REQ-060 Part A complete; the 111 held students are unblocked

## Review
**PASS ✅ (SA-reviewed Sober 2026-08-22).** Reproduced: `bunx tsc --noEmit` **0** · `bun test` **592/0** (demographics
+ import 49/0, +14 overall). Read the code:
- **`lib/demographics.ts` is exactly the design:** closed-set gender via a lowercase-keyed alias map (EN + Thai,
  `M`/`ช`/`ชาย` etc.), **empty → `{null,null}` and not reported**, non-empty-unmatched → `{null, raw}` (AC-3);
  nationality maps Thai spellings → `ไทย` and **passes everything else through verbatim** — the right call, and
  Jason's reasoning is sound (we don't own a list of the world's nationalities; dropping one loses real data).
- **Wired in `classifyRow` (`student-import.ts:126-142`), not the script** — so the normalised value is part of the
  classified row and the unreadable-gender note rides the **existing** per-row report channel (same as the
  malformed-DOB note). No new report shape.
- **API write path untouched** — grep confirms only `classifyRow` + `import-students.ts` changed; `parent.service` /
  `validation.ts` are as they were (Part A is importer-only, as scoped).
- **🔑 Importability proven unchanged, not asserted:** `student-import.test.ts:325` pins a 5-row mix (clean ·
  unreadable-gender · blanks · no-phone · parent-row) at `{ total:5, imported:3, held:2, yellow:0 }`, and `:318`
  pins that the unreadable-gender row **still imports** with its report line. ⇒ the owner's four real dry runs must
  still read **`3 · 47 · 55 · 6`** — that is the pre-commit check.

**Verdict: DONE.** REQ-060 Part A is complete; the import can proceed once the owner re-runs the four dry runs
(sid→uat), confirms `3·47·55·6`, and commits.

## Answer to Jason's Q1 (Part B input)
**Yes — Part B's in-place repair MUST reuse these same `lib/demographics.ts` functions**, exactly so the write path
and the repair path can never drift. The repair pass is: for each stored student, compute `normalizeGender(current)`
/ `normalizeNationality(current)`; if the normalised value differs from what's stored, that's a candidate change;
**and the no-clobber rule (AC-6, `คุณมะเหมี่ยว`) falls out for free** — a row already `female`/`ไทย` normalises to
itself, so it reports "already correct — skipped" with no special-casing. I'll cut Part B with that as the stated
approach when it reaches the queue (after the REQ-058 bulk-link, 057, 059).
- Assignee: @Jason (BE)
- Depends on: none. **BE-only, no migration, no FE.** 🔴 **Gates 111 verified students** — the owner is holding the
  Fri/Sat/Sun/Voucher import until this lands, so it is top of the queue.

## Why (one paragraph)

The importer stores column E/F verbatim (`src/lib/student-import.ts:262-263` → `nationality: at(4)`,
`gender: at(5)`), so `Male`/`Thai` reach the DB. The product understands only `male`/`ไทย`, so every imported child
shows **no gender** and every Thai child is shown as **Foreign** (`StudentFormModal.tsx`, `PeopleContent.tsx:62`,
and the SOM breakdown all key on lowercase/`ไทย`). Fixing it on write means **no reader has to change** — the stored
value simply becomes what they already expect.

## What to build (smart-scheduler-back)

### 1. Pure `src/lib/demographics.ts` (+ `demographics.test.ts`)

```
normalizeGender(raw: string): { value: "male" | "female" | "other" | null; unreadable: string | null }
normalizeNationality(raw: string): { value: string | null; unreadable: string | null }
```

- **Gender** (trim, case-insensitive): `male` ← `Male|M|male|ช|ชาย` · `female` ← `Female|F|female|ญ|หญิง` ·
  `other` ← `other|อื่น|อื่นๆ`. **Empty → `{null, null}` (legitimate "no gender", NOT reported).** Non-empty and
  unmatched → `{ value: null, unreadable: raw }`.
- **Nationality** (trim, case-insensitive): `ไทย` ← `Thai|ไทย|TH|thai`. **Anything else non-empty passes through
  verbatim** (`Japan`, `Taiwan`, `Foreign`) → `{ value: raw, unreadable: null }`. Empty → `{null, null}`.
  (A literal `Foreign` with no country is stored as `Foreign` and displays in the Foreign branch — honest to the
  source; supplying a real country is the customer's, out of scope.)

### 2. Wire into the importer only

In the row→student mapping, store `normalizeGender(row.gender).value` / `normalizeNationality(row.nationality).value`
instead of the raw strings. When either returns a non-null `unreadable`, append a line to the **existing per-row
report** naming the `excelRow` + the unreadable value (reuse the current report channel — do not invent a new one).

🔴 **Do NOT touch `parent.service.ts` / `validation.ts` (the API write path).** The UI already writes lowercase; Part
A is the importer only. (The shared normaliser existing in `lib/` means the API can adopt it later trivially — that
is filed with Part B, not this task.)

## Definition of Done

- [ ] `Male`→`male`, `Female`→`female`, `M`/`ช`/`ชาย`→`male`, `F`/`ญ`/`หญิง`→`female`; `Thai`→`ไทย`,
      `TH`→`ไทย`; `Japan`/`Taiwan`/`Foreign` pass through verbatim — all unit-tested in `demographics.test.ts`.
- [ ] **Empty gender → stored null and NOT in the report** (legitimate no-gender). **Non-empty unreadable gender
      (`?`) → stored null, child still imports, report names the `excelRow` + value** (AC-3).
- [ ] 🔑 **Importability is unchanged.** The normaliser only transforms values; it must not change any hold/import
      decision. Demonstrate on a synthetic dry run that the counts are identical with and without normalisation —
      and state in the notes that the owner's four real dry runs must still read **`3 · 47 · 55 · 6`** after this.
- [ ] `bunx tsc --noEmit` 0 · `bun test` green (new `demographics.test.ts`; the existing import tests still pass —
      update any that asserted the old verbatim `Male`/`Thai` storage).
- [ ] You run **nothing** against a DB — the owner re-runs the four dry runs on `sid` then `uat`, then commits.

## Notes / Questions

(Jason fills in. The customer's real sheet values seen so far: gender `Male`/`Female` (+ 8 blank); nationality
`Thai`, `Foreign`, `Japan`, `Taiwan`. Part B — forgiving readers + the in-place repair of rows already stored — is
a separate later task; do not build it here.)

## Implementation Notes
**Files:** `src/lib/demographics.ts` (new, pure) · `src/lib/demographics.test.ts` (new, 9 tests) ·
`src/lib/student-import.ts` (normalise in `classifyRow`, `person` gains `gender`/`nationality`) ·
`src/lib/student-import.test.ts` (+5) · `scripts/import-students.ts` (stores `p.gender`/`p.nationality`).

- **`normalizeGender`** — `male` ← `Male|M|male|ช|ชาย` · `female` ← `Female|F|female|ญ|หญิง` · `other` ←
  `other|อื่น|อื่นๆ`, all case/whitespace-insensitive. **Empty → `{null, null}` and NOT reported** (a blank cell is
  a legitimate "no gender"; reporting blanks would bury the few genuinely unreadable values in noise).
  **Non-empty unmatched → `{null, <raw>}`** ⇒ stored null, child still imports, one report line naming the row.
- **`normalizeNationality`** — `ไทย` ← `Thai|thai|TH|ไทย`; **anything else non-empty passes through verbatim**
  (`Japan`, `Taiwan`, and a literal `Foreign` stored as written). Nationality can never be "unreadable": we don't
  own a list of the world's nationalities, and discarding one would lose information the sheet actually had.
- **Wired in `classifyRow`**, not in the script, so the normalised values are part of the classified row and the
  unreadable-gender note rides the **existing** per-row report channel (same mechanism as the malformed-DOB
  note) — no new report, no new output shape.
- 🔴 **`parent.service.ts` / `validation.ts` untouched**, as instructed — the UI already writes lowercase, so Part
  A is the importer only. The shared normaliser now existing in `lib/` is what makes the API's later adoption
  trivial (filed with Part B).

**Importability is unchanged — demonstrated, not asserted.** The normaliser only ever transforms *values*; it
touches nothing in the hold/import/yellow decision. Evidence:
- A unit test over a 5-row mix (clean · unreadable gender · blanks · no-phone · parent-row) pins
  `{ total: 5, imported: 3, held: 2, yellow: 0 }` — the same partition the pre-change rules produced.
- A synthetic **dry run** (temp dir, no DB): `แถวทั้งหมด 5 · ทำได้ 4 · ติด 1 · ยังไม่พร้อม 0`, with the report
  showing `✅ แถว 4 ทำได้ — เพศไม่ชัดเจน (?) — บันทึกเป็นค่าว่าง` — i.e. the unreadable-gender row is **reported
  and still imported**, and the only ⚠️ is the pre-existing short-phone hold.
- ⇒ **the owner's four real dry runs must still read `3 · 47 · 55 · 6`.** If any of those numbers move after this
  change, the change is wrong — that is the check to run before `--commit`.

**Verified:** `bunx tsc --noEmit` **0** · `bun test` **592 pass / 0 fail** (70 files; +14). No existing import test
asserted the old verbatim storage, so none needed rewriting — the new assertions are additive.

⚠️ **I ran nothing against a database.** The owner re-runs the four dry runs on `sid`, confirms the counts, then
`--commit`; then the same on `uat`.

## Questions
- Q1 (Part B input, non-blocking): rows imported **before** this lands still hold `Male`/`Thai` — the 25 on `uat`
  / 130 on `sid` in your REQ analysis. Part A deliberately doesn't touch them. When you cut Part B, the same
  `lib/demographics.ts` functions are what a repair pass should use, so the fix and the repair can't drift apart.

  > answer: (Sober)
