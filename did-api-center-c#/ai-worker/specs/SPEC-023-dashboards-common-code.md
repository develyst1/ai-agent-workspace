# SPEC-023: DASHBOARDS — code→label from `T_S_COMMON_CODE`, delete the hardcoded maps

- Source: REQ-021 (DATA REQUEST already answered — finding #1 corrected by the stakeholder's own SQL)
- Status: ACTIVE — **all findings actionable; DR-17 answered, finding 2 resolved → `MoveRequestType`**

## Confirmed from the data (Porter's DR, stakeholder-run)
- **The real present defect is code 3**: DB `"ภาคเอกชน (สมาคม บริษัทฯ)"` vs our hardcoded `"สมาคม"` → **239 licenses show
  the wrong label today**, in both the dropdown and the table column, in all 3 services. That alone justifies the REQ.
- Groups **4/5/6/7 have zero rows** → latent risk, not a present outage (Porter corrected his own HIGH→MEDIUM call; good).
- Code **0 "ไม่ระบุ"** exists (6 licenses) but is `IS_ACTIVE=0` → reading active-only makes it fall through to the
  `NOT_SPECIFIED` fallback, whose string is *also* "ไม่ระบุ" ⇒ **identical output**. **Keep that fallback** — it is what
  renders those 6 rows correctly. (Do not "fix" it into something else.)

## A. Buyer group — delete 3 hardcoded copies, read the table (finding 1)
`BUYER_GROUP_MAP` is duplicated verbatim in `DashboardTrackingService` (L45-48), `DashboardMoveLicenseService` (L37) and
`DashboardMoveA10Service` (L33) and feeds both the dropdown and the table column in each.
⇒ delete all three; resolve from `GROUP_CODE = 'AuthorityGroupNo'`, **active + `DISPLAY_TYPE` SPF, ordered by `SEQUENCE`**
(finding 5), keeping the existing `NOT_SPECIFIED` fallback for anything unmatched.

## B. Paid/unpaid labels from `StatusPaid` (finding 3)
`DashboardLicenseBookService` L29-30 hardcodes `"ชำระแล้ว"` / `"รอชำระ"`; the table says `"11" = ชำระเงินแล้ว`,
`"00" = รอการชำระ`.
⇒ read from `StatusPaid`. **Note for the capture:** these two constants now drive **both** the table column
`paid_status_name` **and** chart-1's category labels (TASK-037 deliberately unified them), so this changes visible wording
in two places at once — which is correct and intended: they are one concept. (My TASK-037 call to unify still holds; the
single source simply moves from a constant to the DB.)

## C. Group-code keys into `ConstantSPF.GroupCode` (finding 4)
Add `REQUEST_TYPE`, `MOVE_REQUEST_TYPE`, `AUTHORITY_GROUP_NO`, `STATUS_PAID` and use them everywhere; delete the
per-service `private const string GROUP_*` copies (tracking L26-27, license L30/L32, a10 L42).

## D. Correct lookup semantics everywhere (finding 5)
Officer dashboards ⇒ `GetDataActiveByGroupCodeAndDisplayType(group, "SPF")` + order by `SEQUENCE`.
**Also retrofit the 3 existing call sites** (a10 L66/L369, license L352/L363, tracking L422/L432) which today use the
plain active-only method — otherwise an ISPF-only or out-of-order code can still leak into an officer dropdown.

## E. ⛔ Do NOT touch the two derived statuses
**move status** (รอดำเนินการ/กำลังขนย้าย/เสร็จสิ้นแล้ว) and **expiry status** (ยังไม่หมดอายุ/หมดอายุ) are computed, and the
stakeholder confirmed they are **not** going into `T_S_COMMON_CODE` ("เอาคำนวณไป เพราะไม่มีใน common").
⚠ `StatusLicense` **does** exist in the table (10/20/30/40) but it is the **backbone filter**, not the expiry display
label — those two were already conflated once (DR-16 → REQ-017 ADD-2). **Do not repoint the expiry label at it.**

## F. Finding 2 — `INFORM_REQUEST_TYPE` — **RESOLVED (DR-17): adopt `MoveRequestType`** → TASK-041
**Conclusion, not a guess — two independent signals agree:** (1) no dedicated group exists (`%Inform%` returns only
`StatusInform`, a นำเรียน-status group) and the observed domain `{0,1}` ⊂ `MoveRequestType {0..5}`; (2) the hardcoded
strings are literal **truncations** of that group's labels. Dropdown breadth decided by the stakeholder: **all active
codes from the table (6)**, not just the 2 in data — the table is the single source of truth. col5 wording changes to
the full DB labels (expected, call out at capture). Original analysis kept below for the record.

### (original, now settled)
What I can confirm from code:
- a10 SQL L36 selects **`H.INFORM_REQUEST_TYPE`** (on `T_T_INFORM_MOVE`) aliased — confusingly — as `MoveRequestType`;
  that feeds **col5 ประเภทการขออนุญาต**, its dropdown (service L61) and its filter (L298).
- col6 ประเภทการขนย้าย is a **different column**, `T_T_REQUEST_MOVE.MOVE_REQUEST_TYPE` (SQL L52/L83), already resolved
  from the `MoveRequestType` group (L66).
- Our hardcoded `MOVE_REQUEST_TYPE_MAP` covers only `{0,1}` with abbreviated wording; the `MoveRequestType` group has
  **6** codes (0-5) with fuller wording. No `InformRequestType` group exists in `ConstantSPF`.
⇒ **Unresolved:** whether `INFORM_REQUEST_TYPE` shares the `MoveRequestType` domain or has its own group. Swapping blind
would either change visible wording *and* offer 6 filter options where only 2 are valid, or point at the wrong group.

**DR-17 (Porter → stakeholder) — two small queries settle it:**
```sql
-- 1) is there a dedicated group?
SELECT GROUP_CODE, CODE_STR, CODE_INT, CODE_NAME, SEQUENCE, IS_ACTIVE, DISPLAY_TYPE
FROM T_S_COMMON_CODE WHERE GROUP_CODE LIKE '%Inform%' ORDER BY GROUP_CODE, SEQUENCE;

-- 2) what values does the column actually take?
SELECT INFORM_REQUEST_TYPE, COUNT(*) FROM T_T_INFORM_MOVE GROUP BY INFORM_REQUEST_TYPE ORDER BY 1;
```
Dedicated group exists → use it. Else only `{0,1}` present → it shares `MoveRequestType`'s domain; adopt the group
(full DB wording — an FE-visible text change to call out at capture) and note the dropdown will list 6 options of which
only 2 occur; if that's unwanted, restrict the dropdown to codes present in data — **stakeholder's call, not ours**.

## Acceptance
- [ ] No hardcoded code→label dictionary left in `Services/Dashboard*.cs` (derived-status constants excepted, per E).
- [ ] Group **3** renders **"ภาคเอกชน (สมาคม บริษัทฯ)"** (was "สมาคม") in dropdown + table across all 3 dashboards (239 licenses);
      a future 4/5/6/7 license labels correctly with no code change; the 6 code-0 rows still render "ไม่ระบุ".
- [ ] Group keys come from `ConstantSPF.GroupCode`; all lookups (new **and** the 3 existing) use active + SPF + `SEQUENCE`.
- [ ] Derived statuses untouched; `dotnet build` succeeds.

## Tasks
- **TASK-039** — A + C + D (buyer group from table, GroupCode constants, correct lookup semantics incl. the 3 retrofits).
- **TASK-040** — B (paid/unpaid from `StatusPaid`) — kept separate: it is an FE-visible wording change in 2 places.
- **TASK-041** — F (`INFORM_REQUEST_TYPE`) — **BLOCKED on DR-17**.

## Questions
(Jason asks here; Sober answers as `> answer: ...`)
