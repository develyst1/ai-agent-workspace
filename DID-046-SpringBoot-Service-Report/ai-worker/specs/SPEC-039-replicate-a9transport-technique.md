# SPEC-039: Replicate the stakeholder's a9-transport technique to อ.14/อ.15/อ.4/อ.9-destroy (REQ-034)

- Source: REQ-034. **a9-transport is the reference — DO NOT touch it** (regenerate + diff to prove it never moved).
- Not "apply a fix" — extract the PRINCIPLE, then re-derive each form's own special rows against ITS official PDF.

## 📌 STANDING DESIGN RULE (stakeholder, 2026-09-03 — applies to EVERY form, not just REQ-034)
> **In `*-evidenceSub.jrxml`, each row gets its OWN row type + printWhen band. Prefer duplication over a shared band
> with conditionals. The right question is NOT "can I reuse this band?" but "does this row have the SAME shape as that
> one?" — on these forms the answer is usually no.**

**⚠️ Refinement (stakeholder, 2026-09-04, bfc4b76):** don't over-apply. Split is for rows whose **SHAPE** differs. A row
of the **right shape but merely cramped** is a **geometry** fix (reclaim caption slack → value fields), NOT a new band —
they hand-fixed อ.9-destroy with geometry only, adding ZERO bands (destroy stayed 11). Judge by shape.

Stakeholder's words: *"พยายามแยกข้อไปเลย แยกข้อใน subevidence … มันค่อนข้าง unique … เขียนตัวเดียวไปปรับใช้ร่วมกัน ยากไปหน่อย"* and
*"ฉันมาแก้ให้พวกแกน่ะ ก็ทำแบบนี้แหละ"* — this is the method they actually used to fix a9-transport by hand, measurable in
the tree: transport evidenceSub = **13 bands**, a15/a14/a4/a9-destroy = **11**; the 2 extra (`refrow4`/`refrow5`) added
**no new fields** — same data, dedicated presentation. They fixed in one pass what we spent 6 rounds on; the difference
was refusing to share a band that didn't fit. REQ-033's stray checkbox, wrong indent, glued values, dotted-run-over-label
were all ONE design fault (a shared band), chased as separate defects. Duplication is verbose but each band is
independently editable + verifiable. If a case genuinely warrants sharing, say so and why — don't share quietly.

## The principle (extracted from the stakeholder's a9-transport edit — study step done)
> **A row whose shape a shared row type cannot express gets its OWN row type + band. NEVER bend a shared band to fit it.**
This was the root cause of REQ-033's 6 rounds: reusing one band across differently-shaped rows forced compromises
(stray checkbox, wrong indent, glued value) that each broke a sibling row on the same band.

## What a9-transport did (reference — do NOT paste these into other forms)
`request-a9-transport/subreport/request-a9-evidenceSub.jrxml` = **13 bands** vs 11 elsewhere; the 2 extra are dedicated
geometries, **no new field names** (same data, dedicated presentation):
- **`refrow4`** = `ตามหนังสือขอซื้อ` — label(x64 w72) + long dotted run(x136 w180) filling to `เลขที่` + `ลงวันที่` segment. The `label→dots→label→dots→label→dots` shape.
- **`refrow5`** = `สำเนาบัตรประชาชนผู้รับมอบอำนาจ` — label(x64 w156) + mid `เลขที่`(x221 w188 dotted) + trailing `วันหมดอายุ`(x412) dotted.
These exist for SPECIFIC อ.9-ขนย้าย rows. **อ.4/อ.14/destroy have different rows — pasting refrow4/refrow5 gives 2 dead bands + leaves their real special cases broken.**

> **⚠️ a15 is the ONE exception (Sober ruling 2026-09-03, DEF-21).** อ.15 is not a "different rows" form: `A15ReportBuilder.buildItem12` reuses `buildTransportItem12` (A15ReportBuilder.java:68), so a15 emits the **identical** `refrow4`/`refrow5` rows (codes 00014/00020) with the same data. Because those bands live only in a9-transport, a15 silently drops both rows on the real /download (Jason proved by probe; preview can't show it — the mock emits neither). The principle here is satisfied by giving **a15's own evidenceSub** those two bands (same geometry, same rows) — that IS "each form gets its own band for its special row," not "pasting into a different form," and it never touches frozen a9-transport (a15 has its own per-form evidenceSub copy). Tracked + fixed as **DEF-21 / TASK-047**. The "do NOT paste" rule stands unchanged for อ.4/อ.14/destroy.

## Method — per form (อ.14 · อ.15 · อ.4 · อ.9-destroy), each against ITS official PDF
1. Sober renders the form's official PDF to image + extracts its per-row write-in geometry (same tooling as REQ-033 R4/R7)
   and lists that form's **special-case rows** — the ones whose shape no existing shared band expresses.
2. Jason gives each special row a **dedicated row type + band** (own geometry; reuse existing fields; do NOT widen a shared band),
   + the geometry corrections (margins/x/width/band-height) where that form has the same defect.
3. Close per form: `structure_check.py` extended with that form's assertions (whitespace-free, **must fail on revert**) +
   **real /download** render (not preview — real data lengths are what broke us) → stakeholder eye = final gate.

## Hard constraints
- **a9-transport must not move** — regenerate its spec + diff to prove zero change.
- **The stakeholder's a9-transport edits are COMMITTED (in HEAD — commits 3d2871d / 949d23a), not "uncommitted / only copy"** (premise corrected by Jason 2026-09-03). Freeze is therefore **diff-provable**: `verify/frozen_check.sh` uses `git diff` (never `git status` — Porter's a6 lesson). Still: never revert/reformat/overwrite them.
- **Sober's step-1 is BLOCKED: no official PDFs exist in `project-docs/`** for อ.14/อ.4/อ.9-destroy (only OBSOLETE-A14 md). Deriving a form's special rows requires ITS official PDF and must NOT be eyeballed/invented or read from the DB → **DATA REQUEST up the chain** (see board). a15 is unblocked (its special rows = transport's, already stakeholder-verified → DEF-21).
- Every shared band touched → regression-check ALL row types that share it.
- Verify on a **real /download**; page count is NOT a criterion.
- Per DEF-17 discipline: any new @Column stays out of scope (this is presentation only, no data change).

## REQ-034 techniques + verifier (added 2026-09-03 — from the stakeholder's own edits + the DEF-23 lesson)
1. **Reclaim width from an oversized label before widening a row.** The stakeholder fixed refrow4 twice by taking space
   back from an over-sized label and spending it on the write-in runs — e.g. `ตาม` label 72px→36px, giving +27 to the
   doc-type run and +8 to the date, **without touching page width or any neighbour**. So per form: **before widening
   anything, check whether a neighbouring label field is oversized — the space is usually already in the row.**
2. **Clipping claims need a tool that MEASURES text-width vs field-width.** `clip_check.py` does NOT do this (it only
   asserts a label string appears somewhere in the render) — that gap is how DEF-23's unmeasured "~38/~60" estimate
   slipped through. For REQ-034, a real clip guarantee requires building that measurement (rendered text advance vs the
   element's width). Until it exists, any "field too narrow" claim is **unverified** — never relay it up as fact
   ([[relayed-numbers-are-claims-not-facts]]).
3. **Layout numbers are measurements, not eyeballs/estimates.** Sober specifies each form's special rows as TEXT
   (labels + write-in structure), diffs vs the official PDF, and hands geometry to the stakeholder's eye — never
   adjudicates pixels from a screenshot ([[layout-spec-as-text-not-eyeball]]).

## Task
- TASK-046 (Jason, BE). Sober supplies each form's special-row list (from its official PDF) form-by-form + verifies.

## Acceptance
- Each of the 4 forms renders its rows matching ITS own official PDF (structural gate + real /download + stakeholder eye).
- a9-transport unchanged (diff-proven). No shared band bent; regressions checked.
