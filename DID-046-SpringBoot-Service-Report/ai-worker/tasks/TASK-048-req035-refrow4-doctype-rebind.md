# TASK-048 — REQ-035: rebind refrow4's long run to the buyer document-type name

- **For:** Jason (BE)  · **From:** Sober (SA)  · **Ref:** SPEC-040, DEF-22 (stakeholder-ruled), REQ-035
- **Depends on:** nothing

## What / why
DEF-22 (you found it) is a **mis-binding**, per the stakeholder: refrow4's long dotted run (`☐ ตาม ....`) is the
write-in for the buyer's **document TYPE name**, not a repeat of เลขที่. Fix the binding; keep the geometry.

Current mis-bind — `A9CheckListReportBuilderBase.java:333`:
```
refrow4(null, "ตาม", checked(...idFor("00014")), "เลขที่", documentReferenceNo(doc00014),
        "ลงวันที่", doc00014 != null ? doc00014.getIssueDate() : null, null, ...)
```
The long-run element (x=136) and the เลขที่ element (x=347) both read `$F{detail}` → the ref number prints twice.

## Do
1. **Separate the two fields.** Long run (x=136) → buyer **doc-type name**; เลขที่ (x=347) → reference number
   (`documentReferenceNo(doc00014)`, unchanged); ลงวันที่ unchanged. Give the long run its own EvidenceSub field so it no
   longer shares `$F{detail}` with เลขที่. Geometry (x/width/height) stays byte-identical — this is a bind change only.
2. **Resolve the name at runtime, do not hardcode:** `T_T_REQUEST_BUYER.BUYER_DOC_TYPE` (int) →
   `T_S_COMMON_CODE.CODE_INT` where `GROUP_CODE='BuyerDocType'` → `CODE_NAME`. Values seen: 1 หนังสือขอซื้อ / 2 สัญญาซื้อขาย /
   3 ใบสั่งซื้อ / 9 อื่นๆ. **`CODE_INT=9` → `BUYER_DOC_TYPE_OTHER`, fallback `อื่นๆ`.**
3. **Entity:** `RequestBuyerEntity` doesn't map `BUYER_DOC_TYPE`/`BUYER_DOC_TYPE_OTHER` (DEF-17 re-map dropped cols).
   Add the `@Column`s and **verify they exist on the live `DID_SPF` connection** (not the dict). Absent at runtime → STOP + route up.
4. **Buyer-row selection:** `(STATUS IS NULL OR STATUS <> 'D')` — never bare `<> 'D'`. If **>1 row survives → STOP, route
   up to me, do not pick one.**
5. Shared band/builder = **a9-transport + a15** both. One fix covers both; regression-check both.

## Verify (evidence, no eyeball close)
- **frozen/geometry:** a9-transport refrow4 element x/width/height unchanged vs HEAD (mechanical — `frozen_check.sh` on
  geometry, or diff the band minus the field expressions). Only the bound expression changed.
- **structure_check.py:** extend so a populated refrow4 shows doc-type name in the long run AND ref number in เลขที่,
  **and they differ** (fail-on-revert: re-share `$F{detail}` → assertion fails).
- **Real /download:** type-1 (38406) → long run = `หนังสือขอซื้อ`, เลขที่ = the ref number, once each.
  **Type-9 (other):** deliberately obtain/render a `BUYER_DOC_TYPE=9` request (DATA REQ via me if none) → prints
  `BUYER_DOC_TYPE_OTHER`/`อื่นๆ`. If unobtainable, record as an explicit unverified gap — do NOT claim it works.
- a15 regression: its refrow4 renders the same way (shares the band/builder).

## Acceptance
Long run = doc-type name, เลขที่ = ref number, each once, on real /download; type-1 verified, type-9 verified-or-flagged;
STATUS filter in place, >1 buyer row routed up; a9-transport geometry unchanged; a15 regression-checked; labels from DB.

---

## Done — Jason 2026-09-03

### The rebind
- `refrow4`'s long run (x=136) now binds **`$F{detail3}`** — its own field; `เลขที่` (x=347) keeps `$F{detail}`.
- **Geometry proven untouched, mechanically**: extracted the band from HEAD and from the working tree, compared
  every element's `x/y/width/height` → **identical, 8/8 elements**; diffing the expressions shows **exactly one**
  change, `$F{detail}` → `$F{detail3}`. Nothing else in the frozen band moved.
- Builder: `refrow4(seq, label, checked, docTypeName, labelA, valA, labelB, valB)` — the doc-type name is now a
  named parameter, so the two slots can't silently re-share a field.
- Applied to **a9-transport + a15** (shared band + builder), as specified.

### Doc-type resolution (from the DB, not hardcoded)
`buyerDocTypeName(buyer)`: `BUYER_DOC_TYPE` → `commonCodeRepository.findByGroupCodeAndCodeInt("BuyerDocType", code)`
→ `CODE_NAME`. **`CODE_INT=9` reads `BUYER_DOC_TYPE_OTHER`, falling back to `อื่นๆ` when blank.** Reused the
existing `CommonCodeRepository` — no new repo. Null buyer / null type → blank (graceful, unchanged behaviour).

### Entity
Added `@Column BUYER_DOC_TYPE` (Integer) + `BUYER_DOC_TYPE_OTHER` (String) to `RequestBuyerEntity`.

### Buyer-row selection
`findActive` already had `(STATUS IS NULL OR STATUS <> 'D')` — verified, unchanged. It used to `firstOrNull(...)`,
silently taking row 1. It now **throws** when >1 active row survives, naming the requestId and the row ids.

⚠️ **Read this before it ships:** that turns a previously-silent case into a **500 on the real /download** for any
a9/a15 request with 2+ active buyer rows. It's what "do not pick one" means in code, but I can't tell DB-free how
common that is. If it's common, this is a regression — say the word and I'll downgrade it to first-row + a logged
warning.

### Verification
- **structure_check.py +6 REQ-035 assertions** across both forms: the long run is non-empty, `เลขที่` is non-empty,
  and **they differ** → **26 run, 0 failed**.
- **Fail-on-revert proven**: re-shared `$F{detail}` in a15, re-rendered →
  `FAIL REQ035 a15-preview.pdf: long run and เลขที่ both show 'x/xxxx' — fields still shared`. Restored → 26/26.
- Render now reads `ตาม  หนังสือขอซื้อ   เลขที่ x/xxxx   … 2569` — ref number **once**. Was
  `ตามหนังสือขอซื้อ x/xxxx เลขที่ x/xxxx …`.
- Suite **15/15**, BUILD SUCCESS; clip_check PASS.
- **Mock aligned again**: it passed `"ตามหนังสือขอซื้อ"` as one label where the DB builder passes `"ตาม"` + the
  doc-type name — the same mock-vs-DB divergence class as DEF-21. Fixed, so the preview exercises the real shape.

### 🔴 Found while verifying — two MORE clipped fields in the stakeholder's refrow4 (pre-existing)
On the same row, in the frozen band, independent of my change:
- **`ลงวันที่` caption renders NOTHING.** Field is `x=430 width=30`; the text needs ~38px. The rendered tokens jump
  straight from the ref number (ends x=406) to the date (starts x=501) — the caption is absent from the page.
- **The date loses its leading digit** — `x=460 width=55` holds `1 ม.ค. 2569` (~60px), so it prints `ม.ค. 2569`.

Both reproduce on **transport and a15**, and both are in HEAD's geometry (I proved geometry byte-identical, so they
predate me). So today the row reads `ตาม หนังสือขอซื้อ เลขที่ x/xxxx  ม.ค. 2569` — no caption, and a date missing
its day. **Not fixed**: the freeze was lifted only for the rebind, and this is geometry. I deliberately did *not*
add a failing assertion for it, so the gate stays meaningful — @Sober, route it to the stakeholder as a DEF sibling
of DEF-22 and I'll widen both fields in one pass.

### Cannot verify DB-free — stated, not assumed
- **Live columns.** SPEC step 3 says verify `BUYER_DOC_TYPE`/`_OTHER` exist on the live `DID_SPF` connection. BE
  doesn't touch the DB, so I can't. **This is the single biggest risk here and it's a DEF-17 repeat:** if either
  column is absent at runtime, the new `@Column`s make **every a9/a15 download** fail with ORA-00904 — not just
  this row. Must be confirmed on a real /download before this goes anywhere near prod.
- **Type-1 (38406)** and **type-9** renders: both need a real /download. Recording type-9 as an **explicit
  unverified gap** — I am not claiming it works.

### Full tree (nothing filtered — `verify/tree_check.sh`)
```
 M src/main/java/com/smart/report/config/SecurityConfig.java      <-- NOT mine, see below
 M src/main/java/com/smart/report/domain/entity/RequestBuyerEntity.java
 M src/main/java/com/smart/report/report/checklist/a9/builder/A9CheckListPreviewBuilder.java
 M src/main/java/com/smart/report/report/checklist/a9/builder/A9CheckListReportBuilderBase.java
 M src/main/resources/reports-045/request-a15/subreport/request-a9-evidenceSub.jrxml
 M src/main/resources/reports-045/request-a9-transport/subreport/request-a9-evidenceSub.jrxml
?? verify/
```
**`SecurityConfig.java` is modified again** — I reverted it earlier today per your rejection, and it has come back
**byte-identical to the version I preserved** (same blob `024af98`: API-KEY chain commented out, download/checklist
ungated `permitAll`). Something re-applied it after my revert; the obvious read is that it's the human's deliberate
local auth-free testing seam.

**I did not revert it a second time.** Reverting what looks like a deliberate human action would put me in a revert
war with whoever needs it, and you already asked for this to be surfaced rather than silently handled. @Sober —
please confirm with the human via Porter. Copy still preserved at `project-docs/preserved/`. My new
`verify/tree_check.sh` is what caught it, on its first real run.

---

## Sober review — 2026-09-03 (DB-free, independent)

**ACCEPTED — the rebind.** Verified frozen transport `git diff` = **one line only** (`$F{detail}`→`$F{detail3}` on the
x=136 long run); no x/y/width/height changed → geometry byte-identical, freeze honoured. a15 mirrors it (long run
`detail3`, เลขที่ `detail`). structure_check 26 + fail-on-revert (re-share `$F{detail}` → fail). Named-param
`refrow4(...docTypeName...)` so the two slots can't silently re-share. Doc-type from `CommonCodeRepository`
(9→OTHER/อื่นๆ). Good, careful work — and good catches below.

**Rulings on your three + the config:**

1. **DEF-23 (route to stakeholder) — the two extra clips in the frozen refrow4.** `ลงวันที่` caption (x430 w30, needs
   ~38px → renders nothing) and the date losing its leading digit (x460 w55, needs ~60px). Pre-existing in HEAD
   geometry, both forms — confirmed it's frozen geometry, not your change. Correct call NOT to fix under the rebind
   freeze and NOT to add a passing assertion. → **DEF-23**, sibling of REQ-035; routing to stakeholder via Porter to
   lift the freeze for a geometry pass. You widen both fields (+ the doc-type field if it clips) in one go once approved.

2. **🔴 BUYER_DOC_TYPE live-column risk = the gate on REQ-035.** You're right this is a DEF-17 repeat and the biggest
   risk: if `BUYER_DOC_TYPE`/`_OTHER` are absent on live `DID_SPF`, the new `@Column`s make **every a9/a15 download**
   ORA-00904 → 500, not just this row. **This must be QA-smoked on a real a9/a15 /download (expect 200, 0 ORA) BEFORE
   REQ-035 merges.** Routing to Porter → QA. If it 500s, we un-map and read the two cols via a projection/native query
   instead — do not ship the hard `@Column` unverified.

3. **>1 buyer row → you made it throw (500).** Don't ship that unilaterally, and I won't unilaterally override Porter's
   "do not pick one" either — this is a stakeholder decision. "Route up" = escalate the *decision*, not crash a legal
   document. **Interim: keep the throw** (fail-loud beats silently printing the wrong buyer's doc type on a permit),
   but REQ-035 does not close until the stakeholder rules whether >1 active buyer is legitimate. Escalating via Porter.
   My recommendation to them: if multi-buyer is a valid state → downgrade to **first active row + WARN log** (requestId
   + row ids, not silent); if it's invalid data → keep the throw. Hold for their answer before changing the code.

**SecurityConfig — correction + route to human.** It's back a **3rd time**, byte-identical (`permitAll()` ungated,
API-KEY chain commented). After your revert it reappeared unchanged → it was **not authored by you**; my TASK-047
review wrongly attributed it to you and I retract that. Do NOT revert it again (no revert-war with a deliberate local
action). Routing to Porter → **human**: confirm it's your local auth-free testing seam, and if so it must be
git-ignored or profile-gated and **never committed** — as-is it would ship an unauthenticated download endpoint. Backup
preserved; `verify/tree_check.sh` is doing its job.

→ **REQ-035 rebind is accepted but NOT closed.** Gates: (a) QA smoke BUYER_DOC_TYPE 200; (b) stakeholder multi-buyer
ruling; (c) type-1 (38406) + type-9 real /download; DEF-23 tracked separately.
