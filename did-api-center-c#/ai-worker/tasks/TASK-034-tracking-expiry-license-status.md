# TASK-034: DASHBOARD_TRACKING — สถานะหนังสืออนุญาต becomes EXPIRY-derived (REQ-017 ADDENDUM 2)

- Source: SPEC-021 Part A (REQ-017 ADD-2, stakeholder-answered)
- Status: DONE
- Assignee: Jason (BE)
- Depends on: TASK-030

## Review — Verdict: DONE (code) — Sober (SA), 2026-07-24
- **Backbone proven intact (the critical check):** the tracking query still binds `:LICENSE_STATUS = 40` (L434) and
  `WHERE L.FORM_ID =:FORM_ID AND L.LICENSE_STATUS =:LICENSE_STATUS` (L528). The row set is unchanged — only the
  *displayed* status is now expiry-derived. ✔
- **Single derivation:** `LicenseExpiryStatusLabel` defined once (L314) with exactly **2 call sites** — filter (L270) and
  table col (L289). Constants L43-44. ✔ ready for TASK-035 to reuse.
- **ddl** (L111-112) = 2 items, **value == label**. ✔  **Old `LICENSE_STATUS_MAP`/`LicenseStatusLabel`: 0 references.** ✔
- Model doc-comments synced; build 0 err; grain/pre-aggs/move-status/charts/cascades/`issue_date_range` untouched.

### > answer (Sober) to the flagged orphan: **yes — drop it, in TASK-035.**
`DashboardTrackingQueryResult.LicenseStatus` + its `L.LICENSE_STATUS AS LicenseStatus` select line were orphaned **by
this change**, so they should go (house rule: clean up what your own change orphaned; leave *pre-existing* dead code
alone). TASK-035 does **not** need it — the modal's `license_status` is expiry-derived via the same helper. Removing a
selected-but-unread column is safe (Dapper maps by name).
**⚠ Remove only the SELECT column + DTO field — the `WHERE … LICENSE_STATUS = 40` filter STAYS** (different concept).
Folded into TASK-035 as step 0. Good catch flagging it instead of silently leaving it.

## Why
Stakeholder: *"หมดอายุมั้ย คือ วันหมดอายุ เกินหรือไม่เกินวันปัจจุบัน **ไม่เกี่ยวกับสถานะ 40**"*. So the displayed
`สถานะหนังสืออนุญาต` (table column + filter dropdown) is **expiry-derived**, not the `LICENSE_STATUS` code label we
shipped in TASK-030.

## ⚠️ Do NOT change the backbone
`WHERE L.FORM_ID = 10 AND L.LICENSE_STATUS = 40` **stays exactly as-is** — that decides *which licenses the page lists*
(DR-16). Only the **displayed status + its filter** change. These are two different concepts; dropping the `=40` would
silently change the row set.

## Changes — all in `DashboardTrackingService` (no SQL change; `ExpiryDate` is already selected)

1. **New helper (single source, reused by the detail modal in TASK-035):**
   ```csharp
   private const string LICENSE_NOT_EXPIRED = "ยังไม่หมดอายุ";
   private const string LICENSE_EXPIRED     = "หมดอายุ";

   private static string LicenseExpiryStatusLabel(DateTime? expiryDate)
       => (expiryDate == null || expiryDate.Value.Date >= DateTime.Today)
              ? LICENSE_NOT_EXPIRED : LICENSE_EXPIRED;
   ```
   (NULL expiry ⇒ ยังไม่หมดอายุ — SA assumption, confirm at capture.)
2. **L110 `license_status_ddl`** — replace the `LICENSE_STATUS_MAP` projection with exactly two items,
   **value == label**: `{value:"ยังไม่หมดอายุ", label:"ยังไม่หมดอายุ"}`, `{value:"หมดอายุ", label:"หมดอายุ"}`.
   ("ทั้งหมด" = FE sends nothing.)
3. **L269 filter** — match on the **derived** label, not the int:
   `InList(req.LicenseStatuses, LicenseExpiryStatusLabel(r.ExpiryDate))`. Empty ⇒ no filter (unchanged semantics).
4. **L288 table column** — `LicenseStatus = LicenseExpiryStatusLabel(r.ExpiryDate)`.
5. **L42-44 / L309-312** — `LICENSE_STATUS_MAP` + `LicenseStatusLabel(int?)` are now unused → delete them (if anything
   else still references them, leave that caller untouched and say so).

## Must NOT change
The backbone (`FORM_ID=10 AND LICENSE_STATUS=40`), ฉบับ grain, pre-aggs/EXISTS, move-status logic (TASK-030), the 3
charts, the other cascades, the `issue_date_range` filter, other dashboards. All DID_SPF.

## Definition of Done
- [x] `license_status` (table) + `license_status_ddl` are expiry-derived (ยังไม่หมดอายุ / หมดอายุ); the filter matches on it.
- [x] Backbone still `FORM_ID=10 AND LICENSE_STATUS=40` (grep to prove it's untouched).
- [x] `LicenseExpiryStatusLabel` is the single derivation (TASK-035's modal will call the same one).
- [x] `dotnet build` succeeds. Paste diff + build result.
- [ ] (Acceptance, capture) rows show ยังไม่หมดอายุ/หมดอายุ per EXPIRY_DATE vs today; filtering by each value works.

## Implementation Notes
(Jason — 2026-07-24)

All 4 touchpoints in `DashboardTrackingService` (+ doc-comment sync in the model). **No SQL change** — `ExpiryDate`
was already selected. All DID_SPF.

1. **Constants + helper (single derivation point)** — replaced the now-obsolete `LICENSE_STATUS_MAP` with
   `LICENSE_NOT_EXPIRED = "ยังไม่หมดอายุ"` / `LICENSE_EXPIRED = "หมดอายุ"`, and added:
   ```csharp
   private static string LicenseExpiryStatusLabel(DateTime? expiryDate)
       => (expiryDate == null || expiryDate.Value.Date >= DateTime.Today)
              ? LICENSE_NOT_EXPIRED : LICENSE_EXPIRED;
   ```
   NULL expiry ⇒ ยังไม่หมดอายุ (SA assumption, carried as-is; capture to confirm). Commented explicitly that this is a
   *different concept* from the backbone `LICENSE_STATUS=40`, so nobody conflates them later.
2. **`license_status_ddl`** — now exactly two items with **value == label** (`ยังไม่หมดอายุ`, `หมดอายุ`); "ทั้งหมด" = FE sends nothing.
3. **Filter** — `InList(req.LicenseStatuses, LicenseExpiryStatusLabel(r.ExpiryDate))` (was matching the raw int). Empty ⇒ no filter (unchanged).
4. **Table column** — `LicenseStatus = LicenseExpiryStatusLabel(r.ExpiryDate)`.
5. **Deleted** `LICENSE_STATUS_MAP` + `LicenseStatusLabel(int?)` — grep confirms 0 remaining references anywhere.
6. **Model doc-comments synced** (`license_status` request/ddl/table-row + the file header) so they no longer claim
   "placeholder จนกว่า DR-16".

### Flagged — one orphan left deliberately
`DashboardTrackingQueryResult.LicenseStatus` (and its `L.LICENSE_STATUS AS LicenseStatus` select line) is now **unread
by C#** — my change orphaned it. I left both in place because the task scoped this to "no SQL change", it is harmless,
and TASK-035's detail modal may want it. Grep-verified the only other `.LicenseStatus` hits are unrelated entities in
`LicenseService`. Say the word and I'll drop the DTO field + select line in TASK-035.

### Verification
- `dotnet build` (Center+SPF) → **Build succeeded, 0 Error(s)** (pre-existing warnings only).
- **Backbone proven untouched:** `GetTrackingDashboard` still binds `:LICENSE_STATUS = 40` and its WHERE is still
  `WHERE L.FORM_ID =:FORM_ID AND L.LICENSE_STATUS =:LICENSE_STATUS`.
- Grep `LICENSE_STATUS_MAP|LicenseStatusLabel` in the service → **0**.
- `LicenseExpiryStatusLabel` = 1 definition + exactly 2 call sites (filter + table col) → single derivation, ready for TASK-035 reuse.
- Untouched: ฉบับ grain, pre-aggs/EXISTS, move-status (TASK-030), 3 charts, cascades, `issue_date_range` (TASK-031), other dashboards.
- Static-only per brownfield rule; ยังไม่หมดอายุ/หมดอายุ vs today's date + filtering by each value = stakeholder capture.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
