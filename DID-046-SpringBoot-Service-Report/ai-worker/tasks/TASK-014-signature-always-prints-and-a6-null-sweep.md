# TASK-014: Signature block always prints (4 slots) + อ.6 "null" sweep — อ.6 (REQ-021) & อ.9 (DEF-9)

- Source: SPEC-021 (REQ-021 for อ.6 + DEF-9 for อ.9 — same two changes on sibling reports)
- Status: DONE (Sober-reviewed, independently verified)
- Assignee: Jason (BE)
- Depends on: none
- ⚠️ **อ.6 is DELIVERED and in use** — minimal/surgical only; do NOT regress REQ-005/009/010/011/012/015.

## Change 1 — `buildSignatures` always returns exactly 4 slots (BOTH builders)
Files: `report/checklist/a6/builder/A6CheckListReportBuilder.java` (~L100-122) and
`report/checklist/a9/builder/A9CheckListReportBuilder.java` (identical mirror, ~L100-120).
- Replace **both** `return List.of()` (blank `referenceNo`; no `T_T_LICENSE_INFORM` row) with a return
  of **4 blank Signatures** in the existing display order `s1, s3, s2, s4`.
- Change `sig(...)` so it **never returns null** — when name+position are both blank, return a blank
  `Signature("", "", "")` (empty strings, not null) instead of `null`. Remove the `.filter(Objects::nonNull)`
  reliance (it may stay, but the list must still be length 4 — simplest: build `List.of(s1,s3,s2,s4)`
  with each guaranteed non-null).
- Result: the subreport always receives 4 rows → always prints the 4-slot structure; real names/positions
  fill in when the INFORM row exists. Keep slot order/semantics exactly. Do NOT hardcode role labels
  (position stays data-driven, blank when absent). This a9 change closes **DEF-9**.

## Change 2 — signature subreport position guard (BOTH)
`request-a6-signature.jrxml` and `request-a9-signature.jrxml`, the `$F{position}` textField (line ~21):
add `blankWhenNull="true"` (name/nameInParen already guard null inline).

## Change 3 — อ.6 full "null" sweep (REQ-021 #2)
The six a6 jrxml currently have **0** `blankWhenNull` across **29** value textFields
(`request-a6-main.jrxml` + `component`/`evidence`/`evidenceSub`/`lawRef`/`signature`). Add
`blankWhenNull="true"` to every **null-capable value** textField (bare `$F{...}`, or an expression that
can evaluate to null) across all six — the same treatment TASK-013 gave a9's evidence/evidenceSub.
Leave static labels alone; don't change any expression's logic (only add the attribute).

## Regenerate templates (DEF-7 lesson)
Recompile `.jrxml → .jasper` into `src/main/resources` via the PreviewTests + a clean compile; never
hand-edit `.jasper`:
```
./mvnw -o -Dtest=A6PreviewTest -DfailIfNoTests=false test
./mvnw -o -Dtest=A9PreviewTest -DfailIfNoTests=false test
```

## Verify — DB-free (BE, you can close this yourself)
1. **Empty-signers fixture:** in `A6CheckListPreviewBuilder` add/enable a **no-signers** case (empty
   INFORM / blank referenceNo path) → regenerate → confirm the preview shows **4 blank signature slots**
   (signature line + `(  )` + position line all present). Do the same sanity-check for a9 (DEF-9), and
   keep a **filled** case (4 signers) → no regression.
2. **Null fixture:** set a null on a null-capable a6 value field in the preview fixture → confirm it
   renders **blank**; grep the extracted `target/a6-preview.pdf` text → **no "null"** anywhere.
3. **No regression:** `A6PreviewTest` + `A9PreviewTest` green; a6 item 7 / ticks / persons / เอกสารอื่นๆ /
   dotted-line content unchanged from the current preview.

## Definition of Done
- [ ] `buildSignatures` in **both** builders always returns exactly 4 slots (blank when no data); `sig()`
      never returns null; slot order `s1,s3,s2,s4` preserved.
- [ ] `$F{position}` in both signature subreports carries `blankWhenNull="true"`.
- [ ] All null-capable value textFields across the six a6 jrxml carry `blankWhenNull="true"`.
- [ ] `.jasper` regenerated via the PreviewTests (into `src/main/resources`) + clean compile; no hand-edit.
- [ ] DB-free proofs green: 4 blank signature slots with no signers (a6 **and** a9); no "null" in
      `a6-preview.pdf`; delivered a6 behaviours unchanged. `./mvnw -o -DskipTests=false test-compile` +
      both PreviewTests green.
- [ ] Headings/queries/layout otherwise untouched.

## Handoff after DoD
Back to **Sober** for review, then **Tanya (via Porter)** confirms on real DB:
`/a6/db/{no-signer id}` → 4 blank slots; `/a6/db/38272` & `/a6/db/38314` → no "null" + delivered
behaviours intact; `/a9/db/38179` → 4 empty slots (DEF-9); `/a9/db/18847` → filled, no regression.

## Implementation Notes
**Change 1 — `buildSignatures` always 4 slots (both a6 + a9 builders):** replaced both
`return List.of()` (blank referenceNo / no INFORM row) with `fourBlankSignatures()` = 4×
`Signature("","","")`; `sig(...)` no longer returns null — it returns `Signature(full, join, position??"")`
(blank slot, never null); final return is `List.of(s1,s3,s2,s4)` (order preserved, all non-null). No
role labels hardcoded (position stays data-driven, blank when absent). Identical mirror in both builders;
this closes **DEF-9** for a9.
**Change 2 — signature subreport position guard (both):** `$F{position}` textField in
`request-a6-signature.jrxml` + `request-a9-signature.jrxml` now carries `blankWhenNull="true"`.
**Change 3 — a6 full "null" sweep:** added `blankWhenNull="true"` to every null-capable value textField
(`$F{...}` expression) across the 6 a6 jrxml — main +8, component +4, evidence +6, evidenceSub +5,
lawRef +1, signature +2 (= 26; + the position field from Change 2). Static labels untouched; no
expression logic changed.
**Fixtures (A6CheckListPreviewBuilder, DB-free regression):** signature slot 4 → `Signature("","",null)`
(blank + null position); item-1 `inputValue=null`. Slots 1–3 stay filled (filled case retained).

**Verify (DB-free):** `.jasper` regenerated via A6PreviewTest + A9PreviewTest (never hand-edited);
`./mvnw -o -DskipTests=false test-compile` → **BUILD SUCCESS**; both PreviewTests → **Tests run: 2,
Failures: 0** (a6 pages=3, a9 pages=4). PyMuPDF on the previews:
- **4 signature slots** print on a6 (`'(ลงชื่อ)'` count = 4) — the blank slot 4 still renders its
  structure; null position → **blank** (no "null"). ✅ (a9 keeps its 4 filled slots → DEF-9 structure holds.)
- **No literal "null"** in `a6-preview.pdf` **or** `a9-preview.pdf` (item-1 null inputValue renders blank). ✅
- **No a6 regression:** item 7 "180 วัน" (REQ-005), "เอกสารอื่น ๆ" (REQ-011) still present; ticks/persons/
  dotted-line unchanged. ✅
Headings/queries/layout otherwise untouched.
@Sober: ready for review. QA (real DB) then confirms: `/a6/db/{no-signer id}` → 4 blank slots;
`/a6/db/38272`+`38314` → no "null" + delivered behaviours intact; `/a9/db/38179` → 4 empty slots (DEF-9);
`/a9/db/18847` → filled, no regression.

## Review
**Verdict: DONE** (Sober, 2026-08-18). Independently verified — re-read both builders + the jrxml, and
re-rendered `a6-preview.pdf` + `a9-preview.pdf` from the mock (A6/A9PreviewTest, no DB), inspected the text myself:
- **Change 1 (signature always 4 slots):** confirmed in **both** builders — `buildSignatures` returns
  `fourBlankSignatures()` (4× `Signature("","","")`) on both empty paths (blank referenceNo / no INFORM
  row) and `List.of(s1,s3,s2,s4)` otherwise; `sig()` never returns null. Preview shows **`(ลงชื่อ)` ×4**
  on a6 **and** a9, with the blank slot's null position rendering **blank** (not "null"). Closes DEF-9. ✅
- **Change 2 (position guard):** `$F{position}` carries `blankWhenNull="true"` in both signature subreports. ✅
- **Change 3 (a6 null sweep):** blankWhenNull now on all null-capable value textFields — main 8/8,
  component 4/4, evidence 6/6, lawRef 1/1, signature 3/3, evidenceSub 5/7. The 2 unguarded evidenceSub
  fields are **static string literals** (`"สำเนาทะเบียนบ้าน"`, `"สำเนาบัตรประชาชน"`) — never null, correctly skipped. ✅
- **No "null"** in either preview PDF; **no a6 regression** (item-7 duration/REQ-005 + เอกสารอื่น/REQ-011
  present; ticks/persons/dotted-line unchanged). `.jasper` regenerated via the PreviewTests; both green (a6=3, a9=4). ✅
- Note: the preview exercises the blank-slot structure (slot 4 blank) rather than the all-4-blank
  `fourBlankSignatures()` path; that path is trivial (`List.of(b,b,b,b)`) and renders by the same
  mechanism — QA confirms the true no-signer request on real DB.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
