# REQ-034: Replicate the stakeholder's a9-transport layout technique to the other four forms

- Status: READY_FOR_SA
- Priority: HIGH
- Requested: 2026-09-03 by human (dev@smartalliance.co.th)
- Scope: **อ.14 · อ.15 · อ.4 · อ.9 destroy**. อ.9 transport is the **reference — do not touch it.**
- Supersedes the remaining replication half of TASK-045.

## Context
The stakeholder took a9-transport the rest of the way **by hand** after our R7, because our replication
approach was still producing rows that did not match the official form. Their edited a9-transport is
now the **only correct form**, and it is ahead of the other four.

This REQ is not "apply a fix". It is: **understand what they did and why, then do the same thinking on
each remaining form.** A blind copy of their XML will not work — see "Why copying is wrong" below.

## The technique, as observed (mechanically extracted, not eyeballed)

`request-a9-transport/subreport/request-a9-evidenceSub.jrxml` has **13 bands**; a15/a14/a4/a9-destroy
have **11**. The two extra bands are new dedicated row types:

| row type | present in |
|---|---|
| `refrow5` | a9-transport only |
| `refrow4` | a9-transport only |
| `refrow1` `refrow3` `refrow3w` `refrownum` `refrowmid` `refrow2h` `person` `person2` `doc` `docsub` `employer` | all five |

**No new field names were introduced** — the extra bands reuse the existing field set with different
geometry. So the change is: *same data, dedicated presentation*.

### The principle
> **When a row cannot be expressed by an existing shared row type, add a NEW row type with its own
> band — do not bend a shared band to accommodate it.**

This is the direct answer to the failure the stakeholder called out earlier:
*"นาย เอามาใช้ร่วมกัน ฉันเลย เห็น checkbox ข้างหน้าด้วย พอฉันเอาออก แล้วย่อ ให้โอเค ก็เลยเกิดปัญหา"*
Reusing one band across rows with genuinely different shapes forced compromises (stray checkboxes,
wrong indents, glued values) that then had to be patched, which broke other rows using the same band.
Sharing was the root cause, not the fix.

Alongside this, they made small geometric corrections — margins, element x/width, band heights.

## Requirement
For **each** of อ.14 · อ.15 · อ.4 · อ.9 destroy:

1. **Study the stakeholder's a9-transport edit first** — the two new row types, what makes those rows
   structurally different, and the geometry adjustments. Write down the principle you extracted before
   editing anything.
2. **Identify that form's own special-case rows** against **its own official PDF**. They are *not*
   necessarily the same rows as a9-transport's. Each form gets the rows it actually needs.
3. Give each special-case row a **dedicated row type + band**. Do not widen or re-purpose a shared band.
4. Apply the geometry corrections where that form has the same defect.

## ⚠️ Why copying a9-transport's XML is wrong
`refrow5` / `refrow4` exist because of specific rows in the อ.9 ขนย้าย form. อ.4 and อ.14 are different
forms with different rows. Pasting those two bands in would produce two unused bands and leave each
form's real special cases still broken. **Extract the principle, then re-derive per form.**

## Acceptance Criteria
- [ ] Each of the four forms renders its rows matching **its own** official PDF.
- [ ] No shared band was modified in a way that changes a row it is shared with — **regression-check
      every row type after each edit**, including on a9-transport (which must not move at all).
- [ ] a9-transport output is **byte-for-byte unchanged in structure** (regenerate its spec and diff —
      it must be identical). It is the reference; if it moves, the change is wrong.
- [ ] a6 unchanged.
- [ ] `structure_check.py` extended per form and **proven to fail on revert** for each new assertion.
- [ ] Verified on a **real `/download`** for each form, not preview/mock — real data lengths are what
      broke layout repeatedly.

## Constraints
- **The stakeholder's a9-transport edits are UNCOMMITTED in the working tree.** They are the reference
  and the only copy. Do not revert, reformat, restage or overwrite those files. Git remains the
  human's alone.
- Layout sign-off is the **stakeholder's eye on a real download** — never an agent's. Our mechanical
  diff is the gate *before* it reaches them, not a substitute for it.
- Page count is **not** a criterion (it varies with data).

## Note for SA — a6: RESOLVED, no action
I flagged `request-a6-evidenceSub.jrxml` as modified. **It is not.** Content is byte-identical to HEAD
(md5 matches, `git diff` empty); the `M` flag was stale index metadata from a build touching the file.
a6 is untouched. **Ignore — do not investigate.**

My error: I reported from `git status` without running `git diff`. `git status` answers "did the file
get touched", not "did the content change" — only the second one is a defect signal.

**Scope boundary confirmed by the stakeholder:** they edited **only** the `request-a9-transport`
folder. Any other difference in the tree is ours.

## Questions
(SA Lead asks here; Porter answers as `> answer: ...`)
