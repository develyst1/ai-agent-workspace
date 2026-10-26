# TASK-049 — DEF-24: null-guards + remove debug printlns in buildTransportItem12 (a9/a15 500s)

- **For:** Jason (BE)  · **From:** Sober (SA)  · **Ref:** DEF-24 (Porter raised), REQ-035 follow-up
- **Urgent** — hits delivered forms (อ.9 transport + อ.15). All line numbers = `A9CheckListReportBuilderBase.java` (verified in HEAD, `git diff` empty).

## The defect (SA-verified in source, DB-free)
In `buildTransportItem12`, `buyer = firstOrNull(buyers)` (line 305) is **null when a request has 0 active buyer rows**,
and `doc00014 = docByChecklist.get(...)` (line 311) is **null when the request has no 00014 document**. Three
unguarded dereferences of those crash → HTTP 500 on any such อ.9/อ.15 request (DEF-11/DEF-17 family):

1. **Line 313** `System.out.println("LOGgggg : " + doc00014.getIssueDate());` — NPE if doc00014 null.
2. **Line 314** `System.out.println("LOGgggg2 : " + buyer.getBuyerDocNo());` — NPE if buyer null.
3. **Line 348** `"เลขที่", buyer.getBuyerDocNo(),` — NPE if buyer null.
4. **Line 349** `"ลงวันที่", doc00014.getIssueDate() != null ? doc00014.getIssueDate() : null` — the guard is on the
   *value*, but it calls `.getIssueDate()` on a possibly-null `doc00014` → NPE if doc00014 null.

Lines 353–354 four lines below already show the correct pattern (`buyer != null ? ... : null`,
`doc00015 != null ? ... : null`).

## Do (no layout change, no data-source change — the stakeholder's edits stand)
1. **Remove the two debug printlns (lines 313–314) entirely.** They are throwaway `LOGgggg`/`LOGgggg2` logging that
   (a) NPE on null and (b) print buyer/doc data to stdout (DEF-16 family). If anyone claims them as active debug,
   coordinate via me first — but as-is they crash the endpoint, so they go.
2. **Guard line 348:** `buyer != null ? buyer.getBuyerDocNo() : null`.
3. **Guard line 349:** `doc00014 != null ? doc00014.getIssueDate() : null` (guard the object, not the value).
4. **Fix the stale comment (line 343):** it says `BUYER_DOC_NO เลิกใช้` but line 348 now reads `buyer.getBuyerDocNo()`
   (the stakeholder moved เลขที่ back to `T_T_REQUEST_BUYER`). Make the comment match the code.
5. Shared builder → covers **a9-transport + a15**. No change to `refrow4`/geometry/REQ-035 binding.

## Verify (evidence)
- **Unit test the null paths** (precedent exists — PersonCheck Mockito test): buyer=null and doc00014=null each →
  builds without throwing, เลขที่/ลงวันที่ blank. This is the on-point DB-free proof.
- Build 15/15; structure_check unchanged (still 26, no layout touched).
- **Real /download** (QA, via me→Porter): an อ.9/อ.15 with **no buyer row** and/or **no 00014 doc** → **200, not 500**.
  ⚠️ Note for the REQ-035 QA smoke: **38406 has null `BUYER_DOC_NO`** and may lack a 00014 doc → it would 500 on THIS
  bug, confounding the BUYER_DOC_TYPE-column smoke. Fix DEF-24 first, then smoke.

## Acceptance
No unguarded `buyer.`/`doc00014.` deref in `buildTransportItem12`; debug printlns gone; comment matches code; null-path
unit test passes; a9/a15 render 200 with empty buyer/doc. REQ-035 binding + geometry untouched.

---

## Done — Jason 2026-09-03

### The four fixes
1. **Debug printlns (313–314) removed.** `grep System.out.print` over `checklist/a9/` → **none left**.
2. **Line 348 guarded:** `buyer != null ? buyer.getBuyerDocNo() : null`.
3. **Line 349 guarded on the OBJECT:** `doc00014 != null ? doc00014.getIssueDate() : null` — the old form
   tested the value while dereferencing a possibly-null object.
4. **Stale comment fixed** in the builder, **and in `RequestBuyerEntity` (line 58)** which carried the same
   wrong fact (`BUYER_DOC_NO เลิกใช้` next to a column the code now reads). Same falsehood, two places.

**I did not stop at the four listed.** Swept every `buyer.` / `doc000NN.` / `move.` / `license.` dereference in
`buildTransportItem12` against its guard → **0 unguarded left**. The four were the whole set, now confirmed
rather than assumed.

### The proof — a test that reproduces the 500
New `A9TransportNullPathTest` (3 tests, plain JUnit + Mockito, **no Spring context, DB-free**). Placed in the
builder's own package so the `@Autowired` fields can be set directly — no reflection. Empty world: no buyer row,
no checklist master, no docs.

**Falsified, not just passed:** removing the guards makes it fail with the exact production error —
`NullPointerException: Cannot invoke "RequestBuyerEntity.getBuyerDocNo()" because "buyer" is null`, 3/3 errored.
Restored → 3/3 green. That is the DB-free stand-in for the QA render.

Suite **18/18** (15 + 3 new), BUILD SUCCESS. structure_check **24/24**, clip_check PASS, frozen_check PASS.
No layout, geometry or REQ-035 binding touched.

### 🔴 Finding — a9-transport and a15 refrow4 have DIVERGED
The stakeholder moved transport's `refrow4` geometry again after my REQ-035 rebind (it's in HEAD, tree clean):
long run **x=136 w=180 → x=101 w=207**, `เลขที่` → x=310/338, `ลงวันที่` → x=421/451, date value **w=55 → 63**.
**They kept my `$F{detail3}` binding** — the rebind survived intact.

**a15 still has the pre-move geometry.** Both bind the same fields so both render correctly, but the two forms
now *look* different on this row. Since a15 was carved out precisely because it shares these rows (DEF-21), it
probably should follow — but that's a stakeholder/geometry call, so I've left it. @Sober: say the word and I'll
port the new geometry across.

### The two clips I flagged on TASK-048 are still there — on BOTH forms
Measured on the current render, transport row tokens: `ตาม(97..112) หนังสือขอซื้อ(134..182) เลขที่(343..362)
x/xxxx(371..397) ม.ค.(492..508) 2569(511..531)`.
- **`ลงวันที่` caption renders NOTHING** — nothing at all between x=397 and x=492, where its field sits. Still a
  30px field for ~38px of text on both forms (the geometry move widened the *value*, not the caption).
- **The date still loses its leading day** — prints `ม.ค. 2569`, not `1 ม.ค. 2569`.
Unchanged from my TASK-048 report; still not mine to fix (geometry). Worth bundling into the stakeholder round
that produced the move above.

### Verifier repair (mine, found by running it)
My TASK-048 REQ-035 assertion pinned **x-windows** and false-failed the instant the stakeholder moved the
geometry — a legitimate change it had no business breaking on. Rewritten **position-independently**: the actual
symptom of DEF-22 is *a value printed twice on the row*, so it now tests that and follows the geometry anywhere.
Re-falsified after the rewrite → `{'x/xxxx'} printed twice on the refrow4 row`. (Same lesson as the hardcoded
page indices: a verifier that encodes today's coordinates stops testing the thing it was written for.)

### Full tree — nothing filtered (`verify/tree_check.sh`)
```
 M src/main/java/com/smart/report/config/SecurityConfig.java      <-- still NOT mine
 M src/main/java/com/smart/report/domain/entity/RequestBuyerEntity.java
 M src/main/java/com/smart/report/report/checklist/a9/builder/A9CheckListReportBuilderBase.java
?? src/test/java/com/smart/report/report/checklist/                <-- the new null-path test
?? verify/
```
`SecurityConfig.java` is **still** the same unreverted change (API-KEY chain commented, download ungated). I
reverted it once this morning; it came back byte-identical and I did not revert it a second time. Still awaiting
the human's answer via Porter. Preserved copy: `project-docs/preserved/`.

### Still open (not mine to run)
Real /download of an อ.9/อ.15 with **no buyer row** and/or **no 00014 doc** → expect **200, not 500**. And per
your sequencing note, DEF-24 had to land before the REQ-035/BUYER_DOC_TYPE smoke on 38406 — it has.

---

## Sober review — 2026-09-03 (DB-free, independent) — ACCEPTED

Verified: 0 `System.out`/`LOGgggg` in `checklist/a9/`; 348/349 guard the OBJECT (`buyer!=null`, `doc00014!=null`);
`A9TransportNullPathTest` present + falsified (guards removed ⇒ exact prod NPE, 3/3). Comment fixed in builder + entity.
Whole-method sweep (0 unguarded derefs) and the position-independent rewrite of your REQ-035 assertion both endorsed —
a verifier that encodes today's coordinates stops testing its own symptom. **DEF-24 code = CLOSED** (QA confirms on a
real no-buyer/no-00014 render; Porter can now run the BUYER_DOC_TYPE smoke unconfounded).

**Your two findings — rulings:**
1. **a15↔transport refrow4 geometry divergence → HOLD, do not port yet.** Not a functional bug (both bind the same
   fields, both render). The stakeholder is *actively tuning* transport's geometry (moved twice now) and we have **no
   confirmed a15 sample** exercising this row (TEST-010 pending) — porting now chases a moving target and can't be
   verified on a real a15 render. Tracked as a board follow-up; we port once transport's geometry settles AND TEST-010
   gives an a15 render to verify against. (a15 keeping the older geometry is harmless until then.)
2. **`ลงวันที่` caption / date-day clip → DEF-23 stays CLOSED, not re-routing.** The stakeholder ruled on their **real
   render** (caption prints, and they deliberately left it w=30 — "พื้นที่พอแล้ว") and widened the date value 55→63.
   Your tokens (`x/xxxx`, `ม.ค. 2569`) are the **mock/preview placeholders**, not the close surface. Per the standing
   rule we don't adjudicate pixels or re-raise a stakeholder-closed item off a mock. **If** it ever reproduces on a
   real `/download` of a POPULATED request (38399), flag it then — otherwise closed. You were right not to add an
   assertion for it.

**SecurityConfig** still in your tree = the human's settled local seam (Porter closed it) — correct not to touch.
