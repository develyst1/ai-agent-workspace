# TASK-030: DEF-15 — อ.9 destroy ticks wrong on real data (38362)

- Source: DEF-15 (Porter/QA, real data 38362). 🔴 TOP.
- Status: **BUILDER EXONERATED (SA hand-trace) → decisive rebuild+re-render is Porter/QA's leg.**
- No blind code change — the committed builder is proven correct against the real table.

## What I found (DB-free, code + Porter's 38362 dump)
My first diagnosis ("destroy reuses ReqMove suffixes / group-scoped divergence") was **WRONG** — Porter corrected it:
lines 1-11 suffixes are IDENTICAL across ReqMove/ReqMoveDestroyer, and the code is genuinely code-bound. Verified:
- `A9DestroyReportBuilder`: `CHECKLIST_GROUP = "ReqMoveDestroyer"` (matches the DB codes); no `buildEvidences` override.
- Base `buildEvidences`: `master = findByGroupCode(group)` (ALL rows, no IS_ACTIVE), `idByCode` keyed by full
  `CHECKLIST_CODE`, `idFor = idByCode.get(group+suffix)`, `checkedIds` = docs with `ATTACH_FILE_ID != null && != 0`
  mapped by `REQUEST_CHECKLIST_ID`, `checked = id != null && checkedIds.contains(id)`. `hasFile` = `≠ null && ≠ 0`.
- Doc query = `STATUS IS NULL OR <> 'D'` → **status C ticks** (no STATUS=A filter anywhere).

**Hand-trace of the committed builder (commit d7b1c36) against Porter's 38362 table → the CORRECT 7 ticks:**
00101 ✓ · 00602 ✓ · 00803 ✓ · **00407 ✓** (file 39897) · 10008 ✓ · **12111 ✓** (file 39905, status C) · **00017 ✓**
(file 40339); and it correctly does NOT tick 12204 (no doc row), 00006 (file 0), 00013 (file 0). This is EXACTLY
Porter's "rule says" column — NOT the wrong render. ⇒ **the wrong 15:18 PDF did not come from this code path.**

## Most likely cause = stale/partial artifact (not the source)
The :33000 service (PID at the time) was up since 15:15:45; the fix `.class` built 15:15:44; the bad PDF was 15:18.
A 1-second gap between compile and process fork is consistent with an **incremental/partial build or devtools
hot-swap that did not actually load the committed destroy builder**. The a6/38272 canary CANNOT detect this — a6
renders identically under old positional AND new code (all rows active/contiguous), so "a6 unaffected" ≠ "fix deployed".

## Decisive next step — Porter/QA (rule #4: I can't run the service/DB)
Clean rebuild + full restart from HEAD (d7b1c36), then re-render 38362:
```
./mvnw -o clean package -DskipTests    # or clean compile + full spring-boot:run restart (NOT devtools reload)
```
- **PASS** → ticks land on จดทะเบียน·มอบอำนาจ·ร.ง.4·**บัตรผู้เสียภาษี**·ภ.พ.20·**แผนผังโรงงาน**·**อ.10 12(7)**;
  อ.2 / อ.7 / สถานที่กำจัด 12(3) all UNticked ⇒ it was a stale artifact → **close DEF-15**.
- **FAIL (still wrong after a clean restart)** → the builder is exonerated, so the fault is the destroy **.jasper
  evidence subreport** mapping the (correct) `checked` flags to the wrong lines (array/order/null-parent
  misalignment). Re-open to me; I spec the template-alignment fix (destroy evidence line order vs the EvidenceItem array).

## Lesson (Porter's, adopted)
Mechanism-verified + code-list-verified is NOT verified — only rendered output vs the real doc table is. Real-data
tick-landing (with a clean-built artifact) is a MANDATORY close step for every form, not an optional QA leg.
