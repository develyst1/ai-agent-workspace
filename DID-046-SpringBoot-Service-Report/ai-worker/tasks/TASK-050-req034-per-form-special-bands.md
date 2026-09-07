# TASK-050 — REQ-034: dedicated bands for each form's special rows (อ.14 · อ.4 · อ.9-destroy)

- **For:** Jason (BE)  · **From:** Sober (SA)  · **Ref:** REQ-034, SPEC-039, step-1 docs below
- **Depends on:** REQ-035 (done), DEF-24 (done). a9-transport FROZEN (`frozen_check.sh`) — do not touch it.

## Governing rule (stakeholder standing rule — the DEFAULT)
**Each evidenceSub row gets its OWN row type + printWhen band. Prefer duplication over bending a shared band.** The right
question is "does this row have the SAME shape as that one?" — usually no. Reclaim width from an oversized label before
widening. No new fields where the data already exists. See SPEC-039 + [[subevidence-split-rows-not-share]].

## Per-form special rows (derived from each form's own official PDF — see the step-1 docs)
- **อ.14** → `specs/REQ-034-step1-a14-special-rows.md`
  1. 🔴 **person-with-idcard** (item 6, ตัวอย่างลายมือชื่อ): official = `(n) name  สำเนาบัตรประชาชน  เลขที่ [id]  วันหมดอายุ [date]`;
     currently `person2` (name only) → id/expiry DROPPED. Own band. Confirm id/expiry source in the a14 person loop.
  2. 🟠 **ตามหนังสือขอซื้อ** (item 7): `label → run → เลขที่ → ลงวันที่`; currently refrow3. Own band (a14's own — NOT transport's
     refrow4; a14's label is the full `ตามหนังสือขอซื้อ`). Stakeholder Q: is a14's run a doc-type write-in or blank?
  3. บัตรผู้รับมอบอำนาจ (item 5): verify refrow3 doesn't clip the long label; split if it does.
- **อ.4** → `specs/REQ-034-step1-a4-special-rows.md` (no buyer block — refrow4/5 N/A)
  1. ร.ง.4 label verbatim `(ลำดับ 9)` (currently omitted).
  2. อ.2 / อ.7 long-label refrow3w rows — clip-check on a real render; split if they strain.
  3. person rows (items 3/4) already `person` — regression-verify only.
- **อ.9-destroy** → `specs/REQ-034-step1-a9destroy-special-rows.md`
  1. 🔴 **person-with-idcard** (item 12(2)): SAME shape as อ.14 item-6, currently `person2` → dropped. Own band.
  2. ข้าราชการทหาร/ตำรวจ (มาตรา 7) conditional row — confirm it should render; own band if so.
  3. ร.ง.4 `(ลำดับ 9)` + อ.2/อ.7 long labels — as อ.4.

**Cross-form note:** the person-with-idcard row recurs in อ.14 + อ.9-destroy (same SHAPE). Per the split rule, give EACH
form its own band in its own evidenceSub — same shape, not a shared band across forms.

## Verify (per form, evidence — no eyeball, no unmeasured px)
- **Real /download** of a request that actually has the data (confirm the value EXISTS first —
  [[confirm-value-exists-before-diagnosing-render]]); DATA REQ via me for sample ids if needed.
- Extend `structure_check.py` per form so each new band's write-ins render, **fail-on-revert**.
- If you claim a field clips, **measure text-width vs field-width** — don't estimate ([[relayed-numbers-are-claims-not-facts]]).
- a9-transport untouched (`frozen_check.sh`); page count is NOT a criterion; stakeholder eye = final layout gate.

## Suggested order
Start with the **person-with-idcard band** (highest impact — dropped data on 2 forms), then the label/clip items.
Do one form at a time; I review + route each render up per form.

---

## Jason 2026-09-03 — verify-first pass. **The 🔴 headline item is not a defect.**

You said to verify first and confirm the value exists before diagnosing. Doing that on the highest-impact
item stopped me building two bands for a problem that isn't there.

### 🔴 person-with-idcard is NOT dropped — on either form
The claim was: อ.14 item-6 and อ.9-destroy item-12(2) emit `person2` (name only) → id/expiry lost. Checked
all three layers:
- **Builders pass it.** `A14CheckListReportBuilder.buildPerson2` and `A9CheckListReportBuilderBase.buildPerson2`
  both pass `nz(e.getIdCardNo())` and `nz(formatOrNull(e.getExpiryDate()))`.
- **Both `person2` bands render it.** Each has a `เลขที่` static + `$F{detail}` and a `วันหมดอายุ` static +
  `$F{detail2}` (dotted).
- **Both renders show it.** a9-destroy p2, actual tokens:
  `(1) กกกกกกกก กกกกกกกกกก | สำเนาบัตรประจำตัวประชาชน | เลขที่ | X XXXX XXXXX XX X` then `วันหมดอายุ 1 ม.ค. 2569`.
  a14 p2 identical in shape.

**The only real delta vs the official is that `วันหมดอายุ` wraps to a second line instead of sitting inline.**

**And inline cannot fit — measured, not estimated:** line 1 ends at **x=522**; the `วันหมดอายุ + date` content is
**105px**; inline would need **x=633**. The widest ink anywhere else on that page is **x=551**. It overflows the
printable width by ~82px with a full-length name and a 13-digit id.

So: no data loss, and the official's one-line shape isn't reproducible at this font/width with real-length data.
**I have not built the two bands.** @Sober — please re-derive that item; if the two-line form is unacceptable the
answer is a width/shape decision for the stakeholder, not a new band.

### Done: ร.ง.4 `(ลำดับ 9)` — and it was only **a4**
Your note said a4 *and* destroy. Checked all three builders: **a14 and the a9 base already had `(ลำดับ 9)`**
(destroy inherits it). Only **a4** was missing it. Added to a4's DB builder + mock; renders in full, `clip_check`
PASS.

### Done: อ.2 / อ.7 clip-check — measured per form, no clip anywhere
| form | row | field | rendered label | verdict |
|---|---|---|---|---|
| a14 / a4 / destroy | อ.2 (`refrow3w`) | 457px | 262px | fits |
| a4 | อ.7 (`refrow2h`) | 255px | 114px | fits |
| a9-destroy | อ.7 (`refrow2h`) | 255px | see below | fits |

My first destroy measurement read **434px in a 255px field** and I nearly reported a clip. It was wrong: the
**destroy builder overrides `item5A7Label()` to a SHORT label** (`สำเนาหนังสืออนุญาต แบบ อ.7`) while the shared
mock fed transport's long one — so I was measuring mock text, not destroy's. **Third instance of the same
mock-vs-DB divergence class** (after DEF-21 and REQ-035). Fixed the mock to mirror the builder per variant.
`clip_check` PASS across all 5 forms.

### Not done, deliberately
- **a14 ตามหนังสือขอซื้อ own band** — it carries an open stakeholder question (is a14's run a doc-type write-in
  or blank?). Given the headline item's premise didn't survive contact with the code, I'd rather you re-derive
  than have me build to an unanswered question.
- **destroy มาตรา-7 conditional row** — "confirm it should render" is a data/stakeholder question, not mine.
- **Real /download per form** — not mine; DATA REQ via you.

### State
Suite **18/18**, BUILD SUCCESS. structure_check **24/24**, clip_check PASS, frozen_check PASS (a9-transport
untouched). Full tree (`verify/tree_check.sh`, nothing filtered):
```
 M src/main/java/com/smart/report/config/SecurityConfig.java          <-- still NOT mine (3rd report)
 M src/main/java/com/smart/report/report/checklist/a4/builder/A4CheckListPreviewBuilder.java
 M src/main/java/com/smart/report/report/checklist/a4/builder/A4CheckListReportBuilder.java
 M src/main/java/com/smart/report/report/checklist/a9/builder/A9CheckListPreviewBuilder.java
?? verify/
```
`SecurityConfig.java` remains the unreverted ungated-download change. Reverted once, came back byte-identical,
not reverted again; still awaiting the human via Porter. Preserved copy in `project-docs/preserved/`.

### One process note
Three of the mock-vs-DB divergences have now each cost a round (DEF-21's invisible drop, REQ-035's label, this
one's false clip). The mock is not a fixture — it is the only thing any preview-based check ever sees. Worth a
standing rule: **when a builder value changes, the mock changes in the same commit**, or the preview quietly
starts certifying something the DB path never produces.

---
## Sober review — 2026-09-03 — my headline premise was wrong; Jason's verify-first was right
I verified independently: `person2` band renders `เลขที่`+`วันหมดอายุ`, `buildPerson2` passes id+expiry. **The
person-with-idcard row is NOT dropped** on either form — my step-1 read the type name, not the band (assume-from-name;
own it). The only delta is `วันหมดอายุ` wrapping to line 2, and inline is physically impossible (Jason measured x=633
needed vs x=551 page max). **NOT a band.** Both step-1 docs corrected.

**ACCEPTED:** ร.ง.4 `(ลำดับ 9)` = a4-only fix (a14/base already had it — my "a4+destroy" was wrong); อ.2/อ.7 clip-check
measured clean on all forms; the destroy 434px false-clip was the mock feeding transport's long label (destroy overrides
`item5A7Label()` short) — 3rd mock-vs-DB divergence, mock fixed. Good verify-first discipline throughout.

**REQ-034 remaining = 2 stakeholder questions only (routed to Porter), no speculative band work:**
1. อ.14 `ตามหนังสือขอซื้อ`: is the long run a doc-type write-in (like transport's REQ-035) or blank? (own band either way, shape depends on answer)
2. อ.9-destroy `ข้าราชการทหาร/ตำรวจ (มาตรา 7)`: is it a real checklist row that should render? (own band if yes)
3. person-with-idcard: accept the 2-line wrap (inline impossible), or does the stakeholder want a font/width change? (their call, not a band)
Once answered I write the small follow-up; otherwise REQ-034 is effectively done bar those.
