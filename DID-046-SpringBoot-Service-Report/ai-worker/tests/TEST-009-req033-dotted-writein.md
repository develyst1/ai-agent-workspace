# TEST-009: REQ-033 `(1)/(2)` permit rows → label + dotted write-in (5 forms)

- Source: REQ-033 / SPEC-038 / TASK-044 (R1+R2)
- Status: TEST_PASSED — all 5 forms; destroy items 3/4 regression clean
- Environment: own clean build, `:33019`, dev, UAT-wired, read-only
- Tested: 2026-09-01 by Tanya

## Cases — eyeball-render each form's converted rows (blank shows the dotted line; a value sits ON it)
| Form / id | Converted row(s) | Rendered | Result |
|-----------|------------------|----------|--------|
| อ.9 transport / 38336 | item-12 (1) ตามหนังสือขอซื้อ, (2) ตามหนังสือคณะกรรมการ — เลขที่/ลงวันที่ | dotted write-in lines, blank → **lines show** | ✅ |
| อ.9 **destroy** / 38362 | item-12 **(1) only** (วัน เดือน ปี ที่จะทำการกำจัด/ทำลาย) | dotted line with the **value `18/08/2569` sitting on it** (populated case) | ✅ |
| อ.14 / 27300 | item-12 (3) หนังสือมอบอำนาจ ลงวันที่, (5) บัตรผู้รับมอบ เลขที่/วันหมดอายุ (flag-1 include) | dotted write-in lines, blank → lines show | ✅ |
| อ.15 / 18041 | item-12 (1)/(2) (transport clone) | dotted write-in lines, blank → lines show | ✅ |
| อ.4 / 38427 | item-6 §4 (อ.8 ฉบับเดิม) (1)(2) ที่…ลง… (min-2 slots) | dotted write-in lines, blank → lines show | ✅ |

All five: HTTP 200, no layout overlap (label + dotted line, value on the line when present), no literal `null`.

## ⭐ destroy items 3/4 regression (the stakeholder-verified risk) — PASS
On a9-destroy/38362, only item-12(1) changed. The **person band (items 3/4)** and the DEF-15 evidence
ticks render **exactly as before**: same 7 correct ticks (จดทะเบียน·มอบอำนาจ·ร.ง.4·บัตรผู้เสียภาษี·ภ.พ.20·
แผนผังโรงงาน·อ.10 12(7)), items 3/4 = empty person headers (unchanged), items (2)-(9) of item-12 still
plain (not converted). Consistent with Jason/Sober's pure-addition diff (+32/-0, person band 0 changes).

## Verdict (R1/R2 — SUPERSEDED)
Passed the earlier stacked-dotted layout. **Superseded by R3→R4:** R3's "own-line" bands overflowed a page
and were rejected; R4 reworked it to the **INLINE** layout (label + dotted + label + dotted on one line)
matching the rendered official form. Re-verified below.

---

## R4 re-verify — INLINE layout, all 5 forms — 2026-08-31 (real data, clean build, src `.jasper`=0 → target fresh from R4 `.jrxml`)
| Form / id | Rendered (R4 inline) | Pages | Result |
|-----------|----------------------|-------|--------|
| อ.9 transport / 38336 | ร.ง.4 full **+(ลำดับ 9)+วันหมดอายุ inline**; อ.2/อ.7 เลขที่·ลงวันที่·วันหมดอายุ inline; item-12 buyer rows inline dotted | **5** ⚠️ | ✅ layout PASS |
| อ.9 **destroy** / 38362 | item-12 **(1)** = `18/08/2569` on the dotted line (inline); (2)-(9) plain; item 5 inline (อ.7 เลขที่ 5/2569); **items 3/4 person band clean inline (1)(2)** | 4 | ✅ |
| อ.14 / 27300 | item-12 (3) หนังสือมอบอำนาจ ลงวันที่, (5) บัตรผู้รับมอบ เลขที่·วันหมดอายุ, ตามหนังสือขอซื้อ → inline dotted | 4 | ✅ |
| อ.15 / 18041 | transport-clone: item-12 buyer rows + item-5 sub-items inline dotted | 4 | ✅ |
| อ.4 / 38427 | item-6 §4 อ.8-ฉบับเดิม (1)(2) `ที่ ___ ลง ___` inline dotted; item-5 inline | 4 | ✅ |

- All 5: HTTP 200, **0 literal null**, no label/value overlap, no Thai mid-word breaks, inline dotted fills.
- **Notes respected:** (n)-permit rows have **no tick column** (form design); DESTROY's own `(3)/(1)` typo
  **not reproduced** (item-12 numbered (1)(2)(3)… correctly); อ.7 hybrid n/a (no อ.7 data).
- **⚠️ a9-transport = 5 pages on real 38336** (Sober's R4 reference was the **mock**, 4 pages). The layout is
  inline-correct — item-12's long buyer rows on real data flow to a continuation page, then the annex is its
  own page. Not the R3 own-line bug (that was fixed); it's real-data volume. Flagging so the stakeholder
  isn't surprised by a 5-page real transport; Porter's call whether that needs tightening.

## Verdict (R4) — WRONG, REVERSED
~~REQ-033 R4 → TEST_PASSED on all 5 forms.~~ **Retracted. See DEF-20 below.**

## DEF-20 — R4 inline fields collide with a wrapped long label — TEST_FAILED (2026-08-31)
Found when the stakeholder handed me a **real `/download` a9-transport** (token …`grhjhjhA`, 5 pages). On item-12
the **"ตามหนังสือคณะกรรมการตามกฎกระทรวง…พ.ศ. ๒๕๕๓"** row (the longest write-in label in the block), the inline
`เลขที่ ___` / `ลงวันที่ ___` fields sit at fixed x-positions, but the label is long enough to **wrap to a 2nd/3rd
line** — so `ลงวันที่` prints **on top of** the label's wrapped text `ของหน่วยราชการและรัฐวิสาหกิจ` (word coords:
`ลงวันที่` y≈310 over `ของหน่วยราชการ…` y≈307), and `เลขที่` collides with `…และสิ่งเ|อาวุธปืน`. A text overlap on a
government form. Fix: the inline band must handle a multi-line label (drop the fields below the wrapped label, or
give the label its own reserved height). Route to Sober/Jason.

**Why my R4 pass missed it (owning the miss):** I verified the inline layout on 38336 + a15/a14/a4/destroy, but
(a) 38336's `ตามหนังสือคณะกรรมการ` fields were blank and the row landed on a later page I only checked
structurally; (b) Sober's reference was the **mock**, whose label is abbreviated (`…ฯ…`) so it fits on one line and
never collides. I confirmed "the fields are inline" without stress-testing the **worst-case longest label** where the
inline placement breaks. "Looks inline" was the floor, not the pass — I should have zoomed the longest row and/or
asked for a request whose `คณะกรรมการ` fields are populated.

## Verdict — TEST_FAILED (DEF-20). REQ-033 reopened; back to Sober/Jason.
