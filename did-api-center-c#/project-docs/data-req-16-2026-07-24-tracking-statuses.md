# DATA REQUEST 16 — dashboard-tracking (REQ-017) status definitions, 2026-07-24

## ✅ Stakeholder answers (confirmed)
1. **`LICENSE_STATUS` on FORM_ID=10:** distinct = 10(14), 20(44), 30(183), **40(2511)**. **Decision: show LICENSE_STATUS=40
   ONLY** (stakeholder: "40 เท่านั้นเหมือนกันเลย"). ⇒ backbone = `T_T_LICENSE FORM_ID=10 AND LICENSE_STATUS=40`
   (same fix as license-move). `LICENSE_STATUS_MAP` = { 40: "ออกหนังสืออนุญาตแล้ว" } is sufficient; the license-status
   column is always that. (Filter "สถานะหนังสืออนุญาต" is effectively single-value.)
2. **สถานะการขนย้าย (move status) — EXACT logic from stakeholder** (moved = actual moved qty; approved = qty on the
   อ.10 license):
   - **รอดำเนินการ** — moved = 0 (and < approved)
   - **กำลังขนย้าย** — moved ≠ 0 AND moved < approved
   - **เสร็จสิ้นแล้ว** — moved = approved
   (labels: รอดำเนินการ / กำลังขนย้าย / เสร็จสิ้นแล้ว — use verbatim.)

## ⚠ OPEN — per-license roll-up (Porter will NOT guess; discuss w/ Sober, then validate with a query)
The tracking **table row = one อ.10 license (no product column)** → move-status must be ONE value per license, but an
อ.10 usually has **multiple product lines**, each with its own approved vs moved qty. The stakeholder's logic is
phrased at single-qty level; the roll-up rule to a single per-license status is **not yet specified**. Candidates:
- **(A) Totals:** Σ moved(all lines) vs Σ approved(all lines) → 0 / partial / equal.
- **(B) Per-line rollup:** all lines complete → เสร็จสิ้น; no line moved → รอ; otherwise → กำลังขน.
These can disagree (e.g. line1 fully moved + line2 untouched → (A) partial, (B) also กำลังขน; but line1 over, line2
under → differ). Also **moved > approved** (over-moved) is unspecified by the "= approved" wording — needs a rule.

### @Sober — please decide/design the roll-up + over-moved handling, then Porter asks stakeholder for a validation query
Proposed validation query (to run once Sober picks A/B, to eyeball real multi-line อ.10s):
```sql
-- per อ.10 (status40) line: approved vs actual-moved, to see multi-line + partial cases
SELECT L.LICENSE_NO, DTL.PRODUCT_CODE, DTL.QUANTITY AS APPROVED,
       NVL(SUM(IMD.QUANTITY),0) AS MOVED
FROM   T_T_LICENSE L
JOIN   T_T_LICENSE_DTL DTL ON DTL.LICENSE_ID = L.ID
LEFT JOIN T_T_INFORM_MOVE_DTL IMD ON IMD.REF_LICENSE_NO = L.LICENSE_NO AND IMD.PRODUCT_CODE = DTL.PRODUCT_CODE
WHERE  L.FORM_ID = 10 AND L.LICENSE_STATUS = 40
GROUP  BY L.LICENSE_NO, DTL.PRODUCT_CODE, DTL.QUANTITY
FETCH FIRST 50 ROWS ONLY;
```
(a10 already computes moved per license+product via T_T_INFORM_MOVE — reuse that pre-agg; the only new decision is
the per-license aggregation rule.)

## Reuse note
a10 move-qty attach (SUM T_T_INFORM_MOVE by license+product) is the "moved" source — same as license-move's MovedQty.
Tracking just needs to bucket + roll up per license. All DID_SPF.

## ✅ Sober's decision (2026-07-24) — roll-up = A (license totals) + `≥` clamp; escalate to B only if validation shows over-moving
**Move-status per license = license-level Σ totals** (already what the TASK-029 scaffold computes: APV = SUM approved
by LICENSE_ID, ACT = SUM actual moved by REF_LICENSE_NO):
- **รอดำเนินการ** — `ACT = 0`
- **กำลังขนย้าย** — `0 < ACT < APV`
- **เสร็จสิ้นแล้ว** — `ACT ≥ APV`  (use `≥`, not strict `=`, so over-moved rows are labeled เสร็จ, not left blank)

**Why A (not B):** A and B give **identical** results unless a line is over-moved (moved_line > approved_line) —
because with moved_line ≤ approved_line, `Σmoved = Σapproved ⟺ every line complete`. A literally matches the
stakeholder's scalar moved-vs-approved wording, matches the scaffold, and is simplest (Karpathy: no speculative
complexity). **Escalate to B (per-line roll-up: เสร็จ only if every line done)** ONLY if the validation query shows
meaningful over-moving that makes A mislabel (an over-moved line masking an unmoved line → Σ still ≥, falsely เสร็จ).

**@Porter — run the validation query as-is; the key thing to eyeball:** does any status-40 อ.10 have a line with
`MOVED > APPROVED`? If **no** → A is definitively correct (A≡B), ship it. If **yes and common** → tell me, I'll switch
TASK-030 to B. Either way the labels above (verbatim) + LICENSE_STATUS=40-only backbone are final.

## 2026-07-24 — validation result + decisive follow-up
- Over-moved lines (MOVED > APPROVED) on status-40 อ.10 = **4** (exists but rare). Not clearly "none" nor "common"
  → per Sober's rule, must check whether these actually flip any license's label (A-vs-B disagreement), not guess.
- **Decisive query sent to stakeholder** — count licenses where A says เสร็จ (ACT_TOTAL ≥ APV_TOTAL) but a line is
  still incomplete (INCOMPLETE_LINES > 0):
  `... WHERE ACT_TOTAL >= APV_TOTAL AND INCOMPLETE_LINES > 0`.
  - result 0 → **A is safe, ship A** (matches scaffold).
  - result > 0 → **switch TASK-030 to B** (per-line: เสร็จ only if every line complete).
- Labels (verbatim) + FORM_ID=10/LICENSE_STATUS=40 backbone already final. Only A-vs-B pending this count.

## ✅ 2026-07-24 — DECIDED: A (license totals, ≥). DISAGREE_LICENSES = 0.
The decisive query returned **0** — no status-40 อ.10 where A(totals) says เสร็จ while a line is still incomplete.
⇒ on real data **A ≡ B**; the 4 over-moved lines never mislabel a license. **Final: roll-up = A** (SUM approved by
LICENSE_ID vs SUM moved by REF_LICENSE_NO; รอดำเนินการ ACT=0 / กำลังขนย้าย 0<ACT<APV / เสร็จสิ้นแล้ว ACT≥APV) —
matches the TASK-029 scaffold, no switch to B. REQ-017 move-status spec is now fully locked; TASK-030 → finalize + capture.
