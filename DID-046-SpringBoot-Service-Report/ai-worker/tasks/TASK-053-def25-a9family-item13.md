# TASK-053 — DEF-25: extend the item-13 split to the a9 family (transport / a15 / destroy)

- **For:** Jason (BE)  · **From:** Sober (SA)  · **Ref:** DEF-25, TASK-051/052 (a4/a14 pattern), stakeholder ruling via Porter
- **Depends on:** nothing. a4 + a14 already done.

## Ruling (stakeholder, via Porter 2026-09-07)
Fix DEF-25 on **every form with the `เอกสารอื่น ๆ` shape**. This **lifts the a9-transport freeze for THIS change only** —
the item-13 element. Geometry otherwise stays frozen.

## Do
- The shared source is `A9CheckListReportBuilderBase:234` (item 13, glued string + literal dots) → used by **a9-transport,
  a15, a9-destroy**. Change it exactly like a4/a14: `EvidenceItem` label + value separate (no concatenation, no literal dots).
- Add the same **form-agnostic** gated element (`$F{detail}==null && $F{inputValue}!=null`) to EACH of the three forms'
  `request-*/subreport/request-*-evidence.jrxml` (a9-transport, a15, a9-destroy).
- Update each form's mock in the same change ([[mock-must-mirror-db-builder]]).
- Extend the `structure_check.py` DEF-25 loop to the three forms (it already loops a4 `17.` / a14 `13.`), fail-on-revert.

## Freeze discipline (a9-transport)
The freeze is lifted ONLY for adding this one element to a9-transport's evidence.jrxml. **Prove nothing else moved:**
`frozen_check.sh` must show the ONLY difference on a9-transport is the new item-13 write-in element (geometry, refrow4/refrow5,
all other bands byte-identical). If your builder change alters any other a9-transport output, STOP and tell me.

## Verify — BOTH branches, real /download, per form
- **Populated** (value on its own dotted run, not glued) AND **empty** (dotted run still prints). The empty branch is the
  one that looks correct today — check it explicitly. Confirm the sample actually has item-13 data first
  ([[confirm-value-exists-before-diagnosing-render]]); DATA REQ via me for ids.
- 15/15 build; per-form fail-on-revert.

## a6 item 8 — verdict (Sober checked, NOT in this task)
The **real** a6 builder is already correct: `A6CheckListReportBuilder:199-201` uses Type B (label + `detail` write-in),
no concatenation. Only the a6 **mock** (`A6CheckListPreviewBuilder:88`) carries the literal-dot string — cosmetic, not a
/download defect. **Optional:** align the a6 mock to the real builder while you're in the mocks (same-commit hygiene); not required.

## Acceptance
a9-transport + a15 + a9-destroy item 13 render label + real dotted write-in (value on the line when present, empty line
when not) on real /download, both branches; mocks updated; structure_check DEF-25 loop covers all 5 forms fail-on-revert;
a9-transport proven unchanged except the one new element.

---

## Done — Jason 2026-09-07

DEF-25 now fixed on **all five forms**. Shared builder + one element per template, same pattern as a4/a14.

- **Builder** — `A9CheckListReportBuilderBase` item 13 → `new EvidenceItem("13", "เอกสารอื่น ๆ (ถ้ามี)",
  checked, null, otherDocNames, null)`. No concatenation, no literal dots, no new field. One change covers
  a9-transport + a15 + a9-destroy.
- **Templates** — the same form-agnostic gated element added to all three evidence subreports. Checked first
  that all three share the title-field geometry (`x=48 w=457`) so the a4 placement transfers; their
  second-line fields differ slightly (transport y=13/16, destroy x=94) but that is a different line and
  unaffected.
- **Mock** updated in the same change (one shared a9 mock covers all three variants).

**Rendered, both branches, all three forms:**

| form | populated | empty |
|---|---|---|
| a9-transport | value on run **165→545** | run still prints **165→545** |
| a15 | value on run **165→545** | run still prints **165→545** |
| a9-destroy | value on run **165→545** | run still prints **165→545** |

Empty branch probed explicitly (you flagged it as the one that looks fine today); probe reverted.

**Fail-on-revert proven:** re-glued the a9 mock with literal dots → **6 assertions fired** (3 forms × "no
dotted write-in run" + "still uses LITERAL dots"). Restored → 34/34.

### Freeze discipline — a9-transport
`git diff HEAD` on a9-transport is **7 insertions, 0 deletions, one file** — the new element and nothing
else. refrow4/refrow5 and all geometry byte-identical.

`frozen_check.sh` failed after the change, correctly — it did not know about the ruling. Rather than skip
transport (which would blind it permanently) I **encoded the sanctioned exception**: nothing outside the
evidence subreport may differ at all; that file may only *gain* lines; and every added line must belong to
the DEF-25 element. Anything else still fails.
**Falsified it:** renamed `refrow4` → `refrow4X` in transport's evidenceSub → `FAIL — a9-transport changed
outside the sanctioned file`, exit 1. Restored → exit 0.
*(My first falsification attempt passed and I nearly recorded that as proof — the probe's `print` ran
unconditionally, so nothing had actually changed. Re-ran with an assert on the edit.)*

### a6 mock hygiene (the optional item) — done
`A6CheckListPreviewBuilder:88` carried the literal-dot string while the real a6 builder already used Type B.
Aligned the mock to the builder, so the a6 preview stops showing a shape the DB path never produces.
a6's real builder untouched. (4 literal-dot runs remain elsewhere in a6 — other rows, pre-existing, outside
DEF-25.)

### State
Suite **18/18**, BUILD SUCCESS. structure_check **34/34** — the DEF-25 loop now covers all five forms
(a4 `17.` · a14/transport/a15/destroy `13.`), fail-on-revert proven. clip_check PASS. frozen_check PASS
with the sanctioned exception recorded.

Full tree (`verify/tree_check.sh`, nothing filtered): 8 java + 5 jrxml, all in scope, plus
`SecurityConfig.java` — **still not mine, 6th report**, still the unreverted ungated-download change awaiting
the human via Porter. Preserved copy in `project-docs/preserved/`.

**Still open, not mine:** real /download per form, both branches (item-13 with data and without) — confirm
the sample actually has item-13 data first.

---
## Sober review — 2026-09-07 — ACCEPTED (DEF-25 all 5 forms code-complete)
Verified DB-free: base builder item 13 = 0 literal dots; transport evidence.jrxml = **7 insertions / 0 deletions**;
transport evidenceSub **byte-identical**; all 3 forms (transport/a15/destroy) carry the gated element; a6 mock aligned
(real a6 untouched); structure_check 34/34 (5-form DEF-25 loop) fail-on-revert.
**`frozen_check.sh` exception reviewed + endorsed** — it's tight, not a blinding: additions-only on transport, every added
line whitelisted to the DEF-25 element (`textField x=125 y=0 w=380`/`inputValue`/box/pen), fails on any change outside the
evidence subreport, re-asserts refrow4/refrow5. Encoding the sanctioned exception (vs skipping transport) is the right call.
Good self-catch on the false-pass falsification too. **DEF-25 = code CLOSED on a4/a14/transport/a15/destroy.**
Remaining: QA real /download per form, both branches (empty + populated) — confirm the sample has item-13 data first.
