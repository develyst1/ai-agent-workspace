# TEST-012: DEF-25 close — `เอกสารอื่น ๆ (ถ้ามี)` split label + dotted write-in (5 forms)

- Source: DEF-25 / TASK-051/052/053 close gate (Porter, 2026-09-07)
- Status: **EMPTY branch PASS on all 5 · POPULATED branch PASS on อ.4 · POPULATED UNVERIFIED on อ.14 + a9-family (no sample with data)**
- Environment: own clean build, `:33024`, dev, UAT-wired (DID_SPF), read-only
- Tested: 2026-09-07 by Tanya

## What DEF-25 was
`เอกสารอื่น ๆ (ถ้ามี)` (item **13** on a14/a9-family, item **17** on a4) used to concatenate label+value and
fake the underline with literal dot characters, so a populated request printed the value **glued** to the label
with no real line. Fix (TASK-051/052/053): label and write-in are **separate fields**; the dotted line is a real
gated element (`detail==null && inputValue!=null`), so it prints whether or not there is a value.
Gate = real render, both branches: **populated** → value on the dotted line, label separate; **empty** → the
dotted line still prints.

## Method
Real-DB seam `/preview/checklist/{a4,a14,a9,a15}/db/{id}` (= same builder + DB queries as `/download`; not the
mock). All 20 renders → **HTTP 200, 0 ORA**. Verdicts read off the **rendered PNG** (the ground truth): a
programmatic checkmark-image count via PyMuPDF proved unreliable here (false positive on a9-destroy, false
negative on a4), so every populated/empty call below is from the actual render, not a heuristic.

## Result
| Form | item | Empty branch | Populated branch |
|------|------|--------------|------------------|
| อ.4 | 17 | ✅ **38419** — ☐, label separate, dotted line prints full width, no value, not glued | ✅ **38427** — `17.☑ เอกสารอื่น ๆ (ถ้ามี)  test` — value **on** the dotted write-in, label separate, **not glued** (stakeholder's accepted baseline, independently confirmed) |
| อ.14 | 13 | ✅ **27300** — ☐, label separate, dotted line prints full width, not glued | ⚠️ **no sample** — none of the candidate requests has item-13 data |
| อ.15 | 13 | ✅ **35429** (+ the other 8 TEST-010 samples) — ☐, dotted line prints, not glued | ⚠️ **no sample** — 9/9 have no item-13 data |
| อ.9 transport | 13 | ✅ **37956** — ☐, dotted line prints full width, not glued (render also shows REQ-035 `ตาม หนังสือขอซื้อ เลขที่ A0001` + person2 ID rows correct) | ⚠️ **no sample** |
| อ.9 destroy | 13 | ✅ **38362** — ☐, dotted line prints full width, not glued | ⚠️ **no sample** |

## Distinguishing the branches (Porter's trap)
The populated call is only made where the render actually shows a value: **อ.4 38427 prints `test`** on the
write-in. Everywhere else the item-13 checkbox is empty and no value renders, so those are **empty-branch**
renders — I do **not** pass the populated branch on them. `checked = !otherDocNames.isBlank()`, so a populated
item-13 would also be ticked; none of the a14/a15/a9-family candidates is ticked at item-13 → genuinely no data,
not a broken row.

## Verdict
- **DEF-25 EMPTY branch = PASS on all 5 forms.** Label separate, dotted line prints, never glued, no literal-dot
  concatenation. HTTP 200, 0 ORA throughout.
- **DEF-25 POPULATED branch = PASS on อ.4** (38427 `test`), the form the stakeholder accepted by eye.
- **POPULATED branch UNVERIFIED on อ.14, อ.15, อ.9-transport, อ.9-destroy** — no request with item-13 data was
  found in the candidate set. Not a fail. The a9-family share the base-builder gated element (`A9…Base`) that a
  real populated a9 render would exercise, and a14 mirrors อ.4's element (Jason: structurally identical, placement
  transfers); Jason's `structure_check.py` proves both assertions fail-on-revert (34/34). So the risk is low, but I
  did not exercise a populated render on those four. **Porter's call:** accept the populated branch as covered by
  อ.4 + the shared/mirrored element + fail-on-revert, or supply a request with item-13/17 data on those forms
  (needs a DATA REQUEST — I'm read-only and can't query for one).

## Retest 2026-09-07 (clean build) — REPRODUCED, identical
Re-ran on a genuine `mvn clean` build (not a reused target): `[JasperPrecompiler] compiled 58/58 .jrxml` ran
this boot and every `target/classes/.../evidence.jasper` is timestamped to this build → fresh from the current
`.jrxml`, no stale binary (the 14 src `.jasper` are untracked/git-ignored PreviewTest artifacts, overwritten in
`target` by the precompiler). Result unchanged: อ.4 38427 POPULATED PASS (`17.☑ … test` on the write-in),
อ.4 38419 + the other 4 forms EMPTY PASS (dotted line prints, label separate, never glued), all 200 / 0 ORA.
POPULATED still unverified on อ.14/อ.15/a9-transport/a9-destroy (no sample with item-13 data). Confirms the
first run was not a stale-`.jasper` artifact.
