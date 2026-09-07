# TASK-046 — REQ-034 / SPEC-039: dedicated band per special row → อ.14 · อ.15 · อ.4 · อ.9-destroy

- Assignee: Jason (BE). Source: SPEC-039. a9-transport = reference, **frozen**.
- **Step 1 is Sober's**: each form's special-row list, derived from ITS official PDF. Not delivered yet,
  so the per-form band work has not started.

## 2026-09-03 — Jason: pre-work while step 1 is pending. One URGENT find.

### 🔴 URGENT — อ.15 silently drops two rows on the real /download path
`A15ReportBuilder` reuses `buildTransportItem12(...)` from `A9CheckListReportBuilderBase`, which now emits
the stakeholder's new types **`refrow4`** and **`refrow5`**. Those bands exist **only in a9-transport's**
`evidenceSub.jrxml`. a15's template has no band matching either `printWhenExpression`, so Jasper renders
**nothing** — the row and its tick vanish with no error.

Rows lost from real อ.15 output:
- `ตามหนังสือขอซื้อ` (CHECKLIST_CODE **00014**) — refrow4
- `สำเนาบัตรประชาชนผู้รับมอบอำนาจ` (CHECKLIST_CODE **00020**) — refrow5

**Proven, not inferred.** No preview can show this: the a15 preview runs the mock
(`A9CheckListPreviewBuilder`), which emits **zero** refrow4/refrow5 — the same mock-hides-the-DB-path trap
as REQ-033. So I injected the two rows into the mock exactly as the DB builder emits them and rendered both
forms:

| | refrow4 row | refrow5 row |
|---|---|---|
| a9-transport | **PRESENT** | **PRESENT** |
| a15 | **MISSING** | **MISSING** |

Probe reverted; tree clean. Blast radius is a15 only — a9-destroy/a14/a4 have their own item-12 builders and
never reach these types (`buildTransportItem12` callers: A9Transport, A15).

**I did not fix it.** SPEC-039 says explicitly *"Do NOT paste refrow4/refrow5 into other forms."* That rule
assumed the other forms have *different* rows — but a15 shares the builder, so these are the **same two rows
with the same data**, and it may be the one form where the bands legitimately belong. That's a spec call, not
mine. @Sober — rule on it; the fix is small either way (add the two bands to a15, or give a15 its own types).

### SPEC-039 premise correction: the stakeholder's edits are **committed**, not uncommitted
The spec's hard constraint says *"UNCOMMITTED and the only copy — never revert/overwrite."* They are in
**HEAD** (`git show HEAD:…request-a9-transport/…evidenceSub.jrxml` contains refrow4/refrow5; commits
`3d2871d`, `949d23a`), and the folder is clean. Good news — the freeze no longer rests on nobody touching
the file; it is diff-provable. Added **`verify/frozen_check.sh`** (uses `git diff`, never `git status` —
the distinction Porter hit on the a6 false alarm). Currently PASS.

### structure_check.py was asserting MY R7 design, not the stakeholder's
It needed repair before it can be extended per form (SPEC-039 step 3). Three real bugs, all found by running
it against the frozen reference:
- **hardcoded page indices** — a9-transport is **6 pages** now with evidence starting on page 3, so
  `doc[1]/doc[2]` no longer pointed at the form. It located pages by index and would have kept "passing"
  while checking the wrong thing. Now locates pages by content.
- **D1 false positive** — the stakeholder's `refrow3` concatenates `$F{label} + $F{note}` into one field, so
  the label token now reaches the next field's dotted rule. Tightened to the real question: a rule *starting
  left of* the label. Re-falsified on a15 (not frozen) — still fires on the injected R5 defect.
- **D4 page-boundary** — the `(1)/(2)` rows sit on the next page; the check stopped at the page edge.

→ **17/17 PASS against the frozen a9-transport.** Note for the record: Sober's earlier "re-ran, exit 0" was
against my R7 build; after the stakeholder's commit landed it was 2 failures until the above repairs.

### Also factual, not actioned (a9-transport is frozen, page count is not a criterion)
a9-transport now renders **6 pages** with a **2-line orphan page 2** (`7. ระยะเวลา`, `8. เอกสารหลักฐาน`
spilled off page 1). Reporting, not touching.

### State
Suite **15/15**, BUILD SUCCESS. `structure_check` 17/17 · `clip_check` PASS 12/5 · `frozen_check` PASS.
Working tree clean apart from the pre-existing `SecurityConfig.java` and my untracked `verify/`.

**Blocked on:** Sober's per-form special-row lists (SPEC-039 step 1) + the a15 ruling above.
