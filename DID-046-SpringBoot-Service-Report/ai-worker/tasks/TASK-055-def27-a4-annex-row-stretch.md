# TASK-055 — DEF-27: อ.4 annex row borders must grow with the wrapped รายการ text

- **For:** Jason (BE)  · **From:** Sober (SA)  · **Ref:** DEF-27 (stakeholder-marked: `project-docs/A4-ANNEX-what-porter-sees.md`)
- **Depends on:** nothing. a4 annex subreport only.

## Mechanism — CONFIRMED in the jrxml (Porter's step 1, done before any change)
**File:** `src/main/resources/reports-045/request-a4/subreport/request-a4-component.jrxml`, detail band **line 25**
(`<band height="19" splitType="Stretch">`), 7 textField cells (lines ~26-65), each with a `<box><pen lineWidth="0.75"/>`
border, `y="0" height="19"`, `textAdjust="StretchHeight"`, and **NO `stretchType`** (`grep -c stretchType` = 0).

**Why the border escapes:** `textAdjust="StretchHeight"` grows a field only to fit **its own** text. Only the รายการ
cell (x=75 w=165) has multi-line content, so only *its* box grows. The band is `splitType="Stretch"` so the band grows
to the tallest element (รายการ) — but the other **6 cells keep height 19**, so their bottom borders sit at y=19 while
รายการ's box extends to ~y=60. The wrapped รายการ lines 2-4 render **below the 6 short cells' bottom borders = outside the
table frame**, with only รายการ's own partial box. This matches the stakeholder's marked file (#?1) exactly. Porter's
earlier guess ("last 3 columns missing vertical rules") was wrong — the fault is the row not growing as a unit.

## Do
Make **every** cell stretch to the band's stretched height so all 7 borders extend to the full wrapped height together:
- Add `stretchType` to all 7 cells so each grows to the container/band height (JR7: try `ContainerHeight`; if that
  attribute/behaviour doesn't compile or render right in JR 7.0.4, `RelativeToTallestObject` is the fallback — **confirm
  which one actually renders full-height borders**, don't assume the attribute name).
- Keep `textAdjust="StretchHeight"` on รายการ (it's what drives the row height). Do not hardcode a taller fixed height —
  it must grow to whatever the real text needs (row 2 of 38427 is 4 lines; other rows are 1).
- Nothing outside the table frame; header row unaffected.

## Verify (evidence — a check that would have CAUGHT this, per Porter #3)
- **structure_check assertion that MEASURES geometry, fail-on-revert:** render the annex, find the table's bottom-border
  y (max y of the last data row's box), and assert **no รายการ text token has y greater than that** (i.e. no annex text
  below the table). "Text appears somewhere" is NOT sufficient — the bug is text appearing *outside the frame*. Falsify:
  remove the stretchType → wrapped lines drop below the border → assertion fails.
- **Real /download of 38427** (row 2 = `เชื้อปะทุไฟฟ้า … MILLISECOND ELECTRIC DELAY DETONATOR (SEMI-FINISHED GOODS) ชนิดถ่วงเวลา`,
  4 lines): all 7 columns' borders span the full 4-line height; nothing outside the table. A single-line sample cannot
  exercise this — confirm the multi-line row is present first.
- Build green; header + single-line rows unchanged.

## NOT in scope (stakeholder has not marked these — leave alone)
`#?2` อ.8 3 blank columns (no-data vs wrong join `REQUEST_DTL_ID=VW_REQUEST_DTL.ID` — separate, Porter has a query out);
`#?3/#?4/#?5` (qty clipping, vertical alignment, minimum rows) — untouched until the stakeholder marks them.

## Acceptance
On a real /download of 38427, the multi-line row 2 has all 7 cell borders spanning its full height, no text outside the
frame; geometry structure_check assertion passes + fails-on-revert; single-line rows + header unchanged.

---

## Done — Jason 2026-09-08

### The fix
`stretchType="ContainerHeight"` on all 7 detail cells of `request-a4-component.jrxml`. `textAdjust`
stays on รายการ (it drives the row height); no hardcoded taller height. **a4 annex subreport only.**

You asked me to confirm which attribute value actually works rather than assume — **`ContainerHeight`
compiles and renders correctly in JR 7.0.4**, so `RelativeToTallestObject` was not needed. There was no
`stretchType` anywhere in the project to copy from (`grep` = 0), so this is the first use.

### Measured, before and after
The preview already reproduces the defect (row 1's รายการ = "โซเดียมเปอร์คลอเรท (Sodium Perchlorate)"
wraps to 2 lines), so I had a repro without needing 38427.

| | horizontal borders on the annex page |
|---|---|
| before | 85, 119, **138 — PARTIAL: 6 segments, 337px of 502px, no รายการ span**, 151 |
| after | 85, 119, **151**, 170 — **every border 7 segments, full 502px** |

The stray partial border at y=138 is gone: the row now closes as a unit at 151, and the wrapped line
(y=135, ends ~148) sits inside it. Verified separately that **no annex text token renders below the
table's last border**.

### The assertion — on the defect's real signature
Added to `structure_check.py`: for the annex table, **every horizontal border must span the full table
width**, plus no annex text below the last border. If one cell grows alone, that row's bottom border is
partial — which is exactly what the bug looks like geometrically.

"Text appears somewhere" would **not** have caught this, as you flagged: the text was always present,
just outside the frame.

**Falsified:** removed `stretchType` from all 7 cells →
`FAIL DEF27 annex border at y=138 is PARTIAL (337px of 502px, 6 segments) — a cell grew alone`.
Restored → **41/41**.

### ⚠️ Side effect worth a ruling — vertical alignment (your `#?4`, which is NOT in scope)
The cells carry `vTextAlign="Middle"`. While they were stuck at height 19 they centred in a *short* box;
now they centre in the *grown* row. So on a multi-line row the six single-line cells move from the top of
the row to its middle — row 1's short cells went from y=121 to y=128.

That is inherent to the row growing as a unit, not a separate change I made, and I think it reads better
(it's how a table row normally behaves). But it does touch `#?4`, which the stakeholder has not marked —
flagging so nobody is surprised. If they want top-alignment on multi-line rows that is a one-attribute
change (`vTextAlign="Top"`), your call.

### ⚠️ Not mine — `request-a4-main.jrxml` also changed
`git status` shows it modified; I did not touch it. Two changes: an attribute reorder (`bold`/`pdfEmbedded`
swapped — cosmetic, looks like a Jaspersoft Studio save) and **`ลำดับ` header cell `width 33 → 30`**.

I checked rather than assumed: the annex **data** seq cell is `width="30"`, so this aligns the header to
the data column — and the render confirms the vertical rules are now continuous through header and rows
(x=53, 83=53+30, 128, 293, 343). It looks deliberate and consistent with this defect family, so **I left it
alone** and my DEF-27 assertions pass with it in place. Presumably the stakeholder, same pattern as
a9-transport.

### State
Suite **19/19**, BUILD SUCCESS. structure_check **41/41**, clip_check PASS, frozen_check PASS
(a9-transport untouched). Header and single-line rows unchanged. Nothing outside `#?1` touched —
`#?2/#?3/#?5` left alone.

**Still open, not mine:** real /download of **38427**, whose row 2 is the 4-line
`เชื้อปะทุไฟฟ้า … (SEMI-FINISHED GOODS) ชนิดถ่วงเวลา` — confirm that row is present in the sample first.
The preview's 2-line row exercises the same mechanism but 4 lines is the stakeholder's actual case.

---
## Sober review — 2026-09-08 — ACCEPTED (DEF-27 code CLOSED)
Verified: `stretchType="ContainerHeight"` on all 7 component cells (was 0); the assertion is on the real signature (every
annex horizontal border spans the full 502px + no text below the last border), falsified (41/41). Good — you confirmed the
JR7 attribute renders rather than assuming, and the check measures the *outside-the-frame* symptom, not "text appears."
DEF-27 = code CLOSED; QA = real /download 38427 (4-line row 2).

**Two flags — both correctly handled, routing up, no action from you:**
1. **`request-a4-main.jrxml` = NOT yours** (verified: Studio attr reorder + `ลำดับ` header width 33→30 aligning to the
   width-30 data column). Same class as SecurityConfig — a stakeholder direct edit, consistent with the annex family,
   DEF-27 asserts pass with it. Correct to leave it; routing to Porter to confirm it's theirs. No revert.
2. **vTextAlign side-effect (#?4, unmarked):** the single-line cells now centre in the grown row — inherent to "row grows
   as a unit," reads like a normal table. #?4 is unmarked so I'm NOT changing it; flagged to stakeholder that if they want
   top-align on multi-line rows it's a one-attribute change. Left as Middle.
