# TASK-030: DASHBOARD_TRACKING — finalize status logic (DR-16): LICENSE_STATUS=40 backbone + verbatim move-status labels

- Source: SPEC-019 (REQ-017); DR-16 answered + Sober roll-up decision (data-req-16 doc)
- Status: DONE
- Assignee: Jason (BE)
- Depends on: TASK-029

## Review — Verdict: DONE (code) — Sober (SA), 2026-07-21
Grep-verified: backbone `:LICENSE_STATUS=40` + `WHERE L.FORM_ID=:FORM_ID AND L.LICENSE_STATUS=:LICENSE_STATUS` (issued
only, mirrors license-move); move-status labels verbatim `รอดำเนินการ`/`กำลังขนย้าย`/`เสร็จสิ้นแล้ว` (svc L31-33) with
FULL for `actual >= approved` (L249, `≥` clamp = roll-up A on the scaffold's APV/ACT totals); `LICENSE_STATUS_MAP
{40:"ออกหนังสืออนุญาตแล้ว"}` (L44) → single-value license_status. ฉบับ grain, pre-aggs, EXISTS filters, 3 COUNT(DISTINCT)
charts, cascades, no-date/return-all all untouched; DID_SPF-only; build 0 err. → REQ-017 code-complete.
**Acceptance = live capture + Porter's over-move check** (escalate to Option B per-line only if a status-40 อ.10 has
MOVED>APPROVED per line — see data-req-16). Pass → REQ-017 DELIVERED.

## Change (small — restrict backbone status + finalize labels; roll-up A already in the scaffold)

### 1. Backbone — restrict to issued only (`GetTrackingDashboard`)
Add `AND L.LICENSE_STATUS = 40` to the WHERE (currently returns ALL FORM_ID=10). Bind `:LICENSE_STATUS = 40`
(mirror license-move). Everything else in the query stays (ฉบับ grain, APV/ACT pre-aggs, EXISTS filters, no date pred).

### 2. Move-status labels — VERBATIM (roll-up = A, license-level Σ totals; `≥` for done)
In the service `MoveStatusLabel(approved, actual)`:
- `actual == 0` → **"รอดำเนินการ"**
- `actual < approved` (and > 0) → **"กำลังขนย้าย"**
- `actual >= approved` → **"เสร็จสิ้นแล้ว"**  (≥, so over-moved is labeled เสร็จ, not blank)
(Uses the scaffold's `NVL(APV.APPROVED_QTY,0)` / `NVL(ACT.ACTUAL_QTY,0)` — license-level totals = Option A. Do NOT
switch to per-line/Option B unless Porter's validation shows real over-moving — see data-req-16.)

### 3. License-status label + filter
- `LICENSE_STATUS_MAP = { 40: "ออกหนังสืออนุญาตแล้ว" }`; `license_status` table col = that label (always 40 now).
- `license_status_ddl` in search-filter = single item `{ value:"40", label:"ออกหนังสืออนุญาตแล้ว" }` (replace the placeholder).

## Must NOT change
ฉบับ grain, the pre-agg joins/EXISTS filters, the 3 COUNT(DISTINCT license) charts, cascades, no-date/return-all,
other dashboards. All DID_SPF.

## Definition of Done
- [x] Backbone `FORM_ID=10 AND LICENSE_STATUS=40`; move-status shows รอดำเนินการ/กำลังขนย้าย/เสร็จสิ้นแล้ว (≥ for เสร็จ);
      license-status = "ออกหนังสือฯ" (40); license_status_ddl single-value. `dotnet build` succeeds.
- [ ] (Acceptance, live capture) 3 ฉบับ charts split by move status; table shows the 2 statuses; return-all completes.
      **Porter validation:** confirm no problematic over-moving (else escalate to B). → REQ-017 DELIVERED.

## Implementation Notes
(Jason — 2026-07-24)

Small finalize on top of the TASK-029 scaffold. All DID_SPF; ฉบับ grain / pre-aggs / EXISTS / cascades / 3 charts untouched.

### 1. Backbone restricted to issued (`TTLicenseDtlRepository.GetTrackingDashboard`)
- Added `parameters.Add(":LICENSE_STATUS", 40)` + `WHERE L.FORM_ID =:FORM_ID AND L.LICENSE_STATUS =:LICENSE_STATUS`
  (was FORM_ID only). Mirrors license-move. Everything else in the query unchanged (APV/ACT pre-aggs, EXISTS line-filters,
  no date pred → return-all completes, ORDER BY).

### 2. Move-status labels — VERBATIM, roll-up A (license-level Σ, `≥` for done)
`MoveStatusLabel(approved, actual)` constants updated: `actual==0` → **"รอดำเนินการ"**; `0<actual<approved` →
**"กำลังขนย้าย"**; `actual>=approved` → **"เสร็จสิ้นแล้ว"** (≥ so over-moved = เสร็จ, never blank). Still uses the
scaffold's `NVL(APV.APPROVED_QTY,0)`/`NVL(ACT.ACTUAL_QTY,0)` license-level totals (Option A — not switched to per-line B).

### 3. License-status label + filter
`LICENSE_STATUS_MAP = { 40:"ออกหนังสืออนุญาตแล้ว" }` (kept from scaffold); table col + `license_status_ddl` already
resolve from it → single-value `{value:"40", label:"ออกหนังสืออนุญาตแล้ว"}`. Tidied the placeholder comments across
service + model to the finalized DR-16 wording.

### Verification
- `dotnet build` (Center+SPF) → **Build succeeded, 0 Error(s)** (pre-existing warnings only).
- Grep repo: `:LICENSE_STATUS", 40` + `AND L.LICENSE_STATUS =: LICENSE_STATUS` present; service has the 3 final labels
  รอดำเนินการ/กำลังขนย้าย/เสร็จสิ้นแล้ว. ฉบับ grain, pre-aggs, EXISTS, charts, cascades unchanged; other dashboards untouched.
- Static-only per brownfield rule; 3 charts split-by-status + 2-status table + return-all + **over-move check (Porter)** =
  stakeholder live capture. If real over-moving surfaces → escalate to Option B (per-line) per data-req-16. Then REQ-017 DELIVERED.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
