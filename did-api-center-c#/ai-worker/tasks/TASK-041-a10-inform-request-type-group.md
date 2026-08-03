# TASK-041: a10 col5 `INFORM_REQUEST_TYPE` → `MoveRequestType` common-code group (delete `MOVE_REQUEST_TYPE_MAP`)

- Source: SPEC-023 F (REQ-021 finding 2) — **DR-17 answered; unblocked**
- Status: REVIEW
- Assignee: Jason (BE)
- Depends on: TASK-039 (`ConstantSPF.GroupCode` + lookup semantics)

## Resolution (DR-17 — a conclusion from two independent signals, not a guess)
1. **No dedicated group exists** — `GROUP_CODE LIKE '%Inform%'` returns only `StatusInform` (0 รอนำเรียน · 20 นำเรียนแล้ว),
   a *นำเรียน status* group, not a request-type group.
2. **Observed domain is a subset**: `T_T_INFORM_MOVE.INFORM_REQUEST_TYPE` = `0` (6 rows) · `1` (6,525 rows) ⊂ `MoveRequestType {0..5}`.
3. **The hardcoded strings are literal truncations of that group's labels**:
   `"หน่วยงานตามมาตรา 7"` ⊂ `"ขนย้ายให้หน่วยงานตามมาตรา 7"` (0); `"ขาย/ขนย้ายนอกหน่วยงาน"` ⊂ `"ขายและขนย้ายให้บุคคลอื่นนอกหน่วยงานตามมาตรา 7"` (1).
⇒ **col5 adopts `MoveRequestType`.**

## Changes — `DashboardMoveA10Service`
1. **Delete `MOVE_REQUEST_TYPE_MAP`** (L26-31).
2. **col5 label** (table) — resolve `r.MoveRequestType` (which is the `INFORM_REQUEST_TYPE` value; see the naming note)
   from the `MoveRequestType` group via `ConstantSPF.GroupCode.MOVE_REQUEST_TYPE`, reusing the same
   `CommonCodeIntMap`-style resolution col6 already uses. Keep the existing `NOT_SPECIFIED` fallback.
3. **col5 dropdown** (`TransportTypeDdl`, L61) — **list every active code of the group (6 today)**, not just the 2 that
   occur in data (stakeholder decision: the table is the single source of truth; a code with no data simply returns an
   empty result — correct, not a bug). Standard semantics: active + `DISPLAY_TYPE` SPF + `SEQUENCE` order (TASK-039 §D).
4. **col5 filter** (L298 `InList(req.TransportTypes, r.MoveRequestType?.ToString())`) — unchanged in shape; it now matches
   the same code values the DDL emits.
5. **col6 is already correct** (`MoveTypeCode` ← `T_T_REQUEST_MOVE.MOVE_REQUEST_TYPE` via the same group) — leave it.

### ⚠ Naming note — keep the comment, it is the trap that caused this
col5 and col6 now share the **same label group** but read **different columns**:
col5 = `T_T_INFORM_MOVE.INFORM_REQUEST_TYPE` (aliased `MoveRequestType` in the SQL — confusing but do not rename mid-task);
col6 = `T_T_REQUEST_MOVE.MOVE_REQUEST_TYPE` (aliased `MoveTypeCode`). Update the existing comment (L38-41) to say exactly
that, so the next reader doesn't "unify" them into one column.

## Consequence to state at capture
col5's visible wording changes from the abbreviations to the **full DB labels** — expected and intended, not a regression.

## Must NOT change
col6, the derived statuses, the a10 backbone/query/charts, other dashboards. All DID_SPF.

## Definition of Done
- [x] `MOVE_REQUEST_TYPE_MAP` → 0 references; col5 label/dropdown/filter all resolve from `MoveRequestType` via
      `ConstantSPF.GroupCode`, active + SPF + `SEQUENCE`.
- [x] col5 DDL lists all 6 active codes; col6 behaviour unchanged.
- [x] Naming comment updated. `dotnet build` succeeds. Paste diff + build result.

## Implementation Notes
(Jason — 2026-07-24)

### Changes — `DashboardMoveA10Service`
1. **`MOVE_REQUEST_TYPE_MAP` deleted** (0 refs) along with its now-orphaned helper `MoveRequestTypeName(int?)`.
2. **col5 dropdown** — `TransportTypeDdl` now gets the **same** active/SPF/SEQUENCE list as col6. Since DR-17 says both
   columns share the `MoveRequestType` group, I resolve the list **once** into `moveTypeItems` and assign it to both
   `TransportTypeDdl` and `MoveTypeDdl` — one query instead of two identical ones, and the two dropdowns can't drift.
   It lists **every active code** (6 today), not just the 2 that occur in data, per the stakeholder decision.
3. **col5 table label** — reuses the `moveTypeMap` already resolved in that method for col6:
   `TransportType = MapCodeInt(moveTypeMap, r.MoveRequestType)` — same group, still reading `r.MoveRequestType`
   (= `INFORM_REQUEST_TYPE`), i.e. a different column from col6's `r.MoveTypeCode`.
4. **col5 filter** — untouched in shape (`InList(req.TransportTypes, r.MoveRequestType?.ToString())`); it now matches the
   codes the DDL emits.
5. **col6 untouched** — its DDL, filter (`r.MoveTypeCode`) and label all behave exactly as before.
6. **Naming comment rewritten** at the top of the class: states explicitly that col5 and col6 share a *label group* but
   read *different columns* (`T_T_INFORM_MOVE.INFORM_REQUEST_TYPE` aliased `MoveRequestType` vs
   `T_T_REQUEST_MOVE.MOVE_REQUEST_TYPE` aliased `MoveTypeCode`) and must not be merged.

### ⚠️ One deviation from the task text — flagging rather than guessing
The task says *"Keep the existing `NOT_SPECIFIED` fallback"* for the col5 label, but **col5 has no `NOT_SPECIFIED`
fallback today** — the old `MoveRequestTypeName` returned `string.Empty` for an unknown code, and col6's `MapCodeInt`
also returns `string.Empty`. I used `MapCodeInt` (⇒ empty, unchanged behaviour, identical to col6). Introducing
"ไม่ระบุ" on col5 only would make two columns that now share one group behave differently for the same missing-code case.
Say the word if you want `NOT_SPECIFIED` on **both** instead — one-line each.

### Verification
- `dotnet build` (Center+SPF) → **Build succeeded, 0 Error(s)**.
- `MOVE_REQUEST_TYPE_MAP` → **0** refs; `MoveRequestTypeName` → **0** refs.
- col5's three sites: DDL L60, filter L291 (`r.MoveRequestType`), label L315 (`MapCodeInt(moveTypeMap, …)`) — all on the
  `MoveRequestType` group via `GroupCode`, active + SPF + SEQUENCE (inherited from TASK-039's lookup).
- col6's three sites: DDL L61, filter L292 (`r.MoveTypeCode`), label L316 — unchanged semantics.
- Untouched: derived statuses, a10 backbone/query/charts, other dashboards. All DID_SPF.
- **State at capture:** col5's wording changes from the truncated hardcodes to the full DB labels
  ("หน่วยงานตามมาตรา 7" → "ขนย้ายให้หน่วยงานตามมาตรา 7", "ขาย/ขนย้ายนอกหน่วยงาน" → "ขายและขนย้ายให้บุคคลอื่นนอกหน่วยงานตามมาตรา 7"),
  and the col5 dropdown grows from 2 to 6 options. Both intended. Exact strings are DB content → confirm at capture.

## Questions
(Jason asks; Sober answers as `> answer: ...`)
